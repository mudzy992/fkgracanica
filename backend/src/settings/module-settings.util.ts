import { BadRequestException } from '@nestjs/common';
import { APP_MODULE_DEFINITIONS, APP_MODULE_KEYS } from './module-definitions';

export function isModuleEnabled(values: Record<string, string>, key: string): boolean {
  return values[key] !== 'false';
}

export function validateModuleSettingUpdates(
  merged: Record<string, string>,
  updates: Record<string, string>,
): void {
  for (const [key, value] of Object.entries(updates)) {
    if (!APP_MODULE_KEYS.has(key)) continue;
    const def = APP_MODULE_DEFINITIONS.find((m) => m.key === key);
    if (!def) continue;

    const enabling = value !== 'false';
    if (!enabling) {
      const dependents = APP_MODULE_DEFINITIONS.filter((m) => m.requires.includes(key));
      for (const dep of dependents) {
        if (isModuleEnabled(merged, dep.key)) {
          throw new BadRequestException(
            `Ne možete isključiti „${def.label}” dok je uključen modul „${dep.label}”.`,
          );
        }
      }
      continue;
    }

    for (const reqKey of def.requires) {
      const reqDef = APP_MODULE_DEFINITIONS.find((m) => m.key === reqKey);
      if (!isModuleEnabled(merged, reqKey)) {
        throw new BadRequestException(
          `Uključite prvo modul „${reqDef?.label ?? reqKey}” prije „${def.label}”.`,
        );
      }
    }
  }
}
