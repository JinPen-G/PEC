export const desktopScreen = { width: 1440, height: 900 } as const;
export const mobileScreen = { width: 390, height: 844 } as const;

export function screenPreviewBounds({ available, fitHeight, mobile, expanded, maxWidth }: {
  available: number;
  fitHeight: number;
  mobile: boolean;
  expanded: boolean;
  maxWidth: number;
}) {
  const viewport = mobile ? mobileScreen : expanded
    ? { width: Math.max(1, available), height: Math.max(1, fitHeight) }
    : desktopScreen;
  const frameWidth = Math.min(viewport.width, Math.max(1, available), mobile ? maxWidth : Infinity);
  const scale = frameWidth / viewport.width;
  return { ...viewport, frameWidth, frameHeight: viewport.height * scale, scale };
}
