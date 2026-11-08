/** Only registered routes and read-only dialog state are shareable. */
export const COLLABORATION_PROTOCOL = 1;
export function validatePresentation(input, project) {
  if (!input || input.protocol !== 1 || !Number.isSafeInteger(input.sequence) || input.sequence < 1)
    return null;
  const client = project.clients.find((item) => item.enabled && item.id === input.clientId);
  if (
    !client ||
    (input.pageKey === ''
      ? client.pages.some((page) => page.visible)
      : !client.pages.some((page) => page.visible && page.key === input.pageKey))
  )
    return null;
  if (
    input.dialog !== null &&
    (!input.dialog ||
      input.dialog.key !== 'order-detail' ||
      project.moduleKey !== 'rental-orders' ||
      input.pageKey !== 'orders' ||
      !/^demo-order-(?:00[1-9]|0[1-5][0-9]|06[0-4])$/.test(input.dialog.orderId))
  )
    return null;
  return {
    protocol: 1,
    sequence: input.sequence,
    clientId: client.id,
    pageKey: input.pageKey,
    dialog: input.dialog ? { key: 'order-detail', orderId: input.dialog.orderId } : null,
  };
}
export function validatePointer(input) {
  if (input === null) return null;
  if (
    !input ||
    !Number.isFinite(input.x) ||
    !Number.isFinite(input.y) ||
    input.x < 0 ||
    input.x > 1 ||
    input.y < 0 ||
    input.y > 1 ||
    typeof input.surface !== 'string' ||
    input.surface.length > 160
  )
    return undefined;
  return { x: input.x, y: input.y, surface: input.surface };
}
