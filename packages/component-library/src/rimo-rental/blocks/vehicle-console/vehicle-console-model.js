import dayjs from 'dayjs';
import { validCoordinates, booleanValue } from '../../lib/rimo-data-tools.js';
export default function createPageState(model) {
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
      watch: watch,
      onMount: onMounted,
      onDispose: onBeforeUnmount
    } = model;
    const orgData = [{
      value: 'car-north',
      label: 'RIMO 北區車行',
      children: [{
        value: 'store-taipei',
        label: '臺北車站門市',
        children: [{
          value: 's-1',
          label: '臺北車站前據點'
        }, {
          value: 's-6',
          label: '臺北車站東門據點'
        }]
      }, {
        value: 'store-songshan',
        label: '松山機場門市',
        children: [{
          value: 's-2',
          label: '松山機場 T1 據點'
        }]
      }, {
        value: 'store-xinyi',
        label: '信義門市',
        children: [{
          value: 's-3',
          label: '信義 CBD 據點'
        }]
      }]
    }, {
      value: 'car-south',
      label: 'RIMO 南區車行',
      children: [{
        value: 'store-zuoying',
        label: '左營高鐵門市',
        children: [{
          value: 's-4',
          label: '左營高鐵站據點'
        }]
      }, {
        value: 'store-pier2',
        label: '駁二門市',
        children: [{
          value: 's-5',
          label: '駁二藝術特區據點'
        }]
      }]
    }];
    const stationCascaderProps = {
      multiple: true,
      emitPath: false,
      checkStrictly: false,
      value: 'value',
      label: 'label',
      children: 'children'
    };
    const allVehicles = ref([{
      id: 1,
      stationId: 's-1',
      vehicleType: 'Vehicle',
      iduId: '1234',
      licensePlate: 'RAB-1234',
      model: 'Toyota Corolla Cross Hybrid',
      vin: 'JTNK1234567890123',
      isDriving: true,
      isOnline: true
    }, {
      id: 2,
      stationId: 's-1',
      vehicleType: 'Vehicle',
      iduId: '1235',
      licensePlate: 'RDZ-5566',
      model: 'Honda CR-V e:HEV',
      vin: 'MRHRW1840RP012345',
      isDriving: false,
      isOnline: true
    }, {
      id: 6,
      stationId: 's-1',
      vehicleType: 'MicroEV',
      iduId: '1239',
      licensePlate: 'MEV-1028',
      model: 'RIMO 微電動車 M1',
      vin: 'MEV00000000001239',
      isDriving: false,
      isOnline: true
    }, {
      id: 3,
      stationId: 's-2',
      vehicleType: 'Vehicle',
      iduId: '1236',
      licensePlate: 'TCD-9900',
      model: 'Toyota Alphard',
      vin: 'LSGXXXXXXXX111111',
      isDriving: false,
      isOnline: false
    }, {
      id: 4,
      stationId: 's-4',
      vehicleType: 'Vehicle',
      iduId: '1237',
      licensePlate: 'REN-8888',
      model: 'Porsche Macan',
      vin: 'WP0XXXXXXXX222222',
      isDriving: true,
      isOnline: true
    }, {
      id: 5,
      stationId: 's-5',
      vehicleType: 'Vehicle',
      iduId: '1238',
      licensePlate: 'EAB-1234',
      model: 'Tesla Model Y',
      vin: 'LRWYGCEK8MC333333',
      isDriving: false,
      isOnline: true
    }, {
      id: 7,
      stationId: 's-2',
      vehicleType: 'Vehicle',
      iduId: '1240',
      licensePlate: 'KBC-7281',
      model: 'Toyota Camry Hybrid',
      vin: 'JTNB11HK0N4124001',
      isDriving: false,
      isOnline: true
    }, {
      id: 8,
      stationId: 's-3',
      vehicleType: 'Vehicle',
      iduId: '1241',
      licensePlate: 'BQK-5816',
      model: 'Lexus UX 300e',
      vin: 'JTHAA8BH0P2124002',
      isDriving: true,
      isOnline: true
    }, {
      id: 9,
      stationId: 's-4',
      vehicleType: 'MicroEV',
      iduId: '1242',
      licensePlate: 'MEV-2036',
      model: 'RIMO 微電動車 M1',
      vin: 'MEV00000000001242',
      isDriving: false,
      isOnline: true,
      orderInfo: {
        orderNo: 'ORD-MEV-20260826-008',
        status: 'ACTIVE'
      }
    }, {
      id: 10,
      stationId: 's-5',
      vehicleType: 'Vehicle',
      iduId: '1243',
      licensePlate: 'BCP-7315',
      model: 'Mazda CX-5',
      vin: 'JM7KF4WLA0124003',
      isDriving: false,
      isOnline: true
    }, {
      id: 11,
      stationId: 's-3',
      vehicleType: 'MicroEV',
      iduId: '1244',
      licensePlate: 'MEV-3168',
      model: 'RIMO 微電動車 M2',
      vin: 'MEV00000000001244',
      isDriving: true,
      isOnline: true
    }, {
      id: 12,
      stationId: 's-2',
      vehicleType: 'Vehicle',
      iduId: '1245',
      licensePlate: 'AJU-6621',
      model: 'Mercedes-Benz E300',
      vin: 'WDDZF8EB8PA124004',
      isDriving: false,
      isOnline: false
    }, {
      id: 13,
      stationId: 's-1',
      vehicleType: 'Vehicle',
      iduId: '1246',
      licensePlate: 'BXR-8899',
      model: 'Lexus ES 250',
      vin: 'JTHB11B10P2124005',
      isDriving: false,
      isOnline: true
    }, {
      id: 14,
      stationId: 's-4',
      vehicleType: 'Vehicle',
      iduId: '1247',
      licensePlate: 'KLA-2108',
      model: 'Toyota Alphard',
      vin: 'JTNGS3DH7P8124006',
      isDriving: true,
      isOnline: true
    }, {
      id: 15,
      stationId: 's-5',
      vehicleType: 'MicroEV',
      iduId: '1248',
      licensePlate: 'MEV-4280',
      model: 'RIMO 微電動車 S1',
      vin: 'MEV00000000001248',
      isDriving: false,
      isOnline: true
    }, {
      id: 16,
      stationId: 's-3',
      vehicleType: 'Vehicle',
      iduId: '1249',
      licensePlate: 'TFD-5326',
      model: 'Toyota Camry',
      vin: 'JTNB23HK2P3124007',
      isDriving: false,
      isOnline: true
    }, {
      id: 17,
      stationId: 's-2',
      vehicleType: 'Vehicle',
      iduId: '1250',
      licensePlate: 'RCM-7358',
      model: 'Skoda Superb',
      vin: 'TMBLJ7NP8P7124008',
      isDriving: false,
      isOnline: true
    }, {
      id: 18,
      stationId: 's-1',
      vehicleType: 'MicroEV',
      iduId: '1251',
      licensePlate: 'MEV-5392',
      model: 'RIMO 微電動車 M2',
      vin: 'MEV00000000001251',
      isDriving: false,
      isOnline: false
    }]);
    const filters = reactive({
      stationIds: [],
      vehicleType: 'ALL',
      keyword: ''
    });
    const filteredVehicles = computed(() => {
      const keyword = filters.keyword.trim().toUpperCase();
      return allVehicles.value.filter(v => {
        if (filters.stationIds.length && !filters.stationIds.includes(v.stationId)) return false;
        if (filters.vehicleType !== 'ALL' && v.vehicleType !== filters.vehicleType) return false;
        if (keyword) {
          const haystack = [v.licensePlate, v.model, v.vin, v.iduId].join(' ').toUpperCase();
          if (!haystack.includes(keyword)) return false;
        }
        return true;
      });
    });
    const activeVehicle = ref(null);
    const isRefreshing = ref(false);
    const telemetry = reactive({});
    const freshnessCheckTime = ref(Date.now());
    let freshnessTimer = null;
    const historyLogs = ref([]);
    const historyArchive = ref([]);
    const historyByVehicle = new Map();
    const telemetryByVehicle = new Map();
    const pendingCommands = new Set();
    let refreshRevision = 0;
    const statusDetailVisible = ref(false);
    const historyDialogVisible = ref(false);
    const mapDialogVisible = ref(false);
    const motoOnlineTestExecuted = ref(false);
    const historyFilters = reactive({
      dateRange: [],
      operatorKeyword: '',
      action: 'ALL'
    });
    const historyPage = ref(1);
    const historyPageSize = ref(10);
    const getVehicleTypeName = type => type === 'MicroEV' ? '微電動車' : '汽車';
    const getVehiclePhoto = vehicle => {
      if (vehicle.photoUrl) return vehicle.photoUrl;
      return vehicle.vehicleType === 'MicroEV' ? 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?q=80&w=500&auto=format&fit=crop' : 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?q=80&w=500&auto=format&fit=crop';
    };
    const getVehicleOrganizationText = vehicle => {
      if (!vehicle?.stationId) return '-';
      for (const carDealer of orgData) {
        for (const store of carDealer.children || []) {
          const station = (store.children || []).find(item => item.value === vehicle.stationId);
          if (station) return `${carDealer.label} / ${store.label} / ${station.label}`;
        }
      }
      return vehicle.stationId;
    };
    const valueText = (value, suffix = '') => value === null || value === undefined || value === '' || value === 'NA' ? 'NA' : `${value}${suffix}`;
    const isTrueValue = value => value === true || value === 1 || value === '1';
    const yesNo = (value, yes = '是', no = '否') => booleanValue(value) === true ? yes : booleanValue(value) === false ? no : 'NA';
    const platformReceivedTime = computed(() => telemetry.receivedAt ? dayjs(Number(telemetry.receivedAt)).format('YYYY-MM-DD HH:mm:ss') : 'NA');
    const isTelemetryStale = computed(() => !telemetry.receivedAt || freshnessCheckTime.value - Number(telemetry.receivedAt) > 10 * 60 * 1000);
    const isDeviceOnline = computed(() => !isTelemetryStale.value && isTrueValue(telemetry.gprsStatus));
    const deviceConnectionText = computed(() => isTelemetryStale.value ? '逾時未上報' : isDeviceOnline.value ? '在線' : '離線');
    const historyOperatorOptions = computed(() => Array.from(new Set(historyArchive.value.map(item => item.operator))));
    const historyActionOptions = computed(() => Array.from(new Set(historyArchive.value.map(item => item.action))));
    const filteredHistoryArchive = computed(() => {
      return historyArchive.value.filter(item => {
        if (historyFilters.operatorKeyword && !String(item.operator).toLowerCase().includes(String(historyFilters.operatorKeyword).toLowerCase())) return false;
        if (historyFilters.action && historyFilters.action !== 'ALL' && item.action !== historyFilters.action) return false;
        if (historyFilters.dateRange && historyFilters.dateRange.length === 2) {
          const [start, end] = historyFilters.dateRange;
          const ts = dayjs(item.time).valueOf();
          if (ts < dayjs(start).valueOf() || ts > dayjs(end).valueOf()) return false;
        }
        return true;
      });
    });
    const pagedHistoryArchive = computed(() => {
      const start = (historyPage.value - 1) * historyPageSize.value;
      return filteredHistoryArchive.value.slice(start, start + historyPageSize.value);
    });
    watch(filteredHistoryArchive, () => {
      historyPage.value = 1;
    });
    const resetHistoryFilters = () => {
      historyFilters.dateRange = [];
      historyFilters.operatorKeyword = '';
      historyFilters.action = 'ALL';
      historyPage.value = 1;
    };
    const openHistoryDialog = () => {
      if (!activeVehicle.value) return;
      resetHistoryFilters();
      historyDialogVisible.value = true;
    };
    const openMapDialog = () => {
      if (!activeVehicle.value || !validCoordinates(telemetry.latitude, telemetry.longitude)) return;
      mapDialogVisible.value = true;
    };
    const carTelemetry = vehicle => {
      let remainFuel = 75;
      let batteryVoltage = 13.4;
      let lowVoltage = false;
      let securityOn = false;
      let doorOpen = false;
      let doorLockStatus = true;
      if (vehicle.licensePlate === 'RDZ-5566') {
        remainFuel = 22;
        batteryVoltage = 12.1;
        doorOpen = true;
        doorLockStatus = false;
      } else if (vehicle.licensePlate === 'KBC-7281') {
        remainFuel = 15;
        batteryVoltage = 11.9;
      } else if (vehicle.licensePlate === 'TCD-9900') {
        remainFuel = 6;
        batteryVoltage = 10.5;
        lowVoltage = true;
        securityOn = true;
      } else if (vehicle.licensePlate === 'BCP-7315') {
        remainFuel = 8;
        batteryVoltage = 10.8;
        lowVoltage = true;
      } else if (vehicle.id === 2) {
        remainFuel = 46;
        batteryVoltage = 12.0;
      }
      return {
        dataType: 'IduRealTimeInfo',
        iduId: vehicle.iduId,
        iduType: 'Vehicle',
        iduBrandName: 'RITI',
        iduModelName: 'IDU-420OB',
        iduFW: '402OB-20230801',
        iduIMEI: '866011054943972',
        iduICCID: '89886017157804948615',
        ts: dayjs().subtract(35, 'second').valueOf(),
        receivedAt: dayjs().subtract(30, 'second').valueOf(),
        iduGpsTime: dayjs().subtract(1, 'minute').format('YYYY/MM/DD HH:mm:ss'),
        gpsStatus: true,
        latitude: '25.0521',
        longitude: '121.5206',
        gprsStatus: vehicle.isOnline,
        signalStrength: vehicle.isOnline ? vehicle.isDriving ? '極好' : '良好' : '離線',
        tboxPower: true,
        rentalActive: vehicle.id === 1,
        accOn: vehicle.isDriving,
        powerOn: vehicle.isDriving,
        securityOn: securityOn,
        doorOpen: doorOpen,
        doorLockStatus: doorLockStatus,
        lightOn: vehicle.isDriving,
        iButtonReturned: true,
        iButtonId: '8600001739726C01',
        batteryVoltage: batteryVoltage,
        lowVoltage: lowVoltage,
        drivingBehavior: 'NE',
        speed: vehicle.isDriving ? 60 : 0,
        rpm: vehicle.isDriving ? 1680 : 0,
        mileage: vehicle.id === 2 ? 3221 : 18540,
        remainFuel: remainFuel,
        boxDeviceVersion: '23L01-F1',
        waitSecurityOn: false,
        address: vehicle.isDriving ? '臺北市大安區建國南路高架橋近信義路下匝道' : '臺北市中山區南京東路三段219號B2層車庫'
      };
    };
    const motoTelemetry = vehicle => {
      let rsoc = '79';
      let remainingDistance = '73';
      let dcVoltage = '54.35';
      let lowVoltage = false;
      let lba = '79';
      if (vehicle.licensePlate === 'MEV-2036') {
        rsoc = '18';
        remainingDistance = '16';
        dcVoltage = '48.20';
        lba = '18';
      } else if (vehicle.licensePlate === 'MEV-4280') {
        rsoc = '25';
        remainingDistance = '22';
        dcVoltage = '49.10';
        lba = '25';
      } else if (vehicle.licensePlate === 'MEV-3168') {
        rsoc = '5';
        remainingDistance = '4';
        dcVoltage = '43.80';
        lowVoltage = true;
        lba = '5';
      } else if (vehicle.licensePlate === 'MEV-5392') {
        rsoc = '3';
        remainingDistance = '2';
        dcVoltage = '42.50';
        lowVoltage = true;
        lba = '3';
      }
      return {
        dataType: 'IduRealTimeInfo',
        iduId: vehicle.iduId,
        iduType: 'MicroEV',
        iduBrandName: 'RITI',
        iduModelName: 'IDU-420OB',
        iduFW: '420OB-20260601',
        iduIMEI: '866011054943972',
        iduICCID: '89886972003761333339',
        ts: dayjs().subtract(vehicle.isOnline ? 35 : 665, 'second').valueOf(),
        receivedAt: dayjs().subtract(vehicle.isOnline ? 30 : 660, 'second').valueOf(),
        iduGpsTime: dayjs().subtract(vehicle.isOnline ? 1 : 12, 'minute').format('YYYY/MM/DD HH:mm:ss'),
        gpsStatus: true,
        latitude: '24.9971306',
        longitude: '121.4848972',
        gprsStatus: vehicle.isOnline,
        signalStrength: vehicle.isOnline ? '良好' : '離線',
        rentalActive: vehicle.licensePlate === 'MEV-4280',
        accOn: vehicle.isDriving,
        motorStarted: vehicle.isDriving,
        lowVoltage: lowVoltage,
        dcVoltage: dcVoltage,
        speed: vehicle.isDriving ? '25' : '0',
        mileage: '2061.7',
        current: vehicle.isDriving ? '8.4' : '0.0',
        rsoc: rsoc,
        remainingDistance: remainingDistance,
        mba: 'NA',
        mbaa: 'NA',
        mbaTempHigh: 'NA',
        mbaTempLow: 'NA',
        rba: 'NA',
        rbaa: 'NA',
        rbaTempHigh: 'NA',
        rbaTempLow: 'NA',
        lba: lba,
        lbaa: '0.11',
        lbaTempHigh: '25',
        lbaTempLow: '24',
        mbaSn: 'NA',
        mbaFw: 'NA',
        rbaSn: 'NA',
        rbaFw: 'NA',
        lbaSn: '0880AAKH30F23210V1',
        lbaFw: '3E55',
        address: '臺北市中山區南京東路三段219號B2層微電動車停放區'
      };
    };
    const resetTelemetry = payload => {
      Object.keys(telemetry).forEach(key => delete telemetry[key]);
      Object.assign(telemetry, payload);
    };
    const openStatusDrawer = () => {
      if (!activeVehicle.value) return;
      statusDetailVisible.value = true;
    };
    const selectVehicle = vehicle => {
      const isNewVehicle = !activeVehicle.value || activeVehicle.value.id !== vehicle.id;
      statusDetailVisible.value = false;
      historyDialogVisible.value = false;
      mapDialogVisible.value = false;
      motoOnlineTestExecuted.value = false;
      activeVehicle.value = vehicle;
      if (!telemetryByVehicle.has(vehicle.id)) telemetryByVehicle.set(vehicle.id, vehicle.vehicleType === 'MicroEV' ? motoTelemetry(vehicle) : carTelemetry(vehicle));
      resetTelemetry(telemetryByVehicle.get(vehicle.id));
      freshnessCheckTime.value = Date.now();
      fetchHistory();
      if (isNewVehicle) {
        feedback.ElMessage.info({
          message: `已切換至 ${vehicle.licensePlate}，正在刷新獲取最新狀態…`,
          duration: 1600
        });
        refreshTelemetry();
      }
    };
    const refreshTelemetry = () => {
      if (!activeVehicle.value) return;
      const vehicleId = activeVehicle.value.id;
      const requestRevision = ++refreshRevision;
      isRefreshing.value = true;
      window.setTimeout(() => {
        if (activeVehicle.value?.id !== vehicleId || refreshRevision !== requestRevision) return;
        resetTelemetry(telemetryByVehicle.get(vehicleId));
        freshnessCheckTime.value = Date.now();
        isRefreshing.value = false;
        feedback.ElMessage.success({
          message: '車機狀態已刷新',
          duration: 1500
        });
      }, 700);
    };
    const getActionName = code => {
      const map = {
        UNLOCK_DOOR: '解鎖車門',
        LOCK_DOOR: '鎖定車門',
        ENABLE_IMMOBILIZER: '保全上鎖',
        DISABLE_IMMOBILIZER: '解除保全',
        FIND_VEHICLE: '遠程尋車 (鳴笛閃燈)',
        TEST_MOTO_ONLINE: '測試車機是否在線',
        SET_MOTO_LEASE: '上租約（解鎖）',
        RELEASE_MOTO_LEASE: '解租約（上鎖）',
        BLE_MOTO_LEASE: '微電動車 BLE 租約'
      };
      return map[code] || code;
    };
    const getHistoryStatusText = status => ({
      PENDING: '待回執',
      SUCCESS: '成功',
      FAIL: '失敗'
    })[status] || status;
    const getHistoryStatusType = status => ({
      PENDING: 'warning',
      SUCCESS: 'success',
      FAIL: 'danger'
    })[status] || 'info';
    const memberNames = ['王小明', '陳建宏', '林雅婷', '李欣怡', '張志豪', '周怡君', '黃柏翰', '吳佳穎'];
    const motoLeaseActions = ['SET_MOTO_LEASE', 'RELEASE_MOTO_LEASE', 'BLE_MOTO_LEASE'];
    const memberDoorActions = ['UNLOCK_DOOR', 'LOCK_DOOR'];
    const buildVehicleHistory = vehicle => {
      const isMoto = vehicle.vehicleType === 'MicroEV';
      const actionCycle = isMoto ? ['SET_MOTO_LEASE', 'BLE_MOTO_LEASE', 'RELEASE_MOTO_LEASE', 'TEST_MOTO_ONLINE'] : ['UNLOCK_DOOR', 'LOCK_DOOR', 'UNLOCK_DOOR', 'LOCK_DOOR', 'FIND_VEHICLE', 'ENABLE_IMMOBILIZER', 'DISABLE_IMMOBILIZER'];
      const baseTime = dayjs().subtract(vehicle.id % 6 * 3, 'minute');
      return Array.from({
        length: 28
      }, (_, index) => {
        const action = actionCycle[index % actionCycle.length];
        const isAppAction = isMoto ? motoLeaseActions.includes(action) : memberDoorActions.includes(action);
        const status = index === 0 ? 'PENDING' : index === 2 || (index + vehicle.id) % 13 === 0 ? 'FAIL' : 'SUCCESS';
        let note = '';
        let errorStep = '';
        let errorCode = '';
        if (status === 'FAIL') {
          note = '車機未在規定時間內回執';
          errorStep = '等待車機回執';
          errorCode = '004';
        }
        return {
          id: `${vehicle.id}-${index}`,
          time: baseTime.subtract(index * 2 + index % 4, 'hour').format('YYYY-MM-DD HH:mm:ss'),
          operator: isAppAction ? memberNames[(index + vehicle.id) % memberNames.length] : action === 'TEST_MOTO_ONLINE' ? '系統自動處理' : ['調度員小周', '值班管理員', '系統自動處理'][(index + vehicle.id) % 3],
          action,
          plate: vehicle.licensePlate,
          cid: vehicle.iduId,
          cmdId: `CMD-${vehicle.iduId}-${String(1000 - index).padStart(4, '0')}`,
          status,
          errorStep,
          errorCode,
          note
        };
      });
    };
    const fetchHistory = () => {
      if (!activeVehicle.value) return;
      const vehicleId = activeVehicle.value.id;
      if (!historyByVehicle.has(vehicleId)) {
        historyByVehicle.set(vehicleId, buildVehicleHistory(activeVehicle.value));
      }
      const logs = [...historyByVehicle.get(vehicleId)].sort((a, b) => dayjs(b.time).valueOf() - dayjs(a.time).valueOf());
      historyArchive.value = logs;
      historyLogs.value = (activeVehicle.value.vehicleType === 'MicroEV' ? logs.filter(log => ['SET_MOTO_LEASE', 'RELEASE_MOTO_LEASE'].includes(log.action)) : logs).slice(0, 10);
    };
    const sendCommand = actionCode => {
      if (!activeVehicle.value) return;
      const target = { ...activeVehicle.value };
      const commands = target.vehicleType === 'MicroEV' ? ['TEST_MOTO_ONLINE', 'SET_MOTO_LEASE', 'RELEASE_MOTO_LEASE'] : ['UNLOCK_DOOR', 'LOCK_DOOR', 'ENABLE_IMMOBILIZER', 'DISABLE_IMMOBILIZER', 'FIND_VEHICLE'];
      if (!commands.includes(actionCode) || pendingCommands.has(target.id)) return;
      if (!isDeviceOnline.value) {
        feedback.ElMessage.error('車機離線或逾時未上報，無法下發控制指令');
        return;
      }
      return feedback.ElMessageBox.confirm(`確定要對車輛 ${target.licensePlate} 執行【${getActionName(actionCode)}】操作嗎？`, '安全操作確認', {
        confirmButtonText: '確定執行',
        cancelButtonText: '取消',
        type: actionCode.includes('IMMOBILIZER') || actionCode.includes('NO_RENTAL') || actionCode === 'RELEASE_MOTO_LEASE' ? 'warning' : 'info'
      }).then(() => {
        const latest = telemetryByVehicle.get(target.id);
        if (!latest || !isTrueValue(latest.gprsStatus) || Date.now() - Number(latest.receivedAt) > 10 * 60 * 1000 || pendingCommands.has(target.id)) { feedback.ElMessage.error('車機離線或逾時未上報，無法下發控制指令'); return; }
        pendingCommands.add(target.id);
        const finishLoading = model.notify('loading', '正在模擬下發指令，等待車機回執');
        window.setTimeout(() => {
          if (typeof finishLoading === 'function') finishLoading();
          pendingCommands.delete(target.id);
          const newLog = {
            id: Date.now(),
            time: dayjs().format('YYYY-MM-DD HH:mm:ss'),
            operator: '當前賬號 (SysAdmin)',
            action: actionCode,
            plate: target.licensePlate,
            cid: target.iduId,
            cmdId: `CMD-${target.iduId}-${Date.now()}`,
            status: 'PENDING',
            errorStep: '',
            errorCode: '',
            note: ''
          };
          historyByVehicle.set(target.id, [newLog, ...(historyByVehicle.get(target.id) ?? [])]);
          if (activeVehicle.value?.id === target.id) {
            fetchHistory();
            if (actionCode === 'TEST_MOTO_ONLINE') motoOnlineTestExecuted.value = true;
          }
          feedback.ElMessage.info('指令已下發，等待車機回執');
        }, 1200);
      }).catch(error => { if (error?.message !== 'cancel') feedback.ElMessage.error('指令未下發，請重試'); });
    };
    onMounted(() => {
      const urlParams = new URLSearchParams(window.location.search);
      const queryPlate = urlParams.get('plate');
      const foundVehicle = queryPlate ? allVehicles.value.find(v => v.licensePlate.toUpperCase() === queryPlate.toUpperCase()) : null;
      if (foundVehicle) {
        selectVehicle(foundVehicle);
      } else if (filteredVehicles.value.length > 0) {
        selectVehicle(filteredVehicles.value[0]);
      }
      freshnessTimer = window.setInterval(() => {
        freshnessCheckTime.value = Date.now();
      }, 60 * 1000);
    });
    onBeforeUnmount(() => {
      if (freshnessTimer) window.clearInterval(freshnessTimer);
    });
    const copyText = async (text, label = '內容') => {
      if (!text || text === 'NA' || text === '-') {
        feedback.ElMessage.warning('暫無有效內容可複製');
        return;
      }
      try { await navigator.clipboard.writeText(String(text)); feedback.ElMessage.success(`已複製 ${label}`); }
      catch { feedback.ElMessage.error('複製失敗，請手動選取內容'); }
    };
    return {
      orgData,
      stationCascaderProps,
      filters,
      filteredVehicles,
      activeVehicle,
      selectVehicle,
      getVehicleTypeName,
      getVehiclePhoto,
      getVehicleOrganizationText,
      telemetry,
      statusDetailVisible,
      historyDialogVisible,
      mapDialogVisible,
      motoOnlineTestExecuted,
      historyFilters,
      filteredHistoryArchive,
      pagedHistoryArchive,
      historyPage,
      historyPageSize,
      historyOperatorOptions,
      historyActionOptions,
      openStatusDrawer,
      openHistoryDialog,
      resetHistoryFilters,
      openMapDialog,
      platformReceivedTime,
      isDeviceOnline,
      isTrueValue,
      deviceConnectionText,
      refreshTelemetry,
      isRefreshing,
      historyLogs,
      fetchHistory,
      sendCommand,
      getActionName,
      getHistoryStatusText,
      getHistoryStatusType,
      copyText,
      allVehicles,
      freshnessCheckTime,
      freshnessTimer,
      historyArchive,
      historyByVehicle,
      valueText,
      yesNo,
      isTelemetryStale,
      carTelemetry,
      motoTelemetry,
      resetTelemetry,
      memberNames,
      motoLeaseActions,
      memberDoorActions,
      buildVehicleHistory
    };
  }
  return pageSetup();
}
