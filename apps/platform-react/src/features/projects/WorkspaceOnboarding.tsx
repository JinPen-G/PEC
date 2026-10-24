import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

import type { ProjectManifest } from '../../../../../packages/platform-contracts/src/index.js';
import { platformApi } from '@/data/platform-api';
import { platformQueryKeys, useBootstrapState } from '@/data/use-platform-data';
import { Alert, Button, Flex, Modal, Space, Typography } from '@/ui/ant';
import { FolderOpenOutlined, PlusOutlined } from '@/ui/ant/icons';
import { ProjectMountDialog } from './ProjectMountDialog';

const { Paragraph, Text, Title } = Typography;
const DISMISSED_KEY = 'product-experience-center:onboarding-dismissed';

export function WorkspaceOnboarding() {
  const { t } = useTranslation();
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
            <Text type="secondary">{t('dialogs.onboarding.eyebrow')}</Text>
            <Title level={2} style={{ marginTop: 6 }}>
              {t('dialogs.onboarding.title')}
            </Title>
            <Paragraph type="secondary">{t('dialogs.onboarding.description')}</Paragraph>
          </div>
          {bootstrap.data?.workspace.invalidProjects ? (
            <Alert
              type="warning"
              showIcon
              title={t('dialogs.onboarding.invalidProjects', {
                count: bootstrap.data.workspace.invalidProjects,
              })}
              description={t('dialogs.onboarding.invalidProjectsHint')}
            />
          ) : null}
          {example.isError ? (
            <Alert type="error" showIcon title={t('dialogs.onboarding.exampleFailed')} description={example.error.message} />
          ) : null}
          <Flex vertical gap={10}>
            <Button
              type="primary"
              size="large"
              icon={<FolderOpenOutlined />}
              onClick={() => setMountOpen(true)}
            >
              {t('dialogs.onboarding.openExisting')}
            </Button>
            <Button
              size="large"
              icon={<PlusOutlined />}
              loading={example.isPending}
              onClick={() => example.mutate()}
            >
              {t('dialogs.onboarding.createExample')}
            </Button>
            <Button
              type="text"
              onClick={() => {
                localStorage.setItem(DISMISSED_KEY, '1');
                setDismissed(true);
              }}
            >
              {t('dialogs.onboarding.skip')}
            </Button>
          </Flex>
          <Text type="secondary">{t('dialogs.onboarding.skipHint')}</Text>
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
