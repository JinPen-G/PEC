import { fireEvent, render, screen } from '@testing-library/react';
import { expect, test, vi } from 'vitest';
import { SourcePanel } from './SourcePanel';

vi.mock('./showcase-locale', () => ({ useShowcaseText: () => (value: string) => value }));

test('short terminal commands retain their full URL without a code fade or JavaScript comment styling', () => {
  const command = 'pnpm dlx shadcn@latest add https://preview.example/r/demo/block.json';
  const view = render(<SourcePanel source={command} fileName="Terminal" plain />);
  expect(view.container.querySelector('code')?.textContent).toContain(command);
  expect(view.container.querySelector('.docs_codeCollapsed__Zv72M')).toBeNull();
  expect(view.container.querySelector('.docs_tokenComment__ZIOcz')).toBeNull();
  expect(screen.queryByRole('button', { name: /展开全部源码/ })).toBeNull();
});

test('long source alone is truncated and can expand to reveal all lines', () => {
  const source = Array.from({ length: 30 }, (_, index) => `line-${index}`).join('\n');
  const view = render(<SourcePanel source={source} fileName="Block.tsx" />);
  expect(view.container.querySelector('.docs_codeCollapsed__Zv72M')).not.toBeNull();
  expect(view.container.querySelector('code')?.textContent).not.toContain('line-29');
  fireEvent.click(screen.getByRole('button', { name: /展开全部源码/ }));
  expect(view.container.querySelector('.docs_codeCollapsed__Zv72M')).toBeNull();
  expect(view.container.querySelector('code')?.textContent).toContain('line-29');
});
