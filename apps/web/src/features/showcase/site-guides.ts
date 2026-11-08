/** Public viewing guides are authored here; internal project books are never
 * used as website content. Routes mirror the reference site's guide order. */
export const siteGuides = [
  { path: '/docs', title: '介绍' },
  { path: '/docs/installation', title: '使用指南' },
  { path: '/docs/theming', title: '主题设置' },
  { path: '/docs/motion', title: '动效' },
  { path: '/docs/graph', title: '需求关系图谱' },
  { path: '/docs/ai', title: 'AI 和 MCP' },
  { path: '/docs/changelog', title: '更新日志' },
] as const;

export const guideContent: Record<
  string,
  {
    description: string;
    sections: { id: string; title: string; paragraphs: string[] }[];
  }
> = {
  '/docs': {
    description: '了解 Preview、页面如何组织，以及如何阅读原型与需求。',
    sections: [
      {
        id: 'what',
        title: '什么是 Preview',
        paragraphs: ['Preview 将项目的交互页面、页面源码和业务 PRD 放在一起，方便浏览与评审。'],
      },
      {
        id: 'organization',
        title: '页面如何组织',
        paragraphs: ['左侧按业务功能分组，选择页面即可查看对应原型。文档菜单提供浏览、主题和 AI 接入指南。'],
      },
      {
        id: 'reading',
        title: '如何阅读页面',
        paragraphs: [
          '预览用于操作列表、表单和弹窗；页面源码用于查看当前页面的 React 实现。',
          '简短 PRD 展示在预览下方；较长 PRD 在下方保留关键信息，并在预览与源码之间提供文档标签查看全文。',
        ],
      },
      {
        id: 'access',
        title: '公开与授权页面',
        paragraphs: [
          '公开页面直接浏览。重要页面需要登录，并由管理员授权给指定账号；仅登录不会自动获得权限。',
        ],
      },
      { id: 'pages', title: '当前页面', paragraphs: [] },
      {
        id: 'next',
        title: '继续了解',
        paragraphs: [
          '使用指南介绍预览和复制操作；主题设置与动效说明显示偏好；AI 和 MCP 说明业务需求的只读访问方式。',
        ],
      },
    ],
  },
  '/docs/installation': {
    description: '开始浏览页面、试用交互并阅读关联的业务需求。',
    sections: [
      {
        id: 'start',
        title: '开始浏览',
        paragraphs: ['从左侧功能分组选择页面，也可以通过搜索快速查找。公开页面无需登录。'],
      },
      {
        id: 'preview',
        title: '使用预览',
        paragraphs: [
          '在预览中操作搜索、表单与弹窗。原型业务使用模拟数据，刷新页面后恢复示例状态。',
          '切换手机按钮可查看窄屏布局；放大按钮打开全屏预览。切换尺寸会保留当前未提交的表单内容。',
        ],
      },
      {
        id: 'requirements',
        title: '阅读源码与 PRD',
        paragraphs: ['页面源码标签展示允许提供的 React 源码。关联 PRD 按章节排版，可通过右侧目录定位。'],
      },
      {
        id: 'copy',
        title: '复制与分享',
        paragraphs: [
          '复制页面可获取 Markdown；旁边的下拉菜单可复制页面链接、查看 Markdown 或复制 AI 接入说明。',
          'DeepSeek 与 WorkBuddy 入口打开官方网站。复制页面后可自行粘贴到助手中。',
        ],
      },
      {
        id: 'access',
        title: '获取页面授权',
        paragraphs: ['使用管理员为你创建的账号登录。看不到受限页面时，请联系管理员授予对应项目的访问权限。'],
      },
    ],
  },
  '/docs/theming': {
    description: '调整主题色、深浅色与界面语言。',
    sections: [
      {
        id: 'accent',
        title: '主题色',
        paragraphs: [
          '右上角外观按钮打开主题色面板。选择颜色后，导航选中状态和支持主题的原型控件会同步更新。',
        ],
      },
      {
        id: 'appearance',
        title: '深色与浅色',
        paragraphs: ['点击外观按钮旁的深浅色开关切换显示模式。主题偏好保存在当前浏览器。'],
      },
      {
        id: 'language',
        title: '界面语言',
        paragraphs: ['默认使用简体中文，可切换为繁体中文或英语。业务 PRD 与页面源码保留原文语言。'],
      },
      {
        id: 'preview',
        title: '原型中的主题',
        paragraphs: ['原型跟随网站的语义颜色。载具状态、警告和删除操作仍使用各自的业务提示颜色。'],
      },
    ],
  },
  '/docs/motion': {
    description: '了解导航、菜单和页面过渡，以及减少动效的使用方式。',
    sections: [
      {
        id: 'navigation',
        title: '导航与页面过渡',
        paragraphs: ['左侧选中背景随页面切换移动。中间内容分段进入，目录会跟随当前阅读位置。'],
      },
      {
        id: 'controls',
        title: '菜单与尺寸切换',
        paragraphs: ['下拉菜单在按钮附近展开；点击外部区域或按 Escape 关闭。预览切换尺寸时保留交互状态。'],
      },
      {
        id: 'theme',
        title: '主题切换',
        paragraphs: ['深浅色切换使用整页展开过渡。浏览器不支持该效果时使用直接切换。'],
      },
      {
        id: 'reduced',
        title: '减少动效',
        paragraphs: [
          '网站尊重系统的减少动态效果偏好：省略位移、缩放和主题扩散，保留操作结果与清晰的状态变化。',
        ],
      },
    ],
  },
};
