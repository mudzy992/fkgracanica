import { describe, expect, it } from 'vitest';
import { getModuleToggleBlockReason, isModuleEnabled } from './module-settings-rules';

describe('ovisnosti modula', () => {
  it('samo eksplicitni string false isključuje modul', () => {
    expect(isModuleEnabled(undefined, 'feature.live')).toBe(true);
    expect(isModuleEnabled({}, 'feature.live')).toBe(true);
    expect(isModuleEnabled({ 'feature.live': 'true' }, 'feature.live')).toBe(true);
    expect(isModuleEnabled({ 'feature.live': 'false' }, 'feature.live')).toBe(false);
  });

  it('štiti live centar od isključivanja potrebnih takmičenja', () => {
    expect(getModuleToggleBlockReason('modules.competitions', false, {})).toContain('Live centar');
    expect(getModuleToggleBlockReason('modules.competitions', false, { 'feature.live': 'false' })).toBeNull();
    expect(getModuleToggleBlockReason('feature.live', true, { 'modules.competitions': 'false' })).toContain('Takmičenja');
    expect(getModuleToggleBlockReason('feature.live', true, { 'modules.competitions': 'true' })).toBeNull();
  });

  it('nepoznat i nezavisan modul ne dobijaju izmišljenu zabranu', () => {
    expect(getModuleToggleBlockReason('nepoznat', false, {})).toBeNull();
    expect(getModuleToggleBlockReason('modules.news', false, {})).toBeNull();
    expect(getModuleToggleBlockReason('modules.news', true, {})).toBeNull();
  });
});
