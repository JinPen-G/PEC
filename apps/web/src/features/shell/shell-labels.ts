import { usePlatformLocale } from '@/features/locale/platform-locale';

export function useShellLabels() {
  const { locale } = usePlatformLocale();
  const en = locale === 'en',
    traditional = locale === 'zh-Hant';
  const text = (simplified: string, hant: string, english: string) =>
    en ? english : traditional ? hant : simplified;
  return {
    account: text('个人中心', '個人中心', 'Account'),
    theme: text('主题', '主題', 'Theme'),
    light: text('浅色', '淺色', 'Light'),
    dark: text('深色', '深色', 'Dark'),
    system: text('跟随系统', '跟隨系統', 'System'),
    language: text('语言', '語言', 'Language'),
    appearance: text('外观与音效', '外觀與音效', 'Appearance & sound'),
    workMode: text('工作模式', '工作模式', 'Work mode'),
    admin: text('管理控制台', '管理控制台', 'Admin'),
    switchCenter: text('切换到组件中心', '切換到組件中心', 'Switch to component center'),
    center: text('组件中心', '組件中心', 'Component center'),
    requirements: text('需求管理', '需求管理', 'Requirements'),
    components: text('组件管理', '組件管理', 'Components'),
    empty: text('暂无内容', '暫無內容', 'No content yet'),
    switchAdmin: text('切换到管理控制台', '切換到管理控制台', 'Switch to admin'),
    logout: text('退出登录', '登出', 'Sign out'),
    search: text('搜索菜单…', '搜尋選單…', 'Search menu…'),
    expand: text('展开侧栏', '展開側欄', 'Expand sidebar'),
    collapse: text('收起侧栏', '收起側欄', 'Collapse sidebar'),
    breadcrumb: text('当前位置', '目前位置', 'Current location'),
    pageDocument: text('本页文档', '本頁文件', 'Page document'),
    close: text('关闭文档', '關閉文件', 'Close document'),
    demo: text('前端演示', '前端演示', 'UI demo'),
    platform: text('平台管理', '平台管理', 'Administration'),
    projects: text('项目管理', '專案管理', 'Projects'),
    users: text('账号管理', '帳號管理', 'Accounts'),
    grants: text('项目授权', '專案授權', 'Project access'),
    docs: text('文档中心', '文件中心', 'Documents'),
    workspace: text('项目工作台', '專案工作台', 'Workspace'),
    order: text('订单示例', '訂單範例', 'Order example'),
    loginTitle: text('登录 Preview', '登入 Preview', 'Sign in to Preview'),
    loginIntro: text('进入你的项目演示空间', '進入你的專案演示空間', 'Enter your project workspace'),
    username: text('账号', '帳號', 'Account'),
    password: text('密码', '密碼', 'Password'),
    login: text('进入平台', '進入平台', 'Enter platform'),
    loginHint: text(
      '当前为 UI 预览，账号和密码任意填写即可进入。',
      '目前為 UI 預覽，帳號和密碼任意填寫即可進入。',
      'UI preview: enter any account and password to continue.',
    ),
    guide: text('平台使用说明', '平台使用說明', 'Platform guide'),
    later: text(
      '管理功能将在后续接入。',
      '管理功能將在後續接入。',
      'Management features will be connected later.',
    ),
    documentHint: text(
      '右上角打开本页说明，组件中心按功能分类查看页面需求与组件。',
      '右上角開啟本頁說明，組件中心按功能分類查看頁面需求與組件。',
      'Open the page guide at the top right, or browse page requirements and components by category in the component center.',
    ),
    workspaceHint: text(
      '项目与客户端内容将在后续接入。',
      '專案與用戶端內容將在後續接入。',
      'Project and client content will be connected later.',
    ),
    noMenu: text('没有匹配的菜单', '沒有符合的選單', 'No matching menu items'),
  };
}
