import { Link } from 'react-router-dom';
import type { CatalogPage, ShowcaseProject } from './showcase-catalog';
import { catalogKind, catalogPageQualifier, catalogPageTitle } from './catalog-sections';
import { SidebarSection } from './SidebarSection';
import { LocalizedView, useShowcaseText } from './showcase-locale';

export function ProjectScreens({ projects, pages, visible, projectId, activeKey, filter, onVisit }: {
  projects: ShowcaseProject[];
  pages: CatalogPage[];
  visible: CatalogPage[];
  projectId: string;
  activeKey: string;
  filter: string;
  onVisit: () => void;
}) {
  const text = useShowcaseText();
  const screens = pages.filter((page) => catalogKind(page) === 'page');
  return projects.map((project) => {
    const projectPages = screens.filter((page) => page.projectId === project.id);
    if (!projectPages.length) return null;
    const rows = visible.filter((page) => page.projectId === project.id);
    const graphPath = `/docs/graph?project=${encodeURIComponent(project.id)}`;
    const showGraph = projectPages.some((page) => page.allowed) &&
      `${project.name} 关系图谱 知识图谱 需求图谱 ${text('关系图谱')} ${text('需求关系图谱')}`
        .toLowerCase().includes(filter.trim().toLowerCase());
    if (!rows.length && !showGraph) return null;
    const active = activeKey === graphPath || rows.some((page) =>
      activeKey === `/pages/${page.projectId}/${page.clientId}/${page.pageKey}`,
    );
    return (
      <LocalizedView key={project.id}><div data-screen-project={project.id}>
        <SidebarSection group title={project.name} count={rows.length}
          activeKey={active ? activeKey : ''} defaultOpen={project.id === projectId} forceOpen={Boolean(filter)}>
          <div className="library-sidebar_rows__muylU">
            {showGraph && (
              <Link className="library-sidebar_row__aE5SY showcase-project-graph" to={graphPath}
                data-sidebar-key={graphPath} aria-current={activeKey === graphPath ? 'page' : undefined}
                onClick={onVisit}>
                <span className="library-sidebar_label__EP9jR">关系图谱</span>
              </Link>
            )}
            {showGraph && rows.length > 0 && <hr className="showcase-project-divider" />}
            {rows.map((page) => {
              const path = `/pages/${page.projectId}/${page.clientId}/${page.pageKey}`;
              const qualifier = catalogPageQualifier(page, projectPages);
              return (
                <Link key={path} to={path} onClick={onVisit} className="library-sidebar_row__aE5SY"
                  data-sidebar-key={path} aria-current={activeKey === path ? 'page' : undefined}>
                  <span className="library-sidebar_label__EP9jR">{catalogPageTitle(page)}</span>
                  {qualifier && <> <small className="showcase-page-qualifier">{qualifier}</small></>}
                  {page.access === 'restricted' && <span className="library-sidebar_pro__c08K_">授权</span>}
                </Link>
              );
            })}
          </div>
        </SidebarSection>
      </div></LocalizedView>
    );
  });
}
