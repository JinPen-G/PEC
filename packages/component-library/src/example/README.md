# 示例区块

车组管理区块展示查询列表、品牌管理和编辑表单。状态与上传图片只保存在当前演示实例中，页面重新载入后恢复模拟数据。

本目录从 Preview 已有车组原型中选取实际使用的区块和辅助文件。原辅助模块名称保持，原路径、固定提交与文件散列见 [来源清单](source-manifest.json)。记录保留来源归属，整体发行许可沿根项目及对应依赖声明处理。

网站通过独立的 React 页面注入公共控件、语言、提示与确认弹层。Registry 安装文件使用 Ant Design 的便携默认实现，目标工程可通过 `RimoEnvironmentProvider` 注入自己的宿主适配。

登记入口位于 `packages/platform-contracts/src/registered-projects.json`。安装项 `example-vehicle-groups` 只分发当前区块及其导入的源码和样式。
