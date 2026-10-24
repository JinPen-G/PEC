import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { Button, Result } from '@/ui/ant';

export function ProjectUnavailablePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { projectId = '' } = useParams();
  return (
    <main className="system-result-page">
      <Result
        status="404"
        title={t('chrome.projectUnavailable.title')}
        subTitle={t('chrome.projectUnavailable.subtitle', {
          project: projectId || t('chrome.projectUnavailable.unknown'),
        })}
        extra={
          <Button type="primary" onClick={() => navigate('/')}>
            {t('chrome.projectUnavailable.backHome')}
          </Button>
        }
      />
    </main>
  );
}
