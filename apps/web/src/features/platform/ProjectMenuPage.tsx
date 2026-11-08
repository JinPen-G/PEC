import { LoadingStage } from '@preview/ui/loading';
import { SearchField } from '@preview/ui/admin';
/** Project/client/page lifecycle over the revisioned platform API. Registered
 * components supply executable code; this screen only edits allowed metadata. */
import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Alert,
  Empty,
  Form,
  Input,
  InputNumber,
  Modal,
  Select,
  Switch,
  Table,
  Tabs,
  Tag,
} from '@preview/ui/admin';
import { ArrowDown, ArrowUp, Copy, ExternalLink, Plus } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@preview/ui/admin';
import { NATIVE_MODULES, nativePageUrl } from '../../../../../packages/platform-contracts/src/platform';
import type { PageManagement } from '../../../../../packages/platform-contracts/src/platform';
import { useNativeAuth, useNativeQuery, type NativeProject, type NativeClient } from './platform-api';
import { QueryFailure } from './PageLayout';
type Page = NativeClient['pages'][number];

export function ProjectMenuPage({ projectId }: { projectId: string }) {
  return (
    <div>
      <ProjectMenus key={projectId} projectId={projectId} />
    </div>
  );
}
function ProjectMenus({ projectId }: { projectId: string }) {
  const { client } = useNativeAuth(),
    cache = useQueryClient();
  const query = useNativeQuery<PageManagement>(`/projects/${projectId}/page-management`);
  const [chosen, setChosen] = useState(''),
    [search, setSearch] = useState(''),
    [error, setError] = useState(''),
    [pending, setPending] = useState(false),
    [notice, setNotice] = useState('');
  const [editing, setEditing] = useState<{
    original: string;
    clientId: string;
    project: NativeProject;
  } | null>(null);
  const [groupEdit, setGroupEdit] = useState<{
    name: string;
    clientId: string;
    project: NativeProject;
  } | null>(null);
  const [removing, setRemoving] = useState<{ page: Page; clientId: string; project: NativeProject } | null>(
    null,
  );
  const [form] = Form.useForm(),
    [groupForm] = Form.useForm();
  if (query.error) return <QueryFailure message={query.error.message} retry={() => void query.refetch()} />;
  if (!query.data) return <LoadingStage label="读取页面配置…" />;
  const project = query.data.project;
  const clients = [...project.clients].sort((a, b) => a.position - b.position);
  const current = clients.find((c) => c.id === chosen) ?? clients[0];
  const registered =
    NATIVE_MODULES.find((m) => m.key === project.moduleKey)?.pages.filter((page) => page.source) ?? [];
  const pages = current ? [...current.pages].sort((a, b) => a.position - b.position) : [];
  const groups = [...new Set(pages.map((p) => p.group))];
  const admin = project.memberRole === 'admin';
  const update = async (base: NativeProject, changed: NativeProject) => {
    setPending(true);
    setError('');
    setNotice('');
    try {
      await client.request(`/projects/${projectId}`, {
        method: 'PATCH',
        body: { clients: changed.clients, links: changed.links, revision: base.revision },
      });
      await Promise.all([
        cache.invalidateQueries({ queryKey: ['native'] }),
        cache.invalidateQueries({ queryKey: ['showcase-catalog'] }),
        cache.invalidateQueries({ queryKey: ['showcase-detail'] }),
      ]);
      setNotice('页面配置已保存');
      return true;
    } catch (e) {
      setError(e instanceof Error ? e.message : '保存失败');
      return false;
    } finally {
      setPending(false);
    }
  };
  const defaultPage = (c: NativeClient) => {
    if (!c.pages.some((p) => p.key === c.defaultPage && p.visible))
      c.defaultPage = c.pages.filter((p) => p.visible).sort((a, b) => a.position - b.position)[0]?.key ?? '';
  };
  const movePage = async (key: string, delta: number) => {
    if (!current) return;
    const next = structuredClone(project),
      c = next.clients.find((c) => c.id === current.id)!;
    const ordered = [...c.pages].sort((a, b) => a.position - b.position),
      i = ordered.findIndex((p) => p.key === key),
      j = i + delta;
    if (j < 0 || j >= ordered.length) return;
    [ordered[i], ordered[j]] = [ordered[j], ordered[i]];
    c.pages = ordered.map((p, position) => ({ ...p, position }));
    await update(project, next);
  };
  const moveGroup = async (name: string, delta: number) => {
    if (!current) return;
    const order = [...groups],
      i = order.indexOf(name),
      j = i + delta;
    if (j < 0 || j >= order.length) return;
    [order[i], order[j]] = [order[j], order[i]];
    const next = structuredClone(project),
      c = next.clients.find((c) => c.id === current.id)!;
    c.pages = order
      .flatMap((g) => pages.filter((p) => p.group === g))
      .map((p, position) => ({ ...p, position }));
    await update(project, next);
  };
  const openPage = (page?: Page) => {
    if (!current) return;
    setError('');
    form.resetFields();
    const available = registered.filter((r) => !current.pages.some((p) => p.key === r.key));
    form.setFieldsValue(
      page
        ? {
            ...page,
            defaultEntry: current.defaultPage === page.key,
          }
        : {
            key: available[0]?.key,
            label: available[0]?.label,
            group: groups[0] ?? '功能页面',
            position: pages.length,
            visible: true,
            access: 'restricted',
            defaultEntry: !pages.length,
          },
    );
    setEditing({ original: page?.key ?? '', clientId: current.id, project: structuredClone(project) });
  };
  const savePage = async (values: Page & { defaultEntry?: boolean }) => {
    if (!editing) return;
    const next = structuredClone(editing.project),
      c = next.clients.find((c) => c.id === editing.clientId)!;
    const page: Page = {
      key: values.key,
      label: values.label,
      group: values.group ?? '',
      position: values.position ?? 0,
      visible: values.visible,
      access: values.access ?? 'restricted',
    };
    c.pages = editing.original
      ? c.pages.map((p) => (p.key === editing.original ? page : p))
      : [...c.pages, page];
    if (values.defaultEntry && page.visible) c.defaultPage = page.key;
    else if (c.defaultPage === page.key) c.defaultPage = '';
    defaultPage(c);
    if (await update(editing.project, next)) setEditing(null);
  };
  const toggle = async (page: Page) => {
    if (!current) return;
    const next = structuredClone(project),
      c = next.clients.find((c) => c.id === current.id)!;
    c.pages = c.pages.map((p) => (p.key === page.key ? { ...p, visible: !p.visible } : p));
    defaultPage(c);
    await update(project, next);
  };
  return (
    <>
      <div className="native-route-toolbar">
        <div>
          <span className="text-meta">
            {pages.length} 个菜单 · {pages.filter((p) => p.access !== 'public').length} 个需授权
          </span>
        </div>
        <div className="native-actions">
          {admin && (
            <Link className="native-route-link" to={`/projects/${projectId}/settings?tab=access`}>
              用户授权
            </Link>
          )}
          {current && (
            <>
              <Button
                type="primary"
                size="small"
                disabled={pending || !registered.some((r) => !pages.some((p) => p.key === r.key))}
                onClick={() => openPage()}
              >
                <Plus size={14} />
                添加菜单
              </Button>
            </>
          )}
        </div>
      </div>
      {error && !editing && !groupEdit && <Alert type="error" title={error} showIcon />}
      {notice && (
        <p role="status" className="text-meta">
          {notice}
        </p>
      )}
      {clients.length > 1 && (
        <Tabs
          activeKey={current?.id}
          onChange={setChosen}
          items={clients.map((c) => ({
            key: c.id,
            label: (
              <>
                {c.name}
                {!c.enabled && ' · 已停用'}
              </>
            ),
          }))}
        />
      )}
      {!current ? (
        <Empty description="暂未添加菜单" />
      ) : (
        <>
          <Table
            toolbar={
              <SearchField
                placeholder="搜索页面名称、注册键或分组"
                value={search}
                onValueChange={setSearch}
              />
            }
            sorting={false}
            onRefresh={() => query.refetch()}
            rowKey="key"
            size="middle"
            pagination={false}
            scroll={{ x: 960 }}
            locale={{
              emptyText: <Empty description="还没有菜单。页面在工程中完成后，可在这里添加并设置访问权限。" />,
            }}
            dataSource={pages.filter((p) =>
              `${p.label} ${p.key} ${p.group}`.toLowerCase().includes(search.toLowerCase()),
            )}
            columns={[
              {
                title: '菜单 / 页面地址',
                render: (_, p: Page) => (
                  <>
                    <strong>{p.label}</strong>
                    <div className="text-meta native-route-path">
                      {nativePageUrl(project, current.id, p.key)}
                    </div>
                  </>
                ),
              },
              { title: '功能分组', dataIndex: 'group' },
              {
                title: '状态',
                render: (_, p: Page) => (
                  <>
                    <Tag>{p.visible && current.enabled ? '已上架' : '已下架'}</Tag>
                    {p.key === current.defaultPage && <Tag>默认入口</Tag>}
                    <Tag>{p.access === 'public' ? '公开' : '需授权'}</Tag>
                  </>
                ),
              },
              {
                title: '关联 PRD',
                render: (_, p: Page) =>
                  query
                    .data!.pages.find((x) => x.clientId === current.id && x.pageKey === p.key)
                    ?.documents.map((d) => d.title)
                    .join('、') || '未关联',
              },
              {
                title: '排序',
                width: 86,
                render: (_, p: Page) => (
                  <div className="native-actions">
                    <Button
                      size="small"
                      aria-label={`上移 ${p.label}`}
                      disabled={pending || pages.indexOf(p) === 0}
                      onClick={() => void movePage(p.key, -1)}
                    >
                      <ArrowUp size={14} />
                    </Button>
                    <Button
                      size="small"
                      aria-label={`下移 ${p.label}`}
                      disabled={pending || pages.indexOf(p) === pages.length - 1}
                      onClick={() => void movePage(p.key, 1)}
                    >
                      <ArrowDown size={14} />
                    </Button>
                  </div>
                ),
              },
              {
                title: '操作',
                render: (_, p: Page) => (
                  <div className="native-actions">
                    <Button size="small" onClick={() => openPage(p)} disabled={pending}>
                      编辑
                    </Button>
                    <Button size="small" onClick={() => void toggle(p)} disabled={pending}>
                      {p.visible ? '下架' : '上架'}
                    </Button>
                    <a
                      href={`#${nativePageUrl(project, current.id, p.key)}`}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={`预览 ${p.label}`}
                    >
                      <ExternalLink size={15} />
                    </a>
                    <Button
                      size="small"
                      aria-label={`复制路由 ${p.label}`}
                      onClick={() =>
                        void navigator.clipboard
                          .writeText(`${location.origin}/#${nativePageUrl(project, current.id, p.key)}`)
                          .then(
                            () => setNotice('页面链接已复制'),
                            () => setError('复制失败，请检查剪贴板权限'),
                          )
                      }
                    >
                      <Copy size={14} />
                    </Button>
                  </div>
                ),
              },
            ]}
          />
          <h2 className="native-route-section-title">功能分组</h2>
          <p className="text-meta">分组按页面顺序展示，移动分组会一起调整所属页面。</p>
          <div className="native-route-groups">
            {groups.map((name, i) => (
              <div key={name}>
                <span>
                  {name || '未分组'} · {pages.filter((p) => p.group === name).length} 页
                </span>
                <div className="native-actions">
                  <Button
                    size="small"
                    aria-label={`上移分组 ${name}`}
                    disabled={pending || i === 0}
                    onClick={() => void moveGroup(name, -1)}
                  >
                    <ArrowUp size={14} />
                  </Button>
                  <Button
                    size="small"
                    aria-label={`下移分组 ${name}`}
                    disabled={pending || i === groups.length - 1}
                    onClick={() => void moveGroup(name, 1)}
                  >
                    <ArrowDown size={14} />
                  </Button>
                  <Button
                    size="small"
                    onClick={() => {
                      groupForm.setFieldsValue({ name });
                      setError('');
                      setGroupEdit({ name, clientId: current.id, project: structuredClone(project) });
                    }}
                  >
                    重命名
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
      <Modal
        open={!!editing}
        title={editing?.original ? '编辑菜单' : '添加菜单'}
        onCancel={pending ? undefined : () => setEditing(null)}
        footer={null}
        destroyOnHidden
      >
        <Form form={form} layout="vertical" disabled={pending} onFinish={(values) => void savePage(values)}>
          <Form.Item name="key" label="页面" rules={[{ required: true }]}>
            <Select
              disabled={!!editing?.original}
              onChange={(key) =>
                form.setFieldValue('label', registered.find((page) => page.key === key)?.label)
              }
              options={registered
                .filter((r) => r.key === editing?.original || !current?.pages.some((p) => p.key === r.key))
                .map((r) => ({ value: r.key, label: `${r.label} · ${r.key}` }))}
            />
          </Form.Item>
          <Form.Item name="label" label="菜单名称" rules={[{ required: true, max: 160 }]}>
            <Input />
          </Form.Item>
          <Form.Item name="group" label="功能分组" rules={[{ max: 80 }]}>
            <Input />
          </Form.Item>
          <Form.Item name="position" label="排序">
            <InputNumber min={0} />
          </Form.Item>
          <Form.Item name="visible" label="上架" valuePropName="checked">
            <Switch />
          </Form.Item>
          <Form.Item
            name="defaultEntry"
            label="默认页面"
            valuePropName="checked"
            extra="默认页面下架或用户没有权限时，打开首个可访问页面。"
          >
            <Switch />
          </Form.Item>
          <Form.Item name="access" label="访问范围">
            <Select
              disabled={!admin}
              options={[
                { value: 'public', label: '公开 · 无需登录' },
                { value: 'restricted', label: '登录并经管理员授权' },
              ]}
            />
          </Form.Item>
          {error && <Alert type="error" title={error} />}
          <Button htmlType="submit" type="primary" loading={pending}>
            保存菜单
          </Button>
          {editing?.original && (
            <Button
              disabled={pending}
              onClick={() =>
                setRemoving({
                  page: editing.project.clients
                    .find((c) => c.id === editing.clientId)!
                    .pages.find((p) => p.key === editing.original)!,
                  clientId: editing.clientId,
                  project: editing.project,
                })
              }
            >
              移除页面绑定
            </Button>
          )}
        </Form>
      </Modal>
      <Modal
        open={!!removing}
        title="移除页面绑定"
        okText="确认移除"
        cancelText="取消"
        confirmLoading={pending}
        onCancel={pending ? undefined : () => setRemoving(null)}
        onOk={() => {
          if (!removing) return;
          const next = structuredClone(removing.project),
            c = next.clients.find((c) => c.id === removing.clientId)!;
          c.pages = c.pages.filter((p) => p.key !== removing.page.key);
          defaultPage(c);
          next.links = next.links.filter((l) => !(l.clientId === c.id && l.pageKey === removing.page.key));
          void update(removing.project, next).then((ok) => {
            if (ok) {
              setRemoving(null);
              setEditing(null);
            }
          });
        }}
      >
        <p>
          移除「{removing?.page.label}」的菜单、文档覆盖与账号页面授权。React 源码保留，可再次添加并重新授权。
        </p>
        {error && <Alert type="error" title={error} />}
      </Modal>
      <Modal
        open={!!groupEdit}
        title="重命名功能分组"
        onCancel={pending ? undefined : () => setGroupEdit(null)}
        footer={null}
      >
        <Form
          form={groupForm}
          layout="vertical"
          disabled={pending}
          onFinish={(values) => {
            if (!groupEdit) return;
            const next = structuredClone(groupEdit.project),
              c = next.clients.find((c) => c.id === groupEdit.clientId)!;
            c.pages = c.pages.map((p) => (p.group === groupEdit.name ? { ...p, group: values.name } : p));
            void update(groupEdit.project, next).then((ok) => {
              if (ok) setGroupEdit(null);
            });
          }}
        >
          <Form.Item name="name" label="分组名称" rules={[{ required: true, max: 80 }]}>
            <Input />
          </Form.Item>
          {error && <Alert type="error" title={error} />}
          <Button htmlType="submit" type="primary" loading={pending}>
            保存分组
          </Button>
        </Form>
      </Modal>
    </>
  );
}
