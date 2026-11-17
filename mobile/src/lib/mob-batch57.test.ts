import { describe, expect, it, vi } from 'vitest';
vi.mock('react-native', () => ({ Appearance: { setColorScheme: vi.fn() } }));
vi.mock('./api', () => ({ api: { get: vi.fn(()=> Promise.resolve({ data: {} })) } }));
import { ThemeProvider, useTheme } from './theme-context';
import { usePublicSettings } from './use-public-settings';
import { isModuleEnabled } from '../hooks/use-module-flags';
import { darkColors } from './theme';
describe('mob-batch57 — P-MOB57 theme-context/public-settings/flags', () => {
  it('ThemeProvider exists', () => { expect(typeof ThemeProvider).toBe('function'); });
  it('useTheme exists', () => { expect(typeof useTheme).toBe('function'); });
  it('darkColors', () => { expect(darkColors.primary).toBe('#1E3A8A'); });
  it('usePublicSettings exists', () => { expect(typeof usePublicSettings).toBe('function'); });
  it('isModuleEnabled true', () => { expect(isModuleEnabled({ a: 'true' }, 'a')).toBe(true); });
  it('isModuleEnabled false string', () => { expect(isModuleEnabled({ a: 'false' }, 'a')).toBe(false); });
  it('isModuleEnabled missing true', () => { expect(isModuleEnabled({}, 'missing')).toBe(true); });
  it('isModuleEnabled empty', () => { expect(isModuleEnabled({ a: '' }, 'a')).toBe(true); });
  it('useTheme throws outside', () => { expect(()=> useTheme()).toThrow(); });
  it('ThemeProvider renders', async () => {
    const React = await import('react');
    const { renderToString } = await import('react-dom/server');
    const el = React.createElement(ThemeProvider, { children: React.createElement('div') });
    expect(renderToString(el)).toContain('div');
  });
  it('isModuleEnabled case', () => { expect(isModuleEnabled({ key: 'false' }, 'key')).toBe(false); expect(isModuleEnabled({ key: '0' }, 'key')).toBe(true); });
});
