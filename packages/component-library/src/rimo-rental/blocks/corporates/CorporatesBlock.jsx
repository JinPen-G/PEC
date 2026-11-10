import { Fragment } from 'react';
import { useRimoModel, rimoEntries } from '../../lib/rimo-model.js';
import { RimoRoot, RimoIcon, rimoIcons, useRimoEnvironment } from '../../lib/RimoEnvironment.jsx';
import { RimoElement, rimoStyle, rimoText } from '../../lib/RimoElements.jsx';
import './corporates.css';
function createPageState(model) {
  const _document = model.document;
  const window = model.window;
  const localStorage = model.storage;
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
      watch: watch
    } = model;
    const {
      ElMessage: _ElMessage,
      ElMessageBox: _ElMessageBox
    } = feedback;
    const corporateList = ref([{
      id: 'CORP001',
      name: 'Google Taiwan'
    }, {
      id: 'CORP002',
      name: 'TSMC 臺積電'
    }, {
      id: 'CORP003',
      name: 'Microsoft Taiwan'
    }, {
      id: 'CORP004',
      name: 'Apple Taiwan'
    }]);
    const licenseTypes = ref([{
      id: 'LT01',
      name: '普通小型車'
    }, {
      id: 'LT02',
      name: '普通重型機車'
    }, {
      id: 'LT03',
      name: '大型重型機車'
    }, {
      id: 'LT04',
      name: '大客車'
    }]);
    const currentStep = ref(0);
    const formSteps = ref([{
      title: '賬號資料',
      icon: 'UserFilled'
    }, {
      title: '地址聯絡',
      icon: 'Location'
    }, {
      title: '駕照證件',
      icon: 'Van'
    }, {
      title: '會員方案',
      icon: 'Medal'
    }]);
    const photoFields = ref([{
      key: 'idCardFront',
      label: '身份證正面'
    }, {
      key: 'idCardBack',
      label: '身份證反面'
    }, {
      key: 'licenseFront',
      label: '駕照正面'
    }, {
      key: 'licenseBack',
      label: '駕照反面'
    }, {
      key: 'selfie',
      label: '自拍照'
    }]);
    const defaultMembers = [{
      id: 'CORP2405001',
      companyName: '臺積電 TSMC',
      taxId: '87654321',
      contactName: '張敏',
      contactPhone: '0955-666-777',
      companyType: '股份有限公司',
      address: '新竹科學園區',
      remarks: '大客戶，重點維護',
      serviceTypes: ['公務用車', '分時租賃'],
      useTime: '全天',
      planId: 'p2',
      planName: '企業白金方案',
      monthlySettlement: true,
      account: 'admin@tsmc.com',
      logo: '',
      status: 'active'
    }, {
      id: 'CORP2405002',
      companyName: '聯發科 MediaTek',
      taxId: '12345678',
      contactName: '李強',
      contactPhone: '0911-222-333',
      companyType: '股份有限公司',
      address: '新竹科學園區篤行一路1號',
      remarks: '',
      serviceTypes: ['門市租賃'],
      useTime: '上班時間',
      planId: 'p1',
      planName: '企業標準方案',
      monthlySettlement: false,
      account: 'hr@mediatek.com',
      logo: '',
      status: 'active'
    }, {
      id: 'CORP2405003',
      companyName: '新創網絡科技有限公司',
      taxId: '88990011',
      contactName: '王大錘',
      contactPhone: '0988-111-222',
      companyType: '有限公司',
      address: '新北市板橋區',
      remarks: '近期有擴大用車需求',
      serviceTypes: ['分時租賃'],
      useTime: '全天',
      planId: 'p1',
      planName: '企業標準方案',
      monthlySettlement: false,
      account: 'wang@startup.tw',
      logo: '',
      status: 'suspended'
    }];
    const membershipPlans = ref([{
      id: 'p1',
      name: '企業標準方案',
      tier: 1
    }, {
      id: 'p2',
      name: '企業白金方案',
      tier: 2
    }]);
    const storedMembersRaw = localStorage.getItem('rimo_corporates');
    let initialMembers = storedMembersRaw ? JSON.parse(storedMembersRaw) : defaultMembers;
    if (initialMembers.length > 20) {
      console.log('Resetting mock data to defaults...');
      initialMembers = defaultMembers;
      localStorage.setItem('rimo_corporates', JSON.stringify(initialMembers));
    }
    const members = ref(initialMembers);
    members.value.forEach(m => {
      if (!m.reviewStatus) m.reviewStatus = 'approved';
      if (!m.registrationChannel) m.registrationChannel = 'official_web';
    });
    watch(members, newVal => {
      localStorage.setItem('rimo_corporates', JSON.stringify(newVal));
    }, {
      deep: true
    });
    const filters = reactive({
      keyword: '',
      serviceType: '',
      planId: '',
      status: ''
    });
    const currentPage = ref(1);
    const pageSize = ref(20);
    const filteredMembers = computed(() => {
      return members.value.filter(m => {
        const matchKeyword = !filters.keyword || m.id.toLowerCase().includes(filters.keyword.toLowerCase()) || m.companyName.includes(filters.keyword) || m.contactName.includes(filters.keyword) || m.taxId.includes(filters.keyword);
        const matchSrv = !filters.serviceType || m.serviceTypes.includes(filters.serviceType === 'timeshare' ? '分時租賃' : filters.serviceType === 'store' ? '門市租賃' : '公務用車');
        const matchPlan = !filters.planId || m.planId === filters.planId;
        const matchStatus = !filters.status || m.status === filters.status;
        return matchKeyword && matchSrv && matchPlan && matchStatus;
      });
    });
    const paginatedMembers = computed(() => {
      const start = (currentPage.value - 1) * pageSize.value;
      return filteredMembers.value.slice(start, start + pageSize.value);
    });
    const resetFilters = () => {
      filters.keyword = '';
      filters.serviceType = '';
      filters.planId = '';
      filters.status = '';
    };
    const getMembershipColor = planId => {
      const colors = {
        'MP001': 'info',
        'MP002': '',
        'MP003': 'warning',
        'MP004': 'danger'
      };
      return colors[planId] || 'info';
    };
    const planDrawerVisible = ref(false);
    const changePlanDialogVisible = ref(false);
    const renewalDialogVisible = ref(false);
    const currentMember = ref({});
    const dialogVisible = ref(false);
    const isEdit = ref(false);
    const licenseTypeDialogVisible = ref(false);
    const newLicenseType = ref('');
    const changePlanForm = reactive({
      planId: '',
      pricingCycle: 'monthly',
      effectiveType: 'immediate',
      reason: ''
    });
    const renewalForm = reactive({
      cycle: '1_month',
      paymentMethod: 'cash',
      note: ''
    });
    const selectedPlan = computed(() => membershipPlans.value.find(p => p.id === changePlanForm.planId));
    const planHistory = ref([{
      content: '開通企業白金方案',
      type: 'primary',
      timestamp: '2024-12-01',
      operator: '系統'
    }, {
      content: '企業註冊',
      type: 'success',
      timestamp: '2024-11-15',
      operator: '管理員'
    }]);
    const getPlanTier = planId => {
      const p = membershipPlans.value.find(x => x.id === planId);
      return p ? p.tier : 1;
    };
    const getPlanBenefits = planId => planId === 'p2' ? ['優先派車', '獨享VIP客服', '免費延長用車', '月結30天賬期'] : ['標準派車', '在線客服', '基本用車保障'];
    const openChangePlanDialog = () => {
      changePlanDialogVisible.value = true;
    };
    const openRenewalDialog = () => {
      renewalDialogVisible.value = true;
    };
    const confirmChangePlan = () => {
      changePlanDialogVisible.value = false;
      feedback.ElMessage.success('方案變更成功');
    };
    const confirmRenewal = () => {
      renewalDialogVisible.value = false;
      feedback.ElMessage.success('續約成功');
    };
    const handleTerminatePlan = () => {
      feedback.ElMessageBox.confirm('確定解約當前方案嗎？', '警告', {
        type: 'warning'
      }).then(() => feedback.ElMessage.success('已解約')).catch(() => {});
    };
    const addLicenseType = () => {
      if (newLicenseType.value.trim()) {
        licenseTypes.value.push({
          id: 'LT' + Date.now(),
          name: newLicenseType.value.trim()
        });
        newLicenseType.value = '';
      }
    };
    const deleteLicenseType = index => {
      licenseTypes.value.splice(index, 1);
    };
    const memberForm = reactive({
      id: '',
      companyName: '',
      taxId: '',
      contactName: '',
      contactPhone: '',
      companyType: '',
      address: '',
      remarks: '',
      serviceTypes: [],
      useTime: '上班時間',
      planId: '',
      monthlySettlement: false,
      account: '',
      password: '',
      monthlyRate: '',
      annualRate: '',
      pickupLocation: '',
      billingReminder: '',
      billingContact: '',
      billingEmail: ''
    });
    const openCreateDialog = () => {
      isEdit.value = false;
      Object.assign(memberForm, {
        id: '',
        companyName: '',
        taxId: '',
        contactName: '',
        contactPhone: '',
        companyType: '',
        address: '',
        remarks: '',
        serviceTypes: [],
        useTime: '上班時間',
        planId: '',
        monthlySettlement: false,
        account: '',
        password: '',
        monthlyRate: '',
        annualRate: '',
        pickupLocation: '',
        billingReminder: '',
        billingContact: '',
        billingEmail: ''
      });
      dialogVisible.value = true;
    };
    const openEditDialog = member => {
      isEdit.value = true;
      Object.assign(memberForm, {
        ...member,
        password: ''
      });
      dialogVisible.value = true;
    };
    const goToDetail = member => {
      window.location.href = `corporate_detail.html?id=${member.id}`;
    };
    const saveMember = () => {
      if (!memberForm.id || !memberForm.companyName || !memberForm.taxId || !memberForm.account) {
        feedback.ElMessage.warning('請填寫企業編號、企業名稱、統編和登錄賬號');
        return;
      }
      if (!isEdit.value && !memberForm.password) {
        feedback.ElMessage.warning('新增企業需設置管理員登錄密碼');
        return;
      }
      const plan = membershipPlans.value.find(p => p.id === memberForm.planId);
      const memberData = {
        ...memberForm,
        planName: plan ? plan.name : '',
        status: isEdit.value ? members.value.find(m => m.id === memberForm.id).status : 'active'
      };
      if (isEdit.value) {
        const idx = members.value.findIndex(m => m.id === memberForm.id);
        if (idx !== -1) {
          members.value[idx] = Object.assign(members.value[idx], memberData);
        }
      } else {
        members.value.unshift(memberData);
      }
      dialogVisible.value = false;
      feedback.ElMessage.success('保存成功');
    };
    const handleStatusChange = (_row, val) => {
      const text = val === 'active' ? '正常' : '停權';
      feedback.ElMessage.success(`狀態已更改爲: ${text}`);
    };
    const exportData = () => {
      feedback.ElMessage.info('導出功能開發中');
    };
    return {
      members,
      membershipPlans,
      filters,
      currentPage,
      pageSize,
      filteredMembers,
      paginatedMembers,
      resetFilters,
      dialogVisible,
      isEdit,
      memberForm,
      planDrawerVisible,
      changePlanDialogVisible,
      renewalDialogVisible,
      currentMember,
      licenseTypeDialogVisible,
      openCreateDialog,
      openEditDialog,
      goToDetail,
      saveMember,
      exportData,
      handleStatusChange,
      changePlanForm,
      renewalForm,
      selectedPlan,
      planHistory,
      getPlanTier,
      getPlanBenefits,
      openChangePlanDialog,
      openRenewalDialog,
      confirmChangePlan,
      confirmRenewal,
      handleTerminatePlan,
      addLicenseType,
      deleteLicenseType,
      newLicenseType,
      licenseTypes,
      OfficeBuilding: rimoIcons.OfficeBuilding,
      HomeFilled: rimoIcons.HomeFilled,
      Briefcase: rimoIcons.Briefcase,
      Location: rimoIcons.Location,
      User: rimoIcons.User,
      PhoneFilled: rimoIcons.PhoneFilled,
      Phone: rimoIcons.Phone,
      Message: rimoIcons.Message,
      Setting: rimoIcons.Setting,
      Check: rimoIcons.Check,
      Picture: rimoIcons.Picture,
      Medal: rimoIcons.Medal,
      List: rimoIcons.List,
      Key: rimoIcons.Key,
      Calendar: rimoIcons.Calendar,
      Plus: rimoIcons.Plus,
      Odometer: rimoIcons.Odometer,
      Histogram: rimoIcons.Histogram,
      Document: rimoIcons.Document,
      Management: rimoIcons.Management,
      Postcard: rimoIcons.Postcard,
      Stamp: rimoIcons.Stamp,
      Van: rimoIcons.Van,
      Files: rimoIcons.Files,
      Tickets: rimoIcons.Tickets,
      Grid: rimoIcons.Grid,
      Money: rimoIcons.Money,
      Goods: rimoIcons.Goods,
      Present: rimoIcons.Present,
      Avatar: rimoIcons.Avatar,
      Operation: rimoIcons.Operation,
      Lock: rimoIcons.Lock,
      Bell: rimoIcons.Bell,
      Refresh: rimoIcons.Refresh,
      Delete: rimoIcons.Delete,
      Star: rimoIcons.Star,
      Warning: rimoIcons.Warning,
      Clock: rimoIcons.Clock,
      ElMessage: feedback.ElMessage,
      ElMessageBox: feedback.ElMessageBox,
      corporateList,
      currentStep,
      formSteps,
      photoFields,
      defaultMembers,
      storedMembersRaw,
      initialMembers,
      getMembershipColor
    };
  }
  return pageSetup();
}
export default function CorporatesBlock() {
  const model = useRimoModel(createPageState);
  const view = model.view;
  const {
    text
  } = useRimoEnvironment();
  return <RimoRoot model={model} pageKey="corporates" assets={{}}><div data-business-content="" data-rimo-layout="page"><div className="flex justify-between items-end mb-6" data-rimo-layout="heading"><div><h1 className="text-2xl font-bold text-gray-800 tracking-tight">{text("企業客戶管理")}</h1>
<p className="text-gray-500 text-sm mt-1">{text("管理所有企業客戶資料、統編、開通服務及合作方案。")}</p></div>
<div className="flex gap-3"><RimoElement kind="el-button" type="primary" size="large" className="shadow-md shadow-[color:var(--app-color-primary-shadow)]" onClick={event => {
            view.openCreateDialog?.(event);
          }}><RimoElement kind="el-icon" className="mr-1"><RimoIcon name="Plus" /></RimoElement>
{text(" 新增企業\n                        ")}</RimoElement></div></div>
<div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden" data-rimo-layout="list"><RimoElement kind="el-table" data={view.paginatedMembers} stripe={true} style={rimoStyle("width: 100%")} headerCellStyle={{
          backgroundColor: '#f9fafb',
          color: '#374151',
          fontWeight: 'bold'
        }} slots={{
          "toolbar": _slot => <><div className="flex gap-3 items-center flex-wrap"><RimoElement kind="el-input" modelValue={view.filters.keyword} onModelChange={value => {
                model.write(["filters", "keyword"], value);
              }} placeholder="搜索企業編號/企業名稱/聯絡人/統編" clearable={true} style={rimoStyle("width: 280px")} prefixIcon="Search"></RimoElement>
<RimoElement kind="el-select" modelValue={view.filters.serviceType} onModelChange={value => {
                model.write(["filters", "serviceType"], value);
              }} placeholder="合作服務類型" clearable={true} style={rimoStyle("width: 150px")}><RimoElement kind="el-option" label="分時租賃" value="timeshare"></RimoElement>
<RimoElement kind="el-option" label="門市租賃" value="store"></RimoElement>
<RimoElement kind="el-option" label="公務用車" value="official"></RimoElement></RimoElement>
<RimoElement kind="el-select" modelValue={view.filters.planId} onModelChange={value => {
                model.write(["filters", "planId"], value);
              }} placeholder="企業方案" clearable={true} style={rimoStyle("width: 140px")}>{rimoEntries(view.membershipPlans).map(([plan], _itemIndex) => <Fragment key={plan.id}><RimoElement kind="el-option" key={plan.id} label={plan.name} value={plan.id}></RimoElement></Fragment>)}</RimoElement>
<RimoElement kind="el-select" modelValue={view.filters.status} onModelChange={value => {
                model.write(["filters", "status"], value);
              }} placeholder="合作狀態" clearable={true} style={rimoStyle("width: 120px")}><RimoElement kind="el-option" label="正常" value="active"></RimoElement>
<RimoElement kind="el-option" label="停權" value="suspended"></RimoElement></RimoElement>
<RimoElement kind="el-tooltip" content="重置篩選" placement="top"><RimoElement kind="el-button" circle={true} onClick={event => {
                  view.resetFilters?.(event);
                }}><RimoElement kind="el-icon"><RimoIcon name="Refresh" /></RimoElement></RimoElement></RimoElement>
<RimoElement kind="el-button" type="primary" plain={true} icon="Download" onClick={event => {
                view.exportData?.(event);
              }}>{text("導出")}</RimoElement></div>
<div className="text-sm text-gray-500">{text("共 ")}{rimoText(view.filteredMembers.length)}{text(" 家企業")}</div></>
        }}><RimoElement kind="el-table-column" prop="id" label="企業編號" width="120" slots={{
            "default": ({
              row
            }) => <><span className="font-mono text-xs text-gray-500">{rimoText(row.id)}</span></>
          }}></RimoElement>
<RimoElement kind="el-table-column" label="企業信息" minWidth="220" slots={{
            "default": ({
              row
            }) => <><div className="flex items-center">{row.logo ? <><RimoElement kind="el-avatar" src={row.logo} size={36} className="mr-3 border"></RimoElement></> : <><RimoElement kind="el-avatar" size={36} className="mr-3 border bg-blue-100 text-blue-600 border-blue-200">{text("\n                                        ")}{rimoText(row.companyName ? row.companyName.charAt(0) : '企')}{text("\n                                    ")}</RimoElement></>}
<div><div className="font-bold text-gray-900">{rimoText(row.companyName)}</div>
<div className="text-xs text-gray-500 font-mono mt-0.5" title="統編">{text("\n                                            統編: ")}{rimoText(row.taxId)}{text("\n                                        ")}</div></div></div></>
          }}></RimoElement>
<RimoElement kind="el-table-column" label="聯絡人與電話" minWidth="160" slots={{
            "default": ({
              row
            }) => <><div className="text-sm text-gray-900 font-medium">{rimoText(row.contactName)}</div>
<div className="text-xs text-gray-500 font-mono mt-0.5 flex items-center gap-1"><RimoElement kind="el-icon"><RimoIcon name="Phone" /></RimoElement>
{rimoText(row.contactPhone)}{text("\n                                ")}</div></>
          }}></RimoElement>
<RimoElement kind="el-table-column" label="開通服務" minWidth="200" slots={{
            "default": ({
              row
            }) => <><div className="flex flex-wrap gap-1">{rimoEntries(row.serviceTypes).map(([srv], _itemIndex) => <Fragment key={srv}><RimoElement kind="el-tag" key={srv} size="small" type={srv === '公務用車' ? 'success' : 'primary'} effect="plain">{text("\n                                        ")}{rimoText(srv)}{text("\n                                    ")}</RimoElement></Fragment>)}</div>
{row.monthlySettlement ? <><div className="text-xs text-orange-500 mt-1 flex items-center"><RimoElement kind="el-icon" className="mr-1"><RimoIcon name="Calendar" /></RimoElement>
{text("月結客戶\n                                ")}</div></> : null}</>
          }}></RimoElement>
<RimoElement kind="el-table-column" label="企業方案" minWidth="140" slots={{
            "default": ({
              row
            }) => <><RimoElement kind="el-tag" type={row.planId === 'p2' ? 'warning' : 'info'} size="small" className="mr-2" effect="dark">{text("\n                                    ")}{rimoText(row.planName)}{text("\n                                ")}</RimoElement></>
          }}></RimoElement>
<RimoElement kind="el-table-column" label="合作狀態" width="120" slots={{
            "default": ({
              row
            }) => <><RimoElement kind="el-switch" modelValue={row.status} onModelChange={value => {
                model.assign(row, "status", value);
              }} activeValue="active" inactiveValue="suspended" inlinePrompt={true} activeText="正常" inactiveText="停權" onChange={event => {
                (val => view.handleStatusChange(row, val))?.(event);
              }}></RimoElement></>
          }}></RimoElement>
<RimoElement kind="el-table-column" label="操作" width="120" align="right" fixed="right" slots={{
            "default": ({
              row
            }) => <><div className="flex justify-end gap-2"><RimoElement kind="el-button" type="primary" link={true} size="small" onClick={_event => {
                  view.goToDetail(row);
                }}>{text("查看")}</RimoElement>
<RimoElement kind="el-button" type="primary" link={true} size="small" onClick={_event => {
                  view.openEditDialog(row);
                }}>{text("編輯")}</RimoElement></div></>
          }}></RimoElement></RimoElement>
<div className="p-4 border-t border-gray-100 flex justify-end bg-gray-50"><RimoElement kind="el-pagination" currentPage={view.currentPage} onCurrentPageChange={value => {
            model.write(["currentPage"], value);
          }} pageSize={view.pageSize} onPageSizeChange={value => {
            model.write(["pageSize"], value);
          }} pageSizes={[10, 20, 50, 100]} total={view.filteredMembers.length} background={true} layout="total, sizes, prev, pager, next, jumper"></RimoElement></div></div></div><RimoElement kind="el-dialog" modelValue={view.dialogVisible} onModelChange={value => {
      model.write(["dialogVisible"], value);
    }} title={view.isEdit ? '編輯企業資料' : '新增企業'} width="900px" top="3vh" destroyOnClose={true} className="member-dialog corporates-overlay" slots={{
      "footer": _slot => <><div className="flex justify-end gap-3"><RimoElement kind="el-button" onClick={_event => {
            model.write(["dialogVisible"], false);
          }}>{text("取消")}</RimoElement>
<RimoElement kind="el-button" type="primary" onClick={event => {
            view.saveMember?.(event);
          }}><RimoElement kind="el-icon" className="mr-1"><RimoIcon name="Check" /></RimoElement>
{text("保存\n                    ")}</RimoElement></div></>
    }}>{() => <><RimoElement kind="el-form" model={view.memberForm} labelPosition="top" className="custom-scroll max-h-[70vh] overflow-y-auto px-2"><div className="mb-5"><div className="text-sm font-bold text-gray-700 mb-3 flex items-center"><RimoElement kind="el-icon" className="mr-2 text-[color:var(--app-color-primary)]"><RimoIcon name="OfficeBuilding" /></RimoElement>
{text("\n                        企業基本信息\n                    ")}</div>
<div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm"><RimoElement kind="el-row" gutter={16}><RimoElement kind="el-col" span={12}><RimoElement kind="el-form-item" label="企業編號" required={true}><RimoElement kind="el-input" modelValue={view.memberForm.id} onModelChange={value => {
                      model.write(["memberForm", "id"], value);
                    }} placeholder="輸入企業編號" disabled={view.isEdit}></RimoElement></RimoElement></RimoElement>
<RimoElement kind="el-col" span={12}><RimoElement kind="el-form-item" label="企業名稱" required={true}><RimoElement kind="el-input" modelValue={view.memberForm.companyName} onModelChange={value => {
                      model.write(["memberForm", "companyName"], value);
                    }} placeholder="輸入企業名稱"></RimoElement></RimoElement></RimoElement>
<RimoElement kind="el-col" span={12}><RimoElement kind="el-form-item" label="統編" required={true}><RimoElement kind="el-input" modelValue={view.memberForm.taxId} onModelChange={value => {
                      model.write(["memberForm", "taxId"], value);
                    }} placeholder="8位企業統編"></RimoElement></RimoElement></RimoElement>
<RimoElement kind="el-col" span={12}><RimoElement kind="el-form-item" label="聯絡人姓名" required={true}><RimoElement kind="el-input" modelValue={view.memberForm.contactName} onModelChange={value => {
                      model.write(["memberForm", "contactName"], value);
                    }} placeholder="輸入姓名"></RimoElement></RimoElement></RimoElement>
<RimoElement kind="el-col" span={12}><RimoElement kind="el-form-item" label="聯絡電話" required={true}><RimoElement kind="el-input" modelValue={view.memberForm.contactPhone} onModelChange={value => {
                      model.write(["memberForm", "contactPhone"], value);
                    }} placeholder="0912-345-678" prefixIcon="Phone"></RimoElement></RimoElement></RimoElement>
<RimoElement kind="el-col" span={12}><RimoElement kind="el-form-item" label="公司類型"><RimoElement kind="el-select" modelValue={view.memberForm.companyType} onModelChange={value => {
                      model.write(["memberForm", "companyType"], value);
                    }} className="w-full" placeholder="選擇公司類型"><RimoElement kind="el-option" label="股份有限公司" value="股份有限公司"></RimoElement>
<RimoElement kind="el-option" label="有限公司" value="有限公司"></RimoElement>
<RimoElement kind="el-option" label="外商投資" value="外商投資"></RimoElement>
<RimoElement kind="el-option" label="合夥企業" value="合夥企業"></RimoElement></RimoElement></RimoElement></RimoElement>
<RimoElement kind="el-col" span={12}><RimoElement kind="el-form-item" label="通訊地址"><RimoElement kind="el-input" modelValue={view.memberForm.address} onModelChange={value => {
                      model.write(["memberForm", "address"], value);
                    }} placeholder="輸入地址"></RimoElement></RimoElement></RimoElement>
<RimoElement kind="el-col" span={24}><RimoElement kind="el-form-item" label="備註"><RimoElement kind="el-input" modelValue={view.memberForm.remarks} onModelChange={value => {
                      model.write(["memberForm", "remarks"], value);
                    }} type="textarea" rows={2} placeholder="其他說明"></RimoElement></RimoElement></RimoElement></RimoElement></div></div>
<div className="mb-5"><div className="text-sm font-bold text-gray-700 mb-3 flex items-center"><RimoElement kind="el-icon" className="mr-2 text-[color:var(--app-color-primary)]"><RimoIcon name="List" /></RimoElement>
{text("\n                        業務規則與服務方案\n                    ")}</div>
<div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm"><RimoElement kind="el-row" gutter={16}><RimoElement kind="el-col" span={12}><RimoElement kind="el-form-item" label="簽約服務類型" required={true}><RimoElement kind="el-checkbox-group" modelValue={view.memberForm.serviceTypes} onModelChange={value => {
                      model.write(["memberForm", "serviceTypes"], value);
                    }}><RimoElement kind="el-checkbox" label="分時租賃">{text("分時租賃")}</RimoElement>
<RimoElement kind="el-checkbox" label="門市租賃">{text("門市租賃")}</RimoElement>
<RimoElement kind="el-checkbox" label="公務用車">{text("公務用車")}</RimoElement></RimoElement></RimoElement></RimoElement>
<RimoElement kind="el-col" span={12}><RimoElement kind="el-form-item" label="用車時間" required={true}><RimoElement kind="el-radio-group" modelValue={view.memberForm.useTime} onModelChange={value => {
                      model.write(["memberForm", "useTime"], value);
                    }}><RimoElement kind="el-radio" label="上班時間">{text("僅上班時間")}</RimoElement>
<RimoElement kind="el-radio" label="全天">{text("24小時不限")}</RimoElement></RimoElement></RimoElement></RimoElement></RimoElement></div></div>
{view.memberForm.serviceTypes.includes('公務用車') ? <><div className="mb-5"><div className="text-sm font-bold text-gray-700 mb-3 flex items-center"><RimoElement kind="el-icon" className="mr-2 text-[color:var(--app-color-primary)]"><RimoIcon name="Briefcase" /></RimoElement>
{text("\n                        公務用車專屬參數\n                    ")}</div>
<div className="bg-emerald-50/30 p-4 rounded-xl border border-emerald-100 shadow-sm relative overflow-hidden"><div className="absolute right-0 top-0 w-16 h-16 bg-emerald-100/50 rounded-bl-full -mr-4 -mt-4"></div>
<RimoElement kind="el-row" gutter={16} className="relative z-10"><RimoElement kind="el-col" span={24}><RimoElement kind="el-form-item" label="配額費率" required={true}><div className="flex gap-4 w-full"><RimoElement kind="el-input" modelValue={view.memberForm.monthlyRate} onModelChange={value => {
                          model.write(["memberForm", "monthlyRate"], value);
                        }} placeholder="單車月費" className="flex-1" slots={{
                          "append": _slot => <>{text("元/月")}</>
                        }}></RimoElement>
<RimoElement kind="el-input" modelValue={view.memberForm.annualRate} onModelChange={value => {
                          model.write(["memberForm", "annualRate"], value);
                        }} placeholder="單車年費" className="flex-1" slots={{
                          "append": _slot => <>{text("元/年")}</>
                        }}></RimoElement></div></RimoElement></RimoElement>
<RimoElement kind="el-col" span={24}><RimoElement kind="el-form-item" label="簽約用車點" required={true}><RimoElement kind="el-input" modelValue={view.memberForm.pickupLocation} onModelChange={value => {
                        model.write(["memberForm", "pickupLocation"], value);
                      }} placeholder="請輸入簽約用車點地址或者名稱"></RimoElement></RimoElement></RimoElement>
<RimoElement kind="el-col" span={8}><RimoElement kind="el-form-item" label="賬單提醒時間" required={true}><RimoElement kind="el-select" modelValue={view.memberForm.billingReminder} onModelChange={value => {
                        model.write(["memberForm", "billingReminder"], value);
                      }} placeholder="請選擇" className="w-full"><RimoElement kind="el-option" label="出賬日當天" value="0"></RimoElement>
<RimoElement kind="el-option" label="提前 3 天" value="3"></RimoElement>
<RimoElement kind="el-option" label="提前 7 天" value="7"></RimoElement></RimoElement></RimoElement></RimoElement>
<RimoElement kind="el-col" span={8}><RimoElement kind="el-form-item" label="賬單通知聯絡人" required={true}><RimoElement kind="el-input" modelValue={view.memberForm.billingContact} onModelChange={value => {
                        model.write(["memberForm", "billingContact"], value);
                      }} placeholder="聯絡人姓名"></RimoElement></RimoElement></RimoElement>
<RimoElement kind="el-col" span={8}><RimoElement kind="el-form-item" label="賬單通知郵箱" required={true}><RimoElement kind="el-input" modelValue={view.memberForm.billingEmail} onModelChange={value => {
                        model.write(["memberForm", "billingEmail"], value);
                      }} placeholder="email@example.com"></RimoElement></RimoElement></RimoElement></RimoElement></div></div></> : null}
<div className="mb-5"><div className="text-sm font-bold text-gray-700 mb-3 flex items-center"><RimoElement kind="el-icon" className="mr-2 text-[color:var(--app-color-primary)]"><RimoIcon name="Medal" /></RimoElement>
{text("\n                        企業方案設定\n                    ")}</div>
<div className="bg-gradient-to-br from-blue-50 to-[color:var(--app-color-primary-light-9)] p-4 rounded-xl border border-blue-100 shadow-sm"><RimoElement kind="el-row" gutter={16}><RimoElement kind="el-col" span={12}><RimoElement kind="el-form-item" label="企業方案"><RimoElement kind="el-select" modelValue={view.memberForm.planId} onModelChange={value => {
                      model.write(["memberForm", "planId"], value);
                    }} placeholder="選擇方案" className="w-full">{rimoEntries(view.membershipPlans).map(([plan], _itemIndex) => <Fragment key={plan.id}><RimoElement kind="el-option" key={plan.id} label={plan.name} value={plan.id}></RimoElement></Fragment>)}</RimoElement></RimoElement></RimoElement>
<RimoElement kind="el-col" span={12}><RimoElement kind="el-form-item" label="是否月結"><RimoElement kind="el-switch" modelValue={view.memberForm.monthlySettlement} onModelChange={value => {
                      model.write(["memberForm", "monthlySettlement"], value);
                    }} activeText="允許" inactiveText="不許" style={rimoStyle("--el-switch-on-color: var(--app-color-primary)")}></RimoElement></RimoElement></RimoElement></RimoElement></div></div>
<div className="mb-5"><div className="text-sm font-bold text-gray-700 mb-3 flex items-center"><RimoElement kind="el-icon" className="mr-2 text-[color:var(--app-color-primary)]"><RimoIcon name="Key" /></RimoElement>
{text("\n                        企業系統賬號\n                        ")}
<span className="ml-2 text-xs text-gray-400 font-normal">{text("（發放給企業管理員使用的後臺登錄賬號）")}</span></div>
<div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm"><RimoElement kind="el-row" gutter={16}><RimoElement kind="el-col" span={12}><RimoElement kind="el-form-item" label="登錄賬號 (Email 或手機)" required={true}><RimoElement kind="el-input" modelValue={view.memberForm.account} onModelChange={value => {
                      model.write(["memberForm", "account"], value);
                    }} placeholder="管理員登錄賬號" disabled={view.isEdit} prefixIcon="User"></RimoElement></RimoElement></RimoElement>
<RimoElement kind="el-col" span={12}>{!view.isEdit ? <><RimoElement kind="el-form-item" label="登錄密碼" required={true}><RimoElement kind="el-input" modelValue={view.memberForm.password} onModelChange={value => {
                        model.write(["memberForm", "password"], value);
                      }} type="password" placeholder="設置登錄密碼" showPassword={true} prefixIcon="Lock"></RimoElement></RimoElement></> : <><RimoElement kind="el-form-item" label="登錄密碼"><RimoElement kind="el-button" link={true} type="primary" disabled={true}>{text("如需修改請使用重置密碼功能")}</RimoElement></RimoElement></>}</RimoElement></RimoElement></div></div></RimoElement></>}</RimoElement>
<RimoElement kind="el-dialog" modelValue={view.licenseTypeDialogVisible} onModelChange={value => {
      model.write(["licenseTypeDialogVisible"], value);
    }} title="管理駕照類型" width="420px" destroyOnClose={true} className="corporates-overlay" slots={{
      "footer": _slot => <><RimoElement kind="el-button" onClick={_event => {
          model.write(["licenseTypeDialogVisible"], false);
        }}>{text("關閉")}</RimoElement></>
    }}>{() => <><div className="flex gap-2 mb-4"><RimoElement kind="el-input" modelValue={view.newLicenseType} onModelChange={value => {
            model.write(["newLicenseType"], value);
          }} placeholder="輸入新類型名稱" onKeyUp={event => {
            if (event.key !== 'Enter') return;
            view.addLicenseType?.(event);
          }}></RimoElement>
<RimoElement kind="el-button" type="primary" onClick={event => {
            view.addLicenseType?.(event);
          }}><RimoElement kind="el-icon" className="mr-1"><RimoIcon name="Plus" /></RimoElement>
{text("添加\n                ")}</RimoElement></div>
<div className="border rounded-lg overflow-hidden max-h-64 overflow-y-auto"><RimoElement kind="el-table" data={view.licenseTypes} showHeader={false} size="small"><RimoElement kind="el-table-column" prop="name" slots={{
              "default": ({
                row
              }) => <><div className="flex items-center"><RimoElement kind="el-icon" className="mr-2 text-gray-400"><RimoIcon name="Van" /></RimoElement>
{text("\n                                ")}{rimoText(row.name)}{text("\n                            ")}</div></>
            }}></RimoElement>
<RimoElement kind="el-table-column" width="60" align="right" slots={{
              "default": ({
                row: _row,
                $index
              }) => <><RimoElement kind="el-button" type="danger" link={true} onClick={_event => {
                  view.deleteLicenseType($index);
                }}><RimoElement kind="el-icon"><RimoIcon name="Delete" /></RimoElement></RimoElement></>
            }}></RimoElement></RimoElement></div></>}</RimoElement>
<RimoElement kind="el-dialog" modelValue={view.changePlanDialogVisible} onModelChange={value => {
      model.write(["changePlanDialogVisible"], value);
    }} title="變更會員方案" width="500px" appendToBody={true} destroyOnClose={true} className="corporates-overlay" slots={{
      "footer": _slot => <><RimoElement kind="el-button" onClick={_event => {
          model.write(["changePlanDialogVisible"], false);
        }}>{text("取消")}</RimoElement>
<RimoElement kind="el-button" type="primary" onClick={event => {
          view.confirmChangePlan?.(event);
        }}>{text("確認變更")}</RimoElement></>
    }}>{() => <><RimoElement kind="el-form" model={view.changePlanForm} labelPosition="top"><RimoElement kind="el-form-item" label="目標方案"><RimoElement kind="el-select" modelValue={view.changePlanForm.planId} onModelChange={value => {
              model.write(["changePlanForm", "planId"], value);
            }} className="w-full" placeholder="請選擇方案">{rimoEntries(view.membershipPlans.filter(p => p.id !== view.currentMember?.membership?.planId)).map(([plan], _itemIndex) => <Fragment key={plan.id}><RimoElement kind="el-option" key={plan.id} label={plan.name} value={plan.id}><span className="float-left">{rimoText(plan.name)}</span>
<span className="float-right text-gray-400 text-xs mt-1">{text("Lv.")}{rimoText(plan.tier || 1)}</span></RimoElement></Fragment>)}</RimoElement></RimoElement>
{view.selectedPlan?.type !== 'free' ? <><RimoElement kind="el-form-item" label="繳費週期"><RimoElement kind="el-select" modelValue={view.changePlanForm.pricingCycle} onModelChange={value => {
                model.write(["changePlanForm", "pricingCycle"], value);
              }} className="w-full"><RimoElement kind="el-option" label="月繳 (¥99)" value="monthly"></RimoElement>
<RimoElement kind="el-option" label="季繳 (¥269)" value="quarterly"></RimoElement>
<RimoElement kind="el-option" label="年繳 (¥899)" value="annual"></RimoElement></RimoElement></RimoElement></> : null}
<RimoElement kind="el-form-item" label="生效方式"><RimoElement kind="el-radio-group" modelValue={view.changePlanForm.effectiveType} onModelChange={value => {
              model.write(["changePlanForm", "effectiveType"], value);
            }}><RimoElement kind="el-radio" label="immediate">{text("立即生效 (補差價/退款)")}</RimoElement>
<RimoElement kind="el-radio" label="next_cycle">{text("當前週期結束後生效")}</RimoElement></RimoElement></RimoElement>
{view.changePlanForm.effectiveType === 'immediate' ? <><RimoElement kind="el-alert" title="差價說明: 升級需補繳 ¥100" type="warning" closable={false} showIcon={true} className="mb-4"></RimoElement></> : null}
<RimoElement kind="el-form-item" label="變更原因"><RimoElement kind="el-input" modelValue={view.changePlanForm.reason} onModelChange={value => {
              model.write(["changePlanForm", "reason"], value);
            }} type="textarea" placeholder="請輸入變更原因"></RimoElement></RimoElement></RimoElement></>}</RimoElement>
<RimoElement kind="el-dialog" modelValue={view.renewalDialogVisible} onModelChange={value => {
      model.write(["renewalDialogVisible"], value);
    }} title="手動續約" width="450px" appendToBody={true} destroyOnClose={true} className="corporates-overlay" slots={{
      "footer": _slot => <><RimoElement kind="el-button" onClick={_event => {
          model.write(["renewalDialogVisible"], false);
        }}>{text("取消")}</RimoElement>
<RimoElement kind="el-button" type="primary" onClick={event => {
          view.confirmRenewal?.(event);
        }}>{text("確認續約")}</RimoElement></>
    }}>{() => <><div className="bg-blue-50 p-3 rounded mb-4 text-sm text-blue-800">{text("\n                當前到期日: ")}
<span className="font-bold">{rimoText(view.currentMember?.membership?.expireDate)}</span></div>
<RimoElement kind="el-form" model={view.renewalForm} labelPosition="top"><RimoElement kind="el-form-item" label="續約週期"><RimoElement kind="el-select" modelValue={view.renewalForm.cycle} onModelChange={value => {
              model.write(["renewalForm", "cycle"], value);
            }} className="w-full"><RimoElement kind="el-option" label="續費 1 個月 (¥99)" value="1_month"></RimoElement>
<RimoElement kind="el-option" label="續費 3 個月 (¥269)" value="3_month"></RimoElement>
<RimoElement kind="el-option" label="續費 1 年 (¥899)" value="1_year"></RimoElement></RimoElement></RimoElement>
<div className="text-right text-sm text-gray-500 mb-4">{text("\n                    續約後到期日: ")}
<span className="text-[color:var(--app-color-primary)] font-bold">{text("2026-02-15")}</span></div>
<RimoElement kind="el-form-item" label="支付方式"><RimoElement kind="el-radio-group" modelValue={view.renewalForm.paymentMethod} onModelChange={value => {
              model.write(["renewalForm", "paymentMethod"], value);
            }}><RimoElement kind="el-radio" label="cash">{text("現金支付")}</RimoElement>
<RimoElement kind="el-radio" label="transfer">{text("線下轉賬")}</RimoElement>
<RimoElement kind="el-radio" label="pos">{text("POS機刷卡")}</RimoElement></RimoElement></RimoElement>
<RimoElement kind="el-form-item" label="備註"><RimoElement kind="el-input" modelValue={view.renewalForm.note} onModelChange={value => {
              model.write(["renewalForm", "note"], value);
            }} placeholder="選填"></RimoElement></RimoElement></RimoElement></>}</RimoElement>
<RimoElement kind="el-drawer" modelValue={view.planDrawerVisible} onModelChange={value => {
      model.write(["planDrawerVisible"], value);
    }} title="客戶等級方案" size="500px" destroyOnClose={true} className="corporates-overlay" slots={{
      "header": _slot => <><div className="text-lg font-bold text-gray-800 flex items-center"><RimoElement kind="el-icon" className="mr-2 text-[color:var(--app-color-primary)]"><RimoIcon name="Medal" /></RimoElement>
{text("\n                    客戶等級方案 - ")}{rimoText(view.currentMember?.name)}{text("\n                ")}</div></>
    }}>{() => <>{view.currentMember ? <><div className="space-y-6"><div className="bg-gradient-to-br from-blue-50 to-[color:var(--app-color-primary-light-9)] rounded-xl border border-blue-100 p-5 shadow-sm relative overflow-hidden"><div className="absolute top-0 right-0 p-2 opacity-10"><RimoElement kind="el-icon" size={100}><RimoIcon name="Medal" /></RimoElement></div>
<div className="relative z-10"><div className="flex justify-between items-start mb-4"><div><div className="text-sm text-blue-600 font-bold mb-1">{text("當前方案")}</div>
<h2 className="text-2xl font-bold text-gray-900">{rimoText(view.currentMember.membership?.planName)}{text("\n                                ")}</h2></div>
<RimoElement kind="el-tag" effect="dark" type={view.getMembershipColor(view.currentMember.membership?.planId)}>{text("\n                                Lv.")}{rimoText(view.getPlanTier(view.currentMember.membership?.planId))}{text("\n                            ")}</RimoElement></div>
<div className="bg-white/60 rounded-lg p-3 backdrop-blur-sm space-y-2 text-sm mb-4"><div className="flex justify-between"><span className="text-gray-500">{text("繳費週期")}</span>
<span className="font-medium text-gray-900">{text("月繳 ¥99")}</span></div>
<div className="flex justify-between"><span className="text-gray-500">{text("到期日期")}</span>
<span className="font-medium text-gray-900 font-mono">{rimoText(view.currentMember.membership?.expireDate || '永久')}</span></div>
<div className="flex justify-between items-center"><span className="text-gray-500">{text("自動續費")}</span>
<RimoElement kind="el-switch" modelValue={view.currentMember.membership.autoRenew} onModelChange={value => {
                      model.write(["currentMember", "membership", "autoRenew"], value);
                    }} size="small" activeText="開啓" inactiveText="關閉"></RimoElement></div></div>
<div className="flex gap-2"><RimoElement kind="el-button" type="primary" className="flex-1 shadow-sm" icon="Refresh" onClick={event => {
                    view.openChangePlanDialog?.(event);
                  }}>{text("變更方案")}</RimoElement>
<RimoElement kind="el-button" type="success" className="flex-1 shadow-sm" icon="Money" onClick={event => {
                    view.openRenewalDialog?.(event);
                  }}>{text("手動續約")}</RimoElement></div></div></div>
<div><h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center"><RimoElement kind="el-icon" className="mr-1 text-gray-500"><RimoIcon name="Star" /></RimoElement>
{text(" 當前權益\n                    ")}</h3>
<div className="grid grid-cols-2 gap-2">{rimoEntries(view.getPlanBenefits(view.currentMember.membership?.planId)).map(([benefit], _itemIndex) => <Fragment key={benefit}><div key={benefit} className="bg-gray-50 rounded px-3 py-2 text-xs text-gray-600 flex items-center"><RimoElement kind="el-icon" className="mr-1 text-green-500"><RimoIcon name="Check" /></RimoElement>
{text(" ")}{rimoText(benefit)}{text("\n                        ")}</div></Fragment>)}</div></div>
<div className="border-t border-gray-100 pt-6"><h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center"><RimoElement kind="el-icon" className="mr-1 text-gray-500"><RimoIcon name="Warning" /></RimoElement>
{text(" 危險操作\n                    ")}</h3>
<div className="bg-red-50 rounded-lg p-4 border border-red-100 flex items-center justify-between"><div><div className="text-sm font-bold text-red-800">{text("解約方案")}</div>
<div className="text-xs text-red-500 mt-1">{text("退回到免費普通會員，立即失效")}</div></div>
<RimoElement kind="el-button" type="danger" plain={true} size="small" onClick={event => {
                  view.handleTerminatePlan?.(event);
                }}>{text("解約")}</RimoElement></div></div>
<div className="border-t border-gray-100 pt-6"><h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center"><RimoElement kind="el-icon" className="mr-1 text-gray-500"><RimoIcon name="Clock" /></RimoElement>
{text(" 變更記錄\n                    ")}</h3>
<RimoElement kind="el-timeline">{rimoEntries(view.planHistory).map(([activity, index], _itemIndex) => <Fragment key={index}><RimoElement kind="el-timeline-item" key={index} type={activity.type} timestamp={activity.timestamp} size="small">{text("\n                            ")}{rimoText(activity.content)}{text(" ")}
<span className="text-xs text-gray-400 ml-2">{text("by ")}{rimoText(activity.operator)}</span></RimoElement></Fragment>)}</RimoElement></div></div></> : null}</>}</RimoElement></RimoRoot>;
}