import { buildHtmlButton, buildHtmlFooter, BRAND_COLOR } from './utils';

export interface PasswordResetEmailVariables {
  userName: string;
  organizationName: string;
  resetLink: string;
  expiryHours: number;
}

/**
 * Generate subject line for password reset email
 */
export function passwordResetEmailSubject(vars: PasswordResetEmailVariables): string {
  return 'Reset Your Password';
}

/**
 * Generate password reset email text with RabbitHR footer
 */
export function passwordResetEmailTemplate(vars: PasswordResetEmailVariables): string {
  const body = `
Hi ${vars.userName},

We received a request to reset your password for ${vars.organizationName}.

To reset your password, please click the link below:
${vars.resetLink}

This link will expire in ${vars.expiryHours} hour(s).

If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.

For security reasons, please do not share this link with anyone.
  `.trim();
  return body;
}

/**
 * Generate simple HTML email with button (minimal styling)
 */
export function passwordResetEmailHtml(vars: PasswordResetEmailVariables): string {
  return `
<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
  <p>Hi ${vars.userName},</p>

  <p>We received a request to reset your password for ${vars.organizationName}.</p>

  <p>To reset your password, please click the button below:</p>

  ${buildHtmlButton('Reset Password', vars.resetLink)}

  <p style="font-size: 14px; color: #666;">Or copy this link: <a href="${vars.resetLink}" style="color: ${BRAND_COLOR};">${vars.resetLink}</a></p>

  <p style="font-size: 14px; color: #999;"><strong>This link will expire in ${vars.expiryHours} hour(s).</strong></p>

  <p style="font-size: 14px;">If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.</p>

  <p style="font-size: 14px; color: #999;">For security reasons, please do not share this link with anyone.</p>

  ${buildHtmlFooter(vars.organizationName)}
</body>
</html>
  `.trim();
}

/**
 * Build complete password reset email (subject, text, and html)
 * @param vars - Password reset email variables
 * @returns Object with subject, text, and html
 */
export function buildPasswordResetEmail(vars: PasswordResetEmailVariables) {
  return {
    subject: passwordResetEmailSubject(vars),
    text: passwordResetEmailTemplate(vars),
    html: passwordResetEmailHtml(vars),
  };
}
