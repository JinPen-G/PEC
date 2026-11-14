import { LoadingStage } from '@preview/ui/loading';
import { SearchField } from '@preview/ui/admin';
/** Platform mutations use server revisions; failures leave the current form open. */
import { useState } from 'react';
import { Alert, Form, Input, InputNumber, Modal, Select, Switch, Table, Tag, Tabs } from '@preview/ui/admin';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@preview/ui/admin';
import { BrandIcon } from '@preview/ui';
import { useNativeAuth, useNativeQuery, type NativeAccount } from './platform-api';

import { QueryFailure, PageHeading } from './PageLayout';
export function SettingsPage() {
  const { client } = useNativeAuth(),
    cache = useQueryClient();
  const query = useNativeQuery<{ brandName: string; brandIcon: string; revision: number }>('/settings');
  const [form] = Form.useForm(),
    [error, setError] = useState(''),
    [pending, setPending] = useState(false),
    [revision, setRevision] = useState<number | null>(null);
  if (query.error) return <QueryFailure message={query.error.message} />;
  if (!query.data) return <LoadingStage label="读取平台设置…" />;
  const submit = async (values: object) => {
    setPending(true);
    setError('');
    try {
      const saved = await client.request<{ revision: number }>('/settings', {
        method: 'PATCH',
        body: { ...values, revision: revision ?? form.getFieldValue('revision') },
      });
      setRevision(saved.revision);
      await cache.invalidateQueries({ queryKey: ['native'] });
    } catch (error) {
      setError(error instanceof Error ? error.message : '保存失败');
    } finally {
      setPending(false);
    }
  };
  return (
    <section className="native-page">
      <PageHeading title="平台设置" />
      <Form
        form={form}
        initialValues={query.data}
        onFinish={(values) => void submit(values)}
        layout="vertical"
        className="native-form-width"
        disabled={pending}
      >
        <Form.Item name="revision" hidden>
          <InputNumber />
        </Form.Item>
        <Form.Item name="brandName" label="平台品牌名称" rules={[{ required: true, max: 80 }]}>
          <Input />
        </Form.Item>
        <Form.Item name="brandIcon" hidden>
          <Input />
        </Form.Item>
        <Form.Item label="平台标识">
          <BrandIcon size={36} />
        </Form.Item>
        <p className="text-meta">主题与音效仍由每个浏览器独立设置，不随品牌修改覆盖个人偏好。</p>
        {error && <Alert type="error" title={error} />}
        <Button htmlType="submit" type="primary" loading={pending} disabled={pending}>
          保存平台设置
        </Button>
      </Form>
    </section>
  );
}

export function AccountsPage() {
  const { client } = useNativeAuth(),
    cache = useQueryClient();
  const accounts = useNativeQuery<NativeAccount[]>('/accounts');
  const audit =
    useNativeQuery<{ actor: string; action: string; target: string; at: number; result: string }[]>('/audit');
  const [search, setSearch] = useState(''),
    [editing, setEditing] = useState<NativeAccount | 'new' | null>(null);
  const [error, setError] = useState(''),
    [pending, setPending] = useState(false);
  const [form] = Form.useForm();
  const open = (account: NativeAccount | 'new') => {
    setEditing(account);
    setError('');
    form.resetFields();
    form.setFieldsValue(account === 'new' ? { role: 'member', disabled: false } : account);
  };
  const submit = async (input: Record<string, unknown>) => {
    setPending(true);
    setError('');
    try {
      if (editing === 'new') await client.request('/accounts', { method: 'POST', body: input });
      else if (editing)
        await client.request(`/accounts/${editing.id}`, {
          method: 'PATCH',
          body: { ...input, password: input.password || undefined, revision: editing.revision },
        });
      await cache.invalidateQueries({ queryKey: ['native'] });
      setEditing(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : '保存失败');
    } finally {
      setPending(false);
    }
  };
  if (accounts.error)
    return <QueryFailure message={accounts.error.message} retry={() => void accounts.refetch()} />;
  return (
    <section className="native-page">
      <PageHeading
        title="账号管理"
        actions={
          <Button type="primary" onClick={() => open('new')}>
            创建账号
          </Button>
        }
      />
      <Tabs
        items={[
          {
            key: 'accounts',
            label: '账号',
            children: (
              <>
                <Table
                  toolbar={
                    <SearchField
                      label="搜索账号"
                      placeholder="搜索账号或姓名"
                      value={search}
                      onValueChange={(event) => setSearch(event)}
                    />
                  }
                  rowKey="id"
                  onRefresh={() => accounts.refetch()}
                  loading={accounts.isPending}
                  dataSource={(accounts.data ?? []).filter((account) =>
                    `${account.username} ${account.displayName}`.includes(search),
                  )}
                  pagination={{ pageSize: 10, hideOnSinglePage: true }}
                  scroll={{ x: 700 }}
                  columns={[
                    { title: '账号', dataIndex: 'username' },
                    { title: '显示名称', dataIndex: 'displayName' },
                    {
                      title: '平台角色',
                      render: (_, account) => (account.role === 'admin' ? '平台管理员' : '普通成员'),
                    },
                    {
                      title: '状态',
                      render: (_, account) => (
                        <Tag>
                          {account.disabled ? '已停用' : account.mustChangePassword ? '待改密' : '正常'}
                        </Tag>
                      ),
                    },
                    {
                      title: '操作',
                      render: (_, account) => (
                        <Button size="small" onClick={() => open(account)}>
                          编辑 / 重置密码
                        </Button>
                      ),
                    },
                  ]}
                />
              </>
            ),
          },
          {
            key: 'audit',
            label: '操作记录',
            children: audit.error ? (
              <QueryFailure message={audit.error.message} />
            ) : (
              <Table
                rowKey={(_, index) => String(index)}
                onRefresh={() => audit.refetch()}
                dataSource={audit.data ?? []}
                loading={audit.isPending}
                scroll={{ x: 700 }}
                columns={[
                  { title: '动作', dataIndex: 'action' },
                  { title: '目标', dataIndex: 'target' },
                  { title: '结果', dataIndex: 'result' },
                  { title: '时间', render: (_, row) => new Date(row.at).toLocaleString() },
                ]}
              />
            ),
          },
        ]}
      />
      <Modal
        title={editing === 'new' ? '创建账号' : '编辑账号'}
        open={Boolean(editing)}
        onCancel={pending ? undefined : () => setEditing(null)}
        footer={null}
        destroyOnHidden
      >
        <Form form={form} layout="vertical" onFinish={(input) => void submit(input)} disabled={pending}>
          <Form.Item
            name="username"
            label="账号"
            rules={[
              {
                required: true,
                pattern: /^[a-z0-9][a-z0-9-]{1,63}$/,
                message: '使用2–64位小写字母、数字或连字符',
              },
            ]}
          >
            <Input disabled={editing !== 'new' || pending} autoComplete="off" />
          </Form.Item>
          <Form.Item name="displayName" label="显示名称" rules={[{ required: true, max: 160 }]}>
            <Input />
          </Form.Item>
          <Form.Item name="role" label="平台角色" rules={[{ required: true }]}>
            <Select
              options={[
                { value: 'admin', label: '平台管理员' },
                { value: 'member', label: '普通成员' },
              ]}
            />
          </Form.Item>
          {editing !== 'new' && (
            <Form.Item name="disabled" label="停用账号" valuePropName="checked">
              <Switch />
            </Form.Item>
          )}
          <Form.Item
            name="password"
            label={editing === 'new' ? '初始密码' : '重置密码（留空保留）'}
            rules={[{ required: editing === 'new', min: 8, max: 128 }]}
          >
            <Input.Password autoComplete="new-password" />
          </Form.Item>
          <p className="text-meta">
            新建或重置后，成员下次登录需要修改密码。重置、停用和角色变化会撤销现有会话。
          </p>
          {error && <Alert type="error" title={error} style={{ marginBottom: 16 }} />}
          <Button htmlType="submit" type="primary" disabled={pending} loading={pending}>
            保存账号
          </Button>
        </Form>
      </Modal>
    </section>
  );
}
