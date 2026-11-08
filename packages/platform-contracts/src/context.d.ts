export const CONTEXT_API_PREFIX: string;
export const CONTEXT_SCHEMA_VERSION: number;
export const CONTEXT_SCOPE: string;
export const CONTEXT_TOOLS: readonly { name: string; description: string }[];
export interface BusinessDocument {
  id: string;
  title: string;
  category: string;
  status: 'draft' | 'confirmed' | 'planned' | 'historical';
  path: string;
  pages: { clientId: string; pageKey: string; anchor: string }[];
  revision: string;
  contentRevision: string;
}
export interface ProjectBusinessOverview {
  schemaVersion: number;
  releaseId: string;
  contentRevision: string;
  projectId: string;
  title: string;
  markdown: string;
  requirements: number;
}
