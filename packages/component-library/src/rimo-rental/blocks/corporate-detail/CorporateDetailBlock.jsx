import { Fragment } from 'react';
import { useRimoModel, rimoEntries } from '../../lib/rimo-model.js';
import { RimoRoot, RimoIcon, rimoIcons, useRimoEnvironment } from '../../lib/RimoEnvironment.jsx';
import { RimoElement, rimoStyle, rimoText } from '../../lib/RimoElements.jsx';
import './corporate-detail.css';
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
      derived: computed
    } = model;
    const {
      ElMessage: _ElMessage,
      ElMessageBox: _ElMessageBox
    } = feedback;
    const activeTab = ref('profile');
    const orderFilter = reactive({
      type: ''
    });
    const billFilter = reactive({
      type: '',
      status: ''
    });
    const billDetailVisible = ref(false);
    const currentBill = ref(null);
    const corporate = reactive({
      id: 'CORP2405001',
      companyName: '臺積電 TSMC',
      companyType: '股份有限公司',
      taxId: '87654321',
      contactName: '張敏',
      contactPhone: '0955-666-777',
      address: '新竹科學園區',
      planId: 'p2',
      planName: '企業白金方案',
      status: 'active',
      account: 'admin@tsmc.com',
      serviceTypes: ['公務用車', '分時租賃'],
      useTime: '全天',
      monthlySettlement: true,
      remarks: '大客戶，重點維護',
      employees: [{
        id: 'EMP001',
        name: '王大明',
        phone: '0912-345-678',
        email: 'daming.wang@tsmc.com',
        idCard: 'A123456789',
        branch: '新竹總部',
        department: 'IT部',
        status: 'active',
        addedAt: '2023-01-15'
      }, {
        id: 'EMP002',
        name: '李小華',
        phone: '0987-654-321',
        email: 'xiaohua.li@tsmc.com',
        idCard: 'B987654321',
        branch: '臺中廠區',
        department: 'HR部',
        status: 'active',
        addedAt: '2023-02-20'
      }, {
        id: 'EMP003',
        name: '林志玲',
        phone: '0955-123-456',
        email: 'zhiling.lin@tsmc.com',
        idCard: 'C112233445',
        branch: '臺南廠區',
        department: '行銷部',
        status: 'inactive',
        addedAt: '2023-03-10'
      }],
      quotas: [{
        id: 'Q001',
        name: '臺積電高管駐廠專車合約',
        contractNo: 'CT-2023-001',
        tenant: '臺積電 TSMC',
        payer: '臺積電 TSMC',
        type: 'OFFICIAL',
        billing: 'MONTHLY',
        vehicleCount: 10,
        boundCount: 8,
        totalAmount: 150000,
        startDate: '2023-01-01',
        endDate: '2024-12-31',
        status: 'ACTIVE'
      }, {
        id: 'Q002',
        name: '新竹廠區臨時試用評測',
        contractNo: 'CT-2023-002',
        tenant: '臺積電 TSMC',
        payer: '和運租車',
        type: 'TRIAL',
        billing: 'ONE_TIME',
        vehicleCount: 2,
        boundCount: 2,
        totalAmount: 15000,
        startDate: '2023-06-01',
        endDate: '2024-05-31',
        status: 'ACTIVE'
      }, {
        id: 'Q003',
        name: '高層差旅遊覽車年度合約',
        contractNo: 'CT-2022-015',
        tenant: '臺積電 TSMC',
        payer: '臺積電 TSMC',
        type: 'OFFICIAL',
        billing: 'ANNUALLY',
        vehicleCount: 1,
        boundCount: 1,
        totalAmount: 72000,
        startDate: '2022-01-01',
        endDate: '2022-12-31',
        status: 'EXPIRED'
      }]
    });
    const corporateStats = computed(() => ({
      totalEmployees: corporate.employees.length,
      activeQuotas: corporate.quotas.length,
      totalOrders: 45,
      totalSpent: 128500
    }));
    const statusText = computed(() => {
      const map = {
        active: '合作中',
        suspended: '已暫停',
        archived: '已終止'
      };
      return map[corporate.status] || '未知';
    });
    const statusType = computed(() => {
      const map = {
        active: 'success',
        suspended: 'warning',
        archived: 'info'
      };
      return map[corporate.status] || 'info';
    });
    const generateOrders = () => {
      return Array(10).fill(0).map((_, i) => ({
        id: 'ORD' + (20260201 + i),
        type: ['same_station', 'diff_station', 'store', 'kiosk'][i % 4],
        typeText: ['同站租還', '甲租乙還', '門市租車', '24h自助'][i % 4],
        vehicle: 'Toyota Altis (ABC-123' + i + ')',
        pickup: '臺北總店',
        returnLocation: i % 4 === 1 ? '桃園機場' : '臺北總店',
        duration: i + 1 + '天',
        amount: 1200 + i * 500,
        status: ['completed', 'active', 'cancelled'][i % 3],
        statusText: ['已完成', '進行中', '已取消'][i % 3]
      }));
    };
    const generateBills = () => {
      return [{
        billNo: 'BL-2026-001',
        period: '2026年01月 (01/01 - 01/31)',
        type: 'monthly',
        typeText: '月度結算賬單',
        amount: 45000,
        dueDate: '2026-02-15',
        status: 'paid',
        statusText: '已結清',
        items: [{
          orderId: 'ORD20260101',
          employee: '王大明',
          date: '2026-01-05',
          type: '同站租還',
          amount: 1500
        }, {
          orderId: 'ORD20260105',
          employee: '李小華',
          date: '2026-01-12',
          type: '甲租乙還',
          amount: 2500
        }]
      }, {
        billNo: 'BL-2026-002',
        period: '2026年02月 (02/01 - 02/28)',
        type: 'monthly',
        typeText: '月度結算賬單',
        amount: 32000,
        dueDate: '2026-03-15',
        status: 'pending',
        statusText: '待付款',
        items: [{
          orderId: 'ORD20260201',
          employee: '王大明',
          date: '2026-02-02',
          type: '門市租車',
          amount: 32000
        }]
      }, {
        billNo: 'CB-2026-001',
        period: 'CT-2023-001 第一季度期款',
        type: 'contract',
        typeText: '公務車合約賬單',
        amount: 150000,
        dueDate: '2026-01-31',
        status: 'paid',
        statusText: '已結清',
        items: []
      }, {
        billNo: 'CB-2026-002',
        period: 'CT-2023-002 第一季度期款',
        type: 'contract',
        typeText: '公務車合約賬單',
        amount: 60000,
        dueDate: '2026-02-28',
        status: 'overdue',
        statusText: '逾期',
        items: []
      }];
    };
    const paginatedOrders = ref(generateOrders());
    const bills = ref(generateBills());
    const filteredBills = computed(() => {
      return bills.value.filter(b => {
        const matchType = !billFilter.type || b.type === billFilter.type;
        const matchStatus = !billFilter.status || b.status === billFilter.status;
        return matchType && matchStatus;
      });
    });
    const getOrderTypeTag = type => {
      const map = {
        same_station: '',
        diff_station: 'warning',
        store: 'info',
        kiosk: 'success'
      };
      return map[type] || '';
    };
    const getOrderStatusTag = status => {
      const map = {
        completed: 'success',
        active: 'primary',
        cancelled: 'info'
      };
      return map[status] || '';
    };
    const getBillStatusTag = status => {
      const map = {
        paid: 'success',
        pending: 'primary',
        overdue: 'danger'
      };
      return map[status] || 'info';
    };
    const goBack = () => {
      window.location.href = 'corporates.html';
    };
    const handleEdit = () => {
      feedback.ElMessage.success('跳轉到編輯模式');
    };
    const handleFreeze = () => {
      feedback.ElMessageBox.confirm('確定要暫停該企業合作嗎？', '提示', {
        type: 'warning'
      }).then(() => {
        corporate.status = 'suspended';
        feedback.ElMessage.success('企業已暫停合作');
      });
    };
    const handleUnfreeze = () => {
      corporate.status = 'active';
      feedback.ElMessage.success('企業已恢復合作');
    };
    const viewBillDetail = row => {
      currentBill.value = row;
      billDetailVisible.value = true;
    };
    const handleOfflinePayment = () => {
      feedback.ElMessage.success('已成功登記結清款項');
      if (currentBill.value) {
        currentBill.value.status = 'paid';
        currentBill.value.statusText = '已結清';
      }
      billDetailVisible.value = false;
    };
    const handleTabChange = val => {
      console.log('Tab changed to:', val);
    };
    const urlParams = new URLSearchParams(window.location.search);
    const corpId = urlParams.get('id');
    if (corpId) {
      corporate.id = corpId;
    }
    return {
      activeTab,
      corporate,
      corporateStats,
      orderFilter,
      billFilter,
      paginatedOrders,
      bills,
      filteredBills,
      billDetailVisible,
      currentBill,
      statusText,
      statusType,
      getOrderTypeTag,
      getOrderStatusTag,
      getBillStatusTag,
      goBack,
      handleEdit,
      handleFreeze,
      handleUnfreeze,
      handleTabChange,
      viewBillDetail,
      handleOfflinePayment,
      UserFilled: rimoIcons.UserFilled,
      User: rimoIcons.User,
      Iphone: rimoIcons.Iphone,
      Postcard: rimoIcons.Postcard,
      Location: rimoIcons.Location,
      OfficeBuilding: rimoIcons.OfficeBuilding,
      ArrowLeft: rimoIcons.ArrowLeft,
      Lock: rimoIcons.Lock,
      Unlock: rimoIcons.Unlock,
      Edit: rimoIcons.Edit,
      Document: rimoIcons.Document,
      Wallet: rimoIcons.Wallet,
      List: rimoIcons.List,
      management: rimoIcons.Management,
      Plus: rimoIcons.Plus,
      ElMessage: feedback.ElMessage,
      ElMessageBox: feedback.ElMessageBox,
      generateOrders,
      generateBills,
      urlParams,
      corpId
    };
  }
  return pageSetup();
}
export default function CorporateDetailBlock() {
  const model = useRimoModel(createPageState);
  const view = model.view;
  const {
    text
  } = useRimoEnvironment();
  return <RimoRoot model={model} pageKey="corporate-detail" assets={{}}><div data-business-content="" data-rimo-layout="page"><div className="mb-4"><RimoElement kind="el-button" onClick={event => {
          view.goBack?.(event);
        }} icon={view.ArrowLeft} plain={true}>{text("返回")}</RimoElement></div>
<div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6 detail-card"><div className="flex items-start gap-6"><div className="w-20 h-20 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-3xl font-bold shadow-lg">{text("\n                            ")}{rimoText(view.corporate.companyName?.charAt(0))}{text("\n                        ")}</div>
<div className="flex-1"><div className="flex items-center gap-3 mb-2" data-rimo-layout="heading"><h1 className="text-2xl font-bold text-gray-900">{rimoText(view.corporate.companyName)}</h1>
<RimoElement kind="el-tag" type={view.corporate.planId === 'p2' ? 'warning' : 'info'} effect="dark" size="small" className="font-bold">{rimoText(view.corporate.planName)}</RimoElement>
<RimoElement kind="el-tag" type={view.statusType} size="small">{rimoText(view.statusText)}</RimoElement></div>
<div className="flex items-center gap-8 text-sm text-gray-500 mt-3"><span className="flex items-center gap-1"><RimoElement kind="el-icon"><RimoIcon name="Postcard" /></RimoElement>
{text(" 統編: ")}{rimoText(view.corporate.taxId)}{text("\n                                ")}</span>
<span className="flex items-center gap-1"><RimoElement kind="el-icon"><RimoIcon name="User" /></RimoElement>
{text(" ")}{rimoText(view.corporate.contactName)}{text("\n                                ")}</span>
<span className="flex items-center gap-1"><RimoElement kind="el-icon"><RimoIcon name="Iphone" /></RimoElement>
{text(" ")}{rimoText(view.corporate.contactPhone)}{text("\n                                ")}</span>
<span className="flex items-center gap-1"><RimoElement kind="el-icon"><RimoIcon name="Lock" /></RimoElement>
{text(" 登入賬號: ")}{rimoText(view.corporate.account)}{text("\n                                ")}</span></div></div>
<div className="flex gap-2"><RimoElement kind="el-button" type="primary" icon={view.Edit} onClick={event => {
              view.handleEdit?.(event);
            }}>{text("編輯資料")}</RimoElement>
{view.corporate.status === 'active' ? <><RimoElement kind="el-button" type="warning" icon={view.Lock} onClick={event => {
                view.handleFreeze?.(event);
              }}>{text("暫停合作")}</RimoElement></> : <><RimoElement kind="el-button" type="success" icon={view.Unlock} onClick={event => {
                view.handleUnfreeze?.(event);
              }}>{text("恢復合作")}</RimoElement></>}</div></div></div>
<div className="grid grid-cols-4 gap-4 mb-6"><div className="metric-card"><div className="text-xs text-gray-400 mb-0.5">{text("企業員工數")}</div>
<div className="text-2xl font-bold text-gray-900">{rimoText(view.corporateStats.totalEmployees)}</div></div>
<div className="metric-card"><div className="text-xs text-gray-400 mb-0.5">{text("激活合約配額")}</div>
<div className="text-2xl font-bold text-gray-900">{rimoText(view.corporateStats.activeQuotas)}</div></div>
<div className="metric-card"><div className="text-xs text-gray-400 mb-0.5">{text("累計訂單")}</div>
<div className="text-2xl font-bold text-gray-900">{rimoText(view.corporateStats.totalOrders)}</div></div>
<div className="metric-card"><div className="text-xs text-gray-400 mb-0.5">{text("累計消費金額")}</div>
<div className="text-2xl font-bold text-gray-900">{text("NT$ ")}{rimoText(view.corporateStats.totalSpent.toLocaleString())}</div></div></div>
<div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"><RimoElement kind="el-tabs" modelValue={view.activeTab} onModelChange={value => {
          model.write(["activeTab"], value);
        }} className="custom-tabs" onTabChange={event => {
          view.handleTabChange?.(event);
        }}><RimoElement kind="el-tab-pane" label="基本資料" name="profile"><div className="py-4 space-y-8"><div><h3 className="text-base font-bold text-gray-900 mb-4 flex items-center"><RimoElement kind="el-icon" className="mr-2 text-gray-400"><RimoIcon name="OfficeBuilding" /></RimoElement>
{text(" 企業基本信息\n                                    ")}</h3>
<div className="bg-gray-50 rounded-lg p-5 border border-gray-100 grid grid-cols-2 md:grid-cols-4 gap-y-6 gap-x-8 info-desc-list"><div><dt>{text("企業編號")}</dt>
<dd className="font-mono text-blue-600">{rimoText(view.corporate.id)}</dd></div>
<div><dt>{text("企業名稱")}</dt>
<dd>{rimoText(view.corporate.companyName)}</dd></div>
<div><dt>{text("統一編號")}</dt>
<dd className="font-mono">{rimoText(view.corporate.taxId)}</dd></div>
<div><dt>{text("公司類型")}</dt>
<dd>{rimoText(view.corporate.companyType)}</dd></div>
<div><dt>{text("聯絡人姓名")}</dt>
<dd>{rimoText(view.corporate.contactName)}</dd></div>
<div><dt>{text("聯絡電話")}</dt>
<dd className="font-mono">{rimoText(view.corporate.contactPhone)}</dd></div>
<div className="col-span-2"><dt>{text("通訊地址")}</dt>
<dd>{rimoText(view.corporate.address)}</dd></div>
<div className="col-span-2"><dt>{text("備註說明")}</dt>
<dd>{rimoText(view.corporate.remarks || '無')}</dd></div></div></div>
<div><h3 className="text-base font-bold text-gray-900 mb-4 flex items-center"><RimoElement kind="el-icon" className="mr-2 text-gray-400"><RimoIcon name="List" /></RimoElement>
{text(" 業務規則與方案\n                                    ")}</h3>
<div className="bg-gray-50 rounded-lg p-5 border border-gray-100 grid grid-cols-2 md:grid-cols-4 gap-y-6 gap-x-8 info-desc-list"><div className="col-span-2"><dt>{text("簽約服務類型")}</dt>
<dd>{rimoEntries(view.corporate.serviceTypes).map(([type], _itemIndex) => <Fragment key={type}><RimoElement kind="el-tag" key={type} size="small" className="mr-2" effect="plain" type="primary">{rimoText(type)}</RimoElement></Fragment>)}</dd></div>
<div><dt>{text("用車時間限制")}</dt>
<dd>{rimoText(view.corporate.useTime)}</dd></div>
<div><dt>{text("是否月結")}</dt>
<dd>{view.corporate.monthlySettlement ? <><RimoElement kind="el-tag" type="success" size="small">{text("允許")}</RimoElement></> : <><RimoElement kind="el-tag" type="info" size="small">{text("不許")}</RimoElement></>}</dd></div>
<div className="col-span-2"><dt>{text("管理員賬號")}</dt>
<dd className="font-mono text-blue-600">{rimoText(view.corporate.account)}</dd></div></div></div></div></RimoElement>
<RimoElement kind="el-tab-pane" name="quotas" lazy={true} slots={{
            "label": _slot => <><span>{text("合約配額")}</span></>
          }}><div className="py-6" data-rimo-layout="list"><div className="text-sm text-gray-500 mb-4 flex items-center justify-between"><span>{text("目前激活的合約配額列表，主要用於公務用車與長租業務。")}</span>
<RimoElement kind="el-button" type="primary" size="small" icon="Plus" plain={true}>{text("新增配額與綁定")}</RimoElement></div>
<RimoElement kind="el-table" data={view.corporate.quotas} style={rimoStyle("width: 100%")} stripe={true} headerCellClassName="bg-gray-50 text-gray-700 font-bold" cellClassName="align-top"><RimoElement kind="el-table-column" label="合約編號與名稱" minWidth="200" slots={{
                  "default": ({
                    row
                  }) => <><div className="font-mono text-gray-800 text-sm font-semibold">{rimoText(row.contractNo)}</div>
<div className="text-xs text-gray-500 mt-1 truncate" title={row.name}>{rimoText(row.name)}</div></>
                }}></RimoElement>
<RimoElement kind="el-table-column" label="用車與結算方" minWidth="180" slots={{
                  "default": ({
                    row
                  }) => <><div className="text-sm text-gray-800">{rimoText(row.tenant)}</div>
{row.tenant !== row.payer ? <><div className="text-xs text-gray-500 mt-1 flex items-center gap-1"><span className="bg-gray-100 text-gray-500 px-1 py-0.5 rounded text-[10px] ring-1 ring-inset ring-gray-200">{text("[代付]")}</span>
<span className="truncate" title={row.payer}>{rimoText(row.payer)}</span></div></> : null}</>
                }}></RimoElement>
<RimoElement kind="el-table-column" label="屬性" width="120" slots={{
                  "default": ({
                    row
                  }) => <><div className="flex flex-col gap-1 items-start">{row.type === 'TRIAL' ? <><RimoElement kind="el-tag" type="info" size="small" effect="plain" className="border-blue-200 text-blue-600 bg-blue-50">{text("試用")}</RimoElement></> : null}
{row.type === 'OFFICIAL' ? <><RimoElement kind="el-tag" type="success" size="small" effect="light" className="text-emerald-600 bg-emerald-50 border-emerald-200">{text("正式")}</RimoElement></> : null}
<span className="text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">{rimoText(row.billing === 'ANNUALLY' ? '年繳' : row.billing === 'MONTHLY' ? '月繳' : '一次性')}</span></div></>
                }}></RimoElement>
<RimoElement kind="el-table-column" label="配額數量 / 已綁" width="120" align="center" slots={{
                  "default": ({
                    row
                  }) => <><div className="text-sm font-bold text-gray-800">{rimoText(row.vehicleCount)}{text(" ")}
<span className="text-xs font-normal text-gray-500">{text("臺")}</span></div>
<div className="text-xs text-blue-600 mt-1">{text("已綁 ")}{rimoText(row.boundCount)}</div></>
                }}></RimoElement>
<RimoElement kind="el-table-column" label="單臺合約金額" width="130" align="right" slots={{
                  "default": ({
                    row
                  }) => <><div className="text-sm font-semibold text-gray-800">{text("￥")}{rimoText(row.totalAmount.toLocaleString())}{text("\n                                            ")}</div>
<div className="text-xs text-gray-500 font-normal mt-1">{text("/ ")}{rimoText(row.billing === 'ANNUALLY' ? '年' : row.billing === 'MONTHLY' ? '月' : '次')}</div></>
                }}></RimoElement>
<RimoElement kind="el-table-column" label="有效期" minWidth="170" slots={{
                  "default": ({
                    row
                  }) => <><div className="text-xs text-gray-600 font-mono tracking-tight flex flex-col gap-0.5"><span>{rimoText(row.startDate)}</span>
<span className="text-gray-400 font-sans">{text("至")}</span>
<span>{rimoText(row.endDate)}</span></div></>
                }}></RimoElement>
<RimoElement kind="el-table-column" label="狀態" width="100" slots={{
                  "default": ({
                    row
                  }) => <>{row.status === 'ACTIVE' ? <><RimoElement kind="el-tag" type="success" size="small">{text("生效中")}</RimoElement></> : row.status === 'EXPIRED' ? <><RimoElement kind="el-tag" type="info" size="small">{text("已過期")}</RimoElement></> : <><RimoElement kind="el-tag" type="primary" size="small">{rimoText(row.status)}</RimoElement></>}</>
                }}></RimoElement>
<RimoElement kind="el-table-column" label="操作" width="90" align="center" fixed="right" slots={{
                  "default": _slot => <><RimoElement kind="el-button" link={true} type="primary" size="small">{text("查看明細")}</RimoElement></>
                }}></RimoElement></RimoElement></div></RimoElement>
<RimoElement kind="el-tab-pane" name="employees" lazy={true} slots={{
            "label": _slot => <><span>{text("員工列表 ")}
<RimoElement kind="el-badge" value={view.corporate.employees.length} type="primary" className="ml-1"></RimoElement></span></>
          }}><div className="py-4" data-rimo-layout="list"><div className="flex justify-end mb-4"><RimoElement kind="el-button" type="primary" size="small" icon="Plus">{text("新增員工")}</RimoElement></div>
<RimoElement kind="el-table" data={view.corporate.employees} stripe={true} style={rimoStyle("width: 100%")}><RimoElement kind="el-table-column" prop="id" label="員工ID" width="120"></RimoElement>
<RimoElement kind="el-table-column" prop="name" label="姓名" minWidth="120"></RimoElement>
<RimoElement kind="el-table-column" prop="phone" label="手機號" width="130"></RimoElement>
<RimoElement kind="el-table-column" prop="email" label="Email" minWidth="160"></RimoElement>
<RimoElement kind="el-table-column" prop="idCard" label="身份證號" width="150"></RimoElement>
<RimoElement kind="el-table-column" prop="branch" label="分公司" width="120"></RimoElement>
<RimoElement kind="el-table-column" prop="department" label="部門" minWidth="100"></RimoElement>
<RimoElement kind="el-table-column" prop="addedAt" label="加入日期" width="120"></RimoElement>
<RimoElement kind="el-table-column" prop="status" label="狀態" width="100" slots={{
                  "default": ({
                    row
                  }) => <><RimoElement kind="el-tag" size="small" type={row.status === 'active' ? 'success' : 'info'}>{text("\n                                                ")}{rimoText(row.status === 'active' ? '在職' : '停用')}{text("\n                                            ")}</RimoElement></>
                }}></RimoElement>
<RimoElement kind="el-table-column" label="操作" width="140" slots={{
                  "default": _slot => <><RimoElement kind="el-button" link={true} type="primary" size="small">{text("編輯")}</RimoElement>
<RimoElement kind="el-button" link={true} type="danger" size="small">{text("移除")}</RimoElement></>
                }}></RimoElement></RimoElement></div></RimoElement>
<RimoElement kind="el-tab-pane" label="用車規則" name="rules" lazy={true}><div className="py-4 space-y-6"><div className="bg-blue-50 border border-blue-100 rounded-lg p-4"><h4 className="font-bold text-blue-800 mb-2">{text("當前用車政策")}</h4>
<p className="text-sm text-blue-700">{text("以下規則適用於該企業所有員工，用於約束分時租賃和公務用車行爲。")}</p></div>
<div className="grid grid-cols-2 gap-6 info-desc-list"><div className="bg-gray-50 rounded-lg p-5 border"><dt>{text("允許車型組")}</dt>
<dd className="mt-1">{text("經濟型轎車、商務MPV")}</dd></div>
<div className="bg-gray-50 rounded-lg p-5 border"><dt>{text("單次租賃時長限制")}</dt>
<dd className="mt-1">{text("最長 72 小時")}</dd></div>
<div className="bg-gray-50 rounded-lg p-5 border"><dt>{text("允許預訂時段")}</dt>
<dd className="mt-1">{rimoText(view.corporate.useTime)}</dd></div>
<div className="bg-gray-50 rounded-lg p-5 border"><dt>{text("月結資格狀態")}</dt>
<dd className="mt-1">{text("已啓用，不設額度")}</dd></div></div></div></RimoElement>
<RimoElement kind="el-tab-pane" name="orders" lazy={true} slots={{
            "label": _slot => <><span>{text("訂單記錄")}</span></>
          }}><div className="py-4" data-rimo-layout="list"><RimoElement kind="el-table" data={view.paginatedOrders} stripe={true} style={rimoStyle("width: 100%")} slots={{
                "toolbar": _slot => <><RimoElement kind="el-select" modelValue={view.orderFilter.type} onModelChange={value => {
                    model.write(["orderFilter", "type"], value);
                  }} placeholder="訂單類型" clearable={true} size="small" style={rimoStyle("width: 150px")}><RimoElement kind="el-option" label="同站租還" value="same_station"></RimoElement>
<RimoElement kind="el-option" label="甲租乙還" value="diff_station"></RimoElement>
<RimoElement kind="el-option" label="門市租車" value="store"></RimoElement>
<RimoElement kind="el-option" label="24h自助" value="kiosk"></RimoElement></RimoElement></>
              }}><RimoElement kind="el-table-column" prop="id" label="訂單編號" width="140"></RimoElement>
<RimoElement kind="el-table-column" prop="typeText" label="類型" width="100" slots={{
                  "default": ({
                    row
                  }) => <><RimoElement kind="el-tag" size="small" type={view.getOrderTypeTag(row.type)}>{rimoText(row.typeText)}</RimoElement></>
                }}></RimoElement>
<RimoElement kind="el-table-column" prop="vehicle" label="車輛" minWidth="200"></RimoElement>
<RimoElement kind="el-table-column" prop="pickup" label="取車站" minWidth="120"></RimoElement>
<RimoElement kind="el-table-column" prop="duration" label="時長" width="80"></RimoElement>
<RimoElement kind="el-table-column" prop="amount" label="金額" width="100" slots={{
                  "default": ({
                    row
                  }) => <><span className="font-bold text-gray-900">{text("NT$ ")}{rimoText(row.amount.toLocaleString())}</span></>
                }}></RimoElement>
<RimoElement kind="el-table-column" prop="statusText" label="狀態" width="100" slots={{
                  "default": ({
                    row
                  }) => <><RimoElement kind="el-tag" size="small" type={view.getOrderStatusTag(row.status)}>{rimoText(row.statusText)}</RimoElement></>
                }}></RimoElement></RimoElement></div></RimoElement>
<RimoElement kind="el-tab-pane" name="billing" lazy={true} slots={{
            "label": _slot => <><span>{text("賬單記錄")}</span></>
          }}><div className="py-4" data-rimo-layout="list"><RimoElement kind="el-table" data={view.filteredBills} stripe={true} style={rimoStyle("width: 100%")} slots={{
                "toolbar": _slot => <><RimoElement kind="el-select" modelValue={view.billFilter.type} onModelChange={value => {
                    model.write(["billFilter", "type"], value);
                  }} placeholder="賬單類型" clearable={true} size="small" style={rimoStyle("width: 150px")}><RimoElement kind="el-option" label="月度結算賬單" value="monthly"></RimoElement>
<RimoElement kind="el-option" label="公務車合約賬單" value="contract"></RimoElement></RimoElement>
<RimoElement kind="el-select" modelValue={view.billFilter.status} onModelChange={value => {
                    model.write(["billFilter", "status"], value);
                  }} placeholder="付款狀態" clearable={true} size="small" style={rimoStyle("width: 150px")}><RimoElement kind="el-option" label="待付款" value="pending"></RimoElement>
<RimoElement kind="el-option" label="已結清" value="paid"></RimoElement>
<RimoElement kind="el-option" label="逾期" value="overdue"></RimoElement></RimoElement></>
              }}><RimoElement kind="el-table-column" prop="billNo" label="賬單編號" width="140"></RimoElement>
<RimoElement kind="el-table-column" prop="period" label="賬單週期 / 生成時間" minWidth="200"></RimoElement>
<RimoElement kind="el-table-column" prop="typeText" label="賬單類型" width="140" slots={{
                  "default": ({
                    row
                  }) => <><RimoElement kind="el-tag" size="small" type={row.type === 'monthly' ? 'primary' : 'warning'}>{rimoText(row.typeText)}</RimoElement></>
                }}></RimoElement>
<RimoElement kind="el-table-column" prop="amount" label="賬單總額" width="120" slots={{
                  "default": ({
                    row
                  }) => <><span className="font-bold text-gray-900">{text("NT$ ")}{rimoText(row.amount.toLocaleString())}</span></>
                }}></RimoElement>
<RimoElement kind="el-table-column" prop="dueDate" label="繳款期限" width="120"></RimoElement>
<RimoElement kind="el-table-column" prop="statusText" label="狀態" width="100" slots={{
                  "default": ({
                    row
                  }) => <><RimoElement kind="el-tag" size="small" type={view.getBillStatusTag(row.status)}>{rimoText(row.statusText)}</RimoElement></>
                }}></RimoElement>
<RimoElement kind="el-table-column" label="操作" width="120" fixed="right" slots={{
                  "default": ({
                    row
                  }) => <><RimoElement kind="el-button" link={true} type="primary" size="small" onClick={_event => {
                      view.viewBillDetail(row);
                    }}>{text("查看賬單")}</RimoElement></>
                }}></RimoElement></RimoElement></div></RimoElement></RimoElement></div></div><RimoElement kind="el-dialog" modelValue={view.billDetailVisible} onModelChange={value => {
      model.write(["billDetailVisible"], value);
    }} title={view.currentBill?.typeText + ' - ' + view.currentBill?.billNo} width="800px" className="corporate-detail-overlay" slots={{
      "footer": _slot => <><span className="dialog-footer"><RimoElement kind="el-button" onClick={_event => {
            model.write(["billDetailVisible"], false);
          }}>{text("關閉")}</RimoElement>
{view.currentBill?.status !== 'paid' && view.currentBill?.status !== 'archived' ? <><RimoElement kind="el-button" type="primary" onClick={event => {
              view.handleOfflinePayment?.(event);
            }}>{text("登記線下已收款")}</RimoElement></> : null}</span></>
    }}>{() => <>{view.currentBill ? <><div><div className="flex justify-between items-center mb-6 bg-gray-50 p-5 rounded-lg border border-gray-100"><div><div className="text-xs text-gray-500 mb-1">{text("賬單歸屬週期")}</div>
<div className="font-bold text-gray-800">{rimoText(view.currentBill.period)}</div></div>
<div><div className="text-xs text-gray-500 mb-1">{text("最晚繳款日")}</div>
<div className="font-bold text-red-600">{rimoText(view.currentBill.dueDate)}</div></div>
<div className="text-right"><div className="text-xs text-gray-500 mb-1">{text("應繳總額")}</div>
<div className="font-bold text-2xl text-blue-600">{text("NT$ ")}{rimoText(view.currentBill.amount.toLocaleString())}</div></div></div>
{view.currentBill.type === 'monthly' ? <><div><h4 className="font-bold text-gray-800 mb-3 flex items-center"><RimoElement kind="el-icon" className="mr-2 text-blue-500"><RimoIcon name="List" /></RimoElement>
{text(" 包含之員工短租訂單明細\n                            ")}</h4>
<RimoElement kind="el-table" data={view.currentBill.items} size="small" stripe={true} border={true} style={rimoStyle("width: 100%")}><RimoElement kind="el-table-column" prop="orderId" label="訂單編號" width="130"></RimoElement>
<RimoElement kind="el-table-column" prop="employee" label="用車人" width="100"></RimoElement>
<RimoElement kind="el-table-column" prop="date" label="用車日期" minWidth="120"></RimoElement>
<RimoElement kind="el-table-column" prop="type" label="訂單類型" width="100"></RimoElement>
<RimoElement kind="el-table-column" prop="amount" label="金額" width="100" align="right" slots={{
                    "default": ({
                      row
                    }) => <>{text("NT$ ")}{rimoText(row.amount.toLocaleString())}</>
                  }}></RimoElement></RimoElement>
<p className="text-xs text-gray-400 mt-2">{text("提示：以上訂單均由授權員工選用企業方案產生，合併計入當月賬單。")}</p></div></> : null}
{view.currentBill.type === 'contract' ? <><div><h4 className="font-bold text-gray-800 mb-3 flex items-center"><RimoElement kind="el-icon" className="mr-2 text-warning"><RimoIcon name="Document" /></RimoElement>
{text(" 合約計費款項\n                            ")}</h4>
<div className="bg-gray-50 p-4 rounded-lg text-sm space-y-3"><div className="flex justify-between"><span className="text-gray-500">{text("關聯配額方案：")}</span>
<span>{text("經濟型轎車\n                                        / 10臺")}</span></div>
<div className="flex justify-between"><span className="text-gray-500">{text("計費模式：")}</span>
<span>{text("季結固定租金\n                                        (依據長租優惠)")}</span></div>
<div className="flex justify-between"><span className="text-gray-500">{text("單車單季費用：")}</span>
<span>{text("NT$\n                                        15,000 / 臺")}</span></div>
<RimoElement kind="el-divider" className="my-2"></RimoElement>
<div className="flex justify-between font-bold text-gray-700"><span>{text("總計：")}</span>
<span>{text("NT$\n                                        150,000")}</span></div></div>
<p className="text-xs text-gray-400 mt-3">{text("提示：公務車賬單依據《企業長租框架協議》按期生成，不含日常散單。")}</p></div></> : null}</div></> : null}</>}</RimoElement></RimoRoot>;
}