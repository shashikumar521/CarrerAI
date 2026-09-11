import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  GraduationCap,
  Building2,
  GitBranch,
  Briefcase,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  FolderGit2,
  Code2,
  FileText,
  Bot,
  Award,
  Sparkles,
  Rocket,
  Lock,
  ChevronRight,
  Star,
  Zap,
  Target,
  ShieldCheck,
  Compass,
  Check,
  ExternalLink,
  Layers,
  X,
  BookOpen,
  Plus,
  Terminal,
  BarChart3,
  Database,
  Cpu,
  Cloud,
  MapPin,
  Calendar,
  DollarSign,
  CheckCheck,
  User,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  StudentProfile,
  PlacementReadinessReport,
  EligibilityResult,
  AuthUser,
  UserLearningPathItem,
  LiveJob,
} from '../types';
import { NavTab } from './Navbar';
import { TARGET_ROLE_DEFINITIONS } from '../data/mockDatabase';
import { CompanyWatermarkLogo } from './CompanyWatermarkLogo';
import {
  calculateAllSkillCompetencies,
  getUserLearningPath,
  updateCourseProgress,
  enrollInCourse,
  COURSE_PROGRESS_UPDATED_EVENT,
  SkillProgressCardData,
  CORE_TECHNICAL_COMPETENCIES,
} from '../utils/courseSkillService';
import { calculateJobMatch } from '../utils/jobMatchCalculator';
import {
  fetchLiveJobsFromApi,
  DEMO_TESTING_OPPORTUNITIES,
} from '../utils/jobsClient';
import { FloatingRocket } from './FloatingRocket';

interface DashboardViewProps {
  profile: StudentProfile;
  report: PlacementReadinessReport;
  isProfileEmpty: boolean;
  eligibilityResults: EligibilityResult[];
  onNavigate: (tab: NavTab) => void;
  onLoadDemo: () => void;
  currentUser?: AuthUser | null;
  assessmentSubmitted?: boolean;
}

/**
 * Trigger tasteful, subtle confetti celebrating readiness calculation
 */
const triggerPlacementCelebration = () => {
  if (typeof window === 'undefined') return;
  try {
    confetti({
      particleCount: 50,
      spread: 55,
      origin: { y: 0.65 },
      colors: ['#4F46E5', '#10B981', '#06B6D4', '#F59E0B', '#6366F1'],
      disableForReducedMotion: true,
    });
  } catch (e) {
    console.warn('Confetti notice:', e);
  }
};

/**
 * Smooth Animated Number Counter component with reduced-motion respect
 */
const AnimatedNumber: React.FC<{ value: number; duration?: number; suffix?: string }> = ({
  value,
  duration = 900,
  suffix = '',
}) => {
  const [displayVal, setDisplayVal] = useState(0);
  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  useEffect(() => {
    if (prefersReducedMotion || value === 0) {
      setDisplayVal(value);
      return;
    }
    const startTime = performance.now();
    let animId: number;

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic curve
      const ease = 1 - Math.pow(1 - progress, 3);
      setDisplayVal(Math.round(ease * value));

      if (progress < 1) {
        animId = requestAnimationFrame(tick);
      } else {
        setDisplayVal(value);
      }
    };

    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, [value, duration, prefersReducedMotion]);

  return (
    <span>
      {displayVal}
      {suffix}
    </span>
  );
};

/**
 * Skill Icon resolver for visual skill cards
 */
const getSkillIcon = (name: string) => {
  const n = name.toLowerCase();
  if (n.includes('python')) return <Terminal className="w-4 h-4 text-indigo-600" />;
  if (n.includes('pandas')) return <Layers className="w-4 h-4 text-indigo-600" />;
  if (n.includes('sql') || n.includes('dbms') || n.includes('database')) {
    return <Database className="w-4 h-4 text-indigo-600" />;
  }
  if (n.includes('data analysis') || n.includes('analytics')) {
    return <BarChart3 className="w-4 h-4 text-indigo-600" />;
  }
  if (n.includes('system design') || n.includes('architecture')) {
    return <Cpu className="w-4 h-4 text-indigo-600" />;
  }
  if (n.includes('cloud') || n.includes('devops')) {
    return <Cloud className="w-4 h-4 text-indigo-600" />;
  }
  return <Code2 className="w-4 h-4 text-indigo-600" />;
};

// Motion animation variants for clean scroll reveal
const sectionAnimationVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
};

const cardStaggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.07,
    },
  },
};

const cardItemAnimation = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: 'easeOut' },
  },
};

export const DashboardView: React.FC<DashboardViewProps> = ({
  profile,
  report,
  isProfileEmpty,
  eligibilityResults,
  onNavigate,
  onLoadDemo,
  currentUser,
  assessmentSubmitted = false,
}) => {
  const isAssessed = !isProfileEmpty && assessmentSubmitted;

  // Filter eligibility
  const eligibleCount = isAssessed
    ? eligibilityResults.filter((r) => r.status === 'eligible').length
    : 0;
  const borderlineCount = isAssessed
    ? eligibilityResults.filter((r) => r.status === 'borderline').length
    : 0;
  const ineligibleCount = isAssessed
    ? eligibilityResults.filter((r) => r.status === 'ineligible').length
    : 0;

  const cgpaValue = Number(profile.cgpa) || 0;
  const backlogsCount = Number(profile.activeBacklogs) || 0;

  // Animated score counter for readiness score
  const [animatedScore, setAnimatedScore] = useState<number>(0);
  const [scoreAnimationFinished, setScoreAnimationFinished] = useState<boolean>(false);
  const celebrationFiredRef = useRef<boolean>(false);

  useEffect(() => {
    if (!isAssessed || report.overallScore === 0) {
      setAnimatedScore(0);
      setScoreAnimationFinished(false);
      return;
    }

    const targetScore = Math.min(100, Math.max(0, report.overallScore));
    const duration = 1200; // ms
    const startTime = performance.now();

    const animateCount = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const currentVal = Math.round(easeProgress * targetScore);
      setAnimatedScore(currentVal);

      if (progress < 1) {
        requestAnimationFrame(animateCount);
      } else {
        setScoreAnimationFinished(true);
        if (!celebrationFiredRef.current && targetScore >= 60) {
          celebrationFiredRef.current = true;
          triggerPlacementCelebration();
        }
      }
    };

    const animId = requestAnimationFrame(animateCount);
    return () => cancelAnimationFrame(animId);
  }, [isAssessed, report.overallScore]);

  // Dynamic Level & Career XP Calculation
  const { currentLevel, currentXp, maxXp, xpProgressPercent } = useMemo(() => {
    if (!isAssessed) {
      return { currentLevel: 1, currentXp: 0, maxXp: 1000, xpProgressPercent: 0 };
    }
    const scoreComponent = report.overallScore * 28;
    const skillsComponent = (profile.skills?.length || 0) * 65;
    const projectsComponent = (profile.projects?.length || 0) * 120;
    const certsComponent = (profile.certifications?.length || 0) * 90;
    const totalXp = scoreComponent + skillsComponent + projectsComponent + certsComponent;

    const computedLevel = Math.max(1, Math.min(25, Math.floor(totalXp / 250) + 1));
    const nextLevelTarget = computedLevel * 250;
    const previousLevelFloor = (computedLevel - 1) * 250;
    const levelRange = nextLevelTarget - previousLevelFloor;
    const xpInLevel = Math.max(0, totalXp - previousLevelFloor);
    const progressPercent = Math.min(100, Math.round((xpInLevel / levelRange) * 100));

    return {
      currentLevel: computedLevel,
      currentXp: totalXp,
      maxXp: nextLevelTarget,
      xpProgressPercent: progressPercent,
    };
  }, [isAssessed, report.overallScore, profile.skills, profile.projects, profile.certifications]);

  // Active learning path items & modal state
  const [learningPath, setLearningPath] = useState<UserLearningPathItem[]>(getUserLearningPath);
  const [selectedSkillForModal, setSelectedSkillForModal] = useState<SkillProgressCardData | null>(null);

  useEffect(() => {
    const handleUpdate = () => {
      setLearningPath(getUserLearningPath());
    };

    window.addEventListener(COURSE_PROGRESS_UPDATED_EVENT, handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener(COURSE_PROGRESS_UPDATED_EVENT, handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  useEffect(() => {
    if (selectedSkillForModal) {
      const updatedCards = calculateAllSkillCompetencies(learningPath, profile.skills);
      const matched = updatedCards.find((c) => c.name === selectedSkillForModal.name);
      if (matched) {
        setSelectedSkillForModal(matched);
      }
    }
  }, [learningPath, profile.skills]);

  // Visual Skill Cards: Dynamic calculation from user's active courses
  const skillCards = useMemo(() => {
    return calculateAllSkillCompetencies(learningPath, profile.skills);
  }, [learningPath, profile.skills]);

  // Top company eligibility previews for locked view
  const lockedCompanyPreviews = useMemo(() => {
    return [
      { id: 'goog', name: 'Google', tier: 'Tier 1 Product', ctc: '₹32 - 45 LPA', logo: 'GOOG', minCgpa: 8.0 },
      { id: 'msft', name: 'Microsoft', tier: 'Tier 1 Product', ctc: '₹28 - 42 LPA', logo: 'MSFT', minCgpa: 7.5 },
      { id: 'amzn', name: 'Amazon', tier: 'Tier 1 Product', ctc: '₹28 - 44 LPA', logo: 'AMZN', minCgpa: 7.0 },
      { id: 'cscco', name: 'Cisco', tier: 'Tier 1 Product', ctc: '₹18 - 28 LPA', logo: 'CSCO', minCgpa: 7.0 },
      { id: 'orcl', name: 'Oracle', tier: 'Tier 1 Product', ctc: '₹16 - 24 LPA', logo: 'ORCL', minCgpa: 7.0 },
      { id: 'gs', name: 'Goldman Sachs', tier: 'Tier 1 FinTech', ctc: '₹24 - 36 LPA', logo: 'GS', minCgpa: 7.5 },
      { id: 'tcs', name: 'TCS Digital', tier: 'High-Growth Tech', ctc: '₹7.5 - 11 LPA', logo: 'TCS', minCgpa: 7.0 },
      { id: 'infy', name: 'Infosys SP', tier: 'High-Growth Tech', ctc: '₹8 - 9.5 LPA', logo: 'INFY', minCgpa: 6.8 },
    ];
  }, []);

  // Section 6: Recommended Live Jobs
  const [recommendedJobs, setRecommendedJobs] = useState<LiveJob[]>([]);
  const [jobsLoading, setJobsLoading] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    async function loadJobs() {
      setJobsLoading(true);
      try {
        const res = await fetchLiveJobsFromApi({
          role: profile.targetRoles?.[0] || 'Software Engineer',
        });
        if (isMounted && res.jobs && res.jobs.length > 0) {
          setRecommendedJobs(res.jobs.slice(0, 4));
        } else if (isMounted) {
          setRecommendedJobs(DEMO_TESTING_OPPORTUNITIES.slice(0, 4));
        }
      } catch {
        if (isMounted) {
          setRecommendedJobs(DEMO_TESTING_OPPORTUNITIES.slice(0, 4));
        }
      } finally {
        if (isMounted) setJobsLoading(false);
      }
    }
    loadJobs();
    return () => {
      isMounted = false;
    };
  }, [profile.targetRoles]);

  // SVG Circular Meter Calculations
  const radius = 72;
  const circumference = 2 * Math.PI * radius; // ~452.39
  const strokeDashoffset = isAssessed
    ? circumference - (animatedScore / 100) * circumference
    : circumference;

  // Computed Skill Status Highlights for clean indicators
  const skillStatusHighlights = useMemo(() => {
    return skillCards.slice(0, 4).map((s) => {
      let status: 'Strong' | 'Developing' | 'Needs improvement' = 'Needs improvement';
      if (s.percent >= 70) {
        status = 'Strong';
      } else if (s.percent >= 35) {
        status = 'Developing';
      } else {
        status = 'Needs improvement';
      }
      return {
        ...s,
        status,
      };
    });
  }, [skillCards]);

  // Resolved display name for personalized login greeting
  const greetingDisplayName = useMemo(() => {
    const raw = currentUser?.name?.trim() || profile.name?.trim() || '';
    if (!raw || raw.includes('@')) {
      return null;
    }
    const tokens = raw.split(/\s+/).filter(Boolean);
    if (tokens.length === 0) return null;
    // Prefer "Shashi" if present in tokens (as in demo profile or user example)
    const preferred = tokens.find((t) => t.toLowerCase() === 'shashi');
    if (preferred) {
      return 'Shashi';
    }
    const first = tokens[0];
    return first.charAt(0).toUpperCase() + first.slice(1);
  }, [currentUser?.name, profile.name]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
      className="space-y-8 sm:space-y-10 text-slate-900 selection:bg-indigo-500 selection:text-white"
    >
      {/* ========================================================================= */}
      {/* 1. WELCOME SECTION (Clean, Compact, Subtle Fade + Slide-up + Rocket)     */}
      {/* ========================================================================= */}
      <motion.section
        id="section-welcome"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="relative overflow-hidden rounded-2xl bg-white border border-slate-200 shadow-2xs p-5 sm:p-6"
      >
        {/* Restored Subtle Floating Animated CareerAI Rocket in the Welcome / Hero Background */}
        <div
          aria-hidden="true"
          className="absolute -top-1 right-2 sm:top-1 sm:right-6 md:right-8 lg:right-12 pointer-events-none select-none z-0 opacity-80 sm:opacity-90 transition-opacity"
        >
          <FloatingRocket />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div
              className="relative shrink-0 group cursor-pointer"
              onClick={() => onNavigate('dashboard')}
            >
              <img
                src="/careerai-logo.png"
                alt="CareerAI Logo"
                className="w-12 h-12 rounded-xl object-contain border border-slate-200/80 shadow-2xs bg-white p-0.5 transition-transform duration-300 group-hover:scale-105"
                referrerPolicy="no-referrer"
              />
            </div>

            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-indigo-600" />
                  <span>AI Placement Intelligence</span>
                </span>
                <span className="text-[11px] text-slate-500 font-medium hidden sm:flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>30+ Recruiters Calibrated</span>
                </span>
              </div>

              {/* Personalized Login Greeting with Friendly Waving Animation */}
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: 'easeOut', delay: 0.1 }}
              >
                <h1 className="text-[21px] font-semibold text-slate-900 tracking-normal leading-[1.2] flex items-center gap-2">
                  <span>CareerAI – AI-Powered Career &amp; Placement Platform</span>
                  <motion.span
                    initial={{ rotate: 0 }}
                    animate={{ rotate: [0, 14, -10, 14, -6, 10, 0] }}
                    transition={{ duration: 0.75, ease: 'easeInOut', delay: 0.2 }}
                    className="inline-block origin-bottom-right select-none"
                    aria-hidden="true"
                  >
                    👋
                  </motion.span>
                </h1>
                <p className="text-sm sm:text-base text-slate-600 font-normal mt-1 leading-relaxed">
                  {greetingDisplayName ? `Welcome, ${greetingDisplayName}! ` : ''}CareerAI is an AI-powered career and placement platform designed to help students track their skills, discover relevant jobs, identify skill gaps, find learning opportunities, and improve their career readiness.
                </p>
              </motion.div>
            </div>
          </div>

          {/* Compact Actions */}
          <div className="flex items-center gap-2.5 shrink-0 self-start md:self-auto">
            {!isAssessed ? (
              <>
                <button
                  type="button"
                  id="welcome-enter-profile-btn"
                  onClick={() => onNavigate('profile')}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all hover:scale-102 active:scale-98 flex items-center gap-1.5 cursor-pointer"
                >
                  <Rocket className="w-3.5 h-3.5" />
                  <span>Enter Profile</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  id="welcome-load-demo-btn"
                  onClick={onLoadDemo}
                  className="px-3.5 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-300 font-semibold text-xs rounded-xl transition-all hover:scale-102 flex items-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Load Demo Data</span>
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => onNavigate('profile')}
                  className="px-3.5 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-300 font-semibold text-xs rounded-xl transition-all hover:scale-102 flex items-center gap-1.5 cursor-pointer"
                >
                  <User className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Edit Profile</span>
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate('jobs')}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all hover:scale-102 flex items-center gap-1.5 cursor-pointer"
                >
                  <Briefcase className="w-3.5 h-3.5" />
                  <span>Live Jobs</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </>
            )}
          </div>
        </div>
      </motion.section>

      {/* ========================================================================= */}
      {/* 2. CAREER READINESS & OVERVIEW STATS (2-3 Clean Card Layout)             */}
      {/* ========================================================================= */}
      <motion.section
        id="section-career-overview-cards"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-40px' }}
        variants={sectionAnimationVariants}
        className="space-y-4"
      >
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
            <Target className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-semibold text-slate-900 tracking-tight">
              Placement Readiness &amp; Performance Overview
            </h2>
            <p className="text-xs text-slate-500">
              Dimensional diagnostic combining engineering cutoffs, verified technical skill mastery, and live projects.
            </p>
          </div>
        </div>

        {/* 3 Overview Cards Layout with Consistent SaaS Dimensions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-stretch">
          {/* Card 1: Career Readiness with Circular Meter & Finish Glow */}
          <div className="bg-white border border-slate-200 hover:border-indigo-300 rounded-2xl p-5 shadow-2xs hover:shadow-xs transition-all duration-200 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Career Readiness</span>
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                    !isAssessed
                      ? 'bg-slate-100 text-slate-600 border-slate-200'
                      : report.grade === 'Placement Ready'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : report.grade === 'Near Ready'
                      ? 'bg-blue-50 text-blue-700 border-blue-200'
                      : 'bg-amber-50 text-amber-700 border-amber-200'
                  }`}
                >
                  {isAssessed ? report.grade : 'Discovery Mode'}
                </span>
              </div>

              {/* Center Circular Progress Meter with subtle hover glow and slight scale */}
              <div className="flex flex-col items-center justify-center my-2">
                <div className="relative w-36 h-36 flex items-center justify-center group/score cursor-pointer transition-transform duration-300 hover:scale-[1.03]">
                  {scoreAnimationFinished && isAssessed && (
                    <div className="absolute inset-1 rounded-full border border-indigo-400/30 animate-pulse pointer-events-none" />
                  )}

                  <svg className="w-full h-full transform -rotate-90 transition-all duration-300 group-hover/score:drop-shadow-[0_0_10px_rgba(79,70,229,0.35)]" viewBox="0 0 180 180">
                    <defs>
                      <linearGradient id="scoreIndigoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#4F46E5" />
                        <stop offset="100%" stopColor="#06B6D4" />
                      </linearGradient>
                      <filter id="indigoGlow" x="-20%" y="-20%" width="140%" height="140%">
                        <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#4F46E5" floodOpacity="0.3" />
                      </filter>
                    </defs>

                    {/* Track */}
                    <circle
                      cx="90"
                      cy="90"
                      r={radius}
                      stroke="currentColor"
                      strokeWidth="12"
                      className="text-slate-100 fill-transparent"
                    />

                    {/* Animated Progress Arc */}
                    <circle
                      cx="90"
                      cy="90"
                      r={radius}
                      stroke="url(#scoreIndigoGradient)"
                      strokeWidth="12"
                      strokeLinecap="round"
                      strokeDasharray={circumference}
                      strokeDashoffset={strokeDashoffset}
                      className="fill-transparent transition-all duration-1000 ease-out"
                      filter="url(#indigoGlow)"
                    />
                  </svg>

                  {/* Centered Score Counter with hover scale and subtle glow */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center transition-all duration-300 group-hover/score:scale-105 group-hover/score:drop-shadow-[0_0_8px_rgba(99,102,241,0.25)]">
                    <div className="flex items-baseline">
                      <span className="text-4xl font-semibold text-slate-900 tracking-normal transition-colors duration-200 group-hover/score:text-indigo-600">
                        {isAssessed ? animatedScore : '—'}
                      </span>
                      {isAssessed && <span className="text-base font-semibold text-indigo-600 ml-0.5">%</span>}
                    </div>
                    <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">
                      {isAssessed ? 'Ready Index' : 'Pending'}
                    </span>
                  </div>
                </div>

                <p className="text-[11px] text-slate-500 text-center mt-1 leading-snug">
                  {isAssessed
                    ? `Evaluated across CGPA (${cgpaValue.toFixed(2)}), ${backlogsCount} backlog(s), and ${profile.skills?.length || 0} skills.`
                    : 'Submit your student assessment to generate your personalized placement index.'}
                </p>
              </div>
            </div>

            {/* Dimensional Sub-scores Mini Progress */}
            <div className="pt-3 border-t border-slate-100 space-y-1.5">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-500 font-medium">Academics</span>
                <span className="font-bold text-slate-800">{isAssessed ? `${report.academicScore}/25` : '—'}</span>
              </div>
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-600 rounded-full" style={{ width: `${isAssessed ? (report.academicScore / 25) * 100 : 0}%` }} />
              </div>

              <div className="flex items-center justify-between text-[11px] pt-0.5">
                <span className="text-slate-500 font-medium">Technical Depth</span>
                <span className="font-bold text-slate-800">{isAssessed ? `${report.skillsScore}/30` : '—'}</span>
              </div>
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${isAssessed ? (report.skillsScore / 30) * 100 : 0}%` }} />
              </div>
            </div>
          </div>

          {/* Card 2: Career XP / Milestone Level */}
          <div className="bg-white border border-slate-200 hover:border-indigo-300 rounded-2xl p-5 shadow-2xs hover:shadow-xs transition-all duration-200 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Milestone Level &amp; XP</span>
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 uppercase">
                  Level {isAssessed ? currentLevel : 1}
                </span>
              </div>

              <div className="space-y-3 my-2">
                <div className="flex items-baseline justify-between">
                  <div>
                    <span className="text-2xl font-semibold text-slate-900 tracking-tight">
                      {isAssessed ? currentXp.toLocaleString() : '0'}
                    </span>
                    <span className="text-xs text-slate-400 font-semibold ml-1">/ {maxXp.toLocaleString()} XP</span>
                  </div>
                  <span className="text-xs font-bold text-indigo-600">
                    {isAssessed ? `${xpProgressPercent}%` : '0%'}
                  </span>
                </div>

                <div className="w-full h-2 rounded-full bg-slate-100 border border-slate-200 overflow-hidden">
                  <div
                    className="h-full bg-indigo-600 rounded-full transition-all duration-700"
                    style={{ width: `${isAssessed ? xpProgressPercent : 0}%` }}
                  />
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{isAssessed ? 'Engineering Milestone Track' : 'Unranked Candidate'}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    {isAssessed
                      ? `${maxXp - currentXp} XP required to advance to Level ${currentLevel + 1} Senior Candidate.`
                      : 'Enroll and complete verified learning courses to earn career progression XP.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Milestone Progress Points */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">Rank Benchmark</span>
              <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 text-[10px]">
                {isAssessed ? 'Top 15% Candidate' : 'Benchmark Pending'}
              </span>
            </div>
          </div>

          {/* Card 3: Academic & Profile Health */}
          <div className="bg-white border border-slate-200 hover:border-indigo-300 rounded-2xl p-5 shadow-2xs hover:shadow-xs transition-all duration-200 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <GraduationCap className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Academic Diagnostics</span>
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                  {isAssessed && profile.branch ? profile.branch : 'CSE/IT'}
                </span>
              </div>

              {/* 4 Clean Metric Rows */}
              <div className="grid grid-cols-2 gap-2.5 my-2">
                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">B.Tech CGPA</span>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span className="text-xl font-semibold text-slate-900">
                      {isAssessed && profile.cgpa ? Number(profile.cgpa).toFixed(2) : '—'}
                    </span>
                    <span className="text-[10px] text-slate-400 font-semibold">/ 10</span>
                  </div>
                </div>

                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Backlogs</span>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span
                      className={`text-xl font-semibold ${
                        isAssessed && backlogsCount > 0 ? 'text-rose-600' : 'text-slate-900'
                      }`}
                    >
                      {isAssessed ? backlogsCount : '—'}
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium">
                      {isAssessed ? (backlogsCount === 0 ? 'Clean' : 'Active') : 'Pending'}
                    </span>
                  </div>
                </div>

                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Skills Depth</span>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span className="text-xl font-semibold text-slate-900">
                      {isAssessed ? profile.skills?.length || 0 : '—'}
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium">Skills</span>
                  </div>
                </div>

                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Projects</span>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span className="text-xl font-semibold text-slate-900">
                      {isAssessed ? profile.projects?.length || 0 : '—'}
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium">Live</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Profile Action Link */}
            <div className="pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => onNavigate('profile')}
                className="w-full py-1.5 px-3 rounded-xl bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 text-xs font-bold text-slate-700 hover:text-indigo-600 transition-all flex items-center justify-between cursor-pointer"
              >
                <span>View Full Academic Profile</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </motion.section>

      {/* ========================================================================= */}
      {/* 3. TECHNICAL SKILL COMPETENCIES & PROGRESS SECTION */}
      {/* ========================================================================= */}
      <motion.section
        id="section-technical-skills"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-40px' }}
        variants={sectionAnimationVariants}
        className="space-y-4"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
              <Code2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-semibold text-slate-900 tracking-tight">
                Technical Skill Competencies &amp; Progress
              </h2>
              <p className="text-xs text-slate-500">
                Live progress calculated dynamically from active learning courses and practical milestones.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onNavigate('courses')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 font-bold text-xs rounded-xl transition-all cursor-pointer self-start sm:self-auto hover:-translate-y-0.5"
          >
            <Award className="w-3.5 h-3.5" />
            <span>Close Gap via Verified Certs</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Skill Cards Grid with Staggered Entrance */}
        <motion.div
          variants={cardStaggerContainer}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {skillCards.map((skill) => (
            <motion.div
              key={skill.id}
              variants={cardItemAnimation}
              onClick={() => setSelectedSkillForModal(skill)}
              className="bg-white border border-slate-200 hover:border-indigo-300 rounded-xl p-4 space-y-2.5 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:shadow-md group cursor-pointer"
              title="Click to view course details and update progress"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-slate-50 border border-slate-200 group-hover:bg-indigo-50 group-hover:border-indigo-200 transition-colors">
                    {getSkillIcon(skill.name)}
                  </div>
                  <span className="text-xs font-semibold text-slate-800 tracking-wide group-hover:text-indigo-600 transition-colors">
                    {skill.name}
                  </span>
                </div>

                {skill.hasActiveCourse ? (
                  <span className="text-xs font-semibold text-indigo-600 flex items-center gap-0.5">
                    <AnimatedNumber value={skill.percent} duration={800} suffix="%" />
                  </span>
                ) : (
                  <span className="text-xs font-semibold text-slate-400">
                    No active course
                  </span>
                )}
              </div>

              {/* Progress Bar */}
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                <div
                  className="h-full bg-indigo-600 rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${skill.hasActiveCourse ? skill.percent : 0}%` }}
                />
              </div>

              <div className="flex items-center justify-between pt-1 text-[11px]">
                <span className="text-slate-500 font-medium">{skill.category}</span>
                <span className="px-2 py-0.5 rounded-md font-bold text-[10px] bg-slate-100 text-slate-700 border border-slate-200 group-hover:bg-indigo-50 group-hover:text-indigo-700 group-hover:border-indigo-200 transition-colors">
                  {skill.level}
                </span>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </motion.section>

      {/* ========================================================================= */}
      {/* 4. PLACEMENT ELIGIBILITY SECTION */}
      {/* ========================================================================= */}
      <motion.section
        id="section-placement-eligibility"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-40px' }}
        variants={sectionAnimationVariants}
        className="space-y-4"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-semibold text-slate-900 tracking-tight">
                Campus Placement Eligibility Radar
              </h2>
              <p className="text-xs text-slate-500">
                Screened against cutoffs for 30+ top Product, High-Growth, and Mass recruiters.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onNavigate('eligibility')}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-700 transition-colors cursor-pointer self-start sm:self-auto hover:-translate-y-0.5"
          >
            <span>View All 30 Recruiters</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-5">
          {!isAssessed ? (
            /* Locked Company Matrix when Unassessed */
            <div className="space-y-4">
              <div className="relative overflow-hidden rounded-xl bg-slate-50 border border-slate-200 p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3.5 text-left">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center shrink-0">
                    <Lock className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">
                      Complete your profile to unlock placement eligibility.
                    </h4>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Cutoff screening across Google, Microsoft, Amazon, Cisco, TCS, and 25+ more requires your verified academic data.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onNavigate('profile')}
                  className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs shrink-0 transition-all hover:-translate-y-0.5 cursor-pointer"
                >
                  Unlock Matrix
                </button>
              </div>

              {/* Locked Preview Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {lockedCompanyPreviews.map((comp) => (
                  <div
                    key={comp.id}
                    className="group relative overflow-hidden bg-white border border-slate-200 rounded-xl p-3 text-center transition-all hover:border-indigo-300 hover:-translate-y-0.5"
                  >
                    <div
                      aria-hidden="true"
                      className="absolute -right-2 sm:-right-1 top-1/2 -translate-y-1/2 w-20 h-20 sm:w-24 sm:h-24 pointer-events-none z-0 flex items-center justify-center select-none"
                    >
                      <CompanyWatermarkLogo id={comp.id} name={comp.name} />
                    </div>

                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-sm bg-slate-100 text-slate-600">
                          {comp.logo}
                        </span>
                        <Lock className="w-3.5 h-3.5 text-slate-400" />
                      </div>

                      <h5 className="text-xs font-bold text-slate-800">{comp.name}</h5>
                      <span className="text-[10px] text-indigo-600 font-semibold block mt-0.5">
                        {comp.ctc}
                      </span>
                      <span className="text-[10px] text-slate-400 block mt-1">
                        Min CGPA {comp.minCgpa} • [LOCKED]
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* Assessed Placement Eligibility */
            <div className="space-y-5">
              {/* 3 Status Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Eligible */}
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 shadow-xs transition-all hover:-translate-y-0.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-800 uppercase flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span>Eligible</span>
                    </span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="text-3xl font-semibold text-emerald-900 my-1">
                    <AnimatedNumber value={eligibleCount} duration={800} />
                  </div>
                  <p className="text-xs text-emerald-700 leading-snug">
                    You meet all CGPA, backlog, and branch criteria.
                  </p>
                </div>

                {/* Borderline / In Progress */}
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 shadow-xs transition-all hover:-translate-y-0.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-800 uppercase">Borderline</span>
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                  </div>
                  <div className="text-3xl font-semibold text-amber-900 my-1">
                    <AnimatedNumber value={borderlineCount} duration={800} />
                  </div>
                  <p className="text-xs text-amber-700 leading-snug">
                    Within 0.3 CGPA of qualifying for recruitment rounds.
                  </p>
                </div>

                {/* Cutoff Gap / Ineligible */}
                <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 shadow-xs transition-all hover:-translate-y-0.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-rose-800 uppercase">Cutoff Gap</span>
                    <TrendingUp className="w-4 h-4 text-rose-600" />
                  </div>
                  <div className="text-3xl font-semibold text-rose-900 my-1">
                    <AnimatedNumber value={ineligibleCount} duration={800} />
                  </div>
                  <p className="text-xs text-rose-700 leading-snug">
                    Missed cutoffs due to CGPA, branch, or backlogs.
                  </p>
                </div>
              </div>

              {/* Matching Companies Grid */}
              <div className="pt-2">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 block mb-2.5 flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Live Matching Product &amp; Tech Employers</span>
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {eligibilityResults
                    .filter((r) => r.status === 'eligible')
                    .slice(0, 4)
                    .map((res) => (
                      <div
                        key={res.company.id}
                        className="group relative overflow-hidden p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
                      >
                        <div
                          aria-hidden="true"
                          className="absolute -right-2 sm:-right-1 top-1/2 -translate-y-1/2 w-20 h-20 sm:w-24 sm:h-24 pointer-events-none z-0 flex items-center justify-center select-none"
                        >
                          <CompanyWatermarkLogo id={res.company.id} name={res.company.name} />
                        </div>

                        <div className="relative z-10">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-900">{res.company.name}</span>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                              <Check className="w-3 h-3 text-emerald-600" />
                              <span>ELIGIBLE</span>
                            </span>
                          </div>
                          <div className="flex items-center justify-between mt-1.5 text-xs">
                            <span className="text-indigo-600 font-bold">{res.company.typicalPackage}</span>
                            <span className="text-slate-500 text-[11px]">Min CGPA {res.company.minCgpa}</span>
                          </div>
                        </div>
                      </div>
                    ))}

                  {eligibleCount === 0 && (
                    <div className="col-span-2 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500 text-center">
                      Explore borderline and high-growth opportunities in the full Eligibility Matrix.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.section>

      {/* ========================================================================= */}
      {/* 5. SKILL GAPS & LEARNING RECOMMENDATIONS SECTION */}
      {/* ========================================================================= */}
      <motion.section
        id="section-skill-gaps-recommendations"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-40px' }}
        variants={sectionAnimationVariants}
        className="space-y-4"
      >
        <div className="flex items-center gap-2 mb-1">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
            <GitBranch className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-semibold text-slate-900 tracking-tight">
              Skill Gaps &amp; Learning Recommendations
            </h2>
            <p className="text-xs text-slate-500">
              Personalized diagnostic roadmap, high-priority gap remediation, and verified certifications.
            </p>
          </div>
        </div>

        {/* Clean Visual Competency Indicators (e.g. SQL - Needs improvement, Cloud - Needs improvement, Python - Strong) */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Code2 className="w-3.5 h-3.5 text-indigo-600" />
              <span>Skill Gap Diagnostic Status</span>
            </span>
            <span className="text-[11px] text-slate-500 font-medium">
              Click any skill to view course curriculum
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {skillStatusHighlights.map((skill) => (
              <div
                key={skill.id}
                onClick={() => setSelectedSkillForModal(skill)}
                className="flex items-center justify-between p-3 bg-slate-50 hover:bg-indigo-50/40 border border-slate-200 hover:border-indigo-300 rounded-xl transition-all cursor-pointer shadow-2xs group hover:-translate-y-0.5"
              >
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded-md bg-white border border-slate-200 group-hover:border-indigo-200 text-slate-700">
                    {getSkillIcon(skill.name)}
                  </div>
                  <span className="text-xs font-bold text-slate-900 group-hover:text-indigo-600">
                    {skill.name}
                  </span>
                </div>

                {skill.status === 'Strong' ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    <span>Strong</span>
                  </span>
                ) : skill.status === 'Developing' ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                    <span>Developing</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                    <AlertTriangle className="w-3 h-3 text-amber-600" />
                    <span>Needs improvement</span>
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left: Critical Gaps & Immediate Next Steps */}
          <div className="bg-white border border-slate-200 hover:border-indigo-200 rounded-2xl p-6 shadow-xs flex flex-col justify-between transition-all duration-300 hover:shadow-sm">
            <div>
              <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2 mb-4">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                <span>Placement Obstacles &amp; Critical Gaps</span>
              </h3>

              {!isAssessed ? (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600">
                  Submit your student assessment to identify personalized placement obstacles and skill gaps.
                </div>
              ) : report.criticalGaps.length === 0 ? (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800">
                  No critical placement obstacles identified! Your profile demonstrates solid academic and technical readiness.
                </div>
              ) : (
                <ul className="space-y-2.5">
                  {report.criticalGaps.map((gap, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-2.5 text-xs text-slate-800 bg-amber-50/70 border border-amber-200 rounded-lg p-3 transition-all hover:bg-amber-50"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                      <span className="leading-relaxed">{gap}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {isAssessed && report.immediateSteps.length > 0 && (
              <div className="mt-5 pt-5 border-t border-slate-100">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 block mb-2.5">
                  Recommended Immediate Next Steps
                </span>
                <div className="space-y-2">
                  {report.immediateSteps.map((step, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                      <span className="font-bold text-indigo-600 shrink-0">{idx + 1}.</span>
                      <span>{step}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right: Competitive Advantages & Quick Module Navigation */}
          <div className="bg-white border border-slate-200 hover:border-indigo-200 rounded-2xl p-6 shadow-xs flex flex-col justify-between transition-all duration-300 hover:shadow-sm">
            <div>
              <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2 mb-4">
                <Award className="w-5 h-5 text-emerald-600" />
                <span>Competitive Advantages</span>
              </h3>

              {!isAssessed ? (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600">
                  Submit your student assessment to unlock your personalized competitive advantages and peer benchmark.
                </div>
              ) : report.strengths.length === 0 ? (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600">
                  Complete your profile data or load sample data to see competitive strengths against peer applicants.
                </div>
              ) : (
                <ul className="space-y-2.5">
                  {report.strengths.map((str, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-2.5 text-xs text-slate-800 bg-emerald-50/70 border border-emerald-200 rounded-lg p-3 transition-all hover:bg-emerald-50"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span className="leading-relaxed">{str}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Quick Action Navigation Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6 pt-6 border-t border-slate-100">
              <button
                type="button"
                onClick={() => onNavigate('courses')}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-indigo-50/50 border border-slate-200 hover:border-indigo-300 text-left transition-all duration-300 hover:-translate-y-0.5 cursor-pointer group"
              >
                <div>
                  <span className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 block transition-colors">
                    Courses &amp; Certs
                  </span>
                  <span className="text-[11px] text-slate-500">AWS, Cisco &amp; Oracle</span>
                </div>
                <Award className="w-4 h-4 text-indigo-600" />
              </button>

              <button
                type="button"
                onClick={() => onNavigate('jobs')}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-indigo-50/50 border border-slate-200 hover:border-indigo-300 text-left transition-all duration-300 hover:-translate-y-0.5 cursor-pointer group"
              >
                <div>
                  <span className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 block transition-colors">
                    Live Job Discovery
                  </span>
                  <span className="text-[11px] text-slate-500">Real verified tech jobs</span>
                </div>
                <Briefcase className="w-4 h-4 text-indigo-600" />
              </button>

              <button
                type="button"
                onClick={() => onNavigate('skillgap')}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-indigo-50/50 border border-slate-200 hover:border-indigo-300 text-left transition-all duration-300 hover:-translate-y-0.5 cursor-pointer group"
              >
                <div>
                  <span className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 block transition-colors">
                    Skill Gap Roadmap
                  </span>
                  <span className="text-[11px] text-slate-500">Target role benchmark</span>
                </div>
                <GitBranch className="w-4 h-4 text-indigo-600" />
              </button>

              <button
                type="button"
                onClick={() => onNavigate('counselor')}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-indigo-50/50 border border-slate-200 hover:border-indigo-300 text-left transition-all duration-300 hover:-translate-y-0.5 cursor-pointer group"
              >
                <div>
                  <span className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 block transition-colors">
                    AI Counselor
                  </span>
                  <span className="text-[11px] text-slate-500">Ask placement guidance</span>
                </div>
                <Bot className="w-4 h-4 text-indigo-600" />
              </button>
            </div>
          </div>
        </div>
      </motion.section>

      {/* ========================================================================= */}
      {/* 6. JOB RECOMMENDATIONS SECTION */}
      {/* ========================================================================= */}
      <motion.section
        id="section-job-recommendations"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-40px' }}
        variants={sectionAnimationVariants}
        className="space-y-4"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
              <Briefcase className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-semibold text-slate-900 tracking-tight">
                Recommended Live Job Opportunities
              </h2>
              <p className="text-xs text-slate-500">
                Top tech vacancies matched to your current academic profile and technical skills.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onNavigate('jobs')}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-700 transition-colors cursor-pointer self-start sm:self-auto hover:-translate-y-0.5"
          >
            <span>View All Job Vacancies</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {jobsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-40 rounded-xl bg-white border border-slate-200 p-5 space-y-3 animate-pulse"
              >
                <div className="h-4 w-3/4 bg-slate-100 rounded" />
                <div className="h-3 w-1/2 bg-slate-100 rounded" />
                <div className="h-2 w-full bg-slate-100 rounded" />
              </div>
            ))}
          </div>
        ) : (
          <motion.div
            variants={cardStaggerContainer}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            {recommendedJobs.map((job) => {
              const evalResult = calculateJobMatch(profile, job);
              const matchPercent = isAssessed ? evalResult.matchPercentage : 0;

              return (
                <motion.div
                  key={job.id}
                  variants={cardItemAnimation}
                  className="bg-white border border-slate-200 hover:border-indigo-300 rounded-xl p-5 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:shadow-md flex flex-col justify-between group"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">
                          {job.company}
                        </span>
                        <h4 className="text-sm font-bold text-slate-900 mt-0.5 group-hover:text-indigo-600 transition-colors">
                          {job.title}
                        </h4>
                        <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            <span>{job.location}</span>
                          </span>
                          <span className="flex items-center gap-1">
                            <Briefcase className="w-3 h-3 text-slate-400" />
                            <span>{job.workMode}</span>
                          </span>
                        </div>
                      </div>

                      {/* Match Percentage Badge */}
                      <div className="text-right shrink-0">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${
                            matchPercent >= 75
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : matchPercent >= 45
                              ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                              : 'bg-slate-100 text-slate-600 border border-slate-200'
                          }`}
                        >
                          {isAssessed ? `${matchPercent}% Match` : '— Match'}
                        </span>
                      </div>
                    </div>

                    {/* Animated Match Percentage Progress Bar */}
                    <div className="space-y-1">
                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                        <div
                          className={`h-full rounded-full transition-all duration-700 ease-out ${
                            matchPercent >= 75
                              ? 'bg-emerald-500'
                              : matchPercent >= 45
                              ? 'bg-indigo-600'
                              : 'bg-slate-300'
                          }`}
                          style={{ width: `${matchPercent}%` }}
                        />
                      </div>
                    </div>

                    {/* Required Skills Chips */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {(job.requiredSkills || []).slice(0, 4).map((sk, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-600"
                        >
                          {sk}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className="mt-4 pt-3.5 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-700">
                      {job.salary || 'Competitive Industry Package'}
                    </span>

                    <button
                      type="button"
                      onClick={() => onNavigate('jobs')}
                      className="inline-flex items-center gap-1 font-bold text-indigo-600 hover:text-indigo-700 transition-colors cursor-pointer"
                    >
                      <span>View Opportunity</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </motion.section>

      {/* ========================================================================= */}
      {/* 7. CAREER RECOMMENDATIONS SECTION */}
      {/* ========================================================================= */}
      <motion.section
        id="section-career-recommendations"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-40px' }}
        variants={sectionAnimationVariants}
        className="space-y-4"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-semibold text-slate-900 tracking-tight">
                Recommended Career Pathways &amp; Target Roles
              </h2>
              <p className="text-xs text-slate-500">
                High-demand career tracks aligned with current engineering campus placement cycles.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onNavigate('skillgap')}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-700 transition-colors cursor-pointer self-start sm:self-auto hover:-translate-y-0.5"
          >
            <span>Explore Target Role Roadmaps</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Clean Highlight Recommendation Card */}
        <div className="bg-gradient-to-r from-indigo-50/90 via-blue-50/70 to-slate-50 border border-indigo-200/80 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-2xs">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-indigo-700 bg-white/80 px-2 py-0.5 rounded-md border border-indigo-200/60 inline-block mb-1">
                Priority Career Recommendation
              </span>
              <h4 className="text-sm font-bold text-slate-900">
                Improve Python + SQL to increase your Software Developer placement eligibility.
              </h4>
              <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                Targeting 85%+ proficiency across core data structures and relational queries unlocks Tier-1 product cutoffs.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('skillgap')}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs shrink-0 transition-all hover:scale-102 flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
          >
            <span>View Details</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <motion.div
          variants={cardStaggerContainer}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {TARGET_ROLE_DEFINITIONS.slice(0, 4).map((role) => (
            <motion.div
              key={role.id}
              variants={cardItemAnimation}
              className="bg-white border border-slate-200 hover:border-indigo-300 rounded-xl p-5 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:shadow-md flex flex-col justify-between group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 uppercase tracking-wider">
                    {role.hiringDemand} Demand
                  </span>
                  <span className="text-xs font-semibold text-emerald-600">
                    {role.avgPackage}
                  </span>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                    {role.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                    {role.description}
                  </p>
                </div>

                {/* Key Required Skills */}
                <div className="space-y-1.5 pt-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Core Competencies
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {role.requiredSkills.slice(0, 3).map((sk, idx) => (
                      <span
                        key={idx}
                        className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700 border border-slate-200"
                      >
                        {sk}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-4 mt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => onNavigate('skillgap')}
                  className="w-full py-2 px-3 rounded-lg bg-slate-50 hover:bg-indigo-600 text-slate-700 hover:text-white text-xs font-bold transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <span>View Role Roadmap</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </motion.section>

      {/* ========================================================================= */}
      {/* INTERACTIVE SKILL COURSE PROGRESS MODAL */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {selectedSkillForModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.24, ease: 'easeOut' }}
              className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5"
            >
              {/* Modal Header */}
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200">
                      {selectedSkillForModal.category}
                    </span>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                      {selectedSkillForModal.level}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mt-1 flex items-center gap-2">
                    {getSkillIcon(selectedSkillForModal.name)}
                    <span>{selectedSkillForModal.name} Competency</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Dynamic progress calculated from active courses and practical milestone completions.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedSkillForModal(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                  title="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Current Status Overview */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-600">Dynamic Proficiency:</span>
                  {selectedSkillForModal.hasActiveCourse ? (
                    <span className="text-indigo-600 text-sm font-semibold">
                      {selectedSkillForModal.percent}% ({selectedSkillForModal.level})
                    </span>
                  ) : (
                    <span className="text-slate-400 font-semibold">No active course</span>
                  )}
                </div>
                <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-600 rounded-full transition-all duration-700 ease-out"
                    style={{
                      width: `${
                        selectedSkillForModal.hasActiveCourse ? selectedSkillForModal.percent : 0
                      }%`,
                    }}
                  />
                </div>
                {selectedSkillForModal.hasActiveCourse &&
                  selectedSkillForModal.activeCourses.length > 1 && (
                    <p className="text-[11px] text-slate-500">
                      Calculated as the average across {selectedSkillForModal.activeCourses.length}{' '}
                      active learning courses.
                    </p>
                  )}
              </div>

              {/* Active Courses List */}
              {selectedSkillForModal.hasActiveCourse ? (
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Currently Active Courses ({selectedSkillForModal.activeCourses.length})
                  </h4>

                  <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                    {selectedSkillForModal.activeCourses.map((c) => (
                      <div
                        key={c.courseId}
                        className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-2.5 shadow-xs"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h5 className="text-xs font-bold text-slate-900">{c.title}</h5>
                            {c.provider && (
                              <span className="text-[10px] text-slate-500 font-medium">
                                Provider: {c.provider}
                              </span>
                            )}
                          </div>
                          <span className="text-xs font-semibold text-indigo-600">
                            {c.progressPercentage}%
                          </span>
                        </div>

                        {/* Interactive Slider */}
                        <div className="flex items-center gap-3">
                          <input
                            type="range"
                            min="0"
                            max="100"
                            step="1"
                            value={c.progressPercentage}
                            onChange={(e) =>
                              updateCourseProgress(c.courseId, Number(e.target.value))
                            }
                            className="w-full accent-indigo-600 cursor-pointer"
                          />
                        </div>

                        {/* Quick Activity Completion Buttons */}
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          <button
                            type="button"
                            onClick={() =>
                              updateCourseProgress(
                                c.courseId,
                                Math.min(100, c.progressPercentage + 10)
                              )
                            }
                            className="px-2 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[11px] font-bold rounded-md transition-colors cursor-pointer border border-indigo-200"
                          >
                            +10% Lesson
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              updateCourseProgress(
                                c.courseId,
                                Math.min(100, c.progressPercentage + 25)
                              )
                            }
                            className="px-2 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[11px] font-bold rounded-md transition-colors cursor-pointer border border-indigo-200"
                          >
                            +25% Quiz
                          </button>
                          <button
                            type="button"
                            onClick={() => updateCourseProgress(c.courseId, 100)}
                            className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[11px] font-bold rounded-md transition-colors cursor-pointer border border-emerald-200"
                          >
                            100% (Master)
                          </button>
                          <button
                            type="button"
                            onClick={() => updateCourseProgress(c.courseId, 0)}
                            className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 text-[11px] font-bold rounded-md transition-colors cursor-pointer border border-slate-200"
                          >
                            Reset 0%
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 text-center space-y-3">
                  <BookOpen className="w-8 h-8 text-slate-400 mx-auto" />
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-slate-800">
                      No active course enrolled for {selectedSkillForModal.name}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Skill progress and level are calculated strictly from active courses. Start an
                      industry course to begin tracking real-time progress.
                    </p>
                  </div>

                  {(() => {
                    const coreMatch = CORE_TECHNICAL_COMPETENCIES.find(
                      (c) => c.name.toUpperCase() === selectedSkillForModal.name.toUpperCase()
                    );
                    const recId = coreMatch?.recommendedCourseId;
                    return (
                      <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2">
                        {recId && (
                          <button
                            type="button"
                            onClick={() => {
                              enrollInCourse(recId, 0);
                            }}
                            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer hover:-translate-y-0.5"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Start Learning Course (0% - Started)</span>
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedSkillForModal(null);
                            onNavigate('courses');
                          }}
                          className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 text-xs font-bold rounded-xl transition-all cursor-pointer hover:-translate-y-0.5"
                        >
                          <span>Browse Courses Catalog</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* Level Thresholds Reference */}
              <div className="pt-2 border-t border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                  Competency Progression Scale
                </span>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-1 text-center text-[10px]">
                  <div className="p-1 rounded bg-slate-100 text-slate-600">
                    <div className="font-bold">Started</div>
                    <div className="text-[9px] text-slate-400">0–19%</div>
                  </div>
                  <div className="p-1 rounded bg-slate-100 text-slate-600">
                    <div className="font-bold">Beginner</div>
                    <div className="text-[9px] text-slate-400">20–39%</div>
                  </div>
                  <div className="p-1 rounded bg-indigo-50 text-indigo-700">
                    <div className="font-bold">Intermediate</div>
                    <div className="text-[9px] text-indigo-500">40–59%</div>
                  </div>
                  <div className="p-1 rounded bg-indigo-50 text-indigo-700">
                    <div className="font-bold">Proficient</div>
                    <div className="text-[9px] text-indigo-500">60–79%</div>
                  </div>
                  <div className="p-1 rounded bg-indigo-100 text-indigo-800">
                    <div className="font-bold">Advanced</div>
                    <div className="text-[9px] text-indigo-600">80–94%</div>
                  </div>
                  <div className="p-1 rounded bg-emerald-100 text-emerald-800">
                    <div className="font-bold">Master</div>
                    <div className="text-[9px] text-emerald-600">95–100%</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default DashboardView;
