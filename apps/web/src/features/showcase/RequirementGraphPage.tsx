/** Read-only graph: find on the left, explore in the centre, understand on the right.
 * Publication, evidence and access belong to the service; key points are AI reading aids. */
import { lazy, Suspense, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { Search, X, ArrowUpRight, RefreshCw, FileText, ChevronDown, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { LoadingStage } from '@preview/ui/loading';
import { siteMotionTokens } from '@preview/ui';
import type {
  RequirementGraph,
  GraphImpact,
  GraphNode,
  GraphEdge,
  GraphTopic,
} from '../../../../../packages/platform-contracts/src/requirement-graph';
import { useNativeAuth } from '@/features/platform/platform-api';
import { useShowcaseText } from './showcase-locale';
import { scopeColor } from './graph-presentation';
import {
  graphReadingRelations,
  graphReadingScope,
  graphReadingGroups,
  graphSourceAnchor,
} from './graph-reading';
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
export default function RequirementGraphPage({
  projectId,
  projectMenu,
}: {
  projectId: string;
  projectMenu?: ReactNode;
}) {
  const text = useShowcaseText(),
    { client, session } = useNativeAuth(),
    reduced = useReducedMotion();
  const [query, setQuery] = useState('');
  const [topic, setTopic] = useState<string | null>(null);
  const [openTopics, setOpenTopics] = useState<Set<string>>(() => new Set());
  const [collapsedSearchTopics, setCollapsedSearchTopics] = useState<Set<string>>(() => new Set());
  const [selected, setSelected] = useState<string | null>(null),
    [expanded, setExpanded] = useState(false);
  const [showImpact, setShowImpact] = useState(false),
    [documentId, setDocumentId] = useState('');
  const [openQuotes, setOpenQuotes] = useState<Set<string>>(() => new Set());
  const [documentQuote, setDocumentQuote] = useState('');
  const workspace = useRef<HTMLDivElement>(null),
    documentPanel = useRef<HTMLDivElement>(null),
    list = useRef<HTMLDivElement>(null),
    detail = useRef<HTMLElement>(null);
  const identity = `${session?.user?.id ?? 'anonymous'}:${session?.user?.revision ?? 0}`;
  // Content changes only with a release; focus refetch keeps it current without polling.
  const graphQuery = useQuery({
    queryKey: ['requirement-graph', projectId, identity],
    queryFn: ({ signal }) =>
      client.request(`/showcase/${projectId}/graph?limit=500`, { signal }) as Promise<RequirementGraph>,
    enabled: !!projectId,
    retry: false,
    staleTime: 30_000,
  });
  const graph = graphQuery.isError ? undefined : graphQuery.data;
  const nodes = useMemo(() => graph?.nodes ?? [], [graph]);
  const edges = useMemo(() => graph?.edges ?? [], [graph]);
  const topicIndex = useMemo(() => new Map((graph?.topics ?? []).map((t, i) => [t.id, i])), [graph]);
  const term = query.trim().toLocaleLowerCase();
  const matches = useMemo(() => {
    if (!term) return null;
    return nodes.filter((n) =>
      [n.label, n.summary, ...n.aliases, ...n.keyPoints.map((p) => p.text)].some((v) =>
        text(v).toLocaleLowerCase().includes(term),
      ),
    );
  }, [nodes, term, text]);
  const matchIds = useMemo(() => matches?.map((n) => n.id) ?? null, [matches]);
  const groups = useMemo(
    () =>
      (graph?.topics ?? [])
        .map((t) => ({ topic: t, nodes: (matches ?? nodes).filter((n) => n.topics.includes(t.id)) }))
        .filter((g) => g.nodes.length),
    [graph, matches, nodes],
  );
  const node = nodes.find((n) => n.id === selected);
  const topicSections = useMemo(
    () =>
      [
        { category: 'business', label: '业务线' },
        { category: 'management', label: '共用管理' },
        { category: undefined, label: '其他主题' },
      ]
        .map((section) => ({
          ...section,
          groups: groups.filter((group) => group.topic.category === section.category),
        }))
        .filter((section) => section.groups.length),
    [groups],
  );
  const scope = useMemo(
    () => graphReadingScope(nodes, edges, selected, topic),
    [nodes, edges, selected, topic],
  );
  const overview = !selected && !topic && nodes.length > 40;
  const largeTopic = !selected && topic && scope.nodes.length > 28;
  const selectedTopic = graph?.topics.find((item) => item.id === topic);
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
    enabled: !!selected && showImpact && !!graph,
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
      setOpenTopics((current) =>
        current.has(target.primaryTopic) ? current : new Set(current).add(target.primaryTopic),
      );
      if (matches && !matches.some((n) => n.id === id)) setQuery('');
    }
  };
  const openSource = (id: string, quote: string) => {
    setDocumentQuote(quote);
    setDocumentId(id);
  };
  const selectTopic = (id: string | null) => {
    select(null);
    setTopic(id);
    if (id) setOpenTopics(new Set([id]));
  };
  const toggleTopic = (id: string) =>
    setOpenTopics((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
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
  useEffect(() => {
    if (!expanded) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const key = (event: KeyboardEvent) => {
      if (event.defaultPrevented) return;
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
  }, [expanded, documentId]);
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
  const renderTopicGroup = ({ topic: item, nodes: members }: { topic: GraphTopic; nodes: GraphNode[] }) => {
    const open = matches ? !collapsedSearchTopics.has(item.id) : openTopics.has(item.id);
    const renderMember = (member: GraphNode) => (
      <button
        type="button"
        key={member.id}
        title={text(member.label)}
        data-node={member.id}
        aria-pressed={selected === member.id}
        onClick={() => select(selected === member.id ? null : member.id)}
      >
        <span>{text(member.label)}</span>
        <small>{text(typeLabels[member.type] ?? '')}</small>
      </button>
    );
    return (
      <section key={item.id} className="requirement-graph-group">
        <button
          type="button"
          className="requirement-graph-group-head"
          aria-expanded={open}
          aria-current={topic === item.id ? 'true' : undefined}
          onClick={() => {
            if (matches) {
              setCollapsedSearchTopics((current) => {
                const next = new Set(current);
                if (next.has(item.id)) next.delete(item.id);
                else next.add(item.id);
                return next;
              });
            } else if (open) toggleTopic(item.id);
            else selectTopic(item.id);
          }}
        >
          <ChevronRight size={13} />
          <i style={{ background: scopeColor(topicIndex.get(item.id) ?? 0) }} />
          <span>{text(item.label)}</span>
          <small>{members.length}</small>
        </button>
        {open && (
          <div className="requirement-graph-group-items">
            {members.length > 12 && !matches
              ? graphReadingGroups(members).map((group) => (
                  <details
                    key={`${item.id}:${group.label}:${selected ?? ''}`}
                    open={group.nodes.some((member) => member.id === selected)}
                    className="requirement-graph-node-group"
                  >
                    <summary>
                      {text(group.label)}
                      <small>{group.nodes.length}</small>
                      <ChevronDown size={12} />
                    </summary>
                    {group.nodes.map(renderMember)}
                  </details>
                ))
              : members.map(renderMember)}
          </div>
        )}
      </section>
    );
  };
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
          <p className="requirement-graph-footnote">{text('包含待确认的页面说明，请以已确认 PRD 为准。')}</p>
        )}
        {target.topics.length > 1 && (
          <div className="requirement-graph-memberships">
            {target.topics.map((id) => (
              <button type="button" key={id} onClick={() => selectTopic(id)}>
                {text(graph?.topics.find((item) => item.id === id)?.label ?? id)}
              </button>
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
    <article className="requirement-graph-page">
      <nav className="docs_breadcrumb__JFHCC" aria-label={text('文档')}>
        <Link to={`/docs${projectId ? `?project=${encodeURIComponent(projectId)}` : ''}`}>
          {text('文档')}
        </Link>
        <span aria-hidden="true">›</span>
        <span aria-current="page">{text('需求关系图谱')}</span>
      </nav>
      <header className="requirement-graph-heading">
        <h1>{text('需求关系图谱')}</h1>
        <p>{text('查找需求点，在图中定位，再看它的规则、前因与后果。')}</p>
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
            role={expanded ? 'dialog' : undefined}
            aria-modal={expanded || undefined}
            aria-label={text('需求关系图谱')}
          >
            {expanded && (overview || largeTopic) && (
              <button type="button" className="requirement-graph-exit" onClick={() => setExpanded(false)}>
                {text('退出全屏')}
                <X size={15} />
              </button>
            )}
            <div className="requirement-graph-frame" data-detail={node ? 'open' : undefined}>
              <aside className="requirement-graph-finder" aria-label={text('查找需求点')}>
                {projectMenu}
                <label className="requirement-graph-search">
                  <Search size={14} />
                  <input
                    aria-label={text('搜索需求点')}
                    placeholder={text('搜索需求点…')}
                    value={query}
                    onChange={(e) => {
                      setQuery(e.target.value);
                      setCollapsedSearchTopics(new Set());
                    }}
                  />
                  {query && (
                    <button type="button" aria-label={text('清除搜索')} onClick={() => setQuery('')}>
                      <X size={13} />
                    </button>
                  )}
                </label>
                {(topic || selected) && (
                  <button
                    type="button"
                    className="requirement-graph-overview-link"
                    onClick={() => {
                      setQuery('');
                      selectTopic(null);
                    }}
                  >
                    {text('全部主题')}
                  </button>
                )}
                <div ref={list} className="requirement-graph-finder-list">
                  {topicSections.map((section) => (
                    <section key={section.category ?? 'general'} className="requirement-graph-category">
                      {section.category && <h2>{text(section.label)}</h2>}
                      {section.groups.map(renderTopicGroup)}
                    </section>
                  ))}
                  {!groups.length && (
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
              <div className="requirement-graph-visual">
                {overview ? (
                  <section className="requirement-graph-overview" aria-label={text('全部主题')}>
                    <h2>{text('按业务查找需求')}</h2>
                    <p>{text('先选择业务线或管理分类，再查看流程、规则与关联。')}</p>
                    {topicSections.map((section) => (
                      <section
                        key={section.category ?? 'general'}
                        className="requirement-graph-overview-section"
                      >
                        {section.category && <h3>{text(section.label)}</h3>}
                        <div>
                          {section.groups.map(({ topic: item, nodes: members }) => (
                            <button type="button" key={item.id} onClick={() => selectTopic(item.id)}>
                              <i style={{ background: scopeColor(topicIndex.get(item.id) ?? 0) }} />
                              <span>
                                {text(item.label)}
                                <em>{text(item.description)}</em>
                              </span>
                              <small>{members.length}</small>
                              <ChevronRight size={14} />
                            </button>
                          ))}
                        </div>
                      </section>
                    ))}
                  </section>
                ) : largeTopic ? (
                  <section className="requirement-graph-topic-start">
                    <h2>{text(selectedTopic?.label ?? '')}</h2>
                    <p>{text('选择需求查看业务逻辑和管理功能关联，全部条目可在左侧查找。')}</p>
                    {graphReadingGroups(scope.nodes).map((group) => (
                      <details key={`${topic}:${group.label}`} open={group.label === '业务流程与状态'}>
                        <summary>
                          {text(group.label)}
                          <small>{group.nodes.length}</small>
                          <ChevronDown size={14} />
                        </summary>
                        <div>
                          {group.nodes.map((member) => (
                            <button type="button" key={member.id} onClick={() => select(member.id)}>
                              <span>{text(member.label)}</span>
                              <ChevronRight size={13} />
                            </button>
                          ))}
                        </div>
                      </details>
                    ))}
                  </section>
                ) : nodes.length ? (
                  <>
                    {(topic || selected) && (
                      <div className="requirement-graph-scope-bar">
                        <span>
                          {selected ? text('当前节点与直接关联') : text(selectedTopic?.label ?? '')}
                        </span>
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
                      <Canvas
                        nodes={scope.nodes}
                        edges={scope.edges}
                        topics={graph.topics}
                        topic={selected ? null : topic}
                        selected={selected}
                        onSelect={select}
                        expanded={expanded}
                        onExpand={() => setExpanded((v) => !v)}
                        focus={matchIds}
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
                {node && (
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
                    {renderDetail(node)}
                  </motion.aside>
                )}
              </AnimatePresence>
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
    </article>
  );
}
