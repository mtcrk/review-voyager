// List of blocked personal/free email domains
const BLOCKED_DOMAINS = [
  // Major providers
  'gmail.com', 'googlemail.com',
  'hotmail.com', 'hotmail.co.uk', 'hotmail.fr', 'hotmail.de', 'hotmail.it', 'hotmail.es',
  'outlook.com', 'outlook.co.uk', 'outlook.fr', 'outlook.de',
  'live.com', 'live.co.uk', 'live.fr',
  'msn.com',
  'yahoo.com', 'yahoo.co.uk', 'yahoo.fr', 'yahoo.de', 'yahoo.co.jp',
  'ymail.com',
  'aol.com',
  'icloud.com', 'me.com', 'mac.com',
  'protonmail.com', 'proton.me', 'pm.me',
  'zoho.com',
  'mail.com',
  'gmx.com', 'gmx.de', 'gmx.net',
  'yandex.com', 'yandex.ru',
  'mail.ru',
  'inbox.com',
  'fastmail.com',
  'tutanota.com', 'tuta.io',
  // Turkish ISPs
  'mynet.com', 'superonline.com', 'turk.net',
  // Temporary/disposable
  'tempmail.com', 'guerrillamail.com', 'mailinator.com', 'throwaway.email',
  '10minutemail.com', 'trashmail.com', 'sharklasers.com',
];

export function isPersonalEmail(email: string): boolean {
  const domain = email.split('@')[1]?.toLowerCase();
  if (!domain) return true;
  return BLOCKED_DOMAINS.includes(domain);
}

export function getEmailDomain(email: string): string {
  return email.split('@')[1]?.toLowerCase() || '';
}

export function getCompanyNameFromEmail(email: string): string {
  const domain = getEmailDomain(email);
  // Remove TLD and capitalize
  const parts = domain.split('.');
  if (parts.length >= 2) {
    return parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
  }
  return domain;
}
