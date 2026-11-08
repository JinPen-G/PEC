/** Published manifest is the allowlist; explicit page links override defaults.
 * Original restricted associations remain a security floor after overrides. */
import path from 'node:path';
import { contentDocuments, effectiveDocuments } from './project-content.js';
import { fail } from './store.js';

export function pageDocuments(snapshot, project, clientId, pageKey) {
  return effectiveDocuments(snapshot, project).filter((document) =>
    document.pages.some((page) => page.clientId === clientId && page.pageKey === pageKey),
  );
}
export function canReadDocument(store, user, project, document, original) {
  if (user?.role === 'admin') return true;
  const scopes = [...document.pages, ...(original?.pages ?? [])];
  if (!scopes.length) {
    if (document.access === 'public' && (!original || original.access === 'public')) return true;
    try {
      store.projectAccess(user, project.id);
      return true;
    } catch {
      return false;
    }
  }
  return scopes.every((page) => {
    try {
      store.pageAccess(user, project.id, page.clientId, page.pageKey);
      return true;
    } catch {
      return false;
    }
  });
}
export function readableDocuments(store, user, project, snapshot) {
  const original = contentDocuments(snapshot);
  return effectiveDocuments(snapshot, project).filter((document) =>
    canReadDocument(
      store,
      user,
      project,
      document,
      original.find((item) => item.path === document.path),
    ),
  );
}
export function requireDocumentAccess(store, user, project, snapshot, file) {
  if (typeof file !== 'string' || !file) fail(400, '需要文档路径', 'BAD_REQUEST');
  const allowed = readableDocuments(store, user, project, snapshot);
  if (file.endsWith('.md')) {
    if (!allowed.some((document) => document.path === file)) fail(403, '此文档需要对应页面授权', 'FORBIDDEN');
    return;
  }
  if (!snapshot.manifest.assets.includes(file)) fail(404, '说明资源未发布', 'NOT_FOUND');
  if (user?.role === 'admin') return;
  const references = contentDocuments(snapshot).filter((document) => {
    const source = snapshot.files.get(document.path).toString('utf8');
    return [...source.matchAll(/!?\[[^\]]*\]\(([^)\s]+)(?:\s+[^)]*)?\)/g)].some(
      (match) =>
        path.posix.normalize(path.posix.join(path.posix.dirname(document.path), match[1].split('#')[0])) ===
        file,
    );
  });
  if (
    !references.length ||
    references.some((document) => !allowed.some((item) => item.path === document.path))
  )
    fail(403, '此资源需要对应页面授权', 'FORBIDDEN');
}
export function readableSourceDocuments(store, user, project, entries) {
  return entries.filter((document) =>
    canReadDocument(store, user, project, {
      ...document,
      pages: project.links.filter((link) => link.documentPath === document.path),
    }),
  );
}
export async function requireSourceDocumentAccess(store, user, project, entries, read, file) {
  const allowed = readableSourceDocuments(store, user, project, entries);
  if (file.endsWith('.md')) {
    if (!allowed.some((document) => document.path === file)) fail(403, '此文档需要对应页面授权', 'FORBIDDEN');
  } else if (user?.role !== 'admin') {
    // A referenced protected image has the same access floor as its documents.
    for (const document of entries) {
      if (allowed.some((item) => item.path === document.path)) continue;
      const source = (await read(project, document.path)).bytes.toString('utf8');
      if (
        [...source.matchAll(/!?\[[^\]]*\]\(([^)\s]+)(?:\s+[^)]*)?\)/g)].some(
          (match) =>
            path.posix.normalize(
              path.posix.join(path.posix.dirname(document.path), match[1].split('#')[0]),
            ) === file,
        )
      )
        fail(403, '此资源需要对应页面授权', 'FORBIDDEN');
    }
  }
}
