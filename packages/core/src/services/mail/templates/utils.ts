import { buildUrl } from '../../../utils/url-builder';

/**
 * Brand color for buttons and links in emails
 */
export const BRAND_COLOR = '#49785C';

/**
 * Re-export buildUrl for backward compatibility
 */
export { buildUrl };

/**
 * Generate common HTML button for emails
 * @param text - Button text
 * @param link - Button link URL
 * @returns HTML button string
 */
export function buildHtmlButton(text: string, link: string): string {
  return `<p style="margin: 25px 0;">
    <a href="${link}"
       style="display: inline-block; padding: 12px 30px; background-color: ${BRAND_COLOR}; color: #ffffff; text-decoration: none; border-radius: 4px; font-weight: bold;">
      ${text}
    </a>
  </p>`;
}

/**
 * Generate common HTML footer for emails
 * @param organizationName - Organization name to display
 * @returns HTML footer string
 */
export function buildHtmlFooter(organizationName: string): string {
  return `<hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">

  <p style="font-size: 14px; color: #666;">
    Best regards,<br>
    ${organizationName} Team
  </p>

  <p style="font-size: 12px; color: #999;">
    Powered by <a href="https://rabbithr.co" style="color: ${BRAND_COLOR}; text-decoration: none;">RabbitHR</a>
  </p>`;
}
