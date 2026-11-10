/** Read-only checks for current engineering documents. No network, project data,
 * environment loading or execution of documented commands. Archives retain their
 * original links and are excluded; fragments and raw HTML links are not checked. */
import { existsSync, readFileSync, readdirSync, realpathSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { URL, fileURLToPath, pathToFileURL } from 'node:url';
import MarkdownIt from 'markdown-it';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const markdown = new MarkdownIt();
export const PROJECT_DOCUMENTS = Object.freeze([
  { directory: 'docs/平台建设', topic: 'Preview' },
  { directory: 'docs/原生原型平台', topic: '原生原型平台' },
]);
const BOOKS = ['需求', '开发任务', '开发记录', '协作接续'];
const MODULE_DOCUMENTS = [
  'apps/web/README.md',
  'apps/api/README.md',
  'packages/project-core/README.md',
  'packages/project-shared/README.md',
  'packages/platform-client/README.md',
  'packages/platform-contracts/README.md',
  'packages/platform-server/README.md',
  'packages/preview-ui/README.md',
  'packages/component-library/README.md',
];

function inside(root, target) {
  const relative = path.relative(root, target);
  return relative !== '..' && !relative.startsWith(`..${path.sep}`) && !path.isAbsolute(relative);
}

function currentDocuments(root, directory = 'docs') {
  const absolute = path.join(root, directory);
  if (!existsSync(absolute)) return [];
  return readdirSync(absolute, { withFileTypes: true }).flatMap((entry) => {
    if (entry.isSymbolicLink() || ['历史归档', '未来规划'].includes(entry.name)) return [];
    const file = `${directory}/${entry.name}`;
    if (entry.isDirectory()) return currentDocuments(root, file);
    return entry.name.endsWith('.md') ? [file] : [];
  });
}

function linkDestinations(tokens) {
  return tokens
    .flatMap((token) => [
      ...(token.type === 'link_open' ? [token.attrGet('href')] : []),
      ...(token.type === 'image' ? [token.attrGet('src')] : []),
      ...(token.children ? linkDestinations(token.children) : []),
    ])
    .filter(Boolean);
}

export function checkDocument(file, source, { root, scripts }) {
  const errors = [];
  for (const target of linkDestinations(markdown.parse(source, {}))) {
    if (/^(?:https?:|mailto:)/iu.test(target) || target.startsWith('#')) continue;
    let destination;
    try {
      destination = decodeURIComponent(target.split(/[?#]/u)[0]);
    } catch {
      errors.push(`${file}: 无效链接编码 ${target}`);
      continue;
    }
    if (
      !destination ||
      /^[a-z][a-z\d+.-]*:/iu.test(destination) ||
      /^[\\/]/u.test(destination) ||
      destination.includes('\0')
    ) {
      errors.push(`${file}: 本地链接必须使用仓库内相对路径 ${target}`);
      continue;
    }
    const absolute = path.resolve(root, path.dirname(file), destination);
    if (!inside(root, absolute)) {
      errors.push(`${file}: 链接越出工程目录 ${target}`);
    } else if (!existsSync(absolute)) {
      errors.push(`${file}: 链接目标不存在 ${target}`);
    } else if (!inside(realpathSync(root), realpathSync(absolute))) {
      errors.push(`${file}: 链接实际指向工程外部 ${target}`);
    }
  }
  // Includes command examples in fences, but never executes them.
  for (const match of source.matchAll(/\bnpm run ([a-z][a-z\d:_-]*)/giu)) {
    if (!Object.hasOwn(scripts, match[1])) errors.push(`${file}: npm 命令不存在 ${match[1]}`);
  }
  return errors;
}

export function checkDocumentation(root = ROOT) {
  const scripts = JSON.parse(readFileSync(path.join(root, 'package.json'), 'utf8')).scripts || {};
  const files = [
    'AGENTS.md',
    'CLAUDE.md',
    'README.md',
    'CHANGELOG.md',
    'docs/文档导航.md',
    ...MODULE_DOCUMENTS,
    ...currentDocuments(root),
  ];
  const errors = [];
  for (const file of new Set(files)) {
    try {
      errors.push(...checkDocument(file, readFileSync(path.join(root, file), 'utf8'), { root, scripts }));
    } catch (error) {
      errors.push(`${file}: 文档读取失败 (${error.code || error.message})`);
    }
  }
  for (const { directory, topic } of PROJECT_DOCUMENTS) {
    const expected = BOOKS.map((book) => `${topic}-${book}.md`);
    const actual = existsSync(path.join(root, directory))
      ? readdirSync(path.join(root, directory)).filter((file) => file.endsWith('.md'))
      : [];
    for (const file of expected) if (!actual.includes(file)) errors.push(`${directory}: 缺少 ${file}`);
    for (const file of actual)
      if (!expected.includes(file)) errors.push(`${directory}: 四册之外的现行文档 ${file}`);
  }
  const claude = existsSync(path.join(root, 'CLAUDE.md'))
    ? readFileSync(path.join(root, 'CLAUDE.md'), 'utf8')
    : '';
  if (!linkDestinations(markdown.parse(claude, {})).includes('AGENTS.md')) {
    errors.push('CLAUDE.md: 必须引用共用 AGENTS.md 入口');
  }
  return { documents: new Set(files).size, errors };
}

if (process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url) {
  const result = checkDocumentation();
  for (const error of result.errors) console.error(error);
  console.log(`工程文档检查：${result.documents} 份现行文档，${result.errors.length} 个错误。`);
  process.exitCode = result.errors.length ? 1 : 0;
}
