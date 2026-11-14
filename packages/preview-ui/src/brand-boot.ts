import type { BrandOpeningController } from './brand-opening';

export interface BrandBoot {
  controller: BrandOpeningController;
  release(): void;
}
let opening: BrandBoot | null = null;
export function isHomepageEntry(location: Pick<Location, 'pathname' | 'hash'>, base = '/') {
  const path = location.pathname.replace(/\/+$/, '') || '/';
  const entry = base.replace(/\/+$/, '') || '/';
  const rootPath = entry === '/' ? '' : entry;
  return (path === entry || path === `${rootPath}/index.html`) && /^#?(?:\/?)(?:\?.*)?$/.test(location.hash);
}
export function registerBrandBoot(boot: BrandBoot) {
  opening = boot;
}
export function claimBrandBoot() {
  const boot = opening;
  opening = null;
  return boot;
}
export function discardBrandBoot() {
  const boot = claimBrandBoot();
  if (boot) {
    boot.controller.dispose();
    boot.release();
  }
}
