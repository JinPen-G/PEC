/** Frontend-only login preview in the original Rental OS frame/controls. */
import { useState, type FormEvent } from 'react';
import { AppleOutlined, GoogleOutlined, WechatOutlined } from '@ant-design/icons';
import {
  BrandIcon,
  Button,
  LoginFrame,
  LoginInput,
  PasswordField,
  SegmentedControl,
  ThemeSwitch,
} from '@preview/ui';
import loginStyles from '../../../../../packages/preview-ui/upstream/rental-admin/packages/ui-primitives/vendor/registry/blocks/login-centered/login-centered.module.css';
import { usePlatformTheme } from '@/features/theme/platform-theme';
import { usePlatformLocale } from '@/features/locale/platform-locale';
import { saveDemoSession, type DemoSession } from './demo-session';

export function DemoLogin({ onLogin }: { onLogin: (session: DemoSession) => void }) {
  const { locale, setLocale } = usePlatformLocale();
  const { resolvedMode, setMode } = usePlatformTheme();
  const text = (hans: string, hant: string, en: string) =>
    locale === 'en' ? en : locale === 'zh-Hant' ? hant : hans;
  const [account, setAccount] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [method, setMethod] = useState('password');
  const [provider, setProvider] = useState('');
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPassword('');
    setCode('');
    onLogin(saveDemoSession(account));
  };
  const changeMethod = (value: string) => {
    setPassword('');
    setCode('');
    setProvider('');
    setMethod(value);
  };
  const brand = (
    <span className="preview-login-wordmark">
      <BrandIcon size={36} />
      <span>Preview</span>
    </span>
  );
  return (
    <LoginFrame
      brand={brand}
      title={text(
        '原型与文档，\n在一个工作空间。',
        '原型與文件，\n在一個工作空間。',
        'Prototypes and documents.\nOne workspace.',
      )}
      description={text(
        '以统一的界面组织项目，\n查看不同客户端的原型。\n\n演示与说明文档，随时一起查看。',
        '以統一的介面組織專案，\n查看不同用戶端的原型。\n\n演示與說明文件，隨時一起查看。',
        'Organize projects in one interface.\nExplore each client prototype.\n\nKeep the demonstration and its guide together.',
      )}
      highlights={[
        {
          title: text('项目工作台', '專案工作台', 'Workspace'),
          description: text('集中组织原型', '集中組織原型', 'Organize prototypes'),
        },
        {
          title: text('原生页面', '原生頁面', 'Native pages'),
          description: text('统一交互与主题', '統一互動與主題', 'Shared interactions'),
        },
        {
          title: text('文档中心', '文件中心', 'Documents'),
          description: text('随演示查看说明', '隨演示查看說明', 'Read alongside demos'),
        },
      ]}
      footer={text('Preview · 原型管理平台', 'Preview · 原型管理平台', 'Preview · Prototype workspace')}
      appearance={
        <>
          <div className="language-toggle" role="group" aria-label={text('切换语言', '切換語言', 'Language')}>
            <button type="button" aria-pressed={locale !== 'en'} onClick={() => setLocale('zh-Hans')}>
              中
            </button>
            <button type="button" aria-pressed={locale === 'en'} onClick={() => setLocale('en')}>
              EN
            </button>
          </div>
          <span className="sider-link-switch">
            <ThemeSwitch
              theme={resolvedMode === 'dark' ? 'dark' : 'light'}
              variant="eclipse"
              iconOnly
              label={text('切换外观主题', '切換外觀主題', 'Switch theme')}
              onThemeChange={(next) => setMode(next === 'dark' ? 'dark' : 'glass')}
            />
          </span>
        </>
      }
    >
      <div className="login-panel-heading">
        <h2>{text('登录 Preview', '登入 Preview', 'Sign in to Preview')}</h2>
        <p>
          {text(
            '使用账号进入你的项目工作台。',
            '使用帳號進入你的專案工作台。',
            'Sign in to your project workspace.',
          )}
        </p>
      </div>
      {method !== 'reset' && (
        <div className="login-methods">
          <SegmentedControl
            label={text('登录方式', '登入方式', 'Sign-in method')}
            value={method}
            onValueChange={changeMethod}
            options={[
              { value: 'password', label: text('账号密码', '帳號密碼', 'Password') },
              { value: 'code', label: text('验证码', '驗證碼', 'Code') },
            ]}
          />
        </div>
      )}
      {method === 'reset' ? (
        <div className="login-code-preview">
          <p>
            {text(
              '当前为 UI 预览，账号和密码任意填写即可进入，暂不修改账号密码。',
              '目前為 UI 預覽，帳號和密碼任意填寫即可進入，暫不修改帳號密碼。',
              'UI preview: use any account and password. Account passwords are not changed.',
            )}
          </p>
          <Button variant="secondary" onClick={() => changeMethod('password')}>
            {text('返回账号登录', '返回帳號登入', 'Back to sign in')}
          </Button>
        </div>
      ) : (
        <>
          <form className="preview-login-fields" onSubmit={submit}>
            <LoginInput
              label={text('账号', '帳號', 'Account')}
              id="preview-account"
              name="account"
              autoComplete="username"
              autoFocus
              value={account}
              required
              onChange={(event) => setAccount(event.target.value)}
            />
            {method === 'password' ? (
              <PasswordField
                label={text('密码', '密碼', 'Password')}
                id="preview-password"
                name="password"
                autoComplete="off"
                value={password}
                required
                onChange={(event) => setPassword(event.target.value)}
              />
            ) : (
              <LoginInput
                label={text('验证码', '驗證碼', 'Code')}
                id="preview-code"
                name="code"
                inputMode="numeric"
                autoComplete="off"
                value={code}
                required
                onChange={(event) => setCode(event.target.value)}
              />
            )}
            <Button type="submit" className="login-submit">
              {text('进入平台', '進入平台', 'Enter platform')}
            </Button>
          </form>
          <div className="login-preview-links">
            <Button type="button" variant="ghost" size="sm" onClick={() => changeMethod('reset')}>
              {text('忘记密码？', '忘記密碼？', 'Forgot password?')}
            </Button>
          </div>
          <div className="login-provider-preview">
            <div className={loginStyles.divider}>
              {text('其他登录方式（预览）', '其他登入方式（預覽）', 'Other sign-in options (preview)')}
            </div>
            <div className={loginStyles.sso}>
              {[
                { name: 'Google', icon: <GoogleOutlined /> },
                { name: 'Apple', icon: <AppleOutlined /> },
                { name: text('微信', '微信', 'WeChat'), icon: <WechatOutlined /> },
              ].map((item) => (
                <Button
                  variant="secondary"
                  aria-label={item.name}
                  className={loginStyles.ssoButton}
                  key={item.name}
                  onClick={() => setProvider(item.name)}
                >
                  {item.icon}
                  {item.name}
                </Button>
              ))}
            </div>
            {provider && (
              <p role="status" className="preview-login-hint">
                {provider} ·{' '}
                {text(
                  '仅展示登录方式，尚未接入第三方授权。',
                  '僅展示登入方式，尚未接入第三方授權。',
                  'Sign-in preview; external authorization is not connected.',
                )}
              </p>
            )}
          </div>
          <p className="preview-login-hint">
            {method === 'password'
              ? text(
                  '当前为 UI 预览，账号和密码任意填写即可进入。',
                  '目前為 UI 預覽，帳號和密碼任意填寫即可進入。',
                  'UI preview: enter any account and password to continue.',
                )
              : text(
                  '当前为 UI 预览，账号和验证码任意填写即可进入，不发送短信或邮件。',
                  '目前為 UI 預覽，帳號和驗證碼任意填寫即可進入，不發送簡訊或郵件。',
                  'UI preview: enter any account and code. No messages are sent.',
                )}
          </p>
        </>
      )}
    </LoginFrame>
  );
}
