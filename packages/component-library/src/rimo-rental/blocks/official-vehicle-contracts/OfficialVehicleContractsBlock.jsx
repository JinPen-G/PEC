import { Fragment } from 'react';
import { useRimoModel, rimoEntries } from '../../lib/rimo-model.js';
import { RimoRoot, RimoIcon, useRimoEnvironment } from '../../lib/RimoEnvironment.jsx';
import { RimoElement, rimoClass, rimoStyle, rimoText } from '../../lib/RimoElements.jsx';
import './official-vehicle-contracts.css';
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
    const tenantOptions = ref(['睿騰科技股份有限公司', '北辰電子股份有限公司', '安和醫療集團', '新竹智造股份有限公司', '南港商務服務股份有限公司', '高雄港勤股份有限公司']);
    const enterpriseRateMap = {
      '睿騰科技股份有限公司': {
        monthly: 6500,
        annually: 72000
      },
      '北辰電子股份有限公司': {
        monthly: 6500,
        annually: 72000
      },
      '安和醫療集團': {
        monthly: 6500,
        annually: 72000
      },
      '新竹智造股份有限公司': {
        monthly: 6500,
        annually: 72000
      },
      '南港商務服務股份有限公司': {
        monthly: 6500,
        annually: 72000
      },
      '高雄港勤股份有限公司': {
        monthly: 6500,
        annually: 72000
      }
    };
    const getEnterpriseRate = tenant => enterpriseRateMap[tenant] || null;
    const payerOptions = ref([{
      name: '格上租車',
      taxId: '12208883',
      contact: '王怡君',
      phone: '02-2502-1388'
    }, {
      name: '和運租車',
      taxId: '70364778',
      contact: '陳志宏',
      phone: '02-2504-6298'
    }, {
      name: '中租租車',
      taxId: '27998128',
      contact: '林雅雯',
      phone: '02-8752-6388'
    }, {
      name: '企業自行結算',
      taxId: '83529106',
      contact: '財務窗口',
      phone: '02-2658-7712'
    }, {
      name: '艾維士租車',
      taxId: '53723009',
      contact: '黃柏勳',
      phone: '02-6620-6620'
    }]);
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
    const getNowDateTimeStr = () => {
      const d = new Date();
      const pad = value => String(value).padStart(2, '0');
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
    };
    const generateMockVehicles = () => {
      const brands = ['Toyota Corolla Cross', 'Lexus ES 250', 'Toyota Camry', 'Volkswagen Caddy', 'Mercedes-Benz Vito', 'Ford Kuga'];
      const platePrefixes = ['KDA', 'RDX', 'BPK', 'QAE', 'TDC'];
      const data = [];
      for (let i = 1; i <= 25; i++) {
        const brand = brands[(i - 1) % brands.length];
        const prefix = platePrefixes[(i - 1) % platePrefixes.length];
        const number = String(1200 + i * 137).padStart(4, '0');
        data.push({
          key: `V-2026-${i.toString().padStart(4, '0')}`,
          label: `${prefix}-${number} (${brand})`,
          disabled: i % 10 === 0
        });
      }
      return data;
    };
    const availableVehicles = ref(generateMockVehicles());
    const contractsData = ref([{
      id: 'OC-2026-0001',
      name: '睿騰科技年度公務車合約',
      tenant: '睿騰科技股份有限公司',
      payer: '睿騰科技股份有限公司',
      type: 'OFFICIAL',
      billing: 'ANNUALLY',
      quota: 20,
      vehicleCount: 12,
      allocatedQuota: 16,
      branchCount: 3,
      totalAmount: 288000.00,
      startDate: getPastDateStr(30),
      endDate: getFutureDateStr(335),
      effectMode: 'IMMEDIATE',
      effectiveAt: `${getPastDateStr(45)} 09:00`,
      status: 'ACTIVE'
    }, {
      id: 'OC-2026-0005',
      name: '北辰電子公務車試用方案',
      tenant: '北辰電子股份有限公司',
      payer: '和運租車',
      type: 'TRIAL',
      billing: 'MONTHLY',
      quota: 8,
      vehicleCount: 5,
      allocatedQuota: 6,
      branchCount: 2,
      totalAmount: 32000.00,
      startDate: getPastDateStr(5),
      endDate: getFutureDateStr(5),
      effectMode: 'CONTRACT_START',
      effectiveAt: `${getPastDateStr(5)} 00:00`,
      status: 'EXPIRING',
      successorContractId: ''
    }, {
      id: 'OC-2026-0012',
      name: '安和醫療主管接駁合約',
      tenant: '安和醫療集團',
      payer: '艾維士租車',
      type: 'OFFICIAL',
      billing: 'MONTHLY',
      quota: 10,
      vehicleCount: 6,
      allocatedQuota: 8,
      branchCount: 2,
      totalAmount: 48000.00,
      startDate: getPastDateStr(120),
      endDate: getPastDateStr(30),
      effectMode: 'CONTRACT_START',
      effectiveAt: `${getPastDateStr(120)} 00:00`,
      status: 'TERMINATED'
    }, {
      id: 'OC-2025-T092',
      name: '新竹智造短期試用合約',
      tenant: '新竹智造股份有限公司',
      payer: '新竹智造股份有限公司',
      type: 'TRIAL',
      billing: 'MONTHLY',
      quota: 3,
      vehicleCount: 2,
      allocatedQuota: 3,
      branchCount: 1,
      totalAmount: 16000.00,
      startDate: getPastDateStr(100),
      endDate: getPastDateStr(10),
      effectMode: 'CONTRACT_START',
      effectiveAt: `${getPastDateStr(100)} 00:00`,
      status: 'EXPIRED',
      successorContractId: ''
    }, {
      id: 'OC-2025-F811',
      name: '南港商務服務年度合約',
      tenant: '南港商務服務股份有限公司',
      payer: '中租租車',
      type: 'OFFICIAL',
      billing: 'ANNUALLY',
      quota: 6,
      vehicleCount: 4,
      allocatedQuota: 5,
      branchCount: 2,
      totalAmount: 192000.00,
      startDate: getPastDateStr(200),
      endDate: getFutureDateStr(165),
      effectMode: 'CONTRACT_START',
      effectiveAt: `${getPastDateStr(200)} 00:00`,
      status: 'TERMINATED',
      deleted: true
    }, {
      id: 'OC-2026-0020',
      name: '高雄港勤公務車正式合約',
      tenant: '高雄港勤股份有限公司',
      payer: '格上租車',
      type: 'OFFICIAL',
      billing: 'MONTHLY',
      quota: 6,
      vehicleCount: 4,
      allocatedQuota: 5,
      branchCount: 2,
      totalAmount: 36000.00,
      startDate: getFutureDateStr(15),
      endDate: getFutureDateStr(45),
      effectMode: 'CONTRACT_START',
      scheduledEffectiveAt: `${getFutureDateStr(15)} 00:00`,
      effectiveAt: '',
      status: 'PENDING_EFFECTIVE'
    }]);
    const transferTools = (() => {
      const clone = value => JSON.parse(JSON.stringify(value));
      const transferStatuses = {
        PENDING: {
          label: '待執行',
          type: 'warning'
        },
        COMPLETED: {
          label: '已完成',
          type: 'success'
        },
        FAILED: {
          label: '執行失敗',
          type: 'danger'
        },
        CANCELLED: {
          label: '已取消',
          type: 'info'
        }
      };
      const stamp = value => new Date(String(value || '').replace(' ', 'T')).getTime();
      const endAt = row => stamp(row.endDate + 'T00:00:00') + 86400000;
      const effectiveAt = row => stamp(row.effectiveAt || row.scheduledEffectiveAt || row.startDate + 'T00:00:00');
      const transferTime = value => {
        if (!value) return '—';
        const d = new Date(value),
          pad = n => String(n).padStart(2, '0');
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
      };
      const branches = ['臺北分公司', '臺中分公司', '臺南分公司', '高雄分公司'];
      const syncCounts = row => {
        row.allocatedQuota = row.transferBranches.reduce((n, b) => n + b.quota, 0);
        row.vehicleCount = row.transferBranches.reduce((n, b) => n + b.vehicles.length, 0);
        row.branchCount = row.transferBranches.length;
      };
      const ensureBranches = row => {
        if (row.transferBranches) return;
        const count = row.branchCount || (row.vehicleCount ? 1 : 0);
        row.transferBranches = Array.from({
          length: count
        }, (_, i) => ({
          id: `ENT-${tenantOptions.value.indexOf(row.tenant) + 1}-B${i + 1}`,
          name: branches[i % branches.length],
          quota: 0,
          vehicles: []
        }));
        for (let i = 0; i < (row.allocatedQuota || row.vehicleCount || 0); i++) row.transferBranches[i % count].quota++;
        for (let i = 0; i < row.vehicleCount; i++) {
          const b = row.transferBranches[i % count];
          b.vehicles.push({
            id: `${row.id}-V${i + 1}`,
            plate: `${['RDX', 'KDA', 'BPK', 'TDC'][tenantOptions.value.indexOf(row.tenant) % 4]}-${1200 + i * 137}`,
            model: ['Toyota Corolla Cross', 'Toyota Camry', 'Ford Kuga'][i % 3],
            branchId: b.id,
            branchName: b.name
          });
        }
      };
      contractsData.value.forEach(ensureBranches);
      [0, 1, 3].map(index => contractsData.value[index]).forEach((source, index) => {
        ensureBranches(source);
        const boundVehicles = source.transferBranches.flatMap(b => b.vehicles).slice(0, 3).map(v => ({
          ...clone(v),
          branchId: `${source.transferBranches[0].id}-R`,
          branchName: source.transferBranches[0].name
        }));
        const target = {
          ...clone(source),
          id: `OC-2026-R00${index + 1}`,
          name: source.tenant.replace('股份有限公司', '') + '續約公務車合約',
          type: 'OFFICIAL',
          quota: 12,
          vehicleCount: boundVehicles.length,
          allocatedQuota: boundVehicles.length + 1,
          branchCount: 1,
          startDate: getFutureDateStr(index === 0 ? 336 : -1),
          endDate: getFutureDateStr(index === 0 ? 700 : 365),
          status: index === 0 ? 'PENDING_EFFECTIVE' : 'ACTIVE',
          effectMode: 'CONTRACT_START',
          effectiveAt: index === 0 ? '' : getPastDateStr(1) + ' 00:00',
          scheduledEffectiveAt: getFutureDateStr(index === 0 ? 336 : -1) + ' 00:00',
          transferBranches: [{
            ...clone(source.transferBranches[0]),
            quota: boundVehicles.length + 1,
            vehicles: boundVehicles
          }],
          totalAmount: 24000
        };
        target.billing = 'MONTHLY';
        contractsData.value.push(target);
      });
      const transferTasks = ref([]);
      const pending = excludeId => transferTasks.value.filter(t => t.status === 'PENDING' && t.id !== excludeId);
      const contract = (id, rows = contractsData.value) => rows.find(r => r.id === id && !r.deleted);
      const vehiclesOf = row => row ? (ensureBranches(row), row.transferBranches.flatMap(b => b.vehicles)) : [];
      const hasRelatedTransferTask = id => pending().some(t => t.sourceId === id || t.targetId === id);
      const hasTransferNotice = (id, direction) => pending().some(t => t[direction === 'out' ? 'sourceId' : 'targetId'] === id);
      const hasTransferFailure = id => transferTasks.value.some(t => t.status === 'FAILED' && (t.sourceId === id || t.targetId === id));
      const canTransferContract = row => !!row && !row.deleted && ['ACTIVE', 'EXPIRING', 'EXPIRED'].includes(row.status);
      const availableTargets = sourceId => {
        const source = contract(sourceId);
        return contractsData.value.filter(r => !r.deleted && source && r.id !== source.id && r.tenant === source.tenant && ['ACTIVE', 'EXPIRING', 'PENDING_EFFECTIVE'].includes(r.status));
      };
      const evaluateTransfer = (draft, rows = contractsData.value, now = Date.now(), executing = false) => {
        const source = contract(draft.sourceId, rows),
          target = contract(draft.targetId, rows);
        const result = {
          error: '',
          extra: 0,
          reused: 0,
          available: 0,
          details: [],
          vehicles: [],
          scheduledAt: null,
          hasGap: false
        };
        const fail = error => ({
          ...result,
          error
        });
        if (!source || !target) return fail('請選擇來源及同一企業的目標合約。');
        if (!canTransferContract(source)) return fail('來源合約須為生效中、即將到期或已過期。');
        if (source.id === target.id || source.tenant !== target.tenant) return fail('來源與目標須為同一企業的不同合約。');
        if (!['ACTIVE', 'EXPIRING', 'PENDING_EFFECTIVE'].includes(target.status)) return fail('目標合約目前不允許接收車輛。');
        ensureBranches(target);
        if (!['IMMEDIATE', 'SOURCE_EXPIRE'].includes(draft.mode)) return fail('請選擇轉移時間。');
        result.scheduledAt = draft.mode === 'IMMEDIATE' ? now : Math.max(endAt(source), effectiveAt(target));
        result.hasGap = effectiveAt(target) > endAt(source);
        if (!Number.isFinite(result.scheduledAt) || !Number.isFinite(endAt(target))) return fail('合約日期資料不完整。');
        if (draft.mode === 'SOURCE_EXPIRE' && !executing && result.scheduledAt <= now) return fail('到期轉移時間已到，請改用立即轉移。');
        const executionAt = executing ? now : result.scheduledAt;
        const targetEffectiveNow = ['ACTIVE', 'EXPIRING', 'PENDING_EFFECTIVE'].includes(target.status) && effectiveAt(target) <= now && endAt(target) > now;
        if ((draft.mode === 'IMMEDIATE' || executing) && !targetEffectiveNow) return fail('目標合約尚未生效，不能立即轉移。');
        if (executionAt >= endAt(target)) return fail('執行時目標合約已過期，請選擇其他合約。');
        const otherTasks = pending(draft.id);
        if (otherTasks.some(t => t.sourceId === source.id)) return fail('來源合約已有待執行任務，請先取消原任務，再重新建立。');
        const ids = draft.vehicleIds || [];
        if (!ids.length) return fail('請至少選擇一輛車。');
        if (new Set(ids).size !== ids.length) return fail('車輛不可重複選取。');
        result.vehicles = ids.map(id => vehiclesOf(source).find(v => v.id === id));
        if (result.vehicles.some(v => !v)) return fail('部分車輛已不再綁定來源合約，請重新選擇。');
        if (draft.vehicles && draft.vehicles.some(v => result.vehicles.find(x => x.id === v.id)?.branchId !== v.branchId)) return fail('車輛所屬分公司已變更，請重新確認。');
        const reservations = otherTasks.filter(t => t.targetId === target.id);
        result.available = target.quota - target.transferBranches.reduce((n, b) => n + b.quota, 0) - reservations.reduce((n, t) => n + t.details.reduce((sum, d) => sum + d.extra, 0), 0);
        let remainingAvailable = Math.max(0, result.available);
        for (const b of source.transferBranches) {
          const selected = result.vehicles.filter(v => v.branchId === b.id);
          if (!selected.length) continue;
          const targetBranch = target.transferBranches.find(x => x.id === b.id);
          const reserved = reservations.reduce((n, t) => n + (t.details.find(d => d.branchId === b.id)?.reused || 0), 0);
          const free = Math.max(0, (targetBranch?.quota || 0) - (targetBranch?.vehicles.length || 0) - reserved);
          const reused = Math.min(free, selected.length),
            extra = selected.length - reused;
          const unallocatedQuotaUsed = Math.min(extra, remainingAvailable);
          const quotaShortage = extra - unallocatedQuotaUsed;
          result.details.push({
            branchId: b.id,
            branchName: b.name,
            selectedCount: selected.length,
            targetAllocatedQuota: targetBranch?.quota || 0,
            targetBoundVehicles: targetBranch?.vehicles.length || 0,
            targetFreeQuota: free,
            reused,
            extra,
            unallocatedPoolBefore: remainingAvailable,
            unallocatedQuotaUsed,
            unallocatedPoolAfter: Math.max(0, remainingAvailable - unallocatedQuotaUsed),
            quotaShortage
          });
          result.reused += reused;
          result.extra += extra;
          if (quotaShortage) return fail(`目標合約未分配配額已用盡，${b.name} 還缺 ${quotaShortage} 臺；請減少後續分公司的轉移車輛。`);
          remainingAvailable -= unallocatedQuotaUsed;
        }
        if (result.available < result.extra) return fail(`目標待分配配額 ${Math.max(0, result.available)} 臺，本次需新增 ${result.extra} 臺；請減少車輛或調整目標合約。`);
        return result;
      };
      const makeTask = (draft, preview, id) => ({
        id,
        sourceId: draft.sourceId,
        targetId: draft.targetId,
        sourceName: contract(draft.sourceId).name,
        targetName: contract(draft.targetId).name,
        mode: draft.mode,
        status: 'PENDING',
        vehicleIds: [...draft.vehicleIds],
        vehicles: clone(preview.vehicles),
        details: clone(preview.details),
        scheduledAt: preview.scheduledAt,
        executedAt: null,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        failureReason: '',
        events: []
      });
      const executeTask = (task, now = Date.now()) => {
        if (task.status !== 'PENDING') return task.status === 'COMPLETED';
        const preview = evaluateTransfer(task, contractsData.value, now, true);
        if (preview.error) {
          task.status = 'FAILED';
          task.failureReason = preview.error;
          task.updatedAt = now;
          task.events.push({
            at: now,
            action: 'FAILED',
            reason: preview.error
          });
          return false;
        }
        const source = contract(task.sourceId),
          target = contract(task.targetId);
        const sourceBranches = clone(source.transferBranches),
          targetBranches = clone(target.transferBranches);
        for (const d of preview.details) {
          let b = targetBranches.find(item => item.id === d.branchId);
          if (!b) {
            b = {
              id: d.branchId,
              name: d.branchName,
              quota: 0,
              vehicles: []
            };
            targetBranches.push(b);
          }
          b.quota += d.extra;
          b.vehicles.push(...clone(preview.vehicles.filter(v => v.branchId === b.id)));
        }
        sourceBranches.forEach(b => {
          b.vehicles = b.vehicles.filter(v => !task.vehicleIds.includes(v.id));
        });
        source.transferBranches = sourceBranches;
        target.transferBranches = targetBranches;
        syncCounts(source);
        syncCounts(target);
        if (target.status === 'PENDING_EFFECTIVE') {
          target.status = 'ACTIVE';
          target.effectiveAt = transferTime(effectiveAt(target));
        }
        task.details = clone(preview.details);
        task.status = 'COMPLETED';
        task.executedAt = now;
        task.updatedAt = now;
        task.failureReason = '';
        task.events.push({
          at: now,
          action: 'COMPLETED'
        });
        return true;
      };
      const first = contractsData.value[0],
        second = contractsData.value[1];
      const seed = (source, targetId, ids, id) => {
        const draft = {
          sourceId: source.id,
          targetId,
          mode: 'SOURCE_EXPIRE',
          vehicleIds: ids
        };
        return makeTask(draft, evaluateTransfer(draft), id);
      };
      transferTasks.value.push(seed(first, 'OC-2026-R001', vehiclesOf(first).slice(0, 2).map(v => v.id), 'TR-2026-0001'));
      const failed = seed(second, 'OC-2026-R002', vehiclesOf(second).map(v => v.id), 'TR-2026-0002');
      failed.status = 'FAILED';
      failed.scheduledAt = Date.now() - 86400000;
      failed.failureReason = '執行時目標容量不足；未轉移任何車輛。請取消原任務後重新建立。';
      transferTasks.value.push(failed);
      const cancelled = clone(failed);
      Object.assign(cancelled, {
        id: 'TR-2026-0003',
        status: 'CANCELLED',
        failureReason: '',
        updatedAt: Date.now() - 172800000
      });
      transferTasks.value.push(cancelled);
      const completed = clone(cancelled);
      Object.assign(completed, {
        id: 'TR-2026-0004',
        sourceId: 'OC-2025-0910',
        sourceName: '北辰電子前期公務車合約',
        targetId: second.id,
        targetName: second.name,
        mode: 'IMMEDIATE',
        status: 'COMPLETED',
        scheduledAt: Date.now() - 259200000,
        executedAt: Date.now() - 259200000
      });
      transferTasks.value.push(completed);
      const transferListOpen = ref(false),
        transferEditorOpen = ref(false),
        transferSaving = ref(false),
        transferPage = ref(1);
      const transferSourceSelectable = ref(false),
        transferVehiclePickerOpen = ref(false),
        transferActiveBranchId = ref(''),
        transferPickerQuery = ref(''),
        transferPickerIds = ref([]);
      const transferFilters = reactive({
        query: '',
        status: '',
        contractId: '',
        direction: ''
      });
      const transferDraft = reactive({
        id: '',
        sourceId: '',
        targetId: '',
        mode: 'IMMEDIATE',
        vehicleIds: []
      });
      const currentTransferTask = computed(() => transferTasks.value.find(t => t.id === transferDraft.id));
      const transferReadonly = computed(() => !!currentTransferTask.value);
      const transferPreview = computed(() => evaluateTransfer(transferDraft));
      const transferSourceOptions = computed(() => transferReadonly.value ? [{
        id: currentTransferTask.value.sourceId,
        name: currentTransferTask.value.sourceName
      }] : contractsData.value.filter(r => canTransferContract(r) || r.id === transferDraft.sourceId));
      const transferTargetOptions = computed(() => transferReadonly.value ? [{
        id: currentTransferTask.value.targetId,
        name: currentTransferTask.value.targetName
      }] : availableTargets(transferDraft.sourceId));
      const transferVehicles = computed(() => transferReadonly.value ? currentTransferTask.value.vehicles : vehiclesOf(contract(transferDraft.sourceId)));
      const transferBranchOptions = computed(() => [...new Map(transferVehicles.value.map(v => [v.branchId, {
        id: v.branchId,
        name: v.branchName
      }])).values()]);
      const transferSourceName = computed(() => transferReadonly.value ? currentTransferTask.value.sourceName : contract(transferDraft.sourceId)?.name || '');
      const transferSourceQuotaInfo = computed(() => {
        const row = contract(transferDraft.sourceId);
        return row ? {
          total: row.quota,
          allocated: row.allocatedQuota || 0
        } : null;
      });
      const transferTargetQuotaInfo = computed(() => {
        const row = contract(transferDraft.targetId);
        if (!row) return null;
        ensureBranches(row);
        const allocated = row.transferBranches.reduce((n, b) => n + b.quota, 0);
        const reserved = pending(transferDraft.id).filter(t => t.targetId === row.id).reduce((n, t) => n + t.details.reduce((s, d) => s + d.extra, 0), 0);
        return {
          total: row.quota,
          allocated,
          reserved,
          available: Math.max(0, row.quota - allocated - reserved)
        };
      });
      const transferTargetOptionLabel = row => {
        if (!row || row.quota == null) return `${row.id} · ${row.name}`;
        ensureBranches(row);
        const allocated = row.transferBranches.reduce((n, b) => n + b.quota, 0);
        const reserved = pending(transferDraft.id).filter(t => t.targetId === row.id).reduce((n, t) => n + t.details.reduce((s, d) => s + d.extra, 0), 0);
        const available = Math.max(0, row.quota - allocated - reserved);
        return `${row.id} · ${row.name}（待分配 ${available} 臺）`;
      };
      const transferBranchRows = computed(() => {
        const target = contract(transferDraft.targetId);
        if (target) ensureBranches(target);
        const pendingTargetTasks = target ? pending(transferDraft.id).filter(t => t.targetId === target.id) : [];
        let unallocatedPool = target ? Math.max(0, target.quota - target.transferBranches.reduce((n, b) => n + b.quota, 0) - pendingTargetTasks.reduce((n, t) => n + t.details.reduce((s, d) => s + d.extra, 0), 0)) : 0;
        return transferBranchOptions.value.map(b => {
          const vehicles = transferVehicles.value.filter(v => v.branchId === b.id);
          const targetBranch = target?.transferBranches?.find(item => item.id === b.id);
          const historyDetail = transferReadonly.value ? currentTransferTask.value?.details.find(d => d.branchId === b.id) : null;
          const reservedIdle = pendingTargetTasks.reduce((n, t) => n + (t.details.find(d => d.branchId === b.id)?.reused || 0), 0);
          const targetAllocatedQuota = historyDetail?.targetAllocatedQuota ?? (targetBranch?.quota || 0);
          const targetBoundVehicles = historyDetail?.targetBoundVehicles ?? (targetBranch?.vehicles?.length || 0);
          const targetFreeQuota = historyDetail?.targetFreeQuota ?? Math.max(0, targetAllocatedQuota - targetBoundVehicles - reservedIdle);
          const selectedCount = historyDetail?.selectedCount ?? vehicles.filter(v => transferDraft.vehicleIds.includes(v.id)).length;
          const quotaToAdd = historyDetail?.extra ?? Math.max(0, selectedCount - targetFreeQuota);
          const unallocatedPoolBefore = historyDetail?.unallocatedPoolBefore ?? unallocatedPool;
          const unallocatedQuotaUsed = historyDetail?.unallocatedQuotaUsed ?? Math.min(quotaToAdd, unallocatedPoolBefore);
          const quotaShortage = historyDetail?.quotaShortage ?? quotaToAdd - unallocatedQuotaUsed;
          unallocatedPool = historyDetail?.unallocatedPoolAfter ?? Math.max(0, unallocatedPoolBefore - unallocatedQuotaUsed);
          return {
            ...b,
            vehicles,
            sourceQuota: contract(transferDraft.sourceId)?.transferBranches?.find(item => item.id === b.id)?.quota || 0,
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
        const initial = transferTargetQuotaInfo.value?.available || 0;
        return {
          initial,
          used: rows.reduce((n, row) => n + row.unallocatedQuotaUsed, 0),
          remaining: rows.length ? rows[rows.length - 1].unallocatedPoolAfter : initial,
          shortage: rows.reduce((n, row) => n + row.quotaShortage, 0)
        };
      });
      const toggleTransferBranch = (row, selected) => {
        if (transferReadonly.value || transferSaving.value) return;
        const branchIds = row.vehicles.map(v => v.id);
        if (!selected) {
          transferDraft.vehicleIds = transferDraft.vehicleIds.filter(id => !branchIds.includes(id));
          return;
        }
        const selectedIds = row.vehicles.slice(0, row.maxSelectable).map(v => v.id);
        transferDraft.vehicleIds = [...transferDraft.vehicleIds.filter(id => !branchIds.includes(id)), ...selectedIds];
        if (selectedIds.length < row.vehicles.length) feedback.ElMessage.warning(`目標合約可供 ${row.name} 使用的配額不足，最多隻能選擇 ${row.maxSelectable} 臺。`);
      };
      const isEffectiveNow = row => !!row && ['ACTIVE', 'EXPIRING', 'PENDING_EFFECTIVE'].includes(row.status) && effectiveAt(row) <= Date.now() && endAt(row) > Date.now();
      const transferCanRunNow = computed(() => isEffectiveNow(contract(transferDraft.targetId)));
      const transferCanSchedule = computed(() => {
        const source = contract(transferDraft.sourceId),
          target = contract(transferDraft.targetId);
        const at = source && target && Math.max(endAt(source), effectiveAt(target));
        return !!at && at > Date.now() && at < endAt(target);
      });
      const changeTransferTarget = () => {
        if (transferDraft.mode === 'IMMEDIATE' && !transferCanRunNow.value && transferCanSchedule.value) transferDraft.mode = 'SOURCE_EXPIRE';else if (transferDraft.mode === 'SOURCE_EXPIRE' && !transferCanSchedule.value && transferCanRunNow.value) transferDraft.mode = 'IMMEDIATE';
      };
      const transferActiveBranchName = computed(() => transferBranchOptions.value.find(b => b.id === transferActiveBranchId.value)?.name || '');
      const transferPickerVehicles = computed(() => transferVehicles.value.filter(v => v.branchId === transferActiveBranchId.value && v.plate.toLowerCase().includes(transferPickerQuery.value.toLowerCase())));
      const transferPickerAll = computed(() => !!transferPickerVehicles.value.length && transferPickerVehicles.value.every(v => transferPickerIds.value.includes(v.id)));
      const transferPickerSome = computed(() => transferPickerVehicles.value.some(v => transferPickerIds.value.includes(v.id)));
      const openTransferVehiclePicker = row => {
        transferActiveBranchId.value = row.id;
        transferPickerQuery.value = '';
        transferPickerIds.value = row.vehicles.filter(v => transferDraft.vehicleIds.includes(v.id)).map(v => v.id);
        transferVehiclePickerOpen.value = true;
      };
      const toggleTransferPickerVehicle = (id, selected) => {
        if (transferReadonly.value) return;
        const row = transferBranchRows.value.find(item => item.id === transferActiveBranchId.value);
        if (selected && !transferPickerIds.value.includes(id) && row && transferPickerIds.value.length >= row.maxSelectable) {
          feedback.ElMessage.warning(`目標合約未分配配額已按分公司列表順序用盡，${row.name} 最多隻能選擇 ${row.maxSelectable} 臺。`);
          return;
        }
        transferPickerIds.value = selected ? [...new Set([...transferPickerIds.value, id])] : transferPickerIds.value.filter(x => x !== id);
      };
      const toggleTransferPickerAll = selected => {
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
        if (transferReadonly.value || transferSaving.value) return;
        const ids = transferVehicles.value.filter(v => v.branchId === transferActiveBranchId.value).map(v => v.id);
        const row = transferBranchRows.value.find(item => item.id === transferActiveBranchId.value);
        const selectedIds = transferPickerIds.value.filter(id => ids.includes(id));
        const limitedIds = selectedIds.slice(0, row?.maxSelectable ?? selectedIds.length);
        transferDraft.vehicleIds = [...transferDraft.vehicleIds.filter(id => !ids.includes(id)), ...limitedIds];
        if (limitedIds.length < selectedIds.length) feedback.ElMessage.warning(`已按目標合約可用配額保留前 ${limitedIds.length} 臺車輛。`);
        transferVehiclePickerOpen.value = false;
      };
      const toggleTransferVehicle = (id, selected) => {
        if (transferReadonly.value || transferSaving.value) return;
        transferDraft.vehicleIds = selected ? [...new Set([...transferDraft.vehicleIds, id])] : transferDraft.vehicleIds.filter(x => x !== id);
      };
      const filteredTransferTasks = computed(() => transferTasks.value.filter(t => {
        const f = transferFilters;
        return (!f.status || f.status === t.status) && `${t.sourceId} ${t.sourceName} ${t.targetId} ${t.targetName}`.toLowerCase().includes(f.query.toLowerCase()) && (!f.contractId || (f.direction === 'out' ? t.sourceId === f.contractId : f.direction === 'in' ? t.targetId === f.contractId : [t.sourceId, t.targetId].includes(f.contractId)));
      }).sort((a, b) => b.updatedAt - a.updatedAt));
      const pagedTransferTasks = computed(() => filteredTransferTasks.value.slice((transferPage.value - 1) * 5, transferPage.value * 5));
      watch(transferFilters, () => {
        transferPage.value = 1;
      });
      watch(() => filteredTransferTasks.value.length, n => {
        transferPage.value = Math.min(transferPage.value, Math.max(1, Math.ceil(n / 5)));
      });
      const clearTransferScope = () => {
        transferFilters.contractId = '';
        transferFilters.direction = '';
      };
      const openTransferTasks = (id = '', direction = '', status = '') => {
        Object.assign(transferFilters, {
          query: '',
          contractId: id,
          direction,
          status
        });
        transferPage.value = 1;
        transferListOpen.value = true;
      };
      const changeTransferSource = () => {
        transferDraft.targetId = '';
        transferDraft.vehicleIds = vehiclesOf(contract(transferDraft.sourceId)).map(v => v.id);
      };
      const openTransferEditor = (source = null, task = null) => {
        if (source) task = pending().find(t => t.sourceId === source.id) || null;
        transferSourceSelectable.value = !source && !task;
        transferVehiclePickerOpen.value = false;
        Object.assign(transferDraft, task ? {
          id: task.id,
          sourceId: task.sourceId,
          targetId: task.targetId,
          mode: task.mode,
          vehicleIds: [...task.vehicleIds]
        } : {
          id: '',
          sourceId: source?.id || '',
          targetId: '',
          mode: 'IMMEDIATE',
          vehicleIds: vehiclesOf(source).map(v => v.id)
        });
        transferEditorOpen.value = true;
      };
      const cancelTransferTask = async task => {
        if (!['PENDING', 'FAILED'].includes(task.status) || transferSaving.value) return;
        try {
          await feedback.ElMessageBox.confirm('取消後釋放目標預留容量，來源配額及車輛綁定不變。', '取消轉移任務', {
            confirmButtonText: '確認取消',
            cancelButtonText: '返回',
            type: 'warning'
          });
        } catch {
          return;
        }
        if (!['PENDING', 'FAILED'].includes(task.status)) return feedback.ElMessage.warning('任務狀態已變更，請重新查看。');
        task.status = 'CANCELLED';
        task.updatedAt = Date.now();
        task.events.push({
          action: 'CANCELLED',
          at: task.updatedAt
        });
        if (transferDraft.id === task.id) transferEditorOpen.value = false;
        feedback.ElMessage.success('已取消轉移任務');
      };
      let sequence = 5;
      const saveTransferTask = async () => {
        if (transferSaving.value || transferReadonly.value) return;
        const draft = clone(transferDraft),
          previous = currentTransferTask.value;
        const previousVersion = previous?.updatedAt;
        let preview = evaluateTransfer(draft);
        if (preview.error) return feedback.ElMessage.warning(preview.error);
        transferSaving.value = true;
        try {
          await feedback.ElMessageBox.confirm(draft.mode === 'IMMEDIATE' ? `立即將 ${draft.vehicleIds.length} 輛車轉移至 ${draft.targetId}？來源分公司配額保留。` : `儲存 ${draft.vehicleIds.length} 輛車的到期轉移任務，並預留目標容量？`, '確認轉移', {
            confirmButtonText: '確認',
            cancelButtonText: '返回',
            type: 'warning'
          });
          if (previous && (!['PENDING', 'FAILED'].includes(previous.status) || previous.updatedAt !== previousVersion)) return feedback.ElMessage.warning('任務已更新，請關閉後重新開啟。');
          preview = evaluateTransfer(draft);
          if (preview.error) return feedback.ElMessage.warning(preview.error);
          const next = makeTask(draft, preview, previous?.id || `TR-2026-${String(sequence++).padStart(4, '0')}`);
          if (previous) {
            next.createdAt = previous.createdAt;
            next.events = [...previous.events, {
              at: Date.now(),
              action: 'EDITED',
              before: clone(previous)
            }];
          } else next.events.push({
            at: Date.now(),
            action: 'CREATED'
          });
          if (draft.mode === 'IMMEDIATE' && !executeTask(next)) return feedback.ElMessage.error(next.failureReason);
          if (previous) Object.assign(previous, next);else transferTasks.value.unshift(next);
          transferEditorOpen.value = false;
          feedback.ElMessage.success(draft.mode === 'IMMEDIATE' ? '轉移已完成' : '轉移任務已儲存');
        } catch (error) {
          if (error !== 'cancel' && error !== 'close') feedback.ElMessage.error('未能儲存轉移任務，原任務保持不變。');
        } finally {
          transferSaving.value = false;
        }
      };
      const runDueTransferTasks = (now = Date.now()) => {
        pending().filter(t => t.scheduledAt <= now).forEach(t => {
          if (!executeTask(t, now)) feedback.ElMessage.error(`${t.id} 轉移失敗，請在合約轉移任務中處理。`);
        });
      };
      let timer;
      model.onMount(() => {
        runDueTransferTasks();
        timer = window.setInterval(runDueTransferTasks, 30000);
      });
      model.onDispose(() => window.clearInterval(timer));
      const guardTransferContractChange = (row, patch = null) => {
        if (!hasRelatedTransferTask(row.id)) return '';
        if (!patch) return '此合約有待執行轉移任務，請先取消相關任務。';
        if (patch.tenant !== row.tenant) return '此合約有待執行轉移任務，不可變更企業。';
        const reserved = pending().filter(t => t.targetId === row.id).reduce((n, t) => n + t.details.reduce((s, d) => s + d.extra, 0), 0);
        if (patch.quota < row.allocatedQuota + reserved) return `合約總配額不得少於已分配及預留配額合計 ${row.allocatedQuota + reserved} 臺。`;
        const candidates = contractsData.value.map(r => r.id === row.id ? {
          ...r,
          ...patch
        } : r);
        for (const task of pending().filter(t => [t.sourceId, t.targetId].includes(row.id))) {
          const check = evaluateTransfer(task, candidates);
          if (check.error) return `影響 ${task.id}：${check.error}`;
        }
        return '';
      };
      const refreshTransferSchedules = () => pending().forEach(t => {
        const check = evaluateTransfer(t);
        if (!check.error) {
          t.scheduledAt = check.scheduledAt;
          t.details = clone(check.details);
          t.updatedAt = Date.now();
        }
      });
      return {
        transferStatuses,
        transferTime,
        transferTasks,
        transferListOpen,
        transferEditorOpen,
        transferSaving,
        transferPage,
        transferFilters,
        transferDraft,
        transferSourceSelectable,
        transferSourceName,
        transferSourceQuotaInfo,
        transferTargetQuotaInfo,
        transferTargetOptionLabel,
        transferVehicles,
        transferBranchRows,
        transferQuotaSummary,
        toggleTransferBranch,
        transferCanRunNow,
        transferCanSchedule,
        changeTransferTarget,
        transferVehiclePickerOpen,
        transferActiveBranchName,
        transferPickerQuery,
        transferPickerIds,
        transferPickerVehicles,
        transferPickerAll,
        transferPickerSome,
        openTransferVehiclePicker,
        toggleTransferPickerVehicle,
        toggleTransferPickerAll,
        confirmTransferPicker,
        currentTransferTask,
        transferReadonly,
        transferPreview,
        transferSourceOptions,
        transferTargetOptions,
        transferBranchOptions,
        toggleTransferVehicle,
        filteredTransferTasks,
        pagedTransferTasks,
        clearTransferScope,
        openTransferTasks,
        changeTransferSource,
        openTransferEditor,
        cancelTransferTask,
        saveTransferTask,
        hasRelatedTransferTask,
        hasTransferNotice,
        hasTransferFailure,
        canTransferContract,
        guardTransferContractChange,
        refreshTransferSchedules,
        runDueTransferTasks,
        evaluateTransfer
      };
    })();
    const filters = reactive({
      query: '',
      tenant: '',
      payer: '',
      type: '',
      status: ''
    });
    const operationLogOpen = ref(false);
    const operationLogPage = ref(1);
    const operationLogFilters = reactive({
      query: '',
      type: ''
    });
    const operationLogTypes = [{
      value: 'CREATE',
      label: '新增',
      tagType: 'success'
    }, {
      value: 'EDIT',
      label: '編輯',
      tagType: 'primary'
    }, {
      value: 'TERMINATE',
      label: '中止',
      tagType: 'warning'
    }, {
      value: 'DELETE',
      label: '刪除',
      tagType: 'danger'
    }];
    const contractLogs = ref([{
      id: 'LOG-20260920-010',
      operatedAt: '2026-09-20 10:42',
      contractId: 'OC-2026-R003',
      contractName: '新竹智造續約公務車合約',
      type: 'CREATE',
      operator: '林思妤'
    }, {
      id: 'LOG-20260920-009',
      operatedAt: '2026-09-20 09:36',
      contractId: 'OC-2026-0020',
      contractName: '高雄港勤公務車正式合約',
      type: 'EDIT',
      operator: '王柏鈞'
    }, {
      id: 'LOG-20260919-008',
      operatedAt: '2026-09-19 16:18',
      contractId: 'OC-2025-F811',
      contractName: '南港商務服務年度合約',
      type: 'DELETE',
      operator: '陳怡安'
    }, {
      id: 'LOG-20260918-007',
      operatedAt: '2026-09-18 14:05',
      contractId: 'OC-2026-0012',
      contractName: '安和醫療集團主駕接駁合約',
      type: 'TERMINATE',
      operator: '張書豪'
    }, {
      id: 'LOG-20260917-006',
      operatedAt: '2026-09-17 11:20',
      contractId: 'OC-2026-R002',
      contractName: '北辰電子續約公務車合約',
      type: 'CREATE',
      operator: '林思妤'
    }, {
      id: 'LOG-20260916-005',
      operatedAt: '2026-09-16 15:40',
      contractId: 'OC-2026-0005',
      contractName: '北辰電子公務車試用方案',
      type: 'EDIT',
      operator: '王柏鈞'
    }, {
      id: 'LOG-20260915-004',
      operatedAt: '2026-09-15 09:12',
      contractId: 'OC-2025-T092',
      contractName: '新竹智造短期試用合約',
      type: 'EDIT',
      operator: '陳怡安'
    }, {
      id: 'LOG-20260912-003',
      operatedAt: '2026-09-12 17:08',
      contractId: 'OC-2026-R001',
      contractName: '睿騰科技續約公務車合約',
      type: 'CREATE',
      operator: '張書豪'
    }, {
      id: 'LOG-20260910-002',
      operatedAt: '2026-09-10 10:31',
      contractId: 'OC-2026-0012',
      contractName: '安和醫療集團主駕接駁合約',
      type: 'EDIT',
      operator: '林思妤'
    }, {
      id: 'LOG-20260908-001',
      operatedAt: '2026-09-08 13:50',
      contractId: 'OC-2026-0001',
      contractName: '睿騰科技年度公務車合約',
      type: 'CREATE',
      operator: '王柏鈞'
    }]);
    const getOperationLogType = type => operationLogTypes.find(item => item.value === type) || {
      label: type,
      tagType: 'info'
    };
    const filteredContractLogs = computed(() => {
      const query = operationLogFilters.query.trim();
      return contractLogs.value.filter(item => {
        const matchQuery = !query || item.contractId.includes(query) || item.contractName.includes(query);
        const matchType = !operationLogFilters.type || item.type === operationLogFilters.type;
        return matchQuery && matchType;
      });
    });
    const pagedContractLogs = computed(() => {
      const start = (operationLogPage.value - 1) * 5;
      return filteredContractLogs.value.slice(start, start + 5);
    });
    const openOperationLog = () => {
      operationLogFilters.query = '';
      operationLogFilters.type = '';
      operationLogPage.value = 1;
      operationLogOpen.value = true;
    };
    const addContractLog = (type, row) => {
      const now = new Date();
      const pad = value => String(value).padStart(2, '0');
      const operatedAt = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`;
      contractLogs.value.unshift({
        id: `LOG-${Date.now()}`,
        operatedAt,
        contractId: row.id,
        contractName: row.name,
        type,
        operator: 'Admin'
      });
    };
    watch(() => [operationLogFilters.query, operationLogFilters.type], () => {
      operationLogPage.value = 1;
    });
    watch(() => filteredContractLogs.value.length, n => {
      operationLogPage.value = Math.min(operationLogPage.value, Math.max(1, Math.ceil(n / 5)));
    });
    const visibleContracts = computed(() => contractsData.value);
    const activeContracts = computed(() => contractsData.value.filter(item => !item.deleted));
    const filteredTableData = computed(() => {
      return visibleContracts.value.filter(item => {
        const matchQuery = !filters.query || item.id.includes(filters.query) || item.name.includes(filters.query);
        const matchTenant = !filters.tenant || item.tenant === filters.tenant;
        const matchPayer = !filters.payer || item.payer === filters.payer;
        const matchType = !filters.type || item.type === filters.type;
        const matchStatus = !filters.status || item.status === filters.status;
        return matchQuery && matchTenant && matchPayer && matchType && matchStatus;
      });
    });
    const contractPage = ref(1);
    const contractPageSize = ref(10);
    const pagedTableData = computed(() => {
      const start = (contractPage.value - 1) * contractPageSize.value;
      return filteredTableData.value.slice(start, start + contractPageSize.value);
    });
    watch(() => [filters.query, filters.tenant, filters.payer, filters.type, filters.status], () => {
      contractPage.value = 1;
    });
    watch(() => filteredTableData.value.length, n => {
      contractPage.value = Math.min(contractPage.value, Math.max(1, Math.ceil(n / contractPageSize.value)));
    });
    const dashboardStats = computed(() => {
      return {
        active: activeContracts.value.filter(c => c.status === 'ACTIVE').length,
        terminated: activeContracts.value.filter(c => c.status === 'TERMINATED').length,
        expiringOrExpired: activeContracts.value.filter(c => {
          if (c.status === 'EXPIRED' || c.status === 'EXPIRING') return true;
          if (c.status !== 'ACTIVE') return false;
          const d = getDaysRemaining(c.endDate);
          return d >= 0 && d < 15;
        }).length
      };
    });
    const showWizardDrawer = ref(false);
    const wizardStep = ref(0);
    const submitLoading = ref(false);
    const wizardFormRef = ref(null);
    const wizardMode = ref('create');
    const editingContract = ref(null);
    const sourceTrialContract = ref(null);
    const wizardForm = reactive({
      tenant: '',
      sameAsTenant: false,
      payer: '',
      name: '',
      type: 'OFFICIAL',
      quota: 1,
      billing: 'MONTHLY',
      durationMonths: 1,
      startDate: '',
      effectMode: 'CONTRACT_START',
      pickupLocation: '',
      billingReminder: '',
      billingContact: '',
      billingEmail: ''
    });
    const wizardRules = {
      name: [{
        required: true,
        message: '請輸入合約名稱',
        trigger: 'blur'
      }],
      tenant: [{
        required: true,
        message: '承租方必須存在',
        trigger: 'blur'
      }],
      payer: [{
        required: true,
        message: '請選擇或輸入結算代付企業',
        trigger: 'change'
      }],
      durationMonths: [{
        required: true,
        message: '請輸入合約期數',
        trigger: 'blur'
      }],
      startDate: [{
        required: true,
        message: '請選擇開始時間',
        trigger: 'change'
      }]
    };
    const wizardTitle = computed(() => {
      if (wizardMode.value === 'edit') return '編輯公務車合約';
      if (wizardMode.value === 'convert') return '試用合同轉正式合同';
      return '新建公務車合約';
    });
    const wizardIdentityLocked = computed(() => ['edit', 'convert'].includes(wizardMode.value));
    const wizardSubmitLabel = computed(() => {
      if (wizardMode.value === 'edit') return '保存修改';
      if (wizardMode.value === 'convert') return '建立正式合同';
      return '確認建檔';
    });
    const isActiveContractEdit = computed(() => wizardMode.value === 'edit' && editingContract.value && ['ACTIVE', 'EXPIRING'].includes(editingContract.value.status));
    const minimumQuota = computed(() => {
      if (wizardMode.value === 'edit' && editingContract.value) {
        if (editingContract.value.status === 'PENDING_ADJUSTMENT') return 1;
        return Math.max(1, editingContract.value.vehicleCount || 0, editingContract.value.allocatedQuota || 0);
      }
      return 1;
    });
    const conversionQuotaGap = computed(() => {
      let source = sourceTrialContract.value;
      if (wizardMode.value === 'edit' && editingContract.value?.predecessorContractId) {
        source = contractsData.value.find(item => item.id === editingContract.value.predecessorContractId);
      }
      if (!source) return 0;
      const currentScale = Math.max(source.allocatedQuota || 0, source.vehicleCount || 0);
      return Math.max(0, currentScale - Number(wizardForm.quota || 0));
    });
    const handleSameAsTenantChange = val => {
      if (val) {
        wizardForm.payer = wizardForm.tenant;
      } else if (wizardForm.payer === wizardForm.tenant) {
        wizardForm.payer = '';
      }
    };
    watch(() => wizardForm.tenant, tenant => {
      if (wizardForm.sameAsTenant) wizardForm.payer = tenant;
    });
    const showPayerManageDialog = ref(false);
    const openPayerManageDialog = () => {
      showPayerManageDialog.value = true;
    };
    const deletePayer = index => {
      feedback.ElMessageBox.confirm('確定要刪除此結算方嗎？', '提示', {
        type: 'warning'
      }).then(() => {
        const deleted = payerOptions.value.splice(index, 1)[0];
        if (wizardForm.payer === deleted.name) {
          wizardForm.payer = '';
        }
        feedback.ElMessage.success('結算方已刪除');
      }).catch(() => {});
    };
    const showPayerFormDialog = ref(false);
    const payerFormMode = ref('add');
    const editingPayerIndex = ref(-1);
    const payerFormRef = ref(null);
    const payerForm = reactive({
      name: '',
      taxId: '',
      contact: '',
      phone: ''
    });
    const payerRules = {
      name: [{
        required: true,
        message: '請輸入企業名稱',
        trigger: 'blur'
      }],
      taxId: [{
        required: true,
        message: '請輸入統編號碼',
        trigger: 'blur'
      }],
      contact: [{
        required: true,
        message: '請輸入聯繫人',
        trigger: 'blur'
      }]
    };
    const openAddPayerDialog = () => {
      payerFormMode.value = 'add';
      payerForm.name = '';
      payerForm.taxId = '';
      payerForm.contact = '';
      payerForm.phone = '';
      if (payerFormRef.value) payerFormRef.value.clearValidate();
      showPayerFormDialog.value = true;
    };
    const openEditPayerDialog = (row, index) => {
      payerFormMode.value = 'edit';
      editingPayerIndex.value = index;
      payerForm.name = row.name;
      payerForm.taxId = row.taxId;
      payerForm.contact = row.contact;
      payerForm.phone = row.phone;
      if (payerFormRef.value) payerFormRef.value.clearValidate();
      showPayerFormDialog.value = true;
    };
    const submitPayerForm = () => {
      payerFormRef.value.validate().then(valid => {
        if (valid) {
          if (payerFormMode.value === 'add') {
            payerOptions.value.unshift({
              ...payerForm
            });
            wizardForm.payer = payerForm.name;
            feedback.ElMessage.success('結算方企業添加成功！');
          } else {
            const oldName = payerOptions.value[editingPayerIndex.value].name;
            payerOptions.value[editingPayerIndex.value] = {
              ...payerForm
            };
            if (wizardForm.payer === oldName) {
              wizardForm.payer = payerForm.name;
            }
            feedback.ElMessage.success('結算方企業修改成功！');
          }
          showPayerFormDialog.value = false;
        }
      }).catch(() => {});
    };
    const calculatedReferencePrice = computed(() => {
      const enterpriseRate = getEnterpriseRate(wizardForm.tenant);
      if (!enterpriseRate) {
        return {
          amount: '-',
          suffix: '未配置企業單價'
        };
      }
      let displayAmount = 0;
      let displaySuffix = '';
      if (wizardForm.billing === 'MONTHLY') {
        displayAmount = wizardForm.quota * enterpriseRate.monthly;
        displaySuffix = '/ 月';
      } else {
        displayAmount = wizardForm.quota * enterpriseRate.annually;
        displaySuffix = '/ 年';
      }
      return {
        amount: formatCurrency(displayAmount, false),
        suffix: displaySuffix
      };
    });
    const getContractDuration = row => {
      const start = new Date(`${row.startDate}T00:00:00`);
      const end = new Date(`${row.endDate}T00:00:00`);
      if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return 1;
      end.setDate(end.getDate() + 1);
      if (row.billing === 'ANNUALLY') {
        return Math.max(1, Math.round(end.getFullYear() - start.getFullYear() + (end.getMonth() - start.getMonth()) / 12));
      }
      return Math.max(1, Math.round((end.getFullYear() - start.getFullYear()) * 12 + end.getMonth() - start.getMonth()));
    };
    const getContractEndDate = () => {
      const d = new Date(`${wizardForm.startDate}T00:00:00`);
      if (wizardForm.billing === 'ANNUALLY') {
        d.setFullYear(d.getFullYear() + wizardForm.durationMonths);
      } else {
        d.setMonth(d.getMonth() + wizardForm.durationMonths);
      }
      d.setDate(d.getDate() - 1);
      return d.toISOString().split('T')[0];
    };
    const getDefaultConvertStartDate = row => {
      const nextDay = new Date(`${row.endDate}T00:00:00`);
      nextDay.setDate(nextDay.getDate() + 1);
      const today = new Date(TODAY.getFullYear(), TODAY.getMonth(), TODAY.getDate());
      const result = nextDay > today ? nextDay : today;
      return result.toISOString().split('T')[0];
    };
    const getPlannedEffectiveAt = () => {
      if (!wizardForm.startDate) return '-';
      if (isActiveContractEdit.value && editingContract.value?.effectiveAt) {
        return editingContract.value.effectiveAt;
      }
      if (wizardForm.type !== 'OFFICIAL') return `${wizardForm.startDate} 00:00`;
      if (wizardForm.effectMode === 'IMMEDIATE') return getNowDateTimeStr();
      const contractStart = new Date(`${wizardForm.startDate}T00:00:00`);
      if (contractStart <= new Date()) return getNowDateTimeStr();
      return `${wizardForm.startDate} 00:00`;
    };
    const getGiftDaysByValue = (effectiveAt, startDate) => {
      if (!effectiveAt || !startDate || effectiveAt === '-') return 0;
      const effectiveDate = new Date(`${effectiveAt.slice(0, 10)}T00:00:00`);
      const contractStartDate = new Date(`${startDate}T00:00:00`);
      if (Number.isNaN(effectiveDate.getTime()) || Number.isNaN(contractStartDate.getTime())) return 0;
      return Math.max(0, Math.round((contractStartDate - effectiveDate) / (1000 * 60 * 60 * 24)));
    };
    const computedEffectiveAt = computed(() => getPlannedEffectiveAt());
    const giftPeriodDays = computed(() => getGiftDaysByValue(computedEffectiveAt.value, wizardForm.startDate));
    const getFormalContractStatus = () => {
      if (wizardForm.type !== 'OFFICIAL') return 'PENDING_PAYMENT';
      if (wizardForm.effectMode === 'IMMEDIATE') return 'ACTIVE';
      const planned = new Date(`${wizardForm.startDate}T00:00:00`);
      return planned <= new Date() ? 'ACTIVE' : 'PENDING_EFFECTIVE';
    };
    const resetWizardState = () => {
      editingContract.value = null;
      sourceTrialContract.value = null;
      wizardForm.tenant = '睿騰科技股份有限公司';
      wizardForm.sameAsTenant = false;
      wizardForm.payer = '';
      wizardForm.name = '';
      wizardForm.type = 'OFFICIAL';
      wizardForm.quota = 1;
      wizardForm.billing = 'MONTHLY';
      wizardForm.durationMonths = 1;
      wizardForm.startDate = '';
      wizardForm.effectMode = 'CONTRACT_START';
      if (wizardFormRef.value) wizardFormRef.value.clearValidate();
    };
    const openWizard = () => {
      wizardMode.value = 'create';
      resetWizardState();
      showWizardDrawer.value = true;
    };
    const canEditContract = row => ['DRAFT', 'PENDING_PAYMENT', 'PENDING_ADJUSTMENT', 'PENDING_EFFECTIVE', 'ACTIVE', 'EXPIRING'].includes(row.status);
    const canConvertTrial = row => row.type === 'TRIAL' && ['ACTIVE', 'EXPIRING', 'EXPIRED'].includes(row.status) && !row.successorContractId;
    const canTerminateContract = row => !!row && !transferTools.hasRelatedTransferTask(row.id) && ['ACTIVE', 'EXPIRING', 'PENDING_EFFECTIVE'].includes(row.status);
    const canDeleteContract = row => !!row && !row.deleted && !transferTools.hasRelatedTransferTask(row.id) && row.status === 'TERMINATED';
    const hasLifecycleAction = row => canTerminateContract(row);
    const hasNonDeleteMoreAction = row => transferTools.canTransferContract(row) || hasLifecycleAction(row);
    const hasMoreActions = row => hasNonDeleteMoreAction(row) || canDeleteContract(row) || transferTools.hasRelatedTransferTask(row.id);
    const handleContractAction = (command, row) => {
      if (command === 'transfer') transferTools.openTransferEditor(row);
      if (command === 'terminate') terminateContract(row);
      if (command === 'delete') deleteContract(row);
    };
    const openEditContract = row => {
      wizardMode.value = 'edit';
      resetWizardState();
      editingContract.value = row;
      wizardForm.tenant = row.tenant;
      wizardForm.payer = row.payer;
      wizardForm.sameAsTenant = row.payer === row.tenant;
      wizardForm.name = row.name;
      wizardForm.type = row.type;
      wizardForm.quota = Math.max(row.quota || 1, row.allocatedQuota || 0, row.vehicleCount || 0);
      wizardForm.billing = row.billing;
      wizardForm.durationMonths = getContractDuration(row);
      wizardForm.startDate = row.startDate;
      wizardForm.effectMode = row.effectMode || 'CONTRACT_START';
      showWizardDrawer.value = true;
    };
    const openConvertContract = row => {
      if (!canConvertTrial(row)) {
        feedback.ElMessage.warning('當前試用合同不允許重複轉爲正式合同');
        return;
      }
      wizardMode.value = 'convert';
      resetWizardState();
      sourceTrialContract.value = row;
      wizardForm.tenant = row.tenant;
      wizardForm.payer = row.payer;
      wizardForm.sameAsTenant = row.payer === row.tenant;
      wizardForm.name = `${row.tenant}正式公務車合約`;
      wizardForm.type = 'OFFICIAL';
      wizardForm.quota = Math.max(1, row.allocatedQuota || row.vehicleCount || 0);
      wizardForm.billing = row.billing;
      wizardForm.durationMonths = row.billing === 'ANNUALLY' ? 1 : 12;
      wizardForm.startDate = getDefaultConvertStartDate(row);
      wizardForm.effectMode = 'CONTRACT_START';
      showWizardDrawer.value = true;
    };
    const submitWizard = () => {
      wizardFormRef.value.validate().then(valid => {
        if (valid) {
          if (wizardMode.value === 'edit' && editingContract.value && (wizardForm.tenant !== editingContract.value.tenant || wizardForm.type !== editingContract.value.type)) {
            feedback.ElMessage.error('編輯合約時不可修改用車企業和合約屬性');
            return;
          }
          if (wizardForm.quota < minimumQuota.value) {
            feedback.ElMessage.error(`合約總配額不得少於 ${minimumQuota.value} 臺`);
            return;
          }
          if (wizardMode.value === 'convert' && (!sourceTrialContract.value || sourceTrialContract.value.successorContractId)) {
            feedback.ElMessage.error('該試用合同已建立承接關係，不允許重複轉換');
            return;
          }
          if (!getEnterpriseRate(wizardForm.tenant)) {
            feedback.ElMessage.error('該企業尚未配置對應單價，請先完成企業價格配置');
            return;
          }
          const nextEndDate = getContractEndDate();
          if (isActiveContractEdit.value && new Date(`${nextEndDate}T23:59:59`) < new Date()) {
            feedback.ElMessage.error('生效中或即將到期的合約，調整後的結束日期不得早於當前日期');
            return;
          }
          const persistWizard = () => {
            submitLoading.value = true;
            window.setTimeout(() => {
              submitLoading.value = false;
              showWizardDrawer.value = false;
              const enterpriseRate = getEnterpriseRate(wizardForm.tenant);
              const unitRate = wizardForm.billing === 'ANNUALLY' ? enterpriseRate.annually : enterpriseRate.monthly;
              const totalAmount = wizardForm.quota * unitRate;
              const plannedEffectiveAt = getPlannedEffectiveAt();
              if (wizardMode.value === 'edit' && editingContract.value) {
                const row = editingContract.value;
                const taskError = transferTools.guardTransferContractChange(row, {
                  tenant: wizardForm.tenant,
                  quota: wizardForm.quota,
                  startDate: wizardForm.startDate,
                  endDate: nextEndDate,
                  scheduledEffectiveAt: plannedEffectiveAt
                });
                if (taskError) {
                  showWizardDrawer.value = true;
                  feedback.ElMessage.error(taskError);
                  return;
                }
                row.name = wizardForm.name;
                row.payer = wizardForm.payer;
                row.quota = wizardForm.quota;
                row.billing = wizardForm.billing;
                row.totalAmount = totalAmount;
                row.startDate = wizardForm.startDate;
                row.endDate = nextEndDate;
                row.effectMode = row.type === 'OFFICIAL' ? wizardForm.effectMode : 'CONTRACT_START';
                if (!row.effectiveAt) {
                  row.scheduledEffectiveAt = plannedEffectiveAt;
                  row.status = conversionQuotaGap.value > 0 ? 'PENDING_ADJUSTMENT' : getFormalContractStatus();
                  row.effectiveAt = row.status === 'ACTIVE' ? plannedEffectiveAt : '';
                  if (row.status === 'ACTIVE' && row.predecessorContractId) {
                    const source = contractsData.value.find(item => item.id === row.predecessorContractId);
                    if (source) {
                      row.vehicleCount = source.vehicleCount;
                      row.allocatedQuota = source.allocatedQuota;
                      row.branchCount = source.branchCount;
                    }
                  }
                }
                transferTools.refreshTransferSchedules();
                addContractLog('EDIT', row);
                feedback.ElMessage.success('合約資料已更新');
                return;
              }
              const source = sourceTrialContract.value;
              const targetStatus = wizardMode.value === 'convert' && conversionQuotaGap.value > 0 ? 'PENDING_ADJUSTMENT' : getFormalContractStatus();
              const newRow = {
                id: 'OC-2026-NEW' + Math.floor(Math.random() * 100),
                name: wizardForm.name,
                tenant: wizardForm.tenant,
                payer: wizardForm.payer,
                type: wizardForm.type,
                billing: wizardForm.billing,
                quota: wizardForm.quota,
                vehicleCount: wizardMode.value === 'convert' && targetStatus === 'ACTIVE' ? source.vehicleCount : 0,
                allocatedQuota: wizardMode.value === 'convert' && targetStatus === 'ACTIVE' ? source.allocatedQuota : 0,
                branchCount: wizardMode.value === 'convert' && targetStatus === 'ACTIVE' ? source.branchCount : 0,
                totalAmount,
                startDate: wizardForm.startDate,
                endDate: nextEndDate,
                effectMode: wizardForm.effectMode,
                scheduledEffectiveAt: plannedEffectiveAt,
                effectiveAt: targetStatus === 'ACTIVE' ? plannedEffectiveAt : '',
                status: targetStatus,
                predecessorContractId: wizardMode.value === 'convert' ? source.id : ''
              };
              contractsData.value.unshift(newRow);
              addContractLog('CREATE', newRow);
              if (wizardMode.value === 'convert') {
                source.successorContractId = newRow.id;
                if (newRow.status === 'PENDING_ADJUSTMENT') {
                  feedback.ElMessage.warning(`正式合同已建立，需先縮減 ${conversionQuotaGap.value} 臺配額或車輛後再承接`);
                } else if (newRow.status === 'ACTIVE') {
                  feedback.ElMessage.success(`正式合同已立即生效，並承接 ${source.branchCount} 個分公司配額和 ${source.vehicleCount} 輛車輛`);
                } else {
                  feedback.ElMessage.success(`正式合同已建立，將於 ${newRow.scheduledEffectiveAt} 承接分公司配額和車輛`);
                }
              } else {
                feedback.ElMessage.success('覈算建檔成功！新商務合約已鎖定記錄！');
              }
            }, 500);
          };
          if (wizardMode.value === 'edit' && editingContract.value) {
            const impactMessage = isActiveContractEdit.value ? '該合約已生效。保存後，新資料將用於後續業務；既有訂單、賬單、實際生效時間及歷史記錄不會改寫。確認保存？' : '保存後將按最新資料重新計算計劃生效時間與合約期間；歷史操作記錄仍會保留。確認保存？';
            feedback.ElMessageBox.confirm(impactMessage, '確認修改合約', {
              confirmButtonText: '確認保存',
              cancelButtonText: '取消',
              type: 'warning'
            }).then(persistWizard).catch(() => {});
            return;
          }
          persistWizard();
        }
      }).catch(() => {});
    };
    const handleWizardClose = done => {
      done();
    };
    const terminateContract = row => {
      const taskError = transferTools.guardTransferContractChange(row);
      if (taskError) return feedback.ElMessage.warning(taskError);
      feedback.ElMessageBox.confirm(`即將強制提前終止此公務車合約，下掛的 ${row.vehicleCount} 臺資產將即刻釋放回公共資源池。此操作不可撤銷，確認終止？`, '生命週期阻斷', {
        confirmButtonText: '確定終止釋放',
        cancelButtonText: '手滑了',
        type: 'warning'
      }).then(() => {
        const taskError = transferTools.guardTransferContractChange(row);
        if (taskError) return feedback.ElMessage.warning(taskError);
        row.status = 'TERMINATED';
        row.vehicleCount = 0;
        row.transferBranches = [];
        row.allocatedQuota = 0;
        addContractLog('TERMINATE', row);
        feedback.ElMessage.success('合約鏈路已被系統阻斷，資源已回退池中！');
      }).catch(() => {});
    };
    const deleteContract = row => {
      const taskError = transferTools.guardTransferContractChange(row);
      if (taskError) return feedback.ElMessage.warning(taskError);
      feedback.ElMessageBox.confirm(`確認刪除合約 ${row.id}？刪除後企業端不可見，營運端列表保留已中止刪除線標記；歷史訂單、賬單和操作記錄仍會保留。`, '刪除合約', {
        confirmButtonText: '確認刪除',
        cancelButtonText: '取消',
        type: 'warning',
        distinguishCancelAndClose: true
      }).then(() => {
        const taskError = transferTools.guardTransferContractChange(row);
        if (taskError) return feedback.ElMessage.warning(taskError);
        row.deleted = true;
        if (row.predecessorContractId) {
          const source = contractsData.value.find(item => item.id === row.predecessorContractId);
          if (source && source.successorContractId === row.id) source.successorContractId = '';
        }
        addContractLog('DELETE', row);
        feedback.ElMessage.success('合約已刪除，企業端將不再顯示該合約');
      }).catch(() => {});
    };
    const getDaysRemaining = endDate => {
      const end = new Date(endDate);
      const diffTime = end - TODAY;
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    };
    const formatCurrency = (val, symbol = true) => {
      if (val == null) return '-';
      const num = Number(val).toLocaleString('zh-CN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
      return symbol ? `￥ ${num}` : num;
    };
    const getEffectiveDisplay = row => {
      if (row.effectiveAt) return row.effectiveAt;
      if (row.scheduledEffectiveAt) return `${row.scheduledEffectiveAt}（預計）`;
      return '-';
    };
    const getGiftDays = row => row.type === 'OFFICIAL' ? getGiftDaysByValue(row.effectiveAt || row.scheduledEffectiveAt, row.startDate) : 0;
    const renderBillingType = b => {
      const map = {
        MONTHLY: '月繳',
        ANNUALLY: '年繳',
        ONE_TIME: '一次性'
      };
      return map[b] || b;
    };
    const getStatusLabel = s => {
      const map = {
        DRAFT: '草稿件',
        PENDING_PAYMENT: '待客戶支付',
        TERMINATED: '已終止',
        PENDING_ADJUSTMENT: '待調整',
        PENDING_EFFECTIVE: '待生效',
        ACTIVE: '生效中',
        EXPIRED: '已過期',
        VOID: '已作廢退回',
        EXPIRING: '即將到期'
      };
      return map[s] || s;
    };
    const getStatusDotClass = s => {
      let c = 'w-2 h-2 rounded-full ';
      if (s === 'ACTIVE') c += 'bg-emerald-500';else if (s === 'TERMINATED') c += 'bg-gray-600';else if (s === 'PENDING_PAYMENT') c += 'bg-amber-400';else if (s === 'PENDING_ADJUSTMENT') c += 'bg-orange-500';else if (s === 'PENDING_EFFECTIVE') c += 'bg-blue-500';else if (s === 'EXPIRED') c += 'bg-red-500';else if (s === 'VOID') c += 'bg-gray-400';else if (s === 'EXPIRING') c += 'bg-amber-500';else c += 'bg-gray-300';
      return c;
    };
    const getStatusTextClass = row => {
      const s = typeof row === 'string' ? row : row?.status;
      let c = 'text-sm font-medium ';
      if (s === 'ACTIVE') c += 'text-emerald-700';else if (s === 'TERMINATED') c += 'text-gray-700';else if (s === 'PENDING_PAYMENT') c += 'text-amber-600';else if (s === 'PENDING_ADJUSTMENT') c += 'text-orange-600';else if (s === 'PENDING_EFFECTIVE') c += 'text-blue-600';else if (s === 'EXPIRED') c += 'text-red-600';else if (s === 'VOID') c += 'text-gray-500 line-through';else if (s === 'EXPIRING') c += 'text-amber-500';else c += 'text-gray-600';
      if (typeof row === 'object' && row?.deleted) c += ' line-through decoration-gray-400';
      return c;
    };
    return {
      ...transferTools,
      tenantOptions,
      payerOptions,
      contractsData,
      availableVehicles,
      filters,
      filteredTableData,
      pagedTableData,
      contractPage,
      contractPageSize,
      dashboardStats,
      operationLogOpen,
      operationLogPage,
      operationLogFilters,
      operationLogTypes,
      filteredContractLogs,
      pagedContractLogs,
      getOperationLogType,
      openOperationLog,
      showWizardDrawer,
      submitLoading,
      wizardFormRef,
      wizardForm,
      wizardRules,
      calculatedReferencePrice,
      wizardMode,
      wizardTitle,
      wizardSubmitLabel,
      wizardIdentityLocked,
      sourceTrialContract,
      isActiveContractEdit,
      minimumQuota,
      conversionQuotaGap,
      computedEffectiveAt,
      giftPeriodDays,
      openWizard,
      openEditContract,
      openConvertContract,
      canEditContract,
      canConvertTrial,
      canTerminateContract,
      canDeleteContract,
      hasLifecycleAction,
      hasNonDeleteMoreAction,
      hasMoreActions,
      handleContractAction,
      submitWizard,
      handleWizardClose,
      handleSameAsTenantChange,
      showPayerManageDialog,
      openPayerManageDialog,
      deletePayer,
      showPayerFormDialog,
      payerFormMode,
      payerFormRef,
      payerForm,
      payerRules,
      openAddPayerDialog,
      openEditPayerDialog,
      submitPayerForm,
      terminateContract,
      deleteContract,
      formatCurrency,
      getEffectiveDisplay,
      getGiftDays,
      getDaysRemaining,
      renderBillingType,
      getStatusLabel,
      getStatusDotClass,
      getStatusTextClass,
      ElMessage: feedback.ElMessage,
      ElMessageBox: feedback.ElMessageBox,
      enterpriseRateMap,
      getEnterpriseRate,
      TODAY,
      getFutureDateStr,
      getPastDateStr,
      getNowDateTimeStr,
      generateMockVehicles,
      transferTools,
      contractLogs,
      addContractLog,
      visibleContracts,
      activeContracts,
      wizardStep,
      editingContract,
      editingPayerIndex,
      getContractDuration,
      getContractEndDate,
      getDefaultConvertStartDate,
      getPlannedEffectiveAt,
      getGiftDaysByValue,
      getFormalContractStatus,
      resetWizardState
    };
  }
  return pageSetup();
}
export default function OfficialVehicleContractsBlock() {
  const model = useRimoModel(createPageState);
  const view = model.view;
  const {
    text
  } = useRimoEnvironment();
  return <RimoRoot model={model} pageKey="official-vehicle-contracts" assets={{}}><div data-business-content="" data-page-node-id="Wo4JAGnftOUuCNWq4Bih04" data-rimo-layout="page"><div className="flex-1 overflow-y-auto space-y-6 custom-scroll" data-page-node-id="wyZdVARCvEIcIc9xvT7ypt"><div className="flex justify-between items-end mb-2" data-page-node-id="J25bAuNOpg8wmvld3dh4yF" data-rimo-layout="heading"><div data-page-node-id="u1BENxvDSZFXwn5hWXa2oY"><h1 className="text-2xl font-bold text-gray-800 tracking-tight" data-page-node-id="Hpn0VTaAVHzZRjN7dGWvUv">{text("公務車輛合約管理")}</h1>
<p className="text-gray-500 text-sm mt-1" data-page-node-id="ImyNaI8Q2Pj7aNRr5csavA">{text("資產分配與財務覈算，基於承租方建立合約結構，鎖定底層車輛池資產。")}</p></div>
<div className="flex gap-3" data-page-node-id="A1alCxkKXdc3HUrkzhkPaA"><RimoElement kind="el-button" size="large" onClick={event => {
              view.openOperationLog?.(event);
            }}>{text("操作記錄")}</RimoElement>
<RimoElement kind="el-button" size="large" onClick={_event => {
              view.openTransferTasks();
            }} data-page-node-id="nXakxP0tsErFFQdCrSN3bo">{text("合約轉移任務")}</RimoElement>
<RimoElement kind="el-button" type="primary" size="large" className="shadow-md shadow-[color:var(--app-color-primary-shadow)]" onClick={event => {
              view.openWizard?.(event);
            }} data-page-node-id="BJp8ROJS7u417AtdmT3hy3"><RimoElement kind="el-icon" className="mr-1" data-page-node-id="ytUcfqRwpbbNCnAs4p0yXM"><RimoIcon name="Plus" /></RimoElement>
{text(" 新籤合約\n                        ")}</RimoElement></div></div>
<div className="grid grid-cols-1 md:grid-cols-3 gap-6" data-page-node-id="WmPH8wMPdwCdh8KW2tKS2j"><div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex flex-col relative overflow-hidden group hover:shadow-md transition-shadow" data-page-node-id="zETOeaF9joIfaOWdlDH9zc"><div className="absolute right-0 top-0 w-24 h-24 bg-emerald-50 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110" data-page-node-id="li5YibO5iuebxEtZ1nED4P"></div>
<span className="text-sm text-gray-500 font-medium mb-1 relative z-10" data-page-node-id="MjqpgYC22LUPPNXsBBtxMU">{text("生效中合約")}</span>
<div className="flex items-center gap-2 relative z-10" data-page-node-id="8WeukTcjn4DEvSG0G6RIpn"><span className="card-value text-emerald-600" data-page-node-id="ieiNLlFuZaTBjQRExur76n">{rimoText(view.dashboardStats.active)}</span>
<span className="text-xs text-gray-400" data-page-node-id="ZD8aSDabPZrRFOq2ev8vpM">{text("份")}</span></div></div>
<div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex flex-col relative overflow-hidden group hover:shadow-md transition-shadow" data-page-node-id="G0p9UDEpvoI46KTz8npIz1"><div className="absolute right-0 top-0 w-24 h-24 bg-blue-50 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110" data-page-node-id="yQ8a9rLw7IptbHkZoG8EPV"></div>
<span className="text-sm text-gray-500 font-medium mb-1 relative z-10 text-gray-600" data-page-node-id="tjZLlFlyGovxIrab8nbfj3">{text("已終止合約")}</span>
<div className="flex items-center gap-2 relative z-10" data-page-node-id="Kq23tBImQyi1avzPeam2si"><span className="card-value text-gray-600" data-page-node-id="4zAU2jzau9J7YViPicSnY4">{rimoText(view.dashboardStats.terminated)}</span>
<span className="text-xs text-gray-400" data-page-node-id="0WMAV0LbL8jAuernmgsjo7">{text("強制關停")}</span></div></div>
<div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex flex-col relative overflow-hidden group hover:shadow-md transition-shadow" data-page-node-id="EhH26NWaN3LX8LAFgTOGGB"><div className="absolute right-0 top-0 w-24 h-24 bg-amber-50 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110" data-page-node-id="oGsbEIRXZkl84uXJ2sZ1qd"></div>
<span className="text-sm text-gray-500 font-medium mb-1 relative z-10 text-amber-600" data-page-node-id="BKNXloXd3DHfMWBSb67nvu">{text("臨近/已過期合約")}</span>
<div className="flex items-center gap-2 relative z-10" data-page-node-id="1q7hIhqDsFYS364sGUTK2G"><span className="card-value text-amber-500" data-page-node-id="ZKoDZniP7BnrmG0bDJRDQf">{rimoText(view.dashboardStats.expiringOrExpired)}</span>
<span className="text-xs text-gray-400" data-page-node-id="giuPnej996jI6QPFR7cyFo">{text("存在業務風險")}</span></div></div></div>
<div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col" data-page-node-id="5AuQOuz0vIrdockX7Qxr18" data-rimo-layout="list"><RimoElement kind="el-table" data={view.pagedTableData} style={rimoStyle("width: 100%")} className="custom-table" data-page-node-id="MoRlqmgkAVFOVp4feckQQ0" slots={{
            "toolbar": _slot => <><RimoElement kind="el-input" modelValue={view.filters.query} onModelChange={value => {
                model.write(["filters", "query"], value);
              }} placeholder="搜索合約編號 / 合約名稱" prefixIcon="Search" clearable={true} style={rimoStyle("width: 240px")} data-page-node-id="ntHTsx9kjRr4YPWQHsODvG"></RimoElement>
<RimoElement kind="el-select" modelValue={view.filters.tenant} onModelChange={value => {
                model.write(["filters", "tenant"], value);
              }} placeholder="實際用車企業" clearable={true} style={rimoStyle("width: 160px")} data-page-node-id="WESbmQb0zpXPA6aKj6gHh7">{rimoEntries(view.tenantOptions).map(([t], _itemIndex) => <Fragment key={t}><RimoElement kind="el-option" key={t} label={t} value={t} data-page-node-id="TGInB231GUOsyI2cOc5Yfk"></RimoElement></Fragment>)}</RimoElement>
<RimoElement kind="el-select" modelValue={view.filters.payer} onModelChange={value => {
                model.write(["filters", "payer"], value);
              }} placeholder="結算代付方" clearable={true} style={rimoStyle("width: 160px")} data-page-node-id="igtKBYYMSsdk6b5TmeSkfN">{rimoEntries(view.payerOptions).map(([p], _itemIndex) => <Fragment key={p.name}><RimoElement kind="el-option" key={p.name} label={p.name} value={p.name} data-page-node-id="os6nDZdyGQgbhoYNyprqlR"></RimoElement></Fragment>)}</RimoElement>
<RimoElement kind="el-select" modelValue={view.filters.type} onModelChange={value => {
                model.write(["filters", "type"], value);
              }} placeholder="合約類型" clearable={true} style={rimoStyle("width: 130px")} data-page-node-id="xSHDCOUoSeJOHssurTgMzA"><RimoElement kind="el-option" label="試用" value="TRIAL" data-page-node-id="3zeMDhUEaQZWDGkC1Yu2Wv"></RimoElement>
<RimoElement kind="el-option" label="正式" value="OFFICIAL" data-page-node-id="UjkmiOpoXbh7FTXvLgH8Of"></RimoElement></RimoElement>
<RimoElement kind="el-select" modelValue={view.filters.status} onModelChange={value => {
                model.write(["filters", "status"], value);
              }} placeholder="狀態" clearable={true} style={rimoStyle("width: 140px")} data-page-node-id="rSlMTrCqeY27izcGSNAgKM"><RimoElement kind="el-option" label="草稿" value="DRAFT" data-page-node-id="p5q1FaFpFWBgBBqmjbd3OA"></RimoElement>
<RimoElement kind="el-option" label="待客戶支付" value="PENDING_PAYMENT" data-page-node-id="H99iCBM0lL84z6KGHUoXkk"></RimoElement>
<RimoElement kind="el-option" label="待調整" value="PENDING_ADJUSTMENT" data-page-node-id="pMpwko7wlFOjR7nJiyFCH2"></RimoElement>
<RimoElement kind="el-option" label="待生效" value="PENDING_EFFECTIVE" data-page-node-id="F859xaJWTRBZQvzVd2Y0Go"></RimoElement>
<RimoElement kind="el-option" label="生效中" value="ACTIVE" data-page-node-id="H8Etc1iGWAPkirvHBVq0n9"></RimoElement>
<RimoElement kind="el-option" label="即將到期" value="EXPIRING" data-page-node-id="WoX5wg7ho8HSGFNwMGkP6s"></RimoElement>
<RimoElement kind="el-option" label="已終止" value="TERMINATED" data-page-node-id="iRDaQpcp8fJF4fxBxOakJ7"></RimoElement>
<RimoElement kind="el-option" label="已過期" value="EXPIRED" data-page-node-id="0VdwQPe7WojB06gBqedy33"></RimoElement>
<RimoElement kind="el-option" label="已作廢" value="VOID" data-page-node-id="jJtexb3BoTR0lJzh6eGTB8"></RimoElement></RimoElement></>
          }}><RimoElement kind="el-table-column" label="合約編號與名稱" minWidth="220" data-page-node-id="IAKuG0ryg6YsyDGHGMcCDk" slots={{
              "default": ({
                row
              }) => <><div className="font-mono text-gray-800 text-sm font-semibold" data-page-node-id="lO8xH6lL8BV19AE3yymakE">{rimoText(row.id)}</div>
<div className="text-xs text-gray-500 mt-1 truncate" title={row.name} data-page-node-id="AjRxQawIiYTxFeVrPYB4Kw">{rimoText(row.name)}</div></>
            }}></RimoElement>
<RimoElement kind="el-table-column" label="用車與結算方" minWidth="240" data-page-node-id="UfBTkiYXaRyrjgVC2nVhBp" slots={{
              "default": ({
                row
              }) => <><div className="text-sm text-gray-800" data-page-node-id="uJhsNmS4GZxZdHGlAOlmQV">{rimoText(row.tenant)}</div>
{row.tenant !== row.payer ? <><div className="text-xs text-gray-500 mt-1 flex items-center gap-1" data-page-node-id="q9Y2qgqjy3lv18Z5e7hBc8"><span className="bg-gray-100 text-gray-500 px-1 py-0.5 rounded text-[10px] ring-1 ring-inset ring-gray-200" data-page-node-id="DuKUHpeIISfHdI8oPAgGRP">{text("[第三方代付]")}</span>
<span className="truncate" title={row.payer} data-page-node-id="zIkBJUbCO4At5fD7Et0KEE">{rimoText(row.payer)}</span></div></> : null}</>
            }}></RimoElement>
<RimoElement kind="el-table-column" label="屬性" width="140" data-page-node-id="hChOfLhe2eYdq5xf75CVEg" slots={{
              "default": ({
                row
              }) => <><div className="flex flex-col gap-1 items-start" data-page-node-id="KKfUmDpZdQc1DFZMaQmb8Z">{row.type === 'TRIAL' ? <><RimoElement kind="el-tag" type="info" size="small" effect="plain" className="border-blue-200 text-blue-600 bg-blue-50" data-page-node-id="N9M6afNcWm2wKy1377pS5r">{text("試用")}</RimoElement></> : null}
{row.type === 'OFFICIAL' ? <><RimoElement kind="el-tag" type="success" size="small" effect="light" className="text-emerald-600 bg-emerald-50 border-emerald-200" data-page-node-id="u3hIrTeWwEHVkn8kAeiA91">{text("正式")}</RimoElement></> : null}
<span className="text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded" data-page-node-id="WajWbZXFRy9ucwe0qxdiss">{rimoText(view.renderBillingType(row.billing))}</span></div></>
            }}></RimoElement>
<RimoElement kind="el-table-column" label="配額資產" width="100" align="center" data-page-node-id="upyee1zPANlUkZ7qiO7iHY" slots={{
              "default": ({
                row
              }) => <><div className="text-lg font-bold text-gray-800" data-page-node-id="17fDs1GhNCLBUvCH5BmpJh">{rimoText(row.vehicleCount)}{text(" ")}
<span className="text-xs font-normal text-gray-500" data-page-node-id="ySnDfH4RyYNVh57nR8UOuj">{text("臺")}</span></div></>
            }}></RimoElement>
<RimoElement kind="el-table-column" label="合約金額" width="140" align="right" data-page-node-id="4r3G75x0Ey3rR4IulBvEfG" slots={{
              "default": ({
                row
              }) => <><div className="text-sm font-semibold text-gray-800" data-page-node-id="V90sRE6HiB3WxS68OwdkFg">{rimoText(view.formatCurrency(row.totalAmount, false))}{text("\n                                    ")}
<span className="text-xs text-gray-500 font-normal ml-0.5" data-page-node-id="IvSDh8N6WxSmjAOlAdyfE0">{text("/ ")}{rimoText(row.billing === 'ANNUALLY' ? '年' : row.billing === 'MONTHLY' ? '月' : '次')}</span></div></>
            }}></RimoElement>
<RimoElement kind="el-table-column" label="合約期限" minWidth="200" data-page-node-id="3yEF6d0zLs1UAwoxVXzLtU" slots={{
              "default": ({
                row
              }) => <><div className="text-xs text-gray-600 font-mono tracking-tight flex flex-col gap-1" data-page-node-id="lXSmYf5eXILWB8rYMWLHUP"><span data-page-node-id="OhWZk1yCFvpNVS1wanBNL0">{rimoText(row.startDate)}{text(" ")}
<span className="text-gray-400 font-sans mx-0.5" data-page-node-id="DIV4jMbdjUmXpv0o7VPXnB">{text("至")}</span>
{text(" ")}{rimoText(row.endDate)}</span>
{(row.status === 'ACTIVE' || row.status === 'EXPIRING') && view.getDaysRemaining(row.endDate) >= 0 && view.getDaysRemaining(row.endDate) < 15 ? <><div className="inline-block self-start text-amber-500 font-semibold bg-amber-50 px-1.5 py-0.5 rounded ring-1 ring-inset ring-amber-100 text-[10px]">{text("\n                                        臨近到期")}</div></> : null}</div></>
            }}></RimoElement>
<RimoElement kind="el-table-column" label="狀態" width="120" data-page-node-id="WJHDFsFDD5QTY8dnC097z8" slots={{
              "default": ({
                row
              }) => <><div className="flex items-center gap-1.5" data-page-node-id="BG7x0ZQk1GCGIzrnklHGGw"><div className={rimoClass(view.getStatusDotClass(row.status))} data-page-node-id="WGwLFDu54GckTwPFNmwd8v"></div>
<span className={rimoClass(view.getStatusTextClass(row))} data-page-node-id="jDdVR9CK0If7CV8I2TMnI5">{rimoText(view.getStatusLabel(row.status))}</span></div></>
            }}></RimoElement>
<RimoElement kind="el-table-column" label="操作" width="180" fixed="right" align="right" headerAlign="right" data-page-node-id="Plg6CyUT04tpmUcYv70TAI" slots={{
              "default": ({
                row
              }) => <><div className="flex items-center justify-end gap-1.5 whitespace-nowrap" data-page-node-id="V2DWPhXcZpfp9q5N13bBKt">{view.canEditContract(row) ? <><RimoElement kind="el-button" link={true} type="primary" size="small" onClick={_event => {
                      view.openEditContract(row);
                    }} data-page-node-id="Uo4RxBsQp53BtoQ37VnlaO">{text("編輯")}</RimoElement></> : row.type === 'TRIAL' && row.successorContractId ? <><RimoElement kind="el-tooltip" content={`正式合同：${row.successorContractId}`} placement="top" data-page-node-id="E3AAUse7PpPY32ZGCIxikL"><RimoElement kind="el-tag" type="success" size="small" effect="plain" data-page-node-id="bGySx0jIJ94amqs7UW8SE4">{text("已轉正式")}</RimoElement></RimoElement></> : null}
{view.hasMoreActions(row) ? <><RimoElement kind="el-dropdown" trigger="click" onCommand={event => {
                      view.handleContractAction(event, row);
                    }} data-page-node-id="Go7MV5nnqju6V2zFuIqqvq" slots={{
                      "dropdown": _slot => <><RimoElement kind="el-dropdown-menu" data-page-node-id="DTDzdrSn5ZD68g9AE5m7Oz">{view.canTransferContract(row) ? <><RimoElement kind="el-dropdown-item" command="transfer" data-page-node-id="RqhFyiY72aqlKcJQzqXTFp">{text("\n                                                    轉移至其他合約\n                                                ")}</RimoElement></> : null}
{view.canTerminateContract(row) ? <><RimoElement kind="el-dropdown-item" command="terminate" data-page-node-id="HYUih5deHkpba33Yv5AEEb">{text("中止合約")}</RimoElement></> : null}
{view.canDeleteContract(row) ? <><RimoElement kind="el-dropdown-item" command="delete" divided={view.hasNonDeleteMoreAction(row)} style={rimoStyle("color: #ef4444;")} data-page-node-id="TrR4Qa8th256QhslVfA2Sx">{text("刪除合約")}</RimoElement></> : null}</RimoElement></>
                    }}><RimoElement kind="el-button" link={true} type="primary" size="small" data-page-node-id="bujfMidA7goCxa9dLctVd7">{text("\n                                            更多")}
<RimoElement kind="el-icon" className="ml-1" data-page-node-id="L3524ySG4wh8sCOmdkJo0L"><RimoIcon name="ArrowDown" /></RimoElement></RimoElement></RimoElement></> : null}</div></>
            }}></RimoElement>
<RimoElement kind="el-table-column" label="生效時間" width="170" data-page-node-id="NRZd5VH5K3sBV5LPFfOzuM" slots={{
              "default": ({
                row
              }) => <><div className="text-xs text-gray-700 font-mono" data-page-node-id="5DqnqPGKTVucUHYpjqrC2Q">{rimoText(view.getEffectiveDisplay(row))}</div>
{view.getGiftDays(row) > 0 ? <><RimoElement kind="el-tag" type="success" size="small" effect="plain" className="mt-1">{text("贈送 ")}{rimoText(view.getGiftDays(row))}{text(" 天")}</RimoElement></> : null}</>
            }}></RimoElement></RimoElement>
<div className="p-4 border-t border-gray-100 flex justify-end bg-gray-50"><RimoElement kind="el-pagination" currentPage={view.contractPage} onCurrentPageChange={value => {
              model.write(["contractPage"], value);
            }} pageSize={view.contractPageSize} onPageSizeChange={value => {
              model.write(["contractPageSize"], value);
            }} pageSizes={[10, 20, 50, 100]} total={view.filteredTableData.length} background={true} layout="total, sizes, prev, pager, next, jumper"></RimoElement></div></div></div></div><RimoElement kind="el-dialog" modelValue={view.operationLogOpen} onModelChange={value => {
      model.write(["operationLogOpen"], value);
    }} title="合約操作記錄" width="1040px" className="official-vehicle-contracts-overlay transfer-dialog" closeOnClickModal={false} slots={{
      "footer": _slot => <><RimoElement kind="el-button" onClick={_event => {
          model.write(["operationLogOpen"], false);
        }}>{text("關閉")}</RimoElement></>
    }}>{() => <><div className="transfer-toolbar"><RimoElement kind="el-input" modelValue={view.operationLogFilters.query} onModelChange={value => {
            model.write(["operationLogFilters", "query"], value);
          }} placeholder="搜索合約編號或名稱" aria-label="搜索合約操作記錄" clearable={true} style={rimoStyle("width: 260px")}></RimoElement>
<RimoElement kind="el-select" modelValue={view.operationLogFilters.type} onModelChange={value => {
            model.write(["operationLogFilters", "type"], value);
          }} placeholder="全部類型" aria-label="操作類型" clearable={true} style={rimoStyle("width: 150px")}>{rimoEntries(view.operationLogTypes).map(([item], _itemIndex) => <Fragment key={item.value}><RimoElement kind="el-option" key={item.value} label={item.label} value={item.value}></RimoElement></Fragment>)}</RimoElement></div>
<RimoElement kind="el-table" data={view.pagedContractLogs} maxHeight="420" emptyText="暫無操作記錄"><RimoElement kind="el-table-column" prop="operatedAt" label="操作時間" width="180"></RimoElement>
<RimoElement kind="el-table-column" prop="contractId" label="合約編號" width="170"></RimoElement>
<RimoElement kind="el-table-column" prop="contractName" label="合約名稱" minWidth="270"></RimoElement>
<RimoElement kind="el-table-column" label="操作類型" width="130" slots={{
            "default": ({
              row
            }) => <><RimoElement kind="el-tag" type={view.getOperationLogType(row.type).tagType} effect="light">{rimoText(view.getOperationLogType(row.type).label)}</RimoElement></>
          }}></RimoElement>
<RimoElement kind="el-table-column" prop="operator" label="操作人" width="140"></RimoElement></RimoElement>
<div className="transfer-pagination"><RimoElement kind="el-pagination" currentPage={view.operationLogPage} onCurrentPageChange={value => {
            model.write(["operationLogPage"], value);
          }} pageSize={5} total={view.filteredContractLogs.length} layout="total, prev, pager, next"></RimoElement></div></>}</RimoElement>
<RimoElement kind="el-dialog" modelValue={view.transferListOpen} onModelChange={value => {
      model.write(["transferListOpen"], value);
    }} title="合約轉移任務" width="1120px" className="official-vehicle-contracts-overlay transfer-dialog" closeOnClickModal={false} data-page-node-id="WHI9ecAmXI9TyPEYb91N11" slots={{
      "footer": _slot => <><RimoElement kind="el-button" onClick={_event => {
          model.write(["transferListOpen"], false);
        }} data-page-node-id="HmPOqZAoyG0t3ztHOC3B9c">{text("關閉")}</RimoElement></>
    }}>{() => <><div className="transfer-toolbar" data-page-node-id="2N1O0IgADoNmCfRZOvUUxr"><RimoElement kind="el-input" modelValue={view.transferFilters.query} onModelChange={value => {
            model.write(["transferFilters", "query"], value);
          }} placeholder="搜尋合約編號或名稱" aria-label="搜尋合約" clearable={true} style={rimoStyle("width: 260px")} data-page-node-id="4JE5bWaRa0haUI77UiyfAJ"></RimoElement>
<RimoElement kind="el-select" modelValue={view.transferFilters.status} onModelChange={value => {
            model.write(["transferFilters", "status"], value);
          }} placeholder="全部狀態" aria-label="任務狀態" clearable={true} style={rimoStyle("width: 150px")} data-page-node-id="A9r3E8u8xuex8KGrhCcPKb">{rimoEntries(view.transferStatuses).map(([item, key], _itemIndex) => <Fragment key={key}><RimoElement kind="el-option" key={key} label={item.label} value={key} data-page-node-id="ScSfwjfGlR5kIayVgJABME"></RimoElement></Fragment>)}</RimoElement>
{view.transferFilters.contractId ? <><RimoElement kind="el-tag" closable={true} onClose={event => {
              view.clearTransferScope?.(event);
            }} data-page-node-id="rvzDL0BG1UlohKSxs95hC9">{rimoText(view.transferFilters.contractId)}{text(" ")}{rimoText(view.transferFilters.direction === 'out' ? '轉出' : view.transferFilters.direction === 'in' ? '轉入' : '相關')}</RimoElement></> : null}
<RimoElement kind="el-button" className="transfer-push" type="primary" onClick={_event => {
            view.openTransferEditor();
          }} data-page-node-id="T3LZXkKCs9B41wfIKqyEMq">{text("新增轉移任務")}</RimoElement></div>
<RimoElement kind="el-table" data={view.pagedTransferTasks} maxHeight="420" emptyText="暫無符合條件的轉移任務" data-page-node-id="iGECKvjBYqEEYQb74r1T4Q"><RimoElement kind="el-table-column" label="來源合約" minWidth="210" data-page-node-id="7tS0iCubCS0YjSYHL9q9BD" slots={{
            "default": ({
              row
            }) => <><div data-page-node-id="Z6ugXsXT5PHZPEPEMlSzUk">{rimoText(row.sourceId)}</div>
<div className="transfer-muted" data-page-node-id="6AdTBI5TlYbJmezWdsXH0L">{rimoText(row.sourceName)}</div></>
          }}></RimoElement>
<RimoElement kind="el-table-column" label="目標合約" minWidth="210" data-page-node-id="HWbuizQjg1ocI6i1q5M1Gt" slots={{
            "default": ({
              row
            }) => <><div data-page-node-id="NByAkRbffs4j7Jglk5ZhNF">{rimoText(row.targetId)}</div>
<div className="transfer-muted" data-page-node-id="W0BXmrhlranxiotOEmHGGC">{rimoText(row.targetName)}</div></>
          }}></RimoElement>
<RimoElement kind="el-table-column" label="車輛數" width="80" align="right" data-page-node-id="LcMtnoJWifdjSpgG4NiCPo" slots={{
            "default": ({
              row
            }) => <>{rimoText(row.vehicles.length)}{text(" 輛")}</>
          }}></RimoElement>
<RimoElement kind="el-table-column" label="執行時間" width="170" data-page-node-id="NovudAIJJ7RvoVjMyZg7Q6" slots={{
            "default": ({
              row
            }) => <><div data-page-node-id="tIgbpFcw6XnjJDh6S1T6UL">{rimoText(view.transferTime(row.executedAt || row.scheduledAt))}</div>
<div className="transfer-muted" data-page-node-id="yCd89V1DEpTbQt0wx1C6FP">{rimoText(row.executedAt ? '實際執行' : row.mode === 'IMMEDIATE' ? '立即轉移' : '到期轉移（預計）')}</div></>
          }}></RimoElement>
<RimoElement kind="el-table-column" label="狀態" width="112" data-page-node-id="4tHatr5NCifSBV8cYFyFed" slots={{
            "default": ({
              row
            }) => <><RimoElement kind="el-tag" type={view.transferStatuses[row.status].type} effect="light" data-page-node-id="AyEeXfy3F6b0rsbyDrMa7a">{rimoText(view.transferStatuses[row.status].label)}</RimoElement></>
          }}></RimoElement>
<RimoElement kind="el-table-column" label="操作" width="140" fixed="right" align="right" data-page-node-id="wB7duqjVru91AF3Qn89CrU" slots={{
            "default": ({
              row
            }) => <><RimoElement kind="el-button" link={true} type="primary" onClick={_event => {
                view.openTransferEditor(null, row);
              }} data-page-node-id="WuOAnHl8ZxBCYRV11oUfAa">{text("查看")}</RimoElement>
{['PENDING', 'FAILED'].includes(row.status) ? <><RimoElement kind="el-button" link={true} type="danger" onClick={_event => {
                  view.cancelTransferTask(row);
                }} data-page-node-id="BEiOJyXRX8GGYmlVJExqoM">{text("取消")}</RimoElement></> : null}</>
          }}></RimoElement></RimoElement>
<div className="transfer-pagination" data-page-node-id="SShFpydMYVIAX8NsSPYpnr"><RimoElement kind="el-pagination" currentPage={view.transferPage} onCurrentPageChange={value => {
            model.write(["transferPage"], value);
          }} pageSize={5} total={view.filteredTransferTasks.length} layout="total, prev, pager, next" data-page-node-id="3istHZ7XAGMPLBPAQsUY0E"></RimoElement></div></>}</RimoElement>
<RimoElement kind="el-dialog" modelValue={view.transferEditorOpen} onModelChange={value => {
      model.write(["transferEditorOpen"], value);
    }} title={view.transferReadonly ? '轉移任務詳情' : '車輛轉移至其他合約'} width="900px" className="official-vehicle-contracts-overlay transfer-dialog" closeOnClickModal={false} data-page-node-id="4cfJXDqtuzV78tFltJ5G4U" slots={{
      "footer": _slot => <><div className="transfer-footer" data-page-node-id="WlrdPBYqmjRCzVEBGuZgKV">{view.currentTransferTask && ['PENDING', 'FAILED'].includes(view.currentTransferTask.status) ? <><RimoElement kind="el-button" type="danger" plain={true} disabled={view.transferSaving} onClick={_event => {
              view.cancelTransferTask(view.currentTransferTask);
            }} data-page-node-id="8nFwGD7adiffLvftKL9H5S">{text("取消轉移任務")}</RimoElement></> : null}
<span className="transfer-push" data-page-node-id="sOcyf9fUzV34nb6jRtFQRK"></span>
<RimoElement kind="el-button" disabled={view.transferSaving} onClick={_event => {
            model.write(["transferEditorOpen"], false);
          }} data-page-node-id="JgvgbMmkHBH8FPsAhDrJVd">{rimoText(view.transferReadonly ? '關閉' : '返回')}</RimoElement>
{!view.transferReadonly ? <><RimoElement kind="el-button" type="primary" loading={view.transferSaving} disabled={!!view.transferPreview.error} onClick={event => {
              view.saveTransferTask?.(event);
            }} data-page-node-id="VP0YMgh5AklIgeBTC9UsZC">{rimoText(view.transferDraft.mode === 'IMMEDIATE' ? '確認立即轉移' : '儲存轉移任務')}</RimoElement></> : null}</div></>
    }}>{() => <><div className="transfer-editor-body" data-page-node-id="olfl6pGEMVCfxNWIaYO43N">{view.currentTransferTask && view.currentTransferTask.failureReason ? <><RimoElement kind="el-alert" title={view.currentTransferTask.failureReason} type="error" closable={false} showIcon={true} className="transfer-alert" data-page-node-id="GDtxSiye601Df1wtFqHXV3"></RimoElement></> : null}
{view.transferReadonly ? <><div className="transfer-toolbar" data-page-node-id="9ML9HnS9fj251eTFSPpUq2"><RimoElement kind="el-tag" type={view.transferStatuses[view.currentTransferTask.status].type} data-page-node-id="yKEQ4e6ug8uoTs2RN6fZiL">{rimoText(view.transferStatuses[view.currentTransferTask.status].label)}</RimoElement>
<span data-page-node-id="2ie33tqTWdhIGYU6abeZQA">{rimoText(view.currentTransferTask.id)}{text(" · ")}{rimoText(view.transferTime(view.currentTransferTask.executedAt || view.currentTransferTask.updatedAt))}</span></div></> : null}
{view.currentTransferTask && ['PENDING', 'FAILED'].includes(view.currentTransferTask.status) ? <><div className="transfer-muted mt-2 rounded border border-amber-100 bg-amber-50 px-3 py-2">{text("已有轉移任務不能修改內容；如需調整，請先取消任務，再重新建立。")}</div></> : null}
{view.transferSourceSelectable && !view.transferReadonly ? <><RimoElement kind="el-form" labelPosition="top" disabled={view.transferSaving} data-page-node-id="LLoVFIFSK8nQLOslA8GvwC"><RimoElement kind="el-form-item" label="來源合約" required={true} data-page-node-id="ubhJ9BUmRBLtbOsokKxQYW"><RimoElement kind="el-select" modelValue={view.transferDraft.sourceId} onModelChange={value => {
                  model.write(["transferDraft", "sourceId"], value);
                }} filterable={true} disabled={!!view.transferDraft.id} placeholder="請選擇來源合約" onChange={event => {
                  view.changeTransferSource?.(event);
                }} data-page-node-id="0hoBdHKjiyPp9jOsUrFBLu">{rimoEntries(view.transferSourceOptions).map(([row], _itemIndex) => <Fragment key={row.id}><RimoElement kind="el-option" key={row.id} label={row.id + ' · ' + row.name} value={row.id} data-page-node-id="KKJ2vhxDfgF37w1zAV9zWo"></RimoElement></Fragment>)}</RimoElement></RimoElement></RimoElement></> : null}
{view.transferDraft.sourceId ? <><div className={rimoClass(["transfer-original-summary", rimoClass({
              'is-readonly': view.transferReadonly
            })])} data-page-node-id="m5HSR0CHyg2T7h9J0wSoI5"><div className="transfer-metric transfer-source-summary" data-page-node-id="ZZY2DkmotLVcaETiOU5PqL"><div className="transfer-muted" data-page-node-id="Hg1TOoGT948A5nIOKA4dOQ">{text("來源合約")}</div>
<strong data-page-node-id="oFmCNjEGFgXKG6hz2iKzS4">{rimoText(view.transferDraft.sourceId)}{text(" · ")}{rimoText(view.transferSourceName)}</strong>
{!view.transferReadonly && view.transferSourceQuotaInfo ? <><div className="transfer-muted" data-page-node-id="kMylARwc7VYWcIN1AUk2Bt">{text("總配額 ")}{rimoText(view.transferSourceQuotaInfo.total)}{text(" 臺")}</div></> : null}</div>
{!view.transferReadonly && view.transferSourceQuotaInfo ? <><div className="transfer-metric" data-page-node-id="zYsMyuO3AxbHJDB4cP8ml8"><div className="transfer-muted" data-page-node-id="SAOn25GQLN2WidYrALc88k">{text("來源已分配配額")}</div>
<strong data-page-node-id="ORnrgKAiiH4hkvYOP9g2ds">{rimoText(view.transferSourceQuotaInfo.allocated)}{text(" 臺")}</strong></div></> : null}
<div className="transfer-metric" data-page-node-id="EUuP3Uor6vJP7XYVy9aOWM"><div className="transfer-muted" data-page-node-id="TTjOMCcD8nA2Ug6tvCwIAg">{rimoText(view.transferReadonly ? '本次轉移車輛' : '來源已綁車輛')}</div>
<strong data-page-node-id="xtCLhovVgoG2bUNf2vqdFF">{rimoText(view.transferReadonly ? view.currentTransferTask.vehicles.length : view.transferVehicles.length)}{text(" 臺")}</strong></div></div></> : null}
<RimoElement kind="el-form" labelPosition="top" disabled={view.transferReadonly || view.transferSaving} data-page-node-id="mLQdBXYrTQ7XhpwvufknUl"><RimoElement kind="el-form-item" label="目標合約" required={true} data-page-node-id="BbWQCpDFMsDytm3YYJjLMt"><RimoElement kind="el-select" modelValue={view.transferDraft.targetId} onModelChange={value => {
                model.write(["transferDraft", "targetId"], value);
              }} filterable={true} placeholder="請選擇同一企業的目標合約" onChange={event => {
                view.changeTransferTarget?.(event);
              }} data-page-node-id="lActkmUFykrHk0XsIB9JMB">{rimoEntries(view.transferTargetOptions).map(([row], _itemIndex) => <Fragment key={row.id}><RimoElement kind="el-option" key={row.id} label={view.transferTargetOptionLabel(row)} value={row.id} data-page-node-id="yhTjXDaV3lJGB6NdHkZ8fz"></RimoElement></Fragment>)}</RimoElement></RimoElement></RimoElement>
{!view.transferReadonly && view.transferTargetQuotaInfo ? <><div className="transfer-quota-line transfer-target-quota" data-page-node-id="oKtBjoLmPOcaJp8oFSTAcz"><span data-page-node-id="YKfyaU53N5zJ6jqkVUiD1B">{text("目標總配額 ")}
<strong data-page-node-id="hoCWD73ljDztF8kJl1z1GF">{rimoText(view.transferTargetQuotaInfo.total)}</strong>
{text(" 臺")}</span>
<span data-page-node-id="15ih3HF3GTjH6uFIDQxnvT">{text("已分配 ")}
<strong data-page-node-id="zABGjm1MSpVFURVY6WC7TO">{rimoText(view.transferTargetQuotaInfo.allocated)}</strong>
{text(" 臺")}</span>
<span data-page-node-id="uPdWErzECgJAQRQSA9cf1y">{text("待分配可用 ")}
<strong data-page-node-id="FY9sxaSv799xbos8fh8DQe">{rimoText(view.transferTargetQuotaInfo.available)}</strong>
{text(" 臺")}</span>
{view.transferTargetQuotaInfo.reserved ? <><span data-page-node-id="EQOwJmmFMfYqZtSBisp7Ip">{text("其他任務預留 ")}
<strong data-page-node-id="FW7lbmXCjOkz35QoqTWOAw">{rimoText(view.transferTargetQuotaInfo.reserved)}</strong>
{text(" 臺")}</span></> : null}</div></> : null}
{view.transferDraft.sourceId && !view.transferTargetOptions.length && !view.transferReadonly ? <><RimoElement kind="el-alert" title="目前沒有可承接的目標合約，請先建立同一企業的有效合約。" type="warning" closable={false} showIcon={true} className="transfer-alert" data-page-node-id="Gm0XYJGo6sdYOnLafGAFHq"></RimoElement></> : null}
{view.transferDraft.targetId ? <><><div className="transfer-toolbar" data-page-node-id="Pp6yaG3yEfMJJficGdnUO1"><strong data-page-node-id="uRIhI3yRi0b2hrLmlA0tJq">{text("選擇需要轉移的車輛")}</strong>
{!view.transferReadonly ? <><span className="transfer-push transfer-muted" data-page-node-id="VfxmAG44sPiVdMuWFpsWce">{text("系統自動在目標合約為所選車輛補充分公司配額；未分配配額按列表順序補充，用盡後後續分公司需調整選車")}</span></> : null}</div>
<RimoElement kind="el-table" data={view.transferBranchRows} border={true} size="small" maxHeight="320" emptyText="暫無可轉移車輛" data-page-node-id="ILrk0AP7MahRVqo2WsMRVo"><RimoElement kind="el-table-column" label="選擇" width="64" align="center" data-page-node-id="71Pa3pewZzGqCcx6X8A1dA" slots={{
                  "default": ({
                    row
                  }) => <><RimoElement kind="el-checkbox" modelValue={row.selectedCount > 0} indeterminate={row.selectedCount > 0 && row.selectedCount < row.vehicles.length} disabled={view.transferReadonly || view.transferSaving || !row.selectedCount && row.maxSelectable === 0} aria-label={'選取 ' + row.name} onChange={event => {
                      view.toggleTransferBranch(row, event);
                    }}></RimoElement></>
                }}></RimoElement>
<RimoElement kind="el-table-column" prop="name" label="分公司" minWidth="150" data-page-node-id="ZUI4PpHMrhayDKAcKq5sXB"></RimoElement>
{!view.transferReadonly ? <><RimoElement kind="el-table-column" label="來源配額" width="90" align="center" data-page-node-id="y5tinv9YCTJmoAATOSGFh2" slots={{
                    "default": ({
                      row
                    }) => <>{rimoText(row.sourceQuota)}{text(" 臺")}</>
                  }}></RimoElement></> : null}
<RimoElement kind="el-table-column" label={view.transferReadonly ? '原選車輛' : '來源已綁車輛'} width="110" align="center" data-page-node-id="9QEo57W0AJBR74phV3gbCd" slots={{
                  "default": ({
                    row
                  }) => <>{rimoText(row.vehicles.length)}{text(" 臺")}</>
                }}></RimoElement>
<RimoElement kind="el-table-column" label="目標已分配" width="100" align="center" data-page-node-id="Jt0vQ0QCLo5t5h2oPq8m2P" slots={{
                  "default": ({
                    row
                  }) => <>{rimoText(row.targetAllocatedQuota)}{text(" 臺")}</>
                }}></RimoElement>
<RimoElement kind="el-table-column" label="目標空餘" width="90" align="center" data-page-node-id="n9QwP7kK1kz8W0mXx8e3bN" slots={{
                  "default": ({
                    row
                  }) => <>{rimoText(row.targetFreeQuota)}{text(" 臺")}</>
                }}></RimoElement>
<RimoElement kind="el-table-column" label="轉移車輛" width="120" align="center" data-page-node-id="8840TT1r0KY3AfPXokxJ2L" slots={{
                  "default": ({
                    row
                  }) => <><RimoElement kind="el-button" link={true} type="primary" size="small" disabled={view.transferSaving} onClick={_event => {
                      view.openTransferVehiclePicker(row);
                    }} data-page-node-id="TUSlGN7YbQEDp8WJ8oWEmE">{text("已選 ")}{rimoText(row.selectedCount)}{text(" 臺")}</RimoElement></>
                }}></RimoElement>
<RimoElement kind="el-table-column" label="需補充" width="130" align="center" data-page-node-id="q3Jw8vJ9x3mK7aL4b0sP2d" slots={{
                  "default": ({
                    row
                  }) => <><span className={rimoClass(row.quotaShortage ? 'text-red-600 font-semibold' : '')}>{rimoText(row.quotaToAdd)}{text(" 臺")}</span>
{row.quotaToAdd ? <><div className="transfer-muted">{text("未分配補 ")}{rimoText(row.unallocatedQuotaUsed)}{text(" 臺")}
{row.quotaShortage ? <><span className="text-red-600">{text("，不足 ")}{rimoText(row.quotaShortage)}{text(" 臺")}</span></> : null}</div></> : null}</>
                }}></RimoElement>
{!view.transferReadonly ? <><RimoElement kind="el-table-column" label="轉移後來源剩餘車輛" width="165" align="center" data-page-node-id="L8m9RdhMaNFGXrjarLNuyZ" slots={{
                    "default": ({
                      row
                    }) => <>{rimoText(row.vehicles.length - row.selectedCount)}{text(" 臺")}</>
                  }}></RimoElement></> : null}</RimoElement>
{!view.transferReadonly ? <><div className="transfer-quota-line transfer-inline-summary" data-page-node-id="dIZdW9A1AITG37b2nwDKaY"><span data-page-node-id="lEFewyvBxAgT3XKjC5cfie">{text("本次轉移 ")}
<strong data-page-node-id="cmLu1EByXFYDDqUlf98Gnh">{rimoText(view.transferDraft.vehicleIds.length)}</strong>
{text(" 輛")}</span>
<span data-page-node-id="XP9hQuM9liCQm2CLiBmGKj">{text("使用既有配額 ")}
<strong data-page-node-id="toGFzxajFTkrUOttY7Wa4N">{rimoText(view.transferPreview.reused)}</strong>
{text(" 臺")}</span>
<span data-page-node-id="SkFcqoXZhOJloJlfiopyBf">{text("需新增配額 ")}
<strong data-page-node-id="H0X3ebFhPzsDqsFBRLERIq">{rimoText(view.transferPreview.extra)}</strong>
{text(" 臺")}</span>
<span data-page-node-id="u7fC0oQ8dJ3kL5mP9sR2tV">{text("未分配剩餘 ")}
<strong data-page-node-id="v8gD1pQ9eK4mN6sT0wX3yZ">{rimoText(view.transferQuotaSummary.remaining)}</strong>
{text(" 臺")}</span></div></> : null}
<div className="transfer-original-timing" data-page-node-id="vh4RaGuHDfLaxef32Kn5hK"><strong data-page-node-id="4nH8GSyt7QXr5AjCvMnLJo">{text("轉移時間")}</strong>
<RimoElement kind="el-radio-group" modelValue={view.transferDraft.mode} onModelChange={value => {
                  model.write(["transferDraft", "mode"], value);
                }} disabled={view.transferReadonly || view.transferSaving} data-page-node-id="DKT0FxNTX8CU7qoAeUCZmH"><RimoElement kind="el-radio-button" value="IMMEDIATE" disabled={!view.transferReadonly && !view.transferCanRunNow} data-page-node-id="Y4ICcXlJzCuKD1kJuq0RzB">{text("立即轉移")}</RimoElement>
<RimoElement kind="el-radio-button" value="SOURCE_EXPIRE" disabled={!view.transferReadonly && !view.transferCanSchedule} data-page-node-id="tifFN8qgwWEubeiHLhCTln">{text("來源合約到期時轉移")}</RimoElement></RimoElement>
<p className="transfer-muted" data-page-node-id="FKUYRM914Q1T2G1xiSUwo0">{rimoText(view.transferReadonly ? '執行時間：' + view.transferTime(view.currentTransferTask.executedAt || view.currentTransferTask.scheduledAt) : view.transferDraft.mode === 'IMMEDIATE' ? '確認後立即將所選車輛改綁到目標合約，來源合約配額保持不變。' : '計畫執行時間：' + view.transferTime(view.transferPreview.scheduledAt) + '；目標合約將立即按車輛數預留可用額度。')}</p></div>
{!view.transferReadonly && view.transferPreview.hasGap ? <><RimoElement kind="el-alert" title="目標合約較晚生效，中間空窗期間車輛無法依來源合約繼續上架；換約不會自動恢復上架。" type="warning" closable={false} className="transfer-alert" data-page-node-id="CxczwkzMMuGpCCeYhT1Ghw"></RimoElement></> : null}</></> : null}
{!view.transferReadonly && view.transferPreview.error ? <><RimoElement kind="el-alert" title={view.transferPreview.error} type="warning" closable={false} showIcon={true} className="transfer-alert" data-page-node-id="KW8CnQcD9ExRGiXhBLNMTH"></RimoElement></> : null}</div></>}</RimoElement>
<RimoElement kind="el-dialog" modelValue={view.transferVehiclePickerOpen} onModelChange={value => {
      model.write(["transferVehiclePickerOpen"], value);
    }} title={'選擇轉移車輛 · ' + view.transferActiveBranchName} width="640px" appendToBody={true} className="official-vehicle-contracts-overlay transfer-dialog" closeOnClickModal={false} data-page-node-id="KYhnLIbGxvgljCyDoOmYnt" slots={{
      "footer": _slot => <><RimoElement kind="el-button" onClick={_event => {
          model.write(["transferVehiclePickerOpen"], false);
        }} data-page-node-id="l1F9tGigWMi0ZWRI9xyxk4">{rimoText(view.transferReadonly ? '關閉' : '取消')}</RimoElement>
{!view.transferReadonly ? <><RimoElement kind="el-button" type="primary" onClick={event => {
            view.confirmTransferPicker?.(event);
          }} data-page-node-id="pKj0sQAhzyqoEkTvtOeNE6">{text("確認選擇")}</RimoElement></> : null}</>
    }}>{() => <><div className="transfer-toolbar" data-page-node-id="68nZYXDqtIez2Y5CXZQ6PL"><RimoElement kind="el-input" modelValue={view.transferPickerQuery} onModelChange={value => {
            model.write(["transferPickerQuery"], value);
          }} placeholder="搜尋車牌" aria-label="搜尋車牌" clearable={true} style={rimoStyle("width: 240px")} data-page-node-id="CHf7V10DWCALPbramGDGaG"></RimoElement>
<span className="transfer-push" data-page-node-id="q7X4WOl2Y1y7el2RbqtiZB">{text("已選 ")}{rimoText(view.transferPickerIds.length)}{text(" 臺")}</span></div>
<RimoElement kind="el-table" data={view.transferPickerVehicles} border={true} maxHeight="350" data-page-node-id="zGywLGVyxYk1E5yuvmtInt"><RimoElement kind="el-table-column" width="52" align="center" data-page-node-id="rEIz7Takcl4acXvRQXL1yN" slots={{
            "header": _slot => <><RimoElement kind="el-checkbox" modelValue={view.transferPickerAll} indeterminate={view.transferPickerSome && !view.transferPickerAll} disabled={view.transferReadonly || !view.transferPickerVehicles.length} aria-label="選取搜尋結果車輛" onChange={event => {
                view.toggleTransferPickerAll?.(event);
              }} data-page-node-id="xnHHZpZAPSUJie4oIZHAv8"></RimoElement></>,
            "default": ({
              row
            }) => <><RimoElement kind="el-checkbox" modelValue={view.transferPickerIds.includes(row.id)} disabled={view.transferReadonly} aria-label={'選取 ' + row.plate} onChange={event => {
                view.toggleTransferPickerVehicle(row.id, event);
              }} data-page-node-id="3oIGEOtvyDtSBTgWiC5NcA"></RimoElement></>
          }}></RimoElement>
<RimoElement kind="el-table-column" prop="plate" label="車牌號碼" minWidth="140" data-page-node-id="dckRXhROw32obHCj4HuHuG"></RimoElement>
<RimoElement kind="el-table-column" prop="model" label="車款" minWidth="200" data-page-node-id="LJGnVWZs61JemycMtttER8"></RimoElement></RimoElement></>}</RimoElement>
<RimoElement kind="el-dialog" modelValue={view.showWizardDrawer} onModelChange={value => {
      model.write(["showWizardDrawer"], value);
    }} title={view.wizardTitle} width="760px" destroyOnClose={true} beforeClose={view.handleWizardClose} className="official-vehicle-contracts-overlay" data-page-node-id="NFvbIVvQIO6yCXNAuWTpjw" slots={{
      "footer": _slot => <><span className="dialog-footer" data-page-node-id="VaC1wq0vRXBGOE2HES3sEq"><RimoElement kind="el-button" onClick={_event => {
            model.write(["showWizardDrawer"], false);
          }} data-page-node-id="w4tWdZzKUkHspZEopknGSD">{text("取消")}</RimoElement>
<RimoElement kind="el-button" type="primary" onClick={event => {
            view.submitWizard?.(event);
          }} loading={view.submitLoading} data-page-node-id="U2bFQjo6Tw2hkqey32Pbu2">{text("\n                        ")}{rimoText(view.wizardSubmitLabel)}{text("\n                    ")}</RimoElement></span></>
    }}>{() => <><div className="p-2" data-page-node-id="vD1dxjAENx9dTQMYzqw20M"><RimoElement kind="el-form" model={view.wizardForm} rules={view.wizardRules} modelRef={model.ref("wizardFormRef")} labelPosition="top" data-page-node-id="do7eu1w8PpE0WieA0pEcDD">{view.wizardMode === 'convert' && view.sourceTrialContract ? <><div className="mb-4 rounded-lg border border-blue-100 bg-blue-50 px-4 py-3" data-page-node-id="wAEA4BMTwbX1yArIaueIaS"><div className="text-sm font-semibold text-blue-800" data-page-node-id="e2PfE1sUGmCIMHBtwRrOcK">{text("承接試用合同：")}{rimoText(view.sourceTrialContract.id)}</div>
<div className="mt-1 text-xs text-blue-700" data-page-node-id="VFpVCbcU2AZxF2eyXXFq18">{text("\n                            ")}{rimoText(view.sourceTrialContract.name)}{text(" · ")}{rimoText(view.sourceTrialContract.tenant)}{text(" ·\n                            ")}{rimoText(view.sourceTrialContract.endDate)}{text(" 到期\n                        ")}</div></div></> : null}
{view.wizardMode === 'edit' ? <><div className="mb-4 rounded-lg border border-amber-100 bg-amber-50 px-4 py-3 text-xs text-amber-800" data-page-node-id="PJ8AQV3O7MR3G95GUlx65V">{text("\n                        可修改合約名稱、結算方、配額及期間。實際用車企業和合約屬性不可修改；合約編號、實際生效時間、承接結果及操作記錄不會隨本次編輯改寫；\n                        已產生的訂單與賬單繼續保留原始快照。\n                    ")}</div></> : null}
<div className="bg-gray-50/50 p-5 rounded-xl border border-gray-100 mb-5 relative overflow-hidden" data-page-node-id="YHtVmSdJy2BRgRZBMRmRo1"><div className="absolute right-0 top-0 w-16 h-16 bg-blue-50/50 rounded-bl-full -mr-4 -mt-4" data-page-node-id="fhmmjjSzvGQUGrUnwESgKU"></div>
<h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2 relative z-10" data-page-node-id="eqrucIGqDisuNWVwGqHHur"><div className="w-1 h-3 bg-[color:var(--app-color-primary)] rounded" data-page-node-id="UTNKWex7T6KFn5cwtZ4Gg7"></div>
{text(" 基本信息\n                        ")}</h3>
<RimoElement kind="el-form-item" label="合約名稱" prop="name" data-page-node-id="nCwpFlSWKlgfP7rl07xVep"><RimoElement kind="el-input" modelValue={view.wizardForm.name} onModelChange={value => {
                  model.write(["wizardForm", "name"], value);
                }} placeholder="請輸入合約名稱" data-page-node-id="nn1x0253DQZc1FpsbOyMPC"></RimoElement></RimoElement>
<RimoElement kind="el-form-item" label="實際用車企業 (Tenant)" prop="tenant" data-page-node-id="vI9yVzeTTi6YG2IqelODEe"><RimoElement kind="el-select" modelValue={view.wizardForm.tenant} onModelChange={value => {
                  model.write(["wizardForm", "tenant"], value);
                }} placeholder="請選擇實際用車企業" filterable={true} className="w-full" disabled={view.wizardIdentityLocked} data-page-node-id="0Cj36uGtohKTkS4eIaxkvE">{rimoEntries(view.tenantOptions).map(([t], _itemIndex) => <Fragment key={t}><RimoElement kind="el-option" key={t} label={t} value={t} data-page-node-id="IBqO9OKVEgHr778WvRTgvX"></RimoElement></Fragment>)}</RimoElement></RimoElement>
<RimoElement kind="el-form-item" label="結算代付方 (Payer)" prop="payer" data-page-node-id="TclJL46azq6HITBf43RxFh"><div className="flex items-center gap-2 w-full" data-page-node-id="yZmhRUVk4QxNw8MIByvnpD" data-rimo-layout="field-row"><RimoElement kind="el-select" modelValue={view.wizardForm.payer} onModelChange={value => {
                    model.write(["wizardForm", "payer"], value);
                  }} placeholder="選擇第三方代付企業" filterable={true} className="flex-1" disabled={view.wizardForm.sameAsTenant} data-page-node-id="RiFEagbiVstltmybaeDo0c">{rimoEntries(view.payerOptions).map(([p], _itemIndex) => <Fragment key={p.name}><RimoElement kind="el-option" key={p.name} label={p.name} value={p.name} data-page-node-id="DUrlvCRpulz8BHjxAQQzU0"><div className="flex items-center justify-between w-full" data-page-node-id="pCPunpCCiO6BtKMUc8szcm"><span data-page-node-id="QkO7qePxwJocEtoXJ1AHNG">{rimoText(p.name)}</span>
<span className="text-xs text-gray-400" data-page-node-id="qLIB8X0EFnjaOcXmUJT9hW">{text("統編: ")}{rimoText(p.taxId)}</span></div></RimoElement></Fragment>)}</RimoElement>
<RimoElement kind="el-button" type="primary" plain={true} onClick={event => {
                    view.openPayerManageDialog?.(event);
                  }} disabled={view.wizardForm.sameAsTenant} data-page-node-id="2yVATVCoUGrkIqvXHE51w8">{text("管理")}</RimoElement></div>
<div className="mt-2 text-sm text-gray-500 flex items-center gap-2" data-page-node-id="vMavQgOMojCg6C7hEfClzV"><RimoElement kind="el-checkbox" modelValue={view.wizardForm.sameAsTenant} onModelChange={value => {
                    model.write(["wizardForm", "sameAsTenant"], value);
                  }} onChange={event => {
                    view.handleSameAsTenantChange?.(event);
                  }} label="同實際用車企業 (內部直撥歸賬)" data-page-node-id="MfHt3SrmDrV2bCwqmwyfLx"></RimoElement></div></RimoElement></div>
<div className="bg-gray-50/50 p-5 rounded-xl border border-gray-100 relative overflow-hidden" data-page-node-id="T0TaeYwz3HEoq3ZF0OqBfX"><div className="absolute right-0 top-0 w-16 h-16 bg-emerald-50/50 rounded-bl-full -mr-4 -mt-4" data-page-node-id="3fFlbh0OJEQUsaTFcwFXSt"></div>
<h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2 relative z-10" data-page-node-id="cg4D5rbcVk4HvaBqSJx0Qq"><div className="w-1 h-3 bg-emerald-500 rounded" data-page-node-id="CAaezIIxRvw3fFMNuVW4xS"></div>
{text(" 核心參數\n                        ")}</h3>
<RimoElement kind="el-form-item" label="合約屬性" prop="type" data-page-node-id="pBZflPgPlAEnB3JkDXDLWn"><RimoElement kind="el-radio-group" modelValue={view.wizardForm.type} onModelChange={value => {
                  model.write(["wizardForm", "type"], value);
                }} size="default" disabled={view.wizardIdentityLocked} data-page-node-id="dlzkHHXSwqDHt5KarZRW7F"><RimoElement kind="el-radio-button" label="OFFICIAL" data-page-node-id="GTkmBc6bUbk5jm4ru8BvxB">{text("正式運營")}</RimoElement>
<RimoElement kind="el-radio-button" label="TRIAL" data-page-node-id="RaLToePOAi3vXcWIiuuclv">{text("試用保障")}</RimoElement></RimoElement></RimoElement>
<RimoElement kind="el-form-item" label="計費結算規模與方式" data-page-node-id="CVOqUTvuur5P1miRaSY1fu"><div className="flex gap-3 w-full items-center" data-page-node-id="wXFjyHS5T4bAHB1ZB3KGKp" data-rimo-layout="field-row"><RimoElement kind="el-input-number" modelValue={view.wizardForm.quota} onModelChange={value => {
                    model.write(["wizardForm", "quota"], value);
                  }} min={view.minimumQuota} step={1} placeholder="臺數" className="flex-1" controlsPosition="right" data-page-node-id="NO8vLvUreP1zUKzUhcefwS"></RimoElement>
<div className="text-xs text-gray-500 shrink-0 pl-1" style={rimoStyle("width: 56px;")} data-page-node-id="CVcOaXFanz7knF9hEEEVNN">{text("臺")}</div>
<RimoElement kind="el-select" modelValue={view.wizardForm.billing} onModelChange={value => {
                    model.write(["wizardForm", "billing"], value);
                  }} className="flex-1 w-full shrink-0" data-page-node-id="t363i0tdeRmSlmyQZVpssn"><RimoElement kind="el-option" label="按月結付" value="MONTHLY" data-page-node-id="Z3BDxKaA4I9MkHduoPmJrf"></RimoElement>
<RimoElement kind="el-option" label="年度統付" value="ANNUALLY" data-page-node-id="6CVsEHvit2sadqi2lIqB1M"></RimoElement></RimoElement></div></RimoElement>
<RimoElement kind="el-form-item" label="合約期數與開始時間" data-page-node-id="k5RAOK4ezpAIncCFpqsPAS"><div className="flex gap-3 w-full items-center" data-page-node-id="EV2i8yBCSrSJvnQ7C1tBpQ" data-rimo-layout="field-row"><RimoElement kind="el-input-number" modelValue={view.wizardForm.durationMonths} onModelChange={value => {
                    model.write(["wizardForm", "durationMonths"], value);
                  }} min={1} step={1} placeholder="期數" className="flex-1" controlsPosition="right" data-page-node-id="Tg6ON6eyN1YmEnD4P8SfGv"></RimoElement>
<div className="text-xs text-gray-500 shrink-0 pl-1" style={rimoStyle("width: 56px;")} data-page-node-id="b9FZIUuTTpYHtOHEAoJY7X">{text("期(")}{rimoText(view.wizardForm.billing === 'ANNUALLY' ? '年' : '月')}{text(")")}</div>
<RimoElement kind="el-date-picker" modelValue={view.wizardForm.startDate} onModelChange={value => {
                    model.write(["wizardForm", "startDate"], value);
                  }} type="date" placeholder="選擇合約開始日期" className="flex-1 w-full shrink-0" valueFormat="YYYY-MM-DD" data-page-node-id="1kGuYtIbwlJN9EHFMbxPep"></RimoElement></div></RimoElement>
{view.wizardForm.type === 'OFFICIAL' ? <><RimoElement kind="el-form-item" label="生效方式" className="mb-0" data-page-node-id="H0WB25ubeq58zcMZ0V06Tr"><div className="w-full" data-page-node-id="LUnbcm37WOSq32P9nyfW8h"><RimoElement kind="el-radio-group" modelValue={view.wizardForm.effectMode} onModelChange={value => {
                      model.write(["wizardForm", "effectMode"], value);
                    }} data-page-node-id="NFjdCWDKVuJi1H0BEJHePT"><RimoElement kind="el-radio-button" label="IMMEDIATE" data-page-node-id="Fh1BQp8ZDKKFPTJ1hDOK5E">{text("立即生效")}</RimoElement>
<RimoElement kind="el-radio-button" label="CONTRACT_START" data-page-node-id="aG9USrWrldQGSmGaXpWZt8">{text("合約期生效")}</RimoElement></RimoElement>
<div className="mt-2 rounded-md border border-blue-100 bg-blue-50 px-3 py-2 text-xs text-blue-700" data-page-node-id="fcQyieLEhSXFYErZlTGweU"><div data-page-node-id="4AMxcVHmGVXxCJQkdwQNWr">{rimoText(view.isActiveContractEdit ? '實際生效時間' : '預計生效時間')}{text("：")}{rimoText(view.computedEffectiveAt)}</div>
{view.giftPeriodDays > 0 ? <><div className="mt-1">{text("\n                                        生效日至合約開始日前共 ")}{rimoText(view.giftPeriodDays)}{text(" 天，作爲贈送期，不計入合約費用。\n                                    ")}</div></> : view.wizardForm.effectMode === 'CONTRACT_START' ? <><div className="mt-1" data-page-node-id="NDqYJQ7eB1l394FlGJf0fg">{text("\n                                        合約開始日生效，不產生贈送期。\n                                    ")}</div></> : null}</div></div></RimoElement></> : null}</div>
{view.wizardMode === 'convert' && view.sourceTrialContract ? <><div className="mt-4 rounded-lg border border-emerald-100 bg-emerald-50 px-4 py-3" data-page-node-id="s8OE3Pj8XHLXrqE4AvxdBH"><div className="text-sm font-semibold text-emerald-800" data-page-node-id="Cn8A3sSaBZtmcXT9AmOOaf">{text("承接範圍")}</div>
<div className="mt-2 grid grid-cols-3 gap-3 text-center" data-page-node-id="ApBTAdE1IvQpaP876y3OVL" data-rimo-grid="3"><div data-page-node-id="hBo5qFBBaoxN95z3TlP1qY"><div className="text-lg font-bold text-gray-800" data-page-node-id="yd5zlTpCefvT4Zu8Z073nx">{rimoText(view.sourceTrialContract.branchCount)}</div>
<div className="text-xs text-gray-500" data-page-node-id="uFWTxzNlVMaFx2Mf3xgyJG">{text("分公司")}</div></div>
<div data-page-node-id="I4jFfZFanY5hdZMlQCwhsJ"><div className="text-lg font-bold text-gray-800" data-page-node-id="2YA5KfkVsMupB8H4xynwlc">{rimoText(view.sourceTrialContract.allocatedQuota)}</div>
<div className="text-xs text-gray-500" data-page-node-id="UdjvV7Kv7HJuGZEKcdobq4">{text("已分配配額")}</div></div>
<div data-page-node-id="1ahTwpdm9hGCBuQcTN8m2E"><div className="text-lg font-bold text-gray-800" data-page-node-id="viWjVyjBga5AMkBi47LRJn">{rimoText(view.sourceTrialContract.vehicleCount)}</div>
<div className="text-xs text-gray-500" data-page-node-id="3MJYtTE8eXynp3YGkOSRez">{text("已綁車輛")}</div></div></div>
<div className="mt-2 text-xs text-emerald-700" data-page-node-id="DB1WBYw7npymPIP7iYGazY">{view.conversionQuotaGap > 0 ? <><>{text("\n                                正式配額較試用階段少 ")}{rimoText(view.conversionQuotaGap)}{text(" 臺；生效前需將原配額和綁定車輛調整至不超過 ")}{rimoText(view.wizardForm.quota)}{text(" 臺。\n                            ")}</></> : <><>{text("\n                                正式合同生效時自動承接原分公司配額和車輛綁定。\n                            ")}</></>}</div></div></> : null}
<div className="mt-4 bg-orange-50/50 border border-orange-100 p-4 rounded-xl flex items-center justify-between" data-page-node-id="cBZUUaeTB8YmRdz7EpdlDS"><div data-page-node-id="RrH7NwaVeRBmQBXdeOWfSF"><div className="text-xs text-orange-600 font-medium mb-1" data-page-node-id="Qe9aGCDXqgy93bkkXF920V">{text("合約金額")}</div></div>
<div className="text-right" data-page-node-id="1AcXXRKw7H5XCieXCM2uDB"><span className="text-2xl font-bold text-orange-600 font-mono" data-page-node-id="sLsDrhSZVxo2uazdNtpSSy">{rimoText(view.calculatedReferencePrice.amount)}</span>
<span className="text-sm text-orange-500 ml-1" data-page-node-id="aCgsk09HnJ4NuepW1CrpQx">{rimoText(view.calculatedReferencePrice.suffix)}</span></div></div></RimoElement></div></>}</RimoElement>
<RimoElement kind="el-dialog" modelValue={view.showPayerManageDialog} onModelChange={value => {
      model.write(["showPayerManageDialog"], value);
    }} title="結算代付方管理" width="700px" appendToBody={true} className="official-vehicle-contracts-overlay" data-page-node-id="nbEr1rG537R2zrJLT4zGNH">{() => <><div className="px-2 pb-4" data-page-node-id="SasxtLrTzbRJE2K0NEByOa"><div className="flex justify-between items-center mb-4" data-page-node-id="GfnNntDhMFDNVs6WgJvs0A" data-rimo-layout="toolbar"><div className="text-sm text-gray-500" data-page-node-id="apyLK7hsGyTiipp4B8Rxm4">{text("管理所有的系統結算代付企業檔案")}</div>
<RimoElement kind="el-button" type="primary" onClick={event => {
              view.openAddPayerDialog?.(event);
            }} data-page-node-id="oksGqNChGBGOrnk5H1j6wG"><RimoElement kind="el-icon" className="mr-1" data-page-node-id="mtd4BvRM9yYHW9bQrdCvdU"><RimoIcon name="Plus" /></RimoElement>
{text(" 新增結算方\n                    ")}</RimoElement></div>
<RimoElement kind="el-table" data={view.payerOptions} style={rimoStyle("width: 100%")} border={true} size="small" highlightCurrentRow={true} data-page-node-id="8G3ABqXSErUPVZ9KRrdA5G"><RimoElement kind="el-table-column" prop="name" label="企業名稱" minWidth="150" data-page-node-id="5ykgJE5zxHsNNBLLvHQFCc"></RimoElement>
<RimoElement kind="el-table-column" prop="taxId" label="統編" width="100" data-page-node-id="7JAOEDmfLiAucknXekUw0a"></RimoElement>
<RimoElement kind="el-table-column" prop="contact" label="企業聯繫人" width="100" data-page-node-id="kz6BZD7uFEcZRi6Wsjm2mP"></RimoElement>
<RimoElement kind="el-table-column" prop="phone" label="聯繫方式" width="130" data-page-node-id="UiNQ1ipTdLpBLoncH9H0qJ"></RimoElement>
<RimoElement kind="el-table-column" label="操作" width="120" fixed="right" align="center" data-page-node-id="YW4Uv75HAXd9CLoxLx4M3d" slots={{
              "default": ({
                row,
                $index
              }) => <><RimoElement kind="el-button" link={true} type="primary" size="small" onClick={_event => {
                  view.openEditPayerDialog(row, $index);
                }} data-page-node-id="8GFcBBDdvSIliNtR5MKJJC">{text("編輯")}</RimoElement>
<RimoElement kind="el-button" link={true} type="danger" size="small" onClick={_event => {
                  view.deletePayer($index);
                }} data-page-node-id="bnrKs2XwbSdqZX2iLISc93">{text("刪除")}</RimoElement></>
            }}></RimoElement></RimoElement></div></>}</RimoElement>
<RimoElement kind="el-dialog" modelValue={view.showPayerFormDialog} onModelChange={value => {
      model.write(["showPayerFormDialog"], value);
    }} title={view.payerFormMode === 'add' ? '新增結算代付企業' : '編輯結算代付企業'} width="450px" appendToBody={true} className="official-vehicle-contracts-overlay" data-page-node-id="xfggYpdATkkUGZkwagJrqn" slots={{
      "footer": _slot => <><span className="dialog-footer" data-page-node-id="9bHEYwEfr6CF96prnjot73"><RimoElement kind="el-button" onClick={_event => {
            model.write(["showPayerFormDialog"], false);
          }} data-page-node-id="oSaxLZNqD9dq5NvCOPel4y">{text("取消")}</RimoElement>
<RimoElement kind="el-button" type="primary" onClick={event => {
            view.submitPayerForm?.(event);
          }} data-page-node-id="mMLsbKcPUG3q1xvgRYEpQB">{text("\n                        ")}{rimoText(view.payerFormMode === 'add' ? '確認添加' : '保存修改')}{text("\n                    ")}</RimoElement></span></>
    }}>{() => <><div className="px-2" data-page-node-id="HPDJaFkUeJHyEJaEcZjxnb"><RimoElement kind="el-form" model={view.payerForm} rules={view.payerRules} modelRef={model.ref("payerFormRef")} labelPosition="top" data-page-node-id="f3guz8FCcg43EOXaryIOfA"><RimoElement kind="el-form-item" label="企業名稱" prop="name" data-page-node-id="HBr2RV1EXOqWMiVvmriCi4"><RimoElement kind="el-input" modelValue={view.payerForm.name} onModelChange={value => {
                model.write(["payerForm", "name"], value);
              }} placeholder="請輸入完整的企業名稱" data-page-node-id="Eu2oSfCnNbcUxJ4BFzXvKZ"></RimoElement></RimoElement>
<RimoElement kind="el-row" gutter={20} data-page-node-id="EIaxYsSwMUcClzWgYOfoT1"><RimoElement kind="el-col" span={12} data-page-node-id="uM7b6PfbaJfufLyqoRJsFU"><RimoElement kind="el-form-item" label="統一代碼/統編" prop="taxId" data-page-node-id="8C56gjO1bg9cFnWm9625W5"><RimoElement kind="el-input" modelValue={view.payerForm.taxId} onModelChange={value => {
                    model.write(["payerForm", "taxId"], value);
                  }} placeholder="統編號碼" data-page-node-id="AGXSOCiAbxuJGjgHFhPs2g"></RimoElement></RimoElement></RimoElement>
<RimoElement kind="el-col" span={12} data-page-node-id="bY9GfxEKpHZ16Rkj2mBM96"><RimoElement kind="el-form-item" label="企業聯繫人" prop="contact" data-page-node-id="2GGfQER0D3vekqLexBo5v4"><RimoElement kind="el-input" modelValue={view.payerForm.contact} onModelChange={value => {
                    model.write(["payerForm", "contact"], value);
                  }} placeholder="聯繫人姓名" data-page-node-id="IikkONXFztSZ8EPlSXzuWM"></RimoElement></RimoElement></RimoElement></RimoElement>
<RimoElement kind="el-form-item" label="聯繫方式 (電話/郵箱)" prop="phone" data-page-node-id="gmO6bOzOqCr6Xf5Nq9CgyY"><RimoElement kind="el-input" modelValue={view.payerForm.phone} onModelChange={value => {
                model.write(["payerForm", "phone"], value);
              }} placeholder="請輸入有效聯繫方式" data-page-node-id="cVevBgzdLBns14y55t0oJT"></RimoElement></RimoElement></RimoElement>
{view.payerFormMode === 'add' ? <><div className="mt-4 bg-blue-50 text-blue-800 text-xs p-3 rounded flex items-start gap-2 border border-blue-100" data-page-node-id="cCUHESM7UdyvAt7tzryUgd"><RimoElement kind="el-icon" className="mt-0.5 text-blue-600" data-page-node-id="k6hTvfdxZJ0v5Q5ZxCUfkl"><RimoIcon name="InfoFilled" /></RimoElement>
<div data-page-node-id="ObKkiKdCDnbRKEHubxK0wE">{text("新增後的結算方信息將自動保存，並在表單可用。")}</div></div></> : null}</div></>}</RimoElement></RimoRoot>;
}