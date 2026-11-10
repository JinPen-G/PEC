import { Fragment } from 'react';
import { useRimoModel, rimoEntries } from '../../lib/rimo-model.js';
import { RimoRoot, RimoIcon, useRimoEnvironment } from '../../lib/RimoEnvironment.jsx';
import { RimoElement, rimoClass, rimoStyle, rimoText } from '../../lib/RimoElements.jsx';
import './enterprise-official-vehicle-reminders.css';
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
    const {
      ElMessage: _ElMessage,
      ElMessageBox: _ElMessageBox
    } = feedback;
    const branchOptions = ref([{
      id: 'B01',
      name: '臺北分公司'
    }, {
      id: 'B02',
      name: '新竹分公司'
    }, {
      id: 'B03',
      name: '臺中分公司'
    }, {
      id: 'B04',
      name: '高雄分公司'
    }]);
    const maintenanceTemplates = ref([{
      id: 'MT-001',
      name: '新車',
      scopeType: 'enterprise',
      scopeBranchId: '',
      thresholdMileageKm: 5000,
      advanceMileageKm: 500,
      thresholdMonths: 6,
      advanceDays: 15,
      status: 'enabled',
      remark: '適用於常規行政轎車'
    }, {
      id: 'MT-002',
      name: '老車',
      scopeType: 'branch',
      scopeBranchId: 'B01',
      thresholdMileageKm: 3000,
      advanceMileageKm: 300,
      thresholdMonths: 3,
      advanceDays: 10,
      status: 'enabled',
      remark: '適用於臺北分公司高里程舊車'
    }, {
      id: 'MT-003',
      name: '常用接待車',
      scopeType: 'branch',
      scopeBranchId: 'B04',
      thresholdMileageKm: 4000,
      advanceMileageKm: 400,
      thresholdMonths: 4,
      advanceDays: 10,
      status: 'enabled',
      remark: '適用於高雄高頻商務接待車'
    }]);
    const cleaningTemplates = ref([{
      id: 'CT-001',
      name: '日常清潔',
      scopeType: 'enterprise',
      scopeBranchId: '',
      thresholdUseCount: 10,
      advanceUseCount: 2,
      thresholdDays: 15,
      advanceDays: 3,
      status: 'enabled',
      remark: '適用於常規日常清潔'
    }, {
      id: 'CT-002',
      name: '高頻用車',
      scopeType: 'branch',
      scopeBranchId: 'B04',
      thresholdUseCount: 6,
      advanceUseCount: 1,
      thresholdDays: 7,
      advanceDays: 2,
      status: 'enabled',
      remark: '適用於高雄高頻派車車輛'
    }, {
      id: 'CT-003',
      name: '主管車',
      scopeType: 'branch',
      scopeBranchId: 'B01',
      thresholdUseCount: 4,
      advanceUseCount: 1,
      thresholdDays: 10,
      advanceDays: 2,
      status: 'disabled',
      remark: '適用於臺北主管車深度清潔'
    }]);
    const vehicles = ref([{
      id: 'V1',
      licensePlate: 'BXR-8899',
      model: 'Lexus ES 250 2023款',
      source: 'SELF_OWNED',
      branch: 'B01',
      stationName: '臺北總部地下停車場',
      contractId: 'CT-A01',
      currentMileage: 25700,
      maintenanceTemplateId: 'MT-002',
      cleaningTemplateId: 'CT-001',
      lastMaintenanceAt: '2026-01-12',
      lastMaintenanceMileage: 20550,
      lastCleaningAt: '2026-05-03',
      completedUseCountSinceCleaning: 12
    }, {
      id: 'V2',
      licensePlate: 'KLA-2108',
      model: 'Toyota Alphard 2023款',
      source: 'HESUAN',
      branch: 'B04',
      stationName: '高雄軟件園區 B2 停車場',
      contractId: 'CT-K01',
      currentMileage: 41280,
      maintenanceTemplateId: 'MT-003',
      cleaningTemplateId: 'CT-002',
      lastMaintenanceAt: '2026-02-01',
      lastMaintenanceMileage: 37880,
      lastCleaningAt: '2026-05-08',
      completedUseCountSinceCleaning: 8
    }, {
      id: 'V3',
      licensePlate: 'TFD-5326',
      model: 'Toyota Camry 2022款',
      source: 'GESHANG',
      branch: 'B03',
      stationName: '臺中工業區訪客停車場',
      contractId: 'CT-C01',
      currentMileage: 33220,
      maintenanceTemplateId: 'MT-001',
      cleaningTemplateId: 'CT-001',
      lastMaintenanceAt: '2026-05-01',
      lastMaintenanceMileage: 30150,
      lastCleaningAt: '2026-05-20',
      completedUseCountSinceCleaning: 1
    }, {
      id: 'V4',
      licensePlate: 'APL-6621',
      model: 'Mercedes-Benz E300 2024款',
      source: 'SELF_OWNED',
      branch: 'B02',
      stationName: '新竹竹北辦公大樓停車場',
      contractId: 'CT-H01',
      currentMileage: 18600,
      maintenanceTemplateId: '',
      cleaningTemplateId: 'CT-001',
      lastMaintenanceAt: '',
      lastMaintenanceMileage: null,
      lastCleaningAt: '2026-05-12',
      completedUseCountSinceCleaning: 8
    }, {
      id: 'V5',
      licensePlate: 'RCM-7358',
      model: 'Skoda Superb 2021款',
      source: '中租',
      branch: 'B01',
      stationName: '臺北內湖科技園區停車場',
      contractId: 'CT-A01',
      currentMileage: null,
      maintenanceTemplateId: 'MT-002',
      cleaningTemplateId: '',
      lastMaintenanceAt: '2026-02-18',
      lastMaintenanceMileage: 50210,
      lastCleaningAt: '',
      completedUseCountSinceCleaning: 0
    }]);
    const reminders = ref([{
      id: 'R-001',
      vehicleId: 'V1',
      type: 'maintenance',
      templateId: 'MT-002',
      status: 'pending',
      dueLevel: 'overdue',
      triggeredAt: '2026-05-25 09:20',
      currentSummary: '當前 25,700 km｜已行駛 5,150 km',
      currentBase: '上次保養：20,550 km / 2026-01-12',
      currentValue: '當前里程 25,700 km；距上次保養已行駛 5,150 km',
      threshold: '3,000 km / 3 個月',
      triggerReason: '已到期：里程已超過保養閾值'
    }, {
      id: 'R-002',
      vehicleId: 'V2',
      type: 'cleaning',
      templateId: 'CT-002',
      status: 'pending',
      dueLevel: 'overdue',
      triggeredAt: '2026-05-25 08:45',
      currentSummary: '已用車 8 次｜距上次清潔 17 天',
      currentBase: '上次清潔：2026-05-08',
      currentValue: '上次清潔後已完成 8 次公務車預約；距上次清潔 17 天',
      threshold: '6 次 / 7 天',
      triggerReason: '已到期：用車次數和天數均已超過清潔閾值'
    }, {
      id: 'R-003',
      vehicleId: 'V3',
      type: 'maintenance',
      templateId: 'MT-001',
      status: 'completed',
      dueLevel: 'upcoming',
      triggeredAt: '2026-05-18 11:10',
      currentSummary: '當前 33,220 km｜已行駛 3,070 km',
      currentBase: '上次保養：30,150 km / 2026-05-01',
      currentValue: '當前里程 33,220 km；距上次保養已行駛 3,070 km',
      threshold: '5,000 km / 6 個月',
      triggerReason: '手動登記完成後已關閉',
      completionRecord: {
        completedAt: '2026-05-22',
        completedMileage: 33220,
        remark: '例行保養完成，已更換機油並檢查輪胎。',
        operatorName: '王怡君',
        operatedAt: '2026-05-22 16:30',
        baselineText: '上次保養更新爲 33,220 km / 2026-05-22'
      }
    }, {
      id: 'R-004',
      vehicleId: 'V1',
      type: 'cleaning',
      templateId: 'CT-001',
      status: 'ignored',
      dueLevel: 'overdue',
      triggeredAt: '2026-05-19 14:00',
      currentSummary: '已用車 12 次｜距上次清潔 22 天',
      currentBase: '上次清潔：2026-05-03',
      currentValue: '上次清潔後已完成 12 次公務車預約；距上次清潔 22 天',
      threshold: '10 次 / 15 天',
      triggerReason: '已由管理員忽略本次提醒'
    }, {
      id: 'R-005',
      vehicleId: 'V4',
      type: 'cleaning',
      templateId: 'CT-001',
      status: 'pending',
      dueLevel: 'upcoming',
      triggeredAt: '2026-05-25 10:30',
      currentSummary: '已用車 8 次｜距上次清潔 13 天',
      currentBase: '上次清潔：2026-05-12',
      currentValue: '上次清潔後已完成 8 次公務車預約；距上次清潔 13 天',
      threshold: '10 次 / 15 天',
      triggerReason: '即將到期：已達到提前清潔提醒點'
    }, {
      id: 'R-006',
      vehicleId: 'V2',
      type: 'maintenance',
      templateId: 'MT-003',
      status: 'invalidated',
      dueLevel: 'overdue',
      triggeredAt: '2026-05-20 16:10',
      currentSummary: '當前 41,280 km｜已行駛 4,880 km',
      currentBase: '原分公司母版已清空',
      currentValue: '車輛資產歸屬分公司調整後，原高雄分公司專用保養提醒已失效',
      threshold: '4,000 km / 4 個月',
      triggerReason: '已失效：車輛資產歸屬分公司變更，原分公司專用母版不再適用'
    }]);
    const filters = reactive({
      query: '',
      type: '',
      status: '',
      branch: '',
      scope: '',
      templateKey: '',
      quick: ''
    });
    const reminderPagination = reactive({
      currentPage: 1,
      pageSize: 10
    });
    const vehicleBindingPagination = reactive({
      currentPage: 1,
      pageSize: 10
    });
    const vehicleBindingFilters = reactive({
      keyword: '',
      branch: '',
      status: ''
    });
    const vehicleBindingTableRef = ref(null);
    const selectedBindingVehicles = ref([]);
    const batchBindingDialogVisible = ref(false);
    const batchBindingForm = reactive({
      maintenanceTemplateId: '',
      cleaningTemplateId: ''
    });
    const currentUser = reactive({
      role: 'headquarters_admin',
      branchId: 'B01'
    });
    const settingsDialogVisible = ref(false);
    const settingsTab = ref('maintenance');
    const branchTemplateFeatureEnabled = ref(true);
    const notificationDialogVisible = ref(false);
    const notificationActiveTab = ref('settings');
    const activeSummaryCard = ref('');
    const vehicleBindingQuickFilter = ref('');
    const notificationSettings = ref([{
      id: 'NS-001',
      receiverName: '王怡君',
      receiverEmail: 'yijun.wang@example.com',
      noticeScopes: ['maintenance', 'cleaning'],
      vehicleScope: 'all',
      vehicleConditionType: '',
      vehicleConditionValues: [],
      status: 'enabled'
    }, {
      id: 'NS-002',
      receiverName: '陳建宏',
      receiverEmail: 'service.admin@example.com',
      noticeScopes: ['maintenance'],
      vehicleScope: 'condition',
      vehicleConditionType: 'source',
      vehicleConditionValues: ['SELF_OWNED'],
      status: 'enabled'
    }, {
      id: 'NS-003',
      receiverName: '高雄車務組',
      receiverEmail: 'kh-fleet@example.com',
      noticeScopes: ['cleaning'],
      vehicleScope: 'all',
      vehicleConditionType: '',
      vehicleConditionValues: [],
      status: 'disabled'
    }]);
    const notificationLogFilters = reactive({
      type: '',
      status: '',
      keyword: '',
      dateRange: []
    });
    const notificationSendLogs = ref([{
      id: 'NL-001',
      sentAt: '2026-05-25 09:10',
      type: 'maintenance',
      stage: 'due',
      vehicleId: 'V1',
      reminderStatus: 'pending',
      recipients: [{
        receiverName: '王怡君',
        receiverEmail: 'yijun.wang@example.com',
        status: 'success',
        failureReason: ''
      }, {
        receiverName: '陳建宏',
        receiverEmail: 'service.admin@example.com',
        status: 'success',
        failureReason: ''
      }, {
        receiverName: '高雄車務組',
        receiverEmail: 'kh-fleet@example.com',
        status: 'failed',
        failureReason: 'SMTP 連接超時'
      }]
    }, {
      id: 'NL-002',
      sentAt: '2026-05-25 09:12',
      type: 'cleaning',
      stage: 'advance',
      vehicleId: 'V3',
      reminderStatus: 'ignored',
      recipients: [{
        receiverName: '王怡君',
        receiverEmail: 'yijun.wang@example.com',
        status: 'success',
        failureReason: ''
      }, {
        receiverName: '高雄車務組',
        receiverEmail: 'kh-fleet@example.com',
        status: 'success',
        failureReason: ''
      }]
    }, {
      id: 'NL-003',
      sentAt: '2026-05-25 09:13',
      type: 'maintenance',
      stage: 'advance',
      vehicleId: 'V2',
      reminderStatus: 'pending',
      recipients: [{
        receiverName: '陳建宏',
        receiverEmail: 'service.admin@example.com',
        status: 'failed',
        failureReason: 'SMTP 連接超時'
      }, {
        receiverName: '王怡君',
        receiverEmail: 'yijun.wang@example.com',
        status: 'failed',
        failureReason: '收件服務器拒收'
      }]
    }, {
      id: 'NL-004',
      sentAt: '2026-05-24 17:20',
      type: 'cleaning',
      stage: 'due',
      vehicleId: 'V4',
      reminderStatus: 'completed',
      recipients: [{
        receiverName: '高雄車務組',
        receiverEmail: 'kh-fleet@example.com',
        status: 'failed',
        failureReason: '收件人 Email 被退信'
      }]
    }]);
    const templateDialogVisible = ref(false);
    const templateForm = reactive({
      type: 'maintenance',
      id: '',
      name: '',
      scopeType: 'enterprise',
      scopeBranchId: '',
      thresholdMileageKm: 5000,
      advanceMileageKm: 500,
      thresholdMonths: 6,
      thresholdUseCount: 10,
      advanceUseCount: 2,
      thresholdDays: 15,
      advanceDays: 3,
      remark: ''
    });
    const completionDialogVisible = ref(false);
    const completionRecordDialogVisible = ref(false);
    const prototypeLogDialogVisible = ref(false);
    const activeReminder = ref(null);
    const completionForm = reactive({
      completedAt: '',
      completedMileage: 0,
      remark: ''
    });
    const getVehicle = vehicleId => vehicles.value.find(item => item.id === vehicleId);
    const getVehicleLabel = vehicleId => {
      const vehicle = getVehicle(vehicleId);
      return vehicle ? `${vehicle.licensePlate}｜${vehicle.model}` : '-';
    };
    const getNotificationTypeText = type => {
      return type === 'maintenance' ? '保養提醒' : '清潔提醒';
    };
    const getNotificationBatchStats = log => {
      const recipients = log.recipients || [];
      const recipientCount = recipients.length;
      const successCount = recipients.filter(item => item.status === 'success').length;
      const failedCount = recipients.filter(item => item.status === 'failed').length;
      let status = 'success';
      if (failedCount === recipientCount && recipientCount > 0) {
        status = 'failed';
      } else if (failedCount > 0) {
        status = 'partial_failed';
      }
      return {
        recipientCount,
        successCount,
        failedCount,
        status
      };
    };
    const getNotificationBatchStatusText = status => {
      const statusMap = {
        success: '成功',
        partial_failed: '部分失敗',
        failed: '失敗'
      };
      return statusMap[status] || '-';
    };
    const getNotificationBatchStatusTag = status => {
      if (status === 'success') return 'success';
      if (status === 'partial_failed') return 'warning';
      return 'danger';
    };
    const getReminderStatusText = status => {
      const statusMap = {
        pending: '待處理',
        ignored: '已忽略',
        completed: '已完成',
        invalidated: '已失效'
      };
      return statusMap[status] || '-';
    };
    const getBranchName = branchId => {
      const branch = branchOptions.value.find(item => item.id === branchId);
      return branch ? branch.name : '集團總池';
    };
    const notificationVehicleSourceOptions = [{
      value: 'SELF_OWNED',
      label: '自購（自有資產）'
    }, {
      value: 'HESUAN',
      label: '和運租車'
    }, {
      value: 'GESHANG',
      label: '格上租車'
    }, {
      value: '中租',
      label: '中租租車'
    }, {
      value: 'OTHER',
      label: '其他'
    }];
    const notificationContractOptions = [{
      value: 'CT-A01',
      label: '臺北公務車合約'
    }, {
      value: 'CT-H01',
      label: '新竹公務車合約'
    }, {
      value: 'CT-C01',
      label: '臺中公務車合約'
    }, {
      value: 'CT-K01',
      label: '高雄公務車合約'
    }];
    const notificationVehicleConditionTypes = [{
      value: 'source',
      label: '車輛來源'
    }, {
      value: 'branch',
      label: '資產歸屬分公司'
    }, {
      value: 'station',
      label: '所屬據點'
    }, {
      value: 'contract',
      label: '綁定合約'
    }];
    const getVehicleSourceText = source => {
      const matched = notificationVehicleSourceOptions.find(item => item.value === source);
      return matched ? matched.label : '其他';
    };
    const notificationStationOptions = computed(() => {
      const stationNames = Array.from(new Set(vehicles.value.map(item => item.stationName).filter(Boolean)));
      return stationNames.map(name => ({
        value: name,
        label: name
      }));
    });
    const hasNotificationVehicleCondition = row => {
      return Boolean(row.vehicleConditionType && (row.vehicleConditionValues || []).length);
    };
    const getNotificationConditionValueOptions = row => {
      if (row.vehicleConditionType === 'source') return notificationVehicleSourceOptions;
      if (row.vehicleConditionType === 'branch') {
        return branchOptions.value.map(item => ({
          value: item.id,
          label: item.name
        }));
      }
      if (row.vehicleConditionType === 'station') return notificationStationOptions.value;
      if (row.vehicleConditionType === 'contract') return notificationContractOptions;
      return [];
    };
    const getNotificationConditionValuePlaceholder = row => {
      if (row.vehicleConditionType === 'source') return '選擇車輛來源';
      if (row.vehicleConditionType === 'branch') return '選擇資產歸屬分公司';
      if (row.vehicleConditionType === 'station') return '選擇所屬據點';
      if (row.vehicleConditionType === 'contract') return '選擇綁定合約';
      return '請先選擇匹配條件';
    };
    const getNotificationMatchedVehicles = row => {
      if ((row.vehicleScope || 'all') === 'all') return vehicles.value;
      if (!hasNotificationVehicleCondition(row)) return [];
      const values = row.vehicleConditionValues || [];
      return vehicles.value.filter(item => {
        if (row.vehicleConditionType === 'source') return values.includes(item.source);
        if (row.vehicleConditionType === 'branch') return values.includes(item.branch);
        if (row.vehicleConditionType === 'station') return values.includes(item.stationName);
        if (row.vehicleConditionType === 'contract') return values.includes(item.contractId);
        return false;
      });
    };
    const getTemplateList = type => type === 'maintenance' ? maintenanceTemplates.value : cleaningTemplates.value;
    const getTemplateById = (type, templateId) => {
      const list = getTemplateList(type);
      return list.find(item => item.id === templateId);
    };
    const getTemplateScopeText = template => {
      if (!template) return '未綁定母版';
      if (template.scopeType === 'enterprise') {
        return '企業通用';
      }
      return `${getBranchName(template.scopeBranchId)}專用`;
    };
    const getTemplateDisplayName = (type, templateId) => {
      const template = getTemplateById(type, templateId);
      return template ? `${getTemplateScopeText(template)}｜${template.name}` : '未綁定母版';
    };
    const isBranchTemplateFeatureEnabled = () => {
      return branchTemplateFeatureEnabled.value;
    };
    const isTemplateSelectableForBranch = (_type, template, branchId) => {
      if (template.status !== 'enabled') return false;
      if (template.scopeType === 'enterprise') return true;
      return template.scopeBranchId === branchId;
    };
    const getAvailableTemplates = (type, branchId, selectedTemplateId = '') => {
      const availableTemplates = getTemplateList(type).filter(item => {
        if (item.status !== 'enabled') return false;
        if (item.scopeType === 'enterprise') return true;
        return isBranchTemplateFeatureEnabled(type) && item.scopeBranchId === branchId;
      });
      if (selectedTemplateId && !availableTemplates.some(item => item.id === selectedTemplateId)) {
        const selectedTemplate = getTemplateById(type, selectedTemplateId);
        if (selectedTemplate) {
          availableTemplates.push(selectedTemplate);
        }
      }
      return availableTemplates;
    };
    const getAppliedCount = (type, templateId) => {
      return vehicles.value.filter(item => {
        return type === 'maintenance' ? item.maintenanceTemplateId === templateId : item.cleaningTemplateId === templateId;
      }).length;
    };
    const hasMileageBasis = vehicle => {
      return vehicle.currentMileage !== null && vehicle.currentMileage !== undefined && vehicle.lastMaintenanceMileage !== null && vehicle.lastMaintenanceMileage !== undefined;
    };
    const isMaintenanceConfigIncomplete = vehicle => {
      if (!vehicle.maintenanceTemplateId) return true;
      return !vehicle.lastMaintenanceAt && !hasMileageBasis(vehicle);
    };
    const isCleaningConfigIncomplete = vehicle => {
      return !vehicle.cleaningTemplateId || !vehicle.lastCleaningAt;
    };
    const isVehicleConfigIncomplete = vehicle => {
      return isMaintenanceConfigIncomplete(vehicle) || isCleaningConfigIncomplete(vehicle);
    };
    const templateFilterOptions = computed(() => {
      const maintenance = maintenanceTemplates.value.map(item => ({
        value: `maintenance:${item.id}`,
        label: `保養｜${getTemplateScopeText(item)}｜${item.name}`
      }));
      const cleaning = cleaningTemplates.value.map(item => ({
        value: `cleaning:${item.id}`,
        label: `清潔｜${getTemplateScopeText(item)}｜${item.name}`
      }));
      return maintenance.concat(cleaning);
    });
    const filteredReminders = computed(() => {
      return reminders.value.filter(item => {
        const vehicle = getVehicle(item.vehicleId);
        if (!vehicle) return false;
        if (filters.query) {
          const keyword = filters.query.toLowerCase();
          const matchedVehicle = `${vehicle.licensePlate} ${vehicle.model}`.toLowerCase();
          if (!matchedVehicle.includes(keyword)) return false;
        }
        if (filters.type && item.type !== filters.type) return false;
        if (filters.status && item.status !== filters.status) return false;
        if (filters.quick === 'today' && !(item.status === 'pending' && item.triggeredAt.startsWith('2026-05-25'))) return false;
        if (filters.quick === 'incomplete' && !isVehicleConfigIncomplete(vehicle)) return false;
        if (filters.branch && vehicle.branch !== filters.branch) return false;
        if (filters.scope) {
          const template = getTemplateById(item.type, item.templateId);
          if (!template || template.scopeType !== filters.scope) return false;
        }
        if (filters.templateKey) {
          const currentKey = `${item.type}:${item.templateId}`;
          if (currentKey !== filters.templateKey) return false;
        }
        return true;
      });
    });
    const pagedReminders = computed(() => {
      const startIndex = (reminderPagination.currentPage - 1) * reminderPagination.pageSize;
      return filteredReminders.value.slice(startIndex, startIndex + reminderPagination.pageSize);
    });
    const filteredNotificationSendLogs = computed(() => {
      return notificationSendLogs.value.map(item => {
        return {
          ...item,
          ...getNotificationBatchStats(item)
        };
      }).filter(item => {
        if (notificationLogFilters.type && item.type !== notificationLogFilters.type) return false;
        if (notificationLogFilters.status && item.status !== notificationLogFilters.status) return false;
        if (notificationLogFilters.keyword) {
          const keyword = notificationLogFilters.keyword.toLowerCase();
          const vehicleLabel = getVehicleLabel(item.vehicleId).toLowerCase();
          const recipientText = (item.recipients || []).map(recipient => `${recipient.receiverName} ${recipient.receiverEmail}`).join(' ');
          const targetText = `${recipientText} ${vehicleLabel}`.toLowerCase();
          if (!targetText.includes(keyword)) return false;
        }
        if (notificationLogFilters.dateRange && notificationLogFilters.dateRange.length === 2) {
          const logDate = item.sentAt.slice(0, 10);
          if (logDate < notificationLogFilters.dateRange[0] || logDate > notificationLogFilters.dateRange[1]) return false;
        }
        return true;
      });
    });
    const filteredBindingVehicles = computed(() => {
      return vehicles.value.filter(item => {
        if (!isHeadquartersAdmin.value && item.branch !== currentUser.branchId) {
          return false;
        }
        if (vehicleBindingQuickFilter.value === 'incomplete' && !isVehicleConfigIncomplete(item)) {
          return false;
        }
        if (vehicleBindingFilters.keyword) {
          const keyword = vehicleBindingFilters.keyword.toLowerCase();
          const target = `${item.licensePlate} ${item.model} ${item.stationName}`.toLowerCase();
          if (!target.includes(keyword)) return false;
        }
        if (vehicleBindingFilters.branch && item.branch !== vehicleBindingFilters.branch) {
          return false;
        }
        if (vehicleBindingFilters.status === 'incomplete' && !isVehicleConfigIncomplete(item)) {
          return false;
        }
        if (vehicleBindingFilters.status === 'maintenanceIncomplete' && !isMaintenanceConfigIncomplete(item)) {
          return false;
        }
        if (vehicleBindingFilters.status === 'cleaningIncomplete' && !isCleaningConfigIncomplete(item)) {
          return false;
        }
        if (vehicleBindingFilters.status === 'complete' && isVehicleConfigIncomplete(item)) {
          return false;
        }
        return true;
      });
    });
    const pagedVehicles = computed(() => {
      const startIndex = (vehicleBindingPagination.currentPage - 1) * vehicleBindingPagination.pageSize;
      return filteredBindingVehicles.value.slice(startIndex, startIndex + vehicleBindingPagination.pageSize);
    });
    const stats = computed(() => {
      const pendingMaintenanceVehicles = new Set(reminders.value.filter(item => item.status === 'pending' && item.type === 'maintenance').map(item => item.vehicleId)).size;
      const pendingCleaningVehicles = new Set(reminders.value.filter(item => item.status === 'pending' && item.type === 'cleaning').map(item => item.vehicleId)).size;
      const newToday = reminders.value.filter(item => item.status === 'pending' && item.triggeredAt.startsWith('2026-05-25')).length;
      const incompleteVehicles = vehicles.value.filter(item => isVehicleConfigIncomplete(item)).length;
      return {
        pendingMaintenanceVehicles,
        pendingCleaningVehicles,
        newToday,
        incompleteVehicles
      };
    });
    const templateDialogTitle = computed(() => {
      const prefix = templateForm.id ? '編輯' : '新增';
      return `${prefix}${templateForm.type === 'maintenance' ? '保養母版' : '清潔母版'}`;
    });
    const isHeadquartersAdmin = computed(() => currentUser.role === 'headquarters_admin');
    const canCreateTemplates = computed(() => isHeadquartersAdmin.value || branchTemplateFeatureEnabled.value);
    const selectedBindingVehicleCount = computed(() => selectedBindingVehicles.value.length);
    const batchMaintenanceTemplateOptions = computed(() => getBatchTemplateOptions('maintenance'));
    const batchCleaningTemplateOptions = computed(() => getBatchTemplateOptions('cleaning'));
    const activeReminderVehicle = computed(() => activeReminder.value ? getVehicle(activeReminder.value.vehicleId) : null);
    const completionDialogTitle = computed(() => {
      if (!activeReminder.value) return '登記完成';
      return activeReminder.value.type === 'maintenance' ? '登記已保養' : '登記已清潔';
    });
    const clearReminderFilters = () => {
      filters.query = '';
      filters.type = '';
      filters.status = '';
      filters.branch = '';
      filters.scope = '';
      filters.templateKey = '';
      filters.quick = '';
      reminderPagination.currentPage = 1;
    };
    const applySummaryFilter = type => {
      if (activeSummaryCard.value === type) {
        activeSummaryCard.value = '';
        clearReminderFilters();
        vehicleBindingQuickFilter.value = '';
        return;
      }
      activeSummaryCard.value = type;
      clearReminderFilters();
      vehicleBindingQuickFilter.value = '';
      if (type === 'pendingMaintenance') {
        filters.type = 'maintenance';
        filters.status = 'pending';
        return;
      }
      if (type === 'pendingCleaning') {
        filters.type = 'cleaning';
        filters.status = 'pending';
        return;
      }
      if (type === 'newToday') {
        filters.status = 'pending';
        filters.quick = 'today';
        return;
      }
      if (type === 'incompleteVehicles') {
        vehicleBindingQuickFilter.value = 'incomplete';
        vehicleBindingPagination.currentPage = 1;
        settingsTab.value = 'binding';
        settingsDialogVisible.value = true;
      }
    };
    const openSettingsDialog = () => {
      vehicleBindingQuickFilter.value = '';
      settingsTab.value = 'maintenance';
      settingsDialogVisible.value = true;
    };
    const resetVehicleBindingFilters = () => {
      vehicleBindingFilters.keyword = '';
      vehicleBindingFilters.branch = '';
      vehicleBindingFilters.status = '';
      vehicleBindingQuickFilter.value = '';
      vehicleBindingPagination.currentPage = 1;
      selectedBindingVehicles.value = [];
      vehicleBindingTableRef.value?.clearSelection();
    };
    const getBatchTemplateOptions = type => {
      return getTemplateList(type).filter(item => {
        if (item.status !== 'enabled') return false;
        if (isHeadquartersAdmin.value) {
          return item.scopeType === 'enterprise';
        }
        if (item.scopeType === 'enterprise') return true;
        return branchTemplateFeatureEnabled.value && item.scopeBranchId === currentUser.branchId;
      });
    };
    const canSelectVehicleForBatch = row => {
      if (isHeadquartersAdmin.value) return true;
      return row.branch === currentUser.branchId;
    };
    const handleVehicleBindingSelectionChange = selection => {
      selectedBindingVehicles.value = selection.filter(item => canSelectVehicleForBatch(item));
    };
    const openBatchBindingDialog = () => {
      if (!selectedBindingVehicles.value.length) {
        feedback.ElMessage.warning('請先選擇需要批量套用母版的車輛');
        return;
      }
      batchBindingForm.maintenanceTemplateId = '';
      batchBindingForm.cleaningTemplateId = '';
      batchBindingDialogVisible.value = true;
    };
    const saveBatchVehicleBinding = () => {
      if (!selectedBindingVehicles.value.length) {
        feedback.ElMessage.warning('請先選擇車輛');
        return;
      }
      if (!batchBindingForm.maintenanceTemplateId && !batchBindingForm.cleaningTemplateId) {
        feedback.ElMessage.warning('請至少選擇一個要批量套用的母版');
        return;
      }
      const maintenanceTemplate = batchBindingForm.maintenanceTemplateId ? getTemplateById('maintenance', batchBindingForm.maintenanceTemplateId) : null;
      const cleaningTemplate = batchBindingForm.cleaningTemplateId ? getTemplateById('cleaning', batchBindingForm.cleaningTemplateId) : null;
      const invalidVehicle = selectedBindingVehicles.value.find(vehicle => {
        if (!canSelectVehicleForBatch(vehicle)) return true;
        if (maintenanceTemplate && !isTemplateSelectableForBranch('maintenance', maintenanceTemplate, vehicle.branch)) return true;
        if (cleaningTemplate && !isTemplateSelectableForBranch('cleaning', cleaningTemplate, vehicle.branch)) return true;
        return false;
      });
      if (invalidVehicle) {
        feedback.ElMessage.warning(`車輛 ${invalidVehicle.licensePlate} 不符合當前批量套用權限或母版範圍，整批未保存`);
        return;
      }
      selectedBindingVehicles.value.forEach(vehicle => {
        if (maintenanceTemplate) {
          vehicle.maintenanceTemplateId = maintenanceTemplate.id;
        }
        if (cleaningTemplate) {
          vehicle.cleaningTemplateId = cleaningTemplate.id;
        }
      });
      batchBindingDialogVisible.value = false;
      vehicleBindingTableRef.value?.clearSelection();
      selectedBindingVehicles.value = [];
      feedback.ElMessage.success('已批量套用母版，系統將重新計算所選車輛提醒');
    };
    const addNotificationSetting = () => {
      notificationSettings.value.push({
        id: `NS-${String(Date.now()).slice(-4)}`,
        receiverName: '',
        receiverEmail: '',
        noticeScopes: ['maintenance'],
        vehicleScope: 'all',
        vehicleConditionType: '',
        vehicleConditionValues: [],
        status: 'enabled'
      });
    };
    const handleNotificationVehicleScopeChange = row => {
      if (row.vehicleScope === 'all') {
        row.vehicleConditionType = '';
        row.vehicleConditionValues = [];
      }
    };
    const handleNotificationConditionTypeChange = row => {
      row.vehicleConditionValues = [];
    };
    const removeNotificationSetting = row => {
      notificationSettings.value = notificationSettings.value.filter(item => item.id !== row.id);
    };
    const saveNotificationSettings = () => {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const invalid = notificationSettings.value.find(item => {
        return !item.receiverName.trim() || !item.receiverEmail.trim() || !emailPattern.test(item.receiverEmail) || !item.noticeScopes.length || (item.vehicleScope || 'all') === 'condition' && !hasNotificationVehicleCondition(item);
      });
      if (invalid) {
        feedback.ElMessage.warning('請補齊通知人、正確 Email、通知範圍和車輛條件');
        return;
      }
      notificationDialogVisible.value = false;
      feedback.ElMessage.success('通知設定已保存');
    };
    const openTemplateDialog = (type, row = null) => {
      templateForm.type = type;
      templateForm.id = row ? row.id : '';
      templateForm.name = row ? row.name : '';
      templateForm.scopeType = row ? row.scopeType : isHeadquartersAdmin.value ? 'enterprise' : 'branch';
      templateForm.scopeBranchId = row ? row.scopeBranchId || '' : isHeadquartersAdmin.value ? '' : currentUser.branchId;
      templateForm.thresholdMileageKm = row && type === 'maintenance' ? row.thresholdMileageKm : 5000;
      templateForm.advanceMileageKm = row && type === 'maintenance' ? row.advanceMileageKm : 500;
      templateForm.thresholdMonths = row && type === 'maintenance' ? row.thresholdMonths : 6;
      templateForm.thresholdUseCount = row && type === 'cleaning' ? row.thresholdUseCount : 10;
      templateForm.advanceUseCount = row && type === 'cleaning' ? row.advanceUseCount : 2;
      templateForm.thresholdDays = row && type === 'cleaning' ? row.thresholdDays : 15;
      templateForm.advanceDays = row ? row.advanceDays || 0 : type === 'maintenance' ? 15 : 3;
      templateForm.remark = row ? row.remark || '' : '';
      templateDialogVisible.value = true;
    };
    const canManageTemplate = row => {
      if (isHeadquartersAdmin.value) return true;
      if (!branchTemplateFeatureEnabled.value) return false;
      return row.scopeType === 'branch' && row.scopeBranchId === currentUser.branchId;
    };
    const saveTemplate = () => {
      if (!templateForm.name.trim()) {
        feedback.ElMessage.warning('請填寫母版名稱');
        return;
      }
      if (!isHeadquartersAdmin.value && !branchTemplateFeatureEnabled.value) {
        feedback.ElMessage.warning('當前未啓用分公司專用，分公司不可新增或修改母版');
        return;
      }
      const list = templateForm.type === 'maintenance' ? maintenanceTemplates.value : cleaningTemplates.value;
      const duplicate = list.find(item => {
        if (item.id === templateForm.id) return false;
        if (item.name !== templateForm.name) return false;
        if (templateForm.scopeType === 'enterprise') {
          return item.scopeType === 'enterprise';
        }
        return item.scopeType === 'branch' && item.scopeBranchId === templateForm.scopeBranchId;
      });
      if (duplicate) {
        feedback.ElMessage.warning(templateForm.scopeType === 'enterprise' ? '企業通用母版名稱不可重複' : '同一分公司下專用母版名稱不可重複');
        return;
      }
      if (templateForm.type === 'maintenance') {
        if (!templateForm.thresholdMileageKm || !templateForm.thresholdMonths || templateForm.advanceMileageKm === null || templateForm.advanceDays === null) {
          feedback.ElMessage.warning('請補齊保養閾值和提前提醒設置');
          return;
        }
        if (templateForm.advanceMileageKm >= templateForm.thresholdMileageKm) {
          feedback.ElMessage.warning('提前提醒公里數必須小於保養里程閾值');
          return;
        }
      } else {
        if (!templateForm.thresholdUseCount || !templateForm.thresholdDays || templateForm.advanceUseCount === null || templateForm.advanceDays === null) {
          feedback.ElMessage.warning('請補齊清潔閾值和提前提醒設置');
          return;
        }
        if (templateForm.advanceUseCount >= templateForm.thresholdUseCount) {
          feedback.ElMessage.warning('提前提醒次數必須小於清潔用車次數閾值');
          return;
        }
        if (templateForm.advanceDays >= templateForm.thresholdDays) {
          feedback.ElMessage.warning('提前提醒天數必須小於清潔間隔天數');
          return;
        }
      }
      if (templateForm.id) {
        const current = list.find(item => item.id === templateForm.id);
        if (current) {
          current.name = templateForm.name;
          current.scopeType = templateForm.scopeType;
          current.scopeBranchId = templateForm.scopeType === 'branch' ? templateForm.scopeBranchId : '';
          current.remark = templateForm.remark;
          if (templateForm.type === 'maintenance') {
            current.thresholdMileageKm = templateForm.thresholdMileageKm;
            current.advanceMileageKm = templateForm.advanceMileageKm;
            current.thresholdMonths = templateForm.thresholdMonths;
            current.advanceDays = templateForm.advanceDays;
          } else {
            current.thresholdUseCount = templateForm.thresholdUseCount;
            current.advanceUseCount = templateForm.advanceUseCount;
            current.thresholdDays = templateForm.thresholdDays;
            current.advanceDays = templateForm.advanceDays;
          }
        }
      } else {
        const nextId = `${templateForm.type === 'maintenance' ? 'MT' : 'CT'}-${String(Date.now()).slice(-4)}`;
        if (templateForm.type === 'maintenance') {
          maintenanceTemplates.value.unshift({
            id: nextId,
            name: templateForm.name,
            scopeType: templateForm.scopeType,
            scopeBranchId: templateForm.scopeType === 'branch' ? templateForm.scopeBranchId : '',
            thresholdMileageKm: templateForm.thresholdMileageKm,
            advanceMileageKm: templateForm.advanceMileageKm,
            thresholdMonths: templateForm.thresholdMonths,
            advanceDays: templateForm.advanceDays,
            status: 'enabled',
            remark: templateForm.remark
          });
        } else {
          cleaningTemplates.value.unshift({
            id: nextId,
            name: templateForm.name,
            scopeType: templateForm.scopeType,
            scopeBranchId: templateForm.scopeType === 'branch' ? templateForm.scopeBranchId : '',
            thresholdUseCount: templateForm.thresholdUseCount,
            advanceUseCount: templateForm.advanceUseCount,
            thresholdDays: templateForm.thresholdDays,
            advanceDays: templateForm.advanceDays,
            status: 'enabled',
            remark: templateForm.remark
          });
        }
      }
      templateDialogVisible.value = false;
      feedback.ElMessage.success('母版已保存');
    };
    const toggleTemplateStatus = (_type, row, enabled) => {
      row.status = enabled ? 'enabled' : 'disabled';
      feedback.ElMessage.success(`已${enabled ? '啓用' : '停用'}母版；已綁定車輛保留當前綁定，僅禁止新的套用`);
    };
    const removeTemplate = (type, row) => {
      if (!canManageTemplate(row)) {
        feedback.ElMessage.warning('當前賬號無權刪除該母版');
        return;
      }
      const appliedCount = getAppliedCount(type, row.id);
      if (appliedCount > 0) {
        feedback.ElMessage.warning(`該母版已有 ${appliedCount} 臺車輛套用，不能刪除；請先改綁或清空車輛母版`);
        return;
      }
      feedback.ElMessageBox.confirm(`確認刪除“${row.name}”嗎？刪除後不可恢復。`, '刪除母版', {
        confirmButtonText: '刪除',
        cancelButtonText: '取消',
        type: 'warning',
        confirmButtonClass: 'el-button--danger'
      }).then(() => {
        const list = type === 'maintenance' ? maintenanceTemplates.value : cleaningTemplates.value;
        const index = list.findIndex(item => item.id === row.id);
        if (index >= 0) {
          list.splice(index, 1);
        }
        feedback.ElMessage.success('母版已刪除');
      }).catch(() => {});
    };
    const saveVehicleBinding = row => {
      const maintenanceTemplate = row.maintenanceTemplateId ? getTemplateById('maintenance', row.maintenanceTemplateId) : null;
      const cleaningTemplate = row.cleaningTemplateId ? getTemplateById('cleaning', row.cleaningTemplateId) : null;
      if (maintenanceTemplate && !isTemplateSelectableForBranch('maintenance', maintenanceTemplate, row.branch)) {
        feedback.ElMessage.warning('當前車輛不可綁定其他分公司的保養母版');
        return;
      }
      if (cleaningTemplate && !isTemplateSelectableForBranch('cleaning', cleaningTemplate, row.branch)) {
        feedback.ElMessage.warning('當前車輛不可綁定其他分公司的清潔母版');
        return;
      }
      feedback.ElMessage.success(`已保存車輛 ${row.licensePlate} 的提醒配置`);
    };
    const openCompletionDialog = row => {
      activeReminder.value = row;
      completionForm.completedAt = '2026-05-25';
      completionForm.completedMileage = getVehicle(row.vehicleId)?.currentMileage || 0;
      completionForm.remark = '';
      completionDialogVisible.value = true;
    };
    const openCompletionRecordDialog = row => {
      activeReminder.value = row;
      completionRecordDialogVisible.value = true;
    };
    const submitCompletion = () => {
      if (!activeReminder.value) return;
      if (!completionForm.completedAt) {
        feedback.ElMessage.warning('請選擇完成日期');
        return;
      }
      const vehicle = getVehicle(activeReminder.value.vehicleId);
      if (!vehicle) return;
      if (activeReminder.value.type === 'maintenance') {
        vehicle.lastMaintenanceAt = completionForm.completedAt;
        vehicle.lastMaintenanceMileage = completionForm.completedMileage;
      } else {
        vehicle.lastCleaningAt = completionForm.completedAt;
        vehicle.completedUseCountSinceCleaning = 0;
      }
      activeReminder.value.status = 'completed';
      activeReminder.value.currentSummary = activeReminder.value.type === 'maintenance' ? `登記里程 ${completionForm.completedMileage.toLocaleString()} km` : '已登記清潔';
      activeReminder.value.currentBase = activeReminder.value.type === 'maintenance' ? `完成日期：${completionForm.completedAt}` : `完成日期：${completionForm.completedAt}`;
      activeReminder.value.currentValue = activeReminder.value.type === 'maintenance' ? `已登記保養完成，基線里程更新爲 ${completionForm.completedMileage.toLocaleString()} km` : '已登記清潔完成，清潔後累計用車次數已重置爲 0';
      activeReminder.value.triggerReason = completionForm.remark || '已由企業管理員登記完成';
      activeReminder.value.completionRecord = {
        completedAt: completionForm.completedAt,
        completedMileage: activeReminder.value.type === 'maintenance' ? completionForm.completedMileage : null,
        remark: completionForm.remark,
        operatorName: '王怡君',
        operatedAt: '2026-05-25 15:20',
        baselineText: activeReminder.value.type === 'maintenance' ? `上次保養更新爲 ${completionForm.completedMileage.toLocaleString()} km / ${completionForm.completedAt}` : `上次清潔更新爲 ${completionForm.completedAt}；清潔後累計用車次數重置爲 0`
      };
      completionDialogVisible.value = false;
      feedback.ElMessage.success('提醒已登記完成');
    };
    const ignoreReminder = row => {
      row.status = 'ignored';
      row.triggerReason = '已由企業管理員忽略本次提醒';
      feedback.ElMessage.success('已忽略本次提醒');
    };
    const goVehicleDetail = () => {
      window.location.href = 'official_vehicles.html';
    };
    return {
      branchOptions,
      maintenanceTemplates,
      cleaningTemplates,
      vehicles,
      reminders,
      filters,
      reminderPagination,
      vehicleBindingPagination,
      vehicleBindingFilters,
      vehicleBindingTableRef,
      selectedBindingVehicles,
      selectedBindingVehicleCount,
      batchBindingDialogVisible,
      batchBindingForm,
      batchMaintenanceTemplateOptions,
      batchCleaningTemplateOptions,
      stats,
      filteredReminders,
      pagedReminders,
      filteredBindingVehicles,
      pagedVehicles,
      settingsDialogVisible,
      settingsTab,
      branchTemplateFeatureEnabled,
      notificationDialogVisible,
      notificationActiveTab,
      notificationSettings,
      notificationLogFilters,
      notificationSendLogs,
      filteredNotificationSendLogs,
      notificationVehicleConditionTypes,
      notificationVehicleSourceOptions,
      notificationStationOptions,
      notificationContractOptions,
      activeSummaryCard,
      templateDialogVisible,
      templateForm,
      templateDialogTitle,
      isHeadquartersAdmin,
      canCreateTemplates,
      completionDialogVisible,
      completionRecordDialogVisible,
      prototypeLogDialogVisible,
      activeReminder,
      activeReminderVehicle,
      completionForm,
      completionDialogTitle,
      templateFilterOptions,
      getVehicle,
      getVehicleLabel,
      getNotificationTypeText,
      getNotificationBatchStatusText,
      getNotificationBatchStatusTag,
      getReminderStatusText,
      getBranchName,
      getVehicleSourceText,
      hasNotificationVehicleCondition,
      getNotificationConditionValueOptions,
      getNotificationConditionValuePlaceholder,
      getNotificationMatchedVehicles,
      getTemplateById,
      getTemplateDisplayName,
      getTemplateScopeText,
      getAvailableTemplates,
      isTemplateSelectableForBranch,
      getAppliedCount,
      isMaintenanceConfigIncomplete,
      isCleaningConfigIncomplete,
      isVehicleConfigIncomplete,
      applySummaryFilter,
      addNotificationSetting,
      handleNotificationVehicleScopeChange,
      handleNotificationConditionTypeChange,
      removeNotificationSetting,
      saveNotificationSettings,
      openTemplateDialog,
      canManageTemplate,
      saveTemplate,
      toggleTemplateStatus,
      removeTemplate,
      saveVehicleBinding,
      saveBatchVehicleBinding,
      canSelectVehicleForBatch,
      handleVehicleBindingSelectionChange,
      openBatchBindingDialog,
      openSettingsDialog,
      resetVehicleBindingFilters,
      openCompletionDialog,
      openCompletionRecordDialog,
      submitCompletion,
      ignoreReminder,
      goVehicleDetail,
      ElMessage: feedback.ElMessage,
      ElMessageBox: feedback.ElMessageBox,
      currentUser,
      vehicleBindingQuickFilter,
      getNotificationBatchStats,
      getTemplateList,
      isBranchTemplateFeatureEnabled,
      hasMileageBasis,
      clearReminderFilters,
      getBatchTemplateOptions
    };
  }
  return pageSetup();
}
export default function EnterpriseOfficialVehicleRemindersBlock() {
  const model = useRimoModel(createPageState);
  const view = model.view;
  const {
    text
  } = useRimoEnvironment();
  return <RimoRoot model={model} pageKey="enterprise-official-vehicle-reminders" assets={{}}><div data-business-content="" data-rimo-layout="page"><div className="flex justify-between items-end mb-6" data-rimo-layout="heading"><div><h1 className="text-2xl font-bold text-gray-800 tracking-tight">{text("清潔保養提醒")}</h1>
<p className="text-gray-500 text-sm mt-1">{text("按企業通用或分公司專用母版持續判斷提醒，不自動生成工單、不自動改變車輛狀態。")}</p></div>
<div className="flex gap-3">{view.isHeadquartersAdmin ? <><RimoElement kind="el-button" plain={true} onClick={_event => {
              model.write(["notificationDialogVisible"], true);
            }}><RimoElement kind="el-icon" className="mr-1"><RimoIcon name="Message" /></RimoElement>
{text(" 通知設定\n                        ")}</RimoElement></> : null}
<RimoElement kind="el-button" type="primary" onClick={_event => {
            view.openSettingsDialog();
          }}><RimoElement kind="el-icon" className="mr-1"><RimoIcon name="Setting" /></RimoElement>
{text(" 設定\n                        ")}</RimoElement></div></div>
<div className="grid grid-cols-4 gap-4 mb-6" data-rimo-layout="summary"><div className={rimoClass(["bg-white rounded-xl shadow-sm border p-5 flex flex-col cursor-pointer hover:border-[color:var(--app-color-primary)] transition-colors", rimoClass(view.activeSummaryCard === 'pendingMaintenance' ? 'border-[color:var(--app-color-primary)] ring-1 ring-[color:var(--app-color-primary)]' : 'border-gray-100')])} onClick={_event => {
          view.applySummaryFilter('pendingMaintenance');
        }} data-rimo-layout="stat"><span className="text-sm text-gray-500 font-medium mb-1">{text("待保養車輛")}</span>
<span className="card-value text-amber-500">{rimoText(view.stats.pendingMaintenanceVehicles)}</span></div>
<div className={rimoClass(["bg-white rounded-xl shadow-sm border p-5 flex flex-col cursor-pointer hover:border-[color:var(--app-color-primary)] transition-colors", rimoClass(view.activeSummaryCard === 'pendingCleaning' ? 'border-[color:var(--app-color-primary)] ring-1 ring-[color:var(--app-color-primary)]' : 'border-gray-100')])} onClick={_event => {
          view.applySummaryFilter('pendingCleaning');
        }} data-rimo-layout="stat"><span className="text-sm text-gray-500 font-medium mb-1">{text("待清潔車輛")}</span>
<span className="card-value text-cyan-600">{rimoText(view.stats.pendingCleaningVehicles)}</span></div>
<div className={rimoClass(["bg-white rounded-xl shadow-sm border p-5 flex flex-col cursor-pointer hover:border-[color:var(--app-color-primary)] transition-colors", rimoClass(view.activeSummaryCard === 'newToday' ? 'border-[color:var(--app-color-primary)] ring-1 ring-[color:var(--app-color-primary)]' : 'border-gray-100')])} onClick={_event => {
          view.applySummaryFilter('newToday');
        }} data-rimo-layout="stat"><span className="text-sm text-gray-500 font-medium mb-1">{text("今日新增待處理")}</span>
<span className="card-value text-gray-800">{rimoText(view.stats.newToday)}</span></div>
<div className={rimoClass(["bg-white rounded-xl shadow-sm border p-5 flex flex-col cursor-pointer hover:border-[color:var(--app-color-primary)] transition-colors", rimoClass(view.activeSummaryCard === 'incompleteVehicles' ? 'border-[color:var(--app-color-primary)] ring-1 ring-[color:var(--app-color-primary)]' : 'border-gray-100')])} onClick={_event => {
          view.applySummaryFilter('incompleteVehicles');
        }} data-rimo-layout="stat"><span className="text-sm text-gray-500 font-medium mb-1">{text("未配置母版 / 資料待補")}</span>
<span className="card-value text-rose-500">{rimoText(view.stats.incompleteVehicles)}</span></div></div>
<div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col" data-rimo-layout="list"><RimoElement kind="el-table" data={view.pagedReminders} style={rimoStyle("width: 100%")} slots={{
          "toolbar": _slot => <><RimoElement kind="el-input" modelValue={view.filters.query} onModelChange={value => {
              model.write(["filters", "query"], value);
            }} placeholder="搜索車牌號 / 車型" prefixIcon="Search" clearable={true} style={rimoStyle("width: 220px")}></RimoElement>
<RimoElement kind="el-select" modelValue={view.filters.type} onModelChange={value => {
              model.write(["filters", "type"], value);
            }} placeholder="提醒類型" clearable={true} style={rimoStyle("width: 140px")}><RimoElement kind="el-option" label="保養提醒" value="maintenance"></RimoElement>
<RimoElement kind="el-option" label="清潔提醒" value="cleaning"></RimoElement></RimoElement>
<RimoElement kind="el-select" modelValue={view.filters.status} onModelChange={value => {
              model.write(["filters", "status"], value);
            }} placeholder="提醒狀態" clearable={true} style={rimoStyle("width: 140px")}><RimoElement kind="el-option" label="待處理" value="pending"></RimoElement>
<RimoElement kind="el-option" label="已完成" value="completed"></RimoElement>
<RimoElement kind="el-option" label="已忽略" value="ignored"></RimoElement>
<RimoElement kind="el-option" label="已失效" value="invalidated"></RimoElement></RimoElement>
<RimoElement kind="el-select" modelValue={view.filters.branch} onModelChange={value => {
              model.write(["filters", "branch"], value);
            }} placeholder="分公司" clearable={true} style={rimoStyle("width: 180px")}>{rimoEntries(view.branchOptions).map(([item], _itemIndex) => <Fragment key={item.id}><RimoElement kind="el-option" key={item.id} label={item.name} value={item.id}></RimoElement></Fragment>)}</RimoElement>
<RimoElement kind="el-select" modelValue={view.filters.scope} onModelChange={value => {
              model.write(["filters", "scope"], value);
            }} placeholder="母版範圍" clearable={true} style={rimoStyle("width: 150px")}><RimoElement kind="el-option" label="企業通用" value="enterprise"></RimoElement>
<RimoElement kind="el-option" label="分公司專用" value="branch"></RimoElement></RimoElement>
<RimoElement kind="el-select" modelValue={view.filters.templateKey} onModelChange={value => {
              model.write(["filters", "templateKey"], value);
            }} placeholder="套用母版" clearable={true} style={rimoStyle("width: 240px")}>{rimoEntries(view.templateFilterOptions).map(([item], _itemIndex) => <Fragment key={item.value}><RimoElement kind="el-option" key={item.value} label={item.label} value={item.value}></RimoElement></Fragment>)}</RimoElement></>
        }}><RimoElement kind="el-table-column" label="車輛" minWidth="210" slots={{
            "default": ({
              row
            }) => <><div className="font-bold text-gray-800">{rimoText(view.getVehicle(row.vehicleId)?.licensePlate)}</div>
<div className="text-xs text-gray-500 mt-1">{rimoText(view.getVehicle(row.vehicleId)?.model)}</div></>
          }}></RimoElement>
<RimoElement kind="el-table-column" label="分公司 / 據點" minWidth="180" slots={{
            "default": ({
              row
            }) => <><div className="text-sm text-gray-700">{rimoText(view.getBranchName(view.getVehicle(row.vehicleId)?.branch))}</div>
<div className="text-xs text-gray-500 mt-1">{rimoText(view.getVehicle(row.vehicleId)?.stationName || '未分配據點')}</div></>
          }}></RimoElement>
<RimoElement kind="el-table-column" label="提醒類型" width="120" align="center" slots={{
            "default": ({
              row
            }) => <><RimoElement kind="el-tag" type={row.type === 'maintenance' ? 'warning' : 'success'} effect="plain">{text("\n                                    ")}{rimoText(row.type === 'maintenance' ? '保養提醒' : '清潔提醒')}{text("\n                                ")}</RimoElement></>
          }}></RimoElement>
<RimoElement kind="el-table-column" label="當前套用母版" minWidth="200" slots={{
            "default": ({
              row
            }) => <><div className="text-sm font-medium text-gray-700">{rimoText(view.getTemplateDisplayName(row.type, row.templateId))}</div>
<div className="text-xs text-gray-500 mt-1">{rimoText(row.threshold)}</div></>
          }}></RimoElement>
<RimoElement kind="el-table-column" label="當前值" minWidth="220" slots={{
            "default": ({
              row
            }) => <><div className="text-sm text-gray-700">{rimoText(row.currentSummary)}</div>
<div className="text-xs text-gray-500 mt-1">{rimoText(row.currentBase)}</div></>
          }}></RimoElement>
<RimoElement kind="el-table-column" label="觸發時間" width="160" slots={{
            "default": ({
              row
            }) => <><div className="text-sm text-gray-700">{rimoText(row.triggeredAt)}</div></>
          }}></RimoElement>
<RimoElement kind="el-table-column" label="狀態" width="120" align="center" slots={{
            "default": ({
              row
            }) => <>{row.status === 'pending' && row.dueLevel === 'overdue' ? <><RimoElement kind="el-tag" type="danger">{text("已到期")}</RimoElement></> : row.status === 'pending' ? <><RimoElement kind="el-tag" type="warning">{text("即將到期")}</RimoElement></> : row.status === 'completed' ? <><RimoElement kind="el-tag" type="success">{text("已完成")}</RimoElement></> : row.status === 'ignored' ? <><RimoElement kind="el-tag" type="info">{text("已忽略")}</RimoElement></> : <><RimoElement kind="el-tag" type="info" effect="plain">{text("已失效")}</RimoElement></>}</>
          }}></RimoElement>
<RimoElement kind="el-table-column" label="操作" width="250" align="right" fixed="right" slots={{
            "default": ({
              row
            }) => <><div className="flex justify-end gap-2">{row.status === 'pending' ? <><><RimoElement kind="el-button" type="primary" link={true} size="small" onClick={_event => {
                      view.openCompletionDialog(row);
                    }}>{text("\n                                            ")}{rimoText(row.type === 'maintenance' ? '登記已保養' : '登記已清潔')}{text("\n                                        ")}</RimoElement>
{row.status === 'pending' ? <><RimoElement kind="el-button" type="warning" link={true} size="small" onClick={_event => {
                        view.ignoreReminder(row);
                      }}>{text("忽略本次")}</RimoElement></> : null}</></> : null}
{row.status === 'completed' ? <><RimoElement kind="el-button" type="primary" link={true} size="small" onClick={_event => {
                    view.openCompletionRecordDialog(row);
                  }}>{text("查看登記內容")}</RimoElement></> : null}
<RimoElement kind="el-button" type="primary" link={true} size="small" onClick={_event => {
                  view.goVehicleDetail(row.vehicleId);
                }}>{text("查看車輛")}</RimoElement></div></>
          }}></RimoElement></RimoElement>
<div className="flex justify-between items-center p-4 border-t border-gray-100"><div className="flex items-center gap-2 text-sm text-gray-500"><span>{text("共 ")}{rimoText(view.filteredReminders.length)}{text(" 條提醒，每頁")}</span>
<RimoElement kind="el-select" modelValue={view.reminderPagination.pageSize} onModelChange={value => {
              model.write(["reminderPagination", "pageSize"], value);
            }} style={rimoStyle("width: 90px")} onChange={_event => {
              model.write(["reminderPagination", "currentPage"], 1);
            }}><RimoElement kind="el-option" label="10 條" value={10}></RimoElement>
<RimoElement kind="el-option" label="20 條" value={20}></RimoElement>
<RimoElement kind="el-option" label="50 條" value={50}></RimoElement></RimoElement></div>
<RimoElement kind="el-pagination" currentPage={view.reminderPagination.currentPage} onCurrentPageChange={value => {
            model.write(["reminderPagination", "currentPage"], value);
          }} pageSize={view.reminderPagination.pageSize} layout="prev, pager, next" total={view.filteredReminders.length}></RimoElement></div></div></div><RimoElement kind="el-dialog" modelValue={view.notificationDialogVisible} onModelChange={value => {
      model.write(["notificationDialogVisible"], value);
    }} title="通知設定" width="90%" className="reminder-notification-dialog official-vehicle-reminders-overlay" destroyOnClose={true} slots={{
      "footer": _slot => <><RimoElement kind="el-button" onClick={_event => {
          model.write(["notificationDialogVisible"], false);
        }}>{text("取消")}</RimoElement>
{view.notificationActiveTab === 'settings' ? <><RimoElement kind="el-button" type="primary" onClick={event => {
            view.saveNotificationSettings?.(event);
          }}>{text("保存")}</RimoElement></> : null}</>
    }}>{() => <><RimoElement kind="el-tabs" modelValue={view.notificationActiveTab} onModelChange={value => {
          model.write(["notificationActiveTab"], value);
        }}><RimoElement kind="el-tab-pane" label="通知人設定" name="settings"><div className="flex justify-between items-center mb-4"><div className="text-sm text-gray-500">{text("通知人可手動填寫，不要求是系統賬號；外部 Email 只做提醒觸達，不授予系統權限。")}</div>
<RimoElement kind="el-button" type="primary" onClick={event => {
                view.addNotificationSetting?.(event);
              }}><RimoElement kind="el-icon" className="mr-1"><RimoIcon name="Plus" /></RimoElement>
{text(" 新增通知人\n                        ")}</RimoElement></div>
<RimoElement kind="el-table" data={view.notificationSettings} style={rimoStyle("width: 100%")}><RimoElement kind="el-table-column" label="通知人" minWidth="150" slots={{
                "default": ({
                  row
                }) => <><RimoElement kind="el-input" modelValue={row.receiverName} onModelChange={value => {
                    model.assign(row, "receiverName", value);
                  }} placeholder="姓名"></RimoElement></>
              }}></RimoElement>
<RimoElement kind="el-table-column" label="Email" minWidth="240" slots={{
                "default": ({
                  row
                }) => <><RimoElement kind="el-input" modelValue={row.receiverEmail} onModelChange={value => {
                    model.assign(row, "receiverEmail", value);
                  }} placeholder="name@example.com"></RimoElement></>
              }}></RimoElement>
<RimoElement kind="el-table-column" label="通知範圍" minWidth="220" slots={{
                "default": ({
                  row
                }) => <><RimoElement kind="el-checkbox-group" modelValue={row.noticeScopes} onModelChange={value => {
                    model.assign(row, "noticeScopes", value);
                  }}><RimoElement kind="el-checkbox" label="maintenance">{text("保養提醒")}</RimoElement>
<RimoElement kind="el-checkbox" label="cleaning">{text("清潔提醒")}</RimoElement></RimoElement></>
              }}></RimoElement>
<RimoElement kind="el-table-column" label="車輛範圍" minWidth="340" slots={{
                "default": ({
                  row
                }) => <><div className="flex flex-col gap-2"><RimoElement kind="el-radio-group" modelValue={row.vehicleScope} onModelChange={value => {
                      model.assign(row, "vehicleScope", value);
                    }} onChange={_event => {
                      view.handleNotificationVehicleScopeChange(row);
                    }}><RimoElement kind="el-radio-button" label="all">{text("全部車輛")}</RimoElement>
<RimoElement kind="el-radio-button" label="condition">{text("按條件匹配")}</RimoElement></RimoElement>
{row.vehicleScope === 'condition' ? <><><div className="flex gap-2"><RimoElement kind="el-select" modelValue={row.vehicleConditionType} onModelChange={value => {
                            model.assign(row, "vehicleConditionType", value);
                          }} placeholder="匹配條件" style={rimoStyle("width: 120px")} onChange={_event => {
                            view.handleNotificationConditionTypeChange(row);
                          }}>{rimoEntries(view.notificationVehicleConditionTypes).map(([item], _itemIndex) => <Fragment key={item.value}><RimoElement kind="el-option" key={item.value} label={item.label} value={item.value}></RimoElement></Fragment>)}</RimoElement>
<RimoElement kind="el-select" modelValue={row.vehicleConditionValues} onModelChange={value => {
                            model.assign(row, "vehicleConditionValues", value);
                          }} multiple={true} filterable={true} collapseTags={true} collapseTagsTooltip={true} disabled={!row.vehicleConditionType} placeholder={view.getNotificationConditionValuePlaceholder(row)} style={rimoStyle("flex: 1; min-width: 0")}>{rimoEntries(view.getNotificationConditionValueOptions(row)).map(([item], _itemIndex) => <Fragment key={item.value}><RimoElement kind="el-option" key={item.value} label={item.label} value={item.value}></RimoElement></Fragment>)}</RimoElement></div>
<div className="text-xs text-gray-500">{text("\n                                            當前條件匹配 ")}{rimoText(view.getNotificationMatchedVehicles(row).length)}{text(" 臺車輛；後續新增車輛符合條件時自動納入通知範圍。\n                                        ")}</div></></> : null}</div></>
              }}></RimoElement>
<RimoElement kind="el-table-column" label="狀態" width="120" align="center" slots={{
                "default": ({
                  row
                }) => <><RimoElement kind="el-switch" modelValue={row.status === 'enabled'} inlinePrompt={true} activeText="啓用" inactiveText="停用" onChange={event => {
                    (value => model.assign(row, "status", value ? 'enabled' : 'disabled'))?.(event);
                  }}></RimoElement></>
              }}></RimoElement>
<RimoElement kind="el-table-column" label="操作" width="90" align="right" fixed="right" slots={{
                "default": ({
                  row
                }) => <><RimoElement kind="el-button" type="danger" link={true} size="small" onClick={_event => {
                    view.removeNotificationSetting(row);
                  }}>{text("刪除")}</RimoElement></>
              }}></RimoElement></RimoElement></RimoElement>
<RimoElement kind="el-tab-pane" label="發送記錄" name="logs"><div className="flex flex-wrap gap-3 mb-4"><RimoElement kind="el-select" modelValue={view.notificationLogFilters.type} onModelChange={value => {
                model.write(["notificationLogFilters", "type"], value);
              }} placeholder="通知類型" clearable={true} style={rimoStyle("width: 150px")}><RimoElement kind="el-option" label="保養提醒" value="maintenance"></RimoElement>
<RimoElement kind="el-option" label="清潔提醒" value="cleaning"></RimoElement></RimoElement>
<RimoElement kind="el-select" modelValue={view.notificationLogFilters.status} onModelChange={value => {
                model.write(["notificationLogFilters", "status"], value);
              }} placeholder="發送狀態" clearable={true} style={rimoStyle("width: 150px")}><RimoElement kind="el-option" label="成功" value="success"></RimoElement>
<RimoElement kind="el-option" label="部分失敗" value="partial_failed"></RimoElement>
<RimoElement kind="el-option" label="失敗" value="failed"></RimoElement></RimoElement>
<RimoElement kind="el-input" modelValue={view.notificationLogFilters.keyword} onModelChange={value => {
                model.write(["notificationLogFilters", "keyword"], value);
              }} placeholder="搜索車牌號 / 接收人 / Email" clearable={true} style={rimoStyle("width: 280px")}></RimoElement>
<RimoElement kind="el-date-picker" modelValue={view.notificationLogFilters.dateRange} onModelChange={value => {
                model.write(["notificationLogFilters", "dateRange"], value);
              }} type="daterange" startPlaceholder="開始日期" endPlaceholder="結束日期" valueFormat="YYYY-MM-DD" style={rimoStyle("width: 260px")}></RimoElement></div>
<RimoElement kind="el-table" data={view.filteredNotificationSendLogs} style={rimoStyle("width: 100%")} height="420"><RimoElement kind="el-table-column" type="expand" width="48" slots={{
                "default": ({
                  row
                }) => <><div className="px-8 py-3 bg-gray-50"><div className="text-sm font-medium text-gray-700 mb-3">{text("發送明細")}</div>
<RimoElement kind="el-table" data={row.recipients} size="small" style={rimoStyle("width: 100%")}><RimoElement kind="el-table-column" prop="receiverName" label="接收人" minWidth="160"></RimoElement>
<RimoElement kind="el-table-column" prop="receiverEmail" label="Email" minWidth="240"></RimoElement>
<RimoElement kind="el-table-column" label="發送狀態" width="120" align="center" slots={{
                        "default": ({
                          row: detail
                        }) => <><RimoElement kind="el-tag" type={detail.status === 'success' ? 'success' : 'danger'} effect="plain">{rimoText(detail.status === 'success' ? '成功' : '失敗')}</RimoElement></>
                      }}></RimoElement>
<RimoElement kind="el-table-column" label="失敗原因" minWidth="220" showOverflowTooltip={true} slots={{
                        "default": ({
                          row: detail
                        }) => <>{rimoText(detail.failureReason || '-')}</>
                      }}></RimoElement></RimoElement></div></>
              }}></RimoElement>
<RimoElement kind="el-table-column" prop="sentAt" label="發送時間" width="170"></RimoElement>
<RimoElement kind="el-table-column" label="通知內容" minWidth="220" slots={{
                "default": ({
                  row
                }) => <><div className="font-medium text-gray-800">{rimoText(view.getNotificationTypeText(row.type))}{text("｜")}{rimoText(row.stage === 'advance' ? '即將到期' : '已到期')}</div>
<div className="text-xs text-gray-500">{rimoText(view.getVehicleLabel(row.vehicleId))}</div></>
              }}></RimoElement>
<RimoElement kind="el-table-column" prop="recipientCount" label="收件人數" width="100" align="center"></RimoElement>
<RimoElement kind="el-table-column" prop="successCount" label="成功" width="90" align="center"></RimoElement>
<RimoElement kind="el-table-column" prop="failedCount" label="失敗" width="90" align="center"></RimoElement>
<RimoElement kind="el-table-column" label="發送狀態" width="120" align="center" slots={{
                "default": ({
                  row
                }) => <><RimoElement kind="el-tag" type={view.getNotificationBatchStatusTag(row.status)} effect="plain">{rimoText(view.getNotificationBatchStatusText(row.status))}</RimoElement></>
              }}></RimoElement>
<RimoElement kind="el-table-column" label="關聯提醒狀態" width="130" align="center" slots={{
                "default": ({
                  row
                }) => <><RimoElement kind="el-tag" type="info" effect="plain">{rimoText(view.getReminderStatusText(row.reminderStatus))}</RimoElement></>
              }}></RimoElement></RimoElement></RimoElement></RimoElement></>}</RimoElement>
<RimoElement kind="el-dialog" modelValue={view.settingsDialogVisible} onModelChange={value => {
      model.write(["settingsDialogVisible"], value);
    }} width="1560px" top="3vh" className="reminder-settings-dialog official-vehicle-reminders-overlay" destroyOnClose={true} slots={{
      "header": _slot => <><div className="flex items-center justify-between pr-8"><div className="text-base font-semibold text-gray-800">{text("清潔保養提醒設定")}</div>
{view.isHeadquartersAdmin ? <><div className="flex items-center gap-2 text-sm text-gray-500"><span>{text("是否啓用分公司專用")}</span>
<RimoElement kind="el-switch" modelValue={view.branchTemplateFeatureEnabled} onModelChange={value => {
                model.write(["branchTemplateFeatureEnabled"], value);
              }}></RimoElement></div></> : null}</div></>
    }}>{() => <><RimoElement kind="el-tabs" modelValue={view.settingsTab} onModelChange={value => {
          model.write(["settingsTab"], value);
        }}><RimoElement kind="el-tab-pane" label="保養母版" name="maintenance"><div className="flex justify-between items-center mb-4"><div className="text-sm text-gray-500">{text("支持企業通用母版和分公司專用母版；分公司專用母版只適用於對應分公司車輛。")}</div>
{view.canCreateTemplates ? <><RimoElement kind="el-button" type="primary" onClick={_event => {
                  view.openTemplateDialog('maintenance');
                }}><RimoElement kind="el-icon" className="mr-1"><RimoIcon name="Plus" /></RimoElement>
{text(" 新增保養母版\n                                ")}</RimoElement></> : null}</div>
<RimoElement kind="el-table" data={view.maintenanceTemplates} style={rimoStyle("width: 100%")}><RimoElement kind="el-table-column" prop="name" label="母版名稱" minWidth="220"></RimoElement>
<RimoElement kind="el-table-column" label="適用範圍" minWidth="180" slots={{
                "default": ({
                  row
                }) => <><div className="text-sm text-gray-700">{rimoText(view.getTemplateScopeText(row))}</div></>
              }}></RimoElement>
<RimoElement kind="el-table-column" label="保養規則" minWidth="260" slots={{
                "default": ({
                  row
                }) => <><div className="text-sm text-gray-700">{text("到期：")}{rimoText(row.thresholdMileageKm.toLocaleString())}{text(" km / ")}{rimoText(row.thresholdMonths)}{text(" 個月")}</div>
<div className="text-xs text-gray-500 mt-1">{text("提前：")}{rimoText(row.advanceMileageKm.toLocaleString())}{text(" km / ")}{rimoText(row.advanceDays)}{text(" 天提醒")}</div></>
              }}></RimoElement>
<RimoElement kind="el-table-column" label="已套用車輛數" width="140" align="center" slots={{
                "default": ({
                  row
                }) => <>{rimoText(view.getAppliedCount('maintenance', row.id))}</>
              }}></RimoElement>
<RimoElement kind="el-table-column" label="狀態" width="120" align="center" slots={{
                "default": ({
                  row
                }) => <><RimoElement kind="el-switch" modelValue={row.status === 'enabled'} disabled={!view.canManageTemplate(row)} inlinePrompt={true} activeText="啓用" inactiveText="停用" onChange={event => {
                    (value => view.toggleTemplateStatus('maintenance', row, value))?.(event);
                  }}></RimoElement></>
              }}></RimoElement>
<RimoElement kind="el-table-column" label="操作" width="150" align="right" fixed="right" slots={{
                "default": ({
                  row
                }) => <>{view.canManageTemplate(row) ? <><><RimoElement kind="el-button" type="primary" link={true} size="small" onClick={_event => {
                        view.openTemplateDialog('maintenance', row);
                      }}>{text("編輯")}</RimoElement>
<RimoElement kind="el-button" type="danger" link={true} size="small" onClick={_event => {
                        view.removeTemplate('maintenance', row);
                      }}>{text("刪除")}</RimoElement></></> : null}</>
              }}></RimoElement></RimoElement></RimoElement>
<RimoElement kind="el-tab-pane" label="清潔母版" name="cleaning"><div className="flex justify-between items-center mb-4"><div className="text-sm text-gray-500">{text("支持企業通用母版和分公司專用母版；分公司專用母版只適用於對應分公司車輛。")}</div>
{view.canCreateTemplates ? <><RimoElement kind="el-button" type="primary" onClick={_event => {
                  view.openTemplateDialog('cleaning');
                }}><RimoElement kind="el-icon" className="mr-1"><RimoIcon name="Plus" /></RimoElement>
{text(" 新增清潔母版\n                                ")}</RimoElement></> : null}</div>
<RimoElement kind="el-table" data={view.cleaningTemplates} style={rimoStyle("width: 100%")}><RimoElement kind="el-table-column" prop="name" label="母版名稱" minWidth="220"></RimoElement>
<RimoElement kind="el-table-column" label="適用範圍" minWidth="180" slots={{
                "default": ({
                  row
                }) => <><div className="text-sm text-gray-700">{rimoText(view.getTemplateScopeText(row))}</div></>
              }}></RimoElement>
<RimoElement kind="el-table-column" label="清潔規則" minWidth="260" slots={{
                "default": ({
                  row
                }) => <><div className="text-sm text-gray-700">{text("到期：")}{rimoText(row.thresholdUseCount)}{text(" 次 / ")}{rimoText(row.thresholdDays)}{text(" 天")}</div>
<div className="text-xs text-gray-500 mt-1">{text("提前：")}{rimoText(row.advanceUseCount)}{text(" 次 / ")}{rimoText(row.advanceDays)}{text(" 天提醒")}</div></>
              }}></RimoElement>
<RimoElement kind="el-table-column" label="已套用車輛數" width="140" align="center" slots={{
                "default": ({
                  row
                }) => <>{rimoText(view.getAppliedCount('cleaning', row.id))}</>
              }}></RimoElement>
<RimoElement kind="el-table-column" label="狀態" width="120" align="center" slots={{
                "default": ({
                  row
                }) => <><RimoElement kind="el-switch" modelValue={row.status === 'enabled'} disabled={!view.canManageTemplate(row)} inlinePrompt={true} activeText="啓用" inactiveText="停用" onChange={event => {
                    (value => view.toggleTemplateStatus('cleaning', row, value))?.(event);
                  }}></RimoElement></>
              }}></RimoElement>
<RimoElement kind="el-table-column" label="操作" width="150" align="right" fixed="right" slots={{
                "default": ({
                  row
                }) => <>{view.canManageTemplate(row) ? <><><RimoElement kind="el-button" type="primary" link={true} size="small" onClick={_event => {
                        view.openTemplateDialog('cleaning', row);
                      }}>{text("編輯")}</RimoElement>
<RimoElement kind="el-button" type="danger" link={true} size="small" onClick={_event => {
                        view.removeTemplate('cleaning', row);
                      }}>{text("刪除")}</RimoElement></></> : null}</>
              }}></RimoElement></RimoElement></RimoElement>
<RimoElement kind="el-tab-pane" label="車輛套用" name="binding"><div className="bg-amber-50 border border-amber-100 rounded-lg px-4 py-3 text-sm text-amber-800 mb-4">{text("\n                                保養和清潔分開判斷。只補齊保養母版和保養基線時，系統可正常計算保養提醒；清潔資料未補齊隻影響清潔提醒，不影響保養提醒。\n                            ")}</div>
<div className="flex flex-wrap items-center gap-3 mb-3"><RimoElement kind="el-input" modelValue={view.vehicleBindingFilters.keyword} onModelChange={value => {
                model.write(["vehicleBindingFilters", "keyword"], value);
              }} clearable={true} placeholder="搜索車牌 / 車型 / 據點" style={rimoStyle("width: 260px")} onInput={_event => {
                model.write(["vehicleBindingPagination", "currentPage"], 1);
              }} slots={{
                "prefix": _slot => <><RimoElement kind="el-icon"><RimoIcon name="Search" /></RimoElement></>
              }}></RimoElement>
<RimoElement kind="el-select" modelValue={view.vehicleBindingFilters.branch} onModelChange={value => {
                model.write(["vehicleBindingFilters", "branch"], value);
              }} clearable={true} placeholder="分公司" style={rimoStyle("width: 180px")} onChange={_event => {
                model.write(["vehicleBindingPagination", "currentPage"], 1);
              }}>{rimoEntries(view.branchOptions).map(([item], _itemIndex) => <Fragment key={item.id}><RimoElement kind="el-option" key={item.id} label={item.name} value={item.id}></RimoElement></Fragment>)}</RimoElement>
<RimoElement kind="el-select" modelValue={view.vehicleBindingFilters.status} onModelChange={value => {
                model.write(["vehicleBindingFilters", "status"], value);
              }} clearable={true} placeholder="資料狀態" style={rimoStyle("width: 190px")} onChange={_event => {
                model.write(["vehicleBindingPagination", "currentPage"], 1);
              }}><RimoElement kind="el-option" label="資料待補" value="incomplete"></RimoElement>
<RimoElement kind="el-option" label="保養待補" value="maintenanceIncomplete"></RimoElement>
<RimoElement kind="el-option" label="清潔待補" value="cleaningIncomplete"></RimoElement>
<RimoElement kind="el-option" label="已可計算" value="complete"></RimoElement></RimoElement>
<RimoElement kind="el-button" plain={true} onClick={event => {
                view.resetVehicleBindingFilters?.(event);
              }}>{text("重置")}</RimoElement>
<div className="flex-1"></div>
<span className="text-sm text-gray-500">{text("已選 ")}{rimoText(view.selectedBindingVehicleCount)}{text(" 臺")}</span>
<RimoElement kind="el-button" type="primary" disabled={view.selectedBindingVehicleCount === 0} onClick={event => {
                view.openBatchBindingDialog?.(event);
              }}><RimoElement kind="el-icon" className="mr-1"><RimoIcon name="Connection" /></RimoElement>
{text(" 批量套用母版\n                                ")}</RimoElement></div>
<RimoElement kind="el-table" modelRef={model.ref("vehicleBindingTableRef")} data={view.pagedVehicles} rowKey="id" height="520" style={rimoStyle("width: 100%")} onSelectionChange={event => {
              view.handleVehicleBindingSelectionChange?.(event);
            }}><RimoElement kind="el-table-column" type="selection" width="48" selectable={view.canSelectVehicleForBatch} reserveSelection={true}></RimoElement>
<RimoElement kind="el-table-column" label="車輛" minWidth="180" slots={{
                "default": ({
                  row
                }) => <><div className="font-bold text-gray-800">{rimoText(row.licensePlate)}</div>
<div className="text-xs text-gray-500 mt-1">{rimoText(row.model)}</div></>
              }}></RimoElement>
<RimoElement kind="el-table-column" label="分公司" width="140" slots={{
                "default": ({
                  row
                }) => <>{rimoText(view.getBranchName(row.branch))}</>
              }}></RimoElement>
<RimoElement kind="el-table-column" label="當前里程" width="140" slots={{
                "default": ({
                  row
                }) => <><RimoElement kind="el-input-number" modelValue={row.currentMileage} onModelChange={value => {
                    model.assign(row, "currentMileage", value);
                  }} min={0} step={100} controlsPosition="right" style={rimoStyle("width: 120px")}></RimoElement></>
              }}></RimoElement>
<RimoElement kind="el-table-column" label="保養母版" minWidth="200" slots={{
                "default": ({
                  row
                }) => <><RimoElement kind="el-select" modelValue={view.getTemplateById('maintenance', row.maintenanceTemplateId)} valueKey="id" placeholder="選擇保養母版" clearable={true} style={rimoStyle("width: 180px")} onChange={event => {
                    (value => model.assign(row, "maintenanceTemplateId", value ? value.id : ''))?.(event);
                  }} onClear={_event => {
                    model.assign(row, "maintenanceTemplateId", '');
                  }}>{rimoEntries(view.getAvailableTemplates('maintenance', row.branch, row.maintenanceTemplateId)).map(([item], _itemIndex) => <Fragment key={item.id}><RimoElement kind="el-option" key={item.id} label={item.name} value={item} disabled={!view.isTemplateSelectableForBranch('maintenance', item, row.branch)}></RimoElement></Fragment>)}</RimoElement></>
              }}></RimoElement>
<RimoElement kind="el-table-column" label="清潔母版" minWidth="200" slots={{
                "default": ({
                  row
                }) => <><RimoElement kind="el-select" modelValue={view.getTemplateById('cleaning', row.cleaningTemplateId)} valueKey="id" placeholder="選擇清潔母版" clearable={true} style={rimoStyle("width: 180px")} onChange={event => {
                    (value => model.assign(row, "cleaningTemplateId", value ? value.id : ''))?.(event);
                  }} onClear={_event => {
                    model.assign(row, "cleaningTemplateId", '');
                  }}>{rimoEntries(view.getAvailableTemplates('cleaning', row.branch, row.cleaningTemplateId)).map(([item], _itemIndex) => <Fragment key={item.id}><RimoElement kind="el-option" key={item.id} label={item.name} value={item} disabled={!view.isTemplateSelectableForBranch('cleaning', item, row.branch)}></RimoElement></Fragment>)}</RimoElement></>
              }}></RimoElement>
<RimoElement kind="el-table-column" label="上次保養日期" width="170" slots={{
                "default": ({
                  row
                }) => <><RimoElement kind="el-date-picker" modelValue={row.lastMaintenanceAt} onModelChange={value => {
                    model.assign(row, "lastMaintenanceAt", value);
                  }} type="date" valueFormat="YYYY-MM-DD" placeholder="選擇日期" style={rimoStyle("width: 150px")}></RimoElement></>
              }}></RimoElement>
<RimoElement kind="el-table-column" label="上次保養里程" width="150" slots={{
                "default": ({
                  row
                }) => <><RimoElement kind="el-input-number" modelValue={row.lastMaintenanceMileage} onModelChange={value => {
                    model.assign(row, "lastMaintenanceMileage", value);
                  }} min={0} step={100} controlsPosition="right" style={rimoStyle("width: 130px")}></RimoElement></>
              }}></RimoElement>
<RimoElement kind="el-table-column" label="上次清潔日期" width="170" slots={{
                "default": ({
                  row
                }) => <><RimoElement kind="el-date-picker" modelValue={row.lastCleaningAt} onModelChange={value => {
                    model.assign(row, "lastCleaningAt", value);
                  }} type="date" valueFormat="YYYY-MM-DD" placeholder="選擇日期" style={rimoStyle("width: 150px")}></RimoElement></>
              }}></RimoElement>
<RimoElement kind="el-table-column" label="狀態" width="190" align="center" slots={{
                "default": ({
                  row
                }) => <><div className="flex flex-col items-center gap-1"><RimoElement kind="el-tag" type={view.isMaintenanceConfigIncomplete(row) ? 'danger' : 'success'} effect="plain">{text("\n                                                ")}{rimoText(view.isMaintenanceConfigIncomplete(row) ? '保養待補' : '保養可計算')}{text("\n                                            ")}</RimoElement>
<RimoElement kind="el-tag" type={view.isCleaningConfigIncomplete(row) ? 'danger' : 'success'} effect="plain">{text("\n                                                ")}{rimoText(view.isCleaningConfigIncomplete(row) ? '清潔待補' : '清潔可計算')}{text("\n                                            ")}</RimoElement></div></>
              }}></RimoElement>
<RimoElement kind="el-table-column" label="操作" width="120" align="right" fixed="right" slots={{
                "default": ({
                  row
                }) => <><RimoElement kind="el-button" type="primary" link={true} size="small" onClick={_event => {
                    view.saveVehicleBinding(row);
                  }}>{text("保存")}</RimoElement></>
              }}></RimoElement></RimoElement>
<div className="flex justify-between items-center mt-4"><div className="flex items-center gap-2 text-sm text-gray-500"><span>{text("共 ")}{rimoText(view.filteredBindingVehicles.length)}{text(" 臺車輛，每頁")}</span>
<RimoElement kind="el-select" modelValue={view.vehicleBindingPagination.pageSize} onModelChange={value => {
                  model.write(["vehicleBindingPagination", "pageSize"], value);
                }} style={rimoStyle("width: 90px")} onChange={_event => {
                  model.write(["vehicleBindingPagination", "currentPage"], 1);
                }}><RimoElement kind="el-option" label="10 臺" value={10}></RimoElement>
<RimoElement kind="el-option" label="20 臺" value={20}></RimoElement>
<RimoElement kind="el-option" label="50 臺" value={50}></RimoElement></RimoElement></div>
<RimoElement kind="el-pagination" currentPage={view.vehicleBindingPagination.currentPage} onCurrentPageChange={value => {
                model.write(["vehicleBindingPagination", "currentPage"], value);
              }} pageSize={view.vehicleBindingPagination.pageSize} layout="prev, pager, next" total={view.filteredBindingVehicles.length}></RimoElement></div></RimoElement></RimoElement></>}</RimoElement>
<RimoElement kind="el-dialog" modelValue={view.batchBindingDialogVisible} onModelChange={value => {
      model.write(["batchBindingDialogVisible"], value);
    }} title="批量套用母版" width="560px" destroyOnClose={true} className="official-vehicle-reminders-overlay" slots={{
      "footer": _slot => <><RimoElement kind="el-button" onClick={_event => {
          model.write(["batchBindingDialogVisible"], false);
        }}>{text("取消")}</RimoElement>
<RimoElement kind="el-button" type="primary" onClick={event => {
          view.saveBatchVehicleBinding?.(event);
        }}>{text("確認套用")}</RimoElement></>
    }}>{() => <><div className="text-sm text-gray-500 mb-4">{text("\n                        已選擇 ")}{rimoText(view.selectedBindingVehicleCount)}{text(" 臺車輛。批量操作只更新所選母版，不修改上次保養日期、上次保養里程或上次清潔日期。\n                    ")}</div>
<RimoElement kind="el-form" labelPosition="top"><RimoElement kind="el-form-item" label="保養母版"><RimoElement kind="el-select" modelValue={view.batchBindingForm.maintenanceTemplateId} onModelChange={value => {
              model.write(["batchBindingForm", "maintenanceTemplateId"], value);
            }} clearable={true} placeholder="不調整保養母版" style={rimoStyle("width: 100%")}>{rimoEntries(view.batchMaintenanceTemplateOptions).map(([item], _itemIndex) => <Fragment key={item.id}><RimoElement kind="el-option" key={item.id} label={`${item.name}（${view.getTemplateScopeText(item)}）`} value={item.id} disabled={item.status === 'disabled'}></RimoElement></Fragment>)}</RimoElement></RimoElement>
<RimoElement kind="el-form-item" label="清潔母版"><RimoElement kind="el-select" modelValue={view.batchBindingForm.cleaningTemplateId} onModelChange={value => {
              model.write(["batchBindingForm", "cleaningTemplateId"], value);
            }} clearable={true} placeholder="不調整清潔母版" style={rimoStyle("width: 100%")}>{rimoEntries(view.batchCleaningTemplateOptions).map(([item], _itemIndex) => <Fragment key={item.id}><RimoElement kind="el-option" key={item.id} label={`${item.name}（${view.getTemplateScopeText(item)}）`} value={item.id} disabled={item.status === 'disabled'}></RimoElement></Fragment>)}</RimoElement></RimoElement></RimoElement></>}</RimoElement>
<RimoElement kind="el-dialog" modelValue={view.templateDialogVisible} onModelChange={value => {
      model.write(["templateDialogVisible"], value);
    }} title={view.templateDialogTitle} width="560px" destroyOnClose={true} className="official-vehicle-reminders-overlay" slots={{
      "footer": _slot => <><RimoElement kind="el-button" onClick={_event => {
          model.write(["templateDialogVisible"], false);
        }}>{text("取消")}</RimoElement>
<RimoElement kind="el-button" type="primary" onClick={event => {
          view.saveTemplate?.(event);
        }}>{text("保存")}</RimoElement></>
    }}>{() => <><RimoElement kind="el-form" labelPosition="top"><RimoElement kind="el-form-item" label="母版名稱" required={true}><RimoElement kind="el-input" modelValue={view.templateForm.name} onModelChange={value => {
              model.write(["templateForm", "name"], value);
            }} placeholder="例如：新車 / 老車 / 常用接待車"></RimoElement></RimoElement>
{view.templateForm.type === 'maintenance' ? <><><div className="grid grid-cols-2 gap-4" data-rimo-layout="form-grid"><RimoElement kind="el-form-item" label="保養里程閾值 (km)" required={true}><RimoElement kind="el-input-number" modelValue={view.templateForm.thresholdMileageKm} onModelChange={value => {
                    model.write(["templateForm", "thresholdMileageKm"], value);
                  }} min={1} step={100} style={rimoStyle("width: 100%")}></RimoElement></RimoElement>
<RimoElement kind="el-form-item" label="提前提醒公里數 (km)" required={true}><RimoElement kind="el-input-number" modelValue={view.templateForm.advanceMileageKm} onModelChange={value => {
                    model.write(["templateForm", "advanceMileageKm"], value);
                  }} min={0} step={100} style={rimoStyle("width: 100%")}></RimoElement></RimoElement>
<RimoElement kind="el-form-item" label="保養間隔（月）" required={true}><RimoElement kind="el-input-number" modelValue={view.templateForm.thresholdMonths} onModelChange={value => {
                    model.write(["templateForm", "thresholdMonths"], value);
                  }} min={1} style={rimoStyle("width: 100%")}></RimoElement></RimoElement>
<RimoElement kind="el-form-item" label="提前提醒天數" required={true}><RimoElement kind="el-input-number" modelValue={view.templateForm.advanceDays} onModelChange={value => {
                    model.write(["templateForm", "advanceDays"], value);
                  }} min={0} style={rimoStyle("width: 100%")}></RimoElement></RimoElement></div></></> : <><><div className="grid grid-cols-2 gap-4" data-rimo-layout="form-grid"><RimoElement kind="el-form-item" label="清潔用車次數閾值" required={true}><RimoElement kind="el-input-number" modelValue={view.templateForm.thresholdUseCount} onModelChange={value => {
                    model.write(["templateForm", "thresholdUseCount"], value);
                  }} min={1} style={rimoStyle("width: 100%")}></RimoElement></RimoElement>
<RimoElement kind="el-form-item" label="提前提醒次數" required={true}><RimoElement kind="el-input-number" modelValue={view.templateForm.advanceUseCount} onModelChange={value => {
                    model.write(["templateForm", "advanceUseCount"], value);
                  }} min={0} style={rimoStyle("width: 100%")}></RimoElement></RimoElement>
<RimoElement kind="el-form-item" label="清潔間隔（天）" required={true}><RimoElement kind="el-input-number" modelValue={view.templateForm.thresholdDays} onModelChange={value => {
                    model.write(["templateForm", "thresholdDays"], value);
                  }} min={1} style={rimoStyle("width: 100%")}></RimoElement></RimoElement>
<RimoElement kind="el-form-item" label="提前提醒天數" required={true}><RimoElement kind="el-input-number" modelValue={view.templateForm.advanceDays} onModelChange={value => {
                    model.write(["templateForm", "advanceDays"], value);
                  }} min={0} style={rimoStyle("width: 100%")}></RimoElement></RimoElement></div></></>}
<RimoElement kind="el-form-item" label="備註"><RimoElement kind="el-input" modelValue={view.templateForm.remark} onModelChange={value => {
              model.write(["templateForm", "remark"], value);
            }} type="textarea" rows={3} placeholder="補充該母版適用車輛範圍"></RimoElement></RimoElement></RimoElement></>}</RimoElement>
<RimoElement kind="el-dialog" modelValue={view.completionDialogVisible} onModelChange={value => {
      model.write(["completionDialogVisible"], value);
    }} title={view.completionDialogTitle} width="480px" destroyOnClose={true} className="official-vehicle-reminders-overlay" slots={{
      "footer": _slot => <><RimoElement kind="el-button" onClick={_event => {
          model.write(["completionDialogVisible"], false);
        }}>{text("取消")}</RimoElement>
<RimoElement kind="el-button" type="primary" onClick={event => {
          view.submitCompletion?.(event);
        }}>{text("確認登記")}</RimoElement></>
    }}>{() => <><div className="bg-gray-50 rounded-lg border border-gray-100 px-4 py-3 text-sm text-gray-600 mb-4">{text("\n                        當前車輛：")}
<span className="font-bold text-gray-800">{rimoText(view.activeReminderVehicle?.licensePlate)}</span>
<span className="mx-2">{text("|")}</span>
<span>{rimoText(view.activeReminderVehicle?.model)}</span></div>
<RimoElement kind="el-form" labelPosition="top"><RimoElement kind="el-form-item" label="完成日期" required={true}><RimoElement kind="el-date-picker" modelValue={view.completionForm.completedAt} onModelChange={value => {
              model.write(["completionForm", "completedAt"], value);
            }} type="date" valueFormat="YYYY-MM-DD" placeholder="選擇完成日期" style={rimoStyle("width: 100%")}></RimoElement></RimoElement>
{view.activeReminder && view.activeReminder.type === 'maintenance' ? <><RimoElement kind="el-form-item" label="完成里程" required={true}><RimoElement kind="el-input-number" modelValue={view.completionForm.completedMileage} onModelChange={value => {
                model.write(["completionForm", "completedMileage"], value);
              }} min={0} step={100} style={rimoStyle("width: 180px")}></RimoElement></RimoElement></> : null}
<RimoElement kind="el-form-item" label="備註"><RimoElement kind="el-input" modelValue={view.completionForm.remark} onModelChange={value => {
              model.write(["completionForm", "remark"], value);
            }} type="textarea" rows={3} placeholder="補充本次保養或清潔說明"></RimoElement></RimoElement></RimoElement></>}</RimoElement>
<RimoElement kind="el-dialog" modelValue={view.completionRecordDialogVisible} onModelChange={value => {
      model.write(["completionRecordDialogVisible"], value);
    }} title="登記內容" width="520px" destroyOnClose={true} className="official-vehicle-reminders-overlay" slots={{
      "footer": _slot => <><RimoElement kind="el-button" type="primary" onClick={_event => {
          model.write(["completionRecordDialogVisible"], false);
        }}>{text("關閉")}</RimoElement></>
    }}>{() => <><div className="bg-gray-50 rounded-lg border border-gray-100 px-4 py-3 text-sm text-gray-600 mb-4">{text("\n                        當前車輛：")}
<span className="font-bold text-gray-800">{rimoText(view.activeReminderVehicle?.licensePlate)}</span>
<span className="mx-2">{text("|")}</span>
<span>{rimoText(view.activeReminderVehicle?.model)}</span></div>
<RimoElement kind="el-descriptions" column={1} border={true}><RimoElement kind="el-descriptions-item" label="提醒類型">{rimoText(view.activeReminder?.type === 'maintenance' ? '保養提醒' : '清潔提醒')}</RimoElement>
<RimoElement kind="el-descriptions-item" label="登記完成日期">{rimoText(view.activeReminder?.completionRecord?.completedAt || '-')}</RimoElement>
{view.activeReminder && view.activeReminder.type === 'maintenance' ? <><RimoElement kind="el-descriptions-item" label="登記完成里程">{rimoText(view.activeReminder?.completionRecord?.completedMileage ? `${view.activeReminder.completionRecord.completedMileage.toLocaleString()} km` : '-')}</RimoElement></> : null}
<RimoElement kind="el-descriptions-item" label="登記備註">{rimoText(view.activeReminder?.completionRecord?.remark || '-')}</RimoElement>
<RimoElement kind="el-descriptions-item" label="登記人">{rimoText(view.activeReminder?.completionRecord?.operatorName || '-')}</RimoElement>
<RimoElement kind="el-descriptions-item" label="登記時間">{rimoText(view.activeReminder?.completionRecord?.operatedAt || '-')}</RimoElement>
<RimoElement kind="el-descriptions-item" label="登記後基線">{rimoText(view.activeReminder?.completionRecord?.baselineText || '-')}</RimoElement></RimoElement></>}</RimoElement>
<RimoElement kind="el-dialog" modelValue={view.prototypeLogDialogVisible} onModelChange={value => {
      model.write(["prototypeLogDialogVisible"], value);
    }} title="原型修改記錄" width="560px" className="official-vehicle-reminders-overlay" slots={{
      "footer": _slot => <><RimoElement kind="el-button" type="primary" onClick={_event => {
          model.write(["prototypeLogDialogVisible"], false);
        }}>{text("關閉")}</RimoElement></>
    }}>{() => <><div className="space-y-4"><div className="rounded-lg border border-blue-100 bg-blue-50/60 px-4 py-3"><div className="flex items-center justify-between gap-3"><div className="font-semibold text-gray-800">{text("清潔保養提醒｜PRD 同步記錄")}</div>
<RimoElement kind="el-tag" type="info" effect="plain">{text("2026-06-29")}</RimoElement></div>
<div className="text-sm text-gray-500 mt-1">{text("頁面：清潔保養提醒")}</div></div>
<div className="space-y-3 text-sm text-gray-700 leading-6"><div className="border rounded-lg px-4 py-3"><div className="font-semibold text-gray-800 mb-1">{text("v1.2｜補充已完成提醒登記內容查看")}</div>
<ul className="list-disc pl-5 space-y-1"><li>{text("已完成記錄可查看登記完成時保存的日期、里程、備註、操作人和操作時間。")}</li>
<li>{text("提醒列表已完成狀態增加“查看登記內容”入口。")}</li>
<li>{text("登記內容彈窗爲只讀展示，不允許修改登記內容。")}</li></ul></div>
<div className="border rounded-lg px-4 py-3"><div className="font-semibold text-gray-800 mb-1">{text("v1.1｜還原前次丟失內容")}</div>
<ul className="list-disc pl-5 space-y-1"><li>{text("恢復已失效狀態、車輛套用批量操作、母版刪除、通知發送記錄和頂部統計卡待處理口徑。")}</li>
<li>{text("統一已忽略提醒僅保留歷史、只可查看車輛，不允許登記完成。")}</li>
<li>{text("車輛提醒母版和基線資料統一通過右上角“設定”彈窗中的“車輛套用”頁籤維護。")}</li></ul></div></div>
<div className="text-xs text-gray-400 border-t pt-3">{text("\n                            該記錄用於原型評審和交付追蹤，對應 PRD：18_清潔保養提醒.md。\n                        ")}</div></div></>}</RimoElement></RimoRoot>;
}