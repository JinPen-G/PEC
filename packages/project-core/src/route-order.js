export function orderedItems(items, configuredIds, getId) {
  const indexedItems = items.map((item, index) => ({ item, index }));
  const ranks = new Map(
    (Array.isArray(configuredIds) ? configuredIds : []).map((id, index) => [String(id), index]),
  );
  return indexedItems
    .sort((left, right) => {
      const leftRank = ranks.has(getId(left.item)) ? ranks.get(getId(left.item)) : Number.MAX_SAFE_INTEGER;
      const rightRank = ranks.has(getId(right.item)) ? ranks.get(getId(right.item)) : Number.MAX_SAFE_INTEGER;
      return leftRank - rightRank || left.index - right.index;
    })
    .map(({ item }) => item);
}

export function applyRouteOrder(definitions, routeOrder) {
  const clientOrders = routeOrder?.clients || {};
  return Object.fromEntries(
    Object.entries(definitions || {}).map(([clientId, definition]) => {
      const config = clientOrders[clientId] || {};
      const sections = orderedItems(definition.sections || [], config.sectionOrder, (section) => section.id);
      const sectionRanks = new Map(sections.map((section, index) => [section.id, index]));
      const pageOrders = config.pageOrder || {};
      const originalPages = (definition.pages || []).map((page, index) => ({ page, index }));

      const pages = originalPages
        .sort((left, right) => {
          const leftSectionRank = sectionRanks.has(left.page.section)
            ? sectionRanks.get(left.page.section)
            : Number.MAX_SAFE_INTEGER;
          const rightSectionRank = sectionRanks.has(right.page.section)
            ? sectionRanks.get(right.page.section)
            : Number.MAX_SAFE_INTEGER;
          if (leftSectionRank !== rightSectionRank) return leftSectionRank - rightSectionRank;

          const pageOrder = Array.isArray(pageOrders[left.page.section]) ? pageOrders[left.page.section] : [];
          const leftPageRank = pageOrder.indexOf(left.page.name);
          const rightPageRank = pageOrder.indexOf(right.page.name);
          const normalizedLeftRank = leftPageRank < 0 ? Number.MAX_SAFE_INTEGER : leftPageRank;
          const normalizedRightRank = rightPageRank < 0 ? Number.MAX_SAFE_INTEGER : rightPageRank;
          return normalizedLeftRank - normalizedRightRank || left.index - right.index;
        })
        .map(({ page }) => page);

      return [clientId, { ...definition, sections, pages }];
    }),
  );
}

export function pageOrderKey(page) {
  return page?.name || page?.path || '';
}

export function orderClientRouteData(sections, pages, clientConfig = {}) {
  const orderedSections = orderedItems(sections, clientConfig.sectionOrder, (section) => section.id);
  const sectionRanks = new Map(orderedSections.map((section, index) => [section.id, index]));
  const pageOrders = clientConfig.pageOrder || {};
  const orderedPages = pages
    .map((page, index) => ({ page, index }))
    .sort((left, right) => {
      const leftSectionRank = sectionRanks.has(left.page.section)
        ? sectionRanks.get(left.page.section)
        : Number.MAX_SAFE_INTEGER;
      const rightSectionRank = sectionRanks.has(right.page.section)
        ? sectionRanks.get(right.page.section)
        : Number.MAX_SAFE_INTEGER;
      if (leftSectionRank !== rightSectionRank) return leftSectionRank - rightSectionRank;

      const pageOrder = Array.isArray(pageOrders[left.page.section]) ? pageOrders[left.page.section] : [];
      const leftPageRank = pageOrder.indexOf(pageOrderKey(left.page));
      const rightPageRank = pageOrder.indexOf(pageOrderKey(right.page));
      const normalizedLeftRank = leftPageRank < 0 ? Number.MAX_SAFE_INTEGER : leftPageRank;
      const normalizedRightRank = rightPageRank < 0 ? Number.MAX_SAFE_INTEGER : rightPageRank;
      return normalizedLeftRank - normalizedRightRank || left.index - right.index;
    })
    .map(({ page }) => page);
  return { sections: orderedSections, pages: orderedPages };
}

export function normalizeRouteOrder({ sections, pages, sectionOrder, pageOrder, pageMenu }) {
  const validSectionIds = sections.map((section) => section.id);
  const requestedSections = Array.isArray(sectionOrder)
    ? sectionOrder.map(String).filter((id) => validSectionIds.includes(id))
    : [];
  const normalizedSectionOrder = [...new Set([...requestedSections, ...validSectionIds])];
  const pageOrderBySection = {};

  for (const section of sections) {
    const validPageNames = pages
      .filter((page) => page.section === section.id)
      .map(pageOrderKey)
      .filter(Boolean);
    const requestedPages = Array.isArray(pageOrder?.[section.id])
      ? pageOrder[section.id].map(String).filter((name) => validPageNames.includes(name))
      : [];
    pageOrderBySection[section.id] = [...new Set([...requestedPages, ...validPageNames])];
  }

  // 菜单显隐覆盖：仅保留有效页面名，且只记录与默认（显示）不同的状态（false），
  // 显式 true 也允许（可覆盖 HTML manifest 里 menu:false 的页面）。
  const validPageNames = new Set(pages.map(pageOrderKey).filter(Boolean));
  const normalizedPageMenu = {};
  for (const [name, visible] of Object.entries(pageMenu || {})) {
    if (validPageNames.has(name) && typeof visible === 'boolean') normalizedPageMenu[name] = visible;
  }

  return {
    sectionOrder: normalizedSectionOrder,
    pageOrder: pageOrderBySection,
    ...(Object.keys(normalizedPageMenu).length ? { pageMenu: normalizedPageMenu } : {}),
  };
}
