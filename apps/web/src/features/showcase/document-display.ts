/** Reading density chooses a full document tab. Excerpts select whole original
 * sections; they never invent business rules or replace the published PRD. */
export function documentDisplay(source: string, authoredSummary?: string) {
  if (authoredSummary?.trim()) return { long: true, summary: authoredSummary };
  const lines = source.split('\n');
  const sections: { title: string; start: number; end: number }[] = [];
  let fence: string | null = null;
  let headingCount = 0;
  let tableRows = 0;
  let offset = 0;
  for (const line of lines) {
    const marker = /^\s{0,3}(`{3,}|~{3,})/.exec(line)?.[1];
    if (marker) {
      if (!fence) fence = marker;
      else if (marker[0] === fence[0] && marker.length >= fence.length) fence = null;
    } else if (!fence) {
      if (/^\s*\|.+\|\s*$/.test(line) && !/^\s*\|[\s:|-]+\|\s*$/.test(line)) tableRows++;
      if (/^#{1,6}\s+/.test(line)) headingCount++;
      const heading = /^##\s+(.+?)(?:\s+#+)?\s*$/.exec(line);
      if (heading) {
        if (sections.length) sections[sections.length - 1].end = offset;
        sections.push({ title: heading[1], start: offset, end: source.length });
      }
    }
    offset += line.length + 1;
  }
  const long = source.replace(/\s/g, '').length >= 6000 || headingCount >= 12 || tableRows >= 40;
  if (!long) return { long: false, summary: source };
  const preamble = source.slice(0, sections[0]?.start ?? source.length).trim();
  const title = /^#\s+.+$/m.exec(preamble)?.[0] ?? '';
  const intro = preamble.length <= 1000 ? preamble : title;
  const priority =
    /用途|定位|概述|目标|範圍|范围|核心|主要|流程|关键|關鍵|约束|限制|验收|驗收|overview|scope|workflow|acceptance/i;
  const historical = /版本|更新记录|更新紀錄|修订|歷史|历史|changelog|revision/i;
  const eligible = sections.filter((section) => !historical.test(section.title));
  const ordered = [...eligible.filter((section) => priority.test(section.title)), ...eligible];
  const selected = new Set<number>();
  let length = intro.length;
  for (const section of ordered) {
    if (selected.has(section.start) || selected.size >= 3) continue;
    const size = section.end - section.start;
    if (length + size > 3000) continue;
    selected.add(section.start);
    length += size;
  }
  const excerpt = sections
    .filter((section) => selected.has(section.start))
    .map((section) => source.slice(section.start, section.end).trim());
  return { long: true, summary: [intro, ...excerpt].filter(Boolean).join('\n\n') };
}
