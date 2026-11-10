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
    const companies = ref([{
      value: 'RC001',
      label: '臺北 RIMO 直營營運中心',
      isActive: true
    }, {
      value: 'RC002',
      label: '金門觀光合作伙伴',
      isActive: true
    }, {
      value: 'RC003',
      label: '桃園機場直營營運中心',
      isActive: true
    }, {
      value: 'RC004',
      label: '臺中都會合作伙伴',
      isActive: true
    }, {
      value: 'RC005',
      label: '高雄港觀光合作伙伴',
      isActive: false
    }]);
    const t = (h, m = 0) => new Date(2000, 0, 1, h, m);
    const rows = ref([{
      id: 'ST001',
      code: 'ST-TPE-001',
      companyId: 'RC001',
      name: '松山機場門市',
      address: '臺北市松山區敦化北路 340-9 號',
      counterServiceHours: [t(8), t(20)],
      storeRentalStatus: 'ACTIVE',
      manualHandover: true,
      manualInspection: true,
      rentalStationCount: 1,
      selfServiceStationCount: 1,
      contactName: '陳雅雯',
      contactPhone: '02-2712-8899',
      isActive: true,
      remark: ''
    }, {
      id: 'ST002',
      code: 'ST-KM-001',
      companyId: 'RC002',
      name: '左營高鐵門市',
      address: '高雄市左營區站前北路 88 號',
      counterServiceHours: [t(8, 30), t(19)],
      storeRentalStatus: 'ACTIVE',
      manualHandover: true,
      manualInspection: true,
      rentalStationCount: 1,
      selfServiceStationCount: 1,
      contactName: '林柏翰',
      contactPhone: '07-588-1028',
      isActive: true,
      remark: ''
    }, {
      id: 'ST003',
      code: 'ST-KM-002',
      companyId: 'RC002',
      name: '水頭碼頭門市',
      address: '金門縣金城鎮西海路一段 5 號',
      counterServiceHours: [t(9), t(18)],
      storeRentalStatus: 'SUSPENDED',
      manualHandover: true,
      manualInspection: true,
      rentalStationCount: 0,
      selfServiceStationCount: 1,
      contactName: '許佩珊',
      contactPhone: '082-325-778',
      isActive: true,
      remark: '門市租車籌備中'
    }, {
      id: 'ST004',
      code: 'ST-TYN-001',
      companyId: 'RC003',
      name: '桃園機場第一航廈門市',
      address: '桃園市大園區航站南路 15 號',
      counterServiceHours: [t(6), t(23)],
      storeRentalStatus: 'ACTIVE',
      manualHandover: true,
      manualInspection: true,
      rentalStationCount: 1,
      selfServiceStationCount: 1,
      contactName: '王志豪',
      contactPhone: '03-398-3366',
      isActive: true,
      remark: ''
    }, {
      id: 'ST005',
      code: 'ST-TYN-002',
      companyId: 'RC003',
      name: '桃園機場第二航廈門市',
      address: '桃園市大園區航站南路 9 號',
      counterServiceHours: [t(6), t(23)],
      storeRentalStatus: 'ACTIVE',
      manualHandover: true,
      manualInspection: true,
      rentalStationCount: 1,
      selfServiceStationCount: 0,
      contactName: '吳佳玲',
      contactPhone: '03-398-2277',
      isActive: true,
      remark: ''
    }, {
      id: 'ST006',
      code: 'ST-TXG-001',
      companyId: 'RC004',
      name: '臺中高鐵門市',
      address: '臺中市烏日區站區二路 8 號',
      counterServiceHours: [t(8), t(21)],
      storeRentalStatus: 'ACTIVE',
      manualHandover: true,
      manualInspection: true,
      rentalStationCount: 1,
      selfServiceStationCount: 0,
      contactName: '張志明',
      contactPhone: '04-3601-5000',
      isActive: true,
      remark: ''
    }, {
      id: 'ST007',
      code: 'ST-KHH-001',
      companyId: 'RC005',
      name: '高雄港服務門市',
      address: '高雄市鼓山區蓬萊路 10 號',
      counterServiceHours: [t(9), t(18)],
      storeRentalStatus: 'SUSPENDED',
      manualHandover: true,
      manualInspection: true,
      rentalStationCount: 0,
      selfServiceStationCount: 0,
      contactName: '黃怡君',
      contactPhone: '07-536-2088',
      isActive: false,
      remark: '隨所屬車行停用'
    }]);
    const companyOptions = computed(() => companies.value.map(item => ({
      label: item.label,
      value: item.value
    })));
    const permissionDemoMode = ref('TENANT_MANAGE');
    const permissionDemoOptions = [{
      value: 'TENANT_MANAGE',
      label: '租戶級管理'
    }, {
      value: 'COMPANY_MANAGE',
      label: '車行級管理'
    }, {
      value: 'STORE_MANAGE',
      label: '門市級管理'
    }, {
      value: 'VIEW_ONLY',
      label: '僅查看'
    }];
    const scopedCompanyId = 'RC001';
    const scopedStoreId = 'ST001';
    const editableCompanyOptions = computed(() => companies.value.filter(item => item.isActive && (permissionDemoMode.value === 'TENANT_MANAGE' || item.value === scopedCompanyId)).map(item => ({
      label: item.label,
      value: item.value
    })));
    const filters = reactive({
      keyword: '',
      companyId: '',
      storeRentalStatus: '',
      status: ''
    });
    const activeSummaryFilter = ref('');
    const currentPage = ref(1);
    const pageSize = ref(10);
    const dialogVisible = ref(false);
    const editingId = ref('');
    const formRef = ref(null);
    const emptyForm = () => ({
      companyId: '',
      code: '',
      name: '',
      address: '',
      contactName: '',
      contactPhone: '',
      counterServiceHours: [t(8), t(20)],
      storeRentalStatus: 'ACTIVE',
      manualHandover: true,
      manualInspection: true,
      isActive: true,
      remark: ''
    });
    const form = reactive(emptyForm());
    const rules = {
      companyId: [{
        required: true,
        message: '請選擇所屬車行',
        trigger: 'change'
      }],
      code: [{
        required: true,
        message: '請輸入門市編號',
        trigger: 'blur'
      }],
      name: [{
        required: true,
        message: '請輸入門市名稱',
        trigger: 'blur'
      }],
      address: [{
        required: true,
        message: '請輸入門市地址',
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
      }],
      counterServiceHours: [{
        required: true,
        message: '請選擇櫃檯服務時間',
        trigger: 'change'
      }]
    };
    const getCompany = id => companies.value.find(item => item.value === id);
    const getCompanyName = id => getCompany(id)?.label || '-';
    const isStoreSellable = row => !!getCompany(row.companyId)?.isActive && row.isActive && row.storeRentalStatus === 'ACTIVE' && row.rentalStationCount > 0;
    const canCreateStore = computed(() => ['TENANT_MANAGE', 'COMPANY_MANAGE'].includes(permissionDemoMode.value));
    const canManageRow = row => permissionDemoMode.value === 'TENANT_MANAGE' || permissionDemoMode.value === 'COMPANY_MANAGE' && row.companyId === scopedCompanyId || permissionDemoMode.value === 'STORE_MANAGE' && row.id === scopedStoreId;
    const permissionScopedRows = computed(() => {
      if (permissionDemoMode.value === 'COMPANY_MANAGE') return rows.value.filter(row => row.companyId === scopedCompanyId);
      if (permissionDemoMode.value === 'STORE_MANAGE') return rows.value.filter(row => row.id === scopedStoreId);
      return rows.value;
    });
    const permissionScopeText = computed(() => permissionDemoMode.value === 'STORE_MANAGE' ? '當前門市：' + (rows.value.find(row => row.id === scopedStoreId)?.name || '-') : '當前車行：' + getCompanyName(scopedCompanyId));
    const summaryCards = computed(() => [{
      key: 'ALL',
      label: '門市總數',
      value: permissionScopedRows.value.length
    }, {
      key: 'SELLABLE',
      label: '門市租車可預約',
      value: permissionScopedRows.value.filter(isStoreSellable).length
    }, {
      key: 'SUSPENDED',
      label: '門市租車已暫停',
      value: permissionScopedRows.value.filter(item => item.storeRentalStatus === 'SUSPENDED').length
    }, {
      key: 'NO_STATION',
      label: '未配置履約據點',
      value: permissionScopedRows.value.filter(item => item.rentalStationCount === 0).length
    }]);
    const filteredRows = computed(() => permissionScopedRows.value.filter(row => {
      const keyword = filters.keyword.trim().toLowerCase();
      if (keyword && ![row.code, row.name, row.address, row.contactName].some(value => String(value || '').toLowerCase().includes(keyword))) return false;
      if (filters.companyId && row.companyId !== filters.companyId) return false;
      if (filters.storeRentalStatus && row.storeRentalStatus !== filters.storeRentalStatus) return false;
      if (filters.status === 'ACTIVE' && !row.isActive) return false;
      if (filters.status === 'INACTIVE' && row.isActive) return false;
      if (activeSummaryFilter.value === 'SELLABLE' && !isStoreSellable(row)) return false;
      if (activeSummaryFilter.value === 'SUSPENDED' && row.storeRentalStatus !== 'SUSPENDED') return false;
      if (activeSummaryFilter.value === 'NO_STATION' && row.rentalStationCount !== 0) return false;
      return true;
    }));
    const pagedRows = computed(() => {
      const start = (currentPage.value - 1) * pageSize.value;
      return filteredRows.value.slice(start, start + pageSize.value);
    });
    watch(filteredRows, () => {
      currentPage.value = 1;
    });
    const formatTimeRange = range => {
      const format = value => String(value.getHours()).padStart(2, '0') + ':' + String(value.getMinutes()).padStart(2, '0');
      return Array.isArray(range) && range.length === 2 ? format(range[0]) + '-' + format(range[1]) : '-';
    };
    const applySummaryFilter = key => {
      activeSummaryFilter.value = activeSummaryFilter.value === key ? '' : key;
    };
    const resetFilters = () => {
      Object.assign(filters, {
        keyword: '',
        companyId: '',
        storeRentalStatus: '',
        status: ''
      });
      activeSummaryFilter.value = '';
    };
    const setPermissionDemoMode = mode => {
      permissionDemoMode.value = mode;
      resetFilters();
      currentPage.value = 1;
      dialogVisible.value = false;
    };
    const openDialog = row => {
      if (!row && !canCreateStore.value) {
        feedback.ElMessage.warning('當前權限不能新增門市');
        return;
      }
      if (row && !canManageRow(row)) {
        feedback.ElMessage.warning('當前權限只能查看該門市');
        return;
      }
      editingId.value = row ? row.id : '';
      const payload = row ? {
        ...row,
        counterServiceHours: row.counterServiceHours.map(value => new Date(value))
      } : emptyForm();
      if (!row && permissionDemoMode.value === 'COMPANY_MANAGE') payload.companyId = scopedCompanyId;
      Object.assign(form, payload);
      dialogVisible.value = true;
    };
    const save = async () => {
      const editingRow = editingId.value ? rows.value.find(item => item.id === editingId.value) : null;
      if (!editingId.value && !canCreateStore.value || editingId.value && (!editingRow || !canManageRow(editingRow))) {
        feedback.ElMessage.error('當前權限不能保存門市資料');
        dialogVisible.value = false;
        return;
      }
      if (permissionDemoMode.value === 'COMPANY_MANAGE') form.companyId = scopedCompanyId;
      const valid = await formRef.value?.validate().catch(() => false);
      if (!valid) return;
      if (!editingId.value && rows.value.some(item => item.code === form.code)) {
        feedback.ElMessage.error('門市編號已存在');
        return;
      }
      if (editingRow && (form.code !== editingRow.code || form.companyId !== editingRow.companyId)) { feedback.ElMessage.error('門市編號與所屬車行建立後不可修改'); return; }
      if (!getCompany(form.companyId)?.isActive && form.isActive) {
        feedback.ElMessage.error('所屬車行已停用，門市不能設爲啓用');
        return;
      }
      if (editingId.value) {
        const index = rows.value.findIndex(item => item.id === editingId.value);
        rows.value[index] = {
          ...rows.value[index],
          ...form,
          counterServiceHours: form.counterServiceHours.map(value => new Date(value))
        };
      } else {
        rows.value.unshift({
          id: 'ST' + String(rows.value.length + 1).padStart(3, '0'),
          ...form,
          counterServiceHours: form.counterServiceHours.map(value => new Date(value)),
          rentalStationCount: 0,
          selfServiceStationCount: 0
        });
      }
      dialogVisible.value = false;
      feedback.ElMessage.success('門市資料已保存');
    };
    const changeStatus = async (row, value) => {
      if (!canManageRow(row)) {
        row.isActive = !value;
        feedback.ElMessage.warning('當前權限不能變更門市狀態');
        return;
      }
      if (value && !getCompany(row.companyId)?.isActive) {
        row.isActive = false;
        feedback.ElMessage.error('所屬車行已停用，不能啓用該門市');
        return;
      }
      if (value) {
        feedback.ElMessage.success('門市已啓用');
        return;
      }
      try {
        await feedback.ElMessageBox.confirm('停用後，該門市及所屬據點不再參與新預約與新訂單，已有訂單繼續履約。確認停用？', '停用門市', {
          type: 'warning',
          confirmButtonText: '確認停用',
          cancelButtonText: '取消'
        });
        feedback.ElMessage.success('門市已停用');
      } catch {
        row.isActive = !value;
      }
    };
    const exportData = () => downloadCsv('stores.csv', [
      ...[['code', '門市編號'], ['name', '門市名稱'], ['address', '地址'], ['storeRentalStatus', '門市租車'], ['manualHandover', '人工交還車'], ['manualInspection', '人工驗車'], ['rentalStationCount', '履約據點'], ['selfServiceStationCount', '自助據點'], ['contactName', '負責人'], ['contactPhone', '電話'], ['isActive', '啓用'], ['remark', '備註']].map(([key, label]) => ({ key, label })),
      { label: '所屬車行', read: row => getCompanyName(row.companyId) }, { label: '櫃檯服務時間', read: row => formatTimeRange(row.counterServiceHours) }, { label: '當前可售', read: isStoreSellable },
    ], filteredRows.value);
    return {
      rows,
      companyOptions,
      editableCompanyOptions,
      filters,
      permissionDemoMode,
      permissionDemoOptions,
      permissionScopeText,
      canCreateStore,
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
      getCompanyName,
      isStoreSellable,
      formatTimeRange,
      applySummaryFilter,
      resetFilters,
      setPermissionDemoMode,
      openDialog,
      save,
      changeStatus,
      exportData,
      ElMessage: feedback.ElMessage,
      ElMessageBox: feedback.ElMessageBox,
      companies,
      t,
      scopedCompanyId,
      scopedStoreId,
      emptyForm,
      getCompany,
      permissionScopedRows
    };
  }
  return pageSetup();
}
