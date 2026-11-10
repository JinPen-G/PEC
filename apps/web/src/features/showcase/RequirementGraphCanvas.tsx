/** G6 owns geometry, layout, viewport and theme ranges. Business evidence and
 * permissions stay in project-core; engine IDs only affect presentation. */
import { useEffect, useRef, useState } from 'react';
import { Graph, type GraphData, type NodeData, type LayoutOptions } from '@antv/g6';
import { Minus, Plus, Scan, Maximize2, Minimize2 } from 'lucide-react';
import { useReducedMotion } from 'motion/react';
import { LoadingStage } from '@preview/ui/loading';
import type {
  GraphNode,
  GraphEdge,
  GraphTopic,
} from '../../../../../packages/platform-contracts/src/requirement-graph';
import { useShowcaseText } from './showcase-locale';
import { usePlatformLocale } from '@/features/locale/platform-locale';

import { scopeColor } from './graph-presentation';
const renderNodeId = (id: string) => `node:${id}`;
const renderEdgeId = (id: string) => `edge:${id}`;
/** Native CSS tokens can be OKLCH; G6's vector parser requires RGB colors. */
function drawingColor(value: string, fallback: string) {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 1;
  const context = canvas.getContext('2d', { willReadFrequently: true });
  if (!context) return fallback;
  context.fillStyle = fallback;
  context.fillStyle = value;
  context.fillRect(0, 0, 1, 1);
  const [r, g, b, a] = context.getImageData(0, 0, 1, 1).data;
  return `rgba(${r},${g},${b},${a / 255})`;
}
/** Frames nodes within a readable zoom range instead of an extreme fit. */
async function frameNodes(graph: Graph, ids: string[], timing: { duration: number }) {
  if (!ids.length) return;
  const points = ids.map((id) => graph.getElementPosition(id));
  const [canvasWidth, canvasHeight] = graph.getSize();
  const spanX = Math.max(...points.map((p) => p[0])) - Math.min(...points.map((p) => p[0])) + 200;
  const spanY = Math.max(...points.map((p) => p[1])) - Math.min(...points.map((p) => p[1])) + 170;
  const zoom = Math.min(1, Math.max(0.8, Math.min(canvasWidth / spanX, canvasHeight / spanY)));
  if (Math.abs(graph.getZoom() - zoom) > 0.05) await graph.zoomTo(zoom, timing);
  await graph.focusElement(ids, timing);
}
async function adjustView(graph: Graph, selected: string | null, reduced: boolean, focus: string[] = []) {
  const timing = { duration: reduced ? 0 : 260 };
  const all = graph.getNodeData();
  if (!all.length) return;
  if (selected && all.some((node) => node.id === renderNodeId(selected))) {
    // Frame the selection with its direct neighbours so causes and effects stay visible.
    await frameNodes(
      graph,
      [renderNodeId(selected), ...graph.getNeighborNodesData(renderNodeId(selected)).map((node) => node.id)],
      timing,
    );
    return;
  }
  const wanted = new Set(focus.map(renderNodeId));
  const targets = all.filter((node) => wanted.has(node.id));
  await frameNodes(
    graph,
    (targets.length ? targets : all).map((node) => node.id),
    timing,
  );
}
export default function RequirementGraphCanvas({
  nodes,
  edges,
  topics,
  topic,
  selected,
  onSelect,
  expanded,
  onExpand,
  focus,
}: {
  nodes: GraphNode[];
  edges: GraphEdge[];
  topics: GraphTopic[];
  topic: string | null;
  selected: string | null;
  onSelect: (id: string | null) => void;
  expanded: boolean;
  onExpand: () => void;
  /** Search matches: dimmed contrast and framed when nothing is selected. */
  focus: string[] | null;
}) {
  const text = useShowcaseText(),
    { locale } = usePlatformLocale(),
    reduced = useReducedMotion();
  const host = useRef<HTMLDivElement>(null),
    instance = useRef<Graph | null>(null);
  const callback = useRef(onSelect),
    dataRef = useRef({ nodes, edges, topics, topic, locale });
  const queue = useRef<Promise<void>>(Promise.resolve());
  const layoutIdentity = useRef('');
  const renderedSignature = useRef('');
  const positions = useRef(new Map<string, { x: number; y: number }>());
  const defaultLayout = useRef<LayoutOptions | undefined>(undefined);
  const selection = useRef(selected);
  const topicSelection = useRef<string[]>(focus ?? []);
  const previousSelection = useRef<string | null>(null);
  const previousFocus = useRef('');
  const [ready, setReady] = useState(false);
  const [error, setError] = useState('');
  const [compact, setCompact] = useState(false);
  useEffect(() => {
    callback.current = onSelect;
  }, [onSelect]);
  useEffect(() => {
    dataRef.current = { nodes, edges, topics, topic, locale };
  }, [nodes, edges, topics, topic, locale]);
  useEffect(() => {
    selection.current = selected;
  }, [selected]);
  useEffect(() => {
    topicSelection.current = focus ?? [];
  }, [focus]);
  useEffect(() => {
    if (!host.current) return;
    const graph = new Graph({
      container: host.current,
      autoResize: false,
      padding: [62, 46, 62, 46],
      animation: !reduced,
      zoomRange: [0.15, 3],
      behaviors: ['drag-canvas', 'zoom-canvas', 'drag-element'],
      layout: {
        type: 'combo-combined',
        nodeSize: 90,
        nodeSpacing: 20,
        comboPadding: 42,
        comboSpacing: 56,
        layout: (comboId: string | null) =>
          comboId
            ? {
                type: 'dagre',
                rankdir: 'TB',
                nodesep: 28,
                ranksep: 56,
                nodeSize: [108, 44],
              }
            : {
                type: 'grid',
                rows: Math.max(
                  1,
                  Math.ceil(
                    Math.sqrt(
                      dataRef.current.topics.filter((topic) =>
                        dataRef.current.nodes.some((node) => node.primaryTopic === topic.id),
                      ).length,
                    ),
                  ),
                ),
                condense: true,
                preventOverlap: true,
                nodeSpacing: 36,
                sortBy: (a: NodeData, b: NodeData) =>
                  dataRef.current.topics.findIndex((topic) => `scope:${topic.id}` === a.id) -
                  dataRef.current.topics.findIndex((topic) => `scope:${topic.id}` === b.id),
              },
      },
      node: {
        type: 'circle',
        style: {
          size: 14,
          opacity: 1,
          fillOpacity: 1,
          stroke: '#ffffff',
          lineWidth: 2,
          // Invisible G6 halo keeps small visual dots easy to click and drag.
          halo: true,
          haloLineWidth: 36,
          haloStrokeOpacity: 0,
          haloPointerEvents: 'all',
          labelPlacement: 'bottom',
          labelOffsetY: 8,
          labelFontSize: 14,
          labelFontWeight: 400,
          labelMaxWidth: 160,
          labelWordWrap: true,
          labelMaxLines: 2,
          labelTextAlign: 'center',
        },
        state: {
          focused: { opacity: 1, lineWidth: 3, size: 20, haloStrokeOpacity: 0 },
          dimmed: { opacity: 0.3 },
        },
      },
      combo: {
        type: 'rect',
        style: {
          padding: 46,
          fillOpacity: 0,
          strokeOpacity: 0,
          label: false,
          pointerEvents: 'none',
        },
      },
      edge: {
        type: (datum) => String(datum.type ?? 'line'),
        style: {
          opacity: 1,
          labelOpacity: 1,
          halo: false,
          lineWidth: 1,
          endArrow: true,
          endArrowSize: 5,
          labelFontSize: 12,
          labelBackground: true,
          labelBackgroundRadius: 3,
          labelPadding: [2, 3],
          labelAutoRotate: false,
        },
        state: {
          dimmed: { opacity: 0.12, labelOpacity: 0 },
          connected: { opacity: 1, lineWidth: 1.2, labelOpacity: 1, halo: false, labelFontWeight: 400 },
        },
      },
    });
    defaultLayout.current = graph.getLayout();
    layoutIdentity.current = '';
    previousSelection.current = null;
    instance.current = graph;
    graph.on('node:click', (event) => {
      const target = 'target' in event ? event.target : null;
      if (target && 'id' in target && String(target.id).startsWith('node:'))
        callback.current(String(target.id).slice(5));
    });
    const savePositions = () => {
      // Preserve user positioning across filters and background data refreshes.
      graph.getNodeData().forEach((node) => {
        if (typeof node.style?.x === 'number' && typeof node.style?.y === 'number')
          positions.current.set(node.id, { x: node.style.x, y: node.style.y });
      });
    };
    graph.on('afterrender', savePositions);
    graph.on('node:dragend', savePositions);
    graph.on('canvas:click', () => callback.current(null));
    let frame = 0;
    const resize = new ResizeObserver(() => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        if (graph.destroyed) return;
        const container = host.current?.parentElement;
        if (!container) return;
        setCompact(container.clientWidth < 620);
        graph.resize(container.clientWidth, container.clientHeight);
        queue.current = queue.current
          .catch(() => {})
          .then(async () => {
            if (!graph.destroyed && graph.getNodeData().length)
              await adjustView(graph, selection.current, !!reduced, topicSelection.current);
          });
      });
    });
    resize.observe(host.current.parentElement ?? host.current);
    return () => {
      resize.disconnect();
      cancelAnimationFrame(frame);
      instance.current = null;
      graph.destroy();
    };
  }, [reduced]);
  useEffect(() => {
    const graph = instance.current;
    if (!graph) return;
    const render = () => {
      queue.current = queue.current
        .catch(() => {})
        .then(async () => {
          if (graph.destroyed) return;
          const current = dataRef.current,
            style = getComputedStyle(document.documentElement);
          const tokens = ['--foreground', '--surface', '--text-muted', '--surface-muted'].map((name) =>
            style.getPropertyValue(name).trim(),
          );
          const family = getComputedStyle(document.body).fontFamily;
          const displayTopic = (node: GraphNode) =>
            current.topic && node.topics.includes(current.topic) ? current.topic : node.primaryTopic;
          // Theme observers and refetches often deliver identical input; skip redundant redraws.
          const signature = JSON.stringify({
            compact,
            tokens,
            family,
            locale: current.locale,
            nodes: current.nodes.map((node) => [node.id, node.label, displayTopic(node)]),
            edges: current.edges.map((edge) => [edge.id, edge.source, edge.target, edge.label]),
          });
          if (signature === renderedSignature.current && graph.getNodeData().length) return;
          const ink = drawingColor(tokens[0], '#202124');
          const surface = drawingColor(tokens[1], '#ffffff');
          const line = drawingColor(tokens[2], '#94a3b8');
          const mutedSurface = drawingColor(tokens[3], '#f8f8f8');
          const groups = current.topics.filter((topic) =>
            current.nodes.some((node) => displayTopic(node) === topic.id),
          );
          const parallel = new Map<string, string[]>();
          current.edges.forEach((edge) => {
            const pair = [edge.source, edge.target].sort().join(':');
            parallel.set(pair, [...(parallel.get(pair) ?? []), renderEdgeId(edge.id)]);
          });
          const parallelIds = [...parallel.values()].filter((ids) => ids.length > 1).flat();
          // Restrict the upstream transform: it straightens unrelated singleton edges.
          graph.setTransforms(
            parallelIds.length
              ? [{ type: 'process-parallel-edges', mode: 'bundle', distance: 24, edges: parallelIds }]
              : [],
          );
          const data: GraphData = {
            nodes: current.nodes.map((node) => ({
              id: renderNodeId(node.id),
              combo: `scope:${displayTopic(node)}`,
              data: { primaryTopic: displayTopic(node), topics: node.topics },
              style: {
                ...positions.current.get(renderNodeId(node.id)),
                fill: scopeColor(current.topics.findIndex((topic) => topic.id === displayTopic(node))),
                labelText: text(node.label),
                labelFill: ink,
                labelFontFamily: family,
                stroke: surface,
              },
            })),
            edges: current.edges.map((edge) => ({
              id: renderEdgeId(edge.id),
              source: renderNodeId(edge.source),
              target: renderNodeId(edge.target),
              type:
                current.nodes.find((n) => n.id === edge.source)?.primaryTopic !==
                current.nodes.find((n) => n.id === edge.target)?.primaryTopic
                  ? 'quadratic'
                  : 'line',
              style: {
                curveOffset: 36,
                opacity: 1,
                stroke: line,
                strokeOpacity: 0.5,
                labelFill: ink,
                labelText: text(edge.label),
                labelWordWrap: true,
                labelMaxWidth: compact ? 70 : 180,
                labelMaxLines: 3,
                labelOpacity: 1,
                labelBackgroundFill: mutedSurface,
              },
            })),
            combos: groups.map((topic) => ({
              id: `scope:${topic.id}`,
            })),
          };
          // G6 owns the adaptive contour and follows node updates. Hidden combos
          // only organize layout; they are neither theme shapes nor business nodes.
          const contours = groups.map((topic) => {
            const members = current.nodes
              .filter((node) => displayTopic(node) === topic.id)
              .map((node) => renderNodeId(node.id));
            const color = scopeColor(current.topics.findIndex((item) => item.id === topic.id));
            return {
              type: 'bubble-sets',
              key: `contour:${topic.id}`,
              members,
              avoidMembers: current.nodes
                .filter((node) => displayTopic(node) !== topic.id)
                .map((node) => renderNodeId(node.id)),
              nodeR0: 24,
              nodeR1: 110,
              morphBuffer: 22,
              threshold: 0.65,
              fill: color,
              fillOpacity: 0.04,
              stroke: color,
              strokeOpacity: 0.35,
              lineWidth: 1,
              lineDash: [3, 5],
              zIndex: -1,
              pointerEvents: 'none',
              labelText: text(topic.label),
              labelPlacement: 'top',
              labelCloseToPath: false,
              labelAutoRotate: false,
              labelOffsetY: -12,
              labelFontSize: 13,
              labelFontWeight: 400,
              labelFill: ink,
              labelFontFamily: family,
              labelBackground: true,
              labelBackgroundFill: surface,
              labelBackgroundRadius: 6,
              labelPadding: [4, 8],
            };
          });
          const identity = JSON.stringify({
            compact,
            nodes: current.nodes.map((node) => [node.id, displayTopic(node)]),
            edges: current.edges.map((edge) => [edge.id, edge.source, edge.target]),
          });
          const styleOnly = layoutIdentity.current === identity && graph.getNodeData().length > 0;
          if (!styleOnly) setReady(false);
          // BubbleSets caches member bounds. Dispose them before removed nodes
          // leave the graph; otherwise upstream callbacks can read deleted IDs.
          if (!styleOnly) graph.setPlugins([]);
          if (styleOnly) {
            graph.updateNodeData(data.nodes!);
            graph.updateEdgeData(data.edges!);
            graph.updateComboData(data.combos!);
          } else {
            positions.current.clear();
            for (const node of data.nodes!) {
              delete node.style?.x;
              delete node.style?.y;
            }
            graph.setData(data);
          }
          graph.setPlugins(contours);
          graph.setOptions({
            layout: styleOnly
              ? undefined
              : selection.current
                ? {
                    type: 'dagre',
                    rankdir: compact ? 'TB' : 'LR',
                    nodeSize: compact ? [128, 56] : [160, 70],
                    nodesep: compact ? 32 : 40,
                    ranksep: compact ? 75 : 110,
                  }
                : defaultLayout.current,
            animation: false,
          });
          await graph.render();
          if (!graph.destroyed) {
            if (!styleOnly) await adjustView(graph, selection.current, !!reduced, topicSelection.current);
            layoutIdentity.current = identity;
            renderedSignature.current = signature;
            setReady(true);
            setError('');
          }
        })
        .catch((reason: unknown) => {
          if (!graph.destroyed) setError(reason instanceof Error ? reason.message : text('图谱绘制失败'));
        });
    };
    render();
    let frame = 0;
    const observer = new MutationObserver(() => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(render);
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class', 'data-theme', 'style'],
    });
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [nodes, edges, topics, topic, locale, reduced, text, compact]);
  useEffect(() => {
    const graph = instance.current;
    if (!graph) return;
    queue.current = queue.current
      .then(async () => {
        if (graph.destroyed) return;
        const connected = new Set([
          selected,
          ...edges
            .filter((edge) => edge.source === selected || edge.target === selected)
            .flatMap((edge) => [edge.source, edge.target]),
        ]);
        const matches = focus ? new Set(focus) : null;
        const states: Record<string, string[]> = {};
        nodes.forEach(
          (node) =>
            (states[renderNodeId(node.id)] = selected
              ? node.id === selected
                ? ['focused']
                : connected.has(node.id)
                  ? []
                  : ['dimmed']
              : matches && !matches.has(node.id)
                ? ['dimmed']
                : []),
        );
        edges.forEach(
          (edge) =>
            (states[renderEdgeId(edge.id)] = selected
              ? edge.source === selected || edge.target === selected
                ? ['connected']
                : ['dimmed']
              : matches && !(matches.has(edge.source) && matches.has(edge.target))
                ? ['dimmed']
                : []),
        );
        await graph.setElementState(states, !reduced);
        const focusKey = (focus ?? []).join('|');
        if (previousSelection.current !== selected || (!selected && previousFocus.current !== focusKey)) {
          await adjustView(graph, selected, !!reduced, focus ?? []);
          previousSelection.current = selected;
          previousFocus.current = focusKey;
        }
      })
      .catch((reason: unknown) => {
        if (!graph.destroyed) setError(reason instanceof Error ? reason.message : text('图谱绘制失败'));
      });
  }, [selected, focus, nodes, edges, reduced, text]);
  const action = (operation: () => Promise<void> | undefined) => {
    void operation()?.catch((reason: unknown) => {
      setError(reason instanceof Error ? reason.message : text('图谱绘制失败'));
    });
  };
  return (
    <div className="requirement-graph-stage">
      <div className="requirement-graph-viewport">
        <div
          ref={host}
          className="requirement-graph-canvas"
          data-layout={compact ? 'vertical' : 'horizontal'}
          role="img"
          aria-busy={!ready && !error}
          aria-label={text('需求关系图谱，可通过查找节点选择功能')}
        />
        {!ready && !error && (
          <div className="requirement-graph-canvas-loading">
            <LoadingStage label={text('绘制关系图谱…')} />
          </div>
        )}
        {error && (
          <div className="requirement-graph-canvas-error" role="alert">
            {text('图谱绘制失败')}
            <small>{error}</small>
          </div>
        )}
      </div>
      <div className="requirement-graph-tools" aria-label={text('图谱视图控制')}>
        <button
          type="button"
          title={text('放大')}
          aria-label={text('放大')}
          onClick={() => action(() => instance.current?.zoomBy(1.25))}
        >
          <Plus size={16} />
        </button>
        <button
          type="button"
          title={text('缩小')}
          aria-label={text('缩小')}
          onClick={() => action(() => instance.current?.zoomBy(0.8))}
        >
          <Minus size={16} />
        </button>
        <button
          type="button"
          title={text('适应画布')}
          aria-label={text('适应画布')}
          onClick={() => action(() => instance.current?.fitView())}
        >
          <Scan size={16} />
        </button>
        <button
          type="button"
          title={text(expanded ? '退出全屏' : '全屏')}
          aria-label={text(expanded ? '退出全屏' : '全屏')}
          onClick={onExpand}
        >
          {expanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
        </button>
      </div>
    </div>
  );
}
