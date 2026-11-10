import { useState } from 'react';
import { Alert, Button, Checkbox, Input, InputNumber, Table, Tag } from '@preview/ui/admin';
import { LoadingStage } from '@preview/ui/loading';
import { useNativeAuth, useNativeQuery } from './platform-api';
import { usePlatformLocale } from '@/features/locale/platform-locale';
import type { ContextScope, ContextToken } from '../../../../../packages/platform-contracts/src/context';
import { QueryFailure } from './PageLayout';
import './project-integration.css';

interface Readiness {
  issues: { code: string; pageKey?: string; component?: string }[];
  projectId: string;
  mcpUrl: string;
  registeredPages: number;
  visiblePages: number;
  requirements: { configured: boolean; count: number };
  governance: { configured: boolean; count: number };
  components: { count: number };
  graph: { availability: string; complete: boolean; diagnostics: { code: string }[] } | null;
}
export function ProjectIntegrationPage({ projectId }: { projectId: string }) {
  const { client } = useNativeAuth();
  const { locale } = usePlatformLocale();
  const text = (hans: string, hant: string, en: string) =>
    locale === 'en' ? en : locale === 'zh-Hant' ? hant : hans;
  const readiness = useNativeQuery<Readiness>(`/projects/${projectId}/readiness`);
  const tokens = useNativeQuery<ContextToken[]>(`/context-tokens?projectId=${projectId}`);
  const [scopes, setScopes] = useState<ContextScope[]>([
    'business:read',
    'governance:read',
    'components:read',
  ]);
  const [label, setLabel] = useState('');
  const [days, setDays] = useState(30);
  const [secret, setSecret] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [pending, setPending] = useState(false);
  const options: { value: ContextScope; label: string }[] = [
    { value: 'business:read', label: text('业务需求与图谱', '業務需求與圖譜', 'Requirements and graph') },
    {
      value: 'governance:read',
      label: text('已发布治理规则', '已發布治理規則', 'Published governance rules'),
    },
    {
      value: 'components:read',
      label: text('组件源码与安装', '元件原始碼與安裝', 'Component source and installation'),
    },
  ];
  async function copy(value: string) {
    try {
      await navigator.clipboard.writeText(value);
      setNotice(text('已复制', '已複製', 'Copied'));
    } catch {
      setError(
        text(
          '复制失败，请手动选择复制',
          '複製失敗，請手動選取複製',
          'Copy failed. Select and copy the text manually.',
        ),
      );
    }
  }
  if (readiness.error)
    return <QueryFailure message={readiness.error.message} retry={() => void readiness.refetch()} />;
  if (!readiness.data) return <LoadingStage />;
  const state = readiness.data;
  const config = JSON.stringify(
    {
      mcpServers: {
        [projectId]: {
          url: state.mcpUrl,
          headers: { Authorization: `Bearer ${secret || '<PROJECT_TOKEN>'}` },
        },
      },
    },
    null,
    2,
  );
  return (
    <section className="native-page-access native-integration">
      <h2>{text('接入状态', '接入狀態', 'Integration status')}</h2>
      <p>
        {text('注册页面', '註冊頁面', 'Registered pages')} {state.registeredPages} ·{' '}
        {text('上架页面', '上架頁面', 'Published pages')} {state.visiblePages} · PRD{' '}
        {state.requirements.count} · {text('治理规则', '治理規則', 'Governance rules')}{' '}
        {state.governance.count} · {text('组件 / 区块', '元件 / 區塊', 'Components / blocks')}{' '}
        {state.components.count}
      </p>
      {state.issues?.length > 0 && (
        <Alert
          type="error"
          title={text(
            '接入检查发现缺失文件，请修复后重新检查',
            '接入檢查發現缺失檔案，請修復後重新檢查',
            'Integration files are missing. Fix them and recheck.',
          )}
          description={state.issues
            .map((issue) => `${issue.pageKey ?? issue.component ?? ''}: ${issue.code}`)
            .join(' · ')}
        />
      )}
      {!state.requirements.configured && (
        <Alert
          type="info"
          title={text(
            '尚未绑定 PRD 资料包，组件读取可独立使用',
            '尚未繫結 PRD 資料包，元件讀取可獨立使用',
            'No PRD package is linked. Component access works independently.',
          )}
        />
      )}
      {state.requirements.configured && (!state.graph || !state.graph.complete) && (
        <Alert
          type="warning"
          title={text(
            '图谱尚未补齐，请在引入 PRD 时维护节点与原文依据',
            '圖譜尚未補齊，請在引入 PRD 時維護節點與原文依據',
            'Graph coverage is incomplete. Add nodes and evidence when importing requirements.',
          )}
        />
      )}
      <Button onClick={() => void readiness.refetch()}>{text('重新检查', '重新檢查', 'Recheck')}</Button>
      <h2>{text('AI 读取凭证', 'AI 讀取憑證', 'AI access token')}</h2>
      <p>
        {text(
          '所选范围覆盖本项目。组件仅包含已上架内容；凭证到期或撤销后立即停止新请求。',
          '所選範圍涵蓋本專案。元件僅包含已上架內容；憑證到期或撤銷後立即停止新請求。',
          'Selected scopes cover this project. Only published components are included. Expired or revoked tokens reject new requests.',
        )}
      </p>
      {error && <Alert type="error" title={error} />}
      <form
        className="native-form-width"
        onSubmit={(event) => {
          event.preventDefault();
          setPending(true);
          setError('');
          setSecret('');
          void client
            .request<{ secret: string }>('/context-tokens', {
              method: 'POST',
              body: { projectId, label, days, scopes },
            })
            .then(async (result) => {
              setSecret(result.secret);
              setLabel('');
              await tokens.refetch();
            })
            .catch((error: Error) => setError(error.message))
            .finally(() => setPending(false));
        }}
      >
        <label>
          {text('凭证名称', '憑證名稱', 'Token name')}
          <Input
            required
            maxLength={80}
            value={label}
            disabled={pending}
            onChange={(event) => setLabel(event.target.value)}
          />
        </label>
        <label>
          {text('有效天数', '有效天數', 'Validity in days')}
          <InputNumber
            min={1}
            max={90}
            value={days}
            disabled={pending}
            onChange={(value) => setDays(Number(value ?? 30))}
          />
        </label>
        <div className="native-toolbar">
          {options.map((option) => (
            <Checkbox
              key={option.value}
              checked={scopes.includes(option.value)}
              disabled={pending}
              onChange={(event) =>
                setScopes((previous) =>
                  event.target.checked
                    ? [...previous, option.value]
                    : previous.filter((scope) => scope !== option.value),
                )
              }
            >
              {option.label}
            </Checkbox>
          ))}
        </div>
        <Button htmlType="submit" disabled={pending || !scopes.length}>
          {text('签发只读凭证', '簽發唯讀憑證', 'Issue read-only token')}
        </Button>
      </form>
      <h2>{text('连接 MCP', '連線 MCP', 'Connect MCP')}</h2>
      <p>
        {text(
          '使用 Streamable HTTP，添加以下配置。连接后先调用 get_project_context。',
          '使用 Streamable HTTP，新增以下設定。連線後先呼叫 get_project_context。',
          'Use Streamable HTTP with this configuration. Call get_project_context first.',
        )}
      </p>
      <Input.TextArea aria-label="MCP configuration" rows={10} readOnly value={config} />
      <div className="native-toolbar">
        <Button onClick={() => void copy(config)}>
          {text('复制 MCP 配置', '複製 MCP 設定', 'Copy MCP configuration')}
        </Button>
        {secret && (
          <>
            <Button onClick={() => void copy(secret)}>{text('复制凭证', '複製憑證', 'Copy token')}</Button>
            <Button onClick={() => setSecret('')}>{text('隐藏凭证', '隱藏憑證', 'Hide token')}</Button>
          </>
        )}
      </div>
      <p>
        {text(
          '新凭证仅显示一次，保存在客户端私有配置。受限 Registry 安装使用同一 Bearer 凭证，通过客户端请求头配置传递。',
          '新憑證僅顯示一次，保存在用戶端私有設定。受限 Registry 安裝使用同一 Bearer 憑證，透過用戶端請求標頭設定傳遞。',
          'New tokens are shown once. Save them in private client configuration. Restricted Registry installation uses the same Bearer token through client request headers.',
        )}
      </p>
      <span role="status">{notice}</span>
      {tokens.error ? (
        <QueryFailure message={tokens.error.message} retry={() => void tokens.refetch()} />
      ) : (
        <Table<ContextToken>
          rowKey="id"
          dataSource={tokens.data ?? []}
          loading={tokens.isPending}
          pagination={false}
          columns={[
            { title: text('名称', '名稱', 'Name'), dataIndex: 'label' },
            {
              title: text('读取范围', '讀取範圍', 'Scopes'),
              render: (_, token) =>
                token.scopes.map((scope) => (
                  <Tag key={scope}>{options.find((option) => option.value === scope)?.label ?? scope}</Tag>
                )),
            },
            {
              title: text('到期时间', '到期時間', 'Expires'),
              render: (_, token) =>
                token.revokedAt
                  ? text('已撤销', '已撤銷', 'Revoked')
                  : new Date(token.expiresAt).toLocaleDateString(),
            },
            {
              title: text('操作', '操作', 'Actions'),
              render: (_, token) => (
                <Button
                  disabled={pending || Boolean(token.revokedAt)}
                  onClick={() => {
                    setPending(true);
                    void client
                      .request(`/context-tokens/${token.id}`, { method: 'DELETE' })
                      .then(async () => {
                        setSecret('');
                        await tokens.refetch();
                      })
                      .catch((error: Error) => setError(error.message))
                      .finally(() => setPending(false));
                  }}
                >
                  {text('撤销', '撤銷', 'Revoke')}
                </Button>
              ),
            },
          ]}
        />
      )}
    </section>
  );
}
