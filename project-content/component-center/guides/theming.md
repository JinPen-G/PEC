## 颜色变量

组件中心的前台使用语义颜色变量。组件说明、源码面板与导航共用这些角色；更换主题时无需逐个修改色值。下方色块直接读取当前页面的主题。

| 变量 | 用途 |
| --- | --- |
| `--background` | 整个页面的背景。 |
| `--surface` | 内容面板、输入框与预览表面。 |
| `--surface-raised` | 菜单、弹层与对话框。 |
| `--surface-muted` | 悬停填充、弱化区域与代码背景。 |
| `--foreground` | 主要文字与图标。 |
| `--text-secondary` | 使用说明和辅助描述。 |
| `--text-muted` | 占位提示和次要元信息。 |
| `--border` | 默认的一像素边界。 |
| `--border-subtle` | 表面内部的分隔线。 |
| `--border-strong` | 悬停或按下时的强调边界。 |
| `--accent` | 当前选中项、进度与交互强调。 |
| `--accent-subtle` | 选中状态的浅色背景。 |
| `--success` | 成功反馈。 |
| `--warning` | 需要注意的提示。 |
| `--danger` | 错误与危险操作。 |

安装到其他项目时，将区块需要的变量接到目标主题。独立区块还会列出自己的样式与依赖，不要求复制整个展示网站。

## 圆角与字体

| 变量 | 用途 |
| --- | --- |
| `--radius-control` | 前台基础输入与按钮圆角，默认 `1.125rem`。 |
| `--radius-panel` | 菜单与内层面板，默认 `26px`。 |
| `--radius-surface` | 大块内容表面，默认 `2.125rem`。 |
| `--radius-pill` | 胶囊形标签与分段控件。 |
| `--font-display` | 标题使用的 Geist 字体栈。 |
| `--font-body` | 正文使用的 Inter 字体栈；中文使用系统回退字体。 |
| `--font-mono` | 源码、变量与文件路径。 |
| `--shadow-floating` | 浮在内容上方的弹层。 |

这些是展示前台的基础值。可安装区块的控件圆角和字体以其源码及宿主主题适配为准。

## 深色模式

顶部开关和外观面板切换当前浏览器的深浅色偏好。展示前台由 `SiteFrame` 设置根容器属性，组件读取容器中的语义变量。

```html
<div class="uiarc-showcase" data-theme="dark" data-accent="neutral">
  <main>组件中心</main>
</div>
```

接入自己的应用后，由应用的主题入口统一管理模式。逐项检查文字、占位、边界、焦点和禁用态。

## 强调色

八种内置强调色用于选择和反馈。可以在顶部外观面板切换，并复制对应的主题 CSS。

<div data-guide-example="accents"></div>

```html
<div class="uiarc-showcase" data-theme="light" data-accent="green">
  <main>组件中心</main>
</div>
```

## 接入自己的品牌

在目标项目的主题样式中覆盖语义角色。浅色与深色分别设值，保留成功、警告和错误的含义。下面是一个绿色品牌示例。

```css
.uiarc-showcase[data-accent="green"] {
  --accent: #087b52;
  --accent-strong: #065b3d;
  --accent-subtle: #edf8f2;
}

.uiarc-showcase[data-theme="dark"][data-accent="green"] {
  --accent: #69d4a6;
  --accent-strong: #a0e7c7;
  --accent-subtle: #13352a;
}
```

安装文件和依赖见[使用指南](usage.md)，过渡与减少动态效果见[动效](motion.md)。
