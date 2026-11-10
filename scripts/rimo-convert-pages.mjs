/** Compile the audited RIMO page sources to ordinary React modules; no HTML or Vue ships at runtime. */
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { parse, parseExpression } from '@babel/parser';
import traverseImport from '@babel/traverse';
import generatorImport from '@babel/generator';
import * as types from '@babel/types';
import postcss from 'postcss';
import { compile as compileUtilities } from 'tailwindcss';
import { writeFileAtomic } from '../packages/project-core/src/filesystem.js';
import { authoredRimoModels, authoredRimoPages, extractRimoBusinessSurface, mapRimoStyleAssets } from './rimo-business-content.mjs';
import { adaptRimoBusinessLayout, rimoEventProperty, rimoScopedSelector, rimoThemeColors } from './rimo-template-adapter.mjs';

const traverse = traverseImport.default ?? traverseImport;
const generate = generatorImport.default ?? generatorImport;
const workspace = path.resolve(fileURLToPath(new URL('..', import.meta.url)));
const report = JSON.parse(await fs.readFile(path.join(workspace, 'output/rimo-import/inventory.json'), 'utf8'));
const archived = path.join(workspace, '.preview-data/archives/rimo-rental/2026-11-09/source');
const utilityTheme = await fs.readFile(path.join(workspace, 'node_modules/tailwindcss/theme.css'), 'utf8');
const clientNames = { '营运端': 'operation', '企业端': 'enterprise', '移动端': 'mobile', '公开页': 'public', 'Email信件模板': 'email' };
const aliases = { 'public/index': 'tutorial-index', 'public/tutorial': 'tutorial', 'public/tutorial_antd_v6_doc': 'tutorial-documentation', 'public/tutorial_editor': 'tutorial-editor', 'email/verification_code_email': 'verification-email' };
const clientOf = item => clientNames[item.path.split('/')[2]];
const codeOf = item => {
  const client = clientOf(item);
  const base = path.basename(item.path, '.html');
  return aliases[`${client}/${base}`] ?? `${client === 'operation' ? '' : `${client}-`}${base.replaceAll('_', '-')}`;
};
const pascal = value => value.split('-').map(part => part[0].toUpperCase() + part.slice(1)).join('');
const quote = value => JSON.stringify(value);
const returnedKeys = (current, seen = new Set()) => {
  if (!current?.node || seen.has(current.node)) return new Set();
  seen.add(current.node);
  const result = new Set();
  if (current.isObjectExpression()) {
    for (const property of current.get('properties')) {
      if (property.isSpreadElement()) for (const key of returnedKeys(property.get('argument'), seen)) result.add(key);
      else if (!property.node.computed) result.add(property.node.key.name ?? property.node.key.value);
    }
  } else if (current.isIdentifier()) {
    const binding = current.scope.getBinding(current.node.name);
    if (binding?.path.isVariableDeclarator()) return returnedKeys(binding.path.get('init'), seen);
    if (binding?.path.isFunction()) return returnedKeys(binding.path, seen);
  } else if (current.isCallExpression()) return returnedKeys(current.get('callee'), seen);
  else if (current.isFunction()) current.traverse({ ReturnStatement(returned) {
    if (returned.getFunctionParent() !== current) return;
    for (const key of returnedKeys(returned.get('argument'), seen)) result.add(key);
  } });
  return result;
};
const reactApi = { ref: 'cell', reactive: 'record', computed: 'derived', onMounted: 'onMount', onBeforeUnmount: 'onDispose', onUnmounted: 'onDispose', nextTick: 'nextTick', watch: 'watch', markRaw: 'markRaw', toRefs: 'toRefs' };
const htmlAttributes = { class: 'className', for: 'htmlFor', tabindex: 'tabIndex', rowspan: 'rowSpan', colspan: 'colSpan', readonly: 'readOnly', maxlength: 'maxLength', autocomplete: 'autoComplete', autofocus: 'autoFocus', viewbox: 'viewBox', 'stroke-width': 'strokeWidth', 'stroke-linecap': 'strokeLinecap', 'stroke-linejoin': 'strokeLinejoin', 'fill-rule': 'fillRule', 'clip-rule': 'clipRule', 'text-anchor': 'textAnchor', 'font-size': 'fontSize', 'font-weight': 'fontWeight' };
const camel = value => value.replace(/-([a-z])/g, (_match, letter) => letter.toUpperCase());
const nativeTags = new Set(['a','article','aside','b','blockquote','br','button','caption','circle','col','colgroup','dd','defs','div','dl','dt','ellipse','em','fieldset','footer','form','g','h1','h2','h3','h4','h5','h6','header','hr','i','img','input','label','legend','li','line','linearGradient','main','nav','ol','p','path','polygon','polyline','pre','rect','s','section','small','span','stop','strong','sub','sup','svg','table','tbody','td','text','textarea','tfoot','th','thead','tr','u','ul']);
const voidTags = new Set(['br','hr','input','img','col']);
const mapping = report.pages.map(item => ({ ...item, clientId: clientOf(item), pageKey: codeOf(item), component: `${pascal(codeOf(item))}Block`, entry: `${pascal(codeOf(item))}Page.tsx` }));

function expression(source, context) {
  const input = source?.trim() || 'undefined';
  const node = parseExpression(input, { plugins: ['jsx'] });
  const file = types.file(types.program([types.expressionStatement(node)]));
  traverse(file, {
    AssignmentExpression(current) {
      const target = current.node.left;
      if (target.type === 'Identifier' && context.bindings.has(target.name) && !current.scope.hasBinding(target.name) && !context.locals.has(target.name))
        current.node.left = types.memberExpression(types.identifier('view'), target);
    },
    UpdateExpression(current) {
      const target = current.node.argument;
      if (target.type === 'Identifier' && context.bindings.has(target.name) && !current.scope.hasBinding(target.name) && !context.locals.has(target.name))
        current.node.argument = types.memberExpression(types.identifier('view'), target);
    },
    ReferencedIdentifier(current) {
      if (context.bindings.has(current.node.name) && !current.scope.hasBinding(current.node.name) && !context.locals.has(current.node.name))
        current.replaceWith(types.memberExpression(types.identifier('view'), types.identifier(current.node.name)));
    },
  });
  return generate(file.program.body[0].expression, { comments: false }).code;
}

function eventHandler(source, modifiers, context) {
  let statement;
  try { statement = parseExpression(source.trim()); } catch { statement = null; }
  const callable = statement && ['Identifier', 'MemberExpression', 'ArrowFunctionExpression', 'FunctionExpression'].includes(statement.type);
  const file = parse(`function action(event) { ${callable ? `(${source})?.(event);` : source} }`);
  traverse(file, {
    AssignmentExpression(current) {
      const target = current.node.left;
      if (target.type === 'Identifier' && context.bindings.has(target.name) && !current.scope.hasBinding(target.name) && !context.locals.has(target.name))
        current.node.left = types.memberExpression(types.identifier('view'), target);
    },
    UpdateExpression(current) {
      const target = current.node.argument;
      if (target.type === 'Identifier' && context.bindings.has(target.name) && !current.scope.hasBinding(target.name) && !context.locals.has(target.name))
        current.node.argument = types.memberExpression(types.identifier('view'), target);
    },
    ReferencedIdentifier(current) {
      if (current.node.name === '$event') current.replaceWith(types.identifier('event'));
      else if (context.bindings.has(current.node.name) && !current.scope.hasBinding(current.node.name) && !context.locals.has(current.node.name))
        current.replaceWith(types.memberExpression(types.identifier('view'), types.identifier(current.node.name)));
    },
  });
  const body = file.program.body[0].body.body.map(statement => generate(statement, { comments: false }).code).join('\n');
  return `(event) => { ${modifiers.includes('stop') ? 'event.stopPropagation();' : ''} ${modifiers.includes('prevent') ? 'event.preventDefault();' : ''} ${modifiers.includes('enter') ? "if (event.key !== 'Enter') return;" : ''} ${body} }`;
}

function textNode(node, context) {
  const content = node.textContent;
  if (!content.trim()) return '';
  const fragments = [];
  let offset = 0;
  for (const match of content.matchAll(/\{\{([\s\S]*?)\}\}/g)) {
    if (match.index > offset) fragments.push(`{text(${quote(content.slice(offset, match.index))})}`);
    fragments.push(`{rimoText(${expression(match[1], context)})}`);
    offset = match.index + match[0].length;
  }
  if (offset < content.length) fragments.push(`{text(${quote(content.slice(offset))})}`);
  return fragments.join('');
}

function compileChildren(children, context) {
  const result = [];
  const meaningful = children.filter(node => node.nodeType !== 8 && (node.nodeType !== 3 || node.textContent.trim()));
  for (let index = 0; index < meaningful.length; index++) {
    const child = meaningful[index];
    if (child.nodeType === 1 && child.hasAttribute('v-if')) {
      const branches = [{ condition: child.getAttribute('v-if'), child }];
      while (meaningful[index + 1]?.nodeType === 1 && (meaningful[index + 1].hasAttribute('v-else-if') || meaningful[index + 1].hasAttribute('v-else'))) {
        index++;
        const next = meaningful[index];
        branches.push({ condition: next.getAttribute('v-else-if'), child: next });
      }
      let rendered = 'null';
      for (const branch of branches.reverse()) {
        const body = compileNode(branch.child, context, true);
        rendered = branch.condition === undefined ? `<>${body}</>` : `${expression(branch.condition, context)} ? <>${body}</> : (${rendered})`;
      }
      result.push(`{${rendered}}`);
    } else result.push(compileNode(child, context));
  }
  return result.join('\n');
}

function compileNode(node, context, conditionHandled = false) {
  if (node.nodeType === 3) return textNode(node, context);
  if (node.nodeType !== 1) return '';
  const originalTag = node.rawTagName.toLowerCase();
  const tag = ['html', 'body'].includes(originalTag) ? 'div' : originalTag;
  if (['script','style','link','meta'].includes(tag)) return '';
  const attributes = node.attributes;
  if (tag === 'component') return `<RimoIcon name={${expression(attributes[':is'] ?? "'Document'", context)}} />`;
  if (attributes['v-for']) {
    const match = /^\s*\(?\s*([^()]+?)\s*\)?\s+(?:in|of)\s+([\s\S]+)$/.exec(attributes['v-for']);
    if (!match) throw new Error(`Unsupported repeat: ${attributes['v-for']}`);
    const parameters = match[1].split(',').map(value => value.trim());
    const repeated = node.clone();
    repeated.removeAttribute('v-for');
    const scope = { ...context, locals: new Set([...context.locals, ...parameters]) };
    const key = attributes[':key'] ? expression(attributes[':key'], scope) : 'itemIndex';
    return `{rimoEntries(${expression(match[2], context)}).map(([${parameters.join(', ')}], itemIndex) => <Fragment key={${key}}>${compileNode(repeated, scope, conditionHandled)}</Fragment>)}`;
  }
  if (attributes['v-if'] && !conditionHandled) return `{${expression(attributes['v-if'], context)} ? <>${compileNode(node, context, true)}</> : null}`;
  const slots = [];
  const children = [];
  for (const child of node.childNodes) {
    const named = child.nodeType === 1 && child.rawTagName.toLowerCase() === 'template' && Object.keys(child.attributes).find(name => name.startsWith('#') || name.startsWith('v-slot:'));
    if (named) {
      const name = named.startsWith('#') ? named.slice(1) : named.slice(7);
      const parameter = child.getAttribute(named) || '_slot';
      const scope = { ...context, locals: new Set([...context.locals, ...parameter.match(/[a-zA-Z_$][\w$]*/g) ?? []]) };
      slots.push(`${quote(name)}: (${parameter}) => <>${compileChildren(child.childNodes, scope)}</>`);
    } else children.push(child);
  }
  if (tag === 'template') return `<>${compileChildren(children, context)}</>`;
  const component = tag.startsWith('el-');
  if (tag === 'component') return `<RimoIcon name={${expression(attributes[':is'] ?? 'undefined', context)}} />`;
  const parameters = [];
  if (component) parameters.push(`kind=${quote(tag)}`);
  else if (!nativeTags.has(tag)) return `<RimoIcon name=${quote(node.rawTagName)} />`;
  for (const [name, value] of Object.entries(attributes)) {
    if (['v-for','v-if','v-else','v-else-if','v-cloak','data-layout-type'].includes(name) || name.startsWith('#')) continue;
    if (name === 'background' && !component) {
      const variable = `--rimo-asset-${createHash('sha256').update(value).digest('hex').slice(0, 12)}`;
      context.assets[variable] = value;
      parameters.push(`style={{ backgroundImage: ${quote(`var(${variable}, none)`)} }}`);
      continue;
    }
    if (name === 'v-show') { parameters.push(`hidden={!(${expression(value, context)})}`); continue; }
    if (name === 'ref') { parameters.push(`${component ? 'modelRef' : 'ref'}={model.ref(${quote(value)})}`); continue; }
    if (name === 'v-model' || name.startsWith('v-model:')) {
      if (!component) {
        const checked = tag === 'input' && attributes.type === 'checkbox';
        parameters.push(`${checked ? 'checked' : 'value'}={${expression(value, context)}}`, `onChange={(event) => { ${expression(value, context)} = event.target.${checked ? 'checked' : 'value'}; }}`);
        continue;
      }
      const property = name === 'v-model' ? 'modelValue' : camel(name.slice(8));
      const update = name === 'v-model' ? 'onModelChange' : `on${property[0].toUpperCase()}${property.slice(1)}Change`;
      parameters.push(`${property}={${expression(value, context)}}`, `${update}={(value) => { ${expression(value, context)} = value; }}`);
      continue;
    }
    if (name.startsWith('@')) {
      const [event, ...modifiers] = name.slice(1).split('.');
      const property = rimoEventProperty(event);
      parameters.push(`${property}={${eventHandler(value, modifiers, context)}}`);
      continue;
    }
    const dynamic = name.startsWith(':');
    if (name === 'v-html') { parameters.push(`html={${expression(value, context)}}`, `as=${quote(tag)}`); continue; }
    const rawName = dynamic ? name.slice(1) : name;
    const property = rawName.startsWith('data-') || rawName.startsWith('aria-') ? rawName : htmlAttributes[rawName] ?? (component ? camel(rawName) : rawName);
    const templateValue = /^\{\{\s*(.*?)\s*\}\}$/.exec(value);
    if (!dynamic && templateValue) { parameters.push(`${property}={${expression(templateValue[1], context)}}`); continue; }
    if (dynamic) {
      let code = expression(value, context);
      if (/Icon$|^icon$/.test(property) && /^[A-Z][A-Za-z]+$/.test(value) && !context.bindings.has(value)) code = `rimoIcons.${value}`;
      if (property === 'className') code = `rimoClass(${code})`;
      if (property === 'style') code = `rimoStyle(${code})`;
      if (property === 'is') { parameters.push(`name={${code}}`); continue; }
      parameters.push(`${property}={${code}}`);
    } else if (property === 'style') parameters.push(`style={rimoStyle(${quote(mapRimoStyleAssets(value, context.assets))})}`);
    else if (!value && ((component && property !== 'value') || ['disabled', 'checked', 'multiple', 'required', 'readOnly'].includes(property))) parameters.push(`${property}={true}`);
    else parameters.push(`${property}=${quote(value)}`);
  }
  if (slots.length) parameters.push(`slots={{${slots.join(',')}}}`);
  const name = attributes['v-html'] ? 'RimoMarkup' : component ? 'RimoElement' : tag === 'img' ? 'RimoImage' : tag === 'table' && context.clientId !== 'email' ? 'RimoTable' : tag;
  const opening = `<${name}${parameters.length ? ` ${parameters.join(' ')}` : ''}`;
  const content = compileChildren(children, context);
  const lazy = tag === 'el-dialog' || tag === 'el-drawer';
  return voidTags.has(tag) ? `${opening} />` : `${opening}>${lazy ? `{() => <>${content}</>}` : content}</${name}>`;
}

function pageLogic(source, pageKey) {
  let code = source.match(/\/\*\s*(?:\[AI-EDIT\]\s*)?PAGE_LOGIC_START[^\n]*\n([\s\S]*?)\/\*\s*PAGE_LOGIC_END/)?.[1] ?? '';
  if (!code.trim()) {
    const names = [...new Set([...source.matchAll(/\{\{\s*([a-zA-Z_][\w]*)\s*\}\}/g)].map(match => match[1]))];
    const samples = { tenant_group: 'RIMO Rental', verification_purpose: '會員註冊', verification_code: '083517', group_logo_url: '', display_name: '示例管理員', recipient_name: '示例管理員', company_name: '示例企業', company: '示例企業', branch_company: '臺北分公司', company_code: 'RIMO-DEMO', login_url: 'corporate_login.html', login_account: 'demo@rimo.example', initial_password: 'Demo-Only-2026', account: 'demo@rimo.example' };
    return { code: `return ${JSON.stringify(Object.fromEntries(names.map(name => [name, samples[name] ?? name])), null, 2)};`, bindings: new Set(names) };
  }
  if (pageKey === 'marketing') code = code.replace('return map[scopeId] || substr(0, 1)', 'return map[scopeId] || String(scopeId).slice(0, 1)');
  const additions = {
    dispatch: `const resetFilters = () => { filterGroup.value = 'all'; filterStatus.value = 'all'; filterLocation.value = []; };`,
    marketing: `const carGroups = sharingCarGroups;`,
    stations: `const defaultProps = { children: 'children', label: 'label' }; const handleStationRowCommand = () => feedback.ElMessage.info('据点删除尚无完整业务合同，请先使用停用操作。');`,
    'vehicle-transfer': `const onBulkServiceTypeChange = () => { bulkConfig.stationId = ''; };`,
  }[pageKey];
  const ast = parse(code, { sourceType: 'script' });
  let returned = [];
  const exposed = new Set();
  let options = false;
  traverse(ast, {
    FunctionDeclaration(current) {
      if (current.node.id?.name !== 'pageSetup') return;
      const statement = current.get('body.body').filter(item => item.isReturnStatement()).at(-1);
      if (additions && statement) {
        statement.insertBefore(parse(additions).program.body);
        current.scope.crawl();
      }
      returned = statement?.node.argument?.properties ?? [];
      for (const key of returnedKeys(statement?.get('argument'))) exposed.add(key);
      if (statement?.get('argument').isObjectExpression()) {
        for (const [name, binding] of Object.entries(current.scope.bindings)) {
          if (binding.kind === 'param' || ['createApp', ...Object.keys(reactApi)].includes(name) || name.startsWith('_')) continue;
          if (!exposed.has(name)) statement.node.argument.properties.push(types.objectProperty(types.identifier(name), types.identifier(name), false, true));
          exposed.add(name);
        }
      }
    },
    ExpressionStatement(current) {
      const call = current.node.expression;
      if (call.type === 'CallExpression' && call.callee.type === 'MemberExpression' && call.callee.object.name === 'app' && call.callee.property.name === 'component') current.remove();
    },
    VariableDeclarator(current) {
      if (current.node.id.type === 'Identifier' && current.node.id.name === 'pageOptions') options = true;
      if (current.node.init?.type === 'Identifier' && current.node.init.name === 'Vue' && current.node.id.type === 'ObjectPattern') {
        current.node.id.properties = current.node.id.properties.filter(property => property.key.name !== 'createApp').map(property => {
          property.shorthand = false;
          property.key = types.identifier(reactApi[property.key.name] ?? property.key.name);
          return property;
        });
        current.node.init = types.identifier('model');
        if (!current.node.id.properties.length) current.remove();
      }
    },
    MemberExpression(current) {
      if (current.node.object.type === 'Identifier' && current.node.object.name === 'Vue') {
        current.node.object = types.identifier('model');
        current.node.property = types.identifier(reactApi[current.node.property.name] ?? current.node.property.name);
      }
    },
    ReferencedIdentifier(current) {
      if (current.node.name === 'ElementPlusIconsVue') current.replaceWith(types.identifier('rimoIcons'));
      if (current.node.name === 'ElementPlus') current.replaceWith(types.identifier('feedback'));
      if (current.node.name === 'ElMessage') current.replaceWith(types.memberExpression(types.identifier('feedback'), types.identifier('ElMessage')));
      if (current.node.name === 'ElMessageBox') current.replaceWith(types.memberExpression(types.identifier('feedback'), types.identifier('ElMessageBox')));
      if (current.node.name === '$message') current.replaceWith(types.memberExpression(types.identifier('feedback'), types.identifier('ElMessage')));
      if (['setTimeout', 'clearTimeout', 'setInterval', 'clearInterval'].includes(current.node.name) && !current.scope.hasBinding(current.node.name))
        current.replaceWith(types.memberExpression(types.identifier('window'), current.node));
    },
  });
  const bindings = new Set([...exposed, ...returned.map(property => property.key?.name ?? property.key?.value).filter(Boolean)]);
  if (options) {
    const definition = ast.program.body.find(item => item.type === 'VariableDeclaration' && item.declarations.some(declaration => declaration.id.name === 'pageOptions')).declarations.find(item => item.id.name === 'pageOptions').init;
    for (const item of definition.properties) {
      if (item.key.name === 'data') {
        const returned = item.body.body.find(statement => statement.type === 'ReturnStatement')?.argument;
        for (const property of returned?.properties ?? []) bindings.add(property.key.name ?? property.key.value);
      }
      if (['methods','computed'].includes(item.key.name)) for (const property of item.value?.properties ?? []) bindings.add(property.key.name ?? property.key.value);
    }
  }
  return { bindings, code: `${generate(ast, { comments: false }).code}\nreturn ${options ? 'model.options(pageOptions)' : 'pageSetup()'};` };
}

async function styles(source, pageKey, css, hostPalette = true, scopeClasses = []) {
  const utilities = await compileUtilities(`${utilityTheme}\n@tailwind utilities;`);
  const candidates = [...new Set(source.match(/[^<>"'`\s]+/g) ?? [])];
  const parsed = postcss.parse(`${utilities.build(candidates)}\n${css}`);
  parsed.walkAtRules('import', rule => rule.remove());
  const assets = {};
  parsed.walkDecls(declaration => {
    if (!hostPalette) { declaration.value = mapRimoStyleAssets(declaration.value, assets); return; }
    const neutral = /^--color-(?:gray|slate|zinc|neutral|stone)-(\d+)$/.exec(declaration.prop);
    if (neutral) {
      const level = Number(neutral[1]);
      declaration.value = level <= 200 ? 'var(--muted, var(--surface-muted, #f5f5f5))' : level === 300 ? 'var(--border, #e5e7eb)' : level <= 600 ? 'var(--muted-foreground, var(--text-secondary, #64748b))' : 'var(--foreground, #202124)';
    }
    if (declaration.prop === '--color-white') declaration.value = 'var(--background, #fff)';
    if (declaration.prop === '--color-black') declaration.value = 'var(--foreground, #202124)';
    const tone = /^--color-(blue|indigo|sky|red|rose|green|emerald|orange|amber|yellow)-(\d+)$/.exec(declaration.prop);
    if (tone) {
      const semantic = ['blue', 'indigo', 'sky'].includes(tone[1]) ? '--app-color-primary' : ['red', 'rose'].includes(tone[1]) ? '--app-color-danger' : ['green', 'emerald'].includes(tone[1]) ? '--app-color-success' : '--app-color-warning';
      const level = Number(tone[2]);
      declaration.value = level >= 500 ? `var(${semantic})` : `color-mix(in srgb, var(${semantic}) ${Math.max(5, level / 10)}%, var(--background, #fff))`;
    }
    if (['--font-sans', '--font-serif', '--font-mono'].includes(declaration.prop)) declaration.value = declaration.prop === '--font-mono' ? 'var(--app-font-family-mono)' : 'var(--app-font-family-sans)';
    if (declaration.prop === 'box-shadow' && /\.shadow-/.test(declaration.parent?.selector ?? '')) declaration.value = 'none';
    declaration.value = rimoThemeColors(mapRimoStyleAssets(declaration.value, assets));
  });
  parsed.walkComments(comment => comment.remove());
  parsed.walkRules(rule => {
    if (rule.parent?.type === 'atrule' && /keyframes/i.test(rule.parent.name)) return;
    for (let parent = rule.parent; parent; parent = parent.parent) if (parent.type === 'rule') return;
    const scope = `:where([data-rimo-page=${quote(pageKey)}], [data-rimo-overlay=${quote(pageKey)}])`;
    rule.selectors = rule.selectors.map(selector => rimoScopedSelector(selector, scope, scopeClasses));
  });
  return { css: parsed.toString(), assets };
}

async function write(relative, content) {
  const target = path.resolve(workspace, relative);
  if (!target.startsWith(`${workspace}${path.sep}`) || target.startsWith(`${report.sourceRoot}${path.sep}`)) throw new Error('Migration output escaped Preview');
  await fs.mkdir(path.dirname(target), { recursive: true });
  if ((await fs.readFile(target, 'utf8').catch(error => { if (error.code === 'ENOENT') return null; throw error; })) !== content) await writeFileAtomic(target, content);
}

const results = [];
const contracts = [];
const layoutReports = [];
for (const item of mapping) {
  const source = await fs.readFile(path.join(archived, item.path), 'utf8');
  if (createHash('sha256').update(source).digest('hex') !== item.sha256) throw new Error(`Snapshot changed: ${item.path}`);
  if (!item.setup && !item.options && item.clientId !== 'email') { results.push({ ...item, converted: false, reason: 'specialized React page required' }); continue; }
  const surface = extractRimoBusinessSurface(source, item);
  if (!authoredRimoPages.has(item.pageKey))
    layoutReports.push({ pageKey: item.pageKey, ...adaptRimoBusinessLayout(surface, item) });
  const { content, overlays } = surface;
  contracts.push(surface.contract);
  const logic = pageLogic(source, item.pageKey);
  const stylesheet = await styles(`${content.toString()}${overlays.map(node => node.toString()).join('')}`, item.pageKey, surface.stylesheet, item.clientId !== 'email', surface.scopeClasses);
  const context = { bindings: logic.bindings, locals: new Set(), clientId: item.clientId, assets: stylesheet.assets };
  const body = compileNode(content, context) + overlays.map(node => compileNode(node, context)).join('\n');
  const relative = `packages/component-library/src/rimo-rental/blocks/${item.pageKey}`;
  const setup = `function createPageState(model) {\nconst document = model.document;\nconst window = model.window;\nconst localStorage = model.storage;\nconst sessionStorage = model.storage;\nconst themeColor = () => model.theme();\nconst themeColorLight = (level) => model.theme(level);\nconst themeRGBA = (alpha) => model.themeAlpha(alpha);\nconst feedback = { ElMessage: Object.assign((message) => model.notify('info', message), { success: (message) => model.notify('success', message), warning: (message) => model.notify('warning', message), error: (message) => model.notify('error', message), info: (message) => model.notify('info', message) }), ElMessageBox: { confirm: (message, title) => model.confirm(message, title), alert: (message, title) => model.confirm(message, title) } };\n${logic.code}\n}`;
  if (authoredRimoModels.has(item.pageKey)) {
    const modelSource = parse(`import dayjs from 'dayjs';\nimport * as echarts from 'echarts';\nimport { rimoIcons } from '../../lib/RimoEnvironment.jsx';\nexport default ${setup.replace('info: (message)', "loading: (message) => ({ close: model.notify('loading', message) }), info: (message)")}`, { sourceType: 'module' });
    traverse(modelSource, { Scope(current) {
      for (const [name, binding] of Object.entries(current.scope.bindings)) {
        if (binding.kind === 'module' && !binding.referenced) binding.path.remove();
        else if (!binding.referenced && !name.startsWith('_') && name !== 'createPageState') current.scope.rename(name, `_${name}`);
      }
    } });
    modelSource.program.body = modelSource.program.body.filter(statement => statement.type !== 'ImportDeclaration' || statement.specifiers.length > 0);
    const modelPath = `${relative}/${item.pageKey}-model.js`;
    if (!(await fs.stat(path.join(workspace, modelPath)).catch(error => { if (error.code === 'ENOENT') return null; throw error; })))
      await write(modelPath, `${generate(modelSource, { comments: false }).code}\n`);
    item.modelFile = modelPath;
    if (authoredRimoPages.has(item.pageKey)) {
      results.push({ ...item, converted: true, authored: true, sourceFile: `${relative}/${item.component}.jsx`, styleFile: `${relative}/${item.pageKey}.css` });
      continue;
    }
  }
  const state = item.modelFile ? `import createPageState from './${item.pageKey}-model.js';` : setup;
  const module = `import { Fragment } from 'react';\nimport { useRimoModel, rimoEntries } from '../../lib/rimo-model.js';\nimport { RimoRoot, RimoIcon, RimoImage, rimoIcons, useRimoEnvironment } from '../../lib/RimoEnvironment.jsx';\nimport { RimoElement, RimoTable, RimoMarkup, rimoClass, rimoStyle, rimoText } from '../../lib/RimoElements.jsx';\nimport dayjs from 'dayjs';\nimport * as echarts from 'echarts';\nimport './${item.pageKey}.css';\n${state}\nexport default function ${item.component}() {\nconst model = useRimoModel(createPageState);\nconst view = model.view;\nconst {text} = useRimoEnvironment();\nreturn <RimoRoot model={model} pageKey=${quote(item.pageKey)} assets={${JSON.stringify(stylesheet.assets)}}>${body}</RimoRoot>;\n}\n`;
  const parsed = parse(module, { sourceType: 'module', plugins: ['jsx'] });
  const statePath = expression => {
    if (expression.type === 'Identifier') return expression.name === 'view' ? [] : null;
    if (expression.type !== 'MemberExpression') return null;
    const parent = statePath(expression.object);
    return parent ? [...parent, expression.computed ? expression.property : types.stringLiteral(expression.property.name)] : null;
  };
  traverse(parsed, { AssignmentExpression(current) {
    const parts = statePath(current.node.left);
    if (!parts) {
      const target = current.node.left;
      if (current.findParent(parent => parent.isJSXAttribute()) && target.type === 'MemberExpression' && current.node.operator === '=')
        current.replaceWith(types.callExpression(types.memberExpression(types.identifier('model'), types.identifier('assign')), [target.object, target.computed ? target.property : types.stringLiteral(target.property.name), current.node.right]));
      return;
    }
    const { operator, left, right } = current.node;
    const value = operator === '=' ? right : ['&&=', '||=', '??='].includes(operator)
      ? types.logicalExpression(operator.slice(0, -1), left, right)
      : types.binaryExpression(operator.slice(0, -1), left, right);
    current.replaceWith(types.callExpression(types.memberExpression(types.identifier('model'), types.identifier('write')), [types.arrayExpression(parts), value]));
  }, UpdateExpression(current) {
    const parts = statePath(current.node.argument);
    if (parts) current.replaceWith(types.callExpression(types.memberExpression(types.identifier('model'), types.identifier('increment')), [types.arrayExpression(parts), types.numericLiteral(current.node.operator === '++' ? 1 : -1), types.booleanLiteral(current.node.prefix)]));
  }, ReferencedIdentifier(current) {
    if (current.node.name === '$message' && !current.scope.hasBinding('$message')) current.replaceWith(types.memberExpression(types.identifier('view'), types.identifier('feedbackMessage')));
  }, ObjectExpression(current) {
    const seen = new Set();
    current.node.properties = current.node.properties.slice().reverse().filter(property => {
      if (property.type === 'SpreadElement' || property.computed) return true;
      const key = property.key.name ?? property.key.value;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    }).reverse();
  }, ConditionalExpression(current) {
    if (current.node.test.type === 'BooleanLiteral') current.replaceWith(current.node.test.value ? current.node.consequent : current.node.alternate);
  }, IfStatement(current) {
    if (current.node.test.type === 'BooleanLiteral') {
      if (current.node.test.value) current.replaceWith(current.node.consequent);
      else if (current.node.alternate) current.replaceWith(current.node.alternate);
      else current.remove();
    } else if (current.node.consequent.type === 'BlockStatement' && !current.node.consequent.body.length && !current.node.alternate) current.remove();
  }, ForOfStatement(current) {
    if (current.node.body.type === 'BlockStatement' && !current.node.body.body.length) current.remove();
  }, LogicalExpression(current) {
    if (current.node.operator === '||' && current.node.left.type === 'ObjectExpression') current.replaceWith(current.node.left);
  }, CatchClause(current) {
    if (current.node.param && !current.scope.getBinding(current.node.param.name)?.referenced) current.node.param = null;
    if (!current.node.body.body.length) current.node.body.body.push(types.expressionStatement(types.callExpression(types.memberExpression(types.identifier('model'), types.identifier('notify')), [types.stringLiteral('warning'), types.stringLiteral('本地示例资料无法恢复，已使用默认资料。')])));
  }, JSXOpeningElement(current) {
    const attributes = new Map();
    const value = attribute => attribute.value?.type === 'JSXExpressionContainer' ? attribute.value.expression : attribute.value ?? types.booleanLiteral(true);
    for (const attribute of current.node.attributes) {
      if (attribute.type !== 'JSXAttribute') continue;
      const name = attribute.name.name;
      const previous = attributes.get(name);
      if (previous && name === 'className') attribute.value = types.jsxExpressionContainer(types.callExpression(types.identifier('rimoClass'), [types.arrayExpression([value(previous), value(attribute)])]));
      else if (previous && name === 'style') attribute.value = types.jsxExpressionContainer(types.objectExpression([types.spreadElement(value(previous)), types.spreadElement(value(attribute))]));
      else if (previous && name.startsWith('on')) attribute.value = types.jsxExpressionContainer(types.arrowFunctionExpression([types.identifier('event')], types.blockStatement([
        types.expressionStatement(types.callExpression(value(previous), [types.identifier('event')])),
        types.expressionStatement(types.callExpression(value(attribute), [types.identifier('event')])),
      ])));
      attributes.set(name, attribute);
    }
    current.node.attributes = [...attributes.values()];
  }, Program(current) {
    for (const binding of Object.values(current.scope.bindings)) if (binding.kind === 'module' && !binding.referenced) binding.path.remove();
  }, Scope(current) {
    for (const [name, binding] of Object.entries(current.scope.bindings))
      if (binding.kind !== 'module' && !binding.referenced && !name.startsWith('_')) current.scope.rename(name, `_${name}`);
  }, ImportDeclaration(current) {
    if (!current.node.specifiers.length && !/\.css$/.test(current.node.source.value)) current.remove();
  } });
  traverse(parsed, { Program(current) {
    current.scope.crawl();
    for (const binding of Object.values(current.scope.bindings)) if (binding.kind === 'module' && !binding.referenced) binding.path.remove();
  } });
  await write(`${relative}/${item.component}.jsx`, generate(parsed, { comments: false }).code);
  await write(`${relative}/${item.pageKey}.css`, stylesheet.css);
  results.push({ ...item, converted: true, sourceFile: `${relative}/${item.component}.jsx`, styleFile: `${relative}/${item.pageKey}.css` });
}
await write('output/rimo-import/pages.json', JSON.stringify(results, null, 2));
await write('output/rimo-import/page-contracts.json', JSON.stringify(contracts, null, 2));
await write('output/rimo-import/template-adaptation.json', JSON.stringify(layoutReports, null, 2));
console.log(JSON.stringify({ converted: results.filter(item => item.converted).length, pending: results.filter(item => !item.converted).map(item => item.pageKey) }));
