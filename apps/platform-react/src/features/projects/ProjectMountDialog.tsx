import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';

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
      title="掛載現有項目文件夾"
      onCancel={onCancel}
      afterClose={resetDialog}
      footer={
        <Flex justify="flex-end" gap={8}>
          <Button onClick={onCancel}>取消</Button>
          <Button
            type="primary"
            icon={<LinkOutlined />}
            disabled={!candidate}
            loading={mount.isPending}
            onClick={() => mount.mutate()}
          >
            確認掛載
          </Button>
        </Flex>
      }
    >
      <Space direction="vertical" size={18} style={{ width: '100%' }}>
        <div>
          <Title level={5}>項目文件不會被複制或移動</Title>
          <Paragraph type="secondary">
            平臺只在本機的 project-mounts.local.json 中記錄目錄。取消掛載也不會刪除源文件。
          </Paragraph>
        </div>
        <Form layout="vertical">
          <Form.Item label="項目文件夾" required>
            <Space.Compact style={{ width: '100%' }}>
              <Input
                value={root}
                placeholder="選擇或輸入包含 project.json 的絕對路徑"
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
                瀏覽
              </Button>
              <Button loading={inspect.isPending} onClick={() => inspect.mutate(root)} disabled={!root}>
                檢查
              </Button>
            </Space.Compact>
          </Form.Item>
        </Form>
        {error ? <Alert type="error" showIcon title="目錄不可掛載" description={error} /> : null}
        {candidate ? (
          <Alert
            type="success"
            showIcon
            title={`${candidate.name}（${candidate.id}）`}
            description={
              <Text type="secondary">
                已通過項目配置、頁面定義和資源檢查。客戶端 {candidate.clients.length} 個。
              </Text>
            }
          />
        ) : null}
      </Space>
    </Modal>
  );
}
