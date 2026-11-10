import { describe, expect, it } from 'vitest';
import {
  extractRimoBusinessSurface,
  authoredRimoPages,
  authoredRimoModels,
} from '../../scripts/rimo-business-content.mjs';
import {
  adaptRimoBusinessLayout,
  rimoEventProperty,
  rimoScopedSelector,
  rimoTemplateContract,
  rimoThemeColors,
} from '../../scripts/rimo-template-adapter.mjs';

const page = { pageKey: 'example', clientId: 'operation' };
const source = `<body>
<!-- PAGE_CONTENT_START -->
<div data-business-content>
<div><div><h1>车辆资料</h1><p>维护车辆信息。</p></div><el-button @click="create">新增</el-button></div>
<div class="summary-grid"><div @click="filter('active')" :class="{ 'is-active': active }">营运中 {{ count }}</div></div>
<div class="bg-white border"><div class="filter-toolbar"><el-input v-model="keyword"/><el-select v-model="status"><el-option label="全部" value=""/></el-select><el-button @click="reset">重置</el-button></div>
<el-table :data="rows" @selection-change="select"><el-table-column label="车牌" prop="plate"><template #default="{ row }"><el-button v-if="row.enabled" @click="edit(row)">{{ row.plate }}</el-button></template></el-table-column></el-table>
<el-pagination v-model:current-page="page" :total="count"/></div>
<div class="absolute pointer-events-none bg-gradient-to-l"></div>
</div>
<!-- PAGE_CONTENT_END -->
<!-- PAGE_OVERLAYS_START -->
<el-dialog v-model="open" title="编辑"><el-form ref="formRef" :model="draft"><div class="form-grid"><el-form-item prop="plate"><el-input v-model="draft.plate" :disabled="editing"/></el-form-item><el-form-item prop="vin"><el-input v-model="draft.vin"/></el-form-item></div></el-form></el-dialog>
<!-- PAGE_OVERLAYS_END -->
</body>`;

describe('RIMO template layout adaptation', () => {
  it('moves shared filters into the host table toolbar without changing any business contract', () => {
    const surface = extractRimoBusinessSurface(source, page);
    const before = rimoTemplateContract(surface);
    const result = adaptRimoBusinessLayout(surface, page);
    expect(result).toMatchObject({
      headings: 1,
      tableToolbars: 1,
      summaries: 1,
      formGrids: 1,
      decorations: 1,
      preserved: true,
    });
    expect(rimoTemplateContract(surface)).toEqual(before);
    const table = surface.content.querySelector('el-table');
    const templates = table.querySelectorAll('template');
    expect(
      templates
        .find((node) => node.hasAttribute('#toolbar'))
        .querySelector('el-input')
        .getAttribute('v-model'),
    ).toBe('keyword');
    expect(
      templates
        .find((node) => node.hasAttribute('#default'))
        .querySelector('el-button')
        .getAttribute('@click'),
    ).toBe('edit(row)');
    expect(surface.content.querySelector('.filter-toolbar')).toBeNull();
    expect(surface.overlays[0].querySelector('el-form').getAttribute('ref')).toBe('formRef');
  });

  it('does not lift conditional filters or remove meaningful navigation and diagrams', () => {
    const surface = extractRimoBusinessSurface(
      source
        .replace('class="filter-toolbar"', 'class="filter-toolbar" v-show="advanced"')
        .replace(
          'class="absolute pointer-events-none bg-gradient-to-l"',
          'class="absolute pointer-events-none bg-gradient-to-l" ref="chart"',
        ),
      page,
    );
    expect(adaptRimoBusinessLayout(surface, page)).toMatchObject({
      tableToolbars: 0,
      decorations: 0,
      preserved: true,
    });
    expect(surface.content.querySelector('.filter-toolbar').getAttribute('v-show')).toBe('advanced');
    expect(surface.content.querySelector('[ref="chart"]')).not.toBeNull();
  });

  it.each([
    ['<el-slider v-model="value"/>', 'unsupported control'],
    ['<el-input v-mystery="draft"/>', 'unsupported directive'],
    ['<el-button @click.once="save"/>', 'unsupported event modifier'],
  ])('fails explicitly instead of discarding unsupported markup: %s', (markup, message) => {
    const surface = extractRimoBusinessSurface(source.replace('<h1>车辆资料</h1>', markup), page);
    expect(() => adaptRimoBusinessLayout(surface, page)).toThrow(message);
  });

  it('leaves email branding untouched', () => {
    const email = { pageKey: 'email', clientId: 'email' };
    const surface = extractRimoBusinessSurface('<body><header>RIMO</header><p>验证码</p></body>', email);
    const before = surface.content.toString();
    expect(adaptRimoBusinessLayout(surface, email).preserved).toBe(true);
    expect(surface.content.toString()).toBe(before);
  });

  it.each([
    ['dragstart', 'onDragStart'],
    ['dragover', 'onDragOver'],
    ['dragend', 'onDragEnd'],
    ['keydown', 'onKeyDown'],
    ['selection-change', 'onSelectionChange'],
    ['closed', 'onClosed'],
  ])('maps %s to the actual React callback', (event, property) => {
    expect(rimoEventProperty(event)).toBe(property);
  });

  it('protects accepted views separately from business model extensions', () => {
    expect([...authoredRimoPages]).toEqual(['vehicle-groups', 'vehicle-transfer', 'pricing']);
    expect(authoredRimoModels.has('vehicles')).toBe(true);
    expect(authoredRimoPages.has('vehicles')).toBe(false);
  });

  it('retargets business styles from removed wrappers to the React page, not the entire host', () => {
    const scope = ':where([data-rimo-page="example"])';
    expect(rimoScopedSelector('.example .form-grid', scope, ['example'])).toBe(`${scope} .form-grid`);
    expect(rimoScopedSelector('.example:hover .item', scope, ['example'])).toBe(`${scope}:hover .item`);
    expect(rimoScopedSelector('.example-other .item', scope, ['example'])).toBe(
      `${scope} .example-other .item`,
    );
    expect(rimoScopedSelector('body .item', scope)).toBe(`${scope} .item`);
    expect(rimoScopedSelector('.example .item', scope, ['example+'])).toBe(`${scope} .example .item`);
  });

  it('uses host neutral colors without changing brand assets or unknown colors', () => {
    expect(rimoThemeColors('1px solid #e5e7eb')).toBe('1px solid var(--app-color-border)');
    expect(rimoThemeColors('#FFFFFF')).toBe('var(--app-color-panel)');
    expect(rimoThemeColors('#64748b')).toBe('var(--app-color-text-secondary)');
    expect(rimoThemeColors('url(#brand) #c21853')).toBe('url(#brand) #c21853');
  });
});
