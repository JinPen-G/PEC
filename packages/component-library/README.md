# 可复用组件与区块源码

这里维护可安装源码，不承担网站路由、平台登录、菜单或 PRD 阅读。网站展示入口在 `apps/web/src/project-modules`，通过 `@preview/library/…` 引用同一份源码；分发是 shadcn Registry 按项复制源码，不是每个组件一个 npm 包。

```text
src/{library-code}/components/{component-key}/
  ExampleComponent.tsx
  example-component.css
src/{library-code}/blocks/{block-key}/
  ExampleBlock.tsx
  example-block.css
```

组件解决单项任务；区块组合组件，可以覆盖完整业务页面。RIMO登记71个页面级区块，只维护本地模拟数据，不提供真实租赁业务服务。展示入口注入固定后台控件、语言、受控资产及导航；独立安装可回退到声明的antd控件，不依赖Preview登录或路由。共享能力在 `src/rimo-rental/lib/`，每个安装项只登记实际依赖，不包含整个项目菜单。用户基础组件库尚未导入，上述components目录仍是接入约定。

登记不代表全部页面已经重写并验收。RIMO区块只包含右侧业务内容，旧应用侧栏、顶栏和主题外壳不保留。车组、调拨、调价的界面已改为手写公共React控件，同目录`*-model.js`保存局部模拟数据与规则；已确认界面和人工修正的状态文件分别受保护，不被接入脚本覆盖。其余同规范页面按统一规则批量适配，特殊业务分支独立处理，逐页字段、操作和视觉核对仍保留，当前状态跟随原生专项四册。

本轮迁移工具为`scripts/rimo-template-adapter.mjs`和`scripts/rimo-convert-pages.mjs`：仅从只读快照提取显式业务区，映射标准布局并比对转换前后的业务绑定；公共React适配器保留级联路径、日期/时间类型、表单验证、弹层及事件语义。转换报告进入`output/rimo-import`。普通开发、构建和已安装区块不依赖原型HTML或上游目录；后续在本仓库直接维护React源码，重跑迁移前应将人工维护的页面加入保护清单。

## 登记与安装

在 `packages/platform-contracts/src/registered-projects.json` 的对应项目 `registry` 登记组件名称、类型、页面绑定、npm 依赖、其他 Registry 项依赖和完整文件清单，或用项目登记命令更新该数据；`component-registry.js` 自动推导结果。每个文件同时指定本仓库源码路径和安装目标 `@components/preview/…`；仅允许本包内明确登记的 TS、TSX、JS、JSX、CSS及JSON文件。相对引用在源码和安装目标中必须同时成立；不能依赖平台应用或后台公共外壳，也不自动扫描目录。同库辅助文件可放在 `src/{project-code}/lib/`，仍需列入使用它的安装清单。

展示页面在 `NATIVE_MODULES` 使用 `kind: component | block`、`registryItem`、`sourceFiles`。源码与样式变化必须纳入原型版本核对；当前后台将页面级区块保留在需求管理，基础组件归组件管理，不另加一套导航。

公开且上架的区块使用同源接口：

```sh
pnpm dlx shadcn@latest add https://your-preview-site.example/r/your-project/rimo-vehicle-groups.json
```

目标项目先初始化 shadcn，使用 React 19 与 TypeScript。CLI 自动复制声明的源码及样式，安装 npm 依赖，并通过项目范围的 Registry URL 获取其他组件依赖。安装后从 components 别名下引用，例如 `@/components/preview/rimo-rental/blocks/vehicle-groups/VehicleGroupsBlock`；全局变量缺失时 RIMO 样式使用自身回退值。

网站页面的“页面源码”Tab 提供安装命令、区块全部文件和展示入口源码。受限内容支持授权浏览器会话，以及管理员签发的 `components:read` 项目凭证；Registry 请求使用 `Authorization: Bearer`。MCP 提供组件搜索、依赖清单和分页源码读取。下架、撤权、停用客户端、归档项目后，Registry 和每个依赖都拒绝新请求。已经下载到使用者项目的源码无法远程撤回。

在支持自定义 registry headers 的 shadcn 客户端中配置项目命名空间；凭证使用客户端环境变量，不写入网址或提交到仓库：

```json
{
  "registries": {
    "@preview-project": {
      "url": "https://your-preview-site.example/r/your-project/{name}.json",
      "headers": { "Authorization": "Bearer ${PREVIEW_PROJECT_TOKEN}" }
    }
  }
}
```

然后执行 `pnpm dlx shadcn@latest add @preview-project/rimo-vehicle-groups`。服务端验证本项目全部依赖的上架与授权后，将Bearer安装需要的组件源码、辅助文件和npm依赖合成单个安装响应；不要求客户端向后续绝对URL传播凭证。不同依赖要求冲突版本时明确拒绝，已下架依赖不会被捆绑带出。MCP 的 `get_component`、`read_component_file` 仍按单项、分页读取并保留版本信息。连接入口和凭证范围在后台“项目 → AI 接入”中管理。

## 构建边界

web 构建把完整 Registry 文件包写入受控 `page-source/registry`，浏览器运行区块位于受控 `page-assets`；两者都不进入公开静态白名单。HTTP 只读取当前发行快照，开发模式只读取本地登记的文件；路径越界、符号链接、缺失文件、依赖循环、安装目标冲突均失败，不降级为不完整安装包。来源与许可在接入真实组件库时按其授权保留，不能将上游后台源码或未知付费源码自动纳入分发。
