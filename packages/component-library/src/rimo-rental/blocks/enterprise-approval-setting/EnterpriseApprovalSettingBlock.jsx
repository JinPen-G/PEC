import { Fragment } from 'react';
import { useRimoModel, rimoEntries } from '../../lib/rimo-model.js';
import { RimoRoot, RimoIcon, useRimoEnvironment } from '../../lib/RimoEnvironment.jsx';
import { RimoElement, rimoClass, rimoStyle, rimoText } from '../../lib/RimoElements.jsx';
import './enterprise-approval-setting.css';
function createPageState(model) {
  const _document = model.document;
  const _window = model.window;
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
      record: reactive,
      cell: ref
    } = model;
    const form = reactive({
      enableOrNot: true,
      timeLimitedApproval: true,
      limitedTime: '30',
      userIds: ['u001']
    });
    const currentUserRole = ref('HEADQUARTERS');
    const approverOptions = [{
      label: '王怡君',
      value: 'u001'
    }, {
      label: '陳建宏',
      value: 'u002'
    }, {
      label: '林雅婷',
      value: 'u003'
    }];
    return {
      form,
      currentUserRole,
      approverOptions
    };
  }
  return pageSetup();
}
export default function EnterpriseApprovalSettingBlock() {
  const model = useRimoModel(createPageState);
  const view = model.view;
  const {
    text
  } = useRimoEnvironment();
  return <RimoRoot model={model} pageKey="enterprise-approval-setting" assets={{}}><div data-business-content="" data-rimo-layout="page"><div className="car-setting-page"><div className="car-setting-page__header mb-6" data-rimo-layout="heading"><div><h1 className="text-2xl font-bold text-gray-800 tracking-tight">{text("\n                                預約用車審批\n                            ")}</h1>
<p className="text-gray-500 text-sm mt-1">{text("\n                                設置預約用車審批開關、超時流轉及最終審批人。\n                            ")}</p></div></div>
<RimoElement kind="el-form" modelRef={model.ref("formRef")} model={view.form} labelPosition="top" labelSuffix="：" className="car-setting-page__form"><div className="car-setting-page__content-card"><div className="car-setting-page__hero-grid"><section className="car-setting-page__hero-card"><div className="car-setting-page__hero-head"><span className="car-setting-page__hero-icon"><RimoElement kind="el-icon"><RimoIcon name="Connection" /></RimoElement></span>
<div><div className="car-setting-page__hero-title">{text("\n                                                預約用車審批\n                                            ")}</div>
<div className="car-setting-page__hero-desc">{text("\n                                                設置預約用車審批開關、超時流轉及最終審批人。\n                                            ")}</div></div></div>
<RimoElement kind="el-form-item" prop="enableOrNot" className="car-setting-page__checkbox-item"><RimoElement kind="el-checkbox" modelValue={view.form.enableOrNot} onModelChange={value => {
                    model.write(["form", "enableOrNot"], value);
                  }} size="large">{text("\n                                            啓用\n                                        ")}</RimoElement></RimoElement></section>
<section className="car-setting-page__summary-card"><div className="car-setting-page__summary-label">{text("\n                                        高級設置\n                                    ")}</div>
<div className="car-setting-page__summary-list"><div className="car-setting-page__summary-item"><span>{text("限時審批")}</span>
<strong>{rimoText(view.form.timeLimitedApproval ? '開啓' : '關閉')}</strong></div>
<div className="car-setting-page__summary-item"><span>{text("最終審批")}</span>
<strong>{rimoText(view.form.userIds.length)}</strong></div></div></section></div>
<div className="car-setting-page__panel-grid"><section className="car-setting-page__panel"><div className="car-setting-page__panel-head"><span className="car-setting-page__panel-icon car-setting-page__panel-icon--accent"><RimoElement kind="el-icon"><RimoIcon name="Timer" /></RimoElement></span>
<div><div className="car-setting-page__panel-title">{text("\n                                                限時審批\n                                            ")}</div>
<div className="car-setting-page__panel-desc">{text("\n                                                若審批時間超過將自動跳至由此處選擇的人員進行審批\n                                            ")}</div></div></div>
<RimoElement kind="el-form-item" label="限時審批" prop="timeLimitedApproval" className="car-setting-page__form-item car-setting-page__switch-item"><RimoElement kind="el-switch" modelValue={view.form.timeLimitedApproval} onModelChange={value => {
                    model.write(["form", "timeLimitedApproval"], value);
                  }} inlinePrompt={true} activeText="開" inactiveText="關" style={rimoStyle("--el-switch-on-color: var(--app-color-primary)")}></RimoElement></RimoElement></section>
<section className={rimoClass(["car-setting-page__panel", rimoClass({
                'is-disabled': !view.form.timeLimitedApproval
              })])}><div className="car-setting-page__panel-head"><span className="car-setting-page__panel-icon car-setting-page__panel-icon--soft"><RimoElement kind="el-icon"><RimoIcon name="User" /></RimoElement></span>
<div><div className="car-setting-page__panel-title">{text("\n                                                高級設置\n                                            ")}</div>
<div className="car-setting-page__panel-desc">{text("\n                                                設置預約用車審批開關、超時流轉及最終審批人。\n                                            ")}</div></div></div>
<div className="car-setting-page__field-grid"><RimoElement kind="el-form-item" label="審批時間" prop="limitedTime" className="car-setting-page__form-item"><RimoElement kind="el-input" modelValue={view.form.limitedTime} onModelChange={value => {
                      model.write(["form", "limitedTime"], value);
                    }} disabled={!view.form.timeLimitedApproval} slots={{
                      "append": _slot => <>{text("分")}</>
                    }}></RimoElement></RimoElement>
<RimoElement kind="el-form-item" label="最終審批" prop="userIds" className="car-setting-page__form-item"><RimoElement kind="el-select" modelValue={view.form.userIds} onModelChange={value => {
                      model.write(["form", "userIds"], value);
                    }} multiple={true} filterable={true} collapseTags={true} collapseTagsTooltip={true} disabled={!view.form.timeLimitedApproval} placeholder="最終審批">{rimoEntries(view.approverOptions).map(([item], _itemIndex) => <Fragment key={item.value}><RimoElement kind="el-option" key={item.value} label={item.label} value={item.value}></RimoElement></Fragment>)}</RimoElement></RimoElement></div></section></div></div>
<div className="car-setting-page__footer"><RimoElement kind="el-button" type="primary" size="large" className="car-setting-page__submit-button">{text("\n                                提交\n                            ")}</RimoElement></div></RimoElement></div></div></RimoRoot>;
}