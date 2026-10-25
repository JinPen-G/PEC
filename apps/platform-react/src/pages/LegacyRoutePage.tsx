import { Navigate, useLocation, useParams } from 'react-router-dom';

import { useProjectManifest } from '@/data/use-platform-data';
import { resolveLegacyClientPath, resolveLegacyProjectEntry } from '@/features/projects/legacy-route-model';
import LoadingState from '@/ui/platform/LoadingState';

function withLocation(target: string, search: string, hash: string) {
  return `${target}${search}${hash}`;
}

function Loading() {
  return (
    <div className="app-route-loading">
      <LoadingState />
    </div>
  );
}

export function ProjectRootRedirectPage() {
  const { projectId = '' } = useParams();
  return <Navigate to={`/?project=${encodeURIComponent(projectId)}`} replace />;
}

export function LegacyProjectEntryPage({ kind }: { kind: 'docs' | 'mobile' }) {
  const location = useLocation();
  const projectQuery = useProjectManifest();
  if (projectQuery.isPending) return <Loading />;
  const target = resolveLegacyProjectEntry(projectQuery.data?.projects ?? [], kind);
  return target ? (
    <Navigate to={withLocation(target, location.search, location.hash)} replace />
  ) : (
    <Navigate to="/not-found" replace />
  );
}

export function LegacyClientRoutePage() {
  const location = useLocation();
  const { clientId = '', '*': legacyPath = '' } = useParams();
  const projectQuery = useProjectManifest();
  if (projectQuery.isPending) return <Loading />;
  const target = resolveLegacyClientPath(projectQuery.data?.projects ?? [], clientId, legacyPath);
  return target ? (
    <Navigate to={withLocation(target, location.search, location.hash)} replace />
  ) : (
    <Navigate to="/not-found" replace />
  );
}
