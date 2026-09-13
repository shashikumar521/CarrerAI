import { saveFeedbackRecord, getFeedbackRecords, getFeedbackStats, getVerifiedServerUser } from '../src/services/feedbackServer';
import { sendAdminRatingEmail } from '../src/services/adminNotificationServer';

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
        console.warn(`[Feedback API] 401 Unauthorized: Missing user session credentials`);
        return res.status(401).json({
          success: false,
          error: 'Authentication required. Please sign in to submit feedback.',
        });
      }

      // Validate rating must be integer 1 to 5
      const numRating = Number(rating);
      if (!Number.isInteger(numRating) || numRating < 1 || numRating > 5) {
        console.warn(`[Feedback API] 400 Bad Request: Invalid rating value ${rating}`);
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

      console.log(`[Feedback API] Feedback record ${record.id} permanently saved (Rating: ${record.rating}/5, Status: ${record.status})`);

      // Dispatch single admin email notification asynchronously
      // Critical: Database save does NOT depend on email delivery
      if (!isDuplicate) {
        sendAdminRatingEmail({
          userId: record.userId,
          userName: record.userName,
          userEmail: record.userEmail,
          rating: record.rating,
          comment: record.comment,
          page: record.page,
          timestamp: record.createdAt,
        }).catch((emailErr) => {
          console.error('[Feedback API Error] Admin email dispatch failed (feedback is safely stored):', emailErr?.message || emailErr);
        });
      }

      // Return success response with saved record
      return res.status(200).json({
        success: true,
        feedback: record,
        message: 'Thank you for your feedback! ❤️',
      });
    } catch (error: any) {
      console.error('[Feedback API Error] 500 Unhandled error in POST /api/feedback:', error?.message || error);
      return res.status(500).json({
        success: false,
        error: 'An error occurred while saving your feedback. Please try again.',
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
