/** Keep non-secret UI identifiers and explicit copy gestures usable on HTTP pilots. */
export function installBrowserCompatibility() {
  if (!globalThis.crypto.randomUUID) {
    globalThis.crypto.randomUUID = () => {
      const bytes = globalThis.crypto.getRandomValues(new Uint8Array(16));
      bytes[6] = (bytes[6] & 0x0f) | 0x40;
      bytes[8] = (bytes[8] & 0x3f) | 0x80;
      const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
      return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
    };
  }
  if (!navigator.clipboard) {
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: {
        async writeText(value: string) {
          const focused = document.activeElement;
          const selection = window.getSelection();
          const ranges = selection
            ? Array.from({ length: selection.rangeCount }, (_, index) =>
                selection.getRangeAt(index).cloneRange(),
              )
            : [];
          const input = document.createElement('textarea');
          input.value = String(value);
          input.readOnly = true;
          input.style.cssText = 'position:fixed;left:-10000px;top:0;opacity:0';
          const container =
            focused instanceof Element
              ? (focused.closest('[role="dialog"], [role="alertdialog"]') ?? document.body)
              : document.body;
          container.append(input);
          try {
            input.select();
            if (!document.execCommand('copy'))
              throw new DOMException('Clipboard copy was denied', 'NotAllowedError');
          } finally {
            input.remove();
            if (focused instanceof HTMLElement) focused.focus({ preventScroll: true });
            if (selection) {
              selection.removeAllRanges();
              for (const range of ranges) selection.addRange(range);
            }
          }
        },
      },
    });
  }
}
