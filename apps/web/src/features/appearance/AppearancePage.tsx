/** Fixed-source settings layout with Preview-local persistence and sound feedback. */
import { useState, useSyncExternalStore, type CSSProperties } from 'react';
import { Card, Col, Row, Space, Typography, App } from '@preview/ui/admin';
import { SoundOutlined } from '@ant-design/icons';
import { Button } from '@preview/ui/admin';
import { ColorPicker, SegmentedControl, Select, Slider, Switch } from '@preview/ui';
import { usePlatformLocale } from '@/features/locale/platform-locale';
import { usePlatformTheme, type PlatformThemeMode } from '@/features/theme/platform-theme';
import {
  getMotionPreference,
  setMotionPreference,
  subscribeMotionPreference,
  type MotionPreference,
} from '@/features/motion/motion-preferences';
import { soundPreferences } from '@/features/sound/sound-preferences';
import {
  INTERACTION_SOUNDS,
  NOTIFICATION_SOUNDS,
  SOUND_LABELS,
  SOUND_PACKS,
  type SoundName,
} from '@/features/sound/sound-packs';
import { previewSound } from '@/features/sound/sound-service';
import { playSaveResult } from '@/features/sound/InteractionSounds';
import {
  RADIUS_DEFAULT,
  RADIUS_FULL,
  RADIUS_MAX,
  RADIUS_MIN,
  resolveRadii,
  useAppearancePreferences,
} from './appearance-preferences';

function useText() {
  const { locale } = usePlatformLocale();
  return (cn: string, en: string, hant = cn) => (locale === 'en' ? en : locale === 'zh-Hant' ? hant : cn);
}

function RadiusPreview({
  kind,
  radius,
  label,
}: {
  kind: 'container' | 'button' | 'input';
  radius: number;
  label: string;
}) {
  const shape: CSSProperties = {
    borderRadius: radius,
    display: 'inline-flex',
    alignItems: 'center',
    fontSize: 13,
  };
  const style: CSSProperties =
    kind === 'button'
      ? {
          ...shape,
          height: 32,
          padding: '0 16px',
          background: 'var(--rental-color-primary)',
          color: '#fff',
          fontWeight: 600,
        }
      : kind === 'input'
        ? {
            ...shape,
            height: 32,
            padding: '0 12px',
            minWidth: 120,
            border: '1px solid var(--rental-color-border)',
            background: 'var(--rental-color-bg-container)',
            color: 'var(--rental-color-text-description)',
          }
        : {
            ...shape,
            height: 44,
            padding: '0 18px',
            border: '1px solid var(--rental-color-border-secondary)',
            background: 'var(--rental-color-bg-container)',
            color: 'var(--rental-color-text)',
            boxShadow: 'var(--rental-box-shadow-tertiary)',
          };
  return (
    <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 10 }}>
      <span style={style}>{label}</span>
      <span style={{ color: 'var(--rental-color-text-description)', fontSize: 12 }}>{radius}px</span>
    </div>
  );
}

export function AppearancePage() {
  const text = useText();
  const { mode, setMode } = usePlatformTheme();
  const { preferences, save } = useAppearancePreferences();
  const [colorDraft, setColorDraft] = useState<{ base: string; value: string } | null>(null);
  const radiusRevision = JSON.stringify([preferences.container, preferences.button, preferences.input]);
  const [radiusDraft, setRadiusDraft] = useState<{
    base: string;
    value: ReturnType<typeof resolveRadii>;
  } | null>(null);
  const color = colorDraft?.base === preferences.themeColor ? colorDraft.value : preferences.themeColor;
  const radii = radiusDraft?.base === radiusRevision ? radiusDraft.value : resolveRadii(preferences);
  const setColor = (value: string) => setColorDraft({ base: preferences.themeColor, value });
  const setRadii = (update: (current: ReturnType<typeof resolveRadii>) => ReturnType<typeof resolveRadii>) =>
    setRadiusDraft({ base: radiusRevision, value: update(radii) });
  const { message: feedback } = App.useApp();
  const motion = useSyncExternalStore(
    subscribeMotionPreference,
    getMotionPreference,
    () => 'system' as const,
  );
  const persist = (kind: 'color' | 'radius') => {
    try {
      save(kind === 'color' ? { themeColor: color } : radii);
      void playSaveResult(true);
      void feedback.success(
        kind === 'color'
          ? text('主题色已保存', 'Theme color saved', '主題色已儲存')
          : text('圆角设置已保存', 'Corner settings saved', '圓角設定已儲存'),
      );
    } catch {
      void playSaveResult(false);
      void feedback.error(
        text(
          '无法保存，请检查浏览器存储权限后重试',
          'Unable to save. Check browser storage permissions and retry.',
          '無法儲存，請檢查瀏覽器儲存權限後重試',
        ),
      );
    }
  };
  const groups = [
    {
      kind: 'container' as const,
      label: text('容器圆角', 'Container corners', '容器圓角'),
      hint: text(
        '卡片、弹窗、抽屉、表格外框等大面',
        'Cards, dialogs, drawers and table frames',
        '卡片、彈窗、抽屜、表格外框等大面',
      ),
      preview: text('容器卡片', 'Container card'),
    },
    {
      kind: 'button' as const,
      label: text('按钮圆角', 'Button corners', '按鈕圓角'),
      hint: text(
        '按钮、分段控件、页签、选中菜单项',
        'Buttons, segmented controls, tabs and selected menu items',
        '按鈕、分段控制項、頁籤、選中選單項',
      ),
      preview: text('按钮', 'Button', '按鈕'),
    },
    {
      kind: 'input' as const,
      label: text('输入框圆角', 'Input corners', '輸入框圓角'),
      hint: text(
        '输入框、选择器、日期、数字等录入控件',
        'Text fields, selectors, dates and number inputs',
        '輸入框、選擇器、日期、數字等輸入控制項',
      ),
      preview: text('输入框示例', 'Example input', '輸入框範例'),
    },
  ];
  return (
    <section className="preview-appearance">
      <div className="page-header">
        <div className="page-toolbar">
          <div className="page-title-row">
            <h1 className="page-title">{text('外观与音效', 'Appearance & sound', '外觀與音效')}</h1>
          </div>
        </div>
      </div>
      <Space orientation="vertical" size={16} style={{ width: '100%' }}>
        <Card size="small" title={text('显示模式', 'Display mode', '顯示模式')}>
          <SegmentedControl
            label={text('显示模式', 'Display mode', '顯示模式')}
            value={mode}
            onValueChange={(value) => setMode(value as PlatformThemeMode)}
            options={[
              { value: 'glass', label: text('浅色', 'Light', '淺色') },
              { value: 'dark', label: text('深色', 'Dark') },
              { value: 'system', label: text('跟随系统', 'System', '跟隨系統') },
            ]}
          />
        </Card>
        <Card size="small" title={text('管理后台主题色', 'Admin theme color', '管理後台主題色')}>
          <Typography.Paragraph type="secondary" className="text-meta" style={{ marginBottom: 12 }}>
            {text(
              '仅影响当前浏览器中的 Preview 主色；留空使用平台默认色。',
              'Changes the Preview accent in this browser. Leave empty for the platform default.',
              '僅影響目前瀏覽器中的 Preview 主色；留空使用平台預設色。',
            )}
          </Typography.Paragraph>
          <div className="arc-color-field preview-color-setting">
            <ColorPicker
              label={text('主题色', 'Theme color', '主題色')}
              value={color || '#353535'}
              onValueChange={(hex) => setColor(hex.slice(0, 7).toUpperCase())}
            />
            {color && (
              <Button size="small" onClick={() => setColor('')}>
                {text('恢复系统色', 'Restore system color', '恢復系統色')}
              </Button>
            )}
            <span className="text-meta">
              {text('颜色不使用透明度', 'Colors use full opacity', '顏色不使用透明度')}
            </span>
          </div>
          <Button type="primary" onClick={() => persist('color')}>
            {text('保存主题色', 'Save theme color', '儲存主題色')}
          </Button>
        </Card>
        <Card
          size="small"
          title={text('管理后台圆角（分组）', 'Admin corner radii (groups)', '管理後台圓角（分組）')}
        >
          <Typography.Paragraph type="secondary" className="text-meta" style={{ marginBottom: 12 }}>
            {text(
              '三组圆角独立调整；留空沿用统一圆角，圆形与胶囊控件保留原形态。',
              'Adjust three corner groups independently. Circular and pill controls keep their shape.',
              '三組圓角獨立調整；留空沿用統一圓角，圓形與膠囊控制項保留原形態。',
            )}
          </Typography.Paragraph>
          <Row gutter={[16, 0]}>
            {groups.map(({ kind, label, hint, preview }) => {
              const full = kind === 'button',
                max = RADIUS_MAX + (full ? 4 : 0);
              return (
                <Col xs={24} md={8} key={kind}>
                  <div className="preview-radius-field">
                    <Slider
                      label={label}
                      min={RADIUS_MIN}
                      max={max}
                      step={1}
                      value={radii[kind] === RADIUS_FULL ? max : radii[kind]}
                      onValueChange={(value) =>
                        setRadii((current) => ({
                          ...current,
                          [kind]: full && value > RADIUS_MAX ? RADIUS_FULL : value,
                        }))
                      }
                      marks={[
                        { value: RADIUS_MIN, label: `${RADIUS_MIN}px` },
                        { value: RADIUS_DEFAULT, label: `${RADIUS_DEFAULT}px` },
                        { value: max, label: `${full ? RADIUS_FULL : RADIUS_MAX}px` },
                      ]}
                      format={(value) => `${full && value > RADIUS_MAX ? RADIUS_FULL : value}px`}
                    />
                    <span className="text-meta">{hint}</span>
                  </div>
                  <RadiusPreview kind={kind} radius={radii[kind]} label={preview} />
                </Col>
              );
            })}
          </Row>
          <Button type="primary" onClick={() => persist('radius')} style={{ marginTop: 16 }}>
            {text('保存圆角设置', 'Save corner settings', '儲存圓角設定')}
          </Button>
        </Card>
        <Card size="small" title={text('界面动效', 'Interface motion', '介面動效')}>
          <div className="arc-segmented">
            <SegmentedControl
              label={text('动效偏好', 'Motion preference', '動效偏好')}
              value={motion}
              onValueChange={(value) => setMotionPreference(value as MotionPreference)}
              options={[
                { value: 'system', label: text('跟随系统', 'Follow system', '跟隨系統') },
                { value: 'full', label: text('完整动效', 'Full motion', '完整動效') },
                { value: 'reduced', label: text('减少动效', 'Reduced motion', '減少動效') },
              ]}
            />
          </div>
          <Typography.Paragraph
            className="text-meta"
            type="secondary"
            style={{ marginTop: 'var(--space-2)', marginBottom: 0 }}
          >
            {text(
              '仅保存在当前浏览器，立即生效。',
              'Saved in this browser and applied immediately.',
              '僅儲存在目前瀏覽器，立即生效。',
            )}
          </Typography.Paragraph>
        </Card>
        <SoundSettings />
      </Space>
    </section>
  );
}

function SoundSettings() {
  const text = useText();
  const prefs = useSyncExternalStore(soundPreferences.subscribe, soundPreferences.getSnapshot);
  const { message: feedback } = App.useApp();
  const preview = async (name: SoundName) => {
    if (!prefs.volume) {
      void feedback.info(
        text(
          '当前音量为 0，请先调高音量再试听。',
          'Volume is zero. Increase it before previewing.',
          '目前音量為 0，請先調高音量再試聽。',
        ),
      );
      return;
    }
    if (!(await previewSound(name)))
      void feedback.warning(
        text(
          '无法播放音效，请检查浏览器音频权限与输出设备后重试。',
          'Unable to play. Check audio permissions and output device.',
          '無法播放音效，請檢查瀏覽器音訊權限與輸出設備後重試。',
        ),
      );
  };
  const english: Record<SoundName, string> = {
    press: 'Button',
    tick: 'Check / switch',
    release: 'Close / delete',
    page: 'Navigate',
    pulse: 'Save / submit',
    notification: 'New notification',
    success: 'Success',
    error: 'Error',
    attention: 'Attention',
  };
  const hant: Record<SoundName, string> = {
    press: '按鈕',
    tick: '勾選 / 開關',
    release: '關閉 / 刪除',
    page: '連結跳轉',
    pulse: '儲存 / 提交',
    notification: '新通知',
    success: '操作成功',
    error: '操作失敗',
    attention: '需要關注',
  };
  const samples = (names: readonly SoundName[]) => (
    <Space wrap>
      {names.map((name) => (
        <Button key={name} size="small" data-sound-preview={name} onClick={() => void preview(name)}>
          {text(SOUND_LABELS[name], english[name], hant[name])}
        </Button>
      ))}
    </Space>
  );
  return (
    <Card
      size="small"
      title={
        <Space>
          <SoundOutlined />
          {text('界面音效', 'Interface sounds', '介面音效')}
        </Space>
      }
      data-sound-silent
    >
      <Space orientation="vertical" size={16} style={{ width: '100%' }}>
        <Space wrap>
          <Typography.Text>{text('音效方案', 'Sound pack')}</Typography.Text>
          <div
            className="arc-select-field"
            style={{ minWidth: 'min(100%, var(--rental-control-width-select))' }}
          >
            <Select
              label={text('音效方案', 'Sound pack')}
              value={prefs.pack}
              options={SOUND_PACKS.map((pack, index) => ({
                value: pack.id,
                label: text(pack.label, `Sound ${index + 1}`),
              }))}
              onValueChange={(pack) => soundPreferences.update({ pack })}
            />
          </div>
        </Space>
        <Space wrap>
          <Switch
            aria-label={text('交互音效', 'Interaction sounds')}
            checked={prefs.interactionEnabled}
            onCheckedChange={(interactionEnabled) => soundPreferences.update({ interactionEnabled })}
          />
          <Typography.Text>{text('交互音效', 'Interaction sounds')}</Typography.Text>
          <Typography.Text type="secondary">
            {text(
              '按钮、勾选、开关与页面跳转的轻微反馈。',
              'Subtle feedback for buttons, checks, switches and navigation.',
              '按鈕、勾選、開關與頁面跳轉的輕微回饋。',
            )}
          </Typography.Text>
        </Space>
        <Space wrap>
          <Switch
            aria-label={text('通知与结果音', 'Notification and result sounds', '通知與結果音')}
            checked={prefs.notificationEnabled}
            onCheckedChange={(notificationEnabled) => soundPreferences.update({ notificationEnabled })}
          />
          <Typography.Text>
            {text('通知与结果音', 'Notification and result sounds', '通知與結果音')}
          </Typography.Text>
          <Typography.Text type="secondary">
            {text(
              '仅在已接入的操作结果或通知事件到达时播放。',
              'Plays when connected operation results or notification events arrive.',
              '僅在已接入的操作結果或通知事件到達時播放。',
            )}
          </Typography.Text>
        </Space>
        <div style={{ width: '100%', maxWidth: 360 }}>
          <Slider
            label={text('音量', 'Volume')}
            min={0}
            max={100}
            value={Math.round(prefs.volume * 100)}
            format={(value) => `${value}%`}
            onValueChange={(value) => soundPreferences.update({ volume: value / 100 })}
          />
        </div>
        <Space orientation="vertical" size={8}>
          <Typography.Text>{text('交互音试听', 'Preview interaction sounds', '交互音試聽')}</Typography.Text>
          {samples(INTERACTION_SOUNDS)}
          <Typography.Text>{text('通知音试听', 'Preview notification sounds', '通知音試聽')}</Typography.Text>
          {samples(NOTIFICATION_SOUNDS)}
        </Space>
        <Typography.Paragraph type="secondary" style={{ marginBottom: 0 }}>
          {text(
            '设置仅保存在当前浏览器，无需点击保存。试听不改变开关；音量为 0 时静音。',
            'Settings save in this browser automatically. Previews do not change switches; zero volume is silent.',
            '設定僅儲存在目前瀏覽器，無需點擊儲存。試聽不改變開關；音量為 0 時靜音。',
          )}
          <br />
          {text(
            '当前已接入主题色和圆角的本地保存结果；通知中心尚未接入，新通知与关注音暂供试听。',
            'Connected to local theme and corner saves. New notification and attention sounds are available as previews.',
            '目前已接入主題色和圓角的本地儲存結果；通知中心尚未接入，新通知與關注音暫供試聽。',
          )}
        </Typography.Paragraph>
      </Space>
    </Card>
  );
}
