import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { PlatformLocaleProvider } from '@/features/locale/platform-locale';
import { ScreenWorkspace } from './ScreenWorkspace';
import { useState } from 'react';
import { Modal, Button } from '@preview/ui/admin';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const page = {
  projectId: 'rental', projectName: 'Rental', clientId: 'operation', clientName: 'Operation',
  pageKey: 'vehicles', title: 'Vehicles', category: 'Operation · Fleet', kind: 'page' as const,
  access: 'public' as const, allowed: true,
};
vi.mock('@/features/platform/platform-api', () => ({ useNativeAuth: () => ({ session: null }) }));
vi.mock('@/features/theme/platform-theme', () => ({ usePlatformTheme: () => ({ resolvedMode: 'light' }) }));
vi.mock('@/features/motion/use-motion-preference', () => ({ usePrefersReducedMotion: () => true }));
vi.mock('./showcase-catalog', () => ({ useShowcasePages: () => ({ data: { pages: [
  page,
  { ...page, pageKey: 'stations', title: 'Stations' },
  { ...page, pageKey: 'restricted', title: 'Restricted', allowed: false },
  { ...page, clientId: 'company', pageKey: 'employees', title: 'Employees' },
  { ...page, kind: 'component', pageKey: 'button', title: 'Button' },
] } }) }));
function Location() { return <output aria-label="Current URL">{useLocation().pathname}</output>; }

beforeEach(() => {
  Object.defineProperty(Element.prototype, 'getAnimations', { configurable: true, value: () => [] });
  Object.defineProperty(Element.prototype, 'animate', { configurable: true,
    value: () => ({ finished: Promise.resolve(), cancel() {}, finish() {}, addEventListener() {} }),
  });
});

it('keeps business dialogs inside the scaled screen and restores their trigger', async () => {
  function Business() {
    const [open, setOpen] = useState(false);
    return <><Button onClick={() => setOpen(true)}>Open business dialog</Button>
      <Modal title="Business dialog" open={open} onCancel={() => setOpen(false)} footer={null}>
        <input aria-label="Dialog draft" defaultValue="Keep this" />
      </Modal></>;
  }
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const view = render(<QueryClientProvider client={client}><MemoryRouter><PlatformLocaleProvider>
    <ScreenWorkspace page={page} compact={false}><Business /></ScreenWorkspace>
  </PlatformLocaleProvider></MemoryRouter></QueryClientProvider>);
  fireEvent.click(screen.getByRole('button', { name: 'Open business dialog' }));
  const dialog = await screen.findByRole('dialog', { name: 'Business dialog' });
  expect(view.container.querySelector('.showcase-screen-portals')).toContainElement(dialog);
  expect(screen.getByRole('textbox', { name: 'Dialog draft' })).toHaveValue('Keep this');
  fireEvent.click(screen.getByRole('button', { name: '关闭' }));
  await waitFor(() => expect(screen.queryByRole('dialog', { name: 'Business dialog' })).not.toBeInTheDocument());
  client.clear();
});
afterEach(() => {
  cleanup();
  delete (Element.prototype as { getAnimations?: unknown }).getAnimations;
  delete (Element.prototype as { animate?: unknown }).animate;
});

it('keeps the full application navigation mounted across preview sizes without adding a right-side panel', async () => {
  const content = <input aria-label="Business draft" defaultValue="" />;
  const frame = (compact: boolean) => <MemoryRouter initialEntries={['/pages/rental/operation/vehicles']}>
    <PlatformLocaleProvider><ScreenWorkspace page={page} compact={compact}>{content}</ScreenWorkspace><Location /></PlatformLocaleProvider>
  </MemoryRouter>;
  const view = render(frame(false));
  expect(view.container.querySelector('.preview-screen-brand')?.textContent).toBe('Rental');
  expect(view.container.querySelector('.preview-screen-brand button')).toHaveAttribute('aria-label', '收起侧栏');
  expect(screen.getByRole('link', { name: 'Vehicles' })).toHaveAttribute('aria-current', 'page');
  expect(screen.getByRole('link', { name: 'Stations' })).toHaveAttribute('href', '#/pages/rental/operation/stations');
  expect(screen.queryByRole('link', { name: 'Restricted' })).not.toBeInTheDocument();
  expect(screen.queryByRole('link', { name: 'Employees' })).not.toBeInTheDocument();
  expect(screen.queryByRole('link', { name: 'Button' })).not.toBeInTheDocument();
  expect(screen.queryByRole('button', { name: '本页文档' })).not.toBeInTheDocument();
  const input = screen.getByRole('textbox', { name: 'Business draft' });
  fireEvent.change(input, { target: { value: 'Keep the draft' } });
  view.rerender(frame(true));
  expect(view.container.querySelector('.preview-screen-sidebar')).toHaveAttribute('hidden');
  fireEvent.click(screen.getByRole('button', { name: '展开侧栏' }));
  await waitFor(() => expect(screen.getByRole('link', { name: 'Stations' })).toBeVisible());
  expect(screen.getByRole('textbox', { name: 'Business draft' })).toBe(input);
  expect(input).toHaveValue('Keep the draft');
  fireEvent.click(screen.getByRole('link', { name: 'Stations' }));
  expect(screen.getByLabelText('Current URL')).toHaveTextContent('/pages/rental/operation/stations');
});
