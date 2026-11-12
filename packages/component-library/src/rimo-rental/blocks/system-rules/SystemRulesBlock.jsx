import { Fragment } from 'react';
import { useRimoModel, rimoEntries } from '../../lib/rimo-model.js';
import { RimoRoot, RimoIcon, useRimoEnvironment } from '../../lib/RimoEnvironment.jsx';
import { RimoElement, RimoTable, rimoClass, rimoStyle, rimoText } from '../../lib/RimoElements.jsx';
import './system-rules.css';
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
      record: reactive,
      derived: computed,
      watch: watch
    } = model;
    const activeTab = ref('MEMBER');
    const systemTabPermissions = reactive({
      MEMBER: true,
      FLEET: true,
      CALENDAR: true,
      PUSH: true,
      AI: true
    });
    const systemTabs = [{
      key: 'MEMBER',
      label: '會員策略'
    }, {
      key: 'FLEET',
      label: '運維規則'
    }, {
      key: 'CALENDAR',
      label: '日曆與假日'
    }, {
      key: 'PUSH',
      label: '推送通知'
    }, {
      key: 'AI',
      label: 'AI模型接入'
    }];
    const canViewSystemTab = key => systemTabPermissions[key] !== false;
    const visibleSystemTabs = computed(() => systemTabs.filter(tab => canViewSystemTab(tab.key)));
    const ensureActiveSystemTab = () => {
      if (!canViewSystemTab(activeTab.value)) {
        activeTab.value = visibleSystemTabs.value[0]?.key || '';
      }
    };
    watch(visibleSystemTabs, ensureActiveSystemTab, {
      immediate: true
    });
    const systemConfig = reactive({
      member: {
        accountType: 'MOBILE',
        auditRequired: true,
        welcomeGift: {
          enabled: true,
          trigger: 'AUDIT_PASS',
          amount: 100,
          validity: 365
        },
        referralGift: {
          enabled: true,
          trigger: 'INVITEE_AUDIT_PASS',
          amount: 50,
          validity: 365
        }
      },
      fleet: {
        maintenance: {
          thresholdMileage: 5000,
          thresholdMonths: 6,
          advanceKm: 500,
          advanceDays: 15
        },
        cleaning: {
          thresholdCount: 5,
          advanceCount: 1,
          thresholdDays: 7,
          advanceDays: 1
        }
      },
      calendar: {
        weekly: [{
          id: 1,
          name: '週一',
          isHoliday: false,
          isFullDay: true,
          startTime: ''
        }, {
          id: 2,
          name: '週二',
          isHoliday: false,
          isFullDay: true,
          startTime: ''
        }, {
          id: 3,
          name: '週三',
          isHoliday: false,
          isFullDay: true,
          startTime: ''
        }, {
          id: 4,
          name: '週四',
          isHoliday: false,
          isFullDay: true,
          startTime: ''
        }, {
          id: 5,
          name: '週五',
          isHoliday: false,
          isFullDay: true,
          startTime: ''
        }, {
          id: 6,
          name: '週六',
          isHoliday: true,
          isFullDay: true,
          startTime: ''
        }, {
          id: 0,
          name: '週日',
          isHoliday: true,
          isFullDay: true,
          startTime: ''
        }],
        specialDates: [{
          range: ['2026-05-01', '2026-05-05'],
          type: 'HOLIDAY',
          name: '勞動節'
        }, {
          range: ['2026-05-09', '2026-05-09'],
          type: 'WORKDAY',
          name: '五一補班'
        }]
      },
      push: {
        list: [{
          category: '訂單',
          title: '訂單已確認',
          content: '尊敬的{用戶}，您的訂單{訂單號}已經確認，請準時取車。',
          trigger: '訂單支付成功',
          channels: ['APP', 'SMS'],
          enabled: true
        }, {
          category: '系統',
          title: '審覈通過通知',
          content: '您的賬號已通過審覈，現在可以開始用車了。',
          trigger: '會員審覈通過',
          channels: ['APP', 'SMS'],
          enabled: true
        }, {
          category: '營銷',
          title: '生日祝福',
          content: '祝您生日快樂！一張租車券已放入您的賬戶。',
          trigger: '用戶生日當天',
          channels: ['APP', 'SMS', 'EMAIL'],
          enabled: true
        }]
      },
      aiModel: {
        enabled: true,
        provider: 'OPENAI_COMPATIBLE',
        baseUrl: 'https://api.example.com/v1',
        modelName: 'gpt-xxx',
        apiKeyMasked: 'sk-****8F3A',
        promptSourceText: '租戶專屬版',
        promptConfigVersion: 'prompt-config-20260519.01',
        promptVersion: 'rimo-store-dispatch-agent-v1',
        promptHash: 'sha256:8c21...f09a',
        lastTestStatus: '成功',
        lastTestTime: '2026-05-05 10:30',
        guardrails: [{
          title: '提示詞配置文件',
          desc: '按租戶命中專屬提示詞；未命中時使用全租戶默認提示詞。'
        }, {
          title: '硬約束不可突破',
          desc: '同車行、車組、狀態、時間窗、硬鎖和人工保護仍由系統校驗。'
        }, {
          title: '數據最小化',
          desc: '不提交手機號、證件號、支付資料、API Key 或無關敏感備註。'
        }],
        logs: [{
          time: '2026-05-19 14:32',
          analysisId: 'AI-DISPATCH-20260519-0008',
          operator: '王店長',
          model: 'gpt-xxx',
          promptSourceText: '租戶專屬版',
          promptVersion: 'rimo-store-dispatch-agent-v1',
          promptHash: 'sha256:8c21...f09a',
          filteredCount: 5,
          status: '成功',
          promptText: '你是 RIMO Rental 門市租賃 AI 調度分析 Agent。\\n你的職責是幫助調度員分析車輛排程風險，並在系統合法候選車輛範圍內生成推薦。',
          requestPayload: JSON.stringify({
            analysisContext: {
              tenantId: 'tenant-rimo-tpe',
              windowDays: 7,
              storeScope: ['臺北總店', '桃園機場店']
            },
            orders: [{
              orderNo: 'ORD-202605-0108',
              phone: '[excluded]'
            }],
            candidatesByOrder: {
              'ORD-202605-0108': ['VH-TPE-2841', 'VH-TPE-6630']
            },
            privacyFilter: ['手機號', '證件號', '支付資料', 'API Key', '未脫敏敏感備註']
          }, null, 2),
          responsePayload: JSON.stringify({
            analysisId: 'AI-DISPATCH-20260519-0008',
            parseStatus: 'JSON_SCHEMA_PASSED',
            validationStatus: 'PARTIAL_PASSED'
          }, null, 2)
        }, {
          time: '2026-05-18 09:15',
          analysisId: 'AI-DISPATCH-20260518-0014',
          operator: '陳調度',
          model: 'gpt-xxx',
          promptSourceText: '默認版',
          promptVersion: 'rimo-store-dispatch-agent-v1',
          promptHash: 'sha256:7f18...a921',
          filteredCount: 5,
          status: '成功',
          promptText: '你是 RIMO Rental 門市租賃 AI 調度分析 Agent。\\n必須遵守系統硬約束，不得直接修改訂單、車輛或排程。',
          requestPayload: JSON.stringify({
            analysisContext: {
              tenantId: 'tenant-rimo-tpe',
              windowDays: 3,
              storeScope: ['臺北總店']
            },
            orders: [{
              orderNo: 'ORD-202605-0062',
              phone: '[excluded]'
            }],
            privacyFilter: ['手機號', '證件號', '支付資料', 'API Key', '未脫敏敏感備註']
          }, null, 2),
          responsePayload: JSON.stringify({
            analysisId: 'AI-DISPATCH-20260518-0014',
            parseStatus: 'JSON_SCHEMA_PASSED',
            validationStatus: 'PASSED'
          }, null, 2)
        }]
      }
    });
    const ruleLocks = reactive({
      memberRegister: true,
      memberPoints: true,
      fleetMaintenance: true,
      fleetCleaning: true,
      calendarFixed: true,
      aiModel: true
    });
    const unlockRule = key => {
      ruleLocks[key] = false;
    };
    const cancelRule = key => {
      ruleLocks[key] = true;
      feedback.ElMessage.info('已取消編輯');
    };
    const saveRule = key => {
      console.log(`Saving ${key}:`, systemConfig);
      ruleLocks[key] = true;
      feedback.ElMessage.success('設置已保存');
    };
    const testAIConnection = () => {
      systemConfig.aiModel.lastTestStatus = '成功';
      systemConfig.aiModel.lastTestTime = '2026-05-05 10:30';
      feedback.ElMessage.success('AI 模型連接測試成功');
    };
    const aiLogDialogVisible = ref(false);
    const selectedAiLog = ref(null);
    const openAiLogDetail = row => {
      selectedAiLog.value = row;
      aiLogDialogVisible.value = true;
    };
    const newSpecialDate = reactive({
      range: [],
      type: 'HOLIDAY',
      name: ''
    });
    const specialDateDialogVisible = ref(false);
    const isSpecDateValid = model.derived(() => {
      return newSpecialDate.range && newSpecialDate.range.length === 2 && newSpecialDate.name && newSpecialDate.name.trim() !== '';
    });
    const openSpecialDateDialog = () => {
      newSpecialDate.range = [];
      newSpecialDate.type = 'HOLIDAY';
      newSpecialDate.name = '';
      specialDateDialogVisible.value = true;
    };
    const addSpecialDate = () => {
      if (isSpecDateValid.value) {
        systemConfig.calendar.specialDates.push({
          range: [...newSpecialDate.range],
          type: newSpecialDate.type,
          name: newSpecialDate.name
        });
        specialDateDialogVisible.value = false;
        feedback.ElMessage.success('特殊日期規則已添加');
      }
    };
    const removeSpecialDate = index => {
      systemConfig.calendar.specialDates.splice(index, 1);
    };
    const pushDialogVisible = ref(false);
    const editingPushIndex = ref(-1);
    const pushForm = reactive({
      category: '系統',
      title: '',
      content: '',
      trigger: '',
      channels: [],
      enabled: true
    });
    const openPushDialog = (item, index) => {
      editingPushIndex.value = index !== undefined ? index : -1;
      if (item) {
        Object.assign(pushForm, item);
      } else {
        Object.assign(pushForm, {
          category: '系統',
          title: '',
          content: '',
          trigger: '',
          channels: [],
          enabled: true
        });
      }
      pushDialogVisible.value = true;
    };
    const savePushRule = () => {
      const data = {
        ...pushForm
      };
      if (editingPushIndex.value >= 0) {
        systemConfig.push.list[editingPushIndex.value] = data;
      } else {
        systemConfig.push.list.push(data);
      }
      pushDialogVisible.value = false;
      feedback.ElMessage.success('推送規則已保存');
    };
    const getPushCategoryTag = cat => {
      const map = {
        '系統': 'info',
        '訂單': 'primary',
        '營銷': 'warning'
      };
      return map[cat] || 'info';
    };
    const saveSystemConfig = () => {
      console.log('Saving config:', systemConfig);
      feedback.ElMessage.success('系統規則配置已全部保存');
    };
    return {
      activeTab,
      systemConfig,
      ruleLocks,
      unlockRule,
      cancelRule,
      saveRule,
      newSpecialDate,
      specialDateDialogVisible,
      isSpecDateValid,
      openSpecialDateDialog,
      addSpecialDate,
      removeSpecialDate,
      pushDialogVisible,
      pushForm,
      openPushDialog,
      savePushRule,
      getPushCategoryTag,
      saveSystemConfig,
      testAIConnection,
      aiLogDialogVisible,
      selectedAiLog,
      openAiLogDetail,
      systemTabPermissions,
      visibleSystemTabs,
      canViewSystemTab,
      systemTabs,
      ensureActiveSystemTab,
      editingPushIndex
    };
  }
  return pageSetup();
}
export default function SystemRulesBlock() {
  const model = useRimoModel(createPageState);
  const view = model.view;
  const {
    text
  } = useRimoEnvironment();
  return <RimoRoot model={model} pageKey="system-rules" assets={{}}><div data-business-content="" data-rimo-layout="page"><div className="flex justify-between items-end mb-6" data-rimo-layout="heading"><div><h1 className="text-2xl font-bold text-gray-800 tracking-tight">{text("系統通用參數")}</h1>
<p className="text-gray-500 text-sm mt-1">{text("配置全局系統規則，包括會員策略、運維規則、日曆設定和推送通知")}</p></div></div>
<div className=""><RimoElement kind="el-tabs" modelValue={view.activeTab} onModelChange={value => {
          model.write(["activeTab"], value);
        }} className="rimo-page-tabs w-full bg-white rounded-xl shadow-sm border border-gray-100 min-h-[600px]">{view.canViewSystemTab('MEMBER') ? <><RimoElement kind="el-tab-pane" name="MEMBER" slots={{
              "label": _slot => <><span className="flex items-center gap-2"><RimoElement kind="el-icon"><RimoIcon name="User" /></RimoElement>
<span>{text("會員策略")}</span></span></>
            }}><div className="grid gap-6 p-6" style={rimoStyle("grid-template-columns: 200px minmax(0, 1fr);")} data-rimo-layout="columns"><div className="system-rule-nav rounded-xl border border-gray-100 bg-gray-50 p-3 h-fit"><div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">{text("設置項")}</div>
<a href="#member-register" className="block rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition-colors">{text("註冊與審覈")}</a>
<a href="#member-points" className="block rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition-colors">{text("積分獎勵")}</a></div>
<div className="space-y-6 min-w-0"><div id="member-register" className="system-rule-section"><div className="flex justify-between items-center mb-4" data-rimo-layout="toolbar"><h3 className="text-lg font-bold text-gray-800 flex items-center"><RimoElement kind="el-icon" className="mr-2 text-blue-600"><RimoIcon name="User" /></RimoElement>
{text(" 註冊設置\n                                        ")}</h3>
<div>{view.ruleLocks.memberRegister ? <><RimoElement kind="el-button" type="primary" plain={true} size="small" onClick={_event => {
                            view.unlockRule('memberRegister');
                          }}><RimoElement kind="el-icon" className="mr-1"><RimoIcon name="Lock" /></RimoElement>
{text(" 解鎖編輯\n                                            ")}</RimoElement></> : <><div className="flex gap-2"><RimoElement kind="el-button" size="small" onClick={_event => {
                              view.cancelRule('memberRegister');
                            }}>{text("取消")}</RimoElement>
<RimoElement kind="el-button" type="primary" size="small" onClick={_event => {
                              view.saveRule('memberRegister');
                            }}><RimoElement kind="el-icon" className="mr-1"><RimoIcon name="Check" /></RimoElement>
{text(" 保存\n                                                ")}</RimoElement></div></>}</div></div>
<div className="bg-gray-50 rounded-lg p-5 border border-gray-200"><RimoElement kind="el-form" labelWidth="140px" labelPosition="left" disabled={view.ruleLocks.memberRegister}><RimoElement kind="el-form-item" label="預設賬號類型"><RimoElement kind="el-radio-group" modelValue={view.systemConfig.member.accountType} onModelChange={value => {
                            model.write(["systemConfig", "member", "accountType"], value);
                          }}><RimoElement kind="el-radio" label="MOBILE">{text("手機號")}</RimoElement>
<RimoElement kind="el-radio" label="ID_CARD">{text("身份證號")}</RimoElement></RimoElement>
<div className="text-xs text-gray-400 mt-1">{text("新會員註冊時默認使用的唯一標識")}</div></RimoElement>
<RimoElement kind="el-form-item" label="註冊後審覈"><RimoElement kind="el-switch" modelValue={view.systemConfig.member.auditRequired} onModelChange={value => {
                            model.write(["systemConfig", "member", "auditRequired"], value);
                          }} activeText="開啓" inactiveText="關閉"></RimoElement>
<div className="text-xs text-gray-400 mt-1">{text("開啓後，新會員註冊後需管理員審覈通過方可使用")}</div></RimoElement></RimoElement></div></div>
<div id="member-points" className="system-rule-section"><div className="flex justify-between items-center mb-4" data-rimo-layout="toolbar"><h3 className="text-lg font-bold text-gray-800 flex items-center"><RimoElement kind="el-icon" className="mr-2 text-orange-600"><RimoIcon name="Star" /></RimoElement>
{text(" 積分獎勵策略\n                                        ")}</h3>
<div>{view.ruleLocks.memberPoints ? <><RimoElement kind="el-button" type="primary" plain={true} size="small" onClick={_event => {
                            view.unlockRule('memberPoints');
                          }}><RimoElement kind="el-icon" className="mr-1"><RimoIcon name="Lock" /></RimoElement>
{text(" 解鎖編輯\n                                            ")}</RimoElement></> : <><div className="flex gap-2"><RimoElement kind="el-button" size="small" onClick={_event => {
                              view.cancelRule('memberPoints');
                            }}>{text("取消")}</RimoElement>
<RimoElement kind="el-button" type="primary" size="small" onClick={_event => {
                              view.saveRule('memberPoints');
                            }}><RimoElement kind="el-icon" className="mr-1"><RimoIcon name="Check" /></RimoElement>
{text(" 保存\n                                                ")}</RimoElement></div></>}</div></div>
<div className="bg-orange-50 rounded-lg p-5 border border-orange-200 space-y-6 relative">{view.ruleLocks.memberPoints ? <><div className="absolute inset-0 bg-white/10 z-10 cursor-not-allowed"></div></> : null}
<div className="flex items-start gap-4"><RimoElement kind="el-switch" modelValue={view.systemConfig.member.welcomeGift.enabled} onModelChange={value => {
                          model.write(["systemConfig", "member", "welcomeGift", "enabled"], value);
                        }}></RimoElement>
<div className="flex-1"><div className="font-medium text-gray-800 mb-2">{text("新人禮 (Welcome Gift)")}</div>
{view.systemConfig.member.welcomeGift.enabled ? <><div className="flex flex-wrap gap-4 items-center" data-rimo-layout="field-row"><span className="text-sm text-gray-600">{text("當會員")}</span>
<RimoElement kind="el-select" modelValue={view.systemConfig.member.welcomeGift.trigger} onModelChange={value => {
                                model.write(["systemConfig", "member", "welcomeGift", "trigger"], value);
                              }} size="small" style={rimoStyle("width: 140px")}><RimoElement kind="el-option" label="註冊成功後" value="REGISTER"></RimoElement>
<RimoElement kind="el-option" label="審覈通過後" value="AUDIT_PASS"></RimoElement></RimoElement>
<span className="text-sm text-gray-600">{text("贈送")}</span>
<RimoElement kind="el-input-number" modelValue={view.systemConfig.member.welcomeGift.amount} onModelChange={value => {
                                model.write(["systemConfig", "member", "welcomeGift", "amount"], value);
                              }} min={0} size="small" style={rimoStyle("width: 100px")}></RimoElement>
<span className="text-sm text-gray-600">{text("積分，有效期")}</span>
<RimoElement kind="el-input-number" modelValue={view.systemConfig.member.welcomeGift.validity} onModelChange={value => {
                                model.write(["systemConfig", "member", "welcomeGift", "validity"], value);
                              }} min={1} size="small" style={rimoStyle("width: 80px")}></RimoElement>
<span className="text-sm text-gray-600">{text("天")}</span></div></> : <><div className="text-xs text-gray-400">{text("開啓後可配置新用戶獲贈積分規則")}</div></>}</div></div>
<RimoElement kind="el-divider" className="!my-2"></RimoElement>
<div className="flex items-start gap-4"><RimoElement kind="el-switch" modelValue={view.systemConfig.member.referralGift.enabled} onModelChange={value => {
                          model.write(["systemConfig", "member", "referralGift", "enabled"], value);
                        }}></RimoElement>
<div className="flex-1"><div className="font-medium text-gray-800 mb-2">{text("邀請禮 (Referral Gift)")}</div>
{view.systemConfig.member.referralGift.enabled ? <><div className="flex flex-wrap gap-4 items-center" data-rimo-layout="field-row"><span className="text-sm text-gray-600">{text("當被邀請人")}</span>
<RimoElement kind="el-select" modelValue={view.systemConfig.member.referralGift.trigger} onModelChange={value => {
                                model.write(["systemConfig", "member", "referralGift", "trigger"], value);
                              }} size="small" style={rimoStyle("width: 140px")}><RimoElement kind="el-option" label="註冊成功後" value="INVITEE_REGISTER"></RimoElement>
<RimoElement kind="el-option" label="審覈通過後" value="INVITEE_AUDIT_PASS"></RimoElement></RimoElement>
<span className="text-sm text-gray-600">{text("邀請人獲得")}</span>
<RimoElement kind="el-input-number" modelValue={view.systemConfig.member.referralGift.amount} onModelChange={value => {
                                model.write(["systemConfig", "member", "referralGift", "amount"], value);
                              }} min={0} size="small" style={rimoStyle("width: 100px")}></RimoElement>
<span className="text-sm text-gray-600">{text("積分，有效期")}</span>
<RimoElement kind="el-input-number" modelValue={view.systemConfig.member.referralGift.validity} onModelChange={value => {
                                model.write(["systemConfig", "member", "referralGift", "validity"], value);
                              }} min={1} size="small" style={rimoStyle("width: 80px")}></RimoElement>
<span className="text-sm text-gray-600">{text("天")}</span></div></> : <><div className="text-xs text-gray-400">{text("開啓後可配置邀請返利規則")}</div></>}</div></div></div></div></div></div></RimoElement></> : null}
{view.canViewSystemTab('FLEET') ? <><RimoElement kind="el-tab-pane" name="FLEET" slots={{
              "label": _slot => <><span className="flex items-center gap-2"><RimoElement kind="el-icon"><RimoIcon name="Van" /></RimoElement>
<span>{text("運維規則")}</span></span></>
            }}><div className="grid gap-6 p-6" style={rimoStyle("grid-template-columns: 200px minmax(0, 1fr);")} data-rimo-layout="columns"><div className="system-rule-nav rounded-xl border border-gray-100 bg-gray-50 p-3 h-fit"><div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">{text("設置項")}</div>
<a href="#fleet-maintenance" className="block rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition-colors">{text("保養提醒")}</a>
<a href="#fleet-cleaning" className="block rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition-colors">{text("清潔提醒")}</a></div>
<div className="space-y-6 min-w-0"><div id="fleet-maintenance" className="system-rule-section"><div className="flex justify-between items-center mb-4" data-rimo-layout="toolbar"><h3 className="text-lg font-bold text-gray-800 flex items-center"><RimoElement kind="el-icon" className="mr-2 text-blue-600"><RimoIcon name="Tools" /></RimoElement>
{text(" 保養提醒規則\n                                            ")}</h3>
<div>{view.ruleLocks.fleetMaintenance ? <><RimoElement kind="el-button" type="primary" plain={true} size="small" onClick={_event => {
                            view.unlockRule('fleetMaintenance');
                          }}><RimoElement kind="el-icon" className="mr-1"><RimoIcon name="Lock" /></RimoElement>
{text(" 解鎖編輯\n                                                ")}</RimoElement></> : <><div className="flex gap-2"><RimoElement kind="el-button" size="small" onClick={_event => {
                              view.cancelRule('fleetMaintenance');
                            }}>{text("取消")}</RimoElement>
<RimoElement kind="el-button" type="primary" size="small" onClick={_event => {
                              view.saveRule('fleetMaintenance');
                            }}><RimoElement kind="el-icon" className="mr-1"><RimoIcon name="Check" /></RimoElement>
{text(" 保存\n                                                    ")}</RimoElement></div></>}</div></div>
<div className="bg-blue-50 rounded-lg p-5 border border-blue-200 h-full"><RimoElement kind="el-form" labelPosition="top" disabled={view.ruleLocks.fleetMaintenance}><div className="font-medium text-blue-800 mb-3 border-b border-blue-200 pb-2">{text("\n                                                    觸發條件 (滿足任一)")}</div>
<RimoElement kind="el-row" gutter={16} style={rimoStyle("max-width: 560px")}><RimoElement kind="el-col" span={12}><RimoElement kind="el-form-item" label="行駛里程 (Km)"><RimoElement kind="el-input-number" modelValue={view.systemConfig.fleet.maintenance.thresholdMileage} onModelChange={value => {
                                model.write(["systemConfig", "fleet", "maintenance", "thresholdMileage"], value);
                              }} min={0} step={1000} style={rimoStyle("width: 160px")}></RimoElement></RimoElement></RimoElement>
<RimoElement kind="el-col" span={12}><RimoElement kind="el-form-item" label="時間間隔 (月)"><RimoElement kind="el-input-number" modelValue={view.systemConfig.fleet.maintenance.thresholdMonths} onModelChange={value => {
                                model.write(["systemConfig", "fleet", "maintenance", "thresholdMonths"], value);
                              }} min={1} style={rimoStyle("width: 160px")}></RimoElement></RimoElement></RimoElement></RimoElement>
<div className="font-medium text-blue-800 mb-3 border-b border-blue-200 pb-2 mt-4">{text("\n                                                    提前預警")}</div>
<RimoElement kind="el-row" gutter={16} style={rimoStyle("max-width: 560px")}><RimoElement kind="el-col" span={12}><RimoElement kind="el-form-item" label="提前里程 (Km)"><RimoElement kind="el-input-number" modelValue={view.systemConfig.fleet.maintenance.advanceKm} onModelChange={value => {
                                model.write(["systemConfig", "fleet", "maintenance", "advanceKm"], value);
                              }} min={0} step={100} style={rimoStyle("width: 160px")}></RimoElement></RimoElement></RimoElement>
<RimoElement kind="el-col" span={12}><RimoElement kind="el-form-item" label="提前天數"><RimoElement kind="el-input-number" modelValue={view.systemConfig.fleet.maintenance.advanceDays} onModelChange={value => {
                                model.write(["systemConfig", "fleet", "maintenance", "advanceDays"], value);
                              }} min={1} style={rimoStyle("width: 160px")}></RimoElement></RimoElement></RimoElement></RimoElement></RimoElement></div></div>
<div id="fleet-cleaning" className="system-rule-section"><div className="flex justify-between items-center mb-4" data-rimo-layout="toolbar"><h3 className="text-lg font-bold text-gray-800 flex items-center"><RimoElement kind="el-icon" className="mr-2 text-cyan-600"><RimoIcon name="Brush" /></RimoElement>
{text(" 清潔提醒規則\n                                            ")}</h3>
<div>{view.ruleLocks.fleetCleaning ? <><RimoElement kind="el-button" type="primary" plain={true} size="small" onClick={_event => {
                            view.unlockRule('fleetCleaning');
                          }}><RimoElement kind="el-icon" className="mr-1"><RimoIcon name="Lock" /></RimoElement>
{text(" 解鎖編輯\n                                                ")}</RimoElement></> : <><div className="flex gap-2"><RimoElement kind="el-button" size="small" onClick={_event => {
                              view.cancelRule('fleetCleaning');
                            }}>{text("取消")}</RimoElement>
<RimoElement kind="el-button" type="primary" size="small" onClick={_event => {
                              view.saveRule('fleetCleaning');
                            }}><RimoElement kind="el-icon" className="mr-1"><RimoIcon name="Check" /></RimoElement>
{text(" 保存\n                                                    ")}</RimoElement></div></>}</div></div>
<div className="bg-cyan-50 rounded-lg p-5 border border-cyan-200 h-full"><RimoElement kind="el-form" labelPosition="top" disabled={view.ruleLocks.fleetCleaning}><div className="font-medium text-cyan-800 mb-3 border-b border-cyan-200 pb-2">{text("\n                                                    觸發條件 (滿足任一)")}</div>
<RimoElement kind="el-row" gutter={16} style={rimoStyle("max-width: 560px")}><RimoElement kind="el-col" span={12}><RimoElement kind="el-form-item" label="租用次數"><RimoElement kind="el-input-number" modelValue={view.systemConfig.fleet.cleaning.thresholdCount} onModelChange={value => {
                                model.write(["systemConfig", "fleet", "cleaning", "thresholdCount"], value);
                              }} min={1} style={rimoStyle("width: 160px")}></RimoElement></RimoElement></RimoElement>
<RimoElement kind="el-col" span={12}><RimoElement kind="el-form-item" label="時間間隔 (天)"><RimoElement kind="el-input-number" modelValue={view.systemConfig.fleet.cleaning.thresholdDays} onModelChange={value => {
                                model.write(["systemConfig", "fleet", "cleaning", "thresholdDays"], value);
                              }} min={1} style={rimoStyle("width: 160px")}></RimoElement></RimoElement></RimoElement></RimoElement>
<div className="font-medium text-cyan-800 mb-3 border-b border-cyan-200 pb-2 mt-4">{text("\n                                                    提前預警")}</div>
<RimoElement kind="el-row" gutter={16} style={rimoStyle("max-width: 560px")}><RimoElement kind="el-col" span={12}><RimoElement kind="el-form-item" label="提前剩餘次數"><RimoElement kind="el-input-number" modelValue={view.systemConfig.fleet.cleaning.advanceCount} onModelChange={value => {
                                model.write(["systemConfig", "fleet", "cleaning", "advanceCount"], value);
                              }} min={0} style={rimoStyle("width: 160px")}></RimoElement></RimoElement></RimoElement>
<RimoElement kind="el-col" span={12}><RimoElement kind="el-form-item" label="提前天數"><RimoElement kind="el-input-number" modelValue={view.systemConfig.fleet.cleaning.advanceDays} onModelChange={value => {
                                model.write(["systemConfig", "fleet", "cleaning", "advanceDays"], value);
                              }} min={1} style={rimoStyle("width: 160px")}></RimoElement></RimoElement></RimoElement></RimoElement></RimoElement></div></div></div></div></RimoElement></> : null}
{view.canViewSystemTab('CALENDAR') ? <><RimoElement kind="el-tab-pane" name="CALENDAR" slots={{
              "label": _slot => <><span className="flex items-center gap-2"><RimoElement kind="el-icon"><RimoIcon name="Calendar" /></RimoElement>
<span>{text("日曆與假日")}</span></span></>
            }}><div className="grid gap-6 p-6" style={rimoStyle("grid-template-columns: 200px minmax(0, 1fr);")} data-rimo-layout="columns"><div className="system-rule-nav rounded-xl border border-gray-100 bg-gray-50 p-3 h-fit"><div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">{text("設置項")}</div>
<a href="#calendar-weekly" className="block rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition-colors">{text("固定假日")}</a>
<a href="#calendar-special" className="block rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition-colors">{text("特殊日期")}</a></div>
<div className="space-y-6 min-w-0"><div id="calendar-weekly" className="system-rule-section"><div className="flex justify-between items-center mb-4" data-rimo-layout="toolbar"><h3 className="text-lg font-bold text-gray-800 flex items-center"><RimoElement kind="el-icon" className="mr-2 text-[color:var(--app-color-primary)]"><RimoIcon name="Calendar" /></RimoElement>
{text(" 固定假日設定\n                                        ")}</h3>
<div>{view.ruleLocks.calendarFixed ? <><RimoElement kind="el-button" type="primary" plain={true} size="small" onClick={_event => {
                            view.unlockRule('calendarFixed');
                          }}><RimoElement kind="el-icon" className="mr-1"><RimoIcon name="Lock" /></RimoElement>
{text(" 解鎖編輯\n                                            ")}</RimoElement></> : <><div className="flex gap-2"><RimoElement kind="el-button" size="small" onClick={_event => {
                              view.cancelRule('calendarFixed');
                            }}>{text("取消")}</RimoElement>
<RimoElement kind="el-button" type="primary" size="small" onClick={_event => {
                              view.saveRule('calendarFixed');
                            }}><RimoElement kind="el-icon" className="mr-1"><RimoIcon name="Check" /></RimoElement>
{text(" 保存\n                                                ")}</RimoElement></div></>}</div></div>
<div className="bg-white rounded-lg border border-gray-200 overflow-hidden relative">{view.ruleLocks.calendarFixed ? <><div className="absolute inset-0 bg-white/10 z-10 cursor-not-allowed"></div></> : null}
<RimoTable className="w-full text-sm text-left"><thead className="bg-gray-50 text-gray-600 border-b"><tr><th className="px-4 py-3 w-24">{text("星期")}</th>
<th className="px-4 py-3 w-32">{text("是否假日")}</th>
<th className="px-4 py-3">{text("具體規則 (默認全天，可指定時段)")}</th></tr></thead>
<tbody className="divide-y divide-gray-100">{rimoEntries(view.systemConfig.calendar.weekly).map(([day], _itemIndex) => <Fragment key={day.id}><tr key={day.id} className="hover:bg-gray-50"><td className="px-4 py-3 font-medium">{rimoText(day.name)}</td>
<td className="px-4 py-3"><RimoElement kind="el-checkbox" modelValue={day.isHoliday} onModelChange={value => {
                                  model.assign(day, "isHoliday", value);
                                }}>{text("是假日")}</RimoElement></td>
<td className="px-4 py-3">{day.isHoliday ? <><div className="flex items-center gap-2"><RimoElement kind="el-switch" modelValue={day.isFullDay} onModelChange={value => {
                                      model.assign(day, "isFullDay", value);
                                    }} activeText="全天" inactiveText="非整天" size="small"></RimoElement>
{!day.isFullDay ? <><div className="flex items-center gap-2 ml-4"><span className="text-gray-500">{text("從")}</span>
<RimoElement kind="el-time-select" modelValue={day.startTime} onModelChange={value => {
                                          model.assign(day, "startTime", value);
                                        }} start="00:00" step="00:30" end="23:30" placeholder="開始時間" size="small" style={rimoStyle("width: 120px")}></RimoElement>
<span className="text-gray-500">{text("以後算作假日")}</span></div></> : null}</div></> : <><span className="text-gray-400 text-xs">{text("平日 (工作日)")}</span></>}</td></tr></Fragment>)}</tbody></RimoTable></div></div>
<div id="calendar-special" className="system-rule-section"><div className="flex justify-between items-center mb-4" data-rimo-layout="toolbar"><h3 className="text-lg font-bold text-gray-800 flex items-center"><RimoElement kind="el-icon" className="mr-2 text-[color:var(--app-color-primary)]"><RimoIcon name="Timer" /></RimoElement>
{text(" 特殊日期 (調休/節假日)\n                                        ")}</h3>
<RimoElement kind="el-button" type="primary" size="small" plain={true} icon="Plus" onClick={event => {
                        view.openSpecialDateDialog?.(event);
                      }}>{text("新增特殊規則")}</RimoElement></div>
<div className="bg-[color:var(--app-color-primary-light-9)] rounded-lg p-5 border border-[color:var(--app-color-primary-light-7)]"><div className="space-y-2">{rimoEntries(view.systemConfig.calendar.specialDates).map(([item, index], _itemIndex) => <Fragment key={index}><div key={index} className="flex items-center justify-between bg-white p-3 rounded border border-[color:var(--app-color-primary-light-8)] shadow-sm" data-rimo-layout="toolbar"><div className="flex items-center gap-3"><RimoElement kind="el-tag" type={item.type === 'HOLIDAY' ? 'danger' : 'success'} size="small">{text("\n                                                        ")}{rimoText(item.type === 'HOLIDAY' ? '假日' : '平日')}{text("\n                                                    ")}</RimoElement>
<span className="font-mono text-gray-700 font-medium">{rimoText(item.range[0])}{text(" ~ ")}{rimoText(item.range[1])}</span>
<span className="text-gray-500 text-sm ml-2">{text("(")}{rimoText(item.name)}{text(")")}</span></div>
<RimoElement kind="el-button" link={true} type="danger" icon="Delete" onClick={_event => {
                              view.removeSpecialDate(index);
                            }}></RimoElement></div></Fragment>)}
{view.systemConfig.calendar.specialDates.length === 0 ? <><div className="text-center text-gray-400 py-4 text-sm">{text("暫無特殊日期規則")}</div></> : null}</div></div></div></div></div></RimoElement></> : null}
{view.canViewSystemTab('PUSH') ? <><RimoElement kind="el-tab-pane" name="PUSH" slots={{
              "label": _slot => <><span className="flex items-center gap-2"><RimoElement kind="el-icon"><RimoIcon name="Bell" /></RimoElement>
<span>{text("推送通知")}</span></span></>
            }}><div className="p-6 space-y-4"><div className="flex justify-between items-center bg-gray-50 p-4 rounded-xl border border-gray-100"><div><div className="text-sm font-semibold text-gray-800">{text("推送規則列表")}</div>
<div className="text-xs text-gray-500 mt-1">{text("管理系統自動推送給用戶的消息內容、觸發時機和推送渠道")}</div></div></div>
<div className="rounded-xl border border-gray-100 overflow-hidden"><RimoElement kind="el-table" data={view.systemConfig.push.list} style={rimoStyle("width: 100%")} stripe={true}><RimoElement kind="el-table-column" prop="category" label="分類" width="100" slots={{
                      "default": ({
                        row
                      }) => <><RimoElement kind="el-tag" type={view.getPushCategoryTag(row.category)}>{rimoText(row.category)}</RimoElement></>
                    }}></RimoElement>
<RimoElement kind="el-table-column" prop="title" label="標題" width="200"></RimoElement>
<RimoElement kind="el-table-column" prop="content" label="內容模板" minWidth="300" slots={{
                      "default": ({
                        row
                      }) => <><div className="line-clamp-2 text-sm text-gray-600">{rimoText(row.content)}</div></>
                    }}></RimoElement>
<RimoElement kind="el-table-column" prop="trigger" label="觸發時機" width="150"></RimoElement>
<RimoElement kind="el-table-column" label="推送渠道" width="180" slots={{
                      "default": ({
                        row
                      }) => <><div className="flex gap-1">{row.channels.includes('APP') ? <><RimoElement kind="el-tag" size="small" type="info">{text("APP")}</RimoElement></> : null}
{row.channels.includes('SMS') ? <><RimoElement kind="el-tag" size="small" type="success">{text("短信")}</RimoElement></> : null}
{row.channels.includes('EMAIL') ? <><RimoElement kind="el-tag" size="small" type="warning">{text("郵件")}</RimoElement></> : null}</div></>
                    }}></RimoElement>
<RimoElement kind="el-table-column" label="狀態" width="100" slots={{
                      "default": ({
                        row
                      }) => <><RimoElement kind="el-switch" modelValue={row.enabled} onModelChange={value => {
                          model.assign(row, "enabled", value);
                        }} size="small"></RimoElement></>
                    }}></RimoElement>
<RimoElement kind="el-table-column" label="操作" width="100" fixed="right" slots={{
                      "default": ({
                        row,
                        $index
                      }) => <><RimoElement kind="el-button" link={true} type="primary" size="small" onClick={_event => {
                          view.openPushDialog(row, $index);
                        }}>{text("編輯")}</RimoElement></>
                    }}></RimoElement></RimoElement></div></div></RimoElement></> : null}
{view.canViewSystemTab('AI') ? <><RimoElement kind="el-tab-pane" name="AI" slots={{
              "label": _slot => <><span className="flex items-center gap-2"><RimoElement kind="el-icon"><RimoIcon name="Connection" /></RimoElement>
<span>{text("AI模型接入")}</span></span></>
            }}><div className="grid gap-6 p-6" style={rimoStyle("grid-template-columns: 200px minmax(0, 1fr);")} data-rimo-layout="columns"><div className="system-rule-nav rounded-xl border border-gray-100 bg-gray-50 p-3 h-fit"><div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">{text("設置項")}</div>
<a href="#ai-dispatch" className="block rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition-colors">{text("調度分析模型")}</a>
<a href="#ai-security" className="block rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition-colors">{text("安全與提示詞")}</a>
<a href="#ai-logs" className="block rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition-colors">{text("調用日誌")}</a></div>
<div className="space-y-6 min-w-0"><div id="ai-dispatch" className="system-rule-section"><div className="flex justify-between items-center mb-4" data-rimo-layout="toolbar"><h3 className="text-lg font-bold text-gray-800 flex items-center"><RimoElement kind="el-icon" className="mr-2 text-[color:var(--app-color-primary)]"><RimoIcon name="Connection" /></RimoElement>
{text(" AI調度分析模型\n                                            ")}</h3>
<div>{view.ruleLocks.aiModel ? <><RimoElement kind="el-button" type="primary" plain={true} size="small" onClick={_event => {
                            view.unlockRule('aiModel');
                          }}><RimoElement kind="el-icon" className="mr-1"><RimoIcon name="Lock" /></RimoElement>
{text(" 解鎖編輯\n                                                ")}</RimoElement></> : <><div className="flex gap-2"><RimoElement kind="el-button" size="small" onClick={_event => {
                              view.cancelRule('aiModel');
                            }}>{text("取消")}</RimoElement>
<RimoElement kind="el-button" type="primary" size="small" onClick={_event => {
                              view.saveRule('aiModel');
                            }}><RimoElement kind="el-icon" className="mr-1"><RimoIcon name="Check" /></RimoElement>
{text(" 保存\n                                                    ")}</RimoElement></div></>}</div></div>
<div className="bg-[color:var(--app-color-primary-light-9)] rounded-lg p-5 border border-[color:var(--app-color-primary-light-7)]"><RimoElement kind="el-form" labelWidth="140px" labelPosition="left" disabled={view.ruleLocks.aiModel}><RimoElement kind="el-form-item" label="啓用狀態"><RimoElement kind="el-switch" modelValue={view.systemConfig.aiModel.enabled} onModelChange={value => {
                            model.write(["systemConfig", "aiModel", "enabled"], value);
                          }} activeText="啓用" inactiveText="停用"></RimoElement>
<div className="text-xs text-gray-400 mt-1">{text("啓用後，車輛排程看板可發起 AI 調度分析。")}</div></RimoElement>
<RimoElement kind="el-form-item" label="模型提供商"><RimoElement kind="el-select" modelValue={view.systemConfig.aiModel.provider} onModelChange={value => {
                            model.write(["systemConfig", "aiModel", "provider"], value);
                          }} style={rimoStyle("width: 240px")}><RimoElement kind="el-option" label="OpenAI" value="OPENAI"></RimoElement>
<RimoElement kind="el-option" label="Gemini" value="GEMINI"></RimoElement>
<RimoElement kind="el-option" label="OpenAI Compatible" value="OPENAI_COMPATIBLE"></RimoElement></RimoElement></RimoElement>
{view.systemConfig.aiModel.provider === 'OPENAI_COMPATIBLE' ? <><RimoElement kind="el-form-item" label="Base URL"><RimoElement kind="el-input" modelValue={view.systemConfig.aiModel.baseUrl} onModelChange={value => {
                              model.write(["systemConfig", "aiModel", "baseUrl"], value);
                            }} placeholder="https://api.example.com/v1" style={rimoStyle("max-width: 420px")}></RimoElement>
<div className="text-xs text-gray-400 mt-1">{text("兼容 OpenAI 協議的模型服務必填。")}</div></RimoElement></> : null}
<RimoElement kind="el-form-item" label="模型名稱"><RimoElement kind="el-input" modelValue={view.systemConfig.aiModel.modelName} onModelChange={value => {
                            model.write(["systemConfig", "aiModel", "modelName"], value);
                          }} placeholder="例如 gpt-xxx / gemini-xxx" style={rimoStyle("max-width: 320px")}></RimoElement></RimoElement>
<RimoElement kind="el-form-item" label="API Key"><RimoElement kind="el-input" modelValue={view.systemConfig.aiModel.apiKeyMasked} onModelChange={value => {
                            model.write(["systemConfig", "aiModel", "apiKeyMasked"], value);
                          }} placeholder="保存後僅顯示掩碼" showPassword={true} style={rimoStyle("max-width: 420px")}></RimoElement>
<div className="text-xs text-gray-400 mt-1">{text("API Key 服務端加密保存，前端不讀取明文。")}</div></RimoElement>
<RimoElement kind="el-form-item" label="用途範圍"><RimoElement kind="el-tag" type="info" effect="plain">{text("門市租賃 AI 調度分析")}</RimoElement></RimoElement>
<RimoElement kind="el-form-item" label="提示詞來源"><div className="flex items-center gap-3"><RimoElement kind="el-tag" type="warning" effect="plain">{rimoText(view.systemConfig.aiModel.promptSourceText)}</RimoElement>
<span className="text-xs text-gray-500">{rimoText(view.systemConfig.aiModel.promptConfigVersion)}</span></div>
<div className="text-xs text-gray-400 mt-1">{text("優先使用租戶專屬提示詞；未配置時使用全租戶默認提示詞。")}</div></RimoElement>
<RimoElement kind="el-form-item" label="連接測試"><div className="flex items-center gap-3"><RimoElement kind="el-button" type="primary" plain={true} size="small" onClick={event => {
                              view.testAIConnection?.(event);
                            }}>{text("測試連接")}</RimoElement>
<RimoElement kind="el-tag" type={view.systemConfig.aiModel.lastTestStatus === '成功' ? 'success' : 'warning'} effect="plain">{rimoText(view.systemConfig.aiModel.lastTestStatus)}</RimoElement>
<span className="text-xs text-gray-500">{rimoText(view.systemConfig.aiModel.lastTestTime)}</span></div></RimoElement></RimoElement></div></div>
<div id="ai-security" className="system-rule-section"><h3 className="text-lg font-bold text-gray-800 flex items-center mb-4"><RimoElement kind="el-icon" className="mr-2 text-slate-600"><RimoIcon name="DocumentChecked" /></RimoElement>
{text(" 安全與提示詞\n                                        ")}</h3>
<div className="bg-slate-50 rounded-lg p-5 border border-slate-200"><div className="grid grid-cols-3 gap-4" data-rimo-grid="3">{rimoEntries(view.systemConfig.aiModel.guardrails).map(([item], _itemIndex) => <Fragment key={item.title}><div key={item.title} className="bg-white rounded-lg border border-slate-200 p-4"><div className="text-sm font-semibold text-gray-800">{rimoText(item.title)}</div>
<div className="text-xs text-gray-500 mt-2 leading-5">{rimoText(item.desc)}</div></div></Fragment>)}</div>
<div className="mt-4 rounded-lg border border-[color:var(--app-color-primary-light-8)] bg-white p-4"><div className="text-xs text-gray-400 uppercase tracking-wider">{text("當前提示詞版本")}</div>
<div className="text-sm font-semibold text-gray-800 mt-2">{rimoText(view.systemConfig.aiModel.promptVersion)}</div>
<div className="text-xs text-gray-500 mt-2">{text("提示詞由獨立配置文件維護，可使用全租戶默認版或租戶專屬版；營運平臺不開放租戶直接編輯提示詞正文。")}</div></div></div></div>
<div id="ai-logs" className="system-rule-section"><div className="flex justify-between items-center mb-4"><h3 className="text-lg font-bold text-gray-800 flex items-center"><RimoElement kind="el-icon" className="mr-2 text-[color:var(--app-color-primary)]"><RimoIcon name="Tickets" /></RimoElement>
{text(" AI調用日誌\n                                            ")}</h3>
<RimoElement kind="el-tag" type="info" effect="plain">{text("保留實際請求內容")}</RimoElement></div>
<div className="bg-white rounded-lg p-5 border border-slate-200"><div className="text-xs text-gray-500 mb-4">{text("用於查看歷史 AI 調度分析實際提交給模型的提示詞、請求數據包、模型返回和系統校驗結果。")}</div>
<RimoElement kind="el-table" data={view.systemConfig.aiModel.logs} border={true} stripe={true}><RimoElement kind="el-table-column" prop="time" label="發起時間" width="160"></RimoElement>
<RimoElement kind="el-table-column" prop="analysisId" label="任務ID" width="190"></RimoElement>
<RimoElement kind="el-table-column" prop="operator" label="發起人" width="120"></RimoElement>
<RimoElement kind="el-table-column" prop="model" label="模型" width="150"></RimoElement>
<RimoElement kind="el-table-column" label="提示詞" minWidth="220" slots={{
                          "default": ({
                            row
                          }) => <><div className="text-sm font-medium text-gray-800">{rimoText(row.promptVersion)}</div>
<div className="text-xs text-gray-500">{rimoText(row.promptSourceText)}{text(" · ")}{rimoText(row.promptHash)}</div></>
                        }}></RimoElement>
<RimoElement kind="el-table-column" label="隱私過濾" width="110" slots={{
                          "default": ({
                            row
                          }) => <><RimoElement kind="el-tag" size="small" type="success" effect="plain">{rimoText(row.filteredCount)}{text(" 類")}</RimoElement></>
                        }}></RimoElement>
<RimoElement kind="el-table-column" prop="status" label="狀態" width="110" slots={{
                          "default": ({
                            row
                          }) => <><RimoElement kind="el-tag" size="small" type={row.status === '成功' ? 'success' : 'warning'} effect="plain">{rimoText(row.status)}</RimoElement></>
                        }}></RimoElement>
<RimoElement kind="el-table-column" label="操作" width="120" fixed="right" slots={{
                          "default": ({
                            row
                          }) => <><RimoElement kind="el-button" link={true} type="primary" size="small" onClick={_event => {
                              view.openAiLogDetail(row);
                            }}>{text("查看日誌")}</RimoElement></>
                        }}></RimoElement></RimoElement></div></div></div></div></RimoElement></> : null}</RimoElement></div></div><RimoElement kind="el-dialog" modelValue={view.specialDateDialogVisible} onModelChange={value => {
      model.write(["specialDateDialogVisible"], value);
    }} title="新增特殊日期規則" width="500px" destroyOnClose={true} className="system-rules-overlay" slots={{
      "footer": _slot => <><RimoElement kind="el-button" onClick={_event => {
          model.write(["specialDateDialogVisible"], false);
        }}>{text("取消")}</RimoElement>
<RimoElement kind="el-button" type="primary" disabled={!view.isSpecDateValid} onClick={event => {
          view.addSpecialDate?.(event);
        }}>{text("保存規則")}</RimoElement></>
    }}>{() => <><RimoElement kind="el-form" labelPosition="top"><RimoElement kind="el-form-item" label="規則類型"><div className="grid grid-cols-2 gap-4 w-full" data-rimo-grid="2" data-rimo-layout="summary"><div onClick={_event => {
                model.write(["newSpecialDate", "type"], 'HOLIDAY');
              }} className={rimoClass(["cursor-pointer border-2 rounded-lg p-4 text-center transition-all", rimoClass(view.newSpecialDate.type === 'HOLIDAY' ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-red-200')])} data-rimo-layout="stat"><div className={rimoClass(["font-bold", rimoClass(view.newSpecialDate.type === 'HOLIDAY' ? 'text-red-600' : 'text-gray-600')])}>{text("\n                                    設爲假日\n                                ")}</div>
<div className="text-xs text-gray-400 mt-1">{text("工作日放假/調休")}</div></div>
<div onClick={_event => {
                model.write(["newSpecialDate", "type"], 'WORKDAY');
              }} className={rimoClass(["cursor-pointer border-2 rounded-lg p-4 text-center transition-all", rimoClass(view.newSpecialDate.type === 'WORKDAY' ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-green-200')])} data-rimo-layout="stat"><div className={rimoClass(["font-bold", rimoClass(view.newSpecialDate.type === 'WORKDAY' ? 'text-green-600' : 'text-gray-600')])}>{text("\n                                    設爲平日\n                                ")}</div>
<div className="text-xs text-gray-400 mt-1">{text("週末補班")}</div></div></div></RimoElement>
<RimoElement kind="el-form-item" label="日期範圍"><RimoElement kind="el-date-picker" modelValue={view.newSpecialDate.range} onModelChange={value => {
              model.write(["newSpecialDate", "range"], value);
            }} type="daterange" rangeSeparator="至" startPlaceholder="開始日期" endPlaceholder="結束日期" size="large" valueFormat="YYYY-MM-DD" style={rimoStyle("width: 100%")}></RimoElement></RimoElement>
<RimoElement kind="el-form-item" label="備註說明"><RimoElement kind="el-input" modelValue={view.newSpecialDate.name} onModelChange={value => {
              model.write(["newSpecialDate", "name"], value);
            }} placeholder="例如：五一勞動節調休" size="large"></RimoElement></RimoElement></RimoElement></>}</RimoElement>
<RimoElement kind="el-dialog" modelValue={view.pushDialogVisible} onModelChange={value => {
      model.write(["pushDialogVisible"], value);
    }} title="編輯推送規則" width="600px" destroyOnClose={true} className="system-rules-overlay" slots={{
      "footer": _slot => <><RimoElement kind="el-button" onClick={_event => {
          model.write(["pushDialogVisible"], false);
        }}>{text("取消")}</RimoElement>
<RimoElement kind="el-button" type="primary" onClick={event => {
          view.savePushRule?.(event);
        }}>{text("保存")}</RimoElement></>
    }}>{() => <><RimoElement kind="el-form" model={view.pushForm} labelWidth="100px"><RimoElement kind="el-form-item" label="消息分類"><RimoElement kind="el-select" modelValue={view.pushForm.category} onModelChange={value => {
              model.write(["pushForm", "category"], value);
            }} style={rimoStyle("width: 100%")}><RimoElement kind="el-option" label="系統通知" value="系統"></RimoElement>
<RimoElement kind="el-option" label="訂單相關" value="訂單"></RimoElement>
<RimoElement kind="el-option" label="營銷推廣" value="營銷"></RimoElement></RimoElement></RimoElement>
<RimoElement kind="el-form-item" label="消息標題"><RimoElement kind="el-input" modelValue={view.pushForm.title} onModelChange={value => {
              model.write(["pushForm", "title"], value);
            }}></RimoElement></RimoElement>
<RimoElement kind="el-form-item" label="觸發時機"><RimoElement kind="el-input" modelValue={view.pushForm.trigger} onModelChange={value => {
              model.write(["pushForm", "trigger"], value);
            }} placeholder="例如：訂單創建後、審覈通過時"></RimoElement></RimoElement>
<RimoElement kind="el-form-item" label="內容模板"><RimoElement kind="el-input" modelValue={view.pushForm.content} onModelChange={value => {
              model.write(["pushForm", "content"], value);
            }} type="textarea" rows={4} placeholder="可用變量: {用戶}, {訂單號}"></RimoElement></RimoElement>
<RimoElement kind="el-form-item" label="推送渠道"><RimoElement kind="el-checkbox-group" modelValue={view.pushForm.channels} onModelChange={value => {
              model.write(["pushForm", "channels"], value);
            }}><RimoElement kind="el-checkbox" label="APP">{text("APP推送")}</RimoElement>
<RimoElement kind="el-checkbox" label="SMS">{text("短信")}</RimoElement>
<RimoElement kind="el-checkbox" label="EMAIL">{text("郵件")}</RimoElement></RimoElement></RimoElement>
<RimoElement kind="el-form-item" label="狀態"><RimoElement kind="el-switch" modelValue={view.pushForm.enabled} onModelChange={value => {
              model.write(["pushForm", "enabled"], value);
            }} activeText="啓用" inactiveText="停用"></RimoElement></RimoElement></RimoElement></>}</RimoElement>
<RimoElement kind="el-dialog" modelValue={view.aiLogDialogVisible} onModelChange={value => {
      model.write(["aiLogDialogVisible"], value);
    }} title="AI調用請求日誌" width="960px" destroyOnClose={true} className="system-rules-overlay" slots={{
      "footer": _slot => <><RimoElement kind="el-button" onClick={_event => {
          model.write(["aiLogDialogVisible"], false);
        }}>{text("關閉")}</RimoElement>
<RimoElement kind="el-button" type="primary" plain={true}>{text("導出 JSON")}</RimoElement></>
    }}>{() => <>{view.selectedAiLog ? <><div className="space-y-4"><div className="grid grid-cols-4 gap-3" data-rimo-grid="4"><div className="rounded-lg border border-slate-200 bg-slate-50 p-3"><div className="text-xs text-gray-400">{text("任務ID")}</div>
<div className="text-sm font-semibold text-gray-800 mt-1">{rimoText(view.selectedAiLog.analysisId)}</div></div>
<div className="rounded-lg border border-slate-200 bg-slate-50 p-3"><div className="text-xs text-gray-400">{text("模型")}</div>
<div className="text-sm font-semibold text-gray-800 mt-1">{rimoText(view.selectedAiLog.model)}</div></div>
<div className="rounded-lg border border-slate-200 bg-slate-50 p-3"><div className="text-xs text-gray-400">{text("提示詞來源")}</div>
<div className="text-sm font-semibold text-gray-800 mt-1">{rimoText(view.selectedAiLog.promptSourceText)}</div></div>
<div className="rounded-lg border border-slate-200 bg-slate-50 p-3"><div className="text-xs text-gray-400">{text("隱私過濾")}</div>
<div className="text-sm font-semibold text-gray-800 mt-1">{rimoText(view.selectedAiLog.filteredCount)}{text(" 類資料")}</div></div></div>
<RimoElement kind="el-tabs"><RimoElement kind="el-tab-pane" label="完整提示詞"><pre className="h-[260px] overflow-auto rounded-lg bg-slate-900 p-4 text-xs leading-5 text-slate-100 whitespace-pre-wrap">{rimoText(view.selectedAiLog.promptText)}</pre></RimoElement>
<RimoElement kind="el-tab-pane" label="請求數據包"><pre className="h-[260px] overflow-auto rounded-lg bg-slate-900 p-4 text-xs leading-5 text-slate-100 whitespace-pre-wrap">{rimoText(view.selectedAiLog.requestPayload)}</pre></RimoElement>
<RimoElement kind="el-tab-pane" label="模型返回"><pre className="h-[260px] overflow-auto rounded-lg bg-slate-900 p-4 text-xs leading-5 text-slate-100 whitespace-pre-wrap">{rimoText(view.selectedAiLog.responsePayload)}</pre></RimoElement></RimoElement></div></> : null}</>}</RimoElement></RimoRoot>;
}