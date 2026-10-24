import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { platformApi } from '@/data/platform-api';
import { Alert, Button, Flex, Switch, Tag, Typography } from '@/ui/ant';
import {
  AppstoreOutlined,
  ArrowRightOutlined,
  DatabaseOutlined,
  FolderOpenOutlined,
  OrderedListOutlined,
} from '@/ui/ant/icons';
import { PlatformPage } from '@/ui/platform/PlatformPage';
import { Surface } from '@/ui/platform/Surface';
import { ShareControlPanel } from '@/features/projects/ShareControlPanel';

const { Text, Title } = Typography;

export function ConsolePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const settingsQuery = useQuery({
    queryKey: ['platform', 'settings'],
    queryFn: () => platformApi.loadPlatformSettings(),
  });
  const developerMode = settingsQuery.data?.developerMode ?? false;
  const saveSettings = useMutation({
    mutationFn: (next: boolean) =>
      platformApi.savePlatformSettings({
        developerMode: next,
        remoteManagement: settingsQuery.data?.remoteManagement ?? false,
      }),
    onSuccess: (settings) => queryClient.setQueryData(['platform', 'settings'], settings),
  });
  const remoteManagement = settingsQuery.data?.remoteManagement ?? false;
  const saveRemoteManagement = useMutation({
    mutationFn: (next: boolean) =>
      platformApi.savePlatformSettings({
        developerMode: settingsQuery.data?.developerMode ?? false,
        remoteManagement: next,
      }),
    onSuccess: (settings) => queryClient.setQueryData(['platform', 'settings'], settings),
  });
  const tools = [
    {
      title: t('console.tools.packages.title'),
      description: t('console.tools.packages.description'),
      to: '/tools/projects',
      icon: <FolderOpenOutlined />,
    },
    {
      title: t('console.tools.routes.title'),
      description: t('console.tools.routes.description'),
      to: '/tools/project-routes',
      icon: <OrderedListOutlined />,
    },
    {
      title: t('console.tools.ai.title'),
      description: t('console.tools.ai.description'),
      to: '/tools/ai-context',
      icon: <DatabaseOutlined />,
    },
    {
      title: t('console.tools.components.title'),
      description: t('console.tools.components.description'),
      to: '/components',
      icon: <AppstoreOutlined />,
    },
  ];

  return (
    <PlatformPage
      title={t('console.header.title')}
      description={t('console.header.description')}
      actions={
        <Tag color={platformApi.development ? 'processing' : 'default'}>
          {platformApi.development ? t('console.header.envDev') : t('console.header.envStatic')}
        </Tag>
      }
    >
      {settingsQuery.isError ? (
        <Alert
          type="error"
          showIcon
          title={t('console.alert.loadFailed')}
          description={settingsQuery.error.message}
        />
      ) : null}
      {saveSettings.isError ? (
        <Alert
          type="error"
          showIcon
          closable={{ onClose: saveSettings.reset }}
          title={t('console.alert.saveFailed')}
          description={saveSettings.error.message}
        />
      ) : null}

      <Surface className="console-settings-panel">
        <div>
          <Flex align="center" gap={8}>
            <Title level={3}>{t('console.devMode.title')}</Title>
            <Tag color={developerMode ? 'success' : 'default'}>
              {developerMode ? t('console.devMode.on') : t('console.devMode.off')}
            </Tag>
          </Flex>
          <Text type="secondary">
            {t('console.devMode.description')}
            {platformApi.development ? '' : t('console.devMode.staticNote')}
          </Text>
        </div>
        <Switch
          checked={developerMode}
          loading={settingsQuery.isPending || saveSettings.isPending}
          checkedChildren={t('console.switch.on')}
          unCheckedChildren={t('console.switch.off')}
          onChange={(checked) => saveSettings.mutate(checked)}
        />
      </Surface>

      <Surface className="console-settings-panel">
        <div>
          <Flex align="center" gap={8}>
            <Title level={3}>{t('console.remote.title')}</Title>
            <Tag color={remoteManagement ? 'success' : 'default'}>
              {remoteManagement ? t('console.remote.allowRemote') : t('console.remote.localOnly')}
            </Tag>
          </Flex>
          <Text type="secondary">
            {t('console.remote.description')}
            {platformApi.development ? '' : t('console.remote.staticNote')}
          </Text>
        </div>
        <Switch
          checked={remoteManagement}
          loading={saveRemoteManagement.isPending}
          disabled={!platformApi.development}
          checkedChildren={t('console.switch.on')}
          unCheckedChildren={t('console.switch.off')}
          onChange={(checked) => saveRemoteManagement.mutate(checked)}
        />
      </Surface>

      <ShareControlPanel />

      <Surface className="console-tool-list">
        <header className="workspace-section-heading">
          <div>
            <Title level={3}>{t('console.tools.title')}</Title>
            <Text type="secondary">{t('console.tools.description')}</Text>
          </div>
          <Text type="secondary">{t('console.tools.count', { count: tools.length })}</Text>
        </header>
        <ul className="console-tool-list__items">
          {tools.map((tool) => (
            <li className="console-tool-list__item" key={tool.to}>
              <div className="console-tool-list__meta">
                <span className="console-tool-list__icon" aria-hidden="true">
                  {tool.icon}
                </span>
                <div className="console-tool-list__content">
                  <strong>{tool.title}</strong>
                  <Text type="secondary">{tool.description}</Text>
                </div>
              </div>
              <Button type="text" icon={<ArrowRightOutlined />} onClick={() => navigate(tool.to)}>
                {t('console.tools.open')}
              </Button>
            </li>
          ))}
        </ul>
      </Surface>
    </PlatformPage>
  );
}
