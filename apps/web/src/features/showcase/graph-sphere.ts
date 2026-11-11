import { Vector3 } from 'three';
import type { GraphNode, GraphEdge } from '../../../../../packages/platform-contracts/src/requirement-graph';

export interface SphereNode {
  id: string;
  x: number;
  y: number;
  z: number;
  fx: number;
  fy: number;
  fz: number;
}
export interface SphereLink {
  id: string;
  source: string | SphereNode;
  target: string | SphereNode;
}

export function sphereGraphData(nodes: GraphNode[], edges: GraphEdge[], radius = 220) {
  const sorted = [...nodes].sort((first, second) => first.id.localeCompare(second.id));
  const point = new Vector3();
  const positions = sorted.map((node, index): SphereNode => {
    const phi = Math.acos(1 - (2 * (index + 0.5)) / sorted.length);
    const theta = Math.PI * (3 - Math.sqrt(5)) * index;
    point.setFromSphericalCoords(sorted.length === 1 ? 0 : radius, phi, theta);
    return { id: node.id, x: point.x, y: point.y, z: point.z, fx: point.x, fy: point.y, fz: point.z };
  });
  const ids = new Set(positions.map((node) => node.id));
  return {
    nodes: positions,
    links: edges
      .filter((edge) => ids.has(edge.source) && ids.has(edge.target))
      .map((edge): SphereLink => ({ id: edge.id, source: edge.source, target: edge.target })),
  };
}

export function graphDemandRendering(
  resume: () => void,
  pause: () => void,
  frame: (callback: (time: number) => void) => number = requestAnimationFrame,
  cancel: (id: number) => void = cancelAnimationFrame,
) {
  let pending = 0;
  let disposed = false;
  let remaining = 0;
  let afterFrame = () => {};
  const settle = () => {
    if (disposed) return;
    afterFrame();
    if (--remaining > 0) pending = frame(settle);
    else {
      pending = 0;
      pause();
    }
  };
  return {
    wake(callback?: () => void) {
      if (disposed) return;
      if (callback) afterFrame = callback;
      remaining = 3;
      if (!pending) {
        pending = frame(settle);
        resume();
      }
    },
    stop() {
      if (pending) cancel(pending);
      pending = 0;
      pause();
    },
    dispose() {
      disposed = true;
      if (pending) cancel(pending);
      pending = 0;
      pause();
    },
  };
}
