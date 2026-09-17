import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Briefcase,
  Search,
  MapPin,
  Building2,
  Calendar,
  ExternalLink,
  RefreshCw,
  SlidersHorizontal,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  DollarSign,
  Globe2,
  Tag,
  ArrowUpDown,
  BookOpen,
  Info,
  X,
  ChevronRight,
  ShieldCheck,
  Check,
} from 'lucide-react';
import { StudentProfile, LiveJob, AuthUser } from '../types';
import { calculateJobMatch } from '../utils/jobMatchCalculator';
import {
  fetchLiveJobsFromApi,
  fetchJobsProviderStatus,
  DEMO_TESTING_OPPORTUNITIES,
} from '../utils/jobsClient';
import { NavTab } from './Navbar';
import { useLoading } from '../context/LoadingContext';
import {
  getCoursesForMissingSkills,
  LEARNING_PATH_STORAGE_KEY,
  calculateLearningProgressMetrics,
} from '../data/coursesDatabase';

interface JobsViewProps {
  profile: StudentProfile;
  currentUser?: AuthUser | null;
  assessmentSubmitted?: boolean;
  onNavigate: (tab: NavTab) => void;
  onLoadDemoProfile: () => void;
}

export const JobsView: React.FC<JobsViewProps> = ({
  profile,
  currentUser,
  assessmentSubmitted = false,
  onNavigate,
  onLoadDemoProfile,
}) => {
  // Data state
  const [jobs, setJobs] = useState<LiveJob[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [dataSource, setDataSource] = useState<string>('Live Jobs API');
  const [retrievedAt, setRetrievedAt] = useState<string | null>(null);
  const [isCached, setIsCached] = useState<boolean>(false);
  const [providerInfo, setProviderInfo] = useState<{
    primaryProvider: string;
    hasAdzunaConfigured: boolean;
    hasRapidApiConfigured: boolean;
  } | null>(null);

  // Testing mode toggle (strictly separated & labeled "Demo Opportunities — Not live job listings")
  const [testingMode, setTestingMode] = useState<boolean>(false);

  // Filter & Search states
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedWorkMode, setSelectedWorkMode] = useState<string>('All');
  const [selectedJobType, setSelectedJobType] = useState<string>('All');
  const [selectedExperience, setSelectedExperience] = useState<string>('All');
  const [selectedSkillFilter, setSelectedSkillFilter] = useState<string>('All');
  const [locationQuery, setLocationQuery] = useState<string>('');
  const [matchMySkillsOnly, setMatchMySkillsOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<'match' | 'recent' | 'company'>('match');

  // Selected job for full-screen / modal detail view
  const [selectedJobForModal, setSelectedJobForModal] = useState<LiveJob | null>(null);

  // Centralized Global Loading System
  const { startLoading, stopLoading } = useLoading();

  // Load provider status once
  useEffect(() => {
    fetchJobsProviderStatus().then((status) => setProviderInfo(status));
  }, []);

  // Cleanup loading state on unmount
  useEffect(() => {
    return () => {
      stopLoading('jobs-live-feed');
    };
  }, [stopLoading]);

  // Fetch live jobs
  const loadJobs = useCallback(
    async (refresh: boolean = false, query?: string, location?: string) => {
      setLoading(true);
      setError(null);
      const activeQuery = (query !== undefined ? query : searchTerm).trim();
      const activeLocation = (location !== undefined ? location : locationQuery).trim();

      startLoading('jobs-live-feed', {
        title: activeQuery
          ? `Searching jobs matching "${activeQuery}"...`
          : 'Retrieving Engineering Opportunities...',
        subtitle:
          'Querying live recruiter APIs, Adzuna feeds & evaluating skill match against your B.Tech profile',
      });

      if (testingMode) {
        // Testing mode explicitly active
        setJobs(DEMO_TESTING_OPPORTUNITIES);
        setDataSource('Demo Opportunities — Not live job listings');
        setRetrievedAt(new Date().toISOString());
        setIsCached(false);
        setLoading(false);
        stopLoading('jobs-live-feed');
        return;
      }

      try {
        const res = await fetchLiveJobsFromApi({
          query: activeQuery || undefined,
          location: activeLocation || undefined,
          refresh,
        });

        setJobs(res.jobs);
        setDataSource(res.source);
        setRetrievedAt(res.retrievedAt);
        setIsCached(res.cached);
      } catch (err: any) {
        console.error('Jobs fetch error:', err);
        // STRICT REQUIREMENT:
        // "If the jobs API fails: Show: 'Live job data is temporarily unavailable.' Provide a Retry button. Do NOT silently replace failed live data with fake jobs."
        setError(err?.message || 'Live job data is temporarily unavailable.');
        setJobs([]);
      } finally {
        setLoading(false);
        stopLoading('jobs-live-feed');
      }
    },
    [testingMode, startLoading, stopLoading]
  );

  // Initial load once on mount
  useEffect(() => {
    loadJobs(false);
  }, [loadJobs]);

  // Format retrieval time
  const formattedRetrieval = useMemo(() => {
    if (!retrievedAt) return 'Updated recently';
    try {
      const date = new Date(retrievedAt);
      const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      return `Last checked: Today at ${timeStr}`;
    } catch {
      return 'Updated recently';
    }
  }, [retrievedAt]);

  // Student skill list for filter pills
  const studentSkillNames = useMemo(() => {
    return (profile.skills || []).map((s) => s.name);
  }, [profile.skills]);

  // Filter and sort jobs
  const processedJobs = useMemo(() => {
    let list = [...jobs];

    // Filter by work mode
    if (selectedWorkMode !== 'All') {
      list = list.filter((j) => j.workMode.toLowerCase() === selectedWorkMode.toLowerCase());
    }

    // Filter by job type
    if (selectedJobType !== 'All') {
      list = list.filter((j) => (j.jobType || '').toLowerCase().includes(selectedJobType.toLowerCase()));
    }

    // Filter by experience
    if (selectedExperience !== 'All') {
      list = list.filter((j) => (j.experienceLevel || '').toLowerCase().includes(selectedExperience.toLowerCase()));
    }

    // Filter by specific technical skill
    if (selectedSkillFilter !== 'All') {
      const filterNorm = selectedSkillFilter.toLowerCase();
      list = list.filter((j) =>
        (j.requiredSkills || []).some((sk) => sk.toLowerCase().includes(filterNorm))
      );
    }

    // Filter by search term (in-memory client refinement)
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase().trim();
      list = list.filter((j) =>
        j.title.toLowerCase().includes(q) ||
        j.company.toLowerCase().includes(q) ||
        (j.location || '').toLowerCase().includes(q) ||
        (j.requiredSkills || []).some((s) => s.toLowerCase().includes(q))
      );
    }

    // Filter by location
    if (locationQuery.trim()) {
      const locQ = locationQuery.toLowerCase().trim();
      list = list.filter((j) => (j.location || '').toLowerCase().includes(locQ));
    }

    // Calculate match for every job against the CURRENT student's profile
    const evaluated = list.map((job) => {
      const match = calculateJobMatch(profile, job);
      return {
        job,
        match,
      };
    });

    // "Match My Skills Only" toggle
    let filteredEvaluated = evaluated;
    if (matchMySkillsOnly) {
      filteredEvaluated = evaluated.filter((item) => item.match.matchPercentage >= 50);
    }

    // Sorting
    filteredEvaluated.sort((a, b) => {
      if (sortBy === 'match') {
        return b.match.matchPercentage - a.match.matchPercentage;
      }
      if (sortBy === 'company') {
        return a.job.company.localeCompare(b.job.company);
      }
      if (sortBy === 'recent') {
        const dateA = new Date(a.job.postedDate).getTime() || 0;
        const dateB = new Date(b.job.postedDate).getTime() || 0;
        return dateB - dateA;
      }
      return 0;
    });

    return filteredEvaluated;
  }, [
    jobs,
    profile,
    selectedWorkMode,
    selectedJobType,
    selectedExperience,
    selectedSkillFilter,
    searchTerm,
    locationQuery,
    matchMySkillsOnly,
    sortBy,
  ]);

  // Format posted date
  const formatPostedDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      const diffMs = Date.now() - date.getTime();
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      if (diffDays <= 0) return 'Posted today';
      if (diffDays === 1) return 'Posted 1 day ago';
      if (diffDays < 30) return `Posted ${diffDays} days ago`;
      return `Posted on ${date.toLocaleDateString()}`;
    } catch {
      return 'Recently posted';
    }
  };

  const hasStudentSkills = profile.skills && profile.skills.length > 0;

  return (
    <div className="space-y-6">
      {/* Header & Source Transparency */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-6">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                <Globe2 className="w-3.5 h-3.5 text-indigo-600" />
                Live Job Discovery
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                {formattedRetrieval}
              </span>
              {isCached && (
                <span className="text-[11px] text-slate-400 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                  Cached for speed
                </span>
              )}
            </div>

            <h1 className="text-[21px] font-semibold text-slate-900 tracking-normal leading-[1.2]">
              Career Opportunities &amp; Jobs
            </h1>
            <p className="text-sm text-slate-600 max-w-3xl leading-relaxed">
              Explore career opportunities and job resources through CarrerAi.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {/* Refresh Button */}
            <button
              id="refresh-jobs-btn"
              onClick={() => loadJobs(true)}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
              title="Query jobs API for fresh postings"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-indigo-600' : 'text-slate-500'}`} />
              <span>{loading ? 'Refreshing...' : 'Refresh Listings'}</span>
            </button>

            {/* Testing / Demo Data Mode Toggle */}
            <div className="flex items-center gap-1.5 text-xs bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl">
              <span className="text-slate-600 font-medium">Mode:</span>
              <button
                type="button"
                onClick={() => {
                  setTestingMode(!testingMode);
                }}
                className={`px-2 py-0.5 rounded text-[11px] font-bold transition-colors cursor-pointer ${
                  testingMode
                    ? 'bg-amber-500 text-white'
                    : 'bg-indigo-600 text-white shadow-2xs'
                }`}
              >
                {testingMode ? 'Demo Testing Mode' : 'Live Data (Active)'}
              </button>
            </div>
          </div>
        </div>

        {/* Source & Transparency Banner */}
        <div className="mt-4 pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold text-slate-700">Source:</span>
            <span className="bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-md font-mono text-[11px] border border-slate-200">
              {dataSource}
            </span>
            {providerInfo?.hasAdzunaConfigured && (
              <span className="text-[11px] text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded">
                Adzuna Enabled
              </span>
            )}
          </div>

          <div className="flex items-center gap-1 text-slate-500 italic">
            <Info className="w-3.5 h-3.5 shrink-0 text-slate-400" />
            <span>CareerAI connects you directly to official postings. CareerAI is not the employer.</span>
          </div>
        </div>
      </div>

      {/* Prominent Demo Mode Warning (When explicitly toggled for development) */}
      {testingMode && (
        <div
          id="demo-mode-alert"
          className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold text-amber-900">
                Demo Opportunities — Not live job listings
              </h4>
              <p className="text-xs text-amber-800 mt-0.5 leading-relaxed">
                You are currently viewing offline demonstration sample data for development and testing. These are not real openings. To view real-world job postings, switch back to Live Data mode.
              </p>
            </div>
          </div>
          <button
            onClick={() => setTestingMode(false)}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shrink-0 cursor-pointer shadow-2xs"
          >
            Switch to Real Live Jobs
          </button>
        </div>
      )}

      {/* Personalized Student Context Bar */}
      <div className="bg-gradient-to-r from-indigo-50/70 via-white to-indigo-50/40 border border-indigo-100 rounded-2xl p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <h3 className="text-sm font-bold text-slate-900">
                {currentUser
                  ? `Personalized Matching for ${currentUser.name}`
                  : profile.name
                  ? `Personalized Matching for ${profile.name}`
                  : 'Personalized CareerAI Job Matching'}
              </h3>
            </div>
            <p className="text-xs text-slate-600">
              {hasStudentSkills ? (
                <>
                  Evaluating against your <strong>{profile.skills.length} technical skills</strong>
                  {profile.branch ? ` in ${profile.branch}` : ''} and{' '}
                  <strong>{profile.projects?.length || 0} engineering projects</strong>.
                </>
              ) : (
                <>
                  Your student profile currently has no recorded skills. Add your branch and skills to calculate your personalized <strong>CareerAI Match %</strong> on each listing.
                </>
              )}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {hasStudentSkills ? (
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 px-3 py-2 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors shadow-2xs">
                <input
                  type="checkbox"
                  checked={matchMySkillsOnly}
                  onChange={(e) => setMatchMySkillsOnly(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
                <span>High Match Only (&ge; 50%)</span>
              </label>
            ) : (
              <button
                onClick={() => onNavigate('profile')}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors cursor-pointer shadow-xs"
              >
                <span>Complete Student Assessment</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Search & Comprehensive Filters */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-xs">
        {/* Row 1: Search Queries */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {/* Keyword / Role / Title Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Job title, company, or keyword (e.g. React, Python)"
              className="w-full pl-9 pr-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all text-slate-900 placeholder:text-slate-400"
            />
          </div>

          {/* Location Search */}
          <div className="relative">
            <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={locationQuery}
              onChange={(e) => setLocationQuery(e.target.value)}
              placeholder="Location or Country (e.g. India, Remote, US)"
              className="w-full pl-9 pr-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all text-slate-900 placeholder:text-slate-400"
            />
          </div>

          {/* Sort By Selector */}
          <div className="relative">
            <ArrowUpDown className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full pl-9 pr-8 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all text-slate-900 cursor-pointer appearance-none"
            >
              <option value="match">Sort by: Highest CareerAI Match</option>
              <option value="recent">Sort by: Most Recent</option>
              <option value="company">Sort by: Company Name (A-Z)</option>
            </select>
          </div>
        </div>

        {/* Row 2: Secondary Dropdown Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3 pt-2 border-t border-slate-100">
          {/* Work Mode */}
          <div>
            <label className="text-[11px] font-semibold text-slate-500 block mb-1">Work Mode</label>
            <select
              value={selectedWorkMode}
              onChange={(e) => setSelectedWorkMode(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 text-slate-800 cursor-pointer"
            >
              <option value="All">All Modes</option>
              <option value="Remote">Remote</option>
              <option value="Hybrid">Hybrid</option>
              <option value="On-site">On-site</option>
            </select>
          </div>

          {/* Job Type */}
          <div>
            <label className="text-[11px] font-semibold text-slate-500 block mb-1">Job Type</label>
            <select
              value={selectedJobType}
              onChange={(e) => setSelectedJobType(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 text-slate-800 cursor-pointer"
            >
              <option value="All">All Types</option>
              <option value="Full-time">Full-time</option>
              <option value="Internship">Internship</option>
              <option value="Contract">Contract</option>
            </select>
          </div>

          {/* Experience Level */}
          <div>
            <label className="text-[11px] font-semibold text-slate-500 block mb-1">Experience Level</label>
            <select
              value={selectedExperience}
              onChange={(e) => setSelectedExperience(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 text-slate-800 cursor-pointer"
            >
              <option value="All">All Levels</option>
              <option value="Entry">Entry Level / Graduate</option>
              <option value="Junior">Junior (1-2 yrs)</option>
              <option value="Mid">Mid Level (2-5 yrs)</option>
              <option value="Senior">Senior (5+ yrs)</option>
            </select>
          </div>

          {/* Technical Skill Filter */}
          <div>
            <label className="text-[11px] font-semibold text-slate-500 block mb-1">Key Skill</label>
            <select
              value={selectedSkillFilter}
              onChange={(e) => setSelectedSkillFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 text-slate-800 cursor-pointer"
            >
              <option value="All">All Skills</option>
              <option value="Python">Python</option>
              <option value="Java">Java</option>
              <option value="React">React</option>
              <option value="TypeScript">TypeScript</option>
              <option value="Node">Node.js</option>
              <option value="SQL">SQL</option>
              <option value="Docker">Docker</option>
              <option value="AWS">AWS</option>
            </select>
          </div>
        </div>

        {/* Quick Skill Filter Pills based on Student Profile */}
        {studentSkillNames.length > 0 && (
          <div className="pt-2 flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 text-xs">
            <span className="text-slate-500 font-medium shrink-0 flex items-center gap-1">
              <Tag className="w-3 h-3 text-slate-400" />
              Your Skills:
            </span>
            {studentSkillNames.slice(0, 8).map((skillName) => {
              const isActive = selectedSkillFilter.toLowerCase() === skillName.toLowerCase();
              return (
                <button
                  key={skillName}
                  onClick={() => setSelectedSkillFilter(isActive ? 'All' : skillName)}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition-colors shrink-0 cursor-pointer border ${
                    isActive
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {skillName}
                </button>
              );
            })}
            {selectedSkillFilter !== 'All' && (
              <button
                onClick={() => setSelectedSkillFilter('All')}
                className="text-xs text-rose-600 hover:underline font-semibold shrink-0 cursor-pointer"
              >
                Clear skill filter
              </button>
            )}
          </div>
        )}
      </div>

      {/* Results Count & Active Filters Bar */}
      <div className="flex items-center justify-between text-xs text-slate-600 px-1">
        <span>
          Showing <strong>{processedJobs.length}</strong> real opportunities
          {searchTerm ? ` matching "${searchTerm}"` : ''}
        </span>
        {(searchTerm || locationQuery || selectedWorkMode !== 'All' || selectedJobType !== 'All' || selectedSkillFilter !== 'All') && (
          <button
            onClick={() => {
              setSearchTerm('');
              setLocationQuery('');
              setSelectedWorkMode('All');
              setSelectedJobType('All');
              setSelectedExperience('All');
              setSelectedSkillFilter('All');
            }}
            className="text-indigo-600 hover:underline font-bold cursor-pointer"
          >
            Reset all filters
          </button>
        )}
      </div>

      {/* Loading state is handled globally by the CareerAI Loading System */}

      {/* STRICT ERROR STATE (As required by rules) */}
      {!loading && error && (
        <div
          id="jobs-api-error-card"
          className="bg-rose-50/80 border-2 border-rose-300 rounded-2xl p-6 sm:p-8 text-center space-y-4 shadow-xs"
        >
          <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>

          <div className="space-y-1 max-w-md mx-auto">
            <h3 className="text-base sm:text-lg font-semibold text-rose-950">
              Live job data is temporarily unavailable.
            </h3>
            <p className="text-xs text-rose-800 leading-relaxed">
              We were unable to retrieve fresh listings from the external jobs API at this moment. CareerAI strictly refuses to silently inject fake or simulated job postings.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              id="retry-jobs-btn"
              onClick={() => loadJobs(true)}
              className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer shadow-xs"
            >
              Retry Live Jobs
            </button>
            <button
              onClick={() => setTestingMode(true)}
              className="px-4 py-2 bg-white hover:bg-rose-100 text-rose-900 border border-rose-300 rounded-xl text-xs font-semibold cursor-pointer"
            >
              View Labeled Demo Sample (Testing Mode)
            </button>
          </div>
        </div>
      )}

      {/* Empty State (when filters yield no results) */}
      {!loading && !error && processedJobs.length === 0 && (
        <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center space-y-3">
          <Briefcase className="w-8 h-8 text-slate-400 mx-auto" />
          <h4 className="text-sm font-bold text-slate-800">No matching job listings found</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try adjusting your search keywords, broadening your location, or clearing specific skill filters.
          </p>
          <button
            onClick={() => {
              setSearchTerm('');
              setLocationQuery('');
              setSelectedWorkMode('All');
              setSelectedJobType('All');
              setSelectedSkillFilter('All');
              setMatchMySkillsOnly(false);
            }}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            Clear All Filters
          </button>
        </div>
      )}

      {/* Real Jobs List */}
      {!loading && !error && processedJobs.length > 0 && (
        <div className="space-y-4">
          {processedJobs.map(({ job, match }) => {
            const hasSalary = Boolean(job.salary);

            return (
              <div
                key={job.id}
                id={`job-card-${job.id}`}
                className={`bg-white border rounded-2xl p-5 sm:p-6 transition-all hover:shadow-sm ${
                  job.isDemo
                    ? 'border-amber-300 bg-amber-50/30'
                    : match.matchPercentage >= 70
                    ? 'border-indigo-200 hover:border-indigo-300'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                {/* Demo Watermark Badge if testing data */}
                {job.isDemo && (
                  <div className="mb-3">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-amber-200 text-amber-900 border border-amber-300">
                      <AlertCircle className="w-3 h-3" />
                      Demo Opportunities — Not live job listings
                    </span>
                  </div>
                )}

                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-5">
                  {/* Left Column: Job Info */}
                  <div className="space-y-3 flex-1">
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-1.5">
                        <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-md border border-slate-200 flex items-center gap-1">
                          <Building2 className="w-3.5 h-3.5 text-slate-500" />
                          {job.company}
                        </span>

                        <span className="inline-flex items-center gap-1 text-xs text-slate-600 bg-slate-50 px-2.5 py-0.5 rounded-md border border-slate-200">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          {job.location}
                        </span>

                        <span
                          className={`text-xs px-2.5 py-0.5 rounded-md font-semibold border ${
                            job.workMode === 'Remote'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : job.workMode === 'Hybrid'
                              ? 'bg-blue-50 text-blue-800 border-blue-200'
                              : 'bg-slate-100 text-slate-700 border-slate-200'
                          }`}
                        >
                          {job.workMode}
                        </span>

                        {job.jobType && (
                          <span className="text-xs text-slate-600 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                            {job.jobType}
                          </span>
                        )}

                        {job.experienceLevel && (
                          <span className="text-xs text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                            {job.experienceLevel}
                          </span>
                        )}
                      </div>

                      <h3 className="text-base sm:text-lg font-semibold text-slate-900 tracking-normal leading-snug">
                        {job.title}
                      </h3>
                    </div>

                    {/* Salary (ONLY if returned by source, never invented) */}
                    {hasSalary && (
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-900 border border-emerald-200">
                        <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Salary: {job.salary}</span>
                      </div>
                    )}

                    {/* Description Summary */}
                    <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                      {job.descriptionSummary}
                    </p>

                    {/* Required Skills from the Job */}
                    {job.requiredSkills && job.requiredSkills.length > 0 && (
                      <div className="space-y-1.5 pt-1">
                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                          Skills Listed in Job:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {job.requiredSkills.map((skill) => {
                            const isMatched = match.matchingSkills.includes(skill);
                            return (
                              <span
                                key={skill}
                                className={`text-[11px] px-2 py-0.5 rounded-md font-medium border transition-colors ${
                                  isMatched
                                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200 font-bold'
                                    : 'bg-slate-50 text-slate-600 border-slate-200'
                                }`}
                              >
                                {isMatched && '✓ '}
                                {skill}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Footer attribution & date */}
                    <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-400 pt-2 border-t border-slate-100">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatPostedDate(job.postedDate)}
                      </span>
                      <span>•</span>
                      <span>Source: {job.source}</span>
                    </div>
                  </div>

                  {/* Right Column: CareerAI Match & Real Apply CTA */}
                  <div className="lg:w-72 shrink-0 bg-slate-50/80 border border-slate-200 rounded-xl p-4 space-y-3.5 flex flex-col justify-between">
                    {/* CareerAI Match Widget */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <Sparkles className="w-4 h-4 text-indigo-600" />
                          <span className="text-xs font-semibold text-slate-900 tracking-normal">
                            CareerAI Match
                          </span>
                        </div>
                        <span
                          className={`text-sm font-semibold px-2.5 py-0.5 rounded-full border ${
                            match.matchPercentage >= 75
                              ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                              : match.matchPercentage >= 50
                              ? 'bg-blue-100 text-blue-800 border-blue-200'
                              : match.matchPercentage >= 25
                              ? 'bg-amber-100 text-amber-800 border-amber-200'
                              : 'bg-slate-100 text-slate-600 border-slate-200'
                          }`}
                        >
                          {hasStudentSkills ? `${match.matchPercentage}%` : 'N/A'}
                        </span>
                      </div>

                      {/* Progress bar */}
                      {hasStudentSkills && (
                        <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all duration-500 rounded-full ${
                              match.matchPercentage >= 75
                                ? 'bg-emerald-600'
                                : match.matchPercentage >= 50
                                ? 'bg-indigo-600'
                                : 'bg-amber-500'
                            }`}
                            style={{ width: `${match.matchPercentage}%` }}
                          />
                        </div>
                      )}

                      <p className="text-[11px] text-slate-500 leading-tight">
                        {match.explanation}
                      </p>

                      {/* Matching Skills */}
                      {match.matchingSkills.length > 0 && (
                        <div className="pt-2 border-t border-slate-200/70 space-y-1">
                          <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
                            Matching skills ({match.matchingSkills.length}):
                          </span>
                          <div className="text-[11px] text-emerald-950 font-medium space-y-0.5">
                            {match.matchingSkills.slice(0, 3).map((ms) => (
                              <div key={ms} className="flex items-center gap-1">
                                <Check className="w-3 h-3 text-emerald-600 shrink-0" />
                                <span className="truncate">{ms}</span>
                              </div>
                            ))}
                            {match.matchingSkills.length > 3 && (
                              <span className="text-[10px] text-emerald-700 italic">
                                +{match.matchingSkills.length - 3} more matching
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Skills to improve & Gap-closing Courses */}
                      {match.missingSkills.length > 0 && (
                        <div className="pt-1.5 space-y-1.5">
                          <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block">
                            Skills you need ({match.missingSkills.length}):
                          </span>
                          <div className="text-[11px] text-slate-600 space-y-0.5">
                            {match.missingSkills.slice(0, 3).map((ms) => (
                              <div key={ms} className="flex items-center gap-1 text-amber-900">
                                <span className="text-amber-500 font-bold">✗</span>
                                <span className="truncate">{ms}</span>
                              </div>
                            ))}
                            {match.missingSkills.length > 3 && (
                              <span className="text-[10px] text-slate-400 italic">
                                +{match.missingSkills.length - 3} more
                              </span>
                            )}
                          </div>

                          {/* Quick Gap Closer Button */}
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedJobForModal(job);
                            }}
                            className="w-full mt-1 px-2 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg text-[10px] font-bold transition-colors text-left flex items-center justify-between cursor-pointer"
                          >
                            <span>Close gap with verified courses</span>
                            <ChevronRight className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="space-y-2 pt-2 border-t border-slate-200">
                      {/* Real Apply Button (Opens real external URL) */}
                      <a
                        id={`apply-btn-${job.id}`}
                        href={job.applyUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                      >
                        <span>Apply on {job.company}</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>

                      {/* Details modal trigger */}
                      <button
                        type="button"
                        onClick={() => setSelectedJobForModal(job)}
                        className="w-full text-center text-xs font-semibold text-slate-600 hover:text-slate-900 py-1 transition-colors cursor-pointer"
                      >
                        View Full Match &amp; Recommended Courses
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Detailed Job Modal */}
      {selectedJobForModal && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
          onClick={() => setSelectedJobForModal(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-6 shadow-xl relative my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                  {selectedJobForModal.company}
                </span>
                <h2 className="text-xl sm:text-2xl font-semibold text-slate-900 tracking-normal mt-0.5 leading-snug">
                  {selectedJobForModal.title}
                </h2>
                <div className="flex flex-wrap items-center gap-2 mt-2 text-xs text-slate-600">
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {selectedJobForModal.location}
                  </span>
                  <span>•</span>
                  <span>{selectedJobForModal.workMode}</span>
                  {selectedJobForModal.salary && (
                    <>
                      <span>•</span>
                      <span className="font-bold text-emerald-700">Salary: {selectedJobForModal.salary}</span>
                    </>
                  )}
                </div>
              </div>

              <button
                onClick={() => setSelectedJobForModal(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Required Skills */}
            {selectedJobForModal.requiredSkills && selectedJobForModal.requiredSkills.length > 0 && (
              <div>
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                  Required Technologies &amp; Skills:
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {selectedJobForModal.requiredSkills.map((sk) => (
                    <span
                      key={sk}
                      className="text-xs px-2.5 py-1 rounded-md bg-slate-100 text-slate-800 font-medium border border-slate-200"
                    >
                      {sk}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Skills Breakdown & Recommended Courses to Close Missing Skills */}
            {(() => {
              const modalJobEvaluation = calculateJobMatch(profile, selectedJobForModal);
              const missingJobCourses = getCoursesForMissingSkills(modalJobEvaluation.missingSkills);

              return (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 sm:p-5 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-indigo-600" />
                      <span className="text-sm font-semibold text-slate-900">CareerAI Match Evaluation</span>
                    </div>
                    <span className="text-sm font-semibold px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 border border-indigo-200">
                      Match: {modalJobEvaluation.matchPercentage}%
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* You have: */}
                    <div className="space-y-2">
                      <span className="text-xs font-bold text-emerald-800 flex items-center gap-1">
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        You have ({modalJobEvaluation.matchingSkills.length}):
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {modalJobEvaluation.matchingSkills.length > 0 ? (
                          modalJobEvaluation.matchingSkills.map((s) => (
                            <span key={s} className="text-xs px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold">
                              ✓ {s}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-slate-400 italic">No direct matching skills logged in profile.</span>
                        )}
                      </div>
                    </div>

                    {/* You need: */}
                    <div className="space-y-2">
                      <span className="text-xs font-bold text-amber-800 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                        You need ({modalJobEvaluation.missingSkills.length}):
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {modalJobEvaluation.missingSkills.length > 0 ? (
                          modalJobEvaluation.missingSkills.map((s) => (
                            <span key={s} className="text-xs px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200 font-semibold">
                              ✗ {s}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-emerald-600 font-semibold">✓ You meet all primary technical requirements!</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Recommended courses to close the gap */}
                  {missingJobCourses.length > 0 && (
                    <div className="pt-3 border-t border-slate-200 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                          <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                          Recommended courses to close the gap:
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedJobForModal(null);
                            onNavigate('courses' as NavTab);
                          }}
                          className="text-xs text-indigo-600 font-bold hover:underline cursor-pointer"
                        >
                          View all in Courses Hub →
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {missingJobCourses.map((c) => (
                          <div key={c.id} className="bg-white border border-slate-200 rounded-lg p-3 space-y-1.5 shadow-2xs">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                                {c.providerBadge}
                              </span>
                              <span className="text-[10px] text-slate-400 font-medium">
                                {c.duration}
                              </span>
                            </div>
                            <h5 className="text-xs font-bold text-slate-900 line-clamp-1">
                              {c.title}
                            </h5>
                            <p className="text-[11px] text-slate-500 line-clamp-1">
                              Closes: {c.skillsGained.slice(0, 2).join(', ')}
                            </p>
                            <div className="pt-1 flex items-center justify-between">
                              <span className="text-[10px] font-bold text-emerald-600">{c.costType}</span>
                              <a
                                href={c.officialUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                              >
                                <span>Start Course</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Description Body */}
            <div>
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                Official Job Description Summary:
              </h4>
              <div className="text-xs text-slate-700 leading-relaxed whitespace-pre-line bg-slate-50 p-4 rounded-xl border border-slate-200 font-sans max-h-80 overflow-y-auto">
                {selectedJobForModal.fullDescription || selectedJobForModal.descriptionSummary}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-100">
              <span className="text-xs text-slate-400">
                Source: {selectedJobForModal.source}
              </span>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={() => setSelectedJobForModal(null)}
                  className="w-full sm:w-auto px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl cursor-pointer"
                >
                  Close
                </button>
                <a
                  href={selectedJobForModal.applyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl cursor-pointer"
                >
                  <span>Apply Now</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
