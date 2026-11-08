/** Host-only UI context. This identity resets local table selection; it confers
 * no permissions and never reads Rental OS stores, sessions or services. */
import { createContext, useCallback, useContext, useLayoutEffect, type ReactNode } from 'react';
import {
  applyAdminRadiusTokens,
  applyAdminTypographyTokens,
  ARC_DEFAULT_RADII,
} from './runtime/apps/admin/src/app/designTokens';

type UiIdentity = { user?: { id: string }; tenant?: { tenantId: string }; currentWorkspaceId?: string };
type Translator = (key: string, variables?: Record<string, string | number>) => string;
const english: Record<string, string> = {
  加载中: 'Loading',
  操作: 'Actions',
  暂无数据: 'No data',
  选择选项: 'Select an option',
  清空选择: 'Clear selection',
  提示: 'Notice',
  确定: 'Confirm',
  取消: 'Cancel',
  关闭: 'Close',
  分页: 'Pagination',
  每页条数: 'Rows per page',
  页: 'page',
  跳至页码: 'Go to page',
  跳转: 'Go',
  升序: 'Ascending',
  降序: 'Descending',
  取消排序: 'Clear sorting',
  隐藏此列: 'Hide column',
  列选项: 'Column options',
  显示列: 'View',
  显示或隐藏列: 'Show or hide columns',
  '搜索列…': 'Search columns…',
  没有匹配的列: 'No matching columns',
  排序: 'Sort',
  清除: 'Clear',
  清除排序: 'Clear sorting',
  添加排序: 'Add sort',
  选择当前页: 'Select this page',
  选择: 'Select',
  展开详情: 'Expand details',
  收起详情: 'Collapse details',
  已选择: 'Selected',
  清除选择: 'Clear selection',
  操作提示: 'Notifications',
  刷新: 'Refresh',
  搜索: 'Search',
  筛选: 'Filter',
  导出: 'Export',
  导入: 'Import',
  列表视图: 'List view',
  卡片视图: 'Card view',
  '列 {index}': 'Column {index}',
  批量操作: 'Bulk actions',
  暂无符合条件的记录: 'No matching records',
  正在加载: 'Loading',
};
type Radii = { container: number; button: number; input: number };
const Context = createContext({
  locale: 'zh-CN',
  reducedMotion: false,
  identity: '',
  radii: ARC_DEFAULT_RADII as Radii,
  t: ((key: string) => key) as Translator,
});
let currentIdentity: UiIdentity = {};

export function ControlEnvironmentProvider({
  locale = 'zh-Hans',
  reducedMotion = false,
  identity = '',
  radii = ARC_DEFAULT_RADII,
  translate,
  children,
}: {
  locale?: string;
  reducedMotion?: boolean;
  identity?: string;
  radii?: Radii;
  translate?: Translator;
  children: ReactNode;
}) {
  const { container, button, input } = radii;
  const t = useCallback<Translator>(
    (key, variables) => {
      let value = translate?.(key) ?? key;
      if (value === key && locale === 'en') value = english[key] ?? key;
      for (const [name, replacement] of Object.entries(variables ?? {}))
        value = value.replaceAll(`{${name}}`, String(replacement));
      return value;
    },
    [locale, translate],
  );
  useLayoutEffect(() => {
    const target = document.documentElement;
    const previous = new Map(
      Array.from(target.style).map((key) => [key, target.style.getPropertyValue(key)]),
    );
    applyAdminTypographyTokens(target);
    applyAdminRadiusTokens(target, { container, button, input });
    const assigned = new Map(
      Array.from(target.style)
        .filter((key) => key.startsWith('--rental-'))
        .map((key) => [key, target.style.getPropertyValue(key)]),
    );
    return () => {
      for (const [key, value] of assigned)
        if (target.style.getPropertyValue(key) === value) {
          if (previous.has(key)) target.style.setProperty(key, previous.get(key)!);
          else target.style.removeProperty(key);
        }
    };
  }, [container, button, input]);
  useLayoutEffect(() => {
    const previous = currentIdentity;
    const next = identity ? { user: { id: identity } } : {};
    currentIdentity = next;
    return () => {
      if (currentIdentity === next) currentIdentity = previous;
    };
  }, [identity]);
  return (
    <Context.Provider value={{ locale: locale === 'en' ? 'en' : 'zh-CN', reducedMotion, identity, radii, t }}>
      {children}
    </Context.Provider>
  );
}
export function ControlIdentityScope({ identity, children }: { identity: string; children: ReactNode }) {
  const environment = useContext(Context);
  return (
    <ControlEnvironmentProvider {...environment} translate={environment.t} identity={identity}>
      {children}
    </ControlEnvironmentProvider>
  );
}
export const useLocale = () => useContext(Context);
export const usePrefersReducedMotion = () => useContext(Context).reducedMotion;
export const useAuthStore = Object.assign(
  function useUiIdentity<T>(selector: (state: UiIdentity) => T): T {
    const { identity } = useContext(Context);
    return selector(identity ? { user: { id: identity } } : {});
  },
  { getState: () => currentIdentity },
);

/** The imported optional Copilot action is unavailable in Preview. */
export function useCopilot(): {
  available: boolean;
  add: (records: unknown[], open: boolean) => void;
} | null {
  return null;
}
export function readSelection(_host: HTMLElement, _pathname: string): unknown[] {
  throw new Error('Copilot is not connected to Preview');
}
