import { LiveJob } from '../types';

export interface JobsFetchResult {
  jobs: LiveJob[];
  source: string;
  cached: boolean;
  retrievedAt: string;
  error?: string;
  isDemoFallback?: boolean;
}

/**
 * Fetch real live jobs from the CareerAI server gateway (/api/jobs).
 *
 * Guaranteed characteristics:
 * - Real jobs returned by legitimate external jobs APIs (Remotive, Arbeitnow, Adzuna).
 * - Real application URLs.
 * - Never invents fake salaries, fake companies, or fake postings.
 * - If the API fails, reports error transparently so UI shows "Live job data is temporarily unavailable."
 */
export async function fetchLiveJobsFromApi(options?: {
  query?: string;
  location?: string;
  role?: string;
  refresh?: boolean;
}): Promise<JobsFetchResult> {
  const params = new URLSearchParams();
  if (options?.query) params.set('query', options.query);
  if (options?.location) params.set('location', options.location);
  if (options?.role) params.set('role', options.role);
  if (options?.refresh) params.set('refresh', 'true');

  const queryString = params.toString();
  const endpoint = `/api/jobs${queryString ? `?${queryString}` : ''}`;

  const response = await fetch(endpoint, {
    headers: {
      'Accept': 'application/json',
    },
  });

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.error || 'Live job data is temporarily unavailable.');
  }

  return {
    jobs: (data.jobs || []).map((j: any): LiveJob => ({
      ...j,
      isDemo: false,
    })),
    source: data.source || 'Verified Live Jobs API',
    cached: Boolean(data.cached),
    retrievedAt: data.retrievedAt || new Date().toISOString(),
  };
}

/**
 * Optional provider status check to inform user of active configuration
 */
export async function fetchJobsProviderStatus(): Promise<{
  primaryProvider: string;
  hasAdzunaConfigured: boolean;
  hasRapidApiConfigured: boolean;
  mode: string;
}> {
  try {
    const res = await fetch('/api/jobs/status');
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    console.warn('Could not query jobs status:', e);
  }
  return {
    primaryProvider: 'Remotive & Arbeitnow Open Tech APIs',
    hasAdzunaConfigured: false,
    hasRapidApiConfigured: false,
    mode: 'live_data',
  };
}

/**
 * STRICT REQUIREMENT:
 * "If demo data is retained for development/testing, it must be clearly labeled:
 * 'Demo Opportunities — Not live job listings'
 * Demo data must never appear as live jobs to normal users."
 */
export const DEMO_TESTING_OPPORTUNITIES: LiveJob[] = [
  {
    id: 'demo-test-1',
    title: 'Software Development Engineer I (Test Sample)',
    company: 'Demo Tech Corp [TEST SAMPLE]',
    location: 'Bengaluru / Hyderabad (Demo)',
    workMode: 'Hybrid',
    jobType: 'Full-time',
    experienceLevel: 'Entry Level (0-1 yrs)',
    salary: '₹14,00,000 - ₹18,00,000 (Sample Range)',
    requiredSkills: ['Java', 'Data Structures', 'Spring Boot', 'SQL', 'Git'],
    descriptionSummary: 'This is a sample demonstration opportunity included solely for offline development and UI layout verification.',
    postedDate: '2026-03-01T10:00:00Z',
    source: 'Demo Opportunities — Not live job listings',
    applyUrl: '#demo-sample-not-live',
    retrievedAt: '2026-03-01T10:00:00Z',
    isDemo: true,
  },
  {
    id: 'demo-test-2',
    title: 'Frontend Engineer (React / TypeScript) [Test Sample]',
    company: 'Sample Cloud Solutions [TEST SAMPLE]',
    location: 'Remote (Demo)',
    workMode: 'Remote',
    jobType: 'Full-time',
    experienceLevel: 'Junior (1-2 yrs)',
    salary: '₹10,00,000 - ₹15,00,000 (Sample Range)',
    requiredSkills: ['React', 'TypeScript', 'Tailwind CSS', 'REST API', 'Git'],
    descriptionSummary: 'Sample UI demo job listing. Real job discovery queries the live external API.',
    postedDate: '2026-03-01T10:00:00Z',
    source: 'Demo Opportunities — Not live job listings',
    applyUrl: '#demo-sample-not-live',
    retrievedAt: '2026-03-01T10:00:00Z',
    isDemo: true,
  },
];
