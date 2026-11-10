import { describe, expect, it } from 'vitest';
import { extractRimoBusinessSurface, mapRimoStyleAssets } from '../../scripts/rimo-business-content.mjs';

const page = { pageKey: 'example', clientId: 'operation' };
const sample = `
<html><head><style>.prototype-sidebar{width:240px}</style><style data-page-style>.form-grid{display:grid}</style></head>
<body><div id="app"><aside class="prototype-sidebar">旧菜单</aside><header data-prototype-shell="topbar">旧顶栏</header>
<!-- PAGE_CONTENT_START -->
<section data-page-content><div data-business-content><h1>车辆资料</h1><el-input v-model="draft.plate"/><el-button @click="save" :disabled="!draft.plate">保存</el-button></div></section>
<!-- PAGE_CONTENT_END -->
<!-- PAGE_OVERLAYS_START -->
<div><el-dialog v-model="open" title="编辑车辆"><el-input v-model="draft.model" /></el-dialog></div>
<!-- PAGE_OVERLAYS_END -->
</div></body></html>`;

describe('RIMO business surface boundary', () => {
  it('routes inline background images through the controlled page asset resolver', () => {
    const assets = {};
    const result = mapRimoStyleAssets(
      "background: url('https://example.com/hero.png') center; mask: url(#symbol)",
      assets,
    );
    expect(result).not.toContain('https://');
    expect(result).toContain('var(--rimo-asset-');
    expect(result).toContain('url(#symbol)');
    expect(Object.values(assets)).toEqual(['https://example.com/hero.png']);
  });
  it('retains business fields, actions and overlays without importing shell or theme styles', () => {
    const result = extractRimoBusinessSurface(sample, page);
    expect(result.content.toString()).toContain('车辆资料');
    expect(result.content.toString()).not.toContain('旧菜单');
    expect(result.content.toString()).not.toContain('旧顶栏');
    expect(result.stylesheet).toBe('.form-grid{display:grid}');
    expect(result.contract.fields.map((field) => field.value)).toEqual([
      'draft.plate',
      'open',
      'draft.model',
    ]);
    expect(result.contract.actions.map((action) => action.value)).toEqual(['save']);
    expect(result.contract.conditions.map((condition) => condition.value)).toEqual(['!draft.plate']);
    expect(result.contract.overlays).toEqual([{ title: '编辑车辆', state: 'open' }]);
  });

  it('does not fall back to app or body when the explicit content is missing', () => {
    expect(() => extractRimoBusinessSurface('<body><div id="app">Menu only</div></body>', page)).toThrow(
      'forbidden',
    );
  });

  it('rejects a duplicated application header inside business content', () => {
    expect(() =>
      extractRimoBusinessSurface(
        sample.replace('<h1>', '<header class="prototype-topbar">Menu</header><h1>'),
        page,
      ),
    ).toThrow('chrome');
  });

  it('preserves meaningful business filter panels and incomplete source markup', () => {
    const result = extractRimoBusinessSurface(
      sample
        .replace(
          '<h1>',
          '<div class="prototype-permission-switcher"><input v-model="permission" /></div><h1>',
        )
        .replace('</section>', ''),
      page,
    );
    expect(result.content.toString()).toContain('prototype-permission-switcher');
    expect(result.contract.fields.some((field) => field.value === 'permission')).toBe(true);
  });

  it('treats email branding as content, not as platform chrome', () => {
    const result = extractRimoBusinessSurface('<body><header>RIMO</header><p>验证码</p></body>', {
      pageKey: 'email',
      clientId: 'email',
    });
    expect(result.content.toString()).toContain('RIMO');
  });
});
