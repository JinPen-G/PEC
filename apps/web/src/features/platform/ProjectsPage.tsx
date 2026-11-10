import { SearchField } from '@preview/ui/admin';
/** Projects contain basic metadata; registered pages are managed within each project. */
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Alert, Form, Input, InputNumber, Modal, Select, Table, Empty } from '@preview/ui/admin';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@preview/ui/admin';
import { useNativeAuth, useNativeQuery, type NativeProject } from './platform-api';
import { QueryFailure, PageHeading } from './PageLayout';
import { projectIcons } from './ProjectSettingsPage';
import { NATIVE_MODULES } from '../../../../../packages/platform-contracts/src/platform';
import { usePlatformLocale } from '@/features/locale/platform-locale';
export function ProjectsPage({
  onOpen,
  onConfigure,
  member = false,
  selectionOnly = false,
}: {
  onOpen: (project: NativeProject) => void;
  onConfigure: (project: NativeProject) => void;
  member?: boolean;
  selectionOnly?: boolean;
}) {
  const { client } = useNativeAuth(),
    cache = useQueryClient();
  const projects = useNativeQuery<NativeProject[]>('/projects');
  const { locale } = usePlatformLocale();
  const text = (hans: string, hant: string, en: string) =>
    locale === 'en' ? en : locale === 'zh-Hant' ? hant : hans;
  const available = NATIVE_MODULES.filter(
    (module) =>
      module.surface === 'showcase' &&
      module.projectId &&
      !projects.data?.some((project) => project.id === module.projectId),
  );
  const [search, setSearch] = useState(''),
    [creating, setCreating] = useState(false),
    [pending, setPending] = useState(false),
    [error, setError] = useState('');
  const [form] = Form.useForm();
  const submit = async (input: Record<string, unknown>) => {
    setPending(true);
    setError('');
    try {
      await client.request('/projects', { method: 'POST', body: input });
      await cache.invalidateQueries({ queryKey: ['native'] });
      setCreating(false);
      form.resetFields();
    } catch (err) {
      setError(err instanceof Error ? err.message : '创建失败');
    } finally {
      setPending(false);
    }
  };
  if (projects.error)
    return <QueryFailure message={projects.error.message} retry={() => void projects.refetch()} />;
  return (
    <section className="native-page">
      <PageHeading
        title={selectionOnly ? '选择项目文档' : member ? '我的项目' : '项目管理'}
        actions={
          !member &&
          !selectionOnly && (
            <Button
              type="primary"
              onClick={() => {
                setCreating(true);
                setError('');
              }}
            >
              创建项目
            </Button>
          )
        }
      />

      <Table
        toolbar={
          <SearchField
            label="搜索项目"
            placeholder="搜索项目名称或编码"
            value={search}
            onValueChange={(event) => setSearch(event)}
          />
        }
        rowKey="id"
        onRefresh={() => projects.refetch()}
        loading={projects.isPending}
        locale={{ emptyText: <Empty description="暂无可访问项目，请联系管理员" /> }}
        dataSource={(projects.data ?? []).filter(
          (project) =>
            `${project.name} ${project.id}`.includes(search) && (!selectionOnly || !project.archived),
        )}
        tableLayout="fixed"
        scroll={{ x: selectionOnly ? 780 : locale === 'en' ? 1240 : 1040 }}
        columns={[
          {
            title: '项目',
            width: 190,
            render: (_, project) => (
              <>
                <strong>{project.name}</strong>
                <div className="text-meta">{project.id}</div>
              </>
            ),
          },
          { title: '说明', dataIndex: 'description', width: 220 },
          {
            title: '我的权限',
            width: 130,
            render: (_, project) =>
              ({ admin: '平台管理员', editor: '项目编辑者', viewer: '项目查看者' })[project.memberRole],
          },
          { title: '状态', width: 100, render: (_, project) => (project.archived ? '已归档' : '可用') },
          {
            title: '操作',
            key: 'actions',
            width: selectionOnly ? 140 : locale === 'en' ? 600 : 400,
            fixed: false,
            render: (_, project) => (
              <div className="native-actions native-table-actions">
                <Button
                  size="small"
                  disabled={
                    project.archived ||
                    (!selectionOnly &&
                      !project.clients.some(
                        (group) => group.enabled && group.pages.some((page) => page.visible),
                      ))
                  }
                  onClick={() => onOpen(project)}
                >
                  {selectionOnly ? '查看文档' : '打开项目'}
                </Button>
                {!selectionOnly && project.memberRole !== 'viewer' && (
                  <Link className="native-route-link" to={`/projects/${project.id}/settings?tab=menus`}>
                    菜单管理
                  </Link>
                )}
                {!selectionOnly && project.memberRole === 'admin' && (
                  <Link className="native-route-link" to={`/projects/${project.id}/settings?tab=access`}>
                    用户授权
                  </Link>
                )}
                {!selectionOnly && project.memberRole === 'admin' && (
                  <Link className="native-route-link" to={`/projects/${project.id}/settings?tab=integration`}>
                    {text('AI 接入', 'AI 接入', 'AI integration')}
                  </Link>
                )}
                {!selectionOnly && project.memberRole !== 'viewer' && (
                  <Button size="small" onClick={() => onConfigure(project)}>
                    基础信息
                  </Button>
                )}
              </div>
            ),
          },
        ]}
      />
      <Modal
        title="创建项目"
        open={creating}
        onCancel={pending ? undefined : () => setCreating(false)}
        footer={null}
        destroyOnHidden
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{ icon: 'boxes', position: 0 }}
          onFinish={(input) => void submit(input)}
          disabled={pending}
        >
          {available.length > 0 && (
            <Form.Item
              label={text('使用已接入的项目源码', '使用已接入的專案原始碼', 'Use registered project source')}
            >
              <Select
                allowClear
                placeholder={text('选择项目', '選擇專案', 'Choose a project')}
                options={available.map((module) => ({ value: module.projectId, label: module.label }))}
                onChange={(id) => {
                  const module = available.find((module) => module.projectId === id);
                  if (module) form.setFieldsValue({ id: module.projectId, name: module.label });
                }}
              />
            </Form.Item>
          )}
          <Form.Item
            name="id"
            label="项目编码"
            rules={[{ required: true, pattern: /^[a-z0-9][a-z0-9-]{1,63}$/ }]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="name" label="项目名称" rules={[{ required: true, max: 160 }]}>
            <Input />
          </Form.Item>
          <Form.Item name="description" label="说明">
            <Input.TextArea maxLength={2000} />
          </Form.Item>
          <Form.Item name="icon" label="项目图标">
            <Select options={projectIcons} />
          </Form.Item>
          <Form.Item name="position" label="排序">
            <InputNumber min={0} max={100000} />
          </Form.Item>
          {error && <Alert type="error" title={error} style={{ marginBottom: 16 }} />}
          <Button htmlType="submit" type="primary" disabled={pending} loading={pending}>
            创建项目
          </Button>
        </Form>
      </Modal>
    </section>
  );
}
