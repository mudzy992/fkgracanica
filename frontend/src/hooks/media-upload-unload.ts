/** Traži browser upozorenje za aktivni red, i nakon SPA navigacije. */
export function createMediaUploadUnloadGuard() {
  let listening = false;
  const warn = (event: BeforeUnloadEvent) => {
    event.preventDefault();
    event.returnValue = '';
  };

  return (hasPendingUploads: boolean) => {
    if (typeof window === 'undefined' || listening === hasPendingUploads) return;
    if (hasPendingUploads) window.addEventListener('beforeunload', warn);
    else window.removeEventListener('beforeunload', warn);
    listening = hasPendingUploads;
  };
}
