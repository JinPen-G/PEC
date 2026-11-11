import { useQuery } from '@tanstack/react-query';
import { useNativeAuth } from '@/features/platform/platform-api';
import type { ProjectGuideCatalog } from '../../../../../packages/platform-contracts/src/project-guides';

export function useProjectGuides(projectId: string) {
  const { client, session } = useNativeAuth();
  return useQuery<ProjectGuideCatalog>({
    queryKey: ['showcase-project-guides', projectId, session?.user?.id, session?.user?.revision],
    queryFn: ({ signal }) => client.request(`/showcase/${encodeURIComponent(projectId)}/guides`, { signal }),
    enabled: Boolean(projectId),
    staleTime: 30_000,
    retry: false,
  });
}
