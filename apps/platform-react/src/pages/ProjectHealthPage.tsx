import { useMemo } from 'react';
import type { ColumnsType } from 'antd/es/table';
import { useTranslation } from 'react-i18next';

import type {
  ProjectHealthIssue,
  ProjectHealthItem,
} from '../../../../packages/platform-contracts/src/index.js';
import { useProjectHealth } from '@/data/use-platform-data';
import { Alert, Button, Collapse, Empty, Flex, Spin, Statistic, Table, Tag, Typography } from '@/ui/ant';
import { CheckCircleFilled, ReloadOutlined, WarningFilled } from '@/ui/ant/icons';
import { PlatformPage } from '@/ui/platform/PlatformPage';
import { Surface } from '@/ui/platform/Surface';

const { Text, Title } = Typography;
const categoryKeys = [
  'manifest',
  'schema',
  'routes',
  'html',
  'documents',
  'associations',
  'resources',
  'mounts',
] as const;

export function ProjectHealthPage() {
  const { t } = useTranslation();
  const query = useProjectHealth();
  const report = query.data;
  const columns = useMemo<ColumnsType<ProjectHealthIssue>>(
    () => [
      {
        title: t('health.table.severity'),
        dataIndex: 'severity',
        width: 86,
        render: (severity) => (
          <Tag color={severity === 'error' ? 'error' : 'warning'}>
            {severity === 'error' ? t('common.tag.error') : t('common.tag.warning')}
          </Tag>
        ),
      },
      {
        title: t('health.table.category'),
        dataIndex: 'category',
        width: 110,
        render: (value) =>
          (categoryKeys as readonly string[]).includes(value) ? t(`health.category.${value}`) : value,
      },
      { title: t('common.column.affectedObject'), dataIndex: 'object', width: 180, render: (value) => <code>{value}</code> },
      {
        title: t('health.table.message'),
        key: 'message',
        render: (_, item) => (
          <div>
            <Text>{item.message}</Text>
            <small className="table-secondary">{t('health.table.suggestionLabel', { suggestion: item.suggestion })}</small>
          </div>
        ),
      },
    ],
    [t],
  );

  return (
    <PlatformPage
      title={t('health.header.title')}
      description={t('health.header.description')}
      actions={
        <Button icon={<ReloadOutlined />} loading={query.isFetching} onClick={() => void query.refetch()}>
          {t('common.action.rescan')}
        </Button>
      }
    >
      {query.isError ? (
        <Alert type="error" showIcon title={t('health.alert.loadFailed')} description={query.error.message} />
      ) : null}
      {query.isPending ? (
        <div className="page-loading">
          <Spin size="large" />
        </div>
      ) : null}
      {report ? (
        <>
          <Surface className="packages-summary">
            <Flex className="packages-summary__stats" gap={0}>
              <Statistic title={t('common.field.project')} value={report.summary.projects || 0} suffix={t('common.unit.count')} />
              <Statistic title={t('health.status.healthy')} value={report.summary.healthy || 0} suffix={t('common.unit.count')} />
              <Statistic
                title={t('common.tag.error')}
                value={report.summary.errors || 0}
                styles={{ content: { color: report.summary.errors ? 'var(--ant-color-error)' : undefined } }}
              />
              <Statistic
                title={t('common.tag.warning')}
                value={report.summary.warnings || 0}
                styles={{ content: { color: report.summary.warnings ? 'var(--ant-color-warning)' : undefined } }}
              />
            </Flex>
          </Surface>
          <Surface className="health-projects">
            <div className="workspace-section-heading">
              <div>
                <Title level={3}>{t('health.results.title')}</Title>
                <Text type="secondary">{t('health.results.description')}</Text>
              </div>
              <Text type="secondary">
                {report.generatedAt ? new Date(report.generatedAt).toLocaleString() : ''}
              </Text>
            </div>
            {report.projects.length ? (
              <Collapse
                items={report.projects.map((item: ProjectHealthItem) => ({
                  key: item.project.id,
                  label: <ProjectHealthLabel item={item} />,
                  children: item.issues.length ? (
                    <Table
                      rowKey={(issue) => `${issue.code}:${issue.object}`}
                      columns={columns}
                      dataSource={item.issues}
                      pagination={false}
                      size="small"
                    />
                  ) : (
                    <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={t('health.results.emptyIssues')} />
                  ),
                }))}
              />
            ) : (
              <Empty description={t('health.results.noProjects')} />
            )}
          </Surface>
        </>
      ) : null}
    </PlatformPage>
  );
}

function ProjectHealthLabel({ item }: { item: ProjectHealthItem }) {
  const { t } = useTranslation();
  const healthy = item.summary.status === 'healthy';
  return (
    <Flex align="center" gap={10} wrap="wrap">
      {healthy ? (
        <CheckCircleFilled style={{ color: 'var(--ant-color-success)' }} />
      ) : (
        <WarningFilled
          style={{
            color:
              item.summary.status === 'error' ? 'var(--ant-color-error)' : 'var(--ant-color-warning)',
          }}
        />
      )}
      <Text strong>{item.project.name}</Text>
      <Text type="secondary">{item.project.id}</Text>
      {item.project.mounted ? <Tag color="blue">{t('health.label.mounted')}</Tag> : null}
      <Tag color={healthy ? 'success' : item.summary.status === 'error' ? 'error' : 'warning'}>
        {healthy
          ? t('health.status.healthy')
          : t('health.status.errorWarningSummary', {
              errors: item.summary.errors,
              warnings: item.summary.warnings,
            })}
      </Tag>
    </Flex>
  );
}
