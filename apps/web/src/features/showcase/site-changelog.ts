/** Public release notes only. Personal development records and platform
 * internal task/validation logs are intentionally not read from this entry. */
export const SITE_CHANGELOG: {
  date: string;
  title: string;
  changes: { title: string; description: string; href?: string; restricted?: boolean }[];
}[] = [
  {
    date: '2026-11-06',
    title: '平台展示与交互',
    changes: [
      {
        title: '页面展示',
        description: 'React交互预览、页面源码与功能说明。',
        href: '/pages',
      },
      {
        title: '账号与权限',
        description: '项目和页面由管理员授权。',
      },
      { title: '主题与语言', description: '八种主题色，简体中文、繁体中文与英语。' },
      { title: '页面查看工具', description: '预览和源码切换、全屏、复制 Markdown 与 AI 接入说明。' },
    ],
  },
];
