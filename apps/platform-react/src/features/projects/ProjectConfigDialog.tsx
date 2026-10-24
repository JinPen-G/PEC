import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();
  const [section, setSection] = useState<'project' | 'clients'>('project');
  const [draft, setDraft] = useState<ProjectDraft>(() => draftFromProject(project));
  const [error, setError] = useState('');
  const editing = mode === 'edit';
  const title = editing ? t('dialogs.projectConfig.editTitle') : t('dialogs.projectConfig.createTitle');

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
      setError(t('dialogs.projectConfig.errorMinClients'));
      return;
    }
    setDraft((current) => ({
      ...current,
      clients: current.clients.filter((_, currentIndex) => currentIndex !== index),
    }));
  }

  async function submit() {
    if (!draft.name.trim()) {
      setError(t('dialogs.projectConfig.errorNameRequired'));
      setSection('project');
      return;
    }
    if (!/^#[0-9a-f]{6}$/iu.test(draft.primary)) {
      setError(t('dialogs.projectConfig.errorInvalidColor'));
      setSection('project');
      return;
    }
    if (draft.clients.some((client) => !client.name.trim())) {
      setError(t('dialogs.projectConfig.errorClientNames'));
      setSection('clients');
      return;
    }
    if (!editing && projectIds.includes(projectSlug(draft.name))) {
      setError(t('dialogs.projectConfig.errorDuplicateId'));
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
      okText={t('dialogs.projectConfig.save')}
      cancelText={t('dialogs.projectConfig.cancel')}
      confirmLoading={saving}
      onCancel={onCancel}
      onOk={() => void submit()}
      destroyOnHidden
    >
      <div className="project-config-shell">
        <Text className="project-config-intro" type="secondary">
          {t('dialogs.projectConfig.intro')}
        </Text>
        {error ? <Alert showIcon type="error" title={error} /> : null}
        <div className="project-config-body">
          <aside className="project-config-nav">
            <Menu
              mode="inline"
              selectedKeys={[section]}
              items={[
                { key: 'project', icon: <SettingOutlined />, label: t('dialogs.projectConfig.navProject') },
                {
                  key: 'clients',
                  icon: <AppstoreOutlined />,
                  label: t('dialogs.projectConfig.navClients', { count: draft.clients.length }),
                },
              ]}
              onClick={({ key }) => setSection(key as 'project' | 'clients')}
            />
          </aside>
          <main className="project-config-content">
            {section === 'project' ? (
              <section className="project-config-section">
                <div className="project-config-section__heading">
                  <Title level={3}>{t('dialogs.projectConfig.navProject')}</Title>
                  <Text type="secondary">{t('dialogs.projectConfig.projectSectionHint')}</Text>
                </div>
                <Form layout="vertical" requiredMark={false}>
                  <div className="project-config-grid">
                    <Form.Item label={t('dialogs.projectConfig.nameLabel')} required>
                      <Input
                        value={draft.name}
                        maxLength={60}
                        placeholder={t('dialogs.projectConfig.namePlaceholder')}
                        onChange={(event) => updateDraft({ name: event.target.value })}
                      />
                      {!editing ? <small>{t('dialogs.projectConfig.autoGeneratedHint')}</small> : null}
                    </Form.Item>
                    <Form.Item label={t('dialogs.projectConfig.docsRootLabel')}>
                      <Input
                        value={draft.docsRoot}
                        allowClear
                        placeholder={t('dialogs.projectConfig.docsRootPlaceholder')}
                        onChange={(event) => updateDraft({ docsRoot: event.target.value })}
                      />
                      <small>{t('dialogs.projectConfig.docsRootHint')}</small>
                    </Form.Item>
                  </div>
                  <div className="project-config-grid project-config-grid--divide">
                    <Form.Item label={t('dialogs.projectConfig.primaryColorLabel')} required>
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
                      <small>{t('dialogs.projectConfig.primaryColorHint')}</small>
                    </Form.Item>
                    <div className="project-visibility-row">
                      <div>
                        <strong>{t('dialogs.projectConfig.homepageVisible')}</strong>
                        <Text type="secondary">{t('dialogs.projectConfig.homepageVisibleHint')}</Text>
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
                    <Title level={3}>{t('dialogs.projectConfig.clientsTitle')}</Title>
                    <Text type="secondary">{t('dialogs.projectConfig.clientsSectionHint')}</Text>
                  </div>
                  <Button icon={<PlusOutlined />} onClick={addClient}>
                    {t('dialogs.projectConfig.addClient')}
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
                            <strong>
                              {client.name.trim() || t('dialogs.projectConfig.clientFallbackName', { index: index + 1 })}
                            </strong>
                          </div>
                          <div className="project-client-item__actions">
                            <label>
                              {t('dialogs.projectConfig.clientEntryEnabled')}{' '}
                              <Switch
                                size="small"
                                checked={client.entryEnabled}
                                onChange={(entryEnabled) => updateClient(index, { ...client, entryEnabled })}
                              />
                            </label>
                            {draft.clients.length > 1 ? (
                              <Button danger type="link" onClick={() => removeClient(index)}>
                                {t('dialogs.projectConfig.removeClient')}
                              </Button>
                            ) : null}
                          </div>
                        </header>
                        <Form layout="vertical" requiredMark={false}>
                          <div className="project-client-grid">
                            <Form.Item label={t('dialogs.projectConfig.clientNameLabel')}>
                              <Input
                                value={client.name}
                                placeholder={t('dialogs.projectConfig.clientNamePlaceholder')}
                                onChange={(event) =>
                                  updateClient(index, { ...client, name: event.target.value })
                                }
                              />
                            </Form.Item>
                            <Form.Item label={t('dialogs.projectConfig.presetLabel')}>
                              <Select
                                value={preset}
                                options={
                                  preset === 'custom'
                                    ? [
                                        ...clientPresets.map((item) => ({
                                          ...item,
                                          label: t(`dialogs.projectConfig.preset.${item.value}.label`),
                                        })),
                                        { value: 'custom', label: t('dialogs.projectConfig.customPresetLabel') },
                                      ]
                                    : clientPresets.map((item) => ({
                                        ...item,
                                        label: t(`dialogs.projectConfig.preset.${item.value}.label`),
                                      }))
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
                            <Form.Item label={t('dialogs.projectConfig.prototypeRootLabel')}>
                              <Input
                                value={client.prototypeRoot}
                                allowClear
                                placeholder={t('dialogs.projectConfig.prototypeRootPlaceholder')}
                                onChange={(event) =>
                                  updateClient(index, { ...client, prototypeRoot: event.target.value })
                                }
                              />
                            </Form.Item>
                          </div>
                        </Form>
                        <small>
                          {preset !== 'custom' && clientPresets.some((item) => item.value === preset)
                            ? t(`dialogs.projectConfig.preset.${preset}.description`)
                            : t('dialogs.projectConfig.customPresetDescription')}
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
