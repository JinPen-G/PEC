import * as Dialog from '@radix-ui/react-dialog';
import type { ComponentProps } from 'react';
import { useScreenPortal } from './screen-portal';

export * from '@radix-ui/react-dialog';
export function Portal({ container, ...props }: ComponentProps<typeof Dialog.Portal>) {
  const screen = useScreenPortal();
  return <Dialog.Portal {...props} container={container ?? screen} />;
}
