/** Local graph maintenance receipts. Semantic review is done by the authoring AI;
 * this command records explicitly reviewed versions and never invents evidence. */
import { promises as fs } from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import { NATIVE_MODULES } from '../packages/platform-contracts/src/platform.js';
import {
  loadContentCatalog,
  loadPrototypeRevisions,
} from '../packages/project-core/src/platform/project-content.js';
import {
  requirementGraphView,
  graphHash,
  requirementBindingRevision,
  validateRequirementGraph,
  reviewedGraphRevision,
} from '../packages/project-core/src/platform/requirement-graph.js';
const root = fileURLToPath(new URL('..', import.meta.url));
const args = process.argv.slice(2),
  operation = args[0] ?? 'check';
const value = (flag, fallback) => (args.includes(flag) ? args[args.indexOf(flag) + 1] : fallback);
const contentRoot = path.resolve(value('--content-root', path.join(root, 'project-content')));
const sourceRoot = path.resolve(value('--source-root', root));
const projectKey = value('--project');
const packages = await loadContentCatalog(contentRoot, NATIVE_MODULES);
if (!['check', 'review', 'inspect'].includes(operation))
  throw new Error('使用 graph:check 或 graph:review --project <content-key> --note <核对说明>');
if (operation === 'review' && (!projectKey || !value('--note')))
  throw new Error('核对记录必须指定项目资料包和具体核对说明');
let selected = false;
for (const snapshot of packages) {
  if (projectKey && snapshot.manifest.contentKey !== projectKey) continue;
  selected = true;
  const module = NATIVE_MODULES.find((item) => item.key === snapshot.manifest.moduleKey);
  const hashes = await loadPrototypeRevisions({
    moduleCatalog: NATIVE_MODULES,
    moduleKey: module.key,
    pageSourceRoot: sourceRoot,
  });
  const prototypes = {};
  const clients = module.initialClients ?? [{ id: module.clientId ?? 'operation', pages: module.pages }];
  for (const client of clients)
    for (const page of client.pages) if (hashes[page.key]) prototypes[`${client.id}/${page.key}`] = hashes[page.key];
  const project = { id: module.projectId ?? module.key, moduleKey: module.key, links: [] };
  snapshot.prototypeRevisions = prototypes;
  if (operation === 'review') {
    if (!snapshot.manifest.graph || !snapshot.files.has(snapshot.manifest.graph))
      throw new Error('先由AI编写并登记graph.json');
    const graph = validateRequirementGraph(JSON.parse(snapshot.files.get(snapshot.manifest.graph)));
    const before = requirementGraphView(snapshot, project);
    if (
      before.nodes.some((node) => node.status === 'active' && node.stale) ||
      before.edges.some(
        (edge) =>
          edge.status === 'active' &&
          edge.stale &&
          [edge.source, edge.target].every((id) =>
            before.nodes.some((node) => node.id === id && node.status === 'active'),
          ),
      )
    )
      throw new Error('现有引用或原型呈现依据已失效；先逐项修改节点和关系依据，再登记核对记录');
    graph.review = {
      graphRevision: reviewedGraphRevision(graph),
      reviewedAt: new Date().toISOString(),
      requirements: Object.fromEntries(
        snapshot.manifest.requirements.map((doc) => [doc.id, graphHash(snapshot.files.get(doc.path))]),
      ),
      bindings: Object.fromEntries(
        snapshot.manifest.requirements.map((doc) => [doc.id, requirementBindingRevision(doc, snapshot.files)]),
      ),
      prototypes,
      note: value('--note'),
    };
    const file = path.join(contentRoot, snapshot.manifest.contentKey, snapshot.manifest.graph);
    const realRoot = await fs.realpath(contentRoot),
      realFile = await fs.realpath(file);
    if (!realFile.startsWith(`${realRoot}${path.sep}`) || (await fs.lstat(file)).isSymbolicLink())
      throw new Error('图谱写入路径越界');
    const bytes = Buffer.from(JSON.stringify(graph, null, 2) + '\n');
    if (graphHash(await fs.readFile(file)) !== graphHash(snapshot.files.get(snapshot.manifest.graph)))
      throw new Error('图谱在核对期间被其他作者修改，请重新读取；未覆盖现场');
    const temporary = `${file}.writing`;
    await fs.writeFile(temporary, bytes, { flag: 'wx' });
    await fs.rename(temporary, file);
    snapshot.files.set(snapshot.manifest.graph, bytes);
  }
  const view = requirementGraphView(snapshot, project);
  if (operation === 'inspect') {
    console.log(
      JSON.stringify(
        {
          contentKey: snapshot.manifest.contentKey,
          view,
          prototypeRevisions: prototypes,
          bindingRevisions: Object.fromEntries(
            snapshot.manifest.requirements.map((doc) => [doc.id, requirementBindingRevision(doc, snapshot.files)]),
          ),
          graphReviewRevision:
            view.availability === 'ready'
              ? reviewedGraphRevision(
                  validateRequirementGraph(JSON.parse(snapshot.files.get(snapshot.manifest.graph))),
                )
              : null,
        },
        null,
        2,
      ),
    );
    continue;
  }
  console.log(
    `${snapshot.manifest.contentKey}: ${view.availability}, ${view.freshness}, ${view.nodes.length} nodes, ${view.edges.length} edges`,
  );
  for (const diagnostic of view.diagnostics)
    console.log(
      `  ${diagnostic.code}: ${diagnostic.requirementId ?? diagnostic.nodeId ?? diagnostic.edgeId ?? diagnostic.prototypeKey ?? ''}`,
    );
}
if (projectKey && !selected) throw new Error('指定业务资料包未登记');
// Maintenance gaps are visible warnings; they never block deployment.
