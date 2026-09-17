import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { StudentProfile, AuthUser, AccountRecord } from './types';
import {
  EMPTY_STUDENT_PROFILE,
  DEMO_STUDENT_PROFILE,
  COMPANY_CRITERIA_DATABASE,
} from './data/mockDatabase';
import {
  calculatePlacementReadiness,
  evaluateCompanyEligibility,
  isProfileEmpty,
} from './utils/readinessCalculator';
import {
  getActiveSession,
  setActiveSession,
  saveAccountToRegistry,
  getAccountByEmail,
  logoutUser,
} from './utils/authService';
import { Navbar, NavTab } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { TopHeader } from './components/TopHeader';
import { DashboardView } from './components/DashboardView';
import { ProfileView } from './components/ProfileView';
import { EligibilityView } from './components/EligibilityView';
import { SkillGapView } from './components/SkillGapView';
import { CoursesView } from './components/CoursesView';
import { JobsView } from './components/JobsView';
import { AiCounselorView } from './components/AiCounselorView';
import { ResumeBuilderView } from './components/ResumeBuilderView';
import { PrepHubView } from './components/PrepHubView';
import { AuthModal } from './components/AuthModal';
import { RatingModal } from './components/RatingModal';
import { Footer } from './components/Footer';
import { CareerAiStartupIntro } from './components/CareerAiStartupIntro';
import { CareerAiLoadingScreen } from './components/CareerAiLoadingScreen';
import { CareerAiWatermarkBackground } from './components/CareerAiWatermarkBackground';
import { CursorGlow } from './components/CursorGlow';
import { CardCursorManager } from './components/CardCursorManager';
import { LEARNING_PATH_STORAGE_KEY } from './data/coursesDatabase';
import { COURSE_PROGRESS_UPDATED_EVENT } from './utils/courseSkillService';
import { ThemeProvider } from './context/ThemeContext';
import { LoadingProvider, useLoading } from './context/LoadingContext';
import { AboutPlatformInfo } from './components/AboutPlatformInfo';

const STORAGE_KEY = 'careerai_student_profile_v1';
const ASSESSMENT_SUBMITTED_KEY = 'careerai_assessment_submitted_v1';

const TAB_NAMES: Record<NavTab, string> = {
  dashboard: 'Dashboard',
  profile: 'Profile & Assessment',
  eligibility: 'Eligibility Checker',
  skillgap: 'Skill Gap & Roadmap',
  courses: 'Courses & Certifications',
  jobs: 'Jobs & Internships',
  counselor: 'AI Career Guidance',
  resume: 'Resume & ATS',
  prep: 'Interview Prep',
  about: 'About CarrerAi',
};

export function App() {
  return (
    <ThemeProvider>
      <LoadingProvider>
        <CareerAiAppMain />
      </LoadingProvider>
    </ThemeProvider>
  );
}

function CareerAiAppMain() {
  // Authentication & Session State
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => getActiveSession());
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'signin' | 'signup'>('signin');

  // User Rating & Feedback Modal State
  const [ratingModalOpen, setRatingModalOpen] = useState(false);

  // Administrator Verification State (computed securely via server endpoint)
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (!currentUser?.email) {
      setIsAdmin(false);
      return;
    }
    let isMounted = true;
    fetch('/api/auth/check-admin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: currentUser.email }),
    })
      .then((res) => (res.ok ? res.json() : { isAdmin: false }))
      .then((data) => {
        if (isMounted) {
          setIsAdmin(Boolean(data?.isAdmin));
        }
      })
      .catch(() => {
        if (isMounted) {
          setIsAdmin(false);
        }
      });
    return () => {
      isMounted = false;
    };
  }, [currentUser?.email]);

  // Centralized Global Loading & Intro System
  const {
    startLoading,
    stopLoading,
    isOverlayVisible,
    title: loadingTitle,
    subtitle: loadingSubtitle,
    dismissAll,
    isIntroActive,
    completeIntro,
    triggerIntro,
  } = useLoading();

  // Startup Lifecycle: The dashboard is strictly mounted ONLY after the startup intro completes
  // This guarantees zero dashboard cards, headings, or data flash before or behind the intro
  const [dashboardMounted, setDashboardMounted] = useState<boolean>(() => !isIntroActive);

  const handleIntroComplete = useCallback(() => {
    setDashboardMounted(true);
    completeIntro();
  }, [completeIntro]);

  const handleIntroDismiss = useCallback(() => {
    if (isIntroActive) {
      handleIntroComplete();
    } else {
      dismissAll();
    }
  }, [isIntroActive, handleIntroComplete, dismissAll]);

  // Assessment Submitted Flag
  const [assessmentSubmitted, setAssessmentSubmitted] = useState<boolean>(() => {
    try {
      const active = getActiveSession();
      if (active) {
        const record = getAccountByEmail(active.email);
        if (record?.assessmentSubmitted) return true;
      }
      return localStorage.getItem(ASSESSMENT_SUBMITTED_KEY) === 'true';
    } catch {
      return false;
    }
  });

  // CRITICAL: Initialize strictly with EMPTY_STUDENT_PROFILE for new users
  const [profile, setProfile] = useState<StudentProfile>(() => {
    try {
      // Check if logged in user has an isolated account profile
      const active = getActiveSession();
      if (active) {
        const record = getAccountByEmail(active.email);
        if (record && record.profile && !isProfileEmpty(record.profile)) {
          return record.profile;
        }
      }

      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Could not read saved profile, falling back to empty profile:', e);
    }
    return EMPTY_STUDENT_PROFILE;
  });

  const VALID_TABS: NavTab[] = [
    'dashboard',
    'profile',
    'eligibility',
    'skillgap',
    'courses',
    'jobs',
    'counselor',
    'resume',
    'prep',
    'about',
  ];

  const PUBLIC_ROUTE_MAP: Record<string, NavTab> = {
    '/': 'dashboard',
    '/courses': 'courses',
    '/career': 'counselor',
    '/resume': 'resume',
    '/jobs': 'jobs',
    '/about': 'about',
  };

  const PAGE_SEO: Record<NavTab, { title: string; description: string; path: string; isPrivate?: boolean }> = {
    dashboard: {
      title: 'CarrerAi – AI Career Guidance, Courses & Resume Builder',
      description: 'CarrerAi is an AI-powered career platform that helps students and job seekers with career guidance, resume building, skill development, courses and career opportunities.',
      path: '/',
    },
    courses: {
      title: 'CarrerAi Courses – Learn Skills for Your Career',
      description: 'Explore career-focused courses and learning resources with CarrerAi to build skills and track your learning progress.',
      path: '/courses',
    },
    counselor: {
      title: 'AI Career Guidance – Explore Career Paths with CarrerAi',
      description: 'Explore career paths, skills and opportunities with AI-powered career guidance from CarrerAi.',
      path: '/career',
    },
    resume: {
      title: 'AI Resume Builder – Create a Professional Resume | CarrerAi',
      description: 'Create and improve a professional resume with CarrerAi\'s career and resume tools.',
      path: '/resume',
    },
    jobs: {
      title: 'Career Opportunities & Jobs | CarrerAi',
      description: 'Explore career opportunities and job resources through CarrerAi.',
      path: '/jobs',
    },
    about: {
      title: 'About CarrerAi – AI-Powered Career Platform',
      description: 'Learn about CarrerAi and its mission to help students and job seekers with career guidance, learning and professional development.',
      path: '/about',
    },
    profile: {
      title: 'CarrerAi | Student Profile & Placement Benchmark',
      description: 'Manage your profile, academic scores, and placement criteria securely on CarrerAi.',
      path: '#profile',
      isPrivate: true,
    },
    eligibility: {
      title: 'CarrerAi | Company Placement Eligibility Checker',
      description: 'Check eligibility across top tech recruiters, cutoffs, and tier benchmarks on CarrerAi.',
      path: '#eligibility',
    },
    skillgap: {
      title: 'CarrerAi | Technical Skill Gap Analysis & Roadmap',
      description: 'Identify technical skill gaps and follow step-by-step career roadmaps on CarrerAi.',
      path: '#skillgap',
    },
    prep: {
      title: 'CarrerAi | Technical Interview Preparation & Drills',
      description: 'Prepare for technical interviews, core subjects, and behavioral questions on CarrerAi.',
      path: '#prep',
    },
  };

  const getTabFromLocation = (): NavTab => {
    if (typeof window === 'undefined') return 'dashboard';
    const path = window.location.pathname.replace(/\/$/, '') || '/';
    if (PUBLIC_ROUTE_MAP[path]) {
      return PUBLIC_ROUTE_MAP[path];
    }
    const hash = window.location.hash.replace('#', '').toLowerCase();
    if (hash === 'career') return 'counselor';
    if (VALID_TABS.includes(hash as NavTab)) return hash as NavTab;
    return 'dashboard';
  };

  const [currentTab, setCurrentTab] = useState<NavTab>(() => getTabFromLocation());
  const [initialCounselorPrompt, setInitialCounselorPrompt] = useState<string>('');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Synchronize browser history and clean SEO-friendly URLs
  const handleSelectTab = (tab: NavTab) => {
    setCurrentTab(tab);
    if (typeof window !== 'undefined') {
      let targetUrl = '/';
      if (tab === 'dashboard') targetUrl = '/';
      else if (tab === 'courses') targetUrl = '/courses';
      else if (tab === 'counselor') targetUrl = '/career';
      else if (tab === 'resume') targetUrl = '/resume';
      else if (tab === 'jobs') targetUrl = '/jobs';
      else if (tab === 'about') targetUrl = '/about';
      else targetUrl = `#${tab}`;

      const currentPathAndHash = (window.location.pathname.replace(/\/$/, '') || '/') + window.location.hash;
      if (currentPathAndHash !== targetUrl) {
        window.history.pushState({ tab }, '', targetUrl);
      }
      // Scroll to top when changing views
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    const handleLocationChange = () => {
      const tab = getTabFromLocation();
      setCurrentTab(tab);
    };
    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
    };
  }, []);

  // Dynamic SEO metadata synchronization for public and private pages
  useEffect(() => {
    const seo = PAGE_SEO[currentTab] || PAGE_SEO.dashboard;

    // 1. Update Title
    document.title = seo.title;

    // 2. Update Meta Description
    const descMeta = document.querySelector('meta[name="description"]');
    if (descMeta) {
      descMeta.setAttribute('content', seo.description);
    }

    // 3. Update Open Graph
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute('content', seo.title);

    const ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) ogDesc.setAttribute('content', seo.description);

    const ogUrl = document.querySelector('meta[property="og:url"]');
    if (ogUrl) {
      ogUrl.setAttribute(
        'content',
        seo.path.startsWith('/') && seo.path !== '/'
          ? `https://carrer-ai-kappa.vercel.app${seo.path}`
          : 'https://carrer-ai-kappa.vercel.app/'
      );
    }

    // 4. Update Twitter Card
    const twTitle = document.querySelector('meta[name="twitter:title"]');
    if (twTitle) twTitle.setAttribute('content', seo.title);

    const twDesc = document.querySelector('meta[name="twitter:description"]');
    if (twDesc) twDesc.setAttribute('content', seo.description);

    // 5. Update Canonical Link
    const canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) {
      const canonicalHref =
        seo.path.startsWith('/') && seo.path !== '/'
          ? `https://carrer-ai-kappa.vercel.app${seo.path}`
          : 'https://carrer-ai-kappa.vercel.app/';
      canonical.setAttribute('href', canonicalHref);
    }

    // 6. Section 15: Protect private pages with dynamic noindex
    const robotsMeta = document.querySelector('meta[name="robots"]');
    if (robotsMeta) {
      if (seo.isPrivate) {
        robotsMeta.setAttribute('content', 'noindex, nofollow');
      } else {
        robotsMeta.setAttribute(
          'content',
          'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'
        );
      }
    }
  }, [currentTab]);

  // Persist profile changes to localStorage and user account registry
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
      if (currentUser) {
        saveAccountToRegistry({
          user: currentUser,
          profile,
          assessmentSubmitted,
          updatedAt: new Date().toISOString(),
        });
      }
    } catch (e) {
      console.warn('Failed to persist profile to storage:', e);
    }
  }, [profile, currentUser, assessmentSubmitted]);

  // Derived state: check if profile is empty
  const emptyProfileState = useMemo(() => isProfileEmpty(profile), [profile]);

  // Placement readiness diagnostic report
  const readinessReport = useMemo(
    () => calculatePlacementReadiness(profile),
    [profile]
  );

  // Company eligibility results across 30+ recruiters
  const eligibilityResults = useMemo(
    () => evaluateCompanyEligibility(profile, COMPANY_CRITERIA_DATABASE),
    [profile]
  );

  const eligibleCompanyCount = useMemo(
    () => eligibilityResults.filter((r) => r.status === 'eligible').length,
    [eligibilityResults]
  );

  // Handler to load demo profile (Preview mode)
  const handleLoadDemo = () => {
    startLoading('demo-profile', {
      title: 'Loading Demo Student Profile...',
      subtitle: 'Evaluating 30+ company cutoffs, readiness metrics, and roadmap',
    });

    setTimeout(() => {
      setProfile(DEMO_STUDENT_PROFILE);
      setAssessmentSubmitted(true);
      try {
        localStorage.setItem(ASSESSMENT_SUBMITTED_KEY, 'true');
        const demoLearningPath = [
          {
            courseId: 'cisco-python-essentials',
            status: 'in-progress' as const,
            progressPercentage: 65,
            savedAt: new Date().toISOString(),
            orderIndex: 0,
          },
          {
            courseId: 'ibm-pandas-data-science',
            status: 'in-progress' as const,
            progressPercentage: 40,
            savedAt: new Date().toISOString(),
            orderIndex: 1,
          },
          {
            courseId: 'oracle-database-sql-associate',
            status: 'in-progress' as const,
            progressPercentage: 80,
            savedAt: new Date().toISOString(),
            orderIndex: 2,
          },
        ];
        localStorage.setItem(LEARNING_PATH_STORAGE_KEY, JSON.stringify(demoLearningPath));
        window.dispatchEvent(
          new CustomEvent(COURSE_PROGRESS_UPDATED_EVENT, { detail: demoLearningPath })
        );
      } catch (e) {
        console.warn(e);
      }
      stopLoading('demo-profile');
    }, 600);
  };

  // Handler to clear profile to completely empty
  const handleClearProfile = () => {
    setProfile(EMPTY_STUDENT_PROFILE);
    setAssessmentSubmitted(false);
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(ASSESSMENT_SUBMITTED_KEY);
      localStorage.removeItem(LEARNING_PATH_STORAGE_KEY);
      window.dispatchEvent(
        new CustomEvent(COURSE_PROGRESS_UPDATED_EVENT, { detail: [] })
      );
      if (currentUser) {
        saveAccountToRegistry({
          user: currentUser,
          profile: EMPTY_STUDENT_PROFILE,
          assessmentSubmitted: false,
          updatedAt: new Date().toISOString(),
        });
      }
    } catch (e) {
      console.warn('Failed to clear storage:', e);
    }
  };

  // Submit assessment callback
  const handleSubmitAssessment = () => {
    startLoading('assessment-submit', {
      title: 'Analyzing Placement Readiness...',
      subtitle: 'Screening B.Tech criteria against 30+ recruiters & computing skill gaps',
    });

    setTimeout(() => {
      setAssessmentSubmitted(true);
      try {
        localStorage.setItem(ASSESSMENT_SUBMITTED_KEY, 'true');
        if (currentUser) {
          saveAccountToRegistry({
            user: currentUser,
            profile,
            assessmentSubmitted: true,
            updatedAt: new Date().toISOString(),
          });
        }
      } catch (e) {
        console.warn(e);
      }
      stopLoading('assessment-submit');
      setCurrentTab('dashboard');
    }, 700);
  };

  // Profile update handler
  const handleUpdateProfile = (updated: StudentProfile) => {
    setProfile(updated);
    if (currentUser && updated.name?.trim() && updated.name.trim() !== currentUser.name) {
      const updatedUser: AuthUser = { ...currentUser, name: updated.name.trim() };
      setCurrentUser(updatedUser);
      setActiveSession(updatedUser);
    }
    if (!isProfileEmpty(updated)) {
      setAssessmentSubmitted(true);
      try {
        localStorage.setItem(ASSESSMENT_SUBMITTED_KEY, 'true');
      } catch (e) {
        console.warn(e);
      }
    }
  };

  // Logout handler
  const handleLogout = () => {
    startLoading('logout', {
      title: 'Signing Out...',
      subtitle: 'Safely terminating session and protecting student profile data',
    });

    setTimeout(() => {
      logoutUser();
      setCurrentUser(null);
      setAssessmentSubmitted(false);
      setProfile(EMPTY_STUDENT_PROFILE);
      try {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(ASSESSMENT_SUBMITTED_KEY);
        localStorage.removeItem(LEARNING_PATH_STORAGE_KEY);
        window.dispatchEvent(
          new CustomEvent(COURSE_PROGRESS_UPDATED_EVENT, { detail: [] })
        );
      } catch (e) {
        console.warn(e);
      }
      setCurrentTab('dashboard');
      stopLoading('logout');
    }, 500);
  };

  // Auth success handler (Google Sign-In or Email Auth)
  const handleAuthSuccess = (record: AccountRecord, isNewUser: boolean) => {
    startLoading('auth', {
      title: isNewUser ? 'Creating Your CareerAI Account...' : 'Welcome Back to CareerAI!',
      subtitle: 'Synchronizing isolated student credentials & intelligence dashboard',
    });

    setTimeout(() => {
      setCurrentUser(record.user);
      setActiveSession(record.user);
      setAssessmentSubmitted(record.assessmentSubmitted || false);

      if (record.profile && !isProfileEmpty(record.profile)) {
        setProfile(record.profile);
      } else {
        setProfile(EMPTY_STUDENT_PROFILE);
      }

      // Restore user's persistent learning path from their account record
      if (record.learningPath && Array.isArray(record.learningPath) && record.learningPath.length > 0) {
        try {
          localStorage.setItem(LEARNING_PATH_STORAGE_KEY, JSON.stringify(record.learningPath));
          window.dispatchEvent(
            new CustomEvent(COURSE_PROGRESS_UPDATED_EVENT, { detail: record.learningPath })
          );
        } catch (e) {
          console.warn('Failed to sync learning path on login:', e);
        }
      }

      setAuthModalOpen(false);

      // If new user, continue through existing new-user/profile setup flow; otherwise redirect to Dashboard
      if (isNewUser) {
        setCurrentTab('profile');
      } else {
        setCurrentTab('dashboard');
      }
      stopLoading('auth');
    }, 750);
  };

  // Ask counselor with specific prompt from skill gap
  const handleAskCounselor = (prompt: string) => {
    setInitialCounselorPrompt(prompt);
    handleSelectTab('counselor');
  };

  return (
    <div className={`relative min-h-screen ${dashboardMounted ? 'bg-slate-50 text-slate-900' : 'bg-[#070B14] text-white'} font-sans selection:bg-indigo-500 selection:text-white print:bg-white print:min-h-0 print:p-0 print:m-0`}>
      {dashboardMounted && (
        <>
          {/* Subtle Animated CareerAI Brand Watermark Background (Layer 2 & 3) */}
          <div className="print:hidden">
            <CareerAiWatermarkBackground />
          </div>

          {/* Premium Subtle Cursor Glow & Card Cursor Manager */}
          <div className="print:hidden">
            <CursorGlow />
            <CardCursorManager />
          </div>

          {/* Modern Fixed Left Navigation Sidebar (Desktop + Mobile Slideover) */}
          <div className="print:hidden">
            <Sidebar
              currentTab={currentTab}
              onSelectTab={handleSelectTab}
              report={readinessReport}
              isProfileEmpty={emptyProfileState}
              eligibleCompanyCount={eligibleCompanyCount}
              currentUser={currentUser}
              assessmentSubmitted={assessmentSubmitted}
              mobileOpen={mobileSidebarOpen}
              onCloseMobile={() => setMobileSidebarOpen(false)}
              onOpenRating={() => setRatingModalOpen(true)}
              isAdmin={isAdmin}
            />
          </div>

          {/* Main Content Column (with desktop left padding for the fixed sidebar) */}
          <div className="flex-1 flex flex-col min-w-0 min-h-screen lg:pl-64 print:pl-0 print:m-0 print:min-h-0 print:w-full">
            {/* Top Header with Search, Notifications, Demo Profile toggle & User Avatar */}
            <div className="print:hidden">
              <TopHeader
                onToggleMobile={() => setMobileSidebarOpen(true)}
                currentTab={currentTab}
                onSelectTab={handleSelectTab}
                report={readinessReport}
                isProfileEmpty={emptyProfileState}
                onLoadDemo={handleLoadDemo}
                onClearProfile={handleClearProfile}
                currentUser={currentUser}
                assessmentSubmitted={assessmentSubmitted}
                onOpenAuth={(mode) => {
                  setAuthModalMode(mode);
                  setAuthModalOpen(true);
                }}
                onLogout={handleLogout}
                onReplayIntro={triggerIntro}
                onOpenRating={() => setRatingModalOpen(true)}
                isAdmin={isAdmin}
              />
            </div>

            {/* Main Content Area */}
            <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 print:p-0 print:m-0 print:max-w-none print:w-full">
              {currentTab === 'dashboard' && (
                <DashboardView
                  profile={profile}
                  report={readinessReport}
                  isProfileEmpty={emptyProfileState}
                  eligibilityResults={eligibilityResults}
                  onNavigate={handleSelectTab}
                  onLoadDemo={handleLoadDemo}
                  currentUser={currentUser}
                  assessmentSubmitted={assessmentSubmitted}
                  isAdmin={isAdmin}
                  onOpenRating={() => setRatingModalOpen(true)}
                />
              )}

              {currentTab === 'profile' && (
                <ProfileView
                  profile={profile}
                  onUpdateProfile={handleUpdateProfile}
                  onLoadDemo={handleLoadDemo}
                  onClearProfile={handleClearProfile}
                  currentUser={currentUser}
                  assessmentSubmitted={assessmentSubmitted}
                  onSubmitAssessment={handleSubmitAssessment}
                  onOpenAuth={(mode) => {
                    setAuthModalMode(mode);
                    setAuthModalOpen(true);
                  }}
                />
              )}

              {currentTab === 'eligibility' && (
                <EligibilityView
                  profile={profile}
                  eligibilityResults={eligibilityResults}
                  isProfileEmpty={emptyProfileState}
                  onNavigate={handleSelectTab}
                  onLoadDemo={handleLoadDemo}
                />
              )}

              {currentTab === 'skillgap' && (
                <SkillGapView
                  profile={profile}
                  isProfileEmpty={emptyProfileState}
                  onNavigate={handleSelectTab}
                  onLoadDemo={handleLoadDemo}
                  onAskCounselorWithPrompt={handleAskCounselor}
                />
              )}

              {currentTab === 'courses' && (
                <CoursesView
                  profile={profile}
                  isProfileEmpty={emptyProfileState}
                  onNavigateToTab={handleSelectTab}
                  onLoadDemoProfile={handleLoadDemo}
                />
              )}

              {currentTab === 'jobs' && (
                <JobsView
                  profile={profile}
                  currentUser={currentUser}
                  assessmentSubmitted={assessmentSubmitted}
                  onNavigate={handleSelectTab}
                  onLoadDemoProfile={handleLoadDemo}
                />
              )}

              {currentTab === 'counselor' && (
                <AiCounselorView
                  profile={profile}
                  isProfileEmpty={emptyProfileState}
                  initialPrompt={initialCounselorPrompt}
                  onClearInitialPrompt={() => setInitialCounselorPrompt('')}
                  onNavigate={handleSelectTab}
                  onLoadDemo={handleLoadDemo}
                />
              )}

              {currentTab === 'resume' && (
                <ResumeBuilderView
                  profile={profile}
                  isProfileEmpty={emptyProfileState}
                  onNavigate={handleSelectTab}
                  onLoadDemo={handleLoadDemo}
                />
              )}

              {currentTab === 'prep' && <PrepHubView />}

              {currentTab === 'about' && (
                <div className="space-y-6">
                  <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
                    <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight leading-tight">
                      About CarrerAi – AI-Powered Career Platform
                    </h1>
                    <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed max-w-3xl">
                      Learn about CarrerAi and its mission to help students and job seekers with career guidance, learning and professional development.
                    </p>
                  </div>
                  <AboutPlatformInfo />
                </div>
              )}
            </main>

            {/* Professional Startup Footer */}
            <div className="relative z-10 print:hidden">
              <Footer onReplayIntro={triggerIntro} onNavigateTab={handleSelectTab} />
            </div>
          </div>
        </>
      )}

      {/* Unified Google & Email Authentication Modal */}
      <div className="print:hidden">
        <AuthModal
          isOpen={authModalOpen}
          initialMode={authModalMode}
          onClose={() => setAuthModalOpen(false)}
          onAuthSuccess={handleAuthSuccess}
        />

        {/* User Rating & Feedback Modal */}
        <RatingModal
          isOpen={ratingModalOpen}
          onClose={() => setRatingModalOpen(false)}
          currentUser={currentUser}
          currentPage={TAB_NAMES[currentTab] || currentTab}
        />

        {/* Centralized Premium CareerAI Loading Screen & Intro */}
        <CareerAiLoadingScreen
          show={isIntroActive || isOverlayVisible}
          title={loadingTitle}
          subtitle={loadingSubtitle}
          isIntroMode={isIntroActive}
          onComplete={handleIntroComplete}
          onDismiss={handleIntroDismiss}
        />
      </div>
    </div>
  );
}

export default App;
