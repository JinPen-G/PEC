## 使用原则

- 动效解释变化：哪个菜单打开、当前选择去了哪里、详情来自哪个需求点。
- 连续操作可以打断过渡，不必等待动画结束再点击。
- 图谱点位保持稳定。2D 平移画布，3D 旋转整体，筛选和选择不重新排列节点。
- 业务状态由数据决定。审批、支付和控车的结果提示与界面过渡分别处理。

## 弹簧预设

前台通过 `@preview/ui` 的 `siteMotionTokens` 复用以下预设。导航选中、菜单、面板与尺寸变化使用同一组参数。

| 预设 | 参数 | 适用场景 |
| --- | --- | --- |
| `spring.snappy` | `visualDuration: 0.26`，`bounce: 0` | 按压、开关、小型指示器和菜单。 |
| `spring.smooth` | `visualDuration: 0.4`，`bounce: 0` | 面板展开、内容高度与布局变化。 |
| `spring.morph` | `visualDuration: 0.42`，`bounce: 0` | 导航高亮与共享元素的位置、尺寸变化。 |
| `spring.responsive` | `stiffness: 520`，`damping: 44` | 需要直接响应操作的弹簧过渡。 |
| `spring.gentle` | `stiffness: 340`，`damping: 34` | 较缓和的元素进入与切换。 |

## 缓动与时长

CSS 过渡使用前台主题中的变量，React 动效使用相同来源的令牌。

| 变量 | 用途 |
| --- | --- |
| `--ease-standard` | 常规过渡，`cubic-bezier(.22, 1, .36, 1)`。 |
| `--ease-enter` | 内容进入，`cubic-bezier(.16, 1, .3, 1)`。 |
| `--ease-exit` | 内容退出，`cubic-bezier(.7, 0, .84, 0)`。 |
| `--ease-in-out` | 已在画面中的元素移动。 |
| `--duration-instant` | 直接反馈，`0.12s`。 |
| `--duration-fast` | 轻量交互，`0.16s`。 |
| `--duration-standard` | 常规过渡，`0.24s`。 |
| `--duration-considered` | 较完整的变化，`0.48s`。 |

## 使用令牌

在本仓库新增展示内容时，从公共入口引入预设。下面的面板示例在减少动态效果模式下直接显示最终状态。

```tsx
import { motion, useReducedMotion } from 'motion/react';
import { siteMotionTokens } from '@preview/ui';

export function RequirementPanel() {
  const reduced = useReducedMotion();
  return (
    <motion.div
      initial={reduced ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={reduced ? { duration: 0 } : siteMotionTokens.spring.smooth}
    >
      需求详情
    </motion.div>
  );
}
```

```css
.requirement-link {
  transition: color var(--duration-fast) var(--ease-standard);
}
```

## 减少动态效果

遵循系统的 `prefers-reduced-motion`。保留最终状态、焦点和操作反馈，去掉非必要位移、缩放与循环。图谱不会自动旋转，松手后停止重绘。

```css
@media (prefers-reduced-motion: reduce) {
  .requirement-link {
    transition: none;
  }
}
```

从预览检查动画时，同时测试键盘关闭、快速切换和焦点恢复。主题变量见[主题设置](theming.md)。
