export function registryInstallCommand(url: string) {
  return `npx shadcn@latest add ${new URL(url, window.location.origin).href}`;
}
