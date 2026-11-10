import { Fragment } from 'react';
import { useRimoModel, rimoEntries } from '../../lib/rimo-model.js';
import { RimoRoot, RimoIcon, rimoIcons, useRimoEnvironment } from '../../lib/RimoEnvironment.jsx';
import { RimoElement, rimoClass, rimoStyle, rimoText } from '../../lib/RimoElements.jsx';
import './members.css';
function createPageState(model) {
  const _document = model.document;
  const window = model.window;
  const localStorage = model.storage;
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
      watch: watch,
      onMount: onMounted,
      onDispose: onBeforeUnmount
    } = model;
    const {
      ElMessage: _ElMessage,
      ElMessageBox: _ElMessageBox
    } = feedback;
    const membershipPlans = ref([{
      id: 'MP001',
      name: '普通會員'
    }, {
      id: 'MP002',
      name: '銀牌會員'
    }, {
      id: 'MP003',
      name: '金牌會員'
    }, {
      id: 'MP004',
      name: '鑽石會員'
    }]);
    const corporateList = ref([{
      id: 'CORP001',
      name: 'Google Taiwan'
    }, {
      id: 'CORP002',
      name: 'TSMC 臺積電'
    }, {
      id: 'CORP003',
      name: 'Microsoft Taiwan'
    }, {
      id: 'CORP004',
      name: 'Apple Taiwan'
    }]);
    const licenseTypes = ref([{
      id: 'LT01',
      name: '普通小型車'
    }, {
      id: 'LT02',
      name: '普通重型機車'
    }, {
      id: 'LT03',
      name: '大型重型機車'
    }, {
      id: 'LT04',
      name: '大客車'
    }]);
    const vehicleTypeOptions = ref([{
      value: 'car',
      label: '汽車'
    }, {
      value: 'motorcycle',
      label: '摩托車'
    }, {
      value: 'microElectric',
      label: '微電車'
    }]);
    const inferAvailableVehicleTypes = (driverLicense = {}) => {
      const result = ['microElectric'];
      if (driverLicense.type === 'LT01' || driverLicense.type === 'LT04') result.unshift('car');
      if (driverLicense.type === 'LT02' || driverLicense.type === 'LT03') result.unshift('motorcycle');
      return [...new Set(result)];
    };
    const currentStep = ref(0);
    const formSteps = ref([{
      title: '賬號資料',
      icon: 'UserFilled'
    }, {
      title: '地址聯絡',
      icon: 'Location'
    }, {
      title: '駕照證件',
      icon: 'Van'
    }, {
      title: '會員方案',
      icon: 'Medal'
    }]);
    const photoFields = ref([{
      key: 'idCardFront',
      label: '身份證正面'
    }, {
      key: 'idCardBack',
      label: '身份證反面'
    }, {
      key: 'licenseFront',
      label: '駕照正面'
    }, {
      key: 'licenseBack',
      label: '駕照反面'
    }, {
      key: 'selfie',
      label: '自拍照'
    }]);
    const defaultMembers = [{
      id: 'U10001',
      accountType: 'personal',
      account: '0912345678',
      name: '張三',
      surname: '張',
      firstName: '三',
      gender: 'male',
      dob: '1990-01-01',
      phone: '0912-345-678',
      email: 'zhangsan@example.com',
      idNumber: 'A123456789',
      householdAddress: '臺北市信義區信義路五段7號',
      mailingAddress: '臺北市信義區信義路五段7號',
      emergencyContact: {
        name: '李四',
        relationship: '配偶',
        phone: '0987-654-321'
      },
      driverLicense: {
        type: 'LT01',
        issuePlace: '臺北市',
        number: 'DL123456',
        expiryDate: '2030-01-01'
      },
      availableVehicleTypes: ['car', 'microElectric'],
      membership: {
        planId: 'MP003',
        planName: '金牌會員',
        expireDate: '2025-06-30',
        autoRenew: true
      },
      corporate: null,
      status: 'active',
      reviewStatus: 'approved',
      registrationChannel: 'official_web',
      createTime: '2024-01-15 10:30',
      lastLoginTime: '2024-05-06 14:20',
      orderHistory: [{
        orderId: 'ZT2405010001',
        createTime: '2024-05-01 10:00',
        vehicle: 'Toyota RAV4',
        amount: 1920,
        status: 'completed',
        statusText: '已完成'
      }]
    }, {
      id: 'U10002',
      accountType: 'personal',
      account: '0922333444',
      name: '李四',
      surname: '李',
      firstName: '四',
      gender: 'male',
      dob: '1992-02-02',
      phone: '0922-333-444',
      email: 'lisi@example.com',
      idNumber: 'B123456789',
      householdAddress: '',
      mailingAddress: '',
      emergencyContact: {},
      driverLicense: {},
      availableVehicleTypes: ['microElectric'],
      membership: {
        planId: 'MP001',
        planName: '普通會員',
        expireDate: null,
        autoRenew: false
      },
      corporate: null,
      status: 'suspended',
      reviewStatus: 'approved',
      registrationChannel: 'ios',
      createTime: '2024-02-15 10:30',
      lastLoginTime: '2024-03-01 14:20',
      orderHistory: []
    }, {
      id: 'U10003',
      accountType: 'personal',
      account: '0933444555',
      name: '王五',
      surname: '王',
      firstName: '五',
      gender: 'male',
      dob: '1988-08-08',
      phone: '0933-444-555',
      email: 'wangwu@example.com',
      idNumber: 'C123456789',
      householdAddress: '',
      mailingAddress: '',
      emergencyContact: {},
      driverLicense: {},
      availableVehicleTypes: ['microElectric'],
      membership: {
        planId: 'MP001',
        planName: '普通會員',
        expireDate: null,
        autoRenew: false
      },
      corporate: null,
      status: 'blacklisted',
      reviewStatus: 'approved',
      registrationChannel: 'android',
      createTime: '2023-11-15 10:30',
      lastLoginTime: '2023-12-01 14:20',
      orderHistory: []
    }, {
      id: 'U10004',
      accountType: 'personal',
      account: '0944555666',
      name: '趙六',
      surname: '趙',
      firstName: '六',
      gender: 'female',
      dob: '1995-05-05',
      phone: '0944-555-666',
      email: 'zhaoliu@example.com',
      idNumber: 'D123456789',
      householdAddress: '',
      mailingAddress: '',
      emergencyContact: {},
      driverLicense: {},
      availableVehicleTypes: ['microElectric'],
      membership: {
        planId: 'MP001',
        planName: '普通會員',
        expireDate: null,
        autoRenew: false
      },
      corporate: null,
      status: 'archived',
      reviewStatus: 'approved',
      registrationChannel: 'official_web',
      createTime: '2022-01-01 10:30',
      lastLoginTime: '2022-06-01 14:20',
      orderHistory: []
    }, {
      id: 'U10005',
      accountType: 'personal',
      account: '0911222333',
      name: '林志明',
      surname: '林',
      firstName: '志明',
      gender: 'male',
      dob: '1985-05-05',
      phone: '0911-222-333',
      email: 'chihming.lin@example.com',
      idNumber: 'G123456789',
      householdAddress: '臺北市信義區',
      mailingAddress: '臺北市信義區',
      emergencyContact: {
        name: '',
        relationship: '',
        phone: ''
      },
      driverLicense: {
        type: '',
        issuePlace: '',
        number: '',
        expiryDate: ''
      },
      availableVehicleTypes: ['microElectric'],
      membership: {
        planId: 'MP004',
        planName: '鑽石會員',
        expireDate: '2030-12-31',
        autoRenew: true
      },
      corporate: {
        companyId: 'CORP001',
        companyName: 'Google Taiwan',
        taxId: '12345678'
      },
      status: 'active',
      reviewStatus: 'approved',
      registrationChannel: 'official_web',
      createTime: '2023-01-01 09:00',
      lastLoginTime: '2024-05-10 09:00',
      orderHistory: []
    }, {
      id: 'U10006',
      accountType: 'personal',
      account: '0955666777',
      name: '陳怡君',
      surname: '陳',
      firstName: '怡君',
      gender: 'female',
      dob: '1990-10-10',
      phone: '0955-666-777',
      email: 'yijun.chen@example.com',
      idNumber: 'T123456789',
      householdAddress: '新竹科學園區',
      mailingAddress: '新竹科學園區',
      emergencyContact: {
        name: '',
        relationship: '',
        phone: ''
      },
      driverLicense: {
        type: '',
        issuePlace: '',
        number: '',
        expiryDate: ''
      },
      availableVehicleTypes: ['microElectric'],
      membership: {
        planId: 'MP003',
        planName: '金牌會員',
        expireDate: '2025-12-31',
        autoRenew: true
      },
      corporate: {
        companyId: 'CORP002',
        companyName: 'TSMC 臺積電',
        taxId: '87654321'
      },
      status: 'active',
      reviewStatus: 'approved',
      registrationChannel: 'official_web',
      createTime: '2024-02-01 10:00',
      lastLoginTime: '2024-05-09 14:00',
      orderHistory: []
    }, {
      id: 'U10007',
      accountType: 'personal',
      account: '0988000111',
      name: '王小敏',
      surname: '王',
      firstName: '小敏',
      gender: 'female',
      dob: '2000-01-01',
      phone: '0988-000-111',
      email: 'xiaomin@example.com',
      idNumber: 'E123456789',
      householdAddress: '臺中市',
      mailingAddress: '',
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
      membership: {
        planId: 'MP001',
        planName: '普通會員',
        expireDate: null,
        autoRenew: false
      },
      corporate: null,
      status: 'active',
      reviewStatus: 'pending',
      registrationChannel: 'android',
      createTime: '2024-05-10 08:00',
      lastLoginTime: '',
      orderHistory: []
    }, {
      id: 'U10008',
      accountType: 'personal',
      account: '0988000222',
      name: '陳志強',
      surname: '陳',
      firstName: '志強',
      gender: 'male',
      dob: '1995-05-05',
      phone: '0988-000-222',
      email: 'zhiqiang@example.com',
      idNumber: 'F123456789',
      householdAddress: '高雄市',
      mailingAddress: '',
      emergencyContact: {},
      driverLicense: {
        type: 'LT01',
        issuePlace: '高雄市',
        number: 'DL777666',
        expiryDate: '2028-05-05'
      },
      availableVehicleTypes: ['car', 'microElectric'],
      membership: {
        planId: 'MP001',
        planName: '普通會員',
        expireDate: null,
        autoRenew: false
      },
      corporate: null,
      status: 'active',
      reviewStatus: 'pending',
      registrationChannel: 'ios',
      createTime: '2024-05-10 09:30',
      lastLoginTime: '',
      orderHistory: []
    }];
    const storedMembersRaw = localStorage.getItem('rimo_members');
    let initialMembers = storedMembersRaw ? JSON.parse(storedMembersRaw) : defaultMembers;
    if (initialMembers.length > 20) {
      console.log('Resetting mock data to defaults...');
      initialMembers = defaultMembers;
      localStorage.setItem('rimo_members', JSON.stringify(initialMembers));
    }
    const members = ref(initialMembers);
    const summaryStats = computed(() => ({
      total: members.value.length,
      corporate: members.value.filter(member => !!member.corporate).length,
      suspended: members.value.filter(member => member.status === 'suspended').length,
      active: members.value.filter(member => member.status === 'active' && member.reviewStatus === 'approved').length
    }));
    members.value.forEach(m => {
      m.accountType = 'personal';
      if (!m.reviewStatus) m.reviewStatus = 'approved';
      if (!m.registrationChannel) m.registrationChannel = 'official_web';
      if (!Object.prototype.hasOwnProperty.call(m, 'corporate')) m.corporate = null;
      if (!Array.isArray(m.availableVehicleTypes)) m.availableVehicleTypes = inferAvailableVehicleTypes(m.driverLicense);
      if (m.id === 'U10005') {
        m.name = '林志明';
        m.surname = '林';
        m.firstName = '志明';
        m.email = 'chihming.lin@example.com';
      }
      if (m.id === 'U10006') {
        m.name = '陳怡君';
        m.surname = '陳';
        m.firstName = '怡君';
        m.email = 'yijun.chen@example.com';
        if (m.corporate) m.corporate.companyName = 'TSMC 臺積電';
      }
    });
    watch(members, newVal => {
      localStorage.setItem('rimo_members', JSON.stringify(newVal));
    }, {
      deep: true
    });
    const filters = reactive({
      keyword: '',
      corporateQualification: '',
      planId: '',
      status: '',
      reviewStatus: '',
      registrationChannel: '',
      vehicleType: '',
      registrationDateRange: []
    });
    const activeSummaryCard = ref('');
    const showMoreFilters = ref(false);
    const filterToolbar = ref(null);
    const filterLayoutTier = ref(1);
    let isApplyingSummaryFilter = false;
    let filterResizeObserver = null;
    const updateFilterLayout = () => {
      const width = filterToolbar.value?.clientWidth || 0;
      if (width >= 1570) filterLayoutTier.value = 6;else if (width >= 1405) filterLayoutTier.value = 5;else if (width >= 1260) filterLayoutTier.value = 4;else if (width >= 1130) filterLayoutTier.value = 3;else if (width >= 980) filterLayoutTier.value = 2;else filterLayoutTier.value = 1;
    };
    onMounted(() => {
      filterResizeObserver = new ResizeObserver(updateFilterLayout);
      if (filterToolbar.value) filterResizeObserver.observe(filterToolbar.value);
      updateFilterLayout();
    });
    onBeforeUnmount(() => {
      filterResizeObserver?.disconnect();
    });
    const parseDateTime = value => {
      if (!value) return null;
      if (value instanceof Date) return value;
      const parsed = new Date(String(value).replace(' ', 'T'));
      return Number.isNaN(parsed.getTime()) ? null : parsed;
    };
    const currentPage = ref(1);
    const pageSize = ref(20);
    watch(() => [filters.keyword, filters.corporateQualification, filters.planId, filters.status, filters.reviewStatus, filters.registrationChannel, filters.vehicleType, filters.registrationDateRange?.[0] ? new Date(filters.registrationDateRange[0]).getTime() : '', filters.registrationDateRange?.[1] ? new Date(filters.registrationDateRange[1]).getTime() : ''], () => {
      if (!isApplyingSummaryFilter) {
        activeSummaryCard.value = '';
      }
      currentPage.value = 1;
    }, {
      flush: 'sync'
    });
    const filteredMembers = computed(() => {
      return members.value.filter(m => {
        const matchKeyword = !filters.keyword || m.account.toLowerCase().includes(filters.keyword.toLowerCase()) || m.name.includes(filters.keyword) || m.phone.includes(filters.keyword) || m.email.toLowerCase().includes(filters.keyword.toLowerCase()) || m.idNumber.includes(filters.keyword);
        const matchQualification = !filters.corporateQualification || filters.corporateQualification === 'personal_only' && !m.corporate || filters.corporateQualification === 'corporate_qualified' && !!m.corporate;
        const matchPlan = !filters.planId || m.membership.planId === filters.planId;
        const displayStatus = m.reviewStatus === 'pending' || m.reviewStatus === 'rejected' ? m.reviewStatus : m.status;
        const matchStatus = !filters.status || displayStatus === filters.status;
        const matchReviewStatus = !filters.reviewStatus || m.reviewStatus === filters.reviewStatus;
        const matchRegistrationChannel = !filters.registrationChannel || m.registrationChannel === filters.registrationChannel;
        const matchVehicleType = !filters.vehicleType || m.availableVehicleTypes.includes(filters.vehicleType);
        const registrationTimestamp = parseDateTime(m.createTime)?.getTime();
        const registrationStart = filters.registrationDateRange?.[0] ? new Date(filters.registrationDateRange[0]).setHours(0, 0, 0, 0) : null;
        const registrationEnd = filters.registrationDateRange?.[1] ? new Date(filters.registrationDateRange[1]).setHours(23, 59, 59, 999) : null;
        const matchRegistrationDate = registrationStart === null || registrationEnd === null || Number.isFinite(registrationTimestamp) && registrationTimestamp >= registrationStart && registrationTimestamp <= registrationEnd;
        return matchKeyword && matchQualification && matchPlan && matchStatus && matchReviewStatus && matchRegistrationChannel && matchVehicleType && matchRegistrationDate;
      });
    });
    const paginatedMembers = computed(() => {
      const start = (currentPage.value - 1) * pageSize.value;
      return filteredMembers.value.slice(start, start + pageSize.value);
    });
    const clearMemberFilters = () => {
      filters.keyword = '';
      filters.corporateQualification = '';
      filters.planId = '';
      filters.status = '';
      filters.reviewStatus = '';
      filters.registrationChannel = '';
      filters.vehicleType = '';
      filters.registrationDateRange = [];
    };
    const applySummaryFilter = type => {
      isApplyingSummaryFilter = true;
      if (activeSummaryCard.value === type) {
        clearMemberFilters();
        activeSummaryCard.value = '';
        currentPage.value = 1;
        isApplyingSummaryFilter = false;
        return;
      }
      clearMemberFilters();
      if (type === 'corporate') {
        filters.corporateQualification = 'corporate_qualified';
      }
      if (type === 'suspended') {
        filters.status = 'suspended';
      }
      if (type === 'active') {
        filters.status = 'active';
      }
      activeSummaryCard.value = type;
      currentPage.value = 1;
      isApplyingSummaryFilter = false;
    };
    const resetFilters = () => {
      isApplyingSummaryFilter = true;
      clearMemberFilters();
      activeSummaryCard.value = '';
      currentPage.value = 1;
      isApplyingSummaryFilter = false;
    };
    const getMembershipColor = planId => {
      const colors = {
        'MP001': 'info',
        'MP002': '',
        'MP003': 'warning',
        'MP004': 'danger'
      };
      return colors[planId] || 'info';
    };
    const dialogVisible = ref(false);
    const isEdit = ref(false);
    const licenseTypeDialogVisible = ref(false);
    const newLicenseType = ref('');
    const memberForm = reactive({
      id: '',
      account: '',
      password: '',
      surname: '',
      firstName: '',
      gender: 'male',
      dob: '',
      phone: '',
      email: '',
      idNumber: '',
      householdAddress: '',
      mailingAddress: '',
      emergencyContact: {
        name: '',
        relationship: '',
        phone: ''
      },
      driverLicense: {
        type: '',
        issuePlace: '',
        number: '',
        expiryDate: ''
      },
      availableVehicleTypes: ['microElectric'],
      planId: 'MP001',
      expireDate: '',
      autoRenew: false,
      companyId: ''
    });
    watch(() => memberForm.phone, newPhone => {
      if (!isEdit.value && newPhone) {
        memberForm.account = newPhone;
      }
    });
    const openCreateDialog = () => {
      isEdit.value = false;
      Object.assign(memberForm, {
        id: 'U' + Date.now(),
        account: '',
        password: '',
        surname: '',
        firstName: '',
        gender: 'male',
        dob: '',
        phone: '',
        email: '',
        idNumber: '',
        householdAddress: '',
        mailingAddress: '',
        emergencyContact: {
          name: '',
          relationship: '',
          phone: ''
        },
        driverLicense: {
          type: '',
          issuePlace: '',
          number: '',
          expiryDate: ''
        },
        availableVehicleTypes: ['microElectric'],
        planId: 'MP001',
        expireDate: '',
        autoRenew: false,
        companyId: ''
      });
      currentStep.value = 0;
      dialogVisible.value = true;
    };
    const openEditDialog = member => {
      isEdit.value = true;
      Object.assign(memberForm, {
        id: member.id,
        account: member.account,
        password: '',
        surname: member.surname || member.name.charAt(0),
        firstName: member.firstName || member.name.slice(1),
        gender: member.gender || 'male',
        dob: member.dob || '',
        phone: member.phone,
        email: member.email,
        idNumber: member.idNumber,
        householdAddress: member.householdAddress || '',
        mailingAddress: member.mailingAddress || '',
        emergencyContact: {
          ...member.emergencyContact
        },
        driverLicense: {
          ...member.driverLicense
        },
        availableVehicleTypes: Array.isArray(member.availableVehicleTypes) ? [...member.availableVehicleTypes] : inferAvailableVehicleTypes(member.driverLicense),
        planId: member.membership.planId,
        expireDate: member.membership.expireDate,
        autoRenew: member.membership.autoRenew,
        companyId: member.corporate?.companyId || ''
      });
      currentStep.value = 0;
      dialogVisible.value = true;
    };
    const openDetailDialog = member => {
      window.location.href = `member_detail.html?id=${member.id}`;
    };
    const saveMember = () => {
      if (!memberForm.account || !memberForm.surname || !memberForm.firstName || !memberForm.phone || !memberForm.idNumber) {
        feedback.ElMessage.warning('請填寫必填項 (賬號、姓名、手機、身份證)');
        return;
      }
      if (!isEdit.value && !memberForm.password) {
        feedback.ElMessage.warning('新增用戶請設置密碼');
        return;
      }
      const plan = membershipPlans.value.find(p => p.id === memberForm.planId);
      const fullName = memberForm.surname + memberForm.firstName;
      const memberData = {
        id: memberForm.id,
        accountType: 'personal',
        account: memberForm.account,
        name: fullName,
        surname: memberForm.surname,
        firstName: memberForm.firstName,
        gender: memberForm.gender,
        dob: memberForm.dob,
        phone: memberForm.phone,
        email: memberForm.email,
        idNumber: memberForm.idNumber,
        householdAddress: memberForm.householdAddress,
        mailingAddress: memberForm.mailingAddress,
        emergencyContact: {
          ...memberForm.emergencyContact
        },
        driverLicense: {
          ...memberForm.driverLicense
        },
        availableVehicleTypes: [...memberForm.availableVehicleTypes],
        membership: {
          planId: memberForm.planId,
          planName: plan?.name || '普通會員',
          expireDate: memberForm.expireDate,
          autoRenew: memberForm.autoRenew
        },
        corporate: null,
        status: 'active',
        createTime: new Date().toISOString().slice(0, 16).replace('T', ' '),
        lastLoginTime: '',
        orderHistory: []
      };
      if (isEdit.value) {
        const idx = members.value.findIndex(m => m.id === memberForm.id);
        if (idx !== -1) {
          memberData.status = members.value[idx].status;
          memberData.createTime = members.value[idx].createTime;
          memberData.lastLoginTime = members.value[idx].lastLoginTime;
          memberData.orderHistory = members.value[idx].orderHistory;
          memberData.corporate = members.value[idx].corporate;
          memberData.accountType = 'personal';
          members.value[idx] = memberData;
        }
      } else {
        members.value.unshift(memberData);
      }
      dialogVisible.value = false;
      feedback.ElMessage.success('保存成功');
    };
    const openLicenseTypeDialog = () => {
      licenseTypeDialogVisible.value = true;
    };
    const addLicenseType = () => {
      if (!newLicenseType.value) return;
      licenseTypes.value.push({
        id: 'LT' + Date.now(),
        name: newLicenseType.value
      });
      newLicenseType.value = '';
    };
    const deleteLicenseType = index => {
      licenseTypes.value.splice(index, 1);
    };
    const planDrawerVisible = ref(false);
    const changePlanDialogVisible = ref(false);
    const renewalDialogVisible = ref(false);
    const currentMember = ref(null);
    const planHistory = ref([]);
    const changePlanForm = reactive({
      planId: '',
      pricingCycle: 'monthly',
      effectiveType: 'immediate',
      reason: ''
    });
    const renewalForm = reactive({
      cycle: '1_month',
      paymentMethod: 'cash',
      note: ''
    });
    const selectedPlan = computed(() => {
      return membershipPlans.value.find(p => p.id === changePlanForm.planId);
    });
    const getPlanTier = planId => {
      const map = {
        'MP001': 1,
        'MP002': 2,
        'MP003': 3,
        'MP004': 4
      };
      return map[planId] || 1;
    };
    const getPlanBenefits = planId => {
      const map = {
        'MP001': ['基礎租車', '積分累積'],
        'MP002': ['積分1.5倍', '專屬客服', '生日禮'],
        'MP003': ['積分2倍', '免費升級車型', 'VIP休息室'],
        'MP004': ['積分3倍', '優先預訂', '機場接送', '管家服務']
      };
      return map[planId] || ['基礎服務'];
    };
    const handleCommand = (command, row) => {
      if (command === 'managePlan') {
        currentMember.value = row;
        planHistory.value = [{
          content: '自動續費成功 (月繳)',
          timestamp: '2026-01-15',
          type: 'success',
          operator: '系統'
        }, {
          content: '升級爲銀牌會員',
          timestamp: '2025-12-15',
          type: 'primary',
          operator: '管理員'
        }, {
          content: '註冊成爲普通會員',
          timestamp: '2025-11-01',
          operator: '用戶'
        }];
        planDrawerVisible.value = true;
      } else if (command === 'suspend') {
        feedback.ElMessageBox.confirm(`確定要停權會員 "${row.name}" 嗎？停權後該用戶將無法下單。`, '停權操作', {
          type: 'warning'
        }).then(() => {
          row.status = 'suspended';
          feedback.ElMessage.warning('賬號已停權');
        });
      } else if (command === 'archive') {
        feedback.ElMessageBox.confirm(`確定要封存會員 "${row.name}" 嗎？`, '封存操作', {
          type: 'info'
        }).then(() => {
          row.status = 'archived';
          feedback.ElMessage.info('賬號已封存');
        });
      } else if (command === 'blacklist') {
        feedback.ElMessageBox.prompt('請輸入加入黑名單的原因', '加入黑名單', {
          confirmButtonText: '確定',
          cancelButtonText: '取消',
          inputPattern: /.+/,
          inputErrorMessage: '原因不能爲空'
        }).then(({
          value
        }) => {
          row.status = 'blacklisted';
          feedback.ElMessage.error(`賬號已加入黑名單: ${value}`);
        });
      } else if (command === 'activate') {
        feedback.ElMessageBox.confirm(`確定要恢復會員 "${row.name}" 爲正常狀態嗎？`, '恢復操作', {
          type: 'success'
        }).then(() => {
          row.status = 'active';
          feedback.ElMessage.success('賬號已恢復正常');
        });
      }
    };
    const openChangePlanDialog = () => {
      changePlanForm.planId = '';
      changePlanForm.pricingCycle = 'monthly';
      changePlanForm.effectiveType = 'immediate';
      changePlanForm.reason = '';
      changePlanDialogVisible.value = true;
    };
    const confirmChangePlan = () => {
      if (!changePlanForm.planId) {
        feedback.ElMessage.warning('請選擇目標方案');
        return;
      }
      const newPlan = membershipPlans.value.find(p => p.id === changePlanForm.planId);
      currentMember.value.membership.planId = newPlan.id;
      currentMember.value.membership.planName = newPlan.name;
      planHistory.value.unshift({
        content: `變更爲 ${newPlan.name}`,
        timestamp: new Date().toISOString().split('T')[0],
        type: 'warning',
        operator: '管理員'
      });
      feedback.ElMessage.success('會員方案變更成功');
      changePlanDialogVisible.value = false;
    };
    const handleTerminatePlan = () => {
      feedback.ElMessageBox.confirm('確定要解約當前方案嗎？解約後將降級爲免費普通會員。', '警告', {
        type: 'error'
      }).then(() => {
        currentMember.value.membership.planId = 'MP001';
        currentMember.value.membership.planName = '普通會員';
        currentMember.value.membership.expireDate = null;
        currentMember.value.membership.autoRenew = false;
        planHistory.value.unshift({
          content: `解約當前方案，降級爲普通會員`,
          timestamp: new Date().toISOString().split('T')[0],
          type: 'danger',
          operator: '管理員'
        });
        feedback.ElMessage.success('已解約，恢復爲普通會員');
      });
    };
    const openRenewalDialog = () => {
      renewalForm.cycle = '1_month';
      renewalForm.note = '';
      renewalDialogVisible.value = true;
    };
    const confirmRenewal = () => {
      currentMember.value.membership.expireDate = '2026-02-15';
      planHistory.value.unshift({
        content: `手動續約成功`,
        timestamp: new Date().toISOString().split('T')[0],
        type: 'success',
        operator: '管理員'
      });
      feedback.ElMessage.success('續約成功');
      renewalDialogVisible.value = false;
    };
    const exportData = () => {
      feedback.ElMessage.info('導出功能開發中');
    };
    return {
      members,
      membershipPlans,
      corporateList,
      licenseTypes,
      vehicleTypeOptions,
      formSteps,
      currentStep,
      photoFields,
      filters,
      currentPage,
      pageSize,
      activeSummaryCard,
      showMoreFilters,
      filterToolbar,
      filterLayoutTier,
      filteredMembers,
      paginatedMembers,
      summaryStats,
      resetFilters,
      applySummaryFilter,
      getMembershipColor,
      dialogVisible,
      isEdit,
      memberForm,
      licenseTypeDialogVisible,
      newLicenseType,
      openLicenseTypeDialog,
      addLicenseType,
      deleteLicenseType,
      planDrawerVisible,
      changePlanDialogVisible,
      renewalDialogVisible,
      currentMember,
      planHistory,
      changePlanForm,
      renewalForm,
      selectedPlan,
      getPlanTier,
      getPlanBenefits,
      openChangePlanDialog,
      confirmChangePlan,
      handleTerminatePlan,
      openRenewalDialog,
      confirmRenewal,
      openCreateDialog,
      openEditDialog,
      openDetailDialog,
      saveMember,
      handleCommand,
      exportData,
      Delete: rimoIcons.Delete,
      Picture: rimoIcons.Picture,
      Medal: rimoIcons.Medal,
      Warning: rimoIcons.Warning,
      Star: rimoIcons.Star,
      Clock: rimoIcons.Clock,
      Money: rimoIcons.Money,
      Plus: rimoIcons.Plus,
      ElMessage: feedback.ElMessage,
      ElMessageBox: feedback.ElMessageBox,
      inferAvailableVehicleTypes,
      defaultMembers,
      storedMembersRaw,
      initialMembers,
      isApplyingSummaryFilter,
      filterResizeObserver,
      updateFilterLayout,
      parseDateTime,
      clearMemberFilters
    };
  }
  return pageSetup();
}
export default function MembersBlock() {
  const model = useRimoModel(createPageState);
  const view = model.view;
  const {
    text
  } = useRimoEnvironment();
  return <RimoRoot model={model} pageKey="members" assets={{}}><div data-business-content="" data-rimo-layout="page"><div className="flex justify-between items-end mb-6" data-rimo-layout="heading"><div><h1 className="text-2xl font-bold text-gray-800 tracking-tight">{text("個人會員管理")}</h1>
<p className="text-gray-500 text-sm mt-1">{text("管理所有會員用戶信息，支持篩選、導出及狀態變更。")}</p></div>
<div className="flex gap-3"><RimoElement kind="el-button" type="primary" size="large" className="shadow-md shadow-[color:var(--app-color-primary-shadow)]" onClick={event => {
            view.openCreateDialog?.(event);
          }}><RimoElement kind="el-icon" className="mr-1"><RimoIcon name="Plus" /></RimoElement>
{text(" 新增會員\n                        ")}</RimoElement></div></div>
<div className="grid grid-cols-4 gap-4 mb-6" data-rimo-layout="summary"><div className={rimoClass(["bg-white rounded-xl p-4 border shadow-sm cursor-pointer hover:border-[color:var(--app-color-primary)] transition-colors", rimoClass(view.activeSummaryCard === 'total' ? 'border-[color:var(--app-color-primary)] ring-1 ring-[color:var(--app-color-primary)]' : 'border-gray-100')])} role="button" tabIndex="0" aria-pressed={view.activeSummaryCard === 'total'} onClick={_event => {
          view.applySummaryFilter('total');
        }} onKeyDown={event => {
          event.preventDefault();
          if (event.key !== 'Enter') return;
          view.applySummaryFilter('total');
        }} data-rimo-layout="stat"><div className="text-gray-500 text-xs font-medium mb-1">{text("會員總數")}</div>
<div className="text-2xl font-bold text-gray-800">{rimoText(view.summaryStats.total)}</div></div>
<div className={rimoClass(["bg-white rounded-xl p-4 border shadow-sm cursor-pointer hover:border-[color:var(--app-color-primary)] transition-colors", rimoClass(view.activeSummaryCard === 'corporate' ? 'border-[color:var(--app-color-primary)] ring-1 ring-[color:var(--app-color-primary)]' : 'border-gray-100')])} role="button" tabIndex="0" aria-pressed={view.activeSummaryCard === 'corporate'} onClick={_event => {
          view.applySummaryFilter('corporate');
        }} onKeyDown={event => {
          event.preventDefault();
          if (event.key !== 'Enter') return;
          view.applySummaryFilter('corporate');
        }} data-rimo-layout="stat"><div className="text-gray-500 text-xs font-medium mb-1">{text("企業身份會員")}</div>
<div className="text-2xl font-bold text-blue-600">{rimoText(view.summaryStats.corporate)}</div></div>
<div className={rimoClass(["bg-white rounded-xl p-4 border shadow-sm cursor-pointer hover:border-[color:var(--app-color-primary)] transition-colors", rimoClass(view.activeSummaryCard === 'suspended' ? 'border-[color:var(--app-color-primary)] ring-1 ring-[color:var(--app-color-primary)]' : 'border-gray-100')])} role="button" tabIndex="0" aria-pressed={view.activeSummaryCard === 'suspended'} onClick={_event => {
          view.applySummaryFilter('suspended');
        }} onKeyDown={event => {
          event.preventDefault();
          if (event.key !== 'Enter') return;
          view.applySummaryFilter('suspended');
        }} data-rimo-layout="stat"><div className="text-gray-500 text-xs font-medium mb-1">{text("停權會員")}</div>
<div className="text-2xl font-bold text-orange-500">{rimoText(view.summaryStats.suspended)}</div></div>
<div className={rimoClass(["bg-white rounded-xl p-4 border shadow-sm cursor-pointer hover:border-[color:var(--app-color-primary)] transition-colors", rimoClass(view.activeSummaryCard === 'active' ? 'border-[color:var(--app-color-primary)] ring-1 ring-[color:var(--app-color-primary)]' : 'border-gray-100')])} role="button" tabIndex="0" aria-pressed={view.activeSummaryCard === 'active'} onClick={_event => {
          view.applySummaryFilter('active');
        }} onKeyDown={event => {
          event.preventDefault();
          if (event.key !== 'Enter') return;
          view.applySummaryFilter('active');
        }} data-rimo-layout="stat"><div className="text-gray-500 text-xs font-medium mb-1">{text("正常會員")}</div>
<div className="text-2xl font-bold text-green-600">{rimoText(view.summaryStats.active)}</div></div></div>
<div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden" data-rimo-layout="list"><RimoElement kind="el-table" data={view.paginatedMembers} stripe={true} style={rimoStyle("width: 100%")} headerCellStyle={{
          backgroundColor: 'var(--app-color-surface-subtle)',
          color: 'var(--app-color-text-secondary)',
          fontWeight: 'bold'
        }} slots={{
          "toolbar": _slot => <><div ref={model.ref("filterToolbar")} className="member-filter-toolbar p-4 flex justify-between items-center gap-4"><div className="member-filter-controls flex gap-3 items-center flex-1"><RimoElement kind="el-input" modelValue={view.filters.keyword} onModelChange={value => {
                  model.write(["filters", "keyword"], value);
                }} placeholder="搜索賬號/姓名/手機號/Email/身份證" clearable={true} style={rimoStyle("width: 280px")} prefixIcon="Search"></RimoElement>
{view.filterLayoutTier >= 2 ? <><RimoElement kind="el-select" modelValue={view.filters.corporateQualification} onModelChange={value => {
                    model.write(["filters", "corporateQualification"], value);
                  }} placeholder="企業資格" clearable={true} style={rimoStyle("width: 140px")}><RimoElement kind="el-option" label="未加入企業" value="personal_only"></RimoElement>
<RimoElement kind="el-option" label="已加入企業" value="corporate_qualified"></RimoElement></RimoElement></> : null}
{view.filterLayoutTier >= 3 ? <><RimoElement kind="el-select" modelValue={view.filters.planId} onModelChange={value => {
                    model.write(["filters", "planId"], value);
                  }} placeholder="會員方案" clearable={true} style={rimoStyle("width: 140px")}>{rimoEntries(view.membershipPlans).map(([plan], _itemIndex) => <Fragment key={plan.id}><RimoElement kind="el-option" key={plan.id} label={plan.name} value={plan.id}></RimoElement></Fragment>)}</RimoElement></> : null}
<RimoElement kind="el-select" modelValue={view.filters.status} onModelChange={value => {
                  model.write(["filters", "status"], value);
                }} placeholder="賬號狀態" clearable={true} style={rimoStyle("width: 120px")}><RimoElement kind="el-option" label="正常" value="active"></RimoElement>
<RimoElement kind="el-option" label="停權" value="suspended"></RimoElement>
<RimoElement kind="el-option" label="黑名單" value="blacklisted"></RimoElement>
<RimoElement kind="el-option" label="封存" value="archived"></RimoElement></RimoElement>
{view.filterLayoutTier >= 4 ? <><RimoElement kind="el-select" modelValue={view.filters.reviewStatus} onModelChange={value => {
                    model.write(["filters", "reviewStatus"], value);
                  }} placeholder="審覈狀態" clearable={true} style={rimoStyle("width: 120px")}><RimoElement kind="el-option" label="待審覈" value="pending"></RimoElement>
<RimoElement kind="el-option" label="已通過" value="approved"></RimoElement>
<RimoElement kind="el-option" label="已駁回" value="rejected"></RimoElement></RimoElement></> : null}
{view.filterLayoutTier >= 5 ? <><RimoElement kind="el-select" modelValue={view.filters.registrationChannel} onModelChange={value => {
                    model.write(["filters", "registrationChannel"], value);
                  }} placeholder="註冊渠道" clearable={true} style={rimoStyle("width: 130px")}><RimoElement kind="el-option" label="官網" value="official_web"></RimoElement>
<RimoElement kind="el-option" label="iOS APP" value="ios"></RimoElement>
<RimoElement kind="el-option" label="Android APP" value="android"></RimoElement></RimoElement></> : null}
{view.filterLayoutTier >= 6 ? <><RimoElement kind="el-select" modelValue={view.filters.vehicleType} onModelChange={value => {
                    model.write(["filters", "vehicleType"], value);
                  }} placeholder="可用載具類型" clearable={true} style={rimoStyle("width: 150px")}>{rimoEntries(view.vehicleTypeOptions).map(([type], _itemIndex) => <Fragment key={type.value}><RimoElement kind="el-option" key={type.value} label={type.label} value={type.value}></RimoElement></Fragment>)}</RimoElement></> : null}
<RimoElement kind="el-button" type="primary" icon="Filter" plain={true} onClick={_event => {
                  model.write(["showMoreFilters"], !view.showMoreFilters);
                }}>{text("\n                                    ")}{rimoText(view.showMoreFilters ? '收起篩選' : '更多篩選')}{text("\n                                ")}</RimoElement>
<RimoElement kind="el-tooltip" content="重置篩選" placement="top"><RimoElement kind="el-button" circle={true} onClick={event => {
                    view.resetFilters?.(event);
                  }}><RimoElement kind="el-icon"><RimoIcon name="Refresh" /></RimoElement></RimoElement></RimoElement>
<RimoElement kind="el-button" type="primary" plain={true} icon="Download" onClick={event => {
                  view.exportData?.(event);
                }}>{text("導出")}</RimoElement></div>
<div className="text-sm text-gray-500 whitespace-nowrap">{text("共 ")}{rimoText(view.filteredMembers.length)}{text(" 位會員")}</div></div>
<div hidden={!view.showMoreFilters} className="px-4 pb-4 flex gap-3 items-center flex-wrap">{view.filterLayoutTier < 2 ? <><RimoElement kind="el-select" modelValue={view.filters.corporateQualification} onModelChange={value => {
                  model.write(["filters", "corporateQualification"], value);
                }} placeholder="企業資格" clearable={true} style={rimoStyle("width: 140px")}><RimoElement kind="el-option" label="未加入企業" value="personal_only"></RimoElement>
<RimoElement kind="el-option" label="已加入企業" value="corporate_qualified"></RimoElement></RimoElement></> : null}
{view.filterLayoutTier < 3 ? <><RimoElement kind="el-select" modelValue={view.filters.planId} onModelChange={value => {
                  model.write(["filters", "planId"], value);
                }} placeholder="會員方案" clearable={true} style={rimoStyle("width: 140px")}>{rimoEntries(view.membershipPlans).map(([plan], _itemIndex) => <Fragment key={plan.id}><RimoElement kind="el-option" key={plan.id} label={plan.name} value={plan.id}></RimoElement></Fragment>)}</RimoElement></> : null}
{view.filterLayoutTier < 4 ? <><RimoElement kind="el-select" modelValue={view.filters.reviewStatus} onModelChange={value => {
                  model.write(["filters", "reviewStatus"], value);
                }} placeholder="審覈狀態" clearable={true} style={rimoStyle("width: 120px")}><RimoElement kind="el-option" label="待審覈" value="pending"></RimoElement>
<RimoElement kind="el-option" label="已通過" value="approved"></RimoElement>
<RimoElement kind="el-option" label="已駁回" value="rejected"></RimoElement></RimoElement></> : null}
{view.filterLayoutTier < 5 ? <><RimoElement kind="el-select" modelValue={view.filters.registrationChannel} onModelChange={value => {
                  model.write(["filters", "registrationChannel"], value);
                }} placeholder="註冊渠道" clearable={true} style={rimoStyle("width: 130px")}><RimoElement kind="el-option" label="官網" value="official_web"></RimoElement>
<RimoElement kind="el-option" label="iOS APP" value="ios"></RimoElement>
<RimoElement kind="el-option" label="Android APP" value="android"></RimoElement></RimoElement></> : null}
{view.filterLayoutTier < 6 ? <><RimoElement kind="el-select" modelValue={view.filters.vehicleType} onModelChange={value => {
                  model.write(["filters", "vehicleType"], value);
                }} placeholder="可用載具類型" clearable={true} style={rimoStyle("width: 150px")}>{rimoEntries(view.vehicleTypeOptions).map(([type], _itemIndex) => <Fragment key={type.value}><RimoElement kind="el-option" key={type.value} label={type.label} value={type.value}></RimoElement></Fragment>)}</RimoElement></> : null}
<RimoElement kind="el-date-picker" modelValue={view.filters.registrationDateRange} onModelChange={value => {
                model.write(["filters", "registrationDateRange"], value);
              }} type="daterange" rangeSeparator="-" startPlaceholder="註冊起始" endPlaceholder="註冊結束" className="member-registration-range"></RimoElement></div></>
        }}><RimoElement kind="el-table-column" prop="id" label="用戶ID" width="100" slots={{
            "default": ({
              row
            }) => <><span className="font-mono text-xs text-gray-500">{rimoText(row.id)}</span></>
          }}></RimoElement>
<RimoElement kind="el-table-column" label="賬號" minWidth="150" slots={{
            "default": ({
              row
            }) => <><div className="flex items-center"><RimoElement kind="el-avatar" size={32} className="mr-3 border bg-blue-100 text-blue-600 border-blue-200">{text("\n                                        ")}{rimoText(row.name.charAt(0))}{text("\n                                    ")}</RimoElement>
<div><div className="font-medium text-gray-900">{rimoText(row.account)}</div>
<div className="mt-1 flex flex-wrap gap-1"><RimoElement kind="el-tag" type="info" size="small" effect="plain">{text("個人")}</RimoElement>
{row.corporate ? <><RimoElement kind="el-tag" type="warning" size="small" effect="plain">{text("企業資格")}</RimoElement></> : null}</div></div></div></>
          }}></RimoElement>
<RimoElement kind="el-table-column" prop="name" label="姓名" width="100"></RimoElement>
<RimoElement kind="el-table-column" label="聯繫方式" minWidth="180" slots={{
            "default": ({
              row
            }) => <><div className="text-sm text-gray-900">{rimoText(row.phone)}</div>
<div className="text-xs text-gray-400">{rimoText(row.email)}</div></>
          }}></RimoElement>
<RimoElement kind="el-table-column" label="身份證號" width="140" slots={{
            "default": ({
              row
            }) => <><span className="font-mono text-sm text-gray-600">{rimoText(row.idNumber)}</span></>
          }}></RimoElement>
<RimoElement kind="el-table-column" label="會員方案" minWidth="160" slots={{
            "default": ({
              row
            }) => <><div className="flex items-center"><RimoElement kind="el-tag" type={view.getMembershipColor(row.membership.planId)} size="small" className="mr-2">{text("\n                                        ")}{rimoText(row.membership.planName)}{text("\n                                    ")}</RimoElement>
{row.membership.autoRenew ? <><RimoElement kind="el-icon" className="text-green-500" title="自動續費"><RimoIcon name="RefreshRight" /></RimoElement></> : null}</div>
<div className="text-xs text-gray-400 mt-1">{text("\n                                    到期: ")}{rimoText(row.membership.expireDate || '永久')}{text("\n                                ")}</div></>
          }}></RimoElement>
<RimoElement kind="el-table-column" label="企業資格" width="180" slots={{
            "default": ({
              row
            }) => <>{row.corporate ? <><div><div className="text-sm text-gray-900">{rimoText(row.corporate.companyName)}</div>
<div className="text-xs text-orange-500 mt-1">{text("已加入企業")}</div></div></> : <><span className="text-gray-400">{text("未加入企業")}</span></>}</>
          }}></RimoElement>
<RimoElement kind="el-table-column" label="狀態" width="100" slots={{
            "default": ({
              row
            }) => <>{row.reviewStatus === 'pending' ? <><RimoElement kind="el-tag" type="warning" size="small" effect="dark">{text("待審覈")}</RimoElement></> : row.reviewStatus === 'rejected' ? <><RimoElement kind="el-tag" type="danger" size="small" effect="dark">{text("已拒絕")}</RimoElement></> : <><>{row.status === 'active' ? <><RimoElement kind="el-tag" type="success" size="small" effect="light">{text("正常")}</RimoElement></> : row.status === 'suspended' ? <><RimoElement kind="el-tag" type="warning" size="small" effect="light">{text("停權")}</RimoElement></> : row.status === 'blacklisted' ? <><RimoElement kind="el-tag" type="danger" size="small" effect="dark">{text("黑名單")}</RimoElement></> : row.status === 'archived' ? <><RimoElement kind="el-tag" type="info" size="small" effect="plain">{text("封存")}</RimoElement></> : null}</></>}</>
          }}></RimoElement>
<RimoElement kind="el-table-column" label="操作" width="160" align="right" fixed="right" slots={{
            "default": ({
              row
            }) => <><div className="flex justify-end gap-2"><RimoElement kind="el-button" type="primary" link={true} size="small" onClick={_event => {
                  view.openDetailDialog(row);
                }}>{text("詳情")}</RimoElement>
{row.status !== 'archived' ? <><RimoElement kind="el-button" type="primary" link={true} size="small" onClick={_event => {
                    view.openEditDialog(row);
                  }}>{text("編輯")}</RimoElement></> : null}
{row.status !== 'archived' ? <><RimoElement kind="el-dropdown" trigger="click" onCommand={event => {
                    (cmd => view.handleCommand(cmd, row))?.(event);
                  }} slots={{
                    "dropdown": _slot => <><RimoElement kind="el-dropdown-menu">{row.status === 'active' ? <><><RimoElement kind="el-dropdown-item" command="suspend">{text("停權")}</RimoElement>
<RimoElement kind="el-dropdown-item" command="archive">{text("封存")}</RimoElement>
<RimoElement kind="el-dropdown-item" command="blacklist" divided={true}><span className="text-red-500">{text("加入黑名單")}</span></RimoElement></></> : null}
{row.status === 'suspended' ? <><><RimoElement kind="el-dropdown-item" command="activate">{text("恢復正常")}</RimoElement>
<RimoElement kind="el-dropdown-item" command="archive">{text("封存")}</RimoElement>
<RimoElement kind="el-dropdown-item" command="blacklist" divided={true}><span className="text-red-500">{text("加入黑名單")}</span></RimoElement></></> : null}
{row.status === 'archived' ? <><><RimoElement kind="el-dropdown-item" command="activate">{text("恢復正常")}</RimoElement></></> : null}
{row.status === 'blacklisted' ? <><><RimoElement kind="el-dropdown-item" command="activate">{text("移出黑名單")}</RimoElement></></> : null}
<RimoElement kind="el-dropdown-item" command="managePlan" divided={true} disabled={row.status === 'archived'}><span className="text-blue-600">{text("方案管理")}</span></RimoElement></RimoElement></>
                  }}><RimoElement kind="el-button" type="info" link={true} size="small">{text("\n                                            更多")}
<RimoElement kind="el-icon" className="el-icon--right"><RimoIcon name="arrow-down" /></RimoElement></RimoElement></RimoElement></> : null}</div></>
          }}></RimoElement></RimoElement>
<div className="p-4 border-t border-gray-100 flex justify-end bg-gray-50"><RimoElement kind="el-pagination" currentPage={view.currentPage} onCurrentPageChange={value => {
            model.write(["currentPage"], value);
          }} pageSize={view.pageSize} onPageSizeChange={value => {
            model.write(["pageSize"], value);
          }} pageSizes={[10, 20, 50, 100]} total={view.filteredMembers.length} background={true} layout="total, sizes, prev, pager, next, jumper"></RimoElement></div></div></div><RimoElement kind="el-dialog" modelValue={view.dialogVisible} onModelChange={value => {
      model.write(["dialogVisible"], value);
    }} title={view.isEdit ? '編輯會員' : '新增會員'} width="900px" top="3vh" destroyOnClose={true} className="member-dialog members-overlay" slots={{
      "footer": _slot => <><div className="flex justify-end gap-3"><RimoElement kind="el-button" onClick={_event => {
            model.write(["dialogVisible"], false);
          }}>{text("取消")}</RimoElement>
<RimoElement kind="el-button" type="primary" onClick={event => {
            view.saveMember?.(event);
          }}><RimoElement kind="el-icon" className="mr-1"><RimoIcon name="Check" /></RimoElement>
{text("保存\n                    ")}</RimoElement></div></>
    }}>{() => <><RimoElement kind="el-form" model={view.memberForm} labelPosition="top" className="custom-scroll max-h-[70vh] overflow-y-auto px-2"><div className="mb-5"><div className="text-sm font-bold text-gray-700 mb-3 flex items-center"><RimoElement kind="el-icon" className="mr-2 text-white"><RimoIcon name="UserFilled" /></RimoElement>
{text("\n                        基本資料\n                    ")}</div>
<div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm"><RimoElement kind="el-row" gutter={16}><RimoElement kind="el-col" span={6}><RimoElement kind="el-form-item" label="姓" required={true}><RimoElement kind="el-input" modelValue={view.memberForm.surname} onModelChange={value => {
                      model.write(["memberForm", "surname"], value);
                    }} placeholder="張"></RimoElement></RimoElement></RimoElement>
<RimoElement kind="el-col" span={6}><RimoElement kind="el-form-item" label="名" required={true}><RimoElement kind="el-input" modelValue={view.memberForm.firstName} onModelChange={value => {
                      model.write(["memberForm", "firstName"], value);
                    }} placeholder="三"></RimoElement></RimoElement></RimoElement>
<RimoElement kind="el-col" span={6}><RimoElement kind="el-form-item" label="性別"><RimoElement kind="el-select" modelValue={view.memberForm.gender} onModelChange={value => {
                      model.write(["memberForm", "gender"], value);
                    }} className="w-full"><RimoElement kind="el-option" label="男" value="male"></RimoElement>
<RimoElement kind="el-option" label="女" value="female"></RimoElement></RimoElement></RimoElement></RimoElement>
<RimoElement kind="el-col" span={6}><RimoElement kind="el-form-item" label="出生日期"><RimoElement kind="el-date-picker" modelValue={view.memberForm.dob} onModelChange={value => {
                      model.write(["memberForm", "dob"], value);
                    }} type="date" placeholder="選擇" className="w-full" valueFormat="YYYY-MM-DD"></RimoElement></RimoElement></RimoElement>
<RimoElement kind="el-col" span={8}><RimoElement kind="el-form-item" label="手機號" required={true}><RimoElement kind="el-input" modelValue={view.memberForm.phone} onModelChange={value => {
                      model.write(["memberForm", "phone"], value);
                    }} placeholder="0912-345-678" prefixIcon="Phone"></RimoElement></RimoElement></RimoElement>
<RimoElement kind="el-col" span={8}><RimoElement kind="el-form-item" label="Email"><RimoElement kind="el-input" modelValue={view.memberForm.email} onModelChange={value => {
                      model.write(["memberForm", "email"], value);
                    }} placeholder="email@example.com" prefixIcon="Message"></RimoElement></RimoElement></RimoElement>
<RimoElement kind="el-col" span={8}><RimoElement kind="el-form-item" label="身份證號" required={true}><RimoElement kind="el-input" modelValue={view.memberForm.idNumber} onModelChange={value => {
                      model.write(["memberForm", "idNumber"], value);
                    }} placeholder="A123456789" prefixIcon="Postcard"></RimoElement></RimoElement></RimoElement></RimoElement></div></div>
<div className="mb-5"><div className="text-sm font-bold text-gray-700 mb-3 flex items-center"><RimoElement kind="el-icon" className="mr-2 text-white"><RimoIcon name="Location" /></RimoElement>
{text("\n                        地址信息\n                    ")}</div>
<div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm"><RimoElement kind="el-row" gutter={16}><RimoElement kind="el-col" span={12}><RimoElement kind="el-form-item" label="戶籍地址"><RimoElement kind="el-input" modelValue={view.memberForm.householdAddress} onModelChange={value => {
                      model.write(["memberForm", "householdAddress"], value);
                    }} placeholder="輸入戶籍地址" prefixIcon="House"></RimoElement></RimoElement></RimoElement>
<RimoElement kind="el-col" span={12}><RimoElement kind="el-form-item" label="通訊地址"><RimoElement kind="el-input" modelValue={view.memberForm.mailingAddress} onModelChange={value => {
                      model.write(["memberForm", "mailingAddress"], value);
                    }} placeholder="輸入通訊地址" prefixIcon="Position"></RimoElement></RimoElement></RimoElement></RimoElement></div></div>
<div className="mb-5"><div className="text-sm font-bold text-gray-700 mb-3 flex items-center"><RimoElement kind="el-icon" className="mr-2 text-white"><RimoIcon name="PhoneFilled" /></RimoElement>
{text("\n                        緊急聯絡人\n                    ")}</div>
<div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm"><RimoElement kind="el-row" gutter={16}><RimoElement kind="el-col" span={8}><RimoElement kind="el-form-item" label="姓名"><RimoElement kind="el-input" modelValue={view.memberForm.emergencyContact.name} onModelChange={value => {
                      model.write(["memberForm", "emergencyContact", "name"], value);
                    }} placeholder="聯絡人姓名"></RimoElement></RimoElement></RimoElement>
<RimoElement kind="el-col" span={8}><RimoElement kind="el-form-item" label="關係"><RimoElement kind="el-select" modelValue={view.memberForm.emergencyContact.relationship} onModelChange={value => {
                      model.write(["memberForm", "emergencyContact", "relationship"], value);
                    }} placeholder="選擇關係" className="w-full" allowCreate={true} filterable={true}><RimoElement kind="el-option" label="配偶" value="配偶"></RimoElement>
<RimoElement kind="el-option" label="父母" value="父母"></RimoElement>
<RimoElement kind="el-option" label="子女" value="子女"></RimoElement>
<RimoElement kind="el-option" label="兄弟姐妹" value="兄弟姐妹"></RimoElement>
<RimoElement kind="el-option" label="朋友" value="朋友"></RimoElement>
<RimoElement kind="el-option" label="同事" value="同事"></RimoElement></RimoElement></RimoElement></RimoElement>
<RimoElement kind="el-col" span={8}><RimoElement kind="el-form-item" label="手機號"><RimoElement kind="el-input" modelValue={view.memberForm.emergencyContact.phone} onModelChange={value => {
                      model.write(["memberForm", "emergencyContact", "phone"], value);
                    }} placeholder="聯絡人電話" prefixIcon="Phone"></RimoElement></RimoElement></RimoElement></RimoElement></div></div>
<div className="mb-5"><div className="text-sm font-bold text-gray-700 mb-3 flex items-center justify-between"><div className="flex items-center"><RimoElement kind="el-icon" className="mr-2 text-white"><RimoIcon name="Van" /></RimoElement>
{text("\n                            駕駛執照\n                        ")}</div>
<RimoElement kind="el-button" size="small" plain={true} type="primary" onClick={event => {
                view.openLicenseTypeDialog?.(event);
              }}><RimoElement kind="el-icon" className="mr-1"><RimoIcon name="Setting" /></RimoElement>
{text("管理類型\n                        ")}</RimoElement></div>
<div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm"><RimoElement kind="el-row" gutter={16}><RimoElement kind="el-col" span={6}><RimoElement kind="el-form-item" label="駕照類型"><RimoElement kind="el-select" modelValue={view.memberForm.driverLicense.type} onModelChange={value => {
                      model.write(["memberForm", "driverLicense", "type"], value);
                    }} placeholder="選擇類型" className="w-full">{rimoEntries(view.licenseTypes).map(([type], _itemIndex) => <Fragment key={type.id}><RimoElement kind="el-option" key={type.id} label={type.name} value={type.id}></RimoElement></Fragment>)}</RimoElement></RimoElement></RimoElement>
<RimoElement kind="el-col" span={6}><RimoElement kind="el-form-item" label="簽發地"><RimoElement kind="el-input" modelValue={view.memberForm.driverLicense.issuePlace} onModelChange={value => {
                      model.write(["memberForm", "driverLicense", "issuePlace"], value);
                    }} placeholder="例如: 臺北市"></RimoElement></RimoElement></RimoElement>
<RimoElement kind="el-col" span={6}><RimoElement kind="el-form-item" label="駕照號碼"><RimoElement kind="el-input" modelValue={view.memberForm.driverLicense.number} onModelChange={value => {
                      model.write(["memberForm", "driverLicense", "number"], value);
                    }} placeholder="駕照號碼"></RimoElement></RimoElement></RimoElement>
<RimoElement kind="el-col" span={6}><RimoElement kind="el-form-item" label="到期時間"><RimoElement kind="el-date-picker" modelValue={view.memberForm.driverLicense.expiryDate} onModelChange={value => {
                      model.write(["memberForm", "driverLicense", "expiryDate"], value);
                    }} type="date" placeholder="選擇日期" className="w-full" valueFormat="YYYY-MM-DD"></RimoElement></RimoElement></RimoElement></RimoElement>
<RimoElement kind="el-row" gutter={16}><RimoElement kind="el-col" span={24}><RimoElement kind="el-form-item" label="可用載具類型"><RimoElement kind="el-checkbox-group" modelValue={view.memberForm.availableVehicleTypes} onModelChange={value => {
                      model.write(["memberForm", "availableVehicleTypes"], value);
                    }}>{rimoEntries(view.vehicleTypeOptions).map(([item], _itemIndex) => <Fragment key={item.value}><RimoElement kind="el-checkbox" key={item.value} label={item.value}>{text("\n                                            ")}{rimoText(item.label)}{text("\n                                        ")}</RimoElement></Fragment>)}</RimoElement>
<div className="text-xs text-gray-400 mt-1">{text("預約時按所選車輛載具類型校驗；微電車默認不要求駕照。")}</div></RimoElement></RimoElement></RimoElement></div></div>
<div className="mb-5"><div className="text-sm font-bold text-gray-700 mb-3 flex items-center"><RimoElement kind="el-icon" className="mr-2 text-white"><RimoIcon name="Picture" /></RimoElement>
{text("\n                        證件照片\n                    ")}</div>
<div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm"><div className="grid grid-cols-2 md:grid-cols-5 gap-3">{rimoEntries(view.photoFields).map(([photo], _itemIndex) => <Fragment key={photo.key}><div key={photo.key} className="text-center group"><div className="relative w-full aspect-[4/3] bg-gray-50 border-2 border-dashed border-gray-200 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-[color:var(--app-color-primary)] hover:bg-[color:var(--app-color-primary-light-9)] transition-all group-hover:scale-[1.02]"><RimoElement kind="el-icon" className="text-2xl text-gray-400 group-hover:text-[color:var(--app-color-primary)] mb-1"><RimoIcon name="Plus" /></RimoElement>
<span className="text-xs text-gray-400 group-hover:text-[color:var(--app-color-primary)]">{text("上傳")}</span></div>
<div className="mt-2 text-xs text-gray-500">{rimoText(photo.label)}</div></div></Fragment>)}</div></div></div>
<div className="mb-5"><div className="text-sm font-bold text-gray-700 mb-3 flex items-center"><RimoElement kind="el-icon" className="mr-2 text-[color:var(--app-color-primary)]"><RimoIcon name="Medal" /></RimoElement>
{text("\n                        會員方案\n                    ")}</div>
<div className="bg-gradient-to-br from-blue-50 to-[color:var(--app-color-primary-light-9)] p-4 rounded-xl border border-blue-100 shadow-sm"><RimoElement kind="el-row" gutter={16}><RimoElement kind="el-col" span={12}><RimoElement kind="el-form-item" label="選擇方案"><RimoElement kind="el-select" modelValue={view.memberForm.planId} onModelChange={value => {
                      model.write(["memberForm", "planId"], value);
                    }} placeholder="選擇方案" className="w-full">{rimoEntries(view.membershipPlans).map(([plan], _itemIndex) => <Fragment key={plan.id}><RimoElement kind="el-option" key={plan.id} label={plan.name} value={plan.id}></RimoElement></Fragment>)}</RimoElement></RimoElement></RimoElement>
<RimoElement kind="el-col" span={12}><RimoElement kind="el-form-item" label="自動續費"><RimoElement kind="el-switch" modelValue={view.memberForm.autoRenew} onModelChange={value => {
                      model.write(["memberForm", "autoRenew"], value);
                    }} activeText="開啓" inactiveText="關閉" style={rimoStyle("--el-switch-on-color: var(--app-color-primary)")}></RimoElement></RimoElement></RimoElement></RimoElement></div></div>
<div className="mb-5"><div className="text-sm font-bold text-gray-700 mb-3 flex items-center"><RimoElement kind="el-icon" className="mr-2 text-[color:var(--app-color-primary)]"><RimoIcon name="Key" /></RimoElement>
{text("\n                        賬號信息\n                        ")}
<span className="ml-2 text-xs text-gray-400 font-normal">{text("（默認使用手機號作爲登錄賬號）")}</span></div>
<div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm"><RimoElement kind="el-row" gutter={16}><RimoElement kind="el-col" span={12}><RimoElement kind="el-form-item" label="登錄賬號" required={true}><RimoElement kind="el-input" modelValue={view.memberForm.account} onModelChange={value => {
                      model.write(["memberForm", "account"], value);
                    }} placeholder="默認爲手機號" disabled={view.isEdit} prefixIcon="User"></RimoElement></RimoElement></RimoElement>
<RimoElement kind="el-col" span={12}>{!view.isEdit ? <><RimoElement kind="el-form-item" label="登錄密碼" required={true}><RimoElement kind="el-input" modelValue={view.memberForm.password} onModelChange={value => {
                        model.write(["memberForm", "password"], value);
                      }} type="password" placeholder="設置登錄密碼" showPassword={true} prefixIcon="Lock"></RimoElement></RimoElement></> : <><RimoElement kind="el-form-item" label="登錄密碼"><RimoElement kind="el-button" link={true} type="primary" disabled={true}>{text("如需修改請使用重置密碼功能")}</RimoElement></RimoElement></>}</RimoElement></RimoElement></div></div></RimoElement></>}</RimoElement>
<RimoElement kind="el-dialog" modelValue={view.licenseTypeDialogVisible} onModelChange={value => {
      model.write(["licenseTypeDialogVisible"], value);
    }} title="管理駕照類型" width="420px" destroyOnClose={true} className="members-overlay" slots={{
      "footer": _slot => <><RimoElement kind="el-button" onClick={_event => {
          model.write(["licenseTypeDialogVisible"], false);
        }}>{text("關閉")}</RimoElement></>
    }}>{() => <><div className="flex gap-2 mb-4"><RimoElement kind="el-input" modelValue={view.newLicenseType} onModelChange={value => {
            model.write(["newLicenseType"], value);
          }} placeholder="輸入新類型名稱" onKeyUp={event => {
            if (event.key !== 'Enter') return;
            view.addLicenseType?.(event);
          }}></RimoElement>
<RimoElement kind="el-button" type="primary" onClick={event => {
            view.addLicenseType?.(event);
          }}><RimoElement kind="el-icon" className="mr-1"><RimoIcon name="Plus" /></RimoElement>
{text("添加\n                ")}</RimoElement></div>
<div className="border rounded-lg overflow-hidden max-h-64 overflow-y-auto"><RimoElement kind="el-table" data={view.licenseTypes} showHeader={false} size="small"><RimoElement kind="el-table-column" prop="name" slots={{
              "default": ({
                row
              }) => <><div className="flex items-center"><RimoElement kind="el-icon" className="mr-2 text-gray-400"><RimoIcon name="Van" /></RimoElement>
{text("\n                                ")}{rimoText(row.name)}{text("\n                            ")}</div></>
            }}></RimoElement>
<RimoElement kind="el-table-column" width="60" align="right" slots={{
              "default": ({
                row: _row,
                $index
              }) => <><RimoElement kind="el-button" type="danger" link={true} onClick={_event => {
                  view.deleteLicenseType($index);
                }}><RimoElement kind="el-icon"><RimoIcon name="Delete" /></RimoElement></RimoElement></>
            }}></RimoElement></RimoElement></div></>}</RimoElement>
<RimoElement kind="el-dialog" modelValue={view.changePlanDialogVisible} onModelChange={value => {
      model.write(["changePlanDialogVisible"], value);
    }} title="變更會員方案" width="500px" appendToBody={true} destroyOnClose={true} className="members-overlay" slots={{
      "footer": _slot => <><RimoElement kind="el-button" onClick={_event => {
          model.write(["changePlanDialogVisible"], false);
        }}>{text("取消")}</RimoElement>
<RimoElement kind="el-button" type="primary" onClick={event => {
          view.confirmChangePlan?.(event);
        }}>{text("確認變更")}</RimoElement></>
    }}>{() => <><RimoElement kind="el-form" model={view.changePlanForm} labelPosition="top"><RimoElement kind="el-form-item" label="目標方案"><RimoElement kind="el-select" modelValue={view.changePlanForm.planId} onModelChange={value => {
              model.write(["changePlanForm", "planId"], value);
            }} className="w-full" placeholder="請選擇方案">{rimoEntries(view.membershipPlans.filter(p => p.id !== view.currentMember?.membership?.planId)).map(([plan], _itemIndex) => <Fragment key={plan.id}><RimoElement kind="el-option" key={plan.id} label={plan.name} value={plan.id}><span className="float-left">{rimoText(plan.name)}</span>
<span className="float-right text-gray-400 text-xs mt-1">{text("Lv.")}{rimoText(plan.tier || 1)}</span></RimoElement></Fragment>)}</RimoElement></RimoElement>
{view.selectedPlan?.type !== 'free' ? <><RimoElement kind="el-form-item" label="繳費週期"><RimoElement kind="el-select" modelValue={view.changePlanForm.pricingCycle} onModelChange={value => {
                model.write(["changePlanForm", "pricingCycle"], value);
              }} className="w-full"><RimoElement kind="el-option" label="月繳 (¥99)" value="monthly"></RimoElement>
<RimoElement kind="el-option" label="季繳 (¥269)" value="quarterly"></RimoElement>
<RimoElement kind="el-option" label="年繳 (¥899)" value="annual"></RimoElement></RimoElement></RimoElement></> : null}
<RimoElement kind="el-form-item" label="生效方式"><RimoElement kind="el-radio-group" modelValue={view.changePlanForm.effectiveType} onModelChange={value => {
              model.write(["changePlanForm", "effectiveType"], value);
            }}><RimoElement kind="el-radio" label="immediate">{text("立即生效 (補差價/退款)")}</RimoElement>
<RimoElement kind="el-radio" label="next_cycle">{text("當前週期結束後生效")}</RimoElement></RimoElement></RimoElement>
{view.changePlanForm.effectiveType === 'immediate' ? <><RimoElement kind="el-alert" title="差價說明: 升級需補繳 ¥100" type="warning" closable={false} showIcon={true} className="mb-4"></RimoElement></> : null}
<RimoElement kind="el-form-item" label="變更原因"><RimoElement kind="el-input" modelValue={view.changePlanForm.reason} onModelChange={value => {
              model.write(["changePlanForm", "reason"], value);
            }} type="textarea" placeholder="請輸入變更原因"></RimoElement></RimoElement></RimoElement></>}</RimoElement>
<RimoElement kind="el-dialog" modelValue={view.renewalDialogVisible} onModelChange={value => {
      model.write(["renewalDialogVisible"], value);
    }} title="手動續約" width="450px" appendToBody={true} destroyOnClose={true} className="members-overlay" slots={{
      "footer": _slot => <><RimoElement kind="el-button" onClick={_event => {
          model.write(["renewalDialogVisible"], false);
        }}>{text("取消")}</RimoElement>
<RimoElement kind="el-button" type="primary" onClick={event => {
          view.confirmRenewal?.(event);
        }}>{text("確認續約")}</RimoElement></>
    }}>{() => <><div className="bg-blue-50 p-3 rounded mb-4 text-sm text-blue-800">{text("\n                當前到期日: ")}
<span className="font-bold">{rimoText(view.currentMember?.membership?.expireDate)}</span></div>
<RimoElement kind="el-form" model={view.renewalForm} labelPosition="top"><RimoElement kind="el-form-item" label="續約週期"><RimoElement kind="el-select" modelValue={view.renewalForm.cycle} onModelChange={value => {
              model.write(["renewalForm", "cycle"], value);
            }} className="w-full"><RimoElement kind="el-option" label="續費 1 個月 (¥99)" value="1_month"></RimoElement>
<RimoElement kind="el-option" label="續費 3 個月 (¥269)" value="3_month"></RimoElement>
<RimoElement kind="el-option" label="續費 1 年 (¥899)" value="1_year"></RimoElement></RimoElement></RimoElement>
<div className="text-right text-sm text-gray-500 mb-4">{text("\n                    續約後到期日: ")}
<span className="text-[color:var(--app-color-primary)] font-bold">{text("2026-02-15")}</span></div>
<RimoElement kind="el-form-item" label="支付方式"><RimoElement kind="el-radio-group" modelValue={view.renewalForm.paymentMethod} onModelChange={value => {
              model.write(["renewalForm", "paymentMethod"], value);
            }}><RimoElement kind="el-radio" label="cash">{text("現金支付")}</RimoElement>
<RimoElement kind="el-radio" label="transfer">{text("線下轉賬")}</RimoElement>
<RimoElement kind="el-radio" label="pos">{text("POS機刷卡")}</RimoElement></RimoElement></RimoElement>
<RimoElement kind="el-form-item" label="備註"><RimoElement kind="el-input" modelValue={view.renewalForm.note} onModelChange={value => {
              model.write(["renewalForm", "note"], value);
            }} placeholder="選填"></RimoElement></RimoElement></RimoElement></>}</RimoElement>
<RimoElement kind="el-drawer" modelValue={view.planDrawerVisible} onModelChange={value => {
      model.write(["planDrawerVisible"], value);
    }} title="客戶等級方案" size="500px" destroyOnClose={true} className="members-overlay" slots={{
      "header": _slot => <><div className="text-lg font-bold text-gray-800 flex items-center"><RimoElement kind="el-icon" className="mr-2 text-[color:var(--app-color-primary)]"><RimoIcon name="Medal" /></RimoElement>
{text("\n                    客戶等級方案 - ")}{rimoText(view.currentMember?.name)}{text("\n                ")}</div></>
    }}>{() => <>{view.currentMember ? <><div className="space-y-6"><div className="bg-gradient-to-br from-blue-50 to-[color:var(--app-color-primary-light-9)] rounded-xl border border-blue-100 p-5 shadow-sm relative overflow-hidden"><div className="absolute top-0 right-0 p-2 opacity-10"><RimoElement kind="el-icon" size={100}><RimoIcon name="Medal" /></RimoElement></div>
<div className="relative z-10"><div className="flex justify-between items-start mb-4"><div><div className="text-sm text-blue-600 font-bold mb-1">{text("當前方案")}</div>
<h2 className="text-2xl font-bold text-gray-900">{rimoText(view.currentMember.membership?.planName)}{text("\n                                ")}</h2></div>
<RimoElement kind="el-tag" effect="dark" type={view.getMembershipColor(view.currentMember.membership?.planId)}>{text("\n                                Lv.")}{rimoText(view.getPlanTier(view.currentMember.membership?.planId))}{text("\n                            ")}</RimoElement></div>
<div className="bg-white/60 rounded-lg p-3 backdrop-blur-sm space-y-2 text-sm mb-4"><div className="flex justify-between"><span className="text-gray-500">{text("繳費週期")}</span>
<span className="font-medium text-gray-900">{text("月繳 ¥99")}</span></div>
<div className="flex justify-between"><span className="text-gray-500">{text("到期日期")}</span>
<span className="font-medium text-gray-900 font-mono">{rimoText(view.currentMember.membership?.expireDate || '永久')}</span></div>
<div className="flex justify-between items-center"><span className="text-gray-500">{text("自動續費")}</span>
<RimoElement kind="el-switch" modelValue={view.currentMember.membership.autoRenew} onModelChange={value => {
                      model.write(["currentMember", "membership", "autoRenew"], value);
                    }} size="small" activeText="開啓" inactiveText="關閉"></RimoElement></div></div>
<div className="flex gap-2"><RimoElement kind="el-button" type="primary" className="flex-1 shadow-sm" icon="Refresh" onClick={event => {
                    view.openChangePlanDialog?.(event);
                  }}>{text("變更方案")}</RimoElement>
<RimoElement kind="el-button" type="success" className="flex-1 shadow-sm" icon="Money" onClick={event => {
                    view.openRenewalDialog?.(event);
                  }}>{text("手動續約")}</RimoElement></div></div></div>
<div><h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center"><RimoElement kind="el-icon" className="mr-1 text-gray-500"><RimoIcon name="Star" /></RimoElement>
{text(" 當前權益\n                    ")}</h3>
<div className="grid grid-cols-2 gap-2">{rimoEntries(view.getPlanBenefits(view.currentMember.membership?.planId)).map(([benefit], _itemIndex) => <Fragment key={benefit}><div key={benefit} className="bg-gray-50 rounded px-3 py-2 text-xs text-gray-600 flex items-center"><RimoElement kind="el-icon" className="mr-1 text-green-500"><RimoIcon name="Check" /></RimoElement>
{text(" ")}{rimoText(benefit)}{text("\n                        ")}</div></Fragment>)}</div></div>
<div className="border-t border-gray-100 pt-6"><h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center"><RimoElement kind="el-icon" className="mr-1 text-gray-500"><RimoIcon name="Warning" /></RimoElement>
{text(" 危險操作\n                    ")}</h3>
<div className="bg-red-50 rounded-lg p-4 border border-red-100 flex items-center justify-between"><div><div className="text-sm font-bold text-red-800">{text("解約方案")}</div>
<div className="text-xs text-red-500 mt-1">{text("退回到免費普通會員，立即失效")}</div></div>
<RimoElement kind="el-button" type="danger" plain={true} size="small" onClick={event => {
                  view.handleTerminatePlan?.(event);
                }}>{text("解約")}</RimoElement></div></div>
<div className="border-t border-gray-100 pt-6"><h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center"><RimoElement kind="el-icon" className="mr-1 text-gray-500"><RimoIcon name="Clock" /></RimoElement>
{text(" 變更記錄\n                    ")}</h3>
<RimoElement kind="el-timeline">{rimoEntries(view.planHistory).map(([activity, index], _itemIndex) => <Fragment key={index}><RimoElement kind="el-timeline-item" key={index} type={activity.type} timestamp={activity.timestamp} size="small">{text("\n                            ")}{rimoText(activity.content)}{text(" ")}
<span className="text-xs text-gray-400 ml-2">{text("by ")}{rimoText(activity.operator)}</span></RimoElement></Fragment>)}</RimoElement></div></div></> : null}</>}</RimoElement></RimoRoot>;
}