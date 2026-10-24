import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { Button, Result } from '@/ui/ant';

export function NotFoundPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  return (
    <main className="system-result-page">
      <Result
        status="404"
        title={t('chrome.notFound.title')}
        subTitle={t('chrome.notFound.subtitle')}
        extra={
          <Button type="primary" onClick={() => navigate('/')}>
            {t('chrome.notFound.backHome')}
          </Button>
        }
      />
    </main>
  );
}
