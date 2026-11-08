// @vitest-environment node
import { promises as fs } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';

import { checkDocument, checkDocumentation } from '../../scripts/check-docs.mjs';
import { checkSourceImports } from '../../scripts/check-architecture.mjs';

const temporaryRoots = [];
afterEach(async () => {
  for (const root of temporaryRoots.splice(0)) {
    if (path.dirname(root) !== os.tmpdir() || !path.basename(root).startsWith('preview-'))
      throw new Error('临时目录越界');
    await fs.rm(root, { recursive: true, force: true });
  }
});

async function fixture() {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'preview-governance-'));
  temporaryRoots.push(root);
  await fs.mkdir(path.join(root, 'docs'), { recursive: true });
  await fs.writeFile(path.join(root, 'AGENTS.md'), '# Rules\n');
  return { root, scripts: { 'docs:check': 'node scripts/check-docs.mjs' } };
}

describe('current engineering documentation', () => {
  it('accepts local references and ignores fenced example links without executing commands', async () => {
    const context = await fixture();
    const source =
      '[rules][shared]\n\n[shared]: ../AGENTS.md\n\n```md\n[example](missing.md)\n```\n\nnpm run docs:check\n';
    expect(checkDocument('docs/guide.md', source, context)).toEqual([]);
  });

  it('rejects missing assets, encoded path escapes and commands absent from package scripts', async () => {
    const context = await fixture();
    const errors = checkDocument(
      'docs/guide.md',
      '![missing](missing.png)\n[escape](../../outside.md)\n[absolute](%2Foutside.md)\n\nnpm run audit:all',
      context,
    );
    expect(errors).toHaveLength(4);
    expect(errors.some((error) => error.includes('audit:all'))).toBe(true);
  });

  it('checks real symlink destinations and allows a path containing spaces', async () => {
    const context = await fixture();
    const outside = await fs.mkdtemp(path.join(os.tmpdir(), 'preview-outside-'));
    temporaryRoots.push(outside);
    await fs.symlink(outside, path.join(context.root, 'docs', 'linked'), 'junction');
    await fs.writeFile(path.join(context.root, 'docs', 'with space.md'), '# Valid');
    const errors = checkDocument('docs/guide.md', '[ok](<with space.md>)\n[bad](linked)', context);
    expect(errors).toHaveLength(1);
    expect(errors[0]).toContain('实际指向工程外部');
  });

  it('reports missing books and an extra current report while leaving archived links untouched', async () => {
    const { root } = await fixture();
    await fs.writeFile(path.join(root, 'package.json'), '{"scripts":{}}');
    await fs.writeFile(path.join(root, 'CLAUDE.md'), '[rules](AGENTS.md)');
    await fs.mkdir(path.join(root, 'docs', '平台建设'), { recursive: true });
    await fs.writeFile(path.join(root, 'docs', '平台建设', 'Preview-最终报告.md'), '# Extra');
    await fs.mkdir(path.join(root, 'docs', '历史归档'), { recursive: true });
    await fs.writeFile(path.join(root, 'docs', '历史归档', 'old.md'), '[old](missing.md)');
    const result = checkDocumentation(root);
    expect(result.errors.some((error) => error.includes('缺少 Preview-需求.md'))).toBe(true);
    expect(result.errors.some((error) => error.includes('四册之外'))).toBe(true);
    expect(result.errors.some((error) => error.includes('old.md'))).toBe(false);
  });
});

describe('platform layer imports', () => {
  it('allows client contracts and core Node filesystem capabilities', () => {
    expect(
      checkSourceImports(
        'packages/platform-client/src/index.js',
        "import { normalize } from '../../platform-contracts/src/index.js';",
      ),
    ).toEqual([]);
    expect(
      checkSourceImports('packages/project-core/src/files.js', "import { promises as fs } from 'node:fs';"),
    ).toEqual([]);
  });

  it('rejects reverse dependencies through imports, re-exports and literal dynamic imports', () => {
    const source =
      "import x from '../../platform-server/src/index.js';\n" +
      "export * from '../../project-core/src/index.js';\n" +
      "const pending = import('node:fs');";
    expect(checkSourceImports('packages/platform-client/src/index.js', source)).toHaveLength(3);
  });

  it('rejects core HTTP imports and browser imports of server implementation', () => {
    expect(
      checkSourceImports('packages/project-core/src/files.js', "const http = require('http');")[0],
    ).toContain('不负责网络或进程');
    expect(
      checkSourceImports(
        'apps/platform-react/src/Bad.tsx',
        "import { createPlatformServer } from '../../../../packages/platform-server/src/index.js';\nconst view = <div/>;",
      ),
    ).toHaveLength(1);
  });

  it('does not treat comments or string content as module imports', () => {
    expect(
      checkSourceImports(
        'packages/platform-contracts/src/index.js',
        "// import x from 'react';\nconst example = \"import('node:fs')\";",
      ),
    ).toEqual([]);
  });

  it('keeps browser-safe logic available through the original public compatibility entries', async () => {
    const shared = await import('../../packages/project-shared/src/index.js');
    const original = await import('../../packages/project-core/src/index.js');
    expect(original.createProjectContext).toBe(shared.createProjectContext);
    expect(original.traditionalToSimplified).toBe(shared.traditionalToSimplified);
    expect(original.PROTOTYPE_I18N_RUNTIME_SCRIPT).toBe(shared.PROTOTYPE_I18N_RUNTIME_SCRIPT);
    expect(
      checkSourceImports('packages/project-shared/src/bad.js', "import fs from 'node:fs';"),
    ).toHaveLength(1);
  });
});
