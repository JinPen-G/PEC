import dayjs from 'dayjs';
import { LockKeyhole, Plus } from 'lucide-react';
import { useRimoModel } from '../../lib/rimo-model.js';
import { RimoRoot, useRimoEnvironment } from '../../lib/RimoEnvironment.jsx';
import { RimoDialog, RimoHeading, RimoSection } from '../../lib/RimoBusinessLayout.jsx';
import createPageState from './pricing-model.js';
import './pricing.css';

function PricePair({ model, row, hourly, daily, editable, onChange }) {
  const {
    controls: { InputNumber },
    text,
  } = useRimoEnvironment();
  return editable ? (
    <div className="rimo-price-pair">
      <InputNumber
        aria-label={`${row.name} ${text('時租金')}`}
        min={0}
        value={row[hourly]}
        onChange={(value) => {
          model.assign(row, hourly, value ?? 0);
          onChange?.();
        }}
        suffix={text('元/時')}
      />
      <InputNumber
        aria-label={`${row.name} ${text('日租金')}`}
        min={0}
        value={row[daily]}
        onChange={(value) => {
          model.assign(row, daily, value ?? 0);
          onChange?.();
        }}
        suffix={text('元/天')}
      />
    </div>
  ) : (
    <span className="rimo-price-value">
      {row[hourly]} {text('元/時')} / {row[daily]} {text('元/天')}
    </span>
  );
}

function Plans({ model, sharing }) {
  const {
    controls: { Button, Table, Tag },
    text,
  } = useRimoEnvironment();
  const view = model.view;
  const plans = sharing ? view.sharingScheduledList : view.scheduledList;
  const open = () => {
    if (!sharing) return view.openScheduleDialog();
    view.openSharingScheduleDialog();
    if (!view.hasPermission('SHARING_ROUND')) model.write(['sharingScheduleForm', 'type'], 'ONE_WAY');
  };
  return (
    <RimoSection
      title="定時調價計劃"
      description="只影響生效時間後的新訂單，已預約和用車中訂單保留原計費版本。"
      actions={
        <Button icon={<Plus size={15} />} onClick={open}>
          {text('新增計劃')}
        </Button>
      }
    >
      <Table
        tableLayout="fixed"
        rowKey={(plan) => `${plan.effectiveTime}-${plan.summary}`}
        dataSource={[...plans]}
        pagination={false}
        scroll={{ x: 760 }}
        columns={[
          { title: text('生效時間'), dataIndex: 'effectiveTime', width: 190 },
          { title: text('計劃摘要'), dataIndex: 'summary' },
          ...(sharing
            ? [
                {
                  title: text('業務類型'),
                  width: 100,
                  render: (_value, plan) => text(plan.type === 'SAME_STATION' ? '同站租還' : '甲租乙還'),
                },
              ]
            : []),
          {
            title: text('狀態'),
            width: 100,
            render: (_value, plan) => (
              <Tag color={plan.status === '已執行' ? 'green' : plan.status === '待執行' ? 'blue' : undefined}>
                {text(plan.status)}
              </Tag>
            ),
          },
          {
            title: text('操作'),
            key: 'actions',
            fixed: false,
            width: 210,
            render: (_value, plan) => (
              <div className="rimo-actions">
                <Button
                  type="text"
                  onClick={() => (sharing ? view.viewSharingSchedule(plan) : view.viewSchedule(plan))}
                >
                  {text('查看詳情')}
                </Button>
                {plan.status === '待執行' && (
                  <Button
                    type="text"
                    danger
                    onClick={() =>
                      sharing
                        ? view.cancelSharingSchedule(plans.indexOf(plan))
                        : view.cancelSchedule(plans.indexOf(plan))
                    }
                  >
                    {text('取消計劃')}
                  </Button>
                )}
              </div>
            ),
          },
        ]}
      />
    </RimoSection>
  );
}

function ScheduleEditor({ model, sharing }) {
  const {
    controls: { Button, Form, Input, InputNumber, Select, DatePicker, Table },
    text,
    notify,
  } = useRimoEnvironment();
  const view = model.view;
  const field = sharing ? 'sharingScheduleForm' : 'scheduleForm';
  const draft = view[field];
  const sameStation = draft.type === 'SAME_STATION';
  const write = (key, value) => model.write([field, key], value);
  const submit = () => {
    if (!dayjs(draft.effectiveTime).isValid() || !dayjs(draft.effectiveTime).isAfter(dayjs()))
      return notify('warning', text('請選擇未來的生效時間'));
    const plans = sharing ? view.sharingScheduledList : view.scheduledList;
    if (plans.some((plan) => plan.status === '待執行' && plan.effectiveTime === draft.effectiveTime))
      return notify('warning', text('該生效時間已有待執行計劃'));
    if (sharing) view.confirmSharingSchedule();
    else view.confirmSchedule();
  };
  const typeOptions = [
    ...(view.hasPermission('SHARING_ROUND') ? [{ value: 'SAME_STATION', label: text('同站租還') }] : []),
    ...(view.hasPermission('SHARING_ONEWAY') ? [{ value: 'ONE_WAY', label: text('甲租乙還') }] : []),
  ];
  return (
    <Form layout="vertical" onFinish={submit}>
      <div className="rimo-field-grid">
        {sharing && (
          <Form.Item label={text('業務類型')} className="rimo-field-span">
            <Select
              aria-label={text('計劃業務類型')}
              value={draft.type}
              options={typeOptions}
              onChange={(value) => {
                write('type', value);
                view.resetSharingSchedulePrices();
              }}
            />
          </Form.Item>
        )}
        <Form.Item label={text('生效時間')} required>
          <DatePicker
            aria-label={text('生效時間')}
            showTime
            value={draft.effectiveTime ? dayjs(draft.effectiveTime) : null}
            disabledDate={(date) => date.isBefore(dayjs(), 'day')}
            onChange={(date) => write('effectiveTime', date?.format('YYYY-MM-DD HH:mm:ss') ?? '')}
          />
        </Form.Item>
        <Form.Item label={text('計劃摘要')} required>
          <Input
            aria-label={text('計劃摘要')}
            value={draft.summary}
            onChange={(event) => write('summary', event.target.value)}
            placeholder={text('例如：節日價格調整')}
          />
        </Form.Item>
      </div>
      <div className="rimo-section-heading">
        <h2>{text('新價格預覽')}</h2>
        <Button onClick={() => (sharing ? view.batchSetSharingNewPrice() : view.batchSetNewPrice())}>
          {text('統一上調 10%')}
        </Button>
      </div>
      <Table
        tableLayout="fixed"
        rowKey="id"
        pagination={false}
        dataSource={[...(sharing ? draft.items : draft.prices)]}
        scroll={{ x: 650 }}
        columns={[
          { title: text('車組'), dataIndex: 'name', width: 160 },
          {
            title: text('現有價格'),
            width: 180,
            render: (_value, row) =>
              sharing ? (
                <PricePair
                  model={model}
                  row={row}
                  hourly={sameStation ? 'sameStationHourly' : 'oneWayHourly'}
                  daily={sameStation ? 'sameStationDaily' : 'oneWayDaily'}
                />
              ) : (
                row.currentPrice
              ),
          },
          {
            title: text('新價格'),
            render: (_value, row) =>
              sharing ? (
                <PricePair
                  model={model}
                  row={row}
                  hourly={sameStation ? 'newSameStationHourly' : 'newOneWayHourly'}
                  daily={sameStation ? 'newSameStationDaily' : 'newOneWayDaily'}
                  editable
                />
              ) : (
                <InputNumber
                  aria-label={`${row.name} ${text('新價格')}`}
                  min={0}
                  step={10}
                  value={row.newPrice}
                  onChange={(value) => model.assign(row, 'newPrice', value ?? 0)}
                />
              ),
          },
          ...(!sharing
            ? [{ title: text('變動'), width: 80, render: (_value, row) => view.getDiffText(row) }]
            : []),
        ]}
      />
      <div className="rimo-actions rimo-pricing-footer">
        <Button
          onClick={() =>
            model.write([sharing ? 'sharingScheduleDialogVisible' : 'scheduleDialogVisible'], false)
          }
        >
          {text('取消')}
        </Button>
        <Button type="primary" htmlType="submit" disabled={!draft.effectiveTime || !draft.summary.trim()}>
          {text('確認創建')}
        </Button>
      </div>
    </Form>
  );
}

function PlanDetails({ model, sharing }) {
  const {
    controls: { Table, Tag },
    text,
  } = useRimoEnvironment();
  const plan = sharing ? model.view.currentSharingViewPlan : model.view.currentViewPlan;
  if (!plan) return null;
  const sameStation = plan.type === 'SAME_STATION';
  return (
    <>
      <div className="rimo-plan-facts">
        <strong>{plan.summary}</strong>
        <span>
          {text('生效時間')}：{plan.effectiveTime}
        </span>
        <span>
          <Tag>{text(plan.status)}</Tag>
          {sharing && <Tag>{text(sameStation ? '同站租還' : '甲租乙還')}</Tag>}
        </span>
      </div>
      <Table
        tableLayout="fixed"
        rowKey="id"
        pagination={false}
        dataSource={plan.changes}
        scroll={{ x: 560 }}
        columns={[
          { title: text('車組'), dataIndex: 'name', width: 160 },
          {
            title: text('原價'),
            render: (_value, row) =>
              sharing ? (
                <PricePair
                  model={model}
                  row={row}
                  hourly={sameStation ? 'sameStationHourly' : 'oneWayHourly'}
                  daily={sameStation ? 'sameStationDaily' : 'oneWayDaily'}
                />
              ) : (
                row.currentPrice
              ),
          },
          {
            title: text('新價'),
            render: (_value, row) =>
              sharing ? (
                <PricePair
                  model={model}
                  row={row}
                  hourly={sameStation ? 'newSameStationHourly' : 'newOneWayHourly'}
                  daily={sameStation ? 'newSameStationDaily' : 'newOneWayDaily'}
                />
              ) : (
                row.newPrice
              ),
          },
          ...(!sharing
            ? [{ title: text('變動'), width: 90, render: (_value, row) => model.view.getDiffText(row) }]
            : []),
        ]}
      />
    </>
  );
}

function PriceVersion({ model }) {
  const {
    controls: { Select, Table },
    text,
  } = useRimoEnvironment();
  const view = model.view;
  const version = view.selectedPriceVersion;
  if (!version) return null;
  return (
    <>
      <Select
        aria-label={text('歷史版本')}
        className="rimo-version-select"
        value={version.version}
        options={view.storePriceVersions.map((item) => ({
          value: item.version,
          label: `${item.version} · ${item.title}`,
        }))}
        onChange={(value) =>
          view.openPriceVersion(view.storePriceVersions.find((item) => item.version === value))
        }
      />
      <div className="rimo-plan-facts">
        <strong>{version.title}</strong>
        <span>
          {text('來源')}：{text(version.source)} · {version.savedBy}
        </span>
        <span>
          {text('保存時間')}：{version.savedAt}
        </span>
      </div>
      <Table
        tableLayout="fixed"
        rowKey="group"
        dataSource={version.values}
        pagination={false}
        scroll={{ x: 820 }}
        columns={[
          { title: text('車組'), dataIndex: 'group', width: 140 },
          { title: text('車型'), dataIndex: 'models', width: 220 },
          { title: text('標準日租金'), dataIndex: 'dailyPrice', width: 110 },
          { title: text('里程規則'), dataIndex: 'mileage', width: 230 },
          { title: text('上次更新'), dataIndex: 'lastUpdated', width: 120 },
        ]}
      />
    </>
  );
}

export default function PricingBlock() {
  const {
    controls: { Button, InputNumber, Select, Table, Tabs, Tag },
    text,
  } = useRimoEnvironment();
  const model = useRimoModel(createPageState);
  const view = model.view;
  const storePrice = (
    <>
      <RimoSection
        title="門市標準價"
        actions={
          view.isLocked ? (
            <Button icon={<LockKeyhole size={15} />} onClick={() => view.unlockPricing()}>
              {text('解鎖編輯')}
            </Button>
          ) : (
            <>
              <Button onClick={() => view.cancelEdit()}>{text('取消')}</Button>
              <Button type="primary" onClick={() => view.savePricing()}>
                {text('保存')}
              </Button>
            </>
          )
        }
      >
        <div className="rimo-price-toolbar">
          <div className="rimo-actions">
            <Tag>{text(view.isLocked ? '已鎖定' : '編輯中')}</Tag>
            <Button type="text" onClick={() => view.openPriceVersion(view.storePriceVersions[0])}>
              {view.storePriceVersions[0].version}
            </Button>
          </div>
          <Button type="text" onClick={() => view.openPriceVersion()}>
            {text('歷史版本')}
          </Button>
        </div>
        {!view.isLocked && (
          <div className="rimo-price-batch">
            <span>{text('批量調整')}</span>
            <InputNumber
              aria-label={text('門市調價百分比')}
              min={-100}
              value={view.batchAdjustment}
              suffix="%"
              onChange={(value) => model.write(['batchAdjustment'], value ?? 0)}
            />
            <Button onClick={() => view.applyBatchAdjustment()}>{text('應用')}</Button>
          </div>
        )}
        <Table
          tableLayout="fixed"
          rowKey="id"
          pagination={false}
          dataSource={[...view.vehicleGroups]}
          scroll={{ x: 780 }}
          columns={[
            {
              title: text('車組名稱'),
              width: 250,
              render: (_value, row) => (
                <>
                  <span className="rimo-cell-title">{text(row.name)}</span>
                  <span className="rimo-cell-meta">{row.models}</span>
                </>
              ),
            },
            {
              title: text('價格版本'),
              width: 225,
              render: () => (
                <Button type="text" onClick={() => view.openPriceVersion(view.storePriceVersions[0])}>
                  {view.storePriceVersions[0].version}
                </Button>
              ),
            },
            {
              title: text('標準日租金 (元/天)'),
              width: 180,
              render: (_value, row) =>
                view.isLocked ? (
                  <span className="rimo-price-value">{row.dailyPrice}</span>
                ) : (
                  <InputNumber
                    aria-label={`${row.name} ${text('標準日租金')}`}
                    min={0}
                    step={10}
                    value={row.dailyPrice}
                    onChange={(value) => {
                      model.assign(row, 'dailyPrice', value ?? 0);
                      view.handlePriceChange(row);
                    }}
                  />
                ),
            },
            { title: text('上次更新'), dataIndex: 'lastUpdated', width: 120 },
          ]}
        />
      </RimoSection>
      <div className="rimo-price-notice">
        <p>{text('新訂單保存當時的計費版本；既有訂單不受後續調價影響。')}</p>
        <p>{text('手動保存或計劃執行後保留版本，訂單詳情可追溯當時價格。')}</p>
      </div>
      <Plans model={model} />
    </>
  );
  const sharingPrice = (
    <>
      <RimoSection
        title="分時標準價"
        actions={
          view.isSharingLocked ? (
            <Button icon={<LockKeyhole size={15} />} onClick={() => model.write(['isSharingLocked'], false)}>
              {text('解鎖編輯')}
            </Button>
          ) : (
            <>
              <Button onClick={() => view.cancelSharingEdit()}>{text('取消')}</Button>
              <Button type="primary" onClick={() => view.saveChanges()}>
                {text('保存')}
              </Button>
            </>
          )
        }
      >
        <div className="rimo-price-toolbar">
          <Tag>{text(view.isSharingLocked ? '已鎖定' : '編輯中')}</Tag>
          {!view.isSharingLocked && (
            <div className="rimo-price-batch">
              <span>{text('批量調整')}</span>
              <InputNumber
                aria-label={text('分時調價百分比')}
                min={0}
                value={view.sharingBatchMsg}
                suffix="%"
                onChange={(value) => model.write(['sharingBatchMsg'], value ?? 0)}
              />
              <Button onClick={() => view.applySharingBatch()}>{text('應用')}</Button>
            </div>
          )}
        </div>
        <Table
          tableLayout="fixed"
          rowKey="id"
          pagination={false}
          dataSource={[...view.sharingGroups]}
          scroll={{ x: 1100 }}
          columns={[
            {
              title: text('車組信息'),
              width: 240,
              render: (_value, row) => (
                <>
                  <span className="rimo-cell-title">{text(row.name)}</span>
                  <span className="rimo-cell-meta">{row.models}</span>
                </>
              ),
            },
            ...(view.hasPermission('SHARING_ROUND')
              ? [
                  {
                    title: text('同站租還'),
                    width: 300,
                    render: (_value, row) => (
                      <PricePair
                        model={model}
                        row={row}
                        hourly="sameStationHourly"
                        daily="sameStationDaily"
                        editable={!view.isSharingLocked}
                        onChange={() => view.markSharingModified()}
                      />
                    ),
                  },
                  { title: text('同站上次更新'), dataIndex: 'lastUpdatedSameStation', width: 130 },
                ]
              : []),
            ...(view.hasPermission('SHARING_ONEWAY')
              ? [
                  {
                    title: text('甲租乙還'),
                    width: 300,
                    render: (_value, row) => (
                      <PricePair
                        model={model}
                        row={row}
                        hourly="oneWayHourly"
                        daily="oneWayDaily"
                        editable={!view.isSharingLocked}
                        onChange={() => view.markSharingModified()}
                      />
                    ),
                  },
                  { title: text('甲乙上次更新'), dataIndex: 'lastUpdatedOneWay', width: 130 },
                ]
              : []),
          ]}
        />
      </RimoSection>
      <Plans model={model} sharing />
    </>
  );
  return (
    <RimoRoot model={model} pageKey="pricing">
      <RimoHeading title="動態調價策略" description="管理門市與分時標準租金、定時調價和價格版本。" />
      <div className="rimo-price-permissions">
        <span>{text('權限演示')}</span>
        <Select
          aria-label={text('權限演示')}
          value={view.permissionDemoMode}
          options={view.permissionDemoOptions.map((item) => ({ ...item, label: text(item.label) }))}
          onChange={(value) => view.switchTenant(value)}
        />
      </div>
      <Tabs
        activeKey={view.activeTab}
        onChange={(value) => model.write(['activeTab'], value)}
        items={[
          ...(view.hasStoreBusinessPermission
            ? [{ key: 'STORE', label: text('門市租賃'), children: storePrice }]
            : []),
          ...(view.hasSharingBusinessPermission
            ? [{ key: 'SHARING', label: text('分時租賃'), children: sharingPrice }]
            : []),
        ]}
      />
      <RimoDialog
        pageKey="pricing"
        open={view.scheduleDialogVisible}
        title="新增門市調價計劃"
        width={800}
        footer={null}
        onCancel={() => model.write(['scheduleDialogVisible'], false)}
      >
        <ScheduleEditor model={model} />
      </RimoDialog>
      <RimoDialog
        pageKey="pricing"
        open={view.sharingScheduleDialogVisible}
        title="新增分時調價計劃"
        width={880}
        footer={null}
        onCancel={() => model.write(['sharingScheduleDialogVisible'], false)}
      >
        <ScheduleEditor model={model} sharing />
      </RimoDialog>
      <RimoDialog
        pageKey="pricing"
        open={view.viewDialogVisible}
        title="門市調價計劃詳情"
        width={760}
        footer={null}
        onCancel={() => model.write(['viewDialogVisible'], false)}
      >
        <PlanDetails model={model} />
      </RimoDialog>
      <RimoDialog
        pageKey="pricing"
        open={view.sharingViewDialogVisible}
        title="分時調價計劃詳情"
        width={800}
        footer={null}
        onCancel={() => model.write(['sharingViewDialogVisible'], false)}
      >
        <PlanDetails model={model} sharing />
      </RimoDialog>
      <RimoDialog
        pageKey="pricing"
        open={view.priceVersionDialogVisible}
        title="歷史價格版本"
        width={960}
        footer={null}
        onCancel={() => model.write(['priceVersionDialogVisible'], false)}
      >
        <PriceVersion model={model} />
      </RimoDialog>
    </RimoRoot>
  );
}
