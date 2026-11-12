import { Fragment } from 'react';
import { useRimoModel, rimoEntries } from '../../lib/rimo-model.js';
import { RimoRoot, RimoIcon, rimoIcons, useRimoEnvironment } from '../../lib/RimoEnvironment.jsx';
import { RimoElement, rimoClass, rimoStyle, rimoText } from '../../lib/RimoElements.jsx';
import './order-detail.css';
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
    const {
      cell: ref,
      record: reactive,
      derived: computed
    } = model;
    const {
      ElMessage: _ElMessage,
      ElMessageBox: _ElMessageBox
    } = feedback;
    const formatNumber = num => {
      return Math.abs(num).toLocaleString();
    };
    const getFuelColor = fuel => {
      const val = parseInt(fuel);
      if (val > 50) return '#10b981';
      if (val > 20) return '#f59e0b';
      return '#ef4444';
    };
    const initialUrlParams = new URLSearchParams(window.location.search);
    const activeOrderId = initialUrlParams.get('id') || 'ZT24050500001';
    const mockOrderDetails = {
      ZT2405060002: {
        orderId: 'ZT2405060002',
        createTime: '2024-05-05 14:30',
        source: '門市櫃檯',
        serviceMode: 'store_staffed',
        status: 'reserved',
        clientType: 'corporate',
        billingMode: 'customer_pay',
        paymentStatus: 'deposit_paid',
        customer: {
          name: '王小明',
          phone: '0912-345-678',
          level: '金牌會員',
          memberNo: 'A123456789',
          dept: '銷售部'
        },
        corporate: {
          name: 'Google Taiwan',
          shortName: 'Google',
          billingType: '員工自付'
        },
        vehicle: {
          plate: 'RIMO-888',
          group: 'SUV組',
          model: 'Toyota RAV4',
          mileage: '12,450 km',
          seats: '5座',
          transmission: '自排',
          energy: '汽油',
          dispatchStatus: '已硬鎖定',
          currentStation: '新北總店 B1 交車區'
        },
        schedule: {
          start: '2024/05/07 09:30',
          end: '2024/05/10 18:00'
        },
        location: {
          pickup: '新北總店 - 新北市中正區中正路10號',
          return: '新北總店 - 新北市中正區中正路10號'
        },
        locationStatus: {
          pickupStore: 'normal',
          pickupStation: 'normal',
          returnStore: 'normal',
          returnStation: 'normal'
        },
        amount: 1920,
        promotionText: 'Google 企業資格行銷方案',
        eventSnapshots: [{
          key: 'event_period_adjust',
          snapshotLevel: 'event',
          title: '預約後改租期',
          version: 'EVT-PERIOD-20240506-001',
          eventType: '改租期',
          summary: '客戶延後取車 2 小時並延長還車至 2024/05/10 18:00，新增租金 ¥360',
          meta: '改租期只重算變更部分，不回改原訂單基線金額',
          sourcePage: '訂單詳情 / 編輯訂單',
          snapshotTime: '2024-05-06 08:42',
          scope: '預約編輯事件',
          savedBy: '客服主管',
          detailType: 'event',
          triggerText: '客戶來電調整取還車時間，訂單重新試算租期差額',
          settlementTarget: '取車尾款補收',
          versionRows: [{
            label: '標準價版本',
            version: 'PRICE-STORE-20260418-001',
            remark: '變更後的 SUV 車組仍沿用當前門市標準價版本'
          }, {
            label: '行銷方案版本',
            version: 'MKT-STORE-CORP-20260418-002',
            remark: '企業資格方案繼續生效，不重新選擇方案'
          }, {
            label: '租賃規則版本',
            version: 'RULE-STORE-20260418-002',
            remark: '按改租期事件時生效的租賃規則試算差額'
          }],
          beforeAfterRows: [{
            label: '取車時間',
            before: '2024/05/07 07:30',
            after: '2024/05/07 09:30'
          }, {
            label: '還車時間',
            before: '2024/05/10 16:00',
            after: '2024/05/10 18:00'
          }, {
            label: '租期結果',
            before: '3 天 8.5 小時',
            after: '3 天 8.5 小時 + 晚間時段補價'
          }],
          amountRows: [{
            label: '原訂單金額',
            amount: '¥1,560',
            remark: '下單基線快照金額'
          }, {
            label: '改租期差額',
            amount: '¥360',
            remark: '僅本次變更部分新增金額'
          }, {
            label: '當前訂單總額',
            amount: '¥1,920',
            remark: '更新後的訂單應收'
          }],
          eventNote: '改租期事件級快照需要同時保留變更前後取還車時間和差額結果，供取車尾款、客服解釋和後續結算追溯。'
        }]
      },
      ZT2405060010: {
        orderId: 'ZT2405060010',
        createTime: '2024-05-05 16:10',
        source: 'APP 自助下單',
        serviceMode: 'self_service',
        status: 'reserved',
        clientType: 'personal',
        billingMode: 'customer_pay',
        paymentStatus: 'deposit_paid',
        customer: {
          name: '林佳琪',
          phone: '0968-222-555',
          level: '金牌會員',
          memberNo: 'B240506010',
          dept: ''
        },
        corporate: null,
        vehicle: {
          plate: 'RIMO-206',
          group: '經濟車組',
          model: 'Toyota Yaris',
          mileage: '12,468 km',
          seats: '5座',
          transmission: '自排',
          energy: '汽油',
          dispatchStatus: '已硬鎖定',
          currentStation: '新北總店 P3 自助據點'
        },
        telematics: {
          pickup: {
            mileage: 12468,
            fuel: 7,
            syncAt: '2024-05-07 10:52'
          },
          return: {
            mileage: 12468,
            fuel: 7,
            syncAt: '2024-05-07 10:52'
          }
        },
        schedule: {
          start: '2024/05/07 11:00',
          end: '2024/05/09 11:00'
        },
        location: {
          pickup: '新北總店 - 新北市中正區中正路10號',
          pickupStationName: '新北總店 P3 自助據點',
          return: '新北總店 - 新北市中正區中正路10號',
          returnStationName: '新北總店 P3 自助據點',
          returnStationId: 'banqiao_p3'
        },
        locationStatus: {
          pickupStore: 'normal',
          pickupStation: 'normal',
          returnStore: 'closed',
          returnStation: 'closed'
        },
        amount: 3200,
        promotionText: '夜間自助租車方案',
        eventSnapshots: []
      },
      ZT2405040016: {
        orderId: 'ZT2405040016',
        createTime: '2024-05-04 09:10',
        source: 'APP 自助下單',
        serviceMode: 'self_service',
        status: 'renting',
        clientType: 'personal',
        billingMode: 'customer_pay',
        paymentStatus: 'paid',
        customer: {
          name: '陳柏翰',
          phone: '0910-668-225',
          level: '白金會員',
          memberNo: 'B240504016',
          dept: ''
        },
        corporate: null,
        vehicle: {
          plate: 'RIMO-515',
          group: 'SUV組',
          model: 'Toyota RAV4',
          mileage: '18,420 km',
          seats: '5座',
          transmission: '自排',
          energy: '汽油',
          dispatchStatus: '已硬鎖定',
          currentStation: '新北總店 P3 自助據點'
        },
        telematics: {
          pickup: {
            mileage: 18420,
            fuel: 7,
            syncAt: '2024-05-04 09:58'
          },
          return: {
            mileage: 18960,
            fuel: 5,
            syncAt: '2024-05-06 19:48'
          }
        },
        schedule: {
          start: '2024/05/04 10:00',
          end: '2024/05/06 20:00'
        },
        location: {
          pickup: '新北總店 - 新北市中正區中正路10號',
          pickupStationName: '新北總店 P3 自助據點',
          return: '臺北車站店 - 臺北市中正區忠孝西路1號',
          returnStationName: '臺北車站店 B2 自助還車點',
          returnStationId: 'taipei_b2'
        },
        locationStatus: {
          pickupStore: 'normal',
          pickupStation: 'normal',
          returnStore: 'normal',
          returnStation: 'normal'
        },
        amount: 2480,
        promotionText: '週末夜間自助方案',
        eventSnapshots: [{
          key: 'event_return_station_change',
          snapshotLevel: 'event',
          title: '改還車據點差額',
          version: 'EVT-RETURN-STATION-20240505-001',
          eventType: '改還車據點',
          summary: '還車據點由新北總店 P3 自助據點改爲臺北車站店 B2 自助還車點，異地還車費調增 ¥300',
          meta: '跨門市改據點時先更新還車門市，再按門市口徑重算異地費差額',
          sourcePage: '訂單詳情 / 改還車據點',
          snapshotTime: '2024-05-05 21:05',
          scope: '還車站點變更事件',
          savedBy: '客服專員',
          detailType: 'event',
          triggerText: '客戶申請改到臺北車站店自助還車，客服協助調整還車據點',
          settlementTarget: '還車結算補收',
          versionRows: [{
            label: '租賃規則版本',
            version: 'RULE-STORE-20260418-002',
            remark: '異地還車費按事件發生時生效的門市規則計算'
          }, {
            label: '服務價格版本',
            version: 'SVC-20260418-001',
            remark: '異地還車服務費版本'
          }],
          beforeAfterRows: [{
            label: '還車門市/據點',
            before: '新北總店 / 新北總店 P3 自助據點',
            after: '臺北車站店 / 臺北車站店 B2 自助還車點'
          }, {
            label: '費用口徑',
            before: '同門市自助還車，不產生差額',
            after: '跨門市自助還車，按門市差額重算'
          }, {
            label: '後續衝突',
            before: '無臺北站佔用',
            after: '已完成後續訂單衝突釋放'
          }],
          amountRows: [{
            label: '原異地還車費',
            amount: '¥0',
            remark: '原約定還車據點與取車門市一致'
          }, {
            label: '新異地還車費',
            amount: '¥300',
            remark: '取車門市到新還車門市的差額費用'
          }, {
            label: '待收差額',
            amount: '¥300',
            remark: '併入還車結算處理'
          }],
          eventNote: '同門市內僅調整自助據點時不生成計費快照；只有跨門市導致異地費或調度費差額變化時，才生成事件級快照。'
        }]
      },
      ZT2405060003: {
        orderId: 'ZT2405060003',
        createTime: '2024-05-06 08:50',
        source: '門市櫃檯',
        serviceMode: 'store_staffed',
        status: 'inspecting',
        clientType: 'corporate',
        billingMode: 'customer_pay',
        paymentStatus: 'partial_paid',
        customer: {
          name: '李小花',
          phone: '0922-333-444',
          level: '普通會員',
          memberNo: 'A987654321',
          dept: '研發部'
        },
        corporate: {
          name: 'TSMC 臺積電',
          shortName: 'TSMC',
          billingType: '員工自付'
        },
        vehicle: {
          plate: 'RIMO-123',
          group: '豪華車組',
          model: 'BMW 3 Series',
          mileage: '8,260 km',
          seats: '5座',
          transmission: '自排',
          energy: '汽油',
          dispatchStatus: '已硬鎖定',
          currentStation: '臺北車站店 A 區停車場'
        },
        schedule: {
          start: '2024/05/06 09:00',
          end: '2024/05/08 09:00'
        },
        location: {
          pickup: '臺北車站店 - 臺北市中正區忠孝西路1號',
          return: '臺北車站店 - 臺北市中正區忠孝西路1號'
        },
        locationStatus: {
          pickupStore: 'normal',
          pickupStation: 'normal',
          returnStore: 'normal',
          returnStation: 'normal'
        },
        amount: 4500,
        promotionText: 'TSMC 企業資格行銷方案',
        eventSnapshots: [{
          key: 'event_group_change',
          snapshotLevel: 'event',
          title: '改車組重計價',
          version: 'EVT-GROUP-20240506-001',
          eventType: '改車組',
          summary: '原豪華車組車輛臨時不可交付，改爲商務車組免費升等，差額 ¥0',
          meta: '同車組換車不生成計費快照；僅改車組、升降級才生成事件級快照',
          sourcePage: '訂單詳情 / 改派',
          snapshotTime: '2024-05-06 08:56',
          scope: '取車前改派事件',
          savedBy: '臺北車站店店長',
          detailType: 'event',
          triggerText: '原車輛臨時送保養，門店改派爲商務車組並執行免費升等',
          settlementTarget: '不調整客戶應收',
          versionRows: [{
            label: '標準價版本',
            version: 'PRICE-STORE-20260418-001',
            remark: '按改車組事件時的目標車組標準價進行差額試算'
          }, {
            label: '行銷方案版本',
            version: 'MKT-STORE-CORP-20260418-002',
            remark: '企業資格方案繼續沿用'
          }, {
            label: '租賃規則版本',
            version: 'RULE-STORE-20260418-002',
            remark: '改車組差額處理口徑'
          }],
          beforeAfterRows: [{
            label: '原預約車組',
            before: '豪華車組 / BMW 3 Series',
            after: '商務車組 / Lexus ES'
          }, {
            label: '差價處理',
            before: '未發生',
            after: '免費升等，不向客戶收差額'
          }, {
            label: '履約車輛',
            before: 'RIMO-123',
            after: 'RIMO-625'
          }],
          amountRows: [{
            label: '原車組金額',
            amount: '¥4,500',
            remark: '按豪華車組基線快照生成'
          }, {
            label: '改車組差額',
            amount: '¥0',
            remark: '門店執行免費升等'
          }, {
            label: '企業結算結果',
            amount: '¥4,500',
            remark: '不變更客戶應收與企業掛賬'
          }],
          eventNote: '改車組屬於商業條件變化，必須生成事件級快照；即使最終差額爲 0，也要記錄原車組、目標車組、版本號和差價處理方式。'
        }]
      },
      ZT2405040003: {
        orderId: 'ZT2405040003',
        createTime: '2024-05-04 14:20',
        source: 'APP 下單',
        serviceMode: 'store_staffed',
        status: 'renting',
        clientType: 'personal',
        billingMode: 'customer_pay',
        paymentStatus: 'paid',
        customer: {
          name: '李阿美',
          phone: '0922-123-456',
          level: '普通會員',
          memberNo: 'P240504003',
          dept: ''
        },
        corporate: null,
        vehicle: {
          plate: 'RIMO-101',
          group: '經濟型',
          model: 'Toyota Corolla',
          mileage: '13,280 km',
          seats: '5座',
          transmission: '自排',
          energy: '汽油',
          dispatchStatus: '已硬鎖定',
          currentStation: '臺北車站店 A 區停車場'
        },
        schedule: {
          start: '2024/05/04 15:00',
          end: '2024/05/07 10:00'
        },
        location: {
          pickup: '臺北車站店 - 臺北市中正區忠孝西路1號',
          return: '新北總店 - 新北市中正區中正路10號'
        },
        locationStatus: {
          pickupStore: 'normal',
          pickupStation: 'normal',
          returnStore: 'normal',
          returnStation: 'normal'
        },
        amount: 850,
        promotionText: '學生專案行銷方案',
        eventSnapshots: [{
          key: 'event_promo_adjust',
          snapshotLevel: 'event',
          title: '取車更換行銷方案',
          version: 'EVT-PROMO-20240504-001',
          eventType: '行銷方案調整',
          summary: '學生專案未通過到店覈驗，改爲會員行銷方案，取車尾款補收 ¥120',
          meta: '僅調整方案差額，不改寫訂單基線方案快照',
          sourcePage: '訂單詳情 / 取車',
          snapshotTime: '2024-05-04 15:18',
          scope: '取車資格覈驗事件',
          savedBy: '臺北車站店店員',
          detailType: 'event',
          triggerText: '客戶未提供學生證明文件，門店改用會員方案繼續發車',
          settlementTarget: '取車尾款補收',
          versionRows: [{
            label: '行銷方案原版本',
            version: 'MKT-STORE-STUDENT-20260418-001',
            remark: '下單基線方案版本'
          }, {
            label: '行銷方案新版本',
            version: 'MKT-STORE-MEMBER-20260418-001',
            remark: '取車時改用會員方案'
          }, {
            label: '租賃規則版本',
            version: 'RULE-STORE-20260418-002',
            remark: '按取車事件時的規則重算尾款'
          }],
          beforeAfterRows: [{
            label: '行銷方案',
            before: '學生專案行銷方案 (9折)',
            after: '會員行銷方案 (95折)'
          }, {
            label: '到店覈驗',
            before: '需上傳學生證或在學證明',
            after: '改爲普通會員資格，無額外證明'
          }, {
            label: '優惠結果',
            before: '預計優惠 ¥270',
            after: '預計優惠 ¥150'
          }],
          amountRows: [{
            label: '原方案優惠',
            amount: '¥270',
            remark: '基線快照保留原方案版本與優惠結果'
          }, {
            label: '新方案優惠',
            amount: '¥150',
            remark: '按取車時實際生效方案重算'
          }, {
            label: '補收差額',
            amount: '¥120',
            remark: '併入取車尾款收取'
          }],
          eventNote: '該事件只覆蓋本次方案變更影響的差額。訂單創建時保存的行銷方案基線快照仍保留，用於還原客戶原始預約承諾。'
        }]
      },
      ZT2405020008: {
        orderId: 'ZT2405020008',
        createTime: '2024-05-02 10:00',
        source: 'APP 下單',
        serviceMode: 'store_staffed',
        status: 'renewing',
        clientType: 'personal',
        billingMode: 'customer_pay',
        paymentStatus: 'paid',
        customer: {
          name: '趙強',
          phone: '0933-111-222',
          level: '白金會員',
          memberNo: 'P240502008',
          dept: ''
        },
        corporate: null,
        vehicle: {
          plate: 'RIMO-777',
          group: '商務車組',
          model: 'Honda Odyssey',
          mileage: '22,410 km',
          seats: '7座',
          transmission: '自排',
          energy: '汽油',
          dispatchStatus: '已人工改派',
          currentStation: '新北總店 B1 交車區'
        },
        schedule: {
          start: '2024/05/02 11:00',
          end: '2024/05/09 11:00'
        },
        location: {
          pickup: '新北總店 - 新北市中正區中正路10號',
          return: '新北總店 - 新北市中正區中正路10號'
        },
        locationStatus: {
          pickupStore: 'normal',
          pickupStation: 'normal',
          returnStore: 'normal',
          returnStation: 'normal'
        },
        amount: 5600,
        promotionText: '會員行銷方案',
        eventSnapshots: [{
          key: 'event_extend_pricing',
          snapshotLevel: 'event',
          title: '續租重計價',
          version: 'EVT-EXTEND-20240505-001',
          eventType: '續租',
          summary: '還車時間由 2024/05/07 11:00 延至 2024/05/09 11:00，新增租金 ¥1,600',
          meta: '僅對新增租期按續租事件命中的價格與規則計價',
          sourcePage: '訂單詳情 / 延長用車',
          snapshotTime: '2024-05-05 19:26',
          scope: '續租事件',
          savedBy: '新北總店店員',
          detailType: 'event',
          triggerText: '客戶確認續租 2 天，系統重算新增租期差額',
          settlementTarget: '還車結算補收',
          versionRows: [{
            label: '標準價版本',
            version: 'PRICE-STORE-20260418-001',
            remark: '新增租期仍按商務車組標準價版本試算'
          }, {
            label: '行銷方案版本',
            version: 'MKT-STORE-MEMBER-20260418-001',
            remark: '續租部分繼續沿用會員方案版本'
          }, {
            label: '租賃規則版本',
            version: 'RULE-STORE-20260418-002',
            remark: '按續租事件時的規則試算新增租期'
          }],
          beforeAfterRows: [{
            label: '還車時間',
            before: '2024/05/07 11:00',
            after: '2024/05/09 11:00'
          }, {
            label: '計費天數',
            before: '5 天',
            after: '7 天'
          }, {
            label: '事件價格口徑',
            before: '沿用訂單基線部分',
            after: '新增 2 天按續租事件價格計算'
          }],
          amountRows: [{
            label: '原訂單金額',
            amount: '¥4,000',
            remark: '下單基線快照部分不回改'
          }, {
            label: '新增租期金額',
            amount: '¥1,600',
            remark: '按續租事件快照寫入'
          }, {
            label: '當前訂單總額',
            amount: '¥5,600',
            remark: '作爲後續還車結算基礎'
          }],
          eventNote: '續租事件快照只覆蓋新增租期部分，原訂單基線金額、原規則版本和原優惠方案不被覆蓋。'
        }]
      },
      ZT2405010022: {
        orderId: 'ZT2405010022',
        createTime: '2024-05-01 10:30',
        source: 'APP 下單',
        serviceMode: 'store_staffed',
        status: 'payment_due',
        clientType: 'personal',
        billingMode: 'customer_pay',
        paymentStatus: 'payment_due',
        customer: {
          name: '鄭錢',
          phone: '0966-123-123',
          level: '普通會員',
          memberNo: 'P240501022',
          dept: ''
        },
        corporate: null,
        vehicle: {
          plate: 'RIMO-300',
          group: '豪華車組',
          model: 'Benz C300',
          mileage: '16,090 km',
          seats: '5座',
          transmission: '自排',
          energy: '汽油',
          dispatchStatus: '已硬鎖定',
          currentStation: '新北總店 B1 交車區'
        },
        schedule: {
          start: '2024/05/01 14:00',
          end: '2024/05/04 14:00'
        },
        location: {
          pickup: '新北總店 - 新北市中正區中正路10號',
          return: '新北總店 - 新北市中正區中正路10號'
        },
        locationStatus: {
          pickupStore: 'normal',
          pickupStation: 'normal',
          returnStore: 'normal',
          returnStation: 'normal'
        },
        amount: 4800,
        promotionText: '會員行銷方案',
        eventSnapshots: [{
          key: 'event_overtime_settlement',
          snapshotLevel: 'event',
          title: '逾時重計費',
          version: 'EVT-RETURN-20240504-001',
          eventType: '逾時結算',
          summary: '實際還車晚於約定 3 小時 20 分，按超時階梯重計費，待補繳 ¥600',
          meta: '事件快照記錄本次逾時命中結果和差額，不改寫訂單基線規則快照',
          sourcePage: '訂單詳情 / 還車結算',
          snapshotTime: '2024-05-04 17:26',
          scope: '還車結算事件',
          savedBy: '新北總店店員',
          detailType: 'event',
          triggerText: '實際還車時間 2024/05/04 17:20，超過約定還車時間 3 小時 20 分',
          settlementTarget: '還車補繳',
          versionRows: [{
            label: '標準價版本',
            version: 'PRICE-STORE-20260418-001',
            remark: '超時小時費率按當前車組標準價版本計算'
          }, {
            label: '租賃規則版本',
            version: 'RULE-STORE-20260418-002',
            remark: '命中不足 1 小時按 1 小時、5 小時轉日租閾值'
          }],
          beforeAfterRows: [{
            label: '約定還車時間',
            before: '2024/05/04 14:00',
            after: '2024/05/04 17:20'
          }, {
            label: '逾時時長',
            before: '0 小時',
            after: '3 小時 20 分'
          }, {
            label: '計費口徑',
            before: '僅按原訂單租期計費',
            after: '超出部分按小時費率重算'
          }],
          amountRows: [{
            label: '原訂單金額',
            amount: '¥4,200',
            remark: '基線快照部分保持不變'
          }, {
            label: '逾時費用',
            amount: '¥600',
            remark: '本次事件新增差額'
          }, {
            label: '待補繳金額',
            amount: '¥600',
            remark: '進入還車結算待收'
          }],
          eventNote: '逾時規則定義仍可在訂單基線規則快照中查看；事件級快照只記錄本次實際逾時時長、階梯命中結果和應收差額。'
        }]
      }
    };
    const urlClientType = initialUrlParams.get('clientType');
    const fallbackClientType = urlClientType === 'corporate' ? 'corporate' : 'personal';
    const selectedOrderSeed = mockOrderDetails[activeOrderId] || {
      orderId: activeOrderId,
      createTime: '2024-05-01 09:30',
      source: 'iOS App 1.0.11',
      serviceMode: initialUrlParams.get('serviceMode') || initialUrlParams.get('mode') || 'store_staffed',
      status: initialUrlParams.get('status') || 'reserved',
      clientType: fallbackClientType,
      billingMode: initialUrlParams.get('billing') === 'monthly' ? 'monthly' : 'customer_pay',
      paymentStatus: initialUrlParams.get('paymentStatus') || (initialUrlParams.get('billing') === 'monthly' ? 'monthly_billing' : initialUrlParams.get('status') === 'pending_payment' || initialUrlParams.get('action') === 'pay' ? 'unpaid' : 'deposit_paid'),
      customer: {
        name: initialUrlParams.get('customerName') || '王小明',
        phone: initialUrlParams.get('customerPhone') || '0912-345-678',
        level: initialUrlParams.get('customerLevel') || '金牌會員',
        memberNo: 'A123456789',
        dept: initialUrlParams.get('department') || ''
      },
      corporate: fallbackClientType === 'corporate' ? {
        name: initialUrlParams.get('corporateName') || '企業客戶',
        shortName: initialUrlParams.get('corporateShortName') || '企業',
        billingType: initialUrlParams.get('billing') === 'monthly' ? '企業月結' : '員工自付'
      } : null,
      vehicle: {
        plate: initialUrlParams.get('vehiclePlate') || 'ABC-1234',
        group: initialUrlParams.get('vehicleGroup') || '豪華轎車組',
        model: initialUrlParams.get('vehicleModel') || 'Toyota Corolla',
        mileage: '12,450 km',
        seats: '5座',
        transmission: '自排',
        energy: '汽油',
        dispatchStatus: initialUrlParams.get('dispatchStatusText') || '已派車',
        currentStation: initialUrlParams.get('vehicleStation') || (initialUrlParams.get('vehiclePlate') === '未分配' || initialUrlParams.get('dispatchStatusText') === '待派車' ? '' : '新北總店 B1 交車區')
      },
      schedule: {
        start: initialUrlParams.get('scheduleStart') || '2024/05/05 11:11',
        end: initialUrlParams.get('scheduleEnd') || '2024/05/05 15:11'
      },
      location: {
        pickup: initialUrlParams.get('pickupLocation') || '新北站 - 新北市中正區中正路10號',
        pickupStationName: initialUrlParams.get('pickupStationName') || '',
        return: initialUrlParams.get('returnLocation') || '新北站 - 新北市中正區中正路10號',
        returnStationName: initialUrlParams.get('returnStationName') || '',
        returnStationId: initialUrlParams.get('returnStationId') || ''
      },
      locationStatus: {
        pickupStore: initialUrlParams.get('pickupStoreStatus') || 'normal',
        pickupStation: initialUrlParams.get('pickupStationStatus') || 'normal',
        returnStore: initialUrlParams.get('returnStoreStatus') || 'normal',
        returnStation: initialUrlParams.get('returnStationStatus') || 'normal'
      },
      amount: Number(initialUrlParams.get('amount')) || 1920,
      promotionText: fallbackClientType === 'corporate' ? '企業資格行銷方案' : '學生專案行銷方案',
      eventSnapshots: []
    };
    const orderView = reactive(selectedOrderSeed);
    document.title = `訂單詳情 - ${orderView.orderId} - RIMO Admin`;
    const billingMode = ref(orderView.billingMode === 'monthly' ? 'monthly' : 'customer_pay');
    const isMonthlyBilling = computed(() => billingMode.value === 'monthly');
    const serviceMode = computed(() => orderView.serviceMode === 'self_service' ? 'self_service' : 'store_staffed');
    const isSelfServiceOrder = computed(() => serviceMode.value === 'self_service');
    const orderTypeText = computed(() => orderView.clientType === 'corporate' ? '企業訂單' : '個人訂單');
    const dispatchStatusText = computed(() => orderView.vehicle?.dispatchStatus || '待派車');
    const pickupVehicleStationText = computed(() => orderView.vehicle?.currentStation || '派車後顯示車輛所在據點');
    const parseMetricNumber = value => {
      const num = Number(value);
      return Number.isFinite(num) ? num : null;
    };
    const getTelematicsMetricValue = (phase, key, fallback) => {
      const num = parseMetricNumber(orderView.telematics?.[phase]?.[key]);
      return num ?? fallback;
    };
    const pickupTelematicsSnapshot = computed(() => isSelfServiceOrder.value ? orderView.telematics?.pickup || null : null);
    const returnTelematicsSnapshot = computed(() => isSelfServiceOrder.value ? orderView.telematics?.return || null : null);
    const hasPickupTelematics = computed(() => parseMetricNumber(pickupTelematicsSnapshot.value?.mileage) !== null && parseMetricNumber(pickupTelematicsSnapshot.value?.fuel) !== null);
    const hasReturnTelematics = computed(() => parseMetricNumber(returnTelematicsSnapshot.value?.mileage) !== null && parseMetricNumber(returnTelematicsSnapshot.value?.fuel) !== null);
    const splitStoreAddress = locationText => {
      const parts = (locationText || '').split(' - ');
      return {
        storeName: parts[0] || '-',
        address: parts.slice(1).join(' - ')
      };
    };
    const getStationShortName = (stationName, storeName) => {
      if (!stationName || stationName === '派車後顯示車輛所在據點') return '';
      return stationName.replace(storeName, '').replace(/^[-\s]+/, '').trim() || stationName;
    };
    const formatStoreStationAddress = (locationText, stationName) => {
      const {
        storeName,
        address
      } = splitStoreAddress(locationText);
      const shortStationName = getStationShortName(stationName, storeName);
      return [storeName, shortStationName, address].filter(Boolean).join(' - ');
    };
    const locationStatusMetaMap = {
      normal: {
        label: '正常',
        type: 'success'
      },
      paused: {
        label: '已暫停',
        type: 'warning'
      },
      closed: {
        label: '已關閉',
        type: 'danger'
      }
    };
    const getLocationStatusMeta = status => locationStatusMetaMap[status] || locationStatusMetaMap.normal;
    const buildLocationNotice = (storeStatus, stationStatus) => {
      if ([storeStatus, stationStatus].includes('closed')) return '站點已關閉，請聯繫客服處理';
      if ([storeStatus, stationStatus].includes('paused')) return '站點已暫停，請聯繫客服處理';
      return '';
    };
    const pickupPlanStationText = computed(() => isSelfServiceOrder.value ? orderView.location.pickupStationName || '' : orderView.vehicle?.currentStation || '');
    const pickupStoreStatusMeta = computed(() => getLocationStatusMeta(orderView.locationStatus?.pickupStore));
    const pickupStationStatusMeta = computed(() => getLocationStatusMeta(orderView.locationStatus?.pickupStation));
    const returnStoreStatusMeta = computed(() => getLocationStatusMeta(orderView.locationStatus?.returnStore));
    const returnStationStatusMeta = computed(() => getLocationStatusMeta(orderView.locationStatus?.returnStation));
    const showPickupStationStatus = computed(() => isSelfServiceOrder.value || orderView.locationStatus?.pickupStation !== 'normal');
    const showReturnStationStatus = computed(() => isSelfServiceOrder.value || orderView.locationStatus?.returnStation !== 'normal');
    const pickupLocationNotice = computed(() => buildLocationNotice(orderView.locationStatus?.pickupStore, orderView.locationStatus?.pickupStation));
    const returnLocationNotice = computed(() => buildLocationNotice(orderView.locationStatus?.returnStore, orderView.locationStatus?.returnStation));
    const pickupLocationDisplay = computed(() => formatStoreStationAddress(orderView.location.pickup, pickupPlanStationText.value));
    const getSnapshotDailyPrice = () => {
      const groupName = orderView.vehicle?.group || '';
      if (groupName.includes('豪華')) return 1200;
      if (groupName.includes('商務')) return 800;
      if (groupName.includes('SUV')) return 450;
      if (groupName.includes('經濟')) return 280;
      return Math.max(280, Math.round((orderView.amount || 0) / 2));
    };
    const buildMarketingSnapshotConfig = (promotionText, isCorporateOrder) => {
      const normalizedText = promotionText || '';
      if (!normalizedText) {
        return {
          version: '未使用行銷方案',
          meta: '未命中行銷方案版本',
          scope: '未使用行銷方案',
          basicInfo: [{
            label: '方案名稱',
            value: '未使用行銷方案'
          }, {
            label: '展示名稱',
            value: '-'
          }, {
            label: '方案等級 (排序權重)',
            value: '-'
          }, {
            label: '狀態',
            value: '-'
          }, {
            label: '方案有效期',
            value: '-'
          }, {
            label: '適用場景',
            value: '-'
          }, {
            label: '客戶羣體',
            value: '-'
          }, {
            label: '適用國籍',
            value: '-'
          }, {
            label: '適用卡種',
            value: '-'
          }, {
            label: '到店覈驗',
            value: '-'
          }, {
            label: '資格名稱',
            value: '-'
          }, {
            label: '證明文件說明',
            value: '-'
          }, {
            label: '適用車組',
            value: '-'
          }, {
            label: '方案說明',
            value: '-'
          }],
          ruleRows: []
        };
      }
      if (isCorporateOrder || normalizedText.includes('企業')) {
        return {
          version: 'MKT-STORE-CORP-20260418-002',
          meta: '按企業資格命中方案版本',
          scope: '企業資格預訂',
          basicInfo: [{
            label: '方案名稱',
            value: normalizedText
          }, {
            label: '展示名稱',
            value: '企業禮遇'
          }, {
            label: '方案等級 (排序權重)',
            value: '10'
          }, {
            label: '狀態',
            value: '啓用'
          }, {
            label: '方案有效期',
            value: '2026-04-01 ~ 2026-12-31'
          }, {
            label: '適用場景',
            value: '標準門市'
          }, {
            label: '客戶羣體',
            value: '企業資格客戶'
          }, {
            label: '適用國籍',
            value: '全部國籍'
          }, {
            label: '適用卡種',
            value: 'Visa / Mastercard / JCB / 銀聯'
          }, {
            label: '到店覈驗',
            value: '無需到店覈驗'
          }, {
            label: '資格名稱',
            value: '-'
          }, {
            label: '證明文件說明',
            value: '無額外上傳要求'
          }, {
            label: '適用車組',
            value: '全部門市車組'
          }, {
            label: '方案說明',
            value: '企業資格客戶可使用的門市租車優惠方案。'
          }],
          ruleRows: [{
            name: '企業資格價',
            salesWindow: '不限',
            useWindow: '2026-04-01 ~ 2026-12-31',
            advanceBooking: '0 天',
            carGroup: '全部門市車組',
            membership: '企業方案會員',
            rentalTerm: '1 天起',
            locationScope: '全部地區 / 全部門市',
            action: '統一價模式：平日 85 折，假日 88 折'
          }, {
            name: '互斥規則',
            salesWindow: '不限',
            useWindow: '不限',
            advanceBooking: '不限',
            carGroup: '全部門市車組',
            membership: '企業方案會員',
            rentalTerm: '不限',
            locationScope: '全部地區 / 全部門市',
            action: '命中多個行銷方案時，不與其他行銷方案疊加'
          }]
        };
      }
      if (normalizedText.includes('學生')) {
        return {
          version: 'MKT-STORE-STUDENT-20260420-001',
          meta: '按個人會員資格命中方案版本',
          scope: '個人會員預訂',
          basicInfo: [{
            label: '方案名稱',
            value: normalizedText
          }, {
            label: '展示名稱',
            value: '學生租車優惠'
          }, {
            label: '方案等級 (排序權重)',
            value: '7'
          }, {
            label: '狀態',
            value: '啓用'
          }, {
            label: '方案有效期',
            value: '2026-05-01 ~ 2026-12-31'
          }, {
            label: '適用場景',
            value: '標準門市'
          }, {
            label: '客戶羣體',
            value: '個人會員'
          }, {
            label: '適用國籍',
            value: '全部國籍'
          }, {
            label: '適用卡種',
            value: 'Visa / Mastercard / JCB / 銀聯'
          }, {
            label: '到店覈驗',
            value: '需到店覈驗'
          }, {
            label: '資格名稱',
            value: '學生身份'
          }, {
            label: '證明文件說明',
            value: '學生證、在學證明等可證明學生身份的文件'
          }, {
            label: '適用車組',
            value: '全部門市車組'
          }, {
            label: '方案說明',
            value: '學生身份到店覈驗後享受門市租車優惠。'
          }],
          ruleRows: [{
            name: '資格覈驗後 85 折',
            salesWindow: '不限',
            useWindow: '2026-05-01 ~ 2026-12-31',
            advanceBooking: '0 天',
            carGroup: '全部門市車組',
            membership: '普通會員 / 銀卡 / 金卡',
            rentalTerm: '1 天起',
            locationScope: '全部地區 / 全部門市',
            action: '平假分開模式：平日 85 折，假日 9 折'
          }, {
            name: '自助限制',
            salesWindow: '不限',
            useWindow: '不限',
            advanceBooking: '不限',
            carGroup: '全部門市車組',
            membership: '普通會員 / 銀卡 / 金卡',
            rentalTerm: '不限',
            locationScope: '全部地區 / 全部門市',
            action: '24h 自助租車不開放選擇該方案'
          }, {
            name: '覈驗不通過',
            salesWindow: '不限',
            useWindow: '不限',
            advanceBooking: '不限',
            carGroup: '全部門市車組',
            membership: '普通會員 / 銀卡 / 金卡',
            rentalTerm: '不限',
            locationScope: '全部地區 / 全部門市',
            action: '門店更換行銷方案並重算取車尾款'
          }]
        };
      }
      if (normalizedText.includes('平日')) {
        return {
          version: 'MKT-STORE-WEEKDAY-20260412-001',
          meta: '按個人會員資格命中方案版本',
          scope: '個人會員預訂',
          basicInfo: [{
            label: '方案名稱',
            value: normalizedText
          }, {
            label: '展示名稱',
            value: '平日輕旅'
          }, {
            label: '方案等級 (排序權重)',
            value: '6'
          }, {
            label: '狀態',
            value: '啓用'
          }, {
            label: '方案有效期',
            value: '2026-04-12 ~ 2026-12-31'
          }, {
            label: '適用場景',
            value: '標準門市、自助'
          }, {
            label: '客戶羣體',
            value: '個人會員、企業資格客戶'
          }, {
            label: '適用國籍',
            value: '全部國籍'
          }, {
            label: '適用卡種',
            value: 'Visa / Mastercard / JCB / 銀聯'
          }, {
            label: '到店覈驗',
            value: '無需到店覈驗'
          }, {
            label: '資格名稱',
            value: '-'
          }, {
            label: '證明文件說明',
            value: '無額外上傳要求'
          }, {
            label: '適用車組',
            value: '全部門市車組'
          }, {
            label: '方案說明',
            value: '針對平日短中租期的統一優惠方案。'
          }],
          ruleRows: [{
            name: '平日減免',
            salesWindow: '不限',
            useWindow: '工作日',
            advanceBooking: '0 天',
            carGroup: '全部門市車組',
            membership: '普通會員 / 銀卡 / 金卡',
            rentalTerm: '1 天起',
            locationScope: '全部地區 / 全部門市',
            action: '統一價模式：訂單租金立減 ¥200'
          }, {
            name: '互斥規則',
            salesWindow: '不限',
            useWindow: '不限',
            advanceBooking: '不限',
            carGroup: '全部門市車組',
            membership: '普通會員 / 銀卡 / 金卡',
            rentalTerm: '不限',
            locationScope: '全部地區 / 全部門市',
            action: '不與其他行銷方案疊加，按優先級取最優'
          }]
        };
      }
      return {
        version: 'MKT-STORE-MEMBER-20260418-001',
        meta: '按個人會員資格命中方案版本',
        scope: '個人會員預訂',
        basicInfo: [{
          label: '方案名稱',
          value: normalizedText
        }, {
          label: '展示名稱',
          value: '會員禮遇'
        }, {
          label: '方案等級 (排序權重)',
          value: '8'
        }, {
          label: '狀態',
          value: '啓用'
        }, {
          label: '方案有效期',
          value: '2026-04-01 ~ 2026-12-31'
        }, {
          label: '適用場景',
          value: '標準門市'
        }, {
          label: '客戶羣體',
          value: '個人會員'
        }, {
          label: '適用國籍',
          value: '全部國籍'
        }, {
          label: '適用卡種',
          value: 'Visa / Mastercard / JCB / 銀聯'
        }, {
          label: '到店覈驗',
          value: '無需到店覈驗'
        }, {
          label: '資格名稱',
          value: '-'
        }, {
          label: '證明文件說明',
          value: '無額外上傳要求'
        }, {
          label: '適用車組',
          value: '全部門市車組'
        }, {
          label: '方案說明',
          value: '面向既有會員的門市租車優惠方案。'
        }],
        ruleRows: [{
          name: '會員價',
          salesWindow: '不限',
          useWindow: '2026-04-01 ~ 2026-12-31',
          advanceBooking: '0 天',
          carGroup: '全部門市車組',
          membership: '普通會員 / 銀卡 / 金卡',
          rentalTerm: '1 天起',
          locationScope: '全部地區 / 全部門市',
          action: '統一價模式：租金 95 折'
        }, {
          name: '互斥規則',
          salesWindow: '不限',
          useWindow: '不限',
          advanceBooking: '不限',
          carGroup: '全部門市車組',
          membership: '普通會員 / 銀卡 / 金卡',
          rentalTerm: '不限',
          locationScope: '全部地區 / 全部門市',
          action: '不與其他行銷方案疊加，命中後按當前方案執行'
        }]
      };
    };
    const buildStoreRuleSections = () => [{
      title: '交易與授權',
      items: [{
        label: '待支付資源保留',
        value: '開啓'
      }, {
        label: '保留時長',
        value: '30 分鐘'
      }, {
        label: '超時處理',
        value: '取消訂單並釋放庫存'
      }, {
        label: '派車限制',
        value: '待支付不參與派車'
      }, {
        label: '線上交易',
        value: '啓用（LINE Pay / 街口支付 / 綠界金流）'
      }, {
        label: '線下交易',
        value: '啓用（現金 / 刷卡 POS / 轉賬）'
      }, {
        label: '授權額度模式',
        value: '租金比例'
      }, {
        label: '固定額度',
        value: '-'
      }, {
        label: '租金比例',
        value: '30%'
      }, {
        label: '取車資金處理口徑',
        value: '履約擔保 / 預授權轉租金'
      }, {
        label: '企業月結口徑',
        value: '不發起客戶支付或預授權，最終費用進入企業賬單'
      }]
    }, {
      title: '異地還車',
      items: [{
        label: '異地還車費',
        value: '¥200/次'
      }]
    }, {
      title: '調度與派車',
      items: [{
        label: '車輛排程看板鎖定時間',
        value: '2 小時前鎖定'
      }, {
        label: '訂單間隔時間',
        value: '60 分鐘'
      }, {
        label: '基準日均里程',
        value: '150 km/天'
      }, {
        label: '訂單處理口徑',
        value: '先算訂單權重，再按車輛評分低者優先派遣'
      }, {
        label: '里程權重',
        value: '0%'
      }, {
        label: '營收權重',
        value: '100%'
      }, {
        label: '車齡權重',
        value: '0%'
      }]
    }, {
      title: '時租與日租',
      items: [{
        label: '起租規則',
        value: '起租 24 小時'
      }, {
        label: '最小計費單位',
        value: '不足 1 小時按 1 小時'
      }, {
        label: '時租轉日租時間',
        value: '第 5 小時起算 1 天'
      }, {
        label: '不滿日租時的時租價格',
        value: '按日租百分比'
      }, {
        label: '每小時按日租',
        value: '10%'
      }, {
        label: '時租單價',
        value: '-'
      }, {
        label: '固定金額',
        value: '-'
      }]
    }, {
      title: '取還車規則',
      items: [{
        label: '允許提前取車',
        value: '是'
      }, {
        label: '免費寬限時間',
        value: '30 分鐘'
      }, {
        label: '啓用履約操作鎖',
        value: '是'
      }, {
        label: '鎖有效期',
        value: '30 分鐘'
      }, {
        label: '允許提前還車',
        value: '是'
      }, {
        label: '退款計算規則',
        value: '僅退還整天租金'
      }, {
        label: '未取車保留車輛時長',
        value: '2 小時'
      }, {
        label: '自動釋放資源',
        value: '是'
      }, {
        label: '處理後狀態',
        value: '爽約'
      }, {
        label: '爽約違約金',
        value: '收取'
      }, {
        label: '爽約違約金計算方式',
        value: '固定金額'
      }, {
        label: '爽約違約金固定金額',
        value: '¥200'
      }, {
        label: '爽約違約金預授權比例',
        value: '-'
      }]
    }, {
      title: '取消與超時規則',
      items: [{
        label: '下單後限時取消',
        value: '開啓'
      }, {
        label: '下單後免責時限',
        value: '30 分鐘'
      }, {
        label: '取車前提前取消',
        value: '開啓'
      }, {
        label: '取車前免責時限',
        value: '24 小時'
      }, {
        label: '免責取消退款方式',
        value: '全額退款'
      }, {
        label: '免責取消手續費',
        value: '-'
      }, {
        label: '有責取消違約金計算方式',
        value: '預授權比例'
      }, {
        label: '有責取消固定金額',
        value: '-'
      }, {
        label: '有責取消預授權比例',
        value: '30%'
      }, {
        label: '是否階梯扣費',
        value: '是'
      }, {
        label: '階梯規則 1',
        value: '取車前 ≤24 小時扣 20%'
      }, {
        label: '階梯規則 2',
        value: '取車前 ≤12 小時扣 50%'
      }, {
        label: '階梯規則 3',
        value: '取車前 ≤2 小時扣 100%'
      }, {
        label: '超時免費寬限',
        value: '30 分鐘'
      }, {
        label: '超時罰款',
        value: '開啓'
      }, {
        label: '超時罰款類型',
        value: '固定金額'
      }, {
        label: '超時罰款數額',
        value: '¥100'
      }, {
        label: '超時費封頂',
        value: '開啓'
      }, {
        label: '超時費封頂金額',
        value: '¥500'
      }]
    }, {
      title: '續租規則',
      items: [{
        label: '允許延長用車',
        value: '是'
      }, {
        label: '允許逾期補辦續租',
        value: '是'
      }, {
        label: '後續訂單衝突',
        value: '先改派後續訂單，否則拒絕續租'
      }, {
        label: '可選結算方式',
        value: '立即收款 / 還車時結算'
      }, {
        label: '超過時長必須收款',
        value: '24 小時'
      }, {
        label: '超過金額必須收款',
        value: '¥1000'
      }, {
        label: '風險客戶必須收款',
        value: '是'
      }, {
        label: '企業月結口徑',
        value: '不展示立即收款和還車時結算選項，費用統一進入企業賬單'
      }]
    }];
    const billingSnapshotItems = computed(() => {
      const dailyPrice = getSnapshotDailyPrice();
      const isCorporateOrder = orderView.clientType === 'corporate';
      const marketingSnapshot = buildMarketingSnapshotConfig(orderView.promotionText, isCorporateOrder);
      return [{
        key: 'price',
        snapshotLevel: 'baseline',
        title: '車組標準價',
        version: 'PRICE-STORE-20260418-001',
        summary: `${orderView.vehicle?.group || '門市車組'}，標準價 ¥${formatNumber(dailyPrice)}/天`,
        meta: '含下單時的標準價和里程規則版本',
        sourcePage: '動態調價 / 基礎產品定價',
        snapshotTime: orderView.createTime,
        scope: orderView.vehicle?.group || '門市車組',
        savedBy: '總部運營',
        detailType: 'price',
        priceRows: [{
          group: orderView.vehicle?.group || '門市車組',
          models: orderView.vehicle?.model || '按訂單車組綁定車型',
          dailyPrice: `¥${formatNumber(dailyPrice)}`,
          mileageRule: '200km/天，超程 ¥2.0/km，不封頂',
          lastUpdated: '2026-04-18'
        }, {
          group: '經濟型轎車',
          models: 'Toyota Corolla, Honda Civic 等',
          dailyPrice: '¥280',
          mileageRule: '200km/天，超程 ¥2.0/km，不封頂',
          lastUpdated: '2026-04-18'
        }, {
          group: 'SUV組',
          models: 'Toyota RAV4, Honda CR-V 等',
          dailyPrice: '¥450',
          mileageRule: '200km/天，超程 ¥2.0/km，不封頂',
          lastUpdated: '2026-04-18'
        }, {
          group: '商務車組',
          models: 'Buick GL8, Honda Odyssey 等',
          dailyPrice: '¥800',
          mileageRule: '250km/天，超程 ¥3.0/km，不封頂',
          lastUpdated: '2026-04-18'
        }]
      }, {
        key: 'marketing',
        snapshotLevel: 'baseline',
        title: '行銷優惠方案',
        version: marketingSnapshot.version,
        summary: orderView.promotionText || '未使用行銷方案',
        meta: marketingSnapshot.meta,
        sourcePage: '行銷方案管理',
        snapshotTime: orderView.createTime,
        scope: marketingSnapshot.scope,
        savedBy: '行銷運營',
        detailType: 'marketing',
        basicInfo: marketingSnapshot.basicInfo,
        ruleRows: marketingSnapshot.ruleRows
      }, {
        key: 'rules',
        snapshotLevel: 'baseline',
        title: '門市租車規則',
        version: 'RULE-STORE-20260418-002',
        summary: '起租 24 小時，不足 1 小時按 1 小時，超過第 5 小時起算 1 天',
        meta: '含預授權、待支付資源保留、取消、爽約、續租和還車結算規則',
        sourcePage: '租賃業務規則',
        snapshotTime: orderView.createTime,
        scope: '門市租車全局規則',
        savedBy: '運營管理員',
        detailType: 'rules',
        ruleSections: buildStoreRuleSections()
      }, {
        key: 'service',
        snapshotLevel: 'baseline',
        title: '增值服務',
        version: 'SVC-20260418-001',
        summary: '增值服務價格按訂單創建時快照執行',
        meta: '後續價格或規則變更不影響本單',
        sourcePage: '增值服務管理',
        snapshotTime: orderView.createTime,
        scope: '本訂單已選服務',
        savedBy: '產品運營',
        detailType: 'service',
        serviceRows: [{
          name: '基礎保險',
          billing: '按天',
          price: '¥80/天',
          remark: '按訂單租期天數計費'
        }, {
          name: '兒童座椅',
          billing: '按天/數量',
          price: '¥30/天/個',
          remark: '按訂單選擇數量計費'
        }, {
          name: '異地還車服務',
          billing: '按次',
          price: '按門店規則計算',
          remark: '按訂單約定門店和規則快照計算'
        }, {
          name: '第二駕駛人',
          billing: '按次',
          price: '¥150/次',
          remark: '按訂單辦理時選擇的駕駛人數量計費'
        }, {
          name: '服務價格版本',
          billing: '版本',
          price: 'SVC-20260418-001',
          remark: '後續服務價格調整不影響本單'
        }]
      }];
    });
    const billingEventSnapshotItems = computed(() => Array.isArray(orderView.eventSnapshots) ? orderView.eventSnapshots : []);
    const getRuleSectionRows = snapshot => (snapshot?.ruleSections || []).flatMap(section => (section.items || []).map(item => ({
      section: section.title,
      label: item.label,
      value: item.value
    })));
    const getEventSummaryRows = snapshot => {
      const rows = [{
        label: '觸發原因',
        value: snapshot?.triggerText || '-'
      }, {
        label: '結算去向',
        value: snapshot?.settlementTarget || '-'
      }];
      if (snapshot?.savedBy) rows.push({
        label: '操作人',
        value: snapshot.savedBy
      });
      return rows;
    };
    const snapshotVersionDialogVisible = ref(false);
    const selectedSnapshotVersion = ref(null);
    const openSnapshotVersion = item => {
      selectedSnapshotVersion.value = item;
      snapshotVersionDialogVisible.value = true;
    };
    const postChargeView = reactive({
      status: initialUrlParams.get('postChargeStatus') || '',
      amount: Number(initialUrlParams.get('postChargeAmount')) || 0,
      count: Number(initialUrlParams.get('postChargeCount')) || 0
    });
    const paymentStatusMapForDetail = {
      unpaid: {
        text: '未支付',
        type: 'warning'
      },
      deposit_paid: {
        text: '已收預授權',
        type: 'primary'
      },
      monthly_billing: {
        text: '企業月結',
        type: 'primary'
      },
      partial_paid: {
        text: '部分支付',
        type: 'warning'
      },
      paid: {
        text: '已結清',
        type: 'success'
      },
      payment_due: {
        text: '待補繳',
        type: 'danger'
      },
      refund_pending: {
        text: '待退款',
        type: 'warning'
      },
      refunded: {
        text: '已退款',
        type: 'info'
      }
    };
    const postChargeStatusMapForDetail = {
      pending_notify: {
        text: '追繳待通知',
        type: 'warning'
      },
      notified: {
        text: '追繳已通知',
        type: 'warning'
      },
      payment_due: {
        text: '追繳待支付',
        type: 'danger'
      },
      monthly_billing: {
        text: '月結已掛賬',
        type: 'primary'
      },
      paid: {
        text: '追繳已結清',
        type: 'success'
      }
    };
    const paymentStatusBadge = computed(() => paymentStatusMapForDetail[orderView.paymentStatus] || null);
    const postChargeBadge = computed(() => postChargeView.status ? postChargeStatusMapForDetail[postChargeView.status] || {
      text: postChargeView.status,
      type: 'warning'
    } : null);
    const operationRecords = ref([{
      title: '訂單完成',
      content: '訂單已結清，流程結束',
      timestamp: '2024-05-05 10:15:00',
      operator: '系統自動',
      type: 'success',
      color: '#67C23A',
      hollow: false
    }, {
      title: '確認還車',
      content: '車輛已歸還至 臺北車站店，油量 90%，車況正常',
      timestamp: '2024-05-05 10:00:00',
      operator: '門店管理員 (李四)',
      type: 'primary',
      color: 'var(--app-color-primary)'
    }, {
      title: '費用結算',
      content: '支付剩餘尾款 ¥960 (含超時費 ¥0)',
      timestamp: '2024-05-05 09:55:00',
      operator: '財務專員 (王五)',
      memo: '客戶刷卡支付',
      color: '#E6A23C'
    }, {
      title: '延長用車',
      content: '客戶申請延長用車 1 天，原定還車時間 2024-05-04 10:00 -> 2024-05-05 10:00',
      timestamp: '2024-05-04 09:00:00',
      operator: '客服專員 (小美)',
      memo: '電話申請，已補收差價',
      color: '#E6A23C'
    }, {
      title: '確認取車',
      content: '車輛已從 新北總店 駛出，里程 12050km',
      timestamp: '2024-05-01 10:30:00',
      operator: '門店管理員 (張三)',
      type: 'primary',
      color: 'var(--app-color-primary)'
    }, {
      title: '車輛調度',
      content: '分配車輛 Tesla Model 3 (京A·88888)',
      timestamp: '2024-05-01 09:45:00',
      operator: '調度中心',
      hollow: true
    }, {
      title: '訂單支付',
      content: '客戶完成預授權押金 ¥666',
      timestamp: '2024-05-01 09:35:00',
      operator: '系統',
      type: 'success'
    }, {
      title: '創建訂單',
      content: '客戶提交訂單，狀態：待支付',
      timestamp: '2024-05-01 09:30:00',
      operator: '客戶 (App)',
      hollow: true
    }]);
    const orderStatus = ref(orderView.status || 'reserved');
    const orderStatusText = computed(() => {
      const map = {
        pending_payment: '待支付',
        reserved: '已預訂',
        pickup_overdue: '逾期未取',
        inspecting: '驗車中',
        renting: '用車中',
        renewing: '續租中',
        overdue: '逾期未還',
        accident_processing: '出險處理中',
        settlement_pending: '待結算',
        payment_due: '待補繳',
        refund_pending: '待退款',
        completed: '已完成',
        cancelled: '已取消',
        no_show: '爽約',
        rejected: '已拒絕',
        closed: '已關閉'
      };
      return map[orderStatus.value];
    });
    const orderStatusType = computed(() => {
      const map = {
        pending_payment: 'warning',
        reserved: 'primary',
        pickup_overdue: 'warning',
        inspecting: 'warning',
        renting: 'success',
        renewing: 'success',
        overdue: 'danger',
        accident_processing: 'danger',
        settlement_pending: 'warning',
        payment_due: 'danger',
        refund_pending: 'warning',
        completed: 'success',
        cancelled: 'info',
        no_show: 'info',
        rejected: 'danger',
        closed: 'danger'
      };
      return map[orderStatus.value];
    });
    const returnSettlementStatuses = ['settlement_pending', 'payment_due', 'refund_pending'];
    const terminalStatuses = ['completed', 'cancelled', 'no_show', 'rejected', 'closed'];
    const canEditOrder = computed(() => !terminalStatuses.includes(orderStatus.value));
    const canPickup = computed(() => ['reserved', 'pickup_overdue', 'inspecting'].includes(orderStatus.value));
    const canReturn = computed(() => ['renting', 'renewing', 'overdue', 'accident_processing', ...returnSettlementStatuses].includes(orderStatus.value));
    const canExtend = computed(() => ['renting', 'renewing', 'overdue'].includes(orderStatus.value));
    const canRedirect = computed(() => ['reserved', 'pickup_overdue', 'inspecting', 'renting', 'renewing', 'overdue', 'accident_processing'].includes(orderStatus.value));
    const canChangeReturnStore = computed(() => ['reserved', 'pickup_overdue', 'inspecting', 'renting', 'renewing', 'overdue', 'accident_processing'].includes(orderStatus.value));
    const canChangeReturnStation = computed(() => canChangeReturnStore.value);
    const canAccident = computed(() => ['renting', 'renewing', 'overdue', 'accident_processing', ...returnSettlementStatuses, 'completed'].includes(orderStatus.value));
    const canCancel = computed(() => ['pending_payment', 'reserved', 'pickup_overdue'].includes(orderStatus.value));
    const canClose = computed(() => ['pending_payment', 'reserved', 'pickup_overdue', 'inspecting', 'renting', 'renewing', 'overdue', 'accident_processing'].includes(orderStatus.value));
    const pickupActionText = computed(() => orderStatus.value === 'inspecting' ? '繼續取車' : '取車');
    const returnActionText = computed(() => {
      if (orderStatus.value === 'payment_due') return '收款';
      if (orderStatus.value === 'refund_pending') return '退款';
      if (isMonthlyBilling.value && orderStatus.value === 'settlement_pending') return '確認月結';
      return returnSettlementStatuses.includes(orderStatus.value) ? '繼續結算' : '還車';
    });
    const extendActionText = computed(() => orderStatus.value === 'overdue' ? '補辦續租' : '延長用車');
    const formatDate = date => {
      if (!date) return '-';
      return new Date(date).toLocaleString('zh-CN', {
        hour12: false,
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    };
    const extendModalVisible = ref(false);
    const extendData = reactive({
      newReturnTime: null,
      conflict: null,
      remarks: '',
      settlementMode: 'return_settlement',
      paymentPaid: false
    });
    const openExtendModal = () => {
      extendModalVisible.value = true;
      extendData.newReturnTime = null;
      extendData.conflict = null;
      extendData.remarks = '';
      extendData.settlementMode = isMonthlyBilling.value ? 'monthly' : orderStatus.value === 'overdue' ? 'immediate' : 'return_settlement';
      extendData.paymentPaid = false;
    };
    const extendDialogTitle = computed(() => orderStatus.value === 'overdue' ? '補辦續租' : '延長用車');
    const estimatedExtendFee = computed(() => {
      if (!extendData.newReturnTime) return 0;
      const diffHours = (new Date(extendData.newReturnTime) - planData.returnTime) / 3600000;
      if (diffHours <= 0) return 0;
      return Math.ceil(diffHours) * planData.hourlyRate;
    });
    const extendBillableHours = computed(() => {
      if (!extendData.newReturnTime) return 0;
      const diffHours = (new Date(extendData.newReturnTime) - planData.returnTime) / 3600000;
      return diffHours > 0 ? Math.ceil(diffHours) : 0;
    });
    const extendDurationText = computed(() => {
      if (!extendData.newReturnTime) return '';
      const diffHours = (new Date(extendData.newReturnTime) - planData.returnTime) / 3600000;
      const days = Math.floor(diffHours / 24);
      const hours = Math.ceil(diffHours % 24);
      return days > 0 ? `${days}天${hours}小時` : `${hours}小時`;
    });
    const extendRequiresImmediatePay = computed(() => {
      if (isMonthlyBilling.value) return false;
      return orderStatus.value === 'overdue' || extendBillableHours.value > 24 || estimatedExtendFee.value > 1000;
    });
    const extendImmediateReason = computed(() => {
      const reasons = [];
      if (orderStatus.value === 'overdue') reasons.push('逾期補辦續租');
      if (extendBillableHours.value > 24) reasons.push('延長時長超過24小時');
      if (estimatedExtendFee.value > 1000) reasons.push('續租金額超過1000元');
      return reasons.join('、') || '風控要求';
    });
    const canConfirmExtend = computed(() => {
      if (!extendData.newReturnTime || extendData.conflict || estimatedExtendFee.value <= 0) return false;
      if (isMonthlyBilling.value) return true;
      if (extendRequiresImmediatePay.value && extendData.settlementMode !== 'immediate') return false;
      if (extendData.settlementMode === 'immediate' && !extendData.paymentPaid) return false;
      return true;
    });
    const checkExtendConflict = () => {
      if (!extendData.newReturnTime) return;
      const conflictDate = new Date('2026-02-05T14:00:00');
      if (new Date(extendData.newReturnTime) > conflictDate) {
        extendData.conflict = {
          nextOrder: {
            orderId: 'ORD-20260205-001',
            pickupTime: '2026/02/05 14:00'
          },
          maxExtendTime: '2026/02/05 12:00'
        };
      } else {
        extendData.conflict = null;
      }
      extendData.paymentPaid = false;
      if (isMonthlyBilling.value) {
        extendData.settlementMode = 'monthly';
      } else if (extendRequiresImmediatePay.value) {
        extendData.settlementMode = 'immediate';
      }
    };
    const useMaxExtendTime = () => {
      extendData.newReturnTime = new Date('2026-02-05T12:00:00');
      extendData.conflict = null;
      extendData.paymentPaid = false;
      if (isMonthlyBilling.value) {
        extendData.settlementMode = 'monthly';
      } else if (extendRequiresImmediatePay.value) {
        extendData.settlementMode = 'immediate';
      }
    };
    const resolveConflict = () => {
      const loading = feedback.ElLoading.service({
        text: '正在改派後續訂單...'
      });
      window.setTimeout(() => {
        loading.close();
        feedback.ElMessage.success('後續訂單(ORD-20260205-001)已成功改派至車輛 [Honda CRV]');
        extendData.conflict = null;
      }, 1500);
    };
    const confirmExtendPayment = () => {
      if (isMonthlyBilling.value) {
        feedback.ElMessage.info('企業月結訂單不需要續租收款');
        return;
      }
      if (!extendData.newReturnTime || estimatedExtendFee.value <= 0) {
        feedback.ElMessage.warning('請先選擇有效的新還車時間');
        return;
      }
      extendData.paymentPaid = true;
      feedback.ElMessage.success('續租費用收款成功');
    };
    const confirmExtend = () => {
      if (!canConfirmExtend.value) {
        feedback.ElMessage.warning('請先完成延長時間、庫存和收款校驗');
        return;
      }
      const loading = feedback.ElLoading.service({
        text: '正在處理延長請求...'
      });
      const oldReturnTime = new Date(planData.returnTime);
      const newReturnTime = new Date(extendData.newReturnTime);
      const feeAmount = estimatedExtendFee.value;
      const feeId = 'FEE-EXT-' + Date.now();
      const isImmediate = extendData.settlementMode === 'immediate';
      const isMonthlyExtend = isMonthlyBilling.value;
      window.setTimeout(() => {
        loading.close();
        planData.returnTime = newReturnTime;
        orderStatus.value = 'renewing';
        feeItems.value.unshift({
          id: feeId,
          type: 'extension_rent',
          source: 'system',
          name: '續租租金',
          description: `${formatDate(oldReturnTime)} 至 ${formatDate(newReturnTime)}，${extendDurationText.value}`,
          amount: feeAmount,
          paidAmount: isImmediate ? feeAmount : 0,
          status: isMonthlyExtend ? 'monthly_billing' : isImmediate ? 'paid' : 'pending',
          phase: 'rental',
          createdAt: new Date().toLocaleString(),
          createdBy: 'system',
          attachments: [],
          reminder: isImmediate || isMonthlyExtend ? null : {
            date: new Date().toISOString().split('T')[0],
            notified: false
          },
          editable: false
        });
        if (isImmediate) {
          transactions.value.unshift({
            id: 'TXN-EXT-' + Date.now(),
            feeIds: [feeId],
            type: 'payment',
            txnType: 'extension_payment',
            amount: feeAmount,
            channel: 'cash',
            channelType: 'offline',
            refNo: 'EXT-' + Date.now(),
            status: 'confirmed',
            receiptImage: null,
            operator: 'Admin',
            createdAt: new Date().toLocaleString(),
            remark: '續租租金立即收款'
          });
        }
        operationRecords.value.unshift({
          title: '延長用車',
          content: `${formatDate(oldReturnTime)} -> ${formatDate(newReturnTime)}，續租費用 ¥${formatNumber(feeAmount)}`,
          timestamp: new Date().toLocaleString().replace(/\//g, '-'),
          sortTime: Date.now(),
          operator: '門店管理員 (當前)',
          memo: `${isMonthlyExtend ? '企業月結' : isImmediate ? '立即收款' : '還車時結算'}；${extendData.remarks || '客戶申請延長'}`,
          color: '#E6A23C'
        });
        feedback.ElMessage.success({
          message: isMonthlyExtend ? '延長用車成功，續租費用將進入企業月結賬單。' : isImmediate ? '延長用車成功，續租費用已收款。' : '延長用車成功，續租費用將在還車時結算。',
          type: 'success',
          duration: 3000
        });
        extendModalVisible.value = false;
      }, 1000);
    };
    const pickupModalVisible = ref(false);
    const pickupStep = ref(0);
    const processing = ref(false);
    const pickupPreviousStatus = ref('reserved');
    const pickupInterrupted = ref(false);
    const pickupLock = reactive({
      operator: 'Admin',
      startedAt: '',
      expiresAt: ''
    });
    const pickupData = reactive({
      driverName: orderView.customer.name,
      driverId: orderView.customer.memberNo,
      driverPhone: orderView.customer.phone,
      licenseExp: '2028-12-31',
      isPersonMatched: false,
      marketingPlanId: orderView.clientType === 'corporate' ? 'corp' : 'student',
      promoQualificationStatus: 'pending',
      promoQualificationReason: '',
      replacementPromoId: '',
      marketingChangeApplied: false,
      qualificationFiles: [{
        index: 1,
        uploaded: true
      }, {
        index: 2,
        uploaded: false
      }, {
        index: 3,
        uploaded: false
      }],
      signed: false,
      agreed: false,
      depositPaid: false,
      paymentMethod: 'offline',
      paymentConfirmed: false,
      mileage: getTelematicsMetricValue('pickup', 'mileage', 12450),
      fuel: getTelematicsMetricValue('pickup', 'fuel', 8),
      deliveryLocation: '門市交付區 A1',
      pickupTime: new Date(),
      remarks: '',
      checklist: []
    });
    const formatPickupLockTime = date => {
      return date.toLocaleString('zh-CN', {
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
    };
    const startPickupLock = () => {
      const now = new Date();
      const expiresAt = new Date(now.getTime() + 30 * 60 * 1000);
      pickupLock.startedAt = formatPickupLockTime(now);
      pickupLock.expiresAt = formatPickupLockTime(expiresAt);
      pickupInterrupted.value = false;
    };
    const returnModalVisible = ref(false);
    const returnStep = ref(0);
    const returnPreviousStatus = ref('renting');
    const returnInspectionSubmitted = ref(false);
    const returnData = reactive({
      returnTime: new Date(new Date().setDate(new Date().getDate() + 5) + 7200000),
      mileage: getTelematicsMetricValue('return', 'mileage', 13600),
      fuel: getTelematicsMetricValue('return', 'fuel', 6),
      returnStore: 'store_current',
      remarks: '',
      parking: {
        station: 'banqiao_b1',
        floor: '',
        spot: '',
        photo: null
      },
      extraFees: [{
        name: '深度清潔費',
        amount: 300,
        type: 'charge',
        desc: '車內有異味 (人工添加)'
      }, {
        name: '外觀修復費',
        amount: 1500,
        type: 'charge',
        desc: '右前門刮痕 (人工添加)'
      }],
      newFeeName: '',
      newFeeAmount: ''
    });
    const returnStores = [{
      id: 'store_current',
      name: '新北總店',
      address: '新北市中正區中正路10號',
      diffFee: 0,
      dealerId: 'dealer_north',
      dealerName: '北區合作車行'
    }, {
      id: 'store_taipei',
      name: '臺北車站店',
      address: '臺北市中正區忠孝西路1號',
      diffFee: 300,
      dealerId: 'dealer_north',
      dealerName: '北區合作車行'
    }, {
      id: 'store_airport',
      name: '桃園機場店',
      address: '桃園機場航站南路9號',
      diffFee: 500,
      dealerId: 'dealer_airport',
      dealerName: '機場合作車行'
    }];
    const returnStationMap = {
      store_current: [{
        id: 'banqiao_b1',
        name: '新北總店 B1 交車區',
        address: '新北總店地下 B1，A 區'
      }, {
        id: 'banqiao_p3',
        name: '新北總店 P3 停放區',
        address: '新北總店後方 P3 停車場'
      }],
      store_taipei: [{
        id: 'taipei_main_b2',
        name: '臺北車站店 B2 停放區',
        address: '臺北車站店地下 B2，C 區'
      }, {
        id: 'taipei_main_outdoor',
        name: '臺北車站店戶外整備區',
        address: '臺北車站店後場整備區'
      }],
      store_airport: [{
        id: 'airport_p1',
        name: '桃園機場店 P1 自助區',
        address: '桃園機場店 P1 車位區'
      }, {
        id: 'airport_service',
        name: '桃園機場店服務交車區',
        address: '桃園機場店櫃檯旁交車區'
      }]
    };
    const returnStoreDiffFeeMatrix = {
      store_current__store_taipei: 300,
      store_taipei__store_current: 300,
      store_current__store_airport: 500,
      store_airport__store_current: 500,
      store_taipei__store_airport: 450,
      store_airport__store_taipei: 450
    };
    const getReturnStoreById = storeId => returnStores.find(item => item.id === storeId);
    const getReturnStoreIdFromLocation = locationText => {
      const {
        storeName
      } = splitStoreAddress(locationText);
      const matchedStore = returnStores.find(store => store.name === storeName || storeName.includes(store.name) || store.name.includes(storeName));
      return matchedStore ? matchedStore.id : 'store_current';
    };
    returnData.returnStore = getReturnStoreIdFromLocation(orderView.location.return);
    returnData.parking.station = returnStationMap[returnData.returnStore]?.[0]?.id || '';
    const originalReturnStoreId = ref(returnData.returnStore);
    const pickupStoreName = computed(() => splitStoreAddress(orderView.location.pickup).storeName);
    const currentReturnStoreName = computed(() => getReturnStoreLabel(returnData.returnStore));
    const getReturnStoreDiffFee = storeId => {
      const store = getReturnStoreById(storeId);
      if (!store || store.name === pickupStoreName.value) return 0;
      const pickupStoreId = getReturnStoreIdFromLocation(orderView.location.pickup);
      const routeFee = returnStoreDiffFeeMatrix[`${pickupStoreId}__${storeId}`];
      if (routeFee !== undefined) return routeFee;
      return store.diffFee !== undefined ? store.diffFee : planData.diffLocationFee;
    };
    const returnStoreCurrentFee = computed(() => getReturnStoreDiffFee(returnData.returnStore));
    const returnStoreDeltaFee = computed(() => returnStoreCurrentFee.value - getReturnStoreDiffFee(originalReturnStoreId.value));
    const returnStations = computed(() => returnStationMap[returnData.returnStore] || []);
    const plannedReturnStationId = ref(orderView.location.returnStationId || returnStationMap[returnData.returnStore]?.[0]?.id || '');
    const handleReturnStoreChange = () => {
      const firstStation = returnStations.value[0];
      returnData.parking.station = firstStation ? firstStation.id : '';
      if (!plannedReturnStationId.value || !returnStations.value.some(item => item.id === plannedReturnStationId.value)) {
        plannedReturnStationId.value = firstStation ? firstStation.id : '';
      }
    };
    const getReturnStoreLabel = storeId => {
      const store = returnStores.find(item => item.id === storeId);
      return store ? store.name : '-';
    };
    const getReturnStationLabel = (stationId, storeId = returnData.returnStore) => {
      const station = (returnStationMap[storeId] || []).find(item => item.id === stationId);
      return station ? station.name : '-';
    };
    const currentReturnStationName = computed(() => getReturnStationLabel(plannedReturnStationId.value, returnData.returnStore));
    const hasReturnStationSnapshot = computed(() => {
      return returnInspectionSubmitted.value || returnSettlementStatuses.includes(orderStatus.value) || orderStatus.value === 'completed';
    });
    const returnLocationDisplay = computed(() => {
      const stationName = hasReturnStationSnapshot.value ? getReturnStationLabel(returnData.parking.station, returnData.returnStore) : isSelfServiceOrder.value ? currentReturnStationName.value : '';
      return formatStoreStationAddress(orderView.location.return, stationName);
    });
    const returnStoreChangeDialogVisible = ref(false);
    const returnStoreChangeReasons = [{
      value: 'customer_request',
      label: '客戶要求改還車門市'
    }, {
      value: 'store_negotiation',
      label: '門店協商改還車門市'
    }, {
      value: 'vehicle_reflow',
      label: '車輛迴流安排'
    }, {
      value: 'store_unavailable',
      label: '原還車門市無法接收'
    }, {
      value: 'accident_exception',
      label: '事故/異常處理需要'
    }, {
      value: 'other',
      label: '其他'
    }];
    const returnStoreChangeData = reactive({
      newStoreId: '',
      reason: 'customer_request',
      remark: ''
    });
    const currentReturnDealerId = computed(() => getReturnStoreById(returnData.returnStore)?.dealerId || 'dealer_north');
    const returnStoreTransferOptions = computed(() => returnStores.filter(store => store.id !== returnData.returnStore && store.dealerId === currentReturnDealerId.value));
    const returnStoreNewFee = computed(() => returnStoreChangeData.newStoreId ? getReturnStoreDiffFee(returnStoreChangeData.newStoreId) : returnStoreCurrentFee.value);
    const returnStoreChangeFeeDelta = computed(() => returnStoreNewFee.value - returnStoreCurrentFee.value);
    const returnStoreChangeFeeAbs = computed(() => Math.abs(returnStoreChangeFeeDelta.value));
    const returnStoreConflict = reactive({
      checked: false,
      hasConflict: false,
      resolved: false,
      orderId: 'ZT2405100021',
      pickupTime: '2024/05/10 20:00',
      customerName: '許雅婷',
      status: '已硬鎖定',
      originalStoreName: '',
      targetStoreName: '',
      currentVehicle: '',
      targetVehicle: 'Honda CR-V / RIMO-315'
    });
    const checkReturnStoreScheduleConflict = () => {
      const targetStore = getReturnStoreById(returnStoreChangeData.newStoreId);
      returnStoreConflict.checked = !!targetStore;
      returnStoreConflict.resolved = false;
      returnStoreConflict.originalStoreName = currentReturnStoreName.value;
      returnStoreConflict.targetStoreName = targetStore ? targetStore.name : '';
      returnStoreConflict.currentVehicle = `${orderView.vehicle.model} / ${orderView.vehicle.plate}`;
      returnStoreConflict.hasConflict = !!targetStore && targetStore.id !== returnData.returnStore && returnData.returnStore === 'store_current' && orderView.vehicle.plate !== '未分配';
    };
    const openReturnStoreChangeDialog = () => {
      if (!canChangeReturnStore.value) {
        feedback.ElMessage.warning('當前訂單狀態不可改還車門市');
        return;
      }
      returnStoreChangeData.newStoreId = returnStoreTransferOptions.value[0]?.id || '';
      returnStoreChangeData.reason = 'customer_request';
      returnStoreChangeData.remark = '';
      checkReturnStoreScheduleConflict();
      returnStoreChangeDialogVisible.value = true;
    };
    const quickRedirectReturnStoreConflict = () => {
      if (!returnStoreConflict.hasConflict || returnStoreConflict.resolved) return;
      const loading = feedback.ElLoading.service({
        text: '正在改派後續訂單...'
      });
      window.setTimeout(() => {
        loading.close();
        returnStoreConflict.resolved = true;
        operationRecords.value.unshift({
          title: '後續訂單快捷改派',
          content: `${returnStoreConflict.orderId} 由 ${returnStoreConflict.currentVehicle} 改派至 ${returnStoreConflict.targetVehicle}，釋放原還車門市後續佔用`,
          timestamp: new Date().toLocaleString(),
          sortTime: Date.now(),
          operator: '門店管理員 (當前)',
          memo: '改還車門市前處理原還車門市後續預約衝突',
          color: '#E6A23C'
        });
        feedback.ElMessage.success(`後續訂單 ${returnStoreConflict.orderId} 已快捷改派`);
      }, 900);
    };
    const confirmReturnStoreChange = () => {
      const targetStore = getReturnStoreById(returnStoreChangeData.newStoreId);
      if (!targetStore) {
        feedback.ElMessage.warning('請選擇新還車門市');
        return;
      }
      if (targetStore.dealerId !== currentReturnDealerId.value) {
        feedback.ElMessage.warning('本期不支持跨車行轉單');
        return;
      }
      if (returnStoreChangeData.reason === 'other' && !returnStoreChangeData.remark.trim()) {
        feedback.ElMessage.warning('選擇其他原因時必須填寫備註');
        return;
      }
      if (returnStoreConflict.hasConflict && !returnStoreConflict.resolved) {
        feedback.ElMessage.warning('請先處理原還車門市後續預約衝突');
        return;
      }
      const oldStoreName = currentReturnStoreName.value;
      const reasonText = returnStoreChangeReasons.find(item => item.value === returnStoreChangeData.reason)?.label || '-';
      const delta = returnStoreChangeFeeDelta.value;
      orderView.location.return = `${targetStore.name} - ${targetStore.address}`;
      returnData.returnStore = targetStore.id;
      handleReturnStoreChange();
      orderView.locationStatus.returnStore = 'normal';
      operationRecords.value.unshift({
        title: '改還車門市',
        content: `${oldStoreName} -> ${targetStore.name}，調度費差額 ${delta >= 0 ? '+' : '-'}¥${formatNumber(Math.abs(delta))}`,
        timestamp: new Date().toLocaleString(),
        sortTime: Date.now(),
        operator: '門店管理員 (當前)',
        memo: returnStoreChangeData.remark || reasonText,
        color: '#409EFF'
      });
      returnStoreChangeDialogVisible.value = false;
      feedback.ElMessage.success('還車門市已更新，新門市可辦理還車');
    };
    const returnStationChangeDialogVisible = ref(false);
    const returnStationChangeData = reactive({
      path: [],
      reason: 'customer_request',
      remark: ''
    });
    const returnStationTransferOptions = computed(() => returnStores.filter(store => store.dealerId === currentReturnDealerId.value).map(store => ({
      value: store.id,
      label: store.name,
      children: (returnStationMap[store.id] || []).map(station => ({
        value: station.id,
        label: station.name
      }))
    })));
    const returnStationConflict = reactive({
      checked: false,
      hasConflict: false,
      resolved: false,
      orderId: 'ZT2405100021',
      pickupTime: '2024/05/10 20:00',
      customerName: '許雅婷',
      status: '已硬鎖定',
      originalStoreName: '',
      targetStoreName: '',
      targetStationName: '',
      currentVehicle: '',
      targetVehicle: 'Honda CR-V / RIMO-315'
    });
    const checkReturnStationScheduleConflict = () => {
      const [targetStoreId] = returnStationChangeData.path || [];
      const targetStore = getReturnStoreById(targetStoreId);
      const targetStationName = targetStore && returnStationChangeData.path?.[1] ? getReturnStationLabel(returnStationChangeData.path[1], targetStoreId) : '';
      returnStationConflict.checked = !!targetStore;
      returnStationConflict.resolved = false;
      returnStationConflict.originalStoreName = currentReturnStoreName.value;
      returnStationConflict.targetStoreName = targetStore ? targetStore.name : '';
      returnStationConflict.targetStationName = targetStationName;
      returnStationConflict.currentVehicle = `${orderView.vehicle.model} / ${orderView.vehicle.plate}`;
      returnStationConflict.hasConflict = !!targetStore && targetStore.id !== returnData.returnStore && returnData.returnStore === 'store_current' && orderView.vehicle.plate !== '未分配';
    };
    const openReturnStationChangeDialog = () => {
      if (!canChangeReturnStation.value) {
        feedback.ElMessage.warning('當前訂單狀態不可改還車據點');
        return;
      }
      returnStationChangeData.path = plannedReturnStationId.value ? [returnData.returnStore, plannedReturnStationId.value] : returnStationTransferOptions.value[0]?.children?.[0] ? [returnStationTransferOptions.value[0].value, returnStationTransferOptions.value[0].children[0].value] : [];
      returnStationChangeData.reason = 'customer_request';
      returnStationChangeData.remark = '';
      checkReturnStationScheduleConflict();
      returnStationChangeDialogVisible.value = true;
    };
    const quickRedirectReturnStationConflict = () => {
      if (!returnStationConflict.hasConflict || returnStationConflict.resolved) return;
      const loading = feedback.ElLoading.service({
        text: '正在改派後續訂單...'
      });
      window.setTimeout(() => {
        loading.close();
        returnStationConflict.resolved = true;
        operationRecords.value.unshift({
          title: '後續訂單快捷改派',
          content: `${returnStationConflict.orderId} 由 ${returnStationConflict.currentVehicle} 改派至 ${returnStationConflict.targetVehicle}，釋放原還車門市後續佔用`,
          timestamp: new Date().toLocaleString(),
          sortTime: Date.now(),
          operator: '門店管理員 (當前)',
          memo: '改還車據點前處理原還車門市後續預約衝突',
          color: '#E6A23C'
        });
        feedback.ElMessage.success(`後續訂單 ${returnStationConflict.orderId} 已快捷改派`);
      }, 900);
    };
    const confirmReturnStationChange = () => {
      const [targetStoreId, targetStationId] = returnStationChangeData.path || [];
      const targetStore = getReturnStoreById(targetStoreId);
      if (!targetStore || !targetStationId) {
        feedback.ElMessage.warning('請選擇新還車據點');
        return;
      }
      if (targetStore.dealerId !== currentReturnDealerId.value) {
        feedback.ElMessage.warning('本期不支持跨車行轉單');
        return;
      }
      if (returnStationChangeData.reason === 'other' && !returnStationChangeData.remark.trim()) {
        feedback.ElMessage.warning('選擇其他原因時必須填寫備註');
        return;
      }
      if (returnStationConflict.hasConflict && !returnStationConflict.resolved) {
        feedback.ElMessage.warning('請先處理原還車門市後續預約衝突');
        return;
      }
      const oldStoreName = currentReturnStoreName.value;
      const oldStationName = currentReturnStationName.value || '-';
      const newStationName = getReturnStationLabel(targetStationId, targetStoreId);
      const reasonText = returnStoreChangeReasons.find(item => item.value === returnStationChangeData.reason)?.label?.replace('門市', '據點') || '-';
      const oldFee = getReturnStoreDiffFee(returnData.returnStore);
      const newFee = getReturnStoreDiffFee(targetStoreId);
      const delta = newFee - oldFee;
      orderView.location.return = `${targetStore.name} - ${targetStore.address}`;
      orderView.location.returnStationName = newStationName;
      orderView.location.returnStationId = targetStationId;
      returnData.returnStore = targetStoreId;
      plannedReturnStationId.value = targetStationId;
      orderView.locationStatus.returnStore = 'normal';
      orderView.locationStatus.returnStation = 'normal';
      operationRecords.value.unshift({
        title: '改還車據點',
        content: `${oldStoreName} / ${oldStationName} -> ${targetStore.name} / ${newStationName}，調度費差額 ${delta >= 0 ? '+' : '-'}¥${formatNumber(Math.abs(delta))}`,
        timestamp: new Date().toLocaleString(),
        sortTime: Date.now(),
        operator: '門店管理員 (當前)',
        memo: returnStationChangeData.remark || reasonText,
        color: '#409EFF'
      });
      returnStationChangeDialogVisible.value = false;
      feedback.ElMessage.success('還車據點已更新，請聯繫客服繼續處理');
    };
    const returnDamagePhotos = ref([]);
    const returnSignatureStatus = ref('initial');
    const returnSignatureTime = ref('');
    const damageDialogContext = ref('pickup');
    const openDamageDialog = (context = 'pickup') => {
      if (typeof context !== 'string') context = 'pickup';
      damageDialogContext.value = context;
      showDamageTypeDialog.value = true;
      newDamage.category = 'exterior';
      newDamage.type = '';
    };
    const requestReturnSignature = () => {
      returnSignatureStatus.value = 'pushed';
    };
    const confirmReturnSignature = () => {
      returnSignatureStatus.value = 'signed';
      returnSignatureTime.value = new Date().toLocaleString();
    };
    const feeConfig = {
      baseRent: {
        name: '訂單租金 (5天)',
        amount: orderView.amount,
        type: 'charge',
        desc: '原訂單租金'
      },
      overtime: {
        name: '超時費',
        amount: 0,
        type: 'charge',
        desc: '未觸發'
      },
      earlyRefund: {
        name: '提前還車退費',
        amount: 0,
        type: 'refund',
        desc: '未觸發'
      },
      mileage: {
        name: '超里程費',
        amount: 0,
        type: 'charge',
        desc: '未觸發'
      },
      fuel: {
        name: '油費補差',
        amount: 0,
        type: 'charge',
        desc: '未觸發'
      },
      diffLocation: {
        name: '異地還車費',
        amount: 0,
        type: 'charge',
        desc: '未觸發'
      }
    };
    const planData = {
      returnTime: new Date(new Date().setDate(new Date().getDate() + 5)),
      mileageLimit: 13500,
      dailyRate: Math.round(orderView.amount / 5),
      hourlyRate: 50,
      fuelPrice: 8.5,
      mileagePrice: 5.0,
      diffLocationFee: 300
    };
    const returnPaymentRecords = ref([]);
    const returnRefundDialogVisible = ref(false);
    const selectedReturnRefundChannel = ref('');
    const returnFees = computed(() => {
      let fees = [];
      let total = isMonthlyBilling.value ? paymentData.orderTotal : 0;
      fees.push({
        ...feeConfig.baseRent,
        amount: paymentData.orderTotal,
        desc: isMonthlyBilling.value ? '企業月結基礎租金，隨還車最終應收掛賬' : '取車階段已結清，不參與還車差額',
        settledAtPickup: !isMonthlyBilling.value
      });
      const diffHours = (new Date(returnData.returnTime) - planData.returnTime) / 3600000;
      if (diffHours > 0.5) {
        const billableHours = Math.ceil(diffHours);
        const amount = Math.min(billableHours * planData.hourlyRate, 500) + 100;
        fees.push({
          ...feeConfig.overtime,
          amount: amount,
          desc: `超時 ${billableHours} 小時，含超時罰款`
        });
        total += amount;
      } else if (diffHours < -24) {
        const daysEarly = Math.floor(Math.abs(diffHours) / 24);
        if (daysEarly > 0) {
          const amount = -(daysEarly * planData.dailyRate);
          fees.push({
            ...feeConfig.earlyRefund,
            amount: amount,
            desc: `提前 ${daysEarly} 天`
          });
          total += amount;
        }
      } else {
        fees.push(feeConfig.overtime);
        fees.push(feeConfig.earlyRefund);
      }
      if (returnData.mileage > planData.mileageLimit) {
        const amount = (returnData.mileage - planData.mileageLimit) * planData.mileagePrice;
        fees.push({
          ...feeConfig.mileage,
          amount: amount,
          desc: `${returnData.mileage - planData.mileageLimit} km`
        });
        total += amount;
      } else {
        fees.push(feeConfig.mileage);
      }
      if (returnData.fuel < 8) {
        const amount = Math.round((8 - returnData.fuel) * 60 * 0.125 * planData.fuelPrice);
        fees.push({
          ...feeConfig.fuel,
          amount: amount,
          desc: `缺油 ${8 - returnData.fuel} 格`
        });
        total += amount;
      } else {
        fees.push(feeConfig.fuel);
      }
      const store = getReturnStoreById(returnData.returnStore);
      const diffFeeDelta = returnStoreDeltaFee.value;
      if (store && diffFeeDelta !== 0) {
        fees.push({
          ...feeConfig.diffLocation,
          amount: diffFeeDelta,
          type: diffFeeDelta > 0 ? 'charge' : 'refund',
          desc: `${pickupStoreName.value} -> ${store.name}`
        });
        total += diffFeeDelta;
      } else {
        fees.push(feeConfig.diffLocation);
      }
      feeItems.value.filter(f => f.phase === 'rental').filter(f => !['rental', 'deposit'].includes(f.type)).filter(f => ['pending', 'partial', 'monthly_billing'].includes(f.status)).filter(f => f.amount - (f.paidAmount || 0) !== 0).forEach(f => {
        const pendingAmount = f.amount - (f.paidAmount || 0);
        fees.push({
          name: f.name,
          amount: pendingAmount,
          type: pendingAmount >= 0 ? 'charge' : 'refund',
          desc: f.description || '租期費用'
        });
        total += pendingAmount;
      });
      returnData.extraFees.forEach(f => {
        fees.push({
          name: f.name,
          amount: f.amount,
          type: 'charge',
          desc: '人工添加'
        });
        total += f.amount;
      });
      let generalPaymentPool = returnPaymentRecords.value.filter(p => p.type === 'payment' || p.type === 'settlement').reduce((sum, p) => sum + p.amount, 0);
      const waivers = returnPaymentRecords.value.filter(p => p.type === 'waiver');
      fees = fees.map(item => {
        let paid = 0;
        let itemOutstanding = item.amount;
        const itemWaivers = waivers.filter(w => w.targetItemName === item.name).reduce((sum, w) => sum + Math.abs(w.amount), 0);
        paid += itemWaivers;
        itemOutstanding -= itemWaivers;
        if (item.settledAtPickup) {
          paid = item.amount;
          itemOutstanding = 0;
        }
        if (itemOutstanding > 0 && generalPaymentPool > 0) {
          const allocate = Math.min(itemOutstanding, generalPaymentPool);
          paid += allocate;
          generalPaymentPool -= allocate;
        }
        return {
          ...item,
          paid: paid
        };
      });
      return {
        items: fees,
        total: total
      };
    });
    const waiveDialogVisible = ref(false);
    const waiveData = reactive({
      itemName: '',
      amount: 0,
      maxAmount: 0,
      reason: '',
      remark: '',
      feeItem: null
    });
    const openWaiveDialog = feeItem => {
      const outstanding = feeItem.amount - (feeItem.paid || 0);
      waiveData.itemName = feeItem.name;
      waiveData.amount = outstanding;
      waiveData.maxAmount = outstanding;
      waiveData.reason = '';
      waiveData.remark = '';
      waiveData.feeItem = feeItem;
      waiveDialogVisible.value = true;
    };
    const confirmWaive = () => {
      returnPaymentRecords.value.push({
        type: 'waiver',
        channel: '人工減免',
        amount: -waiveData.amount,
        time: new Date().toLocaleString(),
        refNo: 'WAIVE-' + Date.now().toString().slice(-6),
        remark: `${waiveData.reason} - ${waiveData.remark}`,
        targetItemName: waiveData.itemName
      });
      waiveDialogVisible.value = false;
      feedback.ElMessage.success('費用減免已批准');
    };
    const returnSettlementRecords = computed(() => {
      return [...returnPaymentRecords.value].reverse();
    });
    const showAddFeeDialog = ref(false);
    const returnFeeForm = reactive({
      type: '',
      customName: '',
      amount: 0,
      description: ''
    });
    const openAddFeeDialog = () => {
      returnFeeForm.type = '';
      returnFeeForm.customName = '';
      returnFeeForm.amount = 0;
      returnFeeForm.description = '';
      showAddFeeDialog.value = true;
    };
    const confirmAddFees = () => {
      const feeTypeObj = manualFeeTypes.find(t => t.value === returnFeeForm.type);
      const feeName = returnFeeForm.type === 'other' ? returnFeeForm.customName : feeTypeObj ? feeTypeObj.label : '';
      if (!feeName || !returnFeeForm.amount) {
        feedback.ElMessage.warning('請完善費用信息');
        return;
      }
      returnData.extraFees.push({
        name: feeName,
        amount: returnFeeForm.amount,
        type: 'charge',
        desc: returnFeeForm.description || '人工添加'
      });
      feedback.ElMessage.success('費用添加成功');
      showAddFeeDialog.value = false;
    };
    const removeExtraFee = index => {
      returnData.extraFees.splice(index, 1);
    };
    const returnBalanceDue = computed(() => {
      if (!returnFees.value) return 0;
      if (isMonthlyBilling.value) return 0;
      const totalPaid = returnPaymentRecords.value.filter(p => p.type === 'payment' || p.type === 'settlement').reduce((sum, p) => sum + p.amount, 0);
      const totalWaived = returnPaymentRecords.value.filter(p => p.type === 'waiver').reduce((sum, p) => sum + Math.abs(p.amount), 0);
      const totalRefunded = returnPaymentRecords.value.filter(p => p.type === 'refund').reduce((sum, p) => sum + Math.abs(p.amount), 0);
      return returnFees.value.total - totalPaid - totalWaived + totalRefunded;
    });
    const returnHandledAmount = computed(() => {
      return returnPaymentRecords.value.reduce((sum, record) => {
        if (record.type === 'payment' || record.type === 'settlement') return sum + record.amount;
        if (record.type === 'waiver') return sum + Math.abs(record.amount);
        if (record.type === 'refund') return sum - Math.abs(record.amount);
        return sum;
      }, 0);
    });
    const monthlyReturnBillAmount = computed(() => {
      if (!isMonthlyBilling.value || !returnFees.value) return 0;
      const totalWaived = returnPaymentRecords.value.filter(p => p.type === 'waiver').reduce((sum, p) => sum + Math.abs(p.amount), 0);
      return Math.max(0, returnFees.value.total - totalWaived);
    });
    const returnRefundAmount = computed(() => Math.max(0, -returnBalanceDue.value));
    const returnOriginalPaymentChannels = computed(() => {
      const returnPayments = returnPaymentRecords.value.filter(p => (p.type === 'payment' || p.type === 'settlement') && p.amount > 0).map((p, index) => ({
        id: `return-${index}`,
        channel: p.channel,
        amount: p.amount,
        refNo: p.refNo,
        time: p.time
      }));
      const orderPayments = paymentData.receivedPayments.filter(p => p.amount > 0 && (p.type === 'payment' || p.type === 'pre_auth' && p.status === 'captured')).map((p, index) => ({
        id: `order-${index}`,
        channel: p.channel,
        amount: p.amount,
        refNo: p.refNo,
        time: p.time
      }));
      return returnPayments.length > 0 ? returnPayments : orderPayments;
    });
    const resetReturnPaymentRecords = () => {
      returnPaymentRecords.value = [];
    };
    const prepareReturnDemoScenario = () => {
      resetReturnPaymentRecords();
      if (orderStatus.value === 'refund_pending') {
        returnData.returnTime = new Date(planData.returnTime.getTime() - 48 * 3600000);
        returnData.mileage = 13000;
        returnData.fuel = 8;
        returnData.returnStore = getReturnStoreIdFromLocation(orderView.location.return);
        handleReturnStoreChange();
        returnData.extraFees = [];
      } else if (orderStatus.value === 'payment_due') {
        returnData.returnTime = new Date(planData.returnTime.getTime() + 2 * 3600000);
        returnData.mileage = 13600;
        returnData.fuel = 6;
        returnData.returnStore = getReturnStoreIdFromLocation(orderView.location.return);
        handleReturnStoreChange();
        returnData.extraFees = [{
          name: '深度清潔費',
          amount: 300,
          type: 'charge',
          desc: '車內有異味 (人工添加)'
        }, {
          name: '外觀修復費',
          amount: 1500,
          type: 'charge',
          desc: '右前門刮痕 (人工添加)'
        }];
      }
    };
    const openReturnPaymentDialog = (type = 'online') => {
      if (isMonthlyBilling.value) {
        feedback.ElMessage.info('企業月結訂單不需要客戶補繳');
        return;
      }
      paymentDialogType.value = type;
      newPayment.gateway = type === 'online' ? 'jiekou' : 'cash';
      newPayment.amount = Math.abs(returnBalanceDue.value);
      newPayment.refNo = '';
      newPayment.processing = false;
      newPayment.context = 'return';
      paymentDialogVisible.value = true;
    };
    const openReturnRefundDialog = () => {
      if (isMonthlyBilling.value) {
        feedback.ElMessage.info('企業月結訂單不處理門店退款');
        return;
      }
      if (returnRefundAmount.value <= 0) {
        feedback.ElMessage.warning('當前沒有可退款金額');
        return;
      }
      selectedReturnRefundChannel.value = returnOriginalPaymentChannels.value[0]?.id || '';
      returnRefundDialogVisible.value = true;
    };
    const confirmReturnRefund = () => {
      if (!selectedReturnRefundChannel.value || returnRefundAmount.value <= 0) {
        feedback.ElMessage.warning('請確認原支付渠道');
        return;
      }
      const channel = returnOriginalPaymentChannels.value.find(item => item.id === selectedReturnRefundChannel.value);
      if (!channel) {
        feedback.ElMessage.warning('未找到原支付渠道');
        return;
      }
      returnPaymentRecords.value.push({
        type: 'refund',
        channel: channel.channel,
        amount: -returnRefundAmount.value,
        refNo: 'RF' + Date.now().toString().slice(-8),
        time: new Date().toLocaleTimeString(),
        remark: `原路退回 · 原交易 ${channel.refNo || '-'}`
      });
      returnRefundDialogVisible.value = false;
      feedback.ElMessage.success('原路退款已確認');
    };
    const applyReturnSettlementStatus = () => {
      if (isMonthlyBilling.value) {
        orderStatus.value = 'settlement_pending';
      } else if (returnBalanceDue.value > 0) {
        orderStatus.value = 'payment_due';
      } else if (returnBalanceDue.value < 0) {
        orderStatus.value = 'refund_pending';
      } else {
        orderStatus.value = 'settlement_pending';
      }
    };
    const ensureMonthlyReturnBillRecord = () => {
      if (!isMonthlyBilling.value) return;
      if (returnPaymentRecords.value.some(record => record.type === 'monthly_bill')) return;
      returnPaymentRecords.value.push({
        type: 'monthly_bill',
        channel: '企業月結掛賬',
        amount: monthlyReturnBillAmount.value,
        refNo: 'BILL-RET-' + Date.now().toString().slice(-8),
        time: new Date().toLocaleString(),
        remark: `${paymentData.monthlyCompany} · 還車最終應收`
      });
    };
    const openReturnModal = () => {
      if (!canReturn.value) {
        feedback.ElMessage.warning('當前訂單狀態不可辦理還車');
        return;
      }
      returnPreviousStatus.value = orderStatus.value;
      returnInspectionSubmitted.value = returnSettlementStatuses.includes(orderStatus.value);
      if (returnInspectionSubmitted.value) {
        prepareReturnDemoScenario();
      }
      returnStep.value = returnInspectionSubmitted.value ? 1 : 0;
      returnModalVisible.value = true;
    };
    const requestCloseReturnModal = () => {
      if (returnStep.value === 2) {
        returnModalVisible.value = false;
        return;
      }
      if (returnStep.value === 0 && !returnInspectionSubmitted.value) {
        orderStatus.value = returnPreviousStatus.value;
        returnModalVisible.value = false;
        feedback.ElMessage.info('還車草稿已保留，訂單仍保持用車狀態');
        return;
      }
      applyReturnSettlementStatus();
      returnModalVisible.value = false;
      feedback.ElMessage.info('結算已暫存，訂單狀態已更新');
    };
    const handleReturnDialogClose = done => {
      if (returnStep.value === 2) {
        done();
        return;
      }
      feedback.ElMessageBox.confirm(returnStep.value === 0 && !returnInspectionSubmitted.value ? '關閉窗口後，訂單仍保持當前用車狀態，還車草稿會保留。' : isMonthlyBilling.value ? '關閉窗口後，訂單會進入待結算，後續繼續確認企業月結。' : '關閉窗口後，系統會按當前待結金額更新爲待補繳、待退款或待結算。', '暫停還車辦理', {
        confirmButtonText: '保存並關閉',
        cancelButtonText: '繼續辦理',
        type: 'warning'
      }).then(() => {
        requestCloseReturnModal();
        done();
      }).catch(() => {});
    };
    const nextReturnStep = () => {
      if (returnStep.value === 1) {
        if (returnBalanceDue.value !== 0) {
          feedback.ElMessage.warning('請先完成費用結算');
          return;
        }
        ensureMonthlyReturnBillRecord();
        orderStatus.value = 'completed';
        returnStep.value++;
        feedback.ElMessage.success(isMonthlyBilling.value ? '還車成功，費用已進入企業月結賬單！' : '還車成功！');
      } else if (returnStep.value === 2) {
        returnModalVisible.value = false;
      } else {
        if (returnData.mileage < pickupData.mileage) {
          feedback.ElMessage.warning('還車里程不能小於取車里程');
          return;
        }
        if (!returnData.parking.station) {
          feedback.ElMessage.warning('請選擇車輛最終停放的歸還據點');
          return;
        }
        if (returnSignatureStatus.value !== 'signed') {
          feedback.ElMessage.warning('請先完成客戶還車簽字確認');
          return;
        }
        orderStatus.value = 'settlement_pending';
        returnInspectionSubmitted.value = true;
        returnStep.value++;
      }
    };
    const showRedirectionHistory = ref(false);
    const redirectionHistory = ref([{
      id: 1,
      time: '2026-01-28 10:30',
      fromVehicle: 'Toyota Vios (DEF-5678)',
      toVehicle: 'Toyota Corolla Altis (ABC-1234)',
      priceChange: 300,
      priceHandling: 'diff',
      settlementText: '取車補收',
      reason: '客戶要求升級車型',
      operator: 'Admin'
    }, {
      id: 2,
      time: '2026-01-28 09:15',
      fromVehicle: '系統自動分配',
      toVehicle: 'Toyota Vios (DEF-5678)',
      priceChange: 0,
      priceHandling: 'diff',
      settlementText: '不調整費用',
      reason: '初始車輛分配',
      operator: '系統'
    }]);
    const invoiceRecords = ref([{
      id: 1,
      invoiceNo: 'INV-20260128-0001',
      type: 'normal',
      issueTime: '2026-01-28 14:30:00',
      amount: 1920,
      status: 'issued',
      items: [{
        name: '車輛租金',
        amount: 1920
      }],
      showDetails: false
    }, {
      id: 2,
      invoiceNo: 'INV-20260128-0002',
      type: 'special',
      issueTime: '2026-01-28 15:00:00',
      amount: 300,
      status: 'issued',
      items: [{
        name: '安心保障險',
        amount: 150
      }, {
        name: '安全座椅 x2',
        amount: 100
      }, {
        name: '座椅靠墊',
        amount: 30
      }, {
        name: 'GPS導航儀',
        amount: 20
      }],
      showDetails: false
    }, {
      id: 3,
      invoiceNo: 'INV-20260130-0003',
      type: 'normal',
      issueTime: '2026-01-30 10:00:00',
      amount: 200,
      status: 'pending',
      items: [{
        name: '超時還車費',
        amount: 150
      }, {
        name: '燃油補差',
        amount: 50
      }],
      showDetails: false
    }]);
    const signatureStatus = ref('idle');
    const signatureSource = ref('');
    const signatureTime = ref('');
    const pushSignatureToApp = () => {
      signatureStatus.value = 'pushing';
      window.setTimeout(() => {
        signatureStatus.value = 'pushed';
        feedback.ElMessage.success('簽名請求已推送至客戶APP');
      }, 1000);
    };
    const fetchAppSignature = () => {
      signatureStatus.value = 'fetching';
      window.setTimeout(() => {
        pickupData.signed = true;
        signatureSource.value = 'app';
        signatureTime.value = new Date().toLocaleTimeString();
        signatureStatus.value = 'idle';
        feedback.ElMessage.success('已成功獲取客戶APP簽名');
      }, 1500);
    };
    const signOnSite = () => {
      pickupData.signed = true;
      signatureSource.value = 'onsite';
      signatureTime.value = new Date().toLocaleTimeString();
      signatureStatus.value = 'idle';
      feedback.ElMessage.success('現場簽名完成');
    };
    const resetSignature = () => {
      pickupData.signed = false;
      signatureSource.value = '';
      signatureTime.value = '';
      signatureStatus.value = 'idle';
    };
    const damagePhotos = ref([]);
    const showDamageTypeDialog = ref(false);
    const damageCategories = [{
      value: 'exterior',
      label: '外觀損傷',
      icon: 'Van'
    }, {
      value: 'interior',
      label: '內飾異常',
      icon: 'Sofa'
    }, {
      value: 'mechanical',
      label: '機械故障',
      icon: 'Setting'
    }, {
      value: 'other',
      label: '其他異常',
      icon: 'Warning'
    }];
    const newDamage = reactive({
      category: 'exterior',
      type: '',
      description: ''
    });
    const confirmAddDamage = () => {
      if (!newDamage.type) {
        feedback.ElMessage.warning('請輸入損傷位置或名稱');
        return;
      }
      const newItem = {
        id: Date.now(),
        category: newDamage.category,
        type: newDamage.type,
        description: '',
        photos: [],
        time: new Date().toLocaleTimeString()
      };
      if (damageDialogContext.value === 'pickup') {
        damagePhotos.value.push(newItem);
      } else {
        returnDamagePhotos.value.push(newItem);
      }
      showDamageTypeDialog.value = false;
      feedback.ElMessage.warning('已添加: ' + newDamage.type);
    };
    const addDamagePhoto = () => {
      openDamageDialog('pickup');
    };
    const removeDamagePhoto = (id, context) => {
      if (!context) context = 'pickup';
      if (context === 'pickup') {
        damagePhotos.value = damagePhotos.value.filter(p => p.id !== id);
      } else {
        returnDamagePhotos.value = returnDamagePhotos.value.filter(p => p.id !== id);
      }
      feedback.ElMessage.info('已移除損傷記錄');
    };
    const bookingPreAuthPercent = 30;
    const bookingPreAuthAmount = isMonthlyBilling.value ? 0 : Math.ceil(orderView.amount * bookingPreAuthPercent / 100);
    const hasBookingPreAuth = !isMonthlyBilling.value && orderView.paymentStatus !== 'unpaid' && orderView.status !== 'pending_payment';
    const hasPickupRentPayment = !isMonthlyBilling.value && ['renting', 'renewing', 'overdue', 'accident_processing', 'settlement_pending', 'payment_due', 'refund_pending', 'completed'].includes(orderStatus.value);
    const initialCustomerPaymentRecords = [];
    if (hasBookingPreAuth) {
      initialCustomerPaymentRecords.push({
        channel: '信用卡預授權押金',
        amount: bookingPreAuthAmount,
        refNo: 'AUTH-8829301',
        time: orderView.createTime + ':00',
        type: 'pre_auth',
        status: 'frozen'
      });
    }
    if (hasPickupRentPayment) {
      initialCustomerPaymentRecords.push({
        channel: '取車租金尾款',
        amount: orderView.amount,
        refNo: 'PAY-PICKUP-' + orderView.orderId.slice(-4),
        time: orderView.schedule.start,
        type: 'payment',
        status: 'confirmed'
      });
    }
    const paymentData = reactive({
      preAuthMode: 'guarantee',
      preAuthStatus: isMonthlyBilling.value ? 'not_required' : hasBookingPreAuth ? 'frozen' : 'pending',
      preAuthAmount: bookingPreAuthAmount,
      orderTotal: orderView.amount,
      monthlyBillAmount: orderView.amount,
      monthlyCompany: orderView.corporate?.name || '企業客戶',
      feeDetails: {
        rental: orderView.amount,
        serviceItems: [{
          name: '安心保障險',
          amount: 150,
          icon: 'Shield'
        }, {
          name: '安全座椅 x2',
          amount: 100,
          icon: 'User'
        }, {
          name: '座椅靠墊',
          amount: 30,
          icon: 'Goods'
        }, {
          name: 'GPS導航儀',
          amount: 20,
          icon: 'Location'
        }],
        discountItems: orderView.clientType === 'corporate' ? [{
          name: '企業資格行銷方案',
          type: 'promo',
          amount: 200,
          code: 'CORP2026'
        }] : [{
          name: '會員行銷優惠方案',
          type: 'promo',
          amount: 200,
          code: 'MEMBER2026'
        }, {
          name: '折扣碼減免',
          type: 'coupon',
          amount: 50,
          code: 'WINTER50'
        }, {
          name: '積分點數抵扣',
          type: 'points',
          amount: 30,
          points: 300
        }]
      },
      receivedPayments: isMonthlyBilling.value ? [{
        channel: '企業月結預計金額',
        amount: orderView.amount,
        refNo: 'BILL-EST-' + orderView.orderId.slice(-4),
        time: orderView.createTime + ':00',
        type: 'monthly_bill',
        status: 'estimated'
      }] : initialCustomerPaymentRecords
    });
    const paymentDialogVisible = ref(false);
    const paymentDialogType = ref('online');
    const newPayment = reactive({
      amount: 0,
      refNo: '',
      processing: false,
      gateway: 'jiekou',
      context: 'pickup'
    });
    const balanceDue = computed(() => {
      if (isMonthlyBilling.value) return 0;
      let due = paymentData.orderTotal;
      paymentData.receivedPayments.forEach(p => {
        if (p.type !== 'pre_auth' && p.type !== 'monthly_bill') {
          due -= p.amount;
        }
      });
      if (paymentData.preAuthMode === 'rent_offset' && paymentData.preAuthStatus === 'captured') {
        due -= Math.min(paymentData.preAuthAmount, paymentData.orderTotal);
      }
      return Math.max(0, due);
    });
    const pickupMarketingPlans = [{
      id: 'student',
      name: '學生專案行銷方案',
      version: 'MKT-STORE-STUDENT-20260420-001',
      qualification: '學生身份',
      scope: '需取車現場覈驗證明文件',
      requiredDocText: '學生證、在學證明等可證明學生身份的文件',
      manualVerification: true,
      orderTotal: orderView.amount,
      discountAmount: 280,
      code: 'STUDENT85'
    }, {
      id: 'corp',
      name: '企業資格行銷方案',
      version: 'MKT-STORE-CORP-20260418-001',
      qualification: '企業員工資格',
      scope: '系統按企業關係判斷',
      manualVerification: false,
      orderTotal: orderView.amount,
      discountAmount: 200,
      code: 'CORP2026'
    }, {
      id: 'member',
      name: '會員行銷方案',
      version: 'MKT-STORE-MEMBER-20260418-001',
      qualification: '個人會員資格',
      scope: '系統按會員方案判斷',
      manualVerification: false,
      orderTotal: orderView.amount + 160,
      discountAmount: 120,
      code: 'MEMBER2026'
    }, {
      id: 'weekday',
      name: '平日行銷方案',
      version: 'MKT-STORE-WEEKDAY-20260412-003',
      qualification: '平日用車條件',
      scope: '系統按用車時間判斷',
      manualVerification: false,
      orderTotal: orderView.amount + 80,
      discountAmount: 200,
      code: 'WEEKDAY200'
    }, {
      id: 'none',
      name: '不使用優惠/默認方案',
      version: 'PRICE-STORE-BASE-20260401-001',
      qualification: '無額外資格要求',
      scope: '按標準價計費',
      manualVerification: false,
      orderTotal: orderView.amount + 280,
      discountAmount: 0,
      code: ''
    }];
    const findPickupMarketingPlan = id => {
      return pickupMarketingPlans.find(plan => plan.id === id) || pickupMarketingPlans[0];
    };
    const currentPickupMarketingPlan = computed(() => findPickupMarketingPlan(pickupData.marketingPlanId));
    const requiresPickupQualification = computed(() => !!currentPickupMarketingPlan.value.manualVerification);
    const uploadedQualificationCount = computed(() => pickupData.qualificationFiles.filter(doc => doc.uploaded).length);
    const qualificationDocsComplete = computed(() => {
      return !requiresPickupQualification.value || uploadedQualificationCount.value > 0;
    });
    const availablePickupReplacementPlans = computed(() => {
      return pickupMarketingPlans.filter(plan => {
        if (plan.id === pickupData.marketingPlanId) return false;
        if (plan.manualVerification) return false;
        if (orderView.clientType === 'corporate') return ['corp', 'none'].includes(plan.id);
        return plan.id !== 'corp';
      });
    });
    const selectedReplacementPickupPlan = computed(() => {
      return pickupData.replacementPromoId ? findPickupMarketingPlan(pickupData.replacementPromoId) : null;
    });
    const qualificationPriceDelta = computed(() => {
      return selectedReplacementPickupPlan.value ? selectedReplacementPickupPlan.value.orderTotal - orderView.amount : 0;
    });
    const qualificationPriceDeltaAbs = computed(() => Math.abs(qualificationPriceDelta.value));
    const canProceedPickupQualification = computed(() => {
      if (!requiresPickupQualification.value) return true;
      if (pickupData.promoQualificationStatus === 'passed') return qualificationDocsComplete.value;
      if (pickupData.promoQualificationStatus === 'failed') return !!selectedReplacementPickupPlan.value;
      return false;
    });
    const syncPickupMarketingAmount = plan => {
      paymentData.orderTotal = plan.orderTotal;
      paymentData.monthlyBillAmount = plan.orderTotal;
      orderView.promotionText = plan.name;
      const nonPromoItems = paymentData.feeDetails.discountItems.filter(item => item.type !== 'promo');
      paymentData.feeDetails.discountItems = plan.discountAmount > 0 ? [{
        name: plan.name,
        type: 'promo',
        amount: plan.discountAmount,
        code: plan.code
      }, ...nonPromoItems] : nonPromoItems;
    };
    const handleQualificationStatusChange = status => {
      if (status === 'passed') {
        pickupData.replacementPromoId = '';
        pickupData.promoQualificationReason = '';
        pickupData.marketingChangeApplied = false;
        syncPickupMarketingAmount(currentPickupMarketingPlan.value);
        feedback.ElMessage.success('行銷方案資格覈驗通過');
      }
      if (status === 'failed') {
        feedback.ElMessage.warning('請更換行銷方案或改爲不使用優惠後繼續');
      }
    };
    const markQualificationFileUploaded = doc => {
      doc.uploaded = true;
      feedback.ElMessage.success(`證明文件 ${doc.index} 已添加`);
    };
    const applyPickupMarketingPlanChange = () => {
      const plan = selectedReplacementPickupPlan.value;
      if (!plan) return;
      pickupData.marketingChangeApplied = true;
      syncPickupMarketingAmount(plan);
      operationRecords.value.unshift({
        title: '取車時更換行銷方案',
        content: `${currentPickupMarketingPlan.value.name} -> ${plan.name}，原因：${pickupData.promoQualificationReason || '優惠資格覈驗不通過'}，訂單總額重算爲 ¥${formatNumber(plan.orderTotal)}`,
        timestamp: new Date().toLocaleString('zh-CN', {
          hour12: false
        }),
        operator: pickupLock.operator || 'Admin',
        type: 'warning',
        color: '#f59e0b',
        hollow: false
      });
      feedback.ElMessage.success('已按新行銷方案重算取車尾款');
    };
    const actualPaidAmount = computed(() => {
      return paymentData.receivedPayments.filter(p => {
        if (p.type === 'monthly_bill') return false;
        if (p.type === 'pre_auth') return p.status === 'captured';
        return true;
      }).reduce((sum, p) => sum + p.amount, 0);
    });
    const paymentDialogDueAmount = computed(() => {
      if (newPayment.context === 'booking') return paymentData.preAuthAmount;
      return newPayment.context === 'return' ? Math.abs(returnBalanceDue.value) : balanceDue.value;
    });
    const paymentDialogTitle = computed(() => {
      if (newPayment.context === 'booking') return '確認預授權押金';
      if (newPayment.context === 'return') return '還車結算收款';
      return '添加收款';
    });
    const paymentDialogAmountLabel = computed(() => {
      if (newPayment.context === 'booking') return '本次預授權金額';
      return '收款金額';
    });
    const paymentDialogAmountHint = computed(() => {
      if (newPayment.context === 'booking') return '預授權押金';
      return newPayment.context === 'return' ? '待結金額' : '應收尾款';
    });
    const paymentDialogSubmitText = computed(() => {
      if (newPayment.context === 'booking') return '發起預授權';
      return paymentDialogType.value === 'online' ? '發起支付' : '確認收款';
    });
    const preAuthStatusType = computed(() => {
      const map = {
        pending: 'info',
        processing: 'warning',
        frozen: 'success',
        captured: 'success',
        released: 'info',
        cancelled: 'danger',
        not_required: 'info'
      };
      return map[paymentData.preAuthStatus] || 'info';
    });
    const preAuthStatusText = computed(() => {
      const map = {
        pending: '待發起',
        processing: '處理中',
        frozen: '已凍結',
        captured: '已扣款',
        released: '已釋放',
        cancelled: '已取消',
        not_required: '無需預授權'
      };
      return map[paymentData.preAuthStatus] || '未知';
    });
    const canProceedPayment = computed(() => {
      if (isMonthlyBilling.value) return true;
      const preAuthOK = paymentData.preAuthMode === 'rent_offset' ? paymentData.preAuthStatus === 'captured' : ['frozen', 'released'].includes(paymentData.preAuthStatus);
      const balanceOK = balanceDue.value <= 0;
      return preAuthOK && balanceOK;
    });
    const syncPreAuthRecord = (status, channel) => {
      let record = paymentData.receivedPayments.find(p => p.type === 'pre_auth');
      if (!record) {
        record = {
          channel,
          amount: paymentData.preAuthAmount,
          refNo: 'AUTH-' + Date.now().toString().slice(-6),
          time: new Date().toLocaleTimeString(),
          type: 'pre_auth',
          status
        };
        paymentData.receivedPayments.unshift(record);
        return;
      }
      record.status = status;
      record.channel = channel;
      record.time = new Date().toLocaleTimeString();
    };
    const selectPreAuthMode = mode => {
      if (isMonthlyBilling.value) {
        feedback.ElMessage.info('企業月結訂單無需處理預授權');
        return;
      }
      paymentData.preAuthMode = mode;
      if (mode === 'rent_offset') {
        paymentData.preAuthStatus = 'captured';
        syncPreAuthRecord('captured', '預授權扣款轉租金');
        feedback.ElMessage.success('已選擇預授權轉租金，押金扣款將抵扣租金');
      } else {
        if (paymentData.preAuthStatus !== 'released') {
          paymentData.preAuthStatus = 'frozen';
          syncPreAuthRecord('frozen', '信用卡預授權押金');
        }
        feedback.ElMessage.success('已選擇履約擔保，確認發車後釋放預授權');
      }
    };
    const releaseGuaranteePreAuth = () => {
      if (paymentData.preAuthMode !== 'guarantee' || paymentData.preAuthStatus !== 'frozen') return false;
      paymentData.preAuthStatus = 'released';
      syncPreAuthRecord('released', '履約擔保預授權釋放');
      return true;
    };
    const handlePreAuth = () => {
      if (isMonthlyBilling.value) {
        feedback.ElMessage.info('企業月結訂單無需發起預授權');
        return;
      }
      paymentData.preAuthStatus = 'processing';
      window.setTimeout(() => {
        if (paymentData.preAuthMode === 'rent_offset') {
          paymentData.preAuthStatus = 'captured';
          syncPreAuthRecord('captured', '預授權扣款轉租金');
          feedback.ElMessage.success('預授權已扣款並轉爲租金');
        } else {
          paymentData.preAuthStatus = 'frozen';
          syncPreAuthRecord('frozen', '信用卡預授權押金');
          feedback.ElMessage.success('預授權已凍結');
        }
      }, 1500);
    };
    const userCreditCards = ref([{
      id: 'card1',
      last4: '4567',
      brand: 'Visa',
      expiry: '12/26',
      isDefault: true
    }, {
      id: 'card2',
      last4: '8901',
      brand: 'MasterCard',
      expiry: '08/25',
      isDefault: false
    }]);
    const selectedCreditCard = ref('card1');
    const openPaymentDialog = () => {
      if (isMonthlyBilling.value) {
        feedback.ElMessage.info('企業月結訂單不需要客戶現場支付');
        return;
      }
      paymentDialogType.value = 'online';
      newPayment.gateway = 'jiekou';
      newPayment.amount = balanceDue.value;
      newPayment.refNo = '';
      newPayment.processing = false;
      newPayment.context = 'pickup';
      selectedCreditCard.value = userCreditCards.value.find(c => c.isDefault)?.id || '';
      paymentDialogVisible.value = true;
    };
    const openBookingPaymentDialog = () => {
      if (isMonthlyBilling.value) {
        feedback.ElMessage.info('企業月結訂單創建後直接進入已預訂，不需要客戶支付或預授權');
        return;
      }
      if (orderStatus.value !== 'pending_payment') {
        feedback.ElMessage.info('當前訂單已完成下單預授權');
        return;
      }
      paymentDialogType.value = 'online';
      newPayment.gateway = 'credit_card';
      newPayment.amount = paymentData.preAuthAmount;
      newPayment.refNo = '';
      newPayment.processing = false;
      newPayment.context = 'booking';
      selectedCreditCard.value = userCreditCards.value.find(c => c.isDefault)?.id || '';
      paymentDialogVisible.value = true;
    };
    const showPaymentDialog = type => {
      paymentDialogType.value = type;
      newPayment.gateway = type === 'online' ? 'jiekou' : 'cash';
      newPayment.amount = balanceDue.value;
      newPayment.refNo = '';
      newPayment.processing = false;
      newPayment.context = 'pickup';
      paymentDialogVisible.value = true;
    };
    const confirmPayment = () => {
      if (!newPayment.amount || newPayment.amount <= 0) {
        feedback.ElMessage.warning('請輸入有效金額');
        return;
      }
      if (newPayment.context === 'booking' && paymentDialogType.value !== 'online') {
        feedback.ElMessage.warning('下單預授權押金僅支持線上預授權');
        paymentDialogType.value = 'online';
        newPayment.gateway = 'credit_card';
        return;
      }
      if (paymentDialogType.value === 'online' && newPayment.gateway === 'credit_card' && !selectedCreditCard.value) {
        feedback.ElMessage.warning('請選擇信用卡');
        return;
      }
      newPayment.processing = true;
      window.setTimeout(() => {
        const channelMap = {
          jiekou: '街口支付',
          lanxin: '藍心支付',
          credit_card: '信用卡支付',
          cash: '現金',
          pos: 'POS刷卡',
          transfer: '公司轉賬'
        };
        let channelName = channelMap[newPayment.gateway] || newPayment.gateway;
        if (newPayment.gateway === 'credit_card') {
          const card = userCreditCards.value.find(c => c.id === selectedCreditCard.value);
          if (card) channelName = `${card.brand} ****${card.last4}`;
        }
        const finalAmount = parseFloat(newPayment.amount);
        const refNo = newPayment.refNo || (newPayment.context === 'booking' ? 'AUTH' : 'TXN') + Date.now();
        if (newPayment.context === 'booking') {
          paymentData.preAuthAmount = finalAmount;
          paymentData.preAuthStatus = 'frozen';
          const preAuthRecord = paymentData.receivedPayments.find(p => p.type === 'pre_auth');
          const record = {
            channel: `${channelName}預授權押金`,
            amount: finalAmount,
            refNo,
            time: new Date().toLocaleTimeString(),
            type: 'pre_auth',
            status: 'frozen'
          };
          if (preAuthRecord) {
            Object.assign(preAuthRecord, record);
          } else {
            paymentData.receivedPayments.unshift(record);
          }
          transactions.value.unshift({
            id: 'TXN-AUTH-' + Date.now(),
            feeIds: [],
            type: 'pre_auth',
            txnType: 'pre_auth_freeze',
            amount: finalAmount,
            channel: newPayment.gateway,
            channelType: paymentDialogType.value,
            refNo,
            status: 'confirmed',
            receiptImage: null,
            operator: 'system',
            createdAt: new Date().toLocaleString(),
            remark: '待支付訂單補收預授權押金'
          });
          orderStatus.value = 'reserved';
          orderView.status = 'reserved';
          orderView.paymentStatus = 'deposit_paid';
          operationRecords.value.unshift({
            title: '預授權押金確認',
            content: `下單階段預授權押金 ¥${formatNumber(finalAmount)} 已確認，訂單進入已預訂`,
            timestamp: new Date().toLocaleString(),
            sortTime: Date.now(),
            operator: '門店管理員 (當前)',
            color: '#409EFF'
          });
          feedback.ElMessage.success('預授權押金已確認，訂單已進入已預訂');
        } else {
          const record = {
            channel: channelName,
            amount: finalAmount,
            refNo,
            time: new Date().toLocaleTimeString(),
            type: newPayment.context === 'return' ? 'settlement' : 'payment'
          };
          if (newPayment.context === 'return') {
            returnPaymentRecords.value.push(record);
            feedback.ElMessage.success('結算成功');
          } else {
            paymentData.receivedPayments.push(record);
            if (paymentData.preAuthMode === 'guarantee') {
              feedback.ElMessage.success('尾款收款成功，確認發車後釋放履約擔保預授權');
            } else {
              feedback.ElMessage.success('收款成功，預授權扣款已抵扣租金');
            }
          }
        }
        newPayment.processing = false;
        paymentDialogVisible.value = false;
      }, 1000);
    };
    const openPickupModal = () => {
      if (!canPickup.value) {
        feedback.ElMessage.warning('當前訂單狀態不可辦理取車');
        return;
      }
      if (orderStatus.value !== 'inspecting') {
        pickupPreviousStatus.value = orderStatus.value;
        orderStatus.value = 'inspecting';
        pickupStep.value = 0;
        startPickupLock();
      } else if (!pickupLock.expiresAt) {
        startPickupLock();
      } else {
        pickupInterrupted.value = false;
      }
      pickupModalVisible.value = true;
    };
    const markPickupInterrupted = () => {
      if (pickupStep.value < 3 && orderStatus.value === 'inspecting') {
        pickupInterrupted.value = true;
        feedback.ElMessage.info('取車草稿已保留，訂單保持驗車中，可繼續辦理取車');
      }
    };
    const requestClosePickupModal = () => {
      if (pickupStep.value === 3) {
        pickupModalVisible.value = false;
        return;
      }
      markPickupInterrupted();
      pickupModalVisible.value = false;
    };
    const handlePickupDialogClose = done => {
      if (pickupStep.value === 3) {
        done();
        return;
      }
      feedback.ElMessageBox.confirm('關閉窗口後，訂單將保持“驗車中”，取車草稿和操作鎖會繼續保留。可在訂單列表或詳情頁點擊“繼續取車”恢復辦理。', '暫停取車辦理', {
        confirmButtonText: '保存並關閉',
        cancelButtonText: '繼續辦理',
        type: 'warning'
      }).then(() => {
        markPickupInterrupted();
        done();
      }).catch(() => {});
    };
    const releasePickupLock = () => {
      if (orderStatus.value !== 'inspecting') return;
      orderStatus.value = pickupPreviousStatus.value || 'reserved';
      pickupStep.value = 0;
      pickupInterrupted.value = false;
      pickupLock.startedAt = '';
      pickupLock.expiresAt = '';
      feedback.ElMessage.success('操作鎖已釋放，取車草稿已作廢，系統會按當前時間重新判定訂單狀態');
    };
    const nextPickupStep = () => {
      if (pickupStep.value === 0) {
        if (!pickupData.isPersonMatched) {
          feedback.ElMessage.warning('請勾選"確認人證合一"以繼續');
          return;
        }
        if (!canProceedPickupQualification.value) {
          if (pickupData.promoQualificationStatus === 'pending') {
            feedback.ElMessage.warning('請先完成行銷方案資格覈驗');
          } else if (pickupData.promoQualificationStatus === 'passed' && !qualificationDocsComplete.value) {
            feedback.ElMessage.warning('請至少上傳 1 個證明文件');
          } else {
            feedback.ElMessage.warning('請更換行銷方案或改爲不使用優惠');
          }
          return;
        }
        pickupStep.value++;
      } else if (pickupStep.value === 1) {
        if (!canProceedPayment.value) {
          if (paymentData.preAuthStatus === 'pending' || paymentData.preAuthStatus === 'processing') {
            feedback.ElMessage.warning('請先完成預授權操作');
          } else if (balanceDue.value > 0) {
            feedback.ElMessage.warning('請結清應收尾款 ' + formatNumber(balanceDue.value));
          } else {
            feedback.ElMessage.warning(paymentData.preAuthMode === 'rent_offset' ? '請先完成預授權扣款轉租金' : '請先完成預授權押金凍結');
          }
          return;
        }
        pickupStep.value++;
      } else if (pickupStep.value === 2) {
        if (!pickupData.signed) {
          feedback.ElMessage.warning('請顧客簽署租賃合約');
          return;
        }
        if (!pickupData.deliveryLocation) {
          feedback.ElMessage.warning('請填寫交付位置');
          return;
        }
        if (!pickupData.mileage || pickupData.mileage <= 0) {
          feedback.ElMessage.warning('請填寫當前里程');
          return;
        }
        processing.value = true;
        window.setTimeout(() => {
          const guaranteeReleased = releaseGuaranteePreAuth();
          processing.value = false;
          orderStatus.value = 'renting';
          pickupInterrupted.value = false;
          pickupLock.startedAt = '';
          pickupLock.expiresAt = '';
          pickupStep.value++;
          feedback.ElMessage.success(guaranteeReleased ? '發車成功，履約擔保預授權已釋放' : '發車成功');
        }, 1000);
      } else {
        pickupModalVisible.value = false;
      }
    };
    const photoGalleryVisible = ref(false);
    const photoGalleryTab = ref('exterior');
    const photoGalleryContext = ref('pickup');
    const openPhotoGallery = context => {
      photoGalleryContext.value = context;
      photoGalleryVisible.value = true;
      photoGalleryTab.value = 'exterior';
    };
    const signatureDialogVisible = ref(false);
    const currentSignatureTime = ref('');
    const currentSignatureName = ref('');
    const viewSignature = row => {
      if (!row.signed) return;
      currentSignatureTime.value = row.signTime;
      currentSignatureName.value = orderView.customer.name;
      signatureDialogVisible.value = true;
    };
    const pickupReturnData = computed(() => {
      const pickupRow = {
        type: '取車',
        context: 'pickup',
        time: '2024/05/01 09:30',
        station: orderView.location.pickup?.split(' - ')[0] || '取車門市',
        stationSub: `車輛所在據點: ${pickupVehicleStationText.value} · 交付位置: ${pickupData.deliveryLocation}`,
        mileage: '12,450 km',
        fuel: '80%',
        photos: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
        signed: true,
        signTime: '09:35',
        operator: '張三',
        isPending: false
      };
      const isReturned = orderStatus.value === 'completed';
      const returnRow = {
        type: '還車',
        context: 'return',
        time: isReturned ? '2024/05/05 14:30' : '2024/05/05 11:11 (預計)',
        station: isReturned ? getReturnStoreLabel(returnData.returnStore) : orderView.location.return,
        stationSub: isReturned ? `歸還據點: ${getReturnStationLabel(returnData.parking.station)}` : '預計還車門市',
        mileage: isReturned ? '13,120 km' : '-',
        fuel: isReturned ? '60%' : '-',
        photos: isReturned ? [1, 2, 3, 4] : [],
        signed: isReturned,
        signTime: isReturned ? '14:35' : '',
        operator: isReturned ? '李四' : '-',
        isPending: !isReturned
      };
      return [pickupRow, returnRow];
    });
    const tableRowClassName = ({
      row
    }) => {
      return row.isPending ? 'bg-gray-50' : '';
    };
    const feeData = computed(() => {
      const items = [];
      items.push({
        name: '車輛租金 (5天)',
        amount: paymentData.feeDetails.rental,
        isDiscount: false
      });
      paymentData.feeDetails.serviceItems.forEach(s => {
        items.push({
          name: s.name,
          amount: s.amount,
          isDiscount: false
        });
      });
      paymentData.feeDetails.discountItems.forEach(d => {
        items.push({
          name: d.name,
          amount: -d.amount,
          isDiscount: true,
          code: d.code,
          points: d.points
        });
      });
      return items;
    });
    const getSummaries = param => {
      const {
        columns,
        data: _data
      } = param;
      const sums = [];
      columns.forEach((_column, index) => {
        if (index === 0) {
          sums[index] = '總計';
          return;
        }
        sums[index] = '1,920';
      });
      return sums;
    };
    const redirectionModalVisible = ref(false);
    const activeTab = ref('manual');
    const selectedGroup = ref('');
    const selectedVehicleId = ref('');
    const selectedPromoId = ref('none');
    const newPrice = ref(null);
    const redirectionReason = ref('');
    const redirectionNote = ref('');
    const priceHandling = ref('diff');
    const isMidRental = ref(false);
    const remainingDays = ref(2);
    const originalGroup = 'sedan';
    const currentBasePrice = 1920;
    const isGroupChanged = computed(() => {
      return selectedGroup.value && selectedGroup.value !== originalGroup;
    });
    const shouldShowPromoSelection = computed(() => {
      if (!selectedVehicleId.value) return false;
      if (!isGroupChanged.value) return false;
      return priceHandling.value === 'diff';
    });
    const vehicleGroups = [{
      name: '轎車組',
      key: 'sedan'
    }, {
      name: 'SUV組',
      key: 'suv'
    }, {
      name: 'MPV組',
      key: 'mpv'
    }];
    const redirectionReasons = [{
      value: 'vehicle_fault',
      label: '原車故障'
    }, {
      value: 'vehicle_not_ready',
      label: '原車未整備完成'
    }, {
      value: 'vehicle_unavailable',
      label: '原車事故/不可交付'
    }, {
      value: 'customer_upgrade',
      label: '客戶要求升級'
    }, {
      value: 'customer_downgrade',
      label: '客戶同意降級'
    }, {
      value: 'store_free_upgrade',
      label: '門店免費升等'
    }, {
      value: 'dispatch_adjustment',
      label: '車輛調度調整'
    }, {
      value: 'extend_conflict_followup',
      label: '續租衝突改派後續訂單'
    }, {
      value: 'return_store_conflict_followup',
      label: '轉單衝突改派後續訂單'
    }, {
      value: 'other',
      label: '其他'
    }];
    const vehicles = {
      sedan: [{
        id: 's1',
        name: 'Toyota Vios',
        plate: 'ABC-5678',
        price: 1500,
        dealer: '北區合作車行',
        store: '新北總店',
        station: '停車場A',
        available: '當前時段可用',
        status: '空閒'
      }, {
        id: 's2',
        name: 'Nissan Sentra',
        plate: 'DEF-6621',
        price: 2000,
        dealer: '北區合作車行',
        store: '新北總店',
        station: '停車場B',
        available: '當前時段可用',
        status: '空閒'
      }],
      suv: [{
        id: 'suv1',
        name: 'Honda CR-V',
        plate: 'GHI-3456',
        price: 2500,
        dealer: '北區合作車行',
        store: '新北總店',
        station: '停車場A',
        available: '當前時段可用',
        status: '空閒'
      }, {
        id: 'suv2',
        name: 'Toyota RAV4',
        plate: 'RMO-8821',
        price: 2600,
        dealer: '北區合作車行',
        store: '新北總店',
        station: '停車場C',
        available: '可用，需備車',
        status: '空閒'
      }],
      mpv: [{
        id: 'mpv1',
        name: 'Honda Odyssey',
        plate: 'MPV-7788',
        price: 3500,
        dealer: '北區合作車行',
        store: '臺北車站店',
        station: '地下B2',
        available: '同車行跨門市協調',
        status: '空閒'
      }]
    };
    const promotions = [{
      id: 'none',
      name: '不使用優惠/默認',
      discount: 0,
      type: 'none'
    }, {
      id: 'corp',
      name: '企業資格行銷方案 (9折)',
      discount: 0.1,
      type: 'rate'
    }, {
      id: 'weekday',
      name: '平日行銷方案 (-200)',
      discount: 200,
      type: 'amount'
    }, {
      id: 'member',
      name: '會員行銷方案 (85折)',
      discount: 0.15,
      type: 'rate'
    }];
    const recommendations = [{
      id: 'suv1',
      name: 'Honda CR-V',
      plate: 'GHI-3456',
      price: 2500,
      tag: '推薦升級',
      tagType: 'success',
      type: 'suv',
      dealer: '北區合作車行',
      store: '新北總店',
      station: '停車場A',
      available: '當前時段可用',
      status: '空閒'
    }, {
      id: 's1',
      name: 'Toyota Vios',
      plate: 'ABC-5678',
      price: 1500,
      tag: '省錢方案',
      tagType: 'warning',
      type: 'sedan',
      dealer: '北區合作車行',
      store: '新北總店',
      station: '停車場A',
      available: '當前時段可用',
      status: '空閒'
    }];
    const currentVehicleList = computed(() => {
      return selectedGroup.value ? vehicles[selectedGroup.value] : [];
    });
    const priceDiff = computed(() => {
      if (newPrice.value === null) return 0;
      if (isMidRental.value) {
        const oldDaily = currentBasePrice / 5;
        const newDaily = newPrice.value / 5;
        return (newDaily - oldDaily) * remainingDays.value;
      }
      return newPrice.value - currentBasePrice;
    });
    const handleGroupSelect = key => {
      selectedGroup.value = key;
      selectedVehicleId.value = '';
      newPrice.value = null;
    };
    const calculatePrice = () => {
      let vehicle = null;
      if (activeTab.value === 'manual' && selectedGroup.value) {
        vehicle = vehicles[selectedGroup.value].find(v => v.id === selectedVehicleId.value);
      } else {
        vehicle = recommendations.find(v => v.id === selectedVehicleId.value);
        if (!vehicle) {
          Object.values(vehicles).flat().forEach(v => {
            if (v.id === selectedVehicleId.value) vehicle = v;
          });
        }
      }
      if (!vehicle) return;
      let price = vehicle.price;
      const promo = promotions.find(p => p.id === selectedPromoId.value);
      if (promo) {
        if (promo.type === 'rate') {
          price = Math.round(price * (1 - promo.discount));
        } else if (promo.type === 'amount') {
          price = Math.max(0, price - promo.discount);
        }
      }
      newPrice.value = price;
    };
    const selectRecommendation = rec => {
      selectedVehicleId.value = rec.id;
      let bestPrice = Infinity;
      let bestPromo = 'none';
      promotions.forEach(p => {
        let final = rec.price;
        if (p.type === 'rate') final = final * (1 - p.discount);else if (p.type === 'amount') final = Math.max(0, final - p.discount);
        if (final < bestPrice) {
          bestPrice = final;
          bestPromo = p.id;
        }
      });
      selectedPromoId.value = bestPromo;
      calculatePrice();
    };
    const openRedirectionModal = () => {
      if (!canRedirect.value) {
        feedback.ElMessage.warning('當前訂單狀態不可改派');
        return;
      }
      isMidRental.value = ['renting', 'renewing', 'overdue'].includes(orderStatus.value);
      remainingDays.value = isMidRental.value ? 2 : 0;
      redirectionModalVisible.value = true;
      selectedGroup.value = 'sedan';
      selectedVehicleId.value = '';
      selectedPromoId.value = 'none';
      redirectionReason.value = '';
      redirectionNote.value = '';
      priceHandling.value = 'diff';
      newPrice.value = null;
      activeTab.value = 'manual';
    };
    const confirmRedirection = () => {
      if (!selectedVehicleId.value) {
        feedback.ElMessage.warning('請選擇改派車輛');
        return;
      }
      if (!redirectionReason.value) {
        feedback.ElMessage.warning('請選擇改派原因');
        return;
      }
      let vehicleName = '';
      if (activeTab.value === 'manual' && selectedGroup.value) {
        const vehicle = vehicles[selectedGroup.value].find(v => v.id === selectedVehicleId.value);
        if (vehicle) vehicleName = `${vehicle.name} (${vehicle.plate})`;
      } else {
        const rec = recommendations.find(v => v.id === selectedVehicleId.value);
        if (rec) vehicleName = `${rec.name} (${rec.plate})`;
      }
      const rawDiff = Math.round(priceDiff.value || 0);
      if (priceHandling.value === 'free' && rawDiff > 0 && !redirectionNote.value.trim()) {
        feedback.ElMessage.warning('免費升等必須填寫原因說明');
        return;
      }
      if (redirectionReason.value === 'other' && !redirectionNote.value.trim()) {
        feedback.ElMessage.warning('選擇其他原因時必須填寫備註');
        return;
      }
      const actualDiff = priceHandling.value === 'free' && rawDiff > 0 ? 0 : rawDiff;
      const feePhase = isMidRental.value ? 'rental' : 'pickup';
      const settlementText = isMonthlyBilling.value ? '企業月結' : isMidRental.value ? '還車結算' : '取車補收';
      const selectedReason = redirectionReasons.find(reason => reason.value === redirectionReason.value);
      const reasonText = selectedReason ? selectedReason.label : '車輛改派';
      const feeName = isMonthlyBilling.value ? actualDiff > 0 ? '企業月結調增' : '企業月結調減' : actualDiff > 0 ? '改派差價' : '改派退費';
      redirectionHistory.value.unshift({
        id: Date.now(),
        time: new Date().toLocaleString(),
        sortTime: Date.now(),
        fromVehicle: 'Toyota Corolla Altis (ABC-1234)',
        toVehicle: vehicleName || '新車輛',
        priceChange: actualDiff,
        priceHandling: priceHandling.value,
        settlementText,
        reason: `${reasonText}${redirectionNote.value ? '：' + redirectionNote.value : ''}`,
        operator: 'Admin'
      });
      if (actualDiff !== 0) {
        feeItems.value.unshift({
          id: 'FEE-REDIRECT-' + Date.now(),
          type: isMonthlyBilling.value ? 'redirection_monthly_adjustment' : actualDiff > 0 ? 'redirection_fee' : 'redirection_refund',
          source: 'manual',
          name: feeName,
          description: `${vehicleName || '新車輛'}，${settlementText}處理`,
          amount: actualDiff,
          paidAmount: 0,
          status: isMonthlyBilling.value ? 'monthly_billing' : 'pending',
          phase: feePhase === 'pickup' ? 'rental' : feePhase,
          createdAt: new Date().toLocaleString(),
          createdBy: 'Admin',
          attachments: [],
          reminder: !isMonthlyBilling.value && actualDiff > 0 ? {
            date: new Date().toISOString().split('T')[0],
            notified: false
          } : null,
          editable: false
        });
      }
      if (!isMidRental.value && actualDiff !== 0) {
        paymentData.orderTotal += actualDiff;
      }
      operationRecords.value.unshift({
        title: priceHandling.value === 'free' && rawDiff > 0 ? '免費升等' : '訂單改派',
        content: `改派至 ${vehicleName || '新車輛'}，差價 ¥${formatNumber(actualDiff)}`,
        timestamp: new Date().toLocaleString(),
        sortTime: Date.now(),
        operator: '門店管理員 (當前)',
        memo: `${reasonText}${redirectionNote.value ? '：' + redirectionNote.value : ''}`,
        color: '#E6A23C'
      });
      feedback.ElMessage.success(isMonthlyBilling.value ? '訂單改派成功，差價將進入企業月結賬單！' : '訂單改派成功！');
      redirectionModalVisible.value = false;
      showRedirectionHistory.value = true;
    };
    const feeModalVisible = ref(false);
    const feeStatusFilter = ref('all');
    const feePhaseFilter = ref('all');
    const expandedFees = ref([]);
    const feeStatusFilters = [{
      value: 'all',
      label: '全部'
    }, {
      value: 'pending',
      label: '待收款'
    }, {
      value: 'partial',
      label: '部分收款'
    }, {
      value: 'monthly_billing',
      label: '企業月結'
    }, {
      value: 'paid',
      label: '已結清'
    }, {
      value: 'refunded',
      label: '已退款'
    }, {
      value: 'waived',
      label: '已減免'
    }, {
      value: 'released',
      label: '已釋放'
    }, {
      value: 'cancelled',
      label: '已取消'
    }];
    const feePhaseFilters = [{
      value: 'all',
      label: '全部費用'
    }, {
      value: 'rental',
      label: '租期費用',
      color: 'text-blue-600',
      bg: 'bg-blue-50'
    }, {
      value: 'post',
      label: '追繳費用',
      color: 'text-orange-600',
      bg: 'bg-orange-50'
    }];
    const feeItems = ref([{
      id: 'FEE-001',
      type: 'rental',
      source: 'system',
      name: '車輛租金',
      description: '取車階段補收租金尾款 (2026-01-28 ~ 2026-02-02)',
      amount: 1920,
      paidAmount: 1920,
      status: 'paid',
      phase: 'rental',
      createdAt: '2026-01-28 09:35',
      createdBy: 'system',
      attachments: [],
      reminder: null,
      editable: false
    }, {
      id: 'FEE-EXT-001',
      type: 'extension_rent',
      source: 'system',
      name: '續租租金',
      description: '延長用車 4 小時，還車時結算',
      amount: 480,
      paidAmount: 0,
      status: 'pending',
      phase: 'rental',
      createdAt: '2026-01-29 11:30',
      createdBy: 'system',
      attachments: [],
      reminder: {
        date: '2026-02-02',
        notified: false
      },
      editable: false
    }, {
      id: 'FEE-002',
      type: 'overtime',
      source: 'system',
      name: '超時費',
      description: '超時2小時，含超時罰款 (系統自動計算)',
      amount: 200,
      paidAmount: 0,
      status: 'pending',
      phase: 'rental',
      createdAt: '2026-01-30 14:00',
      createdBy: 'system',
      attachments: [],
      reminder: {
        date: '2026-01-29',
        notified: false
      },
      editable: false
    }, {
      id: 'FEE-003',
      type: 'cleaning',
      source: 'manual',
      name: '車輛清潔費',
      description: '還車時車內有大量泥沙',
      amount: 300,
      paidAmount: 0,
      status: 'pending',
      phase: 'rental',
      createdAt: '2026-01-30 15:00',
      createdBy: 'Admin',
      attachments: [],
      reminder: null,
      editable: true
    }, {
      id: 'FEE-004',
      type: 'damage',
      source: 'manual',
      name: '劃痕修復',
      description: '左前保險槓刮擦',
      amount: 1500,
      paidAmount: 500,
      status: 'partial',
      phase: 'rental',
      createdAt: '2026-01-30 15:30',
      createdBy: 'Admin',
      attachments: [],
      reminder: {
        date: '2026-02-05',
        notified: true
      },
      editable: true
    }, {
      id: 'FEE-005',
      type: 'deposit',
      source: 'system',
      name: '預授權押金擔保',
      description: '下單階段凍結，履約擔保模式取車確認發車後釋放',
      amount: 666,
      paidAmount: 0,
      status: 'released',
      phase: 'rental',
      createdAt: '2026-01-28 10:00',
      createdBy: 'system',
      attachments: [],
      reminder: null,
      editable: false
    }, {
      id: 'FEE-006',
      type: 'toll',
      source: 'manual',
      name: 'ETC通行費',
      description: '高速通行費補繳',
      amount: 125,
      paidAmount: 125,
      status: 'paid',
      phase: 'rental',
      createdAt: '2026-01-30 16:00',
      createdBy: 'Admin',
      attachments: [],
      reminder: null,
      editable: true
    }, {
      id: 'FEE-007',
      type: 'other',
      source: 'manual',
      name: '誤操作費用',
      description: '測試取消狀態',
      amount: 50,
      paidAmount: 0,
      status: 'cancelled',
      phase: 'rental',
      createdAt: '2026-01-30 16:05',
      createdBy: 'Admin',
      attachments: [],
      reminder: null,
      editable: true
    }, {
      id: 'FEE-008',
      type: 'other',
      source: 'manual',
      name: '服務費減免',
      description: '客戶滿意度調整',
      amount: 200,
      paidAmount: 200,
      status: 'waived',
      phase: 'rental',
      createdAt: '2026-01-30 16:30',
      createdBy: 'Admin',
      attachments: [],
      reminder: null,
      editable: false
    }, {
      id: 'FEE-009',
      type: 'violation',
      source: 'manual',
      name: '違章罰款',
      description: '2026-01-29 超速20% (臺北市信義路)',
      amount: 1800,
      paidAmount: 0,
      status: 'pending',
      phase: 'post',
      notifyStatus: 'pending',
      createdAt: '2026-02-05 10:00',
      createdBy: 'Admin',
      attachments: ['violation_photo_001.jpg'],
      reminder: {
        date: '2026-02-10',
        notified: false
      },
      editable: true
    }, {
      id: 'FEE-010',
      type: 'toll',
      source: 'manual',
      name: 'ETC通行費(延遲)',
      description: '2026-01-30 國道3號通行費 (賬單延遲到賬)',
      amount: 85,
      paidAmount: 0,
      status: 'pending',
      phase: 'post',
      notifyStatus: 'notified',
      notifiedAt: '2026-02-03 14:00',
      createdAt: '2026-02-03 10:00',
      createdBy: 'Admin',
      attachments: [],
      reminder: null,
      editable: true
    }, {
      id: 'FEE-011',
      type: 'damage',
      source: 'manual',
      name: '底盤刮擦修復',
      description: '還車檢查時未發現，後續保養髮現底盤有刮擦痕跡',
      amount: 2500,
      paidAmount: 2500,
      status: 'paid',
      phase: 'post',
      notifyStatus: 'notified',
      notifiedAt: '2026-02-01 09:00',
      paidAt: '2026-02-02 16:00',
      createdAt: '2026-02-01 08:30',
      createdBy: 'Admin',
      attachments: ['damage_undercarriage_001.jpg', 'damage_undercarriage_002.jpg'],
      reminder: null,
      editable: false
    }]);
    const transactions = ref([{
      id: 'TXN-001',
      feeIds: ['FEE-001'],
      type: 'payment',
      txnType: 'sales',
      amount: 1920,
      channel: 'jkopay',
      channelType: 'online',
      refNo: 'JK-20260128-001',
      status: 'confirmed',
      receiptImage: null,
      operator: 'system',
      createdAt: '2026-01-28 09:40',
      remark: '取車時補收租金尾款'
    }, {
      id: 'TXN-002',
      feeIds: ['FEE-004'],
      type: 'payment',
      txnType: 'sales',
      amount: 500,
      channel: 'cash',
      channelType: 'offline',
      refNo: '-',
      status: 'confirmed',
      receiptImage: null,
      operator: 'Admin',
      createdAt: '2026-01-30 15:40',
      remark: '客戶先付部分現金'
    }, {
      id: 'TXN-003_PA',
      feeIds: ['FEE-005'],
      type: 'pre_auth',
      txnType: 'pre_auth_freeze',
      amount: 666,
      channel: 'credit_card',
      channelType: 'online',
      cardInfo: {
        brand: 'VISA',
        last4: '4242'
      },
      refNo: 'AUTH-8888-9999',
      status: 'confirmed',
      receiptImage: null,
      operator: 'system',
      createdAt: '2026-01-28 10:00',
      remark: '下單預授權押金凍結'
    }, {
      id: 'TXN-003',
      feeIds: ['FEE-005'],
      type: 'pre_auth',
      txnType: 'pre_auth_release',
      amount: 666,
      channel: 'credit_card',
      channelType: 'online',
      cardInfo: {
        brand: 'VISA',
        last4: '4242'
      },
      refNo: 'REL-8888-9999',
      status: 'confirmed',
      receiptImage: null,
      operator: 'system',
      createdAt: '2026-01-28 11:20',
      remark: '取車確認發車後釋放履約擔保預授權'
    }, {
      id: 'TXN-005',
      feeIds: ['FEE-006'],
      type: 'payment',
      amount: 100,
      channel: 'linepay',
      channelType: 'online',
      refNo: 'LP-123456',
      status: 'confirmed',
      receiptImage: null,
      operator: 'Admin',
      createdAt: '2026-01-30 16:10',
      remark: ''
    }, {
      id: 'TXN-006',
      feeIds: ['FEE-006'],
      type: 'payment',
      amount: 25,
      channel: 'cash',
      channelType: 'offline',
      refNo: '-',
      status: 'confirmed',
      receiptImage: null,
      operator: 'Admin',
      createdAt: '2026-01-30 16:15',
      remark: '零頭現金支付'
    }, {
      id: 'TXN-007',
      feeIds: ['FEE-002', 'FEE-003'],
      type: 'payment',
      amount: 500,
      channel: 'credit_card',
      channelType: 'online',
      refNo: 'CC-MERGED-001',
      status: 'confirmed',
      receiptImage: null,
      operator: 'Admin',
      createdAt: '2026-01-31 10:00',
      remark: '還車一併結算(超時+清潔)'
    }, {
      id: 'TXN-008',
      feeIds: ['FEE-008'],
      type: 'waiver',
      amount: 200,
      channel: 'system',
      channelType: 'internal',
      refNo: 'WAIVE-001',
      status: 'confirmed',
      receiptImage: null,
      operator: 'Admin',
      createdAt: '2026-01-30 16:30',
      remark: '客戶滿意度調整 - 全額減免'
    }]);
    const createMonthlyBillTransaction = (feeId, amount, remark) => {
      if (!isMonthlyBilling.value || !amount || amount <= 0) return;
      const now = Date.now();
      transactions.value.unshift({
        id: 'TXN-MONTHLY-' + now,
        feeIds: feeId ? [feeId] : [],
        type: 'monthly_bill',
        txnType: 'monthly_bill',
        amount,
        channel: 'monthly_bill',
        channelType: 'internal',
        refNo: 'BILL-' + now.toString().slice(-8),
        status: 'confirmed',
        receiptImage: null,
        operator: 'system',
        createdAt: new Date().toLocaleString(),
        remark
      });
    };
    const seedPostChargeFromUrl = () => {
      if (!postChargeView.status || postChargeView.amount <= 0) return;
      feeItems.value = feeItems.value.filter(fee => fee.phase !== 'post');
      const nowText = new Date().toLocaleString();
      const statusConfig = {
        pending_notify: {
          status: 'pending',
          paidAmount: 0,
          notifyStatus: 'pending'
        },
        notified: {
          status: 'pending',
          paidAmount: 0,
          notifyStatus: 'notified'
        },
        payment_due: {
          status: 'pending',
          paidAmount: 0,
          notifyStatus: 'notified'
        },
        monthly_billing: {
          status: 'monthly_billing',
          paidAmount: 0,
          notifyStatus: undefined
        },
        paid: {
          status: 'paid',
          paidAmount: postChargeView.amount,
          notifyStatus: 'notified'
        }
      }[postChargeView.status] || {
        status: 'pending',
        paidAmount: 0,
        notifyStatus: 'pending'
      };
      feeItems.value.unshift({
        id: 'FEE-URL-POST',
        type: 'post_charge',
        source: 'manual',
        name: postChargeView.count > 1 ? `完成後追繳 ${postChargeView.count} 項` : '完成後追繳',
        description: isMonthlyBilling.value ? '列表帶入：企業月結追繳已掛賬' : '列表帶入：完成後追繳費用',
        amount: postChargeView.amount,
        paidAmount: statusConfig.paidAmount,
        status: statusConfig.status,
        phase: 'post',
        notifyStatus: statusConfig.notifyStatus,
        notifiedAt: ['notified', 'payment_due', 'paid'].includes(postChargeView.status) ? nowText : undefined,
        paidAt: postChargeView.status === 'paid' ? nowText : undefined,
        createdAt: nowText,
        createdBy: 'Admin',
        attachments: [],
        reminder: isMonthlyBilling.value || statusConfig.status === 'paid' ? null : {
          date: new Date().toISOString().split('T')[0],
          notified: postChargeView.status !== 'pending_notify'
        },
        editable: true
      });
      if (postChargeView.status === 'monthly_billing') {
        createMonthlyBillTransaction('FEE-URL-POST', postChargeView.amount, '列表帶入：完成後追繳月結掛賬');
      } else if (postChargeView.status === 'paid') {
        transactions.value.unshift({
          id: 'TXN-URL-POST',
          feeIds: ['FEE-URL-POST'],
          type: 'payment',
          txnType: 'sales',
          amount: postChargeView.amount,
          channel: 'jkopay',
          channelType: 'online',
          refNo: 'POST-PAID-' + Date.now().toString().slice(-6),
          status: 'confirmed',
          receiptImage: null,
          operator: 'system',
          createdAt: nowText,
          remark: '列表帶入：追繳費用已結清'
        });
      }
    };
    seedPostChargeFromUrl();
    const getTxnTypeLabel = (type, txnType) => {
      if (type === 'refund') return {
        text: '退款',
        type: 'danger'
      };
      if (type === 'waiver') return {
        text: '費項減免',
        type: 'info'
      };
      if (type === 'monthly_bill') return {
        text: '企業月結',
        type: 'primary'
      };
      if (txnType === 'pre_auth_freeze') return {
        text: '預授權凍結',
        type: 'warning'
      };
      if (txnType === 'pre_auth_capture') return {
        text: '預授權扣款',
        type: 'success'
      };
      if (txnType === 'pre_auth_release') return {
        text: '預授權釋放',
        type: 'info'
      };
      return {
        text: '交易支付',
        type: 'success'
      };
    };
    const manualFeeTypes = [{
      value: 'cleaning',
      label: '車輛清潔費'
    }, {
      value: 'damage',
      label: '損傷賠償'
    }, {
      value: 'fuel',
      label: '燃油補差'
    }, {
      value: 'toll',
      label: '過路費補繳'
    }, {
      value: 'parking',
      label: '停車費'
    }, {
      value: 'violation',
      label: '違章代繳'
    }, {
      value: 'other',
      label: '其他費用'
    }];
    const onlineChannels = [{
      value: 'jkopay',
      label: '街口支付',
      icon: 'Iphone',
      color: 'text-green-500'
    }, {
      value: 'linepay',
      label: 'LINE Pay',
      icon: 'ChatLineSquare',
      color: 'text-green-600'
    }, {
      value: 'credit_card',
      label: '信用卡',
      icon: 'CreditCard',
      color: 'text-blue-500'
    }];
    const offlineChannels = [{
      value: 'cash',
      label: '現金'
    }, {
      value: 'pos',
      label: 'POS刷卡'
    }, {
      value: 'transfer',
      label: '銀行轉賬'
    }];
    const getChannelName = channel => {
      const map = {
        'jkopay': '街口支付',
        'linepay': 'LINE Pay',
        'credit_card': '信用卡',
        'cash': '現金',
        'pos': 'POS刷卡',
        'transfer': '銀行轉賬',
        'monthly_bill': '企業月結掛賬'
      };
      return map[channel] || channel;
    };
    const activeFinanceFees = computed(() => feeItems.value.filter(fee => !['cancelled', 'released', 'refunded', 'waived'].includes(fee.status)));
    const rightPanelFeeItems = computed(() => {
      const statusPriority = {
        pending: 1,
        partial: 2,
        monthly_billing: 3,
        paid: 4,
        waived: 5,
        refunded: 6,
        released: 7
      };
      return feeItems.value.filter(fee => !['cancelled', 'released'].includes(fee.status)).slice().sort((a, b) => {
        const priorityDiff = (statusPriority[a.status] || 9) - (statusPriority[b.status] || 9);
        if (priorityDiff !== 0) return priorityDiff;
        return new Date(String(b.createdAt).replace(/\//g, '-')).getTime() - new Date(String(a.createdAt).replace(/\//g, '-')).getTime();
      }).slice(0, 6);
    });
    const financeOverview = computed(() => {
      const totalReceivable = activeFinanceFees.value.reduce((sum, fee) => sum + fee.amount, 0);
      const customerPaid = activeFinanceFees.value.reduce((sum, fee) => sum + (fee.paidAmount || 0), 0);
      const postChargeAmount = feeItems.value.filter(fee => fee.phase === 'post' && !['paid', 'cancelled', 'refunded', 'waived'].includes(fee.status)).reduce((sum, fee) => sum + Math.max(0, fee.amount - (fee.paidAmount || 0)), 0);
      const monthlyTxAmount = transactions.value.filter(txn => txn.type === 'monthly_bill' && txn.status === 'confirmed').reduce((sum, txn) => sum + txn.amount, 0);
      const monthlyBillAmount = isMonthlyBilling.value ? totalReceivable : monthlyTxAmount;
      const pendingAmount = Math.max(0, totalReceivable - customerPaid);
      return {
        totalReceivable,
        customerPaid,
        pendingAmount,
        postChargeAmount,
        monthlyBillAmount,
        handledAmount: isMonthlyBilling.value ? monthlyBillAmount : customerPaid,
        feeCount: activeFinanceFees.value.length
      };
    });
    const getTransactionFeeName = txn => {
      const feeIds = Array.isArray(txn.feeIds) ? txn.feeIds : txn.feeId ? [txn.feeId] : [];
      const names = feeIds.map(id => feeItems.value.find(fee => fee.id === id)?.name).filter(Boolean);
      if (names.length > 1) return `${names[0]} 等${names.length}項`;
      return names[0] || txn.remark || '未關聯費用';
    };
    const recentFinancialTransactions = computed(() => transactions.value.map(txn => ({
      ...txn,
      feeName: getTransactionFeeName(txn)
    })).sort((a, b) => new Date(String(b.createdAt).replace(/\//g, '-')).getTime() - new Date(String(a.createdAt).replace(/\//g, '-')).getTime()).slice(0, 5));
    const invoiceSummary = computed(() => {
      const issuedAmount = invoiceRecords.value.filter(invoice => invoice.status === 'issued').reduce((sum, invoice) => sum + invoice.amount, 0);
      const pendingAmount = invoiceRecords.value.filter(invoice => invoice.status !== 'issued').reduce((sum, invoice) => sum + invoice.amount, 0);
      const uninvoicedAmount = Math.max(0, financeOverview.value.totalReceivable - issuedAmount - pendingAmount);
      return {
        issuedAmount,
        pendingAmount,
        uninvoicedAmount
      };
    });
    const getFeeStatusType = status => {
      const map = {
        pending: 'warning',
        partial: 'primary',
        monthly_billing: 'primary',
        paid: 'success',
        refunded: 'info',
        released: 'info',
        cancelled: 'danger',
        waived: 'info'
      };
      return map[status] || 'info';
    };
    const getFeeStatusText = status => {
      const map = {
        pending: '待收款',
        partial: '部分收款',
        monthly_billing: '企業月結',
        paid: '已結清',
        refunded: '已退款',
        released: '已釋放',
        cancelled: '已取消',
        waived: '已減免'
      };
      return map[status] || status;
    };
    const getFeeDisplayStatus = fee => {
      if (isMonthlyBilling.value && !['cancelled', 'refunded', 'released', 'waived'].includes(fee.status)) {
        return 'monthly_billing';
      }
      return fee.status;
    };
    const filteredFeeItems = computed(() => {
      const today = new Date().toISOString().split('T')[0];
      return feeItems.value.map(fee => ({
        ...fee,
        displayStatus: getFeeDisplayStatus(fee),
        isOverdue: !isMonthlyBilling.value && fee.reminder && fee.reminder.date && fee.reminder.date < today && fee.status === 'pending'
      })).filter(fee => {
        if (feePhaseFilter.value !== 'all' && fee.phase !== feePhaseFilter.value) return false;
        if (feeStatusFilter.value === 'all') return true;
        return fee.displayStatus === feeStatusFilter.value;
      });
    });
    const feeSummary = computed(() => {
      let total = 0,
        paid = 0,
        pending = 0,
        waived = 0,
        monthly = 0;
      feeItems.value.forEach(fee => {
        if (['cancelled', 'refunded', 'released'].includes(fee.status)) {
          return;
        }
        if (fee.status === 'waived') {
          waived += fee.amount;
          return;
        }
        total += fee.amount;
        if (fee.status === 'monthly_billing') {
          monthly += fee.amount;
          return;
        }
        paid += fee.paidAmount || 0;
        pending += Math.max(0, fee.amount - (fee.paidAmount || 0));
      });
      return {
        total,
        paid,
        pending: isMonthlyBilling.value ? 0 : pending,
        waived,
        monthly: isMonthlyBilling.value ? total : monthly
      };
    });
    const pendingPostCharges = computed(() => {
      return feeItems.value.filter(f => f.phase === 'post' && (f.status === 'pending' || f.status === 'partial'));
    });
    const getFilteredFeeCount = filterValue => {
      if (filterValue === 'all') return feeItems.value.length;
      return feeItems.value.filter(f => getFeeDisplayStatus(f) === filterValue).length;
    };
    const toggleFeeExpand = feeId => {
      const idx = expandedFees.value.indexOf(feeId);
      if (idx >= 0) {
        expandedFees.value.splice(idx, 1);
      } else {
        expandedFees.value.push(feeId);
      }
    };
    const getTransactionsForFee = feeId => {
      return transactions.value.filter(t => t.feeId === feeId || Array.isArray(t.feeIds) && t.feeIds.includes(feeId));
    };
    const addFeeDialogVisible = ref(false);
    const editingFee = ref(null);
    const newFeeData = reactive({
      type: '',
      customName: '',
      amount: 0,
      description: ''
    });
    const openNewFeeDialog = () => {
      editingFee.value = null;
      newFeeData.type = '';
      newFeeData.customName = '';
      newFeeData.amount = 0;
      newFeeData.description = '';
      addFeeDialogVisible.value = true;
    };
    const openEditFeeDialog = fee => {
      editingFee.value = fee;
      newFeeData.type = fee.type;
      newFeeData.customName = fee.name;
      newFeeData.amount = fee.amount;
      newFeeData.description = fee.description;
      addFeeDialogVisible.value = true;
    };
    const confirmAddFee = () => {
      const feeName = newFeeData.type === 'other' ? newFeeData.customName : manualFeeTypes.find(t => t.value === newFeeData.type)?.label || '費用';
      if (editingFee.value) {
        const fee = feeItems.value.find(f => f.id === editingFee.value.id);
        if (fee) {
          fee.name = feeName;
          fee.amount = newFeeData.amount;
          fee.description = newFeeData.description;
          fee.type = newFeeData.type;
        }
        feedback.ElMessage.success('費用已更新');
        addAuditLog('編輯', `編輯費用 [${feeName}] ¥${newFeeData.amount}`);
      } else {
        const feeId = 'FEE-' + Date.now();
        const feePhase = orderStatus.value === 'completed' ? 'post' : 'rental';
        feeItems.value.push({
          id: feeId,
          type: newFeeData.type,
          source: 'manual',
          name: feeName,
          description: newFeeData.description,
          amount: newFeeData.amount,
          paidAmount: 0,
          status: isMonthlyBilling.value ? 'monthly_billing' : 'pending',
          phase: feePhase,
          notifyStatus: !isMonthlyBilling.value && feePhase === 'post' ? 'pending' : undefined,
          createdAt: new Date().toLocaleString(),
          createdBy: 'Admin',
          attachments: [],
          reminder: null,
          editable: true
        });
        if (isMonthlyBilling.value && feePhase === 'post') {
          createMonthlyBillTransaction(feeId, newFeeData.amount, `完成後追加費用：${feeName}`);
        }
        feedback.ElMessage.success('費用已添加');
        addAuditLog('新增', `人工添加費用 [${feeName}] ¥${newFeeData.amount}`);
      }
      addFeeDialogVisible.value = false;
    };
    const notifyCustomerForCharge = fee => {
      if (isMonthlyBilling.value) {
        feedback.ElMessage.info('企業月結訂單的追繳費用直接進入企業賬單，無需發送客戶支付通知');
        return;
      }
      const targetName = '客戶';
      const targetChannel = 'APP推送、短信';
      feedback.ElMessageBox.confirm(`確定向${targetName}發送追繳通知嗎？\n\n費用項目：${fee.name}\n金額：¥${formatNumber(fee.amount)}\n\n系統將通過${targetChannel}完成通知。`, '發送追繳通知', {
        confirmButtonText: '確定發送',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const loading = feedback.ElLoading.service({
          text: '正在發送通知...'
        });
        window.setTimeout(() => {
          loading.close();
          const feeItem = feeItems.value.find(f => f.id === fee.id);
          if (feeItem) {
            feeItem.notifyStatus = 'notified';
            feeItem.notifiedAt = new Date().toLocaleString();
          }
          feedback.ElMessage.success(`追繳通知已發送至${targetName}`);
          addAuditLog('追繳通知', `向${targetName}發送追繳通知 [${fee.name}] ¥${fee.amount}`);
        }, 1000);
      }).catch(() => {});
    };
    const confirmDeleteFee = fee => {
      feedback.ElMessageBox.confirm('確定刪除此費用項嗎？', '刪除確認', {
        confirmButtonText: '確定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const idx = feeItems.value.findIndex(f => f.id === fee.id);
        if (idx >= 0) {
          feeItems.value.splice(idx, 1);
          addAuditLog('刪除', `刪除費用 [${fee.name}] ¥${fee.amount}`);
          feedback.ElMessage.success('費用已刪除');
        }
      }).catch(() => {});
    };
    const handleExceed = () => {
      feedback.ElMessage.warning('最多上傳3張憑證');
    };
    const collectPaymentDialogVisible = ref(false);
    const collectingFee = ref(null);
    const paymentChannelType = ref('online');
    const selectedPaymentChannel = ref('jkopay');
    const offlineRefNo = ref('');
    const collectAmount = ref(0);
    const openCollectPayment = fee => {
      if (isMonthlyBilling.value) {
        feedback.ElMessage.info('企業月結訂單不需要客戶收款');
        return;
      }
      collectingFee.value = fee;
      paymentChannelType.value = 'online';
      selectedPaymentChannel.value = 'jkopay';
      offlineRefNo.value = '';
      collectAmount.value = fee.amount - fee.paidAmount;
      collectPaymentDialogVisible.value = true;
    };
    const confirmCollectPayment = () => {
      const fee = feeItems.value.find(f => f.id === collectingFee.value.id);
      if (!fee) return;
      transactions.value.push({
        id: 'TXN-' + Date.now(),
        feeId: fee.id,
        type: 'payment',
        amount: collectAmount.value,
        channel: selectedPaymentChannel.value,
        channelType: paymentChannelType.value,
        refNo: paymentChannelType.value === 'offline' ? offlineRefNo.value : `${selectedPaymentChannel.value.toUpperCase()}-${Date.now()}`,
        status: 'confirmed',
        receiptImage: null,
        operator: 'Admin',
        createdAt: new Date().toLocaleString(),
        remark: ''
      });
      fee.paidAmount += collectAmount.value;
      if (fee.paidAmount >= fee.amount) {
        fee.status = 'paid';
      } else {
        fee.status = 'partial';
      }
      feedback.ElMessage.success('收款成功');
      addAuditLog('收款', `收款 [${fee.name}] ¥${collectAmount.value} via ${getChannelName(selectedPaymentChannel.value)}`);
      collectPaymentDialogVisible.value = false;
    };
    const refundDialogVisible = ref(false);
    const refundingFee = ref(null);
    const selectedRefundTxn = ref('');
    const refundAmount = ref(0);
    const offlineRefundMethod = ref('cash');
    const refundTransferInfo = ref('');
    const refundReason = ref('');
    const refundableTxns = computed(() => {
      if (!refundingFee.value) return [];
      return transactions.value.filter(t => {
        const feeIds = Array.isArray(t.feeIds) ? t.feeIds : t.feeId ? [t.feeId] : [];
        return feeIds.includes(refundingFee.value.id) && t.type === 'payment' && t.status === 'confirmed';
      });
    });
    const openRefundDialog = fee => {
      refundingFee.value = fee;
      selectedRefundTxn.value = '';
      refundAmount.value = 0;
      offlineRefundMethod.value = 'cash';
      refundTransferInfo.value = '';
      refundReason.value = '';
      refundDialogVisible.value = true;
    };
    const getSelectedTxnAmount = () => {
      const txn = transactions.value.find(t => t.id === selectedRefundTxn.value);
      return txn ? txn.amount : 0;
    };
    const getSelectedTxnChannelType = () => {
      const txn = transactions.value.find(t => t.id === selectedRefundTxn.value);
      return txn ? txn.channelType : 'online';
    };
    const getSelectedTxnChannel = () => {
      const txn = transactions.value.find(t => t.id === selectedRefundTxn.value);
      return txn ? txn.channel : '';
    };
    const confirmRefund = () => {
      if (!selectedRefundTxn.value || refundAmount.value <= 0) {
        feedback.ElMessage.warning('請選擇交易並填寫退款金額');
        return;
      }
      const originalTxn = transactions.value.find(t => t.id === selectedRefundTxn.value);
      if (!originalTxn) return;
      transactions.value.push({
        id: 'TXN-' + Date.now(),
        feeId: refundingFee.value.id,
        feeIds: [refundingFee.value.id],
        type: 'refund',
        amount: refundAmount.value,
        channel: originalTxn.channelType === 'online' ? originalTxn.channel : offlineRefundMethod.value,
        channelType: originalTxn.channelType,
        refNo: `REF-${Date.now()}`,
        status: 'confirmed',
        receiptImage: null,
        operator: 'Admin',
        createdAt: new Date().toLocaleString(),
        remark: refundReason.value
      });
      const fee = feeItems.value.find(f => f.id === refundingFee.value.id);
      if (fee) {
        fee.paidAmount = Math.max(0, fee.paidAmount - refundAmount.value);
        if (fee.paidAmount === 0) {
          fee.status = 'refunded';
        } else {
          fee.status = 'partial';
        }
        addAuditLog('退款', `退款 [${fee.name}] ¥${refundAmount.value}`);
      }
      feedback.ElMessage.success('退款成功');
      refundDialogVisible.value = false;
    };
    const reminderDialogVisible = ref(false);
    const reminderFee = ref(null);
    const reminderDate = ref('');
    const openReminderDialog = fee => {
      reminderFee.value = fee;
      reminderDate.value = fee.reminder?.date || '';
      reminderDialogVisible.value = true;
    };
    const confirmReminder = () => {
      const fee = feeItems.value.find(f => f.id === reminderFee.value.id);
      if (fee && reminderDate.value) {
        fee.reminder = {
          date: reminderDate.value,
          notified: false
        };
        addAuditLog('提醒', `設置收款提醒 [${fee.name}] 日期:${reminderDate.value}`);
        feedback.ElMessage.success('提醒已設置');
      }
      reminderDialogVisible.value = false;
    };
    const cancelOrderDialogVisible = ref(false);
    const cancelOrderData = ref({
      type: 'free',
      originalType: 'free',
      isExempt: false,
      timeDiffText: '',
      paidAmount: 0,
      cancelFee: 0,
      refundAmount: 0,
      preAuthAction: '',
      reason: '',
      remark: ''
    });
    const isConfirmedIncomeTransaction = t => (t.type === 'payment' || t.type === 'settlement' || t.type === 'pre_auth' && t.txnType === 'pre_auth_capture') && t.status === 'confirmed';
    const getConfirmedPaymentTotal = () => transactions.value.filter(isConfirmedIncomeTransaction).reduce((sum, t) => sum + t.amount, 0);
    const releaseDispatchResource = () => {
      pickupInterrupted.value = false;
      pickupLock.startedAt = '';
      pickupLock.expiresAt = '';
    };
    const recordPreAuthRelease = (feeId, amount, remark) => {
      if (isMonthlyBilling.value || amount <= 0) return;
      transactions.value.unshift({
        id: 'TXN-REL-' + Date.now(),
        feeIds: feeId ? [feeId] : [],
        type: 'pre_auth',
        txnType: 'pre_auth_release',
        amount,
        channel: 'credit_card',
        channelType: 'online',
        refNo: 'REL-' + Date.now(),
        status: 'confirmed',
        receiptImage: null,
        operator: 'system',
        createdAt: new Date().toLocaleString(),
        remark
      });
      paymentData.preAuthStatus = 'released';
      syncPreAuthRecord('released', '預授權釋放');
    };
    const recordOrderRefund = (amount, remark) => {
      if (isMonthlyBilling.value || amount <= 0) return;
      transactions.value.unshift({
        id: 'TXN-REF-' + Date.now(),
        feeIds: [],
        type: 'refund',
        txnType: 'order_refund',
        amount,
        channel: 'original',
        channelType: 'online',
        refNo: 'REF-' + Date.now(),
        status: 'confirmed',
        receiptImage: null,
        operator: 'system',
        createdAt: new Date().toLocaleString(),
        remark
      });
    };
    const openCancelOrderModal = () => {
      if (!canCancel.value) {
        feedback.ElMessage.warning('當前訂單狀態不可取消');
        return;
      }
      const mockHoursBefore = orderStatus.value === 'pending_payment' ? 48 : orderStatus.value === 'pickup_overdue' ? -2 : 5;
      cancelOrderData.value.timeDiffText = mockHoursBefore >= 0 ? mockHoursBefore + ' 小時' : '已逾期 ' + Math.abs(mockHoursBefore) + ' 小時';
      cancelOrderData.value.paidAmount = isMonthlyBilling.value ? paymentData.orderTotal : getConfirmedPaymentTotal();
      const cancelBaseAmount = isMonthlyBilling.value ? paymentData.orderTotal : paymentData.preAuthAmount;
      if (orderStatus.value === 'pending_payment' || mockHoursBefore >= 24) {
        cancelOrderData.value.type = 'free';
        cancelOrderData.value.originalType = 'free';
        cancelOrderData.value.cancelFee = 0;
      } else if (mockHoursBefore >= 12) {
        cancelOrderData.value.type = 'liable';
        cancelOrderData.value.originalType = 'liable';
        cancelOrderData.value.cancelFee = cancelBaseAmount * 0.2;
      } else if (mockHoursBefore >= 2) {
        cancelOrderData.value.type = 'liable';
        cancelOrderData.value.originalType = 'liable';
        cancelOrderData.value.cancelFee = cancelBaseAmount * 0.5;
      } else {
        cancelOrderData.value.type = 'liable';
        cancelOrderData.value.originalType = 'liable';
        cancelOrderData.value.cancelFee = cancelBaseAmount;
      }
      cancelOrderData.value.cancelFee = Math.round(cancelOrderData.value.cancelFee);
      cancelOrderData.value.preAuthAction = isMonthlyBilling.value ? '不處理預授權' : cancelOrderData.value.cancelFee > 0 ? '扣取取消費後釋放剩餘額度' : '釋放預授權';
      cancelOrderData.value.isExempt = false;
      cancelOrderData.value.refundAmount = isMonthlyBilling.value ? cancelOrderData.value.cancelFee : Math.max(0, cancelOrderData.value.paidAmount - cancelOrderData.value.cancelFee);
      cancelOrderData.value.reason = '';
      cancelOrderDialogVisible.value = true;
    };
    const updateCancelFee = () => {
      if (cancelOrderData.value.isExempt) {
        cancelOrderData.value.type = 'free';
        cancelOrderData.value.cancelFee = 0;
      } else {
        cancelOrderData.value.type = cancelOrderData.value.originalType;
        const mockHoursBefore = 5;
        const cancelBaseAmount = isMonthlyBilling.value ? paymentData.orderTotal : paymentData.preAuthAmount;
        if (mockHoursBefore < 2) cancelOrderData.value.cancelFee = cancelBaseAmount;else if (mockHoursBefore < 12) cancelOrderData.value.cancelFee = cancelBaseAmount * 0.5;else if (mockHoursBefore < 24) cancelOrderData.value.cancelFee = cancelBaseAmount * 0.2;
      }
      cancelOrderData.value.cancelFee = Math.round(cancelOrderData.value.cancelFee);
      cancelOrderData.value.refundAmount = isMonthlyBilling.value ? cancelOrderData.value.cancelFee : Math.max(0, cancelOrderData.value.paidAmount - cancelOrderData.value.cancelFee);
      cancelOrderData.value.preAuthAction = isMonthlyBilling.value ? '不處理預授權' : cancelOrderData.value.cancelFee > 0 ? '扣取取消費後釋放剩餘額度' : '釋放預授權';
    };
    const confirmCancelOrder = () => {
      if (!cancelOrderData.value.reason) {
        feedback.ElMessage.warning('請選擇取消原因');
        return;
      }
      let feeId = null;
      const preAuthAvailable = !isMonthlyBilling.value && paymentData.preAuthStatus === 'frozen' ? paymentData.preAuthAmount : 0;
      const paidAvailable = !isMonthlyBilling.value ? getConfirmedPaymentTotal() : 0;
      const capturedAmount = isMonthlyBilling.value ? 0 : Math.min(cancelOrderData.value.cancelFee, preAuthAvailable > 0 ? preAuthAvailable : paidAvailable);
      const preAuthCaptureAmount = preAuthAvailable > 0 ? capturedAmount : 0;
      if (cancelOrderData.value.cancelFee > 0) {
        feeId = 'FEE-CANCEL-' + Date.now();
        feeItems.value.unshift({
          id: feeId,
          type: 'cancellation_fee',
          source: 'system',
          name: '取消費',
          description: cancelOrderData.value.reason,
          amount: cancelOrderData.value.cancelFee,
          paidAmount: capturedAmount,
          status: isMonthlyBilling.value ? 'monthly_billing' : capturedAmount >= cancelOrderData.value.cancelFee ? 'paid' : 'partial',
          phase: 'rental',
          createdAt: new Date().toLocaleString(),
          createdBy: 'system',
          attachments: [],
          reminder: !isMonthlyBilling.value && capturedAmount < cancelOrderData.value.cancelFee ? {
            date: new Date().toISOString().split('T')[0],
            notified: false
          } : null,
          editable: false
        });
        if (!isMonthlyBilling.value && preAuthCaptureAmount > 0) {
          transactions.value.unshift({
            id: 'TXN-CANCEL-' + Date.now(),
            feeIds: [feeId],
            type: 'pre_auth',
            txnType: 'pre_auth_capture',
            amount: preAuthCaptureAmount,
            channel: 'credit_card',
            channelType: 'online',
            refNo: 'CAP-CANCEL-' + Date.now(),
            status: 'confirmed',
            receiptImage: null,
            operator: 'system',
            createdAt: new Date().toLocaleString(),
            remark: '取消費預授權扣款'
          });
        } else {
          createMonthlyBillTransaction(feeId, cancelOrderData.value.cancelFee, `取消費：${cancelOrderData.value.reason}`);
        }
      }
      recordPreAuthRelease(feeId, Math.max(0, preAuthAvailable - preAuthCaptureAmount), '取消訂單釋放剩餘預授權');
      recordOrderRefund(cancelOrderData.value.refundAmount, `取消訂單退款：${cancelOrderData.value.reason}`);
      releaseDispatchResource();
      operationRecords.value.unshift({
        title: '取消訂單',
        content: `取消原因：${cancelOrderData.value.reason}，取消費 ¥${formatNumber(cancelOrderData.value.cancelFee)}`,
        timestamp: new Date().toLocaleString(),
        sortTime: Date.now(),
        operator: '門店管理員 (當前)',
        memo: cancelOrderData.value.remark || '標準取消',
        color: '#909399'
      });
      feedback.ElMessage.success(isMonthlyBilling.value ? cancelOrderData.value.cancelFee > 0 ? '訂單已取消，取消費用已進入企業月結賬單' : '訂單已取消，未生成企業掛賬' : '訂單已取消，退款流程已啓動');
      orderStatus.value = 'cancelled';
      cancelOrderDialogVisible.value = false;
    };
    const noShowDialogVisible = ref(false);
    const noShowData = reactive({
      pickupTime: '2026/01/28 10:00',
      holdHours: 2,
      feeAmount: 0,
      preAuthAmount: 0,
      paymentDue: 0,
      reason: '',
      remark: ''
    });
    const openNoShowModal = () => {
      if (orderStatus.value !== 'pickup_overdue') {
        feedback.ElMessage.warning('僅逾期未取訂單可標記爽約');
        return;
      }
      noShowData.pickupTime = '2026/01/28 10:00';
      noShowData.holdHours = 2;
      noShowData.feeAmount = 200;
      noShowData.preAuthAmount = isMonthlyBilling.value ? 0 : paymentData.preAuthStatus === 'frozen' ? paymentData.preAuthAmount : 0;
      noShowData.paymentDue = isMonthlyBilling.value ? noShowData.feeAmount : Math.max(0, noShowData.feeAmount - noShowData.preAuthAmount);
      noShowData.reason = '';
      noShowData.remark = '';
      noShowDialogVisible.value = true;
    };
    const confirmNoShow = () => {
      if (!noShowData.reason) {
        feedback.ElMessage.warning('請選擇聯繫結果');
        return;
      }
      const feeId = 'FEE-NOSHOW-' + Date.now();
      const paidAmount = isMonthlyBilling.value ? 0 : Math.min(noShowData.feeAmount, noShowData.preAuthAmount);
      feeItems.value.unshift({
        id: feeId,
        type: 'no_show_fee',
        source: 'system',
        name: '爽約費',
        description: noShowData.reason,
        amount: noShowData.feeAmount,
        paidAmount,
        status: isMonthlyBilling.value ? 'monthly_billing' : noShowData.paymentDue > 0 ? 'partial' : 'paid',
        phase: 'rental',
        createdAt: new Date().toLocaleString(),
        createdBy: 'system',
        attachments: [],
        reminder: !isMonthlyBilling.value && noShowData.paymentDue > 0 ? {
          date: new Date().toISOString().split('T')[0],
          notified: false
        } : null,
        editable: false
      });
      if (paidAmount > 0) {
        transactions.value.unshift({
          id: 'TXN-NOSHOW-' + Date.now(),
          feeIds: [feeId],
          type: 'pre_auth',
          txnType: 'pre_auth_capture',
          amount: paidAmount,
          channel: 'credit_card',
          channelType: 'online',
          refNo: 'CAP-NOSHOW-' + Date.now(),
          status: 'confirmed',
          receiptImage: null,
          operator: 'system',
          createdAt: new Date().toLocaleString(),
          remark: '爽約費預授權扣款'
        });
      } else if (isMonthlyBilling.value && noShowData.feeAmount > 0) {
        createMonthlyBillTransaction(feeId, noShowData.feeAmount, `爽約費：${noShowData.reason}`);
      }
      recordPreAuthRelease(feeId, Math.max(0, noShowData.preAuthAmount - paidAmount), '爽約處理釋放剩餘預授權');
      releaseDispatchResource();
      operationRecords.value.unshift({
        title: '標記爽約',
        content: isMonthlyBilling.value ? `爽約費 ¥${formatNumber(noShowData.feeAmount)}，企業月結掛賬` : `爽約費 ¥${formatNumber(noShowData.feeAmount)}，待補繳 ¥${formatNumber(noShowData.paymentDue)}`,
        timestamp: new Date().toLocaleString(),
        sortTime: Date.now(),
        operator: '門店管理員 (當前)',
        memo: noShowData.remark || noShowData.reason,
        color: '#909399'
      });
      orderStatus.value = 'no_show';
      noShowDialogVisible.value = false;
      feedback.ElMessage.success(isMonthlyBilling.value ? '已標記爽約，爽約費用已進入企業月結賬單' : '已標記爽約，車輛資源已釋放');
    };
    const rejectOrderDialogVisible = ref(false);
    const rejectOrderData = reactive({
      feeAmount: 0,
      preAuthAmount: 0,
      paymentDue: 0,
      preAuthAction: '',
      reason: '',
      remark: ''
    });
    const updateRejectFee = () => {
      rejectOrderData.preAuthAmount = isMonthlyBilling.value ? 0 : paymentData.preAuthStatus === 'frozen' ? paymentData.preAuthAmount : 0;
      rejectOrderData.paymentDue = isMonthlyBilling.value ? rejectOrderData.feeAmount : Math.max(0, rejectOrderData.feeAmount - rejectOrderData.preAuthAmount);
      if (isMonthlyBilling.value) {
        rejectOrderData.preAuthAction = '不處理預授權';
      } else if (rejectOrderData.feeAmount > 0 && rejectOrderData.preAuthAmount > 0) {
        rejectOrderData.preAuthAction = rejectOrderData.paymentDue > 0 ? '扣取全部預授權後補繳差額' : '扣取拒絕履約費用後釋放剩餘額度';
      } else {
        rejectOrderData.preAuthAction = rejectOrderData.preAuthAmount > 0 ? '釋放預授權' : '無凍結預授權';
      }
    };
    const openRejectOrderModal = () => {
      rejectOrderData.feeAmount = 0;
      rejectOrderData.preAuthAmount = isMonthlyBilling.value ? 0 : paymentData.preAuthStatus === 'frozen' ? paymentData.preAuthAmount : 0;
      rejectOrderData.paymentDue = 0;
      rejectOrderData.preAuthAction = isMonthlyBilling.value ? '不處理預授權' : rejectOrderData.preAuthAmount > 0 ? '釋放預授權' : '無凍結預授權';
      rejectOrderData.reason = '';
      rejectOrderData.remark = '';
      rejectOrderDialogVisible.value = true;
    };
    const confirmRejectOrder = () => {
      if (!rejectOrderData.reason) {
        feedback.ElMessage.warning('請選擇拒絕原因');
        return;
      }
      if (rejectOrderData.feeAmount > 0) {
        const feeId = 'FEE-REJECT-' + Date.now();
        const paidAmount = isMonthlyBilling.value ? 0 : Math.min(rejectOrderData.feeAmount, rejectOrderData.preAuthAmount);
        feeItems.value.unshift({
          id: feeId,
          type: 'rejection_fee',
          source: 'manual',
          name: '拒絕履約費用',
          description: rejectOrderData.reason,
          amount: rejectOrderData.feeAmount,
          paidAmount,
          status: isMonthlyBilling.value ? 'monthly_billing' : rejectOrderData.paymentDue > 0 ? paidAmount > 0 ? 'partial' : 'pending' : 'paid',
          phase: 'rental',
          createdAt: new Date().toLocaleString(),
          createdBy: '門店管理員',
          attachments: [],
          reminder: !isMonthlyBilling.value && rejectOrderData.paymentDue > 0 ? {
            date: new Date().toISOString().split('T')[0],
            notified: false
          } : null,
          editable: false
        });
        if (paidAmount > 0) {
          transactions.value.unshift({
            id: 'TXN-REJECT-' + Date.now(),
            feeIds: [feeId],
            type: 'pre_auth',
            txnType: 'pre_auth_capture',
            amount: paidAmount,
            channel: 'credit_card',
            channelType: 'online',
            refNo: 'CAP-REJECT-' + Date.now(),
            status: 'confirmed',
            receiptImage: null,
            operator: 'system',
            createdAt: new Date().toLocaleString(),
            remark: '拒絕履約費用預授權扣款'
          });
        } else if (isMonthlyBilling.value && rejectOrderData.feeAmount > 0) {
          createMonthlyBillTransaction(feeId, rejectOrderData.feeAmount, `拒絕履約費用：${rejectOrderData.reason}`);
        }
      }
      recordPreAuthRelease(null, Math.max(0, rejectOrderData.preAuthAmount - Math.min(rejectOrderData.feeAmount, rejectOrderData.preAuthAmount)), '拒絕履約釋放剩餘預授權');
      releaseDispatchResource();
      pickupModalVisible.value = false;
      operationRecords.value.unshift({
        title: '拒絕履約',
        content: `拒絕原因：${rejectOrderData.reason}，拒絕履約費用 ¥${formatNumber(rejectOrderData.feeAmount)}`,
        timestamp: new Date().toLocaleString(),
        sortTime: Date.now(),
        operator: '門店管理員 (當前)',
        memo: rejectOrderData.remark || '取車資質不通過',
        color: '#F56C6C'
      });
      orderStatus.value = 'rejected';
      rejectOrderDialogVisible.value = false;
      feedback.ElMessage.success(isMonthlyBilling.value ? '已拒絕履約，相關費用已進入企業月結賬單' : '已拒絕履約，車輛資源已釋放');
    };
    const closeOrderDialogVisible = ref(false);
    const closeOrderData = ref({
      refundItems: [],
      totalRefund: 0,
      preAuthAction: '',
      reason: '',
      remark: '',
      confirmed: false
    });
    const openCloseOrderModal = () => {
      if (!canClose.value) {
        feedback.ElMessage.warning('當前訂單狀態不可關閉');
        return;
      }
      const payments = isMonthlyBilling.value ? [] : transactions.value.filter(isConfirmedIncomeTransaction);
      closeOrderData.value.refundItems = payments.map(t => ({
        id: t.id,
        name: t.item || t.feeName || t.remark || '預付費用',
        amount: t.amount
      }));
      closeOrderData.value.totalRefund = payments.reduce((sum, t) => sum + t.amount, 0);
      closeOrderData.value.preAuthAction = isMonthlyBilling.value ? '不處理預授權' : paymentData.preAuthStatus === 'frozen' ? '釋放預授權' : '無凍結預授權';
      closeOrderData.value.reason = '';
      closeOrderData.value.remark = '';
      closeOrderData.value.confirmed = false;
      closeOrderDialogVisible.value = true;
    };
    const confirmCloseOrder = () => {
      if (!closeOrderData.value.reason) {
        feedback.ElMessage.warning('請選擇關閉原因');
        return;
      }
      recordOrderRefund(closeOrderData.value.totalRefund, `關閉訂單全額退款：${closeOrderData.value.reason}`);
      recordPreAuthRelease(null, !isMonthlyBilling.value && paymentData.preAuthStatus === 'frozen' ? paymentData.preAuthAmount : 0, '關閉訂單釋放預授權');
      releaseDispatchResource();
      cancelOrderDialogVisible.value = false;
      closeOrderDialogVisible.value = false;
      operationRecords.value.unshift({
        title: '關閉訂單',
        content: isMonthlyBilling.value ? `關閉原因：${closeOrderData.value.reason}，不生成企業掛賬` : `關閉原因：${closeOrderData.value.reason}，全額退款 ¥${formatNumber(closeOrderData.value.totalRefund)}`,
        timestamp: new Date().toLocaleString(),
        sortTime: Date.now(),
        operator: '店長 (當前)',
        memo: closeOrderData.value.remark || '客戶無責異常關閉',
        color: '#C0392B'
      });
      feedback.ElMessage.success(isMonthlyBilling.value ? '訂單已關閉，未生成企業掛賬' : '訂單已關閉，全額退款流程已啓動');
      orderStatus.value = 'closed';
    };
    const markReminded = fee => {
      if (fee.reminder) {
        fee.reminder.notified = true;
        addAuditLog('提醒', `已標記 [${fee.name}] 爲已提醒`);
        feedback.ElMessage.success('已標記爲已提醒');
      }
    };
    const handleFeeCommand = payload => {
      const {
        type,
        fee
      } = payload;
      switch (type) {
        case 'refund':
          openRefundDialog(fee);
          break;
        case 'edit':
          openEditFeeDialog(fee);
          break;
        case 'delete':
          confirmDeleteFee(fee);
          break;
        case 'reminder':
          openReminderDialog(fee);
          break;
        case 'markReminded':
          markReminded(fee);
          break;
      }
    };
    const showAuditLog = ref(false);
    const feeAuditLogs = ref([{
      id: 'LOG-001',
      time: '2026-01-28 10:00',
      action: '新增',
      detail: '系統自動添加費用 [車輛租金] ¥1,920',
      operator: 'system'
    }, {
      id: 'LOG-002',
      time: '2026-01-28 09:40',
      action: '收款',
      detail: '取車補收租金尾款 [車輛租金] ¥1,920 via 街口支付',
      operator: 'system'
    }, {
      id: 'LOG-003',
      time: '2026-01-30 14:00',
      action: '新增',
      detail: '系統自動添加費用 [超時費] ¥100',
      operator: 'system'
    }, {
      id: 'LOG-004',
      time: '2026-01-30 15:00',
      action: '新增',
      detail: '人工添加費用 [車輛清潔費] ¥200',
      operator: 'Admin'
    }]);
    const getLogActionType = action => {
      const map = {
        '新增': 'primary',
        '編輯': 'warning',
        '刪除': 'danger',
        '收款': 'success',
        '退款': 'danger',
        '提醒': 'info'
      };
      return map[action] || 'info';
    };
    const addAuditLog = (action, detail) => {
      feeAuditLogs.value.unshift({
        id: 'LOG-' + Date.now(),
        time: new Date().toLocaleString(),
        action: action,
        detail: detail,
        operator: 'Admin'
      });
    };
    const recentFeeAuditLogs = computed(() => feeAuditLogs.value.slice(0, 4));
    const openFeeAuditLog = () => {
      feeModalVisible.value = true;
      showAuditLog.value = true;
    };
    const accidentDialogVisible = ref(false);
    const isAddingAccident = ref(false);
    const newAccidentForm = reactive({
      description: '',
      accidentTime: new Date(),
      location: '',
      responsibility: '',
      estimatedAmount: 0,
      handlingStatus: 'pending_assessment',
      insuranceNo: '',
      remark: '',
      photos: []
    });
    const getAccidentResponsibilityText = value => {
      const map = {
        customer: '客戶責任',
        store: '門店責任',
        third_party: '第三方責任',
        pending: '責任待定'
      };
      return map[value] || '責任待定';
    };
    const getAccidentStatusText = value => {
      const map = {
        pending_assessment: '待定損',
        insurance_processing: '保險處理中',
        customer_confirming: '客戶確認中',
        closed: '已結案',
        pending: '待定損'
      };
      return map[value] || '待定損';
    };
    const accidentContextHint = computed(() => {
      if (['renting', 'renewing', 'overdue'].includes(orderStatus.value)) {
        return {
          title: '履約中登記事故後，訂單進入出險處理中',
          status: '進入出險處理中',
          fee: isMonthlyBilling.value ? '費用進入企業月結' : '費用納入還車結算',
          desc: '車輛仍可繼續辦理還車，事故費用、責任歸屬和處理狀態會進入履約事件和費用中心。'
        };
      }
      if (orderStatus.value === 'accident_processing') {
        return {
          title: '出險處理中可追加事故進度和費用',
          status: '保持出險處理中',
          fee: isMonthlyBilling.value ? '費用進入企業月結' : '費用納入還車結算',
          desc: '追加記錄用於更新責任、定損、保險和客戶確認結果；車輛歸還後進入還車結算。'
        };
      }
      if (returnSettlementStatuses.includes(orderStatus.value)) {
        return {
          title: '結算中登記事故，訂單保持當前結算狀態',
          status: orderStatusText.value,
          fee: isMonthlyBilling.value ? '費用進入企業月結' : '費用納入當前結算',
          desc: '事故費用參與還車賬單；費用未確認時，訂單可停留在待結算繼續處理。'
        };
      }
      if (orderStatus.value === 'completed') {
        return {
          title: '已完成訂單補錄事故，主狀態保持已完成',
          status: '主狀態不變',
          fee: isMonthlyBilling.value ? '直接月結掛賬' : '生成完成後追繳',
          desc: '補錄費用不回退訂單狀態，客戶自付走追繳通知和收款，企業月結直接生成企業掛賬記錄。'
        };
      }
      return {
        title: '事故登記用於記錄租期內或完成後的事故線索',
        status: orderStatusText.value,
        fee: isMonthlyBilling.value ? '企業月結' : '客戶自付',
        desc: '保存後會寫入事故記錄、履約事件和費用審計。'
      };
    });
    const openAccidentModal = () => {
      if (!canAccident.value) {
        feedback.ElMessage.warning('當前訂單狀態不可登記事故');
        return;
      }
      isAddingAccident.value = accidentRecords.value.length === 0;
      newAccidentForm.accidentTime = new Date();
      newAccidentForm.location = '';
      newAccidentForm.responsibility = '';
      newAccidentForm.estimatedAmount = 0;
      newAccidentForm.handlingStatus = 'pending_assessment';
      newAccidentForm.insuranceNo = '';
      newAccidentForm.remark = '';
      accidentDialogVisible.value = true;
    };
    const openAccidentRecords = () => {
      isAddingAccident.value = false;
      accidentDialogVisible.value = true;
    };
    const saveAccident = () => {
      if (!newAccidentForm.description) {
        feedback.ElMessage.warning('請填寫事故描述');
        return;
      }
      if (!newAccidentForm.responsibility) {
        feedback.ElMessage.warning('請選擇責任歸屬');
        return;
      }
      const accidentAmount = Math.round(newAccidentForm.estimatedAmount || 0);
      const accidentTime = newAccidentForm.accidentTime ? new Date(newAccidentForm.accidentTime).toLocaleString() : new Date().toLocaleString();
      const newRecord = {
        id: Date.now(),
        time: accidentTime,
        sortTime: Date.now(),
        operator: 'Admin',
        description: newAccidentForm.description,
        location: newAccidentForm.location,
        responsibility: newAccidentForm.responsibility,
        amount: accidentAmount,
        status: newAccidentForm.handlingStatus,
        insuranceNo: newAccidentForm.insuranceNo,
        remark: newAccidentForm.remark,
        photos: [1, 2]
      };
      accidentRecords.value.unshift(newRecord);
      if (accidentAmount > 0 && newAccidentForm.responsibility !== 'store') {
        const feeId = 'FEE-ACC-' + Date.now();
        const feePhase = orderStatus.value === 'completed' ? 'post' : 'rental';
        feeItems.value.unshift({
          id: feeId,
          type: 'accident_damage',
          source: 'manual',
          name: '事故車損費用',
          description: newAccidentForm.description,
          amount: accidentAmount,
          paidAmount: 0,
          status: isMonthlyBilling.value ? 'monthly_billing' : 'pending',
          phase: feePhase,
          relatedAccidentId: newRecord.id,
          notifyStatus: !isMonthlyBilling.value && feePhase === 'post' ? 'pending' : undefined,
          createdAt: new Date().toLocaleString(),
          createdBy: 'Admin',
          attachments: [],
          reminder: isMonthlyBilling.value ? null : {
            date: new Date().toISOString().split('T')[0],
            notified: false
          },
          editable: true
        });
        if (isMonthlyBilling.value && feePhase === 'post') {
          createMonthlyBillTransaction(feeId, accidentAmount, `完成後事故費用：${newAccidentForm.description}`);
        }
        if (feePhase === 'post') {
          postChargeView.amount += accidentAmount;
          postChargeView.count += 1;
          postChargeView.status = isMonthlyBilling.value ? 'monthly_billing' : 'pending_notify';
        }
        addAuditLog('新增', `新增事故車損費用 [事故車損費用] ¥${accidentAmount}`);
      }
      if (['renting', 'renewing', 'overdue'].includes(orderStatus.value)) {
        orderStatus.value = 'accident_processing';
      }
      operationRecords.value.unshift({
        title: '事故登記',
        content: `${getAccidentResponsibilityText(newAccidentForm.responsibility)}，預估費用 ¥${formatNumber(accidentAmount)}`,
        timestamp: new Date().toLocaleString(),
        sortTime: Date.now(),
        operator: '門店管理員 (當前)',
        memo: newAccidentForm.remark || newAccidentForm.description,
        color: '#F56C6C'
      });
      feedback.ElMessage.success('事故記錄已登記');
      newAccidentForm.description = '';
      newAccidentForm.location = '';
      newAccidentForm.responsibility = '';
      newAccidentForm.estimatedAmount = 0;
      newAccidentForm.handlingStatus = 'pending_assessment';
      newAccidentForm.insuranceNo = '';
      newAccidentForm.remark = '';
      isAddingAccident.value = false;
      showAccidentRecords.value = true;
    };
    const closeAccidentRecord = record => {
      record.status = 'closed';
      record.closedAt = new Date().toLocaleString();
      addAuditLog('結案', `事故記錄結案 [${record.description}]`);
      operationRecords.value.unshift({
        title: '事故結案',
        content: `${record.description}，${getAccidentResponsibilityText(record.responsibility)}，預估費用 ¥${formatNumber(record.amount || 0)}`,
        timestamp: new Date().toLocaleString(),
        sortTime: Date.now(),
        operator: '門店管理員 (當前)',
        memo: record.insuranceNo ? `保險報案號：${record.insuranceNo}` : '事故處理完成',
        color: '#67C23A'
      });
      feedback.ElMessage.success('事故已標記結案');
    };
    const deleteAccident = index => {
      feedback.ElMessageBox.confirm('確定要刪除這條事故記錄嗎？', '警告', {
        confirmButtonText: '刪除',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        accidentRecords.value.splice(index, 1);
        feedback.ElMessage.success('記錄已刪除');
        if (accidentRecords.value.length === 0) {
          isAddingAccident.value = true;
        }
      }).catch(() => {});
    };
    const orderRemarks = ref('用戶攜帶一隻寵物貓，需準備車內清潔套件。請提前開啓空調。');
    const remarksDialogVisible = ref(false);
    const remarksForm = reactive({
      content: ''
    });
    const showAccidentRecords = ref(false);
    const accidentRecords = ref([{
      id: 1,
      time: '2024/05/03 14:20',
      operator: 'Admin',
      description: '右前保險槓刮擦',
      amount: 1200,
      responsibility: 'customer',
      status: 'pending_assessment',
      location: '臺北市信義路停車場',
      insuranceNo: 'INS-20240503-001',
      photos: [1, 2]
    }]);
    const fulfillmentEventTab = ref('all');
    const parseEventTimestamp = value => {
      if (!value) return 0;
      const parsed = new Date(String(value).replace(/\//g, '-')).getTime();
      return Number.isNaN(parsed) ? 0 : parsed;
    };
    const formatSignedAmount = amount => {
      const value = Math.round(amount || 0);
      if (value > 0) return `+¥${formatNumber(value)}`;
      if (value < 0) return `-¥${formatNumber(value)}`;
      return '同價';
    };
    const getRedirectionSettlementText = record => {
      if (record.priceHandling === 'free') return '免費升等，不補差價';
      if (isMonthlyBilling.value && record.priceChange > 0) return '企業月結調增';
      if (isMonthlyBilling.value && record.priceChange < 0) return '企業月結調減';
      if (record.settlementText) return record.settlementText;
      if (record.priceChange > 0) return '多退少補';
      if (record.priceChange < 0) return '退差價';
      return '不調整費用';
    };
    const suppressOperationInEvents = record => {
      const title = record.title || '';
      return ['事故登記', '訂單改派', '免費升等'].some(keyword => title.includes(keyword));
    };
    const getOperationEventCategory = record => {
      const title = record.title || '';
      if (['取消', '爽約', '拒絕', '關閉'].some(keyword => title.includes(keyword))) return 'exception';
      if (['改派', '車輛分配'].some(keyword => title.includes(keyword))) return 'redirection';
      if (['費用', '支付', '收款', '退款', '預授權', '結算'].some(keyword => title.includes(keyword))) return 'finance';
      return 'operation';
    };
    const getOperationEventTone = record => {
      const title = record.title || '';
      if (record.type === 'danger' || ['#F56C6C', '#C0392B'].includes(record.color) || ['拒絕', '關閉', '爽約'].some(keyword => title.includes(keyword))) {
        return 'danger';
      }
      if (['改派', '車輛分配'].some(keyword => title.includes(keyword))) return 'warning';
      if (record.type === 'success' || record.color === '#67C23A') return 'success';
      if (record.type === 'warning' || record.color === '#E6A23C') return 'warning';
      return 'primary';
    };
    const fulfillmentEvents = computed(() => {
      const accidentEvents = accidentRecords.value.map(record => {
        const closed = record.status === 'closed';
        return {
          key: `accident-${record.id}`,
          kind: 'accident',
          category: 'accident',
          label: '事故',
          title: closed ? '事故已結案' : '事故處理中',
          summary: record.description || '事故記錄',
          time: record.time,
          sortTime: record.sortTime || parseEventTimestamp(record.time),
          operator: record.operator || 'Admin',
          memo: record.remark || '',
          tone: closed ? 'neutral' : 'danger',
          record
        };
      });
      const redirectionEvents = redirectionHistory.value.map(record => ({
        key: `redirection-${record.id}`,
        kind: 'redirection',
        category: 'redirection',
        label: '改派',
        title: record.fromVehicle === '系統自動分配' ? '車輛分配' : '訂單改派',
        summary: record.reason || '車輛改派',
        time: record.time,
        sortTime: record.sortTime || parseEventTimestamp(record.time),
        operator: record.operator || 'Admin',
        memo: getRedirectionSettlementText(record),
        tone: 'warning',
        record
      }));
      const operationEvents = operationRecords.value.filter(record => !suppressOperationInEvents(record)).map((record, index) => ({
        key: `operation-${index}-${record.timestamp}`,
        kind: 'operation',
        category: getOperationEventCategory(record),
        label: '操作',
        title: record.title,
        summary: record.content || '訂單操作記錄',
        time: record.timestamp,
        sortTime: record.sortTime || parseEventTimestamp(record.timestamp),
        operator: record.operator || '-',
        memo: record.memo || '',
        tone: getOperationEventTone(record),
        record
      }));
      return [...accidentEvents, ...redirectionEvents, ...operationEvents].sort((a, b) => b.sortTime - a.sortTime);
    });
    const filteredFulfillmentEvents = computed(() => {
      if (fulfillmentEventTab.value === 'accident') {
        return fulfillmentEvents.value.filter(event => event.category === 'accident');
      }
      if (fulfillmentEventTab.value === 'redirection') {
        return fulfillmentEvents.value.filter(event => event.category === 'redirection');
      }
      if (fulfillmentEventTab.value === 'exception') {
        return fulfillmentEvents.value.filter(event => event.category === 'accident' || event.category === 'exception' || event.tone === 'danger');
      }
      return fulfillmentEvents.value;
    });
    const eventCounts = computed(() => {
      const events = fulfillmentEvents.value;
      return {
        all: events.length,
        exception: events.filter(event => event.category === 'accident' || event.category === 'exception' || event.tone === 'danger').length,
        redirection: events.filter(event => event.category === 'redirection').length,
        accident: accidentRecords.value.length,
        openAccident: accidentRecords.value.filter(record => record.status !== 'closed').length,
        audit: operationRecords.value.length
      };
    });
    const getFulfillmentEventCardClass = event => {
      const map = {
        danger: 'border-red-100 bg-red-50/40',
        warning: 'border-orange-100 bg-orange-50/40',
        success: 'border-emerald-100 bg-emerald-50/40',
        primary: 'border-blue-100 bg-blue-50/40',
        neutral: 'border-gray-100 bg-white'
      };
      return map[event.tone] || map.neutral;
    };
    const getFulfillmentEventDotClass = event => {
      const map = {
        danger: 'bg-red-500',
        warning: 'bg-orange-500',
        success: 'bg-emerald-500',
        primary: 'bg-blue-500',
        neutral: 'bg-gray-300'
      };
      return map[event.tone] || map.neutral;
    };
    const getFulfillmentEventTagType = event => {
      const map = {
        danger: 'danger',
        warning: 'warning',
        success: 'success',
        primary: 'primary',
        neutral: 'info'
      };
      return map[event.tone] || 'info';
    };
    const openRemarksModal = () => {
      remarksForm.content = orderRemarks.value;
      remarksDialogVisible.value = true;
    };
    const saveRemarks = () => {
      orderRemarks.value = remarksForm.content;
      remarksDialogVisible.value = false;
      feedback.ElMessage.success('訂單備註已更新');
    };
    const transactionsDialogVisible = ref(false);
    const openTransactionsDialog = () => {
      transactionsDialogVisible.value = true;
    };
    const enhancedTransactions = computed(() => {
      return transactions.value.map(txn => {
        let feeNames = [];
        if (txn.feeIds && txn.feeIds.length > 0) {
          feeNames = txn.feeIds.map(fid => {
            const fee = feeItems.value.find(f => f.id === fid);
            return fee ? fee.name : fid;
          });
        } else if (txn.feeId) {
          const fee = feeItems.value.find(f => f.id === txn.feeId);
          feeNames = [fee ? fee.name : '未知費用'];
        }
        const feeNameStr = feeNames.length > 1 ? `${feeNames[0]} 等${feeNames.length}項` : feeNames[0] || '未知費用';
        return {
          ...txn,
          feeName: feeNameStr,
          fullFeeNames: feeNames.join(', ')
        };
      }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    });
    const txnSummary = computed(() => {
      let totalIncome = 0;
      let totalRefund = 0;
      let totalMonthlyBill = 0;
      transactions.value.forEach(txn => {
        if (txn.type === 'payment' && txn.status === 'confirmed') {
          totalIncome += txn.amount;
        } else if (txn.type === 'refund' && txn.status === 'confirmed') {
          totalRefund += txn.amount;
        } else if (txn.type === 'monthly_bill' && txn.status === 'confirmed') {
          totalMonthlyBill += txn.amount;
        }
      });
      return {
        totalIncome,
        totalRefund,
        totalMonthlyBill,
        netIncome: totalIncome - totalRefund,
        netMonthlyBill: totalMonthlyBill
      };
    });
    const exportTransactions = () => {
      const loading = feedback.ElLoading.service({
        lock: true,
        text: '正在生成 Excel 報表...',
        background: 'rgba(0, 0, 0, 0.7)'
      });
      window.setTimeout(() => {
        loading.close();
        feedback.ElMessage.success({
          message: '交易記錄已導出: Transaction_History_20260131.xlsx',
          type: 'success',
          duration: 3000
        });
      }, 1500);
    };
    const urlParams = initialUrlParams;
    const urlAction = urlParams.get('action');
    const urlStatus = urlParams.get('status');
    const urlStatusWhitelist = ['pending_payment', 'reserved', 'pickup_overdue', 'inspecting', 'renting', 'renewing', 'overdue', 'accident_processing', 'settlement_pending', 'payment_due', 'refund_pending', 'completed', 'cancelled', 'no_show', 'rejected', 'closed'];
    if (urlStatusWhitelist.includes(urlStatus)) {
      orderStatus.value = urlStatus;
    }
    window.setTimeout(() => {
      if (urlAction === 'pickup') {
        if (!urlStatus) orderStatus.value = 'reserved';
        openPickupModal();
      } else if (urlAction === 'return') {
        if (!urlStatus) orderStatus.value = 'renting';
        openReturnModal();
      } else if (urlAction === 'extend') {
        if (!urlStatus) orderStatus.value = 'renting';
        openExtendModal();
      } else if (urlAction === 'cancel') {
        openCancelOrderModal();
      } else if (urlAction === 'no_show') {
        if (!urlStatus) orderStatus.value = 'pickup_overdue';
        openNoShowModal();
      } else if (urlAction === 'close') {
        openCloseOrderModal();
      } else if (urlAction === 'accident') {
        if (!urlStatus) orderStatus.value = 'accident_processing';
        openAccidentModal();
      } else if (urlAction === 'pay') {
        orderStatus.value = 'pending_payment';
        openBookingPaymentDialog();
      } else if (['fees', 'collect', 'refund', 'notify'].includes(urlAction)) {
        feeModalVisible.value = true;
        if (['collect', 'notify'].includes(urlAction) || postChargeView.status) {
          feePhaseFilter.value = 'post';
        }
        if (urlAction === 'notify') {
          feeStatusFilter.value = 'pending';
        } else if (urlAction === 'collect') {
          feeStatusFilter.value = isMonthlyBilling.value ? 'monthly_billing' : 'pending';
        } else if (urlAction === 'fees' && isMonthlyBilling.value) {
          feeStatusFilter.value = 'monthly_billing';
        }
      }
    }, 0);
    return {
      formatNumber,
      getFuelColor,
      orderView,
      orderTypeText,
      dispatchStatusText,
      serviceMode,
      isSelfServiceOrder,
      pickupVehicleStationText,
      pickupLocationDisplay,
      returnLocationDisplay,
      pickupStoreStatusMeta,
      pickupStationStatusMeta,
      returnStoreStatusMeta,
      returnStationStatusMeta,
      showPickupStationStatus,
      showReturnStationStatus,
      pickupLocationNotice,
      returnLocationNotice,
      pickupStoreName,
      currentReturnStoreName,
      currentReturnStationName,
      paymentStatusBadge,
      postChargeView,
      postChargeBadge,
      planData,
      pickupReturnData,
      photoGalleryVisible,
      photoGalleryTab,
      openPhotoGallery,
      tableRowClassName,
      signatureDialogVisible,
      currentSignatureTime,
      currentSignatureName,
      viewSignature,
      cancelOrderDialogVisible,
      cancelOrderData,
      openCancelOrderModal,
      updateCancelFee,
      confirmCancelOrder,
      noShowDialogVisible,
      noShowData,
      openNoShowModal,
      confirmNoShow,
      rejectOrderDialogVisible,
      rejectOrderData,
      updateRejectFee,
      openRejectOrderModal,
      confirmRejectOrder,
      closeOrderDialogVisible,
      closeOrderData,
      openCloseOrderModal,
      confirmCloseOrder,
      financeOverview,
      billingSnapshotItems,
      billingEventSnapshotItems,
      getRuleSectionRows,
      getEventSummaryRows,
      snapshotVersionDialogVisible,
      selectedSnapshotVersion,
      openSnapshotVersion,
      rightPanelFeeItems,
      recentFinancialTransactions,
      invoiceSummary,
      feeData,
      getSummaries,
      transactionsDialogVisible,
      openTransactionsDialog,
      enhancedTransactions,
      txnSummary,
      exportTransactions,
      getTxnTypeLabel,
      extendModalVisible,
      extendData,
      openExtendModal,
      extendDialogTitle,
      estimatedExtendFee,
      extendDurationText,
      extendRequiresImmediatePay,
      extendImmediateReason,
      canConfirmExtend,
      checkExtendConflict,
      useMaxExtendTime,
      resolveConflict,
      confirmExtendPayment,
      confirmExtend,
      formatDate,
      redirectionModalVisible,
      activeTab,
      selectedGroup,
      vehicleGroups,
      selectedVehicleId,
      selectedPromoId,
      newPrice,
      redirectionReason,
      redirectionReasons,
      redirectionNote,
      priceHandling,
      currentVehicleList,
      promotions,
      recommendations,
      handleGroupSelect,
      calculatePrice,
      orderStatus,
      orderStatusText,
      orderStatusType,
      canPickup,
      canReturn,
      canExtend,
      canRedirect,
      canChangeReturnStore,
      canChangeReturnStation,
      canAccident,
      canCancel,
      canClose,
      canEditOrder,
      pickupActionText,
      returnActionText,
      extendActionText,
      pickupModalVisible,
      operationRecords,
      pickupStep,
      pickupInterrupted,
      pickupLock,
      processing,
      pickupData,
      hasPickupTelematics,
      hasReturnTelematics,
      currentPickupMarketingPlan,
      requiresPickupQualification,
      uploadedQualificationCount,
      availablePickupReplacementPlans,
      selectedReplacementPickupPlan,
      qualificationPriceDelta,
      qualificationPriceDeltaAbs,
      handleQualificationStatusChange,
      markQualificationFileUploaded,
      applyPickupMarketingPlanChange,
      openPickupModal,
      nextPickupStep,
      requestClosePickupModal,
      handlePickupDialogClose,
      releasePickupLock,
      selectRecommendation,
      openRedirectionModal,
      confirmRedirection,
      priceDiff,
      isGroupChanged,
      shouldShowPromoSelection,
      isMidRental,
      remainingDays,
      paymentData,
      billingMode,
      isMonthlyBilling,
      paymentDialogVisible,
      paymentDialogType,
      newPayment,
      paymentDialogDueAmount,
      paymentDialogTitle,
      paymentDialogAmountLabel,
      paymentDialogAmountHint,
      paymentDialogSubmitText,
      balanceDue,
      actualPaidAmount,
      preAuthStatusType,
      preAuthStatusText,
      canProceedPayment,
      handlePreAuth,
      selectPreAuthMode,
      showPaymentDialog,
      confirmPayment,
      openPaymentDialog,
      openBookingPaymentDialog,
      userCreditCards,
      selectedCreditCard,
      signatureStatus,
      signatureSource,
      signatureTime,
      pushSignatureToApp,
      fetchAppSignature,
      signOnSite,
      resetSignature,
      damagePhotos,
      showDamageTypeDialog,
      damageCategories,
      newDamage,
      confirmAddDamage,
      addDamagePhoto,
      removeDamagePhoto,
      showRedirectionHistory,
      redirectionHistory,
      fulfillmentEventTab,
      filteredFulfillmentEvents,
      eventCounts,
      formatSignedAmount,
      getRedirectionSettlementText,
      getFulfillmentEventCardClass,
      getFulfillmentEventDotClass,
      getFulfillmentEventTagType,
      showAccidentRecords,
      accidentRecords,
      invoiceRecords,
      returnModalVisible,
      returnStep,
      returnInspectionSubmitted,
      returnData,
      returnFees,
      returnFeeForm,
      showAddFeeDialog,
      openAddFeeDialog,
      confirmAddFees,
      returnPaymentRecords,
      returnBalanceDue,
      returnHandledAmount,
      monthlyReturnBillAmount,
      returnRefundDialogVisible,
      selectedReturnRefundChannel,
      returnRefundAmount,
      returnOriginalPaymentChannels,
      openReturnPaymentDialog,
      openReturnRefundDialog,
      confirmReturnRefund,
      removeExtraFee,
      openReturnModal,
      nextReturnStep,
      requestCloseReturnModal,
      handleReturnDialogClose,
      returnStores,
      returnStations,
      handleReturnStoreChange,
      getReturnStoreLabel,
      getReturnStationLabel,
      returnStoreChangeDialogVisible,
      returnStoreChangeReasons,
      returnStoreChangeData,
      returnStoreTransferOptions,
      returnStoreCurrentFee,
      returnStoreNewFee,
      returnStoreChangeFeeDelta,
      returnStoreChangeFeeAbs,
      returnStoreConflict,
      checkReturnStoreScheduleConflict,
      openReturnStoreChangeDialog,
      quickRedirectReturnStoreConflict,
      confirmReturnStoreChange,
      plannedReturnStationId,
      returnStationChangeDialogVisible,
      returnStationChangeData,
      returnStationTransferOptions,
      returnStationConflict,
      checkReturnStationScheduleConflict,
      openReturnStationChangeDialog,
      quickRedirectReturnStationConflict,
      confirmReturnStationChange,
      returnDamagePhotos,
      returnSignatureStatus,
      returnSignatureTime,
      openDamageDialog,
      requestReturnSignature,
      confirmReturnSignature,
      waiveDialogVisible,
      waiveData,
      openWaiveDialog,
      confirmWaive,
      returnSettlementRecords,
      feeModalVisible,
      feeStatusFilter,
      feeStatusFilters,
      feePhaseFilter,
      feePhaseFilters,
      pendingPostCharges,
      expandedFees,
      feeItems,
      transactions,
      filteredFeeItems,
      feeSummary,
      getFilteredFeeCount,
      toggleFeeExpand,
      getTransactionsForFee,
      getFeeStatusType,
      getFeeStatusText,
      getChannelName,
      notifyCustomerForCharge,
      manualFeeTypes,
      onlineChannels,
      offlineChannels,
      addFeeDialogVisible,
      editingFee,
      newFeeData,
      openNewFeeDialog,
      openEditFeeDialog,
      confirmAddFee,
      confirmDeleteFee,
      handleExceed,
      collectPaymentDialogVisible,
      collectingFee,
      paymentChannelType,
      selectedPaymentChannel,
      offlineRefNo,
      collectAmount,
      openCollectPayment,
      confirmCollectPayment,
      refundDialogVisible,
      refundingFee,
      selectedRefundTxn,
      refundAmount,
      offlineRefundMethod,
      refundTransferInfo,
      refundReason,
      refundableTxns,
      openRefundDialog,
      getSelectedTxnAmount,
      getSelectedTxnChannelType,
      getSelectedTxnChannel,
      confirmRefund,
      reminderDialogVisible,
      reminderFee,
      reminderDate,
      openReminderDialog,
      confirmReminder,
      markReminded,
      handleFeeCommand,
      showAuditLog,
      feeAuditLogs,
      recentFeeAuditLogs,
      openFeeAuditLog,
      getLogActionType,
      addAuditLog,
      orderRemarks,
      remarksDialogVisible,
      remarksForm,
      openRemarksModal,
      saveRemarks,
      accidentDialogVisible,
      isAddingAccident,
      newAccidentForm,
      accidentContextHint,
      getAccidentResponsibilityText,
      getAccidentStatusText,
      openAccidentModal,
      openAccidentRecords,
      saveAccident,
      closeAccidentRecord,
      deleteAccident,
      goBack: () => window.history.back(),
      ArrowLeft: typeof rimoIcons !== "undefined" ? rimoIcons.ArrowLeft : null,
      ElMessage: feedback.ElMessage,
      ElMessageBox: feedback.ElMessageBox,
      initialUrlParams,
      activeOrderId,
      mockOrderDetails,
      urlClientType,
      fallbackClientType,
      selectedOrderSeed,
      parseMetricNumber,
      getTelematicsMetricValue,
      pickupTelematicsSnapshot,
      returnTelematicsSnapshot,
      splitStoreAddress,
      getStationShortName,
      formatStoreStationAddress,
      locationStatusMetaMap,
      getLocationStatusMeta,
      buildLocationNotice,
      pickupPlanStationText,
      getSnapshotDailyPrice,
      buildMarketingSnapshotConfig,
      buildStoreRuleSections,
      paymentStatusMapForDetail,
      postChargeStatusMapForDetail,
      returnSettlementStatuses,
      terminalStatuses,
      extendBillableHours,
      pickupPreviousStatus,
      formatPickupLockTime,
      startPickupLock,
      returnPreviousStatus,
      returnStationMap,
      returnStoreDiffFeeMatrix,
      getReturnStoreById,
      getReturnStoreIdFromLocation,
      originalReturnStoreId,
      getReturnStoreDiffFee,
      returnStoreDeltaFee,
      hasReturnStationSnapshot,
      currentReturnDealerId,
      damageDialogContext,
      feeConfig,
      resetReturnPaymentRecords,
      prepareReturnDemoScenario,
      applyReturnSettlementStatus,
      ensureMonthlyReturnBillRecord,
      bookingPreAuthPercent,
      bookingPreAuthAmount,
      hasBookingPreAuth,
      hasPickupRentPayment,
      initialCustomerPaymentRecords,
      pickupMarketingPlans,
      findPickupMarketingPlan,
      qualificationDocsComplete,
      canProceedPickupQualification,
      syncPickupMarketingAmount,
      syncPreAuthRecord,
      releaseGuaranteePreAuth,
      markPickupInterrupted,
      photoGalleryContext,
      originalGroup,
      currentBasePrice,
      vehicles,
      createMonthlyBillTransaction,
      seedPostChargeFromUrl,
      activeFinanceFees,
      getTransactionFeeName,
      getFeeDisplayStatus,
      isConfirmedIncomeTransaction,
      getConfirmedPaymentTotal,
      releaseDispatchResource,
      recordPreAuthRelease,
      recordOrderRefund,
      parseEventTimestamp,
      suppressOperationInEvents,
      getOperationEventCategory,
      getOperationEventTone,
      fulfillmentEvents,
      urlParams,
      urlAction,
      urlStatus,
      urlStatusWhitelist
    };
  }
  return pageSetup();
}
export default function OrderDetailBlock() {
  const model = useRimoModel(createPageState);
  const view = model.view;
  const {
    text
  } = useRimoEnvironment();
  return <RimoRoot model={model} pageKey="order-detail" assets={{}}><div data-business-content="" data-rimo-layout="page"><div className="mb-4"><RimoElement kind="el-button" onClick={event => {
          view.goBack?.(event);
        }} icon={view.ArrowLeft} plain={true}>{text("返回")}</RimoElement></div>
<div><div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6"><div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4"><div><div className="flex items-center gap-3 mb-2" data-rimo-layout="heading"><h1 className="text-2xl font-bold text-gray-900">{text("訂單 ")}{rimoText(view.orderView.orderId)}</h1>
<RimoElement kind="el-tag" type={view.orderStatusType} effect="dark" round={true}>{rimoText(view.orderStatusText)}</RimoElement>
<RimoElement kind="el-tag" effect="plain" round={true}>{rimoText(view.orderTypeText)}</RimoElement>
{view.orderView.clientType === 'corporate' ? <><RimoElement kind="el-tag" color="var(--app-color-primary-light-9)" style={rimoStyle("color: var(--app-color-primary); border-color: var(--app-color-primary-light-8);")} effect="light" round={true}>{text("\n                                        ")}{rimoText(view.orderView.corporate?.shortName)}{text("\n                                    ")}</RimoElement></> : null}
{view.isMonthlyBilling ? <><RimoElement kind="el-tag" type="primary" effect="plain" round={true}>{text("企業月結")}</RimoElement></> : null}
{view.paymentStatusBadge ? <><RimoElement kind="el-tag" type={view.paymentStatusBadge.type} effect="plain" round={true}>{rimoText(view.paymentStatusBadge.text)}</RimoElement></> : null}
{view.postChargeBadge ? <><RimoElement kind="el-tag" type={view.postChargeBadge.type} effect="plain" round={true}>{text("\n                                        ")}{rimoText(view.postChargeBadge.text)}{text(" ¥")}{rimoText(view.formatNumber(view.postChargeView.amount))}{text("\n                                    ")}</RimoElement></> : null}</div>
<div className="flex items-center gap-6 text-sm text-gray-500"><span className="flex items-center gap-1.5"><RimoElement kind="el-icon"><RimoIcon name="Clock" /></RimoElement>
{text(" ")}{rimoText(view.orderView.createTime)}</span>
<span className="flex items-center gap-1.5"><RimoElement kind="el-icon"><RimoIcon name="Iphone" /></RimoElement>
{text(" ")}{rimoText(view.orderView.source)}</span></div></div>
<div className="flex flex-col items-end"><div className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">{text("訂單總額")}</div>
<div className="text-3xl font-bold text-[color:var(--app-color-primary)] font-mono tracking-tight">{rimoText(view.formatNumber(view.orderView.amount))}</div></div></div>
<div className="flex flex-wrap items-center gap-3 pt-4 border-t border-gray-100"><div className="flex gap-2">{view.canEditOrder ? <><RimoElement kind="el-button" plain={true} icon="Edit">{text("編輯")}</RimoElement></> : null}
{view.canRedirect ? <><RimoElement kind="el-button" plain={true} icon="Refresh" onClick={event => {
                  view.openRedirectionModal?.(event);
                }}>{text("改派")}</RimoElement></> : null}
{view.canChangeReturnStore && !view.isSelfServiceOrder ? <><RimoElement kind="el-button" plain={true} icon="Location" onClick={event => {
                  view.openReturnStoreChangeDialog?.(event);
                }}>{text("改還車門市")}</RimoElement></> : null}
{view.canChangeReturnStation && view.isSelfServiceOrder ? <><RimoElement kind="el-button" plain={true} icon="Location" onClick={event => {
                  view.openReturnStationChangeDialog?.(event);
                }}>{text("改還車據點")}</RimoElement></> : null}</div>
<div className="w-px h-6 bg-gray-200 mx-1"></div>
<div className="flex gap-2">{view.canPickup ? <><RimoElement kind="el-button" type="primary" icon="Key" onClick={event => {
                  view.openPickupModal?.(event);
                }}>{rimoText(view.pickupActionText)}</RimoElement></> : null}
{view.canExtend ? <><RimoElement kind="el-button" plain={true} icon="Timer" onClick={event => {
                  view.openExtendModal?.(event);
                }}>{rimoText(view.extendActionText)}</RimoElement></> : null}
{view.canReturn ? <><RimoElement kind="el-button" type="primary" icon="Checked" onClick={event => {
                  view.openReturnModal?.(event);
                }}>{rimoText(view.returnActionText)}</RimoElement></> : null}</div>
<div className="w-px h-6 bg-gray-200 mx-1"></div>
{view.orderStatus === 'pending_payment' ? <><RimoElement kind="el-button" type="warning" icon="Wallet" onClick={event => {
                view.openBookingPaymentDialog?.(event);
              }}>{text("支付")}</RimoElement></> : null}
<RimoElement kind="el-button" plain={true} icon="Money" onClick={_event => {
              model.write(["feeModalVisible"], true);
            }}>{text("費用")}</RimoElement>
<div className="flex-1"></div>
<RimoElement kind="el-dropdown" trigger="click" slots={{
              "dropdown": _slot => <><RimoElement kind="el-dropdown-menu">{view.canCancel ? <><RimoElement kind="el-dropdown-item" icon="CircleClose" className="text-red-500" onClick={event => {
                      view.openCancelOrderModal?.(event);
                    }}>{text("取消訂單")}</RimoElement></> : null}
{view.orderStatus === 'pickup_overdue' ? <><RimoElement kind="el-dropdown-item" icon="WarningFilled" className="text-red-500" onClick={event => {
                      view.openNoShowModal?.(event);
                    }}>{text("標記爽約")}</RimoElement></> : null}
{view.canClose ? <><RimoElement kind="el-dropdown-item" icon="SwitchButton" className="text-red-500" onClick={event => {
                      view.openCloseOrderModal?.(event);
                    }}>{text("關閉訂單")}</RimoElement></> : null}
{view.canAccident ? <><RimoElement kind="el-dropdown-item" divided={true} icon="Warning" className="text-red-500" onClick={event => {
                      view.openAccidentModal?.(event);
                    }}>{text("事故登記")}</RimoElement></> : null}
<RimoElement kind="el-dropdown-item" divided={true} icon="Document" onClick={event => {
                    view.openRemarksModal?.(event);
                  }}>{text("訂單備註")}</RimoElement>
<RimoElement kind="el-dropdown-item" icon="Printer">{text("打印單據")}</RimoElement></RimoElement></>
            }}><RimoElement kind="el-button" plain={true}>{text("\n                                    更多操作")}
<RimoElement kind="el-icon" className="el-icon--right"><RimoIcon name="ArrowDown" /></RimoElement></RimoElement></RimoElement></div></div>
<div className="grid grid-cols-12 gap-6 mb-6" data-rimo-grid="12"><div className="col-span-8"><RimoElement kind="el-card" shadow="never" className="border-gray-200 h-full" bodyStyle={{
              padding: '0px',
              height: '100%'
            }} slots={{
              "header": _slot => <><div className="flex justify-between items-center w-full"><span className="font-bold text-gray-800 flex items-center gap-2"><RimoElement kind="el-icon" className="text-[color:var(--app-color-primary)]"><RimoIcon name="User" /></RimoElement>
{text(" ")}{rimoText(view.orderView.clientType === 'corporate' ? '企業客戶信息' : '會員信息')}{text("\n                                        ")}</span></div></>
            }}><div className="p-5 h-full box-border"><RimoElement kind="el-descriptions" column={2} border={true}><RimoElement kind="el-descriptions-item" label={view.orderView.clientType === 'corporate' ? '用車人' : '會員姓名'}><span className="text-[color:var(--app-color-primary)] font-bold cursor-pointer hover:underline hover:text-[color:var(--app-color-primary-hover)] transition-colors">{rimoText(view.orderView.customer.name)}</span></RimoElement>
<RimoElement kind="el-descriptions-item" label="會員編號">{rimoText(view.orderView.customer.memberNo)}</RimoElement>
<RimoElement kind="el-descriptions-item" label="手機號碼">{rimoText(view.orderView.customer.phone)}</RimoElement>
<RimoElement kind="el-descriptions-item" label="會員等級"><RimoElement kind="el-tag" size="small" type="warning" effect="dark">{rimoText(view.orderView.customer.level)}</RimoElement></RimoElement>
{view.orderView.clientType === 'corporate' ? <><RimoElement kind="el-descriptions-item" label="所屬企業"><RimoElement kind="el-tag" size="small" color="var(--app-color-primary-light-9)" style={rimoStyle("color: var(--app-color-primary); border-color: var(--app-color-primary-light-8);")} effect="light">{text("\n                                                ")}{rimoText(view.orderView.corporate?.name)}{text("\n                                            ")}</RimoElement></RimoElement></> : null}
{view.orderView.clientType === 'corporate' ? <><RimoElement kind="el-descriptions-item" label="部門">{text("\n                                            ")}{rimoText(view.orderView.customer.dept || '-')}{text("\n                                        ")}</RimoElement></> : null}
{view.orderView.clientType === 'corporate' ? <><RimoElement kind="el-descriptions-item" label="結算方式"><RimoElement kind="el-tag" size="small" type={view.isMonthlyBilling ? 'primary' : 'success'} effect="plain">{text("\n                                                ")}{rimoText(view.isMonthlyBilling ? '企業月結' : '員工自付')}{text("\n                                            ")}</RimoElement></RimoElement></> : null}</RimoElement></div></RimoElement></div>
<div className="col-span-4"><RimoElement kind="el-card" shadow="never" className="border-gray-200 h-full" bodyStyle={{
              padding: '0px',
              height: '100%'
            }} slots={{
              "header": _slot => <><div className="flex justify-between items-center w-full"><span className="font-bold text-gray-800 flex items-center gap-2"><RimoElement kind="el-icon" className="text-[color:var(--app-color-primary)]"><RimoIcon name="Van" /></RimoElement>
{text(" 派車信息\n                                        ")}</span>
<RimoElement kind="el-tag" size="small" effect="plain" type="info">{rimoText(view.dispatchStatusText)}</RimoElement></div></>
            }}><div className="p-5 h-full box-border"><div className="flex items-center gap-4"><div className="w-14 h-14 bg-gradient-to-br from-[color:var(--app-color-primary-light-9)] to-[color:var(--app-color-primary-light-8)] text-[color:var(--app-color-primary)] rounded-xl flex items-center justify-center border border-[color:var(--app-color-primary-light-7)] shadow-sm"><RimoElement kind="el-icon" className="text-3xl"><RimoIcon name="Van" /></RimoElement></div>
<div className="flex-1"><div className="flex justify-between items-start"><div><div className="font-bold text-[color:var(--app-color-primary)] text-lg leading-tight font-mono cursor-pointer hover:underline hover:text-[color:var(--app-color-primary-hover)] transition-colors">{text("\n                                                        ")}{rimoText(view.orderView.vehicle.plate)}</div>
<div className="text-xs text-gray-500 mt-1">{rimoText(view.orderView.vehicle.group)}</div></div>
<div className="text-right"><div className="font-mono text-sm font-medium text-gray-600">{rimoText(view.orderView.vehicle.mileage)}{text("\n                                                    ")}</div>
<div className="text-[10px] text-gray-400">{text("當前里程")}</div></div></div>
<div className="flex items-center gap-2 mt-2"><RimoElement kind="el-tag" size="small" type="info" effect="plain" className="!text-gray-600 !bg-gray-50 !border-gray-200">{rimoText(view.orderView.vehicle.model)}</RimoElement>
<RimoElement kind="el-tag" size="small" type="info" effect="light">{rimoText(view.orderView.vehicle.seats)}</RimoElement>
<RimoElement kind="el-tag" size="small" type="info" effect="light">{rimoText(view.orderView.vehicle.transmission)}</RimoElement>
<RimoElement kind="el-tag" size="small" type="info" effect="light">{rimoText(view.orderView.vehicle.energy)}</RimoElement></div></div></div></div></RimoElement></div></div>
<div className="grid grid-cols-12 gap-6" data-rimo-grid="12"><div className="col-span-8 space-y-6"><RimoElement kind="el-card" shadow="never" className="border-gray-200" bodyStyle={{
              padding: '0px'
            }} slots={{
              "header": _slot => <><div className="flex justify-between items-center"><span className="font-bold text-gray-800 flex items-center gap-2"><RimoElement kind="el-icon" className="text-[color:var(--app-color-primary)]"><RimoIcon name="Calendar" /></RimoElement>
{text(" 預約資料\n                                        ")}</span></div></>
            }}><div className="p-6"><RimoElement kind="el-descriptions" column={1} border={true}><RimoElement kind="el-descriptions-item" label="取還站點"><div className="flex flex-wrap items-center gap-2 text-sm"><span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded text-xs font-bold border border-blue-100">{text("取")}</span>
<span className="text-gray-700">{rimoText(view.pickupLocationDisplay)}</span>
<RimoElement kind="el-tag" size="small" type={view.pickupStoreStatusMeta.type} effect="plain">{text("\n                                                    門市")}{rimoText(view.pickupStoreStatusMeta.label)}{text("\n                                                ")}</RimoElement>
{view.showPickupStationStatus ? <><RimoElement kind="el-tag" size="small" type={view.pickupStationStatusMeta.type} effect="plain">{text("\n                                                    據點")}{rimoText(view.pickupStationStatusMeta.label)}{text("\n                                                ")}</RimoElement></> : null}</div>
{view.pickupLocationNotice ? <><div className="ml-8 mt-1 text-xs text-red-500">{text("\n                                                ")}{rimoText(view.pickupLocationNotice)}{text("\n                                            ")}</div></> : null}
<div className="flex flex-wrap items-center gap-2 text-sm mt-2"><span className="bg-green-50 text-green-600 px-2 py-0.5 rounded text-xs font-bold border border-green-100">{text("還")}</span>
<span className="text-gray-700">{rimoText(view.returnLocationDisplay)}</span>
<RimoElement kind="el-tag" size="small" type={view.returnStoreStatusMeta.type} effect="plain">{text("\n                                                    門市")}{rimoText(view.returnStoreStatusMeta.label)}{text("\n                                                ")}</RimoElement>
{view.showReturnStationStatus ? <><RimoElement kind="el-tag" size="small" type={view.returnStationStatusMeta.type} effect="plain">{text("\n                                                    據點")}{rimoText(view.returnStationStatusMeta.label)}{text("\n                                                ")}</RimoElement></> : null}</div>
{view.returnLocationNotice ? <><div className="ml-8 mt-1 text-xs text-red-500">{text("\n                                                ")}{rimoText(view.returnLocationNotice)}{text("\n                                            ")}</div></> : null}</RimoElement>
<RimoElement kind="el-descriptions-item" label="租期時間"><div className="flex items-center gap-3"><span className="font-mono text-gray-600">{rimoText(view.orderView.schedule.start)}</span>
<RimoElement kind="el-icon" className="text-gray-300"><RimoIcon name="Right" /></RimoElement>
<span className="font-mono text-[color:var(--app-color-primary)] font-bold bg-[color:var(--app-color-primary-light-9)] px-2 rounded">{rimoText(view.orderView.schedule.end)}</span></div></RimoElement>
<RimoElement kind="el-descriptions-item" label="預定車組">{rimoText(view.orderView.vehicle.group)}</RimoElement>
<RimoElement kind="el-descriptions-item" label="優惠方案"><div className="flex gap-2"><RimoElement kind="el-tag" size="small" effect="light">{rimoText(view.orderView.promotionText)}</RimoElement>
{view.orderView.clientType === 'corporate' ? <><RimoElement kind="el-tag" size="small" type="info" effect="plain">{text("\n                                                    ")}{rimoText(view.isMonthlyBilling ? '月結記賬' : '企業資格')}{text("\n                                                ")}</RimoElement></> : null}</div></RimoElement>
<RimoElement kind="el-descriptions-item" label="額外服務"><div className="flex gap-2"><RimoElement kind="el-tag" size="small" effect="plain" type="info">{text("導航 x1")}</RimoElement>
<RimoElement kind="el-tag" size="small" effect="plain" type="info">{text("兒童座椅 x2")}</RimoElement></div></RimoElement>
<RimoElement kind="el-descriptions-item" label="訂單備註"><span className="text-gray-600">{rimoText(view.orderRemarks)}</span></RimoElement></RimoElement></div></RimoElement>
<RimoElement kind="el-card" shadow="never" className="border-gray-200" bodyStyle={{
              padding: '0px'
            }} slots={{
              "header": _slot => <><div className="flex justify-between items-center"><span className="font-bold text-gray-800 flex items-center gap-2"><RimoElement kind="el-icon" className="text-[color:var(--app-color-primary)]"><RimoIcon name="Connection" /></RimoElement>
{text(" 取還車明細\n                                        ")}</span></div></>
            }}><div className="p-4"><RimoElement kind="el-table" data={view.pickupReturnData} style={rimoStyle("width: 100%")} border={false} rowClassName={view.tableRowClassName}><RimoElement kind="el-table-column" prop="type" label="項目" width="70" slots={{
                    "default": scope => <><span className="font-medium text-gray-800">{rimoText(scope.row.type)}</span></>
                  }}></RimoElement>
<RimoElement kind="el-table-column" prop="time" label="時間" minWidth="150" slots={{
                    "default": ({
                      row
                    }) => <><div className={rimoClass({
                        'text-gray-400 italic': row.isPending
                      })}>{rimoText(row.time)}{text("\n                                                ")}</div></>
                  }}></RimoElement>
<RimoElement kind="el-table-column" prop="station" label="門市 / 據點" minWidth="150" slots={{
                    "default": ({
                      row
                    }) => <><div className={rimoClass({
                        'text-gray-400': row.isPending
                      })}><div>{rimoText(row.station)}</div>
{row.stationSub ? <><div className="text-xs text-gray-400 mt-0.5">{rimoText(row.stationSub)}</div></> : null}</div></>
                  }}></RimoElement>
<RimoElement kind="el-table-column" prop="mileage" label="里程數" width="110" slots={{
                    "default": ({
                      row
                    }) => <><span className={rimoClass({
                        'text-gray-400': row.isPending
                      })}>{rimoText(row.mileage)}</span></>
                  }}></RimoElement>
<RimoElement kind="el-table-column" prop="fuel" label="油量" width="130" slots={{
                    "default": scope => <>{scope.row.fuel !== '-' ? <><div className="flex items-center gap-2"><RimoElement kind="el-progress" percentage={parseInt(scope.row.fuel)} strokeWidth={8} color={view.getFuelColor(scope.row.fuel)} style={rimoStyle("width: 50px")} showText={false}></RimoElement>
<span className="text-xs font-mono">{rimoText(scope.row.fuel)}</span></div></> : <><span className="text-gray-400">{text("-")}</span></>}</>
                  }}></RimoElement>
<RimoElement kind="el-table-column" label="車況照片" width="100" slots={{
                    "default": ({
                      row
                    }) => <>{row.photos && row.photos.length > 0 ? <><RimoElement kind="el-button" size="small" icon="Picture" onClick={_event => {
                          view.openPhotoGallery(row.context);
                        }}>{text("\n                                                    ")}{rimoText(row.photos.length)}{text("張\n                                                ")}</RimoElement></> : <><span className="text-gray-400 text-xs">{text("-")}</span></>}</>
                  }}></RimoElement>
<RimoElement kind="el-table-column" label="簽名狀態" width="140" slots={{
                    "default": ({
                      row
                    }) => <>{row.signed ? <><div className="flex flex-col cursor-pointer group" onClick={_event => {
                          view.viewSignature(row);
                        }}><div className="flex items-center gap-1 text-green-600 text-xs group-hover:text-green-700"><RimoElement kind="el-icon"><RimoIcon name="CircleCheck" /></RimoElement>
{text(" 已簽名 ")}
<span className="text-xs text-gray-400 group-hover:text-[color:var(--app-color-primary)] scale-90">{text("(查看)")}</span></div>
<div className="text-xs text-gray-400 scale-90 origin-left">{rimoText(row.signTime)}</div></div></> : <><div className="text-orange-400 text-xs flex items-center gap-1"><RimoElement kind="el-icon"><RimoIcon name="Clock" /></RimoElement>
{text(" 待確認\n                                                ")}</div></>}</>
                  }}></RimoElement>
<RimoElement kind="el-table-column" prop="operator" label="操作員" minWidth="100" slots={{
                    "default": ({
                      row
                    }) => <><span className={rimoClass({
                        'text-gray-400': row.isPending
                      })}>{rimoText(row.operator)}</span></>
                  }}></RimoElement></RimoElement>
{view.orderStatus === 'completed' || view.returnData.mileage > 0 ? <><div className="bg-gray-50 border-t border-gray-100 p-4 flex justify-between items-center text-sm"><div className="font-bold text-gray-600 flex items-center gap-2"><RimoElement kind="el-icon" className="text-[color:var(--app-color-primary)]"><RimoIcon name="DataLine" /></RimoElement>
{text(" 用車統計\n                                        ")}</div>
<div className="flex gap-6 text-gray-600"><span>{text("租期: ")}
<span className="text-gray-900 font-bold">{text("4天2小時")}</span></span>
<span>{text("行駛里程: ")}
<span className="text-green-600 font-bold">{text("+670 km")}</span></span>
<span>{text("油量變化: ")}
<span className="text-red-500 font-bold">{text("-20%")}</span></span></div></div></> : null}</div></RimoElement>
<RimoElement kind="el-card" shadow="never" className="border-gray-200" bodyStyle={{
              padding: '0px'
            }} slots={{
              "header": _slot => <><div className="flex flex-wrap justify-between items-start gap-3"><div><div className="font-bold text-gray-800 flex items-center gap-2"><RimoElement kind="el-icon" className="text-[color:var(--app-color-primary)]"><RimoIcon name="Clock" /></RimoElement>
{text(" 履約事件\n                                            ")}</div>
<div className="text-xs text-gray-500 mt-1">{text("按時間線查看訂單關鍵動作、改派、事故和費用影響")}</div></div>
<div className="flex flex-wrap gap-2 justify-end">{view.eventCounts.openAccident > 0 ? <><RimoElement kind="el-tag" size="small" type="danger" effect="plain" round={true}>{text("\n                                                未結案事故 ")}{rimoText(view.eventCounts.openAccident)}{text("\n                                            ")}</RimoElement></> : null}
{view.eventCounts.redirection > 0 ? <><RimoElement kind="el-tag" size="small" type="warning" effect="plain" round={true}>{text("\n                                                改派 ")}{rimoText(view.eventCounts.redirection)}{text("\n                                            ")}</RimoElement></> : null}
<RimoElement kind="el-tag" size="small" effect="plain" round={true}>{text("關鍵事件 ")}{rimoText(view.eventCounts.all)}</RimoElement></div></div></>
            }}><div className="px-4 pt-3 pb-3">{view.eventCounts.openAccident > 0 ? <><div className="mb-3 rounded-lg border border-red-100 bg-red-50 px-4 py-2.5 flex items-start justify-between gap-4" data-rimo-layout="toolbar"><div className="flex items-start gap-3"><div className="w-8 h-8 rounded-lg bg-white text-red-500 flex items-center justify-center shrink-0 border border-red-100"><RimoElement kind="el-icon"><RimoIcon name="Warning" /></RimoElement></div>
<div><div className="font-bold text-red-700 text-sm">{text("當前訂單存在未結案事故")}</div>
<div className="text-xs text-red-600 mt-1">{text("\n                                                    事故費用、責任歸屬和處理狀態需要在還車結算或追繳前完成核對。\n                                                ")}</div></div></div>
<RimoElement kind="el-button" size="small" type="danger" plain={true} onClick={event => {
                      view.openAccidentRecords?.(event);
                    }}>{text("查看事故")}</RimoElement></div></> : null}
<RimoElement kind="el-tabs" modelValue={view.fulfillmentEventTab} onModelChange={value => {
                  model.write(["fulfillmentEventTab"], value);
                }} className="!mb-0"><RimoElement kind="el-tab-pane" label={'全部 ' + view.eventCounts.all} name="all"></RimoElement>
<RimoElement kind="el-tab-pane" label={'異常 ' + view.eventCounts.exception} name="exception"></RimoElement>
<RimoElement kind="el-tab-pane" label={'改派 ' + view.eventCounts.redirection} name="redirection"></RimoElement>
<RimoElement kind="el-tab-pane" label={'事故 ' + view.eventCounts.accident} name="accident"></RimoElement>
<RimoElement kind="el-tab-pane" label={'操作日誌 ' + view.eventCounts.audit} name="audit"></RimoElement></RimoElement>
<div className="flex items-center justify-between text-xs text-gray-400 -mt-1 mb-2"><span>{rimoText(view.fulfillmentEventTab === 'audit' ? view.operationRecords.length : view.filteredFulfillmentEvents.length)}{text(" 條記錄")}</span>
<span>{text("列表區域內滾動查看更多")}</span></div>
{view.fulfillmentEventTab === 'audit' ? <><div className="pt-1"><RimoElement kind="el-table" data={view.operationRecords} style={rimoStyle("width: 100%")} size="small" maxHeight="420" rowClassName={({
                      row
                    }) => row.type === 'danger' ? 'bg-red-50/50' : ''}><RimoElement kind="el-table-column" prop="timestamp" label="時間" width="150" slots={{
                        "default": ({
                          row
                        }) => <><span className="text-xs font-mono text-gray-500">{rimoText(row.timestamp)}</span></>
                      }}></RimoElement>
<RimoElement kind="el-table-column" prop="title" label="操作" minWidth="140" slots={{
                        "default": ({
                          row
                        }) => <><div className="flex items-center gap-1.5"><span className={rimoClass(["w-1.5 h-1.5 rounded-full shrink-0", rimoClass(row.color ? '' : row.type === 'success' ? 'bg-green-500' : row.type === 'warning' ? 'bg-yellow-500' : row.type === 'danger' ? 'bg-red-500' : 'bg-blue-500')])} style={rimoStyle(row.color ? `background-color: ${row.color}` : '')}></span>
<span className="font-medium text-gray-800 text-sm">{rimoText(row.title)}</span></div></>
                      }}></RimoElement>
<RimoElement kind="el-table-column" prop="content" label="詳情" minWidth="180" slots={{
                        "default": ({
                          row
                        }) => <><span className="text-xs text-gray-500">{rimoText(row.content || '-')}</span></>
                      }}></RimoElement>
<RimoElement kind="el-table-column" prop="operator" label="操作員" width="110" slots={{
                        "default": ({
                          row
                        }) => <><span className="text-xs text-gray-600">{rimoText(row.operator)}</span></>
                      }}></RimoElement>
<RimoElement kind="el-table-column" prop="memo" label="備註" minWidth="120" slots={{
                        "default": ({
                          row
                        }) => <>{row.memo ? <><RimoElement kind="el-tooltip" content={row.memo} placement="top"><span className="text-xs text-gray-400 italic truncate block max-w-[120px]">{rimoText(row.memo)}</span></RimoElement></> : <><span className="text-gray-300">{text("-")}</span></>}</>
                      }}></RimoElement></RimoElement></div></> : <><div className="max-h-[520px] overflow-y-auto custom-scroll pr-1 space-y-2">{view.filteredFulfillmentEvents.length === 0 ? <><div className="text-center text-gray-400 text-sm py-8 border border-dashed border-gray-200 rounded-lg">{text("\n                                            當前分類暫無履約事件\n                                        ")}</div></> : null}
{rimoEntries(view.filteredFulfillmentEvents).map(([event, index], _itemIndex) => <Fragment key={event.key}><div key={event.key} className="relative pl-7">{index < view.filteredFulfillmentEvents.length - 1 ? <><div className="absolute left-[9px] top-7 bottom-[-10px] w-px bg-gray-100"></div></> : null}
<div className={rimoClass(["absolute left-0 top-3.5 w-5 h-5 rounded-full border-4 border-white shadow-sm", rimoClass(view.getFulfillmentEventDotClass(event))])}></div>
<div className={rimoClass(["rounded-lg border p-3 transition-colors", rimoClass(view.getFulfillmentEventCardClass(event))])}><div className="flex flex-wrap justify-between items-start gap-3"><div><div className="flex flex-wrap items-center gap-2"><RimoElement kind="el-tag" size="small" type={view.getFulfillmentEventTagType(event)} effect="plain">{text("\n                                                                ")}{rimoText(event.label)}{text("\n                                                            ")}</RimoElement>
<span className="font-bold text-gray-900 text-sm">{rimoText(event.title)}</span></div>
<div className="text-xs text-gray-500 mt-1">{rimoText(event.summary)}</div></div>
<div className="text-right text-xs text-gray-400 font-mono">{rimoText(event.time)}</div></div>
{event.kind === 'redirection' && view.fulfillmentEventTab === 'redirection' ? <><div className="mt-2 grid grid-cols-11 gap-2 items-stretch text-xs" data-rimo-grid="11"><div className="col-span-5 bg-white/80 border border-orange-100 rounded-lg p-3"><div className="text-gray-400 mb-1">{text("原車輛")}</div>
<div className="font-medium text-gray-700">{rimoText(event.record.fromVehicle)}</div></div>
<div className="col-span-1 flex items-center justify-center text-orange-400"><RimoElement kind="el-icon"><RimoIcon name="Right" /></RimoElement></div>
<div className="col-span-5 bg-white/90 border border-orange-100 rounded-lg p-3"><div className="text-gray-400 mb-1">{text("新車輛")}</div>
<div className="font-medium text-gray-900">{rimoText(event.record.toVehicle)}</div></div></div></> : null}
{event.kind === 'redirection' ? <><div className="mt-2 flex flex-wrap gap-2"><RimoElement kind="el-tag" size="small" type={event.record.priceChange > 0 ? 'danger' : event.record.priceChange < 0 ? 'success' : 'info'} effect="plain">{text("\n                                                        ")}{rimoText(view.formatSignedAmount(event.record.priceChange))}{text("\n                                                    ")}</RimoElement>
<RimoElement kind="el-tag" size="small" type="info" effect="plain">{text("\n                                                        ")}{rimoText(view.getRedirectionSettlementText(event.record))}{text("\n                                                    ")}</RimoElement>
{event.record.priceHandling === 'free' ? <><RimoElement kind="el-tag" size="small" type="success" effect="plain">{text("\n                                                        免費升等\n                                                    ")}</RimoElement></> : null}</div></> : null}
{event.kind === 'accident' && view.fulfillmentEventTab === 'accident' ? <><div className="mt-2 grid grid-cols-3 gap-2 text-xs" data-rimo-grid="3"><div className="bg-white/80 border border-red-100 rounded-lg p-3"><div className="text-gray-400 mb-1">{text("責任歸屬")}</div>
<div className="font-medium text-gray-800">{text("\n                                                            ")}{rimoText(view.getAccidentResponsibilityText(event.record.responsibility))}{text("\n                                                        ")}</div></div>
<div className="bg-white/80 border border-red-100 rounded-lg p-3"><div className="text-gray-400 mb-1">{text("處理狀態")}</div>
<div className="font-medium text-gray-800">{text("\n                                                            ")}{rimoText(view.getAccidentStatusText(event.record.status))}{text("\n                                                        ")}</div></div>
<div className="bg-white/80 border border-red-100 rounded-lg p-3"><div className="text-gray-400 mb-1">{text("預估費用")}</div>
<div className={rimoClass(["font-mono font-bold", rimoClass(event.record.amount > 0 ? 'text-red-600' : 'text-gray-500')])}>{text("\n                                                            ")}{rimoText(event.record.amount > 0 ? '¥' + view.formatNumber(event.record.amount) : '待定損')}{text("\n                                                        ")}</div></div></div></> : null}
{event.kind === 'accident' && view.fulfillmentEventTab === 'accident' && event.record.photos && event.record.photos.length ? <><div className="mt-2 flex gap-2">{rimoEntries(event.record.photos).map(([_photo, pIdx], _itemIndex) => <Fragment key={pIdx}><div key={pIdx} className="w-12 h-12 bg-white rounded border border-red-100 flex items-center justify-center cursor-pointer hover:border-red-300 transition-colors shrink-0"><RimoElement kind="el-icon" className="text-gray-300 text-lg"><RimoIcon name="Picture" /></RimoElement></div></Fragment>)}</div></> : null}
<div className="mt-2 pt-2 border-t border-white/70 flex flex-wrap justify-between items-center gap-2 text-xs" data-rimo-layout="toolbar"><div className="flex flex-wrap items-center gap-3 text-gray-500"><span className="flex items-center gap-1"><RimoElement kind="el-icon"><RimoIcon name="User" /></RimoElement>
{text(" ")}{rimoText(event.operator)}{text("\n                                                        ")}</span>
{event.memo ? <><span className="text-gray-400">{rimoText(event.memo)}</span></> : null}</div>
<div className="flex gap-2">{event.kind === 'accident' ? <><RimoElement kind="el-button" size="small" text={true} type="danger" onClick={event => {
                                  view.openAccidentRecords?.(event);
                                }}>{text("事故詳情")}</RimoElement></> : null}
{event.kind === 'accident' && event.record.amount > 0 ? <><RimoElement kind="el-button" size="small" text={true} type="primary" onClick={_event => {
                                  model.write(["feeModalVisible"], true);
                                }}>{text("關聯費用")}</RimoElement></> : null}
{event.kind === 'redirection' ? <><RimoElement kind="el-button" size="small" text={true} type="warning" onClick={event => {
                                  view.openRedirectionModal?.(event);
                                }} disabled={!view.canRedirect}>{text("再次改派")}</RimoElement></> : null}</div></div></div></div></Fragment>)}</div></>}</div></RimoElement></div>
<div className="col-span-4 space-y-4"><RimoElement kind="el-card" shadow="never" className="border-gray-200" bodyStyle={{
              padding: '0px'
            }} slots={{
              "header": _slot => <><div className="flex justify-between items-center"><span className="font-bold text-gray-800 flex items-center gap-2"><RimoElement kind="el-icon" className="text-[color:var(--app-color-primary)]"><RimoIcon name="DataLine" /></RimoElement>
{text(" 賬務總覽\n                                        ")}</span>
<RimoElement kind="el-tag" size="small" type={view.isMonthlyBilling ? 'primary' : 'success'} effect="plain">{text("\n                                            ")}{rimoText(view.isMonthlyBilling ? '企業月結' : '客戶自付')}{text("\n                                        ")}</RimoElement></div></>
            }}><div className="p-4"><div className="grid grid-cols-2 gap-3" data-rimo-grid="2"><div className="rounded-lg border border-gray-100 bg-gray-50 p-3"><div className="text-xs text-gray-500 mb-1">{text("合計應收")}</div>
<div className="font-mono text-lg font-bold text-gray-900">{text("¥")}{rimoText(view.formatNumber(view.financeOverview.totalReceivable))}</div></div>
<div className="rounded-lg border border-gray-100 bg-gray-50 p-3"><div className="text-xs text-gray-500 mb-1">{rimoText(view.isMonthlyBilling ? '企業掛賬' : '客戶實收')}</div>
<div className={rimoClass(["font-mono text-lg font-bold", rimoClass(view.isMonthlyBilling ? 'text-[color:var(--app-color-primary)]' : 'text-green-600')])}>{text("\n                                                ¥")}{rimoText(view.formatNumber(view.isMonthlyBilling ? view.financeOverview.monthlyBillAmount : view.financeOverview.customerPaid))}{text("\n                                            ")}</div></div>
<div className="rounded-lg border border-gray-100 bg-gray-50 p-3"><div className="text-xs text-gray-500 mb-1">{rimoText(view.isMonthlyBilling ? '客戶應收' : '待處理')}</div>
<div className={rimoClass(["font-mono text-lg font-bold", rimoClass(view.isMonthlyBilling ? 'text-gray-400' : view.financeOverview.pendingAmount > 0 ? 'text-orange-600' : 'text-green-600')])}>{text("\n                                                ¥")}{rimoText(view.formatNumber(view.isMonthlyBilling ? 0 : view.financeOverview.pendingAmount))}{text("\n                                            ")}</div></div>
<div className="rounded-lg border border-gray-100 bg-gray-50 p-3"><div className="text-xs text-gray-500 mb-1">{text("完成後追繳")}</div>
<div className={rimoClass(["font-mono text-lg font-bold", rimoClass(view.financeOverview.postChargeAmount > 0 ? 'text-orange-600' : 'text-gray-500')])}>{text("\n                                                ¥")}{rimoText(view.formatNumber(view.financeOverview.postChargeAmount))}{text("\n                                            ")}</div></div></div>
<div className={rimoClass(["mt-3 rounded-lg border px-3 py-2 text-xs", rimoClass(view.isMonthlyBilling ? 'bg-[color:var(--app-color-primary-light-9)] border-[color:var(--app-color-primary-light-8)] text-[color:var(--app-color-primary-hover)]' : 'bg-green-50 border-green-100 text-green-700')])}>{text("\n                                        ")}{rimoText(view.isMonthlyBilling ? '本單不向客戶發起支付、預授權、收款或退款；還車最終應收統一進入企業月結賬單。' : '本單由客戶自付，預授權、收款、退款、減免和追繳均需保留資金記錄。')}{text("\n                                    ")}</div></div></RimoElement>
<RimoElement kind="el-card" shadow="never" className="border-gray-200" bodyStyle={{
              padding: '0px'
            }} slots={{
              "header": _slot => <><div className="flex justify-between items-center"><span className="font-bold text-gray-800 flex items-center gap-2"><RimoElement kind="el-icon" className="text-[color:var(--app-color-primary)]"><RimoIcon name="Document" /></RimoElement>
{text(" 計費快照\n                                        ")}</span>
<div className="flex items-center gap-2"><RimoElement kind="el-tag" size="small" type="info" effect="plain">{text("基線 ")}{rimoText(view.billingSnapshotItems.length)}</RimoElement>
<RimoElement kind="el-tag" size="small" type={view.billingEventSnapshotItems.length ? 'warning' : 'info'} effect="plain">{text("\n                                                事件 ")}{rimoText(view.billingEventSnapshotItems.length)}{text("\n                                            ")}</RimoElement></div></div></>
            }}><div className="divide-y divide-gray-100 max-h-[300px] overflow-y-auto custom-scroll"><div className="px-4 py-2.5 bg-gray-50 border-b border-gray-100"><div className="flex items-center justify-between gap-3"><div className="text-xs font-semibold text-gray-600 uppercase tracking-wide">{text("訂單級基線快照")}</div></div></div>
{rimoEntries(view.billingSnapshotItems).map(([item], _itemIndex) => <Fragment key={item.key}><div key={item.key} className="px-4 py-3"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><div className="font-medium text-sm text-gray-800 truncate" title={item.title}>{rimoText(item.title)}</div>
<div className="text-xs text-gray-500 mt-1 truncate" title={item.summary}>{rimoText(item.summary)}</div></div>
<RimoElement kind="el-tag" size="small" type="primary" effect="plain" className="shrink-0 cursor-pointer" onClick={_event => {
                        view.openSnapshotVersion(item);
                      }}>{text("\n                                                ")}{rimoText(item.version)}{text("\n                                            ")}</RimoElement></div></div></Fragment>)}
<div className="px-4 py-2.5 bg-amber-50 border-y border-amber-100"><div className="flex items-center justify-between gap-3"><div className="text-xs font-semibold text-amber-700 uppercase tracking-wide">{text("事件級快照鏈")}</div></div></div>
{view.billingEventSnapshotItems.length ? <><>{rimoEntries(view.billingEventSnapshotItems).map(([item], _itemIndex) => <Fragment key={item.key}><div key={item.key} className="px-4 py-3 bg-amber-50/40"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><div className="flex items-center gap-2 flex-wrap"><div className="font-medium text-sm text-gray-800 truncate max-w-[220px]" title={item.title}>{rimoText(item.title)}</div>
<RimoElement kind="el-tag" size="small" type="warning" effect="plain">{rimoText(item.eventType)}</RimoElement></div>
<div className="text-xs text-gray-500 mt-1 truncate" title={item.summary}>{rimoText(item.summary)}</div></div>
<RimoElement kind="el-tag" size="small" type="warning" effect="plain" className="shrink-0 cursor-pointer" onClick={_event => {
                            view.openSnapshotVersion(item);
                          }}>{text("\n                                                ")}{rimoText(item.version)}{text("\n                                                ")}</RimoElement></div></div></Fragment>)}</></> : <><div className="px-4 py-4 text-xs text-gray-400">{text("\n                                        暫無事件級快照\n                                    ")}</div></>}</div>
<div className="bg-gray-50 border-t border-gray-100 px-4 py-3 text-xs text-gray-500 leading-5">{text("\n                                    ")}{rimoText(view.isMonthlyBilling ? '企業月結訂單不執行客戶支付與退款規則。' : '純履約動作不生成事件級計費快照。')}{text("\n                                ")}</div></RimoElement>
<RimoElement kind="el-card" shadow="never" className="border-gray-200" bodyStyle={{
              padding: '0px'
            }} slots={{
              "header": _slot => <><div className="flex justify-between items-center" data-rimo-layout="toolbar"><span className="font-bold text-gray-800 flex items-center gap-2"><RimoElement kind="el-icon" className="text-[color:var(--app-color-primary)]"><RimoIcon name="Receipt" /></RimoElement>
{text(" 收費明細")}</span>
<RimoElement kind="el-button" type="primary" link={true} onClick={_event => {
                    model.write(["feeModalVisible"], true);
                  }}>{text("管理費用")}</RimoElement></div></>
            }}><div className="divide-y divide-gray-100 max-h-[300px] overflow-y-auto custom-scroll">{rimoEntries(view.rightPanelFeeItems).map(([fee], _itemIndex) => <Fragment key={fee.id}><div key={fee.id} className="px-4 py-3 hover:bg-gray-50 transition-colors"><div className="flex justify-between items-start gap-3"><div className="min-w-0"><div className="flex items-center gap-2 flex-wrap"><span className="font-medium text-gray-800 text-sm">{rimoText(fee.name)}</span>
{fee.phase === 'post' ? <><RimoElement kind="el-tag" size="small" type="warning" effect="plain">{text("追繳")}</RimoElement></> : null}
<RimoElement kind="el-tag" size="small" type={view.getFeeStatusType(fee.status)} effect="plain">{text("\n                                                        ")}{rimoText(view.getFeeStatusText(fee.status))}{text("\n                                                    ")}</RimoElement></div>
<div className="text-xs text-gray-400 mt-1 truncate">{rimoText(fee.description)}</div></div>
<div className="text-right shrink-0"><div className="font-mono font-bold text-gray-900">{text("¥")}{rimoText(view.formatNumber(fee.amount))}</div>
{!view.isMonthlyBilling && fee.amount > fee.paidAmount ? <><div className="text-xs text-orange-500">{text("\n                                                    待收 ¥")}{rimoText(view.formatNumber(fee.amount - fee.paidAmount))}{text("\n                                                ")}</div></> : null}
{view.isMonthlyBilling ? <><div className="text-xs text-[color:var(--app-color-primary)]">{text("入企業賬單")}</div></> : null}</div></div></div></Fragment>)}
{view.rightPanelFeeItems.length === 0 ? <><div className="p-6 text-center text-gray-400 text-sm">{text("\n                                        暫無費用記錄\n                                    ")}</div></> : null}</div>
<div className="bg-gray-50 border-t border-gray-100 p-4 flex justify-between items-center text-xs"><span className="text-gray-500">{text("共 ")}{rimoText(view.financeOverview.feeCount)}{text(" 項費用")}</span>
<span className="text-gray-500">{text("已處理 ¥")}{rimoText(view.formatNumber(view.financeOverview.handledAmount))}</span></div></RimoElement>
<RimoElement kind="el-card" shadow="never" className="border-gray-200" bodyStyle={{
              padding: '0px'
            }} slots={{
              "header": _slot => <><div className="flex justify-between items-center" data-rimo-layout="toolbar"><span className="font-bold text-gray-800 flex items-center gap-2"><RimoElement kind="el-icon" className="text-[color:var(--app-color-primary)]"><RimoIcon name="CreditCard" /></RimoElement>
{text(" 資金記錄")}</span>
<RimoElement kind="el-button" type="primary" link={true} onClick={event => {
                    view.openTransactionsDialog?.(event);
                  }}>{text("\n                                            查看全部 ")}
<RimoElement kind="el-icon" className="ml-1"><RimoIcon name="ArrowRight" /></RimoElement></RimoElement></div></>
            }}>{view.recentFinancialTransactions.length === 0 ? <><div className="p-6 text-center text-gray-400 text-sm py-10"><RimoElement kind="el-empty" description="暫無資金記錄" imageSize={60}></RimoElement></div></> : <><div className="divide-y divide-gray-100 max-h-[300px] overflow-y-auto custom-scroll">{rimoEntries(view.recentFinancialTransactions).map(([txn], _itemIndex) => <Fragment key={txn.id}><div key={txn.id} className="p-4 flex justify-between items-center hover:bg-gray-50 transition-colors"><div className="flex items-center gap-3 min-w-0"><div className={rimoClass([rimoClass(txn.type === 'pre_auth' ? 'bg-[color:var(--app-color-primary-light-9)] text-blue-500' : txn.type === 'refund' ? 'bg-red-50 text-red-500' : txn.type === 'waiver' ? 'bg-gray-100 text-gray-500' : txn.type === 'monthly_bill' ? 'bg-[color:var(--app-color-primary-light-9)] text-[color:var(--app-color-primary)]' : 'bg-green-50 text-green-500'), "w-10 h-10 rounded-lg flex items-center justify-center shrink-0"])}><RimoElement kind="el-icon" className="text-xl"><RimoIcon name={txn.type === 'pre_auth' ? 'Lock' : txn.type === 'refund' ? 'RefreshLeft' : txn.type === 'waiver' ? 'Discount' : txn.type === 'monthly_bill' ? 'OfficeBuilding' : 'CircleCheck'} /></RimoElement></div>
<div className="min-w-0"><div className="flex items-center gap-2 flex-wrap"><span className="font-bold text-gray-800 text-sm">{rimoText(view.getTxnTypeLabel(txn.type, txn.txnType).text)}</span>
<RimoElement kind="el-tag" size="small" type={view.getTxnTypeLabel(txn.type, txn.txnType).type} effect="plain">{text("\n                                                        ")}{rimoText(view.getChannelName(txn.channel))}{text("\n                                                    ")}</RimoElement></div>
<div className="text-xs text-gray-400 truncate">{rimoText(txn.feeName)}{text(" · ")}{rimoText(txn.createdAt)}</div></div></div>
<div className="text-right shrink-0"><div className={rimoClass(["font-bold font-mono", rimoClass(txn.type === 'refund' ? 'text-red-500' : txn.type === 'waiver' ? 'text-gray-400 line-through decoration-gray-400' : txn.type === 'monthly_bill' ? 'text-[color:var(--app-color-primary)]' : txn.type === 'pre_auth' ? 'text-blue-600' : 'text-green-600')])}>{text("\n                                                ")}{rimoText(txn.type === 'refund' ? '-' : '')}{text("¥")}{rimoText(view.formatNumber(txn.amount))}{text("\n                                            ")}</div>
<div className="text-xs text-gray-400 font-mono">{rimoText(txn.refNo || '-')}</div></div></div></Fragment>)}</div></>}</RimoElement>
<RimoElement kind="el-card" shadow="never" className="border-gray-200" bodyStyle={{
              padding: '0px'
            }} slots={{
              "header": _slot => <><div className="flex justify-between items-center" data-rimo-layout="toolbar"><span className="font-bold text-gray-800 flex items-center gap-2"><RimoElement kind="el-icon" className="text-[color:var(--app-color-primary)]"><RimoIcon name="Tickets" /></RimoElement>
{text(" 發票記錄")}</span>
<RimoElement kind="el-button" type="primary" size="small" plain={true} icon="Plus">{text("\n                                            ")}{rimoText(view.isMonthlyBilling ? '月結開票' : '申請開票')}{text("\n                                        ")}</RimoElement></div></>
            }}><div className="px-4 py-3 bg-gray-50 border-b border-gray-100 text-xs text-gray-500">{text("\n                                    已開票 ¥")}{rimoText(view.formatNumber(view.invoiceSummary.issuedAmount))}{text(" · 待開票 ¥")}{rimoText(view.formatNumber(view.invoiceSummary.pendingAmount))}{text(" · 未開票 ¥")}{rimoText(view.formatNumber(view.invoiceSummary.uninvoicedAmount))}{text("\n                                ")}</div>
{view.invoiceRecords.length === 0 ? <><div className="p-6 text-center text-gray-400 text-sm py-10"><RimoElement kind="el-empty" description="暫無發票記錄" imageSize={60}></RimoElement></div></> : <><div className="divide-y divide-gray-100 max-h-[280px] overflow-y-auto custom-scroll">{rimoEntries(view.invoiceRecords).map(([invoice], _itemIndex) => <Fragment key={invoice.id}><div key={invoice.id} className="px-4 py-2.5 hover:bg-gray-50 transition-colors"><div className="flex justify-between items-center"><div className="flex items-center gap-2.5 flex-1 min-w-0"><div className={rimoClass(["w-8 h-8 rounded-lg flex items-center justify-center shrink-0", rimoClass(invoice.type === 'special' ? 'bg-[color:var(--app-color-primary-light-9)] text-blue-500' : 'bg-[color:var(--app-color-primary-light-9)] text-[color:var(--app-color-primary)]')])}><RimoElement kind="el-icon" className="text-base"><RimoIcon name="Tickets" /></RimoElement></div>
<div className="min-w-0 flex-1"><div className="flex items-center gap-2 flex-wrap"><span className="font-bold text-gray-800 text-sm">{rimoText(invoice.invoiceNo)}</span>
<RimoElement kind="el-tag" size="small" type={invoice.type === 'special' ? 'primary' : 'info'} effect="plain">{text("\n                                                            ")}{rimoText(invoice.type === 'special' ? '專票' : '普票')}{text("\n                                                        ")}</RimoElement>
<RimoElement kind="el-tag" size="small" type={invoice.status === 'issued' ? 'success' : 'warning'} effect="plain">{text("\n                                                            ")}{rimoText(invoice.status === 'issued' ? '已開具' : '待開具')}{text("\n                                                        ")}</RimoElement></div>
<div className="text-xs text-gray-400">{rimoText(invoice.issueTime)}</div></div></div>
<div className="flex items-center gap-4"><div className="font-bold font-mono text-gray-800">{text("¥")}{rimoText(view.formatNumber(invoice.amount))}</div>
<div className="flex items-center gap-1 text-xs text-[color:var(--app-color-primary)] cursor-pointer hover:text-[color:var(--app-color-primary)] transition-colors whitespace-nowrap" onClick={_event => {
                            model.assign(invoice, "showDetails", !invoice.showDetails);
                          }}><RimoElement kind="el-icon" className={rimoClass(["transition-transform text-xs", rimoClass({
                              'rotate-90': invoice.showDetails
                            })])}><RimoIcon name="CaretRight" /></RimoElement>
<span>{rimoText(invoice.items.length)}{text("項")}</span></div></div></div>
<div hidden={!invoice.showDetails} className="bg-gray-50 rounded-lg p-2.5 border border-gray-100 mt-2 animate__animated animate__fadeIn ml-10"><div className="grid grid-cols-2 gap-x-4 gap-y-0.5 mb-2" data-rimo-grid="2">{rimoEntries(invoice.items).map(([item, i], _itemIndex) => <Fragment key={i}><div key={i} className="flex justify-between text-xs"><span className="text-gray-500">{rimoText(item.name)}</span>
<span className="font-mono text-gray-700">{text("¥")}{rimoText(view.formatNumber(item.amount))}</span></div></Fragment>)}</div>
<div className="flex gap-2 pt-2 border-t border-gray-200"><RimoElement kind="el-button" size="small" plain={true} icon="View">{text("查看發票")}</RimoElement>
<RimoElement kind="el-button" size="small" plain={true} icon="Download">{text("下載PDF")}</RimoElement></div></div></div></Fragment>)}</div></>}</RimoElement>
<RimoElement kind="el-card" shadow="never" className="border-gray-200" bodyStyle={{
              padding: '0px'
            }} slots={{
              "header": _slot => <><div className="flex justify-between items-center" data-rimo-layout="toolbar"><span className="font-bold text-gray-800 flex items-center gap-2"><RimoElement kind="el-icon" className="text-[color:var(--app-color-primary)]"><RimoIcon name="List" /></RimoElement>
{text(" 費用審計\n                                        ")}</span>
<RimoElement kind="el-button" type="primary" link={true} onClick={event => {
                    view.openFeeAuditLog?.(event);
                  }}>{text("查看日誌")}</RimoElement></div></>
            }}>{view.recentFeeAuditLogs.length === 0 ? <><div className="p-6 text-center text-gray-400 text-sm">{text("\n                                    暫無費用審計記錄\n                                ")}</div></> : <><div className="divide-y divide-gray-100">{rimoEntries(view.recentFeeAuditLogs).map(([log], _itemIndex) => <Fragment key={log.id}><div key={log.id} className="px-4 py-2.5 flex items-start gap-2"><RimoElement kind="el-tag" type={view.getLogActionType(log.action)} size="small" effect="plain" className="shrink-0">{text("\n                                            ")}{rimoText(log.action)}{text("\n                                        ")}</RimoElement>
<div className="min-w-0 flex-1"><div className="text-xs text-gray-700 truncate">{rimoText(log.detail)}</div>
<div className="text-xs text-gray-400 mt-0.5">{rimoText(log.time)}{text(" · ")}{rimoText(log.operator)}</div></div></div></Fragment>)}</div></>}</RimoElement></div></div></div></div><RimoElement kind="el-dialog" modelValue={view.remarksDialogVisible} onModelChange={value => {
      model.write(["remarksDialogVisible"], value);
    }} title="訂單備註" width="500px" destroyOnClose={true} className="order-detail-overlay" slots={{
      "footer": _slot => <><div className="dialog-footer"><RimoElement kind="el-button" onClick={_event => {
            model.write(["remarksDialogVisible"], false);
          }}>{text("取消")}</RimoElement>
<RimoElement kind="el-button" type="primary" onClick={event => {
            view.saveRemarks?.(event);
          }}>{text("保存")}</RimoElement></div></>
    }}>{() => <><RimoElement kind="el-form" model={view.remarksForm} labelPosition="top"><RimoElement kind="el-form-item" label="備註內容"><RimoElement kind="el-input" modelValue={view.remarksForm.content} onModelChange={value => {
              model.write(["remarksForm", "content"], value);
            }} type="textarea" rows={4} placeholder="請輸入訂單特殊備註信息..."></RimoElement></RimoElement></RimoElement></>}</RimoElement>
<RimoElement kind="el-dialog" modelValue={view.accidentDialogVisible} onModelChange={value => {
      model.write(["accidentDialogVisible"], value);
    }} title="事故登記" width="760px" destroyOnClose={true} className="order-detail-overlay" slots={{
      "footer": _slot => <>{view.isAddingAccident ? <><div className="dialog-footer">{view.accidentRecords.length > 0 ? <><RimoElement kind="el-button" onClick={_event => {
                model.write(["isAddingAccident"], false);
              }}>{text("取消")}</RimoElement></> : <><RimoElement kind="el-button" onClick={_event => {
                model.write(["accidentDialogVisible"], false);
              }}>{text("取消")}</RimoElement></>}
<RimoElement kind="el-button" type="primary" onClick={event => {
              view.saveAccident?.(event);
            }}>{text("確認登記")}</RimoElement></div></> : <><div className="dialog-footer"><RimoElement kind="el-button" onClick={_event => {
              model.write(["accidentDialogVisible"], false);
            }}>{text("關閉")}</RimoElement></div></>}</>
    }}>{() => <><div className={rimoClass(["mb-4 rounded-lg border px-4 py-3 text-sm", rimoClass(view.isMonthlyBilling ? 'bg-[color:var(--app-color-primary-light-9)] border-[color:var(--app-color-primary-light-8)] text-[color:var(--app-color-primary-hover)]' : 'bg-red-50 border-red-100 text-red-700')])}><div className="font-bold">{rimoText(view.accidentContextHint.title)}</div>
<div className="grid grid-cols-3 gap-2 mt-2 text-xs" data-rimo-grid="3"><div className="bg-white/80 border border-gray-200 rounded px-2 py-1"><span className="opacity-70">{text("訂單影響")}</span>
<span className="font-bold ml-1">{rimoText(view.accidentContextHint.status)}</span></div>
<div className="bg-white/80 border border-gray-200 rounded px-2 py-1"><span className="opacity-70">{text("費用處理")}</span>
<span className="font-bold ml-1">{rimoText(view.accidentContextHint.fee)}</span></div>
<div className="bg-white/80 border border-gray-200 rounded px-2 py-1"><span className="opacity-70">{text("未結案事故")}</span>
<span className="font-bold ml-1">{rimoText(view.eventCounts.openAccident)}</span></div></div>
<div className="text-xs mt-2 opacity-90">{rimoText(view.accidentContextHint.desc)}</div></div>
{view.accidentRecords.length > 0 && !view.isAddingAccident ? <><div className="mb-4"><div className="flex justify-between items-center mb-3"><span className="text-sm font-bold text-gray-700">{text("已登記記錄")}</span>
<RimoElement kind="el-button" type="primary" size="small" icon="Plus" onClick={_event => {
                model.write(["isAddingAccident"], true);
              }}>{text("新增記錄")}</RimoElement></div>
<div className="space-y-3 max-h-[300px] overflow-y-auto custom-scroll pr-1">{rimoEntries(view.accidentRecords).map(([record, index], _itemIndex) => <Fragment key={record.id}><div key={record.id} className="bg-gray-50 p-3 rounded-lg border border-gray-200 flex justify-between items-start gap-3" data-rimo-layout="toolbar"><div className="flex-1"><div className="flex items-center gap-2 mb-1"><div className="font-bold text-sm text-gray-800">{rimoText(record.description)}</div>
<RimoElement kind="el-tag" size="small" type={record.status === 'closed' ? 'success' : 'danger'} effect="plain">{text("\n                                    ")}{rimoText(view.getAccidentStatusText(record.status))}{text("\n                                ")}</RimoElement></div>
<div className="text-xs text-gray-500 mb-2 flex gap-3"><span>{rimoText(record.time)}</span>
<span>{rimoText(record.operator)}</span>
<span>{rimoText(view.getAccidentResponsibilityText(record.responsibility))}</span>
{record.location ? <><span>{rimoText(record.location)}</span></> : null}</div>
<div className="flex items-center justify-between gap-3"><div className="flex gap-2">{rimoEntries(record.photos).map(([_photo, pIdx], _itemIndex) => <Fragment key={pIdx}><div key={pIdx} className="w-10 h-10 bg-white rounded border border-gray-200 flex items-center justify-center"><RimoElement kind="el-icon" className="text-gray-400"><RimoIcon name="Picture" /></RimoElement></div></Fragment>)}</div>
<div className="text-right"><div className="text-xs text-gray-400">{text("預估費用")}</div>
<div className={rimoClass(["font-mono font-bold", rimoClass(record.amount > 0 ? 'text-red-600' : 'text-gray-500')])}>{text("\n                                        ")}{rimoText(record.amount > 0 ? '¥' + view.formatNumber(record.amount) : '待定損')}{text("\n                                    ")}</div></div></div></div>
<div className="flex flex-col items-end gap-1">{record.status !== 'closed' ? <><RimoElement kind="el-button" type="success" link={true} size="small" onClick={_event => {
                        view.closeAccidentRecord(record);
                      }}>{text("標記結案")}</RimoElement></> : null}
<RimoElement kind="el-button" type="danger" link={true} icon="Delete" onClick={_event => {
                      view.deleteAccident(index);
                    }} size="small"></RimoElement></div></div></Fragment>)}</div></div></> : view.accidentRecords.length === 0 && !view.isAddingAccident ? <><div className="text-center py-8"><RimoElement kind="el-empty" description="暫無事故記錄" imageSize={80}></RimoElement>
<RimoElement kind="el-button" type="primary" icon="Plus" onClick={_event => {
              model.write(["isAddingAccident"], true);
            }}>{text("新增第一條記錄")}</RimoElement></div></> : <><div>{view.accidentRecords.length > 0 ? <><div className="flex items-center gap-2 mb-4 text-sm text-gray-500 cursor-pointer hover:text-[color:var(--app-color-primary)]" onClick={_event => {
                model.write(["isAddingAccident"], false);
              }}><RimoElement kind="el-icon"><RimoIcon name="Back" /></RimoElement>
{text(" 返回列表\n                ")}</div></> : null}
<RimoElement kind="el-form" model={view.newAccidentForm} labelPosition="top"><RimoElement kind="el-form-item" label="事故詳情描述"><RimoElement kind="el-input" modelValue={view.newAccidentForm.description} onModelChange={value => {
                  model.write(["newAccidentForm", "description"], value);
                }} type="textarea" rows={3} placeholder="請詳細描述事故部位、程度及原因..."></RimoElement></RimoElement>
<div className="grid grid-cols-2 gap-4" data-rimo-grid="2" data-rimo-layout="form-grid"><RimoElement kind="el-form-item" label="事故時間"><RimoElement kind="el-date-picker" modelValue={view.newAccidentForm.accidentTime} onModelChange={value => {
                    model.write(["newAccidentForm", "accidentTime"], value);
                  }} type="datetime" placeholder="選擇事故時間" className="w-full" style={rimoStyle("width: 100%")}></RimoElement></RimoElement>
<RimoElement kind="el-form-item" label="事故地點"><RimoElement kind="el-input" modelValue={view.newAccidentForm.location} onModelChange={value => {
                    model.write(["newAccidentForm", "location"], value);
                  }} placeholder="事故發生地點或停車位置"></RimoElement></RimoElement></div>
<div className="grid grid-cols-2 gap-4" data-rimo-grid="2" data-rimo-layout="form-grid"><RimoElement kind="el-form-item" label="責任歸屬"><RimoElement kind="el-select" modelValue={view.newAccidentForm.responsibility} onModelChange={value => {
                    model.write(["newAccidentForm", "responsibility"], value);
                  }} placeholder="請選擇責任歸屬" className="w-full"><RimoElement kind="el-option" label="客戶責任" value="customer"></RimoElement>
<RimoElement kind="el-option" label="門店責任" value="store"></RimoElement>
<RimoElement kind="el-option" label="第三方責任" value="third_party"></RimoElement>
<RimoElement kind="el-option" label="責任待定" value="pending"></RimoElement></RimoElement></RimoElement>
<RimoElement kind="el-form-item" label="預估費用"><RimoElement kind="el-input-number" modelValue={view.newAccidentForm.estimatedAmount} onModelChange={value => {
                    model.write(["newAccidentForm", "estimatedAmount"], value);
                  }} min={0} step={100} className="!w-full" controlsPosition="right"></RimoElement></RimoElement></div>
<div className="grid grid-cols-2 gap-4" data-rimo-grid="2" data-rimo-layout="form-grid"><RimoElement kind="el-form-item" label="處理狀態"><RimoElement kind="el-select" modelValue={view.newAccidentForm.handlingStatus} onModelChange={value => {
                    model.write(["newAccidentForm", "handlingStatus"], value);
                  }} className="w-full"><RimoElement kind="el-option" label="待定損" value="pending_assessment"></RimoElement>
<RimoElement kind="el-option" label="保險處理中" value="insurance_processing"></RimoElement>
<RimoElement kind="el-option" label="客戶確認中" value="customer_confirming"></RimoElement>
<RimoElement kind="el-option" label="已結案" value="closed"></RimoElement></RimoElement></RimoElement>
<RimoElement kind="el-form-item" label="保險報案號"><RimoElement kind="el-input" modelValue={view.newAccidentForm.insuranceNo} onModelChange={value => {
                    model.write(["newAccidentForm", "insuranceNo"], value);
                  }} placeholder="已報案時填寫"></RimoElement></RimoElement></div>
<RimoElement kind="el-form-item" label="處理備註"><RimoElement kind="el-input" modelValue={view.newAccidentForm.remark} onModelChange={value => {
                  model.write(["newAccidentForm", "remark"], value);
                }} type="textarea" rows={2} placeholder="填寫保險報案、客戶溝通或門店處理說明..."></RimoElement></RimoElement>
<RimoElement kind="el-form-item" label="現場照片"><RimoElement kind="el-upload" action="#" listType="picture-card" autoUpload={false} limit={5}><RimoElement kind="el-icon"><RimoIcon name="Plus" /></RimoElement></RimoElement></RimoElement></RimoElement></div></>}</>}</RimoElement>
<RimoElement kind="el-dialog" modelValue={view.returnStoreChangeDialogVisible} onModelChange={value => {
      model.write(["returnStoreChangeDialogVisible"], value);
    }} title="改還車門市 / 轉單" width="720px" destroyOnClose={true} className="order-detail-overlay" slots={{
      "footer": _slot => <><div className="dialog-footer"><RimoElement kind="el-button" onClick={_event => {
            model.write(["returnStoreChangeDialogVisible"], false);
          }}>{text("取消")}</RimoElement>
<RimoElement kind="el-button" type="primary" onClick={event => {
            view.confirmReturnStoreChange?.(event);
          }} disabled={view.returnStoreConflict.hasConflict && !view.returnStoreConflict.resolved}>{text("確認轉單")}</RimoElement></div></>
    }}>{() => <><div className="space-y-4"><div className="grid grid-cols-2 gap-3 text-sm" data-rimo-grid="2"><div className="rounded border border-gray-200 bg-gray-50 p-3"><div className="text-xs text-gray-500 mb-1">{text("取車門市")}</div>
<div className="font-bold text-gray-800">{rimoText(view.pickupStoreName)}</div></div>
<div className="rounded border border-gray-200 bg-gray-50 p-3"><div className="text-xs text-gray-500 mb-1">{text("當前還車門市")}</div>
<div className="font-bold text-gray-800">{rimoText(view.currentReturnStoreName)}</div></div></div>
<div className="rounded border border-amber-100 bg-amber-50 px-3 py-2 text-xs text-amber-800">{text("\n                    確認後訂單當前還車門市會更新，新門市獲得訂單列表、詳情和還車操作權限；原還車門市不再辦理還車。\n                ")}</div>
<div className="rounded border border-blue-100 bg-blue-50 px-3 py-2 text-xs text-blue-700">{text("\n                    本期僅支持同車行內改還車門市/轉單，跨車行轉單不開放系統操作。\n                ")}</div>
<RimoElement kind="el-form" labelPosition="top"><RimoElement kind="el-form-item" label="新還車門市"><RimoElement kind="el-select" modelValue={view.returnStoreChangeData.newStoreId} onModelChange={value => {
                model.write(["returnStoreChangeData", "newStoreId"], value);
              }} className="w-full" onChange={event => {
                view.checkReturnStoreScheduleConflict?.(event);
              }}>{rimoEntries(view.returnStoreTransferOptions).map(([store], _itemIndex) => <Fragment key={store.id}><RimoElement kind="el-option" key={store.id} label={store.name} value={store.id}></RimoElement></Fragment>)}</RimoElement></RimoElement>
<RimoElement kind="el-form-item" label="變更原因"><RimoElement kind="el-select" modelValue={view.returnStoreChangeData.reason} onModelChange={value => {
                model.write(["returnStoreChangeData", "reason"], value);
              }} className="w-full">{rimoEntries(view.returnStoreChangeReasons).map(([reason], _itemIndex) => <Fragment key={reason.value}><RimoElement kind="el-option" key={reason.value} label={reason.label} value={reason.value}></RimoElement></Fragment>)}</RimoElement></RimoElement>
<RimoElement kind="el-form-item" label={view.returnStoreChangeData.reason === 'other' ? '備註（必填）' : '備註'}><RimoElement kind="el-input" modelValue={view.returnStoreChangeData.remark} onModelChange={value => {
                model.write(["returnStoreChangeData", "remark"], value);
              }} type="textarea" rows={3} placeholder="記錄客戶說明、門店協商結果或異常情況"></RimoElement></RimoElement></RimoElement>
{view.returnStoreConflict.checked && view.returnStoreConflict.hasConflict ? <><div className={rimoClass(["rounded border p-4", rimoClass(view.returnStoreConflict.resolved ? 'border-green-100 bg-green-50' : 'border-red-200 bg-red-50')])}><div className="flex items-start gap-3"><RimoElement kind="el-icon" className={rimoClass(["text-xl mt-0.5", rimoClass(view.returnStoreConflict.resolved ? 'text-green-600' : 'text-red-500')])}>{!view.returnStoreConflict.resolved ? <><RimoIcon name="WarningFilled" /></> : <><RimoIcon name="CircleCheckFilled" /></>}</RimoElement>
<div className="flex-1"><div className="flex items-center justify-between gap-3"><div><h4 className="font-bold text-gray-800 text-sm mb-1">{text("\n                                        ")}{rimoText(view.returnStoreConflict.resolved ? '後續訂單已快捷改派' : '原還車門市存在後續預約')}{text("\n                                    ")}</h4>
<p className={rimoClass(["text-xs", rimoClass(view.returnStoreConflict.resolved ? 'text-green-700' : 'text-red-600')])}>{text("\n                                        ")}{rimoText(view.orderView.vehicle.plate)}{text(" 轉到 ")}{rimoText(view.returnStoreConflict.targetStoreName)}{text(" 後，原還車門市\n                                        ")}{rimoText(view.returnStoreConflict.originalStoreName)}{text(" 的後續訂單需要先釋放車輛佔用。\n                                    ")}</p></div>
<RimoElement kind="el-tag" size="small" type={view.returnStoreConflict.resolved ? 'success' : 'danger'}>{text("\n                                    ")}{rimoText(view.returnStoreConflict.resolved ? '已處理' : '需處理')}{text("\n                                ")}</RimoElement></div>
<div className="grid grid-cols-4 gap-2 mt-3 text-xs" data-rimo-grid="4"><div className="bg-white/80 border rounded p-2"><div className="text-gray-400">{text("後續訂單")}</div>
<div className="font-bold text-gray-800 mt-1">{rimoText(view.returnStoreConflict.orderId)}</div></div>
<div className="bg-white/80 border rounded p-2"><div className="text-gray-400">{text("取車時間")}</div>
<div className="font-bold text-gray-800 mt-1">{rimoText(view.returnStoreConflict.pickupTime)}</div></div>
<div className="bg-white/80 border rounded p-2"><div className="text-gray-400">{text("客戶")}</div>
<div className="font-bold text-gray-800 mt-1">{rimoText(view.returnStoreConflict.customerName)}</div></div>
<div className="bg-white/80 border rounded p-2"><div className="text-gray-400">{text("派車狀態")}</div>
<div className="font-bold text-gray-800 mt-1">{rimoText(view.returnStoreConflict.status)}</div></div></div>
<div className="flex items-center justify-between mt-3" data-rimo-layout="toolbar"><div className="text-xs text-gray-600">{text("\n                                    ")}{rimoText(view.returnStoreConflict.currentVehicle)}{text(" -> ")}{rimoText(view.returnStoreConflict.targetVehicle)}{text("\n                                ")}</div>
{!view.returnStoreConflict.resolved ? <><RimoElement kind="el-button" type="danger" size="small" plain={true} onClick={event => {
                        view.quickRedirectReturnStoreConflict?.(event);
                      }}>{text("快捷改派後續訂單")}</RimoElement></> : null}</div></div></div></div></> : null}
<div className="grid grid-cols-3 gap-3 text-sm" data-rimo-grid="3"><div className="rounded border border-gray-200 p-3"><div className="text-xs text-gray-500 mb-1">{text("當前異地費")}</div>
<div className="font-bold text-gray-800">{text("¥")}{rimoText(view.formatNumber(view.returnStoreCurrentFee))}</div></div>
<div className="rounded border border-gray-200 p-3"><div className="text-xs text-gray-500 mb-1">{text("新異地費")}</div>
<div className="font-bold text-gray-800">{text("¥")}{rimoText(view.formatNumber(view.returnStoreNewFee))}</div></div>
<div className={rimoClass(["rounded border p-3", rimoClass(view.returnStoreChangeFeeDelta > 0 ? 'border-red-100 bg-red-50' : view.returnStoreChangeFeeDelta < 0 ? 'border-green-100 bg-green-50' : 'border-gray-200 bg-gray-50')])}><div className={rimoClass(["text-xs mb-1", rimoClass(view.returnStoreChangeFeeDelta > 0 ? 'text-red-500' : view.returnStoreChangeFeeDelta < 0 ? 'text-green-600' : 'text-gray-500')])}>{text("\n                            本次差額\n                        ")}</div>
<div className={rimoClass(["font-bold", rimoClass(view.returnStoreChangeFeeDelta > 0 ? 'text-red-600' : view.returnStoreChangeFeeDelta < 0 ? 'text-green-700' : 'text-gray-800')])}>{text("\n                            ")}{rimoText(view.returnStoreChangeFeeDelta >= 0 ? '+' : '-')}{text("¥")}{rimoText(view.formatNumber(view.returnStoreChangeFeeAbs))}{text("\n                        ")}</div></div></div></div></>}</RimoElement>
<RimoElement kind="el-dialog" modelValue={view.returnStationChangeDialogVisible} onModelChange={value => {
      model.write(["returnStationChangeDialogVisible"], value);
    }} title="改還車據點" width="720px" destroyOnClose={true} className="order-detail-overlay" slots={{
      "footer": _slot => <><div className="dialog-footer"><RimoElement kind="el-button" onClick={_event => {
            model.write(["returnStationChangeDialogVisible"], false);
          }}>{text("取消")}</RimoElement>
<RimoElement kind="el-button" type="primary" onClick={event => {
            view.confirmReturnStationChange?.(event);
          }} disabled={view.returnStationConflict.hasConflict && !view.returnStationConflict.resolved}>{text("確認改還車據點")}</RimoElement></div></>
    }}>{() => <><div className="space-y-4"><div className="grid grid-cols-2 gap-3 text-sm" data-rimo-grid="2"><div className="rounded border border-gray-200 bg-gray-50 p-3"><div className="text-xs text-gray-500 mb-1">{text("當前還車門市")}</div>
<div className="font-bold text-gray-800">{rimoText(view.currentReturnStoreName)}</div></div>
<div className="rounded border border-gray-200 bg-gray-50 p-3"><div className="text-xs text-gray-500 mb-1">{text("當前還車據點")}</div>
<div className="font-bold text-gray-800">{rimoText(view.currentReturnStationName)}</div></div></div>
<div className="rounded border border-amber-100 bg-amber-50 px-3 py-2 text-xs text-amber-800">{text("\n                    適用於 24 小時自助訂單，或需要人工指定具體還車據點的場景。確認後訂單當前還車據點會更新；如同時切換到其他門市，則新門市獲得還車辦理權限。\n                ")}</div>
<div className="rounded border border-blue-100 bg-blue-50 px-3 py-2 text-xs text-blue-700">{text("\n                    本期不自動改站、不自動取消。若門市或據點已關閉，僅提示“站點已關閉，請聯繫客服處理”，由客服人工處理。\n                ")}</div>
<RimoElement kind="el-form" labelPosition="top"><RimoElement kind="el-form-item" label="新還車據點"><RimoElement kind="el-cascader" modelValue={view.returnStationChangeData.path} onModelChange={value => {
                model.write(["returnStationChangeData", "path"], value);
              }} options={view.returnStationTransferOptions} className="w-full" clearable={true} onChange={event => {
                view.checkReturnStationScheduleConflict?.(event);
              }} placeholder="選擇門市與據點"></RimoElement></RimoElement>
<RimoElement kind="el-form-item" label="變更原因"><RimoElement kind="el-select" modelValue={view.returnStationChangeData.reason} onModelChange={value => {
                model.write(["returnStationChangeData", "reason"], value);
              }} className="w-full">{rimoEntries(view.returnStoreChangeReasons).map(([reason], _itemIndex) => <Fragment key={reason.value}><RimoElement kind="el-option" key={reason.value} label={reason.label.replace('門市', '據點')} value={reason.value}></RimoElement></Fragment>)}</RimoElement></RimoElement>
<RimoElement kind="el-form-item" label={view.returnStationChangeData.reason === 'other' ? '備註（必填）' : '備註'}><RimoElement kind="el-input" modelValue={view.returnStationChangeData.remark} onModelChange={value => {
                model.write(["returnStationChangeData", "remark"], value);
              }} type="textarea" rows={3} placeholder="記錄站點關閉、客服溝通結果或客戶變更說明"></RimoElement></RimoElement></RimoElement>
{view.returnStationConflict.checked && view.returnStationConflict.hasConflict ? <><div className={rimoClass(["rounded border p-4", rimoClass(view.returnStationConflict.resolved ? 'border-green-100 bg-green-50' : 'border-red-200 bg-red-50')])}><div className="flex items-start gap-3"><RimoElement kind="el-icon" className={rimoClass(["text-xl mt-0.5", rimoClass(view.returnStationConflict.resolved ? 'text-green-600' : 'text-red-500')])}>{!view.returnStationConflict.resolved ? <><RimoIcon name="WarningFilled" /></> : <><RimoIcon name="CircleCheckFilled" /></>}</RimoElement>
<div className="flex-1"><div className="flex items-center justify-between gap-3"><div><h4 className="font-bold text-gray-800 text-sm mb-1">{text("\n                                        ")}{rimoText(view.returnStationConflict.resolved ? '後續訂單已快捷改派' : '原還車門市存在後續預約')}{text("\n                                    ")}</h4>
<p className={rimoClass(["text-xs", rimoClass(view.returnStationConflict.resolved ? 'text-green-700' : 'text-red-600')])}>{text("\n                                        ")}{rimoText(view.orderView.vehicle.plate)}{text(" 改到 ")}{rimoText(view.returnStationConflict.targetStoreName)}{text(" / ")}{rimoText(view.returnStationConflict.targetStationName)}{text(" 後，原還車門市\n                                        ")}{rimoText(view.returnStationConflict.originalStoreName)}{text(" 的後續訂單需要先釋放車輛佔用。\n                                    ")}</p></div>
<RimoElement kind="el-tag" size="small" type={view.returnStationConflict.resolved ? 'success' : 'danger'}>{text("\n                                    ")}{rimoText(view.returnStationConflict.resolved ? '已處理' : '需處理')}{text("\n                                ")}</RimoElement></div>
<div className="grid grid-cols-4 gap-2 mt-3 text-xs" data-rimo-grid="4"><div className="bg-white/80 border rounded p-2"><div className="text-gray-400">{text("後續訂單")}</div>
<div className="font-bold text-gray-800 mt-1">{rimoText(view.returnStationConflict.orderId)}</div></div>
<div className="bg-white/80 border rounded p-2"><div className="text-gray-400">{text("取車時間")}</div>
<div className="font-bold text-gray-800 mt-1">{rimoText(view.returnStationConflict.pickupTime)}</div></div>
<div className="bg-white/80 border rounded p-2"><div className="text-gray-400">{text("客戶")}</div>
<div className="font-bold text-gray-800 mt-1">{rimoText(view.returnStationConflict.customerName)}</div></div>
<div className="bg-white/80 border rounded p-2"><div className="text-gray-400">{text("派車狀態")}</div>
<div className="font-bold text-gray-800 mt-1">{rimoText(view.returnStationConflict.status)}</div></div></div>
<div className="flex items-center justify-between mt-3" data-rimo-layout="toolbar"><div className="text-xs text-gray-600">{text("\n                                    ")}{rimoText(view.returnStationConflict.currentVehicle)}{text(" -> ")}{rimoText(view.returnStationConflict.targetVehicle)}{text("\n                                ")}</div>
{!view.returnStationConflict.resolved ? <><RimoElement kind="el-button" type="danger" size="small" plain={true} onClick={event => {
                        view.quickRedirectReturnStationConflict?.(event);
                      }}>{text("快捷改派後續訂單")}</RimoElement></> : null}</div></div></div></div></> : null}</div></>}</RimoElement>
<RimoElement kind="el-dialog" modelValue={view.pickupModalVisible} onModelChange={value => {
      model.write(["pickupModalVisible"], value);
    }} title="車輛取車作業" width="1000px" destroyOnClose={true} top="5vh" className="rounded-xl overflow-hidden custom-modal order-detail-overlay" beforeClose={view.handlePickupDialogClose} slots={{
      "footer": _slot => <><div className="flex justify-between items-center" data-rimo-layout="toolbar"><div className="flex gap-2"><RimoElement kind="el-button" onClick={event => {
              view.requestClosePickupModal?.(event);
            }} disabled={view.pickupStep === 3}>{text("暫停辦理")}</RimoElement>
{view.orderStatus === 'inspecting' && view.pickupStep < 3 ? <><RimoElement kind="el-button" type="danger" plain={true} onClick={event => {
                view.openRejectOrderModal?.(event);
              }}>{text("拒絕履約")}</RimoElement></> : null}</div>
<div>{view.pickupStep > 0 && view.pickupStep < 3 ? <><RimoElement kind="el-button" onClick={_event => {
                model.increment(["pickupStep"], -1, false);
              }}>{text("上一步")}</RimoElement></> : null}
<RimoElement kind="el-button" type="primary" onClick={event => {
              view.nextPickupStep?.(event);
            }} loading={view.processing}>{text("\n                            ")}{rimoText(view.pickupStep === 3 ? '關閉' : view.pickupStep === 2 ? '確認發車' : '下一步')}{text("\n                        ")}</RimoElement></div></div></>
    }}>{() => <><div className="h-[85vh] flex flex-col"><div className="px-10 py-6 bg-white border-b border-gray-100 flex items-center justify-between shrink-0"><div className={rimoClass(["flex items-center gap-3 relative z-10", rimoClass({
              'opacity-100': view.pickupStep >= 0,
              'opacity-50': view.pickupStep < 0
            })])}><div className={rimoClass(["w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ring-4", rimoClass(view.pickupStep >= 0 ? 'bg-[color:var(--app-color-primary)] text-white ring-[color:var(--app-color-primary-light-9)]' : 'bg-gray-100 text-gray-400 ring-transparent')])}>{view.pickupStep > 0 ? <><RimoElement kind="el-icon"><RimoIcon name="Check" /></RimoElement></> : <><span>{text("1")}</span></>}</div>
<div className="flex flex-col"><span className="text-xs font-bold uppercase tracking-wider text-gray-500">{text("Step 01")}</span>
<span className="text-sm font-bold text-gray-800">{text("身份與資格")}</span></div></div>
<div className="flex-1 h-0.5 bg-gray-100 mx-6 rounded-full overflow-hidden"><div className="h-full bg-[color:var(--app-color-primary)] transition-all duration-500" style={rimoStyle({
                width: view.pickupStep >= 1 ? '100%' : '0%'
              })}></div></div>
<div className={rimoClass(["flex items-center gap-3 relative z-10", rimoClass({
              'opacity-100': view.pickupStep >= 1,
              'opacity-50': view.pickupStep < 1
            })])}><div className={rimoClass(["w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ring-4", rimoClass(view.pickupStep >= 1 ? 'bg-[color:var(--app-color-primary)] text-white ring-[color:var(--app-color-primary-light-9)]' : 'bg-gray-100 text-gray-400 ring-transparent')])}>{view.pickupStep > 1 ? <><RimoElement kind="el-icon"><RimoIcon name="Check" /></RimoElement></> : <><span>{text("2")}</span></>}</div>
<div className="flex flex-col"><span className="text-xs font-bold uppercase tracking-wider text-gray-500">{text("Step 02")}</span>
<span className="text-sm font-bold text-gray-800">{text("押金尾款")}</span></div></div>
<div className="flex-1 h-0.5 bg-gray-100 mx-6 rounded-full overflow-hidden"><div className="h-full bg-[color:var(--app-color-primary)] transition-all duration-500" style={rimoStyle({
                width: view.pickupStep >= 2 ? '100%' : '0%'
              })}></div></div>
<div className={rimoClass(["flex items-center gap-3 relative z-10", rimoClass({
              'opacity-100': view.pickupStep >= 2,
              'opacity-50': view.pickupStep < 2
            })])}><div className={rimoClass(["w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ring-4", rimoClass(view.pickupStep >= 2 ? 'bg-[color:var(--app-color-primary)] text-white ring-[color:var(--app-color-primary-light-9)]' : 'bg-gray-100 text-gray-400 ring-transparent')])}>{view.pickupStep > 2 ? <><RimoElement kind="el-icon"><RimoIcon name="Check" /></RimoElement></> : <><span>{text("3")}</span></>}</div>
<div className="flex flex-col"><span className="text-xs font-bold uppercase tracking-wider text-gray-500">{text("Step 03")}</span>
<span className="text-sm font-bold text-gray-800">{text("合約驗車")}</span></div></div>
<div className="flex-1 h-0.5 bg-gray-100 mx-6 rounded-full overflow-hidden"><div className="h-full bg-[color:var(--app-color-primary)] transition-all duration-500" style={rimoStyle({
                width: view.pickupStep >= 3 ? '100%' : '0%'
              })}></div></div>
<div className={rimoClass(["flex items-center gap-3 relative z-10", rimoClass({
              'opacity-100': view.pickupStep >= 3,
              'opacity-50': view.pickupStep < 3
            })])}><div className={rimoClass(["w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ring-4", rimoClass(view.pickupStep >= 3 ? 'bg-[color:var(--app-color-primary)] text-white ring-[color:var(--app-color-primary-light-9)]' : 'bg-gray-100 text-gray-400 ring-transparent')])}>{view.pickupStep > 3 ? <><RimoElement kind="el-icon"><RimoIcon name="Check" /></RimoElement></> : <><span>{text("4")}</span></>}</div>
<div className="flex flex-col"><span className="text-xs font-bold uppercase tracking-wider text-gray-500">{text("Step 04")}</span>
<span className="text-sm font-bold text-gray-800">{text("發車完成")}</span></div></div></div>
{view.orderStatus === 'inspecting' ? <><div className="px-6 py-2 bg-amber-50 border-b border-amber-100 flex items-center justify-between gap-3 text-xs text-amber-700" data-rimo-layout="toolbar"><div className="flex items-center gap-2 min-w-0"><RimoElement kind="el-icon" className="text-base shrink-0"><RimoIcon name="Warning" /></RimoElement>
<span className="font-bold shrink-0">{rimoText(view.pickupInterrupted ? '取車草稿已保留' : '取車辦理中')}</span>
<span className="truncate">{text("當前驗車中，確認發車後進入用車中；操作鎖 ")}{rimoText(view.pickupLock.operator)}{text("，")}{rimoText(view.pickupLock.expiresAt)}{text(" 到期。")}</span></div>
{view.pickupInterrupted ? <><RimoElement kind="el-button" size="small" text={true} type="warning" onClick={event => {
                  view.releasePickupLock?.(event);
                }}>{text("\n                        釋放操作鎖\n                    ")}</RimoElement></> : null}</div></> : null}
<div className="flex-1 overflow-y-auto p-6">{view.pickupStep === 0 ? <><div className="animate__animated animate__fadeIn"><div className="grid grid-cols-12 gap-6 h-full min-h-[480px]" data-rimo-grid="12"><div className="col-span-5 bg-white border border-slate-200/80 rounded-xl shadow-[0_2px_8px_rgb(0,0,0,0.02)] overflow-hidden flex flex-col h-full"><div className="px-6 py-4 bg-slate-50/80 border-b border-gray-100 flex items-center justify-between shrink-0"><div className="flex items-center gap-3"><div className="w-8 h-8 rounded-lg bg-[color:var(--app-color-primary-light-9)] text-[color:var(--app-color-primary)] flex flex-col items-center justify-center shadow-sm border border-[color:var(--app-color-primary-light-8)]"><RimoElement kind="el-icon" className="text-sm"><RimoIcon name="UserFilled" /></RimoElement></div>
<div><h4 className="font-bold text-gray-900 text-sm">{text("駕駛人身份")}</h4>
<p className="text-[11px] text-gray-500 mt-0.5">{text("覈對證件與本人一致")}</p></div></div>
<RimoElement kind="el-tag" type="info" effect="plain" className="!border-gray-200 !text-gray-500 !bg-white shadow-sm">{text("駕照有效")}</RimoElement></div>
<div className="p-6 flex-1 flex flex-col"><div className="grid grid-cols-2 gap-3 mb-8 basis-auto" data-rimo-grid="2"><div className="bg-gray-50/70 p-3 rounded-lg border border-gray-200/60 shadow-sm transition-colors hover:bg-white hover:border-[color:var(--app-color-primary-light-8)]"><div className="flex items-center gap-1.5 text-[11px] text-gray-400 mb-1"><RimoElement kind="el-icon"><RimoIcon name="User" /></RimoElement>
{text(" 駕駛人\n                                            ")}</div>
<div className="font-bold text-gray-900 text-sm">{rimoText(view.pickupData.driverName)}</div></div>
<div className="bg-gray-50/70 p-3 rounded-lg border border-gray-200/60 shadow-sm transition-colors hover:bg-white hover:border-[color:var(--app-color-primary-light-8)]"><div className="flex items-center gap-1.5 text-[11px] text-gray-400 mb-1"><RimoElement kind="el-icon"><RimoIcon name="Phone" /></RimoElement>
{text(" 聯繫電話\n                                            ")}</div>
<div className="font-mono font-medium text-gray-800 text-sm">{rimoText(view.pickupData.driverPhone)}</div></div>
<div className="bg-gray-50/70 p-3 rounded-lg border border-gray-200/60 shadow-sm transition-colors hover:bg-white hover:border-[color:var(--app-color-primary-light-8)]"><div className="flex items-center gap-1.5 text-[11px] text-gray-400 mb-1"><RimoElement kind="el-icon"><RimoIcon name="Postcard" /></RimoElement>
{text(" 身份證號\n                                            ")}</div>
<div className="font-mono font-medium text-gray-800 text-sm">{rimoText(view.pickupData.driverId)}</div></div>
<div className="bg-gray-50/70 p-3 rounded-lg border border-gray-200/60 shadow-sm transition-colors hover:bg-white hover:border-[color:var(--app-color-primary-light-8)]"><div className="flex items-center gap-1.5 text-[11px] text-gray-400 mb-1"><RimoElement kind="el-icon"><RimoIcon name="Calendar" /></RimoElement>
{text(" 駕照有效期\n                                            ")}</div>
<div className="font-mono font-medium text-gray-800 text-sm">{rimoText(view.pickupData.licenseExp)}</div></div></div>
<div className="grid grid-cols-2 gap-4 mb-6 relative" data-rimo-grid="2"><div className="border border-gray-200 rounded-xl p-4 bg-white hover:border-[color:var(--app-color-primary-light-7)] hover:shadow-md transition-all group cursor-pointer relative overflow-hidden flex flex-col justify-between"><div className="absolute -right-2 -bottom-2 opacity-5 scale-150 rotate-12 transition-transform group-hover:rotate-0"><RimoElement kind="el-icon" className="text-6xl"><RimoIcon name="Postcard" /></RimoElement></div>
<div className="flex items-center justify-between mb-3 relative z-10"><div className="text-sm font-bold text-gray-800 group-hover:text-[color:var(--app-color-primary)] transition-colors">{text("身份證人像面")}</div>
<RimoElement kind="el-tag" size="small" type="info" effect="plain" className="opacity-0 group-hover:opacity-100 transition-opacity !bg-white">{text("查看")}</RimoElement></div>
<div className="h-20 rounded-lg bg-gray-50 border border-dashed border-gray-200 flex items-center justify-center text-gray-300 shadow-inner relative z-10"><RimoElement kind="el-icon" className="text-3xl"><RimoIcon name="Postcard" /></RimoElement></div></div>
<div className="border border-gray-200 rounded-xl p-4 bg-white hover:border-[color:var(--app-color-primary-light-7)] hover:shadow-md transition-all group cursor-pointer relative overflow-hidden flex flex-col justify-between"><div className="absolute -right-2 -bottom-2 opacity-5 scale-150 -rotate-12 transition-transform group-hover:rotate-0"><RimoElement kind="el-icon" className="text-6xl"><RimoIcon name="DocumentChecked" /></RimoElement></div>
<div className="flex items-center justify-between mb-3 relative z-10"><div className="text-sm font-bold text-gray-800 group-hover:text-[color:var(--app-color-primary)] transition-colors">{text("駕駛證正本")}</div>
<RimoElement kind="el-tag" size="small" type="info" effect="plain" className="opacity-0 group-hover:opacity-100 transition-opacity !bg-white">{text("查看")}</RimoElement></div>
<div className="h-20 rounded-lg bg-gray-50 border border-dashed border-gray-200 flex items-center justify-center text-gray-300 shadow-inner relative z-10"><RimoElement kind="el-icon" className="text-3xl"><RimoIcon name="DocumentChecked" /></RimoElement></div></div></div>
<div className={rimoClass(["mt-auto rounded-xl border p-4 flex items-center justify-between transition-all", rimoClass(view.pickupData.isPersonMatched ? 'bg-[color:var(--app-color-primary-light-9)] border-[color:var(--app-color-primary-light-7)] shadow-sm' : 'bg-gray-50/70 border-gray-200')])}><div><div className={rimoClass(["text-sm font-bold transition-colors", rimoClass(view.pickupData.isPersonMatched ? 'text-[color:var(--app-color-primary-hover)]' : 'text-gray-800')])}>{text("確認人證合一")}</div>
<div className={rimoClass(["text-[11px] mt-0.5 transition-colors", rimoClass(view.pickupData.isPersonMatched ? 'text-[color:var(--app-color-primary)]' : 'text-gray-500')])}>{text("本人、身份證、駕駛證資料一致")}</div></div>
<RimoElement kind="el-checkbox" modelValue={view.pickupData.isPersonMatched} onModelChange={value => {
                          model.write(["pickupData", "isPersonMatched"], value);
                        }} size="large" className="!mr-0"></RimoElement></div></div></div>
<div className="col-span-7 bg-white border border-slate-200/80 rounded-xl shadow-[0_2px_8px_rgb(0,0,0,0.02)] overflow-hidden flex flex-col h-full"><div className="px-6 py-4 bg-slate-50/80 border-b border-gray-100 flex flex-wrap items-center justify-between shrink-0"><div className="flex items-center gap-3"><div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex flex-col items-center justify-center shadow-sm border border-blue-100"><RimoElement kind="el-icon" className="text-sm"><RimoIcon name="Present" /></RimoElement></div>
<div><h4 className="font-bold text-gray-900 text-sm">{text("行銷方案資格")}</h4>
<p className="text-[11px] text-gray-500 mt-0.5">{text("現場確認當前優惠是否可繼續使用")}</p></div></div>
<div className="text-right flex items-center gap-4 bg-white px-3 py-1.5 rounded-lg border border-gray-100 shadow-sm"><div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">{text("訂單總額")}</div>
<div className="font-mono font-bold text-lg text-blue-600">{text("¥")}{rimoText(view.formatNumber(view.paymentData.orderTotal))}</div></div></div>
<div className="p-6 flex-1 flex flex-col overflow-y-auto custom-scroll"><div className="bg-gradient-to-r from-blue-50/80 to-[color:var(--app-color-primary-light-9)] border border-blue-100/80 rounded-xl p-5 grid grid-cols-[minmax(0,1fr)_1px_minmax(0,1fr)_1px_180px] gap-4 mb-8 shadow-sm"><div className="min-w-0"><div className="flex items-center gap-1.5 text-[11px] text-blue-500 font-bold uppercase tracking-wider mb-1.5"><RimoElement kind="el-icon"><RimoIcon name="Discount" /></RimoElement>
{text(" 當前方案\n                                            ")}</div>
<div className="text-sm font-bold text-gray-900 truncate">{rimoText(view.currentPickupMarketingPlan.name)}</div></div>
<div className="w-px bg-blue-200/50"></div>
<div className="min-w-0"><div className="flex items-center gap-1.5 text-[11px] text-gray-500 font-bold uppercase tracking-wider mb-1.5"><RimoElement kind="el-icon"><RimoIcon name="Warning" /></RimoElement>
{text(" 資格要求\n                                            ")}</div>
<div className="text-sm font-medium text-gray-800 line-clamp-1">{rimoText(view.currentPickupMarketingPlan.qualification)}</div></div>
<div className="w-px bg-blue-200/50"></div>
<div className="min-w-0"><div className="text-[11px] text-gray-500 font-bold uppercase tracking-wider mb-1.5">{text("\n                                                版本\n                                            ")}</div>
<div className="text-xs font-mono leading-4 text-gray-700 bg-white px-2 py-1 rounded border border-gray-100 break-all">{rimoText(view.currentPickupMarketingPlan.version)}</div></div></div>
{view.requiresPickupQualification ? <><div className="flex-1 flex flex-col"><div className="mb-8"><div className="flex items-center justify-between mb-2"><div className="text-[13px] font-bold text-gray-800 flex items-center gap-1.5">{text("\n                                                    證明文件附件 ")}
<span className="text-red-500">{text("*")}</span></div>
<div className="text-[11px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 font-bold">{text("\n                                                    已上傳 ")}{rimoText(view.uploadedQualificationCount)}{text("/3\n                                                ")}</div></div>
<div className="text-[11px] text-gray-500 mb-4">{rimoText(view.currentPickupMarketingPlan.requiredDocText)}</div>
<div className="grid grid-cols-3 gap-4" data-rimo-grid="3">{rimoEntries(view.pickupData.qualificationFiles).map(([doc], _itemIndex) => <Fragment key={doc.index}><RimoElement kind="el-upload" key={doc.index} className="block" action="#" accept="image/*,.pdf" autoUpload={false} showFileList={false} onChange={() => view.markQualificationFileUploaded(doc)}><div className={rimoClass(["group h-[110px] rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all duration-300", rimoClass(doc.uploaded ? 'border-blue-300 bg-blue-50/50 text-blue-600 hover:bg-blue-100 hover:border-blue-400' : 'border-gray-200 bg-gray-50/50 text-gray-400 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-500 hover:shadow-sm')])}><RimoElement kind="el-icon" className="text-[28px] mb-2 transition-transform group-hover:scale-110"><RimoIcon name={doc.uploaded ? 'CircleCheckFilled' : 'UploadFilled'} /></RimoElement>
<div className="text-[13px] font-bold text-gray-800 group-hover:text-blue-600 transition-colors">{text("證明文件 ")}{rimoText(doc.index)}</div>
<div className="text-[10px] mt-1 text-gray-400 group-hover:text-blue-500 transition-colors">{rimoText(doc.uploaded ? '點擊重新上傳' : '上傳照片或PDF')}</div></div></RimoElement></Fragment>)}</div></div>
<div className="h-px bg-gray-100 mb-6"></div>
<div className="mt-auto grid grid-cols-12 gap-6 items-start" data-rimo-grid="12"><div className={rimoClass(view.pickupData.promoQualificationStatus === 'failed' ? 'col-span-5' : 'col-span-12')}><div className="text-[13px] font-bold text-gray-800 mb-3 flex items-center gap-1.5">{text("\n                                                    最終覈驗結果 ")}
<span className="text-red-500">{text("*")}</span></div>
<RimoElement kind="el-radio-group" modelValue={view.pickupData.promoQualificationStatus} onModelChange={value => {
                                model.write(["pickupData", "promoQualificationStatus"], value);
                              }} className="w-full flex shadow-sm" onChange={event => {
                                view.handleQualificationStatusChange?.(event);
                              }}><RimoElement kind="el-radio-button" label="passed" className="flex-1 !flex-grow min-w-0 [&_.el-radio-button\\_\\_inner]:w-full [&_.el-radio-button\\_\\_inner]:font-bold [&_.el-radio-button\\_\\_inner]:text-[13px]">{text("通過")}</RimoElement>
<RimoElement kind="el-radio-button" label="failed" className="flex-1 !flex-grow min-w-0 [&_.el-radio-button\\_\\_inner]:w-full [&_.el-radio-button\\_\\_inner]:font-bold [&_.el-radio-button\\_\\_inner]:text-[13px]">{text("不通過")}</RimoElement></RimoElement>
{view.pickupData.promoQualificationStatus === 'passed' ? <><div className="mt-4 rounded-lg px-4 py-3 bg-green-50/60 border border-green-100 flex items-start gap-3 animate__animated animate__fadeIn"><RimoElement kind="el-icon" className="text-green-500 text-lg mt-0.5"><RimoIcon name="CircleCheck" /></RimoElement>
<div><div className="text-[13px] font-bold text-green-800">{text("資格已確認有效")}</div>
<div className="text-[11px] text-green-600 mt-0.5 opacity-90">{text("當前行銷方案繼續生效，可直接進入下一步支付流程。")}</div></div></div></> : null}</div>
{view.pickupData.promoQualificationStatus === 'failed' ? <><div className="col-span-7 bg-slate-50 p-5 rounded-xl border border-gray-200 shadow-inner relative animate__animated animate__fadeIn"><div className="absolute left-0 top-7 -ml-[9px] w-4 h-4 bg-slate-50 border-t border-l border-gray-200 rotate-[-45deg]"></div>
<div className="text-[13px] font-bold text-gray-800 mb-3 relative z-10 flex items-center gap-1.5"><RimoElement kind="el-icon" className="text-orange-500"><RimoIcon name="Warning" /></RimoElement>
{text(" 資格不符，需更換方案\n                                                ")}</div>
<div className="space-y-4 relative z-10"><RimoElement kind="el-input" modelValue={view.pickupData.promoQualificationReason} onModelChange={value => {
                                    model.write(["pickupData", "promoQualificationReason"], value);
                                  }} placeholder="請記錄不通過的原因（選填）" size="default" className="text-sm shadow-sm [&_.el-input\\_\\_wrapper]:bg-white"></RimoElement>
<RimoElement kind="el-select" modelValue={view.pickupData.replacementPromoId} onModelChange={value => {
                                    model.write(["pickupData", "replacementPromoId"], value);
                                  }} placeholder="請選擇要更換的新行銷方案" className="w-full shadow-sm" size="large" onChange={event => {
                                    view.applyPickupMarketingPlanChange?.(event);
                                  }}>{rimoEntries(view.availablePickupReplacementPlans).map(([plan], _itemIndex) => <Fragment key={plan.id}><RimoElement kind="el-option" key={plan.id} label={plan.name} value={plan.id}><div className="flex items-center justify-between gap-3 w-full"><span className="font-medium text-[13px]">{rimoText(plan.name)}</span>
<span className="text-xs text-gray-400 font-mono pl-4">{text("¥")}{rimoText(view.formatNumber(plan.orderTotal))}</span></div></RimoElement></Fragment>)}</RimoElement>
{view.selectedReplacementPickupPlan ? <><div className="mt-1 rounded-lg border border-orange-200/60 bg-orange-50/50 p-4 flex items-center justify-between animate__animated animate__fadeIn"><div><div className="text-[11px] text-orange-600 font-bold mb-1 opacity-80">{text("方案更換後的訂單總額")}</div>
<div className="text-lg font-bold font-mono text-orange-700 bg-white px-2 py-0.5 rounded shadow-sm border border-orange-100 inline-block">{text("¥")}{rimoText(view.formatNumber(view.selectedReplacementPickupPlan.orderTotal))}</div></div>
<div className="flex flex-col items-end"><div className="text-[10px] text-gray-500 mb-1">{text("差額產生")}</div>
<RimoElement kind="el-tag" size="small" type={view.qualificationPriceDelta >= 0 ? 'danger' : 'success'} effect="light" className="font-mono !border-none !font-bold">{text("\n                                                                ")}{rimoText(view.qualificationPriceDelta >= 0 ? '+' : '-')}{text(" ¥")}{rimoText(view.formatNumber(view.qualificationPriceDeltaAbs))}{text("\n                                                            ")}</RimoElement></div></div></> : null}</div></div></> : null}</div></div></> : <><div className="h-full flex items-center justify-center -mt-6"><div className="text-center bg-gray-50/50 border border-gray-100 rounded-xl p-8 max-w-sm mx-auto"><div className="w-14 h-14 bg-white rounded-full shadow-sm border border-gray-200 flex items-center justify-center text-green-500 mx-auto mb-4"><RimoElement kind="el-icon" className="text-2xl"><RimoIcon name="Check" /></RimoElement></div>
<h4 className="text-[13px] font-bold text-gray-800 mb-2">{text("本方案無需人工覈驗")}</h4>
<p className="text-[11px] text-gray-500 leading-relaxed max-w-[240px] mx-auto">{text("系統已自動適用優惠資格。取車時無需額外上傳證明材料，可直接點擊進入下一步。")}</p></div></div></>}</div></div></div></div></> : null}
{view.pickupStep === 1 ? <><div className="animate__animated animate__fadeIn"><div className="flex gap-6 h-full"><div className="w-1/2 flex flex-col"><h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2"><span className="bg-gray-100 text-gray-600 w-6 h-6 rounded-full flex items-center justify-center text-xs">{text("A")}</span>
{text("\n                                    訂單費用明細\n                                ")}</h4>
<div className="bg-gray-50 border border-gray-200 rounded-xl p-5 flex-1 flex flex-col overflow-y-auto"><div className="space-y-1.5 mb-3"><div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-2"><RimoElement kind="el-icon" className="text-gray-400"><RimoIcon name="Wallet" /></RimoElement>
{text(" 費用項目\n                                        ")}</div>
<div className="bg-white rounded-lg border border-gray-100 px-3 py-2 flex justify-between items-center hover:shadow-sm transition-shadow"><div className="flex items-center gap-2"><RimoElement kind="el-icon" className="text-gray-400 text-base"><RimoIcon name="Van" /></RimoElement>
<span className="text-sm font-medium text-gray-800">{text("車輛租金")}</span>
<span className="text-xs text-gray-400">{text("5天 × 日租金")}</span></div>
<span className="font-mono font-semibold text-gray-800 text-sm">{rimoText(view.formatNumber(view.paymentData.feeDetails.rental))}</span></div>
{rimoEntries(view.paymentData.feeDetails.serviceItems).map(([item, index], _itemIndex) => <Fragment key={'service-' + index}><div key={'service-' + index} className="bg-white rounded-lg border border-gray-100 px-3 py-2 flex justify-between items-center hover:shadow-sm transition-shadow"><div className="flex items-center gap-2"><RimoElement kind="el-icon" className="text-gray-400 text-base"><RimoIcon name={item.icon} /></RimoElement>
<span className="text-sm font-medium text-gray-800">{rimoText(item.name)}</span>
<span className="text-xs text-gray-400">{text("增值服務")}</span></div>
<span className="font-mono font-semibold text-gray-800 text-sm">{text("¥ ")}{rimoText(view.formatNumber(item.amount))}</span></div></Fragment>)}</div>
<div className="border-t border-dashed border-gray-200 pt-3 space-y-1.5 mb-3"><div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-2"><RimoElement kind="el-icon" className="text-gray-400"><RimoIcon name="Discount" /></RimoElement>
{text(" 優惠減免 (")}{rimoText(view.paymentData.feeDetails.discountItems.length)}{text("項)\n                                        ")}</div>
{rimoEntries(view.paymentData.feeDetails.discountItems).map(([discount, index], _itemIndex) => <Fragment key={'discount-' + index}><div key={'discount-' + index} className="bg-white rounded-lg border border-gray-100 px-3 py-2 flex justify-between items-center"><div className="flex items-center gap-2"><RimoElement kind="el-icon" className="text-gray-400 text-base">{discount.type === 'promo' ? <><RimoIcon name="Discount" /></> : discount.type === 'coupon' ? <><RimoIcon name="Ticket" /></> : <><RimoIcon name="Star" /></>}</RimoElement>
<span className="text-sm text-gray-700 font-medium">{rimoText(discount.name)}</span>
{discount.code ? <><span className="text-xs text-gray-400">{rimoText(discount.code)}</span></> : null}</div>
<span className="font-mono font-semibold text-gray-700 text-sm">{text("-¥ ")}{rimoText(view.formatNumber(discount.amount))}</span></div></Fragment>)}
{view.paymentData.feeDetails.discountItems.length === 0 ? <><div className="text-center text-xs text-gray-400 py-1.5">{text("\n                                            暫無優惠減免\n                                        ")}</div></> : null}</div>
<div className="mt-auto bg-white border border-blue-100 rounded-xl p-4"><div className="flex justify-between items-center"><div><div className="text-xs text-gray-500 uppercase tracking-wider">{text("訂單應付總額\n                                                ")}</div>
<div className="text-2xl font-bold font-mono mt-1 text-blue-600">{text("¥ ")}{rimoText(view.formatNumber(view.paymentData.orderTotal))}</div></div>
<div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center"><RimoElement kind="el-icon" className="text-2xl"><RimoIcon name="Money" /></RimoElement></div></div></div></div></div>
<div className="w-1/2 flex flex-col"><h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2"><span className="bg-gray-100 text-gray-600 w-6 h-6 rounded-full flex items-center justify-center text-xs">{text("B")}</span>
{text("\n                                    ")}{rimoText(view.isMonthlyBilling ? '企業月結' : '支付與預授權')}{text("\n                                ")}</h4>
<div className="bg-white border border-gray-200 rounded-xl p-4 flex-1 flex flex-col overflow-y-auto">{!view.isMonthlyBilling ? <><div className="bg-gray-50 rounded-xl border border-gray-200 p-4 mb-4"><div className="flex justify-between items-start mb-3"><div className="flex items-center gap-2"><div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center border border-gray-100"><RimoElement kind="el-icon" className="text-blue-500 text-lg"><RimoIcon name="CreditCard" /></RimoElement></div>
<div><div className="text-sm font-bold text-gray-800">{text("預授權押金")}</div>
<div className="text-xs text-gray-400">{text("本期按規則配置凍結")}</div></div></div>
<RimoElement kind="el-tag" type="info" size="small" effect="plain">{rimoText(view.preAuthStatusText)}{text("\n                                                ¥")}{rimoText(view.formatNumber(view.paymentData.preAuthAmount))}</RimoElement></div>
<div className="mb-3"><div className="text-xs text-gray-500 mb-2 font-medium">{text("處理方式")}</div>
<div className="grid grid-cols-2 gap-2" data-rimo-grid="2" data-rimo-layout="summary"><div className={rimoClass(["p-3 rounded-lg border-2 bg-white shadow-sm text-center cursor-pointer transition-all", rimoClass(view.paymentData.preAuthMode === 'guarantee' ? 'border-blue-500 ring-2 ring-blue-50' : 'border-gray-200 hover:border-blue-200')])} onClick={_event => {
                                view.selectPreAuthMode('guarantee');
                              }} data-rimo-layout="stat"><div className={rimoClass(["text-sm font-medium", rimoClass(view.paymentData.preAuthMode === 'guarantee' ? 'text-blue-600' : 'text-gray-700')])}>{text("\n                                                        履約擔保")}</div>
<div className="text-xs text-gray-400 mt-0.5">{text("僅凍結，發車後釋放")}</div></div>
<div className={rimoClass(["p-3 rounded-lg border-2 bg-white shadow-sm text-center cursor-pointer transition-all", rimoClass(view.paymentData.preAuthMode === 'rent_offset' ? 'border-blue-500 ring-2 ring-blue-50' : 'border-gray-200 hover:border-blue-200')])} onClick={_event => {
                                view.selectPreAuthMode('rent_offset');
                              }} data-rimo-layout="stat"><div className={rimoClass(["text-sm font-medium", rimoClass(view.paymentData.preAuthMode === 'rent_offset' ? 'text-blue-600' : 'text-gray-700')])}>{text("\n                                                        轉租金")}</div>
<div className="text-xs text-gray-400 mt-0.5">{text("扣款抵扣本單租金")}</div></div></div></div>
{view.paymentData.preAuthMode === 'guarantee' ? <><div className="text-xs text-gray-500 bg-white/70 p-2.5 rounded-lg border border-gray-100"><RimoElement kind="el-icon" className="text-gray-400 mr-1"><RimoIcon name="InfoFilled" /></RimoElement>
{text("\n                                            預授權用於履約擔保，取車時不抵扣租金；尾款結清並確認發車後釋放。\n                                        ")}</div></> : <><div className="text-xs text-gray-500 bg-white/70 p-2.5 rounded-lg border border-gray-100"><RimoElement kind="el-icon" className="text-gray-400 mr-1"><RimoIcon name="InfoFilled" /></RimoElement>
{text("\n                                            預授權扣款轉爲租金實收，本步驟按扣款金額抵扣應收尾款。\n                                        ")}</div></>}</div></> : <><div className="bg-gray-50 rounded-xl border border-gray-200 p-4 mb-4"><div className="flex justify-between items-start mb-3"><div className="flex items-center gap-2"><div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center border border-gray-100"><RimoElement kind="el-icon" className="text-blue-500 text-lg"><RimoIcon name="OfficeBuilding" /></RimoElement></div>
<div><div className="text-sm font-bold text-gray-800">{text("企業月結")}</div>
<div className="text-xs text-gray-400">{rimoText(view.paymentData.monthlyCompany)}</div></div></div>
<RimoElement kind="el-tag" type="info" effect="plain" size="small">{text("\n                                                月結訂單\n                                            ")}</RimoElement></div>
<div className="text-xs text-gray-600 bg-white/70 p-2.5 rounded-lg border border-gray-100">{text("\n                                            本單不發起支付和預授權，取車不向客戶收尾款，最終應收在還車結算後進入企業月結賬單。\n                                        ")}</div></div></>}
<div className={rimoClass(["rounded-xl p-4 mb-4 transition-all", rimoClass(view.balanceDue > 0 ? 'bg-blue-50 border border-blue-100' : 'bg-gray-50 border border-gray-200')])}><div className="flex justify-between items-center"><div><div className={rimoClass(["text-xs uppercase tracking-wider", rimoClass(view.balanceDue > 0 ? 'text-blue-600' : 'text-gray-500')])}>{text("\n                                                    ")}{rimoText(view.isMonthlyBilling ? '月結記賬金額' : '應收尾款')}{text("\n                                                ")}</div>
<div className={rimoClass(["text-2xl font-bold font-mono mt-1", rimoClass(view.balanceDue > 0 ? 'text-blue-600' : 'text-gray-700')])}>{text("\n                                                    ¥ ")}{rimoText(view.formatNumber(view.isMonthlyBilling ? view.paymentData.monthlyBillAmount : view.balanceDue))}{text("\n                                                ")}</div></div>
<div className={rimoClass(["w-10 h-10 rounded-full flex items-center justify-center", rimoClass(view.balanceDue > 0 ? 'bg-white text-blue-500' : 'bg-white text-gray-400')])}><RimoElement kind="el-icon" className={rimoClass(["text-lg", rimoClass(view.balanceDue > 0 ? 'text-blue-500' : 'text-gray-400')])}><RimoIcon name={view.balanceDue > 0 ? 'Warning' : 'CircleCheck'} /></RimoElement></div></div>
<div className={rimoClass(["text-xs mt-2", rimoClass(view.balanceDue > 0 ? 'text-blue-600' : 'text-gray-500')])}>{text("\n                                            ")}{rimoText(view.isMonthlyBilling ? '本次不向客戶收取尾款，最終費用在還車結算後進入企業賬單' : view.balanceDue > 0 ? '需結清尾款後才能進入下一步' : '尾款已結清，可進入下一步')}{text("\n                                        ")}</div></div>
{view.paymentData.receivedPayments.length > 0 ? <><div className="mb-4"><div className="text-xs font-bold text-gray-500 mb-2 flex items-center gap-1"><RimoElement kind="el-icon"><RimoIcon name="List" /></RimoElement>
{text(" ")}{rimoText(view.isMonthlyBilling ? '預計月結' : '已收款記錄')}{text("\n                                        ")}</div>
<div className="space-y-2 max-h-24 overflow-y-auto">{rimoEntries(view.paymentData.receivedPayments).map(([p, idx], _itemIndex) => <Fragment key={idx}><div key={idx} className="bg-gray-50 rounded-lg border border-gray-100 px-3 py-2.5 flex justify-between items-center text-sm"><div className="flex items-center gap-2"><RimoElement kind="el-icon" className={rimoClass(p.type === 'pre_auth' ? 'text-blue-500' : 'text-gray-400')}><RimoIcon name={p.type === 'pre_auth' ? 'Lock' : p.type === 'monthly_bill' ? 'OfficeBuilding' : 'CircleCheck'} /></RimoElement>
<span className="font-medium text-gray-800">{text("¥ ")}{rimoText(view.formatNumber(p.amount))}</span>
<RimoElement kind="el-tag" size="small" type="info" effect="plain">{rimoText(p.channel)}</RimoElement></div>
<span className="text-xs text-gray-400 font-mono">{rimoText(p.refNo || '-')}</span></div></Fragment>)}</div></div></> : null}
{!view.isMonthlyBilling ? <><div className="pt-3 border-t border-gray-100"><RimoElement kind="el-button" type="primary" size="large" className="w-full" onClick={event => {
                            view.openPaymentDialog?.(event);
                          }} disabled={view.balanceDue <= 0}><RimoElement kind="el-icon" className="mr-2"><RimoIcon name="Plus" /></RimoElement>
{text("\n                                            補收尾款\n                                        ")}</RimoElement></div></> : null}</div></div></div></div></> : null}
{view.pickupStep === 2 ? <><div className="animate__animated animate__fadeIn"><div className="flex flex-col"><div className="mb-5 order-2"><h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2"><span className="bg-[color:var(--app-color-primary-light-8)] text-[color:var(--app-color-primary)] w-6 h-6 rounded-full flex items-center justify-center text-xs">{text("B")}</span>
{text("\n                                    租賃合約簽署\n                                ")}</h4>
<div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm"><div className="flex gap-6 items-stretch"><div className="flex-1 flex flex-col"><div className={rimoClass(["flex-1 bg-gradient-to-br from-gray-50 to-slate-100 rounded-xl border-2 border-dashed flex items-center justify-center text-sm relative min-h-[100px] transition-all", rimoClass(view.pickupData.signed ? 'border-green-300 bg-gradient-to-br from-green-50 to-emerald-50' : 'border-gray-300 text-gray-400')])}>{!view.pickupData.signed && view.signatureStatus === 'idle' ? <><div className="text-center"><RimoElement kind="el-icon" className="text-3xl text-gray-300 mb-2"><RimoIcon name="EditPen" /></RimoElement>
<div className="text-gray-400">{text("等待客戶簽名")}</div></div></> : !view.pickupData.signed && view.signatureStatus === 'pushed' ? <><div className="text-center"><RimoElement kind="el-icon" className="text-3xl text-blue-400 mb-2 animate-pulse"><RimoIcon name="Iphone" /></RimoElement>
<div className="text-blue-500 font-medium">{text("已推送至客戶APP")}</div>
<div className="text-xs text-gray-400 mt-1">{text("等待客戶完成簽名...")}</div></div></> : !view.pickupData.signed && view.signatureStatus === 'fetching' ? <><div className="text-center"><RimoElement kind="el-icon" className="text-3xl text-[color:var(--app-color-primary)] mb-2 animate-spin"><RimoIcon name="Loading" /></RimoElement>
<div className="text-[color:var(--app-color-primary)]">{text("正在獲取簽名...")}</div></div></> : <><div className="text-center"><span className="text-[color:var(--app-color-primary)] font-script text-4xl rotate-[-5deg] block">{rimoText(view.pickupData.driverName)}</span>
<div className="text-xs text-green-600 mt-2 flex items-center justify-center gap-1"><RimoElement kind="el-icon"><RimoIcon name="CircleCheckFilled" /></RimoElement>
{text("\n                                                        ")}{rimoText(view.signatureSource === 'app' ? 'APP遠程簽名' : '現場簽名')}{text(" · ")}{rimoText(view.signatureTime)}{text("\n                                                    ")}</div></div></>}
{view.pickupData.signed ? <><div className="absolute top-2 right-2"><RimoElement kind="el-tag" type={view.signatureSource === 'app' ? 'primary' : 'success'} size="small" effect="dark">{text("\n                                                        ")}{rimoText(view.signatureSource === 'app' ? 'APP簽名' : '現場簽名')}{text("\n                                                    ")}</RimoElement></div></> : null}</div>
{!view.pickupData.signed ? <><div className="flex gap-2 mt-3"><RimoElement kind="el-button" type="primary" className="flex-1" onClick={event => {
                                view.pushSignatureToApp?.(event);
                              }} loading={view.signatureStatus === 'pushing'} disabled={view.signatureStatus === 'pushed' || view.signatureStatus === 'fetching'}><RimoElement kind="el-icon" className="mr-1"><RimoIcon name="Promotion" /></RimoElement>
{text("\n                                                    ")}{rimoText(view.signatureStatus === 'pushing' ? '推送中...' : '推送至APP簽名')}{text("\n                                                ")}</RimoElement>
<RimoElement kind="el-button" type="success" onClick={event => {
                                view.fetchAppSignature?.(event);
                              }} loading={view.signatureStatus === 'fetching'} disabled={view.signatureStatus !== 'pushed'}><RimoElement kind="el-icon" className="mr-1"><RimoIcon name="Refresh" /></RimoElement>
{text("\n                                                    刷新獲取\n                                                ")}</RimoElement>
<RimoElement kind="el-button" type="info" plain={true} onClick={event => {
                                view.signOnSite?.(event);
                              }} disabled={view.signatureStatus === 'fetching'}><RimoElement kind="el-icon" className="mr-1"><RimoIcon name="Edit" /></RimoElement>
{text("\n                                                    現場簽名\n                                                ")}</RimoElement></div></> : <><div className="mt-3 text-center"><RimoElement kind="el-button" type="danger" link={true} size="small" onClick={event => {
                                view.resetSignature?.(event);
                              }}><RimoElement kind="el-icon" className="mr-1"><RimoIcon name="RefreshLeft" /></RimoElement>
{text("\n                                                    重新簽名\n                                                ")}</RimoElement></div></>}</div>
<div className="w-72 flex flex-col gap-3"><div className={rimoClass(["flex items-start gap-2 p-2 rounded-lg transition-colors", rimoClass(view.pickupData.signed ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-500')])}><RimoElement kind="el-icon" className="mt-0.5 text-lg">{view.pickupData.signed ? <><RimoIcon name="CircleCheckFilled" /></> : <><RimoIcon name="InfoFilled" /></>}</RimoElement>
<div className="flex-1"><div className="text-sm font-medium leading-tight">{text("\n                                                        ")}{rimoText(view.pickupData.signed ? '客戶已同意' : '等待客戶確認')}{text("\n                                                        ")}
<span className="underline cursor-pointer hover:text-[color:var(--app-color-primary)]">{text("《租車服務條款》")}</span></div>
{view.pickupData.signed ? <><div className="text-xs text-green-500 mt-1">{text("\n                                                        ")}{rimoText(view.signatureTime)}{text(" 確認\n                                                    ")}</div></> : null}</div></div>
{view.signatureStatus === 'pushed' ? <><div className="p-3 bg-blue-50 rounded-lg border border-blue-200"><div className="text-xs text-blue-700 font-medium mb-1 flex items-center gap-1"><RimoElement kind="el-icon" className="animate-pulse"><RimoIcon name="Bell" /></RimoElement>
{text("\n                                                    已推送簽名請求\n                                                ")}</div>
<div className="text-xs text-blue-600">{text("\n                                                    客戶APP將收到簽名通知，簽名完成後點擊\"刷新獲取\"按鈕。\n                                                ")}</div></div></> : null}
<div className="p-3 bg-gray-50 rounded-lg border border-gray-200"><div className="text-xs text-gray-500 mb-2 flex items-center gap-1"><RimoElement kind="el-icon"><RimoIcon name="Upload" /></RimoElement>
{text(" 上傳線下紙質合約 (可選)\n                                                ")}</div>
<RimoElement kind="el-upload" className="w-full" action="#" autoUpload={false} accept=".jpg,.jpeg,.png,.pdf" limit={3} showFileList={false}><RimoElement kind="el-button" size="small" type="primary" plain={true} className="w-full"><RimoElement kind="el-icon" className="mr-1"><RimoIcon name="UploadFilled" /></RimoElement>
{text(" 選擇文件\n                                                    ")}</RimoElement></RimoElement></div></div></div></div></div>
<div className="order-1 mb-5"><h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2"><span className="bg-[color:var(--app-color-primary-light-8)] text-[color:var(--app-color-primary)] w-6 h-6 rounded-full flex items-center justify-center text-xs">{text("A")}</span>
{text("\n                                    車輛查驗\n                                ")}</h4>
<div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden"><div className="bg-gradient-to-r from-slate-50 to-gray-50 border-b border-gray-100 p-4"><div className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3"><RimoElement kind="el-icon" className="text-[color:var(--app-color-primary)]"><RimoIcon name="InfoFilled" /></RimoElement>
{text("\n                                            基礎交接信息\n                                        ")}</div>
<div className="grid grid-cols-3 gap-5" data-rimo-grid="3"><div><div className="text-xs text-gray-500 mb-1.5 font-medium">{text("車輛所在據點")}</div>
<div className="h-10 flex items-center px-3 rounded border border-gray-200 bg-gray-50 text-sm font-medium text-gray-700">{text("\n                                                    ")}{rimoText(view.pickupVehicleStationText)}{text("\n                                                ")}</div></div>
<div><div className="text-xs text-gray-500 mb-1.5 font-medium">{text("交付位置")}</div>
<RimoElement kind="el-input" modelValue={view.pickupData.deliveryLocation} onModelChange={value => {
                              model.write(["pickupData", "deliveryLocation"], value);
                            }} placeholder="門市交付區 A1" size="large"></RimoElement></div>
<div><div className="text-xs text-gray-500 mb-1.5 font-medium">{text("實際取車時間")}</div>
<RimoElement kind="el-date-picker" modelValue={view.pickupData.pickupTime} onModelChange={value => {
                              model.write(["pickupData", "pickupTime"], value);
                            }} type="datetime" placeholder="選擇時間" className="w-full" size="large"></RimoElement></div>
<div><div className="text-xs text-gray-500 mb-1.5 font-medium flex items-center gap-2"><span>{text("當前里程 (km)")}</span>
{view.isSelfServiceOrder && view.hasPickupTelematics ? <><RimoElement kind="el-tag" size="small" type="info" effect="plain">{text("默認車機值")}</RimoElement></> : null}</div>
<RimoElement kind="el-input-number" modelValue={view.pickupData.mileage} onModelChange={value => {
                              model.write(["pickupData", "mileage"], value);
                            }} controls={false} className="w-full" placeholder="輸入里程" size="large"></RimoElement></div>
<div><div className="text-xs text-gray-500 mb-1.5 font-medium flex items-center gap-2"><span>{text("燃油油量 (")}{rimoText(view.pickupData.fuel)}{text("/8格)")}</span>
{view.isSelfServiceOrder && view.hasPickupTelematics ? <><RimoElement kind="el-tag" size="small" type="info" effect="plain">{text("默認車機值")}</RimoElement></> : null}</div>
<div className="flex items-center gap-1 bg-white rounded rounded-[4px] border border-gray-200 px-2 h-10 w-full box-border"><div className="flex-1 flex gap-1 h-full items-center justify-center">{rimoEntries(8).map(([i], _itemIndex) => <Fragment key={'fuel' + i}><div key={'fuel' + i} className={rimoClass(["flex-1 h-6 rounded-sm cursor-pointer transition-all border", rimoClass(i <= view.pickupData.fuel ? 'bg-gradient-to-t from-green-500 to-green-400 border-green-600 shadow-sm' : 'bg-gray-100 border-gray-200 hover:bg-gray-200')])} onClick={_event => {
                                    model.write(["pickupData", "fuel"], i);
                                  }}></div></Fragment>)}</div>
<RimoElement kind="el-icon" className="text-gray-400 ml-2 cursor-pointer hover:text-red-500" onClick={_event => {
                                model.write(["pickupData", "fuel"], 0);
                              }} title="清空"><RimoIcon name="Close" /></RimoElement></div></div>
<div><div className="text-xs text-gray-500 mb-1.5 font-medium">{text("交車備註")}</div>
<RimoElement kind="el-input" modelValue={view.pickupData.remarks} onModelChange={value => {
                              model.write(["pickupData", "remarks"], value);
                            }} placeholder="如有異常請備註..." size="large"></RimoElement></div></div></div>
<div className="p-4"><div className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-4"><RimoElement kind="el-icon" className="text-[color:var(--app-color-primary)]"><RimoIcon name="CameraFilled" /></RimoElement>
{text("\n                                            驗車影像記錄\n                                        ")}</div>
<div className="flex gap-4 mb-5"><div className="flex-[2] min-w-0"><div className="text-xs font-bold text-gray-500 mb-2 flex items-center gap-2"><span className="w-5 h-5 bg-blue-100 text-blue-600 rounded flex items-center justify-center text-xs">{text("外")}</span>
{text("\n                                                    外觀照片 (6張)\n                                                ")}</div>
<div className="grid grid-cols-6 gap-2" data-rimo-grid="6">{rimoEntries(['前方', '後方', '左側', '右側', '左前角', '右前角']).map(([label, i], _itemIndex) => <Fragment key={'ext' + i}><div key={'ext' + i} className="aspect-square bg-gradient-to-br from-gray-50 to-slate-100 rounded-lg border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400 cursor-pointer hover:border-[color:var(--app-color-primary-light-5)] hover:text-[color:var(--app-color-primary)] hover:bg-[color:var(--app-color-primary-light-9)] transition-all group"><RimoElement kind="el-icon" className="text-xl mb-1 group-hover:scale-110 transition-transform"><RimoIcon name="Plus" /></RimoElement>
<span className="text-[10px] font-medium">{rimoText(label)}</span></div></Fragment>)}</div></div>
<div className="flex-1 min-w-0"><div className="text-xs font-bold text-gray-500 mb-2 flex items-center gap-2"><span className="w-5 h-5 bg-green-100 text-green-600 rounded flex items-center justify-center text-xs">{text("內")}</span>
{text("\n                                                    內飾照片 (3張)\n                                                ")}</div>
<div className="grid grid-cols-3 gap-2" data-rimo-grid="3">{rimoEntries(['儀表', '座椅', '後排']).map(([label, i], _itemIndex) => <Fragment key={'int' + i}><div key={'int' + i} className="aspect-square bg-gradient-to-br from-gray-50 to-slate-100 rounded-lg border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400 cursor-pointer hover:border-green-400 hover:text-green-500 hover:bg-green-50 transition-all group"><RimoElement kind="el-icon" className="text-xl mb-1 group-hover:scale-110 transition-transform"><RimoIcon name="Plus" /></RimoElement>
<span className="text-[10px] font-medium">{rimoText(label)}</span></div></Fragment>)}</div></div></div>
<div className="border-t border-gray-100 pt-4"><div className="flex items-center justify-between mb-3" data-rimo-layout="toolbar"><div className="text-xs font-bold text-gray-500 flex items-center gap-2"><span className="w-5 h-5 bg-orange-100 text-orange-600 rounded flex items-center justify-center text-xs">{text("損")}</span>
{text("\n                                                    異常/損傷記錄 (")}{rimoText(view.damagePhotos.length)}{text(")\n                                                ")}</div>
<RimoElement kind="el-button" type="warning" size="small" onClick={_event => {
                              model.write(["showDamageTypeDialog"], true);
                            }}><RimoElement kind="el-icon" className="mr-1"><RimoIcon name="CirclePlus" /></RimoElement>
{text("添加異常\n                                                ")}</RimoElement></div>
{view.damagePhotos.length === 0 ? <><div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200 flex items-center gap-4"><RimoElement kind="el-icon" className="text-3xl text-green-500"><RimoIcon name="CircleCheck" /></RimoElement>
<div><div className="font-medium text-green-700">{text("車況良好")}</div>
<div className="text-xs text-green-500">{text("交接檢查未發現異常或損傷")}</div></div></div></> : <><div className="grid grid-cols-2 gap-4" data-rimo-grid="2">{rimoEntries(view.damagePhotos).map(([damage], _itemIndex) => <Fragment key={damage.id}><div key={damage.id} className="bg-orange-50 rounded-xl p-4 border border-orange-200"><div className="flex justify-between items-start mb-3"><div className="flex items-center gap-2"><RimoElement kind="el-tag" type={damage.category === 'exterior' ? 'warning' : 'info'} size="small">{text("\n                                                                ")}{rimoText(damage.category === 'exterior' ? '外觀損傷' : damage.category === 'interior' ? '內飾異常' : '其他異常')}{text("\n                                                            ")}</RimoElement>
<span className="text-sm text-orange-700 font-medium">{rimoText(damage.type)}</span></div>
<RimoElement kind="el-icon" className="text-gray-400 cursor-pointer hover:text-red-500" onClick={_event => {
                                      view.removeDamagePhoto(damage.id);
                                    }}><RimoIcon name="Close" /></RimoElement></div>
<div className="flex gap-2 mb-3">{rimoEntries(3).map(([n], _itemIndex) => <Fragment key={'photo' + n}><div key={'photo' + n} className="w-16 h-16 bg-white rounded-lg border-2 border-dashed border-orange-200 flex items-center justify-center cursor-pointer hover:border-orange-400 transition-colors"><RimoElement kind="el-icon" className="text-orange-300 text-xl"><RimoIcon name="Plus" /></RimoElement></div></Fragment>)}</div>
<RimoElement kind="el-input" modelValue={damage.description} onModelChange={value => {
                                    model.assign(damage, "description", value);
                                  }} type="textarea" rows={2} placeholder="描述損傷情況..." size="small"></RimoElement></div></Fragment>)}</div></>}</div></div></div></div></div></div></> : null}
{view.pickupStep === 3 ? <><div className="animate__animated animate__fadeIn h-full flex flex-col items-center justify-center text-center"><div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6"><RimoElement kind="el-icon" className="text-5xl text-green-500"><RimoIcon name="CircleCheckFilled" /></RimoElement></div>
<h2 className="text-3xl font-bold text-gray-800 mb-2">{text("發車成功")}</h2>
<p className="text-gray-500 mb-8">{text("車輛已成功交付，訂單狀態已更新爲“用車中”。")}</p>
<div className="bg-gray-50 rounded-xl p-6 w-80 border border-gray-100 mb-8"><div className="space-y-4"><div className="flex justify-between items-center text-sm"><span className="text-gray-500">{text("發車時間")}</span>
<span className="font-mono font-bold text-gray-800">{rimoText(new Date().toLocaleString())}</span></div>
<div className="flex justify-between items-center text-sm"><span className="text-gray-500">{text("車輛信息")}</span>
<span className="font-bold text-gray-800">{text("Toyota Camry (ABC-1234)")}</span></div>
<div className="flex justify-between items-center text-sm"><span className="text-gray-500">{text("車輛所在據點")}</span>
<span className="font-bold text-gray-800">{rimoText(view.pickupVehicleStationText)}</span></div>
<div className="flex justify-between items-center text-sm"><span className="text-gray-500">{text("交付位置")}</span>
<span className="font-bold text-gray-800">{rimoText(view.pickupData.deliveryLocation || '-')}</span></div>
<div className="flex justify-between items-center text-sm"><span className="text-gray-500">{text("經辦人員")}</span>
<span className="font-medium bg-gray-200 text-gray-600 px-2 py-0.5 rounded text-xs">{text("Admin")}</span></div></div></div>
<div className="flex gap-4"><RimoElement kind="el-button" size="large" onClick={_event => {
                    model.write(["pickupModalVisible"], false);
                  }}>{text("返回訂單詳情")}</RimoElement>
<RimoElement kind="el-button" type="primary" size="large" onClick={_event => {
                    model.write(["pickupModalVisible"], false);
                  }}><RimoElement kind="el-icon" className="mr-2"><RimoIcon name="Printer" /></RimoElement>
{text("\n                                打印交車單\n                            ")}</RimoElement></div></div></> : null}</div></div></>}</RimoElement>
<RimoElement kind="el-dialog" modelValue={view.returnModalVisible} onModelChange={value => {
      model.write(["returnModalVisible"], value);
    }} title="車輛還車結算" width="1000px" destroyOnClose={true} top="5vh" className="rounded-xl overflow-hidden custom-modal order-detail-overlay" beforeClose={view.handleReturnDialogClose} slots={{
      "footer": _slot => <><div className="flex justify-between items-center" data-rimo-layout="toolbar"><RimoElement kind="el-button" onClick={event => {
            view.requestCloseReturnModal?.(event);
          }} disabled={view.returnStep === 2}>{text("暫停辦理")}</RimoElement>
<div>{view.returnStep > 0 && view.returnStep < 2 ? <><RimoElement kind="el-button" onClick={_event => {
                model.increment(["returnStep"], -1, false);
              }}>{text("上一步")}</RimoElement></> : null}
<RimoElement kind="el-button" type="primary" onClick={event => {
              view.nextReturnStep?.(event);
            }} loading={view.processing}>{text("\n                            ")}{rimoText(view.returnStep === 2 ? '關閉' : view.returnStep === 1 ? view.isMonthlyBilling ? '確認月結並還車' : '確認還車' : '下一步')}{text("\n                        ")}</RimoElement></div></div></>
    }}>{() => <><div className="h-[85vh] flex flex-col"><div className="px-10 py-6 bg-white border-b border-gray-100 flex items-center justify-between shrink-0"><div className={rimoClass(["flex items-center gap-3 relative z-10", rimoClass({
              'opacity-100': view.returnStep >= 0,
              'opacity-50': view.returnStep < 0
            })])}><div className={rimoClass(["w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ring-4", rimoClass(view.returnStep >= 0 ? 'bg-[color:var(--app-color-primary)] text-white ring-[color:var(--app-color-primary-light-9)]' : 'bg-gray-100 text-gray-400 ring-transparent')])}>{text("\n                            1")}</div>
<div className="flex flex-col"><span className="text-xs font-bold uppercase tracking-wider text-gray-500">{text("Step 01")}</span>
<span className="text-sm font-bold text-gray-800">{text("驗車錄入")}</span></div></div>
<div className="flex-1 h-0.5 bg-gray-100 mx-6 rounded-full overflow-hidden"><div className="h-full bg-[color:var(--app-color-primary)] transition-all duration-500" style={rimoStyle({
                width: view.returnStep >= 1 ? '100%' : '0%'
              })}></div></div>
<div className={rimoClass(["flex items-center gap-3 relative z-10", rimoClass({
              'opacity-100': view.returnStep >= 1,
              'opacity-50': view.returnStep < 1
            })])}><div className={rimoClass(["w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ring-4", rimoClass(view.returnStep >= 1 ? 'bg-[color:var(--app-color-primary)] text-white ring-[color:var(--app-color-primary-light-9)]' : 'bg-gray-100 text-gray-400 ring-transparent')])}>{text("\n                            2")}</div>
<div className="flex flex-col"><span className="text-xs font-bold uppercase tracking-wider text-gray-500">{text("Step 02")}</span>
<span className="text-sm font-bold text-gray-800">{text("費用結算")}</span></div></div>
<div className="flex-1 h-0.5 bg-gray-100 mx-6 rounded-full overflow-hidden"><div className="h-full bg-[color:var(--app-color-primary)] transition-all duration-500" style={rimoStyle({
                width: view.returnStep >= 2 ? '100%' : '0%'
              })}></div></div>
<div className={rimoClass(["flex items-center gap-3 relative z-10", rimoClass({
              'opacity-100': view.returnStep >= 2,
              'opacity-50': view.returnStep < 2
            })])}><div className={rimoClass(["w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ring-4", rimoClass(view.returnStep >= 2 ? 'bg-[color:var(--app-color-primary)] text-white ring-[color:var(--app-color-primary-light-9)]' : 'bg-gray-100 text-gray-400 ring-transparent')])}>{text("\n                            3")}</div>
<div className="flex flex-col"><span className="text-xs font-bold uppercase tracking-wider text-gray-500">{text("Step 03")}</span>
<span className="text-sm font-bold text-gray-800">{text("還車完成")}</span></div></div></div>
{view.returnStep < 2 ? <><div className="px-6 py-2 bg-gray-50 border-b border-gray-100 flex items-center justify-between gap-3 text-xs text-gray-600"><div className="flex items-center gap-2 min-w-0"><RimoElement kind="el-icon" className="text-base shrink-0"><RimoIcon name="InfoFilled" /></RimoElement>
<span className="font-bold shrink-0">{rimoText(view.returnStep === 0 ? '還車辦理中' : '費用結算中')}</span>
<span className="truncate">{text("\n                            ")}{rimoText(view.returnStep === 0 ? '錄入驗車、歸還據點和客戶簽字後進入費用結算。' : view.isMonthlyBilling ? '確認企業月結金額後完成還車。' : '完成補繳或退款確認後完成還車。')}{text("\n                        ")}</span></div></div></> : null}
<div className="flex-1 overflow-y-auto p-6">{view.returnStep === 0 ? <><div className="animate-fade-in-up space-y-5"><div className="grid grid-cols-2 gap-5" data-rimo-grid="2" data-rimo-layout="form-grid"><div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm"><h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2 text-sm"><span className="w-7 h-7 bg-[color:var(--app-color-primary-light-8)] rounded-lg flex items-center justify-center"><RimoElement kind="el-icon" className="text-[color:var(--app-color-primary)]"><RimoIcon name="Timer" /></RimoElement></span>
{text("\n                                    還車時間與地點\n                                ")}</h3>
<div className="space-y-4"><div><div className="text-xs font-medium text-gray-500 mb-1.5">{text("實際還車時間")}</div>
<RimoElement kind="el-date-picker" modelValue={view.returnData.returnTime} onModelChange={value => {
                          model.write(["returnData", "returnTime"], value);
                        }} type="datetime" placeholder="選擇時間" className="w-full" size="default"></RimoElement></div>
<div className="grid grid-cols-2 gap-3" data-rimo-grid="2"><div><div className="text-xs font-medium text-gray-500 mb-1.5">{text("還車門市")}</div>
<div className="min-h-[32px] flex items-center justify-between gap-2 rounded border border-gray-200 bg-gray-50 px-3 py-1.5 text-sm" data-rimo-layout="toolbar"><span className="font-medium text-gray-700">{rimoText(view.currentReturnStoreName)}</span>
<div className="flex items-center gap-2">{view.canChangeReturnStore && !view.isSelfServiceOrder ? <><RimoElement kind="el-button" type="primary" link={true} size="small" onClick={event => {
                                  view.openReturnStoreChangeDialog?.(event);
                                }}>{text("轉單")}</RimoElement></> : null}
{view.canChangeReturnStation && view.isSelfServiceOrder ? <><RimoElement kind="el-button" type="primary" link={true} size="small" onClick={event => {
                                  view.openReturnStationChangeDialog?.(event);
                                }}>{text("改據點")}</RimoElement></> : null}</div></div>
<div className="text-[11px] text-gray-400 mt-1">{text("還車門市由訂單當前還車門市帶出，不能在還車窗口直接修改。")}</div></div>
<div><div className="text-xs font-medium text-gray-500 mb-1.5">{text("歸還據點")}</div>
<RimoElement kind="el-select" modelValue={view.returnData.parking.station} onModelChange={value => {
                            model.write(["returnData", "parking", "station"], value);
                          }} className="w-full" size="default">{rimoEntries(view.returnStations).map(([station], _itemIndex) => <Fragment key={station.id}><RimoElement kind="el-option" key={station.id} label={station.name} value={station.id}></RimoElement></Fragment>)}</RimoElement></div></div>
<div className="grid grid-cols-2 gap-3" data-rimo-grid="2" data-rimo-layout="form-grid"><div><div className="text-xs font-medium text-gray-500 mb-1.5">{text("停車樓層")}</div>
<RimoElement kind="el-input" modelValue={view.returnData.parking.floor} onModelChange={value => {
                            model.write(["returnData", "parking", "floor"], value);
                          }} placeholder="B3" size="default"></RimoElement></div>
<div><div className="text-xs font-medium text-gray-500 mb-1.5">{text("車位號")}</div>
<RimoElement kind="el-input" modelValue={view.returnData.parking.spot} onModelChange={value => {
                            model.write(["returnData", "parking", "spot"], value);
                          }} placeholder="302" size="default"></RimoElement></div></div>
<div><div className="text-xs font-medium text-gray-500 mb-1.5">{text("停車位照片")}</div>
<RimoElement kind="el-upload" className="w-full" action="#" autoUpload={false} limit={1} showFileList={false}><RimoElement kind="el-button" className="w-full" size="default" icon="Camera">{text("拍攝/上傳車位照")}</RimoElement></RimoElement></div></div></div>
<div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm"><h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2 text-sm"><span className="w-7 h-7 bg-green-100 rounded-lg flex items-center justify-center"><RimoElement kind="el-icon" className="text-green-500"><RimoIcon name="Odometer" /></RimoElement></span>
{text("\n                                    里程與油量\n                                ")}</h3>
<div className="space-y-4"><div><div className="flex items-center justify-between mb-1.5"><div className="flex items-center gap-2"><span className="text-xs font-medium text-gray-500">{text("還車里程")}</span>
{view.isSelfServiceOrder && view.hasReturnTelematics ? <><RimoElement kind="el-tag" size="small" type="info" effect="plain">{text("默認車機值")}</RimoElement></> : null}</div>
<span className="text-xs text-gray-400">{text("限額: 13,500 km")}</span></div>
<RimoElement kind="el-input-number" modelValue={view.returnData.mileage} onModelChange={value => {
                          model.write(["returnData", "mileage"], value);
                        }} min={0} step={100} className="w-full" size="default" controls={false} slots={{
                          "suffix": _slot => <><span className="text-gray-400 text-xs">{text("km")}</span></>
                        }}></RimoElement></div>
<div><div className="flex items-center justify-between mb-1.5"><div className="flex items-center gap-2"><span className="text-xs font-medium text-gray-500">{text("還車油量")}</span>
{view.isSelfServiceOrder && view.hasReturnTelematics ? <><RimoElement kind="el-tag" size="small" type="info" effect="plain">{text("默認車機值")}</RimoElement></> : null}</div>
<span className={rimoClass(["text-xs font-mono", rimoClass(view.returnData.fuel >= 6 ? 'text-green-500' : view.returnData.fuel >= 3 ? 'text-orange-500' : 'text-red-500')])}>{rimoText(view.returnData.fuel)}{text("/8 格")}</span></div>
<div className="flex items-center gap-1 bg-gray-50 rounded-lg border border-gray-200 p-2"><div className="flex-1 flex gap-1">{rimoEntries(8).map(([i], _itemIndex) => <Fragment key={'ret_fuel' + i}><div key={'ret_fuel' + i} className={rimoClass(["flex-1 h-7 rounded cursor-pointer transition-all border", rimoClass(i <= view.returnData.fuel ? 'bg-gradient-to-t from-green-500 to-green-400 border-green-600 shadow-sm' : 'bg-white border-gray-200 hover:bg-gray-100')])} onClick={_event => {
                                model.write(["returnData", "fuel"], i);
                              }}></div></Fragment>)}</div>
<RimoElement kind="el-icon" className="text-gray-400 ml-2 cursor-pointer hover:text-red-500 text-lg" onClick={_event => {
                            model.write(["returnData", "fuel"], 0);
                          }} title="清空"><RimoIcon name="Close" /></RimoElement></div>
<div className="text-xs text-gray-400 mt-1 flex justify-between px-1"><span>{text("E")}</span>
<span>{text("F")}</span></div></div>
<div><div className="text-xs font-medium text-gray-500 mb-1.5">{text("還車備註")}</div>
<RimoElement kind="el-input" modelValue={view.returnData.remarks} onModelChange={value => {
                          model.write(["returnData", "remarks"], value);
                        }} type="textarea" rows={2} placeholder="如有異常請備註..." size="default"></RimoElement></div></div></div></div>
<div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm"><h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2 text-sm"><span className="w-7 h-7 bg-blue-100 rounded-lg flex items-center justify-center"><RimoElement kind="el-icon" className="text-blue-500"><RimoIcon name="CameraFilled" /></RimoElement></span>
{text("\n                                驗車影像記錄\n                            ")}</h3>
<div className="flex gap-4 mb-5"><div className="flex-[2] min-w-0"><div className="text-xs font-bold text-gray-500 mb-2 flex items-center gap-2"><span className="w-5 h-5 bg-blue-100 text-blue-600 rounded flex items-center justify-center text-xs">{text("外")}</span>
{text("外觀照片\n                                        (6張)")}</div>
<div className="grid grid-cols-6 gap-2" data-rimo-grid="6">{rimoEntries(['前方', '後方', '左側', '右側', '左前角', '右前角']).map(([label, i], _itemIndex) => <Fragment key={'retext' + i}><div key={'retext' + i} className="aspect-square bg-gradient-to-br from-gray-50 to-slate-100 rounded-lg border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400 cursor-pointer hover:border-[color:var(--app-color-primary-light-5)] hover:text-[color:var(--app-color-primary)] hover:bg-[color:var(--app-color-primary-light-9)] transition-all group"><RimoElement kind="el-icon" className="text-xl mb-1 group-hover:scale-110 transition-transform"><RimoIcon name="Plus" /></RimoElement>
<span className="text-[10px] font-medium">{rimoText(label)}</span></div></Fragment>)}</div></div>
<div className="flex-1 min-w-0"><div className="text-xs font-bold text-gray-500 mb-2 flex items-center gap-2"><span className="w-5 h-5 bg-green-100 text-green-600 rounded flex items-center justify-center text-xs">{text("內")}</span>
{text("內飾照片\n                                        (3張)")}</div>
<div className="grid grid-cols-3 gap-2" data-rimo-grid="3">{rimoEntries(['儀表', '座椅', '後排']).map(([label, i], _itemIndex) => <Fragment key={'retint' + i}><div key={'retint' + i} className="aspect-square bg-gradient-to-br from-gray-50 to-slate-100 rounded-lg border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400 cursor-pointer hover:border-green-400 hover:text-green-500 hover:bg-green-50 transition-all group"><RimoElement kind="el-icon" className="text-xl mb-1 group-hover:scale-110 transition-transform"><RimoIcon name="Plus" /></RimoElement>
<span className="text-[10px] font-medium">{rimoText(label)}</span></div></Fragment>)}</div></div></div>
<div className="border-t border-gray-100 pt-4"><div className="flex items-center justify-between mb-3" data-rimo-layout="toolbar"><div className="text-xs font-bold text-gray-500 flex items-center gap-2"><span className="w-5 h-5 bg-orange-100 text-orange-600 rounded flex items-center justify-center text-xs">{text("損")}</span>
{text("異常/損傷記錄\n                                        (")}{rimoText(view.returnDamagePhotos.length)}{text(")")}</div>
<RimoElement kind="el-button" type="warning" size="small" onClick={_event => {
                        view.openDamageDialog('return');
                      }}><RimoElement kind="el-icon" className="mr-1"><RimoIcon name="CirclePlus" /></RimoElement>
{text("添加異常")}</RimoElement></div>
{view.returnDamagePhotos.length === 0 ? <><div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200 flex items-center gap-4"><RimoElement kind="el-icon" className="text-3xl text-green-500"><RimoIcon name="CircleCheck" /></RimoElement>
<div><div className="font-medium text-green-700">{text("車況良好")}</div>
<div className="text-xs text-green-500">{text("交接檢查未發現異常或損傷")}</div></div></div></> : <><div className="grid grid-cols-2 gap-4" data-rimo-grid="2">{rimoEntries(view.returnDamagePhotos).map(([damage], _itemIndex) => <Fragment key={damage.id}><div key={damage.id} className="bg-orange-50 rounded-xl p-4 border border-orange-200"><div className="flex justify-between items-start mb-3"><div className="flex items-center gap-2"><RimoElement kind="el-tag" type={damage.category === 'exterior' ? 'warning' : 'info'} size="small">{rimoText(damage.category === 'exterior' ? '外觀損傷' : '其他異常')}</RimoElement>
<span className="text-sm text-orange-700 font-medium">{rimoText(damage.type)}</span></div>
<RimoElement kind="el-icon" className="text-gray-400 cursor-pointer hover:text-red-500" onClick={_event => {
                                view.removeDamagePhoto(damage.id, 'return');
                              }}><RimoIcon name="Close" /></RimoElement></div>
<div className="flex gap-2 mb-3">{rimoEntries(3).map(([n], _itemIndex) => <Fragment key={'rp' + n}><div key={'rp' + n} className="w-16 h-16 bg-white rounded-lg border-2 border-dashed border-orange-200 flex items-center justify-center text-orange-300"><RimoIcon name="Plus" /></div></Fragment>)}</div>
<RimoElement kind="el-input" modelValue={damage.description} onModelChange={value => {
                              model.assign(damage, "description", value);
                            }} type="textarea" rows={2} placeholder="描述損傷情況..." size="small"></RimoElement></div></Fragment>)}</div></>}</div></div>
<div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm"><h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2 text-sm"><span className="w-7 h-7 bg-[color:var(--app-color-primary-light-8)] rounded-lg flex items-center justify-center"><RimoElement kind="el-icon" className="text-[color:var(--app-color-primary)]"><RimoIcon name="EditPen" /></RimoElement></span>
{text("\n                                客戶簽字確認\n                            ")}</h3>
{view.returnSignatureStatus === 'initial' ? <><div className="flex items-center justify-between bg-white p-4 rounded-lg border border-gray-200" data-rimo-layout="toolbar"><div><div className="font-bold text-gray-800">{text("發送簽名請求")}</div>
<div className="text-xs text-gray-500">{text("將推送簽名通知至客戶APP")}</div></div>
<RimoElement kind="el-button" type="primary" plain={true} onClick={event => {
                        view.requestReturnSignature?.(event);
                      }}>{text("立即推送 ")}
<RimoElement kind="el-icon" className="ml-1"><RimoIcon name="Position" /></RimoElement></RimoElement></div></> : view.returnSignatureStatus === 'pushed' ? <><div className="p-4 bg-blue-50 rounded-lg border border-blue-200 flex items-center justify-between" data-rimo-layout="toolbar"><div><div className="text-sm text-blue-700 font-bold mb-1 flex items-center gap-1"><RimoElement kind="el-icon" className="animate-pulse"><RimoIcon name="Bell" /></RimoElement>
{text(" 已推送簽名請求")}</div>
<div className="text-xs text-blue-600">{text("客戶APP正在簽署中...")}</div></div>
<RimoElement kind="el-button" type="primary" size="small" loading={view.processing} onClick={event => {
                        view.confirmReturnSignature?.(event);
                      }} icon="Refresh">{text("刷新獲取")}</RimoElement></div></> : <><div className="p-4 bg-green-50 rounded-lg border border-green-200 flex items-center justify-between"><div><div className="text-sm text-green-700 font-bold mb-1 flex items-center gap-1"><RimoElement kind="el-icon"><RimoIcon name="CircleCheckFilled" /></RimoElement>
{text(" 已完成簽署")}</div>
<div className="text-xs text-green-600">{text("簽署時間: ")}{rimoText(view.returnSignatureTime)}</div></div>
<div className="text-3xl font-cursive text-gray-800 rotate-[-5deg] opacaity-80 px-4">{text("Wang\n                                    Xiao\n                                    Ming")}</div></div></>}</div></div></> : null}
{view.returnStep === 1 ? <><div className="max-w-4xl mx-auto space-y-6 animate-fade-in-up"><div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm"><div className="p-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center" data-rimo-layout="toolbar"><div><h4 className="font-bold text-gray-800">{text("費用明細")}</h4>
<p className="text-xs text-gray-500 mt-0.5">{text("\n                                        ")}{rimoText(view.isMonthlyBilling ? '企業月結訂單按最終應收進入企業賬單' : '還車階段只處理租期結束後的差額費用')}{text("\n                                    ")}</p></div>
<RimoElement kind="el-button" type="primary" plain={true} size="small" icon="Plus" onClick={event => {
                      view.openAddFeeDialog?.(event);
                    }}>{text("添加費用")}</RimoElement></div>
<RimoElement kind="el-table" data={view.returnFees.items} style={rimoStyle("width: 100%")} headerCellStyle={{
                    background: '#f9fafb'
                  }}><RimoElement kind="el-table-column" prop="name" label="費用項目" minWidth="140" slots={{
                      "default": scope => <><div className="font-medium text-gray-900">{rimoText(scope.row.name)}</div>
<div className="text-xs text-gray-400">{rimoText(scope.row.desc)}</div></>
                    }}></RimoElement>
<RimoElement kind="el-table-column" prop="amount" label="應收金額" align="right" width="120" slots={{
                      "default": scope => <><span className={rimoClass(["font-mono", rimoClass(scope.row.amount >= 0 ? 'text-gray-800' : 'text-green-600')])}>{text("\n                                            ")}{rimoText(scope.row.amount < 0 ? '-' : '')}{rimoText(view.formatNumber(scope.row.amount))}{text("\n                                        ")}</span></>
                    }}></RimoElement>
<RimoElement kind="el-table-column" label="已付/已免" align="right" width="120" slots={{
                      "default": scope => <><span className="font-mono text-gray-500">{rimoText(view.formatNumber(scope.row.paid || 0))}</span></>
                    }}></RimoElement>
<RimoElement kind="el-table-column" label="待結金額" align="right" width="120" slots={{
                      "default": scope => <><span className={rimoClass(["font-mono font-bold", rimoClass(scope.row.amount - (scope.row.paid || 0) > 0 ? 'text-orange-500' : scope.row.amount - (scope.row.paid || 0) < 0 ? 'text-green-600' : 'text-gray-400')])}>{text("\n                                            ")}{rimoText(scope.row.amount - (scope.row.paid || 0) < 0 ? '-' : '')}{rimoText(view.formatNumber(scope.row.amount - (scope.row.paid || 0)))}{text("\n                                        ")}</span></>
                    }}></RimoElement>
<RimoElement kind="el-table-column" width="140" align="center" label="操作" slots={{
                      "default": scope => <><div className="flex items-center justify-center gap-2">{scope.row.desc === '人工添加' ? <><RimoElement kind="el-button" type="danger" link={true} size="small" onClick={_event => {
                              view.removeExtraFee(scope.$index);
                            }}>{text("刪除")}</RimoElement></> : null}
<RimoElement kind="el-tooltip" content="申請費用減免" placement="top" showAfter={500}>{scope.row.amount - (scope.row.paid || 0) > 0 ? <><RimoElement kind="el-button" link={true} type="primary" size="small" icon="Discount" onClick={_event => {
                                view.openWaiveDialog(scope.row);
                              }}>{text("\n                                                    減免\n                                                ")}</RimoElement></> : null}</RimoElement></div></>
                    }}></RimoElement></RimoElement>
<div className="bg-[color:var(--app-color-primary-light-9)] px-4 py-3 flex justify-between items-center border-t border-[color:var(--app-color-primary-light-8)]"><span className="text-xs text-[color:var(--app-color-primary)] font-medium">{rimoText(view.isMonthlyBilling ? '企業本單應收' : '還車差額合計')}</span>
<span className="font-bold font-mono text-[color:var(--app-color-primary-hover)] text-lg">{text("\n                                    ")}{rimoText(!view.isMonthlyBilling && view.returnFees.total < 0 ? '-¥' : '¥')}{text("\n                                    ")}{rimoText(view.formatNumber(view.isMonthlyBilling ? view.monthlyReturnBillAmount : view.returnFees.total))}{text("\n                                ")}</span></div></div>
{view.returnSettlementRecords.length > 0 ? <><div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm"><div className="p-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center"><h4 className="font-bold text-gray-800 flex items-center gap-2"><RimoElement kind="el-icon" className="text-[color:var(--app-color-primary)]"><RimoIcon name="Wallet" /></RimoElement>
{text("\n                                    結算記錄\n                                ")}</h4>
<span className="text-xs text-gray-500">{rimoText(view.isMonthlyBilling ? '包含月結掛賬和減免記錄' : '包含支付、退款及減免記錄')}</span></div>
<div className="divide-y divide-gray-100 max-h-60 overflow-y-auto">{rimoEntries(view.returnSettlementRecords).map(([record, i], _itemIndex) => <Fragment key={i}><div key={i} className="p-4 flex justify-between items-center bg-white hover:bg-gray-50 transition-colors group"><div className="flex items-center gap-3"><div className={rimoClass(["w-9 h-9 rounded-full flex items-center justify-center text-lg border", rimoClass({
                              'bg-green-50 text-green-600 border-green-100': ['payment', 'settlement'].includes(record.type),
                              'bg-[color:var(--app-color-primary-light-9)] text-[color:var(--app-color-primary)] border-[color:var(--app-color-primary-light-8)]': record.type === 'monthly_bill',
                              'bg-red-50 text-red-600 border-red-100': record.type === 'refund',
                              'bg-blue-50 text-blue-600 border-blue-100': record.type === 'waiver'
                            })])}><RimoElement kind="el-icon"><RimoIcon name={record.type === 'monthly_bill' ? 'OfficeBuilding' : record.type === 'waiver' ? 'Discount' : record.type === 'refund' ? 'RefreshLeft' : 'Check'} /></RimoElement></div>
<div><div className="flex items-center gap-2"><span className="font-bold text-gray-800 text-sm">{text("\n                                                    ")}{rimoText(record.type === 'waiver' ? '費用減免' : record.channel)}{text("\n                                                ")}</span>
{record.type === 'waiver' ? <><RimoElement kind="el-tag" size="small" type="primary" effect="light">{text("已批准")}</RimoElement></> : null}
{record.type === 'monthly_bill' ? <><RimoElement kind="el-tag" size="small" color="var(--app-color-primary)" effect="dark">{text("已掛賬")}</RimoElement></> : null}</div>
<div className="text-xs text-gray-400 mt-0.5 flex items-center gap-2"><span>{rimoText(record.time)}</span>
{record.refNo ? <><span className="font-mono bg-gray-100 px-1 rounded">{text("#")}{rimoText(record.refNo.slice(-6))}</span></> : null}</div></div></div>
<div className="text-right"><div className={rimoClass(["font-bold font-mono text-base", rimoClass({
                              'text-green-600': ['payment', 'settlement'].includes(record.type),
                              'text-[color:var(--app-color-primary)]': record.type === 'monthly_bill',
                              'text-red-500': record.type === 'refund',
                              'text-blue-600': record.type === 'waiver'
                            })])}>{text("\n                                            ")}{rimoText(record.type === 'refund' ? '-' : record.type === 'waiver' ? '-' : '+')}{text("\n                                            ")}{rimoText(view.formatNumber(Math.abs(record.amount)))}{text("\n                                        ")}</div>
{record.remark ? <><div className="text-xs text-gray-500 mt-0.5 max-w-[200px] truncate" title={record.remark}>{text("\n                                            ")}{rimoText(record.remark)}{text("\n                                        ")}</div></> : null}</div></div></Fragment>)}</div></div></> : null}
<div className={rimoClass(["rounded-xl p-6 shadow-lg border transition-all relative overflow-hidden", rimoClass(view.isMonthlyBilling ? 'bg-gradient-to-br from-[color:var(--app-color-primary-light-9)] to-[color:var(--app-color-primary-light-9)] border-[color:var(--app-color-primary-light-7)]' : view.returnBalanceDue !== 0 ? 'bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200' : 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200')])}><RimoElement kind="el-icon" className={rimoClass(["absolute -right-4 -bottom-4 text-9xl opacity-10", rimoClass(view.isMonthlyBilling ? 'text-[color:var(--app-color-primary)]' : view.returnBalanceDue !== 0 ? 'text-orange-500' : 'text-green-500')])}><RimoIcon name="Money" /></RimoElement>
<div className="flex justify-between items-center relative z-10" data-rimo-layout="toolbar"><div><div className={rimoClass(["text-xs font-bold uppercase tracking-wider mb-1 flex items-center gap-1", rimoClass(view.isMonthlyBilling ? 'text-[color:var(--app-color-primary)]' : view.returnBalanceDue !== 0 ? 'text-orange-600' : 'text-green-600')])}><RimoElement kind="el-icon"><RimoIcon name="Wallet" /></RimoElement>
{text("\n                                        ")}{rimoText(view.isMonthlyBilling ? '企業掛賬金額' : '還車待結金額')}{text("\n                                    ")}</div>
<div className={rimoClass(["text-4xl font-bold font-mono heading-font tracking-tight", rimoClass(view.isMonthlyBilling ? 'text-[color:var(--app-color-primary-hover)]' : view.returnBalanceDue !== 0 ? 'text-red-600' : 'text-green-600')])}>{view.isMonthlyBilling ? <><span>{text("¥ ")}{rimoText(view.formatNumber(view.monthlyReturnBillAmount))}</span></> : view.returnBalanceDue > 0 ? <><span>{text("¥ ")}{rimoText(view.formatNumber(Math.abs(view.returnBalanceDue)))}</span></> : view.returnBalanceDue < 0 ? <><span>{text("退 ¥ ")}{rimoText(view.formatNumber(Math.abs(view.returnBalanceDue)))}</span></> : <><span>{text("已結清")}</span></>}</div>
<div className={rimoClass(["text-xs mt-2 flex gap-4 font-medium opacity-80", rimoClass(view.isMonthlyBilling ? 'text-[color:var(--app-color-primary-hover)]' : view.returnBalanceDue !== 0 ? 'text-orange-800' : 'text-green-800')])}><span>{rimoText(view.isMonthlyBilling ? '企業應收總額' : '還車差額')}{text(": ")}{rimoText(!view.isMonthlyBilling && view.returnFees.total < 0 ? '-' : '')}{rimoText(view.formatNumber(view.isMonthlyBilling ? view.monthlyReturnBillAmount : view.returnFees.total))}</span>
<span className="w-px h-3 bg-current opacity-30"></span>
{view.isMonthlyBilling ? <><span>{text("賬單對象: ")}{rimoText(view.paymentData.monthlyCompany)}</span></> : <><span>{text("已處理: ")}{rimoText(view.returnHandledAmount < 0 ? '-' : '')}{rimoText(view.formatNumber(view.returnHandledAmount))}</span></>}</div></div>
<div className="flex gap-3">{view.isMonthlyBilling ? <><><div className="flex items-center gap-2 text-[color:var(--app-color-primary-hover)] font-bold px-6 bg-[color:var(--app-color-primary-light-8)] rounded-lg py-2"><RimoElement kind="el-icon" className="text-xl"><RimoIcon name="OfficeBuilding" /></RimoElement>
<span>{text("確認月結後完成還車")}</span></div></></> : view.returnBalanceDue === 0 ? <><><div className="flex items-center gap-2 text-green-700 font-bold px-6 bg-green-100/50 rounded-lg py-2"><RimoElement kind="el-icon" className="text-xl"><RimoIcon name="CircleCheckFilled" /></RimoElement>
<span>{text("賬單已平，請確認還車")}</span></div></></> : <><><RimoElement kind="el-button" type="primary" size="large" icon="Wallet" className="shadow-xl transition-transform hover:-translate-y-0.5" disabled={view.returnBalanceDue <= 0} onClick={_event => {
                            view.openReturnPaymentDialog('online');
                          }}>{text("\n                                            立即收款\n                                        ")}</RimoElement>
<RimoElement kind="el-button" type="danger" size="large" icon="RefreshLeft" className="shadow-xl transition-transform hover:-translate-y-0.5" disabled={view.returnBalanceDue >= 0} onClick={event => {
                            view.openReturnRefundDialog?.(event);
                          }}>{text("\n                                            立即退款\n                                        ")}</RimoElement></></>}</div></div></div></div></> : null}
<RimoElement kind="el-dialog" modelValue={view.waiveDialogVisible} onModelChange={value => {
              model.write(["waiveDialogVisible"], value);
            }} title="費用減免申請" width="450px" destroyOnClose={true} appendToBody={true} className="rounded-xl order-detail-overlay" slots={{
              "footer": _slot => <><span className="dialog-footer"><RimoElement kind="el-button" onClick={_event => {
                    model.write(["waiveDialogVisible"], false);
                  }}>{text("取消")}</RimoElement>
<RimoElement kind="el-button" type="primary" onClick={event => {
                    view.confirmWaive?.(event);
                  }} disabled={!view.waiveData.amount || !view.waiveData.reason}>{text("\n                                    確認減免\n                                ")}</RimoElement></span></>
            }}>{() => <><div className="space-y-4 p-2"><div className="bg-blue-50 p-3 rounded-lg flex gap-3 border border-blue-100"><RimoElement kind="el-icon" className="text-blue-500 text-lg mt-0.5"><RimoIcon name="InfoFilled" /></RimoElement>
<div className="text-xs text-blue-700"><div className="font-bold mb-1">{text("正在爲 [")}{rimoText(view.waiveData.itemName)}{text("] 申請減免")}</div>
<div>{text("減免金額將記錄爲“費用豁免”，並計入財務報表。")}</div></div></div>
<div><div className="text-sm text-gray-600 mb-1.5 is-required">{text("減免金額")}</div>
<RimoElement kind="el-input-number" modelValue={view.waiveData.amount} onModelChange={value => {
                      model.write(["waiveData", "amount"], value);
                    }} min={0} max={view.waiveData.maxAmount} className="w-full" size="large" precision={0}></RimoElement>
<div className="text-xs text-gray-400 mt-1 text-right">{text("最多可減免: ¥")}{rimoText(view.waiveData.maxAmount)}{text("\n                                ")}</div></div>
<div><div className="text-sm text-gray-600 mb-1.5 is-required">{text("減免原因 (必填)")}</div>
<RimoElement kind="el-select" modelValue={view.waiveData.reason} onModelChange={value => {
                      model.write(["waiveData", "reason"], value);
                    }} placeholder="選擇原因" className="w-full mb-2"><RimoElement kind="el-option" label="客戶滿意度補償" value="客戶滿意度補償"></RimoElement>
<RimoElement kind="el-option" label="系統/操作失誤" value="系統/操作失誤"></RimoElement>
<RimoElement kind="el-option" label="協議優惠" value="協議優惠"></RimoElement>
<RimoElement kind="el-option" label="其他" value="其他"></RimoElement></RimoElement>
<RimoElement kind="el-input" type="textarea" modelValue={view.waiveData.remark} onModelChange={value => {
                      model.write(["waiveData", "remark"], value);
                    }} placeholder="詳細說明..." rows={2}></RimoElement></div></div></>}</RimoElement>
{view.returnStep === 2 ? <><div className="animate__animated animate__fadeIn h-full flex flex-col items-center justify-center text-center"><div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6"><RimoElement kind="el-icon" className="text-5xl text-green-500"><RimoIcon name="CircleCheckFilled" /></RimoElement></div>
<h2 className="text-3xl font-bold text-gray-800 mb-2">{text("還車成功")}</h2>
<p className="text-gray-500 mb-8">{text("車輛已成功返還，訂單狀態已更新爲“已完成”。")}</p>
<div className="bg-gray-50 rounded-xl p-6 w-80 border border-gray-100 mb-8"><div className="space-y-4"><div className="flex justify-between items-center text-sm"><span className="text-gray-500">{text("還車時間")}</span>
<span className="font-mono font-bold text-gray-800">{rimoText(new Date().toLocaleString())}</span></div>
<div className="flex justify-between items-center text-sm"><span className="text-gray-500">{text("車輛信息")}</span>
<span className="font-bold text-gray-800">{text("Toyota Camry (ABC-1234)")}</span></div>
<div className="flex justify-between items-center text-sm"><span className="text-gray-500">{text("訂單當前還車門市")}</span>
<span className="font-bold text-gray-800">{rimoText(view.currentReturnStoreName)}</span></div>
<div className="flex justify-between items-center text-sm"><span className="text-gray-500">{text("歸還據點")}</span>
<span className="font-bold text-gray-800">{rimoText(view.getReturnStationLabel(view.returnData.parking.station))}</span></div>
<div className="flex justify-between items-center text-sm"><span className="text-gray-500">{text("經辦人員")}</span>
<span className="font-medium bg-gray-200 text-gray-600 px-2 py-0.5 rounded text-xs">{text("Admin")}</span></div>
<div className="flex justify-between items-center text-sm"><span className="text-gray-500">{text("結算狀態")}</span>
<RimoElement kind="el-tag" type="success" effect="plain" size="small">{text("已結清")}</RimoElement></div></div></div>
<div className="flex gap-4"><RimoElement kind="el-button" size="large" onClick={_event => {
                    model.write(["returnModalVisible"], false);
                  }}>{text("返回訂單詳情")}</RimoElement>
<RimoElement kind="el-button" type="primary" size="large" onClick={_event => {
                    model.write(["returnModalVisible"], false);
                  }}><RimoElement kind="el-icon" className="mr-2"><RimoIcon name="Printer" /></RimoElement>
{text("\n                                打印還車單\n                            ")}</RimoElement></div></div></> : null}</div></div></>}</RimoElement>
<RimoElement kind="el-dialog" modelValue={view.waiveDialogVisible} onModelChange={value => {
      model.write(["waiveDialogVisible"], value);
    }} title="費用減免申請" width="450px" destroyOnClose={true} appendToBody={true} className="rounded-xl order-detail-overlay" slots={{
      "footer": _slot => <><span className="dialog-footer"><RimoElement kind="el-button" onClick={_event => {
            model.write(["waiveDialogVisible"], false);
          }}>{text("取消")}</RimoElement>
<RimoElement kind="el-button" type="primary" onClick={event => {
            view.confirmWaive?.(event);
          }} disabled={!view.waiveData.amount || !view.waiveData.reason}>{text("\n                                    確認減免\n                                ")}</RimoElement></span></>
    }}>{() => <><div className="space-y-4 p-2"><div className="bg-blue-50 p-3 rounded-lg flex gap-3 border border-blue-100"><RimoElement kind="el-icon" className="text-blue-500 text-lg mt-0.5"><RimoIcon name="InfoFilled" /></RimoElement>
<div className="text-xs text-blue-700"><div className="font-bold mb-1">{text("正在爲 [")}{rimoText(view.waiveData.itemName)}{text("] 申請減免")}</div>
<div>{text("減免金額將記錄爲“費用豁免”，並計入財務報表。")}</div></div></div>
<div><div className="text-sm text-gray-600 mb-1.5 is-required">{text("減免金額")}</div>
<RimoElement kind="el-input-number" modelValue={view.waiveData.amount} onModelChange={value => {
              model.write(["waiveData", "amount"], value);
            }} min={0} max={view.waiveData.maxAmount} className="w-full" size="large" precision={0}></RimoElement>
<div className="text-xs text-gray-400 mt-1 text-right">{text("最多可減免: ¥")}{rimoText(view.waiveData.maxAmount)}{text("\n                                ")}</div></div>
<div><div className="text-sm text-gray-600 mb-1.5 is-required">{text("減免原因 (必填)")}</div>
<RimoElement kind="el-select" modelValue={view.waiveData.reason} onModelChange={value => {
              model.write(["waiveData", "reason"], value);
            }} placeholder="選擇原因" className="w-full mb-2"><RimoElement kind="el-option" label="客戶滿意度補償" value="客戶滿意度補償"></RimoElement>
<RimoElement kind="el-option" label="系統/操作失誤" value="系統/操作失誤"></RimoElement>
<RimoElement kind="el-option" label="協議優惠" value="協議優惠"></RimoElement>
<RimoElement kind="el-option" label="其他" value="其他"></RimoElement></RimoElement>
<RimoElement kind="el-input" type="textarea" modelValue={view.waiveData.remark} onModelChange={value => {
              model.write(["waiveData", "remark"], value);
            }} placeholder="詳細說明..." rows={2}></RimoElement></div></div></>}</RimoElement>
<RimoElement kind="el-dialog" modelValue={view.returnRefundDialogVisible} onModelChange={value => {
      model.write(["returnRefundDialogVisible"], value);
    }} title="確認原路退款" width="480px" appendToBody={true} destroyOnClose={true} className="rounded-xl order-detail-overlay" closeOnClickModal={false} slots={{
      "footer": _slot => <><div className="flex gap-3"><RimoElement kind="el-button" onClick={_event => {
            model.write(["returnRefundDialogVisible"], false);
          }} className="flex-1">{text("取消")}</RimoElement>
<RimoElement kind="el-button" type="danger" className="flex-1" onClick={event => {
            view.confirmReturnRefund?.(event);
          }} disabled={!view.selectedReturnRefundChannel || view.returnRefundAmount <= 0}>{text("\n                        確認退款\n                    ")}</RimoElement></div></>
    }}>{() => <><div className="space-y-4"><div className="rounded-xl border border-red-100 bg-red-50 p-4 flex gap-3"><div className="w-9 h-9 rounded-full bg-white text-red-500 flex items-center justify-center shrink-0"><RimoElement kind="el-icon" className="text-xl"><RimoIcon name="RefreshLeft" /></RimoElement></div>
<div><div className="font-bold text-red-700">{text("本次將執行原路退款")}</div>
<div className="text-xs text-red-600 mt-1">{text("退款成功後會寫入結算記錄，並抵消當前應退金額。")}</div></div></div>
<div className="grid grid-cols-2 gap-3 text-sm" data-rimo-grid="2"><div className="rounded-lg border border-gray-100 bg-gray-50 p-3"><div className="text-xs text-gray-400 mb-1">{text("退款金額")}</div>
<div className="text-2xl font-bold text-red-600 font-mono">{text("¥ ")}{rimoText(view.formatNumber(view.returnRefundAmount))}</div></div>
<div className="rounded-lg border border-gray-100 bg-gray-50 p-3"><div className="text-xs text-gray-400 mb-1">{text("退款方式")}</div>
<div className="font-bold text-gray-800">{text("原路退回")}</div></div></div>
<div><div className="text-sm font-medium text-gray-700 mb-2">{text("確認原支付渠道")}</div>
<RimoElement kind="el-radio-group" modelValue={view.selectedReturnRefundChannel} onModelChange={value => {
              model.write(["selectedReturnRefundChannel"], value);
            }} className="w-full"><div className="space-y-2 w-full">{rimoEntries(view.returnOriginalPaymentChannels).map(([channel], _itemIndex) => <Fragment key={channel.id}><div key={channel.id} className={rimoClass(["flex items-center justify-between rounded-lg border p-3 cursor-pointer transition-colors", rimoClass(view.selectedReturnRefundChannel === channel.id ? 'border-red-400 bg-red-50' : 'border-gray-200 hover:border-gray-300')])} onClick={_event => {
                    model.write(["selectedReturnRefundChannel"], channel.id);
                  }}><div className="flex items-center gap-3"><RimoElement kind="el-radio" label={channel.id} size="large"></RimoElement>
<div><div className="font-bold text-gray-800">{rimoText(channel.channel)}</div>
<div className="text-xs text-gray-400 font-mono">{rimoText(channel.refNo || '無交易號')}{text(" · ")}{rimoText(channel.time || '-')}</div></div></div>
<div className="font-mono font-bold text-gray-700">{text("¥ ")}{rimoText(view.formatNumber(channel.amount))}</div></div></Fragment>)}</div></RimoElement>
{view.returnOriginalPaymentChannels.length === 0 ? <><div className="rounded-lg border border-dashed border-gray-200 p-4 text-center text-sm text-gray-400">{text("\n                        暫無可用於原路退款的支付渠道\n                    ")}</div></> : null}</div></div></>}</RimoElement>
<RimoElement kind="el-dialog" modelValue={view.showAddFeeDialog} onModelChange={value => {
      model.write(["showAddFeeDialog"], value);
    }} title="添加額外費用" width="450px" appendToBody={true} destroyOnClose={true} className="rounded-xl order-detail-overlay" slots={{
      "footer": _slot => <><div className="flex gap-3"><RimoElement kind="el-button" onClick={_event => {
            model.write(["showAddFeeDialog"], false);
          }} className="flex-1">{text("取消")}</RimoElement>
<RimoElement kind="el-button" type="primary" onClick={event => {
            view.confirmAddFees?.(event);
          }} className="flex-1">{text("\n                        確認添加\n                    ")}</RimoElement></div></>
    }}>{() => <><div className="space-y-4"><div><div className="text-sm font-medium text-gray-700 mb-2">{text("費用類型")}</div>
<RimoElement kind="el-select" modelValue={view.returnFeeForm.type} onModelChange={value => {
              model.write(["returnFeeForm", "type"], value);
            }} className="w-full" placeholder="選擇費用類型">{rimoEntries(view.manualFeeTypes).map(([type], _itemIndex) => <Fragment key={type.value}><RimoElement kind="el-option" key={type.value} label={type.label} value={type.value}></RimoElement></Fragment>)}</RimoElement></div>
{view.returnFeeForm.type === 'other' ? <><div><div className="text-sm font-medium text-gray-700 mb-2">{text("自定義名稱")}</div>
<RimoElement kind="el-input" modelValue={view.returnFeeForm.customName} onModelChange={value => {
                model.write(["returnFeeForm", "customName"], value);
              }} placeholder="輸入費用名稱"></RimoElement></div></> : null}
<div><div className="text-sm font-medium text-gray-700 mb-2">{text("費用金額")}</div>
<RimoElement kind="el-input-number" modelValue={view.returnFeeForm.amount} onModelChange={value => {
              model.write(["returnFeeForm", "amount"], value);
            }} min={0} precision={0} className="w-full"></RimoElement></div>
<div><div className="text-sm font-medium text-gray-700 mb-2">{text("費用說明")}</div>
<RimoElement kind="el-input" modelValue={view.returnFeeForm.description} onModelChange={value => {
              model.write(["returnFeeForm", "description"], value);
            }} type="textarea" rows={2} placeholder="詳細說明..."></RimoElement></div>
<div><div className="text-sm font-medium text-gray-700 mb-2">{text("上傳憑證 (可選)")}</div>
<RimoElement kind="el-upload" action="#" autoUpload={false} limit={3} listType="picture-card" onExceed={view.handleExceed}><RimoElement kind="el-icon"><RimoIcon name="Plus" /></RimoElement></RimoElement></div></div></>}</RimoElement>
<RimoElement kind="el-dialog" modelValue={view.paymentDialogVisible} onModelChange={value => {
      model.write(["paymentDialogVisible"], value);
    }} title={view.paymentDialogTitle} width="500px" destroyOnClose={true} top="15vh" className="rounded-xl overflow-hidden order-detail-overlay" closeOnClickModal={false} slots={{
      "footer": _slot => <><div className="flex gap-3"><RimoElement kind="el-button" onClick={_event => {
            model.write(["paymentDialogVisible"], false);
          }} className="flex-1" size="large">{text("取消")}</RimoElement>
<RimoElement kind="el-button" type="primary" onClick={event => {
            view.confirmPayment?.(event);
          }} loading={view.newPayment.processing} className="flex-1" size="large">{text("\n                        ")}{rimoText(view.paymentDialogSubmitText)}{text("\n                    ")}</RimoElement></div></>
    }}>{() => <><div className="p-1"><div className={rimoClass(view.newPayment.context === 'booking' ? 'grid grid-cols-1 bg-gray-100 rounded-lg p-1 mb-3' : 'grid grid-cols-2 bg-gray-100 rounded-lg p-1 mb-5')} data-rimo-layout="summary"><div className={rimoClass(["text-center py-2.5 text-sm font-medium rounded-md cursor-pointer transition-all", rimoClass(view.paymentDialogType === 'online' ? 'bg-white text-[color:var(--app-color-primary)] shadow-sm' : 'text-gray-500 hover:text-gray-700')])} onClick={_event => {
              model.write(["paymentDialogType"], 'online');
              model.write(["newPayment", "gateway"], 'jiekou');
            }} data-rimo-layout="stat"><RimoElement kind="el-icon" className="mr-1"><RimoIcon name="Monitor" /></RimoElement>
{text(" ")}{rimoText(view.newPayment.context === 'booking' ? '在線預授權' : '在線支付')}{text("\n                    ")}</div>
{view.newPayment.context !== 'booking' ? <><div className={rimoClass(["text-center py-2.5 text-sm font-medium rounded-md cursor-pointer transition-all", rimoClass(view.paymentDialogType === 'offline' ? 'bg-white text-[color:var(--app-color-primary)] shadow-sm' : 'text-gray-500 hover:text-gray-700')])} onClick={_event => {
                model.write(["paymentDialogType"], 'offline');
                model.write(["newPayment", "gateway"], 'cash');
              }} data-rimo-layout="stat"><RimoElement kind="el-icon" className="mr-1"><RimoIcon name="Wallet" /></RimoElement>
{text(" 線下收款\n                    ")}</div></> : null}</div>
{view.newPayment.context === 'booking' ? <><div className="mb-5 rounded-lg border border-blue-100 bg-blue-50 text-blue-700 text-xs px-3 py-2">{text("\n                    本期下單預授權押金僅支持線上預授權，不支持現金押金、線下押金或僅登記線下憑證。\n                ")}</div></> : null}
{view.paymentDialogType === 'online' ? <><div className="space-y-4"><div className="text-sm font-medium text-gray-700 mb-2">{text("選擇支付渠道")}</div>
<div className="grid grid-cols-2 gap-3" data-rimo-grid="2" data-rimo-layout="summary"><div className={rimoClass(["p-4 rounded-xl border-2 cursor-pointer transition-all relative", rimoClass(view.newPayment.gateway === 'jiekou' ? 'border-orange-500 bg-orange-50 shadow-sm' : 'border-gray-200 hover:border-gray-300')])} onClick={_event => {
                  model.write(["newPayment", "gateway"], 'jiekou');
                }} data-rimo-layout="stat"><div className="flex items-center gap-3"><div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center"><span className="text-orange-500 text-lg font-bold">{text("街")}</span></div>
<div><div className="font-medium text-gray-800">{text("街口支付")}</div>
<div className="text-xs text-gray-400">{text("線上掃碼")}</div></div></div>
{view.newPayment.gateway === 'jiekou' ? <><div className="absolute top-2 right-2"><RimoElement kind="el-icon" className="text-orange-500"><RimoIcon name="CircleCheck" /></RimoElement></div></> : null}</div>
<div className={rimoClass(["p-4 rounded-xl border-2 cursor-pointer transition-all relative", rimoClass(view.newPayment.gateway === 'credit_card' ? 'border-[color:var(--app-color-primary)] bg-[color:var(--app-color-primary-light-9)] shadow-sm' : 'border-gray-200 hover:border-gray-300')])} onClick={_event => {
                  model.write(["newPayment", "gateway"], 'credit_card');
                }} data-rimo-layout="stat"><div className="flex items-center gap-3"><div className="w-10 h-10 bg-[color:var(--app-color-primary-light-8)] rounded-lg flex items-center justify-center"><RimoElement kind="el-icon" className="text-[color:var(--app-color-primary)] text-lg"><RimoIcon name="CreditCard" /></RimoElement></div>
<div><div className="font-medium text-gray-800">{text("信用卡")}</div>
<div className="text-xs text-gray-400">{text("用戶綁定卡")}</div></div></div>
{view.newPayment.gateway === 'credit_card' ? <><div className="absolute top-2 right-2"><RimoElement kind="el-icon" className="text-[color:var(--app-color-primary)]"><RimoIcon name="CircleCheck" /></RimoElement></div></> : null}</div></div>
{view.newPayment.gateway === 'credit_card' ? <><div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-200"><div className="text-sm font-medium text-gray-700 mb-3">{text("選擇信用卡")}</div>
<div className="space-y-2">{rimoEntries(view.userCreditCards).map(([card], _itemIndex) => <Fragment key={card.id}><div key={card.id} className={rimoClass(["p-3 bg-white rounded-lg border-2 cursor-pointer transition-all flex justify-between items-center", rimoClass(view.selectedCreditCard === card.id ? 'border-[color:var(--app-color-primary)] shadow-sm' : 'border-gray-100 hover:border-gray-300')])} onClick={_event => {
                        model.write(["selectedCreditCard"], card.id);
                      }}><div className="flex items-center gap-3"><div className={rimoClass(["w-8 h-8 rounded flex items-center justify-center", rimoClass(card.brand === 'Visa' ? 'bg-blue-100' : 'bg-orange-100')])}><span className={rimoClass(["text-xs font-bold", rimoClass(card.brand === 'Visa' ? 'text-blue-600' : 'text-orange-600')])}>{text("\n                                            ")}{rimoText(card.brand.substring(0, 2))}{text("\n                                        ")}</span></div>
<div><div className="font-mono text-gray-800">{text("**** **** **** ")}{rimoText(card.last4)}</div>
<div className="text-xs text-gray-400">{text("有效期: ")}{rimoText(card.expiry)}</div></div></div>
<div className="flex items-center gap-2">{card.isDefault ? <><RimoElement kind="el-tag" size="small" type="success" effect="plain">{text("默認卡")}</RimoElement></> : null}
{view.selectedCreditCard === card.id ? <><RimoElement kind="el-icon" className="text-[color:var(--app-color-primary)]"><RimoIcon name="CircleCheck" /></RimoElement></> : null}</div></div></Fragment>)}</div></div></> : null}</div></> : <><div className="space-y-4"><div className="text-sm font-medium text-gray-700 mb-2">{text("選擇收款方式")}</div>
<div className="grid grid-cols-3 gap-3" data-rimo-grid="3" data-rimo-layout="summary"><div className={rimoClass(["p-4 rounded-xl border-2 cursor-pointer transition-all text-center", rimoClass(view.newPayment.gateway === 'cash' ? 'border-green-500 bg-green-50 shadow-sm' : 'border-gray-200 hover:border-gray-300')])} onClick={_event => {
                  model.write(["newPayment", "gateway"], 'cash');
                }} data-rimo-layout="stat"><RimoElement kind="el-icon" className={rimoClass(["text-2xl mb-2", rimoClass(view.newPayment.gateway === 'cash' ? 'text-green-500' : 'text-gray-400')])}><RimoIcon name="Money" /></RimoElement>
<div className={rimoClass(["text-sm font-medium", rimoClass(view.newPayment.gateway === 'cash' ? 'text-green-700' : 'text-gray-600')])}>{text("現金")}</div></div>
<div className={rimoClass(["p-4 rounded-xl border-2 cursor-pointer transition-all text-center", rimoClass(view.newPayment.gateway === 'pos' ? 'border-blue-500 bg-blue-50 shadow-sm' : 'border-gray-200 hover:border-gray-300')])} onClick={_event => {
                  model.write(["newPayment", "gateway"], 'pos');
                }} data-rimo-layout="stat"><RimoElement kind="el-icon" className={rimoClass(["text-2xl mb-2", rimoClass(view.newPayment.gateway === 'pos' ? 'text-blue-500' : 'text-gray-400')])}><RimoIcon name="CreditCard" /></RimoElement>
<div className={rimoClass(["text-sm font-medium", rimoClass(view.newPayment.gateway === 'pos' ? 'text-blue-700' : 'text-gray-600')])}>{text("POS刷卡\n                            ")}</div></div>
<div className={rimoClass(["p-4 rounded-xl border-2 cursor-pointer transition-all text-center", rimoClass(view.newPayment.gateway === 'transfer' ? 'border-[color:var(--app-color-primary)] bg-[color:var(--app-color-primary-light-9)] shadow-sm' : 'border-gray-200 hover:border-gray-300')])} onClick={_event => {
                  model.write(["newPayment", "gateway"], 'transfer');
                }} data-rimo-layout="stat"><RimoElement kind="el-icon" className={rimoClass(["text-2xl mb-2", rimoClass(view.newPayment.gateway === 'transfer' ? 'text-[color:var(--app-color-primary)]' : 'text-gray-400')])}><RimoIcon name="Promotion" /></RimoElement>
<div className={rimoClass(["text-sm font-medium", rimoClass(view.newPayment.gateway === 'transfer' ? 'text-[color:var(--app-color-primary-hover)]' : 'text-gray-600')])}>{text("轉賬\n                            ")}</div></div></div>
<div className="mt-4"><div className="text-sm font-medium text-gray-700 mb-2">{text("憑證單號 (可選)")}</div>
<RimoElement kind="el-input" modelValue={view.newPayment.refNo} onModelChange={value => {
                  model.write(["newPayment", "refNo"], value);
                }} placeholder="輸入收款憑證號..." size="large"></RimoElement></div></div></>}
<div className="mt-6 p-4 bg-gradient-to-r from-[color:var(--app-color-primary-light-9)] to-[color:var(--app-color-primary-light-9)] rounded-xl border border-[color:var(--app-color-primary-light-8)]"><div className="flex justify-between items-center mb-3"><span className="text-sm font-medium text-gray-700">{rimoText(view.paymentDialogAmountLabel)}</span>
<span className="text-xs text-gray-400">{rimoText(view.paymentDialogAmountHint)}{text(": ¥")}{rimoText(view.formatNumber(view.paymentDialogDueAmount))}</span></div>
<RimoElement kind="el-input-number" modelValue={view.newPayment.amount} onModelChange={value => {
              model.write(["newPayment", "amount"], value);
            }} min={1} max={view.paymentDialogDueAmount || 1} controls={false} className="w-full" size="large" precision={0} slots={{
              "prefix": _slot => <><span className="text-gray-400 font-mono">{text("¥")}</span></>
            }}></RimoElement></div></div></>}</RimoElement>
<RimoElement kind="el-dialog" modelValue={view.redirectionModalVisible} onModelChange={value => {
      model.write(["redirectionModalVisible"], value);
    }} title="訂單改派 & 車輛升級" width="850px" destroyOnClose={true} top="5vh" className="rounded-xl overflow-hidden custom-modal order-detail-overlay">{() => <><div className="flex items-stretch gap-6 h-[580px] p-6"><div className="flex-1 flex flex-col h-full overflow-hidden"><div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-4 flex justify-between items-center shrink-0"><div className="flex items-center gap-3"><div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-gray-400 border border-gray-100"><RimoElement kind="el-icon"><RimoIcon name="Van" /></RimoElement></div>
<div><div className="text-xs text-gray-500">{text("當前指派")}</div>
<div className="font-bold text-gray-800 text-sm">{text("Toyota Corolla Altis ")}
<span className="font-normal text-gray-400">{text("ABC-1234")}</span></div></div></div>
<div className="text-right"><div className="text-xs text-gray-500">{text("日租金")}</div>
<div className="font-bold text-gray-800">{text("1,920")}</div></div></div>
<div className="grid grid-cols-2 bg-gray-100 rounded-lg p-1 mb-4 shrink-0" data-rimo-grid="2" data-rimo-layout="summary"><div className={rimoClass(["text-center py-2 text-sm font-medium rounded-md cursor-pointer transition-all", rimoClass(view.activeTab === 'manual' ? 'bg-white text-[color:var(--app-color-primary)] shadow-sm' : 'text-gray-500 hover:text-gray-700')])} onClick={_event => {
                model.write(["activeTab"], 'manual');
              }} data-rimo-layout="stat">{text("\n                            手動選擇\n                        ")}</div>
<div className={rimoClass(["text-center py-2 text-sm font-medium rounded-md cursor-pointer transition-all", rimoClass(view.activeTab === 'auto' ? 'bg-white text-[color:var(--app-color-primary)] shadow-sm' : 'text-gray-500 hover:text-gray-700')])} onClick={_event => {
                model.write(["activeTab"], 'auto');
              }} data-rimo-layout="stat">{text("\n                            系統推薦 (智能)\n                        ")}</div></div>
<div className="flex-1 overflow-y-auto custom-scroll pr-2"><div hidden={!(view.activeTab === 'manual')} className="space-y-5 pb-2"><div><div className="text-sm font-bold text-gray-700 mb-2 flex items-center gap-2"><span className="bg-[color:var(--app-color-primary-light-8)] text-[color:var(--app-color-primary)] w-5 h-5 rounded-full flex items-center justify-center text-xs">{text("1")}</span>
{text("\n                                    選擇車組\n                                ")}</div>
<div className="grid grid-cols-3 gap-3" data-rimo-grid="3">{rimoEntries(view.vehicleGroups).map(([group], _itemIndex) => <Fragment key={group.key}><div key={group.key} className={rimoClass(["vehicle-select-card p-3 rounded-lg text-center border border-gray-200", rimoClass({
                        'selected': view.selectedGroup === group.key
                      })])} onClick={_event => {
                        view.handleGroupSelect(group.key);
                      }}><div className="text-sm font-medium text-gray-700">{rimoText(group.name)}</div></div></Fragment>)}</div></div>
<div><div className="text-sm font-bold text-gray-700 mb-2 flex items-center gap-2"><span className="bg-[color:var(--app-color-primary-light-8)] text-[color:var(--app-color-primary)] w-5 h-5 rounded-full flex items-center justify-center text-xs">{text("2")}</span>
{text("\n                                    選擇具體車輛\n                                ")}</div>
<RimoElement kind="el-select" modelValue={view.selectedVehicleId} onModelChange={value => {
                    model.write(["selectedVehicleId"], value);
                  }} placeholder="請選擇車輛" style={rimoStyle("width: 100%")} size="large" onChange={event => {
                    view.calculatePrice?.(event);
                  }} disabled={!view.selectedGroup} slots={{
                    "prefix": _slot => <><RimoElement kind="el-icon"><RimoIcon name="Van" /></RimoElement></>
                  }}>{rimoEntries(view.currentVehicleList).map(([v], _itemIndex) => <Fragment key={v.id}><RimoElement kind="el-option" key={v.id} label={`${v.name} ${v.plate}`} value={v.id}><div className="flex items-center justify-between gap-3 w-full"><div className="min-w-0"><div className="text-sm font-medium text-gray-800 truncate">{rimoText(v.name)}{text(" · ")}{rimoText(v.plate)}</div>
<div className="text-xs text-gray-400 truncate">{rimoText(v.dealer)}{text(" / ")}{rimoText(v.store)}{text(" - ")}{rimoText(v.station)}{text(" / ")}{rimoText(v.available)}</div></div>
<div className="text-right shrink-0"><div className="text-xs text-gray-500">{rimoText(v.status)}</div>
<div className="font-mono text-xs text-gray-500">{text("¥")}{rimoText(view.formatNumber(v.price))}</div></div></div></RimoElement></Fragment>)}</RimoElement></div></div>
<div hidden={!(view.activeTab === 'auto')} className="space-y-3 pb-2">{rimoEntries(view.recommendations).map(([rec], _itemIndex) => <Fragment key={rec.id}><div key={rec.id} className={rimoClass(["vehicle-select-card rounded-lg p-3 flex justify-between items-center border border-gray-200", rimoClass({
                    'selected': view.selectedVehicleId === rec.id
                  })])} onClick={_event => {
                    view.selectRecommendation(rec);
                  }}><div className="flex items-center gap-3"><div className="w-12 h-12 bg-gray-50 rounded-lg flex items-center justify-center text-gray-400 border border-gray-100"><RimoElement kind="el-icon" className="text-lg"><RimoIcon name="Van" /></RimoElement></div>
<div className="min-w-0"><div className="font-bold text-sm text-gray-800">{rimoText(rec.name)}{text(" ")}</div>
<div className="flex gap-2 mt-1"><RimoElement kind="el-tag" size="small" type={rec.tagType} effect="plain" round={true}>{rimoText(rec.tag)}</RimoElement>
<span className="text-xs text-gray-400 font-mono pt-0.5">{rimoText(rec.plate)}</span></div>
<div className="text-xs text-gray-400 mt-1 truncate">{rimoText(rec.store)}{text(" - ")}{rimoText(rec.station)}{text(" / ")}{rimoText(rec.available)}</div></div></div>
<div className="text-right"><div className="font-bold text-gray-800">{text(" ")}{rimoText(view.formatNumber(rec.price))}</div>
<div className={rimoClass(["text-xs font-medium", rimoClass(rec.price > 1920 ? 'text-red-500' : 'text-green-500')])}>{text("\n                                        ")}{rimoText(rec.price > 1920 ? '補 ' + view.formatNumber(rec.price - 1920) : '退 ' + view.formatNumber(1920 - rec.price))}{text("\n                                    ")}</div></div></div></Fragment>)}</div>
{view.shouldShowPromoSelection ? <><div className="mt-4 pt-4 border-t border-gray-200 animate__animated animate__fadeIn"><div className="text-sm font-bold text-gray-700 mb-2 flex items-center gap-2"><span className="bg-orange-100 text-orange-600 w-5 h-5 rounded-full flex items-center justify-center text-xs"><RimoElement kind="el-icon"><RimoIcon name="Ticket" /></RimoElement></span>
{text("\n                                優惠方案選擇\n                            ")}</div>
<RimoElement kind="el-select" modelValue={view.selectedPromoId} onModelChange={value => {
                    model.write(["selectedPromoId"], value);
                  }} placeholder="選擇優惠" style={rimoStyle("width: 100%")} size="large" onChange={event => {
                    view.calculatePrice?.(event);
                  }} slots={{
                    "prefix": _slot => <><RimoElement kind="el-icon"><RimoIcon name="Ticket" /></RimoElement></>
                  }}>{rimoEntries(view.promotions).map(([p], _itemIndex) => <Fragment key={p.id}><RimoElement kind="el-option" key={p.id} label={p.name} value={p.id}><span style={rimoStyle("float: left")}>{rimoText(p.name)}</span>
{p.type !== 'none' ? <><span style={rimoStyle("float: right; color: #f56c6c; font-size: 13px")}>{text("\n                                        ")}{rimoText(p.type === 'rate' ? Math.round((1 - p.discount) * 100) / 10 + '折' : '-' + p.discount)}{text("\n                                    ")}</span></> : null}</RimoElement></Fragment>)}</RimoElement></div></> : null}</div></div>
<div className="w-80 bg-slate-50 p-5 rounded-xl border border-gray-200 h-full flex flex-col shrink-0"><h4 className="font-bold text-gray-800 mb-4 border-b border-gray-200 pb-3 flex items-center gap-2"><RimoElement kind="el-icon" className="text-[color:var(--app-color-primary)]"><RimoIcon name="Money" /></RimoElement>
{text(" 費用試算\n                    ")}</h4>
<div className="space-y-4 flex-1 overflow-y-auto"><div className="bg-white p-3 rounded-lg border border-gray-100 shadow-sm"><div className="flex justify-between items-center text-sm mb-2"><span className="text-gray-500">{rimoText(view.isMidRental ? '原車日租金' : '原訂單金額')}</span>
<span className="font-mono text-gray-400 line-through">{text("\n                                    ")}{rimoText(view.isMidRental ? '384' : '1,920')}{text("\n                                ")}</span></div>
<div className="flex justify-between items-center text-sm"><span className="text-gray-500">{rimoText(view.isMidRental ? '新車日租金' : '新方案金額')}</span>
{view.newPrice !== null ? <><span className="font-mono font-bold text-xl text-[color:var(--app-color-primary)]">{text("\n                                    ")}{rimoText(view.isMidRental ? view.formatNumber(view.newPrice / 5) : view.formatNumber(view.newPrice))}{text("\n                                ")}</span></> : <><span className="text-gray-300 font-mono">{text("----")}</span></>}</div></div>
<div className="flex justify-between items-center px-2"><span className="text-gray-800 font-medium text-sm">{text("\n                                預計差價 ")}{rimoText(view.isMidRental ? `(剩餘 ${view.remainingDays} 天)` : '')}{text("\n                            ")}</span>
<div className="flex items-center gap-1">{view.newPrice !== null && view.priceDiff !== 0 ? <><span className={rimoClass(["text-xs px-1.5 py-0.5 rounded", rimoClass(view.priceDiff > 0 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600')])}>{text("\n                                    ")}{rimoText(view.isMonthlyBilling ? view.priceDiff > 0 ? '月結調增' : '月結調減' : view.priceDiff > 0 ? '需補款' : '需退款')}{text("\n                                ")}</span></> : null}
<span className={rimoClass(["font-bold text-lg", rimoClass(view.priceDiff > 0 ? 'text-red-500' : view.priceDiff < 0 ? 'text-green-500' : 'text-gray-300')])}>{text("\n                                    ")}{rimoText(view.newPrice !== null ? (view.priceDiff > 0 ? '+' : '') + view.formatNumber(view.priceDiff) : '--')}{text("\n                                ")}</span></div></div>
{view.newPrice !== null && view.isGroupChanged ? <><div className="bg-[color:var(--app-color-primary-light-9)] p-3 rounded-lg border border-[color:var(--app-color-primary-light-8)]"><div className="mb-2 font-bold text-xs text-[color:var(--app-color-primary-active)] flex items-center gap-1"><RimoElement kind="el-icon"><RimoIcon name="Operation" /></RimoElement>
{text(" 差價處理規則\n                            ")}</div>
<RimoElement kind="el-radio-group" modelValue={view.priceHandling} onModelChange={value => {
                    model.write(["priceHandling"], value);
                  }} className="flex flex-col gap-2 w-full"><RimoElement kind="el-radio" label="diff" size="small" className="!mr-0 w-full !h-auto py-1"><span className="text-xs text-gray-700">{text("多退少補 (標準)")}</span></RimoElement>
<RimoElement kind="el-radio" label="free" size="small" className="!mr-0 w-full !h-auto py-1" disabled={view.priceDiff <= 0}><span className="text-xs text-gray-700">{text("免費升等 (不補差價)")}</span></RimoElement></RimoElement>
<div className={rimoClass(["mt-2 text-xs p-2 rounded-md", rimoClass(view.priceHandling === 'free' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-orange-50 text-orange-700 border border-orange-100')])}><RimoElement kind="el-icon" className="mr-1"><RimoIcon name="InfoFilled" /></RimoElement>
{text("\n                                    ")}{rimoText(view.priceHandling === 'free' ? '免費升等：保留原優惠方案，按原價計費' : view.isMonthlyBilling ? '企業月結：差價進入最終企業賬單' : '多退少補：需重新選擇優惠方案')}{text("\n                            ")}</div></div></> : null}
{view.newPrice !== null && !view.isGroupChanged ? <><div className="bg-green-50 p-3 rounded-lg border border-green-100"><div className="flex items-center gap-2 text-green-700 text-xs"><RimoElement kind="el-icon"><RimoIcon name="CircleCheck" /></RimoElement>
<span className="font-medium">{text("同車組換車，保留原優惠方案，價格不變")}</span></div></div></> : null}</div>
<div className="mt-4 pt-4 border-t border-gray-200"><RimoElement kind="el-select" modelValue={view.redirectionReason} onModelChange={value => {
                model.write(["redirectionReason"], value);
              }} placeholder="選擇改派原因" className="w-full mb-3" size="large">{rimoEntries(view.redirectionReasons).map(([reason], _itemIndex) => <Fragment key={reason.value}><RimoElement kind="el-option" key={reason.value} label={reason.label} value={reason.value}></RimoElement></Fragment>)}</RimoElement>
<RimoElement kind="el-input" modelValue={view.redirectionNote} onModelChange={value => {
                model.write(["redirectionNote"], value);
              }} placeholder={view.priceHandling === 'free' || view.redirectionReason === 'other' ? '請填寫原因說明（必填）' : '填寫改派備註（可選）'} type="textarea" rows={2} resize="none" className="mb-3 text-sm"></RimoElement>
<div className="flex gap-3"><RimoElement kind="el-button" onClick={_event => {
                  model.write(["redirectionModalVisible"], false);
                }} className="flex-1">{text("取消")}</RimoElement>
<RimoElement kind="el-button" type="primary" onClick={event => {
                  view.confirmRedirection?.(event);
                }} disabled={!view.selectedVehicleId} className="flex-1">{text("\n                                確認改派\n                            ")}</RimoElement></div></div></div></div></>}</RimoElement>
<RimoElement kind="el-dialog" modelValue={view.showDamageTypeDialog} onModelChange={value => {
      model.write(["showDamageTypeDialog"], value);
    }} title="添加異常/損傷記錄" width="500" alignCenter={true} className="rounded-2xl order-detail-overlay" appendToBody={true} destroyOnClose={true} slots={{
      "footer": _slot => <><div className="dialog-footer flex gap-3 pt-2"><RimoElement kind="el-button" onClick={_event => {
            model.write(["showDamageTypeDialog"], false);
          }} size="large" className="flex-1">{text("取消")}</RimoElement>
<RimoElement kind="el-button" type="warning" onClick={event => {
            view.confirmAddDamage?.(event);
          }} size="large" className="flex-1 shadow-lg shadow-orange-500/20">{text("\n                        確認添加\n                    ")}</RimoElement></div></>
    }}>{() => <><div className="space-y-5 px-1"><div><div className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2"><span className="w-1 h-4 bg-orange-500 rounded-full"></span>
{text("\n                        選擇異常類型\n                    ")}</div>
<div className="grid grid-cols-2 gap-3" data-rimo-grid="2">{rimoEntries(view.damageCategories).map(([cat], _itemIndex) => <Fragment key={cat.value}><div key={cat.value} className={rimoClass(["relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 flex flex-col items-center justify-center gap-2 group", rimoClass(view.newDamage.category === cat.value ? 'border-orange-500 bg-orange-50/50 text-orange-600 shadow-sm' : 'border-gray-100 bg-white text-gray-500 hover:border-orange-200 hover:bg-orange-50/30')])} onClick={_event => {
                  model.write(["newDamage", "category"], cat.value);
                }}><div className={rimoClass(["w-10 h-10 rounded-full flex items-center justify-center transition-colors", rimoClass(view.newDamage.category === cat.value ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-400 group-hover:bg-orange-100 group-hover:text-orange-500')])}><RimoElement kind="el-icon" className="text-xl"><RimoIcon name={cat.icon} /></RimoElement></div>
<span className="text-sm font-medium">{rimoText(cat.label)}</span>
{view.newDamage.category === cat.value ? <><div className="absolute top-2 right-2 text-orange-500"><RimoElement kind="el-icon"><RimoIcon name="CircleCheckFilled" /></RimoElement></div></> : null}</div></Fragment>)}</div></div>
<div><div className="text-sm font-bold text-gray-700 mb-2 flex items-center gap-2"><span className="w-1 h-4 bg-orange-500 rounded-full"></span>
{text("\n                        損傷具體位置/名稱\n                    ")}</div>
<RimoElement kind="el-input" modelValue={view.newDamage.type} onModelChange={value => {
              model.write(["newDamage", "type"], value);
            }} placeholder="例如：左前門刮痕、右後尾燈破損..." size="large" slots={{
              "prefix": _slot => <><RimoElement kind="el-icon" className="text-gray-400"><RimoIcon name="EditPen" /></RimoElement></>
            }}></RimoElement></div></div></>}</RimoElement>
<RimoElement kind="el-dialog" modelValue={view.feeModalVisible} onModelChange={value => {
      model.write(["feeModalVisible"], value);
    }} title="費用管理" width="1180px" destroyOnClose={true} top="2vh" className="rounded-xl overflow-hidden custom-modal order-detail-overlay">{() => <><div className="p-5"><div className="flex justify-between items-center mb-4" data-rimo-layout="toolbar"><div className="flex items-center gap-3"><div><div className="font-bold text-gray-900">{text("訂單費用臺賬")}</div>
<div className="text-xs text-gray-500">{text("統一查看費用項、資金記錄、追繳、減免與審計日誌")}</div></div></div>
<RimoElement kind="el-button" type="primary" icon="Plus" onClick={event => {
              view.openNewFeeDialog?.(event);
            }}>{text("添加費用")}</RimoElement></div>
<div className={rimoClass(["mb-4 rounded-lg border px-4 py-3 text-sm", rimoClass(view.isMonthlyBilling ? 'bg-[color:var(--app-color-primary-light-9)] border-[color:var(--app-color-primary-light-8)] text-[color:var(--app-color-primary-hover)]' : 'bg-gray-50 border-gray-100 text-gray-600')])}>{text("\n                    ")}{rimoText(view.isMonthlyBilling ? '企業月結訂單：費用統一進入企業賬單，不展示客戶通知支付、收款、退款和催收提醒。' : '客戶自付訂單：待收費用可收款，已收費用可退款，完成後追繳先通知客戶。')}{text("\n                ")}</div>
<div className="grid grid-cols-4 gap-3 mb-4" data-rimo-grid="4"><div className="rounded-lg border border-gray-200 bg-white px-4 py-3"><div className="text-xs text-gray-500">{text("費用合計")}</div>
<div className="mt-1 font-mono text-lg font-bold text-gray-900">{text("¥")}{rimoText(view.formatNumber(view.feeSummary.total))}</div></div>
<div className="rounded-lg border border-gray-200 bg-white px-4 py-3"><div className="text-xs text-gray-500">{rimoText(view.isMonthlyBilling ? '企業掛賬' : '已收金額')}</div>
<div className={rimoClass(["mt-1 font-mono text-lg font-bold", rimoClass(view.isMonthlyBilling ? 'text-[color:var(--app-color-primary)]' : 'text-green-600')])}>{text("\n                            ¥")}{rimoText(view.formatNumber(view.isMonthlyBilling ? view.feeSummary.monthly : view.feeSummary.paid))}{text("\n                        ")}</div></div>
<div className="rounded-lg border border-gray-200 bg-white px-4 py-3"><div className="text-xs text-gray-500">{rimoText(view.isMonthlyBilling ? '客戶應收' : '待收金額')}</div>
<div className={rimoClass(["mt-1 font-mono text-lg font-bold", rimoClass(view.isMonthlyBilling || view.feeSummary.pending === 0 ? 'text-gray-500' : 'text-orange-600')])}>{text("\n                            ¥")}{rimoText(view.formatNumber(view.isMonthlyBilling ? 0 : view.feeSummary.pending))}{text("\n                        ")}</div></div>
<div className="rounded-lg border border-gray-200 bg-white px-4 py-3"><div className="text-xs text-gray-500">{text("已減免")}</div>
<div className="mt-1 font-mono text-lg font-bold text-gray-700">{text("¥")}{rimoText(view.formatNumber(view.feeSummary.waived))}</div></div></div>
<div className="flex flex-wrap gap-2 mb-4 pb-3 border-b border-gray-100"><div className="flex gap-2 mr-4 pr-4 border-r border-gray-200">{rimoEntries(view.feePhaseFilters).map(([filter], _itemIndex) => <Fragment key={filter.value}><RimoElement kind="el-button" key={filter.value} type={view.feePhaseFilter === filter.value ? 'primary' : ''} plain={view.feePhaseFilter !== filter.value} size="small" onClick={_event => {
                  model.write(["feePhaseFilter"], filter.value);
                }} className={rimoClass(filter.value === 'post' && view.feePhaseFilter !== 'post' ? 'text-orange-500 border-orange-200 hover:border-orange-300' : '')}>{filter.value === 'post' ? <><span className="flex items-center gap-1">{view.pendingPostCharges.length > 0 ? <><RimoElement kind="el-icon" className="text-orange-500"><RimoIcon name="WarningFilled" /></RimoElement></> : null}
{text("\n                                ")}{rimoText(filter.label)}{text("\n                                ")}
{view.pendingPostCharges.length > 0 ? <><RimoElement kind="el-badge" value={view.pendingPostCharges.length} type="warning" className="ml-1"></RimoElement></> : null}</span></> : <><span>{rimoText(filter.label)}</span></>}</RimoElement></Fragment>)}</div>
{rimoEntries(view.feeStatusFilters).map(([filter], _itemIndex) => <Fragment key={filter.value}><RimoElement kind="el-button" key={filter.value} type={view.feeStatusFilter === filter.value ? 'primary' : ''} plain={view.feeStatusFilter !== filter.value} size="small" onClick={_event => {
                model.write(["feeStatusFilter"], filter.value);
              }}>{text("\n                        ")}{rimoText(filter.label)}{text(" (")}{rimoText(view.getFilteredFeeCount(filter.value))}{text(")\n                    ")}</RimoElement></Fragment>)}</div>
<div className="border border-gray-200 rounded-lg overflow-hidden bg-white"><div className="grid grid-cols-[minmax(320px,1fr)_110px_110px_110px_150px_170px_28px] gap-3 px-4 py-2 bg-gray-50 text-xs font-medium text-gray-500"><div>{text("費用項")}</div>
<div className="text-right">{text("應收金額")}</div>
<div className="text-right">{text("已處理")}</div>
<div className="text-right">{text("待處理")}</div>
<div>{text("狀態")}</div>
<div className="text-right">{text("操作")}</div>
<div></div></div>
<div className="max-h-[540px] overflow-y-auto custom-scroll">{rimoEntries(view.filteredFeeItems).map(([fee], _itemIndex) => <Fragment key={fee.id}><div key={fee.id} className={rimoClass(["border-t border-gray-100 transition-colors", rimoClass({
                  'bg-orange-50/40': fee.isOverdue,
                  'bg-white': !fee.isOverdue
                })])}><div className="px-4 py-3 grid grid-cols-[minmax(320px,1fr)_110px_110px_110px_150px_170px_28px] gap-3 items-center cursor-pointer hover:bg-gray-50" onClick={_event => {
                    view.toggleFeeExpand(fee.id);
                  }}><div className="min-w-0"><div className="flex items-center gap-2 min-w-0"><span className={rimoClass(["px-1.5 py-0.5 rounded border text-xs", rimoClass(fee.phase === 'post' ? 'border-orange-200 text-orange-600 bg-orange-50' : 'border-gray-200 text-gray-500 bg-gray-50')])}>{text("\n                                        ")}{rimoText(fee.phase === 'post' ? '追繳' : '租期')}{text("\n                                    ")}</span>
<span className="px-1.5 py-0.5 rounded border border-gray-200 bg-white text-xs text-gray-500">{text("\n                                        ")}{rimoText(fee.source === 'system' ? '系統' : '人工')}{text("\n                                    ")}</span>
<span className="font-medium text-gray-900 truncate">{rimoText(fee.name)}</span></div>
<div className="mt-1 text-xs text-gray-500 truncate" title={fee.description}>{text("\n                                    ")}{rimoText(fee.description)}{text("\n                                ")}</div>
<div className="flex items-center gap-2 mt-1 text-xs text-gray-400"><span>{rimoText(fee.createdAt)}</span>
<span>{text("交易 ")}{rimoText(view.getTransactionsForFee(fee.id).length)}{text(" 筆")}</span>
{!view.isMonthlyBilling && fee.phase === 'post' && fee.notifyStatus === 'notified' ? <><span className="flex items-center gap-1 text-green-600"><RimoElement kind="el-icon"><RimoIcon name="Check" /></RimoElement>
{text("已通知 ")}{rimoText(fee.notifiedAt)}{text("\n                                    ")}</span></> : !view.isMonthlyBilling && fee.phase === 'post' && fee.notifyStatus === 'pending' ? <><span className="flex items-center gap-1 text-orange-600"><RimoElement kind="el-icon"><RimoIcon name="WarningFilled" /></RimoElement>
{text("待通知\n                                    ")}</span></> : null}
{view.isMonthlyBilling && fee.displayStatus === 'monthly_billing' ? <><span className="flex items-center gap-1 text-[color:var(--app-color-primary)]"><RimoElement kind="el-icon"><RimoIcon name="OfficeBuilding" /></RimoElement>
{text("企業賬單\n                                    ")}</span></> : null}
{!view.isMonthlyBilling && fee.reminder && fee.reminder.date ? <><span className={rimoClass(["flex items-center gap-1", rimoClass(fee.isOverdue ? 'text-red-500' : 'text-blue-500')])}><RimoElement kind="el-icon"><RimoIcon name="Bell" /></RimoElement>
{rimoText(fee.reminder.date)}{text("\n                                    ")}</span></> : null}</div></div>
<div className="text-right"><div className="font-mono font-bold text-gray-900">{text("¥")}{rimoText(view.formatNumber(fee.amount))}</div></div>
<div className="text-right">{view.isMonthlyBilling && fee.displayStatus === 'monthly_billing' ? <><div className="text-xs font-medium text-[color:var(--app-color-primary)]">{text("已掛賬")}</div></> : fee.status === 'waived' ? <><div className="text-xs font-medium text-gray-500">{text("已減免")}</div></> : <><div className="font-mono text-sm text-gray-700">{text("¥")}{rimoText(view.formatNumber(fee.paidAmount || 0))}</div></>}</div>
<div className="text-right">{view.isMonthlyBilling ? <><div className="font-mono text-sm text-gray-500">{text("¥0")}</div></> : <><div className={rimoClass(["font-mono text-sm", rimoClass(Math.max(0, fee.amount - (fee.paidAmount || 0)) > 0 ? 'text-orange-600' : 'text-gray-500')])}>{text("\n                                    ¥")}{rimoText(view.formatNumber(Math.max(0, fee.amount - (fee.paidAmount || 0))))}{text("\n                                ")}</div></>}</div>
<div><RimoElement kind="el-tag" type={view.getFeeStatusType(fee.displayStatus)} size="small" effect="plain">{text("\n                                    ")}{rimoText(view.getFeeStatusText(fee.displayStatus))}{text("\n                                ")}</RimoElement></div>
<div className="flex items-center justify-end gap-2" onClick={event => {
                      event.stopPropagation();
                    }}>{view.isMonthlyBilling && fee.displayStatus === 'monthly_billing' ? <><RimoElement kind="el-tag" type="primary" size="small" effect="plain">{text("月結掛賬")}</RimoElement></> : <><>{!view.isMonthlyBilling && fee.phase === 'post' && fee.notifyStatus === 'pending' ? <><RimoElement kind="el-button" type="warning" size="small" onClick={_event => {
                              view.notifyCustomerForCharge(fee);
                            }}><RimoElement kind="el-icon" className="mr-1"><RimoIcon name="Bell" /></RimoElement>
{text("通知客戶\n                                    ")}</RimoElement></> : null}
{!view.isMonthlyBilling && (fee.status === 'pending' || fee.status === 'partial') ? <><RimoElement kind="el-button" type="primary" size="small" onClick={_event => {
                              view.openCollectPayment(fee);
                            }}>{text("\n                                        收款\n                                    ")}</RimoElement></> : null}
{!view.isMonthlyBilling ? <><RimoElement kind="el-dropdown" trigger="click" onCommand={event => {
                              view.handleFeeCommand?.(event);
                            }} slots={{
                              "dropdown": _slot => <><RimoElement kind="el-dropdown-menu">{!view.isMonthlyBilling && fee.paidAmount > 0 ? <><RimoElement kind="el-dropdown-item" command={{
                                      type: 'refund',
                                      fee: fee
                                    }}><RimoElement kind="el-icon"><RimoIcon name="RefreshLeft" /></RimoElement>
{text("退款\n                                                ")}</RimoElement></> : null}
{!view.isMonthlyBilling && fee.source === 'manual' && fee.status === 'pending' ? <><RimoElement kind="el-dropdown-item" command={{
                                      type: 'edit',
                                      fee: fee
                                    }}><RimoElement kind="el-icon"><RimoIcon name="Edit" /></RimoElement>
{text("編輯\n                                                ")}</RimoElement></> : null}
{!view.isMonthlyBilling && fee.source === 'manual' && fee.status === 'pending' ? <><RimoElement kind="el-dropdown-item" command={{
                                      type: 'delete',
                                      fee: fee
                                    }} divided={true}><span className="text-red-500 flex items-center gap-1"><RimoElement kind="el-icon"><RimoIcon name="Delete" /></RimoElement>
{text("刪除\n                                                    ")}</span></RimoElement></> : null}
{!view.isMonthlyBilling && fee.status !== 'paid' && fee.status !== 'refunded' && fee.status !== 'waived' && fee.status !== 'released' && fee.status !== 'cancelled' && fee.status !== 'monthly_billing' ? <><RimoElement kind="el-dropdown-item" command={{
                                      type: 'reminder',
                                      fee: fee
                                    }} divided={true}><RimoElement kind="el-icon"><RimoIcon name="Bell" /></RimoElement>
{rimoText(fee.reminder ? '修改提醒' : '設置提醒')}{text("\n                                                ")}</RimoElement></> : null}
{!view.isMonthlyBilling && fee.reminder && !fee.reminder.notified ? <><RimoElement kind="el-dropdown-item" command={{
                                      type: 'markReminded',
                                      fee: fee
                                    }}><RimoElement kind="el-icon"><RimoIcon name="Check" /></RimoElement>
{text("標記已提醒\n                                                ")}</RimoElement></> : null}</RimoElement></>
                            }}><RimoElement kind="el-button" size="small" plain={true} className="px-2"><RimoElement kind="el-icon"><RimoIcon name="More" /></RimoElement></RimoElement></RimoElement></> : null}</></>}</div>
<RimoElement kind="el-icon" className={rimoClass(["text-gray-400 transition-transform", rimoClass({
                      'rotate-180': view.expandedFees.includes(fee.id)
                    })])}><RimoIcon name="ArrowDown" /></RimoElement></div>
<div hidden={!view.expandedFees.includes(fee.id)} className="border-t border-gray-100 bg-gray-50 px-4 py-3">{view.getTransactionsForFee(fee.id).length > 0 ? <><div className="mb-4"><div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">{text("交易記錄")}</div>
<div className="space-y-2">{rimoEntries(view.getTransactionsForFee(fee.id)).map(([txn], _itemIndex) => <Fragment key={txn.id}><div key={txn.id} className="bg-white rounded-lg border border-gray-100 px-3 py-2 flex items-center justify-between"><div className="flex items-center gap-3"><div className={rimoClass(["w-8 h-8 rounded-lg flex items-center justify-center", rimoClass(txn.type === 'monthly_bill' ? 'bg-[color:var(--app-color-primary-light-8)]' : txn.channelType === 'online' ? 'bg-green-100' : 'bg-amber-100')])}><RimoElement kind="el-icon" className={rimoClass(txn.type === 'monthly_bill' ? 'text-[color:var(--app-color-primary)]' : txn.channelType === 'online' ? 'text-green-600' : 'text-amber-600')}><RimoIcon name={txn.type === 'monthly_bill' ? 'OfficeBuilding' : txn.channelType === 'online' ? 'Iphone' : 'Wallet'} /></RimoElement></div>
<div><div className="flex items-center gap-2"><span className="text-sm font-medium text-gray-700">{rimoText(view.getChannelName(txn.channel))}</span>
{txn.type === 'refund' ? <><RimoElement kind="el-tag" type="danger" size="small">{text("退款")}</RimoElement></> : null}
{txn.type === 'monthly_bill' ? <><RimoElement kind="el-tag" type="primary" size="small">{text("已掛賬")}</RimoElement></> : null}</div>
<div className="text-xs text-gray-400">{rimoText(txn.refNo || '-')}{text(" | ")}{rimoText(txn.createdAt)}</div></div></div>
<div className="text-right"><span className={rimoClass(["font-mono font-semibold", rimoClass(txn.type === 'refund' ? 'text-red-500' : txn.type === 'pre_auth' ? 'text-blue-500' : txn.type === 'monthly_bill' ? 'text-[color:var(--app-color-primary)]' : 'text-green-600')])}>{text("\n                                                ")}{rimoText(txn.type === 'refund' ? '-' : txn.type === 'pre_auth' ? '' : '+')}{text("¥")}{rimoText(view.formatNumber(txn.amount))}{text("\n                                            ")}</span></div></div></Fragment>)}</div></div></> : <><div className="text-xs text-gray-400 text-center py-2 mb-3">{text("暫無交易記錄")}</div></>}</div></div></Fragment>)}
{view.filteredFeeItems.length === 0 ? <><div className="text-center py-8 text-gray-400"><RimoElement kind="el-icon" className="text-4xl mb-2"><RimoIcon name="Wallet" /></RimoElement>
<div>{text("暫無費用記錄")}</div></div></> : null}</div></div>
<div className="mt-4 pt-4 border-t border-gray-200"><div className="flex justify-between items-center mb-3" data-rimo-layout="toolbar"><div className="text-xs text-gray-500">{text("\n                            當前篩選 ")}{rimoText(view.filteredFeeItems.length)}{text(" 項 / 全部 ")}{rimoText(view.feeItems.length)}{text(" 項；點擊費用行查看關聯交易記錄。\n                        ")}</div>
<div className="flex gap-2"><RimoElement kind="el-button" size="small" plain={true} icon="List" onClick={_event => {
                  model.write(["showAuditLog"], !view.showAuditLog);
                }}>{text("\n                                ")}{rimoText(view.showAuditLog ? '隱藏日誌' : '操作日誌')}{text("\n                            ")}</RimoElement>
<RimoElement kind="el-button" onClick={_event => {
                  model.write(["feeModalVisible"], false);
                }}>{text("關閉")}</RimoElement></div></div>
<div hidden={!view.showAuditLog} className="bg-gray-50 rounded-lg p-3 max-h-48 overflow-y-auto custom-scroll"><div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">{text("操作日誌")}</div>
<div className="space-y-1">{rimoEntries(view.feeAuditLogs).map(([log], _itemIndex) => <Fragment key={log.id}><div key={log.id} className="flex items-center gap-3 text-xs py-1 border-b border-gray-100 last:border-0"><span className="text-gray-400 w-28">{rimoText(log.time)}</span>
<RimoElement kind="el-tag" type={view.getLogActionType(log.action)} size="small" effect="plain" className="w-14 text-center">{text("\n                                    ")}{rimoText(log.action)}{text("\n                                ")}</RimoElement>
<span className="flex-1 text-gray-600">{rimoText(log.detail)}</span>
<span className="text-gray-400">{rimoText(log.operator)}</span></div></Fragment>)}</div>
{view.feeAuditLogs.length === 0 ? <><div className="text-xs text-gray-400 text-center py-2">{text("暫無操作日誌\n                        ")}</div></> : null}</div></div></div></>}</RimoElement>
<RimoElement kind="el-dialog" modelValue={view.addFeeDialogVisible} onModelChange={value => {
      model.write(["addFeeDialogVisible"], value);
    }} title={view.editingFee ? '編輯費用' : '添加費用'} width="450px" appendToBody={true} destroyOnClose={true} className="rounded-xl order-detail-overlay" slots={{
      "footer": _slot => <><div className="flex gap-3"><RimoElement kind="el-button" onClick={_event => {
            model.write(["addFeeDialogVisible"], false);
          }} className="flex-1">{text("取消")}</RimoElement>
<RimoElement kind="el-button" type="primary" onClick={event => {
            view.confirmAddFee?.(event);
          }} className="flex-1">{text("\n                        ")}{rimoText(view.editingFee ? '保存修改' : '確認添加')}{text("\n                    ")}</RimoElement></div></>
    }}>{() => <><div className="space-y-4"><div><div className="text-sm font-medium text-gray-700 mb-2">{text("費用類型")}</div>
<RimoElement kind="el-select" modelValue={view.newFeeData.type} onModelChange={value => {
              model.write(["newFeeData", "type"], value);
            }} className="w-full" placeholder="選擇費用類型">{rimoEntries(view.manualFeeTypes).map(([type], _itemIndex) => <Fragment key={type.value}><RimoElement kind="el-option" key={type.value} label={type.label} value={type.value}></RimoElement></Fragment>)}</RimoElement></div>
{view.newFeeData.type === 'other' ? <><div><div className="text-sm font-medium text-gray-700 mb-2">{text("自定義名稱")}</div>
<RimoElement kind="el-input" modelValue={view.newFeeData.customName} onModelChange={value => {
                model.write(["newFeeData", "customName"], value);
              }} placeholder="輸入費用名稱"></RimoElement></div></> : null}
<div><div className="text-sm font-medium text-gray-700 mb-2">{text("費用金額")}</div>
<RimoElement kind="el-input-number" modelValue={view.newFeeData.amount} onModelChange={value => {
              model.write(["newFeeData", "amount"], value);
            }} min={0} precision={0} className="w-full"></RimoElement></div>
<div><div className="text-sm font-medium text-gray-700 mb-2">{text("費用說明")}</div>
<RimoElement kind="el-input" modelValue={view.newFeeData.description} onModelChange={value => {
              model.write(["newFeeData", "description"], value);
            }} type="textarea" rows={2} placeholder="詳細說明..."></RimoElement></div>
<div><div className="text-sm font-medium text-gray-700 mb-2">{text("上傳憑證 (可選)")}</div>
<RimoElement kind="el-upload" action="#" autoUpload={false} limit={3} listType="picture-card" onExceed={view.handleExceed}><RimoElement kind="el-icon"><RimoIcon name="Plus" /></RimoElement></RimoElement></div></div></>}</RimoElement>
<RimoElement kind="el-dialog" modelValue={view.collectPaymentDialogVisible} onModelChange={value => {
      model.write(["collectPaymentDialogVisible"], value);
    }} title="收款" width="500px" appendToBody={true} destroyOnClose={true} className="rounded-xl order-detail-overlay" slots={{
      "footer": _slot => <><div className="flex gap-3"><RimoElement kind="el-button" onClick={_event => {
            model.write(["collectPaymentDialogVisible"], false);
          }} className="flex-1">{text("取消")}</RimoElement>
<RimoElement kind="el-button" type="success" onClick={event => {
            view.confirmCollectPayment?.(event);
          }} className="flex-1">{text("確認收款")}</RimoElement></div></>
    }}>{() => <><div className="space-y-4"><div className="bg-gray-50 rounded-lg p-4"><div className="flex justify-between items-center"><span className="text-gray-600">{text("費用項目")}</span>
<span className="font-bold text-gray-800">{rimoText(view.collectingFee?.name)}</span></div>
<div className="flex justify-between items-center mt-2"><span className="text-gray-600">{text("待收金額")}</span>
<span className="font-mono font-bold text-[color:var(--app-color-primary)] text-lg">{text("\n                            ¥")}{rimoText(view.formatNumber((view.collectingFee?.amount || 0) - (view.collectingFee?.paidAmount || 0)))}{text("\n                        ")}</span></div></div>
<div><div className="text-sm font-medium text-gray-700 mb-2">{text("收款渠道")}</div>
<RimoElement kind="el-radio-group" modelValue={view.paymentChannelType} onModelChange={value => {
              model.write(["paymentChannelType"], value);
            }} className="w-full"><RimoElement kind="el-radio-button" value="online" className="flex-1">{text("線上支付")}</RimoElement>
<RimoElement kind="el-radio-button" value="offline" className="flex-1">{text("線下收款")}</RimoElement></RimoElement></div>
{view.paymentChannelType === 'online' ? <><div className="grid grid-cols-3 gap-3" data-rimo-grid="3">{rimoEntries(view.onlineChannels).map(([ch], _itemIndex) => <Fragment key={ch.value}><div key={ch.value} className={rimoClass(["border-2 rounded-lg p-3 text-center cursor-pointer transition-all", rimoClass(view.selectedPaymentChannel === ch.value ? 'border-[color:var(--app-color-primary)] bg-[color:var(--app-color-primary-light-9)]' : 'border-gray-200 hover:border-[color:var(--app-color-primary-light-7)]')])} onClick={_event => {
                  model.write(["selectedPaymentChannel"], ch.value);
                }}><RimoElement kind="el-icon" className={rimoClass(["text-2xl mb-1", rimoClass(ch.color)])}><RimoIcon name={ch.icon} /></RimoElement>
<div className="text-sm font-medium">{rimoText(ch.label)}</div></div></Fragment>)}</div></> : null}
{view.paymentChannelType === 'offline' ? <><div className="space-y-3"><RimoElement kind="el-select" modelValue={view.selectedPaymentChannel} onModelChange={value => {
                model.write(["selectedPaymentChannel"], value);
              }} className="w-full" placeholder="選擇收款方式">{rimoEntries(view.offlineChannels).map(([ch], _itemIndex) => <Fragment key={ch.value}><RimoElement kind="el-option" key={ch.value} label={ch.label} value={ch.value}></RimoElement></Fragment>)}</RimoElement>
<div><div className="text-sm font-medium text-gray-700 mb-2">{text("交易流水號")}</div>
<RimoElement kind="el-input" modelValue={view.offlineRefNo} onModelChange={value => {
                  model.write(["offlineRefNo"], value);
                }} placeholder="POS機或銀行轉賬流水號"></RimoElement></div>
<div><div className="text-sm font-medium text-gray-700 mb-2">{text("上傳收據憑證 (可選)")}</div>
<RimoElement kind="el-upload" action="#" autoUpload={false} limit={1} showFileList={false}><RimoElement kind="el-button" icon="Upload">{text("選擇文件")}</RimoElement></RimoElement></div></div></> : null}
<div><div className="text-sm font-medium text-gray-700 mb-2">{text("收款金額")}</div>
<RimoElement kind="el-input-number" modelValue={view.collectAmount} onModelChange={value => {
              model.write(["collectAmount"], value);
            }} min={1} max={(view.collectingFee?.amount || 0) - (view.collectingFee?.paidAmount || 0)} className="w-full"></RimoElement></div></div></>}</RimoElement>
<RimoElement kind="el-dialog" modelValue={view.refundDialogVisible} onModelChange={value => {
      model.write(["refundDialogVisible"], value);
    }} title="退款" width="500px" appendToBody={true} destroyOnClose={true} className="rounded-xl order-detail-overlay" slots={{
      "footer": _slot => <><div className="flex gap-3"><RimoElement kind="el-button" onClick={_event => {
            model.write(["refundDialogVisible"], false);
          }} className="flex-1">{text("取消")}</RimoElement>
<RimoElement kind="el-button" type="danger" onClick={event => {
            view.confirmRefund?.(event);
          }} className="flex-1">{text("確認退款")}</RimoElement></div></>
    }}>{() => <><div className="space-y-4"><div><div className="text-sm font-medium text-gray-700 mb-2">{text("選擇原交易")}</div>
<RimoElement kind="el-select" modelValue={view.selectedRefundTxn} onModelChange={value => {
              model.write(["selectedRefundTxn"], value);
            }} className="w-full" placeholder="選擇需要退款的交易">{rimoEntries(view.refundableTxns).map(([txn], _itemIndex) => <Fragment key={txn.id}><RimoElement kind="el-option" key={txn.id} label={`${view.getChannelName(txn.channel)} ¥${txn.amount} (${txn.createdAt})`} value={txn.id}></RimoElement></Fragment>)}</RimoElement></div>
<div><div className="text-sm font-medium text-gray-700 mb-2">{text("退款金額")}</div>
<RimoElement kind="el-input-number" modelValue={view.refundAmount} onModelChange={value => {
              model.write(["refundAmount"], value);
            }} min={1} max={view.getSelectedTxnAmount()} className="w-full"></RimoElement>
<div className="text-xs text-gray-400 mt-1">{text("\n                        最大可退: ¥")}{rimoText(view.formatNumber(view.getSelectedTxnAmount()))}{text("\n                    ")}</div></div>
{view.selectedRefundTxn ? <><div><div className="text-sm font-medium text-gray-700 mb-2">{text("退款方式")}</div>
<div className="bg-gray-50 rounded-lg p-3">{view.getSelectedTxnChannelType() === 'online' ? <><><div className="flex items-center gap-2 text-green-600"><RimoElement kind="el-icon"><RimoIcon name="Iphone" /></RimoElement>
<span className="font-medium">{text("原路退回 (")}{rimoText(view.getChannelName(view.getSelectedTxnChannel()))}{text(")")}</span></div>
<div className="text-xs text-gray-400 mt-1">{text("將退款至客戶原支付賬戶")}</div></></> : <><><RimoElement kind="el-radio-group" modelValue={view.offlineRefundMethod} onModelChange={value => {
                      model.write(["offlineRefundMethod"], value);
                    }}><RimoElement kind="el-radio" value="cash">{text("現金退款")}</RimoElement>
<RimoElement kind="el-radio" value="transfer">{text("銀行轉賬")}</RimoElement></RimoElement>
{view.offlineRefundMethod === 'transfer' ? <><div className="mt-3"><RimoElement kind="el-input" modelValue={view.refundTransferInfo} onModelChange={value => {
                          model.write(["refundTransferInfo"], value);
                        }} placeholder="銀行賬號信息"></RimoElement></div></> : null}</></>}</div></div></> : null}
<div><div className="text-sm font-medium text-gray-700 mb-2">{text("退款原因")}</div>
<RimoElement kind="el-input" modelValue={view.refundReason} onModelChange={value => {
              model.write(["refundReason"], value);
            }} type="textarea" rows={2} placeholder="請填寫退款原因..."></RimoElement></div></div></>}</RimoElement>
<RimoElement kind="el-dialog" modelValue={view.reminderDialogVisible} onModelChange={value => {
      model.write(["reminderDialogVisible"], value);
    }} title="設置收款提醒" width="400px" appendToBody={true} destroyOnClose={true} className="rounded-xl order-detail-overlay" slots={{
      "footer": _slot => <><div className="flex gap-3"><RimoElement kind="el-button" onClick={_event => {
            model.write(["reminderDialogVisible"], false);
          }} className="flex-1">{text("取消")}</RimoElement>
<RimoElement kind="el-button" type="primary" onClick={event => {
            view.confirmReminder?.(event);
          }} className="flex-1">{text("確認設置")}</RimoElement></div></>
    }}>{() => <><div className="space-y-4"><div><div className="text-sm font-medium text-gray-700 mb-2">{text("提醒日期")}</div>
<RimoElement kind="el-date-picker" modelValue={view.reminderDate} onModelChange={value => {
              model.write(["reminderDate"], value);
            }} type="date" className="w-full" placeholder="選擇提醒日期" format="YYYY-MM-DD" valueFormat="YYYY-MM-DD"></RimoElement></div>
<div className="bg-blue-50 rounded-lg p-3 text-sm text-blue-600"><RimoElement kind="el-icon" className="mr-1"><RimoIcon name="InfoFilled" /></RimoElement>
{text("\n                    超過提醒日期後，該費用會以紅色高亮顯示\n                ")}</div></div></>}</RimoElement>
<RimoElement kind="el-dialog" modelValue={view.transactionsDialogVisible} onModelChange={value => {
      model.write(["transactionsDialogVisible"], value);
    }} title="交易記錄明細" width="900px" center={true} destroyOnClose={true} appendToBody={true} className="rounded-xl order-detail-overlay" slots={{
      "footer": _slot => <><div className="flex justify-between items-center" data-rimo-layout="toolbar"><div className="text-xs text-gray-400">{text("共 ")}{rimoText(view.enhancedTransactions.length)}{text(" 條交易記錄")}</div>
<div className="flex gap-3"><RimoElement kind="el-button" onClick={_event => {
              model.write(["transactionsDialogVisible"], false);
            }}>{text("關閉")}</RimoElement>
<RimoElement kind="el-button" type="primary" onClick={event => {
              view.exportTransactions?.(event);
            }}><RimoElement kind="el-icon" className="mr-1"><RimoIcon name="Download" /></RimoElement>
{text(" 導出 Excel\n                        ")}</RimoElement></div></div></>
    }}>{() => <><div className="space-y-4"><div className="grid grid-cols-3 gap-4" data-rimo-grid="3"><div className="bg-gray-50 rounded-lg p-4 text-center border border-gray-100"><div className="text-xs text-gray-500 mb-1">{rimoText(view.isMonthlyBilling ? '月結掛賬 (Monthly Bill)' : '總收入 (Total Revenue)')}</div>
<div className={rimoClass(["text-xl font-bold font-mono", rimoClass(view.isMonthlyBilling ? 'text-[color:var(--app-color-primary)]' : 'text-green-600')])}>{text("¥")}{rimoText(view.formatNumber(view.isMonthlyBilling ? view.txnSummary.totalMonthlyBill : view.txnSummary.totalIncome))}</div></div>
<div className="bg-gray-50 rounded-lg p-4 text-center border border-gray-100"><div className="text-xs text-gray-500 mb-1">{text("總退款 (Total Refund)")}</div>
<div className="text-xl font-bold text-red-500 font-mono">{text("¥")}{rimoText(view.formatNumber(view.txnSummary.totalRefund))}</div></div>
<div className="bg-[color:var(--app-color-primary-light-9)] rounded-lg p-4 text-center border border-[color:var(--app-color-primary-light-8)]"><div className="text-xs text-[color:var(--app-color-primary)] mb-1">{rimoText(view.isMonthlyBilling ? '賬單淨額 (Bill Total)' : '淨實收 (Net Actual)')}</div>
<div className="text-xl font-bold text-[color:var(--app-color-primary)] font-mono">{text("¥")}{rimoText(view.formatNumber(view.isMonthlyBilling ? view.txnSummary.netMonthlyBill : view.txnSummary.netIncome))}</div></div></div>
<RimoElement kind="el-table" data={view.enhancedTransactions} stripe={true} border={true} style={rimoStyle("width: 100%")} height="450"><RimoElement kind="el-table-column" prop="createdAt" label="交易時間" width="160" sortable={true} fixed={true}></RimoElement>
<RimoElement kind="el-table-column" label="交易類型" width="120" slots={{
              "default": ({
                row
              }) => <><RimoElement kind="el-tag" type={view.getTxnTypeLabel(row.type, row.txnType).type} size="small" effect="dark">{text("\n                                ")}{rimoText(view.getTxnTypeLabel(row.type, row.txnType).text)}{text("\n                            ")}</RimoElement></>
            }}></RimoElement>
<RimoElement kind="el-table-column" label="金額" width="140" align="right" slots={{
              "default": ({
                row
              }) => <><span className={rimoClass(["font-mono font-bold", rimoClass(row.type === 'payment' ? 'text-green-600' : row.type === 'monthly_bill' ? 'text-[color:var(--app-color-primary)]' : row.type === 'pre_auth' ? 'text-blue-500' : row.type === 'waiver' ? 'text-gray-400 line-through decoration-gray-400' : 'text-red-500')])}>{text("\n                                ")}{rimoText(row.type === 'refund' || row.type === 'waiver' ? '-' : row.type === 'pre_auth' ? '' : '+')}{text(" ¥")}{rimoText(view.formatNumber(row.amount))}{text("\n                            ")}</span></>
            }}></RimoElement>
<RimoElement kind="el-table-column" label="支付方式" width="180" slots={{
              "default": ({
                row
              }) => <><div className="flex flex-col"><div className="flex items-center gap-1">{row.type === 'waiver' ? <><div className="flex items-center gap-1 text-gray-500"><RimoElement kind="el-icon"><RimoIcon name="Discount" /></RimoElement>
<span className="font-medium">{text("費用減免")}</span></div></> : row.type === 'monthly_bill' ? <><div className="flex items-center gap-1 text-[color:var(--app-color-primary)]"><RimoElement kind="el-icon"><RimoIcon name="OfficeBuilding" /></RimoElement>
<span className="font-medium">{text("企業月結掛賬")}</span></div></> : <><><RimoElement kind="el-icon" className={rimoClass(row.channelType === 'online' ? 'text-blue-500' : 'text-orange-500')}><RimoIcon name={row.channelType === 'online' ? 'Iphone' : 'Wallet'} /></RimoElement>
<span className="font-medium text-gray-800">{rimoText(view.getChannelName(row.channel))}</span></></>}</div>
{row.channel === 'credit_card' && row.cardInfo ? <><div className="text-xs text-gray-400 pl-5 font-mono">{text("\n                                    ")}{rimoText(row.cardInfo.brand)}{text(" **** ")}{rimoText(row.cardInfo.last4)}{text("\n                                ")}</div></> : row.type === 'monthly_bill' ? <><div className="text-xs text-[color:var(--app-color-primary)] pl-5">{text("\n                                    企業賬單\n                                ")}</div></> : row.type !== 'waiver' ? <><div className="text-xs text-gray-400 pl-5">{text("\n                                    ")}{rimoText(row.channelType === 'online' ? '線上支付' : '線下支付')}{text("\n                                ")}</div></> : <><div className="text-xs text-gray-400 pl-5">{text("\n                                    ")}{rimoText(row.remark || '系統操作')}{text("\n                                ")}</div></>}</div></>
            }}></RimoElement>
<RimoElement kind="el-table-column" prop="refNo" label="流水號" width="180" showOverflowTooltip={true}></RimoElement>
<RimoElement kind="el-table-column" label="關聯費用" width="150" showOverflowTooltip={true} slots={{
              "default": ({
                row
              }) => <>{row.fullFeeNames && row.fullFeeNames !== row.feeName ? <><RimoElement kind="el-tooltip" content={row.fullFeeNames} placement="top"><span className="text-gray-600 border-b border-dashed border-gray-300 cursor-help">{rimoText(row.feeName)}</span></RimoElement></> : <><span className="text-gray-600">{rimoText(row.feeName)}</span></>}</>
            }}></RimoElement>
<RimoElement kind="el-table-column" prop="operator" label="操作人" width="100"></RimoElement></RimoElement></div></>}</RimoElement>
<RimoElement kind="el-dialog" modelValue={view.extendModalVisible} onModelChange={value => {
      model.write(["extendModalVisible"], value);
    }} title={view.extendDialogTitle} width="680px" center={true} destroyOnClose={true} appendToBody={true} className="rounded-xl order-detail-overlay" slots={{
      "footer": _slot => <><div className="flex gap-3"><RimoElement kind="el-button" onClick={_event => {
            model.write(["extendModalVisible"], false);
          }} className="flex-1">{text("取消")}</RimoElement>
<RimoElement kind="el-button" type="primary" onClick={event => {
            view.confirmExtend?.(event);
          }} className="flex-1" disabled={!view.canConfirmExtend}>{text("確認延長")}</RimoElement></div></>
    }}>{() => <><div className="space-y-5"><div className="bg-gray-50 rounded-lg p-5 border border-gray-100"><div className="flex justify-between items-center mb-4"><div><div className="text-xs text-gray-400 mb-1">{text("當前還車時間")}</div>
<div className="font-bold text-gray-800 font-mono text-lg">{rimoText(view.formatDate(view.planData.returnTime))}{text("\n                            ")}</div></div>
<RimoElement kind="el-icon" className="text-gray-300"><RimoIcon name="Right" /></RimoElement>
<div className="text-right"><div className="text-xs text-gray-400 mb-1">{text("新還車時間")}</div>
<RimoElement kind="el-date-picker" modelValue={view.extendData.newReturnTime} onModelChange={value => {
                  model.write(["extendData", "newReturnTime"], value);
                }} type="datetime" placeholder="選擇新時間" format="YYYY/MM/DD HH:mm" disabledDate={time => time.getTime() < view.planData.returnTime.getTime()} onChange={event => {
                  view.checkExtendConflict?.(event);
                }} className="!w-48"></RimoElement></div></div></div>
{view.orderStatus === 'overdue' ? <><div className="bg-red-50 border border-red-100 rounded-lg p-3 text-sm text-red-700 flex gap-2"><RimoElement kind="el-icon" className="mt-0.5"><RimoIcon name="WarningFilled" /></RimoElement>
{text("\n                    ")}{rimoText(view.isMonthlyBilling ? '當前訂單已逾期，補辦續租需通過風控校驗，費用進入企業月結賬單。' : '當前訂單已逾期，補辦續租必須完成立即收款並通過風控校驗。')}{text("\n                ")}</div></> : null}
{view.extendData.conflict ? <><div className="bg-red-50 border border-red-200 rounded-lg p-4 animate__animated animate__pulse"><div className="flex items-start gap-3"><RimoElement kind="el-icon" className="text-red-500 text-xl mt-0.5"><RimoIcon name="WarningFilled" /></RimoElement>
<div className="flex-1"><h4 className="font-bold text-gray-800 text-sm mb-1">{text("無法延長至所選時間")}</h4>
<p className="text-xs text-red-600 mb-3">{text("該車輛在 ")}{rimoText(view.extendData.conflict.nextOrder.pickupTime)}{text("\n                                有後續預訂 (單號: ")}{rimoText(view.extendData.conflict.nextOrder.orderId)}{text(")")}</p>
<div className="bg-white rounded border border-red-100 p-3 mb-3"><div className="text-xs text-gray-500 flex justify-between mb-1"><span>{text("最遲可延長時間 (含2h緩衝)")}</span>
<span className="font-bold text-gray-800">{rimoText(view.extendData.conflict.maxExtendTime)}</span></div>
<RimoElement kind="el-button" size="small" link={true} type="primary" onClick={event => {
                      view.useMaxExtendTime?.(event);
                    }}>{text("使用此時間")}</RimoElement></div>
<div className="flex gap-2"><RimoElement kind="el-button" type="danger" size="small" plain={true} onClick={event => {
                      view.resolveConflict?.(event);
                    }}>{text("快捷改派後續訂單")}</RimoElement></div></div></div></div></> : null}
{!view.extendData.conflict && view.extendData.newReturnTime ? <><div className="bg-[color:var(--app-color-primary-light-9)] border border-[color:var(--app-color-primary-light-8)] rounded-lg p-4"><div className="flex justify-between items-start"><div><div className="text-xs text-[color:var(--app-color-primary)] mb-1">{text("續租費用試算")}</div>
<div className="text-sm text-gray-700">{text("按當前訂單費率 ")}{rimoText(view.formatNumber(view.planData.hourlyRate))}{text(" 元/小時計算")}</div></div>
<div className="text-right"><div className="text-xl font-bold text-[color:var(--app-color-primary)] font-mono">{text("¥")}{rimoText(view.formatNumber(view.estimatedExtendFee))}{text("\n                            ")}</div>
<div className="text-xs text-[color:var(--app-color-primary-light-5)]">{text("約 ")}{rimoText(view.extendDurationText)}</div></div></div>
<div className="grid grid-cols-3 gap-2 mt-3 text-xs" data-rimo-grid="3"><div className="bg-white/70 border border-[color:var(--app-color-primary-light-8)] rounded-lg p-2"><div className="text-gray-400">{text("計費時長")}</div>
<div className="font-bold text-gray-800 mt-1">{rimoText(view.extendDurationText)}</div></div>
<div className="bg-white/70 border border-[color:var(--app-color-primary-light-8)] rounded-lg p-2"><div className="text-gray-400">{text("費用類型")}</div>
<div className="font-bold text-gray-800 mt-1">{text("續租租金")}</div></div>
<div className="bg-white/70 border border-[color:var(--app-color-primary-light-8)] rounded-lg p-2"><div className="text-gray-400">{text("費用階段")}</div>
<div className="font-bold text-gray-800 mt-1">{text("租期費用")}</div></div></div></div></> : null}
{!view.extendData.conflict && view.extendData.newReturnTime ? <><div className="border border-gray-100 rounded-lg p-4"><div className="flex justify-between items-center mb-3"><div className="text-sm font-bold text-gray-800">{text("結算方式")}</div>
{view.isMonthlyBilling ? <><RimoElement kind="el-tag" type="primary" size="small" effect="plain">{text("\n                            企業月結\n                        ")}</RimoElement></> : view.extendRequiresImmediatePay ? <><RimoElement kind="el-tag" type="warning" size="small" effect="plain">{text("\n                            必須立即收款\n                        ")}</RimoElement></> : null}</div>
{view.isMonthlyBilling ? <><div className="bg-[color:var(--app-color-primary-light-9)] border border-[color:var(--app-color-primary-light-8)] rounded-lg p-3 text-sm text-[color:var(--app-color-primary-hover)]">{text("\n                        續租費用隨還車最終應收進入企業月結賬單，本次不向客戶收款。\n                    ")}</div></> : <><RimoElement kind="el-radio-group" modelValue={view.extendData.settlementMode} onModelChange={value => {
                  model.write(["extendData", "settlementMode"], value);
                }} className="w-full"><RimoElement kind="el-radio-button" label="immediate">{text("立即收款")}</RimoElement>
<RimoElement kind="el-radio-button" label="return_settlement" disabled={view.extendRequiresImmediatePay}>{text("還車時結算")}</RimoElement></RimoElement></>}
{!view.isMonthlyBilling && view.extendRequiresImmediatePay ? <><div className="text-xs text-orange-600 mt-2">{text("\n                        觸發原因：")}{rimoText(view.extendImmediateReason)}{text("\n                    ")}</div></> : !view.isMonthlyBilling ? <><div className="text-xs text-gray-500 mt-2">{text("\n                        還車時結算會生成待收續租費用項，最終在還車賬單中統一處理。\n                    ")}</div></> : null}
{!view.isMonthlyBilling && view.extendData.settlementMode === 'immediate' ? <><div className="mt-3 bg-green-50 border border-green-100 rounded-lg p-3 flex justify-between items-center" data-rimo-layout="toolbar"><div><div className="text-sm font-bold text-green-700">{text("本次應收 ¥")}{rimoText(view.formatNumber(view.estimatedExtendFee))}</div>
<div className="text-xs text-green-600 mt-1">{text("\n                                ")}{rimoText(view.extendData.paymentPaid ? '已完成續租收款，可確認延長。' : '確認延長前需先完成續租收款。')}{text("\n                            ")}</div></div>
<RimoElement kind="el-button" type="success" size="small" disabled={view.extendData.paymentPaid || view.estimatedExtendFee <= 0} onClick={event => {
                    view.confirmExtendPayment?.(event);
                  }}>{text("\n                            ")}{rimoText(view.extendData.paymentPaid ? '已收款' : '確認收款')}{text("\n                        ")}</RimoElement></div></> : null}</div></> : null}
<div><div className="text-sm font-medium text-gray-700 mb-2">{text("備註說明")}</div>
<RimoElement kind="el-input" modelValue={view.extendData.remarks} onModelChange={value => {
              model.write(["extendData", "remarks"], value);
            }} type="textarea" rows={2} placeholder="請輸入延長用車的備註信息..." resize="none"></RimoElement></div></div></>}</RimoElement>
<RimoElement kind="el-dialog" modelValue={view.photoGalleryVisible} onModelChange={value => {
      model.write(["photoGalleryVisible"], value);
    }} title="車況照片詳情" width="800px" center={true} destroyOnClose={true} appendToBody={true} className="rounded-xl order-detail-overlay">{() => <><RimoElement kind="el-tabs" modelValue={view.photoGalleryTab} onModelChange={value => {
          model.write(["photoGalleryTab"], value);
        }} className="w-full"><RimoElement kind="el-tab-pane" label="外部照片 (6)" name="exterior"><div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-2">{rimoEntries(6).map(([i], _itemIndex) => <Fragment key={i}><div key={i} className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 relative group overflow-hidden cursor-pointer"><RimoElement kind="el-icon" className="text-3xl"><RimoIcon name="Picture" /></RimoElement>
<span className="absolute bottom-2 left-2 text-xs bg-black/50 text-white px-2 py-1 rounded">{text("外觀-")}{rimoText(i)}</span>
<div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors"></div></div></Fragment>)}</div></RimoElement>
<RimoElement kind="el-tab-pane" label="內部照片 (3)" name="interior"><div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-2">{rimoEntries(3).map(([i], _itemIndex) => <Fragment key={i}><div key={i} className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 relative group overflow-hidden cursor-pointer"><RimoElement kind="el-icon" className="text-3xl"><RimoIcon name="Picture" /></RimoElement>
<span className="absolute bottom-2 left-2 text-xs bg-black/50 text-white px-2 py-1 rounded">{text("內飾-")}{rimoText(i)}</span></div></Fragment>)}</div></RimoElement>
<RimoElement kind="el-tab-pane" label="異常標註 (2)" name="damage"><div className="grid grid-cols-2 gap-4 p-2" data-rimo-grid="2"><div className="bg-red-50 border border-red-100 rounded-lg p-3 flex gap-3"><div className="w-24 h-24 bg-gray-200 rounded flex-shrink-0 flex items-center justify-center text-gray-400"><RimoElement kind="el-icon" className="text-2xl"><RimoIcon name="Warning" /></RimoElement></div>
<div className="flex-1"><div className="font-bold text-red-600 text-sm mb-1">{text("左前保險槓刮擦")}</div>
<div className="text-xs text-gray-500 mb-2">{text("長約 5cm 劃痕，底漆露出")}</div>
<RimoElement kind="el-tag" size="small" type="danger">{text("外觀")}</RimoElement></div></div>
<div className="bg-red-50 border border-red-100 rounded-lg p-3 flex gap-3"><div className="w-24 h-24 bg-gray-200 rounded flex-shrink-0 flex items-center justify-center text-gray-400"><RimoElement kind="el-icon" className="text-2xl"><RimoIcon name="Warning" /></RimoElement></div>
<div className="flex-1"><div className="font-bold text-red-600 text-sm mb-1">{text("右後視鏡破損")}</div>
<div className="text-xs text-gray-500 mb-2">{text("外殼裂紋，鏡片完好")}</div>
<RimoElement kind="el-tag" size="small" type="danger">{text("外觀")}</RimoElement></div></div></div></RimoElement></RimoElement></>}</RimoElement>
<RimoElement kind="el-dialog" modelValue={view.signatureDialogVisible} onModelChange={value => {
      model.write(["signatureDialogVisible"], value);
    }} title="客戶電子簽名" width="500px" center={true} destroyOnClose={true} appendToBody={true} className="rounded-xl order-detail-overlay">{() => <><div className="flex flex-col items-center justify-center p-6 bg-white rounded-lg border border-dashed border-gray-300"><div className="w-full h-40 bg-gray-50 flex items-center justify-center text-gray-300 mb-4"><RimoElement kind="el-icon" className="text-6xl"><RimoIcon name="EditPen" /></RimoElement></div>
<p className="text-sm text-gray-500">{text("簽署時間: ")}{rimoText(view.currentSignatureTime)}</p>
<p className="text-xs text-gray-400 mt-1">{text("簽署人: ")}{rimoText(view.currentSignatureName)}</p></div></>}</RimoElement>
<RimoElement kind="el-dialog" modelValue={view.cancelOrderDialogVisible} onModelChange={value => {
      model.write(["cancelOrderDialogVisible"], value);
    }} title="取消訂單" width="550px" center={true} destroyOnClose={true} appendToBody={true} className="rounded-xl order-detail-overlay" slots={{
      "footer": _slot => <><div className="flex gap-3"><RimoElement kind="el-button" onClick={_event => {
            model.write(["cancelOrderDialogVisible"], false);
          }} className="flex-1">{text("暫不取消")}</RimoElement>
<RimoElement kind="el-button" type="danger" onClick={event => {
            view.confirmCancelOrder?.(event);
          }} className="flex-1">{text("確認取消訂單")}</RimoElement></div></>
    }}>{() => <><div className="space-y-6"><div className="bg-orange-50 rounded-lg p-4 border border-orange-100 flex gap-3"><RimoElement kind="el-icon" className="text-orange-500 text-xl mt-0.5"><RimoIcon name="WarningFilled" /></RimoElement>
<div><div className="font-bold text-gray-800 text-sm mb-1">{text("訂單取消後將無法恢復")}</div>
<div className="text-xs text-gray-500">{text("當前狀態: ")}
<span className="font-bold text-gray-700">{rimoText(view.orderStatusText)}</span></div>
<div className="text-xs text-gray-500">{text("當前距取車時間: ")}
<span className="font-bold text-gray-700">{rimoText(view.cancelOrderData.timeDiffText)}</span></div></div></div>
{!view.isMonthlyBilling ? <><div className="bg-gray-50 p-4 rounded-lg border border-gray-100"><div className="flex justify-between items-center mb-3"><div className="text-sm text-gray-500">{text("取消類型")}</div>
<div className="flex items-center gap-2"><RimoElement kind="el-tag" type={view.cancelOrderData.type === 'free' ? 'success' : 'danger'} effect="dark">{text("\n                                ")}{rimoText(view.cancelOrderData.type === 'free' ? '免責取消' : '有責取消')}{text("\n                            ")}</RimoElement>
{view.cancelOrderData.originalType !== 'free' ? <><RimoElement kind="el-checkbox" modelValue={view.cancelOrderData.isExempt} onModelChange={value => {
                      model.write(["cancelOrderData", "isExempt"], value);
                    }} onChange={event => {
                      view.updateCancelFee?.(event);
                    }} label="申請特殊減免" border={true} size="small" className="!mr-0 !ml-2"></RimoElement></> : null}</div></div>
<div className="space-y-2 border-t border-gray-200 border-dashed pt-3"><div className="flex justify-between text-xs"><span className="text-gray-500">{rimoText(view.isMonthlyBilling ? '預計月結金額' : '已支付金額')}</span>
<span className="font-mono">{rimoText(view.formatNumber(view.cancelOrderData.paidAmount))}</span></div>
<div className="flex justify-between text-xs"><span className="text-gray-500">{text("扣除取消費/手續費")}</span>
<span className="text-red-500 font-mono">{text("-")}{rimoText(view.formatNumber(view.cancelOrderData.cancelFee))}</span></div>
{!view.isMonthlyBilling ? <><div className="flex justify-between text-xs"><span className="text-gray-500">{text("預授權處理")}</span>
<span className="font-mono text-blue-600">{rimoText(view.cancelOrderData.preAuthAction)}</span></div></> : <><div className="flex justify-between text-xs"><span className="text-gray-500">{text("月結處理")}</span>
<span className="font-mono text-[color:var(--app-color-primary)]">{rimoText(view.cancelOrderData.cancelFee > 0 ? '取消費進入企業賬單' : '不生成企業掛賬')}</span></div></>}
<div className="flex justify-between text-sm font-bold pt-2 border-t border-gray-100"><span className="text-gray-800">{rimoText(view.isMonthlyBilling ? '企業掛賬金額' : '應退款金額')}</span>
<span className="text-green-600 font-mono">{text("¥")}{rimoText(view.formatNumber(view.cancelOrderData.refundAmount))}</span></div></div></div></> : <><div className="bg-[color:var(--app-color-primary-light-9)] p-4 rounded-lg border border-[color:var(--app-color-primary-light-8)]"><div className="flex justify-between items-center mb-3"><div className="text-sm text-[color:var(--app-color-primary-hover)] font-bold">{text("企業月結取消處理")}</div>
<RimoElement kind="el-tag" type="primary" color="var(--app-color-primary)" effect="dark" size="small">{text("企業月結")}</RimoElement></div>
<div className="space-y-2 border-t border-[color:var(--app-color-primary-light-8)] border-dashed pt-3"><div className="flex justify-between text-xs"><span className="text-[color:var(--app-color-primary)]">{text("預計月結金額")}</span>
<span className="font-mono text-[color:var(--app-color-primary-hover)]">{text("¥")}{rimoText(view.formatNumber(view.cancelOrderData.paidAmount))}</span></div>
<div className="flex justify-between text-xs"><span className="text-[color:var(--app-color-primary)]">{text("取消費")}</span>
<span className="font-mono text-[color:var(--app-color-primary-hover)]">{text("¥")}{rimoText(view.formatNumber(view.cancelOrderData.cancelFee))}</span></div>
<div className="flex justify-between text-xs"><span className="text-[color:var(--app-color-primary)]">{text("客戶支付/預授權")}</span>
<span className="font-mono text-[color:var(--app-color-primary-hover)]">{text("不處理")}</span></div>
<div className="flex justify-between text-sm font-bold pt-2 border-t border-[color:var(--app-color-primary-light-8)]"><span className="text-[color:var(--app-color-primary-hover)]">{text("企業掛賬金額")}</span>
<span className="text-[color:var(--app-color-primary-hover)] font-mono">{text("¥")}{rimoText(view.formatNumber(view.cancelOrderData.refundAmount))}</span></div></div></div></>}
{view.cancelOrderData.isExempt ? <><div className="bg-blue-50 p-3 rounded text-xs text-blue-600 mb-2"><RimoElement kind="el-icon" className="mr-1 relative top-0.5"><RimoIcon name="InfoFilled" /></RimoElement>
{text("\n                    已啓用特殊減免，取消違約金已免除。請務必填寫減免原因。\n                ")}</div></> : null}
<div><div className="text-sm text-gray-600 mb-2">{text("取消/減免原因")}</div>
<RimoElement kind="el-select" modelValue={view.cancelOrderData.reason} onModelChange={value => {
              model.write(["cancelOrderData", "reason"], value);
            }} placeholder="請選擇原因" className="w-full mb-3"><RimoElement kind="el-option" label="行程變更" value="行程變更"></RimoElement>
<RimoElement kind="el-option" label="價格問題" value="價格問題"></RimoElement>
<RimoElement kind="el-option" label="預訂錯誤" value="預訂錯誤"></RimoElement>
{view.cancelOrderData.isExempt ? <><RimoElement kind="el-option" label="系統故障 (減免)" value="系統故障"></RimoElement></> : null}
{view.cancelOrderData.isExempt ? <><RimoElement kind="el-option" label="客戶投訴補償 (減免)" value="客戶投訴補償"></RimoElement></> : null}
<RimoElement kind="el-option" label="其他" value="其他"></RimoElement></RimoElement>
<RimoElement kind="el-input" type="textarea" modelValue={view.cancelOrderData.remark} onModelChange={value => {
              model.write(["cancelOrderData", "remark"], value);
            }} placeholder="備註詳情..." rows={3}></RimoElement></div></div></>}</RimoElement>
<RimoElement kind="el-dialog" modelValue={view.noShowDialogVisible} onModelChange={value => {
      model.write(["noShowDialogVisible"], value);
    }} title="標記爽約" width="560px" center={true} destroyOnClose={true} appendToBody={true} className="rounded-xl order-detail-overlay" slots={{
      "footer": _slot => <><div className="flex gap-3"><RimoElement kind="el-button" onClick={_event => {
            model.write(["noShowDialogVisible"], false);
          }} className="flex-1">{text("暫不標記")}</RimoElement>
<RimoElement kind="el-button" type="danger" onClick={event => {
            view.confirmNoShow?.(event);
          }} className="flex-1">{text("確認標記爽約")}</RimoElement></div></>
    }}>{() => <><div className="space-y-5"><div className="bg-red-50 rounded-lg p-4 border border-red-100 flex gap-3"><RimoElement kind="el-icon" className="text-red-500 text-xl mt-0.5"><RimoIcon name="WarningFilled" /></RimoElement>
<div><div className="font-bold text-red-700 text-sm mb-1">{text("確認客戶逾期未取並標記爽約")}</div>
<div className="text-xs text-red-600">{text("確認後將釋放車輛資源，訂單進入“爽約”終態。")}</div></div></div>
<div className="bg-gray-50 p-4 rounded-lg border border-gray-100 space-y-2"><div className="flex justify-between text-xs"><span className="text-gray-500">{text("預計取車時間")}</span>
<span className="font-mono text-gray-700">{rimoText(view.noShowData.pickupTime)}</span></div>
<div className="flex justify-between text-xs"><span className="text-gray-500">{text("保留時長")}</span>
<span className="font-mono text-gray-700">{rimoText(view.noShowData.holdHours)}{text(" 小時")}</span></div>
<div className="flex justify-between text-xs"><span className="text-gray-500">{text("爽約費")}</span>
<span className="text-red-500 font-mono">{text("¥")}{rimoText(view.formatNumber(view.noShowData.feeAmount))}</span></div>
<div className="flex justify-between text-xs"><span className="text-gray-500">{text("費用規則")}</span>
<span className="text-gray-700">{text("固定金額")}</span></div>
{!view.isMonthlyBilling ? <><div className="flex justify-between text-xs"><span className="text-gray-500">{text("預授權可扣")}</span>
<span className="font-mono text-blue-600">{text("¥")}{rimoText(view.formatNumber(view.noShowData.preAuthAmount))}</span></div></> : null}
<div className="flex justify-between text-sm font-bold pt-2 border-t border-gray-100"><span className="text-gray-800">{rimoText(view.isMonthlyBilling ? '企業掛賬金額' : '待補繳金額')}</span>
<span className="text-orange-600 font-mono">{text("¥")}{rimoText(view.formatNumber(view.noShowData.paymentDue))}</span></div></div>
<div><div className="text-sm text-gray-600 mb-2">{text("聯繫結果")}</div>
<RimoElement kind="el-select" modelValue={view.noShowData.reason} onModelChange={value => {
              model.write(["noShowData", "reason"], value);
            }} placeholder="請選擇聯繫結果" className="w-full mb-3"><RimoElement kind="el-option" label="客戶確認不取車" value="客戶確認不取車"></RimoElement>
<RimoElement kind="el-option" label="多次聯繫無回應" value="多次聯繫無回應"></RimoElement>
<RimoElement kind="el-option" label="客戶超時未到店" value="客戶超時未到店"></RimoElement>
<RimoElement kind="el-option" label="其他" value="其他"></RimoElement></RimoElement>
<RimoElement kind="el-input" type="textarea" modelValue={view.noShowData.remark} onModelChange={value => {
              model.write(["noShowData", "remark"], value);
            }} placeholder="記錄聯繫時間、溝通結果或門店說明..." rows={3}></RimoElement></div></div></>}</RimoElement>
<RimoElement kind="el-dialog" modelValue={view.rejectOrderDialogVisible} onModelChange={value => {
      model.write(["rejectOrderDialogVisible"], value);
    }} title="拒絕履約" width="560px" center={true} destroyOnClose={true} appendToBody={true} className="rounded-xl order-detail-overlay" slots={{
      "footer": _slot => <><div className="flex gap-3"><RimoElement kind="el-button" onClick={_event => {
            model.write(["rejectOrderDialogVisible"], false);
          }} className="flex-1">{text("返回取車")}</RimoElement>
<RimoElement kind="el-button" type="danger" onClick={event => {
            view.confirmRejectOrder?.(event);
          }} className="flex-1">{text("確認拒絕履約")}</RimoElement></div></>
    }}>{() => <><div className="space-y-5"><div className="bg-red-50 rounded-lg p-4 border border-red-100 flex gap-3"><RimoElement kind="el-icon" className="text-red-500 text-xl mt-0.5"><RimoIcon name="WarningFilled" /></RimoElement>
<div><div className="font-bold text-red-700 text-sm mb-1">{text("取車資質不通過，拒絕交車")}</div>
<div className="text-xs text-red-600">{text("確認後將釋放車輛資源，訂單進入“已拒絕”終態。")}</div></div></div>
<div className="bg-gray-50 p-4 rounded-lg border border-gray-100 space-y-2"><div className="flex items-center justify-between text-xs gap-3" data-rimo-layout="field-row"><span className="text-gray-500">{text("拒絕履約費用")}</span>
<RimoElement kind="el-input-number" modelValue={view.rejectOrderData.feeAmount} onModelChange={value => {
                model.write(["rejectOrderData", "feeAmount"], value);
              }} min={0} step={50} controlsPosition="right" size="small" className="!w-36" onChange={event => {
                view.updateRejectFee?.(event);
              }}></RimoElement></div>
{!view.isMonthlyBilling ? <><div className="flex justify-between text-xs"><span className="text-gray-500">{text("預授權處理")}</span>
<span className="font-mono text-blue-600">{rimoText(view.rejectOrderData.preAuthAction)}</span></div></> : null}
{!view.isMonthlyBilling && view.rejectOrderData.paymentDue > 0 ? <><div className="flex justify-between text-xs"><span className="text-gray-500">{text("待補繳")}</span>
<span className="font-mono text-red-500">{text("¥")}{rimoText(view.formatNumber(view.rejectOrderData.paymentDue))}</span></div></> : null}
{view.isMonthlyBilling && view.rejectOrderData.feeAmount > 0 ? <><div className="flex justify-between text-xs"><span className="text-gray-500">{text("企業掛賬")}</span>
<span className="font-mono text-[color:var(--app-color-primary)]">{text("¥")}{rimoText(view.formatNumber(view.rejectOrderData.feeAmount))}</span></div></> : null}
<div className="text-xs text-gray-500 pt-2 border-t border-gray-100">{text("\n                        ")}{rimoText(view.isMonthlyBilling ? '企業月結訂單產生的拒絕履約費用統一進入企業賬單。' : '客戶責任可扣取費用；門店責任或風控無責場景釋放預授權。')}{text("\n                    ")}</div></div>
<div><div className="text-sm text-gray-600 mb-2">{text("拒絕原因")}</div>
<RimoElement kind="el-select" modelValue={view.rejectOrderData.reason} onModelChange={value => {
              model.write(["rejectOrderData", "reason"], value);
            }} placeholder="請選擇拒絕原因" className="w-full mb-3"><RimoElement kind="el-option" label="黑名單命中" value="黑名單命中"></RimoElement>
<RimoElement kind="el-option" label="駕照過期" value="駕照過期"></RimoElement>
<RimoElement kind="el-option" label="證件異常" value="證件異常"></RimoElement>
<RimoElement kind="el-option" label="預授權失敗" value="預授權失敗"></RimoElement>
<RimoElement kind="el-option" label="風控拒絕" value="風控拒絕"></RimoElement>
<RimoElement kind="el-option" label="其他" value="其他"></RimoElement></RimoElement>
<RimoElement kind="el-input" type="textarea" modelValue={view.rejectOrderData.remark} onModelChange={value => {
              model.write(["rejectOrderData", "remark"], value);
            }} placeholder="填寫拒絕說明、證件或風控結果..." rows={3}></RimoElement></div></div></>}</RimoElement>
<RimoElement kind="el-dialog" modelValue={view.closeOrderDialogVisible} onModelChange={value => {
      model.write(["closeOrderDialogVisible"], value);
    }} title="關閉訂單" width="550px" center={true} destroyOnClose={true} appendToBody={true} className="rounded-xl order-detail-overlay" slots={{
      "footer": _slot => <><div className="flex gap-3"><RimoElement kind="el-button" onClick={_event => {
            model.write(["closeOrderDialogVisible"], false);
          }} className="flex-1">{text("取消")}</RimoElement>
<RimoElement kind="el-button" type="danger" onClick={event => {
            view.confirmCloseOrder?.(event);
          }} className="flex-1" disabled={!view.closeOrderData.confirmed}>{text("確認關閉訂單")}</RimoElement></div></>
    }}>{() => <><div className="space-y-6"><div className="bg-red-50 rounded-lg p-4 border border-red-100 flex gap-3 animate__animated animate__pulse"><div className="text-red-500 text-3xl font-bold">{text("!")}</div>
<div><div className="font-bold text-red-600 text-base mb-1">{text("高風險操作警告")}</div>
{!view.isMonthlyBilling ? <><div className="text-xs text-red-500">{text("關閉訂單將")}
<span className="font-bold underline">{text("全額退還")}</span>
{text("所有已收款項，且操作不可逆！\n                        ")}</div></> : <><div className="text-xs text-red-500">{text("企業月結訂單關閉後不生成企業掛賬，操作不可逆。\n                        ")}</div></>}</div></div>
{!view.isMonthlyBilling ? <><div className="bg-gray-50 p-4 rounded-lg border border-gray-100"><div className="text-sm font-bold text-gray-700 mb-3 border-b border-gray-200 pb-2">{text("已收款項明細 (將全額退款)")}</div>
<div className="space-y-2 max-h-40 overflow-y-auto px-1 custom-scroll">{rimoEntries(view.closeOrderData.refundItems).map(([item], _itemIndex) => <Fragment key={item.id}><><div className="flex justify-between text-xs"><span className="text-gray-500">{rimoText(item.name)}</span>
<span className="font-mono text-gray-700">{rimoText(view.formatNumber(item.amount))}</span></div></></Fragment>)}
{view.closeOrderData.refundItems.length === 0 ? <><div className="text-center text-gray-400 py-2 text-xs">{text("\n                            無可退款項")}</div></> : null}</div>
<div className="flex justify-between text-base font-bold pt-3 mt-2 border-t border-gray-200"><span className="text-gray-800">{text("合計應退款")}</span>
<span className="text-red-500 font-mono">{text("¥")}{rimoText(view.formatNumber(view.closeOrderData.totalRefund))}</span></div>
<div className="flex justify-between text-xs pt-2 mt-2 border-t border-gray-100"><span className="text-gray-500">{text("預授權處理")}</span>
<span className="font-mono text-blue-600">{rimoText(view.closeOrderData.preAuthAction)}</span></div></div></> : <><div className="bg-[color:var(--app-color-primary-light-9)] p-4 rounded-lg border border-[color:var(--app-color-primary-light-8)] text-sm text-[color:var(--app-color-primary-hover)]">{text("\n                    企業月結訂單關閉後釋放車輛資源，不向客戶退款，也不生成企業掛賬。\n                ")}</div></>}
<div><div className="text-sm text-gray-600 mb-2">{text("關閉原因")}</div>
<RimoElement kind="el-select" modelValue={view.closeOrderData.reason} onModelChange={value => {
              model.write(["closeOrderData", "reason"], value);
            }} placeholder="請選擇原因" className="w-full mb-3"><RimoElement kind="el-option" label="車輛嚴重故障" value="車輛嚴重故障"></RimoElement>
<RimoElement kind="el-option" label="客戶重大投訴" value="客戶重大投訴"></RimoElement>
<RimoElement kind="el-option" label="不可抗力" value="不可抗力"></RimoElement>
<RimoElement kind="el-option" label="其他" value="其他"></RimoElement></RimoElement>
<RimoElement kind="el-input" type="textarea" modelValue={view.closeOrderData.remark} onModelChange={value => {
              model.write(["closeOrderData", "remark"], value);
            }} placeholder="備註詳情..." rows={3}></RimoElement></div>
<div className="flex items-center gap-2"><RimoElement kind="el-checkbox" modelValue={view.closeOrderData.confirmed} onModelChange={value => {
              model.write(["closeOrderData", "confirmed"], value);
            }} label={view.isMonthlyBilling ? '我確認已與企業或客戶溝通並同意關閉訂單' : '我確認已與客戶溝通並同意全額退款'} className="!mr-0 font-bold text-gray-700"></RimoElement></div></div></>}</RimoElement>
<RimoElement kind="el-dialog" modelValue={view.snapshotVersionDialogVisible} onModelChange={value => {
      model.write(["snapshotVersionDialogVisible"], value);
    }} title="快照版本詳情" width="760px" destroyOnClose={true} appendToBody={true} className="order-detail-overlay" slots={{
      "footer": _slot => <><RimoElement kind="el-button" onClick={_event => {
          model.write(["snapshotVersionDialogVisible"], false);
        }}>{text("關閉")}</RimoElement></>
    }}>{() => <>{view.selectedSnapshotVersion ? <><div className="space-y-4"><div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3"><div className="flex items-start justify-between gap-4"><div><div className="text-xs text-gray-400 mb-1">{text("版本號")}</div>
<div className="font-mono font-bold text-gray-900">{rimoText(view.selectedSnapshotVersion.version)}</div>
<div className="text-sm text-gray-700 mt-2">{rimoText(view.selectedSnapshotVersion.summary)}</div></div>
<div className="flex items-center gap-2"><RimoElement kind="el-tag" type={view.selectedSnapshotVersion.snapshotLevel === 'event' ? 'warning' : 'info'} effect="plain">{text("\n                                ")}{rimoText(view.selectedSnapshotVersion.snapshotLevel === 'event' ? '事件級快照' : '訂單基線快照')}{text("\n                            ")}</RimoElement>
<RimoElement kind="el-tag" type="info" effect="plain">{rimoText(view.selectedSnapshotVersion.sourcePage)}</RimoElement></div></div></div>
<RimoElement kind="el-descriptions" column={2} border={true} size="small"><RimoElement kind="el-descriptions-item" label="版本名稱">{rimoText(view.selectedSnapshotVersion.title)}</RimoElement>
<RimoElement kind="el-descriptions-item" label="快照時間">{rimoText(view.selectedSnapshotVersion.snapshotTime)}</RimoElement>
<RimoElement kind="el-descriptions-item" label="生效範圍">{rimoText(view.selectedSnapshotVersion.scope)}</RimoElement>
{view.selectedSnapshotVersion.snapshotLevel === 'event' ? <><RimoElement kind="el-descriptions-item" label="事件類型">{rimoText(view.selectedSnapshotVersion.eventType)}</RimoElement></> : null}</RimoElement>
{view.selectedSnapshotVersion.detailType === 'price' ? <><div><div className="font-bold text-gray-800 mb-2">{text("門市標準價")}</div>
<RimoElement kind="el-table" data={view.selectedSnapshotVersion.priceRows} border={true} size="small"><RimoElement kind="el-table-column" prop="group" label="車組名稱" minWidth="140" showOverflowTooltip={true}></RimoElement>
<RimoElement kind="el-table-column" prop="models" label="車型明細" minWidth="180" showOverflowTooltip={true}></RimoElement>
<RimoElement kind="el-table-column" prop="dailyPrice" label="標準日租金 (元/天)" width="150" align="center" showOverflowTooltip={true}></RimoElement>
<RimoElement kind="el-table-column" prop="mileageRule" label="里程規則" minWidth="220" showOverflowTooltip={true}></RimoElement>
<RimoElement kind="el-table-column" prop="lastUpdated" label="上次更新" width="120" align="center"></RimoElement></RimoElement></div></> : view.selectedSnapshotVersion.detailType === 'marketing' ? <><div className="space-y-4"><div className="font-bold text-gray-800">{text("方案基礎信息")}</div>
<RimoElement kind="el-table" data={view.selectedSnapshotVersion.basicInfo} border={true} size="small"><RimoElement kind="el-table-column" prop="label" label="配置項" width="170" showOverflowTooltip={true}></RimoElement>
<RimoElement kind="el-table-column" prop="value" label="內容" minWidth="300" showOverflowTooltip={true}></RimoElement></RimoElement>
<div><div className="font-bold text-gray-800 mb-2">{text("規則詳情")}</div>
<RimoElement kind="el-table" data={view.selectedSnapshotVersion.ruleRows} border={true} size="small"><RimoElement kind="el-table-column" prop="name" label="規則名稱" width="150" showOverflowTooltip={true}></RimoElement>
<RimoElement kind="el-table-column" prop="salesWindow" label="下單時間" minWidth="150" showOverflowTooltip={true}></RimoElement>
<RimoElement kind="el-table-column" prop="useWindow" label="用車時間" minWidth="170" showOverflowTooltip={true}></RimoElement>
<RimoElement kind="el-table-column" prop="advanceBooking" label="提前預訂" width="110" showOverflowTooltip={true}></RimoElement>
<RimoElement kind="el-table-column" prop="carGroup" label="適用車組" minWidth="140" showOverflowTooltip={true}></RimoElement>
<RimoElement kind="el-table-column" prop="membership" label="會員方案" minWidth="140" showOverflowTooltip={true}></RimoElement>
<RimoElement kind="el-table-column" prop="rentalTerm" label="租期限制" width="110" showOverflowTooltip={true}></RimoElement>
<RimoElement kind="el-table-column" prop="locationScope" label="適用地區/門店" minWidth="180" showOverflowTooltip={true}></RimoElement>
<RimoElement kind="el-table-column" prop="action" label="優惠動作" minWidth="220" showOverflowTooltip={true}></RimoElement></RimoElement></div></div></> : view.selectedSnapshotVersion.detailType === 'rules' ? <><div className="space-y-3"><RimoElement kind="el-table" data={view.getRuleSectionRows(view.selectedSnapshotVersion)} border={true} size="small"><RimoElement kind="el-table-column" prop="section" label="分組" width="150" showOverflowTooltip={true}></RimoElement>
<RimoElement kind="el-table-column" prop="label" label="規則項" width="180" showOverflowTooltip={true}></RimoElement>
<RimoElement kind="el-table-column" prop="value" label="設定值" minWidth="280" showOverflowTooltip={true}></RimoElement></RimoElement></div></> : view.selectedSnapshotVersion.detailType === 'event' ? <><div className="space-y-4"><RimoElement kind="el-table" data={view.getEventSummaryRows(view.selectedSnapshotVersion)} border={true} size="small"><RimoElement kind="el-table-column" prop="label" label="項目" width="150"></RimoElement>
<RimoElement kind="el-table-column" prop="value" label="內容" minWidth="340" showOverflowTooltip={true}></RimoElement></RimoElement>
{view.selectedSnapshotVersion.versionRows?.length ? <><div><div className="font-bold text-gray-800 mb-2">{text("命中版本")}</div>
<RimoElement kind="el-table" data={view.selectedSnapshotVersion.versionRows} border={true} size="small"><RimoElement kind="el-table-column" prop="label" label="版本項" minWidth="150" showOverflowTooltip={true}></RimoElement>
<RimoElement kind="el-table-column" prop="version" label="版本號" minWidth="170" showOverflowTooltip={true}></RimoElement>
<RimoElement kind="el-table-column" prop="remark" label="說明" minWidth="260" showOverflowTooltip={true}></RimoElement></RimoElement></div></> : null}
<div><div className="font-bold text-gray-800 mb-2">{text("商業條件變化")}</div>
<RimoElement kind="el-table" data={view.selectedSnapshotVersion.beforeAfterRows} border={true} size="small"><RimoElement kind="el-table-column" prop="label" label="變更項" minWidth="130" showOverflowTooltip={true}></RimoElement>
<RimoElement kind="el-table-column" prop="before" label="變更前" minWidth="220" showOverflowTooltip={true}></RimoElement>
<RimoElement kind="el-table-column" prop="after" label="變更後" minWidth="220" showOverflowTooltip={true}></RimoElement></RimoElement></div>
<div><div className="font-bold text-gray-800 mb-2">{text("差額結果")}</div>
<RimoElement kind="el-table" data={view.selectedSnapshotVersion.amountRows} border={true} size="small"><RimoElement kind="el-table-column" prop="label" label="項目" minWidth="150" showOverflowTooltip={true}></RimoElement>
<RimoElement kind="el-table-column" prop="amount" label="金額/結果" minWidth="150" showOverflowTooltip={true}></RimoElement>
<RimoElement kind="el-table-column" prop="remark" label="說明" minWidth="260" showOverflowTooltip={true}></RimoElement></RimoElement></div></div></> : <><div><div className="font-bold text-gray-800 mb-2">{text("增值服務")}</div>
<RimoElement kind="el-table" data={view.selectedSnapshotVersion.serviceRows} border={true} size="small"><RimoElement kind="el-table-column" prop="name" label="服務/規則項" minWidth="160" showOverflowTooltip={true}></RimoElement>
<RimoElement kind="el-table-column" prop="billing" label="計費方式" width="140" showOverflowTooltip={true}></RimoElement>
<RimoElement kind="el-table-column" prop="price" label="單價/規則值" minWidth="180" showOverflowTooltip={true}></RimoElement>
<RimoElement kind="el-table-column" prop="remark" label="快照說明" minWidth="220" showOverflowTooltip={true}></RimoElement></RimoElement></div></>}</div></> : null}</>}</RimoElement></RimoRoot>;
}