import { Fragment } from 'react';
import { useRimoModel, rimoEntries } from '../../lib/rimo-model.js';
import { RimoRoot, useRimoEnvironment } from '../../lib/RimoEnvironment.jsx';
import { RimoElement, rimoClass, rimoText } from '../../lib/RimoElements.jsx';
import './email-notification-messages.css';
function createPageState(model) {
  const _document = model.document;
  const window = model.window;
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
      cell: ref,
      derived: computed,
      watch: watch
    } = model;
    const messages = {
      'email-verification-code': {
        channel: 'email',
        kind: 'Email 範本',
        tagType: 'primary',
        previewKind: 'Email／HTML 範本',
        title: '羣組驗證碼通知',
        summary: '會員註冊、重設密碼共用；5 分鐘內有效',
        subject: '主旨：{{tenant_group}} 驗證碼',
        body: '{{tenant_group}} 用戶您好：\n\n這封信是由 {{tenant_group}} 發出，用以處理您的{{verification_purpose}}驗證。\n您的 {{tenant_group}} 驗證碼為 {{verification_code}}。\n\n請在 5 分鐘內按頁面提示提交驗證碼，切勿將驗證碼洩漏給他人。\n\n{{tenant_group}} 敬上',
        footnote: '羣組代碼使用 {{tenant_group}}，Logo 使用 {{group_logo_url}}；{{verification_purpose}} 填入「會員註冊」或「重設密碼」。',
        link: './verification_code_email.html'
      },
      'platform-account': {
        channel: 'email',
        kind: '純文字',
        tagType: 'info',
        previewKind: 'Email／純文字',
        title: 'RIMO 平臺系統帳號開通通知',
        summary: '營運、客服等系統帳號建立通知',
        subject: '主旨：RIMO 平臺系統帳號開通通知',
        body: '親愛的 {{recipient_name}} 您好：\n\n您的 RIMO 平臺系統帳號已建立。\n\n登入網址：{{login_url}}\n羣組代碼：{{group_code}}\n帳號：{{login_account}}\n初始密碼：{{initial_password}}\n\n首次登入後，請立即修改初始密碼。\n如有疑問，請聯繫平臺管理員。',
        footnote: '此為純文字通知內容示意，花括號欄位由系統發送時替換為實際資料。',
        link: ''
      },
      'enterprise-contract': {
        channel: 'email',
        kind: 'Email 範本',
        tagType: 'primary',
        previewKind: 'Email／HTML 範本',
        title: '企業簽約帳號通知',
        summary: '企業管理員帳號與登入資訊',
        subject: '主旨：企業簽約帳號通知',
        body: '此通知使用企業簽約 Email 範本，提供企業管理員登入網址、羣組、帳號及初始密碼等資訊。\n\n完整信件樣式與內容請使用右上方「開啟 Email 原型」。',
        footnote: '此連結會在新分頁開啟同目錄中的企業簽約信件原型。',
        link: './enterprise_contract_notice_email.html'
      },
      'enterprise-branch': {
        channel: 'email',
        kind: 'Email 範本',
        tagType: 'primary',
        previewKind: 'Email／HTML 範本',
        title: '企業分公司管理員帳號通知',
        summary: '分公司管理員帳號與登入資訊',
        subject: '主旨：企業分公司管理員帳號通知',
        body: '此通知使用企業分公司管理員 Email 範本，包含企業與分公司資料，以及管理員登入帳號資訊。\n\n完整信件樣式與內容請使用右上方「開啟 Email 原型」。',
        footnote: '此連結會在新分頁開啟同目錄中的企業分公司管理員信件原型。',
        link: './enterprise_branch_admin_notice_email.html'
      },
      'boocar-account': {
        channel: 'email',
        kind: 'Email 範本',
        tagType: 'primary',
        previewKind: 'Email／HTML 範本',
        title: 'boocar 公務車帳號通知',
        summary: '公務車企業帳號建立通知',
        subject: '主旨：boocar 公務車帳號通知',
        body: '此通知使用 boocar 公務車帳號 Email 範本，提供企業帳號的登入資訊。\n\n完整信件樣式與內容請使用右上方「開啟 Email 原型」。',
        footnote: '此連結會在新分頁開啟同目錄中的 boocar 公務車帳號信件原型。',
        link: './boocar_account_notice_email.html'
      },
      'boocar-branch': {
        channel: 'email',
        kind: 'Email 範本',
        tagType: 'primary',
        previewKind: 'Email／HTML 範本',
        title: 'boocar 分公司帳號通知',
        summary: '公務車分公司管理員帳號建立通知',
        subject: '主旨：boocar 分公司帳號通知',
        body: '此通知使用 boocar 分公司管理員 Email 範本，包含企業、分公司及管理員登入資訊。\n\n完整信件樣式與內容請使用右上方「開啟 Email 原型」。',
        footnote: '此連結會在新分頁開啟同目錄中的 boocar 分公司帳號信件原型。',
        link: './boocar_branch_admin_notice_email.html'
      },
      'signup-code': {
        channel: 'sms',
        kind: '會員註冊',
        tagType: 'warning',
        previewKind: '簡訊／會員註冊',
        title: '註冊驗證碼',
        summary: '公開 APP 手機號碼註冊驗證',
        subject: '用途：公開 APP 手機號碼註冊驗證',
        body: '【RIMO】您的註冊驗證碼為 {{verification_code}}，請勿提供給他人。',
        footnote: '驗證碼由系統產生，實際內容依發送時資料替換。',
        link: ''
      },
      'platform-account-sms': {
        channel: 'sms',
        kind: '系統帳號',
        tagType: 'warning',
        previewKind: '簡訊／系統帳號',
        title: '系統帳號開通提醒',
        summary: '提醒收件人查收帳號資訊與 Email',
        subject: '用途：提醒收件人查收平臺帳號通知',
        body: '【RIMO】{{recipient_name}}您好，您的平臺系統帳號已建立。登入網址：{{login_url}}；羣組代碼：{{group_code}}；帳號：{{login_account}}。初始密碼請查收 Email，首次登入後請立即修改。',
        footnote: '簡訊不傳送初始密碼；初始密碼由 Email 通知。',
        link: ''
      }
    };
    const channel = ref('email');
    const currentId = ref('platform-account');
    const channelMeta = {
      email: {
        note: 'Email 通知範本與純文字帳號通知',
        listTitle: 'Email 通知'
      },
      sms: {
        note: '會員註冊與系統帳號簡訊',
        listTitle: '簡訊通知'
      }
    };
    const channelCounts = computed(() => {
      const counts = {
        email: 0,
        sms: 0
      };
      Object.values(messages).forEach(m => {
        counts[m.channel] += 1;
      });
      return counts;
    });
    const visibleMessages = computed(() => Object.entries(messages).filter(([, m]) => m.channel === channel.value).map(([id, m]) => ({
      id,
      ...m
    })));
    const current = computed(() => messages[currentId.value]);
    watch(channel, () => {
      const first = visibleMessages.value[0];
      if (first) currentId.value = first.id;
    });
    function selectMessage(id) {
      currentId.value = id;
    }
    const themeMode = ref(window.ElementPrototypeTheme ? window.ElementPrototypeTheme.mode : 'auto');
    const themeModeOptions = [{
      label: '跟隨系統',
      value: 'auto'
    }, {
      label: '淺色',
      value: 'light'
    }, {
      label: '深色',
      value: 'dark'
    }];
    function setThemeMode(value) {
      if (window.ElementPrototypeTheme) window.ElementPrototypeTheme.set(value);
      themeMode.value = window.ElementPrototypeTheme ? window.ElementPrototypeTheme.mode : value;
    }
    return {
      channel,
      channelMeta,
      channelCounts,
      visibleMessages,
      currentId,
      current,
      selectMessage,
      themeMode,
      themeModeOptions,
      setThemeMode,
      messages
    };
  }
  return pageSetup();
}
export default function EmailNotificationMessagesBlock() {
  const model = useRimoModel(createPageState);
  const view = model.view;
  const {
    text
  } = useRimoEnvironment();
  return <RimoRoot model={model} pageKey="email-notification-messages" assets={{}}><div data-business-content="" data-rimo-layout="page"><div className="channel-bar"><RimoElement kind="el-radio-group" modelValue={view.channel} onModelChange={value => {
          model.write(["channel"], value);
        }}><RimoElement kind="el-radio-button" value="email">{text("Email（")}{rimoText(view.channelCounts.email)}{text("）")}</RimoElement>
<RimoElement kind="el-radio-button" value="sms">{text("簡訊（")}{rimoText(view.channelCounts.sms)}{text("）")}</RimoElement></RimoElement>
<span className="channel-note">{rimoText(view.channelMeta[view.channel].note)}</span></div>
<div className="notification-workspace"><aside className="notification-list" aria-label="通知訊息清單"><div className="notification-list__heading"><span>{rimoText(view.channelMeta[view.channel].listTitle)}</span>
<span>{rimoText(view.channelCounts[view.channel])}{text(" 則")}</span></div>
{rimoEntries(view.visibleMessages).map(([m], _itemIndex) => <Fragment key={m.id}><div key={m.id} className={rimoClass(["notification-item", rimoClass({
              'is-active': m.id === view.currentId
            })])}><button className="notification-item__select" type="button" onClick={_event => {
                view.selectMessage(m.id);
              }}><RimoElement kind="el-tag" size="small" type={m.tagType}>{rimoText(m.kind)}</RimoElement>
<span className="notification-item__title">{rimoText(m.title)}</span>
<span className="notification-item__summary">{rimoText(m.summary)}</span></button>
{m.link ? <><a className="notification-item__link" href={m.link} target="_blank" rel="noopener">{text("開啟信件原型 ↗")}</a></> : null}</div></Fragment>)}</aside>
<section className="notification-preview" aria-live="polite" aria-labelledby="preview-title"><div className="notification-preview__heading"><div><RimoElement kind="el-tag" size="small" type={view.current.tagType}>{rimoText(view.current.previewKind)}</RimoElement>
<h2 className="notification-preview__title" id="preview-title">{rimoText(view.current.title)}</h2>
<p className="notification-preview__subject">{rimoText(view.current.subject)}</p></div>
{view.current.link ? <><a className="notification-preview__link" href={view.current.link} target="_blank" rel="noopener">{text("開啟 Email 原型 ↗")}</a></> : null}</div>
<pre className="notification-preview__body">{rimoText(view.current.body)}</pre>
<p className="notification-preview__footnote">{rimoText(view.current.footnote)}</p></section></div>
<div className="theme-switch" role="group" aria-label="切換主題"><span className="theme-switch-label">{text("主題")}</span>
<div className="theme-switch-options">{rimoEntries(view.themeModeOptions).map(([option], _itemIndex) => <Fragment key={option.value}><button key={option.value} type="button" className={rimoClass({
              'is-active': view.themeMode === option.value
            })} aria-pressed={view.themeMode === option.value} onClick={_event => {
              view.setThemeMode(option.value);
            }}>{text("\n                    ")}{rimoText(option.label)}{text("\n                  ")}</button></Fragment>)}</div></div></div></RimoRoot>;
}