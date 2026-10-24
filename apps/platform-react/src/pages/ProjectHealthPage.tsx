import { useMemo } from 'react';
import type { ColumnsType } from 'antd/es/table';

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
const categoryNames: Record<string, string> = {
  manifest: '項目配置',
  schema: 'Schema',
  routes: '路由與菜單',
  html: 'HTML 原型',
  documents: 'PRD 文檔',
  associations: '需求關聯',
  resources: '項目資源',
  mounts: '目錄掛載',
};

export function ProjectHealthPage() {
  const query = useProjectHealth();
  const report = query.data;
  const columns = useMemo<ColumnsType<ProjectHealthIssue>>(
    () => [
      {
        title: '級別',
        dataIndex: 'severity',
        width: 86,
        render: (severity) => (
          <Tag color={severity === 'error' ? 'error' : 'warning'}>
            {severity === 'error' ? '錯誤' : '提醒'}
          </Tag>
        ),
      },
      { title: '範圍', dataIndex: 'category', width: 110, render: (value) => categoryNames[value] || value },
      { title: '影響對象', dataIndex: 'object', width: 180, render: (value) => <code>{value}</code> },
      {
        title: '問題與建議',
        key: 'message',
        render: (_, item) => (
          <div>
            <Text>{item.message}</Text>
            <small className="table-secondary">建議：{item.suggestion}</small>
          </div>
        ),
      },
    ],
    [],
  );

  return (
    <PlatformPage
      title="項目健康檢查"
      description="集中檢查項目配置、頁面、HTML、PRD、關聯、資源、掛載和 Schema。"
      actions={
        <Button icon={<ReloadOutlined />} loading={query.isFetching} onClick={() => void query.refetch()}>
          重新掃描
        </Button>
      }
    >
      {query.isError ? (
        <Alert type="error" showIcon title="健康檢查失敗" description={query.error.message} />
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
              <Statistic title="項目" value={report.summary.projects || 0} suffix="個" />
              <Statistic title="健康" value={report.summary.healthy || 0} suffix="個" />
              <Statistic
                title="錯誤"
                value={report.summary.errors || 0}
                styles={{ content: { color: report.summary.errors ? 'var(--ant-color-error)' : undefined } }}
              />
              <Statistic
                title="提醒"
                value={report.summary.warnings || 0}
                styles={{ content: { color: report.summary.warnings ? 'var(--ant-color-warning)' : undefined } }}
              />
            </Flex>
          </Surface>
          <Surface className="health-projects">
            <div className="workspace-section-heading">
              <div>
                <Title level={3}>檢查結果</Title>
                <Text type="secondary">每條問題都保留影響對象和可執行建議，不再只顯示“項目不可用”。</Text>
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
                    <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="未發現問題" />
                  ),
                }))}
              />
            ) : (
              <Empty description="當前沒有項目可檢查" />
            )}
          </Surface>
        </>
      ) : null}
    </PlatformPage>
  );
}

function ProjectHealthLabel({ item }: { item: ProjectHealthItem }) {
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
      {item.project.mounted ? <Tag color="blue">外部掛載</Tag> : null}
      <Tag color={healthy ? 'success' : item.summary.status === 'error' ? 'error' : 'warning'}>
        {healthy ? '健康' : `${item.summary.errors} 錯誤 / ${item.summary.warnings} 提醒`}
      </Tag>
    </Flex>
  );
}
