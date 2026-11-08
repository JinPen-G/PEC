/** The original site's month/date/chip structure with Preview's public
 * changes; no internal notes or server filesystem are queried. */
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import { siteMotionTokens } from '@preview/ui';
import { SITE_CHANGELOG } from './site-changelog';
import { useShowcaseText } from './showcase-locale';
import { usePlatformLocale } from '@/features/locale/platform-locale';
export function SiteChangelog() {
  const text = useShowcaseText(),
    reduced = useReducedMotion();
  const { locale } = usePlatformLocale();
  const months = [...new Set(SITE_CHANGELOG.map((entry) => entry.date.slice(0, 7)))];
  const monthTitle = (month: string) =>
    new Intl.DateTimeFormat(locale, { year: 'numeric', month: 'long', timeZone: 'Asia/Shanghai' }).format(
      new Date(`${month}-01T00:00:00+08:00`),
    );
  return (
    <main className="page_content__xGn__">
      <div className="docs_docLayout__YK0uB">
        <article className="docs_docMain__jK5Ve">
          <motion.nav
            className="docs_breadcrumb__JFHCC"
            initial={reduced ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reduced ? 0 : 0.24, ease: [...siteMotionTokens.ease.enter] }}
          >
            <Link to="/docs">{text('文档')}</Link>
            <ChevronRight size={13} />
            <span>{text('更新日志')}</span>
          </motion.nav>
          <header className="library-docs_hero__Sm4D7">
            <h1>{text('更新日志')}</h1>
            <p>{text('原型页面、功能说明与网站交互的更新。')}</p>
          </header>
          <div className="library-docs_body__P7yx7">
            {months.map((month) => (
              <section key={month} className="library-docs_section__WJnkm" id={`month-${month}`}>
                <h2>{monthTitle(month)}</h2>
                {SITE_CHANGELOG.filter((entry) => entry.date.startsWith(month)).map((entry) => (
                  <div key={entry.date}>
                    <h3 className="library-docs_subhead__l9zJy">
                      <time dateTime={entry.date}>
                        {new Intl.DateTimeFormat(locale, {
                          month: 'long',
                          day: 'numeric',
                          weekday: 'long',
                          timeZone: 'Asia/Shanghai',
                        }).format(new Date(`${entry.date}T00:00:00+08:00`))}
                      </time>
                    </h3>
                    <div className="library-docs_chips__mbgOf">
                      {entry.changes.map((change) =>
                        change.href ? (
                          <Link key={change.title} to={change.href}>
                            {text(change.title)}
                            {'restricted' in change && change.restricted && (
                              <span className="pro-badge_badge__4HMgK">{text('授权')}</span>
                            )}
                          </Link>
                        ) : (
                          <span key={change.title} className="showcase-change-chip">
                            {text(change.title)}
                          </span>
                        ),
                      )}
                    </div>
                    <ul className="showcase-release-summary">
                      {entry.changes.map((change) => (
                        <li key={change.title}>{text(change.description)}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </section>
            ))}
          </div>
        </article>
        <aside className="docs_tocRail__mVzSm">
          <nav className="docs_toc__4bz2v" aria-label={text('本页目录')}>
            <p className="docs_tocTitle__v_VlL">{text('本页目录')}</p>
            <ul>
              {months.map((month) => (
                <li key={month}>
                  <button
                    onClick={() =>
                      document
                        .getElementById(`month-${month}`)
                        ?.scrollIntoView({ behavior: reduced ? 'instant' : 'smooth', block: 'start' })
                    }
                  >
                    {monthTitle(month)}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </aside>
      </div>
    </main>
  );
}
