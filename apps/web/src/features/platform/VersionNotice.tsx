/** New builds are offered explicitly; forms and following sessions never auto-refresh. */
import { useEffect, useState } from 'react';
import { Alert } from '@preview/ui/admin';
import { Button } from '@preview/ui/admin';
declare const __PREVIEW_BUILD_ID__: string;
export function VersionNotice() {
  const [newVersion, setNewVersion] = useState(false);
  useEffect(() => {
    let cancelled = false;
    const check = async () => {
      try {
        const response = await fetch('/brand/version.json', { cache: 'no-store' });
        if (!response.ok) return;
        const version = await response.json();
        if (
          !cancelled &&
          typeof __PREVIEW_BUILD_ID__ !== 'undefined' &&
          version.buildId !== __PREVIEW_BUILD_ID__
        )
          setNewVersion(true);
      } catch {
        /* Poll failures don't replace the active application. */
      }
    };
    const timer = setInterval(() => {
      void check();
    }, 30000);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, []);
  return newVersion ? (
    <Alert
      banner
      type="info"
      title="有新版本可用，请保存当前修改并退出跟随后刷新"
      action={
        <Button size="small" onClick={() => window.location.reload()}>
          刷新到新版
        </Button>
      }
    />
  ) : null;
}
