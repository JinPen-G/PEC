import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { ProjectManifest } from '../../../../../packages/platform-contracts/src/index.js';
import { platformApi } from '@/data/platform-api';
import { platformQueryKeys, useBootstrapState } from '@/data/use-platform-data';
import { Alert, Button, Flex, Modal, Space, Typography } from '@/ui/ant';
import { FolderOpenOutlined, PlusOutlined } from '@/ui/ant/icons';
import { ProjectMountDialog } from './ProjectMountDialog';

const { Paragraph, Text, Title } = Typography;
const DISMISSED_KEY = 'product-experience-center:onboarding-dismissed';

export function WorkspaceOnboarding() {
  const queryClient = useQueryClient();
  const bootstrap = useBootstrapState();
  const [dismissed, setDismissed] = useState(() => localStorage.getItem(DISMISSED_KEY) === '1');
  const [mountOpen, setMountOpen] = useState(false);
  const example = useMutation({
    mutationFn: () => platformApi.installExampleProject(),
    onSuccess: () => refreshWorkspace(),
  });

  async function refreshWorkspace(_project?: ProjectManifest) {
    localStorage.removeItem(DISMISSED_KEY);
    setDismissed(true);
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: platformQueryKeys.bootstrap }),
      queryClient.invalidateQueries({ queryKey: platformQueryKeys.projects }),
      queryClient.invalidateQueries({ queryKey: platformQueryKeys.htmlPages }),
      queryClient.invalidateQueries({ queryKey: platformQueryKeys.mounts }),
      queryClient.invalidateQueries({ queryKey: platformQueryKeys.health }),
    ]);
  }

  const show = Boolean(
    bootstrap.data?.runtime.writeEnabled && bootstrap.data.workspace.needsOnboarding && !dismissed,
  );
  return (
    <>
      <Modal open={show} closable={false} footer={null} width={680} title={null}>
        <Space direction="vertical" size={24} style={{ width: '100%' }}>
          <div>
            <Text type="secondary">首次啓動</Text>
            <Title level={2} style={{ marginTop: 6 }}>
              準備你的產品體驗工作區
            </Title>
            <Paragraph type="secondary">
              當前沒有可用項目。你可以掛載已有項目文件夾、安裝脫敏示例，或者先進入空平臺。
            </Paragraph>
          </div>
          {bootstrap.data?.workspace.invalidProjects ? (
            <Alert
              type="warning"
              showIcon
              title={`發現 ${bootstrap.data.workspace.invalidProjects} 個無效項目`}
              description="進入項目包管理或健康檢查中心，可以看到具體錯誤和修復建議。"
            />
          ) : null}
          {example.isError ? (
            <Alert type="error" showIcon title="示例創建失敗" description={example.error.message} />
          ) : null}
          <Flex vertical gap={10}>
            <Button
              type="primary"
              size="large"
              icon={<FolderOpenOutlined />}
              onClick={() => setMountOpen(true)}
            >
              打開現有項目
            </Button>
            <Button
              size="large"
              icon={<PlusOutlined />}
              loading={example.isPending}
              onClick={() => example.mutate()}
            >
              創建脫敏示例
            </Button>
            <Button
              type="text"
              onClick={() => {
                localStorage.setItem(DISMISSED_KEY, '1');
                setDismissed(true);
              }}
            >
              暫不配置，進入空平臺
            </Button>
          </Flex>
          <Text type="secondary">“暫不配置”只記錄在當前瀏覽器，不寫入項目目錄。</Text>
        </Space>
      </Modal>
      <ProjectMountDialog
        open={mountOpen}
        onCancel={() => setMountOpen(false)}
        onMounted={refreshWorkspace}
      />
    </>
  );
}
