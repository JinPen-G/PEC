import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// 觀察期保留的 i18n 基礎設施：當前平臺只提供簡體中文，界面沒有語言入口，
// 因此 main.tsx 不再預先加載本模塊，避免把 i18next 打進首屏。
// 真正啓用多語言時，在 main.tsx 頂部 `import './i18n';` 即可恢復初始化。
void i18n.use(initReactI18next).init({
  lng: 'zh-CN',
  fallbackLng: 'zh-CN',
  interpolation: { escapeValue: false },
  resources: {
    'zh-CN': {
      translation: {
        platformName: '項目原型與資料協作平臺',
      },
    },
  },
});

export default i18n;
