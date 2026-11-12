import { createElement } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, useNavigate } from 'react-router-dom';
import { RimoPage } from '../../apps/web/src/project-modules/rimo-rental/RimoPage.tsx';
import { useRimoModel } from '../../packages/component-library/src/rimo-rental/lib/rimo-model.js';

vi.mock('@preview/ui/admin', () => ({
  AdminFeedbackProvider: ({ children }) => children,
  App: { useApp: () => ({ message: { info: vi.fn() }, modal: { confirm: vi.fn() } }) },
}));
vi.mock('@/features/showcase/showcase-locale', () => ({ useShowcaseText: () => value => value }));
afterEach(cleanup);

const state = model => {
  const parameters = new URLSearchParams(model.window.location.search);
  return { identity: model.cell(parameters.get('id')), billing: model.cell(parameters.get('billing') ?? 'self'), draft: model.cell('') };
};
function Probe() {
  const model = useRimoModel(state);
  return createElement('section', {},
    createElement('output', {}, `${model.view.identity}/${model.view.billing}`),
    createElement('input', { 'aria-label': 'Draft', value: model.view.draft, onChange: event => model.write(['draft'], event.target.value) }),
  );
}
function Frame() {
  const navigate = useNavigate();
  const path = '/pages/rimo-rental/operation/order-detail';
  return createElement('section', {},
    createElement('button', { onClick: () => navigate(`${path}?id=B&billing=monthly`) }, 'Next order'),
    createElement('button', { onClick: () => navigate(`${path}?document=requirements/order.md&id=A&anchor=rules`) }, 'Read requirements'),
    createElement(RimoPage, { pageKey: 'order-detail', clientId: 'operation', assets: {}, routes: {} }, createElement(Probe)),
  );
}
const mount = () => render(createElement(MemoryRouter, { initialEntries: ['/pages/rimo-rental/operation/order-detail?id=A'] }, createElement(Frame)));

describe('RIMO page business context', () => {
  it('loads a new order and its funds context when the business URL changes', () => {
    mount();
    fireEvent.change(screen.getByLabelText('Draft'), { target: { value: 'A draft' } });
    fireEvent.click(screen.getByRole('button', { name: 'Next order' }));
    expect(screen.getByText('B/monthly')).toBeInTheDocument();
    expect(screen.getByLabelText('Draft')).toHaveValue('');
  });

  it('preserves the current draft when navigating to a document or section', () => {
    mount();
    const draft = screen.getByLabelText('Draft');
    fireEvent.change(draft, { target: { value: 'A draft' } });
    fireEvent.click(screen.getByRole('button', { name: 'Read requirements' }));
    expect(screen.getByText('A/self')).toBeInTheDocument();
    expect(screen.getByLabelText('Draft')).toBe(draft);
    expect(draft).toHaveValue('A draft');
  });
});
