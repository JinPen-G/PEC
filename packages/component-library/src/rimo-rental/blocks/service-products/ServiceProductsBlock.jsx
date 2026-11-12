import { Fragment } from 'react';
import { useRimoModel, rimoEntries } from '../../lib/rimo-model.js';
import { RimoRoot, RimoIcon, RimoImage, useRimoEnvironment } from '../../lib/RimoEnvironment.jsx';
import { RimoElement, rimoClass, rimoStyle, rimoText } from '../../lib/RimoElements.jsx';
import './service-products.css';
function createPageState(model) {
  const _document = model.document;
  const _window = model.window;
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
      cell: ref,
      record: reactive,
      derived: computed
    } = model;
    const {
      ElMessage: _ElMessage,
      ElMessageBox: _ElMessageBox
    } = feedback;
    const allVehicleModels = ref([{
      id: 'G1',
      brand: 'Tesla',
      model: 'Model 3',
      year: '2023',
      defaultPhotoUrl: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?ixlib=rb-1.2.1&w=200'
    }, {
      id: 'G2',
      brand: 'BYD',
      model: 'Han EV',
      year: '2024',
      defaultPhotoUrl: 'https://images.unsplash.com/photo-1621360841013-c768371e93cf?ixlib=rb-1.2.1&w=200'
    }, {
      id: 'G3',
      brand: 'BMW',
      model: '3 Series',
      year: '2023',
      defaultPhotoUrl: 'https://images.unsplash.com/photo-1555215696-9977639556ee?ixlib=rb-1.2.1-w=200'
    }]);
    const productGroups = ref([{
      id: 'SG1',
      type: 'SHARING',
      name: '經濟型 (分時)',
      aliasName: 'Economy',
      dailyPrice: 200,
      hourlyPrice: 30,
      enableSameStation: true,
      sameStationHourlyPrice: 25,
      sameStationDailyPrice: 160,
      enableDiffStation: true,
      diffStationHourlyPrice: 35,
      diffStationDailyPrice: 220,
      isUnifiedMileage: false,
      mileageRule: {
        freeKm: 100,
        pricePerKm: 1.5,
        dailyCap: 0
      },
      models: [{
        modelId: 'G2',
        mileageRule: {
          freeKm: 100,
          pricePerKm: 1.5,
          dailyCap: 0
        }
      }]
    }, {
      id: 'SG2',
      type: 'SHARING',
      name: '舒適型 (分時)',
      aliasName: 'Comfort',
      dailyPrice: 300,
      hourlyPrice: 50,
      enableSameStation: true,
      sameStationHourlyPrice: 45,
      sameStationDailyPrice: 280,
      enableDiffStation: true,
      diffStationHourlyPrice: 55,
      diffStationDailyPrice: 350,
      isUnifiedMileage: false,
      mileageRule: {
        freeKm: 100,
        pricePerKm: 2.0,
        dailyCap: 300
      },
      models: [{
        modelId: 'G1',
        mileageRule: {
          freeKm: 100,
          pricePerKm: 2.0,
          dailyCap: 300
        }
      }]
    }, {
      id: 'SG3',
      type: 'SHARING',
      name: '商務型 (分時)',
      aliasName: 'Business',
      dailyPrice: 400,
      hourlyPrice: 70,
      enableSameStation: true,
      sameStationHourlyPrice: 60,
      sameStationDailyPrice: 380,
      enableDiffStation: true,
      diffStationHourlyPrice: 80,
      diffStationDailyPrice: 450,
      isUnifiedMileage: true,
      mileageRule: {
        freeKm: 150,
        pricePerKm: 2.5,
        dailyCap: 500
      },
      models: [{
        modelId: 'G3',
        mileageRule: {
          freeKm: 150,
          pricePerKm: 2.5,
          dailyCap: 500
        }
      }]
    }, {
      id: 'SG4',
      type: 'SHARING',
      name: '尊享型 (分時)',
      aliasName: 'Premium',
      dailyPrice: 600,
      hourlyPrice: 100,
      enableSameStation: true,
      sameStationHourlyPrice: 90,
      sameStationDailyPrice: 550,
      enableDiffStation: true,
      diffStationHourlyPrice: 120,
      diffStationDailyPrice: 650,
      isUnifiedMileage: false,
      mileageRule: {
        freeKm: 100,
        pricePerKm: 3.0,
        dailyCap: 0
      },
      models: []
    }, {
      id: 'SG5',
      type: 'SHARING',
      name: '新能源專享 (分時)',
      aliasName: 'EV Exclusive',
      dailyPrice: 150,
      hourlyPrice: 20,
      enableSameStation: true,
      sameStationHourlyPrice: 15,
      sameStationDailyPrice: 120,
      enableDiffStation: true,
      diffStationHourlyPrice: 25,
      diffStationDailyPrice: 180,
      isUnifiedMileage: true,
      mileageRule: {
        freeKm: 200,
        pricePerKm: 1.0,
        dailyCap: 150
      },
      models: [{
        modelId: 'G1',
        mileageRule: {
          freeKm: 200,
          pricePerKm: 1.0,
          dailyCap: 150
        }
      }, {
        modelId: 'G2',
        mileageRule: {
          freeKm: 200,
          pricePerKm: 1.0,
          dailyCap: 150
        }
      }]
    }, {
      id: 'SG6',
      type: 'SHARING',
      name: '輕量測試組 (分時)',
      aliasName: 'Basic Group',
      dailyPrice: 200,
      hourlyPrice: 30,
      enableSameStation: true,
      sameStationHourlyPrice: 20,
      sameStationDailyPrice: 180,
      enableDiffStation: true,
      diffStationHourlyPrice: 40,
      diffStationDailyPrice: 250,
      isUnifiedMileage: true,
      mileageRule: {
        freeKm: 50,
        pricePerKm: 2.0,
        dailyCap: 0
      },
      models: [{
        modelId: 'G3',
        mileageRule: {
          freeKm: 50,
          pricePerKm: 2.0,
          dailyCap: 0
        }
      }]
    }, {
      id: 'ST1',
      type: 'STORE',
      name: '經濟型 (門市)',
      aliasName: 'Economy',
      dailyPrice: 180,
      isUnifiedMileage: true,
      mileageRule: {
        freeKm: 200,
        pricePerKm: 2.0,
        dailyCap: 0
      },
      models: [{
        modelId: 'G2',
        mileageRule: {
          freeKm: 200,
          pricePerKm: 2.0,
          dailyCap: 0
        }
      }]
    }, {
      id: 'ST2',
      type: 'STORE',
      name: '舒適型 (門市)',
      aliasName: 'Comfort',
      dailyPrice: 280,
      isUnifiedMileage: false,
      mileageRule: {
        freeKm: 150,
        pricePerKm: 2.5,
        dailyCap: 400
      },
      models: [{
        modelId: 'G1',
        mileageRule: {
          freeKm: 150,
          pricePerKm: 2.0,
          dailyCap: 300
        }
      }, {
        modelId: 'G3',
        mileageRule: {
          freeKm: 200,
          pricePerKm: 3.0,
          dailyCap: 500
        }
      }]
    }, {
      id: 'ST3',
      type: 'STORE',
      name: '商務型 (門市)',
      aliasName: 'Business',
      dailyPrice: 380,
      isUnifiedMileage: true,
      mileageRule: {
        freeKm: 250,
        pricePerKm: 3.0,
        dailyCap: 0
      },
      models: [{
        modelId: 'G3',
        mileageRule: {
          freeKm: 250,
          pricePerKm: 3.0,
          dailyCap: 0
        }
      }]
    }, {
      id: 'ST4',
      type: 'STORE',
      name: 'SUV越野型 (門市)',
      aliasName: 'SUV Off-road',
      dailyPrice: 450,
      isUnifiedMileage: true,
      mileageRule: {
        freeKm: 300,
        pricePerKm: 4.0,
        dailyCap: 800
      },
      models: [{
        modelId: 'G2',
        mileageRule: {
          freeKm: 300,
          pricePerKm: 4.0,
          dailyCap: 800
        }
      }]
    }, {
      id: 'ST5',
      type: 'STORE',
      name: '特惠長租版 (門市)',
      aliasName: 'Long-term Promo',
      dailyPrice: 120,
      isUnifiedMileage: true,
      mileageRule: {
        freeKm: 100,
        pricePerKm: 1.5,
        dailyCap: 200
      },
      models: [{
        modelId: 'G1',
        mileageRule: {
          freeKm: 100,
          pricePerKm: 1.5,
          dailyCap: 200
        }
      }]
    }]);
    const activeTab = ref('STORE');
    const sharingAuthMode = ref('BOTH');
    const permissionDemoMode = ref('FULL');
    const permissionDemoOptions = [{
      label: '全部授權',
      value: 'FULL'
    }, {
      label: '僅門市租賃',
      value: 'STORE_ONLY'
    }, {
      label: '僅分時租賃',
      value: 'SHARING_BOTH'
    }, {
      label: '分時僅同站',
      value: 'SHARING_SAME'
    }, {
      label: '分時僅甲乙',
      value: 'SHARING_ONEWAY'
    }];
    const hasStoreBusinessPermission = computed(() => ['FULL', 'STORE_ONLY'].includes(permissionDemoMode.value));
    const hasSharingBusinessPermission = computed(() => permissionDemoMode.value !== 'STORE_ONLY');
    const setPermissionDemoMode = mode => {
      permissionDemoMode.value = mode;
      if (mode === 'FULL') {
        sharingAuthMode.value = 'BOTH';
        if (!['STORE', 'SHARING'].includes(activeTab.value)) activeTab.value = 'STORE';
        return;
      }
      if (mode === 'STORE_ONLY') {
        sharingAuthMode.value = 'NONE';
        activeTab.value = 'STORE';
        return;
      }
      sharingAuthMode.value = mode === 'SHARING_SAME' ? 'SAME' : mode === 'SHARING_ONEWAY' ? 'DIFF' : 'BOTH';
      activeTab.value = 'SHARING';
    };
    const dialogVisible = ref(false);
    const isEdit = ref(false);
    const showModelSelector = ref(false);
    const modelSearch = ref('');
    const currentType = ref('SHARING');
    const currentGroup = reactive({
      id: '',
      name: '',
      aliasName: '',
      dailyPrice: 0,
      hourlyPrice: 0,
      enableSameStation: true,
      sameStationHourlyPrice: 0,
      sameStationDailyPrice: 0,
      sameStationHolidayHourlyPrice: 0,
      sameStationHolidayDailyPrice: 0,
      enableDiffStation: true,
      diffStationHourlyPrice: 0,
      diffStationDailyPrice: 0,
      diffStationHolidayHourlyPrice: 0,
      diffStationHolidayDailyPrice: 0,
      isUnifiedMileage: true,
      models: [],
      mileageRule: {
        freeKm: 0,
        pricePerKm: 0,
        dailyCap: 0
      },
      isSpecial: false,
      specialMembershipRequired: ''
    });
    const sharingGroups = computed(() => productGroups.value.filter(g => g.type === 'SHARING'));
    const storeGroups = computed(() => productGroups.value.filter(g => g.type === 'STORE'));
    const hasSameStationAuth = computed(() => ['BOTH', 'SAME'].includes(sharingAuthMode.value));
    const hasDiffStationAuth = computed(() => ['BOTH', 'DIFF'].includes(sharingAuthMode.value));
    const productVersionRecords = ref([{
      version: 'PRICE-ST1-20260418',
      groupId: 'ST1',
      groupName: '經濟型 (門市)',
      dailyPrice: '¥180/天',
      models: 'Nissan Sentra',
      mileageMode: '統一里程規則',
      specialRule: '無特殊管控',
      savedBy: '產品運營',
      savedAt: '2026-04-18 10:15',
      mileageValues: [{
        scope: '全組統一',
        freeKm: '200 km',
        pricePerKm: '¥2.0/km',
        dailyCap: '不封頂'
      }]
    }, {
      version: 'PRICE-ST2-20260418',
      groupId: 'ST2',
      groupName: '舒適型 (門市)',
      dailyPrice: '¥280/天',
      models: 'Toyota Corolla、Ford Focus',
      mileageMode: '按車型獨立里程規則',
      specialRule: '無特殊管控',
      savedBy: '產品運營',
      savedAt: '2026-04-18 10:18',
      mileageValues: [{
        scope: 'Toyota Corolla',
        freeKm: '150 km',
        pricePerKm: '¥2.0/km',
        dailyCap: '¥300/天'
      }, {
        scope: 'Ford Focus',
        freeKm: '200 km',
        pricePerKm: '¥3.0/km',
        dailyCap: '¥500/天'
      }]
    }, {
      version: 'PRICE-ST1-20260401',
      groupId: 'ST1',
      groupName: '經濟型 (門市)',
      dailyPrice: '¥160/天',
      models: 'Nissan Sentra',
      mileageMode: '統一里程規則',
      specialRule: '無特殊管控',
      savedBy: '產品運營',
      savedAt: '2026-04-01 09:30',
      mileageValues: [{
        scope: '全組統一',
        freeKm: '150 km',
        pricePerKm: '¥2.0/km',
        dailyCap: '不封頂'
      }]
    }]);
    const productVersionDialogVisible = ref(false);
    const selectedProductVersion = ref(null);
    const openProductVersion = group => {
      selectedProductVersion.value = productVersionRecords.value.find(version => version.groupId === group?.id) || productVersionRecords.value[0];
      productVersionDialogVisible.value = true;
    };
    const sharingAuthLabel = computed(() => {
      const labelMap = {
        BOTH: '當前展示：同站租還 + 甲租乙還',
        SAME: '當前展示：同站租還',
        DIFF: '當前展示：甲租乙還',
        NONE: '當前展示：未授權'
      };
      return labelMap[sharingAuthMode.value] || labelMap.BOTH;
    });
    const filteredAvailableModels = computed(() => {
      const q = modelSearch.value.toLowerCase();
      return allVehicleModels.value.filter(m => m.brand.toLowerCase().includes(q) || m.model.toLowerCase().includes(q));
    });
    const getModelName = id => {
      const m = allVehicleModels.value.find(x => x.id === id);
      return m ? `${m.brand} ${m.model}` : '未知車型';
    };
    const formatMileageRuleSimple = rule => {
      if (!rule) return '無';
      return `含${rule.freeKm}km · ¥${rule.pricePerKm}/km`;
    };
    const normalizeMileageLockFields = () => {
      if (!currentGroup.mileageRule) {
        currentGroup.mileageRule = {
          freeKm: 0,
          pricePerKm: 1.5,
          dailyCap: 0
        };
      }
      if (currentType.value === 'SHARING') {
        currentGroup.mileageRule.freeKm = 0;
        currentGroup.mileageRule.dailyCap = 0;
      }
      currentGroup.models.forEach(model => {
        if (!model.mileageRule) {
          model.mileageRule = {
            freeKm: 0,
            pricePerKm: currentGroup.mileageRule.pricePerKm || 1.5,
            dailyCap: 0
          };
        }
        if (currentType.value === 'SHARING') {
          model.mileageRule.freeKm = 0;
          model.mileageRule.dailyCap = 0;
        }
      });
    };
    const ensureSharingPriceFields = () => {
      if (currentType.value !== 'SHARING') return;
      currentGroup.enableSameStation = true;
      currentGroup.enableDiffStation = true;
      if (currentGroup.sameStationHolidayHourlyPrice === undefined) {
        currentGroup.sameStationHolidayHourlyPrice = currentGroup.sameStationHourlyPrice || 0;
      }
      if (currentGroup.sameStationHolidayDailyPrice === undefined) {
        currentGroup.sameStationHolidayDailyPrice = currentGroup.sameStationDailyPrice || 0;
      }
      if (currentGroup.diffStationHolidayHourlyPrice === undefined) {
        currentGroup.diffStationHolidayHourlyPrice = currentGroup.diffStationHourlyPrice || 0;
      }
      if (currentGroup.diffStationHolidayDailyPrice === undefined) {
        currentGroup.diffStationHolidayDailyPrice = currentGroup.diffStationDailyPrice || 0;
      }
    };
    const openDialog = type => {
      isEdit.value = false;
      currentType.value = type;
      Object.assign(currentGroup, {
        id: Date.now().toString(),
        name: '',
        aliasName: '',
        type: type,
        dailyPrice: type === 'SHARING' ? 199 : 299,
        hourlyPrice: type === 'SHARING' ? 29 : 0,
        enableSameStation: true,
        sameStationHourlyPrice: type === 'SHARING' ? 25 : 0,
        sameStationDailyPrice: type === 'SHARING' ? 150 : 0,
        sameStationHolidayHourlyPrice: type === 'SHARING' ? 35 : 0,
        sameStationHolidayDailyPrice: type === 'SHARING' ? 180 : 0,
        enableDiffStation: true,
        diffStationHourlyPrice: type === 'SHARING' ? 35 : 0,
        diffStationDailyPrice: type === 'SHARING' ? 220 : 0,
        diffStationHolidayHourlyPrice: type === 'SHARING' ? 45 : 0,
        diffStationHolidayDailyPrice: type === 'SHARING' ? 260 : 0,
        isUnifiedMileage: type === 'STORE',
        mileageRule: {
          freeKm: 0,
          pricePerKm: 1.5,
          dailyCap: 0
        },
        models: [],
        isSpecial: false,
        specialMembershipRequired: ''
      });
      ensureSharingPriceFields();
      normalizeMileageLockFields();
      dialogVisible.value = true;
    };
    const openEdit = group => {
      isEdit.value = true;
      currentType.value = group.type;
      Object.assign(currentGroup, JSON.parse(JSON.stringify(group)));
      if (!currentGroup.mileageRule) {
        currentGroup.mileageRule = {
          freeKm: 0,
          pricePerKm: 1.5,
          dailyCap: 0
        };
      }
      if (currentGroup.isUnifiedMileage === undefined) {
        currentGroup.isUnifiedMileage = currentType.value === 'STORE';
      }
      if (currentType.value === 'SHARING') {
        currentGroup.enableSameStation = group.enableSameStation !== undefined ? group.enableSameStation : true;
        currentGroup.enableDiffStation = group.enableDiffStation !== undefined ? group.enableDiffStation : true;
        currentGroup.sameStationHolidayHourlyPrice = group.sameStationHolidayHourlyPrice !== undefined ? group.sameStationHolidayHourlyPrice : group.sameStationHourlyPrice || 0;
        currentGroup.sameStationHolidayDailyPrice = group.sameStationHolidayDailyPrice !== undefined ? group.sameStationHolidayDailyPrice : group.sameStationDailyPrice || 0;
        currentGroup.diffStationHolidayHourlyPrice = group.diffStationHolidayHourlyPrice !== undefined ? group.diffStationHolidayHourlyPrice : group.diffStationHourlyPrice || 0;
        currentGroup.diffStationHolidayDailyPrice = group.diffStationHolidayDailyPrice !== undefined ? group.diffStationHolidayDailyPrice : group.diffStationDailyPrice || 0;
      }
      ensureSharingPriceFields();
      normalizeMileageLockFields();
      dialogVisible.value = true;
    };
    const saveGroup = () => {
      if (!currentGroup.name) {
        feedback.ElMessage.warning('請輸入產品組名稱');
        return;
      }
      if (currentGroup.models.length === 0) {
        feedback.ElMessage.warning('請至少關聯一款車型');
        return;
      }
      ensureSharingPriceFields();
      normalizeMileageLockFields();
      if (isEdit.value) {
        const idx = productGroups.value.findIndex(g => g.id === currentGroup.id);
        if (idx !== -1) productGroups.value[idx] = JSON.parse(JSON.stringify(currentGroup));
      } else {
        productGroups.value.push(JSON.parse(JSON.stringify(currentGroup)));
      }
      dialogVisible.value = false;
      feedback.ElMessage.success('保存成功');
    };
    const deleteGroup = group => {
      feedback.ElMessageBox.confirm(`確定要刪除產品組 "${group.name}" 嗎?`, '警告', {
        type: 'warning'
      }).then(() => {
        const idx = productGroups.value.findIndex(g => g.id === group.id);
        if (idx !== -1) productGroups.value.splice(idx, 1);
        feedback.ElMessage.success('刪除成功');
      });
    };
    const addModelToGroup = model => {
      if (currentGroup.models.find(m => m.modelId === model.id)) {
        feedback.ElMessage.warning('該車型已添加');
        return;
      }
      const newModelEntry = {
        modelId: model.id,
        mileageRule: currentGroup.isUnifiedMileage ? JSON.parse(JSON.stringify(currentGroup.mileageRule)) : {
          freeKm: 0,
          pricePerKm: 1.5,
          dailyCap: 0
        }
      };
      currentGroup.models.push(newModelEntry);
      normalizeMileageLockFields();
      showModelSelector.value = false;
    };
    const removeModel = index => {
      currentGroup.models.splice(index, 1);
    };
    return {
      activeTab,
      sharingAuthMode,
      hasSameStationAuth,
      hasDiffStationAuth,
      sharingAuthLabel,
      permissionDemoMode,
      permissionDemoOptions,
      hasStoreBusinessPermission,
      hasSharingBusinessPermission,
      setPermissionDemoMode,
      sharingGroups,
      storeGroups,
      productVersionRecords,
      productVersionDialogVisible,
      selectedProductVersion,
      openProductVersion,
      getModelName,
      formatMileageRuleSimple,
      normalizeMileageLockFields,
      dialogVisible,
      isEdit,
      currentType,
      currentGroup,
      openDialog,
      openEdit,
      saveGroup,
      deleteGroup,
      showModelSelector,
      modelSearch,
      filteredAvailableModels,
      addModelToGroup,
      removeModel,
      ElMessage: feedback.ElMessage,
      ElMessageBox: feedback.ElMessageBox,
      allVehicleModels,
      productGroups,
      ensureSharingPriceFields
    };
  }
  return pageSetup();
}
export default function ServiceProductsBlock() {
  const model = useRimoModel(createPageState);
  const view = model.view;
  const {
    text
  } = useRimoEnvironment();
  return <RimoRoot model={model} pageKey="service-products" assets={{}}><div data-business-content="" data-rimo-layout="page"><div className="prototype-permission-switcher" aria-label="基礎產品定價權限演示" data-rimo-layout="permissions"><span className="prototype-permission-switcher__label">{text("權限演示")}</span>
<RimoElement kind="el-radio-group" modelValue={view.permissionDemoMode} onModelChange={value => {
          model.write(["permissionDemoMode"], value);
        }} size="small" onChange={event => {
          view.setPermissionDemoMode?.(event);
        }}>{rimoEntries(view.permissionDemoOptions).map(([option], _itemIndex) => <Fragment key={option.value}><RimoElement kind="el-radio-button" key={option.value} label={option.value}>{rimoText(option.label)}</RimoElement></Fragment>)}</RimoElement></div>
<div className="flex justify-between items-end mb-6" data-rimo-layout="heading"><div><h1 className="text-2xl font-bold text-gray-800 tracking-tight">{text("基礎產品定價")}</h1>
<p className="text-gray-500 text-sm mt-1">{text("定義不同服務類型下的車輛產品組，設置定價策略和里程費規則。")}</p></div></div>
<RimoElement kind="el-tabs" modelValue={view.activeTab} onModelChange={value => {
        model.write(["activeTab"], value);
      }} className="service-product-tabs rimo-page-tabs bg-white rounded-xl shadow-sm border border-gray-100 min-h-[500px]">{view.hasSharingBusinessPermission ? <><RimoElement kind="el-tab-pane" name="SHARING" slots={{
            "label": _slot => <><span className="flex items-center gap-2"><RimoElement kind="el-icon"><RimoIcon name="Clock" /></RimoElement>
<span>{text("分時租車")}</span></span></>
          }}><div className="p-6"><div className="flex justify-between items-center mb-6" data-rimo-layout="toolbar"><div className="text-sm text-gray-500"><span className="font-bold text-gray-700">{text("說明：")}</span>
{text(" 分時租車模式下，支持獨立配置")}
<span className="text-blue-600 font-bold">{text("同站/異站")}</span>
{text("業務與定價；里程費支持")}
<span className="text-blue-600 font-bold">{text("統一策略或按款型獨立設定")}</span>
{text("。\n                                ")}</div>
<div className="flex items-center gap-3"><RimoElement kind="el-button" type="primary" size="large" className="shadow-md shadow-[color:var(--app-color-primary-shadow)]" onClick={_event => {
                    view.openDialog('SHARING');
                  }}><RimoElement kind="el-icon" className="mr-1"><RimoIcon name="Plus" /></RimoElement>
{text(" 新增產品組\n                                    ")}</RimoElement></div></div>
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">{rimoEntries(view.sharingGroups).map(([group], _itemIndex) => <Fragment key={group.id}><div key={group.id} className="border border-gray-200 rounded-xl p-5 hover:border-blue-300 hover:shadow-md transition-all bg-white flex flex-col h-full relative group"><div className="flex justify-between items-start mb-4"><div><h3 className="font-bold text-lg text-gray-800">{text("\n                                                ")}{rimoText(group.name)}{text("\n                                                ")}
{group.aliasName ? <><span className="ml-2 text-sm text-gray-400 font-normal tracking-wide">{rimoText(group.aliasName)}</span></> : null}</h3>
<div className="text-xs text-gray-400 mt-1">{text("ID: ")}{rimoText(group.id)}</div></div>
<div className="bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded font-medium">{text("分時\n                                        ")}</div></div>
<div className="flex-1 space-y-4"><div className="pb-3 border-b border-gray-50">{view.hasSameStationAuth || view.hasDiffStationAuth ? <><div className="bg-slate-50/50 px-2.5 py-2 rounded-lg border border-slate-100/50 text-xs"><div className="grid grid-cols-[36px_1fr] gap-x-2 gap-y-1"><div></div>
<div className={rimoClass(["grid gap-2", rimoClass(view.hasSameStationAuth && view.hasDiffStationAuth ? 'grid-cols-2' : 'grid-cols-1 justify-items-end text-right')])}>{view.hasSameStationAuth ? <><div className="text-slate-700 font-semibold flex items-center"><span className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-2"></span>
{text("同站租還\n                                                        ")}</div></> : null}
{view.hasDiffStationAuth ? <><div className="text-slate-700 font-semibold flex items-center"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-2"></span>
{text("甲租乙還\n                                                        ")}</div></> : null}</div>
<div className="text-gray-400 leading-5">{text("平日")}</div>
<div className={rimoClass(["grid gap-2", rimoClass(view.hasSameStationAuth && view.hasDiffStationAuth ? 'grid-cols-2' : 'grid-cols-1 justify-items-end text-right')])}>{view.hasSameStationAuth ? <><div className="text-slate-700"><span className="font-semibold text-slate-800">{text("¥")}{rimoText(group.sameStationHourlyPrice || '-')}</span>
{text("/時\n                                                            ")}
<span className="text-slate-300 mx-1">{text("|")}</span>
<span className="font-semibold text-slate-800">{text("¥")}{rimoText(group.sameStationDailyPrice || '-')}</span>
{text("/天\n                                                        ")}</div></> : null}
{view.hasDiffStationAuth ? <><div className="text-slate-700"><span className="font-semibold text-slate-800">{text("¥")}{rimoText(group.diffStationHourlyPrice || '-')}</span>
{text("/時\n                                                            ")}
<span className="text-slate-300 mx-1">{text("|")}</span>
<span className="font-semibold text-slate-800">{text("¥")}{rimoText(group.diffStationDailyPrice || '-')}</span>
{text("/天\n                                                        ")}</div></> : null}</div>
<div className="text-gray-400 leading-5">{text("假日")}</div>
<div className={rimoClass(["grid gap-2", rimoClass(view.hasSameStationAuth && view.hasDiffStationAuth ? 'grid-cols-2' : 'grid-cols-1 justify-items-end text-right')])}>{view.hasSameStationAuth ? <><div className="text-slate-700"><span className="font-semibold text-slate-800">{text("¥")}{rimoText(group.sameStationHolidayHourlyPrice || group.sameStationHourlyPrice || '-')}</span>
{text("/時\n                                                            ")}
<span className="text-slate-300 mx-1">{text("|")}</span>
<span className="font-semibold text-slate-800">{text("¥")}{rimoText(group.sameStationHolidayDailyPrice || group.sameStationDailyPrice || '-')}</span>
{text("/天\n                                                        ")}</div></> : null}
{view.hasDiffStationAuth ? <><div className="text-slate-700"><span className="font-semibold text-slate-800">{text("¥")}{rimoText(group.diffStationHolidayHourlyPrice || group.diffStationHourlyPrice || '-')}</span>
{text("/時\n                                                            ")}
<span className="text-slate-300 mx-1">{text("|")}</span>
<span className="font-semibold text-slate-800">{text("¥")}{rimoText(group.diffStationHolidayDailyPrice || group.diffStationDailyPrice || '-')}</span>
{text("/天\n                                                        ")}</div></> : null}</div></div></div></> : <><div className="text-center py-3 text-xs text-slate-400 bg-slate-50 rounded border border-slate-100">{text("\n                                                當前授權狀態下暫無可配置的分時業務線\n                                            ")}</div></>}</div>
{group.isUnifiedMileage ? <><div className="bg-slate-50/80 rounded-lg px-3 py-2 border border-slate-100"><div className="text-xs font-bold text-slate-600 mb-1.5 uppercase flex items-center"><RimoElement kind="el-icon" className="mr-1"><RimoIcon name="Odometer" /></RimoElement>
{text(" 統一里程費規則\n                                            ")}</div>
<div className="grid grid-cols-3 gap-2 text-xs" data-rimo-grid="3"><div><div className="text-slate-400">{text("免費里程")}</div>
<div className="font-mono font-medium text-slate-700">{rimoText(group.mileageRule.freeKm)}{text(" km")}</div></div>
<div><div className="text-slate-400">{text("超程單價")}</div>
<div className="font-mono font-medium text-slate-700">{text("¥")}{rimoText(group.mileageRule.pricePerKm)}{text("/km")}</div></div>
<div><div className="text-slate-400">{text("封頂")}</div>
<div className="font-mono font-medium text-slate-700">{rimoText(group.mileageRule.dailyCap > 0 ? '¥' + group.mileageRule.dailyCap : '不限')}</div></div></div></div></> : <><div className="bg-slate-50/80 rounded-lg p-3 border border-slate-100"><div className="text-xs font-bold text-slate-600 mb-2 uppercase flex items-center"><RimoElement kind="el-icon" className="mr-1"><RimoIcon name="Odometer" /></RimoElement>
{text(" 個性化里程費\n                                            ")}</div>
<div className="text-xs text-slate-500">{text("\n                                                已爲 ")}{rimoText(group.models.length)}{text(" 款車型單獨配置\n                                            ")}</div></div></>}
<div className="text-xs text-gray-500"><span className="font-bold">{text("包含 ")}{rimoText(group.models.length)}{text(" 款車型: ")}</span>
<span className="truncate block mt-1">{rimoText(group.models.map(m => view.getModelName(m.modelId)).join(', ') || '暫無車型')}</span></div></div>
<div className="mt-5 flex gap-2 border-t border-gray-100 pt-4"><RimoElement kind="el-button" className="flex-1" type="primary" plain={true} size="small" onClick={_event => {
                        view.openEdit(group);
                      }}>{text("配置詳情")}</RimoElement>
<RimoElement kind="el-button" type="danger" plain={true} size="small" icon="Delete" circle={true} onClick={_event => {
                        view.deleteGroup(group);
                      }}></RimoElement></div></div></Fragment>)}</div>
{view.sharingGroups.length === 0 ? <><div className="flex flex-col items-center justify-center py-20 text-gray-400"><RimoElement kind="el-icon" className="text-4xl mb-3 opacity-20"><RimoIcon name="Grid" /></RimoElement>
<p>{text("暫無分時租車產品組")}</p></div></> : null}</div></RimoElement></> : null}
{view.hasStoreBusinessPermission ? <><RimoElement kind="el-tab-pane" name="STORE" slots={{
            "label": _slot => <><span className="flex items-center gap-2"><RimoElement kind="el-icon"><RimoIcon name="Shop" /></RimoElement>
<span>{text("門市租賃")}</span></span></>
          }}><div className="p-6"><div className="flex justify-between items-center mb-6" data-rimo-layout="toolbar"><div className="text-sm text-gray-500"><span className="font-bold text-gray-700">{text("說明：")}</span>
{text(" 門市租賃模式下，車組統一標準價基於")}
<span className="text-blue-600 font-bold">{text("產品組層級")}</span>
{text("設定且不區分平假日；里程費支持")}
<span className="text-blue-600 font-bold">{text("統一策略或按款型獨立設定")}</span>
{text("。\n                                ")}</div>
<div className="flex items-center gap-2"><RimoElement kind="el-button" plain={true} onClick={_event => {
                    view.openProductVersion();
                  }}>{text("歷史版本")}</RimoElement>
<RimoElement kind="el-button" type="primary" size="large" className="shadow-md shadow-[color:var(--app-color-primary-shadow)]" onClick={_event => {
                    view.openDialog('STORE');
                  }}><RimoElement kind="el-icon" className="mr-1"><RimoIcon name="Plus" /></RimoElement>
{text(" 新增產品組\n                                    ")}</RimoElement></div></div>
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">{rimoEntries(view.storeGroups).map(([group], _itemIndex) => <Fragment key={group.id}><div key={group.id} className="border border-gray-200 rounded-xl p-5 hover:border-blue-300 hover:shadow-md transition-all bg-white flex flex-col h-full group"><div className="flex justify-between items-start mb-4"><div><h3 className="font-bold text-lg text-gray-800">{text("\n                                                ")}{rimoText(group.name)}{text("\n                                                ")}
{group.aliasName ? <><span className="ml-2 text-sm text-gray-400 font-normal tracking-wide">{rimoText(group.aliasName)}</span></> : null}</h3>
<div className="text-xs text-gray-400 mt-1">{text("ID: ")}{rimoText(group.id)}</div>
<div className="text-xs text-[color:var(--app-color-primary)] mt-1 cursor-pointer underline decoration-dotted" onClick={_event => {
                          view.openProductVersion(group);
                        }}>{text("標準價版本：PRICE-")}{rimoText(group.id)}{text("-20260418")}</div></div>
<div className="bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded font-medium">{text("\n                                            門市")}</div></div>
<div className="flex-1 space-y-4"><div className="flex justify-between items-center py-2 border-b border-gray-50"><span className="text-gray-500 text-sm">{text("統一標準價")}</span>
<span className="font-bold text-slate-800">{text("¥")}{rimoText(group.dailyPrice)}
<span className="text-xs text-gray-400 font-normal">{text("/天")}</span></span></div>
{group.isUnifiedMileage ? <><div className="bg-slate-50/80 rounded-lg px-3 py-2 border border-slate-100"><div className="text-xs font-bold text-slate-600 mb-1.5 uppercase flex items-center"><RimoElement kind="el-icon" className="mr-1"><RimoIcon name="Odometer" /></RimoElement>
{text(" 統一里程費規則\n                                            ")}</div>
<div className="grid grid-cols-3 gap-2 text-xs" data-rimo-grid="3"><div><div className="text-slate-400">{text("免費里程")}</div>
<div className="font-mono font-medium text-gray-700">{rimoText(group.mileageRule.freeKm)}{text(" km")}</div></div>
<div><div className="text-slate-400">{text("超程單價")}</div>
<div className="font-mono font-medium text-gray-700">{text("¥")}{rimoText(group.mileageRule.pricePerKm)}{text("/km")}</div></div>
<div><div className="text-slate-400">{text("封頂")}</div>
<div className="font-mono font-medium text-gray-700">{rimoText(group.mileageRule.dailyCap > 0 ? '¥' + group.mileageRule.dailyCap : '不限')}</div></div></div></div></> : <><div className="bg-slate-50/80 rounded-lg p-3 border border-slate-100"><div className="text-xs font-bold text-slate-600 mb-2 uppercase flex items-center"><RimoElement kind="el-icon" className="mr-1"><RimoIcon name="Odometer" /></RimoElement>
{text(" 個性化里程費\n                                            ")}</div>
<div className="text-xs text-gray-500">{text("\n                                                已爲 ")}{rimoText(group.models.length)}{text(" 款車型單獨配置\n                                            ")}</div></div></>}
<div className="text-xs text-gray-500"><span className="font-bold">{text("包含 ")}{rimoText(group.models.length)}{text(" 款車型: ")}</span>
<span className="truncate block mt-1">{rimoText(group.models.map(m => view.getModelName(m.modelId)).join(', ') || '暫無車型')}</span></div></div>
<div className="mt-5 flex gap-2 border-t border-gray-100 pt-4"><RimoElement kind="el-button" className="flex-1" type="primary" plain={true} size="small" onClick={_event => {
                        view.openEdit(group);
                      }}>{text("配置詳情")}</RimoElement>
<RimoElement kind="el-button" type="danger" plain={true} size="small" icon="Delete" circle={true} onClick={_event => {
                        view.deleteGroup(group);
                      }}></RimoElement></div></div></Fragment>)}</div>
{view.storeGroups.length === 0 ? <><div className="flex flex-col items-center justify-center py-20 text-gray-400"><RimoElement kind="el-icon" className="text-4xl mb-3 opacity-20"><RimoIcon name="Grid" /></RimoElement>
<p>{text("暫無門市租賃產品組")}</p></div></> : null}</div></RimoElement></> : null}</RimoElement></div><RimoElement kind="el-dialog" modelValue={view.dialogVisible} onModelChange={value => {
      model.write(["dialogVisible"], value);
    }} title={(view.isEdit ? '編輯' : '新增') + (view.currentType === 'SHARING' ? '分時租車' : '門市租賃') + '產品組'} width="960px" className="service-products-overlay" slots={{
      "footer": _slot => <><RimoElement kind="el-button" onClick={_event => {
          model.write(["dialogVisible"], false);
        }}>{text("取消")}</RimoElement>
<RimoElement kind="el-button" type="primary" onClick={event => {
          view.saveGroup?.(event);
        }}>{text("保存配置")}</RimoElement></>
    }}>{() => <><RimoElement kind="el-form" model={view.currentGroup} labelPosition="top"><div className="grid grid-cols-2 gap-6" data-rimo-grid="2"><div className="col-span-2 md:col-span-1"><RimoElement kind="el-form-item" label="產品組名稱" required={true}><RimoElement kind="el-input" modelValue={view.currentGroup.name} onModelChange={value => {
                  model.write(["currentGroup", "name"], value);
                }} placeholder="例如: 經濟型, 豪華型"></RimoElement></RimoElement></div>
<div className="col-span-2 md:col-span-1"><RimoElement kind="el-form-item" label="產品組別名 (如英文名)"><RimoElement kind="el-input" modelValue={view.currentGroup.aliasName} onModelChange={value => {
                  model.write(["currentGroup", "aliasName"], value);
                }} placeholder="例如: Economy, Luxury"></RimoElement></RimoElement></div>
{view.currentType === 'STORE' ? <><div className="col-span-2 md:col-span-1"><RimoElement kind="el-form-item" label="車組標準價 (元/天)" required={true}><RimoElement kind="el-input-number" modelValue={view.currentGroup.dailyPrice} onModelChange={value => {
                    model.write(["currentGroup", "dailyPrice"], value);
                  }} min={0} step={10} className="w-full"></RimoElement></RimoElement></div></> : null}
{view.currentType === 'SHARING' ? <><div className="col-span-2 rounded-lg border border-slate-200 bg-slate-50/40 p-4"><div className="font-bold text-slate-800 flex items-center justify-between text-sm mb-4"><span className="flex items-center"><RimoElement kind="el-icon" className="mr-2 text-slate-500"><RimoIcon name="Money" /></RimoElement>
{text(" 基準租金費率\n                            ")}</span>
<span className="text-xs font-normal text-slate-400">{rimoText(view.sharingAuthLabel)}</span></div>
<div className="rounded-lg border border-slate-200 bg-white divide-y divide-slate-100">{view.hasSameStationAuth ? <><div className="p-3"><div className="grid grid-cols-12 gap-3 items-end" data-rimo-grid="12" data-rimo-layout="form-grid"><div className="col-span-12 md:col-span-2 flex items-center justify-between md:block"><div className="text-sm font-semibold text-slate-800">{text("\n                                            同站租還\n                                        ")}</div></div>
<RimoElement kind="el-form-item" label="平日時租" className="col-span-6 md:col-span-2 mb-0"><RimoElement kind="el-input-number" modelValue={view.currentGroup.sameStationHourlyPrice} onModelChange={value => {
                            model.write(["currentGroup", "sameStationHourlyPrice"], value);
                          }} min={0} step={1} className="w-full" controlsPosition="right"></RimoElement></RimoElement>
<RimoElement kind="el-form-item" label="平日日租" className="col-span-6 md:col-span-2 mb-0"><RimoElement kind="el-input-number" modelValue={view.currentGroup.sameStationDailyPrice} onModelChange={value => {
                            model.write(["currentGroup", "sameStationDailyPrice"], value);
                          }} min={0} step={10} className="w-full" controlsPosition="right"></RimoElement></RimoElement>
<RimoElement kind="el-form-item" label="假日時租" className="col-span-6 md:col-span-2 mb-0"><RimoElement kind="el-input-number" modelValue={view.currentGroup.sameStationHolidayHourlyPrice} onModelChange={value => {
                            model.write(["currentGroup", "sameStationHolidayHourlyPrice"], value);
                          }} min={0} step={1} className="w-full" controlsPosition="right"></RimoElement></RimoElement>
<RimoElement kind="el-form-item" label="假日日租" className="col-span-6 md:col-span-2 mb-0"><RimoElement kind="el-input-number" modelValue={view.currentGroup.sameStationHolidayDailyPrice} onModelChange={value => {
                            model.write(["currentGroup", "sameStationHolidayDailyPrice"], value);
                          }} min={0} step={10} className="w-full" controlsPosition="right"></RimoElement></RimoElement></div></div></> : null}
{view.hasDiffStationAuth ? <><div className="p-3"><div className="grid grid-cols-12 gap-3 items-end" data-rimo-grid="12" data-rimo-layout="form-grid"><div className="col-span-12 md:col-span-2 flex items-center justify-between md:block"><div className="text-sm font-semibold text-slate-800">{text("\n                                            甲租乙還\n                                        ")}</div></div>
<RimoElement kind="el-form-item" label="平日時租" className="col-span-6 md:col-span-2 mb-0"><RimoElement kind="el-input-number" modelValue={view.currentGroup.diffStationHourlyPrice} onModelChange={value => {
                            model.write(["currentGroup", "diffStationHourlyPrice"], value);
                          }} min={0} step={1} className="w-full" controlsPosition="right"></RimoElement></RimoElement>
<RimoElement kind="el-form-item" label="平日日租" className="col-span-6 md:col-span-2 mb-0"><RimoElement kind="el-input-number" modelValue={view.currentGroup.diffStationDailyPrice} onModelChange={value => {
                            model.write(["currentGroup", "diffStationDailyPrice"], value);
                          }} min={0} step={10} className="w-full" controlsPosition="right"></RimoElement></RimoElement>
<RimoElement kind="el-form-item" label="假日時租" className="col-span-6 md:col-span-2 mb-0"><RimoElement kind="el-input-number" modelValue={view.currentGroup.diffStationHolidayHourlyPrice} onModelChange={value => {
                            model.write(["currentGroup", "diffStationHolidayHourlyPrice"], value);
                          }} min={0} step={1} className="w-full" controlsPosition="right"></RimoElement></RimoElement>
<RimoElement kind="el-form-item" label="假日日租" className="col-span-6 md:col-span-2 mb-0"><RimoElement kind="el-input-number" modelValue={view.currentGroup.diffStationHolidayDailyPrice} onModelChange={value => {
                            model.write(["currentGroup", "diffStationHolidayDailyPrice"], value);
                          }} min={0} step={10} className="w-full" controlsPosition="right"></RimoElement></RimoElement></div></div></> : null}
{!view.hasSameStationAuth && !view.hasDiffStationAuth ? <><div className="p-4 text-sm text-slate-400">{text("\n                                當前授權狀態下暫無可配置的分時業務線，請先切換授權模擬。\n                            ")}</div></> : null}</div></div></> : null}</div>
<div className="mt-4 bg-gray-50 p-4 rounded-lg border border-gray-200"><div className="flex justify-between items-center mb-4"><div className="font-bold text-gray-800 flex items-center"><RimoElement kind="el-icon" className="mr-1"><RimoIcon name="Odometer" /></RimoElement>
{text(" 里程費規則\n                        ")}</div>
<RimoElement kind="el-switch" modelValue={view.currentGroup.isUnifiedMileage} onModelChange={value => {
                model.write(["currentGroup", "isUnifiedMileage"], value);
              }} onChange={event => {
                view.normalizeMileageLockFields?.(event);
              }} activeText="統一配置 (所有車型使用相同規則)" inactiveText="單獨配置 (按車型分別設置)"></RimoElement></div>
{view.currentGroup.isUnifiedMileage ? <><div className="grid grid-cols-3 gap-4 animate-fade-in" data-rimo-grid="3" data-rimo-layout="form-grid"><RimoElement kind="el-form-item" label="每日免費里程 (km)"><RimoElement kind="el-input-number" modelValue={view.currentGroup.mileageRule.freeKm} onModelChange={value => {
                    model.write(["currentGroup", "mileageRule", "freeKm"], value);
                  }} min={0} step={100} disabled={view.currentType === 'SHARING'} className="w-full"></RimoElement></RimoElement>
<RimoElement kind="el-form-item" label="超程單價 (元/km)"><RimoElement kind="el-input-number" modelValue={view.currentGroup.mileageRule.pricePerKm} onModelChange={value => {
                    model.write(["currentGroup", "mileageRule", "pricePerKm"], value);
                  }} min={0} step={0.5} precision={1} className="w-full"></RimoElement></RimoElement>
<RimoElement kind="el-form-item" label="每日封頂金額 (元)"><RimoElement kind="el-input-number" modelValue={view.currentGroup.mileageRule.dailyCap} onModelChange={value => {
                    model.write(["currentGroup", "mileageRule", "dailyCap"], value);
                  }} min={0} step={10} disabled={view.currentType === 'SHARING'} placeholder="0爲不限" className="w-full"></RimoElement>
<div className="text-xs text-gray-400 mt-1">{text("設爲 0 表示不封頂")}</div></RimoElement></div></> : <><div className="text-sm text-gray-500 italic">{text("\n                        請在下方關聯車型列表中，爲每個車型單獨設置里程費規則。\n                    ")}</div></>}</div>
<div className="mt-4 bg-yellow-50 p-4 rounded-lg border border-yellow-100"><div className="font-bold text-gray-800 mb-3 flex items-center"><RimoElement kind="el-icon" className="mr-1 text-yellow-600"><RimoIcon name="Lock" /></RimoElement>
{text(" 特殊車輛管控\n                        ")}
{!view.isEdit ? <><RimoElement kind="el-tag" size="small" type="warning" effect="plain" className="ml-2">{text("開發中")}</RimoElement></> : null}</div>
<div className="flex items-center"><RimoElement kind="el-checkbox" modelValue={view.currentGroup.isSpecial} onModelChange={value => {
                model.write(["currentGroup", "isSpecial"], value);
              }} className="mr-4" disabled={!view.isEdit}>{text("標記爲特殊產品組")}</RimoElement>
{view.currentGroup.isSpecial ? <><div className="flex items-center animate-fade-in" data-rimo-layout="field-row"><span className="text-sm text-gray-600 mr-2">{text("限制會員等級:")}</span>
<RimoElement kind="el-select" modelValue={view.currentGroup.specialMembershipRequired} onModelChange={value => {
                    model.write(["currentGroup", "specialMembershipRequired"], value);
                  }} placeholder="請選擇最低會員等級" disabled={!view.isEdit} size="small" className="w-48"><RimoElement kind="el-option" label="白銀會員及以上" value="SILVER"></RimoElement>
<RimoElement kind="el-option" label="黃金會員及以上" value="GOLD"></RimoElement>
<RimoElement kind="el-option" label="黑鑽會員及以上" value="DIAMOND"></RimoElement></RimoElement></div></> : null}</div>
{!view.isEdit ? <><div className="mt-3 flex items-center text-sm text-amber-700 bg-amber-100/70 border border-amber-200 rounded-lg px-3 py-2"><RimoElement kind="el-icon" className="mr-2"><RimoIcon name="WarningFilled" /></RimoElement>
{text("\n                        功能開發中，暫不支持在新增產品時配置特殊車輛管控。\n                    ")}</div></> : null}
<div className="text-xs text-gray-500 mt-2">{text("\n                        開啓後，該產品組下的所有車輛將被視爲特殊車輛，僅允許滿足條件的會員預訂。\n                    ")}</div></div>
<div className="mt-6"><div className="flex justify-between items-center mb-2"><div className="font-bold text-gray-700">{text("關聯車型款型")}</div>
<RimoElement kind="el-button" type="primary" link={true} icon="Plus" onClick={_event => {
                model.write(["showModelSelector"], true);
              }}>{text("添加車型")}</RimoElement></div>
<div className="border border-gray-200 rounded-lg overflow-hidden"><RimoElement kind="el-table" data={view.currentGroup.models} style={rimoStyle("width: 100%")} maxHeight="300"><RimoElement kind="el-table-column" label="車型款型" minWidth="180" slots={{
                  "default": ({
                    row
                  }) => <><div className="font-bold text-sm">{rimoText(view.getModelName(row.modelId))}</div></>
                }}></RimoElement>
{!view.currentGroup.isUnifiedMileage ? <><RimoElement kind="el-table-column" label="里程費配置 (特定款型)" minWidth="350" slots={{
                    "default": ({
                      row
                    }) => <><div className="flex gap-2 items-center"><div className="flex flex-col flex-1"><span className="text-[10px] text-gray-400">{text("免費里程")}</span>
<RimoElement kind="el-input-number" modelValue={row.mileageRule.freeKm} onModelChange={value => {
                            model.assign(row.mileageRule, "freeKm", value);
                          }} min={0} size="small" controls={false} disabled={view.currentType === 'SHARING'} className="!w-full"></RimoElement></div>
<div className="flex flex-col flex-1"><span className="text-[10px] text-gray-400">{text("單價(元/km)")}</span>
<RimoElement kind="el-input-number" modelValue={row.mileageRule.pricePerKm} onModelChange={value => {
                            model.assign(row.mileageRule, "pricePerKm", value);
                          }} min={0} step={0.1} precision={1} size="small" controls={false} className="!w-full"></RimoElement></div>
<div className="flex flex-col flex-1"><span className="text-[10px] text-gray-400">{text("封頂(元)")}</span>
<RimoElement kind="el-input-number" modelValue={row.mileageRule.dailyCap} onModelChange={value => {
                            model.assign(row.mileageRule, "dailyCap", value);
                          }} min={0} size="small" controls={false} disabled={view.currentType === 'SHARING'} className="!w-full"></RimoElement></div></div></>
                  }}></RimoElement></> : null}
<RimoElement kind="el-table-column" label="操作" width="60" align="center" slots={{
                  "default": ({
                    $index
                  }) => <><RimoElement kind="el-button" type="danger" link={true} icon="Close" onClick={_event => {
                      view.removeModel($index);
                    }}></RimoElement></>
                }}></RimoElement></RimoElement>
{view.currentGroup.models.length === 0 ? <><div className="py-8 text-center text-gray-400 text-sm bg-gray-50">{text("\n                            暫未關聯任何車型，點擊右上角添加\n                        ")}</div></> : null}</div></div></RimoElement></>}</RimoElement>
<RimoElement kind="el-dialog" modelValue={view.showModelSelector} onModelChange={value => {
      model.write(["showModelSelector"], value);
    }} title="選擇車型款型" width="500px" className="service-products-overlay">{() => <><RimoElement kind="el-input" modelValue={view.modelSearch} onModelChange={value => {
          model.write(["modelSearch"], value);
        }} placeholder="搜索品牌或型號..." prefixIcon="Search" className="mb-4"></RimoElement>
<div className="max-h-[400px] overflow-y-auto border border-gray-100 rounded-lg">{rimoEntries(view.filteredAvailableModels).map(([model], _itemIndex) => <Fragment key={model.id}><div key={model.id} className="flex items-center justify-between p-3 hover:bg-gray-50 border-b border-gray-50 last:border-0 cursor-pointer" onClick={_event => {
              view.addModelToGroup(model);
            }}><div className="flex items-center"><RimoImage src={model.defaultPhotoUrl} className="w-12 h-9 rounded object-cover border bg-gray-100 mr-3" />
<div><div className="font-bold text-gray-800">{rimoText(model.brand)}{text(" ")}{rimoText(model.model)}</div>
<div className="text-xs text-gray-500">{rimoText(model.year)}{text("款")}</div></div></div>
<RimoElement kind="el-icon" className="text-gray-300"><RimoIcon name="Plus" /></RimoElement></div></Fragment>)}</div></>}</RimoElement>
<RimoElement kind="el-dialog" modelValue={view.productVersionDialogVisible} onModelChange={value => {
      model.write(["productVersionDialogVisible"], value);
    }} title="產品組歷史版本" width="860px" destroyOnClose={true} className="service-products-overlay" slots={{
      "footer": _slot => <><RimoElement kind="el-button" onClick={_event => {
          model.write(["productVersionDialogVisible"], false);
        }}>{text("關閉")}</RimoElement></>
    }}>{() => <>{view.selectedProductVersion ? <><div className="grid grid-cols-3 gap-4" data-rimo-grid="3"><div className="col-span-1 border border-gray-100 rounded-lg overflow-hidden"><div className="px-3 py-2 bg-gray-50 text-xs font-bold text-gray-500">{text("版本列表")}</div>
<div className="divide-y divide-gray-100 max-h-[420px] overflow-y-auto">{rimoEntries(view.productVersionRecords).map(([version], _itemIndex) => <Fragment key={version.version}><button key={version.version} className={rimoClass(["w-full text-left px-3 py-3 hover:bg-[color:var(--app-color-primary-light-9)] transition-colors", rimoClass(view.selectedProductVersion.version === version.version ? 'bg-[color:var(--app-color-primary-light-9)]' : 'bg-white')])} onClick={_event => {
                    model.write(["selectedProductVersion"], version);
                  }}><div className="font-mono text-xs text-[color:var(--app-color-primary)] font-bold">{rimoText(version.version)}</div>
<div className="text-sm text-gray-800 mt-1">{rimoText(version.groupName)}</div>
<div className="text-xs text-gray-400 mt-1">{rimoText(version.savedAt)}{text(" · ")}{rimoText(version.savedBy)}</div></button></Fragment>)}</div></div>
<div className="col-span-2 space-y-4"><div className="rounded-lg border border-[color:var(--app-color-primary-light-8)] bg-[color:var(--app-color-primary-light-9)] px-4 py-3"><div className="font-mono font-bold text-gray-900">{rimoText(view.selectedProductVersion.version)}</div>
<div className="text-sm text-gray-700 mt-1">{rimoText(view.selectedProductVersion.groupName)}</div>
<div className="text-xs text-gray-500 mt-1">{text("保存人：")}{rimoText(view.selectedProductVersion.savedBy)}{text(" · ")}{rimoText(view.selectedProductVersion.savedAt)}</div></div>
<RimoElement kind="el-descriptions" column={2} border={true} size="small"><RimoElement kind="el-descriptions-item" label="標準價">{rimoText(view.selectedProductVersion.dailyPrice)}</RimoElement>
<RimoElement kind="el-descriptions-item" label="車型綁定">{rimoText(view.selectedProductVersion.models)}</RimoElement>
<RimoElement kind="el-descriptions-item" label="里程模式">{rimoText(view.selectedProductVersion.mileageMode)}</RimoElement>
<RimoElement kind="el-descriptions-item" label="特殊管控">{rimoText(view.selectedProductVersion.specialRule)}</RimoElement></RimoElement>
<div><div className="font-bold text-gray-800 mb-2">{text("里程費規則")}</div>
<RimoElement kind="el-table" data={view.selectedProductVersion.mileageValues} border={true} size="small"><RimoElement kind="el-table-column" prop="scope" label="適用範圍" minWidth="160"></RimoElement>
<RimoElement kind="el-table-column" prop="freeKm" label="每日免費里程" width="130" align="center"></RimoElement>
<RimoElement kind="el-table-column" prop="pricePerKm" label="超程單價" width="120" align="center"></RimoElement>
<RimoElement kind="el-table-column" prop="dailyCap" label="每日封頂金額" width="130" align="center"></RimoElement></RimoElement></div></div></div></> : null}</>}</RimoElement></RimoRoot>;
}