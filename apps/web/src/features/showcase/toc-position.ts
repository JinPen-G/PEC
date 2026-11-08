/** The last section cannot reach the header threshold on a short document
 * tail. Reaching the scroll boundary must therefore select that final section. */
export function activeTocSection(
  sections: { id: string; top: number }[],
  viewport: { scrollTop: number; height: number; scrollHeight: number },
  threshold = 120,
) {
  if (!sections.length) return undefined;
  if (
    viewport.scrollHeight > viewport.height + 2 &&
    viewport.scrollTop + viewport.height >= viewport.scrollHeight - 2
  )
    return sections.at(-1)?.id;
  return (sections.filter((section) => section.top <= threshold).at(-1) ?? sections[0]).id;
}
