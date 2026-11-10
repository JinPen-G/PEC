import { Fragment } from 'react';
import { useRimoModel, rimoEntries } from '../../lib/rimo-model.js';
import { RimoRoot, RimoIcon, useRimoEnvironment } from '../../lib/RimoEnvironment.jsx';
import { RimoElement, rimoClass, rimoText } from '../../lib/RimoElements.jsx';
import './membership-plans.css';
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
      derived: computed
    } = model;
    const {
      ElMessage: _ElMessage,
      ElMessageBox: _ElMessageBox
    } = feedback;
    const plans = ref([{
      id: 'MP001',
      name: '普通會員',
      tier: 1,
      type: 'free',
      isDefault: true,
      isRecommended: false,
      showInApp: true,
      pricing: {
        monthly: 0,
        quarterly: 0,
        semiAnnual: 0,
        annual: 0,
        monthlyEnabled: false,
        quarterlyEnabled: false,
        semiAnnualEnabled: false,
        annualEnabled: false
      },
      benefits: ['基礎租車服務', '積分1倍累積'],
      memberCount: 12580,
      status: 'active'
    }, {
      id: 'MP002',
      name: '銀牌會員',
      tier: 2,
      type: 'paid',
      isDefault: false,
      isRecommended: false,
      showInApp: true,
      pricing: {
        monthly: 99,
        quarterly: 269,
        semiAnnual: 0,
        annual: 899,
        monthlyEnabled: true,
        quarterlyEnabled: true,
        semiAnnualEnabled: false,
        annualEnabled: true
      },
      benefits: ['積分1.5倍累積', '專屬客服', '生日特權'],
      memberCount: 3200,
      status: 'active'
    }, {
      id: 'MP003',
      name: '金牌會員',
      tier: 3,
      type: 'paid',
      isDefault: false,
      isRecommended: true,
      showInApp: true,
      pricing: {
        monthly: 199,
        quarterly: 539,
        semiAnnual: 999,
        annual: 1799,
        monthlyEnabled: true,
        quarterlyEnabled: true,
        semiAnnualEnabled: true,
        annualEnabled: true
      },
      benefits: ['積分2倍累積', '免費升級車型', '專屬客服', 'VIP休息室', '生日雙倍積分'],
      memberCount: 1520,
      status: 'active'
    }, {
      id: 'MP004',
      name: '鑽石會員',
      tier: 4,
      type: 'paid',
      isDefault: false,
      isRecommended: false,
      showInApp: false,
      pricing: {
        monthly: 399,
        quarterly: 0,
        semiAnnual: 0,
        annual: 3599,
        monthlyEnabled: true,
        quarterlyEnabled: false,
        semiAnnualEnabled: false,
        annualEnabled: true
      },
      benefits: ['積分3倍累積', '優先預訂', '機場接送', '專屬車輛', 'VIP通道', '24小時管家服務'],
      memberCount: 280,
      status: 'active'
    }]);
    const pricingCycles = [{
      key: 'monthly',
      label: '月繳'
    }, {
      key: 'quarterly',
      label: '季繳'
    }, {
      key: 'semiAnnual',
      label: '半年繳'
    }, {
      key: 'annual',
      label: '年繳'
    }];
    const dialogVisible = ref(false);
    const isEdit = ref(false);
    const newBenefit = ref('');
    const currentPlan = reactive({
      id: '',
      name: '',
      tier: 1,
      type: 'free',
      isDefault: false,
      isRecommended: false,
      showInApp: true,
      pricing: {
        monthly: 0,
        quarterly: 0,
        semiAnnual: 0,
        annual: 0,
        monthlyEnabled: false,
        quarterlyEnabled: false,
        semiAnnualEnabled: false,
        annualEnabled: false
      },
      benefits: [],
      memberCount: 0,
      status: 'active'
    });
    const sortedPlans = computed(() => {
      return [...plans.value].sort((a, b) => a.tier - b.tier);
    });
    const formatNumber = num => {
      if (num >= 10000) return (num / 10000).toFixed(1) + '萬';
      if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
      return num.toString();
    };
    const getLowestPrice = plan => {
      const enabled = pricingCycles.filter(c => plan.pricing[c.key + 'Enabled'] && plan.pricing[c.key] > 0);
      if (enabled.length === 0) return 0;
      return Math.min(...enabled.map(c => plan.pricing[c.key]));
    };
    const getLowestPriceCycle = plan => {
      const enabled = pricingCycles.filter(c => plan.pricing[c.key + 'Enabled'] && plan.pricing[c.key] > 0);
      if (enabled.length === 0) return '月';
      const lowest = enabled.reduce((a, b) => plan.pricing[a.key] < plan.pricing[b.key] ? a : b);
      return lowest.label.replace('繳', '');
    };
    const getEnabledCyclesText = plan => {
      const enabled = pricingCycles.filter(c => plan.pricing[c.key + 'Enabled'] && plan.pricing[c.key] > 0);
      return enabled.map(c => `${c.label.replace('繳', '')}¥${plan.pricing[c.key]}`).join(' | ');
    };
    const openDialog = () => {
      isEdit.value = false;
      Object.assign(currentPlan, {
        id: 'MP' + Date.now(),
        name: '',
        tier: plans.value.length + 1,
        type: 'free',
        isDefault: false,
        isRecommended: false,
        showInApp: true,
        pricing: {
          monthly: 0,
          quarterly: 0,
          semiAnnual: 0,
          annual: 0,
          monthlyEnabled: false,
          quarterlyEnabled: false,
          semiAnnualEnabled: false,
          annualEnabled: false
        },
        benefits: [],
        memberCount: 0,
        status: 'active'
      });
      newBenefit.value = '';
      dialogVisible.value = true;
    };
    const openEdit = plan => {
      isEdit.value = true;
      Object.assign(currentPlan, JSON.parse(JSON.stringify(plan)));
      newBenefit.value = '';
      dialogVisible.value = true;
    };
    const addBenefit = () => {
      if (newBenefit.value.trim()) {
        currentPlan.benefits.push(newBenefit.value.trim());
        newBenefit.value = '';
      }
    };
    const removeBenefit = index => {
      currentPlan.benefits.splice(index, 1);
    };
    const savePlan = () => {
      if (!currentPlan.name) {
        feedback.ElMessage.warning('請輸入方案名稱');
        return;
      }
      if (currentPlan.type === 'paid') {
        const hasPrice = pricingCycles.some(c => currentPlan.pricing[c.key + 'Enabled'] && currentPlan.pricing[c.key] > 0);
        if (!hasPrice) {
          feedback.ElMessage.warning('付費方案請至少設置一個繳費週期價格');
          return;
        }
      }
      if (currentPlan.isDefault) {
        plans.value.forEach(p => {
          if (p.id !== currentPlan.id) p.isDefault = false;
        });
      }
      if (isEdit.value) {
        const idx = plans.value.findIndex(p => p.id === currentPlan.id);
        if (idx !== -1) plans.value[idx] = JSON.parse(JSON.stringify(currentPlan));
      } else {
        plans.value.push(JSON.parse(JSON.stringify(currentPlan)));
      }
      dialogVisible.value = false;
      feedback.ElMessage.success('保存成功');
    };
    const deletePlan = plan => {
      if (plan.memberCount > 0) {
        feedback.ElMessage.warning('該方案下還有會員，請先遷移後再刪除');
        return;
      }
      feedback.ElMessageBox.confirm(`確定要刪除方案 "${plan.name}" 嗎?`, '警告', {
        type: 'warning'
      }).then(() => {
        const idx = plans.value.findIndex(p => p.id === plan.id);
        if (idx !== -1) plans.value.splice(idx, 1);
        feedback.ElMessage.success('刪除成功');
      });
    };
    return {
      plans,
      sortedPlans,
      pricingCycles,
      dialogVisible,
      isEdit,
      currentPlan,
      newBenefit,
      formatNumber,
      getLowestPrice,
      getLowestPriceCycle,
      getEnabledCyclesText,
      openDialog,
      openEdit,
      addBenefit,
      removeBenefit,
      savePlan,
      deletePlan,
      ElMessage: feedback.ElMessage,
      ElMessageBox: feedback.ElMessageBox
    };
  }
  return pageSetup();
}
export default function MembershipPlansBlock() {
  const model = useRimoModel(createPageState);
  const view = model.view;
  const {
    text
  } = useRimoEnvironment();
  return <RimoRoot model={model} pageKey="membership-plans" assets={{}}><div data-business-content="" data-rimo-layout="page"><div className="flex justify-between items-end mb-6" data-rimo-layout="heading"><div><h1 className="text-2xl font-bold text-gray-800 tracking-tight">{text("客戶等級方案")}</h1>
<p className="text-gray-500 text-sm mt-1">{text("管理會員等級方案，設置付費/免費模式及會員權益配置。")}</p></div>
<RimoElement kind="el-button" type="primary" size="large" className="shadow-md shadow-[color:var(--app-color-primary-shadow)]" onClick={_event => {
          view.openDialog();
        }}><RimoElement kind="el-icon" className="mr-1"><RimoIcon name="Plus" /></RimoElement>
{text(" 新增方案\n                    ")}</RimoElement></div>
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">{rimoEntries(view.sortedPlans).map(([plan], _itemIndex) => <Fragment key={plan.id}><div key={plan.id} className={rimoClass(["plan-card border-2 rounded-2xl p-6 bg-white flex flex-col relative", rimoClass({
            'is-recommended': plan.isRecommended,
            'border-gray-200': !plan.isRecommended
          })])}>{plan.isRecommended ? <><div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-xs px-4 py-1 rounded-full font-bold shadow-md">{text("\n                            ⭐ 推薦\n                        ")}</div></> : null}
{plan.isDefault ? <><div className="absolute -top-3 right-4 bg-green-500 text-white text-xs px-3 py-1 rounded-full font-bold shadow-md">{text("\n                            默認\n                        ")}</div></> : null}
<div className="flex justify-between items-start mb-4"><div className="tier-badge text-xs px-2 py-1 rounded-full">{text("\n                                Lv.")}{rimoText(plan.tier)}{text("\n                            ")}</div>
{!plan.showInApp ? <><RimoElement kind="el-tag" size="small" type="info" effect="plain">{text("\n                                APP隱藏\n                            ")}</RimoElement></> : null}</div>
<h3 className="text-xl font-bold text-gray-800 mb-2">{rimoText(plan.name)}</h3>
<div className="mb-4">{plan.type === 'free' ? <><div className="text-2xl font-bold text-green-600">{text("\n                                免費\n                            ")}</div></> : <><div><div className="text-2xl font-bold text-[color:var(--app-color-primary)]">{text("\n                                    ¥")}{rimoText(view.getLowestPrice(plan))}
<span className="text-sm font-normal text-gray-500">{text("/")}{rimoText(view.getLowestPriceCycle(plan))}</span></div>
<div className="text-xs text-gray-400 mt-1">{text("\n                                    ")}{rimoText(view.getEnabledCyclesText(plan))}{text("\n                                ")}</div></div></>}</div>
<div className="flex-1 mb-4"><div className="text-xs text-gray-500 font-bold mb-2 uppercase">{text("權益")}</div>
<ul className="space-y-1.5">{rimoEntries(plan.benefits.slice(0, 4)).map(([benefit, idx], _itemIndex) => <Fragment key={idx}><li key={idx} className="flex items-center text-sm text-gray-600"><RimoElement kind="el-icon" className="mr-2 text-green-500"><RimoIcon name="Check" /></RimoElement>
{text("\n                                    ")}{rimoText(benefit)}{text("\n                                ")}</li></Fragment>)}
{plan.benefits.length > 4 ? <><li className="text-xs text-gray-400">{text("\n                                    + ")}{rimoText(plan.benefits.length - 4)}{text(" 項更多權益...\n                                ")}</li></> : null}</ul></div>
<div className="text-center py-3 bg-gray-50 rounded-lg mb-4"><div className="text-2xl font-bold text-gray-800">{rimoText(view.formatNumber(plan.memberCount))}</div>
<div className="text-xs text-gray-500">{text("當前會員數")}</div></div>
<div className="flex gap-2 border-t border-gray-100 pt-4"><RimoElement kind="el-button" className="flex-1" type="primary" plain={true} size="small" onClick={_event => {
                view.openEdit(plan);
              }}>{text("編輯")}</RimoElement>
<RimoElement kind="el-button" type="danger" plain={true} size="small" icon="Delete" circle={true} disabled={plan.memberCount > 0} onClick={_event => {
                view.deletePlan(plan);
              }}></RimoElement></div></div></Fragment>)}
{view.plans.length === 0 ? <><div className="col-span-full flex flex-col items-center justify-center py-20 text-gray-400"><RimoElement kind="el-icon" className="text-5xl mb-3 opacity-20"><RimoIcon name="Medal" /></RimoElement>
<p>{text("暫無會員方案，點擊右上角新增")}</p></div></> : null}</div></div><RimoElement kind="el-dialog" modelValue={view.dialogVisible} onModelChange={value => {
      model.write(["dialogVisible"], value);
    }} title={view.isEdit ? '編輯會員方案' : '新增會員方案'} width="700px" className="membership-plans-overlay" slots={{
      "footer": _slot => <><RimoElement kind="el-button" onClick={_event => {
          model.write(["dialogVisible"], false);
        }}>{text("取消")}</RimoElement>
<RimoElement kind="el-button" type="primary" onClick={event => {
          view.savePlan?.(event);
        }}>{text("保存")}</RimoElement></>
    }}>{() => <><RimoElement kind="el-form" model={view.currentPlan} labelPosition="top"><div className="grid grid-cols-2 gap-6" data-rimo-layout="form-grid"><RimoElement kind="el-form-item" label="方案名稱" required={true}><RimoElement kind="el-input" modelValue={view.currentPlan.name} onModelChange={value => {
                model.write(["currentPlan", "name"], value);
              }} placeholder="例如: 金牌會員"></RimoElement></RimoElement>
<RimoElement kind="el-form-item" label="等級層級" required={true}><RimoElement kind="el-input-number" modelValue={view.currentPlan.tier} onModelChange={value => {
                model.write(["currentPlan", "tier"], value);
              }} min={1} max={10} className="w-full"></RimoElement>
<div className="text-xs text-gray-400 mt-1">{text("數字越大等級越高，用於排序")}</div></RimoElement>
<RimoElement kind="el-form-item" label="收費類型" className="col-span-2"><RimoElement kind="el-radio-group" modelValue={view.currentPlan.type} onModelChange={value => {
                model.write(["currentPlan", "type"], value);
              }}><RimoElement kind="el-radio-button" value="free">{text("免費方案")}</RimoElement>
<RimoElement kind="el-radio-button" value="paid">{text("付費方案")}</RimoElement></RimoElement></RimoElement>
{view.currentPlan.type === 'paid' ? <><div className="col-span-2 bg-blue-50 p-4 rounded-lg border border-blue-100"><div className="font-bold text-gray-800 mb-4 flex items-center"><RimoElement kind="el-icon" className="mr-2 text-blue-600"><RimoIcon name="Money" /></RimoElement>
{text("\n                            繳費週期與價格\n                        ")}</div>
<div className="text-xs text-gray-500 mb-4">{text("勾選啓用的繳費週期，並設置對應價格")}</div>
<div className="grid grid-cols-2 gap-4">{rimoEntries(view.pricingCycles).map(([cycle], _itemIndex) => <Fragment key={cycle.key}><div key={cycle.key} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200"><RimoElement kind="el-checkbox" modelValue={view.currentPlan.pricing[cycle.key + 'Enabled']} onModelChange={value => {
                        model.write(["currentPlan", "pricing", cycle.key + 'Enabled'], value);
                      }}>{text("\n                                    ")}{rimoText(cycle.label)}{text("\n                                ")}</RimoElement>
<RimoElement kind="el-input-number" modelValue={view.currentPlan.pricing[cycle.key]} onModelChange={value => {
                        model.write(["currentPlan", "pricing", cycle.key], value);
                      }} min={0} step={10} disabled={!view.currentPlan.pricing[cycle.key + 'Enabled']} size="small" className="flex-1"></RimoElement>
<span className="text-xs text-gray-400">{text("元")}</span></div></Fragment>)}</div></div></> : null}
<div className="col-span-2"><RimoElement kind="el-form-item" label="會員權益"><div className="w-full"><div className="flex gap-2 mb-3"><RimoElement kind="el-input" modelValue={view.newBenefit} onModelChange={value => {
                      model.write(["newBenefit"], value);
                    }} placeholder="輸入權益內容" onKeyUp={event => {
                      if (event.key !== 'Enter') return;
                      view.addBenefit?.(event);
                    }}></RimoElement>
<RimoElement kind="el-button" type="primary" onClick={event => {
                      view.addBenefit?.(event);
                    }}>{text("添加")}</RimoElement></div>
<div className="flex flex-wrap gap-2">{rimoEntries(view.currentPlan.benefits).map(([benefit, idx], _itemIndex) => <Fragment key={idx}><RimoElement kind="el-tag" key={idx} closable={true} onClose={_event => {
                        view.removeBenefit(idx);
                      }} size="large">{text("\n                                        ")}{rimoText(benefit)}{text("\n                                    ")}</RimoElement></Fragment>)}
{view.currentPlan.benefits.length === 0 ? <><div className="text-gray-400 text-sm">{text("\n                                        暫無權益，請添加\n                                    ")}</div></> : null}</div></div></RimoElement></div>
<RimoElement kind="el-form-item" label="設爲註冊默認方案"><RimoElement kind="el-switch" modelValue={view.currentPlan.isDefault} onModelChange={value => {
                model.write(["currentPlan", "isDefault"], value);
              }}></RimoElement>
<span className="text-xs text-gray-500 ml-2">{text("新用戶註冊後自動成爲該方案會員")}</span></RimoElement>
<RimoElement kind="el-form-item" label="設爲推薦方案"><RimoElement kind="el-switch" modelValue={view.currentPlan.isRecommended} onModelChange={value => {
                model.write(["currentPlan", "isRecommended"], value);
              }}></RimoElement>
<span className="text-xs text-gray-500 ml-2">{text("在APP首頁突出顯示")}</span></RimoElement>
<RimoElement kind="el-form-item" label="APP顯示" className="col-span-2"><RimoElement kind="el-switch" modelValue={view.currentPlan.showInApp} onModelChange={value => {
                model.write(["currentPlan", "showInApp"], value);
              }}></RimoElement>
<span className="text-xs text-gray-500 ml-2">{text("關閉後該方案不會在APP中展示給用戶")}</span></RimoElement></div></RimoElement></>}</RimoElement></RimoRoot>;
}