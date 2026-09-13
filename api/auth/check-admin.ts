export default function handler(req: any, res: any) {
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

  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch {
      body = {};
    }
  }

  const adminEmail = (
    process.env.ADMIN_EMAIL ||
    process.env.ADMIN_NOTIFICATION_EMAIL ||
    ''
  ).trim().toLowerCase();

  const userEmail = (body?.email || req.headers?.['x-user-email'] || '').trim().toLowerCase();

  if (!adminEmail || !userEmail) {
    return res.status(200).json({ isAdmin: false });
  }

  return res.status(200).json({ isAdmin: userEmail === adminEmail });
}
