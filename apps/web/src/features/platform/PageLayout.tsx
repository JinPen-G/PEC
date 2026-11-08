import type { ReactNode } from 'react';
import { Alert } from '@preview/ui/admin';
import { Button } from '@preview/ui/admin';
export function QueryFailure({ message, retry }: { message: string; retry?: () => void }) {
  return (
    <Alert type="error" showIcon title={message} action={retry && <Button onClick={retry}>重试</Button>} />
  );
}
export function PageHeading({ title, actions }: { title: string; actions?: ReactNode }) {
  return (
    <header className="native-page-heading">
      <h1>{title}</h1>
      {actions}
    </header>
  );
}
