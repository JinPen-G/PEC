import { useEffect, useRef, useState } from 'react';
import { Graph, type ElementDatum, type Tooltip } from '@antv/g6';
import { Minus, Plus, Scan, Maximize2, Minimize2, LocateFixed } from 'lucide-react';
import { LoadingStage } from '@preview/ui/loading';
import { useShowcaseText } from './showcase-locale';
import { graphNodeId, graphRenderData } from './graph-rendering';
import type { GraphLayoutPositions } from './graph-layout';
import { graphEmphasis, graphRelationColor, graphVisibility } from './graph-presentation';
import { graphTopology, type GraphViewProps } from './graph-view';

function canvasColor(value: string, fallback: string) {
  const context = document.createElement('canvas').getContext('2d', { willReadFrequently: true });
  if (!context) return fallback;
  context.fillStyle = fallback;
  context.fillStyle = value;
  context.fillRect(0, 0, 1, 1);
  const [red, green, blue] = context.getImageData(0, 0, 1, 1).data;
  return `rgb(${red},${green},${blue})`;
}

export default function RequirementGraphCanvas(props: GraphViewProps) {
  const text = useShowcaseText();
  const host = useRef<HTMLDivElement>(null);
  const current = useRef({ ...props, text });
  const update = useRef<() => void>(() => {});
  const action = useRef<(kind: string) => void>(() => {});
  const [ready, setReady] = useState(false);
  const [error, setError] = useState('');
  const [zoom, setZoom] = useState(100);

  useEffect(() => {
    current.current = { ...props, text };
    update.current();
  }, [props, text]);

  useEffect(() => {
    const element = host.current;
    if (!element) return;
    const memory = current.current.memory.current;
    const graph = new Graph({
      container: element,
      autoResize: false,
      background: 'transparent',
      animation: false,
      padding: 48,
      zoomRange: [0.08, 2.5],
      behaviors: ['drag-canvas', { type: 'zoom-canvas', animation: false }],
      node: {
        type: 'circle',
        style: {
          size: 14,
          lineWidth: 2,
          halo: true,
          haloLineWidth: 20,
          haloStrokeOpacity: 0,
          haloPointerEvents: 'all',
          labelPlacement: 'bottom',
          labelOffsetY: 8,
          labelFontSize: 14,
          labelMaxWidth: 152,
          labelWordWrap: true,
          labelMaxLines: 2,
          labelTextAlign: 'center',
          labelPointerEvents: 'none',
        },
      },
      edge: {
        type: 'quadratic',
        style: {
          curveOffset: 14,
          lineWidth: 1,
          endArrow: true,
          endArrowSize: 5,
          labelFontSize: 12,
          labelAutoRotate: false,
          labelWordWrap: true,
          labelMaxWidth: 140,
          labelMaxLines: 2,
          labelBackground: true,
          labelPadding: [3, 4],
          labelBackgroundRadius: 3,
          increasedLineWidthForHitTesting: 8,
        },
      },
      plugins: [
        {
          type: 'tooltip',
          key: 'details',
          getContent: async (_event: unknown, items: ElementDatum[]) => {
            const content = document.createElement('div');
            content.className = 'requirement-graph-tooltip';
            const title = document.createElement('strong');
            title.textContent = String(items[0]?.data?.title ?? '');
            const description = document.createElement('p');
            description.textContent = String(items[0]?.data?.description ?? '');
            content.append(title, description);
            return content;
          },
        },
      ],
    });
    let disposed = false;
    let frame = 0;
    let topology = '';
    let lastSelected: string | null = current.current.selected;
    let lastStyle = '';
    let lastDetail = Boolean(current.current.selected);
    let chain = Promise.resolve();
    let initialized = false;
    let worker: Worker | undefined;
    let cancelLayout: (() => void) | undefined;
    const fail = (reason: unknown) => {
      if (!disposed)
        setError(reason instanceof Error ? reason.message : current.current.text('图谱绘制失败'));
    };
    const enqueue = (operation: () => Promise<void>) => {
      chain = chain
        .catch(() => {})
        .then(async () => {
          if (!disposed) await operation();
        })
        .catch(fail);
    };
    const focusSelected = async () => {
      const selected = current.current.selected;
      if (!graph.rendered || !selected) return;
      if (graph.getZoom() < 0.65) await graph.zoomTo(0.85, false);
      await graph.focusElement(graphNodeId(selected), false);
    };
    const paint = async () => {
      const data = current.current;
      const nextTopology = graphTopology(data.nodes, data.edges);
      const changed = topology !== nextTopology;
      const styles = getComputedStyle(element);
      const colors = ['--foreground', '--surface', '--text-secondary'].map((name) =>
        styles.getPropertyValue(name).trim(),
      );
      const scale = graph.rendered ? graph.getZoom() : 1;
      const signature = JSON.stringify([
        nextTopology,
        colors,
        data.text('需求关系图谱'),
        data.nodes.map((node) => [node.label, node.type]),
        data.edges.map((edge) => edge.label),
        data.selected,
        data.focus,
        data.hiddenTypes,
        data.hiddenRelations,
        Math.round(scale * 100),
      ]);
      if (!changed && signature === lastStyle) return;
      const [foreground, surface, secondary] = colors.map((value, index) =>
        canvasColor(value, ['#202124', '#ffffff', '#64748b'][index]),
      );
      const drawing = graphRenderData(data.nodes, data.edges, data.text);
      const visible = graphVisibility(data.nodes, data.edges, data.hiddenTypes, data.hiddenRelations);
      const emphasis = graphEmphasis(data.nodes, data.edges, data.selected, data.focus, visible);
      const labels = data.nodes.length <= 40 || (graph.rendered && graph.getZoom() >= 0.6);
      for (const node of drawing.nodes ?? []) {
        const identifier = node.id.slice(5);
        const important = emphasis.nodeIds.has(identifier);
        Object.assign(node.style!, {
          stroke: surface,
          lineWidth: Math.min(2, 0.75 / scale),
          labelFill: foreground,
          labelFontFamily: styles.fontFamily,
          size: identifier === data.selected ? Math.max(21, 7 / scale) : Math.max(14, 4.5 / scale),
          labelFontWeight: identifier === data.selected ? 600 : 400,
          opacity: emphasis.active && !important ? 0.16 : 1,
          labelOpacity: (labels && !emphasis.active) || (emphasis.active && important) ? 1 : 0,
          visibility: visible.nodeIds.has(identifier) ? 'visible' : 'hidden',
        });
        if (changed && memory.topology === nextTopology)
          Object.assign(node.style!, memory.positions?.get(node.id));
      }
      for (const edge of drawing.edges ?? []) {
        const identifier = String(edge.id).slice(5);
        const original = data.edges.find((item) => item.id === identifier)!;
        const important = emphasis.edgeIds.has(identifier);
        Object.assign(edge.style!, {
          stroke: graphRelationColor(original.relation),
          labelFill: secondary,
          labelBackgroundFill: surface,
          labelFontFamily: styles.fontFamily,
          lineWidth: (emphasis.active && important ? 1.4 : 0.65) / scale,
          opacity: emphasis.active ? (important ? 0.9 : 0.07) : 0.36,
          labelOpacity: 0,
          visibility: visible.edgeIds.has(identifier) ? 'visible' : 'hidden',
        });
      }
      if (changed) {
        const cached = memory.topology === nextTopology && memory.positions?.size === data.nodes.length;
        const savedView = { zoom: memory.zoom, center: memory.center };
        setReady(false);
        if (!cached) {
          const input = {
            nodes: data.nodes.map((node) => ({ id: graphNodeId(node.id) })),
            edges: data.edges.map((edge) => ({
              id: edge.id,
              source: graphNodeId(edge.source),
              target: graphNodeId(edge.target),
            })),
          };
          const positions =
            typeof Worker === 'undefined'
              ? await import('./graph-layout').then((module) => module.fixedGraphLayout(input))
              : await new Promise<GraphLayoutPositions>((resolve, reject) => {
                  worker = new Worker(new URL('./graph-layout.worker.ts', import.meta.url), {
                    type: 'module',
                  });
                  cancelLayout = () => reject(new Error('图谱布局已取消'));
                  worker.onmessage = (
                    event: MessageEvent<{ positions?: GraphLayoutPositions; error?: string }>,
                  ) => {
                    worker?.terminate();
                    worker = undefined;
                    cancelLayout = undefined;
                    if (event.data.error || !event.data.positions)
                      reject(new Error(event.data.error ?? '图谱布局失败'));
                    else resolve(event.data.positions);
                  };
                  worker.onerror = () => {
                    worker?.terminate();
                    worker = undefined;
                    cancelLayout = undefined;
                    reject(new Error('图谱布局失败'));
                  };
                  worker.postMessage(input);
                });
          if (disposed) return;
          const indexed = new Map(positions.map((position) => [position.id, position]));
          for (const item of drawing.nodes ?? []) Object.assign(item.style!, indexed.get(item.id));
        }
        graph.setData(drawing);
        graph.setOptions({ layout: undefined });
        await graph.render();
        if (disposed) return;
        topology = nextTopology;
        memory.topology = topology;
        memory.positions = new Map(
          graph
            .getNodeData()
            .map((node) => [node.id, { x: Number(node.style?.x ?? 0), y: Number(node.style?.y ?? 0) }]),
        );
        graph.setOptions({ layout: undefined });
        if (cached && savedView.zoom && savedView.center) {
          await graph.zoomTo(savedView.zoom, false);
          const point = graph.getViewportByCanvas(savedView.center);
          const size = graph.getSize();
          await graph.translateBy([size[0] / 2 - point[0], size[1] / 2 - point[1]], false);
        } else {
          await graph.fitView({}, false);
          if (graph.getZoom() > 1) await graph.zoomTo(1, false);
        }
        initialized = true;
      } else {
        graph.getPluginInstance<Tooltip>('details')?.hide();
        graph.updateNodeData(drawing.nodes!);
        graph.updateEdgeData(drawing.edges!);
        await graph.draw();
      }
      if (disposed) return;
      if (data.selected !== lastSelected) await focusSelected();
      lastSelected = data.selected;
      lastStyle = signature;
      setZoom(Math.round(graph.getZoom() * 100));
      setReady(true);
      setError('');
    };
    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => enqueue(paint));
    };
    update.current = schedule;
    action.current = (kind) =>
      enqueue(async () => {
        if (!graph.rendered) return;
        if (kind === 'fit') await graph.fitView({}, false);
        else if (kind === 'locate') await focusSelected();
        else if (kind === 'reset') {
          await graph.zoomTo(1, false);
          if (current.current.selected) await focusSelected();
          else await graph.fitCenter(false);
        } else if (kind === '+' || kind === '-') await graph.zoomBy(kind === '+' ? 1.25 : 0.8, false);
        else
          await graph.translateBy(
            [
              kind === 'ArrowLeft' ? 60 : kind === 'ArrowRight' ? -60 : 0,
              kind === 'ArrowUp' ? 60 : kind === 'ArrowDown' ? -60 : 0,
            ],
            false,
          );
        schedule();
      });
    graph.on('node:click', (event) => {
      const target = 'target' in event ? event.target : null;
      if (target && 'id' in target) current.current.onSelect(String(target.id).slice(5));
    });
    graph.on('canvas:click', () => current.current.onSelect(null));
    graph.on('aftertransform', () => {
      if (!graph.rendered || disposed) return;
      setZoom(Math.round(graph.getZoom() * 100));
      const [width, height] = graph.getSize();
      memory.zoom = graph.getZoom();
      memory.center = graph.getCanvasByViewport([width / 2, height / 2]).slice(0, 2) as [number, number];
      schedule();
    });
    const resize = new ResizeObserver(() =>
      enqueue(async () => {
        const bounds = element.parentElement;
        if (!bounds || bounds.clientWidth < 1 || bounds.clientHeight < 1) return;
        graph.resize(bounds.clientWidth, bounds.clientHeight);
        if (initialized && lastDetail !== Boolean(current.current.selected)) await focusSelected();
        lastDetail = Boolean(current.current.selected);
      }),
    );
    resize.observe(element.parentElement ?? element);
    const theme = new MutationObserver(schedule);
    theme.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class', 'data-theme', 'style'],
    });
    const site = element.closest('.preview-showcase');
    if (site) theme.observe(site, { attributes: true, attributeFilter: ['data-theme', 'style'] });
    if (element.parentElement)
      graph.resize(element.parentElement.clientWidth, element.parentElement.clientHeight);
    schedule();
    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      resize.disconnect();
      theme.disconnect();
      cancelLayout?.();
      worker?.terminate();
      update.current = () => {};
      action.current = () => {};
      graph.destroy();
    };
  }, []);

  return (
    <div className="requirement-graph-stage">
      <div className="requirement-graph-viewport">
        <div
          ref={host}
          className="requirement-graph-canvas"
          data-view="2d"
          role="img"
          tabIndex={0}
          aria-busy={!ready && !error}
          aria-label={text('需求关系图谱，可通过查找节点选择功能')}
          onKeyDown={(event) => {
            if (!['+', '=', '-', '0', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key))
              return;
            event.preventDefault();
            action.current(event.key === '=' ? '+' : event.key === '0' ? 'fit' : event.key);
          }}
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
          title={text('缩小')}
          aria-label={text('缩小')}
          disabled={!ready}
          onClick={() => action.current('-')}
        >
          <Minus size={16} />
        </button>
        <button
          type="button"
          className="requirement-graph-zoom"
          title={text('原始比例')}
          aria-label={text('原始比例')}
          disabled={!ready}
          onClick={() => action.current('reset')}
        >
          {zoom}%
        </button>
        <button
          type="button"
          title={text('放大')}
          aria-label={text('放大')}
          disabled={!ready}
          onClick={() => action.current('+')}
        >
          <Plus size={16} />
        </button>
        <button
          type="button"
          title={text('适应画布')}
          aria-label={text('适应画布')}
          disabled={!ready}
          onClick={() => action.current('fit')}
        >
          <Scan size={16} />
        </button>
        {props.selected && (
          <button
            type="button"
            title={text('定位当前节点')}
            aria-label={text('定位当前节点')}
            disabled={!ready}
            onClick={() => action.current('locate')}
          >
            <LocateFixed size={16} />
          </button>
        )}
        {props.onExpand && (
          <button
            type="button"
            title={text(props.expanded ? '退出全屏' : '全屏')}
            aria-label={text(props.expanded ? '退出全屏' : '全屏')}
            onClick={props.onExpand}
          >
            {props.expanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>
        )}
      </div>
    </div>
  );
}
