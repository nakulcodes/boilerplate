import { buildHtmlButton, buildHtmlFooter, BRAND_COLOR } from './utils';

export interface WelcomeEmailVariables {
  userName: string;
  organizationName: string;
  loginUrl?: string;
}

/**
 * Generate subject line for welcome email
 */
export function welcomeEmailSubject(vars: WelcomeEmailVariables): string {
  return `Welcome to ${vars.organizationName}`;
}

/**
 * Generate welcome email text with RabbitHR footer
 */
export function welcomeEmailTemplate(vars: WelcomeEmailVariables): string {
  const body = `
Hi ${vars.userName},

Welcome to ${vars.organizationName}!

Your account has been created successfully. ${
    vars.loginUrl
      ? `You can now log in to your account at:\n${vars.loginUrl}`
      : 'You can now log in to your account.'
  }

If you have any questions, feel free to reach out to our support team.
  `.trim();
  return body;
}

/**
 * Generate simple HTML welcome email with button (minimal styling)
 */
export function welcomeEmailHtml(vars: WelcomeEmailVariables): string {
  return `
<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
  <p>Hi ${vars.userName},</p>

  <p><strong>Welcome to ${vars.organizationName}!</strong></p>

  <p>Your account has been created successfully.</p>

  ${vars.loginUrl ? buildHtmlButton('Log In to Your Account', vars.loginUrl) : ''}

  ${vars.loginUrl ? `<p style="font-size: 14px; color: #666;">Or copy this link: <a href="${vars.loginUrl}" style="color: ${BRAND_COLOR};">${vars.loginUrl}</a></p>` : '<p>You can now log in to your account.</p>'}

  <p style="font-size: 14px;">If you have any questions, feel free to reach out to our support team.</p>

  ${buildHtmlFooter(vars.organizationName)}
</body>
</html>
  `.trim();
}

/**
 * Build complete welcome email (subject, text, and html)
 * @param vars - Welcome email variables
 * @returns Object with subject, text, and html
 */
export function buildWelcomeEmail(vars: WelcomeEmailVariables) {
  return {
    subject: welcomeEmailSubject(vars),
    text: welcomeEmailTemplate(vars),
    html: welcomeEmailHtml(vars),
  };
}
