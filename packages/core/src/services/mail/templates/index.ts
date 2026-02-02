export function buildEmailWithFooter(text: string, organizationName?: string): string {
  const footer = organizationName
    ? `\n\n---\nBest regards,\n${organizationName} Team`
    : '';

  return text.trim() + footer;
}

export * from './utils';
export * from './welcome.template';
export * from './password-reset.template';
export * from './user-invite.template';
