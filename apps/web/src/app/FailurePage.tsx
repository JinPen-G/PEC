/** Recovery stays outside app providers and exposes no internal exception text. */
import { useTranslation } from 'react-i18next';
import { ResultPage } from '@preview/ui/result';
import { reloadPage, returnHome } from './recovery-navigation';

export function FailurePage() {
  const { t } = useTranslation();
  return (
    <ResultPage
      status="500"
      title={t('chrome.error.title')}
      description={t('chrome.error.description')}
      reloadLabel={t('chrome.error.reload')}
      homeLabel={t('chrome.error.home')}
      onReload={reloadPage}
      onHome={returnHome}
    />
  );
}
