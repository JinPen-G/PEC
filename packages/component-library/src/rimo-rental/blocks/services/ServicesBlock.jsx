import { Fragment } from 'react';
import { useRimoModel, rimoEntries } from '../../lib/rimo-model.js';
import { RimoRoot, RimoIcon, useRimoEnvironment } from '../../lib/RimoEnvironment.jsx';
import { RimoElement, rimoClass, rimoStyle, rimoText } from '../../lib/RimoElements.jsx';
import './services.css';
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
      ElMessage: _ElMessage
    } = feedback;
    const activeTab = ref('store');
    const permissionDemoMode = ref('FULL');
    const permissionDemoOptions = [{
      label: '全部授權',
      value: 'FULL'
    }, {
      label: '僅門市租賃',
      value: 'STORE_ONLY'
    }, {
      label: '僅分時租賃',
      value: 'SHARING_ONLY'
    }];
    const hasStoreBusinessPermission = computed(() => ['FULL', 'STORE_ONLY'].includes(permissionDemoMode.value));
    const hasSharingBusinessPermission = computed(() => ['FULL', 'SHARING_ONLY'].includes(permissionDemoMode.value));
    const setPermissionDemoMode = mode => {
      permissionDemoMode.value = mode;
      if (mode === 'STORE_ONLY') activeTab.value = 'store';
      if (mode === 'SHARING_ONLY') activeTab.value = 'sharing';
    };
    const vehicleGroups = [{
      id: 101,
      name: '經濟型 (分時)',
      type: 'SHARING'
    }, {
      id: 102,
      name: '舒適型 (分時)',
      type: 'SHARING'
    }, {
      id: 103,
      name: 'SUV組 (分時)',
      type: 'SHARING'
    }, {
      id: 104,
      name: '商務型 (分時)',
      type: 'SHARING'
    }, {
      id: 105,
      name: '電動車 (分時)',
      type: 'SHARING'
    }];
    const membershipPlans = [{
      id: 'SILVER',
      name: '白銀會員'
    }, {
      id: 'GOLD',
      name: '黃金會員'
    }, {
      id: 'PLATINUM',
      name: '白金會員'
    }, {
      id: 'BLACK',
      name: '黑鑽會員'
    }];
    const serviceList = ref([{
      id: 1,
      name: '全車駕乘險',
      code: 'INS_STORE_FULL',
      category: 'insurance',
      icon: 'Shield',
      price: 88,
      priceUnit: 'day',
      maxQuantity: 1,
      trackInventory: false,
      status: true,
      description: '保障車內所有乘客的人身意外傷害及醫療費用，最高保額50萬。',
      scopes: ['STORE'],
      membershipRestriction: []
    }, {
      id: 2,
      name: '兒童安全座椅',
      code: 'EQ_CHILD_SEAT',
      category: 'equipment',
      icon: 'Seat',
      price: 50,
      priceUnit: 'day',
      maxQuantity: 2,
      trackInventory: true,
      status: true,
      description: '適合0-4歲兒童使用的安全座椅，符合歐盟ECE認證標準。',
      scopes: ['STORE'],
      membershipRestriction: []
    }, {
      id: 3,
      name: '尊享送車上門',
      code: 'SVC_DELIVERY',
      category: 'service',
      icon: 'Location',
      price: 150,
      priceUnit: 'order',
      maxQuantity: 1,
      trackInventory: false,
      status: true,
      description: '五星級管家送車上門，僅限同城20km範圍內。',
      scopes: ['STORE'],
      membershipRestriction: ['GOLD', 'PLATINUM', 'BLACK']
    }, {
      id: 4,
      name: '車載Wi-Fi熱點',
      code: 'EQ_WIFI',
      category: 'equipment',
      icon: 'Connection',
      price: 30,
      priceUnit: 'day',
      maxQuantity: 1,
      trackInventory: true,
      status: false,
      description: '4G高速網絡，無限流量，最多支持5臺設備連接。',
      scopes: ['STORE'],
      membershipRestriction: []
    }, {
      id: 101,
      name: '基礎免賠服務 (同站)',
      code: 'INS_SHARING_BASIC_ROUND',
      category: 'insurance',
      icon: 'Shield',
      price: 0,
      priceUnit: 'hour',
      maxQuantity: 1,
      trackInventory: false,
      status: true,
      description: '分時租車同站還車基礎免賠，降低車輛損失賠付額度。',
      scopes: ['SHARING_ROUND'],
      membershipRestriction: [],
      sharingPricing: {
        'SHARING_ROUND': {
          101: {
            hourly: 2,
            cap: 20
          },
          102: {
            hourly: 3,
            cap: 30
          },
          103: {
            hourly: 4,
            cap: 40
          },
          104: {
            hourly: 5,
            cap: 50
          },
          105: {
            hourly: 3,
            cap: 30
          }
        }
      }
    }, {
      id: 102,
      name: '尊享無憂險 (同站)',
      code: 'INS_SHARING_PLUS_ROUND',
      category: 'insurance',
      icon: 'Shield',
      price: 0,
      priceUnit: 'hour',
      maxQuantity: 1,
      trackInventory: false,
      status: true,
      description: '分時租車同站還車尊享0免賠服務，全面保障用車安全。',
      scopes: ['SHARING_ROUND'],
      membershipRestriction: ['GOLD', 'PLATINUM', 'BLACK'],
      sharingPricing: {
        'SHARING_ROUND': {
          101: {
            hourly: 5,
            cap: 50
          },
          102: {
            hourly: 8,
            cap: 80
          },
          103: {
            hourly: 10,
            cap: 100
          },
          104: {
            hourly: 15,
            cap: 150
          },
          105: {
            hourly: 8,
            cap: 80
          }
        }
      }
    }, {
      id: 103,
      name: '異地還車服務費',
      code: 'SVC_ONEWAY_FEE',
      category: 'service',
      icon: 'Location',
      price: 0,
      priceUnit: 'hour',
      maxQuantity: 1,
      trackInventory: false,
      status: true,
      description: '異地還車車輛排程看板及管理費用。',
      scopes: ['SHARING_ONEWAY'],
      membershipRestriction: [],
      sharingPricing: {
        'SHARING_ONEWAY': {
          101: {
            hourly: 10,
            cap: 100
          },
          102: {
            hourly: 15,
            cap: 150
          },
          103: {
            hourly: 20,
            cap: 200
          },
          104: {
            hourly: 25,
            cap: 250
          },
          105: {
            hourly: 15,
            cap: 150
          }
        }
      }
    }, {
      id: 104,
      name: '全能出行保障包',
      code: 'PKG_ALL_IN_ONE',
      category: 'insurance',
      icon: 'Present',
      price: 0,
      priceUnit: 'hour',
      maxQuantity: 1,
      trackInventory: false,
      status: true,
      description: '包含尊享免賠及人身意外險，適用於所有分時場景。',
      scopes: ['SHARING_ROUND', 'SHARING_ONEWAY'],
      membershipRestriction: ['PLATINUM', 'BLACK'],
      sharingPricing: {
        'SHARING_ROUND': {
          101: {
            hourly: 8,
            cap: 60
          },
          102: {
            hourly: 12,
            cap: 90
          },
          103: {
            hourly: 15,
            cap: 120
          },
          104: {
            hourly: 18,
            cap: 150
          },
          105: {
            hourly: 10,
            cap: 80
          }
        },
        'SHARING_ONEWAY': {
          101: {
            hourly: 10,
            cap: 80
          },
          102: {
            hourly: 15,
            cap: 120
          },
          103: {
            hourly: 18,
            cap: 150
          },
          104: {
            hourly: 22,
            cap: 180
          },
          105: {
            hourly: 12,
            cap: 100
          }
        }
      }
    }]);
    const filteredServiceList = computed(() => {
      if (activeTab.value === 'store') {
        return serviceList.value.filter(s => !s.scopes || s.scopes.includes('STORE'));
      } else {
        return serviceList.value.filter(s => s.scopes && (s.scopes.includes('SHARING_ROUND') || s.scopes.includes('SHARING_ONEWAY')));
      }
    });
    const serviceDialogVisible = ref(false);
    const isEditService = ref(false);
    const defaultService = {
      id: null,
      name: '',
      code: '',
      category: 'insurance',
      icon: 'Shield',
      price: 0,
      priceUnit: 'day',
      maxQuantity: 1,
      trackInventory: false,
      status: true,
      description: '',
      scopes: ['STORE'],
      membershipRestriction: [],
      sharingPricing: {}
    };
    const currentService = reactive({
      ...defaultService
    });
    const openServiceDialog = row => {
      Object.assign(currentService, JSON.parse(JSON.stringify(defaultService)));
      if (!row && activeTab.value === 'sharing') {
        currentService.scopes = ['SHARING_ROUND'];
        currentService.priceUnit = 'hour';
      }
      if (row) {
        isEditService.value = true;
        const data = JSON.parse(JSON.stringify(row));
        if (!data.scopes) data.scopes = ['STORE'];
        if (!data.membershipRestriction) data.membershipRestriction = [];
        if (!data.sharingPricing) data.sharingPricing = {};
        Object.assign(currentService, data);
      } else {
        isEditService.value = false;
        currentService.id = Date.now();
      }
      initSharingPricingStructure();
      serviceDialogVisible.value = true;
    };
    const initSharingPricingStructure = () => {
      if (!currentService.sharingPricing) currentService.sharingPricing = {};
      ['SHARING_ROUND', 'SHARING_ONEWAY'].forEach(scope => {
        if (!currentService.sharingPricing[scope]) {
          currentService.sharingPricing[scope] = {};
        }
        vehicleGroups.forEach(g => {
          if (!currentService.sharingPricing[scope][g.id]) {
            currentService.sharingPricing[scope][g.id] = {
              hourly: 0,
              cap: 0
            };
          }
        });
      });
    };
    const saveService = () => {
      if (!currentService.name || !currentService.code) {
        feedback.ElMessage.warning('請填寫服務名稱和編碼');
        return;
      }
      const index = serviceList.value.findIndex(s => s.id === currentService.id);
      if (index !== -1) {
        serviceList.value[index] = JSON.parse(JSON.stringify(currentService));
      } else {
        serviceList.value.push(JSON.parse(JSON.stringify(currentService)));
      }
      serviceDialogVisible.value = false;
      feedback.ElMessage.success('服務已保存');
    };
    const deleteService = row => {
      const index = serviceList.value.findIndex(s => s.id === row.id);
      if (index !== -1) {
        serviceList.value.splice(index, 1);
        feedback.ElMessage.success('服務已刪除');
      }
    };
    const getCategoryLabel = category => {
      const map = {
        insurance: '保險',
        equipment: '設備',
        service: '服務'
      };
      return map[category] || '其他';
    };
    const isStoreScope = computed(() => currentService.scopes.includes('STORE'));
    const isSharingScope = computed(() => currentService.scopes.includes('SHARING_ROUND') || currentService.scopes.includes('SHARING_ONEWAY'));
    const inventoryDialogVisible = ref(false);
    const inventoryService = ref({});
    const storeInventory = ref([]);
    const openInventoryDialog = row => {
      inventoryService.value = row;
      storeInventory.value = [{
        storeId: 1,
        storeName: '上海虹橋機場店',
        stock: 10,
        reserved: 3
      }, {
        storeId: 2,
        storeName: '上海浦東機場店',
        stock: 8,
        reserved: 2
      }, {
        storeId: 3,
        storeName: '杭州西湖店',
        stock: 5,
        reserved: 1
      }, {
        storeId: 4,
        storeName: '南京南站店',
        stock: 6,
        reserved: 0
      }];
      inventoryDialogVisible.value = true;
    };
    const saveInventory = () => {
      inventoryDialogVisible.value = false;
      feedback.ElMessage.success('庫存已更新');
    };
    const getTotalStock = () => {
      return storeInventory.value.reduce((sum, s) => sum + s.stock, 0);
    };
    const serviceVersionRecords = ref([{
      version: 'SVC-STORE-20260418-001',
      tab: 'store',
      status: '當前生效',
      serviceName: '全車駕乘險',
      serviceCode: 'INS_STORE_FULL',
      category: '保險',
      scopeText: '門市租賃',
      membershipText: '全部會員',
      priceUnitText: '按天',
      maxQuantityText: '限 1 件',
      inventoryText: '無限供應',
      serviceStatus: '啓用',
      description: '保障車內乘客的人身意外傷害及醫療費用。',
      savedBy: '產品運營',
      savedAt: '2026-04-18 15:20',
      pricingRows: [{
        scope: '門市租賃',
        pricing: '¥88/天',
        limit: '1 件',
        inventory: '無限供應',
        remark: '按訂單租期天數計費'
      }]
    }, {
      version: 'SVC-STORE-20260412-001',
      tab: 'store',
      status: '歷史版本',
      serviceName: '兒童座椅',
      serviceCode: 'EQP_CHILD_SEAT',
      category: '設備',
      scopeText: '門市租賃',
      membershipText: '全部會員',
      priceUnitText: '按天',
      maxQuantityText: '限 2 件',
      inventoryText: '按門店庫存',
      serviceStatus: '啓用',
      description: '門店按庫存提供兒童安全座椅。',
      savedBy: '產品運營',
      savedAt: '2026-04-12 10:00',
      pricingRows: [{
        scope: '門市租賃',
        pricing: '¥30/天/件',
        limit: '2 件',
        inventory: '按門店庫存',
        remark: '庫存不足時不允許加購'
      }]
    }, {
      version: 'SVC-SHARE-20260418-001',
      tab: 'sharing',
      status: '當前生效',
      serviceName: '無煙車保障',
      serviceCode: 'SRV_SMOKE_FREE',
      category: '服務',
      scopeText: '同站租還、甲租乙還',
      membershipText: '白銀 / 黃金 / 白金 / 黑鑽',
      priceUnitText: '按小時/按天封頂',
      maxQuantityText: '限 1 件',
      inventoryText: '無庫存概念',
      serviceStatus: '啓用',
      description: '分時訂單附加的無煙車清潔與保障服務。',
      savedBy: '產品運營',
      savedAt: '2026-04-18 16:05',
      pricingRows: [{
        scope: '同站租還',
        pricing: '經濟型 ¥10/時，¥80/天封頂',
        limit: '1 件',
        inventory: '無庫存概念',
        remark: '按車組差異化定價'
      }, {
        scope: '甲租乙還',
        pricing: '經濟型 ¥12/時，¥100/天封頂',
        limit: '1 件',
        inventory: '無庫存概念',
        remark: '按車組差異化定價'
      }]
    }]);
    const serviceVersionDialogVisible = ref(false);
    const selectedServiceVersion = ref(null);
    const filteredServiceVersionRecords = computed(() => serviceVersionRecords.value.filter(item => item.tab === activeTab.value));
    const openServiceVersion = () => {
      selectedServiceVersion.value = filteredServiceVersionRecords.value[0] || serviceVersionRecords.value[0] || null;
      serviceVersionDialogVisible.value = true;
    };
    const getServiceVersionBasicRows = version => {
      if (!version) return [];
      return [{
        label: '服務名稱',
        value: version.serviceName || '-'
      }, {
        label: '服務編碼',
        value: version.serviceCode || '-'
      }, {
        label: '服務類型',
        value: version.category || '-'
      }, {
        label: '適用場景',
        value: version.scopeText || '-'
      }, {
        label: '適用會員',
        value: version.membershipText || '-'
      }, {
        label: '計價單位',
        value: version.priceUnitText || '-'
      }, {
        label: '最大加購數量',
        value: version.maxQuantityText || '-'
      }, {
        label: '庫存管理',
        value: version.inventoryText || '-'
      }, {
        label: '狀態',
        value: version.serviceStatus || '-'
      }, {
        label: '服務說明',
        value: version.description || '-'
      }];
    };
    return {
      activeTab,
      permissionDemoMode,
      permissionDemoOptions,
      hasStoreBusinessPermission,
      hasSharingBusinessPermission,
      setPermissionDemoMode,
      serviceList,
      filteredServiceList,
      vehicleGroups,
      membershipPlans,
      serviceDialogVisible,
      isEditService,
      currentService,
      openServiceDialog,
      saveService,
      deleteService,
      getCategoryLabel,
      isStoreScope,
      isSharingScope,
      inventoryDialogVisible,
      inventoryService,
      storeInventory,
      openInventoryDialog,
      saveInventory,
      getTotalStock,
      serviceVersionRecords,
      serviceVersionDialogVisible,
      selectedServiceVersion,
      filteredServiceVersionRecords,
      openServiceVersion,
      getServiceVersionBasicRows,
      ElMessage: feedback.ElMessage,
      defaultService,
      initSharingPricingStructure
    };
  }
  return pageSetup();
}
export default function ServicesBlock() {
  const model = useRimoModel(createPageState);
  const view = model.view;
  const {
    text
  } = useRimoEnvironment();
  return <RimoRoot model={model} pageKey="services" assets={{}}><div data-business-content="" data-rimo-layout="page"><div className="prototype-permission-switcher" aria-label="增值服務管理權限演示" data-rimo-layout="permissions"><span className="prototype-permission-switcher__label">{text("權限演示")}</span>
<RimoElement kind="el-radio-group" modelValue={view.permissionDemoMode} onModelChange={value => {
          model.write(["permissionDemoMode"], value);
        }} size="small" onChange={event => {
          view.setPermissionDemoMode?.(event);
        }}>{rimoEntries(view.permissionDemoOptions).map(([option], _itemIndex) => <Fragment key={option.value}><RimoElement kind="el-radio-button" key={option.value} label={option.value}>{rimoText(option.label)}</RimoElement></Fragment>)}</RimoElement></div>
<div className="flex justify-between items-end mb-6" data-rimo-layout="heading"><div><h1 className="text-2xl font-bold text-gray-800 tracking-tight">{text("增值服務管理")}</h1>
<p className="text-gray-500 text-sm mt-1">{text("管理門市租賃及分時租賃的增值服務、保險及設備。")}</p></div></div>
<RimoElement kind="el-tabs" modelValue={view.activeTab} onModelChange={value => {
        model.write(["activeTab"], value);
      }} className="rimo-page-tabs bg-white rounded-xl shadow-sm border border-gray-100 min-h-[500px]">{view.hasStoreBusinessPermission ? <><RimoElement kind="el-tab-pane" name="store" slots={{
            "label": _slot => <><span className="flex items-center gap-2"><RimoElement kind="el-icon"><RimoIcon name="Shop" /></RimoElement>
<span>{text("門市租賃")}</span></span></>
          }}><div className="p-6" data-rimo-layout="list"><div className="flex justify-between items-center mb-6"><div className="text-sm text-gray-500"><span className="font-bold text-gray-700">{text("說明：")}</span>
{text(" 管理門市業務下的實物設備庫存及基礎保險服務。\n                                ")}</div>
<div className="flex items-center gap-3"><RimoElement kind="el-button" plain={true} onClick={_event => {
                    view.openServiceVersion();
                  }}>{text("歷史版本")}</RimoElement>
<RimoElement kind="el-button" type="primary" size="large" className="shadow-md shadow-[color:var(--app-color-primary-shadow)]" onClick={_event => {
                    view.openServiceDialog(null);
                  }}><RimoElement kind="el-icon" className="mr-1"><RimoIcon name="Plus" /></RimoElement>
{text(" 新增門市服務\n                                    ")}</RimoElement></div></div>
<RimoElement kind="el-table" data={view.filteredServiceList} style={rimoStyle("width: 100%")}><RimoElement kind="el-table-column" prop="name" label="服務名稱" minWidth="180" slots={{
                  "default": ({
                    row
                  }) => <><div className="flex items-center"><div className="w-10 h-10 rounded-lg bg-[color:var(--app-color-primary-light-8)] flex items-center justify-center mr-3"><RimoElement kind="el-icon" className="text-[color:var(--app-color-primary)] text-lg"><RimoIcon name={row.icon} /></RimoElement></div>
<div><div className="font-medium text-gray-900">{rimoText(row.name)}</div>
<div className="text-xs text-gray-400">{rimoText(row.code)}</div></div></div></>
                }}></RimoElement>
<RimoElement kind="el-table-column" label="類型" width="100" slots={{
                  "default": ({
                    row
                  }) => <><RimoElement kind="el-tag" type={row.category === 'insurance' ? 'danger' : row.category === 'equipment' ? 'success' : 'info'} effect="plain" size="small">{rimoText(view.getCategoryLabel(row.category))}</RimoElement></>
                }}></RimoElement>
<RimoElement kind="el-table-column" label="適用會員" minWidth="120" slots={{
                  "default": ({
                    row
                  }) => <>{!row.membershipRestriction || row.membershipRestriction.length === 0 ? <><div className="text-gray-400 text-xs">{text("全部會員")}</div></> : <><div className="flex flex-wrap gap-1">{rimoEntries(row.membershipRestriction).map(([m], _itemIndex) => <Fragment key={m}><RimoElement kind="el-tag" key={m} size="small" type="info" effect="light">{rimoText(m)}</RimoElement></Fragment>)}</div></>}</>
                }}></RimoElement>
<RimoElement kind="el-table-column" label="價格" width="140" slots={{
                  "default": ({
                    row
                  }) => <><span className="font-bold text-orange-600">{text("¥")}{rimoText(row.price)}</span>
<span className="text-xs text-gray-400">{text("/")}{rimoText(row.priceUnit === 'day' ? '天' : row.priceUnit === 'hour' ? '時' : '次')}</span></>
                }}></RimoElement>
<RimoElement kind="el-table-column" label="庫存/數量" width="130" align="center" slots={{
                  "default": ({
                    row
                  }) => <>{row.trackInventory ? <><div><RimoElement kind="el-tag" type="warning" effect="plain" size="small">{text("按門店")}</RimoElement></div></> : <><div><span className="text-gray-400 text-xs">{text("無限庫存")}</span></div></>}
<div className="text-xs text-gray-400 mt-1">{text("限 ")}{rimoText(row.maxQuantity)}{text(" 件")}</div></>
                }}></RimoElement>
<RimoElement kind="el-table-column" prop="status" label="狀態" width="100" slots={{
                  "default": ({
                    row
                  }) => <><RimoElement kind="el-switch" modelValue={row.status} onModelChange={value => {
                      model.assign(row, "status", value);
                    }} activeValue={true} inactiveValue={false} style={rimoStyle("--el-switch-on-color: var(--app-color-primary);")}></RimoElement></>
                }}></RimoElement>
<RimoElement kind="el-table-column" label="操作" width="200" align="right" slots={{
                  "default": ({
                    row
                  }) => <><RimoElement kind="el-button" type="primary" link={true} onClick={_event => {
                      view.openServiceDialog(row);
                    }}>{text("編輯")}</RimoElement>
{row.trackInventory ? <><RimoElement kind="el-button" type="success" link={true} onClick={_event => {
                        view.openInventoryDialog(row);
                      }}>{text("庫存")}</RimoElement></> : null}
<RimoElement kind="el-button" type="danger" link={true} onClick={_event => {
                      view.deleteService(row);
                    }}>{text("刪除")}</RimoElement></>
                }}></RimoElement></RimoElement></div></RimoElement></> : null}
{view.hasSharingBusinessPermission ? <><RimoElement kind="el-tab-pane" name="sharing" slots={{
            "label": _slot => <><span className="flex items-center gap-2"><RimoElement kind="el-icon"><RimoIcon name="Clock" /></RimoElement>
<span>{text("分時租賃")}</span></span></>
          }}><div className="p-6" data-rimo-layout="list"><div className="flex justify-between items-center mb-6"><div className="text-sm text-gray-500"><span className="font-bold text-gray-700">{text("說明：")}</span>
{text(" 分時租車服務支持同站與異地差異化定價，且無實物庫存概念。\n                                ")}</div>
<RimoElement kind="el-button" type="primary" size="large" className="shadow-md shadow-[color:var(--app-color-primary-shadow)]" onClick={_event => {
                  view.openServiceDialog(null);
                }}><RimoElement kind="el-icon" className="mr-1"><RimoIcon name="Plus" /></RimoElement>
{text(" 新增分時服務\n                                ")}</RimoElement></div>
<RimoElement kind="el-table" data={view.filteredServiceList} style={rimoStyle("width: 100%")}><RimoElement kind="el-table-column" prop="name" label="服務名稱" minWidth="180" slots={{
                  "default": ({
                    row
                  }) => <><div className="flex items-center"><div className="w-10 h-10 rounded-lg bg-[color:var(--app-color-primary-light-8)] flex items-center justify-center mr-3"><RimoElement kind="el-icon" className="text-[color:var(--app-color-primary)] text-lg"><RimoIcon name={row.icon} /></RimoElement></div>
<div><div className="font-medium text-gray-900">{rimoText(row.name)}</div>
<div className="text-xs text-gray-400">{rimoText(row.code)}</div>
<div className="flex gap-1 mt-1">{row.scopes.includes('SHARING_ROUND') ? <><span className="text-[10px] bg-[color:var(--app-color-primary-light-9)] text-[color:var(--app-color-primary)] px-1 rounded">{text("分時-同站")}</span></> : null}
{row.scopes.includes('SHARING_ONEWAY') ? <><span className="text-[10px] bg-pink-50 text-pink-600 px-1 rounded">{text("分時-異地")}</span></> : null}</div></div></div></>
                }}></RimoElement>
<RimoElement kind="el-table-column" label="類型" width="100" slots={{
                  "default": ({
                    row
                  }) => <><RimoElement kind="el-tag" type={row.category === 'insurance' ? 'danger' : row.category === 'equipment' ? 'success' : 'info'} effect="plain" size="small">{rimoText(view.getCategoryLabel(row.category))}</RimoElement></>
                }}></RimoElement>
<RimoElement kind="el-table-column" label="適用會員" minWidth="120" slots={{
                  "default": ({
                    row
                  }) => <>{!row.membershipRestriction || row.membershipRestriction.length === 0 ? <><div className="text-gray-400 text-xs">{text("全部會員")}</div></> : <><div className="flex flex-wrap gap-1">{rimoEntries(row.membershipRestriction).map(([m], _itemIndex) => <Fragment key={m}><RimoElement kind="el-tag" key={m} size="small" type="info" effect="light">{rimoText(m)}</RimoElement></Fragment>)}</div></>}</>
                }}></RimoElement>
<RimoElement kind="el-table-column" label="價格機制" width="180" slots={{
                  "default": ({
                    row
                  }) => <><div className="text-xs text-gray-500 italic">{row.scopes.includes('SHARING_ROUND') ? <><div>{text("同站: 差異化定價")}</div></> : null}
{row.scopes.includes('SHARING_ONEWAY') ? <><div>{text("異地: 差異化定價")}</div></> : null}</div></>
                }}></RimoElement>
<RimoElement kind="el-table-column" label="限制" width="130" align="center" slots={{
                  "default": ({
                    row
                  }) => <><div className="text-xs text-gray-400 mt-1">{text("限 ")}{rimoText(row.maxQuantity)}{text(" 件")}</div></>
                }}></RimoElement>
<RimoElement kind="el-table-column" prop="status" label="狀態" width="100" slots={{
                  "default": ({
                    row
                  }) => <><RimoElement kind="el-switch" modelValue={row.status} onModelChange={value => {
                      model.assign(row, "status", value);
                    }} activeValue={true} inactiveValue={false} style={rimoStyle("--el-switch-on-color: var(--app-color-primary);")}></RimoElement></>
                }}></RimoElement>
<RimoElement kind="el-table-column" label="操作" width="200" align="right" slots={{
                  "default": ({
                    row
                  }) => <><RimoElement kind="el-button" type="primary" link={true} onClick={_event => {
                      view.openServiceDialog(row);
                    }}>{text("編輯")}</RimoElement>
<RimoElement kind="el-button" type="danger" link={true} onClick={_event => {
                      view.deleteService(row);
                    }}>{text("刪除")}</RimoElement></>
                }}></RimoElement></RimoElement></div></RimoElement></> : null}</RimoElement></div><RimoElement kind="el-dialog" modelValue={view.serviceDialogVisible} onModelChange={value => {
      model.write(["serviceDialogVisible"], value);
    }} title={view.isEditService ? '編輯增值服務' : view.activeTab === 'store' ? '新增門市服務' : '新增分時服務'} width="800px" top="5vh" className="services-overlay" slots={{
      "footer": _slot => <><RimoElement kind="el-button" onClick={_event => {
          model.write(["serviceDialogVisible"], false);
        }}>{text("取消")}</RimoElement>
<RimoElement kind="el-button" type="primary" onClick={event => {
          view.saveService?.(event);
        }}>{text("保存")}</RimoElement></>
    }}>{() => <><RimoElement kind="el-form" model={view.currentService} labelWidth="100px" labelPosition="top">{view.activeTab === 'sharing' ? <><div className="bg-[color:var(--app-color-primary-light-9)] p-4 rounded-lg mb-4 border border-[color:var(--app-color-primary-light-8)]"><RimoElement kind="el-form-item" label="適用場景 (必選)" required={true} className="mb-0"><RimoElement kind="el-checkbox-group" modelValue={view.currentService.scopes} onModelChange={value => {
                  model.write(["currentService", "scopes"], value);
                }} onChange={event => {
                  view.initSharingPricingStructure?.(event);
                }}><RimoElement kind="el-checkbox" label="SHARING_ROUND">{text("同站租還 (Round Trip)")}</RimoElement>
<RimoElement kind="el-checkbox" label="SHARING_ONEWAY">{text("異地還車 (One-Way)")}</RimoElement></RimoElement>
<div className="text-xs text-[color:var(--app-color-primary-light-5)] mt-1">{text("* 勾選不同場景將分別配置價格")}</div></RimoElement></div></> : null}
<RimoElement kind="el-row" gutter={24}><RimoElement kind="el-col" span={12}><RimoElement kind="el-form-item" label="服務名稱" required={true}><RimoElement kind="el-input" modelValue={view.currentService.name} onModelChange={value => {
                  model.write(["currentService", "name"], value);
                }} placeholder="例如：全車駕乘險" size="large"></RimoElement></RimoElement></RimoElement>
<RimoElement kind="el-col" span={12}><RimoElement kind="el-form-item" label="服務編碼" required={true}><RimoElement kind="el-input" modelValue={view.currentService.code} onModelChange={value => {
                  model.write(["currentService", "code"], value);
                }} placeholder="例如：INSURANCE_FULL" size="large"></RimoElement></RimoElement></RimoElement></RimoElement>
<RimoElement kind="el-row" gutter={24}><RimoElement kind="el-col" span={8}><RimoElement kind="el-form-item" label="服務類型"><RimoElement kind="el-select" modelValue={view.currentService.category} onModelChange={value => {
                  model.write(["currentService", "category"], value);
                }} size="large" style={rimoStyle("width: 100%")}><RimoElement kind="el-option" label="保險類" value="insurance"></RimoElement>
<RimoElement kind="el-option" label="設備類" value="equipment"></RimoElement>
<RimoElement kind="el-option" label="服務類" value="service"></RimoElement></RimoElement></RimoElement></RimoElement>
<RimoElement kind="el-col" span={8}><RimoElement kind="el-form-item" label="圖標"><RimoElement kind="el-select" modelValue={view.currentService.icon} onModelChange={value => {
                  model.write(["currentService", "icon"], value);
                }} size="large" style={rimoStyle("width: 100%")}><RimoElement kind="el-option" label="保險盾牌" value="Shield"></RimoElement>
<RimoElement kind="el-option" label="座椅" value="Seat"></RimoElement>
<RimoElement kind="el-option" label="GPS定位" value="Location"></RimoElement>
<RimoElement kind="el-option" label="WiFi" value="Connection"></RimoElement>
<RimoElement kind="el-option" label="禮品" value="Present"></RimoElement>
<RimoElement kind="el-option" label="其他" value="More"></RimoElement></RimoElement></RimoElement></RimoElement>
<RimoElement kind="el-col" span={8}><RimoElement kind="el-form-item" label="會員限制"><RimoElement kind="el-select" modelValue={view.currentService.membershipRestriction} onModelChange={value => {
                  model.write(["currentService", "membershipRestriction"], value);
                }} multiple={true} collapseTags={true} placeholder="不限" size="large" style={rimoStyle("width: 100%")}>{rimoEntries(view.membershipPlans).map(([plan], _itemIndex) => <Fragment key={plan.id}><RimoElement kind="el-option" key={plan.id} label={plan.name} value={plan.id}></RimoElement></Fragment>)}</RimoElement></RimoElement></RimoElement></RimoElement>
{view.isStoreScope ? <><div><RimoElement kind="el-divider" contentPosition="left">{text("門市租賃定價")}</RimoElement>
<RimoElement kind="el-row" gutter={24}><RimoElement kind="el-col" span={8}><RimoElement kind="el-form-item" label="價格" required={true}><RimoElement kind="el-input-number" modelValue={view.currentService.price} onModelChange={value => {
                      model.write(["currentService", "price"], value);
                    }} min={0} precision={2} size="large" style={rimoStyle("width: 100%")}></RimoElement></RimoElement></RimoElement>
<RimoElement kind="el-col" span={8}><RimoElement kind="el-form-item" label="計價單位"><RimoElement kind="el-select" modelValue={view.currentService.priceUnit} onModelChange={value => {
                      model.write(["currentService", "priceUnit"], value);
                    }} size="large" style={rimoStyle("width: 100%")}><RimoElement kind="el-option" label="按天" value="day"></RimoElement>
<RimoElement kind="el-option" label="按次" value="order"></RimoElement></RimoElement></RimoElement></RimoElement>
<RimoElement kind="el-col" span={8}><RimoElement kind="el-form-item" label="最大加購數量"><RimoElement kind="el-input-number" modelValue={view.currentService.maxQuantity} onModelChange={value => {
                      model.write(["currentService", "maxQuantity"], value);
                    }} min={1} max={10} size="large" style={rimoStyle("width: 100%")}></RimoElement></RimoElement></RimoElement></RimoElement>
<RimoElement kind="el-row" gutter={24}><RimoElement kind="el-col" span={12}><RimoElement kind="el-form-item" label="庫存管理"><RimoElement kind="el-switch" modelValue={view.currentService.trackInventory} onModelChange={value => {
                      model.write(["currentService", "trackInventory"], value);
                    }} activeText="按門店管理" inactiveText="無限供應"></RimoElement></RimoElement></RimoElement>
<RimoElement kind="el-col" span={12}><RimoElement kind="el-form-item" label="狀態"><RimoElement kind="el-switch" modelValue={view.currentService.status} onModelChange={value => {
                      model.write(["currentService", "status"], value);
                    }} activeText="啓用" inactiveText="禁用"></RimoElement></RimoElement></RimoElement></RimoElement></div></> : null}
{view.isSharingScope ? <><div>{view.currentService.scopes.includes('SHARING_ROUND') ? <><div className="mb-6"><RimoElement kind="el-divider" contentPosition="left"><span className="text-[color:var(--app-color-primary)] font-bold">{text("同站租還 -\n                                差異化定價")}</span></RimoElement>
<RimoElement kind="el-table" data={view.vehicleGroups} border={true} size="small" style={rimoStyle("width: 100%")}><RimoElement kind="el-table-column" prop="name" label="適用車組" width="180"></RimoElement>
<RimoElement kind="el-table-column" label="時服務費 (元/小時)" slots={{
                      "default": ({
                        row
                      }) => <>{view.currentService.sharingPricing['SHARING_ROUND'][row.id] ? <><RimoElement kind="el-input-number" modelValue={view.currentService.sharingPricing['SHARING_ROUND'][row.id].hourly} onModelChange={value => {
                            model.write(["currentService", "sharingPricing", 'SHARING_ROUND', row.id, "hourly"], value);
                          }} min={0} precision={2} size="small" controlsPosition="right" style={rimoStyle("width: 100%")}></RimoElement></> : null}</>
                    }}></RimoElement>
<RimoElement kind="el-table-column" label="日封頂 (元/天)" slots={{
                      "default": ({
                        row
                      }) => <>{view.currentService.sharingPricing['SHARING_ROUND'][row.id] ? <><RimoElement kind="el-input-number" modelValue={view.currentService.sharingPricing['SHARING_ROUND'][row.id].cap} onModelChange={value => {
                            model.write(["currentService", "sharingPricing", 'SHARING_ROUND', row.id, "cap"], value);
                          }} min={0} precision={2} size="small" controlsPosition="right" style={rimoStyle("width: 100%")}></RimoElement></> : null}</>
                    }}></RimoElement></RimoElement></div></> : null}
{view.currentService.scopes.includes('SHARING_ONEWAY') ? <><div className="mb-6"><RimoElement kind="el-divider" contentPosition="left"><span className="text-pink-600 font-bold">{text("異地還車 -\n                                差異化定價")}</span></RimoElement>
<RimoElement kind="el-table" data={view.vehicleGroups} border={true} size="small" style={rimoStyle("width: 100%")}><RimoElement kind="el-table-column" prop="name" label="適用車組" width="180"></RimoElement>
<RimoElement kind="el-table-column" label="時服務費 (元/小時)" slots={{
                      "default": ({
                        row
                      }) => <>{view.currentService.sharingPricing['SHARING_ONEWAY'][row.id] ? <><RimoElement kind="el-input-number" modelValue={view.currentService.sharingPricing['SHARING_ONEWAY'][row.id].hourly} onModelChange={value => {
                            model.write(["currentService", "sharingPricing", 'SHARING_ONEWAY', row.id, "hourly"], value);
                          }} min={0} precision={2} size="small" controlsPosition="right" style={rimoStyle("width: 100%")}></RimoElement></> : null}</>
                    }}></RimoElement>
<RimoElement kind="el-table-column" label="日封頂 (元/天)" slots={{
                      "default": ({
                        row
                      }) => <>{view.currentService.sharingPricing['SHARING_ONEWAY'][row.id] ? <><RimoElement kind="el-input-number" modelValue={view.currentService.sharingPricing['SHARING_ONEWAY'][row.id].cap} onModelChange={value => {
                            model.write(["currentService", "sharingPricing", 'SHARING_ONEWAY', row.id, "cap"], value);
                          }} min={0} precision={2} size="small" controlsPosition="right" style={rimoStyle("width: 100%")}></RimoElement></> : null}</>
                    }}></RimoElement></RimoElement></div></> : null}</div></> : null}
<RimoElement kind="el-form-item" label="服務說明"><RimoElement kind="el-input" modelValue={view.currentService.description} onModelChange={value => {
              model.write(["currentService", "description"], value);
            }} type="textarea" rows={3} placeholder="描述服務內容和注意事項..."></RimoElement></RimoElement></RimoElement></>}</RimoElement>
<RimoElement kind="el-dialog" modelValue={view.inventoryDialogVisible} onModelChange={value => {
      model.write(["inventoryDialogVisible"], value);
    }} title={'門店庫存管理'} width="720px" className="inventory-dialog services-overlay" slots={{
      "footer": _slot => <><div className="flex justify-between items-center"><span className="text-sm text-gray-400">{text("提示：修改後請點擊保存以生效")}</span>
<div><RimoElement kind="el-button" onClick={_event => {
              model.write(["inventoryDialogVisible"], false);
            }}>{text("取消")}</RimoElement>
<RimoElement kind="el-button" type="primary" onClick={event => {
              view.saveInventory?.(event);
            }}><RimoElement kind="el-icon" className="mr-1"><RimoIcon name="Check" /></RimoElement>
{text(" 保存庫存\n                        ")}</RimoElement></div></div></>
    }}>{() => <><div className="bg-gradient-to-r from-[color:var(--app-color-primary)] to-[color:var(--app-color-primary)] rounded-xl p-5 mb-6 text-white"><div className="flex items-center justify-between"><div className="flex items-center"><div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mr-4"><RimoElement kind="el-icon" className="text-2xl"><RimoIcon name={view.inventoryService.icon || 'More'} /></RimoElement></div>
<div><h3 className="font-bold text-lg">{rimoText(view.inventoryService.name)}</h3>
<p className="text-white/70 text-sm">{rimoText(view.inventoryService.code)}</p></div></div>
<div className="text-right"><div className="text-2xl font-bold">{rimoText(view.getTotalStock())}</div>
<div className="text-white/70 text-sm">{text("總庫存")}</div></div></div></div>
<div className="space-y-3 max-h-[400px] overflow-y-auto custom-scroll pr-2">{rimoEntries(view.storeInventory).map(([store], _itemIndex) => <Fragment key={store.storeId}><div key={store.storeId} className="bg-gray-50 rounded-xl p-4 border border-gray-100 hover:shadow-md transition-shadow"><div className="flex items-center justify-between"><div className="flex items-center"><div className="w-10 h-10 bg-white rounded-lg border flex items-center justify-center mr-3 shadow-sm"><RimoElement kind="el-icon" className="text-gray-500"><RimoIcon name="OfficeBuilding" /></RimoElement></div>
<div><div className="font-medium text-gray-800">{rimoText(store.storeName)}</div>
<div className="text-xs text-gray-400">{text("ID: ")}{rimoText(store.storeId)}</div></div></div>
<div className="flex items-center gap-6"><div className="text-center"><div className="text-xs text-gray-400 mb-1">{text("庫存")}</div>
<RimoElement kind="el-input-number" modelValue={store.stock} onModelChange={value => {
                      model.assign(store, "stock", value);
                    }} min={0} size="small" style={rimoStyle("width: 100px")} controlsPosition="right"></RimoElement></div>
<div className="text-center w-14"><div className="text-xs text-gray-400 mb-1">{text("已佔用")}</div>
<div className="text-orange-500 font-bold text-lg">{rimoText(store.reserved)}</div></div>
<div className="text-center w-14"><div className="text-xs text-gray-400 mb-1">{text("可用")}</div>
<div className={rimoClass(["font-bold text-lg", rimoClass(store.stock - store.reserved > 0 ? 'text-green-600' : 'text-red-500')])}>{text("\n                                    ")}{rimoText(store.stock - store.reserved)}{text("\n                                ")}</div></div></div></div></div></Fragment>)}</div></>}</RimoElement>
<RimoElement kind="el-dialog" modelValue={view.serviceVersionDialogVisible} onModelChange={value => {
      model.write(["serviceVersionDialogVisible"], value);
    }} title="增值服務歷史版本" width="880px" destroyOnClose={true} className="services-overlay" slots={{
      "footer": _slot => <><RimoElement kind="el-button" onClick={_event => {
          model.write(["serviceVersionDialogVisible"], false);
        }}>{text("關閉")}</RimoElement></>
    }}>{() => <>{view.selectedServiceVersion ? <><div className="grid grid-cols-3 gap-4"><div className="col-span-1 border border-gray-100 rounded-lg overflow-hidden"><div className="px-3 py-2 bg-gray-50 text-xs font-bold text-gray-500">{text("版本列表")}</div>
<div className="divide-y divide-gray-100 max-h-[420px] overflow-y-auto">{rimoEntries(view.filteredServiceVersionRecords).map(([version], _itemIndex) => <Fragment key={version.version}><button key={version.version} className={rimoClass(["w-full text-left px-3 py-3 hover:bg-[color:var(--app-color-primary-light-9)] transition-colors", rimoClass(view.selectedServiceVersion.version === version.version ? 'bg-[color:var(--app-color-primary-light-9)]' : 'bg-white')])} onClick={_event => {
                    model.write(["selectedServiceVersion"], version);
                  }}><div className="font-mono text-xs text-[color:var(--app-color-primary)] font-bold">{rimoText(version.version)}</div>
<div className="text-sm text-gray-800 mt-1">{rimoText(version.serviceName)}</div>
<div className="text-xs text-gray-400 mt-1">{rimoText(version.savedAt)}{text(" · ")}{rimoText(version.status)}</div></button></Fragment>)}</div></div>
<div className="col-span-2 space-y-4"><div className="rounded-lg border border-[color:var(--app-color-primary-light-8)] bg-[color:var(--app-color-primary-light-9)] px-4 py-3"><div className="font-mono font-bold text-gray-900">{rimoText(view.selectedServiceVersion.version)}</div>
<div className="text-sm text-gray-700 mt-1">{rimoText(view.selectedServiceVersion.serviceName)}</div>
<div className="text-xs text-gray-500 mt-1">{text("保存人：")}{rimoText(view.selectedServiceVersion.savedBy)}{text(" · ")}{rimoText(view.selectedServiceVersion.savedAt)}</div></div>
<RimoElement kind="el-table" data={view.getServiceVersionBasicRows(view.selectedServiceVersion)} border={true} size="small"><RimoElement kind="el-table-column" prop="label" label="配置項" width="170" showOverflowTooltip={true}></RimoElement>
<RimoElement kind="el-table-column" prop="value" label="內容" minWidth="320" showOverflowTooltip={true}></RimoElement></RimoElement>
<div className="font-bold text-gray-800">{text("價格與庫存")}</div>
<RimoElement kind="el-table" data={view.selectedServiceVersion.pricingRows} border={true} size="small"><RimoElement kind="el-table-column" prop="scope" label="適用範圍" minWidth="160" showOverflowTooltip={true}></RimoElement>
<RimoElement kind="el-table-column" prop="pricing" label="價格規則" minWidth="180" showOverflowTooltip={true}></RimoElement>
<RimoElement kind="el-table-column" prop="limit" label="數量限制" width="120" showOverflowTooltip={true}></RimoElement>
<RimoElement kind="el-table-column" prop="inventory" label="庫存口徑" minWidth="160" showOverflowTooltip={true}></RimoElement>
<RimoElement kind="el-table-column" prop="remark" label="說明" minWidth="220" showOverflowTooltip={true}></RimoElement></RimoElement></div></div></> : null}</>}</RimoElement></RimoRoot>;
}