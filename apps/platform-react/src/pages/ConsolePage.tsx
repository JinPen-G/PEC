import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

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

const tools = [
  {
    title: '項目包管理',
    description: '管理項目資料、首頁可見性、主題和客戶端入口。',
    to: '/tools/projects',
    icon: <FolderOpenOutlined />,
  },
  {
    title: '路由菜單管理',
    description: '維護菜單分組、頁面順序、PRD 關聯與備份。',
    to: '/tools/project-routes',
    icon: <OrderedListOutlined />,
  },
  {
    title: 'AI 上下文中心',
    description: '檢查頁面和 PRD 覆蓋並導出交付上下文。',
    to: '/tools/ai-context',
    icon: <DatabaseOutlined />,
  },
  {
    title: '組件規範',
    description: '查看 React 平臺統一使用的 Ant Design 控件。',
    to: '/components',
    icon: <AppstoreOutlined />,
  },
];

export function ConsolePage() {
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

  return (
    <PlatformPage
      title="控制台"
      description="管理平臺級項目資料、頁面路由和交付上下文。"
      actions={
        <Tag color={platformApi.development ? 'processing' : 'default'}>
          {platformApi.development ? '本機開發服務' : '靜態只讀'}
        </Tag>
      }
    >
      {settingsQuery.isError ? (
        <Alert type="error" showIcon title="開發模式讀取失敗" description={settingsQuery.error.message} />
      ) : null}
      {saveSettings.isError ? (
        <Alert
          type="error"
          showIcon
          closable={{ onClose: saveSettings.reset }}
          title="開發模式保存失敗"
          description={saveSettings.error.message}
        />
      ) : null}

      <Surface className="console-settings-panel">
        <div>
          <Flex align="center" gap={8}>
            <Title level={3}>PRD 對照開發模式</Title>
            <Tag color={developerMode ? 'success' : 'default'}>{developerMode ? '已開啓' : '已關閉'}</Tag>
          </Flex>
          <Text type="secondary">
            開啓後可在業務頁面查看對應 PRD；默認不會自動打開側窗。
            {platformApi.development ? '' : '（靜態部署下此開關只保存在當前瀏覽器）'}
          </Text>
        </div>
        <Switch
          checked={developerMode}
          loading={settingsQuery.isPending || saveSettings.isPending}
          checkedChildren="開"
          unCheckedChildren="關"
          onChange={(checked) => saveSettings.mutate(checked)}
        />
      </Surface>

      <Surface className="console-settings-panel">
        <div>
          <Flex align="center" gap={8}>
            <Title level={3}>遠程管理</Title>
            <Tag color={remoteManagement ? 'success' : 'default'}>
              {remoteManagement ? '允許遠端寫入' : '僅限服務主機'}
            </Tag>
          </Flex>
          <Text type="secondary">
            通過平臺服務（serve:local）部署時，允許局域網/遠程瀏覽器執行路由、項目與 PRD 等管理寫入。
            {platformApi.development ? '' : '（僅在以平臺服務部署時生效；靜態部署無後端，此開關不產生效果）'}
          </Text>
        </div>
        <Switch
          checked={remoteManagement}
          loading={saveRemoteManagement.isPending}
          disabled={!platformApi.development}
          checkedChildren="開"
          unCheckedChildren="關"
          onChange={(checked) => saveRemoteManagement.mutate(checked)}
        />
      </Surface>

      <ShareControlPanel />

      <Surface className="console-tool-list">
        <header className="workspace-section-heading">
          <div>
            <Title level={3}>平臺工作區</Title>
            <Text type="secondary">選擇需要處理的管理任務。</Text>
          </div>
          <Text type="secondary">{tools.length} 個入口</Text>
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
                打開
              </Button>
            </li>
          ))}
        </ul>
      </Surface>
    </PlatformPage>
  );
}
