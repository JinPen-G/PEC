import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { ColumnsType } from 'antd/es/table';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import type { PagePrdLinks, ProjectManifest } from '../../../../packages/platform-contracts/src/index.js';
import { platformApi } from '@/data/platform-api';
import { platformQueryKeys, useDocumentManifest, useProjectManifest } from '@/data/use-platform-data';
import { usePlatformLocale } from '@/features/locale/platform-locale';
import { mergePagePrdLinks, pagePrdLinkFor, updatePagePrdOverride } from '@/features/routes/prd-links';
import {
  formatOrder,
  moveInArray,
  moveRoutePage,
  moveRouteSection,
  routeGroups,
  routeOrderSignature,
  type RouteClient,
  type RoutePage,
  type RouteSection,
} from '@/features/routes/route-model';
import {
  Alert,
  Button,
  Collapse,
  Empty,
  Form,
  Input,
  Modal,
  Select,
  Spin,
  Switch,
  Table,
  Tag,
  Tooltip,
  Tabs,
  Typography,
} from '@/ui/ant';
import {
  ArrowDownOutlined,
  ArrowRightOutlined,
  ArrowUpOutlined,
  EditOutlined,
  LinkOutlined,
  PlusOutlined,
  ReloadOutlined,
} from '@/ui/ant/icons';
import { PlatformPage } from '@/ui/platform/PlatformPage';
import { Surface } from '@/ui/platform/Surface';

const { Text, Title } = Typography;

const iconOptions = [
  'Calendar',
  'CirclePlus',
  'DataBoard',
  'Document',
  'Files',
  'House',
  'List',
  'Location',
  'Lock',
  'Management',
  'Medal',
  'Money',
  'Odometer',
  'Postcard',
  'Setting',
  'Tickets',
  'User',
  'Van',
  'Warning',
];

interface RouteData {
  project: { id: string; name: string; version?: string };
  clients: RouteClient[];
  backups: Array<Record<string, unknown>>;
  sectionBackups: Array<Record<string, unknown>>;
  readOnly?: boolean;
}
interface RouteForm {
  client: string;
  originalPath: string;
  routePath: string;
  pageTitle: string;
  menuSection: string;
  menuIcon: string;
}
interface PrdTarget {
  client: RouteClient;
  page: RoutePage;
}
interface RouteWorkspaceState {
  source: RouteData;
  clients: RouteClient[];
  snapshots: Record<string, string>;
}
interface PageBackup {
  id: string;
  type?: string;
  createdAt?: string;
  restoredAt?: string;
  client?: string;
  original?: { title?: string; path?: string };
}
interface SectionBackup {
  id: string;
  createdAt?: string;
  restoredAt?: string;
  client?: string;
  original?: RouteSection[];
  replacement?: RouteSection[];
}

function initialRouteForm(client: RouteClient, page?: RoutePage): RouteForm {
  return {
    client: client.id,
    originalPath: page?.path || '',
    routePath: page?.path || '',
    pageTitle: page?.title || '',
    menuSection: page?.section || client.sections[0]?.id || '',
    menuIcon: page?.icon || 'Document',
  };
}

function createWorkspaceState(source: RouteData): RouteWorkspaceState {
  return {
    source,
    clients: source.clients,
    snapshots: Object.fromEntries(source.clients.map((client) => [client.id, routeOrderSignature(client)])),
  };
}

export function ProjectRoutesPage() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const projectsQuery = useProjectManifest();
  const projects = projectsQuery.data?.projects ?? [];
  const [selectedProjectId, setSelectedProjectId] = useState(searchParams.get('project') || '');
  const projectId = selectedProjectId || searchParams.get('project') || projects[0]?.id || '';
  const [activeClientId, setActiveClientId] = useState('');
  const [workspaceState, setWorkspaceState] = useState<RouteWorkspaceState | null>(null);
  const [openGroups, setOpenGroups] = useState<string[]>([]);
  const [routeDialog, setRouteDialog] = useState<{ mode: 'create' | 'edit'; form: RouteForm } | null>(null);
  const [sectionsDialog, setSectionsDialog] = useState<{
    client: RouteClient;
    sections: Array<RouteSection & { isNew?: boolean }>;
  } | null>(null);
  const [prdTarget, setPrdTarget] = useState<PrdTarget | null>(null);
  const [prdPath, setPrdPath] = useState('');
  const [actionError, setActionError] = useState('');
  const project = projects.find((item) => item.id === projectId) || null;
  const routeQuery = useQuery({
    queryKey: ['platform', 'routes', projectId],
    queryFn: () => platformApi.listRoutes(projectId),
    enabled: Boolean(projectId),
    staleTime: 0,
  });
  const documentsQuery = useDocumentManifest(projectId, Boolean(prdTarget));
  const pageLinksQuery = useQuery({
    queryKey: platformQueryKeys.pagePrdLinks(projectId),
    queryFn: () => platformApi.loadPagePrdLinks(projectId),
    enabled: Boolean(projectId),
    staleTime: 0,
  });
  const baseLinks = ((project as (ProjectManifest & { pagePrdLinks?: PagePrdLinks }) | null)?.pagePrdLinks ||
    {}) as PagePrdLinks;
  const pageLinks = mergePagePrdLinks(baseLinks, pageLinksQuery.data || {});
  const routeData = routeQuery.data as RouteData | undefined;
  const workspace =
    workspaceState?.source === routeData
      ? workspaceState
      : routeData
        ? createWorkspaceState(routeData)
        : null;
  const localClients = workspace?.clients ?? [];
  const selectedClient =
    localClients.find((client) => client.id === activeClientId) || localClients[0] || null;

  const mutateRoute = useMutation({
    mutationFn: async ({
      action,
      target,
    }: {
      action: Parameters<typeof platformApi.mutateRoute>[0];
      target: Record<string, unknown>;
    }) => platformApi.mutateRoute(action, target),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['platform', 'routes', projectId] });
    },
    onError: (error: Error) => setActionError(error.message),
  });
  const savePageLink = useMutation({
    mutationFn: async (links: PagePrdLinks) => platformApi.savePagePrdLinks(projectId, links),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: platformQueryKeys.pagePrdLinks(projectId) });
      setPrdTarget(null);
    },
    onError: (error: Error) => setActionError(error.message),
  });

  const metrics = {
    pages: localClients.reduce((total, client) => total + client.pages.length, 0),
    backups: (routeData?.backups.length || 0) + (routeData?.sectionBackups.length || 0),
  };
  const isDirty = (client: RouteClient) => workspace?.snapshots[client.id] !== routeOrderSignature(client);

  function updateWorkspace(updater: (current: RouteWorkspaceState) => RouteWorkspaceState) {
    if (!routeData) return;
    setWorkspaceState((current) =>
      updater(current?.source === routeData ? current : createWorkspaceState(routeData)),
    );
  }
  function replaceClient(next: RouteClient) {
    updateWorkspace((current) => ({
      ...current,
      clients: current.clients.map((client) => (client.id === next.id ? next : client)),
    }));
  }
  function toggleGroup(client: RouteClient, groupId: string) {
    const key = `${client.id}:${groupId}`;
    setOpenGroups((keys) => (keys.includes(key) ? keys.filter((item) => item !== key) : [...keys, key]));
  }
  async function saveOrder(client: RouteClient) {
    const pageOrder = Object.fromEntries(
      routeGroups(client)
        .filter((group) => !group.isUngrouped)
        .map((group) => [group.id, group.pages.map((page) => page.name)]),
    );
    await mutateRoute.mutateAsync({
      action: 'order',
      target: {
        projectId,
        client: client.id,
        sectionOrder: client.sections.map((section) => section.id),
        pageOrder,
      },
    });
    updateWorkspace((current) => ({
      ...current,
      snapshots: { ...current.snapshots, [client.id]: routeOrderSignature(client) },
    }));
  }
  async function submitRoute() {
    if (!routeDialog) return;
    await mutateRoute.mutateAsync({
      action: routeDialog.mode === 'edit' ? 'update' : 'create',
      target: {
        projectId,
        ...routeDialog.form,
      },
    });
    setRouteDialog(null);
  }
  async function saveSections() {
    if (!sectionsDialog) return;
    await mutateRoute.mutateAsync({
      action: 'section-update',
      target: {
        projectId,
        client: sectionsDialog.client.id,
        sections: sectionsDialog.sections.map(({ id, title }) => ({ id, title })),
      },
    });
    setSectionsDialog(null);
  }
  async function savePrdLink() {
    if (!prdTarget) return;
    const next = updatePagePrdOverride(
      pageLinksQuery.data || {},
      prdTarget.client.id,
      prdTarget.page.name,
      prdPath || null,
    );
    await savePageLink.mutateAsync(next);
  }
  function addSection() {
    if (!sectionsDialog) return;
    let index = sectionsDialog.sections.length + 1;
    let id = `group-${index}`;
    while (sectionsDialog.sections.some((section) => section.id === id)) {
      index += 1;
      id = `group-${index}`;
    }
    setSectionsDialog({
      ...sectionsDialog,
      sections: [...sectionsDialog.sections, { id, title: t('routes.sections.newSection'), isNew: true }],
    });
  }

  return (
    <PlatformPage
      title={t('routes.header.title')}
      description={t('routes.header.description')}
      actions={
        <>
          <Select
            value={projectId || undefined}
            placeholder={t('common.action.selectProject')}
            onChange={setSelectedProjectId}
            options={projects.map((item) => ({ value: item.id, label: item.name }))}
          />
          <Button
            icon={<ReloadOutlined />}
            loading={routeQuery.isFetching}
            onClick={() => void routeQuery.refetch()}
          >
            {t('routes.header.reload')}
          </Button>
        </>
      }
    >
      <Alert
        type="info"
        showIcon
        title={t('routes.alert.createHint')}
      />
      {routeQuery.isError ? (
        <Alert type="error" showIcon title={t('routes.alert.loadFailed')} description={routeQuery.error.message} />
      ) : null}
      {actionError ? (
        <Alert
          type="error"
          showIcon
          closable={{ onClose: () => setActionError('') }}
          title={t('routes.alert.actionFailed')}
          description={actionError}
        />
      ) : null}
      {routeQuery.isPending ? (
        <div className="page-loading">
          <Spin size="large" />
        </div>
      ) : routeData ? (
        <>
          {routeData.readOnly ? (
            <Alert
              type="info"
              showIcon
              title={t('routes.alert.readOnlyTitle')}
              description={t('routes.alert.readOnlyDescription')}
            />
          ) : null}
          <Surface className="routes-overview">
            <div>
              <Title level={2}>{routeData.project.name}</Title>
              <Text type="secondary">
                {routeData.project.id} · {routeData.project.version || t('routes.overview.versionNotSet')}
              </Text>
            </div>
            <div className="routes-metrics">
              <Metric label={t('common.field.client')} value={localClients.length} detail={t('routes.overview.metric.clientsDetail')} />
              <Metric label={t('routes.overview.metric.pages')} value={metrics.pages} detail={t('routes.overview.metric.pagesDetail')} />
              <Metric label={t('routes.overview.metric.backups')} value={metrics.backups} detail={t('routes.overview.metric.backupsDetail')} />
            </div>
          </Surface>
          <Surface className="routes-panel">
            <div className="routes-panel__heading">
              <div>
                <Title level={2}>{t('routes.panel.title')}</Title>
                <Text type="secondary">{t('routes.panel.description')}</Text>
              </div>
              <Tag>{t('routes.panel.clientCount', { count: localClients.length })}</Tag>
            </div>
            <Tabs
              className="route-client-tabs"
              activeKey={selectedClient?.id}
              items={localClients.map((client) => ({ key: client.id, label: client.name }))}
              onChange={setActiveClientId}
            />
            {selectedClient ? (
              <RouteClientWorkspace
                client={selectedClient}
                pageLinks={pageLinks}
                openGroups={openGroups}
                busy={mutateRoute.isPending}
                dirty={isDirty(selectedClient)}
                onToggle={(group) => toggleGroup(selectedClient, group)}
                onMoveSection={(index, direction) =>
                  replaceClient(moveRouteSection(selectedClient, index, direction))
                }
                onMovePage={(section, index, direction) =>
                  replaceClient(moveRoutePage(selectedClient, section, index, direction))
                }
                onSaveOrder={() => void saveOrder(selectedClient)}
                onEditSections={() =>
                  setSectionsDialog({
                    client: selectedClient,
                    sections: selectedClient.sections.map((section) => ({ ...section })),
                  })
                }
                onCreate={() => setRouteDialog({ mode: 'create', form: initialRouteForm(selectedClient) })}
                onEdit={(page) =>
                  setRouteDialog({ mode: 'edit', form: initialRouteForm(selectedClient, page) })
                }
                onPrd={(page) => {
                  setPrdTarget({ client: selectedClient, page });
                  setPrdPath(pagePrdLinkFor(pageLinks, selectedClient.id, page.name));
                }}
                onToggleMenu={(page, menu) => {
                  void mutateRoute.mutateAsync({
                    action: 'page-menu',
                    target: { projectId, client: selectedClient.id, page: page.name, menu },
                  });
                }}
                canWrite={platformApi.development}
              />
            ) : (
              <Empty description={t('routes.empty.noClients')} />
            )}
          </Surface>
          <BackupPanels
            backups={routeData.backups as unknown as PageBackup[]}
            sectionBackups={routeData.sectionBackups as unknown as SectionBackup[]}
            busy={mutateRoute.isPending}
            onRestore={(backupId) =>
              void mutateRoute.mutate({ action: 'restore', target: { projectId, backupId } })
            }
            onRestoreSections={(backupId) =>
              void mutateRoute.mutate({ action: 'section-restore', target: { projectId, backupId } })
            }
          />
        </>
      ) : (
        <Empty description={t('common.empty.selectProject')} />
      )}
      {routeDialog ? (
        <RouteDialog
          dialog={routeDialog}
          clients={localClients}
          busy={mutateRoute.isPending}
          onCancel={() => setRouteDialog(null)}
          onChange={(form) => setRouteDialog({ ...routeDialog, form })}
          onSubmit={() => void submitRoute()}
        />
      ) : null}
      {sectionsDialog ? (
        <SectionsDialog
          dialog={sectionsDialog}
          busy={mutateRoute.isPending}
          onCancel={() => setSectionsDialog(null)}
          onChange={(sections) => setSectionsDialog({ ...sectionsDialog, sections })}
          onAdd={addSection}
          onSubmit={() => void saveSections()}
        />
      ) : null}
      {prdTarget ? (
        <PrdDialog
          target={prdTarget}
          documents={documentsQuery.data?.documents || []}
          value={prdPath}
          busy={savePageLink.isPending}
          onChange={setPrdPath}
          onCancel={() => setPrdTarget(null)}
          onSave={() => void savePrdLink()}
        />
      ) : null}
    </PlatformPage>
  );
}

function Metric({ label, value, detail }: { label: string; value: number; detail: string }) {
  return (
    <div className="routes-metric">
      <Text>{label}</Text>
      <strong>{value}</strong>
      <small>{detail}</small>
    </div>
  );
}

function RouteClientWorkspace({
  client,
  pageLinks,
  openGroups,
  busy,
  dirty,
  onToggle,
  onMoveSection,
  onMovePage,
  onSaveOrder,
  onEditSections,
  onCreate,
  onEdit,
  onPrd,
  onToggleMenu,
  canWrite,
}: {
  client: RouteClient;
  pageLinks: PagePrdLinks;
  openGroups: string[];
  busy: boolean;
  dirty: boolean;
  onToggle: (group: string) => void;
  onMoveSection: (index: number, direction: -1 | 1) => void;
  onMovePage: (section: string, index: number, direction: -1 | 1) => void;
  onSaveOrder: () => void;
  onEditSections: () => void;
  onCreate: () => void;
  onEdit: (page: RoutePage) => void;
  onPrd: (page: RoutePage) => void;
  onToggleMenu: (page: RoutePage, menu: boolean) => void;
  canWrite: boolean;
}) {
  const { t } = useTranslation();
  return (
    <>
      <div className="route-client-toolbar">
        <div>
          <strong>{client.name}</strong>
          <Text type="secondary">
            {client.basePath} · {t('routes.workspace.routeCount', { count: client.pages.length })}
          </Text>
        </div>
        <div>
          <Button icon={<EditOutlined />} onClick={onEditSections}>
            {t('routes.workspace.editSections')}
          </Button>
          <Button type={dirty ? 'primary' : 'default'} loading={busy} disabled={!dirty} onClick={onSaveOrder}>
            {t('routes.workspace.saveOrder')}
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={onCreate}>
            {t('routes.workspace.addRoute')}
          </Button>
        </div>
      </div>
      <div className="route-order-hint">
        <span>
          <b>01</b> {t('routes.workspace.hint.groupOrder')}
        </span>
        <span>
          <b>01</b> {t('routes.workspace.hint.itemOrder')}
        </span>
        <span>{t('routes.workspace.hint.saveReminder')}</span>
      </div>
      <div className="route-groups">
        {routeGroups(client).map((group, groupIndex) => {
          const key = `${client.id}:${group.id}`;
          const opened = openGroups.includes(key);
          return (
            <article key={key} className="route-group">
              <header>
                <Button type="text" className="route-group__toggle" onClick={() => onToggle(group.id)}>
                  <span className="route-order-badge">{formatOrder(groupIndex)}</span>
                  <span>
                    <strong>{group.title}</strong>
                    <small>
                      {group.isUngrouped ? t('routes.group.ungroupedHint') : group.id}
                    </small>
                  </span>
                  <Tag>{t('routes.workspace.routeCount', { count: group.pages.length })}</Tag>
                  <ArrowRightOutlined className={opened ? 'is-open' : ''} />
                </Button>
                {!group.isUngrouped ? (
                  <span className="route-move-buttons">
                    <Button
                      size="small"
                      type="text"
                      disabled={group.sectionIndex === 0}
                      icon={<ArrowUpOutlined />}
                      onClick={() => onMoveSection(group.sectionIndex, -1)}
                    />
                    <Button
                      size="small"
                      type="text"
                      disabled={group.sectionIndex === client.sections.length - 1}
                      icon={<ArrowDownOutlined />}
                      onClick={() => onMoveSection(group.sectionIndex, 1)}
                    />
                  </span>
                ) : null}
              </header>
              <Collapse
                activeKey={opened ? ['pages'] : []}
                ghost
                items={[
                  {
                    key: 'pages',
                    showArrow: false,
                    label: null,
                    children: (
                      <RouteTable
                        client={client}
                        group={group}
                        pageLinks={pageLinks}
                        onMove={onMovePage}
                        onEdit={onEdit}
                        onPrd={onPrd}
                        onToggleMenu={onToggleMenu}
                        canWrite={canWrite}
                      />
                    ),
                  },
                ]}
              />
            </article>
          );
        })}
      </div>
    </>
  );
}

function RouteTable({
  client,
  group,
  pageLinks,
  onMove,
  onEdit,
  onPrd,
  onToggleMenu,
  canWrite,
}: {
  client: RouteClient;
  group: ReturnType<typeof routeGroups>[number];
  pageLinks: PagePrdLinks;
  onMove: (section: string, index: number, direction: -1 | 1) => void;
  onEdit: (page: RoutePage) => void;
  onPrd: (page: RoutePage) => void;
  onToggleMenu: (page: RoutePage, menu: boolean) => void;
  canWrite: boolean;
}) {
  const { t } = useTranslation();
  function routeType(page: RoutePage) {
    if (page.sourceType === 'html-direct') return t('routes.routeType.htmlDirect');
    if (page.sourceType === 'html-template') return t('routes.routeType.htmlTemplate');
    return t('routes.routeType.htmlPage');
  }
  return (
    <Table
      rowKey="name"
      size="small"
      pagination={false}
      scroll={{ x: 780 }}
      dataSource={group.pages}
      columns={[
        {
          title: t('routes.table.order'),
          width: 62,
          render: (_value, _row, index) => (
            <span className="route-order-badge route-order-badge--small">{formatOrder(index)}</span>
          ),
        },
        {
          title: t('routes.table.menuName'),
          dataIndex: 'title',
          minWidth: 180,
          render: (value, page: RoutePage) => (
            <div>
              <strong>{value}</strong>
              <Tag color={page.sourceType === 'html-direct' ? 'green' : 'blue'}>{routeType(page)}</Tag>
            </div>
          ),
        },
        {
          title: t('routes.table.menuVisible'),
          width: 92,
          render: (_value, page: RoutePage) => (
            <Tooltip
              title={page.menu === false ? t('routes.table.hiddenTooltip') : t('routes.table.visibleTooltip')}
            >
              <Switch
                size="small"
                checked={page.menu !== false}
                disabled={!canWrite}
                onChange={(checked) => onToggleMenu(page, checked)}
              />
            </Tooltip>
          ),
        },
        {
          title: t('routes.table.route'),
          dataIndex: 'path',
          minWidth: 180,
          render: (value) => (
            <code>
              {client.basePath}/{value}
            </code>
          ),
        },
        {
          title: t('routes.table.pageInfo'),
          minWidth: 200,
          render: (_value, page: RoutePage) => (
            <div>
              <small>{page.source || t('routes.table.sourceMissing')}</small>
              {pagePrdLinkFor(pageLinks, client.id, page.name) ? (
                <Tag color="success">{t('routes.table.prdLinked')}</Tag>
              ) : (
                <Tag>{t('routes.table.prdNotLinked')}</Tag>
              )}
            </div>
          ),
        },
        {
          title: t('common.column.actions'),
          width: 235,
          render: (_value, page: RoutePage, index) => (
            <div className="route-table-actions">
              <Button
                size="small"
                type="text"
                disabled={group.isUngrouped || index === 0}
                icon={<ArrowUpOutlined />}
                onClick={() => onMove(group.id, index, -1)}
              />
              <Button
                size="small"
                type="text"
                disabled={group.isUngrouped || index === group.pages.length - 1}
                icon={<ArrowDownOutlined />}
                onClick={() => onMove(group.id, index, 1)}
              />
              {!['html-direct', 'html-template'].includes(page.sourceType || '') ? (
                <Button type="link" onClick={() => onEdit(page)}>
                  {t('common.action.edit')}
                </Button>
              ) : null}
              <Button type="link" icon={<LinkOutlined />} onClick={() => onPrd(page)}>
                {pagePrdLinkFor(pageLinks, client.id, page.name)
                  ? t('routes.table.editPrd')
                  : t('routes.table.linkPrd')}
              </Button>
              {page.sourceType === 'html-direct' ? (
                <small>{t('routes.table.htmlDirectoryManaged')}</small>
              ) : page.sourceType === 'html-template' ? (
                <small>{t('routes.table.htmlFileManaged')}</small>
              ) : null}
            </div>
          ),
        },
      ]}
    />
  );
}

function RouteDialog({
  dialog,
  clients,
  busy,
  onCancel,
  onChange,
  onSubmit,
}: {
  dialog: { mode: 'create' | 'edit'; form: RouteForm };
  clients: RouteClient[];
  busy: boolean;
  onCancel: () => void;
  onChange: (form: RouteForm) => void;
  onSubmit: () => void;
}) {
  const { t } = useTranslation();
  const client = clients.find((item) => item.id === dialog.form.client) || clients[0];
  return (
    <Modal
      title={dialog.mode === 'edit' ? t('routes.dialog.editTitle') : t('routes.dialog.createTitle')}
      open
      footer={
        <>
          <Button onClick={onCancel}>{t('common.action.cancel')}</Button>
          <Button type="primary" loading={busy} onClick={onSubmit}>
            {dialog.mode === 'edit' ? t('routes.dialog.saveChanges') : t('routes.dialog.generate')}
          </Button>
        </>
      }
      onCancel={onCancel}
    >
      <Text type="secondary">{t('routes.dialog.info')}</Text>
      <Form layout="vertical">
        <Form.Item label={t('common.field.client')}>
          <Select
            value={dialog.form.client}
            options={clients.map((item) => ({ value: item.id, label: item.name }))}
            onChange={(clientId) => {
              const next = clients.find((item) => item.id === clientId) || client;
              onChange({
                ...dialog.form,
                client: clientId,
                menuSection: next.sections.some((section) => section.id === dialog.form.menuSection)
                  ? dialog.form.menuSection
                  : next.sections[0]?.id || '',
              });
            }}
          />
        </Form.Item>
        <Form.Item label={t('routes.dialog.routePath')}>
          <Input
            value={dialog.form.routePath}
            placeholder={t('routes.dialog.routePathPlaceholder')}
            onChange={(event) => onChange({ ...dialog.form, routePath: event.target.value })}
          />
        </Form.Item>
        <Form.Item label={t('routes.dialog.routeName')}>
          <Input
            value={dialog.form.pageTitle}
            placeholder={t('routes.dialog.routeNamePlaceholder')}
            onChange={(event) => onChange({ ...dialog.form, pageTitle: event.target.value })}
          />
        </Form.Item>
        <div className="route-form-grid">
          <Form.Item label={t('routes.dialog.menuSection')}>
            <Select
              value={dialog.form.menuSection}
              options={(client?.sections || []).map((section) => ({
                value: section.id,
                label: section.title,
              }))}
              onChange={(menuSection) => onChange({ ...dialog.form, menuSection })}
            />
          </Form.Item>
          <Form.Item label={t('routes.dialog.menuIcon')}>
            <Select
              value={dialog.form.menuIcon}
              options={iconOptions.map((value) => ({ value, label: value }))}
              onChange={(menuIcon) => onChange({ ...dialog.form, menuIcon })}
            />
          </Form.Item>
        </div>
      </Form>
    </Modal>
  );
}

function SectionsDialog({
  dialog,
  busy,
  onCancel,
  onChange,
  onAdd,
  onSubmit,
}: {
  dialog: { client: RouteClient; sections: Array<RouteSection & { isNew?: boolean }> };
  busy: boolean;
  onCancel: () => void;
  onChange: (sections: Array<RouteSection & { isNew?: boolean }>) => void;
  onAdd: () => void;
  onSubmit: () => void;
}) {
  const { t } = useTranslation();
  return (
    <Modal
      title={t('routes.sections.title')}
      width={680}
      open
      footer={
        <>
          <Button onClick={onCancel}>{t('common.action.cancel')}</Button>
          <Button type="primary" loading={busy} onClick={onSubmit}>
            {t('routes.sections.save')}
          </Button>
        </>
      }
      onCancel={onCancel}
    >
      <div className="sections-dialog-heading">
        <Text type="secondary">{t('routes.sections.hint')}</Text>
        <Button size="small" icon={<PlusOutlined />} onClick={onAdd}>
          {t('routes.sections.add')}
        </Button>
      </div>
      <div className="section-editor-list">
        {dialog.sections.map((section, index) => (
          <div key={`${section.id}-${index}`}>
            <span className="route-order-badge route-order-badge--small">{formatOrder(index)}</span>
            <Button
              size="small"
              type="text"
              disabled={index === 0}
              icon={<ArrowUpOutlined />}
              onClick={() => onChange(moveInArray(dialog.sections, index, -1))}
            />
            <Button
              size="small"
              type="text"
              disabled={index === dialog.sections.length - 1}
              icon={<ArrowDownOutlined />}
              onClick={() => onChange(moveInArray(dialog.sections, index, 1))}
            />
            <Input
              value={section.id}
              disabled={!section.isNew}
              onChange={(event) =>
                onChange(
                  dialog.sections.map((item, itemIndex) =>
                    itemIndex === index ? { ...item, id: event.target.value } : item,
                  ),
                )
              }
            />
            <Input
              value={section.title}
              onChange={(event) =>
                onChange(
                  dialog.sections.map((item, itemIndex) =>
                    itemIndex === index ? { ...item, title: event.target.value } : item,
                  ),
                )
              }
            />
            <Button
              danger
              type="link"
              onClick={() => onChange(dialog.sections.filter((_, itemIndex) => itemIndex !== index))}
            >
              {t('routes.sections.delete')}
            </Button>
          </div>
        ))}
      </div>
    </Modal>
  );
}

function PrdDialog({
  target,
  documents,
  value,
  busy,
  onChange,
  onCancel,
  onSave,
}: {
  target: PrdTarget;
  documents: Array<{ path: string; title?: string }>;
  value: string;
  busy: boolean;
  onChange: (value: string) => void;
  onCancel: () => void;
  onSave: () => void;
}) {
  const { t } = useTranslation();
  return (
    <Modal
      title={t('routes.prd.title')}
      open
      footer={
        <>
          <Button onClick={onCancel}>{t('common.action.cancel')}</Button>
          <Button type="primary" loading={busy} onClick={onSave}>
            {t('routes.prd.save')}
          </Button>
        </>
      }
      onCancel={onCancel}
    >
      <div className="prd-dialog-target">
        <strong>
          {target.client.name} · {target.page.title}
        </strong>
        <code>
          {target.client.basePath}/{target.page.path}
        </code>
      </div>
      <Form layout="vertical">
        <Form.Item label={t('routes.prd.document')}>
          <Select
            allowClear
            showSearch
            value={value || undefined}
            loading={!documents.length}
            placeholder={t('routes.prd.placeholder')}
            options={documents.map((document) => ({
              value: document.path,
              label: `${document.title || document.path} · ${document.path}`,
            }))}
            onChange={(path) => onChange(path || '')}
          />
          <Text type="secondary">{t('routes.prd.clearHint')}</Text>
        </Form.Item>
      </Form>
    </Modal>
  );
}

function BackupPanels({
  backups,
  sectionBackups,
  busy,
  onRestore,
  onRestoreSections,
}: {
  backups: PageBackup[];
  sectionBackups: SectionBackup[];
  busy: boolean;
  onRestore: (id: string) => void;
  onRestoreSections: (id: string) => void;
}) {
  const { t } = useTranslation();
  const { locale } = usePlatformLocale();
  const dateLocale = locale === 'en' ? 'en' : 'zh-CN';
  const backupColumns: ColumnsType<PageBackup> = [
    {
      title: t('routes.backup.type'),
      dataIndex: 'type',
      width: 120,
      render: (type: string | undefined) => (
        <Tag color={type === 'deleted' ? 'error' : 'warning'}>
          {type === 'deleted'
            ? t('routes.backup.typeDeleted')
            : type === 'edited'
              ? t('routes.backup.typeEdited')
              : t('routes.backup.typeReplaced')}
        </Tag>
      ),
    },
    {
      title: t('routes.backup.originalPage'),
      key: 'page',
      render: (_: unknown, row) => (
        <div>
          <strong>{row.original?.title || '-'}</strong>
          <small>
            {row.client}/{row.original?.path}
          </small>
        </div>
      ),
    },
    {
      title: t('routes.backup.backupTime'),
      dataIndex: 'createdAt',
      width: 190,
      render: (value: string | undefined) =>
        value ? new Date(value).toLocaleString(dateLocale, { hour12: false }) : '-',
    },
    {
      title: t('common.column.actions'),
      width: 100,
      render: (_: unknown, row) => (
        <Button type="link" disabled={busy || Boolean(row.restoredAt)} onClick={() => onRestore(row.id)}>
          {t('common.action.restore')}
        </Button>
      ),
    },
  ];
  const sectionColumns: ColumnsType<SectionBackup> = [
    { title: t('common.field.client'), dataIndex: 'client', width: 130 },
    {
      title: t('routes.backup.sectionChanges'),
      key: 'sections',
      render: (_: unknown, row) => (
        <div>
          {row.replacement?.map((section) => (
            <p key={section.id}>
              {row.original?.find((item) => item.id === section.id)?.title || '-'} <ArrowRightOutlined />{' '}
              <strong>{section.title}</strong>
            </p>
          ))}
        </div>
      ),
    },
    {
      title: t('routes.backup.modifiedTime'),
      dataIndex: 'createdAt',
      width: 190,
      render: (value: string | undefined) =>
        value ? new Date(value).toLocaleString(dateLocale, { hour12: false }) : '-',
    },
    {
      title: t('common.column.actions'),
      width: 100,
      render: (_: unknown, row) => (
        <Button
          type="link"
          disabled={busy || Boolean(row.restoredAt)}
          onClick={() => onRestoreSections(row.id)}
        >
          {t('common.action.restore')}
        </Button>
      ),
    },
  ];
  return (
    <>
      <section className="backup-panel platform-surface">
        <div>
          <Title level={2}>{t('routes.backup.pagesTitle')}</Title>
          <Tag color="warning">{t('routes.backup.count', { count: backups.length })}</Tag>
        </div>
        <Table<PageBackup>
          rowKey="id"
          pagination={false}
          dataSource={backups}
          columns={backupColumns}
          scroll={{ x: 700 }}
        />
      </section>
      <section className="backup-panel platform-surface">
        <div>
          <Title level={2}>{t('routes.backup.sectionsTitle')}</Title>
          <Tag color="warning">{t('routes.backup.count', { count: sectionBackups.length })}</Tag>
        </div>
        <Table<SectionBackup>
          rowKey="id"
          pagination={false}
          dataSource={sectionBackups}
          columns={sectionColumns}
          scroll={{ x: 650 }}
        />
      </section>
    </>
  );
}
