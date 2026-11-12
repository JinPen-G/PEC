import { ArrowRight, ArrowRightLeft, RotateCcw } from 'lucide-react';
import { useRimoModel } from '../../lib/rimo-model.js';
import { RimoRoot, useRimoEnvironment } from '../../lib/RimoEnvironment.jsx';
import { RimoDialog, RimoHeading } from '../../lib/RimoBusinessLayout.jsx';
import createPageState from './vehicle-transfer-model.js';
import './vehicle-transfer.css';

const serviceTypes = [
  { value: 'SHARING_SAME', label: '同站租還' },
  { value: 'SHARING_ONE_WAY', label: '甲租乙還' },
  { value: 'STORE_STANDARD', label: '門市租賃' },
  { value: 'STORE_24H', label: '24H門市' },
];

export default function VehicleTransferBlock() {
  const {
    controls: { Button, SearchField, Select, Table, Tag, Alert, Form },
    text,
  } = useRimoEnvironment();
  const model = useRimoModel(createPageState);
  const view = model.view;
  const stations = view.orgData.map((city) => ({
    label: text(city.label),
    options: city.children.map((station) => ({ value: station.value, label: text(station.label) })),
  }));
  const services = serviceTypes.map((option) => ({ ...option, label: text(option.label) }));
  const targets = services.filter((option) => option.value !== 'STORE_24H');
  const eligible = (vehicle) => vehicle.status === 'IDLE' && !vehicle.isTransferring;
  const close = () => {
    if (!view.isSubmitting) model.write(['transferDrawerVisible'], false);
  };
  return (
    <Form.Item noStyle><RimoRoot model={model} pageKey="vehicle-transfer">
      <RimoHeading
        title="車輛調撥管理"
        description="調整車輛所在站點與服務類型，支持單車和批量調撥。"
        actions={
          <Button
            type="primary"
            icon={<ArrowRightLeft size={15} />}
            disabled={!view.selectedVehicles.length}
            onClick={() => view.openBatchTransferDrawer()}
          >
            {text('批量調撥')} ({view.selectedVehicles.length})
          </Button>
        }
      />
      <Table
        tableLayout="fixed"
        rowKey="id"
        pagination={false}
        dataSource={view.filteredVehicles}
        scroll={{ x: 900 }}
        rowSelection={{
          selectedRowKeys: view.selectedVehicles.map((vehicle) => vehicle.id),
          onChange: (_keys, vehicles) => view.handleSelectionChange(vehicles),
          getCheckboxProps: (vehicle) => ({ disabled: !eligible(vehicle) }),
        }}
        toolbar={
          <>
            <SearchField
              className="rimo-toolbar-search"
              label={text('搜索車牌號/車型')}
              value={view.filters.keyword}
              placeholder={text('搜索車牌號/車型')}
              onValueChange={(value) => model.write(['filters', 'keyword'], value)}
            />
            <Select
              aria-label={text('當前所在站點')}
              className="rimo-station-filter"
              placeholder={text('當前所在站點')}
              options={stations}
              value={view.filters.stationId || undefined}
              allowClear
              onChange={(value) => model.write(['filters', 'stationId'], value ?? '')}
            />
            <Select
              aria-label={text('當前服務類型')}
              className="rimo-service-filter"
              placeholder={text('當前服務類型')}
              options={services}
              value={view.filters.serviceType || undefined}
              allowClear
              onChange={(value) => model.write(['filters', 'serviceType'], value ?? '')}
            />
            <Button icon={<RotateCcw size={15} />} onClick={() => view.resetFilters()}>
              {text('重置')}
            </Button>
          </>
        }
        columns={[
          {
            title: text('車輛信息'),
            width: 220,
            render: (_value, vehicle) => (
              <>
                <span className="rimo-cell-title">
                  {vehicle.licensePlate} {vehicle.isTransferring && <Tag color="gold">{text('調撥中')}</Tag>}
                </span>
                <span className="rimo-cell-meta">{vehicle.model}</span>
              </>
            ),
          },
          {
            title: text('當前站點'),
            width: 235,
            render: (_value, vehicle) => text(view.getStationName(vehicle.currentStationId)),
          },
          {
            title: text('當前服務類型'),
            width: 145,
            render: (_value, vehicle) => <Tag>{text(view.getServiceName(vehicle.currentServiceType))}</Tag>,
          },
          {
            title: text('狀態'),
            width: 115,
            render: (_value, vehicle) => (
              <Tag color={eligible(vehicle) ? 'green' : undefined}>
                {text(eligible(vehicle) ? '空閒中' : '不可調撥')}
              </Tag>
            ),
          },
          {
            title: text('操作'),
            key: 'actions',
            fixed: false,
            width: 130,
            render: (_value, vehicle) => (
              <Button
                type="text"
                disabled={!eligible(vehicle)}
                onClick={() => view.openSingleTransfer(vehicle)}
              >
                {text('快捷調度')}
              </Button>
            ),
          },
        ]}
      />
      <RimoDialog
        pageKey="vehicle-transfer"
        open={view.transferDrawerVisible}
        presentation="side"
        width={820}
        title={view.drawerTitle}
        onCancel={close}
        maskClosable={!view.isSubmitting}
        keyboard={!view.isSubmitting}
        footer={
          <>
            <span className="rimo-footer-summary">
              {view.changedVehicleCount} {text('輛車產生實際變更')}
            </span>
            <Button disabled={view.isSubmitting} onClick={close}>
              {text('取消')}
            </Button>
            <Button
              type="primary"
              loading={view.isSubmitting}
              disabled={!view.changedVehicleCount || !view.isAllValid}
              onClick={() => view.submitTransfer()}
            >
              {text('確認執行調撥')}
            </Button>
          </>
        }
      >
        {view.transferList.length > 1 && (
          <div className="rimo-bulk-fields">
            <div className="rimo-field">
              <span>{text('統一變更服務類型')}</span>
              <Select
                aria-label={text('統一變更服務類型')}
                placeholder={text('保持原樣')}
                value={view.bulkConfig.serviceType || undefined}
                options={targets}
                allowClear
                onChange={(value) => {
                  model.write(['bulkConfig', 'serviceType'], value ?? '');
                  view.onBulkServiceTypeChange();
                }}
              />
            </div>
            <div className="rimo-field">
              <span>{text('統一變更目標站點')}</span>
              <Select
                aria-label={text('統一變更目標站點')}
                placeholder={text('保持原樣')}
                value={view.bulkConfig.stationId || undefined}
                options={stations}
                allowClear
                onChange={(value) => model.write(['bulkConfig', 'stationId'], value ?? '')}
              />
            </div>
            <Button onClick={() => view.applyBulkConfig()}>{text('應用到所有車輛')}</Button>
          </div>
        )}
        <p className="rimo-muted">{text('沒有實際變更的車輛不會執行調撥。')}</p>
        <div className="rimo-transfer-list">
          {view.transferList.map((item) => (
            <section key={item.vehicle.id} className="rimo-transfer-item">
              <div className="rimo-transfer-heading">
                <h3>{item.vehicle.licensePlate}</h3>
                <span className="rimo-muted">{item.vehicle.model}</span>
                {view.hasChanges(item) && <Tag color="gold">{text('有變更')}</Tag>}
              </div>
              <div className="rimo-transfer-grid">
                <dl className="rimo-transfer-current">
                  <div>
                    <dt>{text('目前站點')}</dt>
                    <dd>{text(view.getStationName(item.vehicle.currentStationId))}</dd>
                  </div>
                  <div>
                    <dt>{text('目前服務類型')}</dt>
                    <dd>{text(view.getServiceName(item.vehicle.currentServiceType))}</dd>
                  </div>
                </dl>
                <ArrowRight className="rimo-transfer-arrow" size={18} aria-hidden="true" />
                <div className="rimo-transfer-target">
                  <div className="rimo-field">
                    <span>{text('目標類型')}</span>
                    <Select
                      aria-label={`${item.vehicle.licensePlate} ${text('目標類型')}`}
                      value={item.targetServiceType}
                      options={targets}
                      onChange={(value) => model.assign(item, 'targetServiceType', value)}
                    />
                  </div>
                  <div className="rimo-field">
                    <span>{text('目標站點')}</span>
                    <Select
                      aria-label={`${item.vehicle.licensePlate} ${text('目標站點')}`}
                      value={item.targetStationId || undefined}
                      options={stations}
                      placeholder={text('請選擇調入站點')}
                      status={!item.targetStationId ? 'error' : undefined}
                      onChange={(value) => model.assign(item, 'targetStationId', value)}
                    />
                  </div>
                </div>
              </div>
              {!item.targetStationId && <Alert type="error" message={text('必須選擇目標站點')} />}
            </section>
          ))}
        </div>
      </RimoDialog>
    </RimoRoot></Form.Item>
  );
}
