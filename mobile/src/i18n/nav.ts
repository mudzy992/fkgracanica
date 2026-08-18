export const navBs = {
  back: 'Nazad',
  explore: 'Istraži',
  moreClub: 'Klub',
} as const;

export const navEn: Record<keyof typeof navBs, string> = {
  back: 'Back',
  explore: 'Explore',
  moreClub: 'Club',
};
