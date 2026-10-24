import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import type { PagePrdLinks, ProjectManifest } from '../../../../packages/platform-contracts/src/index.js';
import { platformApi } from '@/data/platform-api';
import { platformQueryKeys, useProjectManifest } from '@/data/use-platform-data';
import {
  compareContextBaseline,
  createContextExport,
  createPageContextPackage,
  createTraceabilityReport,
  loadAiContext,
  loadContextBaseline,
  saveContextBaseline,
  type AiContext,
  type ContextDocument,
  type ContextIssue,
  type ContextSuggestion,
} from '@/features/ai-context/context-loader';
import {
  Button,
  Descriptions,
  Empty,
  Result,
  Segmented,
  Select,
  Spin,
  Table,
  Tag,
  Typography,
} from '@/ui/ant';
import {
  CheckCircleFilled,
  DatabaseOutlined,
  DownloadOutlined,
  LinkOutlined,
  ReloadOutlined,
} from '@/ui/ant/icons';
import { PlatformPage } from '@/ui/platform/PlatformPage';
import { Surface } from '@/ui/platform/Surface';

const { Text, Title } = Typography;

function downloadJson(payload: unknown, fileName: string) {
  const blob = new Blob([`${JSON.stringify(payload, null, 2)}\n`], {
    type: 'application/json;charset=utf-8',
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
  URL.revokeObjectURL(url);
}

function severityColor(value: string) {
  return value === 'error' ? 'error' : value === 'warning' ? 'warning' : 'blue';
}

export function AiContextPage() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const projectsQuery = useProjectManifest();
  const projects = projectsQuery.data?.projects ?? [];
  const [selectedProjectId, setSelectedProjectId] = useState(searchParams.get('project') || '');
  const projectId = selectedProjectId || searchParams.get('project') || projects[0]?.id || '';
  const project = projects.find((item) => item.id === projectId) || null;
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedPageKey, setSelectedPageKey] = useState(searchParams.get('page') || '');
  const contextQuery = useQuery({
    queryKey: ['platform', 'ai-context', projectId],
    queryFn: () => loadAiContext(project as ProjectManifest),
    enabled: Boolean(project),
    staleTime: 0,
  });
  const context = contextQuery.data as AiContext | undefined;
  const page =
    context?.pages.find((item) => item.key === selectedPageKey || item.fullPath === selectedPageKey) ||
    context?.pages[0] ||
    null;
  const impact = context ? compareContextBaseline(context, loadContextBaseline(context.project.id)) : null;
  const saveSuggestion = useMutation({
    mutationFn: (links: PagePrdLinks) => platformApi.savePagePrdLinks(projectId, links),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: platformQueryKeys.pagePrdLinks(projectId) });
      await queryClient.invalidateQueries({ queryKey: ['platform', 'ai-context', projectId] });
    },
  });

  function confirmSuggestion(pageKey: string, documentPath: string) {
    if (!context || !documentPath) return;
    const selected = context.pages.find((item) => item.key === pageKey);
    if (!selected) return;
    const links = Object.fromEntries(
      Object.entries(context.pagePrdLinks).map(([clientId, pages]) => [clientId, { ...pages }]),
    ) as PagePrdLinks;
    links[selected.clientId] ||= {};
    links[selected.clientId][selected.name] = documentPath;
    void saveSuggestion.mutate(links);
  }

  if (contextQuery.isPending)
    return (
      <div className="page-loading">
        <Spin size="large" />
      </div>
    );

  return (
    <PlatformPage
      title={t('ai.header.title')}
      description={t('ai.header.description')}
      actions={
        <>
          <Select
            value={projectId || undefined}
            placeholder={t('common.action.selectProject')}
            options={projects.map((item) => ({ value: item.id, label: item.name }))}
            onChange={setSelectedProjectId}
          />
          <Button
            icon={<ReloadOutlined />}
            loading={contextQuery.isFetching}
            onClick={() => void contextQuery.refetch()}
          >
            {t('ai.header.reanalyze')}
          </Button>
        </>
      }
    >
      {contextQuery.isError ? (
        <Result
          status="error"
          title={t('ai.error.loadFailed')}
          subTitle={contextQuery.error.message}
          extra={<Button onClick={() => void contextQuery.refetch()}>{t('ai.error.retry')}</Button>}
        />
      ) : null}
      {!context ? (
        <Empty description={t('common.empty.selectProject')} />
      ) : (
        <>
          <Surface className="context-summary">
            <div>
              <Title level={2}>{context.project.name}</Title>
              <Text type="secondary">{t('ai.summary.coverage')}</Text>
            </div>
            <div className="context-summary__metrics">
              <Metric label={t('ai.summary.pages')} value={context.summary.pages || 0} />
              <Metric label={t('ai.summary.documents')} value={context.summary.documents || 0} />
              <Metric
                label={t('ai.summary.pageCoverage')}
                value={`${context.summary.pageCoverage || 0}%`}
              />
              <Metric label={t('ai.summary.bindings')} value={context.summary.componentBindings || 0} />
              <Metric
                label={t('ai.summary.pending')}
                value={(context.summary.errors || 0) + (context.summary.warnings || 0)}
                warning
              />
            </div>
          </Surface>
          <Segmented
            block
            value={activeTab}
            options={[
              { label: t('ai.tabs.overview', { count: context.issues.length }), value: 'overview' },
              { label: t('ai.tabs.pages', { count: context.summary.pages || 0 }), value: 'pages' },
              {
                label: t('ai.tabs.documents', { count: context.summary.documents || 0 }),
                value: 'documents',
              },
              {
                label: t('ai.tabs.suggestions', { count: context.summary.suggestions || 0 }),
                value: 'suggestions',
              },
              { label: t('ai.tabs.impact'), value: 'impact' },
            ]}
            onChange={(value) => setActiveTab(String(value))}
          />
          <Surface className="context-workspace">
            {activeTab === 'overview' ? (
              <Overview
                context={context}
                onPage={(key) => {
                  setSelectedPageKey(key);
                  setActiveTab('pages');
                }}
              />
            ) : null}
            {activeTab === 'pages' ? (
              <Pages context={context} selected={page?.key || ''} onSelect={setSelectedPageKey} />
            ) : null}
            {activeTab === 'documents' ? (
              <Documents
                context={context}
                onPage={(key) => {
                  setSelectedPageKey(key);
                  setActiveTab('pages');
                }}
              />
            ) : null}
            {activeTab === 'suggestions' ? (
              <Suggestions context={context} busy={saveSuggestion.isPending} onConfirm={confirmSuggestion} />
            ) : null}
            {activeTab === 'impact' ? (
              <Impact
                context={context}
                impact={impact}
                onBaseline={() => {
                  saveContextBaseline(context);
                  void contextQuery.refetch();
                }}
                onPage={(key) => {
                  setSelectedPageKey(key);
                  setActiveTab('pages');
                }}
              />
            ) : null}
          </Surface>
          <div className="context-download-actions">
            <Button
              icon={<DownloadOutlined />}
              onClick={() =>
                downloadJson(createContextExport(context), `${context.project.id}-delivery-context.json`)
              }
            >
              {t('ai.actions.exportContext')}
            </Button>
            <Button
              icon={<DownloadOutlined />}
              onClick={() =>
                downloadJson(
                  createContextExport(context, { includeDocumentContent: true }),
                  `${context.project.id}-delivery-context-full.json`,
                )
              }
            >
              {t('ai.actions.exportFullContext')}
            </Button>
            <Button
              icon={<DownloadOutlined />}
              onClick={() =>
                downloadJson(createTraceabilityReport(context), `${context.project.id}-traceability.json`)
              }
            >
              {t('ai.actions.exportTraceability')}
            </Button>
            {page ? (
              <Button
                icon={<DownloadOutlined />}
                onClick={() =>
                  downloadJson(
                    createPageContextPackage(context, page.key),
                    `${context.project.id}-${page.path}-context.json`,
                  )
                }
              >
                {t('ai.actions.downloadPageContext')}
              </Button>
            ) : null}
          </div>
        </>
      )}
    </PlatformPage>
  );
}

function Metric({
  label,
  value,
  warning = false,
}: {
  label: string;
  value: string | number;
  warning?: boolean;
}) {
  return (
    <div className={warning ? 'is-warning' : ''}>
      <Text>{label}</Text>
      <strong>{value}</strong>
    </div>
  );
}

function Overview({ context, onPage }: { context: AiContext; onPage: (key: string) => void }) {
  const { t } = useTranslation();
  return (
    <div className="context-overview">
      <div className="context-overview__heading">
        <div>
          <Title level={2}>{t('ai.overview.title')}</Title>
          <Text type="secondary">{t('ai.overview.description')}</Text>
        </div>
        <Tag color="blue">{t('ai.overview.tag')}</Tag>
      </div>
      <div className="context-callouts">
        <div>
          <CheckCircleFilled />
          <strong>{context.summary.linkedPages || 0}</strong>
          <span>{t('ai.overview.linkedPages')}</span>
        </div>
        <div>
          <LinkOutlined />
          <strong>{context.summary.componentBindings || 0}</strong>
          <span>{t('ai.overview.bindings')}</span>
        </div>
        <div>
          <DatabaseOutlined />
          <strong>{context.summary.suggestions || 0}</strong>
          <span>{t('ai.overview.suggestions')}</span>
        </div>
      </div>
      <Table<ContextIssue>
        rowKey={(item) => `${item.pageKey || ''}:${item.message}`}
        pagination={false}
        dataSource={context.issues}
        columns={[
          {
            title: t('ai.table.severity'),
            dataIndex: 'severity',
            width: 100,
            render: (value: string) => (
              <Tag color={severityColor(value)}>
                {value === 'error'
                  ? t('common.tag.error')
                  : value === 'warning'
                    ? t('common.tag.warning')
                    : t('ai.severity.info')}
              </Tag>
            ),
          },
          { title: t('ai.table.issue'), dataIndex: 'message' },
          { title: t('common.column.affectedObject'), dataIndex: 'subject', width: 260 },
          {
            title: t('common.column.actions'),
            width: 100,
            render: (_value, item) =>
              item.pageKey ? (
                <Button type="link" onClick={() => onPage(item.pageKey || '')}>
                  {t('ai.table.viewPage')}
                </Button>
              ) : null,
          },
        ]}
      />
    </div>
  );
}

function Pages({
  context,
  selected,
  onSelect,
}: {
  context: AiContext;
  selected: string;
  onSelect: (key: string) => void;
}) {
  const { t } = useTranslation();
  const current = context.pages.find((item) => item.key === selected) || context.pages[0];
  if (!current) return <Empty description={t('ai.pages.empty')} />;
  const requirement = context.documents.find((document) => document.path === current.documentPath);
  return (
    <div className="context-pages">
      <div className="context-pages__toolbar">
        <Select
          value={current.key}
          showSearch
          options={context.pages.map((item) => ({
            value: item.key,
            label: `${item.clientName} · ${item.title}`,
          }))}
          onChange={onSelect}
        />
        <Button
          type="primary"
          onClick={() =>
            downloadJson(
              createPageContextPackage(context, current.key),
              `${context.project.id}-${current.path}-context.json`,
            )
          }
        >
          {t('ai.pages.download')}
        </Button>
      </div>
      <div className="context-page-detail">
        <Descriptions
          column={1}
          title={current.title}
          items={[
            { key: 'client', label: t('common.field.client'), children: current.clientName },
            { key: 'route', label: t('ai.pages.field.route'), children: <code>{current.fullPath}</code> },
            {
              key: 'source',
              label: t('ai.pages.field.source'),
              children: `${current.sourceType} · ${current.source || t('ai.pages.sourceNotRegistered')}`,
            },
            {
              key: 'section',
              label: t('ai.pages.field.section'),
              children: current.sectionTitle || current.sectionId || t('ai.pages.ungrouped'),
            },
          ]}
        />
        <section>
          <Title level={3}>{requirement?.title || t('ai.pages.noPrdTitle')}</Title>
          {requirement ? (
            <>
              <Text type="secondary">{requirement.path}</Text>
              <ul>
                {requirement.headings.map((heading) => (
                  <li key={heading.id} className={`level-${heading.level}`}>
                    {heading.text}
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <Empty description={t('ai.pages.noPrdEmpty')} />
          )}
        </section>
      </div>
    </div>
  );
}

function Documents({ context, onPage }: { context: AiContext; onPage: (key: string) => void }) {
  const { t } = useTranslation();
  return (
    <Table<ContextDocument>
      rowKey="path"
      dataSource={context.documents}
      pagination={false}
      scroll={{ x: 760 }}
      columns={[
        {
          title: t('ai.documents.table.prd'),
          dataIndex: 'title',
          minWidth: 260,
          render: (value: string, row) => (
            <div>
              <strong>{value}</strong>
              <small>{row.path}</small>
            </div>
          ),
        },
        {
          title: t('ai.documents.table.structure'),
          width: 120,
          render: (_value, row) => t('ai.documents.headingsCount', { count: row.headings.length }),
        },
        {
          title: t('ai.documents.table.linkedPages'),
          minWidth: 260,
          render: (_value, row) =>
            row.linkedPageKeys.length ? (
              row.linkedPageKeys.map((key) => (
                <Button key={key} size="small" type="link" onClick={() => onPage(key)}>
                  {context.pages.find((page) => page.key === key)?.title || key}
                </Button>
              ))
            ) : (
              <Text type="secondary">{t('ai.documents.noPageLinks')}</Text>
            ),
        },
        {
          title: t('common.column.status'),
          width: 100,
          render: (_value, row) => (
            <Tag color={row.archived ? 'default' : row.contentAvailable ? 'success' : 'warning'}>
              {row.archived
                ? t('ai.documents.statusArchived')
                : row.contentAvailable
                  ? t('ai.documents.statusReadable')
                  : t('ai.documents.statusFailed')}
            </Tag>
          ),
        },
      ]}
    />
  );
}

function Suggestions({
  context,
  busy,
  onConfirm,
}: {
  context: AiContext;
  busy: boolean;
  onConfirm: (pageKey: string, documentPath: string) => void;
}) {
  const { t } = useTranslation();
  const [choices, setChoices] = useState<Record<string, string>>(() =>
    Object.fromEntries(context.suggestions.map((item) => [item.pageKey, item.candidates[0]?.path || ''])),
  );
  return (
    <Table<ContextSuggestion>
      rowKey="pageKey"
      dataSource={context.suggestions}
      pagination={false}
      scroll={{ x: 760 }}
      columns={[
        {
          title: t('ai.suggestions.table.page'),
          minWidth: 220,
          render: (_value, item) => (
            <div>
              <strong>{item.page.title}</strong>
              <small>
                {item.page.clientName} · {item.page.fullPath}
              </small>
            </div>
          ),
        },
        {
          title: t('ai.suggestions.table.suggestedPrd'),
          minWidth: 330,
          render: (_value, item) => (
            <Select
              value={choices[item.pageKey]}
              options={item.candidates.map((candidate) => ({
                value: candidate.path,
                label: `${candidate.title} · ${candidate.path}`,
              }))}
              onChange={(value) => setChoices((current) => ({ ...current, [item.pageKey]: value }))}
            />
          ),
        },
        {
          title: t('ai.suggestions.table.confidence'),
          width: 130,
          render: (_value, item) => {
            const choice = item.candidates.find((candidate) => candidate.path === choices[item.pageKey]);
            return (
              <Tag
                color={
                  choice?.confidence === 'high'
                    ? 'success'
                    : choice?.confidence === 'medium'
                      ? 'blue'
                      : 'warning'
                }
              >
                {choice?.confidence === 'high'
                  ? t('ai.suggestions.confidence.high')
                  : choice?.confidence === 'medium'
                    ? t('ai.suggestions.confidence.medium')
                    : t('ai.suggestions.confidence.low')}{' '}
                {Math.round((choice?.score || 0) * 100)}%
              </Tag>
            );
          },
        },
        {
          title: t('common.column.actions'),
          width: 130,
          render: (_value, item) => (
            <Button
              type="primary"
              size="small"
              loading={busy}
              disabled={!platformApi.development || !choices[item.pageKey]}
              onClick={() => onConfirm(item.pageKey, choices[item.pageKey])}
            >
              {t('ai.suggestions.confirm')}
            </Button>
          ),
        },
      ]}
    />
  );
}

function Impact({
  context,
  impact,
  onBaseline,
  onPage,
}: {
  context: AiContext;
  impact: ReturnType<typeof compareContextBaseline> | null;
  onBaseline: () => void;
  onPage: (key: string) => void;
}) {
  const { t } = useTranslation();
  if (!impact || impact.status === 'uninitialized')
    return (
      <Result
        status="info"
        title={t('ai.impact.noBaselineTitle')}
        subTitle={t('ai.impact.noBaselineSubtitle')}
        extra={
          <Button type="primary" onClick={onBaseline}>
            {t('ai.impact.createBaseline')}
          </Button>
        }
      />
    );
  return (
    <div>
      <div className="impact-toolbar">
        <Text>
          {t('ai.impact.baselineLabel', {
            time: impact.baselineCapturedAt?.replace('T', ' ').slice(0, 19) || '',
          })}
        </Text>
        <strong>
          {impact.changes.length
            ? t('ai.impact.changesCount', { count: impact.changes.length })
            : t('ai.impact.noChanges')}
        </strong>
        <Button onClick={onBaseline}>{t('ai.impact.updateBaseline')}</Button>
      </div>
      {impact.changes.length ? (
        <Table
          rowKey="path"
          dataSource={impact.changes}
          pagination={false}
          columns={[
            {
              title: t('ai.impact.table.change'),
              dataIndex: 'type',
              width: 100,
              render: (value: string) => (
                <Tag color={value === 'removed' ? 'error' : value === 'changed' ? 'warning' : 'success'}>
                  {value === 'removed'
                    ? t('ai.impact.changeRemoved')
                    : value === 'changed'
                      ? t('ai.impact.changeChanged')
                      : t('ai.impact.changeAdded')}
                </Tag>
              ),
            },
            { title: t('ai.impact.table.prdFile'), dataIndex: 'path' },
            {
              title: t('ai.impact.table.affectedPages'),
              render: (_value, item: { linkedPageKeys: string[] }) =>
                item.linkedPageKeys.length ? (
                  item.linkedPageKeys.map((key) => (
                    <Button key={key} type="link" onClick={() => onPage(key)}>
                      {context.pages.find((page) => page.key === key)?.title || key}
                    </Button>
                  ))
                ) : (
                  <Text type="secondary">{t('ai.impact.noPageLinks')}</Text>
                ),
            },
          ]}
        />
      ) : (
        <Empty description={t('ai.impact.empty')} />
      )}
    </div>
  );
}
