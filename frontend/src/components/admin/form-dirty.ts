/**
 * FE-04b — detekcija nesačuvanih izmjena u admin formama.
 *
 * `AdminFormSheet` do sada ima prop `dirty`, ali ga 21 od 23 forme ne prosljeđuje
 * (praktično: zatvaranje dijaloga je uvijek gubilo otkucano). Umjesto da se u
 * svaku formu dodaje novo stanje, snapshot se pravi na nivou dijaloga: uzme se
 * vrijednost svih polja pri otvaranju i uporedi pri pokušaju zatvaranja.
 *
 * Radi za `input`, `textarea`, `select` (uključujući `checkbox`/`radio`), bez
 * zavisnosti od forme i bez re-renderovanja.
 */

const FIELDS = 'input, textarea, select';

/** Vrati stabilan "otisak" trenutnog stanja svih polja unutar `root`. */
export function snapshotForm(root: ParentNode): string {
  const parts: string[] = [];
  root
    .querySelectorAll<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(FIELDS)
    .forEach((field) => {
      const input = field instanceof HTMLInputElement ? field : null;
      const type = input?.type ?? '';
      if (type === 'checkbox' || type === 'radio') {
        parts.push(`${field.name || field.id}=${input?.checked ? '1' : '0'}`);
        return;
      }
      // fajl input se ne može vratiti u prethodno stanje — preskačemo ga
      if (type === 'file') return;
      parts.push(`${field.name || field.id}=${field.value}`);
    });
  return parts.join('\u0000');
}

/** Da li se forma promijenila u odnosu na snimljeno stanje. */
export function isFormDirty(root: ParentNode | null, initial: string): boolean {
  if (!root || !initial) return false;
  return snapshotForm(root) !== initial;
}
