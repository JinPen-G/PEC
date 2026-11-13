## 颜色变量

RIMO 产品中心的前台使用语义颜色变量。页面、文档与图谱读取同一套背景、文字、边框和强调色；切换浅色、深色或主题色时一起变化。下方色块显示当前主题的实际颜色。

| 变量 | 用途 |
| --- | --- |
| `--background` | 整个页面的背景。 |
| `--surface` | 页面中的面板、输入框和内容区域。 |
| `--surface-raised` | 浮在内容上方的菜单、弹层和对话框。 |
| `--surface-muted` | 悬停背景、代码区和弱化的填充区域。 |
| `--foreground` | 主要文字与图标。 |
| `--text-secondary` | 正文说明、辅助描述。 |
| `--text-muted` | 占位提示和次要元信息。 |
| `--border` | 默认的一像素边界。 |
| `--border-subtle` | 内容内部的轻量分隔线。 |
| `--border-strong` | 悬停或按下时需要强调的边界。 |
| `--accent` | 选中导航、进度与交互强调。 |
| `--accent-subtle` | 选中状态的浅色背景。 |
| `--success` | 成功结果，与文字状态一起使用。 |
| `--warning` | 需要注意的状态与提示。 |
| `--danger` | 错误和危险操作。 |

订单、车辆与费用的业务状态以对应页面的文字和规则为准。主题色负责界面强调，不重新定义这些状态。

## 圆角与字体

这些变量是前台展示主题的基础值。业务页面里的表格、表单和弹窗继续使用公共控件自身的尺寸与状态约定。

| 变量 | 用途 |
| --- | --- |
| `--radius-control` | 基础输入与按钮圆角，默认 `0.875rem`（14px）。 |
| `--radius-panel` | 菜单与内层面板圆角，默认 `1.25rem`（20px）。 |
| `--radius-surface` | 大块内容表面圆角，默认 `1.5rem`（24px）。 |
| `--radius-pill` | 胶囊形标签与分段控件。 |
| `--font-display` | 页面标题使用的 Geist 字体栈。 |
| `--font-body` | 正文与操作界面使用的 Inter 字体栈；中文使用系统回退字体。 |
| `--font-mono` | 代码、变量名与路径。 |
| `--shadow-floating` | 浮动在内容上方的弹层阴影。 |

Screens与管理后台按控件职责使用默认圆角。内容容器12px、常用按钮12px、输入和下拉14px，侧栏菜单及搜索框8px。圆形头像、开关和胶囊标签保留原形态。已保存的自定义圆角继续生效。

## 深色模式

使用顶部深浅色开关，或在外观面板中选择模式。前台由 `SiteFrame` 把主题写到 `.uiarc-showcase` 根容器，深色模式使用独立的颜色值。

```html
<div class="preview-showcase" data-theme="dark" data-accent="blue">
  <main>RIMO Rental</main>
</div>
```

新增页面使用 `var(--foreground)`、`var(--surface)` 等变量，就能沿用容器的主题。不要在每个页面再维护一个主题开关。

## 强调色

外观面板提供八种主题色。强调色用于当前选择和交互反馈，大部分内容表面保持中性。

<div data-guide-example="accents"></div>

```html
<div class="preview-showcase" data-theme="light" data-accent="violet">
  <main>RIMO Rental</main>
</div>
```

也可以在外观面板中使用“复制主题 CSS”，取得当前 `--accent`、`--accent-strong` 和 `--accent-subtle` 的值。

## 使用品牌色

在现有主题样式之后覆盖语义变量，分别设置浅色与深色值。下面以蓝色品牌为例，只调整强调色，不改正文、错误或警告的含义。

```css
.uiarc-showcase[data-accent="blue"] {
  --accent: #0562ef;
  --accent-strong: #004bbf;
  --accent-subtle: #edf4ff;
}

.uiarc-showcase[data-theme="dark"][data-accent="blue"] {
  --accent: #8bb7ff;
  --accent-strong: #b5d1ff;
  --accent-subtle: #172b48;
}
```

接入时同时检查文字对比度、禁用态和焦点。颜色之外的交互约定见[动效](motion.md)。
