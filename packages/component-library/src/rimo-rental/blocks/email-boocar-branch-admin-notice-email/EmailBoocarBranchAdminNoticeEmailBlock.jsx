import { useRimoModel } from '../../lib/rimo-model.js';
import { RimoRoot, RimoImage, useRimoEnvironment } from '../../lib/RimoEnvironment.jsx';
import { rimoStyle, rimoText } from '../../lib/RimoElements.jsx';
import './email-boocar-branch-admin-notice-email.css';
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
  return {
    "recipient_name": "示例管理員",
    "company": "示例企業",
    "branch_name": "branch_name",
    "branch_company": "臺北分公司",
    "company_code": "RIMO-DEMO",
    "login_url": "corporate_login.html",
    "tenant_group": "RIMO Rental",
    "login_account": "demo@rimo.example",
    "initial_password": "Demo-Only-2026"
  };
}
export default function EmailBoocarBranchAdminNoticeEmailBlock() {
  const model = useRimoModel(createPageState);
  const view = model.view;
  const {
    text
  } = useRimoEnvironment();
  return <RimoRoot model={model} pageKey="email-boocar-branch-admin-notice-email" assets={{
    "--rimo-asset-df9aeab881b5": "https://rentalawsbucket.s3.ap-southeast-1.amazonaws.com/rentCar/boocar_email_assets/hero-bg.png",
    "--rimo-asset-b06ad28e0e4c": "https://rentalawsbucket.s3.ap-southeast-1.amazonaws.com/rentCar/boocar_email_assets/step-circle.png"
  }}><div><table role="presentation" width="100%" className="page-shell"><tr><td align="center"><table role="presentation" width="918" className="mail-frame"><tr><td align="left" style={rimoStyle("padding: 0;")}><table role="presentation" width="915" className="hero"><tr><td width="915" height="213" style={{
                        ...{
                          backgroundImage: "var(--rimo-asset-df9aeab881b5, none)"
                        },
                        ...rimoStyle("width: 915px; height: 213px; padding: 35px 0 0 46px; vertical-align: top; background-color: #1d38bf; background-image: var(--rimo-asset-df9aeab881b5, none); background-repeat: no-repeat; background-position: center center; background-size: cover;")
                      }} bgcolor="#1d38bf"><RimoImage src="https://rentalawsbucket.s3.ap-southeast-1.amazonaws.com/rentCar/boocar_email_assets/boocar-logo-white.png" alt="boocar" className="hero-logo" />
<div className="hero-copy" style={rimoStyle("padding-top: 31px;")}>{text("\n                        從申請到用車")}
<br />
{text("\n                        讓每一次公務用車都有依據\n                      ")}</div></td></tr></table></td></tr>
<tr><td style={rimoStyle("padding: 33px 61px 0 61px;")}><div className="headline">{text("\n                您已成為 ")}
<span className="headline-accent">{text("「")}{rimoText(view.company)}{text("-")}{rimoText(view.branch_company)}{text("」")}</span>
{text("公務車預約平臺管理員!\n              ")}</div>
<div className="greeting" style={rimoStyle("padding-top: 14px;")}>{text("\n                親愛的 ")}
<span className="greeting-strong">{rimoText(view.recipient_name)}</span>
{text(" 您好:\n              ")}</div>
<div className="intro" style={rimoStyle("padding-top: 0;")}>{text("\n                您已被授權為 ")}{rimoText(view.company)}{text("-")}{rimoText(view.branch_company)}{text(" 的管理員")}
<br />
{text("\n                您現在可以登入平臺，管理分公司車輛與員工，並處理公務車預約流程。\n              ")}</div></td></tr>
<tr><td align="center" style={rimoStyle("padding-top: 33px;")}><table role="presentation" width="878" className="card-shell"><tr><td style={rimoStyle("padding: 30px 0 0 64px;")}><table role="presentation"><tr><td style={rimoStyle("width: 56px; vertical-align: middle;")}><RimoImage src="https://rentalawsbucket.s3.ap-southeast-1.amazonaws.com/rentCar/boocar_email_assets/icon-account-header.png" alt="" width="44" height="44" style={rimoStyle("width: 44px; height: 44px;")} /></td>
<td className="section-heading" style={rimoStyle("vertical-align: middle;")}>{text("帳號資訊")}</td></tr></table></td></tr>
<tr><td style={rimoStyle("padding: 13px 0 0 0;")} align="center"><div className="account-frame" style={rimoStyle("margin: 0 auto;")}><table role="presentation" width="100%" cellpadding="0" cellspacing="0" className="account-table"><tr><td className="cell-label"><table role="presentation" className="label-inner" cellpadding="0" cellspacing="0"><tr><td className="label-icon-slot"><RimoImage src="https://rentalawsbucket.s3.ap-southeast-1.amazonaws.com/rentCar/boocar_email_assets/icon-company.png" alt="" className="row-icon" /></td>
<td className="label-text">{text("企業名稱")}</td></tr></table></td>
<td className="cell-value">{rimoText(view.company)}{text("-")}{rimoText(view.branch_company)}</td></tr>
<tr><td className="cell-label"><table role="presentation" className="label-inner" cellpadding="0" cellspacing="0"><tr><td className="label-icon-slot"><RimoImage src="https://rentalawsbucket.s3.ap-southeast-1.amazonaws.com/rentCar/boocar_email_assets/icon-company-code.png" alt="" className="row-icon" /></td>
<td className="label-text">{text("企業代碼")}</td></tr></table></td>
<td className="cell-value"><table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td className="company-code-main">{rimoText(view.company_code)}</td>
<td style={rimoStyle("padding-left: 14px; vertical-align: middle;")}><table role="presentation" cellpadding="0" cellspacing="0"><tr><td style={rimoStyle("width: 18px; vertical-align: middle;")}><RimoImage src="https://rentalawsbucket.s3.ap-southeast-1.amazonaws.com/rentCar/boocar_email_assets/icon-company-code-tip.png" alt="" width="14" height="14" style={rimoStyle("width: 14px; height: 14px;")} /></td>
<td className="company-code-note" style={rimoStyle("vertical-align: middle;")}>{text("\n                                        員工在APP上需輸入此企業代碼方能加入貴公司\n                                      ")}</td></tr></table></td></tr></table></td></tr>
<tr><td className="cell-label"><table role="presentation" className="label-inner" cellpadding="0" cellspacing="0"><tr><td className="label-icon-slot"><RimoImage src="https://rentalawsbucket.s3.ap-southeast-1.amazonaws.com/rentCar/boocar_email_assets/icon-link.png" alt="" className="row-icon" /></td>
<td className="label-text">{text("登入網址")}</td></tr></table></td>
<td className="cell-value">{rimoText(view.login_url)}</td></tr>
<tr><td className="cell-label"><table role="presentation" className="label-inner" cellpadding="0" cellspacing="0"><tr><td className="label-icon-slot"><RimoImage src="https://rentalawsbucket.s3.ap-southeast-1.amazonaws.com/rentCar/boocar_email_assets/icon-group.png" alt="" className="row-icon" /></td>
<td className="label-text">{text("登入羣組")}</td></tr></table></td>
<td className="cell-value">{rimoText(view.tenant_group)}</td></tr>
<tr><td className="cell-label"><table role="presentation" className="label-inner" cellpadding="0" cellspacing="0"><tr><td className="label-icon-slot"><RimoImage src="https://rentalawsbucket.s3.ap-southeast-1.amazonaws.com/rentCar/boocar_email_assets/icon-user.png" alt="" className="row-icon" /></td>
<td className="label-text">{text("登入帳號")}</td></tr></table></td>
<td className="cell-value">{rimoText(view.login_account)}</td></tr>
<tr><td className="cell-label"><table role="presentation" className="label-inner" cellpadding="0" cellspacing="0"><tr><td className="label-icon-slot"><RimoImage src="https://rentalawsbucket.s3.ap-southeast-1.amazonaws.com/rentCar/boocar_email_assets/icon-lock.png" alt="" className="row-icon" /></td>
<td className="label-text">{text("初始密碼")}</td></tr></table></td>
<td className="cell-value">{rimoText(view.initial_password)}</td></tr></table></div></td></tr>
<tr><td style={rimoStyle("padding: 10px 0 0 57px;")}><table role="presentation" className="warning-strip"><tr><td style={rimoStyle("width: 39px; padding-left: 18px; vertical-align: middle;")}><RimoImage src="https://rentalawsbucket.s3.ap-southeast-1.amazonaws.com/rentCar/boocar_email_assets/icon-warning.png" alt="" width="26" height="26" style={rimoStyle("width: 26px; height: 26px;")} /></td>
<td className="warning-text" style={rimoStyle("padding-left: 4px; vertical-align: middle;")}>{text("\n                          為了帳號安全，首次登入後請立即修改密碼\n                        ")}</td></tr></table></td></tr>
<tr><td align="center" style={rimoStyle("padding: 29px 0 29px 0;")}><a href="https://rental.rimo.pro/enterprise/#/login" className="cta-button"><table role="presentation" width="100%" height="74" cellpadding="0" cellspacing="0"><tr><td align="center" valign="middle" style={rimoStyle("font-size: 0;")}><RimoImage src="https://rentalawsbucket.s3.ap-southeast-1.amazonaws.com/rentCar/boocar_email_assets/icon-arrow-right.png" alt="" width="26" height="26" style={rimoStyle("width: 26px; height: 26px; display: inline-block; vertical-align: middle; margin-right: 16px;")} />
<span style={rimoStyle("display: inline-block; vertical-align: middle; font-size: 24px; line-height: 32px; font-weight: 700; color: #ffffff;")}>{text("登入管理平臺")}</span></td></tr></table></a></td></tr>
<tr><td><div className="divider"></div></td></tr>
<tr><td style={rimoStyle("padding: 22px 0 0 61px;")}><table role="presentation"><tr><td style={rimoStyle("width: 56px; vertical-align: middle;")}><RimoImage src="https://rentalawsbucket.s3.ap-southeast-1.amazonaws.com/rentCar/boocar_email_assets/icon-manage-functions.png" alt="" width="44" height="44" style={rimoStyle("width: 44px; height: 44px;")} /></td>
<td className="section-heading" style={rimoStyle("vertical-align: middle;")}>{text("您可管理的功能")}</td></tr></table></td></tr>
<tr><td style={rimoStyle("padding: 22px 0 0 39px;")}><table role="presentation" width="800"><tr><td width="121" valign="top" align="center"><div className="step-badge">{text("1")}</div>
<table role="presentation" width="82" height="82" className="step-visual" style={{
                                ...{
                                  backgroundImage: "var(--rimo-asset-b06ad28e0e4c, none)"
                                },
                                ...rimoStyle("width: 82px; height: 82px; margin: 0 auto; background-color: #eef2fb; background-image: var(--rimo-asset-b06ad28e0e4c, none); background-repeat: no-repeat; background-position: center center; background-size: 82px 82px; border-radius: 41px;")
                              }}><tr><td align="center" valign="middle" width="82" height="82"><RimoImage src="https://rentalawsbucket.s3.ap-southeast-1.amazonaws.com/rentCar/boocar_email_assets/step-icon-wheel.png" alt="" className="step-icon" width="30" height="30" style={rimoStyle("width: 30px; height: 30px;")} /></td></tr></table>
<div className="step-text">{text("分公司車輛建立與管理")}</div></td>
<td width="48" valign="top"><div className="step-line"></div></td>
<td width="121" valign="top" align="center"><div className="step-badge">{text("2")}</div>
<table role="presentation" width="82" height="82" className="step-visual" style={{
                                ...{
                                  backgroundImage: "var(--rimo-asset-b06ad28e0e4c, none)"
                                },
                                ...rimoStyle("width: 82px; height: 82px; margin: 0 auto; background-color: #eef2fb; background-image: var(--rimo-asset-b06ad28e0e4c, none); background-repeat: no-repeat; background-position: center center; background-size: 82px 82px; border-radius: 41px;")
                              }}><tr><td align="center" valign="middle" width="82" height="82"><RimoImage src="https://rentalawsbucket.s3.ap-southeast-1.amazonaws.com/rentCar/boocar_email_assets/step-icon-shield-check.png" alt="" className="step-icon" width="30" height="30" style={rimoStyle("width: 30px; height: 30px;")} /></td></tr></table>
<div className="step-text">{text("員工權限的管理")}</div></td>
<td width="48" valign="top"><div className="step-line"></div></td>
<td width="121" valign="top" align="center"><div className="step-badge">{text("3")}</div>
<table role="presentation" width="82" height="82" className="step-visual" style={{
                                ...{
                                  backgroundImage: "var(--rimo-asset-b06ad28e0e4c, none)"
                                },
                                ...rimoStyle("width: 82px; height: 82px; margin: 0 auto; background-color: #eef2fb; background-image: var(--rimo-asset-b06ad28e0e4c, none); background-repeat: no-repeat; background-position: center center; background-size: 82px 82px; border-radius: 41px;")
                              }}><tr><td align="center" valign="middle" width="82" height="82"><RimoImage src="https://rentalawsbucket.s3.ap-southeast-1.amazonaws.com/rentCar/boocar_email_assets/step-icon-user.png" alt="" className="step-icon" width="30" height="30" style={rimoStyle("width: 30px; height: 30px;")} /></td></tr></table>
<div className="step-text">{text("邀請員工加入")}
<br />
{text("需提供「")}
<span style={rimoStyle("font-weight: 700; color: #112bba;")}>{text("企業代碼")}</span>
{text("」給員工")}</div></td>
<td width="48" valign="top"><div className="step-line"></div></td>
<td width="121" valign="top" align="center"><div className="step-badge">{text("4")}</div>
<table role="presentation" width="82" height="82" className="step-visual" style={{
                                ...{
                                  backgroundImage: "var(--rimo-asset-b06ad28e0e4c, none)"
                                },
                                ...rimoStyle("width: 82px; height: 82px; margin: 0 auto; background-color: #eef2fb; background-image: var(--rimo-asset-b06ad28e0e4c, none); background-repeat: no-repeat; background-position: center center; background-size: 82px 82px; border-radius: 41px;")
                              }}><tr><td align="center" valign="middle" width="82" height="82"><RimoImage src="https://rentalawsbucket.s3.ap-southeast-1.amazonaws.com/rentCar/boocar_email_assets/step-icon-check.png" alt="" className="step-icon" width="30" height="30" style={rimoStyle("width: 30px; height: 30px;")} /></td></tr></table>
<div className="step-text">{text("分公司審核員工資格")}</div></td>
<td width="48" valign="top"><div className="step-line"></div></td>
<td width="124" valign="top" align="center"><div className="step-badge">{text("5")}</div>
<table role="presentation" width="82" height="82" className="step-visual" style={{
                                ...{
                                  backgroundImage: "var(--rimo-asset-b06ad28e0e4c, none)"
                                },
                                ...rimoStyle("width: 82px; height: 82px; margin: 0 auto; background-color: #eef2fb; background-image: var(--rimo-asset-b06ad28e0e4c, none); background-repeat: no-repeat; background-position: center center; background-size: 82px 82px; border-radius: 41px;")
                              }}><tr><td align="center" valign="middle" width="82" height="82"><table role="presentation" width="30" height="30" cellpadding="0" cellspacing="0" style={rimoStyle("width: 30px; height: 30px;")}><tr><td align="left" valign="top" height="15"><RimoImage src="https://rentalawsbucket.s3.ap-southeast-1.amazonaws.com/rentCar/boocar_email_assets/step-icon-date.png" alt="" className="step-icon-combo-date" width="21" height="20" style={rimoStyle("width: 21px; height: 20px;")} /></td></tr>
<tr><td align="right" valign="bottom" height="15"><RimoImage src="https://rentalawsbucket.s3.ap-southeast-1.amazonaws.com/rentCar/boocar_email_assets/step-icon-success.png" alt="" className="step-icon-combo-success" width="21" height="20" style={rimoStyle("width: 21px; height: 20px;")} /></td></tr></table></td></tr></table>
<div className="step-text">{text("開始預約車輛")}</div></td></tr></table></td></tr>
<tr><td style={rimoStyle("padding: 24px 0 0 33px;")}><table role="presentation" className="app-panel"><tr><td style={rimoStyle("width: 78px; padding-left: 22px; vertical-align: middle;")}><RimoImage src="https://rentalawsbucket.s3.ap-southeast-1.amazonaws.com/rentCar/boocar_email_assets/icon-app.png" alt="" width="46" height="54" style={rimoStyle("width: 46px; height: 54px;")} /></td>
<td style={rimoStyle("width: 527px; vertical-align: middle;")}><div className="app-title">{text("員工下載boocar ＡＰＰ")}</div>
<div className="app-copy">{text("\n                            員工可下載boocar 公務車預約APP")}
<br />
{text("\n                            隨時隨地預約用車，查看訂單與回報車況\n                          ")}</div></td>
<td style={rimoStyle("width: 183px; vertical-align: middle;")} align="center"><RimoImage src="https://rentalawsbucket.s3.ap-southeast-1.amazonaws.com/rentCar/boocar_email_assets/app-qr.png" alt="boocar APP QR Code" width="95" height="95" style={rimoStyle("width: 95px; height: 95px;")} /></td></tr></table></td></tr>
<tr><td style={rimoStyle("padding-top: 26px;")}><div className="divider"></div></td></tr>
<tr><td style={rimoStyle("padding: 18px 0 24px 30px;")}><table role="presentation" width="818"><tr><td width="374" valign="top"><div style={rimoStyle("font-size: 24px; line-height: 25px; font-weight: 700; color: #111111;")}>{text("Powered by:")}</div>
<RimoImage src="https://rentalawsbucket.s3.ap-southeast-1.amazonaws.com/rentCar/boocar_email_assets/rimo-logo.png" alt="RIMO" width="130" height="35" style={rimoStyle("width: 130px; height: 35px; margin-top: 20px;")} /></td>
<td width="287" valign="middle"><table role="presentation"><tr><td style={rimoStyle("width: 48px; vertical-align: top;")}><RimoImage src="https://rentalawsbucket.s3.ap-southeast-1.amazonaws.com/rentCar/boocar_email_assets/icon-support.png" alt="" width="34" height="34" style={rimoStyle("width: 34px; height: 34px; margin-top: 6px;")} /></td>
<td valign="top"><div className="support-title">{text("需要協助嗎?")}</div>
<div className="support-copy">{text("客服信箱:service@ms.rimo.pro")}</div></td></tr></table></td>
<td width="157" align="right" valign="middle"></td></tr></table></td></tr></table></td></tr></table></td></tr></table></div></RimoRoot>;
}