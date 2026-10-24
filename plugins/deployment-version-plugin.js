export function deploymentVersionPlugin({ version }) {
  return {
    name: 'deployment-version',
    apply: 'build',
    config() {
      return {
        define: { 'import.meta.env.VITE_PLATFORM_BUILD_ID': JSON.stringify(version) },
      };
    },
    generateBundle() {
      this.emitFile({
        type: 'asset',
        fileName: 'version.json',
        source: JSON.stringify({ schemaVersion: 1, version, builtAt: new Date().toISOString() }),
      });
    },
  };
}
