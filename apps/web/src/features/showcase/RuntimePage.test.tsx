import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { RuntimePage } from './RuntimePage';

const query = vi.hoisted(() => vi.fn());
vi.mock('@tanstack/react-query', () => ({ useQuery: query }));
vi.mock('./showcase-locale', () => ({ useShowcaseText: () => (value: string) => value }));
vi.mock('@preview/ui/loading', () => ({ LoadingStage: () => <span>Loading preview</span> }));
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

it('starts page styles while the authorized runtime entry loads', () => {
  query.mockReturnValue({ data: undefined, error: null });
  render(<RuntimePage entry="/page-assets/items.js" styles={['/page-assets/items.css']} />);
  expect(document.querySelector('link[rel="stylesheet"][href="/page-assets/items.css"]')).toBeInTheDocument();
  expect(screen.getByText('Loading preview')).toBeInTheDocument();
  expect(query.mock.calls[0][0]).toMatchObject({
    queryKey: ['page-runtime', '/page-assets/items.js'],
    staleTime: Infinity,
    retry: false,
  });
});

it('does not rerender the business tree when its authorized entry and styles are unchanged', () => {
  const page = vi.fn(() => <input aria-label="Draft" defaultValue="Kept" />);
  query.mockReturnValue({ data: { default: page }, error: null });
  const styles = ['/page-assets/items.css'];
  const view = render(<RuntimePage entry="/page-assets/items.js" styles={styles} />);
  const input = screen.getByLabelText('Draft');
  view.rerender(<RuntimePage entry="/page-assets/items.js" styles={styles} />);
  expect(page).toHaveBeenCalledTimes(1);
  expect(screen.getByLabelText('Draft')).toBe(input);
  query.mockReturnValue({ data: undefined, error: new Error('Permission changed') });
  view.rerender(<RuntimePage entry="/page-assets/items-updated.js" styles={styles} />);
  expect(screen.getByText(/Permission changed/)).toBeInTheDocument();
  expect(screen.queryByLabelText('Draft')).not.toBeInTheDocument();
});
