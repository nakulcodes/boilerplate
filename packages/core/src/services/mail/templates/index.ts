/**
 * Adds RabbitHR footer to email text
 * @param text - The main email body text
 * @param organizationName - Optional organization name to include in footer
 * @returns Email text with footer appended
 */
export function buildEmailWithFooter(text: string, organizationName?: string): string {
  const footer = organizationName
    ? `\n\n---\nBest regards,\n${organizationName} Team\n\nPowered by RabbitHR (https://rabbithr.co)`
    : `\n\n---\nPowered by RabbitHR (https://rabbithr.co)`;

  return text.trim() + footer;
}

export * from './utils';
export * from './welcome.template';
export * from './password-reset.template';
export * from './user-invite.template';
export * from './candidate-notifications.template';
