import nodemailer from 'nodemailer';

export interface LoginNotificationPayload {
  name: string;
  email: string;
  loginMethod: 'Email' | 'Google';
  timestamp?: string;
  eventType?: 'login' | 'registration';
}

export interface NotificationResult {
  success: boolean;
  messageId?: string;
  duplicateSuppressed?: boolean;
  simulated?: boolean;
  error?: string;
}

// In-memory cache to prevent duplicate notifications (e.g., within 2 minutes)
const deduplicationCache = new Map<string, number>();
const DEDUP_WINDOW_MS = 2 * 60 * 1000; // 2 minutes

// Clean up expired cache items periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, timestamp] of deduplicationCache.entries()) {
    if (now - timestamp > DEDUP_WINDOW_MS) {
      deduplicationCache.delete(key);
    }
  }
}, 60 * 1000);

/**
 * Creates or retrieves the Nodemailer transport based on environment variables.
 */
function getEmailTransporter(): nodemailer.Transporter | null {
  const gmailUser = process.env.GMAIL_USER;
  const gmailPass = process.env.GMAIL_APP_PASSWORD;

  if (gmailUser && gmailPass) {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: gmailUser,
        pass: gmailPass,
      },
    });
  }

  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const smtpSecure = process.env.SMTP_SECURE === 'true' || smtpPort === 465;

  if (smtpHost && smtpUser && smtpPass) {
    return nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpSecure,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });
  }

  return null;
}

/**
 * Sends an administrative notification when a user logs in or registers.
 */
export async function sendAdminLoginEmail(
  payload: LoginNotificationPayload
): Promise<NotificationResult> {
  // Extract strictly allowed basic fields (never include passwords, tokens, or hashes)
  const safeName = (payload.name || 'Anonymous User').trim();
  const safeEmail = (payload.email || 'No email provided').trim().toLowerCase();
  const loginMethod = payload.loginMethod === 'Google' ? 'Google' : 'Email';
  const eventType = payload.eventType === 'registration' ? 'Registration' : 'Login';
  
  // Format human-readable date & time
  const rawDate = payload.timestamp ? new Date(payload.timestamp) : new Date();
  const validDate = isNaN(rawDate.getTime()) ? new Date() : rawDate;
  const formattedDateTime = validDate.toLocaleString('en-US', {
    dateStyle: 'full',
    timeStyle: 'long',
    timeZone: 'Asia/Kolkata', // Helpful for local Indian university placement context
  }) + ` (UTC: ${validDate.toUTCString()})`;

  // Prevent duplicate notifications caused by page refreshes or quick repeated actions
  const dedupKey = `${safeEmail}_${loginMethod}_${payload.eventType || 'login'}`;
  const now = Date.now();
  const lastSent = deduplicationCache.get(dedupKey);

  if (lastSent && now - lastSent < DEDUP_WINDOW_MS) {
    console.log(`[Admin Notification] Duplicate notification suppressed for ${safeEmail} (${loginMethod})`);
    return {
      success: true,
      duplicateSuppressed: true,
    };
  }

  // Update deduplication timestamp
  deduplicationCache.set(dedupKey, now);

  // Determine administrator recipient email from environment
  const adminEmail =
    process.env.ADMIN_EMAIL ||
    process.env.ADMIN_NOTIFICATION_EMAIL ||
    'sudarsishashikumar521@gmail.com';

  const subject = 'CareerAI - New User Login';

  // Plain-text content containing ONLY basic information as specified in requirements
  const textContent = `CareerAI - New User Login

User Name: ${safeName}
User Email: ${safeEmail}
Login/Registration Date & Time: ${formattedDateTime}
Login Method: ${loginMethod}
Activity Type: ${eventType}

--------------------------------------------------
This is an automated administrative notification from CareerAI.
No sensitive authentication credentials or passwords are ever stored or transmitted.`;

  // HTML content formatted cleanly
  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>CareerAI - New User Login</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f1f5f9; margin: 0; padding: 24px; color: #0f172a;">
  <div style="max-width: 560px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05);">
    
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%); padding: 24px; color: #ffffff;">
      <div style="display: flex; align-items: center; gap: 12px;">
        <h1 style="margin: 0; font-size: 20px; font-weight: 800; letter-spacing: -0.025em; color: #ffffff;">
          CareerAI - New User Login
        </h1>
      </div>
      <p style="margin: 6px 0 0 0; font-size: 13px; color: #e0e7ff; font-weight: 500;">
        Administrator Authentication &amp; Activity Notice
      </p>
    </div>

    <!-- Body Information Details -->
    <div style="padding: 28px 24px;">
      <p style="margin: 0 0 20px 0; font-size: 14px; color: #475569; line-height: 1.5;">
        A user has successfully authenticated on the <strong>CareerAI</strong> placement readiness platform. Here are the basic session details:
      </p>

      <table style="width: 100%; border-collapse: separate; border-spacing: 0; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
        <tbody>
          <tr>
            <td style="padding: 12px 16px; font-size: 13px; font-weight: 600; color: #64748b; border-bottom: 1px solid #e2e8f0; width: 140px;">
              User Name
            </td>
            <td style="padding: 12px 16px; font-size: 14px; font-weight: 700; color: #0f172a; border-bottom: 1px solid #e2e8f0;">
              ${safeName}
            </td>
          </tr>
          <tr>
            <td style="padding: 12px 16px; font-size: 13px; font-weight: 600; color: #64748b; border-bottom: 1px solid #e2e8f0;">
              User Email
            </td>
            <td style="padding: 12px 16px; font-size: 14px; font-weight: 600; color: #2563eb; border-bottom: 1px solid #e2e8f0;">
              <a href="mailto:${safeEmail}" style="color: #2563eb; text-decoration: none;">${safeEmail}</a>
            </td>
          </tr>
          <tr>
            <td style="padding: 12px 16px; font-size: 13px; font-weight: 600; color: #64748b; border-bottom: 1px solid #e2e8f0;">
              Date and Time
            </td>
            <td style="padding: 12px 16px; font-size: 13px; color: #334155; border-bottom: 1px solid #e2e8f0;">
              ${formattedDateTime}
            </td>
          </tr>
          <tr>
            <td style="padding: 12px 16px; font-size: 13px; font-weight: 600; color: #64748b;">
              Login Method
            </td>
            <td style="padding: 12px 16px; font-size: 13px;">
              <span style="display: inline-block; padding: 4px 10px; border-radius: 9999px; font-size: 12px; font-weight: 700; background-color: ${
                loginMethod === 'Google' ? '#e0f2fe' : '#ede9fe'
              }; color: ${loginMethod === 'Google' ? '#0369a1' : '#6d28d9'};">
                ${loginMethod}
              </span>
              <span style="display: inline-block; margin-left: 6px; padding: 4px 8px; border-radius: 9999px; font-size: 11px; font-weight: 600; background-color: #f1f5f9; color: #475569;">
                ${eventType}
              </span>
            </td>
          </tr>
        </tbody>
      </table>

      <div style="margin-top: 24px; padding: 12px 16px; background-color: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 8px; font-size: 12px; color: #065f46; display: flex; align-items: center;">
        <span>&#10004; <strong>Security Verified:</strong> No passwords, session secrets, or private credentials were included in this notification.</span>
      </div>
    </div>

    <!-- Footer -->
    <div style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 16px 24px; text-align: center; font-size: 12px; color: #94a3b8;">
      CareerAI Placement Intelligence System &bull; Administrative Security Dispatch
    </div>
  </div>
</body>
</html>
`;

  try {
    const transporter = getEmailTransporter();

    if (!transporter) {
      // If SMTP credentials are not yet set in .env, log simulated delivery safely to server logs
      console.log('----------------------------------------------------');
      console.log('📧 [Admin Login Notification - Simulated Delivery]');
      console.log(`To Admin: ${adminEmail}`);
      console.log(`Subject: ${subject}`);
      console.log(`User Name: ${safeName}`);
      console.log(`User Email: ${safeEmail}`);
      console.log(`Login Method: ${loginMethod} (${eventType})`);
      console.log(`Date & Time: ${formattedDateTime}`);
      console.log('Notice: Configure SMTP_HOST/SMTP_USER/SMTP_PASS or GMAIL_USER/GMAIL_APP_PASSWORD in .env for live inbox delivery.');
      console.log('----------------------------------------------------');

      return {
        success: true,
        simulated: true,
      };
    }

    // Live email dispatch
    const fromAddress =
      process.env.SMTP_FROM ||
      `"CareerAI Security" <${process.env.SMTP_USER || process.env.GMAIL_USER || 'notifications@careerai.com'}>`;

    const info = await transporter.sendMail({
      from: fromAddress,
      to: adminEmail,
      subject,
      text: textContent,
      html: htmlContent,
    });

    console.log(`[Admin Notification] Live email successfully dispatched to ${adminEmail} (ID: ${info.messageId})`);

    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (error: any) {
    // Non-fatal: user login must never fail even if the email service encounters an error
    console.error('[Admin Notification Error] Failed to send admin email:', error?.message || error);
    return {
      success: false,
      error: error?.message || 'Email delivery failed',
    };
  }
}
