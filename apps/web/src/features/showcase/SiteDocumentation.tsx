/** Read-only site guides use the same original detail/outline layout. They
 * describe viewing and AI access, never expose internal development records. */
import { Link, useLocation } from 'react-router-dom';
import { ArrowUp, ArrowLeft, ArrowRight, FileText, Link2 } from 'lucide-react';
import { useShowcaseText } from './showcase-locale';
import type { LandingPage } from './SiteLanding';
import { SourcePanel } from './SourcePanel';
import { guideContent, siteGuides } from './site-guides';
import { useTocNavigation } from './toc-navigation';
import { TocSelection } from './TocSelection';
import { CONTEXT_TOOLS } from '../../../../../packages/platform-contracts/src/context';

function SectionHeading({
  id,
  title,
  scrollTo,
}: {
  id: string;
  title: string;
  scrollTo: (id: string) => void;
}) {
  return (
    <h2 id={`${id}-title`}>
      <a
        className="library-docs_anchor__0uC_o"
        href={`#${id}`}
        onClick={(event) => {
          event.preventDefault();
          scrollTo(id);
        }}
      >
        {title}
        <Link2 size={13} strokeWidth={1.8} aria-hidden="true" />
      </a>
    </h2>
  );
}

export function SiteDocumentation({ path, pages }: { path: string; pages: LandingPage[] }) {
  const text = useShowcaseText();
  const projectId = new URLSearchParams(useLocation().search).get('project');
  const guidePath = (path: string) =>
    `${path}${projectId ? `?project=${encodeURIComponent(projectId)}` : ''}`;
  const ai = path === '/docs/ai';
  const content = guideContent[path] ?? guideContent['/docs'];
  const guideIndex = Math.max(
    0,
    siteGuides.findIndex((guide) => guide.path === path),
  );
  const title = ai ? 'AI 和 MCP' : siteGuides[guideIndex].title;
  const sections = ai
    ? [
        ['context', '业务上下文'],
        ['connection', '连接 MCP'],
        ['permission', '访问范围'],
      ]
    : content.sections.map((section) => [section.id, section.title]);
  const { active, scrollTo } = useTocNavigation(
    sections.map(([id]) => id),
    150,
  );
  return (
    <main className="page_content__xGn__">
      <div className="docs_docLayout__YK0uB">
        <article className="docs_docMain__jK5Ve showcase-guide">
          <nav className="docs_breadcrumb__JFHCC">
            <Link to={guidePath('/docs')}>{text('文档')}</Link>
            <span>›</span>
            <span>{text(title)}</span>
          </nav>
          <header className="library-docs_hero__Sm4D7">
            <div className="docs_headerCopy__ZDQWU">
              <div className="docs_titleRow__nNp4A">
                <h1>{text(title)}</h1>
              </div>
              <p>{text(ai ? '按项目授权读取业务概况、具体需求与页面关联。' : content.description)}</p>
            </div>
          </header>
          {ai ? (
            <>
              <section className="library-docs_section__WJnkm" id="context" aria-labelledby="context-title">
                <SectionHeading id="context" title={text('业务上下文')} scrollTo={scrollTo} />
                <p>{text('AI 使用管理员签发的只读凭证，按需读取项目概况、需求目录、业务原文与页面关联。')}</p>
                <ul className="docs_notes__6jcWA">
                  {CONTEXT_TOOLS.map((tool) => (
                    <li key={tool.name}>
                      <code>{tool.name}</code>
                    </li>
                  ))}
                </ul>
                <p>
                  {text(
                    '修改功能前，先读取图谱的维护状态，再核对节点依据与变更影响。主题归属不代表业务依赖。',
                  )}
                </p>
              </section>
              <section
                className="library-docs_section__WJnkm"
                id="connection"
                aria-labelledby="connection-title"
              >
                <SectionHeading id="connection" title={text('连接 MCP')} scrollTo={scrollTo} />
                <p>{text('在支持 Streamable HTTP 的客户端中，私下配置管理员签发的项目凭证。')}</p>
                <SourcePanel
                  fileName="mcp.json"
                  source={JSON.stringify(
                    {
                      mcpServers: {
                        preview: {
                          url: `${location.origin}/api/project-context/mcp`,
                          headers: { Authorization: 'Bearer <project-read-only-token>' },
                        },
                      },
                    },
                    null,
                    2,
                  )}
                />
              </section>
              <section
                className="library-docs_section__WJnkm"
                id="permission"
                aria-labelledby="permission-title"
              >
                <SectionHeading id="permission" title={text('访问范围')} scrollTo={scrollTo} />
                <p>
                  {text(
                    '读取范围由后台授权控制。凭证过期或撤销后停止访问；凭证不写入页面网址，不共享管理员密码。',
                  )}
                </p>
              </section>
            </>
          ) : (
            content.sections.map((section) => (
              <section
                className="library-docs_section__WJnkm"
                id={section.id}
                key={section.id}
                aria-labelledby={`${section.id}-title`}
              >
                <SectionHeading id={section.id} title={text(section.title)} scrollTo={scrollTo} />
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph}>{text(paragraph)}</p>
                ))}
                {section.id === 'pages' && (
                  <ul className="showcase-doc-page-list">
                    {pages.map((page) => (
                      <li key={`${page.projectId}/${page.clientId}/${page.pageKey}`}>
                        <Link to={`/pages/${page.projectId}/${page.clientId}/${page.pageKey}`}>
                          <FileText size={15} />
                          {text(page.title)}
                        </Link>
                        <span>{text(page.access === 'public' ? '公开' : '需授权')}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            ))
          )}
          <nav className="docs_pager__7frTG" aria-label={text('文档导航')}>
            {guideIndex > 0 && (
              <Link to={guidePath(siteGuides[guideIndex - 1].path)} className="docs_pagerPrev__1lFr8">
                <ArrowLeft size={16} />
                <span>
                  <small>{text('上一篇')}</small>
                  {text(siteGuides[guideIndex - 1].title)}
                </span>
              </Link>
            )}
            {guideIndex === 0 && <span aria-hidden="true" />}
            {siteGuides[guideIndex + 1] && (
              <Link to={guidePath(siteGuides[guideIndex + 1].path)} className="docs_pagerNext__s5UpM">
                <span>
                  <small>{text('下一篇')}</small>
                  {text(siteGuides[guideIndex + 1].title)}
                </span>
                <ArrowRight size={16} />
              </Link>
            )}
          </nav>
        </article>
        <aside className="docs_tocRail__mVzSm">
          <nav className="docs_toc__4bz2v" aria-label={text('本页目录')}>
            <p className="docs_tocTitle__v_VlL">{text('本页目录')}</p>
            <TocSelection activeKey={active}>
              {sections.map(([id, title]) => (
                <li key={id}>
                  <button aria-current={active === id ? 'location' : undefined} onClick={() => scrollTo(id)}>
                    {text(title)}
                  </button>
                </li>
              ))}
            </TocSelection>
            <div className="docs_tocFooter__8MA86">
              <button
                onClick={() =>
                  window.scrollTo({
                    top: 0,
                    behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
                      ? 'instant'
                      : 'smooth',
                  })
                }
              >
                {text('返回顶部')}
                <ArrowUp size={13} />
              </button>
            </div>
          </nav>
        </aside>
      </div>
    </main>
  );
}
