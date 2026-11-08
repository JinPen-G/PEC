/** Fixed upstream Drawer supplies focus, dismissal, spring motion and reduced
 * motion. Only the theme controls and Preview preference binding are adapted. */
import { useState, type CSSProperties } from 'react';
import { Check, Copy } from 'lucide-react';
import { Drawer, DrawerContent } from './auth-registry/components/drawer/drawer';

export const SITE_ACCENTS = [
  { key: 'neutral', label: '灰色', color: '#747474' },
  { key: 'violet', label: '紫色', color: '#7747ff' },
  { key: 'blue', label: '蓝色', color: '#0562ef' },
  { key: 'green', label: '绿色', color: '#0db879' },
  { key: 'amber', label: '琥珀', color: '#f3ad20' },
  { key: 'orange', label: '橙色', color: '#f48120' },
  { key: 'coral', label: '珊瑚', color: '#f15f55' },
  { key: 'rose', label: '玫红', color: '#ed4e9d' },
];
export function ThemeDrawer({
  open,
  onOpenChange,
  accent,
  dark,
  onAccent,
  onTheme,
  text = (value) => value,
  restoreFocus,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  accent: string;
  dark: boolean;
  onAccent: (color: string) => void;
  onTheme: (dark: boolean) => void;
  text?: (value: string) => string;
  restoreFocus?: () => void;
}) {
  const [portal, setPortal] = useState<HTMLDivElement | null>(null);
  const [feedback, setFeedback] = useState('');
  return (
    <>
      <div ref={setPortal} className="showcase-portal" />
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent
          container={portal}
          title={text('外观设置')}
          closeLabel={text('关闭外观设置')}
          className="showcase-theme-drawer"
          onCloseAutoFocus={(event) => {
            if (restoreFocus) {
              event.preventDefault();
              restoreFocus();
            }
          }}
        >
          <div className="page_customize___UfMA">
            <section className="page_customizeSection__fUo0N">
              <h3>{text('主题色')}</h3>
              <div className="page_swatches__qgnmc">
                {SITE_ACCENTS.map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    className={`page_swatch__QzvDJ${accent === item.key ? ' page_swatchActive__sCghy' : ''}`}
                    style={{ '--swatch': item.color } as CSSProperties}
                    aria-label={text(`${item.label}主题色`)}
                    aria-pressed={accent === item.key}
                    onClick={() => {
                      try {
                        onAccent(item.key === 'neutral' ? '' : item.color);
                        setFeedback('');
                      } catch {
                        setFeedback(text('无法保存主题色，请检查浏览器存储权限'));
                      }
                    }}
                  >
                    {accent === item.key && <Check size={15} />}
                  </button>
                ))}
              </div>
              <button
                className="page_customizeCopy__2jpfL"
                onClick={() => {
                  const style = getComputedStyle(
                    portal?.closest('.uiarc-showcase') ?? document.documentElement,
                  );
                  const theme = ['--accent', '--accent-strong', '--accent-subtle']
                    .map((token) => `  ${token}: ${style.getPropertyValue(token).trim()};`)
                    .join('\n');
                  void navigator.clipboard.writeText(`:root {\n${theme}\n}`).then(
                    () => setFeedback(text('已复制主题 CSS')),
                    () => setFeedback(text('复制失败，请检查剪贴板权限')),
                  );
                }}
              >
                <Copy size={14} />
                {text('复制主题 CSS')}
              </button>
            </section>
            <section className="page_customizeSection__fUo0N">
              <h3>{text('主题')}</h3>
              <div className="page_appearanceChoices__9wQl1" role="group" aria-label={text('深浅色主题')}>
                <button aria-pressed={!dark} onClick={() => onTheme(false)}>
                  {text('浅色')}
                </button>
                <button aria-pressed={dark} onClick={() => onTheme(true)}>
                  {text('深色')}
                </button>
              </div>
            </section>
            <p role="status" className="showcase-muted">
              {feedback}
            </p>
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
}
