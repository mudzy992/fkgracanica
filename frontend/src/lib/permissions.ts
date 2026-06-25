export function hasPermission(permissions: string[] | undefined, key: string): boolean {
  return permissions?.includes(key) ?? false;
}
