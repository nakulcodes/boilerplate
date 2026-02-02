import { buildHtmlButton, buildHtmlFooter, BRAND_COLOR } from './utils';

export interface UserInviteEmailVariables {
  userName: string;
  inviterName: string;
  organizationName: string;
  inviteLink: string;
  email: string;
  expiryHours: number;
}

/**
 * Generate subject line for user invitation email
 */
export function userInviteEmailSubject(vars: UserInviteEmailVariables): string {
  return `You've been invited to join ${vars.organizationName}`;
}

/**
 * Generate user invitation email text
 */
export function userInviteEmailTemplate(vars: UserInviteEmailVariables): string {
  const body = `
Hi ${vars.userName},

${vars.inviterName} has invited you to join ${vars.organizationName}.

To accept this invitation and set up your account, please click the link below:
${vars.inviteLink}

You'll be able to create your password and complete your profile.

This invitation will expire in ${vars.expiryHours} hour(s).

If you didn't expect this invitation, you can safely ignore this email.
  `.trim();
  return body;
}

/**
 * Generate HTML email for user invitation
 */
export function userInviteEmailHtml(vars: UserInviteEmailVariables): string {
  return `
<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
  <p>Hi ${vars.userName},</p>

  <p><strong>${vars.inviterName}</strong> has invited you to join <strong>${vars.organizationName}</strong>.</p>

  <p>To accept this invitation and set up your account, please click the button below:</p>

  ${buildHtmlButton('Accept Invitation', vars.inviteLink)}

  <p style="font-size: 14px; color: #666;">Or copy this link: <a href="${vars.inviteLink}" style="color: ${BRAND_COLOR};">${vars.inviteLink}</a></p>

  <p style="font-size: 14px;">You'll be able to create your password and complete your profile.</p>

  <p style="font-size: 14px; color: #999;"><strong>This invitation will expire in ${vars.expiryHours} hour(s).</strong></p>

  <p style="font-size: 14px;">If you didn't expect this invitation, you can safely ignore this email.</p>

  ${buildHtmlFooter(vars.organizationName)}
</body>
</html>
  `.trim();
}

/**
 * Build complete user invitation email (subject, text, and html)
 */
export function buildUserInviteEmail(vars: UserInviteEmailVariables) {
  return {
    subject: userInviteEmailSubject(vars),
    text: userInviteEmailTemplate(vars),
    html: userInviteEmailHtml(vars),
  };
}
