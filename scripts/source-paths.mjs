/** Map an explicitly selected upstream package to its stable local responsibility. */
export function sourcePaths(upstreamPackage = 'packages/ui-primitives') {
  if (!/^packages\/[a-z0-9]+(?:-[a-z0-9]+)*$/.test(upstreamPackage))
    throw new Error('Primitive source must be a relative package directory.');
  const localPackage = 'packages/ui-primitives';
  const replaceRoot = (value, from, to) =>
    value === from || value.startsWith(`${from}/`) ? to + value.slice(from.length) : value;
  return {
    toSource: (file) => replaceRoot(file, localPackage, upstreamPackage),
    toLocal: (file) => replaceRoot(file, upstreamPackage, localPackage),
  };
}
