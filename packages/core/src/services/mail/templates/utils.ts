import { buildUrl } from '../../../utils/url-builder';

export const BRAND_COLOR = '#49785C';

export { buildUrl };

export function buildHtmlButton(text: string, link: string): string {
  return `<p style="margin: 25px 0;">
    <a href="${link}"
       style="display: inline-block; padding: 12px 30px; background-color: ${BRAND_COLOR}; color: #ffffff; text-decoration: none; border-radius: 4px; font-weight: bold;">
      ${text}
    </a>
  </p>`;
}

export function buildHtmlFooter(organizationName: string): string {
  return `<hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">

  <p style="font-size: 14px; color: #666;">
    Best regards,<br>
    ${organizationName} Team
  </p>`;
}
