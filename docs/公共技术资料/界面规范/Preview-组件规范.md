# Preview 组件规范

平台使用React，前台、管理后台、主题和加载入口分别由公共UI提供。

- 后台控件从`@preview/ui/admin`引入，保留表单校验、键盘、焦点、弹层、nullable值和失败反馈。
- 页面及区块加载从`@preview/ui/loading`引入，整页异常使用`@preview/ui/result`。
- 外壳、主题和通用展示从`@preview/ui`引入，页面通过属性和回调接入真实身份、语言与权限。
- 业务页面直接使用独立React入口，字段、模拟数据与需求归所属项目。页面、组件与区块的登记见[接入模板](../../../templates/project/README.md)。

样式限定在CSS Module或所属根类名，颜色、字体、圆角、间距及交互状态使用现有主题token。主题或动效切换保留表单草稿，异步操作保留实际加载、失败与权限拒绝。响应式布局、键盘和减少动态效果沿用公共实现。

第三方实现保留来源、固定版本与许可，详见[Preview UI](../../../packages/preview-ui/README.md)及[来源说明](../../../packages/preview-ui/NOTICE.md)。

按[测试指南](../工程规范/Preview-测试指南.md)选择定向验证，分别记录静态检查、测试、构建、浏览器交互和用户视觉确认。
