# Platform Client

[createNativeClient](src/client.js) 提供带 Cookie、CSRF、取消信号及真实错误的请求。会话变化由应用清除缓存；失败不回退到静态资料，也不模拟成功。

类型在 [client.d.ts](src/client.d.ts)。旧 HTML 管理、挂载和静态快照客户端已移除。错误合同由 platform-contracts 维护，反例见[错误测试](../../tests/unit/api-errors.spec.js)。
