import { D3ForceLayout } from '@antv/layout';

export interface GraphLayoutInput {
  nodes: { id: string }[];
  edges: { id: string; source: string; target: string }[];
}
export type GraphLayoutPositions = { id: string; x: number; y: number }[];

export async function fixedGraphLayout(input: GraphLayoutInput): Promise<GraphLayoutPositions> {
  const nodes = [...input.nodes].sort((first, second) => first.id.localeCompare(second.id));
  const edges = [...input.edges].sort((first, second) => first.id.localeCompare(second.id));
  const layout = new D3ForceLayout({
    width: 1200,
    height: 1000,
    centerX: 0,
    centerY: 0,
    nodeSize: 34,
    nodeSpacing: 14,
    preventOverlap: true,
    nodeStrength: -160,
    linkDistance: 106,
    x: { strength: 0.035, x: 0 },
    y: { strength: 0.035, y: 0 },
  });
  try {
    const completed = layout.execute({ nodes, edges });
    layout.stop();
    for (let batch = 0; batch < 10; batch++) {
      layout.tick(18);
      await new Promise<void>((resolve) => setTimeout(resolve, 0));
    }
    layout.simulation.on('end')?.call(layout.simulation);
    await completed;
    const positions: GraphLayoutPositions = [];
    layout.forEachNode((node) => {
      if (!Number.isFinite(node.x) || !Number.isFinite(node.y)) throw new Error('图谱布局未生成有效点位');
      positions.push({ id: String(node.id), x: node.x!, y: node.y! });
    });
    return positions;
  } finally {
    layout.stop();
    layout.destroy();
  }
}
