export const CONTEXT_API_PREFIX: string;
export const CONTEXT_SCHEMA_VERSION: number;
export const CONTEXT_SCOPE: string;
export const CONTEXT_TOOLS: readonly { name: string; description: string }[];
export const AGENT_TOOLS: readonly { name: string; description: string; scope: string | null }[];
export const GOVERNANCE_ADOPTION_QUESTION: string;
export const PROJECT_CONTEXT_INSTRUCTIONS: string;
export type ContextScope = 'business:read' | 'governance:read' | 'components:read';
export interface GovernanceAdoption {
  mode: 'explain-and-ask';
  decisionOwner: 'current-user';
  decisionStorage: 'client';
  question: string;
  rules: { id: string; revision: string; source: 'platform' | 'project' }[];
  contentRevision: string | null;
  governanceRevision: string;
  beforeAsking: string[];
  existingDecision: string;
  ifAccepted: string[];
  ifDeclined: string;
  selfCheck: {
    statuses: readonly ['已遵循', '待补齐', '有冲突', '无法核实'];
    columns: readonly ['检查项', '状态与依据', '下一步'];
    claim: string;
  };
}
export interface ProjectAgentContext {
  projectId: string;
  title: string;
  scopes: ContextScope[];
  contentRevision: string | null;
  requirementsAuthority: {
    source: 'target-project-confirmed-requirements';
    localRequirementDocument: 'optional';
    guidance: string;
  };
  updates: ProjectUpdatesInfo;
  platformUpdates: {
    availability: 'ready';
    readTool: 'read_project_updates';
    source: 'platform';
    revision: string;
    websiteUrl: string;
  };
  requirements: { configured: boolean; count: number } | null;
  governance: {
    configured: boolean;
    count: number;
    governanceRevision: string;
    adoption: GovernanceAdoption | null;
  } | null;
  components: { count: number } | null;
  workflow: string[];
}
export type ProjectUpdatesInfo =
  | { availability: 'unconfigured'; readTool: 'read_project_updates' }
  | { availability: 'restricted'; readTool: 'read_project_updates'; requiredScope: 'business:read' }
  | {
      availability: 'ready';
      readTool: 'read_project_updates';
      title: string;
      revision: string;
      contentRevision: string;
      websiteUrl: string;
    };
export interface ProjectUpdates {
  projectId: string;
  id: 'changelog';
  source: 'platform' | 'project';
  title: string;
  contentRevision: string;
  revision: string;
  websiteUrl: string;
  markdown: string;
  offset: number;
  totalLength: number;
  nextOffset: number | null;
}
export interface ContextToken {
  id: string;
  label: string;
  scopes: ContextScope[];
  expiresAt: number;
  revokedAt: number | null;
}
export interface BusinessDocument {
  id: string;
  title: string;
  category: string;
  status: 'draft' | 'confirmed' | 'planned' | 'historical';
  path: string;
  summary?: string;
  assets?: string[];
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
