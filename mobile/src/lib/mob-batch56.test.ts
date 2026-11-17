import { describe, expect, it } from 'vitest';
import { commentatorBs, commentatorEn } from '../i18n/commentator-keys';
import { writerGalleryBs, writerGalleryEn } from '../i18n/writer-gallery';
import { staffAdminBs, staffAdminEn } from '../i18n/staff-admin';
import { roleHomeBs, roleHomeEn } from '../i18n/role-home';
describe('mob-batch56 — P-MOB56 i18n batch3', () => {
  it('commentatorBs', () => { expect(commentatorBs.commentatorTitle).toBe('Komentator'); expect(commentatorBs.commentatorStart).toBe('Započni'); });
  it('commentatorEn mirrors', () => { expect(Object.keys(commentatorEn)).toEqual(Object.keys(commentatorBs)); expect(commentatorEn.commentatorTitle).toBe('Commentator'); });
  it('writerGalleryBs', () => { expect(writerGalleryBs.writer).toBe('Writer'); expect(writerGalleryBs.writerCreate).toContain('Nova'); });
  it('writerGalleryEn mirrors', () => { expect(Object.keys(writerGalleryEn)).toEqual(Object.keys(writerGalleryBs)); });
  it('staffAdminBs', () => { expect(staffAdminBs.approve).toBe('Odobri'); expect(staffAdminBs.dashboard).toBe('Dashboard'); });
  it('staffAdminEn mirrors', () => { expect(Object.keys(staffAdminEn)).toEqual(Object.keys(staffAdminBs)); expect(staffAdminEn.approve).toBe('Approve'); });
  it('roleHomeBs', () => { expect(roleHomeBs.drafts).toBe('Nacrti'); expect(roleHomeBs.liveNow).toBe('Uživo'); });
  it('roleHomeEn mirrors', () => { expect(Object.keys(roleHomeEn)).toEqual(Object.keys(roleHomeBs)); });
  it('commentatorBs events', () => { expect(commentatorBs.eventCorner).toBe('Korner'); expect(commentatorBs.eventOwnGoal).toBe('Autogol'); });
  it('writerGalleryBs gallery', () => { expect(writerGalleryBs.galleryManage).toContain('galerijom'); });
  it('staffAdminBs extra', () => { expect(staffAdminBs.qrValidate).toBe('QR validacija'); });
});
