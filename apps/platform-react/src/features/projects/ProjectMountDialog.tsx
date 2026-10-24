import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

import type { ProjectManifest } from '../../../../../packages/platform-contracts/src/index.js';
import { platformApi } from '@/data/platform-api';
import { Alert, Button, Flex, Form, Input, Modal, Space, Typography } from '@/ui/ant';
import { FolderOpenOutlined, LinkOutlined } from '@/ui/ant/icons';

const { Paragraph, Text, Title } = Typography;

export function ProjectMountDialog({
  open,
  onCancel,
  onMounted,
}: {
  open: boolean;
  onCancel: () => void;
  onMounted: (project: ProjectManifest) => Promise<void> | void;
}) {
  const { t } = useTranslation();
  const [root, setRoot] = useState('');
  const [candidate, setCandidate] = useState<ProjectManifest | null>(null);
  const [error, setError] = useState('');
  function resetDialog() {
    setRoot('');
    setCandidate(null);
    setError('');
  }

  const inspect = useMutation({
    mutationFn: (value: string) => platformApi.inspectProjectMount(value),
    onSuccess: (result) => {
      setCandidate((result.project || null) as ProjectManifest | null);
      setError('');
    },
    onError: (reason) => {
      setCandidate(null);
      setError(reason.message);
    },
  });
  const browse = useMutation({
    mutationFn: () => platformApi.selectProjectDirectory(),
    onSuccess: (result) => {
      const selected = typeof result.path === 'string' ? result.path : '';
      if (!selected) return;
      setRoot(selected);
      inspect.mutate(selected);
    },
    onError: (reason) => setError(reason.message),
  });
  const mount = useMutation({
    mutationFn: () => platformApi.mountProject(root),
    onSuccess: async (result) => {
      await onMounted(result.project as ProjectManifest);
      onCancel();
    },
    onError: (reason) => setError(reason.message),
  });

  return (
    <Modal
      open={open}
      width={640}
      title={t('dialogs.mount.title')}
      onCancel={onCancel}
      afterClose={resetDialog}
      footer={
        <Flex justify="flex-end" gap={8}>
          <Button onClick={onCancel}>{t('dialogs.mount.cancel')}</Button>
          <Button
            type="primary"
            icon={<LinkOutlined />}
            disabled={!candidate}
            loading={mount.isPending}
            onClick={() => mount.mutate()}
          >
            {t('dialogs.mount.confirm')}
          </Button>
        </Flex>
      }
    >
      <Space direction="vertical" size={18} style={{ width: '100%' }}>
        <div>
          <Title level={5}>{t('dialogs.mount.noCopyTitle')}</Title>
          <Paragraph type="secondary">{t('dialogs.mount.noCopyDescription')}</Paragraph>
        </div>
        <Form layout="vertical">
          <Form.Item label={t('dialogs.mount.folderLabel')} required>
            <Space.Compact style={{ width: '100%' }}>
              <Input
                value={root}
                placeholder={t('dialogs.mount.folderPlaceholder')}
                onChange={(event) => {
                  setRoot(event.target.value);
                  setCandidate(null);
                }}
                onPressEnter={() => root && inspect.mutate(root)}
              />
              <Button
                icon={<FolderOpenOutlined />}
                loading={browse.isPending}
                onClick={() => browse.mutate()}
              >
                {t('dialogs.mount.browse')}
              </Button>
              <Button loading={inspect.isPending} onClick={() => inspect.mutate(root)} disabled={!root}>
                {t('dialogs.mount.inspect')}
              </Button>
            </Space.Compact>
          </Form.Item>
        </Form>
        {error ? <Alert type="error" showIcon title={t('dialogs.mount.invalidTitle')} description={error} /> : null}
        {candidate ? (
          <Alert
            type="success"
            showIcon
            title={`${candidate.name}（${candidate.id}）`}
            description={
              <Text type="secondary">
                {t('dialogs.mount.candidateDescription', { count: candidate.clients.length })}
              </Text>
            }
          />
        ) : null}
      </Space>
    </Modal>
  );
}
