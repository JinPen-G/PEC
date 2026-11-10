import { useRef, useState } from 'react';
import { Plus, Settings, Upload } from 'lucide-react';
import { useRimoModel } from '../../lib/rimo-model.js';
import { RimoRoot, RimoImage, useRimoEnvironment } from '../../lib/RimoEnvironment.jsx';
import { RimoDialog, RimoHeading } from '../../lib/RimoBusinessLayout.jsx';
import createPageState from './vehicle-groups-model.js';
import './vehicle-groups.css';

const vehicleTypes = [
  { value: 'car', label: '汽車' },
  { value: 'motorcycle', label: '摩托車' },
  { value: 'microElectric', label: '微電車' },
];

function GroupEditor({ model, onPreview }) {
  const {
    controls: { Button, Form, Input, InputNumber, Select },
    text,
    notify,
  } = useRimoEnvironment();
  const [form] = Form.useForm();
  const upload = useRef(null);
  const [brandSearch, setBrandSearch] = useState('');
  const { currentGroup: group, availableBrands, featureInput } = model.view;
  const brandNames = [
    ...new Set(
      [...availableBrands.map((brand) => brand.name), group.brand, brandSearch.trim()].filter(Boolean),
    ),
  ];
  const fieldRules = [{ required: true, whitespace: true, message: text('請填寫必填資料') }];
  const readPhotos = async (event) => {
    const files = [...event.target.files];
    event.target.value = '';
    for (const file of files) {
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        notify('warning', text('支持上傳 JPG、PNG、WebP'));
        continue;
      }
      try {
        const url = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = () => reject(reader.error);
          reader.readAsDataURL(file);
        });
        model.view.handlePhotoChange({ raw: file, name: file.name, url });
      } catch {
        notify('error', text('圖片讀取失敗，請重新選擇'));
      }
    }
  };
  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={{ ...group }}
      onValuesChange={(changes) => {
        for (const [key, value] of Object.entries(changes)) model.assign(group, key, value);
        if (Object.hasOwn(changes, 'vehicleType')) {
          model.view.handleVehicleTypeChange(changes.vehicleType);
          form.setFieldsValue({ brand: group.brand, seatCount: group.seatCount });
        }
      }}
      onFinish={(values) => {
        for (const [key, value] of Object.entries(values)) model.assign(group, key, value);
        model.view.saveGroup();
      }}
    >
      <section className="rimo-form-section">
        <h3>{text('基本資料')}</h3>
        <div className="rimo-field-grid">
          <Form.Item name="vehicleType" label={text('載具類型')} rules={fieldRules}>
            <Select
              aria-label={text('載具類型')}
              placeholder={text('請選擇載具類型')}
              options={vehicleTypes.map((item) => ({ ...item, label: text(item.label) }))}
            />
          </Form.Item>
          <Form.Item name="brand" label={text('品牌')} rules={fieldRules}>
            <Select
              aria-label={text('品牌')}
              disabled={!group.vehicleType}
              placeholder={text('選擇或輸入品牌')}
              showSearch
              optionFilterProp="label"
              onSearch={setBrandSearch}
              options={brandNames.map((name) => ({ value: name, label: name }))}
            />
          </Form.Item>
          <Form.Item name="model" label={text('型號')} rules={fieldRules}>
            <Input aria-label={text('型號')} placeholder="Model 3" />
          </Form.Item>
          <Form.Item name="year" label={text('年款')}>
            <Input aria-label={text('年款')} placeholder="2026" />
          </Form.Item>
          <Form.Item name="originType" label={text('所屬類型')}>
            <Select
              aria-label={text('所屬類型')}
              placeholder={text('請選擇')}
              options={[
                { value: 'domestic', label: text('國產') },
                { value: 'imported', label: text('進口') },
              ]}
            />
          </Form.Item>
          <Form.Item name="seatCount" label={text('座位數')}>
            <InputNumber aria-label={text('座位數')} min={1} step={1} precision={0} />
          </Form.Item>
          <Form.Item name="displacement" label={text('排量')}>
            <Input aria-label={text('排量')} placeholder="2.0L / 1250cc / 純電" />
          </Form.Item>
          <Form.Item name="fuelTankCapacity" label={text('油箱容量 (L)')}>
            <InputNumber aria-label={text('油箱容量 (L)')} min={0} step={1} />
          </Form.Item>
          <Form.Item name="trunkCapacity" label={text('行李箱容量 (L)')}>
            <InputNumber aria-label={text('行李箱容量 (L)')} min={0} step={10} />
          </Form.Item>
        </div>
      </section>
      <section className="rimo-form-section">
        <h3>{text('車型照片')}</h3>
        <div className="rimo-actions">
          <Button icon={<Upload size={15} />} onClick={() => upload.current?.click()}>
            {text('上傳圖片')}
          </Button>
          {group.photoList?.length > 0 && (
            <Button type="text" danger onClick={() => model.view.clearPhoto()}>
              {text('移除全部照片')}
            </Button>
          )}
          <input
            ref={upload}
            type="file"
            aria-label={text('上傳車型照片')}
            hidden
            multiple
            accept="image/jpeg,image/png,image/webp"
            onChange={readPhotos}
          />
        </div>
        <p className="rimo-muted">{text('支持 JPG、PNG、WebP，多張照片的首張用作列表縮略圖。')}</p>
        <div className="rimo-photo-list">
          {group.photoList?.map((photo, index) => (
            <div className="rimo-photo-row" key={`${photo.name}-${index}`}>
              <button
                className="rimo-photo-trigger"
                type="button"
                aria-label={text('預覽圖片')}
                onClick={() => onPreview(photo.url)}
              >
                <RimoImage src={photo.url} alt={photo.name} />
              </button>
              <Input aria-label={`${text('照片地址鏈接')} ${index + 1}`} value={photo.url} readOnly />
              <Button type="text" danger onClick={() => model.view.removePhotoByIndex(index)}>
                {text('刪除')}
              </Button>
            </div>
          ))}
        </div>
      </section>
      <section className="rimo-form-section">
        <Form.Item label={text('特性標籤 (逗號分隔)')}>
          <Input
            aria-label={text('特性標籤 (逗號分隔)')}
            value={featureInput}
            placeholder={text('自動擋,倒車影像,全景天窗')}
            onChange={(event) => model.write(['featureInput'], event.target.value)}
            onBlur={() => model.view.parseFeatures()}
          />
        </Form.Item>
      </section>
      <div className="rimo-actions rimo-form-footer">
        <Button onClick={() => model.write(['dialogVisible'], false)}>{text('取消')}</Button>
        <Button type="primary" htmlType="submit">
          {text('保存')}
        </Button>
      </div>
    </Form>
  );
}

function BrandManager({ model }) {
  const {
    controls: { Button, Input, Checkbox, Table, Tag },
    text,
  } = useRimoEnvironment();
  const view = model.view;
  return (
    <>
      <div className="rimo-toolbar">
        <Input
          className="rimo-toolbar-search"
          aria-label={text('新品牌名稱')}
          placeholder={text('輸入新品牌名稱')}
          value={view.newBrandInput}
          onChange={(event) => model.write(['newBrandInput'], event.target.value)}
          onPressEnter={() => view.addBrand()}
        />
        <Button
          type="primary"
          disabled={!view.newBrandInput.trim() || !view.newBrandTypes.length}
          onClick={() => view.addBrand()}
        >
          {text('添加')}
        </Button>
      </div>
      <div className="rimo-type-list rimo-brand-types">
        {vehicleTypes.map((option) => (
          <Checkbox
            key={option.value}
            checked={view.newBrandTypes.includes(option.value)}
            onChange={(event) =>
              model.write(
                ['newBrandTypes'],
                event.target.checked
                  ? [...view.newBrandTypes, option.value]
                  : view.newBrandTypes.filter((type) => type !== option.value),
              )
            }
          >
            {text(option.label)}
          </Checkbox>
        ))}
      </div>
      <Table
        tableLayout="fixed"
        rowKey="name"
        dataSource={[...view.brandOptions]}
        pagination={false}
        scroll={{ x: 480, y: 360 }}
        columns={[
          { title: text('品牌名稱'), dataIndex: 'name', width: 180 },
          {
            title: text('支持載具類型'),
            render: (_value, brand) => (
              <div className="rimo-actions">
                {brand.types.map((type) => (
                  <Tag key={type}>{text(view.getVehicleTypeLabel(type))}</Tag>
                ))}
              </div>
            ),
          },
          {
            title: text('操作'),
            key: 'actions',
            fixed: false,
            width: 80,
            render: (_value, brand) => (
              <Button
                type="text"
                danger
                onClick={() =>
                  view.removeBrand(view.brandOptions.findIndex((item) => item.name === brand.name))
                }
              >
                {text('刪除')}
              </Button>
            ),
          },
        ]}
      />
    </>
  );
}

export default function VehicleGroupsBlock() {
  const {
    controls: { Button, SearchField, Table, Tag },
    text,
    confirm,
    notify,
  } = useRimoEnvironment();
  const model = useRimoModel(createPageState);
  const view = model.view;
  const [preview, setPreview] = useState('');
  const remove = async (group) => {
    try {
      await confirm(text('確定要刪除該車型組嗎?'), text('刪除車型組'));
    } catch {
      return;
    }
    model.write(
      ['groupsData'],
      view.groupsData.filter((item) => item.id !== group.id),
    );
    notify('success', text('刪除成功'));
  };
  return (
    <RimoRoot model={model} pageKey="vehicle-groups">
      <RimoHeading
        title="車型組管理"
        description="管理車型資料、載具類型與展示照片。"
        actions={
          <>
            <Button icon={<Settings size={15} />} onClick={() => view.openBrandManager()}>
              {text('管理品牌庫')}
            </Button>
            <Button type="primary" icon={<Plus size={15} />} onClick={() => view.openDialog(null)}>
              {text('新增車型組')}
            </Button>
          </>
        }
      />
      <Table
        tableLayout="fixed"
        rowKey="id"
        dataSource={[...view.filteredGroups]}
        pagination={false}
        scroll={{ x: 850 }}
        toolbarNote={`${view.filteredGroups.length} ${text('個車型組')}`}
        toolbar={
          <SearchField
            className="rimo-toolbar-search"
            label={text('搜索品牌或型號')}
            value={view.searchQuery}
            placeholder={text('搜索品牌或型號')}
            onValueChange={(value) => model.write(['searchQuery'], value)}
          />
        }
        columns={[
          {
            title: text('車型圖片'),
            width: 100,
            render: (_value, group) => (
              <button
                type="button"
                className="rimo-photo-trigger"
                aria-label={`${text('預覽圖片')} ${group.model}`}
                onClick={() => setPreview(group.defaultPhotoUrl)}
              >
                <RimoImage src={group.defaultPhotoUrl} alt={group.model} />
              </button>
            ),
          },
          {
            title: text('品牌 / 型號'),
            width: 210,
            render: (_value, group) => (
              <>
                <span className="rimo-cell-title">
                  {group.brand} {group.model}
                </span>
                <span className="rimo-cell-meta">
                  {group.year}
                  {text('款')}
                </span>
              </>
            ),
          },
          {
            title: text('載具類型'),
            width: 110,
            render: (_value, group) => <Tag>{text(view.getVehicleTypeLabel(group.vehicleType))}</Tag>,
          },
          {
            title: text('特性標籤'),
            width: 280,
            render: (_value, group) => (
              <div className="rimo-actions">
                {group.features.map((feature) => (
                  <Tag key={feature}>{text(feature)}</Tag>
                ))}
              </div>
            ),
          },
          {
            title: text('操作'),
            key: 'actions',
            fixed: false,
            width: 150,
            render: (_value, group) => (
              <div className="rimo-actions">
                <Button type="text" onClick={() => view.openDialog(group)}>
                  {text('編輯')}
                </Button>
                <Button type="text" danger onClick={() => void remove(group)}>
                  {text('刪除')}
                </Button>
              </div>
            ),
          },
        ]}
      />
      <RimoDialog
        pageKey="vehicle-groups"
        open={view.dialogVisible}
        title={view.isEdit ? '編輯車型組' : '新增車型組'}
        width={760}
        onCancel={() => model.write(['dialogVisible'], false)}
        footer={null}
      >
        <GroupEditor key={view.currentGroup.id} model={model} onPreview={setPreview} />
      </RimoDialog>
      <RimoDialog
        pageKey="vehicle-groups"
        open={view.brandManagerVisible}
        title="管理品牌庫"
        width={680}
        onCancel={() => model.write(['brandManagerVisible'], false)}
        footer={null}
      >
        <BrandManager model={model} />
      </RimoDialog>
      <RimoDialog
        pageKey="vehicle-groups"
        open={Boolean(preview)}
        title="車型照片"
        width={820}
        onCancel={() => setPreview('')}
        footer={null}
      >
        <RimoImage src={preview} alt={text('車型照片')} className="rimo-photo-full" />
      </RimoDialog>
    </RimoRoot>
  );
}
