/** Registered source is loaded lazily. Backend configuration selects stable
 * keys; it cannot supply JavaScript, HTML, remote URLs or component source. */
import { lazy } from 'react';
const Orders = lazy(() => import('@/features/orders/OrdersPage'));
export function registeredPage(moduleKey: string, pageKey: string) {
  if (moduleKey === 'empty' && pageKey === 'canvas')
    return <div data-prototype-canvas style={{ height: '100%', minHeight: 320 }} />;
  if (moduleKey === 'rental-orders' && pageKey === 'orders') return <Orders />;
  throw new Error('该页面没有已注册的原生模块');
}
