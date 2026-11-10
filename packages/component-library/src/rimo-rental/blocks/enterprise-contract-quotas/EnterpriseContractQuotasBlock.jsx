import { Fragment } from 'react';
import { useRimoModel, rimoEntries } from '../../lib/rimo-model.js';
import { RimoRoot, RimoIcon, useRimoEnvironment } from '../../lib/RimoEnvironment.jsx';
import { RimoElement, rimoClass, rimoStyle, rimoText } from '../../lib/RimoElements.jsx';
import './enterprise-contract-quotas.css';
function createPageState(model) {
  const document = model.document;
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
    window.onerror = function (message, _source, lineno, _colno, error) {
      console.error("Global captured error:", message, error);
      const errDiv = document.createElement('div');
      errDiv.style.position = 'fixed';
      errDiv.style.top = '10px';
      errDiv.style.left = '50%';
      errDiv.style.transform = 'translateX(-50%)';
      errDiv.style.backgroundColor = 'rgba(255,0,0,0.9)';
      errDiv.style.color = 'white';
      errDiv.style.padding = '15px';
      errDiv.style.zIndex = '999999';
      errDiv.style.borderRadius = '5px';
      errDiv.innerText = `[JS Error] ${message} at line ${lineno}`;
      document.body.appendChild(errDiv);
    };
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
    const currentUserRole = ref('HEADQUARTERS');
    const MY_BRANCH_ID = 'B03';
    const TODAY = new Date();
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
    const branchOptions = ref([{
      id: 'B01',
      name: '華北一分公司'
    }, {
      id: 'B02',
      name: '華北二分公司'
    }, {
      id: 'B03',
      name: '華南一分公司 (開發)'
    }, {
      id: 'B04',
      name: '華東區分公司'
    }]);
    const contractsData = ref([{
      id: 'C-2023-0801',
      name: '集團統採租賃計劃A',
      type: 'OFFICIAL',
      billing: 'ANNUALLY',
      settlementParty: '格上租車',
      startDate: getPastDateStr(100),
      endDate: getFutureDateStr(300),
      effectiveAt: `${getPastDateStr(105)} 09:00`,
      totalQuota: 50,
      allocatedQuota: 30,
      allocations: [{
        branchId: 'B01',
        amount: 10,
        date: '2023-08-01'
      }, {
        branchId: 'B03',
        amount: 20,
        date: '2023-08-15'
      }]
    }, {
      id: 'C-2024-0012',
      name: '華北區分採補充審批單',
      type: 'OFFICIAL',
      billing: 'MONTHLY',
      settlementParty: '和運租車',
      startDate: getPastDateStr(20),
      endDate: getFutureDateStr(100),
      effectiveAt: `${getPastDateStr(20)} 00:00`,
      totalQuota: 120,
      allocatedQuota: 120,
      allocations: [{
        branchId: 'B02',
        amount: 120,
        date: '2024-01-12'
      }]
    }, {
      id: 'C-2024-0999',
      name: '臨時調用保障',
      type: 'TRIAL',
      billing: 'MONTHLY',
      settlementParty: '中租租車',
      startDate: getPastDateStr(15),
      endDate: getFutureDateStr(10),
      effectiveAt: `${getPastDateStr(15)} 00:00`,
      totalQuota: 10,
      allocatedQuota: 5,
      allocations: [{
        branchId: 'B03',
        amount: 5,
        date: '2024-02-01'
      }]
    }, {
      id: 'C-2022-X773',
      name: '舊批次試運營採購',
      type: 'TRIAL',
      billing: 'MONTHLY',
      settlementParty: '本企業',
      startDate: getPastDateStr(400),
      endDate: getPastDateStr(35),
      effectiveAt: `${getPastDateStr(400)} 00:00`,
      totalQuota: 20,
      allocatedQuota: 20,
      allocations: [{
        branchId: 'B04',
        amount: 20,
        date: '2022-05-10'
      }]
    }, {
      id: 'C-2024-08X2',
      name: '集團儲備車輛擴容包',
      type: 'OFFICIAL',
      billing: 'ANNUALLY',
      settlementParty: '艾維士租車',
      startDate: getPastDateStr(2),
      endDate: getFutureDateStr(360),
      effectiveAt: `${getPastDateStr(7)} 09:00`,
      totalQuota: 200,
      allocatedQuota: 0,
      allocations: []
    }, {
      id: 'C-2024-09Y3',
      name: '華南區新籤測試合同',
      type: 'OFFICIAL',
      billing: 'MONTHLY',
      settlementParty: '本企業',
      startDate: getFutureDateStr(1),
      endDate: getFutureDateStr(30),
      statusOverride: 'PAYING',
      effectiveAt: '',
      scheduledEffectiveAt: `${getFutureDateStr(1)} 00:00`,
      totalQuota: 40,
      allocatedQuota: 0,
      allocations: []
    }, {
      id: 'C-2025-F811',
      name: '快手同城地推車隊',
      type: 'OFFICIAL',
      billing: 'ANNUALLY',
      settlementParty: '中租租車',
      startDate: getPastDateStr(200),
      endDate: getFutureDateStr(165),
      statusOverride: 'TERMINATED',
      effectiveAt: `${getPastDateStr(200)} 00:00`,
      totalQuota: 100,
      allocatedQuota: 0,
      allocations: []
    }]);
    const transferVehicleStore = reactive({});
    const buildTransferVehicles = (contractId, branchId, count, seedDate) => {
      const list = [];
      for (let i = 0; i < count; i++) {
        list.push({
          id: `${contractId}-${branchId}-V${i + 1}`,
          branchId,
          branchName: '',
          license: `粵B·D${String(contractId).replace(/\D/g, '').slice(-3)}${100 + i}`,
          model: '吉利 雷達RD6 550km (皮卡)',
          bindDate: seedDate || '',
          status: i % 2 === 0 ? 'ACTIVE' : 'INACTIVE'
        });
      }
      return list;
    };
    (function _seedTransferVehicles() {
      const usedByContract = {
        'C-2023-0801': 15,
        'C-2024-0999': 2
      };
      contractsData.value.forEach(row => {
        transferVehicleStore[row.id] = {};
        (row.allocations || []).forEach(a => {
          const branch = branchOptions.value.find(b => b.id === a.branchId);
          const branchName = branch ? branch.name : a.branchId;
          const cap = usedByContract[row.id] || 0;
          const used = row.id === 'C-2023-0801' ? Math.min(a.amount, a.branchId === 'B01' ? 10 : cap) : row.id === 'C-2024-0999' ? Math.min(a.amount, cap) : 0;
          const vehicles = buildTransferVehicles(row.id, a.branchId, used, a.date);
          vehicles.forEach(v => {
            v.branchName = branchName;
          });
          transferVehicleStore[row.id][a.branchId] = vehicles;
        });
      });
    })();
    const transferBranchList = () => branchOptions.value.map(b => ({
      id: b.id,
      name: b.name
    }));
    const filters = reactive({
      query: '',
      type: 'ALL',
      billing: 'ALL',
      status: [],
      allocation: []
    });
    const activeSummaryCard = ref('');
    const modals = reactive({
      allocate: false,
      details: false,
      adjust: false,
      vehicles: false,
      prototypeLog: false,
      transfer: false
    });
    const activeContract = ref(null);
    const activeAllocations = ref([]);
    const activeAllocation = ref(null);
    const activeContractMockVehicles = computed(() => activeContract.value ? generateMockVehiclesForBranch(activeContract.value) : []);
    const allocateForm = reactive({
      branchId: '',
      amount: 1
    });
    const adjustForm = reactive({
      amount: 0
    });
    const adjustMaxAmount = computed(() => {
      if (!activeContract.value || !activeAllocation.value) return 0;
      return Math.max(0, enterpriseTransfers.availablePool(activeContract.value)) + activeAllocation.value.amount;
    });
    const getDaysRemaining = endStr => {
      const diffTime = Math.abs(new Date(endStr) - TODAY);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return new Date(endStr) >= TODAY ? diffDays : -diffDays;
    };
    const getStatusProp = row => {
      if (row.statusOverride) return row.statusOverride;
      const days = getDaysRemaining(row.endDate);
      if (days < 0) return 'EXPIRED';
      if (days >= 0 && days < 15) return 'EXPIRING_SOON';
      return 'ACTIVE';
    };
    const filteredData = computed(() => {
      let baseData = contractsData.value;
      if (currentUserRole.value === 'BRANCH') {
        baseData = baseData.filter(v => v.allocations.some(a => a.branchId === MY_BRANCH_ID));
      }
      return baseData.filter(v => {
        const sStatus = getStatusProp(v);
        if (filters.query && !v.id.includes(filters.query) && !v.name.includes(filters.query)) return false;
        if (filters.type !== 'ALL' && v.type !== filters.type) return false;
        if (filters.billing !== 'ALL' && v.billing !== filters.billing) return false;
        if (filters.status.length > 0 && !filters.status.includes(sStatus)) return false;
        if (currentUserRole.value === 'HEADQUARTERS' && filters.allocation.length > 0) {
          let allocationStatus = 'PARTIAL';
          if (v.allocatedQuota === 0) allocationStatus = 'UNASSIGNED';
          if (v.allocatedQuota >= v.totalQuota) allocationStatus = 'FULL';
          if (!filters.allocation.includes(allocationStatus)) return false;
        }
        return true;
      });
    });
    const statsHQ = computed(() => {
      let totalContracts = contractsData.value.length;
      let totalQuota = 0,
        allocatedQuota = 0;
      contractsData.value.forEach(v => {
        if (!['ACTIVE', 'EXPIRING_SOON'].includes(getStatusProp(v))) return;
        totalQuota += v.totalQuota;
        allocatedQuota += v.allocatedQuota;
      });
      return {
        totalContracts,
        totalQuota,
        allocatedQuota,
        unallocatedQuota: totalQuota - allocatedQuota
      };
    });
    const statsBranch = computed(() => {
      let contracts = 0;
      let quota = 0;
      contractsData.value.forEach(v => {
        const myAlloc = v.allocations.find(a => a.branchId === MY_BRANCH_ID);
        if (myAlloc && ['ACTIVE', 'EXPIRING_SOON'].includes(getStatusProp(v))) {
          contracts++;
          quota += myAlloc.amount;
        }
      });
      return {
        contracts,
        quota
      };
    });
    const getBranchName = id => {
      const b = branchOptions.value.find(x => x.id === id);
      return b ? b.name : id;
    };
    const getBranchQuota = row => {
      return row.allocations.filter(a => a.branchId === MY_BRANCH_ID).reduce((sum, a) => sum + a.amount, 0);
    };
    const getBranchUsedQuotaById = (row, branchId) => {
      return (transferVehicleStore[row.id]?.[branchId] || []).length;
    };
    const getBranchUsedQuota = row => {
      return getBranchUsedQuotaById(row, MY_BRANCH_ID);
    };
    const generateMockVehiclesForBranch = row => {
      return transferVehicleStore[row.id]?.[MY_BRANCH_ID] || [];
    };
    const getStatusText = row => {
      const s = getStatusProp(row);
      if (s === 'PAYING') return '付款確認中';
      if (s === 'EXTIRED' || s === 'EXPIRED') return '已過期';
      if (s === 'EXPIRING_SOON') return '即將到期';
      if (s === 'TERMINATED') return '已終止';
      return '生效中';
    };
    const getStatusColorClass = row => {
      const s = getStatusProp(row);
      if (s === 'PAYING') return 'text-blue-600';
      if (s === 'EXPIRED') return 'text-red-600';
      if (s === 'EXPIRING_SOON') return 'text-amber-600';
      if (s === 'TERMINATED') return 'text-gray-700 decoration-gray-400 line-through';
      return 'text-emerald-600';
    };
    const getStatusDotClass = row => {
      const s = getStatusProp(row);
      if (s === 'PAYING') return 'bg-blue-500';
      if (s === 'EXPIRED') return 'bg-red-500';
      if (s === 'EXPIRING_SOON') return 'bg-amber-500';
      if (s === 'TERMINATED') return 'bg-gray-600';
      return 'bg-emerald-500';
    };
    const getEffectiveDisplay = row => {
      if (!row) return '-';
      if (row.effectiveAt) return row.effectiveAt;
      if (row.scheduledEffectiveAt) return `${row.scheduledEffectiveAt}（預計）`;
      return '-';
    };
    const getGiftDaysByValue = (effectiveAt, startDate) => {
      if (!effectiveAt || !startDate || effectiveAt === '-') return 0;
      const effectiveDate = new Date(`${effectiveAt.slice(0, 10)}T00:00:00`);
      const contractStartDate = new Date(`${startDate}T00:00:00`);
      if (Number.isNaN(effectiveDate.getTime()) || Number.isNaN(contractStartDate.getTime())) return 0;
      return Math.max(0, Math.round((contractStartDate - effectiveDate) / (1000 * 60 * 60 * 24)));
    };
    const getGiftDays = row => {
      if (!row || row.type !== 'OFFICIAL') return 0;
      return getGiftDaysByValue(row.effectiveAt || row.scheduledEffectiveAt, row.startDate);
    };
    const getProgressClass = _row => {
      return 'quota-progress progress-hq';
    };
    const getBranchProgressClass = row => {
      const total = getBranchQuota(row);
      if (total === 0) return 'quota-progress progress-empty';
      const percent = Math.round(getBranchUsedQuota(row) / total * 100);
      if (percent >= 100) return 'quota-progress progress-full';
      if (percent > 80) return 'quota-progress progress-warning';
      return 'quota-progress progress-normal';
    };
    const handleRoleChange = () => {
      clearContractFilters();
      activeSummaryCard.value = '';
    };
    const clearContractFilters = () => {
      filters.query = '';
      filters.type = 'ALL';
      filters.billing = 'ALL';
      filters.status = [];
      filters.allocation = [];
    };
    let isApplyingSummaryFilter = false;
    watch(() => [filters.query, filters.type, filters.billing, filters.status.join(','), filters.allocation.join(',')], () => {
      if (isApplyingSummaryFilter) return;
      const hasOtherFilters = Boolean(filters.query) || filters.type !== 'ALL' || filters.billing !== 'ALL';
      if (currentUserRole.value === 'HEADQUARTERS' && !hasOtherFilters) {
        const statusKey = [...filters.status].sort().join(',');
        const allocationKey = [...filters.allocation].sort().join(',');
        if (statusKey === 'ACTIVE,EXPIRING_SOON' && allocationKey === '') {
          activeSummaryCard.value = 'totalQuota';
          return;
        }
        if (statusKey === 'ACTIVE,EXPIRING_SOON' && allocationKey === 'FULL,PARTIAL') {
          activeSummaryCard.value = 'allocatedQuota';
          return;
        }
        if (statusKey === 'ACTIVE,EXPIRING_SOON' && allocationKey === 'PARTIAL,UNASSIGNED') {
          activeSummaryCard.value = 'unallocatedQuota';
          return;
        }
      }
      activeSummaryCard.value = '';
    }, {
      flush: 'sync'
    });
    const applySummaryFilter = type => {
      isApplyingSummaryFilter = true;
      if (activeSummaryCard.value === type) {
        clearContractFilters();
        activeSummaryCard.value = '';
        isApplyingSummaryFilter = false;
        return;
      }
      clearContractFilters();
      if (type === 'totalQuota') {
        filters.status = ['ACTIVE', 'EXPIRING_SOON'];
      }
      if (type === 'allocatedQuota') {
        filters.status = ['ACTIVE', 'EXPIRING_SOON'];
        filters.allocation = ['FULL', 'PARTIAL'];
      }
      if (type === 'unallocatedQuota') {
        filters.status = ['ACTIVE', 'EXPIRING_SOON'];
        filters.allocation = ['PARTIAL', 'UNASSIGNED'];
      }
      if (type === 'branchContracts' || type === 'branchQuota') {
        filters.status = ['ACTIVE', 'EXPIRING_SOON'];
      }
      activeSummaryCard.value = type;
      isApplyingSummaryFilter = false;
    };
    const canAllocateContract = row => {
      if (!row) return false;
      return ['ACTIVE', 'EXPIRING_SOON'].includes(getStatusProp(row)) && enterpriseTransfers.availablePool(row) > 0;
    };
    const openAllocateModal = row => {
      activeContract.value = row;
      allocateForm.branchId = '';
      allocateForm.amount = 1;
      modals.allocate = true;
    };
    const aggregatedAllocations = computed(() => {
      if (!activeContract.value) return [];
      const map = {};
      activeContract.value.allocations.forEach(a => {
        if (!map[a.branchId]) {
          map[a.branchId] = {
            branchId: a.branchId,
            amount: 0,
            originalRow: a
          };
        }
        map[a.branchId].amount += a.amount;
      });
      return Object.values(map);
    });
    const openDetailsModal = row => {
      activeContract.value = row;
      modals.details = true;
    };
    const openAdjustModal = row => {
      activeAllocation.value = row;
      adjustForm.amount = row.amount;
      modals.adjust = true;
    };
    const confirmAdjust = () => {
      if (!activeContract.value || !activeAllocation.value) return;
      if (currentUserRole.value !== 'HEADQUARTERS') return;
      const row = activeContract.value,
        bid = activeAllocation.value.branchId;
      const minimum = getBranchUsedQuotaById(row, bid) + enterpriseTransfers.reservedIdle(row.id, bid);
      if (!Number.isInteger(adjustForm.amount) || adjustForm.amount < minimum || adjustForm.amount - activeAllocation.value.amount > enterpriseTransfers.availablePool(row)) return feedback.ElMessage.warning('調整後配額須容納已綁車輛及任務預留，且不得佔用其他預留配額。');
      const diff = adjustForm.amount - activeAllocation.value.amount;
      const _oldAllocations = activeContract.value.allocations.filter(a => a.branchId === activeAllocation.value.branchId);
      if (adjustForm.amount === 0) {
        activeContract.value.allocations = activeContract.value.allocations.filter(a => a.branchId !== activeAllocation.value.branchId);
      } else {
        activeContract.value.allocations = activeContract.value.allocations.filter(a => a.branchId !== activeAllocation.value.branchId);
        activeContract.value.allocations.push({
          branchId: activeAllocation.value.branchId,
          amount: adjustForm.amount,
          date: new Date().toISOString().split('T')[0]
        });
      }
      activeContract.value.allocatedQuota += diff;
      feedback.ElMessage.success(`配額調整成功`);
      modals.adjust = false;
    };
    const openVehiclesModal = row => {
      activeContract.value = row;
      modals.vehicles = true;
    };
    const unbindVehicleFromContract = vehicleRow => {
      if (enterpriseTransfers.vehicleLocked(vehicleRow.id)) return feedback.ElMessage.warning('此車輛已有待執行轉移任務，請先取消任務。');
      feedback.ElMessageBox.confirm(`確定要將車輛 ${vehicleRow.license} 從當前合約解綁嗎？`, '解綁確認', {
        confirmButtonText: '確定解綁',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        if (enterpriseTransfers.vehicleLocked(vehicleRow.id)) return feedback.ElMessage.warning('車輛已有轉移任務，不能解綁。');
        const index = activeContractMockVehicles.value.findIndex(v => v.license === vehicleRow.license);
        if (index > -1) {
          activeContractMockVehicles.value.splice(index, 1);
          feedback.ElMessage.success(`車輛 ${vehicleRow.license} 已成功解綁`);
        }
      }).catch(() => {});
    };
    const confirmAllocation = () => {
      const row = activeContract.value;
      if (!row) return;
      if (currentUserRole.value !== 'HEADQUARTERS' || !branchOptions.value.some(b => b.id === allocateForm.branchId) || !Number.isInteger(allocateForm.amount) || allocateForm.amount <= 0 || allocateForm.amount > enterpriseTransfers.availablePool(row)) return feedback.ElMessage.warning('請選擇分公司，且分配數量不得超過扣除任務預留後的可用配額。');
      const amountToAllocate = allocateForm.amount;
      row.allocatedQuota += amountToAllocate;
      const todayStr = new Date().toISOString().split('T')[0];
      row.allocations.push({
        branchId: allocateForm.branchId,
        amount: amountToAllocate,
        date: todayStr
      });
      feedback.ElMessage.success(`成功向分公司下發 ${amountToAllocate} 臺配額`);
      modals.allocate = false;
    };
    const enterpriseTransfers = (() => {
      const CORPORATE_ID = 'CORPORATE-DEMO';
      contractsData.value.forEach(row => {
        row.corporateId = CORPORATE_ID;
      });
      const clone = value => JSON.parse(JSON.stringify(value));
      const tasks = ref([]),
        taskListOpen = ref(false),
        taskPage = ref(1),
        transferBusy = ref(false);
      const taskFilter = reactive({
        query: '',
        status: ''
      });
      const taskStatuses = {
        PENDING: '待執行',
        COMPLETED: '已完成',
        FAILED: '執行失敗',
        CANCELLED: '已取消'
      };
      const taskTypes = {
        PENDING: 'warning',
        COMPLETED: 'success',
        FAILED: 'danger',
        CANCELLED: 'info'
      };
      const transferForm = reactive({
        id: '',
        sourceId: '',
        targetId: '',
        vehicleIds: [],
        mode: 'IMMEDIATE'
      });
      const contractOf = id => contractsData.value.find(r => r.id === id && r.corporateId === CORPORATE_ID && !r.deleted);
      const pending = id => tasks.value.filter(t => t.status === 'PENDING' && t.id !== id);
      const vehiclesOf = id => Object.values(transferVehicleStore[id] || {}).flat();
      const allocationsOf = row => {
        const map = {};
        (row?.allocations || []).forEach(a => {
          map[a.branchId] = (map[a.branchId] || 0) + a.amount;
        });
        return map;
      };
      const parse = date => new Date(String(date).replace(' ', 'T')).getTime();
      const effectiveAt = row => parse(row.effectiveAt || row.scheduledEffectiveAt || row.startDate + 'T00:00:00');
      const endsAt = row => parse(row.endDate + 'T00:00:00') + 86400000;
      const formatTaskTime = ms => {
        if (!ms) return '—';
        const d = new Date(ms),
          pad = n => String(n).padStart(2, '0');
        return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) + ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes());
      };
      const currentTask = computed(() => tasks.value.find(t => t.id === transferForm.id));
      const transferReadonly = computed(() => !!currentTask.value);
      const transferSourceContract = computed(() => transferReadonly.value ? currentTask.value.sourceSnapshot : contractOf(transferForm.sourceId));
      const transferTargetContract = computed(() => transferReadonly.value ? currentTask.value.targetSnapshot : contractOf(transferForm.targetId));
      const transferSourceVehicles = computed(() => transferReadonly.value ? currentTask.value.sourceVehiclesSnapshot : vehiclesOf(transferForm.sourceId));
      const transferTargetOptions = computed(() => transferReadonly.value ? [currentTask.value.targetSnapshot] : contractsData.value.filter(r => contractOf(r.id) && r.id !== transferForm.sourceId && !['TERMINATED', 'VOID', 'PAYING', 'EXPIRED'].includes(getStatusProp(r)) && endsAt(r) > Date.now()));
      const reservations = (id, exclude) => pending(exclude).filter(t => t.targetId === id);
      const reservedExtra = (id, exclude) => reservations(id, exclude).reduce((n, t) => n + t.details.reduce((s, d) => s + d.extra, 0), 0);
      const reservedIdle = (id, bid, exclude) => reservations(id, exclude).reduce((n, t) => n + (t.details.find(d => d.branchId === bid)?.reused || 0), 0);
      const availablePool = (row, exclude) => row.totalQuota - Object.values(allocationsOf(row)).reduce((a, b) => a + b, 0) - reservedExtra(row.id, exclude);
      const transferTargetAvailable = computed(() => transferReadonly.value ? currentTask.value.availableSnapshot : transferTargetContract.value ? Math.max(0, availablePool(transferTargetContract.value, transferForm.id)) : 0);
      const canTransferTo = row => currentUserRole.value === 'HEADQUARTERS' && !!row && !!contractOf(row.id) && ['ACTIVE', 'EXPIRING_SOON', 'EXPIRED'].includes(getStatusProp(row)) && vehiclesOf(row.id).length > 0;
      const taskNotice = (id, direction) => tasks.value.some(t => t.status === 'PENDING' && t[direction === 'out' ? 'sourceId' : 'targetId'] === id);
      const taskFailed = id => tasks.value.some(t => t.status === 'FAILED' && [t.sourceId, t.targetId].includes(id));
      const preview = (draft, system = false, now = Date.now()) => {
        const result = {
          reused: 0,
          extra: 0,
          error: '',
          details: [],
          vehicles: [],
          scheduledAt: null
        };
        const fail = message => ({
          ...result,
          error: message
        });
        if (!system && currentUserRole.value !== 'HEADQUARTERS') return fail('僅總公司管理員可操作轉移。');
        const source = contractOf(draft.sourceId),
          target = contractOf(draft.targetId);
        if (!source || !target || source.id === target.id) return fail('請選擇本企業的不同來源、目標合約。');
        if (!['ACTIVE', 'EXPIRING_SOON', 'EXPIRED'].includes(getStatusProp(source))) return fail('來源合約狀態不允許轉移。');
        if (['TERMINATED', 'VOID', 'PAYING', 'EXPIRED'].includes(getStatusProp(target))) return fail('目標合約狀態不允許轉入。');
        if (!['IMMEDIATE', 'SOURCE_EXPIRE'].includes(draft.mode)) return fail('請選擇轉移時間。');
        result.scheduledAt = draft.mode === 'IMMEDIATE' ? now : Math.max(endsAt(source), effectiveAt(target));
        if (!Number.isFinite(result.scheduledAt) || !Number.isFinite(endsAt(target))) return fail('合約日期不完整。');
        if (!system && draft.mode === 'SOURCE_EXPIRE' && result.scheduledAt <= now) return fail('到期時間已到，請選擇立即轉移。');
        const executionAt = system ? now : result.scheduledAt;
        if (effectiveAt(target) > executionAt || endsAt(target) <= executionAt) return fail('目標合約在轉移時尚未生效或已到期。');
        if (pending(draft.id).some(t => t.sourceId === source.id)) return fail('來源合約已有待執行任務，請先取消原任務，再重新建立。');
        const ids = draft.vehicleIds;
        if (!ids.length) return fail('請至少選擇一輛車。');
        if (new Set(ids).size !== ids.length) return fail('車輛不可重複選取。');
        result.vehicles = ids.map(id => vehiclesOf(source.id).find(v => v.id === id));
        if (result.vehicles.some(v => !v)) return fail('車輛綁定已變更，請重新選擇。');
        if (draft.vehicles?.some(v => result.vehicles.find(x => x.id === v.id)?.branchId !== v.branchId)) return fail('車輛所屬分公司已變更。');
        const counts = {};
        result.vehicles.forEach(v => {
          counts[v.branchId] = (counts[v.branchId] || 0) + 1;
        });
        const allocated = allocationsOf(target);
        let remainingPool = Math.max(0, availablePool(target, draft.id));
        for (const [bid, count] of Object.entries(counts)) {
          const used = (transferVehicleStore[target.id]?.[bid] || []).length;
          const free = Math.max(0, (allocated[bid] || 0) - used - reservedIdle(target.id, bid, draft.id));
          const reused = Math.min(free, count),
            extra = count - reused;
          const unallocatedQuotaUsed = Math.min(extra, remainingPool);
          const quotaShortage = extra - unallocatedQuotaUsed;
          result.details.push({
            branchId: bid,
            selectedCount: count,
            targetAllocatedQuota: allocated[bid] || 0,
            targetBoundVehicles: used,
            targetFreeQuota: free,
            reused,
            extra,
            unallocatedPoolBefore: remainingPool,
            unallocatedQuotaUsed,
            unallocatedPoolAfter: Math.max(0, remainingPool - unallocatedQuotaUsed),
            quotaShortage
          });
          result.reused += reused;
          result.extra += extra;
          if (quotaShortage) return fail('目標合約未分配配額已用盡，請減少後續分公司的轉移車輛。');
          remainingPool -= unallocatedQuotaUsed;
        }
        if (result.extra > availablePool(target, draft.id)) return fail('目標待分配可用配額不足，本次需新增 ' + result.extra + ' 臺。');
        return result;
      };
      const transferPreview = computed(() => transferReadonly.value ? {
        error: '',
        reused: currentTask.value.details.reduce((n, d) => n + d.reused, 0),
        extra: currentTask.value.details.reduce((n, d) => n + d.extra, 0),
        scheduledAt: currentTask.value.scheduledAt
      } : preview(transferForm));
      const transferBranchRows = computed(() => {
        const groups = {};
        transferSourceVehicles.value.forEach(v => {
          if (!groups[v.branchId]) groups[v.branchId] = {
            id: v.branchId,
            name: getBranchName(v.branchId),
            vehicles: [],
            selectedCount: 0
          };
          groups[v.branchId].vehicles.push(v);
          if (transferForm.vehicleIds.includes(v.id)) groups[v.branchId].selectedCount++;
        });
        const target = transferTargetContract.value;
        const allocated = target ? allocationsOf(target) : {};
        let unallocatedPool = target ? Math.max(0, availablePool(target, transferForm.id)) : 0;
        return Object.values(groups).map(row => {
          const historyDetail = transferReadonly.value ? currentTask.value?.details.find(d => d.branchId === row.id) : null;
          const targetAllocatedQuota = historyDetail?.targetAllocatedQuota ?? (allocated[row.id] || 0);
          const targetBoundVehicles = historyDetail?.targetBoundVehicles ?? (target ? (transferVehicleStore[target.id]?.[row.id] || []).length : 0);
          const targetFreeQuota = historyDetail?.targetFreeQuota ?? Math.max(0, targetAllocatedQuota - targetBoundVehicles - (target ? reservedIdle(target.id, row.id, transferForm.id) : 0));
          const selectedCount = historyDetail?.selectedCount ?? row.selectedCount;
          const quotaToAdd = historyDetail?.extra ?? Math.max(0, selectedCount - targetFreeQuota);
          const unallocatedPoolBefore = historyDetail?.unallocatedPoolBefore ?? unallocatedPool;
          const unallocatedQuotaUsed = historyDetail?.unallocatedQuotaUsed ?? Math.min(quotaToAdd, unallocatedPoolBefore);
          const quotaShortage = historyDetail?.quotaShortage ?? quotaToAdd - unallocatedQuotaUsed;
          unallocatedPool = historyDetail?.unallocatedPoolAfter ?? Math.max(0, unallocatedPoolBefore - unallocatedQuotaUsed);
          return {
            ...row,
            selectedCount,
            targetAllocatedQuota,
            targetBoundVehicles,
            targetFreeQuota,
            quotaToAdd,
            unallocatedPoolBefore,
            unallocatedQuotaUsed,
            unallocatedPoolAfter: unallocatedPool,
            quotaShortage,
            maxSelectable: targetFreeQuota + unallocatedPoolBefore
          };
        });
      });
      const transferQuotaSummary = computed(() => {
        const rows = transferBranchRows.value;
        const initial = transferTargetAvailable.value;
        return {
          initial,
          used: rows.reduce((n, row) => n + row.unallocatedQuotaUsed, 0),
          remaining: rows.length ? rows[rows.length - 1].unallocatedPoolAfter : initial,
          shortage: rows.reduce((n, row) => n + row.quotaShortage, 0)
        };
      });
      const transferVehiclePickerOpen = ref(false),
        transferActiveBranchId = ref(''),
        transferPickerQuery = ref(''),
        transferPickerIds = ref([]);
      const transferActiveBranchName = computed(() => getBranchName(transferActiveBranchId.value));
      const transferPickerVehicles = computed(() => transferSourceVehicles.value.filter(v => v.branchId === transferActiveBranchId.value && v.license.toLowerCase().includes(transferPickerQuery.value.toLowerCase())));
      const toggleTransferVehicle = (id, selected) => {
        if (transferReadonly.value || transferBusy.value) return;
        transferForm.vehicleIds = selected ? [...new Set([...transferForm.vehicleIds, id])] : transferForm.vehicleIds.filter(x => x !== id);
      };
      const toggleTransferBranch = (row, selected) => {
        if (transferReadonly.value || transferBusy.value) return;
        const branchIds = row.vehicles.map(v => v.id);
        if (!selected) {
          transferForm.vehicleIds = transferForm.vehicleIds.filter(id => !branchIds.includes(id));
          return;
        }
        const selectedIds = row.vehicles.slice(0, row.maxSelectable).map(v => v.id);
        transferForm.vehicleIds = [...transferForm.vehicleIds.filter(id => !branchIds.includes(id)), ...selectedIds];
        if (selectedIds.length < row.vehicles.length) feedback.ElMessage.warning(`目標合約可供 ${row.name} 使用的配額不足，最多隻能選擇 ${row.maxSelectable} 臺。`);
      };
      const openTransferVehiclePicker = row => {
        transferActiveBranchId.value = row.id;
        transferPickerQuery.value = '';
        transferPickerIds.value = row.vehicles.filter(v => transferForm.vehicleIds.includes(v.id)).map(v => v.id);
        transferVehiclePickerOpen.value = true;
      };
      const togglePickerVehicle = (id, selected) => {
        if (transferReadonly.value) return;
        const row = transferBranchRows.value.find(item => item.id === transferActiveBranchId.value);
        if (selected && !transferPickerIds.value.includes(id) && row && transferPickerIds.value.length >= row.maxSelectable) {
          feedback.ElMessage.warning(`目標合約未分配配額已按分公司列表順序用盡，${row.name} 最多隻能選擇 ${row.maxSelectable} 臺。`);
          return;
        }
        transferPickerIds.value = selected ? [...new Set([...transferPickerIds.value, id])] : transferPickerIds.value.filter(x => x !== id);
      };
      const pickerAll = computed(() => !!transferPickerVehicles.value.length && transferPickerVehicles.value.every(v => transferPickerIds.value.includes(v.id)));
      const pickerSome = computed(() => transferPickerVehicles.value.some(v => transferPickerIds.value.includes(v.id)));
      const togglePickerAll = selected => {
        const row = transferBranchRows.value.find(item => item.id === transferActiveBranchId.value);
        const visibleIds = transferPickerVehicles.value.map(v => v.id);
        if (!selected) {
          transferPickerIds.value = transferPickerIds.value.filter(id => !visibleIds.includes(id));
          return;
        }
        const outsideIds = transferPickerIds.value.filter(id => !visibleIds.includes(id));
        const slots = Math.max(0, (row?.maxSelectable ?? visibleIds.length) - outsideIds.length);
        const pickedIds = visibleIds.slice(0, slots);
        transferPickerIds.value = [...outsideIds, ...pickedIds];
        if (pickedIds.length < visibleIds.length) feedback.ElMessage.warning(`目標合約未分配配額已按分公司列表順序用盡，${row?.name || '本分公司'} 最多隻能選擇 ${row?.maxSelectable || 0} 臺。`);
      };
      const confirmTransferPicker = () => {
        if (transferReadonly.value || currentUserRole.value !== 'HEADQUARTERS') return;
        const ids = transferSourceVehicles.value.filter(v => v.branchId === transferActiveBranchId.value).map(v => v.id);
        const row = transferBranchRows.value.find(item => item.id === transferActiveBranchId.value);
        const selectedIds = transferPickerIds.value.filter(id => ids.includes(id));
        const limitedIds = selectedIds.slice(0, row?.maxSelectable ?? selectedIds.length);
        transferForm.vehicleIds = [...transferForm.vehicleIds.filter(id => !ids.includes(id)), ...limitedIds];
        if (limitedIds.length < selectedIds.length) feedback.ElMessage.warning(`已按目標合約可用配額保留前 ${limitedIds.length} 臺車輛。`);
        transferVehiclePickerOpen.value = false;
      };
      const openTransferDialog = (row, task = null) => {
        if (currentUserRole.value !== 'HEADQUARTERS') return;
        if (!task && row) task = pending().find(t => t.sourceId === row.id);
        const source = task ? contractOf(task.sourceId) : row;
        Object.assign(transferForm, task ? {
          id: task.id,
          sourceId: task.sourceId,
          targetId: task.targetId,
          mode: task.mode,
          vehicleIds: [...task.vehicleIds]
        } : {
          id: '',
          sourceId: row?.id || '',
          targetId: '',
          mode: 'IMMEDIATE',
          vehicleIds: source ? vehiclesOf(source.id).map(v => v.id) : []
        });
        modals.transfer = true;
      };
      const selectTransferSource = () => {
        transferForm.targetId = '';
        transferForm.vehicleIds = vehiclesOf(transferForm.sourceId).map(v => v.id);
      };
      const changeTransferTarget = () => {
        const target = contractOf(transferForm.targetId);
        if (target && effectiveAt(target) > Date.now()) transferForm.mode = 'SOURCE_EXPIRE';
      };
      const buildTask = (draft, p, id) => ({
        ...clone(draft),
        id,
        status: 'PENDING',
        details: clone(p.details),
        vehicles: clone(p.vehicles),
        sourceSnapshot: clone(contractOf(draft.sourceId)),
        targetSnapshot: clone(contractOf(draft.targetId)),
        sourceVehiclesSnapshot: clone(vehiclesOf(draft.sourceId)),
        scheduledAt: p.scheduledAt,
        executedAt: null,
        updatedAt: Date.now(),
        version: 1,
        failureReason: '',
        events: [],
        availableSnapshot: availablePool(contractOf(draft.targetId), draft.id)
      });
      const execute = (task, now = Date.now()) => {
        if (task.status !== 'PENDING') return task.status === 'COMPLETED';
        const p = preview(task, true, now);
        if (p.error) {
          task.status = 'FAILED';
          task.failureReason = p.error;
          task.updatedAt = now;
          task.version++;
          return false;
        }
        const target = contractOf(task.targetId);
        const targetAllocations = clone(target.allocations);
        const src = clone(transferVehicleStore[task.sourceId] || {}),
          dst = clone(transferVehicleStore[task.targetId] || {});
        p.details.forEach(d => {
          if (d.extra) targetAllocations.push({
            branchId: d.branchId,
            amount: d.extra,
            date: formatTaskTime(now).slice(0, 10)
          });
        });
        p.vehicles.forEach(v => {
          src[v.branchId] = src[v.branchId].filter(x => x.id !== v.id);
          (dst[v.branchId] ||= []).push(clone(v));
        });
        transferVehicleStore[task.sourceId] = src;
        transferVehicleStore[task.targetId] = dst;
        target.allocations = targetAllocations;
        target.allocatedQuota = targetAllocations.reduce((n, a) => n + a.amount, 0);
        task.status = 'COMPLETED';
        task.executedAt = now;
        task.updatedAt = now;
        task.failureReason = '';
        task.version++;
        task.events.push({
          type: 'COMPLETED',
          at: now
        });
        return true;
      };
      let sequence = 2;
      const confirmTransfer = async () => {
        if (transferBusy.value || transferReadonly.value) return;
        const draft = clone(transferForm),
          previous = currentTask.value,
          version = previous?.version;
        let p = preview(draft);
        if (p.error) return feedback.ElMessage.warning(p.error);
        transferBusy.value = true;
        try {
          await feedback.ElMessageBox.confirm(draft.mode === 'IMMEDIATE' ? '確認立即轉移所選車輛？來源分公司配額保留。' : '確認儲存到期轉移任務並預留目標容量？', '確認轉移', {
            confirmButtonText: '確認',
            cancelButtonText: '返回',
            type: 'warning'
          });
          if (previous && (previous.version !== version || !['PENDING', 'FAILED'].includes(previous.status))) return feedback.ElMessage.warning('任務狀態已變更，請重新開啟。');
          p = preview(draft);
          if (p.error) return feedback.ElMessage.warning(p.error);
          const next = buildTask(draft, p, previous?.id || 'ET-' + String(sequence++).padStart(4, '0'));
          next.version = (previous?.version || 0) + 1;
          next.events = [...(previous?.events || []), {
            type: previous ? 'EDITED' : 'CREATED',
            at: Date.now(),
            before: previous ? clone({
              status: previous.status,
              vehicleIds: previous.vehicleIds,
              targetId: previous.targetId,
              failureReason: previous.failureReason
            }) : null
          }];
          if (draft.mode === 'IMMEDIATE' && !execute(next)) return feedback.ElMessage.error(next.failureReason);
          if (previous) Object.assign(previous, next);else tasks.value.unshift(next);
          modals.transfer = false;
          feedback.ElMessage.success(next.status === 'COMPLETED' ? '車輛轉移已完成' : '轉移任務已儲存');
        } catch (error) {
          if (!['cancel', 'close'].includes(error)) feedback.ElMessage.error('轉移未完成，請重新確認。');
        } finally {
          transferBusy.value = false;
        }
      };
      const cancelTask = async task => {
        if (currentUserRole.value !== 'HEADQUARTERS' || transferBusy.value || !['PENDING', 'FAILED'].includes(task.status)) return;
        try {
          await feedback.ElMessageBox.confirm('取消任務並釋放預留容量？來源配額及車輛不變。', '取消轉移任務', {
            confirmButtonText: '確認取消',
            cancelButtonText: '返回',
            type: 'warning'
          });
        } catch {
          return;
        }
        if (currentUserRole.value !== 'HEADQUARTERS' || !['PENDING', 'FAILED'].includes(task.status)) return;
        task.status = 'CANCELLED';
        task.updatedAt = Date.now();
        task.version++;
        task.events.push({
          type: 'CANCELLED',
          at: task.updatedAt
        });
        if (transferForm.id === task.id) modals.transfer = false;
      };
      const openTaskList = (id = '') => {
        if (currentUserRole.value !== 'HEADQUARTERS') return;
        taskFilter.query = id;
        taskFilter.status = '';
        taskPage.value = 1;
        taskListOpen.value = true;
      };
      const filteredTasks = computed(() => tasks.value.filter(t => (!taskFilter.status || t.status === taskFilter.status) && (t.sourceId + t.sourceSnapshot.name + t.targetId + t.targetSnapshot.name).toLowerCase().includes(taskFilter.query.toLowerCase())).sort((a, b) => b.updatedAt - a.updatedAt));
      const pagedTasks = computed(() => filteredTasks.value.slice((taskPage.value - 1) * 5, taskPage.value * 5));
      watch(taskFilter, () => {
        taskPage.value = 1;
      });
      watch(() => filteredTasks.value.length, n => {
        taskPage.value = Math.min(taskPage.value, Math.max(1, Math.ceil(n / 5)));
      });
      watch(currentUserRole, () => {
        modals.transfer = false;
        taskListOpen.value = false;
        transferVehiclePickerOpen.value = false;
      });
      const sourceOptions = computed(() => contractsData.value.filter(canTransferTo));
      const runDueTasks = (now = Date.now()) => pending().filter(t => t.scheduledAt <= now).forEach(t => execute(t, now));
      let timer;
      model.onMount(() => {
        timer = window.setInterval(runDueTasks, 30000);
      });
      model.onDispose(() => window.clearInterval(timer));
      const vehicleLocked = id => pending().some(t => t.vehicleIds.includes(id));
      const seedSource = contractOf('C-2024-0999');
      const seedDraft = {
        sourceId: seedSource.id,
        targetId: 'C-2024-08X2',
        mode: 'SOURCE_EXPIRE',
        vehicleIds: vehiclesOf(seedSource.id).map(v => v.id)
      };
      const seedPreview = preview(seedDraft);
      if (!seedPreview.error) tasks.value.push(buildTask(seedDraft, seedPreview, 'ET-0001'));
      return {
        tasks,
        taskListOpen,
        taskPage,
        taskFilter,
        taskStatuses,
        taskTypes,
        currentTask,
        transferReadonly,
        transferBusy,
        transferForm,
        transferSourceContract,
        transferTargetContract,
        transferSourceVehicles,
        transferTargetAvailable,
        transferTargetOptions,
        transferPreview,
        transferBranchRows,
        transferQuotaSummary,
        transferVehiclePickerOpen,
        transferPickerQuery,
        transferPickerIds,
        transferActiveBranchName,
        transferPickerVehicles,
        pickerAll,
        pickerSome,
        togglePickerVehicle,
        togglePickerAll,
        openTransferVehiclePicker,
        confirmTransferPicker,
        toggleTransferBranch,
        toggleTransferVehicle,
        canTransferTo,
        openTransferDialog,
        changeTransferTarget,
        selectTransferSource,
        confirmTransfer,
        cancelTask,
        openTaskList,
        filteredTasks,
        pagedTasks,
        formatTaskTime,
        sourceOptions,
        taskNotice,
        taskFailed,
        runDueTasks,
        preview,
        availablePool,
        reservedIdle,
        vehicleLocked
      };
    })();
    return {
      currentUserRole,
      MY_BRANCH_ID,
      branchOptions,
      filters,
      modals,
      activeSummaryCard,
      allocateForm,
      activeContract,
      activeAllocations,
      activeAllocation,
      adjustForm,
      activeContractMockVehicles,
      aggregatedAllocations,
      filteredData,
      statsHQ,
      statsBranch,
      adjustMaxAmount,
      getDaysRemaining,
      getBranchName,
      getBranchQuota,
      getBranchUsedQuota,
      getBranchUsedQuotaById,
      getBranchProgressClass,
      getStatusProp,
      getStatusText,
      getStatusColorClass,
      getStatusDotClass,
      getProgressClass,
      getEffectiveDisplay,
      getGiftDays,
      handleRoleChange,
      openAllocateModal,
      openDetailsModal,
      confirmAllocation,
      canAllocateContract,
      openAdjustModal,
      confirmAdjust,
      openVehiclesModal,
      unbindVehicleFromContract,
      applySummaryFilter,
      ...enterpriseTransfers,
      ElMessage: feedback.ElMessage,
      ElMessageBox: feedback.ElMessageBox,
      TODAY,
      getFutureDateStr,
      getPastDateStr,
      contractsData,
      transferVehicleStore,
      buildTransferVehicles,
      transferBranchList,
      generateMockVehiclesForBranch,
      getGiftDaysByValue,
      clearContractFilters,
      isApplyingSummaryFilter,
      enterpriseTransfers
    };
  }
  return pageSetup();
}
export default function EnterpriseContractQuotasBlock() {
  const model = useRimoModel(createPageState);
  const view = model.view;
  const {
    text
  } = useRimoEnvironment();
  return <RimoRoot model={model} pageKey="enterprise-contract-quotas" assets={{}}><div data-business-content="" data-page-node-id="CJpQDOTgQo8yU2bESQaGBY" data-rimo-layout="page"><div className="flex justify-between items-end mb-6" data-page-node-id="DLaCqTE4rvehVVXBD4txZ0" data-rimo-layout="heading"><div data-page-node-id="Mx66nj1Tv0QtaPY9YItQ1f"><h1 className="text-2xl font-bold text-gray-800 tracking-tight" data-page-node-id="aJ69lQi8gCyoduCSsAQmrf">{text("合約配額管理")}</h1>
<p className="text-gray-500 text-sm mt-1" data-page-node-id="yAAMORZDfPKjEDp1NY8VPT">{text("管理車輛底層合約與調度下發額度，嚴格控制資產綁定狀態。")}</p></div>
<div className="flex gap-3" data-page-node-id="UXG2PXCL8TVP53hkbXALFe">{view.currentUserRole === 'HEADQUARTERS' ? <><RimoElement kind="el-button" size="large" onClick={_event => {
              view.openTaskList();
            }}>{text("合約轉移任務")}</RimoElement></> : null}
{view.currentUserRole === 'HEADQUARTERS' ? <><RimoElement kind="el-button" type="primary" size="large" className="shadow-md shadow-[color:var(--app-color-primary-shadow)]" data-page-node-id="bNt1X1x03G5l2rxx9hIcaA"><RimoElement kind="el-icon" className="mr-1" data-page-node-id="bx7Dmd11Ffv0bLjAjPmA7o"><RimoIcon name="Plus" /></RimoElement>
{text(" 增加配額\n                        ")}</RimoElement></> : null}</div></div>
{view.currentUserRole === 'HEADQUARTERS' ? <><div className="grid grid-cols-4 gap-4 mb-6" data-page-node-id="cac5A9oHHWh6yMtK8QVFCn" data-rimo-layout="summary"><div className={rimoClass(["bg-white rounded-xl shadow-sm border p-5 flex flex-col cursor-pointer hover:border-[color:var(--app-color-primary)] transition-colors", rimoClass(view.activeSummaryCard === 'totalContracts' ? 'border-[color:var(--app-color-primary)] ring-1 ring-[color:var(--app-color-primary)]' : 'border-gray-100')])} onClick={_event => {
            view.applySummaryFilter('totalContracts');
          }} data-page-node-id="iFI5w1kWj6R1PBNBiXDoJP" data-rimo-layout="stat"><span className="text-sm text-gray-500 font-medium mb-1" data-page-node-id="ycsbJIRY222kDlrvVJ8FSX">{text("集團總合約數")}</span>
<span className="card-value text-gray-800" data-page-node-id="9wZAV7VBKyRJbscklvhIzl">{rimoText(view.statsHQ.totalContracts)}</span></div>
<div className={rimoClass(["bg-white rounded-xl shadow-sm border p-5 flex flex-col cursor-pointer hover:border-[color:var(--app-color-primary)] transition-colors", rimoClass(view.activeSummaryCard === 'totalQuota' ? 'border-[color:var(--app-color-primary)] ring-1 ring-[color:var(--app-color-primary)]' : 'border-gray-100')])} onClick={_event => {
            view.applySummaryFilter('totalQuota');
          }} data-page-node-id="76Iqg8uAlf8xEq0BhKPOVa" data-rimo-layout="stat"><span className="text-sm text-gray-500 font-medium mb-1" data-page-node-id="c5HHigbEp7TSWZ8eXDcipG">{text("集團總可用配額")}</span>
<div className="flex items-center gap-2" data-page-node-id="zLywPtGyRBn3n0wzEUPW1u"><span className="card-value text-emerald-500" data-page-node-id="YvzTlpQQma3eV1YzkdfJoR">{rimoText(view.statsHQ.totalQuota)}</span>
<RimoElement kind="el-tag" type="info" size="small" effect="plain" round={true} data-page-node-id="WqIxMBCKH7lE3azbrCnwu7">{text("臺/輛")}</RimoElement></div></div>
<div className={rimoClass(["bg-white rounded-xl shadow-sm border p-5 flex flex-col cursor-pointer hover:border-[color:var(--app-color-primary)] transition-colors", rimoClass(view.activeSummaryCard === 'allocatedQuota' ? 'border-[color:var(--app-color-primary)] ring-1 ring-[color:var(--app-color-primary)]' : 'border-gray-100')])} onClick={_event => {
            view.applySummaryFilter('allocatedQuota');
          }} data-page-node-id="fjbSal51PrdaMJD3GXd2Yj" data-rimo-layout="stat"><span className="text-sm text-gray-500 font-medium mb-1 text-[color:var(--app-color-primary)]" data-page-node-id="B7PuFRMk8mXI5raniWwWH0">{text("已下發配額")}</span>
<div className="flex items-center gap-2" data-page-node-id="UHhqWzjKFWfjyG9UXy99KL"><span className="card-value text-[color:var(--app-color-primary)]" data-page-node-id="pitMu0oRlYK6DDBpwSOvMO">{rimoText(view.statsHQ.allocatedQuota)}</span></div></div>
<div className={rimoClass(["bg-white rounded-xl shadow-sm border p-5 flex flex-col cursor-pointer hover:border-[color:var(--app-color-primary)] transition-colors", rimoClass(view.activeSummaryCard === 'unallocatedQuota' ? 'border-[color:var(--app-color-primary)] ring-1 ring-[color:var(--app-color-primary)]' : 'border-gray-100')])} onClick={_event => {
            view.applySummaryFilter('unallocatedQuota');
          }} data-page-node-id="KvW5SEDGGeGKIRSWC6sIsD" data-rimo-layout="stat"><span className="text-sm text-gray-500 font-medium mb-1 text-amber-500" data-page-node-id="sPrDtauX9cPJmL6DEU9Bct">{text("待分配配額")}</span>
<div className="flex items-center gap-2" data-page-node-id="wEVnt0L16BWxA1S5xc2nuO"><span className="card-value text-amber-500" data-page-node-id="zXo3Xv1WoMpL0vKl3v4B6e">{rimoText(view.statsHQ.unallocatedQuota)}</span>
<RimoElement kind="el-icon" className="text-amber-500 text-xl" data-page-node-id="ogWgPx7u46BAHfxHqCoAKD"><RimoIcon name="Watercup" /></RimoElement></div></div></div></> : <><div className="grid grid-cols-2 gap-4 mb-6" data-page-node-id="Fp0dThET0ugYTt9vmTob7c" data-rimo-layout="summary"><div className={rimoClass(["bg-white rounded-xl shadow-sm border p-5 flex flex-col items-center cursor-pointer hover:border-[color:var(--app-color-primary)] transition-colors", rimoClass(view.activeSummaryCard === 'branchContracts' ? 'border-[color:var(--app-color-primary)] ring-1 ring-[color:var(--app-color-primary)]' : 'border-gray-100')])} onClick={_event => {
            view.applySummaryFilter('branchContracts');
          }} data-page-node-id="hAnhxNKLcazanqKH2Kbovh" data-rimo-layout="stat"><span className="text-sm text-gray-500 font-medium mb-1" data-page-node-id="8ZuRJTYbTSnBDR6kGbXCta">{text("本公司有效合約數")}</span>
<span className="card-value text-gray-800" data-page-node-id="d2m3ILvGSRf3IRaTOcLD80">{rimoText(view.statsBranch.contracts)}</span></div>
<div className={rimoClass(["bg-white rounded-xl shadow-sm border p-5 flex flex-col items-center cursor-pointer hover:border-[color:var(--app-color-primary)] transition-colors", rimoClass(view.activeSummaryCard === 'branchQuota' ? 'border-[color:var(--app-color-primary)] ring-1 ring-[color:var(--app-color-primary)]' : 'border-gray-100')])} onClick={_event => {
            view.applySummaryFilter('branchQuota');
          }} data-page-node-id="TvzrgKD4tv06JxFFMMFcfj" data-rimo-layout="stat"><span className="text-sm text-gray-500 font-medium mb-1" data-page-node-id="BCDsdV12AoGvpmhayWnFcn">{text("本公司當前可用總配額")}</span>
<div className="flex items-center gap-2" data-page-node-id="9Qhpro3WSk14vvNAwapG8M"><span className="card-value text-emerald-500 text-4xl" data-page-node-id="DLVkd4XXjNQOF0TDCMERoB">{rimoText(view.statsBranch.quota)}{text(" ")}
<span className="text-sm text-gray-400 font-normal" data-page-node-id="BH2AXsM6NZteWMJ5P7PTKM">{text("車輛")}</span></span></div></div></div></>}
<div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col" data-page-node-id="AM9gNchoGz3iZHuCfnEewc" data-rimo-layout="list"><RimoElement kind="el-table" data={view.filteredData} style={rimoStyle("width: 100%")} data-page-node-id="tTeShNft7VyR6DPPCHlCTb" slots={{
          "toolbar": _slot => <><RimoElement kind="el-input" modelValue={view.filters.query} onModelChange={value => {
              model.write(["filters", "query"], value);
            }} placeholder="搜索合約編號 / 合約名稱" prefixIcon="Search" clearable={true} style={rimoStyle("width: 240px")} data-page-node-id="SgzmJCQvxJD2m6HPvbsnPf"></RimoElement>
<RimoElement kind="el-select" modelValue={view.filters.type} onModelChange={value => {
              model.write(["filters", "type"], value);
            }} placeholder="合約類型" clearable={true} style={rimoStyle("width: 140px")} data-page-node-id="m3d8DQp7Pvw57GwGGgwMRL"><RimoElement kind="el-option" label="全部類型" value="ALL" data-page-node-id="o5cmwNkMOM3TcnlNdZ6KUG"></RimoElement>
<RimoElement kind="el-option" label="試用 (Trial)" value="TRIAL" data-page-node-id="lnZAj3XnEE1Wx2rtZo8viv"></RimoElement>
<RimoElement kind="el-option" label="正式 (Official)" value="OFFICIAL" data-page-node-id="nbBFmyEHhXZ7eJkvRafdvh"></RimoElement></RimoElement>
<RimoElement kind="el-select" modelValue={view.filters.billing} onModelChange={value => {
              model.write(["filters", "billing"], value);
            }} placeholder="繳費週期" clearable={true} style={rimoStyle("width: 140px")} data-page-node-id="ojEQiNPn0XxFGKMDilOBbQ"><RimoElement kind="el-option" label="全部週期" value="ALL" data-page-node-id="10GHrBNBq937xXdMM6tdc4"></RimoElement>
<RimoElement kind="el-option" label="月繳 (Monthly)" value="MONTHLY" data-page-node-id="BqllbWLNdQC669k9gG3o4B"></RimoElement>
<RimoElement kind="el-option" label="年繳 (Annually)" value="ANNUALLY" data-page-node-id="b87UNMrN4BM8kyin9FNoXh"></RimoElement></RimoElement>
<RimoElement kind="el-select" modelValue={view.filters.status} onModelChange={value => {
              model.write(["filters", "status"], value);
            }} placeholder="全部狀態" multiple={true} collapseTags={true} collapseTagsTooltip={true} clearable={true} style={rimoStyle("width: 190px")} data-page-node-id="6miuIynuVI9p8wZYUTMGzy"><RimoElement kind="el-option" label="生效中" value="ACTIVE" data-page-node-id="ufNvrbsUYXycH1y1eQ1Uhv"></RimoElement>
<RimoElement kind="el-option" label="已終止" value="TERMINATED" data-page-node-id="ecTbIrjmnyNRNZ6GS88lrf"></RimoElement>
<RimoElement kind="el-option" label="即將過期" value="EXPIRING_SOON" data-page-node-id="OSmdM9MMdMprqch53wsOqW"></RimoElement>
<RimoElement kind="el-option" label="付款確認中" value="PAYING" data-page-node-id="MX4Gs1OE6aX0VWnGnSr44g"></RimoElement>
<RimoElement kind="el-option" label="已過期" value="EXPIRED" data-page-node-id="tVPuawfHzsyxnO7cpAyDZ4"></RimoElement></RimoElement>
{view.currentUserRole === 'HEADQUARTERS' ? <><RimoElement kind="el-select" modelValue={view.filters.allocation} onModelChange={value => {
                model.write(["filters", "allocation"], value);
              }} placeholder="全部分配狀態" multiple={true} collapseTags={true} collapseTagsTooltip={true} clearable={true} style={rimoStyle("width: 220px")} data-page-node-id="uLEhi7ScgWPiik5fJl42gE"><RimoElement kind="el-option" label="已全部分配" value="FULL" data-page-node-id="stunb9CXMlDxfWTCv4opgs"></RimoElement>
<RimoElement kind="el-option" label="部分分配" value="PARTIAL" data-page-node-id="TyxWv9MhdjQZm1PxjJY7ua"></RimoElement>
<RimoElement kind="el-option" label="未分配" value="UNASSIGNED" data-page-node-id="pLZK1A71MaLMTISYdQrAyD"></RimoElement></RimoElement></> : null}
<div className="ml-auto text-sm text-gray-500" data-page-node-id="xpACGNNqcIO3Zy5Z041vD0">{text("\n                            共檢索到 ")}
<span className="font-bold text-gray-800" data-page-node-id="QxRqJyGM8a7HhJcFDOGHkU">{rimoText(view.filteredData.length)}</span>
{text(" 份合約\n                        ")}</div></>
        }}><RimoElement kind="el-table-column" label="合約編號與名稱" minWidth="260" data-page-node-id="0pGA38CAuIyMZaRtgtC9Pn" slots={{
            "default": ({
              row
            }) => <><div className="font-mono text-gray-800 text-sm font-semibold" data-page-node-id="bN19BGALiW8blBRQjWfZPj">{rimoText(row.id)}</div>
<div className="text-xs text-gray-500 mt-1 truncate" title={row.name} data-page-node-id="vJBhsYDzu0RcypHLipDB0A">{rimoText(row.name)}</div>
{view.currentUserRole === 'HEADQUARTERS' ? <><div className="flex flex-wrap gap-2">{view.taskNotice(row.id, 'out') ? <><RimoElement kind="el-button" link={true} type="warning" size="small" onClick={_event => {
                      view.openTaskList(row.id);
                    }}>{text("有轉出任務")}</RimoElement></> : null}
{view.taskNotice(row.id, 'in') ? <><RimoElement kind="el-button" link={true} type="primary" size="small" onClick={_event => {
                      view.openTaskList(row.id);
                    }}>{text("有轉入任務")}</RimoElement></> : null}
{view.taskFailed(row.id) ? <><RimoElement kind="el-button" link={true} type="danger" size="small" onClick={_event => {
                      view.openTaskList(row.id);
                    }}>{text("轉移失敗")}</RimoElement></> : null}</div></> : null}</>
          }}></RimoElement>
<RimoElement kind="el-table-column" label="合約類型" width="120" data-page-node-id="X0x3F697ZpIIB1Fvvt1jbi" slots={{
            "default": ({
              row
            }) => <>{row.type === 'TRIAL' ? <><RimoElement kind="el-tag" type="info" size="small" effect="plain" className="border-blue-200 text-blue-600 bg-blue-50" data-page-node-id="CxSHdhsnAwffajFWUtXLv8">{text("試用 (Trial)")}</RimoElement></> : null}
{row.type === 'OFFICIAL' ? <><RimoElement kind="el-tag" type="success" size="small" effect="light" className="text-emerald-600 bg-emerald-50 border-emerald-200" data-page-node-id="QFXC6v6tdbe3NwMG5BRhLP">{text("正式 (Official)")}</RimoElement></> : null}</>
          }}></RimoElement>
{view.currentUserRole === 'HEADQUARTERS' ? <><RimoElement kind="el-table-column" label="結算方" prop="settlementParty" minWidth="150" align="center" data-page-node-id="0ZEofYBxpGtlSSvXqW5YFs" slots={{
              "default": ({
                row
              }) => <><div className="text-sm text-gray-700" data-page-node-id="DmSgRMFrmeub5nfAIMe7xJ">{rimoText(row.settlementParty || '-')}</div></>
            }}></RimoElement></> : null}
<RimoElement kind="el-table-column" label="繳費週期" width="100" align="center" data-page-node-id="nYYuRtFdG1sZidvT40pmLz" slots={{
            "default": ({
              row
            }) => <><div className="text-sm text-gray-600 bg-gray-100 rounded px-2 py-0.5 inline-block" data-page-node-id="nYX7OTbxTcRDHi33CVLjtL">{text("\n                                    ")}{rimoText(row.billing === 'MONTHLY' ? '月繳' : '年繳')}{text("\n                                ")}</div></>
          }}></RimoElement>
<RimoElement kind="el-table-column" label="合約期限" minWidth="220" data-page-node-id="6fiDGvWbFMZXCcROkh7ugM" slots={{
            "default": ({
              row
            }) => <><div className="text-xs text-gray-600 flex items-center" data-page-node-id="zyr7KEsqk4eZtqB5l50CEN">{text("\n                                    ")}{rimoText(row.startDate)}{text(" ")}
<span className="mx-1 text-gray-400" data-page-node-id="JqiD2PzgAgEnHSLD6cgtOC">{text("至")}</span>
{text(" ")}{rimoText(row.endDate)}{text("\n                                    ")}
{view.getDaysRemaining(row.endDate) >= 0 && view.getDaysRemaining(row.endDate) < 15 ? <><div className="ml-2 flex items-center text-amber-500 font-semibold bg-amber-50 px-1.5 py-0.5 rounded" title="距離過期不足15天"><RimoElement kind="el-icon" className="mr-1 text-[14px]" data-page-node-id="Xf13yUAXcqAz1YhNcR5KbJ"><RimoIcon name="Warning" /></RimoElement>
{text("臨近到期\n                                    ")}</div></> : null}</div></>
          }}></RimoElement>
<RimoElement kind="el-table-column" label="配額使用情況" minWidth="240" data-page-node-id="hXbwe9wTVJCSFCqoAGCrh6" slots={{
            "default": ({
              row
            }) => <>{view.currentUserRole === 'HEADQUARTERS' ? <><div data-page-node-id="LT06UwZSpiUSGnLAobnKuv"><div className="flex items-center justify-between gap-3 text-[11px] text-gray-500 mb-1 whitespace-nowrap" data-page-node-id="CCsor91GqtOIZMaL0GMDVS"><span data-page-node-id="tx7KYEFZFCoMaETCIK3Ee2">{text("\n                                            總額度 ")}
<strong className="text-gray-700" data-page-node-id="OEEtjH7cvFegtXX2czqKK4">{rimoText(row.totalQuota)}</strong></span>
<span className="text-right" data-page-node-id="jruw0cV7FDRHd2LNcpLMGG">{text("\n                                            已下發 ")}
<strong className="text-[color:var(--app-color-primary)]" data-page-node-id="YHymHfwl59HbQUtT58vxXW">{rimoText(row.allocatedQuota)}</strong>
<span className="mx-1 text-gray-300" data-page-node-id="UCHzmM0b93bh4Kq9eXq56y">{text("·")}</span>
{text("\n                                            待分配 ")}
<strong className="text-amber-500" data-page-node-id="wFCn6RIDLkgEC9CZ4UbmuN">{rimoText(row.totalQuota - row.allocatedQuota)}</strong></span></div>
<RimoElement kind="el-progress" percentage={Math.round(row.allocatedQuota / row.totalQuota * 100)} strokeWidth={8} showText={false} className={rimoClass(view.getProgressClass(row))} data-page-node-id="19wZHtgW3VPtFKPLt0Hog8"></RimoElement></div></> : <><div data-page-node-id="Eq4Jo2GCWNyn4f396r2g5Y"><div className="flex items-center justify-between gap-3 text-[11px] text-gray-500 mb-1 whitespace-nowrap" data-page-node-id="h4SRnci9dBGHKM6uNpUvmC"><span data-page-node-id="DGrxLYFyZ6moZBrqZAAy5j">{text("\n                                            可用總額度 ")}
<strong className="text-gray-700" data-page-node-id="oWFN6HUF4GarYJiYOOwKZ3">{rimoText(view.getBranchQuota(row))}</strong></span>
<span className="text-right" data-page-node-id="FA4SVtweAoF8GS8ZvOEizg">{text("\n                                            已綁定 ")}
<strong className="text-emerald-600" data-page-node-id="mEihhnyAf0dsxQVMp24Nc3">{rimoText(view.getBranchUsedQuota(row))}</strong>
<span className="mx-1 text-gray-300" data-page-node-id="HGuNHZGFMdHXWalHOLG8O3">{text("·")}</span>
{text("\n                                            剩餘可綁定 ")}
<strong className="text-amber-500" data-page-node-id="SXoKEHaQaLUb5rtJgeDikj">{rimoText(view.getBranchQuota(row) - view.getBranchUsedQuota(row))}</strong></span></div>
<RimoElement kind="el-progress" percentage={view.getBranchQuota(row) === 0 ? 0 : Math.round(view.getBranchUsedQuota(row) / view.getBranchQuota(row) * 100)} strokeWidth={8} showText={false} className={rimoClass(view.getBranchProgressClass(row))} data-page-node-id="FQQ4qmySdvDt6SFblDHw4C"></RimoElement></div></>}</>
          }}></RimoElement>
<RimoElement kind="el-table-column" label="狀態" width="120" align="center" data-page-node-id="930dbiDBZHyRc9V2r8z9vT" slots={{
            "default": ({
              row
            }) => <><span className={rimoClass(["flex items-center justify-center gap-1.5 text-sm", rimoClass(view.getStatusColorClass(row))])} data-page-node-id="oHVlqDGGxh9eFNjPhv9aoZ"><span className={rimoClass(["w-2 h-2 rounded-full", rimoClass(view.getStatusDotClass(row))])} data-page-node-id="KYdpnMVsvOkFH1iHP9M5Oh"></span>
{text("\n                                    ")}{rimoText(view.getStatusText(row))}{text("\n                                ")}</span></>
          }}></RimoElement>
<RimoElement kind="el-table-column" label="生效時間" width="170" slots={{
            "default": ({
              row
            }) => <><div className="text-xs text-gray-700">{rimoText(view.getEffectiveDisplay(row))}</div>
{view.getGiftDays(row) > 0 ? <><RimoElement kind="el-tag" type="success" size="small" effect="plain" className="mt-1">{text("贈送 ")}{rimoText(view.getGiftDays(row))}{text(" 天")}</RimoElement></> : null}</>
          }}></RimoElement>
<RimoElement kind="el-table-column" label="操作" width="236" align="left" headerAlign="left" fixed="right" slots={{
            "default": ({
              row
            }) => <>{view.currentUserRole === 'BRANCH' ? <><div className="flex items-center justify-start gap-1.5 whitespace-nowrap"><RimoElement kind="el-button" link={true} type="primary" size="small" onClick={_event => {
                    view.openVehiclesModal(row);
                  }}>{text("\n                                        查看下掛車輛\n                                    ")}</RimoElement></div></> : <><div className="action-btns"><RimoElement kind="el-button" link={true} type="primary" size="small" className={rimoClass(["action-btn action-btn--allocate", rimoClass({
                    'is-hidden': !view.canAllocateContract(row)
                  })])} onClick={_event => {
                    view.openAllocateModal(row);
                  }}>{text("\n                                        分配配額\n                                    ")}</RimoElement>
<RimoElement kind="el-button" link={true} type="primary" size="small" className="action-btn action-btn--details" onClick={_event => {
                    view.openDetailsModal(row);
                  }}>{text("查看分配明細")}</RimoElement>
<RimoElement kind="el-dropdown" trigger="click" className={rimoClass({
                    'is-hidden': !view.canTransferTo(row)
                  })} onCommand={_event => {
                    view.openTransferDialog(row);
                  }} slots={{
                    "dropdown": _slot => <><RimoElement kind="el-dropdown-menu"><RimoElement kind="el-dropdown-item" command="transfer">{text("轉移至其他合約")}</RimoElement></RimoElement></>
                  }}><RimoElement kind="el-button" link={true} type="primary" size="small" className="action-btn action-btn--more">{text("\n                                            更多")}
<RimoElement kind="el-icon" className="ml-1"><RimoIcon name="ArrowDown" /></RimoElement></RimoElement></RimoElement></div></>}</>
          }}></RimoElement></RimoElement></div>
<div className="role-view-switcher" aria-label="頁面視角切換" data-page-node-id="baLOokCX9BOjmAEgbnnEoT"><span className="role-view-switcher__label" data-page-node-id="GeZTuwfBuOyA6XSDLWJkBQ">{text("頁面視角")}</span>
<RimoElement kind="el-radio-group" modelValue={view.currentUserRole} onModelChange={value => {
          model.write(["currentUserRole"], value);
        }} size="small" onChange={event => {
          view.handleRoleChange?.(event);
        }} data-page-node-id="pmPiKEEcFvCTcnA9GnmW0Y"><RimoElement kind="el-radio-button" label="HEADQUARTERS" data-page-node-id="7CWGjrkYmmEOPi7DHXU6Zl">{text("總公司")}</RimoElement>
<RimoElement kind="el-radio-button" label="BRANCH" data-page-node-id="8QrP3Kx5dyrXEkWO6YDMEm">{text("分公司")}</RimoElement></RimoElement></div></div>{view.currentUserRole === 'HEADQUARTERS' ? <><RimoElement kind="el-dialog" modelValue={view.modals.allocate} onModelChange={value => {
        model.write(["modals", "allocate"], value);
      }} title="分配配額" width="480px" className="contract-quotas-overlay" data-page-node-id="qCBoBz1tz8pKM8QLChWF2Z" slots={{
        "footer": _slot => <><RimoElement kind="el-button" onClick={_event => {
            model.write(["modals", "allocate"], false);
          }} data-page-node-id="DBwe2EYrQiC0ictGi31pLo">{text("取消")}</RimoElement>
<RimoElement kind="el-button" type="primary" onClick={event => {
            view.confirmAllocation?.(event);
          }} disabled={!view.allocateForm.branchId || !view.allocateForm.amount} data-page-node-id="CF7aHxI3YCTbRBEuQxyyrh">{text("確認下發")}</RimoElement></>
      }}>{() => <>{view.activeContract ? <><div className="mb-5 bg-gray-50 p-4 border rounded-lg border-gray-200" data-page-node-id="5vdncyBmG91TLKiRDv2VQp"><div className="text-xs text-gray-500 mb-1" data-page-node-id="i0ZNpkhJhkfjT7N88ztLQr">{text("正在操作合約")}</div>
<div className="font-mono text-gray-800 font-bold mb-3" data-page-node-id="Ujh49qI8gx4sGQLWsHYSiu">{rimoText(view.activeContract.id)}{text(" - ")}{rimoText(view.activeContract.name)}{text("\n                ")}</div>
<div className="flex items-center gap-2 text-sm text-gray-700 bg-[color:var(--app-color-primary-light-9)] text-[color:var(--app-color-primary-hover)] p-2 rounded" data-page-node-id="N5dqhinE0cEj0zaEGHNPwG"><RimoElement kind="el-icon" data-page-node-id="koIABFz5nlGbzjEDs8p5VN"><RimoIcon name="CopyDocument" /></RimoElement>
<span data-page-node-id="AOTBcybNAOtcaHwdLtllAF">{text("當前該合約可分配餘額：")}
<strong className="text-xl ms-1" data-page-node-id="tATS475kIAWFxvJtUnR5Tt">{rimoText(view.activeContract.totalQuota - view.activeContract.allocatedQuota)}</strong>
{text(" 臺")}</span></div></div></> : null}
<RimoElement kind="el-form" labelPosition="top" data-page-node-id="kg7FDQlFkFJM0QFUsDTF4P"><RimoElement kind="el-form-item" label="目標分公司" required={true} data-page-node-id="vrY8bFiN6zmrH7GNfsrhTv"><RimoElement kind="el-select" modelValue={view.allocateForm.branchId} onModelChange={value => {
                model.write(["allocateForm", "branchId"], value);
              }} className="w-full" filterable={true} placeholder="選擇分配給哪個分公司" data-page-node-id="RIgiiUHn2UWyNqh3B4N0DH">{rimoEntries(view.branchOptions).map(([b], _itemIndex) => <Fragment key={b.id}><RimoElement kind="el-option" key={b.id} label={b.name} value={b.id} data-page-node-id="GuOTMeaysazNPsW5zu0IBG"></RimoElement></Fragment>)}</RimoElement></RimoElement>
<RimoElement kind="el-form-item" label="分配數量" required={true} data-page-node-id="8XqxUaEmHqluqLkucivY63"><RimoElement kind="el-input-number" modelValue={view.allocateForm.amount} onModelChange={value => {
                model.write(["allocateForm", "amount"], value);
              }} min={1} max={view.activeContract ? Math.max(0, view.availablePool(view.activeContract)) : 1} className="w-full" stepStrictly={true} data-page-node-id="YACFPuF0qtOgQdW6wfsQyM"></RimoElement>
<div className="text-xs text-gray-400 mt-2 leading-tight" data-page-node-id="9FdF5jSytPB4FBlGard2Ye">{text("配額下發後，目標分公司即可在車輛管理中上架對應數量的車輛。此操作會佔用蓄水池配額。\n                    ")}</div></RimoElement></RimoElement></>}</RimoElement></> : null}
{view.currentUserRole === 'HEADQUARTERS' ? <><RimoElement kind="el-dialog" modelValue={view.modals.details} onModelChange={value => {
        model.write(["modals", "details"], value);
      }} title="合約分配明細" width="550px" className="contract-quotas-overlay" data-page-node-id="FMPUDjJXaOhjPXx7a3LgDm" slots={{
        "footer": _slot => <><RimoElement kind="el-button" type="primary" plain={true} onClick={_event => {
            model.write(["modals", "details"], false);
          }} data-page-node-id="dHVryfblAt1wDTbZMa0gPG">{text("關閉明細")}</RimoElement></>
      }}>{() => <>{view.activeContract ? <><div className="mb-4 text-sm text-gray-600" data-page-node-id="FFK2FdHRphbuXnJK7JvMOj">{text("\n                合約 ")}
<span className="font-mono font-bold text-gray-800" data-page-node-id="EwBeZZ4JUFMm0Ao3Goqx3k">{rimoText(view.activeContract.id)}</span>
{text(" 的已覈准分配記錄：\n            ")}</div></> : null}
<RimoElement kind="el-table" data={view.aggregatedAllocations} style={rimoStyle("width: 100%")} size="small" border={true} stripe={true} data-page-node-id="h9a1fnbTgfbc21wgGVbZwy"><RimoElement kind="el-table-column" label="分公司名稱" minWidth="150" data-page-node-id="5xh96ETqGeivzMd5HDCtdC" slots={{
              "default": ({
                row
              }) => <><div className="font-medium text-gray-700" data-page-node-id="QwBGAGngBBuVkNkKFf25Yk">{rimoText(view.getBranchName(row.branchId))}</div></>
            }}></RimoElement>
<RimoElement kind="el-table-column" label="已分配總配額" width="120" align="center" data-page-node-id="mf8h8Z5pj5bw5jqTmqJ1iS" slots={{
              "default": ({
                row
              }) => <><span className="font-bold text-[color:var(--app-color-primary)]" data-page-node-id="LoSNLKoVKktkP2RkaC0jqC">{rimoText(row.amount)}{text(" 臺")}</span></>
            }}></RimoElement>
<RimoElement kind="el-table-column" label="當前已綁定" width="110" align="center" data-page-node-id="X0AZQ7IHNNvOVuIoKoCyWg" slots={{
              "default": ({
                row
              }) => <><span className="font-medium text-emerald-600" data-page-node-id="CIg8Rd1zHBFG8u7HGyrplh">{rimoText(view.getBranchUsedQuotaById(view.activeContract, row.branchId))}{text(" 臺")}</span></>
            }}></RimoElement>
<RimoElement kind="el-table-column" label="操作" width="100" align="center" data-page-node-id="wKO4uZD25dDWzO2LyFhTep" slots={{
              "default": ({
                row
              }) => <><RimoElement kind="el-button" type="primary" link={true} size="small" onClick={_event => {
                  view.openAdjustModal(row);
                }} data-page-node-id="PHF8m4qbgRx31ICSFa4um6">{text("調整")}</RimoElement></>
            }}></RimoElement></RimoElement>
{view.aggregatedAllocations.length === 0 ? <><div className="text-center py-6 text-gray-400 text-sm" data-page-node-id="Lbv4Hvc0ZSmBQVCXiN0NpR">{text("暫無分配記錄")}</div></> : null}</>}</RimoElement></> : null}
{view.currentUserRole === 'HEADQUARTERS' ? <><RimoElement kind="el-dialog" modelValue={view.modals.adjust} onModelChange={value => {
        model.write(["modals", "adjust"], value);
      }} title="調整分配配額" width="400px" className="contract-quotas-overlay" data-page-node-id="E5glASyQBMbPeegKqzTcy8" slots={{
        "footer": _slot => <><RimoElement kind="el-button" onClick={_event => {
            model.write(["modals", "adjust"], false);
          }} data-page-node-id="nnJs6Ydkt9K86p2pwZRYro">{text("取消")}</RimoElement>
<RimoElement kind="el-button" type="primary" onClick={event => {
            view.confirmAdjust?.(event);
          }} data-page-node-id="WZcDDmZ1DFuElXgID76UTV">{text("確認調整")}</RimoElement></>
      }}>{() => <>{view.activeAllocation ? <><div className="mb-4 text-sm text-gray-700" data-page-node-id="swaOp45jgQE8fBcSN2DFnM">{text("\n                正在調整 ")}
<strong data-page-node-id="F7DgouW9J5NeHYSf2Kbm7F">{rimoText(view.getBranchName(view.activeAllocation.branchId))}</strong>
{text(" 的配額：\n            ")}</div></> : null}
<RimoElement kind="el-form" labelPosition="top" data-page-node-id="2PhWo6a04ZKV1Waiu4hj8y"><RimoElement kind="el-form-item" label="分配數量" required={true} data-page-node-id="vbaJ3k8XDekVHbosmHGUg2"><RimoElement kind="el-input-number" modelValue={view.adjustForm.amount} onModelChange={value => {
                model.write(["adjustForm", "amount"], value);
              }} min={0} max={view.adjustMaxAmount} className="w-full" stepStrictly={true} data-page-node-id="HIH4EKDVcJCRHKmQzVDFh8"></RimoElement>
<div className="text-xs text-gray-400 mt-2 leading-tight" data-page-node-id="y3Ynl55bnBAsJOQuG5Iyld">{text("\n                        調大將佔用蓄水池配額；調小將釋放給蓄水池（設爲0則取消分配）。")}
<br data-page-node-id="b4kDF85kHFa1Kr01GEIkv9" />
{text("\n                        當前該合約可再分配餘額：")}
<strong data-page-node-id="QX36ztVTfzPlXFWaoboKLs">{rimoText(view.activeContract ? view.activeContract.totalQuota - view.activeContract.allocatedQuota : 0)}</strong>
{text(" 臺\n                    ")}</div></RimoElement></RimoElement></>}</RimoElement></> : null}
{view.currentUserRole === 'BRANCH' ? <><RimoElement kind="el-dialog" modelValue={view.modals.vehicles} onModelChange={value => {
        model.write(["modals", "vehicles"], value);
      }} title="已綁定該合約的車輛列表" width="600px" className="contract-quotas-overlay" data-page-node-id="aWsIHE8kxCiJ8Q6Inxl6tv" slots={{
        "footer": _slot => <><RimoElement kind="el-button" type="primary" plain={true} onClick={_event => {
            model.write(["modals", "vehicles"], false);
          }} data-page-node-id="5K07nAu1cc6EdfdDEeDkqC">{text("關閉")}</RimoElement></>
      }}>{() => <>{view.activeContract ? <><div className="mb-4 text-sm text-gray-700 bg-emerald-50 p-3 rounded border border-emerald-100 flex items-center justify-between" data-page-node-id="2xMEAC2EN8zQ6gSe8AOw4O"><div data-page-node-id="9I0i4jkAhny2TeRNScSZB1"><span className="text-gray-500 mr-2" data-page-node-id="ozzQTcAQld8B6Pl9J7dtkk">{text("當前合約：")}</span>
<strong className="font-mono" data-page-node-id="1ZVpdWNXx4gJT38vZOpsuh">{rimoText(view.activeContract.id)}</strong></div>
<div data-page-node-id="5UVYDy7drPCBnMs29ZP9Cj"><span className="text-gray-500 mr-2" data-page-node-id="dWPpx8gE0UmmJ9ZxEAY76l">{text("配額使用率：")}</span>
<strong className="text-emerald-700" data-page-node-id="XHqiL44otiFOdrIWSfYf06">{rimoText(view.activeContractMockVehicles.length)}{text(" / ")}{rimoText(view.getBranchQuota(view.activeContract))}</strong>
{text(" 臺\n                ")}</div></div></> : null}
<RimoElement kind="el-table" data={view.activeContractMockVehicles} style={rimoStyle("width: 100%")} size="small" border={true} stripe={true} height="300" data-page-node-id="8zd8VlBLUmRFPJqKdDlxnZ"><RimoElement kind="el-table-column" prop="license" label="車牌號" width="120" data-page-node-id="xHncXx1qVnYPQWOYX4D5wT" slots={{
              "default": ({
                row
              }) => <><span className="font-bold text-gray-800" data-page-node-id="ETNRxgVsfWafVCHEDpjHeU">{rimoText(row.license)}</span></>
            }}></RimoElement>
<RimoElement kind="el-table-column" prop="model" label="車型" minWidth="150" data-page-node-id="DDZmj5SI8YuRTZ3KtPU56x"></RimoElement>
<RimoElement kind="el-table-column" prop="bindDate" label="綁定時間" width="160" align="center" data-page-node-id="R3Q7PP6x7rYtkEDQIGdatL"></RimoElement>
<RimoElement kind="el-table-column" prop="status" label="運營狀態" width="100" align="center" data-page-node-id="tTSUClpDglv6FfWiAiuLgy" slots={{
              "default": ({
                row
              }) => <><RimoElement kind="el-tag" type={row.status === 'ACTIVE' ? 'success' : 'info'} size="small" effect="plain" data-page-node-id="CvSvOdiPlmYFsUeR3JODoq">{text("\n                            ")}{rimoText(row.status === 'ACTIVE' ? '上架中' : '已下架')}{text("\n                        ")}</RimoElement></>
            }}></RimoElement>
<RimoElement kind="el-table-column" label="操作" width="90" align="center" data-page-node-id="gf2ZDbTWr9GEoOvlRJA0Ce" slots={{
              "default": ({
                row
              }) => <><RimoElement kind="el-button" type="danger" link={true} size="small" onClick={_event => {
                  view.unbindVehicleFromContract(row);
                }} data-page-node-id="lHV83IqqLWwpkWH4V7xIAI">{text("解綁")}</RimoElement></>
            }}></RimoElement></RimoElement>
{view.activeContractMockVehicles.length === 0 ? <><div className="text-center py-6 text-gray-400 text-sm" data-page-node-id="0pLh0GyEEDGRKroy5YMKUM">{text("\n                當前合約暫未綁定任何車輛\n            ")}</div></> : null}</>}</RimoElement></> : null}
{view.currentUserRole === 'HEADQUARTERS' ? <><RimoElement kind="el-dialog" modelValue={view.taskListOpen} onModelChange={value => {
        model.write(["taskListOpen"], value);
      }} title="合約轉移任務" width="1100px" className="contract-quotas-overlay transfer-dialog" closeOnClickModal={false} slots={{
        "footer": _slot => <><RimoElement kind="el-button" onClick={_event => {
            model.write(["taskListOpen"], false);
          }}>{text("關閉")}</RimoElement></>
      }}>{() => <><div className="transfer-toolbar"><RimoElement kind="el-input" modelValue={view.taskFilter.query} onModelChange={value => {
              model.write(["taskFilter", "query"], value);
            }} placeholder="搜尋合約編號或名稱" aria-label="搜尋轉移任務" clearable={true} style={rimoStyle("width:260px")}></RimoElement>
<RimoElement kind="el-select" modelValue={view.taskFilter.status} onModelChange={value => {
              model.write(["taskFilter", "status"], value);
            }} placeholder="全部狀態" aria-label="任務狀態" clearable={true} style={rimoStyle("width:150px")}>{rimoEntries(view.taskStatuses).map(([label, value], _itemIndex) => <Fragment key={value}><RimoElement kind="el-option" key={value} label={label} value={value}></RimoElement></Fragment>)}</RimoElement>
<RimoElement kind="el-button" className="transfer-push" type="primary" onClick={_event => {
              view.openTransferDialog(null);
            }}>{text("新增轉移任務")}</RimoElement></div>
<RimoElement kind="el-table" data={view.pagedTasks} maxHeight="400" emptyText="暫無符合條件的任務"><RimoElement kind="el-table-column" label="來源合約" minWidth="220" slots={{
              "default": ({
                row
              }) => <><div>{rimoText(row.sourceId)}</div>
<div className="transfer-muted">{rimoText(row.sourceSnapshot.name)}</div></>
            }}></RimoElement>
<RimoElement kind="el-table-column" label="目標合約" minWidth="220" slots={{
              "default": ({
                row
              }) => <><div>{rimoText(row.targetId)}</div>
<div className="transfer-muted">{rimoText(row.targetSnapshot.name)}</div></>
            }}></RimoElement>
<RimoElement kind="el-table-column" label="車輛數" width="80" align="right" slots={{
              "default": ({
                row
              }) => <>{rimoText(row.vehicleIds.length)}{text(" 輛")}</>
            }}></RimoElement>
<RimoElement kind="el-table-column" label="執行時間" width="170" slots={{
              "default": ({
                row
              }) => <><div>{rimoText(view.formatTaskTime(row.executedAt || row.scheduledAt))}</div>
<div className="transfer-muted">{rimoText(row.executedAt ? '實際執行' : '預計執行')}</div></>
            }}></RimoElement>
<RimoElement kind="el-table-column" label="狀態" width="110" slots={{
              "default": ({
                row
              }) => <><RimoElement kind="el-tag" type={view.taskTypes[row.status]}>{rimoText(view.taskStatuses[row.status])}</RimoElement></>
            }}></RimoElement>
<RimoElement kind="el-table-column" label="操作" width="135" fixed="right" slots={{
              "default": ({
                row
              }) => <><RimoElement kind="el-button" link={true} type="primary" onClick={_event => {
                  view.openTransferDialog(null, row);
                }}>{text("查看")}</RimoElement>
{['PENDING', 'FAILED'].includes(row.status) ? <><RimoElement kind="el-button" link={true} type="danger" onClick={_event => {
                    view.cancelTask(row);
                  }}>{text("取消")}</RimoElement></> : null}</>
            }}></RimoElement></RimoElement>
<div className="flex justify-end mt-4"><RimoElement kind="el-pagination" currentPage={view.taskPage} onCurrentPageChange={value => {
              model.write(["taskPage"], value);
            }} pageSize={5} total={view.filteredTasks.length} layout="total, prev, pager, next"></RimoElement></div></>}</RimoElement></> : null}
{view.currentUserRole === 'HEADQUARTERS' ? <><RimoElement kind="el-dialog" modelValue={view.modals.transfer} onModelChange={value => {
        model.write(["modals", "transfer"], value);
      }} title={view.transferReadonly ? '轉移任務詳情' : '車輛轉移至其他合約'} width="900px" className="contract-quotas-overlay transfer-dialog" closeOnClickModal={false} data-page-node-id="hwUffcxUA1RcDyKusFcDDi" slots={{
        "footer": _slot => <><div className="transfer-footer" data-page-node-id="8ND2rALbVArzcn0ZJErDkw">{view.currentTask && ['PENDING', 'FAILED'].includes(view.currentTask.status) ? <><RimoElement kind="el-button" type="danger" plain={true} disabled={view.transferBusy} onClick={_event => {
                view.cancelTask(view.currentTask);
              }}>{text("取消轉移任務")}</RimoElement></> : null}
<span className="transfer-push" data-page-node-id="5G8s0HZCExymzSlBrtlrLF"></span>
<RimoElement kind="el-button" onClick={_event => {
              model.write(["modals", "transfer"], false);
            }} data-page-node-id="1Y885WmTD6C3q0S71ReZDj">{text("返回")}</RimoElement>
{!view.transferReadonly ? <><RimoElement kind="el-button" type="primary" loading={view.transferBusy} disabled={!!view.transferPreview.error} onClick={event => {
                view.confirmTransfer?.(event);
              }} data-page-node-id="rF9KBPOxnIo98ehI2qBn3g">{rimoText(view.transferForm.mode === 'IMMEDIATE' ? '確認立即轉移' : '儲存轉移任務')}</RimoElement></> : null}</div></>
      }}>{() => <><div className="transfer-editor-body" data-page-node-id="830hD8J3Xi48xFbsk4XXgZ">{view.currentTask && view.currentTask.failureReason ? <><RimoElement kind="el-alert" title={view.currentTask.failureReason} type="error" closable={false} showIcon={true}></RimoElement></> : null}
{view.currentTask && ['PENDING', 'FAILED'].includes(view.currentTask.status) ? <><div className="transfer-muted mt-2 rounded border border-amber-100 bg-amber-50 px-3 py-2">{text("已有轉移任務不能修改內容；如需調整，請先取消任務，再重新建立。")}</div></> : null}
{!view.transferForm.sourceId ? <><RimoElement kind="el-form" labelPosition="top"><RimoElement kind="el-form-item" label="來源合約" required={true}><RimoElement kind="el-select" modelValue={view.transferForm.sourceId} onModelChange={value => {
                    model.write(["transferForm", "sourceId"], value);
                  }} filterable={true} placeholder="請選擇來源合約" onChange={event => {
                    view.selectTransferSource?.(event);
                  }}>{rimoEntries(view.sourceOptions).map(([row], _itemIndex) => <Fragment key={row.id}><RimoElement kind="el-option" key={row.id} label={row.id + ' · ' + row.name} value={row.id}></RimoElement></Fragment>)}</RimoElement></RimoElement></RimoElement></> : null}
{view.transferSourceContract ? <><div className="transfer-original-summary" data-page-node-id="rlPLL8QaR9dVKxoRCTiM1u"><div className="transfer-metric transfer-source-summary" data-page-node-id="Vqs2eHQNp7GlCBlxNinqaz"><div className="transfer-muted" data-page-node-id="ECdTUEFjq7VAbfFOLM62BR">{text("來源合約（目前合約）")}</div>
<strong data-page-node-id="JAE1DWtljKq35B7oczR2wG">{rimoText(view.transferSourceContract.id)}{text(" · ")}{rimoText(view.transferSourceContract.name)}</strong>
<div className="transfer-muted" data-page-node-id="Z3Mp0ilTUEo7NZqC3GSu1L">{text("總配額 ")}{rimoText(view.transferSourceContract.totalQuota)}{text(" 臺")}</div></div>
<div className="transfer-metric" data-page-node-id="WtBt2zXRu6aXhd0WUbsudo"><div className="transfer-muted" data-page-node-id="FtXcFTeQXkPQeD08EFBWDz">{text("來源已分配配額")}</div>
<strong data-page-node-id="GMIOe1UsQ0OGdyMqSvA3ZI">{rimoText(view.transferSourceContract.allocatedQuota)}{text(" 臺")}</strong></div>
<div className="transfer-metric" data-page-node-id="Dy8VzTb5lpdnMheF5Xd1i8"><div className="transfer-muted" data-page-node-id="tLjsw2KQ8dhHqkEbppWPrT">{text("來源已綁車輛")}</div>
<strong data-page-node-id="un7tAhCzv4cUgwC0SGh9A1">{rimoText(view.transferSourceVehicles.length)}{text(" 臺")}</strong></div></div></> : null}
<RimoElement kind="el-form" labelPosition="top" disabled={view.transferReadonly || view.transferBusy} data-page-node-id="dIFXaSuFMj7L7CiKShcTSi"><RimoElement kind="el-form-item" label="目標合約" required={true} data-page-node-id="G5tRRpq1f9bb1JyLOjappd"><RimoElement kind="el-select" modelValue={view.transferForm.targetId} onModelChange={value => {
                  model.write(["transferForm", "targetId"], value);
                }} filterable={true} placeholder="請選擇目標合約" onChange={event => {
                  view.changeTransferTarget?.(event);
                }} data-page-node-id="aMyf538nBhyztCpXLRNz25">{rimoEntries(view.transferTargetOptions).map(([row], _itemIndex) => <Fragment key={row.id}><RimoElement kind="el-option" key={row.id} label={row.id + ' · ' + row.name} value={row.id} data-page-node-id="7oTzc7OVY5oyKSDi54RyYu"></RimoElement></Fragment>)}</RimoElement></RimoElement></RimoElement>
{view.transferTargetContract ? <><div className="transfer-quota-line transfer-target-quota" data-page-node-id="rgewHPfBxcVswqEwKgXDz2"><span data-page-node-id="sFdQ616KP9ApcHCDHVmZGL">{text("目標總配額 ")}
<strong data-page-node-id="UzKBvP28QxPlT5uwxPyXKI">{rimoText(view.transferTargetContract.totalQuota)}</strong>
{text(" 臺")}</span>
<span data-page-node-id="EZgDLidt5Xu187yzaJVCfi">{text("已分配 ")}
<strong data-page-node-id="QRm54DOCUunocZ3bbHFR3c">{rimoText(view.transferTargetContract.allocatedQuota)}</strong>
{text(" 臺")}</span>
<span data-page-node-id="8QZ4oeuCq0cLTPAJpaCnXq">{text("待分配可用 ")}
<strong data-page-node-id="pOTOp6jGkSADiiHNpXx22a">{rimoText(view.transferTargetAvailable)}</strong>
{text(" 臺")}</span></div></> : null}
{view.transferSourceContract ? <><><div className="transfer-toolbar" data-page-node-id="jNV4rQiEo9SiZDAbso9D4k"><strong data-page-node-id="Luk4gOWPc7wwAhBadGeGcz">{text("選擇需要轉移的車輛")}</strong>
<span className="transfer-push transfer-muted" data-page-node-id="uTj3PynWCAy1TCKeT8MBQE">{text("系統自動在目標合約為所選車輛補充分公司配額；未分配配額按列表順序補充，用盡後後續分公司需調整選車")}</span></div>
<RimoElement kind="el-table" data={view.transferBranchRows} border={true} size="small" maxHeight="320" emptyText="暫無可轉移車輛" data-page-node-id="9lwldPTZuQAPO1TLbvHzUh"><RimoElement kind="el-table-column" label="選擇" width="64" align="center" data-page-node-id="DubHo02fmS5dI1nC0aqoCl" slots={{
                    "default": ({
                      row
                    }) => <><RimoElement kind="el-checkbox" modelValue={row.selectedCount > 0} disabled={view.transferReadonly || view.transferBusy || !row.selectedCount && row.maxSelectable === 0} indeterminate={row.selectedCount > 0 && row.selectedCount < row.vehicles.length} aria-label={'選取 ' + row.name} onChange={event => {
                        view.toggleTransferBranch(row, event);
                      }}></RimoElement></>
                  }}></RimoElement>
<RimoElement kind="el-table-column" prop="name" label="分公司" minWidth="150" data-page-node-id="YCqCJknPOFPywQX071APoU"></RimoElement>
<RimoElement kind="el-table-column" label="來源已綁車輛" width="110" align="center" data-page-node-id="eX3Qv2U0HyPTBEWsfFVHXq" slots={{
                    "default": ({
                      row
                    }) => <>{rimoText(row.vehicles.length)}{text(" 臺")}</>
                  }}></RimoElement>
<RimoElement kind="el-table-column" label="目標已分配" width="100" align="center" slots={{
                    "default": ({
                      row
                    }) => <>{rimoText(row.targetAllocatedQuota)}{text(" 臺")}</>
                  }}></RimoElement>
<RimoElement kind="el-table-column" label="目標空餘" width="90" align="center" slots={{
                    "default": ({
                      row
                    }) => <>{rimoText(row.targetFreeQuota)}{text(" 臺")}</>
                  }}></RimoElement>
<RimoElement kind="el-table-column" label="轉移車輛" width="120" align="center" data-page-node-id="iG0bMPhKQEYhm1NSJZhsfa" slots={{
                    "default": ({
                      row
                    }) => <><RimoElement kind="el-button" link={true} type="primary" size="small" onClick={_event => {
                        view.openTransferVehiclePicker(row);
                      }} data-page-node-id="Bk24r5rodF81LQbx4JjQCs">{text("已選 ")}{rimoText(row.selectedCount)}{text(" 臺")}</RimoElement></>
                  }}></RimoElement>
<RimoElement kind="el-table-column" label="需補充" width="130" align="center" slots={{
                    "default": ({
                      row
                    }) => <><span className={rimoClass(row.quotaShortage ? 'text-red-600 font-semibold' : '')}>{rimoText(row.quotaToAdd)}{text(" 臺")}</span>
{row.quotaToAdd ? <><div className="transfer-muted">{text("未分配補 ")}{rimoText(row.unallocatedQuotaUsed)}{text(" 臺")}
{row.quotaShortage ? <><span className="text-red-600">{text("，不足 ")}{rimoText(row.quotaShortage)}{text(" 臺")}</span></> : null}</div></> : null}</>
                  }}></RimoElement>
<RimoElement kind="el-table-column" label="轉移後來源剩餘車輛" width="165" align="center" data-page-node-id="1Et0puuSGCGXquNxbHCz6F" slots={{
                    "default": ({
                      row
                    }) => <>{rimoText(row.vehicles.length - row.selectedCount)}{text(" 臺")}</>
                  }}></RimoElement></RimoElement>
<div className="transfer-quota-line transfer-inline-summary" data-page-node-id="ZMCtJC284o45p72a7xV9d8"><span data-page-node-id="j0xPUYrhpDe4vVoy9G0R5p">{text("本次轉移 ")}
<strong data-page-node-id="s1xTUYEjKXSOyLcjxDNRde">{rimoText(view.transferForm.vehicleIds.length)}</strong>
{text(" 輛")}</span>
<span data-page-node-id="VVoo11f2vT2bl9HrVlxLrd">{text("使用既有配額 ")}
<strong data-page-node-id="nCGHvuZUf9aMQNDMxEgkqv">{rimoText(view.transferPreview.reused)}</strong>
{text(" 臺")}</span>
<span data-page-node-id="xhLNbaFB5Co0XjNZB7fzQF">{text("需新增配額 ")}
<strong data-page-node-id="fQoSoO8oxdV3ugWOoHZIRR">{rimoText(view.transferPreview.extra)}</strong>
{text(" 臺")}</span>
<span>{text("未分配剩餘 ")}
<strong>{rimoText(view.transferQuotaSummary.remaining)}</strong>
{text(" 臺")}</span></div></></> : null}
<div className="mt-4 pt-4 border-t border-gray-100"><div className="text-sm font-semibold mb-2">{text("轉移時間")}</div>
<RimoElement kind="el-radio-group" modelValue={view.transferForm.mode} onModelChange={value => {
                model.write(["transferForm", "mode"], value);
              }} disabled={view.transferReadonly || view.transferBusy}><RimoElement kind="el-radio-button" value="IMMEDIATE">{text("立即轉移")}</RimoElement>
<RimoElement kind="el-radio-button" value="SOURCE_EXPIRE">{text("來源合約到期時轉移")}</RimoElement></RimoElement>
{view.transferForm.mode === 'SOURCE_EXPIRE' ? <><div className="transfer-muted mt-2">{text("預計執行：")}{rimoText(view.formatTaskTime(view.transferReadonly ? view.currentTask.scheduledAt : view.transferPreview.scheduledAt))}{text("；儲存後預留目標容量。")}</div></> : null}</div>
{!view.transferReadonly && view.transferPreview.error ? <><RimoElement kind="el-alert" title={view.transferPreview.error} type="warning" closable={false} showIcon={true} className="transfer-alert" data-page-node-id="mVM6IgtrGGfjyw7puNKOEN"></RimoElement></> : null}</div></>}</RimoElement></> : null}
{view.currentUserRole === 'HEADQUARTERS' ? <><RimoElement kind="el-dialog" modelValue={view.transferVehiclePickerOpen} onModelChange={value => {
        model.write(["transferVehiclePickerOpen"], value);
      }} title={'選擇轉移車輛 · ' + view.transferActiveBranchName} width="640px" appendToBody={true} className="contract-quotas-overlay transfer-dialog" closeOnClickModal={false} data-page-node-id="dCxVtXf5zzDvZSis5dZ6HU" slots={{
        "footer": _slot => <><RimoElement kind="el-button" onClick={_event => {
            model.write(["transferVehiclePickerOpen"], false);
          }} data-page-node-id="rRm5FlnWaecKhkNPAnjy4j">{text("取消")}</RimoElement>
{!view.transferReadonly ? <><RimoElement kind="el-button" type="primary" onClick={event => {
              view.confirmTransferPicker?.(event);
            }} data-page-node-id="h79Zh0dlknvr3CDNwvieCt">{text("確認選擇")}</RimoElement></> : null}</>
      }}>{() => <><div className="transfer-toolbar" data-page-node-id="DAgbP33bpXT3vR1r29nHzg"><RimoElement kind="el-input" modelValue={view.transferPickerQuery} onModelChange={value => {
              model.write(["transferPickerQuery"], value);
            }} placeholder="搜尋車牌" clearable={true} style={rimoStyle("width: 240px")} data-page-node-id="0wczOBxOIWeC2r1VGPcSET"></RimoElement>
<span className="transfer-push" data-page-node-id="gGBuL8fdwBTF7mAqvd8FKO">{text("已選 ")}{rimoText(view.transferPickerIds.length)}{text(" 臺")}</span></div>
<RimoElement kind="el-table" data={view.transferPickerVehicles} border={true} maxHeight="350" data-page-node-id="ppPlYSng0OeI73UAcQHlvh"><RimoElement kind="el-table-column" width="46" align="center" data-page-node-id="gRFl1lzAKQxwjRppYRQri5" slots={{
              "header": _slot => <><RimoElement kind="el-checkbox" modelValue={view.pickerAll} indeterminate={view.pickerSome && !view.pickerAll} disabled={view.transferReadonly || !view.transferPickerVehicles.length} aria-label="選擇搜尋結果" onChange={event => {
                  view.togglePickerAll?.(event);
                }}></RimoElement></>,
              "default": ({
                row
              }) => <><RimoElement kind="el-checkbox" modelValue={view.transferPickerIds.includes(row.id)} disabled={view.transferReadonly} aria-label={'選擇 ' + row.license} onChange={event => {
                  view.togglePickerVehicle(row.id, event);
                }}></RimoElement></>
            }}></RimoElement>
<RimoElement kind="el-table-column" prop="license" label="車牌" width="140" data-page-node-id="uOeEl6rCV1Nf50dO4jYAoH"></RimoElement>
<RimoElement kind="el-table-column" prop="model" label="車型" minWidth="180" data-page-node-id="EM8LUmXDxaA1QNhKVqhFZX"></RimoElement>
<RimoElement kind="el-table-column" label="運營狀態" width="110" align="center" data-page-node-id="00156odpv5mIqvLKUoLrSU" slots={{
              "default": ({
                row
              }) => <><RimoElement kind="el-tag" type={row.status === 'ACTIVE' ? 'success' : 'info'} size="small" effect="plain" data-page-node-id="nUotXbOiR1yeRpyqBmQ4JB">{rimoText(row.status === 'ACTIVE' ? '上架中' : '已下架')}</RimoElement></>
            }}></RimoElement></RimoElement></>}</RimoElement></> : null}
<RimoElement kind="el-dialog" modelValue={view.modals.prototypeLog} onModelChange={value => {
      model.write(["modals", "prototypeLog"], value);
    }} title="原型修改記錄" width="520px" className="contract-quotas-overlay" data-page-node-id="Qu3CLEXb04cozoUutrV42V" slots={{
      "footer": _slot => <><RimoElement kind="el-button" type="primary" onClick={_event => {
          model.write(["modals", "prototypeLog"], false);
        }} data-page-node-id="9V7RxhKj0quUsPHwDpylHz">{text("關閉")}</RimoElement></>
    }}>{() => <><div className="mb-4 border-b pb-3 text-sm leading-6"><strong>{text("v1.2｜2026-09-11")}</strong>
<p>{text("修正轉移容量計算與車輛清單同步，保留車輛 ID；新增總公司轉移任務管理、立即／到期轉移及容量預留限制。")}</p></div>
<div className="space-y-4" data-page-node-id="jg7oulPF1QeuZAu6znejzR"><div className="mb-4 border-b pb-3 text-sm leading-6"><strong>{text("v1.3｜2026-09-14")}</strong>
<p>{text("轉移任務改為只讀查看，取消後重新建立；按分公司顯示目標配額空餘與需補充數，未分配配額按列表順序扣減。")}</p></div>
<div className="rounded-lg border border-blue-100 bg-blue-50/60 px-4 py-3" data-page-node-id="1N2CNS8ynDTsxI5mkz7Dsr"><div className="flex items-center justify-between gap-3" data-page-node-id="dQKTIpLTL5iCcbRhDJKD3D"><div className="font-semibold text-gray-800" data-page-node-id="wFeD5CQEfBDCxafoC86ONb">{text("v1.1｜合約配額列展示調整")}</div>
<RimoElement kind="el-tag" type="info" effect="plain" data-page-node-id="FYFXwSGzydpt288cxI3ysb">{text("2026-06-30")}</RimoElement></div>
<div className="text-sm text-gray-500 mt-1" data-page-node-id="DWnimCbPc0asWolIbA6oXJ">{text("頁面：合約配額管理")}</div></div>
<div className="text-sm text-gray-700 leading-6" data-page-node-id="IT4TvoAhxa2BBxuPFYmMsK"><div className="font-semibold text-gray-800 mb-1" data-page-node-id="M2sURgRA5kTkDjWl0nhGEC">{text("修改內容")}</div>
<ul className="list-disc pl-5 space-y-1" data-page-node-id="gIhIOHPkxx8WN5czX69HUA"><li data-page-node-id="TAyhCVSuPIxcHAoM0rcjBd">{text("配額使用情況列增加總公司視角的待分配配額顯示。")}</li>
<li data-page-node-id="u2JzPnvB5gwDSBLhmB5RBP">{text("分公司視角增加剩餘可綁定配額顯示。")}</li>
<li data-page-node-id="cMr38mQ7PtwNSiyeZy6zcM">{text("總公司視角的已下發數字和進度條統一使用主題強調色 ")}
<span className="font-mono text-[color:var(--app-color-primary)]" data-page-node-id="Irq8vTs3pLEGmyn1BkKE0o">{text("--app-color-primary")}</span>
{text("。")}</li>
<li>{text("配額進度條配色統一由樣式類 + 主題變量控制（")}
<span className="font-mono">{text(".quota-progress.*")}</span>
{text("），不寫死色值。")}</li>
<li data-page-node-id="LBR1HUFiY21zAPyh5jWVGP">{text("原配額使用情況結構已在源碼中保留註釋備份，便於回退。")}</li></ul></div>
<div className="text-xs text-gray-400 border-t pt-3" data-page-node-id="lxk2GcUYz4RaYbFO0gfOEx">{text("\n                    該記錄用於原型評審和交付追蹤，不代表真實系統功能入口。\n                ")}</div></div></>}</RimoElement></RimoRoot>;
}