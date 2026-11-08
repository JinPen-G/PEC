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
async function adjustView(
  graph: Graph,
  width: number,
  selected: string | null,
  reduced: boolean,
  activeTopic = '',
) {
  const timing = { duration: reduced ? 0 : 220 };
  if (selected && graph.getNodeData().some((node) => node.id === renderNodeId(selected))) {
    if (graph.getZoom() < 0.8 || graph.getZoom() > 1.1) await graph.zoomTo(1, timing);
    await graph.focusElement(renderNodeId(selected), timing);
  } else {
    await graph.fitView({ when: 'always' });
    if (graph.getZoom() > 1) {
      await graph.zoomTo(1, timing);
      await graph.focusElement(
        graph.getNodeData().map((node) => node.id),
        timing,
      );
    }
    if (width >= 560 && graph.getZoom() < 0.65) {
      await graph.zoomTo(0.65, timing);
      await graph.focusElement(
        graph.getNodeData().map((node) => node.id),
        timing,
      );
    }
    if (width < 560 && graph.getNodeData().length) {
      await graph.zoomTo(0.85, timing);
      const first = graph.getNodeData()[0];
      const topicNodes = graph.getNodeData().filter((node) => node.data?.primaryTopic === activeTopic);
      await graph.focusElement(
        activeTopic && topicNodes.length ? topicNodes.map((node) => node.id) : (first.combo ?? first.id),
        timing,
      );
    }
  }
}
export default function RequirementGraphCanvas({
  nodes,
  edges,
  topics,
  selected,
  onSelect,
  expanded,
  onExpand,
  activeTopic,
}: {
  nodes: GraphNode[];
  edges: GraphEdge[];
  topics: GraphTopic[];
  selected: string | null;
  onSelect: (id: string | null) => void;
  expanded: boolean;
  onExpand: () => void;
  activeTopic: string;
}) {
  const text = useShowcaseText(),
    { locale } = usePlatformLocale(),
    reduced = useReducedMotion();
  const host = useRef<HTMLDivElement>(null),
    instance = useRef<Graph | null>(null);
  const callback = useRef(onSelect),
    dataRef = useRef({ nodes, edges, topics, locale });
  const queue = useRef<Promise<void>>(Promise.resolve());
  const layoutIdentity = useRef('');
  const positions = useRef(new Map<string, { x: number; y: number }>());
  const defaultLayout = useRef<LayoutOptions | undefined>(undefined);
  const selection = useRef(selected);
  const topicSelection = useRef(activeTopic);
  const previousSelection = useRef<string | null>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => {
    callback.current = onSelect;
  }, [onSelect]);
  useEffect(() => {
    dataRef.current = { nodes, edges, topics, locale };
  }, [nodes, edges, topics, locale]);
  useEffect(() => {
    selection.current = selected;
  }, [selected]);
  useEffect(() => {
    topicSelection.current = activeTopic;
  }, [activeTopic]);
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
                rows: 1,
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
          labelFontSize: 13,
          labelFontWeight: 400,
          labelMaxWidth: 120,
          labelWordWrap: true,
          labelMaxLines: 2,
          labelTextAlign: 'center',
        },
        state: {
          selected: { opacity: 1, lineWidth: 3, size: 20 },
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
          selected: { opacity: 1, lineWidth: 1.8, labelOpacity: 1 },
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
        graph.resize();
        queue.current = queue.current
          .catch(() => {})
          .then(async () => {
            if (!graph.destroyed && graph.getNodeData().length)
              await adjustView(
                graph,
                host.current?.clientWidth ?? 1000,
                selection.current,
                !!reduced,
                topicSelection.current,
              );
          });
      });
    });
    resize.observe(host.current);
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
          const ink = drawingColor(style.getPropertyValue('--foreground').trim(), '#202124');
          const surface = drawingColor(style.getPropertyValue('--surface').trim(), '#ffffff');
          const line = drawingColor(style.getPropertyValue('--text-muted').trim(), '#94a3b8');
          const family = getComputedStyle(document.body).fontFamily;
          const displayTopic = (node: GraphNode) => topicSelection.current || node.primaryTopic;
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
              data: { primaryTopic: displayTopic(node) },
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
                labelFill: line,
                labelText: text(edge.label),
                labelOpacity: 1,
                labelBackgroundFill: drawingColor(
                  style.getPropertyValue('--surface-muted').trim(),
                  '#f8f8f8',
                ),
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
            nodes: current.nodes.map((node) => [node.id, displayTopic(node)]),
            edges: current.edges.map((edge) => [edge.id, edge.source, edge.target]),
          });
          const styleOnly = layoutIdentity.current === identity && graph.getNodeData().length > 0;
          const restorePositions = data.nodes!.every((node) => positions.current.has(node.id));
          // BubbleSets caches member bounds. Dispose them before removed nodes
          // leave the graph; otherwise upstream callbacks can read deleted IDs.
          if (!styleOnly) graph.setPlugins([]);
          if (styleOnly) {
            graph.updateNodeData(data.nodes!);
            graph.updateEdgeData(data.edges!);
            graph.updateComboData(data.combos!);
          } else {
            graph.setData(data);
          }
          graph.setPlugins(contours);
          graph.setOptions({
            layout: styleOnly || restorePositions ? undefined : defaultLayout.current,
            animation: !reduced && !styleOnly && !restorePositions,
          });
          await graph.render();
          if (!graph.destroyed) {
            if (!styleOnly)
              await adjustView(
                graph,
                host.current?.clientWidth ?? 1000,
                selection.current,
                !!reduced,
                topicSelection.current,
              );
            layoutIdentity.current = identity;
            setReady(true);
            setError('');
          }
        })
        .catch((reason: unknown) => {
          if (!graph.destroyed) setError(reason instanceof Error ? reason.message : text('图谱绘制失败'));
        });
    };
    render();
    const observer = new MutationObserver(render);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class', 'data-theme', 'style'],
    });
    return () => observer.disconnect();
  }, [nodes, edges, topics, locale, reduced, text, activeTopic]);
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
        const states: Record<string, string[]> = {};
        nodes.forEach(
          (node) =>
            (states[renderNodeId(node.id)] = !selected
              ? []
              : node.id === selected
                ? ['selected']
                : connected.has(node.id)
                  ? []
                  : ['dimmed']),
        );
        edges.forEach(
          (edge) =>
            (states[renderEdgeId(edge.id)] = !selected
              ? []
              : edge.source === selected || edge.target === selected
                ? ['selected']
                : ['dimmed']),
        );
        await graph.setElementState(states, !reduced);
        if (previousSelection.current !== selected) {
          await adjustView(
            graph,
            host.current?.clientWidth ?? 1000,
            selected,
            !!reduced,
            topicSelection.current,
          );
          previousSelection.current = selected;
        }
      })
      .catch((reason: unknown) => {
        if (!graph.destroyed) setError(reason instanceof Error ? reason.message : text('图谱绘制失败'));
      });
  }, [selected, nodes, edges, reduced, text]);
  const action = (operation: () => Promise<void> | undefined) => {
    void operation()?.catch((reason: unknown) => {
      setError(reason instanceof Error ? reason.message : text('图谱绘制失败'));
    });
  };
  return (
    <div className="requirement-graph-stage">
      <div
        ref={host}
        className="requirement-graph-canvas"
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
