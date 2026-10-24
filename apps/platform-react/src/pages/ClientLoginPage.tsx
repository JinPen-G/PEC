import { useMemo, type CSSProperties } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';

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

const { Text, Title } = Typography;

export function ClientLoginPage() {
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
        </header>
        <div className="client-login__body">
          <Card className="client-login__card">
            <Text className="home-kicker">{project.shortName || project.name}</Text>
            <Title level={2}>{client.name}</Title>
            <Text type="secondary">{client.description || '登錄後進入客戶端'}</Text>
            {runtimeStatus.state === 'index-missing' || runtimeStatus.state === 'empty' ? (
              <Alert
                showIcon
                type={runtimeStatus.state === 'index-missing' ? 'error' : 'info'}
                title={runtimeStatus.state === 'index-missing' ? 'HTML 頁面索引異常' : '客戶端暫無頁面'}
                description="請先在項目包中登記可運行的 HTML 頁面。"
              />
            ) : (
              <Form layout="vertical" onFinish={enterClient} initialValues={{ account: 'admin' }}>
                <Form.Item label="賬號" name="account" rules={[{ required: true, message: '請輸入賬號' }]}>
                  <Input />
                </Form.Item>
                <Form.Item label="密碼" name="password" rules={[{ required: true, message: '請輸入密碼' }]}>
                  <Input.Password />
                </Form.Item>
                <Button block type="primary" htmlType="submit">
                  進入{client.name}
                </Button>
              </Form>
            )}
            <Button type="link" block onClick={() => navigate('/')}>
              返回體驗中心
            </Button>
          </Card>
        </div>
      </main>
    </ConfigProvider>
  );
}
