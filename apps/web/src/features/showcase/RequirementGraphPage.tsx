/** Read-only graph. Publication, evidence and access belong to the service. */
import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { Search, X, ArrowUpRight, ArrowRight, RefreshCw, FileText, Eye, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import * as Popover from '@radix-ui/react-popover';
import { LoadingStage } from '@preview/ui/loading';
import { siteMotionTokens } from '@preview/ui';
import type {
  RequirementGraph,
  GraphImpact,
  GraphNode,
  GraphEdge,
} from '../../../../../packages/platform-contracts/src/requirement-graph';
import { useNativeAuth } from '@/features/platform/platform-api';
import { useShowcaseText } from './showcase-locale';
import { scopeColor } from './graph-presentation';
import './requirement-graph.css';
const Canvas = lazy(() => import('./RequirementGraphCanvas'));
const Markdown = lazy(() =>
  import('@/features/docs/MarkdownReader').then((m) => ({ default: m.MarkdownReader })),
);
const maintenanceLabels: Record<string, string> = {
  UNREVIEWED_GRAPH: '图谱变更需要同步',
  UNMAPPED_REQUIREMENT: '部分需求尚未纳入图谱',
  UNREVIEWED_REQUIREMENT: '需求变更需要同步',
  UNREVIEWED_BINDING: '页面关联需要同步',
  UNREVIEWED_PROTOTYPE: '原型变更需要同步',
  UNMAPPED_PROTOTYPE: '部分原型尚未纳入图谱',
  STALE_NODE: '节点出处需要更新',
  STALE_EDGE: '关系出处需要更新',
  STALE_PROTOTYPE: '原型出处需要更新',
};
export default function RequirementGraphPage({ projectId }: { projectId: string }) {
  const text = useShowcaseText(),
    { client, session } = useNativeAuth(),
    reduced = useReducedMotion();
  const [topic, setTopic] = useState(''),
    [query, setQuery] = useState('');
  const [pickerOpen, setPickerOpen] = useState(false);
  const [selected, setSelected] = useState<string | null>(null),
    [expanded, setExpanded] = useState(false);
  const [showImpact, setShowImpact] = useState(false),
    [documentId, setDocumentId] = useState('');
  const workspace = useRef<HTMLDivElement>(null),
    documentPanel = useRef<HTMLDivElement>(null);
  const identity = `${session?.user?.id ?? 'anonymous'}:${session?.user?.revision ?? 0}`;
  const graphQuery = useQuery({
    queryKey: ['requirement-graph', projectId, identity],
    queryFn: ({ signal }) =>
      client.request(`/showcase/${projectId}/graph?limit=500`, { signal }) as Promise<RequirementGraph>,
    enabled: !!projectId,
    retry: false,
    refetchInterval: 5000,
  });
  const graph = graphQuery.isError ? undefined : graphQuery.data;
  const nodes = useMemo(
    () =>
      (graph?.nodes ?? []).filter(
        (n) =>
          (!topic || n.topics.includes(topic)) &&
          (!query.trim() ||
            [n.label, ...n.aliases].some((v) =>
              text(v).toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()),
            )),
      ),
    [graph, topic, query, text],
  );
  const ids = useMemo(() => new Set(nodes.map((n) => n.id)), [nodes]);
  const edges = useMemo(
    () => (graph?.edges ?? []).filter((e) => ids.has(e.source) && ids.has(e.target)),
    [graph, ids],
  );
  const external = useQuery({
    queryKey: ['graph-node', projectId, identity, selected, graph?.graphRevision],
    queryFn: ({ signal }) =>
      client.request(
        `/showcase/${projectId}/graph-query?${new URLSearchParams({
          operation: 'get_graph_node',
          id: selected!,
          graphRevision: graph!.graphRevision,
        })}`,
        { signal },
      ) as Promise<{ node: GraphNode; edges: GraphEdge[] }>,
    enabled: !!graph && !!selected && !graph.nodes.some((n) => n.id === selected),
    retry: false,
  });
  const node =
    graph?.nodes.find((n) => n.id === selected) ?? (!external.isError ? external.data?.node : undefined);
  const links = graph?.nodes.some((n) => n.id === selected)
    ? graph.edges.filter((e) => e.source === selected || e.target === selected)
    : (external.data?.edges ?? []);
  const impact = useQuery({
    queryKey: ['graph-impact', projectId, identity, selected, graph?.graphRevision],
    queryFn: ({ signal }) =>
      client.request(
        `/showcase/${projectId}/graph-query?${new URLSearchParams({
          operation: 'analyze_requirement_impact',
          id: selected!,
          graphRevision: graph!.graphRevision,
          maxDepth: '5',
          limit: '100',
        })}`,
        { signal },
      ) as Promise<GraphImpact>,
    enabled: !!node && showImpact && !!graph,
    retry: false,
    refetchInterval: 5000,
  });
  const source = useQuery({
    queryKey: ['graph-document', projectId, identity, documentId, graph?.contentRevision],
    queryFn: ({ signal }) =>
      client.request(
        `/showcase/${projectId}/graph-document?${new URLSearchParams({
          id: documentId,
          contentRevision: graph!.contentRevision,
        })}`,
        { signal },
      ) as Promise<{ title: string; markdown: string }>,
    enabled: !!documentId && !!graph,
    retry: false,
    refetchInterval: 5000,
  });
  const select = (id: string | null) => {
    setSelected(id);
    setShowImpact(false);
    setDocumentId('');
    if (id && !ids.has(id)) {
      setTopic('');
      setQuery('');
    }
  };
  useEffect(() => {
    if (documentId) documentPanel.current?.focus({ preventScroll: true });
  }, [documentId]);
  useEffect(() => {
    if (!expanded) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const key = (event: KeyboardEvent) => {
      if (event.defaultPrevented || pickerOpen) return;
      if (event.key === 'Escape') {
        event.preventDefault();
        if (documentId) setDocumentId('');
        else setExpanded(false);
      }
      if (event.key === 'Tab') {
        const controls = workspace.current?.querySelectorAll<HTMLElement>(
          'button,a,input,summary,[tabindex="0"]',
        );
        const visible = [...(controls ?? [])].filter(
          (e) => e.getClientRects().length && !e.hasAttribute('disabled'),
        );
        if (!visible.length) return;
        if (event.shiftKey && document.activeElement === visible[0]) {
          event.preventDefault();
          visible[visible.length - 1].focus();
        } else if (!event.shiftKey && document.activeElement === visible[visible.length - 1]) {
          event.preventDefault();
          visible[0].focus();
        }
      }
    };
    document.addEventListener('keydown', key);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener('keydown', key);
    };
  }, [expanded, documentId, pickerOpen]);
  const warnings = [
    ...new Set((graph?.diagnostics ?? []).map((d) => maintenanceLabels[d.code] ?? '图谱资料需要同步')),
  ];
  return (
    <article className="requirement-graph-page">
      <header className="requirement-graph-heading">
        <h1>{text('需求关系图谱')}</h1>
        <p>{text('查看功能之间的关联，追溯对应的需求说明。')}</p>
      </header>
      {!projectId ? (
        <div className="requirement-graph-empty">{text('尚未配置项目')}</div>
      ) : graphQuery.isPending ? (
        <LoadingStage label={text('读取需求关系图谱…')} />
      ) : graphQuery.isError ? (
        <div className="requirement-graph-empty" role="alert">
          <p>{text('图谱读取失败')}</p>
          <small>{graphQuery.error.message}</small>
          <button type="button" onClick={() => void graphQuery.refetch()}>
            <RefreshCw size={14} />
            {text('重试')}
          </button>
        </div>
      ) : (
        graph && (
          <div
            ref={workspace}
            className={`requirement-graph-workspace${expanded ? ' expanded' : ''}`}
            role={expanded ? 'dialog' : undefined}
            aria-modal={expanded || undefined}
            aria-label={text('需求关系图谱')}
          >
            <div className="requirement-graph-preview-heading">
              <span>
                <Eye size={14} />
                {text('预览')}
              </span>
            </div>
            <div className="requirement-graph-frame">
              <div className="requirement-graph-toolbar">
                <div className="requirement-graph-topics" aria-label={text('主题范围')}>
                  {[{ id: '', label: '全部' }, ...graph.topics].map((item, index) => (
                    <button
                      type="button"
                      key={item.id}
                      aria-pressed={topic === item.id}
                      onClick={() => {
                        setTopic(item.id);
                        setQuery('');
                      }}
                    >
                      {item.id && <i style={{ background: scopeColor(index - 1) }} />}
                      {text(item.label)}
                    </button>
                  ))}
                </div>
                <Popover.Root open={pickerOpen} onOpenChange={setPickerOpen}>
                  <Popover.Trigger className="requirement-graph-picker-trigger" aria-label={text('查找节点')}>
                    <Search size={15} />
                  </Popover.Trigger>
                  <Popover.Content
                    className="requirement-graph-picker-panel"
                    align="end"
                    sideOffset={8}
                    collisionPadding={12}
                  >
                    <input
                      aria-label={text('搜索图谱节点')}
                      placeholder={text('搜索功能…')}
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                    />
                    <div aria-label={text('图谱节点列表')}>
                      {nodes.map((n) => (
                        <button
                          type="button"
                          key={n.id}
                          aria-pressed={selected === n.id}
                          onClick={() => {
                            select(n.id);
                            setPickerOpen(false);
                            setQuery('');
                          }}
                        >
                          {text(n.label)}
                          <ArrowRight size={12} />
                        </button>
                      ))}
                    </div>
                  </Popover.Content>
                </Popover.Root>
              </div>
              <div className="requirement-graph-body">
                <div className="requirement-graph-visual">
                  {nodes.length ? (
                    <Suspense
                      fallback={
                        <div className="requirement-graph-stage">
                          <LoadingStage label={text('绘制关系图谱…')} />
                        </div>
                      }
                    >
                      <Canvas
                        nodes={nodes}
                        edges={edges}
                        topics={graph.topics}
                        selected={selected}
                        onSelect={select}
                        expanded={expanded}
                        onExpand={() => setExpanded((v) => !v)}
                        activeTopic={topic}
                      />
                    </Suspense>
                  ) : (
                    <div className="requirement-graph-empty">
                      <p>
                        {text(
                          graph.availability === 'ready'
                            ? '没有匹配的节点'
                            : graph.availability === 'invalid'
                              ? '图谱格式需要修复'
                              : '业务图谱尚未发布',
                        )}
                      </p>
                      {query && (
                        <button type="button" onClick={() => setQuery('')}>
                          {text('清除搜索')}
                        </button>
                      )}
                      {expanded && (
                        <button type="button" onClick={() => setExpanded(false)}>
                          {text('退出全屏')}
                        </button>
                      )}
                    </div>
                  )}
                </div>
                <AnimatePresence initial={false}>
                  {node && (
                    <motion.aside
                      className="requirement-graph-detail"
                      aria-label={text('节点详情')}
                      initial={{ opacity: 0, x: reduced ? 0 : 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: reduced ? 0 : 6 }}
                      transition={reduced ? { duration: 0 } : siteMotionTokens.spring.snappy}
                    >
                      <button
                        className="requirement-graph-close"
                        aria-label={text('关闭详情')}
                        type="button"
                        onClick={() => select(null)}
                      >
                        <X size={15} />
                      </button>
                      <h2>{text(node.label)}</h2>
                      <p>{text(node.summary)}</p>
                      <div className="requirement-graph-detail-tabs">
                        <button type="button" aria-pressed={!showImpact} onClick={() => setShowImpact(false)}>
                          {text('需求依据')}
                        </button>
                        <button type="button" aria-pressed={showImpact} onClick={() => setShowImpact(true)}>
                          {text('变更影响')}
                        </button>
                      </div>
                      {!showImpact ? (
                        <>
                          {node.evidence.map((e, index) => (
                            <blockquote key={index}>
                              <p>{e.quote}</p>
                              <button type="button" onClick={() => setDocumentId(e.requirementId)}>
                                <FileText size={12} />
                                {graph.documents.find((d) => d.id === e.requirementId)?.title ??
                                  text('需求说明')}
                                <ArrowUpRight size={12} />
                              </button>
                              {e.stale && <small>{text('依据已过期，请核对现行需求')}</small>}
                            </blockquote>
                          ))}
                          {node.prototypes.length > 0 && (
                            <div className="requirement-graph-prototypes">
                              <h3>{text('原型呈现位置')}</h3>
                              {node.prototypes.map((p, index) => (
                                <Link
                                  key={index}
                                  to={`/pages/${projectId}/${p.clientId}/${p.pageKey}${p.anchor ? `?section=${encodeURIComponent(p.anchor)}` : ''}`}
                                >
                                  {text(p.target)}
                                  <ArrowUpRight size={12} />
                                </Link>
                              ))}
                            </div>
                          )}
                          {links.length > 0 && (
                            <div className="requirement-graph-links">
                              <h3>{text('直接关联')}</h3>
                              {links.map((e) => {
                                const target = e.source === node.id ? e.target : e.source;
                                return (
                                  <div key={e.id}>
                                    <button type="button" onClick={() => select(target)}>
                                      <span>
                                        {text(graph.nodes.find((n) => n.id === target)?.label ?? target)}
                                      </span>
                                      <ArrowRight size={12} />
                                    </button>
                                    <details>
                                      <summary>
                                        {text(e.label)}
                                        <ChevronDown size={10} />
                                      </summary>
                                      {e.evidence.map((p, index) => (
                                        <blockquote key={index}>
                                          <p>{p.quote}</p>
                                          <button
                                            type="button"
                                            onClick={() => setDocumentId(p.requirementId)}
                                          >
                                            {text('查看需求说明')}
                                            <ArrowUpRight size={12} />
                                          </button>
                                        </blockquote>
                                      ))}
                                    </details>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </>
                      ) : impact.isPending ? (
                        <LoadingStage label={text('读取影响范围…')} />
                      ) : impact.isError ? (
                        <p role="alert">{impact.error.message}</p>
                      ) : (
                        impact.data && (
                          <>
                            {impact.data.items.map((item) => (
                              <div className="requirement-graph-impact-item" key={item.node.id}>
                                <button type="button" onClick={() => select(item.node.id)}>
                                  {text(item.node.label)}
                                  <ArrowRight size={12} />
                                </button>
                                <small>{item.path.map((p) => text(p.edge.label)).join(' → ')}</small>
                              </div>
                            ))}
                            {!impact.data.items.length && (
                              <p>{text('当前记录中未找到影响节点，仍需核对遗漏和具体修改场景。')}</p>
                            )}
                            {!impact.data.complete && (
                              <p className="requirement-graph-caveat">
                                {text('当前需求整理或查询范围不完整，请继续核对。')}
                              </p>
                            )}
                          </>
                        )
                      )}
                    </motion.aside>
                  )}
                </AnimatePresence>
              </div>
            </div>
            {(warnings.length > 0 || !graph.complete) && (
              <details className="requirement-graph-maintenance">
                <summary>
                  {text('资料维护提醒')}
                  <ChevronDown size={12} />
                </summary>
                <p>{text('本示例仅展示已整理的需求范围。')}</p>
                {warnings.map((v) => (
                  <p key={v}>{text(v)}</p>
                ))}
                {!graph.complete && <p>{text('当前需求整理或查询范围不完整，请继续核对。')}</p>}
              </details>
            )}
            {documentId && (
              <div
                ref={documentPanel}
                tabIndex={-1}
                className="requirement-graph-document"
                role="region"
                aria-label={text('需求说明')}
              >
                <header>
                  <h2>{source.data?.title ?? text('需求说明')}</h2>
                  <button type="button" aria-label={text('关闭文档')} onClick={() => setDocumentId('')}>
                    <X size={16} />
                  </button>
                </header>
                {source.isPending ? (
                  <LoadingStage label={text('读取需求说明…')} />
                ) : source.isError ? (
                  <p role="alert">{source.error.message}</p>
                ) : (
                  source.data && (
                    <Suspense fallback={<LoadingStage label={text('加载业务需求…')} />}>
                      <Markdown source={source.data.markdown} loading={false} layout="site" />
                    </Suspense>
                  )
                )}
              </div>
            )}
          </div>
        )
      )}
    </article>
  );
}
