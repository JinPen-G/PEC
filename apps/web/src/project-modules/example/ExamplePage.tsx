/** Inject platform controls while keeping demonstration state scoped to this page. */
import { Fragment, useCallback, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import * as controls from '@preview/ui/admin';
import { RimoEnvironmentProvider } from '@preview/library/example/lib/RimoEnvironment.jsx';
import { useShowcaseText } from '@/features/showcase/showcase-locale';

function ExampleView({ children }: { children: ReactNode }) {
  const location = useLocation();
  const text = useShowcaseText();
  const feedback = controls.App.useApp();
  const parameters = new URLSearchParams(location.search);
  parameters.delete('document');
  parameters.delete('anchor');
  parameters.sort();
  const contentKey = `${location.pathname}?${parameters}`;
  const asset = useCallback((value: string) => (/^(data:|blob:)/.test(value) ? value : ''), []);
  const navigate = useCallback(() => {
    void feedback.message.info(text('演示操作不连接真实业务服务。'));
  }, [feedback.message, text]);
  const notify = useCallback(
    (type: string, message: string) => {
      if (type === 'loading') return feedback.message.loading(text(message), 0);
      const method =
        type === 'success' ? 'success' : type === 'error' ? 'error' : type === 'warning' ? 'warning' : 'info';
      void feedback.message[method](text(message));
    },
    [feedback.message, text],
  );
  const confirm = useCallback(
    (message: string, title?: string) =>
      new Promise((resolve, reject) =>
        feedback.modal.confirm({
          title: text(title ?? '确认操作'),
          content: text(message),
          onOk: () => resolve(true),
          onCancel: () => reject(new Error('cancel')),
        }),
      ),
    [feedback.modal, text],
  );
  return (
    <RimoEnvironmentProvider
      controls={controls}
      text={text}
      navigate={navigate}
      search={location.search}
      asset={asset}
      notify={notify}
      confirm={confirm}
    >
      <Fragment key={contentKey}>{children}</Fragment>
    </RimoEnvironmentProvider>
  );
}

export function ExamplePage({ children }: { children: ReactNode }) {
  return (
    <controls.AdminFeedbackProvider>
      <ExampleView>{children}</ExampleView>
    </controls.AdminFeedbackProvider>
  );
}
