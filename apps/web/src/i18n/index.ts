import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import { readStoredLocale } from '@/features/locale/platform-locale';
import { traditionalToSimplified } from './zh-hans-map';
import chromeZh from './locales/zh-Hant/chrome.json';
import chromeEn from './locales/en/chrome.json';
import homeZh from './locales/zh-Hant/home.json';
import homeEn from './locales/en/home.json';
import workspaceZh from './locales/zh-Hant/workspace.json';
import workspaceEn from './locales/en/workspace.json';
import routesZh from './locales/zh-Hant/routes.json';
import routesEn from './locales/en/routes.json';
import packagesZh from './locales/zh-Hant/packages.json';
import packagesEn from './locales/en/packages.json';
import consoleZh from './locales/zh-Hant/console.json';
import consoleEn from './locales/en/console.json';
import aiZh from './locales/zh-Hant/ai.json';
import aiEn from './locales/en/ai.json';
import healthZh from './locales/zh-Hant/health.json';
import healthEn from './locales/en/health.json';
import docsZh from './locales/zh-Hant/docs.json';
import docsEn from './locales/en/docs.json';
import dialogsZh from './locales/zh-Hant/dialogs.json';
import dialogsEn from './locales/en/dialogs.json';
import commonZh from './locales/zh-Hant/common.json';
import commonEn from './locales/en/common.json';

function mergeResources(...parts: Array<Record<string, unknown>>) {
  return parts.reduce<Record<string, unknown>>((merged, part) => Object.assign(merged, part), {});
}

// zh-Hans 资源由 zh-Hant 运行时做字符级繁→简转换生成：
// 两个语言集永远 key 同步（含复数后缀 key），无需维护第二份简体资源。
function toSimplified(resource: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(resource).map(([key, value]) => [
      key,
      typeof value === 'string' ? traditionalToSimplified(value) : value,
    ]),
  );
}

void i18n.use(initReactI18next).init({
  lng: readStoredLocale(),
  fallbackLng: 'zh-Hant',
  // 资源使用扁平点号 key（'chrome.nav.overview'），关闭 i18next 的嵌套/命名空间分隔解析
  keySeparator: false,
  nsSeparator: false,
  supportedLngs: ['zh-Hant', 'zh-Hans', 'en'],
  interpolation: { escapeValue: false },
  resources: {
    'zh-Hant': {
      translation: mergeResources(
        chromeZh,
        homeZh,
        workspaceZh,
        routesZh,
        packagesZh,
        consoleZh,
        aiZh,
        healthZh,
        docsZh,
        dialogsZh,
        commonZh,
      ),
    },
    en: {
      translation: mergeResources(
        chromeEn,
        homeEn,
        workspaceEn,
        routesEn,
        packagesEn,
        consoleEn,
        aiEn,
        healthEn,
        docsEn,
        dialogsEn,
        commonEn,
      ),
    },
    'zh-Hans': {
      translation: toSimplified(
        mergeResources(
          chromeZh,
          homeZh,
          workspaceZh,
          routesZh,
          packagesZh,
          consoleZh,
          aiZh,
          healthZh,
          docsZh,
          dialogsZh,
          commonZh,
        ),
      ),
    },
  },
});

export default i18n;
