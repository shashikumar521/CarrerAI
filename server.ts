import express from 'express';
import path from 'path';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import { getLiveJobs } from './src/services/jobsApiServer';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Google GenAI client lazily or with safety check
let genAIClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  if (!genAIClient) {
    genAIClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return genAIClient;
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'CareerAI API' });
});

// Real Live Jobs API Endpoint
app.get('/api/jobs', async (req, res) => {
  try {
    const { query, location, role, refresh } = req.query;
    const result = await getLiveJobs({
      query: typeof query === 'string' ? query : undefined,
      location: typeof location === 'string' ? location : undefined,
      role: typeof role === 'string' ? role : undefined,
      refresh: refresh === 'true',
    });

    return res.json({
      success: true,
      jobs: result.jobs,
      total: result.jobs.length,
      source: result.source,
      cached: result.cached,
      retrievedAt: result.retrievedAt,
    });
  } catch (error: any) {
    console.error('Live Jobs API Error:', error);
    // Explicitly return failure status as required by rules:
    // "Live job data is temporarily unavailable. Provide a Retry button. Do NOT silently replace failed live data with fake jobs."
    return res.status(503).json({
      success: false,
      error: 'Live job data is temporarily unavailable.',
      details: error?.message || 'External job board upstream failure',
      jobs: [],
    });
  }
});

// Jobs API Provider Status (never exposes raw secrets, only whether configured)
app.get('/api/jobs/status', (req, res) => {
  const hasAdzuna = Boolean(process.env.ADZUNA_APP_ID && process.env.ADZUNA_APP_KEY);
  const hasRapidApi = Boolean(process.env.RAPIDAPI_KEY);

  res.json({
    primaryProvider: hasAdzuna ? 'Adzuna' : 'Remotive & Arbeitnow Open Tech APIs',
    hasAdzunaConfigured: hasAdzuna,
    hasRapidApiConfigured: hasRapidApi,
    mode: 'live_data',
  });
});

// Explicit SEO routes for search engine crawlers
app.get('/robots.txt', (req, res) => {
  const robotsPath = path.join(process.cwd(), 'public', 'robots.txt');
  res.type('text/plain').sendFile(robotsPath);
});

app.get('/sitemap.xml', (req, res) => {
  const sitemapPath = path.join(process.cwd(), 'public', 'sitemap.xml');
  res.type('application/xml').sendFile(sitemapPath);
});

// AI Career Counselor endpoint
app.post('/api/gemini/counselor', async (req, res) => {
  try {
    const { prompt, studentProfile, conversationHistory } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const ai = getGenAI();

    // Prepare contextual background about the student
    const profileSummary = studentProfile
      ? `
Student Profile Context:
- Name: ${studentProfile.name || 'Not provided'}
- College: ${studentProfile.college || 'Not specified'}
- Branch: ${studentProfile.branch || 'Engineering / Not specified'}
- Year / Semester: ${studentProfile.year || 'Not specified'} (Sem ${studentProfile.semester || 'N/A'})
- CGPA: ${studentProfile.cgpa || 'Not provided'}
- 10th%: ${studentProfile.tenthPercent || 'N/A'}, 12th%: ${studentProfile.twelfthPercent || 'N/A'}
- Active Backlogs: ${studentProfile.activeBacklogs ?? 0}, Cleared: ${studentProfile.clearedBacklogs ?? 0}
- Skills: ${studentProfile.skills?.map((s: any) => `${s.name} (${s.level})`).join(', ') || 'None specified yet'}
- Projects: ${studentProfile.projects?.map((p: any) => `${p.title} [Stack: ${p.techStack}]`).join('; ') || 'No projects listed'}
- Internships: ${studentProfile.internships?.map((i: any) => `${i.role} at ${i.company}`).join('; ') || 'None'}
- Target Roles: ${studentProfile.targetRoles?.join(', ') || 'Open to tech roles'}
`
      : 'Student Profile: Empty (New student just getting started)';

    const systemInstruction = `You are "CareerAI Mentor", an empathetic, highly knowledgeable senior career advisor, placement mentor, and tech industry coach specializing in engineering and B.Tech students (particularly in the Indian college ecosystem: on-campus tier-1/tier-2/tier-3 placements, mass recruiters, product companies, startups, gate, off-campus hiring, internships, resume optimization, and backlog recovery strategies).

Always provide structured, actionable, and encouraging guidance:
1. Address the student's exact situation realistically (e.g. impact of backlogs, CGPA cutoffs, semester timeline).
2. Give clear, step-by-step milestones (e.g. Month 1, Month 2, what to build, what to solve).
3. Offer practical resource recommendations (LeetCode, Striver A2Z, free courses, standard books).
4. Use formatting (bullet points, bold text) for readability. Keep the tone inspiring and grounded.

${profileSummary}
`;

    if (!ai) {
      // Intelligent mock/fallback response if API key is not configured
      const fallbackResponse = generateLocalCounselorGuidance(prompt, studentProfile);
      return res.json({ response: fallbackResponse, source: 'offline_counselor' });
    }

    // Call Gemini 3.8 Flash model
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    const replyText = response.text || 'I could not generate a response. Please try asking again.';
    return res.json({ response: replyText, source: 'gemini-3.8-flash' });
  } catch (error: any) {
    console.error('Gemini Counselor error:', error);
    // Fallback gracefully so the UI never breaks
    const fallbackResponse = generateLocalCounselorGuidance(req.body.prompt, req.body.studentProfile);
    return res.json({
      response: fallbackResponse,
      source: 'offline_fallback',
      warning: error?.message || 'Server error, rendered expert offline response',
    });
  }
});

// Fallback counselor logic when offline or API key isn't active
function generateLocalCounselorGuidance(query: string, profile: any): string {
  const q = (query || '').toLowerCase();
  const cgpa = Number(profile?.cgpa) || 0;
  const backlogs = Number(profile?.activeBacklogs) || 0;
  const branch = profile?.branch || 'Engineering';

  if (q.includes('backlog') || backlogs > 0) {
    return `### Placement Strategy for Handling Backlogs:\n\n1. **Focus on Clearing First**: Campus placement eligibility rules for 70%+ of companies (especially Tier-1 product firms and MNCs like TCS Digital, Infosys, Cognizant) strictly require **0 active backlogs** at the time of joining or during registration.\n2. **Target Backlog-Lenient Recruiters**: Certain high-growth startups and off-campus tech roles evaluate your GitHub and coding skills regardless of backlogs.\n3. **Immediate Action Plan**:\n   - Dedicate 50% of your time to clear upcoming supplementary examinations.\n   - Build 2 standout full-stack projects showcasing real deployment and unit tests.\n   - Master Data Structures in C++ or Java to qualify for hiring coding rounds.`;
  }

  if (q.includes('cgpa') || q.includes('low score') || cgpa < 7.0) {
    return `### How to Overcome a Lower CGPA in Tech Hiring:\n\n1. **Open Source & Real Projects**: A live, working application deployed on Vercel/Render with clean GitHub code overrides an average GPA for 80% of startup recruiters.\n2. **Off-Campus Hackathons**: Participate in Smart India Hackathon, Unstop competitions, and Devfolio events. Winning or reaching finals grants direct interview shortlists.\n3. **Certifications & Problem Solving**: Reach 200+ solved problems on LeetCode/CodeChef. Clear certifications like AWS Cloud Practitioner or GitHub Foundations.\n4. **Target Role Alignment**: Optimize your resume specifically for ${profile?.targetRoles?.[0] || 'Full Stack or Frontend Development'}.`;
  }

  if (q.includes('resume') || q.includes('ats')) {
    return `### 5 High-Impact ATS Resume Tips for Engineering Students:\n\n1. **Single-Column Format**: ATS parsers frequently drop tables or double-column layouts. Use standard headings: Education, Technical Skills, Projects, Experience, Achievements.\n2. **Action Verb + Tech Stack + Metric**: Format project bullets as: *"Developed X using React and Node.js, improving page load speed by 35% and supporting 500+ active users."*\n3. **Include Live Links**: Ensure every major project includes both a GitHub repository link and a deployed live demo URL.\n4. **Skills Alignment**: Group skills by category (Languages, Web Tech, Databases, Developer Tools, Core CS).`;
  }

  return `### Career Guidance for ${branch} Students:\n\n1. **Foundation (Months 1-2)**: Master one object-oriented programming language (Java, C++, or Python) along with core Data Structures (Arrays, Strings, HashMaps, Trees).\n2. **Project Portfolio (Months 3-4)**: Build at least two non-trivial full-stack applications solving practical problems. Avoid clone apps; build unique tools or campus utilities.\n3. **Core CS Subjects**: Thoroughly prepare OS, DBMS (SQL queries), Computer Networks, and OOP concepts for technical interviews.\n4. **Mock Interviews & Daily Consistency**: Spend 45 minutes daily solving one problem and reviewing behavioral STAR-method interview scenarios.`;
}

// Start Server with Vite Middleware
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`CareerAI server listening at http://0.0.0.0:${PORT}`);
  });
}

startServer();
