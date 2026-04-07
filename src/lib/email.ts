import nodemailer from 'nodemailer';

// Create a reusable transporter for the application.
// For development, we assume credentials like Mailtrap or a generic SMTP.
// For production, replace environment variables with Resend/SendGrid SMTP info.
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SERVER_HOST || 'smtp.mailtrap.io',
  port: parseInt(process.env.EMAIL_SERVER_PORT || '2525', 10),
  auth: {
    user: process.env.EMAIL_SERVER_USER || 'mock_user',
    pass: process.env.EMAIL_SERVER_PASSWORD || 'mock_pass',
  },
});

type SendEmailOptions = {
  to: string;
  subject: string;
  html: string;
  text?: string;
};

/**
 * Standardized generic email sender.
 */
export async function sendEmail({ to, subject, html, text }: SendEmailOptions) {
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || '"Testing Platform" <noreply@testingplatform.com>',
      to,
      subject,
      html,
      text,
    });
    
    console.log("Message sent: %s", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Error sending email", error);
    return { success: false, error };
  }
}

/**
 * Specifically formats and sends a Test Invitation Email
 */
export async function sendAccessInvitation(to: string, orgName: string, testName: string, link: string) {
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
      <div style="background-color: #0f172a; padding: 24px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 24px;">Action Required</h1>
      </div>
      <div style="padding: 32px; background-color: #fafafa;">
        <p style="font-size: 16px; color: #334155; margin-bottom: 24px;">
          You have been invited by <strong>${orgName}</strong> to complete the <strong>${testName}</strong> assessment.
        </p>
        <div style="text-align: center; margin-top: 32px; margin-bottom: 32px;">
          <a href="${link}" style="background-color: #10b981; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">
            Start Assessment Now
          </a>
        </div>
        <p style="font-size: 14px; color: #64748b; border-top: 1px solid #e2e8f0; padding-top: 16px;">
          Note: This link is unique to you. Do not share it with others.
        </p>
      </div>
    </div>
  `;

  return sendEmail({
    to,
    subject: `Invitation: ${testName} from ${orgName}`,
    html,
  });
}
