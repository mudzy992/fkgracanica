/**
 * Snapshot polja u AdminFormSheet: poredi se pri zatvaranju, reloadu i SPA
 * navigaciji. Sadržaj ostaje samo u memoriji; ne šalje se niti zapisuje.
 */
const FIELDS = 'input, textarea, select, [contenteditable]:not([contenteditable="false"]), [role="switch"][aria-checked], [role="checkbox"][aria-checked], [aria-pressed]';

export function snapshotForm(root: ParentNode): string {
  // Prefiks razlikuje inicijalizovanu formu bez polja od još nesnimljene forme.
  const parts: string[] = ['v1'];
  root.querySelectorAll<HTMLElement>(FIELDS).forEach((field) => {
    if (field.closest('[data-dirty-ignore]')) return;
    const input = field instanceof HTMLInputElement ? field : null;
    const key = field.getAttribute('name') || field.id;
    if (field.hasAttribute('aria-checked')) {
      parts.push(`${key}=${field.getAttribute('aria-checked')}`);
    } else if (field.hasAttribute('aria-pressed')) {
      parts.push(`${key}=${field.getAttribute('aria-pressed')}`);
    } else if (input?.type === 'checkbox' || input?.type === 'radio') {
      parts.push(`${key}=${input.checked ? '1' : '0'}`);
    } else if (input?.type === 'file') {
      const files = Array.from(input.files ?? []).map((file) => [file.name, file.size, file.type, file.lastModified]);
      parts.push(`${key}=${JSON.stringify(files)}`);
    } else if (field instanceof HTMLSelectElement && field.multiple) {
      parts.push(`${key}=${JSON.stringify(Array.from(field.selectedOptions, (option) => option.value))}`);
    } else if (field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement || field instanceof HTMLSelectElement) {
      parts.push(`${key}=${field.value}`);
    } else {
      parts.push(`${key}=${field.innerHTML}`);
    }
  });
  return parts.join('\u0000');
}

export function isFormDirty(root: ParentNode | null, initial: string): boolean {
  if (!root || !initial) return false;
  return snapshotForm(root) !== initial;
}
