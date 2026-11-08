/** Compact upstream account geometry with Preview's real session actions. */
import { lazy, Suspense, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import * as Dropdown from '@radix-ui/react-dropdown-menu';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { LayoutGrid, LogOut, KeyRound, ShieldCheck, UserRound } from 'lucide-react';
import { siteMotionTokens } from '@preview/ui';
import { useNativeAuth } from '@/features/platform/platform-api';
import { useShowcaseText } from './showcase-locale';
const PasswordForm = lazy(() =>
  import('@/features/platform/PasswordForm').then((module) => ({ default: module.PasswordForm })),
);
import styles from '../../../../../packages/preview-ui/src/site/account-menu-source.module.css';
import './site-account-menu.css';

export function SiteAccountMenu() {
  const { session, logout } = useNativeAuth();
  const user = session?.user;
  const text = useShowcaseText(),
    navigate = useNavigate(),
    reduced = useReducedMotion();
  const [open, setOpen] = useState(false),
    [password, setPassword] = useState(false),
    [pending, setPending] = useState(false),
    [error, setError] = useState('');
  const [container, setContainer] = useState<HTMLDivElement | null>(null);
  if (!user) return null;
  const face = (
    <span className={styles.face} data-size="sm">
      <span className={`${styles.portrait} ${styles.initials}`}>
        <UserRound size={17} strokeWidth={1.8} />
      </span>
    </span>
  );
  return (
    <>
      <div ref={setContainer} className="showcase-menu-portal" />
      <Dropdown.Root open={open} onOpenChange={setOpen} modal={false}>
        <Dropdown.Trigger
          className={`${styles.trigger} showcase-account-trigger`}
          aria-label={`${text('用户菜单')} · ${user.displayName}`}
        >
          {face}
        </Dropdown.Trigger>
        <AnimatePresence>
          {open && (
            <Dropdown.Portal forceMount container={container}>
              <Dropdown.Content asChild forceMount align="end" sideOffset={8} collisionPadding={12}>
                <motion.div
                  className={`${styles.panel} showcase-account-panel`}
                  initial={reduced ? false : { opacity: 0, y: -4, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: reduced ? 0 : -2, scale: reduced ? 1 : 0.97 }}
                  transition={
                    reduced
                      ? { duration: 0 }
                      : {
                          ...siteMotionTokens.spring.snappy,
                          opacity: { duration: siteMotionTokens.duration.fast },
                        }
                  }
                >
                  <div className={styles.header}>
                    {face}
                    <div className={styles.identity}>
                      <div className={styles.nameRow}>
                        <span className={styles.name}>{user.displayName}</span>
                        <span className={styles.plan}>{text(user.role === 'admin' ? '管理员' : '成员')}</span>
                      </div>
                      <span className={styles.email}>@{user.username}</span>
                    </div>
                  </div>
                  <Dropdown.Separator className={styles.separator} />
                  <Dropdown.Item asChild>
                    <Link
                      to={user.role === 'admin' ? '/manage/projects' : '/projects'}
                      className="showcase-account-item"
                    >
                      <span className={styles.icon}>
                        {user.role === 'admin' ? <ShieldCheck size={16} /> : <LayoutGrid size={16} />}
                      </span>
                      {text(user.role === 'admin' ? '管理后台' : '我的项目')}
                    </Link>
                  </Dropdown.Item>
                  <Dropdown.Item className="showcase-account-item" onSelect={() => setPassword(true)}>
                    <span className={styles.icon}>
                      <KeyRound size={16} />
                    </span>
                    {text('修改密码')}
                  </Dropdown.Item>
                  <Dropdown.Separator className={styles.separator} />
                  <Dropdown.Item
                    disabled={pending}
                    className="showcase-account-item"
                    onSelect={(event) => {
                      event.preventDefault();
                      setPending(true);
                      setError('');
                      void logout()
                        .then(
                          () => {
                            setOpen(false);
                            navigate('/login', { replace: true });
                          },
                          (err) => setError(err instanceof Error ? err.message : text('退出失败')),
                        )
                        .finally(() => setPending(false));
                    }}
                  >
                    <span className={styles.icon}>
                      <LogOut size={16} />
                    </span>
                    {text(pending ? '正在退出…' : '退出登录')}
                  </Dropdown.Item>
                  {error && (
                    <p role="alert" className="showcase-error">
                      {error}
                    </p>
                  )}
                </motion.div>
              </Dropdown.Content>
            </Dropdown.Portal>
          )}
        </AnimatePresence>
      </Dropdown.Root>
      {password && (
        <Suspense fallback={null}>
          <PasswordForm onClose={() => setPassword(false)} />
        </Suspense>
      )}
    </>
  );
}
