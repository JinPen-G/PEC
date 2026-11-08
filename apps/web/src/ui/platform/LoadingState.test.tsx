import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, expect, test } from 'vitest';
import { LoadingStage } from '@preview/ui/loading';
afterEach(cleanup);
test('all loading scopes expose the original nine-cell Rental OS indicator', () => {
  const { container, rerender } = render(<LoadingStage scope="screen" label="连接平台" />);
  expect(screen.getByRole('status')).toHaveAttribute('aria-busy', 'true');
  expect(screen.getByRole('status')).toHaveTextContent('连接平台');
  expect(container.querySelectorAll('.rental-loading-cell')).toHaveLength(9);
  expect(container.querySelector('.auth-loader')).toBeInTheDocument();
  rerender(<LoadingStage scope="page" label="读取项目" />);
  expect(container.querySelector('.route-loader')).toBeInTheDocument();
  expect(screen.getByRole('status')).toHaveTextContent('读取项目');
  expect(container.querySelectorAll('.rental-loading-cell')).toHaveLength(9);
});
