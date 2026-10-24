import { useMemo, useState } from 'react';

import type { ProjectManifest } from '../../../../../packages/platform-contracts/src/index.js';
import {
  applyClientPreset,
  buildProjectPayload,
  clientPresets,
  createClient,
  draftFromProject,
  getClientPreset,
  projectSlug,
  type ClientDraft,
  type ClientPreset,
  type ProjectDraft,
} from './project-config-model';
import { Alert, Button, ColorPicker, Form, Input, Menu, Modal, Select, Switch, Typography } from '@/ui/ant';
import { AppstoreOutlined, PlusOutlined, SettingOutlined } from '@/ui/ant/icons';

const { Text, Title } = Typography;

type DialogMode = 'create' | 'edit';
interface ProjectConfigDialogProps {
  open: boolean;
  mode: DialogMode;
  project: ProjectManifest | null;
  projectIds: string[];
  saving?: boolean;
  onCancel: () => void;
  onSave: (payload: ReturnType<typeof buildProjectPayload>) => Promise<void>;
}

export function ProjectConfigDialog({
  open,
  mode,
  project,
  projectIds,
  saving = false,
  onCancel,
  onSave,
}: ProjectConfigDialogProps) {
  const [section, setSection] = useState<'project' | 'clients'>('project');
  const [draft, setDraft] = useState<ProjectDraft>(() => draftFromProject(project));
  const [error, setError] = useState('');
  const editing = mode === 'edit';
  const title = editing ? '編輯項目' : '新建項目';

  const clientIds = useMemo(() => new Set(draft.clients.map((client) => client.id)), [draft.clients]);

  function updateDraft(patch: Partial<ProjectDraft>) {
    setDraft((current) => ({ ...current, ...patch }));
  }

  function updateClient(index: number, next: ClientDraft) {
    setDraft((current) => ({
      ...current,
      clients: current.clients.map((client, currentIndex) => (currentIndex === index ? next : client)),
    }));
  }

  function addClient() {
    let nextIndex = draft.clients.length + 1;
    let nextId = `client-${nextIndex}`;
    while (clientIds.has(nextId)) {
      nextIndex += 1;
      nextId = `client-${nextIndex}`;
    }
    setDraft((current) => ({
      ...current,
      clients: [...current.clients, { ...createClient(nextIndex), id: nextId }],
    }));
  }

  function removeClient(index: number) {
    if (draft.clients.length <= 1) {
      setError('項目至少需要保留一個客戶端。');
      return;
    }
    setDraft((current) => ({
      ...current,
      clients: current.clients.filter((_, currentIndex) => currentIndex !== index),
    }));
  }

  async function submit() {
    if (!draft.name.trim()) {
      setError('請輸入項目名稱。');
      setSection('project');
      return;
    }
    if (!/^#[0-9a-f]{6}$/iu.test(draft.primary)) {
      setError('主題色必須使用六位十六進制色值，例如 #2563eb。');
      setSection('project');
      return;
    }
    if (draft.clients.some((client) => !client.name.trim())) {
      setError('請填寫所有客戶端名稱。');
      setSection('clients');
      return;
    }
    if (!editing && projectIds.includes(projectSlug(draft.name))) {
      setError('該項目 ID 已存在，請調整項目名稱後再保存。');
      return;
    }
    setError('');
    await onSave(buildProjectPayload(draft, editing));
  }

  return (
    <Modal
      className="project-config-modal"
      width={980}
      open={open}
      maskClosable={false}
      title={title}
      okText="保存"
      cancelText="取消"
      confirmLoading={saving}
      onCancel={onCancel}
      onOk={() => void submit()}
      destroyOnHidden
    >
      <div className="project-config-shell">
        <Text className="project-config-intro" type="secondary">
          只設置項目內容入口，其他工程參數由平臺自動處理。
        </Text>
        {error ? <Alert showIcon type="error" title={error} /> : null}
        <div className="project-config-body">
          <aside className="project-config-nav">
            <Menu
              mode="inline"
              selectedKeys={[section]}
              items={[
                { key: 'project', icon: <SettingOutlined />, label: '項目資料' },
                { key: 'clients', icon: <AppstoreOutlined />, label: `客戶端（${draft.clients.length}）` },
              ]}
              onClick={({ key }) => setSection(key as 'project' | 'clients')}
            />
          </aside>
          <main className="project-config-content">
            {section === 'project' ? (
              <section className="project-config-section">
                <div className="project-config-section__heading">
                  <Title level={3}>項目資料</Title>
                  <Text type="secondary">設置項目名稱、文檔來源和統一主題色。</Text>
                </div>
                <Form layout="vertical" requiredMark={false}>
                  <div className="project-config-grid">
                    <Form.Item label="項目名稱" required>
                      <Input
                        value={draft.name}
                        maxLength={60}
                        placeholder="例如：客戶服務平臺"
                        onChange={(event) => updateDraft({ name: event.target.value })}
                      />
                      {!editing ? <small>項目 ID、簡稱和版本由平臺自動生成。</small> : null}
                    </Form.Item>
                    <Form.Item label="PRD 文件夾">
                      <Input
                        value={draft.docsRoot}
                        allowClear
                        placeholder="填寫項目內目錄或本機絕對路徑；沒有可留空"
                        onChange={(event) => updateDraft({ docsRoot: event.target.value })}
                      />
                      <small>填寫後啓用文檔中心；清空則不顯示文檔入口。</small>
                    </Form.Item>
                  </div>
                  <div className="project-config-grid project-config-grid--divide">
                    <Form.Item label="項目主題色" required>
                      <Input
                        value={draft.primary}
                        maxLength={7}
                        placeholder="#2563eb"
                        onChange={(event) => updateDraft({ primary: event.target.value })}
                        prefix={
                          <ColorPicker
                            value={draft.primary}
                            format="hex"
                            onChange={(_color, hex) => updateDraft({ primary: hex })}
                          />
                        }
                      />
                      <small>用於客戶端外殼、主要按鈕、鏈接和選中狀態。</small>
                    </Form.Item>
                    <div className="project-visibility-row">
                      <div>
                        <strong>在首頁顯示項目</strong>
                        <Text type="secondary">關閉後，項目不會出現在首頁的項目選擇列表中。</Text>
                      </div>
                      <Switch
                        checked={draft.homepageVisible}
                        onChange={(homepageVisible) => updateDraft({ homepageVisible })}
                      />
                    </div>
                  </div>
                </Form>
              </section>
            ) : (
              <section className="project-config-section">
                <div className="project-config-section__heading project-config-section__heading--action">
                  <div>
                    <Title level={3}>客戶端</Title>
                    <Text type="secondary">每個客戶端只需確定名稱、頁面結構和內容來源。</Text>
                  </div>
                  <Button icon={<PlusOutlined />} onClick={addClient}>
                    添加客戶端
                  </Button>
                </div>
                <div className="project-client-list">
                  {draft.clients.map((client, index) => {
                    const preset = getClientPreset(client);
                    return (
                      <article key={client.id} className="project-client-item">
                        <header>
                          <div>
                            <span>{String(index + 1).padStart(2, '0')}</span>
                            <strong>{client.name.trim() || `客戶端 ${index + 1}`}</strong>
                          </div>
                          <div className="project-client-item__actions">
                            <label>
                              首頁顯示{' '}
                              <Switch
                                size="small"
                                checked={client.entryEnabled}
                                onChange={(entryEnabled) => updateClient(index, { ...client, entryEnabled })}
                              />
                            </label>
                            {draft.clients.length > 1 ? (
                              <Button danger type="link" onClick={() => removeClient(index)}>
                                移除
                              </Button>
                            ) : null}
                          </div>
                        </header>
                        <Form layout="vertical" requiredMark={false}>
                          <div className="project-client-grid">
                            <Form.Item label="客戶端名稱">
                              <Input
                                value={client.name}
                                placeholder="例如：營運端"
                                onChange={(event) =>
                                  updateClient(index, { ...client, name: event.target.value })
                                }
                              />
                            </Form.Item>
                            <Form.Item label="頁面結構">
                              <Select
                                value={preset}
                                options={
                                  preset === 'custom'
                                    ? [...clientPresets, { value: 'custom', label: '保留現有自定義入口' }]
                                    : clientPresets
                                }
                                onChange={(value) =>
                                  value !== 'custom' &&
                                  updateClient(
                                    index,
                                    applyClientPreset(client, value as Exclude<ClientPreset, 'custom'>),
                                  )
                                }
                              />
                            </Form.Item>
                            <Form.Item label="HTML 頁面文件夾">
                              <Input
                                value={client.prototypeRoot}
                                allowClear
                                placeholder="使用工程頁面時留空"
                                onChange={(event) =>
                                  updateClient(index, { ...client, prototypeRoot: event.target.value })
                                }
                              />
                            </Form.Item>
                          </div>
                        </Form>
                        <small>
                          {clientPresets.find((item) => item.value === preset)?.description ||
                            '當前項目使用已有的自定義入口頁面，保存時會原樣保留。'}
                        </small>
                      </article>
                    );
                  })}
                </div>
              </section>
            )}
          </main>
        </div>
      </div>
    </Modal>
  );
}
