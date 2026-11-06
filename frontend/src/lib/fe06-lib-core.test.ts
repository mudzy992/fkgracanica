import { describe, expect, it } from 'vitest';
import { FORMATION_OUTFIELD_TOTAL, formationOutfieldSum, isFormationSumValid } from './formation-sum';
import { resolveStaffHome } from './staff-home';
import { clubShortName } from './club-display-name';
import { formatGoalDifference } from './standings-format';
import { slugify } from './slug';
import { waitForElementSize } from './youtube-stream.util';

describe('formation-sum', () => {
  it('sabira def/mid/fwd kao brojeve', () => {
    expect(formationOutfieldSum('4', '4', '2')).toBe(FORMATION_OUTFIELD_TOTAL);
    expect(formationOutfieldSum('4', '5', '1')).toBe(10);
  });

  it('prazne i neispravne vrijednosti tretira kao nulu', () => {
    expect(formationOutfieldSum('', 'abc', '3')).toBe(3);
  });

  it('validira zbir 10 sa cijelim brojevima ≥ 1', () => {
    expect(isFormationSumValid('4', '4', '2')).toBe(true);
    expect(isFormationSumValid('3', '4', '3')).toBe(true);
  });

  it('odbija pogrešan zbir', () => {
    expect(isFormationSumValid('4', '4', '4')).toBe(false);
    expect(isFormationSumValid('1', '1', '1')).toBe(false);
  });

  it('odbija nulu, razlomak i prazno', () => {
    expect(isFormationSumValid('0', '5', '5')).toBe(false);
    expect(isFormationSumValid('4.5', '3.5', '2')).toBe(false);
    expect(isFormationSumValid('', '6', '4')).toBe(false);
  });
});

describe('staff-home', () => {
  it('bez dozvola je writer', () => {
    expect(resolveStaffHome()).toBe('writer');
    expect(resolveStaffHome([])).toBe('writer');
  });

  it('settings.read ili users.read vode na admin', () => {
    expect(resolveStaffHome(['settings.read'])).toBe('admin');
    expect(resolveStaffHome(['users.read'])).toBe('admin');
  });

  it('dozvola odobravanja vodi na moderatora', () => {
    expect(resolveStaffHome(['news.approve'])).toBe('moderator');
    expect(resolveStaffHome(['gallery.approve'])).toBe('moderator');
    expect(resolveStaffHome(['live.approve'])).toBe('moderator');
  });

  it('live.manage bez odobravanja je komentator', () => {
    expect(resolveStaffHome(['live.manage'])).toBe('commentator');
  });

  it('admin ima prednost nad moderatorom', () => {
    expect(resolveStaffHome(['news.approve', 'settings.read'])).toBe('admin');
  });
});

describe('club-display-name', () => {
  it('koristi skraćeno ime velikim slovima', () => {
    expect(clubShortName({ name: 'FK Gračanica', shortName: ' fkg ' })).toBe('FKG');
  });

  it('bez skraćenog imena uzima prvu riječ', () => {
    expect(clubShortName({ name: 'FK Gračanica', shortName: null } as never)).toBe('FK');
    expect(clubShortName({ name: 'Gračanica', shortName: '' } as never, 5)).toBe('GRAČA');
  });

  it('prazan klub daje upitnik', () => {
    expect(clubShortName(null)).toBe('?');
    expect(clubShortName(undefined)).toBe('?');
  });
});

describe('standings-format', () => {
  it('pozitivna razlika dobija plus', () => {
    expect(formatGoalDifference(5)).toBe('+5');
  });

  it('nula i negativna ostaju bez plusa', () => {
    expect(formatGoalDifference(0)).toBe('0');
    expect(formatGoalDifference(-3)).toBe('-3');
  });
});

describe('slug', () => {
  it('uklanja dijakritike i pravi kebab-case', () => {
    expect(slugify('Gračanica Šuma')).toBe('gracanica-suma');
    expect(slugify('  FK  Gračanica --- 1922 ')).toBe('fk-gracanica-1922');
  });
});

describe('waitForElementSize', () => {
  const sized = (w: number, h: number) => {
    const el = document.createElement('div');
    Object.defineProperty(el, 'clientWidth', { value: w, configurable: true, writable: true });
    Object.defineProperty(el, 'clientHeight', { value: h, configurable: true, writable: true });
    return el;
  };

  it('odmah rješava kad element ima dovoljnu veličinu', async () => {
    await expect(waitForElementSize(sized(640, 360))).resolves.toBeUndefined();
  });

  it('čeka rAF dok element ne dobije veličinu', async () => {
    const el = sized(100, 100);
    const pending = waitForElementSize(el, 200, 100);
    Object.defineProperty(el, 'clientWidth', { value: 300, configurable: true, writable: true });
    await expect(pending).resolves.toBeUndefined();
  });
});
