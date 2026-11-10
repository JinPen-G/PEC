/** Administrators replace one user's menu grants atomically. PRD bodies stay in Git. */
import { useState } from 'react';
import { Alert, Empty, Form, Select, Table, Tag } from '@preview/ui/admin';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@preview/ui/admin';
import { useNativeAuth, useNativeQuery, type NativeAccount, type NativeProject } from './platform-api';
interface Grant {
  clientId: string;
  pageKey: string;
  userId: string;
}
export function PageAccessPanel({
  project,
  accounts,
}: {
  project: NativeProject;
  accounts: NativeAccount[];
}) {
  const { client } = useNativeAuth();
  const cache = useQueryClient();
  const grants = useNativeQuery<Grant[]>(`/page-grants?projectId=${project.id}`);
  const [accountId, setAccountId] = useState('');
  const [selected, setSelected] = useState<string[]>([]);
  const [revision, setRevision] = useState(project.revision);
  const [error, setError] = useState(''),
    [pending, setPending] = useState(false),
    [saved, setSaved] = useState(false);
  const pages = project.clients.flatMap((group) =>
    group.pages.map((page) => ({ ...page, clientId: group.id, clientName: group.name })),
  );
  const eligible = accounts.filter((account) => account.role !== 'admin');
  const chooseAccount = (id: string) => {
    setAccountId(id);
    setSelected(
      (grants.data ?? [])
        .filter((grant) => grant.userId === id)
        .map((grant) => grant.clientId + '/' + grant.pageKey),
    );
    setRevision(project.revision);
    setError('');
    setSaved(false);
  };
  const mutate = async (operation: () => Promise<unknown>) => {
    setPending(true);
    setError('');
    setSaved(false);
    try {
      await operation();
      await Promise.all([
        cache.invalidateQueries({ queryKey: ['native'] }),
        cache.invalidateQueries({ queryKey: ['showcase-catalog'] }),
        cache.invalidateQueries({ queryKey: ['showcase-detail'] }),
      ]);
      setSaved(true);
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : '保存失败');
    } finally {
      setPending(false);
    }
  };
  const save = (id: string, values: string[], base: number) =>
    mutate(async () => {
      const result = await client.request<{ revision: number }>(`/projects/${project.id}/page-grants/${id}`, {
        method: 'PUT',
        body: {
          revision: base,
          pages: values.map((value) => {
            const [clientId, pageKey] = value.split('/');
            return { clientId, pageKey };
          }),
        },
      });
      setRevision(result.revision);
      if (accountId === id) setSelected(values);
    });
  return (
    <section className="native-project-access">
      <p className="text-meta">
        公开菜单无需登录；受限菜单仅管理员及获授权用户可见。预览、源码与需求说明使用同一权限。
      </p>
      {grants.error && <Alert type="error" title={grants.error.message} />}
      {!pending && accountId && revision !== project.revision && (
        <Alert
          type="warning"
          title="授权配置已更新，请重新读取后保存"
          action={<Button onClick={() => chooseAccount(accountId)}>重新读取</Button>}
        />
      )}
      <Form
        layout="vertical"
        className="native-access-form"
        onFinish={() => void save(accountId, selected, revision)}
        disabled={pending || !grants.data}
      >
        <Form.Item label="用户" required>
          <Select
            aria-label="授权用户"
            placeholder="选择用户"
            value={accountId || undefined}
            onChange={chooseAccount}
            showSearch={{ optionFilterProp: 'label' }}
            options={eligible.map((account) => ({
              value: account.id,
              label: account.displayName + ' · ' + account.username + (account.disabled ? '（已停用）' : ''),
            }))}
          />
        </Form.Item>
        <Form.Item label="允许访问的菜单">
          <Select
            aria-label="允许访问的菜单"
            mode="multiple"
            value={selected}
            onChange={(value) => {
              setSelected(value);
              setSaved(false);
            }}
            disabled={!accountId || pending}
            placeholder="选择受限菜单"
            showSearch={{ optionFilterProp: 'label' }}
            options={pages
              .filter((page) => page.access !== 'public')
              .map((page) => ({
                value: page.clientId + '/' + page.key,
                label: page.label + (!page.visible ? '（已下架）' : ''),
              }))}
          />
        </Form.Item>
        <div className="native-actions">
          <Button
            htmlType="submit"
            type="primary"
            loading={pending}
            disabled={!accountId || !grants.data || revision !== project.revision}
          >
            保存授权
          </Button>
          {saved && (
            <span role="status" className="text-meta">
              已保存
            </span>
          )}
        </div>
      </Form>
      {error && <Alert type="error" title={error} />}
      <Table
        rowKey="id"
        onRefresh={() => grants.refetch()}
        pagination={{ pageSize: 10, hideOnSinglePage: true }}
        loading={grants.isPending}
        tableLayout="fixed"
        scroll={{ x: 640 }}
        locale={{ emptyText: <Empty description="还没有用户获得受限菜单授权" /> }}
        dataSource={eligible.filter((account) => grants.data?.some((grant) => grant.userId === account.id))}
        columns={[
          {
            title: '用户',
            width: 190,
            render: (_, account) => (
              <>
                <strong>{account.displayName}</strong>
                <div className="text-meta">{account.username}</div>
              </>
            ),
          },
          {
            title: '已授权菜单',
            width: 230,
            render: (_, account) =>
              grants.data
                ?.filter((grant) => grant.userId === account.id)
                .map((grant) => (
                  <Tag key={grant.clientId + '/' + grant.pageKey}>
                    {pages.find((page) => page.clientId === grant.clientId && page.key === grant.pageKey)
                      ?.label ?? grant.pageKey}
                  </Tag>
                )),
          },
          {
            title: '操作',
            key: 'actions',
            width: 220,
            fixed: false,
            render: (_, account) => (
              <div className="native-actions native-table-actions">
                <Button size="small" disabled={pending} onClick={() => chooseAccount(account.id)}>
                  编辑授权
                </Button>
                <Button
                  size="small"
                  disabled={pending}
                  onClick={() => void save(account.id, [], project.revision)}
                >
                  全部撤销
                </Button>
              </div>
            ),
          },
        ]}
      />
    </section>
  );
}
