/** Full platform deployments can start with no business page implementations. */
export function registeredPage(moduleKey: string, pageKey: string) {
  if (moduleKey === 'empty' && pageKey === 'canvas')
    return <div data-prototype-canvas style={{ height: '100%', minHeight: 320 }} />;
  throw new Error('该页面没有已注册的模块');
}
