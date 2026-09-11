import React, { useState } from 'react';
import {
  GitBranch,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  BookOpen,
  Calendar,
  Layers,
  Code2,
  Bot,
  Award,
} from 'lucide-react';
import { StudentProfile } from '../types';
import { TARGET_ROLE_DEFINITIONS, STANDARD_PLACEMENT_ROADMAP } from '../data/mockDatabase';
import { analyzeSkillGap } from '../utils/readinessCalculator';
import { EmptyStateBanner } from './EmptyStateBanner';
import { NavTab } from './Navbar';

interface SkillGapViewProps {
  profile: StudentProfile;
  isProfileEmpty: boolean;
  onNavigate: (tab: NavTab) => void;
  onLoadDemo: () => void;
  onAskCounselorWithPrompt?: (prompt: string) => void;
}

export const SkillGapView: React.FC<SkillGapViewProps> = ({
  profile,
  isProfileEmpty,
  onNavigate,
  onLoadDemo,
  onAskCounselorWithPrompt,
}) => {
  const [selectedRoleId, setSelectedRoleId] = useState<string>(
    TARGET_ROLE_DEFINITIONS[0].id
  );

  const gapAnalysis = analyzeSkillGap(profile, selectedRoleId);
  const activeRole = gapAnalysis.role;

  const handleAskMentorAboutGap = () => {
    const missingList = gapAnalysis.missingRequiredSkills.join(', ') || 'DSA & System Design';
    const prompt = `I am preparing for the "${activeRole.title}" role. My current skill match is ${gapAnalysis.matchPercentage}%. I am missing the following required skills: ${missingList}. Can you create a step-by-step 30-day study plan to master these and crack technical interviews?`;
    if (onAskCounselorWithPrompt) {
      onAskCounselorWithPrompt(prompt);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-[21px] font-semibold text-slate-900 tracking-normal leading-[1.2] flex items-center gap-2.5">
            <GitBranch className="w-6 h-6 text-indigo-600" />
            <span>Target Role Skill Gap Analyzer &amp; Roadmap</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Compare your current skillset with industry standards for top engineering roles to reveal missing skills and concrete learning timelines.
          </p>
        </div>

        <button
          onClick={handleAskMentorAboutGap}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-bold rounded-lg transition-colors cursor-pointer self-start md:self-auto"
        >
          <Bot className="w-4 h-4 text-indigo-600" />
          <span>Ask AI Mentor to Bridge Gap</span>
        </button>
      </div>

      {isProfileEmpty && (
        <EmptyStateBanner
          onGoToProfile={() => onNavigate('profile')}
          onLoadDemo={onLoadDemo}
          title="Skills Not Yet Registered"
          description="Because no skills have been added to your profile yet, the skill match currently reads 0%. Enter your technical proficiencies in the Student Profile tab or load sample data."
        />
      )}

      {/* Role Selection Horizontal Tabs */}
      <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs flex items-center gap-2 overflow-x-auto">
        <span className="text-xs font-bold text-slate-500 pl-2 shrink-0">Role:</span>
        {TARGET_ROLE_DEFINITIONS.map((role) => {
          const isSelected = role.id === selectedRoleId;
          return (
            <button
              key={role.id}
              onClick={() => setSelectedRoleId(role.id)}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                isSelected
                  ? 'bg-indigo-600 text-white shadow-xs font-bold'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {role.title}
            </button>
          );
        })}
      </div>

      {/* Role Overview & Match Progress */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-8">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                Benchmark Assessment
              </span>
              <span className="text-xs text-slate-400 font-medium">
                Fresher CTC: {activeRole.avgPackage}
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-semibold text-slate-900 tracking-normal leading-snug">
              {activeRole.title}
            </h2>
            <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
              {activeRole.description}
            </p>
          </div>

          <div className="lg:col-span-4 bg-slate-50 border border-slate-200 rounded-xl p-4 text-center">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1">
              Skill Alignment
            </span>
            <div className="text-4xl font-semibold text-slate-900 tracking-tight my-1">
              {gapAnalysis.matchPercentage}%
            </div>
            <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden my-2">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  gapAnalysis.matchPercentage >= 70
                    ? 'bg-emerald-600'
                    : gapAnalysis.matchPercentage >= 40
                    ? 'bg-amber-500'
                    : 'bg-rose-500'
                }`}
                style={{ width: `${gapAnalysis.matchPercentage}%` }}
              />
            </div>
            <span className="text-[11px] text-slate-500">
              {gapAnalysis.matchedSkills.length} of {activeRole.requiredSkills.length} core requirements verified
            </span>
          </div>
        </div>

        {/* Breakdown of Skills */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-6 border-t border-slate-100">
          {/* Matched Skills */}
          <div className="p-4 bg-emerald-50/50 border border-emerald-200 rounded-xl">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-emerald-900 uppercase">
                Acquired Skills ({gapAnalysis.matchedSkills.length})
              </span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            {gapAnalysis.matchedSkills.length === 0 ? (
              <p className="text-xs text-emerald-700 italic">No matching skills detected in profile.</p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {gapAnalysis.matchedSkills.map((sk) => (
                  <span
                    key={sk}
                    className="px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-100/80 text-emerald-900 border border-emerald-300"
                  >
                    ✓ {sk}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Missing Required Skills */}
          <div className="p-4 bg-rose-50/50 border border-rose-200 rounded-xl">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-rose-900 uppercase">
                Missing Core Skills ({gapAnalysis.missingRequiredSkills.length})
              </span>
              <AlertCircle className="w-4 h-4 text-rose-600" />
            </div>
            {gapAnalysis.missingRequiredSkills.length === 0 ? (
              <p className="text-xs text-emerald-700 font-medium">
                Awesome! You possess all primary baseline requirements for this role.
              </p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {gapAnalysis.missingRequiredSkills.map((sk) => (
                  <span
                    key={sk}
                    className="px-2.5 py-1 rounded-md text-xs font-semibold bg-rose-100/80 text-rose-900 border border-rose-300"
                  >
                    + {sk}
                  </span>
                ))}
              </div>
            )}

            {gapAnalysis.missingRequiredSkills.length > 0 && (
              <div className="mt-3 pt-2.5 border-t border-rose-200/80 flex items-center justify-between">
                <span className="text-[11px] text-rose-800 font-medium">
                  Bridge these gaps with industry-recognized courses
                </span>
                <button
                  onClick={() => onNavigate('courses')}
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
                >
                  <Award className="w-3.5 h-3.5" />
                  <span>View Recommended Courses</span>
                </button>
              </div>
            )}
          </div>

          {/* Missing Optional / Good to Have */}
          <div className="p-4 bg-blue-50/50 border border-blue-200 rounded-xl">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-blue-900 uppercase">
                Good to Have ({gapAnalysis.missingGoodToHaveSkills.length})
              </span>
              <Sparkles className="w-4 h-4 text-blue-600" />
            </div>
            <div className="flex flex-wrap gap-1.5">
              {gapAnalysis.missingGoodToHaveSkills.map((sk) => (
                <span
                  key={sk}
                  className="px-2.5 py-1 rounded-md text-xs font-semibold bg-blue-100/80 text-blue-900 border border-blue-200"
                >
                  {sk}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 4-Phase Learning & Placement Roadmap */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-semibold text-slate-900 flex items-center gap-2 leading-snug">
              <Calendar className="w-5 h-5 text-indigo-600" />
              <span>Tailored 4-Phase Preparation Roadmap</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Structured path to bridge your skill gap and become placement-ready for {activeRole.title}.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {STANDARD_PLACEMENT_ROADMAP.map((milestone, idx) => (
            <div
              key={idx}
              className="bg-slate-50/80 border border-slate-200 rounded-xl p-4 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-100/80 px-2 py-0.5 rounded-sm">
                    {milestone.duration}
                  </span>
                  <span className="text-xs font-semibold text-slate-400">0{idx + 1}</span>
                </div>

                <span className="text-[11px] font-bold text-slate-500 block mb-0.5">
                  {milestone.phase}
                </span>
                <h3 className="text-sm sm:text-base font-semibold text-slate-900 tracking-normal mb-2 leading-snug">
                  {milestone.title}
                </h3>

                <div className="space-y-1 my-2.5">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    Core Focus Topics:
                  </span>
                  <ul className="space-y-1">
                    {milestone.keyTopics.slice(0, 3).map((t, i) => (
                      <li
                        key={i}
                        className="text-[11px] text-slate-700 leading-tight flex items-start gap-1.5"
                      >
                        <span className="w-1 h-1 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                        <span>{t}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="pt-2.5 border-t border-slate-200/80 mt-2.5">
                <span className="text-[10px] uppercase font-bold text-slate-500 block mb-0.5">
                  Key Deliverable:
                </span>
                <p className="text-[11px] font-semibold text-slate-800 leading-snug">
                  {milestone.deliverables[0]}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
