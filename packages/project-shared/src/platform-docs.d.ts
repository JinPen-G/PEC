export interface PlatformGuide {
  id: 'introduction' | 'usage' | 'theming' | 'motion' | 'graph' | 'ai' | 'changelog';
  title: string;
  description: string;
  path: string;
  markdown: string;
}
export const PLATFORM_GUIDES: readonly PlatformGuide[];
