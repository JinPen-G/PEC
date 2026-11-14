/** Only deliberate navigation can recover a failed page; no business command is repeated. */
export function reloadPage() {
  window.location.reload();
}

export function returnHome() {
  // A hash-only navigation leaves the root error boundary mounted, so reload the new entry.
  window.history.replaceState(null, '', `${import.meta.env.BASE_URL}#/`);
  window.location.reload();
}
