import { Fragment } from 'react';
import { useRimoModel, rimoEntries } from '../../lib/rimo-model.js';
import { RimoRoot, RimoIcon, rimoIcons, useRimoEnvironment } from '../../lib/RimoEnvironment.jsx';
import { RimoElement, rimoClass, rimoStyle, rimoText } from '../../lib/RimoElements.jsx';
import './store-orders.css';
function createPageState(model) {
  const _document = model.document;
  const window = model.window;
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
      onMount: onMounted,
      onDispose: onBeforeUnmount
    } = model;
    const {
      Van,
      Ticket,
      Document,
      DocumentAdd,
      PriceTag,
      Grid,
      ShoppingCart,
      Setting,
      Location,
      Briefcase,
      HomeFilled,
      List,
      Search,
      Refresh,
      Download,
      Plus,
      Sort,
      Filter,
      Shop,
      Timer
    } = rimoIcons;
    const orders = reactive([{
      orderId: "ZT2405060001",
      createTime: "2024-05-06 09:15",
      status: "pending_payment",
      clientType: "personal",
      customer: {
        name: "張偉",
        phone: "0912-345-001",
        level: "新用戶"
      },
      vehicle: {
        group: "經濟型",
        model: "Toyota Vios",
        plate: "未分配"
      },
      schedule: {
        start: "2024-05-07 10:00",
        end: "2024-05-08 10:00"
      },
      location: {
        pickup: "新北總店",
        return: "新北總店"
      },
      amount: 1200,
      dispatchStatus: "pending",
      paymentStatus: "unpaid",
      riskFlags: []
    }, {
      orderId: "ZT2405060015",
      createTime: "2024-05-06 09:45",
      status: "pending_payment",
      clientType: "corporate",
      billingMode: "customer_pay",
      customer: {
        name: "劉承恩",
        phone: "0988-456-210",
        level: "企業員工",
        dept: "市場部"
      },
      corporate: {
        id: "CORP_002",
        name: "TSMC 臺積電",
        shortName: "TSMC",
        billingType: "員工自付"
      },
      vehicle: {
        group: "經濟車組",
        model: "Toyota Yaris",
        plate: "未分配"
      },
      schedule: {
        start: "2024-05-07 13:00",
        end: "2024-05-08 13:00"
      },
      location: {
        pickup: "新北總店",
        return: "臺北車站店"
      },
      amount: 1380,
      dispatchStatus: "pending",
      paymentStatus: "unpaid",
      riskFlags: []
    }, {
      orderId: "ZT2405060002",
      createTime: "2024-05-05 14:30",
      status: "reserved",
      clientType: "corporate",
      customer: {
        name: "王小明",
        phone: "0912-345-678",
        level: "金牌會員",
        dept: "銷售部"
      },
      corporate: {
        id: "CORP_001",
        name: "Google Taiwan",
        shortName: "Google"
      },
      vehicle: {
        group: "SUV組",
        model: "Toyota RAV4",
        plate: "RIMO-888"
      },
      schedule: {
        start: "2024-05-07 09:30",
        end: "2024-05-10 18:00"
      },
      location: {
        pickup: "新北總店",
        return: "新北總店"
      },
      amount: 1920,
      dispatchStatus: "locked",
      paymentStatus: "deposit_paid",
      riskFlags: []
    }, {
      orderId: "ZT2405060028",
      createTime: "2024-05-05 15:20",
      status: "reserved",
      clientType: "personal",
      customer: {
        name: "周庭安",
        phone: "0920-118-520",
        level: "金牌會員"
      },
      vehicle: {
        group: "SUV組",
        model: "Honda CR-V",
        plate: "RIMO-620",
        currentStation: "新北總店 - 停車場A"
      },
      schedule: {
        start: "2024-05-08 10:00",
        end: "2024-05-10 10:00"
      },
      location: {
        pickup: "新北總店",
        return: "新北總店"
      },
      amount: 2600,
      dispatchStatus: "pre_assigned",
      paymentStatus: "deposit_paid",
      riskFlags: []
    }, {
      orderId: "ZT2405060010",
      createTime: "2024-05-05 16:10",
      status: "reserved",
      businessLine: "self_service",
      serviceMode: "self_service",
      clientType: "personal",
      customer: {
        name: "林佳琪",
        phone: "0968-222-555",
        level: "金牌會員"
      },
      vehicle: {
        group: "經濟車組",
        model: "Toyota Yaris",
        plate: "未分配"
      },
      schedule: {
        start: "2024-05-07 11:00",
        end: "2024-05-09 11:00"
      },
      location: {
        pickup: "新北總店",
        pickupStation: "新北總店 P3 自助據點",
        return: "新北總店",
        returnStation: "新北總店 P3 自助據點",
        returnStationId: "banqiao_p3"
      },
      locationStatus: {
        pickupStore: "normal",
        pickupStation: "normal",
        returnStore: "closed",
        returnStation: "closed"
      },
      amount: 3200,
      dispatchStatus: "pending",
      paymentStatus: "deposit_paid",
      riskFlags: []
    }, {
      orderId: "ZT2405060004",
      createTime: "2024-05-06 07:40",
      status: "pickup_overdue",
      customer: {
        name: "周怡君",
        phone: "0911-222-333",
        level: "銀牌會員"
      },
      vehicle: {
        group: "經濟型",
        model: "Toyota Vios",
        plate: "RIMO-118"
      },
      schedule: {
        start: "2024-05-06 08:30",
        end: "2024-05-08 08:30"
      },
      location: {
        pickup: "臺北車站店",
        return: "臺北車站店"
      },
      amount: 1680,
      dispatchStatus: "locked",
      paymentStatus: "deposit_paid",
      riskFlags: ["pickup_overdue_contact"]
    }, {
      orderId: "ZT2405060003",
      createTime: "2024-05-06 08:50",
      status: "inspecting",
      clientType: "corporate",
      customer: {
        name: "李小花",
        phone: "0922-333-444",
        level: "普通會員",
        dept: "研發部"
      },
      corporate: {
        id: "CORP_002",
        name: "TSMC 臺積電",
        shortName: "TSMC"
      },
      vehicle: {
        group: "豪華車組",
        model: "BMW 3 Series",
        plate: "RIMO-123"
      },
      schedule: {
        start: "2024-05-06 09:00",
        end: "2024-05-08 09:00"
      },
      location: {
        pickup: "臺北車站店",
        return: "臺北車站店"
      },
      amount: 4500,
      dispatchStatus: "locked",
      paymentStatus: "partial_paid",
      riskFlags: ["license_issue"]
    }, {
      orderId: "ZT2405040003",
      createTime: "2024-05-04 14:20",
      status: "renting",
      customer: {
        name: "李阿美",
        phone: "0922-123-456",
        level: "普通會員"
      },
      vehicle: {
        group: "經濟型",
        model: "Toyota Corolla",
        plate: "RIMO-101"
      },
      schedule: {
        start: "2024-05-04 15:00",
        end: "2024-05-07 10:00"
      },
      location: {
        pickup: "臺北車站店",
        return: "新北總店"
      },
      amount: 850,
      dispatchStatus: "locked",
      paymentStatus: "paid",
      riskFlags: []
    }, {
      orderId: "ZT2405060011",
      createTime: "2024-05-04 16:40",
      status: "renting",
      clientType: "corporate",
      billingMode: "monthly",
      customer: {
        name: "陳怡安",
        phone: "0977-222-909",
        level: "企業員工",
        dept: "採購部"
      },
      corporate: {
        id: "CORP_003",
        name: "Acer 宏碁",
        shortName: "Acer",
        billingType: "monthly"
      },
      vehicle: {
        group: "SUV組",
        model: "Toyota RAV4",
        plate: "RIMO-721"
      },
      schedule: {
        start: "2024-05-04 17:00",
        end: "2024-05-07 17:00"
      },
      location: {
        pickup: "新北總店",
        return: "新北總店"
      },
      amount: 4200,
      dispatchStatus: "locked",
      paymentStatus: "monthly_billing",
      riskFlags: []
    }, {
      orderId: "ZT2405040016",
      createTime: "2024-05-04 09:10",
      status: "renting",
      businessLine: "self_service",
      serviceMode: "self_service",
      clientType: "personal",
      customer: {
        name: "陳柏翰",
        phone: "0910-668-225",
        level: "白金會員"
      },
      vehicle: {
        group: "SUV組",
        model: "Toyota RAV4",
        plate: "RIMO-515"
      },
      schedule: {
        start: "2024-05-04 10:00",
        end: "2024-05-06 20:00"
      },
      location: {
        pickup: "新北總店",
        pickupStation: "新北總店 P3 自助據點",
        return: "臺北車站店",
        returnStation: "臺北車站店 B2 自助還車點",
        returnStationId: "taipei_b2"
      },
      locationStatus: {
        pickupStore: "normal",
        pickupStation: "normal",
        returnStore: "normal",
        returnStation: "normal"
      },
      amount: 2480,
      dispatchStatus: "locked",
      paymentStatus: "paid",
      riskFlags: []
    }, {
      orderId: "ZT2405020008",
      createTime: "2024-05-02 10:00",
      status: "renewing",
      customer: {
        name: "趙強",
        phone: "0933-111-222",
        level: "白金會員"
      },
      vehicle: {
        group: "商務車組",
        model: "Honda Odyssey",
        plate: "RIMO-777"
      },
      schedule: {
        start: "2024-05-02 11:00",
        end: "2024-05-09 11:00"
      },
      location: {
        pickup: "新北總店",
        return: "新北總店"
      },
      amount: 5600,
      dispatchStatus: "manual_reassigned",
      paymentStatus: "paid",
      riskFlags: []
    }, {
      orderId: "ZT2404280005",
      createTime: "2024-04-28 09:00",
      status: "overdue",
      customer: {
        name: "孫悟空",
        phone: "0987-654-321",
        level: "黑名單預警"
      },
      vehicle: {
        group: "性能組",
        model: "Tesla Model 3",
        plate: "RIMO-911"
      },
      schedule: {
        start: "2024-04-28 10:00",
        end: "2024-05-05 10:00"
      },
      location: {
        pickup: "新北總店",
        return: "新北總店"
      },
      amount: 8000,
      dispatchStatus: "locked",
      paymentStatus: "paid",
      riskFlags: ["blacklist"]
    }, {
      orderId: "ZT2405030031",
      createTime: "2024-05-03 16:20",
      status: "accident_processing",
      customer: {
        name: "高志豪",
        phone: "0988-222-111",
        level: "金牌會員"
      },
      vehicle: {
        group: "SUV組",
        model: "Honda CR-V",
        plate: "RIMO-520"
      },
      schedule: {
        start: "2024-05-03 18:00",
        end: "2024-05-07 18:00"
      },
      location: {
        pickup: "新北總店",
        return: "新北總店"
      },
      amount: 3600,
      dispatchStatus: "locked",
      paymentStatus: "paid",
      riskFlags: ["accident"]
    }, {
      orderId: "ZT2405050066",
      createTime: "2024-05-05 09:45",
      status: "no_show",
      customer: {
        name: "許家豪",
        phone: "0922-777-888",
        level: "普通會員"
      },
      vehicle: {
        group: "經濟型",
        model: "Honda Fit",
        plate: "未分配"
      },
      schedule: {
        start: "2024-05-05 14:00",
        end: "2024-05-06 14:00"
      },
      location: {
        pickup: "臺北車站店",
        return: "臺北車站店"
      },
      amount: 600,
      dispatchStatus: "pending",
      paymentStatus: "deposit_paid",
      riskFlags: ["pickup_overdue_contact"]
    }, {
      orderId: "ZT2405050012",
      createTime: "2024-05-05 08:00",
      status: "settlement_pending",
      customer: {
        name: "吳傑克",
        phone: "0955-666-777",
        level: "普通會員"
      },
      vehicle: {
        group: "經濟型",
        model: "Honda Fit",
        plate: "RIMO-202"
      },
      schedule: {
        start: "2024-05-05 09:00",
        end: "2024-05-06 09:00"
      },
      location: {
        pickup: "新北總店",
        return: "新北總店"
      },
      amount: 1500,
      dispatchStatus: "locked",
      paymentStatus: "partial_paid",
      riskFlags: []
    }, {
      orderId: "ZT2405050013",
      createTime: "2024-05-05 09:20",
      status: "settlement_pending",
      clientType: "corporate",
      billingMode: "monthly",
      customer: {
        name: "張育誠",
        phone: "0966-888-321",
        level: "企業員工",
        dept: "行政部"
      },
      corporate: {
        id: "CORP_003",
        name: "Acer 宏碁",
        shortName: "Acer",
        billingType: "monthly"
      },
      vehicle: {
        group: "商務車組",
        model: "Honda Odyssey",
        plate: "RIMO-771"
      },
      schedule: {
        start: "2024-05-05 10:00",
        end: "2024-05-06 10:00"
      },
      location: {
        pickup: "新北總店",
        return: "新北總店"
      },
      amount: 3650,
      dispatchStatus: "locked",
      paymentStatus: "monthly_billing",
      riskFlags: []
    }, {
      orderId: "ZT2405010022",
      createTime: "2024-05-01 10:30",
      status: "payment_due",
      customer: {
        name: "鄭錢",
        phone: "0966-123-123",
        level: "普通會員"
      },
      vehicle: {
        group: "豪華車組",
        model: "Benz C300",
        plate: "RIMO-300"
      },
      schedule: {
        start: "2024-05-01 14:00",
        end: "2024-05-04 14:00"
      },
      location: {
        pickup: "新北總店",
        return: "新北總店"
      },
      amount: 4800,
      dispatchStatus: "locked",
      paymentStatus: "payment_due",
      riskFlags: []
    }, {
      orderId: "ZT2405020018",
      createTime: "2024-05-02 11:15",
      status: "refund_pending",
      customer: {
        name: "馮寶寶",
        phone: "0977-444-555",
        level: "金牌會員"
      },
      vehicle: {
        group: "SUV組",
        model: "Nissan X-Trail",
        plate: "RIMO-404"
      },
      schedule: {
        start: "2024-05-02 12:00",
        end: "2024-05-04 12:00"
      },
      location: {
        pickup: "臺北車站店",
        return: "臺北車站店"
      },
      amount: 2800,
      dispatchStatus: "locked",
      paymentStatus: "refund_pending",
      riskFlags: []
    }, {
      orderId: "ZT2404300001",
      createTime: "2024-04-30 09:00",
      status: "completed",
      customer: {
        name: "陳大文",
        phone: "0933-987-654",
        level: "白金會員"
      },
      vehicle: {
        group: "商務車組",
        model: "Honda Odyssey",
        plate: "RIMO-999"
      },
      schedule: {
        start: "2024-04-30 10:00",
        end: "2024-05-02 10:00"
      },
      location: {
        pickup: "新北總店",
        return: "新北總店"
      },
      amount: 3200,
      dispatchStatus: "locked",
      paymentStatus: "paid",
      riskFlags: []
    }, {
      orderId: "ZT2404250018",
      createTime: "2024-04-25 10:00",
      status: "completed",
      customer: {
        name: "黃志明",
        phone: "0912-888-666",
        level: "金牌會員"
      },
      vehicle: {
        group: "SUV組",
        model: "Toyota RAV4",
        plate: "RIMO-666"
      },
      schedule: {
        start: "2024-04-25 11:00",
        end: "2024-04-28 11:00"
      },
      location: {
        pickup: "新北總店",
        return: "臺北車站店"
      },
      amount: 2800,
      dispatchStatus: "locked",
      paymentStatus: "paid",
      riskFlags: ["violation_pending"],
      postCharge: {
        count: 2,
        amount: 1885,
        status: "pending_notify"
      }
    }, {
      orderId: "ZT2404240021",
      createTime: "2024-04-24 15:40",
      status: "completed",
      customer: {
        name: "蔡佩芸",
        phone: "0939-220-168",
        level: "普通會員"
      },
      vehicle: {
        group: "經濟型",
        model: "Toyota Vios",
        plate: "RIMO-216"
      },
      schedule: {
        start: "2024-04-24 16:00",
        end: "2024-04-26 16:00"
      },
      location: {
        pickup: "臺北車站店",
        return: "臺北車站店"
      },
      amount: 1800,
      dispatchStatus: "locked",
      paymentStatus: "paid",
      riskFlags: ["violation_pending"],
      postCharge: {
        count: 1,
        amount: 680,
        status: "payment_due"
      }
    }, {
      orderId: "ZT2404240033",
      createTime: "2024-04-24 17:20",
      status: "completed",
      customer: {
        name: "何欣怡",
        phone: "0918-330-220",
        level: "普通會員"
      },
      vehicle: {
        group: "經濟型",
        model: "Honda Fit",
        plate: "RIMO-218"
      },
      schedule: {
        start: "2024-04-24 18:00",
        end: "2024-04-25 18:00"
      },
      location: {
        pickup: "臺北車站店",
        return: "臺北車站店"
      },
      amount: 1600,
      dispatchStatus: "locked",
      paymentStatus: "paid",
      riskFlags: ["violation_pending"],
      postCharge: {
        count: 1,
        amount: 420,
        status: "notified"
      }
    }, {
      orderId: "ZT2404230009",
      createTime: "2024-04-23 12:10",
      status: "completed",
      customer: {
        name: "郭俊宏",
        phone: "0921-909-777",
        level: "金牌會員"
      },
      vehicle: {
        group: "SUV組",
        model: "Honda CR-V",
        plate: "RIMO-620"
      },
      schedule: {
        start: "2024-04-23 13:00",
        end: "2024-04-24 13:00"
      },
      location: {
        pickup: "新北總店",
        return: "新北總店"
      },
      amount: 2300,
      dispatchStatus: "locked",
      paymentStatus: "paid",
      riskFlags: [],
      postCharge: {
        count: 1,
        amount: 360,
        status: "paid"
      }
    }, {
      orderId: "ZT2404300011",
      createTime: "2024-04-30 13:30",
      status: "completed",
      clientType: "corporate",
      billingMode: "monthly",
      customer: {
        name: "林佳琪",
        phone: "0968-222-555",
        level: "企業員工",
        dept: "行政部"
      },
      corporate: {
        id: "CORP_003",
        name: "Acer 宏碁",
        shortName: "Acer",
        billingType: "monthly"
      },
      vehicle: {
        group: "經濟車組",
        model: "Toyota Yaris",
        plate: "RIMO-118"
      },
      schedule: {
        start: "2024-04-30 14:00",
        end: "2024-05-02 14:00"
      },
      location: {
        pickup: "新北總店",
        return: "新北總店"
      },
      amount: 3200,
      dispatchStatus: "locked",
      paymentStatus: "monthly_billing",
      riskFlags: ["violation_pending"],
      postCharge: {
        count: 1,
        amount: 980,
        status: "monthly_billing"
      }
    }, {
      orderId: "ZT2405010005",
      createTime: "2024-05-01 08:30",
      status: "cancelled",
      customer: {
        name: "林小佳",
        phone: "0955-555-123",
        level: "普通會員"
      },
      vehicle: {
        group: "經濟型",
        model: "Honda Fit",
        plate: ""
      },
      schedule: {
        start: "2024-05-02 10:00",
        end: "2024-05-03 10:00"
      },
      location: {
        pickup: "臺北車站店",
        return: "臺北車站店"
      },
      amount: 0,
      dispatchStatus: "pending",
      paymentStatus: "refunded",
      riskFlags: []
    }, {
      orderId: "ZT2405010012",
      createTime: "2024-05-01 10:20",
      status: "cancelled",
      customer: {
        name: "蘇明傑",
        phone: "0936-551-208",
        level: "普通會員"
      },
      vehicle: {
        group: "經濟型",
        model: "Toyota Vios",
        plate: ""
      },
      schedule: {
        start: "2024-05-03 09:00",
        end: "2024-05-05 09:00"
      },
      location: {
        pickup: "臺北車站店",
        return: "臺北車站店"
      },
      amount: 0,
      dispatchStatus: "pending",
      paymentStatus: "refunded",
      riskFlags: ["violation_pending"],
      postCharge: {
        count: 1,
        amount: 300,
        status: "pending_notify"
      }
    }, {
      orderId: "ZT2405060099",
      createTime: "2024-05-06 13:00",
      status: "rejected",
      customer: {
        name: "黑煞",
        phone: "0900-000-000",
        level: "黑名單"
      },
      vehicle: {
        group: "豪華車組",
        model: "Porsche Macan",
        plate: ""
      },
      schedule: {
        start: "2024-05-07 10:00",
        end: "2024-05-08 10:00"
      },
      location: {
        pickup: "新北總店",
        return: "新北總店"
      },
      amount: 0,
      dispatchStatus: "pending",
      paymentStatus: "unpaid",
      riskFlags: ["blacklist"]
    }, {
      orderId: "ZT2405050072",
      createTime: "2024-05-05 17:30",
      status: "no_show",
      customer: {
        name: "洪若庭",
        phone: "0916-661-909",
        level: "普通會員"
      },
      vehicle: {
        group: "經濟型",
        model: "Toyota Yaris",
        plate: "未分配"
      },
      schedule: {
        start: "2024-05-05 13:00",
        end: "2024-05-07 13:00"
      },
      location: {
        pickup: "新北總店",
        return: "新北總店"
      },
      amount: 900,
      dispatchStatus: "pending",
      paymentStatus: "deposit_paid",
      riskFlags: [],
      postCharge: {
        count: 1,
        amount: 200,
        status: "payment_due"
      }
    }, {
      orderId: "ZT2405060108",
      createTime: "2024-05-06 15:20",
      status: "closed",
      customer: {
        name: "賴先生",
        phone: "0919-000-888",
        level: "白金會員"
      },
      vehicle: {
        group: "商務車組",
        model: "Honda Odyssey",
        plate: "RIMO-313"
      },
      schedule: {
        start: "2024-05-06 16:00",
        end: "2024-05-09 16:00"
      },
      location: {
        pickup: "新北總店",
        return: "新北總店"
      },
      amount: 0,
      dispatchStatus: "manual_reassigned",
      paymentStatus: "refunded",
      riskFlags: []
    }]);
    const activeTab = ref('all');
    const permissionDemoMode = ref('BOTH');
    const permissionDemoOptions = [{
      label: '全部授權',
      value: 'BOTH'
    }, {
      label: '僅門市租車',
      value: 'STORE'
    }, {
      label: '僅24h自助',
      value: 'SELF_SERVICE'
    }];
    const hasStorePermission = computed(() => ['BOTH', 'STORE'].includes(permissionDemoMode.value));
    const hasSelfServicePermission = computed(() => ['BOTH', 'SELF_SERVICE'].includes(permissionDemoMode.value));
    const getOrderMode = order => order.businessLine || 'store';
    const hasOrderModePermission = order => getOrderMode(order) === 'store' ? hasStorePermission.value : hasSelfServicePermission.value;
    const setPermissionDemoMode = mode => {
      permissionDemoMode.value = mode;
      activeTab.value = mode === 'BOTH' ? 'all' : mode === 'STORE' ? 'store' : 'self_service';
      activeStatFilter.value = '';
      currentPage.value = 1;
    };
    const allOrderCount = computed(() => orders.filter(hasOrderModePermission).length);
    const storeOrderCount = computed(() => orders.filter(o => getOrderMode(o) === 'store').length);
    const selfServiceOrderCount = computed(() => orders.filter(o => getOrderMode(o) === 'self_service').length);
    const handleNewOrder = command => {
      let type = command && command !== 'all' ? command : activeTab.value === 'self_service' ? 'self_service' : 'store';
      if (type === 'store' && !hasStorePermission.value) type = 'self_service';
      if (type === 'self_service' && !hasSelfServicePermission.value) type = 'store';
      window.location.href = `new_order.html?type=${type}`;
    };
    const filters = reactive({
      keyword: '',
      clientType: '',
      billingMode: '',
      status: [],
      postChargeStatus: '',
      riskFlag: '',
      dateRange: [],
      pickupStore: '',
      returnStore: '',
      vehicleGroup: ''
    });
    const statsView = ref('task');
    const activeStatFilter = ref('');
    const mockToday = '2024-05-06';
    const mockNow = new Date('2024-05-06T09:00:00');
    const statusMap = {
      pending_payment: {
        text: "待支付",
        type: "info",
        color: ""
      },
      reserved: {
        text: "已預訂",
        type: "primary",
        color: ""
      },
      pickup_overdue: {
        text: "逾期未取",
        type: "warning",
        color: "#E67E22"
      },
      inspecting: {
        text: "驗車中",
        type: "warning",
        color: ""
      },
      renting: {
        text: "用車中",
        type: "success",
        color: ""
      },
      renewing: {
        text: "續租中",
        type: "success",
        color: ""
      },
      overdue: {
        text: "逾期未還",
        type: "danger",
        color: ""
      },
      accident_processing: {
        text: "出險處理中",
        type: "danger",
        color: ""
      },
      no_show: {
        text: "爽約",
        type: "info",
        color: ""
      },
      settlement_pending: {
        text: "待結算",
        type: "warning",
        color: "#8E44AD"
      },
      payment_due: {
        text: "待補繳",
        type: "warning",
        color: "#E67E22"
      },
      refund_pending: {
        text: "待退款",
        type: "warning",
        color: "#E67E22"
      },
      completed: {
        text: "已完成",
        type: "info",
        color: ""
      },
      cancelled: {
        text: "已取消",
        type: "info",
        color: ""
      },
      rejected: {
        text: "已拒絕",
        type: "danger",
        color: ""
      },
      closed: {
        text: "已關閉",
        type: "danger",
        color: "#C0392B"
      }
    };
    const statusGroups = {
      group_todo: ['pending_payment', 'reserved', 'pickup_overdue'],
      group_active: ['inspecting', 'renting', 'renewing'],
      group_risk: ['overdue', 'accident_processing'],
      group_settlement: ['settlement_pending', 'payment_due', 'refund_pending'],
      group_history: ['completed', 'cancelled', 'no_show', 'rejected', 'closed']
    };
    const dispatchStatusMap = {
      pending: {
        text: "待派車",
        type: "warning",
        color: ""
      },
      pre_assigned: {
        text: "已預分配",
        type: "primary",
        color: ""
      },
      locked: {
        text: "已硬鎖定",
        type: "success",
        color: ""
      },
      manual_reassigned: {
        text: "人工改派",
        type: "warning",
        color: "#E67E22"
      },
      upgraded: {
        text: "免費升等",
        type: "success",
        color: "#16A34A"
      }
    };
    const paymentStatusMap = {
      unpaid: {
        text: "未支付",
        type: "warning",
        color: ""
      },
      deposit_paid: {
        text: "已收預授權",
        type: "primary",
        color: ""
      },
      monthly_billing: {
        text: "企業月結",
        type: "primary",
        color: "var(--app-color-primary)"
      },
      partial_paid: {
        text: "部分支付",
        type: "warning",
        color: "#E67E22"
      },
      paid: {
        text: "已結清",
        type: "success",
        color: ""
      },
      payment_due: {
        text: "待補繳",
        type: "danger",
        color: ""
      },
      refund_pending: {
        text: "待退款",
        type: "warning",
        color: "#E67E22"
      },
      refunded: {
        text: "已退款",
        type: "info",
        color: ""
      }
    };
    const postChargeStatusMap = {
      pending_notify: {
        text: "追繳待通知",
        type: "warning",
        color: ""
      },
      notified: {
        text: "追繳已通知",
        type: "warning",
        color: ""
      },
      payment_due: {
        text: "追繳待支付",
        type: "danger",
        color: ""
      },
      monthly_billing: {
        text: "企業月結追繳",
        type: "primary",
        color: "var(--app-color-primary)"
      },
      paid: {
        text: "追繳已結清",
        type: "success",
        color: ""
      }
    };
    const riskFlagMap = {
      blacklist: {
        text: "黑名單",
        type: "danger",
        color: ""
      },
      license_issue: {
        text: "證件異常",
        type: "warning",
        color: ""
      },
      dispatch_manual_required: {
        text: "人工調度",
        type: "danger",
        color: "#DC2626"
      },
      pickup_overdue_contact: {
        text: "需聯繫客戶",
        type: "warning",
        color: "#E67E22"
      },
      accident: {
        text: "事故上報",
        type: "danger",
        color: ""
      },
      violation_pending: {
        text: "違章待處理",
        type: "warning",
        color: "#E67E22"
      }
    };
    const searchPanelExpanded = ref(false);
    const filterToolbar = ref(null);
    const filterLayoutTier = ref(1);
    let filterResizeObserver = null;
    const updateFilterLayout = () => {
      const width = filterToolbar.value?.clientWidth || 0;
      if (width >= 1370) filterLayoutTier.value = 4;else if (width >= 1140) filterLayoutTier.value = 3;else if (width >= 980) filterLayoutTier.value = 2;else filterLayoutTier.value = 1;
    };
    onMounted(() => {
      filterResizeObserver = new ResizeObserver(updateFilterLayout);
      if (filterToolbar.value) filterResizeObserver.observe(filterToolbar.value);
      updateFilterLayout();
    });
    onBeforeUnmount(() => filterResizeObserver?.disconnect());
    const currentPage = ref(1);
    const pageSize = ref(50);
    const vehicleTree = computed(() => {
      const tree = {};
      orders.forEach(o => {
        const g = o.vehicle.group;
        const m = o.vehicle.model;
        if (!tree[g]) tree[g] = new Set();
        tree[g].add(m);
      });
      const result = [];
      Object.keys(tree).sort().forEach(g => {
        result.push({
          group: g,
          models: Array.from(tree[g]).sort()
        });
      });
      return result;
    });
    const vehicleSearch = ref('');
    const filteredVehicleTree = computed(() => {
      if (!vehicleSearch.value) return vehicleTree.value;
      const query = vehicleSearch.value.toLowerCase();
      return vehicleTree.value.map(item => {
        const groupMatch = item.group.toLowerCase().includes(query);
        const matchingModels = item.models.filter(m => m.toLowerCase().includes(query));
        if (groupMatch || matchingModels.length > 0) {
          return {
            group: item.group,
            models: groupMatch ? item.models : matchingModels
          };
        }
        return null;
      }).filter(Boolean);
    });
    const stores = computed(() => {
      const s = new Set();
      orders.forEach(o => {
        if (o.location && o.location.pickup) s.add(o.location.pickup);
        if (o.location && o.location.return) s.add(o.location.return);
      });
      s.add("新北總店");
      s.add("臺北車站店");
      return Array.from(s).sort();
    });
    const pickupFocusStatuses = ['pending_payment', 'reserved', 'pickup_overdue'];
    const returnFocusStatuses = ['renting', 'renewing', 'overdue'];
    const settlementFocusStatuses = ['settlement_pending', 'payment_due', 'refund_pending'];
    const toDateTime = value => value ? new Date(value.replace(' ', 'T')) : null;
    const isToday = value => !!value && value.startsWith(mockToday);
    const isWithinNextHours = (value, hours) => {
      const time = toDateTime(value);
      if (!time) return false;
      const diff = time.getTime() - mockNow.getTime();
      return diff >= 0 && diff <= hours * 60 * 60 * 1000;
    };
    const isPickupToday = order => pickupFocusStatuses.includes(order.status) && isToday(order.schedule?.start);
    const isPickupSoon = order => pickupFocusStatuses.includes(order.status) && isWithinNextHours(order.schedule?.start, 2);
    const isPickupProcessing = order => order.status === 'inspecting';
    const isReturnToday = order => returnFocusStatuses.includes(order.status) && isToday(order.schedule?.end);
    const isReturnSoon = order => returnFocusStatuses.includes(order.status) && isWithinNextHours(order.schedule?.end, 2);
    const isPickupOverdueTask = order => order.status === 'pickup_overdue';
    const isReturnOverdueTask = order => order.status === 'overdue';
    const isSettlementTask = order => settlementFocusStatuses.includes(order.status);
    const filteredOrders = computed(() => {
      return orders.filter(order => {
        const matchPermission = hasOrderModePermission(order);
        const matchBusinessLine = activeTab.value === 'all' ? true : activeTab.value === 'store' ? (order.businessLine || 'store') === 'store' : order.businessLine === activeTab.value;
        const matchKeyword = !filters.keyword || order.orderId.includes(filters.keyword) || order.customer.name.includes(filters.keyword) || order.customer.phone.includes(filters.keyword) || order.corporate && order.corporate.name.includes(filters.keyword) || order.vehicle.plate && order.vehicle.plate.toUpperCase().includes(filters.keyword.toUpperCase());
        const matchClientType = !filters.clientType || (filters.clientType === 'corporate' ? order.clientType === 'corporate' : order.clientType !== 'corporate');
        const matchBillingMode = !filters.billingMode || (filters.billingMode === 'monthly' ? isMonthlyBillingOrder(order) : !isMonthlyBillingOrder(order));
        let matchStatus = true;
        const selectedStatuses = Array.isArray(filters.status) ? filters.status.filter(Boolean) : filters.status ? [filters.status] : [];
        if (selectedStatuses.length > 0) {
          const expandedStatuses = new Set();
          selectedStatuses.forEach(status => {
            if (statusGroups[status]) {
              statusGroups[status].forEach(item => expandedStatuses.add(item));
            } else {
              expandedStatuses.add(status);
            }
          });
          matchStatus = expandedStatuses.has(order.status);
        }
        const matchPickupStore = !filters.pickupStore || order.location.pickup === filters.pickupStore;
        const matchReturnStore = !filters.returnStore || order.location.return === filters.returnStore;
        const matchPostCharge = !filters.postChargeStatus || (filters.postChargeStatus === 'any' ? !!order.postCharge : order.postCharge?.status === filters.postChargeStatus);
        const matchRiskFlag = !filters.riskFlag || (order.riskFlags || []).includes(filters.riskFlag);
        const matchStatFilter = !activeStatFilter.value || activeStatFilter.value === 'todo' && ['pending_payment', 'reserved', 'pickup_overdue'].includes(order.status) || activeStatFilter.value === 'active' && ['inspecting', 'renting', 'renewing'].includes(order.status) || activeStatFilter.value === 'settlement' && ['settlement_pending', 'payment_due', 'refund_pending'].includes(order.status) || activeStatFilter.value === 'risk' && (['overdue', 'accident_processing'].includes(order.status) || (order.riskFlags || []).length > 0) || activeStatFilter.value === 'monthly' && isMonthlyBillingOrder(order) || activeStatFilter.value === 'post_charge' && !!order.postCharge || activeStatFilter.value === 'due' && (['payment_due', 'refund_pending'].includes(order.status) || ['payment_due', 'pending_notify', 'notified'].includes(order.postCharge?.status)) || activeStatFilter.value === 'pickup_today' && isPickupToday(order) || activeStatFilter.value === 'pickup_2h' && isPickupSoon(order) || activeStatFilter.value === 'pickup_processing' && isPickupProcessing(order) || activeStatFilter.value === 'return_today' && isReturnToday(order) || activeStatFilter.value === 'return_2h' && isReturnSoon(order) || activeStatFilter.value === 'pickup_overdue_task' && isPickupOverdueTask(order) || activeStatFilter.value === 'return_overdue_task' && isReturnOverdueTask(order) || activeStatFilter.value === 'settlement_task' && isSettlementTask(order);
        let matchVehicle = true;
        if (filters.vehicleGroup) {
          if (filters.vehicleGroup.includes(':')) {
            const [type, val] = filters.vehicleGroup.split(':');
            if (type === 'group') {
              matchVehicle = order.vehicle.group === val;
            } else if (type === 'model') {
              matchVehicle = order.vehicle.model === val;
            }
          } else {
            matchVehicle = order.vehicle.group === filters.vehicleGroup;
          }
        }
        return matchPermission && matchBusinessLine && matchKeyword && matchStatus && matchPickupStore && matchReturnStore && matchVehicle && matchClientType && matchBillingMode && matchPostCharge && matchRiskFlag && matchStatFilter;
      });
    });
    const sortState = reactive({
      field: '',
      order: ''
    });
    const sortedOrders = computed(() => {
      let data = [...filteredOrders.value];
      if (sortState.field && sortState.order) {
        data.sort((a, b) => {
          const valA = sortState.field === 'start' ? a.schedule.start : a.schedule.end;
          const valB = sortState.field === 'start' ? b.schedule.start : b.schedule.end;
          if (valA === valB) return 0;
          const compare = valA > valB ? 1 : -1;
          return sortState.order === 'asc' ? compare : -compare;
        });
      } else {
        const taskSortField = ['pickup_today', 'pickup_2h', 'pickup_processing', 'pickup_overdue_task'].includes(activeStatFilter.value) ? 'start' : ['return_today', 'return_2h', 'return_overdue_task', 'settlement_task'].includes(activeStatFilter.value) ? 'end' : '';
        if (taskSortField) {
          data.sort((a, b) => {
            const valA = taskSortField === 'start' ? a.schedule.start : a.schedule.end;
            const valB = taskSortField === 'start' ? b.schedule.start : b.schedule.end;
            if (valA === valB) return 0;
            return valA > valB ? 1 : -1;
          });
        } else {
          data.sort((a, b) => {
            const valA = a.createTime || '';
            const valB = b.createTime || '';
            if (valA === valB) return 0;
            return valA > valB ? -1 : 1;
          });
        }
      }
      return data;
    });
    const paginatedOrders = computed(() => {
      const start = (currentPage.value - 1) * pageSize.value;
      const end = start + pageSize.value;
      return sortedOrders.value.slice(start, end);
    });
    const getStatusConfig = status => {
      return statusMap[status] || {
        text: status,
        type: 'info',
        color: ''
      };
    };
    const getDispatchStatusConfig = status => {
      return dispatchStatusMap[status] || {
        text: status,
        type: 'info',
        color: ''
      };
    };
    const hasAssignedVehicle = row => {
      return !!row?.vehicle?.plate && row.vehicle.plate !== '未分配' && row.dispatchStatus !== 'pending';
    };
    const getDispatchIcon = status => {
      const iconMap = {
        pre_assigned: 'Clock',
        locked: 'Lock',
        manual_reassigned: 'Refresh',
        upgraded: 'Star'
      };
      return iconMap[status] || 'InfoFilled';
    };
    const getDispatchIconClass = status => {
      const classMap = {
        pre_assigned: 'text-amber-500',
        locked: 'text-emerald-600',
        manual_reassigned: 'text-orange-500',
        upgraded: 'text-[color:var(--app-color-primary)]'
      };
      return classMap[status] || 'text-gray-400';
    };
    const shouldShowDispatchIcon = row => {
      return hasAssignedVehicle(row) && ['pre_assigned', 'locked', 'manual_reassigned', 'upgraded'].includes(row.dispatchStatus);
    };
    const needsManualDispatch = row => {
      return !hasAssignedVehicle(row) && (row.riskFlags || []).includes('dispatch_manual_required');
    };
    const getPaymentStatusConfig = status => {
      return paymentStatusMap[status] || {
        text: status,
        type: 'info',
        color: ''
      };
    };
    const getPostChargeConfig = status => {
      return postChargeStatusMap[status] || {
        text: status,
        type: 'warning',
        color: ''
      };
    };
    const shouldShowPaymentStatus = row => {
      if (!row.paymentStatus) return false;
      if (isMonthlyBillingOrder(row)) return true;
      return !row.postCharge;
    };
    const shouldShowPostChargeStatus = row => {
      return !!row.postCharge && !isMonthlyBillingOrder(row);
    };
    const getRiskFlagConfig = flag => {
      return riskFlagMap[flag] || {
        text: flag,
        type: 'info',
        color: ''
      };
    };
    const getCustomerRiskFlags = row => {
      return (row.riskFlags || []).filter(flag => ['blacklist', 'license_issue', 'pickup_overdue_contact'].includes(flag));
    };
    const isMonthlyBillingOrder = row => {
      return row.billingMode === 'monthly' || row.paymentStatus === 'monthly_billing';
    };
    const getRowClassName = ({
      row
    }) => {
      return ['cancelled', 'no_show', 'rejected', 'closed'].includes(row.status) ? 'opacity-60 bg-gray-50' : '';
    };
    const countOrders = predicate => orders.filter(order => {
      const matchPermission = hasOrderModePermission(order);
      const matchesMode = activeTab.value === 'all' || (activeTab.value === 'store' ? (order.businessLine || 'store') === 'store' : order.businessLine === activeTab.value);
      return matchPermission && matchesMode && predicate(order);
    }).length;
    const overviewStats = computed(() => [{
      key: 'all',
      label: '全部訂單',
      count: countOrders(() => true),
      color: 'text-gray-900'
    }, {
      key: 'todo',
      label: '待處理',
      count: countOrders(order => ['pending_payment', 'reserved', 'pickup_overdue'].includes(order.status)),
      color: 'text-blue-600'
    }, {
      key: 'active',
      label: '履約中',
      count: countOrders(order => ['inspecting', 'renting', 'renewing'].includes(order.status)),
      color: 'text-green-600'
    }, {
      key: 'settlement',
      label: '結算處理',
      count: countOrders(order => ['settlement_pending', 'payment_due', 'refund_pending'].includes(order.status)),
      color: 'text-orange-600'
    }, {
      key: 'risk',
      label: '異常風險',
      count: countOrders(order => ['overdue', 'accident_processing'].includes(order.status) || (order.riskFlags || []).length > 0),
      color: 'text-red-600'
    }, {
      key: 'monthly',
      label: '企業月結',
      count: countOrders(order => isMonthlyBillingOrder(order)),
      color: 'text-[color:var(--app-color-primary)]'
    }, {
      key: 'post_charge',
      label: '完成後追繳',
      count: countOrders(order => !!order.postCharge),
      color: 'text-amber-600'
    }, {
      key: 'due',
      label: '待收/待退',
      count: countOrders(order => ['payment_due', 'refund_pending'].includes(order.status) || ['payment_due', 'pending_notify', 'notified'].includes(order.postCharge?.status)),
      color: 'text-rose-600'
    }]);
    const taskStats = computed(() => [{
      key: 'pickup_today',
      label: '今日待交車',
      count: countOrders(order => isPickupToday(order)),
      color: 'text-blue-600'
    }, {
      key: 'pickup_2h',
      label: '2小時內交車',
      count: countOrders(order => isPickupSoon(order)),
      color: 'text-sky-600'
    }, {
      key: 'pickup_processing',
      label: '交車辦理中',
      count: countOrders(order => isPickupProcessing(order)),
      color: 'text-amber-600'
    }, {
      key: 'return_today',
      label: '今日待還車',
      count: countOrders(order => isReturnToday(order)),
      color: 'text-emerald-600'
    }, {
      key: 'return_2h',
      label: '2小時內還車',
      count: countOrders(order => isReturnSoon(order)),
      color: 'text-teal-600'
    }, {
      key: 'pickup_overdue_task',
      label: '逾期未取',
      count: countOrders(order => isPickupOverdueTask(order)),
      color: 'text-orange-600'
    }, {
      key: 'return_overdue_task',
      label: '逾期未還',
      count: countOrders(order => isReturnOverdueTask(order)),
      color: 'text-red-600'
    }, {
      key: 'settlement_task',
      label: '已還待結算',
      count: countOrders(order => isSettlementTask(order)),
      color: 'text-[color:var(--app-color-primary)]'
    }]);
    const currentStats = computed(() => statsView.value === 'task' ? taskStats.value : overviewStats.value);
    const switchStatsView = view => {
      statsView.value = view;
      activeStatFilter.value = '';
    };
    const applyStatFilter = key => {
      resetFilters();
      activeStatFilter.value = key === 'all' ? '' : key;
    };
    const handleSortCommand = command => {
      if (command === 'default') {
        sortState.field = '';
        sortState.order = '';
        return;
      }
      const [field, order] = command.split('_');
      sortState.field = field;
      sortState.order = order;
    };
    const resetFilters = () => {
      filters.keyword = '';
      filters.clientType = '';
      filters.billingMode = '';
      filters.status = [];
      filters.postChargeStatus = '';
      filters.riskFlag = '';
      filters.dateRange = [];
      filters.pickupStore = '';
      filters.returnStore = '';
      filters.vehicleGroup = '';
      activeStatFilter.value = '';
      sortState.field = '';
      sortState.order = '';
      searchPanelExpanded.value = false;
    };
    const handleSizeChange = val => {
      pageSize.value = val;
    };
    const handleCurrentChange = val => {
      currentPage.value = val;
    };
    const storeStationSamples = {
      "新北總店": ["新北總店 B1 交車區", "新北總店 P3 停放區", "新北總店後場整備區"],
      "臺北車站店": ["臺北車站店 A 區停車場", "臺北車站店 B2 交車區"]
    };
    const isSelfServiceRow = row => row.businessLine === 'self_service' || row.serviceMode === 'self_service';
    const getVehicleCurrentStation = row => {
      if (isSelfServiceRow(row)) {
        return row.location?.pickupStation || row.location?.pickupStationName || '';
      }
      if (!row?.vehicle?.plate || row.vehicle.plate === '未分配' || row.dispatchStatus === 'pending') return '';
      if (row.vehicle.currentStation) return row.vehicle.currentStation;
      const stations = storeStationSamples[row.location?.pickup] || [`${row.location?.pickup || '取車門市'} 車輛所在據點`];
      const seed = Array.from(row.orderId || '').reduce((sum, char) => sum + char.charCodeAt(0), 0);
      return stations[seed % stations.length];
    };
    const returnedStatuses = ['settlement_pending', 'payment_due', 'refund_pending', 'completed'];
    const getReturnCurrentStation = row => {
      if (isSelfServiceRow(row)) {
        return row.location?.returnStation || row.location?.returnStationName || '';
      }
      if (!returnedStatuses.includes(row.status)) return '';
      if (row.location?.returnStation) return row.location.returnStation;
      const stations = storeStationSamples[row.location?.return] || [];
      if (!stations.length) return '';
      const seed = Array.from(row.orderId || '').reduce((sum, char) => sum + char.charCodeAt(0), 1);
      return stations[seed % stations.length];
    };
    const getStationShortName = (stationName, storeName) => {
      if (!stationName) return '';
      return stationName.replace(storeName, '').replace(/^[-\s]+/, '').trim() || stationName;
    };
    const getLocationWithStation = (row, type) => {
      const storeName = row.location?.[type] || '-';
      const stationName = type === 'pickup' ? getVehicleCurrentStation(row) : getReturnCurrentStation(row);
      const shortStationName = getStationShortName(stationName, storeName);
      return shortStationName ? `${storeName} - ${shortStationName}` : storeName;
    };
    const buildOrderDetailUrl = (row, action = '') => {
      const params = new URLSearchParams({
        id: row.orderId
      });
      if (action) params.set('action', action);
      if (row.serviceMode || row.businessLine === 'self_service') params.set('serviceMode', row.serviceMode || row.businessLine);
      if (row.status) params.set('status', row.status);
      if (row.paymentStatus) params.set('paymentStatus', row.paymentStatus);
      if (row.billingMode) params.set('billing', row.billingMode);
      if (row.clientType) params.set('clientType', row.clientType);
      if (row.customer?.name) params.set('customerName', row.customer.name);
      if (row.customer?.phone) params.set('customerPhone', row.customer.phone);
      if (row.customer?.level) params.set('customerLevel', row.customer.level);
      if (row.customer?.dept) params.set('department', row.customer.dept);
      if (row.amount !== undefined) params.set('amount', row.amount);
      if (row.corporate?.name) params.set('corporateName', row.corporate.name);
      if (row.corporate?.shortName) params.set('corporateShortName', row.corporate.shortName);
      if (row.vehicle?.model) params.set('vehicleModel', row.vehicle.model);
      if (row.vehicle?.group) params.set('vehicleGroup', row.vehicle.group);
      if (row.vehicle?.plate) params.set('vehiclePlate', row.vehicle.plate);
      const vehicleStation = getVehicleCurrentStation(row);
      if (vehicleStation) params.set('vehicleStation', vehicleStation);
      if (row.dispatchStatus) params.set('dispatchStatusText', getDispatchStatusConfig(row.dispatchStatus).text);
      if (row.schedule?.start) params.set('scheduleStart', row.schedule.start);
      if (row.schedule?.end) params.set('scheduleEnd', row.schedule.end);
      if (row.location?.pickup) params.set('pickupLocation', row.location.pickup);
      if (row.location?.pickupStation || row.location?.pickupStationName) params.set('pickupStationName', row.location.pickupStation || row.location.pickupStationName);
      if (row.location?.return) params.set('returnLocation', row.location.return);
      if (row.location?.returnStation || row.location?.returnStationName) params.set('returnStationName', row.location.returnStation || row.location.returnStationName);
      if (row.location?.returnStationId) params.set('returnStationId', row.location.returnStationId);
      if (row.locationStatus?.pickupStore) params.set('pickupStoreStatus', row.locationStatus.pickupStore);
      if (row.locationStatus?.pickupStation) params.set('pickupStationStatus', row.locationStatus.pickupStation);
      if (row.locationStatus?.returnStore) params.set('returnStoreStatus', row.locationStatus.returnStore);
      if (row.locationStatus?.returnStation) params.set('returnStationStatus', row.locationStatus.returnStation);
      if (row.postCharge?.status) params.set('postChargeStatus', row.postCharge.status);
      if (row.postCharge?.amount !== undefined) params.set('postChargeAmount', row.postCharge.amount);
      if (row.postCharge?.count !== undefined) params.set('postChargeCount', row.postCharge.count);
      return `order_detail.html?${params.toString()}`;
    };
    const viewOrder = row => {
      window.location.href = buildOrderDetailUrl(row);
    };
    const goToNewOrder = () => {
      window.location.href = `new_order.html`;
    };
    const quickAction = row => {
      if (['reserved', 'pickup_overdue', 'inspecting'].includes(row.status)) {
        window.location.href = buildOrderDetailUrl(row, 'pickup');
      } else if (row.status === 'renting') {
        window.location.href = buildOrderDetailUrl(row, 'return');
      } else if (['renewing', 'overdue', 'accident_processing', 'settlement_pending', 'payment_due', 'refund_pending'].includes(row.status)) {
        window.location.href = buildOrderDetailUrl(row, 'return');
      }
    };
    const openFeeAction = (row, action) => {
      window.location.href = buildOrderDetailUrl(row, action);
    };
    const openExtendAction = row => {
      window.location.href = buildOrderDetailUrl(row, 'extend');
    };
    const openOrderAction = (row, action) => {
      window.location.href = buildOrderDetailUrl(row, action);
    };
    return {
      orders,
      filters,
      searchPanelExpanded,
      filterToolbar,
      filterLayoutTier,
      currentPage,
      pageSize,
      statsView,
      activeStatFilter,
      filteredOrders,
      paginatedOrders,
      vehicleTree,
      vehicleSearch,
      filteredVehicleTree,
      stores,
      currentStats,
      getStatusConfig,
      getDispatchStatusConfig,
      getPaymentStatusConfig,
      getPostChargeConfig,
      hasAssignedVehicle,
      getDispatchIcon,
      getDispatchIconClass,
      shouldShowDispatchIcon,
      needsManualDispatch,
      shouldShowPaymentStatus,
      shouldShowPostChargeStatus,
      getRiskFlagConfig,
      getCustomerRiskFlags,
      resetFilters,
      handleSortCommand,
      applyStatFilter,
      switchStatsView,
      isMonthlyBillingOrder,
      getRowClassName,
      getVehicleCurrentStation,
      getLocationWithStation,
      buildOrderDetailUrl,
      handleSizeChange,
      handleCurrentChange,
      viewOrder,
      goToNewOrder,
      quickAction,
      openFeeAction,
      openExtendAction,
      openOrderAction,
      activeTab,
      allOrderCount,
      storeOrderCount,
      selfServiceOrderCount,
      handleNewOrder,
      permissionDemoMode,
      permissionDemoOptions,
      hasStorePermission,
      hasSelfServicePermission,
      setPermissionDemoMode,
      Van,
      Ticket,
      Document,
      DocumentAdd,
      PriceTag,
      Grid,
      ShoppingCart,
      Setting,
      Location,
      Briefcase,
      HomeFilled,
      List,
      Search,
      Refresh,
      Download,
      Plus,
      Sort,
      Filter,
      Shop,
      Timer,
      getOrderMode,
      hasOrderModePermission,
      mockToday,
      mockNow,
      statusMap,
      statusGroups,
      dispatchStatusMap,
      paymentStatusMap,
      postChargeStatusMap,
      riskFlagMap,
      filterResizeObserver,
      updateFilterLayout,
      pickupFocusStatuses,
      returnFocusStatuses,
      settlementFocusStatuses,
      toDateTime,
      isToday,
      isWithinNextHours,
      isPickupToday,
      isPickupSoon,
      isPickupProcessing,
      isReturnToday,
      isReturnSoon,
      isPickupOverdueTask,
      isReturnOverdueTask,
      isSettlementTask,
      sortState,
      sortedOrders,
      countOrders,
      overviewStats,
      taskStats,
      storeStationSamples,
      isSelfServiceRow,
      returnedStatuses,
      getReturnCurrentStation,
      getStationShortName
    };
  }
  return pageSetup();
}
export default function StoreOrdersBlock() {
  const model = useRimoModel(createPageState);
  const view = model.view;
  const {
    text
  } = useRimoEnvironment();
  return <RimoRoot model={model} pageKey="store-orders" assets={{}}><div data-business-content="" data-rimo-layout="page"><div className="prototype-permission-switcher" aria-label="門市租賃訂單權限演示" data-rimo-layout="permissions"><span className="prototype-permission-switcher__label">{text("權限演示")}</span>
<RimoElement kind="el-radio-group" modelValue={view.permissionDemoMode} onModelChange={value => {
          model.write(["permissionDemoMode"], value);
        }} size="small" onChange={event => {
          view.setPermissionDemoMode?.(event);
        }}>{rimoEntries(view.permissionDemoOptions).map(([option], _itemIndex) => <Fragment key={option.value}><RimoElement kind="el-radio-button" key={option.value} label={option.value}>{rimoText(option.label)}</RimoElement></Fragment>)}</RimoElement></div>
<div className="flex justify-between items-end mb-6" data-rimo-layout="heading"><div><h1 className="text-2xl font-bold text-gray-800 tracking-tight">{text("門市租賃訂單")}</h1>
<p className="text-gray-500 text-sm mt-1">{text("管理所有門市租賃訂單，支持快速取還車、訂單查詢及狀態跟蹤。")}</p></div>
<RimoElement kind="el-dropdown" splitButton={true} type="primary" size="large" className="rimo-primary-split shadow-md shadow-[color:var(--app-color-primary-shadow)]" onClick={_event => {
          view.handleNewOrder(view.activeTab);
        }} onCommand={event => {
          view.handleNewOrder?.(event);
        }} slots={{
          "dropdown": _slot => <><RimoElement kind="el-dropdown-menu">{view.hasStorePermission ? <><RimoElement kind="el-dropdown-item" command="store">{text("新建門市租賃訂單")}</RimoElement></> : null}
{view.hasSelfServicePermission ? <><RimoElement kind="el-dropdown-item" command="self_service">{text("新建24h自助租車訂單")}</RimoElement></> : null}</RimoElement></>
        }}><span className="flex items-center"><RimoElement kind="el-icon" className="mr-1"><RimoIcon name="Plus" /></RimoElement>
{text(" 新建訂單\n                        ")}</span></RimoElement></div>
<div className="bg-white rounded-xl border border-gray-200 p-3 mb-4"><div className="flex items-center justify-between gap-4 mb-3" data-rimo-layout="toolbar"><div className="text-sm font-semibold text-gray-700">{text("統計視角")}</div>
<div className="inline-flex items-center rounded-lg border border-gray-200 bg-gray-50 p-1"><button className={rimoClass(["px-3 py-1.5 text-sm rounded-md transition-colors", rimoClass(view.statsView === 'overview' ? 'bg-white text-[color:var(--app-color-primary)] shadow-sm font-medium' : 'text-gray-500 hover:text-gray-700')])} onClick={_event => {
              view.switchStatsView('overview');
            }}>{text("\n                                運營總覽\n                            ")}</button>
<button className={rimoClass(["px-3 py-1.5 text-sm rounded-md transition-colors", rimoClass(view.statsView === 'task' ? 'bg-white text-[color:var(--app-color-primary)] shadow-sm font-medium' : 'text-gray-500 hover:text-gray-700')])} onClick={_event => {
              view.switchStatsView('task');
            }}>{text("\n                                今日作業\n                            ")}</button></div></div>
<div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-8 gap-2">{rimoEntries(view.currentStats).map(([item], _itemIndex) => <Fragment key={item.key}><button key={item.key} className={rimoClass(["text-left rounded-lg border px-3 py-2 transition-colors", rimoClass(view.activeStatFilter === item.key || !view.activeStatFilter && view.statsView === 'overview' && item.key === 'all' ? 'border-[color:var(--app-color-primary)] bg-[color:var(--app-color-primary-light-9)]' : 'border-gray-100 hover:border-[color:var(--app-color-primary)] hover:bg-[color:var(--app-color-primary-light-9)]')])} onClick={_event => {
              view.applyStatFilter(item.key);
            }}><div className="text-xs text-gray-500">{rimoText(item.label)}</div>
<div className={rimoClass(["mt-1 text-xl font-bold font-mono", rimoClass(item.color)])}>{rimoText(item.count)}</div></button></Fragment>)}</div></div>
<div className="orders-list-panel bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden" data-rimo-layout="list"><div className="orders-list-tabs bg-gray-50 px-4"><RimoElement kind="el-tabs" modelValue={view.activeTab} onModelChange={value => {
            model.write(["activeTab"], value);
          }} className="business-tabs">{view.hasStorePermission && view.hasSelfServicePermission ? <><RimoElement kind="el-tab-pane" name="all" slots={{
                "label": _slot => <><span className="flex items-center gap-2"><RimoElement kind="el-icon"><RimoIcon name="List" /></RimoElement>
<span>{text("全部")}</span>
<RimoElement kind="el-tag" size="small" type="info" round={true} effect="plain">{rimoText(view.allOrderCount)}</RimoElement></span></>
              }}></RimoElement></> : null}
{view.hasStorePermission ? <><RimoElement kind="el-tab-pane" name="store" slots={{
                "label": _slot => <><span className="flex items-center gap-2"><RimoElement kind="el-icon"><RimoIcon name="Shop" /></RimoElement>
<span>{text("門市租車")}</span>
<RimoElement kind="el-tag" size="small" type="info" round={true} effect="plain">{rimoText(view.storeOrderCount)}</RimoElement></span></>
              }}></RimoElement></> : null}
{view.hasSelfServicePermission ? <><RimoElement kind="el-tab-pane" name="self_service" slots={{
                "label": _slot => <><span className="flex items-center gap-2"><RimoElement kind="el-icon"><RimoIcon name="Timer" /></RimoElement>
<span>{text("24h自助租車")}</span>
<RimoElement kind="el-tag" size="small" type="info" round={true} effect="plain">{rimoText(view.selfServiceOrderCount)}</RimoElement></span></>
              }}></RimoElement></> : null}</RimoElement></div>
<RimoElement kind="el-table" data={view.paginatedOrders} style={rimoStyle("width: 100%")} stripe={true} rowClassName={view.getRowClassName} headerCellStyle={{
          background: '#f9fafb',
          color: '#4b5563',
          fontWeight: '600'
        }} slots={{
          "toolbar": _slot => <><div className="adaptive-filter-toolbar flex flex-wrap items-center gap-4"><div className="adaptive-filter-controls flex flex-wrap items-center gap-4"><RimoElement kind="el-input" modelValue={view.filters.keyword} onModelChange={value => {
                  model.write(["filters", "keyword"], value);
                }} placeholder="訂單號 / 客戶 / 企業名 / 車牌號" prefixIcon="Search" clearable={true} style={rimoStyle("width: 280px")}></RimoElement>
<RimoElement kind="el-select" modelValue={view.filters.clientType} onModelChange={value => {
                  model.write(["filters", "clientType"], value);
                }} placeholder="客戶類型" clearable={true} style={rimoStyle("width: 120px")}><RimoElement kind="el-option" label="全部客戶" value=""></RimoElement>
<RimoElement kind="el-option" label="個人客戶" value="personal"></RimoElement>
<RimoElement kind="el-option" label="企業客戶" value="corporate"></RimoElement></RimoElement>
<RimoElement kind="el-select" modelValue={view.filters.billingMode} onModelChange={value => {
                  model.write(["filters", "billingMode"], value);
                }} placeholder="結算方式" clearable={true} style={rimoStyle("width: 130px")}><RimoElement kind="el-option" label="全部結算" value=""></RimoElement>
<RimoElement kind="el-option" label="客戶自付" value="customer_pay"></RimoElement>
<RimoElement kind="el-option" label="企業月結" value="monthly"></RimoElement></RimoElement>
<RimoElement kind="el-select" modelValue={view.filters.status} onModelChange={value => {
                  model.write(["filters", "status"], value);
                }} placeholder="訂單狀態" multiple={true} collapseTags={true} collapseTagsTooltip={true} clearable={true} style={rimoStyle("width: 180px")}><RimoElement kind="el-option-group" label="待處理"><RimoElement kind="el-option" label="【全部待處理】" value="group_todo" className="font-bold text-blue-600 bg-blue-50"></RimoElement>
<RimoElement kind="el-option" label="待支付" value="pending_payment"></RimoElement>
<RimoElement kind="el-option" label="已預訂" value="reserved"></RimoElement>
<RimoElement kind="el-option" label="逾期未取" value="pickup_overdue"></RimoElement></RimoElement>
<RimoElement kind="el-option-group" label="進行中"><RimoElement kind="el-option" label="【全部進行中】" value="group_active" className="font-bold text-green-600 bg-green-50"></RimoElement>
<RimoElement kind="el-option" label="驗車中" value="inspecting"></RimoElement>
<RimoElement kind="el-option" label="用車中" value="renting"></RimoElement>
<RimoElement kind="el-option" label="續租中" value="renewing"></RimoElement></RimoElement>
<RimoElement kind="el-option-group" label="異常/風險"><RimoElement kind="el-option" label="【全部異常】" value="group_risk" className="font-bold text-red-600 bg-red-50"></RimoElement>
<RimoElement kind="el-option" label="逾期未還" value="overdue"></RimoElement>
<RimoElement kind="el-option" label="出險處理中" value="accident_processing"></RimoElement></RimoElement>
<RimoElement kind="el-option-group" label="結算處理"><RimoElement kind="el-option" label="【全部結算】" value="group_settlement" className="font-bold text-orange-600 bg-orange-50"></RimoElement>
<RimoElement kind="el-option" label="待結算" value="settlement_pending"></RimoElement>
<RimoElement kind="el-option" label="待補繳" value="payment_due"></RimoElement>
<RimoElement kind="el-option" label="待退款" value="refund_pending"></RimoElement></RimoElement>
<RimoElement kind="el-option-group" label="已結束"><RimoElement kind="el-option" label="【全部已結束】" value="group_history" className="font-bold text-gray-600 bg-gray-50"></RimoElement>
<RimoElement kind="el-option" label="已完成" value="completed"></RimoElement>
<RimoElement kind="el-option" label="已取消" value="cancelled"></RimoElement>
<RimoElement kind="el-option" label="爽約" value="no_show"></RimoElement>
<RimoElement kind="el-option" label="已拒絕" value="rejected"></RimoElement>
<RimoElement kind="el-option" label="已關閉" value="closed"></RimoElement></RimoElement></RimoElement>
<RimoElement kind="el-date-picker" modelValue={view.filters.dateRange} onModelChange={value => {
                  model.write(["filters", "dateRange"], value);
                }} type="daterange" rangeSeparator="至" startPlaceholder="開始日期" endPlaceholder="結束日期" style={rimoStyle("width: 260px")} format="YYYY/MM/DD" valueFormat="YYYY-MM-DD"></RimoElement>
<RimoElement kind="el-button" icon="Refresh" circle={true} onClick={event => {
                  view.resetFilters?.(event);
                }} data-rimo-filter-reset="true" aria-label="重置筛选"></RimoElement>
<RimoElement kind="el-button" type="primary" plain={true} icon="Download">{text("導出")}</RimoElement></div></div>
<div className="pt-4 mt-4 border-t border-gray-100"><div className="flex flex-wrap items-center gap-4"><RimoElement kind="el-select" modelValue={view.filters.postChargeStatus} onModelChange={value => {
                  model.write(["filters", "postChargeStatus"], value);
                }} placeholder="追繳狀態" clearable={true} style={rimoStyle("width: 140px")} data-rimo-secondary="true"><RimoElement kind="el-option" label="全部追繳" value=""></RimoElement>
<RimoElement kind="el-option" label="存在追繳" value="any"></RimoElement>
<RimoElement kind="el-option" label="追繳待通知" value="pending_notify"></RimoElement>
<RimoElement kind="el-option" label="追繳已通知" value="notified"></RimoElement>
<RimoElement kind="el-option" label="追繳待支付" value="payment_due"></RimoElement>
<RimoElement kind="el-option" label="企業月結追繳" value="monthly_billing"></RimoElement>
<RimoElement kind="el-option" label="追繳已結清" value="paid"></RimoElement></RimoElement>
<RimoElement kind="el-select" modelValue={view.filters.riskFlag} onModelChange={value => {
                  model.write(["filters", "riskFlag"], value);
                }} placeholder="風險標記" clearable={true} style={rimoStyle("width: 130px")} data-rimo-secondary="true"><RimoElement kind="el-option" label="全部風險" value=""></RimoElement>
<RimoElement kind="el-option" label="黑名單" value="blacklist"></RimoElement>
<RimoElement kind="el-option" label="證件異常" value="license_issue"></RimoElement>
<RimoElement kind="el-option" label="人工調度" value="dispatch_manual_required"></RimoElement>
<RimoElement kind="el-option" label="需聯繫客戶" value="pickup_overdue_contact"></RimoElement>
<RimoElement kind="el-option" label="事故上報" value="accident"></RimoElement>
<RimoElement kind="el-option" label="違章待處理" value="violation_pending"></RimoElement></RimoElement>
<RimoElement kind="el-popover" placement="bottom-start" width={280} trigger="click" slots={{
                  "reference": _slot => <><div className="inline-block" style={rimoStyle("cursor: pointer;")}><RimoElement kind="el-select" modelValue={view.filters.pickupStore || view.filters.returnStore ? '已篩選' : ''} placeholder="取還站點" style={rimoStyle("width: 130px; pointer-events: none;")} readOnly={true} data-rimo-secondary="true"></RimoElement></div></>
                }}><div className="p-3"><div className="mb-3"><div className="text-xs text-gray-500 mb-1.5 font-medium">{text("取車門店")}</div>
<RimoElement kind="el-select" modelValue={view.filters.pickupStore} onModelChange={value => {
                        model.write(["filters", "pickupStore"], value);
                      }} placeholder="不限" clearable={true} className="w-full" data-rimo-secondary="true">{rimoEntries(view.stores).map(([store], _itemIndex) => <Fragment key={store}><RimoElement kind="el-option" key={store} label={store} value={store}></RimoElement></Fragment>)}</RimoElement></div>
<div><div className="text-xs text-gray-500 mb-1.5 font-medium">{text("還車門店")}</div>
<RimoElement kind="el-select" modelValue={view.filters.returnStore} onModelChange={value => {
                        model.write(["filters", "returnStore"], value);
                      }} placeholder="不限" clearable={true} className="w-full" data-rimo-secondary="true">{rimoEntries(view.stores).map(([store], _itemIndex) => <Fragment key={store}><RimoElement kind="el-option" key={store} label={store} value={store}></RimoElement></Fragment>)}</RimoElement></div></div></RimoElement>
<RimoElement kind="el-select" modelValue={view.filters.vehicleGroup} onModelChange={value => {
                  model.write(["filters", "vehicleGroup"], value);
                }} placeholder="車型/車組" clearable={true} filterable={true} style={rimoStyle("width: 160px")} data-rimo-secondary="true"><RimoElement kind="el-option" label="全部車輛" value=""></RimoElement>
{rimoEntries(view.vehicleTree).map(([item], _itemIndex) => <Fragment key={item.group}><><RimoElement kind="el-option" label={'【' + item.group + '】'} value={'group:' + item.group} className="font-bold"></RimoElement>
{rimoEntries(item.models).map(([model], _itemIndex) => <Fragment key={model}><RimoElement kind="el-option" key={model} label={'    ' + model} value={'model:' + model}></RimoElement></Fragment>)}</></Fragment>)}</RimoElement></div></div></>
        }}><RimoElement kind="el-table-column" label="訂單信息" minWidth="180" slots={{
            "default": scope => <><div className="flex flex-col">{view.activeTab === 'all' ? <><RimoElement kind="el-tag" className="self-start mb-1" size="small" type={scope.row.businessLine === 'self_service' ? 'success' : 'primary'} effect="plain">{text("\n                                        ")}{rimoText(scope.row.businessLine === 'self_service' ? '24小時自助' : '門市租車')}{text("\n                                    ")}</RimoElement></> : null}
<a href={view.buildOrderDetailUrl(scope.row)} className="text-[color:var(--app-color-primary)] font-bold hover:underline mb-1 font-mono">{text("\n                                        ")}{rimoText(scope.row.orderId)}{text("\n                                    ")}</a>
<div className="text-xs text-gray-400">{rimoText(scope.row.createTime)}</div></div></>
          }}></RimoElement>
<RimoElement kind="el-table-column" label="客戶" minWidth="180" slots={{
            "default": scope => <><div className="flex items-center gap-2"><div className="font-medium text-gray-800">{rimoText(scope.row.customer.name)}</div>
{scope.row.clientType === 'corporate' ? <><RimoElement kind="el-tag" size="small" color="var(--app-color-primary-light-9)" style={rimoStyle("color: var(--app-color-primary); border-color: var(--app-color-primary-light-8);")} effect="light">{text("\n                                        ")}{rimoText(scope.row.corporate?.shortName)}{text("\n                                    ")}</RimoElement></> : null}</div>
<div className="text-xs text-gray-500 mt-0.5">{text("\n                                    ")}{rimoText(scope.row.customer.phone)}{text("\n                                ")}</div>
<div className="flex flex-wrap gap-1 mt-1">{scope.row.customer.level ? <><RimoElement kind="el-tag" size="small" effect="plain" className="scale-90 origin-left">{rimoText(scope.row.customer.level)}</RimoElement></> : null}
{rimoEntries(view.getCustomerRiskFlags(scope.row)).map(([flag], _itemIndex) => <Fragment key={flag}><RimoElement kind="el-tag" key={flag} size="small" type={view.getRiskFlagConfig(flag).type} color={view.getRiskFlagConfig(flag).color} style={rimoStyle(view.getRiskFlagConfig(flag).color ? {
                    color: '#fff',
                    borderColor: view.getRiskFlagConfig(flag).color
                  } : {})} effect="light" className="scale-90 origin-left">{text("\n                                        ")}{rimoText(view.getRiskFlagConfig(flag).text)}{text("\n                                    ")}</RimoElement></Fragment>)}</div></>
          }}></RimoElement>
<RimoElement kind="el-table-column" label="預訂車輛" minWidth="180" slots={{
            "default": scope => <><div className="font-medium text-gray-800">{rimoText(scope.row.vehicle.group)}</div>
{view.hasAssignedVehicle(scope.row) ? <><div className="text-xs text-gray-600 mt-0.5 flex items-center gap-1"><span>{rimoText(scope.row.vehicle.model)}</span>
{view.shouldShowDispatchIcon(scope.row) ? <><RimoElement kind="el-tooltip" placement="top" content={view.getDispatchStatusConfig(scope.row.dispatchStatus).text}><RimoElement kind="el-icon" className={rimoClass(["text-sm", rimoClass(view.getDispatchIconClass(scope.row.dispatchStatus))])}><RimoIcon name={view.getDispatchIcon(scope.row.dispatchStatus)} /></RimoElement></RimoElement></> : null}</div></> : null}
{view.hasAssignedVehicle(scope.row) ? <><div className="text-xs text-gray-500 font-mono mt-0.5">{text("\n                                    ")}{rimoText(scope.row.vehicle.plate)}{text("\n                                ")}</div></> : <><div className="text-xs text-gray-400 mt-0.5 flex items-center gap-1"><RimoElement kind="el-icon" className="text-gray-400"><RimoIcon name="Clock" /></RimoElement>
<span>{text("待派車")}</span>
{view.needsManualDispatch(scope.row) ? <><RimoElement kind="el-tooltip" content="人工調度" placement="top"><RimoElement kind="el-icon" className="text-orange-500"><RimoIcon name="WarningFilled" /></RimoElement></RimoElement></> : null}</div></>}</>
          }}></RimoElement>
<RimoElement kind="el-table-column" minWidth="200" slots={{
            "header": _slot => <><div className="flex items-center cursor-pointer group"><span>{text("行程時間")}</span>
<RimoElement kind="el-dropdown" trigger="click" onCommand={event => {
                  view.handleSortCommand?.(event);
                }} slots={{
                  "dropdown": _slot => <><RimoElement kind="el-dropdown-menu"><RimoElement kind="el-dropdown-item" command="start_asc">{text("取車時間 正序 ↑")}</RimoElement>
<RimoElement kind="el-dropdown-item" command="start_desc">{text("取車時間 倒序 ↓")}</RimoElement>
<RimoElement kind="el-dropdown-item" divided={true} command="end_asc">{text("還車時間 正序 ↑")}</RimoElement>
<RimoElement kind="el-dropdown-item" command="end_desc">{text("還車時間 倒序 ↓")}</RimoElement>
<RimoElement kind="el-dropdown-item" divided={true} command="default">{text("默認排序")}</RimoElement></RimoElement></>
                }}><span className="el-dropdown-link ml-1 p-1 rounded hover:bg-gray-200 transition-colors" title="點擊排序"><RimoElement kind="el-icon"><RimoIcon name="Sort" /></RimoElement></span></RimoElement></div></>,
            "default": scope => <><div className="text-sm"><div className="flex items-center gap-1 mb-1"><span className="text-gray-400 w-8 text-xs">{text("取車")}</span>
<span className={rimoClass(["font-medium", rimoClass({
                    'text-orange-500 font-bold': scope.row.status === 'pickup_overdue',
                    'text-gray-700': scope.row.status !== 'pickup_overdue'
                  })])}>{text("\n                                            ")}{rimoText(scope.row.schedule.start)}{text("\n                                        ")}</span>
{scope.row.schedule.start?.includes('2024-05-06') ? <><RimoElement kind="el-tag" size="small" type="success" effect="plain" className="scale-90 origin-left ml-0.5">{text("今日")}</RimoElement></> : null}
{scope.row.status === 'pickup_overdue' ? <><RimoElement kind="el-icon" className="text-orange-500 ml-1"><RimoIcon name="WarningFilled" /></RimoElement></> : null}</div>
<div className="flex items-center gap-1"><span className="text-gray-400 w-8 text-xs">{text("還車")}</span>
<span className={rimoClass(["font-medium", rimoClass({
                    'text-red-500 font-bold': scope.row.status === 'overdue',
                    'text-gray-700': scope.row.status !== 'overdue'
                  })])}>{text("\n                                            ")}{rimoText(scope.row.schedule.end)}{text("\n                                        ")}</span>
{scope.row.schedule.end?.includes('2024-05-06') ? <><RimoElement kind="el-tag" size="small" type="warning" effect="plain" className="scale-90 origin-left ml-0.5">{text("今日")}</RimoElement></> : null}
{scope.row.status === 'overdue' ? <><RimoElement kind="el-icon" className="text-red-500 ml-1"><RimoIcon name="Warning" /></RimoElement></> : null}</div></div></>
          }}></RimoElement>
<RimoElement kind="el-table-column" label="取還站點" minWidth="190" slots={{
            "default": scope => <><div className="text-sm">{scope.row.location.pickup !== scope.row.location.return ? <><div className="flex flex-col gap-1"><div className="flex items-center gap-1"><RimoElement kind="el-tag" size="small" type="warning" effect="dark" className="scale-90 origin-left w-12 text-center">{text("取車")}</RimoElement>
<span className="text-yellow-700 font-bold text-xs">{rimoText(view.getLocationWithStation(scope.row, 'pickup'))}</span></div>
<div className="flex items-center gap-1"><RimoElement kind="el-tag" size="small" type="warning" effect="dark" className="scale-90 origin-left w-12 text-center">{text("還車")}</RimoElement>
<span className="text-yellow-700 font-bold text-xs">{rimoText(view.getLocationWithStation(scope.row, 'return'))}</span></div></div></> : <><div><div className="flex items-center gap-1 mb-1"><RimoElement kind="el-tag" size="small" type="info" effect="plain" className="scale-90 origin-left w-12 text-center">{text("取車")}</RimoElement>
<span className="text-gray-700 text-xs">{rimoText(view.getLocationWithStation(scope.row, 'pickup'))}</span></div>
<div className="flex items-center gap-1"><RimoElement kind="el-tag" size="small" type="info" effect="plain" className="scale-90 origin-left w-12 text-center">{text("還車")}</RimoElement>
<span className="text-gray-700 text-xs">{rimoText(view.getLocationWithStation(scope.row, 'return'))}</span></div></div></>}</div></>
          }}></RimoElement>
<RimoElement kind="el-table-column" label="金額" minWidth="120" align="right" slots={{
            "default": scope => <><div className="font-bold text-gray-800 font-mono">{text("¥")}{rimoText(scope.row.amount.toLocaleString())}{text("\n                                ")}</div>
<div className="flex flex-col items-end gap-1 mt-1">{view.shouldShowPaymentStatus(scope.row) ? <><RimoElement kind="el-tag" size="small" type={view.getPaymentStatusConfig(scope.row.paymentStatus).type} color={view.getPaymentStatusConfig(scope.row.paymentStatus).color} style={rimoStyle(view.getPaymentStatusConfig(scope.row.paymentStatus).color ? {
                    color: '#fff',
                    borderColor: view.getPaymentStatusConfig(scope.row.paymentStatus).color
                  } : {})} effect="plain" className="scale-90 origin-right">{text("\n                                        ")}{rimoText(view.getPaymentStatusConfig(scope.row.paymentStatus).text)}{text("\n                                    ")}</RimoElement></> : null}
{view.shouldShowPostChargeStatus(scope.row) ? <><RimoElement kind="el-tag" size="small" type={view.getPostChargeConfig(scope.row.postCharge.status).type} color={view.getPostChargeConfig(scope.row.postCharge.status).color} style={rimoStyle(view.getPostChargeConfig(scope.row.postCharge.status).color ? {
                    color: '#fff',
                    borderColor: view.getPostChargeConfig(scope.row.postCharge.status).color
                  } : {})} effect="plain" className="scale-90 origin-right"><RimoElement kind="el-icon" className="mr-0.5"><RimoIcon name="WarningFilled" /></RimoElement>
{text("\n                                        ")}{rimoText(view.getPostChargeConfig(scope.row.postCharge.status).text)}{text(" ¥")}{rimoText(scope.row.postCharge.amount?.toLocaleString())}{text("\n                                    ")}</RimoElement></> : null}</div></>
          }}></RimoElement>
<RimoElement kind="el-table-column" label="狀態" minWidth="100" align="center" slots={{
            "default": ({
              row
            }) => <><RimoElement kind="el-tag" type={view.getStatusConfig(row.status).type} color={view.getStatusConfig(row.status).color} style={rimoStyle(view.getStatusConfig(row.status).color ? {
                color: '#fff',
                borderColor: view.getStatusConfig(row.status).color
              } : {})} effect="light" round={true}>{text("\n                                    ")}{rimoText(view.getStatusConfig(row.status).text)}{text("\n                                ")}</RimoElement></>
          }}></RimoElement>
<RimoElement kind="el-table-column" label="操作" minWidth="260" fixed="right" slots={{
            "default": scope => <><div className="flex items-center flex-wrap gap-2"><RimoElement kind="el-button" type="primary" link={true} size="small" onClick={_event => {
                  view.viewOrder(scope.row);
                }}>{text("詳情")}</RimoElement>
{['reserved', 'pickup_overdue', 'inspecting'].includes(scope.row.status) ? <><RimoElement kind="el-button" type="primary" size="small" plain={true} onClick={_event => {
                    view.quickAction(scope.row);
                  }}>{text("\n                                        ")}{rimoText(scope.row.status === 'inspecting' ? '繼續取車' : '取車')}{text("\n                                    ")}</RimoElement></> : null}
{['pending_payment', 'reserved', 'pickup_overdue'].includes(scope.row.status) ? <><RimoElement kind="el-button" type="danger" size="small" plain={true} onClick={_event => {
                    view.openOrderAction(scope.row, 'cancel');
                  }}>{text("取消")}</RimoElement></> : null}
{scope.row.status === 'pickup_overdue' ? <><RimoElement kind="el-button" type="danger" size="small" plain={true} onClick={_event => {
                    view.openOrderAction(scope.row, 'no_show');
                  }}>{text("標記爽約")}</RimoElement></> : null}
{['renting', 'renewing'].includes(scope.row.status) ? <><RimoElement kind="el-button" type="primary" size="small" plain={true} onClick={_event => {
                    view.openExtendAction(scope.row);
                  }}>{text("延長")}</RimoElement></> : null}
{scope.row.status === 'overdue' ? <><RimoElement kind="el-button" type="danger" size="small" plain={true} onClick={_event => {
                    view.openExtendAction(scope.row);
                  }}>{text("補辦續租")}</RimoElement></> : null}
{scope.row.status === 'accident_processing' ? <><RimoElement kind="el-button" type="danger" size="small" plain={true} onClick={_event => {
                    view.openOrderAction(scope.row, 'accident');
                  }}>{text("處理事故")}</RimoElement></> : null}
{['renting', 'renewing', 'overdue', 'accident_processing'].includes(scope.row.status) ? <><RimoElement kind="el-button" type="success" size="small" plain={true} onClick={_event => {
                    view.quickAction(scope.row);
                  }}>{text("還車")}</RimoElement></> : null}
{scope.row.status === 'settlement_pending' ? <><RimoElement kind="el-button" type="warning" size="small" plain={true} onClick={_event => {
                    view.quickAction(scope.row);
                  }}>{text("\n                                        ")}{rimoText(scope.row.billingMode === 'monthly' ? '確認月結' : '繼續結算')}{text("\n                                    ")}</RimoElement></> : null}
{scope.row.status === 'pending_payment' ? <><RimoElement kind="el-button" type="warning" size="small" plain={true} onClick={_event => {
                    view.openFeeAction(scope.row, 'pay');
                  }}>{text("支付")}</RimoElement></> : null}
{scope.row.status === 'payment_due' && scope.row.billingMode !== 'monthly' ? <><RimoElement kind="el-button" type="warning" size="small" plain={true} onClick={_event => {
                    view.quickAction(scope.row);
                  }}>{text("收款")}</RimoElement></> : null}
{scope.row.status === 'refund_pending' && scope.row.billingMode !== 'monthly' ? <><RimoElement kind="el-button" type="warning" size="small" plain={true} onClick={_event => {
                    view.quickAction(scope.row);
                  }}>{text("退款")}</RimoElement></> : null}
{['completed', 'cancelled', 'no_show', 'rejected', 'closed'].includes(scope.row.status) && scope.row.postCharge?.status === 'pending_notify' && !view.isMonthlyBillingOrder(scope.row) ? <><RimoElement kind="el-button" type="warning" size="small" plain={true} onClick={_event => {
                    view.openFeeAction(scope.row, 'notify');
                  }}>{text("\n                                        通知客戶\n                                    ")}</RimoElement></> : null}
{['completed', 'cancelled', 'no_show', 'rejected', 'closed'].includes(scope.row.status) && ['notified', 'payment_due'].includes(scope.row.postCharge?.status) && !view.isMonthlyBillingOrder(scope.row) ? <><RimoElement kind="el-button" type="warning" size="small" plain={true} onClick={_event => {
                    view.openFeeAction(scope.row, 'collect');
                  }}>{text("\n                                        追繳收款\n                                    ")}</RimoElement></> : null}
{['completed', 'cancelled', 'no_show', 'rejected', 'closed'].includes(scope.row.status) && scope.row.postCharge && view.isMonthlyBillingOrder(scope.row) ? <><RimoElement kind="el-button" type="primary" size="small" plain={true} onClick={_event => {
                    view.openFeeAction(scope.row, 'fees');
                  }}>{text("\n                                        查看費用\n                                    ")}</RimoElement></> : null}</div></>
          }}></RimoElement></RimoElement>
<div className="p-4 border-t border-gray-100 flex justify-end"><RimoElement kind="el-pagination" currentPage={view.currentPage} onCurrentPageChange={value => {
            model.write(["currentPage"], value);
          }} pageSize={view.pageSize} onPageSizeChange={value => {
            model.write(["pageSize"], value);
          }} pageSizes={[10, 20, 50, 100]} layout="total, sizes, prev, pager, next, jumper" total={view.filteredOrders.length} onSizeChange={event => {
            view.handleSizeChange?.(event);
          }} onCurrentChange={event => {
            view.handleCurrentChange?.(event);
          }}></RimoElement></div></div></div></RimoRoot>;
}