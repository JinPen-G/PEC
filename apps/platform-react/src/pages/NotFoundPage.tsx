import { useNavigate } from 'react-router-dom';

import { Button, Result } from '@/ui/ant';

export function NotFoundPage() {
  const navigate = useNavigate();
  return (
    <main className="system-result-page">
      <Result
        status="404"
        title="頁面不存在"
        subTitle="當前地址沒有對應的平臺頁面或兼容入口。"
        extra={
          <Button type="primary" onClick={() => navigate('/')}>
            返回首頁
          </Button>
        }
      />
    </main>
  );
}
