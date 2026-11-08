import { LoadingStage } from '@preview/ui/loading';
/** Only project metadata is editable here. Page code and PRD are maintained in Git. */
import { useState } from 'react';
import { Alert, Form, Input, InputNumber, Select, Switch } from '@preview/ui/admin';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@preview/ui/admin';
import { useNativeAuth, useNativeQuery, type NativeProject } from './platform-api';
import { QueryFailure } from './PageLayout';

export const projectIcons = [
  { value: 'boxes', label: '项目' },
  { value: 'camera', label: '影像' },
  { value: 'vehicle', label: '车辆' },
  { value: 'layout', label: '应用' },
  { value: 'layers', label: '组件' },
];

export function ProjectSettingsPage({ projectId }: { projectId: string }) {
  const query = useNativeQuery<NativeProject>(`/projects/${projectId}`);
  if (query.error) return <QueryFailure message={query.error.message} retry={() => void query.refetch()} />;
  if (!query.data) return <LoadingStage label="读取项目信息…" />;
  if (query.data.memberRole === 'viewer') return <QueryFailure message="需要项目管理权限" />;
  return <ProjectSettingsForm key={projectId} project={query.data} />;
}

function ProjectSettingsForm({ project }: { project: NativeProject }) {
  const { client } = useNativeAuth();
  const cache = useQueryClient();
  const [form] = Form.useForm();
  const [revision, setRevision] = useState(project.revision);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const submit = async (values: Record<string, unknown>) => {
    setPending(true);
    setSaved(false);
    setError('');
    try {
      const result = await client.request<NativeProject>(`/projects/${project.id}`, {
        method: 'PATCH',
        body: { ...values, revision },
      });
      setRevision(result.revision);
      await Promise.all([
        cache.invalidateQueries({ queryKey: ['native'] }),
        cache.invalidateQueries({ queryKey: ['showcase-catalog'] }),
      ]);
      setSaved(true);
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : '保存失败');
    } finally {
      setPending(false);
    }
  };
  return (
    <div>
      {!pending && revision !== project.revision && (
        <Alert
          type="warning"
          title="项目信息已变更，请重新读取后保存"
          action={
            <Button
              onClick={() => {
                form.setFieldsValue(project);
                setRevision(project.revision);
                setError('');
              }}
            >
              重新读取
            </Button>
          }
        />
      )}
      <Form
        form={form}
        layout="vertical"
        className="native-form-width"
        initialValues={project}
        disabled={pending}
        onFinish={(values) => void submit(values)}
      >
        <Form.Item label="项目编码">
          <Input value={project.id} disabled />
        </Form.Item>
        <Form.Item name="name" label="项目名称" rules={[{ required: true, whitespace: true, max: 160 }]}>
          <Input />
        </Form.Item>
        <Form.Item name="description" label="项目说明">
          <Input.TextArea rows={3} maxLength={2000} />
        </Form.Item>
        <Form.Item name="icon" label="项目图标">
          <Select options={projectIcons} />
        </Form.Item>
        <Form.Item name="position" label="排序">
          <InputNumber min={0} max={100000} />
        </Form.Item>
        {project.memberRole === 'admin' && (
          <Form.Item
            name="archived"
            label="归档项目"
            valuePropName="checked"
            extra="归档后停止展示，页面和授权配置保留。"
          >
            <Switch />
          </Form.Item>
        )}
        {error && <Alert type="error" title={error} />}
        <Button type="primary" htmlType="submit" loading={pending}>
          保存信息
        </Button>
        {saved && (
          <span role="status" className="native-save-notice">
            已保存
          </span>
        )}
      </Form>
    </div>
  );
}
