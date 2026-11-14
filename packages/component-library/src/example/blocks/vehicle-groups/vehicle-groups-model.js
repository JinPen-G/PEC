/** Adapted from Preview vehicle-group prototype. Source and hashes are recorded in the example source manifest. */
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
      derived: computed
    } = model;
    const {
      ElMessage: _ElMessage,
      ElMessageBox: _ElMessageBox
    } = feedback;
    const groupsData = ref([{
      id: 'G1',
      brand: 'Tesla',
      model: 'Model 3',
      year: '2023',
      vehicleType: 'car',
      originType: 'imported',
      seatCount: 5,
      displacement: '純電',
      fuelTankCapacity: 0,
      trunkCapacity: 425,
      defaultPhotoUrl: '',
      features: ['自動駕駛', '全景天窗', '超充支持']
    }, {
      id: 'G2',
      brand: 'Hyundai',
      model: 'IONIQ 5',
      year: '2024',
      vehicleType: 'car',
      originType: 'imported',
      seatCount: 5,
      displacement: '純電',
      fuelTankCapacity: 0,
      trunkCapacity: 527,
      defaultPhotoUrl: '',
      features: ['800V快充', 'V2L外放', '雙12.3寸屏']
    }, {
      id: 'G3',
      brand: 'BMW',
      model: 'R 1250 GS',
      year: '2023',
      vehicleType: 'motorcycle',
      originType: 'imported',
      seatCount: 2,
      displacement: '1254cc',
      fuelTankCapacity: 20,
      trunkCapacity: 0,
      defaultPhotoUrl: '',
      features: ['ABS', '加熱把手', '電子懸掛']
    }, {
      id: 'G4',
      brand: 'Honda',
      model: 'Rebel 500',
      year: '2022',
      vehicleType: 'motorcycle',
      originType: 'imported',
      seatCount: 2,
      displacement: '471cc',
      fuelTankCapacity: 11,
      trunkCapacity: 0,
      defaultPhotoUrl: '',
      features: ['低座高', '復古風格']
    }, {
      id: 'G5',
      brand: 'Example',
      model: 'Mini EV',
      year: '2024',
      vehicleType: 'microElectric',
      originType: 'domestic',
      seatCount: 2,
      displacement: '純電',
      fuelTankCapacity: 0,
      trunkCapacity: 80,
      defaultPhotoUrl: '',
      features: ['免駕照', '低速代步', '團體票券']
    }]);
    const dialogVisible = ref(false);
    const isEdit = ref(false);
    const currentGroup = reactive({});
    const featureInput = ref('');
    const brandManagerVisible = ref(false);
    const newBrandInput = ref('');
    const newBrandTypes = ref(['car']);
    const brandOptions = ref([{
      name: 'Toyota (豐田)',
      types: ['car']
    }, {
      name: 'Honda (本田)',
      types: ['car', 'motorcycle']
    }, {
      name: 'Nissan (日產)',
      types: ['car']
    }, {
      name: 'Ford (福特)',
      types: ['car']
    }, {
      name: 'Hyundai (現代)',
      types: ['car']
    }, {
      name: 'Benz (奔馳)',
      types: ['car']
    }, {
      name: 'BMW (寶馬)',
      types: ['car', 'motorcycle']
    }, {
      name: 'Audi (奧迪)',
      types: ['car']
    }, {
      name: 'Lexus (雷克薩斯)',
      types: ['car']
    }, {
      name: 'Tesla (特斯拉)',
      types: ['car']
    }, {
      name: 'Volvo (沃爾沃)',
      types: ['car']
    }, {
      name: 'Porsche (保時捷)',
      types: ['car']
    }, {
      name: 'Mazda (馬自達)',
      types: ['car']
    }, {
      name: 'Volkswagen (大衆)',
      types: ['car']
    }, {
      name: 'Suzuki (鈴木)',
      types: ['car', 'motorcycle']
    }, {
      name: 'MG (名爵)',
      types: ['car']
    }, {
      name: 'BYD (比亞迪)',
      types: ['car']
    }, {
      name: 'RIMO',
      types: ['microElectric']
    }, {
      name: 'Micro Mobility',
      types: ['microElectric']
    }, {
      name: 'Yamaha (雅馬哈)',
      types: ['motorcycle']
    }, {
      name: 'Kawasaki (川崎)',
      types: ['motorcycle']
    }, {
      name: 'Ducati (杜卡迪)',
      types: ['motorcycle']
    }]);
    const getVehicleTypeLabel = type => {
      const map = {
        car: '汽車',
        motorcycle: '摩托車',
        microElectric: '微電車'
      };
      return map[type] || '-';
    };
    const getVehicleTypeTagType = type => {
      const map = {
        car: 'success',
        motorcycle: 'warning',
        microElectric: 'info'
      };
      return map[type] || 'info';
    };
    const availableBrands = computed(() => {
      if (!currentGroup.vehicleType) return [];
      return brandOptions.value.filter(b => b.types && b.types.includes(currentGroup.vehicleType));
    });
    const openBrandManager = () => {
      brandManagerVisible.value = true;
      newBrandInput.value = '';
      newBrandTypes.value = ['car'];
    };
    const addBrand = () => {
      const val = newBrandInput.value.trim();
      if (!val || newBrandTypes.value.length === 0) return;
      if (brandOptions.value.some(b => b.name === val)) {
        feedback.ElMessage.warning('該品牌已存在');
        return;
      }
      brandOptions.value.unshift({
        name: val,
        types: [...newBrandTypes.value]
      });
      newBrandInput.value = '';
      newBrandTypes.value = ['car'];
      feedback.ElMessage.success('添加成功');
    };
    const removeBrand = index => {
      brandOptions.value.splice(index, 1);
      feedback.ElMessage.success('已移除');
    };
    const normalizePhotoList = group => {
      const photos = Array.isArray(group.photoList) && group.photoList.length ? group.photoList : group.defaultPhotoUrl ? [{
        name: '車型照片1',
        url: group.defaultPhotoUrl
      }] : [];
      group.photoList = photos.map((photo, index) => ({
        name: photo.name || `車型照片${index + 1}`,
        url: photo.url || photo.response?.url || ''
      })).filter(photo => photo.url);
      group.defaultPhotoUrl = group.photoList[0]?.url || '';
    };
    const normalizeGroupFields = group => {
      Object.assign(group, {
        originType: group.originType || '',
        seatCount: group.seatCount ?? (group.vehicleType === 'car' ? 5 : 2),
        displacement: group.displacement || '',
        fuelTankCapacity: group.fuelTankCapacity ?? 0,
        trunkCapacity: group.trunkCapacity ?? 0,
        defaultPhotoUrl: group.defaultPhotoUrl || '',
        features: Array.isArray(group.features) ? group.features : []
      });
      normalizePhotoList(group);
    };
    const handleVehicleTypeChange = vehicleType => {
      if (currentGroup.brand && !availableBrands.value.some(item => item.name === currentGroup.brand)) {
        currentGroup.brand = '';
      }
      if (!isEdit.value) {
        currentGroup.seatCount = vehicleType === 'car' ? 5 : 2;
      }
    };
    const handlePhotoChange = uploadFile => {
      if (!uploadFile || !uploadFile.raw) return;
      if (!Array.isArray(currentGroup.photoList)) currentGroup.photoList = [];
      currentGroup.photoList.push({
        name: uploadFile.name || `車型照片${currentGroup.photoList.length + 1}`,
        url: uploadFile.url || URL.createObjectURL(uploadFile.raw)
      });
      currentGroup.defaultPhotoUrl = currentGroup.photoList[0]?.url || '';
    };
    const removePhotoByIndex = index => {
      if (!Array.isArray(currentGroup.photoList)) return;
      currentGroup.photoList.splice(index, 1);
      currentGroup.defaultPhotoUrl = currentGroup.photoList[0]?.url || '';
    };
    const clearPhoto = () => {
      currentGroup.photoList = [];
      currentGroup.defaultPhotoUrl = '';
    };
    const openDialog = row => {
      if (row) {
        isEdit.value = true;
        Object.assign(currentGroup, JSON.parse(JSON.stringify(row)));
        normalizeGroupFields(currentGroup);
        featureInput.value = currentGroup.features ? currentGroup.features.join(',') : '';
      } else {
        isEdit.value = false;
        Object.assign(currentGroup, {
          id: Date.now(),
          vehicleType: '',
          brand: '',
          model: '',
          year: new Date().getFullYear().toString(),
          originType: '',
          seatCount: 5,
          displacement: '',
          fuelTankCapacity: 0,
          trunkCapacity: 0,
          defaultPhotoUrl: '',
          photoList: [],
          features: []
        });
        normalizeGroupFields(currentGroup);
        featureInput.value = '';
      }
      dialogVisible.value = true;
    };
    const parseFeatures = () => {
      if (!featureInput.value) {
        currentGroup.features = [];
        return;
      }
      currentGroup.features = featureInput.value.split(/[,，]/).map(s => s.trim()).filter(s => s);
    };
    const saveGroup = () => {
      parseFeatures();
      normalizeGroupFields(currentGroup);
      if (!currentGroup.vehicleType || !currentGroup.brand || !currentGroup.model) {
        feedback.ElMessage.warning('請先選擇載具類型，並填寫廠牌和型號');
        return;
      }
      if (isEdit.value) {
        const idx = groupsData.value.findIndex(g => g.id === currentGroup.id);
        if (idx !== -1) groupsData.value[idx] = {
          ...currentGroup
        };
      } else {
        groupsData.value.push({
          ...currentGroup
        });
      }
      dialogVisible.value = false;
      feedback.ElMessage.success('保存成功');
    };
    const deleteGroup = row => {
      feedback.ElMessageBox.confirm('確定要刪除該車型組嗎?', '警告', {
        type: 'warning'
      }).then(() => {
        const idx = groupsData.value.findIndex(g => g.id === row.id);
        if (idx !== -1) {
          groupsData.value.splice(idx, 1);
          feedback.ElMessage.success('刪除成功');
        }
      });
    };
    const searchQuery = ref('');
    const filteredGroups = computed(() => {
      if (!searchQuery.value) return groupsData.value;
      const q = searchQuery.value.toLowerCase();
      return groupsData.value.filter(g => g.brand.toLowerCase().includes(q) || g.model.toLowerCase().includes(q));
    });
    return {
      groupsData,
      filteredGroups,
      searchQuery,
      dialogVisible,
      isEdit,
      currentGroup,
      featureInput,
      openDialog,
      saveGroup,
      deleteGroup,
      parseFeatures,
      handleVehicleTypeChange,
      handlePhotoChange,
      removePhotoByIndex,
      clearPhoto,
      brandOptions,
      availableBrands,
      brandManagerVisible,
      newBrandInput,
      newBrandTypes,
      openBrandManager,
      addBrand,
      removeBrand,
      getVehicleTypeLabel,
      getVehicleTypeTagType,
      ElMessage: feedback.ElMessage,
      ElMessageBox: feedback.ElMessageBox,
      normalizePhotoList,
      normalizeGroupFields
    };
  }
  return pageSetup();
}
