export default function createPageState(model) {
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
      derived: computed,
      record: reactive,
      onMount: _onMounted
    } = model;
    const orgData = [{
      value: 'city-tpe',
      label: '臺北市',
      disabled: true,
      children: [{
        value: 's-1',
        label: '臺北車站門市 (所有)'
      }, {
        value: 's-2',
        label: '松山機場門市 (單向)'
      }, {
        value: 's-3',
        label: '信義CBD網點 (同站)'
      }]
    }, {
      value: 'city-khh',
      label: '高雄市',
      disabled: true,
      children: [{
        value: 's-4',
        label: '左營高鐵站門市'
      }, {
        value: 's-5',
        label: '駁二藝術特區中心'
      }]
    }];
    const allVehicles = ref([{
      id: 1,
      licensePlate: 'RAB-1234',
      model: 'Model 3',
      currentStationId: 's-1',
      currentServiceType: 'SHARING_SAME',
      status: 'IDLE',
      isTransferring: false
    }, {
      id: 2,
      licensePlate: 'RDZ-5566',
      model: 'Model 3',
      currentStationId: 's-3',
      currentServiceType: 'SHARING_SAME',
      status: 'IDLE',
      isTransferring: false
    }, {
      id: 3,
      licensePlate: 'TCD-9900',
      model: 'Toyota Alphard',
      currentStationId: 's-2',
      currentServiceType: 'SHARING_ONE_WAY',
      status: 'IDLE',
      isTransferring: false
    }, {
      id: 4,
      licensePlate: 'REN-8888',
      model: 'Porsche Macan',
      currentStationId: 's-4',
      currentServiceType: 'STORE_STANDARD',
      status: 'USED',
      isTransferring: false
    }, {
      id: 5,
      licensePlate: 'EAB-1234',
      model: 'Model Y',
      currentStationId: 's-5',
      currentServiceType: 'SHARING_SAME',
      status: 'IDLE',
      isTransferring: false
    }]);
    const filters = reactive({
      keyword: '',
      stationId: '',
      serviceType: ''
    });
    const resetFilters = () => {
      filters.keyword = '';
      filters.stationId = '';
      filters.serviceType = '';
    };
    const filteredVehicles = computed(() => {
      return allVehicles.value.filter(v => {
        if (filters.keyword && !v.licensePlate.includes(filters.keyword) && !v.model.includes(filters.keyword)) return false;
        if (filters.stationId && v.currentStationId !== filters.stationId) return false;
        if (filters.serviceType && v.currentServiceType !== filters.serviceType) return false;
        return true;
      });
    });
    const selectedVehicles = ref([]);
    const handleSelectionChange = val => {
      selectedVehicles.value = val;
    };
    const getStationName = id => {
      if (!id) return '未知站點';
      for (const city of orgData) {
        const s = city.children?.find(c => c.value === id);
        if (s) return s.label;
      }
      return id;
    };
    const getServiceName = type => {
      const map = {
        'SHARING_SAME': '同站租還',
        'SHARING_ONE_WAY': '甲租乙還',
        'STORE_STANDARD': '門市租賃',
        'STORE_24H': '24H門市'
      };
      return map[type] || type;
    };
    const getServiceTagType = type => {
      if (type === 'SHARING_SAME') return 'success';
      if (type === 'SHARING_ONE_WAY') return 'warning';
      return 'primary';
    };
    const transferDrawerVisible = ref(false);
    const transferList = ref([]);
    const bulkConfig = reactive({
      serviceType: '',
      stationId: ''
    });
    const isSubmitting = ref(false);
    const drawerTitle = computed(() => {
      return transferList.value.length > 1 ? `批量車輛調撥與服務切換` : `單車快捷調撥`;
    });
    const buildTransferItem = vehicle => {
      return {
        vehicle,
        targetServiceType: vehicle.currentServiceType,
        targetStationId: vehicle.currentStationId
      };
    };
    const openSingleTransfer = row => {
      transferList.value = [buildTransferItem(row)];
      bulkConfig.serviceType = '';
      bulkConfig.stationId = '';
      transferDrawerVisible.value = true;
    };
    const openBatchTransferDrawer = () => {
      transferList.value = selectedVehicles.value.map(v => buildTransferItem(v));
      bulkConfig.serviceType = '';
      bulkConfig.stationId = '';
      transferDrawerVisible.value = true;
    };
    const handleDrawerClose = done => {
      done();
    };
    const isServiceTypeChanged = item => item.targetServiceType !== item.vehicle.currentServiceType;
    const isStationChanged = item => item.targetStationId !== item.vehicle.currentStationId;
    const hasChanges = item => isServiceTypeChanged(item) || isStationChanged(item);
    const changedVehicleCount = computed(() => transferList.value.filter(hasChanges).length);
    const isAllValid = computed(() => transferList.value.every(item => item.targetStationId));
    const applyBulkConfig = () => {
      transferList.value.forEach(item => {
        if (bulkConfig.serviceType) item.targetServiceType = bulkConfig.serviceType;
        if (bulkConfig.stationId) item.targetStationId = bulkConfig.stationId;
      });
    };
    const submitTransfer = () => {
      isSubmitting.value = true;
      window.setTimeout(() => {
        transferList.value.forEach(item => {
          if (hasChanges(item)) {
            item.vehicle.currentServiceType = item.targetServiceType;
            item.vehicle.currentStationId = item.targetStationId;
          }
        });
        isSubmitting.value = false;
        transferDrawerVisible.value = false;
        feedback.ElMessage.success({
          message: `成功執行調撥任務`,
          offset: 50
        });
      }, 1000);
    };
    const onBulkServiceTypeChange = () => {
      bulkConfig.stationId = '';
    };
    return {
      orgData,
      filters,
      resetFilters,
      filteredVehicles,
      selectedVehicles,
      handleSelectionChange,
      getStationName,
      getServiceName,
      getServiceTagType,
      transferDrawerVisible,
      drawerTitle,
      transferList,
      bulkConfig,
      isSubmitting,
      openSingleTransfer,
      openBatchTransferDrawer,
      handleDrawerClose,
      isServiceTypeChanged,
      isStationChanged,
      hasChanges,
      changedVehicleCount,
      isAllValid,
      applyBulkConfig,
      submitTransfer,
      allVehicles,
      buildTransferItem,
      onBulkServiceTypeChange
    };
  }
  return pageSetup();
}
