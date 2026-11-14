/** Read-only graph: find on the left, explore in the centre, understand on the right.
 * Publication, evidence and access belong to the service; key points are AI reading aids. */
import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import {
  Search,
  X,
  ArrowUp,
  ArrowUpRight,
  RefreshCw,
  FileText,
  ChevronDown,
  ChevronRight,
  Eye,
  Maximize2,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { LoadingStage } from '@preview/ui/loading';
import { siteMotionTokens } from '@preview/ui';
import type {
  GraphImpact,
  GraphNode,
  GraphEdge,
  GraphNodeType,
  GraphRelation,
} from '../../../../../packages/platform-contracts/src/requirement-graph';
import { useNativeAuth } from '@/features/platform/platform-api';
import type { MarkdownHeading } from '@/features/docs/markdown';
import { REQUIREMENT_GRAPH_GUIDE } from '../../../../../packages/project-shared/src/requirement-graph-guide';
import { useShowcaseText } from './showcase-locale';
import { FullscreenPreview, type PreviewBounds } from './FullscreenPreview';
import { GuideBody } from './GuideBody';
import { TocSelection } from './TocSelection';
import { useTocNavigation } from './toc-navigation';
import { siteGuides } from './site-guides';
import {
  scopeColor,
  graphNodeLegend,
  graphRelationLegend,
  graphNodeColor,
  graphVisibility,
} from './graph-presentation';
import type { GraphViewMemory } from './graph-view';
import { loadGraphCatalog } from './graph-catalog';
import { graphReadingRelations, graphReadingScope, graphSourceAnchor } from './graph-reading';
import './requirement-graph.css';
const Canvas = lazy(() => import('./RequirementGraphCanvas'));
const Sphere = lazy(() => import('./RequirementGraphSphere'));
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
const typeLabels: Record<string, string> = {
  feature: '功能',
  object: '业务对象',
  field: '关键字段',
  state: '状态',
  rule: '规则',
  process: '流程步骤',
  interface: '接口契约',
  platform: '外部平台',
};
function GraphViewSwitch({
  view,
  onChange,
  scope,
}: {
  view: '2d' | '3d';
  onChange: (view: '2d' | '3d') => void;
  scope: string;
}) {
  const text = useShowcaseText();
  const reduced = useReducedMotion();
  return (
    <div
      role="tablist"
      aria-label={text('图谱视图')}
      className="preview-shell_switch__v2Veh requirement-graph-view-switch"
      onKeyDown={(event) => {
        if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
        event.preventDefault();
        const next = event.key === 'Home' ? '2d' : event.key === 'End' ? '3d' : view === '2d' ? '3d' : '2d';
        onChange(next);
        event.currentTarget.querySelector<HTMLButtonElement>(`[data-view="${next}"]`)?.focus();
      }}
    >
      {(['2d', '3d'] as const).map((mode) => (
        <button
          key={mode}
          type="button"
          className="preview-shell_option__gxVA2"
          role="tab"
          data-view={mode}
          aria-selected={view === mode}
          aria-controls="requirement-graph-visual"
          tabIndex={view === mode ? 0 : -1}
          onClick={() => onChange(mode)}
        >
          {view === mode && (
            <motion.span
              className="preview-shell_highlight__cOThZ"
              layoutId={`graph-view-${scope}`}
              transition={reduced ? { duration: 0 } : siteMotionTokens.spring.snappy}
            />
          )}
          <span className="requirement-graph-view-label">{mode.toUpperCase()}</span>
        </button>
      ))}
    </div>
  );
}
export default function RequirementGraphPage({
  projectId,
  title = '需求关系图谱',
  projectName,
}: {
  projectId: string;
  title?: string;
  projectName?: string;
}) {
  const text = useShowcaseText(),
    { client, session } = useNativeAuth(),
    reduced = useReducedMotion();
  const [query, setQuery] = useState('');
  const [view, setView] = useState<'2d' | '3d'>('2d');
  const [hiddenTypes, setHiddenTypes] = useState<GraphNodeType[]>([]);
  const [hiddenRelations, setHiddenRelations] = useState<GraphRelation[]>([]);
  const [resultLimit, setResultLimit] = useState(40);
  const planarMemory = useRef<GraphViewMemory>({});
  const sphereMemory = useRef<GraphViewMemory>({});
  const [selected, setSelected] = useState<string | null>(null),
    [expanded, setExpanded] = useState(false);
  const [fullscreenBounds, setFullscreenBounds] = useState<PreviewBounds | null>(null);
  const [reservedHeight, setReservedHeight] = useState<number>();
  const [headings, setHeadings] = useState<MarkdownHeading[]>([]);
  const { active, scrollTo } = useTocNavigation([
    'graph-preview',
    ...headings.filter((heading) => heading.level <= 2).map((heading) => heading.id),
  ]);
  const guideUrl = useCallback(
    (file: string, anchor?: string) => {
      const target = siteGuides.find((guide) => `guides/${guide.id}.md` === file);
      if (!target) return '#';
      const params = new URLSearchParams();
      if (projectId) params.set('project', projectId);
      if (anchor) params.set('anchor', anchor);
      return `#${target.path}${params.size ? `?${params}` : ''}`;
    },
    [projectId],
  );
  const [showImpact, setShowImpact] = useState(false),
    [documentId, setDocumentId] = useState('');
  const [openQuotes, setOpenQuotes] = useState<Set<string>>(() => new Set());
  const [documentQuote, setDocumentQuote] = useState('');
  const workspace = useRef<HTMLDivElement>(null),
    documentPanel = useRef<HTMLDivElement>(null),
    list = useRef<HTMLDivElement>(null),
    detail = useRef<HTMLElement>(null);
  const openFullscreen = () => {
    const element = workspace.current;
    if (!element) return;
    const rect = element.getBoundingClientRect();
    setFullscreenBounds({
      top: rect.top,
      left: rect.left,
      width: rect.width,
      height: rect.height,
      borderRadius: 12,
    });
    setReservedHeight(rect.height);
    setExpanded(true);
  };
  const identity = `${session?.user?.id ?? 'anonymous'}:${session?.user?.revision ?? 0}`;
  // Content changes only with a release; focus refetch keeps it current without polling.
  const graphQuery = useQuery({
    queryKey: ['requirement-graph', projectId, identity],
    queryFn: ({ signal }) => loadGraphCatalog(client.request, projectId, signal),
    enabled: !!projectId,
    retry: false,
    staleTime: 30_000,
  });
  const graph = graphQuery.isError ? undefined : graphQuery.data;
  const nodes = useMemo(() => graph?.nodes ?? [], [graph]);
  const edges = useMemo(() => graph?.edges ?? [], [graph]);
  const topicIndex = useMemo(() => new Map((graph?.topics ?? []).map((t, i) => [t.id, i])), [graph]);
  const visibility = useMemo(
    () => graphVisibility(nodes, edges, hiddenTypes, hiddenRelations),
    [nodes, edges, hiddenTypes, hiddenRelations],
  );
  const visibleNodes = useMemo(
    () => nodes.filter((item) => visibility.nodeIds.has(item.id)),
    [nodes, visibility],
  );
  const term = query.trim().toLocaleLowerCase();
  const matches = useMemo(() => {
    if (!term) return null;
    return visibleNodes.filter((n) =>
      [n.label, n.summary, ...n.aliases, ...n.keyPoints.map((p) => p.text)].some(
        (v) => v.toLocaleLowerCase().includes(term) || text(v).toLocaleLowerCase().includes(term),
      ),
    );
  }, [visibleNodes, term, text]);
  const matchIds = useMemo(() => matches?.map((n) => n.id) ?? null, [matches]);
  const results = matches ?? visibleNodes;
  const node = nodes.find((n) => n.id === selected);
  const scope = useMemo(
    () =>
      graphReadingScope(
        visibleNodes,
        edges.filter((edge) => visibility.edgeIds.has(edge.id)),
        node?.id ?? null,
        null,
      ),
    [visibleNodes, edges, node, visibility],
  );
  const GraphView = view === '2d' ? Canvas : Sphere;
  const nodeLabel = (id: string) => text(nodes.find((n) => n.id === id)?.label ?? id);
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
    staleTime: 30_000,
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
    staleTime: 30_000,
  });
  const select = (id: string | null) => {
    setSelected(id);
    setShowImpact(false);
    setOpenQuotes(new Set());
    const target = nodes.find((n) => n.id === id);
    if (target) {
      setHiddenTypes((previous) => previous.filter((type) => type !== target.type));
      setResultLimit((previous) => Math.max(previous, nodes.indexOf(target) + 1));
      if (matches && !matches.some((n) => n.id === id)) setQuery('');
    }
  };
  const openSource = (id: string, quote: string) => {
    setDocumentQuote(quote);
    setDocumentId(id);
  };
  const toggleQuote = (key: string) =>
    setOpenQuotes((current) => {
      const next = new Set(current);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  useEffect(() => {
    detail.current?.scrollTo({ top: 0 });
    if (!selected) return;
    const frame = requestAnimationFrame(() => {
      const item = list.current?.querySelector<HTMLElement>(`[data-node="${CSS.escape(selected)}"]`),
        panel = list.current;
      if (!item || !panel) return;
      const top = item.offsetTop - panel.clientHeight / 3;
      if (item.offsetTop < panel.scrollTop || item.offsetTop > panel.scrollTop + panel.clientHeight - 40)
        panel.scrollTo({ top, behavior: reduced ? 'auto' : 'smooth' });
    });
    return () => cancelAnimationFrame(frame);
  }, [selected, reduced]);
  useEffect(() => {
    if (documentId) documentPanel.current?.focus({ preventScroll: expanded });
  }, [documentId, expanded]);
  const warnings = [
    ...new Set((graph?.diagnostics ?? []).map((d) => maintenanceLabels[d.code] ?? '图谱资料需要同步')),
  ];
  const renderPoint = (target: GraphNode, index: number) => {
    const point = target.keyPoints[index],
      key = `${target.id}:${index}`,
      open = openQuotes.has(key);
    return (
      <li key={key}>
        <p>
          {text(point.text)}
          <button
            type="button"
            className="requirement-graph-quote-toggle"
            aria-expanded={open}
            onClick={() => toggleQuote(key)}
          >
            {text('原文')}
            <ChevronDown size={11} />
          </button>
        </p>
        {open &&
          point.evidence.map((ref) => {
            const quote = target.evidence[ref];
            return (
              quote && (
                <blockquote key={ref} data-preserve-language>
                  <p>{quote.quote}</p>
                  <button type="button" onClick={() => openSource(quote.requirementId, quote.quote)}>
                    <FileText size={12} />
                    {graph?.documents.find((d) => d.id === quote.requirementId)?.title ?? text('需求说明')}
                    <ArrowUpRight size={12} />
                  </button>
                  {quote.stale && <small>{text('依据已过期，请核对现行需求')}</small>}
                </blockquote>
              )
            );
          })}
      </li>
    );
  };
  const renderRelations = (title: string, links: GraphEdge[], other: (edge: GraphEdge) => string) =>
    links.length > 0 && (
      <section>
        <h3>{text(title)}</h3>
        <div className="requirement-graph-relations">
          {links.map((edge) => (
            <div key={edge.id}>
              <button type="button" onClick={() => select(other(edge))}>
                <span>{nodeLabel(other(edge))}</span>
                <small>{text(edge.label)}</small>
                <ChevronRight size={13} />
              </button>
              <button
                type="button"
                className="requirement-graph-edge-proof"
                aria-expanded={openQuotes.has(edge.id)}
                onClick={() => toggleQuote(edge.id)}
              >
                {text('关系依据')}
                <ChevronDown size={11} />
              </button>
              {openQuotes.has(edge.id) &&
                edge.evidence.map((proof, index) => (
                  <blockquote key={index} data-preserve-language>
                    <p>{proof.quote}</p>
                    <button type="button" onClick={() => openSource(proof.requirementId, proof.quote)}>
                      {text('查看需求说明')}
                      <ArrowUpRight size={12} />
                    </button>
                  </blockquote>
                ))}
            </div>
          ))}
        </div>
      </section>
    );
  const renderDetail = (target: GraphNode) => {
    const triggers = target.keyPoints.flatMap((p, i) => (p.kind === 'trigger' ? [i] : []));
    const rules = target.keyPoints.flatMap((p, i) => (p.kind === 'rule' ? [i] : []));
    const {
      causes: incoming,
      effects: outgoing,
      related,
      management,
    } = graphReadingRelations(target.id, edges, nodes);
    const other = (edge: GraphEdge) => (edge.source === target.id ? edge.target : edge.source);
    const topicId = target.primaryTopic;
    return (
      <>
        <header className="requirement-graph-detail-head">
          <span>
            <i style={{ background: scopeColor(topicIndex.get(topicId) ?? 0) }} />
            {text(graph?.topics.find((t) => t.id === topicId)?.label ?? '')}
            <em>·</em>
            {text(typeLabels[target.type] ?? '')}
          </span>
          <button
            className="requirement-graph-close"
            aria-label={text('关闭详情')}
            type="button"
            onClick={() => select(null)}
          >
            <X size={15} />
          </button>
        </header>
        <h2>{text(target.label)}</h2>
        <p className="requirement-graph-summary">{text(target.summary)}</p>
        {target.requirementStatus === 'draft' && (
          <p className="requirement-graph-footnote">{text('包含规划或待确认资料，请以已确认 PRD 为准。')}</p>
        )}
        {target.topics.length > 1 && (
          <div className="requirement-graph-memberships">
            {target.topics.map((id) => (
              <span key={id}>{text(graph?.topics.find((item) => item.id === id)?.label ?? id)}</span>
            ))}
          </div>
        )}
        {triggers.length > 0 && (
          <section>
            <h3>{text('触发条件')}</h3>
            <ul>{triggers.map((i) => renderPoint(target, i))}</ul>
          </section>
        )}
        {rules.length > 0 && (
          <section>
            <h3>{text('关键规则')}</h3>
            <ul>{rules.map((i) => renderPoint(target, i))}</ul>
          </section>
        )}
        {!target.keyPoints.length && target.evidence.length > 0 && (
          <section>
            <h3>{text('需求依据')}</h3>
            {target.evidence.map((e, index) => (
              <blockquote key={index} data-preserve-language>
                <p>{e.quote}</p>
                <button type="button" onClick={() => openSource(e.requirementId, e.quote)}>
                  <FileText size={12} />
                  {text('查看需求说明')}
                  <ArrowUpRight size={12} />
                </button>
              </blockquote>
            ))}
          </section>
        )}
        {renderRelations('前因', incoming, other)}
        {renderRelations('后果', outgoing, other)}
        {renderRelations('管理功能关联', management, other)}
        {renderRelations('相关引用与对接', related, other)}
        {(outgoing.length > 0 || management.length > 0) && (
          <section>
            <button
              type="button"
              className="requirement-graph-impact-toggle"
              aria-expanded={showImpact}
              onClick={() => setShowImpact((v) => !v)}
            >
              {text(showImpact ? '收起多级影响' : '查看多级影响')}
              <ChevronDown size={11} />
            </button>
            {showImpact &&
              (impact.isPending ? (
                <LoadingStage label={text('读取影响范围…')} />
              ) : impact.isError ? (
                <p role="alert">{impact.error.message}</p>
              ) : (
                impact.data && (
                  <div className="requirement-graph-impact">
                    {impact.data.items.map((item) => (
                      <button type="button" key={item.node.id} onClick={() => select(item.node.id)}>
                        <span>{text(item.node.label)}</span>
                        <small>{item.path.map((p) => text(p.edge.label)).join(' → ')}</small>
                      </button>
                    ))}
                    {!impact.data.items.length && (
                      <p>{text('当前记录中未找到影响节点，仍需核对遗漏和具体修改场景。')}</p>
                    )}
                    {!impact.data.complete && <p>{text('当前需求整理或查询范围不完整，请继续核对。')}</p>}
                  </div>
                )
              ))}
          </section>
        )}
        <section>
          <h3>{text('原型位置')}</h3>
          {target.prototypes.length ? (
            target.prototypes.map((p, index) => (
              <Link
                key={index}
                className="requirement-graph-prototype"
                to={`/pages/${projectId}/${p.clientId}/${p.pageKey}${p.anchor ? `?section=${encodeURIComponent(p.anchor)}` : ''}`}
              >
                {text(p.target)}
                <ArrowUpRight size={12} />
              </Link>
            ))
          ) : (
            <p className="requirement-graph-muted">{text('尚未标注原型位置')}</p>
          )}
        </section>
        {target.keyPoints.length > 0 && (
          <p className="requirement-graph-footnote">{text('要点由 AI 根据 PRD 提炼，可展开原文核对。')}</p>
        )}
      </>
    );
  };
  return (
    <main className="page_content__xGn__ requirement-graph-page">
      <div className="docs_docLayout__YK0uB">
        <article className="docs_docMain__jK5Ve">
          <nav className="docs_breadcrumb__JFHCC" aria-label="Screens">
            <Link to={`/screens${projectId ? `?project=${encodeURIComponent(projectId)}` : ''}`}>
              Screens
            </Link>
            <ChevronRight size={13} strokeWidth={1.75} aria-hidden="true" />
            {projectName && <>
              <Link to={`/screens?project=${encodeURIComponent(projectId)}`}>{text(projectName)}</Link>
              <ChevronRight size={13} strokeWidth={1.75} aria-hidden="true" />
            </>}
            <span aria-current="page">{text(title)}</span>
          </nav>
          <header className="docs_header__0YD_z">
            <div className="docs_headerCopy__ZDQWU">
              <div className="docs_titleRow__nNp4A">
                <h1>{text(title)}</h1>
              </div>
              <p>{text('查找需求点，在图中定位，再看它的规则、前因与后果。')}</p>
            </div>
          </header>
          <section id="graph-preview" className="docs_previewSection__Zbh1s" aria-label={text('图谱预览')}>
            <div className="docs_viewBar__TMird">
              <span className="requirement-graph-preview-label">
                <Eye size={14} />
                {text('预览')}
              </span>
              <div className="docs_viewTools___VpV2">
                <span className="showcase-screen-hint">
                  {text(view === '3d' ? '拖拽旋转 · 滚轮缩放' : '拖拽移动 · 滚轮缩放')}
                </span>
                <div className="preview-shell_tools___wPkm">
                  <GraphViewSwitch view={view} onChange={setView} scope="inline" />
                  <button
                    type="button"
                    className="preview-shell_expand__fXEJp"
                    aria-label={text('放大预览')}
                    title={text('全屏')}
                    disabled={!graph || graph.availability === 'unconfigured'}
                    onClick={openFullscreen}
                  >
                    <Maximize2 size={14} />
                  </button>
                </div>
              </div>
            </div>
            <div className="requirement-graph-preview" style={{ minHeight: reservedHeight }}>
              {!projectId ? (
                <div className="requirement-graph-empty">{text('尚未配置项目')}</div>
              ) : graphQuery.isPending ? (
                <LoadingStage label={text('读取需求关系图谱…')} />
              ) : graphQuery.isError ? (
                <div className="requirement-graph-empty" role="alert">
                  <p>{text('图谱读取失败')}</p>
                  <small>{text(graphQuery.error.message)}</small>
                  <button type="button" onClick={() => void graphQuery.refetch()}>
                    <RefreshCw size={14} />
                    {text('重试')}
                  </button>
                </div>
              ) : graph?.availability === 'unconfigured' ? (
                <div className="requirement-graph-empty" role="status">
                  <p>{text('尚未配置业务资料')}</p>
                  <small>{text('项目发布业务需求与关系图谱后，将显示在这里。')}</small>
                </div>
              ) : (
                graph && (
                  <div
                    ref={workspace}
                    className={`requirement-graph-workspace${expanded ? ' expanded' : ''}`}
                    aria-label={text('需求关系图谱')}
                  >
                    <details className="requirement-graph-legend" open>
                      <summary>
                        {text('图例')}
                        <span>{text('点击显示或隐藏，不改变点位')}</span>
                        <ChevronDown size={13} />
                      </summary>
                      <div role="group" aria-label={text('节点图例')}>
                        <small>{text('节点')}</small>
                        {graphNodeLegend
                          .filter((item) => nodes.some((member) => member.type === item.type))
                          .map((item) => (
                            <button
                              type="button"
                              key={item.type}
                              aria-pressed={!hiddenTypes.includes(item.type)}
                              onClick={() => {
                                if (node?.type === item.type && !hiddenTypes.includes(item.type))
                                  select(null);
                                setHiddenTypes((previous) =>
                                  previous.includes(item.type)
                                    ? previous.filter((type) => type !== item.type)
                                    : [...previous, item.type],
                                );
                              }}
                            >
                              <i style={{ background: item.color }} />
                              {text(item.label)}
                            </button>
                          ))}
                      </div>
                      <div role="group" aria-label={text('关系图例')}>
                        <small>{text('关系')}</small>
                        {graphRelationLegend
                          .filter((item) => edges.some((edge) => edge.relation === item.relation))
                          .map((item) => (
                            <button
                              type="button"
                              key={item.relation}
                              aria-pressed={!hiddenRelations.includes(item.relation)}
                              onClick={() =>
                                setHiddenRelations((previous) =>
                                  previous.includes(item.relation)
                                    ? previous.filter((relation) => relation !== item.relation)
                                    : [...previous, item.relation],
                                )
                              }
                            >
                              <i
                                className={`requirement-graph-legend-line${item.relation === 'references' || item.relation === 'similar_to' ? ' dashed' : ''}`}
                                style={{ color: item.color }}
                              />
                              {text(item.label)}
                            </button>
                          ))}
                        {(hiddenTypes.length > 0 || hiddenRelations.length > 0) && (
                          <button
                            type="button"
                            className="requirement-graph-legend-reset"
                            onClick={() => {
                              setHiddenTypes([]);
                              setHiddenRelations([]);
                            }}
                          >
                            {text('显示全部')}
                          </button>
                        )}
                      </div>
                    </details>
                    <div className="requirement-graph-frame" data-detail={node ? 'open' : undefined}>
                      <aside className="requirement-graph-finder" aria-label={text('查找需求点')}>
                        <label className="requirement-graph-search">
                          <Search size={14} />
                          <input
                            aria-label={text('搜索需求点')}
                            placeholder={text('搜索需求点…')}
                            value={query}
                            onChange={(e) => {
                              setQuery(e.target.value);
                              setResultLimit(40);
                            }}
                          />
                          {query && (
                            <button type="button" aria-label={text('清除搜索')} onClick={() => setQuery('')}>
                              <X size={13} />
                            </button>
                          )}
                        </label>
                        {selected && (
                          <button
                            type="button"
                            className="requirement-graph-overview-link"
                            onClick={() => {
                              setQuery('');
                              select(null);
                            }}
                          >
                            {text('清除选中')}
                          </button>
                        )}
                        <div ref={list} className="requirement-graph-finder-list">
                          <p className="requirement-graph-result-count">
                            {results.length} {text('个需求点')}
                          </p>
                          <div className="requirement-graph-result-list">
                            {results.slice(0, resultLimit).map((member) => (
                              <button
                                type="button"
                                key={member.id}
                                title={text(member.label)}
                                data-node={member.id}
                                aria-pressed={selected === member.id}
                                onClick={() => select(member.id)}
                              >
                                <i style={{ background: graphNodeColor(member.type) }} />
                                <span>
                                  {text(member.label)}
                                  <small>{text(typeLabels[member.type] ?? '')}</small>
                                </span>
                              </button>
                            ))}
                          </div>
                          {results.length > resultLimit && (
                            <button
                              type="button"
                              className="requirement-graph-more"
                              onClick={() => setResultLimit((previous) => previous + 40)}
                            >
                              {text('显示更多')}
                            </button>
                          )}
                          {!results.length && (
                            <p className="requirement-graph-finder-empty">
                              {text(
                                graph.availability === 'ready'
                                  ? matches
                                    ? '没有匹配的需求点'
                                    : '尚无需求点'
                                  : graph.availability === 'invalid'
                                    ? '图谱格式需要修复'
                                    : '业务图谱尚未发布',
                              )}
                            </p>
                          )}
                        </div>
                      </aside>
                      <div
                        className="requirement-graph-visual"
                        id="requirement-graph-visual"
                        role="tabpanel"
                        aria-label={view.toUpperCase()}
                        tabIndex={0}
                      >
                        {nodes.length ? (
                          <>
                            {selected && (
                              <div className="requirement-graph-scope-bar">
                                <span>{text('当前节点与直接关联')}</span>
                                <small>
                                  {scope.nodes.length} {text('个需求点')}
                                </small>
                              </div>
                            )}
                            <Suspense
                              fallback={
                                <div className="requirement-graph-stage">
                                  <LoadingStage label={text('绘制关系图谱…')} />
                                </div>
                              }
                            >
                              <GraphView
                                nodes={nodes}
                                edges={edges}
                                selected={node?.id ?? null}
                                onSelect={select}
                                expanded={expanded}
                                focus={matchIds}
                                hiddenTypes={hiddenTypes}
                                hiddenRelations={hiddenRelations}
                                memory={view === '2d' ? planarMemory : sphereMemory}
                              />
                            </Suspense>
                          </>
                        ) : (
                          <div
                            className="requirement-graph-empty"
                            role={graph.availability === 'invalid' ? 'alert' : undefined}
                          >
                            <p>
                              {text(
                                graph.availability === 'ready'
                                  ? '尚无需求点'
                                  : graph.availability === 'invalid'
                                    ? '图谱格式需要修复'
                                    : '业务图谱尚未发布',
                              )}
                            </p>
                          </div>
                        )}
                      </div>
                      <AnimatePresence initial={false}>
                        {(node || expanded) && (
                          <motion.aside
                            ref={detail}
                            key="detail"
                            className="requirement-graph-detail"
                            aria-label={text('节点详情')}
                            initial={{ opacity: 0, x: reduced ? 0 : 12 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: reduced ? 0 : 8 }}
                            transition={reduced ? { duration: 0 } : siteMotionTokens.spring.snappy}
                          >
                            {node ? (
                              renderDetail(node)
                            ) : (
                              <div className="requirement-graph-detail-empty">
                                <h2>{text('节点详情')}</h2>
                                <p>{text('选择左侧需求或图中节点，查看规则、前因、后果与原文。')}</p>
                              </div>
                            )}
                          </motion.aside>
                        )}
                      </AnimatePresence>
                    </div>
                    <footer className="requirement-graph-status">
                      <span>
                        {visibility.nodeIds.size} {text('个需求点')} · {visibility.edgeIds.size}{' '}
                        {text('条关联')}
                      </span>
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
                    </footer>
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
                          <button
                            type="button"
                            aria-label={text('关闭文档')}
                            onClick={() => setDocumentId('')}
                          >
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
                              <Markdown
                                source={source.data.markdown}
                                loading={false}
                                layout="site"
                                activeAnchor={graphSourceAnchor(source.data.markdown, documentQuote)}
                              />
                            </Suspense>
                          )
                        )}
                      </div>
                    )}
                  </div>
                )
              )}
            </div>
            <FullscreenPreview
              open={expanded}
              onOpenChange={setExpanded}
              title={text('需求关系图谱')}
              mobile={false}
              nativeRef={workspace}
              initialBounds={fullscreenBounds}
              toolbar={<GraphViewSwitch view={view} onChange={setView} scope="fullscreen" />}
              onExitComplete={() => setReservedHeight(undefined)}
              onEscapeKeyDown={(event) => {
                if (documentId) {
                  event.preventDefault();
                  setDocumentId('');
                }
              }}
            />
          </section>
          <div className="showcase-document requirement-graph-guide" data-preserve-language>
            <GuideBody
              source={REQUIREMENT_GRAPH_GUIDE.markdown}
              documentPath={REQUIREMENT_GRAPH_GUIDE.path}
              projectId={projectId}
              resolveDocumentUrl={guideUrl}
              onHeadings={setHeadings}
            />
          </div>
        </article>
        <aside className="docs_tocRail__mVzSm">
          <nav className="docs_toc__4bz2v" aria-label={text('本页目录')}>
            <p className="docs_tocTitle__v_VlL">{text('本页目录')}</p>
            <TocSelection activeKey={active}>
              <li>
                <button
                  type="button"
                  aria-current={active === 'graph-preview' ? 'location' : undefined}
                  onClick={() => scrollTo('graph-preview')}
                >
                  {text('预览')}
                </button>
              </li>
              {headings
                .filter((heading) => heading.level <= 2)
                .map((heading) => (
                  <li key={heading.id} data-preserve-language>
                    <button
                      type="button"
                      aria-current={active === heading.id ? 'location' : undefined}
                      onClick={() => scrollTo(heading.id)}
                    >
                      {heading.text}
                    </button>
                  </li>
                ))}
            </TocSelection>
            <div className="docs_tocFooter__8MA86">
              <button
                type="button"
                onClick={() => window.scrollTo({ top: 0, behavior: reduced ? 'instant' : 'smooth' })}
              >
                {text('返回顶部')}
                <ArrowUp size={13} />
              </button>
            </div>
          </nav>
        </aside>
      </div>
    </main>
  );
}
