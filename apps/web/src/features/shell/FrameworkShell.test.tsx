import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import { FrameworkShell, UiEnvironmentProvider, type FrameworkShellProps } from '@preview/ui';

const labels = {
  search: 'Search menu', collapse: 'Collapse sidebar', expand: 'Expand sidebar',
  breadcrumb: 'Current location', projects: 'Projects', account: 'Account',
  appearance: 'Appearance', center: 'Screens', noMenu: 'No matching menu',
};

function mount(overrides: Partial<FrameworkShellProps> = {}) {
  const props: FrameworkShellProps = {
    title: 'Preview', subtitle: 'Rental', brand: <span>Brand</span>,
    workspaces: [{ key: 'rental', label: 'Rental', icon: null }], workspaceKey: 'rental',
    onWorkspaceChange: vi.fn(), navigationMode: 'components', onNavigationModeChange: vi.fn(),
    showNavigationModeSwitch: false, showDocumentControl: false,
    account: 'Reviewer', accountDescription: 'reviewer@example.test',
    sections: [
      { key: 'fleet', label: 'Fleet', icon: null, routes: [{ key: '/vehicles', label: 'Vehicles', icon: null }] },
      { key: 'orders', label: 'Orders', icon: null, routes: [{ key: '/orders', label: 'Reservations', icon: null }] },
    ],
    selectedKey: '/vehicles', onNavigate: vi.fn(), preference: 'glass', onThemeChange: vi.fn(),
    locale: 'en', onLocaleChange: vi.fn(), documentAvailable: false, documentOpen: false,
    onDocumentToggle: vi.fn(), labels, children: <input aria-label="Page draft" defaultValue="Keep this" />,
    ...overrides,
  };
  const view = render(<UiEnvironmentProvider dark={false} reducedMotion><FrameworkShell {...props} /></UiEnvironmentProvider>);
  return { ...view, props };
}

beforeEach(() => {
  Object.defineProperty(Element.prototype, 'getAnimations', { configurable: true, value: () => [] });
  Object.defineProperty(Element.prototype, 'animate', { configurable: true,
    value: () => ({ finished: Promise.resolve(), cancel() {}, finish() {}, addEventListener() {} }),
  });
});
afterEach(() => {
  cleanup();
  delete (Element.prototype as { getAnimations?: unknown }).getAnimations;
  delete (Element.prototype as { animate?: unknown }).animate;
});

test('both standalone consumers receive the console style scope and the fine breadcrumb arrow', () => {
  const view = mount();
  expect(view.container.querySelector('.preview-native-stage')).toHaveClass('preview-console-host');
  const breadcrumb = screen.getByRole('navigation', { name: 'Current location' });
  expect(breadcrumb).toHaveTextContent('FleetVehicles');
  expect(breadcrumb).not.toHaveTextContent('/');
  expect(breadcrumb.querySelector('.preview-breadcrumb-separator')).toHaveAttribute('width', '13');
  expect(breadcrumb.querySelector('.preview-breadcrumb-separator')).toHaveAttribute('stroke-width', '1.75');
  expect(breadcrumb.querySelector('[aria-current="page"]')).toHaveTextContent('Vehicles');
  expect(view.container.querySelector('.preview-context-location [data-slot="sidebar-trigger"]')).toBeNull();
  expect(view.container.querySelector('.preview-context-time time')).toBeInTheDocument();
});

test('a single workspace has no misleading dropdown', () => {
  mount();
  expect(screen.getByRole('group', { name: 'Preview · Rental' })).toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'Preview · Rental' })).not.toBeInTheDocument();
});

test('collapsing retains submenu nodes and the page draft; rail search expands and focuses the original field', async () => {
  const view = mount();
  fireEvent.click(screen.getByRole('button', { name: 'Orders' }));
  const vehicles = screen.getByRole('link', { name: 'Vehicles' });
  const reservations = screen.getByRole('link', { name: 'Reservations' });
  const search = screen.getByRole('searchbox', { name: 'Search menu' });
  const draft = screen.getByRole('textbox', { name: 'Page draft' });
  fireEvent.change(draft, { target: { value: 'Keep edited draft' } });
  fireEvent.click(screen.getByRole('button', { name: 'Collapse sidebar' }));
  await waitFor(() => expect(view.container.querySelector('[data-slot="sidebar"]')).toHaveAttribute('data-state', 'collapsed'));
  expect(vehicles.isConnected).toBe(true);
  expect(reservations.isConnected).toBe(true);
  expect(vehicles.closest('[inert]')).not.toBeNull();
  expect(screen.queryByRole('searchbox', { name: 'Search menu' })).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Search menu' }));
  await waitFor(() => expect(search).toHaveFocus());
  expect(screen.getByRole('link', { name: 'Vehicles' })).toBe(vehicles);
  expect(screen.getByRole('link', { name: 'Reservations' })).toBe(reservations);
  expect(draft).toHaveValue('Keep edited draft');
});

test('workspace switching keeps the host callback and clears the menu query', async () => {
  const view = mount({ workspaces: [
    { key: 'rental', label: 'Rental', icon: null },
    { key: 'library', label: 'Component center', icon: null },
  ] });
  fireEvent.change(screen.getByRole('searchbox', { name: 'Search menu' }), { target: { value: 'Vehicle' } });
  fireEvent.click(screen.getByRole('button', { name: 'Preview · Rental' }));
  fireEvent.click(await screen.findByRole('menuitem', { name: 'Component center' }));
  expect(view.props.onWorkspaceChange).toHaveBeenCalledExactlyOnceWith('library');
  expect(screen.getByRole('searchbox', { name: 'Search menu' })).toHaveValue('');
});

test('embedded Screens retain their own frame rather than receiving the standalone console scope', () => {
  const view = mount({ embedded: true });
  expect(view.container.querySelector('.preview-native-stage')).toHaveClass('preview-screen-stage');
  expect(view.container.querySelector('.preview-console-host')).toBeNull();
  expect(view.container.querySelector('.preview-context-time')).toBeNull();
  expect(within(view.container.querySelector('.preview-screen-brand') as HTMLElement).getByRole('button', { name: 'Collapse sidebar' })).toBeInTheDocument();
});

test('Chinese menu groups retain unique disclosure targets', () => {
  const view = mount({ sections: [
    { key: '车辆管理', label: 'Fleet', icon: null, routes: [{ key: '/vehicles', label: 'Vehicles', icon: null }] },
    { key: '订单管理', label: 'Orders', icon: null, routes: [{ key: '/orders', label: 'Reservations', icon: null }] },
  ] });
  const fleet = screen.getByRole('button', { name: 'Fleet' }).getAttribute('aria-controls');
  const orders = screen.getByRole('button', { name: 'Orders' }).getAttribute('aria-controls');
  expect(fleet).not.toBe(orders);
  expect(view.container.querySelectorAll('.rental-sidebar-submenu-motion')).toHaveLength(2);
  expect(document.getElementById(fleet as string)).toHaveAttribute('aria-label', 'Fleet');
  expect(document.getElementById(orders as string)).toHaveAttribute('aria-label', 'Orders');
});
