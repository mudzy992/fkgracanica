import { getApiErrorMessage } from './api-error';

/**
 * P-FE06-44: zajedničko prijavljivanje grešaka za akcije koje su ranije bile
 * `void someMutation.mutateAsync(...)`.
 *
 * Takav poziv odbija na grešci, a pošto rezultat niko ne čeka, rejection ostaje
 * neobrađen: korisnik ne dobija poruku, a dugme se samo ponovo uključi. Umjesto
 * `catch`-a u svakoj od 65 akcija, `runAction` hvata grešku na jednom mjestu i
 * predaje je globalnoj traci (`ActionErrorAlert`) koja je `role="alert"`.
 *
 * Modul je namjerno bez Reacta **i bez i18n instance**: poruka iz API-ja je
 * gotov tekst, a opšta poruka ostaje ključ koji traka prevede pri renderovanju.
 * Tako uvoz ovog modula ne inicijalizuje i18next (testovi često mockuju
 * `react-i18next`).
 */

/** Poruka iz API-ja kad postoji; ključ za prijevod kad ne postoji. */
export type ActionErrorState = { id: number } & (
  | { kind: 'message'; message: string }
  | { kind: 'key'; key: string }
);

/** Oznaka „API nije dao razlog“ — ne može se pobrkati sa stvarnom porukom. */
const NO_API_MESSAGE = '\u0000action-error-no-message';

/** Opšta poruka kad akcija padne bez objašnjenja (prevodi je traka). */
export const DEFAULT_ACTION_ERROR_KEY = 'common.actionFailed';

let current: ActionErrorState | null = null;
let sequence = 0;
const listeners = new Set<() => void>();

function emit(): void {
  for (const listener of listeners) listener();
}

/** Pretplata za `useSyncExternalStore`; vraća funkciju za odjavu. */
export function subscribeActionError(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** Snapshot mora biti referentno stabilan dok se stanje ne promijeni. */
export function getActionError(): ActionErrorState | null {
  return current;
}

/**
 * Prijavljuje grešku: poruka iz API-ja ima prednost, inače se pamti `fallbackKey`
 * koji traka prevede u trenutnom jeziku.
 */
export function reportActionError(err: unknown, fallbackKey?: string): ActionErrorState {
  sequence += 1;
  const message = getApiErrorMessage(err, NO_API_MESSAGE);
  current =
    message === NO_API_MESSAGE
      ? { id: sequence, kind: 'key', key: fallbackKey ?? DEFAULT_ACTION_ERROR_KEY }
      : { id: sequence, kind: 'message', message };
  emit();
  return current;
}

/** Uklanja traku (dugme „Zatvori“ ili istek vremena). */
export function clearActionError(): void {
  if (!current) return;
  current = null;
  emit();
}

/** Samo za testove — vraća modul u početno stanje. */
export function resetActionErrorForTests(): void {
  current = null;
  sequence = 0;
  emit();
}

/** Rezultat akcije: pozivaoc odlučuje šta smije dalje samo kad je uspjela. */
export type ActionResult<T> = { ok: true; value: T } | { ok: false };

/**
 * Izvršava akciju i prijavljuje grešku umjesto tihog `void`-a.
 *
 * Namjerno **ne** baca dalje: pozivaoci su „pali i zaboravi“ dugmad, a bacanje
 * bi vratilo isti neobrađen rejection. Diskriminisana unija (umjesto
 * `T | undefined`) sprječava da se uspjeh sa `undefined` pobrka sa greškom.
 */
export async function runAction<T>(
  action: Promise<T>,
  fallbackKey?: string,
): Promise<ActionResult<T>> {
  try {
    return { ok: true, value: await action };
  } catch (err) {
    reportActionError(err, fallbackKey);
    return { ok: false };
  }
}
