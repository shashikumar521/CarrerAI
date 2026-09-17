import { saveFeedbackRecord, getFeedbackRecords, getFeedbackStats, getVerifiedServerUser } from '../src/services/feedbackServer.ts';
import { sendAdminRatingEmail } from '../src/services/adminNotificationServer.ts';

export default async function handler(req: any, res: any) {
  // Safe CORS Headers for Vercel & container environments
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization, x-user-email, x-user-id'
  );

  // Handle CORS preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Parse body if received as string or Buffer
  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch {
      body = {};
    }
  }

  // Handle Feedback Submission (POST)
  if (req.method === 'POST') {
    try {
      const { userId, userName, userEmail, rating, comment, page, timestamp } = body || {};

      const headerEmail = (req.headers?.['x-user-email'] as string) || '';
      const headerId = (req.headers?.['x-user-id'] as string) || '';

      const effectiveUserId = (userId || headerId || '').toString().trim();
      const effectiveUserEmail = (userEmail || headerEmail || '').toString().trim().toLowerCase();

      // Validate authenticated user is required
      if (!effectiveUserId || !effectiveUserEmail) {
        console.warn('[Feedback API] Authentication failed: Missing authenticated user session');
        return res.status(401).json({
          success: false,
          error: 'Authentication required. Please sign in to submit feedback.',
        });
      }

      // Validate rating must be integer 1 to 5
      const numRating = Number(rating);
      if (!Number.isInteger(numRating) || numRating < 1 || numRating > 5) {
        console.warn(`[Feedback API] Validation failed: Rating must be an integer between 1 and 5, received: ${rating}`);
        return res.status(400).json({
          success: false,
          error: 'Rating must be an integer between 1 and 5.',
        });
      }

      // Verify and resolve student name server-side
      const cleanUserId = effectiveUserId;
      const cleanEmail = effectiveUserEmail;
      const verifiedUser = getVerifiedServerUser(cleanEmail) || getVerifiedServerUser(cleanUserId);
      const resolvedName = (verifiedUser?.name || userName || '').trim() || 'CareerAI User';

      // Save rating permanently to database
      const { record, isDuplicate } = saveFeedbackRecord({
        userId: cleanUserId,
        userName: resolvedName,
        userEmail: cleanEmail,
        rating: numRating,
        comment: typeof comment === 'string' ? comment : '',
        page: typeof page === 'string' ? page : 'Dashboard',
        timestamp: typeof timestamp === 'string' ? timestamp : undefined,
      });

      console.log(`[Feedback API] Insert succeeded: Record ${record.id} permanently saved (Rating: ${record.rating}/5, Status: ${record.status})`);

      // Dispatch admin email notification with a 3.5s safety timeout
      // Important: Feedback storage is already complete and safe regardless of email delivery
      let emailSent = false;
      if (!isDuplicate) {
        try {
          const emailResult: any = await Promise.race([
            sendAdminRatingEmail({
              userId: record.userId,
              userName: record.userName,
              userEmail: record.userEmail,
              rating: record.rating,
              comment: record.comment,
              page: record.page,
              timestamp: record.createdAt,
            }),
            new Promise((resolve) =>
              setTimeout(() => resolve({ success: false, error: 'Email dispatch timeout' }), 3500)
            ),
          ]);
          emailSent = Boolean(emailResult?.success && !emailResult?.simulated);
          if (!emailResult?.success) {
            console.warn('[Feedback API] Admin email notification could not be delivered:', emailResult?.error || emailResult?.note || 'Unknown');
          }
        } catch (emailErr: any) {
          console.error('[Feedback API] Email notification failed (feedback safely stored in database):', emailErr?.message || emailErr);
        }
      }

      // Return success response with saved record
      return res.status(200).json({
        success: true,
        message: 'Thank you for your feedback! Your rating has been submitted successfully.',
        feedback: record,
        emailSent,
      });
    } catch (error: any) {
      console.error('[Feedback API] Insert failed / Database error:', error?.message || error);
      return res.status(500).json({
        success: false,
        error: error?.message?.includes('Database')
          ? error.message
          : 'Failed to submit feedback. Please try again.',
      });
    }
  }

  // Handle Admin Feedback Retrieval (GET)
  if (req.method === 'GET') {
    try {
      const headerEmail = (
        (req.headers?.['x-user-email'] as string) ||
        (req.query?.userEmail as string) ||
        ''
      ).trim().toLowerCase();

      const adminEmail = (
        process.env.ADMIN_EMAIL ||
        process.env.ADMIN_NOTIFICATION_EMAIL ||
        ''
      ).trim().toLowerCase();

      if (adminEmail && headerEmail && headerEmail !== adminEmail) {
        console.warn(`[Feedback API] 403 Forbidden: Non-admin email ${headerEmail} attempted feedback access`);
        return res.status(403).json({
          success: false,
          error: 'Access restricted to administrators.',
        });
      }

      const records = getFeedbackRecords();
      const stats = getFeedbackStats();

      return res.status(200).json({
        success: true,
        feedback: records,
        stats,
      });
    } catch (error: any) {
      console.error('[Feedback API Error] 500 Error retrieving feedback:', error?.message || error);
      return res.status(500).json({
        success: false,
        error: 'Failed to retrieve feedback records.',
      });
    }
  }

  // Method not supported
  res.setHeader('Allow', ['GET', 'POST', 'OPTIONS']);
  return res.status(405).json({
    success: false,
    error: `Method ${req.method} Not Allowed`,
  });
}
