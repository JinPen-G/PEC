import { Fragment } from 'react';
import { useRimoModel, rimoEntries } from '../../lib/rimo-model.js';
import { RimoRoot, RimoIcon, useRimoEnvironment } from '../../lib/RimoEnvironment.jsx';
import { RimoElement, RimoList, rimoClass, rimoStyle, rimoText } from '../../lib/RimoElements.jsx';
import './stations.css';
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
      derived: computed,
      record: reactive,
      watch: watch
    } = model;
    const {
      ElMessage: _ElMessage,
      ElMessageBox: _ElMessageBox
    } = feedback;
    const orgData = ref([{
      id: 'C1',
      label: '臺北 RIMO 直營營運中心',
      level: 'company',
      contactName: '王雅婷',
      contactPhone: '02-2718-5200',
      taxId: '24581267',
      providerType: '直營',
      remark: '北臺灣直營站點',
      children: [{
        id: 'S1',
        label: '松山機場門市',
        level: 'store',
        contactName: '林冠宇',
        contactPhone: '02-2718-5201',
        email: 'songshan@rimo.tw',
        addressRegion: ['臺北市', '臺北市', '松山區'],
        addressDetail: '敦化北路 340-9 號旁停車區',
        remark: '商務旅客快取門市',
        children: []
      }, {
        id: 'S2',
        label: '左營高鐵門市',
        level: 'store',
        contactName: '陳怡君',
        contactPhone: '07-350-6201',
        email: 'zuoying@rimo.tw',
        addressRegion: ['高雄市', '高雄市', '左營區'],
        addressDetail: '高鐵路 105 號 P1 停車區',
        remark: '高鐵轉乘重點門市',
        children: []
      }]
    }, {
      id: 'C2',
      label: '金門觀光合作伙伴',
      level: 'company',
      contactName: '吳志豪',
      contactPhone: '082-326-000',
      taxId: '53017842',
      providerType: '加盟',
      remark: '金門旅遊接駁合作站點',
      children: [{
        id: 'S3',
        label: '水頭碼頭門市',
        level: 'store',
        contactName: '陳佩蓉',
        contactPhone: '082-326-001',
        email: 'shuitou@rimo.tw',
        addressRegion: ['金門縣', '金城鎮', '西門里'],
        addressDetail: '西海路一段水頭港區遊客服務中心旁',
        remark: '遊客取還車門市',
        children: []
      }]
    }, {
      id: 'C3',
      label: '桃園機場直營營運中心',
      level: 'company',
      contactName: '劉建宏',
      contactPhone: '03-399-8800',
      taxId: '28914563',
      providerType: '直營',
      remark: '國際機場大型直營據點',
      children: [{
        id: 'S4',
        label: '桃園機場第一航廈門市',
        level: 'store',
        contactName: '鄭宜芳',
        contactPhone: '03-399-8801',
        email: 'taoyuan-t1@rimo.tw',
        addressRegion: ['桃園市', '大園區', '航翔路'],
        addressDetail: '第一航廈一樓入境大廳 B 區',
        remark: '入境旅客主櫃檯',
        children: []
      }, {
        id: 'S5',
        label: '桃園機場第二航廈門市',
        level: 'store',
        contactName: '許耀文',
        contactPhone: '03-399-8802',
        email: 'taoyuan-t2@rimo.tw',
        addressRegion: ['桃園市', '大園區', '航翔路'],
        addressDetail: '第二航廈一樓入境大廳 C 區',
        remark: '入境旅客備用櫃檯',
        children: []
      }, {
        id: 'S6',
        label: '中壢服務區門市',
        level: 'store',
        contactName: '潘佳穎',
        contactPhone: '03-452-3300',
        email: 'jhongli@rimo.tw',
        addressRegion: ['桃園市', '中壢區', '民族路'],
        addressDetail: '民族路二段 88 號服務區',
        remark: '國道轉乘服務據點',
        children: []
      }]
    }, {
      id: 'C4',
      label: '臺中都會合作伙伴',
      level: 'company',
      contactName: '張淑芬',
      contactPhone: '04-3701-6600',
      taxId: '54712039',
      providerType: '加盟',
      remark: '中臺灣都會區合作站點',
      children: [{
        id: 'S7',
        label: '臺中高鐵門市',
        level: 'store',
        contactName: '賴俊豪',
        contactPhone: '04-3701-6601',
        email: 'taichung-hsr@rimo.tw',
        addressRegion: ['臺中市', '烏日區', '高鐵東路'],
        addressDetail: '高鐵臺中站一樓東側出口',
        remark: '高鐵轉乘主力門市',
        children: []
      }, {
        id: 'S8',
        label: '朝馬轉運站門市',
        level: 'store',
        contactName: '郭姿婷',
        contactPhone: '04-2316-7700',
        email: 'chaoma@rimo.tw',
        addressRegion: ['臺中市', '西屯區', '朝馬路'],
        addressDetail: '朝馬路二段 56 號轉運站旁',
        remark: '國道客運接駁門市',
        children: []
      }]
    }, {
      id: 'C5',
      label: '高雄港觀光合作伙伴',
      level: 'company',
      contactName: '黃俊豪',
      contactPhone: '07-521-4400',
      taxId: '59304781',
      providerType: '加盟',
      remark: '高雄港觀光接駁合作站點',
      children: [{
        id: 'S9',
        label: '高雄港旅運中心門市',
        level: 'store',
        contactName: '吳佩玲',
        contactPhone: '07-521-4401',
        email: 'kaohsiung-port@rimo.tw',
        addressRegion: ['高雄市', '苓雅區', '海邊的路'],
        addressDetail: '海邊的路 18 號旅運中心一樓',
        remark: '郵輪旅客接駁門市',
        children: []
      }, {
        id: 'S10',
        label: '左營海軍站門市',
        level: 'store',
        contactName: '徐子軒',
        contactPhone: '07-581-2200',
        email: 'zuoying-navy@rimo.tw',
        addressRegion: ['高雄市', '左營區', '海軍路'],
        addressDetail: '海軍路 88 號眷村改建商場旁',
        remark: '軍港周邊商務門市',
        children: []
      }]
    }]);
    const allStations = ref([{
      id: 1,
      parentId: 'S1',
      name: '臺北松山機場快取站',
      stationType: '機場快取站',
      parkingLotType: '室內停車場',
      parkingCompany: '松山機場停車管理中心',
      contactName: '林冠宇',
      contactPhone: '02-2718-5211',
      email: 'songshan-station@rimo.tw',
      fax: '02-2718-5299',
      addressRegion: ['臺北市', '臺北市', '松山區'],
      addressDetail: '敦化北路 340-9 號旁 P1 停車區',
      address: '臺北市 臺北市 松山區 敦化北路 340-9 號旁 P1 停車區',
      longitude: 121.5512,
      latitude: 25.0694,
      fenceRadius: 60,
      geofences: [{
        key: 'F1',
        enabled: true,
        longitude: 121.5513,
        latitude: 25.0695,
        radius: 60
      }],
      operatingHours: [new Date(2000, 0, 1, 6, 0), new Date(2000, 0, 1, 23, 0)],
      rentalDeposit: 5000,
      monthlyRentCost: 72000,
      utilityCost: 6800,
      staffingCost: 52000,
      accessMethod: '車牌辨識',
      isFixedParking: true,
      fixedParkingSlots: ['A-018', 'A-019', 'A-020'],
      photos: [],
      totalCapacity: 20,
      parkedCount: 12,
      parkingFeeRule: '前 30 分鐘免費，之後每小時 NT$60',
      description: '主要服務松山機場商務旅客與短租旅客，可快速取還車。',
      remark: '連續假期建議提前擴充排班',
      isActive: true,
      serviceGroups: {
        SHARING: {
          enabled: true,
          serviceHours: [new Date(2000, 0, 1, 6, 0), new Date(2000, 0, 1, 23, 0)]
        },
        STORE: {
          enabled: true,
          serviceHours: [new Date(2000, 0, 1, 7, 0), new Date(2000, 0, 1, 22, 0)]
        },
        GOV: {
          enabled: false,
          serviceHours: [new Date(2000, 0, 1, 8, 0), new Date(2000, 0, 1, 18, 0)]
        }
      },
      services: [{
        bizType: 'SAME_STATION',
        status: 'ACTIVE',
        reservedSpots: 8,
        config: {}
      }, {
        bizType: 'DIFF_STATION',
        status: 'ACTIVE',
        reservedSpots: 4,
        config: {
          pickupEnabled: true,
          returnEnabled: true
        }
      }, {
        bizType: 'STORE_SELF_SERVICE',
        status: 'SUSPENDED',
        reservedSpots: 0,
        config: {
          allowNightReturn: true,
          pickupMethod: 'APP_SCAN'
        }
      }]
    }, {
      id: 2,
      parentId: 'S2',
      name: '高雄左營高鐵企業服務站',
      stationType: '高鐵轉乘站',
      parkingLotType: '室內停車場',
      parkingCompany: '高鐵左營站停車中心',
      contactName: '陳怡君',
      contactPhone: '07-350-6211',
      email: 'zuoying-station@rimo.tw',
      fax: '07-350-6299',
      addressRegion: ['高雄市', '高雄市', '左營區'],
      addressDetail: '高鐵路 105 號 P1 停車區',
      address: '高雄市 高雄市 左營區 高鐵路 105 號 P1 停車區',
      longitude: 120.3075,
      latitude: 22.6872,
      fenceRadius: 80,
      geofences: [{
        key: 'F1',
        enabled: true,
        longitude: 120.3077,
        latitude: 22.6873,
        radius: 80
      }],
      operatingHours: [new Date(2000, 0, 1, 5, 30), new Date(2000, 0, 1, 23, 30)],
      rentalDeposit: 8000,
      monthlyRentCost: 54000,
      utilityCost: 5200,
      staffingCost: 36000,
      accessMethod: '門禁卡',
      isFixedParking: false,
      fixedParkingSlots: [],
      photos: [],
      totalCapacity: 30,
      parkedCount: 24,
      parkingFeeRule: '高鐵轉乘 1 小時內免費，超時每小時 NT$40',
      description: '服務高鐵轉乘旅客與簽約企業客戶，適合長短租混合取還。',
      remark: '企業客戶優先服務窗口',
      isActive: true,
      serviceGroups: {
        SHARING: {
          enabled: true,
          serviceHours: [new Date(2000, 0, 1, 6, 0), new Date(2000, 0, 1, 22, 30)]
        },
        STORE: {
          enabled: true,
          serviceHours: [new Date(2000, 0, 1, 8, 0), new Date(2000, 0, 1, 21, 0)]
        },
        GOV: {
          enabled: true,
          serviceHours: [new Date(2000, 0, 1, 7, 30), new Date(2000, 0, 1, 20, 0)]
        }
      },
      services: [{
        bizType: 'SAME_STATION',
        status: 'ACTIVE',
        reservedSpots: 10,
        config: {}
      }, {
        bizType: 'STORE_RENTAL',
        status: 'ACTIVE',
        reservedSpots: 0,
        config: {
          counterServiceHours: [new Date(2000, 0, 1, 8, 30), new Date(2000, 0, 1, 21, 0)],
          manualHandover: true,
          manualInspection: true
        }
      }, {
        bizType: 'GOV',
        status: 'ACTIVE',
        reservedSpots: 0,
        config: {
          corporateIds: ['CORP002']
        }
      }]
    }, {
      id: 3,
      parentId: 'S3',
      name: '金門水頭碼頭遊客取還點',
      stationType: '旅行社團體專用',
      parkingLotType: '露天停車場',
      parkingCompany: '金門港務停車場',
      contactName: '陳佩蓉',
      contactPhone: '082-326-021',
      email: 'shuitou-station@rimo.tw',
      fax: '082-326-099',
      addressRegion: ['金門縣', '金城鎮', '西門里'],
      addressDetail: '西海路一段水頭港區遊客服務中心旁',
      address: '金門縣 金城鎮 西門里 西海路一段水頭港區遊客服務中心旁',
      longitude: 118.3177,
      latitude: 24.4316,
      fenceRadius: 50,
      geofences: [{
        key: 'F1',
        enabled: true,
        longitude: 118.3178,
        latitude: 24.4317,
        radius: 50
      }],
      operatingHours: [new Date(2000, 0, 1, 8, 0), new Date(2000, 0, 1, 20, 30)],
      rentalDeposit: 3000,
      monthlyRentCost: 18000,
      utilityCost: 2600,
      staffingCost: 16000,
      accessMethod: '無門禁',
      isFixedParking: true,
      fixedParkingSlots: ['K-101', 'K-102'],
      photos: [],
      totalCapacity: 15,
      parkedCount: 15,
      parkingFeeRule: '前 20 分鐘免費，之後每小時 NT$30',
      description: '面向金門旅遊遊客，支持碼頭到市區的跨站點還車。',
      remark: '週末船班抵達時段需增加現場引導',
      isActive: true,
      serviceGroups: {
        SHARING: {
          enabled: true,
          serviceHours: [new Date(2000, 0, 1, 8, 0), new Date(2000, 0, 1, 20, 30)]
        },
        STORE: {
          enabled: true,
          serviceHours: [new Date(2000, 0, 1, 8, 30), new Date(2000, 0, 1, 19, 30)]
        },
        GOV: {
          enabled: false,
          serviceHours: [new Date(2000, 0, 1, 9, 0), new Date(2000, 0, 1, 18, 0)]
        }
      },
      services: [{
        bizType: 'DIFF_STATION',
        status: 'ACTIVE',
        reservedSpots: 8,
        config: {
          pickupEnabled: false,
          returnEnabled: true
        }
      }, {
        bizType: 'STORE_RENTAL',
        status: 'ACTIVE',
        reservedSpots: 0,
        config: {
          counterServiceHours: [new Date(2000, 0, 1, 9, 0), new Date(2000, 0, 1, 19, 30)],
          manualHandover: true,
          manualInspection: false
        }
      }, {
        bizType: 'STORE_SELF_SERVICE',
        status: 'ACTIVE',
        reservedSpots: 0,
        config: {
          allowNightReturn: false,
          pickupMethod: 'SELF_KIOSK'
        }
      }]
    }, {
      id: 4,
      parentId: 'S1',
      name: '臺北松山機場 P2 長租停車區',
      stationType: '機場長租區',
      parkingLotType: '室內停車場',
      parkingCompany: '松山機場停車管理中心',
      contactName: '林冠宇',
      contactPhone: '02-2718-5218',
      email: 'songshan-p2@rimo.tw',
      fax: '02-2718-5298',
      addressRegion: ['臺北市', '臺北市', '松山區'],
      addressDetail: '敦化北路 340-9 號旁 P2 長租停車區',
      address: '臺北市 臺北市 松山區 敦化北路 340-9 號旁 P2 長租停車區',
      longitude: 121.5518,
      latitude: 25.0689,
      fenceRadius: 70,
      geofences: [{
        key: 'F1',
        enabled: true,
        longitude: 121.5519,
        latitude: 25.0690,
        radius: 70
      }],
      operatingHours: [new Date(2000, 0, 1, 6, 30), new Date(2000, 0, 1, 22, 30)],
      rentalDeposit: 4000,
      monthlyRentCost: 66000,
      utilityCost: 5400,
      staffingCost: 38000,
      accessMethod: '車牌辨識',
      isFixedParking: true,
      fixedParkingSlots: ['P2-021', 'P2-022', 'P2-023', 'P2-024'],
      photos: [],
      totalCapacity: 36,
      parkedCount: 9,
      parkingFeeRule: '前 40 分鐘免費，之後每小時 NT$50',
      description: '以長租整備和門市備車爲主，適合作爲機場門市的後臺停車區。',
      remark: '夜間調車頻率較高',
      isActive: true,
      serviceGroups: {
        SHARING: {
          enabled: false,
          serviceHours: [new Date(2000, 0, 1, 6, 30), new Date(2000, 0, 1, 22, 30)]
        },
        STORE: {
          enabled: true,
          serviceHours: [new Date(2000, 0, 1, 7, 0), new Date(2000, 0, 1, 21, 30)]
        },
        GOV: {
          enabled: false,
          serviceHours: [new Date(2000, 0, 1, 8, 0), new Date(2000, 0, 1, 18, 0)]
        }
      },
      services: [{
        bizType: 'STORE_RENTAL',
        status: 'ACTIVE',
        reservedSpots: 0,
        config: {
          counterServiceHours: [new Date(2000, 0, 1, 8, 0), new Date(2000, 0, 1, 21, 30)],
          manualHandover: true,
          manualInspection: true
        }
      }, {
        bizType: 'STORE_SELF_SERVICE',
        status: 'ACTIVE',
        reservedSpots: 0,
        config: {
          allowNightReturn: true,
          pickupMethod: 'APP_SCAN'
        }
      }]
    }, {
      id: 5,
      parentId: 'S2',
      name: '高雄左營站前自助還車點',
      stationType: '商圈停車點',
      parkingLotType: '露天停車場',
      parkingCompany: '左營站前停車場',
      contactName: '陳怡君',
      contactPhone: '07-350-6218',
      email: 'zuoying-self@rimo.tw',
      fax: '07-350-6288',
      addressRegion: ['高雄市', '高雄市', '左營區'],
      addressDetail: '站前北路 88 號戶外停車區',
      address: '高雄市 高雄市 左營區 站前北路 88 號戶外停車區',
      longitude: 120.3061,
      latitude: 22.6894,
      fenceRadius: 55,
      geofences: [{
        key: 'F1',
        enabled: true,
        longitude: 120.3062,
        latitude: 22.6895,
        radius: 55
      }],
      operatingHours: [new Date(2000, 0, 1, 0, 0), new Date(2000, 0, 1, 23, 59)],
      rentalDeposit: 2000,
      monthlyRentCost: 22000,
      utilityCost: 1800,
      staffingCost: 9000,
      accessMethod: '無門禁',
      isFixedParking: false,
      fixedParkingSlots: [],
      photos: [],
      totalCapacity: 18,
      parkedCount: 17,
      parkingFeeRule: '每小時 NT$35，夜間封頂 NT$180',
      description: '作爲高鐵門市的站前自助還車據點，方便夜間和短停用戶。',
      remark: '晚間常接近滿位',
      isActive: true,
      serviceGroups: {
        SHARING: {
          enabled: true,
          serviceHours: [new Date(2000, 0, 1, 6, 0), new Date(2000, 0, 1, 23, 0)]
        },
        STORE: {
          enabled: true,
          serviceHours: [new Date(2000, 0, 1, 0, 0), new Date(2000, 0, 1, 23, 59)]
        },
        GOV: {
          enabled: false,
          serviceHours: [new Date(2000, 0, 1, 8, 0), new Date(2000, 0, 1, 18, 0)]
        }
      },
      services: [{
        bizType: 'DIFF_STATION',
        status: 'ACTIVE',
        reservedSpots: 6,
        config: {
          pickupEnabled: false,
          returnEnabled: true
        }
      }, {
        bizType: 'STORE_SELF_SERVICE',
        status: 'ACTIVE',
        reservedSpots: 0,
        config: {
          allowNightReturn: true,
          pickupMethod: 'SELF_KIOSK'
        }
      }]
    }, {
      id: 6,
      parentId: 'S3',
      name: '金門城區民權停車區',
      stationType: '商圈停車點',
      parkingLotType: '露天停車場',
      parkingCompany: '民權停車場合作社',
      contactName: '陳佩蓉',
      contactPhone: '082-326-031',
      email: 'jincheng-station@rimo.tw',
      fax: '082-326-088',
      addressRegion: ['金門縣', '金城鎮', '南門里'],
      addressDetail: '民權路 218 號後方停車區',
      address: '金門縣 金城鎮 南門里 民權路 218 號後方停車區',
      longitude: 118.3214,
      latitude: 24.4329,
      fenceRadius: 45,
      geofences: [{
        key: 'F1',
        enabled: true,
        longitude: 118.3215,
        latitude: 24.4330,
        radius: 45
      }],
      operatingHours: [new Date(2000, 0, 1, 7, 30), new Date(2000, 0, 1, 21, 0)],
      rentalDeposit: 2500,
      monthlyRentCost: 16000,
      utilityCost: 2100,
      staffingCost: 12000,
      accessMethod: '人工抬桿',
      isFixedParking: true,
      fixedParkingSlots: ['M-001', 'M-002', 'M-003'],
      photos: [],
      totalCapacity: 22,
      parkedCount: 7,
      parkingFeeRule: '前 15 分鐘免費，之後每小時 NT$25',
      description: '位於金城市區，適合旅宿周邊短租備車與城區歸還整備。',
      remark: '平日白天空位較多',
      isActive: true,
      serviceGroups: {
        SHARING: {
          enabled: true,
          serviceHours: [new Date(2000, 0, 1, 8, 0), new Date(2000, 0, 1, 20, 0)]
        },
        STORE: {
          enabled: true,
          serviceHours: [new Date(2000, 0, 1, 8, 30), new Date(2000, 0, 1, 20, 30)]
        },
        GOV: {
          enabled: false,
          serviceHours: [new Date(2000, 0, 1, 9, 0), new Date(2000, 0, 1, 18, 0)]
        }
      },
      services: [{
        bizType: 'SAME_STATION',
        status: 'ACTIVE',
        reservedSpots: 5,
        config: {}
      }, {
        bizType: 'STORE_RENTAL',
        status: 'ACTIVE',
        reservedSpots: 0,
        config: {
          counterServiceHours: [new Date(2000, 0, 1, 9, 0), new Date(2000, 0, 1, 20, 0)],
          manualHandover: true,
          manualInspection: true
        }
      }]
    }, {
      id: 7,
      parentId: 'S4',
      name: '桃園機場一航廈入境取還站',
      stationType: '機場快取站',
      parkingLotType: '室內停車場',
      parkingCompany: '桃園機場停車管理處',
      contactName: '鄭宜芳',
      contactPhone: '03-399-8811',
      email: 'taoyuan-t1-station@rimo.tw',
      fax: '03-399-8899',
      addressRegion: ['桃園市', '大園區', '航翔路'],
      addressDetail: '第一航廈一樓入境大廳 B 區',
      address: '桃園市 大園區 航翔路 第一航廈一樓入境大廳 B 區',
      longitude: 121.2328,
      latitude: 25.0797,
      fenceRadius: 100,
      geofences: [{
        key: 'F1',
        enabled: true,
        longitude: 121.2329,
        latitude: 25.0798,
        radius: 100
      }],
      operatingHours: [new Date(2000, 0, 1, 5, 0), new Date(2000, 0, 1, 23, 59)],
      rentalDeposit: 10000,
      monthlyRentCost: 88000,
      utilityCost: 9200,
      staffingCost: 64000,
      accessMethod: '車牌辨識',
      isFixedParking: true,
      fixedParkingSlots: ['B-001', 'B-002', 'B-003'],
      photos: [],
      totalCapacity: 40,
      parkedCount: 28,
      parkingFeeRule: '出國旅客 2 小時內免費，逾時每小時 NT$50',
      description: '桃園機場第一航廈入境旅客主櫃檯，提供國際旅客取還車服務。',
      remark: '尖峯時段建議加派接駁車',
      isActive: true,
      serviceGroups: {
        SHARING: {
          enabled: true,
          serviceHours: [new Date(2000, 0, 1, 5, 0), new Date(2000, 0, 1, 23, 59)]
        },
        STORE: {
          enabled: true,
          serviceHours: [new Date(2000, 0, 1, 6, 0), new Date(2000, 0, 1, 23, 0)]
        },
        GOV: {
          enabled: false,
          serviceHours: [new Date(2000, 0, 1, 8, 0), new Date(2000, 0, 1, 18, 0)]
        }
      },
      services: [{
        bizType: 'SAME_STATION',
        status: 'ACTIVE',
        reservedSpots: 14,
        config: {}
      }, {
        bizType: 'DIFF_STATION',
        status: 'ACTIVE',
        reservedSpots: 6,
        config: {
          pickupEnabled: true,
          returnEnabled: true
        }
      }, {
        bizType: 'STORE_RENTAL',
        status: 'ACTIVE',
        reservedSpots: 0,
        config: {
          counterServiceHours: [new Date(2000, 0, 1, 6, 0), new Date(2000, 0, 1, 23, 0)],
          manualHandover: true,
          manualInspection: true
        }
      }]
    }, {
      id: 8,
      parentId: 'S5',
      name: '桃園機場二航廈出境服務站',
      stationType: '機場快取站',
      parkingLotType: '室內停車場',
      parkingCompany: '桃園機場停車管理處',
      contactName: '許耀文',
      contactPhone: '03-399-8821',
      email: 'taoyuan-t2-station@rimo.tw',
      fax: '03-399-8829',
      addressRegion: ['桃園市', '大園區', '航翔路'],
      addressDetail: '第二航廈一樓入境大廳 C 區',
      address: '桃園市 大園區 航翔路 第二航廈一樓入境大廳 C 區',
      longitude: 121.2335,
      latitude: 25.0781,
      fenceRadius: 90,
      geofences: [{
        key: 'F1',
        enabled: true,
        longitude: 121.2336,
        latitude: 25.0782,
        radius: 90
      }],
      operatingHours: [new Date(2000, 0, 1, 5, 0), new Date(2000, 0, 1, 23, 59)],
      rentalDeposit: 10000,
      monthlyRentCost: 78000,
      utilityCost: 7600,
      staffingCost: 56000,
      accessMethod: '車牌辨識',
      isFixedParking: false,
      fixedParkingSlots: [],
      photos: [],
      totalCapacity: 32,
      parkedCount: 18,
      parkingFeeRule: '出國旅客 2 小時內免費，逾時每小時 NT$45',
      description: '桃園機場第二航廈出境旅客服務站，提供自助與人工取還。',
      remark: '深夜航班加派值班人員',
      isActive: true,
      serviceGroups: {
        SHARING: {
          enabled: true,
          serviceHours: [new Date(2000, 0, 1, 5, 0), new Date(2000, 0, 1, 23, 59)]
        },
        STORE: {
          enabled: true,
          serviceHours: [new Date(2000, 0, 1, 6, 0), new Date(2000, 0, 1, 22, 30)]
        },
        GOV: {
          enabled: false,
          serviceHours: [new Date(2000, 0, 1, 8, 0), new Date(2000, 0, 1, 18, 0)]
        }
      },
      services: [{
        bizType: 'SAME_STATION',
        status: 'ACTIVE',
        reservedSpots: 10,
        config: {}
      }, {
        bizType: 'STORE_SELF_SERVICE',
        status: 'ACTIVE',
        reservedSpots: 4,
        config: {}
      }]
    }, {
      id: 9,
      parentId: 'S6',
      name: '中壢民族服務區取還站',
      stationType: '旅行社團體專用',
      parkingLotType: '露天停車場',
      parkingCompany: '中壢服務區停車管理',
      contactName: '潘佳穎',
      contactPhone: '03-452-3311',
      email: 'jhongli-station@rimo.tw',
      fax: '03-452-3399',
      addressRegion: ['桃園市', '中壢區', '民族路'],
      addressDetail: '民族路二段 88 號服務區',
      address: '桃園市 中壢區 民族路 民族路二段 88 號服務區',
      longitude: 121.2156,
      latitude: 24.9653,
      fenceRadius: 70,
      geofences: [{
        key: 'F1',
        enabled: true,
        longitude: 121.2157,
        latitude: 24.9654,
        radius: 70
      }],
      operatingHours: [new Date(2000, 0, 1, 6, 0), new Date(2000, 0, 1, 22, 0)],
      rentalDeposit: 5000,
      monthlyRentCost: 42000,
      utilityCost: 4800,
      staffingCost: 30000,
      accessMethod: '人工管理',
      isFixedParking: false,
      fixedParkingSlots: [],
      photos: [],
      totalCapacity: 25,
      parkedCount: 9,
      parkingFeeRule: '服務區消費折抵 1 小時停車費，逾時每小時 NT$30',
      description: '國道轉乘與短途商務旅客服務據點。',
      remark: '假日車流較大需加派人員',
      isActive: true,
      serviceGroups: {
        SHARING: {
          enabled: true,
          serviceHours: [new Date(2000, 0, 1, 6, 0), new Date(2000, 0, 1, 22, 0)]
        },
        STORE: {
          enabled: false,
          serviceHours: [new Date(2000, 0, 1, 8, 0), new Date(2000, 0, 1, 18, 0)]
        },
        GOV: {
          enabled: false,
          serviceHours: [new Date(2000, 0, 1, 8, 0), new Date(2000, 0, 1, 18, 0)]
        }
      },
      services: [{
        bizType: 'SAME_STATION',
        status: 'ACTIVE',
        reservedSpots: 6,
        config: {}
      }, {
        bizType: 'DIFF_STATION',
        status: 'SUSPENDED',
        reservedSpots: 0,
        config: {
          pickupEnabled: false,
          returnEnabled: false
        }
      }]
    }, {
      id: 10,
      parentId: 'S7',
      name: '臺中高鐵烏日快取站',
      stationType: '高鐵轉乘站',
      parkingLotType: '室內停車場',
      parkingCompany: '高鐵臺中站停車中心',
      contactName: '賴俊豪',
      contactPhone: '04-3701-6611',
      email: 'taichung-hsr-station@rimo.tw',
      fax: '04-3701-6699',
      addressRegion: ['臺中市', '烏日區', '高鐵東路'],
      addressDetail: '高鐵臺中站一樓東側出口',
      address: '臺中市 烏日區 高鐵東路 高鐵臺中站一樓東側出口',
      longitude: 120.5445,
      latitude: 24.1123,
      fenceRadius: 85,
      geofences: [{
        key: 'F1',
        enabled: true,
        longitude: 120.5446,
        latitude: 24.1124,
        radius: 85
      }],
      operatingHours: [new Date(2000, 0, 1, 5, 30), new Date(2000, 0, 1, 23, 30)],
      rentalDeposit: 8000,
      monthlyRentCost: 56000,
      utilityCost: 5400,
      staffingCost: 38000,
      accessMethod: '門禁卡',
      isFixedParking: false,
      fixedParkingSlots: [],
      photos: [],
      totalCapacity: 30,
      parkedCount: 21,
      parkingFeeRule: '高鐵轉乘 1 小時內免費，逾時每小時 NT$40',
      description: '高鐵臺中站主力轉乘門市，服務長短租混合客戶。',
      remark: '連假建議預約制',
      isActive: true,
      serviceGroups: {
        SHARING: {
          enabled: true,
          serviceHours: [new Date(2000, 0, 1, 6, 0), new Date(2000, 0, 1, 23, 0)]
        },
        STORE: {
          enabled: true,
          serviceHours: [new Date(2000, 0, 1, 8, 0), new Date(2000, 0, 1, 21, 0)]
        },
        GOV: {
          enabled: true,
          serviceHours: [new Date(2000, 0, 1, 7, 30), new Date(2000, 0, 1, 20, 0)]
        }
      },
      services: [{
        bizType: 'SAME_STATION',
        status: 'ACTIVE',
        reservedSpots: 10,
        config: {}
      }, {
        bizType: 'STORE_RENTAL',
        status: 'ACTIVE',
        reservedSpots: 0,
        config: {
          counterServiceHours: [new Date(2000, 0, 1, 8, 0), new Date(2000, 0, 1, 21, 0)],
          manualHandover: true,
          manualInspection: true
        }
      }, {
        bizType: 'GOV',
        status: 'ACTIVE',
        reservedSpots: 0,
        config: {}
      }]
    }, {
      id: 11,
      parentId: 'S8',
      name: '朝馬轉運站接駁取還點',
      stationType: '轉運站接駁點',
      parkingLotType: '露天停車場',
      parkingCompany: '朝馬轉運站停車管理',
      contactName: '郭姿婷',
      contactPhone: '04-2316-7711',
      email: 'chaoma-station@rimo.tw',
      fax: '04-2316-7799',
      addressRegion: ['臺中市', '西屯區', '朝馬路'],
      addressDetail: '朝馬路二段 56 號轉運站旁',
      address: '臺中市 西屯區 朝馬路 朝馬路二段 56 號轉運站旁',
      longitude: 120.6411,
      latitude: 24.1659,
      fenceRadius: 60,
      geofences: [{
        key: 'F1',
        enabled: true,
        longitude: 120.6412,
        latitude: 24.1660,
        radius: 60
      }],
      operatingHours: [new Date(2000, 0, 1, 6, 30), new Date(2000, 0, 1, 22, 30)],
      rentalDeposit: 6000,
      monthlyRentCost: 38000,
      utilityCost: 4200,
      staffingCost: 28000,
      accessMethod: '人工管理',
      isFixedParking: false,
      fixedParkingSlots: [],
      photos: [],
      totalCapacity: 20,
      parkedCount: 7,
      parkingFeeRule: '轉運旅客 30 分鐘內免費，逾時每小時 NT$35',
      description: '國道客運接駁與短租旅客服務據點。',
      remark: '配合客運班次排班',
      isActive: false,
      serviceGroups: {
        SHARING: {
          enabled: true,
          serviceHours: [new Date(2000, 0, 1, 6, 30), new Date(2000, 0, 1, 22, 30)]
        },
        STORE: {
          enabled: false,
          serviceHours: [new Date(2000, 0, 1, 8, 0), new Date(2000, 0, 1, 18, 0)]
        },
        GOV: {
          enabled: false,
          serviceHours: [new Date(2000, 0, 1, 8, 0), new Date(2000, 0, 1, 18, 0)]
        }
      },
      services: [{
        bizType: 'SAME_STATION',
        status: 'SUSPENDED',
        reservedSpots: 0,
        config: {}
      }]
    }, {
      id: 12,
      parentId: 'S9',
      name: '高雄港旅運中心郵輪取還站',
      stationType: '碼頭遊客取還點',
      parkingLotType: '室內停車場',
      parkingCompany: '高雄港旅運中心停車管理',
      contactName: '吳佩玲',
      contactPhone: '07-521-4411',
      email: 'kaohsiung-port-station@rimo.tw',
      fax: '07-521-4499',
      addressRegion: ['高雄市', '苓雅區', '海邊的路'],
      addressDetail: '海邊的路 18 號旅運中心一樓',
      address: '高雄市 苓雅區 海邊的路 海邊的路 18 號旅運中心一樓',
      longitude: 120.3028,
      latitude: 22.6135,
      fenceRadius: 75,
      geofences: [{
        key: 'F1',
        enabled: true,
        longitude: 120.3029,
        latitude: 22.6136,
        radius: 75
      }],
      operatingHours: [new Date(2000, 0, 1, 7, 0), new Date(2000, 0, 1, 21, 0)],
      rentalDeposit: 6000,
      monthlyRentCost: 46000,
      utilityCost: 5000,
      staffingCost: 32000,
      accessMethod: '車牌辨識',
      isFixedParking: true,
      fixedParkingSlots: ['P-101', 'P-102'],
      photos: [],
      totalCapacity: 22,
      parkedCount: 13,
      parkingFeeRule: '郵輪旅客 3 小時內免費，逾時每小時 NT$35',
      description: '高雄港郵輪旅客接駁取還車服務據點。',
      remark: '配合郵輪靠港班次排班',
      isActive: true,
      serviceGroups: {
        SHARING: {
          enabled: true,
          serviceHours: [new Date(2000, 0, 1, 7, 0), new Date(2000, 0, 1, 21, 0)]
        },
        STORE: {
          enabled: true,
          serviceHours: [new Date(2000, 0, 1, 8, 0), new Date(2000, 0, 1, 20, 0)]
        },
        GOV: {
          enabled: false,
          serviceHours: [new Date(2000, 0, 1, 8, 0), new Date(2000, 0, 1, 18, 0)]
        }
      },
      services: [{
        bizType: 'SAME_STATION',
        status: 'ACTIVE',
        reservedSpots: 8,
        config: {}
      }, {
        bizType: 'STORE_RENTAL',
        status: 'ACTIVE',
        reservedSpots: 0,
        config: {
          counterServiceHours: [new Date(2000, 0, 1, 8, 0), new Date(2000, 0, 1, 20, 0)],
          manualHandover: true,
          manualInspection: true
        }
      }]
    }, {
      id: 13,
      parentId: 'S10',
      name: '左營海軍站商務取還點',
      stationType: '商圈停車點',
      parkingLotType: '露天停車場',
      parkingCompany: '海軍站合作停車場',
      contactName: '徐子軒',
      contactPhone: '07-581-2211',
      email: 'zuoying-navy-station@rimo.tw',
      fax: '07-581-2299',
      addressRegion: ['高雄市', '左營區', '海軍路'],
      addressDetail: '海軍路 88 號眷村改建商場旁',
      address: '高雄市 左營區 海軍路 海軍路 88 號眷村改建商場旁',
      longitude: 120.2945,
      latitude: 22.7051,
      fenceRadius: 50,
      geofences: [{
        key: 'F1',
        enabled: true,
        longitude: 120.2946,
        latitude: 22.7052,
        radius: 50
      }],
      operatingHours: [new Date(2000, 0, 1, 8, 0), new Date(2000, 0, 1, 20, 0)],
      rentalDeposit: 4000,
      monthlyRentCost: 28000,
      utilityCost: 3200,
      staffingCost: 22000,
      accessMethod: '人工管理',
      isFixedParking: false,
      fixedParkingSlots: [],
      photos: [],
      totalCapacity: 15,
      parkedCount: 6,
      parkingFeeRule: '商場消費折抵 2 小時，逾時每小時 NT$30',
      description: '軍港周邊商務與眷村居民短租服務據點。',
      remark: '配合商場營業時間',
      isActive: true,
      serviceGroups: {
        SHARING: {
          enabled: true,
          serviceHours: [new Date(2000, 0, 1, 8, 0), new Date(2000, 0, 1, 20, 0)]
        },
        STORE: {
          enabled: false,
          serviceHours: [new Date(2000, 0, 1, 8, 0), new Date(2000, 0, 1, 18, 0)]
        },
        GOV: {
          enabled: false,
          serviceHours: [new Date(2000, 0, 1, 8, 0), new Date(2000, 0, 1, 18, 0)]
        }
      },
      services: [{
        bizType: 'SAME_STATION',
        status: 'ACTIVE',
        reservedSpots: 5,
        config: {}
      }]
    }]);
    const currentNode = ref(null);
    const stationTableRef = ref(null);
    const orgTreeRef = ref(null);
    const dialogVisible = ref(false);
    const isEdit = ref(false);
    const searchQuery = ref('');
    const stationViewMode = ref('overview');
    const capabilityModeFilter = ref('');
    const serviceStatusFilter = ref('');
    const statusFilter = ref('');
    const selectedStationRows = ref([]);
    const permissionDemoMode = ref('ALL');
    const permissionDemoOptions = [{
      label: '全部權限',
      value: 'ALL'
    }, {
      label: '僅同站租還',
      value: 'SAME_STATION'
    }, {
      label: '僅甲租乙還',
      value: 'DIFF_STATION'
    }, {
      label: '僅門市租車',
      value: 'STORE_RENTAL'
    }, {
      label: '僅24小時自助',
      value: 'STORE_SELF_SERVICE'
    }, {
      label: '僅公務用車',
      value: 'GOV'
    }];
    const serviceCapabilityDialogVisible = ref(false);
    const activeCapabilityRow = ref(null);
    const serviceCapabilityForm = reactive({
      status: 'ACTIVE',
      reservedSpots: 0,
      config: {}
    });
    const stationImportDialogVisible = ref(false);
    const stationExportDialogVisible = ref(false);
    const stationImportFileList = ref([]);
    const stationImportFile = ref(null);
    const stationServiceFilterOptions = ref([{
      label: '同站租還',
      value: 'SAME_STATION'
    }, {
      label: '甲租乙還',
      value: 'DIFF_STATION'
    }, {
      label: '門市租車',
      value: 'STORE_RENTAL'
    }, {
      label: '24小時自助',
      value: 'STORE_SELF_SERVICE'
    }, {
      label: '公務用車',
      value: 'GOV'
    }]);
    const permissionProfiles = {
      ALL: {
        overviewView: true,
        overviewManage: true,
        serviceView: 'ALL',
        serviceManage: 'ALL',
        scopeText: '據點資料與全部服務能力'
      },
      SAME_STATION: {
        overviewView: false,
        overviewManage: false,
        serviceView: ['SAME_STATION'],
        serviceManage: ['SAME_STATION'],
        scopeText: '僅同站租還服務能力'
      },
      DIFF_STATION: {
        overviewView: false,
        overviewManage: false,
        serviceView: ['DIFF_STATION'],
        serviceManage: ['DIFF_STATION'],
        scopeText: '僅甲租乙還服務能力'
      },
      STORE_RENTAL: {
        overviewView: false,
        overviewManage: false,
        serviceView: ['STORE_RENTAL'],
        serviceManage: ['STORE_RENTAL'],
        scopeText: '僅門市租車服務能力'
      },
      STORE_SELF_SERVICE: {
        overviewView: false,
        overviewManage: false,
        serviceView: ['STORE_SELF_SERVICE'],
        serviceManage: ['STORE_SELF_SERVICE'],
        scopeText: '僅24小時自助服務能力'
      },
      GOV: {
        overviewView: false,
        overviewManage: false,
        serviceView: ['GOV'],
        serviceManage: ['GOV'],
        scopeText: '僅公務用車服務能力'
      }
    };
    const activePermissionProfile = computed(() => permissionProfiles[permissionDemoMode.value] || permissionProfiles.ALL);
    const canViewStationOverview = computed(() => activePermissionProfile.value.overviewView);
    const canManageStationBase = computed(() => activePermissionProfile.value.overviewManage);
    const canViewService = bizType => {
      const modes = activePermissionProfile.value.serviceView;
      return modes === 'ALL' || modes.includes(bizType);
    };
    const canManageService = bizType => {
      const modes = activePermissionProfile.value.serviceManage;
      return modes === 'ALL' || modes.includes(bizType);
    };
    const permittedServiceFilterOptions = computed(() => {
      return stationServiceFilterOptions.value.filter(item => canViewService(item.value));
    });
    const canViewAnyService = computed(() => permittedServiceFilterOptions.value.length > 0);
    const permissionScopeText = computed(() => activePermissionProfile.value.scopeText);
    const availableServiceCapabilityCount = computed(() => {
      return visibleStations.value.reduce((count, station) => {
        return count + (station.services || []).filter(service => canViewService(service.bizType)).length;
      }, 0);
    });
    const serviceStatusFilterOptions = ref([{
      label: '啓用中',
      value: 'ACTIVE'
    }, {
      label: '已暫停',
      value: 'SUSPENDED'
    }]);
    const serviceStatusOptions = ref([{
      label: '啓用',
      value: 'ACTIVE'
    }, {
      label: '暫停',
      value: 'SUSPENDED'
    }]);
    const setPermissionDemoMode = mode => {
      permissionDemoMode.value = mode;
      selectedStationRows.value = [];
      serviceStatusFilter.value = '';
      stationViewMode.value = canViewStationOverview.value ? 'overview' : 'capabilities';
      capabilityModeFilter.value = permittedServiceFilterOptions.value.length === 1 ? permittedServiceFilterOptions.value[0].value : '';
      stationPage.value = 1;
      capabilityPage.value = 1;
    };
    const handleStationViewChange = () => {
      stationPage.value = 1;
      capabilityPage.value = 1;
      serviceStatusFilter.value = '';
      selectedStationRows.value = [];
    };
    const switchStationView = view => {
      if (view === 'overview' && !canViewStationOverview.value) return;
      if (view === 'capabilities' && !canViewAnyService.value) return;
      stationViewMode.value = view;
      handleStationViewChange();
    };
    const stationImportForm = reactive({
      mode: 'append',
      templateType: 'station_basic'
    });
    const stationExportForm = reactive({
      scope: 'filtered',
      format: 'xlsx',
      fields: ['basic', 'service', 'capacity', 'status']
    });
    const currentStation = reactive({
      services: [],
      serviceGroups: {},
      geofences: [],
      photos: [],
      addressRegion: [],
      operatingHours: []
    });
    const serviceChecks = reactive({
      SAME_STATION: false,
      DIFF_STATION: false,
      STORE_RENTAL: false,
      STORE_SELF_SERVICE: false,
      GOV: false
    });
    const stationTypeManagerVisible = ref(false);
    const newStationTypeInput = ref('');
    const fixedParkingSlotsInput = ref('');
    const activeCoordinateTarget = ref('station');
    const mapPickerVisible = ref(false);
    const mapPickerTarget = ref('station');
    const hierarchyDialogVisible = ref(false);
    const hierarchyCurrentCompany = ref(null);
    const companyDialogVisible = ref(false);
    const storeDialogVisible = ref(false);
    const isCompanyEdit = ref(false);
    const isStoreEdit = ref(false);
    const companyForm = reactive({});
    const storeForm = reactive({});
    const addressOptions = ref([{
      value: '臺北市',
      label: '臺北市',
      children: [{
        value: '臺北市',
        label: '臺北市',
        children: [{
          value: '松山區',
          label: '松山區'
        }, {
          value: '中山區',
          label: '中山區'
        }, {
          value: '信義區',
          label: '信義區'
        }]
      }]
    }, {
      value: '高雄市',
      label: '高雄市',
      children: [{
        value: '高雄市',
        label: '高雄市',
        children: [{
          value: '左營區',
          label: '左營區'
        }, {
          value: '前鎮區',
          label: '前鎮區'
        }, {
          value: '小港區',
          label: '小港區'
        }]
      }]
    }, {
      value: '金門縣',
      label: '金門縣',
      children: [{
        value: '金城鎮',
        label: '金城鎮',
        children: [{
          value: '西門里',
          label: '西門里'
        }, {
          value: '南門里',
          label: '南門里'
        }]
      }, {
        value: '金沙鎮',
        label: '金沙鎮',
        children: [{
          value: '汶沙里',
          label: '汶沙里'
        }, {
          value: '何斗里',
          label: '何斗里'
        }]
      }]
    }]);
    const getIconByLevel = level => {
      const map = {
        company: 'OfficeBuilding',
        store: 'Shop',
        station: 'Location'
      };
      return map[level] || 'Location';
    };
    const handleNodeClick = data => {
      currentNode.value = data;
      stationPage.value = 1;
      clearStationSelection();
    };
    const setAllScope = () => {
      currentNode.value = null;
      orgTreeRef.value?.setCurrentKey?.(null);
      stationPage.value = 1;
      clearStationSelection();
    };
    const isStoreNode = nodeId => {
      return orgData.value.some(company => (company.children || []).some(store => store.id === nodeId));
    };
    const stationParentOptions = computed(() => {
      return orgData.value.map(company => ({
        value: company.id,
        label: company.label,
        children: (company.children || []).map(store => ({
          value: store.id,
          label: store.label
        }))
      })).filter(group => group.children.length > 0);
    });
    const stationParentProps = {
      checkStrictly: false,
      emitPath: false
    };
    const getStationList = (node, options = {}) => {
      let list = [];
      if (!node) {
        list = [...allStations.value];
      } else if (node.level === 'store') {
        list = allStations.value.filter(s => s.parentId === node.id);
      } else if (node.level === 'company') {
        const storeIds = node.children.map(child => child.id);
        list = allStations.value.filter(s => storeIds.includes(s.parentId));
      }
      if (!options.ignoreFilters) {
        if (searchQuery.value) {
          const q = searchQuery.value.toLowerCase();
          list = list.filter(s => s.name.toLowerCase().includes(q) || (s.address || '').toLowerCase().includes(q));
        }
        if (statusFilter.value === 'ACTIVE') {
          list = list.filter(s => !!s.isActive);
        } else if (statusFilter.value === 'INACTIVE') {
          list = list.filter(s => !s.isActive);
        }
      }
      return list;
    };
    const visibleStations = computed(() => getStationList(currentNode.value));
    const stationPage = ref(1);
    const stationPageSize = ref(10);
    const pagedStations = computed(() => {
      const start = (stationPage.value - 1) * stationPageSize.value;
      return visibleStations.value.slice(start, start + stationPageSize.value);
    });
    watch(visibleStations, () => {
      const maxPage = Math.max(1, Math.ceil(visibleStations.value.length / stationPageSize.value));
      if (stationPage.value > maxPage) stationPage.value = 1;
    });
    const visibleServiceCapabilities = computed(() => {
      return visibleStations.value.flatMap(station => (station.services || []).map(service => ({
        rowKey: `${station.id}-${service.bizType}`,
        station,
        service
      }))).filter(row => {
        if (!canViewService(row.service.bizType)) return false;
        if (capabilityModeFilter.value && row.service.bizType !== capabilityModeFilter.value) return false;
        if (serviceStatusFilter.value && row.service.status !== serviceStatusFilter.value) return false;
        return true;
      });
    });
    const capabilityPage = ref(1);
    const capabilityPageSize = ref(10);
    const pagedServiceCapabilities = computed(() => {
      const start = (capabilityPage.value - 1) * capabilityPageSize.value;
      return visibleServiceCapabilities.value.slice(start, start + capabilityPageSize.value);
    });
    watch(visibleServiceCapabilities, () => {
      const maxPage = Math.max(1, Math.ceil(visibleServiceCapabilities.value.length / capabilityPageSize.value));
      if (capabilityPage.value > maxPage) capabilityPage.value = 1;
    });
    const getStoreName = storeId => {
      for (const company of orgData.value) {
        const store = (company.children || []).find(item => item.id === storeId);
        if (store) return store.label;
      }
      return '-';
    };
    const getStationTypeConfig = value => {
      return stationTypeOptions.value.find(item => item.value === value);
    };
    const getStationTypeEntryConfig = valueOrOption => {
      if (valueOrOption && typeof valueOrOption === 'object') return valueOrOption;
      return getStationTypeConfig(valueOrOption);
    };
    const getStationTypeEntryText = valueOrOption => {
      const config = getStationTypeEntryConfig(valueOrOption);
      if (!config) return '一般預約可用';
      return config.normalEntryVisible === false ? '不開放一般預約' : '一般預約可用';
    };
    const getStationTypeEntryTagType = valueOrOption => {
      const config = getStationTypeEntryConfig(valueOrOption);
      return config?.normalEntryVisible === false ? 'warning' : 'success';
    };
    const getServiceTagType = type => {
      const map = {
        SHARING: 'success',
        STORE: 'warning',
        SAME_STATION: 'success',
        DIFF_STATION: 'warning',
        STORE_RENTAL: 'warning',
        STORE_SELF_SERVICE: 'info',
        GOV: 'info'
      };
      return map[type] || 'info';
    };
    const getServiceName = type => {
      const map = {
        SHARING: '同站租還',
        STORE: '門市租賃',
        SAME_STATION: '同站租還',
        DIFF_STATION: '甲租乙還',
        STORE_RENTAL: '門市租車',
        STORE_SELF_SERVICE: '24小時自助',
        GOV: '公務用車'
      };
      return map[type] || type;
    };
    const getServiceDisplayName = service => {
      if (!service) return '';
      const base = getServiceName(service.bizType);
      if (service.bizType !== 'DIFF_STATION') return base;
      const pickup = !!service.config?.pickupEnabled;
      const returnable = !!service.config?.returnEnabled;
      if (pickup && returnable) return `${base}（取/還）`;
      if (pickup) return `${base}（取）`;
      if (returnable) return `${base}（還）`;
      return base;
    };
    const bizDomain = type => type === 'GOV' ? 'GOV' : ['STORE', 'STORE_RENTAL', 'STORE_SELF_SERVICE'].includes(type) ? 'STORE' : 'SHARING';
    const getBusinessLineName = bizType => {
      if (['SAME_STATION', 'DIFF_STATION'].includes(bizType)) return '分時租賃';
      if (['STORE_RENTAL', 'STORE_SELF_SERVICE'].includes(bizType)) return '門市租賃';
      if (bizType === 'GOV') return '公務用車';
      return '-';
    };
    const getServiceSummary = station => {
      const services = station?.services || [];
      const activeCount = services.filter(service => service.status === 'ACTIVE').length;
      const suspendedCount = services.filter(service => service.status === 'SUSPENDED').length;
      return suspendedCount > 0 ? `已啓用 ${activeCount} 項 · 已暫停 ${suspendedCount} 項` : `已啓用 ${activeCount} 項`;
    };
    const getServiceDomainSummary = station => {
      const counts = {
        SHARING: 0,
        STORE: 0,
        GOV: 0
      };
      (station?.services || []).forEach(service => {
        counts[bizDomain(service.bizType)] += 1;
      });
      const items = [];
      if (counts.SHARING) items.push(`分時租賃 ${counts.SHARING}`);
      if (counts.STORE) items.push(`門市租賃 ${counts.STORE}`);
      if (counts.GOV) items.push(`公務用車 ${counts.GOV}`);
      return items.length ? items.join(' · ') : '未配置服務能力';
    };
    const formatServiceHours = range => {
      if (!Array.isArray(range) || range.length < 2) return '未設置服務時段';
      const format = value => {
        const date = value instanceof Date ? value : new Date(value);
        if (Number.isNaN(date.getTime())) return '--:--';
        return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
      };
      return `${format(range[0])}-${format(range[1])}`;
    };
    const getServiceKeyConfig = row => {
      const service = row?.service || {};
      if (service.bizType === 'SAME_STATION') {
        return `預留車位 ${Number(service.reservedSpots || 0)} 個`;
      }
      if (service.bizType === 'DIFF_STATION') {
        const pickup = service.config?.pickupEnabled !== false;
        const returnable = service.config?.returnEnabled !== false;
        const roleText = pickup && returnable ? '支持取還' : pickup ? '僅取車' : returnable ? '僅還車' : '未開放取還';
        return `預留車位 ${Number(service.reservedSpots || 0)} 個 · ${roleText}`;
      }
      if (service.bizType === 'STORE_RENTAL') {
        return '門市租車履約據點';
      }
      if (service.bizType === 'STORE_SELF_SERVICE') {
        const method = selfServicePickupMethodOptions.value.find(item => item.value === service.config?.pickupMethod);
        return `${method?.label || 'App 掃碼取還'} · ${service.config?.allowNightReturn === false ? '不允許夜間還車' : '允許夜間還車'}`;
      }
      if (service.bizType === 'GOV') {
        const count = Array.isArray(service.config?.corporateIds) ? service.config.corporateIds.length : 0;
        return count > 0 ? `已綁定 ${count} 家企業客戶` : '未綁定企業客戶';
      }
      return '-';
    };
    const openServiceCapabilityDialog = row => {
      if (!canManageService(row?.service?.bizType)) {
        feedback.ElMessage.warning('當前賬號僅可查看該服務能力');
        return;
      }
      activeCapabilityRow.value = row;
      serviceCapabilityForm.status = row.service.status || 'ACTIVE';
      serviceCapabilityForm.reservedSpots = Number(row.service.reservedSpots || 0);
      serviceCapabilityForm.config = normalizeServiceConfig(row.service.bizType, row.service.config || {});
      serviceCapabilityDialogVisible.value = true;
    };
    const saveServiceCapability = () => {
      const row = activeCapabilityRow.value;
      if (!row || !canManageService(row.service.bizType)) return;
      if (['SAME_STATION', 'DIFF_STATION'].includes(row.service.bizType)) {
        const otherReserved = (row.station.services || []).filter(service => service !== row.service).reduce((total, service) => total + Number(service.reservedSpots || 0), 0);
        if (otherReserved + Number(serviceCapabilityForm.reservedSpots || 0) > Number(row.station.totalCapacity || 0)) {
          feedback.ElMessage.error('各服務模式預留車位合計不得超過據點總車位');
          return;
        }
      }
      row.service.status = serviceCapabilityForm.status;
      row.service.reservedSpots = Number(serviceCapabilityForm.reservedSpots || 0);
      row.service.config = serializeServiceConfig(row.service.bizType, serviceCapabilityForm.config || {});
      serviceCapabilityDialogVisible.value = false;
      feedback.ElMessage.success('服務能力已保存');
    };
    const getParkedCount = row => {
      return Number(row?.parkedCount || 0);
    };
    const getAvailableSpots = row => {
      const totalCapacity = Number(row?.totalCapacity || 0);
      return Math.max(0, totalCapacity - getParkedCount(row));
    };
    const isParkingFull = row => {
      const totalCapacity = Number(row?.totalCapacity || 0);
      if (totalCapacity <= 0) return false;
      return getParkedCount(row) >= totalCapacity;
    };
    const getParkingOccupancyPercentage = row => {
      const totalCapacity = Number(row?.totalCapacity || 0);
      if (totalCapacity <= 0) return 0;
      return Math.min(100, getParkedCount(row) / totalCapacity * 100);
    };
    const hasDiffStationReturn = row => {
      const svc = (row.services || []).find(s => s.bizType === 'DIFF_STATION');
      return !!svc && svc.status === 'ACTIVE';
    };
    const getTotalReserved = row => {
      if (!row.services) return 0;
      return row.services.reduce((acc, cur) => {
        if (!['SAME_STATION', 'DIFF_STATION'].includes(cur.bizType)) return acc;
        return acc + (cur.reservedSpots || 0);
      }, 0);
    };
    const getNodeScopeLabel = node => {
      if (!node) return '全部據點';
      if (node.level === 'company') return `車行：${node.label}`;
      if (node.level === 'store') return `門市：${node.label}`;
      return `據點：${node.label}`;
    };
    const initEmptyCompany = () => ({
      id: 'C' + Date.now(),
      label: '',
      level: 'company',
      contactName: '',
      contactPhone: '',
      taxId: '',
      providerType: '',
      remark: '',
      children: []
    });
    const initEmptyStore = () => ({
      id: 'S' + Date.now(),
      label: '',
      level: 'store',
      contactName: '',
      contactPhone: '',
      email: '',
      addressRegion: [],
      addressDetail: '',
      remark: '',
      children: []
    });
    const stationTypeOptions = ref([{
      label: '普通營運據點',
      value: '普通營運據點',
      normalEntryVisible: true
    }, {
      label: '旅行社團體專用',
      value: '旅行社團體專用',
      normalEntryVisible: false
    }, {
      label: '企業活動合作據點',
      value: '企業活動合作據點',
      normalEntryVisible: true
    }, {
      label: '碼頭遊客取還點',
      value: '碼頭遊客取還點',
      normalEntryVisible: true
    }, {
      label: '機場快取站',
      value: '機場快取站',
      normalEntryVisible: true
    }, {
      label: '景區停車點',
      value: '景區停車點',
      normalEntryVisible: true
    }, {
      label: '酒店聯運點',
      value: '酒店聯運點',
      normalEntryVisible: true
    }, {
      label: '商圈服務點',
      value: '商圈服務點',
      normalEntryVisible: true
    }, {
      label: '服務區停車點',
      value: '服務區停車點',
      normalEntryVisible: true
    }]);
    const corporateOptions = ref([{
      label: '春暉文旅集團',
      value: 'CORP001'
    }, {
      label: '遠星國際會展',
      value: 'CORP002'
    }, {
      label: '東崗高校後勤',
      value: 'CORP003'
    }]);
    const selfServicePickupMethodOptions = ref([{
      label: 'App 掃碼取還',
      value: 'APP_SCAN'
    }, {
      label: '自助機取還',
      value: 'SELF_KIOSK'
    }, {
      label: '密碼櫃取鑰匙',
      value: 'KEY_LOCKER'
    }, {
      label: '遠程審覈開通',
      value: 'REMOTE_APPROVAL'
    }]);
    const serviceGroupTypes = {
      SHARING: ['SAME_STATION', 'DIFF_STATION'],
      STORE: ['STORE_RENTAL', 'STORE_SELF_SERVICE'],
      GOV: ['GOV']
    };
    const serviceTypeGroupMap = Object.entries(serviceGroupTypes).reduce((acc, [group, types]) => {
      types.forEach(type => {
        acc[type] = group;
      });
      return acc;
    }, {});
    const reservableServiceTypes = new Set(['SAME_STATION', 'DIFF_STATION']);
    const createDefaultOperatingHours = () => [new Date(2000, 0, 1, 8, 0), new Date(2000, 0, 1, 22, 0)];
    const cloneTimeRange = (hours, fallbackFactory) => {
      if (!Array.isArray(hours) || hours.length !== 2) {
        return fallbackFactory();
      }
      return hours.map(item => item ? new Date(item) : new Date(2000, 0, 1, 0, 0));
    };
    const cloneOperatingHours = hours => cloneTimeRange(hours, createDefaultOperatingHours);
    const createDefaultCounterServiceHours = () => [new Date(2000, 0, 1, 9, 0), new Date(2000, 0, 1, 20, 0)];
    const getDefaultServiceGroupConfig = () => ({
      enabled: false,
      serviceHours: createDefaultOperatingHours()
    });
    const normalizeSingleServiceGroup = (group, config = {}, services = []) => {
      const defaultConfig = getDefaultServiceGroupConfig(group);
      const relatedTypes = serviceGroupTypes[group] || [];
      const inferredEnabled = relatedTypes.some(type => services.some(service => service.bizType === type));
      return {
        ...defaultConfig,
        ...config,
        enabled: inferredEnabled || !!config?.enabled,
        serviceHours: cloneOperatingHours(config?.serviceHours)
      };
    };
    const normalizeServiceGroups = (serviceGroups = {}, services = []) => ({
      SHARING: normalizeSingleServiceGroup('SHARING', serviceGroups?.SHARING, services),
      STORE: normalizeSingleServiceGroup('STORE', serviceGroups?.STORE, services),
      GOV: normalizeSingleServiceGroup('GOV', serviceGroups?.GOV, services)
    });
    const createDefaultServiceGroups = (services = []) => normalizeServiceGroups({}, services);
    const serializeServiceGroups = (serviceGroups = {}, services = []) => {
      const normalizedGroups = normalizeServiceGroups(serviceGroups, services);
      return {
        SHARING: {
          enabled: !!normalizedGroups.SHARING.enabled,
          serviceHours: cloneOperatingHours(normalizedGroups.SHARING.serviceHours)
        },
        STORE: {
          enabled: !!normalizedGroups.STORE.enabled,
          serviceHours: cloneOperatingHours(normalizedGroups.STORE.serviceHours)
        },
        GOV: {
          enabled: !!normalizedGroups.GOV.enabled,
          serviceHours: cloneOperatingHours(normalizedGroups.GOV.serviceHours)
        }
      };
    };
    const getDefaultServiceConfig = type => {
      if (type === 'DIFF_STATION') {
        return {
          pickupEnabled: true,
          returnEnabled: true
        };
      }
      if (type === 'GOV') {
        return {
          corporateIds: []
        };
      }
      if (type === 'STORE_RENTAL') {
        return {
          counterServiceHours: createDefaultCounterServiceHours(),
          manualHandover: true,
          manualInspection: true
        };
      }
      if (type === 'STORE_SELF_SERVICE') {
        return {
          allowNightReturn: true,
          pickupMethod: 'APP_SCAN'
        };
      }
      return {};
    };
    const normalizeServiceConfig = (type, config = {}) => {
      const defaultConfig = getDefaultServiceConfig(type);
      if (type === 'DIFF_STATION') {
        return {
          pickupEnabled: config?.pickupEnabled ?? defaultConfig.pickupEnabled,
          returnEnabled: config?.returnEnabled ?? defaultConfig.returnEnabled
        };
      }
      if (type === 'GOV') {
        return {
          corporateIds: Array.isArray(config?.corporateIds) ? [...config.corporateIds] : []
        };
      }
      if (type === 'STORE_RENTAL') {
        return {
          ...defaultConfig,
          ...config,
          counterServiceHours: cloneTimeRange(config?.counterServiceHours, createDefaultCounterServiceHours),
          manualHandover: config?.manualHandover ?? defaultConfig.manualHandover,
          manualInspection: config?.manualInspection ?? defaultConfig.manualInspection
        };
      }
      if (type === 'STORE_SELF_SERVICE') {
        return {
          ...defaultConfig,
          ...config,
          allowNightReturn: config?.allowNightReturn ?? defaultConfig.allowNightReturn,
          pickupMethod: config?.pickupMethod || defaultConfig.pickupMethod
        };
      }
      return {
        ...(config || {})
      };
    };
    const serializeServiceConfig = (type, config = {}) => {
      if (type === 'DIFF_STATION') {
        return {
          pickupEnabled: config?.pickupEnabled ?? true,
          returnEnabled: config?.returnEnabled ?? true
        };
      }
      if (type === 'GOV') {
        return {
          corporateIds: Array.isArray(config?.corporateIds) ? [...config.corporateIds] : []
        };
      }
      if (type === 'STORE_RENTAL') {
        return {
          counterServiceHours: cloneTimeRange(config?.counterServiceHours, createDefaultCounterServiceHours),
          manualHandover: !!config?.manualHandover,
          manualInspection: !!config?.manualInspection
        };
      }
      if (type === 'STORE_SELF_SERVICE') {
        return {
          allowNightReturn: !!config?.allowNightReturn,
          pickupMethod: config?.pickupMethod || 'APP_SCAN'
        };
      }
      return {};
    };
    const createGeofence = (index = 0) => ({
      key: `F${index + 1}`,
      enabled: index === 0,
      longitude: '',
      latitude: '',
      radius: index === 0 ? 60 : 40
    });
    const normalizeGeofences = (geofences = []) => {
      const source = Array.isArray(geofences) ? geofences.slice(0, 4) : [];
      const normalized = source.map((fence, index) => ({
        ...createGeofence(index),
        ...(fence || {}),
        key: `F${index + 1}`,
        radius: Number((fence || {}).radius ?? (index === 0 ? 60 : 40))
      }));
      if (!normalized.length) {
        normalized.push(createGeofence(0));
      }
      return normalized;
    };
    const createDefaultGeofences = () => normalizeGeofences();
    const getParsedParkingSlots = () => {
      if (!fixedParkingSlotsInput.value) return [];
      return fixedParkingSlotsInput.value.split(/[\n,，]/).map(item => item.trim()).filter(Boolean);
    };
    const normalizeStation = (station = {}) => {
      const typeMap = {
        SHARING: 'SAME_STATION',
        STORE: 'STORE_RENTAL',
        SAME_STATION: 'SAME_STATION',
        DIFF_STATION: 'DIFF_STATION',
        STORE_RENTAL: 'STORE_RENTAL',
        STORE_SELF_SERVICE: 'STORE_SELF_SERVICE',
        GOV: 'GOV'
      };
      const base = {
        id: station.id || Date.now(),
        parentId: station.parentId || (currentNode.value?.level === 'store' ? currentNode.value.id : null),
        name: '',
        stationType: stationTypeOptions.value[0]?.value || '',
        parkingLotType: '露天停車場',
        parkingCompany: '',
        contactName: '',
        contactPhone: '',
        email: '',
        fax: '',
        addressRegion: [],
        addressDetail: '',
        address: '',
        longitude: '',
        latitude: '',
        fenceRadius: 50,
        geofences: createDefaultGeofences(),
        operatingHours: createDefaultOperatingHours(),
        rentalDeposit: 0,
        monthlyRentCost: 0,
        utilityCost: 0,
        staffingCost: 0,
        accessMethod: '',
        isFixedParking: false,
        fixedParkingSlots: [],
        photos: [],
        totalCapacity: 10,
        parkedCount: 0,
        parkingFeeRule: '',
        description: '',
        remark: '',
        isActive: true,
        serviceGroups: createDefaultServiceGroups(),
        services: []
      };
      const normalized = {
        ...base,
        ...station
      };
      normalized.addressRegion = Array.isArray(station.addressRegion) ? [...station.addressRegion] : [];
      normalized.fixedParkingSlots = Array.isArray(station.fixedParkingSlots) ? station.fixedParkingSlots.filter(Boolean) : [];
      normalized.photos = Array.isArray(station.photos) ? station.photos.map((photo, index) => ({
        name: photo.name || `據點照片${index + 1}`,
        url: photo.url || photo.response?.url || ''
      })).filter(photo => photo.url) : [];
      normalized.operatingHours = cloneOperatingHours(station.operatingHours || station.services?.find(item => item.bizType === 'STORE')?.config?.operatingHours);
      normalized.geofences = normalizeGeofences(station.geofences);
      const seen = new Set();
      normalized.services = [];
      (Array.isArray(station.services) ? station.services : []).forEach(service => {
        const bizType = typeMap[service.bizType] || service.bizType;
        if (seen.has(bizType)) return;
        seen.add(bizType);
        normalized.services.push({
          bizType,
          status: service.status || 'ACTIVE',
          reservedSpots: reservableServiceTypes.has(bizType) ? Number(service.reservedSpots || 0) : 0,
          config: normalizeServiceConfig(bizType, service.config)
        });
      });
      normalized.serviceGroups = normalizeServiceGroups(station.serviceGroups, normalized.services);
      if (!normalized.address) {
        normalized.address = [...normalized.addressRegion, normalized.addressDetail].filter(Boolean).join(' ');
      }
      return normalized;
    };
    const getCoordinateTargetLabel = target => {
      if (target === 'station') return '據點主座標';
      const match = String(target).match(/^geofence-(\d+)$/);
      if (match) return `電子圍欄 ${Number(match[1]) + 1}`;
      return '據點主座標';
    };
    const getCoordinateTargetValue = target => {
      if (target === 'station') {
        return {
          longitude: currentStation.longitude,
          latitude: currentStation.latitude
        };
      }
      const match = String(target).match(/^geofence-(\d+)$/);
      if (!match) return {
        longitude: '',
        latitude: ''
      };
      return currentStation.geofences?.[Number(match[1])] || {
        longitude: '',
        latitude: ''
      };
    };
    const isValidCoordinate = (longitude, latitude) => {
      const lng = Number(longitude);
      const lat = Number(latitude);
      return Number.isFinite(lng) && Number.isFinite(lat);
    };
    const formatCoordinateDisplay = target => {
      const {
        longitude,
        latitude
      } = getCoordinateTargetValue(target);
      if (!isValidCoordinate(longitude, latitude)) return '未設置';
      return `${Number(longitude).toFixed(6)}, ${Number(latitude).toFixed(6)}`;
    };
    const setActiveCoordinateTarget = target => {
      if (target === 'station') {
        activeCoordinateTarget.value = target;
        return;
      }
      const match = String(target).match(/^geofence-(\d+)$/);
      if (!match || !currentStation.geofences?.[Number(match[1])]) {
        activeCoordinateTarget.value = 'station';
        return;
      }
      activeCoordinateTarget.value = target;
    };
    const addGeofence = () => {
      if (!Array.isArray(currentStation.geofences)) {
        currentStation.geofences = createDefaultGeofences();
      }
      if (currentStation.geofences.length >= 4) return;
      const newFence = {
        key: 'F' + Date.now(),
        enabled: false,
        longitude: '',
        latitude: '',
        radius: 40
      };
      currentStation.geofences = [...currentStation.geofences, newFence];
    };
    const removeGeofence = index => {
      if (!Array.isArray(currentStation.geofences) || index <= 0 || currentStation.geofences.length <= 1) {
        return;
      }
      currentStation.geofences.splice(index, 1);
      if (String(activeCoordinateTarget.value).startsWith('geofence-')) {
        activeCoordinateTarget.value = 'station';
      }
    };
    const assignCoordinateTarget = (target, longitude, latitude) => {
      const lng = Number(longitude).toFixed(6);
      const lat = Number(latitude).toFixed(6);
      if (target === 'station') {
        currentStation.longitude = lng;
        currentStation.latitude = lat;
        return;
      }
      const match = String(target).match(/^geofence-(\d+)$/);
      if (!match) return;
      const index = Number(match[1]);
      if (!currentStation.geofences[index]) return;
      currentStation.geofences[index].longitude = lng;
      currentStation.geofences[index].latitude = lat;
      currentStation.geofences[index].enabled = true;
    };
    const handleMapClick = event => {
      const rect = event.currentTarget.getBoundingClientRect();
      const ratioX = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width));
      const ratioY = Math.min(1, Math.max(0, (event.clientY - rect.top) / rect.height));
      const longitude = 118 + (122.5 - 118) * ratioX;
      const latitude = 25.6 - (25.6 - 21.8) * ratioY;
      assignCoordinateTarget(activeCoordinateTarget.value, longitude, latitude);
    };
    const openMapPicker = target => {
      mapPickerTarget.value = target;
      setActiveCoordinateTarget(target);
      mapPickerVisible.value = true;
    };
    const getMarkerStyle = target => {
      const {
        longitude,
        latitude
      } = getCoordinateTargetValue(target);
      if (!isValidCoordinate(longitude, latitude)) return {
        display: 'none'
      };
      const left = (Number(longitude) - 118) / (122.5 - 118) * 100;
      const top = (25.6 - Number(latitude)) / (25.6 - 21.8) * 100;
      return {
        left: `${Math.min(96, Math.max(4, left))}%`,
        top: `${Math.min(96, Math.max(4, top))}%`
      };
    };
    const getFenceMarkerClass = index => {
      return ['bg-emerald-500', 'bg-amber-500', 'bg-violet-500', 'bg-rose-500'][index] || 'bg-slate-500';
    };
    const handleStationPhotoChange = (_uploadFile, uploadFiles) => {
      currentStation.photos = uploadFiles.map((file, index) => ({
        name: file.name || `據點照片${index + 1}`,
        url: file.url || (file.raw ? URL.createObjectURL(file.raw) : '')
      })).filter(file => file.url);
    };
    const removeStationPhoto = (_uploadFile, uploadFiles) => {
      currentStation.photos = uploadFiles.map((file, index) => ({
        name: file.name || `據點照片${index + 1}`,
        url: file.url || (file.raw ? URL.createObjectURL(file.raw) : '')
      })).filter(file => file.url);
    };
    const addStationTypeOption = () => {
      const value = newStationTypeInput.value.trim();
      if (!value) {
        feedback.ElMessage.warning('請輸入據點類型');
        return;
      }
      if (stationTypeOptions.value.some(option => option.value === value)) {
        feedback.ElMessage.warning('該據點類型已存在');
        return;
      }
      stationTypeOptions.value.push({
        label: value,
        value,
        normalEntryVisible: true
      });
      newStationTypeInput.value = '';
    };
    const removeStationTypeOption = index => {
      const removed = stationTypeOptions.value[index];
      stationTypeOptions.value.splice(index, 1);
      if (removed && currentStation.stationType === removed.value) {
        currentStation.stationType = stationTypeOptions.value[0]?.value || '';
      }
    };
    const handleStationSelectionChange = rows => {
      selectedStationRows.value = rows;
    };
    const clearStationSelection = () => {
      selectedStationRows.value = [];
      stationTableRef.value?.clearSelection?.();
    };
    const openStationImportDialog = () => {
      stationImportForm.mode = 'append';
      stationImportForm.templateType = 'station_basic';
      stationImportFileList.value = [];
      stationImportFile.value = null;
      stationImportDialogVisible.value = true;
    };
    const downloadStationTemplate = () => {
      feedback.ElMessage.success('模板開始下載');
    };
    const handleStationFileChange = file => {
      stationImportFile.value = file;
    };
    const openStationExportDialog = () => {
      stationExportForm.scope = 'filtered';
      stationExportForm.format = 'xlsx';
      stationExportForm.fields = ['basic', 'service', 'capacity', 'status'];
      stationExportDialogVisible.value = true;
    };
    const handleStationImportFileChange = (_file, files) => {
      stationImportFileList.value = files.slice(-1);
    };
    const handleStationImportFileRemove = (_file, files) => {
      stationImportFileList.value = files;
    };
    const handleStationImport = () => {
      if (!stationImportFile.value) {
        feedback.ElMessage.warning('請先選擇要導入的批量文件');
        return;
      }
      stationImportDialogVisible.value = false;
      stationImportFile.value = null;
      stationImportFileList.value = [];
      feedback.ElMessage.success('導入申請已提交，系統正在後臺解析處理。');
    };
    const handleStationExport = () => {
      feedback.ElMessage.success('據點數據導出任務已提交，系統稍後將自動下載文件。');
    };
    const applyStationBatchStatus = nextStatus => {
      if (!selectedStationRows.value.length) {
        feedback.ElMessage.warning('請先選擇據點');
        return;
      }
      selectedStationRows.value.forEach(row => {
        row.isActive = nextStatus;
        const target = allStations.value.find(item => item.id === row.id);
        if (target) target.isActive = nextStatus;
      });
      const actionText = nextStatus ? '啓用' : '停用';
      const count = selectedStationRows.value.length;
      clearStationSelection();
      feedback.ElMessage.success(`已批量${actionText} ${count} 個據點`);
    };
    const ensureServiceGroups = () => {
      currentStation.serviceGroups = normalizeServiceGroups(currentStation.serviceGroups, currentStation.services || []);
      return currentStation.serviceGroups;
    };
    const getServiceGroupConfig = group => {
      return currentStation.serviceGroups?.[group] || getDefaultServiceGroupConfig(group);
    };
    const toggleServiceGroup = group => {
      const groupConfig = getServiceGroupConfig(group);
      const relatedTypes = serviceGroupTypes[group] || [];
      if (!groupConfig.enabled) {
        relatedTypes.forEach(type => {
          serviceChecks[type] = false;
          const index = currentStation.services.findIndex(item => item.bizType === type);
          if (index !== -1) currentStation.services.splice(index, 1);
        });
        return;
      }
      if (group === 'GOV') {
        serviceChecks.GOV = true;
        if (!hasService('GOV')) {
          currentStation.services.push({
            bizType: 'GOV',
            status: 'ACTIVE',
            reservedSpots: 0,
            config: normalizeServiceConfig('GOV')
          });
        }
      }
    };
    const openHierarchyDialog = () => {
      hierarchyDialogVisible.value = true;
      if (orgData.value.length > 0) {
        hierarchyCurrentCompany.value = orgData.value[0];
      }
    };
    const addCompany = () => {
      isCompanyEdit.value = false;
      Object.assign(companyForm, initEmptyCompany());
      companyDialogVisible.value = true;
    };
    const openCompanyDialog = comp => {
      isCompanyEdit.value = true;
      Object.assign(companyForm, JSON.parse(JSON.stringify(comp)));
      companyDialogVisible.value = true;
    };
    const saveCompany = () => {
      if (!companyForm.label) {
        feedback.ElMessage.warning('請填寫車行名稱');
        return;
      }
      if (isCompanyEdit.value) {
        const target = orgData.value.find(c => c.id === companyForm.id);
        if (target) Object.assign(target, JSON.parse(JSON.stringify(companyForm)));
        if (hierarchyCurrentCompany.value?.id === companyForm.id) {
          hierarchyCurrentCompany.value = target || hierarchyCurrentCompany.value;
        }
      } else {
        const newComp = JSON.parse(JSON.stringify(companyForm));
        if (!newComp.children) newComp.children = [];
        orgData.value.push(newComp);
        hierarchyCurrentCompany.value = newComp;
      }
      companyDialogVisible.value = false;
      feedback.ElMessage.success('車行已保存');
    };
    const deleteCompany = comp => {
      if (comp.children && comp.children.length > 0) {
        feedback.ElMessage.warning('該車行下還有門店，請先刪除門店');
        return;
      }
      feedback.ElMessageBox.confirm('確定要刪除該車行嗎?', '警告', {
        type: 'warning'
      }).then(() => {
        const idx = orgData.value.findIndex(c => c.id === comp.id);
        if (idx !== -1) {
          orgData.value.splice(idx, 1);
          if (hierarchyCurrentCompany.value?.id === comp.id) {
            hierarchyCurrentCompany.value = orgData.value[0] || null;
          }
          feedback.ElMessage.success('車行已刪除');
        }
      });
    };
    const addStore = () => {
      if (!hierarchyCurrentCompany.value) return;
      isStoreEdit.value = false;
      Object.assign(storeForm, initEmptyStore());
      storeDialogVisible.value = true;
    };
    const openStoreDialog = store => {
      isStoreEdit.value = true;
      Object.assign(storeForm, JSON.parse(JSON.stringify(store)));
      if (!Array.isArray(storeForm.addressRegion)) storeForm.addressRegion = [];
      storeDialogVisible.value = true;
    };
    const saveStore = () => {
      if (!hierarchyCurrentCompany.value) return;
      if (!storeForm.label) {
        feedback.ElMessage.warning('請填寫門市名稱');
        return;
      }
      if (!hierarchyCurrentCompany.value.children) hierarchyCurrentCompany.value.children = [];
      if (isStoreEdit.value) {
        const target = hierarchyCurrentCompany.value.children.find(s => s.id === storeForm.id);
        if (target) Object.assign(target, JSON.parse(JSON.stringify(storeForm)));
      } else {
        hierarchyCurrentCompany.value.children.push(JSON.parse(JSON.stringify(storeForm)));
      }
      storeDialogVisible.value = false;
      feedback.ElMessage.success('門市已保存');
    };
    const deleteStore = store => {
      const hasStations = allStations.value.some(s => s.parentId === store.id);
      if (hasStations) {
        feedback.ElMessage.warning('該門店下還有據點，請先刪除據點');
        return;
      }
      feedback.ElMessageBox.confirm('確定要刪除該門店嗎?', '警告', {
        type: 'warning'
      }).then(() => {
        const children = hierarchyCurrentCompany.value.children;
        const idx = children.findIndex(s => s.id === store.id);
        if (idx !== -1) {
          children.splice(idx, 1);
          feedback.ElMessage.success('門店已刪除');
        }
      });
    };
    const initEmptyStation = () => normalizeStation();
    const openStationDialog = row => {
      if (!canManageStationBase.value) {
        feedback.ElMessage.warning('當前賬號沒有據點基礎資料維護權限');
        return;
      }
      const station = row ? normalizeStation(row) : initEmptyStation();
      isEdit.value = !!row;
      Object.assign(currentStation, station);
      ensureServiceGroups();
      fixedParkingSlotsInput.value = (station.fixedParkingSlots || []).join("\n");
      activeCoordinateTarget.value = 'station';
      serviceChecks.SAME_STATION = !!station.services.find(s => s.bizType === 'SAME_STATION');
      serviceChecks.DIFF_STATION = !!station.services.find(s => s.bizType === 'DIFF_STATION');
      serviceChecks.STORE_RENTAL = !!station.services.find(s => s.bizType === 'STORE_RENTAL');
      serviceChecks.STORE_SELF_SERVICE = !!station.services.find(s => s.bizType === 'STORE_SELF_SERVICE');
      serviceChecks.GOV = !!station.services.find(s => s.bizType === 'GOV');
      dialogVisible.value = true;
    };
    const hasService = type => {
      return !!(currentStation.services || []).find(s => s.bizType === type);
    };
    const getServiceConfig = type => {
      const fallback = {
        bizType: type,
        status: 'ACTIVE',
        reservedSpots: 0,
        config: type === 'GOV' ? {
          corporateIds: []
        } : getDefaultServiceConfig(type)
      };
      if (!Array.isArray(currentStation.services)) return fallback;
      return currentStation.services.find(item => item.bizType === type) || fallback;
    };
    const toggleService = type => {
      const checked = serviceChecks[type];
      const group = serviceTypeGroupMap[type];
      if (checked) {
        if (group) getServiceGroupConfig(group).enabled = true;
        if (!hasService(type)) {
          currentStation.services.push({
            bizType: type,
            status: 'ACTIVE',
            reservedSpots: 0,
            config: normalizeServiceConfig(type)
          });
        }
        return;
      }
      const index = currentStation.services.findIndex(item => item.bizType === type);
      if (index !== -1) currentStation.services.splice(index, 1);
      if (group === 'GOV') {
        getServiceGroupConfig('GOV').enabled = false;
      }
    };
    const totalReservedSpots = computed(() => {
      return getTotalReserved(currentStation);
    });
    const govCorporateIds = computed({
      get() {
        const svc = (currentStation.services || []).find(s => s.bizType === 'GOV');
        return svc && Array.isArray(svc.config?.corporateIds) ? svc.config.corporateIds : [];
      },
      set(val) {
        let svc = (currentStation.services || []).find(s => s.bizType === 'GOV');
        if (!svc) {
          svc = {
            bizType: 'GOV',
            status: 'ACTIVE',
            reservedSpots: 0,
            config: {
              corporateIds: []
            }
          };
          currentStation.services.push(svc);
        }
        if (!svc.config) svc.config = {};
        svc.config.corporateIds = Array.isArray(val) ? val : [];
      }
    });
    const saveStation = () => {
      if (!currentStation.name || !currentStation.parentId) {
        feedback.ElMessage.warning('請先填寫據點名稱並選擇所屬門市');
        return;
      }
      if (!isStoreNode(currentStation.parentId)) {
        feedback.ElMessage.warning('所屬門市必須選擇到門市層級');
        return;
      }
      if (totalReservedSpots.value > Number(currentStation.totalCapacity || 0)) {
        feedback.ElMessage.warning('預留車位數不能超過據點總車位數');
        return;
      }
      if (hasService('GOV') && !getServiceConfig('GOV').config.corporateIds?.length) {
        feedback.ElMessage.warning('請選擇公務用車業務對應的簽約企業客戶');
        return;
      }
      const payload = normalizeStation({
        ...currentStation,
        address: [...(currentStation.addressRegion || []), currentStation.addressDetail].filter(Boolean).join(' '),
        fixedParkingSlots: currentStation.isFixedParking ? getParsedParkingSlots() : [],
        services: (currentStation.services || []).map(service => ({
          bizType: service.bizType,
          status: service.status || 'ACTIVE',
          reservedSpots: reservableServiceTypes.has(service.bizType) ? Number(service.reservedSpots || 0) : 0,
          config: serializeServiceConfig(service.bizType, service.config)
        })),
        serviceGroups: serializeServiceGroups(ensureServiceGroups(), currentStation.services),
        geofences: normalizeGeofences(currentStation.geofences).map((fence, index) => ({
          key: fence.key || `F${index + 1}`,
          enabled: !!fence.enabled,
          longitude: fence.longitude,
          latitude: fence.latitude,
          radius: Number(fence.radius || 0)
        })),
        photos: (currentStation.photos || []).map((photo, index) => ({
          name: photo.name || `據點照片${index + 1}`,
          url: photo.url || photo.response?.url || ''
        })).filter(photo => photo.url)
      });
      if (isEdit.value) {
        const index = allStations.value.findIndex(item => item.id === payload.id);
        if (index !== -1) {
          allStations.value[index] = payload;
        }
      } else {
        allStations.value.push(payload);
      }
      dialogVisible.value = false;
      feedback.ElMessage.success('據點已保存');
    };
    const defaultProps = {
      children: 'children',
      label: 'label'
    };
    const handleStationRowCommand = () => feedback.ElMessage.info('据点删除尚无完整业务合同，请先使用停用操作。');
    return {
      orgData,
      allStations,
      currentNode,
      stationTableRef,
      orgTreeRef,
      dialogVisible,
      isEdit,
      searchQuery,
      stationViewMode,
      capabilityModeFilter,
      serviceStatusFilter,
      statusFilter,
      selectedStationRows,
      permissionDemoMode,
      permissionDemoOptions,
      canViewStationOverview,
      canViewAnyService,
      canManageStationBase,
      canManageService,
      permittedServiceFilterOptions,
      availableServiceCapabilityCount,
      permissionScopeText,
      setPermissionDemoMode,
      handleStationViewChange,
      switchStationView,
      serviceCapabilityDialogVisible,
      activeCapabilityRow,
      serviceCapabilityForm,
      stationImportDialogVisible,
      stationExportDialogVisible,
      stationImportFileList,
      stationImportFile,
      stationServiceFilterOptions,
      serviceStatusFilterOptions,
      serviceStatusOptions,
      stationImportForm,
      stationExportForm,
      currentStation,
      serviceChecks,
      stationTypeManagerVisible,
      newStationTypeInput,
      fixedParkingSlotsInput,
      activeCoordinateTarget,
      stationTypeOptions,
      corporateOptions,
      selfServicePickupMethodOptions,
      getIconByLevel,
      handleNodeClick,
      setAllScope,
      getStationList,
      visibleStations,
      pagedStations,
      stationPage,
      stationPageSize,
      visibleServiceCapabilities,
      pagedServiceCapabilities,
      capabilityPage,
      capabilityPageSize,
      getNodeScopeLabel,
      getStoreName,
      getStationTypeEntryText,
      getStationTypeEntryTagType,
      getServiceTagType,
      getServiceName,
      getServiceDisplayName,
      getBusinessLineName,
      getServiceSummary,
      getServiceDomainSummary,
      getServiceKeyConfig,
      openServiceCapabilityDialog,
      saveServiceCapability,
      getParkedCount,
      getAvailableSpots,
      isParkingFull,
      getParkingOccupancyPercentage,
      hasDiffStationReturn,
      getTotalReserved,
      handleStationSelectionChange,
      applyStationBatchStatus,
      openStationImportDialog,
      openStationExportDialog,
      downloadStationTemplate,
      handleStationFileChange,
      handleStationImportFileChange,
      handleStationImportFileRemove,
      handleStationImport,
      handleStationExport,
      openStationDialog,
      getServiceGroupConfig,
      toggleServiceGroup,
      hasService,
      getServiceConfig,
      toggleService,
      totalReservedSpots,
      govCorporateIds,
      saveStation,
      getCoordinateTargetLabel,
      setActiveCoordinateTarget,
      addGeofence,
      removeGeofence,
      handleMapClick,
      formatCoordinateDisplay,
      isValidCoordinate,
      getMarkerStyle,
      getFenceMarkerClass,
      mapPickerVisible,
      mapPickerTarget,
      openMapPicker,
      handleStationPhotoChange,
      removeStationPhoto,
      getParsedParkingSlots,
      stationParentOptions,
      stationParentProps,
      addStationTypeOption,
      removeStationTypeOption,
      hierarchyDialogVisible,
      hierarchyCurrentCompany,
      companyDialogVisible,
      storeDialogVisible,
      isCompanyEdit,
      isStoreEdit,
      companyForm,
      storeForm,
      addressOptions,
      openHierarchyDialog,
      addCompany,
      openCompanyDialog,
      saveCompany,
      deleteCompany,
      addStore,
      openStoreDialog,
      saveStore,
      deleteStore,
      ElMessage: feedback.ElMessage,
      ElMessageBox: feedback.ElMessageBox,
      permissionProfiles,
      activePermissionProfile,
      canViewService,
      isStoreNode,
      getStationTypeConfig,
      getStationTypeEntryConfig,
      bizDomain,
      formatServiceHours,
      initEmptyCompany,
      initEmptyStore,
      serviceGroupTypes,
      serviceTypeGroupMap,
      reservableServiceTypes,
      createDefaultOperatingHours,
      cloneTimeRange,
      cloneOperatingHours,
      createDefaultCounterServiceHours,
      getDefaultServiceGroupConfig,
      normalizeSingleServiceGroup,
      normalizeServiceGroups,
      createDefaultServiceGroups,
      serializeServiceGroups,
      getDefaultServiceConfig,
      normalizeServiceConfig,
      serializeServiceConfig,
      createGeofence,
      normalizeGeofences,
      createDefaultGeofences,
      normalizeStation,
      getCoordinateTargetValue,
      assignCoordinateTarget,
      clearStationSelection,
      ensureServiceGroups,
      initEmptyStation,
      defaultProps,
      handleStationRowCommand
    };
  }
  return pageSetup();
}
export default function StationsBlock() {
  const model = useRimoModel(createPageState);
  const view = model.view;
  const {
    text
  } = useRimoEnvironment();
  return <RimoRoot model={model} pageKey="stations" assets={{}}><div data-business-content="" data-rimo-layout="page"><div className="prototype-permission-switcher" aria-label="服務據點權限演示" data-rimo-layout="permissions"><span className="prototype-permission-switcher__label">{text("權限演示")}</span>
<RimoElement kind="el-radio-group" modelValue={view.permissionDemoMode} onModelChange={value => {
          model.write(["permissionDemoMode"], value);
        }} size="small" onChange={event => {
          view.setPermissionDemoMode?.(event);
        }}>{rimoEntries(view.permissionDemoOptions).map(([option], _itemIndex) => <Fragment key={option.value}><RimoElement kind="el-radio-button" key={option.value} label={option.value}>{rimoText(option.label)}</RimoElement></Fragment>)}</RimoElement></div>
<div className="flex justify-between items-end mb-6" data-rimo-layout="heading"><div><h1 className="text-2xl font-bold text-gray-800 tracking-tight">{text("服務據點管理")}</h1>
<p className="text-gray-500 text-sm mt-1">{text("按車行、門市範圍管理物理據點及各業務模式的履約能力。")}</p></div>
{view.canManageStationBase ? <><RimoElement kind="el-button" type="primary" size="large" className="shadow-md shadow-[color:var(--app-color-primary-shadow)]" onClick={_event => {
            view.openStationDialog(null);
          }}><RimoElement kind="el-icon" className="mr-1"><RimoIcon name="Plus" /></RimoElement>
{text(" 新增據點\n                            ")}</RimoElement></> : null}</div>
<div className="stations-main-grid" data-rimo-layout="columns"><div className="stations-scope-panel bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col"><div className="p-4 border-b border-gray-100 bg-gray-50 rounded-t-xl flex justify-between items-center" data-rimo-layout="toolbar"><span className="font-bold text-gray-700">{text("車行 / 門市範圍")}</span>
<RimoElement kind="el-button" size="small" type={!view.currentNode ? 'primary' : 'default'} onClick={event => {
              view.setAllScope?.(event);
            }}>{text("全部")}</RimoElement></div>
<div className="stations-scope-tree p-2"><RimoElement kind="el-tree" modelRef={model.ref("orgTreeRef")} data={view.orgData} props={view.defaultProps} nodeKey="id" defaultExpandAll={true} highlightCurrent={true} onNodeClick={event => {
              view.handleNodeClick?.(event);
            }} slots={{
              "default": ({
                node,
                data
              }) => <><div className="flex items-center w-full"><RimoElement kind="el-icon" className="mr-2 text-gray-400"><RimoIcon name={view.getIconByLevel(data.level)} /></RimoElement>
<span className={rimoClass(["flex-1 truncate text-sm", rimoClass({
                    'font-bold': data.level === 'company'
                  })])}>{rimoText(node.label)}</span></div></>
            }}></RimoElement></div></div>
<div className="stations-list-panel bg-white rounded-xl shadow-sm border border-gray-100"><RimoList data-rimo-layout="list" data-rimo-list="true" slots={{
            "toolbar": _slot => <><div className="stations-filter-controls flex items-center gap-3 flex-wrap min-w-0" data-rimo-layout="field-row"><div style={rimoStyle("width: 240px")}><RimoElement kind="el-input" modelValue={view.searchQuery} onModelChange={value => {
                    model.write(["searchQuery"], value);
                  }} placeholder="搜索據點名稱/地址..." prefixIcon="Search" clearable={true}></RimoElement></div>
{view.stationViewMode === 'capabilities' && view.permittedServiceFilterOptions.length > 1 ? <><RimoElement kind="el-select" modelValue={view.capabilityModeFilter} onModelChange={value => {
                    model.write(["capabilityModeFilter"], value);
                  }} placeholder="服務模式" clearable={true} style={rimoStyle("width: 160px")}>{rimoEntries(view.permittedServiceFilterOptions).map(([item], _itemIndex) => <Fragment key={item.value}><RimoElement kind="el-option" key={item.value} label={item.label} value={item.value}></RimoElement></Fragment>)}</RimoElement></> : view.stationViewMode === 'capabilities' && view.permittedServiceFilterOptions.length === 1 ? <><RimoElement kind="el-tag" type="primary" effect="plain" size="large">{text("\n                                                ")}{rimoText(view.permittedServiceFilterOptions[0].label)}{text("\n                                            ")}</RimoElement></> : null}
{view.stationViewMode === 'capabilities' ? <><RimoElement kind="el-select" modelValue={view.serviceStatusFilter} onModelChange={value => {
                    model.write(["serviceStatusFilter"], value);
                  }} placeholder="服務狀態" clearable={true} style={rimoStyle("width: 140px")}>{rimoEntries(view.serviceStatusFilterOptions).map(([item], _itemIndex) => <Fragment key={item.value}><RimoElement kind="el-option" key={item.value} label={item.label} value={item.value}></RimoElement></Fragment>)}</RimoElement></> : null}
<RimoElement kind="el-select" modelValue={view.statusFilter} onModelChange={value => {
                  model.write(["statusFilter"], value);
                }} placeholder="據點狀態" clearable={true} style={rimoStyle("width: 140px")}><RimoElement kind="el-option" label="啓用中" value="ACTIVE"></RimoElement>
<RimoElement kind="el-option" label="已停用" value="INACTIVE"></RimoElement></RimoElement>
<div className="flex items-center gap-3">{view.stationViewMode === 'overview' && view.canManageStationBase ? <><RimoElement kind="el-button" type="success" plain={true} onClick={event => {
                      view.openStationImportDialog?.(event);
                    }}><RimoElement kind="el-icon" className="mr-1"><RimoIcon name="Upload" /></RimoElement>
{text("導入\n                                                ")}</RimoElement></> : null}
<RimoElement kind="el-button" type="primary" plain={true} onClick={event => {
                    view.handleStationExport?.(event);
                  }}><RimoElement kind="el-icon" className="mr-1"><RimoIcon name="Download" /></RimoElement>
{text("導出\n                                                ")}</RimoElement></div>
{view.stationViewMode === 'overview' && view.canManageStationBase ? <><RimoElement kind="el-dropdown" onCommand={event => {
                    view.applyStationBatchStatus?.(event);
                  }} trigger="click" slots={{
                    "dropdown": _slot => <><RimoElement kind="el-dropdown-menu"><RimoElement kind="el-dropdown-item" command={true} className="text-emerald-600"><RimoElement kind="el-icon"><RimoIcon name="Check" /></RimoElement>
{text("批量啓用\n                                                        ")}</RimoElement>
<RimoElement kind="el-dropdown-item" command={false} className="text-red-500"><RimoElement kind="el-icon"><RimoIcon name="Close" /></RimoElement>
{text("批量停用\n                                                        ")}</RimoElement></RimoElement></>
                  }}><RimoElement kind="el-button" type="warning" plain={true} disabled={view.selectedStationRows.length === 0}>{text("\n                                                    批量操作\n                                                    ")}
<svg className="ml-1.5 h-4 w-4" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"></path></svg></RimoElement></RimoElement></> : null}
{view.stationViewMode === 'overview' && view.selectedStationRows.length ? <><span className="text-xs text-blue-600 font-medium whitespace-nowrap bg-blue-50 px-2 py-1 rounded border border-blue-100">{text("\n                                                已選 ")}{rimoText(view.selectedStationRows.length)}{text(" 項\n                                            ")}</span></> : null}</div>
<div className="ml-auto text-sm text-gray-500 whitespace-nowrap">{text("\n                                            ")}{rimoText(view.stationViewMode === 'overview' ? `共 ${view.visibleStations.length} 個據點` : `共
                                            ${view.visibleServiceCapabilities.length} 項服務能力`)}{text("\n                                        ")}</div></>
          }}><div className="stations-view-tabs" role="tablist" aria-label="服務據點視圖">{view.canViewStationOverview ? <><button type="button" role="tab" className={rimoClass(["stations-view-tab", rimoClass({
                  'is-active': view.stationViewMode === 'overview'
                })])} aria-selected={view.stationViewMode === 'overview'} onClick={_event => {
                  view.switchStationView('overview');
                }}><RimoElement kind="el-icon"><RimoIcon name="Location" /></RimoElement>
<span>{text("據點總覽")}</span>
<span className="stations-view-tab__count">{rimoText(view.visibleStations.length)}</span></button></> : null}
{view.canViewAnyService ? <><button type="button" role="tab" className={rimoClass(["stations-view-tab", rimoClass({
                  'is-active': view.stationViewMode === 'capabilities'
                })])} aria-selected={view.stationViewMode === 'capabilities'} onClick={_event => {
                  view.switchStationView('capabilities');
                }}><RimoElement kind="el-icon"><RimoIcon name="Operation" /></RimoElement>
<span>{text("服務能力管理")}</span>
<span className="stations-view-tab__count">{rimoText(view.availableServiceCapabilityCount)}</span></button></> : null}
<span className="stations-permission-scope"><RimoElement kind="el-icon"><RimoIcon name="Lock" /></RimoElement>
{rimoText(view.permissionScopeText)}{text("\n                                        ")}</span></div>
{view.stationViewMode === 'overview' && view.canViewStationOverview ? <><><RimoElement kind="el-table" modelRef={model.ref("stationTableRef")} data={view.pagedStations} rowKey="id" style={rimoStyle("width: 100%")} onSelectionChange={event => {
                  view.handleStationSelectionChange?.(event);
                }} data-rimo-shared-toolbar="true">{view.canManageStationBase ? <><RimoElement kind="el-table-column" type="selection" reserveSelection={true} width="52" align="center"></RimoElement></> : null}
<RimoElement kind="el-table-column" prop="name" label="據點名稱" minWidth="200" slots={{
                    "default": ({
                      row
                    }) => <><div className="font-medium text-gray-900">{rimoText(row.name)}</div>
<div className="text-xs text-gray-400 truncate">{rimoText(row.address)}</div></>
                  }}></RimoElement>
<RimoElement kind="el-table-column" label="所屬門市" minWidth="150" slots={{
                    "default": ({
                      row
                    }) => <><div className="text-sm text-gray-700">{rimoText(view.getStoreName(row.parentId))}{text("\n                                                    ")}</div></>
                  }}></RimoElement>
<RimoElement kind="el-table-column" label="據點屬性" minWidth="180" slots={{
                    "default": ({
                      row
                    }) => <><div className="station-summary-line">{rimoText(row.stationType || '未設置')}{text("\n                                                    ")}</div>
<div className={rimoClass(["station-entry-state", rimoClass({
                        'is-closed': view.getStationTypeEntryText(row.stationType) !== '一般預約可用'
                      })])}>{text("\n                                                        ")}{rimoText(view.getStationTypeEntryText(row.stationType))}{text("\n                                                    ")}</div></>
                  }}></RimoElement>
<RimoElement kind="el-table-column" label="服務概況" minWidth="210" slots={{
                    "default": ({
                      row
                    }) => <><div className="station-summary-line">{rimoText(view.getServiceSummary(row))}</div>
<div className="station-summary-subline">{rimoText(view.getServiceDomainSummary(row))}</div></>
                  }}></RimoElement>
<RimoElement kind="el-table-column" label="車位概況" width="220" slots={{
                    "default": ({
                      row
                    }) => <><div className="flex flex-col gap-1"><div className="flex justify-between text-xs"><span className="text-gray-500">{text("總車位 ")}{rimoText(row.totalCapacity)}</span>
<span className={rimoClass(view.getAvailableSpots(row) > 0 ? 'text-emerald-600' : 'text-rose-500')}>{text("\n                                                                ")}{rimoText(view.getAvailableSpots(row) > 0 ? `剩餘空位
                                                                ${view.getAvailableSpots(row)}` : '已無空位')}{text("\n                                                            ")}</span></div>
<RimoElement kind="el-progress" percentage={view.getParkingOccupancyPercentage(row)} status={view.isParkingFull(row) ? 'exception' : ''} showText={false} strokeWidth={6}></RimoElement></div></>
                  }}></RimoElement>
<RimoElement kind="el-table-column" label="據點狀態" width="100" slots={{
                    "default": ({
                      row
                    }) => <><RimoElement kind="el-switch" modelValue={row.isActive} onModelChange={value => {
                        model.assign(row, "isActive", value);
                      }} size="small" disabled={!view.canManageStationBase} style={rimoStyle("--el-switch-on-color: var(--app-color-primary);")}></RimoElement></>
                  }}></RimoElement>
<RimoElement kind="el-table-column" label="操作" width="150" align="right" fixed="right" slots={{
                    "default": ({
                      row
                    }) => <><div className="flex items-center justify-end gap-1">{view.canManageStationBase ? <><RimoElement kind="el-button" type="primary" link={true} onClick={_event => {
                            view.openStationDialog(row);
                          }}>{text("編輯")}</RimoElement></> : <><span className="text-xs text-gray-400">{text("只讀")}</span></>}
{view.canManageStationBase ? <><RimoElement kind="el-dropdown" trigger="click" onCommand={event => {
                            (cmd => view.handleStationRowCommand(cmd, row))?.(event);
                          }} slots={{
                            "dropdown": _slot => <><RimoElement kind="el-dropdown-menu"><RimoElement kind="el-dropdown-item" command="delete" className="text-red-500">{text("刪除")}</RimoElement></RimoElement></>
                          }}><RimoElement kind="el-button" link={true} type="info">{text("更多")}
<RimoElement kind="el-icon" className="ml-0.5"><RimoIcon name="ArrowDown" /></RimoElement></RimoElement></RimoElement></> : null}</div></>
                  }}></RimoElement></RimoElement>
<div className="stations-table-pagination"><RimoElement kind="el-pagination" currentPage={view.stationPage} onCurrentPageChange={value => {
                    model.write(["stationPage"], value);
                  }} pageSize={view.stationPageSize} onPageSizeChange={value => {
                    model.write(["stationPageSize"], value);
                  }} pageSizes={[10, 20, 50, 100]} total={view.visibleStations.length} layout="total, sizes, prev, pager, next, jumper" background={true} small={true}></RimoElement></div></></> : view.stationViewMode === 'capabilities' && view.canViewAnyService ? <><><RimoElement kind="el-table" data={view.pagedServiceCapabilities} rowKey="rowKey" style={rimoStyle("width: 100%")} data-rimo-shared-toolbar="true"><RimoElement kind="el-table-column" label="據點名稱" minWidth="210" slots={{
                    "default": ({
                      row
                    }) => <><div className="font-medium text-gray-900">{rimoText(row.station.name)}</div>
<div className="text-xs text-gray-400">{rimoText(view.getStoreName(row.station.parentId))}</div></>
                  }}></RimoElement>
<RimoElement kind="el-table-column" label="業務線" width="120" slots={{
                    "default": ({
                      row
                    }) => <>{rimoText(view.getBusinessLineName(row.service.bizType))}</>
                  }}></RimoElement>
<RimoElement kind="el-table-column" label="服務模式" width="150" slots={{
                    "default": ({
                      row
                    }) => <><RimoElement kind="el-tag" size="small" effect="plain" type={view.getServiceTagType(row.service.bizType)}>{text("\n                                                        ")}{rimoText(view.getServiceName(row.service.bizType))}{text("\n                                                    ")}</RimoElement></>
                  }}></RimoElement>
<RimoElement kind="el-table-column" label="關鍵配置" minWidth="220" slots={{
                    "default": ({
                      row
                    }) => <><div className="station-summary-line">{rimoText(view.getServiceKeyConfig(row))}{text("\n                                                    ")}</div></>
                  }}></RimoElement>
<RimoElement kind="el-table-column" label="能力狀態" width="120" slots={{
                    "default": ({
                      row
                    }) => <><RimoElement kind="el-switch" modelValue={row.service.status} onModelChange={value => {
                        model.assign(row.service, "status", value);
                      }} activeValue="ACTIVE" inactiveValue="SUSPENDED" activeText="啓用" inactiveText="暫停" inlinePrompt={true} size="small" disabled={!view.canManageService(row.service.bizType)} style={rimoStyle("--el-switch-on-color: var(--app-color-primary); --el-switch-off-color: #94a3b8;")}></RimoElement></>
                  }}></RimoElement>
<RimoElement kind="el-table-column" label="據點狀態" width="100" slots={{
                    "default": ({
                      row
                    }) => <><span className={rimoClass(row.station.isActive ? 'text-emerald-600' : 'text-gray-400')}>{text("\n                                                        ")}{rimoText(row.station.isActive ? '啓用中' : '已停用')}{text("\n                                                    ")}</span></>
                  }}></RimoElement>
<RimoElement kind="el-table-column" label="操作" width="150" align="right" fixed="right" slots={{
                    "default": ({
                      row
                    }) => <>{view.canManageService(row.service.bizType) ? <><RimoElement kind="el-button" type="primary" link={true} onClick={_event => {
                          view.openServiceCapabilityDialog(row);
                        }}>{text("配置")}</RimoElement></> : <><span className="text-xs text-gray-400">{text("只讀")}</span></>}</>
                  }}></RimoElement></RimoElement>
<div className="stations-table-pagination"><RimoElement kind="el-pagination" currentPage={view.capabilityPage} onCurrentPageChange={value => {
                    model.write(["capabilityPage"], value);
                  }} pageSize={view.capabilityPageSize} onPageSizeChange={value => {
                    model.write(["capabilityPageSize"], value);
                  }} pageSizes={[10, 20, 50, 100]} total={view.visibleServiceCapabilities.length} layout="total, sizes, prev, pager, next, jumper" background={true} small={true}></RimoElement></div></></> : <><RimoElement kind="el-empty" description="當前賬號沒有可查看的據點權限"></RimoElement></>}</RimoList></div></div></div><RimoElement kind="el-dialog" modelValue={view.dialogVisible} onModelChange={value => {
      model.write(["dialogVisible"], value);
    }} title={view.isEdit ? '編輯據點' : '新增據點'} width="1280px" top="3vh" destroyOnClose={true} appendToBody={true} className="stations-overlay" slots={{
      "footer": _slot => <><div className="flex items-center justify-between" data-rimo-layout="toolbar"><div className="text-sm"><span className="text-gray-500">{text("已佔用預留車位：")}</span>
<span className={rimoClass(view.totalReservedSpots > view.currentStation.totalCapacity ? 'text-red-500 font-bold' : 'text-green-600 font-bold')}>{text("\n                                ")}{rimoText(view.totalReservedSpots)}{text(" / ")}{rimoText(view.currentStation.totalCapacity)}{text("\n                            ")}</span>
{view.totalReservedSpots > view.currentStation.totalCapacity ? <><span className="text-red-500 ml-2 text-xs">{text("\n                                預留車位數已超過據點總車位數\n                            ")}</span></> : null}</div>
<div><RimoElement kind="el-button" onClick={_event => {
              model.write(["dialogVisible"], false);
            }}>{text("取消")}</RimoElement>
<RimoElement kind="el-button" type="primary" onClick={event => {
              view.saveStation?.(event);
            }}>{text("保存")}</RimoElement></div></div></>
    }}>{() => <><div className="flex gap-6" style={rimoStyle("height: 78vh;")}><div className="w-[56%] flex flex-col gap-4 overflow-y-auto pr-2 custom-scroll"><div><h3 className="font-bold text-gray-800 border-l-4 border-[color:var(--app-color-primary)] pl-3">{text("基礎資料")}</h3>
<p className="text-xs text-gray-500 mt-2">{text("用於配置據點檔案、座標、電子圍欄與現場聯絡資訊。")}</p></div>
<RimoElement kind="el-form" model={view.currentStation} labelPosition="top"><div className="grid grid-cols-1 gap-4 mb-4"><RimoElement kind="el-form-item" label="據點類型" className="!mb-0"><div className="flex items-center gap-3 w-full" data-rimo-layout="field-row"><RimoElement kind="el-select" modelValue={view.currentStation.stationType} onModelChange={value => {
                      model.write(["currentStation", "stationType"], value);
                    }} placeholder="請選擇據點類型" className="flex-1">{rimoEntries(view.stationTypeOptions).map(([option], _itemIndex) => <Fragment key={option.value}><RimoElement kind="el-option" key={option.value} label={option.label} value={option.value}><div className="flex items-center justify-between gap-3 w-full"><span>{rimoText(option.label)}</span>
<RimoElement kind="el-tag" size="small" type={view.getStationTypeEntryTagType(option)} effect="plain">{text("\n                                                        ")}{rimoText(view.getStationTypeEntryText(option))}{text("\n                                                    ")}</RimoElement></div></RimoElement></Fragment>)}</RimoElement>
<RimoElement kind="el-button" onClick={_event => {
                      model.write(["stationTypeManagerVisible"], true);
                    }}>{text("選擇項管理")}</RimoElement></div>
<div className="mt-1 text-xs text-gray-500">{text("據點類型由選擇項管理維護，可控制該類型是否開放一般預約。")}</div></RimoElement></div>
<div className="grid grid-cols-2 gap-4" data-rimo-grid="2" data-rimo-layout="form-grid"><RimoElement kind="el-form-item" label="所屬門市" required={true}><RimoElement kind="el-cascader" modelValue={view.currentStation.parentId} onModelChange={value => {
                    model.write(["currentStation", "parentId"], value);
                  }} options={view.stationParentOptions} props={view.stationParentProps} filterable={true} clearable={true} className="w-full" placeholder="請先選擇車行，再選擇門市"></RimoElement></RimoElement>
<RimoElement kind="el-form-item" label="據點名稱" required={true}><RimoElement kind="el-input" modelValue={view.currentStation.name} onModelChange={value => {
                    model.write(["currentStation", "name"], value);
                  }} placeholder="例如：金門水頭碼頭遊客服務站"></RimoElement></RimoElement></div>
<div className="grid grid-cols-2 gap-4" data-rimo-grid="2" data-rimo-layout="form-grid"><RimoElement kind="el-form-item" label="停車場類型"><RimoElement kind="el-select" modelValue={view.currentStation.parkingLotType} onModelChange={value => {
                    model.write(["currentStation", "parkingLotType"], value);
                  }} placeholder="請選擇停車場類型" className="w-full"><RimoElement kind="el-option" label="露天停車場" value="露天停車場"></RimoElement>
<RimoElement kind="el-option" label="室內停車場" value="室內停車場"></RimoElement>
<RimoElement kind="el-option" label="立體停車場" value="立體停車場"></RimoElement>
<RimoElement kind="el-option" label="路側停車區" value="路側停車區"></RimoElement></RimoElement></RimoElement>
<RimoElement kind="el-form-item" label="停車場公司"><RimoElement kind="el-input" modelValue={view.currentStation.parkingCompany} onModelChange={value => {
                    model.write(["currentStation", "parkingCompany"], value);
                  }} placeholder="請輸入停車場公司"></RimoElement></RimoElement></div>
<div className="grid grid-cols-2 gap-4" data-rimo-grid="2" data-rimo-layout="form-grid"><RimoElement kind="el-form-item" label="聯絡人"><RimoElement kind="el-input" modelValue={view.currentStation.contactName} onModelChange={value => {
                    model.write(["currentStation", "contactName"], value);
                  }} placeholder="請輸入聯絡人"></RimoElement></RimoElement>
<RimoElement kind="el-form-item" label="聯絡電話"><RimoElement kind="el-input" modelValue={view.currentStation.contactPhone} onModelChange={value => {
                    model.write(["currentStation", "contactPhone"], value);
                  }} placeholder="請輸入聯絡電話"></RimoElement></RimoElement></div>
<div className="grid grid-cols-2 gap-4" data-rimo-grid="2" data-rimo-layout="form-grid"><RimoElement kind="el-form-item" label="Email"><RimoElement kind="el-input" modelValue={view.currentStation.email} onModelChange={value => {
                    model.write(["currentStation", "email"], value);
                  }} placeholder="例如：station@rimo.com"></RimoElement></RimoElement>
<RimoElement kind="el-form-item" label="傳真"><RimoElement kind="el-input" modelValue={view.currentStation.fax} onModelChange={value => {
                    model.write(["currentStation", "fax"], value);
                  }} placeholder="請輸入傳真"></RimoElement></RimoElement></div>
<div className="grid grid-cols-2 gap-4" data-rimo-grid="2" data-rimo-layout="form-grid"><RimoElement kind="el-form-item" label="地址選擇"><RimoElement kind="el-cascader" modelValue={view.currentStation.addressRegion} onModelChange={value => {
                    model.write(["currentStation", "addressRegion"], value);
                  }} options={view.addressOptions} clearable={true} filterable={true} className="w-full" placeholder="請選擇行政區"></RimoElement>
<div className="mt-2 text-xs text-gray-400">{text("原型示意臺灣模式；實際按租戶地址模式渲染。")}</div></RimoElement>
<RimoElement kind="el-form-item" label="詳細地址"><RimoElement kind="el-input" modelValue={view.currentStation.addressDetail} onModelChange={value => {
                    model.write(["currentStation", "addressDetail"], value);
                  }} placeholder="請輸入街道、樓層或停車場位置說明"></RimoElement></RimoElement></div>
<div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_180px_120px] gap-4 items-end" data-rimo-layout="form-grid"><RimoElement kind="el-form-item" label="據點經度" required={true}><RimoElement kind="el-input" modelValue={view.currentStation.longitude} onModelChange={value => {
                    model.write(["currentStation", "longitude"], value);
                  }} placeholder="118.318000"></RimoElement></RimoElement>
<RimoElement kind="el-form-item" label="據點緯度" required={true}><RimoElement kind="el-input" modelValue={view.currentStation.latitude} onModelChange={value => {
                    model.write(["currentStation", "latitude"], value);
                  }} placeholder="24.432000"></RimoElement></RimoElement>
<RimoElement kind="el-form-item" label="主電子圍欄半徑 (m)" required={true}><RimoElement kind="el-input-number" modelValue={view.currentStation.fenceRadius} onModelChange={value => {
                    model.write(["currentStation", "fenceRadius"], value);
                  }} min={0} step={10} className="w-full"></RimoElement></RimoElement>
<RimoElement kind="el-form-item" label=" "><RimoElement kind="el-button" className="w-full" onClick={_event => {
                    view.openMapPicker('station');
                  }}>{text("選點")}</RimoElement></RimoElement></div></RimoElement>
<div className="rounded-xl border border-gray-200 overflow-hidden bg-white"><div className="px-4 py-3 border-b bg-gray-50 flex items-center justify-between"><div><div className="font-medium text-gray-800">{text("地圖座標同步")}</div>
<p className="text-xs text-gray-500 mt-1">{text("點擊地圖可寫入當前選中的定位對象，也可直接修改下方經緯度。")}</p></div>
<RimoElement kind="el-tag" type="primary" effect="plain">{rimoText(view.getCoordinateTargetLabel(view.activeCoordinateTarget))}</RimoElement></div>
<div className="p-4"><div className="grid grid-cols-3 gap-2 mb-3" data-rimo-grid="3"><RimoElement kind="el-button" size="small" type={view.activeCoordinateTarget === 'station' ? 'primary' : 'default'} onClick={_event => {
                    view.setActiveCoordinateTarget('station');
                  }}>{text("據點主座標")}</RimoElement>
{rimoEntries(view.currentStation.geofences).map(([fence, index], _itemIndex) => <Fragment key={fence.key}><RimoElement kind="el-button" key={fence.key} size="small" type={view.activeCoordinateTarget === 'geofence-' + index ? 'primary' : 'default'} onClick={_event => {
                      view.setActiveCoordinateTarget('geofence-' + index);
                    }}>{text("\n                                        圍欄 ")}{rimoText(index + 1)}{text("\n                                    ")}</RimoElement></Fragment>)}</div>
<div className="relative h-64 rounded-xl border border-slate-200 overflow-hidden cursor-crosshair" style={rimoStyle("background: linear-gradient(135deg, #eef6ff 0%, #f8fbff 40%, #eef7f2 100%);")} onClick={event => {
                  view.handleMapClick?.(event);
                }}><div className="absolute inset-0 opacity-60" style={rimoStyle("background-image: linear-gradient(rgba(148,163,184,.15) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,.15) 1px, transparent 1px); background-size: 36px 36px;")}></div>
<div className="absolute inset-0 p-4 flex flex-col justify-between pointer-events-none"><div className="text-xs text-slate-500">{text("地圖示意區，點擊即可定位 ")}{rimoText(view.getCoordinateTargetLabel(view.activeCoordinateTarget))}{text("\n                                        ")}</div>
<div className="self-end rounded-lg border border-white/80 bg-white/90 px-3 py-2 shadow-sm text-xs text-slate-600">{text("\n                                            當前座標：")}{rimoText(view.formatCoordinateDisplay(view.activeCoordinateTarget))}{text("\n                                        ")}</div></div>
{view.isValidCoordinate(view.currentStation.longitude, view.currentStation.latitude) ? <><div className="absolute -translate-x-1/2 -translate-y-1/2" style={rimoStyle(view.getMarkerStyle('station'))}><div className="h-4 w-4 rounded-full bg-[color:var(--app-color-primary)] border-2 border-white shadow-lg"></div></div></> : null}
{rimoEntries(view.currentStation.geofences).map(([fence, index], _itemIndex) => <Fragment key={'marker-' + fence.key}><>{fence && fence.enabled && view.isValidCoordinate(fence.longitude, fence.latitude) ? <><div className="absolute -translate-x-1/2 -translate-y-1/2" style={rimoStyle(view.getMarkerStyle('geofence-' + index))}><div className={rimoClass(["h-3.5 w-3.5 rounded-full border-2 border-white shadow-md", rimoClass(view.getFenceMarkerClass(index))])}></div></div></> : null}</></Fragment>)}</div>
<div className="grid grid-cols-2 gap-3 mt-3" data-rimo-grid="2"><div className="rounded-lg bg-gray-50 px-3 py-2 text-xs text-gray-500">{text("\n                                        主座標：")}{rimoText(view.formatCoordinateDisplay('station'))}{text("\n                                    ")}</div>
<div className="rounded-lg bg-gray-50 px-3 py-2 text-xs text-gray-500">{text("\n                                        主圍欄半徑：")}{rimoText(view.currentStation.fenceRadius || 0)}{text(" m\n                                    ")}</div></div></div></div>
<div className="flex items-start justify-between gap-4" data-rimo-layout="toolbar"><div><div className="font-bold text-gray-800 border-l-4 border-emerald-500 pl-3">{text("電子圍欄配置")}</div>
<p className="text-xs text-gray-500 mt-2">{text("默認保留第 1 組，可按需新增至 4 組電子圍欄。")}</p></div>
<RimoElement kind="el-button" disabled={view.currentStation.geofences.length >= 4} onClick={event => {
                view.addGeofence?.(event);
              }}>{text("新增圍欄")}</RimoElement></div>
<div className="space-y-3">{rimoEntries(view.currentStation.geofences).map(([fence, index], _itemIndex) => <Fragment key={fence.key}><div key={fence.key} className="rounded-xl border border-gray-200 bg-white p-3"><div className="flex items-center justify-between"><div className="flex items-center gap-2"><div className="font-medium text-gray-800">{text("圍欄 ")}{rimoText(index + 1)}</div>
{index > 0 ? <><RimoElement kind="el-icon" color="#dc2626" style={rimoStyle("cursor:pointer;")} size="16" onClick={_event => {
                          view.removeGeofence(index);
                        }}><RimoIcon name="Delete" /></RimoElement></> : null}</div>
<div className="flex items-center gap-3"><span className="text-xs text-gray-500">{rimoText(fence.enabled ? '已啓用' : '未啓用')}</span>
<RimoElement kind="el-switch" modelValue={fence.enabled} onModelChange={value => {
                        model.assign(fence, "enabled", value);
                      }}></RimoElement></div></div>
<div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_180px_120px] gap-3 mt-3 items-end" data-rimo-layout="form-grid"><RimoElement kind="el-form-item" label="經度" required={true} className="!mb-0"><RimoElement kind="el-input" modelValue={fence.longitude} onModelChange={value => {
                        model.assign(fence, "longitude", value);
                      }} placeholder="118.318000"></RimoElement></RimoElement>
<RimoElement kind="el-form-item" label="緯度" required={true} className="!mb-0"><RimoElement kind="el-input" modelValue={fence.latitude} onModelChange={value => {
                        model.assign(fence, "latitude", value);
                      }} placeholder="24.432000"></RimoElement></RimoElement>
<RimoElement kind="el-form-item" label="半徑 (m)" required={true} className="!mb-0"><RimoElement kind="el-input-number" modelValue={fence.radius} onModelChange={value => {
                        model.assign(fence, "radius", value);
                      }} min={0} step={10} className="w-full"></RimoElement></RimoElement>
<RimoElement kind="el-form-item" label=" " className="!mb-0"><RimoElement kind="el-button" className="w-full" onClick={_event => {
                        view.openMapPicker('geofence-' + index);
                      }}>{text("選點")}</RimoElement></RimoElement></div></div></Fragment>)}</div>
<RimoElement kind="el-form" model={view.currentStation} labelPosition="top"><div className="grid grid-cols-2 gap-4" data-rimo-grid="2" data-rimo-layout="form-grid"><RimoElement kind="el-form-item" label="租賃押金"><RimoElement kind="el-input-number" modelValue={view.currentStation.rentalDeposit} onModelChange={value => {
                    model.write(["currentStation", "rentalDeposit"], value);
                  }} min={0} step={100} className="w-full"></RimoElement></RimoElement>
<RimoElement kind="el-form-item" label="月租成本"><RimoElement kind="el-input-number" modelValue={view.currentStation.monthlyRentCost} onModelChange={value => {
                    model.write(["currentStation", "monthlyRentCost"], value);
                  }} min={0} step={100} className="w-full"></RimoElement></RimoElement>
<RimoElement kind="el-form-item" label="水電成本"><RimoElement kind="el-input-number" modelValue={view.currentStation.utilityCost} onModelChange={value => {
                    model.write(["currentStation", "utilityCost"], value);
                  }} min={0} step={100} className="w-full"></RimoElement></RimoElement>
<RimoElement kind="el-form-item" label="人事成本"><RimoElement kind="el-input-number" modelValue={view.currentStation.staffingCost} onModelChange={value => {
                    model.write(["currentStation", "staffingCost"], value);
                  }} min={0} step={100} className="w-full"></RimoElement></RimoElement></div>
<RimoElement kind="el-form-item" label="進出方式"><RimoElement kind="el-select" modelValue={view.currentStation.accessMethod} onModelChange={value => {
                  model.write(["currentStation", "accessMethod"], value);
                }} placeholder="請選擇進出方式" className="w-full"><RimoElement kind="el-option" label="車牌辨識" value="車牌辨識"></RimoElement>
<RimoElement kind="el-option" label="門禁卡" value="門禁卡"></RimoElement>
<RimoElement kind="el-option" label="遙控器" value="遙控器"></RimoElement>
<RimoElement kind="el-option" label="無門禁" value="無門禁"></RimoElement></RimoElement></RimoElement>
<div className="rounded-xl border border-gray-200 bg-white p-4"><div className="flex items-center justify-between"><div><div className="font-medium text-gray-800">{text("固定車位")}</div>
<div className="text-xs text-gray-500 mt-1">{text("開啓後可維護多個固定車位號，供現場長期佔用管理。")}</div></div>
<RimoElement kind="el-switch" modelValue={view.currentStation.isFixedParking} onModelChange={value => {
                    model.write(["currentStation", "isFixedParking"], value);
                  }}></RimoElement></div>
{view.currentStation.isFixedParking ? <><div className="mt-4"><RimoElement kind="el-input" modelValue={view.fixedParkingSlotsInput} onModelChange={value => {
                      model.write(["fixedParkingSlotsInput"], value);
                    }} type="textarea" rows={4} placeholder="請輸入多個車位號，支持換行或逗號分隔"></RimoElement>
<div className="flex flex-wrap gap-2 mt-3">{rimoEntries(view.getParsedParkingSlots()).map(([slot], _itemIndex) => <Fragment key={slot}><RimoElement kind="el-tag" key={slot} type="info" effect="plain">{text("\n                                            ")}{rimoText(slot)}{text("\n                                        ")}</RimoElement></Fragment>)}</div></div></> : null}</div>
<RimoElement kind="el-form-item" label="據點照片" className="mt-4"><RimoElement kind="el-upload" listType="picture-card" autoUpload={false} fileList={view.currentStation.photos} onChange={view.handleStationPhotoChange} onRemove={view.removeStationPhoto} multiple={true}><RimoElement kind="el-icon"><RimoIcon name="Plus" /></RimoElement></RimoElement>
<div className="text-xs text-gray-400 mt-2">{text("支持多張圖片上傳預覽，僅用於原型展示。")}</div></RimoElement>
<div className="grid grid-cols-2 gap-4" data-rimo-grid="2" data-rimo-layout="form-grid"><RimoElement kind="el-form-item" label="總車位數"><RimoElement kind="el-input-number" modelValue={view.currentStation.totalCapacity} onModelChange={value => {
                    model.write(["currentStation", "totalCapacity"], value);
                  }} min={0} className="w-full"></RimoElement></RimoElement>
<RimoElement kind="el-form-item" label="停車費規則"><RimoElement kind="el-input" modelValue={view.currentStation.parkingFeeRule} onModelChange={value => {
                    model.write(["currentStation", "parkingFeeRule"], value);
                  }} placeholder="例如：前 30 分鐘免費，之後每小時 20 元"></RimoElement></RimoElement></div>
<RimoElement kind="el-form-item" label="據點說明"><RimoElement kind="el-input" modelValue={view.currentStation.description} onModelChange={value => {
                  model.write(["currentStation", "description"], value);
                }} type="textarea" rows={3} placeholder="請輸入據點使用說明、遊客指引或現場注意事項"></RimoElement></RimoElement>
<RimoElement kind="el-form-item" label="備註"><RimoElement kind="el-input" modelValue={view.currentStation.remark} onModelChange={value => {
                  model.write(["currentStation", "remark"], value);
                }} type="textarea" rows={3} placeholder="請輸入據點備註"></RimoElement></RimoElement></RimoElement></div>
<div className="w-[44%] flex flex-col gap-4 border-l pl-6 overflow-y-auto custom-scroll"><div><h3 className="font-bold text-gray-800 border-l-4 border-orange-500 pl-3">{text("業務與營運配置")}</h3>
<p className="text-xs text-gray-500 mt-2">{text("按業務線設置據點能力、簽約對象、經營成本和現場說明。")}</p></div>
<div className={rimoClass(["rounded-xl border border-gray-100 bg-gray-50 p-4", rimoClass({
              'border-sky-200 bg-sky-50': view.getServiceGroupConfig('SHARING').enabled
            })])}><div className="flex items-start justify-between gap-4"><div><div className="font-semibold text-gray-800">{text("分時租賃")}</div>
<p className="text-xs text-gray-500 mt-1">{text("統一配置分時租賃的服務時間，再按需啓用同站租還與甲租乙還兩種模式。")}</p></div>
<div className="flex items-center gap-3 shrink-0"><span className="text-xs text-gray-500">{rimoText(view.getServiceGroupConfig('SHARING').enabled ? '已啓用' : '未啓用')}</span>
<RimoElement kind="el-switch" modelValue={view.getServiceGroupConfig('SHARING').enabled} onModelChange={value => {
                    model.assign(view.getServiceGroupConfig('SHARING'), "enabled", value);
                  }} onChange={_event => {
                    view.toggleServiceGroup('SHARING');
                  }}></RimoElement></div></div>
{view.getServiceGroupConfig('SHARING').enabled ? <><div className="space-y-3 mt-4"><div className="rounded-lg border border-white/80 bg-white/80 p-4"><div className="text-sm font-medium text-gray-800">{text("服務公共配置")}</div>
<div className="grid grid-cols-1 gap-3 mt-3"><RimoElement kind="el-form-item" label="服務時間" className="!mb-0"><RimoElement kind="el-time-picker" isRange={true} modelValue={view.getServiceGroupConfig('SHARING').serviceHours} onModelChange={value => {
                          model.assign(view.getServiceGroupConfig('SHARING'), "serviceHours", value);
                        }} className="w-full" rangeSeparator="至" startPlaceholder="開始時間" endPlaceholder="結束時間"></RimoElement></RimoElement></div></div>
<div className="rounded-lg border border-white/80 bg-white/80 p-4"><div className="text-sm font-medium text-gray-800">{text("子模式配置")}</div>
<div className="space-y-3 mt-3"><div className="rounded-lg border border-gray-200 bg-white px-3 py-3"><div><div className="min-w-0"><RimoElement kind="el-checkbox" modelValue={view.serviceChecks.SAME_STATION} onModelChange={value => {
                              model.write(["serviceChecks", "SAME_STATION"], value);
                            }} onChange={_event => {
                              view.toggleService('SAME_STATION');
                            }}><span className="font-medium text-gray-800">{text("同站租還")}</span></RimoElement></div>
{view.hasService('SAME_STATION') ? <><RimoElement kind="el-form-item" label="預留車位數" className="!mb-0 mt-3 pl-6 w-full"><RimoElement kind="el-input-number" modelValue={view.getServiceConfig('SAME_STATION').reservedSpots} onModelChange={value => {
                                model.assign(view.getServiceConfig('SAME_STATION'), "reservedSpots", value);
                              }} min={0} max={view.currentStation.totalCapacity} className="w-full"></RimoElement></RimoElement></> : null}
{view.hasService('SAME_STATION') ? <><RimoElement kind="el-form-item" label="服務狀態" className="!mb-0 mt-3 pl-6 w-full"><RimoElement kind="el-select" modelValue={view.getServiceConfig('SAME_STATION').status} onModelChange={value => {
                                model.assign(view.getServiceConfig('SAME_STATION'), "status", value);
                              }} className="w-full">{rimoEntries(view.serviceStatusOptions).map(([item], _itemIndex) => <Fragment key={item.value}><RimoElement kind="el-option" key={item.value} label={item.label} value={item.value}></RimoElement></Fragment>)}</RimoElement></RimoElement></> : null}</div></div>
<div className="rounded-lg border border-gray-200 bg-white px-3 py-3"><div><div className="min-w-0"><RimoElement kind="el-checkbox" modelValue={view.serviceChecks.DIFF_STATION} onModelChange={value => {
                              model.write(["serviceChecks", "DIFF_STATION"], value);
                            }} onChange={_event => {
                              view.toggleService('DIFF_STATION');
                            }}><span className="font-medium text-gray-800">{text("甲租乙還")}</span></RimoElement></div>
{view.hasService('DIFF_STATION') ? <><RimoElement kind="el-form-item" label="預留車位數" className="!mb-0 mt-3 pl-6 w-full"><RimoElement kind="el-input-number" modelValue={view.getServiceConfig('DIFF_STATION').reservedSpots} onModelChange={value => {
                                model.assign(view.getServiceConfig('DIFF_STATION'), "reservedSpots", value);
                              }} min={0} max={view.currentStation.totalCapacity} className="w-full"></RimoElement></RimoElement></> : null}
{view.hasService('DIFF_STATION') ? <><div className="mt-3 pl-6 space-y-3"><RimoElement kind="el-form-item" label="服務狀態" className="!mb-0 w-full"><RimoElement kind="el-select" modelValue={view.getServiceConfig('DIFF_STATION').status} onModelChange={value => {
                                  model.assign(view.getServiceConfig('DIFF_STATION'), "status", value);
                                }} className="w-full">{rimoEntries(view.serviceStatusOptions).map(([item], _itemIndex) => <Fragment key={item.value}><RimoElement kind="el-option" key={item.value} label={item.label} value={item.value}></RimoElement></Fragment>)}</RimoElement></RimoElement>
<p className="text-xs text-gray-500 mt-1">{text("甲租乙還默認支持取車與還車。")}</p></div></> : null}</div></div></div></div></div></> : null}</div>
<div className={rimoClass(["rounded-xl border border-gray-100 bg-gray-50 p-4", rimoClass({
              'border-orange-200 bg-orange-50': view.getServiceGroupConfig('STORE').enabled
            })])}><div className="flex items-start justify-between gap-4"><div><div className="font-semibold text-gray-800">{text("門市租賃")}</div>
<p className="text-xs text-gray-500 mt-1">{text("統一配置門市租賃的服務時間，再分別啓用門市租車與 24 小時自助兩種子模式。")}</p>
<p className="text-xs text-orange-600 mt-1">{text("門市租賃下，門市租車面向門市辦理，24 小時自助面向具體據點取還。")}</p></div>
<div className="flex items-center gap-3 shrink-0"><span className="text-xs text-gray-500">{rimoText(view.getServiceGroupConfig('STORE').enabled ? '已啓用' : '未啓用')}</span>
<RimoElement kind="el-switch" modelValue={view.getServiceGroupConfig('STORE').enabled} onModelChange={value => {
                    model.assign(view.getServiceGroupConfig('STORE'), "enabled", value);
                  }} onChange={_event => {
                    view.toggleServiceGroup('STORE');
                  }}></RimoElement></div></div>
{view.getServiceGroupConfig('STORE').enabled ? <><div className="space-y-3 mt-4"><div className="rounded-lg border border-white/80 bg-white/80 p-4"><div className="text-sm font-medium text-gray-800">{text("服務公共配置")}</div>
<div className="grid grid-cols-1 gap-3 mt-3"><RimoElement kind="el-form-item" label="服務時間" className="!mb-0"><RimoElement kind="el-time-picker" isRange={true} modelValue={view.getServiceGroupConfig('STORE').serviceHours} onModelChange={value => {
                          model.assign(view.getServiceGroupConfig('STORE'), "serviceHours", value);
                        }} className="w-full" rangeSeparator="至" startPlaceholder="開始時間" endPlaceholder="結束時間"></RimoElement></RimoElement></div></div>
<div className="rounded-lg border border-white/80 bg-white/80 p-4"><div className="text-sm font-medium text-gray-800">{text("子模式配置")}</div>
<div className="space-y-3 mt-3"><div className="rounded-lg border border-gray-200 bg-white px-3 py-3"><div><div className="min-w-0"><RimoElement kind="el-checkbox" modelValue={view.serviceChecks.STORE_RENTAL} onModelChange={value => {
                              model.write(["serviceChecks", "STORE_RENTAL"], value);
                            }} onChange={_event => {
                              view.toggleService('STORE_RENTAL');
                            }}><span className="font-medium text-gray-800">{text("門市租車")}</span></RimoElement></div>
{view.hasService('STORE_RENTAL') ? <><div className="mt-3 pl-6 space-y-3"><RimoElement kind="el-form-item" label="服務狀態" className="!mb-0 w-full"><RimoElement kind="el-select" modelValue={view.getServiceConfig('STORE_RENTAL').status} onModelChange={value => {
                                  model.assign(view.getServiceConfig('STORE_RENTAL'), "status", value);
                                }} className="w-full">{rimoEntries(view.serviceStatusOptions).map(([item], _itemIndex) => <Fragment key={item.value}><RimoElement kind="el-option" key={item.value} label={item.label} value={item.value}></RimoElement></Fragment>)}</RimoElement></RimoElement></div></> : null}</div></div>
<div className="rounded-lg border border-gray-200 bg-white px-3 py-3"><div><div className="min-w-0"><RimoElement kind="el-checkbox" modelValue={view.serviceChecks.STORE_SELF_SERVICE} onModelChange={value => {
                              model.write(["serviceChecks", "STORE_SELF_SERVICE"], value);
                            }} onChange={_event => {
                              view.toggleService('STORE_SELF_SERVICE');
                            }}><span className="font-medium text-gray-800">{text("24小時自助")}</span></RimoElement></div>
{view.hasService('STORE_SELF_SERVICE') ? <><div className="mt-3 pl-6 space-y-3"><RimoElement kind="el-form-item" label="服務狀態" className="!mb-0 w-full"><RimoElement kind="el-select" modelValue={view.getServiceConfig('STORE_SELF_SERVICE').status} onModelChange={value => {
                                  model.assign(view.getServiceConfig('STORE_SELF_SERVICE'), "status", value);
                                }} className="w-full">{rimoEntries(view.serviceStatusOptions).map(([item], _itemIndex) => <Fragment key={item.value}><RimoElement kind="el-option" key={item.value} label={item.label} value={item.value}></RimoElement></Fragment>)}</RimoElement></RimoElement>
<div className="rounded-lg border border-gray-200 bg-white px-3 py-2 flex items-center justify-between"><span className="text-sm text-gray-700">{text("夜間還車是否允許")}</span>
<RimoElement kind="el-switch" modelValue={view.getServiceConfig('STORE_SELF_SERVICE').config.allowNightReturn} onModelChange={value => {
                                  model.assign(view.getServiceConfig('STORE_SELF_SERVICE').config, "allowNightReturn", value);
                                }}></RimoElement></div>
<RimoElement kind="el-form-item" label="自助取還方式" className="!mb-0 w-full"><RimoElement kind="el-select" modelValue={view.getServiceConfig('STORE_SELF_SERVICE').config.pickupMethod} onModelChange={value => {
                                  model.assign(view.getServiceConfig('STORE_SELF_SERVICE').config, "pickupMethod", value);
                                }} placeholder="請選擇自助取還方式" className="w-full">{rimoEntries(view.selfServicePickupMethodOptions).map(([item], _itemIndex) => <Fragment key={item.value}><RimoElement kind="el-option" key={item.value} label={item.label} value={item.value}></RimoElement></Fragment>)}</RimoElement></RimoElement></div></> : null}</div></div></div></div></div></> : null}</div>
<div className={rimoClass(["rounded-xl border border-gray-100 bg-gray-50 p-4", rimoClass({
              'border-violet-200 bg-violet-50': view.getServiceGroupConfig('GOV').enabled
            })])}><div className="flex items-start justify-between gap-4"><div><div className="font-semibold text-gray-800">{text("公務用車")}</div>
<p className="text-xs text-gray-500 mt-1">{text("面向簽約企業客戶的專屬服務，可配置服務時間並綁定對應企業客戶。")}</p></div>
<div className="flex items-center gap-3 shrink-0"><span className="text-xs text-gray-500">{rimoText(view.getServiceGroupConfig('GOV').enabled ? '已啓用' : '未啓用')}</span>
<RimoElement kind="el-switch" modelValue={view.getServiceGroupConfig('GOV').enabled} onModelChange={value => {
                    model.assign(view.getServiceGroupConfig('GOV'), "enabled", value);
                  }} onChange={_event => {
                    view.toggleServiceGroup('GOV');
                  }}></RimoElement></div></div>
{view.getServiceGroupConfig('GOV').enabled ? <><div className="space-y-3 mt-4"><div className="rounded-lg border border-white/80 bg-white/80 p-4"><div className="text-sm font-medium text-gray-800">{text("服務公共配置")}</div>
<div className="grid grid-cols-1 gap-3 mt-3"><RimoElement kind="el-form-item" label="服務時間" className="!mb-0"><RimoElement kind="el-time-picker" isRange={true} modelValue={view.getServiceGroupConfig('GOV').serviceHours} onModelChange={value => {
                          model.assign(view.getServiceGroupConfig('GOV'), "serviceHours", value);
                        }} className="w-full" rangeSeparator="至" startPlaceholder="開始時間" endPlaceholder="結束時間"></RimoElement></RimoElement></div></div>
<div className="rounded-lg border border-white/80 bg-white/80 p-4"><div className="text-sm font-medium text-gray-800">{text("業務專屬配置")}</div>
<RimoElement kind="el-form-item" label="服務狀態" className="!mb-0 mt-3"><RimoElement kind="el-select" modelValue={view.getServiceConfig('GOV').status} onModelChange={value => {
                        model.assign(view.getServiceConfig('GOV'), "status", value);
                      }} className="w-full">{rimoEntries(view.serviceStatusOptions).map(([item], _itemIndex) => <Fragment key={item.value}><RimoElement kind="el-option" key={item.value} label={item.label} value={item.value}></RimoElement></Fragment>)}</RimoElement></RimoElement>
<RimoElement kind="el-form-item" label="簽約企業客戶" className="!mb-0 mt-3"><RimoElement kind="el-select" modelValue={view.govCorporateIds} onModelChange={value => {
                        model.write(["govCorporateIds"], value);
                      }} multiple={true} collapseTags={true} collapseTagsTooltip={true} placeholder="請選擇簽約企業客戶" className="w-full">{rimoEntries(view.corporateOptions).map(([item], _itemIndex) => <Fragment key={item.value}><RimoElement kind="el-option" key={item.value} label={item.label} value={item.value}></RimoElement></Fragment>)}</RimoElement></RimoElement></div></div></> : null}</div></div></div></>}</RimoElement>
<RimoElement kind="el-dialog" modelValue={view.stationTypeManagerVisible} onModelChange={value => {
      model.write(["stationTypeManagerVisible"], value);
    }} title="據點類型管理" width="760px" appendToBody={true} destroyOnClose={true} className="stations-overlay" slots={{
      "footer": _slot => <><RimoElement kind="el-button" onClick={_event => {
          model.write(["stationTypeManagerVisible"], false);
        }}>{text("關閉")}</RimoElement></>
    }}>{() => <><div className="mb-4 flex gap-2"><RimoElement kind="el-input" modelValue={view.newStationTypeInput} onModelChange={value => {
            model.write(["newStationTypeInput"], value);
          }} placeholder="請輸入新的據點類型名稱" onKeyUp={event => {
            if (event.key !== 'Enter') return;
            view.addStationTypeOption?.(event);
          }}></RimoElement>
<RimoElement kind="el-button" type="primary" onClick={event => {
            view.addStationTypeOption?.(event);
          }}><RimoElement kind="el-icon" className="mr-1"><RimoIcon name="Plus" /></RimoElement>
{text("新增\n                    ")}</RimoElement></div>
<RimoElement kind="el-table" data={view.stationTypeOptions} border={true} style={rimoStyle("width: 100%")} maxHeight="360"><RimoElement kind="el-table-column" label="序號" width="60" align="center" type="index"></RimoElement>
<RimoElement kind="el-table-column" label="據點類型名稱" minWidth="200" slots={{
            "default": ({
              row
            }) => <><RimoElement kind="el-input" modelValue={row.label} onModelChange={value => {
                model.assign(row, "label", value);
              }} size="small" onInput={_event => {
                model.assign(row, "value", row.label);
              }}></RimoElement></>
          }}></RimoElement>
<RimoElement kind="el-table-column" label="一般預約開放" width="150" align="center" slots={{
            "default": ({
              row
            }) => <><RimoElement kind="el-switch" modelValue={row.normalEntryVisible} onModelChange={value => {
                model.assign(row, "normalEntryVisible", value);
              }}></RimoElement>
<div className={rimoClass(["mt-1 text-xs", rimoClass(row.normalEntryVisible === false ? 'text-amber-600' : 'text-emerald-600')])}>{text("\n                                ")}{rimoText(view.getStationTypeEntryText(row))}{text("\n                            ")}</div></>
          }}></RimoElement>
<RimoElement kind="el-table-column" label="操作" width="80" align="center" slots={{
            "default": ({
              $index
            }) => <><RimoElement kind="el-button" type="danger" link={true} size="small" onClick={_event => {
                view.removeStationTypeOption($index);
              }}>{text("刪除")}</RimoElement></>
          }}></RimoElement></RimoElement>
<div className="mt-3 text-xs text-gray-400">{text("關閉後，該類型據點不會出現在一般同站租還 / 甲租乙還預約入口；仍可被租車券批次等指定業務選擇。")}</div></>}</RimoElement>
<RimoElement kind="el-dialog" modelValue={view.hierarchyDialogVisible} onModelChange={value => {
      model.write(["hierarchyDialogVisible"], value);
    }} title="管理組織架構" width="1280px" top="3vh" destroyOnClose={true} appendToBody={true} className="stations-overlay" slots={{
      "footer": _slot => <><RimoElement kind="el-button" onClick={_event => {
          model.write(["hierarchyDialogVisible"], false);
        }}>{text("關閉")}</RimoElement></>
    }}>{() => <><div className="flex items-center justify-between mb-3 text-sm text-gray-600"><span>{text("共 ")}
<b className="text-gray-800">{rimoText(view.orgData.length)}</b>
{text(" 個車行 · ")}
<b className="text-gray-800">{rimoText(view.orgData.reduce((s, c) => s + (c.children ? c.children.length : 0), 0))}</b>
{text(" 個門店")}</span>
{view.hierarchyCurrentCompany ? <><span className="text-gray-500">{text("當前車行：")}{rimoText(view.hierarchyCurrentCompany.label)}{text("（")}{rimoText(view.hierarchyCurrentCompany.children?.length || 0)}{text(" 個門店）")}</span></> : null}</div>
<div className="flex border rounded border-gray-200" style={rimoStyle("height: 78vh;")}><div className="w-1/2 border-r border-gray-200 flex flex-col"><div className="p-3 bg-gray-50 font-bold text-gray-700 flex justify-between items-center border-b" data-rimo-layout="toolbar"><span>{text("車行列表 (Company) · ")}{rimoText(view.orgData.length)}</span>
<RimoElement kind="el-button" type="primary" size="small" link={true} onClick={event => {
                view.addCompany?.(event);
              }}><RimoElement kind="el-icon" className="mr-1"><RimoIcon name="Plus" /></RimoElement>
{text("新增\n                            ")}</RimoElement></div>
<div className="flex-1 overflow-y-auto p-2">{rimoEntries(view.orgData).map(([comp], _itemIndex) => <Fragment key={comp.id}><div key={comp.id} className={rimoClass(["flex justify-between items-start p-3 hover:bg-gray-50 cursor-pointer rounded border border-transparent", rimoClass({
                  'bg-blue-50': view.hierarchyCurrentCompany?.id === comp.id
                })])} onClick={_event => {
                  model.write(["hierarchyCurrentCompany"], comp);
                }} data-rimo-layout="toolbar"><div className="flex-1 min-w-0 pr-3"><div className="flex items-center text-sm font-medium text-gray-800"><RimoElement kind="el-icon" className="mr-2 text-gray-500"><RimoIcon name="OfficeBuilding" /></RimoElement>
<span className="truncate">{rimoText(comp.label)}</span>
{comp.providerType ? <><RimoElement kind="el-tag" size="small" type="info" effect="plain" className="ml-2">{text("\n                                            ")}{rimoText(comp.providerType)}{text("\n                                        ")}</RimoElement></> : null}</div>
<div className="mt-2 text-xs text-gray-500 space-y-1"><div>{text("聯絡人：")}{rimoText(comp.contactName || '未填寫')}</div>
<div>{text("聯絡電話：")}{rimoText(comp.contactPhone || '未填寫')}</div>
<div>{text("統一編號：")}{rimoText(comp.taxId || '未填寫')}</div></div></div>
<div className="flex gap-2 shrink-0"><RimoElement kind="el-button" link={true} type="primary" size="small" onClick={event => {
                      event.stopPropagation();
                      view.openCompanyDialog(comp);
                    }}>{text("編輯")}</RimoElement>
<RimoElement kind="el-button" link={true} type="danger" size="small" onClick={event => {
                      event.stopPropagation();
                      view.deleteCompany(comp);
                    }}>{text("刪除")}</RimoElement></div></div></Fragment>)}</div></div>
<div className="w-1/2 flex flex-col bg-gray-50"><div className="p-3 bg-gray-100 font-bold text-gray-700 flex justify-between items-center border-b" data-rimo-layout="toolbar"><span>{text("門店列表 (Store) · ")}{rimoText(view.hierarchyCurrentCompany?.children?.length || 0)}</span>
<RimoElement kind="el-button" type="primary" size="small" link={true} onClick={event => {
                view.addStore?.(event);
              }} disabled={!view.hierarchyCurrentCompany}><RimoElement kind="el-icon" className="mr-1"><RimoIcon name="Plus" /></RimoElement>
{text("新增\n                            ")}</RimoElement></div>
{view.hierarchyCurrentCompany ? <><div className="flex-1 overflow-y-auto p-2">{rimoEntries(view.hierarchyCurrentCompany.children).map(([store], _itemIndex) => <Fragment key={store.id}><div key={store.id} className="flex justify-between items-start p-3 hover:bg-white cursor-pointer rounded mb-1 bg-white border border-gray-100" data-rimo-layout="toolbar"><div className="flex-1 min-w-0 pr-3"><div className="flex items-center text-sm font-medium text-gray-800"><RimoElement kind="el-icon" className="mr-2 text-gray-500"><RimoIcon name="Shop" /></RimoElement>
<span className="truncate">{rimoText(store.label)}</span></div>
<div className="mt-2 text-xs text-gray-500 space-y-1"><div>{text("聯絡人：")}{rimoText(store.contactName || '未填寫')}</div>
<div>{text("聯絡電話：")}{rimoText(store.contactPhone || '未填寫')}</div>
<div>{text("Email：")}{rimoText(store.email || '未填寫')}</div></div></div>
<div className="flex gap-2 shrink-0"><RimoElement kind="el-button" link={true} type="primary" size="small" onClick={event => {
                        event.stopPropagation();
                        view.openStoreDialog(store);
                      }}>{text("編輯")}</RimoElement>
<RimoElement kind="el-button" link={true} type="danger" size="small" onClick={event => {
                        event.stopPropagation();
                        view.deleteStore(store);
                      }}>{text("刪除")}</RimoElement></div></div></Fragment>)}
{!view.hierarchyCurrentCompany.children || view.hierarchyCurrentCompany.children.length === 0 ? <><div className="text-center text-gray-400 mt-10 text-xs">{text("\n                                暫無門店，請新增\n                            ")}</div></> : null}</div></> : <><div className="flex-1 flex items-center justify-center text-gray-400 text-sm"><p>{text("請先選擇左側車行")}</p></div></>}</div></div></>}</RimoElement>
<RimoElement kind="el-dialog" modelValue={view.companyDialogVisible} onModelChange={value => {
      model.write(["companyDialogVisible"], value);
    }} title={view.isCompanyEdit ? '編輯車行' : '新增車行'} width="620px" destroyOnClose={true} className="stations-overlay" slots={{
      "footer": _slot => <><RimoElement kind="el-button" onClick={_event => {
          model.write(["companyDialogVisible"], false);
        }}>{text("取消")}</RimoElement>
<RimoElement kind="el-button" type="primary" onClick={event => {
          view.saveCompany?.(event);
        }}>{text("保存")}</RimoElement></>
    }}>{() => <><RimoElement kind="el-form" model={view.companyForm} labelPosition="top"><div className="grid grid-cols-2 gap-4" data-rimo-grid="2" data-rimo-layout="form-grid"><RimoElement kind="el-form-item" label="車行名稱" required={true}><RimoElement kind="el-input" modelValue={view.companyForm.label} onModelChange={value => {
                model.write(["companyForm", "label"], value);
              }} placeholder="請輸入車行名稱"></RimoElement></RimoElement>
<RimoElement kind="el-form-item" label="類型"><RimoElement kind="el-select" modelValue={view.companyForm.providerType} onModelChange={value => {
                model.write(["companyForm", "providerType"], value);
              }} placeholder="請選擇類型" className="w-full"><RimoElement kind="el-option" label="直營" value="直營"></RimoElement>
<RimoElement kind="el-option" label="加盟" value="加盟"></RimoElement>
<RimoElement kind="el-option" label="車廠" value="車廠"></RimoElement>
<RimoElement kind="el-option" label="旅館" value="旅館"></RimoElement></RimoElement></RimoElement></div>
<div className="grid grid-cols-2 gap-4" data-rimo-grid="2" data-rimo-layout="form-grid"><RimoElement kind="el-form-item" label="聯絡人"><RimoElement kind="el-input" modelValue={view.companyForm.contactName} onModelChange={value => {
                model.write(["companyForm", "contactName"], value);
              }} placeholder="請輸入聯絡人"></RimoElement></RimoElement>
<RimoElement kind="el-form-item" label="聯絡電話"><RimoElement kind="el-input" modelValue={view.companyForm.contactPhone} onModelChange={value => {
                model.write(["companyForm", "contactPhone"], value);
              }} placeholder="請輸入聯絡電話"></RimoElement></RimoElement></div>
<RimoElement kind="el-form-item" label="統一編號"><RimoElement kind="el-input" modelValue={view.companyForm.taxId} onModelChange={value => {
              model.write(["companyForm", "taxId"], value);
            }} placeholder="請輸入統一編號"></RimoElement></RimoElement>
<RimoElement kind="el-form-item" label="備註"><RimoElement kind="el-input" modelValue={view.companyForm.remark} onModelChange={value => {
              model.write(["companyForm", "remark"], value);
            }} type="textarea" rows={3} placeholder="請輸入備註"></RimoElement></RimoElement></RimoElement></>}</RimoElement>
<RimoElement kind="el-dialog" modelValue={view.storeDialogVisible} onModelChange={value => {
      model.write(["storeDialogVisible"], value);
    }} title={view.isStoreEdit ? '編輯門市' : '新增門市'} width="680px" destroyOnClose={true} className="stations-overlay" slots={{
      "footer": _slot => <><RimoElement kind="el-button" onClick={_event => {
          model.write(["storeDialogVisible"], false);
        }}>{text("取消")}</RimoElement>
<RimoElement kind="el-button" type="primary" onClick={event => {
          view.saveStore?.(event);
        }}>{text("保存")}</RimoElement></>
    }}>{() => <><RimoElement kind="el-form" model={view.storeForm} labelPosition="top"><RimoElement kind="el-form-item" label="門市名稱" required={true}><RimoElement kind="el-input" modelValue={view.storeForm.label} onModelChange={value => {
              model.write(["storeForm", "label"], value);
            }} placeholder="請輸入門市名稱"></RimoElement></RimoElement>
<div className="grid grid-cols-2 gap-4" data-rimo-grid="2" data-rimo-layout="form-grid"><RimoElement kind="el-form-item" label="聯絡人"><RimoElement kind="el-input" modelValue={view.storeForm.contactName} onModelChange={value => {
                model.write(["storeForm", "contactName"], value);
              }} placeholder="請輸入聯絡人"></RimoElement></RimoElement>
<RimoElement kind="el-form-item" label="聯絡電話"><RimoElement kind="el-input" modelValue={view.storeForm.contactPhone} onModelChange={value => {
                model.write(["storeForm", "contactPhone"], value);
              }} placeholder="請輸入聯絡電話"></RimoElement></RimoElement></div>
<div className="grid grid-cols-2 gap-4" data-rimo-grid="2" data-rimo-layout="form-grid"><RimoElement kind="el-form-item" label="Email"><RimoElement kind="el-input" modelValue={view.storeForm.email} onModelChange={value => {
                model.write(["storeForm", "email"], value);
              }} placeholder="請輸入 Email"></RimoElement></RimoElement>
<RimoElement kind="el-form-item" label="地址選擇"><RimoElement kind="el-cascader" modelValue={view.storeForm.addressRegion} onModelChange={value => {
                model.write(["storeForm", "addressRegion"], value);
              }} options={view.addressOptions} props={{
                checkStrictly: false
              }} clearable={true} className="w-full" placeholder="請選擇區域"></RimoElement>
<div className="mt-2 text-xs text-gray-400">{text("原型示意臺灣模式；實際按租戶地址模式渲染。")}</div></RimoElement></div>
<RimoElement kind="el-form-item" label="詳細地址"><RimoElement kind="el-input" modelValue={view.storeForm.addressDetail} onModelChange={value => {
              model.write(["storeForm", "addressDetail"], value);
            }} placeholder="請輸入詳細地址"></RimoElement></RimoElement>
<RimoElement kind="el-form-item" label="備註"><RimoElement kind="el-input" modelValue={view.storeForm.remark} onModelChange={value => {
              model.write(["storeForm", "remark"], value);
            }} type="textarea" rows={3} placeholder="請輸入備註"></RimoElement></RimoElement></RimoElement></>}</RimoElement>
{null}
{null}
<RimoElement kind="el-dialog" modelValue={view.stationImportDialogVisible} onModelChange={value => {
      model.write(["stationImportDialogVisible"], value);
    }} title="導入據點數據" width="480px" destroyOnClose={true} className="stations-overlay" slots={{
      "footer": _slot => <><RimoElement kind="el-button" onClick={_event => {
          model.write(["stationImportDialogVisible"], false);
        }}>{text("取消")}</RimoElement>
<RimoElement kind="el-button" type="primary" onClick={event => {
          view.handleStationImport?.(event);
        }}>{text("開始導入")}</RimoElement></>
    }}>{() => <><div className="mb-4 text-gray-600 text-sm"><p className="mb-2">{text("1. 請先下載導入模板，按標準模板格式填寫數據。")}</p>
<RimoElement kind="el-button" type="primary" plain={true} size="small" onClick={event => {
            view.downloadStationTemplate?.(event);
          }}><RimoElement kind="el-icon" className="mr-1"><RimoIcon name="Download" /></RimoElement>
{text(" 下載規範表模板\n                    ")}</RimoElement></div>
<div className="border-t border-gray-100 pt-4 mt-4"><p className="mb-2 text-gray-600 text-sm">{text("2. 上傳填寫好的數據表格（支持 .xls, .xlsx 格式，單次最大支持 1000 條）。")}</p>
<RimoElement kind="el-upload" className="upload-demo" drag={true} action="#" autoUpload={false} fileList={view.stationImportFile ? [view.stationImportFile] : []} onChange={view.handleStationFileChange} accept=".xls,.xlsx"><RimoElement kind="el-icon" className="el-icon--upload"><RimoIcon name="UploadFilled" /></RimoElement>
<div className="el-upload__text">{text("\n                            將文件拖拽至此處，或 ")}
<em>{text("點擊上傳")}</em></div></RimoElement></div></>}</RimoElement>
<RimoElement kind="el-dialog" modelValue={view.mapPickerVisible} onModelChange={value => {
      model.write(["mapPickerVisible"], value);
    }} title="地圖選點" width="860px" appendToBody={true} destroyOnClose={true} className="stations-overlay" slots={{
      "footer": _slot => <><RimoElement kind="el-button" onClick={_event => {
          model.write(["mapPickerVisible"], false);
        }}>{text("取消")}</RimoElement>
<RimoElement kind="el-button" type="primary" onClick={_event => {
          model.write(["mapPickerVisible"], false);
        }}>{text("確認選點")}</RimoElement></>
    }}>{() => <><div className="relative h-[460px] rounded-xl border border-slate-200 overflow-hidden cursor-crosshair" style={rimoStyle("background: linear-gradient(135deg, #eef6ff 0%, #f8fbff 40%, #eef7f2 100%);")} onClick={event => {
          view.handleMapClick?.(event);
        }}><div className="absolute inset-0 opacity-60" style={rimoStyle("background-image: linear-gradient(rgba(148,163,184,.15) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,.15) 1px, transparent 1px); background-size: 36px 36px;")}></div>
<div className="absolute inset-0 p-4 flex flex-col justify-between pointer-events-none"><div className="text-xs text-slate-500">{text("點擊地圖選擇 ")}{rimoText(view.getCoordinateTargetLabel(view.mapPickerTarget))}{text(" 座標\n                        ")}</div>
<div className="self-end rounded-lg border border-white/80 bg-white/90 px-3 py-2 shadow-sm text-xs text-slate-600">{text("\n                            當前座標：")}{rimoText(view.formatCoordinateDisplay(view.mapPickerTarget))}{text("\n                        ")}</div></div>
<div className="absolute -translate-x-1/2 -translate-y-1/2" style={rimoStyle(view.getMarkerStyle(view.mapPickerTarget))}><div className="h-4 w-4 rounded-full bg-[color:var(--app-color-primary)] border-2 border-white shadow-lg"></div></div></div></>}</RimoElement>
<RimoElement kind="el-dialog" modelValue={view.serviceCapabilityDialogVisible} onModelChange={value => {
      model.write(["serviceCapabilityDialogVisible"], value);
    }} title="服務能力配置" width="560px" appendToBody={true} destroyOnClose={true} className="stations-overlay" slots={{
      "footer": _slot => <><RimoElement kind="el-button" onClick={_event => {
          model.write(["serviceCapabilityDialogVisible"], false);
        }}>{text("取消")}</RimoElement>
<RimoElement kind="el-button" type="primary" onClick={event => {
          view.saveServiceCapability?.(event);
        }}>{text("保存")}</RimoElement></>
    }}>{() => <>{view.activeCapabilityRow ? <><><RimoElement kind="el-descriptions" column={2} border={true} className="mb-5"><RimoElement kind="el-descriptions-item" label="據點">{rimoText(view.activeCapabilityRow.station.name)}</RimoElement>
<RimoElement kind="el-descriptions-item" label="所屬門市">{rimoText(view.getStoreName(view.activeCapabilityRow.station.parentId))}</RimoElement>
<RimoElement kind="el-descriptions-item" label="業務線">{rimoText(view.getBusinessLineName(view.activeCapabilityRow.service.bizType))}</RimoElement>
<RimoElement kind="el-descriptions-item" label="服務模式">{rimoText(view.getServiceName(view.activeCapabilityRow.service.bizType))}</RimoElement></RimoElement>
<RimoElement kind="el-form" model={view.serviceCapabilityForm} labelWidth="110px"><RimoElement kind="el-form-item" label="服務狀態"><RimoElement kind="el-radio-group" modelValue={view.serviceCapabilityForm.status} onModelChange={value => {
                  model.write(["serviceCapabilityForm", "status"], value);
                }}><RimoElement kind="el-radio" label="ACTIVE">{text("啓用")}</RimoElement>
<RimoElement kind="el-radio" label="SUSPENDED">{text("暫停")}</RimoElement></RimoElement></RimoElement>
{['SAME_STATION', 'DIFF_STATION'].includes(view.activeCapabilityRow.service.bizType) ? <><RimoElement kind="el-form-item" label="預留車位數"><RimoElement kind="el-input-number" modelValue={view.serviceCapabilityForm.reservedSpots} onModelChange={value => {
                    model.write(["serviceCapabilityForm", "reservedSpots"], value);
                  }} min={0} max={view.activeCapabilityRow.station.totalCapacity} controlsPosition="right"></RimoElement>
<span className="ml-2 text-xs text-gray-400">{text("據點總車位 ")}{rimoText(view.activeCapabilityRow.station.totalCapacity)}</span></RimoElement></> : null}
{view.activeCapabilityRow.service.bizType === 'STORE_SELF_SERVICE' ? <><><RimoElement kind="el-form-item" label="自助取車方式"><RimoElement kind="el-select" modelValue={view.serviceCapabilityForm.config.pickupMethod} onModelChange={value => {
                      model.write(["serviceCapabilityForm", "config", "pickupMethod"], value);
                    }} className="w-full">{rimoEntries(view.selfServicePickupMethodOptions).map(([item], _itemIndex) => <Fragment key={item.value}><RimoElement kind="el-option" key={item.value} label={item.label} value={item.value}></RimoElement></Fragment>)}</RimoElement></RimoElement>
<RimoElement kind="el-form-item" label="夜間還車"><RimoElement kind="el-switch" modelValue={view.serviceCapabilityForm.config.allowNightReturn} onModelChange={value => {
                      model.write(["serviceCapabilityForm", "config", "allowNightReturn"], value);
                    }} activeText="允許" inactiveText="不允許"></RimoElement></RimoElement></></> : null}
{view.activeCapabilityRow.service.bizType === 'GOV' ? <><RimoElement kind="el-form-item" label="簽約企業客戶"><RimoElement kind="el-select" modelValue={view.serviceCapabilityForm.config.corporateIds} onModelChange={value => {
                    model.write(["serviceCapabilityForm", "config", "corporateIds"], value);
                  }} multiple={true} collapseTags={true} collapseTagsTooltip={true} className="w-full" placeholder="選擇企業客戶">{rimoEntries(view.corporateOptions).map(([item], _itemIndex) => <Fragment key={item.value}><RimoElement kind="el-option" key={item.value} label={item.label} value={item.value}></RimoElement></Fragment>)}</RimoElement></RimoElement></> : null}
<RimoElement kind="el-alert" type="info" closable={false} showIcon={true} slots={{
                "title": _slot => <>{text("本窗口只修改當前服務模式，不影響據點基礎資料和其他服務能力。")}</>
              }}></RimoElement></RimoElement></></> : null}</>}</RimoElement></RimoRoot>;
}