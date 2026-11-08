/** Frontend build identifier, with no host settings or private project data. */
import { execFileSync } from 'node:child_process';
export function nativeVersionPlugin(root) {
  const commit = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim();
  const release = process.env.PREVIEW_BUILD_ID || `${commit.slice(0, 12)}-${Date.now().toString(36)}`;
  return {
    name: 'preview-native-version',
    config: () => ({ define: { __PREVIEW_BUILD_ID__: JSON.stringify(release) } }),
    generateBundle() {
      this.emitFile({
        type: 'asset',
        fileName: 'brand/version.json',
        source: JSON.stringify({
          buildId: release,
          commit,
          protocol: 1,
          databaseSchema: 3,
          contentSchema: 1,
        }),
      });
    },
  };
}
