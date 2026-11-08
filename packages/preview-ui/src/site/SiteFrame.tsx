/** Site shell using the observed UIARC layout classes. Business content and
 * authorization remain in the application, not in the shared frame. */
import type { ReactNode, CSSProperties } from 'react';
import './uiarc-layout-source.css';
import './site-adapter.css';
import './site-theme-motion.css';

export function SiteFrame({
  header,
  sidebar,
  children,
  dark = false,
  accent = 'neutral',
  themeColor = '',
  landing = false,
  announcement,
}: {
  header: ReactNode;
  sidebar?: ReactNode;
  children: ReactNode;
  dark?: boolean;
  accent?: string;
  themeColor?: string;
  landing?: boolean;
  announcement?: ReactNode;
}) {
  return (
    <div
      className="uiarc-showcase page_library__ciZWi"
      data-theme={dark ? 'dark' : 'light'}
      data-accent={accent}
      style={
        {
          '--app-color-primary': themeColor || 'var(--accent)',
          '--rimo-primary': themeColor || 'var(--accent)',
          '--transfer-primary': themeColor || 'var(--accent)',
        } as CSSProperties
      }
    >
      <header className={landing ? 'site-nav_header__QlWbZ' : 'page_topbar__M72hL'}>
        {landing && announcement && (
          <div className="site-nav_announcement__svFAk">
            <div className="site-nav_announcementInner__bvP1N">{announcement}</div>
          </div>
        )}
        <div className={landing ? 'site-nav_headerInner__u9LL9' : 'page_topbarInner__EzU0U'}>{header}</div>
      </header>
      <div className={sidebar ? 'page_layout__FXD_P' : 'showcase-site-full'}>
        {sidebar && (
          <aside className="library-sidebar_aside__fjR21" aria-label="项目页面导航">
            {sidebar}
          </aside>
        )}
        {children}
      </div>
    </div>
  );
}
