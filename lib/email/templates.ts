/**
 * Email Templates
 * Reusable email templates for the CMS
 */

export interface ThankYouEmailTemplateData {
    recipientName: string;
    contentType: 'ebook' | 'case_study' | 'whitepaper';
    contentTitle: string;
    downloadUrl: string;
}

/**
 * Generate thank you email HTML template
 */
export function generateThankYouEmailTemplate(data: ThankYouEmailTemplateData): string {
    const { recipientName, contentType, contentTitle, downloadUrl } = data;

    const contentTypeName = {
        ebook: 'eBook',
        case_study: 'Case Study',
        whitepaper: 'Whitepaper',
    }[contentType] || 'Resource';

    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 28px;">Thank You!</h1>
      </div>
      
      <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
        <p style="font-size: 16px; margin-bottom: 20px;">
          Hi ${recipientName || 'there'},
        </p>
        
        <p style="font-size: 16px; margin-bottom: 20px;">
          Thank you for your interest in our ${contentTypeName.toLowerCase()}!
        </p>
        
        <div style="background: #f0f9ff; border-left: 4px solid #3b82f6; padding: 20px; margin: 20px 0; border-radius: 4px;">
          <h2 style="margin-top: 0; color: #1e40af; font-size: 20px;">${contentTitle}</h2>
          <p style="margin-bottom: 0; color: #475569;">Your download is ready!</p>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${downloadUrl}" 
             style="display: inline-block; background: #3b82f6; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
            Download ${contentTypeName}
          </a>
        </div>
        
        <p style="font-size: 14px; color: #64748b; margin-top: 30px;">
          If the button doesn't work, you can copy and paste this link into your browser:<br>
          <a href="${downloadUrl}" style="color: #3b82f6; word-break: break-all;">${downloadUrl}</a>
        </p>
        
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
        
        <p style="font-size: 14px; color: #64748b; margin-top: 30px;">
          Best regards,<br>
          <strong>The Intellectt Team</strong>
        </p>
      </div>
      
      <div style="text-align: center; margin-top: 20px; padding: 20px; color: #94a3b8; font-size: 12px;">
        <p>© ${new Date().getFullYear()} Intellectt. All rights reserved.</p>
      </div>
    </body>
    </html>
  `;
}


