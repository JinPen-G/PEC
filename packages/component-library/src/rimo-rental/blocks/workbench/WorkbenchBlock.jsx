import { Fragment } from 'react';
import { useRimoModel, rimoEntries } from '../../lib/rimo-model.js';
import { RimoRoot, RimoIcon, useRimoEnvironment } from '../../lib/RimoEnvironment.jsx';
import { RimoElement, rimoClass, rimoStyle, rimoText } from '../../lib/RimoElements.jsx';
import './workbench.css';
function createPageState(model) {
  const _document = model.document;
  const _window = model.window;
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
      onMount: onMounted
    } = model;
    const {
      ElMessage: _ElMessage
    } = feedback;
    const todoTab = ref('pending');
    const todoDialogVisible = ref(false);
    const todoDialogTab = ref('all');
    const todoDialogItems = ref([{
      id: 'pending-1',
      group: 'pending',
      title: '企業資質審覈 - 和運科技',
      meta: '待處理 | 申請人: 李經理 | 10分鐘前',
      desc: '新註冊企業客戶請求開通企業月結白名單。',
      badge: '待處理',
      badgeType: 'info',
      primaryAction: '立即審覈',
      secondaryAction: '查看資料',
      primaryType: 'primary'
    }, {
      id: 'pending-2',
      group: 'pending',
      title: '客戶退款審覈',
      meta: '待處理 | 訂單: R-202611-0021 | 2小時前',
      desc: '因門店缺車導致取消訂單，申請全額退款及補償 100元。',
      badge: '緊急',
      badgeType: 'danger',
      primaryAction: '確認退款',
      secondaryAction: '駁回',
      primaryType: 'danger'
    }, {
      id: 'pending-3',
      group: 'pending',
      title: '派車方案待審覈',
      meta: '待處理 | 門店: 臺北信義門店 | 3小時前',
      desc: '臺北信義門店週末 GL8 訂單集中，需要確認本店車輛派車優先級。',
      badge: '調度',
      badgeType: 'success',
      primaryAction: '確認派車',
      secondaryAction: '查看庫存',
      primaryType: 'success'
    }, {
      id: 'pending-6',
      group: 'pending',
      title: '緊急工單待處理',
      meta: '工單提醒 | 2024/05/05 11:11',
      desc: '[客服主管-張明] 剛剛提交了一筆 [緊急] 工單要求減免超時費，限時2小時內處理！',
      badge: '緊急',
      badgeType: 'danger',
      primaryAction: '立即處理',
      secondaryAction: '查看工單',
      primaryType: 'danger'
    }, {
      id: 'exception-2',
      group: 'exception',
      title: '車輛事故上報',
      meta: '車況/車機異常 | 車牌: 浙A·88888 | 2小時前',
      desc: '客戶反饋沿途發生追尾事故，車輛無法受控，需安排救援拖車服務。',
      badge: '緊急',
      badgeType: 'danger',
      primaryAction: '安排救援',
      secondaryAction: '聯繫保險',
      primaryType: 'danger'
    }, {
      id: 'exception-4',
      group: 'exception',
      title: '車況異常反饋待審覈',
      meta: '車況提醒 | 訂單: ZT24050500003 | 2024/05/05 11:11',
      desc: 'ZT24050500003, [車況異常反饋] 客戶在取車環節上傳了車輛剮蹭照片，請人工審覈定損單！',
      badge: '車況異常',
      badgeType: 'warning',
      primaryAction: '審覈定損',
      secondaryAction: '查看照片',
      primaryType: 'warning'
    }, {
      id: 'exception-5',
      group: 'exception',
      title: '車輛電壓低自動管控',
      meta: '車況提醒 | 車輛: RDC-1234 | 2024/05/05 11:11',
      desc: 'RDC-1234, 車輛電壓較低，已自動管控3天(單號GC889)，管控內有5筆訂單待處理！',
      badge: '管控中',
      badgeType: 'warning',
      primaryAction: '查看管控',
      secondaryAction: '處理訂單',
      primaryType: 'warning'
    }, {
      id: 'exception-6',
      group: 'exception',
      title: '車機掉線自動管控',
      meta: '車況提醒 | 車輛: RDC-1234 | 2024/05/05 11:11',
      desc: 'RDC-1234, 車輛車機掉線，已自動管控1天(單號GC890)，管控內有5筆訂單待處理！',
      badge: '掉線',
      badgeType: 'danger',
      primaryAction: '查看管控',
      secondaryAction: '聯繫維保',
      primaryType: 'danger'
    }, {
      id: 'exception-7',
      group: 'exception',
      title: '車機恢復在線',
      meta: '車況提醒 | 車輛: RDC-1234 | 2024/05/05 11:11',
      desc: 'RDC-1234, 車機恢復在線，已自動解除管控(單號GC889)！',
      badge: '已恢復',
      badgeType: 'success',
      primaryAction: '解除複覈',
      secondaryAction: '查看記錄',
      primaryType: 'success'
    }, {
      id: 'exception-8',
      group: 'exception',
      title: '定位長時間無上報',
      meta: '車況提醒 | 車輛: RDC-1234 | 2024/05/05 11:11',
      desc: 'RDC-1234, 車輛已超過1小時無最新定位上報，請指派尋車！',
      badge: '需尋車',
      badgeType: 'danger',
      primaryAction: '指派尋車',
      secondaryAction: '查看軌跡',
      primaryType: 'danger'
    }, {
      id: 'exception-9',
      group: 'exception',
      title: '車機異常斷電',
      meta: '車況提醒 | 車輛: RDC-1234 | 2024/05/05 11:11',
      desc: 'RDC-1234, 車機發生異常斷電，疑似蓄電池故障，請指派維保！',
      badge: '疑似故障',
      badgeType: 'danger',
      primaryAction: '指派維保',
      secondaryAction: '查看電池',
      primaryType: 'danger'
    }, {
      id: 'dispatch-1',
      group: 'dispatch',
      title: '人工調度確認',
      meta: '調度/整備 | 門店: 虹橋高鐵站店 | 1小時前',
      desc: '虹橋高鐵站店週末預訂高峯，需要確認本店可交付車輛和人工派車方案。',
      badge: '調度',
      badgeType: 'primary',
      primaryAction: '確認方案',
      secondaryAction: '查看庫存',
      primaryType: 'primary'
    }, {
      id: 'dispatch-2',
      group: 'dispatch',
      title: '交車整備告警',
      meta: '調度/整備 | 車牌: 滬A·12345 | 距離交車: 2小時',
      desc: '待交付車輛尚未錄入洗車整備記錄，即將超期，請催促整備專員完成作業。',
      badge: '緊急',
      badgeType: 'danger',
      primaryAction: '下發催辦',
      secondaryAction: '轉交他人',
      primaryType: 'danger'
    }, {
      id: 'dispatch-3',
      group: 'dispatch',
      title: '保養里程達標',
      meta: '保養提醒 | 車輛: RDC-1234 | 2024/05/05 11:11',
      desc: 'RDC-1234, 車輛已達到預設保養里程 (50,000km)，請安排進廠維保！',
      badge: '保養',
      badgeType: 'primary',
      primaryAction: '安排進廠',
      secondaryAction: '查看檔案',
      primaryType: 'primary'
    }, {
      id: 'dispatch-4',
      group: 'dispatch',
      title: '年度保養到期',
      meta: '保養提醒 | 車輛: RDC-1234 | 2024/05/05 11:11',
      desc: 'RDC-1234, 車輛已達到預設年度保養時間，請安排進廠維保！',
      badge: '保養',
      badgeType: 'primary',
      primaryAction: '安排保養',
      secondaryAction: '查看計劃',
      primaryType: 'primary'
    }, {
      id: 'dispatch-5',
      group: 'dispatch',
      title: '深度清潔任務',
      meta: '清潔提醒 | 車輛: RDC-1234 | 2024/05/05 11:11',
      desc: 'RDC-1234, 累計租借達5次，已觸發深度清潔任務指標，請安排！',
      badge: '清潔',
      badgeType: 'success',
      primaryAction: '安排清潔',
      secondaryAction: '查看記錄',
      primaryType: 'success'
    }, {
      id: 'dispatch-6',
      group: 'dispatch',
      title: '日常清潔觸發',
      meta: '清潔提醒 | 車輛: RDC-1234 | 2024/05/05 11:11',
      desc: 'RDC-1234, 結束跨城長單，已觸發日常小清潔指標，請安排！',
      badge: '清潔',
      badgeType: 'success',
      primaryAction: '安排清潔',
      secondaryAction: '查看訂單',
      primaryType: 'success'
    }, {
      id: 'dispatch-7',
      group: 'dispatch',
      title: '停車超時提醒',
      meta: '停車提醒 | 車輛: RDC-1234 | 2024/05/05 11:11',
      desc: 'RDC-1234, 停靠在臺北內湖VIP庫已達6小時未動，請確認是否移庫！',
      badge: '停車',
      badgeType: 'warning',
      primaryAction: '確認移庫',
      secondaryAction: '查看位置',
      primaryType: 'warning'
    }, {
      id: 'dispatch-8',
      group: 'dispatch',
      title: '網點車位預警',
      meta: '停車提醒 | 網點: 重慶江北T3 | 2024/05/05 11:11',
      desc: '[預警] 重慶江北T3網點，已停入12輛車，剩餘0車位，即將引發還車阻塞！',
      badge: '預警',
      badgeType: 'danger',
      primaryAction: '安排移庫',
      secondaryAction: '查看網點',
      primaryType: 'danger'
    }, {
      id: 'dispatch-9',
      group: 'dispatch',
      title: '年檢臨期預警',
      meta: '調度/整備 | 剩餘: 7天 | 共3臺車',
      desc: '檢測到有一批公牌營運車輛年檢即將到期，請儘快發派代理公司辦理全部年檢手續。',
      badge: '年檢',
      badgeType: 'info',
      primaryAction: '查看車輛批次',
      secondaryAction: '指派代辦',
      primaryType: 'primary'
    }, {
      id: 'overdue-1',
      group: 'overdue',
      title: '訂單嚴重逾期',
      meta: '訂單提醒 | 訂單: ZT24050500001 | 2024/05/05 11:11',
      desc: 'ZT24050500001, [嚴重逾期] 車輛已超過預計還車時間 2小時，多次聯繫客戶未果，請調度介入！',
      badge: '嚴重逾期',
      badgeType: 'danger',
      primaryAction: '指派調度',
      secondaryAction: '查看訂單',
      primaryType: 'danger'
    }, {
      id: 'overdue-2',
      group: 'overdue',
      title: '訂單輕微逾期',
      meta: '訂單提醒 | 訂單: ZT24050500001 | 2024/05/05 11:11',
      desc: 'ZT24050500001, [輕微逾期] 車輛已超過預計還車時間 15分鐘，請注意跟進客戶狀態。',
      badge: '輕微逾期',
      badgeType: 'info',
      primaryAction: '提醒客戶',
      secondaryAction: '查看訂單',
      primaryType: 'primary'
    }, {
      id: 'overdue-3',
      group: 'overdue',
      title: '訂單中度逾期',
      meta: '訂單提醒 | 訂單: ZT24050500001 | 2024/05/05 11:11',
      desc: 'ZT24050500001, [中度逾期] 車輛已超過預計還車時間 1小時，已自動發送扣費提醒短信。',
      badge: '中度逾期',
      badgeType: 'warning',
      primaryAction: '跟進客戶',
      secondaryAction: '查看短信',
      primaryType: 'warning'
    }, {
      id: 'overdue-4',
      group: 'overdue',
      title: '訂單即將逾期',
      meta: '訂單提醒 | 訂單: ZT24050500002 | 2024/05/05 11:11',
      desc: 'ZT24050500002, [即將逾期] 車輛距離預計還車時間僅剩 30分鐘，系統已預觸發還車節點。',
      badge: '即將逾期',
      badgeType: 'success',
      primaryAction: '提前提醒',
      secondaryAction: '查看訂單',
      primaryType: 'success'
    }, {
      id: 'overdue-5',
      group: 'overdue',
      title: '車輛超期未還',
      meta: '超期提醒 | 車牌: 蘇A·66666 | 訂單: R-0033',
      desc: '應還時間 6月3日 18:00，已超期聯繫不上客戶，需立案啓動風控尋車。',
      badge: '超期2天',
      badgeType: 'danger',
      primaryAction: '啓動尋車',
      secondaryAction: '催收記錄',
      primaryType: 'danger'
    }, {
      id: 'overdue-6',
      group: 'overdue',
      title: '企業賬單逾期',
      meta: '超期提醒 | 客戶: 特斯拉 | 賬期: 5月',
      desc: '5月對賬結算單 152,000元 逾期未支付，系統已暫停新單配額白名單。',
      badge: '逾期5天',
      badgeType: 'warning',
      primaryAction: '發送催繳單',
      secondaryAction: '線下電聯溝通',
      primaryType: 'warning'
    }]);
    const todoDialogCounts = computed(() => {
      const all = todoDialogItems.value.length;
      const pending = todoDialogItems.value.filter(item => item.group === 'pending').length;
      const exception = todoDialogItems.value.filter(item => item.group === 'exception').length;
      const dispatch = todoDialogItems.value.filter(item => item.group === 'dispatch').length;
      const overdue = todoDialogItems.value.filter(item => item.group === 'overdue').length;
      return {
        all,
        pending,
        exception,
        dispatch,
        overdue
      };
    });
    const filteredTodoDialogItems = computed(() => {
      if (todoDialogTab.value === 'all') return todoDialogItems.value;
      return todoDialogItems.value.filter(item => item.group === todoDialogTab.value);
    });
    const pendingItems = ref([{
      id: 'E-1',
      type: '異常',
      title: '逾期未還：R-202611-0012',
      desc: '車輛定位顯示未進入還車區域，多次聯繫未接聽，已超期2H。',
      time: '10:30',
      tag: '車況/車機異常',
      customer: '李廣'
    }, {
      id: 'E-2',
      type: '異常',
      title: '未準時取車：R-202611-0045',
      desc: '預訂取車時間爲14:00，目前仍未辦理提車手續。',
      time: '14:45',
      tag: '車況/車機異常',
      customer: '王建'
    }, {
      id: 'E-3',
      type: '事故定損',
      title: '事故報備審覈：R-202611-0089',
      desc: '客戶在APP端上傳了輕微追尾現場圖及交警責任書，請審覈並下發維修單。',
      time: '15:20',
      tag: '車況/車機異常',
      customer: '趙大川'
    }, {
      id: 'V-1',
      type: '待保養',
      title: '臨近5萬公里大保養',
      desc: '滬A·DF889（別克GL8）當前里程 49,850 km，請儘快排期進廠大保養。',
      time: '昨天',
      tag: '排車/整備',
      customer: '-'
    }, {
      id: 'V-2',
      type: '待清潔',
      title: '需要日常清潔',
      desc: '京A·R6677（大衆帕薩特）剛結束跨城調撥，內飾傳感器報警閾值觸發，請安排洗車。',
      time: '09:00',
      tag: '排車/整備',
      customer: '-'
    }, {
      id: 'V-3',
      type: '低電量快充',
      title: '需要補能',
      desc: '粵B·E1234（特斯拉Model 3）電池SOC僅剩 15%，請調度至福田高鐵站快充樁。',
      time: '08:15',
      tag: '排車/整備',
      customer: '-'
    }, {
      id: 'P-1',
      type: '催繳',
      title: '租金託欠催繳單',
      desc: '企業客戶 [臺北科技發展有限公司] 11月份月結賬單逾期 3 天未支付。',
      time: '3天前',
      tag: '逾期催繳',
      customer: '財務部轉單'
    }, {
      id: 'P-2',
      type: '催費驗證',
      title: '超期超時費減免申請',
      desc: '[張明]客服主管提交了一筆緊急超時費減免審批，限時2小時內處理。',
      time: '16:05',
      tag: '逾期催繳',
      customer: '張明'
    }]);
    const exceptionItems = computed(() => pendingItems.value.filter(item => item.tag === '車況/車機異常'));
    const dispatchItems = computed(() => pendingItems.value.filter(item => item.tag === '排車/整備'));
    const overdueItems = computed(() => pendingItems.value.filter(item => item.tag === '逾期催繳'));
    const getIconForType = type => {
      const map = {
        '異常': 'WarningFilled',
        '事故定損': 'Van',
        '待保養': 'Setting',
        '待清潔': 'Brush',
        '低電量快充': 'Lightning',
        '催繳': 'DocumentDelete',
        '催費驗證': 'Timer'
      };
      return map[type] || 'Tickets';
    };
    const getColorForType = type => {
      const map = {
        '異常': 'orange',
        '事故定損': 'red',
        '待保養': 'blue',
        '待清潔': 'green',
        '低電量快充': 'yellow',
        '催繳': 'orange',
        '催費驗證': 'red'
      };
      return map[type] || 'gray';
    };
    const handleAction = item => {
      pendingItems.value = pendingItems.value.filter(i => i.id !== item.id);
      feedback.ElMessage.success('已完成操作: ' + item.title);
    };
    const handleDialogAction = (action, item) => {
      feedback.ElMessage.success(action + '：' + item.title);
    };
    const currentHour = new Date().getHours();
    const greeting = computed(() => {
      if (currentHour >= 5 && currentHour < 12) return 'Hi, 早上好！';
      if (currentHour >= 12 && currentHour < 18) return 'Hi, 下午好！';
      return 'Hi, 晚上好！';
    });
    const userName = ref('Admin');
    const assetHealth = reactive({
      accident: 1,
      maintenance: 3,
      offline: 2,
      idle: 4
    });
    const settingDialogVisible = ref(false);
    const announcementDialogVisible = ref(false);
    const announcementDetailVisible = ref(false);
    const announcementKeyword = ref('');
    const activeAnnouncement = ref(null);
    const maxSelectedApps = 8;
    const allApps = ref([{
      id: 'risk_review',
      name: '風控審覈',
      icon: 'DocumentChecked',
      href: 'member_review.html',
      color: 'icon-indigo',
      category: '風控/合規',
      default: true
    }, {
      id: 'vehicle_files',
      name: '維保檔案',
      icon: 'Files',
      href: 'vehicles.html',
      color: 'icon-orange',
      category: '車輛管理',
      default: true
    }, {
      id: 'finance',
      name: '財務結算',
      icon: 'Money',
      href: 'dashboard.html',
      color: 'icon-green',
      category: '財務',
      default: true
    }, {
      id: 'marketing',
      name: '營銷中心',
      icon: 'PictureRounded',
      href: 'marketing.html',
      color: 'icon-rose',
      category: '營銷',
      default: true
    }, {
      id: 'reports',
      name: '數據報表',
      icon: 'DataLine',
      href: 'war_room.html',
      color: 'icon-teal',
      category: '分析',
      default: true
    }, {
      id: 'settings',
      name: '系統配置',
      icon: 'Setting',
      href: 'settings.html',
      color: 'icon-purple',
      category: '系統',
      default: true
    }, {
      id: 'new_order',
      name: '新建訂單',
      icon: 'Ticket',
      href: 'new_order.html',
      color: 'icon-blue',
      category: '訂單'
    }, {
      id: 'store_orders',
      name: '門市訂單',
      icon: 'List',
      href: 'store_orders.html',
      color: 'icon-blue',
      category: '訂單'
    }, {
      id: 'members',
      name: '會員管理',
      icon: 'User',
      href: 'members.html',
      color: 'icon-purple',
      category: '客戶'
    }, {
      id: 'dispatch',
      name: '車輛排程',
      icon: 'Van',
      href: 'dispatch.html',
      color: 'icon-green',
      category: '調度'
    }]);
    const selectedAppIds = ref([]);
    const dragAppId = ref(null);
    const selectedApps = computed(() => selectedAppIds.value.map(id => allApps.value.find(app => app.id === id)).filter(Boolean));
    const getDefaultAppIds = () => {
      const defaults = allApps.value.filter(app => app.default).map(app => app.id);
      return defaults.length ? defaults : allApps.value.slice(0, 6).map(app => app.id);
    };
    selectedAppIds.value = getDefaultAppIds();
    const toggleAppSelection = (appId, checked) => {
      const exists = selectedAppIds.value.includes(appId);
      const shouldSelect = typeof checked === 'boolean' ? checked : !exists;
      if (shouldSelect) {
        if (exists) return;
        if (selectedAppIds.value.length >= maxSelectedApps) {
          feedback.ElMessage.warning(`最多選擇 ${maxSelectedApps} 個模塊`);
          return;
        }
        selectedAppIds.value = [...selectedAppIds.value, appId];
        return;
      }
      if (!exists) return;
      selectedAppIds.value = selectedAppIds.value.filter(id => id !== appId);
    };
    const removeApp = appId => {
      selectedAppIds.value = selectedAppIds.value.filter(id => id !== appId);
    };
    const handleDragStart = appId => {
      dragAppId.value = appId;
    };
    const handleDragEnd = () => {
      dragAppId.value = null;
    };
    const handleDrop = targetId => {
      if (!dragAppId.value || dragAppId.value === targetId) return;
      const next = [...selectedAppIds.value];
      const fromIndex = next.indexOf(dragAppId.value);
      const toIndex = next.indexOf(targetId);
      if (fromIndex === -1 || toIndex === -1) return;
      next.splice(fromIndex, 1);
      next.splice(toIndex, 0, dragAppId.value);
      selectedAppIds.value = next;
      dragAppId.value = null;
    };
    const loadAppSelection = () => {
      try {
        const stored = localStorage.getItem('rimo_workbench_apps');
        if (stored) {
          const parsed = JSON.parse(stored);
          const ids = Array.isArray(parsed) ? parsed.filter(id => allApps.value.some(app => app.id === id)) : [];
          if (ids.length) {
            selectedAppIds.value = ids.slice(0, maxSelectedApps);
            return;
          }
        }
      } catch {
        model.notify("warning", "\u672C\u5730\u793A\u4F8B\u8D44\u6599\u65E0\u6CD5\u6062\u590D\uFF0C\u5DF2\u4F7F\u7528\u9ED8\u8BA4\u8D44\u6599\u3002");
      }
      selectedAppIds.value = getDefaultAppIds();
    };
    const saveAppSelection = () => {
      localStorage.setItem('rimo_workbench_apps', JSON.stringify(selectedAppIds.value));
      feedback.ElMessage.success('已保存配置');
      settingDialogVisible.value = false;
    };
    const resetAppSelection = () => {
      selectedAppIds.value = getDefaultAppIds();
    };
    const metrics = reactive({
      todayTodo: 26,
      rentalRate: 78.5,
      inRentCount: 126,
      totalFleet: 160,
      monthRevenue: 85468000
    });
    const formattedRevenue = computed(() => {
      return (metrics.monthRevenue / 100).toLocaleString('zh-CN', {
        minimumFractionDigits: 2
      });
    });
    const announcements = ref([{
      id: 'announcement-20260310',
      title: '端午節安全檢查提醒',
      content: `爲保障端午節期間運營安全，請各門店在 3 月 15 日前完成以下檢查：
1. 輪胎磨損、胎壓及備胎完整性
2. 剎車系統、燈光、雨刷及油液狀態
3. 車內應急工具（反光背心、三角牌、急救包）齊備

檢查完成後請在系統中提交檢查記錄，未完成將影響節假日排班與車輛交付。`,
      date: '2026-03-10',
      publisher: '運營部',
      ts: new Date('2026-03-10').getTime()
    }, {
      id: 'announcement-20260308',
      title: '端午期間訂單調價及排班公告',
      content: `端午期間訂單將啓用節假日階梯價，同時門店排班需在 3 月 12 日前完成調整。
計費引擎將於本週五 02:00 ~ 04:00 升級，期間系統不影響下單但可能延遲同步。`,
      date: '2026-03-08',
      publisher: '技術部',
      ts: new Date('2026-03-08').getTime()
    }, {
      id: 'announcement-20260305',
      title: '車輛出庫標準更新',
      content: `爲提升交付體驗，車輛出庫標準更新如下：
1. 外觀無明顯污泥、劃痕需記錄
2. 內飾無異味，腳墊與中控區域清潔
3. 油量不低於 1/4，電車 SOC 不低於 50%`,
      date: '2026-03-05',
      publisher: '品控中心',
      ts: new Date('2026-03-05').getTime()
    }, {
      id: 'announcement-20260302',
      title: '新客戶風控策略升級',
      content: `風控策略升級已上線：
1. 首單押金校驗：未完成押金驗證訂單將被攔截
2. 證件一致性複覈：證件信息與下單人信息不一致需人工複覈
3. 高風險時間段訂單將觸發二次覈驗`,
      date: '2026-03-02',
      publisher: '風控中心',
      ts: new Date('2026-03-02').getTime()
    }, {
      id: 'announcement-20260227',
      title: '計費引擎升級維護通知',
      content: `計費引擎維護期間可能出現報表生成延遲，預計在 04:30 前恢復。
如遇異常，請聯繫技術支持。`,
      date: '2026-02-27',
      publisher: '技術部',
      ts: new Date('2026-02-27').getTime()
    }, {
      id: 'announcement-20260223',
      title: '企業月結資格申請流程調整',
      content: `企業月結資格申請新增風控評估，審批週期延長 1-2 個工作日。
門店需提前發起申請以避免影響簽約。`,
      date: '2026-02-23',
      publisher: '財務部',
      ts: new Date('2026-02-23').getTime()
    }, {
      id: 'announcement-20260218',
      title: '門店庫存盤點指引',
      content: `本月末將進行庫存盤點，請各門店按指引完成車輛與物料覈對。
盤點結果需在系統中提交，若有異常需附上說明。`,
      date: '2026-02-18',
      publisher: '運營部',
      ts: new Date('2026-02-18').getTime()
    }]);
    const filteredAnnouncements = computed(() => {
      const keyword = announcementKeyword.value.trim().toLowerCase();
      let list = announcements.value;
      if (keyword) {
        list = list.filter(item => {
          const haystack = [item.title, item.content, item.publisher].filter(Boolean).join(' ').toLowerCase();
          return haystack.includes(keyword);
        });
      }
      return [...list].sort((a, b) => (b.ts || 0) - (a.ts || 0));
    });
    const featuredAnnouncements = computed(() => {
      return [...announcements.value].sort((a, b) => (b.ts || 0) - (a.ts || 0)).slice(0, 3);
    });
    const getAnnouncementPreview = (item, maxLength = 60) => {
      const text = (item.content || '').replace(/\s+/g, ' ').trim();
      return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
    };
    const openAnnouncementCenter = () => {
      announcementDialogVisible.value = true;
    };
    const openAnnouncementDetail = item => {
      if (!item) return;
      activeAnnouncement.value = item;
      announcementDialogVisible.value = false;
      announcementDetailVisible.value = true;
    };
    const today = new Date();
    const scheduleDate = computed(() => {
      return `${today.getMonth() + 1}月${today.getDate()}日`;
    });
    const weekDayNames = ['日', '一', '二', '三', '四', '五', '六'];
    const weekDay = computed(() => '周' + weekDayNames[today.getDay()]);
    const banners = ref([{
      title: '✨ 端午節運營錦囊已下發',
      desc: '從端午期間的營銷策略、風控把控到違章處理，全方位提升門店營業額，查看"賺翻天"祕籍。',
      btnText: '立即查看',
      icon: 'Present',
      gradient: 'from-[color:var(--app-color-primary)] to-[#008AC5]'
    }, {
      title: '🚀 v2.8 系統升級通知',
      desc: '新增智能調價引擎與車輛 IoT 健康監控功能，將於本週五 02:00~04:00 進行不停機升級。',
      btnText: '瞭解詳情',
      icon: 'Monitor',
      gradient: 'from-[color:var(--app-color-primary)] to-[color:var(--app-color-primary)]'
    }, {
      title: '🏆 上月之星：虹橋高鐵站店',
      desc: '出租率 96.2%，客訴率 0.3%，創下全區門店最佳運營記錄！點擊查看其經驗分享。',
      btnText: '查看覆盤',
      icon: 'Trophy',
      gradient: 'from-[#ea580c] to-[#f97316]'
    }]);
    const recentPages = ref([]);
    const loadRecentPages = () => {
      try {
        const stored = localStorage.getItem('rimo_recent_pages');
        if (stored) {
          recentPages.value = JSON.parse(stored).slice(0, 5);
        } else {
          recentPages.value = [{
            href: 'corporates.html',
            name: '企業客戶管理'
          }, {
            href: 'official_vehicle_contracts.html',
            name: '公務用車合約'
          }, {
            href: 'store_orders.html',
            name: '門市租賃訂單'
          }];
        }
      } catch {
        recentPages.value = [{
          href: 'corporates.html',
          name: '企業客戶管理'
        }, {
          href: 'store_orders.html',
          name: '門市租賃訂單'
        }];
      }
    };
    onMounted(() => {
      loadRecentPages();
      loadAppSelection();
    });
    return {
      todoTab,
      greeting,
      userName,
      assetHealth,
      settingDialogVisible,
      announcementDialogVisible,
      announcementDetailVisible,
      announcementKeyword,
      announcements,
      filteredAnnouncements,
      featuredAnnouncements,
      activeAnnouncement,
      getAnnouncementPreview,
      openAnnouncementCenter,
      openAnnouncementDetail,
      maxSelectedApps,
      allApps,
      selectedAppIds,
      selectedApps,
      dragAppId,
      toggleAppSelection,
      removeApp,
      handleDragStart,
      handleDragEnd,
      handleDrop,
      saveAppSelection,
      resetAppSelection,
      todoDialogVisible,
      todoDialogTab,
      todoDialogCounts,
      filteredTodoDialogItems,
      exceptionItems,
      dispatchItems,
      overdueItems,
      getIconForType,
      getColorForType,
      handleAction,
      handleDialogAction,
      metrics,
      formattedRevenue,
      pendingItems,
      scheduleDate,
      weekDay,
      banners,
      recentPages,
      ElMessage: feedback.ElMessage,
      todoDialogItems,
      currentHour,
      getDefaultAppIds,
      loadAppSelection,
      today,
      weekDayNames,
      loadRecentPages
    };
  }
  return pageSetup();
}
export default function WorkbenchBlock() {
  const model = useRimoModel(createPageState);
  const view = model.view;
  const {
    text
  } = useRimoEnvironment();
  return <RimoRoot model={model} pageKey="workbench" assets={{}}><div data-business-content="" data-rimo-layout="page"><div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scroll"><div className="bg-white rounded-2xl p-6 flex flex-col lg:flex-row justify-between items-center card-shadow"><div className="flex items-center gap-5 mb-6 lg:mb-0"><RimoElement kind="el-avatar" size={72} src="https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png" className="border-2 border-blue-50"></RimoElement>
<div><h2 className="text-2xl font-bold text-gray-800 tracking-tight">{rimoText(view.greeting)}{rimoText(view.userName)}{text("\n                            ")}</h2>
<p className="text-sm text-gray-500 mt-2 flex items-center">{text("\n                                今日有 ")}
<span className="bg-[color:var(--app-color-primary-light-9)] text-[color:var(--app-color-primary)] font-bold px-2 py-0.5 rounded ml-1 mr-1">{text("5")}</span>
{text("\n                                臺車輛需要交付，請關注待辦事項。\n                                ")}
<a href="#" className="text-[color:var(--app-color-primary)] ml-3 hover:underline flex items-center text-xs">{text("查看詳情\n                                    ")}
<RimoElement kind="el-icon" className="ml-0.5"><RimoIcon name="ArrowRight" /></RimoElement></a></p></div></div>
<div className="flex gap-10"><div className="text-center group cursor-pointer"><div className="text-sm text-gray-500 mb-1 group-hover:text-gray-800 transition-colors flex items-center justify-center gap-1">{text("\n                                今日待辦事項\n                                ")}
<span className="text-[10px] text-green-500 bg-green-50 px-1 rounded flex items-center"><RimoElement kind="el-icon"><RimoIcon name="Bottom" /></RimoElement>
{text("2項")}</span></div>
<div className="text-3xl font-bold text-red-500"><span className="text-sm font-normal mr-1 text-gray-400"></span>
{rimoText(view.todoDialogCounts.all)}{text("\n                            ")}</div></div>
<div className="w-px bg-gray-100 hidden md:block"></div>
<div className="text-center group cursor-pointer"><div className="text-sm text-gray-500 mb-1 group-hover:text-gray-800 transition-colors flex items-center justify-center gap-1">{text("\n                                今日出租率\n                                ")}
<span className="text-[10px] text-red-500 bg-red-50 px-1 rounded flex items-center"><RimoElement kind="el-icon"><RimoIcon name="Top" /></RimoElement>
{text("3.5%")}</span></div>
<div className={rimoClass(["text-3xl font-bold", rimoClass(view.metrics.rentalRate >= 80 ? 'text-green-600' : 'text-orange-500')])}>{rimoText(view.metrics.rentalRate)}
<span className="text-lg font-normal ml-0.5 text-gray-400">{text("%")}</span></div></div>
<div className="w-px bg-gray-100 hidden md:block"></div>
<div className="text-center group cursor-pointer"><div className="text-sm text-gray-500 mb-1 group-hover:text-gray-800 transition-colors flex items-center justify-center gap-1">{text("\n                                在租/總車輛\n                                ")}
<span className="text-[10px] text-red-500 bg-red-50 px-1 rounded flex items-center"><RimoElement kind="el-icon"><RimoIcon name="Top" /></RimoElement>
{text("12臺")}</span></div>
<div className="text-3xl font-bold text-[color:var(--app-color-primary)]">{rimoText(view.metrics.inRentCount)}
<span className="text-lg font-normal text-gray-400">{text("/")}{rimoText(view.metrics.totalFleet)}</span></div></div>
<div className="w-px bg-gray-100 hidden md:block"></div>
<div className="text-center group cursor-pointer"><div className="text-sm text-gray-500 mb-1 group-hover:text-gray-800 transition-colors flex items-center justify-center gap-1">{text("\n                                本月營收\n                                ")}
<span className="text-[10px] text-red-500 bg-red-50 px-1 rounded flex items-center"><RimoElement kind="el-icon"><RimoIcon name="Top" /></RimoElement>
{text("11.2%")}</span></div>
<div className="text-3xl font-bold text-gray-800"><span className="text-lg font-normal mr-1 text-gray-400">{text("¥")}</span>
{rimoText(view.formattedRevenue)}{text("\n                            ")}</div></div></div></div>
<div className="bg-gradient-to-r from-red-50 via-orange-50 to-gray-50 rounded-xl p-0 flex items-center border border-red-100/50 card-shadow overflow-hidden"><div className="bg-red-500 text-white px-4 py-3 text-sm font-bold flex items-center shrink-0"><RimoElement kind="el-icon" className="mr-1.5"><RimoIcon name="Warning" /></RimoElement>
{text("資產異常預警\n                    ")}</div>
<div className="flex-1 flex px-4 gap-8 overflow-x-auto whitespace-nowrap custom-scroll"><div className="flex items-center gap-2 cursor-pointer group"><div className="w-2 h-2 rounded-full bg-red-500 group-hover:animate-ping"></div>
<span className="text-sm text-gray-600 group-hover:text-red-600 transition-colors">{text("事故定損：")}
<strong className="text-red-600">{rimoText(view.assetHealth.accident)}{text("臺")}</strong></span></div>
<div className="w-px bg-gray-200/50 h-4 my-auto"></div>
<div className="flex items-center gap-2 cursor-pointer group"><div className="w-2 h-2 rounded-full bg-orange-500 group-hover:animate-ping"></div>
<span className="text-sm text-gray-600 group-hover:text-orange-600 transition-colors">{text("維修中：")}
<strong className="text-orange-600">{rimoText(view.assetHealth.maintenance)}{text("臺")}</strong></span></div>
<div className="w-px bg-gray-200/50 h-4 my-auto"></div>
<div className="flex items-center gap-2 cursor-pointer group"><div className="w-2 h-2 rounded-full bg-gray-400 group-hover:animate-ping"></div>
<span className="text-sm text-gray-600 group-hover:text-gray-800 transition-colors">{text("GPS掉線：")}
<strong className="text-gray-800">{rimoText(view.assetHealth.offline)}{text("臺")}</strong></span></div>
<div className="w-px bg-gray-200/50 h-4 my-auto"></div>
<div className="flex items-center gap-2 cursor-pointer group"><div className="w-2 h-2 rounded-full bg-yellow-500 group-hover:animate-ping"></div>
<span className="text-sm text-gray-600 group-hover:text-yellow-600 transition-colors">{text("閒置>5天：")}
<strong className="text-yellow-600">{rimoText(view.assetHealth.idle)}{text("臺")}</strong></span></div></div>
<div className="px-4 shrink-0"><RimoElement kind="el-button" link={true} type="danger" size="small">{text("立即處置 ")}
<RimoElement kind="el-icon" className="ml-1"><RimoIcon name="ArrowRight" /></RimoElement></RimoElement></div></div>
<div className="flex flex-col xl:flex-row gap-6"><div className="xl:w-[22%] space-y-6 flex flex-col min-w-0"><div className="bg-white rounded-2xl p-5 card-shadow"><div className="flex items-center justify-between mb-4"><h3 className="font-bold text-gray-800 flex items-center"><span className="w-1 h-4 bg-[color:var(--app-color-primary)] rounded-full mr-2"></span>
{text("\n                                    常用功能\n                                ")}</h3>
<RimoElement kind="el-button" link={true} type="primary" size="small">{text("編輯")}</RimoElement></div>
<div className="grid grid-cols-2 gap-3" data-rimo-layout="summary"><div onClick={_event => {
                  model.assign(window.location, "href", 'new_order.html');
                }} className="flex flex-col items-center justify-center p-4 py-5 rounded-xl bg-gray-50/50 hover:bg-gray-100 border border-transparent hover:border-gray-200 cursor-pointer transition-all group" data-rimo-layout="stat"><div className="w-10 h-10 rounded-xl icon-blue flex items-center justify-center mb-2 group-hover:scale-110 transition-transform"><RimoElement kind="el-icon" className="text-xl"><RimoIcon name="Ticket" /></RimoElement></div>
<span className="text-xs text-gray-700 font-medium">{text("新建訂單")}</span></div>
<div onClick={_event => {
                  model.assign(window.location, "href", 'dispatch.html');
                }} className="flex flex-col items-center justify-center p-4 py-5 rounded-xl bg-gray-50/50 hover:bg-gray-100 border border-transparent hover:border-gray-200 cursor-pointer transition-all group" data-rimo-layout="stat"><div className="w-10 h-10 rounded-xl icon-green flex items-center justify-center mb-2 group-hover:scale-110 transition-transform"><RimoElement kind="el-icon" className="text-xl"><RimoIcon name="Van" /></RimoElement></div>
<span className="text-xs text-gray-700 font-medium">{text("車輛排程")}</span></div>
<div onClick={_event => {
                  model.assign(window.location, "href", 'members.html');
                }} className="flex flex-col items-center justify-center p-4 py-5 rounded-xl bg-gray-50/50 hover:bg-gray-100 border border-transparent hover:border-gray-200 cursor-pointer transition-all group" data-rimo-layout="stat"><div className="w-10 h-10 rounded-xl icon-purple flex items-center justify-center mb-2 group-hover:scale-110 transition-transform"><RimoElement kind="el-icon" className="text-xl"><RimoIcon name="User" /></RimoElement></div>
<span className="text-xs text-gray-700 font-medium">{text("客戶建檔")}</span></div>
<div onClick={_event => {
                  model.assign(window.location, "href", 'dashboard.html');
                }} className="flex flex-col items-center justify-center p-4 py-5 rounded-xl bg-gray-50/50 hover:bg-gray-100 border border-transparent hover:border-gray-200 cursor-pointer transition-all group" data-rimo-layout="stat"><div className="w-10 h-10 rounded-xl icon-orange flex items-center justify-center mb-2 group-hover:scale-110 transition-transform"><RimoElement kind="el-icon" className="text-xl"><RimoIcon name="Odometer" /></RimoElement></div>
<span className="text-xs text-gray-700 font-medium">{text("運營大屏")}</span></div></div></div>
<div className="latest-announcement-card card-shadow flex-1"><div className="flex items-center justify-between mb-5"><h3 className="font-bold text-gray-800 flex items-center"><span className="w-1 h-4 bg-orange-400 rounded-full mr-2"></span>
{text("\n                                    最新公告\n                                ")}</h3>
<a href="#" className="text-xs text-gray-400 hover:text-[color:var(--app-color-primary)]" onClick={event => {
                  event.preventDefault();
                  view.openAnnouncementCenter?.(event);
                }}>{text("更多 >")}</a></div>
<div>{rimoEntries(view.featuredAnnouncements).map(([item, idx], _itemIndex) => <Fragment key={item.id}><div key={item.id} className={rimoClass(["latest-announcement-item group", rimoClass({
                    'is-primary': idx === 0
                  })])} onClick={_event => {
                    view.openAnnouncementDetail(item);
                  }}><div className="latest-announcement-dot"></div>
<div className="flex-1"><div className="latest-announcement-title group-hover:text-[color:var(--app-color-primary)] line-clamp-1">{text("\n                                            ")}{rimoText(item.title)}{text("\n                                        ")}</div>
<div className="latest-announcement-summary line-clamp-2">{rimoText(view.getAnnouncementPreview(item, 48))}</div>
<div className="latest-announcement-meta">{idx === 0 ? <><span className="latest-announcement-badge">{text("置頂")}</span></> : null}
<span>{rimoText(item.date)}{text(" | ")}{rimoText(item.publisher)}</span></div></div></div></Fragment>)}</div></div></div>
<div className="xl:w-[53%] space-y-6 flex flex-col min-w-0"><div className="bg-white rounded-2xl card-shadow overflow-hidden flex flex-col"><div className="px-6 pt-5 pb-1 flex items-center justify-between"><h3 className="font-bold text-gray-800 text-lg flex items-center"><RimoElement kind="el-icon" className="mr-2 text-[color:var(--app-color-primary)]"><RimoIcon name="List" /></RimoElement>
{text("\n                                    待辦事項\n                                    ")}
<span className="ml-2 font-normal text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">{rimoText(view.todoDialogCounts.all)}</span></h3>
<a href="#" className="text-xs text-gray-400 hover:text-[color:var(--app-color-primary)] flex items-center" onClick={event => {
                  event.preventDefault();
                  model.write(["todoDialogVisible"], true);
                  model.write(["todoDialogTab"], 'all');
                }}>{text("全部\n                                    ")}
<RimoElement kind="el-icon" className="ml-1"><RimoIcon name="ArrowRight" /></RimoElement></a></div>
<div className="px-4 workbench-tabs"><RimoElement kind="el-tabs" modelValue={view.todoTab} onModelChange={value => {
                  model.write(["todoTab"], value);
                }}><RimoElement kind="el-tab-pane" label={`待處理 (${view.todoDialogCounts.pending})`} name="pending"></RimoElement>
<RimoElement kind="el-tab-pane" label={`車況/車機異常 (${view.todoDialogCounts.exception})`} name="exception"></RimoElement>
<RimoElement kind="el-tab-pane" label={`調度/整備 (${view.todoDialogCounts.dispatch})`} name="dispatch"></RimoElement>
<RimoElement kind="el-tab-pane" label={`超期提醒 (${view.todoDialogCounts.overdue})`} name="overdue"></RimoElement></RimoElement></div>
<div className="p-5 pt-2 grid grid-cols-2 gap-4 todo-panel custom-scroll" hidden={!(view.todoTab === 'pending')}><div className="border border-blue-100 bg-gradient-to-br from-blue-50/50 to-white rounded-xl p-4 hover:shadow-md transition-shadow relative group"><div className="absolute right-3 top-3"><RimoElement kind="el-tag" size="small" type="primary" effect="plain">{text("新進")}</RimoElement></div>
<div className="flex items-center gap-3 mb-3 mt-1"><div className="w-10 h-10 rounded-full bg-[color:var(--app-color-primary-light-8)] flex items-center justify-center text-[color:var(--app-color-primary)]"><RimoElement kind="el-icon" className="text-xl"><RimoIcon name="UserFilled" /></RimoElement></div>
<div className="flex-1"><div className="text-sm font-bold text-gray-800">{text("企業資質審覈 - 和運科技")}</div>
<div className="text-xs text-gray-500 mt-0.5">{text("申請人: 李經理 | 10分鐘前")}</div></div></div>
<div className="text-sm text-gray-600 mb-4 bg-white p-2 border border-gray-100 rounded text-xs">{text("\n                                        新註冊企業客戶請求開通企業月結白名單。\n                                    ")}</div>
<div className="flex gap-2"><RimoElement kind="el-button" type="primary" size="small" className="flex-1">{text("立即審覈")}</RimoElement>
<RimoElement kind="el-button" plain={true} size="small" className="flex-1">{text("查看資料")}</RimoElement></div></div>
<div className="border border-red-100 bg-gradient-to-br from-red-50/50 to-white rounded-xl p-4 hover:shadow-md transition-shadow relative group"><div className="absolute right-3 top-3"><RimoElement kind="el-tag" size="small" type="danger" effect="plain">{text("緊急")}</RimoElement></div>
<div className="flex items-center gap-3 mb-3 mt-1"><div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600"><RimoElement kind="el-icon" className="text-xl"><RimoIcon name="WarningFilled" /></RimoElement></div>
<div className="flex-1"><div className="text-sm font-bold text-gray-800">{text("客戶退款審覈")}</div>
<div className="text-xs text-gray-500 mt-0.5">{text("訂單: R-202611-0021 | 2小時前")}</div></div></div>
<div className="text-sm text-gray-600 mb-4 bg-white p-2 border border-gray-100 rounded text-xs">{text("\n                                        因門店缺車導致取消訂單，申請全額退款及補償 100元。\n                                    ")}</div>
<div className="flex gap-2"><RimoElement kind="el-popconfirm" title="確認全額退款及補償 100元？" confirmButtonText="確定" cancelButtonText="取消" width="220" onConfirm={_event => {
                      view.feedbackMessage.success('已確認退款');
                    }} slots={{
                      "reference": _slot => <><RimoElement kind="el-button" type="danger" plain={true} size="small" className="flex-1">{text("確認退款")}</RimoElement></>
                    }}></RimoElement>
<RimoElement kind="el-button" plain={true} size="small" className="flex-1">{text("駁回")}</RimoElement></div></div>
<div className="border border-green-100 bg-gradient-to-br from-green-50/50 to-white rounded-xl p-4 hover:shadow-md transition-shadow relative group"><div className="flex items-center gap-3 mb-3 mt-1"><div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600"><RimoElement kind="el-icon" className="text-xl"><RimoIcon name="Van" /></RimoElement></div>
<div className="flex-1"><div className="text-sm font-bold text-gray-800">{text("派車方案待審覈")}</div>
<div className="text-xs text-gray-500 mt-0.5">{text("門店: 臺北信義門店 | 3小時前")}</div></div></div>
<div className="text-sm text-gray-600 mb-4 bg-white p-2 border border-gray-100 rounded text-xs truncate">{text("\n                                        臺北信義門店週末 GL8 訂單集中，需要確認本店車輛派車優先級。\n                                    ")}</div>
<div className="flex gap-2"><RimoElement kind="el-popconfirm" title="確認採用此派車方案？" confirmButtonText="確認派車" cancelButtonText="取消" width="220" onConfirm={_event => {
                      view.feedbackMessage.success('派車方案已確認');
                    }} slots={{
                      "reference": _slot => <><RimoElement kind="el-button" type="success" plain={true} size="small" className="flex-1">{text("確認派車")}</RimoElement></>
                    }}></RimoElement>
<RimoElement kind="el-button" plain={true} size="small" className="flex-1">{text("查看單據")}</RimoElement></div></div>
<div className="border border-red-100 bg-gradient-to-br from-red-50/50 to-white rounded-xl p-4 hover:shadow-md transition-shadow relative group"><div className="absolute right-3 top-3"><RimoElement kind="el-tag" size="small" type="danger" effect="plain">{text("緊急")}</RimoElement></div>
<div className="flex items-center gap-3 mb-3 mt-1"><div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600"><RimoElement kind="el-icon" className="text-xl"><RimoIcon name="Document" /></RimoElement></div>
<div className="flex-1"><div className="text-sm font-bold text-gray-800">{text("緊急工單待處理")}</div>
<div className="text-xs text-gray-500 mt-0.5">{text("工單提醒 | 2024/05/05 11:11")}</div></div></div>
<div className="text-sm text-gray-600 mb-4 bg-white p-2 border border-gray-100 rounded text-xs">{text("\n                                        [客服主管-張明] 剛剛提交了一筆 [緊急] 工單要求減免超時費，限時2小時內處理！\n                                    ")}</div>
<div className="flex gap-2"><RimoElement kind="el-button" type="danger" size="small" className="flex-1">{text("立即處理")}</RimoElement>
<RimoElement kind="el-button" plain={true} size="small" className="flex-1">{text("查看工單")}</RimoElement></div></div></div>
<div className="p-5 pt-2 grid grid-cols-2 gap-4 todo-panel custom-scroll" hidden={!(view.todoTab === 'exception')}><div className="border border-red-100 bg-gradient-to-br from-red-50/50 to-white rounded-xl p-4 hover:shadow-md transition-shadow relative group"><div className="absolute right-3 top-3"><RimoElement kind="el-tag" size="small" type="danger" effect="plain">{text("緊急")}</RimoElement></div>
<div className="flex items-center gap-3 mb-3 mt-1"><div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600"><RimoElement kind="el-icon" className="text-xl"><RimoIcon name="WarningFilled" /></RimoElement></div>
<div className="flex-1"><div className="text-sm font-bold text-gray-800">{text("車輛事故上報")}</div>
<div className="text-xs text-gray-500 mt-0.5">{text("車牌: 浙A·88888 | 2小時前")}</div></div></div>
<div className="text-sm text-gray-600 mb-4 bg-white p-2 border border-gray-100 rounded text-xs">{text("\n                                        客戶反饋沿途發生追尾事故，車輛無法受控，需安排救援拖車服務。\n                                    ")}</div>
<div className="flex gap-2"><RimoElement kind="el-button" type="danger" size="small" className="flex-1">{text("安排救援")}</RimoElement>
<RimoElement kind="el-button" plain={true} size="small" className="flex-1">{text("聯繫保險")}</RimoElement></div></div>
<div className="border border-amber-100 bg-gradient-to-br from-amber-50/60 to-white rounded-xl p-4 hover:shadow-md transition-shadow relative group"><div className="absolute right-3 top-3"><RimoElement kind="el-tag" size="small" type="warning" effect="plain">{text("車況異常")}</RimoElement></div>
<div className="flex items-center gap-3 mb-3 mt-1"><div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600"><RimoElement kind="el-icon" className="text-xl"><RimoIcon name="PictureRounded" /></RimoElement></div>
<div className="flex-1"><div className="text-sm font-bold text-gray-800">{text("車況異常反饋待審覈")}</div>
<div className="text-xs text-gray-500 mt-0.5">{text("訂單: ZT24050500003 | 2024/05/05\n                                                11:11")}</div></div></div>
<div className="text-sm text-gray-600 mb-4 bg-white p-2 border border-gray-100 rounded text-xs">{text("\n                                        ZT24050500003, [車況異常反饋] 客戶在取車環節上傳了車輛剮蹭照片，請人工審覈定損單！\n                                    ")}</div>
<div className="flex gap-2"><RimoElement kind="el-button" type="warning" plain={true} size="small" className="flex-1">{text("審覈定損")}</RimoElement>
<RimoElement kind="el-button" plain={true} size="small" className="flex-1">{text("查看照片")}</RimoElement></div></div>
<div className="border border-yellow-100 bg-gradient-to-br from-yellow-50/60 to-white rounded-xl p-4 hover:shadow-md transition-shadow relative group"><div className="absolute right-3 top-3"><RimoElement kind="el-tag" size="small" type="warning" effect="plain">{text("管控中")}</RimoElement></div>
<div className="flex items-center gap-3 mb-3 mt-1"><div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-600"><RimoElement kind="el-icon" className="text-xl"><RimoIcon name="Lightning" /></RimoElement></div>
<div className="flex-1"><div className="text-sm font-bold text-gray-800">{text("車輛電壓低自動管控")}</div>
<div className="text-xs text-gray-500 mt-0.5">{text("車輛: RDC-1234 | 2024/05/05 11:11\n                                            ")}</div></div></div>
<div className="text-sm text-gray-600 mb-4 bg-white p-2 border border-gray-100 rounded text-xs">{text("\n                                        RDC-1234, 車輛電壓較低，已自動管控3天(單號GC889)，管控內有5筆訂單待處理！\n                                    ")}</div>
<div className="flex gap-2"><RimoElement kind="el-button" type="warning" plain={true} size="small" className="flex-1">{text("查看管控")}</RimoElement>
<RimoElement kind="el-button" plain={true} size="small" className="flex-1">{text("處理訂單")}</RimoElement></div></div>
<div className="border border-red-100 bg-gradient-to-br from-red-50/60 to-white rounded-xl p-4 hover:shadow-md transition-shadow relative group"><div className="absolute right-3 top-3"><RimoElement kind="el-tag" size="small" type="danger" effect="plain">{text("掉線")}</RimoElement></div>
<div className="flex items-center gap-3 mb-3 mt-1"><div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600"><RimoElement kind="el-icon" className="text-xl"><RimoIcon name="Connection" /></RimoElement></div>
<div className="flex-1"><div className="text-sm font-bold text-gray-800">{text("車機掉線自動管控")}</div>
<div className="text-xs text-gray-500 mt-0.5">{text("車輛: RDC-1234 | 2024/05/05 11:11\n                                            ")}</div></div></div>
<div className="text-sm text-gray-600 mb-4 bg-white p-2 border border-gray-100 rounded text-xs">{text("\n                                        RDC-1234, 車輛車機掉線，已自動管控1天(單號GC890)，管控內有5筆訂單待處理！\n                                    ")}</div>
<div className="flex gap-2"><RimoElement kind="el-button" type="danger" plain={true} size="small" className="flex-1">{text("查看管控")}</RimoElement>
<RimoElement kind="el-button" plain={true} size="small" className="flex-1">{text("聯繫維保")}</RimoElement></div></div>
<div className="border border-emerald-100 bg-gradient-to-br from-emerald-50/60 to-white rounded-xl p-4 hover:shadow-md transition-shadow relative group"><div className="absolute right-3 top-3"><RimoElement kind="el-tag" size="small" type="success" effect="plain">{text("已恢復")}</RimoElement></div>
<div className="flex items-center gap-3 mb-3 mt-1"><div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600"><RimoElement kind="el-icon" className="text-xl"><RimoIcon name="CircleCheck" /></RimoElement></div>
<div className="flex-1"><div className="text-sm font-bold text-gray-800">{text("車機恢復在線")}</div>
<div className="text-xs text-gray-500 mt-0.5">{text("車輛: RDC-1234 | 2024/05/05 11:11\n                                            ")}</div></div></div>
<div className="text-sm text-gray-600 mb-4 bg-white p-2 border border-gray-100 rounded text-xs">{text("\n                                        RDC-1234, 車機恢復在線，已自動解除管控(單號GC889)！\n                                    ")}</div>
<div className="flex gap-2"><RimoElement kind="el-button" type="success" plain={true} size="small" className="flex-1">{text("解除複覈")}</RimoElement>
<RimoElement kind="el-button" plain={true} size="small" className="flex-1">{text("查看記錄")}</RimoElement></div></div>
<div className="border border-red-100 bg-gradient-to-br from-red-50/60 to-white rounded-xl p-4 hover:shadow-md transition-shadow relative group"><div className="absolute right-3 top-3"><RimoElement kind="el-tag" size="small" type="danger" effect="plain">{text("需尋車")}</RimoElement></div>
<div className="flex items-center gap-3 mb-3 mt-1"><div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600"><RimoElement kind="el-icon" className="text-xl"><RimoIcon name="Location" /></RimoElement></div>
<div className="flex-1"><div className="text-sm font-bold text-gray-800">{text("定位長時間無上報")}</div>
<div className="text-xs text-gray-500 mt-0.5">{text("車輛: RDC-1234 | 2024/05/05 11:11\n                                            ")}</div></div></div>
<div className="text-sm text-gray-600 mb-4 bg-white p-2 border border-gray-100 rounded text-xs">{text("\n                                        RDC-1234, 車輛已超過1小時無最新定位上報，請指派尋車！\n                                    ")}</div>
<div className="flex gap-2"><RimoElement kind="el-button" type="danger" size="small" className="flex-1">{text("指派尋車")}</RimoElement>
<RimoElement kind="el-button" plain={true} size="small" className="flex-1">{text("查看軌跡")}</RimoElement></div></div>
<div className="border border-red-100 bg-gradient-to-br from-red-50/60 to-white rounded-xl p-4 hover:shadow-md transition-shadow relative group"><div className="absolute right-3 top-3"><RimoElement kind="el-tag" size="small" type="danger" effect="plain">{text("疑似故障")}</RimoElement></div>
<div className="flex items-center gap-3 mb-3 mt-1"><div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600"><RimoElement kind="el-icon" className="text-xl"><RimoIcon name="WarningFilled" /></RimoElement></div>
<div className="flex-1"><div className="text-sm font-bold text-gray-800">{text("車機異常斷電")}</div>
<div className="text-xs text-gray-500 mt-0.5">{text("車輛: RDC-1234 | 2024/05/05 11:11\n                                            ")}</div></div></div>
<div className="text-sm text-gray-600 mb-4 bg-white p-2 border border-gray-100 rounded text-xs">{text("\n                                        RDC-1234, 車機發生異常斷電，疑似蓄電池故障，請指派維保！\n                                    ")}</div>
<div className="flex gap-2"><RimoElement kind="el-button" type="danger" plain={true} size="small" className="flex-1">{text("指派維保")}</RimoElement>
<RimoElement kind="el-button" plain={true} size="small" className="flex-1">{text("查看電池")}</RimoElement></div></div></div>
<div className="p-5 pt-2 grid grid-cols-2 gap-4 todo-panel custom-scroll" hidden={!(view.todoTab === 'dispatch')} style={rimoStyle("display: none;")}><div className="border border-blue-100 bg-gradient-to-br from-blue-50/50 to-white rounded-xl p-4 hover:shadow-md transition-shadow relative group"><div className="flex items-center gap-3 mb-3 mt-1"><div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600"><RimoElement kind="el-icon" className="text-xl"><RimoIcon name="Van" /></RimoElement></div>
<div className="flex-1"><div className="text-sm font-bold text-gray-800">{text("人工調度確認")}</div>
<div className="text-xs text-gray-500 mt-0.5">{text("門店: 虹橋高鐵站店 | 1小時前")}</div></div></div>
<div className="text-sm text-gray-600 mb-4 bg-white p-2 border border-gray-100 rounded text-xs">{text("\n                                        虹橋高鐵站店週末預訂高峯，需要確認本店可交付車輛和人工派車方案。\n                                    ")}</div>
<div className="flex gap-2"><RimoElement kind="el-popconfirm" title="確認採用此人工調度方案？" confirmButtonText="確認方案" cancelButtonText="取消" width="220" onConfirm={_event => {
                      view.feedbackMessage.success('已確認調度方案');
                    }} slots={{
                      "reference": _slot => <><RimoElement kind="el-button" type="primary" size="small" className="flex-1">{text("確認方案")}</RimoElement></>
                    }}></RimoElement>
<RimoElement kind="el-button" plain={true} size="small" className="flex-1">{text("查看庫存")}</RimoElement></div></div>
<div className="border border-red-100 bg-gradient-to-br from-red-50/50 to-white rounded-xl p-4 hover:shadow-md transition-shadow relative group"><div className="absolute right-3 top-3"><RimoElement kind="el-tag" size="small" type="danger" effect="plain">{text("緊急")}</RimoElement></div>
<div className="flex items-center gap-3 mb-3 mt-1"><div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600"><RimoElement kind="el-icon" className="text-xl"><RimoIcon name="Brush" /></RimoElement></div>
<div className="flex-1"><div className="text-sm font-bold text-gray-800">{text("交車整備告警")}</div>
<div className="text-xs text-gray-500 mt-0.5">{text("車牌: 滬A·12345 | 距離交車: 2小時")}</div></div></div>
<div className="text-sm text-gray-600 mb-4 bg-white p-2 border border-gray-100 rounded text-xs">{text("\n                                        待交付車輛尚未錄入洗車整備記錄，即將超期，請催促整備專員完成作業。\n                                    ")}</div>
<div className="flex gap-2"><RimoElement kind="el-button" type="danger" plain={true} size="small" className="flex-1">{text("下發催辦")}</RimoElement>
<RimoElement kind="el-button" plain={true} size="small" className="flex-1">{text("轉交他人")}</RimoElement></div></div>
<div className="border border-blue-100 bg-gradient-to-br from-blue-50/60 to-white rounded-xl p-4 hover:shadow-md transition-shadow relative group"><div className="flex items-center gap-3 mb-3 mt-1"><div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600"><RimoElement kind="el-icon" className="text-xl"><RimoIcon name="Setting" /></RimoElement></div>
<div className="flex-1"><div className="text-sm font-bold text-gray-800">{text("保養里程達標")}</div>
<div className="text-xs text-gray-500 mt-0.5">{text("車輛: RDC-1234 | 2024/05/05 11:11\n                                            ")}</div></div></div>
<div className="text-sm text-gray-600 mb-4 bg-white p-2 border border-gray-100 rounded text-xs">{text("\n                                        RDC-1234, 車輛已達到預設保養里程 (50,000km)，請安排進廠維保！\n                                    ")}</div>
<div className="flex gap-2"><RimoElement kind="el-button" type="primary" size="small" className="flex-1">{text("安排進廠")}</RimoElement>
<RimoElement kind="el-button" plain={true} size="small" className="flex-1">{text("查看檔案")}</RimoElement></div></div>
<div className="border border-[color:var(--app-color-primary-light-8)] bg-gradient-to-br from-[color:var(--app-color-primary-light-9)] to-white rounded-xl p-4 hover:shadow-md transition-shadow relative group"><div className="flex items-center gap-3 mb-3 mt-1"><div className="w-10 h-10 rounded-full bg-[color:var(--app-color-primary-light-8)] flex items-center justify-center text-[color:var(--app-color-primary)]"><RimoElement kind="el-icon" className="text-xl"><RimoIcon name="Calendar" /></RimoElement></div>
<div className="flex-1"><div className="text-sm font-bold text-gray-800">{text("年度保養到期")}</div>
<div className="text-xs text-gray-500 mt-0.5">{text("車輛: RDC-1234 | 2024/05/05 11:11\n                                            ")}</div></div></div>
<div className="text-sm text-gray-600 mb-4 bg-white p-2 border border-gray-100 rounded text-xs">{text("\n                                        RDC-1234, 車輛已達到預設年度保養時間，請安排進廠維保！\n                                    ")}</div>
<div className="flex gap-2"><RimoElement kind="el-button" type="primary" plain={true} size="small" className="flex-1">{text("安排保養")}</RimoElement>
<RimoElement kind="el-button" plain={true} size="small" className="flex-1">{text("查看計劃")}</RimoElement></div></div>
<div className="border border-[color:var(--app-color-primary-light-8)] bg-gradient-to-br from-[color:var(--app-color-primary-light-9)] to-white rounded-xl p-4 hover:shadow-md transition-shadow relative group"><div className="flex items-center gap-3 mb-3 mt-1"><div className="w-10 h-10 rounded-full bg-[color:var(--app-color-primary-light-8)] flex items-center justify-center text-[color:var(--app-color-primary)]"><RimoElement kind="el-icon" className="text-xl"><RimoIcon name="Stamp" /></RimoElement></div>
<div className="flex-1"><div className="text-sm font-bold text-gray-800">{text("年檢臨期預警")}</div>
<div className="text-xs text-gray-500 mt-0.5">{text("剩餘: 7天 | 共3臺車")}</div></div></div>
<div className="text-sm text-gray-600 mb-4 bg-white p-2 border border-gray-100 rounded text-xs">{text("\n                                        檢測到有一批公牌營運車輛年檢即將到期，請儘快發派代理公司辦理全部年檢手續。\n                                    ")}</div>
<div className="flex gap-2"><RimoElement kind="el-button" type="primary" plain={true} size="small" className="flex-1">{text("查看車輛批次")}</RimoElement>
<RimoElement kind="el-button" plain={true} size="small" className="flex-1">{text("指派代辦")}</RimoElement></div></div>
<div className="border border-green-100 bg-gradient-to-br from-green-50/60 to-white rounded-xl p-4 hover:shadow-md transition-shadow relative group"><div className="flex items-center gap-3 mb-3 mt-1"><div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600"><RimoElement kind="el-icon" className="text-xl"><RimoIcon name="Brush" /></RimoElement></div>
<div className="flex-1"><div className="text-sm font-bold text-gray-800">{text("深度清潔任務")}</div>
<div className="text-xs text-gray-500 mt-0.5">{text("車輛: RDC-1234 | 2024/05/05 11:11\n                                            ")}</div></div></div>
<div className="text-sm text-gray-600 mb-4 bg-white p-2 border border-gray-100 rounded text-xs">{text("\n                                        RDC-1234, 累計租借達5次，已觸發深度清潔任務指標，請安排！\n                                    ")}</div>
<div className="flex gap-2"><RimoElement kind="el-button" type="success" plain={true} size="small" className="flex-1">{text("安排清潔")}</RimoElement>
<RimoElement kind="el-button" plain={true} size="small" className="flex-1">{text("查看記錄")}</RimoElement></div></div>
<div className="border border-emerald-100 bg-gradient-to-br from-emerald-50/60 to-white rounded-xl p-4 hover:shadow-md transition-shadow relative group"><div className="flex items-center gap-3 mb-3 mt-1"><div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600"><RimoElement kind="el-icon" className="text-xl"><RimoIcon name="Brush" /></RimoElement></div>
<div className="flex-1"><div className="text-sm font-bold text-gray-800">{text("日常清潔觸發")}</div>
<div className="text-xs text-gray-500 mt-0.5">{text("車輛: RDC-1234 | 2024/05/05 11:11\n                                            ")}</div></div></div>
<div className="text-sm text-gray-600 mb-4 bg-white p-2 border border-gray-100 rounded text-xs">{text("\n                                        RDC-1234, 結束跨城長單，已觸發日常小清潔指標，請安排！\n                                    ")}</div>
<div className="flex gap-2"><RimoElement kind="el-button" type="success" plain={true} size="small" className="flex-1">{text("安排清潔")}</RimoElement>
<RimoElement kind="el-button" plain={true} size="small" className="flex-1">{text("查看訂單")}</RimoElement></div></div>
<div className="border border-orange-100 bg-gradient-to-br from-orange-50/60 to-white rounded-xl p-4 hover:shadow-md transition-shadow relative group"><div className="absolute right-3 top-3"><RimoElement kind="el-tag" size="small" type="warning" effect="plain">{text("停車超時")}</RimoElement></div>
<div className="flex items-center gap-3 mb-3 mt-1"><div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600"><RimoElement kind="el-icon" className="text-xl"><RimoIcon name="Location" /></RimoElement></div>
<div className="flex-1"><div className="text-sm font-bold text-gray-800">{text("停車超時提醒")}</div>
<div className="text-xs text-gray-500 mt-0.5">{text("車輛: RDC-1234 | 2024/05/05 11:11\n                                            ")}</div></div></div>
<div className="text-sm text-gray-600 mb-4 bg-white p-2 border border-gray-100 rounded text-xs">{text("\n                                        RDC-1234, 停靠在臺北內湖VIP庫已達6小時未動，請確認是否移庫！\n                                    ")}</div>
<div className="flex gap-2"><RimoElement kind="el-button" type="warning" plain={true} size="small" className="flex-1">{text("確認移庫")}</RimoElement>
<RimoElement kind="el-button" plain={true} size="small" className="flex-1">{text("查看位置")}</RimoElement></div></div>
<div className="border border-red-100 bg-gradient-to-br from-red-50/60 to-white rounded-xl p-4 hover:shadow-md transition-shadow relative group"><div className="absolute right-3 top-3"><RimoElement kind="el-tag" size="small" type="danger" effect="plain">{text("預警")}</RimoElement></div>
<div className="flex items-center gap-3 mb-3 mt-1"><div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600"><RimoElement kind="el-icon" className="text-xl"><RimoIcon name="Warning" /></RimoElement></div>
<div className="flex-1"><div className="text-sm font-bold text-gray-800">{text("網點車位預警")}</div>
<div className="text-xs text-gray-500 mt-0.5">{text("網點: 重慶江北T3 | 2024/05/05 11:11\n                                            ")}</div></div></div>
<div className="text-sm text-gray-600 mb-4 bg-white p-2 border border-gray-100 rounded text-xs">{text("\n                                        [預警] 重慶江北T3網點，已停入12輛車，剩餘0車位，即將引發還車阻塞！\n                                    ")}</div>
<div className="flex gap-2"><RimoElement kind="el-button" type="danger" plain={true} size="small" className="flex-1">{text("安排移庫")}</RimoElement>
<RimoElement kind="el-button" plain={true} size="small" className="flex-1">{text("查看網點")}</RimoElement></div></div></div>
<div className="p-5 pt-2 grid grid-cols-2 gap-4 todo-panel custom-scroll" hidden={!(view.todoTab === 'overdue')} style={rimoStyle("display: none;")}><div className="border border-red-100 bg-gradient-to-br from-red-50/60 to-white rounded-xl p-4 hover:shadow-md transition-shadow relative group"><div className="absolute right-3 top-3"><RimoElement kind="el-tag" size="small" type="danger" effect="plain">{text("嚴重逾期")}</RimoElement></div>
<div className="flex items-center gap-3 mb-3 mt-1"><div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600"><RimoElement kind="el-icon" className="text-xl"><RimoIcon name="Timer" /></RimoElement></div>
<div className="flex-1"><div className="text-sm font-bold text-gray-800">{text("訂單嚴重逾期")}</div>
<div className="text-xs text-gray-500 mt-0.5">{text("訂單: ZT24050500001 | 2024/05/05\n                                                11:11")}</div></div></div>
<div className="text-sm text-gray-600 mb-4 bg-white p-2 border border-gray-100 rounded text-xs">{text("\n                                        ZT24050500001, [嚴重逾期] 車輛已超過預計還車時間 2小時，多次聯繫客戶未果，請調度介入！\n                                    ")}</div>
<div className="flex gap-2"><RimoElement kind="el-button" type="danger" size="small" className="flex-1">{text("指派調度")}</RimoElement>
<RimoElement kind="el-button" plain={true} size="small" className="flex-1">{text("查看訂單")}</RimoElement></div></div>
<div className="border border-blue-100 bg-gradient-to-br from-blue-50/60 to-white rounded-xl p-4 hover:shadow-md transition-shadow relative group"><div className="absolute right-3 top-3"><RimoElement kind="el-tag" size="small" type="info" effect="plain">{text("輕微逾期")}</RimoElement></div>
<div className="flex items-center gap-3 mb-3 mt-1"><div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600"><RimoElement kind="el-icon" className="text-xl"><RimoIcon name="Timer" /></RimoElement></div>
<div className="flex-1"><div className="text-sm font-bold text-gray-800">{text("訂單輕微逾期")}</div>
<div className="text-xs text-gray-500 mt-0.5">{text("訂單: ZT24050500001 | 2024/05/05\n                                                11:11")}</div></div></div>
<div className="text-sm text-gray-600 mb-4 bg-white p-2 border border-gray-100 rounded text-xs">{text("\n                                        ZT24050500001, [輕微逾期] 車輛已超過預計還車時間 15分鐘，請注意跟進客戶狀態。\n                                    ")}</div>
<div className="flex gap-2"><RimoElement kind="el-button" type="primary" plain={true} size="small" className="flex-1">{text("提醒客戶")}</RimoElement>
<RimoElement kind="el-button" plain={true} size="small" className="flex-1">{text("查看訂單")}</RimoElement></div></div>
<div className="border border-orange-100 bg-gradient-to-br from-orange-50/60 to-white rounded-xl p-4 hover:shadow-md transition-shadow relative group"><div className="absolute right-3 top-3"><RimoElement kind="el-tag" size="small" type="warning" effect="plain">{text("中度逾期")}</RimoElement></div>
<div className="flex items-center gap-3 mb-3 mt-1"><div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600"><RimoElement kind="el-icon" className="text-xl"><RimoIcon name="Timer" /></RimoElement></div>
<div className="flex-1"><div className="text-sm font-bold text-gray-800">{text("訂單中度逾期")}</div>
<div className="text-xs text-gray-500 mt-0.5">{text("訂單: ZT24050500001 | 2024/05/05\n                                                11:11")}</div></div></div>
<div className="text-sm text-gray-600 mb-4 bg-white p-2 border border-gray-100 rounded text-xs">{text("\n                                        ZT24050500001, [中度逾期] 車輛已超過預計還車時間 1小時，已自動發送扣費提醒短信。\n                                    ")}</div>
<div className="flex gap-2"><RimoElement kind="el-button" type="warning" plain={true} size="small" className="flex-1">{text("跟進客戶")}</RimoElement>
<RimoElement kind="el-button" plain={true} size="small" className="flex-1">{text("查看短信")}</RimoElement></div></div>
<div className="border border-green-100 bg-gradient-to-br from-green-50/60 to-white rounded-xl p-4 hover:shadow-md transition-shadow relative group"><div className="absolute right-3 top-3"><RimoElement kind="el-tag" size="small" type="success" effect="plain">{text("即將逾期")}</RimoElement></div>
<div className="flex items-center gap-3 mb-3 mt-1"><div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600"><RimoElement kind="el-icon" className="text-xl"><RimoIcon name="Timer" /></RimoElement></div>
<div className="flex-1"><div className="text-sm font-bold text-gray-800">{text("訂單即將逾期")}</div>
<div className="text-xs text-gray-500 mt-0.5">{text("訂單: ZT24050500002 | 2024/05/05\n                                                11:11")}</div></div></div>
<div className="text-sm text-gray-600 mb-4 bg-white p-2 border border-gray-100 rounded text-xs">{text("\n                                        ZT24050500002, [即將逾期] 車輛距離預計還車時間僅剩 30分鐘，系統已預觸發還車節點。\n                                    ")}</div>
<div className="flex gap-2"><RimoElement kind="el-button" type="success" plain={true} size="small" className="flex-1">{text("提前提醒")}</RimoElement>
<RimoElement kind="el-button" plain={true} size="small" className="flex-1">{text("查看訂單")}</RimoElement></div></div>
<div className="border border-red-100 bg-gradient-to-br from-red-50/50 to-white rounded-xl p-4 hover:shadow-md transition-shadow relative group"><div className="absolute right-3 top-3"><RimoElement kind="el-tag" size="small" type="danger" effect="plain">{text("超期2天")}</RimoElement></div>
<div className="flex items-center gap-3 mb-3 mt-1"><div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600"><RimoElement kind="el-icon" className="text-xl"><RimoIcon name="Timer" /></RimoElement></div>
<div className="flex-1"><div className="text-sm font-bold text-gray-800">{text("車輛超期未還")}</div>
<div className="text-xs text-gray-500 mt-0.5">{text("車牌: 蘇A·66666 | 訂單: R-0033")}</div></div></div>
<div className="text-sm text-gray-600 mb-4 bg-white p-2 border border-gray-100 rounded text-xs">{text("\n                                        應還時間 6月3日 18:00，已超期聯繫不上客戶，需立案啓動風控尋車。\n                                    ")}</div>
<div className="flex gap-2"><RimoElement kind="el-button" type="danger" size="small" className="flex-1">{text("啓動尋車")}</RimoElement>
<RimoElement kind="el-button" plain={true} size="small" className="flex-1">{text("催收記錄")}</RimoElement></div></div>
<div className="border border-orange-100 bg-gradient-to-br from-orange-50/50 to-white rounded-xl p-4 hover:shadow-md transition-shadow relative group"><div className="absolute right-3 top-3"><RimoElement kind="el-tag" size="small" type="warning" effect="plain">{text("逾期5天")}</RimoElement></div>
<div className="flex items-center gap-3 mb-3 mt-1"><div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600"><RimoElement kind="el-icon" className="text-xl"><RimoIcon name="DocumentDelete" /></RimoElement></div>
<div className="flex-1"><div className="text-sm font-bold text-gray-800">{text("企業賬單逾期")}</div>
<div className="text-xs text-gray-500 mt-0.5">{text("客戶: 特斯拉 | 賬期: 5月")}</div></div></div>
<div className="text-sm text-gray-600 mb-4 bg-white p-2 border border-gray-100 rounded text-xs">{text("\n                                        5月對賬結算單 152,000元 逾期未支付，系統已暫停新單配額白名單。\n                                    ")}</div>
<div className="flex gap-2"><RimoElement kind="el-button" type="warning" plain={true} size="small" className="flex-1">{text("發送催繳單")}</RimoElement>
<RimoElement kind="el-button" plain={true} size="small" className="flex-1">{text("線下電聯溝通")}</RimoElement></div></div></div></div>
<div className="bg-white rounded-2xl p-5 card-shadow flex-1"><div className="flex items-center justify-between mb-4"><h3 className="font-bold text-gray-800 flex items-center"><span className="w-1 h-4 bg-[color:var(--app-color-primary)] rounded-full mr-2"></span>
{text("\n                                    今日排車日程 (")}{rimoText(view.scheduleDate)}{text(" ")}{rimoText(view.weekDay)}{text(")\n                                ")}</h3>
<div className="flex gap-2"><RimoElement kind="el-button" size="small" circle={true} icon="ArrowLeft"></RimoElement>
<RimoElement kind="el-button" size="small" plain={true}>{text("今天")}</RimoElement>
<RimoElement kind="el-button" size="small" circle={true} icon="ArrowRight"></RimoElement></div></div>
<div className="grid grid-cols-4 gap-2 h-[180px]"><div className="bg-gray-50 rounded-lg p-2 flex flex-col"><div className="text-xs font-bold text-gray-400 text-center mb-2 pb-2 border-b">{text("08:00 -\n                                        12:00")}</div>
<div className="space-y-2 overflow-y-auto custom-scroll flex-1 pr-1"><div className="bg-blue-100/50 border-l-4 border-blue-500 p-2 rounded text-xs cursor-pointer hover:bg-blue-100"><div className="font-bold text-blue-700">{text("交車 10臺")}</div>
<div className="text-gray-500 mt-1">{text("2024年度商務用...")}</div>
<div className="text-gray-400 mt-1">{text("09:30 虹橋店")}</div></div>
<div className="bg-green-100/50 border-l-4 border-green-500 p-2 rounded text-xs cursor-pointer hover:bg-green-100"><div className="font-bold text-green-700">{text("還車 3臺")}</div>
<div className="text-gray-500 mt-1">{text("個人短租散單")}</div>
<div className="text-gray-400 mt-1">{text("11:00 市區店")}</div></div></div></div>
<div className="bg-gray-50 rounded-lg p-2 flex flex-col"><div className="text-xs font-bold text-gray-400 text-center mb-2 pb-2 border-b">{text("12:00 -\n                                        14:00")}</div>
<div className="space-y-2 overflow-y-auto custom-scroll flex-1 pr-1"><div className="bg-orange-100/50 border-l-4 border-orange-500 p-2 rounded text-xs cursor-pointer hover:bg-orange-100"><div className="font-bold text-orange-700">{text("維保接車 2臺")}</div>
<div className="text-gray-500 mt-1">{text("定期小保養")}</div>
<div className="text-gray-400 mt-1">{text("13:30 維修廠")}</div></div></div></div>
<div className="bg-gray-50 rounded-lg p-2 flex flex-col"><div className="text-xs font-bold text-gray-400 text-center mb-2 pb-2 border-b">{text("14:00 -\n                                        18:00")}</div>
<div className="space-y-2 overflow-y-auto custom-scroll flex-1 pr-1"><div className="bg-[color:var(--app-color-primary-light-8)] border-l-4 border-[color:var(--app-color-primary)] p-2 rounded text-xs cursor-pointer hover:bg-[color:var(--app-color-primary-light-8)]"><div className="font-bold text-[color:var(--app-color-primary-hover)]">{text("調派接車 5臺")}</div>
<div className="text-gray-500 mt-1">{text("新購微型電車入庫")}</div>
<div className="text-gray-400 mt-1">{text("15:00 總倉")}</div></div>
<div className="bg-red-100/50 border-l-4 border-red-500 p-2 rounded text-xs cursor-pointer hover:bg-red-100"><div className="font-bold text-red-700">{text("事故定損 1臺")}</div>
<div className="text-gray-500 mt-1">{text("保險公司現場覈驗")}</div>
<div className="text-gray-400 mt-1">{text("16:30 虹橋店")}</div></div></div></div>
<div className="bg-gray-50 rounded-lg p-2 flex flex-col"><div className="text-xs font-bold text-gray-400 text-center mb-2 pb-2 border-b">{text("18:00 -\n                                        24:00")}</div>
<div className="space-y-2 overflow-y-auto custom-scroll flex-1 pr-1"><div className="flex items-center justify-center h-full text-xs text-gray-300">{text("\n                                            暫無日程安排")}</div></div></div></div></div></div>
<div className="xl:w-[25%] space-y-6 flex flex-col min-w-0"><RimoElement kind="el-carousel" height="160px" interval={5000} arrow="hover" indicatorPosition="none" className="rounded-2xl overflow-hidden card-shadow">{rimoEntries(view.banners).map(([banner, idx], _itemIndex) => <Fragment key={idx}><RimoElement kind="el-carousel-item" key={idx}><div className={rimoClass([rimoClass('bg-gradient-to-r ' + banner.gradient), "rounded-2xl p-6 text-white relative overflow-hidden group cursor-pointer hover:shadow-lg transition-all h-full"])}><div className="relative z-10"><h3 className="text-lg font-bold mb-2 break-all group-hover:-translate-y-1 transition-transform">{text("\n                                            ")}{rimoText(banner.title)}</h3>
<p className="text-xs text-white/80 leading-relaxed mb-4 group-hover:-translate-y-1 transition-transform delay-75 line-clamp-2">{text("\n                                            ")}{rimoText(banner.desc)}</p>
<RimoElement kind="el-button" round={true} size="small" className="bg-white/20 border-white/30 text-white hover:bg-white hover:text-gray-800 transition-colors">{rimoText(banner.btnText)}</RimoElement></div>
<div className="absolute -right-8 -bottom-8 w-32 h-32 rounded-full bg-white/10 blur-xl"></div>
<div className="absolute -left-4 -top-4 w-24 h-24 rounded-full bg-white/20 blur-xl"></div>
<div className="absolute right-2 top-4 text-7xl opacity-10 group-hover:scale-110 transition-transform group-hover:rotate-12 duration-500"><RimoElement kind="el-icon"><RimoIcon name={banner.icon} /></RimoElement></div></div></RimoElement></Fragment>)}</RimoElement>
<div className="bg-white rounded-2xl p-5 card-shadow flex-1"><div className="flex items-center justify-between mb-5"><h3 className="font-bold text-gray-800 flex items-center"><span className="w-1 h-4 bg-teal-500 rounded-full mr-2"></span>
{text("\n                                    業務支撐模塊\n                                ")}</h3>
<div className="flex gap-2"><RimoElement kind="el-button" circle={true} size="small" icon="Setting" onClick={_event => {
                    model.write(["settingDialogVisible"], true);
                  }} title="自定義模塊佈局"></RimoElement>
<a href="#" className="text-xs text-gray-400 hover:text-[color:var(--app-color-primary)] leading-loose">{text("更多應用\n                                        >")}</a></div></div>
<div className="grid grid-cols-3 gap-y-6 gap-x-2">{rimoEntries(view.selectedApps).map(([app], _itemIndex) => <Fragment key={app.id}><a key={app.id} href={app.href} className="flex flex-col items-center cursor-pointer group" style={rimoStyle("text-decoration: none;")}><div className={rimoClass(["w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center mb-2 group-hover:shadow-md group-hover:-translate-y-1 transition-all", rimoClass(app.color)])}><RimoElement kind="el-icon" className="text-2xl"><RimoIcon name={app.icon} /></RimoElement></div>
<span className="text-xs text-gray-600 font-medium">{rimoText(app.name)}</span></a></Fragment>)}
{view.selectedApps.length === 0 ? <><div className="col-span-3 text-xs text-gray-400 text-center py-4">{text("\n                                    暫無模塊，請點擊右上角齒輪進行配置。\n                                ")}</div></> : null}</div>
<div className="mt-8 border-t border-dashed border-gray-200 pt-4"><div className="text-xs text-gray-400 mb-3 font-medium">{text("最近訪問")}</div>
<div className="flex gap-2 flex-wrap">{rimoEntries(view.recentPages).map(([page], _itemIndex) => <Fragment key={page.href}><a key={page.href} href={page.href} style={rimoStyle("text-decoration: none;")}><RimoElement kind="el-tag" size="small" type="info" className="cursor-pointer hover:bg-gray-200">{rimoText(page.name)}</RimoElement></a></Fragment>)}</div></div></div></div></div></div></div><RimoElement kind="el-dialog" modelValue={view.todoDialogVisible} onModelChange={value => {
      model.write(["todoDialogVisible"], value);
    }} width="980px" className="todo-dialog workbench-overlay" appendToBody={true} slots={{
      "header": _slot => <><div className="flex items-center justify-between gap-3"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-[color:var(--app-color-primary-light-9)] text-[color:var(--app-color-primary)] flex items-center justify-center"><RimoElement kind="el-icon" className="text-xl"><RimoIcon name="List" /></RimoElement></div>
<div><div className="text-base font-semibold text-gray-800">{text("待辦事項總覽")}</div>
<div className="text-xs text-gray-500">{text("集中處理異常、調度與超期提醒")}</div></div></div>
<div className="flex items-center gap-2"><RimoElement kind="el-button" size="small" plain={true} onClick={_event => {
              model.write(["todoDialogTab"], 'all');
            }}>{text("重置篩選")}</RimoElement>
<RimoElement kind="el-button" size="small" type="primary" onClick={_event => {
              model.write(["todoDialogVisible"], false);
            }}>{text("標記已讀")}</RimoElement></div></div></>,
      "footer": _slot => <><span className="dialog-footer"><RimoElement kind="el-button" onClick={_event => {
            model.write(["todoDialogVisible"], false);
          }}>{text("關閉")}</RimoElement>
<RimoElement kind="el-button" type="primary" onClick={_event => {
            model.write(["todoDialogVisible"], false);
          }}>{text("完成處理")}</RimoElement></span></>
    }}>{() => <><div className="px-2 -mx-2"><RimoElement kind="el-tabs" modelValue={view.todoDialogTab} onModelChange={value => {
            model.write(["todoDialogTab"], value);
          }} className="workbench-tabs"><RimoElement kind="el-tab-pane" label={`全部 (${view.todoDialogCounts.all})`} name="all"></RimoElement>
<RimoElement kind="el-tab-pane" label={`待處理 (${view.todoDialogCounts.pending})`} name="pending"></RimoElement>
<RimoElement kind="el-tab-pane" label={`車況/車機異常 (${view.todoDialogCounts.exception})`} name="exception"></RimoElement>
<RimoElement kind="el-tab-pane" label={`調度/整備 (${view.todoDialogCounts.dispatch})`} name="dispatch"></RimoElement>
<RimoElement kind="el-tab-pane" label={`超期提醒 (${view.todoDialogCounts.overdue})`} name="overdue"></RimoElement></RimoElement></div>
<div className="mt-3 max-h-[520px] overflow-y-auto custom-scroll pr-1"><div className="grid grid-cols-2 gap-4">{rimoEntries(view.filteredTodoDialogItems).map(([item], _itemIndex) => <Fragment key={item.id}><div key={item.id} className="border border-gray-100 rounded-xl p-4 hover:shadow-md transition-shadow bg-white"><div className="flex items-start justify-between gap-3 mb-2"><div className="flex-1"><div className="flex items-center gap-2 flex-wrap"><span className="text-sm font-semibold text-gray-800">{rimoText(item.title)}</span>
{item.badge ? <><RimoElement kind="el-tag" size="small" type={item.badgeType} effect="plain">{rimoText(item.badge)}</RimoElement></> : null}</div>
<div className="text-xs text-gray-500 mt-1">{rimoText(item.meta)}</div></div></div>
<div className="text-xs text-gray-600 bg-gray-50 border border-gray-100 rounded p-2">{text("\n                                    ")}{rimoText(item.desc)}{text("\n                                ")}</div>
<div className="mt-3 flex gap-2"><RimoElement kind="el-button" size="small" type={item.primaryType || 'primary'} className="flex-1" onClick={_event => {
                    view.handleDialogAction(item.primaryAction, item);
                  }}>{rimoText(item.primaryAction)}</RimoElement>
<RimoElement kind="el-button" size="small" plain={true} className="flex-1" onClick={_event => {
                    view.handleDialogAction(item.secondaryAction, item);
                  }}>{rimoText(item.secondaryAction)}</RimoElement></div></div></Fragment>)}</div></div></>}</RimoElement>
<RimoElement kind="el-dialog" modelValue={view.announcementDialogVisible} onModelChange={value => {
      model.write(["announcementDialogVisible"], value);
    }} width="760px" className="announcement-dialog workbench-overlay" appendToBody={true} slots={{
      "header": _slot => <><div className="announcement-dialog-header"><div className="announcement-dialog-title">{text("更多公告")}</div>
<div className="announcement-dialog-sub">{text("共 ")}{rimoText(view.filteredAnnouncements.length)}{text(" 條公告")}</div></div></>,
      "footer": _slot => <><span className="dialog-footer"><RimoElement kind="el-button" onClick={_event => {
            model.write(["announcementDialogVisible"], false);
          }}>{text("關閉")}</RimoElement></span></>
    }}>{() => <><div className="announcement-search-wrap"><RimoElement kind="el-input" modelValue={view.announcementKeyword} onModelChange={value => {
            model.write(["announcementKeyword"], value);
          }} size="small" clearable={true} placeholder="搜索公告標題 / 內容 / 發佈人" className="w-full" slots={{
            "prefix": _slot => <><RimoElement kind="el-icon"><RimoIcon name="Search" /></RimoElement></>
          }}></RimoElement></div>
<div className="announcement-list-wrap custom-scroll">{rimoEntries(view.filteredAnnouncements).map(([item], _itemIndex) => <Fragment key={item.id}><div key={item.id} className="announcement-list-item" onClick={_event => {
              view.openAnnouncementDetail(item);
            }}><div className="announcement-list-title">{rimoText(item.title)}</div>
<div className="announcement-list-summary line-clamp-2">{rimoText(view.getAnnouncementPreview(item, 90))}</div>
<div className="announcement-list-meta">{rimoText(item.date)}{text(" | ")}{rimoText(item.publisher)}</div></div></Fragment>)}
{view.filteredAnnouncements.length === 0 ? <><div className="announcement-empty">{text("\n                            暫無符合條件的公告\n                        ")}</div></> : null}</div></>}</RimoElement>
<RimoElement kind="el-dialog" modelValue={view.announcementDetailVisible} onModelChange={value => {
      model.write(["announcementDetailVisible"], value);
    }} width="760px" className="announcement-detail-dialog workbench-overlay" appendToBody={true} slots={{
      "header": _slot => <><div className="announcement-dialog-header"><div className="announcement-dialog-title">{text("\n                                ")}{rimoText(view.activeAnnouncement ? view.activeAnnouncement.title : '公告詳情')}{text("\n                            ")}</div>
<div className="announcement-dialog-sub">{text("公告詳情")}</div></div></>,
      "footer": _slot => <><span className="dialog-footer"><RimoElement kind="el-button" onClick={_event => {
            model.write(["announcementDetailVisible"], false);
          }}>{text("關閉")}</RimoElement></span></>
    }}>{() => <>{view.activeAnnouncement ? <><div className="announcement-detail-content-box"><div className="announcement-detail-meta">{text("\n                            發佈時間 ")}{rimoText(view.activeAnnouncement.date)}{text(" | 發佈人 ")}{rimoText(view.activeAnnouncement.publisher)}{text("\n                        ")}</div>
<div className="announcement-detail-content">{text("\n                            ")}{rimoText(view.activeAnnouncement.content)}{text("\n                        ")}</div></div></> : <><div className="text-xs text-gray-400 py-4">{text("暫無公告詳情")}</div></>}</>}</RimoElement>
<RimoElement kind="el-dialog" modelValue={view.settingDialogVisible} onModelChange={value => {
      model.write(["settingDialogVisible"], value);
    }} title="自定義主頁應用模塊" width="640px" appendToBody={true} className="workbench-overlay" slots={{
      "footer": _slot => <><span className="dialog-footer"><RimoElement kind="el-button" onClick={_event => {
            model.write(["settingDialogVisible"], false);
          }}>{text("取消")}</RimoElement>
<RimoElement kind="el-button" type="primary" onClick={event => {
            view.saveAppSelection?.(event);
          }}>{text("保存配置")}</RimoElement></span></>
    }}>{() => <><div className="text-sm text-gray-500 mb-4">{text("您可以從系統應用池中，拖拽或勾選最多 8 個功能模塊到您的個人工作臺。")}</div>
<div className="bg-gray-50 border border-gray-200 rounded-xl p-3 mb-4"><div className="flex items-center justify-between mb-2"><div className="text-xs text-gray-500">{text("已選模塊 (")}{rimoText(view.selectedApps.length)}{text("/")}{rimoText(view.maxSelectedApps)}{text(")\n                            ")}</div>
<RimoElement kind="el-button" link={true} size="small" type="primary" onClick={event => {
              view.resetAppSelection?.(event);
            }}>{text("恢復默認")}</RimoElement></div>
{view.selectedApps.length ? <><div className="flex flex-wrap gap-2">{rimoEntries(view.selectedApps).map(([app], _itemIndex) => <Fragment key={app.id}><div key={app.id} className={rimoClass(["flex items-center gap-1.5 px-2 py-1.5 rounded-full border text-xs cursor-move transition", rimoClass(view.dragAppId === app.id ? 'border-[color:var(--app-color-primary)] bg-[color:var(--app-color-primary-light-9)]' : 'border-gray-200 bg-white')])} draggable="true" onDragStart={_event => {
                  view.handleDragStart(app.id);
                }} onDragOver={event => {
                  event.preventDefault();
                }} onDrop={_event => {
                  view.handleDrop(app.id);
                }} onDragEnd={event => {
                  view.handleDragEnd?.(event);
                }}><RimoElement kind="el-icon" className="text-sm text-[color:var(--app-color-primary)]"><RimoIcon name={app.icon} /></RimoElement>
<span className="text-gray-700">{rimoText(app.name)}</span>
<RimoElement kind="el-icon" className="text-sm text-gray-400 hover:text-red-500" onClick={event => {
                    event.stopPropagation();
                    view.removeApp(app.id);
                  }}><RimoIcon name="Close" /></RimoElement></div></Fragment>)}</div></> : <><div className="text-xs text-gray-400 py-2">{text("尚未選擇模塊。")}</div></>}</div>
<div><div className="text-xs text-gray-500 mb-3">{text("系統應用池")}</div>
<div className="grid grid-cols-2 gap-3">{rimoEntries(view.allApps).map(([app], _itemIndex) => <Fragment key={app.id}><div key={app.id} className={rimoClass(["flex items-center justify-between p-3 rounded-lg border cursor-pointer transition", rimoClass(view.selectedAppIds.includes(app.id) ? 'border-[color:var(--app-color-primary)] bg-[color:var(--app-color-primary-light-9)]' : 'border-gray-200 hover:border-gray-300')])} onClick={_event => {
                view.toggleAppSelection(app.id);
              }}><div className="flex items-center gap-3"><div className={rimoClass(["w-9 h-9 rounded-lg flex items-center justify-center", rimoClass(app.color)])}><RimoElement kind="el-icon" className="text-lg"><RimoIcon name={app.icon} /></RimoElement></div>
<div><div className="text-sm font-medium text-gray-700">{rimoText(app.name)}</div>
<div className="text-xs text-gray-400">{rimoText(app.category)}</div></div></div>
<RimoElement kind="el-checkbox" modelValue={view.selectedAppIds.includes(app.id)} onClick={event => {
                  event.stopPropagation();
                }} onChange={event => {
                  (val => view.toggleAppSelection(app.id, val))?.(event);
                }}></RimoElement></div></Fragment>)}</div></div></>}</RimoElement></RimoRoot>;
}