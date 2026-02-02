import { buildHtmlButton, buildHtmlFooter, BRAND_COLOR } from './utils';

export interface StageChangedEmailVariables {
  candidateName: string;
  jobTitle: string;
  stageName: string;
  organizationName: string;
}

export interface InterviewScheduledEmailVariables {
  candidateName: string;
  jobTitle: string;
  interviewDate: string;
  interviewTime: string;
  interviewType: string;
  duration: number;
  location?: string;
  meetingLink?: string;
  interviewerEmails: string[];
  organizationName: string;
  notes?: string;
}

export interface ApplicationRejectedEmailVariables {
  candidateName: string;
  jobTitle: string;
  rejectionReason?: string;
  organizationName: string;
}

export interface ApplicationAcceptedEmailVariables {
  candidateName: string;
  jobTitle: string;
  organizationName: string;
  nextSteps?: string;
}

/**
 * Stage Changed Email Templates
 */
export function stageChangedEmailSubject(vars: StageChangedEmailVariables): string {
  return `Update on your application for ${vars.jobTitle}`;
}

export function stageChangedEmailTemplate(vars: StageChangedEmailVariables): string {
  return `
Hi ${vars.candidateName},

We wanted to update you on your application for ${vars.jobTitle}.

Your application has moved to the "${vars.stageName}" stage of our hiring process.

We'll keep you updated as we continue to review your application.

Best regards,
${vars.organizationName} Team
  `.trim();
}

export function stageChangedEmailHtml(vars: StageChangedEmailVariables): string {
  return `
<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
  <p>Hi ${vars.candidateName},</p>

  <p>We wanted to update you on your application for <strong>${vars.jobTitle}</strong>.</p>

  <p>Your application has moved to the <strong>"${vars.stageName}"</strong> stage of our hiring process.</p>

  <p>We'll keep you updated as we continue to review your application.</p>

  ${buildHtmlFooter(vars.organizationName)}
</body>
</html>
  `.trim();
}

export function buildStageChangedEmail(vars: StageChangedEmailVariables) {
  return {
    subject: stageChangedEmailSubject(vars),
    text: stageChangedEmailTemplate(vars),
    html: stageChangedEmailHtml(vars),
  };
}

/**
 * Interview Scheduled Email Templates
 */
export function interviewScheduledEmailSubject(vars: InterviewScheduledEmailVariables): string {
  return `Interview scheduled for ${vars.jobTitle}`;
}

export function interviewScheduledEmailTemplate(vars: InterviewScheduledEmailVariables): string {
  const locationText = vars.location ? `\nLocation: ${vars.location}` : '';
  const meetingLinkText = vars.meetingLink ? `\nMeeting Link: ${vars.meetingLink}` : '';
  const notesText = vars.notes ? `\n\nAdditional Notes:\n${vars.notes}` : '';

  return `
Hi ${vars.candidateName},

We're excited to invite you for an interview for the ${vars.jobTitle} position.

Interview Details:
- Date: ${vars.interviewDate}
- Time: ${vars.interviewTime}
- Duration: ${vars.duration} minutes
- Type: ${vars.interviewType}${locationText}${meetingLinkText}${notesText}

${vars.meetingLink ? `Please join using this link: ${vars.meetingLink}` : ''}

We look forward to speaking with you!

Best regards,
${vars.organizationName} Team
  `.trim();
}

export function interviewScheduledEmailHtml(vars: InterviewScheduledEmailVariables): string {
  const locationSection = vars.location 
    ? `<p><strong>Location:</strong> ${vars.location}</p>` 
    : '';
  
  const meetingLinkSection = vars.meetingLink 
    ? `<p><strong>Meeting Link:</strong> <a href="${vars.meetingLink}" style="color: ${BRAND_COLOR};">${vars.meetingLink}</a></p>`
    : '';

  const notesSection = vars.notes 
    ? `<div style="margin-top: 20px; padding: 15px; background-color: #f5f5f5; border-radius: 4px;">
         <p style="margin: 0;"><strong>Additional Notes:</strong></p>
         <p style="margin: 10px 0 0 0;">${vars.notes}</p>
       </div>`
    : '';

  return `
<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
  <p>Hi ${vars.candidateName},</p>

  <p>We're excited to invite you for an interview for the <strong>${vars.jobTitle}</strong> position.</p>

  <div style="background-color: #f9f9f9; padding: 20px; border-radius: 4px; margin: 20px 0;">
    <h3 style="margin-top: 0;">Interview Details</h3>
    <p><strong>Date:</strong> ${vars.interviewDate}</p>
    <p><strong>Time:</strong> ${vars.interviewTime}</p>
    <p><strong>Duration:</strong> ${vars.duration} minutes</p>
    <p><strong>Type:</strong> ${vars.interviewType}</p>
    ${locationSection}
    ${meetingLinkSection}
  </div>

  ${notesSection}

  ${vars.meetingLink ? buildHtmlButton('Join Interview', vars.meetingLink) : ''}

  <p>We look forward to speaking with you!</p>

  ${buildHtmlFooter(vars.organizationName)}
</body>
</html>
  `.trim();
}

export function buildInterviewScheduledEmail(vars: InterviewScheduledEmailVariables) {
  return {
    subject: interviewScheduledEmailSubject(vars),
    text: interviewScheduledEmailTemplate(vars),
    html: interviewScheduledEmailHtml(vars),
  };
}

/**
 * Application Rejected Email Templates
 */
export function applicationRejectedEmailSubject(vars: ApplicationRejectedEmailVariables): string {
  return `Update on your application for ${vars.jobTitle}`;
}

export function applicationRejectedEmailTemplate(vars: ApplicationRejectedEmailVariables): string {
  const rejectionReasonText = vars.rejectionReason 
    ? `\n\nReason: ${vars.rejectionReason}`
    : '';

  return `
Hi ${vars.candidateName},

Thank you for your interest in the ${vars.jobTitle} position at ${vars.organizationName}.

After careful consideration, we've decided to move forward with other candidates whose qualifications more closely match our current needs.${rejectionReasonText}

We appreciate the time you took to apply and wish you the best in your job search.

Best regards,
${vars.organizationName} Team
  `.trim();
}

export function applicationRejectedEmailHtml(vars: ApplicationRejectedEmailVariables): string {
  const rejectionReasonSection = vars.rejectionReason 
    ? `<div style="margin-top: 20px; padding: 15px; background-color: #fff3cd; border-left: 4px solid #ffc107; border-radius: 4px;">
         <p style="margin: 0;"><strong>Reason:</strong></p>
         <p style="margin: 10px 0 0 0;">${vars.rejectionReason}</p>
       </div>`
    : '';

  return `
<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
  <p>Hi ${vars.candidateName},</p>

  <p>Thank you for your interest in the <strong>${vars.jobTitle}</strong> position at <strong>${vars.organizationName}</strong>.</p>

  <p>After careful consideration, we've decided to move forward with other candidates whose qualifications more closely match our current needs.</p>

  ${rejectionReasonSection}

  <p>We appreciate the time you took to apply and wish you the best in your job search.</p>

  ${buildHtmlFooter(vars.organizationName)}
</body>
</html>
  `.trim();
}

export function buildApplicationRejectedEmail(vars: ApplicationRejectedEmailVariables) {
  return {
    subject: applicationRejectedEmailSubject(vars),
    text: applicationRejectedEmailTemplate(vars),
    html: applicationRejectedEmailHtml(vars),
  };
}

/**
 * Application Accepted Email Templates
 */
export function applicationAcceptedEmailSubject(vars: ApplicationAcceptedEmailVariables): string {
  return `Congratulations! Offer for ${vars.jobTitle}`;
}

export function applicationAcceptedEmailTemplate(vars: ApplicationAcceptedEmailVariables): string {
  const nextStepsText = vars.nextSteps 
    ? `\n\nNext Steps:\n${vars.nextSteps}`
    : '';

  return `
Hi ${vars.candidateName},

Congratulations! We're excited to offer you the ${vars.jobTitle} position at ${vars.organizationName}.

We were impressed with your qualifications and believe you'll be a great addition to our team.${nextStepsText}

We look forward to welcoming you to the team!

Best regards,
${vars.organizationName} Team
  `.trim();
}

export function applicationAcceptedEmailHtml(vars: ApplicationAcceptedEmailVariables): string {
  const nextStepsSection = vars.nextSteps 
    ? `<div style="margin-top: 20px; padding: 15px; background-color: #d4edda; border-left: 4px solid #28a745; border-radius: 4px;">
         <p style="margin: 0;"><strong>Next Steps:</strong></p>
         <p style="margin: 10px 0 0 0;">${vars.nextSteps}</p>
       </div>`
    : '';

  return `
<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
  <p>Hi ${vars.candidateName},</p>

  <p><strong>Congratulations!</strong> We're excited to offer you the <strong>${vars.jobTitle}</strong> position at <strong>${vars.organizationName}</strong>.</p>

  <p>We were impressed with your qualifications and believe you'll be a great addition to our team.</p>

  ${nextStepsSection}

  <p>We look forward to welcoming you to the team!</p>

  ${buildHtmlFooter(vars.organizationName)}
</body>
</html>
  `.trim();
}

export function buildApplicationAcceptedEmail(vars: ApplicationAcceptedEmailVariables) {
  return {
    subject: applicationAcceptedEmailSubject(vars),
    text: applicationAcceptedEmailTemplate(vars),
    html: applicationAcceptedEmailHtml(vars),
  };
}



