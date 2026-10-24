import {
  compareContextBaseline,
  createContextBaseline,
  createContextExport,
  createPageContextPackage,
  createProjectContext,
  createTraceabilityReport,
} from '../../../../../packages/project-core/src/ai-context.js';
import type {
  DocumentManifest,
  PagePrdLinks,
  ProjectManifest,
  PrdBindingsPayload,
} from '../../../../../packages/platform-contracts/src/index.js';
import { platformApi } from '@/data/platform-api';

const DOCUMENT_CONCURRENCY = 6;

export interface ContextHeading {
  id: string;
  text: string;
  level: number;
}

export interface ContextPage {
  key: string;
  clientId: string;
  clientName: string;
  name: string;
  title: string;
  path: string;
  fullPath: string;
  sectionId: string;
  sectionTitle: string;
  sourceType: string;
  source: string;
  documentPath: string;
}

export interface ContextDocument {
  path: string;
  title: string;
  headings: ContextHeading[];
  linkedPageKeys: string[];
  componentBindingIds: string[];
  archived?: boolean;
  contentAvailable: boolean;
}

export interface ContextIssue {
  severity: string;
  message: string;
  subject: string;
  pageKey?: string;
}

export interface ContextSuggestion {
  pageKey: string;
  page: ContextPage;
  candidates: Array<{ path: string; title: string; score: number; confidence: string; reasons: string[] }>;
}

export interface AiContext {
  project: {
    id: string;
    name: string;
    shortName: string;
    version: string;
    description: string;
    docsEnabled: boolean;
  };
  pages: ContextPage[];
  documents: ContextDocument[];
  issues: ContextIssue[];
  suggestions: ContextSuggestion[];
  summary: Record<string, number>;
  pagePrdLinks: PagePrdLinks;
  bindings: unknown[];
}

interface CoreContextInput {
  project: Record<string, unknown>;
  documentManifest: DocumentManifest;
  documentSources: Record<string, string>;
  bindings: unknown[];
  documentLoadErrors: Array<{ path: string; message: string }>;
}

const createCoreContext = createProjectContext as unknown as (input: CoreContextInput) => unknown;

function mergeLinks(base: PagePrdLinks, override: PagePrdLinks): PagePrdLinks {
  const next = Object.fromEntries(
    Object.entries(base || {}).map(([clientId, pages]) => [clientId, { ...pages }]),
  );
  for (const [clientId, pages] of Object.entries(override || {})) {
    next[clientId] ||= {};
    for (const [pageName, value] of Object.entries(pages || {})) {
      if (value === null || value === '') delete next[clientId][pageName];
      else next[clientId][pageName] = value;
    }
  }
  return next;
}

async function mapWithConcurrency<T, R>(items: T[], worker: (item: T) => Promise<R>) {
  const results: R[] = [];
  let cursor = 0;
  async function run() {
    while (cursor < items.length) {
      const index = cursor++;
      results[index] = await worker(items[index]);
    }
  }
  await Promise.all(Array.from({ length: Math.min(DOCUMENT_CONCURRENCY, items.length) }, run));
  return results;
}

export async function loadAiContext(project: ProjectManifest) {
  const [links, bindingsPayload, documentManifest, routeData] = await Promise.all([
    platformApi.loadPagePrdLinks(project.id),
    platformApi.loadPrdBindings(project.id),
    project.docs?.enabled
      ? platformApi.loadDocumentManifest(project.id)
      : Promise.resolve({ generatedAt: new Date().toISOString(), documents: [] } satisfies DocumentManifest),
    platformApi.listRoutes(project.id),
  ]);
  const contentResults = await mapWithConcurrency(documentManifest.documents, async (document) => {
    try {
      return {
        path: document.path,
        content: await platformApi.loadDocument(project.id, document.path),
        error: '',
      };
    } catch (error) {
      return {
        path: document.path,
        content: '',
        error: error instanceof Error ? error.message : '文檔正文讀取失敗。',
      };
    }
  });
  const pagePrdLinks = mergeLinks(
    (project as ProjectManifest & { pagePrdLinks?: PagePrdLinks }).pagePrdLinks || {},
    links,
  );
  const routeClients = new Map(routeData.clients.map((client) => [String(client.id), client]));
  const contextInput: CoreContextInput = {
    project: {
      ...project,
      pagePrdLinks,
      clients: project.clients.map((client) => {
        const routeClient = routeClients.get(client.id) as
          { sections?: unknown[]; pages?: unknown[] } | undefined;
        return {
          ...client,
          definition: { sections: routeClient?.sections || [], pages: routeClient?.pages || [] },
        };
      }),
    },
    documentManifest,
    documentSources: Object.fromEntries(
      contentResults.filter((item) => item.content).map((item) => [item.path, item.content]),
    ),
    bindings: (bindingsPayload as PrdBindingsPayload).bindings,
    documentLoadErrors: contentResults
      .filter((item) => item.error)
      .map((item) => ({ path: item.path, message: item.error })),
  };
  const context = createCoreContext(contextInput);
  return { ...(context as Record<string, unknown>), pagePrdLinks } as AiContext;
}

function baselineKey(projectId: string) {
  return `project-platform:ai-context-baseline:${projectId}`;
}
export function loadContextBaseline(projectId: string) {
  try {
    return JSON.parse(localStorage.getItem(baselineKey(projectId)) || 'null');
  } catch {
    return null;
  }
}
export function saveContextBaseline(context: Parameters<typeof createContextBaseline>[0]) {
  const baseline = createContextBaseline(context);
  localStorage.setItem(baselineKey(context.project.id), JSON.stringify(baseline));
  return baseline;
}
export { compareContextBaseline, createContextExport, createPageContextPackage, createTraceabilityReport };
