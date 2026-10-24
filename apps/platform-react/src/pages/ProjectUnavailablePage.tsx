import { useNavigate, useParams } from 'react-router-dom';

import { Button, Result } from '@/ui/ant';

export function ProjectUnavailablePage() {
  const navigate = useNavigate();
  const { projectId = '' } = useParams();
  return (
    <main className="system-result-page">
      <Result
        status="404"
        title="項目不可用"
        subTitle={`項目 ${projectId || '未知'} 不存在、已隱藏或當前入口不可訪問。`}
        extra={
          <Button type="primary" onClick={() => navigate('/')}>
            返回首頁
          </Button>
        }
      />
    </main>
  );
}
