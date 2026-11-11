import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import type { GraphNode, GraphEdge } from '../../../../../packages/platform-contracts/src/requirement-graph';

const { instances } = vi.hoisted(() => ({ instances: [] as MockGraph[] }));
vi.mock('./graph-layout', () => ({ fixedGraphLayout: async (input: { nodes: { id: string }[] }) => input.nodes.map((node, index) => ({ id: node.id, x: index * 120, y: 80 })) }));
type MockGraph = {
  options: Record<string, unknown>;
  data: { nodes: { id: string }[]; edges: { id: string }[] };
  callbacks: Map<string, (event?: unknown) => void>;
  rendered: boolean;
  destroyed: boolean;
  render: ReturnType<typeof vi.fn>;
  draw: ReturnType<typeof vi.fn>;
  getZoom: ReturnType<typeof vi.fn>;
  hideTooltip: ReturnType<typeof vi.fn>;
  zoomBy: ReturnType<typeof vi.fn>;
  zoomTo: ReturnType<typeof vi.fn>;
  translateBy: ReturnType<typeof vi.fn>;
  focusElement: ReturnType<typeof vi.fn>;
  setElementState: ReturnType<typeof vi.fn>;
};

vi.mock('@antv/g6', () => ({
  Graph: class {
    options;
    rendered = false;
    destroyed = false;
    data = { nodes: [] as { id: string }[], edges: [] as { id: string }[] };
    callbacks = new Map<string, (event?: unknown) => void>();
    hideTooltip = vi.fn();
    render = vi.fn(async () => {
      this.callbacks.get('aftertransform')?.();
      this.rendered = true;
    });
    draw = vi.fn(async () => {});
    getZoom = vi.fn(() => {
      if (!this.rendered) throw new Error('Viewport is not initialized');
      return 1;
    });
    zoomBy = vi.fn(async () => {});
    zoomTo = vi.fn(async () => {});
    translateBy = vi.fn(async () => {});
    focusElement = vi.fn(async () => {});
    setElementState = vi.fn(async () => {});
    constructor(options: Record<string, unknown>) {
      this.options = options;
      instances.push(this);
    }
    on(name: string, callback: (event?: unknown) => void) {
      this.callbacks.set(name, callback);
    }
    setOptions(options: Record<string, unknown>) {
      Object.assign(this.options, options);
    }
    setData(data: typeof this.data) {
      this.data = data;
    }
    updateNodeData(nodes: typeof this.data.nodes) {
      this.data.nodes = nodes;
    }
    updateEdgeData(edges: typeof this.data.edges) {
      this.data.edges = edges;
    }
    getNodeData() {
      return this.data.nodes;
    }
    getPluginInstance() {
      return { hide: this.hideTooltip };
    }
    async fitView() {}
    async fitCenter() {}
    getSize() { return [800, 600]; }
    getCanvasByViewport(point: number[]) { return point; }
    getViewportByCanvas(point: number[]) { return point; }
    resize() {}
    destroy() {
      this.destroyed = true;
    }
  },
}));
vi.mock('./showcase-locale', () => ({ useShowcaseText: () => translate }));
vi.mock('@preview/ui/loading', () => ({
  LoadingStage: ({ label }: { label: string }) => <span>{label}</span>,
}));
const translate = (value: string) => value;
import Canvas from './RequirementGraphCanvas';

const nodes = [
  { id: 'first', label: 'First', summary: 'Source' },
  { id: 'second', label: 'Second', summary: 'Target' },
] as GraphNode[];
const edges = [
  {
    id: 'edge',
    source: 'first',
    target: 'second',
    relation: 'triggers',
    label: 'Starts',
    reason: 'Explicit',
  },
] as GraphEdge[];

beforeEach(() => {
  instances.length = 0;
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe() {}
      disconnect() {}
    },
  );
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({
    fillStyle: '',
    fillRect() {},
    getImageData: () => ({ data: [255, 255, 255, 255] }),
  } as unknown as CanvasRenderingContext2D);
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  delete document.documentElement.dataset.theme;
});

it('uses built-in shapes and survives transform events before viewport initialization', async () => {
  const onSelect = vi.fn();
  const view = render(
    <Canvas
      nodes={nodes}
      edges={edges}
      selected="first"
      onSelect={onSelect}
      expanded={false}
      onExpand={vi.fn()}
      focus={null}
      hiddenTypes={[]}
      hiddenRelations={[]}
      memory={{ current: {} }}
    />,
  );
  await waitFor(() => expect(screen.getByRole('img')).toHaveAttribute('aria-busy', 'false'));
  const graph = instances[0];
  expect(graph.options).toMatchObject({
    background: 'transparent',
    node: { type: 'circle' },
    edge: { type: 'quadratic' },
  });
  expect(graph.render).toHaveBeenCalledTimes(1);
  expect(screen.queryByRole('alert')).toBeNull();
  act(() => graph.callbacks.get('node:click')?.({ target: { id: 'node:second' } }));
  expect(onSelect).toHaveBeenCalledWith('second');
  view.unmount();
  expect(graph.destroyed).toBe(true);
});

it('updates themes without resetting layout and dismisses stale tooltip content', async () => {
  render(
    <Canvas
      nodes={nodes}
      edges={edges}
      selected="first"
      onSelect={vi.fn()}
      expanded={false}
      onExpand={vi.fn()}
      focus={null}
      hiddenTypes={[]}
      hiddenRelations={[]}
      memory={{ current: {} }}
    />,
  );
  await waitFor(() => expect(screen.getByRole('img')).toHaveAttribute('aria-busy', 'false'));
  const graph = instances[0];
  act(() => {
    document.documentElement.style.setProperty('--foreground', '#eeeeee');
  });
  await waitFor(() => expect(graph.draw).toHaveBeenCalled());
  expect(graph.render).toHaveBeenCalledTimes(1);
  expect(graph.draw).toHaveBeenCalled();
  expect(graph.hideTooltip).toHaveBeenCalled();
  expect(graph.options.background).toBe('transparent');
});

it('provides keyboard pan/zoom and restores the selected node at actual size', async () => {
  render(
    <Canvas
      nodes={nodes}
      edges={edges}
      selected="first"
      onSelect={vi.fn()}
      expanded={false}
      onExpand={vi.fn()}
      focus={null}
      hiddenTypes={[]}
      hiddenRelations={[]}
      memory={{ current: {} }}
    />,
  );
  await waitFor(() => expect(screen.getByRole('button', { name: '定位当前节点' })).toBeEnabled());
  fireEvent.keyDown(screen.getByRole('img'), { key: '+' });
  fireEvent.keyDown(screen.getByRole('img'), { key: 'ArrowRight' });
  fireEvent.click(screen.getByRole('button', { name: '定位当前节点' }));
  await waitFor(() => expect(instances[0].focusElement).toHaveBeenCalledWith('node:first', false));
  expect(instances[0].zoomBy).toHaveBeenCalledWith(1.25, false);
  expect(instances[0].translateBy).toHaveBeenCalledWith([-60, 0], false);
});
