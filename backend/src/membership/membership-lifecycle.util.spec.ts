import { BadRequestException } from '@nestjs/common';
import { MembershipStatus } from '@prisma/client';
import {
  assertCanActivate,
  assertCanCancel,
  assertCanRenew,
  assertCanSuspend,
  isConfirmable,
  isPayable,
} from './membership-lifecycle.util';

describe('membership-lifecycle.util', () => {
  it('CANCELLED is payable and confirmable; SUSPENDED is not', () => {
    expect(isPayable(MembershipStatus.CANCELLED)).toBe(true);
    expect(isConfirmable(MembershipStatus.CANCELLED)).toBe(true);
    expect(isPayable(MembershipStatus.SUSPENDED)).toBe(false);
    expect(isConfirmable(MembershipStatus.SUSPENDED)).toBe(false);
  });

  it('activate allows CANCELLED/EXPIRED, not ACTIVE', () => {
    expect(() => assertCanActivate(MembershipStatus.CANCELLED)).not.toThrow();
    expect(() => assertCanActivate(MembershipStatus.EXPIRED)).not.toThrow();
    expect(() => assertCanActivate(MembershipStatus.ACTIVE)).toThrow(BadRequestException);
  });

  it('renew allows ACTIVE/EXPIRED only', () => {
    expect(() => assertCanRenew(MembershipStatus.EXPIRED)).not.toThrow();
    expect(() => assertCanRenew(MembershipStatus.PENDING)).toThrow(BadRequestException);
  });

  it('suspend only ACTIVE; cancel rejects already CANCELLED', () => {
    expect(() => assertCanSuspend(MembershipStatus.ACTIVE)).not.toThrow();
    expect(() => assertCanSuspend(MembershipStatus.PENDING)).toThrow(BadRequestException);
    expect(() => assertCanCancel(MembershipStatus.ACTIVE)).not.toThrow();
    expect(() => assertCanCancel(MembershipStatus.CANCELLED)).toThrow(BadRequestException);
  });
});
