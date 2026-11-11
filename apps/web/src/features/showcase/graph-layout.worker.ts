import { fixedGraphLayout, type GraphLayoutInput } from './graph-layout';

self.onmessage = async (event: MessageEvent<GraphLayoutInput>) => {
  try {
    self.postMessage({ positions: await fixedGraphLayout(event.data) });
  } catch (reason) {
    self.postMessage({ error: reason instanceof Error ? reason.message : '图谱布局失败' });
  }
};
