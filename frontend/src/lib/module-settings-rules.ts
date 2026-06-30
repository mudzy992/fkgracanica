import { APP_MODULE_DEFINITIONS } from './module-definitions';

export function isModuleEnabled(values: Record<string, string> | undefined, key: string): boolean {
  return values?.[key] !== 'false';
}

export function getModuleToggleBlockReason(
  moduleKey: string,
  nextEnabled: boolean,
  values: Record<string, string>,
): string | null {
  const def = APP_MODULE_DEFINITIONS.find((m) => m.key === moduleKey);
  if (!def) return null;

  if (!nextEnabled) {
    const dependents = APP_MODULE_DEFINITIONS.filter((m) => m.requires.includes(moduleKey));
    const active = dependents.find((d) => isModuleEnabled(values, d.key));
    if (active) {
      return `Isključite prvo „${active.label}” (ovisi o „${def.label}”).`;
    }
    return null;
  }

  const missing = def.requires.find((req) => !isModuleEnabled(values, req));
  if (!missing) return null;
  const reqDef = APP_MODULE_DEFINITIONS.find((m) => m.key === missing);
  return `Uključite prvo „${reqDef?.label ?? missing}”.`;
}
