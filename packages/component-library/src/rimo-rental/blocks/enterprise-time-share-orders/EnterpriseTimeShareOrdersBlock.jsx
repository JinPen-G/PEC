import { Fragment } from 'react';
import { useRimoModel, rimoEntries } from '../../lib/rimo-model.js';
import { RimoRoot, RimoIcon, rimoIcons, useRimoEnvironment } from '../../lib/RimoEnvironment.jsx';
import { RimoElement, rimoClass, rimoStyle, rimoText } from '../../lib/RimoElements.jsx';
import './enterprise-time-share-orders.css';
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
      "orderId": "ZT2405060001",
      "createTime": "2026-08-05 09:15",
      "status": "pending_payment",
      "clientType": "corporate",
      "customer": {
        "name": "劉承恩",
        "phone": "0912-345-001",
        "level": "企業員工"
      },
      "vehicle": {
        "group": "經濟型",
        "model": "Toyota Vios",
        "plate": "RSM-1023",
        "currentStation": "新北總店"
      },
      "schedule": {
        "start": "2026-08-06 10:00",
        "end": "2026-08-07 10:00"
      },
      "location": {
        "pickup": "新北總店",
        "return": "新北總店"
      },
      "amount": 1200,
      "paymentStatus": "unpaid",
      "businessLine": "same_station",
      "serviceMode": "same_station",
      "corporate": {
        "id": "CORP_002",
        "name": "臺積電股份有限公司",
        "shortName": "臺積電",
        "billingType": "員工自付"
      },
      "billingMode": "customer_pay",
      "employee": {
        "name": "劉承恩",
        "employeeNo": "E10001",
        "branch": "新竹分公司",
        "dept": "研發部"
      }
    }, {
      "orderId": "ZT2405060015",
      "createTime": "2026-08-05 09:45",
      "status": "pending_payment",
      "clientType": "corporate",
      "billingMode": "customer_pay",
      "customer": {
        "name": "陳冠宇",
        "phone": "0988-456-210",
        "level": "企業員工"
      },
      "corporate": {
        "id": "CORP_002",
        "name": "臺積電股份有限公司",
        "shortName": "臺積電",
        "billingType": "員工自付"
      },
      "vehicle": {
        "group": "經濟車組",
        "model": "Toyota Yaris",
        "plate": "RSM-1188",
        "currentStation": "新北總店"
      },
      "schedule": {
        "start": "2026-08-06 13:00",
        "end": "2026-08-07 13:00"
      },
      "location": {
        "pickup": "新北總店",
        "return": "新北總店"
      },
      "amount": 1380,
      "paymentStatus": "unpaid",
      "businessLine": "same_station",
      "serviceMode": "same_station",
      "employee": {
        "name": "陳冠宇",
        "employeeNo": "E10002",
        "branch": "臺北分公司",
        "dept": "業務部"
      }
    }, {
      "orderId": "ZT2405060002",
      "createTime": "2026-08-04 14:30",
      "status": "reserved",
      "clientType": "corporate",
      "customer": {
        "name": "林佩瑜",
        "phone": "0912-345-678",
        "level": "企業員工"
      },
      "corporate": {
        "id": "CORP_002",
        "name": "臺積電股份有限公司",
        "shortName": "臺積電",
        "billingType": "企業月結"
      },
      "vehicle": {
        "group": "SUV組",
        "model": "Toyota RAV4",
        "plate": "RIMO-888",
        "currentStation": "新北總店"
      },
      "schedule": {
        "start": "2026-08-06 09:30",
        "end": "2026-08-09 18:00"
      },
      "location": {
        "pickup": "新北總店",
        "return": "新北總店"
      },
      "amount": 1920,
      "paymentStatus": "monthly_billing",
      "businessLine": "same_station",
      "serviceMode": "same_station",
      "billingMode": "monthly",
      "employee": {
        "name": "林佩瑜",
        "employeeNo": "E10003",
        "branch": "臺中分公司",
        "dept": "製造部"
      },
      "billingMonth": "2026-08",
      "billNo": "CB202608-001"
    }, {
      "orderId": "ZT2405060028",
      "createTime": "2026-08-04 15:20",
      "status": "reserved",
      "clientType": "corporate",
      "customer": {
        "name": "黃志明",
        "phone": "0920-118-520",
        "level": "企業員工"
      },
      "vehicle": {
        "group": "SUV組",
        "model": "Honda CR-V",
        "plate": "RIMO-620",
        "currentStation": "新北總店"
      },
      "schedule": {
        "start": "2026-08-07 10:00",
        "end": "2026-08-09 10:00"
      },
      "location": {
        "pickup": "新北總店",
        "return": "新北總店"
      },
      "amount": 2600,
      "paymentStatus": "deposit_paid",
      "businessLine": "same_station",
      "serviceMode": "same_station",
      "corporate": {
        "id": "CORP_002",
        "name": "臺積電股份有限公司",
        "shortName": "臺積電",
        "billingType": "員工自付"
      },
      "billingMode": "customer_pay",
      "employee": {
        "name": "黃志明",
        "employeeNo": "E10004",
        "branch": "新竹分公司",
        "dept": "研發部"
      }
    }, {
      "orderId": "ZT2405060004",
      "createTime": "2026-08-05 07:40",
      "status": "pickup_overdue",
      "customer": {
        "name": "張家緯",
        "phone": "0911-222-333",
        "level": "企業員工"
      },
      "vehicle": {
        "group": "經濟型",
        "model": "Toyota Vios",
        "plate": "RIMO-118",
        "currentStation": "臺北車站店"
      },
      "schedule": {
        "start": "2026-08-05 08:30",
        "end": "2026-08-07 08:30"
      },
      "location": {
        "pickup": "臺北車站店",
        "return": "臺北車站店"
      },
      "amount": 1680,
      "paymentStatus": "monthly_billing",
      "businessLine": "same_station",
      "serviceMode": "same_station",
      "clientType": "corporate",
      "corporate": {
        "id": "CORP_002",
        "name": "臺積電股份有限公司",
        "shortName": "臺積電",
        "billingType": "企業月結"
      },
      "billingMode": "monthly",
      "employee": {
        "name": "張家緯",
        "employeeNo": "E10005",
        "branch": "臺北分公司",
        "dept": "業務部"
      },
      "billingMonth": "2026-08",
      "billNo": "CB202608-001"
    }, {
      "orderId": "ZT2405060003",
      "createTime": "2026-08-05 08:50",
      "status": "inspecting",
      "clientType": "corporate",
      "customer": {
        "name": "吳淑芬",
        "phone": "0922-333-444",
        "level": "企業員工"
      },
      "corporate": {
        "id": "CORP_002",
        "name": "臺積電股份有限公司",
        "shortName": "臺積電",
        "billingType": "企業月結"
      },
      "vehicle": {
        "group": "豪華車組",
        "model": "BMW 3 Series",
        "plate": "RIMO-123",
        "currentStation": "臺北車站店"
      },
      "schedule": {
        "start": "2026-08-05 09:00",
        "end": "2026-08-07 09:00"
      },
      "location": {
        "pickup": "臺北車站店",
        "return": "臺北車站店"
      },
      "amount": 4500,
      "paymentStatus": "monthly_billing",
      "businessLine": "same_station",
      "serviceMode": "same_station",
      "billingMode": "monthly",
      "employee": {
        "name": "吳淑芬",
        "employeeNo": "E10006",
        "branch": "臺中分公司",
        "dept": "品保部"
      },
      "billingMonth": "2026-08",
      "billNo": "CB202608-001"
    }, {
      "orderId": "ZT2405040003",
      "createTime": "2026-08-03 14:20",
      "status": "renting",
      "customer": {
        "name": "蔡宗翰",
        "phone": "0922-123-456",
        "level": "企業員工"
      },
      "vehicle": {
        "group": "經濟型",
        "model": "Toyota Corolla",
        "plate": "RIMO-101",
        "currentStation": "臺北車站店"
      },
      "schedule": {
        "start": "2026-08-03 15:00",
        "end": "2026-08-06 10:00"
      },
      "location": {
        "pickup": "臺北車站店",
        "return": "臺北車站店"
      },
      "amount": 850,
      "paymentStatus": "paid",
      "businessLine": "same_station",
      "serviceMode": "same_station",
      "clientType": "corporate",
      "corporate": {
        "id": "CORP_002",
        "name": "臺積電股份有限公司",
        "shortName": "臺積電",
        "billingType": "員工自付"
      },
      "billingMode": "customer_pay",
      "employee": {
        "name": "蔡宗翰",
        "employeeNo": "E10007",
        "branch": "新竹分公司",
        "dept": "研發部"
      }
    }, {
      "orderId": "ZT2405060011",
      "createTime": "2026-08-03 16:40",
      "status": "renting",
      "clientType": "corporate",
      "billingMode": "monthly",
      "customer": {
        "name": "鄭雅雯",
        "phone": "0977-222-909",
        "level": "企業員工"
      },
      "corporate": {
        "id": "CORP_002",
        "name": "臺積電股份有限公司",
        "shortName": "臺積電",
        "billingType": "企業月結"
      },
      "vehicle": {
        "group": "SUV組",
        "model": "Toyota RAV4",
        "plate": "RIMO-721",
        "currentStation": "新北總店"
      },
      "schedule": {
        "start": "2026-08-03 17:00",
        "end": "2026-08-06 17:00"
      },
      "location": {
        "pickup": "新北總店",
        "return": "新北總店"
      },
      "amount": 4200,
      "paymentStatus": "monthly_billing",
      "businessLine": "same_station",
      "serviceMode": "same_station",
      "employee": {
        "name": "鄭雅雯",
        "employeeNo": "E10008",
        "branch": "臺北分公司",
        "dept": "業務部"
      },
      "billingMonth": "2026-08",
      "billNo": "CB202608-001"
    }, {
      "orderId": "ZT2405020008",
      "createTime": "2026-08-01 10:00",
      "status": "renewing",
      "customer": {
        "name": "許文彥",
        "phone": "0933-111-222",
        "level": "企業員工"
      },
      "vehicle": {
        "group": "商務車組",
        "model": "Honda Odyssey",
        "plate": "RIMO-777",
        "currentStation": "新北總店"
      },
      "schedule": {
        "start": "2026-08-01 11:00",
        "end": "2026-08-08 11:00"
      },
      "location": {
        "pickup": "新北總店",
        "return": "新北總店"
      },
      "amount": 5600,
      "paymentStatus": "monthly_billing",
      "businessLine": "same_station",
      "serviceMode": "same_station",
      "clientType": "corporate",
      "corporate": {
        "id": "CORP_002",
        "name": "臺積電股份有限公司",
        "shortName": "臺積電",
        "billingType": "企業月結"
      },
      "billingMode": "monthly",
      "employee": {
        "name": "許文彥",
        "employeeNo": "E10009",
        "branch": "臺中分公司",
        "dept": "製造部"
      },
      "billingMonth": "2026-08",
      "billNo": "CB202608-001"
    }, {
      "orderId": "ZT2404280005",
      "createTime": "2026-07-28 09:00",
      "status": "overdue",
      "customer": {
        "name": "曾國豪",
        "phone": "0987-654-321",
        "level": "企業員工"
      },
      "vehicle": {
        "group": "性能組",
        "model": "Tesla Model 3",
        "plate": "RIMO-911",
        "currentStation": "新北總店"
      },
      "schedule": {
        "start": "2026-07-28 10:00",
        "end": "2026-08-04 10:00"
      },
      "location": {
        "pickup": "新北總店",
        "return": "新北總店"
      },
      "amount": 8000,
      "paymentStatus": "paid",
      "businessLine": "same_station",
      "serviceMode": "same_station",
      "clientType": "corporate",
      "corporate": {
        "id": "CORP_002",
        "name": "臺積電股份有限公司",
        "shortName": "臺積電",
        "billingType": "員工自付"
      },
      "billingMode": "customer_pay",
      "employee": {
        "name": "曾國豪",
        "employeeNo": "E10010",
        "branch": "新竹分公司",
        "dept": "研發部"
      }
    }, {
      "orderId": "ZT2405030031",
      "createTime": "2026-08-02 16:20",
      "status": "accident_processing",
      "customer": {
        "name": "洪若庭",
        "phone": "0988-222-111",
        "level": "企業員工"
      },
      "vehicle": {
        "group": "SUV組",
        "model": "Honda CR-V",
        "plate": "RIMO-520",
        "currentStation": "新北總店"
      },
      "schedule": {
        "start": "2026-08-02 18:00",
        "end": "2026-08-06 18:00"
      },
      "location": {
        "pickup": "新北總店",
        "return": "新北總店"
      },
      "amount": 3600,
      "paymentStatus": "monthly_billing",
      "businessLine": "same_station",
      "serviceMode": "same_station",
      "clientType": "corporate",
      "corporate": {
        "id": "CORP_002",
        "name": "臺積電股份有限公司",
        "shortName": "臺積電",
        "billingType": "企業月結"
      },
      "billingMode": "monthly",
      "employee": {
        "name": "洪若庭",
        "employeeNo": "E10011",
        "branch": "臺北分公司",
        "dept": "業務部"
      },
      "billingMonth": "2026-08",
      "billNo": "CB202608-001"
    }, {
      "orderId": "ZT2405050066",
      "createTime": "2026-08-04 09:45",
      "status": "no_show",
      "customer": {
        "name": "蘇明傑",
        "phone": "0922-777-888",
        "level": "企業員工"
      },
      "vehicle": {
        "group": "經濟型",
        "model": "Honda Fit",
        "plate": "RSM-2145",
        "currentStation": "臺北車站店"
      },
      "schedule": {
        "start": "2026-08-04 14:00",
        "end": "2026-08-05 14:00"
      },
      "location": {
        "pickup": "臺北車站店",
        "return": "臺北車站店"
      },
      "amount": 600,
      "paymentStatus": "monthly_billing",
      "businessLine": "same_station",
      "serviceMode": "same_station",
      "clientType": "corporate",
      "corporate": {
        "id": "CORP_002",
        "name": "臺積電股份有限公司",
        "shortName": "臺積電",
        "billingType": "企業月結"
      },
      "billingMode": "monthly",
      "employee": {
        "name": "蘇明傑",
        "employeeNo": "E10012",
        "branch": "臺中分公司",
        "dept": "品保部"
      },
      "billingMonth": "2026-08",
      "billNo": "CB202608-001"
    }, {
      "orderId": "ZT2405050012",
      "createTime": "2026-08-04 08:00",
      "status": "settlement_pending",
      "customer": {
        "name": "賴建成",
        "phone": "0955-666-777",
        "level": "企業員工"
      },
      "vehicle": {
        "group": "經濟型",
        "model": "Honda Fit",
        "plate": "RIMO-202",
        "currentStation": "新北總店"
      },
      "schedule": {
        "start": "2026-08-04 09:00",
        "end": "2026-08-05 09:00"
      },
      "location": {
        "pickup": "新北總店",
        "return": "新北總店"
      },
      "amount": 1500,
      "paymentStatus": "partial_paid",
      "businessLine": "same_station",
      "serviceMode": "same_station",
      "clientType": "corporate",
      "corporate": {
        "id": "CORP_002",
        "name": "臺積電股份有限公司",
        "shortName": "臺積電",
        "billingType": "員工自付"
      },
      "billingMode": "customer_pay",
      "employee": {
        "name": "賴建成",
        "employeeNo": "E10013",
        "branch": "新竹分公司",
        "dept": "研發部"
      }
    }, {
      "orderId": "ZT2405050013",
      "createTime": "2026-08-04 09:20",
      "status": "settlement_pending",
      "clientType": "corporate",
      "billingMode": "monthly",
      "customer": {
        "name": "江怡君",
        "phone": "0966-888-321",
        "level": "企業員工"
      },
      "corporate": {
        "id": "CORP_002",
        "name": "臺積電股份有限公司",
        "shortName": "臺積電",
        "billingType": "企業月結"
      },
      "vehicle": {
        "group": "商務車組",
        "model": "Honda Odyssey",
        "plate": "RIMO-771",
        "currentStation": "新北總店"
      },
      "schedule": {
        "start": "2026-08-04 10:00",
        "end": "2026-08-05 10:00"
      },
      "location": {
        "pickup": "新北總店",
        "return": "新北總店"
      },
      "amount": 3650,
      "paymentStatus": "monthly_billing",
      "businessLine": "same_station",
      "serviceMode": "same_station",
      "employee": {
        "name": "江怡君",
        "employeeNo": "E10014",
        "branch": "臺北分公司",
        "dept": "業務部"
      },
      "billingMonth": "2026-08",
      "billNo": "CB202608-001"
    }, {
      "orderId": "ZT2405010022",
      "createTime": "2026-07-31 10:30",
      "status": "payment_due",
      "customer": {
        "name": "邱柏翰",
        "phone": "0966-123-123",
        "level": "企業員工"
      },
      "vehicle": {
        "group": "豪華車組",
        "model": "Benz C300",
        "plate": "RIMO-300",
        "currentStation": "新北總店"
      },
      "schedule": {
        "start": "2026-07-31 14:00",
        "end": "2026-08-03 14:00"
      },
      "location": {
        "pickup": "新北總店",
        "return": "新北總店"
      },
      "amount": 4800,
      "paymentStatus": "payment_due",
      "businessLine": "same_station",
      "serviceMode": "same_station",
      "clientType": "corporate",
      "corporate": {
        "id": "CORP_002",
        "name": "臺積電股份有限公司",
        "shortName": "臺積電",
        "billingType": "員工自付"
      },
      "billingMode": "customer_pay",
      "employee": {
        "name": "邱柏翰",
        "employeeNo": "E10015",
        "branch": "臺中分公司",
        "dept": "製造部"
      }
    }, {
      "orderId": "ZT2405020018",
      "createTime": "2026-08-01 11:15",
      "status": "refund_pending",
      "customer": {
        "name": "高玉萍",
        "phone": "0977-444-555",
        "level": "企業員工"
      },
      "vehicle": {
        "group": "SUV組",
        "model": "Nissan X-Trail",
        "plate": "RIMO-404",
        "currentStation": "臺北車站店"
      },
      "schedule": {
        "start": "2026-08-01 12:00",
        "end": "2026-08-03 12:00"
      },
      "location": {
        "pickup": "臺北車站店",
        "return": "臺北車站店"
      },
      "amount": 2800,
      "paymentStatus": "refund_pending",
      "businessLine": "same_station",
      "serviceMode": "same_station",
      "clientType": "corporate",
      "corporate": {
        "id": "CORP_002",
        "name": "臺積電股份有限公司",
        "shortName": "臺積電",
        "billingType": "員工自付"
      },
      "billingMode": "customer_pay",
      "employee": {
        "name": "高玉萍",
        "employeeNo": "E10016",
        "branch": "新竹分公司",
        "dept": "研發部"
      }
    }, {
      "orderId": "ZT2404300001",
      "createTime": "2026-07-30 09:00",
      "status": "completed",
      "customer": {
        "name": "詹凱翔",
        "phone": "0933-987-654",
        "level": "企業員工"
      },
      "vehicle": {
        "group": "商務車組",
        "model": "Honda Odyssey",
        "plate": "RIMO-999",
        "currentStation": "新北總店"
      },
      "schedule": {
        "start": "2026-07-30 10:00",
        "end": "2026-08-01 10:00"
      },
      "location": {
        "pickup": "新北總店",
        "return": "新北總店"
      },
      "amount": 3200,
      "paymentStatus": "monthly_billing",
      "businessLine": "same_station",
      "serviceMode": "same_station",
      "clientType": "corporate",
      "corporate": {
        "id": "CORP_002",
        "name": "臺積電股份有限公司",
        "shortName": "臺積電",
        "billingType": "企業月結"
      },
      "billingMode": "monthly",
      "employee": {
        "name": "詹凱翔",
        "employeeNo": "E10017",
        "branch": "臺北分公司",
        "dept": "業務部"
      },
      "billingMonth": "2026-07",
      "billNo": "CB202607-001"
    }, {
      "orderId": "ZT2404250018",
      "createTime": "2026-07-25 10:00",
      "status": "completed",
      "customer": {
        "name": "盧彥廷",
        "phone": "0912-888-666",
        "level": "企業員工"
      },
      "vehicle": {
        "group": "SUV組",
        "model": "Toyota RAV4",
        "plate": "RIMO-666",
        "currentStation": "新北總店"
      },
      "schedule": {
        "start": "2026-07-25 11:00",
        "end": "2026-07-28 11:00"
      },
      "location": {
        "pickup": "新北總店",
        "return": "新北總店"
      },
      "amount": 2800,
      "paymentStatus": "monthly_billing",
      "postCharge": {
        "count": 2,
        "amount": 1885,
        "status": "pending_notify"
      },
      "businessLine": "same_station",
      "serviceMode": "same_station",
      "clientType": "corporate",
      "corporate": {
        "id": "CORP_002",
        "name": "臺積電股份有限公司",
        "shortName": "臺積電",
        "billingType": "企業月結"
      },
      "billingMode": "monthly",
      "employee": {
        "name": "盧彥廷",
        "employeeNo": "E10018",
        "branch": "臺中分公司",
        "dept": "品保部"
      },
      "billingMonth": "2026-07",
      "billNo": "CB202607-001"
    }, {
      "orderId": "ZT2404240021",
      "createTime": "2026-07-24 15:40",
      "status": "completed",
      "customer": {
        "name": "範振宇",
        "phone": "0939-220-168",
        "level": "企業員工"
      },
      "vehicle": {
        "group": "經濟型",
        "model": "Toyota Vios",
        "plate": "RIMO-216",
        "currentStation": "臺北車站店"
      },
      "schedule": {
        "start": "2026-07-24 16:00",
        "end": "2026-07-26 16:00"
      },
      "location": {
        "pickup": "臺北車站店",
        "return": "臺北車站店"
      },
      "amount": 1800,
      "paymentStatus": "paid",
      "postCharge": {
        "count": 1,
        "amount": 680,
        "status": "payment_due"
      },
      "businessLine": "same_station",
      "serviceMode": "same_station",
      "clientType": "corporate",
      "corporate": {
        "id": "CORP_002",
        "name": "臺積電股份有限公司",
        "shortName": "臺積電",
        "billingType": "員工自付"
      },
      "billingMode": "customer_pay",
      "employee": {
        "name": "範振宇",
        "employeeNo": "E10019",
        "branch": "新竹分公司",
        "dept": "研發部"
      }
    }, {
      "orderId": "ZT2404240033",
      "createTime": "2026-07-24 17:20",
      "status": "completed",
      "customer": {
        "name": "石孟儒",
        "phone": "0918-330-220",
        "level": "企業員工"
      },
      "vehicle": {
        "group": "經濟型",
        "model": "Honda Fit",
        "plate": "RIMO-218",
        "currentStation": "臺北車站店"
      },
      "schedule": {
        "start": "2026-07-24 18:00",
        "end": "2026-07-25 18:00"
      },
      "location": {
        "pickup": "臺北車站店",
        "return": "臺北車站店"
      },
      "amount": 1600,
      "paymentStatus": "monthly_billing",
      "postCharge": {
        "count": 1,
        "amount": 420,
        "status": "notified"
      },
      "businessLine": "same_station",
      "serviceMode": "same_station",
      "clientType": "corporate",
      "corporate": {
        "id": "CORP_002",
        "name": "臺積電股份有限公司",
        "shortName": "臺積電",
        "billingType": "企業月結"
      },
      "billingMode": "monthly",
      "employee": {
        "name": "石孟儒",
        "employeeNo": "E10020",
        "branch": "臺北分公司",
        "dept": "業務部"
      },
      "billingMonth": "2026-07",
      "billNo": "CB202607-001"
    }, {
      "orderId": "ZT2404230009",
      "createTime": "2026-07-23 12:10",
      "status": "completed",
      "customer": {
        "name": "傅雅琪",
        "phone": "0921-909-777",
        "level": "企業員工"
      },
      "vehicle": {
        "group": "SUV組",
        "model": "Honda CR-V",
        "plate": "RIMO-620",
        "currentStation": "新北總店"
      },
      "schedule": {
        "start": "2026-07-23 13:00",
        "end": "2026-07-24 13:00"
      },
      "location": {
        "pickup": "新北總店",
        "return": "新北總店"
      },
      "amount": 2300,
      "paymentStatus": "monthly_billing",
      "postCharge": {
        "count": 1,
        "amount": 360,
        "status": "paid"
      },
      "businessLine": "same_station",
      "serviceMode": "same_station",
      "clientType": "corporate",
      "corporate": {
        "id": "CORP_002",
        "name": "臺積電股份有限公司",
        "shortName": "臺積電",
        "billingType": "企業月結"
      },
      "billingMode": "monthly",
      "employee": {
        "name": "傅雅琪",
        "employeeNo": "E10021",
        "branch": "臺中分公司",
        "dept": "製造部"
      },
      "billingMonth": "2026-07",
      "billNo": "CB202607-001"
    }, {
      "orderId": "ZT2404300011",
      "createTime": "2026-07-30 13:30",
      "status": "completed",
      "clientType": "corporate",
      "billingMode": "monthly",
      "customer": {
        "name": "溫尚諺",
        "phone": "0968-222-555",
        "level": "企業員工"
      },
      "corporate": {
        "id": "CORP_002",
        "name": "臺積電股份有限公司",
        "shortName": "臺積電",
        "billingType": "企業月結"
      },
      "vehicle": {
        "group": "經濟車組",
        "model": "Toyota Yaris",
        "plate": "RIMO-118",
        "currentStation": "新北總店"
      },
      "schedule": {
        "start": "2026-07-30 14:00",
        "end": "2026-08-01 14:00"
      },
      "location": {
        "pickup": "新北總店",
        "return": "新北總店"
      },
      "amount": 3200,
      "paymentStatus": "monthly_billing",
      "postCharge": {
        "count": 1,
        "amount": 980,
        "status": "monthly_billing"
      },
      "businessLine": "same_station",
      "serviceMode": "same_station",
      "employee": {
        "name": "溫尚諺",
        "employeeNo": "E10022",
        "branch": "新竹分公司",
        "dept": "研發部"
      },
      "billingMonth": "2026-07",
      "billNo": "CB202607-001"
    }, {
      "orderId": "ZT2405010005",
      "createTime": "2026-07-31 08:30",
      "status": "cancelled",
      "customer": {
        "name": "柯世賢",
        "phone": "0955-555-123",
        "level": "企業員工"
      },
      "vehicle": {
        "group": "經濟型",
        "model": "Honda Fit",
        "plate": "RSM-3255",
        "currentStation": "臺北車站店"
      },
      "schedule": {
        "start": "2026-08-01 10:00",
        "end": "2026-08-02 10:00"
      },
      "location": {
        "pickup": "臺北車站店",
        "return": "臺北車站店"
      },
      "amount": 0,
      "paymentStatus": "monthly_billing",
      "businessLine": "same_station",
      "serviceMode": "same_station",
      "clientType": "corporate",
      "corporate": {
        "id": "CORP_002",
        "name": "臺積電股份有限公司",
        "shortName": "臺積電",
        "billingType": "企業月結"
      },
      "billingMode": "monthly",
      "employee": {
        "name": "柯世賢",
        "employeeNo": "E10023",
        "branch": "臺北分公司",
        "dept": "業務部"
      },
      "billingMonth": "2026-07",
      "billNo": "CB202607-001"
    }, {
      "orderId": "ZT2405010012",
      "createTime": "2026-07-31 10:20",
      "status": "cancelled",
      "customer": {
        "name": "阮秋蘭",
        "phone": "0936-551-208",
        "level": "企業員工"
      },
      "vehicle": {
        "group": "經濟型",
        "model": "Toyota Vios",
        "plate": "RSM-3362",
        "currentStation": "臺北車站店"
      },
      "schedule": {
        "start": "2026-08-02 09:00",
        "end": "2026-08-04 09:00"
      },
      "location": {
        "pickup": "臺北車站店",
        "return": "臺北車站店"
      },
      "amount": 0,
      "paymentStatus": "monthly_billing",
      "postCharge": {
        "count": 1,
        "amount": 300,
        "status": "pending_notify"
      },
      "businessLine": "same_station",
      "serviceMode": "same_station",
      "clientType": "corporate",
      "corporate": {
        "id": "CORP_002",
        "name": "臺積電股份有限公司",
        "shortName": "臺積電",
        "billingType": "企業月結"
      },
      "billingMode": "monthly",
      "employee": {
        "name": "阮秋蘭",
        "employeeNo": "E10024",
        "branch": "臺中分公司",
        "dept": "品保部"
      },
      "billingMonth": "2026-07",
      "billNo": "CB202607-001"
    }, {
      "orderId": "ZT2405060099",
      "createTime": "2026-08-05 13:00",
      "status": "rejected",
      "customer": {
        "name": "簡偉傑",
        "phone": "0900-000-000",
        "level": "企業員工"
      },
      "vehicle": {
        "group": "豪華車組",
        "model": "Porsche Macan",
        "plate": "RSM-3477",
        "currentStation": "新北總店"
      },
      "schedule": {
        "start": "2026-08-06 10:00",
        "end": "2026-08-07 10:00"
      },
      "location": {
        "pickup": "新北總店",
        "return": "新北總店"
      },
      "amount": 0,
      "paymentStatus": "unpaid",
      "businessLine": "same_station",
      "serviceMode": "same_station",
      "clientType": "corporate",
      "corporate": {
        "id": "CORP_002",
        "name": "臺積電股份有限公司",
        "shortName": "臺積電",
        "billingType": "員工自付"
      },
      "billingMode": "customer_pay",
      "employee": {
        "name": "簡偉傑",
        "employeeNo": "E10025",
        "branch": "新竹分公司",
        "dept": "研發部"
      }
    }, {
      "orderId": "ZT2405050072",
      "createTime": "2026-08-04 17:30",
      "status": "no_show",
      "customer": {
        "name": "塗敏華",
        "phone": "0916-661-909",
        "level": "企業員工"
      },
      "vehicle": {
        "group": "經濟型",
        "model": "Toyota Yaris",
        "plate": "RSM-3584",
        "currentStation": "新北總店"
      },
      "schedule": {
        "start": "2026-08-04 13:00",
        "end": "2026-08-06 13:00"
      },
      "location": {
        "pickup": "新北總店",
        "return": "新北總店"
      },
      "amount": 900,
      "paymentStatus": "monthly_billing",
      "postCharge": {
        "count": 1,
        "amount": 200,
        "status": "payment_due"
      },
      "businessLine": "same_station",
      "serviceMode": "same_station",
      "clientType": "corporate",
      "corporate": {
        "id": "CORP_002",
        "name": "臺積電股份有限公司",
        "shortName": "臺積電",
        "billingType": "企業月結"
      },
      "billingMode": "monthly",
      "employee": {
        "name": "塗敏華",
        "employeeNo": "E10026",
        "branch": "臺北分公司",
        "dept": "業務部"
      },
      "billingMonth": "2026-08",
      "billNo": "CB202608-001"
    }, {
      "orderId": "ZT2405060108",
      "createTime": "2026-08-05 15:20",
      "status": "closed",
      "customer": {
        "name": "翁士豪",
        "phone": "0919-000-888",
        "level": "企業員工"
      },
      "vehicle": {
        "group": "商務車組",
        "model": "Honda Odyssey",
        "plate": "RIMO-313",
        "currentStation": "新北總店"
      },
      "schedule": {
        "start": "2026-08-05 16:00",
        "end": "2026-08-08 16:00"
      },
      "location": {
        "pickup": "新北總店",
        "return": "新北總店"
      },
      "amount": 0,
      "paymentStatus": "monthly_billing",
      "businessLine": "same_station",
      "serviceMode": "same_station",
      "clientType": "corporate",
      "corporate": {
        "id": "CORP_002",
        "name": "臺積電股份有限公司",
        "shortName": "臺積電",
        "billingType": "企業月結"
      },
      "billingMode": "monthly",
      "employee": {
        "name": "翁士豪",
        "employeeNo": "E10027",
        "branch": "臺中分公司",
        "dept": "製造部"
      },
      "billingMonth": "2026-08",
      "billNo": "CB202608-001"
    }, {
      "orderId": "TW2608050001",
      "createTime": "2026-08-05 09:35",
      "status": "reserved",
      "businessLine": "one_way",
      "serviceMode": "one_way",
      "clientType": "corporate",
      "customer": {
        "name": "康書豪",
        "phone": "0988-456-210",
        "level": "企業員工"
      },
      "vehicle": {
        "group": "小型車",
        "model": "Toyota Yaris",
        "plate": "RSA-1028",
        "currentStation": "臺北車站 A3 據點"
      },
      "schedule": {
        "start": "2026-08-05 13:30",
        "end": ""
      },
      "location": {
        "pickup": "臺北車站 A3 據點",
        "return": ""
      },
      "amount": 520,
      "paymentStatus": "deposit_paid",
      "corporate": {
        "id": "CORP_002",
        "name": "臺積電股份有限公司",
        "shortName": "臺積電",
        "billingType": "員工自付"
      },
      "billingMode": "customer_pay",
      "employee": {
        "name": "康書豪",
        "employeeNo": "E10028",
        "branch": "新竹分公司",
        "dept": "研發部"
      }
    }, {
      "orderId": "TW2608050002",
      "createTime": "2026-08-05 08:30",
      "status": "renting",
      "businessLine": "one_way",
      "serviceMode": "one_way",
      "clientType": "corporate",
      "customer": {
        "name": "莊雅涵",
        "phone": "0977-222-909",
        "level": "企業員工"
      },
      "vehicle": {
        "group": "跨界休旅",
        "model": "Toyota Corolla Cross",
        "plate": "RSB-7751",
        "currentStation": "新北板橋捷運站"
      },
      "schedule": {
        "start": "2026-08-05 09:00",
        "end": ""
      },
      "location": {
        "pickup": "新北板橋捷運站",
        "return": ""
      },
      "amount": 920,
      "paymentStatus": "monthly_billing",
      "corporate": {
        "id": "CORP_002",
        "name": "臺積電股份有限公司",
        "shortName": "臺積電",
        "billingType": "企業月結"
      },
      "billingMode": "monthly",
      "employee": {
        "name": "莊雅涵",
        "employeeNo": "E10029",
        "branch": "臺北分公司",
        "dept": "業務部"
      },
      "billingMonth": "2026-08",
      "billNo": "CB202608-001"
    }, {
      "orderId": "TW2608040015",
      "createTime": "2026-08-04 17:10",
      "status": "renewing",
      "businessLine": "one_way",
      "serviceMode": "one_way",
      "clientType": "corporate",
      "customer": {
        "name": "繆承翰",
        "phone": "0920-118-520",
        "level": "企業員工"
      },
      "vehicle": {
        "group": "電動車",
        "model": "Tesla Model 3",
        "plate": "RSC-8882",
        "currentStation": "臺北市政府站"
      },
      "schedule": {
        "start": "2026-08-04 18:00",
        "end": ""
      },
      "location": {
        "pickup": "臺北市政府站",
        "return": ""
      },
      "amount": 2380,
      "paymentStatus": "monthly_billing",
      "corporate": {
        "id": "CORP_002",
        "name": "臺積電股份有限公司",
        "shortName": "臺積電",
        "billingType": "企業月結"
      },
      "billingMode": "monthly",
      "employee": {
        "name": "繆承翰",
        "employeeNo": "E10030",
        "branch": "臺中分公司",
        "dept": "品保部"
      },
      "billingMonth": "2026-08",
      "billNo": "CB202608-001"
    }, {
      "orderId": "TW2608040007",
      "createTime": "2026-08-04 08:00",
      "status": "overdue",
      "businessLine": "one_way",
      "serviceMode": "one_way",
      "clientType": "corporate",
      "customer": {
        "name": "閻柏毅",
        "phone": "0988-222-111",
        "level": "企業員工"
      },
      "vehicle": {
        "group": "跨界休旅",
        "model": "Nissan Kicks",
        "plate": "RSD-5207",
        "currentStation": "桃園高鐵站"
      },
      "schedule": {
        "start": "2026-08-04 09:00",
        "end": ""
      },
      "location": {
        "pickup": "桃園高鐵站",
        "return": ""
      },
      "amount": 1860,
      "paymentStatus": "paid",
      "corporate": {
        "id": "CORP_002",
        "name": "臺積電股份有限公司",
        "shortName": "臺積電",
        "billingType": "員工自付"
      },
      "billingMode": "customer_pay",
      "employee": {
        "name": "閻柏毅",
        "employeeNo": "E10031",
        "branch": "新竹分公司",
        "dept": "研發部"
      }
    }, {
      "orderId": "TW2608040005",
      "createTime": "2026-08-04 07:45",
      "status": "accident_processing",
      "businessLine": "one_way",
      "serviceMode": "one_way",
      "clientType": "corporate",
      "customer": {
        "name": "聶詠心",
        "phone": "0977-444-555",
        "level": "企業員工"
      },
      "vehicle": {
        "group": "SUV",
        "model": "Toyota RAV4",
        "plate": "RSE-4046",
        "currentStation": "臺中高鐵站"
      },
      "schedule": {
        "start": "2026-08-04 08:30",
        "end": ""
      },
      "location": {
        "pickup": "臺中高鐵站",
        "return": ""
      },
      "amount": 3260,
      "paymentStatus": "monthly_billing",
      "corporate": {
        "id": "CORP_002",
        "name": "臺積電股份有限公司",
        "shortName": "臺積電",
        "billingType": "企業月結"
      },
      "billingMode": "monthly",
      "employee": {
        "name": "聶詠心",
        "employeeNo": "E10032",
        "branch": "臺北分公司",
        "dept": "業務部"
      },
      "billingMonth": "2026-08",
      "billNo": "CB202608-001"
    }, {
      "orderId": "TW2608030021",
      "createTime": "2026-08-03 15:20",
      "status": "completed",
      "businessLine": "one_way",
      "serviceMode": "one_way",
      "clientType": "corporate",
      "customer": {
        "name": "屠偉宏",
        "phone": "0912-888-666",
        "level": "企業員工"
      },
      "vehicle": {
        "group": "跨界休旅",
        "model": "Toyota Corolla Cross",
        "plate": "RSF-6668",
        "currentStation": "臺北車站 A3 據點"
      },
      "schedule": {
        "start": "2026-08-03 16:00",
        "end": "2026-08-04 10:00"
      },
      "location": {
        "pickup": "臺北車站 A3 據點",
        "return": "高雄左營高鐵站"
      },
      "amount": 2860,
      "paymentStatus": "monthly_billing",
      "postCharge": {
        "count": 1,
        "amount": 680,
        "status": "pending_notify"
      },
      "corporate": {
        "id": "CORP_002",
        "name": "臺積電股份有限公司",
        "shortName": "臺積電",
        "billingType": "企業月結"
      },
      "billingMode": "monthly",
      "employee": {
        "name": "屠偉宏",
        "employeeNo": "E10033",
        "branch": "臺中分公司",
        "dept": "製造部"
      },
      "billingMonth": "2026-08",
      "billNo": "CB202608-001"
    }, {
      "orderId": "TW2608030018",
      "createTime": "2026-08-03 11:40",
      "status": "completed",
      "businessLine": "one_way",
      "serviceMode": "one_way",
      "clientType": "corporate",
      "customer": {
        "name": "樂雅筑",
        "phone": "0939-220-168",
        "level": "企業員工"
      },
      "vehicle": {
        "group": "小型車",
        "model": "Toyota Yaris",
        "plate": "RSG-2160",
        "currentStation": "桃園高鐵站"
      },
      "schedule": {
        "start": "2026-08-03 12:00",
        "end": "2026-08-03 18:00"
      },
      "location": {
        "pickup": "桃園高鐵站",
        "return": "臺北市政府站"
      },
      "amount": 980,
      "paymentStatus": "paid",
      "corporate": {
        "id": "CORP_002",
        "name": "臺積電股份有限公司",
        "shortName": "臺積電",
        "billingType": "員工自付"
      },
      "billingMode": "customer_pay",
      "employee": {
        "name": "樂雅筑",
        "employeeNo": "E10034",
        "branch": "新竹分公司",
        "dept": "研發部"
      }
    }, {
      "orderId": "TW2608030014",
      "createTime": "2026-08-03 09:25",
      "status": "settlement_pending",
      "businessLine": "one_way",
      "serviceMode": "one_way",
      "clientType": "corporate",
      "customer": {
        "name": "禹哲宇",
        "phone": "0918-330-220",
        "level": "企業員工"
      },
      "vehicle": {
        "group": "小型車",
        "model": "Honda Fit",
        "plate": "RSH-2189",
        "currentStation": "高雄左營高鐵站"
      },
      "schedule": {
        "start": "2026-08-03 10:00",
        "end": "2026-08-03 17:00"
      },
      "location": {
        "pickup": "高雄左營高鐵站",
        "return": "臺中高鐵站"
      },
      "amount": 1280,
      "paymentStatus": "partial_paid",
      "corporate": {
        "id": "CORP_002",
        "name": "臺積電股份有限公司",
        "shortName": "臺積電",
        "billingType": "員工自付"
      },
      "billingMode": "customer_pay",
      "employee": {
        "name": "禹哲宇",
        "employeeNo": "E10035",
        "branch": "臺北分公司",
        "dept": "業務部"
      }
    }, {
      "orderId": "TW2608020010",
      "createTime": "2026-08-02 13:10",
      "status": "payment_due",
      "businessLine": "one_way",
      "serviceMode": "one_way",
      "clientType": "corporate",
      "customer": {
        "name": "狄芳瑜",
        "phone": "0921-909-777",
        "level": "企業員工"
      },
      "vehicle": {
        "group": "電動車",
        "model": "Tesla Model 3",
        "plate": "RSJ-6205",
        "currentStation": "新北板橋捷運站"
      },
      "schedule": {
        "start": "2026-08-02 14:00",
        "end": "2026-08-03 10:00"
      },
      "location": {
        "pickup": "新北板橋捷運站",
        "return": "臺北車站 A3 據點"
      },
      "amount": 2520,
      "paymentStatus": "payment_due",
      "corporate": {
        "id": "CORP_002",
        "name": "臺積電股份有限公司",
        "shortName": "臺積電",
        "billingType": "員工自付"
      },
      "billingMode": "customer_pay",
      "employee": {
        "name": "狄芳瑜",
        "employeeNo": "E10036",
        "branch": "臺中分公司",
        "dept": "品保部"
      }
    }, {
      "orderId": "TW2608020008",
      "createTime": "2026-08-02 09:50",
      "status": "refund_pending",
      "businessLine": "one_way",
      "serviceMode": "one_way",
      "clientType": "corporate",
      "customer": {
        "name": "米昱翔",
        "phone": "0966-888-321",
        "level": "企業員工"
      },
      "vehicle": {
        "group": "SUV",
        "model": "Toyota RAV4",
        "plate": "RSK-7712",
        "currentStation": "臺中高鐵站"
      },
      "schedule": {
        "start": "2026-08-02 10:30",
        "end": "2026-08-02 20:00"
      },
      "location": {
        "pickup": "臺中高鐵站",
        "return": "桃園高鐵站"
      },
      "amount": 2140,
      "paymentStatus": "refund_pending",
      "corporate": {
        "id": "CORP_002",
        "name": "臺積電股份有限公司",
        "shortName": "臺積電",
        "billingType": "員工自付"
      },
      "billingMode": "customer_pay",
      "employee": {
        "name": "米昱翔",
        "employeeNo": "E10037",
        "branch": "新竹分公司",
        "dept": "研發部"
      }
    }, {
      "orderId": "TW2608010012",
      "createTime": "2026-08-01 11:20",
      "status": "cancelled",
      "businessLine": "one_way",
      "serviceMode": "one_way",
      "clientType": "corporate",
      "customer": {
        "name": "貝宗霖",
        "phone": "0936-551-208",
        "level": "企業員工"
      },
      "vehicle": {
        "group": "小型車",
        "model": "Toyota Yaris",
        "plate": "RSL-5512",
        "currentStation": "臺北市政府站"
      },
      "schedule": {
        "start": "2026-08-01 15:00",
        "end": ""
      },
      "location": {
        "pickup": "臺北市政府站",
        "return": ""
      },
      "amount": 0,
      "paymentStatus": "monthly_billing",
      "corporate": {
        "id": "CORP_002",
        "name": "臺積電股份有限公司",
        "shortName": "臺積電",
        "billingType": "企業月結"
      },
      "billingMode": "monthly",
      "employee": {
        "name": "貝宗霖",
        "employeeNo": "E10038",
        "branch": "臺北分公司",
        "dept": "業務部"
      },
      "billingMonth": "2026-08",
      "billNo": "CB202608-001"
    }, {
      "orderId": "TW2608010006",
      "createTime": "2026-08-01 08:45",
      "status": "no_show",
      "businessLine": "one_way",
      "serviceMode": "one_way",
      "clientType": "corporate",
      "customer": {
        "name": "明伊蓁",
        "phone": "0916-661-909",
        "level": "企業員工"
      },
      "vehicle": {
        "group": "小型車",
        "model": "Honda Fit",
        "plate": "RSM-1909",
        "currentStation": "臺北車站 A3 據點"
      },
      "schedule": {
        "start": "2026-08-01 10:00",
        "end": ""
      },
      "location": {
        "pickup": "臺北車站 A3 據點",
        "return": ""
      },
      "amount": 300,
      "paymentStatus": "monthly_billing",
      "corporate": {
        "id": "CORP_002",
        "name": "臺積電股份有限公司",
        "shortName": "臺積電",
        "billingType": "企業月結"
      },
      "billingMode": "monthly",
      "employee": {
        "name": "明伊蓁",
        "employeeNo": "E10039",
        "branch": "臺中分公司",
        "dept": "製造部"
      },
      "billingMonth": "2026-08",
      "billNo": "CB202608-001"
    }]);
    const activeTab = ref('all');
    const permissionDemoMode = ref('BOTH');
    const permissionDemoOptions = [{
      label: '全部授權',
      value: 'BOTH'
    }, {
      label: '僅同站租還',
      value: 'SAME'
    }, {
      label: '僅甲租乙還',
      value: 'ONE_WAY'
    }];
    const hasSameStationPermission = computed(() => ['BOTH', 'SAME'].includes(permissionDemoMode.value));
    const hasOneWayPermission = computed(() => ['BOTH', 'ONE_WAY'].includes(permissionDemoMode.value));
    const setPermissionDemoMode = mode => {
      permissionDemoMode.value = mode;
      activeTab.value = mode === 'BOTH' ? 'all' : mode === 'SAME' ? 'same_station' : 'one_way';
      currentPage.value = 1;
      activeStatFilter.value = '';
    };
    const allOrderCount = computed(() => orders.length);
    const sameStationOrderCount = computed(() => orders.filter(o => o.businessLine === 'same_station').length);
    const oneWayOrderCount = computed(() => orders.filter(o => o.businessLine === 'one_way').length);
    const handleNewOrder = command => {
      let type = command || activeTab.value;
      if (type === 'all') {
        type = hasSameStationPermission.value ? 'same_station' : 'one_way';
      }
      if (type === 'same_station' && !hasSameStationPermission.value) type = 'one_way';
      if (type === 'one_way' && !hasOneWayPermission.value) type = 'same_station';
      const routeMap = {
        same_station: 'new_order_same_station.html',
        one_way: 'new_order_one_way.html'
      };
      window.location.href = routeMap[type] || routeMap.same_station;
    };
    const filters = reactive({
      keyword: '',
      branch: '',
      dept: '',
      billingMode: '',
      status: [],
      postChargeStatus: '',
      vehiclePlate: '',
      createTimeRange: [],
      pickupTimeRange: [],
      returnTimeRange: [],
      pickupStore: [],
      returnStore: [],
      vehicleGroup: ''
    });
    const statsView = ref('task');
    const activeStatFilter = ref('');
    const mockToday = '2026-08-05';
    const mockNow = new Date('2026-08-05T10:00:00');
    const isTodayDateTime = value => Boolean(value) && value.slice(0, 10) === mockToday;
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
    const branches = computed(() => {
      const s = new Set();
      orders.forEach(o => {
        if (o.employee?.branch) s.add(o.employee.branch);
      });
      return Array.from(s).sort();
    });
    const departments = computed(() => {
      const s = new Set();
      orders.forEach(o => {
        if (!o.employee?.dept) return;
        if (filters.branch && o.employee.branch !== filters.branch) return;
        s.add(o.employee.dept);
      });
      return Array.from(s).sort();
    });
    const pickupFocusStatuses = ['pending_payment', 'reserved', 'pickup_overdue'];
    const returnFocusStatuses = ['renting', 'renewing', 'overdue'];
    const settlementFocusStatuses = ['settlement_pending', 'payment_due', 'refund_pending'];
    const toDateTime = value => value ? new Date(value.replace(' ', 'T')) : null;
    const isToday = value => !!value && value.startsWith(mockToday);
    const isDateInRange = (value, range) => {
      if (!Array.isArray(range) || range.length !== 2 || !range[0] || !range[1]) return true;
      if (!value) return false;
      const date = value.slice(0, 10);
      return date >= range[0] && date <= range[1];
    };
    const isWithinNextHours = (value, hours) => {
      const time = toDateTime(value);
      if (!time) return false;
      const diff = time.getTime() - mockNow.getTime();
      return diff >= 0 && diff <= hours * 60 * 60 * 1000;
    };
    const isPickupToday = order => pickupFocusStatuses.includes(order.status) && isToday(order.schedule?.start);
    const isPickupSoon = order => pickupFocusStatuses.includes(order.status) && isWithinNextHours(order.schedule?.start, 2);
    const isRentingNow = order => ['renting', 'renewing'].includes(order.status);
    const isReturnToday = order => returnFocusStatuses.includes(order.status) && isToday(order.schedule?.end);
    const isReturnSoon = order => returnFocusStatuses.includes(order.status) && isWithinNextHours(order.schedule?.end, 2);
    const isPickupOverdueTask = order => order.status === 'pickup_overdue';
    const isReturnOverdueTask = order => order.status === 'overdue';
    const isSettlementTask = order => settlementFocusStatuses.includes(order.status);
    const filteredOrders = computed(() => {
      return orders.filter(order => {
        const matchPermission = order.businessLine === 'same_station' ? hasSameStationPermission.value : hasOneWayPermission.value;
        const matchBusinessLine = activeTab.value === 'all' || order.businessLine === activeTab.value;
        const matchKeyword = !filters.keyword || order.orderId.includes(filters.keyword) || order.customer.name.includes(filters.keyword) || order.customer.phone.includes(filters.keyword) || order.corporate && order.corporate.name.includes(filters.keyword);
        const matchVehiclePlate = !filters.vehiclePlate || order.vehicle?.plate && order.vehicle.plate.toUpperCase().includes(filters.vehiclePlate.trim().toUpperCase());
        const matchCreateTime = isDateInRange(order.createTime, filters.createTimeRange);
        const matchPickupTime = isDateInRange(order.schedule?.start, filters.pickupTimeRange);
        const matchReturnTime = isDateInRange(order.schedule?.end, filters.returnTimeRange);
        const matchBranch = !filters.branch || order.employee?.branch === filters.branch;
        const matchDept = !filters.dept || order.employee?.dept === filters.dept;
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
        const matchPickupStore = filters.pickupStore.length === 0 || filters.pickupStore.includes(order.location.pickup);
        const matchReturnStore = filters.returnStore.length === 0 || filters.returnStore.includes(order.location.return);
        const matchPostCharge = !filters.postChargeStatus || (filters.postChargeStatus === 'any' ? !!order.postCharge : order.postCharge?.status === filters.postChargeStatus);
        const matchStatFilter = !activeStatFilter.value || activeStatFilter.value === 'overview_pending_payment' && order.status === 'pending_payment' || activeStatFilter.value === 'overview_reserved' && order.status === 'reserved' || activeStatFilter.value === 'overview_in_use' && ['inspecting', 'renting', 'renewing'].includes(order.status) || activeStatFilter.value === 'overview_settlement' && ['settlement_pending', 'payment_due', 'refund_pending'].includes(order.status) || activeStatFilter.value === 'overview_completed' && order.status === 'completed' || activeStatFilter.value === 'overview_closed' && ['cancelled', 'rejected', 'closed'].includes(order.status) || activeStatFilter.value === 'overview_abnormal' && ['pickup_overdue', 'overdue', 'accident_processing', 'no_show'].includes(order.status) || activeStatFilter.value === 'pickup_today' && isPickupToday(order) || activeStatFilter.value === 'pickup_2h' && isPickupSoon(order) || activeStatFilter.value === 'renting_now' && isRentingNow(order) || activeStatFilter.value === 'return_today' && isReturnToday(order) || activeStatFilter.value === 'return_2h' && isReturnSoon(order) || activeStatFilter.value === 'pickup_overdue_task' && isPickupOverdueTask(order) || activeStatFilter.value === 'return_overdue_task' && isReturnOverdueTask(order) || activeStatFilter.value === 'settlement_task' && isSettlementTask(order);
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
        return matchPermission && matchBusinessLine && matchKeyword && matchVehiclePlate && matchCreateTime && matchPickupTime && matchReturnTime && matchStatus && matchPickupStore && matchReturnStore && matchVehicle && matchBranch && matchDept && matchBillingMode && matchPostCharge && matchStatFilter;
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
        const taskSortField = ['pickup_today', 'pickup_2h', 'pickup_overdue_task'].includes(activeStatFilter.value) ? 'start' : ['renting_now', 'return_today', 'return_2h', 'return_overdue_task', 'settlement_task'].includes(activeStatFilter.value) ? 'end' : '';
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
    const hasAssignedVehicle = row => {
      return !!row?.vehicle?.plate;
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
    const isMonthlyBillingOrder = row => {
      return row.billingMode === 'monthly' || row.paymentStatus === 'monthly_billing';
    };
    const getRowClassName = ({
      row
    }) => {
      return ['cancelled', 'no_show', 'rejected', 'closed'].includes(row.status) ? 'opacity-60 bg-gray-50' : '';
    };
    const countOrders = predicate => orders.filter(order => {
      const matchPermission = order.businessLine === 'same_station' ? hasSameStationPermission.value : hasOneWayPermission.value;
      const matchBusinessLine = activeTab.value === 'all' || order.businessLine === activeTab.value;
      return matchPermission && matchBusinessLine && predicate(order);
    }).length;
    const overviewStats = computed(() => [{
      key: 'all',
      label: '訂單總數',
      count: countOrders(() => true),
      color: 'text-gray-900'
    }, {
      key: 'overview_pending_payment',
      label: '待支付',
      count: countOrders(order => order.status === 'pending_payment'),
      color: 'text-blue-600'
    }, {
      key: 'overview_reserved',
      label: '已預約',
      count: countOrders(order => order.status === 'reserved'),
      color: 'text-sky-600'
    }, {
      key: 'overview_in_use',
      label: '用車中',
      count: countOrders(order => ['inspecting', 'renting', 'renewing'].includes(order.status)),
      color: 'text-green-600'
    }, {
      key: 'overview_settlement',
      label: '已還待結算',
      count: countOrders(order => ['settlement_pending', 'payment_due', 'refund_pending'].includes(order.status)),
      color: 'text-orange-600'
    }, {
      key: 'overview_completed',
      label: '已完成',
      count: countOrders(order => order.status === 'completed'),
      color: 'text-emerald-600'
    }, {
      key: 'overview_closed',
      label: '已取消/已關閉',
      count: countOrders(order => ['cancelled', 'rejected', 'closed'].includes(order.status)),
      color: 'text-gray-500'
    }, {
      key: 'overview_abnormal',
      label: '異常訂單',
      count: countOrders(order => ['pickup_overdue', 'overdue', 'accident_processing', 'no_show'].includes(order.status)),
      color: 'text-red-600'
    }]);
    const taskStats = computed(() => [{
      key: 'pickup_today',
      label: '今日待取車',
      count: countOrders(order => isPickupToday(order)),
      color: 'text-blue-600'
    }, {
      key: 'pickup_2h',
      label: '2小時內待取車',
      count: countOrders(order => isPickupSoon(order)),
      color: 'text-sky-600'
    }, {
      key: 'renting_now',
      label: '用車中',
      count: countOrders(order => isRentingNow(order)),
      color: 'text-green-600'
    }, {
      key: 'return_today',
      label: '今日待還車',
      count: countOrders(order => isReturnToday(order)),
      color: 'text-emerald-600'
    }, {
      key: 'return_2h',
      label: '2小時內待還車',
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
      const nextFilter = key === 'all' || activeStatFilter.value === key ? '' : key;
      resetFilters();
      activeStatFilter.value = nextFilter;
      currentPage.value = 1;
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
      filters.vehiclePlate = '';
      filters.branch = '';
      filters.dept = '';
      filters.billingMode = '';
      filters.status = [];
      filters.postChargeStatus = '';
      filters.createTimeRange = [];
      filters.pickupTimeRange = [];
      filters.returnTimeRange = [];
      filters.pickupStore = [];
      filters.returnStore = [];
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
    const getVehicleCurrentStation = row => {
      return row.location?.pickupStation || row.location?.pickupStationName || row.location?.pickup || '';
    };
    const getLocationWithStation = (row, type) => {
      const locationName = row.location?.[type] || '';
      const stationName = type === 'pickup' ? row.location?.pickupStation || row.location?.pickupStationName || '' : row.location?.returnStation || row.location?.returnStationName || '';
      if (!stationName || stationName === locationName || locationName.includes(stationName)) {
        return locationName;
      }
      return locationName ? `${locationName} · ${stationName}` : stationName;
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
      return `time_share_order_detail.html?${params.toString()}`;
    };
    const viewOrder = row => {
      window.location.href = buildOrderDetailUrl(row);
    };
    const exportOrders = () => {
      feedback.ElMessage.success(`已導出 ${filteredOrders.value.length} 筆訂單，可用於員工報銷與企業內部覈對。`);
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
      branches,
      departments,
      getStatusConfig,
      getPaymentStatusConfig,
      getPostChargeConfig,
      hasAssignedVehicle,
      shouldShowPaymentStatus,
      shouldShowPostChargeStatus,
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
      exportOrders,
      activeTab,
      allOrderCount,
      sameStationOrderCount,
      oneWayOrderCount,
      isTodayDateTime,
      permissionDemoMode,
      permissionDemoOptions,
      hasSameStationPermission,
      hasOneWayPermission,
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
      handleNewOrder,
      mockToday,
      mockNow,
      statusMap,
      statusGroups,
      paymentStatusMap,
      postChargeStatusMap,
      filterResizeObserver,
      updateFilterLayout,
      pickupFocusStatuses,
      returnFocusStatuses,
      settlementFocusStatuses,
      toDateTime,
      isToday,
      isDateInRange,
      isWithinNextHours,
      isPickupToday,
      isPickupSoon,
      isRentingNow,
      isReturnToday,
      isReturnSoon,
      isPickupOverdueTask,
      isReturnOverdueTask,
      isSettlementTask,
      sortState,
      sortedOrders,
      countOrders,
      overviewStats,
      taskStats
    };
  }
  return pageSetup();
}
export default function EnterpriseTimeShareOrdersBlock() {
  const model = useRimoModel(createPageState);
  const view = model.view;
  const {
    text
  } = useRimoEnvironment();
  return <RimoRoot model={model} pageKey="enterprise-time-share-orders" assets={{}}><div data-business-content="" data-rimo-layout="page"><div className="prototype-permission-switcher" aria-label="分時租賃訂單權限演示" data-rimo-layout="permissions"><span className="prototype-permission-switcher__label">{text("權限演示")}</span>
<RimoElement kind="el-radio-group" modelValue={view.permissionDemoMode} onModelChange={value => {
          model.write(["permissionDemoMode"], value);
        }} size="small" onChange={event => {
          view.setPermissionDemoMode?.(event);
        }}>{rimoEntries(view.permissionDemoOptions).map(([option], _itemIndex) => <Fragment key={option.value}><RimoElement kind="el-radio-button" key={option.value} label={option.value}>{rimoText(option.label)}</RimoElement></Fragment>)}</RimoElement></div>
<div className="mb-6" data-rimo-layout="heading"><div><h1 className="text-2xl font-bold text-gray-800 tracking-tight">{text("分時租賃訂單")}</h1>
<p className="text-gray-500 text-sm mt-1">{text("查看員工使用企業身份產生的分時租賃訂單。企業月結訂單進入企業月結賬單，非月結訂單由員工個人支付，可導出供報銷覈對。")}</p></div></div>
<div className="bg-white rounded-xl border border-gray-200 p-3 mb-4"><div className="flex items-center justify-between gap-4 mb-3" data-rimo-layout="toolbar"><div className="text-sm font-semibold text-gray-700">{text("統計視角")}</div>
<div className="inline-flex items-center rounded-lg border border-gray-200 bg-gray-50 p-1"><button className={rimoClass(["px-3 py-1.5 text-sm rounded-md transition-colors", rimoClass(view.statsView === 'overview' ? 'bg-white text-[color:var(--app-color-primary)] shadow-sm font-medium' : 'text-gray-500 hover:text-gray-700')])} onClick={_event => {
              view.switchStatsView('overview');
            }}>{text("\n                                運營總覽\n                            ")}</button>
<button className={rimoClass(["px-3 py-1.5 text-sm rounded-md transition-colors", rimoClass(view.statsView === 'task' ? 'bg-white text-[color:var(--app-color-primary)] shadow-sm font-medium' : 'text-gray-500 hover:text-gray-700')])} onClick={_event => {
              view.switchStatsView('task');
            }}>{text("\n                                實時運營\n                            ")}</button></div></div>
<div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-8 gap-2">{rimoEntries(view.currentStats).map(([item], _itemIndex) => <Fragment key={item.key}><button key={item.key} className={rimoClass(["text-left rounded-lg border px-3 py-2 transition-colors", rimoClass(view.activeStatFilter === item.key || !view.activeStatFilter && view.statsView === 'overview' && item.key === 'all' ? 'border-[color:var(--app-color-primary)] bg-[color:var(--app-color-primary-light-9)]' : 'border-gray-100 hover:border-[color:var(--app-color-primary)] hover:bg-[color:var(--app-color-primary-light-9)]')])} onClick={_event => {
              view.applyStatFilter(item.key);
            }}><div className="text-xs text-gray-500">{rimoText(item.label)}</div>
<div className={rimoClass(["mt-1 text-xl font-bold font-mono", rimoClass(item.color)])}>{rimoText(item.count)}</div></button></Fragment>)}</div></div>
<div className="orders-list-panel bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden" data-rimo-layout="list"><div className="orders-list-tabs bg-gray-50 px-4"><RimoElement kind="el-tabs" modelValue={view.activeTab} onModelChange={value => {
            model.write(["activeTab"], value);
          }} className="business-tabs">{view.hasSameStationPermission && view.hasOneWayPermission ? <><RimoElement kind="el-tab-pane" name="all" slots={{
                "label": _slot => <><span className="flex items-center gap-2"><RimoElement kind="el-icon"><RimoIcon name="List" /></RimoElement>
<span>{text("全部")}</span>
<RimoElement kind="el-tag" size="small" type="info" round={true} effect="plain">{rimoText(view.allOrderCount)}</RimoElement></span></>
              }}></RimoElement></> : null}
{view.hasSameStationPermission ? <><RimoElement kind="el-tab-pane" name="same_station" slots={{
                "label": _slot => <><span className="flex items-center gap-2"><RimoElement kind="el-icon"><RimoIcon name="Location" /></RimoElement>
<span>{text("同站租還")}</span>
<RimoElement kind="el-tag" size="small" type="info" round={true} effect="plain">{rimoText(view.sameStationOrderCount)}</RimoElement></span></>
              }}></RimoElement></> : null}
{view.hasOneWayPermission ? <><RimoElement kind="el-tab-pane" name="one_way" slots={{
                "label": _slot => <><span className="flex items-center gap-2"><RimoElement kind="el-icon"><RimoIcon name="Guide" /></RimoElement>
<span>{text("甲租乙還")}</span>
<RimoElement kind="el-tag" size="small" type="info" round={true} effect="plain">{rimoText(view.oneWayOrderCount)}</RimoElement></span></>
              }}></RimoElement></> : null}</RimoElement></div>
<RimoElement kind="el-table" data={view.paginatedOrders} style={rimoStyle("width: 100%")} stripe={true} rowClassName={view.getRowClassName} headerCellStyle={{
          background: '#f9fafb',
          color: '#4b5563',
          fontWeight: '600'
        }} slots={{
          "toolbar": _slot => <><div className="adaptive-filter-toolbar flex flex-wrap items-center gap-4"><div className="adaptive-filter-controls flex flex-wrap items-center gap-4"><RimoElement kind="el-input" modelValue={view.filters.keyword} onModelChange={value => {
                  model.write(["filters", "keyword"], value);
                }} placeholder="訂單號 / 客戶 / 企業名" prefixIcon="Search" clearable={true} style={rimoStyle("width: 280px")}></RimoElement>
<RimoElement kind="el-input" modelValue={view.filters.vehiclePlate} onModelChange={value => {
                  model.write(["filters", "vehiclePlate"], value);
                }} placeholder="車牌號" prefixIcon="Search" clearable={true} style={rimoStyle("width: 160px")}></RimoElement>
<RimoElement kind="el-select" modelValue={view.filters.branch} onModelChange={value => {
                  model.write(["filters", "branch"], value);
                }} placeholder="分公司" clearable={true} filterable={true} style={rimoStyle("width: 150px")}><RimoElement kind="el-option" label="全部分公司" value=""></RimoElement>
{rimoEntries(view.branches).map(([b], _itemIndex) => <Fragment key={b}><RimoElement kind="el-option" key={b} label={b} value={b}></RimoElement></Fragment>)}</RimoElement>
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
<RimoElement kind="el-date-picker" modelValue={view.filters.createTimeRange} onModelChange={value => {
                  model.write(["filters", "createTimeRange"], value);
                }} type="daterange" rangeSeparator="至" startPlaceholder="創建開始" endPlaceholder="創建結束" style={rimoStyle("width: 260px")} title="訂單創建時間" format="YYYY/MM/DD" valueFormat="YYYY-MM-DD"></RimoElement>
<RimoElement kind="el-button" icon="Refresh" circle={true} onClick={event => {
                  view.resetFilters?.(event);
                }} data-rimo-filter-reset="true" aria-label="重置筛选"></RimoElement>
<RimoElement kind="el-button" type="primary" plain={true} icon="Download" onClick={event => {
                  view.exportOrders?.(event);
                }}>{text("導出")}</RimoElement></div></div>
<div className="pt-4 mt-4 border-t border-gray-100"><div className="flex flex-wrap items-center gap-4"><RimoElement kind="el-select" modelValue={view.filters.dept} onModelChange={value => {
                  model.write(["filters", "dept"], value);
                }} placeholder="部門" clearable={true} filterable={true} style={rimoStyle("width: 140px")} data-rimo-secondary="true"><RimoElement kind="el-option" label="全部部門" value=""></RimoElement>
{rimoEntries(view.departments).map(([d], _itemIndex) => <Fragment key={d}><RimoElement kind="el-option" key={d} label={d} value={d}></RimoElement></Fragment>)}</RimoElement>
<RimoElement kind="el-date-picker" modelValue={view.filters.pickupTimeRange} onModelChange={value => {
                  model.write(["filters", "pickupTimeRange"], value);
                }} type="daterange" rangeSeparator="至" startPlaceholder="取車開始" endPlaceholder="取車結束" style={rimoStyle("width: 260px")} title="預約取車時間" format="YYYY/MM/DD" valueFormat="YYYY-MM-DD" data-rimo-secondary="true"></RimoElement>
<RimoElement kind="el-date-picker" modelValue={view.filters.returnTimeRange} onModelChange={value => {
                  model.write(["filters", "returnTimeRange"], value);
                }} type="daterange" rangeSeparator="至" startPlaceholder="還車開始" endPlaceholder="還車結束" style={rimoStyle("width: 260px")} title="預約還車時間" format="YYYY/MM/DD" valueFormat="YYYY-MM-DD" data-rimo-secondary="true"></RimoElement>
<RimoElement kind="el-select" modelValue={view.filters.postChargeStatus} onModelChange={value => {
                  model.write(["filters", "postChargeStatus"], value);
                }} placeholder="追繳狀態" clearable={true} style={rimoStyle("width: 140px")} data-rimo-secondary="true"><RimoElement kind="el-option" label="全部追繳" value=""></RimoElement>
<RimoElement kind="el-option" label="存在追繳" value="any"></RimoElement>
<RimoElement kind="el-option" label="追繳待通知" value="pending_notify"></RimoElement>
<RimoElement kind="el-option" label="追繳已通知" value="notified"></RimoElement>
<RimoElement kind="el-option" label="追繳待支付" value="payment_due"></RimoElement>
<RimoElement kind="el-option" label="企業月結追繳" value="monthly_billing"></RimoElement>
<RimoElement kind="el-option" label="追繳已結清" value="paid"></RimoElement></RimoElement>
<RimoElement kind="el-select" modelValue={view.filters.pickupStore} onModelChange={value => {
                  model.write(["filters", "pickupStore"], value);
                }} placeholder="取車據點" multiple={true} collapseTags={true} collapseTagsTooltip={true} clearable={true} filterable={true} className="location-filter-select" style={rimoStyle("width: 190px")} data-rimo-secondary="true">{rimoEntries(view.stores).map(([store], _itemIndex) => <Fragment key={store}><RimoElement kind="el-option" key={store} label={store} value={store}></RimoElement></Fragment>)}</RimoElement>
<RimoElement kind="el-select" modelValue={view.filters.returnStore} onModelChange={value => {
                  model.write(["filters", "returnStore"], value);
                }} placeholder="還車據點" multiple={true} collapseTags={true} collapseTagsTooltip={true} clearable={true} filterable={true} className="location-filter-select" style={rimoStyle("width: 190px")} data-rimo-secondary="true">{rimoEntries(view.stores).map(([store], _itemIndex) => <Fragment key={store}><RimoElement kind="el-option" key={store} label={store} value={store}></RimoElement></Fragment>)}</RimoElement>
<RimoElement kind="el-select" modelValue={view.filters.vehicleGroup} onModelChange={value => {
                  model.write(["filters", "vehicleGroup"], value);
                }} placeholder="車型/車組" clearable={true} filterable={true} style={rimoStyle("width: 160px")} data-rimo-secondary="true"><RimoElement kind="el-option" label="全部車輛" value=""></RimoElement>
{rimoEntries(view.vehicleTree).map(([item], _itemIndex) => <Fragment key={item.group}><><RimoElement kind="el-option" label={'【' + item.group + '】'} value={'group:' + item.group} className="font-bold"></RimoElement>
{rimoEntries(item.models).map(([model], _itemIndex) => <Fragment key={model}><RimoElement kind="el-option" key={model} label={'    ' + model} value={'model:' + model}></RimoElement></Fragment>)}</></Fragment>)}</RimoElement></div></div></>
        }}><RimoElement kind="el-table-column" label="訂單信息" minWidth="180" slots={{
            "default": scope => <><div className="flex flex-col">{view.activeTab === 'all' ? <><RimoElement kind="el-tag" className="self-start mb-1" size="small" type={scope.row.businessLine === 'one_way' ? 'warning' : 'primary'} effect="plain">{text("\n                                        ")}{rimoText(scope.row.businessLine === 'one_way' ? '甲租乙還' : '同站租還')}{text("\n                                    ")}</RimoElement></> : null}
<a href={view.buildOrderDetailUrl(scope.row)} className="text-[color:var(--app-color-primary)] font-bold hover:underline mb-1 font-mono">{text("\n                                        ")}{rimoText(scope.row.orderId)}{text("\n                                    ")}</a>
<div className="text-xs text-gray-400">{rimoText(scope.row.createTime)}</div></div></>
          }}></RimoElement>
<RimoElement kind="el-table-column" label="用車員工" minWidth="190" slots={{
            "default": scope => <><div className="font-medium text-gray-800">{rimoText(scope.row.customer.name)}</div>
<div className="text-xs text-gray-500 mt-0.5">{text("\n                                    ")}{rimoText(scope.row.customer.phone)}{text("\n                                ")}</div>
<div className="flex flex-wrap gap-1 mt-1">{scope.row.employee?.branch ? <><RimoElement kind="el-tag" size="small" effect="plain" className="scale-90 origin-left">{rimoText(scope.row.employee.branch)}</RimoElement></> : null}
{scope.row.employee?.dept ? <><RimoElement kind="el-tag" size="small" type="info" effect="plain" className="scale-90 origin-left">{rimoText(scope.row.employee.dept)}</RimoElement></> : null}</div></>
          }}></RimoElement>
<RimoElement kind="el-table-column" label="預訂車輛" minWidth="180" slots={{
            "default": scope => <><div className="font-medium text-gray-800">{rimoText(scope.row.vehicle.group)}</div>
{view.hasAssignedVehicle(scope.row) ? <><div className="text-xs text-gray-600 mt-0.5 flex items-center gap-1"><span>{rimoText(scope.row.vehicle.model)}</span></div></> : null}
{view.hasAssignedVehicle(scope.row) ? <><div className="text-xs text-gray-500 font-mono mt-0.5">{text("\n                                    ")}{rimoText(scope.row.vehicle.plate)}{text("\n                                ")}</div></> : null}</>
          }}></RimoElement>
<RimoElement kind="el-table-column" minWidth="220" slots={{
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
            "default": scope => <><div className="text-sm"><div className="flex items-center gap-1 mb-1 whitespace-nowrap"><span className="text-gray-400 w-8 text-xs shrink-0 whitespace-nowrap">{text("取車")}</span>
<span className={rimoClass(["font-medium whitespace-nowrap shrink-0", rimoClass({
                    'text-orange-500 font-bold': scope.row.status === 'pickup_overdue',
                    'text-gray-700': scope.row.status !== 'pickup_overdue'
                  })])}>{text("\n                                            ")}{rimoText(scope.row.schedule.start)}{text("\n                                        ")}</span>
{view.isTodayDateTime(scope.row.schedule.start) ? <><RimoElement kind="el-tag" size="small" type="success" effect="plain" className="scale-90 origin-left ml-0.5">{text("今日")}</RimoElement></> : null}
{scope.row.status === 'pickup_overdue' ? <><RimoElement kind="el-icon" className="text-orange-500 ml-1"><RimoIcon name="WarningFilled" /></RimoElement></> : null}</div>
<div className="flex items-center gap-1 whitespace-nowrap"><span className="text-gray-400 w-8 text-xs shrink-0 whitespace-nowrap">{text("還車")}</span>
<span className={rimoClass(["font-medium whitespace-nowrap shrink-0", rimoClass({
                    'text-red-500 font-bold': scope.row.status === 'overdue',
                    'text-gray-700': scope.row.status !== 'overdue'
                  })])}>{text("\n                                            ")}{rimoText(scope.row.schedule.end || '—')}{text("\n                                        ")}</span>
{view.isTodayDateTime(scope.row.schedule.end) ? <><RimoElement kind="el-tag" size="small" type="warning" effect="plain" className="scale-90 origin-left ml-0.5">{text("今日")}</RimoElement></> : null}
{scope.row.status === 'overdue' ? <><RimoElement kind="el-icon" className="text-red-500 ml-1"><RimoIcon name="Warning" /></RimoElement></> : null}</div></div></>
          }}></RimoElement>
<RimoElement kind="el-table-column" label="取還據點" minWidth="190" slots={{
            "default": scope => <><div className="text-sm">{scope.row.location.return && scope.row.location.pickup !== scope.row.location.return ? <><div className="flex flex-col gap-1"><div className="flex items-start gap-2"><RimoElement kind="el-tag" size="small" type="warning" effect="dark" className="shrink-0 w-12 text-center">{text("取車")}</RimoElement>
<span className="min-w-0 break-words text-yellow-700 font-bold text-xs leading-5">{rimoText(view.getLocationWithStation(scope.row, 'pickup'))}</span></div>
<div className="flex items-start gap-2"><RimoElement kind="el-tag" size="small" type="warning" effect="dark" className="shrink-0 w-12 text-center">{text("還車")}</RimoElement>
<span className="min-w-0 break-words text-yellow-700 font-bold text-xs leading-5">{rimoText(view.getLocationWithStation(scope.row, 'return'))}</span></div></div></> : <><div><div className="flex items-start gap-2 mb-1"><RimoElement kind="el-tag" size="small" type="info" effect="plain" className="shrink-0 w-12 text-center">{text("取車")}</RimoElement>
<span className="min-w-0 break-words text-gray-700 text-xs leading-5">{rimoText(view.getLocationWithStation(scope.row, 'pickup'))}</span></div>
<div className="flex items-start gap-2"><RimoElement kind="el-tag" size="small" type="info" effect="plain" className="shrink-0 w-12 text-center">{text("還車")}</RimoElement>
<span className="min-w-0 break-words text-gray-700 text-xs leading-5">{rimoText(view.getLocationWithStation(scope.row, 'return') || '—')}</span></div></div></>}</div></>
          }}></RimoElement>
<RimoElement kind="el-table-column" label="金額 / 結算" minWidth="150" align="right" slots={{
            "default": scope => <><div className="font-bold text-gray-800 font-mono">{text("¥")}{rimoText(scope.row.amount.toLocaleString())}{text("\n                                ")}</div>
<div className="flex flex-col items-end gap-1 mt-1">{view.isMonthlyBillingOrder(scope.row) ? <><RimoElement kind="el-tag" size="small" type="primary" effect="dark" className="scale-90 origin-right">{text("企業月結")}</RimoElement></> : <><RimoElement kind="el-tag" size="small" type="info" effect="plain" className="scale-90 origin-right">{text("員工自付")}</RimoElement></>}
{view.isMonthlyBillingOrder(scope.row) && scope.row.billingMonth ? <><div className="text-xs text-gray-500">{rimoText(scope.row.billingMonth)}{text(" 賬單\n                                        ")}
{scope.row.billNo ? <><span className="font-mono">{rimoText(scope.row.billNo)}</span></> : null}</div></> : null}
{!view.isMonthlyBillingOrder(scope.row) && view.shouldShowPaymentStatus(scope.row) ? <><RimoElement kind="el-tag" size="small" type={view.getPaymentStatusConfig(scope.row.paymentStatus).type} color={view.getPaymentStatusConfig(scope.row.paymentStatus).color} style={rimoStyle(view.getPaymentStatusConfig(scope.row.paymentStatus).color ? {
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
<RimoElement kind="el-table-column" label="操作" minWidth="90" fixed="right" slots={{
            "default": scope => <><RimoElement kind="el-button" type="primary" link={true} size="small" onClick={_event => {
                view.viewOrder(scope.row);
              }}>{text("詳情")}</RimoElement></>
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