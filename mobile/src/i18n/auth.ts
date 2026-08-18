export const authBs = {
  forgotPassword: 'Zaboravljena lozinka?',
  forgotPasswordHint: 'Kontaktirajte klub da resetujete pristup.',
  loginLead: 'Prijavite se za članstvo, ulaznice i nalog.',
  showPassword: 'Prikaži lozinku',
  hidePassword: 'Sakrij lozinku',
} as const;

export const authEn: Record<keyof typeof authBs, string> = {
  forgotPassword: 'Forgot password?',
  forgotPasswordHint: 'Contact the club to reset your access.',
  loginLead: 'Sign in for membership, tickets, and your account.',
  showPassword: 'Show password',
  hidePassword: 'Hide password',
};
