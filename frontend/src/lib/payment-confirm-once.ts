// Deduplicate only simultaneous requests. Completed/failed attempts are never cached here.
const inFlight = new Map<string, Promise<unknown>>();

export function confirmPaymentOnce<T>(key: string, confirm: () => Promise<T>): Promise<T> {
  const existing = inFlight.get(key);
  if (existing) return existing as Promise<T>;

  let request: Promise<T>;
  try {
    request = Promise.resolve(confirm());
  } catch (error) {
    request = Promise.reject(error);
  }
  inFlight.set(key, request);
  const remove = () => {
    if (inFlight.get(key) === request) inFlight.delete(key);
  };
  void request.then(remove, remove);
  return request;
}
