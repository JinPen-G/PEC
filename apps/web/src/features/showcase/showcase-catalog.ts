/** Shared visible-page catalog for the public library and demo.
 * The page service owns visibility, ordering and account authorization. */
import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNativeAuth } from '@/features/platform/platform-api';

export interface CatalogPage {
  projectId: string;
  projectName: string;
  clientId: string;
  clientName: string;
  pageKey: string;
  title: string;
  category: string;
  access: 'public' | 'restricted';
  allowed: boolean;
  featuredOrder?: number;
}
export interface ShowcaseProject {
  id: string;
  name: string;
}
export function useShowcaseProject(
  requested: string | null | undefined,
  projects: ShowcaseProject[] | undefined,
  enabled = true,
) {
  const { session } = useNativeAuth();
  const key = `preview:showcase-project:${session?.user?.id ?? 'anonymous'}`;
  let remembered: string | null = null;
  try {
    remembered = sessionStorage.getItem(key);
  } catch {
    remembered = null;
  }
  const projectId = requested ?? projects?.find((project) => project.id === remembered)?.id ?? projects?.[0]?.id ?? '';
  useEffect(() => {
    if (!enabled || !projects?.some((project) => project.id === projectId)) return;
    try {
      sessionStorage.setItem(key, projectId);
    } catch {
      return;
    }
  }, [enabled, key, projectId, projects]);
  return projectId;
}
export function useShowcaseProjects(enabled = true) {
  const { client, session } = useNativeAuth();
  return useQuery<{ projects: ShowcaseProject[] }>({
    queryKey: ['showcase-catalog', session?.user?.id, session?.user?.revision, 'projects'],
    queryFn: ({ signal }) => client.request('/showcase/projects', { signal }),
    enabled,
    retry: false,
    refetchInterval: 5000,
  });
}
export function useShowcasePages(projectId: string, enabled = true) {
  const { client, session } = useNativeAuth();
  return useQuery<{ pages: CatalogPage[] }>({
    queryKey: ['showcase-catalog', session?.user?.id, session?.user?.revision, projectId],
    queryFn: ({ signal }) =>
      client.request(`/showcase?projectId=${encodeURIComponent(projectId)}`, { signal }),
    enabled: enabled && Boolean(projectId),
    retry: false,
    refetchInterval: 5000,
  });
}
