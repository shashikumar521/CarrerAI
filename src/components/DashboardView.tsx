import React from 'react';
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
} from 'lucide-react';
import { StudentProfile, PlacementReadinessReport, EligibilityResult, AuthUser } from '../types';
import { EmptyStateBanner } from './EmptyStateBanner';
import { NavTab } from './Navbar';

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
  const eligibleCount = isAssessed ? eligibilityResults.filter((r) => r.status === 'eligible').length : 0;
  const borderlineCount = isAssessed ? eligibilityResults.filter((r) => r.status === 'borderline').length : 0;
  const ineligibleCount = isAssessed ? eligibilityResults.filter((r) => r.status === 'ineligible').length : 0;

  const cgpaValue = Number(profile.cgpa) || 0;
  const backlogsCount = Number(profile.activeBacklogs) || 0;

  return (
    <div className="space-y-8">
      {/* Empty State Banner if student has not submitted assessment */}
      {!isAssessed && (
        <EmptyStateBanner
          onGoToProfile={() => onNavigate('profile')}
          onLoadDemo={onLoadDemo}
          title="Complete your profile to unlock your personalized career analysis."
          description="CareerAI evaluates your real engineering academic metrics (CGPA, Branch, Backlogs, Skills, and Projects) to calculate placement readiness, check company cutoffs, and pinpoint skill gaps. Submit your student assessment to unlock your personalized dashboard."
        />
      )}

      {/* Main Hero Summary Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Readiness Score Card */}
        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Placement Readiness
              </span>
              <span
                className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                  report.grade === 'Placement Ready'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : report.grade === 'Near Ready'
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : report.grade === 'Developing'
                    ? 'bg-amber-50 text-amber-700 border border-amber-200'
                    : 'bg-slate-100 text-slate-600 border border-slate-200'
                }`}
              >
                {!isAssessed ? 'Empty Profile' : report.grade}
              </span>
            </div>

            <div className="flex items-baseline gap-3 my-2">
              <span className="text-5xl font-black text-slate-900 tracking-tight">
                {!isAssessed ? '0' : report.overallScore}
              </span>
              <span className="text-lg font-bold text-slate-400">/ 100</span>
            </div>

            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              {!isAssessed
                ? 'Score is 0 because no student assessment has been submitted yet. Enter your academic details to calculate real readiness.'
                : `Calculated from CGPA (${cgpaValue || 'N/A'}), ${backlogsCount} backlog(s), ${
                    profile.skills?.length || 0
                  } skills, and ${profile.projects?.length || 0} projects.`}
            </p>
          </div>

          {/* Sub Score Progress Bars */}
          <div className="space-y-3 pt-6 border-t border-slate-100 mt-6">
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-600">Academics & Backlogs</span>
                <span className="text-slate-900 font-bold">{isAssessed ? report.academicScore : 0}/25</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                  style={{ width: `${isAssessed ? (report.academicScore / 25) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-600">Technical Skills Depth</span>
                <span className="text-slate-900 font-bold">{isAssessed ? report.skillsScore : 0}/30</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-600 rounded-full transition-all duration-500"
                  style={{ width: `${isAssessed ? (report.skillsScore / 30) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-600">Engineering Projects</span>
                <span className="text-slate-900 font-bold">{isAssessed ? report.projectsScore : 0}/25</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full transition-all duration-500"
                  style={{ width: `${isAssessed ? (report.projectsScore / 25) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-600">Experience & Certifications</span>
                <span className="text-slate-900 font-bold">{isAssessed ? report.experienceScore : 0}/20</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-purple-600 rounded-full transition-all duration-500"
                  style={{ width: `${isAssessed ? (report.experienceScore / 20) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Center/Right: Quick Metrics & Placement Diagnostic */}
        <div className="lg:col-span-8 space-y-6">
          {/* Key Metrics Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
              <span className="text-xs font-semibold text-slate-500 block mb-1">B.Tech CGPA</span>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black text-slate-900">
                  {isAssessed && profile.cgpa ? Number(profile.cgpa).toFixed(2) : '—'}
                </span>
                <span className="text-xs text-slate-400">/ 10</span>
              </div>
              <span className="text-[11px] text-slate-500 mt-1 block truncate">
                {isAssessed && profile.branch ? profile.branch : 'Branch not set'}
              </span>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
              <span className="text-xs font-semibold text-slate-500 block mb-1">Active Backlogs</span>
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
                className={`text-[11px] font-medium mt-1 block ${
                  !isAssessed
                    ? 'text-slate-400'
                    : backlogsCount > 0
                    ? 'text-rose-600 font-semibold'
                    : 'text-emerald-600'
                }`}
              >
                {!isAssessed
                  ? 'No assessment submitted'
                  : backlogsCount === 0
                  ? '0 Active Backlogs (Clean)'
                  : `${backlogsCount} require clearance`}
              </span>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
              <span className="text-xs font-semibold text-slate-500 block mb-1">Technical Skills</span>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black text-slate-900">
                  {isAssessed ? profile.skills?.length || 0 : '—'}
                </span>
              </div>
              <span className="text-[11px] text-slate-500 mt-1 block">
                {isAssessed
                  ? `${profile.skills?.filter((s) => s.level === 'Advanced').length || 0} Advanced level`
                  : 'Pending assessment'}
              </span>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
              <span className="text-xs font-semibold text-slate-500 block mb-1">Live Projects</span>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black text-slate-900">
                  {isAssessed ? profile.projects?.length || 0 : '—'}
                </span>
              </div>
              <span className="text-[11px] text-slate-500 mt-1 block">
                {isAssessed
                  ? `${profile.projects?.filter((p) => p.githubUrl).length || 0} with GitHub`
                  : 'Pending assessment'}
              </span>
            </div>
          </div>

          {/* Company Eligibility Snapshot */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-indigo-600" />
                  <span>Campus Placement Eligibility Radar</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Screened across 30+ top Product, High-Growth, and Mass recruiters.
                </p>
              </div>

              <button
                onClick={() => onNavigate('eligibility')}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors cursor-pointer self-start sm:self-auto"
              >
                <span>View All 30 Companies</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {!isAssessed ? (
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 text-center">
                <Info className="w-6 h-6 text-slate-400 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-700">No Academic Criteria to Evaluate</p>
                <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                  Once you submit your student assessment, we automatically compute your eligibility across Google, Microsoft, Amazon, TCS, Infosys, and more.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-800 uppercase">Eligible</span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="text-3xl font-black text-emerald-900 my-1">{eligibleCount}</div>
                  <p className="text-xs text-emerald-700">
                    You meet all CGPA, backlog, and percentage criteria.
                  </p>
                </div>

                <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-800 uppercase">Borderline</span>
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                  </div>
                  <div className="text-3xl font-black text-amber-900 my-1">{borderlineCount}</div>
                  <p className="text-xs text-amber-700">
                    Within 0.3 CGPA of qualifying for recruitment rounds.
                  </p>
                </div>

                <div className="bg-rose-50/70 border border-rose-200 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-rose-800 uppercase">Cutoff Gap</span>
                    <TrendingUp className="w-4 h-4 text-rose-600" />
                  </div>
                  <div className="text-3xl font-black text-rose-900 my-1">{ineligibleCount}</div>
                  <p className="text-xs text-rose-700">
                    Missed criteria due to CGPA, branch, or active backlogs.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Diagnostic Strengths & Critical Gaps */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Critical Placement Gaps */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            <span>Placement Obstacles & Critical Gaps</span>
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
                  className="flex items-start gap-2.5 text-xs text-slate-700 bg-amber-50/50 border border-amber-100 rounded-lg p-3"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                  <span className="leading-relaxed">{gap}</span>
                </li>
              ))}
            </ul>
          )}

          {/* Immediate Action Steps */}
          {isAssessed && report.immediateSteps.length > 0 && (
            <div className="mt-5 pt-5 border-t border-slate-100">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-2.5">
                Recommended Immediate Next Steps
              </span>
              <div className="space-y-2">
                {report.immediateSteps.map((step, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs text-slate-600">
                    <span className="font-bold text-indigo-600">{idx + 1}.</span>
                    <span>{step}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Profile Strengths & Competitive Edge */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 mb-4">
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
                    className="flex items-start gap-2.5 text-xs text-slate-700 bg-emerald-50/50 border border-emerald-100 rounded-lg p-3"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{str}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Quick Action Navigation Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6 pt-6 border-t border-slate-100">
            <button
              onClick={() => onNavigate('jobs')}
              className="flex items-center justify-between p-3 rounded-xl bg-indigo-50/70 hover:bg-indigo-100/60 border border-indigo-200 text-left transition-colors cursor-pointer"
            >
              <div>
                <span className="text-xs font-bold text-indigo-950 block">Live Job Discovery</span>
                <span className="text-[11px] text-indigo-600">Real verified tech jobs</span>
              </div>
              <Briefcase className="w-4 h-4 text-indigo-600" />
            </button>

            <button
              onClick={() => onNavigate('skillgap')}
              className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-left transition-colors cursor-pointer"
            >
              <div>
                <span className="text-xs font-bold text-slate-900 block">Skill Gap Analysis</span>
                <span className="text-[11px] text-slate-500">Compare with target role</span>
              </div>
              <GitBranch className="w-4 h-4 text-indigo-600" />
            </button>

            <button
              onClick={() => onNavigate('counselor')}
              className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-left transition-colors cursor-pointer"
            >
              <div>
                <span className="text-xs font-bold text-slate-900 block">AI Career Counselor</span>
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
