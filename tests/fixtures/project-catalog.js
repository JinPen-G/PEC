/** Synthetic registration exercises framework permissions without loading local projects. */
import { promises as fs } from 'node:fs';
import path from 'node:path';

const sourceRoot = 'packages/component-library/src/fixture';
const targetRoot = '@components/preview/fixture';
const file = (name) => ({ path: `${sourceRoot}/${name}`, target: `${targetRoot}/${name}` });
export const TEST_PROJECT = {
  schemaVersion: 1,
  module: {
    key: 'fixture-module',
    projectId: 'fixture',
    clientId: 'operation',
    label: 'Synthetic library',
    surface: 'showcase',
    pages: [
      {
        key: 'item-groups',
        label: 'Groups',
        source: 'GroupsPage.tsx',
        kind: 'page',
        registryItem: 'fixture-groups',
      },
      {
        key: 'item-transfer',
        label: 'Transfers',
        source: 'TransferPage.tsx',
        kind: 'page',
        registryItem: 'fixture-transfer',
      },
    ],
    initialClients: [
      {
        id: 'operation',
        name: 'Operation',
        icon: 'layout',
        layout: 'desktop',
        enabled: true,
        position: 0,
        defaultPage: 'item-groups',
        pages: [
          {
            key: 'item-groups',
            label: 'Groups',
            group: 'Items',
            visible: true,
            position: 0,
            access: 'public',
          },
          {
            key: 'item-transfer',
            label: 'Transfers',
            group: 'Items',
            visible: true,
            position: 1,
            access: 'restricted',
          },
        ],
      },
    ],
  },
  registry: [
    {
      name: 'fixture-groups',
      title: 'Group editor',
      description: 'Synthetic group editor.',
      descriptionEn: 'Synthetic group editor.',
      moduleKey: 'fixture-module',
      pageKey: 'item-groups',
      kind: 'block',
      dependencies: ['lucide-react@1.49.0'],
      registryDependencies: [],
      files: [file('blocks/groups/GroupsBlock.tsx'), file('blocks/groups/groups.css'), file('lib/format.ts')],
    },
    {
      name: 'fixture-transfer',
      title: 'Transfer editor',
      description: 'Synthetic transfer editor.',
      descriptionEn: 'Synthetic transfer editor.',
      moduleKey: 'fixture-module',
      pageKey: 'item-transfer',
      kind: 'block',
      dependencies: ['lucide-react@1.49.0'],
      registryDependencies: [],
      files: [
        file('blocks/transfers/TransferBlock.tsx'),
        file('blocks/transfers/transfers.css'),
        file('lib/format.ts'),
      ],
    },
  ],
};
export const TEST_REGISTRY = TEST_PROJECT.registry;
export const TEST_MODULES = [
  {
    ...TEST_PROJECT.module,
    pages: TEST_PROJECT.module.pages.map((page) => ({
      ...page,
      sourceFiles: TEST_REGISTRY.find((item) => item.name === page.registryItem).files.map(
        (file) => file.path,
      ),
    })),
  },
];

export async function writeTestProject(root) {
  const files = {
    [`${sourceRoot}/blocks/groups/GroupsBlock.tsx`]:
      'import "./groups.css"; import { format } from "../../lib/format"; export default function GroupsBlock() { return <button>{format("Groups")}</button>; }',
    [`${sourceRoot}/blocks/groups/groups.css`]: '.fixture-groups { color: inherit; }',
    [`${sourceRoot}/blocks/transfers/TransferBlock.tsx`]:
      'import "./transfers.css"; import { format } from "../../lib/format"; export default function TransferBlock() { return <button>{format("Transfers")}</button>; }',
    [`${sourceRoot}/blocks/transfers/transfers.css`]: '.fixture-transfers { color: inherit; }',
    [`${sourceRoot}/lib/format.ts`]: 'export const format = (value: string) => value.trim();',
  };
  for (const [relative, content] of Object.entries(files)) {
    const filename = path.join(root, relative);
    await fs.mkdir(path.dirname(filename), { recursive: true });
    await fs.writeFile(filename, content);
  }
  return root;
}
