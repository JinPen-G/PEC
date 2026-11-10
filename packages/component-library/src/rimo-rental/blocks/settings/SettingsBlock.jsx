import { Fragment } from 'react';
import { useRimoModel, rimoEntries } from '../../lib/rimo-model.js';
import { RimoRoot, RimoIcon, useRimoEnvironment } from '../../lib/RimoEnvironment.jsx';
import { RimoElement, RimoTable, rimoClass, rimoStyle, rimoText } from '../../lib/RimoElements.jsx';
import './settings.css';
function createPageState(model) {
  const document = model.document;
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
      record: reactive,
      cell: ref,
      derived: computed,
      watch: watch
    } = model;
    const {
      ElMessage: _ElMessage
    } = feedback;
    const membershipPlans = ref([{
      id: 1,
      name: '普通會員'
    }, {
      id: 2,
      name: '白銀會員'
    }, {
      id: 3,
      name: '黃金會員'
    }, {
      id: 4,
      name: '鉑金會員'
    }, {
      id: 5,
      name: '鑽石會員'
    }, {
      id: 6,
      name: '企業會員'
    }]);
    const settings = reactive({
      onlinePaymentEnabled: true,
      onlinePaymentMethods: ['linepay', 'jkopay'],
      offlinePaymentEnabled: true,
      offlinePaymentMethods: ['cash', 'card'],
      pendingPaymentHoldEnabled: true,
      pendingPaymentHoldMinutes: 30,
      authorizationMode: 'percentage',
      authorizationAmount: 3000,
      authorizationPercent: 30,
      authorizationHandlingModes: ['guarantee', 'rent_transfer'],
      crossCityFee: 200,
      vehicleLockHours: 2,
      orderIntervalMinutes: 60,
      benchmarkDailyMileage: 150,
      dispatchWeightMileage: 0,
      dispatchWeightRevenue: 100,
      dispatchWeightAge: 0,
      hourlyToDailyThreshold: 5,
      hourlyPriceMode: 'percentage',
      hourlyPricePercentage: 10,
      hourlyRatePrice: 50,
      hourlyFixedPrice: 200,
      allowEarlyPickup: true,
      earlyPickupGraceMinutes: 30,
      pickupLockEnabled: true,
      pickupLockMinutes: 30,
      allowEarlyReturn: true,
      earlyReturnRefund: 'full_days',
      noShowHoldHours: 2,
      noShowAutoCancel: true,
      noShowTargetStatus: 'no_show',
      noShowPenaltyEnabled: true,
      noShowPenaltyType: 'fixed',
      noShowPenaltyFixed: 200,
      noShowPenaltyPercent: 50,
      freeCancelAfterOrderEnabled: true,
      freeCancelAfterOrderMinutes: 30,
      freeCancelAfterOrderUnit: 'minutes',
      freeCancelBeforePickupEnabled: true,
      freeCancelBeforePickupHours: 24,
      freeCancelRefund: 'full',
      freeCancelFee: 50,
      penaltyCancelType: 'auth_percent',
      penaltyCancelFixed: 200,
      penaltyCancelPercent: 30,
      penaltyCancelTiered: true,
      penaltyCancelTiers: [{
        hours: 24,
        amount: 200,
        percent: 20
      }, {
        hours: 12,
        amount: 300,
        percent: 50
      }, {
        hours: 2,
        amount: 500,
        percent: 100
      }],
      overtimeGracePeriod: 30,
      overtimePenaltyEnabled: true,
      overtimePenaltyType: 'fixed',
      overtimePenaltyAmount: 100,
      overtimeMaxEnabled: true,
      overtimeMaxAmount: 500,
      allowExtension: true,
      allowOverdueExtension: true,
      extensionConflictPolicy: 'reassign_or_reject',
      extensionSettlementModes: ['immediate', 'return_settlement'],
      extensionImmediateCollectHours: 24,
      extensionImmediateCollectAmount: 1000,
      extensionForceCollectRisk: true
    });
    const cardLocks = reactive({
      transaction: true,
      crossCity: true,
      dispatch: true,
      hourlyDaily: true,
      pickupReturn: true,
      cancellation: true,
      extension: true
    });
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
      value: 'SHARING_BOTH'
    }, {
      label: '分時僅同站',
      value: 'SHARING_SAME'
    }, {
      label: '分時僅甲乙',
      value: 'SHARING_ONEWAY'
    }];
    const rentalRuleTabPermissions = reactive({
      store: true,
      sharing: true
    });
    const rentalRuleTabs = [{
      key: 'store',
      label: '門市租賃'
    }, {
      key: 'sharing',
      label: '分時租賃'
    }];
    const canViewRentalRuleTab = key => rentalRuleTabPermissions[key] !== false;
    const visibleRentalRuleTabs = computed(() => rentalRuleTabs.filter(tab => canViewRentalRuleTab(tab.key)));
    const ensureActiveRentalRuleTab = () => {
      if (!canViewRentalRuleTab(activeTab.value)) {
        activeTab.value = visibleRentalRuleTabs.value[0]?.key || '';
      }
    };
    watch(visibleRentalRuleTabs, ensureActiveRentalRuleTab, {
      immediate: true
    });
    const rulePermissions = reactive({
      store: {
        transaction: true,
        crossCity: true,
        dispatch: true,
        hourlyDaily: true,
        pickupReturn: true,
        cancellation: true,
        extension: true
      },
      sharing: {
        global: true,
        roundTrip: true,
        roundTripCancel: true,
        roundTripOvertime: true,
        roundTripPickup: true,
        oneWay: true,
        oneWayPickup: true,
        oneWayRestrict: true,
        oneWayPreauth: true
      }
    });
    const setPermissionDemoMode = mode => {
      permissionDemoMode.value = mode;
      const allowStore = ['FULL', 'STORE_ONLY'].includes(mode);
      const allowSharing = mode !== 'STORE_ONLY';
      const allowRoundTrip = ['FULL', 'SHARING_BOTH', 'SHARING_SAME'].includes(mode);
      const allowOneWay = ['FULL', 'SHARING_BOTH', 'SHARING_ONEWAY'].includes(mode);
      rentalRuleTabPermissions.store = allowStore;
      rentalRuleTabPermissions.sharing = allowSharing;
      Object.keys(rulePermissions.store).forEach(key => {
        rulePermissions.store[key] = allowStore;
      });
      rulePermissions.sharing.global = allowSharing;
      ['roundTrip', 'roundTripCancel', 'roundTripOvertime', 'roundTripPickup'].forEach(key => {
        rulePermissions.sharing[key] = allowSharing && allowRoundTrip;
      });
      ['oneWay', 'oneWayPickup', 'oneWayRestrict', 'oneWayPreauth'].forEach(key => {
        rulePermissions.sharing[key] = allowSharing && allowOneWay;
      });
      ensureActiveRentalRuleTab();
    };
    const storeRuleNav = [{
      key: 'transaction',
      anchor: 'store-transaction',
      label: '交易與授權'
    }, {
      key: 'crossCity',
      anchor: 'store-cross-city',
      label: '異地還車'
    }, {
      key: 'dispatch',
      anchor: 'store-dispatch',
      label: '調度與派車'
    }, {
      key: 'hourlyDaily',
      anchor: 'store-hourly-daily',
      label: '時租與日租'
    }, {
      key: 'pickupReturn',
      anchor: 'store-pickup-return',
      label: '取還車規則'
    }, {
      key: 'cancellation',
      anchor: 'store-cancellation',
      label: '取消與超時'
    }, {
      key: 'extension',
      anchor: 'store-extension',
      label: '續租規則'
    }];
    const sharingRuleNavGroups = [{
      label: '',
      items: [{
        key: 'global',
        anchor: 'sharing-global',
        label: '分時共用規則'
      }]
    }, {
      label: '同站租還',
      items: [{
        key: 'roundTrip',
        anchor: 'sharing-roundtrip',
        label: '規則總覽'
      }, {
        key: 'roundTripCancel',
        anchor: 'sharing-roundtrip-cancel',
        label: '取消與違約'
      }, {
        key: 'roundTripOvertime',
        anchor: 'sharing-roundtrip-overtime',
        label: '超時規則'
      }, {
        key: 'roundTripPickup',
        anchor: 'sharing-roundtrip-pickup',
        label: '取還設置'
      }]
    }, {
      label: '甲租乙還',
      items: [{
        key: 'oneWay',
        anchor: 'sharing-oneway',
        label: '規則總覽'
      }, {
        key: 'oneWayPickup',
        anchor: 'sharing-oneway-pickup',
        label: '預約保留時長'
      }, {
        key: 'oneWayRestrict',
        anchor: 'sharing-oneway-restrict',
        label: '爽約/取消限制'
      }, {
        key: 'oneWayPreauth',
        anchor: 'sharing-oneway-preauth',
        label: '預授權規則'
      }]
    }];
    const sharingRuleParents = {
      roundTripCancel: 'roundTrip',
      roundTripOvertime: 'roundTrip',
      roundTripPickup: 'roundTrip',
      oneWayPickup: 'oneWay',
      oneWayRestrict: 'oneWay',
      oneWayPreauth: 'oneWay'
    };
    const canViewStoreRule = key => rulePermissions.store[key] !== false;
    const canViewSharingRule = key => {
      const parentKey = sharingRuleParents[key];
      return rulePermissions.sharing[key] !== false && (!parentKey || rulePermissions.sharing[parentKey] !== false);
    };
    const visibleStoreRuleNav = computed(() => storeRuleNav.filter(item => canViewStoreRule(item.key)));
    const visibleSharingRuleNavGroups = computed(() => sharingRuleNavGroups.map(group => ({
      ...group,
      items: group.items.filter(item => canViewSharingRule(item.key))
    })).filter(group => group.items.length > 0));
    const scrollToRule = anchor => {
      document.getElementById(anchor)?.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    };
    const sharingSettings = reactive({
      preAuthMultiplier: 2.0,
      lowFuelThreshold: 20,
      lowFuelFee: 100,
      freeCancelBeforePickupHours: 24,
      freeCancelBeforePickupEnabled: true,
      freeCancelAfterOrderEnabled: true,
      freeCancelAfterOrderMinutes: 15,
      freeCancelAfterOrderUnit: 'minutes',
      penaltyCancelTiers: [{
        hours: 24,
        percent: 20
      }, {
        hours: 4,
        percent: 50
      }, {
        hours: 1,
        percent: 100
      }],
      tempCancelLadder: [],
      hourlyToDailyThreshold: 5,
      overtimeGracePeriod: 30,
      overtimePenaltyEnabled: true,
      overtimePenaltyTiers: [{
        minutes: 60,
        amount: 50
      }, {
        minutes: 120,
        amount: 100
      }],
      overtimeMaxEnabled: true,
      overtimeMaxAmount: 600,
      earlyPickupMinutes: 15,
      earlyReturnRefundRatio: 100,
      earlyReturnRefundChannel: 'points',
      allowCustomerCancel: true,
      customerCancelLeadMinutes: 60,
      customerCancelAudit: false,
      orderIntervalBuffer: 30,
      oneWayPickupDefaultMinutes: 30,
      oneWayPickupTiers: [{
        levels: ['白銀會員', '黃金會員'],
        minutes: 45
      }],
      oneWayRestrictEnabled: true,
      oneWayRestrictWindow: 24,
      oneWayRestrictMaxCancels: 3,
      oneWayRestrictBanMinutes: 120,
      oneWayRestrictTiers: [],
      oneWayPreAuthRentHours: 48,
      oneWayPreAuthCycleMinutes: 1440
    });
    const sharingCardLocks = reactive({
      global: true,
      roundTrip: true,
      oneWay: true
    });
    let originalSnapshot = JSON.stringify(settings);
    const buildCurrentStoreRuleSections = () => [{
      title: '交易與授權',
      desc: '設定門市租賃的支付方式和預授權策略。',
      items: [{
        label: '待支付資源保留',
        value: '開啓'
      }, {
        label: '保留時長',
        value: '30 分鐘'
      }, {
        label: '超時處理',
        value: '取消訂單並釋放庫存'
      }, {
        label: '派車限制',
        value: '待支付不參與派車'
      }, {
        label: '線上交易',
        value: '啓用（LINE Pay / 街口支付 / 綠界金流）'
      }, {
        label: '線下交易',
        value: '啓用（現金 / 刷卡 POS / 轉賬）'
      }, {
        label: '授權額度模式',
        value: '租金比例模式'
      }, {
        label: '固定額度',
        value: '-'
      }, {
        label: '租金比例',
        value: '30%'
      }, {
        label: '取車資金處理口徑',
        value: '履約擔保 / 預授權轉租金'
      }, {
        label: '企業月結口徑',
        value: '不發起客戶支付或預授權，最終費用進入企業賬單'
      }]
    }, {
      title: '異地還車',
      desc: '設定異地還車費用。',
      items: [{
        label: '異地還車費',
        value: '¥200/次'
      }]
    }, {
      title: '調度與派車',
      desc: '車輛排程看板限制和智能派車權重配置。',
      items: [{
        label: '車輛排程看板鎖定時間',
        value: '2 小時前鎖定'
      }, {
        label: '訂單間隔時間',
        value: '60 分鐘'
      }, {
        label: '基準日均里程',
        value: '150 km/天'
      }, {
        label: '里程權重',
        value: '0%'
      }, {
        label: '營收權重',
        value: '100%'
      }, {
        label: '車齡權重',
        value: '0%'
      }]
    }, {
      title: '時租與日租',
      desc: '時租轉日租規則和不滿日租定價。',
      items: [{
        label: '起租規則',
        value: '起租 24 小時'
      }, {
        label: '最小計費單位',
        value: '不足 1 小時按 1 小時'
      }, {
        label: '時租轉日租時間',
        value: '第 5 小時起算 1 天'
      }, {
        label: '不滿日租時的時租價格',
        value: '按日租百分比'
      }, {
        label: '每小時按日租',
        value: '10%'
      }, {
        label: '時租單價',
        value: '-'
      }, {
        label: '固定金額',
        value: '-'
      }]
    }, {
      title: '取還車規則',
      desc: '提前取車、提前還車、未取車的處理規則。',
      items: [{
        label: '允許提前取車',
        value: '是'
      }, {
        label: '免費寬限時間',
        value: '30 分鐘'
      }, {
        label: '啓用履約操作鎖',
        value: '是'
      }, {
        label: '鎖有效期',
        value: '30 分鐘'
      }, {
        label: '允許提前還車',
        value: '是'
      }, {
        label: '退款計算規則',
        value: '僅退還整天租金'
      }, {
        label: '保留車輛時長',
        value: '2 小時'
      }, {
        label: '自動釋放資源',
        value: '是'
      }, {
        label: '處理後狀態',
        value: '爽約'
      }, {
        label: '爽約違約金',
        value: '收取'
      }, {
        label: '爽約違約金計算方式',
        value: '固定金額'
      }, {
        label: '爽約違約金固定金額',
        value: '¥200'
      }, {
        label: '爽約違約金預授權比例',
        value: '-'
      }]
    }, {
      title: '取消與超時規則',
      desc: '免責取消、有責取消條件及超時還車費用。',
      items: [{
        label: '下單後限時取消',
        value: '開啓'
      }, {
        label: '下單後免責時限',
        value: '30 分鐘'
      }, {
        label: '取車前提前取消',
        value: '開啓'
      }, {
        label: '取車前免責時限',
        value: '24 小時'
      }, {
        label: '免責取消退款方式',
        value: '全額退款'
      }, {
        label: '免責取消手續費',
        value: '-'
      }, {
        label: '有責取消違約金計算方式',
        value: '預授權比例'
      }, {
        label: '有責取消固定金額',
        value: '-'
      }, {
        label: '有責取消預授權比例',
        value: '30%'
      }, {
        label: '是否階梯扣費',
        value: '是'
      }, {
        label: '階梯規則 1',
        value: '取車前 ≤24 小時扣 20%'
      }, {
        label: '階梯規則 2',
        value: '取車前 ≤12 小時扣 50%'
      }, {
        label: '階梯規則 3',
        value: '取車前 ≤2 小時扣 100%'
      }, {
        label: '超時免費寬限',
        value: '30 分鐘'
      }, {
        label: '超時罰款',
        value: '開啓'
      }, {
        label: '超時罰款類型',
        value: '固定金額'
      }, {
        label: '超時罰款數額',
        value: '¥100'
      }, {
        label: '超時費封頂',
        value: '開啓'
      }, {
        label: '超時費封頂金額',
        value: '¥500'
      }]
    }, {
      title: '續租規則',
      desc: '延長用車、逾期補辦續租、庫存衝突和費用處理。',
      items: [{
        label: '允許延長用車',
        value: '是'
      }, {
        label: '允許逾期補辦續租',
        value: '是'
      }, {
        label: '後續訂單衝突',
        value: '先改派後續訂單，否則拒絕續租'
      }, {
        label: '可選結算方式',
        value: '立即收款 / 還車時結算'
      }, {
        label: '超過時長必須收款',
        value: '24 小時'
      }, {
        label: '超過金額必須收款',
        value: '¥1000'
      }, {
        label: '風險客戶必須收款',
        value: '是'
      }, {
        label: '企業月結口徑',
        value: '費用統一進入企業賬單'
      }]
    }];
    const buildLegacyStoreRuleSections = () => [{
      title: '交易與授權',
      desc: '舊版客戶自付訂單支付與預授權策略。',
      items: [{
        label: '待支付資源保留',
        value: '開啓'
      }, {
        label: '保留時長',
        value: '20 分鐘'
      }, {
        label: '超時處理',
        value: '取消訂單並釋放庫存'
      }, {
        label: '派車限制',
        value: '待支付不參與派車'
      }, {
        label: '線上交易',
        value: '啓用（LINE Pay / 街口支付 / 綠界金流）'
      }, {
        label: '線下交易',
        value: '啓用，需補憑證'
      }, {
        label: '授權額度模式',
        value: '租金比例模式'
      }, {
        label: '固定額度',
        value: '-'
      }, {
        label: '租金比例',
        value: '30%'
      }, {
        label: '取車資金處理口徑',
        value: '履約擔保 / 預授權轉租金'
      }, {
        label: '企業月結口徑',
        value: '不發起客戶支付或預授權，最終費用進入企業賬單'
      }]
    }, {
      title: '異地還車',
      desc: '舊版異地還車費用。',
      items: [{
        label: '異地還車費',
        value: '¥200/次'
      }]
    }, {
      title: '調度與派車',
      desc: '舊版車輛派車評分規則。',
      items: [{
        label: '車輛排程看板鎖定時間',
        value: '2 小時前鎖定'
      }, {
        label: '訂單間隔時間',
        value: '60 分鐘'
      }, {
        label: '基準日均里程',
        value: '150 km/天'
      }, {
        label: '里程權重',
        value: '0%'
      }, {
        label: '營收權重',
        value: '100%'
      }, {
        label: '車齡權重',
        value: '0%'
      }]
    }, {
      title: '時租與日租',
      desc: '舊版不足整日租期計費規則。',
      items: [{
        label: '起租規則',
        value: '起租 24 小時'
      }, {
        label: '最小計費單位',
        value: '不足 1 小時按 1 小時'
      }, {
        label: '時租轉日租時間',
        value: '第 5 小時起算 1 天'
      }, {
        label: '不滿日租時的時租價格',
        value: '按日租百分比'
      }, {
        label: '每小時按日租',
        value: '10%'
      }, {
        label: '時租單價',
        value: '-'
      }, {
        label: '固定金額',
        value: '-'
      }]
    }, {
      title: '取還車規則',
      desc: '舊版取還車與爽約處理規則。',
      items: [{
        label: '允許提前取車',
        value: '是'
      }, {
        label: '免費寬限時間',
        value: '30 分鐘'
      }, {
        label: '啓用履約操作鎖',
        value: '是'
      }, {
        label: '鎖有效期',
        value: '30 分鐘'
      }, {
        label: '允許提前還車',
        value: '是'
      }, {
        label: '退款計算規則',
        value: '僅退還整天租金'
      }, {
        label: '保留車輛時長',
        value: '2 小時'
      }, {
        label: '自動釋放資源',
        value: '是'
      }, {
        label: '處理後狀態',
        value: '爽約'
      }, {
        label: '爽約違約金',
        value: '收取'
      }, {
        label: '爽約違約金計算方式',
        value: '固定金額'
      }, {
        label: '爽約違約金固定金額',
        value: '¥200'
      }, {
        label: '爽約違約金預授權比例',
        value: '-'
      }]
    }, {
      title: '取消與超時規則',
      desc: '舊版取消與超時費用規則。',
      items: [{
        label: '下單後限時取消',
        value: '開啓'
      }, {
        label: '下單後免責時限',
        value: '30 分鐘'
      }, {
        label: '取車前提前取消',
        value: '開啓'
      }, {
        label: '取車前免責時限',
        value: '24 小時'
      }, {
        label: '免責取消退款方式',
        value: '全額退款'
      }, {
        label: '免責取消手續費',
        value: '-'
      }, {
        label: '有責取消違約金計算方式',
        value: '固定金額'
      }, {
        label: '有責取消固定金額',
        value: '¥200'
      }, {
        label: '有責取消預授權比例',
        value: '-'
      }, {
        label: '是否階梯扣費',
        value: '未啓用'
      }, {
        label: '超時免費寬限',
        value: '30 分鐘'
      }, {
        label: '超時罰款',
        value: '開啓'
      }, {
        label: '超時罰款類型',
        value: '固定金額'
      }, {
        label: '超時罰款數額',
        value: '¥100'
      }, {
        label: '超時費封頂',
        value: '開啓'
      }, {
        label: '超時費封頂金額',
        value: '¥500'
      }]
    }, {
      title: '續租規則',
      desc: '舊版續租與結算口徑。',
      items: [{
        label: '允許延長用車',
        value: '是'
      }, {
        label: '允許逾期補辦續租',
        value: '是'
      }, {
        label: '後續訂單衝突',
        value: '先改派後續訂單，否則拒絕續租'
      }, {
        label: '可選結算方式',
        value: '立即收款 / 還車時結算'
      }, {
        label: '超過時長必須收款',
        value: '24 小時'
      }, {
        label: '超過金額必須收款',
        value: '¥1000'
      }, {
        label: '風險客戶必須收款',
        value: '是'
      }, {
        label: '企業月結口徑',
        value: '費用統一進入企業賬單'
      }]
    }];
    const ruleVersionRecords = ref([{
      version: 'RULE-STORE-20260418-002',
      title: '當前門市租車全局規則',
      savedBy: '運營管理員',
      savedAt: '2026-04-18 12:10',
      sections: buildCurrentStoreRuleSections()
    }, {
      version: 'RULE-STORE-20260401-001',
      title: '4月門市租車默認規則',
      savedBy: '運營主管',
      savedAt: '2026-04-01 09:00',
      sections: buildLegacyStoreRuleSections()
    }]);
    const rentalRuleVersionDialogVisible = ref(false);
    const selectedRentalRuleVersion = ref(null);
    const openRentalRuleVersion = version => {
      selectedRentalRuleVersion.value = version || ruleVersionRecords.value[0];
      rentalRuleVersionDialogVisible.value = true;
    };
    const getRentalRuleSectionRows = version => (version?.sections || []).flatMap(section => (section.items || []).map(item => ({
      section: section.title,
      label: item.label,
      value: item.value
    })));
    const unlockCard = key => {
      cardLocks[key] = false;
    };
    const saveCard = key => {
      cardLocks[key] = true;
      originalSnapshot = JSON.stringify(settings);
      feedback.ElMessage.success('設置已保存');
    };
    const cancelCard = key => {
      Object.assign(settings, JSON.parse(originalSnapshot));
      cardLocks[key] = true;
      feedback.ElMessage.info('已取消編輯，變更未保存');
    };
    const saveSettings = () => {
      originalSnapshot = JSON.stringify(settings);
      feedback.ElMessage.success('所有設置已保存');
    };
    const getTierStart = (tiers, index, key, firstStart = 0) => {
      if (!Array.isArray(tiers) || index < 0 || !tiers[index]) return 0;
      const firstValue = Number(tiers[0]?.[key] || 0);
      const lastValue = Number(tiers[tiers.length - 1]?.[key] || 0);
      const isDescending = firstValue > lastValue;
      if (isDescending) {
        return index < tiers.length - 1 ? Number(tiers[index + 1]?.[key] || 0) : 0;
      }
      return index > 0 ? Number(tiers[index - 1]?.[key] || 0) : Number(firstStart || 0);
    };
    return {
      settings,
      cardLocks,
      unlockCard,
      saveCard,
      cancelCard,
      saveSettings,
      sharingSettings,
      sharingCardLocks,
      activeTab,
      permissionDemoMode,
      permissionDemoOptions,
      setPermissionDemoMode,
      membershipPlans,
      getTierStart,
      rentalRuleTabPermissions,
      ruleVersionRecords,
      rentalRuleVersionDialogVisible,
      selectedRentalRuleVersion,
      openRentalRuleVersion,
      getRentalRuleSectionRows,
      visibleRentalRuleTabs,
      canViewRentalRuleTab,
      rulePermissions,
      visibleStoreRuleNav,
      visibleSharingRuleNavGroups,
      canViewStoreRule,
      canViewSharingRule,
      scrollToRule,
      ElMessage: feedback.ElMessage,
      rentalRuleTabs,
      ensureActiveRentalRuleTab,
      storeRuleNav,
      sharingRuleNavGroups,
      sharingRuleParents,
      originalSnapshot,
      buildCurrentStoreRuleSections,
      buildLegacyStoreRuleSections
    };
  }
  return pageSetup();
}
export default function SettingsBlock() {
  const model = useRimoModel(createPageState);
  const view = model.view;
  const {
    text
  } = useRimoEnvironment();
  return <RimoRoot model={model} pageKey="settings" assets={{}}><div data-business-content="" data-rimo-layout="page"><div className="prototype-permission-switcher" aria-label="租賃業務規則權限演示" data-rimo-layout="permissions"><span className="prototype-permission-switcher__label">{text("權限演示")}</span>
<RimoElement kind="el-radio-group" modelValue={view.permissionDemoMode} onModelChange={value => {
          model.write(["permissionDemoMode"], value);
        }} size="small" onChange={event => {
          view.setPermissionDemoMode?.(event);
        }}>{rimoEntries(view.permissionDemoOptions).map(([option], _itemIndex) => <Fragment key={option.value}><RimoElement kind="el-radio-button" key={option.value} label={option.value}>{rimoText(option.label)}</RimoElement></Fragment>)}</RimoElement></div>
<div className="flex justify-between items-end mb-6" data-rimo-layout="heading"><div><h1 className="text-2xl font-bold text-gray-800 tracking-tight">{text("租賃業務規則")}</h1>
<p className="text-gray-500 text-sm mt-1">{text("配置門市租賃及分時租賃的核心業務規則、費率及風控策略。")}</p></div></div>
<div className=""><RimoElement kind="el-tabs" modelValue={view.activeTab} onModelChange={value => {
          model.write(["activeTab"], value);
        }} className="settings-main-tabs w-full bg-white rounded-xl shadow-sm border border-gray-100 min-h-[500px]">{view.canViewRentalRuleTab('store') ? <><RimoElement kind="el-tab-pane" name="store" className="p-6" slots={{
              "label": _slot => <><span className="flex items-center gap-2"><RimoElement kind="el-icon"><RimoIcon name="Shop" /></RimoElement>
<span>{text("門市租賃")}</span></span></>
            }}><div className="w-full"><div className="mb-6"><h2 className="text-xl font-bold text-gray-800">{text("門市租賃規則")}</h2>
<p className="text-gray-500 text-sm mt-1">{text("配置門店租車業務的各項規則，包括交易支付、車輛排程看板、異地還車及違約處理等。")}</p>
<div className="mt-4 rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-800">{text("\n                                        本期門市租車規則按全局配置生效，頁面當前顯示值即默認值和當前設定值。支付、預授權、尾款和退款配置僅適用於個人訂單及非月結企業訂單；企業月結訂單不發起客戶支付或預授權，最終費用進入企業賬單。\n                                    ")}</div>
<div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3"><div className="rounded-lg border border-gray-200 bg-white px-4 py-3"><div className="text-xs text-gray-400 mb-1">{text("當前規則版本")}</div>
<div className="flex items-center justify-between gap-2"><div className="font-mono font-bold text-gray-800 cursor-pointer underline decoration-dotted" onClick={_event => {
                          view.openRentalRuleVersion(view.ruleVersionRecords[0]);
                        }}>{text("RULE-STORE-20260418-002")}</div>
<RimoElement kind="el-button" size="small" type="primary" link={true} onClick={_event => {
                          view.openRentalRuleVersion();
                        }}>{text("歷史版本")}</RimoElement></div></div>
<div className="rounded-lg border border-gray-200 bg-white px-4 py-3"><div className="text-xs text-gray-400 mb-1">{text("版本範圍")}</div>
<div className="text-sm font-medium text-gray-800">{text("門市租車全局配置")}</div></div>
<div className="rounded-lg border border-gray-200 bg-white px-4 py-3"><div className="text-xs text-gray-400 mb-1">{text("訂單快照")}</div>
<div className="text-sm font-medium text-gray-800">{text("僅影響後續新建訂單")}</div></div></div></div>
<div className="grid gap-6" style={rimoStyle("grid-template-columns: 200px minmax(0, 1fr);")}><div className="store-rule-nav rounded-xl border border-gray-100 bg-gray-50 p-3 h-fit"><div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">{text("規則分類\n                                        ")}</div>
{rimoEntries(view.visibleStoreRuleNav).map(([item], _itemIndex) => <Fragment key={item.key}><a key={item.key} href={'#' + item.anchor} className="rule-nav-link block rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition-colors" onClick={event => {
                        event.preventDefault();
                        view.scrollToRule(item.anchor);
                      }}>{text("\n                                            ")}{rimoText(item.label)}{text("\n                                        ")}</a></Fragment>)}
{view.visibleStoreRuleNav.length === 0 ? <><div className="rounded-lg bg-white px-3 py-4 text-xs text-gray-400">{text("\n                                            當前賬號暫無可查看的門市租賃設置項\n                                        ")}</div></> : null}</div>
<div className="space-y-6 min-w-0">{view.canViewStoreRule('transaction') ? <><section id="store-transaction" className="store-rule-section"><div className="bg-blue-50/50 rounded-xl p-6 border border-blue-100"><div className="flex items-center justify-between mb-5"><div className="flex items-center"><div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-4"><svg className="w-5 h-5 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"></rect>
<path d="M3 10h18"></path>
<path d="M7 15h3"></path></svg></div>
<div><h3 className="font-bold text-gray-800 text-lg">{text("交易與授權")}</h3>
<p className="text-gray-400 text-sm">{text("設定門市租賃的支付方式和預授權規則")}</p></div></div>
<div>{view.cardLocks.transaction ? <><RimoElement kind="el-button" type="primary" plain={true} size="small" onClick={_event => {
                                  view.unlockCard('transaction');
                                }}><RimoElement kind="el-icon" className="mr-1"><RimoIcon name="Lock" /></RimoElement>
{text(" 解鎖編輯\n                                                        ")}</RimoElement></> : <><div className="flex gap-2"><RimoElement kind="el-button" size="small" onClick={_event => {
                                    view.cancelCard('transaction');
                                  }}>{text("取消")}</RimoElement>
<RimoElement kind="el-button" type="primary" size="small" onClick={_event => {
                                    view.saveCard('transaction');
                                  }}><RimoElement kind="el-icon" className="mr-1"><RimoIcon name="Check" /></RimoElement>
{text(" 保存\n                                                            ")}</RimoElement></div></>}</div></div>
<RimoElement kind="el-form" disabled={view.cardLocks.transaction} model={view.settings} labelWidth="140px" labelPosition="left"><div className="mb-4 rounded-lg border border-blue-100 bg-white px-4 py-3 text-sm text-gray-600">{text("\n                                                        當前配置僅控制客戶自付訂單。企業月結訂單創建、取車、續租、還車均不讀取客戶支付和預授權規則。\n                                                    ")}</div>
<div className="mb-4 rounded-lg border border-amber-100 bg-amber-50 px-4 py-3"><RimoElement kind="el-row" gutter={24} className="items-center"><RimoElement kind="el-col" span={8}><RimoElement kind="el-form-item" label="待支付資源保留"><RimoElement kind="el-switch" modelValue={view.settings.pendingPaymentHoldEnabled} onModelChange={value => {
                                      model.write(["settings", "pendingPaymentHoldEnabled"], value);
                                    }} activeText="開啓" inactiveText="關閉"></RimoElement></RimoElement></RimoElement>
{view.settings.pendingPaymentHoldEnabled ? <><RimoElement kind="el-col" span={8}><RimoElement kind="el-form-item" label="保留時長"><RimoElement kind="el-input-number" modelValue={view.settings.pendingPaymentHoldMinutes} onModelChange={value => {
                                        model.write(["settings", "pendingPaymentHoldMinutes"], value);
                                      }} min={5} max={240} step={5} style={rimoStyle("width: 120px")}></RimoElement>
<span className="ml-2 text-gray-500 text-sm">{text("分鐘")}</span></RimoElement></RimoElement></> : null}
{view.settings.pendingPaymentHoldEnabled ? <><RimoElement kind="el-col" span={8}><div className="text-xs text-amber-700 leading-relaxed">{text("\n                                                                    待支付訂單僅保留車組庫存，超時未完成預授權時自動取消並釋放庫存。\n                                                                ")}</div></RimoElement></> : null}</RimoElement></div>
<div className="grid grid-cols-2 gap-4 mb-4"><div className="bg-blue-50 rounded-lg p-4 border border-blue-100"><div className="flex items-center justify-between mb-3"><div className="text-sm font-medium text-blue-700">{text("線上交易\n                                                                ")}</div>
<RimoElement kind="el-switch" modelValue={view.settings.onlinePaymentEnabled} onModelChange={value => {
                                    model.write(["settings", "onlinePaymentEnabled"], value);
                                  }}></RimoElement></div>
{view.settings.onlinePaymentEnabled ? <><div><RimoElement kind="el-checkbox-group" modelValue={view.settings.onlinePaymentMethods} onModelChange={value => {
                                      model.write(["settings", "onlinePaymentMethods"], value);
                                    }}><RimoElement kind="el-checkbox" label="linepay">{text("LINE Pay")}</RimoElement>
<RimoElement kind="el-checkbox" label="jkopay">{text("街口支付")}</RimoElement>
<RimoElement kind="el-checkbox" label="ecpay">{text("綠界金流")}</RimoElement></RimoElement></div></> : <><div className="text-xs text-gray-400">{text("啓用後可使用線上支付方式")}</div></>}</div>
<div className="bg-green-50 rounded-lg p-4 border border-green-100"><div className="flex items-center justify-between mb-3"><div className="text-sm font-medium text-green-700">{text("線下交易\n                                                                ")}</div>
<RimoElement kind="el-switch" modelValue={view.settings.offlinePaymentEnabled} onModelChange={value => {
                                    model.write(["settings", "offlinePaymentEnabled"], value);
                                  }}></RimoElement></div>
{view.settings.offlinePaymentEnabled ? <><div><RimoElement kind="el-checkbox-group" modelValue={view.settings.offlinePaymentMethods} onModelChange={value => {
                                      model.write(["settings", "offlinePaymentMethods"], value);
                                    }}><RimoElement kind="el-checkbox" label="cash">{text("現金")}</RimoElement>
<RimoElement kind="el-checkbox" label="card">{text("刷卡（POS）")}</RimoElement>
<RimoElement kind="el-checkbox" label="transfer">{text("轉賬")}</RimoElement></RimoElement></div></> : <><div className="text-xs text-gray-400">{text("啓用後可使用線下支付方式")}</div></>}</div></div>
<RimoElement kind="el-divider" contentPosition="left"><span className="text-sm text-gray-400">{text("預授權設置")}</span></RimoElement>
<div className="bg-gray-50 rounded-lg p-4 border"><RimoElement kind="el-row" gutter={24}><RimoElement kind="el-col" span={8}><RimoElement kind="el-form-item" label="授權額度模式" labelWidth="100px"><RimoElement kind="el-radio-group" modelValue={view.settings.authorizationMode} onModelChange={value => {
                                      model.write(["settings", "authorizationMode"], value);
                                    }}><RimoElement kind="el-radio" label="fixed">{text("固定金額")}</RimoElement>
<RimoElement kind="el-radio" label="percentage">{text("租金比例")}</RimoElement></RimoElement></RimoElement></RimoElement>
{view.settings.authorizationMode === 'fixed' ? <><RimoElement kind="el-col" span={8}><RimoElement kind="el-form-item" label="固定額度" labelWidth="80px"><RimoElement kind="el-input-number" modelValue={view.settings.authorizationAmount} onModelChange={value => {
                                        model.write(["settings", "authorizationAmount"], value);
                                      }} min={0} step={100} style={rimoStyle("width: 140px")}></RimoElement>
<span className="ml-2 text-gray-400">{text("元")}</span></RimoElement></RimoElement></> : null}
{view.settings.authorizationMode === 'percentage' ? <><RimoElement kind="el-col" span={8}><RimoElement kind="el-form-item" label="租金比例" labelWidth="80px"><RimoElement kind="el-input-number" modelValue={view.settings.authorizationPercent} onModelChange={value => {
                                        model.write(["settings", "authorizationPercent"], value);
                                      }} min={0} max={100} step={10} style={rimoStyle("width: 140px")}></RimoElement>
<span className="ml-2 text-gray-400">{text("%")}</span></RimoElement></RimoElement></> : null}</RimoElement>
<RimoElement kind="el-divider" contentPosition="left"><span className="text-sm text-gray-400">{text("取車資金處理口徑")}</span></RimoElement>
<RimoElement kind="el-checkbox-group" modelValue={view.settings.authorizationHandlingModes} onModelChange={value => {
                                model.write(["settings", "authorizationHandlingModes"], value);
                              }} className="grid grid-cols-2 gap-3"><RimoElement kind="el-checkbox" label="guarantee" border={true} className="!h-auto !items-start p-3"><div className="leading-relaxed"><div className="font-medium text-gray-800">{text("履約擔保")}</div>
<div className="text-xs text-gray-500 mt-1">{text("\n                                                                        取車時補足租金尾款，確認發車後釋放預授權押金。\n                                                                    ")}</div></div></RimoElement>
<RimoElement kind="el-checkbox" label="rent_transfer" border={true} className="!h-auto !items-start p-3"><div className="leading-relaxed"><div className="font-medium text-gray-800">{text("預授權轉租金")}</div>
<div className="text-xs text-gray-500 mt-1">{text("\n                                                                        取車時將預授權扣款轉爲租金實收，並抵扣取車尾款。\n                                                                    ")}</div></div></RimoElement></RimoElement>
<div className="mt-3 text-xs text-gray-500">{text("\n                                                            至少啓用一種口徑；兩種都啓用時，取車辦理頁面按訂單實際情況選擇。\n                                                        ")}</div></div></RimoElement></div></section></> : null}
{view.canViewStoreRule('crossCity') ? <><section id="store-cross-city" className="store-rule-section"><div className="bg-orange-50/50 rounded-xl p-6 border border-orange-100"><div className="flex items-center justify-between mb-5"><div className="flex items-center"><div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center mr-4"><RimoElement kind="el-icon" className="text-orange-600 text-xl"><RimoIcon name="Location" /></RimoElement></div>
<div><h3 className="font-bold text-gray-800 text-lg">{text("異地還車")}</h3>
<p className="text-gray-400 text-sm">{text("設定異地還車費用")}</p></div></div>
<div>{view.cardLocks.crossCity ? <><RimoElement kind="el-button" type="primary" plain={true} size="small" onClick={_event => {
                                  view.unlockCard('crossCity');
                                }}><RimoElement kind="el-icon" className="mr-1"><RimoIcon name="Lock" /></RimoElement>
{text(" 解鎖編輯\n                                                        ")}</RimoElement></> : <><div className="flex gap-2"><RimoElement kind="el-button" size="small" onClick={_event => {
                                    view.cancelCard('crossCity');
                                  }}>{text("取消")}</RimoElement>
<RimoElement kind="el-button" type="primary" size="small" onClick={_event => {
                                    view.saveCard('crossCity');
                                  }}><RimoElement kind="el-icon" className="mr-1"><RimoIcon name="Check" /></RimoElement>
{text(" 保存\n                                                            ")}</RimoElement></div></>}</div></div>
<RimoElement kind="el-form" disabled={view.cardLocks.crossCity} model={view.settings} labelWidth="140px" labelPosition="left"><RimoElement kind="el-form-item" label="異地還車費"><RimoElement kind="el-input-number" modelValue={view.settings.crossCityFee} onModelChange={value => {
                                model.write(["settings", "crossCityFee"], value);
                              }} min={0} step={50} style={rimoStyle("width: 160px")}></RimoElement>
<span className="ml-2 text-gray-400">{text("元/次")}</span></RimoElement></RimoElement></div></section></> : null}
{view.canViewStoreRule('dispatch') ? <><section id="store-dispatch" className="store-rule-section"><div className="bg-[color:var(--app-color-primary-light-9)] rounded-xl p-6 border border-[color:var(--app-color-primary-light-8)]"><div className="flex items-center justify-between mb-5"><div className="flex items-center"><div className="w-10 h-10 bg-[color:var(--app-color-primary-light-8)] rounded-lg flex items-center justify-center mr-4"><RimoElement kind="el-icon" className="text-[color:var(--app-color-primary)] text-xl"><RimoIcon name="Van" /></RimoElement></div>
<div><h3 className="font-bold text-gray-800 text-lg">{text("調度與派車")}</h3>
<p className="text-gray-400 text-sm">{text("車輛排程看板限制和智能派車權重配置")}</p></div></div>
<div>{view.cardLocks.dispatch ? <><RimoElement kind="el-button" type="primary" plain={true} size="small" onClick={_event => {
                                  view.unlockCard('dispatch');
                                }}><RimoElement kind="el-icon" className="mr-1"><RimoIcon name="Lock" /></RimoElement>
{text(" 解鎖編輯\n                                                        ")}</RimoElement></> : <><div className="flex gap-2"><RimoElement kind="el-button" size="small" onClick={_event => {
                                    view.cancelCard('dispatch');
                                  }}>{text("取消")}</RimoElement>
<RimoElement kind="el-button" type="primary" size="small" onClick={_event => {
                                    view.saveCard('dispatch');
                                  }}><RimoElement kind="el-icon" className="mr-1"><RimoIcon name="Check" /></RimoElement>
{text(" 保存\n                                                            ")}</RimoElement></div></>}</div></div>
<RimoElement kind="el-form" disabled={view.cardLocks.dispatch} model={view.settings} labelWidth="180px" labelPosition="left"><RimoElement kind="el-row" gutter={24}><RimoElement kind="el-col" span={12}><RimoElement kind="el-form-item" label="車輛排程看板鎖定時間"><RimoElement kind="el-input-number" modelValue={view.settings.vehicleLockHours} onModelChange={value => {
                                    model.write(["settings", "vehicleLockHours"], value);
                                  }} min={0} max={72} style={rimoStyle("width: 120px")}></RimoElement>
<span className="ml-2 text-gray-400">{text("小時前鎖定")}</span></RimoElement></RimoElement>
<RimoElement kind="el-col" span={12}><RimoElement kind="el-form-item" label="訂單間隔時間"><RimoElement kind="el-input-number" modelValue={view.settings.orderIntervalMinutes} onModelChange={value => {
                                    model.write(["settings", "orderIntervalMinutes"], value);
                                  }} min={0} max={480} step={30} style={rimoStyle("width: 120px")}></RimoElement>
<span className="ml-2 text-gray-400">{text("分鐘")}</span></RimoElement></RimoElement></RimoElement>
<RimoElement kind="el-row" gutter={24}><RimoElement kind="el-col" span={12}><RimoElement kind="el-form-item" label="基準日均里程"><RimoElement kind="el-input-number" modelValue={view.settings.benchmarkDailyMileage} onModelChange={value => {
                                    model.write(["settings", "benchmarkDailyMileage"], value);
                                  }} min={0} step={10} style={rimoStyle("width: 120px")}></RimoElement>
<span className="ml-2 text-gray-400">{text("km/天")}</span></RimoElement></RimoElement></RimoElement>
<RimoElement kind="el-divider" contentPosition="left"><span className="text-sm text-gray-400">{text("智能派車權重配置")}</span></RimoElement>
<div className="bg-[color:var(--app-color-primary-light-9)] rounded-lg p-4 border border-[color:var(--app-color-primary-light-8)]"><p className="text-xs text-gray-500 mb-4">{text("設置智能派車評分權重，系統按評分低者優先派遣；當前默認以營收權重爲主\n                                                        ")}</p>
<div className="grid grid-cols-3 gap-6"><div className="text-center"><div className="text-sm text-gray-600 mb-2">{text("里程權重")}</div>
<RimoElement kind="el-input-number" modelValue={view.settings.dispatchWeightMileage} onModelChange={value => {
                                    model.write(["settings", "dispatchWeightMileage"], value);
                                  }} min={0} max={100} size="large" style={rimoStyle("width: 100%")}></RimoElement>
<div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden"><div className="h-full bg-[color:var(--app-color-primary)] transition-all" style={rimoStyle({
                                      width: view.settings.dispatchWeightMileage + '%'
                                    })}></div></div></div>
<div className="text-center"><div className="text-sm text-gray-600 mb-2">{text("營收權重")}</div>
<RimoElement kind="el-input-number" modelValue={view.settings.dispatchWeightRevenue} onModelChange={value => {
                                    model.write(["settings", "dispatchWeightRevenue"], value);
                                  }} min={0} max={100} size="large" style={rimoStyle("width: 100%")}></RimoElement>
<div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden"><div className="h-full bg-[color:var(--app-color-primary)] transition-all" style={rimoStyle({
                                      width: view.settings.dispatchWeightRevenue + '%'
                                    })}></div></div></div>
<div className="text-center"><div className="text-sm text-gray-600 mb-2">{text("車齡權重")}</div>
<RimoElement kind="el-input-number" modelValue={view.settings.dispatchWeightAge} onModelChange={value => {
                                    model.write(["settings", "dispatchWeightAge"], value);
                                  }} min={0} max={100} size="large" style={rimoStyle("width: 100%")}></RimoElement>
<div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden"><div className="h-full bg-blue-500 transition-all" style={rimoStyle({
                                      width: view.settings.dispatchWeightAge + '%'
                                    })}></div></div></div></div></div></RimoElement></div></section></> : null}
{view.canViewStoreRule('hourlyDaily') ? <><section id="store-hourly-daily" className="store-rule-section"><div className="bg-green-50/50 rounded-xl p-6 border border-green-100"><div className="flex items-center justify-between mb-5"><div className="flex items-center"><div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-4"><RimoElement kind="el-icon" className="text-green-600 text-xl"><RimoIcon name="Clock" /></RimoElement></div>
<div><h3 className="font-bold text-gray-800 text-lg">{text("時租與日租")}</h3>
<p className="text-gray-400 text-sm">{text("時租轉日租規則和不滿日租定價")}</p></div></div>
<div>{view.cardLocks.hourlyDaily ? <><RimoElement kind="el-button" type="primary" plain={true} size="small" onClick={_event => {
                                  view.unlockCard('hourlyDaily');
                                }}><RimoElement kind="el-icon" className="mr-1"><RimoIcon name="Lock" /></RimoElement>
{text(" 解鎖編輯\n                                                        ")}</RimoElement></> : <><div className="flex gap-2"><RimoElement kind="el-button" size="small" onClick={_event => {
                                    view.cancelCard('hourlyDaily');
                                  }}>{text("取消")}</RimoElement>
<RimoElement kind="el-button" type="primary" size="small" onClick={_event => {
                                    view.saveCard('hourlyDaily');
                                  }}><RimoElement kind="el-icon" className="mr-1"><RimoIcon name="Check" /></RimoElement>
{text(" 保存\n                                                            ")}</RimoElement></div></>}</div></div>
<RimoElement kind="el-form" disabled={view.cardLocks.hourlyDaily} model={view.settings} labelWidth="180px" labelPosition="left"><RimoElement kind="el-row" gutter={24}><RimoElement kind="el-col" span={12}><RimoElement kind="el-form-item" label="時租轉日租時間"><RimoElement kind="el-input-number" modelValue={view.settings.hourlyToDailyThreshold} onModelChange={value => {
                                    model.write(["settings", "hourlyToDailyThreshold"], value);
                                  }} min={1} max={24} style={rimoStyle("width: 120px")}></RimoElement>
<span className="ml-2 text-gray-400">{text("小時")}</span></RimoElement></RimoElement>
<RimoElement kind="el-col" span={12}><RimoElement kind="el-form-item" label="不滿日租時的時租價格"><RimoElement kind="el-select" modelValue={view.settings.hourlyPriceMode} onModelChange={value => {
                                    model.write(["settings", "hourlyPriceMode"], value);
                                  }} style={rimoStyle("width: 200px")}><RimoElement kind="el-option" label="按小時計費" value="hourly"></RimoElement>
<RimoElement kind="el-option" label="按日租百分比" value="percentage"></RimoElement>
<RimoElement kind="el-option" label="固定金額" value="fixed"></RimoElement></RimoElement></RimoElement></RimoElement></RimoElement>
{view.settings.hourlyPriceMode === 'percentage' ? <><RimoElement kind="el-row" gutter={24}><RimoElement kind="el-col" span={12}><RimoElement kind="el-form-item" label="每小時按日租"><RimoElement kind="el-input-number" modelValue={view.settings.hourlyPricePercentage} onModelChange={value => {
                                      model.write(["settings", "hourlyPricePercentage"], value);
                                    }} min={1} max={100} style={rimoStyle("width: 120px")}></RimoElement>
<span className="ml-2 text-gray-400">{text("% 計費")}</span></RimoElement></RimoElement></RimoElement></> : null}
{view.settings.hourlyPriceMode === 'hourly' ? <><RimoElement kind="el-row" gutter={24}><RimoElement kind="el-col" span={12}><RimoElement kind="el-form-item" label="時租單價"><RimoElement kind="el-input-number" modelValue={view.settings.hourlyRatePrice} onModelChange={value => {
                                      model.write(["settings", "hourlyRatePrice"], value);
                                    }} min={0} style={rimoStyle("width: 120px")}></RimoElement>
<span className="ml-2 text-gray-400">{text("元/小時")}</span></RimoElement></RimoElement></RimoElement></> : null}
{view.settings.hourlyPriceMode === 'fixed' ? <><RimoElement kind="el-row" gutter={24}><RimoElement kind="el-col" span={12}><RimoElement kind="el-form-item" label="固定金額"><RimoElement kind="el-input-number" modelValue={view.settings.hourlyFixedPrice} onModelChange={value => {
                                      model.write(["settings", "hourlyFixedPrice"], value);
                                    }} min={0} style={rimoStyle("width: 120px")}></RimoElement>
<span className="ml-2 text-gray-400">{text("元（不滿日租統一收費）")}</span></RimoElement></RimoElement></RimoElement></> : null}</RimoElement></div></section></> : null}
{view.canViewStoreRule('pickupReturn') ? <><section id="store-pickup-return" className="store-rule-section"><div className="bg-red-50/50 rounded-xl p-6 border border-red-100"><div className="flex items-center justify-between mb-5"><div className="flex items-center"><div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center mr-4"><svg className="w-5 h-5 text-red-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 7h10l-3-3"></path>
<path d="M17 17H7l3 3"></path>
<path d="M14 4l3 3-3 3"></path>
<path d="M10 14l-3 3 3 3"></path></svg></div>
<div><h3 className="font-bold text-gray-800 text-lg">{text("取還車規則")}</h3>
<p className="text-gray-400 text-sm">{text("提前取車、提前還車、未取車的處理規則")}</p></div></div>
<div>{view.cardLocks.pickupReturn ? <><RimoElement kind="el-button" type="primary" plain={true} size="small" onClick={_event => {
                                  view.unlockCard('pickupReturn');
                                }}><RimoElement kind="el-icon" className="mr-1"><RimoIcon name="Lock" /></RimoElement>
{text(" 解鎖編輯\n                                                        ")}</RimoElement></> : <><div className="flex gap-2"><RimoElement kind="el-button" size="small" onClick={_event => {
                                    view.cancelCard('pickupReturn');
                                  }}>{text("取消")}</RimoElement>
<RimoElement kind="el-button" type="primary" size="small" onClick={_event => {
                                    view.saveCard('pickupReturn');
                                  }}><RimoElement kind="el-icon" className="mr-1"><RimoIcon name="Check" /></RimoElement>
{text(" 保存\n                                                            ")}</RimoElement></div></>}</div></div>
<RimoElement kind="el-form" disabled={view.cardLocks.pickupReturn} model={view.settings} labelWidth="180px" labelPosition="left"><RimoElement kind="el-divider" contentPosition="left"><span className="text-sm text-gray-400">{text("提前取車")}</span></RimoElement>
<RimoElement kind="el-row" gutter={24} className="items-start"><RimoElement kind="el-col" span={8}><RimoElement kind="el-form-item" label="允許提前取車"><RimoElement kind="el-switch" modelValue={view.settings.allowEarlyPickup} onModelChange={value => {
                                    model.write(["settings", "allowEarlyPickup"], value);
                                  }}></RimoElement></RimoElement></RimoElement>
{view.settings.allowEarlyPickup ? <><RimoElement kind="el-col" span={16}><RimoElement kind="el-form-item" label="免費寬限時間"><div className="flex items-center"><RimoElement kind="el-input-number" modelValue={view.settings.earlyPickupGraceMinutes} onModelChange={value => {
                                        model.write(["settings", "earlyPickupGraceMinutes"], value);
                                      }} min={0} step={15} size="small" style={rimoStyle("width: 120px")}></RimoElement>
<span className="ml-2 text-gray-500 text-sm">{text("分鐘")}</span></div>
<div className="mt-2 text-xs text-gray-500 leading-relaxed bg-blue-50 p-2 rounded border border-blue-100 flex items-start gap-2"><RimoElement kind="el-icon" className="text-blue-500 text-sm mt-0.5"><RimoIcon name="InfoFilled" /></RimoElement>
<div><span className="font-medium text-gray-700">{text("規則說明：")}</span>
{text("\n                                                                        寬限期內不計費；超過後自動更新訂單時間並重算租金。\n                                                                    ")}</div></div></RimoElement></RimoElement></> : null}</RimoElement>
<RimoElement kind="el-divider" contentPosition="left"><span className="text-sm text-gray-400">{text("履約操作鎖")}</span></RimoElement>
<div className="bg-gray-50 rounded-lg p-4 border border-gray-200 mb-4"><p className="text-xs text-gray-500 mb-4">{text("\n                                                            點擊取車或還車後創建操作鎖；關閉取車窗口時固定保留驗車中、取車草稿和操作鎖，關閉還車窗口時按還車提交節點保留當前狀態。\n                                                        ")}</p>
<RimoElement kind="el-row" gutter={24}><RimoElement kind="el-col" span={12}><RimoElement kind="el-form-item" label="啓用履約操作鎖"><RimoElement kind="el-switch" modelValue={view.settings.pickupLockEnabled} onModelChange={value => {
                                      model.write(["settings", "pickupLockEnabled"], value);
                                    }}></RimoElement></RimoElement></RimoElement>
{view.settings.pickupLockEnabled ? <><RimoElement kind="el-col" span={12}><RimoElement kind="el-form-item" label="鎖有效期"><RimoElement kind="el-input-number" modelValue={view.settings.pickupLockMinutes} onModelChange={value => {
                                        model.write(["settings", "pickupLockMinutes"], value);
                                      }} min={5} max={240} step={5} style={rimoStyle("width: 120px")}></RimoElement>
<span className="ml-2 text-gray-400">{text("分鐘")}</span></RimoElement></RimoElement></> : null}</RimoElement>
{view.settings.pickupLockEnabled ? <><div className="rounded-lg bg-white border border-gray-200 px-3 py-2 text-xs text-gray-600">{text("\n                                                            鎖超時後，原操作人可繼續辦理；釋放操作鎖由角色權限配置控制，本頁不選擇角色。\n                                                        ")}</div></> : null}</div>
<RimoElement kind="el-divider" contentPosition="left"><span className="text-sm text-gray-400">{text("提前還車")}</span></RimoElement>
<RimoElement kind="el-row" gutter={24} className="items-start"><RimoElement kind="el-col" span={8}><RimoElement kind="el-form-item" label="允許提前還車"><RimoElement kind="el-switch" modelValue={view.settings.allowEarlyReturn} onModelChange={value => {
                                    model.write(["settings", "allowEarlyReturn"], value);
                                  }}></RimoElement></RimoElement></RimoElement>
{view.settings.allowEarlyReturn ? <><RimoElement kind="el-col" span={16}><RimoElement kind="el-form-item" label="退款計算規則"><RimoElement kind="el-select" modelValue={view.settings.earlyReturnRefund} onModelChange={value => {
                                      model.write(["settings", "earlyReturnRefund"], value);
                                    }} size="small" style={rimoStyle("width: 180px")}><RimoElement kind="el-option" label="僅退還整天租金" value="full_days"></RimoElement>
<RimoElement kind="el-option" label="不退還任何費用" value="none"></RimoElement></RimoElement>
{view.settings.earlyReturnRefund === 'full_days' ? <><div className="mt-2 text-xs text-gray-500 bg-gray-50 p-2 rounded border border-gray-200"><RimoElement kind="el-icon" className="mr-1 relative top-0.5"><RimoIcon name="InfoFilled" /></RimoElement>
<span className="font-bold text-gray-700">{text("說明：")}</span>
{text("\n                                                                    提前24小時以上才退1天租金，不滿1天及其以內的部分不退。\n                                                                ")}</div></> : null}</RimoElement></RimoElement></> : null}</RimoElement>
<RimoElement kind="el-divider" contentPosition="left"><span className="text-sm text-gray-400">{text("未取車(No-show)處理")}</span></RimoElement>
<div className="bg-red-50 rounded-lg p-4 border border-red-100"><p className="text-xs text-gray-500 mb-4">{text("\n                                                            超過保留時長仍未取車後，訂單按配置進入爽約處理，並釋放車輛和庫存資源。\n                                                        ")}</p>
<RimoElement kind="el-row" gutter={24}><RimoElement kind="el-col" span={8}><RimoElement kind="el-form-item" label="保留車輛時長"><RimoElement kind="el-input-number" modelValue={view.settings.noShowHoldHours} onModelChange={value => {
                                      model.write(["settings", "noShowHoldHours"], value);
                                    }} min={0.5} step={0.5} size="small" style={rimoStyle("width: 120px")}></RimoElement>
<span className="ml-2 text-gray-500 text-sm">{text("小時")}</span></RimoElement></RimoElement>
<RimoElement kind="el-col" span={8}><RimoElement kind="el-form-item" label="自動釋放資源"><RimoElement kind="el-switch" modelValue={view.settings.noShowAutoCancel} onModelChange={value => {
                                      model.write(["settings", "noShowAutoCancel"], value);
                                    }} activeText="開啓" inactiveText="關閉"></RimoElement></RimoElement></RimoElement>
<RimoElement kind="el-col" span={8}><RimoElement kind="el-form-item" label="處理後狀態"><RimoElement kind="el-select" modelValue={view.settings.noShowTargetStatus} onModelChange={value => {
                                      model.write(["settings", "noShowTargetStatus"], value);
                                    }} style={rimoStyle("width: 140px")}><RimoElement kind="el-option" label="爽約" value="no_show"></RimoElement></RimoElement></RimoElement></RimoElement></RimoElement>
<div className="bg-white rounded-lg p-4 border border-red-200"><div className="flex items-center justify-between mb-3"><div><div className="text-sm font-medium text-gray-700">{text("爽約違約金")}</div>
<div className="text-xs text-gray-400 mt-1">{text("客戶自付訂單按配置扣費，企業月結訂單費用進入企業賬單。")}</div></div>
<RimoElement kind="el-switch" modelValue={view.settings.noShowPenaltyEnabled} onModelChange={value => {
                                    model.write(["settings", "noShowPenaltyEnabled"], value);
                                  }} activeText="收取" inactiveText="不收"></RimoElement></div>
{view.settings.noShowPenaltyEnabled ? <><div className="grid grid-cols-2 gap-4 pt-3 border-t border-gray-100"><div><div className="text-xs text-gray-500 mb-2">{text("扣款模式")}</div>
<RimoElement kind="el-radio-group" modelValue={view.settings.noShowPenaltyType} onModelChange={value => {
                                        model.write(["settings", "noShowPenaltyType"], value);
                                      }}><RimoElement kind="el-radio" label="fixed">{text("固定金額")}</RimoElement>
<RimoElement kind="el-radio" label="auth_percent">{text("預授權比例")}</RimoElement></RimoElement></div>
<div><div className="text-xs text-gray-500 mb-2">{text("扣款數值")}</div>
{view.settings.noShowPenaltyType === 'fixed' ? <><div className="flex items-center gap-2"><RimoElement kind="el-input-number" modelValue={view.settings.noShowPenaltyFixed} onModelChange={value => {
                                            model.write(["settings", "noShowPenaltyFixed"], value);
                                          }} min={0} step={50} style={rimoStyle("width: 140px")}></RimoElement>
<span className="text-gray-500">{text("元")}</span></div></> : null}
{view.settings.noShowPenaltyType === 'auth_percent' ? <><div className="flex items-center gap-2"><RimoElement kind="el-input-number" modelValue={view.settings.noShowPenaltyPercent} onModelChange={value => {
                                            model.write(["settings", "noShowPenaltyPercent"], value);
                                          }} min={0} max={100} style={rimoStyle("width: 140px")}></RimoElement>
<span className="text-gray-500">{text("%")}</span></div></> : null}</div></div></> : null}</div></div></RimoElement></div></section></> : null}
{view.canViewStoreRule('cancellation') ? <><section id="store-cancellation" className="store-rule-section"><div className="bg-amber-50/50 rounded-xl p-6 border border-amber-100"><div className="flex items-center justify-between mb-5"><div className="flex items-center"><div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center mr-4"><svg className="w-5 h-5 text-amber-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l9 16H3L12 3z"></path>
<path d="M12 9v4"></path>
<path d="M12 17h.01"></path></svg></div>
<div><h3 className="font-bold text-gray-800 text-lg">{text("取消與超時規則")}</h3>
<p className="text-gray-400 text-sm">{text("設置免責取消、有責取消條件及超時還車費用")}</p></div></div>
<div>{view.cardLocks.cancellation ? <><RimoElement kind="el-button" type="primary" plain={true} size="small" onClick={_event => {
                                  view.unlockCard('cancellation');
                                }}><RimoElement kind="el-icon" className="mr-1"><RimoIcon name="Lock" /></RimoElement>
{text(" 解鎖編輯\n                                                        ")}</RimoElement></> : <><div className="flex gap-2"><RimoElement kind="el-button" size="small" onClick={_event => {
                                    view.cancelCard('cancellation');
                                  }}>{text("取消")}</RimoElement>
<RimoElement kind="el-button" type="primary" size="small" onClick={_event => {
                                    view.saveCard('cancellation');
                                  }}><RimoElement kind="el-icon" className="mr-1"><RimoIcon name="Check" /></RimoElement>
{text(" 保存\n                                                            ")}</RimoElement></div></>}</div></div>
<RimoElement kind="el-form" disabled={view.cardLocks.cancellation} model={view.settings} labelWidth="180px" labelPosition="left"><RimoElement kind="el-divider" contentPosition="left"><span className="text-sm text-green-600 font-medium">{text("免責取消條件")}</span></RimoElement>
<div className="bg-green-50 rounded-lg p-4 mb-4 border border-green-100"><p className="text-xs text-gray-500 mb-4">{text("滿足以下任一條件即可免責取消（可同時啓用兩種規則）\n                                                        ")}</p>
<div className="flex items-center gap-4 mb-4 p-3 bg-white rounded-lg border border-green-200"><RimoElement kind="el-switch" modelValue={view.settings.freeCancelAfterOrderEnabled} onModelChange={value => {
                                  model.write(["settings", "freeCancelAfterOrderEnabled"], value);
                                }}></RimoElement>
<div className="flex-1"><div className="text-sm font-medium text-gray-700 mb-1">{text("\n                                                                    下單後限時取消\n                                                                ")}</div>
{view.settings.freeCancelAfterOrderEnabled ? <><div className="flex items-center gap-2"><span className="text-sm text-gray-500">{text("下單後")}</span>
<RimoElement kind="el-input-number" modelValue={view.settings.freeCancelAfterOrderMinutes} onModelChange={value => {
                                        model.write(["settings", "freeCancelAfterOrderMinutes"], value);
                                      }} min={1} max={1440} size="small" style={rimoStyle("width: 100px")}></RimoElement>
<RimoElement kind="el-select" modelValue={view.settings.freeCancelAfterOrderUnit} onModelChange={value => {
                                        model.write(["settings", "freeCancelAfterOrderUnit"], value);
                                      }} size="small" style={rimoStyle("width: 80px")}><RimoElement kind="el-option" label="分鐘" value="minutes"></RimoElement>
<RimoElement kind="el-option" label="小時" value="hours"></RimoElement></RimoElement>
<span className="text-sm text-gray-500">{text("內可免責取消")}</span></div></> : <><div className="text-xs text-gray-400">{text("\n                                                                    啓用後，用戶在下單後一定時間內可無條件取消\n                                                                ")}</div></>}</div></div>
<div className="flex items-center gap-4 mb-4 p-3 bg-white rounded-lg border border-green-200"><RimoElement kind="el-switch" modelValue={view.settings.freeCancelBeforePickupEnabled} onModelChange={value => {
                                  model.write(["settings", "freeCancelBeforePickupEnabled"], value);
                                }}></RimoElement>
<div className="flex-1"><div className="text-sm font-medium text-gray-700 mb-1">{text("\n                                                                    取車前提前取消\n                                                                ")}</div>
{view.settings.freeCancelBeforePickupEnabled ? <><div className="flex items-center gap-2"><span className="text-sm text-gray-500">{text("取車前")}</span>
<RimoElement kind="el-input-number" modelValue={view.settings.freeCancelBeforePickupHours} onModelChange={value => {
                                        model.write(["settings", "freeCancelBeforePickupHours"], value);
                                      }} min={1} max={168} size="small" style={rimoStyle("width: 100px")}></RimoElement>
<span className="text-sm text-gray-500">{text("小時以上可免責取消")}</span></div></> : <><div className="text-xs text-gray-400">{text("\n                                                                    啓用後，用戶在取車前一定時間可無條件取消\n                                                                ")}</div></>}</div></div>
<div className="border-t border-green-200 pt-4 mt-2"><RimoElement kind="el-row" gutter={24}><RimoElement kind="el-col" span={12}><RimoElement kind="el-form-item" label="免責取消退款方式" labelWidth="140px"><RimoElement kind="el-radio-group" modelValue={view.settings.freeCancelRefund} onModelChange={value => {
                                        model.write(["settings", "freeCancelRefund"], value);
                                      }}><RimoElement kind="el-radio" label="full">{text("全額退款")}</RimoElement>
<RimoElement kind="el-radio" label="partial">{text("扣除手續費")}</RimoElement></RimoElement></RimoElement></RimoElement>
{view.settings.freeCancelRefund === 'partial' ? <><RimoElement kind="el-col" span={12}><RimoElement kind="el-form-item" label="手續費" labelWidth="80px"><RimoElement kind="el-input-number" modelValue={view.settings.freeCancelFee} onModelChange={value => {
                                          model.write(["settings", "freeCancelFee"], value);
                                        }} min={0} style={rimoStyle("width: 100px")}></RimoElement>
<span className="ml-2 text-gray-400">{text("元")}</span></RimoElement></RimoElement></> : null}</RimoElement></div></div>
<RimoElement kind="el-divider" contentPosition="left"><span className="text-sm text-red-600 font-medium">{text("有責取消條件")}</span></RimoElement>
<div className="bg-red-50 rounded-lg p-4 mb-4 border border-red-100"><p className="text-xs text-gray-500 mb-4">{view.settings.freeCancelBeforePickupEnabled ? <><span>{text("\n                                                                取車前 ")}
<span className="font-bold text-red-600">{rimoText(view.settings.freeCancelBeforePickupHours)}</span>
{text("\n                                                                小時內取消，\n                                                            ")}</span></> : <><span>{text("\n                                                                不滿足免責條件時，\n                                                            ")}</span></>}
{text("\n                                                            視爲有責取消\n                                                        ")}</p>
<RimoElement kind="el-row" gutter={24}><RimoElement kind="el-col" span={8}><RimoElement kind="el-form-item" label="違約金計算方式"><RimoElement kind="el-select" modelValue={view.settings.penaltyCancelType} onModelChange={value => {
                                      model.write(["settings", "penaltyCancelType"], value);
                                    }} style={rimoStyle("width: 160px")}><RimoElement kind="el-option" label="固定金額" value="fixed"></RimoElement>
<RimoElement kind="el-option" label="預授權比例" value="auth_percent"></RimoElement></RimoElement></RimoElement></RimoElement>
{view.settings.penaltyCancelType === 'fixed' ? <><RimoElement kind="el-col" span={8}><RimoElement kind="el-form-item" label="違約金"><RimoElement kind="el-input-number" modelValue={view.settings.penaltyCancelFixed} onModelChange={value => {
                                        model.write(["settings", "penaltyCancelFixed"], value);
                                      }} min={0} style={rimoStyle("width: 100px")}></RimoElement>
<span className="ml-2 text-gray-400">{text("元")}</span></RimoElement></RimoElement></> : null}
{view.settings.penaltyCancelType === 'auth_percent' ? <><RimoElement kind="el-col" span={8}><RimoElement kind="el-form-item" label="預授權比例"><RimoElement kind="el-input-number" modelValue={view.settings.penaltyCancelPercent} onModelChange={value => {
                                        model.write(["settings", "penaltyCancelPercent"], value);
                                      }} min={0} max={100} style={rimoStyle("width: 100px")}></RimoElement>
<span className="ml-2 text-gray-400">{text("%")}</span></RimoElement></RimoElement></> : null}</RimoElement>
<RimoElement kind="el-row" gutter={24}><RimoElement kind="el-col" span={12}><RimoElement kind="el-form-item" label="是否階梯扣費"><RimoElement kind="el-switch" modelValue={view.settings.penaltyCancelTiered} onModelChange={value => {
                                      model.write(["settings", "penaltyCancelTiered"], value);
                                    }} activeText="是" inactiveText="否"></RimoElement></RimoElement></RimoElement></RimoElement>
{view.settings.penaltyCancelTiered ? <><div className="mt-4 bg-white rounded-lg p-4 border border-red-200"><div className="text-sm font-medium text-gray-700 mb-3">{text("\n                                                                階梯扣費規則（取車前時間越近，扣費越高）\n                                                            ")}</div>
<div className="text-xs text-gray-400 mb-3">{text("\n                                                                階梯數值跟隨違約金計算方式：固定金額時填寫元，預授權比例時填寫百分比。\n                                                            ")}</div>
<RimoTable className="w-full text-sm"><thead><tr className="text-left text-gray-500 border-b"><th className="pb-2 w-12">{text("#")}</th>
<th className="pb-2">{text("取車前時間")}</th>
<th className="pb-2">{rimoText(view.settings.penaltyCancelType === 'fixed' ? '扣除金額' : '預授權比例')}</th>
<th className="pb-2 w-16"></th></tr></thead>
<tbody>{rimoEntries(view.settings.penaltyCancelTiers).map(([tier, idx], _itemIndex) => <Fragment key={idx}><tr key={idx} className="border-b border-gray-100"><td className="py-2 text-gray-400">{rimoText(idx + 1)}{text("\n                                                                        ")}</td>
<td className="py-2"><div className="flex items-center gap-2"><span className="text-gray-500">{text("≤")}</span>
<RimoElement kind="el-input-number" modelValue={tier.hours} onModelChange={value => {
                                                model.assign(tier, "hours", value);
                                              }} min={0} size="small" style={rimoStyle("width: 80px")}></RimoElement>
<span className="text-gray-500">{text("小時")}</span></div></td>
<td className="py-2"><div className="flex items-center gap-2">{view.settings.penaltyCancelType === 'fixed' ? <><RimoElement kind="el-input-number" modelValue={tier.amount} onModelChange={value => {
                                                  model.assign(tier, "amount", value);
                                                }} min={0} step={50} size="small" style={rimoStyle("width: 90px")}></RimoElement></> : <><RimoElement kind="el-input-number" modelValue={tier.percent} onModelChange={value => {
                                                  model.assign(tier, "percent", value);
                                                }} min={0} max={100} size="small" style={rimoStyle("width: 80px")}></RimoElement></>}
<span className="text-gray-500">{rimoText(view.settings.penaltyCancelType === 'fixed' ? '元' : '%')}</span></div></td>
<td className="py-2">{view.settings.penaltyCancelTiers.length > 1 ? <><RimoElement kind="el-button" type="danger" link={true} size="small" onClick={_event => {
                                                view.settings.penaltyCancelTiers.splice(idx, 1);
                                              }}><RimoElement kind="el-icon"><RimoIcon name="Delete" /></RimoElement></RimoElement></> : null}</td></tr></Fragment>)}</tbody></RimoTable>
<RimoElement kind="el-button" type="primary" text={true} size="small" className="mt-3" onClick={_event => {
                                    view.settings.penaltyCancelTiers.push({
                                      hours: 0,
                                      amount: view.settings.penaltyCancelFixed,
                                      percent: view.settings.penaltyCancelPercent
                                    });
                                  }}><RimoElement kind="el-icon" className="mr-1"><RimoIcon name="Plus" /></RimoElement>
{text(" 添加階梯\n                                                            ")}</RimoElement></div></> : null}</div>
<RimoElement kind="el-divider" contentPosition="left"><span className="text-sm text-orange-600 font-medium">{text("超時還車規則")}</span></RimoElement>
<div className="bg-orange-50 rounded-lg p-4 border border-orange-100"><p className="text-xs text-gray-500 mb-4">{text("\n                                                            超時還車按「時租與日租」規則計費：未滿 ")}
<span className="font-bold text-orange-600">{rimoText(view.settings.hourlyToDailyThreshold)}</span>
{text("\n                                                            小時按日租比例計費，不足 1 小時按 1 小時計；達到閾值後按整天計算\n                                                        ")}</p>
<div className="bg-white rounded-lg p-4 border border-orange-200"><div className="text-sm font-medium text-gray-700 mb-2">{text("超時免費寬限\n                                                            ")}</div>
<div className="text-xs text-gray-400 mb-3">{text("寬限期內還車不收取超時費")}</div>
<div className="flex items-center gap-2"><RimoElement kind="el-input-number" modelValue={view.settings.overtimeGracePeriod} onModelChange={value => {
                                    model.write(["settings", "overtimeGracePeriod"], value);
                                  }} min={0} max={120} style={rimoStyle("width: 120px")}></RimoElement>
<span className="text-gray-500">{text("分鐘")}</span></div></div>
<div className="mt-4 bg-white rounded-lg p-4 border border-orange-200"><div className="flex items-center justify-between"><div><div className="text-sm font-medium text-gray-700">{text("超時罰款\n                                                                    ")}</div>
<div className="text-xs text-gray-400 mt-1">{text("\n                                                                        在超時費基礎上額外收取的罰款\n                                                                    ")}</div></div>
<div className="flex items-center gap-3"><RimoElement kind="el-switch" modelValue={view.settings.overtimePenaltyEnabled} onModelChange={value => {
                                      model.write(["settings", "overtimePenaltyEnabled"], value);
                                    }}></RimoElement></div></div>
{view.settings.overtimePenaltyEnabled ? <><div className="mt-4 pt-4 border-t border-gray-100"><div className="grid grid-cols-2 gap-4"><div><div className="text-xs text-gray-500 mb-2">{text("罰款類型\n                                                                        ")}</div>
<RimoElement kind="el-radio-group" modelValue={view.settings.overtimePenaltyType} onModelChange={value => {
                                          model.write(["settings", "overtimePenaltyType"], value);
                                        }}><RimoElement kind="el-radio" label="fixed">{text("固定金額")}</RimoElement>
<RimoElement kind="el-radio" label="percentage">{text("按超時費比例")}</RimoElement></RimoElement></div>
<div><div className="text-xs text-gray-500 mb-2">{text("罰款數額\n                                                                        ")}</div>
<div className="flex items-center gap-2"><RimoElement kind="el-input-number" modelValue={view.settings.overtimePenaltyAmount} onModelChange={value => {
                                            model.write(["settings", "overtimePenaltyAmount"], value);
                                          }} min={0} style={rimoStyle("width: 120px")}></RimoElement>
{view.settings.overtimePenaltyType === 'fixed' ? <><span className="text-gray-500">{text("元")}</span></> : <><span className="text-gray-500">{text("%")}</span></>}</div></div></div></div></> : null}</div>
<div className="mt-4 bg-white rounded-lg p-4 border border-orange-200"><div className="flex items-center justify-between"><div><div className="text-sm font-medium text-gray-700">{text("超時費封頂\n                                                                    ")}</div>
<div className="text-xs text-gray-400 mt-1">{text("\n                                                                        限制單次超時的最高費用（不含罰款）\n                                                                    ")}</div></div>
<div className="flex items-center gap-3"><RimoElement kind="el-switch" modelValue={view.settings.overtimeMaxEnabled} onModelChange={value => {
                                      model.write(["settings", "overtimeMaxEnabled"], value);
                                    }}></RimoElement>
{view.settings.overtimeMaxEnabled ? <><div className="flex items-center gap-2"><span className="text-gray-500">{text("最高")}</span>
<RimoElement kind="el-input-number" modelValue={view.settings.overtimeMaxAmount} onModelChange={value => {
                                          model.write(["settings", "overtimeMaxAmount"], value);
                                        }} min={0} style={rimoStyle("width: 120px")}></RimoElement>
<span className="text-gray-500">{text("元")}</span></div></> : null}</div></div></div></div></RimoElement></div></section></> : null}
{view.canViewStoreRule('extension') ? <><section id="store-extension" className="store-rule-section"><div className="bg-sky-50/50 rounded-xl p-6 border border-sky-100"><div className="flex items-center justify-between mb-5"><div className="flex items-center"><div className="w-10 h-10 bg-sky-100 rounded-lg flex items-center justify-center mr-4"><RimoElement kind="el-icon" className="text-sky-600 text-xl"><RimoIcon name="Clock" /></RimoElement></div>
<div><h3 className="font-bold text-gray-800 text-lg">{text("續租規則")}</h3>
<p className="text-gray-400 text-sm">{text("控制延長用車、逾期補辦續租、庫存衝突和費用處理")}</p></div></div>
<div>{view.cardLocks.extension ? <><RimoElement kind="el-button" type="primary" plain={true} size="small" onClick={_event => {
                                  view.unlockCard('extension');
                                }}><RimoElement kind="el-icon" className="mr-1"><RimoIcon name="Lock" /></RimoElement>
{text(" 解鎖編輯\n                                                        ")}</RimoElement></> : <><div className="flex gap-2"><RimoElement kind="el-button" size="small" onClick={_event => {
                                    view.cancelCard('extension');
                                  }}>{text("取消")}</RimoElement>
<RimoElement kind="el-button" type="primary" size="small" onClick={_event => {
                                    view.saveCard('extension');
                                  }}><RimoElement kind="el-icon" className="mr-1"><RimoIcon name="Check" /></RimoElement>
{text(" 保存\n                                                            ")}</RimoElement></div></>}</div></div>
<RimoElement kind="el-form" disabled={view.cardLocks.extension} model={view.settings} labelWidth="180px" labelPosition="left"><RimoElement kind="el-row" gutter={24}><RimoElement kind="el-col" span={12}><RimoElement kind="el-form-item" label="允許延長用車"><RimoElement kind="el-switch" modelValue={view.settings.allowExtension} onModelChange={value => {
                                    model.write(["settings", "allowExtension"], value);
                                  }}></RimoElement></RimoElement></RimoElement>
<RimoElement kind="el-col" span={12}><RimoElement kind="el-form-item" label="允許逾期補辦續租"><RimoElement kind="el-switch" modelValue={view.settings.allowOverdueExtension} onModelChange={value => {
                                    model.write(["settings", "allowOverdueExtension"], value);
                                  }}></RimoElement></RimoElement></RimoElement></RimoElement>
<div className="rounded-lg bg-white border border-sky-100 px-3 py-2 text-xs text-gray-600 mb-4">{text("\n                                                            本期不限制單次最大延長天數；只要沒有後續訂單衝突，且費用、風控和權限校驗通過，即可確認延長。\n                                                        ")}</div>
<RimoElement kind="el-divider" contentPosition="left"><span className="text-sm text-gray-400">{text("庫存衝突處理")}</span></RimoElement>
<div className="bg-white rounded-lg border border-sky-100 p-4 mb-4"><RimoElement kind="el-form-item" label="後續訂單衝突"><RimoElement kind="el-select" modelValue={view.settings.extensionConflictPolicy} onModelChange={value => {
                                  model.write(["settings", "extensionConflictPolicy"], value);
                                }} style={rimoStyle("width: 260px")}><RimoElement kind="el-option" label="先改派後續訂單，否則拒絕續租" value="reassign_or_reject"></RimoElement>
<RimoElement kind="el-option" label="僅提示衝突，人工確認" value="manual_confirm"></RimoElement></RimoElement>
<div className="text-xs text-gray-500 mt-2">{text("\n                                                                確認延長前必須檢查當前車輛在新增租期內是否已被後續訂單佔用。\n                                                            ")}</div></RimoElement></div>
<RimoElement kind="el-divider" contentPosition="left"><span className="text-sm text-gray-400">{text("客戶自付結算")}</span></RimoElement>
<div className="bg-white rounded-lg border border-sky-100 p-4"><RimoElement kind="el-form-item" label="可選結算方式"><RimoElement kind="el-checkbox-group" modelValue={view.settings.extensionSettlementModes} onModelChange={value => {
                                  model.write(["settings", "extensionSettlementModes"], value);
                                }}><RimoElement kind="el-checkbox" label="immediate" border={true}>{text("立即收款")}</RimoElement>
<RimoElement kind="el-checkbox" label="return_settlement" border={true}>{text("還車時結算")}</RimoElement></RimoElement></RimoElement>
<RimoElement kind="el-row" gutter={24}><RimoElement kind="el-col" span={8}><RimoElement kind="el-form-item" label="超過時長必須收款"><RimoElement kind="el-input-number" modelValue={view.settings.extensionImmediateCollectHours} onModelChange={value => {
                                      model.write(["settings", "extensionImmediateCollectHours"], value);
                                    }} min={1} max={720} style={rimoStyle("width: 120px")}></RimoElement>
<span className="ml-2 text-gray-400">{text("小時")}</span></RimoElement></RimoElement>
<RimoElement kind="el-col" span={8}><RimoElement kind="el-form-item" label="超過金額必須收款"><RimoElement kind="el-input-number" modelValue={view.settings.extensionImmediateCollectAmount} onModelChange={value => {
                                      model.write(["settings", "extensionImmediateCollectAmount"], value);
                                    }} min={0} step={100} style={rimoStyle("width: 120px")}></RimoElement>
<span className="ml-2 text-gray-400">{text("元")}</span></RimoElement></RimoElement>
<RimoElement kind="el-col" span={8}><RimoElement kind="el-form-item" label="風險客戶必須收款"><RimoElement kind="el-switch" modelValue={view.settings.extensionForceCollectRisk} onModelChange={value => {
                                      model.write(["settings", "extensionForceCollectRisk"], value);
                                    }}></RimoElement></RimoElement></RimoElement></RimoElement>
<div className="rounded-lg bg-slate-50 border border-slate-200 px-3 py-2 text-xs text-gray-600">{text("\n                                                            企業月結訂單不展示立即收款和還車時結算選項，續租費用隨還車最終應收統一進入企業賬單。\n                                                        ")}</div></div></RimoElement></div></section></> : null}</div></div></div></RimoElement></> : null}
{view.canViewRentalRuleTab('sharing') ? <><RimoElement kind="el-tab-pane" name="sharing" className="p-6" slots={{
              "label": _slot => <><span className="flex items-center gap-2"><RimoElement kind="el-icon"><RimoIcon name="Clock" /></RimoElement>
<span>{text("分時租賃")}</span></span></>
            }}><div className="w-full"><div className="mb-6"><h2 className="text-xl font-bold text-gray-800">{text("分時租賃規則")}</h2>
<p className="text-gray-500 text-sm mt-1">{text("配置同站租還與甲租乙還的共用規則、訂單限制、取還車與風控策略。")}</p></div>
<div className="grid gap-6" style={rimoStyle("grid-template-columns: 220px minmax(0, 1fr);")}><div className="sharing-rule-nav rounded-xl border border-gray-100 bg-gray-50 p-3 h-fit"><div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">{text("規則分類\n                                        ")}</div>
{rimoEntries(view.visibleSharingRuleNavGroups).map(([group], _itemIndex) => <Fragment key={group.label}><>{group.label ? <><div className="mt-3 mb-1 px-3 text-xs font-semibold text-gray-400">{text("\n                                                ")}{rimoText(group.label)}{text("\n                                            ")}</div></> : null}
{rimoEntries(group.items).map(([item], _itemIndex) => <Fragment key={item.key}><a key={item.key} href={'#' + item.anchor} className="rule-nav-link block rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition-colors" onClick={event => {
                            event.preventDefault();
                            view.scrollToRule(item.anchor);
                          }}>{text("\n                                                ")}{rimoText(item.label)}{text("\n                                            ")}</a></Fragment>)}</></Fragment>)}
{view.visibleSharingRuleNavGroups.length === 0 ? <><div className="rounded-lg bg-white px-3 py-4 text-xs text-gray-400">{text("\n                                            當前賬號暫無可查看的分時租賃設置項\n                                        ")}</div></> : null}</div>
<div className="space-y-6 min-w-0">{view.canViewSharingRule('global') ? <><section id="sharing-global" className="sharing-rule-section"><div className="bg-gray-50 rounded-xl p-6 border border-gray-100"><div className="flex items-center justify-between mb-5"><div className="flex items-center"><div className="w-10 h-10 bg-[color:var(--app-color-primary-light-8)] rounded-lg flex items-center justify-center mr-4"><RimoElement kind="el-icon" className="text-[color:var(--app-color-primary)] text-xl"><RimoIcon name="Operation" /></RimoElement></div>
<div><h3 className="font-bold text-gray-800 text-lg">{text("分時共用規則")}</h3>
<p className="text-gray-400 text-sm">{text("適用於同站租還及甲租乙還的基礎規則")}</p></div></div>
<div>{view.sharingCardLocks.global ? <><RimoElement kind="el-button" type="primary" plain={true} size="small" onClick={_event => {
                                  model.write(["sharingCardLocks", "global"], false);
                                }}><RimoElement kind="el-icon" className="mr-1"><RimoIcon name="Lock" /></RimoElement>
{text(" 解鎖編輯\n                                                        ")}</RimoElement></> : <><div className="flex gap-2"><RimoElement kind="el-button" size="small" onClick={_event => {
                                    model.write(["sharingCardLocks", "global"], true);
                                  }}>{text("取消")}</RimoElement>
<RimoElement kind="el-button" type="primary" size="small" onClick={_event => {
                                    model.write(["sharingCardLocks", "global"], true);
                                    view.saveSettings();
                                  }}><RimoElement kind="el-icon" className="mr-1"><RimoIcon name="Check" /></RimoElement>
{text(" 保存\n                                                            ")}</RimoElement></div></>}</div></div>
<RimoElement kind="el-form" disabled={view.sharingCardLocks.global} model={view.sharingSettings} labelWidth="180px" labelPosition="left"><RimoElement kind="el-row" gutter={24}><RimoElement kind="el-col" span={12}><RimoElement kind="el-form-item" label="預授權金額倍率"><RimoElement kind="el-input-number" modelValue={view.sharingSettings.preAuthMultiplier} onModelChange={value => {
                                    model.write(["sharingSettings", "preAuthMultiplier"], value);
                                  }} min={1} step={0.5} style={rimoStyle("width: 120px")}></RimoElement>
<span className="ml-2 text-gray-400">{text("倍 (租金)")}</span></RimoElement></RimoElement></RimoElement>
<RimoElement kind="el-divider" contentPosition="left"><span className="text-sm text-gray-400">{text("低油量處理費")}</span></RimoElement>
<RimoElement kind="el-row" gutter={24}><RimoElement kind="el-col" span={12}><RimoElement kind="el-form-item" label="觸發閾值 (低於)"><RimoElement kind="el-input-number" modelValue={view.sharingSettings.lowFuelThreshold} onModelChange={value => {
                                    model.write(["sharingSettings", "lowFuelThreshold"], value);
                                  }} min={0} max={100} style={rimoStyle("width: 120px")}></RimoElement>
<span className="ml-2 text-gray-400">{text("%")}</span></RimoElement></RimoElement>
<RimoElement kind="el-col" span={12}><RimoElement kind="el-form-item" label="收取處理費"><RimoElement kind="el-input-number" modelValue={view.sharingSettings.lowFuelFee} onModelChange={value => {
                                    model.write(["sharingSettings", "lowFuelFee"], value);
                                  }} min={0} step={50} style={rimoStyle("width: 120px")}></RimoElement>
<span className="ml-2 text-gray-400">{text("元")}</span></RimoElement></RimoElement></RimoElement></RimoElement></div></section></> : null}
{view.canViewSharingRule('roundTrip') ? <><section id="sharing-roundtrip" className="sharing-rule-section"><div className="bg-teal-50/50 rounded-xl p-6 border border-teal-100"><div className="flex items-center justify-between mb-5"><div className="flex items-center"><div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center mr-4"><RimoElement kind="el-icon" className="text-teal-600 text-xl"><RimoIcon name="Refresh" /></RimoElement></div>
<div><h3 className="font-bold text-gray-800 text-lg">{text("同站租還規則")}</h3>
<p className="text-gray-400 text-sm">{text("包含取消政策、取還車限制及訂單邏輯")}</p></div></div>
<div>{view.sharingCardLocks.roundTrip ? <><RimoElement kind="el-button" type="primary" plain={true} size="small" onClick={_event => {
                                  model.write(["sharingCardLocks", "roundTrip"], false);
                                }}><RimoElement kind="el-icon" className="mr-1"><RimoIcon name="Lock" /></RimoElement>
{text(" 解鎖編輯\n                                                        ")}</RimoElement></> : <><div className="flex gap-2"><RimoElement kind="el-button" size="small" onClick={_event => {
                                    model.write(["sharingCardLocks", "roundTrip"], true);
                                  }}>{text("取消")}</RimoElement>
<RimoElement kind="el-button" type="primary" size="small" onClick={_event => {
                                    model.write(["sharingCardLocks", "roundTrip"], true);
                                    view.saveSettings();
                                  }}><RimoElement kind="el-icon" className="mr-1"><RimoIcon name="Check" /></RimoElement>
{text(" 保存\n                                                            ")}</RimoElement></div></>}</div></div>
<RimoElement kind="el-form" disabled={view.sharingCardLocks.roundTrip} model={view.sharingSettings} labelWidth="180px" labelPosition="left">{view.canViewSharingRule('roundTripCancel') ? <><section id="sharing-roundtrip-cancel" className="sharing-rule-section"><div className="text-sm font-bold text-gray-700 mb-2">{text("1. 取消與違約")}</div>
<p className="text-xs text-gray-500 mb-4">{text("配置同站租還訂單的免責取消、有責取消、特殊取消和顧客自助取消規則。")}</p>
<div><RimoElement kind="el-divider" contentPosition="left"><span className="text-sm text-green-600 font-medium">{text("免責取消條件")}</span></RimoElement>
<div className="bg-green-50 rounded-lg p-4 mb-4 border border-green-100"><p className="text-xs text-gray-500 mb-4">{text("\n                                                                    滿足以下任一條件即可免責取消（可同時啓用兩種規則）\n                                                                ")}</p>
<div className="flex items-center gap-4 mb-4 p-3 bg-white rounded-lg border border-green-200"><RimoElement kind="el-switch" modelValue={view.sharingSettings.freeCancelAfterOrderEnabled} onModelChange={value => {
                                        model.write(["sharingSettings", "freeCancelAfterOrderEnabled"], value);
                                      }}></RimoElement>
<div className="flex-1"><div className="text-sm font-medium text-gray-700 mb-1">{text("\n                                                                            下單後限時取消\n                                                                        ")}</div>
{view.sharingSettings.freeCancelAfterOrderEnabled ? <><div className="flex items-center gap-2"><span className="text-sm text-gray-500">{text("下單後")}</span>
<RimoElement kind="el-input-number" modelValue={view.sharingSettings.freeCancelAfterOrderMinutes} onModelChange={value => {
                                              model.write(["sharingSettings", "freeCancelAfterOrderMinutes"], value);
                                            }} min={1} max={1440} size="small" style={rimoStyle("width: 100px")}></RimoElement>
<RimoElement kind="el-select" modelValue={view.sharingSettings.freeCancelAfterOrderUnit} onModelChange={value => {
                                              model.write(["sharingSettings", "freeCancelAfterOrderUnit"], value);
                                            }} size="small" style={rimoStyle("width: 80px")}><RimoElement kind="el-option" label="分鐘" value="minutes"></RimoElement>
<RimoElement kind="el-option" label="小時" value="hours"></RimoElement></RimoElement>
<span className="text-sm text-gray-500">{text("內可免責取消")}</span></div></> : <><div className="text-xs text-gray-400">{text("\n                                                                            啓用後，用戶在下單後一定時間內可無條件取消\n                                                                        ")}</div></>}</div></div>
<div className="flex items-center gap-4 mb-4 p-3 bg-white rounded-lg border border-green-200"><RimoElement kind="el-switch" modelValue={view.sharingSettings.freeCancelBeforePickupEnabled} onModelChange={value => {
                                        model.write(["sharingSettings", "freeCancelBeforePickupEnabled"], value);
                                      }}></RimoElement>
<div className="flex-1"><div className="text-sm font-medium text-gray-700 mb-1">{text("\n                                                                            取車前提前取消\n                                                                        ")}</div>
{view.sharingSettings.freeCancelBeforePickupEnabled ? <><div className="flex items-center gap-2"><span className="text-sm text-gray-500">{text("取車前")}</span>
<RimoElement kind="el-input-number" modelValue={view.sharingSettings.freeCancelBeforePickupHours} onModelChange={value => {
                                              model.write(["sharingSettings", "freeCancelBeforePickupHours"], value);
                                            }} min={1} max={168} size="small" style={rimoStyle("width: 100px")}></RimoElement>
<span className="text-sm text-gray-500">{text("小時以上可免責取消")}</span></div></> : <><div className="text-xs text-gray-400">{text("\n                                                                            啓用後，用戶在取車前一定時間可無條件取消\n                                                                        ")}</div></>}</div></div>
<div className="border-t border-green-200 pt-4 mt-2"><RimoElement kind="el-row" gutter={24}><RimoElement kind="el-col" span={24}><RimoElement kind="el-form-item" label="免責取消退款方式" labelWidth="140px"><div className="flex items-center"><RimoElement kind="el-tag" type="success" size="small" effect="dark" className="mr-2">{text("全額退款")}</RimoElement>
<span className="text-xs text-gray-500">{text("免責期內取消，系統將自動原路全額退還租金及押金")}</span></div></RimoElement></RimoElement></RimoElement></div></div>
<RimoElement kind="el-divider" contentPosition="left"><span className="text-sm text-red-600 font-medium">{text("有責取消條件")}</span></RimoElement>
<div className="bg-red-50 rounded-lg p-4 mb-4 border border-red-100"><p className="text-xs text-gray-500 mb-4">{view.sharingSettings.freeCancelBeforePickupEnabled ? <><span>{text("\n                                                                        取車前 ")}
<span className="font-bold text-red-600">{rimoText(view.sharingSettings.freeCancelBeforePickupHours)}</span>
{text(" 小時內取消，\n                                                                    ")}</span></> : <><span>{text("\n                                                                        不滿足免責條件時，\n                                                                    ")}</span></>}
{text("\n                                                                    視爲有責取消\n                                                                ")}</p>
<div className="bg-white rounded-lg p-4 border border-red-200"><div className="text-sm font-medium text-gray-700 mb-3">{text("\n                                                                        階梯扣費規則（取車前時間越近，扣費越高）")}</div>
<RimoTable className="w-full text-sm"><thead><tr className="text-left text-gray-500 border-b"><th className="pb-2 w-12">{text("#")}</th>
<th className="pb-2">{text("開始時間")}</th>
<th className="pb-2">{text("結束時間")}</th>
<th className="pb-2">{text("扣除比例")}</th>
<th className="pb-2 w-16"></th></tr></thead>
<tbody>{rimoEntries(view.sharingSettings.penaltyCancelTiers).map(([tier, idx], _itemIndex) => <Fragment key={idx}><tr key={idx} className="border-b border-gray-100"><td className="py-2 text-gray-400">{rimoText(idx + 1)}{text("\n                                                                                ")}</td>
<td className="py-2"><span className="inline-flex items-center px-2.5 py-1 rounded-md bg-gray-50 text-gray-600 border border-gray-100">{text("\n                                                                                        ")}{rimoText(view.getTierStart(view.sharingSettings.penaltyCancelTiers, idx, 'hours'))}{text(" 小時\n                                                                                    ")}</span></td>
<td className="py-2"><div className="flex items-center gap-2"><span className="text-gray-500">{text("至")}</span>
<RimoElement kind="el-input-number" modelValue={tier.hours} onModelChange={value => {
                                                    model.assign(tier, "hours", value);
                                                  }} min={0} size="small" style={rimoStyle("width: 80px")}></RimoElement>
<span className="text-gray-500">{text("小時")}</span></div></td>
<td className="py-2"><div className="flex items-center gap-2"><RimoElement kind="el-input-number" modelValue={tier.percent} onModelChange={value => {
                                                    model.assign(tier, "percent", value);
                                                  }} min={0} max={100} size="small" style={rimoStyle("width: 80px")}></RimoElement>
<span className="text-gray-500">{text("%")}</span></div></td>
<td className="py-2">{view.sharingSettings.penaltyCancelTiers.length > 1 ? <><RimoElement kind="el-button" type="danger" link={true} size="small" onClick={_event => {
                                                    view.sharingSettings.penaltyCancelTiers.splice(idx, 1);
                                                  }}><RimoElement kind="el-icon"><RimoIcon name="Delete" /></RimoElement></RimoElement></> : null}</td></tr></Fragment>)}</tbody></RimoTable>
<RimoElement kind="el-button" type="primary" text={true} size="small" className="mt-3" onClick={_event => {
                                        view.sharingSettings.penaltyCancelTiers.push({
                                          hours: 0,
                                          percent: 0
                                        });
                                      }}><RimoElement kind="el-icon" className="mr-1"><RimoIcon name="Plus" /></RimoElement>
{text(" 添加階梯\n                                                                    ")}</RimoElement></div>
<div className="mt-6 border-t border-red-200 pt-4" data-rimo-layout="list"><div className="flex justify-between items-center mb-2"><span className="text-sm font-bold text-gray-600">{text("臨時特殊取消規則\n                                                                            (節假日)")}</span>
<RimoElement kind="el-button" link={true} type="primary" size="small" onClick={_event => {
                                          view.sharingSettings.tempCancelLadder.push({
                                            start: '',
                                            end: '',
                                            ratio: 100,
                                            remark: ''
                                          });
                                        }}>{text("+\n                                                                            添加特殊規則")}</RimoElement></div>
<p className="text-xs text-gray-400 mb-2">{text("\n                                                                        設定特定日期範圍內的獨立違約金比例")}</p>
<RimoElement kind="el-table" data={view.sharingSettings.tempCancelLadder} size="small" border={true}><RimoElement kind="el-table-column" label="開始日期" width="140" slots={{
                                          "default": ({
                                            row
                                          }) => <><RimoElement kind="el-date-picker" modelValue={row.start} onModelChange={value => {
                                              model.assign(row, "start", value);
                                            }} type="date" placeholder="選擇日期" style={rimoStyle("width: 100%")}></RimoElement></>
                                        }}></RimoElement>
<RimoElement kind="el-table-column" label="結束日期" width="140" slots={{
                                          "default": ({
                                            row
                                          }) => <><RimoElement kind="el-date-picker" modelValue={row.end} onModelChange={value => {
                                              model.assign(row, "end", value);
                                            }} type="date" placeholder="選擇日期" style={rimoStyle("width: 100%")}></RimoElement></>
                                        }}></RimoElement>
<RimoElement kind="el-table-column" label="扣除比例 (%)" width="100" slots={{
                                          "default": ({
                                            row
                                          }) => <><RimoElement kind="el-input-number" modelValue={row.ratio} onModelChange={value => {
                                              model.assign(row, "ratio", value);
                                            }} min={0} max={100} controls={false} style={rimoStyle("width: 100%")}></RimoElement></>
                                        }}></RimoElement>
<RimoElement kind="el-table-column" label="備註原因" slots={{
                                          "default": ({
                                            row
                                          }) => <><RimoElement kind="el-input" modelValue={row.remark} onModelChange={value => {
                                              model.assign(row, "remark", value);
                                            }} placeholder="如: 春節假期"></RimoElement></>
                                        }}></RimoElement>
<RimoElement kind="el-table-column" label="操作" width="60" slots={{
                                          "default": ({
                                            $index
                                          }) => <><RimoElement kind="el-button" link={true} type="danger" onClick={_event => {
                                              view.sharingSettings.tempCancelLadder.splice($index, 1);
                                            }}><RimoElement kind="el-icon"><RimoIcon name="Delete" /></RimoElement></RimoElement></>
                                        }}></RimoElement></RimoElement></div></div>
<div className="mt-4"><RimoElement kind="el-divider" contentPosition="left"><span className="text-sm text-gray-600 font-medium">{text("顧客自助取消")}</span></RimoElement>
<RimoElement kind="el-form-item" label="允許顧客自助取消"><RimoElement kind="el-switch" modelValue={view.sharingSettings.allowCustomerCancel} onModelChange={value => {
                                        model.write(["sharingSettings", "allowCustomerCancel"], value);
                                      }}></RimoElement></RimoElement>
{view.sharingSettings.allowCustomerCancel ? <><div className="bg-gray-50 p-4 rounded-lg border"><RimoElement kind="el-form-item" label="取消截止時間"><span className="text-gray-500 mr-2">{text("取車前")}</span>
<RimoElement kind="el-input-number" modelValue={view.sharingSettings.customerCancelLeadMinutes} onModelChange={value => {
                                            model.write(["sharingSettings", "customerCancelLeadMinutes"], value);
                                          }} min={0} style={rimoStyle("width: 120px")}></RimoElement>
<span className="text-gray-500 ml-2">{text("分鐘內禁止自助取消")}</span></RimoElement>
<RimoElement kind="el-form-item" label="取消需要審覈"><RimoElement kind="el-switch" modelValue={view.sharingSettings.customerCancelAudit} onModelChange={value => {
                                            model.write(["sharingSettings", "customerCancelAudit"], value);
                                          }}></RimoElement>
<span className="text-xs text-gray-400 ml-2">{text("開啓後需人工確認才退款")}</span></RimoElement></div></> : null}</div></div></section></> : null}
{view.canViewSharingRule('roundTripOvertime') ? <><section id="sharing-roundtrip-overtime" className="sharing-rule-section"><div className="bg-orange-50 rounded-lg p-4 border border-orange-100"><div className="text-sm font-bold text-gray-700 mb-2">{text("2. 超時規則")}</div>
<p className="text-xs text-gray-500 mb-4">{text("\n                                                                同站租還的超時費用按免費寬限時間與超時罰款階梯計算；寬限期內不收取超時費，超過寬限後按下方階梯收取。\n                                                            ")}</p>
<div className="bg-white rounded-lg p-4 border border-orange-200"><div className="text-sm font-medium text-gray-700 mb-2">{text("\n                                                                    超時免費寬限\n                                                                ")}</div>
<div className="text-xs text-gray-400 mb-3">{text("寬限期內還車不收取超時費\n                                                                ")}</div>
<div className="flex items-center gap-2"><RimoElement kind="el-input-number" modelValue={view.sharingSettings.overtimeGracePeriod} onModelChange={value => {
                                        model.write(["sharingSettings", "overtimeGracePeriod"], value);
                                      }} min={0} max={120} style={rimoStyle("width: 120px")}></RimoElement>
<span className="text-gray-500">{text("分鐘")}</span></div></div>
<div className="mt-4 bg-white rounded-lg p-4 border border-orange-200"><div className="flex items-center justify-between mb-4"><div><div className="text-sm font-medium text-gray-700">{text("\n                                                                            超時罰款階梯")}</div>
<div className="text-xs text-gray-400 mt-1">{text("\n                                                                            根據超時時長設定罰款金額\n                                                                        ")}</div></div>
<RimoElement kind="el-switch" modelValue={view.sharingSettings.overtimePenaltyEnabled} onModelChange={value => {
                                        model.write(["sharingSettings", "overtimePenaltyEnabled"], value);
                                      }}></RimoElement></div>
{view.sharingSettings.overtimePenaltyEnabled ? <><div><RimoTable className="w-full text-sm"><thead><tr className="text-left text-gray-500 border-b"><th className="pb-2 w-12">{text("#")}</th>
<th className="pb-2">{text("開始時間")}</th>
<th className="pb-2">{text("結束時間")}</th>
<th className="pb-2">{text("罰款金額")}</th>
<th className="pb-2 w-16"></th></tr></thead>
<tbody>{rimoEntries(view.sharingSettings.overtimePenaltyTiers).map(([tier, idx], _itemIndex) => <Fragment key={idx}><tr key={idx} className="border-b border-gray-100"><td className="py-2 text-gray-400">{rimoText(idx + 1)}{text("\n                                                                                ")}</td>
<td className="py-2"><span className="inline-flex items-center px-2.5 py-1 rounded-md bg-gray-50 text-gray-600 border border-gray-100">{text("\n                                                                                        ")}{rimoText(view.getTierStart(view.sharingSettings.overtimePenaltyTiers, idx, 'minutes', view.sharingSettings.overtimeGracePeriod))}{text(" 分鐘\n                                                                                    ")}</span></td>
<td className="py-2"><div className="flex items-center gap-2"><span className="text-gray-500">{text("至")}</span>
<RimoElement kind="el-input-number" modelValue={tier.minutes} onModelChange={value => {
                                                      model.assign(tier, "minutes", value);
                                                    }} min={1} step={30} size="small" style={rimoStyle("width: 100px")}></RimoElement>
<span className="text-gray-500">{text("分鐘")}</span></div></td>
<td className="py-2"><div className="flex items-center gap-2"><RimoElement kind="el-input-number" modelValue={tier.amount} onModelChange={value => {
                                                      model.assign(tier, "amount", value);
                                                    }} min={0} step={10} size="small" style={rimoStyle("width: 100px")}></RimoElement>
<span className="text-gray-500">{text("元")}</span></div></td>
<td className="py-2"><RimoElement kind="el-button" link={true} type="danger" size="small" onClick={_event => {
                                                    view.sharingSettings.overtimePenaltyTiers.splice(idx, 1);
                                                  }}><RimoElement kind="el-icon"><RimoIcon name="Delete" /></RimoElement></RimoElement></td></tr></Fragment>)}</tbody></RimoTable>
<RimoElement kind="el-button" type="primary" text={true} size="small" className="mt-3" onClick={_event => {
                                          view.sharingSettings.overtimePenaltyTiers.push({
                                            minutes: 30,
                                            amount: 50
                                          });
                                        }}><RimoElement kind="el-icon" className="mr-1"><RimoIcon name="Plus" /></RimoElement>
{text(" 添加階梯\n                                                                    ")}</RimoElement></div></> : null}</div>
<div className="mt-4 bg-white rounded-lg p-4 border border-orange-200"><div className="flex items-center justify-between"><div><div className="flex items-center gap-2"><span className="text-sm font-medium text-gray-700">{text("超時費封頂")}</span>
<RimoElement kind="el-tag" size="small" type="info" effect="plain">{text("開發中")}</RimoElement></div>
<div className="text-xs text-gray-400 mt-1">{text("\n                                                                            功能開發中，暫不支持設置單次超時費用封頂。\n                                                                        ")}</div></div>
<div className="flex items-center gap-3"><RimoElement kind="el-switch" modelValue={view.sharingSettings.overtimeMaxEnabled} onModelChange={value => {
                                          model.write(["sharingSettings", "overtimeMaxEnabled"], value);
                                        }} disabled={true}></RimoElement>
{view.sharingSettings.overtimeMaxEnabled ? <><div className="flex items-center gap-2"><span className="text-gray-500">{text("最高")}</span>
<RimoElement kind="el-input-number" modelValue={view.sharingSettings.overtimeMaxAmount} onModelChange={value => {
                                              model.write(["sharingSettings", "overtimeMaxAmount"], value);
                                            }} min={0} disabled={true} style={rimoStyle("width: 120px")}></RimoElement>
<span className="text-gray-500">{text("元")}</span></div></> : null}</div></div></div></div></section></> : null}
{view.canViewSharingRule('roundTripPickup') ? <><section id="sharing-roundtrip-pickup" className="sharing-rule-section"><div className="bg-red-50 rounded-lg p-4 border border-red-100"><div className="text-sm font-bold text-gray-700 mb-2">{text("3. 取還設置")}</div>
<p className="text-xs text-gray-500 mb-4">{text("配置同站租還的提前取車、訂單間隔、提前還車退款與退款返還渠道。")}</p>
<RimoElement kind="el-row" gutter={24}><RimoElement kind="el-col" span={12}><RimoElement kind="el-form-item" label="允許提前取車時間"><RimoElement kind="el-input-number" modelValue={view.sharingSettings.earlyPickupMinutes} onModelChange={value => {
                                          model.write(["sharingSettings", "earlyPickupMinutes"], value);
                                        }} min={0} step={5} style={rimoStyle("width: 120px")}></RimoElement>
<span className="ml-2 text-gray-400">{text("分鐘")}</span></RimoElement></RimoElement>
<RimoElement kind="el-col" span={12}><RimoElement kind="el-form-item" label="訂單間隔緩衝"><RimoElement kind="el-input-number" modelValue={view.sharingSettings.orderIntervalBuffer} onModelChange={value => {
                                          model.write(["sharingSettings", "orderIntervalBuffer"], value);
                                        }} min={0} step={10} style={rimoStyle("width: 120px")}></RimoElement>
<span className="ml-2 text-gray-400">{text("分鐘")}</span></RimoElement></RimoElement></RimoElement>
<RimoElement kind="el-form-item" label="提前還車退款比例"><RimoElement kind="el-input-number" modelValue={view.sharingSettings.earlyReturnRefundRatio} onModelChange={value => {
                                      model.write(["sharingSettings", "earlyReturnRefundRatio"], value);
                                    }} min={0} max={100} style={rimoStyle("width: 120px")}></RimoElement>
<span className="ml-2 text-gray-400">{text("% (剩餘租金)")}</span></RimoElement>
<RimoElement kind="el-form-item" label="退款返還渠道"><RimoElement kind="el-radio-group" modelValue={view.sharingSettings.earlyReturnRefundChannel} onModelChange={value => {
                                      model.write(["sharingSettings", "earlyReturnRefundChannel"], value);
                                    }}><RimoElement kind="el-radio" label="original" disabled={true}>{text("\n                                                                    原路返回 (支付賬戶)\n                                                                    ")}
<RimoElement kind="el-tag" size="small" type="info" effect="plain" className="ml-2">{text("開發中")}</RimoElement></RimoElement>
<RimoElement kind="el-radio" label="points">{text("會員積分/餘額")}</RimoElement></RimoElement></RimoElement></div></section></> : null}</RimoElement></div></section></> : null}
{view.canViewSharingRule('oneWay') ? <><section id="sharing-oneway" className="sharing-rule-section"><div className="bg-[color:var(--app-color-primary-light-9)] rounded-xl p-6 border border-[color:var(--app-color-primary-light-8)]"><div className="flex items-center justify-between mb-5"><div className="flex items-center"><div className="w-10 h-10 bg-[color:var(--app-color-primary-light-8)] rounded-lg flex items-center justify-center mr-4"><RimoElement kind="el-icon" className="text-[color:var(--app-color-primary)] text-xl"><RimoIcon name="Promotion" /></RimoElement></div>
<div><h3 className="font-bold text-gray-800 text-lg">{text("甲租乙還規則")}</h3>
<p className="text-gray-400 text-sm">{text("預約限制、異地還車及風控設置")}</p></div></div>
<div>{view.sharingCardLocks.oneWay ? <><RimoElement kind="el-button" type="primary" plain={true} size="small" onClick={_event => {
                                  model.write(["sharingCardLocks", "oneWay"], false);
                                }}><RimoElement kind="el-icon" className="mr-1"><RimoIcon name="Lock" /></RimoElement>
{text(" 解鎖編輯\n                                                        ")}</RimoElement></> : <><div className="flex gap-2"><RimoElement kind="el-button" size="small" onClick={_event => {
                                    view.cancelCard('oneWay');
                                  }}>{text("取消")}</RimoElement>
<RimoElement kind="el-button" type="primary" size="small" onClick={_event => {
                                    view.saveCard('oneWay');
                                  }}><RimoElement kind="el-icon" className="mr-1"><RimoIcon name="Check" /></RimoElement>
{text(" 保存\n                                                            ")}</RimoElement></div></>}</div></div>
<RimoElement kind="el-form" labelWidth="140px" labelPosition="left" disabled={view.sharingCardLocks.oneWay}>{view.canViewSharingRule('oneWayPickup') ? <><section id="sharing-oneway-pickup" className="sharing-rule-section bg-[color:var(--app-color-primary-light-9)] rounded-lg p-4 mb-4 border border-[color:var(--app-color-primary-light-8)]"><div className="text-sm font-bold text-gray-700 mb-2">{text("1. 預約保留時長\n                                                            (超時未取自動取消)")}</div>
<p className="text-xs text-gray-500 mb-4">{text("\n                                                            設定預約後多久未取車將自動取消訂單，可按會員等級設置差異化時長。")}</p>
<RimoElement kind="el-form-item" label="默認保留時長"><RimoElement kind="el-input-number" modelValue={view.sharingSettings.oneWayPickupDefaultMinutes} onModelChange={value => {
                                    model.write(["sharingSettings", "oneWayPickupDefaultMinutes"], value);
                                  }} min={1} step={10} style={rimoStyle("width: 120px")}></RimoElement>
<span className="text-gray-500 ml-2">{text("分鐘")}</span></RimoElement>
<div className="bg-white rounded-lg p-4 border border-[color:var(--app-color-primary-light-7)] mt-2" data-rimo-layout="list"><div className="flex justify-between items-center mb-2"><span className="text-xs font-medium text-gray-600">{text("會員差異化設置")}</span>
<RimoElement kind="el-button" link={true} type="primary" size="small" onClick={_event => {
                                      view.sharingSettings.oneWayPickupTiers.push({
                                        levels: [],
                                        minutes: 30
                                      });
                                    }}>{text("+\n                                                                    添加會員規則")}</RimoElement></div>
<RimoElement kind="el-table" data={view.sharingSettings.oneWayPickupTiers} size="small" border={true}><RimoElement kind="el-table-column" label="會員方案 / 等級" minWidth="180" slots={{
                                      "default": ({
                                        row
                                      }) => <><RimoElement kind="el-select" modelValue={row.levels} onModelChange={value => {
                                          model.assign(row, "levels", value);
                                        }} multiple={true} collapseTags={true} placeholder="選擇會員方案" style={rimoStyle("width: 100%")}>{rimoEntries(view.membershipPlans).map(([plan], _itemIndex) => <Fragment key={plan.id}><RimoElement kind="el-option" key={plan.id} label={plan.name} value={plan.name}></RimoElement></Fragment>)}</RimoElement></>
                                    }}></RimoElement>
<RimoElement kind="el-table-column" label="保留時長 (分鐘)" width="120" slots={{
                                      "default": ({
                                        row
                                      }) => <><RimoElement kind="el-input-number" modelValue={row.minutes} onModelChange={value => {
                                          model.assign(row, "minutes", value);
                                        }} min={1} controls={false} style={rimoStyle("width: 100%")}></RimoElement></>
                                    }}></RimoElement>
<RimoElement kind="el-table-column" label="操作" width="60" slots={{
                                      "default": ({
                                        $index
                                      }) => <><RimoElement kind="el-button" link={true} type="danger" onClick={_event => {
                                          view.sharingSettings.oneWayPickupTiers.splice($index, 1);
                                        }}><RimoElement kind="el-icon"><RimoIcon name="Delete" /></RimoElement></RimoElement></>
                                    }}></RimoElement></RimoElement></div></section></> : null}
{view.canViewSharingRule('oneWayRestrict') ? <><section id="sharing-oneway-restrict" className="sharing-rule-section bg-[color:var(--app-color-primary-light-9)] rounded-lg p-4 mb-4 border border-[color:var(--app-color-primary-light-8)]"><div className="flex justify-between items-center mb-2"><div className="text-sm font-bold text-gray-700">{text("2. 爽約/取消限制規則\n                                                            ")}</div>
<RimoElement kind="el-switch" modelValue={view.sharingSettings.oneWayRestrictEnabled} onModelChange={value => {
                                    model.write(["sharingSettings", "oneWayRestrictEnabled"], value);
                                  }}></RimoElement></div>
<p className="text-xs text-gray-500 mb-4">{text("限制用戶在短時間內頻繁取消訂單的行爲。")}</p>
{view.sharingSettings.oneWayRestrictEnabled ? <><div><div className="grid grid-cols-3 gap-4 mb-4"><div><div className="text-xs text-gray-500 mb-1">{text("統計週期")}</div>
<RimoElement kind="el-input-number" modelValue={view.sharingSettings.oneWayRestrictWindow} onModelChange={value => {
                                          model.write(["sharingSettings", "oneWayRestrictWindow"], value);
                                        }} min={1} size="small" style={rimoStyle("width: 100px")}></RimoElement>
<span className="text-xs text-gray-500 ml-1">{text("小時內")}</span></div>
<div><div className="text-xs text-gray-500 mb-1">{text("最大取消次數")}</div>
<RimoElement kind="el-input-number" modelValue={view.sharingSettings.oneWayRestrictMaxCancels} onModelChange={value => {
                                          model.write(["sharingSettings", "oneWayRestrictMaxCancels"], value);
                                        }} min={1} size="small" style={rimoStyle("width: 100px")}></RimoElement>
<span className="text-xs text-gray-500 ml-1">{text("次")}</span></div>
<div><div className="text-xs text-gray-500 mb-1">{text("禁止預約時長")}</div>
<RimoElement kind="el-input-number" modelValue={view.sharingSettings.oneWayRestrictBanMinutes} onModelChange={value => {
                                          model.write(["sharingSettings", "oneWayRestrictBanMinutes"], value);
                                        }} min={1} size="small" style={rimoStyle("width: 100px")}></RimoElement>
<span className="text-xs text-gray-500 ml-1">{text("分鐘")}</span></div></div>
<div className="bg-white rounded-lg p-4 border border-[color:var(--app-color-primary-light-7)]" data-rimo-layout="list"><div className="flex justify-between items-center mb-2"><span className="text-xs font-medium text-gray-600">{text("會員差異化設置")}</span>
<RimoElement kind="el-button" link={true} type="primary" size="small" onClick={_event => {
                                          view.sharingSettings.oneWayRestrictTiers.push({
                                            levels: [],
                                            window: 24,
                                            maxCancels: 5,
                                            banMinutes: 60
                                          });
                                        }}>{text("+\n                                                                        添加會員規則")}</RimoElement></div>
<RimoElement kind="el-table" data={view.sharingSettings.oneWayRestrictTiers} size="small" border={true}><RimoElement kind="el-table-column" label="會員方案" minWidth="180" slots={{
                                          "default": ({
                                            row
                                          }) => <><RimoElement kind="el-select" modelValue={row.levels} onModelChange={value => {
                                              model.assign(row, "levels", value);
                                            }} multiple={true} collapseTags={true} placeholder="選擇會員方案" style={rimoStyle("width: 100%")}>{rimoEntries(view.membershipPlans).map(([plan], _itemIndex) => <Fragment key={plan.id}><RimoElement kind="el-option" key={plan.id} label={plan.name} value={plan.name}></RimoElement></Fragment>)}</RimoElement></>
                                        }}></RimoElement>
<RimoElement kind="el-table-column" label="統計週期 (時)" slots={{
                                          "default": ({
                                            row
                                          }) => <><RimoElement kind="el-input-number" modelValue={row.window} onModelChange={value => {
                                              model.assign(row, "window", value);
                                            }} min={1} controls={false} style={rimoStyle("width: 100%")}></RimoElement></>
                                        }}></RimoElement>
<RimoElement kind="el-table-column" label="允許取消 (次)" slots={{
                                          "default": ({
                                            row
                                          }) => <><RimoElement kind="el-input-number" modelValue={row.maxCancels} onModelChange={value => {
                                              model.assign(row, "maxCancels", value);
                                            }} min={1} controls={false} style={rimoStyle("width: 100%")}></RimoElement></>
                                        }}></RimoElement>
<RimoElement kind="el-table-column" label="禁封時長 (分)" slots={{
                                          "default": ({
                                            row
                                          }) => <><RimoElement kind="el-input-number" modelValue={row.banMinutes} onModelChange={value => {
                                              model.assign(row, "banMinutes", value);
                                            }} min={1} controls={false} style={rimoStyle("width: 100%")}></RimoElement></>
                                        }}></RimoElement>
<RimoElement kind="el-table-column" label="操作" width="60" slots={{
                                          "default": ({
                                            $index
                                          }) => <><RimoElement kind="el-button" link={true} type="danger" onClick={_event => {
                                              view.sharingSettings.oneWayRestrictTiers.splice($index, 1);
                                            }}><RimoElement kind="el-icon"><RimoIcon name="Delete" /></RimoElement></RimoElement></>
                                        }}></RimoElement></RimoElement></div></div></> : null}</section></> : null}
{view.canViewSharingRule('oneWayPreauth') ? <><section id="sharing-oneway-preauth" className="sharing-rule-section bg-[color:var(--app-color-primary-light-9)] rounded-lg p-4 mb-4 border border-[color:var(--app-color-primary-light-8)]"><div className="text-sm font-bold text-gray-700 mb-2">{text("3. 預授權規則")}</div>
<p className="text-xs text-gray-500 mb-4">{text("設定用車期間的資金凍結策略。")}</p>
<RimoElement kind="el-row" gutter={24}><RimoElement kind="el-col" span={12}><RimoElement kind="el-form-item" label="默認凍結金額"><div className="flex items-center"><RimoElement kind="el-input-number" modelValue={view.sharingSettings.oneWayPreAuthRentHours} onModelChange={value => {
                                          model.write(["sharingSettings", "oneWayPreAuthRentHours"], value);
                                        }} min={0} style={rimoStyle("width: 120px")}></RimoElement>
<span className="text-gray-500 ml-2">{text("小時的租金")}</span></div>
<div className="text-xs text-gray-400 mt-1">{text("\n                                                                        下單時預先凍結相當於此市場的租金")}</div></RimoElement></RimoElement>
<RimoElement kind="el-col" span={12}><RimoElement kind="el-form-item" label="循環預授權間隔"><div className="flex items-center"><RimoElement kind="el-input-number" modelValue={view.sharingSettings.oneWayPreAuthCycleMinutes} onModelChange={value => {
                                          model.write(["sharingSettings", "oneWayPreAuthCycleMinutes"], value);
                                        }} min={0} step={60} style={rimoStyle("width: 120px")}></RimoElement>
<span className="text-gray-500 ml-2">{text("分鐘")}</span></div>
<div className="text-xs text-gray-400 mt-1">{text("\n                                                                        用車期間每隔多久再次執行預授權")}</div></RimoElement></RimoElement></RimoElement></section></> : null}</RimoElement></div></section></> : null}</div></div></div></RimoElement></> : null}</RimoElement></div></div><RimoElement kind="el-dialog" modelValue={view.rentalRuleVersionDialogVisible} onModelChange={value => {
      model.write(["rentalRuleVersionDialogVisible"], value);
    }} title="門市租車規則歷史版本" width="880px" destroyOnClose={true} className="settings-overlay" slots={{
      "footer": _slot => <><RimoElement kind="el-button" onClick={_event => {
          model.write(["rentalRuleVersionDialogVisible"], false);
        }}>{text("關閉")}</RimoElement></>
    }}>{() => <>{view.selectedRentalRuleVersion ? <><div className="grid grid-cols-3 gap-4"><div className="col-span-1 border border-gray-100 rounded-lg overflow-hidden"><div className="px-3 py-2 bg-gray-50 text-xs font-bold text-gray-500">{text("版本列表")}</div>
<div className="divide-y divide-gray-100 max-h-[420px] overflow-y-auto">{rimoEntries(view.ruleVersionRecords).map(([version], _itemIndex) => <Fragment key={version.version}><button key={version.version} className={rimoClass(["w-full text-left px-3 py-3 hover:bg-[color:var(--app-color-primary-light-9)] transition-colors", rimoClass(view.selectedRentalRuleVersion.version === version.version ? 'bg-[color:var(--app-color-primary-light-9)]' : 'bg-white')])} onClick={_event => {
                    model.write(["selectedRentalRuleVersion"], version);
                  }}><div className="font-mono text-xs text-[color:var(--app-color-primary)] font-bold">{rimoText(version.version)}</div>
<div className="text-sm text-gray-800 mt-1">{rimoText(version.title)}</div>
<div className="text-xs text-gray-400 mt-1">{rimoText(version.savedAt)}{text(" · ")}{rimoText(version.savedBy)}</div></button></Fragment>)}</div></div>
<div className="col-span-2 space-y-4"><div className="rounded-lg border border-[color:var(--app-color-primary-light-8)] bg-[color:var(--app-color-primary-light-9)] px-4 py-3"><div className="font-mono font-bold text-gray-900">{rimoText(view.selectedRentalRuleVersion.version)}</div>
<div className="text-sm text-gray-700 mt-1">{rimoText(view.selectedRentalRuleVersion.title)}</div>
<div className="text-xs text-gray-500 mt-1">{text("保存人：")}{rimoText(view.selectedRentalRuleVersion.savedBy)}{text(" · ")}{rimoText(view.selectedRentalRuleVersion.savedAt)}</div></div>
<RimoElement kind="el-descriptions" column={2} border={true} size="small"><RimoElement kind="el-descriptions-item" label="版本名稱">{rimoText(view.selectedRentalRuleVersion.title)}</RimoElement>
<RimoElement kind="el-descriptions-item" label="快照時間">{rimoText(view.selectedRentalRuleVersion.savedAt)}</RimoElement>
<RimoElement kind="el-descriptions-item" label="生效範圍">{text("門市租車全局配置")}</RimoElement>
<RimoElement kind="el-descriptions-item" label="來源頁面">{text("租賃業務規則")}</RimoElement></RimoElement>
<RimoElement kind="el-table" data={view.getRentalRuleSectionRows(view.selectedRentalRuleVersion)} border={true} size="small"><RimoElement kind="el-table-column" prop="section" label="分組" width="160" showOverflowTooltip={true}></RimoElement>
<RimoElement kind="el-table-column" prop="label" label="規則項" width="190" showOverflowTooltip={true}></RimoElement>
<RimoElement kind="el-table-column" prop="value" label="設定值" minWidth="320" showOverflowTooltip={true}></RimoElement></RimoElement></div></div></> : null}</>}</RimoElement></RimoRoot>;
}