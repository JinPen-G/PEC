import type {
  ProjectClient,
  ProjectEntry,
  ProjectManifest,
} from '../../../../../packages/platform-contracts/src/index.js';

export type ClientPreset = 'standard' | 'topnav' | 'simple' | 'immersive' | 'html-full' | 'login' | 'custom';

export const DEFAULT_PROJECT_THEME = {
  primary: '#2563eb',
  pageBackground: '#f5f7fb',
} as const;

interface PrototypeClientConfig {
  root?: string;
  shellMode?: string;
  [key: string]: unknown;
}

export interface ClientDraft {
  source: ProjectClient | null;
  sourceEntry: ProjectEntry | null;
  sourcePrototype: PrototypeClientConfig;
  id: string;
  isNew: boolean;
  name: string;
  description: string;
  icon: string;
  defaultPage: string;
  entryMode: 'direct' | 'platform-login' | 'custom-page';
  layoutType: 'sidebar' | 'topnav' | 'none' | 'bare';
  entryEnabled: boolean;
  entryOrder: number;
  prototypeRoot: string;
  storedPrototypeRoot: string;
  shellMode: 'auto' | 'full';
}

export interface ProjectDraft {
  source: ProjectManifest | null;
  id: string;
  name: string;
  version: string;
  description: string;
  primary: string;
  pageBackground: string;
  homepageVisible: boolean;
  docsRoot: string;
  storedDocsRoot: string;
  docsEntryEnabled: boolean;
  clients: ClientDraft[];
}

export const clientPresets: Array<{
  value: Exclude<ClientPreset, 'custom'>;
  label: string;
  description: string;
}> = [
  { value: 'standard', label: '左側菜單', description: '使用平臺頂欄和左側菜單，適合常規後臺與管理類原型。' },
  { value: 'topnav', label: '頂部導航', description: '使用平臺頂欄和頂部菜單，適合欄目較少的業務頁面。' },
  {
    value: 'simple',
    label: '無頁面菜單',
    description: '保留平臺頂欄，不顯示頁面菜單，適合單頁功能或閱讀頁面。',
  },
  { value: 'immersive', label: '沉浸式頁面', description: '不顯示平臺導航，頁面以完整畫布呈現。' },
  {
    value: 'html-full',
    label: '使用 HTML 自帶外殼',
    description: '保留 HTML 文件自己的頂欄和菜單，不再疊加平臺外殼。',
  },
  { value: 'login', label: '先登錄再進入', description: '先進入平臺登錄頁，登錄後使用左側菜單進入內容。' },
];

export function projectSlug(value: string) {
  const slug = value
    .normalize('NFKD')
    .toLowerCase()
    .replace(/[^a-z0-9]+/gu, '-')
    .replace(/^-+|-+$/gu, '')
    .replace(/^[^a-z]+/u, '');
  return slug || `project-${Date.now().toString(36)}`;
}

export function createClient(
  index: number,
  client?: ProjectManifest['clients'][number],
  entry?: ProjectEntry,
  prototype?: PrototypeClientConfig,
): ClientDraft {
  const rawRoot = String(prototype?.root || '');
  return {
    source: client || null,
    sourceEntry: entry || null,
    sourcePrototype: prototype || {},
    id: client?.id || `client-${index}`,
    isNew: !client,
    name: client?.name || `客戶端 ${index}`,
    description: client?.description || '項目客戶端入口。',
    icon: client?.icon || 'Management',
    defaultPage: client?.defaultPage || '',
    entryMode: client?.entry?.mode || 'direct',
    layoutType: client?.layout?.type || 'sidebar',
    entryEnabled: Boolean(entry) || !client,
    entryOrder: Number(entry?.order) || index * 10,
    prototypeRoot: rawRoot,
    storedPrototypeRoot: rawRoot,
    shellMode: prototype?.shellMode === 'full' ? 'full' : 'auto',
  };
}

export function draftFromProject(project: ProjectManifest | null): ProjectDraft {
  if (!project) {
    return {
      source: null,
      id: '',
      name: '',
      version: '0.1.0',
      description: '',
      primary: DEFAULT_PROJECT_THEME.primary,
      pageBackground: DEFAULT_PROJECT_THEME.pageBackground,
      homepageVisible: true,
      docsRoot: '',
      storedDocsRoot: 'docs',
      docsEntryEnabled: true,
      clients: [createClient(1)],
    };
  }

  const entries = project.entries || [];
  const prototypeClients =
    (project.prototype as { clients?: Record<string, PrototypeClientConfig> } | undefined)?.clients || {};
  return {
    source: project,
    id: project.id,
    name: project.name,
    version: project.version || '0.1.0',
    description: project.description || '',
    primary: project.theme?.primary || DEFAULT_PROJECT_THEME.primary,
    pageBackground: project.theme?.pageBackground || DEFAULT_PROJECT_THEME.pageBackground,
    homepageVisible: project.homepage?.visible !== false,
    docsRoot: project.docs?.enabled ? project.docs.root || 'docs' : '',
    storedDocsRoot: project.docs?.root || 'docs',
    docsEntryEnabled: Boolean(entries.find((entry) => entry.kind === 'docs')),
    clients: project.clients.map((client, index) =>
      createClient(
        index + 1,
        client,
        entries.find((entry) => entry.kind === 'client' && entry.clientId === client.id),
        prototypeClients[client.id],
      ),
    ),
  };
}

export function getClientPreset(client: ClientDraft): ClientPreset {
  if (client.entryMode === 'custom-page') return 'custom';
  if (client.entryMode === 'platform-login') return 'login';
  if (client.layoutType === 'topnav') return 'topnav';
  if (client.layoutType === 'none') return 'simple';
  if (client.layoutType === 'bare') return client.shellMode === 'full' ? 'html-full' : 'immersive';
  return 'standard';
}

export function applyClientPreset(client: ClientDraft, preset: Exclude<ClientPreset, 'custom'>): ClientDraft {
  const values = {
    standard: { entryMode: 'direct', layoutType: 'sidebar', shellMode: 'auto' },
    topnav: { entryMode: 'direct', layoutType: 'topnav', shellMode: 'auto' },
    simple: { entryMode: 'direct', layoutType: 'none', shellMode: 'auto' },
    immersive: { entryMode: 'direct', layoutType: 'bare', shellMode: 'auto' },
    'html-full': { entryMode: 'direct', layoutType: 'bare', shellMode: 'full' },
    login: { entryMode: 'platform-login', layoutType: 'sidebar', shellMode: 'auto' },
  } as const;
  return { ...client, ...values[preset] };
}

export function buildProjectPayload(draft: ProjectDraft, editing: boolean) {
  const docsEnabled = Boolean(draft.docsRoot.trim());
  const clients = draft.clients.map((client) => ({
    ...client.source,
    id: client.id,
    name: client.name.trim(),
    description: client.description.trim(),
    icon: client.icon || 'Document',
    defaultPage: client.defaultPage.trim(),
    entry: { ...client.source?.entry, mode: client.entryMode },
    layout: { type: client.layoutType },
    login: { ...((client.source as { login?: Record<string, unknown> } | null)?.login || {}) },
  }));
  const preservedEntries = (draft.source?.entries || []).filter(
    (entry) => entry.kind !== 'client' && entry.kind !== 'docs',
  );
  const currentDocsEntry = draft.source?.entries?.find((entry) => entry.kind === 'docs');
  const entries = [
    ...draft.clients
      .filter((client) => client.entryEnabled)
      .map((client) => ({
        ...client.sourceEntry,
        id: client.id,
        kind: 'client' as const,
        clientId: client.id,
        name: client.name.trim(),
        description: client.description.trim(),
        icon: client.icon || 'Document',
        order: client.entryOrder,
      })),
    ...(docsEnabled && draft.docsEntryEnabled
      ? [
          {
            ...currentDocsEntry,
            id: 'docs',
            kind: 'docs' as const,
            name: currentDocsEntry?.name || '產品文檔',
            description: currentDocsEntry?.description || '閱讀項目 PRD 與產品說明。',
            icon: currentDocsEntry?.icon || 'Document',
            order: currentDocsEntry?.order || 40,
          },
        ]
      : []),
    ...preservedEntries,
  ];
  const prototypeClients = Object.fromEntries(
    draft.clients.map((client) => [
      client.id,
      {
        ...client.sourcePrototype,
        enabled: Boolean(client.prototypeRoot.trim()),
        root: client.prototypeRoot.trim() || client.storedPrototypeRoot.trim(),
        section: '',
        shellMode: client.shellMode,
      },
    ]),
  );
  return {
    id: editing ? draft.id : projectSlug(draft.name),
    name: draft.name.trim(),
    shortName: draft.source?.shortName || draft.name.trim(),
    version: draft.version || draft.source?.version || '0.1.0',
    defaultLocale: draft.source?.defaultLocale || 'zh-CN',
    description: draft.description.trim(),
    primary: draft.primary,
    pageBackground: draft.pageBackground,
    homepage: { visible: draft.homepageVisible },
    clients,
    entries,
    docs: {
      enabled: docsEnabled,
      root: draft.docsRoot.trim() || draft.storedDocsRoot.trim() || 'docs',
    },
    prototype: {
      ...(draft.source?.prototype || {}),
      enabled: Object.values(prototypeClients).some((item) => item.enabled),
      root: 'prototype',
      client: '',
      section: '',
      clients: prototypeClients,
    },
    mobile: draft.source?.mobile || { enabled: false, entry: 'mobile/app.html' },
    features: draft.source?.features || { designSystem: true, legacyI18n: false },
    compatibility: draft.source?.compatibility || { legacyRoutes: false },
  };
}
