import { useCallback, useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowUp, ArrowLeft, ArrowRight, RefreshCw } from 'lucide-react';
import { LoadingStage } from '@preview/ui/loading';
import type { MarkdownHeading } from '@/features/docs/markdown';
import { useShowcaseText } from './showcase-locale';
import { GuideBody } from './GuideBody';
import { PLATFORM_GUIDES } from '../../../../../packages/project-shared/src/platform-docs';
import { siteGuides } from './site-guides';
import { useProjectGuides } from './project-guide-query';
import { useTocNavigation } from './toc-navigation';
import { TocSelection } from './TocSelection';
import type { CatalogPage } from './showcase-catalog';

export function SiteDocumentation({
  path,
  projectId,
  pages,
  projectGuide,
}: {
  path: string;
  projectId: string;
  pages: CatalogPage[];
  projectGuide?: 'introduction' | 'changelog';
}) {
  const text = useShowcaseText();
  const location = useLocation();
  const query = useProjectGuides(projectGuide ? projectId : '');
  const guideIndex = Math.max(
    0,
    siteGuides.findIndex((item) => item.path === path),
  );
  const navigation = projectGuide
    ? { id: projectGuide, title: projectGuide === 'changelog' ? '更新记录' : '项目介绍', path }
    : siteGuides[guideIndex];
  const catalog = projectGuide ? (query.isError ? undefined : query.data) : undefined;
  const guides = projectGuide ? catalog?.guides : PLATFORM_GUIDES;
  useEffect(() => {
    document.title = [text(navigation.title), catalog?.projectName, 'Preview'].filter(Boolean).join(' · ');
  }, [navigation.title, catalog?.projectName, text]);
  const guide = guides?.find((item) => item.id === navigation.id);
  const restricted = catalog?.restrictedGuideIds?.some((identifier) => identifier === navigation.id);
  const [headings, setHeadings] = useState<MarkdownHeading[]>([]);
  const updateHeadings = useCallback(
    (next: MarkdownHeading[]) =>
      setHeadings((previous) =>
        previous.length === next.length &&
        previous.every((heading, index) => heading.id === next[index].id && heading.text === next[index].text)
          ? previous
          : next,
      ),
    [],
  );
  const sectionIds = headings.filter((heading) => heading.level <= 2).map((heading) => heading.id);
  const { active, scrollTo } = useTocNavigation(sectionIds, 150);
  const guidePath = useCallback(
    (pathname: string, anchor?: string) =>
      `${pathname}${anchor ? `?${new URLSearchParams({ anchor })}` : ''}`,
    [],
  );
  const resolveDocumentUrl = useCallback(
    (file: string, anchor?: string) => {
      const target = guides?.find((item) => item.path === file);
      const route = siteGuides.find((item) => item.id === target?.id);
      if (projectGuide && (target?.id === 'changelog' || target?.id === 'introduction'))
        return `#/docs/projects/${projectId}${target.id === 'changelog' ? '/changelog' : ''}${anchor ? `?${new URLSearchParams({ anchor })}` : ''}`;
      return route ? `#${guidePath(route.path, anchor)}` : '#';
    },
    [guides, guidePath, projectGuide, projectId],
  );
  const firstPage = pages.find((page) => page.projectId === projectId && page.allowed);
  return (
    <main className="page_content__xGn__">
      <div className="docs_docLayout__YK0uB">
        <article className="docs_docMain__jK5Ve showcase-guide">
          <nav className="docs_breadcrumb__JFHCC" aria-label={text('文档')}>
            <Link to={guidePath('/docs')}>{text('文档')}</Link>
            <span aria-hidden="true">›</span>
            <span aria-current="page">{text(navigation.title)}</span>
          </nav>
          <header className="library-docs_hero__Sm4D7">
            <div className="docs_headerCopy__ZDQWU">
              <div className="docs_titleRow__nNp4A">
                <h1>{text(navigation.title)}</h1>
              </div>
              {guide && <p data-preserve-language>{guide.description}</p>}
            </div>
          </header>
          {projectGuide && !projectId ? (
            <p>{text('尚未配置项目')}</p>
          ) : projectGuide && query.isPending ? (
            <LoadingStage label={text('读取项目指南…')} />
          ) : projectGuide && query.isError ? (
            <div className="showcase-error" role="alert">
              <p>{text('项目指南读取失败')}</p>
              <p>{query.error.message}</p>
              <button className="showcase-button" type="button" onClick={() => void query.refetch()}>
                <RefreshCw size={14} />
                {text('重试')}
              </button>
            </div>
          ) : !guide && restricted ? (
            <div className="showcase-muted" role="alert">
              <p>{text('此指南需要项目授权。')}</p>
              <p>{text('请联系管理员获取当前项目的资料访问权限。')}</p>
            </div>
          ) : !guide ? (
            <div className="showcase-muted" role="status">
              <p>{text('此项目尚未发布这篇指南。')}</p>
              {firstPage && (
                <Link to={`/pages/${firstPage.projectId}/${firstPage.clientId}/${firstPage.pageKey}`}>
                  {text('浏览当前项目')}
                </Link>
              )}
            </div>
          ) : (
            <div className="library-docs_body__P7yx7" data-preserve-language>
              <GuideBody
                source={guide.markdown}
                documentPath={guide.path}
                projectId={projectId}
                resolveDocumentUrl={resolveDocumentUrl}
                onHeadings={updateHeadings}
                activeAnchor={new URLSearchParams(location.search).get('anchor') ?? undefined}
              />
            </div>
          )}
          {!projectGuide && (
            <nav className="docs_pager__7frTG" aria-label={text('文档导航')}>
              {guideIndex > 0 ? (
                <Link className="docs_pagerPrev__1lFr8" to={guidePath(siteGuides[guideIndex - 1].path)}>
                  <ArrowLeft size={16} />
                  <span>
                    <small>{text('上一篇')}</small>
                    {text(siteGuides[guideIndex - 1].title)}
                  </span>
                </Link>
              ) : (
                <span aria-hidden="true" />
              )}
              {siteGuides[guideIndex + 1] && (
                <Link className="docs_pagerNext__s5UpM" to={guidePath(siteGuides[guideIndex + 1].path)}>
                  <span>
                    <small>{text('下一篇')}</small>
                    {text(siteGuides[guideIndex + 1].title)}
                  </span>
                  <ArrowRight size={16} />
                </Link>
              )}
            </nav>
          )}
        </article>
        <aside className="docs_tocRail__mVzSm">
          <nav aria-label={text('本页目录')} className="docs_toc__4bz2v">
            <p className="docs_tocTitle__v_VlL">{text('本页目录')}</p>
            <TocSelection activeKey={active}>
              {headings
                .filter((heading) => heading.level <= 2)
                .map((heading) => (
                  <li key={heading.id}>
                    <button
                      type="button"
                      data-toc-key={heading.id}
                      aria-current={active === heading.id ? 'location' : undefined}
                      onClick={() => scrollTo(heading.id)}
                    >
                      {heading.text}
                    </button>
                  </li>
                ))}
            </TocSelection>
            <div className="docs_tocFooter__8MA86">
              <button
                type="button"
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
