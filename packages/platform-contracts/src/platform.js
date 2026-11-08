/** Native platform protocol; browser inputs cannot grant roles or execute source. */
export const NATIVE_API_PREFIX = '/api/native';
export function nativePublicAssetAllowed(relative) {
  return (
    relative === 'index.html' ||
    /^(assets|brand)\//.test(relative) ||
    relative === 'auth-assets/marcus-johnson.svg'
  );
}
export const NATIVE_MODULES = Object.freeze([
  { key: 'empty', label: '空白工作台', pages: [{ key: 'canvas', label: '工作台' }] },
  { key: 'rental-orders', label: '租赁订单示例', pages: [{ key: 'orders', label: '租赁订单' }] },
  {
    key: 'rimo-native',
    projectId: 'rimo-rental',
    clientId: 'operation',
    contentKey: 'rimo-rental',
    label: 'RIMO 营运原型',
    surface: 'showcase',
    pages: [
      { key: 'vehicle-groups', label: '車組管理', source: 'VehicleGroupsPage.tsx' },
      { key: 'vehicle-transfer', label: '車輛調度', source: 'VehicleTransferPage.tsx' },
    ],
  },
]);
export const NATIVE_ROLES = Object.freeze(['admin', 'member']);
export const PROJECT_ROLES = Object.freeze(['editor', 'viewer']);
export const NATIVE_ID_PATTERN = /^[a-z0-9][a-z0-9-]{1,63}$/;
export function nativePageAllowed(moduleKey, pageKey) {
  return NATIVE_MODULES.some(
    (module) => module.key === moduleKey && module.pages.some((page) => page.key === pageKey),
  );
}
export function nativePageUrl(project, clientId, pageKey) {
  const prefix =
    NATIVE_MODULES.find((module) => module.key === project.moduleKey)?.surface === 'showcase'
      ? '/pages'
      : '/p';
  return `${prefix}/${project.id}/${clientId}/${pageKey}`;
}
