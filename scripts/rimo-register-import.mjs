/** Register the complete audited RIMO React project and its controlled installation files. */
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { writeFileAtomic } from '../packages/project-core/src/filesystem.js';

const workspace = path.resolve(fileURLToPath(new URL('..', import.meta.url)));
const reportRoot = path.join(workspace, 'output/rimo-import');
const pages = JSON.parse(await fs.readFile(path.join(reportRoot, 'pages.json'), 'utf8'));
const source = path.join(workspace, '.preview-data/archives/rimo-rental/2026-11-09/source');
const tutorial = JSON.parse(await fs.readFile(path.join(source, '02_原型和PRD/原型/公开页/official_vehicle_tutorial.json'), 'utf8'));
const content = JSON.parse(await fs.readFile(path.join(reportRoot, 'content.json'), 'utf8'));
const library = 'packages/component-library/src/rimo-rental';
const common = ['lib/RimoEnvironment.jsx','lib/rimo-model.js','lib/RimoElements.jsx','lib/rimo-elements.css','lib/RimoBusinessLayout.jsx','lib/rimo-business.css','lib/rimo-data-tools.js','lib/rimo-control-values.js'];
const clientNames = { operation: '营运端', enterprise: '企业端', mobile: '移动端', public: '公开教程', email: '通知信件' };
const groups = {
  dashboard: '营运总览', workbench: '营运总览', 'war-room': '经营分析',
  'vehicle-groups': '车辆管理', 'vehicle-transfer': '车辆管理', vehicles: '车辆管理',
  'vehicle-console': '车辆与车机', 'vehicle-status-list': '车辆与车机', 'tbox-management': '车辆与车机',
  'time-share-orders': '分时租赁', 'new-order-same-station': '分时租赁', 'new-order-one-way': '分时租赁',
  'store-orders': '门市租赁', 'new-order': '门市租赁', 'order-detail': '门市租赁', dispatch: '车辆调度',
  stations: '据点管理', stores: '车行与门市', 'rental-companies': '车行与门市',
  'service-products': '产品与价格', pricing: '产品与价格', services: '产品与价格', marketing: '行销方案',
  members: '会员管理', 'member-detail': '会员管理', 'member-review': '会员管理', 'membership-plans': '会员管理',
  corporates: '企业客户', 'corporate-detail': '企业客户', employees: '企业客户', 'official-vehicle-contracts': '公务车合约',
  'channel-ticket-batches': '合作通路租车券', 'channel-ticket-batch-detail': '合作通路租车券', 'channel-ticket-applications': '合作通路租车券',
  settings: '业务规则', 'system-rules': '系统设置', permissions: '角色与权限', 'permissions-grouped': '角色与权限', login: '账号登录', 'corporate-login': '账号登录',
};
const target = file => ({ path: `${library}/${file}`, target: `@components/preview/rimo-rental/${file}` });
async function write(relative, value) {
  const file = path.resolve(workspace, relative);
  if (!file.startsWith(`${workspace}${path.sep}`)) throw new Error('Output escaped Preview');
  await fs.mkdir(path.dirname(file), { recursive: true });
  if ((await fs.readFile(file, 'utf8').catch(error => { if (error.code === 'ENOENT') return null; throw error; })) !== value) await writeFileAtomic(file, value);
}

await write(`${library}/lib/rimo-tutorial-data.js`, `export default ${JSON.stringify(tutorial, null, 2)};\n`);
for (const page of pages) {
  const pageDocument = await fs.readFile(path.join(workspace, `project-content/rimo-rental/requirements/pages/${page.pageKey}.md`), 'utf8');
  page.title = pageDocument.match(/^#\s+(.+)$/m)?.[1] ?? page.title;
  const files = [...common];
  if (page.clientId === 'public' || page.clientId === 'mobile') {
    const tutorialPage = page.clientId === 'public';
    const component = tutorialPage ? 'RimoTutorial' : 'RimoChannelTicketApp';
    const options = tutorialPage ? `editor={${page.pageKey === 'tutorial-editor'}} documentation={${page.pageKey !== 'tutorial'}}`
      : `compatible={${page.pageKey.endsWith('-compatible')}}`;
    page.sourceFile = `${library}/blocks/${page.pageKey}/${page.component}.jsx`;
    await write(page.sourceFile, `import ${component} from '../../lib/${component}.jsx';\nexport default function ${page.component}() { return <div data-rimo-page=${JSON.stringify(page.pageKey)}><${component} ${options} /></div>; }\n`);
    page.converted = true;
    files.push(tutorialPage ? 'lib/RimoTutorial.jsx' : 'lib/RimoChannelTicketApp.jsx');
    files.push(tutorialPage ? 'lib/rimo-tutorial.css' : 'lib/rimo-channel-ticket.css');
    if (tutorialPage) files.push('lib/rimo-tutorial-data.js');
  }
  files.push(path.posix.relative(library, page.sourceFile));
  if (page.styleFile) files.push(path.posix.relative(library, page.styleFile));
  if (page.modelFile) files.push(path.posix.relative(library, page.modelFile));
  page.registryFiles = files.map(target);
  page.registryName = page.pageKey === 'vehicle-groups' || page.pageKey === 'vehicle-transfer' ? `rimo-${page.pageKey}` : `rimo-${page.pageKey}`;
  const key = page.pageKey.replace(/^enterprise-/, '');
  page.group = page.clientId === 'email' ? '通知与账号信件' : page.clientId === 'mobile' ? '租车券预约' : page.clientId === 'public' ? '公务车操作教程'
    : page.clientId === 'enterprise' ? /channel-ticket/.test(key) ? '合作通路租车券' : /employee|department|branch-company/.test(key) ? '企业组织' : /login/.test(key) ? '账号登录' : '公务车管理'
    : groups[key] ?? '营运管理';
  const sourceFile = `apps/web/src/project-modules/rimo-rental/${page.pageKey}/${page.entry}`;
  const original = await fs.readFile(path.join(source, page.path), 'utf8') + (page.clientId === 'public' ? JSON.stringify(tutorial) : '');
  const directory = path.posix.dirname(page.path);
  const originals = Object.entries(content.assets).filter(([name]) => name.includes('/'));
  page.assetMap = {};
  for (const [name, target] of originals) {
    const relative = path.posix.relative(directory, name);
    const basename = path.posix.basename(name);
    if (!original.includes(basename) && !original.includes(relative)) continue;
    page.assetMap[relative] = target;
    if (originals.filter(([candidate]) => path.posix.basename(candidate) === basename).length === 1) page.assetMap[basename] = target;
  }
  const routes = {};
  if (page.clientId === 'email') routes['corporate_login.html'] = { clientId: 'enterprise', pageKey: 'enterprise-corporate-login' };
  for (const candidate of pages) {
    const filename = path.posix.basename(candidate.path);
    if (!original.includes(filename)) continue;
    const relative = path.posix.relative(directory, candidate.path);
    routes[relative] = { clientId: candidate.clientId, pageKey: candidate.pageKey };
    if (candidate.clientId === page.clientId || !routes[filename]) routes[filename] = routes[relative];
  }
  await write(sourceFile, `import Block from '@preview/library/rimo-rental/blocks/${page.pageKey}/${page.component}.jsx';\nimport { RimoPage } from '../RimoPage';\nexport default function ${page.entry.slice(0, -4)}() { return <RimoPage pageKey=${JSON.stringify(page.pageKey)} clientId=${JSON.stringify(page.clientId)} assets={${JSON.stringify(page.assetMap)}} routes={${JSON.stringify(routes)}}><Block /></RimoPage>; }\n`);
}
const clients = Object.entries(clientNames).map(([id, name], index) => ({
  id, name, icon: id === 'mobile' ? 'smartphone' : id === 'email' ? 'mail' : 'layout', layout: id === 'mobile' ? 'mobile' : 'desktop', enabled: true, position: index,
  defaultPage: id === 'operation' ? 'vehicle-groups' : id === 'enterprise' ? 'enterprise-dashboard' : pages.find(page => page.clientId === id)?.pageKey ?? '',
  pages: pages.filter(page => page.clientId === id).map((page, position) => ({ key: page.pageKey, label: page.title, group: `${name} · ${page.group}`, visible: true, position, access: page.pageKey === 'vehicle-groups' ? 'public' : 'restricted' })),
}));
const definition = {
  schemaVersion: 1,
  module: { key: 'rimo-native', projectId: 'rimo-rental', clientId: 'operation', contentKey: 'rimo-rental', label: 'RIMO Rental', surface: 'showcase', pages: pages.map(page => ({ key: page.pageKey, label: page.title, source: page.entry, kind: 'page', registryItem: page.registryName })), initialClients: clients },
  registry: pages.map(page => ({ name: page.registryName, title: page.title, description: `${clientNames[page.clientId]} · ${page.group}。原生 React 演示，使用本地模拟状态；业务规则见关联 PRD。`, kind: 'block', moduleKey: 'rimo-native', pageKey: page.pageKey, dependencies: ['antd@^6.6.0','lucide-react@^1.49.0','dayjs@^1.11.21','echarts@^6.1.0','dompurify@^3.4.11'], registryDependencies: [], files: page.registryFiles })),
};
const registrationsPath = path.join(workspace, 'packages/platform-contracts/src/registered-projects.json');
const registrations = JSON.parse(await fs.readFile(registrationsPath, 'utf8'));
const index = registrations.findIndex(item => item.module.projectId === 'rimo-rental');
for (const item of definition.registry) {
  const previous = registrations[index]?.registry.find(entry => entry.name === item.name);
  if (previous?.description) item.description = previous.description;
  if (previous?.descriptionEn) item.descriptionEn = previous.descriptionEn;
}
for (const page of definition.module.pages) {
  const previous = registrations[index]?.module.pages.find(item => item.key === page.key);
  if (previous?.featuredOrder !== undefined) page.featuredOrder = previous.featuredOrder;
}
if (index < 0) registrations.push(definition); else registrations[index] = definition;
await writeFileAtomic(registrationsPath, JSON.stringify(registrations, null, 2));
await write('output/rimo-import/pages.json', JSON.stringify(pages, null, 2));
await write('output/rimo-import/project.json', JSON.stringify(definition, null, 2));
console.log(JSON.stringify({ pages: pages.length, clients: clients.length, registryItems: definition.registry.length }));
