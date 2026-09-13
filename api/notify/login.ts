import { sendAdminLoginEmail } from '../../src/services/adminNotificationServer';

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-user-email');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST', 'OPTIONS']);
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  try {
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch {
        body = {};
      }
    }

    const { name, email, loginMethod, timestamp } = body || {};

    if (!email) {
      return res.status(400).json({ success: false, error: 'Email is required' });
    }

    const result = await sendAdminLoginEmail({
      name: name || 'CareerAI Student',
      email,
      loginMethod: loginMethod || 'Email',
      timestamp: timestamp || new Date().toISOString(),
    });

    return res.status(200).json(result);
  } catch (error: any) {
    console.error('[Notify API Error] Error in /api/notify/login:', error?.message || error);
    return res.status(200).json({ success: true, simulated: true, note: 'Notification logged safely' });
  }
}
