import { Fragment } from 'react';
import { useRimoModel, rimoEntries } from '../../lib/rimo-model.js';
import { RimoRoot, RimoIcon, useRimoEnvironment } from '../../lib/RimoEnvironment.jsx';
import { RimoElement, rimoClass, rimoStyle, rimoText } from '../../lib/RimoElements.jsx';
import './enterprise-official-vehicles.css';
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
      derived: computed,
      watch: watch
    } = model;
    const {
      ElMessage: _ElMessage,
      ElMessageBox: _ElMessageBox
    } = feedback;
    const TODAY = new Date();
    const branchOptions = ref([{
      id: 'B01',
      name: '華北一分公司'
    }, {
      id: 'B02',
      name: '華北二分公司'
    }, {
      id: 'B03',
      name: '華南一分公司'
    }, {
      id: 'B04',
      name: '華東區分公司'
    }]);
    const getFutureDateStr = days => {
      const d = new Date(TODAY);
      d.setDate(d.getDate() + days);
      return d.toISOString().split('T')[0];
    };
    const getPastDateStr = days => {
      const d = new Date(TODAY);
      d.setDate(d.getDate() - days);
      return d.toISOString().split('T')[0];
    };
    const vehicleData = ref([{
      id: 'V1',
      licensePlate: '京A·88888',
      model: '奧迪 A6L 2023款',
      branch: 'B01',
      stationName: '北京首都機場店',
      mileage: 36880,
      listingMileage: 18000,
      isActive: true,
      contract: {
        id: 'C-2023-0801',
        endDate: getFutureDateStr(300)
      }
    }, {
      id: 'V2',
      licensePlate: '京A·66666',
      model: '奔馳 E300L 2024款',
      branch: null,
      stationName: '',
      mileage: 12640,
      listingMileage: 9200,
      isActive: false,
      contract: {
        id: 'C-2024-0012',
        endDate: getFutureDateStr(100)
      }
    }, {
      id: 'V3',
      licensePlate: '粵B·12345',
      model: '豐田 Camry 2022款',
      branch: 'B03',
      stationName: '深圳寶安機場店',
      mileage: 58210,
      listingMileage: 44200,
      isActive: true,
      contract: {
        id: 'C-2023-0801',
        endDate: getFutureDateStr(10)
      }
    }, {
      id: 'V4',
      licensePlate: '粵B·98765',
      model: '大衆 Passat 2021款',
      branch: 'B03',
      stationName: '深圳北站店',
      mileage: 76300,
      listingMileage: 60800,
      isActive: false,
      contract: {
        id: 'C-2022-X773',
        endDate: getPastDateStr(5)
      }
    }, {
      id: 'V5',
      licensePlate: '滬C·00001',
      model: '別克 GL8 2023款',
      branch: 'B04',
      stationName: '上海虹橋樞紐店',
      mileage: 21560,
      listingMileage: 12200,
      isActive: true,
      contract: {
        id: 'C-2024-0012',
        endDate: getFutureDateStr(45)
      }
    }, {
      id: 'V6',
      licensePlate: '川A·00000',
      model: '極氪 001',
      branch: null,
      stationName: '',
      mileage: 8200,
      listingMileage: 8200,
      isActive: false,
      contract: null
    }]);
    const contractOptions = ref([{
      id: 'C-2023-0801',
      label: '[C-2023-0801] 集團統採租賃 (2025-12-31 到期)',
      endDate: '2025-12-31',
      branches: ['ALL']
    }, {
      id: 'C-2024-0012',
      label: '[C-2024-0012] 華北區分採補充 (2026-06-30 到期)',
      endDate: '2026-06-30',
      branches: ['B01', 'B02']
    }, {
      id: 'C-2024-0999',
      label: '[C-2024-0999] 臨時調用保障 (2024-08-15 到期)',
      endDate: '2024-08-15',
      branches: ['B03', 'B04']
    }]);
    const filters = reactive({
      licensePlate: '',
      model: '',
      contractId: '',
      branch: '',
      status: []
    });
    const activeSummaryCard = ref('');
    const modals = reactive({
      addVehicle: false,
      transfer: false,
      contract: false
    });
    const selectedRows = ref([]);
    const transferTargetBranch = ref('');
    const transferTargetContract = ref('');
    const contractBranchFilter = ref('');
    const activeAddVehicleTab = ref('BASIC');
    const addVehiclePhotoMocks = ref([]);
    const addVehicleBranchOptions = computed(() => branchOptions.value || []);
    const addVehicleBrandOptions = ref([{
      label: 'Toyota',
      value: 'toyota'
    }, {
      label: 'Lexus',
      value: 'lexus'
    }, {
      label: 'Mercedes-Benz',
      value: 'benz'
    }, {
      label: 'Skoda',
      value: 'skoda'
    }, {
      label: 'Audi',
      value: 'audi'
    }]);
    const addVehicleModelCatalog = ref([{
      label: 'Toyota Corolla Cross',
      value: 'corolla_cross',
      brandId: 'toyota',
      type: 'suv'
    }, {
      label: 'Toyota Camry',
      value: 'camry',
      brandId: 'toyota',
      type: 'sedan'
    }, {
      label: 'Lexus ES 250',
      value: 'es250',
      brandId: 'lexus',
      type: 'sedan'
    }, {
      label: 'Mercedes-Benz E300',
      value: 'e300',
      brandId: 'benz',
      type: 'sedan'
    }, {
      label: 'Skoda Superb',
      value: 'superb',
      brandId: 'skoda',
      type: 'sedan'
    }, {
      label: 'Audi A6L',
      value: 'a6l',
      brandId: 'audi',
      type: 'sedan'
    }]);
    const addVehicleSiteCatalog = ref([{
      branchId: 'B01',
      label: '北京首都機場店',
      value: 'beijing_airport'
    }, {
      branchId: 'B02',
      label: '北京國貿中心店',
      value: 'beijing_guomao'
    }, {
      branchId: 'B03',
      label: '深圳寶安機場店',
      value: 'sz_airport'
    }, {
      branchId: 'B03',
      label: '深圳北站店',
      value: 'sz_north'
    }, {
      branchId: 'B04',
      label: '上海虹橋樞紐店',
      value: 'sh_hongqiao'
    }]);
    const addVehicleTypeOptions = ref([{
      label: '轎車',
      value: 'sedan'
    }, {
      label: 'SUV',
      value: 'suv'
    }, {
      label: '商務車',
      value: 'mpv'
    }, {
      label: '微電車',
      value: 'micro_ev'
    }]);
    const addVehicleColorOptions = ref(['白色', '黑色', '銀色', '灰色', '深藍色']);
    const addVehicleSourceOptions = ref([{
      label: '自購（自有資產）',
      value: 'SELF_OWNED'
    }, {
      label: '和運租車',
      value: 'HESUAN'
    }, {
      label: '格上租車',
      value: 'GESHANG'
    }, {
      label: '中租租車',
      value: '中租'
    }, {
      label: '其他合作車源',
      value: 'OTHER'
    }]);
    const addVehicleTagOptions = ref([{
      label: '新車',
      value: 'new'
    }, {
      label: '接待專用',
      value: 'vip'
    }, {
      label: '長途優先',
      value: 'long_trip'
    }, {
      label: '低里程',
      value: 'low_mileage'
    }]);
    const addVehicleDeviceOptions = ref([{
      label: 'TBOX-001',
      value: 'tbox-001'
    }, {
      label: 'TBOX-002',
      value: 'tbox-002'
    }, {
      label: '未綁定',
      value: 'none'
    }]);
    const addVehicleForm = reactive({
      assetBranch: 'B01',
      siteId: 'beijing_airport',
      plateNo: '',
      brandId: '',
      modelId: '',
      modelYear: '',
      vehicleType: '',
      domesticFlag: '',
      seats: 5,
      displacement: '',
      tankCapacity: '',
      trunkCapacity: '',
      nickname: '',
      doorCount: 4,
      gearboxType: '',
      color: '',
      releaseDate: '',
      listingMileage: '',
      vin: '',
      engineNo: '',
      ownerName: 'RIMO Rental',
      fuelType: '',
      sourceType: 'SELF_OWNED',
      enableStatus: 'inactive',
      tagIds: [],
      lastMaintenanceMileage: '',
      lastMaintenanceDate: '',
      lastCleaningDate: '',
      specialVehicle: false,
      deviceCode: '',
      etcCardNo: '',
      iButtonCode: '',
      policyNo: '',
      insuranceDate: '',
      insuranceExpireDate: '',
      insuranceType: '',
      coverageAmount: '',
      claimAmount: ''
    });
    const filteredAddVehicleModelOptions = computed(() => {
      if (!addVehicleForm.brandId) return addVehicleModelCatalog.value;
      return addVehicleModelCatalog.value.filter(item => item.brandId === addVehicleForm.brandId);
    });
    const filteredAddVehicleSiteOptions = computed(() => {
      if (!addVehicleForm.assetBranch) return [];
      return addVehicleSiteCatalog.value.filter(item => item.branchId === addVehicleForm.assetBranch);
    });
    const getDaysRemaining = dateStr => {
      const diffTime = Math.abs(new Date(dateStr) - TODAY);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return new Date(dateStr) >= TODAY ? diffDays : -diffDays;
    };
    const selectedRowsCommonBranch = computed(() => {
      if (!selectedRows.value.length) return '';
      const first = selectedRows.value[0]?.branch ?? null;
      const allSame = selectedRows.value.every(r => (r?.branch ?? null) === first);
      if (!allSame) return '';
      return first === null ? 'UNASSIGNED' : first;
    });
    const availableContractsForBranch = computed(() => {
      const branch = contractBranchFilter.value;
      if (!branch) return [];
      if (branch === 'ALL') return contractOptions.value;
      return contractOptions.value.filter(c => (c.branches || []).includes('ALL') || (c.branches || []).includes(branch));
    });
    watch(contractBranchFilter, () => {
      const allowed = new Set(availableContractsForBranch.value.map(c => c.id));
      if (!transferTargetContract.value) return;
      if (!allowed.has(transferTargetContract.value)) transferTargetContract.value = '';
    });
    const filteredData = computed(() => {
      return vehicleData.value.filter(v => {
        const isFrozen = v.contract ? getDaysRemaining(v.contract.endDate) < 0 : true;
        if (filters.licensePlate && !v.licensePlate.includes(filters.licensePlate)) return false;
        if (filters.model && v.model !== filters.model) return false;
        if (filters.contractId) {
          if (!v.contract || v.contract.id !== filters.contractId) return false;
        }
        if (filters.branch) {
          if (filters.branch === 'UNASSIGNED' && v.branch !== null) return false;
          if (filters.branch !== 'UNASSIGNED' && v.branch !== filters.branch) return false;
        }
        if (filters.status.length > 0) {
          const vehicleStatuses = [];
          if (isFrozen) {
            vehicleStatuses.push('FROZEN');
          } else {
            vehicleStatuses.push(v.isActive ? 'ACTIVE' : 'INACTIVE');
            const daysRemain = getDaysRemaining(v.contract.endDate);
            if (daysRemain >= 0 && daysRemain < 15) vehicleStatuses.push('EXPIRING_SOON');
          }
          if (!filters.status.some(status => vehicleStatuses.includes(status))) return false;
        }
        if (isFrozen) v.isActive = false;
        return true;
      });
    });
    const modelOptions = computed(() => {
      const models = new Set(vehicleData.value.map(v => v.model));
      return Array.from(models).sort();
    });
    const stats = computed(() => {
      let active = 0,
        expiringSoon = 0,
        frozen = 0;
      vehicleData.value.forEach(v => {
        if (!v.contract) {
          frozen++;
        } else {
          const daysRemain = getDaysRemaining(v.contract.endDate);
          if (daysRemain < 0) frozen++;else {
            if (v.isActive) active++;
            if (daysRemain < 15) expiringSoon++;
          }
        }
      });
      return {
        total: vehicleData.value.length,
        active,
        expiringSoon,
        frozen
      };
    });
    const getBranchName = id => {
      const b = branchOptions.value.find(x => x.id === id);
      return b ? b.name : id;
    };
    const getCumulativeUsageMileage = row => {
      const mileage = Number(row.mileage || 0);
      const listingMileage = Number(row.listingMileage || 0);
      return Math.max(mileage - listingMileage, 0);
    };
    const tableRowClassName = ({
      row
    }) => {
      if (!row.contract) return 'bg-gray-50/50';
      const daysRemain = getDaysRemaining(row.contract.endDate);
      if (daysRemain >= 0 && daysRemain < 15) return 'bg-amber-50/50';
      return '';
    };
    const clearVehicleFilters = () => {
      filters.licensePlate = '';
      filters.model = '';
      filters.contractId = '';
      filters.branch = '';
      filters.status = [];
    };
    let isApplyingSummaryFilter = false;
    watch(() => [filters.licensePlate, filters.model, filters.contractId, filters.branch, filters.status.join(',')], () => {
      if (isApplyingSummaryFilter) return;
      const hasOtherFilters = Boolean(filters.licensePlate) || Boolean(filters.model) || Boolean(filters.contractId) || Boolean(filters.branch);
      if (hasOtherFilters) {
        activeSummaryCard.value = '';
        return;
      }
      const statusCardMap = {
        ACTIVE: 'active',
        EXPIRING_SOON: 'expiringSoon',
        FROZEN: 'frozen'
      };
      activeSummaryCard.value = filters.status.length === 1 ? statusCardMap[filters.status[0]] || '' : '';
    }, {
      flush: 'sync'
    });
    const applySummaryFilter = type => {
      isApplyingSummaryFilter = true;
      if (activeSummaryCard.value === type) {
        clearVehicleFilters();
        activeSummaryCard.value = '';
        isApplyingSummaryFilter = false;
        return;
      }
      clearVehicleFilters();
      if (type === 'active') {
        filters.status = ['ACTIVE'];
      }
      if (type === 'frozen') {
        filters.status = ['FROZEN'];
      }
      if (type === 'expiringSoon') {
        filters.status = ['EXPIRING_SOON'];
      }
      activeSummaryCard.value = type;
      isApplyingSummaryFilter = false;
    };
    const handleSelectionChange = val => {
      selectedRows.value = val;
    };
    const resetAddVehicleForm = () => {
      addVehicleForm.assetBranch = 'B01';
      addVehicleForm.siteId = 'beijing_airport';
      addVehicleForm.plateNo = '';
      addVehicleForm.brandId = '';
      addVehicleForm.modelId = '';
      addVehicleForm.modelYear = '';
      addVehicleForm.vehicleType = '';
      addVehicleForm.domesticFlag = '';
      addVehicleForm.seats = 5;
      addVehicleForm.displacement = '';
      addVehicleForm.tankCapacity = '';
      addVehicleForm.trunkCapacity = '';
      addVehicleForm.nickname = '';
      addVehicleForm.doorCount = 4;
      addVehicleForm.gearboxType = '';
      addVehicleForm.color = '';
      addVehicleForm.releaseDate = '';
      addVehicleForm.listingMileage = '';
      addVehicleForm.vin = '';
      addVehicleForm.engineNo = '';
      addVehicleForm.ownerName = 'RIMO Rental';
      addVehicleForm.fuelType = '';
      addVehicleForm.sourceType = 'SELF_OWNED';
      addVehicleForm.enableStatus = 'inactive';
      addVehicleForm.tagIds = [];
      addVehicleForm.lastMaintenanceMileage = '';
      addVehicleForm.lastMaintenanceDate = '';
      addVehicleForm.lastCleaningDate = '';
      addVehicleForm.specialVehicle = false;
      addVehicleForm.deviceCode = '';
      addVehicleForm.etcCardNo = '';
      addVehicleForm.iButtonCode = '';
      addVehicleForm.policyNo = '';
      addVehicleForm.insuranceDate = '';
      addVehicleForm.insuranceExpireDate = '';
      addVehicleForm.insuranceType = '';
      addVehicleForm.coverageAmount = '';
      addVehicleForm.claimAmount = '';
      addVehiclePhotoMocks.value = [{
        key: 'front',
        title: '車輛照片',
        caption: '右前 45°'
      }, {
        key: 'rear',
        title: '車輛照片',
        caption: '車尾'
      }];
    };
    const openAddVehicleModal = () => {
      resetAddVehicleForm();
      activeAddVehicleTab.value = 'BASIC';
      modals.addVehicle = true;
    };
    const handleAddVehicleBranchChange = () => {
      const firstSite = filteredAddVehicleSiteOptions.value[0];
      addVehicleForm.siteId = firstSite ? firstSite.value : '';
    };
    const handleAddVehicleBrandChange = () => {
      if (!filteredAddVehicleModelOptions.value.some(item => item.value === addVehicleForm.modelId)) {
        addVehicleForm.modelId = '';
      }
    };
    const handleAddVehicleModelChange = value => {
      const matched = addVehicleModelCatalog.value.find(item => item.value === value);
      if (matched?.type) {
        addVehicleForm.vehicleType = matched.type;
      }
    };
    const syncAddVehicleSeed = () => {
      addVehicleForm.brandId = 'toyota';
      addVehicleForm.modelId = 'camry';
      addVehicleForm.modelYear = '2025';
      addVehicleForm.vehicleType = 'sedan';
      addVehicleForm.domesticFlag = 'imported';
      addVehicleForm.seats = 5;
      addVehicleForm.displacement = '2487';
      addVehicleForm.tankCapacity = '60';
      addVehicleForm.trunkCapacity = '524';
      addVehicleForm.nickname = '公務接待車';
      addVehicleForm.doorCount = 4;
      addVehicleForm.gearboxType = 'auto';
      addVehicleForm.color = '黑色';
      addVehicleForm.releaseDate = '2025/02/01';
      addVehicleForm.listingMileage = '0';
      addVehicleForm.fuelType = 'gasoline';
      feedback.ElMessage.success('已同步帶入車款基礎資料');
    };
    const appendAddVehiclePhotoMock = () => {
      addVehiclePhotoMocks.value.push({
        key: `photo-${addVehiclePhotoMocks.value.length + 1}`,
        title: '車輛照片',
        caption: `補充圖 ${addVehiclePhotoMocks.value.length + 1}`
      });
    };
    const submitAddVehicle = () => {
      const requiredFields = [['資產歸屬分公司', addVehicleForm.assetBranch], ['所在據點', addVehicleForm.siteId], ['車牌號碼', addVehicleForm.plateNo], ['廠牌', addVehicleForm.brandId], ['車款', addVehicleForm.modelId], ['車款年份', addVehicleForm.modelYear], ['車輛類型', addVehicleForm.vehicleType], ['座位數', addVehicleForm.seats], ['排氣量', addVehicleForm.displacement], ['油箱容量', addVehicleForm.tankCapacity], ['車輛名稱（暱稱）', addVehicleForm.nickname], ['車門數量', addVehicleForm.doorCount], ['變速箱類型', addVehicleForm.gearboxType], ['車身顏色', addVehicleForm.color], ['上架里程', addVehicleForm.listingMileage], ['啓用狀態', addVehicleForm.enableStatus]];
      const missing = requiredFields.filter(([, value]) => value === null || value === undefined || String(value).trim() === '').map(([label]) => label);
      if (!addVehiclePhotoMocks.value.length) {
        missing.push('車輛照片');
      }
      if (missing.length) {
        feedback.ElMessage.warning(`請先完成：${missing.join('、')}`);
        return;
      }
      const branchName = getBranchName(addVehicleForm.assetBranch);
      const siteName = filteredAddVehicleSiteOptions.value.find(item => item.value === addVehicleForm.siteId)?.label || '';
      const modelName = addVehicleModelCatalog.value.find(item => item.value === addVehicleForm.modelId)?.label || '';
      vehicleData.value.unshift({
        id: `V${Date.now()}`,
        licensePlate: addVehicleForm.plateNo.trim(),
        model: `${modelName} ${addVehicleForm.modelYear || ''}`.trim(),
        branch: addVehicleForm.assetBranch,
        stationName: siteName,
        mileage: Number(addVehicleForm.listingMileage || 0),
        listingMileage: Number(addVehicleForm.listingMileage || 0),
        isActive: addVehicleForm.enableStatus === 'active',
        source: addVehicleForm.sourceType || 'OTHER',
        contract: null
      });
      modals.addVehicle = false;
      feedback.ElMessage.success(`車輛已新增至 ${branchName}；未綁定合約前仍不可上架`);
    };
    const hasBoundContractsInSelection = computed(() => {
      return selectedRows.value.some(r => {
        const v = vehicleData.value.find(veh => veh.id === r.id);
        return v && v.contract;
      });
    });
    const openTransferModal = () => {
      transferTargetBranch.value = '';
      modals.transfer = true;
    };
    const openContractModal = () => {
      transferTargetContract.value = '';
      contractBranchFilter.value = selectedRowsCommonBranch.value || '';
      modals.contract = true;
    };
    const openContractModalSingle = row => {
      selectedRows.value = [row];
      openContractModal();
    };
    const confirmTransfer = () => {
      const target = transferTargetBranch.value === 'UNASSIGNED' ? null : transferTargetBranch.value;
      selectedRows.value.forEach(r => {
        const row = vehicleData.value.find(v => v.id === r.id);
        if (row) row.branch = target;
      });
      feedback.ElMessage.success(`成功將 ${selectedRows.value.length} 輛車調撥`);
      modals.transfer = false;
    };
    const confirmContract = () => {
      const newId = transferTargetContract.value;
      const matched = contractOptions.value.find(c => c.id === newId);
      const newDate = matched?.endDate || getFutureDateStr(365);
      selectedRows.value.forEach(r => {
        const row = vehicleData.value.find(v => v.id === r.id);
        if (row) {
          if (!row.contract) row.contract = {};
          row.contract.id = newId;
          row.contract.endDate = newDate;
        }
      });
      feedback.ElMessage.success(`成功更換了 ${selectedRows.value.length} 輛車的合約。已解除凍結狀態（如受限）。`);
      modals.contract = false;
    };
    const unbindContract = () => {
      feedback.ElMessageBox.confirm(`確定要解綁這 ${selectedRows.value.length} 輛車的所有合約嗎？車輛將被下架並取消業務聯繫。`, '確認解綁', {
        confirmButtonText: '確定解綁',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        selectedRows.value.forEach(r => {
          const row = vehicleData.value.find(v => v.id === r.id);
          if (row) {
            row.contract = null;
            row.isActive = false;
          }
        });
        feedback.ElMessage.success(`已解綁選中車輛的所有相關合約。`);
        modals.contract = false;
      }).catch(() => {});
    };
    return {
      filters,
      stats,
      filteredData,
      branchOptions,
      modelOptions,
      activeSummaryCard,
      modals,
      selectedRows,
      transferTargetBranch,
      transferTargetContract,
      contractBranchFilter,
      availableContractsForBranch,
      activeAddVehicleTab,
      addVehicleForm,
      addVehiclePhotoMocks,
      addVehicleBranchOptions,
      addVehicleBrandOptions,
      filteredAddVehicleModelOptions,
      filteredAddVehicleSiteOptions,
      addVehicleTypeOptions,
      addVehicleColorOptions,
      addVehicleSourceOptions,
      addVehicleTagOptions,
      addVehicleDeviceOptions,
      getDaysRemaining,
      getBranchName,
      getCumulativeUsageMileage,
      tableRowClassName,
      hasBoundContractsInSelection,
      handleSelectionChange,
      applySummaryFilter,
      openTransferModal,
      openContractModal,
      openContractModalSingle,
      confirmTransfer,
      confirmContract,
      unbindContract,
      openAddVehicleModal,
      handleAddVehicleBranchChange,
      handleAddVehicleBrandChange,
      handleAddVehicleModelChange,
      syncAddVehicleSeed,
      appendAddVehiclePhotoMock,
      submitAddVehicle,
      ElMessage: feedback.ElMessage,
      ElMessageBox: feedback.ElMessageBox,
      TODAY,
      getFutureDateStr,
      getPastDateStr,
      vehicleData,
      contractOptions,
      addVehicleModelCatalog,
      addVehicleSiteCatalog,
      selectedRowsCommonBranch,
      clearVehicleFilters,
      isApplyingSummaryFilter,
      resetAddVehicleForm
    };
  }
  return pageSetup();
}
export default function EnterpriseOfficialVehiclesBlock() {
  const model = useRimoModel(createPageState);
  const view = model.view;
  const {
    text
  } = useRimoEnvironment();
  return <RimoRoot model={model} pageKey="enterprise-official-vehicles" assets={{}}><div data-business-content="" data-rimo-layout="page"><div className="flex justify-between items-end mb-6" data-rimo-layout="heading"><div><h1 className="text-2xl font-bold text-gray-800 tracking-tight">{text("公務車輛管理")}</h1>
<p className="text-gray-500 text-sm mt-1">{text("管理各分公司公務車輛調度、合約綁定及可視營運狀態。")}</p></div>
<div className="flex gap-3"><RimoElement kind="el-button" type="primary" size="large" className="shadow-md shadow-[color:var(--app-color-primary-shadow)]" onClick={event => {
            view.openAddVehicleModal?.(event);
          }}><RimoElement kind="el-icon" className="mr-1"><RimoIcon name="Plus" /></RimoElement>
{text(" 新增車輛\n                                ")}</RimoElement></div></div>
<div className="grid grid-cols-4 gap-4 mb-6" data-rimo-grid="4" data-rimo-layout="summary"><div className={rimoClass(["bg-white rounded-xl shadow-sm border p-5 flex flex-col cursor-pointer hover:border-[color:var(--app-color-primary)] transition-colors", rimoClass(view.activeSummaryCard === 'total' ? 'border-[color:var(--app-color-primary)] ring-1 ring-[color:var(--app-color-primary)]' : 'border-gray-100')])} onClick={_event => {
          view.applySummaryFilter('total');
        }} data-rimo-layout="stat"><span className="text-sm text-gray-500 font-medium mb-1">{text("總車輛數")}</span>
<span className="card-value text-gray-800">{rimoText(view.stats.total)}</span></div>
<div className={rimoClass(["bg-white rounded-xl shadow-sm border p-5 flex flex-col cursor-pointer hover:border-[color:var(--app-color-primary)] transition-colors", rimoClass(view.activeSummaryCard === 'active' ? 'border-[color:var(--app-color-primary)] ring-1 ring-[color:var(--app-color-primary)]' : 'border-gray-100')])} onClick={_event => {
          view.applySummaryFilter('active');
        }} data-rimo-layout="stat"><span className="text-sm text-gray-500 font-medium mb-1">{text("上架中")}</span>
<div className="flex items-center gap-2"><span className="card-value text-emerald-500">{rimoText(view.stats.active)}</span>
<RimoElement kind="el-tag" type="success" size="small" effect="plain" round={true}>{text("在線可見")}</RimoElement></div></div>
<div className={rimoClass(["bg-white rounded-xl shadow-sm border p-5 flex flex-col cursor-pointer hover:border-[color:var(--app-color-primary)] transition-colors", rimoClass(view.activeSummaryCard === 'expiringSoon' ? 'border-[color:var(--app-color-primary)] ring-1 ring-[color:var(--app-color-primary)]' : 'border-gray-100')])} onClick={_event => {
          view.applySummaryFilter('expiringSoon');
        }} data-rimo-layout="stat"><span className="text-sm text-gray-500 font-medium mb-1">{text("合約即將到期 (<15天)")}</span>
<div className="flex items-center gap-2"><span className="card-value text-amber-500">{rimoText(view.stats.expiringSoon)}</span>
<RimoElement kind="el-icon" className="text-amber-500 text-xl"><RimoIcon name="Warning" /></RimoElement></div></div>
<div className={rimoClass(["bg-white rounded-xl shadow-sm border p-5 flex flex-col cursor-pointer hover:border-[color:var(--app-color-primary)] transition-colors", rimoClass(view.activeSummaryCard === 'frozen' ? 'border-[color:var(--app-color-primary)] ring-1 ring-[color:var(--app-color-primary)]' : 'border-gray-100')])} onClick={_event => {
          view.applySummaryFilter('frozen');
        }} data-rimo-layout="stat"><span className="text-sm text-gray-500 font-medium mb-1 border-b border-transparent">{text("已凍結車輛")}</span>
<div className="flex items-center gap-2"><span className="card-value text-red-500">{rimoText(view.stats.frozen)}</span>
<RimoElement kind="el-tag" type="danger" size="small" effect="dark" round={true}>{text("強制下架")}</RimoElement></div></div></div>
<div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col" data-rimo-layout="list"><RimoElement kind="el-table" data={view.filteredData} style={rimoStyle("width: 100%")} onSelectionChange={event => {
          view.handleSelectionChange?.(event);
        }} rowClassName={view.tableRowClassName} slots={{
          "toolbar": _slot => <><div className="flex gap-4 flex-wrap flex-1"><RimoElement kind="el-input" modelValue={view.filters.licensePlate} onModelChange={value => {
                model.write(["filters", "licensePlate"], value);
              }} placeholder="搜索車牌號" prefixIcon="Search" clearable={true} style={rimoStyle("width: 140px")}></RimoElement>
<RimoElement kind="el-select" modelValue={view.filters.model} onModelChange={value => {
                model.write(["filters", "model"], value);
              }} placeholder="選擇車型" clearable={true} filterable={true} style={rimoStyle("width: 140px")}>{rimoEntries(view.modelOptions).map(([m], _itemIndex) => <Fragment key={m}><RimoElement kind="el-option" key={m} label={m} value={m}></RimoElement></Fragment>)}</RimoElement>
<RimoElement kind="el-select" modelValue={view.filters.contractId} onModelChange={value => {
                model.write(["filters", "contractId"], value);
              }} placeholder="綁定合約編號" clearable={true} style={rimoStyle("width: 200px")}><RimoElement kind="el-option" label="[C-2023-0801] 集團統採租賃" value="C-2023-0801"></RimoElement>
<RimoElement kind="el-option" label="[C-2024-0012] 華北區分採補充" value="C-2024-0012"></RimoElement>
<RimoElement kind="el-option" label="[C-2022-X773] 舊採購單 (已過期)" value="C-2022-X773"></RimoElement></RimoElement>
<RimoElement kind="el-select" modelValue={view.filters.branch} onModelChange={value => {
                model.write(["filters", "branch"], value);
              }} placeholder="可用分公司" clearable={true} style={rimoStyle("width: 200px")}><RimoElement kind="el-option" label="(未分配) 集團總池" value="UNASSIGNED"></RimoElement>
{rimoEntries(view.branchOptions).map(([b], _itemIndex) => <Fragment key={b.id}><RimoElement kind="el-option" key={b.id} label={b.name} value={b.id}></RimoElement></Fragment>)}</RimoElement>
<RimoElement kind="el-select" modelValue={view.filters.status} onModelChange={value => {
                model.write(["filters", "status"], value);
              }} placeholder="全部業務狀態" multiple={true} collapseTags={true} collapseTagsTooltip={true} clearable={true} style={rimoStyle("width: 190px")}><RimoElement kind="el-option" label="上架中" value="ACTIVE"></RimoElement>
<RimoElement kind="el-option" label="已下架" value="INACTIVE"></RimoElement>
<RimoElement kind="el-option" label="即將到期" value="EXPIRING_SOON"></RimoElement>
<RimoElement kind="el-option" label="已凍結" value="FROZEN"></RimoElement></RimoElement></div>
<div className="flex items-center gap-3 pl-4 border-l border-gray-200">{view.selectedRows.length > 0 ? <><div className="text-sm text-gray-500 font-medium">{text("已選 ")}{rimoText(view.selectedRows.length)}{text(" 項")}</div></> : null}
<RimoElement kind="el-button" plain={true} hidden={!false} disabled={view.selectedRows.length === 0} onClick={event => {
                view.openTransferModal?.(event);
              }}>{text("\n                                        調撥至分公司\n                                    ")}</RimoElement>
<RimoElement kind="el-button" type="primary" disabled={view.selectedRows.length === 0} onClick={event => {
                view.openContractModal?.(event);
              }}>{text("\n                                        批量換綁合約\n                                    ")}</RimoElement></div></>
        }}><RimoElement kind="el-table-column" type="selection" width="50"></RimoElement>
<RimoElement kind="el-table-column" label="車牌 / 車型" minWidth="180" slots={{
            "default": ({
              row
            }) => <><div className="font-bold text-gray-800 text-base">{rimoText(row.licensePlate)}</div>
<div className="text-xs text-gray-500 mt-1">{rimoText(row.model)}</div></>
          }}></RimoElement>
<RimoElement kind="el-table-column" label="里程數" width="120" align="right" slots={{
            "default": ({
              row
            }) => <><div className="text-sm text-gray-700 font-mono">{rimoText((row.mileage || 0).toLocaleString())}{text("\n                                            ")}
<span className="text-xs text-gray-400 font-sans">{text("km")}</span></div></>
          }}></RimoElement>
<RimoElement kind="el-table-column" label="累計用車里程" width="150" align="right" slots={{
            "default": ({
              row
            }) => <><div className="text-sm text-gray-700 font-mono">{rimoText(view.getCumulativeUsageMileage(row).toLocaleString())}{text("\n                                            ")}
<span className="text-xs text-gray-400 font-sans">{text("km")}</span></div></>
          }}></RimoElement>
<RimoElement kind="el-table-column" label="車輛來源" width="140" align="center" slots={{
            "default": ({
              row
            }) => <>{row.source === 'SELF_OWNED' ? <><RimoElement kind="el-tag" type="success" size="small" effect="plain" className="border-green-200 text-green-600 bg-green-50">{text("自購\n                                            (自有資產)")}</RimoElement></> : row.source === 'HESUAN' ? <><RimoElement kind="el-tag" type="warning" size="small" effect="plain" className="border-orange-200 text-orange-600 bg-orange-50">{text("和運租車")}</RimoElement></> : row.source === 'GESHANG' ? <><RimoElement kind="el-tag" type="warning" size="small" effect="plain" className="border-blue-200 text-blue-600 bg-blue-50">{text("格上租車")}</RimoElement></> : row.source === '中租' ? <><RimoElement kind="el-tag" type="warning" size="small" effect="plain" className="border-[color:var(--app-color-primary-light-7)] text-[color:var(--app-color-primary)] bg-[color:var(--app-color-primary-light-9)]">{text("中租租車")}</RimoElement></> : <><RimoElement kind="el-tag" type="info" size="small" effect="plain">{text("其他")}</RimoElement></>}</>
          }}></RimoElement>
<RimoElement kind="el-table-column" label="綁定合約" minWidth="240" slots={{
            "default": ({
              row
            }) => <>{row.contract ? <><><div className="text-sm text-gray-800 font-medium">{rimoText(row.contract.id)}</div>
<div className="text-xs text-gray-500 flex items-center mt-1">{text("\n                                                截止: ")}{rimoText(row.contract.endDate)}{text("\n                                                ")}
{view.getDaysRemaining(row.contract.endDate) >= 0 && view.getDaysRemaining(row.contract.endDate) < 15 ? <><RimoElement kind="el-tag" type="warning" size="small" effect="light" className="ml-2 scale-90">{text("\n                                                    ⏳ 即將到期\n                                                ")}</RimoElement></> : null}</div></></> : <><><RimoElement kind="el-tag" type="info" size="small" effect="plain" className="text-gray-500 bg-gray-50 border-gray-200">{text("未綁定")}</RimoElement></></>}</>
          }}></RimoElement>
<RimoElement kind="el-table-column" label="可用分公司" minWidth="140" slots={{
            "default": ({
              row
            }) => <>{row.branch ? <><div className="text-sm text-gray-700"><RimoElement kind="el-icon" className="mr-1"><RimoIcon name="OfficeBuilding" /></RimoElement>
{rimoText(view.getBranchName(row.branch))}{text("\n                                        ")}</div></> : <><RimoElement kind="el-tag" type="info" size="small" effect="plain" className="text-gray-500">{text("集團總池")}</RimoElement></>}</>
          }}></RimoElement>
<RimoElement kind="el-table-column" label="所屬站點" minWidth="160" slots={{
            "default": ({
              row
            }) => <><div className="text-sm text-gray-700"><RimoElement kind="el-icon" className="mr-1 text-gray-400"><RimoIcon name="Location" /></RimoElement>
{text("\n                                            ")}{rimoText(row.stationName || '未分配站點')}{text("\n                                        ")}</div></>
          }}></RimoElement>
<RimoElement kind="el-table-column" label="業務狀態" width="200" align="center" slots={{
            "default": ({
              row
            }) => <>{!row.contract ? <><div><div className="text-sm font-bold text-gray-400 flex items-center justify-center gap-1"><RimoElement kind="el-icon"><RimoIcon name="Minus" /></RimoElement>
{text(" 無效\n                                            ")}</div>
<div className="text-[10px] text-gray-400 mt-0.5">{text("(需先綁定合約)")}</div></div></> : view.getDaysRemaining(row.contract.endDate) < 0 ? <><div><div className="text-sm font-bold text-red-500 flex items-center justify-center gap-1"><RimoElement kind="el-icon"><RimoIcon name="Lock" /></RimoElement>
{text(" 已凍結\n                                            ")}</div>
<div className="text-[10px] text-red-400 mt-0.5">{text("(合約過期禁止上架)")}</div></div></> : <><div className="flex flex-col items-center"><RimoElement kind="el-switch" modelValue={row.isActive} onModelChange={value => {
                    model.assign(row, "isActive", value);
                  }} inlinePrompt={true} activeText="上架" inactiveText="下架" style={rimoStyle("--el-switch-on-color: var(--app-color-primary); --el-switch-off-color: #9ca3af")}></RimoElement></div></>}</>
          }}></RimoElement>
<RimoElement kind="el-table-column" label="操作" width="200" align="right" fixed="right" slots={{
            "default": ({
              row
            }) => <><RimoElement kind="el-button" type="primary" link={true} size="small">{text("詳情")}</RimoElement>
<RimoElement kind="el-button" type="primary" link={true} size="small">{text("編輯車輛")}</RimoElement>
<RimoElement kind="el-button" type="primary" link={true} size="small" onClick={_event => {
                view.openContractModalSingle(row);
              }}>{text("換綁合約")}</RimoElement></>
          }}></RimoElement></RimoElement></div></div><RimoElement kind="el-dialog" modelValue={view.modals.addVehicle} onModelChange={value => {
      model.write(["modals", "addVehicle"], value);
    }} title="新增公務車輛" width="920px" top="4vh" destroyOnClose={true} className="official-vehicles-overlay" slots={{
      "footer": _slot => <><RimoElement kind="el-button" onClick={_event => {
          model.write(["modals", "addVehicle"], false);
        }}>{text("取消")}</RimoElement>
<RimoElement kind="el-button" type="primary" onClick={event => {
          view.submitAddVehicle?.(event);
        }}>{text("保存")}</RimoElement></>
    }}>{() => <><RimoElement kind="el-form" model={view.addVehicleForm} labelPosition="top" className="h-[620px] overflow-hidden flex flex-col"><RimoElement kind="el-tabs" modelValue={view.activeAddVehicleTab} onModelChange={value => {
            model.write(["activeAddVehicleTab"], value);
          }} className="flex-1 overflow-hidden"><RimoElement kind="el-tab-pane" label="基礎資料" name="BASIC" className="h-full overflow-y-auto custom-scroll pr-2"><RimoElement kind="el-divider" contentPosition="left"><RimoElement kind="el-icon"><RimoIcon name="Tickets" /></RimoElement>
{text(" 車輛識別")}</RimoElement>
<div className="grid grid-cols-2 gap-x-6 gap-y-2" data-rimo-grid="2" data-rimo-layout="form-grid"><RimoElement kind="el-form-item" label="車牌號碼" required={true}><div className="flex items-end gap-2"><RimoElement kind="el-input" modelValue={view.addVehicleForm.plateNo} onModelChange={value => {
                      model.write(["addVehicleForm", "plateNo"], value);
                    }} placeholder="請輸入車牌號碼" className="flex-1"></RimoElement>
<RimoElement kind="el-button" type="primary" plain={true} onClick={event => {
                      view.syncAddVehicleSeed?.(event);
                    }}>{text("同步帶入")}</RimoElement></div></RimoElement>
<RimoElement kind="el-form-item" label="車輛名稱（暱稱）" required={true}><RimoElement kind="el-input" modelValue={view.addVehicleForm.nickname} onModelChange={value => {
                    model.write(["addVehicleForm", "nickname"], value);
                  }} placeholder="例如：公務接待車" className="w-full"></RimoElement></RimoElement>
<RimoElement kind="el-form-item" label="廠牌" required={true}><RimoElement kind="el-select" modelValue={view.addVehicleForm.brandId} onModelChange={value => {
                    model.write(["addVehicleForm", "brandId"], value);
                  }} placeholder="請選擇廠牌" className="w-full" onChange={event => {
                    view.handleAddVehicleBrandChange?.(event);
                  }}>{rimoEntries(view.addVehicleBrandOptions).map(([item], _itemIndex) => <Fragment key={item.value}><RimoElement kind="el-option" key={item.value} label={item.label} value={item.value}></RimoElement></Fragment>)}</RimoElement></RimoElement>
<RimoElement kind="el-form-item" label="車款" required={true}><RimoElement kind="el-select" modelValue={view.addVehicleForm.modelId} onModelChange={value => {
                    model.write(["addVehicleForm", "modelId"], value);
                  }} placeholder="請選擇車款" className="w-full" onChange={event => {
                    view.handleAddVehicleModelChange?.(event);
                  }}>{rimoEntries(view.filteredAddVehicleModelOptions).map(([item], _itemIndex) => <Fragment key={item.value}><RimoElement kind="el-option" key={item.value} label={item.label} value={item.value}></RimoElement></Fragment>)}</RimoElement></RimoElement>
<RimoElement kind="el-form-item" label="車輛類型" required={true}><RimoElement kind="el-select" modelValue={view.addVehicleForm.vehicleType} onModelChange={value => {
                    model.write(["addVehicleForm", "vehicleType"], value);
                  }} placeholder="請選擇車輛類型" className="w-full">{rimoEntries(view.addVehicleTypeOptions).map(([item], _itemIndex) => <Fragment key={item.value}><RimoElement kind="el-option" key={item.value} label={item.label} value={item.value}></RimoElement></Fragment>)}</RimoElement></RimoElement>
<RimoElement kind="el-form-item" label="車款年份" required={true}><RimoElement kind="el-date-picker" modelValue={view.addVehicleForm.modelYear} onModelChange={value => {
                    model.write(["addVehicleForm", "modelYear"], value);
                  }} type="year" placeholder="請選擇年份" format="YYYY" valueFormat="YYYY" style={rimoStyle("width: 100%")}></RimoElement></RimoElement>
<RimoElement kind="el-form-item" label="VIN"><RimoElement kind="el-input" modelValue={view.addVehicleForm.vin} onModelChange={value => {
                    model.write(["addVehicleForm", "vin"], value);
                  }} placeholder="請輸入 VIN" className="w-full"></RimoElement></RimoElement>
<RimoElement kind="el-form-item" label="引擎編號"><RimoElement kind="el-input" modelValue={view.addVehicleForm.engineNo} onModelChange={value => {
                    model.write(["addVehicleForm", "engineNo"], value);
                  }} placeholder="請輸入引擎編號" className="w-full"></RimoElement></RimoElement></div>
<RimoElement kind="el-divider" contentPosition="left"><RimoElement kind="el-icon"><RimoIcon name="OfficeBuilding" /></RimoElement>
{text(" 資產歸屬與位置")}</RimoElement>
<div className="grid grid-cols-2 gap-x-6 gap-y-2" data-rimo-grid="2" data-rimo-layout="form-grid"><RimoElement kind="el-form-item" label="資產歸屬分公司" required={true}><RimoElement kind="el-select" modelValue={view.addVehicleForm.assetBranch} onModelChange={value => {
                    model.write(["addVehicleForm", "assetBranch"], value);
                  }} placeholder="請選擇資產歸屬分公司" className="w-full" onChange={event => {
                    view.handleAddVehicleBranchChange?.(event);
                  }}>{rimoEntries(view.addVehicleBranchOptions).map(([item], _itemIndex) => <Fragment key={item.id}><RimoElement kind="el-option" key={item.id} label={item.name} value={item.id}></RimoElement></Fragment>)}</RimoElement></RimoElement>
<RimoElement kind="el-form-item" label="所在據點" required={true}><RimoElement kind="el-select" modelValue={view.addVehicleForm.siteId} onModelChange={value => {
                    model.write(["addVehicleForm", "siteId"], value);
                  }} placeholder="請選擇所在據點" className="w-full">{rimoEntries(view.filteredAddVehicleSiteOptions).map(([item], _itemIndex) => <Fragment key={item.value}><RimoElement kind="el-option" key={item.value} label={item.label} value={item.value}></RimoElement></Fragment>)}</RimoElement></RimoElement>
<RimoElement kind="el-form-item" label="車輛來源"><RimoElement kind="el-select" modelValue={view.addVehicleForm.sourceType} onModelChange={value => {
                    model.write(["addVehicleForm", "sourceType"], value);
                  }} placeholder="請選擇車輛來源" className="w-full">{rimoEntries(view.addVehicleSourceOptions).map(([item], _itemIndex) => <Fragment key={item.value}><RimoElement kind="el-option" key={item.value} label={item.label} value={item.value}></RimoElement></Fragment>)}</RimoElement></RimoElement>
<RimoElement kind="el-form-item" label="車主（車輛所有人）"><RimoElement kind="el-input" modelValue={view.addVehicleForm.ownerName} onModelChange={value => {
                    model.write(["addVehicleForm", "ownerName"], value);
                  }} placeholder="請輸入車輛所有人" className="w-full"></RimoElement></RimoElement>
<RimoElement kind="el-form-item" label="上架里程" required={true}><RimoElement kind="el-input" modelValue={view.addVehicleForm.listingMileage} onModelChange={value => {
                    model.write(["addVehicleForm", "listingMileage"], value);
                  }} placeholder="請輸入上架里程" className="w-full" slots={{
                    "append": _slot => <>{text("km")}</>
                  }}></RimoElement></RimoElement>
<RimoElement kind="el-form-item" label="啓用狀態" required={true}><RimoElement kind="el-radio-group" modelValue={view.addVehicleForm.enableStatus} onModelChange={value => {
                    model.write(["addVehicleForm", "enableStatus"], value);
                  }}><RimoElement kind="el-radio" label="inactive">{text("未啓用")}</RimoElement>
<RimoElement kind="el-radio" label="active">{text("啓用")}</RimoElement>
<RimoElement kind="el-radio" label="archived">{text("封存")}</RimoElement></RimoElement></RimoElement></div></RimoElement>
<RimoElement kind="el-tab-pane" label="規格資料" name="SPEC" className="h-full overflow-y-auto custom-scroll pr-2"><RimoElement kind="el-divider" contentPosition="left"><RimoElement kind="el-icon"><RimoIcon name="Van" /></RimoElement>
{text(" 車輛規格")}</RimoElement>
<div className="grid grid-cols-3 gap-x-6 gap-y-2" data-rimo-grid="3" data-rimo-layout="form-grid"><RimoElement kind="el-form-item" label="是否國產"><RimoElement kind="el-select" modelValue={view.addVehicleForm.domesticFlag} onModelChange={value => {
                    model.write(["addVehicleForm", "domesticFlag"], value);
                  }} placeholder="請選擇" className="w-full"><RimoElement kind="el-option" label="國產" value="domestic"></RimoElement>
<RimoElement kind="el-option" label="進口" value="imported"></RimoElement></RimoElement></RimoElement>
<RimoElement kind="el-form-item" label="燃料類型"><RimoElement kind="el-select" modelValue={view.addVehicleForm.fuelType} onModelChange={value => {
                    model.write(["addVehicleForm", "fuelType"], value);
                  }} placeholder="請選擇燃料類型" className="w-full"><RimoElement kind="el-option" label="汽油" value="gasoline"></RimoElement>
<RimoElement kind="el-option" label="柴油" value="diesel"></RimoElement>
<RimoElement kind="el-option" label="油電" value="hybrid"></RimoElement>
<RimoElement kind="el-option" label="純電" value="ev"></RimoElement></RimoElement></RimoElement>
<RimoElement kind="el-form-item" label="出廠日期"><RimoElement kind="el-date-picker" modelValue={view.addVehicleForm.releaseDate} onModelChange={value => {
                    model.write(["addVehicleForm", "releaseDate"], value);
                  }} type="date" placeholder="請選擇日期" format="YYYY/MM/DD" valueFormat="YYYY/MM/DD" style={rimoStyle("width: 100%")}></RimoElement></RimoElement>
<RimoElement kind="el-form-item" label="座位數" required={true}><RimoElement kind="el-input-number" modelValue={view.addVehicleForm.seats} onModelChange={value => {
                    model.write(["addVehicleForm", "seats"], value);
                  }} min={1} max={20} className="w-full"></RimoElement></RimoElement>
<RimoElement kind="el-form-item" label="車門數量" required={true}><RimoElement kind="el-input-number" modelValue={view.addVehicleForm.doorCount} onModelChange={value => {
                    model.write(["addVehicleForm", "doorCount"], value);
                  }} min={1} max={8} className="w-full"></RimoElement></RimoElement>
<RimoElement kind="el-form-item" label="變速箱類型" required={true}><RimoElement kind="el-select" modelValue={view.addVehicleForm.gearboxType} onModelChange={value => {
                    model.write(["addVehicleForm", "gearboxType"], value);
                  }} placeholder="請選擇變速箱類型" className="w-full"><RimoElement kind="el-option" label="自排" value="auto"></RimoElement>
<RimoElement kind="el-option" label="手排" value="manual"></RimoElement>
<RimoElement kind="el-option" label="CVT" value="cvt"></RimoElement></RimoElement></RimoElement>
<RimoElement kind="el-form-item" label="車身顏色" required={true}><RimoElement kind="el-select" modelValue={view.addVehicleForm.color} onModelChange={value => {
                    model.write(["addVehicleForm", "color"], value);
                  }} placeholder="請選擇車身顏色" className="w-full">{rimoEntries(view.addVehicleColorOptions).map(([item], _itemIndex) => <Fragment key={item}><RimoElement kind="el-option" key={item} label={item} value={item}></RimoElement></Fragment>)}</RimoElement></RimoElement>
<RimoElement kind="el-form-item" label="排氣量 (cc)" required={true}><RimoElement kind="el-input" modelValue={view.addVehicleForm.displacement} onModelChange={value => {
                    model.write(["addVehicleForm", "displacement"], value);
                  }} placeholder="請輸入排氣量" className="w-full"></RimoElement></RimoElement>
<RimoElement kind="el-form-item" label="油箱容量 (L)" required={true}><RimoElement kind="el-input" modelValue={view.addVehicleForm.tankCapacity} onModelChange={value => {
                    model.write(["addVehicleForm", "tankCapacity"], value);
                  }} placeholder="請輸入油箱容量" className="w-full"></RimoElement></RimoElement>
<RimoElement kind="el-form-item" label="行李箱容量 (L)"><RimoElement kind="el-input" modelValue={view.addVehicleForm.trunkCapacity} onModelChange={value => {
                    model.write(["addVehicleForm", "trunkCapacity"], value);
                  }} placeholder="請輸入行李箱容量" className="w-full"></RimoElement></RimoElement></div></RimoElement>
<RimoElement kind="el-tab-pane" label="運營配置" name="OPS" className="h-full overflow-y-auto custom-scroll pr-2"><RimoElement kind="el-divider" contentPosition="left"><RimoElement kind="el-icon"><RimoIcon name="PriceTag" /></RimoElement>
{text(" 標籤與設備")}</RimoElement>
<div className="grid grid-cols-2 gap-x-6 gap-y-2" data-rimo-grid="2" data-rimo-layout="form-grid"><RimoElement kind="el-form-item" label="車輛標籤"><RimoElement kind="el-select" modelValue={view.addVehicleForm.tagIds} onModelChange={value => {
                    model.write(["addVehicleForm", "tagIds"], value);
                  }} multiple={true} collapseTags={true} collapseTagsTooltip={true} filterable={true} placeholder="請選擇車輛標籤" className="w-full">{rimoEntries(view.addVehicleTagOptions).map(([item], _itemIndex) => <Fragment key={item.value}><RimoElement kind="el-option" key={item.value} label={item.label} value={item.value}></RimoElement></Fragment>)}</RimoElement></RimoElement>
<RimoElement kind="el-form-item" label="車機編號"><RimoElement kind="el-select" modelValue={view.addVehicleForm.deviceCode} onModelChange={value => {
                    model.write(["addVehicleForm", "deviceCode"], value);
                  }} placeholder="請選擇車機編號" className="w-full">{rimoEntries(view.addVehicleDeviceOptions).map(([item], _itemIndex) => <Fragment key={item.value}><RimoElement kind="el-option" key={item.value} label={item.label} value={item.value}></RimoElement></Fragment>)}</RimoElement></RimoElement>
<RimoElement kind="el-form-item" label="ETC 卡號"><RimoElement kind="el-input" modelValue={view.addVehicleForm.etcCardNo} onModelChange={value => {
                    model.write(["addVehicleForm", "etcCardNo"], value);
                  }} placeholder="請輸入 ETC 卡號" className="w-full"></RimoElement></RimoElement>
<RimoElement kind="el-form-item" label="iButton 編號"><RimoElement kind="el-input" modelValue={view.addVehicleForm.iButtonCode} onModelChange={value => {
                    model.write(["addVehicleForm", "iButtonCode"], value);
                  }} placeholder="請輸入 iButton 編號" className="w-full"></RimoElement></RimoElement></div>
<RimoElement kind="el-divider" contentPosition="left"><RimoElement kind="el-icon"><RimoIcon name="WarningFilled" /></RimoElement>
{text(" 特殊車輛")}</RimoElement>
<div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100 mb-4"><RimoElement kind="el-checkbox" modelValue={view.addVehicleForm.specialVehicle} onModelChange={value => {
                  model.write(["addVehicleForm", "specialVehicle"], value);
                }}>{text("標記爲特殊車款")}</RimoElement>
<div className="text-xs text-yellow-700 mt-1">{text("僅影響企業內部可見性和預約資格，不改變車輛資產歸屬。")}</div></div>
<RimoElement kind="el-divider" contentPosition="left"><RimoElement kind="el-icon"><RimoIcon name="PictureFilled" /></RimoElement>
{text(" 車輛照片")}</RimoElement>
<div className="vehicle-create-photo"><div className="vehicle-create-photo-box" onClick={event => {
                  view.appendAddVehiclePhotoMock?.(event);
                }}><RimoElement kind="el-icon"><RimoIcon name="PictureFilled" /></RimoElement>
<div>{text("點擊補充車輛照片")}</div>
<div className="text-[11px] text-slate-400">{text("用於列表預覽與車輛詳情")}</div></div>
<div className="vehicle-create-photo-list">{rimoEntries(view.addVehiclePhotoMocks).map(([photo, index], _itemIndex) => <Fragment key={photo.key}><div key={photo.key} className="vehicle-create-photo-item"><div className="vehicle-create-photo-item__preview">{rimoText(photo.title)}</div>
<div className="vehicle-create-photo-item__meta"><div className="font-semibold text-gray-700">{rimoText(photo.caption)}</div>
<div className="text-gray-400 mt-1">{text("第 ")}{rimoText(index + 1)}{text(" 張")}</div></div></div></Fragment>)}</div></div></RimoElement>
<RimoElement kind="el-tab-pane" label="維保保險" name="HEALTH" className="h-full overflow-y-auto custom-scroll pr-2"><RimoElement kind="el-divider" contentPosition="left"><RimoElement kind="el-icon"><RimoIcon name="Tools" /></RimoElement>
{text(" 維保資料")}</RimoElement>
<div className="grid grid-cols-2 gap-x-6 gap-y-2" data-rimo-grid="2" data-rimo-layout="form-grid"><RimoElement kind="el-form-item" label="上次保養里程"><RimoElement kind="el-input" modelValue={view.addVehicleForm.lastMaintenanceMileage} onModelChange={value => {
                    model.write(["addVehicleForm", "lastMaintenanceMileage"], value);
                  }} placeholder="請輸入上次保養里程" className="w-full" slots={{
                    "append": _slot => <>{text("km")}</>
                  }}></RimoElement></RimoElement>
<RimoElement kind="el-form-item" label="上次保養時間"><RimoElement kind="el-date-picker" modelValue={view.addVehicleForm.lastMaintenanceDate} onModelChange={value => {
                    model.write(["addVehicleForm", "lastMaintenanceDate"], value);
                  }} type="date" placeholder="請選擇日期" format="YYYY/MM/DD" valueFormat="YYYY/MM/DD" style={rimoStyle("width: 100%")}></RimoElement></RimoElement>
<RimoElement kind="el-form-item" label="上次清潔時間"><RimoElement kind="el-date-picker" modelValue={view.addVehicleForm.lastCleaningDate} onModelChange={value => {
                    model.write(["addVehicleForm", "lastCleaningDate"], value);
                  }} type="date" placeholder="請選擇日期" format="YYYY/MM/DD" valueFormat="YYYY/MM/DD" style={rimoStyle("width: 100%")}></RimoElement></RimoElement></div>
<RimoElement kind="el-divider" contentPosition="left"><RimoElement kind="el-icon"><RimoIcon name="Document" /></RimoElement>
{text(" 保險資料")}</RimoElement>
<div className="grid grid-cols-2 gap-x-6 gap-y-2" data-rimo-grid="2" data-rimo-layout="form-grid"><RimoElement kind="el-form-item" label="保單號碼"><RimoElement kind="el-input" modelValue={view.addVehicleForm.policyNo} onModelChange={value => {
                    model.write(["addVehicleForm", "policyNo"], value);
                  }} placeholder="請輸入保單號碼" className="w-full"></RimoElement></RimoElement>
<RimoElement kind="el-form-item" label="保險類型"><RimoElement kind="el-select" modelValue={view.addVehicleForm.insuranceType} onModelChange={value => {
                    model.write(["addVehicleForm", "insuranceType"], value);
                  }} placeholder="請選擇保險類型" className="w-full"><RimoElement kind="el-option" label="甲式全險" value="full"></RimoElement>
<RimoElement kind="el-option" label="乙式車體險" value="car_body"></RimoElement>
<RimoElement kind="el-option" label="強制險" value="compulsory"></RimoElement></RimoElement></RimoElement>
<RimoElement kind="el-form-item" label="投保日期"><RimoElement kind="el-date-picker" modelValue={view.addVehicleForm.insuranceDate} onModelChange={value => {
                    model.write(["addVehicleForm", "insuranceDate"], value);
                  }} type="date" placeholder="請選擇日期" format="YYYY/MM/DD" valueFormat="YYYY/MM/DD" style={rimoStyle("width: 100%")}></RimoElement></RimoElement>
<RimoElement kind="el-form-item" label="到期日期"><RimoElement kind="el-date-picker" modelValue={view.addVehicleForm.insuranceExpireDate} onModelChange={value => {
                    model.write(["addVehicleForm", "insuranceExpireDate"], value);
                  }} type="date" placeholder="請選擇日期" format="YYYY/MM/DD" valueFormat="YYYY/MM/DD" style={rimoStyle("width: 100%")}></RimoElement></RimoElement>
<RimoElement kind="el-form-item" label="保額"><RimoElement kind="el-input" modelValue={view.addVehicleForm.coverageAmount} onModelChange={value => {
                    model.write(["addVehicleForm", "coverageAmount"], value);
                  }} placeholder="請輸入保額" className="w-full"></RimoElement></RimoElement>
<RimoElement kind="el-form-item" label="理賠金額"><RimoElement kind="el-input" modelValue={view.addVehicleForm.claimAmount} onModelChange={value => {
                    model.write(["addVehicleForm", "claimAmount"], value);
                  }} placeholder="請輸入理賠金額" className="w-full"></RimoElement></RimoElement></div></RimoElement></RimoElement></RimoElement></>}</RimoElement>
<RimoElement kind="el-dialog" modelValue={view.modals.transfer} onModelChange={value => {
      model.write(["modals", "transfer"], value);
    }} title="批量調撥車輛" width="480px" className="official-vehicles-overlay" slots={{
      "footer": _slot => <><RimoElement kind="el-button" onClick={_event => {
          model.write(["modals", "transfer"], false);
        }}>{text("取消")}</RimoElement>
<RimoElement kind="el-button" type="primary" onClick={event => {
          view.confirmTransfer?.(event);
        }} disabled={!view.transferTargetBranch}>{text("確認調撥")}</RimoElement></>
    }}>{() => <><div className="bg-blue-50 text-blue-800 p-3 rounded text-sm mb-4 border border-blue-100 flex gap-2"><RimoElement kind="el-icon" className="mt-0.5"><RimoIcon name="InfoFilled" /></RimoElement>
<span>{text("已選中 ")}
<strong className="text-blue-600">{rimoText(view.selectedRows.length)}</strong>
{text("\n                        輛車，確認調撥後將轉移至目標分公司的管理資產中，原組織人員將無法調度上述車輛。")}</span></div>
<RimoElement kind="el-form" labelPosition="top"><RimoElement kind="el-form-item" label="選擇目標分公司" required={true}><RimoElement kind="el-select" modelValue={view.transferTargetBranch} onModelChange={value => {
              model.write(["transferTargetBranch"], value);
            }} className="w-full" filterable={true} placeholder="選擇要調撥到的分公司"><RimoElement kind="el-option" label="[撤回] 退至集團總池" value="UNASSIGNED"></RimoElement>
{rimoEntries(view.branchOptions).map(([b], _itemIndex) => <Fragment key={b.id}><RimoElement kind="el-option" key={b.id} label={b.name} value={b.id}></RimoElement></Fragment>)}</RimoElement></RimoElement></RimoElement></>}</RimoElement>
<RimoElement kind="el-dialog" modelValue={view.modals.contract} onModelChange={value => {
      model.write(["modals", "contract"], value);
    }} title="更換綁定合約" width="500px" className="official-vehicles-overlay" slots={{
      "footer": _slot => <><div className="flex justify-between items-center w-full" data-rimo-layout="toolbar">{view.hasBoundContractsInSelection ? <><RimoElement kind="el-button" type="danger" plain={true} onClick={event => {
              view.unbindContract?.(event);
            }}>{text("解綁當前合約")}</RimoElement></> : null}
<div className={rimoClass({
            'ml-auto': !view.hasBoundContractsInSelection
          })}><RimoElement kind="el-button" onClick={_event => {
              model.write(["modals", "contract"], false);
            }}>{text("取消")}</RimoElement>
<RimoElement kind="el-button" type="primary" onClick={event => {
              view.confirmContract?.(event);
            }} disabled={!view.transferTargetContract}>{text("確認換綁")}</RimoElement></div></div></>
    }}>{() => <><div className="bg-amber-50 text-amber-800 p-3 rounded text-sm mb-4 border border-amber-100 flex gap-2"><RimoElement kind="el-icon" className="mt-0.5"><RimoIcon name="Warning" /></RimoElement>
<span>{text("將選中的 ")}
<strong className="text-amber-600">{rimoText(view.selectedRows.length)}</strong>
{text("\n                        輛車轉移至新合約。更換後，因原合約過期導致的凍結狀態將立即解除。")}</span></div>
<RimoElement kind="el-form" labelPosition="top"><div className="flex gap-3"><RimoElement kind="el-form-item" label="選擇分公司" required={true} className="flex-1"><RimoElement kind="el-select" modelValue={view.contractBranchFilter} onModelChange={value => {
                model.write(["contractBranchFilter"], value);
              }} className="w-full" filterable={true} placeholder="先選擇分公司"><RimoElement kind="el-option" label="全部分公司" value="ALL"></RimoElement>
<RimoElement kind="el-option" label="(未分配) 集團總池" value="UNASSIGNED"></RimoElement>
{rimoEntries(view.branchOptions).map(([b], _itemIndex) => <Fragment key={b.id}><RimoElement kind="el-option" key={b.id} label={b.name} value={b.id}></RimoElement></Fragment>)}</RimoElement></RimoElement>
<RimoElement kind="el-form-item" label="選擇有效合約" required={true} className="flex-[1.2]"><RimoElement kind="el-select" modelValue={view.transferTargetContract} onModelChange={value => {
                model.write(["transferTargetContract"], value);
              }} className="w-full" filterable={true} disabled={!view.contractBranchFilter} placeholder="正在執行中的合約">{rimoEntries(view.availableContractsForBranch).map(([c], _itemIndex) => <Fragment key={c.id}><RimoElement kind="el-option" key={c.id} label={c.label} value={c.id}></RimoElement></Fragment>)}</RimoElement></RimoElement></div></RimoElement></>}</RimoElement></RimoRoot>;
}