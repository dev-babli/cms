/**
 * Email Service
 * Handles sending emails using Resend API
 */

interface EmailOptions {
    to: string;
    subject: string;
    html: string;
    from?: string;
}

interface ThankYouEmailData {
    recipientName: string;
    recipientEmail: string;
    contentType: 'ebook' | 'case_study' | 'whitepaper';
    contentTitle: string;
    downloadUrl: string;
}

/**
 * Send email using Resend API
 */
export async function sendEmail(options: EmailOptions): Promise<boolean> {
    const apiKey = process.env.RESEND_API_KEY;
    const fromEmail = process.env.EMAIL_FROM || process.env.RESEND_FROM_EMAIL || 'noreply@intellectt.com';

    // If no API key is configured, log and return false (don't throw error)
    if (!apiKey) {
        console.warn('⚠️ Email service not configured: RESEND_API_KEY not set. Email not sent.');
        return false;
    }

    try {
        const response = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                from: options.from || fromEmail,
                to: options.to,
                subject: options.subject,
                html: options.html,
            }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('❌ Email sending failed:', errorData);
            return false;
        }

        const data = await response.json();
        console.log('✅ Email sent successfully:', data.id);
        return true;
    } catch (error: any) {
        console.error('❌ Email service error:', error.message);
        return false;
    }
}

/**
 * Send thank you email after lead capture
 */
export async function sendThankYouEmail(data: ThankYouEmailData): Promise<boolean> {
    const { recipientName, recipientEmail, contentType, contentTitle, downloadUrl } = data;

    const contentTypeName = {
        ebook: 'eBook',
        case_study: 'Case Study',
        whitepaper: 'Whitepaper',
    }[contentType] || 'Resource';

    const subject = `Thank you for downloading: ${contentTitle}`;

    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${subject}</title>
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
        
        <p style="font-size: 14px; color: #64748b; margin-bottom: 10px;">
          <strong>What's next?</strong>
        </p>
        <ul style="font-size: 14px; color: #64748b; padding-left: 20px;">
          <li>Explore more resources on our website</li>
          <li>Read our latest blog posts</li>
          <li>Connect with us on social media</li>
        </ul>
        
        <p style="font-size: 14px; color: #64748b; margin-top: 30px;">
          Best regards,<br>
          <strong>The Intellectt Team</strong>
        </p>
      </div>
      
      <div style="text-align: center; margin-top: 20px; padding: 20px; color: #94a3b8; font-size: 12px;">
        <p>This email was sent to ${recipientEmail}</p>
        <p>© ${new Date().getFullYear()} Intellectt. All rights reserved.</p>
      </div>
    </body>
    </html>
  `;

    return await sendEmail({
        to: recipientEmail,
        subject,
        html,
    });
}


