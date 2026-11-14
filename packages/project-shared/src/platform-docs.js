/** Public platform documentation; contains no project PRDs, configuration or runtime imports. */
import { PLATFORM_ENGINEERING_GOVERNANCE } from './platform-governance.js';
import { REQUIREMENT_GRAPH_GUIDE } from './requirement-graph-guide.js';
export const PLATFORM_GUIDES = Object.freeze([
  {
    id: 'introduction',
    title: '介绍',
    description: '了解Preview、平台内容的组织方式，以及如何阅读和使用一个页面。',
    path: 'guides/introduction.md',
    markdown: `## 什么是 Preview

Preview 是用于展示组件、页面区块与产品需求的平台。你可以在这里体验交互、阅读业务原文、查看源码，也可以让开发Agent通过MCP读取同一份需求和实现参考。

每个项目有独立的页面、业务资料和访问范围。平台提供统一的展示、搜索、主题与AI接入方式；项目下的组件和页面通过源码清单独立接入你的React工程。

## 内容如何组织

<dl>
<div><dt>平台文档</dt><dd>介绍Preview的使用、主题、动效、需求阅读与AI接入。所有项目共用这份说明。</dd></div>
<div><dt>内容目录</dt><dd>Screens 按项目组织，展开项目后先查看关系图谱，再浏览页面。组件与区块按功能分类查找。</dd></div>
<div><dt>需求与图谱</dt><dd>页面关联业务需求，图谱提供有原文依据的关系、原型覆盖和改动影响。业务规则以各项目发布的需求原文为准。</dd></div>
<div><dt>组件与页面源码</dt><dd>预览与源码来自同一实现。安装清单包含样式、辅助文件及依赖，可按项接入目标工程。</dd></div>
</dl>

## 如何阅读一个页面

先体验预览中的字段、流程和操作，再读页面下方的功能说明。通过“文档”查看关联原文，通过“页面源码”核对文件与依赖。完整页面以页面级区块提供，保留业务内容区。

需要连续体验多个页面时使用Try the demo。左上角选择项目后，侧栏列出该项目的可见页面，便于检查功能之间的使用过程。关系图谱从 Screens 的对应项目进入。

## 公开内容与访问

公开页面可直接浏览；受限页面按项目授权开放。登录与页面查看范围由平台管理，MCP另用项目读取凭证，需求、治理和源码分别选择读取权限。

## 将源码用于自己的项目

从页面复制实际Registry安装命令，或让Agent用MCP读取组件清单和完整文件。源码落入你的工程后，按目标目录、主题和业务接口适配，保留来源与许可。具体步骤见[使用指南](usage.md)。

## 用 Agent 开发

MCP提供组件和页面源码，也提供可独立采用的工程治理规范，帮助Agent确认需求、拆任务、验证和交接。无需使用平台里的需求，也能把这套方法用于自己的工程；接入方式与完整规范见[AI 和 MCP](ai.md)。

## 下一步

<div data-guide-example="next-steps">

- [使用指南](usage.md)：浏览页面并接入源码。
- [主题设置](theming.md)：使用语义变量和外观设置。
- [AI 和 MCP](ai.md)：连接Agent并按发布需求开发。

</div>
`,
  },
  {
    id: 'usage',
    title: '使用指南',
    description: '浏览页面、阅读需求，并将组件和区块接入自己的工程。',
    path: 'guides/usage.md',
    markdown: `## 浏览页面、组件与区块

Screens 目录分为三级，依次是 Screens、项目名称、关系图谱与页面。当前项目默认展开，关系图谱位于第一项。页面标题直接使用页面名称，重名条目用小标签区分。组件与区块沿功能分类展开，搜索和访问范围筛选用于缩小范围。

页面提供交互预览、源码和需求说明。页面关联资料可继续追溯业务原文；Docs介绍Preview平台的通用使用方式。

## 接入源码前

准备React与TypeScript工程，查看目标组件的依赖清单和版本要求。Registry使用shadcn CLI复制源码并安装依赖，已有工程沿用自己的主题与目录。

1. ### 初始化目标工程

   已有React工程可跳过创建步骤。配置TypeScript与构建工具的\`@/*\`路径别名，再初始化shadcn。

   \`\`\`sh
   npm create vite@latest my-app -- --template react-ts
   cd my-app
   npm install
   npx shadcn@latest init
   \`\`\`

2. ### 选择组件或页面

   在预览中确认交互，阅读关联需求与安装清单。页面级区块可独立使用，不需要复制平台导航与账号系统。

3. ### 使用页面提供的安装命令

   复制页面标题下或源码页签中的完整命令。以下只展示地址格式，项目编码和组件名称以页面给出的实际值为准。

   \`\`\`sh
   npx shadcn@latest add {{origin}}/r/<project-id>/<registry-item>.json
   \`\`\`

## 安装内容

安装清单列出源码、样式、辅助模块、目标路径、npm依赖和其他Registry依赖。安装后从清单指明的目标目录导入组件，检查文件齐全及版本一致。

受限源码需要授权会话或项目源码读取凭证。凭证通过请求头传递，保存在客户端私有配置中。

## 手动接入

1. ### 取得完整文件

   从页面源码页签或MCP读取文件清单，再逐份取得源码和样式，继续读取被引用的辅助模块与组件依赖。

2. ### 适配目标工程

   核对路径别名、主题变量、字体、图标和依赖。保留字段、操作、校验与异常分支，按发布需求替换模拟数据和接口。

3. ### 验证实际效果

   检查筛选、表单、弹层、键盘操作、窄屏布局与失败提示，记录已验证的场景及尚未覆盖的部分。

## 继续开发

在项目更新记录里检查需求和页面变化，再回到相关原文核对影响。需要Agent协助时，按[AI 和 MCP](ai.md)接入，使用同一份需求、规则和源码。
`,
  },
  {
    id: 'theming',
    title: '主题设置',
    description: '语义颜色、字体和圆角、深色模式，以及目标工程的主题适配。',
    path: 'guides/theming.md',
    markdown: `## 颜色变量

Preview展示前台使用语义颜色变量。组件说明、源码面板与导航共用这些角色；更换主题时无需逐个修改色值。下方色块直接读取当前页面的主题。

| 变量 | 用途 |
| --- | --- |
| \`--background\` | 整个页面的背景。 |
| \`--surface\` | 内容面板、输入框与预览表面。 |
| \`--surface-raised\` | 菜单、弹层与对话框。 |
| \`--surface-muted\` | 悬停填充、弱化区域与代码背景。 |
| \`--foreground\` | 主要文字与图标。 |
| \`--text-secondary\` | 使用说明和辅助描述。 |
| \`--text-muted\` | 占位提示和次要元信息。 |
| \`--border\` | 默认的一像素边界。 |
| \`--border-subtle\` | 表面内部的分隔线。 |
| \`--border-strong\` | 悬停或按下时的强调边界。 |
| \`--accent\` | 当前选中项、进度与交互强调。 |
| \`--accent-subtle\` | 选中状态的浅色背景。 |
| \`--success\` | 成功反馈。 |
| \`--warning\` | 需要注意的提示。 |
| \`--danger\` | 错误与危险操作。 |

安装到其他项目时，将区块需要的变量接到目标主题。独立区块还会列出自己的样式与依赖，不要求复制整个展示网站。

## 圆角与字体

| 变量 | 用途 |
| --- | --- |
| \`--radius-control\` | 前台基础输入与按钮圆角，默认 \`0.875rem\`（14px）。 |
| \`--radius-panel\` | 菜单与内层面板，默认 \`1.25rem\`（20px）。 |
| \`--radius-surface\` | 大块内容表面，默认 \`1.5rem\`（24px）。 |
| \`--radius-pill\` | 胶囊形标签与分段控件。 |
| \`--font-display\` | 标题使用的 Geist 字体栈。 |
| \`--font-body\` | 正文使用的 Inter 字体栈；中文使用系统回退字体。 |
| \`--font-mono\` | 源码、变量与文件路径。 |
| \`--shadow-floating\` | 浮在内容上方的弹层。 |

Screens 与管理后台按控件职责使用默认圆角：内容容器12px、常用按钮12px、输入和下拉14px；侧栏菜单及搜索框8px。圆形头像、开关和胶囊标签保留原形态。外观设置可分别调整容器、按钮与输入，已保存的自定义值继续生效。可安装区块由宿主主题提供同类变量。

## 深色模式

顶部开关和外观面板切换当前浏览器的深浅色偏好。展示前台由 \`SiteFrame\` 设置根容器属性，组件读取容器中的语义变量。

\`\`\`html
<div class="preview-showcase" data-theme="dark" data-accent="neutral">
  <main>Preview</main>
</div>
\`\`\`

接入自己的应用后，由应用的主题入口统一管理模式。逐项检查文字、占位、边界、焦点和禁用态。

## 强调色

八种内置强调色用于选择和反馈。可以在顶部外观面板切换，并复制对应的主题 CSS。

<div data-guide-example="accents"></div>

\`\`\`html
<div class="preview-showcase" data-theme="light" data-accent="green">
  <main>Preview</main>
</div>
\`\`\`

## 接入自己的品牌

在目标项目的主题样式中覆盖语义角色。浅色与深色分别设值，保留成功、警告和错误的含义。下面是一个绿色品牌示例。

\`\`\`css
.preview-showcase[data-accent="green"] {
  --accent: #087b52;
  --accent-strong: #065b3d;
  --accent-subtle: #edf8f2;
}

.preview-showcase[data-theme="dark"][data-accent="green"] {
  --accent: #69d4a6;
  --accent-strong: #a0e7c7;
  --accent-subtle: #13352a;
}
\`\`\`

安装文件和依赖见[使用指南](usage.md)，过渡与减少动态效果见[动效](motion.md)。
`,
  },
  {
    id: 'motion',
    title: '动效',
    description: '平台动效预设、时长与缓动，以及减少动态效果。',
    path: 'guides/motion.md',
    markdown: `## 使用原则

- 动效说明打开、关闭、选择与内容变化，位置应与触发操作对应。
- 过渡可中断，连续点击与键盘操作不等待动画播放完毕。
- 组件组合后仍保持正确的焦点、弹层关闭和加载反馈。
- 同类交互复用同一组预设，减少动态效果时保留最终状态。

## 弹簧预设

展示前台使用公共入口 \`@preview/ui\` 导出的 \`siteMotionTokens\`。可安装组件的动效文件与依赖以各项 Registry 清单为准。

| 预设 | 参数 | 适用场景 |
| --- | --- | --- |
| \`spring.snappy\` | \`visualDuration: 0.26\`，\`bounce: 0\` | 按压、开关、滑块和小型指示器。 |
| \`spring.smooth\` | \`visualDuration: 0.4\`，\`bounce: 0\` | 面板、高度和布局变化。 |
| \`spring.morph\` | \`visualDuration: 0.42\`，\`bounce: 0\` | 共享导航高亮与形状变化。 |
| \`spring.responsive\` | \`stiffness: 520\`，\`damping: 44\` | 紧跟操作的弹簧反馈。 |
| \`spring.gentle\` | \`stiffness: 340\`，\`damping: 34\` | 较缓和的进入与切换。 |

## 缓动与时长

| 变量 | 用途 |
| --- | --- |
| \`--ease-standard\` | 常规界面过渡，\`cubic-bezier(.22, 1, .36, 1)\`。 |
| \`--ease-enter\` | 内容进入，\`cubic-bezier(.16, 1, .3, 1)\`。 |
| \`--ease-exit\` | 内容退出，\`cubic-bezier(.7, 0, .84, 0)\`。 |
| \`--ease-in-out\` | 已显示元素的位置变化。 |
| \`--duration-instant\` | 直接反馈，\`0.12s\`。 |
| \`--duration-fast\` | 小型交互，\`0.16s\`。 |
| \`--duration-standard\` | 常规过渡，\`0.24s\`。 |
| \`--duration-considered\` | 较完整的变化，\`0.48s\`。 |

## 使用令牌

在 Preview 工程中可以直接使用公共预设。安装到其他项目时，复用该组件实际附带的令牌与依赖。

\`\`\`tsx
import { motion, useReducedMotion } from 'motion/react';
import { siteMotionTokens } from '@preview/ui';

export function ExamplePanel() {
  const reduced = useReducedMotion();
  return (
    <motion.div
      initial={reduced ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={reduced ? { duration: 0 } : siteMotionTokens.spring.smooth}
    >
      组件内容
    </motion.div>
  );
}
\`\`\`

\`\`\`css
.component-link {
  transition: color var(--duration-fast) var(--ease-standard);
}
\`\`\`

## 减少动态效果

系统请求减少动态效果时，保留内容、焦点与反馈，移除非必要移动、缩放和循环。即使动画关闭，组件也应完成同样的任务。

\`\`\`css
@media (prefers-reduced-motion: reduce) {
  .component-link {
    transition: none;
  }
}
\`\`\`

检查默认、悬停、禁用、加载与失败状态，并测试快速开关弹层后的焦点恢复。
`,
  },
  REQUIREMENT_GRAPH_GUIDE,
  {
    id: 'ai',
    title: 'AI 和 MCP',
    description: '连接Agent，读取需求与源码，并按工程治理规范组织开发。',
    path: 'guides/ai.md',
    markdown: `## 连接 MCP 服务

项目 MCP 使用 Streamable HTTP，提供项目需求、治理规则、更新记录与组件源码。管理员在当前项目“AI 接入”中签发读取凭证，将配置添加到支持该传输方式的 Agent 客户端。

\`\`\`json
{
  "mcpServers": {
    "{{projectId}}": {
      "url": "{{origin}}/api/project-context/mcp",
      "headers": {
        "Authorization": "Bearer <project-read-only-token>"
      }
    }
  }
}
\`\`\`

用当前项目签发的凭证替换占位符。网页公开浏览和 MCP 的项目读取范围分别管理。

<dl>
<div><dt><code>get_project_context</code></dt><dd>首先确认项目、版本，以及可读取的需求、治理规则和组件范围。</dd></div>
<div><dt><code>read_project_updates</code></dt><dd>读取平台规范和接入更新；需要项目资料时，再选择对应项目更新。</dd></div>
<div><dt><code>search_requirements</code></dt><dd>按业务问题查找需求，返回匹配内容与原文位置。</dd></div>
<div><dt><code>read_requirement</code></dt><dd>读取具体需求原文及页面关联，按返回游标继续读取。</dd></div>
<div><dt><code>get_requirement_graph</code></dt><dd>读取需求节点、明确关系、原型覆盖和维护状态。</dd></div>
<div><dt><code>analyze_requirement_impact</code></dt><dd>根据关系含义检查上下游影响，返回原因与依据。</dd></div>
<div><dt><code>get_page_context</code></dt><dd>从一个页面定位其需求与业务说明。</dd></div>
</dl>

## 工程治理

连接 MCP 后，不仅能获取组件、区块和页面源码，还会获得工程治理指引，帮助 Agent 确认需求、拆分任务、验证结果并做好交接。

- **先明确，再实施**：读现有资料，确认目标、范围和验收，缺少关键信息时逐项询问，已有结论直接沿用。
- **任务与记录各归其位**：按可验收的结果拆任务，保留实际开发记录和最新接续；本地需求文档按需要创建。
- **验证并完成收尾**：保留他人修改，检查更新与依赖，记录实际验证和未完事项，清理自己的临时环境。

这套方法可以单独用于你的工程。Agent读完后会说明采用方式、询问是否遵循，再按实际工作给出自查结果；没有需求资料或不安装组件，也可以使用。

<details>
<summary>查看完整工程治理规范</summary>

<!-- engineering-governance:start -->
${PLATFORM_ENGINEERING_GOVERNANCE}
<!-- engineering-governance:end -->

</details>

## 让 Agent 先读取规则

1. ### 读取规范和更新

   调用\`get_project_context\`查看可用能力，用\`list_governance_rules\`和\`read_governance_rule\`读完通用规范，并用\`read_project_updates({source: "platform"})\`检查规范与接入更新。

2. ### 读取规范并说明采用方式

   Agent简要说明需求确认、任务与记录、协作、验证和收尾的方法，再询问是否采用；已有选择直接沿用。

3. ### 在目标工程中执行和自查

   以负责人认可的需求依据开展任务，保留已有规则和成果，按需要补齐任务、记录与接续，并用证据说明哪些已遵循、待补齐、有冲突或无法核实。

规则和更新记录都要按返回游标读完，保持各自版本一致。MCP提供引导，实际执行由当前Agent完成。

## 读取页面源码

使用\`list_components\`查找已上架的组件、区块或页面，\`get_component\`取得文件、npm依赖与\`registryDependencies\`，再用\`read_component_file\`读完源码、样式和辅助文件。页面以页面级区块提供；依赖也要继续读取，文件分页保持同一\`registryRevision\`。

公开区块也可以通过 shadcn CLI 安装：

\`\`\`sh
npx shadcn@latest add {{origin}}/r/{{projectId}}/<registry-item>.json
\`\`\`

安装步骤与示例导入见[使用指南](usage.md)。

## 选择读取范围

1. ### 创建项目凭证

   在要读取项目的 AI 接入中，为当前工具或工作场景创建凭证。

2. ### 勾选需要的能力

   \`business:read\` 用于需求和图谱，\`governance:read\` 用于已发布治理规则，\`components:read\` 用于源码与安装清单。

3. ### 配置客户端

   将凭证保存在客户端私有配置中。过期或撤销后更新配置，不把凭证写入源码或分享链接。

## 可读取的上下文

- **业务需求**：项目概况、PRD 原文、页面要点与完整说明。
- **功能关系**：前置条件、功能关联、数据流转与平台接口关系。
- **组件与页面源码**：已登记组件、区块和页面的源码、样式、辅助模块及依赖。
- **更新记录**：与网站同版的项目更新，用于发现变化并回到需求原文核对。
- **工程规则**：可独立采用的通用规范，以及凭证允许读取的补充条目。

读取结果有游标时继续分页；出现维护提醒或原文冲突时，保留差异并核对来源。图中的距离和颜色不作为业务依据。

## 试一个提示词

\`\`\`text
读取MCP提供的通用工程治理规范和平台更新，简要说明方法，并询问是否在我的工程中采用；已有选择直接沿用。
采用后，先检查现有规则、已确认需求和Git现场，再按任务组织开发、验证和交接，本地需求文档按需要建立。
需要组件或页面时，用list_components、get_component和read_component_file读完源码、样式及依赖。
交付时按已遵循、待补齐、有冲突、无法核实逐项说明依据，保留未完事项并完成临时环境清理。
\`\`\`

MCP 提供需求和源码上下文。业务写入与真实接口仍由目标业务系统处理。
`,
  },
  {
    id: 'changelog',
    title: '更新日志',
    description: 'Preview平台的功能、文档与接入方式更新。',
    path: 'guides/changelog.md',
    markdown: `## 2026 年 11 月

### 11 月 12 日

#### 平台文档与项目导航

- Docs统一介绍Preview平台，使用指南、主题、动效与AI接入不随项目替换。
- 左侧按页面、组件、区块分类，继续展开功能分类和具体条目，移除目录顶部项目选择器。
- 业务需求、图谱和项目更新保持各自的资料范围。

#### AI与工程治理

- 工程治理放在MCP接入之后，简要规则直接可读，完整规范默认收起。
- 工程治理可独立用于其他工程，没有需求资料也可读取；本地需求文档按需要建立，开发前及继续任务时检查更新。
- MCP提供更新记录、需求与图谱，以及组件、区块和页面的完整源码、样式及依赖。

### 11 月 11 日

- 文档支持章节目录、步骤、变量表和可复制代码。
- 主题提供深浅色、八种强调色与语义变量。
- 需求图谱提供二维与三维视图，Demo可以连续体验项目页面。

这是平台对外更新说明。业务变更可从页面的“更多页面操作 → 查看更新记录”继续阅读，并以对应需求原文确认范围。
`,
  },
]);
