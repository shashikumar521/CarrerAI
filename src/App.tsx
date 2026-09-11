import React, { useState, useEffect, useMemo } from 'react';
import { StudentProfile } from './types';
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
import { Navbar, NavTab } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { ProfileView } from './components/ProfileView';
import { EligibilityView } from './components/EligibilityView';
import { SkillGapView } from './components/SkillGapView';
import { AiCounselorView } from './components/AiCounselorView';
import { ResumeBuilderView } from './components/ResumeBuilderView';
import { PrepHubView } from './components/PrepHubView';

const STORAGE_KEY = 'careerai_student_profile_v1';

export function App() {
  // CRITICAL: Initialize strictly with EMPTY_STUDENT_PROFILE for new users
  const [profile, setProfile] = useState<StudentProfile>(() => {
    try {
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

  // Persist profile changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    } catch (e) {
      console.warn('Failed to persist profile to localStorage:', e);
    }
  }, [profile]);

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
    setProfile(DEMO_STUDENT_PROFILE);
  };

  // Handler to clear profile to completely empty
  const handleClearProfile = () => {
    setProfile(EMPTY_STUDENT_PROFILE);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.warn('Failed to clear localStorage:', e);
    }
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
          />
        )}

        {currentTab === 'profile' && (
          <ProfileView
            profile={profile}
            onUpdateProfile={setProfile}
            onLoadDemo={handleLoadDemo}
            onClearProfile={handleClearProfile}
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

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 mt-12 print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900">CareerAI</span>
            <span>—</span>
            <span>B.Tech Campus Placement & Eligibility Intelligence</span>
          </div>

          <div className="flex items-center gap-6">
            <span>Client Data Privacy: Local Storage Only</span>
            <span>•</span>
            <span>AI Powered by Gemini</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
