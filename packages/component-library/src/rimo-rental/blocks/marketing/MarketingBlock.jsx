import { Fragment } from 'react';
import { useRimoModel, rimoEntries } from '../../lib/rimo-model.js';
import { RimoRoot, RimoIcon, useRimoEnvironment } from '../../lib/RimoEnvironment.jsx';
import { RimoElement, RimoTable, rimoClass, rimoStyle, rimoText } from '../../lib/RimoElements.jsx';
import './marketing.css';
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
    const currentTenant = ref('full');
    const permissionDemoOptions = [{
      label: '全部授權',
      value: 'full'
    }, {
      label: '僅門市租賃',
      value: 'store_only'
    }, {
      label: '僅分時租賃',
      value: 'sharing_both'
    }, {
      label: '分時僅同站',
      value: 'sharing_same'
    }, {
      label: '分時僅甲乙',
      value: 'sharing_oneway'
    }];
    const currentTenantName = computed(() => {
      const map = {
        'full': 'Full License (演示租戶)',
        'store_only': 'Store Only (僅門市)',
        'sharing_both': 'Sharing (全部分時)',
        'sharing_same': 'Sharing (僅同站)',
        'sharing_oneway': 'Sharing (僅甲租乙還)'
      };
      return map[currentTenant.value];
    });
    const hasPermission = code => {
      const permissionMap = {
        full: ['STORE', 'STORE_STANDARD', 'STORE_SELF', 'SHARING', 'SHARING_ROUND', 'SHARING_ONEWAY'],
        store_only: ['STORE', 'STORE_STANDARD', 'STORE_SELF'],
        sharing_both: ['SHARING', 'SHARING_ROUND', 'SHARING_ONEWAY'],
        sharing_same: ['SHARING', 'SHARING_ROUND'],
        sharing_oneway: ['SHARING', 'SHARING_ONEWAY']
      };
      return (permissionMap[currentTenant.value] || []).includes(code);
    };
    const hasScopePermission = scope => {
      const scopePermissionMap = {
        store_standard: 'STORE_STANDARD',
        store_self: 'STORE_SELF',
        sharing_round: 'SHARING_ROUND',
        sharing_oneway: 'SHARING_ONEWAY'
      };
      const permission = scopePermissionMap[scope];
      return permission ? hasPermission(permission) : false;
    };
    const hasAnyAuthorizedScope = (scopes = []) => scopes.some(hasScopePermission);
    const hasStoreBusinessPermission = computed(() => hasPermission('STORE'));
    const hasSharingBusinessPermission = computed(() => hasPermission('SHARING'));
    const switchTenant = type => {
      currentTenant.value = type;
      if (hasStoreBusinessPermission.value) {
        activeBusinessTab.value = 'STORE';
        listFilter.value = 'store';
      } else {
        activeBusinessTab.value = 'SHARING';
        listFilter.value = 'sharing';
      }
      const storeScopes = ['store_standard', 'store_self'].filter(hasScopePermission);
      const sharingScopes = ['sharing_round', 'sharing_oneway'].filter(hasScopePermission);
      listScopeFilters.store.splice(0, listScopeFilters.store.length, ...storeScopes);
      listScopeFilters.sharing.splice(0, listScopeFilters.sharing.length, ...sharingScopes);
      storeFilters.scopes.store_standard = hasScopePermission('store_standard');
      storeFilters.scopes.store_self = hasScopePermission('store_self');
      sharingFilters.scopes.sharing_round = hasScopePermission('sharing_round');
      sharingFilters.scopes.sharing_oneway = hasScopePermission('sharing_oneway');
      feedback.ElMessage.success(`模擬切換租戶: ${currentTenantName.value}`);
    };
    const viewMode = ref('list');
    const listFilter = ref('store');
    const listScopeFilters = reactive({
      store: ['store_standard', 'store_self'],
      storeCarGroups: [],
      sharing: ['sharing_round', 'sharing_oneway'],
      sharingCarGroups: []
    });
    const detailVisible = ref(false);
    const wizardMode = ref('');
    const activeBusinessTab = ref('STORE');
    const storeCarGroups = [{
      id: 'store_economy',
      name: '經濟型'
    }, {
      id: 'store_suv',
      name: 'SUV'
    }, {
      id: 'store_business',
      name: '商務型'
    }, {
      id: 'store_luxury',
      name: '豪華型'
    }, {
      id: 'store_mpv',
      name: 'MPV'
    }];
    const sharingCarGroups = [{
      id: 'sharing_economy',
      name: '經濟型(K-Car)'
    }, {
      id: 'sharing_comfort',
      name: '舒適型'
    }, {
      id: 'sharing_suv',
      name: 'SUV'
    }, {
      id: 'sharing_ev',
      name: '純電'
    }];
    const storeFilters = reactive({
      showScopes: true,
      scopes: {
        store_standard: true,
        store_self: true
      },
      carGroups: []
    });
    const sharingFilters = reactive({
      showScopes: true,
      scopes: {
        sharing_round: true,
        sharing_oneway: true
      },
      carGroups: []
    });
    const scopeOptions = computed(() => {
      const s = [];
      if (hasPermission('STORE_STANDARD') && hasPermission('STORE_SELF')) {
        s.push({
          id: 'store_universal',
          name: '通用(標準+自助)'
        });
      }
      if (hasPermission('STORE_STANDARD')) s.push({
        id: 'store_standard',
        name: '標準門市'
      });
      if (hasPermission('STORE_SELF')) s.push({
        id: 'store_self',
        name: '24h自助'
      });
      const sh = [];
      if (hasPermission('SHARING_ROUND') && hasPermission('SHARING_ONEWAY')) {
        sh.push({
          id: 'sharing_universal',
          name: '通用(同站+異地)'
        });
      }
      if (hasPermission('SHARING_ROUND')) sh.push({
        id: 'sharing_round',
        name: '同站租還'
      });
      if (hasPermission('SHARING_ONEWAY')) sh.push({
        id: 'sharing_oneway',
        name: '甲租乙還'
      });
      return {
        STORE: s,
        SHARING: sh
      };
    });
    const calendarEvents = ref([{
      day: 1,
      title: '五一黃金週大促',
      businessLine: 'STORE',
      scopes: ['store_standard', 'store_self'],
      carGroups: ['store_economy', 'store_suv', 'store_business', 'store_luxury', 'store_mpv']
    }, {
      day: 2,
      title: '五一黃金週大促',
      businessLine: 'STORE',
      scopes: ['store_standard', 'store_self'],
      carGroups: ['store_economy', 'store_suv', 'store_business', 'store_luxury', 'store_mpv']
    }, {
      day: 3,
      title: '五一黃金週大促',
      businessLine: 'STORE',
      scopes: ['store_standard', 'store_self'],
      carGroups: ['store_economy', 'store_suv', 'store_business', 'store_luxury', 'store_mpv']
    }, {
      day: 15,
      title: '年中大促預熱',
      businessLine: 'STORE',
      scopes: ['store_standard'],
      carGroups: ['store_economy', 'store_suv']
    }, {
      day: 15,
      title: '異地還車0手續費',
      businessLine: 'SHARING',
      scopes: ['sharing_oneway'],
      carGroups: ['sharing_economy', 'sharing_comfort', 'sharing_suv', 'sharing_ev']
    }, {
      day: 15,
      title: '大學生認證半價',
      businessLine: 'SHARING',
      scopes: ['sharing_round'],
      carGroups: ['sharing_economy', 'sharing_ev']
    }, {
      day: 15,
      title: '限時免押金額度',
      businessLine: 'STORE',
      scopes: ['store_self'],
      carGroups: ['store_economy', 'store_suv']
    }, {
      day: 20,
      title: '520情侶自駕套餐',
      businessLine: 'STORE',
      scopes: ['store_standard'],
      carGroups: ['store_luxury', 'store_suv']
    }, {
      day: 28,
      title: '月末通勤福利',
      businessLine: 'SHARING',
      scopes: ['sharing_oneway'],
      carGroups: ['sharing_economy']
    }]);
    const currentMonth = ref(new Date('2026-05-01'));
    const getEventsForDay = day => {
      if (day > 35) return [];
      return calendarEvents.value.filter(evt => {
        if (evt.businessLine !== activeBusinessTab.value) return false;
        if (!hasAnyAuthorizedScope(evt.scopes)) return false;
        const currentFilters = activeBusinessTab.value === 'STORE' ? storeFilters : sharingFilters;
        const scopeMatch = evt.scopes.some(scope => currentFilters.scopes[scope]);
        const carGroupFilter = currentFilters.carGroups;
        const carGroupMatch = carGroupFilter.length === 0 || evt.carGroups && evt.carGroups.some(g => carGroupFilter.includes(g));
        return evt.day === day && scopeMatch && carGroupMatch;
      });
    };
    const campaigns = ref([{
      id: 1,
      name: '2026年Q3旺季大促',
      versionId: 'MKT-STORE-20260418-001',
      displayName: '暑期特惠',
      description: '針對暑期旅遊旺季的全面促銷，覆蓋全車型',
      businessLine: 'STORE',
      scope: ['store_standard', 'store_self'],
      startDate: '2026-07-01',
      endDate: '2026-10-31',
      status: 'Running',
      level: 10,
      isActive: true,
      rules: [{
        name: '7月早鳥價'
      }, {
        name: '8月高峯價'
      }]
    }, {
      id: 7,
      name: '學生專案行銷方案',
      versionId: 'MKT-STORE-STUDENT-20260420-001',
      displayName: '學生租車優惠',
      description: '學生身份到店覈驗後享受門市租車優惠',
      businessLine: 'STORE',
      scope: ['store_standard'],
      startDate: '2026-05-01',
      endDate: '2026-12-31',
      status: 'Running',
      level: 7,
      isActive: true,
      manualVerification: true,
      qualificationName: '學生身份',
      requiredDocText: '學生證、在學證明等可證明學生身份的文件',
      rules: [{
        name: '資格覈驗後85折'
      }]
    }, {
      id: 2,
      name: '同站自助夜間卡',
      displayName: '夜貓子卡',
      description: '鼓勵夜間錯峯用車，提升車輛週轉率',
      businessLine: 'SHARING',
      scope: ['sharing_round'],
      startDate: '2026-01-01',
      endDate: '2026-12-31',
      status: 'Running',
      level: 3,
      isActive: true,
      rules: [{
        name: '夜間時租優惠'
      }]
    }, {
      id: 3,
      name: '長三角互通立減',
      displayName: '異地減免',
      description: '異地還車減免50元，促進車輛區域流動',
      businessLine: 'SHARING',
      scope: ['sharing_oneway'],
      startDate: '2026-05-01',
      endDate: '2026-05-31',
      status: 'Running',
      level: 5,
      isActive: true,
      rules: []
    }, {
      id: 4,
      name: '新用戶首單立減',
      versionId: 'MKT-STORE-20260410-002',
      displayName: '新人禮',
      description: '吸引新註冊用戶完成首次下單轉化',
      businessLine: 'STORE',
      scope: ['store_standard'],
      startDate: '2026-06-01',
      endDate: '2026-08-31',
      status: 'Planned',
      level: 8,
      isActive: false,
      rules: [{
        name: '首單減100'
      }]
    }, {
      id: 5,
      name: '春節不打烊大促',
      versionId: 'MKT-STORE-20260328-001',
      displayName: '春節特惠',
      description: '春節期間租車一口價，提前鎖客',
      businessLine: 'STORE',
      scope: ['store_standard', 'store_self'],
      startDate: '2027-01-20',
      endDate: '2027-02-15',
      status: 'Planned',
      level: 3,
      isActive: false,
      rules: [{
        name: '除夕一口價'
      }, {
        name: '初一至初七一口價'
      }]
    }, {
      id: 6,
      name: '週末郊遊季',
      displayName: '週末暢行',
      description: '針對週末用車高峯的定向優惠',
      businessLine: 'SHARING',
      scope: ['sharing_round'],
      startDate: '2026-04-01',
      endDate: '2026-06-30',
      status: 'Ended',
      level: 2,
      isActive: false,
      rules: [{
        name: '週末8折'
      }]
    }]);
    const marketingVersionRecords = ref([{
      version: 'MKT-STORE-20260418-001',
      name: '2026年Q3旺季大促',
      status: '當前生效',
      savedBy: '行銷運營',
      savedAt: '2026-04-18 11:30',
      displayName: '暑期特惠',
      scopeText: '標準門市、自助',
      description: '針對暑期旅遊旺季的全面促銷，覆蓋全車型',
      eligibility: '個人會員、企業資格客戶',
      carGroups: '全部門市車組',
      period: '2026-07-01 ~ 2026-10-31',
      level: '10',
      rules: [{
        name: '7月早鳥價',
        condition: '提前 7 天下單，門市全車組可用',
        action: '平日 85 折，假日 9 折'
      }, {
        name: '8月高峯價',
        condition: '用車時間落在 2026-08-01 ~ 2026-08-31',
        action: '平日 88 折，假日 92 折'
      }, {
        name: '互斥規則',
        condition: '命中多個行銷方案時',
        action: '取優先級最高方案，不疊加'
      }]
    }, {
      version: 'MKT-STORE-20260410-002',
      name: '新用戶首單立減',
      status: '待生效',
      savedBy: '行銷運營',
      savedAt: '2026-04-10 15:00',
      displayName: '新人禮',
      scopeText: '標準門市',
      description: '吸引新註冊用戶完成首次下單轉化',
      eligibility: '新註冊個人會員',
      carGroups: '經濟型、舒適型',
      period: '2026-06-01 ~ 2026-08-31',
      level: '8',
      rules: [{
        name: '首單減100',
        condition: '新註冊個人會員首個門市訂單，最低租期 1 天',
        action: '訂單租金立減 ¥100'
      }, {
        name: '適用渠道',
        condition: '門市櫃檯、App 下單',
        action: '按同一優惠動作執行'
      }, {
        name: '互斥規則',
        condition: '命中其他行銷方案時',
        action: '不疊加，按優先級取最優'
      }]
    }, {
      version: 'MKT-STORE-STUDENT-20260420-001',
      name: '學生專案行銷方案',
      status: '當前生效',
      savedBy: '行銷運營',
      savedAt: '2026-04-20 14:20',
      displayName: '學生租車優惠',
      scopeText: '標準門市',
      description: '學生身份到店覈驗後享受門市租車優惠',
      eligibility: '個人會員',
      manualVerification: true,
      requiredDocText: '學生證、在學證明等可證明學生身份的文件',
      carGroups: '全部門市車組',
      period: '2026-05-01 ~ 2026-12-31',
      level: '7',
      rules: [{
        name: '資格覈驗後85折',
        condition: '客戶取車時提供有效學生證明文件',
        action: '平日 85 折，假日 9 折'
      }, {
        name: '自助限制',
        condition: '24h 自助租車',
        action: '不開放選擇該方案'
      }, {
        name: '覈驗不通過',
        condition: '無法提供有效學生證明',
        action: '門店更換行銷方案並重算尾款'
      }]
    }, {
      version: 'MKT-STORE-20260328-001',
      name: '春節不打烊大促',
      status: '歷史版本',
      savedBy: '行銷主管',
      savedAt: '2026-03-28 09:40',
      displayName: '春節特惠',
      scopeText: '標準門市、自助',
      description: '春節期間租車一口價，提前鎖客',
      eligibility: '個人會員、企業資格客戶',
      carGroups: '全部門市車組',
      period: '2027-01-20 ~ 2027-02-15',
      level: '3',
      rules: [{
        name: '除夕一口價',
        condition: '用車日爲除夕，門市全車組',
        action: '¥399/天'
      }, {
        name: '初一至初七一口價',
        condition: '用車日爲初一至初七，門市全車組',
        action: '¥499/天'
      }, {
        name: '互斥規則',
        condition: '命中優惠券或積分抵扣時',
        action: '不與優惠券疊加'
      }]
    }, {
      version: 'MKT-SHARE-20260418-001',
      name: '同站自助夜間卡',
      status: '當前生效',
      savedBy: '行銷運營',
      savedAt: '2026-04-18 10:30',
      displayName: '夜貓子卡',
      scopeText: '同站租還',
      description: '鼓勵夜間錯峯用車，提升車輛週轉率',
      eligibility: '個人會員',
      carGroups: '分時舒適型',
      period: '2026-01-01 ~ 2026-12-31',
      level: '3',
      rules: [{
        name: '夜間時租優惠',
        condition: '每日 22:00-06:00，同站租還',
        action: '夜間時租 8 折'
      }, {
        name: '互斥規則',
        condition: '命中其他分時行銷方案時',
        action: '不與其他行銷方案疊加'
      }]
    }]);
    const marketingVersionDialogVisible = ref(false);
    const selectedMarketingVersion = ref(null);
    const openMarketingVersion = row => {
      const version = row?.versionId || (row?.businessLine === 'STORE' ? 'MKT-STORE-20260418-001' : 'MKT-SHARE-20260418-001');
      selectedMarketingVersion.value = marketingVersionRecords.value.find(item => item.version === version) || marketingVersionRecords.value.find(item => item.name === row?.name) || marketingVersionRecords.value[0];
      marketingVersionDialogVisible.value = true;
    };
    const getMarketingVersionBasicRows = version => {
      if (!version) return [];
      return [{
        label: '方案名稱',
        value: version.name || '-'
      }, {
        label: '展示名稱',
        value: version.displayName || '-'
      }, {
        label: '方案等級 (排序權重)',
        value: version.level || '-'
      }, {
        label: '狀態',
        value: version.status || '-'
      }, {
        label: '方案有效期',
        value: version.period || '-'
      }, {
        label: '適用場景',
        value: version.scopeText || '-'
      }, {
        label: '客戶羣體',
        value: version.eligibility || '-'
      }, {
        label: '適用國籍',
        value: version.nationalities || '全部國籍'
      }, {
        label: '適用卡種',
        value: version.cardTypes || 'Visa / Mastercard / American Express / 銀聯 / JCB'
      }, {
        label: '到店覈驗',
        value: version.manualVerification ? '需到店覈驗' : '無需到店覈驗'
      }, {
        label: '資格名稱',
        value: version.qualificationName || '-'
      }, {
        label: '證明文件說明',
        value: version.requiredDocText || '無額外上傳要求'
      }, {
        label: '適用車組',
        value: version.carGroups || '-'
      }, {
        label: '方案說明',
        value: version.description || '-'
      }];
    };
    const getMarketingVersionRuleRows = version => {
      if (!version?.rules?.length) return [];
      return version.rules.map(rule => ({
        name: rule.name,
        salesWindow: rule.salesWindow || '不限',
        useWindow: rule.useWindow || version.period || '不限',
        advanceBooking: rule.advanceBooking || (rule.name.includes('早鳥') ? '7 天' : '0 天'),
        carGroup: rule.carGroup || version.carGroups || '全部門市車組',
        membership: rule.membership || version.eligibility || '不限',
        rentalTerm: rule.rentalTerm || (rule.name.includes('首單') ? '1 天起' : '不限'),
        locationScope: rule.locationScope || '全部地區 / 全部門市',
        action: rule.action || '-'
      }));
    };
    const openStoreDetail = row => {
      if (row) {
        wizardMode.value = row.businessLine || 'STORE';
      } else {
        if (!wizardMode.value) wizardMode.value = 'STORE';
      }
      if (wizardMode.value === 'STORE') {
        if (row) {
          const data = JSON.parse(JSON.stringify(row));
          if (data.level === undefined) data.level = 0;
          if (!data.rules) data.rules = [];
          if (!data.tags) data.tags = data.scope || [];
          if (!data.nationalities) data.nationalities = [];
          if (!data.cardTypes) data.cardTypes = [];
          if (!data.description) data.description = '';
          data.manualVerification = !!data.manualVerification;
          if (!data.qualificationName) data.qualificationName = '';
          if (!data.requiredDocText) data.requiredDocText = '';
          if (!data.dateRange && data.startDate && data.endDate) {
            data.dateRange = [data.startDate, data.endDate];
          }
          Object.assign(currentScheme, data);
        } else {
          Object.assign(currentScheme, {
            id: Date.now(),
            name: '',
            displayName: '',
            level: 0,
            businessLine: 'STORE',
            status: true,
            dateRange: [],
            tags: ['store_standard'],
            rules: [],
            nationalities: [],
            cardTypes: [],
            description: '',
            manualVerification: false,
            qualificationName: '',
            requiredDocText: ''
          });
        }
      }
      detailVisible.value = true;
    };
    const filteredCampaigns = computed(() => {
      let result = [];
      if (listFilter.value === 'store') {
        result = campaigns.value.filter(c => c.businessLine === 'STORE' && hasAnyAuthorizedScope(c.scope));
        const selected = listScopeFilters.store;
        if (selected.length > 0) {
          result = result.filter(c => {
            const matchSpecific = c.scope.some(s => selected.includes(s));
            const wantsUniversal = selected.includes('store_universal');
            const isUniversal = c.scope.includes('store_standard') && c.scope.includes('store_self');
            return matchSpecific || wantsUniversal && isUniversal;
          });
        } else {
          result = [];
        }
      } else if (listFilter.value === 'sharing') {
        result = campaigns.value.filter(c => c.businessLine === 'SHARING' && hasAnyAuthorizedScope(c.scope));
        const selected = listScopeFilters.sharing;
        if (selected.length > 0) {
          result = result.filter(c => {
            const matchSpecific = c.scope.some(s => selected.includes(s));
            const wantsUniversal = selected.includes('sharing_universal');
            const isUniversal = c.scope.includes('sharing_round') && c.scope.includes('sharing_oneway');
            return matchSpecific || wantsUniversal && isUniversal;
          });
        } else {
          result = [];
        }
      } else {
        result = campaigns.value;
      }
      return result;
    });
    const getScopeLabel = row => {
      let labels = [];
      if (row.scope.includes('store_standard')) labels.push('標準門市');
      if (row.scope.includes('store_self')) labels.push('自助');
      if (row.scope.includes('sharing_round')) labels.push('同站');
      if (row.scope.includes('sharing_oneway')) labels.push('異地');
      return labels.join(', ');
    };
    const getScopeMiniLabel = scopeId => {
      const map = {
        'store_standard': '標',
        'store_self': '自',
        'sharing_round': '同',
        'sharing_oneway': '異'
      };
      return map[scopeId] || String(scopeId).slice(0, 1);
    };
    const toggleListFilter = (type, id) => {
      const target = type === 'store' ? listScopeFilters.store : listScopeFilters.sharing;
      const idx = target.indexOf(id);
      if (idx > -1) {
        target.splice(idx, 1);
      } else {
        target.push(id);
      }
    };
    const startCreateCampaign = type => {
      wizardMode.value = type;
      if (type === 'STORE') {
        openStoreDetail(null);
        currentScheme.tags = ['store_standard', 'store_self'].filter(hasScopePermission);
      } else {
        Object.assign(currentScheme, {
          id: Date.now(),
          name: '',
          displayName: '',
          level: 0,
          businessLine: 'SHARING',
          status: true,
          dateRange: [],
          tags: ['sharing_round', 'sharing_oneway'].filter(hasScopePermission),
          description: '',
          rules: [],
          nationalities: [],
          cardTypes: [],
          manualVerification: false,
          qualificationName: '',
          requiredDocText: ''
        });
      }
      detailVisible.value = true;
    };
    const currentScheme = reactive({
      id: null,
      name: '',
      displayName: '',
      status: true,
      dateRange: [],
      tags: [],
      description: '',
      manualVerification: false,
      qualificationName: '',
      requiredDocText: '',
      rules: []
    });
    const ruleDialogVisible = ref(false);
    const isEditRule = ref(false);
    let editingRuleIndex = -1;
    const currentRule = reactive({
      name: '',
      dateRange: [],
      salesDateRange: [],
      membership: [],
      carModels: 'all',
      advanceDays: 0,
      minDays: 1,
      maxDays: null,
      regions: [],
      stores: [],
      priceMode: 'uniform',
      type: 'discount',
      value: 9.5,
      weekendType: 'discount',
      weekendValue: 9.5,
      adjustedWeekdayType: 'discount',
      adjustedWeekdayValue: 9.5,
      legalHolidayType: 'discount',
      legalHolidayValue: 9.5,
      sharingPrices: null,
      enableGift: false,
      giftBuy: 3,
      giftOne: 1
    });
    const openRuleDialog = (row, index) => {
      ruleDialogVisible.value = true;
      if (row) {
        isEditRule.value = true;
        editingRuleIndex = index;
        const data = JSON.parse(JSON.stringify(row));
        if (!data.priceMode) data.priceMode = 'uniform';
        if (data.weekendValue === undefined) data.weekendValue = data.value;
        if (!data.weekendType) data.weekendType = data.type || 'discount';
        if (!data.adjustedWeekdayType) data.adjustedWeekdayType = data.type || 'discount';
        if (data.adjustedWeekdayValue === undefined) data.adjustedWeekdayValue = data.value || 0;
        if (!data.legalHolidayType) data.legalHolidayType = data.weekendType || 'discount';
        if (data.legalHolidayValue === undefined) data.legalHolidayValue = data.weekendValue || 0;
        if (!data.sharingPrices) {
          data.sharingPrices = {
            sharing_round: {},
            sharing_oneway: {}
          };
          ['sharing_round', 'sharing_oneway'].forEach(sc => {
            sharingCarGroups.forEach(cg => {
              data.sharingPrices[sc][cg.id] = {
                hourly: 15,
                daily: 99,
                active: false
              };
            });
          });
        }
        if (data.enableGift === undefined) data.enableGift = false;
        if (!data.membership) data.membership = [];
        if (!data.salesDateRange) data.salesDateRange = [];
        Object.assign(currentRule, data);
      } else {
        isEditRule.value = false;
        editingRuleIndex = -1;
        Object.assign(currentRule, {
          name: '',
          dateRange: [],
          salesDateRange: [],
          membership: [],
          carModels: 'all',
          advanceDays: 0,
          minDays: 1,
          maxDays: null,
          regions: [],
          stores: [],
          priceMode: 'uniform',
          type: 'discount',
          value: 9.5,
          weekendType: 'discount',
          weekendValue: 9.5,
          adjustedWeekdayType: 'discount',
          adjustedWeekdayValue: 9.5,
          legalHolidayType: 'discount',
          legalHolidayValue: 9.5,
          sharingPrices: null,
          enableGift: false,
          giftBuy: 3,
          giftOne: 1
        });
        if (wizardMode.value === 'SHARING' && !currentRule.sharingPrices) {
          currentRule.sharingPrices = {
            sharing_round: {},
            sharing_oneway: {}
          };
          ['sharing_round', 'sharing_oneway'].forEach(sc => {
            sharingCarGroups.forEach(cg => {
              currentRule.sharingPrices[sc][cg.id] = {
                hourly: 15,
                daily: 99,
                active: false
              };
            });
          });
        }
      }
    };
    const saveRule = () => {
      if (!currentRule.name) {
        feedback.ElMessage.warning('請輸入規則名稱');
        return;
      }
      const ruleData = JSON.parse(JSON.stringify(currentRule));
      if (ruleData.priceMode === 'uniform') {
        ruleData.weekendValue = ruleData.value;
        ruleData.weekendType = ruleData.type;
      }
      if (isEditRule.value && editingRuleIndex !== -1) {
        currentScheme.rules[editingRuleIndex] = ruleData;
      } else {
        currentScheme.rules.push(ruleData);
      }
      ruleDialogVisible.value = false;
    };
    const removeRule = index => {
      currentScheme.rules.splice(index, 1);
    };
    const submitCampaign = () => {
      if (!currentScheme.name) {
        feedback.ElMessage.warning('請輸入方案名稱');
        return;
      }
      const campaignData = {
        id: Date.now(),
        name: currentScheme.name,
        description: currentScheme.description || currentScheme.displayName,
        businessLine: wizardMode.value,
        scope: [...currentScheme.tags],
        startDate: currentScheme.dateRange?.[0] || '',
        endDate: currentScheme.dateRange?.[1] || '',
        status: currentScheme.status ? 'Running' : 'Stopped'
      };
      campaigns.value.unshift(campaignData);
      detailVisible.value = false;
      feedback.ElMessage.success('方案創建成功');
    };
    const formatDate = dateStr => {
      if (!dateStr) return '-';
      const d = new Date(dateStr);
      return `${d.getMonth() + 1}月${d.getDate()}日`;
    };
    const getCarGroupName = id => {
      if (!storeCarGroups || !sharingCarGroups) return id;
      const g = storeCarGroups.find(c => c.id === id) || sharingCarGroups.find(c => c.id === id);
      return g ? g.name : id;
    };
    const getScopeName = scopeId => {
      const storeOpt = scopeOptions.value.STORE.find(o => o.id === scopeId);
      if (storeOpt) return storeOpt.name;
      const sharingOpt = scopeOptions.value.SHARING.find(o => o.id === scopeId);
      if (sharingOpt) return sharingOpt.name;
      return scopeId;
    };
    const getBusinessStyle = evtOrLine => {
      let businessLine = evtOrLine;
      let scopes = [];
      if (typeof evtOrLine === 'object') {
        businessLine = evtOrLine.businessLine;
        scopes = evtOrLine.scopes || [];
      }
      if (businessLine === 'STORE') {
        const hasStandard = scopes.includes('store_standard');
        const hasSelf = scopes.includes('store_self');
        if (hasStandard && hasSelf) return {
          bg: 'bg-[color:var(--app-color-primary-light-8)]',
          text: 'text-[color:var(--app-color-primary-hover)]',
          border: 'border-[color:var(--app-color-primary)]',
          dot: 'bg-[color:var(--app-color-primary)]'
        };
        if (hasSelf) return {
          bg: 'bg-teal-100',
          text: 'text-teal-700',
          border: 'border-teal-500',
          dot: 'bg-teal-500'
        };
        return {
          bg: 'bg-orange-100',
          text: 'text-orange-700',
          border: 'border-orange-500',
          dot: 'bg-orange-500'
        };
      }
      if (businessLine === 'SHARING') {
        const hasRound = scopes.includes('sharing_round');
        const hasOneWay = scopes.includes('sharing_oneway');
        if (hasRound && hasOneWay) return {
          bg: 'bg-[color:var(--app-color-primary-light-9)]',
          text: 'text-[color:var(--app-color-primary)]',
          border: 'border-[color:var(--app-color-primary)]',
          dot: 'bg-[color:var(--app-color-primary)]'
        };
        if (hasOneWay) return {
          bg: 'bg-rose-100',
          text: 'text-rose-700',
          border: 'border-rose-500',
          dot: 'bg-rose-500'
        };
        return {
          bg: 'bg-cyan-100',
          text: 'text-cyan-700',
          border: 'border-cyan-500',
          dot: 'bg-cyan-500'
        };
      }
      return {
        bg: 'bg-gray-100',
        text: 'text-gray-700',
        border: 'border-gray-500',
        dot: 'bg-gray-500'
      };
    };
    const carGroups = sharingCarGroups;
    return {
      currentTenant,
      currentTenantName,
      switchTenant,
      hasPermission,
      permissionDemoOptions,
      hasStoreBusinessPermission,
      hasSharingBusinessPermission,
      viewMode,
      listFilter,
      listScopeFilters,
      detailVisible,
      wizardMode,
      campaigns,
      filteredCampaigns,
      toggleListFilter,
      marketingVersionRecords,
      marketingVersionDialogVisible,
      selectedMarketingVersion,
      openMarketingVersion,
      getMarketingVersionBasicRows,
      getMarketingVersionRuleRows,
      startCreateCampaign,
      getScopeLabel,
      getScopeMiniLabel,
      openStoreDetail,
      currentScheme,
      currentRule,
      ruleDialogVisible,
      isEditRule,
      openRuleDialog,
      saveRule,
      removeRule,
      submitCampaign,
      formatDate,
      getCarGroupName,
      getScopeName,
      getBusinessStyle,
      calendarEvents,
      currentMonth,
      getEventsForDay,
      scopeOptions,
      activeBusinessTab,
      storeCarGroups,
      sharingCarGroups,
      storeFilters,
      sharingFilters,
      ElMessage: feedback.ElMessage,
      hasScopePermission,
      hasAnyAuthorizedScope,
      editingRuleIndex,
      carGroups
    };
  }
  return pageSetup();
}
export default function MarketingBlock() {
  const model = useRimoModel(createPageState);
  const view = model.view;
  const {
    text
  } = useRimoEnvironment();
  return <RimoRoot model={model} pageKey="marketing" assets={{}}><div data-business-content="" data-rimo-layout="page"><div className="prototype-permission-switcher" aria-label="行銷方案管理權限演示" data-rimo-layout="permissions"><span className="prototype-permission-switcher__label">{text("權限演示")}</span>
<RimoElement kind="el-radio-group" modelValue={view.currentTenant} onModelChange={value => {
          model.write(["currentTenant"], value);
        }} size="small" onChange={event => {
          view.switchTenant?.(event);
        }}>{rimoEntries(view.permissionDemoOptions).map(([option], _itemIndex) => <Fragment key={option.value}><RimoElement kind="el-radio-button" key={option.value} label={option.value}>{rimoText(option.label)}</RimoElement></Fragment>)}</RimoElement></div>
<div className="flex justify-between items-end mb-6" data-rimo-layout="heading"><div><h1 className="text-2xl font-bold text-gray-800 tracking-tight">{text("行銷方案管理")}</h1>
<p className="text-gray-500 text-sm mt-1">{text("統一管理門市與分時業務的行銷優惠方案，支持精細化場景配置。")}</p></div>
<div className="flex gap-3"><RimoElement kind="el-radio-group" modelValue={view.viewMode} onModelChange={value => {
            model.write(["viewMode"], value);
          }} size="large" className="marketing-view-switch" style={rimoStyle("--el-color-primary: var(--app-color-primary); --el-radio-button-checked-bg-color: var(--app-color-primary); --el-radio-button-checked-border-color: var(--app-color-primary); --el-radio-button-checked-text-color: #fff;")}><RimoElement kind="el-radio-button" label="list"><RimoElement kind="el-icon" className="mr-1"><RimoIcon name="List" /></RimoElement>
{text("方案列表")}</RimoElement>
<RimoElement kind="el-radio-button" label="dashboard"><RimoElement kind="el-icon" className="mr-1"><RimoIcon name="Calendar" /></RimoElement>
{text("行銷日曆")}</RimoElement></RimoElement></div></div>
{view.viewMode === 'dashboard' ? <><div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"><RimoElement kind="el-tabs" modelValue={view.activeBusinessTab} onModelChange={value => {
            model.write(["activeBusinessTab"], value);
          }} className="rimo-page-tabs">{view.hasStoreBusinessPermission ? <><RimoElement kind="el-tab-pane" name="STORE" slots={{
                "label": _slot => <><span className="flex items-center gap-2"><RimoElement kind="el-icon"><RimoIcon name="Shop" /></RimoElement>
<span>{text("門市租賃")}</span></span></>
              }}></RimoElement></> : null}
{view.hasSharingBusinessPermission ? <><RimoElement kind="el-tab-pane" name="SHARING" slots={{
                "label": _slot => <><span className="flex items-center gap-2"><RimoElement kind="el-icon"><RimoIcon name="Clock" /></RimoElement>
<span>{text("分時租賃")}</span></span></>
              }}></RimoElement></> : null}</RimoElement>
<div className="px-6 py-3"><div className="flex justify-between items-center mb-3"><RimoElement kind="el-date-picker" modelValue={view.currentMonth} onModelChange={value => {
                model.write(["currentMonth"], value);
              }} type="month" format="YYYY年 M月" clearable={false} className="!w-40 font-bold border-none shadow-none" size="large"></RimoElement>
<div className="flex items-center gap-4"><div className="flex items-center gap-4 text-xs text-gray-600 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">{view.activeBusinessTab === 'STORE' ? <><><div className="flex items-center select-none" title="同時適用標準門市和自助"><span className="w-2.5 h-2.5 rounded-full mr-1.5 bg-[color:var(--app-color-primary)]"></span>
<span className="font-bold text-gray-800">{text("通用")}</span></div>
<div className={rimoClass(["flex items-center cursor-pointer select-none transition-opacity", rimoClass(view.storeFilters.scopes['store_standard'] ? 'opacity-100' : 'opacity-40 grayscale')])} onClick={_event => {
                        model.write(["storeFilters", "scopes", 'store_standard'], !view.storeFilters.scopes['store_standard']);
                      }}><span className="w-2.5 h-2.5 rounded-full mr-1.5 bg-orange-500"></span>
{text("\n                                            標準門市\n                                        ")}</div>
<div className={rimoClass(["flex items-center cursor-pointer select-none transition-opacity", rimoClass(view.storeFilters.scopes['store_self'] ? 'opacity-100' : 'opacity-40 grayscale')])} onClick={_event => {
                        model.write(["storeFilters", "scopes", 'store_self'], !view.storeFilters.scopes['store_self']);
                      }}><span className="w-2.5 h-2.5 rounded-full mr-1.5 bg-teal-500"></span>
{text("\n                                            24h自助\n                                        ")}</div></></> : null}
{view.activeBusinessTab === 'SHARING' ? <><><div className="flex items-center select-none" title="同時適用同站和異地"><span className="w-2.5 h-2.5 rounded-full mr-1.5 bg-[color:var(--app-color-primary)]"></span>
<span className="font-bold text-gray-800">{text("通用")}</span></div>
<div className={rimoClass(["flex items-center cursor-pointer select-none transition-opacity", rimoClass(view.sharingFilters.scopes['sharing_round'] ? 'opacity-100' : 'opacity-40 grayscale')])} onClick={_event => {
                        model.write(["sharingFilters", "scopes", 'sharing_round'], !view.sharingFilters.scopes['sharing_round']);
                      }}><span className="w-2.5 h-2.5 rounded-full mr-1.5 bg-cyan-500"></span>
{text("\n                                            同站\n                                        ")}</div>
<div className={rimoClass(["flex items-center cursor-pointer select-none transition-opacity", rimoClass(view.sharingFilters.scopes['sharing_oneway'] ? 'opacity-100' : 'opacity-40 grayscale')])} onClick={_event => {
                        model.write(["sharingFilters", "scopes", 'sharing_oneway'], !view.sharingFilters.scopes['sharing_oneway']);
                      }}><span className="w-2.5 h-2.5 rounded-full mr-1.5 bg-rose-500"></span>
{text("\n                                            異地\n                                        ")}</div></></> : null}</div>
{view.activeBusinessTab === 'STORE' ? <><><RimoElement kind="el-select" modelValue={view.storeFilters.carGroups} onModelChange={value => {
                      model.write(["storeFilters", "carGroups"], value);
                    }} multiple={true} collapseTags={true} placeholder="篩選車型組" style={rimoStyle("width: 160px")} size="default" clearable={true}>{rimoEntries(view.storeCarGroups).map(([g], _itemIndex) => <Fragment key={g.id}><RimoElement kind="el-option" key={g.id} label={g.name} value={g.id}></RimoElement></Fragment>)}</RimoElement></></> : null}
{view.activeBusinessTab === 'SHARING' ? <><><RimoElement kind="el-select" modelValue={view.sharingFilters.carGroups} onModelChange={value => {
                      model.write(["sharingFilters", "carGroups"], value);
                    }} multiple={true} collapseTags={true} placeholder="篩選車型組" style={rimoStyle("width: 160px")} size="default" clearable={true}>{rimoEntries(view.sharingCarGroups).map(([g], _itemIndex) => <Fragment key={g.id}><RimoElement kind="el-option" key={g.id} label={g.name} value={g.id}></RimoElement></Fragment>)}</RimoElement></></> : null}
{view.activeBusinessTab === 'STORE' ? <><><RimoElement kind="el-button" type="primary" size="large" className="ml-4 shadow-md shadow-[color:var(--app-color-primary-shadow)]" onClick={_event => {
                      view.startCreateCampaign('STORE');
                    }}><RimoElement kind="el-icon" className="mr-1"><RimoIcon name="Plus" /></RimoElement>
{text(" 新建門市方案\n                                    ")}</RimoElement></></> : null}
{view.activeBusinessTab === 'SHARING' ? <><><RimoElement kind="el-button" type="primary" size="large" className="ml-4 shadow-md shadow-[color:var(--app-color-primary-shadow)]" onClick={_event => {
                      view.startCreateCampaign('SHARING');
                    }}><RimoElement kind="el-icon" className="mr-1"><RimoIcon name="Plus" /></RimoElement>
{text(" 新建分時方案\n                                    ")}</RimoElement></></> : null}</div></div></div>
<div className="border rounded-lg overflow-hidden"><div className="grid grid-cols-7 gap-1 bg-gray-50 border-b p-2 text-center text-sm font-bold text-gray-600"><div>{text("週日")}</div>
<div>{text("週一")}</div>
<div>{text("週二")}</div>
<div>{text("週三")}</div>
<div>{text("週四")}</div>
<div>{text("週五")}</div>
<div>{text("週六")}</div></div>
<div className="calendar-grid">{rimoEntries(35).map(([day], _itemIndex) => <Fragment key={day}><div key={day} className="calendar-cell relative hover:bg-gray-50 transition-colors"><div className="text-right text-xs text-gray-400 mb-1">{rimoText(day > 31 ? day - 31 : day)}{text("\n                                ")}</div>
<div className="space-y-1">{rimoEntries(view.getEventsForDay(day).slice(0, 3)).map(([evt], _itemIndex) => <Fragment key={evt.day + evt.title}><div key={evt.day + evt.title} className={rimoClass(["calendar-event truncate border-l-2 pl-1.5 flex items-center gap-1.5", rimoClass([view.getBusinessStyle(evt).bg, view.getBusinessStyle(evt).text, view.getBusinessStyle(evt).border])])}><span className="truncate font-medium text-[11px]">{rimoText(evt.title)}</span></div></Fragment>)}
{view.getEventsForDay(day).length > 3 ? <><RimoElement kind="el-popover" placement="right" title="當日更多方案" width={260} trigger="hover" slots={{
                        "reference": _slot => <><div className="text-xs text-gray-400 cursor-pointer pl-1 hover:text-[color:var(--app-color-primary)] transition-colors font-medium">{text("\n                                                +")}{rimoText(view.getEventsForDay(day).length - 3)}{text(" 更多...\n                                            ")}</div></>
                      }}><div className="space-y-2">{rimoEntries(view.getEventsForDay(day)).map(([evt], _itemIndex) => <Fragment key={evt.title}><div key={evt.title} className="text-xs p-2 rounded bg-gray-50 border border-gray-100"><div className="flex items-center mb-1"><span className={rimoClass(["inline-block w-2 h-2 rounded-full mr-1.5", rimoClass(view.getBusinessStyle(evt).dot)])}></span>
<span className="font-bold text-gray-700">{rimoText(evt.title)}</span></div>
<div className="flex flex-wrap gap-1 pl-3.5">{rimoEntries(evt.scopes).map(([scope], _itemIndex) => <Fragment key={scope}><span key={scope} className="bg-white border px-1 rounded text-[10px] text-gray-500 scale-90 origin-left">{text("\n                                                        ")}{rimoText(view.getScopeName(scope))}{text("\n                                                    ")}</span></Fragment>)}</div></div></Fragment>)}</div></RimoElement></> : null}</div></div></Fragment>)}</div></div></div></> : <><div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"><RimoElement kind="el-tabs" modelValue={view.listFilter} onModelChange={value => {
            model.write(["listFilter"], value);
          }} className="rimo-page-tabs">{view.hasStoreBusinessPermission ? <><RimoElement kind="el-tab-pane" name="store" slots={{
                "label": _slot => <><span className="flex items-center gap-2"><RimoElement kind="el-icon"><RimoIcon name="Shop" /></RimoElement>
<span>{text("門市租賃")}</span></span></>
              }}></RimoElement></> : null}
{view.hasSharingBusinessPermission ? <><RimoElement kind="el-tab-pane" name="sharing" slots={{
                "label": _slot => <><span className="flex items-center gap-2"><RimoElement kind="el-icon"><RimoIcon name="Clock" /></RimoElement>
<span>{text("分時租賃")}</span></span></>
              }}></RimoElement></> : null}</RimoElement>
<div className="px-6 py-4 bg-white border-b border-gray-100 flex items-center justify-between gap-4"><div className="flex items-center gap-3"><div className="relative"><RimoElement kind="el-input" placeholder="搜索方案名稱" prefixIcon="Search" clearable={true} style={rimoStyle("width: 240px")} size="default"></RimoElement></div>
<div className="w-[1px] h-4 bg-gray-200 mx-2"></div>
{view.listFilter === 'store' ? <><><RimoElement kind="el-select" modelValue={view.listScopeFilters.store} onModelChange={value => {
                    model.write(["listScopeFilters", "store"], value);
                  }} multiple={true} collapseTags={true} placeholder="全部適用場景" style={rimoStyle("width: 200px")} size="default" clearable={true}>{rimoEntries(view.scopeOptions.STORE).map(([opt], _itemIndex) => <Fragment key={opt.id}><RimoElement kind="el-option" key={opt.id} label={opt.name} value={opt.id}></RimoElement></Fragment>)}</RimoElement></></> : view.listFilter === 'sharing' ? <><><RimoElement kind="el-select" modelValue={view.listScopeFilters.sharing} onModelChange={value => {
                    model.write(["listScopeFilters", "sharing"], value);
                  }} multiple={true} collapseTags={true} placeholder="全部適用場景" style={rimoStyle("width: 200px")} size="default" clearable={true}>{rimoEntries(view.scopeOptions.SHARING).map(([opt], _itemIndex) => <Fragment key={opt.id}><RimoElement kind="el-option" key={opt.id} label={opt.name} value={opt.id}></RimoElement></Fragment>)}</RimoElement></></> : null}
{view.listFilter === 'store' ? <><><RimoElement kind="el-select" modelValue={view.listScopeFilters.storeCarGroups} onModelChange={value => {
                    model.write(["listScopeFilters", "storeCarGroups"], value);
                  }} multiple={true} collapseTags={true} placeholder="全部車型組" style={rimoStyle("width: 200px")} size="default" clearable={true}>{rimoEntries(view.storeCarGroups).map(([g], _itemIndex) => <Fragment key={g.id}><RimoElement kind="el-option" key={g.id} label={g.name} value={g.id}></RimoElement></Fragment>)}</RimoElement></></> : view.listFilter === 'sharing' ? <><><RimoElement kind="el-select" modelValue={view.listScopeFilters.sharingCarGroups} onModelChange={value => {
                    model.write(["listScopeFilters", "sharingCarGroups"], value);
                  }} multiple={true} collapseTags={true} placeholder="全部車型組" style={rimoStyle("width: 200px")} size="default" clearable={true}>{rimoEntries(view.sharingCarGroups).map(([g], _itemIndex) => <Fragment key={g.id}><RimoElement kind="el-option" key={g.id} label={g.name} value={g.id}></RimoElement></Fragment>)}</RimoElement></></> : null}</div>
{view.listFilter === 'store' ? <><><div className="flex items-center gap-2"><RimoElement kind="el-button" plain={true} onClick={_event => {
                    view.openMarketingVersion();
                  }}>{text("歷史版本")}</RimoElement>
<RimoElement kind="el-button" type="primary" size="large" className="shadow-md shadow-[color:var(--app-color-primary-shadow)]" onClick={_event => {
                    view.startCreateCampaign('STORE');
                  }}><RimoElement kind="el-icon" className="mr-1"><RimoIcon name="Plus" /></RimoElement>
{text(" 新建門市方案\n                                ")}</RimoElement></div></></> : view.listFilter === 'sharing' ? <><><RimoElement kind="el-button" type="primary" size="large" className="shadow-md shadow-[color:var(--app-color-primary-shadow)]" onClick={_event => {
                  view.startCreateCampaign('SHARING');
                }}><RimoElement kind="el-icon" className="mr-1"><RimoIcon name="Plus" /></RimoElement>
{text(" 新建分時方案\n                            ")}</RimoElement></></> : null}</div>
<div data-rimo-layout="list"><RimoElement kind="el-table" data={view.filteredCampaigns} style={rimoStyle("width: 100%")} size="large"><RimoElement kind="el-table-column" prop="name" label="方案名稱" minWidth="200" slots={{
                "default": ({
                  row
                }) => <><div className="font-bold text-gray-800">{rimoText(row.name)}</div>
<div className="text-xs text-gray-400 mt-1">{rimoText(row.description)}</div></>
              }}></RimoElement>
<RimoElement kind="el-table-column" label="方案版本" width="190" slots={{
                "default": ({
                  row
                }) => <><RimoElement kind="el-tag" size="small" type="primary" effect="plain" className="cursor-pointer" onClick={_event => {
                    view.openMarketingVersion(row);
                  }}>{text("\n                                        ")}{rimoText(row.versionId || (row.businessLine === 'STORE' ? 'MKT-STORE-20260418-001' : 'MKT-SHARE-20260418-001'))}{text("\n                                    ")}</RimoElement>
<div className="text-xs text-gray-400 mt-1">{text("訂單快照按版本追溯")}</div></>
              }}></RimoElement>
<RimoElement kind="el-table-column" prop="scope" label="適用場景" width="140" slots={{
                "default": ({
                  row
                }) => <>{row.businessLine === 'STORE' ? <><RimoElement kind="el-tag" type="primary" effect="plain" size="small">{text("門市租賃")}</RimoElement></> : null}
{row.businessLine === 'SHARING' ? <><RimoElement kind="el-tag" type="warning" effect="plain" size="small">{text("分時租車")}</RimoElement></> : null}
<div className="text-xs text-gray-400 mt-1 scale-90 origin-left">{rimoText(view.getScopeLabel(row))}</div></>
              }}></RimoElement>
<RimoElement kind="el-table-column" prop="date" label="有效期" width="220" slots={{
                "default": ({
                  row
                }) => <><div className="flex items-center text-gray-600"><RimoElement kind="el-icon" className="mr-1"><RimoIcon name="Calendar" /></RimoElement>
{text("\n                                        ")}{rimoText(row.startDate)}{text(" ~ ")}{rimoText(row.endDate)}{text("\n                                    ")}</div></>
              }}></RimoElement>
<RimoElement kind="el-table-column" label="包含規則" align="center" width="120" slots={{
                "default": ({
                  row
                }) => <><span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-md text-xs font-bold border border-gray-200">{text("\n                                        ")}{rimoText(row.rules ? row.rules.length : 0)}{text(" Rules\n                                    ")}</span></>
              }}></RimoElement>
<RimoElement kind="el-table-column" prop="status" label="狀態" width="100" slots={{
                "default": ({
                  row
                }) => <><RimoElement kind="el-tag" type={row.status === 'Running' ? 'success' : 'info'} size="small" effect="dark">{rimoText(row.status === 'Running' ? '進行中' : '已結束')}</RimoElement></>
              }}></RimoElement>
<RimoElement kind="el-table-column" label="操作" width="150" align="right" slots={{
                "default": ({
                  row
                }) => <><RimoElement kind="el-button" link={true} type="primary" size="small" onClick={_event => {
                    view.openStoreDetail(row);
                  }}>{text("編輯")}</RimoElement>
<RimoElement kind="el-button" link={true} type="danger" size="small">{text("刪除")}</RimoElement></>
              }}></RimoElement></RimoElement></div></div></>}</div><RimoElement kind="el-drawer" modelValue={view.detailVisible} onModelChange={value => {
      model.write(["detailVisible"], value);
    }} title={view.wizardMode === 'STORE' ? '配置門市優惠方案' : '配置分時優惠方案'} size="60%" slots={{
      "footer": _slot => <><div className="flex justify-end gap-3"><RimoElement kind="el-button" onClick={_event => {
            model.write(["detailVisible"], false);
          }}>{text("取消")}</RimoElement>
<RimoElement kind="el-button" type="primary" size="large" onClick={event => {
            view.submitCampaign?.(event);
          }}>{text("提交方案")}</RimoElement></div></>
    }}>{() => <><div className="px-6 pt-0 pb-6 -mt-5">{view.wizardMode === 'STORE' || view.wizardMode === 'SHARING' ? <><div><div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6"><div className="flex items-center gap-2 mb-3 pb-3 border-b"><div className="w-1 h-5 bg-[color:var(--app-color-primary)] rounded"></div>
<h2 className="text-base font-bold text-gray-800">{text("基本信息")}</h2></div>
<RimoElement kind="el-form" model={view.currentScheme} labelPosition="top"><RimoElement kind="el-row" gutter={24}><RimoElement kind="el-col" span={12}><RimoElement kind="el-form-item" label="方案名稱"><RimoElement kind="el-input" modelValue={view.currentScheme.name} onModelChange={value => {
                          model.write(["currentScheme", "name"], value);
                        }} placeholder="例如：2026年Q3旺季大促" size="large"></RimoElement></RimoElement></RimoElement>
<RimoElement kind="el-col" span={12}><RimoElement kind="el-form-item" label="對外展示名稱"><RimoElement kind="el-input" modelValue={view.currentScheme.displayName} onModelChange={value => {
                          model.write(["currentScheme", "displayName"], value);
                        }} placeholder="例如：暑期特惠" size="large"></RimoElement></RimoElement></RimoElement></RimoElement>
<RimoElement kind="el-row" gutter={24}><RimoElement kind="el-col" span={6}><RimoElement kind="el-form-item" label="方案等級 (排序權重)"><RimoElement kind="el-input-number" modelValue={view.currentScheme.level} onModelChange={value => {
                          model.write(["currentScheme", "level"], value);
                        }} min={0} step={1} controlsPosition="right" style={rimoStyle("width: 100%")} size="large" placeholder="數值越大排序越前"></RimoElement></RimoElement></RimoElement>
<RimoElement kind="el-col" span={6}><RimoElement kind="el-form-item" label="狀態"><RimoElement kind="el-select" modelValue={view.currentScheme.status} onModelChange={value => {
                          model.write(["currentScheme", "status"], value);
                        }} placeholder="請選擇" style={rimoStyle("width: 100%")} size="large"><RimoElement kind="el-option" label="啓用" value={true}></RimoElement>
<RimoElement kind="el-option" label="禁用" value={false}></RimoElement></RimoElement></RimoElement></RimoElement>
<RimoElement kind="el-col" span={12}><RimoElement kind="el-form-item" label="方案有效期"><RimoElement kind="el-date-picker" modelValue={view.currentScheme.dateRange} onModelChange={value => {
                          model.write(["currentScheme", "dateRange"], value);
                        }} type="daterange" rangeSeparator="至" startPlaceholder="開始日期" endPlaceholder="結束日期" format="YYYY-MM-DD" valueFormat="YYYY-MM-DD" style={rimoStyle("width: 100%")} size="large"></RimoElement></RimoElement></RimoElement></RimoElement>
<RimoElement kind="el-row" gutter={24}><RimoElement kind="el-col" span={12}><RimoElement kind="el-form-item" label="適用國籍"><RimoElement kind="el-select" modelValue={view.currentScheme.nationalities} onModelChange={value => {
                          model.write(["currentScheme", "nationalities"], value);
                        }} multiple={true} collapseTags={true} placeholder="全部國籍" style={rimoStyle("width: 100%")} size="large"><RimoElement kind="el-option" label="臺灣" value="TW"></RimoElement>
<RimoElement kind="el-option" label="日本" value="JP"></RimoElement>
<RimoElement kind="el-option" label="韓國" value="KR"></RimoElement>
<RimoElement kind="el-option" label="美國" value="US"></RimoElement>
<RimoElement kind="el-option" label="其他" value="OTHER"></RimoElement></RimoElement></RimoElement></RimoElement>
<RimoElement kind="el-col" span={12}><RimoElement kind="el-form-item" label="適用卡種"><RimoElement kind="el-select" modelValue={view.currentScheme.cardTypes} onModelChange={value => {
                          model.write(["currentScheme", "cardTypes"], value);
                        }} multiple={true} collapseTags={true} placeholder="全部卡種" style={rimoStyle("width: 100%")} size="large"><RimoElement kind="el-option" label="Visa" value="visa"></RimoElement>
<RimoElement kind="el-option" label="Mastercard" value="mastercard"></RimoElement>
<RimoElement kind="el-option" label="American Express" value="amex"></RimoElement>
<RimoElement kind="el-option" label="銀聯 (UnionPay)" value="unionpay"></RimoElement>
<RimoElement kind="el-option" label="JCB" value="jcb"></RimoElement></RimoElement></RimoElement></RimoElement></RimoElement>
<RimoElement kind="el-row"><RimoElement kind="el-col" span={24}><RimoElement kind="el-form-item" label="方案說明" className="mb-0"><RimoElement kind="el-input" modelValue={view.currentScheme.description} onModelChange={value => {
                          model.write(["currentScheme", "description"], value);
                        }} type="textarea" rows={3} placeholder="請輸入方案的內部備註說明..."></RimoElement></RimoElement></RimoElement></RimoElement>
<RimoElement kind="el-row" gutter={24}><RimoElement kind="el-col" span={24}><RimoElement kind="el-form-item" label="適用場景 (必選)"><RimoElement kind="el-checkbox-group" modelValue={view.currentScheme.tags} onModelChange={value => {
                          model.write(["currentScheme", "tags"], value);
                        }}>{view.wizardMode === 'STORE' ? <><><RimoElement kind="el-checkbox" label="store_standard">{text("標準門市")}</RimoElement>
<RimoElement kind="el-checkbox" label="store_self">{text("24h自助")}</RimoElement></></> : <><><RimoElement kind="el-checkbox" label="sharing_round">{text("同站租還")}</RimoElement>
<RimoElement kind="el-checkbox" label="sharing_oneway">{text("甲租乙還")}</RimoElement></></>}</RimoElement></RimoElement></RimoElement></RimoElement>
{view.wizardMode === 'STORE' ? <><RimoElement kind="el-row" gutter={24} className="mt-1"><RimoElement kind="el-col" span={8}><RimoElement kind="el-form-item" label="是否需要到店覈驗"><div className="h-10 flex items-center"><RimoElement kind="el-switch" modelValue={view.currentScheme.manualVerification} onModelChange={value => {
                              model.write(["currentScheme", "manualVerification"], value);
                            }} activeText="需要" inactiveText="不需要"></RimoElement></div></RimoElement></RimoElement>
<RimoElement kind="el-col" span={8}><RimoElement kind="el-form-item" label="資格名稱"><RimoElement kind="el-select" modelValue={view.currentScheme.qualificationName} onModelChange={value => {
                            model.write(["currentScheme", "qualificationName"], value);
                          }} placeholder="選擇資格" style={rimoStyle("width: 100%")} disabled={!view.currentScheme.manualVerification}><RimoElement kind="el-option" label="學生身份" value="學生身份"></RimoElement>
<RimoElement kind="el-option" label="教師身份" value="教師身份"></RimoElement>
<RimoElement kind="el-option" label="軍警身份" value="軍警身份"></RimoElement>
<RimoElement kind="el-option" label="醫護身份" value="醫護身份"></RimoElement>
<RimoElement kind="el-option" label="長者身份" value="長者身份"></RimoElement></RimoElement></RimoElement></RimoElement>
<RimoElement kind="el-col" span={8}><RimoElement kind="el-form-item" label="證明文件說明"><RimoElement kind="el-input" modelValue={view.currentScheme.requiredDocText} onModelChange={value => {
                            model.write(["currentScheme", "requiredDocText"], value);
                          }} placeholder="例如：學生證、在學證明等" disabled={!view.currentScheme.manualVerification}></RimoElement></RimoElement></RimoElement></RimoElement></> : null}
{view.wizardMode === 'STORE' ? <><div className={rimoClass(["text-xs rounded border px-3 py-2", rimoClass(view.currentScheme.manualVerification ? 'bg-amber-50 border-amber-100 text-amber-700' : 'bg-gray-50 border-gray-100 text-gray-600')])}>{text("\n                                ")}{rimoText(view.currentScheme.manualVerification ? '本方案在基礎適用條件命中後，還要求門店取車時覈驗證明文件；24h 自助租車不開放選擇該方案。' : '本方案只按上方基礎條件和規則明細匹配，不要求門店額外上傳證明文件。')}{text("\n                            ")}</div></> : null}</RimoElement></div>
<div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"><div className="flex justify-between items-center mb-5 pb-4 border-b"><div className="flex items-center gap-2"><div className="w-1 h-5 bg-orange-500 rounded"></div>
<h2 className="text-base font-bold text-gray-800">{text("規則明細 (")}{rimoText(view.currentScheme.rules.length)}{text(")\n                                ")}</h2></div>
<RimoElement kind="el-button" type="primary" onClick={_event => {
                    view.openRuleDialog(null);
                  }}><RimoElement kind="el-icon" className="mr-1"><RimoIcon name="Plus" /></RimoElement>
{text(" 添加子規則\n                            ")}</RimoElement></div>
<RimoElement kind="el-table" data={view.currentScheme.rules} style={rimoStyle("width: 100%")} stripe={true} headerCellStyle={{
                  background: '#f9fafb'
                }}><RimoElement kind="el-table-column" prop="name" label="規則名稱" width="180" showOverflowTooltip={true} slots={{
                    "default": ({
                      row
                    }) => <><span className="font-medium text-gray-900">{rimoText(row.name)}</span></>
                  }}></RimoElement>
<RimoElement kind="el-table-column" label="生效條件" minWidth="220" slots={{
                    "default": ({
                      row
                    }) => <><div className="space-y-1"><div className="flex items-center text-xs text-gray-500"><RimoElement kind="el-icon" className="mr-1"><RimoIcon name="Calendar" /></RimoElement>
{row.dateRange && row.dateRange.length ? <><span>{rimoText(view.formatDate(row.dateRange[0]))}{text(" - ")}{rimoText(view.formatDate(row.dateRange[1]))}</span></> : <><span>{text("無日期限制")}</span></>}</div>
<div className="flex items-center gap-1 flex-wrap"><RimoElement kind="el-tag" size="small" type="info" effect="plain">{rimoText(row.carModels === 'all' ? '全系' : '指定車組')}</RimoElement></div></div></>
                  }}></RimoElement>
<RimoElement kind="el-table-column" label="動作預覽" width="200" slots={{
                    "default": ({
                      row
                    }) => <><div className="text-xs space-y-1"><div className="flex items-center"><span className="w-12 text-gray-400">{text("價格:")}</span>
{row.priceMode === 'uniform' ? <><div>{row.type === 'discount' ? <><span className="font-bold text-[color:var(--app-color-primary)]">{rimoText(row.value)}{text("折")}</span></> : row.type === 'minus' ? <><span className="font-bold text-red-500">{text("-")}{rimoText(row.value)}{text("元")}</span></> : <><span className="font-bold text-gray-700">{rimoText(row.value)}{text("元")}</span></>}</div></> : <><div className="flex flex-col gap-1"><span className="text-xs text-gray-500">{text("配置內容:")}</span>
{row.sharingPrices ? <><div className="flex flex-wrap gap-1">{rimoEntries(row.sharingPrices).map(([cfg, scope], _itemIndex) => <Fragment key={scope}><>{rimoEntries(cfg).map(([price, cid], _itemIndex) => <Fragment key={cid}><>{price.active ? <><RimoElement kind="el-tag" size="small" effect="plain" className="mr-1 mb-1">{text("\n                                                                ")}{rimoText(view.getCarGroupName(cid))}{text(":\n                                                                ¥")}{rimoText(price.hourly)}{text("/h\n                                                            ")}</RimoElement></> : null}</></Fragment>)}</></Fragment>)}</div></> : <><span className="text-gray-400">{text("未配置")}</span></>}</div></>}</div></div></>
                  }}></RimoElement>
<RimoElement kind="el-table-column" label="操作" width="140" fixed="right" slots={{
                    "default": ({
                      row,
                      $index
                    }) => <><RimoElement kind="el-button" link={true} type="primary" size="small" onClick={_event => {
                        view.openRuleDialog(row, $index);
                      }}>{text("編輯")}</RimoElement>
<RimoElement kind="el-button" link={true} type="danger" size="small" onClick={_event => {
                        view.removeRule($index);
                      }}>{text("移除")}</RimoElement></>
                  }}></RimoElement></RimoElement></div></div></> : null}</div></>}</RimoElement>
<RimoElement kind="el-dialog" modelValue={view.ruleDialogVisible} onModelChange={value => {
      model.write(["ruleDialogVisible"], value);
    }} title={view.isEditRule ? '編輯優惠規則' : '添加優惠規則'} width="1100px" appendToBody={true} className="rule-dialog" slots={{
      "footer": _slot => <><div className="flex justify-between items-center"><div className="text-xs text-gray-400"><RimoElement kind="el-icon" className="mr-1 relative top-0.5"><RimoIcon name="InfoFilled" /></RimoElement>
{text("所有修改僅在點擊保存後生效\n                    ")}</div>
<div><RimoElement kind="el-button" onClick={_event => {
              model.write(["ruleDialogVisible"], false);
            }}>{text("取消")}</RimoElement>
<RimoElement kind="el-button" type="primary" onClick={event => {
              view.saveRule?.(event);
            }} size="large">{text("保存規則")}</RimoElement></div></div></>
    }}>{() => <><RimoElement kind="el-form" model={view.currentRule} labelWidth="90px" className="rule-form"><div className="mb-6"><RimoElement kind="el-form-item" label="規則名稱" required={true}><RimoElement kind="el-input" modelValue={view.currentRule.name} onModelChange={value => {
                model.write(["currentRule", "name"], value);
              }} placeholder="例如：7月早鳥價" className="font-bold" size="large" slots={{
                "prefix": _slot => <><RimoElement kind="el-icon"><RimoIcon name="Ticket" /></RimoElement></>
              }}></RimoElement></RimoElement></div>
<div className="flex gap-6 h-[580px]"><div className="flex-1 overflow-y-auto pr-2 custom-scroll"><div className="text-sm font-bold text-gray-800 mb-3 flex items-center border-b pb-2"><div className="w-1 h-4 bg-[color:var(--app-color-primary)] rounded mr-2"></div>
{text(" 觸發條件\n                        ")}</div>
<div className="bg-white rounded-lg p-4 mb-4 border border-gray-200 shadow-sm"><div className="text-xs text-gray-400 font-bold mb-3 uppercase tracking-wide">{text("時間限制")}</div>
<RimoElement kind="el-form-item" label="下單時間" className="mb-3"><RimoElement kind="el-date-picker" modelValue={view.currentRule.salesDateRange} onModelChange={value => {
                    model.write(["currentRule", "salesDateRange"], value);
                  }} type="daterange" rangeSeparator="-" startPlaceholder="不限" endPlaceholder="不限" format="MM-DD" valueFormat="YYYY-MM-DD" style={rimoStyle("width: 100%")} size="default"></RimoElement></RimoElement>
<RimoElement kind="el-form-item" label="用車時間" className="mb-3"><RimoElement kind="el-date-picker" modelValue={view.currentRule.dateRange} onModelChange={value => {
                    model.write(["currentRule", "dateRange"], value);
                  }} type="daterange" rangeSeparator="-" startPlaceholder="開始" endPlaceholder="結束" format="MM-DD" valueFormat="YYYY-MM-DD" style={rimoStyle("width: 100%")} size="default"></RimoElement></RimoElement>
<RimoElement kind="el-form-item" label="提前預訂" className="mb-0"><RimoElement kind="el-input-number" modelValue={view.currentRule.advanceDays} onModelChange={value => {
                    model.write(["currentRule", "advanceDays"], value);
                  }} min={0} controlsPosition="right" size="default" style={rimoStyle("width: 100px")}></RimoElement>
<span className="text-xs text-gray-400 ml-2">{text("天以上")}</span></RimoElement></div>
<div className="bg-white rounded-lg p-4 mb-4 border border-gray-200 shadow-sm"><div className="text-xs text-gray-400 font-bold mb-3 uppercase tracking-wide">{text("適用範圍")}</div>
{view.wizardMode === 'STORE' ? <><RimoElement kind="el-form-item" label="適用車組" className="mb-3"><RimoElement kind="el-select" modelValue={view.currentRule.carModels} onModelChange={value => {
                      model.write(["currentRule", "carModels"], value);
                    }} placeholder="全部" size="default"><RimoElement kind="el-option" label="全部車型" value="all"></RimoElement>
<RimoElement kind="el-option" label="經濟型組" value="economy"></RimoElement>
<RimoElement kind="el-option" label="SUV組" value="suv"></RimoElement>
<RimoElement kind="el-option" label="商務車組" value="mpv"></RimoElement></RimoElement></RimoElement></> : null}
<RimoElement kind="el-form-item" label="會員方案" className="mb-3"><RimoElement kind="el-select" modelValue={view.currentRule.membership} onModelChange={value => {
                    model.write(["currentRule", "membership"], value);
                  }} multiple={true} collapseTags={true} placeholder="不限" size="default"><RimoElement kind="el-option" label="普通會員" value="normal"></RimoElement>
<RimoElement kind="el-option" label="銀卡會員" value="silver"></RimoElement>
<RimoElement kind="el-option" label="金卡會員" value="gold"></RimoElement></RimoElement></RimoElement>
<RimoElement kind="el-form-item" label="租期限制" className="mb-0"><div className="flex items-center"><RimoElement kind="el-input-number" modelValue={view.currentRule.minDays} onModelChange={value => {
                      model.write(["currentRule", "minDays"], value);
                    }} min={1} controlsPosition="right" size="default" style={rimoStyle("width: 100px")} placeholder={'不限'}></RimoElement>
<span className="mx-2 text-gray-400">{text("-")}</span>
<RimoElement kind="el-input-number" modelValue={view.currentRule.maxDays} onModelChange={value => {
                      model.write(["currentRule", "maxDays"], value);
                    }} min={1} controlsPosition="right" size="default" style={rimoStyle("width: 100px")} placeholder={'不限'}></RimoElement>
<span className="ml-2 text-xs text-gray-400">{text("天")}</span></div></RimoElement></div>
<div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm"><div className="text-xs text-gray-400 font-bold mb-3 uppercase tracking-wide">{text("地理位置")}</div>
<RimoElement kind="el-form-item" label="適用地區" className="mb-3"><RimoElement kind="el-select" modelValue={view.currentRule.regions} onModelChange={value => {
                    model.write(["currentRule", "regions"], value);
                  }} multiple={true} collapseTags={true} placeholder="全部" size="default"><RimoElement kind="el-option" label="華東區" value="east"></RimoElement>
<RimoElement kind="el-option" label="華南區" value="south"></RimoElement></RimoElement></RimoElement>
<RimoElement kind="el-form-item" label="適用門店" className="mb-0"><RimoElement kind="el-select" modelValue={view.currentRule.stores} onModelChange={value => {
                    model.write(["currentRule", "stores"], value);
                  }} multiple={true} collapseTags={true} placeholder="全部" size="default"><RimoElement kind="el-option" label="上海虹橋店" value="sh_hq"></RimoElement>
<RimoElement kind="el-option" label="杭州西湖店" value="hz_xh"></RimoElement>
<RimoElement kind="el-option" label="南京南站店" value="nj_nz"></RimoElement></RimoElement></RimoElement></div></div>
<div className="flex-1 overflow-y-auto pr-1 custom-scroll"><div className="text-sm font-bold text-gray-800 mb-3 flex items-center border-b pb-2"><div className="w-1 h-4 bg-orange-500 rounded mr-2"></div>
{text(" 優惠動作\n                        ")}</div>
<div className="bg-orange-50 rounded-lg p-5 mb-5 border border-orange-100 relative overflow-hidden"><div className="absolute top-0 right-0 p-1 bg-orange-100 rounded-bl text-xs text-orange-600 font-bold px-2">{text("\n                                必選")}</div>
<div className="font-bold text-gray-800 mb-4 flex items-center"><RimoElement kind="el-icon" className="mr-1 text-orange-500 text-lg"><RimoIcon name="Money" /></RimoElement>
{text(" 價格折讓\n                            ")}</div>
{view.wizardMode === 'STORE' ? <><div className="mb-4"><RimoElement kind="el-radio-group" modelValue={view.currentRule.priceMode} onModelChange={value => {
                      model.write(["currentRule", "priceMode"], value);
                    }} size="default" fill="#f97316"><RimoElement kind="el-radio-button" label="uniform">{text("統一價模式")}</RimoElement>
<RimoElement kind="el-radio-button" label="split">{text("平假分開模式")}</RimoElement></RimoElement></div></> : <><div className="mb-4"><div className="text-xs text-gray-500 mb-2">{text("請直接配置該車組的分時租賃定價：")}</div></div></>}
{view.wizardMode === 'STORE' && view.currentRule.priceMode === 'uniform' ? <><div className="bg-white p-4 rounded-md border border-orange-200 shadow-sm"><RimoElement kind="el-radio-group" modelValue={view.currentRule.type} onModelChange={value => {
                      model.write(["currentRule", "type"], value);
                    }} size="small" className="mb-3"><RimoElement kind="el-radio" label="discount">{text("折扣比率")}</RimoElement>
<RimoElement kind="el-radio" label="minus">{text("固定立減")}</RimoElement>
<RimoElement kind="el-radio" label="fixed">{text("一口價")}</RimoElement></RimoElement>
<div className="flex items-center"><RimoElement kind="el-input-number" modelValue={view.currentRule.value} onModelChange={value => {
                        model.write(["currentRule", "value"], value);
                      }} min={0} precision={view.currentRule.type === 'discount' ? 1 : 0} size="large" style={rimoStyle("width: 160px")}></RimoElement>
<span className="ml-2 font-bold text-orange-600 text-lg">{rimoText(view.currentRule.type === 'discount' ? '折' : '元')}</span></div></div></> : null}
{view.wizardMode === 'STORE' && view.currentRule.priceMode === 'split' ? <><div className="grid grid-cols-2 gap-3"><div className="bg-white p-3 rounded-md border border-gray-200 shadow-sm"><div className="text-xs text-gray-500 font-bold mb-2">{text("常規平日")}</div>
<div className="flex items-center gap-2"><RimoElement kind="el-select" modelValue={view.currentRule.type} onModelChange={value => {
                          model.write(["currentRule", "type"], value);
                        }} size="small" style={rimoStyle("width: 80px")}><RimoElement kind="el-option" label="折扣" value="discount"></RimoElement>
<RimoElement kind="el-option" label="立減" value="minus"></RimoElement>
<RimoElement kind="el-option" label="一口價" value="fixed"></RimoElement></RimoElement>
<RimoElement kind="el-input-number" modelValue={view.currentRule.value} onModelChange={value => {
                          model.write(["currentRule", "value"], value);
                        }} min={0} size="small" style={rimoStyle("width: 90px")} controls={false}></RimoElement>
<span className="text-xs font-medium">{rimoText(view.currentRule.type === 'discount' ? '折' : '元')}</span></div></div>
<div className="bg-white p-3 rounded-md border border-orange-200 shadow-sm"><div className="text-xs text-orange-500 font-bold mb-2">{text("常規假日")}</div>
<div className="flex items-center gap-2"><RimoElement kind="el-select" modelValue={view.currentRule.weekendType} onModelChange={value => {
                          model.write(["currentRule", "weekendType"], value);
                        }} size="small" style={rimoStyle("width: 80px")}><RimoElement kind="el-option" label="折扣" value="discount"></RimoElement>
<RimoElement kind="el-option" label="立減" value="minus"></RimoElement>
<RimoElement kind="el-option" label="一口價" value="fixed"></RimoElement></RimoElement>
<RimoElement kind="el-input-number" modelValue={view.currentRule.weekendValue} onModelChange={value => {
                          model.write(["currentRule", "weekendValue"], value);
                        }} min={0} size="small" style={rimoStyle("width: 90px")} controls={false}></RimoElement>
<span className="text-xs font-medium">{rimoText(view.currentRule.weekendType === 'discount' ? '折' : '元')}</span></div></div>
<div className="bg-white p-3 rounded-md border border-blue-200 shadow-sm"><div className="text-xs text-blue-500 font-bold mb-2">{text("調休平日")}</div>
<div className="flex items-center gap-2"><RimoElement kind="el-select" modelValue={view.currentRule.adjustedWeekdayType} onModelChange={value => {
                          model.write(["currentRule", "adjustedWeekdayType"], value);
                        }} size="small" style={rimoStyle("width: 80px")}><RimoElement kind="el-option" label="折扣" value="discount"></RimoElement>
<RimoElement kind="el-option" label="立減" value="minus"></RimoElement>
<RimoElement kind="el-option" label="一口價" value="fixed"></RimoElement></RimoElement>
<RimoElement kind="el-input-number" modelValue={view.currentRule.adjustedWeekdayValue} onModelChange={value => {
                          model.write(["currentRule", "adjustedWeekdayValue"], value);
                        }} min={0} size="small" style={rimoStyle("width: 90px")} controls={false}></RimoElement>
<span className="text-xs font-medium">{rimoText(view.currentRule.adjustedWeekdayType === 'discount' ? '折' : '元')}</span></div></div>
<div className="bg-white p-3 rounded-md border border-red-200 shadow-sm"><div className="text-xs text-red-500 font-bold mb-2">{text("法定假日")}</div>
<div className="flex items-center gap-2"><RimoElement kind="el-select" modelValue={view.currentRule.legalHolidayType} onModelChange={value => {
                          model.write(["currentRule", "legalHolidayType"], value);
                        }} size="small" style={rimoStyle("width: 80px")}><RimoElement kind="el-option" label="折扣" value="discount"></RimoElement>
<RimoElement kind="el-option" label="立減" value="minus"></RimoElement>
<RimoElement kind="el-option" label="一口價" value="fixed"></RimoElement></RimoElement>
<RimoElement kind="el-input-number" modelValue={view.currentRule.legalHolidayValue} onModelChange={value => {
                          model.write(["currentRule", "legalHolidayValue"], value);
                        }} min={0} size="small" style={rimoStyle("width: 90px")} controls={false}></RimoElement>
<span className="text-xs font-medium">{rimoText(view.currentRule.legalHolidayType === 'discount' ? '折' : '元')}</span></div></div></div></> : null}
{view.wizardMode === 'SHARING' ? <><div className="space-y-6">{rimoEntries(['sharing_round', 'sharing_oneway']).map(([scope], _itemIndex) => <Fragment key={scope}><>{view.currentScheme.tags && view.currentScheme.tags.includes(scope) ? <><div className="bg-white rounded-lg border border-gray-200 overflow-hidden"><div className="bg-gray-50 px-4 py-2 border-b border-gray-200 flex items-center"><RimoElement kind="el-tag" type={scope === 'sharing_round' ? 'warning' : 'danger'} effect="dark" size="small" className="mr-2">{text("\n                                                ")}{rimoText(scope === 'sharing_round' ? '同站' : '異地')}{text("\n                                            ")}</RimoElement>
<span className="text-sm font-bold text-gray-700">{rimoText(scope === 'sharing_round' ? '同站租還定價' : '甲租乙還定價')}</span></div>
<div className="p-0"><RimoTable className="w-full text-sm text-left"><thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-100"><tr><th className="py-2 px-4 w-1/3">{text("適用車組")}</th>
<th className="py-2 px-4 w-1/3">{text("時租定價 (元/h)")}</th>
<th className="py-2 px-4 w-1/3">{text("日租封頂 (元/天)")}</th></tr></thead>
<tbody className="divide-y divide-gray-50">{rimoEntries(view.carGroups).map(([car], _itemIndex) => <Fragment key={car.id}><tr key={car.id} className={rimoClass(["hover:bg-[color:var(--app-color-primary-light-9)] transition-colors", rimoClass({
                                      'opacity-50 grayscale': !view.currentRule.sharingPrices[scope][car.id].active
                                    })])}><td className="py-2 px-4"><RimoElement kind="el-checkbox" modelValue={view.currentRule.sharingPrices[scope][car.id].active} onModelChange={value => {
                                          model.write(["currentRule", "sharingPrices", scope, car.id, "active"], value);
                                        }}><span className="font-medium text-gray-700 ml-1">{rimoText(car.name)}</span></RimoElement></td>
<td className="py-2 px-4"><RimoElement kind="el-input-number" modelValue={view.currentRule.sharingPrices[scope][car.id].hourly} onModelChange={value => {
                                          model.write(["currentRule", "sharingPrices", scope, car.id, "hourly"], value);
                                        }} min={0} precision={1} step={0.5} size="small" style={rimoStyle("width: 100%")} disabled={!view.currentRule.sharingPrices[scope][car.id].active} controls={false}></RimoElement></td>
<td className="py-2 px-4"><RimoElement kind="el-input-number" modelValue={view.currentRule.sharingPrices[scope][car.id].daily} onModelChange={value => {
                                          model.write(["currentRule", "sharingPrices", scope, car.id, "daily"], value);
                                        }} min={0} precision={0} step={1} size="small" style={rimoStyle("width: 100%")} disabled={!view.currentRule.sharingPrices[scope][car.id].active} controls={false}></RimoElement></td></tr></Fragment>)}</tbody></RimoTable></div></div></> : null}</></Fragment>)}</div></> : null}</div>
<div className={rimoClass(["bg-[color:var(--app-color-primary-light-9)] rounded-lg p-5 border border-[color:var(--app-color-primary-light-8)] transition-all", rimoClass({
                'opacity-60 grayscale': !view.currentRule.enableGift
              })])}><div className="flex justify-between items-center mb-4"><div className="font-bold text-[color:var(--app-color-primary-hover)] flex items-center"><RimoElement kind="el-icon" className="mr-2 text-lg"><RimoIcon name="Present" /></RimoElement>
{text(" 連租贈送 (可選)\n                                ")}</div>
<RimoElement kind="el-switch" modelValue={view.currentRule.enableGift} onModelChange={value => {
                    model.write(["currentRule", "enableGift"], value);
                  }} size="default" style={rimoStyle("--el-switch-on-color: var(--app-color-primary);")}></RimoElement></div>
<div hidden={!view.currentRule.enableGift} className="bg-white p-4 rounded-md border border-[color:var(--app-color-primary-light-7)] shadow-sm"><div className="flex items-center justify-between mb-3 border-b border-gray-100 pb-3"><span className="text-gray-600">{text("租用天數")}</span>
<div className="flex items-center"><RimoElement kind="el-input-number" modelValue={view.currentRule.giftBuy} onModelChange={value => {
                        model.write(["currentRule", "giftBuy"], value);
                      }} min={1} size="default" style={rimoStyle("width: 100px")}></RimoElement>
<span className="ml-2 font-bold text-gray-800">{text("天")}</span></div></div>
<div className="flex items-center justify-between"><span className="text-gray-600">{text("贈送天數")}</span>
<div className="flex items-center"><RimoElement kind="el-input-number" modelValue={view.currentRule.giftOne} onModelChange={value => {
                        model.write(["currentRule", "giftOne"], value);
                      }} min={1} size="default" style={rimoStyle("width: 100px")}></RimoElement>
<span className="ml-2 font-bold text-[color:var(--app-color-primary)]">{text("天")}</span></div></div></div></div></div></div></RimoElement></>}</RimoElement>
<RimoElement kind="el-dialog" modelValue={view.marketingVersionDialogVisible} onModelChange={value => {
      model.write(["marketingVersionDialogVisible"], value);
    }} title="行銷方案歷史版本" width="880px" destroyOnClose={true} slots={{
      "footer": _slot => <><RimoElement kind="el-button" onClick={_event => {
          model.write(["marketingVersionDialogVisible"], false);
        }}>{text("關閉")}</RimoElement></>
    }}>{() => <>{view.selectedMarketingVersion ? <><div className="grid grid-cols-3 gap-4"><div className="col-span-1 border border-gray-100 rounded-lg overflow-hidden"><div className="px-3 py-2 bg-gray-50 text-xs font-bold text-gray-500">{text("版本列表")}</div>
<div className="divide-y divide-gray-100 max-h-[420px] overflow-y-auto">{rimoEntries(view.marketingVersionRecords).map(([version], _itemIndex) => <Fragment key={version.version}><button key={version.version} className={rimoClass(["w-full text-left px-3 py-3 hover:bg-[color:var(--app-color-primary-light-9)] transition-colors", rimoClass(view.selectedMarketingVersion.version === version.version ? 'bg-[color:var(--app-color-primary-light-9)]' : 'bg-white')])} onClick={_event => {
                    model.write(["selectedMarketingVersion"], version);
                  }}><div className="font-mono text-xs text-[color:var(--app-color-primary)] font-bold">{rimoText(version.version)}</div>
<div className="text-sm text-gray-800 mt-1">{rimoText(version.name)}</div>
<div className="text-xs text-gray-400 mt-1">{rimoText(version.savedAt)}{text(" · ")}{rimoText(version.status)}</div></button></Fragment>)}</div></div>
<div className="col-span-2 space-y-4"><div className="rounded-lg border border-[color:var(--app-color-primary-light-8)] bg-[color:var(--app-color-primary-light-9)] px-4 py-3"><div className="font-mono font-bold text-gray-900">{rimoText(view.selectedMarketingVersion.version)}</div>
<div className="text-sm text-gray-700 mt-1">{rimoText(view.selectedMarketingVersion.name)}</div>
<div className="text-xs text-gray-500 mt-1">{text("保存人：")}{rimoText(view.selectedMarketingVersion.savedBy)}{text(" · ")}{rimoText(view.selectedMarketingVersion.savedAt)}</div></div>
<RimoElement kind="el-table" data={view.getMarketingVersionBasicRows(view.selectedMarketingVersion)} border={true} size="small"><RimoElement kind="el-table-column" prop="label" label="配置項" width="170" showOverflowTooltip={true}></RimoElement>
<RimoElement kind="el-table-column" prop="value" label="內容" minWidth="320" showOverflowTooltip={true}></RimoElement></RimoElement>
<div className="font-bold text-gray-800">{text("規則詳情")}</div>
<RimoElement kind="el-table" data={view.getMarketingVersionRuleRows(view.selectedMarketingVersion)} border={true} size="small"><RimoElement kind="el-table-column" prop="name" label="規則名稱" width="150" showOverflowTooltip={true}></RimoElement>
<RimoElement kind="el-table-column" prop="salesWindow" label="下單時間" minWidth="140" showOverflowTooltip={true}></RimoElement>
<RimoElement kind="el-table-column" prop="useWindow" label="用車時間" minWidth="170" showOverflowTooltip={true}></RimoElement>
<RimoElement kind="el-table-column" prop="advanceBooking" label="提前預訂" width="110" showOverflowTooltip={true}></RimoElement>
<RimoElement kind="el-table-column" prop="carGroup" label="適用車組" minWidth="140" showOverflowTooltip={true}></RimoElement>
<RimoElement kind="el-table-column" prop="membership" label="會員方案" minWidth="150" showOverflowTooltip={true}></RimoElement>
<RimoElement kind="el-table-column" prop="rentalTerm" label="租期限制" width="110" showOverflowTooltip={true}></RimoElement>
<RimoElement kind="el-table-column" prop="locationScope" label="適用地區/門店" minWidth="170" showOverflowTooltip={true}></RimoElement>
<RimoElement kind="el-table-column" prop="action" label="優惠動作" minWidth="220" showOverflowTooltip={true}></RimoElement></RimoElement></div></div></> : null}</>}</RimoElement></RimoRoot>;
}