/** Only an explicitly trusted loopback proxy can supply a single client address. */
import { isIP } from 'node:net';

export function clientAddress(request, trustLoopbackProxy = false) {
  const peer = request.socket.remoteAddress ?? 'unknown';
  const forwarded = request.headers['x-forwarded-for'];
  if (
    trustLoopbackProxy &&
    ['127.0.0.1', '::1', '::ffff:127.0.0.1'].includes(peer) &&
    typeof forwarded === 'string' &&
    isIP(forwarded.trim())
  )
    return forwarded.trim().replace(/^::ffff:(?=\d+\.)/, '');
  return peer;
}
