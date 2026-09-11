import React, { useState, useEffect, useRef, useMemo } from 'react';
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
  Info,
  Rocket,
  Lock,
  Unlock,
  ChevronRight,
  Star,
  Zap,
  Target,
  ShieldCheck,
  Compass,
  Check,
  ExternalLink,
  Layers,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { StudentProfile, PlacementReadinessReport, EligibilityResult, AuthUser } from '../types';
import { EmptyStateBanner } from './EmptyStateBanner';
import { NavTab } from './Navbar';
import { COMPANY_CRITERIA_DATABASE } from '../data/mockDatabase';
import { CompanyWatermarkLogo } from './CompanyWatermarkLogo';

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
 * Trigger subtle, tasteful confetti celebrating readiness calculation or score improvement
 */
const triggerPlacementCelebration = () => {
  if (typeof window === 'undefined') return;
  try {
    confetti({
      particleCount: 55,
      spread: 55,
      origin: { y: 0.62 },
      colors: ['#4F46E5', '#10B981', '#06B6D4', '#F59E0B', '#6366F1'],
      disableForReducedMotion: true,
    });
  } catch (e) {
    console.warn('Confetti note:', e);
  }
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
  const eligibleCount = isAssessed ? eligibilityResults.filter((r) => r.status === 'eligible').length : 0;
  const borderlineCount = isAssessed ? eligibilityResults.filter((r) => r.status === 'borderline').length : 0;
  const ineligibleCount = isAssessed ? eligibilityResults.filter((r) => r.status === 'ineligible').length : 0;

  const cgpaValue = Number(profile.cgpa) || 0;
  const backlogsCount = Number(profile.activeBacklogs) || 0;

  // Animated score counter for readiness score (0 -> actual score)
  const [animatedScore, setAnimatedScore] = useState<number>(0);
  const celebrationFiredRef = useRef<boolean>(false);

  useEffect(() => {
    if (!isAssessed || report.overallScore === 0) {
      setAnimatedScore(0);
      return;
    }

    const targetScore = Math.min(100, Math.max(0, report.overallScore));
    const duration = 1200; // ms
    const startTime = performance.now();

    const animateCount = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const currentVal = Math.round(easeProgress * targetScore);
      setAnimatedScore(currentVal);

      if (progress < 1) {
        requestAnimationFrame(animateCount);
      } else {
        // Fire celebration confetti once upon finishing the initial calculation
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
    // Level formula scaled by score, skills logged, and projects built
    const scoreComponent = report.overallScore * 28;
    const skillsComponent = (profile.skills?.length || 0) * 65;
    const projectsComponent = (profile.projects?.length || 0) * 120;
    const certsComponent = (profile.certifications?.length || 0) * 90;
    const totalXp = scoreComponent + skillsComponent + projectsComponent + certsComponent;

    // Dynamic level: 1 to 25
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

  // Visual Skill Cards Data (Dynamic profile skills + high demand tech stack)
  const skillCards = useMemo(() => {
    const logged = (profile.skills || []).map((s) => {
      let percent = 70;
      let levelBadge = 'Intermediate';
      if (s.level === 'Advanced') {
        percent = 88;
        levelBadge = 'Advanced';
      } else if (s.level === 'Intermediate') {
        percent = 78;
        levelBadge = 'Proficient';
      } else {
        percent = 62;
        levelBadge = 'Foundation';
      }
      return {
        id: s.id,
        name: s.name.toUpperCase(),
        percent,
        level: levelBadge,
        category: s.category || 'Core Skill',
        verified: true,
      };
    });

    // Curated high-impact default skills if few or none logged
    const defaultCurated = [
      { id: 'def-py', name: 'PYTHON', percent: 85, level: 'Advanced', category: 'Programming', verified: isAssessed },
      { id: 'def-da', name: 'DATA ANALYSIS', percent: 78, level: 'Proficient', category: 'Analytics', verified: isAssessed },
      { id: 'def-pd', name: 'PANDAS', percent: 90, level: 'Master', category: 'Data Science', verified: isAssessed },
      { id: 'def-sql', name: 'SQL & DBMS', percent: 82, level: 'Advanced', category: 'Databases', verified: isAssessed },
      { id: 'def-sd', name: 'SYSTEM DESIGN', percent: 74, level: 'Proficient', category: 'Architecture', verified: isAssessed },
      { id: 'def-cloud', name: 'CLOUD & DEVOPS', percent: 70, level: 'Intermediate', category: 'Infrastructure', verified: isAssessed },
    ];

    if (logged.length >= 3) {
      return logged.slice(0, 6);
    }
    // Blend logged with default
    const combined = [...logged];
    for (const def of defaultCurated) {
      if (combined.length < 6 && !combined.some((c) => c.name.toLowerCase() === def.name.toLowerCase())) {
        combined.push(def);
      }
    }
    return combined;
  }, [profile.skills, isAssessed]);

  // Top company eligibility previews
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

  // SVG Circular Meter Calculations
  const radius = 72;
  const circumference = 2 * Math.PI * radius; // ~452.39
  const strokeDashoffset = isAssessed
    ? circumference - (animatedScore / 100) * circumference
    : circumference;

  return (
    <div className="space-y-8 text-slate-900 selection:bg-indigo-500 selection:text-white">
      {/* Top Welcome Bar */}
      <div className="relative overflow-hidden rounded-2xl bg-white border border-slate-200 shadow-xs p-6 sm:p-7">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            {/* CareerAI Compass Logo */}
            <div className="relative shrink-0 group cursor-pointer" onClick={() => onNavigate('dashboard')}>
              <img
                src="/careerai-logo.png"
                alt="CareerAI Compass Logo"
                className="w-14 h-14 md:w-16 md:h-16 rounded-full object-contain border border-slate-200 shadow-xs relative z-10 bg-white"
                referrerPolicy="no-referrer"
              />
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-indigo-600" />
                  <span>AI Placement Intelligence</span>
                </span>
                <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>30+ Top Recruiters Calibrated</span>
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {currentUser?.name ? `Welcome back, ${currentUser.name}` : 'CareerAI Placement Dashboard'}
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl leading-relaxed">
                Precision academic diagnostic engine analyzing engineering CGPA, branch cutoffs, technical depth, and real recruiter eligibility.
              </p>
            </div>
          </div>

          {/* Top Quick Actions */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {!isAssessed ? (
              <>
                <button
                  type="button"
                  id="hero-enter-profile-btn"
                  onClick={() => onNavigate('profile')}
                  className="px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs transition-all hover:scale-[1.01] active:scale-98 flex items-center gap-2 cursor-pointer"
                >
                  <Rocket className="w-4 h-4" />
                  <span>Enter Your Profile</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  id="hero-load-demo-btn"
                  onClick={onLoadDemo}
                  className="px-4 py-3 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 hover:border-slate-400 font-semibold text-xs sm:text-sm rounded-xl transition-all flex items-center gap-2 cursor-pointer"
                  title="Load sample 3rd year CSE profile for testing"
                >
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  <span>Load Demo Data</span>
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => onNavigate('profile')}
                  className="px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-semibold text-xs rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Edit Profile</span>
                  <ArrowRight className="w-3.5 h-3.5 text-indigo-600" />
                </button>

                <button
                  type="button"
                  onClick={() => onNavigate('jobs')}
                  className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Briefcase className="w-3.5 h-3.5" />
                  <span>Explore Live Jobs</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main Grid: Placement Readiness & Key Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Placement Readiness Card */}
        <div
          id="readiness-score-card"
          className="lg:col-span-5 bg-white border border-slate-200 hover:border-slate-300 rounded-2xl p-6 shadow-xs flex flex-col justify-between transition-all duration-300"
        >
          {!isAssessed ? (
            /* 1. EMPTY PROFILE STATE: Rocket Journey */
            <div className="flex flex-col items-center text-center py-4 px-2 my-auto space-y-5">
              {/* Cosmic Rocket Visual */}
              <div className="relative flex items-center justify-center w-36 h-36">
                <div className="absolute inset-0 rounded-full border border-indigo-100 animate-[spin_16s_linear_infinite]" />
                <div className="absolute inset-2 rounded-full border border-dashed border-indigo-200/50 animate-[spin_24s_linear_infinite_reverse]" />

                {/* Rocket Orb Center */}
                <div className="relative z-10 w-20 h-20 rounded-2xl bg-indigo-50 border border-indigo-100 shadow-xs flex items-center justify-center">
                  <Rocket className="w-10 h-10 text-indigo-600 animate-bounce" />
                </div>

                {/* Stars */}
                <span className="absolute top-2 right-4 text-xs text-indigo-400">✦</span>
                <span className="absolute bottom-3 left-3 text-xs text-indigo-300">✦</span>
                <span className="absolute top-8 left-2 text-[10px] text-indigo-400">★</span>
              </div>

              {/* Exact Requested Copy */}
              <div className="space-y-2 max-w-sm">
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                  <Star className="w-3.5 h-3.5 text-indigo-600 fill-indigo-600" />
                  <span>Discovery Mode</span>
                </span>

                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  Your Career Journey Starts Here
                </h2>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Complete your profile to discover your career readiness.
                </p>
              </div>

              {/* Enter Your Profile Button */}
              <button
                type="button"
                id="empty-readiness-enter-profile-btn"
                onClick={() => onNavigate('profile')}
                className="w-full py-3.5 px-5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl shadow-xs transition-all hover:scale-[1.01] active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Rocket className="w-4 h-4" />
                <span>Enter Your Profile</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {/* Unranked Status Info */}
              <div className="w-full pt-4 border-t border-slate-100 text-left space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-semibold flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Level 1 • Unranked Explorer</span>
                  </span>
                  <span className="text-slate-700 font-bold">0 / 1,000 XP</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 border border-slate-200 overflow-hidden">
                  <div className="h-full bg-indigo-600 w-0" />
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed italic">
                  Readiness score will automatically calibrate once CGPA, branch, and technical skills are submitted.
                </p>
              </div>
            </div>
          ) : (
            /* 3. PLACEMENT READINESS (Assessed): Animated Circular Progress, Level 12, Career XP */
            <div className="space-y-6">
              {/* Header Row */}
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 block">
                    Placement Readiness
                  </span>
                  <h3 className="text-base font-bold text-slate-900 mt-0.5">Diagnostic Evaluation</h3>
                </div>

                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${
                    report.grade === 'Placement Ready'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : report.grade === 'Near Ready'
                      ? 'bg-blue-50 text-blue-700 border-blue-200'
                      : 'bg-amber-50 text-amber-700 border-amber-200'
                  }`}
                >
                  {report.grade}
                </span>
              </div>

              {/* Animated Circular Progress Meter */}
              <div className="flex flex-col items-center justify-center my-2">
                <div className="relative w-48 h-48 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 180 180">
                    <defs>
                      <linearGradient id="scoreIndigoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#4F46E5" />
                        <stop offset="100%" stopColor="#06B6D4" />
                      </linearGradient>
                      <filter id="indigoGlow" x="-20%" y="-20%" width="140%" height="140%">
                        <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#4F46E5" floodOpacity="0.25" />
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

                  {/* Inner Score Badge */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <div className="flex items-baseline">
                      <span className="text-5xl font-black text-slate-900 tracking-tighter">
                        {animatedScore}
                      </span>
                      <span className="text-lg font-bold text-indigo-600 ml-0.5">%</span>
                    </div>
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">
                      Readiness Score
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 text-center max-w-xs mt-3 leading-relaxed">
                  Evaluated across CGPA ({cgpaValue.toFixed(2)}), {backlogsCount} backlog(s),{' '}
                  {profile.skills?.length || 0} skills, and {profile.projects?.length || 0} projects.
                </p>
              </div>

              {/* Level & Career XP Card */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2.5 shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                      ★
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">Level {currentLevel}</span>
                      <span className="text-[10px] text-indigo-600 font-semibold uppercase tracking-wider">
                        Engineering Candidate
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-bold text-indigo-600">
                      {currentXp.toLocaleString()} / {maxXp.toLocaleString()} XP
                    </span>
                    <span className="text-[10px] text-slate-500 block font-medium">Career XP</span>
                  </div>
                </div>

                {/* Progress bar to next level */}
                <div className="space-y-1">
                  <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden border border-slate-200">
                    <div
                      className="h-full bg-indigo-600 rounded-full transition-all duration-700"
                      style={{ width: `${xpProgressPercent}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-500 font-medium">
                    <span>{xpProgressPercent}% to Level {currentLevel + 1}</span>
                    <span className="text-emerald-600 font-semibold">Ranked Top Tier</span>
                  </div>
                </div>
              </div>

              {/* Sub-Score Dimensional Breakdown */}
              <div className="space-y-3 pt-4 border-t border-slate-100">
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-slate-700">Academics &amp; Backlogs</span>
                    <span className="text-slate-900 font-bold">{report.academicScore} / 25</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                    <div
                      className="h-full bg-blue-600 rounded-full transition-all duration-700"
                      style={{ width: `${(report.academicScore / 25) * 100}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-slate-700">Technical Skills Depth</span>
                    <span className="text-slate-900 font-bold">{report.skillsScore} / 30</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all duration-700"
                      style={{ width: `${(report.skillsScore / 30) * 100}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-slate-700">Engineering Projects</span>
                    <span className="text-slate-900 font-bold">{report.projectsScore} / 25</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                    <div
                      className="h-full bg-indigo-600 rounded-full transition-all duration-700"
                      style={{ width: `${(report.projectsScore / 25) * 100}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-slate-700">Experience &amp; Certifications</span>
                    <span className="text-slate-900 font-bold">{report.experienceScore} / 20</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                    <div
                      className="h-full bg-violet-600 rounded-full transition-all duration-700"
                      style={{ width: `${(report.experienceScore / 20) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Center/Right: Diagnostic Metrics & Placement Eligibility Section */}
        <div className="lg:col-span-7 space-y-6">
          {/* Key Academic Metrics Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            <div className="bg-white border border-slate-200 hover:border-slate-300 rounded-xl p-4 shadow-xs transition-all hover:-translate-y-0.5">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                B.Tech CGPA
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black text-slate-900">
                  {isAssessed && profile.cgpa ? Number(profile.cgpa).toFixed(2) : '—'}
                </span>
                <span className="text-xs text-slate-400 font-semibold">/ 10</span>
              </div>
              <span className="text-[11px] text-slate-600 mt-1 block truncate font-medium">
                {isAssessed && profile.branch ? profile.branch : 'Pending Profile'}
              </span>
            </div>

            <div className="bg-white border border-slate-200 hover:border-slate-300 rounded-xl p-4 shadow-xs transition-all hover:-translate-y-0.5">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Active Backlogs
              </span>
              <div className="flex items-baseline gap-1">
                <span
                  className={`text-2xl font-black ${
                    isAssessed && backlogsCount > 0 ? 'text-rose-600' : 'text-slate-900'
                  }`}
                >
                  {!isAssessed ? '—' : backlogsCount}
                </span>
              </div>
              <span
                className={`text-[11px] font-semibold mt-1 block ${
                  !isAssessed
                    ? 'text-slate-400'
                    : backlogsCount === 0
                    ? 'text-emerald-600'
                    : 'text-rose-600'
                }`}
              >
                {!isAssessed ? 'No data' : backlogsCount === 0 ? '0 Backlogs (Clean)' : `${backlogsCount} Clearance Req`}
              </span>
            </div>

            <div className="bg-white border border-slate-200 hover:border-slate-300 rounded-xl p-4 shadow-xs transition-all hover:-translate-y-0.5">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Skills Depth
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black text-slate-900">
                  {isAssessed ? profile.skills?.length || 0 : '—'}
                </span>
              </div>
              <span className="text-[11px] text-slate-600 mt-1 block font-medium">
                {isAssessed
                  ? `${profile.skills?.filter((s) => s.level === 'Advanced').length || 0} Advanced Mastery`
                  : 'Pending Profile'}
              </span>
            </div>

            <div className="bg-white border border-slate-200 hover:border-slate-300 rounded-xl p-4 shadow-xs transition-all hover:-translate-y-0.5">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Live Projects
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black text-slate-900">
                  {isAssessed ? profile.projects?.length || 0 : '—'}
                </span>
              </div>
              <span className="text-[11px] text-slate-600 mt-1 block font-medium">
                {isAssessed
                  ? `${profile.projects?.filter((p) => p.githubUrl).length || 0} GitHub Verified`
                  : 'Pending Profile'}
              </span>
            </div>
          </div>

          {/* 5. PLACEMENT ELIGIBILITY SECTION */}
          <div
            id="placement-eligibility-section"
            className="bg-white border border-slate-200 hover:border-slate-300 rounded-2xl p-6 shadow-xs space-y-5"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-indigo-600" />
                  <span>Campus Placement Eligibility Radar</span>
                </h3>
                <p className="text-xs text-slate-600 mt-0.5">
                  Screened across 30+ top Product, High-Growth, and Mass recruiters.
                </p>
              </div>

              <button
                type="button"
                onClick={() => onNavigate('eligibility')}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-700 transition-colors cursor-pointer self-start sm:self-auto"
              >
                <span>View All 30 Recruiters</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {!isAssessed ? (
              /* Requirement 5: Empty radar replaced with locked section */
              <div className="space-y-4">
                {/* Locked Banner Notification */}
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
                    className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs shrink-0 transition-all cursor-pointer"
                  >
                    Unlock Matrix
                  </button>
                </div>

                {/* Locked Company Placeholders Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {lockedCompanyPreviews.map((comp) => (
                    <div
                      key={comp.id}
                      className="group relative overflow-hidden bg-white border border-slate-200 rounded-xl p-3 text-center transition-all hover:border-indigo-300"
                    >
                      {/* Subtle Official Company Background Watermark */}
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
              /* Requirement 5: Unlocked eligibility with Subtle Green Glow */
              <div className="space-y-4">
                {/* 3 Summary Badges */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 shadow-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-emerald-800 uppercase">Eligible</span>
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div className="text-3xl font-black text-emerald-900 my-1">{eligibleCount}</div>
                    <p className="text-xs text-emerald-700 leading-snug">
                      You meet all CGPA, backlog, and branch criteria.
                    </p>
                  </div>

                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 shadow-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-amber-800 uppercase">Borderline</span>
                      <AlertTriangle className="w-4 h-4 text-amber-600" />
                    </div>
                    <div className="text-3xl font-black text-amber-900 my-1">{borderlineCount}</div>
                    <p className="text-xs text-amber-700 leading-snug">
                      Within 0.3 CGPA of qualifying for recruitment rounds.
                    </p>
                  </div>

                  <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 shadow-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-rose-800 uppercase">Cutoff Gap</span>
                      <TrendingUp className="w-4 h-4 text-rose-600" />
                    </div>
                    <div className="text-3xl font-black text-rose-900 my-1">{ineligibleCount}</div>
                    <p className="text-xs text-rose-700 leading-snug">
                      Missed cutoffs due to CGPA, branch, or backlogs.
                    </p>
                  </div>
                </div>

                {/* Grid of Matching Companies */}
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
                          className="group relative overflow-hidden p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200 shadow-xs transition-all hover:scale-[1.01]"
                        >
                          {/* Subtle Official Company Background Watermark */}
                          <div
                            aria-hidden="true"
                            className="absolute -right-2 sm:-right-1 top-1/2 -translate-y-1/2 w-20 h-20 sm:w-24 sm:h-24 pointer-events-none z-0 flex items-center justify-center select-none"
                          >
                            <CompanyWatermarkLogo id={res.company.id} name={res.company.name} />
                          </div>

                          <div className="relative z-10">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-slate-900">{res.company.name}</span>
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                                ELIGIBLE
                              </span>
                            </div>
                            <div className="flex items-center justify-between mt-1 text-xs">
                              <span className="text-indigo-600 font-bold">{res.company.typicalPackage}</span>
                              <span className="text-slate-500 text-[11px]">Min CGPA {res.company.minCgpa}</span>
                            </div>
                          </div>
                        </div>
                      ))}

                    {eligibleCount === 0 && (
                      <div className="col-span-2 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500 text-center">
                        Explore borderline and high-growth opportunities in the full Eligibility Matrix.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 4. SKILL PROGRESS CARDS */}
      <div
        id="skill-progress-section"
        className="bg-white border border-slate-200 hover:border-slate-300 rounded-2xl p-6 shadow-xs space-y-5"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Code2 className="w-5 h-5 text-indigo-600" />
              <h3 className="text-base font-black text-slate-900">Technical Skill Competencies &amp; Progress</h3>
            </div>
            <p className="text-xs text-slate-600 mt-0.5">
              Live proficiency indices calculated from projects, self-assessment, and placement benchmarks.
            </p>
          </div>

          <button
            type="button"
            onClick={() => onNavigate('courses')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 font-bold text-xs rounded-xl transition-all cursor-pointer self-start sm:self-auto"
          >
            <Award className="w-3.5 h-3.5" />
            <span>Close Gap via Verified Certs</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Visual Skill Cards: PYTHON 85%, DATA ANALYSIS 78%, PANDAS 90%, etc. */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {skillCards.map((skill) => (
            <div
              key={skill.id}
              className="bg-white border border-slate-200 hover:border-indigo-300 rounded-xl p-4 space-y-2.5 shadow-xs transition-all duration-300 hover:-translate-y-0.5 group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-800 tracking-wide group-hover:text-indigo-600 transition-colors">
                  {skill.name}
                </span>
                <span className="text-xs font-black text-indigo-600 flex items-center gap-1">
                  <span>{skill.percent}%</span>
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                <div
                  className="h-full bg-indigo-600 rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${skill.percent}%` }}
                />
              </div>

              <div className="flex items-center justify-between pt-1 text-[11px]">
                <span className="text-slate-500 font-medium">{skill.category}</span>
                <span className="px-2 py-0.5 rounded-md font-bold text-[10px] bg-slate-100 text-slate-700 border border-slate-200">
                  {skill.level}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Diagnostic Strengths & Critical Gaps */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Placement Obstacles & Critical Gaps */}
        <div className="bg-white border border-slate-200 hover:border-slate-300 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2 mb-4">
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
                    className="flex items-start gap-2.5 text-xs text-slate-800 bg-amber-50 border border-amber-200 rounded-lg p-3"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                    <span className="leading-relaxed">{gap}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Immediate Action Steps */}
          {isAssessed && report.immediateSteps.length > 0 && (
            <div className="mt-5 pt-5 border-t border-slate-100">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 block mb-2.5">
                Recommended Immediate Next Steps
              </span>
              <div className="space-y-2">
                {report.immediateSteps.map((step, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                    <span className="font-bold text-indigo-600">{idx + 1}.</span>
                    <span>{step}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Competitive Advantages & Peer Edge */}
        <div className="bg-white border border-slate-200 hover:border-slate-300 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2 mb-4">
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
                    className="flex items-start gap-2.5 text-xs text-slate-800 bg-emerald-50 border border-emerald-200 rounded-lg p-3"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{str}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Quick Action Navigation Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6 pt-6 border-t border-slate-100">
            <button
              type="button"
              onClick={() => onNavigate('courses')}
              className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-slate-300 text-left transition-all cursor-pointer group"
            >
              <div>
                <span className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 block transition-colors">
                  Courses &amp; Certifications
                </span>
                <span className="text-[11px] text-slate-500">AWS, Cisco, Oracle &amp; Google</span>
              </div>
              <Award className="w-4 h-4 text-indigo-600" />
            </button>

            <button
              type="button"
              onClick={() => onNavigate('jobs')}
              className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-slate-300 text-left transition-all cursor-pointer group"
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
              className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-slate-300 text-left transition-all cursor-pointer group"
            >
              <div>
                <span className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 block transition-colors">
                  Skill Gap &amp; Roadmap
                </span>
                <span className="text-[11px] text-slate-500">Target role benchmark</span>
              </div>
              <GitBranch className="w-4 h-4 text-indigo-600" />
            </button>

            <button
              type="button"
              onClick={() => onNavigate('counselor')}
              className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-slate-300 text-left transition-all cursor-pointer group"
            >
              <div>
                <span className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 block transition-colors">
                  AI Career Counselor
                </span>
                <span className="text-[11px] text-slate-500">Ask placement questions</span>
              </div>
              <Bot className="w-4 h-4 text-indigo-600" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardView;
