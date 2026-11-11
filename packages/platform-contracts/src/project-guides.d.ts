export const PROJECT_GUIDE_IDS: readonly ProjectGuideId[];
export type ProjectGuideId = 'introduction' | 'usage' | 'theming' | 'motion' | 'ai' | 'changelog';
export interface ProjectGuide {
  id: ProjectGuideId;
  title: string;
  description: string;
  path: string;
  markdown: string;
}
export interface ProjectGuideCatalog {
  projectId: string;
  projectName: string;
  availability: 'ready' | 'unconfigured';
  contentRevision: string | null;
  guides: ProjectGuide[];
  restrictedGuideIds: ProjectGuideId[];
}
