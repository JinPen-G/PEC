import { downloadCsv } from '../../lib/rimo-data-tools.js';
export default function createPageState(model) {
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
      loading: message => ({
        close: model.notify('loading', message)
      }),
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
    const rows = ref([{
      id: 'RC001',
      code: 'RC-TPE-01',
      name: '臺北 RIMO 直營營運中心',
      legalName: '睿魔智慧科技有限公司',
      taxId: '24581267',
      storeCount: 1,
      stationCount: 2,
      vehicleCount: 45,
      contactName: '王雅婷',
      contactPhone: '02-2718-5200',
      email: 'ops.tpe@rimo.tw',
      isActive: true,
      remark: ''
    }, {
      id: 'RC002',
      code: 'RC-KM-01',
      name: '金門觀光合作伙伴',
      legalName: '金門晨峯租車有限公司',
      taxId: '53682741',
      storeCount: 2,
      stationCount: 2,
      vehicleCount: 38,
      contactName: '陳建宏',
      contactPhone: '082-330-889',
      email: 'kinmen@rimo.tw',
      isActive: true,
      remark: ''
    }, {
      id: 'RC003',
      code: 'RC-TYN-01',
      name: '桃園機場直營營運中心',
      legalName: '睿魔智慧科技有限公司桃園分處',
      taxId: '24581267',
      storeCount: 3,
      stationCount: 3,
      vehicleCount: 62,
      contactName: '林雅雯',
      contactPhone: '03-398-5200',
      email: 'tyn@rimo.tw',
      isActive: true,
      remark: ''
    }, {
      id: 'RC004',
      code: 'RC-TXG-01',
      name: '臺中都會合作伙伴',
      legalName: '臺中都會移動服務有限公司',
      taxId: '82745136',
      storeCount: 2,
      stationCount: 2,
      vehicleCount: 31,
      contactName: '張志明',
      contactPhone: '04-2258-1199',
      email: 'txg@rimo.tw',
      isActive: true,
      remark: ''
    }, {
      id: 'RC005',
      code: 'RC-KHH-01',
      name: '高雄港觀光合作伙伴',
      legalName: '南方港都租車有限公司',
      taxId: '71826345',
      storeCount: 0,
      stationCount: 0,
      vehicleCount: 0,
      contactName: '黃怡君',
      contactPhone: '07-536-2088',
      email: 'khh@rimo.tw',
      isActive: false,
      remark: '合作資料待補齊'
    }]);
    const filters = reactive({
      keyword: '',
      status: ''
    });
    const permissionDemoMode = ref('TENANT_MANAGE');
    const permissionDemoOptions = [{
      value: 'TENANT_MANAGE',
      label: '租戶級管理'
    }, {
      value: 'COMPANY_MANAGE',
      label: '車行級管理'
    }, {
      value: 'VIEW_ONLY',
      label: '僅查看'
    }];
    const scopedCompanyId = 'RC001';
    const activeSummaryFilter = ref('');
    const currentPage = ref(1);
    const pageSize = ref(10);
    const dialogVisible = ref(false);
    const editingId = ref('');
    const formRef = ref(null);
    const emptyForm = () => ({
      code: '',
      name: '',
      legalName: '',
      taxId: '',
      contactName: '',
      contactPhone: '',
      email: '',
      isActive: true,
      remark: ''
    });
    const form = reactive(emptyForm());
    const rules = {
      code: [{
        required: true,
        message: '請輸入車行編號',
        trigger: 'blur'
      }],
      name: [{
        required: true,
        message: '請輸入車行名稱',
        trigger: 'blur'
      }],
      legalName: [{
        required: true,
        message: '請輸入營運主體名稱',
        trigger: 'blur'
      }],
      taxId: [{
        required: true,
        message: '請輸入統一編號',
        trigger: 'blur'
      }],
      contactName: [{
        required: true,
        message: '請輸入負責人',
        trigger: 'blur'
      }],
      contactPhone: [{
        required: true,
        message: '請輸入聯繫電話',
        trigger: 'blur'
      }]
    };
    const canCreateCompany = computed(() => permissionDemoMode.value === 'TENANT_MANAGE');
    const canManageRow = row => permissionDemoMode.value === 'TENANT_MANAGE' || permissionDemoMode.value === 'COMPANY_MANAGE' && row.id === scopedCompanyId;
    const permissionScopedRows = computed(() => permissionDemoMode.value === 'COMPANY_MANAGE' ? rows.value.filter(row => row.id === scopedCompanyId) : rows.value);
    const summaryCards = computed(() => [{
      key: 'ALL',
      label: '車行總數',
      value: permissionScopedRows.value.length
    }, {
      key: 'ACTIVE',
      label: '營運中',
      value: permissionScopedRows.value.filter(item => item.isActive).length
    }, {
      key: 'INACTIVE',
      label: '已停用',
      value: permissionScopedRows.value.filter(item => !item.isActive).length
    }, {
      key: 'NO_STORE',
      label: '未配置門市',
      value: permissionScopedRows.value.filter(item => item.storeCount === 0).length
    }]);
    const filteredRows = computed(() => permissionScopedRows.value.filter(row => {
      const keyword = filters.keyword.trim().toLowerCase();
      if (keyword && ![row.code, row.name, row.legalName, row.taxId, row.contactName].some(value => String(value || '').toLowerCase().includes(keyword))) return false;
      if (filters.status === 'ACTIVE' && !row.isActive) return false;
      if (filters.status === 'INACTIVE' && row.isActive) return false;
      if (activeSummaryFilter.value === 'ACTIVE' && !row.isActive) return false;
      if (activeSummaryFilter.value === 'INACTIVE' && row.isActive) return false;
      if (activeSummaryFilter.value === 'NO_STORE' && row.storeCount !== 0) return false;
      return true;
    }));
    const pagedRows = computed(() => {
      const start = (currentPage.value - 1) * pageSize.value;
      return filteredRows.value.slice(start, start + pageSize.value);
    });
    watch(filteredRows, () => {
      currentPage.value = 1;
    });
    const applySummaryFilter = key => {
      activeSummaryFilter.value = activeSummaryFilter.value === key ? '' : key;
    };
    const resetFilters = () => {
      filters.keyword = '';
      filters.status = '';
      activeSummaryFilter.value = '';
    };
    const setPermissionDemoMode = mode => {
      permissionDemoMode.value = mode;
      resetFilters();
      currentPage.value = 1;
      dialogVisible.value = false;
    };
    const openDialog = row => {
      if (!row && !canCreateCompany.value) {
        feedback.ElMessage.warning('當前權限不能新增車行');
        return;
      }
      if (row && !canManageRow(row)) {
        feedback.ElMessage.warning('當前權限只能查看該車行');
        return;
      }
      editingId.value = row ? row.id : '';
      Object.assign(form, row ? {
        ...row
      } : emptyForm());
      dialogVisible.value = true;
    };
    const save = async () => {
      const editingRow = editingId.value ? rows.value.find(item => item.id === editingId.value) : null;
      if (!editingId.value && !canCreateCompany.value || editingId.value && (!editingRow || !canManageRow(editingRow))) {
        feedback.ElMessage.error('當前權限不能保存車行資料');
        dialogVisible.value = false;
        return;
      }
      const valid = await formRef.value?.validate().catch(() => false);
      if (!valid) return;
      if (!editingId.value && rows.value.some(item => item.code === form.code)) {
        feedback.ElMessage.error('車行編號已存在');
        return;
      }
      if (rows.value.some(item => item.id !== editingId.value && item.name.trim() === form.name.trim())) { feedback.ElMessage.error('車行名稱已存在'); return; }
      if (editingRow && form.code !== editingRow.code) { feedback.ElMessage.error('車行編號建立後不可修改'); return; }
      if (editingId.value) {
        const index = rows.value.findIndex(item => item.id === editingId.value);
        rows.value[index] = {
          ...rows.value[index],
          ...form
        };
      } else {
        rows.value.unshift({
          id: 'RC' + String(rows.value.length + 1).padStart(3, '0'),
          ...form,
          storeCount: 0,
          stationCount: 0,
          vehicleCount: 0
        });
      }
      dialogVisible.value = false;
      feedback.ElMessage.success('車行資料已保存');
    };
    const changeStatus = async (row, value) => {
      if (!canManageRow(row)) {
        row.isActive = !value;
        feedback.ElMessage.warning('當前權限不能變更車行狀態');
        return;
      }
      if (value) {
        feedback.ElMessage.success('車行已啓用');
        return;
      }
      try {
        await feedback.ElMessageBox.confirm('停用後，下屬門市和據點不再參與新預約與新訂單，已有訂單繼續履約。確認停用？', '停用車行', {
          type: 'warning',
          confirmButtonText: '確認停用',
          cancelButtonText: '取消'
        });
        feedback.ElMessage.success('車行已停用');
      } catch {
        row.isActive = !value;
      }
    };
    const exportData = () => downloadCsv('rental-companies.csv', [
      ['code', '車行編號'], ['name', '車行名稱'], ['legalName', '營運主體'], ['taxId', '統一編號'], ['storeCount', '門市數'], ['stationCount', '據點數'], ['vehicleCount', '車輛數'], ['contactName', '負責人'], ['contactPhone', '電話'], ['email', 'Email'], ['isActive', '啓用'], ['remark', '備註'],
    ].map(([key, label]) => ({ key, label })), filteredRows.value);
    return {
      rows,
      filters,
      permissionDemoMode,
      permissionDemoOptions,
      canCreateCompany,
      canManageRow,
      activeSummaryFilter,
      summaryCards,
      filteredRows,
      pagedRows,
      currentPage,
      pageSize,
      dialogVisible,
      editingId,
      formRef,
      form,
      rules,
      applySummaryFilter,
      resetFilters,
      setPermissionDemoMode,
      openDialog,
      save,
      changeStatus,
      exportData,
      ElMessage: feedback.ElMessage,
      ElMessageBox: feedback.ElMessageBox,
      scopedCompanyId,
      emptyForm,
      permissionScopedRows
    };
  }
  return pageSetup();
}
