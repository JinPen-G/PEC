/** Public release notes only. Personal development records and platform
 * internal task/validation logs are intentionally not read from this entry. */
export const SITE_CHANGELOG: {
  date: string;
  title: string;
  changes: { title: string; description: string; href?: string; restricted?: boolean }[];
}[] = [
  {
    date: '2026-11-06',
    title: '原型页面与网站交互更新',
    changes: [
      {
        title: '车组管理',
        description: '原生交互预览、页面源码与功能说明。',
        href: '/pages/rimo-rental/operation/vehicle-groups',
      },
      {
        title: '车辆调拨管理',
        description: '单车与批量调拨演示，页面由管理员授权。',
        href: '/pages/rimo-rental/operation/vehicle-transfer',
        restricted: true,
      },
      { title: '主题与语言', description: '八种主题色，简体中文、繁体中文与英语。' },
      { title: '页面查看工具', description: '预览和源码切换、全屏、复制 Markdown 与 AI 接入说明。' },
    ],
  },
];
