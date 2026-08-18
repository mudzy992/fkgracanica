export const contactBs = {
  contactInfo: 'Informacije',
  contactAddress: 'Adresa',
  contactPhone: 'Telefon',
  openMap: 'Otvori mapu',
} as const;

export const contactEn: Record<keyof typeof contactBs, string> = {
  contactInfo: 'Information',
  contactAddress: 'Address',
  contactPhone: 'Phone',
  openMap: 'Open map',
};
