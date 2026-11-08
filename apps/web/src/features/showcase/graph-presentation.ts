/** Presentation only: topic membership and evidence semantics live in the domain. */
const scopeColors = ['#6366f1', '#0d9488', '#f59e0b', '#a855f7', '#ec4899', '#3b82f6'];
export function scopeColor(index: number) {
  return scopeColors[index % scopeColors.length];
}
