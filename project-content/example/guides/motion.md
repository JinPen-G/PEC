## 使用原则

- 动效说明打开、关闭、选择与内容变化，位置应与触发操作对应。
- 过渡可中断，连续点击与键盘操作不等待动画播放完毕。
- 组件组合后仍保持正确的焦点、弹层关闭和加载反馈。
- 同类交互复用同一组预设，减少动态效果时保留最终状态。

## 弹簧预设

展示前台使用公共入口 `@preview/ui` 导出的 `siteMotionTokens`。可安装组件的动效文件与依赖以各项 Registry 清单为准。

| 预设 | 参数 | 适用场景 |
| --- | --- | --- |
| `spring.snappy` | `visualDuration: 0.26`，`bounce: 0` | 按压、开关、滑块和小型指示器。 |
| `spring.smooth` | `visualDuration: 0.4`，`bounce: 0` | 面板、高度和布局变化。 |
| `spring.morph` | `visualDuration: 0.42`，`bounce: 0` | 共享导航高亮与形状变化。 |
| `spring.responsive` | `stiffness: 520`，`damping: 44` | 紧跟操作的弹簧反馈。 |
| `spring.gentle` | `stiffness: 340`，`damping: 34` | 较缓和的进入与切换。 |

## 缓动与时长

| 变量 | 用途 |
| --- | --- |
| `--ease-standard` | 常规界面过渡，`cubic-bezier(.22, 1, .36, 1)`。 |
| `--ease-enter` | 内容进入，`cubic-bezier(.16, 1, .3, 1)`。 |
| `--ease-exit` | 内容退出，`cubic-bezier(.7, 0, .84, 0)`。 |
| `--ease-in-out` | 已显示元素的位置变化。 |
| `--duration-instant` | 直接反馈，`0.12s`。 |
| `--duration-fast` | 小型交互，`0.16s`。 |
| `--duration-standard` | 常规过渡，`0.24s`。 |
| `--duration-considered` | 较完整的变化，`0.48s`。 |

## 使用令牌

在 Preview 工程中可以直接使用公共预设。安装到其他项目时，复用该组件实际附带的令牌与依赖。

```tsx
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
```

```css
.component-link {
  transition: color var(--duration-fast) var(--ease-standard);
}
```

## 减少动态效果

系统请求减少动态效果时，保留内容、焦点与反馈，移除非必要移动、缩放和循环。即使动画关闭，组件也应完成同样的任务。

```css
@media (prefers-reduced-motion: reduce) {
  .component-link {
    transition: none;
  }
}
```

检查默认、悬停、禁用、加载与失败状态，并测试快速开关弹层后的焦点恢复。
