import { AppWindow, Blocks, Component } from 'lucide-react';
import { catalogKind, catalogSections, type CatalogKind } from './catalog-sections';
import type { CatalogPage } from './showcase-catalog';
import { useShowcaseText } from './showcase-locale';
import './catalog-jump.css';

export const catalogIcons = { page: AppWindow, component: Component, block: Blocks };

export function CatalogJump({ pages, current, onJump }: {
  pages: CatalogPage[];
  current: CatalogKind;
  onJump: (kind: CatalogKind, panel: HTMLElement | null) => void;
}) {
  const text = useShowcaseText();
  return <div className="showcase-catalog-jump" role="group" aria-label={text('跳转到内容分类')}>
    {catalogSections.map(({ kind, title }) => {
      const Icon = catalogIcons[kind];
      const count = pages.filter((page) => catalogKind(page) === kind).length;
      return <button key={kind} type="button" aria-label={`${text(title)} · ${count}`}
        title={text(title)} aria-pressed={kind === current}
        onClick={(event) => onJump(kind, event.currentTarget.closest('.library-sidebar_panel__R3xBf'))}>
        <Icon size={16} strokeWidth={1.75} aria-hidden="true" />
      </button>;
    })}
  </div>;
}
