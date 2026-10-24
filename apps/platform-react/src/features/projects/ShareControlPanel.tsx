import { useMutation, useQueryClient } from '@tanstack/react-query';

import { platformApi } from '@/data/platform-api';
import { platformQueryKeys, useShareStatus } from '@/data/use-platform-data';
import { Alert, Button, Flex, Switch, Tag, Tooltip, Typography } from '@/ui/ant';
import { CopyOutlined, GlobalOutlined } from '@/ui/ant/icons';
import { Surface } from '@/ui/platform/Surface';

const { Text, Title } = Typography;

function shareHint(status: { managedByStartup: boolean; canControl: boolean; readOnly: boolean }) {
  if (status.managedByStartup) return '服務以局域網地址啓動，分享狀態由啓動參數決定。';
  if (status.readOnly) return '當前服務爲只讀模式，不能切換分享。';
  if (!status.canControl) return '只有服務主機（或開啓遠程管理後的授權瀏覽器）可以切換分享狀態。';
  return '開啓後同一網絡的設備可只讀查看項目、原型和 PRD。';

}

export function ShareControlPanel() {
  const queryClient = useQueryClient();
  const shareQuery = useShareStatus();
  const status = shareQuery.data;
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
          title="局域網分享不可用"
          description="當前平臺由開發服務器或靜態部署承載，未提供分享控制接口。使用 npm run serve:local 啓動獨立服務後可用。"
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
          <Title level={3}>局域網只讀分享</Title>
          <Tag color={sharing ? 'success' : 'default'}>{sharing ? '已開啓' : '已關閉'}</Tag>
        </Flex>
        <Text type="secondary">{status ? shareHint(status) : '正在讀取分享狀態…'}</Text>
        {status?.urls.local ? (
          <div className="console-share-panel__urls">
            <Text type="secondary">本機地址</Text>
            <Text code>{status.urls.local}</Text>
          </div>
        ) : null}
        {sharing && lanUrls.length ? (
          <div className="console-share-panel__urls">
            <Text type="secondary">可分享地址</Text>
            {lanUrls.map((url) => (
              <Flex key={url} align="center" gap={6}>
                <GlobalOutlined />
                <Text code>{url}</Text>
                <Tooltip title="複製地址">
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
          <Text type="warning">已開啓分享，但未檢測到可用的局域網地址。</Text>
        ) : null}
      </div>
      <Switch
        checked={sharing}
        loading={shareQuery.isPending || toggleShare.isPending}
        disabled={!status?.canControl}
        checkedChildren="開"
        unCheckedChildren="關"
        onChange={(checked) => toggleShare.mutate(checked)}
      />
      {toggleShare.isError ? (
        <Alert
          type="error"
          showIcon
          closable={{ onClose: toggleShare.reset }}
          title="分享狀態切換失敗"
          description={toggleShare.error.message}
        />
      ) : null}
    </Surface>
  );
}
