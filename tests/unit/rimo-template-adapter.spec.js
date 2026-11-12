import { describe, expect, it } from 'vitest';
import {
  extractRimoBusinessSurface,
  authoredRimoPages,
  authoredRimoModels,
} from '../../scripts/rimo-business-content.mjs';
import {
  adaptRimoBusinessLayout,
  rimoEventProperty,
  rimoContainerQuery,
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
  it('retains authored responsive column choices and adapts only fixed grids', () => {
    const surface = extractRimoBusinessSurface('<body><!-- PAGE_CONTENT_START --><div data-business-content><div class="responsive grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3"><h2>客户和用车资料</h2><el-input v-model="customer"/></div><div class="fixed grid grid-cols-4"><span>统计</span></div></div><!-- PAGE_CONTENT_END --></body>', page);
    adaptRimoBusinessLayout(surface, page);
    expect(surface.content.querySelector('.responsive').hasAttribute('data-rimo-grid')).toBe(false);
    expect(surface.content.querySelector('.fixed').getAttribute('data-rimo-grid')).toBe('4');
  });

  it('adapts width breakpoints to the preview container without changing print or user preferences', () => {
    expect(rimoContainerQuery('screen and (max-width: 960px)')).toBe('(max-width: 960px)');
    expect(rimoContainerQuery('(width >= 48rem)')).toBe('(width >= 48rem)');
    expect(rimoContainerQuery('(min-width: 400px) and (max-width: 800px)')).toBe('(min-width: 400px) and (max-width: 800px)');
    expect(rimoContainerQuery('(prefers-color-scheme: dark)')).toBeNull();
    expect(rimoContainerQuery('print and (max-width: 960px)')).toBeNull();
    expect(rimoContainerQuery('(prefers-reduced-motion: reduce)')).toBeNull();
  });
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

  it('collects nested section filters and removes only their standalone count', () => {
    const markup = source.replace('<div class="filter-toolbar">', '<section class="filter-toolbar"><div><span>共 {{ count }} 条记录</span>')
      .replace('</el-button></div>\n<el-table', '</el-button></div></section>\n<div><el-table')
      .replace('</el-table>\n<el-pagination', '</el-table></div>\n<el-pagination')
      .replace('<h1>车辆资料</h1>', '<h1>车辆资料</h1><span>共 {{ companies }} 家企业</span>');
    const surface = extractRimoBusinessSurface(markup, page);
    const before = rimoTemplateContract(surface);
    expect(adaptRimoBusinessLayout(surface, page)).toMatchObject({ tableToolbars: 1, listNotes: 1 });
    expect(surface.content.textContent).not.toContain('条记录');
    expect(surface.content.textContent).toContain('家企业');
    expect(surface.content.textContent).toContain('营运中 {{ count }}');
    expect(surface.content.querySelector('el-pagination').getAttribute(':total')).toBe('count');
    expect(rimoTemplateContract(surface)).toEqual(before);
  });

  it('replaces paired width conditions with one controlled field and leaves business conditions intact', () => {
    const surface = extractRimoBusinessSurface(source.replace('<el-select v-model="status">', '<el-select v-if="filterLayoutTier >= 2" v-model="status">')
      .replace('<el-button @click="reset">', '<el-button @click="moreFiltersVisible = !moreFiltersVisible">更多筛选</el-button><div v-show="moreFiltersVisible"><el-select v-if="filterLayoutTier < 2" v-model="status"><el-option label="全部" value=""/></el-select><el-input v-model="owner"/></div><el-button @click="reset">'), page);
    const result = adaptRimoBusinessLayout(surface, page);
    const fields = surface.content.querySelectorAll('el-select');
    expect(fields).toHaveLength(1);
    expect(fields[0].hasAttribute('v-if')).toBe(false);
    expect(surface.content.querySelector('[v-model="owner"]').getAttribute('data-rimo-secondary')).toBe('true');
    expect(surface.content.querySelector('[v-if="row.enabled"]')).not.toBeNull();
    expect(surface.content.textContent).not.toContain('更多筛选');
    expect(result.presentationChanges.length).toBeGreaterThan(0);
  });

  it('rejects responsive copies with different business options', () => {
    const surface = extractRimoBusinessSurface(source.replace('<el-select v-model="status">', '<el-select v-if="filterLayoutTier >= 2" v-model="status">')
      .replace('<el-button @click="reset">', '<div v-show="moreFiltersVisible"><el-select v-if="filterLayoutTier < 2" v-model="status"><el-option label="审核" value="review"/></el-select></div><el-button @click="reset">'), page);
    expect(() => adaptRimoBusinessLayout(surface, page)).toThrow('Unmatched responsive filter');
  });

  it('shares filters across mutually exclusive tables without changing their conditions', () => {
    const surface = extractRimoBusinessSurface(source.replace('<el-table :data="rows"', '<template v-if="mode === \'list\'"><el-table :data="rows"')
      .replace('</el-table>\n<el-pagination', '</el-table></template><template v-else><el-table :data="grouped"><el-table-column label="分组" prop="group"/></el-table></template>\n<el-pagination'), page);
    const before = rimoTemplateContract(surface);
    expect(adaptRimoBusinessLayout(surface, page).tableToolbars).toBe(2);
    expect(surface.content.querySelectorAll('[data-rimo-shared-toolbar]')).toHaveLength(2);
    expect(surface.content.querySelectorAll('[data-rimo-list]')).toHaveLength(1);
    expect(rimoTemplateContract(surface)).toEqual(before);
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

  it('marks wide mail layout tables without changing branding or icon dimensions', () => {
    const email = { pageKey: 'email', clientId: 'email' };
    const surface = extractRimoBusinessSurface('<body><table width="918" class="mail-frame"><tbody><tr><td><table width="818"><tbody><tr><td><table><tbody><tr><td><div class="support-title">联系客服</div><img width="34" src="support.png"/></td></tr></tbody></table></td></tr></tbody></table><table width="30"><tbody><tr><td>图标</td></tr></tbody></table></td></tr></tbody></table></body>', email);
    adaptRimoBusinessLayout(surface, email);
    expect(surface.content.querySelectorAll('[data-rimo-mail-fluid]')).toHaveLength(2);
    expect(surface.content.querySelector('.mail-frame').hasAttribute('data-rimo-mail-stack')).toBe(false);
    expect(surface.content.querySelector('table[width="818"]').getAttribute('data-rimo-mail-stack')).toBe('true');
    expect(surface.content.querySelector('table[width="30"]').hasAttribute('data-rimo-mail-fluid')).toBe(false);
    expect(surface.content.querySelector('img').attributes).toMatchObject({ width: '34', src: 'support.png' });
  });

  it('lets fixed-width inline fields wrap while keeping their model and action contracts', () => {
    const surface = extractRimoBusinessSurface(source.replace('<h1>车辆资料</h1>', '<h1>车辆资料</h1><div class="flex min-w-[360px]"><el-select v-model="insurance"><el-option label="基础方案" value="basic"/></el-select><el-button @click="quote">试算</el-button></div>'), page);
    const before = rimoTemplateContract(surface);
    adaptRimoBusinessLayout(surface, page);
    expect(surface.content.querySelector('[data-rimo-layout="field-row"] el-select').getAttribute('v-model')).toBe('insurance');
    expect(rimoTemplateContract(surface)).toEqual(before);
  });

  it('stacks form panels and nested date rows without changing the business controls', () => {
    const surface = extractRimoBusinessSurface(source.replace('<h1>车辆资料</h1>', '<h1>车辆资料</h1><div class="grid grid-cols-2"><el-card><el-select v-model="customer"/></el-card><el-card><div class="grid grid-cols-2"><div><el-select v-model="station"/></div><div><el-date-picker v-model="pickup" @change="quote"/></div></div></el-card></div>'), page);
    const before = rimoTemplateContract(surface);
    adaptRimoBusinessLayout(surface, page);
    expect(surface.content.querySelectorAll('[data-rimo-layout="form-grid"]')).toHaveLength(2);
    expect(surface.overlays[0].querySelector('.form-grid').getAttribute('data-rimo-layout')).toBe('form-grid');
    expect(surface.content.querySelector('el-date-picker').getAttribute('v-model')).toBe('pickup');
    expect(rimoTemplateContract(surface)).toEqual(before);
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
