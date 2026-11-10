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
      onMount: onMounted,
      onDispose: onBeforeUnmount
    } = model;
    const {
      ElMessage: _ElMessage,
      ElMessageBox: _ElMessageBox
    } = feedback;
    const orgData = ref([{
      id: 'C1',
      label: 'RIMO 臺灣直營車行',
      value: 'C1',
      children: [{
        id: 'S1',
        label: '臺北松山機場旗艦店',
        value: 'S1',
        children: [{
          id: '1',
          label: '臺北松山機場第一停車場',
          value: '1'
        }, {
          id: '2',
          label: '民生敦北自助取還區',
          value: '2'
        }]
      }, {
        id: 'S2',
        label: '新北板橋旗艦店',
        value: 'S2',
        children: [{
          id: '3',
          label: '板橋車站 B1 停車區',
          value: '3'
        }]
      }]
    }, {
      id: 'C2',
      label: '晨峯租車合作車行',
      value: 'C2',
      children: [{
        id: 'S3',
        label: '臺中高鐵站門市',
        value: 'S3',
        children: [{
          id: '4',
          label: '臺中高鐵 P1 停車區',
          value: '4'
        }]
      }, {
        id: 'S4',
        label: '高雄左營高鐵門市',
        value: 'S4',
        children: [{
          id: '5',
          label: '左營高鐵彩虹市集停車區',
          value: '5'
        }]
      }]
    }, {
      id: 'C3',
      label: '海嶽租車合作車行',
      value: 'C3',
      children: [{
        id: 'S5',
        label: '桃園青埔門市',
        value: 'S5',
        children: [{
          id: '6',
          label: '桃園高鐵站前停車區',
          value: '6'
        }]
      }]
    }]);
    const groupsData = ref([{
      id: 'G1',
      vehicleType: 'car',
      brand: 'Toyota',
      model: 'Corolla Cross',
      year: '2024',
      defaultPhotoUrl: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?q=80&w=500&auto=format&fit=crop'
    }, {
      id: 'G2',
      vehicleType: 'car',
      brand: 'Lexus',
      model: 'UX 300e',
      year: '2024',
      defaultPhotoUrl: 'https://images.unsplash.com/photo-1550355291-bbee04a92027?q=80&w=500&auto=format&fit=crop'
    }, {
      id: 'G3',
      vehicleType: 'motorcycle',
      brand: 'Yamaha',
      model: 'XMAX 300',
      year: '2023',
      defaultPhotoUrl: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?q=80&w=500&auto=format&fit=crop'
    }, {
      id: 'G4',
      vehicleType: 'motorcycle',
      brand: 'Gogoro',
      model: 'SuperSport',
      year: '2024',
      defaultPhotoUrl: 'https://images.unsplash.com/photo-1517846693594-1567da72af75?q=80&w=500&auto=format&fit=crop'
    }, {
      id: 'G5',
      vehicleType: 'microElectric',
      brand: 'RIMO',
      model: 'Mini EV',
      year: '2024',
      defaultPhotoUrl: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?q=80&w=500&auto=format&fit=crop'
    }]);
    const vehicles = ref([{
      id: 'V1',
      licensePlate: 'BKA-1023',
      vin: 'AHTLB3JE0R0001234',
      vehicleGroupId: 'G1',
      color: '珍珠白',
      year: '2024',
      mileage: 12850,
      operationStatus: 'IDLE',
      enabled: true,
      assetCompanyId: 'C1',
      storeId: 'S1',
      stationId: '1',
      serviceTypes: ['SHARING_SAME', 'STORE_STANDARD'],
      currentServiceType: 'STORE_STANDARD',
      customPhotoUrl: '',
      seats: 5,
      doors: 5,
      fuelType: 'GASOLINE',
      transmission: 'AT',
      luggageLarge: 2,
      luggageSmall: 2,
      isDomestic: true,
      source: 'PURCHASE',
      owner: 'RIMO 臺灣直營車隊',
      vehicleType: 'car'
    }, {
      id: 'V2',
      licensePlate: 'BQT-5816',
      vin: 'JTHC65BH0R2005678',
      vehicleGroupId: 'G2',
      color: '曜石黑',
      year: '2024',
      mileage: 5300,
      operationStatus: 'RENTED',
      enabled: true,
      assetCompanyId: 'C1',
      storeId: 'S2',
      stationId: '3',
      serviceTypes: ['STORE_STANDARD', 'STORE_24H'],
      currentServiceType: 'STORE_STANDARD',
      customPhotoUrl: '',
      seats: 5,
      doors: 5,
      fuelType: 'ELECTRIC',
      transmission: 'AT',
      luggageLarge: 2,
      luggageSmall: 1,
      isDomestic: false,
      source: 'PURCHASE',
      owner: 'RIMO 臺灣直營車隊',
      vehicleType: 'car'
    }, {
      id: 'V3',
      licensePlate: 'BCP-7315',
      vin: 'JTMBW3FV0R1009012',
      vehicleGroupId: 'G1',
      color: '雲河灰',
      year: '2024',
      mileage: 26800,
      operationStatus: 'MAINTENANCE',
      enabled: true,
      assetCompanyId: 'C2',
      storeId: 'S3',
      stationId: '4',
      serviceTypes: ['SHARING_ONE_WAY', 'STORE_STANDARD'],
      currentServiceType: 'STORE_STANDARD',
      customPhotoUrl: '',
      seats: 5,
      doors: 5,
      fuelType: 'GASOLINE',
      transmission: 'AT',
      luggageLarge: 1,
      luggageSmall: 2,
      isDomestic: true,
      source: 'LEASE',
      owner: '晨峯租車',
      vehicleType: 'car'
    }, {
      id: 'V4',
      licensePlate: 'NWM-2288',
      vin: 'RKRSG4220PA001122',
      vehicleGroupId: 'G3',
      color: '消光藍',
      year: '2023',
      mileage: 4200,
      operationStatus: 'IDLE',
      enabled: true,
      assetCompanyId: 'C2',
      storeId: 'S4',
      stationId: '5',
      serviceTypes: ['STORE_STANDARD', 'SHARING_SAME'],
      currentServiceType: 'STORE_STANDARD',
      customPhotoUrl: '',
      seats: 2,
      doors: 0,
      fuelType: 'GASOLINE',
      transmission: 'AT',
      luggageLarge: 0,
      luggageSmall: 1,
      isDomestic: false,
      source: 'AFFILIATE',
      owner: '晨峯租車',
      vehicleType: 'motorcycle'
    }, {
      id: 'V5',
      licensePlate: 'PJF-9091',
      vin: 'GGRSS0010RA003344',
      vehicleGroupId: 'G4',
      color: '星宇灰',
      year: '2024',
      mileage: 3500,
      operationStatus: 'RENTED',
      enabled: false,
      assetCompanyId: 'C3',
      storeId: 'S5',
      stationId: '6',
      serviceTypes: ['STORE_STANDARD'],
      currentServiceType: 'STORE_STANDARD',
      customPhotoUrl: '',
      seats: 1,
      doors: 0,
      fuelType: 'ELECTRIC',
      transmission: 'AT',
      luggageLarge: 0,
      luggageSmall: 0,
      isDomestic: true,
      source: 'TRUST',
      owner: '海嶽租車',
      vehicleType: 'motorcycle'
    }, {
      id: 'V6',
      licensePlate: 'BER-6024',
      vin: 'AHTLB3JE0R0007788',
      vehicleGroupId: 'G1',
      color: '鈦銀',
      year: '2024',
      mileage: 8900,
      operationStatus: 'IDLE',
      enabled: true,
      assetCompanyId: 'C1',
      storeId: 'S1',
      stationId: '2',
      serviceTypes: ['STORE_STANDARD', 'STORE_24H'],
      currentServiceType: 'STORE_24H',
      customPhotoUrl: '',
      seats: 5,
      doors: 5,
      fuelType: 'GASOLINE',
      transmission: 'AT',
      luggageLarge: 2,
      luggageSmall: 2,
      isDomestic: true,
      source: 'PURCHASE',
      owner: 'RIMO 臺灣直營車隊',
      vehicleType: 'car'
    }, {
      id: 'V7',
      licensePlate: 'MEV-0528',
      vin: 'MEV202405280001',
      vehicleGroupId: 'G5',
      color: '海灣藍',
      year: '2024',
      mileage: 760,
      operationStatus: 'IDLE',
      enabled: true,
      assetCompanyId: 'C1',
      storeId: 'S1',
      stationId: '1',
      serviceTypes: ['SHARING_SAME'],
      currentServiceType: 'SHARING_SAME',
      customPhotoUrl: '',
      seats: 2,
      doors: 2,
      fuelType: 'ELECTRIC',
      transmission: 'AT',
      luggageLarge: 0,
      luggageSmall: 1,
      isDomestic: true,
      source: 'PURCHASE',
      owner: 'RIMO 臺灣直營車隊',
      vehicleType: 'microElectric'
    }]);
    const filterAssetCompanyIds = ref([]);
    const filterPositionIds = ref([]);
    const filterStatus = ref(['IDLE', 'RENTED', 'MAINTENANCE']);
    const filterEnabledStates = ref(['enabled', 'disabled']);
    const filterServiceTypes = ref(['SHARING_SAME', 'SHARING_ONE_WAY', 'STORE_STANDARD', 'STORE_24H', 'GOV']);
    const filterVehicleTypes = ref(['car', 'motorcycle', 'microElectric']);
    const searchQuery = ref('');
    const currentPage = ref(1);
    const pageSize = ref(10);
    const searchPanelExpanded = ref(false);
    const filterToolbar = ref(null);
    const filterLayoutTier = ref(1);
    let filterResizeObserver = null;
    const updateFilterLayout = () => {
      const width = filterToolbar.value?.clientWidth || 0;
      if (width >= 1180) filterLayoutTier.value = 3;else if (width >= 920) filterLayoutTier.value = 2;else filterLayoutTier.value = 1;
    };
    onMounted(() => {
      filterResizeObserver = new ResizeObserver(updateFilterLayout);
      if (filterToolbar.value) filterResizeObserver.observe(filterToolbar.value);
      updateFilterLayout();
    });
    onBeforeUnmount(() => filterResizeObserver?.disconnect());
    const positionFilterProps = {
      multiple: true,
      checkStrictly: true,
      emitPath: false
    };
    const statusOptions = [{
      value: 'IDLE',
      label: '空閒',
      tagText: 'IDLE',
      tagType: 'success'
    }, {
      value: 'RENTED',
      label: '租賃中',
      tagText: 'RENT',
      tagType: 'primary'
    }, {
      value: 'MAINTENANCE',
      label: '維保中',
      tagText: 'MAIN',
      tagType: 'warning'
    }];
    const enabledOptions = [{
      value: 'enabled',
      label: '已啓用',
      tagText: 'ON',
      tagType: 'success'
    }, {
      value: 'disabled',
      label: '已停用',
      tagText: 'OFF',
      tagType: 'danger'
    }];
    const serviceOptions = [{
      value: 'SHARING_SAME',
      label: '同站租還',
      tagText: '同',
      tagType: 'success'
    }, {
      value: 'SHARING_ONE_WAY',
      label: '甲租乙還',
      tagText: '異',
      tagType: 'success'
    }, {
      value: 'STORE_STANDARD',
      label: '門市租賃',
      tagText: '店',
      tagType: 'warning'
    }, {
      value: 'STORE_24H',
      label: '24H門市',
      tagText: '24',
      tagType: 'warning'
    }, {
      value: 'GOV',
      label: '公務用',
      tagText: '政',
      tagType: 'info'
    }];
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
    const dialogVisible = ref(false);
    const activeDialogTab = ref('BASIC');
    const isEdit = ref(false);
    const currentVehicle = reactive({});
    const formRef = ref(null);
    const importDialogVisible = ref(false);
    const importFile = ref(null);
    const rules = {
      licensePlate: [{
        required: true,
        message: '請輸入車牌號',
        trigger: 'blur'
      }],
      vehicleGroupId: [{
        required: true,
        message: '請選擇所屬車型組',
        trigger: 'change'
      }],
      assetCompanyId: [{
        required: true,
        message: '請選擇資產所屬車行',
        trigger: 'change'
      }],
      storeId: [{
        required: true,
        message: '請選擇當前門市',
        trigger: 'change'
      }],
      stationId: [{
        required: true,
        message: '請選擇當前據點',
        trigger: 'change'
      }],
      vin: [{
        min: 17,
        max: 17,
        message: 'VIN長度應爲17位',
        trigger: 'blur'
      }]
    };
    const companyOptions = computed(() => orgData.value.map(company => ({
      id: company.id,
      label: company.label
    })));
    const filteredStoreOptions = computed(() => {
      const company = orgData.value.find(item => item.id === currentVehicle.assetCompanyId);
      return company ? company.children || [] : [];
    });
    const filteredStationOptions = computed(() => {
      const store = filteredStoreOptions.value.find(item => item.id === currentVehicle.storeId);
      return store ? store.children || [] : [];
    });
    const filteredGroupOptions = computed(() => {
      return groupsData.value.filter(g => g.vehicleType === currentVehicle.vehicleType);
    });
    const getVehicleTypeLabel = type => {
      return vehicleTypeOptions.find(item => item.value === type)?.label || '-';
    };
    const getVehicleTypeTagType = type => {
      const map = {
        car: 'success',
        motorcycle: 'warning',
        microElectric: 'info'
      };
      return map[type] || 'info';
    };
    const handleVehicleTypeChange = () => {
      currentVehicle.vehicleGroupId = '';
    };
    const handleAssetCompanyChange = () => {
      if (!filteredStoreOptions.value.some(store => store.id === currentVehicle.storeId)) {
        currentVehicle.storeId = '';
        currentVehicle.stationId = '';
      }
    };
    const handleStoreChange = () => {
      if (!filteredStationOptions.value.some(station => station.id === currentVehicle.stationId)) {
        currentVehicle.stationId = '';
      }
    };
    const resetVehicleFilters = () => {
      filterAssetCompanyIds.value = [];
      filterPositionIds.value = [];
      filterStatus.value = ['IDLE', 'RENTED', 'MAINTENANCE'];
      filterEnabledStates.value = ['enabled', 'disabled'];
      filterServiceTypes.value = ['SHARING_SAME', 'SHARING_ONE_WAY', 'STORE_STANDARD', 'STORE_24H', 'GOV'];
      filterVehicleTypes.value = ['car', 'motorcycle', 'microElectric'];
      searchQuery.value = '';
      currentPage.value = 1;
      searchPanelExpanded.value = false;
    };
    const filteredVehicles = computed(() => {
      return vehicles.value.filter(v => {
        if (filterAssetCompanyIds.value.length > 0 && !filterAssetCompanyIds.value.includes(v.assetCompanyId)) {
          return false;
        }
        if (filterPositionIds.value.length > 0) {
          const scopeStationIds = getMergedStationIds(filterPositionIds.value);
          if (scopeStationIds.length === 0 || !scopeStationIds.includes(v.stationId)) return false;
        }
        if (filterStatus.value.length > 0 && !filterStatus.value.includes(v.operationStatus)) return false;
        const enabledState = v.enabled ? 'enabled' : 'disabled';
        if (filterEnabledStates.value.length > 0 && !filterEnabledStates.value.includes(enabledState)) return false;
        if (filterVehicleTypes.value.length > 0 && !filterVehicleTypes.value.includes(v.vehicleType)) return false;
        if (filterServiceTypes.value.length > 0) {
          const hasType = v.serviceTypes.some(t => filterServiceTypes.value.includes(t));
          if (!hasType) return false;
        }
        if (searchQuery.value) {
          const q = searchQuery.value.toLowerCase();
          return v.licensePlate.toLowerCase().includes(q) || v.vin.toLowerCase().includes(q);
        }
        return true;
      });
    });
    const paginatedVehicles = computed(() => {
      const start = (currentPage.value - 1) * pageSize.value;
      return filteredVehicles.value.slice(start, start + pageSize.value);
    });
    const handlePageSizeChange = size => {
      pageSize.value = size;
      currentPage.value = 1;
    };
    const handlePageChange = page => {
      currentPage.value = page;
    };
    const getGroupName = gid => {
      const g = groupsData.value.find(x => x.id === gid);
      return g ? `${g.brand} ${g.model}` : '未知車型';
    };
    const getStoreMeta = storeId => {
      for (const company of orgData.value) {
        for (const store of company.children || []) {
          if (store.id === storeId) return {
            company,
            store
          };
        }
      }
      return null;
    };
    const getStationMeta = stationId => {
      for (const company of orgData.value) {
        for (const store of company.children || []) {
          for (const station of store.children || []) {
            if (station.id === stationId) return {
              company,
              store,
              station
            };
          }
        }
      }
      return null;
    };
    const getStationIdsInScope = nodeId => {
      if (!nodeId) return [];
      const stationMeta = getStationMeta(nodeId);
      if (stationMeta) return [stationMeta.station.id];
      const storeMeta = getStoreMeta(nodeId);
      if (storeMeta) return (storeMeta.store.children || []).map(item => item.id);
      const company = orgData.value.find(item => item.id === nodeId);
      if (company) {
        return (company.children || []).flatMap(store => (store.children || []).map(item => item.id));
      }
      return [];
    };
    const getMergedStationIds = nodeIds => {
      return [...new Set((nodeIds || []).flatMap(id => getStationIdsInScope(id)))];
    };
    const getCompanyName = companyId => {
      const company = orgData.value.find(item => item.id === companyId);
      return company ? company.label : companyId || '-';
    };
    const getStoreName = storeId => {
      const meta = getStoreMeta(storeId);
      return meta ? meta.store.label : storeId || '-';
    };
    const getStationName = sid => {
      const meta = getStationMeta(sid);
      return meta ? meta.station.label : sid || '-';
    };
    const getLocationName = vehicle => {
      const storeName = getStoreName(vehicle.storeId);
      const stationName = getStationName(vehicle.stationId);
      if (storeName === '-' && stationName === '-') return '-';
      if (storeName === '-') return stationName;
      if (stationName === '-') return storeName;
      return `${storeName} - ${stationName}`;
    };
    const getStatusName = s => ({
      IDLE: '空閒',
      RENTED: '租賃中',
      MAINTENANCE: '維保中'
    })[s] || s;
    const getStatusType = s => ({
      IDLE: 'success',
      RENTED: 'primary',
      MAINTENANCE: 'warning'
    })[s] || 'info';
    const getOperationStatusName = getStatusName;
    const getOperationStatusType = getStatusType;
    const getSourceName = source => ({
      PURCHASE: '自購',
      LEASE: '租賃',
      AFFILIATE: '掛靠',
      TRUST: '託管'
    })[source] || source || '-';
    const getServiceName = t => ({
      SHARING_SAME: '同站',
      SHARING_ONE_WAY: '異地',
      STORE_STANDARD: '門市',
      STORE_24H: '24H',
      GOV: '公務'
    })[t] || t;
    const getServiceFullName = t => ({
      SHARING_SAME: '同站租還',
      SHARING_ONE_WAY: '甲租乙還',
      STORE_STANDARD: '門市租賃',
      STORE_24H: '24H門市',
      GOV: '公務用車'
    })[t] || t || '-';
    const getServiceTooltip = serviceTypes => {
      const list = (serviceTypes || []).map(getServiceFullName).filter(Boolean);
      return list.length > 0 ? list.join('、') : '未配置服務項目';
    };
    const getServiceTagType = t => ({
      SHARING_SAME: 'success',
      SHARING_ONE_WAY: 'success',
      STORE_STANDARD: 'warning',
      STORE_24H: 'warning',
      GOV: 'info'
    })[t] || 'info';
    const getVehiclePhoto = row => {
      if (row.customPhotoUrl) return row.customPhotoUrl;
      const g = groupsData.value.find(x => x.id === row.vehicleGroupId);
      return g ? g.defaultPhotoUrl : '';
    };
    const openDialog = row => {
      activeDialogTab.value = 'BASIC';
      if (row) {
        isEdit.value = true;
        Object.assign(currentVehicle, JSON.parse(JSON.stringify(row)));
        currentVehicle.serviceTypes = [...(row.serviceTypes || [])];
      } else {
        isEdit.value = false;
        Object.assign(currentVehicle, {
          id: 'V' + Date.now(),
          licensePlate: '',
          vin: '',
          vehicleGroupId: '',
          color: '',
          year: new Date().getFullYear().toString(),
          vehicleType: 'car',
          mileage: 0,
          operationStatus: 'IDLE',
          enabled: true,
          assetCompanyId: '',
          storeId: '',
          stationId: '',
          serviceTypes: [],
          currentServiceType: 'STORE_STANDARD',
          customPhotoUrl: '',
          nickname: '',
          seats: 5,
          doors: 4,
          fuelType: 'GASOLINE',
          transmission: 'AT',
          tankCapacity: '',
          displacement: '',
          isDomestic: true,
          luggageLarge: 0,
          luggageSmall: 0,
          owner: '',
          source: 'PURCHASE',
          tags: [],
          isSpecial: false,
          specialMembershipRequired: '',
          cid: ''
        });
      }
      dialogVisible.value = true;
    };
    const saveVehicle = () => {
      formRef.value?.validate(valid => {
        if (valid) {
          const existing = vehicles.value.find(vehicle => vehicle.id === currentVehicle.id);
          if (isEdit.value && (!existing || ['assetCompanyId', 'storeId', 'stationId', 'currentServiceType'].some(key => existing[key] !== currentVehicle[key]))) { feedback.ElMessage.error('資產歸屬與位置請通過調度流程調整'); return; }
          const saved = JSON.parse(JSON.stringify(currentVehicle));
          if (isEdit.value) {
            const idx = vehicles.value.findIndex(v => v.id === currentVehicle.id);
            if (idx !== -1) vehicles.value[idx] = {
              ...saved
            };
          } else {
            vehicles.value.push({
              ...saved
            });
          }
          dialogVisible.value = false;
          feedback.ElMessage.success('保存成功');
        }
      });
    };
    const setMaintenance = row => {
      if (row.operationStatus === 'RENTED') { feedback.ElMessage.warning('租賃中車輛不能直接切換維保'); return; }
      row.operationStatus = 'MAINTENANCE';
      const record = vehicles.value.find(vehicle => vehicle.id === row.id);
      if (record) record.operationStatus = 'MAINTENANCE';
      feedback.ElMessage.warning(`車輛 ${row.licensePlate} 已切換至維保狀態`);
    };
    const setIdle = row => {
      row.operationStatus = 'IDLE';
      const record = vehicles.value.find(vehicle => vehicle.id === row.id);
      if (record) record.operationStatus = 'IDLE';
      feedback.ElMessage.success(`車輛 ${row.licensePlate} 維保結束，已上線`);
    };
    const handleStatusToggle = row => {
      const _originalState = !row.enabled;
      if (row.enabled) {
        feedback.ElMessage.success(`車輛 ${row.licensePlate} 已啓用`);
        return;
      }
      if (row.operationStatus === 'IDLE') {
        feedback.ElMessage.success(`車輛 ${row.licensePlate} 已停用`);
      } else {
        feedback.ElMessageBox.confirm(`該車輛當前處於 ${getStatusName(row.operationStatus)} 狀態，停用後將不再接受新訂單/任務，確認停用嗎？`, '確認停用', {
          confirmButtonText: '確認停用',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          feedback.ElMessage.success(`車輛 ${row.licensePlate} 已停用`);
        }).catch(() => {
          row.enabled = true;
        });
      }
    };
    const selectedVehicles = ref([]);
    const handleSelectionChange = val => {
      selectedVehicles.value = val;
    };
    const handleBatchEnable = () => {
      const toEnable = selectedVehicles.value.filter(v => !v.enabled);
      if (toEnable.length === 0) {
        return feedback.ElMessage.info('選中的車輛已全部啓用');
      }
      toEnable.forEach(v => v.enabled = true);
      feedback.ElMessage.success(`已批量啓用 ${toEnable.length} 輛車`);
    };
    const handleBatchDisable = () => {
      const toDisable = selectedVehicles.value.filter(v => v.enabled);
      if (toDisable.length === 0) {
        return feedback.ElMessage.info('選中的車輛已全部停用');
      }
      const activeVehicles = toDisable.filter(v => ['RENTED', 'MAINTENANCE'].includes(v.operationStatus));
      if (activeVehicles.length > 0) {
        feedback.ElMessageBox.confirm(`選中的 ${toDisable.length} 輛車中，有 ${activeVehicles.length} 輛處於租賃或維保狀態。停用後它們將不再接受新訂單/任務，確認停用嗎？`, '批量停用確認', {
          confirmButtonText: '確認停用',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          toDisable.forEach(v => v.enabled = false);
          feedback.ElMessage.success(`已批量停用 ${toDisable.length} 輛車`);
        }).catch(() => {});
      } else {
        feedback.ElMessageBox.confirm(`確認批量停用選中的 ${toDisable.length} 輛車嗎？`, '批量停用確認', {
          confirmButtonText: '確認',
          cancelButtonText: '取消'
        }).then(() => {
          toDisable.forEach(v => v.enabled = false);
          feedback.ElMessage.success(`已批量停用 ${toDisable.length} 輛車`);
        }).catch(() => {});
      }
    };
    const applyVehicleBatchStatus = nextStatus => {
      if (nextStatus) {
        handleBatchEnable();
        return;
      }
      handleBatchDisable();
    };
    const deleteVehicle = row => {
      if (row.operationStatus === 'RENTED') { feedback.ElMessage.warning('租賃中車輛不能刪除'); return; }
      const idx = vehicles.value.findIndex(v => v.id === row.id);
      if (idx !== -1) {
        vehicles.value.splice(idx, 1);
        feedback.ElMessage.success('刪除成功');
      }
    };
    const detailDrawerVisible = ref(false);
    const currentDetailVehicle = ref({});
    const activeDetailTab = ref('OVERVIEW');
    const openDetailDrawer = vehicle => {
      currentDetailVehicle.value = {
        ...vehicle
      };
      activeDetailTab.value = 'OVERVIEW';
      detailDrawerVisible.value = true;
    };
    const getVehiclePhoto_Drawer = vehicle => {
      if (!vehicle) return '';
      if (vehicle.customPhotoUrl) return vehicle.customPhotoUrl;
      const group = groupsData.value.find(g => g.id === vehicle.vehicleGroupId);
      return group ? group.defaultPhotoUrl : 'https://via.placeholder.com/300?text=No+Image';
    };
    const radioTime = ref('近30天');
    const activeOrderTab = ref('same_station');
    const mockOrderRecords = ref([{
      orderId: 'ZT2405060001',
      type: 'same_station',
      createTime: '2024-05-06 09:15',
      status: 'completed',
      customer: {
        name: '張偉',
        phone: '0912-345-001',
        level: '新用戶'
      },
      schedule: {
        start: '2024-05-07 10:00',
        end: '2024-05-08 10:00'
      },
      location: {
        pickup: '新北總店',
        return: '新北總店'
      },
      amount: 1200
    }, {
      orderId: 'ZT2405060002',
      type: 'same_station',
      createTime: '2024-05-05 14:30',
      status: 'reserved',
      customer: {
        name: '王小明',
        phone: '0912-345-678',
        level: '金牌會員'
      },
      schedule: {
        start: '2024-05-07 09:30',
        end: '2024-05-10 18:00'
      },
      location: {
        pickup: '新北總店',
        return: '新北總店'
      },
      amount: 1920
    }, {
      orderId: 'ZT2405040003',
      type: 'one_way',
      createTime: '2024-05-04 14:20',
      status: 'completed',
      customer: {
        name: '李阿美',
        phone: '0922-123-456',
        level: '普通會員'
      },
      schedule: {
        start: '2024-05-04 15:00',
        end: '2024-05-07 10:00'
      },
      location: {
        pickup: '臺北車站店',
        return: '新北總店'
      },
      amount: 850
    }, {
      orderId: 'GOV2405020008',
      type: 'official',
      createTime: '2024-05-02 10:00',
      status: 'renewing',
      clientType: 'corporate',
      corporate: {
        shortName: '臺積電'
      },
      customer: {
        name: '趙強',
        phone: '0933-111-222',
        level: '白金會員',
        dept: '研發部'
      },
      schedule: {
        start: '2024-05-02 11:00',
        end: '2024-05-09 11:00'
      },
      location: {
        pickup: '新北總店',
        return: '新北總店'
      },
      amount: 5600
    }]);
    const filteredOrderRecords = computed(() => {
      return mockOrderRecords.value.filter(o => o.type === activeOrderTab.value);
    });
    const tableStatusConfig = status => {
      const map = {
        pending_payment: {
          text: "待支付",
          type: "info",
          color: ""
        },
        reserved: {
          text: "已預訂",
          type: "primary",
          color: ""
        },
        inspecting: {
          text: "驗車中",
          type: "warning",
          color: ""
        },
        renting: {
          text: "用車中",
          type: "success",
          color: ""
        },
        renewing: {
          text: "續租中",
          type: "success",
          color: ""
        },
        overdue: {
          text: "逾期未還",
          type: "danger",
          color: ""
        },
        settlement_pending: {
          text: "待結算",
          type: "warning",
          color: "#8E44AD"
        },
        payment_due: {
          text: "待補繳",
          type: "warning",
          color: "#E67E22"
        },
        refund_pending: {
          text: "待退款",
          type: "warning",
          color: "#E67E22"
        },
        completed: {
          text: "已完成",
          type: "info",
          color: ""
        },
        cancelled: {
          text: "已取消",
          type: "info",
          color: ""
        },
        rejected: {
          text: "已拒絕",
          type: "danger",
          color: ""
        }
      };
      return map[status] || {
        text: status,
        type: "info",
        color: ""
      };
    };
    const mockMaintenanceData = ref([{
      date: '2024-02-15',
      type: '常規保養',
      items: '更換機油、機油濾芯、輪胎對調',
      cost: 'NT$3,200',
      garage: '和泰汽車北投廠',
      operator: '陳柏翰'
    }, {
      date: '2023-12-20',
      type: '維修',
      items: '右後輪胎補胎與胎壓校正',
      cost: 'NT$800',
      garage: 'RIMO 新北板橋整備中心',
      operator: '林家豪'
    }]);
    const mockAccidentData = ref([{
      date: '2024-01-12',
      desc: '右前保杆擦傷（臺北市區路邊停車時發生）',
      status: '理賠中',
      cost: 'NT$18,000',
      reportId: 'RP-20240112-03'
    }]);
    const mockSystemLogs = ref([{
      time: '2024-05-03 14:05:22',
      user: '王怡君',
      action: '修改車輛狀態 [租賃中] -> [空閒]',
      ip: '10.21.8.15'
    }, {
      time: '2024-05-01 10:00:15',
      user: '陳柏翰',
      action: '修改車輛狀態 [空閒] -> [租賃中]',
      ip: '10.21.8.32'
    }, {
      time: '2024-04-28 09:30:00',
      user: '系統',
      action: '自動同步車輛位置（GPS）',
      ip: '10.21.0.5'
    }]);
    const photoHistoryVisible = ref(false);
    const mockPhotoHistory = ref([{
      date: '2024-05-01 10:05',
      type: '租賃出車驗車',
      operator: '張三',
      remark: '車輛外觀無新增劃痕，內飾清潔。',
      photos: ['https://via.placeholder.com/200x150?text=History+1', 'https://via.placeholder.com/200x150?text=History+2', 'https://via.placeholder.com/200x150?text=History+3']
    }, {
      date: '2024-04-28 09:30',
      type: '入庫驗車',
      operator: '李四',
      remark: '右後輪轂有輕微擦傷，已記錄。',
      photos: ['https://via.placeholder.com/200x150?text=History+A', 'https://via.placeholder.com/200x150?text=History+B', 'https://via.placeholder.com/200x150?text=History+C', 'https://via.placeholder.com/200x150?text=History+D']
    }]);
    const handleImportCommand = cmd => {
      if (cmd === 'import') {
        importDialogVisible.value = true;
        importFile.value = null;
      }
    };
    const handleExport = () => {
      downloadCsv('vehicles.csv', Object.keys(vehicles.value[0] ?? {}).map(key => ({ key, label: key, read: row => Array.isArray(row[key]) ? row[key].join('、') : row[key] })), filteredVehicles.value);
    };
    const downloadTemplate = () => {
      downloadCsv('vehicles-template.csv', ['licensePlate', 'vin', 'vehicleType', 'vehicleGroupId', 'assetCompanyId', 'storeId', 'stationId', 'year'].map(key => ({ key, label: key })), []);
    };
    const handleFileChange = file => {
      importFile.value = file;
    };
    const confirmImport = () => {
      if (!importFile.value) {
        feedback.ElMessage.warning('請先選擇要導入的批量文件');
        return;
      }
      feedback.ElMessage.info('已完成文件選擇演示，未連接真實導入服務，不會寫入車輛資料');
      importDialogVisible.value = false;
      importFile.value = null;
    };
    return {
      orgData,
      groupsData,
      vehicles,
      filterAssetCompanyIds,
      filterPositionIds,
      positionFilterProps,
      filterStatus,
      filterEnabledStates,
      filterServiceTypes,
      filterVehicleTypes,
      searchQuery,
      searchPanelExpanded,
      filterToolbar,
      filterLayoutTier,
      filteredVehicles,
      paginatedVehicles,
      currentPage,
      pageSize,
      handlePageSizeChange,
      handlePageChange,
      resetVehicleFilters,
      companyOptions,
      filteredStoreOptions,
      filteredStationOptions,
      filteredGroupOptions,
      handleVehicleTypeChange,
      handleAssetCompanyChange,
      handleStoreChange,
      dialogVisible,
      isEdit,
      currentVehicle,
      formRef,
      rules,
      activeDialogTab,
      importDialogVisible,
      detailDrawerVisible,
      currentDetailVehicle,
      activeDetailTab,
      openDetailDrawer,
      radioTime,
      mockOrderRecords,
      activeOrderTab,
      filteredOrderRecords,
      tableStatusConfig,
      mockMaintenanceData,
      mockAccidentData,
      mockSystemLogs,
      photoHistoryVisible,
      mockPhotoHistory,
      getGroupName,
      getCompanyName,
      getStoreName,
      getStationName,
      getLocationName,
      getStatusName,
      getStatusType,
      getOperationStatusName,
      getOperationStatusType,
      getSourceName,
      getServiceName,
      getServiceFullName,
      getServiceTooltip,
      getServiceTagType,
      getVehiclePhoto,
      getVehicleTypeLabel,
      getVehicleTypeTagType,
      openDialog,
      saveVehicle,
      setMaintenance,
      setIdle,
      deleteVehicle,
      handleStatusToggle,
      handleImportCommand,
      handleExport,
      downloadTemplate,
      handleFileChange,
      confirmImport,
      statusOptions,
      enabledOptions,
      serviceOptions,
      vehicleTypeOptions,
      selectedVehicles,
      handleSelectionChange,
      applyVehicleBatchStatus,
      ElMessage: feedback.ElMessage,
      ElMessageBox: feedback.ElMessageBox,
      filterResizeObserver,
      updateFilterLayout,
      importFile,
      getStoreMeta,
      getStationMeta,
      getStationIdsInScope,
      getMergedStationIds,
      handleBatchEnable,
      handleBatchDisable,
      getVehiclePhoto_Drawer
    };
  }
  return pageSetup();
}
