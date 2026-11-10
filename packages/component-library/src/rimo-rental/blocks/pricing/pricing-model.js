export default function createPageState(model) {
  const _document = model.document;
  const window = model.window;
  const _localStorage = model.storage;
  const _sessionStorage = model.storage;
  const _themeColor = () => model.theme();
  const _themeColorLight = (level) => model.theme(level);
  const _themeRGBA = (alpha) => model.themeAlpha(alpha);
  const feedback = {
    ElMessage: Object.assign((message) => model.notify('info', message), {
      success: (message) => model.notify('success', message),
      warning: (message) => model.notify('warning', message),
      error: (message) => model.notify('error', message),
      loading: (message) => ({
        close: model.notify('loading', message),
      }),
      info: (message) => model.notify('info', message),
    }),
    ElMessageBox: {
      confirm: (message, title) => model.confirm(message, title),
      alert: (message, title) => model.confirm(message, title),
    },
  };
  function pageSetup() {
    const { cell: ref, record: reactive, derived: computed } = model;
    const { ElMessage: _ElMessage, ElMessageBox: _ElMessageBox } = feedback;
    const activeTab = ref('STORE');
    const isModified = ref(false);
    const permissionDemoMode = ref('FULL');
    const permissionDemoOptions = [
      {
        label: '全部授權',
        value: 'FULL',
      },
      {
        label: '僅門市租賃',
        value: 'STORE_ONLY',
      },
      {
        label: '僅分時租賃',
        value: 'SHARING_BOTH',
      },
      {
        label: '分時僅同站',
        value: 'SHARING_SAME',
      },
      {
        label: '分時僅甲乙',
        value: 'SHARING_ONEWAY',
      },
    ];
    const currentTenant = ref({
      name: 'Full License (演示租戶)',
      permissions: ['STORE', 'SHARING', 'SHARING_ROUND', 'SHARING_ONEWAY'],
    });
    const currentTenantName = computed(() => currentTenant.value.name);
    const hasPermission = (perm) => {
      return currentTenant.value.permissions.includes(perm);
    };
    const hasStoreBusinessPermission = computed(() => hasPermission('STORE'));
    const hasSharingBusinessPermission = computed(() => hasPermission('SHARING'));
    const switchTenant = (mode) => {
      permissionDemoMode.value = mode;
      const tenantMap = {
        FULL: {
          name: '全部授權',
          permissions: ['STORE', 'SHARING', 'SHARING_ROUND', 'SHARING_ONEWAY'],
        },
        STORE_ONLY: {
          name: '僅門市租賃',
          permissions: ['STORE'],
        },
        SHARING_BOTH: {
          name: '僅分時租賃',
          permissions: ['SHARING', 'SHARING_ROUND', 'SHARING_ONEWAY'],
        },
        SHARING_SAME: {
          name: '分時僅同站租還',
          permissions: ['SHARING', 'SHARING_ROUND'],
        },
        SHARING_ONEWAY: {
          name: '分時僅甲租乙還',
          permissions: ['SHARING', 'SHARING_ONEWAY'],
        },
      };
      currentTenant.value = tenantMap[mode] || tenantMap.FULL;
      if (!hasPermission(activeTab.value)) {
        activeTab.value = hasPermission('STORE') ? 'STORE' : 'SHARING';
      }
    };
    const vehicleGroups = reactive([
      {
        id: 1,
        name: '經濟型轎車',
        models: 'Toyota Corolla, Honda Civic 等',
        dailyPrice: 280,
        originalPrice: 280,
        lastUpdated: '2025-10-01',
      },
      {
        id: 2,
        name: 'SUV組',
        models: 'Toyota RAV4, Honda CR-V 等',
        dailyPrice: 450,
        originalPrice: 450,
        lastUpdated: '2025-09-28',
      },
      {
        id: 3,
        name: '商務車組',
        models: 'Buick GL8, Honda Odyssey 等',
        dailyPrice: 800,
        originalPrice: 800,
        lastUpdated: '2025-10-05',
      },
      {
        id: 4,
        name: '豪華車組',
        models: 'BMW 5 Series, Mercedes E-Class 等',
        dailyPrice: 1200,
        originalPrice: 1200,
        lastUpdated: '2025-09-15',
      },
      {
        id: 5,
        name: '新能源組',
        models: 'Tesla Model 3, BYD Han 等',
        dailyPrice: 350,
        originalPrice: 350,
        lastUpdated: '2025-10-10',
      },
    ]);
    const isLocked = ref(true);
    const batchAdjustment = ref(0);
    const scheduledList = reactive([
      {
        effectiveTime: '2026-05-01 00:00:00',
        status: '已執行',
        summary: '五一假期旺季價格調整',
        changes: [],
      },
      {
        effectiveTime: '2026-10-01 00:00:00',
        status: '待執行',
        summary: '國慶假期旺季價格調整',
        changes: [],
      },
    ]);
    const storePriceVersions = reactive([
      {
        version: 'PRICE-STORE-20260418-001',
        title: '當前門市標準價',
        source: '手動保存',
        savedBy: '總部運營',
        savedAt: '2026-04-18 10:20',
        values: [
          {
            group: '經濟型轎車',
            models: 'Toyota Corolla, Honda Civic 等',
            dailyPrice: '¥280',
            mileage: '200km/天，超程 ¥2.0/km，不封頂',
            lastUpdated: '2026-04-18',
          },
          {
            group: 'SUV組',
            models: 'Toyota RAV4, Honda CR-V 等',
            dailyPrice: '¥450',
            mileage: '200km/天，超程 ¥2.0/km，不封頂',
            lastUpdated: '2026-04-18',
          },
          {
            group: '商務車組',
            models: 'Buick GL8, Honda Odyssey 等',
            dailyPrice: '¥800',
            mileage: '250km/天，超程 ¥3.0/km，不封頂',
            lastUpdated: '2026-04-18',
          },
          {
            group: '豪華車組',
            models: 'BMW 5 Series, Mercedes E-Class 等',
            dailyPrice: '¥1,200',
            mileage: '200km/天，超程 ¥4.0/km，不封頂',
            lastUpdated: '2026-04-18',
          },
          {
            group: '新能源組',
            models: 'Tesla Model 3, BYD Han 等',
            dailyPrice: '¥350',
            mileage: '200km/天，超程 ¥1.5/km，封頂 ¥300/天',
            lastUpdated: '2026-04-18',
          },
        ],
      },
      {
        version: 'PRICE-STORE-20260401-002',
        title: '清明檔標準價',
        source: '定時調價計劃',
        savedBy: '系統執行',
        savedAt: '2026-04-01 00:00',
        values: [
          {
            group: '經濟型轎車',
            models: 'Toyota Corolla, Honda Civic 等',
            dailyPrice: '¥260',
            mileage: '200km/天，超程 ¥2.0/km，不封頂',
            lastUpdated: '2026-04-01',
          },
          {
            group: 'SUV組',
            models: 'Toyota RAV4, Honda CR-V 等',
            dailyPrice: '¥430',
            mileage: '200km/天，超程 ¥2.0/km，不封頂',
            lastUpdated: '2026-04-01',
          },
          {
            group: '商務車組',
            models: 'Buick GL8, Honda Odyssey 等',
            dailyPrice: '¥780',
            mileage: '250km/天，超程 ¥3.0/km，不封頂',
            lastUpdated: '2026-04-01',
          },
          {
            group: '豪華車組',
            models: 'BMW 5 Series, Mercedes E-Class 等',
            dailyPrice: '¥1,150',
            mileage: '200km/天，超程 ¥4.0/km，不封頂',
            lastUpdated: '2026-04-01',
          },
          {
            group: '新能源組',
            models: 'Tesla Model 3, BYD Han 等',
            dailyPrice: '¥330',
            mileage: '200km/天，超程 ¥1.5/km，封頂 ¥300/天',
            lastUpdated: '2026-04-01',
          },
        ],
      },
    ]);
    const priceVersionDialogVisible = ref(false);
    const selectedPriceVersion = ref(null);
    const openPriceVersion = (version) => {
      selectedPriceVersion.value = version || storePriceVersions[0];
      priceVersionDialogVisible.value = true;
    };
    const sharingGroups = reactive([
      {
        id: 101,
        name: '經濟型分時',
        models: 'BYD Dolphin, Leapmotor T03',
        sameStationHourly: 15,
        sameStationDaily: 120,
        oneWayHourly: 25,
        oneWayDaily: 180,
        lastUpdatedSameStation: '2025-10-01',
        lastUpdatedOneWay: '2025-09-20',
      },
      {
        id: 102,
        name: '舒適型分時',
        models: 'Tesla Model 3, Xpeng P7',
        sameStationHourly: 25,
        sameStationDaily: 200,
        oneWayHourly: 40,
        oneWayDaily: 300,
        lastUpdatedSameStation: '2025-10-05',
        lastUpdatedOneWay: '2025-10-02',
      },
    ]);
    const isSharingLocked = ref(true);
    const sharingBatchMsg = ref(0);
    const sharingScheduledList = reactive([
      {
        effectiveTime: '2026-05-01 00:00:00',
        status: '已執行',
        summary: '勞動節前上調',
        changes: [],
        type: 'SAME_STATION',
      },
    ]);
    let sharingSnapshot = JSON.stringify(sharingGroups);
    const saveAllChanges = () => {
      const loading = feedback.ElMessage.loading({
        message: '正在保存所有更改...',
        duration: 0,
      });
      window.setTimeout(() => {
        loading.close();
        if (!isLocked.value) {
          vehicleGroups.forEach((g) => {
            g.originalPrice = g.dailyPrice;
          });
          isLocked.value = true;
        }
        if (!isSharingLocked.value) {
          sharingSnapshot = JSON.stringify(sharingGroups);
          isSharingLocked.value = true;
        }
        isModified.value = false;
        feedback.ElMessage.success('定價設置已更新成功');
      }, 800);
    };
    const getStatusType = (status) => {
      const map = {
        待執行: 'primary',
        已執行: 'success',
        已取消: 'info',
        執行失敗: 'danger',
      };
      return map[status] || 'info';
    };
    const disabledDate = (time) => time.getTime() < Date.now() - 86400000;
    const handlePriceChange = (_row) => {
      isModified.value = true;
    };
    const unlockPricing = () => {
      isLocked.value = false;
      feedback.ElMessage.info('已解鎖，請謹慎修改價格');
    };
    const savePricing = () => {
      saveAllChanges();
    };
    const cancelEdit = () => {
      vehicleGroups.forEach((g) => {
        g.dailyPrice = g.originalPrice;
      });
      isLocked.value = true;
      isModified.value = false;
      feedback.ElMessage.info('已取消編輯');
    };
    const applyBatchAdjustment = () => {
      const rate = 1 + batchAdjustment.value / 100;
      vehicleGroups.forEach((g) => {
        g.dailyPrice = Math.ceil((g.dailyPrice * rate) / 10) * 10;
      });
      isModified.value = true;
      feedback.ElMessage.success(
        `已批量調整價格 (${batchAdjustment.value > 0 ? '+' : ''}${batchAdjustment.value}%)`,
      );
    };
    const scheduleDialogVisible = ref(false);
    const viewDialogVisible = ref(false);
    const currentViewPlan = ref(null);
    const scheduleForm = reactive({
      effectiveTime: '',
      summary: '',
      prices: [],
    });
    const openScheduleDialog = () => {
      scheduleForm.effectiveTime = '';
      scheduleForm.summary = '';
      scheduleForm.prices = vehicleGroups.map((g) => ({
        id: g.id,
        name: g.name,
        currentPrice: g.dailyPrice,
        newPrice: g.dailyPrice,
      }));
      scheduleDialogVisible.value = true;
    };
    const batchSetNewPrice = () => {
      scheduleForm.prices.forEach((p) => (p.newPrice = Math.ceil((p.currentPrice * 1.1) / 10) * 10));
    };
    const confirmSchedule = () => {
      const hasChange = scheduleForm.prices.some((p) => p.newPrice !== p.currentPrice);
      if (!hasChange) {
        feedback.ElMessage.warning('價格未發生變化');
        return;
      }
      if (!scheduleForm.summary) {
        feedback.ElMessage.warning('請輸入計劃摘要');
        return;
      }
      scheduledList.unshift({
        effectiveTime: scheduleForm.effectiveTime,
        status: '待執行',
        summary: scheduleForm.summary,
        changes: JSON.parse(JSON.stringify(scheduleForm.prices)),
      });
      scheduleDialogVisible.value = false;
      feedback.ElMessage.success('計劃創建成功');
    };
    const viewSchedule = (item) => {
      currentViewPlan.value = item;
      viewDialogVisible.value = true;
    };
    const cancelSchedule = (idx) => {
      scheduledList[idx].status = '已取消';
      feedback.ElMessage.info('計劃已取消');
    };
    const getDiffClass = (row) =>
      row.newPrice > row.currentPrice
        ? 'text-red-500'
        : row.newPrice < row.currentPrice
          ? 'text-green-500'
          : 'text-gray-300';
    const getDiffText = (row) => {
      const diff = row.newPrice - row.currentPrice;
      return diff > 0 ? `+${diff}` : diff < 0 ? `${diff}` : '-';
    };
    const markSharingModified = () => {
      isModified.value = true;
    };
    const cancelSharingEdit = () => {
      const originals = JSON.parse(sharingSnapshot);
      sharingGroups.splice(0, sharingGroups.length, ...originals);
      isSharingLocked.value = true;
      isModified.value = false;
      feedback.ElMessage.info('已取消分時定價編輯');
    };
    const applySharingBatch = () => {
      return feedback.ElMessageBox.confirm(
        `確定要將所有分時車組價格上調 ${sharingBatchMsg.value}% 嗎？`,
        '批量調整',
        {
          confirmButtonText: '確定',
          cancelButtonText: '取消',
          type: 'warning',
        },
      )
        .then(() => {
          const rate = 1 + sharingBatchMsg.value / 100;
          sharingGroups.forEach((g) => {
            g.sameStationHourly = Math.ceil(g.sameStationHourly * rate);
            g.sameStationDaily = Math.ceil(g.sameStationDaily * rate);
            g.oneWayHourly = Math.ceil(g.oneWayHourly * rate);
            g.oneWayDaily = Math.ceil(g.oneWayDaily * rate);
          });
          markSharingModified();
          feedback.ElMessage.success('分時價格已按百分比批量上調');
        })
        .catch((error) => {
          if (error?.message !== 'cancel') throw error;
        });
    };
    const entryHasChanges = (_row) => {
      return isModified.value;
    };
    const sharingScheduleDialogVisible = ref(false);
    const sharingViewDialogVisible = ref(false);
    const currentSharingViewPlan = ref(null);
    const sharingScheduleForm = reactive({
      effectiveTime: '',
      summary: '',
      type: 'SAME_STATION',
      items: [],
    });
    const openSharingScheduleDialog = () => {
      sharingScheduleForm.effectiveTime = '';
      sharingScheduleForm.summary = '';
      sharingScheduleForm.type = 'SAME_STATION';
      initSharingScheduleItems();
      sharingScheduleDialogVisible.value = true;
    };
    const initSharingScheduleItems = () => {
      sharingScheduleForm.items = sharingGroups.map((g) => ({
        id: g.id,
        name: g.name,
        sameStationHourly: g.sameStationHourly,
        sameStationDaily: g.sameStationDaily,
        newSameStationHourly: g.sameStationHourly,
        newSameStationDaily: g.sameStationDaily,
        oneWayHourly: g.oneWayHourly,
        oneWayDaily: g.oneWayDaily,
        newOneWayHourly: g.oneWayHourly,
        newOneWayDaily: g.oneWayDaily,
      }));
    };
    const resetSharingSchedulePrices = () => {
      sharingScheduleForm.items.forEach((item) => {
        item.newSameStationHourly = item.sameStationHourly;
        item.newSameStationDaily = item.sameStationDaily;
        item.newOneWayHourly = item.oneWayHourly;
        item.newOneWayDaily = item.oneWayDaily;
      });
    };
    const batchSetSharingNewPrice = () => {
      const isSame = sharingScheduleForm.type === 'SAME_STATION';
      sharingScheduleForm.items.forEach((item) => {
        if (isSame) {
          item.newSameStationHourly = Math.ceil(item.sameStationHourly * 1.1);
          item.newSameStationDaily = Math.ceil(item.sameStationDaily * 1.1);
        } else {
          item.newOneWayHourly = Math.ceil(item.oneWayHourly * 1.1);
          item.newOneWayDaily = Math.ceil(item.oneWayDaily * 1.1);
        }
      });
      feedback.ElMessage.success('批量預覽上調 10%');
    };
    const confirmSharingSchedule = () => {
      if (!sharingScheduleForm.effectiveTime) {
        feedback.ElMessage.warning('請選擇時間');
        return;
      }
      if (!sharingScheduleForm.summary) {
        feedback.ElMessage.warning('請輸入計劃摘要');
        return;
      }
      let hasChange = false;
      if (sharingScheduleForm.type === 'SAME_STATION') {
        hasChange = sharingScheduleForm.items.some(
          (i) =>
            i.newSameStationHourly !== i.sameStationHourly || i.newSameStationDaily !== i.sameStationDaily,
        );
      } else {
        hasChange = sharingScheduleForm.items.some(
          (i) => i.newOneWayHourly !== i.oneWayHourly || i.newOneWayDaily !== i.oneWayDaily,
        );
      }
      if (!hasChange) {
        feedback.ElMessage.warning('價格未發生變化');
        return;
      }
      sharingScheduledList.unshift({
        effectiveTime: sharingScheduleForm.effectiveTime,
        status: '待執行',
        summary: sharingScheduleForm.summary,
        changes: JSON.parse(JSON.stringify(sharingScheduleForm.items)),
        type: sharingScheduleForm.type,
      });
      sharingScheduleDialogVisible.value = false;
      feedback.ElMessage.success('分時計劃創建成功');
    };
    const viewSharingSchedule = (item) => {
      currentSharingViewPlan.value = item;
      sharingViewDialogVisible.value = true;
    };
    const cancelSharingSchedule = (idx) => {
      sharingScheduledList[idx].status = '已取消';
      feedback.ElMessage.info('已取消');
    };
    const sharingScheduleHasChange = (row) => {
      return (
        row.newSameStationHourly !== row.sameStationHourly ||
        row.newSameStationDaily !== row.sameStationDaily ||
        row.newOneWayHourly !== row.oneWayHourly ||
        row.newOneWayDaily !== row.oneWayDaily
      );
    };
    return {
      activeTab,
      isModified,
      saveChanges: saveAllChanges,
      getStatusType,
      disabledDate,
      currentTenantName,
      switchTenant,
      hasPermission,
      permissionDemoMode,
      permissionDemoOptions,
      hasStoreBusinessPermission,
      hasSharingBusinessPermission,
      vehicleGroups,
      isLocked,
      handlePriceChange,
      unlockPricing,
      savePricing,
      cancelEdit,
      batchAdjustment,
      applyBatchAdjustment,
      storePriceVersions,
      priceVersionDialogVisible,
      selectedPriceVersion,
      openPriceVersion,
      scheduledList,
      scheduleDialogVisible,
      scheduleForm,
      openScheduleDialog,
      batchSetNewPrice,
      confirmSchedule,
      viewSchedule,
      cancelSchedule,
      viewDialogVisible,
      currentViewPlan,
      getDiffClass,
      getDiffText,
      sharingGroups,
      isSharingLocked,
      markSharingModified,
      cancelSharingEdit,
      sharingBatchMsg,
      applySharingBatch,
      entryHasChanges,
      sharingScheduledList,
      sharingScheduleDialogVisible,
      sharingScheduleForm,
      openSharingScheduleDialog,
      resetSharingSchedulePrices,
      batchSetSharingNewPrice,
      confirmSharingSchedule,
      viewSharingSchedule,
      cancelSharingSchedule,
      sharingViewDialogVisible,
      currentSharingViewPlan,
      sharingScheduleHasChange,
      ElMessage: feedback.ElMessage,
      ElMessageBox: feedback.ElMessageBox,
      currentTenant,
      sharingSnapshot,
      saveAllChanges,
      initSharingScheduleItems,
    };
  }
  return pageSetup();
}
