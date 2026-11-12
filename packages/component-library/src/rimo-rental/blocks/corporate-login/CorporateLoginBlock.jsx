import { useRimoModel } from '../../lib/rimo-model.js';
import { RimoRoot, RimoIcon, RimoImage, useRimoEnvironment } from '../../lib/RimoEnvironment.jsx';
import { RimoElement, rimoText } from '../../lib/RimoElements.jsx';
import './corporate-login.css';
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
    const currentLang = ref('zh-CN');
    const formRef = ref(null);
    const loading = ref(false);
    const form = reactive({
      tenantCode: '',
      account: '',
      password: '',
      captcha: '',
      rememberMe: true
    });
    const captchaUrl = ref('');
    const langOptions = [{
      label: '簡',
      value: 'zh-CN'
    }, {
      label: '繁',
      value: 'zh-TW'
    }, {
      label: 'EN',
      value: 'en-US'
    }];
    const i18nTexts = {
      'zh-CN': {
        brandTitle: 'RIMO 數字化企業平臺',
        brandSubtitle: '企業差旅與用車綜合管理平臺。通過透明的數據統計、快捷的車輛預訂預排，提升企業用車效率並降低出行成本。',
        brandBullet1: '實時掌握企業租車訂單池狀態',
        brandBullet2: '企業組織架構及員工用車權限管理',
        brandBullet3: '完善的費用結算與數據報表功能',
        title: '企業客戶登錄',
        subtitle: '請使用企業管理員分配的專屬賬號登錄 RIMO 企業端系統。',
        tenantLabel: '羣組代碼 / 租戶編碼',
        tenantPlaceholder: '請輸入所屬營運商的羣組代碼',
        tenantRequired: '請輸入羣組代碼 / 租戶編碼',
        accountLabel: '企業賬號',
        accountPlaceholder: '郵箱 / 手機號 / 企業工號',
        accountRequired: '請輸入賬號',
        passwordLabel: '密碼',
        passwordPlaceholder: '請輸入密碼',
        passwordRequired: '請輸入密碼',
        passwordMin: '密碼長度至少 6 位',
        captchaLabel: '驗證碼',
        captchaPlaceholder: '請輸入右側驗證碼',
        captchaRequired: '請輸入驗證碼',
        captchaImageText: '圖形驗證碼區域',
        captchaPlaceholderImage: '點擊獲取驗證碼',
        captchaRefresh: '看不清？換一張',
        rememberMe: '記住我（7 天內免登錄）',
        forgotPassword: '忘記密碼？',
        loginButton: '登錄',
        footerNote: '如需開通企業賬號，請聯繫貴司管理員或合作營運商。',
        loginSuccess: '登錄成功，正在跳轉...'
      },
      'zh-TW': {
        brandTitle: 'RIMO 數位化企業平臺',
        brandSubtitle: '企業差旅與用車綜合管理平臺。透過透明的數據統計、快捷的車輛預訂排程，提升企業用車效率並降低出行成本。',
        brandBullet1: '即時掌握企業租車訂單池狀態',
        brandBullet2: '企業組織架構及員工用車權限管理',
        brandBullet3: '完善的費用結算與數據報表功能',
        title: '企業客戶登入',
        subtitle: '請使用企業管理員分配的專屬帳號登入 RIMO 企業端系統。',
        tenantLabel: '羣組代碼 / 租戶編碼',
        tenantPlaceholder: '請輸入所屬營運商的羣組代碼',
        tenantRequired: '請輸入羣組代碼 / 租戶編碼',
        accountLabel: '企業帳號',
        accountPlaceholder: 'Email / 手機號 / 企業工號',
        accountRequired: '請輸入帳號',
        passwordLabel: '密碼',
        passwordPlaceholder: '請輸入密碼',
        passwordRequired: '請輸入密碼',
        passwordMin: '密碼長度至少 6 位',
        captchaLabel: '驗證碼',
        captchaPlaceholder: '請輸入右側驗證碼',
        captchaRequired: '請輸入驗證碼',
        captchaImageText: '圖形驗證碼區域',
        captchaPlaceholderImage: '點擊取得驗證碼',
        captchaRefresh: '看不清？換一張',
        rememberMe: '記住我（7 天內免登入）',
        forgotPassword: '忘記密碼？',
        loginButton: '登入',
        footerNote: '如需開通企業帳號，請聯絡貴司管理員或合作營運商。',
        loginSuccess: '登入成功，正在跳轉...'
      },
      'en-US': {
        brandTitle: 'RIMO Enterprise Platform',
        brandSubtitle: 'Comprehensive corporate travel and vehicle management. Improve efficiency and reduce costs through transparent data and quick booking.',
        brandBullet1: 'Real-time status of corporate rental orders',
        brandBullet2: 'Employee vehicle permission management',
        brandBullet3: 'Comprehensive billing and reporting functionality',
        title: 'Corporate Sign In',
        subtitle: 'Use your dedicated account to sign in to the RIMO Enterprise system.',
        tenantLabel: 'Tenant / Group Code',
        tenantPlaceholder: 'Enter your operator\'s group code',
        tenantRequired: 'Please enter tenant/group code',
        accountLabel: 'Account',
        accountPlaceholder: 'Email / Phone / Employee ID',
        accountRequired: 'Please enter account',
        passwordLabel: 'Password',
        passwordPlaceholder: 'Enter your password',
        passwordRequired: 'Please enter password',
        passwordMin: 'Password must be at least 6 characters',
        captchaLabel: 'Captcha',
        captchaPlaceholder: 'Enter the code on the right',
        captchaRequired: 'Please enter captcha',
        captchaImageText: 'Captcha image area',
        captchaPlaceholderImage: 'Click to load captcha',
        captchaRefresh: 'Can’t see clearly? Refresh',
        rememberMe: 'Remember me (7 days)',
        forgotPassword: 'Forgot password?',
        loginButton: 'Sign In',
        footerNote: 'Contact your company admin or operator for an account.',
        loginSuccess: 'Signed in successfully, redirecting...'
      }
    };
    const texts = computed(() => i18nTexts[currentLang.value] || i18nTexts['zh-CN']);
    const refreshCaptcha = () => {
      captchaUrl.value = String(Date.now());
      console.log('刷新驗證碼佔位，captchaUrl:', captchaUrl.value);
    };
    const handleLogin = () => {
      if (!formRef.value) return;
      formRef.value.validate(valid => {
        if (!valid) return;
        loading.value = true;
        const payload = {
          tenantCode: form.tenantCode,
          account: form.account,
          password: form.password,
          captcha: form.captcha,
          rememberMe: form.rememberMe
        };
        console.log('模擬企業登錄提交: ', payload);
        window.setTimeout(() => {
          loading.value = false;
          feedback.ElMessage.success(texts.value.loginSuccess || '登錄成功，正在跳轉...');
          window.location.href = 'enterprise_workbench.html';
        }, 800);
      });
    };
    return {
      currentLang,
      form,
      formRef,
      loading,
      captchaUrl,
      langOptions,
      texts,
      refreshCaptcha,
      handleLogin,
      i18nTexts
    };
  }
  return pageSetup();
}
export default function CorporateLoginBlock() {
  const model = useRimoModel(createPageState);
  const view = model.view;
  const {
    text
  } = useRimoEnvironment();
  return <RimoRoot model={model} pageKey="corporate-login" assets={{
    "--rimo-asset-d0f6268d0971": "login_bg.jpg"
  }}><div data-business-content="" data-rimo-layout="page"><div className="min-h-screen flex items-center justify-center px-4 py-8"><div className="max-w-5xl w-full bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden flex flex-col lg:flex-row lg:min-h-[620px]"><div className="login-brand hidden lg:flex lg:w-1/2 text-white flex-col justify-between p-8"><div><div className="space-y-4"><h2 className="text-3xl font-semibold leading-tight">{text("\n                                ")}{rimoText(view.texts.brandTitle)}{text("\n                            ")}</h2>
<p className="text-white/80 text-sm leading-relaxed">{text("\n                                ")}{rimoText(view.texts.brandSubtitle)}{text("\n                            ")}</p>
<ul className="mt-4 space-y-2 text-sm text-white/85"><li className="flex items-center"><span className="w-1.5 h-1.5 rounded-full bg-emerald-300 mr-2 shadow-sm shadow-emerald-900/40"></span>
{text("\n                                    ")}{rimoText(view.texts.brandBullet1)}{text("\n                                ")}</li>
<li className="flex items-center"><span className="w-1.5 h-1.5 rounded-full bg-amber-300 mr-2 shadow-sm shadow-amber-900/40"></span>
{text("\n                                    ")}{rimoText(view.texts.brandBullet2)}{text("\n                                ")}</li>
<li className="flex items-center"><span className="w-1.5 h-1.5 rounded-full bg-sky-300 mr-2 shadow-sm shadow-sky-900/40"></span>
{text("\n                                    ")}{rimoText(view.texts.brandBullet3)}{text("\n                                ")}</li></ul></div></div>
<div className="text-xs text-white/60 mt-8">{text("\n                        © ")}{rimoText(new Date().getFullYear())}{text(" RIMO Rental. All rights reserved.\n                    ")}</div></div>
<div className="w-full lg:w-1/2 px-6 py-8 sm:px-10 sm:py-10 flex flex-col bg-white"><div className="flex items-center justify-between mb-8"><RimoImage src="logo.png" alt="RIMO Logo" className="h-8 w-auto" />
<RimoElement kind="el-segmented" modelValue={view.currentLang} onModelChange={value => {
                model.write(["currentLang"], value);
              }} size="small" options={view.langOptions}></RimoElement></div>
<div className="mb-8 min-h-[92px]"><h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">{text("\n                            ")}{rimoText(view.texts.title)}{text("\n                        ")}</h1>
<p className="mt-2 text-sm text-gray-500 leading-relaxed">{text("\n                            ")}{rimoText(view.texts.subtitle)}{text("\n                        ")}</p></div>
<RimoElement kind="el-form" model={view.form} modelRef={model.ref("formRef")} size="large" labelPosition="top" className="space-y-4"><RimoElement kind="el-form-item" label={view.texts.tenantLabel} prop="tenantCode" rules={[{
                required: true,
                message: view.texts.tenantRequired,
                trigger: 'blur'
              }]}><RimoElement kind="el-input" modelValue={view.form.tenantCode} onModelChange={value => {
                  model.write(["form", "tenantCode"], value);
                }} placeholder={view.texts.tenantPlaceholder} autoComplete="organization" slots={{
                  "prefix": _slot => <><RimoElement kind="el-icon"><RimoIcon name="Tickets" /></RimoElement></>
                }}></RimoElement></RimoElement>
<RimoElement kind="el-form-item" label={view.texts.accountLabel} prop="account" rules={[{
                required: true,
                message: view.texts.accountRequired,
                trigger: 'blur'
              }]}><RimoElement kind="el-input" modelValue={view.form.account} onModelChange={value => {
                  model.write(["form", "account"], value);
                }} placeholder={view.texts.accountPlaceholder} autoComplete="username" slots={{
                  "prefix": _slot => <><RimoElement kind="el-icon"><RimoIcon name="User" /></RimoElement></>
                }}></RimoElement></RimoElement>
<RimoElement kind="el-form-item" label={view.texts.passwordLabel} prop="password" rules={[{
                required: true,
                message: view.texts.passwordRequired,
                trigger: 'blur'
              }, {
                min: 6,
                message: view.texts.passwordMin,
                trigger: 'blur'
              }]}><RimoElement kind="el-input" modelValue={view.form.password} onModelChange={value => {
                  model.write(["form", "password"], value);
                }} placeholder={view.texts.passwordPlaceholder} showPassword={true} type="password" autoComplete="current-password" slots={{
                  "prefix": _slot => <><RimoElement kind="el-icon"><RimoIcon name="Lock" /></RimoElement></>
                }}></RimoElement></RimoElement>
<div className="grid grid-cols-3 gap-3" data-rimo-grid="3"><RimoElement kind="el-form-item" className="col-span-2" label={view.texts.captchaLabel} prop="captcha" rules={[{
                  required: true,
                  message: view.texts.captchaRequired,
                  trigger: 'blur'
                }]}><RimoElement kind="el-input" modelValue={view.form.captcha} onModelChange={value => {
                    model.write(["form", "captcha"], value);
                  }} placeholder={view.texts.captchaPlaceholder} autoComplete="off" slots={{
                    "prefix": _slot => <><RimoElement kind="el-icon"><RimoIcon name="CircleCheck" /></RimoElement></>
                  }}></RimoElement></RimoElement>
<div className="flex flex-col justify-end"><div className="h-[42px] w-full flex items-center justify-center rounded-lg border text-sm cursor-pointer select-none\n                                    bg-gray-50 hover:bg-gray-100 border-gray-200 text-gray-600" onClick={event => {
                    view.refreshCaptcha?.(event);
                  }}>{view.captchaUrl ? <><span>{rimoText(view.texts.captchaImageText)}</span></> : <><span>{rimoText(view.texts.captchaPlaceholderImage)}</span></>}</div>
<button type="button" className="mt-1 text-xs text-gray-400 hover:text-gray-500 text-right" onClick={event => {
                    view.refreshCaptcha?.(event);
                  }}>{text("\n                                    ")}{rimoText(view.texts.captchaRefresh)}{text("\n                                ")}</button></div></div>
<div className="flex items-center justify-between mt-1 mb-2"><RimoElement kind="el-checkbox" modelValue={view.form.rememberMe} onModelChange={value => {
                  model.write(["form", "rememberMe"], value);
                }}>{text("\n                                ")}{rimoText(view.texts.rememberMe)}{text("\n                            ")}</RimoElement>
<a href="#" className="text-xs text-[color:var(--app-color-primary)] hover:text-[color:var(--app-color-primary-hover)]">{text("\n                                ")}{rimoText(view.texts.forgotPassword)}{text("\n                            ")}</a></div>
<RimoElement kind="el-button" type="primary" loading={view.loading} disabled={view.loading} className="w-full h-11 mt-3 text-base font-semibold" onClick={event => {
                view.handleLogin?.(event);
              }}>{text("\n                            ")}{rimoText(view.texts.loginButton)}{text("\n                        ")}</RimoElement></RimoElement>
<div className="mt-8 text-xs text-gray-400 text-center">{text("\n                        ")}{rimoText(view.texts.footerNote)}{text("\n                    ")}</div></div></div></div></div></RimoRoot>;
}