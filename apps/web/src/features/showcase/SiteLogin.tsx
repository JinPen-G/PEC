/** Mirrored UIARC login presentation; Preview alone owns identity. Provider
 * placeholders cannot launch third-party auth or create an unconfigured account. */
import { useLayoutEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Eye, EyeOff, Layers3, LoaderCircle } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { SiteThemeSwitch } from '@preview/ui';
import { useNativeLoginForm } from '@/features/platform/use-login-form';
import { usePlatformTheme } from '@/features/theme/platform-theme';
import { SiteLanguageMenu } from './SiteLanguageMenu';
import { useShowcaseText } from './showcase-locale';
import { AuthShowcase } from './auth-showcase/AuthShowcase';
import { changeSiteTheme, type ThemeTransitionState } from './site-theme-transition';
import { flushSync } from 'react-dom';
import '../../../../../packages/preview-ui/src/site/uiarc-layout-source.css';
import '../../../../../packages/preview-ui/src/site/site-adapter.css';
import '../../../../../packages/preview-ui/src/site/uiarc-auth-source.css';
import '../../../../../packages/preview-ui/src/site/site-theme-motion.css';
import './site-login.css';

function GoogleLogo() {
  return (
    <svg viewBox="0 0 24 24" width="17" height="17" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.52 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.46a5.52 5.52 0 0 1-2.4 3.62v3h3.88c2.27-2.09 3.58-5.17 3.58-8.81Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.96-1.07 7.94-2.92l-3.88-3c-1.07.72-2.45 1.15-4.06 1.15-3.13 0-5.78-2.11-6.72-4.95H1.27v3.1A12 12 0 0 0 12 24Z"
      />
      <path fill="#FBBC05" d="M5.28 14.28a7.2 7.2 0 0 1 0-4.56v-3.1H1.27a12 12 0 0 0 0 10.76l4.01-3.1Z" />
      <path
        fill="#EA4335"
        d="M12 4.77c1.76 0 3.34.61 4.59 1.8l3.44-3.44A11.94 11.94 0 0 0 12 0 12 12 0 0 0 1.27 6.62l4.01 3.1C6.22 6.88 8.87 4.77 12 4.77Z"
      />
    </svg>
  );
}
export function SiteLogin() {
  const text = useShowcaseText();
  const { resolvedMode, setMode } = usePlatformTheme();
  const form = useNativeLoginForm();
  const [revealed, setRevealed] = useState(false),
    [notice, setNotice] = useState('');
  const reduced = useReducedMotion();
  const themeState = useRef<ThemeTransitionState>({ generation: 0, active: null });
  useLayoutEffect(() => {
    const previous = document.body.dataset.previewView;
    document.body.dataset.previewView = 'showcase';
    return () => {
      if (previous === undefined) delete document.body.dataset.previewView;
      else document.body.dataset.previewView = previous;
    };
  }, []);
  return (
    <div
      className="uiarc-showcase showcase-auth"
      data-theme={resolvedMode === 'dark' ? 'dark' : 'light'}
      data-accent="neutral"
    >
      <main className="auth-shell_page__OGw1f showcase-auth-mirrored">
        <div className="auth-shell_formSide__amNg7">
          <header className="auth-shell_header__eyvd_">
            <Link className="auth-shell_brand___SiRY" to="/">
              <Layers3 size={24} />
              Preview
            </Link>
            <Link className="auth-shell_back__toVKW" to="/pages">
              <ArrowLeft size={16} />
              <span>{text('返回页面库')}</span>
            </Link>
          </header>
          <div className="auth-shell_formBody__hla4i">
            <div className="auth-shell_intro__GtsgU">
              <h1>{text(form.initializing ? '初始化平台管理员' : '登录 Preview')}</h1>
              <p>
                {text(
                  form.initializing
                    ? '本机首次建立管理员，没有预设账号或密码。'
                    : '使用管理员为你创建的账号，查看已授权的页面与需求。',
                )}
              </p>
            </div>
            <div className="auth-flow_card__ZHCAP">
              <div className="auth-flow_step__gU_3q">
                {!form.initializing && (
                  <>
                    <div className="auth-flow_oauth__GmzMo">
                      <button
                        type="button"
                        className="auth-flow_oauthButton__j9hGl"
                        disabled={form.pending}
                        onClick={() => setNotice(text('尚未配置第三方登录，请使用平台账号。'))}
                      >
                        <svg
                          viewBox="0 0 24 24"
                          width={17}
                          height={17}
                          fill="currentColor"
                          aria-hidden="true"
                        >
                          <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
                        </svg>
                        GitHub
                      </button>
                      <button
                        type="button"
                        className="auth-flow_oauthButton__j9hGl"
                        disabled={form.pending}
                        onClick={() => setNotice(text('尚未配置第三方登录，请使用平台账号。'))}
                      >
                        <GoogleLogo />
                        Google
                      </button>
                    </div>
                    <div className="auth-flow_divider__W1tPt">
                      <span>{text('或使用账号')}</span>
                    </div>
                  </>
                )}
                <form className="auth-flow_form__vL863" onSubmit={(event) => void form.submit(event)}>
                  {form.initializing && (
                    <div className="auth-flow_field__n3dZz">
                      <div className="auth-flow_labelRow__oEFTt">
                        <label htmlFor="displayName">{text('显示名称')}</label>
                      </div>
                      <input
                        id="displayName"
                        name="displayName"
                        value={form.displayName}
                        onChange={(event) => form.setDisplayName(event.target.value)}
                        disabled={form.pending}
                        required
                      />
                    </div>
                  )}
                  <div className="auth-flow_field__n3dZz">
                    <div className="auth-flow_labelRow__oEFTt">
                      <label htmlFor="username">{text('账号')}</label>
                    </div>
                    <input
                      id="username"
                      name="username"
                      autoComplete="username"
                      autoFocus
                      value={form.username}
                      onChange={(event) => form.setUsername(event.target.value)}
                      disabled={form.pending}
                      required
                      spellCheck={false}
                    />
                  </div>
                  <div className="auth-flow_field__n3dZz">
                    <div className="auth-flow_labelRow__oEFTt">
                      <label htmlFor="password">{text('密码')}</label>
                      {!form.initializing && (
                        <button
                          type="button"
                          className="auth-flow_linkButton__8ZLXU"
                          onClick={() => setNotice(text('请联系管理员重置密码。'))}
                        >
                          {text('忘记密码？')}
                        </button>
                      )}
                    </div>
                    <div className="auth-flow_passwordWrap__nsur0">
                      <input
                        id="password"
                        name="password"
                        type={revealed ? 'text' : 'password'}
                        autoComplete={form.initializing ? 'new-password' : 'current-password'}
                        minLength={form.initializing ? 8 : undefined}
                        maxLength={128}
                        value={form.password}
                        onChange={(event) => form.setPassword(event.target.value)}
                        disabled={form.pending}
                        required
                      />
                      <button
                        type="button"
                        className="auth-flow_reveal__u_Tg3"
                        aria-label={text(revealed ? '隐藏密码' : '显示密码')}
                        aria-pressed={revealed}
                        onClick={() => setRevealed(!revealed)}
                      >
                        {revealed ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                  <AnimatePresence initial={false}>
                    {form.error && (
                      <motion.p
                        role="alert"
                        className="auth-flow_fieldError__ztXHI"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: reduced ? 0 : 0.16 }}
                      >
                        {form.error}
                      </motion.p>
                    )}
                  </AnimatePresence>
                  <button
                    type="submit"
                    className="auth-flow_submit__vO3Ro"
                    disabled={form.pending}
                    aria-busy={form.pending}
                  >
                    <span className="auth-flow_submitLabel__HgoaD" data-hidden={form.pending || undefined}>
                      {text(form.initializing ? '创建管理员并进入' : '登录')}
                    </span>
                    {form.pending && (
                      <LoaderCircle
                        className="auth-flow_spin__j_9KY auth-flow_submitSpinner__yW_XZ"
                        size={17}
                      />
                    )}
                  </button>
                </form>
              </div>
              {!form.initializing && (
                <p className="auth-flow_switch__buBFh">
                  {text('还没有账号？')}{' '}
                  <button
                    className="showcase-auth-account-link"
                    onClick={() => setNotice(text('账号由管理员创建并授权，请联系管理员。'))}
                  >
                    {text('联系管理员')}
                  </button>
                </p>
              )}
              {notice && (
                <p role="status" className="auth-flow_hint__DGjig showcase-auth-notice">
                  {notice}
                </p>
              )}
            </div>
          </div>
          <footer className="showcase-auth-preferences">
            <SiteLanguageMenu />
            <SiteThemeSwitch
              iconOnly
              label={text('切换深浅色')}
              theme={resolvedMode === 'dark' ? 'dark' : 'light'}
              onThemeChange={(next) =>
                changeSiteTheme({
                  document,
                  state: themeState.current,
                  update: () => flushSync(() => setMode(next === 'dark' ? 'dark' : 'glass')),
                  reduced: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
                  wipe: 'split',
                })
              }
            />
          </footer>
        </div>
        <aside className="auth-shell_panel__bS1g_" aria-label={text('交互组件展示')}>
          <AuthShowcase />
        </aside>
      </main>
    </div>
  );
}
