import { useRimoModel } from '../../lib/rimo-model.js';
import { RimoRoot, RimoIcon, useRimoEnvironment } from '../../lib/RimoEnvironment.jsx';
import { RimoElement, rimoStyle, rimoText } from '../../lib/RimoElements.jsx';
import './enterprise-channel-ticket-batch-detail.css';
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
      derived: computed
    } = model;
    const batches = [{
      id: 1,
      batchNo: 'GT-KM-20260501-001',
      name: '金門 5 月 A 團租車券',
      enterprise: '金門風獅爺旅行社',
      issueMode: 'LIST',
      stationTypes: ['旅行社團體專用'],
      stations: ['金城民生停車場'],
      pickupAt: '2026-05-01 09:00',
      returnAt: '2026-05-01 17:00',
      availableStartAt: '2026-04-20 00:00',
      availableEndAt: '2026-05-01 17:00',
      totalCount: 12,
      issuedCount: 9,
      pendingIssueCount: 3,
      usedCount: 6,
      expiredCount: 0,
      voidCount: 1,
      status: '啓用',
      codes: [{
        code: 'KM-A0501-001',
        visitorName: '王志明',
        documentNo: 'A123456789',
        issueStatus: '已發放',
        status: '已使用',
        member: '王志明 A123456789',
        orderNo: 'TS-KM-20260501-0001',
        orderStatus: '已完成',
        settlementStatus: 'SETTLED',
        overdueMinutes: 0,
        abnormalFeeTotal: 0,
        usedAt: '2026-04-25 10:16'
      }, {
        code: 'KM-A0501-002',
        visitorName: '林雅婷',
        documentNo: 'B223456789',
        issueStatus: '已發放',
        status: '已使用',
        member: '林雅婷 B223456789',
        orderNo: 'TS-KM-20260501-0002',
        orderStatus: '已完成',
        settlementStatus: 'SETTLED',
        overdueMinutes: 42,
        abnormalFeeTotal: 480,
        usedAt: '2026-04-25 10:21'
      }, {
        code: 'KM-A0501-003',
        visitorName: '許家豪',
        documentNo: '110101199001011234',
        issueStatus: '待發放',
        status: '未使用',
        member: '-',
        orderNo: '',
        orderStatus: '',
        usedAt: '-'
      }, {
        code: 'KM-A0501-004',
        visitorName: '吳佳穎',
        documentNo: '110101199202022345',
        issueStatus: '待發放',
        status: '未使用',
        member: '-',
        orderNo: '',
        orderStatus: '',
        usedAt: '-'
      }, {
        code: 'KM-A0501-007',
        visitorName: '劉冠廷',
        documentNo: 'H223456789',
        issueStatus: '已發放',
        status: '已作廢',
        member: '劉冠廷 H223456789',
        orderNo: '',
        orderStatus: '',
        usedAt: '-'
      }, {
        code: 'KM-A0501-005',
        visitorName: '陳柏翰',
        documentNo: 'C123456789',
        issueStatus: '已發放',
        status: '已使用',
        member: '陳柏翰 C123456789',
        orderNo: 'TS-KM-20260501-0008',
        orderStatus: '用車中',
        settlementStatus: 'OVERDUE_IN_PROGRESS',
        overdueMinutes: 35,
        abnormalFeeTotal: null,
        usedAt: '2026-04-25 11:03'
      }, {
        code: 'KM-A0501-006',
        visitorName: '張怡君',
        documentNo: 'D223456789',
        issueStatus: '已發放',
        status: '已使用',
        member: '張怡君 D223456789',
        orderNo: 'TS-KM-20260501-0011',
        orderStatus: '已預約',
        settlementStatus: 'PENDING',
        overdueMinutes: 0,
        abnormalFeeTotal: 0,
        usedAt: '2026-04-25 11:44'
      }, {
        code: 'KM-A0501-008',
        visitorName: '李承恩',
        documentNo: 'E123456780',
        issueStatus: '已發放',
        status: '已使用',
        member: '李承恩 E123456780',
        orderNo: 'TS-KM-20260501-0013',
        orderStatus: '用車中',
        settlementStatus: 'PENDING',
        overdueMinutes: 0,
        abnormalFeeTotal: 0,
        usedAt: '2026-04-25 12:06'
      }, {
        code: 'KM-A0501-009',
        visitorName: '郭佩珊',
        documentNo: 'F223456780',
        issueStatus: '已發放',
        status: '未使用',
        member: '郭佩珊 F223456780',
        orderNo: 'TS-KM-20260501-0015',
        orderStatus: '已取消',
        settlementStatus: 'CANCELED',
        overdueMinutes: 0,
        abnormalFeeTotal: 0,
        usedAt: '2026-04-25 12:18'
      }, {
        code: 'KM-A0501-010',
        visitorName: '黃俊杰',
        documentNo: 'G123456780',
        issueStatus: '已發放',
        status: '已使用',
        member: '黃俊杰 G123456780',
        orderNo: 'TS-KM-20260501-0016',
        orderStatus: '已完成',
        settlementStatus: 'SETTLED',
        overdueMinutes: 0,
        abnormalFeeLabel: '其他費用',
        abnormalFeeTotal: 300,
        usedAt: '2026-04-25 12:31'
      }, {
        code: 'KM-A0501-011',
        visitorName: '蔡佳玲',
        documentNo: 'H223456780',
        issueStatus: '已發放',
        status: '未使用',
        member: '蔡佳玲 H223456780',
        orderNo: '',
        orderStatus: '',
        usedAt: '-'
      }, {
        code: 'KM-A0501-012',
        visitorName: '周冠宇',
        documentNo: '110101198805053456',
        issueStatus: '待發放',
        status: '未使用',
        member: '-',
        orderNo: '',
        orderStatus: '',
        usedAt: '-'
      }],
      operationLogs: [{
        time: '2026-04-25 13:05',
        type: '作廢租車券',
        operator: '營運端 Admin',
        content: '作廢租車券 KM-A0501-007',
        reason: '名單證件號碼填寫錯誤，已改由新增租車券補發'
      }, {
        time: '2026-04-25 12:30',
        type: '導出租車券',
        operator: '企業端',
        content: '導出本批次 Excel（租車券列表、訂單完整數據）',
        reason: '企業覈對活動名單'
      }, {
        time: '2026-04-20 09:15',
        type: '創建批次',
        operator: '營運端 Admin',
        content: '創建租車券批次，共 12 張',
        reason: '金門 5 月 A 團活動'
      }]
    }, {
      id: 2,
      batchNo: 'GT-KM-20260503-002',
      name: '風獅爺員工眷屬體驗券',
      enterprise: '金門風獅爺旅行社',
      issueMode: 'QUANTITY',
      stationTypes: ['一般預約開放'],
      stations: ['山外車站停車場'],
      pickupAt: '2026-05-03 13:30',
      returnAt: '2026-05-03 19:30',
      availableStartAt: '2026-04-25 00:00',
      availableEndAt: '2026-05-03 19:30',
      totalCount: 20,
      issuedCount: 6,
      pendingIssueCount: 14,
      usedCount: 2,
      expiredCount: 0,
      voidCount: 0,
      status: '停用',
      codes: [{
        code: 'KM-D0503-001',
        visitorName: '-',
        documentNo: '-',
        issueStatus: '已領取',
        status: '已使用',
        member: '陳冠宇 I123456789',
        orderNo: 'TS-KM-20260503-0021',
        orderStatus: '已完成',
        usedAt: '2026-04-28 09:20'
      }, {
        code: 'KM-D0503-002',
        visitorName: '-',
        documentNo: '-',
        issueStatus: '已領取',
        status: '未使用',
        member: '黃怡君 J223456789',
        orderNo: '',
        orderStatus: '',
        usedAt: '-'
      }, {
        code: 'KM-D0503-003',
        visitorName: '-',
        documentNo: '-',
        issueStatus: '未領取',
        status: '未使用',
        member: '-',
        orderNo: '',
        orderStatus: '',
        usedAt: '-'
      }],
      operationLogs: [{
        time: '2026-05-01 09:30',
        type: '停用批次',
        operator: '營運端 Admin',
        content: '批次狀態：啓用 -> 停用',
        reason: '活動日期調整，暫停兌換和使用'
      }, {
        time: '2026-04-25 08:50',
        type: '創建批次',
        operator: '營運端 Admin',
        content: '創建數量生成批次，共 20 張',
        reason: '員工眷屬體驗活動'
      }]
    }, {
      id: 4,
      batchNo: 'GT-KM-20260508-004',
      name: '金門環島假期待導入名單批次',
      enterprise: '金門風獅爺旅行社',
      issueMode: 'LIST',
      stationTypes: ['旅行社團體專用'],
      stations: ['金湖機場停車場'],
      pickupAt: '2026-05-08 10:00',
      returnAt: '2026-05-08 18:00',
      availableStartAt: '2026-05-01 00:00',
      availableEndAt: '2026-05-08 18:00',
      totalCount: 0,
      issuedCount: 0,
      pendingIssueCount: 0,
      usedCount: 0,
      expiredCount: 0,
      voidCount: 0,
      status: '待導入名單',
      codes: [],
      operationLogs: [{
        time: '2026-05-01 09:10',
        type: '創建批次',
        operator: '營運端 Admin',
        content: '保存名單發放批次，尚未導入用券人名單',
        reason: '合作企業名單尚未確認'
      }]
    }];
    const currentId = Number(new URLSearchParams(window.location.search).get('id')) || 1;
    const currentBatch = computed(() => batches.find(item => item.id === currentId) || batches[0]);
    const getIssueModeLabel = mode => mode === 'QUANTITY' ? '數量生成' : '名單發放';
    const formatIssueSummary = batch => {
      if (batch.issueMode === 'QUANTITY') return `已領取 ${batch.issuedCount} / 未領取 ${batch.pendingIssueCount}`;
      return `已發放 ${batch.issuedCount} / 待發放 ${batch.pendingIssueCount}`;
    };
    const getBatchStatusType = status => {
      if (status === '啓用') return 'success';
      if (status === '待導入名單') return 'warning';
      return 'info';
    };
    const getIssueStatusType = status => {
      if (status === '已發放' || status === '已領取') return 'success';
      if (status === '未領取') return 'info';
      return 'warning';
    };
    const getTicketStatusType = status => {
      if (status === '已使用') return 'success';
      if (status === '已作廢' || status === '已過期') return 'info';
      return 'warning';
    };
    const goBack = () => {
      window.location.href = 'channel_ticket_batches.html';
    };
    const exportBatch = () => {
      feedback.ElMessage.success(`原型示意：導出 ${currentBatch.value.batchNo} Excel，包含租車券列表和訂單完整數據兩個 Sheet`);
    };
    const openOrder = row => {
      feedback.ElMessage.info(`原型示意：打開訂單詳情 ${row.orderNo}`);
    };
    return {
      currentBatch,
      getIssueModeLabel,
      formatIssueSummary,
      getBatchStatusType,
      getIssueStatusType,
      getTicketStatusType,
      goBack,
      exportBatch,
      openOrder,
      batches,
      currentId
    };
  }
  return pageSetup();
}
export default function EnterpriseChannelTicketBatchDetailBlock() {
  const model = useRimoModel(createPageState);
  const view = model.view;
  const {
    text
  } = useRimoEnvironment();
  return <RimoRoot model={model} pageKey="enterprise-channel-ticket-batch-detail" assets={{}}><div data-business-content="" data-rimo-layout="page"><div className="flex justify-between items-end mb-6"><div><div className="flex items-center gap-3 mb-2"><RimoElement kind="el-button" plain={true} onClick={event => {
              view.goBack?.(event);
            }}><RimoElement kind="el-icon" className="mr-1"><RimoIcon name="Back" /></RimoElement>
{text(" 返回列表\n                            ")}</RimoElement></div>
<div className="flex items-center gap-3" data-rimo-layout="heading"><h1 className="text-2xl font-bold text-gray-800 tracking-tight">{rimoText(view.currentBatch.name)}</h1>
<RimoElement kind="el-tag" type={view.getBatchStatusType(view.currentBatch.status)} effect="plain">{rimoText(view.currentBatch.status)}</RimoElement></div>
<p className="text-gray-500 text-sm mt-1">{rimoText(view.currentBatch.batchNo)}{text(" ｜ 企業端只讀查看，不支持新增、編輯、啓停、導入或作廢。")}</p></div></div>
<div className="grid grid-cols-5 gap-4 mb-6"><div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5"><span className="text-sm text-gray-500 font-medium mb-1 block">{text("租車券總數")}</span>
<span className="card-value text-gray-800">{rimoText(view.currentBatch.totalCount)}</span></div>
<div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5"><span className="text-sm text-gray-500 font-medium mb-1 block">{rimoText(view.currentBatch.issueMode === 'LIST' ? '已發放' : '已領取')}</span>
<span className="card-value text-emerald-600">{rimoText(view.currentBatch.issuedCount)}</span></div>
<div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5"><span className="text-sm text-gray-500 font-medium mb-1 block">{rimoText(view.currentBatch.issueMode === 'LIST' ? '待發放' : '未領取')}</span>
<span className="card-value text-amber-500">{rimoText(view.currentBatch.pendingIssueCount)}</span></div>
<div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5"><span className="text-sm text-gray-500 font-medium mb-1 block">{text("已使用")}</span>
<span className="card-value text-[color:var(--app-color-primary)]">{rimoText(view.currentBatch.usedCount)}</span></div>
<div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5"><span className="text-sm text-gray-500 font-medium mb-1 block">{text("已過期 / 作廢")}</span>
<span className="card-value text-slate-500">{rimoText(view.currentBatch.expiredCount + view.currentBatch.voidCount)}</span></div></div>
<section className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-6"><div className="flex items-center justify-between mb-4"><h2 className="text-lg font-bold text-gray-800">{text("批次基礎信息")}</h2>
<RimoElement kind="el-tag" type="info" effect="plain">{text("費用歸屬：")}{rimoText(view.currentBatch.enterprise)}</RimoElement></div>
<div className="detail-grid"><div className="detail-label">{text("批次編號")}</div>
<div>{rimoText(view.currentBatch.batchNo)}</div>
<div className="detail-label">{text("發券方式")}</div>
<div>{rimoText(view.getIssueModeLabel(view.currentBatch.issueMode))}</div>
<div className="detail-label">{text("所屬合作企業")}</div>
<div>{rimoText(view.currentBatch.enterprise)}</div>
<div className="detail-label">{text("適用服務")}</div>
<div>{text("分時租賃 / 同站租還")}</div>
<div className="detail-label">{text("適用據點類型")}</div>
<div>{rimoText(view.currentBatch.stationTypes.join('、'))}</div>
<div className="detail-label">{text("適用據點")}</div>
<div>{rimoText(view.currentBatch.stations.join('、'))}</div>
<div className="detail-label">{text("時間規則")}</div>
<div>{text("固定取還車時間")}</div>
<div className="detail-label">{text("固定時長模式")}</div>
<div>{text("預留，未開放")}</div>
<div className="detail-label">{text("固定取車時間")}</div>
<div>{rimoText(view.currentBatch.pickupAt)}</div>
<div className="detail-label">{text("固定還車時間")}</div>
<div>{rimoText(view.currentBatch.returnAt)}</div>
<div className="detail-label">{text("可用開始時間")}</div>
<div>{rimoText(view.currentBatch.availableStartAt)}</div>
<div className="detail-label">{text("可用結束時間")}</div>
<div>{rimoText(view.currentBatch.availableEndAt)}</div>
<div className="detail-label">{text("發放統計")}</div>
<div>{rimoText(view.formatIssueSummary(view.currentBatch))}{text(" / 失敗 ")}{rimoText(view.currentBatch.issueFailedCount || 0)}</div>
<div className="detail-label">{text("使用統計")}</div>
<div>{text("未使用 ")}{rimoText(view.currentBatch.unusedCount)}{text(" / 已使用 ")}{rimoText(view.currentBatch.usedCount)}{text(" / 已過期 ")}{rimoText(view.currentBatch.expiredCount)}{text(" / 已作廢 ")}{rimoText(view.currentBatch.voidCount || 0)}</div></div></section>
<section className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6"><div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between"><div><h2 className="text-lg font-bold text-gray-800">{text("租車券列表")}</h2>
<p className="text-xs text-gray-500 mt-1">{text("證件號碼完整展示；不展示證件影像、駕駛證影像和支付記錄等其他敏感信息。")}</p></div>
<RimoElement kind="el-button" type="primary" plain={true} title="導出 Excel：租車券列表 + 訂單完整數據" onClick={event => {
            view.exportBatch?.(event);
          }}><RimoElement kind="el-icon" className="mr-1"><RimoIcon name="Download" /></RimoElement>
{text("導出\n                        ")}</RimoElement></div>
<RimoElement kind="el-table" data={view.currentBatch.codes} style={rimoStyle("width: 100%")} emptyText="該批次尚未導入名單或生成租車券"><RimoElement kind="el-table-column" prop="code" label="租車券編號" width="160"></RimoElement>
<RimoElement kind="el-table-column" label="用券人信息" minWidth="170" slots={{
            "default": ({
              row
            }) => <><div className="font-medium text-gray-800">{rimoText(row.visitorName)}</div>
<div className="text-xs text-gray-500">{rimoText(row.documentNo)}</div></>
          }}></RimoElement>
<RimoElement kind="el-table-column" label="發放 / 領取狀態" width="130" slots={{
            "default": ({
              row
            }) => <><RimoElement kind="el-tag" type={view.getIssueStatusType(row.issueStatus)} effect="plain">{rimoText(row.issueStatus)}</RimoElement></>
          }}></RimoElement>
<RimoElement kind="el-table-column" label="使用狀態" width="110" slots={{
            "default": ({
              row
            }) => <><RimoElement kind="el-tag" type={view.getTicketStatusType(row.status)} effect="plain">{rimoText(row.status)}</RimoElement></>
          }}></RimoElement>
<RimoElement kind="el-table-column" prop="member" label="使用會員" minWidth="170"></RimoElement>
<RimoElement kind="el-table-column" label="訂單號 / 狀態" minWidth="180" slots={{
            "default": ({
              row
            }) => <>{row.orderNo ? <><><div className="font-medium text-gray-800">{rimoText(row.orderNo)}</div>
<div className="text-xs text-gray-500">{rimoText(row.orderStatus)}</div></></> : <><span className="text-gray-400">{text("-")}</span></>}</>
          }}></RimoElement>
<RimoElement kind="el-table-column" label="訂單結算" minWidth="165" slots={{
            "default": ({
              row
            }) => <>{!row.orderNo ? <><span className="text-gray-400">{text("-")}</span></> : row.settlementStatus === 'OVERDUE_IN_PROGRESS' ? <><div className="space-y-1"><RimoElement kind="el-tag" type="warning" effect="plain" size="small">{text("逾時中")}</RimoElement>
<div className="text-xs text-amber-700">{text("已逾時 ")}{rimoText(row.overdueMinutes)}{text(" 分鐘")}</div>
<div className="text-xs text-gray-500">{text("費用待結算")}</div></div></> : Number(row.abnormalFeeTotal || 0) > 0 ? <><div className="space-y-1"><div className="text-sm font-medium text-red-600">{text("\n                                        ")}{rimoText(row.overdueMinutes ? `逾時 ${row.overdueMinutes} 分鐘` : row.abnormalFeeLabel || '有異常費用')}{text("\n                                    ")}</div>
<div className="text-xs text-gray-600">{text("異常費用 NT$ ")}{rimoText(Number(row.abnormalFeeTotal).toLocaleString())}</div></div></> : row.orderStatus === '已取消' ? <><span className="text-gray-500">{text("訂單已取消")}</span></> : row.orderStatus === '已完成' ? <><span className="text-green-600">{text("正常結算")}</span></> : <><div className="text-gray-500"><div>{text("暫無異常費用")}</div>
<div className="text-xs mt-1">{text("待結算")}</div></div></>}</>
          }}></RimoElement>
<RimoElement kind="el-table-column" prop="usedAt" label="使用時間" width="150"></RimoElement>
<RimoElement kind="el-table-column" label="操作" width="120" align="right" fixed="right" slots={{
            "default": ({
              row
            }) => <><RimoElement kind="el-button" type="primary" link={true} disabled={!row.orderNo} onClick={_event => {
                view.openOrder(row);
              }}>{text("查看訂單")}</RimoElement></>
          }}></RimoElement></RimoElement></section>
<section className="bg-white rounded-xl shadow-sm border border-gray-100 p-5"><div className="flex items-center justify-between mb-4"><h2 className="text-lg font-bold text-gray-800">{text("批次操作記錄")}</h2>
<span className="text-xs text-gray-500">{text("企業端僅只讀查看與本企業批次相關的操作記錄")}</span></div>
<RimoElement kind="el-table" data={view.currentBatch.operationLogs} style={rimoStyle("width: 100%")} emptyText="暫無操作記錄"><RimoElement kind="el-table-column" prop="time" label="時間" width="170"></RimoElement>
<RimoElement kind="el-table-column" prop="type" label="操作類型" width="150"></RimoElement>
<RimoElement kind="el-table-column" prop="operator" label="操作人" width="120"></RimoElement>
<RimoElement kind="el-table-column" prop="content" label="操作內容" minWidth="240"></RimoElement>
<RimoElement kind="el-table-column" prop="reason" label="原因 / 備註" minWidth="220"></RimoElement></RimoElement></section></div></RimoRoot>;
}