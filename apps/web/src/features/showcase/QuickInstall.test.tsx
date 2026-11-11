import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QuickInstall } from './QuickInstall';
import type { ComponentRegistryReference } from '../../../../../packages/platform-contracts/src/component-registry';

vi.mock('./showcase-locale', () => ({ useShowcaseText: () => (value: string) => value }));
const copy = vi.fn();
const registry: ComponentRegistryReference = {
  name: 'vehicle-groups',
  kind: 'block',
  url: '/r/rental/vehicle-groups.json',
};
beforeEach(() => {
  copy.mockReset().mockResolvedValue(undefined);
  vi.stubGlobal('navigator', { clipboard: { writeText: copy } });
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

it('copies the complete registered command and switches to the current project without stale feedback', async () => {
  const view = render(<QuickInstall registry={registry} publicPage />);
  const command = `npx shadcn@latest add ${window.location.origin}${registry.url}`;
  expect(screen.getByRole('group', { name: '安装区块' })).toHaveTextContent(command);
  fireEvent.click(screen.getByRole('button', { name: '复制区块安装命令' }));
  await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('已复制'));
  expect(copy).toHaveBeenLastCalledWith(command);
  const component = { ...registry, kind: 'component' as const, url: '/r/components/vehicle-groups.json' };
  view.rerender(<QuickInstall registry={component} publicPage />);
  expect(screen.getByRole('status')).toBeEmptyDOMElement();
  expect(screen.getByRole('group', { name: '安装组件' })).not.toHaveTextContent('/r/rental/');
  fireEvent.click(screen.getByRole('button', { name: '复制组件安装命令' }));
  await waitFor(() =>
    expect(copy).toHaveBeenLastCalledWith(`npx shadcn@latest add ${window.location.origin}${component.url}`),
  );
});

it('does not offer an anonymous command for unregistered or restricted content', () => {
  const view = render(<QuickInstall publicPage />);
  expect(screen.queryByRole('group')).toBeNull();
  view.rerender(<QuickInstall registry={registry} publicPage={false} />);
  expect(screen.queryByRole('button')).toBeNull();
  expect(copy).not.toHaveBeenCalled();
});

it('reports clipboard failure and permits retry without reporting false success', async () => {
  copy.mockRejectedValueOnce(new Error('denied'));
  render(<QuickInstall registry={registry} publicPage />);
  fireEvent.click(screen.getByRole('button', { name: '复制区块安装命令' }));
  await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('复制失败，请检查剪贴板权限'));
  expect(screen.queryByText('已复制')).toBeNull();
  fireEvent.click(screen.getByRole('button', { name: '复制区块安装命令' }));
  await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('已复制'));
});
