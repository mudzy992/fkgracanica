export const authBs = {
  forgotPassword: 'Zaboravljena lozinka?',
  forgotPasswordHint: 'Kontaktirajte klub da resetujete pristup.',
} as const;

export const authEn: Record<keyof typeof authBs, string> = {
  forgotPassword: 'Forgot password?',
  forgotPasswordHint: 'Contact the club to reset your access.',
};
