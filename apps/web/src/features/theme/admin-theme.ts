/** UI-only projection of the fixed admin arcTokens/theme baseline. No account,
 * tenant, settings or Rental OS runtime is consulted. */
import { theme, type ThemeConfig } from 'antd';
import { DEFAULT_UI_RADII } from '@preview/ui';
import { resolveRadii, type AppearancePreferences } from '@/features/appearance/appearance-preferences';

// Same OKLCH conversion as the preserved upstream arcTokens.ts.
function oklchToHex(lightness: number, chroma = 0, hue = 0) {
  const angle = (hue * Math.PI) / 180,
    a = chroma * Math.cos(angle),
    b = chroma * Math.sin(angle);
  const l = (lightness + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (lightness - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (lightness - 0.0894841775 * a - 1.291485548 * b) ** 3;
  return (
    '#' +
    [
      4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
      -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
      -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
    ]
      .map((value) => {
        const linear = Math.max(0, Math.min(1, value));
        return Math.round(255 * (linear <= 0.0031308 ? 12.92 * linear : 1.055 * linear ** (1 / 2.4) - 0.055))
          .toString(16)
          .padStart(2, '0');
      })
      .join('')
      .toUpperCase()
  );
}

export function createNativeAntTheme(dark: boolean, preferences?: AppearancePreferences): ThemeConfig {
  const radii = preferences ? resolveRadii(preferences) : DEFAULT_UI_RADII;
  const primary = preferences?.themeColor || oklchToHex(dark ? 0.8 : 0.33);
  const status = dark
    ? {
        Success: ['#8DDBB3', '#1B3329'],
        Warning: ['#F4CC86', '#3A2D1B'],
        Error: ['#FFADB4', '#3E2329'],
        Info: ['#A5C7FF', '#203149'],
      }
    : {
        Success: ['#176B45', '#EDF7F0'],
        Warning: ['#925600', '#FFF5E3'],
        Error: ['#B42332', '#FFF0F1'],
        Info: ['#2359B8', '#EDF3FF'],
      };
  return {
    algorithm: dark ? theme.darkAlgorithm : theme.defaultAlgorithm,
    cssVar: { key: 'preview-native', prefix: 'rental' },
    token: {
      fontFamily:
        "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif",
      fontSize: 14,
      lineHeight: 22 / 14,
      borderRadius: radii.button,
      borderRadiusXS: Math.max(4, Math.round(radii.button * 0.5)),
      borderRadiusSM: Math.max(4, Math.round(radii.button * 0.75)),
      borderRadiusLG: radii.container,
      fontWeightStrong: 600,
      controlHeight: 36,
      controlHeightSM: 32,
      controlHeightLG: 40,
      colorPrimary: primary,
      colorLink: primary,
      colorBgLayout: oklchToHex(dark ? 0.19 : 1),
      colorBgContainer: oklchToHex(dark ? 0.215 : 1),
      colorBgElevated: oklchToHex(dark ? 0.24 : 1),
      colorText: oklchToHex(dark ? 0.96 : 0.15),
      colorTextSecondary: oklchToHex(dark ? 0.77 : 0.46),
      colorBorder: oklchToHex(dark ? 0.29 : 0.935),
      ...Object.fromEntries(
        Object.entries(status).flatMap(([name, [ink, surface]]) => [
          [`color${name}`, ink],
          [`color${name}Text`, ink],
          [`color${name}TextActive`, ink],
          [`color${name}TextHover`, ink],
          [`color${name}Bg`, surface],
          [`color${name}BgHover`, surface],
          [`color${name}Border`, surface],
        ]),
      ),
    },
    components: {
      Input: {
        borderRadius: radii.input,
        borderRadiusSM: Math.max(4, Math.round(radii.input * 0.75)),
        borderRadiusLG: radii.input,
      },
      Select: {
        borderRadius: radii.input,
        borderRadiusSM: Math.max(4, Math.round(radii.input * 0.75)),
        borderRadiusLG: radii.input,
      },
      Card: { borderRadiusLG: radii.container },
      Modal: { borderRadiusLG: radii.container },
    },
  };
}

/** Apply the same generated color variables used by the original Ant cssVar
 * scope, while keeping AntApp's global anchor rules outside the native frame. */
export function applyNativeAntColors(root: HTMLElement, dark: boolean, preferences?: AppearancePreferences) {
  const tokens = theme.getDesignToken(createNativeAntTheme(dark, preferences));
  const previous = new Map<string, string>();
  const previousAccent = root.dataset.tenantAccent;
  if (preferences?.themeColor) root.dataset.tenantAccent = '';
  else delete root.dataset.tenantAccent;
  const set = (property: string, value: string) => {
    previous.set(property, root.style.getPropertyValue(property));
    root.style.setProperty(property, value);
  };
  for (const [name, value] of Object.entries(tokens)) {
    if (!name.startsWith('color') || typeof value !== 'string') continue;
    const property = '--rental-' + name.replace(/[A-Z]/g, (letter) => '-' + letter.toLowerCase());
    set(property, value);
  }
  const radii = preferences ? resolveRadii(preferences) : DEFAULT_UI_RADII;
  for (const [name, radius] of Object.entries({
    container: radii.container,
    button: radii.button,
    input: radii.input,
    lg: radii.container,
    control: radii.button,
    sm: Math.max(4, Math.round(radii.button * 0.75)),
    'input-sm': Math.max(4, Math.round(radii.input * 0.75)),
  }))
    set(`--rental-ui-radius-${name}`, `${radius}px`);
  if (preferences?.themeColor) {
    const hex = preferences.themeColor.slice(1),
      expanded = hex.length === 3 ? [...hex].map((char) => char + char).join('') : hex;
    const channels = [0, 2, 4].map((offset) => parseInt(expanded.slice(offset, offset + 2), 16));
    const luminance = channels
      .map((channel) => {
        const n = channel / 255;
        return n <= 0.04045 ? n / 12.92 : ((n + 0.055) / 1.055) ** 2.4;
      })
      .reduce((sum, channel, index) => sum + channel * [0.2126, 0.7152, 0.0722][index], 0);
    const ink = luminance > 0.179 ? '#000000' : '#FFFFFF';
    for (const [name, value] of Object.entries({
      '--accent': preferences.themeColor,
      '--accent-strong': preferences.themeColor,
      '--accent-subtle': `rgb(${channels.join(' ')} / ${dark ? '.2' : '.1'})`,
      '--accent-foreground': ink,
      '--control-on': preferences.themeColor,
      '--control-glyph': ink,
      '--control-thumb-on': ink,
      '--control-fill': preferences.themeColor,
    }))
      set(name, value);
  }
  return () => {
    if (previousAccent === undefined) delete root.dataset.tenantAccent;
    else root.dataset.tenantAccent = previousAccent;
    for (const [property, value] of previous) {
      if (value) root.style.setProperty(property, value);
      else root.style.removeProperty(property);
    }
  };
}
