import { afterEach, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { PlatformLocaleProvider } from '@/features/locale/platform-locale';
import { FullscreenPreview } from './FullscreenPreview';
import { useRef, useState } from 'react';

afterEach(cleanup);
function Fixture() {
  const [open, setOpen] = useState(false);
  const [nativeDialog, setNativeDialog] = useState(false);
  const nativeRef = useRef<HTMLDivElement | null>(null);
  return (
    <PlatformLocaleProvider>
      <button onClick={() => setOpen(true)}>Open fullscreen</button>
      <section className="docs_canvas__hFCST">
        <div ref={nativeRef}>
          <input aria-label="Draft" defaultValue="" />
          <button onClick={() => setNativeDialog(true)}>Open native form</button>
          {nativeDialog && (
            <section role="dialog" aria-label="Native form">
              <input aria-label="Native field" />
              <button onClick={() => setNativeDialog(false)}>Close native form</button>
            </section>
          )}
        </div>
      </section>
      <FullscreenPreview
        open={open}
        onOpenChange={setOpen}
        title="Example"
        mobile={false}
        nativeRef={nativeRef}
      />
    </PlatformLocaleProvider>
  );
}
it('preserves one native draft and restores its original parent after fullscreen exit', async () => {
  render(<Fixture />);
  const draft = screen.getByLabelText('Draft'),
    parent = draft.parentElement?.parentElement;
  fireEvent.change(draft, { target: { value: 'Unsubmitted draft' } });
  fireEvent.click(screen.getByText('Open fullscreen'));
  await screen.findByRole('dialog');
  expect(screen.getByLabelText('Draft')).toBe(draft);
  expect(screen.getByRole('dialog')).toContainElement(draft);
  fireEvent.click(screen.getByRole('button', { name: '关闭放大预览' }));
  await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  expect(screen.getByLabelText('Draft')).toBe(draft);
  expect(draft).toHaveValue('Unsubmitted draft');
  expect(draft.parentElement?.parentElement).toBe(parent);
});
it('keeps fullscreen open when a transferred native button opens and edits a nested form', async () => {
  render(<Fixture />);
  fireEvent.click(screen.getByText('Open fullscreen'));
  await screen.findByRole('dialog', { name: 'Example' });
  const button = screen.getByText('Open native form');
  fireEvent.pointerDown(button, { pointerType: 'mouse', button: 0 });
  fireEvent.click(button);
  expect(await screen.findByRole('dialog', { name: 'Native form' })).toBeInTheDocument();
  expect(screen.getByRole('dialog', { name: 'Example' })).toBeInTheDocument();
  const input = screen.getByLabelText('Native field');
  fireEvent.focusIn(input);
  fireEvent.change(input, { target: { value: 'Editing in fullscreen' } });
  expect(input).toHaveValue('Editing in fullscreen');
  expect(screen.getByRole('dialog', { name: 'Example' })).toBeInTheDocument();
  fireEvent.click(screen.getByText('Close native form'));
  expect(screen.getByRole('dialog', { name: 'Example' })).toBeInTheDocument();
});
