import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { clubShortName } from './club-display-name';
import { formationOutfieldSum, isFormationSumValid } from './formation-sum';
import { membershipUserName, membershipStatusLabel, membershipStatusVariant, canActivateMembership, canRenewMembership, canSuspendMembership, canCancelMembership } from './membership-status';
import { getOrCreateVisitorId, wasVisitSentThisSession, markVisitSent } from './visitor-identity';

describe('fe06-batch69g ostali libovi 20+ grana', () => {
  it('clubShortName sve grane', () => {
    expect(clubShortName({ shortName: '  gra ' } as never)).toBe('GRA');
    expect(clubShortName({ shortName: '  ', name: 'FK Gračanica' } as never)).toBe('FK');
    expect(clubShortName({ name: 'FK Gračanica' } as never)).toBe('FK');
    expect(clubShortName({ name: '   ' } as never)).toBe('');
    expect(clubShortName(null)).toBe('?');
    expect(clubShortName(undefined)).toBe('?');
    expect(clubShortName({ name: 'A' } as never, 10)).toBe('A');
    expect(clubShortName({ name: 'FK Goražde' } as never, 2)).toBe('FK');
    expect(clubShortName({ shortName: '  ' } as never)).toBe('?');
    expect(clubShortName({ name: '  FK   Goražde  ' } as never)).toBe('FK');
  });

  it('formation sum pokriva ||0 i reduce grane', () => {
    expect(formationOutfieldSum('2', '3', '5')).toBe(10);
    expect(formationOutfieldSum('', '', '')).toBe(0);
    expect(formationOutfieldSum('a', '2', '3')).toBe(5); // Number('a')||0
    expect(formationOutfieldSum('3.5', '2', '1')).toBe(6.5);
    expect(isFormationSumValid('2', '3', '5')).toBe(true);
    expect(isFormationSumValid('1', '1', '1')).toBe(false); // sum 3 !=10
    expect(isFormationSumValid('0', '5', '5')).toBe(false); // n<1
    expect(isFormationSumValid('2.5', '3', '4')).toBe(false); // not integer
    expect(isFormationSumValid('a', '3', '5')).toBe(false); // NaN not integer
    expect(isFormationSumValid('-1', '5', '6')).toBe(false);
    expect(isFormationSumValid('4', '3', '3')).toBe(true);
  });

  it('membership utils pokrivaju filter/||/?? i status grane', () => {
    expect(membershipUserName({ firstName: 'Alen', lastName: 'M', email: 'a@b.com' })).toBe('Alen M');
    expect(membershipUserName({ firstName: null as never, lastName: null as never, email: 'bob@b.com' })).toBe('bob@b.com');
    expect(membershipUserName({ email: 'x@b.com' })).toBe('x@b.com');
    expect(membershipUserName(undefined)).toBe('—');
    expect(membershipUserName({ firstName: '  ', lastName: '  ', email: '' } as never)).toBe('—');
    expect(membershipStatusLabel('ACTIVE')).toBe('Aktivno');
    expect(membershipStatusLabel('PENDING')).toBe('Na čekanju');
    expect(membershipStatusLabel('CANCELLED' as never)).toBe('Otkazano');
    expect(membershipStatusLabel('UNKNOWN' as never)).toBe('UNKNOWN');
    expect(membershipStatusVariant('ACTIVE')).toBe('success');
    expect(membershipStatusVariant('PENDING')).toBe('default');
    expect(membershipStatusVariant('SUSPENDED')).toBe('danger');
    expect(membershipStatusVariant('EXPIRED')).toBe('danger');
    expect(membershipStatusVariant('CANCELLED')).toBe('muted');
    expect(canActivateMembership('PENDING')).toBe(true);
    expect(canActivateMembership('SUSPENDED')).toBe(true);
    expect(canActivateMembership('EXPIRED')).toBe(true);
    expect(canActivateMembership('CANCELLED')).toBe(true);
    expect(canActivateMembership('ACTIVE')).toBe(false);
    expect(canRenewMembership('ACTIVE')).toBe(true);
    expect(canRenewMembership('EXPIRED')).toBe(true);
    expect(canRenewMembership('PENDING')).toBe(false);
    expect(canSuspendMembership('ACTIVE')).toBe(true);
    expect(canSuspendMembership('PENDING')).toBe(false);
    expect(canCancelMembership('CANCELLED')).toBe(false);
    expect(canCancelMembership('ACTIVE')).toBe(true);
  });

  describe('visitor-identity pokriva try/catch i ??', () => {
    beforeEach(() => {
      vi.restoreAllMocks();
      localStorage.clear();
      sessionStorage.clear();
    });
    afterEach(() => {
      vi.restoreAllMocks();
      localStorage.clear();
      sessionStorage.clear();
    });

    it('getOrCreateVisitorId vraća postojeći i kreira novi', () => {
      localStorage.setItem('fk_visitor_id', 'existing');
      expect(getOrCreateVisitorId()).toBe('existing');
      localStorage.clear();
      const id1 = getOrCreateVisitorId();
      expect(id1).toMatch(/^[0-9a-f]{32}$/);
      expect(localStorage.getItem('fk_visitor_id')).toBe(id1);
      const id2 = getOrCreateVisitorId();
      expect(id2).toBe(id1);
    });

    it('getOrCreateVisitorId hvata grešku localStorage', () => {
      const spy = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('blocked'); });
      const id = getOrCreateVisitorId();
      expect(id).toMatch(/^[0-9a-f]{32}$/);
      spy.mockRestore();
      const setSpy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('blocked'); });
      // clear existing so it tries set
      localStorage.clear();
      // need getItem to return null then set throws
      const getSpy = vi.spyOn(Storage.prototype, 'getItem').mockReturnValue(null);
      const id2 = getOrCreateVisitorId();
      expect(id2).toMatch(/^[0-9a-f]{32}$/);
      getSpy.mockRestore();
      setSpy.mockRestore();
    });

    it('wasVisitSentThisSession i markVisitSent pokrivaju try/catch', () => {
      expect(wasVisitSentThisSession()).toBe(false);
      markVisitSent();
      expect(wasVisitSentThisSession()).toBe(true);
      sessionStorage.clear();
      expect(wasVisitSentThisSession()).toBe(false);
      const getSpy = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('blocked'); });
      expect(wasVisitSentThisSession()).toBe(false);
      getSpy.mockRestore();
      const setSpy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('blocked'); });
      expect(() => markVisitSent()).not.toThrow();
      setSpy.mockRestore();
    });
  });
});
