import { Fragment } from 'react';
import { useRimoModel, rimoEntries } from '../../lib/rimo-model.js';
import { RimoRoot, RimoIcon, rimoIcons, useRimoEnvironment } from '../../lib/RimoEnvironment.jsx';
import { RimoElement, rimoClass, rimoStyle, rimoText } from '../../lib/RimoElements.jsx';
import './member-detail.css';
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
    const transactionFilter = reactive({
      type: ''
    });
    const member = reactive({
      id: 'U1001',
      account: '13800138000',
      surname: '王',
      firstName: '小明',
      get name() {
        return this.surname + this.firstName;
      },
      gender: 'male',
      dob: '1990-05-20',
      phone: '13800138000',
      email: 'wang@example.com',
      idNumber: 'A123456789',
      accountType: 'personal',
      status: 'active',
      createTime: '2025-01-15',
      lastLoginTime: '2026-02-09 14:30:00',
      corporate: null,
      membership: {
        planId: 'MP002',
        planName: '銀牌會員',
        expireDate: '2026-01-15',
        autoRenew: true
      },
      householdAddress: '臺北市大安區信義路三段100號',
      mailingAddress: '同戶籍地址',
      emergencyContact: {
        name: '王大明',
        relationship: '父親',
        phone: '0912-345-678'
      },
      driverLicense: {
        type: '小型車',
        issuePlace: '臺北市',
        number: 'A123456789',
        expiryDate: '2030-05-20'
      },
      availableVehicleTypes: ['car', 'microElectric'],
      lastRentalTime: '2026-01-20 14:00',
      nonRentalDuration: '20天',
      receivePromotions: true,
      creditCards: [{
        id: 'cc1',
        bank: '中國信託',
        number: '**** **** **** 1234',
        expiry: '12/28',
        type: 'visa'
      }, {
        id: 'cc2',
        bank: '玉山銀行',
        number: '**** **** **** 5678',
        expiry: '06/29',
        type: 'mastercard'
      }],
      photos: {
        idCardFront: 'https://via.placeholder.com/400x300?text=ID+Front',
        idCardBack: 'https://via.placeholder.com/400x300?text=ID+Back',
        licenseFront: 'https://via.placeholder.com/400x300?text=License+Front',
        licenseBack: 'https://via.placeholder.com/400x300?text=License+Back',
        selfie: 'https://via.placeholder.com/400x300?text=Selfie'
      }
    });
    const photoLabels = {
      idCardFront: '身份證正面',
      idCardBack: '身份證反面',
      licenseFront: '駕照正面',
      licenseBack: '駕照反面',
      selfie: '自拍照'
    };
    const memberStats = computed(() => ({
      totalOrders: 15,
      monthOrders: 3,
      totalSpent: 28500,
      monthSpent: 5200,
      currentPoints: 2450,
      monthPoints: 350
    }));
    const getMembershipColor = planId => {
      const colors = {
        'MP001': 'info',
        'MP002': 'primary',
        'MP003': 'warning',
        'MP004': 'danger'
      };
      return colors[planId] || 'info';
    };
    const statusText = computed(() => {
      const map = {
        active: '正常',
        frozen: '已凍結',
        deleted: '已註銷'
      };
      return map[member.status] || '未知';
    });
    const statusType = computed(() => {
      const map = {
        active: 'success',
        frozen: 'danger',
        deleted: 'info'
      };
      return map[member.status] || 'info';
    });
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
    const generateOrders = () => {
      return Array(10).fill(0).map((_, i) => ({
        id: 'ORD' + (20260201 + i),
        type: ['same_station', 'diff_station', 'store', 'kiosk'][i % 4],
        typeText: ['同站租還', '甲租乙還', '門市租車', '24h自助'][i % 4],
        vehicle: 'Toyota Altis (ABC-123' + i + ')',
        pickup: '臺北總店',
        returnLocation: i % 4 === 1 ? '桃園機場店' : '臺北總店',
        duration: i + 1 + '天',
        amount: 1200 + i * 500,
        status: ['completed', 'active', 'cancelled'][i % 3],
        statusText: ['已完成', '進行中', '已取消'][i % 3]
      }));
    };
    const generateTransactions = () => Array(5).fill(0).map((_, i) => ({
      id: 'TRX' + (8000 + i),
      time: '2026-02-0' + (i + 1) + ' 10:00',
      type: ['rent', 'deposit', 'fee', 'refund'][i % 4],
      typeText: ['租金支付', '押金凍結', '違章扣款', '退款'][i % 4],
      amount: [1200, 3000, 200, -500][i % 4],
      method: '信用卡 (********1234)',
      orderId: 'ORD2026020' + i,
      status: '成功'
    }));
    const generatePoints = () => Array(5).fill(0).map((_, i) => ({
      time: '2026-02-0' + (i + 1) + ' 10:00',
      type: i % 2 === 0 ? 'earn' : 'redeem',
      typeText: i % 2 === 0 ? '獲取' : '消費',
      change: i % 2 === 0 ? 100 : -50,
      balance: 2450 - i * 10,
      reason: i % 2 === 0 ? '租車獎勵' : '兌換優惠券',
      orderId: 'ORD2026020' + i
    }));
    const paginatedOrders = ref(generateOrders());
    const transactions = ref(generateTransactions());
    const points = ref(generatePoints());
    const invites = ref([{
      time: '2026-01-20',
      invitee: '李小華',
      phone: '139****1234',
      status: 'registered',
      reward: '100 積分'
    }, {
      time: '2026-01-22',
      invitee: '張大偉',
      phone: '135****5678',
      status: 'pending',
      reward: '-'
    }]);
    const serviceLogs = ref([{
      time: '2026-02-01',
      channel: '電話',
      ticketId: 'TKT001',
      subject: '詢問租車流程',
      status: 'closed',
      operator: '客服A'
    }, {
      time: '2026-02-05',
      channel: '在線',
      ticketId: 'TKT005',
      subject: '修改訂單時間',
      status: 'processing',
      operator: '客服B'
    }]);
    const planHistory = ref([{
      time: '2026-01-15',
      oldPlan: '普通會員',
      newPlan: '銀牌會員',
      type: 'upgrade',
      typeText: '升級',
      reason: '自動升級',
      operator: '系統'
    }]);
    const loginLogs = ref([{
      time: '2026-02-09 14:30',
      method: 'App',
      ip: '192.168.1.1',
      device: 'iPhone 13',
      status: 'success'
    }, {
      time: '2026-02-08 10:20',
      method: 'Web',
      ip: '192.168.1.1',
      device: 'Chrome / Mac',
      status: 'success'
    }]);
    const accountLogs = ref([{
      time: '2026-01-15',
      action: '修改密碼',
      detail: '用戶自行修改密碼',
      ip: '192.168.1.1',
      operator: '用戶'
    }]);
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
    const getTransactionTypeTag = type => {
      const map = {
        rent: 'primary',
        deposit: 'warning',
        fee: 'danger',
        refund: 'success'
      };
      return map[type] || 'info';
    };
    const goBack = () => {
      window.location.href = 'members.html';
    };
    const handleEdit = () => {
      feedback.ElMessage.success('跳轉到編輯模式');
    };
    const handleFreeze = () => {
      feedback.ElMessageBox.confirm('確定要凍結該賬號嗎？', '提示', {
        type: 'warning'
      }).then(() => {
        member.status = 'frozen';
        feedback.ElMessage.success('賬號已凍結');
      });
    };
    const handleUnfreeze = () => {
      member.status = 'active';
      feedback.ElMessage.success('賬號已解凍');
    };
    const handleTabChange = val => {
      console.log('Tab changed to:', val);
    };
    const handleDeleteCard = cardId => {
      feedback.ElMessageBox.confirm('確定要解綁這張信用卡嗎？', '提示', {
        type: 'warning'
      }).then(() => {
        const index = member.creditCards.findIndex(c => c.id === cardId);
        if (index !== -1) {
          member.creditCards.splice(index, 1);
          feedback.ElMessage.success('信用卡已解綁');
        }
      });
    };
    const urlParams = new URLSearchParams(window.location.search);
    const memberId = urlParams.get('id');
    if (memberId) {
      member.id = memberId;
    }
    return {
      activeTab,
      member,
      memberStats,
      photoLabels,
      orderFilter,
      transactionFilter,
      paginatedOrders,
      transactions,
      points,
      invites,
      serviceLogs,
      planHistory,
      loginLogs,
      accountLogs,
      getMembershipColor,
      statusText,
      statusType,
      getVehicleTypeLabel,
      getVehicleTypeTagType,
      getOrderTypeTag,
      getOrderStatusTag,
      getTransactionTypeTag,
      goBack,
      handleEdit,
      handleFreeze,
      handleUnfreeze,
      handleTabChange,
      handleDeleteCard,
      Download: rimoIcons.Download,
      UserFilled: rimoIcons.UserFilled,
      User: rimoIcons.User,
      Iphone: rimoIcons.Iphone,
      Message: rimoIcons.Message,
      Postcard: rimoIcons.Postcard,
      Timer: rimoIcons.Timer,
      Location: rimoIcons.Location,
      OfficeBuilding: rimoIcons.OfficeBuilding,
      ArrowLeft: rimoIcons.ArrowLeft,
      Lock: rimoIcons.Lock,
      Unlock: rimoIcons.Unlock,
      Edit: rimoIcons.Edit,
      Coin: rimoIcons.Coin,
      Document: rimoIcons.Document,
      Wallet: rimoIcons.Wallet,
      Medal: rimoIcons.Medal,
      CreditCard: rimoIcons.CreditCard,
      Delete: rimoIcons.Delete,
      Picture: rimoIcons.Picture,
      ElMessage: feedback.ElMessage,
      ElMessageBox: feedback.ElMessageBox,
      generateOrders,
      generateTransactions,
      generatePoints,
      urlParams,
      memberId
    };
  }
  return pageSetup();
}
export default function MemberDetailBlock() {
  const model = useRimoModel(createPageState);
  const view = model.view;
  const {
    text
  } = useRimoEnvironment();
  return <RimoRoot model={model} pageKey="member-detail" assets={{}}><div data-business-content="" data-rimo-layout="page"><div className="mb-4"><RimoElement kind="el-button" onClick={event => {
          view.goBack?.(event);
        }} icon={view.ArrowLeft} plain={true}>{text("返回")}</RimoElement></div>
<div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 detail-card relative overflow-hidden"><div className="absolute top-5 right-6 z-20 flex gap-2"><RimoElement kind="el-button" type="primary" onClick={event => {
            view.handleEdit?.(event);
          }} className="shadow-md shadow-[color:var(--app-color-primary-shadow)]"><RimoElement kind="el-icon" className="mr-1"><RimoIcon name="Edit" /></RimoElement>
{text("編輯資料\n                        ")}</RimoElement>
{view.member.status !== 'frozen' ? <><RimoElement kind="el-button" type="danger" plain={true} onClick={event => {
              view.handleFreeze?.(event);
            }}><RimoElement kind="el-icon" className="mr-1"><RimoIcon name="Lock" /></RimoElement>
{text("凍結\n                        ")}</RimoElement></> : <><RimoElement kind="el-button" type="success" plain={true} onClick={event => {
              view.handleUnfreeze?.(event);
            }}><RimoElement kind="el-icon" className="mr-1"><RimoIcon name="Unlock" /></RimoElement>
{text("解凍\n                        ")}</RimoElement></>}</div>
<div className="flex items-start gap-6"><RimoElement kind="el-avatar" size={80} className={rimoClass(["text-2xl font-bold border-4 border-white shadow-lg flex-shrink-0", rimoClass(view.member.accountType === 'corporate' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600')])}>{text("\n                            ")}{rimoText(view.member.name?.charAt(0))}{text("\n                        ")}</RimoElement>
<div className="flex-1 space-y-3 min-w-0"><div className="flex items-center gap-3" data-rimo-layout="heading"><h1 className="text-2xl font-bold text-gray-900">{rimoText(view.member.name)}</h1>
<RimoElement kind="el-tag" type={view.member.accountType === 'corporate' ? 'warning' : 'info'} effect="dark" className="rounded-full px-3" size="small">{text("\n                                    ")}{rimoText(view.member.accountType === 'corporate' ? '企業會員' : '個人會員')}{text("\n                                ")}</RimoElement>
<RimoElement kind="el-tag" type={view.statusType} effect="light" className="rounded-full px-3" size="small">{text("\n                                    ")}{rimoText(view.statusText)}{text("\n                                ")}</RimoElement></div>
<div className="flex items-center gap-6 text-sm text-gray-600 flex-wrap"><span className="flex items-center gap-1.5"><RimoElement kind="el-icon" className="text-gray-400"><RimoIcon name="Iphone" /></RimoElement>
{text("\n                                    ")}{rimoText(view.member.phone)}{text("\n                                ")}</span>
<span className="flex items-center gap-1.5"><RimoElement kind="el-icon" className="text-gray-400"><RimoIcon name="Message" /></RimoElement>
{text("\n                                    ")}{rimoText(view.member.email)}{text("\n                                ")}</span>
<span className="flex items-center gap-1.5"><RimoElement kind="el-icon" className="text-gray-400"><RimoIcon name="User" /></RimoElement>
<span className="text-gray-400">{text("ID:")}</span>
<span className="font-mono">{rimoText(view.member.id)}</span></span></div></div></div></div>
<div className="grid grid-cols-4 gap-4 mt-4"><div className="metric-card"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center"><RimoElement kind="el-icon" className="text-blue-500" size={20}><RimoIcon name="Document" /></RimoElement></div>
<div><div className="text-xs text-gray-400 mb-0.5">{text("累計訂單")}</div>
<div className="text-xl font-bold text-gray-900">{rimoText(view.memberStats.totalOrders)}</div></div></div>
<div className="text-xs text-gray-400 mt-2 flex items-center gap-1">{text("\n                            本月 ")}
<span className="text-blue-500 font-medium">{text("+")}{rimoText(view.memberStats.monthOrders)}</span></div></div>
<div className="metric-card"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center"><RimoElement kind="el-icon" className="text-green-500" size={20}><RimoIcon name="Wallet" /></RimoElement></div>
<div><div className="text-xs text-gray-400 mb-0.5">{text("累計消費")}</div>
<div className="text-xl font-bold text-gray-900">{text("¥")}{rimoText(view.memberStats.totalSpent.toLocaleString())}</div></div></div>
<div className="text-xs text-gray-400 mt-2 flex items-center gap-1">{text("\n                            本月 ")}
<span className="text-green-500 font-medium">{text("+¥")}{rimoText(view.memberStats.monthSpent.toLocaleString())}</span></div></div>
<div className="metric-card"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center"><RimoElement kind="el-icon" className="text-amber-500" size={20}><RimoIcon name="Coin" /></RimoElement></div>
<div><div className="text-xs text-gray-400 mb-0.5">{text("當前積分")}</div>
<div className="text-xl font-bold text-gray-900">{rimoText(view.memberStats.currentPoints.toLocaleString())}</div></div></div>
<div className="text-xs text-gray-400 mt-2 flex items-center gap-1">{text("\n                            本月 ")}
<span className="text-amber-500 font-medium">{text("+")}{rimoText(view.memberStats.monthPoints)}</span></div></div>
<div className="metric-card"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-lg bg-[color:var(--app-color-primary-light-9)] flex items-center justify-center"><RimoElement kind="el-icon" className="text-[color:var(--app-color-primary)]" size={20}><RimoIcon name="Medal" /></RimoElement></div>
<div><div className="text-xs text-gray-400 mb-0.5">{text("會員方案")}</div>
<div className="text-lg font-bold text-gray-900">{rimoText(view.member.membership?.planName)}</div></div></div>
<div className="text-xs text-gray-400 mt-2 flex items-center gap-1">{text("\n                            到期 ")}
<span className="text-[color:var(--app-color-primary)] font-medium">{rimoText(view.member.membership?.expireDate || '永久')}</span>
{view.member.membership?.autoRenew ? <><RimoElement kind="el-tag" type="success" size="small" className="ml-1">{text("自動續費")}</RimoElement></> : null}</div></div></div>
<div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-100 min-h-[500px] flex flex-col overflow-hidden"><RimoElement kind="el-tabs" modelValue={view.activeTab} onModelChange={value => {
          model.write(["activeTab"], value);
        }} className="custom-tabs flex-1" tabPosition="top" onTabChange={event => {
          view.handleTabChange?.(event);
        }}><RimoElement kind="el-tab-pane" name="profile" slots={{
            "label": _slot => <><span>{text("基本資料")}</span></>
          }}><div className="py-6 space-y-8"><div><h3 className="text-base font-bold text-gray-900 mb-4 flex items-center"><RimoElement kind="el-icon" className="mr-2 text-gray-400"><RimoIcon name="User" /></RimoElement>
{text(" 基礎身份信息\n                                    ")}</h3>
<div className="bg-gray-50 rounded-lg p-5 border border-gray-100 grid grid-cols-2 md:grid-cols-4 gap-y-6 gap-x-8 info-desc-list"><div><dt>{text("姓名")}</dt>
<dd>{rimoText(view.member.surname)}{rimoText(view.member.firstName)}</dd></div>
<div><dt>{text("性別")}</dt>
<dd>{rimoText(view.member.gender === 'male' ? '男' : '女')}</dd></div>
<div><dt>{text("出生日期")}</dt>
<dd className="font-mono">{rimoText(view.member.dob)}</dd></div>
<div><dt>{text("身份證號")}</dt>
<dd className="font-mono">{rimoText(view.member.idNumber)}</dd></div>
<div><dt>{text("手機號")}</dt>
<dd className="font-mono">{rimoText(view.member.phone)}</dd></div>
<div><dt>{text("電子郵箱")}</dt>
<dd className="font-mono">{rimoText(view.member.email)}</dd></div>
<div><dt>{text("登錄賬號")}</dt>
<dd className="font-mono">{rimoText(view.member.account)}</dd></div>
{view.member.corporate ? <><div><dt>{text("歸屬企業")}</dt>
<dd className="text-blue-600">{rimoText(view.member.corporate?.companyName)}</dd></div></> : null}
<div><dt>{text("註冊時間")}</dt>
<dd className="font-mono">{rimoText(view.member.createTime)}</dd></div></div></div>
<div className="grid grid-cols-1 md:grid-cols-2 gap-8"><div><h3 className="text-base font-bold text-gray-900 mb-4 flex items-center"><RimoElement kind="el-icon" className="mr-2 text-gray-400"><RimoIcon name="Location" /></RimoElement>
{text(" 地址信息\n                                        ")}</h3>
<div className="bg-gray-50 rounded-lg p-5 border border-gray-100 space-y-4 info-desc-list"><div><dt>{text("戶籍地址")}</dt>
<dd>{rimoText(view.member.householdAddress)}</dd></div>
<div><dt>{text("通訊地址")}</dt>
<dd>{rimoText(view.member.mailingAddress)}</dd></div></div></div>
<div><h3 className="text-base font-bold text-gray-900 mb-4 flex items-center"><RimoElement kind="el-icon" className="mr-2 text-gray-400"><RimoIcon name="PhoneFilled" /></RimoElement>
{text(" 緊急聯絡人\n                                        ")}</h3>
<div className="bg-gray-50 rounded-lg p-5 border border-gray-100 space-y-4 info-desc-list"><div className="grid grid-cols-2 gap-4"><div><dt>{text("姓名")}</dt>
<dd>{rimoText(view.member.emergencyContact.name)}</dd></div>
<div><dt>{text("關係")}</dt>
<dd>{rimoText(view.member.emergencyContact.relationship)}</dd></div></div>
<div><dt>{text("聯繫電話")}</dt>
<dd className="font-mono">{rimoText(view.member.emergencyContact.phone)}</dd></div></div></div></div>
<div><h3 className="text-base font-bold text-gray-900 mb-4 flex items-center"><RimoElement kind="el-icon" className="mr-2 text-gray-400"><RimoIcon name="Picture" /></RimoElement>
{text(" 證件照片\n                                    ")}</h3>
<div className="bg-gray-50 rounded-lg p-5 border border-gray-100"><div className="grid grid-cols-2 md:grid-cols-5 gap-4">{rimoEntries(view.photoLabels).map(([label, key], _itemIndex) => <Fragment key={key}><div key={key} className="text-center group"><div className="relative w-full aspect-[4/3] bg-white border border-gray-200 rounded-lg flex flex-col items-center justify-center overflow-hidden hover:shadow-md transition-all">{view.member.photos[key] ? <><RimoElement kind="el-image" src={view.member.photos[key]} previewSrcList={[view.member.photos[key]]} fit="cover" className="w-full h-full" slots={{
                              "error": _slot => <><div className="flex flex-col items-center justify-center text-gray-400 h-full w-full bg-gray-100"><RimoElement kind="el-icon" className="text-2xl mb-1"><RimoIcon name="Picture" /></RimoElement>
<span className="text-xs">{text("加載失敗")}</span></div></>
                            }}></RimoElement></> : <><div className="flex flex-col items-center justify-center text-gray-300 h-full w-full bg-gray-50"><RimoElement kind="el-icon" className="text-2xl mb-1"><RimoIcon name="Picture" /></RimoElement>
<span className="text-xs">{text("未上傳")}</span></div></>}</div>
<div className="mt-2 text-xs font-medium text-gray-600">{rimoText(label)}</div></div></Fragment>)}</div></div></div>
<div className="grid grid-cols-1 md:grid-cols-2 gap-8"><div><h3 className="text-base font-bold text-gray-900 mb-4 flex items-center"><RimoElement kind="el-icon" className="mr-2 text-gray-400"><RimoIcon name="Van" /></RimoElement>
{text(" 駕駛執照\n                                        ")}</h3>
<div className="bg-gray-50 rounded-lg p-5 border border-gray-100 grid grid-cols-2 gap-y-4 gap-x-6 info-desc-list"><div><dt>{text("駕照類型")}</dt>
<dd>{rimoText(view.member.driverLicense.type)}</dd></div>
<div><dt>{text("簽發地")}</dt>
<dd>{rimoText(view.member.driverLicense.issuePlace)}</dd></div>
<div><dt>{text("駕照號碼")}</dt>
<dd className="font-mono">{rimoText(view.member.driverLicense.number)}</dd></div>
<div><dt>{text("有效日期")}</dt>
<dd className="font-mono">{rimoText(view.member.driverLicense.expiryDate)}</dd></div>
<div className="col-span-2"><dt>{text("可用載具類型")}</dt>
<dd className="flex flex-wrap gap-1">{rimoEntries(view.member.availableVehicleTypes).map(([type], _itemIndex) => <Fragment key={type}><RimoElement kind="el-tag" key={type} type={view.getVehicleTypeTagType(type)} size="small" effect="plain">{text("\n                                                        ")}{rimoText(view.getVehicleTypeLabel(type))}{text("\n                                                    ")}</RimoElement></Fragment>)}</dd>
<div className="text-xs text-gray-400 mt-1">{text("微電車默認不要求駕照。")}</div></div></div></div>
<div><h3 className="text-base font-bold text-gray-900 mb-4 flex items-center"><RimoElement kind="el-icon" className="mr-2 text-gray-400"><RimoIcon name="Timer" /></RimoElement>
{text(" 租車統計與偏好\n                                        ")}</h3>
<div className="bg-gray-50 rounded-lg p-5 border border-gray-100 grid grid-cols-2 gap-y-4 gap-x-6 info-desc-list"><div><dt>{text("上次租借時間")}</dt>
<dd className="font-mono">{rimoText(view.member.lastRentalTime)}</dd></div>
<div><dt>{text("累計未租借時長")}</dt>
<dd>{rimoText(view.member.nonRentalDuration)}</dd></div>
<div className="col-span-2 flex items-center justify-between pt-2 border-t border-gray-200 mt-2"><span className="text-sm text-gray-600">{text("接收優惠活動訊息")}</span>
<RimoElement kind="el-switch" modelValue={view.member.receivePromotions} onModelChange={value => {
                        model.write(["member", "receivePromotions"], value);
                      }} activeText="接收" inactiveText="拒收" inlinePrompt={true}></RimoElement></div></div></div></div>
<div><div className="flex items-center justify-between mb-4"><h3 className="text-base font-bold text-gray-900 flex items-center"><RimoElement kind="el-icon" className="mr-2 text-gray-400"><RimoIcon name="CreditCard" /></RimoElement>
{text(" 綁定信用卡\n                                        ")}</h3></div>
<div className="grid grid-cols-1 md:grid-cols-3 gap-4">{rimoEntries(view.member.creditCards).map(([card], _itemIndex) => <Fragment key={card.id}><div key={card.id} className="border border-gray-200 rounded-xl p-4 bg-white hover:shadow-md transition-shadow relative group"><div className="flex items-center justify-between mb-3"><span className="font-bold text-gray-800">{rimoText(card.bank)}</span>
<RimoElement kind="el-tag" size="small" effect="plain" className="uppercase">{rimoText(card.type)}</RimoElement></div>
<div className="text-lg font-mono text-gray-600 mb-2 tracking-wider">{rimoText(card.number)}</div>
<div className="text-xs text-gray-400 flex justify-between"><span>{text("有效期")}</span>
<span className="font-mono">{rimoText(card.expiry)}</span></div>
<RimoElement kind="el-button" className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity" type="danger" text={true} onClick={_event => {
                        view.handleDeleteCard(card.id);
                      }}><RimoElement kind="el-icon"><RimoIcon name="Delete" /></RimoElement></RimoElement></div></Fragment>)}
<div className="border border-dashed border-gray-300 rounded-xl p-4 flex flex-col items-center justify-center text-gray-400 hover:text-blue-500 hover:border-blue-500 hover:bg-blue-50 cursor-pointer transition-all h-[120px]"><RimoElement kind="el-icon" className="text-2xl mb-1"><RimoIcon name="Plus" /></RimoElement>
<span className="text-sm">{text("新增信用卡")}</span></div></div></div></div></RimoElement>
<RimoElement kind="el-tab-pane" name="orders" slots={{
            "label": _slot => <><span>{text("訂單記錄 ")}
<RimoElement kind="el-badge" value={view.paginatedOrders.length} type="primary" className="ml-1"></RimoElement></span></>
          }}><div className="py-4" data-rimo-layout="list"><RimoElement kind="el-table" data={view.paginatedOrders} stripe={true} style={rimoStyle("width: 100%")} slots={{
                "toolbar": _slot => <><RimoElement kind="el-select" modelValue={view.orderFilter.type} onModelChange={value => {
                    model.write(["orderFilter", "type"], value);
                  }} placeholder="所有訂單類型" style={rimoStyle("width: 180px")}><RimoElement kind="el-option" label="所有類型" value=""></RimoElement>
<RimoElement kind="el-option" label="同站租還" value="same_station"></RimoElement>
<RimoElement kind="el-option" label="甲租乙還" value="diff_station"></RimoElement>
<RimoElement kind="el-option" label="門市租車" value="store"></RimoElement>
<RimoElement kind="el-option" label="24h自助租車" value="kiosk"></RimoElement></RimoElement>
<RimoElement kind="el-button" icon={view.Download}>{text("導出訂單")}</RimoElement></>
              }}><RimoElement kind="el-table-column" prop="id" label="訂單號" width="140" slots={{
                  "default": ({
                    row
                  }) => <><span className="font-mono text-blue-600 cursor-pointer hover:underline">{rimoText(row.id)}</span></>
                }}></RimoElement>
<RimoElement kind="el-table-column" prop="type" label="類型" width="120" slots={{
                  "default": ({
                    row
                  }) => <><RimoElement kind="el-tag" size="small" type={view.getOrderTypeTag(row.type)}>{rimoText(row.typeText)}</RimoElement></>
                }}></RimoElement>
<RimoElement kind="el-table-column" prop="vehicle" label="車輛信息" minWidth="180"></RimoElement>
<RimoElement kind="el-table-column" prop="pickup" label="取車門店" width="140" showOverflowTooltip={true}></RimoElement>
<RimoElement kind="el-table-column" prop="returnLocation" label="還車門店" width="140" showOverflowTooltip={true}></RimoElement>
<RimoElement kind="el-table-column" prop="duration" label="租期" width="120"></RimoElement>
<RimoElement kind="el-table-column" prop="amount" label="金額" width="120" slots={{
                  "default": ({
                    row
                  }) => <><span className="font-bold">{text("¥")}{rimoText(row.amount)}</span></>
                }}></RimoElement>
<RimoElement kind="el-table-column" prop="status" label="狀態" width="100" slots={{
                  "default": ({
                    row
                  }) => <><RimoElement kind="el-tag" size="small" type={view.getOrderStatusTag(row.status)}>{rimoText(row.statusText)}</RimoElement></>
                }}></RimoElement>
<RimoElement kind="el-table-column" label="操作" width="80" slots={{
                  "default": _slot => <><RimoElement kind="el-button" link={true} type="primary" size="small">{text("詳情")}</RimoElement></>
                }}></RimoElement></RimoElement>
<div className="mt-4 flex justify-end"><RimoElement kind="el-pagination" background={true} layout="prev, pager, next" total={100}></RimoElement></div></div></RimoElement>
<RimoElement kind="el-tab-pane" name="transactions" slots={{
            "label": _slot => <><span>{text("交易記錄 ")}
<RimoElement kind="el-badge" value={view.transactions.length} type="primary" className="ml-1"></RimoElement></span></>
          }}><div className="py-4" data-rimo-layout="list"><RimoElement kind="el-table" data={view.transactions} stripe={true} style={rimoStyle("width: 100%")} slots={{
                "toolbar": _slot => <><RimoElement kind="el-select" modelValue={view.transactionFilter.type} onModelChange={value => {
                    model.write(["transactionFilter", "type"], value);
                  }} placeholder="所有交易類型" style={rimoStyle("width: 180px")}><RimoElement kind="el-option" label="所有類型" value=""></RimoElement>
<RimoElement kind="el-option" label="租金支付" value="rent"></RimoElement>
<RimoElement kind="el-option" label="押金凍結" value="deposit"></RimoElement>
<RimoElement kind="el-option" label="違章扣款" value="fee"></RimoElement>
<RimoElement kind="el-option" label="退款" value="refund"></RimoElement></RimoElement></>
              }}><RimoElement kind="el-table-column" prop="id" label="流水號" width="180" slots={{
                  "default": ({
                    row
                  }) => <><span className="font-mono">{rimoText(row.id)}</span></>
                }}></RimoElement>
<RimoElement kind="el-table-column" prop="time" label="交易時間" width="180"></RimoElement>
<RimoElement kind="el-table-column" prop="type" label="類型" width="120" slots={{
                  "default": ({
                    row
                  }) => <><RimoElement kind="el-tag" size="small" type={view.getTransactionTypeTag(row.type)}>{rimoText(row.typeText)}</RimoElement></>
                }}></RimoElement>
<RimoElement kind="el-table-column" prop="amount" label="金額" width="120" slots={{
                  "default": ({
                    row
                  }) => <><span className={rimoClass([rimoClass(row.amount > 0 ? 'text-red-600' : 'text-green-600'), "font-bold"])}>{text("\n                                                ")}{rimoText(row.amount > 0 ? '-' : '+')}{text("¥")}{rimoText(Math.abs(row.amount))}{text("\n                                            ")}</span></>
                }}></RimoElement>
<RimoElement kind="el-table-column" prop="method" label="支付方式" width="120"></RimoElement>
<RimoElement kind="el-table-column" prop="orderId" label="關聯訂單" width="140"></RimoElement>
<RimoElement kind="el-table-column" prop="status" label="狀態"></RimoElement></RimoElement></div></RimoElement>
<RimoElement kind="el-tab-pane" name="points" slots={{
            "label": _slot => <><span>{text("積分記錄 ")}
<RimoElement kind="el-badge" value={view.points.length} type="primary" className="ml-1"></RimoElement></span></>
          }}><div className="py-4" data-rimo-layout="list"><div className="flex items-center justify-between mb-4 bg-orange-50 p-3 rounded-lg border border-orange-100"><span className="text-orange-800 font-bold flex items-center"><RimoElement kind="el-icon" className="mr-2"><RimoIcon name="Coin" /></RimoElement>
{text(" 當前可用積分：2,450\n                                    ")}</span>
<RimoElement kind="el-button" size="small" type="primary" plain={true}>{text("手動調整積分")}</RimoElement></div>
<RimoElement kind="el-table" data={view.points} stripe={true} style={rimoStyle("width: 100%")}><RimoElement kind="el-table-column" prop="time" label="變動時間" width="180"></RimoElement>
<RimoElement kind="el-table-column" prop="type" label="類型" width="100" slots={{
                  "default": ({
                    row
                  }) => <><RimoElement kind="el-tag" size="small" type={row.change > 0 ? 'success' : 'warning'}>{rimoText(row.typeText)}</RimoElement></>
                }}></RimoElement>
<RimoElement kind="el-table-column" prop="change" label="變動值" width="120" slots={{
                  "default": ({
                    row
                  }) => <><span className={rimoClass(["font-bold", rimoClass(row.change > 0 ? 'text-green-600' : 'text-orange-600')])}>{text("\n                                                ")}{rimoText(row.change > 0 ? '+' : '')}{rimoText(row.change)}{text("\n                                            ")}</span></>
                }}></RimoElement>
<RimoElement kind="el-table-column" prop="balance" label="變動後餘額" width="120"></RimoElement>
<RimoElement kind="el-table-column" prop="reason" label="來源/原因"></RimoElement>
<RimoElement kind="el-table-column" prop="orderId" label="關聯訂單" width="140"></RimoElement></RimoElement></div></RimoElement>
<RimoElement kind="el-tab-pane" name="invites" slots={{
            "label": _slot => <><span>{text("邀請記錄 ")}
<RimoElement kind="el-badge" value={view.invites.length} type="primary" className="ml-1"></RimoElement></span></>
          }}><div className="py-4" data-rimo-layout="list"><div className="grid grid-cols-3 gap-4 mb-6"><div className="bg-gray-50 p-3 rounded text-center"><div className="text-xs text-gray-500">{text("已邀請人數")}</div>
<div className="text-xl font-bold text-gray-800">{text("12")}</div></div>
<div className="bg-gray-50 p-3 rounded text-center"><div className="text-xs text-gray-500">{text("成功註冊")}</div>
<div className="text-xl font-bold text-green-600">{text("8")}</div></div>
<div className="bg-gray-50 p-3 rounded text-center"><div className="text-xs text-gray-500">{text("累計獲得獎勵")}</div>
<div className="text-xl font-bold text-orange-600">{text("800 積分")}</div></div></div>
<RimoElement kind="el-table" data={view.invites} stripe={true} style={rimoStyle("width: 100%")}><RimoElement kind="el-table-column" prop="time" label="邀請時間" width="180"></RimoElement>
<RimoElement kind="el-table-column" prop="invitee" label="被邀請人" width="120"></RimoElement>
<RimoElement kind="el-table-column" prop="phone" label="手機號" width="140"></RimoElement>
<RimoElement kind="el-table-column" prop="status" label="註冊狀態" width="120" slots={{
                  "default": ({
                    row
                  }) => <><RimoElement kind="el-tag" size="small" type={row.status === 'registered' ? 'success' : 'info'}>{text("\n                                                ")}{rimoText(row.status === 'registered' ? '已註冊' : '未註冊')}{text("\n                                            ")}</RimoElement></>
                }}></RimoElement>
<RimoElement kind="el-table-column" prop="reward" label="獎勵"></RimoElement></RimoElement></div></RimoElement>
<RimoElement kind="el-tab-pane" name="service" slots={{
            "label": _slot => <><span>{text("客服記錄 ")}
<RimoElement kind="el-badge" value={view.serviceLogs.length} type="primary" className="ml-1"></RimoElement></span></>
          }}><div className="py-4" data-rimo-layout="list"><div className="flex justify-end mb-4"><RimoElement kind="el-button" type="primary" size="small">{text("新建客服工單")}</RimoElement></div>
<RimoElement kind="el-table" data={view.serviceLogs} stripe={true} style={rimoStyle("width: 100%")}><RimoElement kind="el-table-column" prop="time" label="聯絡時間" width="180"></RimoElement>
<RimoElement kind="el-table-column" prop="channel" label="渠道" width="100" slots={{
                  "default": ({
                    row
                  }) => <><RimoElement kind="el-tag" size="small" effect="plain">{rimoText(row.channel)}</RimoElement></>
                }}></RimoElement>
<RimoElement kind="el-table-column" prop="ticketId" label="工單號" width="140"></RimoElement>
<RimoElement kind="el-table-column" prop="subject" label="主題/摘要" minWidth="200"></RimoElement>
<RimoElement kind="el-table-column" prop="status" label="狀態" width="100" slots={{
                  "default": ({
                    row
                  }) => <><RimoElement kind="el-tag" size="small" type={row.status === 'closed' ? 'success' : 'warning'}>{text("\n                                                ")}{rimoText(row.status === 'closed' ? '已關閉' : '處理中')}{text("\n                                            ")}</RimoElement></>
                }}></RimoElement>
<RimoElement kind="el-table-column" prop="operator" label="處理人" width="120"></RimoElement></RimoElement></div></RimoElement>
<RimoElement kind="el-tab-pane" label="方案變更" name="plan_history"><div className="py-4" data-rimo-layout="list"><RimoElement kind="el-table" data={view.planHistory} stripe={true} style={rimoStyle("width: 100%")}><RimoElement kind="el-table-column" prop="time" label="變更時間" width="180"></RimoElement>
<RimoElement kind="el-table-column" prop="oldPlan" label="原方案" width="140"></RimoElement>
<RimoElement kind="el-table-column" prop="newPlan" label="新方案" width="140"></RimoElement>
<RimoElement kind="el-table-column" prop="type" label="變更類型" width="120" slots={{
                  "default": ({
                    row
                  }) => <><RimoElement kind="el-tag" size="small" type={row.type === 'upgrade' ? 'success' : 'info'}>{rimoText(row.typeText)}</RimoElement></>
                }}></RimoElement>
<RimoElement kind="el-table-column" prop="reason" label="變更原因"></RimoElement>
<RimoElement kind="el-table-column" prop="operator" label="操作人" width="120"></RimoElement></RimoElement></div></RimoElement>
<RimoElement kind="el-tab-pane" label="登錄日誌" name="login_logs"><div className="py-4" data-rimo-layout="list"><RimoElement kind="el-table" data={view.loginLogs} stripe={true} style={rimoStyle("width: 100%")}><RimoElement kind="el-table-column" prop="time" label="登錄時間" width="180"></RimoElement>
<RimoElement kind="el-table-column" prop="method" label="登錄方式" width="120"></RimoElement>
<RimoElement kind="el-table-column" prop="ip" label="IP地址" width="140"></RimoElement>
<RimoElement kind="el-table-column" prop="device" label="設備信息"></RimoElement>
<RimoElement kind="el-table-column" prop="status" label="狀態" width="100" slots={{
                  "default": ({
                    row
                  }) => <><RimoElement kind="el-tag" size="small" type={row.status === 'success' ? 'success' : 'danger'}>{text("\n                                                ")}{rimoText(row.status === 'success' ? '成功' : '失敗')}{text("\n                                            ")}</RimoElement></>
                }}></RimoElement></RimoElement></div></RimoElement>
<RimoElement kind="el-tab-pane" label="賬號日誌" name="account_logs"><div className="py-4" data-rimo-layout="list"><RimoElement kind="el-table" data={view.accountLogs} stripe={true} style={rimoStyle("width: 100%")}><RimoElement kind="el-table-column" prop="time" label="操作時間" width="180"></RimoElement>
<RimoElement kind="el-table-column" prop="action" label="操作類型" width="140"></RimoElement>
<RimoElement kind="el-table-column" prop="detail" label="詳情"></RimoElement>
<RimoElement kind="el-table-column" prop="ip" label="IP地址" width="140"></RimoElement>
<RimoElement kind="el-table-column" prop="operator" label="操作人" width="120"></RimoElement></RimoElement></div></RimoElement></RimoElement></div></div></RimoRoot>;
}