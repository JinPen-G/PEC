import { Fragment } from 'react';
import { useRimoModel, rimoEntries } from '../../lib/rimo-model.js';
import { RimoRoot, RimoIcon, useRimoEnvironment } from '../../lib/RimoEnvironment.jsx';
import { RimoElement, rimoClass, rimoStyle, rimoText } from '../../lib/RimoElements.jsx';
import './member-review.css';
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
      cell: ref,
      record: reactive,
      derived: computed,
      watch: watch
    } = model;
    const {
      ElMessage: _ElMessage,
      ElMessageBox: _ElMessageBox
    } = feedback;
    const drawerVisible = ref(false);
    const submitReviewDialogVisible = ref(false);
    const reviewSubmitMode = ref('single');
    const currentMember = ref(null);
    const submitting = ref(false);
    const selectedRows = ref([]);
    const selectedAvailableVehicleTypes = ref([]);
    const isHighRisk = ref(false);
    const submitTab = ref('new');
    const legacyForm = reactive({
      decision: 'approved',
      rejectTypes: [],
      remark: '',
      isHighRisk: false,
      vehicleTypes: []
    });
    const reviewItems = [{
      key: 'basicInfo',
      label: '基本資料',
      rejectTypeLabel: '會員基本資料錯誤'
    }, {
      key: 'idCard',
      label: '身份證',
      rejectTypeLabel: '身份證資料錯誤'
    }, {
      key: 'driverLicense',
      label: '駕駛執照',
      rejectTypeLabel: '駕駛執照資料錯誤'
    }, {
      key: 'selfie',
      label: '手持證件自拍',
      rejectTypeLabel: '自拍照資料錯誤'
    }];
    const legacyRejectTypeOptions = reviewItems.map(item => ({
      value: item.rejectTypeLabel,
      label: item.rejectTypeLabel,
      itemLabel: item.label
    }));
    const rejectOptions = {
      basicInfo: ['信息填寫不完整', '緊急聯絡人資料不完整', '手機號無法驗證'],
      idCard: ['照片模糊，請重新拍攝', '信息與證件不符', '證件已過期', '疑似僞造證件'],
      driverLicense: ['照片模糊，請重新拍攝', '駕照已過期', '駕照類型不符', '疑似僞造駕照'],
      selfie: ['照片模糊，請重新拍攝', '人臉與證件不符', '未手持證件', '未露臉', '非本人照片']
    };
    const legacyRemarkOptions = [...new Set(Object.values(rejectOptions).flat())];
    const reviewSubmitForm = reactive({
      basicInfo: {
        status: 'approved',
        reason: ''
      },
      idCard: {
        status: 'approved',
        reason: ''
      },
      driverLicense: {
        status: 'approved',
        reason: ''
      },
      selfie: {
        status: 'approved',
        reason: ''
      }
    });
    const vehicleTypeOptions = [{
      value: 'car',
      label: '汽車'
    }, {
      value: 'motorcycle',
      label: '摩托車'
    }, {
      value: 'microElectric',
      label: '微電車'
    }];
    const inferAvailableVehicleTypes = (driverLicense = {}) => {
      const result = ['microElectric'];
      if (driverLicense.type === 'LT01' || driverLicense.type === 'LT04') result.unshift('car');
      if (driverLicense.type === 'LT02' || driverLicense.type === 'LT03') result.unshift('motorcycle');
      return [...new Set(result)];
    };
    const allMembers = ref([{
      id: 'M_Review_001',
      name: '王小敏',
      phone: '0988000111',
      email: 'xiaomin@example.com',
      channel: 'ios',
      submitTime: '2026-02-10 13:00',
      status: 'pending',
      reviewStatus: 'pending',
      registerTime: '2025-12-18 09:20',
      lastLoginTime: '2026-02-10 12:46',
      gender: 'female',
      dob: '2000-01-01',
      idNumber: 'E223456789',
      householdAddress: '臺中市西屯區臺灣大道三段99號',
      mailingAddress: '臺中市西屯區',
      emergencyContact: {
        name: '張偉',
        relationship: '朋友',
        phone: '0911-000-111'
      },
      driverLicense: {
        type: 'LT01',
        issuePlace: '臺中市',
        number: 'DL888999',
        expiryDate: '2032-01-01'
      },
      availableVehicleTypes: ['car', 'microElectric'],
      idCardFront: 'https://placehold.co/400x250/e2e8f0/64748b?text=ID+Front',
      idCardBack: 'https://placehold.co/400x250/e2e8f0/64748b?text=ID+Back',
      dlFront: 'https://placehold.co/400x250/e2e8f0/64748b?text=DL+Front',
      dlBack: 'https://placehold.co/400x250/e2e8f0/64748b?text=DL+Back',
      selfie: 'https://placehold.co/300x400/e2e8f0/64748b?text=Selfie',
      otherDocument: 'https://placehold.co/400x250/f1f5f9/64748b?text=Other+Document',
      creditCards: [{
        cardName: '中國信託 VISA',
        holderName: '王小敏',
        cardNumber: '**** **** **** 8899',
        expiryDate: '09/29',
        isDefault: true
      }, {
        cardName: '國泰世華 Mastercard',
        holderName: '王小敏',
        cardNumber: '**** **** **** 2608',
        expiryDate: '03/28',
        isDefault: false
      }],
      history: [{
        time: '2026-02-10 13:00',
        content: '提交會員資料審覈申請',
        type: 'info',
        result: '已提交',
        operator: '王小敏'
      }, {
        time: '2026-02-10 13:01',
        content: '完成手機號碼驗證',
        type: 'success',
        result: '已驗證',
        operator: '系統'
      }, {
        time: '2026-02-10 13:05',
        content: '資料完整性檢查通過',
        type: 'success',
        result: '初審通過',
        operator: '系統'
      }]
    }, {
      id: 'M_Review_002',
      name: '陳志強',
      phone: '0988000222',
      email: 'zhiqiang@example.com',
      channel: 'android',
      submitTime: '2026-02-10 14:30',
      status: 'pending',
      reviewStatus: 'pending',
      registerTime: '2026-01-06 16:15',
      lastLoginTime: '2026-02-10 14:12',
      gender: 'male',
      dob: '1995-05-05',
      idNumber: 'F123456789',
      householdAddress: '高雄市左營區博愛二路777號',
      mailingAddress: '高雄市左營區',
      emergencyContact: {
        name: '林美華',
        relationship: '配偶',
        phone: '0922-333-444'
      },
      driverLicense: {
        type: 'LT01',
        issuePlace: '高雄市',
        number: 'DL777666',
        expiryDate: '2028-05-05'
      },
      availableVehicleTypes: ['car', 'microElectric'],
      idCardFront: 'https://placehold.co/400x250/e2e8f0/64748b?text=ID+Front',
      idCardBack: 'https://placehold.co/400x250/e2e8f0/64748b?text=ID+Back',
      history: [{
        time: '2026-02-10 14:30',
        content: '提交申請',
        type: 'info'
      }, {
        time: '2026-02-10 14:32',
        content: '完成實名認證',
        type: 'success'
      }]
    }, {
      id: 'M_Review_003',
      name: '林美玲',
      phone: '0988000333',
      email: 'meiling@example.com',
      channel: 'web',
      submitTime: '2026-02-10 10:15',
      status: 'pending',
      reviewStatus: 'pending',
      registerTime: '2026-01-25 11:08',
      lastLoginTime: '2026-02-10 10:02',
      gender: 'female',
      dob: '1998-08-08',
      idNumber: 'G223456789',
      householdAddress: '臺北市信義區松仁路100號',
      mailingAddress: '臺北市信義區',
      emergencyContact: {
        name: '王大明',
        relationship: '父親',
        phone: '0933-444-555'
      },
      driverLicense: {
        type: 'LT01',
        issuePlace: '臺北市',
        number: 'DL555444',
        expiryDate: '2030-08-08'
      },
      availableVehicleTypes: ['car', 'microElectric'],
      idCardFront: 'https://placehold.co/400x250/e2e8f0/64748b?text=ID+Front',
      history: [{
        time: '2026-02-10 10:15',
        content: '提交申請',
        type: 'info'
      }]
    }, {
      id: 'M_Review_004',
      name: '黃大偉',
      phone: '0988000444',
      email: 'dawei@example.com',
      channel: 'ios',
      submitTime: '2026-02-09 16:20',
      status: 'pending',
      reviewStatus: 'pending',
      registerTime: '2025-11-08 08:35',
      lastLoginTime: '2026-02-09 16:02',
      gender: 'male',
      dob: '1992-12-12',
      idNumber: 'H123456789',
      householdAddress: '桃園市中壢區中正路1號',
      mailingAddress: '桃園市中壢區',
      emergencyContact: {
        name: '李曉梅',
        relationship: '母親',
        phone: '0944-555-666'
      },
      driverLicense: {
        type: 'LT01',
        issuePlace: '桃園市',
        number: 'DL333222',
        expiryDate: '2029-12-12'
      },
      availableVehicleTypes: ['car', 'microElectric'],
      idCardFront: 'https://placehold.co/400x250/e2e8f0/64748b?text=ID+Front',
      history: [{
        time: '2026-02-08 10:00',
        content: '提交申請',
        type: 'info'
      }, {
        time: '2026-02-09 09:30',
        content: '審覈駁回: 照片不清晰',
        type: 'danger'
      }, {
        time: '2026-02-09 10:00',
        content: '用戶重新提交資料',
        type: 'warning'
      }]
    }, {
      id: 'M_Review_005',
      name: '李駁回',
      phone: '0988000555',
      email: 'rejected@example.com',
      channel: 'web',
      submitTime: '2026-02-09 09:00',
      status: 'rejected',
      reviewStatus: 'rejected',
      registerTime: '2025-10-19 14:28',
      lastLoginTime: '2026-02-10 08:46',
      gender: 'male',
      dob: '1990-03-03',
      idNumber: 'J123456789',
      householdAddress: '新竹市東區光復路二段101號',
      mailingAddress: '新竹市東區',
      emergencyContact: {
        name: '陳小紅',
        relationship: '同事',
        phone: '0955-666-777'
      },
      driverLicense: {
        type: 'LT01',
        issuePlace: '新竹市',
        number: 'DL111000',
        expiryDate: '2027-03-03'
      },
      availableVehicleTypes: ['car', 'microElectric'],
      idCardFront: 'https://placehold.co/400x250/e2e8f0/64748b?text=ID+Front',
      history: [{
        time: '2026-02-09 09:00',
        content: '提交申請',
        type: 'info'
      }, {
        time: '2026-02-09 09:05',
        content: '系統初審通過',
        type: 'success'
      }, {
        time: '2026-02-10 09:00',
        content: '審覈駁回: 證件模糊',
        type: 'danger'
      }]
    }, {
      id: 'M_Review_006',
      name: '張建國',
      phone: '0988000666',
      email: 'jianguo@example.com',
      channel: 'android',
      submitTime: '2026-02-08 11:30',
      status: 'rejected',
      reviewStatus: 'rejected',
      registerTime: '2025-09-12 10:10',
      lastLoginTime: '2026-02-09 13:40',
      gender: 'male',
      dob: '1985-06-06',
      idNumber: 'K123456789',
      householdAddress: '嘉義市西區中山路300號',
      mailingAddress: '嘉義市西區',
      emergencyContact: {
        name: '劉美芳',
        relationship: '妻子',
        phone: '0966-777-888'
      },
      driverLicense: {
        type: 'LT01',
        issuePlace: '嘉義市',
        number: 'DL999888',
        expiryDate: '2025-06-06'
      },
      availableVehicleTypes: ['car', 'microElectric'],
      idCardFront: 'https://placehold.co/400x250/e2e8f0/64748b?text=ID+Front',
      history: [{
        time: '2026-02-08 11:30',
        content: '提交申請',
        type: 'info'
      }, {
        time: '2026-02-09 14:00',
        content: '審覈駁回: 身份證過期',
        type: 'danger'
      }]
    }]);
    const stats = reactive({
      pending: computed(() => allMembers.value.filter(m => m.reviewStatus === 'pending').length),
      todayNew: 2,
      todayApproved: computed(() => allMembers.value.filter(m => m.reviewStatus === 'approved').length),
      todayRejected: computed(() => allMembers.value.filter(m => m.reviewStatus === 'rejected').length)
    });
    const filters = reactive({
      keyword: '',
      status: 'pending',
      channel: '',
      dateRange: []
    });
    const activeSummaryCard = ref('');
    let isApplyingSummaryFilter = false;
    const parseDateTime = value => {
      if (!value) return null;
      if (value instanceof Date) return value;
      const parsed = new Date(String(value).replace(' ', 'T'));
      return Number.isNaN(parsed.getTime()) ? null : parsed;
    };
    const reviewList = computed(() => {
      return allMembers.value.map(m => ({
        ...m,
        submitTime: m.submitTime || m.createTime || '2024-05-10 10:00',
        status: m.reviewStatus || 'approved',
        channel: m.channel || 'web',
        idCardFront: m.idCardFront || 'https://placehold.co/400x250/e2e8f0/64748b?text=ID+Front',
        idCardBack: m.idCardBack || 'https://placehold.co/400x250/e2e8f0/64748b?text=ID+Back',
        dlFront: m.dlFront || 'https://placehold.co/400x250/e2e8f0/64748b?text=DL+Front',
        dlBack: m.dlBack || 'https://placehold.co/400x250/e2e8f0/64748b?text=DL+Back',
        selfie: m.selfie || 'https://placehold.co/300x400/e2e8f0/64748b?text=Selfie',
        otherDocument: m.otherDocument || 'https://placehold.co/400x250/f1f5f9/64748b?text=Other+Document',
        creditCards: m.creditCards || [],
        history: m.history || []
      }));
    });
    const filteredList = computed(() => {
      return reviewList.value.filter(item => {
        const matchStatus = !filters.status || item.status === filters.status;
        const matchChannel = !filters.channel || item.channel === filters.channel;
        const matchKeyword = !filters.keyword || item.name.includes(filters.keyword) || item.phone.includes(filters.keyword);
        const submitTimestamp = parseDateTime(item.submitTime)?.getTime();
        const startTimestamp = filters.dateRange?.[0] ? new Date(filters.dateRange[0]).setHours(0, 0, 0, 0) : null;
        const endTimestamp = filters.dateRange?.[1] ? new Date(filters.dateRange[1]).setHours(23, 59, 59, 999) : null;
        const matchDate = startTimestamp === null || endTimestamp === null || Number.isFinite(submitTimestamp) && submitTimestamp >= startTimestamp && submitTimestamp <= endTimestamp;
        return matchStatus && matchChannel && matchKeyword && matchDate;
      });
    });
    const currentPage = ref(1);
    const pageSize = ref(10);
    const totalCount = computed(() => filteredList.value.length);
    watch(() => [filters.keyword, filters.status, filters.channel, filters.dateRange?.[0] ? new Date(filters.dateRange[0]).getTime() : '', filters.dateRange?.[1] ? new Date(filters.dateRange[1]).getTime() : ''], () => {
      if (!isApplyingSummaryFilter) {
        activeSummaryCard.value = '';
      }
      currentPage.value = 1;
    }, {
      flush: 'sync'
    });
    const hasRejectedItems = computed(() => reviewItems.some(item => reviewSubmitForm[item.key].status === 'rejected'));
    const isDriverLicenseRejected = computed(() => reviewSubmitForm.driverLicense.status === 'rejected');
    const vehicleTypeRuleText = computed(() => {
      if (isDriverLicenseRejected.value) {
        return '駕駛執照不通過，本次不更新會員可用載具類型，保留原值。';
      }
      if (hasRejectedItems.value) {
        return '其他資料不通過時整體審覈仍駁回；駕駛執照通過，仍更新會員可用載具類型。';
      }
      return '微電車默認不要求駕照；汽車、摩托車仍按現有駕照資料與審覈結果判斷。';
    });
    const submitReviewSummary = computed(() => {
      const rejectedItems = reviewItems.filter(item => reviewSubmitForm[item.key].status === 'rejected');
      const targetText = reviewSubmitMode.value === 'batch' ? `本次批量審覈 ${selectedRows.value.length} 名會員` : `本次審覈 ${currentMember.value?.name || '當前會員'}`;
      if (rejectedItems.length === 0) {
        return `${targetText}，四項資料均通過，提交後走原通過流程，並寫入用戶可用載具類型。`;
      }
      const rejectedLabels = rejectedItems.map(item => item.label).join('、');
      const highRiskText = reviewSubmitMode.value === 'single' && isHighRisk.value ? '，並標記爲高風險且不再提供複審' : '';
      const vehicleTypeText = isDriverLicenseRejected.value ? '駕駛執照不通過，不更新用戶可用載具類型' : '駕駛執照通過，仍更新用戶可用載具類型';
      return `${targetText}，${rejectedLabels}不通過，提交後走原不通過流程${highRiskText}；${vehicleTypeText}。`;
    });
    const submitRejectReasonText = computed(() => {
      return reviewItems.filter(item => reviewSubmitForm[item.key].status === 'rejected' && reviewSubmitForm[item.key].reason).map(item => `${item.label}：${reviewSubmitForm[item.key].reason}`).join('；');
    });
    const getWaitTime = time => {
      const diff = new Date() - new Date(time);
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor(diff % (1000 * 60 * 60) / (1000 * 60));
      return `${hours}小時 ${minutes}分`;
    };
    const getWaitTimeColor = time => {
      const diff = new Date() - new Date(time);
      const hours = diff / (1000 * 60 * 60);
      if (hours < 4) return 'text-green-600';
      if (hours < 12) return 'text-amber-500';
      return 'text-red-500';
    };
    const getWaitTimeType = time => {
      const diff = new Date() - new Date(time);
      const hours = diff / (1000 * 60 * 60);
      if (hours < 4) return 'success';
      if (hours < 12) return 'warning';
      return 'danger';
    };
    const getChannelLabel = channel => {
      const labels = {
        ios: 'iOS APP',
        android: 'Android APP',
        web: 'Web 官網'
      };
      return labels[channel] || '-';
    };
    const isLegacyRemarkSelected = option => legacyForm.remark.split('；').map(s => s.trim()).filter(Boolean).includes(option);
    const toggleLegacyRemark = option => {
      const parts = legacyForm.remark.split('；').map(s => s.trim()).filter(Boolean);
      const idx = parts.indexOf(option);
      if (idx >= 0) {
        parts.splice(idx, 1);
      } else {
        parts.push(option);
      }
      legacyForm.remark = parts.join('；');
    };
    const getHistoryTagType = type => {
      const types = {
        success: 'success',
        danger: 'danger',
        warning: 'warning',
        info: 'info'
      };
      return types[type] || 'info';
    };
    const getHistoryResultLabel = record => {
      if (record.result) return record.result;
      if (record.type === 'danger') return '不通過';
      if (record.type === 'warning') return '已重提';
      if (record.type === 'success') return '通過';
      return '已提交';
    };
    const getHistoryOperator = record => {
      if (record.type === 'info' || record.type === 'warning') return currentMember.value?.name || '會員';
      if (record.content?.includes('系統')) return '系統';
      return '營運管理員';
    };
    const openReviewDrawer = row => {
      currentMember.value = row;
      drawerVisible.value = true;
    };
    const saveToStorage = () => {};
    const resetReviewSubmitForm = () => {
      reviewItems.forEach(item => {
        reviewSubmitForm[item.key].status = 'approved';
        reviewSubmitForm[item.key].reason = '';
      });
      isHighRisk.value = false;
    };
    const openSubmitReviewDialog = (mode = 'single') => {
      if (mode === 'single' && !currentMember.value) return;
      if (mode === 'batch' && selectedRows.value.length === 0) {
        feedback.ElMessage.warning('請選擇需要審覈的會員');
        return;
      }
      reviewSubmitMode.value = mode;
      resetReviewSubmitForm();
      legacyForm.decision = 'approved';
      legacyForm.rejectTypes = [];
      legacyForm.remark = '';
      legacyForm.isHighRisk = false;
      legacyForm.vehicleTypes = [];
      if (mode === 'single') {
        selectedAvailableVehicleTypes.value = Array.isArray(currentMember.value.availableVehicleTypes) ? [...currentMember.value.availableVehicleTypes] : inferAvailableVehicleTypes(currentMember.value.driverLicense);
      } else {
        selectedAvailableVehicleTypes.value = [];
      }
      submitReviewDialogVisible.value = true;
    };
    const validateReviewSubmit = () => {
      for (const item of reviewItems) {
        const result = reviewSubmitForm[item.key];
        if (!result.status) {
          feedback.ElMessage.warning(`請選擇${item.label}審覈結果`);
          return null;
        }
        if (result.status === 'rejected' && !String(result.reason || '').trim()) {
          feedback.ElMessage.warning(`請選擇${item.label}駁回原因`);
          return null;
        }
      }
      const rejectedItems = reviewItems.filter(item => reviewSubmitForm[item.key].status === 'rejected');
      if (!isDriverLicenseRejected.value && selectedAvailableVehicleTypes.value.length === 0) {
        feedback.ElMessage.warning('請至少選擇一個用戶可用載具類型');
        return null;
      }
      const reasonText = rejectedItems.map(item => `${item.label}：${String(reviewSubmitForm[item.key].reason).trim()}`).join('；');
      const rejectTypes = rejectedItems.map(item => item.rejectTypeLabel);
      return {
        isRejected: rejectedItems.length > 0,
        reasonText,
        rejectTypes,
        shouldUpdateVehicleTypes: !isDriverLicenseRejected.value,
        isHighRisk: rejectedItems.length > 0 && reviewSubmitMode.value === 'single' && isHighRisk.value
      };
    };
    const applyReviewResult = (target, reviewResult) => {
      if (!target) return;
      if (!target.history) target.history = [];
      if (reviewResult.shouldUpdateVehicleTypes) {
        target.availableVehicleTypes = [...selectedAvailableVehicleTypes.value];
      }
      if (reviewResult.isRejected) {
        target.reviewStatus = 'rejected';
        target.status = 'active';
        target.isHighRisk = reviewResult.isHighRisk;
        target.allowReviewResubmit = !reviewResult.isHighRisk;
        target.lastRejectTypes = [...reviewResult.rejectTypes];
        const highRiskText = reviewResult.isHighRisk ? '；已標記高風險，不再提供複審' : '';
        const vehicleTypeText = reviewResult.shouldUpdateVehicleTypes ? '；駕駛執照通過，已更新可用載具類型' : '；駕駛執照不通過，未更新可用載具類型';
        target.history.push({
          time: new Date().toLocaleString(),
          content: `審覈駁回：${reviewResult.reasonText}${vehicleTypeText}${highRiskText}`,
          type: 'danger',
          color: '#f56c6c'
        });
      } else {
        target.reviewStatus = 'approved';
        target.status = 'active';
        target.history.push({
          time: new Date().toLocaleString(),
          content: '審覈通過: 會員已激活，並更新可用載具類型',
          type: 'success',
          color: '#67c23a'
        });
      }
    };
    const confirmSubmitReview = async () => {
      const reviewResult = validateReviewSubmit();
      if (!reviewResult) return;
      if (reviewResult.isHighRisk) {
        try {
          await feedback.ElMessageBox.confirm('確認將該會員標記爲高風險用戶嗎？提交後不再提供複審。', '高風險操作確認', {
            confirmButtonText: '確認提交',
            cancelButtonText: '取消',
            type: 'warning'
          });
        } catch {
          return;
        }
      }
      submitting.value = true;
      window.setTimeout(() => {
        const targets = reviewSubmitMode.value === 'batch' ? allMembers.value.filter(member => selectedRows.value.some(row => row.id === member.id)) : allMembers.value.filter(member => member.id === currentMember.value.id);
        targets.forEach(target => applyReviewResult(target, reviewResult));
        saveToStorage();
        if (reviewSubmitMode.value === 'batch') {
          feedback.ElMessage[reviewResult.isRejected ? 'warning' : 'success'](`已批量提交 ${targets.length} 名會員審覈`);
          selectedRows.value = [];
        } else {
          feedback.ElMessage[reviewResult.isRejected ? 'warning' : 'success'](reviewResult.isRejected ? '已駁回該會員申請' : '會員審覈已通過');
          drawerVisible.value = false;
        }
        submitting.value = false;
        submitReviewDialogVisible.value = false;
      }, 1000);
    };
    const confirmLegacyReview = async () => {
      if (legacyForm.decision === 'rejected' && legacyForm.rejectTypes.length === 0) {
        feedback.ElMessage.warning('請選擇至少一個不通過類型');
        return;
      }
      if (legacyForm.vehicleTypes.length === 0 && !legacyForm.rejectTypes.includes('駕駛執照資料錯誤')) {
        feedback.ElMessage.warning('請至少選擇一個用戶可用載具類型');
        return;
      }
      if (legacyForm.decision === 'rejected' && legacyForm.isHighRisk) {
        try {
          await feedback.ElMessageBox.confirm('確認將該會員標記爲高風險用戶嗎？提交後不再提供複審。', '高風險操作確認', {
            confirmButtonText: '確認提交',
            cancelButtonText: '取消',
            type: 'warning'
          });
        } catch {
          return;
        }
      }
      submitting.value = true;
      window.setTimeout(() => {
        const targets = reviewSubmitMode.value === 'batch' ? allMembers.value.filter(member => selectedRows.value.some(row => row.id === member.id)) : allMembers.value.filter(member => member.id === currentMember.value.id);
        const isRejected = legacyForm.decision === 'rejected';
        const shouldUpdateVehicleTypes = !legacyForm.rejectTypes.includes('駕駛執照資料錯誤');
        targets.forEach(target => {
          if (!target.history) target.history = [];
          if (shouldUpdateVehicleTypes) {
            target.availableVehicleTypes = [...legacyForm.vehicleTypes];
          }
          if (isRejected) {
            target.reviewStatus = 'rejected';
            target.status = 'active';
            target.isHighRisk = legacyForm.isHighRisk;
            target.allowReviewResubmit = !legacyForm.isHighRisk;
            target.lastRejectTypes = [...legacyForm.rejectTypes];
            target.lastRejectReason = legacyForm.remark;
            const highRiskText = legacyForm.isHighRisk ? '；已標記高風險，不再提供複審' : '';
            const remarkText = legacyForm.remark ? `；備註：${legacyForm.remark}` : '';
            target.history.push({
              time: new Date().toLocaleString(),
              content: `審覈駁回：${legacyForm.rejectTypes.join('、')}${remarkText}${highRiskText}`,
              type: 'danger',
              color: '#f56c6c'
            });
          } else {
            target.reviewStatus = 'approved';
            target.status = 'active';
            target.history.push({
              time: new Date().toLocaleString(),
              content: '審覈通過: 會員已激活，並更新可用載具類型',
              type: 'success',
              color: '#67c23a'
            });
          }
        });
        if (reviewSubmitMode.value === 'batch') {
          feedback.ElMessage.success(`已批量提交 ${targets.length} 名會員審覈`);
          selectedRows.value = [];
        } else {
          feedback.ElMessage.success(isRejected ? '已駁回該會員申請' : '會員審覈已通過');
          drawerVisible.value = false;
        }
        submitting.value = false;
        submitReviewDialogVisible.value = false;
      }, 1000);
    };
    const handleSubmitReview = () => {
      if (submitTab.value === 'new') {
        return confirmSubmitReview();
      }
      return confirmLegacyReview();
    };
    const handleSelectionChange = val => {
      selectedRows.value = val;
    };
    const handleBatchApprove = () => {
      openSubmitReviewDialog('batch');
    };
    const clearReviewFilters = () => {
      filters.keyword = '';
      filters.status = '';
      filters.channel = '';
      filters.dateRange = [];
    };
    const getTodayRange = () => {
      const today = new Date();
      return [new Date(today.getFullYear(), today.getMonth(), today.getDate()), new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999)];
    };
    const applySummaryFilter = type => {
      isApplyingSummaryFilter = true;
      if (activeSummaryCard.value === type) {
        clearReviewFilters();
        activeSummaryCard.value = '';
        currentPage.value = 1;
        isApplyingSummaryFilter = false;
        return;
      }
      clearReviewFilters();
      if (type === 'pending') {
        filters.status = 'pending';
      }
      if (type === 'todayNew') {
        filters.dateRange = getTodayRange();
      }
      if (type === 'todayApproved') {
        filters.status = 'approved';
        filters.dateRange = getTodayRange();
      }
      if (type === 'todayRejected') {
        filters.status = 'rejected';
        filters.dateRange = getTodayRange();
      }
      activeSummaryCard.value = type;
      currentPage.value = 1;
      isApplyingSummaryFilter = false;
    };
    const resetFilters = () => {
      isApplyingSummaryFilter = true;
      filters.keyword = '';
      filters.status = 'pending';
      filters.channel = '';
      filters.dateRange = [];
      activeSummaryCard.value = '';
      currentPage.value = 1;
      isApplyingSummaryFilter = false;
    };
    return {
      drawerVisible,
      submitReviewDialogVisible,
      reviewSubmitMode,
      currentMember,
      submitting,
      selectedRows,
      submitTab,
      legacyForm,
      legacyRejectTypeOptions,
      legacyRemarkOptions,
      isLegacyRemarkSelected,
      toggleLegacyRemark,
      stats,
      filters,
      activeSummaryCard,
      filteredList,
      reviewItems,
      rejectOptions,
      reviewSubmitForm,
      isHighRisk,
      hasRejectedItems,
      isDriverLicenseRejected,
      selectedAvailableVehicleTypes,
      vehicleTypeOptions,
      vehicleTypeRuleText,
      submitReviewSummary,
      submitRejectReasonText,
      currentPage,
      pageSize,
      totalCount,
      getWaitTime,
      getWaitTimeColor,
      getWaitTimeType,
      getChannelLabel,
      getHistoryTagType,
      getHistoryResultLabel,
      getHistoryOperator,
      openReviewDrawer,
      openSubmitReviewDialog,
      confirmSubmitReview,
      confirmLegacyReview,
      handleSubmitReview,
      handleSelectionChange,
      handleBatchApprove,
      resetFilters,
      applySummaryFilter,
      ElMessage: feedback.ElMessage,
      ElMessageBox: feedback.ElMessageBox,
      inferAvailableVehicleTypes,
      allMembers,
      isApplyingSummaryFilter,
      parseDateTime,
      reviewList,
      saveToStorage,
      resetReviewSubmitForm,
      validateReviewSubmit,
      applyReviewResult,
      clearReviewFilters,
      getTodayRange
    };
  }
  return pageSetup();
}
export default function MemberReviewBlock() {
  const model = useRimoModel(createPageState);
  const view = model.view;
  const {
    text
  } = useRimoEnvironment();
  return <RimoRoot model={model} pageKey="member-review" assets={{}}><div data-business-content="" data-rimo-layout="page"><div className="flex items-center justify-between mb-6" data-rimo-layout="heading"><div><h1 className="text-2xl font-bold text-gray-800 tracking-tight">{text("資質認證審覈")}</h1>
<p className="text-sm text-gray-500 mt-1">{text("審覈會員註冊申請，管理審覈流程")}</p></div></div>
<div className="grid grid-cols-4 gap-4 mb-6" data-rimo-layout="summary"><div className={rimoClass(["bg-white rounded-xl p-4 border shadow-sm stat-card cursor-pointer hover:border-[color:var(--app-color-primary)] transition-colors", rimoClass(view.activeSummaryCard === 'pending' ? 'border-[color:var(--app-color-primary)] ring-1 ring-[color:var(--app-color-primary)]' : 'border-gray-100')])} role="button" tabIndex="0" aria-pressed={view.activeSummaryCard === 'pending'} onClick={_event => {
          view.applySummaryFilter('pending');
        }} onKeyDown={event => {
          event.preventDefault();
          if (event.key !== 'Enter') return;
          view.applySummaryFilter('pending');
        }} data-rimo-layout="stat"><div className="text-gray-500 text-xs font-medium mb-1">{text("待審覈")}</div>
<div className="text-2xl font-bold text-orange-500">{rimoText(view.stats.pending)}</div></div>
<div className={rimoClass(["bg-white rounded-xl p-4 border shadow-sm stat-card cursor-pointer hover:border-[color:var(--app-color-primary)] transition-colors", rimoClass(view.activeSummaryCard === 'todayNew' ? 'border-[color:var(--app-color-primary)] ring-1 ring-[color:var(--app-color-primary)]' : 'border-gray-100')])} role="button" tabIndex="0" aria-pressed={view.activeSummaryCard === 'todayNew'} onClick={_event => {
          view.applySummaryFilter('todayNew');
        }} onKeyDown={event => {
          event.preventDefault();
          if (event.key !== 'Enter') return;
          view.applySummaryFilter('todayNew');
        }} data-rimo-layout="stat"><div className="text-gray-500 text-xs font-medium mb-1">{text("今日新增")}</div>
<div className="text-2xl font-bold text-blue-600">{rimoText(view.stats.todayNew)}</div></div>
<div className={rimoClass(["bg-white rounded-xl p-4 border shadow-sm stat-card cursor-pointer hover:border-[color:var(--app-color-primary)] transition-colors", rimoClass(view.activeSummaryCard === 'todayApproved' ? 'border-[color:var(--app-color-primary)] ring-1 ring-[color:var(--app-color-primary)]' : 'border-gray-100')])} role="button" tabIndex="0" aria-pressed={view.activeSummaryCard === 'todayApproved'} onClick={_event => {
          view.applySummaryFilter('todayApproved');
        }} onKeyDown={event => {
          event.preventDefault();
          if (event.key !== 'Enter') return;
          view.applySummaryFilter('todayApproved');
        }} data-rimo-layout="stat"><div className="text-gray-500 text-xs font-medium mb-1">{text("今日通過")}</div>
<div className="text-2xl font-bold text-green-600">{rimoText(view.stats.todayApproved)}</div></div>
<div className={rimoClass(["bg-white rounded-xl p-4 border shadow-sm stat-card cursor-pointer hover:border-[color:var(--app-color-primary)] transition-colors", rimoClass(view.activeSummaryCard === 'todayRejected' ? 'border-[color:var(--app-color-primary)] ring-1 ring-[color:var(--app-color-primary)]' : 'border-gray-100')])} role="button" tabIndex="0" aria-pressed={view.activeSummaryCard === 'todayRejected'} onClick={_event => {
          view.applySummaryFilter('todayRejected');
        }} onKeyDown={event => {
          event.preventDefault();
          if (event.key !== 'Enter') return;
          view.applySummaryFilter('todayRejected');
        }} data-rimo-layout="stat"><div className="text-gray-500 text-xs font-medium mb-1">{text("今日駁回")}</div>
<div className="text-2xl font-bold text-red-500">{rimoText(view.stats.todayRejected)}</div></div></div>
<div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col min-h-[600px]" data-rimo-layout="list"><RimoElement kind="el-table" data={view.filteredList} stripe={true} style={rimoStyle("width: 100%")} className="flex-1" onSelectionChange={event => {
          view.handleSelectionChange?.(event);
        }} headerCellStyle={{
          backgroundColor: '#f9fafb',
          color: '#374151',
          fontWeight: 'bold'
        }} slots={{
          "toolbar": _slot => <><div className="flex items-center gap-3"><RimoElement kind="el-input" modelValue={view.filters.keyword} onModelChange={value => {
                model.write(["filters", "keyword"], value);
              }} placeholder="搜索姓名或手機號" prefixIcon="Search" style={rimoStyle("width: 200px")}></RimoElement>
<RimoElement kind="el-select" modelValue={view.filters.status} onModelChange={value => {
                model.write(["filters", "status"], value);
              }} placeholder="審覈狀態" style={rimoStyle("width: 120px")} size="default"><RimoElement kind="el-option" label="全部狀態" value=""></RimoElement>
<RimoElement kind="el-option" label="待審覈" value="pending"></RimoElement>
<RimoElement kind="el-option" label="已通過" value="approved"></RimoElement>
<RimoElement kind="el-option" label="已駁回" value="rejected"></RimoElement></RimoElement>
<RimoElement kind="el-select" modelValue={view.filters.channel} onModelChange={value => {
                model.write(["filters", "channel"], value);
              }} placeholder="註冊渠道" style={rimoStyle("width: 120px")} size="default"><RimoElement kind="el-option" label="全部渠道" value=""></RimoElement>
<RimoElement kind="el-option" label="iOS APP" value="ios"></RimoElement>
<RimoElement kind="el-option" label="Android APP" value="android"></RimoElement>
<RimoElement kind="el-option" label="Web 官網" value="web"></RimoElement></RimoElement>
<RimoElement kind="el-date-picker" modelValue={view.filters.dateRange} onModelChange={value => {
                model.write(["filters", "dateRange"], value);
              }} type="daterange" rangeSeparator="-" startPlaceholder="提交起始" endPlaceholder="提交結束" size="default" style={rimoStyle("width: 240px")}></RimoElement>
<RimoElement kind="el-button" circle={true} onClick={event => {
                view.resetFilters?.(event);
              }} icon="RefreshRight" title="重置篩選"></RimoElement></div>
<div className="flex items-center gap-2"><RimoElement kind="el-button" type="primary" disabled={view.selectedRows.length === 0} onClick={event => {
                view.handleBatchApprove?.(event);
              }}><RimoElement kind="el-icon" className="mr-1"><RimoIcon name="Check" /></RimoElement>
{text(" 批量審覈\n                            ")}</RimoElement></div></>
        }}><RimoElement kind="el-table-column" type="selection" width="55" selectable={row => (row.status === 'pending' || row.status === 'rejected') && !row.isHighRisk}></RimoElement>
<RimoElement kind="el-table-column" prop="id" label="用戶ID" width="100" showOverflowTooltip={true}></RimoElement>
<RimoElement kind="el-table-column" label="姓名" width="120" slots={{
            "default": ({
              row
            }) => <><div className="flex items-center"><RimoElement kind="el-avatar" size={24} className="mr-2" src={row.avatar}>{rimoText(row.name.charAt(0))}</RimoElement>
<span className="font-medium">{rimoText(row.name)}</span></div></>
          }}></RimoElement>
<RimoElement kind="el-table-column" prop="phone" label="手機號" width="120"></RimoElement>
<RimoElement kind="el-table-column" label="渠道" width="100" slots={{
            "default": ({
              row
            }) => <>{row.channel === 'ios' ? <><div className="flex items-center"><RimoElement kind="el-icon" className="text-gray-500 mr-1"><RimoIcon name="Iphone" /></RimoElement>
{text(" iOS\n                                ")}</div></> : row.channel === 'android' ? <><div className="flex items-center"><RimoElement kind="el-icon" className="text-green-600 mr-1"><RimoIcon name="Iphone" /></RimoElement>
{text(" Android\n                                ")}</div></> : <><div className="flex items-center"><RimoElement kind="el-icon" className="text-blue-500 mr-1"><RimoIcon name="Monitor" /></RimoElement>
{text(" Web\n                                ")}</div></>}</>
          }}></RimoElement>
<RimoElement kind="el-table-column" prop="submitTime" label="提交時間" minWidth="160"></RimoElement>
<RimoElement kind="el-table-column" label="等待時長" width="150" slots={{
            "default": ({
              row
            }) => <><RimoElement kind="el-tag" type={view.getWaitTimeType(row.submitTime)} effect="plain" size="small">{text("\n                                    ")}{rimoText(view.getWaitTime(row.submitTime))}{text("\n                                ")}</RimoElement></>
          }}></RimoElement>
<RimoElement kind="el-table-column" label="狀態" width="100" slots={{
            "default": ({
              row
            }) => <>{row.status === 'pending' ? <><RimoElement kind="el-tag" type="warning" effect="light">{text("待審覈")}</RimoElement></> : row.isHighRisk ? <><RimoElement kind="el-tag" type="danger" effect="dark">{text("高風險")}</RimoElement></> : row.status === 'approved' ? <><RimoElement kind="el-tag" type="success" effect="light">{text("已通過")}</RimoElement></> : row.status === 'rejected' ? <><RimoElement kind="el-tag" type="danger" effect="light">{text("已駁回")}</RimoElement></> : null}</>
          }}></RimoElement>
<RimoElement kind="el-table-column" label="操作" width="100" fixed="right" slots={{
            "default": ({
              row
            }) => <>{!row.isHighRisk ? <><RimoElement kind="el-button" link={true} type="primary" onClick={_event => {
                  view.openReviewDrawer(row);
                }}>{text("\n                                    審覈\n                                ")}</RimoElement></> : <><span className="text-xs text-gray-400">{text("不可複審")}</span></>}</>
          }}></RimoElement></RimoElement>
<div className="p-4 border-t border-gray-100 flex justify-end"><RimoElement kind="el-pagination" currentPage={view.currentPage} onCurrentPageChange={value => {
            model.write(["currentPage"], value);
          }} pageSize={view.pageSize} onPageSizeChange={value => {
            model.write(["pageSize"], value);
          }} pageSizes={[10, 20, 50, 100]} layout="total, sizes, prev, pager, next, jumper" total={view.totalCount} background={true}></RimoElement></div></div></div><RimoElement kind="el-dialog" modelValue={view.submitReviewDialogVisible} onModelChange={value => {
      model.write(["submitReviewDialogVisible"], value);
    }} title={view.reviewSubmitMode === 'batch' ? '批量提交審覈' : '提交審覈'} width="760px" className="member-review-overlay" slots={{
      "footer": _slot => <><span className="dialog-footer"><RimoElement kind="el-button" onClick={_event => {
            model.write(["submitReviewDialogVisible"], false);
          }}>{text("取消")}</RimoElement>
<RimoElement kind="el-button" type="primary" loading={view.submitting} onClick={event => {
            view.handleSubmitReview?.(event);
          }}>{text("確認提交")}</RimoElement></span></>
    }}>{() => <><RimoElement kind="el-tabs" modelValue={view.submitTab} onModelChange={value => {
          model.write(["submitTab"], value);
        }}><RimoElement kind="el-tab-pane" label="新版審覈" name="new"><div className="space-y-4"><div className="rounded-xl border border-gray-200 p-4"><div className="flex items-center justify-between mb-3"><div><div className="text-sm font-bold text-gray-800">{text("資料審覈結果")}</div>
<div className="text-xs text-gray-500 mt-1">{text("逐項確認通過或不通過；不通過時必須選擇駁回原因。")}</div></div>
{view.reviewSubmitMode === 'batch' ? <><RimoElement kind="el-tag" type="warning" effect="plain">{text("\n                                已選 ")}{rimoText(view.selectedRows.length)}{text(" 名會員\n                            ")}</RimoElement></> : null}</div>
<div className="space-y-3">{rimoEntries(view.reviewItems).map(([item], _itemIndex) => <Fragment key={item.key}><div key={item.key} className="flex items-center gap-3 rounded-lg bg-gray-50 border border-gray-100 px-3 py-2"><div className="w-28 text-sm font-semibold text-gray-700">{rimoText(item.label)}</div>
<RimoElement kind="el-radio-group" modelValue={view.reviewSubmitForm[item.key].status} onModelChange={value => {
                        model.write(["reviewSubmitForm", item.key, "status"], value);
                      }} size="small"><RimoElement kind="el-radio-button" label="approved">{text("通過")}</RimoElement>
<RimoElement kind="el-radio-button" label="rejected">{text("不通過")}</RimoElement></RimoElement>
{view.reviewSubmitForm[item.key].status === 'rejected' ? <><RimoElement kind="el-select" modelValue={view.reviewSubmitForm[item.key].reason} onModelChange={value => {
                          model.write(["reviewSubmitForm", item.key, "reason"], value);
                        }} placeholder="選擇或輸入駁回原因" size="small" filterable={true} allowCreate={true} defaultFirstOption={true} className="flex-1">{rimoEntries(view.rejectOptions[item.key]).map(([reason], _itemIndex) => <Fragment key={reason}><RimoElement kind="el-option" key={reason} label={reason} value={reason}></RimoElement></Fragment>)}</RimoElement></> : null}</div></Fragment>)}</div>
{view.submitRejectReasonText ? <><div className="mt-3 rounded-lg bg-red-50 border border-red-100 px-3 py-2 text-xs text-red-700">{text("\n                            駁回內容：")}{rimoText(view.submitRejectReasonText)}{text("\n                        ")}</div></> : null}
{view.hasRejectedItems && view.reviewSubmitMode === 'single' ? <><div className="mt-3 border-t border-gray-100 pt-3"><RimoElement kind="el-checkbox" modelValue={view.isHighRisk} onModelChange={value => {
                      model.write(["isHighRisk"], value);
                    }}><span className="text-red-600 font-medium">{text("高風險用戶，不再提供複審")}</span></RimoElement></div></> : null}</div>
<div className="rounded-xl border border-gray-200 p-4"><div className="flex items-start justify-between gap-4"><div><div className="text-sm font-bold text-gray-800">{text("用戶可用載具類型")}</div>
<div className="text-xs text-gray-500 mt-1">{text("\n                                    駕駛執照通過後寫入會員資料；批量審覈時同一選擇會套用到本次選中的會員。\n                                ")}</div></div>
<RimoElement kind="el-checkbox-group" modelValue={view.selectedAvailableVehicleTypes} onModelChange={value => {
                    model.write(["selectedAvailableVehicleTypes"], value);
                  }} disabled={view.isDriverLicenseRejected} className="flex flex-wrap justify-end gap-x-4 gap-y-1">{rimoEntries(view.vehicleTypeOptions).map(([item], _itemIndex) => <Fragment key={item.value}><RimoElement kind="el-checkbox" key={item.value} label={item.value}>{text("\n                                    ")}{rimoText(item.label)}{text("\n                                ")}</RimoElement></Fragment>)}</RimoElement></div>
<div className="text-xs text-gray-500 mt-2">{text("\n                            ")}{rimoText(view.vehicleTypeRuleText)}{text("\n                        ")}</div></div>
<RimoElement kind="el-alert" title={view.submitReviewSummary} type="info" showIcon={true} closable={false}></RimoElement></div></RimoElement>
<RimoElement kind="el-tab-pane" label="舊版示例" name="legacy"><div className="space-y-3"><div className="rounded-xl border border-gray-200 p-4 space-y-3"><div><div className="text-sm font-bold text-gray-800 mb-1">{text("審覈結果")}</div>
<div className="text-xs text-gray-500 mb-2">{text("對本次申請整體判定通過或不通過。")}</div>
<RimoElement kind="el-radio-group" modelValue={view.legacyForm.decision} onModelChange={value => {
                    model.write(["legacyForm", "decision"], value);
                  }} size="default"><RimoElement kind="el-radio-button" label="approved">{text("通過")}</RimoElement>
<RimoElement kind="el-radio-button" label="rejected">{text("不通過")}</RimoElement></RimoElement></div>
{view.legacyForm.decision === 'rejected' ? <><><div className="border-t border-gray-100"></div>
<div><div className="text-sm font-bold text-gray-800 mb-1">{text("不通過類型")}</div>
<div className="text-xs text-gray-500 mb-2">{text("選擇本次不通過的原因類型，可多選。")}</div>
<RimoElement kind="el-checkbox-group" modelValue={view.legacyForm.rejectTypes} onModelChange={value => {
                        model.write(["legacyForm", "rejectTypes"], value);
                      }} className="!grid grid-cols-2 gap-x-6 gap-y-1.5">{rimoEntries(view.legacyRejectTypeOptions).map(([item], _itemIndex) => <Fragment key={item.value}><RimoElement kind="el-checkbox" key={item.value} label={item.value}>{text("\n                                                ")}{rimoText(item.label)}{text("\n                                            ")}</RimoElement></Fragment>)}</RimoElement></div>
<div><div className="text-sm font-bold text-gray-800 mb-1">{text("備註說明")}</div>
<div className="text-xs text-gray-500 mb-2">{text("點擊下方常用原因可快速填寫，也可直接輸入。")}</div>
<div className="flex flex-wrap gap-1.5 mb-2">{rimoEntries(view.legacyRemarkOptions).map(([r], _itemIndex) => <Fragment key={r}><RimoElement kind="el-tag" key={r} size="small" className="cursor-pointer" type={view.isLegacyRemarkSelected(r) ? 'success' : 'info'} effect="plain" onClick={_event => {
                            view.toggleLegacyRemark(r);
                          }}>{rimoText(r)}</RimoElement></Fragment>)}</div>
<RimoElement kind="el-input" modelValue={view.legacyForm.remark} onModelChange={value => {
                        model.write(["legacyForm", "remark"], value);
                      }} type="textarea" rows={2} placeholder="填寫駁回備註說明"></RimoElement></div>
{view.reviewSubmitMode === 'single' ? <><div><RimoElement kind="el-checkbox" modelValue={view.legacyForm.isHighRisk} onModelChange={value => {
                          model.write(["legacyForm", "isHighRisk"], value);
                        }}><span className="text-red-600 font-medium">{text("高風險用戶，不再提供複審")}</span></RimoElement></div></> : null}</></> : null}</div>
<div className="rounded-xl border border-gray-200 p-4"><div className="text-sm font-bold text-gray-800 mb-1">{text("用戶可用載具類型")}</div>
<div className="text-xs text-gray-500 mb-2">{text("駕駛執照通過後寫入會員資料；批量審覈時同一選擇會套用到本次選中的會員。")}</div>
<RimoElement kind="el-checkbox-group" modelValue={view.legacyForm.vehicleTypes} onModelChange={value => {
                  model.write(["legacyForm", "vehicleTypes"], value);
                }} className="flex flex-wrap gap-x-6 gap-y-1.5">{rimoEntries(view.vehicleTypeOptions).map(([item], _itemIndex) => <Fragment key={item.value}><RimoElement kind="el-checkbox" key={item.value} label={item.value}>{text("\n                                        ")}{rimoText(item.label)}{text("\n                                    ")}</RimoElement></Fragment>)}</RimoElement></div></div></RimoElement></RimoElement></>}</RimoElement>
<RimoElement kind="el-drawer" modelValue={view.drawerVisible} onModelChange={value => {
      model.write(["drawerVisible"], value);
    }} size="760px" showClose={false} customClass="review-drawer" className="member-review-overlay" slots={{
      "header": ({
        close,
        titleId: _titleId,
        titleClass: _titleClass
      }) => <><div className="flex items-center justify-between w-full"><div className="flex items-center gap-3"><h4 className="text-lg font-bold text-gray-900">{text("審覈詳情")}</h4>
{view.currentMember?.status === 'pending' ? <><RimoElement kind="el-tag" type="warning" effect="dark" size="small">{text("待審覈")}</RimoElement></> : view.currentMember?.status === 'rejected' ? <><RimoElement kind="el-tag" type="danger" effect="dark" size="small">{text("已駁回")}</RimoElement></> : null}</div>
<RimoElement kind="el-button" link={true} onClick={event => {
            close?.(event);
          }}><RimoElement kind="el-icon" className="text-xl text-gray-400 hover:text-gray-600"><RimoIcon name="Close" /></RimoElement></RimoElement></div></>
    }}>{() => <>{view.currentMember ? <><div className="px-6 pt-2 pb-20 space-y-2" style={rimoStyle("background:#f8f9fb; min-height:100%;")}><div className="drawer-member-card rounded-xl p-3 flex items-center justify-between"><div className="flex items-center gap-3"><RimoElement kind="el-avatar" size={48} style={rimoStyle("background:linear-gradient(135deg,var(--app-color-primary),var(--app-color-primary)); color:#fff; font-size:18px; font-weight:700;")}>{text("\n                                ")}{rimoText(view.currentMember.name?.charAt(0))}{text("\n                            ")}</RimoElement>
<div><div className="font-bold text-gray-900 text-base">{rimoText(view.currentMember.name)}{text("\n                                    ")}
<RimoElement kind="el-tag" size="small" effect="plain" className="ml-2" type="info">{rimoText(view.currentMember.id)}</RimoElement></div>
<div className="text-sm text-gray-500 mt-1 flex items-center gap-3"><span className="flex items-center gap-1">{view.currentMember.channel === 'ios' ? <><RimoElement kind="el-icon" className="text-gray-500"><RimoIcon name="Iphone" /></RimoElement></> : view.currentMember.channel === 'android' ? <><RimoElement kind="el-icon" className="text-green-500"><RimoIcon name="Iphone" /></RimoElement></> : <><RimoElement kind="el-icon" className="text-blue-500"><RimoIcon name="Monitor" /></RimoElement></>}
{text("\n                                        ")}{rimoText(view.currentMember.channel === 'ios' ? 'iOS APP' : view.currentMember.channel === 'android' ? 'Android APP' : 'Web 官網')}{text("\n                                    ")}</span>
<span className="text-gray-300">{text("|")}</span>
<span>{text("提交於 ")}{rimoText(view.currentMember.submitTime)}</span></div></div></div>
<div className="text-right"><div className="text-xs text-gray-400 mb-1">{text("等待時長")}</div>
<div className={rimoClass(["text-sm font-bold", rimoClass(view.getWaitTimeColor(view.currentMember.submitTime))])}>{text("\n                                ")}{rimoText(view.getWaitTime(view.currentMember.submitTime))}{text("\n                            ")}</div></div></div>
<div className="review-section rounded-xl p-3 relative"><div className="flex items-center justify-between mb-2"><div className="flex items-center gap-3"><div className="drawer-step-badge bg-blue-50 text-blue-600">{text("1")}</div>
<h5 className="font-bold text-gray-800 text-sm">{text("基本資料")}</h5></div>
<div className="text-xs text-gray-400">{text("提交審覈時確認")}</div></div>
<div className="drawer-section-divider mb-2">{text("身份信息")}</div>
<dl className="drawer-info-grid mb-2"><div className="drawer-info-item"><dt>{text("姓名")}</dt>
<dd>{rimoText(view.currentMember.name)}</dd></div>
<div className="drawer-info-item"><dt>{text("性別")}</dt>
<dd>{rimoText(view.currentMember.gender === 'male' ? '男' : '女')}</dd></div>
<div className="drawer-info-item"><dt>{text("出生日期")}</dt>
<dd className="font-mono">{rimoText(view.currentMember.dob)}</dd></div>
<div className="drawer-info-item"><dt>{text("身份證號碼")}</dt>
<dd className="font-mono">{rimoText(view.currentMember.idNumber || '-')}</dd></div></dl>
<div className="drawer-section-divider mb-2">{text("聯繫與賬戶")}</div>
<dl className="drawer-info-grid mb-2"><div className="drawer-info-item"><dt>{text("手機號")}</dt>
<dd className="font-mono">{rimoText(view.currentMember.phone)}</dd></div>
<div className="drawer-info-item"><dt>{text("電子郵箱")}</dt>
<dd className="font-mono">{rimoText(view.currentMember.email)}</dd></div>
<div className="drawer-info-item"><dt>{text("註冊渠道")}</dt>
<dd>{rimoText(view.getChannelLabel(view.currentMember.channel))}</dd></div>
<div className="drawer-info-item"><dt>{text("註冊時間")}</dt>
<dd className="font-mono">{rimoText(view.currentMember.registerTime || '-')}</dd></div>
<div className="drawer-info-item is-wide"><dt>{text("最後登錄")}</dt>
<dd className="font-mono">{rimoText(view.currentMember.lastLoginTime || '-')}</dd></div></dl>
<div className="drawer-section-divider mb-2">{text("地址信息")}</div>
<dl className="drawer-info-grid mb-2"><div className="drawer-info-item is-wide"><dt>{text("戶籍地址")}</dt>
<dd>{rimoText(view.currentMember.householdAddress)}</dd></div>
<div className="drawer-info-item is-wide"><dt>{text("通訊地址")}</dt>
<dd>{rimoText(view.currentMember.mailingAddress)}</dd></div></dl>
<div className="drawer-section-divider mb-2">{text("緊急聯絡人")}</div>
<dl className="drawer-info-grid is-three-column"><div className="drawer-info-item"><dt>{text("姓名")}</dt>
<dd>{rimoText(view.currentMember.emergencyContact?.name)}</dd></div>
<div className="drawer-info-item"><dt>{text("關係")}</dt>
<dd>{rimoText(view.currentMember.emergencyContact?.relationship)}</dd></div>
<div className="drawer-info-item"><dt>{text("聯繫電話")}</dt>
<dd className="font-mono">{rimoText(view.currentMember.emergencyContact?.phone)}</dd></div></dl></div>
<div className="review-section rounded-xl p-3 relative"><div className="flex items-center justify-between mb-2"><div className="flex items-center gap-3"><div className="drawer-step-badge bg-green-50 text-green-600">{text("2")}</div>
<h5 className="font-bold text-gray-800 text-sm">{text("身份證")}</h5></div>
<div className="text-xs text-gray-400">{text("提交審覈時確認")}</div></div>
<div className="grid grid-cols-2 gap-4"><div className="drawer-photo-card"><div className="photo-label">{text("身份證正面")}</div>
<RimoElement kind="el-image" src={view.currentMember.idCardFront} previewSrcList={[view.currentMember.idCardFront]} fit="cover" className="w-full h-36 rounded-lg cursor-zoom-in"></RimoElement></div>
<div className="drawer-photo-card"><div className="photo-label">{text("身份證反面")}</div>
<RimoElement kind="el-image" src={view.currentMember.idCardBack} previewSrcList={[view.currentMember.idCardBack]} fit="cover" className="w-full h-36 rounded-lg cursor-zoom-in"></RimoElement></div></div></div>
<div className="review-section rounded-xl p-3 relative"><div className="flex items-center justify-between mb-2"><div className="flex items-center gap-3"><div className="drawer-step-badge bg-amber-50 text-amber-600">{text("3")}</div>
<h5 className="font-bold text-gray-800 text-sm">{text("駕駛執照")}</h5></div>
<div className="text-xs text-gray-400">{text("提交審覈時確認")}</div></div>
<div className="grid grid-cols-4 gap-3 mb-2"><div className="drawer-info-item"><dt>{text("駕照類型")}</dt>
<dd>{rimoText(view.currentMember.driverLicense?.type || '-')}</dd></div>
<div className="drawer-info-item"><dt>{text("簽發地")}</dt>
<dd>{rimoText(view.currentMember.driverLicense?.issuePlace || '-')}</dd></div>
<div className="drawer-info-item"><dt>{text("駕照號碼")}</dt>
<dd className="font-mono">{rimoText(view.currentMember.driverLicense?.number || '-')}</dd></div>
<div className="drawer-info-item"><dt>{text("有效日期")}</dt>
<dd className="font-mono">{rimoText(view.currentMember.driverLicense?.expiryDate || '-')}</dd></div></div>
<div className="grid grid-cols-2 gap-4"><div className="drawer-photo-card"><div className="photo-label">{text("駕照正面")}</div>
<RimoElement kind="el-image" src={view.currentMember.dlFront} previewSrcList={[view.currentMember.dlFront]} fit="cover" className="w-full h-36 rounded-lg cursor-zoom-in"></RimoElement></div>
<div className="drawer-photo-card"><div className="photo-label">{text("駕照反面")}</div>
<RimoElement kind="el-image" src={view.currentMember.dlBack} previewSrcList={[view.currentMember.dlBack]} fit="cover" className="w-full h-36 rounded-lg cursor-zoom-in"></RimoElement></div></div></div>
<div className="review-section rounded-xl p-3 relative"><div className="flex items-center justify-between mb-2"><div className="flex items-center gap-3"><div className="drawer-step-badge bg-[color:var(--app-color-primary-light-9)] text-[color:var(--app-color-primary)]">{text("4")}</div>
<h5 className="font-bold text-gray-800 text-sm">{text("手持證件自拍")}</h5></div>
<div className="text-xs text-gray-400">{text("提交審覈時確認")}</div></div>
<div className="grid grid-cols-2 gap-4"><div className="drawer-photo-card"><div className="photo-label">{text("手持身份證自拍")}</div>
<RimoElement kind="el-image" src={view.currentMember.selfie} previewSrcList={[view.currentMember.selfie]} fit="cover" className="w-full h-44 rounded-lg cursor-zoom-in"></RimoElement></div>
<div className="drawer-photo-card"><div className="photo-label">{text("其他證件照")}</div>
<RimoElement kind="el-image" src={view.currentMember.otherDocument} previewSrcList={[view.currentMember.otherDocument]} fit="cover" className="w-full h-44 rounded-lg cursor-zoom-in"></RimoElement></div></div></div>
<div className="review-section rounded-xl p-3 relative"><div className="flex items-center justify-between mb-2"><div className="flex items-center gap-3"><div className="drawer-step-badge bg-cyan-50 text-cyan-600">{text("5")}</div>
<h5 className="font-bold text-gray-800 text-sm">{text("信用卡資料")}</h5></div>
<div className="text-xs text-gray-400">{text("僅供審覈覈對")}</div></div>
<RimoElement kind="el-table" data={view.currentMember.creditCards || []} tableLayout="fixed" className="drawer-data-table" emptyText="暫無信用卡資料"><RimoElement kind="el-table-column" prop="cardName" label="信用卡名稱" minWidth="130"></RimoElement>
<RimoElement kind="el-table-column" prop="holderName" label="持卡人姓名" width="110"></RimoElement>
<RimoElement kind="el-table-column" label="信用卡號" minWidth="170" slots={{
                  "default": scope => <><span className="card-number">{rimoText(scope.row.cardNumber)}</span></>
                }}></RimoElement>
<RimoElement kind="el-table-column" prop="expiryDate" label="有效期限" width="90"></RimoElement>
<RimoElement kind="el-table-column" label="默認" width="70" align="center" slots={{
                  "default": scope => <>{scope.row.isDefault ? <><RimoElement kind="el-tag" type="success" size="small" effect="plain">{text("是")}</RimoElement></> : <><span className="text-gray-400">{text("否")}</span></>}</>
                }}></RimoElement></RimoElement></div>
<div className="history-card"><div className="flex items-center gap-3 mb-2"><div className="drawer-step-badge bg-slate-100 text-slate-600">{text("6")}</div>
<h5 className="font-bold text-gray-800 text-sm">{text("審覈歷史")}</h5></div>
<RimoElement kind="el-table" data={view.currentMember.history || []} tableLayout="fixed" maxHeight="250" className="drawer-data-table" emptyText="暫無審覈記錄"><RimoElement kind="el-table-column" prop="time" label="時間" width="150"></RimoElement>
<RimoElement kind="el-table-column" label="結果" width="90" align="center" slots={{
                  "default": scope => <><RimoElement kind="el-tag" type={view.getHistoryTagType(scope.row.type)} size="small" effect="plain">{text("\n                                        ")}{rimoText(view.getHistoryResultLabel(scope.row))}{text("\n                                    ")}</RimoElement></>
                }}></RimoElement>
<RimoElement kind="el-table-column" prop="content" label="審覈說明" minWidth="230" showOverflowTooltip={true}></RimoElement>
<RimoElement kind="el-table-column" label="審覈人" width="100" slots={{
                  "default": scope => <>{rimoText(scope.row.operator || view.getHistoryOperator(scope.row))}</>
                }}></RimoElement></RimoElement></div></div></> : null}
<div className="absolute bottom-0 left-0 w-full bg-white/95 backdrop-blur-sm border-t border-gray-200 px-6 py-3 flex justify-between items-center z-50"><div className="flex items-center gap-4"><div className="text-sm text-gray-500">{text("點擊提交審覈後，統一確認四項資料審覈結果。")}</div></div>
<div className="flex gap-3"><RimoElement kind="el-button" onClick={_event => {
              model.write(["drawerVisible"], false);
            }}>{text("關閉")}</RimoElement>
<RimoElement kind="el-button" type="primary" onClick={_event => {
              view.openSubmitReviewDialog('single');
            }} loading={view.submitting}>{!view.submitting ? <><RimoElement kind="el-icon" className="mr-1"><RimoIcon name="Check" /></RimoElement></> : null}
{text("\n                            提交審覈\n                        ")}</RimoElement></div></div></>}</RimoElement></RimoRoot>;
}