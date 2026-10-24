import type { CSSProperties } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { useProjectManifest } from '@/data/use-platform-data';
import { DEFAULT_PROJECT_THEME } from '@/features/projects/project-config-model';
import { findProject } from '@/features/projects/project-model';
import { platformApi } from '@/data/platform-api';
import { Button, Result, Spin, Typography } from '@/ui/ant';
import { ThemeControl } from '@/ui/platform/ThemeControl';
import { LanguageControl } from '@/ui/platform/LanguageControl';

const { Text } = Typography;

export function ProjectMobilePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { projectId = '' } = useParams();
  const projectQuery = useProjectManifest();
  const project = findProject(projectQuery.data?.projects ?? [], projectId);

  if (projectQuery.isPending)
    return (
      <div className="home-loading">
        <Spin size="large" />
      </div>
    );
  if (!project || project.homepage?.visible === false)
    return <Navigate to={`/unavailable/${projectId}`} replace />;

  const mobileEntry = project.mobile?.enabled && project.mobile.entry ? project.mobile.entry : '';
  if (mobileEntry) {
    const mobileUrl = platformApi.getProjectAssetUrl(projectId, mobileEntry);
    return (
      <main
        className="mobile-preview-page"
        style={{ '--project-accent': project.theme?.primary || DEFAULT_PROJECT_THEME.primary } as CSSProperties}
      >
        <header className="mobile-preview-header">
          <div>
            <strong>{project.name}</strong>
            <Text type="secondary">{t('home.mobile.badge')}</Text>
          </div>
          <div className="mobile-preview-actions">
            <ThemeControl />
            <LanguageControl/>
            <Button type="text" onClick={() => navigate('/')}>
              {t('home.mobile.backHome')}
            </Button>
          </div>
        </header>
        <iframe
          className="mobile-preview-frame"
          src={mobileUrl}
          title={t('home.mobile.frameTitle', { project: project.name })}
          referrerPolicy="same-origin"
          onLoad={(event) => {
            try {
              const root = event.currentTarget.contentDocument?.documentElement;
              root?.style.setProperty('--brand', project.theme?.primary || DEFAULT_PROJECT_THEME.primary);
              root?.style.setProperty('--app-color-primary', project.theme?.primary || DEFAULT_PROJECT_THEME.primary);
            } catch {
              // 同源項目資源會同步主題，未來跨域時保持原頁面樣式。
            }
          }}
        />
      </main>
    );
  }

  return (
    <main className="system-result-page">
      <Result
        status="404"
        title={t('home.mobile.disabledTitle')}
        subTitle={t('home.mobile.disabledDescription')}
        extra={
          <Button type="primary" onClick={() => navigate('/')}>
            {t('home.mobile.backHome')}
          </Button>
        }
      />
    </main>
  );
}
