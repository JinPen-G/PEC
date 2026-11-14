/** Only explicitly declared business files form a snapshot. Internal source,
 * credentials and undeclared resources never become readable context. */
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { fail } from './store.js';
import { mapWithConcurrency, resolveExistingPathInsideRoot } from '../filesystem.js';
import { GRAPH_TOOL_NAMES } from '../../../project-shared/src/requirement-graph.js';
import { requirementGraphView, queryRequirementGraph, graphHash } from './requirement-graph.js';
import { PROJECT_GUIDE_IDS } from '../../../project-shared/src/project-guides.js';

const identifier = /^[a-z0-9][a-z0-9-]{1,63}$/;
const validId = (value) => typeof value === 'string' && identifier.test(value);
const extensions = new Set(['.md', '.png', '.jpg', '.jpeg', '.gif', '.webp', '.avif']);
const hash = (bytes) => createHash('sha256').update(bytes).digest('hex');
const internal =
  /(?:^|\/)(?:\.[^/]*|AGENTS\.md|CLAUDE\.md|MEMORY\.md|SKILL\.md)|开发任务|开发记录|协作接续|历史归档/i;
function requireValue(condition, message = '项目业务资料包无效') {
  if (!condition) fail(422, message, 'CONTENT_INVALID');
}
function object(value, keys) {
  requireValue(value && typeof value === 'object' && !Array.isArray(value));
  requireValue(
    Object.keys(value).every((key) => keys.includes(key)),
    '业务资料包含未声明字段',
  );
}
function text(value, max = 160) {
  requireValue(typeof value === 'string' && value.trim().length > 0 && value.length <= max);
  return value;
}
function filePath(value, kind) {
  text(value, 512);
  requireValue(
    !/[:\\%]/.test(value) &&
      ![...value].some((character) => character.charCodeAt(0) < 32) &&
      !internal.test(value),
    '业务资料路径不允许',
  );
  requireValue(
    !value.startsWith('/') && value.split('/').every((part) => part && part !== '.' && part !== '..'),
  );
  requireValue(kind === 'overview' ? value === 'overview.md' : value.startsWith(`${kind}/`));
  requireValue(extensions.has(path.posix.extname(value).toLowerCase()));
  requireValue(kind === 'assets' ? !/\.md$/i.test(value) : /\.md$/i.test(value));
  return value;
}
export function validateContentManifest(input, moduleCatalog) {
  object(input, [
    'schemaVersion',
    'contentKey',
    'moduleKey',
    'title',
    'overview',
    'requirements',
    'assets',
    'graph',
    'governance',
    'guides',
  ]);
  requireValue(input.schemaVersion === 1 && validId(input.contentKey) && validId(input.moduleKey));
  const module = moduleCatalog.find((item) => item.key === input.moduleKey);
  requireValue(module, '业务资料绑定的原生模块不存在');
  requireValue(Array.isArray(input.requirements) && input.requirements.length <= 200);
  requireValue(Array.isArray(input.assets) && input.assets.length <= 200);
  const ids = new Set(['overview']),
    paths = new Set(['overview.md']);
  const requirements = input.requirements.map((item) => {
    object(item, ['id', 'title', 'category', 'status', 'path', 'summary', 'assets', 'pages', 'access']);
    requireValue(item.access === undefined || ['public', 'project'].includes(item.access));
    requireValue(validId(item.id) && !ids.has(item.id), '业务需求标识无效或重复');
    ids.add(item.id);
    const file = filePath(item.path, 'requirements');
    requireValue(!paths.has(file), '业务文件重复声明');
    paths.add(file);
    const summary = item.summary === undefined ? undefined : filePath(item.summary, 'requirements');
    if (summary) {
      requireValue(!paths.has(summary), '业务文件重复声明');
      paths.add(summary);
    }
    if (item.assets !== undefined)
      requireValue(
        Array.isArray(item.assets) &&
          item.assets.length <= 200 &&
          new Set(item.assets).size === item.assets.length &&
          item.assets.every((asset) => input.assets.includes(asset)),
        '页面资源必须在业务清单内登记',
      );
    requireValue(['draft', 'confirmed', 'planned', 'historical'].includes(item.status));
    requireValue(Array.isArray(item.pages) && item.pages.length <= 40);
    const pageIds = new Set();
    const pages = item.pages.map((page) => {
      object(page, ['clientId', 'pageKey', 'anchor']);
      requireValue(
        validId(page.clientId) && module.pages.some((candidate) => candidate.key === page.pageKey),
      );
      const key = `${page.clientId}/${page.pageKey}/${page.anchor ?? ''}`;
      requireValue(!pageIds.has(key), '需求页面关联重复');
      pageIds.add(key);
      requireValue(
        page.anchor === undefined || (typeof page.anchor === 'string' && page.anchor.length <= 160),
      );
      return { clientId: page.clientId, pageKey: page.pageKey, anchor: page.anchor ?? '' };
    });
    return {
      id: item.id,
      title: text(item.title),
      category: text(item.category),
      status: item.status,
      path: file,
      ...(summary ? { summary } : {}),
      ...(item.assets ? { assets: [...item.assets] } : {}),
      pages,
      ...(item.access ? { access: item.access } : {}),
    };
  });
  const assets = input.assets.map((value) => {
    const file = filePath(value, 'assets');
    requireValue(!paths.has(file), '业务资源重复声明');
    paths.add(file);
    return file;
  });
  const governance = input.governance ?? [];
  requireValue(Array.isArray(governance) && governance.length <= 100, '治理规则清单无效');
  const rules = governance.map((item) => {
    object(item, ['id', 'title', 'path']);
    requireValue(validId(item.id) && !ids.has(item.id), '治理规则标识无效或重复');
    ids.add(item.id);
    const file = filePath(item.path, 'governance');
    requireValue(!paths.has(file), '治理规则文件重复');
    paths.add(file);
    return { id: item.id, title: text(item.title), path: file };
  });
  requireValue(input.graph === undefined || input.graph === 'graph.json', '图谱只允许登记graph.json');
  const guideIds = new Set();
  const guides = input.guides ?? [];
  requireValue(Array.isArray(guides) && guides.length <= PROJECT_GUIDE_IDS.length, '项目指南清单无效');
  const projectGuides = guides.map((item) => {
    object(item, ['id', 'title', 'description', 'path', 'access']);
    requireValue(PROJECT_GUIDE_IDS.includes(item.id) && !guideIds.has(item.id), '项目指南标识无效或重复');
    requireValue(['public', 'project'].includes(item.access), '项目指南必须明确访问范围');
    const file = filePath(item.path, 'guides');
    requireValue(!paths.has(file), '业务文件重复声明');
    guideIds.add(item.id);
    paths.add(file);
    return {
      id: item.id,
      title: text(item.title),
      description: text(item.description, 512),
      path: file,
      access: item.access,
    };
  });
  return {
    schemaVersion: 1,
    contentKey: input.contentKey,
    moduleKey: input.moduleKey,
    title: text(input.title),
    overview: filePath(input.overview, 'overview'),
    requirements,
    assets,
    ...(input.graph ? { graph: input.graph } : {}),
    ...(input.governance ? { governance: rules } : {}),
    ...(input.guides ? { guides: projectGuides } : {}),
  };
}
async function regularFiles(root, relative = '', depth = 0) {
  requireValue(depth <= 12, '业务资料目录层级过深');
  const files = [];
  for (const item of await fs.readdir(path.join(root, relative), { withFileTypes: true })) {
    requireValue(!item.isSymbolicLink(), '业务资料不允许符号链接');
    const file = relative ? `${relative}/${item.name}` : item.name;
    requireValue(!internal.test(file), '业务资料包含内部文件');
    if (item.isDirectory()) files.push(...(await regularFiles(root, file, depth + 1)));
    else {
      requireValue(item.isFile());
      files.push(file);
    }
    requireValue(files.length <= 503, '业务资料包过大');
  }
  return files.sort();
}
export async function loadContentPackage(root, contentKey, moduleCatalog) {
  requireValue(validId(contentKey), '业务资料包标识无效');
  const rootStat = await fs.lstat(root).catch(() => null);
  if (!rootStat?.isDirectory() || rootStat.isSymbolicLink())
    fail(503, '业务资料根目录不可用', 'CONTENT_UNAVAILABLE');
  const directory = path.join(root, contentKey);
  const stat = await fs.lstat(directory).catch(() => null);
  if (!stat?.isDirectory() || stat.isSymbolicLink()) fail(404, '业务资料包不存在', 'CONTENT_NOT_FOUND');
  const manifestFile = path.join(directory, 'manifest.json');
  requireValue((await fs.lstat(manifestFile)).isFile());
  requireValue((await fs.stat(manifestFile)).size <= 128 * 1024);
  let input;
  try {
    input = JSON.parse(await fs.readFile(manifestFile, 'utf8'));
  } catch {
    fail(422, '业务资料清单无法读取', 'CONTENT_INVALID');
  }
  const manifest = validateContentManifest(input, moduleCatalog);
  requireValue(manifest.contentKey === contentKey);
  const names = [
    manifest.overview,
    ...manifest.requirements.map((item) => item.path),
    ...manifest.requirements.filter((item) => item.summary).map((item) => item.summary),
    ...(manifest.governance ?? []).map((item) => item.path),
    ...(manifest.guides ?? []).map((item) => item.path),
    ...manifest.assets,
  ];
  const actual = await regularFiles(directory);
  // A declared graph may be absent or stale without blocking a safe release.
  if (manifest.graph && actual.includes(manifest.graph)) names.push(manifest.graph);
  requireValue(
    actual.length === names.length + 1 &&
      actual.every((file) => file === 'manifest.json' || names.includes(file)),
    '业务包含未列入发布清单的文件',
  );
  const files = new Map(),
    records = [];
  const realDirectory = await fs.realpath(directory);
  let total = 0;
  const loaded = await mapWithConcurrency(names.sort(), 8, async (file) => {
    const realFile = await fs.realpath(path.join(directory, file));
    requireValue(
      realFile.startsWith(`${realDirectory}${path.sep}`) &&
        (await fs.lstat(path.join(directory, file))).isFile(),
      '业务文件真实路径越界',
    );
    const fileStat = await fs.stat(path.join(directory, file));
    requireValue(fileStat.size <= (/\.md$/i.test(file) ? 2 : 8) * 1024 * 1024, '业务资源过大');
    const bytes = await fs.readFile(path.join(directory, file));
    requireValue((await fs.realpath(path.join(directory, file))) === realFile, '业务文件在读取时发生变更');
    total += bytes.length;
    requireValue(total <= 32 * 1024 * 1024, '业务资料包过大');
    return { file, bytes, record: { path: file, bytes: bytes.length, sha256: hash(bytes) } };
  });
  for (const { file, bytes, record } of loaded) {
    files.set(file, bytes);
    records.push(record);
  }
  for (const file of names.filter((name) => /\.md$/i.test(name) && files.has(name))) {
    const source = files.get(file).toString('utf8');
    requireValue(
      !/<(?:script|iframe|object|embed|img|a)\b/i.test(source),
      '业务文档请使用受控 Markdown 链接',
    );
    for (const match of source.matchAll(/!?\[[^\]]*\]\(([^)\s]+)(?:\s+[^)]*)?\)/g)) {
      const address = match[1];
      if (/^(?:https?:|mailto:|#)/i.test(address)) {
        requireValue(!match[0].startsWith('!') || address.startsWith('#'), '说明图片必须来自本项目资料包');
        continue;
      }
      requireValue(
        !/[:\\%]/.test(address) &&
          ![...address].some((character) => character.charCodeAt(0) < 32) &&
          !address.startsWith('/'),
        '文档引用路径不允许',
      );
      const target = path.posix.normalize(path.posix.join(path.posix.dirname(file), address.split('#')[0]));
      requireValue(names.includes(target), '文档引用未发布或跨项目资源');
    }
    const headings = new Set(
      [...source.matchAll(/^#{1,6}\s+(.+)$/gm)].map((match) =>
        match[1]
          .trim()
          .toLowerCase()
          .replace(/[^\p{L}\p{N}\s-]/gu, '')
          .replace(/\s+/g, '-'),
      ),
    );
    for (const item of manifest.requirements.filter((item) => item.path === file))
      for (const page of item.pages)
        requireValue(!page.anchor || headings.has(page.anchor), '业务需求标题锚点不存在');
  }
  const revision = hash(JSON.stringify({ manifest, records }));
  return { manifest, files, records, revision };
}
export async function loadContentCatalog(root, moduleCatalog) {
  if (!root) return [];
  const entries = await fs.readdir(root, { withFileTypes: true }).catch((error) => {
    if (error.code === 'ENOENT') return [];
    throw error;
  });
  requireValue(entries.length <= 1000);
  const packages = [];
  for (const entry of entries) {
    requireValue(entry.isDirectory() && !entry.isSymbolicLink(), '资料根目录只允许登记项目包');
    packages.push(await loadContentPackage(root, entry.name, moduleCatalog));
  }
  return packages;
}
export function contentDocuments(snapshot) {
  const { manifest, files, revision } = snapshot;
  return [
    {
      id: 'overview',
      title: manifest.title,
      category: '项目概况',
      status: 'confirmed',
      path: manifest.overview,
      pages: [],
    },
    ...manifest.requirements,
  ].map((item) => ({
    ...item,
    size: files.get(item.path).length,
    revision: hash(files.get(item.path)),
    contentRevision: revision,
  }));
}
export function effectiveDocuments(snapshot, project) {
  return contentDocuments(snapshot).map((document) => {
    const pages = document.pages.filter(
      (page) =>
        !project.links.some((link) => link.clientId === page.clientId && link.pageKey === page.pageKey),
    );
    for (const link of project.links)
      if (
        link.documentPath === document.path &&
        !pages.some((page) => page.clientId === link.clientId && page.pageKey === link.pageKey)
      )
        pages.push({ clientId: link.clientId, pageKey: link.pageKey, anchor: link.anchor });
    return { ...document, pages };
  });
}
export function readContentFile(snapshot, file) {
  const bytes = snapshot.files.get(file);
  if (!bytes) fail(404, '业务文档或资源未发布', 'CONTENT_NOT_FOUND');
  return {
    bytes,
    extension: path.posix.extname(file).toLowerCase(),
    revision: hash(bytes),
    contentRevision: snapshot.revision,
    releaseId: snapshot.releaseId,
  };
}
async function prototypeSourceFiles(directory, relative = '', depth = 0) {
  if (depth > 12) throw new Error('原型源码目录层级过深');
  const files = [];
  for (const entry of await fs.readdir(path.join(directory, relative), { withFileTypes: true })) {
    if (entry.isSymbolicLink()) throw new Error('原型源码不允许符号链接');
    const name = relative ? `${relative}/${entry.name}` : entry.name;
    if (entry.isDirectory()) files.push(...(await prototypeSourceFiles(directory, name, depth + 1)));
    else if (entry.isFile() && /\.([jt]sx?|css|json)$/.test(entry.name)) files.push(name);
    if (files.length > 100) throw new Error('原型源码文件过多');
  }
  return files.sort();
}
export async function loadPrototypeRevisions({
  moduleCatalog,
  moduleKey,
  pageSourceRoot,
  staticRoot,
  releaseRoot,
}) {
  const module = moduleCatalog.find((item) => item.key === moduleKey);
  if (!module) return {};
  const result = {};
  const sourceHashes = new Map();
  const realRoots = new Map();
  let buildEntries;
  const readSourceHash = async (root, directory, file, registryPath) => {
    const key = `${root}\0${path.join(directory, file)}`;
    if (!sourceHashes.has(key)) {
      sourceHashes.set(
        key,
        (async () => {
          if (!realRoots.has(root)) realRoots.set(root, fs.realpath(root));
          const realRoot = await realRoots.get(root);
          const target = registryPath
            ? await resolveExistingPathInsideRoot(root, file, {
                allowedExtensions: ['.ts', '.tsx', '.js', '.jsx', '.css', '.json'],
              })
            : path.join(directory, file);
          if (!target) throw new Error('原型源码范围无效');
          const stat = await fs.lstat(target);
          const resolved = await fs.realpath(target);
          if (
            !stat.isFile() ||
            stat.isSymbolicLink() ||
            stat.size > 4 * 1024 * 1024 ||
            !resolved.startsWith(`${realRoot}${path.sep}`)
          ) {
            throw new Error('原型源码范围无效');
          }
          return graphHash(await fs.readFile(target));
        })(),
      );
    }
    return sourceHashes.get(key);
  };
  for (const page of module.pages) {
    if (!page.source) continue;
    const relative = `apps/web/src/project-modules/${module.projectId ?? module.key}/${page.key}`;
    const directory = pageSourceRoot
      ? path.join(pageSourceRoot, relative)
      : (staticRoot ?? (releaseRoot ? path.join(releaseRoot, 'web') : null));
    if (!directory) continue;
    try {
      let sourceDirectory = directory;
      if (!pageSourceRoot) {
        buildEntries ??= fs
          .readFile(path.join(directory, 'page-manifest.json'), 'utf8')
          .then((bytes) => JSON.parse(bytes).entries);
        const entry = (await buildEntries).find(
          (item) => item.moduleKey === moduleKey && item.pageKey === page.key,
        );
        if (entry && /^[a-f0-9]{64}$/.test(entry.prototypeRevision ?? '')) {
          result[page.key] = entry.prototypeRevision;
          continue;
        }
        if (
          !entry ||
          typeof entry.source !== 'string' ||
          !entry.source.startsWith('page-source/') ||
          entry.source.split('/').includes('..')
        )
          continue;
        sourceDirectory = path.dirname(path.join(directory, entry.source));
      }
      const pageFiles = await prototypeSourceFiles(sourceDirectory);
      const files =
        pageSourceRoot && page.sourceFiles?.length
          ? [...new Set([...pageFiles.map((file) => `${relative}/${file}`), ...page.sourceFiles])].sort()
          : pageFiles;
      if (files.length > 100) continue;
      const registryPath = Boolean(pageSourceRoot && page.sourceFiles?.length);
      const records = await mapWithConcurrency(files, 8, async (file) => ({
        file,
        hash: await readSourceHash(
          registryPath ? pageSourceRoot : directory,
          registryPath ? pageSourceRoot : sourceDirectory,
          file,
          registryPath,
        ),
      }));
      if (records.length) {
        // A module page can be published in more than one client; keys are completed by snapshot().
        result[page.key] = graphHash(JSON.stringify(records));
      }
    } catch {
      /* Unavailable original/source is an explicit freshness gap, never a fake receipt. */
    }
  }
  return result;
}
export function createProjectContent({
  contentRoot,
  releaseRoot,
  releaseId = 'development',
  moduleCatalog,
  pageSourceRoot,
  staticRoot,
}) {
  async function location() {
    if (!releaseRoot) return { root: contentRoot, releaseId };
    const pointer = JSON.parse(await fs.readFile(path.join(releaseRoot, 'current.json'), 'utf8'));
    requireValue(/^[a-f\d]{12}-[a-f\d]{12}$/.test(pointer.releaseId), '发行指针无效');
    const directory = path.join(releaseRoot, pointer.releaseId);
    const stat = await fs.lstat(directory);
    requireValue(stat.isDirectory() && !stat.isSymbolicLink(), '发行目录不允许符号链接');
    const releaseManifest = JSON.parse(await fs.readFile(path.join(directory, 'manifest.json'), 'utf8'));
    if (![2, 3].includes(releaseManifest.schemaVersion))
      fail(503, '当前发行尚未包含业务资料', 'CONTENT_UNAVAILABLE');
    return {
      root: path.join(directory, 'project-content'),
      releaseId: pointer.releaseId,
      contents: releaseManifest.contents,
    };
  }
  return {
    async catalog() {
      const { root, contents } = await location();
      return (await loadContentCatalog(root, moduleCatalog)).map(({ manifest, revision }) => {
        requireValue(
          !contents ||
            contents.some((entry) => entry.contentKey === manifest.contentKey && entry.revision === revision),
          '发行中的业务资料散列不一致',
        );
        return {
          contentKey: manifest.contentKey,
          moduleKey: manifest.moduleKey,
          title: manifest.title,
          revision,
        };
      });
    },
    async snapshot(project, expectedRevision, { includePrototypes = true } = {}) {
      if (!project.contentKey) fail(503, '项目尚未绑定业务资料包', 'CONTENT_UNAVAILABLE');
      const { root, releaseId, contents } = await location();
      const snapshot = await loadContentPackage(root, project.contentKey, moduleCatalog);
      requireValue(snapshot.manifest.moduleKey === project.moduleKey, '业务资料与原型模块不匹配');
      requireValue(
        !contents ||
          contents.some(
            (entry) => entry.contentKey === project.contentKey && entry.revision === snapshot.revision,
          ),
        '发行中的业务资料散列不一致',
      );
      if (expectedRevision && expectedRevision !== snapshot.revision)
        fail(409, '业务资料版本已更新，请重新读取概况', 'CONTENT_REVISION_CHANGED');
      if (!includePrototypes) return { ...snapshot, releaseId };
      const prototypeHashes = await loadPrototypeRevisions({
        moduleCatalog,
        moduleKey: project.moduleKey,
        pageSourceRoot,
        staticRoot,
        releaseRoot: releaseRoot ? path.dirname(root) : null,
      });
      const prototypeRevisions = {};
      for (const client of project.clients ?? [])
        for (const page of client.pages)
          if (prototypeHashes[page.key])
            prototypeRevisions[`${client.id}/${page.key}`] = prototypeHashes[page.key];
      return { ...snapshot, releaseId, prototypeRevisions };
    },
  };
}

export function queryBusinessContext(snapshot, project, operation, args = {}) {
  if (GRAPH_TOOL_NAMES.includes(operation))
    return queryRequirementGraph(requirementGraphView(snapshot, project), operation, args);
  object(args, ['projectId', 'id', 'query', 'offset', 'limit', 'clientId', 'pageKey', 'contentRevision']);
  if (args.projectId !== undefined && args.projectId !== project.id)
    fail(404, '项目不存在或无权访问', 'NOT_FOUND');
  if (args.contentRevision && args.contentRevision !== snapshot.revision)
    fail(409, '业务资料版本已更新', 'CONTENT_REVISION_CHANGED');
  const envelope = {
    schemaVersion: 1,
    projectId: project.id,
    releaseId: snapshot.releaseId,
    contentRevision: snapshot.revision,
  };
  const documents = effectiveDocuments(snapshot, project);
  const offset = args.offset === undefined ? 0 : Number(args.offset);
  const limit =
    args.limit === undefined ? (operation === 'read_requirement' ? 16000 : 20) : Number(args.limit);
  requireValue(
    Number.isSafeInteger(offset) &&
      offset >= 0 &&
      Number.isSafeInteger(limit) &&
      limit >= 1 &&
      limit <= (operation === 'read_requirement' ? 64000 : 50),
    '业务读取分页无效',
  );
  const paginate = (items) => ({
    ...envelope,
    total: items.length,
    offset,
    nextOffset: offset + limit < items.length ? offset + limit : null,
    items: items.slice(offset, offset + limit),
  });
  if (operation === 'get_project_overview') {
    return {
      ...envelope,
      title: snapshot.manifest.title,
      markdown: snapshot.files.get(snapshot.manifest.overview).toString('utf8'),
      requirements: snapshot.manifest.requirements.length,
    };
  }
  if (operation === 'list_requirements') return paginate(documents.filter((item) => item.id !== 'overview'));
  if (operation === 'read_requirement') {
    const document = documents.find((item) => item.id === args.id);
    if (!document) fail(404, '业务需求未发布', 'CONTENT_NOT_FOUND');
    const source = snapshot.files.get(document.path).toString('utf8');
    return {
      ...envelope,
      document,
      markdown: source.slice(offset, offset + limit),
      offset,
      totalLength: source.length,
      nextOffset: offset + limit < source.length ? offset + limit : null,
    };
  }
  if (operation === 'get_page_context') {
    requireValue(validId(args.clientId) && validId(args.pageKey), '页面标识无效');
    requireValue(
      project.clients.some(
        (client) =>
          client.id === args.clientId &&
          client.enabled &&
          client.pages.some((page) => page.key === args.pageKey && page.visible),
      ),
      '项目页面不可用',
    );
    const requirements = documents.filter((item) =>
      item.pages.some((page) => page.clientId === args.clientId && page.pageKey === args.pageKey),
    );
    return {
      ...envelope,
      clientId: args.clientId,
      pageKey: args.pageKey,
      requirements,
      summaries: requirements
        .filter((item) => item.summary)
        .map((item) => ({
          documentId: item.id,
          markdown: snapshot.files.get(item.summary).toString('utf8'),
        })),
    };
  }
  if (operation === 'search_requirements') {
    const query = text(args.query, 160).trim().toLocaleLowerCase();
    const matches = [];
    for (const document of documents) {
      const lines = snapshot.files.get(document.path).toString('utf8').split('\n');
      for (let line = 0; line < lines.length; line++)
        if (lines[line].toLocaleLowerCase().includes(query))
          matches.push({
            documentId: document.id,
            title: document.title,
            line: line + 1,
            excerpt: lines[line].slice(0, 400),
          });
    }
    return paginate(matches);
  }
  fail(404, '只读业务工具不存在', 'NOT_FOUND');
}
