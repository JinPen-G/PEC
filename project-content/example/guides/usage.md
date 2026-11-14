## 环境要求

准备 React 19 与 TypeScript 项目，并配置 `@/*` 路径别名。Registry 使用 shadcn CLI 复制源码与安装依赖；已有工程可以直接从初始化 shadcn 开始。浏览当前示例不需要登录。

## 准备 Vite 项目

1. ### 创建项目

   已有 React 工程可跳过这一步。

   ```sh
   npm create vite@latest my-app -- --template react-ts
   cd my-app
   npm install
   ```

2. ### 配置别名并初始化 shadcn

   将 TypeScript 与构建工具中的 `@/*` 指向 `src/*`，再执行初始化。按目标项目现有主题与样式选择配置。

   ```sh
   npx shadcn@latest init
   ```

3. ### 选择区块

   在示例检查预览、源码和依赖。当前车组管理区块用于演示列表、筛选与编辑的组合方式。

## 添加 Registry

在 `components.json` 中加入以下 `registries` 项，保留已有配置：

```json
{
  "registries": {
    "@preview-project": "{{origin}}/r/{{projectId}}/{name}.json"
  }
}
```

不使用命名空间时，直接复制页面里的完整安装 URL 即可。

## 安装组件与区块

```sh
npx shadcn@latest add {{origin}}/r/{{projectId}}/example-vehicle-groups.json
```

文件位于 `components` 别名下的 `preview/example` 目录。安装清单包含区块源码、样式、辅助模块和 npm 依赖，预览与分发使用同一份实现。

```tsx
import VehicleGroupsBlock from '@/components/preview/example/blocks/vehicle-groups/VehicleGroupsBlock';

export default function ExamplePage() {
  return <VehicleGroupsBlock />;
}
```

## 手动安装

1. ### 安装所需包

   查看页面安装清单中的 `dependencies`，在目标工程安装对应版本。

2. ### 复制文件与样式

   按“安装与源码”列出的目标路径复制所有文件，包括区块引用的辅助模块和 CSS。

3. ### 检查宿主环境

   核对路径别名、主题变量、字体和图标。检查输入、校验、加载、弹层关闭及键盘操作，再替换模拟数据。

## 浏览与接入范围

当前示例公开浏览与安装。**Try the demo** 会进入前台当前项目，便于连续检查界面；它不向目标工程添加网站的顶栏或侧栏。

独立组件库按正式源码登记继续扩展。通过[AI 和 MCP](ai.md)可让 Agent 查找现有组件、核对依赖并读取文件。
