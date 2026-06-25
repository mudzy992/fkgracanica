export function asArray<T>(value: unknown): T[] {
  if (Array.isArray(value)) return value;
  if (value == null || typeof value === 'string') return [];
  if (typeof value !== 'object') return [];

  const obj = value as Record<string, unknown>;
  if ('data' in obj) return asArray<T>(obj.data);
  if (Array.isArray(obj.items)) return obj.items as T[];
  if (Array.isArray(obj.results)) return obj.results as T[];

  return [];
}
