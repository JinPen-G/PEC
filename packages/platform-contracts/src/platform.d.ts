export const NATIVE_API_PREFIX: string;
export const NATIVE_ID_PATTERN: RegExp;
export const NATIVE_ROLES: readonly string[];
export const PROJECT_ROLES: readonly string[];
export const NATIVE_MODULES: readonly {
  key: string;
  label: string;
  projectId?: string;
  clientId?: string;
  contentKey?: string;
  surface?: 'showcase';
  initialClients?: NativeClient[];
  pages: readonly {
    key: string;
    label: string;
    source?: string;
    kind?: 'page' | 'component' | 'block';
    registryItem?: string;
    sourceFiles?: readonly string[];
  }[];
}[];
export function nativePageUrl(
  project: { id: string; moduleKey: string },
  clientId: string,
  pageKey: string,
): string;
export function nativePageAllowed(moduleKey: string, pageKey: string): boolean;
export interface NativeAccount {
  id: string;
  username: string;
  displayName: string;
  role: 'admin' | 'member';
  disabled: boolean;
  mustChangePassword: boolean;
  revision: number;
}
export interface NativeClient {
  id: string;
  name: string;
  icon: string;
  layout: 'desktop' | 'mobile';
  enabled: boolean;
  position: number;
  defaultPage: string;
  pages: {
    key: string;
    label: string;
    group: string;
    visible: boolean;
    position: number;
    access?: 'public' | 'restricted';
  }[];
}
export interface PageDocumentLink {
  clientId: string;
  pageKey: string;
  documentPath: string;
  anchor: string;
}
export interface NativeProject {
  id: string;
  name: string;
  description: string;
  icon: string;
  position: number;
  archived: boolean;
  moduleKey: string;
  sourceId: string;
  contentKey?: string;
  revision: number;
  memberRole: 'admin' | 'editor' | 'viewer';
  clients: NativeClient[];
  links: PageDocumentLink[];
}
export interface NativeSession {
  initialized: boolean;
  user: NativeAccount | null;
  csrf: string | null;
}
export interface DocumentEntry {
  path: string;
  title: string;
  size: number;
  revision: string;
  id?: string;
  category?: string;
  status?: string;
  contentRevision?: string;
}
export interface PageManagement {
  project: NativeProject;
  pages: { clientId: string; pageKey: string; documents: { path: string; title: string }[] }[];
}
export interface PageContext {
  links: (PageDocumentLink & { title?: string })[];
}
export function nativePublicAssetAllowed(relative: string): boolean;
