import { LoadingStage } from '@preview/ui/loading';
/** Page access is granted within the project; no separate membership setup is required. */
import { useNativeQuery, type NativeAccount, type NativeProject } from './platform-api';
import { PageAccessPanel } from './PageAccessPanel';
import { QueryFailure } from './PageLayout';

export function ProjectAccessPage({ projectId }: { projectId: string }) {
  const project = useNativeQuery<NativeProject>(`/projects/${projectId}`);
  const accounts = useNativeQuery<NativeAccount[]>('/accounts');
  const error = project.error ?? accounts.error;
  if (error)
    return (
      <QueryFailure
        message={error.message}
        retry={() => {
          void project.refetch();
          void accounts.refetch();
        }}
      />
    );
  if (!project.data || !accounts.data) return <LoadingStage label="读取用户授权…" />;
  if (project.data.memberRole !== 'admin') return <QueryFailure message="仅管理员可以授权用户" />;
  return (
    <div>
      <PageAccessPanel key={projectId} project={project.data} accounts={accounts.data} />
    </div>
  );
}
