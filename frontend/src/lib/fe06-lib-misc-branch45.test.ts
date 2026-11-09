import { describe, expect, it } from 'vitest';
import { getApiErrorMessage } from './api-error';
import { clubShortName } from './club-display-name';
import { contentStatusLabel } from './content-status-labels';
import { matchEventLabel } from './match-event-labels';
import { buildFormationSlots, validPitchCoordinates, asPlayerPosition } from './formation-slots';
import { groupTicketsByMatch } from './group-tickets-by-match';
import { normalizeHtmlForRender, stripHtml } from './html-content';
import { mediaUrl, galleryPreviewUrl } from './media';
import { isModuleEnabled, getModuleToggleBlockReason } from './module-settings-rules';

describe('lib misc — branch45a (8×1)', () => {
  it('getApiErrorMessage sve grane', () => {
    expect(getApiErrorMessage({ isAxiosError: true, response: { data: { message: 'Zauzeto' } } } as unknown, 'fb')).toBe('Zauzeto');
    expect(getApiErrorMessage({ isAxiosError: true, response: { data: { message: ['a', 'b'] } } } as unknown, 'fb')).toBe('a, b');
    expect(getApiErrorMessage({ isAxiosError: true, response: { data: { message: 123 } } } as unknown, 'fb')).toBe('fb');
    expect(getApiErrorMessage({ isAxiosError: true, response: { data: {} } } as unknown, 'fb')).toBe('fb');
    expect(getApiErrorMessage({ isAxiosError: true, response: undefined } as unknown, 'fb')).toBe('fb');
    expect(getApiErrorMessage(new Error('oops'), 'fb')).toBe('oops');
    expect(getApiErrorMessage(new Error(''), 'fb')).toBe('fb');
    expect(getApiErrorMessage(null, 'fb')).toBe('fb');
  });

  it('clubShortName fallback i trim', () => {
    expect(clubShortName({ name: 'FK Gračanica', shortName: 'GRA' } as never)).toBe('GRA');
    expect(clubShortName({ name: 'FK Gračanica' } as never)).toBe('FK');
    expect(clubShortName({ name: '   ' } as never)).toBe('');
    expect(clubShortName(null)).toBe('?');
    expect(clubShortName(undefined)).toBe('?');
    expect(clubShortName({ name: 'A' } as never, 10)).toBe('A');
  });

  it('contentStatusLabel i matchEventLabel fallback', () => {
    expect(contentStatusLabel('DRAFT')).toBe('Nacrt');
    expect(contentStatusLabel('UNKNOWN_X')).toBe('UNKNOWN_X');
    expect(matchEventLabel('GOAL')).toBe('Gol');
    expect(matchEventLabel('UNKNOWN_TYPE')).toBe('UNKNOWN_TYPE');
  });

  it('formation-slots grane', () => {
    expect(validPitchCoordinates(50, 50)).toBe(true);
    expect(validPitchCoordinates(null, 50)).toBe(false);
    expect(validPitchCoordinates(101, 50)).toBe(false);
    expect(validPitchCoordinates(50, -1)).toBe(false);
    expect(asPlayerPosition('GK')).toBe('GK');
    expect(asPlayerPosition('UNKNOWN')).toBeUndefined();
    expect(asPlayerPosition(null)).toBeUndefined();
    const slots = buildFormationSlots([{ playerId: 'p1', preferredSlotIndex: 0, role: 'GK' as never }]);
    expect(slots[0].playerId).toBe('p1');
    const slots2 = buildFormationSlots([{ playerId: 'p2', role: 'FWD' as never, positionX: 10, positionY: 10 }]);
    expect(slots2.some((s) => s.playerId === 'p2')).toBe(true);
    expect(buildFormationSlots([])).toHaveLength(11);
  });

  it('groupTicketsByMatch sve grane', () => {
    expect(groupTicketsByMatch([])).toEqual([]);
    const g1 = groupTicketsByMatch([{ tickets: [{ matchId: 'm1', id: 't1', match: { id: 'm1', scheduledAt: '2026-01-01' } as never } as never] } as never]);
    expect(g1).toHaveLength(1);
    expect(g1[0].matchId).toBe('m1');
    const g2 = groupTicketsByMatch([{ tickets: [{ match: { id: 'm2', scheduledAt: '2026-01-02' } as never, id: 't2' } as never] } as never]);
    expect(g2[0].matchId).toBe('m2');
    const g3 = groupTicketsByMatch([{ tickets: [{ id: 't3' } as never] } as never]);
    expect(g3[0].matchId).toBe('unknown');
    const g4 = groupTicketsByMatch([{ tickets: [{ matchId: 'm1', id: 't1' } as never] } as never, { tickets: [{ matchId: 'm1', id: 't2' } as never] } as never]);
    expect(g4).toHaveLength(1);
    expect(g4[0].items).toHaveLength(2);
  });

  it('html-content normalize i strip', () => {
    expect(normalizeHtmlForRender('')).toBe('');
    expect(normalizeHtmlForRender('   ')).toBe('');
    expect(normalizeHtmlForRender('<p>hi</p>')).toBe('<p>hi</p>');
    expect(normalizeHtmlForRender('&lt;p&gt;hi&lt;/p&gt;')).toBe('<p>hi</p>');
    const docHtml = '<div><iframe>hello</iframe><p>hi</p></div>';
    expect(normalizeHtmlForRender(docHtml)).toContain('hi');
    expect(stripHtml('')).toBe('');
    expect(stripHtml('<p>hi <b>there</b></p>')).toContain('hi');
    expect(stripHtml('&lt;p&gt;hi&lt;/p&gt;')).toContain('hi');
  });

  it('media url grane', () => {
    expect(mediaUrl(undefined)).toBeUndefined();
    expect(mediaUrl('')).toBeUndefined();
    expect(mediaUrl('https://example.com/a.jpg')).toBe('https://example.com/a.jpg');
    expect(mediaUrl('http://example.com/b.jpg')).toBe('http://example.com/b.jpg');
    expect(mediaUrl('originals/foo/bar.jpg', 'thumb')).toContain('thumbs/foo/bar.webp');
    expect(mediaUrl('uploads/foo.jpg', 'medium')).toContain('foo.jpg');
    expect(mediaUrl('./uploads/foo.jpg')).toContain('foo.jpg');
    expect(mediaUrl('some/path.jpg', 'original')).toContain('some/path.jpg');
    expect(galleryPreviewUrl('a.jpg')).toBeTruthy();
    expect(galleryPreviewUrl(null)).toBeUndefined();
  });

  it('module-settings-rules grane', () => {
    expect(isModuleEnabled(undefined, 'modules.news')).toBe(true);
    expect(isModuleEnabled({ 'modules.news': 'false' }, 'modules.news')).toBe(false);
    expect(isModuleEnabled({ 'modules.news': 'true' }, 'modules.news')).toBe(true);
    expect(getModuleToggleBlockReason('nepostojeci', true, {})).toBeNull();
    expect(getModuleToggleBlockReason('modules.competitions', false, { 'feature.live': 'true' })).toContain('Isključite');
    expect(getModuleToggleBlockReason('modules.competitions', false, { 'feature.live': 'false' })).toBeNull();
    expect(getModuleToggleBlockReason('modules.competitions', false, {})).toContain('Isključite');
    expect(getModuleToggleBlockReason('feature.live', true, { 'modules.competitions': 'false' })).toContain('Uključite');
    expect(getModuleToggleBlockReason('feature.live', true, { 'modules.competitions': 'true' })).toBeNull();
    expect(getModuleToggleBlockReason('feature.live', true, {})).toBeNull();
  });
});
