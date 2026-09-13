import nodemailer, { type Transporter } from 'nodemailer';

export interface LoginNotificationPayload {
  name: string;
  email: string;
  loginMethod: 'Email' | 'Google';
  timestamp?: string;
  eventType?: 'login' | 'registration';
}

export interface RatingNotificationPayload {
  userId?: string;
  userName: string;
  userEmail: string;
  rating: number;
  comment?: string;
  page?: string;
  timestamp?: string;
}

export interface NotificationResult {
  success: boolean;
  messageId?: string;
  duplicateSuppressed?: boolean;
  simulated?: boolean;
  error?: string;
  note?: string;
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
function getEmailTransporter(): Transporter | null {
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
 * Format timestamp into human-readable format matching:
 * "13 September 2026, 3:10 PM"
 */
function formatLoginTime(timestamp?: string): string {
  const date = timestamp ? new Date(timestamp) : new Date();
  const validDate = isNaN(date.getTime()) ? new Date() : date;
  const day = validDate.getDate();
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];
  const month = months[validDate.getMonth()];
  const year = validDate.getFullYear();
  let hours = validDate.getHours();
  const minutes = validDate.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  return `${day} ${month} ${year}, ${hours}:${minutes} ${ampm}`;
}

/**
 * Sends an administrative notification when a user logs in or registers.
 */
export async function sendAdminLoginEmail(
  payload: LoginNotificationPayload
): Promise<NotificationResult> {
  // Use actual authenticated user's registered/profile name
  // If a name is genuinely unavailable, display: "Not available" instead of guessing
  const rawName = typeof payload.name === 'string' ? payload.name.trim() : '';
  const displayName = rawName.length > 0 ? rawName : 'Not available';
  const safeEmail = (payload.email || 'Not available').trim().toLowerCase();
  const loginMethodDisplay = payload.loginMethod === 'Google' ? 'Google' : 'Email/Password';
  const loginTime = formatLoginTime(payload.timestamp);

  // Prevent duplicate notifications caused by page refreshes or quick repeated actions
  const dedupKey = `${safeEmail}_${payload.loginMethod}_${payload.eventType || 'login'}`;
  const now = Date.now();
  const lastSent = deduplicationCache.get(dedupKey);

  if (lastSent && now - lastSent < DEDUP_WINDOW_MS) {
    console.log(`[Admin Notification] Duplicate notification suppressed for ${safeEmail} (${loginMethodDisplay})`);
    return {
      success: true,
      duplicateSuppressed: true,
    };
  }

  // Update deduplication timestamp
  deduplicationCache.set(dedupKey, now);

  // Determine administrator recipient email strictly from server environment variable
  const adminEmail = (
    process.env.ADMIN_EMAIL ||
    process.env.ADMIN_NOTIFICATION_EMAIL ||
    ''
  ).trim();

  // Email subject makes it immediately clear which user logged in
  const subject =
    displayName !== 'Not available'
      ? `CareerAI – New User Login: ${displayName}`
      : 'CareerAI – New User Login';

  // Plain-text content matching exact format requested
  const textContent = `CareerAI – New User Login

New user login detected

Name: ${displayName}
Email: ${safeEmail}
Login Method: ${loginMethodDisplay}
Login Time: ${loginTime}
Status: Successful Login

--------------------------------------------------
This is an automated administrative notification from CareerAI.
No sensitive authentication credentials, passwords, or tokens are ever stored or transmitted.`;

  // HTML content cleanly formatted
  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>CareerAI – New User Login</title>
</head>
<body style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f1f5f9; margin: 0; padding: 24px; color: #0f172a;">
  <div style="max-width: 560px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05);">
    
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%); padding: 24px; color: #ffffff;">
      <h1 style="margin: 0; font-size: 20px; font-weight: 700; letter-spacing: -0.025em; color: #ffffff;">
        CareerAI – New User Login
      </h1>
      <p style="margin: 6px 0 0 0; font-size: 13px; color: #e0e7ff; font-weight: 500;">
        New user login detected
      </p>
    </div>

    <!-- User Details in Email -->
    <div style="padding: 24px;">
      <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px 20px; margin-bottom: 20px;">
        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
          <tbody>
            <tr>
              <td style="padding: 8px 0; color: #64748b; font-weight: 600; width: 130px; vertical-align: top;">Name:</td>
              <td style="padding: 8px 0; color: #0f172a; font-weight: 700; vertical-align: top; font-size: 15px;">
                ${displayName}
              </td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #64748b; font-weight: 600; vertical-align: top;">Email:</td>
              <td style="padding: 8px 0; color: #2563eb; font-weight: 600; vertical-align: top;">
                <a href="mailto:${safeEmail}" style="color: #2563eb; text-decoration: none;">${safeEmail}</a>
              </td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #64748b; font-weight: 600; vertical-align: top;">Login Method:</td>
              <td style="padding: 8px 0; color: #0f172a; font-weight: 600; vertical-align: top;">
                <span style="display: inline-block; padding: 3px 10px; border-radius: 9999px; font-size: 12px; font-weight: 700; background-color: ${
                  payload.loginMethod === 'Google' ? '#e0f2fe' : '#ede9fe'
                }; color: ${payload.loginMethod === 'Google' ? '#0369a1' : '#6d28d9'};">
                  ${loginMethodDisplay}
                </span>
              </td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #64748b; font-weight: 600; vertical-align: top;">Login Time:</td>
              <td style="padding: 8px 0; color: #334155; font-weight: 500; vertical-align: top;">
                ${loginTime}
              </td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #64748b; font-weight: 600; vertical-align: top;">Status:</td>
              <td style="padding: 8px 0; color: #059669; font-weight: 700; vertical-align: top;">
                &#10004; Successful Login
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div style="padding: 12px 16px; background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; font-size: 12px; color: #166534;">
        <span>&#10004; <strong>Security Verified:</strong> No passwords, authentication tokens, API keys, or private session secrets are included in this notification.</span>
      </div>
    </div>

    <!-- Footer -->
    <div style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 14px 24px; text-align: center; font-size: 12px; color: #94a3b8;">
      CareerAI Placement Intelligence System &bull; Administrative Login Notification
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
      console.log('📧 [Admin Login Notification - Delivery Notice]');
      console.log(`To Admin: ${adminEmail || '(ADMIN_EMAIL environment variable not set)'}`);
      console.log(`Subject: ${subject}`);
      console.log('');
      console.log('CareerAI – New User Login');
      console.log('');
      console.log('New user login detected');
      console.log('');
      console.log(`Name: ${displayName}`);
      console.log(`Email: ${safeEmail}`);
      console.log(`Login Method: ${loginMethodDisplay}`);
      console.log(`Login Time: ${loginTime}`);
      console.log('Status: Successful Login');
      console.log('----------------------------------------------------');

      return {
        success: true,
        simulated: true,
      };
    }

    if (!adminEmail) {
      console.warn('[Admin Notification] ADMIN_EMAIL environment variable is not configured on the server. Live email dispatch skipped.');
      return {
        success: true,
        simulated: true,
        note: 'ADMIN_EMAIL environment variable is not configured on the server',
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

    console.log(`[Admin Notification] Live email successfully dispatched to ${adminEmail} for ${displayName} (ID: ${info.messageId})`);

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

/**
 * Sends an administrative notification email whenever a user submits a rating or feedback.
 * Strictly adheres to the required subject and template format.
 */
export async function sendAdminRatingEmail(
  payload: RatingNotificationPayload
): Promise<NotificationResult> {
  const rawName = typeof payload.userName === 'string' ? payload.userName.trim() : '';
  const displayName = rawName.length > 0 ? rawName : 'CareerAI User';
  const safeEmail = (payload.userEmail || 'Not available').trim().toLowerCase();
  const safeRating = Math.max(1, Math.min(5, Math.round(payload.rating || 5)));
  const stars = '★'.repeat(safeRating);
  const feedbackText =
    payload.comment && payload.comment.trim().length > 0
      ? payload.comment.trim()
      : 'No written feedback provided';
  const pageText =
    payload.page && payload.page.trim().length > 0 ? payload.page.trim() : 'Dashboard';
  const formattedTime = formatLoginTime(payload.timestamp);

  // Prevent accidental duplicate notification emails caused by double clicks or rapid retries
  const dedupKey = `rating_${safeEmail}_${safeRating}_${feedbackText.slice(0, 50)}`;
  const now = Date.now();
  const lastSent = deduplicationCache.get(dedupKey);

  if (lastSent && now - lastSent < 30 * 1000) {
    console.log(`[Admin Notification] Duplicate rating email suppressed for ${safeEmail}`);
    return {
      success: true,
      duplicateSuppressed: true,
    };
  }

  deduplicationCache.set(dedupKey, now);

  const adminEmail = (
    process.env.ADMIN_EMAIL ||
    process.env.ADMIN_NOTIFICATION_EMAIL ||
    ''
  ).trim();

  const subject = 'CareerAI – New User Rating ⭐';

  const textContent = `⭐ New CareerAI User Rating

User Name: ${displayName}
User Email: ${safeEmail}

Rating: ${safeRating} / 5
Stars: ${stars}

Feedback:
${feedbackText}

Page:
${pageText}

Submitted At:
${formattedTime}

Status:
New Feedback`;

  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>CareerAI – New User Rating ⭐</title>
</head>
<body style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f1f5f9; margin: 0; padding: 24px; color: #0f172a;">
  <div style="max-width: 560px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05);">
    
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 50%, #4f46e5 100%); padding: 24px; color: #ffffff;">
      <h1 style="margin: 0; font-size: 20px; font-weight: 700; letter-spacing: -0.025em; color: #ffffff;">
        ⭐ CareerAI – New User Rating
      </h1>
      <p style="margin: 6px 0 0 0; font-size: 13px; color: #fef3c7; font-weight: 500;">
        A logged-in user just shared their feedback
      </p>
    </div>

    <!-- Rating & User Details in Email -->
    <div style="padding: 24px;">
      <!-- Big Star Rating Display -->
      <div style="background: linear-gradient(to right, #fffbeb, #fef3c7); border: 1px solid #fde68a; border-radius: 12px; padding: 18px 20px; text-align: center; margin-bottom: 20px;">
        <div style="font-size: 28px; line-height: 1; color: #d97706; letter-spacing: 4px; margin-bottom: 6px;">
          ${stars}
        </div>
        <div style="font-size: 18px; font-weight: 800; color: #92400e;">
          Rating: ${safeRating} / 5
        </div>
      </div>

      <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px 20px; margin-bottom: 20px;">
        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
          <tbody>
            <tr>
              <td style="padding: 8px 0; color: #64748b; font-weight: 600; width: 130px; vertical-align: top;">User Name:</td>
              <td style="padding: 8px 0; color: #0f172a; font-weight: 700; vertical-align: top; font-size: 15px;">
                ${displayName}
              </td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #64748b; font-weight: 600; vertical-align: top;">User Email:</td>
              <td style="padding: 8px 0; color: #2563eb; font-weight: 600; vertical-align: top;">
                <a href="mailto:${safeEmail}" style="color: #2563eb; text-decoration: none;">${safeEmail}</a>
              </td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #64748b; font-weight: 600; vertical-align: top;">Rating:</td>
              <td style="padding: 8px 0; color: #d97706; font-weight: 700; vertical-align: top;">
                ${safeRating} / 5 &nbsp; <span style="font-size: 15px;">${stars}</span>
              </td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #64748b; font-weight: 600; vertical-align: top;">Feedback:</td>
              <td style="padding: 8px 0; color: #0f172a; font-weight: 500; vertical-align: top; white-space: pre-wrap; font-style: ${payload.comment ? 'normal' : 'italic'};">
                ${feedbackText}
              </td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #64748b; font-weight: 600; vertical-align: top;">Page:</td>
              <td style="padding: 8px 0; color: #334155; font-weight: 600; vertical-align: top;">
                <span style="display: inline-block; padding: 2px 8px; border-radius: 6px; font-size: 12px; font-weight: 600; background-color: #e0e7ff; color: #4338ca;">
                  ${pageText}
                </span>
              </td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #64748b; font-weight: 600; vertical-align: top;">Submitted At:</td>
              <td style="padding: 8px 0; color: #334155; font-weight: 500; vertical-align: top;">
                ${formattedTime}
              </td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #64748b; font-weight: 600; vertical-align: top;">Status:</td>
              <td style="padding: 8px 0; color: #059669; font-weight: 700; vertical-align: top;">
                New Feedback
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Footer -->
    <div style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 14px 24px; text-align: center; font-size: 12px; color: #94a3b8;">
      CareerAI Placement Intelligence System &bull; User Rating &amp; Feedback Service
    </div>
  </div>
</body>
</html>
`;

  try {
    const transporter = getEmailTransporter();

    if (!transporter) {
      console.log('----------------------------------------------------');
      console.log('⭐ [Admin Rating Notification - Delivery Notice]');
      console.log(`To Admin: ${adminEmail || '(ADMIN_EMAIL environment variable not set)'}`);
      console.log(`Subject: ${subject}`);
      console.log('');
      console.log('⭐ New CareerAI User Rating');
      console.log('');
      console.log(`User Name: ${displayName}`);
      console.log(`User Email: ${safeEmail}`);
      console.log('');
      console.log(`Rating: ${safeRating} / 5`);
      console.log(`Stars: ${stars}`);
      console.log('');
      console.log('Feedback:');
      console.log(feedbackText);
      console.log('');
      console.log(`Page:\n${pageText}`);
      console.log('');
      console.log(`Submitted At:\n${formattedTime}`);
      console.log('');
      console.log('Status:\nNew Feedback');
      console.log('----------------------------------------------------');

      return {
        success: true,
        simulated: true,
      };
    }

    if (!adminEmail) {
      console.warn('[Admin Notification] ADMIN_EMAIL environment variable is not configured on the server. Live rating email dispatch skipped.');
      return {
        success: true,
        simulated: true,
        note: 'ADMIN_EMAIL environment variable is not configured on the server',
      };
    }

    const fromAddress =
      process.env.SMTP_FROM ||
      `"CareerAI Feedback" <${process.env.SMTP_USER || process.env.GMAIL_USER || 'feedback@careerai.com'}>`;

    const info = await transporter.sendMail({
      from: fromAddress,
      to: adminEmail,
      subject,
      text: textContent,
      html: htmlContent,
    });

    console.log(`[Admin Notification] Live rating email successfully dispatched to ${adminEmail} from ${displayName} (ID: ${info.messageId})`);

    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (error: any) {
    console.error('[Admin Notification Error] Failed to send admin rating email:', error?.message || error);
    return {
      success: false,
      error: error?.message || 'Email delivery failed',
    };
  }
}

