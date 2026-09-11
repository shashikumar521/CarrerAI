import React, { useState, useEffect, useMemo } from 'react';
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
import { AboutPlatformInfo } from './components/AboutPlatformInfo';
import { Footer } from './components/Footer';
import { CareerAiStartupIntro } from './components/CareerAiStartupIntro';
import { CareerAiLoadingScreen } from './components/CareerAiLoadingScreen';

const STORAGE_KEY = 'careerai_student_profile_v1';
const ASSESSMENT_SUBMITTED_KEY = 'careerai_assessment_submitted_v1';
const STARTUP_SESSION_KEY = 'careerai_startup_shown_v1';

export function App() {
  // Authentication & Session State
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => getActiveSession());
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'signin' | 'signup'>('signin');

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

  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [initialCounselorPrompt, setInitialCounselorPrompt] = useState<string>('');

  // Startup Animation State (displays fullscreen on initial website open, once per session)
  const [showStartupIntro, setShowStartupIntro] = useState<boolean>(() => {
    try {
      return !sessionStorage.getItem(STARTUP_SESSION_KEY);
    } catch {
      return false;
    }
  });

  // Global Loading Screen State (for authentication, demo profile, assessment calculation)
  const [globalLoading, setGlobalLoading] = useState<{
    active: boolean;
    title?: string;
    subtitle?: string;
    solidBg?: boolean;
  }>({ active: false });

  const handleStartupComplete = () => {
    setShowStartupIntro(false);
    try {
      sessionStorage.setItem(STARTUP_SESSION_KEY, 'true');
    } catch (e) {
      console.warn(e);
    }
  };

  const handleReplayIntro = () => {
    setShowStartupIntro(true);
  };

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
    setGlobalLoading({
      active: true,
      title: 'Loading Demo Student Profile...',
      subtitle: 'Evaluating 30+ company cutoffs, readiness metrics, and roadmap',
    });

    setTimeout(() => {
      setProfile(DEMO_STUDENT_PROFILE);
      setAssessmentSubmitted(true);
      try {
        localStorage.setItem(ASSESSMENT_SUBMITTED_KEY, 'true');
      } catch (e) {
        console.warn(e);
      }
      setGlobalLoading({ active: false });
    }, 600);
  };

  // Handler to clear profile to completely empty
  const handleClearProfile = () => {
    setProfile(EMPTY_STUDENT_PROFILE);
    setAssessmentSubmitted(false);
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(ASSESSMENT_SUBMITTED_KEY);
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
    setGlobalLoading({
      active: true,
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
      setGlobalLoading({ active: false });
      setCurrentTab('dashboard');
    }, 700);
  };

  // Profile update handler
  const handleUpdateProfile = (updated: StudentProfile) => {
    setProfile(updated);
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
    setGlobalLoading({
      active: true,
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
      } catch (e) {
        console.warn(e);
      }
      setCurrentTab('dashboard');
      setGlobalLoading({ active: false });
    }, 500);
  };

  // Auth success handler (Google Sign-In or Email Auth)
  const handleAuthSuccess = (record: AccountRecord, isNewUser: boolean) => {
    setGlobalLoading({
      active: true,
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

      setAuthModalOpen(false);

      // If new user or assessment not yet submitted, guide to profile assessment
      if (isNewUser || !record.assessmentSubmitted) {
        setCurrentTab('profile');
      } else {
        setCurrentTab('dashboard');
      }
      setGlobalLoading({ active: false });
    }, 750);
  };

  // Ask counselor with specific prompt from skill gap
  const handleAskCounselor = (prompt: string) => {
    setInitialCounselorPrompt(prompt);
    setCurrentTab('counselor');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Fixed / Sticky Navigation */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        report={readinessReport}
        isProfileEmpty={emptyProfileState}
        onLoadDemo={handleLoadDemo}
        onClearProfile={handleClearProfile}
        eligibleCompanyCount={eligibleCompanyCount}
        currentUser={currentUser}
        assessmentSubmitted={assessmentSubmitted}
        onOpenAuth={(mode) => {
          setAuthModalMode(mode);
          setAuthModalOpen(true);
        }}
        onLogout={handleLogout}
        onReplayIntro={handleReplayIntro}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentTab === 'dashboard' && (
          <DashboardView
            profile={profile}
            report={readinessReport}
            isProfileEmpty={emptyProfileState}
            eligibilityResults={eligibilityResults}
            onNavigate={setCurrentTab}
            onLoadDemo={handleLoadDemo}
            currentUser={currentUser}
            assessmentSubmitted={assessmentSubmitted}
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
            onNavigate={setCurrentTab}
            onLoadDemo={handleLoadDemo}
          />
        )}

        {currentTab === 'skillgap' && (
          <SkillGapView
            profile={profile}
            isProfileEmpty={emptyProfileState}
            onNavigate={setCurrentTab}
            onLoadDemo={handleLoadDemo}
            onAskCounselorWithPrompt={handleAskCounselor}
          />
        )}

        {currentTab === 'courses' && (
          <CoursesView
            profile={profile}
            isProfileEmpty={emptyProfileState}
            onNavigateToTab={setCurrentTab}
            onLoadDemoProfile={handleLoadDemo}
          />
        )}

        {currentTab === 'jobs' && (
          <JobsView
            profile={profile}
            currentUser={currentUser}
            assessmentSubmitted={assessmentSubmitted}
            onNavigate={setCurrentTab}
            onLoadDemoProfile={handleLoadDemo}
          />
        )}

        {currentTab === 'counselor' && (
          <AiCounselorView
            profile={profile}
            isProfileEmpty={emptyProfileState}
            initialPrompt={initialCounselorPrompt}
            onClearInitialPrompt={() => setInitialCounselorPrompt('')}
            onNavigate={setCurrentTab}
            onLoadDemo={handleLoadDemo}
          />
        )}

        {currentTab === 'resume' && (
          <ResumeBuilderView
            profile={profile}
            isProfileEmpty={emptyProfileState}
            onNavigate={setCurrentTab}
            onLoadDemo={handleLoadDemo}
          />
        )}

        {currentTab === 'prep' && <PrepHubView />}
      </main>

      {/* Crawlable Platform Overview for Users & Search Engines */}
      <AboutPlatformInfo />

      {/* Professional Startup Footer */}
      <Footer onReplayIntro={handleReplayIntro} />

      {/* Unified Google & Email Authentication Modal */}
      <AuthModal
        isOpen={authModalOpen}
        initialMode={authModalMode}
        onClose={() => setAuthModalOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />

      {/* Startup Screen Animation (Fullscreen on initial website load/session) */}
      {showStartupIntro && (
        <CareerAiStartupIntro onComplete={handleStartupComplete} />
      )}

      {/* Global Branded Loading Screen */}
      <CareerAiLoadingScreen
        show={globalLoading.active}
        title={globalLoading.title}
        subtitle={globalLoading.subtitle}
        solidBg={globalLoading.solidBg}
        onDismiss={() => setGlobalLoading({ active: false })}
      />
    </div>
  );
}

export default App;
