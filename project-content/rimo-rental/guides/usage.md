## 使用前准备

浏览 RIMO 页面、需求和图谱只需要现代浏览器，当前内容无需登录。需要把区块安装到其他工程时，准备 React 19、TypeScript 和已初始化 shadcn 的项目，并配置 `@/*` 路径别名。

## 浏览业务页面

1. ### 选择项目与功能

   在左侧项目菜单中选择 RIMO Rental，再进入车辆、订单、据点或企业用车等功能。也可以使用顶部搜索。

2. ### 预览并核对需求

   操作列表、表单与详情，先看预览下方的规则要点，再打开“文档”页签核对字段、状态和异常分支。

3. ### 继续查看功能关系

   打开[需求关系图谱](#/docs/graph?project={{projectId}})，搜索相关需求。用图例控制显隐，在右侧查看上下游与原文。

## 在 Demo 中体验

1. ### 进入当前项目

   点击顶部 **Try the demo**。入口保留前台当前项目，返回首页后也保留这个选择。

2. ### 连续查看页面

   使用 Demo 左侧功能菜单切换页面，右侧只显示业务内容区。可见菜单与前台保持一致。

3. ### 返回资料页面

   点击“返回产品中心”，继续查看当前项目的源码、需求和图谱。在线鼠标与主动跟随在登录后可用。

## 连接 Registry

在目标工程的 `components.json` 中加入项目命名空间，保留已有的别名与其他配置：

```json
{
  "registries": {
    "@rimo": "{{origin}}/r/{{projectId}}/{name}.json"
  }
}
```

命名空间用于当前项目。也可以直接使用页面“安装与源码”提供的完整 URL，不修改 Registry 配置。

## 安装页面区块

```sh
npx shadcn@latest add {{origin}}/r/{{projectId}}/rimo-vehicle-groups.json
```

文件进入 `components` 别名下的 `preview/rimo-rental` 目录。CLI 同时带入登记的样式、辅助模块和 npm 依赖；不同区块的准确清单显示在对应页面。

```tsx
import VehicleGroupsBlock from '@/components/preview/rimo-rental/blocks/vehicle-groups/VehicleGroupsBlock';

export default function VehiclesPage() {
  return <VehicleGroupsBlock />;
}
```

## 手动安装

1. ### 取得完整文件

   打开“安装与源码”，按显示的目录复制区块、样式和辅助模块，保留相对路径。

2. ### 安装依赖

   按该项 Registry 的 `dependencies` 安装依赖，不根据预览入口猜测所需包。

3. ### 接到业务服务

   在目标项目核对主题、字段和操作，再将模拟数据接入真实接口。业务含义以关联 PRD 为准。

## 交给 Agent

通过[AI 和 MCP](ai.md)连接当前项目。先读取上下文，再查需求、图谱和源码；主题与交互实现分别见[主题设置](theming.md)和[动效](motion.md)。
