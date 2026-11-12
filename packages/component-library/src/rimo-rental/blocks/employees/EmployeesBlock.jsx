import { Fragment } from 'react';
import { useRimoModel, rimoEntries } from '../../lib/rimo-model.js';
import { RimoRoot, RimoIcon, useRimoEnvironment } from '../../lib/RimoEnvironment.jsx';
import { RimoElement, rimoClass, rimoStyle, rimoText } from '../../lib/RimoElements.jsx';
import './employees.css';
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
      derived: computed
    } = model;
    const departments = ref([{
      id: 'dept_1',
      name: '營運部',
      sort: 1
    }, {
      id: 'dept_2',
      name: '客服部',
      sort: 2
    }, {
      id: 'dept_3',
      name: '財務部',
      sort: 3
    }, {
      id: 'dept_4',
      name: '技術部',
      sort: 4
    }, {
      id: 'dept_5',
      name: '行政部',
      sort: 5
    }]);
    const sortedDepartments = computed(() => {
      return [...departments.value].sort((a, b) => a.sort - b.sort);
    });
    const providers = ref([{
      id: 'provider_1',
      name: '臺北 RIMO 直營車行'
    }, {
      id: 'provider_2',
      name: '港都觀光租車'
    }, {
      id: 'provider_3',
      name: '北區觀光租賃'
    }]);
    const stores = ref([{
      id: 'store_1',
      name: '臺北車站門市',
      providerId: 'provider_1'
    }, {
      id: 'store_2',
      name: '臺北松山機場門市',
      providerId: 'provider_1'
    }, {
      id: 'store_3',
      name: '高雄左營高鐵門市',
      providerId: 'provider_2'
    }, {
      id: 'store_4',
      name: '高雄小港機場門市',
      providerId: 'provider_2'
    }, {
      id: 'store_5',
      name: '臺北南港車站門市',
      providerId: 'provider_1'
    }]);
    const allStations = ref([{
      id: 'st_1',
      name: '松山機場第一航廈取還點',
      storeId: 'store_2'
    }, {
      id: 'st_2',
      name: '松山機場停車場自助點',
      storeId: 'store_2'
    }, {
      id: 'st_3',
      name: '臺北車站東三門交接點',
      storeId: 'store_1'
    }, {
      id: 'st_4',
      name: '左營高鐵 P2 停車場',
      storeId: 'store_3'
    }, {
      id: 'st_5',
      name: '南港車站東側停車場',
      storeId: 'store_5'
    }]);
    const roles = ref([{
      id: 'role_admin',
      name: '超級管理員'
    }, {
      id: 'role_manager',
      name: '門市店長'
    }, {
      id: 'role_ops',
      name: '運營專員'
    }, {
      id: 'role_cs',
      name: '客服專員'
    }, {
      id: 'role_finance',
      name: '財務專員'
    }]);
    if (!roles.value.some(role => role.id === 'role_staff')) {
      roles.value.push({
        id: 'role_staff',
        name: '門店員工'
      });
    }
    const employees = ref([{
      id: 'emp_1',
      name: '林冠宇',
      phone: '0912-345-001',
      email: 'kuanyu.lin@rimo.tw',
      departmentId: 'dept_1',
      roleId: 'role_admin',
      account: 'kuanyu.lin@rimo.tw',
      status: true,
      lastLogin: '2026-03-25 09:30',
      orgType: 'HEADQUARTERS'
    }, {
      id: 'emp_2',
      name: '陳怡君',
      phone: '0912-345-002',
      email: 'yijun.chen@rimo.tw',
      departmentId: 'dept_2',
      roleId: 'role_cs',
      account: 'yijun.chen@rimo.tw',
      status: true,
      lastLogin: '2026-03-25 08:45',
      orgType: 'HEADQUARTERS'
    }, {
      id: 'emp_3',
      name: '王志豪',
      phone: '0912-345-003',
      email: 'chihhao.wang@rimo.tw',
      departmentId: 'dept_1',
      roleId: 'role_ops',
      account: 'chihhao.wang@rimo.tw',
      status: false,
      lastLogin: '2026-03-20 18:20',
      orgType: 'HEADQUARTERS'
    }, {
      id: 'emp_4',
      name: '黃雅婷',
      phone: '0912-345-004',
      email: 'yating.huang@rimo.tw',
      departmentId: 'dept_3',
      roleId: 'role_finance',
      account: 'yating.huang@rimo.tw',
      status: true,
      lastLogin: '2026-03-24 14:10',
      orgType: 'HEADQUARTERS'
    }, {
      id: 'emp_5',
      name: '張哲維',
      phone: '0912-345-005',
      email: 'chewei.chang@rimo.tw',
      departmentId: 'dept_1',
      roleId: 'role_manager',
      account: 'chewei.chang@rimo.tw',
      status: true,
      lastLogin: '',
      orgType: 'HEADQUARTERS'
    }, {
      id: 'emp_7',
      name: '吳宗翰',
      phone: '0928-110-101',
      email: 'tsunghan.wu@rimo.tw',
      departmentId: 'dept_4',
      roleId: 'role_admin',
      account: 'tsunghan.wu@rimo.tw',
      status: true,
      lastLogin: '2026-03-26 11:00',
      orgType: 'HEADQUARTERS'
    }, {
      id: 'emp_8',
      name: '蔡佳穎',
      phone: '0928-110-102',
      email: 'chiaying.tsai@rimo.tw',
      departmentId: 'dept_5',
      roleId: 'role_cs',
      account: 'chiaying.tsai@rimo.tw',
      status: true,
      lastLogin: '2026-03-26 10:30',
      orgType: 'HEADQUARTERS'
    }, {
      id: 'emp_9',
      name: '郭家豪',
      phone: '0928-110-103',
      email: 'chiahao.kuo@rimo.tw',
      departmentId: 'dept_4',
      roleId: 'role_ops',
      account: 'chiahao.kuo@rimo.tw',
      status: false,
      lastLogin: '2026-03-25 15:20',
      orgType: 'HEADQUARTERS'
    }, {
      id: 'emp_6',
      name: '李承恩',
      phone: '0936-220-301',
      email: 'chengen.lee@rimo.tw',
      storeId: 'store_5',
      stationIds: ['st_5'],
      roleId: 'role_staff',
      account: 'chengen.lee@rimo.tw',
      status: true,
      lastLogin: '2026-03-26 10:00',
      orgType: 'STORE'
    }]);
    const providersWithStores = computed(() => {
      return providers.value.map(provider => {
        return {
          provider,
          stores: stores.value.filter(s => s.providerId === provider.id)
        };
      });
    });
    const switchSidebarTab = tab => {
      sidebarTab.value = tab;
      if (tab === 'ALL') {
        filterOrgType.value = '';
      } else {
        filterOrgType.value = tab === 'HEADQUARTERS' ? 'HEADQUARTERS' : 'STORE';
      }
      filterOrgId.value = '';
      providerTreeRef.value?.setCurrentKey?.(null);
    };
    const searchKeyword = ref('');
    const filterOrgType = ref('');
    const filterOrgId = ref('');
    const filterRole = ref('');
    const filterStatus = ref('');
    const currentPage = ref(1);
    const pageSize = ref(10);
    const providerTreeRef = ref(null);
    const selectedEmployees = ref([]);
    const importDialogVisible = ref(false);
    const importFile = ref(null);
    const currentImportAccountType = ref('');
    const accountTypeApiMap = {
      HEADQUARTERS: {
        label: '營運賬戶',
        importApiName: '營運賬戶導入接口',
        exportApiName: '營運賬戶導出接口',
        templateName: '營運賬戶導入模板'
      },
      STORE: {
        label: '車行賬戶',
        importApiName: '車行賬戶導入接口',
        exportApiName: '車行賬戶導出接口',
        templateName: '車行賬戶導入模板'
      }
    };
    const getSelectedAccountTypeConfig = () => {
      if (sidebarTab.value === 'HEADQUARTERS') return accountTypeApiMap.HEADQUARTERS;
      if (sidebarTab.value === 'PROVIDERS') return accountTypeApiMap.STORE;
      return null;
    };
    const importAccountTypeConfig = computed(() => accountTypeApiMap[currentImportAccountType.value] || null);
    const importDialogTitle = computed(() => importAccountTypeConfig.value ? `導入${importAccountTypeConfig.value.label}` : '導入員工數據');
    const handleSelectionChange = selection => {
      selectedEmployees.value = selection;
    };
    const batchSetStatus = command => {
      if (selectedEmployees.value.length === 0) return;
      const status = command === 'enable';
      selectedEmployees.value.forEach(emp => {
        emp.status = status;
      });
      feedback.ElMessage.success(`成功將 ${selectedEmployees.value.length} 個賬號設爲${status ? '啓用' : '禁用'}狀態`);
    };
    const handleExport = () => {
      const accountTypeConfig = getSelectedAccountTypeConfig();
      if (!accountTypeConfig) {
        feedback.ElMessage.warning('請先選擇導出的賬戶類型');
        return;
      }
      feedback.ElMessage.success(`${accountTypeConfig.label}導出任務已提交，將調用${accountTypeConfig.exportApiName}。`);
    };
    const handleImportCommand = cmd => {
      if (cmd === 'import') {
        const accountTypeConfig = getSelectedAccountTypeConfig();
        if (!accountTypeConfig) {
          feedback.ElMessage.warning('請先選擇導入的賬戶類型');
          return;
        }
        currentImportAccountType.value = accountTypeConfig === accountTypeApiMap.HEADQUARTERS ? 'HEADQUARTERS' : 'STORE';
        importFile.value = null;
        importDialogVisible.value = true;
      }
    };
    const downloadTemplate = () => {
      const accountTypeConfig = importAccountTypeConfig.value || getSelectedAccountTypeConfig();
      if (!accountTypeConfig) {
        feedback.ElMessage.warning('請先選擇導入的賬戶類型');
        return;
      }
      feedback.ElMessage.success(`${accountTypeConfig.templateName}開始下載`);
    };
    const handleFileChange = file => {
      importFile.value = file;
    };
    const confirmImport = () => {
      const accountTypeConfig = importAccountTypeConfig.value;
      if (!accountTypeConfig) {
        feedback.ElMessage.warning('請先選擇導入的賬戶類型');
        return;
      }
      if (!importFile.value) {
        feedback.ElMessage.warning('請先選擇要導入的批量文件');
        return;
      }
      feedback.ElMessage.success(`${accountTypeConfig.label}導入申請已提交，將調用${accountTypeConfig.importApiName}。`);
      importDialogVisible.value = false;
      currentImportAccountType.value = '';
      importFile.value = null;
    };
    const filteredEmployees = computed(() => {
      return employees.value.filter(emp => {
        const matchKeyword = !searchKeyword.value || emp.name.includes(searchKeyword.value) || emp.phone.includes(searchKeyword.value) || emp.account.includes(searchKeyword.value);
        let matchOrg = true;
        if (filterOrgType.value === 'HEADQUARTERS') {
          matchOrg = emp.orgType === 'HEADQUARTERS' && (!filterOrgId.value || emp.departmentId === filterOrgId.value);
        } else if (filterOrgType.value === 'STORE') {
          matchOrg = emp.orgType === 'STORE' && (!filterOrgId.value || emp.storeId === filterOrgId.value);
        } else if (filterOrgType.value === 'STATION') {
          matchOrg = emp.orgType === 'STORE' && emp.stationIds && emp.stationIds.includes(filterOrgId.value);
        }
        const matchRole = !filterRole.value || emp.roleId === filterRole.value;
        const normalizedStatus = filterStatus.value === 'true' ? true : filterStatus.value === 'false' ? false : filterStatus.value;
        const matchStatus = normalizedStatus === '' || emp.status === normalizedStatus;
        return matchKeyword && matchOrg && matchRole && matchStatus;
      });
    });
    const getDepartmentName = id => departments.value.find(d => d.id === id)?.name || '-';
    const getStoreName = id => stores.value.find(s => s.id === id)?.name || '-';
    const getStationName = id => allStations.value.find(s => s.id === id)?.name || id;
    const getRoleName = id => roles.value.find(r => r.id === id)?.name || '-';
    const selectOrg = (type, id) => {
      filterOrgType.value = type;
      filterOrgId.value = id;
      if (type !== 'STORE' && type !== 'STATION') {
        providerTreeRef.value?.setCurrentKey?.(null);
      }
    };
    const providerTreeData = computed(() => {
      return providers.value.map(provider => {
        const children = stores.value.filter(s => s.providerId === provider.id).map(store => {
          const stations = allStations.value.filter(st => st.storeId === store.id).map(station => ({
            id: station.id,
            label: station.name,
            level: 'station'
          }));
          return {
            id: store.id,
            label: store.name,
            level: 'store',
            children: stations
          };
        });
        return {
          id: provider.id,
          label: provider.name,
          level: 'company',
          children: children
        };
      });
    });
    const getIconByLevel = level => {
      const map = {
        company: 'OfficeBuilding',
        store: 'Shop',
        station: 'Location'
      };
      return map[level] || 'Location';
    };
    const expandedProviderIds = computed(() => {
      return providers.value.map(p => p.id);
    });
    const handleProviderNodeClick = data => {
      if (data.level === 'store') {
        selectOrg('STORE', data.id);
      } else if (data.level === 'station') {
        selectOrg('STATION', data.id);
      }
    };
    const sidebarTab = ref('ALL');
    const dialogVisible = ref(false);
    const isEdit = ref(false);
    const formRef = ref(null);
    const employeeForm = reactive({
      id: '',
      name: '',
      phone: '',
      email: '',
      departmentId: '',
      storeId: '',
      stationIds: [],
      orgType: 'HEADQUARTERS',
      orgCascaderValue: [],
      roleId: '',
      account: '',
      password: '',
      status: true
    });
    const {
      watch: watch
    } = model;
    const availableStations = computed(() => {
      return [];
    });
    watch(() => employeeForm.orgType, newVal => {
      if (newVal === 'HEADQUARTERS') {
        employeeForm.storeId = '';
        employeeForm.stationIds = [];
        employeeForm.orgCascaderValue = [];
      } else {
        employeeForm.departmentId = '';
      }
    });
    const passwordValidator = (_rule, value, callback) => {
      if (!value) {
        callback(new Error('請輸入密碼'));
      } else if (value.length < 8) {
        callback(new Error('密碼長度至少8位'));
      } else if (!/[a-zA-Z]/.test(value) || !/[0-9]/.test(value)) {
        callback(new Error('密碼必須包含字母和數字'));
      } else {
        callback();
      }
    };
    const departmentValidator = (_rule, value, callback) => {
      if (employeeForm.orgType === 'HEADQUARTERS' && !value) {
        callback(new Error('請選擇部門'));
      } else {
        callback();
      }
    };
    const storeValidator = (_rule, _value, callback) => {
      if (employeeForm.orgType === 'STORE' && (!employeeForm.orgCascaderValue || employeeForm.orgCascaderValue.length < 2)) {
        callback(new Error('請選擇門店或站點'));
      } else {
        callback();
      }
    };
    const formRules = {
      name: [{
        required: true,
        message: '請輸入姓名',
        trigger: 'blur'
      }],
      phone: [{
        required: false,
        message: '請輸入電話',
        trigger: 'blur'
      }],
      email: [{
        required: false,
        message: '請輸入郵箱',
        trigger: 'blur'
      }, {
        type: 'email',
        message: '請輸入正確的郵箱格式',
        trigger: 'blur'
      }],
      roleId: [{
        required: true,
        message: '請選擇角色',
        trigger: 'change'
      }],
      account: [{
        required: true,
        message: '請輸入賬號',
        trigger: 'blur'
      }],
      password: [{
        required: true,
        validator: passwordValidator,
        trigger: 'blur'
      }],
      departmentId: [{
        required: true,
        validator: departmentValidator,
        trigger: 'change'
      }],
      orgCascaderValue: [{
        required: true,
        validator: storeValidator,
        trigger: 'change'
      }]
    };
    const getProviderIdByStoreId = storeId => {
      const store = stores.value.find(s => s.id === storeId);
      return store ? store.providerId : '';
    };
    const openCreateDialog = () => {
      isEdit.value = false;
      Object.assign(employeeForm, {
        id: '',
        name: '',
        phone: '',
        email: '',
        departmentId: '',
        storeId: '',
        stationIds: [],
        orgType: 'HEADQUARTERS',
        orgCascaderValue: [],
        roleId: '',
        account: '',
        password: '',
        status: true
      });
      if (filterOrgType.value === 'HEADQUARTERS') {
        employeeForm.orgType = 'HEADQUARTERS';
        if (filterOrgId.value) employeeForm.departmentId = filterOrgId.value;
      } else if (filterOrgType.value === 'STORE') {
        employeeForm.orgType = 'STORE';
        if (filterOrgId.value) {
          const pId = getProviderIdByStoreId(filterOrgId.value);
          if (pId) employeeForm.orgCascaderValue = [pId, filterOrgId.value];
        }
      } else if (filterOrgType.value === 'STATION') {
        employeeForm.orgType = 'STORE';
        const station = allStations.value.find(s => s.id === filterOrgId.value);
        if (station) {
          const pId = getProviderIdByStoreId(station.storeId);
          if (pId) employeeForm.orgCascaderValue = [pId, station.storeId, station.id];
        }
      }
      dialogVisible.value = true;
    };
    const openEditDialog = row => {
      isEdit.value = true;
      Object.assign(employeeForm, {
        ...row,
        password: '',
        orgCascaderValue: []
      });
      if (row.orgType === 'STORE') {
        const pId = getProviderIdByStoreId(row.storeId);
        if (pId && row.storeId) {
          if (row.stationIds && row.stationIds.length > 0) {
            employeeForm.orgCascaderValue = [pId, row.storeId, row.stationIds[0]];
          } else {
            employeeForm.orgCascaderValue = [pId, row.storeId];
          }
        }
      }
      dialogVisible.value = true;
    };
    const submitForm = async () => {
      if (!formRef.value) return;
      const valid = await formRef.value.validate().catch(() => false);
      if (!valid) return;
      if (employeeForm.orgType === 'STORE' && employeeForm.orgCascaderValue) {
        const path = employeeForm.orgCascaderValue;
        if (path.length >= 2) {
          employeeForm.storeId = path[1];
          if (path.length === 3) {
            employeeForm.stationIds = [path[2]];
          } else {
            employeeForm.stationIds = [];
          }
        }
      } else if (employeeForm.orgType === 'HEADQUARTERS') {
        employeeForm.storeId = '';
        employeeForm.stationIds = [];
      }
      const formData = {
        ...employeeForm
      };
      delete formData.orgCascaderValue;
      if (isEdit.value) {
        const index = employees.value.findIndex(e => e.id === employeeForm.id);
        if (index !== -1) {
          employees.value[index] = {
            ...employees.value[index],
            ...formData
          };
        }
        feedback.ElMessage.success('員工信息已更新');
      } else {
        employees.value.push({
          ...formData,
          id: `emp_${Date.now()}`,
          lastLogin: ''
        });
        feedback.ElMessage.success('員工創建成功');
      }
      dialogVisible.value = false;
    };
    const handleMoreCommand = (command, row) => {
      if (command === 'resetPwd') {
        resetPassword(row);
      } else if (command === 'delete') {
        feedback.ElMessageBox.confirm(`確定要刪除員工 ${row.name} 嗎？`, '警告', {
          confirmButtonText: '刪除',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          deleteEmployee(row);
        }).catch(() => {});
      }
    };
    const deleteEmployee = row => {
      employees.value = employees.value.filter(e => e.id !== row.id);
      feedback.ElMessage.success('員工已刪除');
    };
    const handleStatusChange = row => {
      feedback.ElMessage.success(`員工 ${row.name} 已${row.status ? '啓用' : '禁用'}`);
    };
    const resetPwdDialogVisible = ref(false);
    const resetPwdFormRef = ref(null);
    const resetPwdForm = reactive({
      password: '',
      confirmPassword: '',
      employeeId: ''
    });
    const confirmPasswordValidator = (_rule, value, callback) => {
      if (!value) {
        callback(new Error('請確認密碼'));
      } else if (value !== resetPwdForm.password) {
        callback(new Error('兩次密碼不一致'));
      } else {
        callback();
      }
    };
    const resetPwdRules = {
      password: [{
        required: true,
        validator: passwordValidator,
        trigger: 'blur'
      }],
      confirmPassword: [{
        required: true,
        validator: confirmPasswordValidator,
        trigger: 'blur'
      }]
    };
    const resetPassword = row => {
      resetPwdForm.employeeId = row.id;
      resetPwdForm.password = '';
      resetPwdForm.confirmPassword = '';
      resetPwdDialogVisible.value = true;
    };
    const confirmResetPassword = async () => {
      if (!resetPwdFormRef.value) return;
      const valid = await resetPwdFormRef.value.validate().catch(() => false);
      if (!valid) return;
      feedback.ElMessage.success('密碼已重置');
      resetPwdDialogVisible.value = false;
    };
    const deptDialogVisible = ref(false);
    const editingDept = ref(null);
    const deptForm = reactive({
      name: '',
      sort: 0
    });
    const openDeptDialog = dept => {
      editingDept.value = dept;
      if (dept) {
        deptForm.name = dept.name;
        deptForm.sort = dept.sort;
      } else {
        deptForm.name = '';
        deptForm.sort = departments.value.length + 1;
      }
      deptDialogVisible.value = true;
    };
    const saveDepartment = () => {
      if (!deptForm.name.trim()) {
        feedback.ElMessage.warning('請輸入部門名稱');
        return;
      }
      if (editingDept.value) {
        editingDept.value.name = deptForm.name;
        editingDept.value.sort = deptForm.sort;
        feedback.ElMessage.success('部門已更新');
      } else {
        departments.value.push({
          id: 'dept_' + Date.now(),
          name: deptForm.name,
          sort: deptForm.sort
        });
        feedback.ElMessage.success('部門已創建');
      }
      deptDialogVisible.value = false;
    };
    const deleteDepartment = dept => {
      const hasEmployee = employees.value.some(e => e.departmentId === dept.id);
      if (hasEmployee) {
        feedback.ElMessage.error('該部門下存在員工，無法刪除');
        return;
      }
      feedback.ElMessageBox.confirm(`確定要刪除部門 ${dept.name} 嗎？`, '提示', {
        confirmButtonText: '刪除',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        departments.value = departments.value.filter(d => d.id !== dept.id);
        feedback.ElMessage.success('部門已刪除');
        if (filterOrgType.value === 'HEADQUARTERS' && filterOrgId.value === dept.id) {
          filterOrgId.value = '';
          filterOrgType.value = '';
        }
      }).catch(() => {});
    };
    const handleDeptCommand = (command, dept) => {
      if (command === 'edit') {
        openDeptDialog(dept);
      } else if (command === 'delete') {
        deleteDepartment(dept);
      }
    };
    const goToRoles = () => {
      window.location.href = 'permissions.html';
    };
    return {
      departments,
      sortedDepartments,
      roles,
      employees,
      providers,
      stores,
      providersWithStores,
      allStations,
      availableStations,
      searchKeyword,
      providerTreeRef,
      filterOrgType,
      filterOrgId,
      filterRole,
      filterStatus,
      currentPage,
      pageSize,
      filteredEmployees,
      getDepartmentName,
      getStoreName,
      getStationName,
      getRoleName,
      selectOrg,
      providerTreeData,
      getIconByLevel,
      handleProviderNodeClick,
      sidebarTab,
      dialogVisible,
      isEdit,
      formRef,
      employeeForm,
      formRules,
      openCreateDialog,
      openEditDialog,
      submitForm,
      handleMoreCommand,
      handleStatusChange,
      resetPwdDialogVisible,
      resetPwdFormRef,
      resetPwdForm,
      resetPwdRules,
      resetPassword,
      confirmResetPassword,
      deptDialogVisible,
      editingDept,
      deptForm,
      openDeptDialog,
      saveDepartment,
      deleteDepartment,
      handleDeptCommand,
      goToRoles,
      switchSidebarTab,
      selectedEmployees,
      importDialogVisible,
      importAccountTypeConfig,
      importDialogTitle,
      handleSelectionChange,
      batchSetStatus,
      handleExport,
      handleImportCommand,
      downloadTemplate,
      handleFileChange,
      confirmImport,
      importFile,
      currentImportAccountType,
      accountTypeApiMap,
      getSelectedAccountTypeConfig,
      expandedProviderIds,
      passwordValidator,
      departmentValidator,
      storeValidator,
      getProviderIdByStoreId,
      deleteEmployee,
      confirmPasswordValidator
    };
  }
  return pageSetup();
}
export default function EmployeesBlock() {
  const model = useRimoModel(createPageState);
  const view = model.view;
  const {
    text
  } = useRimoEnvironment();
  return <RimoRoot model={model} pageKey="employees" assets={{}}><div data-business-content="" data-rimo-layout="page"><div className="flex justify-between items-end mb-6" data-rimo-layout="heading"><div><h1 className="text-2xl font-bold text-gray-800 tracking-tight">{text("平臺賬戶管理")}</h1>
<p className="text-gray-500 text-sm mt-1">{text("管理公司內部員工賬號、所屬部門及系統角色權限。")}</p></div>
<div className="flex gap-3"><RimoElement kind="el-button" size="large" onClick={event => {
            view.goToRoles?.(event);
          }}><RimoElement kind="el-icon" className="mr-1"><RimoIcon name="Key" /></RimoElement>
{text("角色管理\n                        ")}</RimoElement>
<RimoElement kind="el-button" type="primary" size="large" className="shadow-md shadow-[color:var(--app-color-primary-shadow)]" onClick={event => {
            view.openCreateDialog?.(event);
          }}><RimoElement kind="el-icon" className="mr-1"><RimoIcon name="Plus" /></RimoElement>
{text(" 新增員工\n                        ")}</RimoElement></div></div>
<div className="flex gap-6 layout-container">{null}
<div className="w-72 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col p-4 overflow-y-auto custom-scroll"><div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">{text("賬號類型")}</div>
<div className="space-y-2 mb-6" data-rimo-layout="summary"><div className={rimoClass(["group flex items-center px-3 py-2.5 rounded-lg cursor-pointer transition-colors", rimoClass(view.sidebarTab === 'ALL' && !view.filterOrgType ? 'employee-filter-active' : 'employee-filter-idle text-gray-700')])} onClick={_event => {
              view.switchSidebarTab('ALL');
            }} data-rimo-layout="stat"><span className={rimoClass(["mr-2 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-md", rimoClass(view.sidebarTab === 'ALL' && !view.filterOrgType ? 'employee-filter-icon-active' : 'bg-gray-100 text-gray-400')])}><svg className="h-3.5 w-3.5" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M3 4.5h10M3 8h10M3 11.5h10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"></path></svg></span>
<span className="font-medium text-sm">{text("全部賬戶")}</span></div>
<div className={rimoClass(["group flex items-center px-3 py-2.5 rounded-lg cursor-pointer transition-colors", rimoClass(view.sidebarTab === 'HEADQUARTERS' && view.filterOrgType === 'HEADQUARTERS' ? 'employee-filter-active' : 'employee-filter-idle text-gray-700')])} onClick={_event => {
              view.switchSidebarTab('HEADQUARTERS');
            }} data-rimo-layout="stat"><span className={rimoClass(["mr-2 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-md", rimoClass(view.sidebarTab === 'HEADQUARTERS' && view.filterOrgType === 'HEADQUARTERS' ? 'employee-filter-icon-active' : 'bg-gray-100 text-gray-400')])}><svg className="h-3.5 w-3.5" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M4 12.5V5.8L8 3.5l4 2.3v6.7M3 12.5h10M6.2 12.5V8.7h3.6v3.8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path></svg></span>
<span className="font-medium text-sm">{text("營運賬戶")}</span></div>
<div className={rimoClass(["group flex items-center px-3 py-2.5 rounded-lg cursor-pointer transition-colors", rimoClass(view.sidebarTab === 'PROVIDERS' && (view.filterOrgType === 'STORE' || view.filterOrgType === 'STATION') ? 'employee-filter-active' : 'employee-filter-idle text-gray-700')])} onClick={_event => {
              view.switchSidebarTab('PROVIDERS');
            }} data-rimo-layout="stat"><span className={rimoClass(["mr-2 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-md", rimoClass(view.sidebarTab === 'PROVIDERS' && (view.filterOrgType === 'STORE' || view.filterOrgType === 'STATION') ? 'employee-filter-icon-active' : 'bg-gray-100 text-gray-400')])}><svg className="h-3.5 w-3.5" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M3.3 7.1h9.4l-.8-3.6H4.1l-.8 3.6ZM4 7.1v5.4h8V7.1M6.3 12.5V9.2h3.4v3.3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path></svg></span>
<span className="font-medium text-sm">{text("車行賬戶")}</span></div></div>
{view.sidebarTab === 'HEADQUARTERS' ? <><><div className="flex items-center justify-between mb-2"><div className="text-xs font-bold text-gray-400 uppercase tracking-wider">{text("部門列表")}</div>
<RimoElement kind="el-button" link={true} type="primary" size="small" onClick={_event => {
                  view.openDeptDialog(null);
                }}>{text("新增")}</RimoElement></div>
<div className="space-y-1">{rimoEntries(view.sortedDepartments).map(([dept], _itemIndex) => <Fragment key={dept.id}><div key={dept.id} className={rimoClass(["group flex items-center px-3 py-2 rounded-lg cursor-pointer transition-colors relative", rimoClass(view.filterOrgType === 'HEADQUARTERS' && view.filterOrgId === dept.id ? 'employee-filter-active' : 'employee-filter-idle text-gray-600')])} onClick={_event => {
                    view.selectOrg('HEADQUARTERS', dept.id);
                  }}><span className={rimoClass(["mr-2 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-md", rimoClass(view.filterOrgType === 'HEADQUARTERS' && view.filterOrgId === dept.id ? 'employee-filter-icon-active' : 'bg-gray-100 text-gray-400')])}><svg className="h-3.5 w-3.5" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M4 12.5V5.8L8 3.5l4 2.3v6.7M3 12.5h10M6.2 12.5V8.7h3.6v3.8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path></svg></span>
<span className="truncate font-medium text-sm flex-1">{rimoText(dept.name)}</span>
<div className="hidden group-hover:flex items-center absolute right-2 bg-inherit"><RimoElement kind="el-button" link={true} type="primary" size="small" className="!px-1" onClick={event => {
                        event.stopPropagation();
                        view.openDeptDialog(dept);
                      }}><RimoElement kind="el-icon"><RimoIcon name="Edit" /></RimoElement></RimoElement>
<RimoElement kind="el-button" link={true} type="danger" size="small" className="!px-1 ml-1" onClick={event => {
                        event.stopPropagation();
                        view.deleteDepartment(dept);
                      }}><RimoElement kind="el-icon"><RimoIcon name="Delete" /></RimoElement></RimoElement></div></div></Fragment>)}</div></></> : view.sidebarTab === 'PROVIDERS' ? <><><div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">{text("車行結構")}</div>
<div className="rounded-xl border border-gray-100 bg-gray-50/70 p-2"><RimoElement kind="el-tree" modelRef={model.ref("providerTreeRef")} data={view.providerTreeData} className="employee-org-tree" defaultExpandedKeys={view.expandedProviderIds} nodeKey="id" highlightCurrent={true} expandOnClickNode={false} onNodeClick={event => {
                  view.handleProviderNodeClick?.(event);
                }} slots={{
                  "default": ({
                    node,
                    data
                  }) => <><div className="flex items-center w-full py-1"><RimoElement kind="el-icon" className="employee-tree-icon mr-2 text-gray-400"><RimoIcon name={view.getIconByLevel(data.level)} /></RimoElement>
<span className={rimoClass(["flex-1 truncate text-sm", rimoClass({
                        'font-bold': data.level === 'company'
                      })])} title={node.label}>{text("\n                                                ")}{rimoText(node.label)}{text("\n                                            ")}</span></div></>
                }}></RimoElement></div></></> : null}</div>
<div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col overflow-hidden" data-rimo-layout="list"><RimoElement kind="el-table" data={view.filteredEmployees} stripe={true} style={rimoStyle("width: 100%")} className="flex-1" onSelectionChange={event => {
            view.handleSelectionChange?.(event);
          }} headerCellStyle={{
            backgroundColor: '#f9fafb',
            color: '#374151',
            fontWeight: 'bold'
          }} slots={{
            "toolbar": _slot => <><div className="search-filter-group flex items-center gap-3 min-w-0" style={rimoStyle("flex-wrap: nowrap;")}><RimoElement kind="el-input" modelValue={view.searchKeyword} onModelChange={value => {
                  model.write(["searchKeyword"], value);
                }} placeholder="搜索姓名/電話/賬號" clearable={true} style={rimoStyle("width: 240px")} prefixIcon="Search"></RimoElement>
<RimoElement kind="el-select" modelValue={view.filterRole} onModelChange={value => {
                  model.write(["filterRole"], value);
                }} placeholder="搜索角色" filterable={true} clearable={true} style={rimoStyle("width: 160px")}>{rimoEntries(view.roles).map(([role], _itemIndex) => <Fragment key={role.id}><RimoElement kind="el-option" key={role.id} label={role.name} value={role.id}></RimoElement></Fragment>)}</RimoElement>
<RimoElement kind="el-select" modelValue={view.filterStatus} onModelChange={value => {
                  model.write(["filterStatus"], value);
                }} placeholder="狀態" clearable={true} style={rimoStyle("width: 120px")}><RimoElement kind="el-option" label="啓用" value={true}></RimoElement>
<RimoElement kind="el-option" label="禁用" value={false}></RimoElement></RimoElement></div>
<div className="search-action-group flex items-center gap-3 flex-wrap"><div className="flex items-center gap-1"><RimoElement kind="el-button" type="success" plain={true} onClick={_event => {
                    view.handleImportCommand('import');
                  }}><RimoElement kind="el-icon" className="mr-1"><RimoIcon name="Upload" /></RimoElement>
{text("導入\n                                    ")}</RimoElement>
<RimoElement kind="el-button" type="primary" plain={true} style={rimoStyle("margin-left: 0;")} onClick={event => {
                    view.handleExport?.(event);
                  }}><RimoElement kind="el-icon" className="mr-1"><RimoIcon name="Download" /></RimoElement>
{text("導出\n                                    ")}</RimoElement></div>
<RimoElement kind="el-dropdown" onCommand={event => {
                  view.batchSetStatus?.(event);
                }} trigger="click" slots={{
                  "dropdown": _slot => <><RimoElement kind="el-dropdown-menu"><RimoElement kind="el-dropdown-item" command="enable" className="text-emerald-600"><RimoElement kind="el-icon"><RimoIcon name="Check" /></RimoElement>
{text("批量啓用")}</RimoElement>
<RimoElement kind="el-dropdown-item" command="disable" className="text-red-500"><RimoElement kind="el-icon"><RimoIcon name="Close" /></RimoElement>
{text("批量禁用")}</RimoElement></RimoElement></>
                }}><RimoElement kind="el-button" type="warning" plain={true} disabled={view.selectedEmployees.length === 0}>{text("\n                                        批量設置\n                                        ")}
<svg className="ml-1.5 h-4 w-4" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"></path></svg></RimoElement></RimoElement>
{view.selectedEmployees.length > 0 ? <><span className="text-xs text-blue-600 font-medium whitespace-nowrap bg-blue-50 px-2 py-1 rounded border border-blue-100">{text("\n                                    已選 ")}{rimoText(view.selectedEmployees.length)}{text(" 項\n                                ")}</span></> : null}</div></>
          }}><RimoElement kind="el-table-column" type="selection" width="55" align="center"></RimoElement>
<RimoElement kind="el-table-column" prop="name" label="姓名" width="300" slots={{
              "default": ({
                row
              }) => <><div className="flex items-center min-w-0"><RimoElement kind="el-avatar" size={32} className="bg-blue-100 text-blue-600 mr-3 border border-blue-200 shrink-0">{text("\n                                            ")}{rimoText(row.name.charAt(0))}{text("\n                                        ")}</RimoElement>
<div className="min-w-0"><div className="font-medium text-gray-900">{rimoText(row.name)}</div>
<div className="text-xs text-gray-400 whitespace-nowrap" title={row.account}>{rimoText(row.account)}</div></div></div></>
            }}></RimoElement>
<RimoElement kind="el-table-column" label="歸屬組織" minWidth="160" slots={{
              "default": ({
                row
              }) => <>{row.orgType === 'HEADQUARTERS' ? <><div className="flex items-center"><RimoElement kind="el-tag" size="small" type="info" className="mr-1">{text("營運")}</RimoElement>
<span className="text-sm">{rimoText(view.getDepartmentName(row.departmentId))}</span></div></> : row.orgType === 'STORE' ? <><div><div className="flex items-center mb-1"><RimoElement kind="el-tag" size="small" type="warning" className="mr-1">{text("門店")}</RimoElement>
<span className="text-sm font-medium">{rimoText(view.getStoreName(row.storeId))}</span></div>
{row.stationIds && row.stationIds.length > 0 ? <><div className="flex flex-wrap gap-1 pl-1">{rimoEntries(row.stationIds).map(([sid], _itemIndex) => <Fragment key={sid}><RimoElement kind="el-tag" key={sid} size="small" type="info" effect="plain" className="scale-90 origin-left">{text("\n                                                ")}{rimoText(view.getStationName(sid))}{text("\n                                            ")}</RimoElement></Fragment>)}</div></> : null}</div></> : <><div className="text-gray-400">{text("-")}</div></>}</>
            }}></RimoElement>
<RimoElement kind="el-table-column" prop="roleId" label="角色" width="120" slots={{
              "default": ({
                row
              }) => <><RimoElement kind="el-tag" size="small" type="info" effect="plain">{rimoText(view.getRoleName(row.roleId))}</RimoElement></>
            }}></RimoElement>
<RimoElement kind="el-table-column" prop="phone" label="聯繫方式" minWidth="180" slots={{
              "default": ({
                row
              }) => <><div className="text-sm text-gray-900">{rimoText(row.phone)}</div>
<div className="text-xs text-gray-400">{rimoText(row.email)}</div></>
            }}></RimoElement>
<RimoElement kind="el-table-column" prop="lastLogin" label="最後登錄" width="160" sortable={true} slots={{
              "default": ({
                row
              }) => <><span className="text-gray-500 text-sm">{rimoText(row.lastLogin || '-')}</span></>
            }}></RimoElement>
<RimoElement kind="el-table-column" prop="status" label="狀態" width="100" slots={{
              "default": ({
                row
              }) => <><RimoElement kind="el-switch" modelValue={row.status} onModelChange={value => {
                  model.assign(row, "status", value);
                }} onChange={_event => {
                  view.handleStatusChange(row);
                }} size="small" style={rimoStyle("--el-switch-on-color: var(--app-color-primary);")}></RimoElement></>
            }}></RimoElement>
<RimoElement kind="el-table-column" label="操作" width="160" align="right" fixed="right" slots={{
              "default": ({
                row
              }) => <><div className="flex justify-end gap-2"><RimoElement kind="el-button" type="primary" link={true} size="small" onClick={_event => {
                    view.openEditDialog(row);
                  }}>{text("編輯")}</RimoElement>
<RimoElement kind="el-dropdown" trigger="click" onCommand={event => {
                    (cmd => view.handleMoreCommand(cmd, row))?.(event);
                  }} slots={{
                    "dropdown": _slot => <><RimoElement kind="el-dropdown-menu"><RimoElement kind="el-dropdown-item" command="resetPwd">{text("重置密碼")}</RimoElement></RimoElement></>
                  }}><RimoElement kind="el-button" type="info" link={true} size="small">{text("\n                                                更多")}
<RimoElement kind="el-icon" className="el-icon--right"><RimoIcon name="ArrowDown" /></RimoElement></RimoElement></RimoElement></div></>
            }}></RimoElement></RimoElement>
<div className="p-3 border-t border-gray-100 flex justify-end bg-gray-50"><RimoElement kind="el-pagination" currentPage={view.currentPage} onCurrentPageChange={value => {
              model.write(["currentPage"], value);
            }} pageSize={view.pageSize} onPageSizeChange={value => {
              model.write(["pageSize"], value);
            }} pageSizes={[10, 20, 50]} total={view.filteredEmployees.length} small={true} background={true} layout="total, prev, pager, next"></RimoElement></div></div></div></div><RimoElement kind="el-dialog" modelValue={view.dialogVisible} onModelChange={value => {
      model.write(["dialogVisible"], value);
    }} title={view.isEdit ? '編輯員工' : '新增員工'} width="560px" destroyOnClose={true} className="employees-overlay" slots={{
      "footer": _slot => <><RimoElement kind="el-button" onClick={_event => {
          model.write(["dialogVisible"], false);
        }}>{text("取消")}</RimoElement>
<RimoElement kind="el-button" type="primary" onClick={event => {
          view.submitForm?.(event);
        }}>{text("確認")}</RimoElement></>
    }}>{() => <><RimoElement kind="el-form" model={view.employeeForm} rules={view.formRules} modelRef={model.ref("formRef")} labelPosition="top"><RimoElement kind="el-form-item" label="歸屬組織" prop="orgType" className="mb-6"><RimoElement kind="el-radio-group" modelValue={view.employeeForm.orgType} onModelChange={value => {
              model.write(["employeeForm", "orgType"], value);
            }} className="full-width-radio"><RimoElement kind="el-radio-button" label="HEADQUARTERS">{text("營運賬戶")}</RimoElement>
<RimoElement kind="el-radio-button" label="STORE">{text("車行賬戶")}</RimoElement></RimoElement></RimoElement>
<div className="mb-2 text-xs font-bold text-gray-400 uppercase tracking-wider">{text("基本信息")}</div>
<div className="bg-gray-50 p-4 rounded-lg mb-4 border border-gray-100"><RimoElement kind="el-row" gutter={20}><RimoElement kind="el-col" span={12}><RimoElement kind="el-form-item" label="姓名" prop="name"><RimoElement kind="el-input" modelValue={view.employeeForm.name} onModelChange={value => {
                    model.write(["employeeForm", "name"], value);
                  }} placeholder="請輸入姓名"></RimoElement></RimoElement></RimoElement>
<RimoElement kind="el-col" span={12}><RimoElement kind="el-form-item" label="電話" prop="phone"><RimoElement kind="el-input" modelValue={view.employeeForm.phone} onModelChange={value => {
                    model.write(["employeeForm", "phone"], value);
                  }} placeholder="請輸入電話"></RimoElement></RimoElement></RimoElement>
<RimoElement kind="el-col" span={24}><RimoElement kind="el-form-item" label="Email" prop="email" className="mb-0"><RimoElement kind="el-input" modelValue={view.employeeForm.email} onModelChange={value => {
                    model.write(["employeeForm", "email"], value);
                  }} placeholder="請輸入郵箱地址"></RimoElement></RimoElement></RimoElement></RimoElement></div>
<div className="mb-2 text-xs font-bold text-gray-400 uppercase tracking-wider">{text("職位與權限")}</div>
<div className="bg-gray-50 p-4 rounded-lg mb-4 border border-gray-100">{view.employeeForm.orgType === 'HEADQUARTERS' ? <><RimoElement kind="el-row" gutter={20}><RimoElement kind="el-col" span={24}><RimoElement kind="el-form-item" label="所屬部門" prop="departmentId"><RimoElement kind="el-select" modelValue={view.employeeForm.departmentId} onModelChange={value => {
                      model.write(["employeeForm", "departmentId"], value);
                    }} placeholder="請選擇部門" style={rimoStyle("width: 100%")}>{rimoEntries(view.sortedDepartments).map(([dept], _itemIndex) => <Fragment key={dept.id}><RimoElement kind="el-option" key={dept.id} label={dept.name} value={dept.id}></RimoElement></Fragment>)}</RimoElement></RimoElement></RimoElement>
<RimoElement kind="el-col" span={24}><RimoElement kind="el-form-item" label="角色" prop="roleId" className="mb-0"><RimoElement kind="el-select" modelValue={view.employeeForm.roleId} onModelChange={value => {
                      model.write(["employeeForm", "roleId"], value);
                    }} placeholder="請選擇角色" style={rimoStyle("width: 100%")}>{rimoEntries(view.roles).map(([role], _itemIndex) => <Fragment key={role.id}><RimoElement kind="el-option" key={role.id} label={role.name} value={role.id}></RimoElement></Fragment>)}</RimoElement></RimoElement></RimoElement></RimoElement></> : null}
{view.employeeForm.orgType === 'STORE' ? <><RimoElement kind="el-row" gutter={20}><RimoElement kind="el-col" span={24}><RimoElement kind="el-form-item" label="角色" prop="roleId"><RimoElement kind="el-select" modelValue={view.employeeForm.roleId} onModelChange={value => {
                      model.write(["employeeForm", "roleId"], value);
                    }} placeholder="請選擇角色" style={rimoStyle("width: 100%")}>{rimoEntries(view.roles).map(([role], _itemIndex) => <Fragment key={role.id}><RimoElement kind="el-option" key={role.id} label={role.name} value={role.id}></RimoElement></Fragment>)}</RimoElement></RimoElement></RimoElement>
<RimoElement kind="el-col" span={24}><RimoElement kind="el-form-item" label="車行/門店/站點" prop="orgCascaderValue" className="mb-0"><RimoElement kind="el-cascader" modelValue={view.employeeForm.orgCascaderValue} onModelChange={value => {
                      model.write(["employeeForm", "orgCascaderValue"], value);
                    }} options={view.providerTreeData} props={{
                      value: 'id',
                      label: 'label',
                      children: 'children',
                      checkStrictly: true
                    }} placeholder="請選擇隸屬車行/門店/站點" clearable={true} style={rimoStyle("width: 100%")}></RimoElement></RimoElement></RimoElement></RimoElement></> : null}</div>
<div className="mb-2 text-xs font-bold text-gray-400 uppercase tracking-wider">{text("賬號安全")}</div>
<div className="bg-gray-50 p-4 rounded-lg border border-gray-100"><RimoElement kind="el-row" gutter={20}><RimoElement kind="el-col" span={12}><RimoElement kind="el-form-item" label="賬號" prop="account"><RimoElement kind="el-input" modelValue={view.employeeForm.account} onModelChange={value => {
                    model.write(["employeeForm", "account"], value);
                  }} placeholder="登錄賬號" disabled={view.isEdit}></RimoElement></RimoElement></RimoElement>
<RimoElement kind="el-col" span={12}>{!view.isEdit ? <><RimoElement kind="el-form-item" label="密碼" prop="password"><RimoElement kind="el-input" modelValue={view.employeeForm.password} onModelChange={value => {
                      model.write(["employeeForm", "password"], value);
                    }} type="password" placeholder="設置密碼" showPassword={true}></RimoElement></RimoElement></> : <><RimoElement kind="el-form-item" label="密碼" className="mb-0"><RimoElement kind="el-button" size="small" link={true} type="primary" disabled={true}>{text("如需修改請點擊列表[重置密碼]")}</RimoElement></RimoElement></>}</RimoElement>
<RimoElement kind="el-col" span={24}><RimoElement kind="el-form-item" label="激活狀態" prop="status" className="mb-0"><div className="flex items-center justify-between w-full"><span className="text-xs text-gray-400">{text("關閉後員工將無法登錄系統")}</span>
<RimoElement kind="el-switch" modelValue={view.employeeForm.status} onModelChange={value => {
                      model.write(["employeeForm", "status"], value);
                    }} activeText="啓用" inactiveText="禁用"></RimoElement></div></RimoElement></RimoElement></RimoElement></div></RimoElement></>}</RimoElement>
<RimoElement kind="el-dialog" modelValue={view.resetPwdDialogVisible} onModelChange={value => {
      model.write(["resetPwdDialogVisible"], value);
    }} title="重置密碼" width="400px" className="employees-overlay" slots={{
      "footer": _slot => <><RimoElement kind="el-button" onClick={_event => {
          model.write(["resetPwdDialogVisible"], false);
        }}>{text("取消")}</RimoElement>
<RimoElement kind="el-button" type="primary" onClick={event => {
          view.confirmResetPassword?.(event);
        }}>{text("確認重置")}</RimoElement></>
    }}>{() => <><RimoElement kind="el-form" model={view.resetPwdForm} rules={view.resetPwdRules} modelRef={model.ref("resetPwdFormRef")} labelWidth="80px"><RimoElement kind="el-form-item" label="新密碼" prop="password"><RimoElement kind="el-input" modelValue={view.resetPwdForm.password} onModelChange={value => {
              model.write(["resetPwdForm", "password"], value);
            }} type="password" placeholder="請輸入新密碼 (至少8位，含字母和數字)" showPassword={true}></RimoElement></RimoElement>
<RimoElement kind="el-form-item" label="確認密碼" prop="confirmPassword"><RimoElement kind="el-input" modelValue={view.resetPwdForm.confirmPassword} onModelChange={value => {
              model.write(["resetPwdForm", "confirmPassword"], value);
            }} type="password" placeholder="請再次輸入新密碼" showPassword={true}></RimoElement></RimoElement></RimoElement></>}</RimoElement>
<RimoElement kind="el-dialog" modelValue={view.importDialogVisible} onModelChange={value => {
      model.write(["importDialogVisible"], value);
    }} title={view.importDialogTitle} width="480px" destroyOnClose={true} className="employees-overlay" slots={{
      "footer": _slot => <><RimoElement kind="el-button" onClick={_event => {
          model.write(["importDialogVisible"], false);
        }}>{text("取消")}</RimoElement>
<RimoElement kind="el-button" type="primary" onClick={event => {
          view.confirmImport?.(event);
        }}>{text("開始導入")}</RimoElement></>
    }}>{() => <><div className="mb-4 text-gray-600 text-sm"><p className="mb-2">{text("1. 請先下載導入模板，按標準模板格式填寫數據。")}</p>
<div className="mb-3 rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-blue-700"><div>{text("當前導入賬戶類型：")}
<span className="font-bold">{rimoText(view.importAccountTypeConfig?.label || '-')}</span></div>
<div className="text-xs mt-1">{text("將調用 ")}{rimoText(view.importAccountTypeConfig?.importApiName || '-')}{text("。")}</div></div>
<RimoElement kind="el-button" type="primary" plain={true} size="small" onClick={event => {
            view.downloadTemplate?.(event);
          }}><RimoElement kind="el-icon" className="mr-1"><RimoIcon name="Download" /></RimoElement>
{text(" 下載")}{rimoText(view.importAccountTypeConfig?.templateName || '規範表模板')}{text("\n                ")}</RimoElement></div>
<div className="border-t border-gray-100 pt-4 mt-4"><p className="mb-2 text-gray-600 text-sm">{text("2. 上傳填寫好的數據表格（支持 .xls, .xlsx 格式，單次最大支持 1000 條）。")}</p>
<RimoElement kind="el-upload" className="upload-demo" drag={true} action="#" autoUpload={false} onChange={view.handleFileChange} accept=".xls,.xlsx"><RimoElement kind="el-icon" className="el-icon--upload"><RimoIcon name="UploadFilled" /></RimoElement>
<div className="el-upload__text">{text("\n                        將文件推拽至此處，或 ")}
<em>{text("點擊上傳")}</em></div></RimoElement></div></>}</RimoElement>
<RimoElement kind="el-dialog" modelValue={view.deptDialogVisible} onModelChange={value => {
      model.write(["deptDialogVisible"], value);
    }} title={view.editingDept ? '編輯部門' : '新增部門'} width="360px" className="employees-overlay" slots={{
      "footer": _slot => <><RimoElement kind="el-button" onClick={_event => {
          model.write(["deptDialogVisible"], false);
        }}>{text("取消")}</RimoElement>
<RimoElement kind="el-button" type="primary" onClick={event => {
          view.saveDepartment?.(event);
        }}>{text("確認")}</RimoElement></>
    }}>{() => <><RimoElement kind="el-form" model={view.deptForm} labelWidth="80px"><RimoElement kind="el-form-item" label="部門名稱" required={true}><RimoElement kind="el-input" modelValue={view.deptForm.name} onModelChange={value => {
              model.write(["deptForm", "name"], value);
            }} placeholder="請輸入部門名稱"></RimoElement></RimoElement>
<RimoElement kind="el-form-item" label="排序"><RimoElement kind="el-input-number" modelValue={view.deptForm.sort} onModelChange={value => {
              model.write(["deptForm", "sort"], value);
            }} min={0} max={999}></RimoElement></RimoElement></RimoElement></>}</RimoElement></RimoRoot>;
}