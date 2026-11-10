import dayjs from 'dayjs';
import { validCoordinates } from '../../lib/rimo-data-tools.js';
export default function createPageState(model) {
  const _document = model.document;
  const _window = model.window;
  const _localStorage = model.storage;
  const _sessionStorage = model.storage;
  const _themeColor = () => model.theme();
  const _themeColorLight = level => model.theme(level);
  const _themeRGBA = alpha => model.themeAlpha(alpha);
  const _feedback = {
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
      watch: watch
    } = model;
    const filters = reactive({
      keyword: '',
      station: '',
      vehicleType: '',
      status: ''
    });
    const searchPanelExpanded = ref(false);
    const advancedFilters = reactive({
      group: '',
      fuelType: '',
      orderState: '',
      attentionState: []
    });
    const mockData = ref([{
      id: 1,
      plate: 'RAB-1234',
      vehicleType: 'Vehicle',
      brand: 'Tesla',
      model: 'Model 3',
      group: '純電轎車 E組',
      serviceType: '同站租還 / 甲租乙還',
      station: 'RIMO 北區車行 / 臺北車站門市 / 臺北車站前據點',
      mileage: 45210,
      fuelType: 'EV',
      remainFuel: 85,
      batteryVoltage: 12.8,
      lowVoltage: false,
      speed: 65,
      rpm: 0,
      gpsStatus: true,
      gprsStatus: true,
      telemetryStale: false,
      rentalStatus: true,
      receivedAt: '2026-08-26 14:20:18',
      iduGpsTime: '2026-08-26 14:19:52',
      latitude: '25.0521',
      longitude: '121.5206',
      address: '臺北市大安區建國南路高架橋近信義路下匝道',
      status: 'RENTED',
      orderInfo: {
        orderNo: 'ORD-20260401-001A',
        status: 'ACTIVE',
        returnTime: '今日 18:00',
        returnStation: '松山機場門店'
      }
    }, {
      id: 2,
      plate: 'RDZ-5566',
      vehicleType: 'Vehicle',
      brand: 'Toyota',
      model: 'Corolla Altis 1.8',
      group: '經濟型 C組',
      serviceType: '同站租還',
      station: 'RIMO 北區車行 / 臺北車站門市 / 臺北車站前據點',
      mileage: 120500,
      fuelType: 'Gasoline',
      remainFuel: 40,
      batteryVoltage: 12.2,
      lowVoltage: false,
      speed: 0,
      rpm: 0,
      gpsStatus: true,
      gprsStatus: true,
      telemetryStale: false,
      rentalStatus: false,
      securityStatus: false,
      doorLockStatus: false,
      doorStatus: false,
      iButtonStatus: true,
      receivedAt: '2026-08-26 14:19:42',
      iduGpsTime: '2026-08-26 14:18:58',
      latitude: '25.0478',
      longitude: '121.5170',
      address: '臺北市中正區北平西路3號 (站區地下停車場B2)',
      status: 'IDLE',
      orderInfo: null
    }, {
      id: 3,
      plate: 'TCD-9900',
      vehicleType: 'Vehicle',
      brand: 'Toyota',
      model: 'Alphard 2.5 Hybrid',
      group: '豪華商務 M組',
      serviceType: '尊榮代駕 / 同站租還',
      station: 'RIMO 北區車行 / 松山機場門市 / 第一航廈門口據點',
      mileage: 23410,
      fuelType: 'Hybrid',
      remainFuel: 98,
      batteryVoltage: 13.1,
      lowVoltage: false,
      speed: 0,
      rpm: 850,
      gpsStatus: true,
      gprsStatus: true,
      telemetryStale: false,
      rentalStatus: false,
      receivedAt: '2026-08-26 14:18:56',
      iduGpsTime: '2026-08-26 14:18:20',
      latitude: '25.0632',
      longitude: '121.5518',
      address: '臺北市松山區敦化北路340之9號 (第一航廈門口怠速中)',
      status: 'DISPATCHING',
      orderInfo: {
        orderNo: 'ORD-20260402-VIP1',
        status: 'PENDING',
        returnTime: '明日 10:00',
        returnStation: '松山機場門店'
      }
    }, {
      id: 4,
      plate: 'REN-8888',
      vehicleType: 'Vehicle',
      brand: 'Porsche',
      model: 'Macan S',
      group: '豪華SUV S組',
      serviceType: '同站租還',
      station: 'RIMO 高雄車行 / 左營高鐵站門市 / 高鐵站西側據點',
      mileage: 8900,
      fuelType: 'Gasoline',
      remainFuel: 45,
      batteryVoltage: 12.4,
      lowVoltage: false,
      speed: 110,
      rpm: 2100,
      gpsStatus: true,
      gprsStatus: true,
      telemetryStale: false,
      rentalStatus: true,
      receivedAt: '2026-08-26 14:20:01',
      iduGpsTime: '2026-08-26 14:19:31',
      latitude: '22.6860',
      longitude: '120.3068',
      address: '高雄市楠梓區國道1號南下351K處',
      status: 'RENTED',
      orderInfo: {
        orderNo: 'ORD-20260330-999X',
        status: 'ACTIVE',
        returnTime: '後天 20:00',
        returnStation: '左營高鐵站門店'
      }
    }, {
      id: 5,
      plate: 'EAB-1234',
      vehicleType: 'Vehicle',
      brand: 'Honda',
      model: 'CR-V 1.5 T',
      group: '家庭SUV S組',
      serviceType: '同站租還',
      station: 'RIMO 高雄車行 / 左營高鐵站門市 / 高鐵站西側據點',
      mileage: 67100,
      fuelType: 'Gasoline',
      remainFuel: 50,
      batteryVoltage: 12.0,
      lowVoltage: false,
      speed: 0,
      rpm: 0,
      gpsStatus: true,
      gprsStatus: true,
      telemetryStale: false,
      rentalStatus: false,
      receivedAt: '2026-08-26 14:17:28',
      iduGpsTime: '2026-08-26 14:16:47',
      latitude: '22.6877',
      longitude: '120.2949',
      address: '高雄市左營區高鐵路105號 (合作修理廠內)',
      status: 'MAINTENANCE',
      orderInfo: null
    }, {
      id: 6,
      plate: 'RCF-0099',
      vehicleType: 'Vehicle',
      brand: 'Tesla',
      model: 'Model Y Performance',
      group: '純電SUV E組',
      serviceType: '甲租乙還',
      station: 'RIMO 北區車行 / 臺北車站門市 / 臺北車站前據點',
      mileage: 18450,
      fuelType: 'EV',
      remainFuel: 12,
      batteryVoltage: 12.6,
      lowVoltage: false,
      speed: 0,
      rpm: 0,
      gpsStatus: false,
      gprsStatus: true,
      telemetryStale: false,
      rentalStatus: false,
      receivedAt: '2026-08-26 14:16:37',
      iduGpsTime: '2026-08-26 14:15:58',
      latitude: '25.0143',
      longitude: '121.4622',
      address: '新北市板橋區縣民大道二段7號 (板橋車站B3超充站充電中)',
      status: 'IDLE',
      orderInfo: null
    }, {
      id: 7,
      plate: 'MEV-1028',
      vehicleType: 'MicroEV',
      brand: 'RIMO',
      model: '微電動車 M1',
      group: '微電車 M組',
      serviceType: '同站租還 / 甲租乙還',
      station: 'RIMO 北區車行 / 臺北車站門市 / 臺北車站前據點',
      mileage: 12680,
      fuelType: 'EV',
      rsoc: 79,
      remainingDistance: 73,
      dcVoltage: 54.35,
      lowVoltage: false,
      speed: 0,
      motorStarted: false,
      gpsStatus: true,
      gprsStatus: true,
      telemetryStale: false,
      rentalStatus: false,
      receivedAt: '2026-08-26 14:20:36',
      iduGpsTime: '2026-08-26 14:19:54',
      latitude: '25.0478',
      longitude: '121.5170',
      address: '臺北市中正區北平西路3號 (站區微電車停車區)',
      status: 'IDLE',
      orderInfo: null
    }, {
      id: 8,
      plate: 'MEV-2036',
      vehicleType: 'MicroEV',
      brand: 'RIMO',
      model: '微電動車 M1',
      group: '微電車 M組',
      serviceType: '甲租乙還',
      station: 'RIMO 北區車行 / 松山機場門市 / 第一航廈門口據點',
      mileage: 8842,
      fuelType: 'EV',
      rsoc: 18,
      remainingDistance: 16,
      dcVoltage: 48.2,
      lowVoltage: false,
      speed: 32,
      motorStarted: true,
      gpsStatus: true,
      gprsStatus: true,
      telemetryStale: false,
      rentalStatus: false,
      receivedAt: '2026-08-26 14:20:42',
      iduGpsTime: '2026-08-26 14:20:06',
      latitude: '25.0591',
      longitude: '121.5489',
      address: '臺北市松山區民權東路三段近敦化北路',
      status: 'RENTED',
      orderInfo: {
        orderNo: 'ORD-MEV-20260826-008',
        status: 'ACTIVE',
        returnTime: '今日 16:30',
        returnStation: '臺北車站門店'
      }
    }, {
      id: 9,
      plate: 'MEV-3168',
      vehicleType: 'MicroEV',
      brand: 'RIMO',
      model: '微電動車 M2',
      group: '微電車 M組',
      serviceType: '同站租還',
      station: 'RIMO 高雄車行 / 左營高鐵站門市 / 高鐵站西側據點',
      mileage: 20315,
      fuelType: 'EV',
      rsoc: 5,
      remainingDistance: 4,
      dcVoltage: 43.8,
      lowVoltage: true,
      speed: 0,
      motorStarted: false,
      gpsStatus: true,
      gprsStatus: true,
      telemetryStale: false,
      rentalStatus: false,
      receivedAt: '2026-08-26 14:19:05',
      iduGpsTime: '2026-08-26 14:18:28',
      latitude: '22.6877',
      longitude: '120.2949',
      address: '高雄市左營區高鐵路105號 (微電車充電區)',
      status: 'IDLE',
      orderInfo: null
    }, {
      id: 10,
      plate: 'MEV-5392',
      vehicleType: 'MicroEV',
      brand: 'RIMO',
      model: '微電動車 M2',
      group: '微電車 M組',
      serviceType: '甲租乙還',
      station: 'RIMO 北區車行 / 臺北車站門市 / 臺北車站前據點',
      mileage: null,
      fuelType: 'EV',
      rsoc: null,
      remainingDistance: null,
      dcVoltage: null,
      lowVoltage: null,
      speed: null,
      motorStarted: null,
      gpsStatus: false,
      gprsStatus: false,
      telemetryStale: true,
      rentalStatus: null,
      receivedAt: '2026-08-26 13:52:10',
      iduGpsTime: 'NA',
      latitude: 'NA',
      longitude: 'NA',
      address: 'NA',
      status: 'IDLE',
      orderInfo: null
    }]);
    const normalizeNumber = value => {
      if (value === null || value === undefined || value === '' || value === 'NA') return null;
      const number = Number(value);
      return Number.isFinite(number) ? number : null;
    };
    const getEnergyLevel = row => normalizeNumber(row.vehicleType === 'MicroEV' ? row.rsoc : row.remainFuel);
    const getEnergyLabel = row => {
      if (row.vehicleType === 'MicroEV') return 'SOC';
      return row.fuelType === 'EV' ? '電量' : '油量';
    };
    const getEnergyTitle = row => {
      const value = getEnergyLevel(row);
      return `${getEnergyLabel(row)}：${value === null ? 'NA' : value + '%'}`;
    };
    const getEnergyTextClass = row => {
      const value = getEnergyLevel(row);
      if (value === null) return 'text-gray-400';
      if (value < 10) return 'text-red-500';
      if (value < 30) return 'text-amber-500';
      return 'text-emerald-600';
    };
    const getEnergyBarClass = row => {
      const value = getEnergyLevel(row);
      if (value === null) return 'bg-gray-300';
      if (value < 10) return 'bg-red-500';
      if (value < 30) return 'bg-amber-500';
      return 'bg-emerald-500';
    };
    const formatPercentage = value => value === null ? 'NA' : `${value}%`;
    const formatMetric = (value, unit, grouped = false) => {
      const number = normalizeNumber(value);
      if (number === null) return 'NA';
      const displayValue = grouped ? number.toLocaleString('zh-CN') : number;
      return `${displayValue} ${unit}`;
    };
    const formatShortTime = value => {
      if (!value || value === 'NA' || !dayjs(value).isValid()) return 'NA';
      return dayjs(value).format('MM-DD HH:mm');
    };
    const formatBooleanState = (value, trueText, falseText) => {
      if (value === true) return trueText;
      if (value === false) return falseText;
      return 'NA';
    };
    const isDeviceOnline = row => row.gprsStatus === true && row.telemetryStale !== true;
    const getConnectionText = row => {
      if (row.gprsStatus === null || row.gprsStatus === undefined) return 'NA';
      return isDeviceOnline(row) ? '在線' : '離線';
    };
    const getConnectionTitle = row => {
      const gprsText = getConnectionText(row);
      const gpsText = formatBooleanState(row.gpsStatus, '有效定位', '無效定位');
      return `通訊：${gprsText}；GPS：${gpsText}；平臺接收時間：${row.receivedAt || 'NA'}`;
    };
    const attentionFilterValues = ['communication', 'location', 'lowEnergy', 'lowVoltage', 'securityUnlocked', 'centralUnlocked', 'doorOpen', 'keyNotReturned'];
    const hasMapPosition = row => validCoordinates(row.latitude, row.longitude);
    const mapDialogVisible = ref(false);
    const mapDialogVehicle = ref(null);
    const openMapDialog = row => {
      if (!hasMapPosition(row)) return;
      mapDialogVehicle.value = row;
      mapDialogVisible.value = true;
    };
    const historyDialogVisible = ref(false);
    const historyTargetVehicle = ref(null);
    const historyDateRange = ref([]);
    const historyGpsDateRange = ref([]);
    const historyFilters = reactive({
      gpsStatus: '',
      gprsStatus: ''
    });
    const historyPage = ref(1);
    const historyPageSize = ref(10);
    const buildBatterySlots = (energy, index) => [1, 2, 3].map(slot => ({
      slot: `${slot}號倉`,
      soc: energy === null ? null : Math.max(0, Math.min(100, energy - (slot - 1) * 2 + index % 3)),
      current: energy === null ? null : Number((0.08 + slot * 0.03).toFixed(2)),
      tempLow: energy === null ? 'NA' : 23 + slot,
      tempHigh: energy === null ? 'NA' : 25 + slot,
      serialNo: energy === null ? 'NA' : `BAT-${slot}-${String(1200 - index).padStart(4, '0')}`,
      firmware: energy === null ? 'NA' : '3E55'
    }));
    const buildHistoryRecords = vehicle => Array.from({
      length: 28
    }, (_, index) => {
      const receivedAt = dayjs(vehicle.receivedAt).subtract(index * 20, 'minute');
      const gpsTime = dayjs(vehicle.iduGpsTime).subtract(index * 20 + 1, 'minute');
      const baseEnergy = getEnergyLevel(vehicle);
      const energy = baseEnergy === null ? null : Math.max(0, Math.min(100, baseEnergy + index % 7 * 2));
      const isOffline = index === 17;
      const gpsInvalid = index === 9;
      const speed = normalizeNumber(vehicle.speed) === null ? null : Math.max(0, Number(vehicle.speed) - index % 4 * 5);
      const snapshot = {
        ...vehicle,
        snapshotId: `${vehicle.plate}-${receivedAt.format('YYYYMMDDHHmmss')}`,
        receivedAt: receivedAt.format('YYYY-MM-DD HH:mm:ss'),
        iduGpsTime: gpsTime.isValid() ? gpsTime.format('YYYY-MM-DD HH:mm:ss') : 'NA',
        gpsStatus: isOffline ? false : gpsInvalid ? false : vehicle.gpsStatus,
        gprsStatus: isOffline ? false : vehicle.gprsStatus,
        telemetryStale: isOffline,
        speed,
        accStatus: speed !== null ? speed > 0 : null,
        powerOnStatus: speed !== null ? speed > 0 : null,
        lightStatus: speed !== null ? speed > 0 : null,
        motorStarted: speed !== null ? speed > 0 : null,
        securityStatus: index === 11 ? false : vehicle.securityStatus,
        doorLockStatus: index === 13 ? false : vehicle.doorLockStatus,
        doorStatus: index === 15 ? true : vehicle.doorStatus,
        iButtonStatus: index === 19 ? false : vehicle.iButtonStatus,
        latitude: hasMapPosition(vehicle) ? (Number(vehicle.latitude) + index * 0.00002).toFixed(6) : 'NA',
        longitude: hasMapPosition(vehicle) ? (Number(vehicle.longitude) + index * 0.00002).toFixed(6) : 'NA'
      };
      if (vehicle.vehicleType === 'MicroEV') {
        snapshot.rsoc = energy;
        snapshot.batterySlots = buildBatterySlots(energy, index);
      } else {
        snapshot.remainFuel = energy;
      }
      return snapshot;
    });
    const historyRecords = computed(() => historyTargetVehicle.value ? buildHistoryRecords(historyTargetVehicle.value) : []);
    const filteredHistoryRecords = computed(() => {
      const [start, end] = historyDateRange.value || [];
      const [gpsStart, gpsEnd] = historyGpsDateRange.value || [];
      return historyRecords.value.filter(record => {
        if (start && dayjs(record.receivedAt).isBefore(dayjs(start))) return false;
        if (end && dayjs(record.receivedAt).isAfter(dayjs(end))) return false;
        if (gpsStart && dayjs(record.iduGpsTime).isBefore(dayjs(gpsStart))) return false;
        if (gpsEnd && dayjs(record.iduGpsTime).isAfter(dayjs(gpsEnd))) return false;
        if (!matchesHistoryBoolean(record.gpsStatus, historyFilters.gpsStatus)) return false;
        if (!matchesHistoryBoolean(isDeviceOnline(record), historyFilters.gprsStatus)) return false;
        return true;
      });
    });
    const pagedHistoryRecords = computed(() => {
      const start = (historyPage.value - 1) * historyPageSize.value;
      return filteredHistoryRecords.value.slice(start, start + historyPageSize.value);
    });
    const openHistoryDialog = row => {
      historyTargetVehicle.value = row;
      historyDateRange.value = [];
      historyGpsDateRange.value = [];
      Object.keys(historyFilters).forEach(key => {
        historyFilters[key] = '';
      });
      historyPage.value = 1;
      historyPageSize.value = 10;
      historyDialogVisible.value = true;
    };
    const matchesHistoryBoolean = (value, filterValue) => {
      if (!filterValue) return true;
      return filterValue === 'true' ? value === true : value === false;
    };
    const getBatterySlotValue = (row, index, field) => {
      const slot = Array.isArray(row.batterySlots) ? row.batterySlots[index] : null;
      return slot && slot[field] !== undefined ? slot[field] : null;
    };
    const onHistoryFilterChange = () => {
      historyPage.value = 1;
    };
    const resetHistoryFilters = () => {
      historyDateRange.value = [];
      historyGpsDateRange.value = [];
      Object.keys(historyFilters).forEach(key => {
        historyFilters[key] = '';
      });
      historyPage.value = 1;
    };
    const getAttentionTypes = row => {
      const items = [];
      const energy = getEnergyLevel(row);
      if (row.gprsStatus === false || row.telemetryStale === true) {
        items.push({
          key: 'communication',
          label: '通訊異常',
          type: 'info'
        });
      }
      if (isDeviceOnline(row) && row.gpsStatus === false) {
        items.push({
          key: 'location',
          label: '定位異常',
          type: 'info'
        });
      }
      if (energy !== null && energy < 30) {
        items.push({
          key: 'lowEnergy',
          label: '低電量',
          type: energy < 10 ? 'danger' : 'warning'
        });
      }
      if (row.lowVoltage === true) {
        items.push({
          key: 'lowVoltage',
          label: '低電壓',
          type: 'danger'
        });
      }
      if (isVehicleSecurityCheckEligible(row)) {
        if (row.securityStatus === false) {
          items.push({
            key: 'securityUnlocked',
            label: '防盜未上鎖',
            type: 'warning'
          });
        }
        if (row.doorLockStatus === false) {
          items.push({
            key: 'centralUnlocked',
            label: '中控未上鎖',
            type: 'warning'
          });
        }
        if (row.doorStatus === true) {
          items.push({
            key: 'doorOpen',
            label: '車門未全關',
            type: 'warning'
          });
        }
        if (row.iButtonStatus === false) {
          items.push({
            key: 'keyNotReturned',
            label: '電子鑰匙未回位',
            type: 'warning'
          });
        }
      }
      return items;
    };
    const isVehicleSecurityCheckEligible = row => row.vehicleType === 'Vehicle' && isDeviceOnline(row) && row.status === 'IDLE' && !row.orderInfo && row.rentalStatus === false;
    const getRealtimeAttentionTypes = row => getAttentionTypes(row).filter(item => item.key !== 'lowVoltage');
    const getConsoleHref = row => `./vehicle_console.html?plate=${encodeURIComponent(row.plate)}`;
    const attentionVehicleCount = computed(() => mockData.value.filter(item => getAttentionTypes(item).length > 0).length);
    const filteredData = computed(() => {
      return mockData.value.filter(item => {
        let match = true;
        if (filters.keyword) {
          const q = filters.keyword.toLowerCase();
          match = match && [item.plate, item.brand, item.model, item.vin, item.iduId, item.cid].some(value => String(value ?? '').toLowerCase().includes(q));
        }
        if (filters.station) {
          if (filters.station === 'S-TPE') match = match && item.station.includes('臺北車站');
          if (filters.station === 'S-TSA') match = match && item.station.includes('松山機場');
          if (filters.station === 'S-KHH') match = match && item.station.includes('左營高鐵');
        }
        if (filters.vehicleType) {
          match = match && item.vehicleType === filters.vehicleType;
        }
        if (filters.status) {
          match = match && item.status === filters.status;
        }
        if (advancedFilters.group) {
          match = match && item.group === advancedFilters.group;
        }
        if (advancedFilters.fuelType) {
          match = match && item.fuelType === advancedFilters.fuelType;
        }
        if (advancedFilters.orderState) {
          match = match && (advancedFilters.orderState === 'occupied' ? !!item.orderInfo : !item.orderInfo);
        }
        if (advancedFilters.attentionState.length) {
          match = match && getAttentionTypes(item).some(attention => advancedFilters.attentionState.includes(attention.key));
        }
        return match;
      });
    });
    const currentPage = ref(1);
    const pageSize = ref(10);
    const pagedData = computed(() => {
      const start = (currentPage.value - 1) * pageSize.value;
      return filteredData.value.slice(start, start + pageSize.value);
    });
    watch(filteredData, () => {
      currentPage.value = 1;
    });
    const groupOptions = computed(() => [...new Set(mockData.value.map(item => item.group))]);
    const resetFilters = () => {
      filters.keyword = '';
      filters.station = '';
      filters.vehicleType = '';
      filters.status = '';
      advancedFilters.group = '';
      advancedFilters.fuelType = '';
      advancedFilters.orderState = '';
      advancedFilters.attentionState = [];
      searchPanelExpanded.value = false;
      currentPage.value = 1;
    };
    const isSameAttentionSelection = () => advancedFilters.attentionState.length === attentionFilterValues.length && attentionFilterValues.every(value => advancedFilters.attentionState.includes(value));
    const isSummaryFilterActive = type => {
      if (type === 'pool') return !filters.status && !advancedFilters.attentionState.length;
      if (type === 'rented') return filters.status === 'RENTED' && !advancedFilters.attentionState.length;
      return !filters.status && isSameAttentionSelection();
    };
    const toggleSummaryFilter = type => {
      if (isSummaryFilterActive(type)) {
        filters.status = '';
        advancedFilters.attentionState = [];
        return;
      }
      if (type === 'rented') {
        filters.status = 'RENTED';
        advancedFilters.attentionState = [];
        return;
      }
      filters.status = '';
      advancedFilters.attentionState = type === 'attention' ? [...attentionFilterValues] : [];
    };
    return {
      tableData: mockData,
      filteredData,
      pagedData,
      currentPage,
      pageSize,
      filters,
      searchPanelExpanded,
      advancedFilters,
      groupOptions,
      attentionVehicleCount,
      resetFilters,
      getEnergyLevel,
      getEnergyLabel,
      getEnergyTitle,
      getEnergyTextClass,
      getEnergyBarClass,
      formatPercentage,
      formatMetric,
      formatShortTime,
      formatBooleanState,
      isDeviceOnline,
      getConnectionText,
      getConnectionTitle,
      hasMapPosition,
      mapDialogVisible,
      mapDialogVehicle,
      openMapDialog,
      historyDialogVisible,
      historyTargetVehicle,
      historyDateRange,
      historyGpsDateRange,
      historyFilters,
      historyPage,
      historyPageSize,
      filteredHistoryRecords,
      pagedHistoryRecords,
      openHistoryDialog,
      resetHistoryFilters,
      onHistoryFilterChange,
      getBatterySlotValue,
      getAttentionTypes,
      getRealtimeAttentionTypes,
      getConsoleHref,
      isSummaryFilterActive,
      toggleSummaryFilter,
      mockData,
      normalizeNumber,
      attentionFilterValues,
      buildBatterySlots,
      buildHistoryRecords,
      historyRecords,
      matchesHistoryBoolean,
      isVehicleSecurityCheckEligible,
      isSameAttentionSelection
    };
  }
  return pageSetup();
}
