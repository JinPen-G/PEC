import { useMemo, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { ColumnsType } from 'antd/es/table';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import type { InvalidProject, ProjectManifest } from '../../../../packages/platform-contracts/src/index.js';
import { platformApi } from '@/data/platform-api';
import { platformQueryKeys, useBootstrapState, useProjectManifest } from '@/data/use-platform-data';
import { ProjectConfigDialog } from '@/features/projects/ProjectConfigDialog';
import { ProjectMountDialog } from '@/features/projects/ProjectMountDialog';
import { Alert, Button, Empty, Flex, Modal, Space, Spin, Statistic, Table, Tag, Typography } from '@/ui/ant';
import {
  DisconnectOutlined,
  EditOutlined,
  LinkOutlined,
  OrderedListOutlined,
  PlusOutlined,
  ReloadOutlined,
  SafetyCertificateOutlined,
} from '@/ui/ant/icons';
import { PlatformPage } from '@/ui/platform/PlatformPage';
import { Surface } from '@/ui/platform/Surface';

const { Text, Title } = Typography;

export function ProjectPackagesPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const manifestQuery = useProjectManifest();
  const bootstrapQuery = useBootstrapState();
  const projects = manifestQuery.data?.projects ?? [];
  const invalidProjects = manifestQuery.data?.invalidProjects ?? [];
  const [notice, setNotice] = useState('');
  const [mountOpen, setMountOpen] = useState(false);
  const [dialog, setDialog] = useState<{ mode: 'create' | 'edit'; project: ProjectManifest | null } | null>(
    null,
  );
  const canManageProjects = Boolean(platformApi.development && bootstrapQuery.data?.runtime.writeEnabled);
  const requestedProjectId = new URLSearchParams(location.search).get('project') || '';
  const requestedEdit = new URLSearchParams(location.search).get('edit') === '1';
  const selectedProject = projects.find((project) => project.id === requestedProjectId) ?? null;
  const openDialog =
    dialog || (requestedEdit && selectedProject ? { mode: 'edit' as const, project: selectedProject } : null);
  const saveProject = useMutation({
    mutationFn: (payload: { data: Record<string, unknown>; editing: boolean }) =>
      platformApi.saveProject(payload.data, { editing: payload.editing }),
    onSuccess: async (result) => {
      setNotice(`${result.message || t('packages.notice.savedFallback')} ${t('packages.notice.reloading')}`);
      setDialog(null);
      await queryClient.invalidateQueries({ queryKey: platformQueryKeys.projects });
      await queryClient.invalidateQueries({ queryKey: platformQueryKeys.htmlPages });
    },
  });
  const unmountProject = useMutation({
    mutationFn: (projectId: string) => platformApi.unmountProject(projectId),
    onSuccess: async (result) => {
      setNotice(String(result.message || t('packages.notice.unmountFallback')));
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: platformQueryKeys.projects }),
        queryClient.invalidateQueries({ queryKey: platformQueryKeys.htmlPages }),
        queryClient.invalidateQueries({ queryKey: platformQueryKeys.mounts }),
        queryClient.invalidateQueries({ queryKey: platformQueryKeys.health }),
      ]);
    },
  });

  const columns = useMemo<ColumnsType<ProjectManifest>>(
    () => [
      {
        title: t('packages.table.name'),
        dataIndex: 'name',
        key: 'name',
        minWidth: 180,
        render: (name: string, project) => (
          <div>
            <Text strong>{name}</Text>
            <small className="table-secondary">{project.description || t('packages.project.descriptionMissing')}</small>
          </div>
        ),
      },
      {
        title: t('packages.table.projectId'),
        dataIndex: 'id',
        key: 'id',
        width: 160,
        render: (value) => <code>{value}</code>,
      },
      {
        title: t('packages.table.version'),
        dataIndex: 'version',
        key: 'version',
        width: 100,
        render: (value) => <code>v{value || '1.0'}</code>,
      },
      {
        title: t('common.field.client'),
        dataIndex: 'clients',
        key: 'clients',
        minWidth: 210,
        render: (clients: ProjectManifest['clients']) =>
          clients.length ? (
            clients.map((client) => <Tag key={client.id}>{client.name}</Tag>)
          ) : (
            <Text type="secondary">-</Text>
          ),
      },
      {
        title: t('common.column.status'),
        key: 'status',
        width: 100,
        render: () => <Tag color="success">{t('packages.table.statusAvailable')}</Tag>,
      },
      {
        title: t('packages.table.homepage'),
        key: 'homepage',
        width: 110,
        render: (_, project) => (
          <Tag color={project.homepage?.visible !== false ? 'blue' : 'default'}>
            {project.homepage?.visible !== false ? t('packages.table.visible') : t('packages.table.hidden')}
          </Tag>
        ),
      },
      ...(canManageProjects
        ? [
            {
              title: t('common.column.actions'),
              key: 'action',
              width: 176,
              fixed: 'right' as const,
              render: (_: unknown, project: ProjectManifest) => (
                <Space size={4}>
                  <Button
                    size="small"
                    icon={<EditOutlined />}
                    onClick={() => setDialog({ mode: 'edit', project })}
                  >
                    {t('common.action.edit')}
                  </Button>
                  {project.mounted ? (
                    <Button
                      size="small"
                      danger
                      icon={<DisconnectOutlined />}
                      onClick={() => {
                        Modal.confirm({
                          title: t('packages.table.unmountConfirmTitle', { name: project.name }),
                          content: t('packages.table.unmountConfirmContent'),
                          okText: t('packages.table.unmount'),
                          okButtonProps: { danger: true },
                          cancelText: t('packages.table.unmountCancel'),
                          onOk: () => unmountProject.mutateAsync(project.id),
                        });
                      }}
                    >
                      {t('packages.table.unmount')}
                    </Button>
                  ) : null}
                </Space>
              ),
            },
          ]
        : []),
    ],
    [canManageProjects, unmountProject, t],
  );

  return (
    <PlatformPage
      title={t('packages.header.title')}
      description={t('packages.header.description')}
      actions={
        <>
          {canManageProjects ? (
            <Button icon={<SafetyCertificateOutlined />} onClick={() => navigate('/tools/project-health')}>
              {t('packages.header.healthCheck')}
            </Button>
          ) : null}
          {canManageProjects ? (
            <Button icon={<OrderedListOutlined />} onClick={() => navigate('/tools/project-routes')}>
              {t('packages.header.routeMenu')}
            </Button>
          ) : null}
          <Button
            icon={<ReloadOutlined />}
            loading={manifestQuery.isFetching}
            onClick={() => void manifestQuery.refetch()}
          >
            {t('common.action.rescan')}
          </Button>
          {canManageProjects ? (
            <Button icon={<LinkOutlined />} onClick={() => setMountOpen(true)}>
              {t('packages.header.mountProject')}
            </Button>
          ) : null}
          {canManageProjects ? (
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setDialog({ mode: 'create', project: null })}
            >
              {t('packages.header.createProject')}
            </Button>
          ) : null}
        </>
      }
    >
      {manifestQuery.isError ? (
        <Alert
          type="error"
          showIcon
          title={t('packages.alert.loadFailed')}
          description={manifestQuery.error.message}
        />
      ) : null}
      {notice ? (
        <Alert type="success" showIcon closable={{ onClose: () => setNotice('') }} title={notice} />
      ) : null}
      {saveProject.isError ? (
        <Alert
          type="error"
          showIcon
          closable={{ onClose: saveProject.reset }}
          title={t('packages.alert.saveFailed')}
          description={saveProject.error.message}
        />
      ) : null}
      {unmountProject.isError ? (
        <Alert
          type="error"
          showIcon
          closable={{ onClose: unmountProject.reset }}
          title={t('packages.alert.unmountFailed')}
          description={unmountProject.error.message}
        />
      ) : null}

      <Surface className="packages-summary" aria-label={t('packages.summary.ariaLabel')}>
        <Flex className="packages-summary__stats" gap={0}>
          <Statistic title={t('packages.summary.available')} value={projects.length} suffix={t('common.unit.count')} />
          <Statistic
            title={t('packages.summary.invalid')}
            value={invalidProjects.length}
            suffix={t('common.unit.count')}
            styles={
              invalidProjects.length
                ? { content: { color: 'var(--ant-color-warning)' } }
                : undefined
            }
          />
          <Statistic
            title={t('packages.summary.currentPermission')}
            value={canManageProjects ? t('packages.summary.manageable') : t('packages.summary.readOnly')}
          />
        </Flex>
      </Surface>

      <Surface className="packages-table-panel">
        <div className="workspace-section-heading">
          <div>
            <Title level={3}>{t('packages.list.title')}</Title>
            <Text type="secondary">{t('packages.list.description')}</Text>
          </div>
          <Tag color="blue">{t('packages.list.count', { count: projects.length })}</Tag>
        </div>
        {manifestQuery.isPending ? (
          <div className="page-loading">
            <Spin size="large" />
          </div>
        ) : projects.length ? (
          <Table
            rowKey="id"
            columns={columns}
            dataSource={projects}
            pagination={false}
            size="middle"
            scroll={{ x: 820 }}
          />
        ) : (
          <Empty description={t('packages.list.empty')} />
        )}
      </Surface>

      {invalidProjects.length ? (
        <InvalidProjectPanel
          projects={invalidProjects}
          editable={canManageProjects}
          onEdit={(project) => setDialog({ mode: 'edit', project })}
        />
      ) : null}
      {openDialog ? (
        <ProjectConfigDialog
          key={`${openDialog.mode}:${openDialog.project?.id || 'new'}`}
          open
          mode={openDialog.mode}
          project={openDialog.project}
          projectIds={projects.map((project) => project.id)}
          saving={saveProject.isPending}
          onCancel={() => setDialog(null)}
          onSave={async (data) => {
            await saveProject.mutateAsync({ data, editing: openDialog.mode === 'edit' });
          }}
        />
      ) : null}
      <ProjectMountDialog
        open={mountOpen}
        onCancel={() => setMountOpen(false)}
        onMounted={async () => {
          setNotice(t('packages.notice.mounted'));
          await Promise.all([
            queryClient.invalidateQueries({ queryKey: platformQueryKeys.projects }),
            queryClient.invalidateQueries({ queryKey: platformQueryKeys.htmlPages }),
            queryClient.invalidateQueries({ queryKey: platformQueryKeys.mounts }),
            queryClient.invalidateQueries({ queryKey: platformQueryKeys.health }),
          ]);
        }}
      />
    </PlatformPage>
  );
}

function InvalidProjectPanel({
  projects,
  editable,
  onEdit,
}: {
  projects: InvalidProject[];
  editable: boolean;
  onEdit: (project: ProjectManifest) => void;
}) {
  const { t } = useTranslation();
  const columns: ColumnsType<InvalidProject> = [
    { title: t('packages.invalid.folder'), dataIndex: 'folder', key: 'folder', width: 220 },
    { title: t('packages.invalid.issues'), dataIndex: 'errors', key: 'errors', render: (errors: string[]) => errors.join(t('packages.invalid.errorsSeparator')) },
    ...(editable
      ? [
          {
            title: t('common.column.actions'),
            key: 'action',
            width: 120,
            render: (_: unknown, item: InvalidProject) =>
              item.project ? (
                <Button size="small" onClick={() => onEdit(item.project as ProjectManifest)}>
                  {t('packages.invalid.configure')}
                </Button>
              ) : (
                <Text type="secondary">{t('packages.invalid.unreadable')}</Text>
              ),
          },
        ]
      : []),
  ];
  return (
    <Surface className="invalid-project-panel">
      <div className="workspace-section-heading">
        <Title level={3}>{t('packages.invalid.title')}</Title>
        <Tag color="warning">{t('packages.invalid.count', { count: projects.length })}</Tag>
      </div>
      <Table rowKey="folder" columns={columns} dataSource={projects} pagination={false} scroll={{ x: 600 }} />
    </Surface>
  );
}
