import { buildHtmlButton, buildHtmlFooter, BRAND_COLOR } from './utils';

export interface WelcomeEmailVariables {
  userName: string;
  organizationName: string;
  loginUrl?: string;
}

export function welcomeEmailSubject(vars: WelcomeEmailVariables): string {
  return `Welcome to ${vars.organizationName}`;
}

export function welcomeEmailTemplate(vars: WelcomeEmailVariables): string {
  return `
Hi ${vars.userName},

Welcome to ${vars.organizationName}!

Your account has been created successfully. ${
    vars.loginUrl
      ? `You can now log in to your account at:\n${vars.loginUrl}`
      : 'You can now log in to your account.'
  }

If you have any questions, feel free to reach out to our support team.
  `.trim();
}

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

export function buildWelcomeEmail(vars: WelcomeEmailVariables) {
  return {
    subject: welcomeEmailSubject(vars),
    text: welcomeEmailTemplate(vars),
    html: welcomeEmailHtml(vars),
  };
}
