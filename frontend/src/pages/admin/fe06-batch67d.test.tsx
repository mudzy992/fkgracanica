import { render } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => k }) }));
vi.mock('../../lib/media', () => ({ mediaUrl: () => null }));

import { SettingsFieldGroupPanel } from './settings/SettingsFieldGroupPanel';
import { copyMediaOriginalUrl } from './media/media-page-helpers';

describe('fe06-batch67d settings+media', () => {
  it('SettingsFieldGroupPanel pokriva values[key] ?? ""', () => {
    const group = { id: 'identity', title: 'Id', keyPrefixes: ['club.'], scope: 'public' as const };
    const values: Record<string, string> = { 'club.name': 'FK', 'club.city': undefined as unknown as string };
    const draft: Record<string, string> = {};
    const { container } = render(<SettingsFieldGroupPanel group={group} values={values} draft={draft} onDraft={() => {}} />);
    expect(container.innerHTML).toBeDefined();
    expect(container.textContent?.length).toBeGreaterThan(0);
  });

  it('copyMediaOriginalUrl pokriva mediaUrl ?? path', async () => {
    const writeMock = vi.fn(async () => {});
    Object.defineProperty(navigator, 'clipboard', { value: { writeText: writeMock }, configurable: true });
    const setCopied = vi.fn();
    copyMediaOriginalUrl('/path/img.jpg', setCopied);
    await new Promise((r) => setTimeout(r, 10));
    expect(writeMock).toHaveBeenCalledWith('/path/img.jpg');
  });
});
