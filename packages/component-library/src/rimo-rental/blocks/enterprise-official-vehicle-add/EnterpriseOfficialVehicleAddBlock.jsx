import { Fragment } from 'react';
import { useRimoModel, rimoEntries } from '../../lib/rimo-model.js';
import { RimoRoot, RimoIcon, useRimoEnvironment } from '../../lib/RimoEnvironment.jsx';
import { RimoElement, rimoText } from '../../lib/RimoElements.jsx';
import './enterprise-official-vehicle-add.css';
function createPageState(model) {
  const _document = model.document;
  const window = model.window;
  const _localStorage = model.storage;
  const _sessionStorage = model.storage;
  const _themeColor = () => model.theme();
  const _themeColorLight = level => model.theme(level);
  const _themeRGBA = alpha => model.themeAlpha(alpha);
  const feedback = {
    ElMessage: Object.assign(message => model.notify('info', message), {
      success: message => model.notify('success', message),
      warning: message => model.notify('warning', message),
      error: message => model.notify('error', message),
      info: message => model.notify('info', message)
    }),
    ElMessageBox: {
      confirm: (message, title) => model.confirm(message, title),
      alert: (message, title) => model.confirm(message, title)
    }
  };
  function pageSetup() {
    const {
      record: reactive,
      cell: ref,
      derived: computed
    } = model;
    const {
      ElMessage: _ElMessage
    } = feedback;
    const brandOptions = [{
      label: 'Toyota',
      value: 'toyota'
    }, {
      label: 'Lexus',
      value: 'lexus'
    }, {
      label: 'Mercedes-Benz',
      value: 'benz'
    }, {
      label: 'Skoda',
      value: 'skoda'
    }];
    const modelOptions = [{
      label: 'Toyota Corolla Cross',
      value: 'corolla_cross',
      brandId: 'toyota',
      type: 'suv'
    }, {
      label: 'Toyota Camry',
      value: 'camry',
      brandId: 'toyota',
      type: 'sedan'
    }, {
      label: 'Lexus ES 250',
      value: 'es250',
      brandId: 'lexus',
      type: 'sedan'
    }, {
      label: 'Mercedes-Benz E300',
      value: 'e300',
      brandId: 'benz',
      type: 'sedan'
    }, {
      label: 'Skoda Superb',
      value: 'superb',
      brandId: 'skoda',
      type: 'sedan'
    }];
    const branchOptions = [{
      label: '臺北分公司',
      value: 'taipei'
    }, {
      label: '臺中分公司',
      value: 'taichung'
    }, {
      label: '高雄分公司',
      value: 'kaohsiung'
    }, {
      label: '新竹分公司',
      value: 'hsinchu'
    }];
    const maintenanceTemplateOptions = [{
      label: '企業通用｜新車',
      value: 'MT-001',
      scopeType: 'enterprise',
      branch: ''
    }, {
      label: '臺北分公司｜老車',
      value: 'MT-002',
      scopeType: 'branch',
      branch: 'taipei'
    }, {
      label: '高雄分公司｜常用接待車',
      value: 'MT-003',
      scopeType: 'branch',
      branch: 'kaohsiung'
    }];
    const cleaningTemplateOptions = [{
      label: '企業通用｜日常清潔',
      value: 'CT-001',
      scopeType: 'enterprise',
      branch: ''
    }, {
      label: '高雄分公司｜高頻用車',
      value: 'CT-002',
      scopeType: 'branch',
      branch: 'kaohsiung'
    }, {
      label: '臺北分公司｜主管車',
      value: 'CT-003',
      scopeType: 'branch',
      branch: 'taipei'
    }];
    const siteOptions = [{
      label: '臺北總部分地下停車場',
      value: 'tpe_hq_b1'
    }, {
      label: '臺中分公司停車場',
      value: 'txg_branch_lot'
    }, {
      label: '高雄分公司大樓停車場',
      value: 'khh_tower_lot'
    }, {
      label: '新竹園區訪客停車場',
      value: 'hsz_park_lot'
    }];
    const vehicleTypeOptions = [{
      label: '轎車',
      value: 'sedan'
    }, {
      label: 'SUV',
      value: 'suv'
    }, {
      label: '商務車',
      value: 'mpv'
    }, {
      label: '微電車',
      value: 'micro_ev'
    }];
    const sourceOptions = [{
      label: '自購（自有資產）',
      value: 'SELF_OWNED'
    }, {
      label: '和運租車',
      value: 'HESUAN'
    }, {
      label: '格上租車',
      value: 'GESHANG'
    }, {
      label: '其他合作車源',
      value: 'OTHER'
    }];
    const tagOptions = [{
      label: '新車',
      value: 'new'
    }, {
      label: '接待專用',
      value: 'vip'
    }, {
      label: '長途優先',
      value: 'long_trip'
    }, {
      label: '低里程',
      value: 'low_mileage'
    }];
    const deviceOptions = [{
      label: 'TBOX-001',
      value: 'tbox-001'
    }, {
      label: 'TBOX-002',
      value: 'tbox-002'
    }, {
      label: '未綁定',
      value: 'none'
    }];
    const colorOptions = ['白色', '黑色', '銀色', '灰色', '深藍色'];
    const photoMocks = ref([{
      key: 'front',
      title: '車輛照片',
      caption: '右前 45°'
    }, {
      key: 'rear',
      title: '車輛照片',
      caption: '車尾'
    }]);
    const form = reactive({
      assetBranch: 'taipei',
      siteId: 'tpe_hq_b1',
      plateNo: 'BXR-8899',
      brandId: 'lexus',
      modelId: 'es250',
      modelYear: '2024',
      vehicleType: 'sedan',
      domesticFlag: 'imported',
      seats: 5,
      displacement: '2487',
      tankCapacity: '60',
      trunkCapacity: '454',
      nickname: '臺北接待車-01',
      doorCount: 4,
      gearboxType: 'auto',
      color: '黑色',
      releaseDate: '2024/01/18',
      listingMileage: '18200',
      vin: '',
      engineNo: '',
      ownerName: 'RIMO Rental',
      fuelType: 'gasoline',
      sourceType: 'SELF_OWNED',
      enableStatus: 'active',
      tagIds: ['vip'],
      maintenanceTemplateId: 'MT-001',
      cleaningTemplateId: 'CT-001',
      lastMaintenanceMileage: '15000',
      lastMaintenanceDate: '2026/05/12',
      lastCleaningDate: '2026/06/10',
      specialVehicle: false,
      deviceCode: 'tbox-001',
      etcCardNo: '',
      iButtonCode: '',
      policyNo: '',
      insuranceDate: '',
      insuranceExpireDate: '',
      insuranceType: '',
      coverageAmount: '',
      claimAmount: ''
    });
    const filteredModelOptions = computed(() => {
      if (!form.brandId) return modelOptions;
      return modelOptions.filter(item => item.brandId === form.brandId);
    });
    const availableMaintenanceTemplates = computed(() => {
      return maintenanceTemplateOptions.filter(item => item.scopeType === 'enterprise' || item.branch === form.assetBranch);
    });
    const availableCleaningTemplates = computed(() => {
      return cleaningTemplateOptions.filter(item => item.scopeType === 'enterprise' || item.branch === form.assetBranch);
    });
    const ensureTemplateScope = () => {
      if (form.maintenanceTemplateId && !availableMaintenanceTemplates.value.some(item => item.value === form.maintenanceTemplateId)) {
        form.maintenanceTemplateId = '';
      }
      if (form.cleaningTemplateId && !availableCleaningTemplates.value.some(item => item.value === form.cleaningTemplateId)) {
        form.cleaningTemplateId = '';
      }
    };
    const appendPhotoMock = () => {
      photoMocks.value.push({
        key: `photo-${photoMocks.value.length + 1}`,
        title: '車輛照片',
        caption: `補充圖 ${photoMocks.value.length + 1}`
      });
    };
    const handleBrandChange = () => {
      if (!filteredModelOptions.value.some(item => item.value === form.modelId)) {
        form.modelId = '';
      }
    };
    const handleModelChange = value => {
      const matched = modelOptions.find(item => item.value === value);
      if (matched?.type) {
        form.vehicleType = matched.type;
      }
    };
    const syncVehicleSeed = () => {
      form.brandId = 'toyota';
      form.modelId = 'camry';
      form.modelYear = '2025';
      form.vehicleType = 'sedan';
      form.domesticFlag = 'imported';
      form.seats = 5;
      form.displacement = '2487';
      form.tankCapacity = '60';
      form.trunkCapacity = '524';
      form.nickname = '臺北公務車-待建';
      form.doorCount = 4;
      form.gearboxType = 'auto';
      form.color = '銀色';
      form.releaseDate = '2025/02/01';
      form.listingMileage = '0';
      feedback.ElMessage.success('已同步帶入車款基礎資料');
    };
    const goBack = () => {
      window.location.href = 'official_vehicles.html';
    };
    const submitVehicle = () => {
      const requiredFields = [['資產歸屬分公司', form.assetBranch], ['所在據點', form.siteId], ['車牌號碼', form.plateNo], ['廠牌', form.brandId], ['車款', form.modelId], ['車款年份', form.modelYear], ['車輛類型', form.vehicleType], ['座位數', form.seats], ['排氣量', form.displacement], ['油箱容量', form.tankCapacity], ['車輛名稱（暱稱）', form.nickname], ['車門數量', form.doorCount], ['變速箱類型', form.gearboxType], ['車身顏色', form.color], ['上架里程', form.listingMileage], ['啓用狀態', form.enableStatus]];
      const missing = requiredFields.filter(([, value]) => value === null || value === undefined || String(value).trim() === '').map(([label]) => label);
      if (!photoMocks.value.length) {
        missing.push('車輛照片');
      }
      if (missing.length) {
        feedback.ElMessage.warning(`請先完成：${missing.join('、')}`);
        return;
      }
      feedback.ElMessage.success('公務車輛已保存');
    };
    return {
      branchOptions,
      siteOptions,
      maintenanceTemplateOptions,
      cleaningTemplateOptions,
      availableMaintenanceTemplates,
      availableCleaningTemplates,
      brandOptions,
      filteredModelOptions,
      vehicleTypeOptions,
      sourceOptions,
      tagOptions,
      deviceOptions,
      colorOptions,
      form,
      photoMocks,
      appendPhotoMock,
      handleBrandChange,
      handleModelChange,
      ensureTemplateScope,
      syncVehicleSeed,
      submitVehicle,
      goBack,
      ElMessage: feedback.ElMessage,
      modelOptions
    };
  }
  return pageSetup();
}
export default function EnterpriseOfficialVehicleAddBlock() {
  const model = useRimoModel(createPageState);
  const view = model.view;
  const {
    text
  } = useRimoEnvironment();
  return <RimoRoot model={model} pageKey="enterprise-official-vehicle-add" assets={{}}><div data-business-content="" data-rimo-layout="page"><div className="vehicle-add-page" data-rimo-layout="filters"><div className="vehicle-add-back-row"><RimoElement kind="el-button" plain={true} onClick={event => {
            view.goBack?.(event);
          }}><RimoElement kind="el-icon" className="mr-1"><RimoIcon name="ArrowLeft" /></RimoElement>
{text("\n                            返回\n                        ")}</RimoElement></div>
<section className="vehicle-section"><div className="vehicle-section__header"><RimoElement kind="el-icon"><RimoIcon name="Van" /></RimoElement>
{text("\n                            基本資料\n                        ")}</div>
<div className="vehicle-section__body"><div className="vehicle-grid"><div className="vehicle-field"><div className="field-label"><span className="field-required">{text("*")}</span>
<strong>{text("資產歸屬分公司")}</strong></div>
<RimoElement kind="el-select" modelValue={view.form.assetBranch} onModelChange={value => {
                  model.write(["form", "assetBranch"], value);
                }} placeholder="請選擇資產歸屬分公司" onChange={event => {
                  view.ensureTemplateScope?.(event);
                }}>{rimoEntries(view.branchOptions).map(([item], _itemIndex) => <Fragment key={item.value}><RimoElement kind="el-option" key={item.value} label={item.label} value={item.value}></RimoElement></Fragment>)}</RimoElement></div>
<div className="vehicle-field"><div className="field-label"><span className="field-required">{text("*")}</span>
<strong>{text("所在據點")}</strong></div>
<RimoElement kind="el-select" modelValue={view.form.siteId} onModelChange={value => {
                  model.write(["form", "siteId"], value);
                }} placeholder="請選擇所在據點">{rimoEntries(view.siteOptions).map(([item], _itemIndex) => <Fragment key={item.value}><RimoElement kind="el-option" key={item.value} label={item.label} value={item.value}></RimoElement></Fragment>)}</RimoElement></div>
<div className="vehicle-field"><div className="field-label"><span className="field-required">{text("*")}</span>
<strong>{text("車牌號碼")}</strong></div>
<div className="inline-action-row"><div className="vehicle-field"><RimoElement kind="el-input" modelValue={view.form.plateNo} onModelChange={value => {
                      model.write(["form", "plateNo"], value);
                    }} placeholder="請輸入車牌號碼"></RimoElement></div>
<RimoElement kind="el-button" className="plate-sync-button" type="primary" plain={true} onClick={event => {
                    view.syncVehicleSeed?.(event);
                  }}>{text("同步帶入")}</RimoElement></div></div>
<div className="vehicle-field"><div className="field-label"><span className="field-required">{text("*")}</span>
<strong>{text("車款")}</strong></div>
<RimoElement kind="el-select" modelValue={view.form.modelId} onModelChange={value => {
                  model.write(["form", "modelId"], value);
                }} placeholder="請選擇車款" onChange={event => {
                  view.handleModelChange?.(event);
                }}>{rimoEntries(view.filteredModelOptions).map(([item], _itemIndex) => <Fragment key={item.value}><RimoElement kind="el-option" key={item.value} label={item.label} value={item.value}></RimoElement></Fragment>)}</RimoElement></div>
<div className="vehicle-field"><div className="field-label"><span className="field-required">{text("*")}</span>
<strong>{text("廠牌")}</strong></div>
<RimoElement kind="el-select" modelValue={view.form.brandId} onModelChange={value => {
                  model.write(["form", "brandId"], value);
                }} placeholder="請選擇廠牌" onChange={event => {
                  view.handleBrandChange?.(event);
                }}>{rimoEntries(view.brandOptions).map(([item], _itemIndex) => <Fragment key={item.value}><RimoElement kind="el-option" key={item.value} label={item.label} value={item.value}></RimoElement></Fragment>)}</RimoElement></div>
<div className="vehicle-field"><div className="field-label"><span className="field-required">{text("*")}</span>
<strong>{text("車輛類型")}</strong></div>
<RimoElement kind="el-select" modelValue={view.form.vehicleType} onModelChange={value => {
                  model.write(["form", "vehicleType"], value);
                }} placeholder="請選擇車輛類型">{rimoEntries(view.vehicleTypeOptions).map(([item], _itemIndex) => <Fragment key={item.value}><RimoElement kind="el-option" key={item.value} label={item.label} value={item.value}></RimoElement></Fragment>)}</RimoElement></div>
<div className="vehicle-field"><div className="field-label"><span className="field-required">{text("*")}</span>
<strong>{text("車款年份")}</strong></div>
<RimoElement kind="el-date-picker" modelValue={view.form.modelYear} onModelChange={value => {
                  model.write(["form", "modelYear"], value);
                }} type="year" placeholder="請選擇年份" format="YYYY" valueFormat="YYYY"></RimoElement></div>
<div className="vehicle-field"><div className="field-label"><strong>{text("是否國產")}</strong></div>
<RimoElement kind="el-select" modelValue={view.form.domesticFlag} onModelChange={value => {
                  model.write(["form", "domesticFlag"], value);
                }} placeholder="請選擇"><RimoElement kind="el-option" label="國產" value="domestic"></RimoElement>
<RimoElement kind="el-option" label="進口" value="imported"></RimoElement></RimoElement></div>
<div className="vehicle-field"><div className="field-label"><span className="field-required">{text("*")}</span>
<strong>{text("座位數")}</strong></div>
<RimoElement kind="el-input-number" modelValue={view.form.seats} onModelChange={value => {
                  model.write(["form", "seats"], value);
                }} min={1} max={20}></RimoElement></div>
<div className="vehicle-field"><div className="field-label"><span className="field-required">{text("*")}</span>
<strong>{text("排氣量 (cc)")}</strong></div>
<RimoElement kind="el-input" modelValue={view.form.displacement} onModelChange={value => {
                  model.write(["form", "displacement"], value);
                }} placeholder="請輸入排氣量"></RimoElement></div>
<div className="vehicle-field"><div className="field-label"><span className="field-required">{text("*")}</span>
<strong>{text("油箱容量 (L)")}</strong></div>
<RimoElement kind="el-input" modelValue={view.form.tankCapacity} onModelChange={value => {
                  model.write(["form", "tankCapacity"], value);
                }} placeholder="請輸入油箱容量"></RimoElement></div>
<div className="vehicle-field"><div className="field-label"><strong>{text("行李箱容量 (L)")}</strong></div>
<RimoElement kind="el-input" modelValue={view.form.trunkCapacity} onModelChange={value => {
                  model.write(["form", "trunkCapacity"], value);
                }} placeholder="請輸入行李箱容量"></RimoElement></div>
<div className="vehicle-field"><div className="field-label"><span className="field-required">{text("*")}</span>
<strong>{text("車輛名稱（暱稱）")}</strong></div>
<RimoElement kind="el-input" modelValue={view.form.nickname} onModelChange={value => {
                  model.write(["form", "nickname"], value);
                }} placeholder="請輸入車輛名稱或內部識別名稱"></RimoElement></div>
<div className="vehicle-field"><div className="field-label"><span className="field-required">{text("*")}</span>
<strong>{text("車門數量")}</strong></div>
<RimoElement kind="el-input-number" modelValue={view.form.doorCount} onModelChange={value => {
                  model.write(["form", "doorCount"], value);
                }} min={1} max={8}></RimoElement></div>
<div className="vehicle-field"><div className="field-label"><span className="field-required">{text("*")}</span>
<strong>{text("變速箱類型")}</strong></div>
<RimoElement kind="el-select" modelValue={view.form.gearboxType} onModelChange={value => {
                  model.write(["form", "gearboxType"], value);
                }} placeholder="請選擇變速箱類型"><RimoElement kind="el-option" label="自排" value="auto"></RimoElement>
<RimoElement kind="el-option" label="手排" value="manual"></RimoElement>
<RimoElement kind="el-option" label="CVT" value="cvt"></RimoElement></RimoElement></div>
<div className="vehicle-field"><div className="field-label"><span className="field-required">{text("*")}</span>
<strong>{text("車身顏色")}</strong></div>
<RimoElement kind="el-select" modelValue={view.form.color} onModelChange={value => {
                  model.write(["form", "color"], value);
                }} placeholder="請選擇車身顏色">{rimoEntries(view.colorOptions).map(([item], _itemIndex) => <Fragment key={item}><RimoElement kind="el-option" key={item} label={item} value={item}></RimoElement></Fragment>)}</RimoElement></div>
<div className="vehicle-field"><div className="field-label"><strong>{text("出廠日期")}</strong></div>
<RimoElement kind="el-date-picker" modelValue={view.form.releaseDate} onModelChange={value => {
                  model.write(["form", "releaseDate"], value);
                }} type="date" placeholder="請選擇日期" format="YYYY/MM/DD" valueFormat="YYYY/MM/DD"></RimoElement></div>
<div className="vehicle-field"><div className="field-label"><span className="field-required">{text("*")}</span>
<strong>{text("上架里程")}</strong></div>
<RimoElement kind="el-input" modelValue={view.form.listingMileage} onModelChange={value => {
                  model.write(["form", "listingMileage"], value);
                }} placeholder="請輸入上架里程" slots={{
                  "append": _slot => <>{text("km")}</>
                }}></RimoElement></div>
<div className="vehicle-field"><div className="field-label"><strong>{text("VIN")}</strong></div>
<RimoElement kind="el-input" modelValue={view.form.vin} onModelChange={value => {
                  model.write(["form", "vin"], value);
                }} placeholder="請輸入 VIN"></RimoElement></div>
<div className="vehicle-field"><div className="field-label"><strong>{text("引擎編號")}</strong></div>
<RimoElement kind="el-input" modelValue={view.form.engineNo} onModelChange={value => {
                  model.write(["form", "engineNo"], value);
                }} placeholder="請輸入引擎編號"></RimoElement></div>
<div className="vehicle-field"><div className="field-label"><strong>{text("車主（車輛所有人）")}</strong></div>
<RimoElement kind="el-input" modelValue={view.form.ownerName} onModelChange={value => {
                  model.write(["form", "ownerName"], value);
                }} placeholder="請輸入車輛所有人"></RimoElement></div>
<div className="vehicle-field"><div className="field-label"><strong>{text("燃料類型")}</strong></div>
<RimoElement kind="el-select" modelValue={view.form.fuelType} onModelChange={value => {
                  model.write(["form", "fuelType"], value);
                }} placeholder="請選擇燃料類型"><RimoElement kind="el-option" label="汽油" value="gasoline"></RimoElement>
<RimoElement kind="el-option" label="柴油" value="diesel"></RimoElement>
<RimoElement kind="el-option" label="油電" value="hybrid"></RimoElement>
<RimoElement kind="el-option" label="純電" value="ev"></RimoElement></RimoElement></div>
<div className="vehicle-field"><div className="field-label"><strong>{text("車輛來源")}</strong></div>
<RimoElement kind="el-select" modelValue={view.form.sourceType} onModelChange={value => {
                  model.write(["form", "sourceType"], value);
                }} placeholder="請選擇車輛來源">{rimoEntries(view.sourceOptions).map(([item], _itemIndex) => <Fragment key={item.value}><RimoElement kind="el-option" key={item.value} label={item.label} value={item.value}></RimoElement></Fragment>)}</RimoElement></div>
<div className="vehicle-field"><div className="field-label"><span className="field-required">{text("*")}</span>
<strong>{text("啓用狀態")}</strong></div>
<div className="status-radio-group"><RimoElement kind="el-radio-group" modelValue={view.form.enableStatus} onModelChange={value => {
                    model.write(["form", "enableStatus"], value);
                  }}><RimoElement kind="el-radio" label="inactive">{text("未啓用")}</RimoElement>
<RimoElement kind="el-radio" label="active">{text("啓用")}</RimoElement>
<RimoElement kind="el-radio" label="archived">{text("封存")}</RimoElement></RimoElement></div></div>
<div className="vehicle-field span-2"><div className="field-label"><span className="field-required">{text("*")}</span>
<strong>{text("車輛照片")}</strong></div>
<div className="photo-block"><div className="photo-upload-box" onClick={event => {
                    view.appendPhotoMock?.(event);
                  }}><RimoElement kind="el-icon"><RimoIcon name="PictureFilled" /></RimoElement>
<div>{text("點擊補充車輛照片")}</div>
<div className="text-[11px] text-slate-400">{text("用於列表預覽與車輛詳情")}</div></div>
<div className="photo-list">{rimoEntries(view.photoMocks).map(([photo, index], _itemIndex) => <Fragment key={photo.key}><div key={photo.key} className="photo-item"><div className="photo-item__preview">{rimoText(photo.title)}</div>
<div className="photo-item__meta"><div className="font-semibold text-gray-700">{rimoText(photo.caption)}</div>
<div className="text-gray-400 mt-1">{text("第 ")}{rimoText(index + 1)}{text(" 張")}</div></div></div></Fragment>)}</div></div></div></div></div></section>
<section className="vehicle-section"><div className="vehicle-section__header"><RimoElement kind="el-icon"><RimoIcon name="CollectionTag" /></RimoElement>
{text("\n                            車輛標籤\n                        ")}</div>
<div className="vehicle-section__body"><div className="vehicle-grid"><div className="vehicle-field span-2"><div className="field-label"><strong>{text("車輛標籤")}</strong>
<span className="tag-manage-link">{text("標籤管理")}</span></div>
<RimoElement kind="el-select" modelValue={view.form.tagIds} onModelChange={value => {
                  model.write(["form", "tagIds"], value);
                }} multiple={true} collapseTags={true} collapseTagsTooltip={true} filterable={true} placeholder="請選擇車輛標籤">{rimoEntries(view.tagOptions).map(([item], _itemIndex) => <Fragment key={item.value}><RimoElement kind="el-option" key={item.value} label={item.label} value={item.value}></RimoElement></Fragment>)}</RimoElement></div></div></div></section>
<section className="vehicle-section"><div className="vehicle-section__header"><RimoElement kind="el-icon"><RimoIcon name="Tools" /></RimoElement>
{text("\n                            清潔保養資料\n                        ")}</div>
<div className="vehicle-section__body"><div className="vehicle-grid"><div className="vehicle-field"><div className="field-label"><strong>{text("保養母版")}</strong></div>
<RimoElement kind="el-select" modelValue={view.form.maintenanceTemplateId} onModelChange={value => {
                  model.write(["form", "maintenanceTemplateId"], value);
                }} clearable={true} filterable={true} placeholder="請選擇保養母版">{rimoEntries(view.availableMaintenanceTemplates).map(([item], _itemIndex) => <Fragment key={item.value}><RimoElement kind="el-option" key={item.value} label={item.label} value={item.value}></RimoElement></Fragment>)}</RimoElement></div>
<div className="vehicle-field"><div className="field-label"><strong>{text("清潔母版")}</strong></div>
<RimoElement kind="el-select" modelValue={view.form.cleaningTemplateId} onModelChange={value => {
                  model.write(["form", "cleaningTemplateId"], value);
                }} clearable={true} filterable={true} placeholder="請選擇清潔母版">{rimoEntries(view.availableCleaningTemplates).map(([item], _itemIndex) => <Fragment key={item.value}><RimoElement kind="el-option" key={item.value} label={item.label} value={item.value}></RimoElement></Fragment>)}</RimoElement></div>
<div className="vehicle-field"><div className="field-label"><strong>{text("上次保養里程")}</strong></div>
<RimoElement kind="el-input" modelValue={view.form.lastMaintenanceMileage} onModelChange={value => {
                  model.write(["form", "lastMaintenanceMileage"], value);
                }} placeholder="請輸入上次保養里程" slots={{
                  "append": _slot => <>{text("km")}</>
                }}></RimoElement></div>
<div className="vehicle-field"><div className="field-label"><strong>{text("上次保養時間")}</strong></div>
<RimoElement kind="el-date-picker" modelValue={view.form.lastMaintenanceDate} onModelChange={value => {
                  model.write(["form", "lastMaintenanceDate"], value);
                }} type="date" placeholder="請選擇日期" format="YYYY/MM/DD" valueFormat="YYYY/MM/DD"></RimoElement></div>
<div className="vehicle-field"><div className="field-label"><strong>{text("上次清潔時間")}</strong></div>
<RimoElement kind="el-date-picker" modelValue={view.form.lastCleaningDate} onModelChange={value => {
                  model.write(["form", "lastCleaningDate"], value);
                }} type="date" placeholder="請選擇日期" format="YYYY/MM/DD" valueFormat="YYYY/MM/DD"></RimoElement></div></div></div></section>
<section className="vehicle-section"><div className="vehicle-section__header"><RimoElement kind="el-icon"><RimoIcon name="Setting" /></RimoElement>
{text("\n                            其他資料\n                        ")}</div>
<div className="vehicle-section__body"><div className="vehicle-grid"><div className="vehicle-field"><div className="field-label"><span className="field-required">{text("*")}</span>
<strong>{text("是否特殊車款")}</strong></div>
<div className="status-radio-group"><RimoElement kind="el-radio-group" modelValue={view.form.specialVehicle} onModelChange={value => {
                    model.write(["form", "specialVehicle"], value);
                  }}><RimoElement kind="el-radio" label={true}>{text("是")}</RimoElement>
<RimoElement kind="el-radio" label={false}>{text("否")}</RimoElement></RimoElement></div></div>
<div className="vehicle-field"><div className="field-label"><strong>{text("車機編號")}</strong></div>
<RimoElement kind="el-select" modelValue={view.form.deviceCode} onModelChange={value => {
                  model.write(["form", "deviceCode"], value);
                }} placeholder="請選擇車機編號">{rimoEntries(view.deviceOptions).map(([item], _itemIndex) => <Fragment key={item.value}><RimoElement kind="el-option" key={item.value} label={item.label} value={item.value}></RimoElement></Fragment>)}</RimoElement></div>
<div className="vehicle-field"><div className="field-label"><strong>{text("ETC 卡號")}</strong></div>
<RimoElement kind="el-input" modelValue={view.form.etcCardNo} onModelChange={value => {
                  model.write(["form", "etcCardNo"], value);
                }} placeholder="請輸入 ETC 卡號"></RimoElement></div>
<div className="vehicle-field"><div className="field-label"><strong>{text("iButton 編號")}</strong></div>
<RimoElement kind="el-input" modelValue={view.form.iButtonCode} onModelChange={value => {
                  model.write(["form", "iButtonCode"], value);
                }} placeholder="請輸入 iButton 編號"></RimoElement></div></div></div></section>
<section className="vehicle-section"><div className="vehicle-section__header"><RimoElement kind="el-icon"><RimoIcon name="Document" /></RimoElement>
{text("\n                            保險資料\n                        ")}</div>
<div className="vehicle-section__body"><div className="vehicle-grid"><div className="vehicle-field"><div className="field-label"><strong>{text("保單號碼")}</strong></div>
<RimoElement kind="el-input" modelValue={view.form.policyNo} onModelChange={value => {
                  model.write(["form", "policyNo"], value);
                }} placeholder="請輸入保單號碼"></RimoElement></div>
<div className="vehicle-field"><div className="field-label"><strong>{text("投保日期")}</strong></div>
<RimoElement kind="el-date-picker" modelValue={view.form.insuranceDate} onModelChange={value => {
                  model.write(["form", "insuranceDate"], value);
                }} type="date" placeholder="請選擇日期" format="YYYY/MM/DD" valueFormat="YYYY/MM/DD"></RimoElement></div>
<div className="vehicle-field"><div className="field-label"><strong>{text("到期日期")}</strong></div>
<RimoElement kind="el-date-picker" modelValue={view.form.insuranceExpireDate} onModelChange={value => {
                  model.write(["form", "insuranceExpireDate"], value);
                }} type="date" placeholder="請選擇日期" format="YYYY/MM/DD" valueFormat="YYYY/MM/DD"></RimoElement></div>
<div className="vehicle-field"><div className="field-label"><strong>{text("保險類型")}</strong></div>
<RimoElement kind="el-select" modelValue={view.form.insuranceType} onModelChange={value => {
                  model.write(["form", "insuranceType"], value);
                }} placeholder="請選擇保險類型"><RimoElement kind="el-option" label="甲式全險" value="full"></RimoElement>
<RimoElement kind="el-option" label="乙式車體險" value="car_body"></RimoElement>
<RimoElement kind="el-option" label="強制險" value="compulsory"></RimoElement></RimoElement></div>
<div className="vehicle-field"><div className="field-label"><strong>{text("保額")}</strong></div>
<RimoElement kind="el-input" modelValue={view.form.coverageAmount} onModelChange={value => {
                  model.write(["form", "coverageAmount"], value);
                }} placeholder="請輸入保額"></RimoElement></div>
<div className="vehicle-field"><div className="field-label"><strong>{text("理賠金額")}</strong></div>
<RimoElement kind="el-input" modelValue={view.form.claimAmount} onModelChange={value => {
                  model.write(["form", "claimAmount"], value);
                }} placeholder="請輸入理賠金額"></RimoElement></div></div>
<div className="hint-box">{text("\n                                新增車輛後，車輛可再到“合約配額管理”、“清潔保養提醒”和“車輛調度排程”繼續綁定對應規則與業務配置。\n                            ")}</div></div></section>
<div className="page-actions"><RimoElement kind="el-button" size="large" onClick={event => {
            view.goBack?.(event);
          }}>{text("返回")}</RimoElement>
<RimoElement kind="el-button" size="large" type="primary" onClick={event => {
            view.submitVehicle?.(event);
          }}>{text("提交")}</RimoElement></div></div></div></RimoRoot>;
}