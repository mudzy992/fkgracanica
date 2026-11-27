export function hasPermission(permissions: string[] | undefined, key: string): boolean {
  return permissions?.includes(key) ?? false;
}

export function hasAnyPermission(permissions: string[] | undefined, keys: string[]): boolean {
  if (!permissions) return false;
  return keys.some((k) => permissions.includes(k));
}
