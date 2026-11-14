/** Reject confirmed retired website content in public builds and retained assets.
 * Generic component names, attribution and license text are intentionally allowed. */
import { createHash } from 'node:crypto';

const retiredText = [
  'npx arc add icon-morph',
  'Northwind redesign',
  'Fieldwork 2.0 keynote',
  'Franklin Field',
  'auth-assets/marcus-johnson.svg',
];
const retiredAvatarHash = 'ae475ae4ee792bc8b9ed0ac93dbebbd4ca928f723d536c31d190182b710c5d90';

export function webAssetResidue(relative, bytes) {
  if (!/\.(?:html|m?js|css|json|map|svg)$/i.test(relative)) return null;
  if (/\.svg$/i.test(relative) && createHash('sha256').update(bytes).digest('hex') === retiredAvatarHash)
    return 'retired-login-avatar';
  const content = bytes.toString('utf8');
  // Recognize obsolete site roots without retaining their product names.
  const foreignScope = [...content.matchAll(/\b([a-z][a-z0-9]*-showcase)(?=[\s.:[{"'])/g)].find(
    ([, scope]) => !['preview-showcase', 'auth-showcase'].includes(scope),
  );
  if (foreignScope) return 'retired-showcase-scope';
  return retiredText.find((text) => content.includes(text)) ?? null;
}
