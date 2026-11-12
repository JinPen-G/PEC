import { useRimoModel } from '../../lib/rimo-model.js';
import { RimoRoot, RimoImage, useRimoEnvironment } from '../../lib/RimoEnvironment.jsx';
import { rimoStyle, rimoText } from '../../lib/RimoElements.jsx';
import './verification-email.css';
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
    "tenant_group": "RIMO Rental",
    "group_logo_url": "",
    "verification_purpose": "會員註冊",
    "verification_code": "083517"
  };
}
export default function VerificationEmailBlock() {
  const model = useRimoModel(createPageState);
  const view = model.view;
  const {
    text
  } = useRimoEnvironment();
  return <RimoRoot model={model} pageKey="verification-email" assets={{}}><div style={rimoStyle("margin: 0; padding: 0; background-color: #ffffff; color: #111111; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang TC', 'PingFang SC', 'Microsoft JhengHei', 'Microsoft YaHei', Arial, sans-serif; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%;")}><table role="presentation" width="100%" cellPadding="0" cellSpacing="0" border="0" bgcolor="#ffffff" style={rimoStyle("width: 100%; background-color: #ffffff;")}><tbody><tr><td align="center" style={rimoStyle("padding: 0;")}><table role="presentation" width="100%" cellPadding="0" cellSpacing="0" border="0" style={rimoStyle("width: 100%; max-width: 680px; margin: 0 auto;")}><tbody><tr><td className="email-padding" style={rimoStyle("padding: 32px 24px 24px;")}><RimoImage src={view.group_logo_url} alt={view.tenant_group} width="190" style={rimoStyle("display: block; width: 190px; max-width: 100%; height: auto; border: 0; color: #00689e; font-size: 24px;")} /></td></tr>
<tr><td className="email-title" bgcolor="#43536a" style={rimoStyle("padding: 20px 24px; background-color: #43536a; color: #ffffff; font-size: 30px; font-weight: 400; line-height: 1.4; overflow-wrap: anywhere; word-break: break-word;")}>{text("\n              ")}{rimoText(view.tenant_group)}{text(" 驗證碼\n            ")}</td></tr>
<tr><td className="email-body" style={rimoStyle("padding: 32px 24px 40px; color: #111111; font-size: 20px; line-height: 1.8; overflow-wrap: anywhere; word-break: break-word;")}><p style={rimoStyle("margin: 0 0 24px;")}>{rimoText(view.tenant_group)}{text(" 用戶您好：")}</p>
<p style={rimoStyle("margin: 0 0 24px;")}>{text("\n                這封信是由 ")}{rimoText(view.tenant_group)}{text(" 發出，用以處理您的")}{rimoText(view.verification_purpose)}{text("驗證。")}
<br />
{text("\n                您的 ")}{rimoText(view.tenant_group)}{text(" 驗證碼為 ")}
<strong className="email-code" style={rimoStyle("color: #00689e; font-size: 38px; font-weight: 600; line-height: 1.4;")}>{rimoText(view.verification_code)}</strong>
{text("。\n              ")}</p>
<p style={rimoStyle("margin: 0 0 40px;")}>{text("請在 5 分鐘內按頁面提示提交驗證碼，切勿將驗證碼洩漏給他人。")}</p>
<p style={rimoStyle("margin: 0;")}>{rimoText(view.tenant_group)}{text(" 敬上")}</p></td></tr></tbody></table></td></tr></tbody></table></div></RimoRoot>;
}