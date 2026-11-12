/** RIMO display adapter: business URL changes reset content; document navigation preserves drafts. */
import { Fragment, useCallback, type ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import * as controls from '@preview/ui/admin';
import { RimoEnvironmentProvider } from '@preview/library/rimo-rental/lib/RimoEnvironment.jsx';
import { useShowcaseText } from '@/features/showcase/showcase-locale';
type RimoPageProps = {
  pageKey: string;
  clientId: string;
  assets: Record<string, string>;
  routes: Record<string, { clientId: string; pageKey: string }>;
  children: ReactNode;
};

function RimoView({ pageKey, clientId, assets, routes, children }: RimoPageProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const text = useShowcaseText();
  const feedback = controls.App.useApp();
  const parts = location.pathname.split('/');
  const projectId = parts[2] || 'rimo-rental';
  const prefix = ['pages','demo','p'].includes(parts[1]) ? `/${parts[1]}` : '/pages';
  const businessParameters = new URLSearchParams(location.search);
  businessParameters.delete('document');
  businessParameters.delete('anchor');
  businessParameters.sort();
  const contentKey = `${projectId}/${clientId}/${pageKey}?${businessParameters}`;
  const asset = useCallback((value: string) => {
    if (!value || /^(data:|blob:)/.test(value)) return value;
    const normalized = (/^https?:\/\//i.test(value) ? new URL(value).pathname.slice(1) : value).replaceAll('\\', '/').replace(/^\.\//, '');
    const resolved = assets[normalized] ?? assets[normalized.split('/').at(-1) ?? ''];
    return resolved ? `/api/native/showcase/${projectId}/${clientId}/${pageKey}/asset?path=${encodeURIComponent(resolved)}` : '';
  }, [assets, clientId, projectId, pageKey]);
  const route = useCallback((value: string) => {
    const [address, search] = String(value).split('?');
    const normalized = address.replaceAll('\\', '/').replace(/^\.\//, '');
    const candidate = routes[normalized] ?? routes[normalized.split('/').at(-1) ?? ''];
    if (candidate) navigate(`${prefix}/${projectId}/${candidate.clientId}/${candidate.pageKey}${search ? `?${search}` : ''}`);
    else feedback.message.info(text('演示操作不连接真实业务服务。'));
  }, [routes, prefix, projectId, navigate, feedback.message, text]);
  const notify = useCallback((type: string, message: string) => {
    if (type === 'loading') return feedback.message.loading(text(message), 0);
    const method = type === 'success' ? 'success' : type === 'error' ? 'error' : type === 'warning' ? 'warning' : 'info';
    void feedback.message[method](text(message));
  }, [feedback.message, text]);
  const confirm = useCallback((message: string, title?: string) => new Promise((resolve, reject) => feedback.modal.confirm({
    title: text(title ?? '确认操作'), content: text(message), onOk: () => resolve(true), onCancel: () => reject(new Error('cancel')),
  })), [feedback.modal, text]);
  return <RimoEnvironmentProvider controls={controls} text={text} navigate={route} search={location.search} asset={asset} notify={notify} confirm={confirm}><Fragment key={contentKey}>{children}</Fragment></RimoEnvironmentProvider>;
}
export function RimoPage(props: RimoPageProps) {
  return <controls.AdminFeedbackProvider><RimoView {...props} /></controls.AdminFeedbackProvider>;
}
