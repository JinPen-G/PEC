import type { ReactNode } from 'react';
import { useNativeAuth } from '@/features/platform/platform-api';
import { RestProvider } from './RestProvider';

export function RestIdentityScope({ children }: { children: ReactNode }) {
  const { session } = useNativeAuth();
  const identity = `${session?.user?.id ?? 'anonymous'}/${session?.user?.role ?? ''}/${session?.user?.revision ?? 0}`;
  return <RestProvider key={identity}>{children}</RestProvider>;
}
