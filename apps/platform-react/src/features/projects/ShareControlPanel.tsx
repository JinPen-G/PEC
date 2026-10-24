import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

import { platformApi } from '@/data/platform-api';
import { platformQueryKeys, useShareStatus } from '@/data/use-platform-data';
import { Alert, Button, Flex, Switch, Tag, Tooltip, Typography } from '@/ui/ant';
import { CopyOutlined, GlobalOutlined } from '@/ui/ant/icons';
import { Surface } from '@/ui/platform/Surface';

const { Text, Title } = Typography;

export function ShareControlPanel() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const shareQuery = useShareStatus();
  const status = shareQuery.data;

  function shareHint(status: { managedByStartup: boolean; canControl: boolean; readOnly: boolean }) {
    if (status.managedByStartup) return t('dialogs.share.hintManaged');
    if (status.readOnly) return t('dialogs.share.hintReadOnly');
    if (!status.canControl) return t('dialogs.share.hintNoControl');
    return t('dialogs.share.hintDefault');
  }

  const toggleShare = useMutation({
    mutationFn: (enabled: boolean) => platformApi.saveShareEnabled(enabled),
    onSuccess: (next) => queryClient.setQueryData(platformQueryKeys.share, next),
  });

  if (!platformApi.development) return null;
  if (shareQuery.isError) {
    return (
      <Surface className="console-share-panel">
        <Alert
          type="info"
          showIcon
          title={t('dialogs.share.unavailableTitle')}
          description={t('dialogs.share.unavailableDescription')}
        />
      </Surface>
    );
  }

  const sharing = status?.sharing ?? false;
  const lanUrls = status?.urls.lan ?? [];

  return (
    <Surface className="console-share-panel">
      <div>
        <Flex align="center" gap={8}>
          <Title level={3}>{t('dialogs.share.title')}</Title>
          <Tag color={sharing ? 'success' : 'default'}>{sharing ? t('dialogs.share.on') : t('dialogs.share.off')}</Tag>
        </Flex>
        <Text type="secondary">{status ? shareHint(status) : t('dialogs.share.loading')}</Text>
        {status?.urls.local ? (
          <div className="console-share-panel__urls">
            <Text type="secondary">{t('dialogs.share.localUrl')}</Text>
            <Text code>{status.urls.local}</Text>
          </div>
        ) : null}
        {sharing && lanUrls.length ? (
          <div className="console-share-panel__urls">
            <Text type="secondary">{t('dialogs.share.lanUrls')}</Text>
            {lanUrls.map((url) => (
              <Flex key={url} align="center" gap={6}>
                <GlobalOutlined />
                <Text code>{url}</Text>
                <Tooltip title={t('dialogs.share.copyUrl')}>
                  <Button
                    type="text"
                    size="small"
                    icon={<CopyOutlined />}
                    onClick={() => void navigator.clipboard?.writeText(url)}
                  />
                </Tooltip>
              </Flex>
            ))}
          </div>
        ) : null}
        {sharing && !lanUrls.length ? (
          <Text type="warning">{t('dialogs.share.noLanUrls')}</Text>
        ) : null}
      </div>
      <Switch
        checked={sharing}
        loading={shareQuery.isPending || toggleShare.isPending}
        disabled={!status?.canControl}
        checkedChildren={t('dialogs.share.switchOn')}
        unCheckedChildren={t('dialogs.share.switchOff')}
        onChange={(checked) => toggleShare.mutate(checked)}
      />
      {toggleShare.isError ? (
        <Alert
          type="error"
          showIcon
          closable={{ onClose: toggleShare.reset }}
          title={t('dialogs.share.toggleFailed')}
          description={toggleShare.error.message}
        />
      ) : null}
    </Surface>
  );
}
