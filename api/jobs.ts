import { getLiveJobs } from '../src/services/jobsApiServer.ts';

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  try {
    const { query, location, role, refresh } = req.query || {};
    const result = await getLiveJobs({
      query: typeof query === 'string' ? query : undefined,
      location: typeof location === 'string' ? location : undefined,
      role: typeof role === 'string' ? role : undefined,
      refresh: refresh === 'true',
    });

    return res.status(200).json({
      success: true,
      jobs: result.jobs,
      total: result.jobs.length,
      source: result.source,
      cached: result.cached,
      retrievedAt: result.retrievedAt,
    });
  } catch (error: any) {
    console.error('Live Jobs API Error:', error);
    return res.status(503).json({
      success: false,
      error: 'Live job data is temporarily unavailable.',
      details: error?.message || 'External job board upstream failure',
      jobs: [],
    });
  }
}
