import dayjs from 'dayjs';
import { downloadCsv } from '../../lib/rimo-data-tools.js';
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
      record: _reactive
    } = model;
    const mockDevices = ref([{
      id: 1,
      cid: 'TBX-123456-A1',
      model: 'RIMO-TBOX-V3.2',
      sim: '8988601234567890123',
      warrantyDate: '2028-05-20',
      version1: 'B22.09.11',
      version2: 'APP_v4.5.1',
      supportsIbutton: true,
      ibuttonCode: 'IB-9908123A',
      powerOnTime: dayjs().subtract(5, 'day').format('YYYY-MM-DD HH:mm:ss'),
      lastReturnTime: dayjs().subtract(2, 'minute').format('YYYY-MM-DD HH:mm:ss'),
      boundPlate: 'RAB-1234',
      vehicleModel: 'Model 3 長續航'
    }, {
      id: 2,
      cid: 'TBX-654321-B2',
      model: 'RIMO-TBOX-V3.2',
      sim: '8988601234567890456',
      warrantyDate: '2027-11-15',
      version1: 'B22.09.11',
      version2: 'APP_v4.2.0',
      supportsIbutton: true,
      ibuttonCode: 'IB-7708333B',
      powerOnTime: dayjs().subtract(2, 'day').format('YYYY-MM-DD HH:mm:ss'),
      lastReturnTime: dayjs().subtract(5, 'second').format('YYYY-MM-DD HH:mm:ss'),
      boundPlate: 'RDZ-5566',
      vehicleModel: 'Model 3 標準版'
    }, {
      id: 3,
      cid: 'TBX-111111-C3',
      model: 'LITE-TBOX-V2.0',
      sim: '8988601234567890789',
      warrantyDate: '2025-01-10',
      version1: 'B18.01.01',
      version2: 'APP_v2.1.0',
      supportsIbutton: false,
      ibuttonCode: null,
      powerOnTime: dayjs().subtract(30, 'day').format('YYYY-MM-DD HH:mm:ss'),
      lastReturnTime: dayjs().subtract(1, 'hour').format('YYYY-MM-DD HH:mm:ss'),
      boundPlate: 'TCD-9900',
      vehicleModel: 'Toyota Alphard'
    }, {
      id: 4,
      cid: 'TBX-998877-K9',
      model: 'RIMO-TBOX-V4.MAX',
      sim: '8988609999999990111',
      warrantyDate: '2029-12-31',
      version1: 'B24.01.05',
      version2: 'APP_v5.0.0',
      supportsIbutton: true,
      ibuttonCode: null,
      powerOnTime: null,
      lastReturnTime: null,
      boundPlate: null,
      vehicleModel: null
    }, {
      id: 5,
      cid: 'TBX-333333-E5',
      model: 'RIMO-TBOX-V3.2',
      sim: '8988601234567890222',
      warrantyDate: '2028-06-01',
      version1: 'B22.09.11',
      version2: 'APP_v4.5.1',
      supportsIbutton: true,
      ibuttonCode: 'IB-5508111C',
      powerOnTime: dayjs().subtract(1, 'hour').format('YYYY-MM-DD HH:mm:ss'),
      lastReturnTime: dayjs().subtract(5, 'minute').format('YYYY-MM-DD HH:mm:ss'),
      boundPlate: 'EAB-1234',
      vehicleModel: 'Model Y'
    }]);
    const allMockVehicles = [{
      plate: 'REN-8888',
      model: 'Porsche Macan'
    }, {
      plate: 'AAA-0001',
      model: 'Tesla Model X'
    }, {
      plate: 'BBB-0002',
      model: 'Toyota Camry'
    }, {
      plate: 'CCC-0003',
      model: 'Honda CR-V'
    }];
    for (const device of mockDevices.value)
      if (device.boundPlate && !allMockVehicles.some(vehicle => vehicle.plate === device.boundPlate))
        allMockVehicles.push({ plate: device.boundPlate, model: device.vehicleModel });
    const unboundVehicles = computed(() => {
      const boundPlates = mockDevices.value.filter(d => d.boundPlate).map(d => d.boundPlate);
      return allMockVehicles.filter(v => !boundPlates.includes(v.plate));
    });
    const searchQuery = ref('');
    const statusFilter = ref('ALL');
    const filteredDevices = computed(() => {
      let result = mockDevices.value;
      if (statusFilter.value === 'BOUND') {
        result = result.filter(d => !!d.boundPlate);
      } else if (statusFilter.value === 'UNBOUND') {
        result = result.filter(d => !d.boundPlate);
      }
      if (searchQuery.value) {
        const q = searchQuery.value.toLowerCase();
        result = result.filter(d => d.cid.toLowerCase().includes(q) || d.sim.includes(q) || d.boundPlate && d.boundPlate.toLowerCase().includes(q));
      }
      return result;
    });
    const boundCount = computed(() => mockDevices.value.filter(d => d.boundPlate).length);
    const unboundCount = computed(() => mockDevices.value.filter(d => !d.boundPlate).length);
    const handleExport = () => downloadCsv('tbox-devices.csv', [
      ['cid', 'CID'], ['sim', 'SIM'], ['model', '車機型號'], ['warrantyDate', '保固到期'],
      ['version1', '底層版本'], ['version2', '應用版本'], ['supportsIbutton', '支持電子鑰匙'], ['ibuttonCode', 'iButton'],
      ['powerOnTime', '開機時間'], ['lastReturnTime', '最近通訊'], ['boundPlate', '綁定車牌'], ['vehicleModel', '車型'],
    ].map(([key, label]) => ({ key, label })), filteredDevices.value);
    const isExpiringSoon = date => {
      if (!date) return false;
      const diff = dayjs(date).diff(dayjs(), 'day');
      return diff < 30;
    };
    const isOnline = time => {
      if (!time) return false;
      const diffMins = dayjs().diff(dayjs(time), 'minute');
      return diffMins < 10;
    };
    const bindDialogVisible = ref(false);
    const isChanging = ref(false);
    const selectedDevice = ref(null);
    const targetPlate = ref('');
    const isSubmitting = ref(false);
    const openBindDialog = (device, changeMode = false) => {
      selectedDevice.value = {
        ...device
      };
      isChanging.value = changeMode;
      targetPlate.value = '';
      bindDialogVisible.value = true;
    };
    const unbindVehicle = device => {
      const requested = { id: device.id, plate: device.boundPlate, cid: device.cid };
      return feedback.ElMessageBox.confirm(`確認要將車機 ${requested.cid} 與車輛 ${requested.plate} 解除綁定嗎？解綁後將失去對該車輛的遠程控制權限。`, '解除綁定確認', {
        confirmButtonText: '確認解綁',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const index = mockDevices.value.findIndex(d => d.id === requested.id);
        if (index > -1) {
          if (mockDevices.value[index].boundPlate !== requested.plate) { feedback.ElMessage.error('設備綁定已變更，請刷新後重試'); return; }
          mockDevices.value[index].boundPlate = null;
          mockDevices.value[index].vehicleModel = null;
          feedback.ElMessage.success('已成功解除綁定');
        }
      }).catch(error => { if (error?.message !== 'cancel') feedback.ElMessage.error('解除綁定未完成，請重試'); });
    };
    const confirmBinding = () => {
      if (isSubmitting.value || !selectedDevice.value || !targetPlate.value) return;
      const deviceId = selectedDevice.value.id;
      const requestedPlate = targetPlate.value;
      const changeMode = isChanging.value;
      isSubmitting.value = true;
      window.setTimeout(() => {
        const index = mockDevices.value.findIndex(d => d.id === deviceId);
        const newVehicle = unboundVehicles.value.find(v => v.plate === requestedPlate);
        if (!newVehicle) { isSubmitting.value = false; feedback.ElMessage.error('目標車輛已被綁定，請重新選擇'); return; }
        if (index > -1) {
          mockDevices.value[index].boundPlate = newVehicle.plate;
          mockDevices.value[index].vehicleModel = newVehicle.model;
          feedback.ElMessage.success(changeMode ? '車機換綁成功！' : '車機綁定成功！');
          if (selectedDevice.value?.id === deviceId && targetPlate.value === requestedPlate) bindDialogVisible.value = false;
        }
        isSubmitting.value = false;
      }, 800);
    };
    return {
      devices: mockDevices,
      filteredDevices,
      searchQuery,
      statusFilter,
      boundCount,
      unboundCount,
      handleExport,
      isExpiringSoon,
      isOnline,
      bindDialogVisible,
      isChanging,
      selectedDevice,
      targetPlate,
      unboundVehicles,
      isSubmitting,
      openBindDialog,
      confirmBinding,
      unbindVehicle,
      mockDevices,
      allMockVehicles
    };
  }
  return pageSetup();
}
