import { expect, test, vi } from 'vitest';
import type { NativeProject } from './platform-api';
import { centerCategories, centerUrl, componentCenterItems } from './component-center';

vi.mock('../../../../../packages/platform-contracts/src/platform', async (original) => ({
  ...(await original<object>()),
  NATIVE_MODULES: [
    { key: 'center-fixture', pages: [{ key: 'page' }, { key: 'component', kind: 'component' }] },
  ],
}));

test('code registration separates components from pages while retaining menu order and publication status', () => {
  const project = {
    id: 'sample-project',
    moduleKey: 'center-fixture',
    clients: [
      {
        id: 'secondary',
        name: '第二端',
        enabled: false,
        position: 1,
        pages: [{ key: 'page', label: '另一个页面', group: '', position: 0, visible: true }],
      },
      {
        id: 'operation',
        name: '营运端',
        enabled: true,
        position: 0,
        pages: [
          {
            key: 'page',
            label: '车辆列表',
            group: '车辆管理',
            position: 1,
            visible: false,
            access: 'restricted',
          },
          {
            key: 'component',
            label: '车辆选择器',
            group: '车辆管理',
            position: 0,
            visible: true,
            access: 'public',
          },
        ],
      },
    ],
  } as NativeProject;
  const items = componentCenterItems(project);
  expect(items.map((item) => [item.title, item.kind, item.visible])).toEqual([
    ['车辆选择器', 'components', true],
    ['车辆列表', 'requirements', false],
    ['另一个页面', 'requirements', false],
  ]);
  expect(centerCategories(items)).toEqual(['车辆管理', '第二端']);
  expect(items[0].href).toBe('/p/sample-project/operation/component');
  expect(items[0].id).not.toBe(items[2].id);
  const route = centerUrl(project.id, 'components', '车辆管理 & 调度');
  expect(new URLSearchParams(route.split('?')[1]).get('category')).toBe('车辆管理 & 调度');
});
