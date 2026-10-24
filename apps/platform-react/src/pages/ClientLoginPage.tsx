import { useMemo, type CSSProperties } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { useHtmlPageCatalog, useProjectManifest } from '@/data/use-platform-data';
import {
  findClient,
  findProject,
  getClientPages,
  getClientRuntimeStatus,
  getDefaultPage,
} from '@/features/projects/project-model';
import { DEFAULT_PROJECT_THEME } from '@/features/projects/project-config-model';
import { Alert, Button, Card, ConfigProvider, Form, Input, Spin, Typography } from '@/ui/ant';
import { PlatformBrand } from '@/ui/platform/PlatformBrand';
import { ThemeControl } from '@/ui/platform/ThemeControl';
import { LanguageControl } from '@/ui/platform/LanguageControl';

const { Text, Title } = Typography;

export function ClientLoginPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { projectId = '', clientId = '' } = useParams();
  const projectQuery = useProjectManifest();
  const catalogQuery = useHtmlPageCatalog();
  const project = useMemo(
    () => findProject(projectQuery.data?.projects ?? [], projectId),
    [projectId, projectQuery.data],
  );
  const client = findClient(project, clientId);
  const pages = getClientPages(catalogQuery.data, projectId, clientId);

  if (projectQuery.isPending || catalogQuery.isPending)
    return (
      <div className="home-loading">
        <Spin size="large" />
      </div>
    );
  if (!project || project.homepage?.visible === false || !client)
    return <Navigate to={`/unavailable/${projectId}`} replace />;
  const runtimeStatus = getClientRuntimeStatus(project, clientId, pages);
  if (client.entry?.mode !== 'platform-login') {
    const page = getDefaultPage(client, pages);
    return (
      <Navigate
        to={page ? `/p/${projectId}/${clientId}/${page.path}` : `/p/${projectId}/${clientId}`}
        replace
      />
    );
  }

  const enterClient = () => {
    const page = getDefaultPage(client, pages);
    navigate(page ? `/p/${projectId}/${clientId}/${page.path}` : `/p/${projectId}/${clientId}`);
  };

  const accent = project.theme?.primary || DEFAULT_PROJECT_THEME.primary;
  return (
    <ConfigProvider theme={{ token: { colorPrimary: accent, colorInfo: accent } }}>
      <main className="client-login" style={{ '--project-accent': accent } as CSSProperties}>
        <header className="client-login__header">
          <Button className="client-login__brand" type="text" onClick={() => navigate('/')}>
            <span className="client-login__brand-mark" aria-hidden="true">
              <PlatformBrand variant="mark" alt="" />
            </span>
            <div>
              <strong>{project.name}</strong>
              <small>{client.name}</small>
            </div>
          </Button>
          <ThemeControl showLabel />
          <LanguageControl/>
        </header>
        <div className="client-login__body">
          <Card className="client-login__card">
            <Text className="home-kicker">{project.shortName || project.name}</Text>
            <Title level={2}>{client.name}</Title>
            <Text type="secondary">{client.description || t('home.login.fallbackDescription')}</Text>
            {runtimeStatus.state === 'index-missing' || runtimeStatus.state === 'empty' ? (
              <Alert
                showIcon
                type={runtimeStatus.state === 'index-missing' ? 'error' : 'info'}
                title={
                  runtimeStatus.state === 'index-missing'
                    ? t('home.login.indexErrorTitle')
                    : t('home.login.emptyTitle')
                }
                description={t('home.login.indexErrorDescription')}
              />
            ) : (
              <Form layout="vertical" onFinish={enterClient} initialValues={{ account: 'admin' }}>
                <Form.Item
                  label={t('home.login.account')}
                  name="account"
                  rules={[{ required: true, message: t('home.login.accountRequired') }]}
                >
                  <Input />
                </Form.Item>
                <Form.Item
                  label={t('home.login.password')}
                  name="password"
                  rules={[{ required: true, message: t('home.login.passwordRequired') }]}
                >
                  <Input.Password />
                </Form.Item>
                <Button block type="primary" htmlType="submit">
                  {t('home.login.enter', { client: client.name })}
                </Button>
              </Form>
            )}
            <Button type="link" block onClick={() => navigate('/')}>
              {t('home.login.backToHub')}
            </Button>
          </Card>
        </div>
      </main>
    </ConfigProvider>
  );
}
