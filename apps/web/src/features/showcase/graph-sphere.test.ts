import { describe, expect, it, vi } from 'vitest';
import { graphDemandRendering, sphereGraphData } from './graph-sphere';
import { graphEmphasis, graphVisibility } from './graph-presentation';
import { fixedGraphLayout } from './graph-layout';
import type { GraphNode, GraphEdge } from '../../../../../packages/platform-contracts/src/requirement-graph';

const nodes = [
  { id: 'booking', type: 'feature' },
  { id: 'validation', type: 'rule' },
  { id: 'device', type: 'interface' },
] as GraphNode[];
const edges = [
  { id: 'rule', source: 'validation', target: 'booking', relation: 'constrains', status: 'active' },
  { id: 'api', source: 'booking', target: 'device', relation: 'integrates_with', status: 'active' },
] as GraphEdge[];

describe('fixed graph views', () => {
  it('places all authorized nodes on a sphere deterministically without mutating business data', () => {
    const before = JSON.stringify({ nodes, edges });
    const first = sphereGraphData(nodes, edges);
    expect(sphereGraphData([...nodes].reverse(), edges).nodes).toEqual(first.nodes);
    for (const point of first.nodes) {
      expect(Math.hypot(point.x, point.y, point.z)).toBeCloseTo(220, 8);
      expect([point.fx, point.fy, point.fz]).toEqual([point.x, point.y, point.z]);
    }
    expect(first.links).toHaveLength(2);
    expect(JSON.stringify({ nodes, edges })).toBe(before);
    expect(sphereGraphData(nodes.slice(0, 1), edges).links).toEqual([]);
    expect(sphereGraphData([], edges).nodes).toEqual([]);
  });
  it('hides legend members and affected edges without moving surviving nodes', () => {
    const before = sphereGraphData(nodes, edges);
    const visibility = graphVisibility(nodes, edges, ['interface'], []);
    expect([...visibility.nodeIds]).toEqual(['booking', 'validation']);
    expect([...visibility.edgeIds]).toEqual(['rule']);
    expect(graphVisibility(nodes, edges, [], ['constrains']).edgeIds.has('rule')).toBe(false);
    expect(sphereGraphData(nodes, edges)).toEqual(before);
    const focused = graphEmphasis(nodes, edges, 'booking', null, visibility);
    expect([...focused.nodeIds].sort()).toEqual(['booking', 'validation']);
    expect(graphEmphasis(nodes, edges, null, [], visibility).nodeIds.size).toBe(0);
  });
  it('uses the open-source layout once and returns finite, repeatable planar positions', async () => {
    const input = {
      nodes: nodes.map((node) => ({ id: node.id })),
      edges: edges.map((edge) => ({ id: edge.id, source: edge.source, target: edge.target })),
    };
    const first = await fixedGraphLayout(input);
    const second = await fixedGraphLayout({
      nodes: [...input.nodes].reverse(),
      edges: [...input.edges].reverse(),
    });
    expect(first).toEqual(second);
    expect(new Set(first.map((point) => `${point.x}/${point.y}`)).size).toBe(3);
    expect(input.nodes[0]).toEqual({ id: 'booking' });
  });
  it('renders on demand and stops after interaction instead of running an idle loop', () => {
    let sequence = 0;
    const frames = new Map<number, (time: number) => void>();
    const resume = vi.fn();
    const pause = vi.fn();
    const render = vi.fn();
    const scheduling = graphDemandRendering(
      resume,
      pause,
      (callback) => {
        frames.set(++sequence, callback);
        return sequence;
      },
      (id) => {
        frames.delete(id);
      },
    );
    const tick = () => {
      const callbacks = [...frames.values()];
      frames.clear();
      callbacks.forEach((callback) => callback(0));
    };
    scheduling.wake(render);
    scheduling.wake(render);
    expect(resume).toHaveBeenCalledTimes(1);
    tick();
    tick();
    tick();
    expect(pause).toHaveBeenCalledTimes(1);
    expect(frames.size).toBe(0);
    scheduling.wake();
    expect(resume).toHaveBeenCalledTimes(2);
    scheduling.dispose();
    expect(frames.size).toBe(0);
    scheduling.wake();
    expect(resume).toHaveBeenCalledTimes(2);
  });
});
