import React, { useState, useMemo, useEffect } from 'react';
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
  ChevronDown,
  TrendingUp,
} from 'lucide-react';
import { StudentProfile, UserLearningPathItem } from '../types';
import { TARGET_ROLE_DEFINITIONS, STANDARD_PLACEMENT_ROADMAP } from '../data/mockDatabase';
import { REAL_WORLD_COURSES } from '../data/coursesDatabase';
import {
  getUserLearningPath,
  isCourseAssociatedWithSkill,
  COURSE_PROGRESS_UPDATED_EVENT,
} from '../utils/courseSkillService';
import { analyzeSkillGap } from '../utils/readinessCalculator';
import { EmptyStateBanner } from './EmptyStateBanner';
import { PlacementRadarChart } from './PlacementRadarChart';
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

  const [learningPath, setLearningPath] = useState<UserLearningPathItem[]>(() => getUserLearningPath());

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

  const gapAnalysis = analyzeSkillGap(profile, selectedRoleId);
  const activeRole = gapAnalysis.role;

  // Real-data skill gap analysis with course links and real progress
  const skillGapDetails = useMemo(() => {
    return activeRole.requiredSkills.map((reqSkillName) => {
      const studentSkill = (profile.skills || []).find(
        (s) =>
          s.name.toLowerCase() === reqSkillName.toLowerCase() ||
          reqSkillName.toLowerCase().includes(s.name.toLowerCase()) ||
          s.name.toLowerCase().includes(reqSkillName.toLowerCase())
      );

      const currentLevel = studentSkill ? studentSkill.level : 'Not Added';
      const targetLevel = 'Advanced';

      let currentVal = 0;
      if (currentLevel === 'Master') currentVal = 100;
      else if (currentLevel === 'Advanced') currentVal = 80;
      else if (currentLevel === 'Intermediate') currentVal = 55;
      else if (currentLevel === 'Beginner') currentVal = 30;

      const targetVal = 85;
      const gapPercent = Math.max(0, targetVal - currentVal);

      // Find real matching course
      const recommendedCourse =
        REAL_WORLD_COURSES.find((c) => isCourseAssociatedWithSkill(c, reqSkillName)) ||
        REAL_WORLD_COURSES[0];

      // Find real user progress
      const pathItem = learningPath.find(
        (item) =>
          item.courseId === recommendedCourse.id ||
          isCourseAssociatedWithSkill(item.courseId, reqSkillName)
      );

      let courseProgress = 0;
      let courseStatus = 'Not Started';
      if (pathItem) {
        courseProgress =
          pathItem.status === 'completed'
            ? 100
            : typeof pathItem.progressPercentage === 'number'
            ? pathItem.progressPercentage
            : 0;
        courseStatus = pathItem.status === 'completed' ? 'Completed' : 'In Progress';
      }

      return {
        skillName: reqSkillName,
        currentLevel,
        targetLevel,
        gapPercent,
        recommendedCourse,
        courseProgress,
        courseStatus,
        isAcquired: Boolean(studentSkill && (studentSkill.level === 'Advanced' || studentSkill.level === 'Master')),
      };
    });
  }, [activeRole, profile.skills, learningPath]);

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

      {/* Prominent Placement Readiness Radar Chart (Spider Chart) */}
      <PlacementRadarChart profile={profile} onNavigateToTab={onNavigate} />

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
              <div className="mt-3 pt-2.5 border-t border-rose-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <span className="text-[11px] text-rose-800 font-medium">
                  Bridge these gaps with industry-recognized courses
                </span>
                <button
                  onClick={() => onNavigate('courses')}
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer self-start sm:self-auto"
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

      {/* 5-Stage Visual Career Roadmap */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
              Visual Career Progression
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-semibold text-slate-900 flex items-center gap-2 leading-snug">
            <TrendingUp className="w-5 h-5 text-indigo-600" />
            <span>Career Roadmap Pipeline</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Systematic progression from your active baseline to verified industry readiness.
          </p>
        </div>

        {/* 5-Step Pipeline Flow */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 relative">
          {/* Step 1: Current Skills */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/80 flex flex-col justify-between space-y-2">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Step 1</span>
                <Code2 className="w-4 h-4 text-slate-600" />
              </div>
              <h3 className="font-bold text-sm text-slate-900 mt-1">Current Skills</h3>
              <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                {profile.skills?.length || 0} skills cataloged in profile
              </p>
            </div>
            <div className="pt-2 border-t border-slate-200 text-[11px] font-semibold text-slate-700">
              {gapAnalysis.matchedSkills.length} match target role
            </div>
          </div>

          {/* Step 2: Skill Gaps */}
          <div className="p-4 rounded-xl border border-rose-200 bg-rose-50/50 flex flex-col justify-between space-y-2">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600">Step 2</span>
                <AlertCircle className="w-4 h-4 text-rose-600" />
              </div>
              <h3 className="font-bold text-sm text-rose-950 mt-1">Skill Gaps</h3>
              <p className="text-xs text-rose-800 mt-0.5 leading-relaxed">
                {gapAnalysis.missingRequiredSkills.length} core competencies missing
              </p>
            </div>
            <div className="pt-2 border-t border-rose-200 text-[11px] font-semibold text-rose-700">
              {100 - gapAnalysis.matchPercentage}% gap to target
            </div>
          </div>

          {/* Step 3: Recommended Learning */}
          <div className="p-4 rounded-xl border border-indigo-200 bg-indigo-50/50 flex flex-col justify-between space-y-2">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">Step 3</span>
                <BookOpen className="w-4 h-4 text-indigo-600" />
              </div>
              <h3 className="font-bold text-sm text-indigo-950 mt-1">Recommended Learning</h3>
              <p className="text-xs text-indigo-800 mt-0.5 leading-relaxed">
                {skillGapDetails.length} mapped industry certifications
              </p>
            </div>
            <div className="pt-2 border-t border-indigo-200 text-[11px] font-semibold text-indigo-700">
              Curated syllabus
            </div>
          </div>

          {/* Step 4: Skill Progress */}
          <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/50 flex flex-col justify-between space-y-2">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700">Step 4</span>
                <Sparkles className="w-4 h-4 text-amber-600" />
              </div>
              <h3 className="font-bold text-sm text-amber-950 mt-1">Skill Progress</h3>
              <p className="text-xs text-amber-800 mt-0.5 leading-relaxed">
                {learningPath.filter((i) => i.status === 'in-progress' || (i as any).status === 'active').length} active courses ongoing
              </p>
            </div>
            <div className="pt-2 border-t border-amber-200 text-[11px] font-semibold text-amber-700">
              Live progress tracking
            </div>
          </div>

          {/* Step 5: Career Ready */}
          <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50 flex flex-col justify-between space-y-2">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">Step 5</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>
              <h3 className="font-bold text-sm text-emerald-950 mt-1">Career Ready</h3>
              <p className="text-xs text-emerald-800 mt-0.5 leading-relaxed">
                Verified portfolio &amp; interview-ready status
              </p>
            </div>
            <div className="pt-2 border-t border-emerald-200 text-[11px] font-semibold text-emerald-700">
              Placement eligible
            </div>
          </div>
        </div>

        {/* Detailed Skill Gap Cards (Current Level / Target Level / Gap / Course / Progress) */}
        <div className="pt-4 border-t border-slate-100 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Core Skill Gaps for {activeRole.title}
              </h3>
              <p className="text-xs text-slate-500">
                Verified level analysis, target requirements, and connected learning modules with real progress.
              </p>
            </div>
            <button
              onClick={() => onNavigate('courses')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg text-xs font-bold transition-colors cursor-pointer self-start sm:self-auto"
            >
              <Award className="w-3.5 h-3.5" />
              <span>Browse All Courses</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {skillGapDetails.map((gap, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-xl border transition-all ${
                  gap.isAcquired
                    ? 'bg-emerald-50/30 border-emerald-200'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900">{gap.skillName}</span>
                    {gap.isAcquired ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                        Acquired
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                        Gap: {gap.gapPercent}%
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-slate-400 font-medium">
                    Target: <strong className="text-slate-700">{gap.targetLevel}</strong>
                  </span>
                </div>

                {/* Level Comparison Bar */}
                <div className="grid grid-cols-3 gap-2 py-2 px-3 bg-slate-50 rounded-lg text-xs mb-3 border border-slate-100">
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-slate-400 block">Current</span>
                    <span className="font-bold text-slate-800">{gap.currentLevel}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-slate-400 block">Target</span>
                    <span className="font-bold text-slate-800">{gap.targetLevel}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-slate-400 block">Gap</span>
                    <span className={`font-bold ${gap.gapPercent > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                      {gap.gapPercent}%
                    </span>
                  </div>
                </div>

                {/* Connected Course & Real Progress */}
                <div className="pt-2 border-t border-slate-100 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-indigo-600 block">
                        Recommended Course
                      </span>
                      <span className="text-xs font-semibold text-slate-800 block">
                        {gap.recommendedCourse.title}
                      </span>
                      <span className="text-[11px] text-slate-500">
                        {gap.recommendedCourse.provider} • {gap.recommendedCourse.duration}
                      </span>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-[10px] uppercase font-bold text-slate-500 block">
                        Progress
                      </span>
                      <span className="text-xs font-bold text-indigo-700">
                        {gap.courseProgress}%
                      </span>
                    </div>
                  </div>

                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        gap.courseProgress >= 100
                          ? 'bg-emerald-600'
                          : gap.courseProgress > 0
                          ? 'bg-indigo-600'
                          : 'bg-slate-300'
                      }`}
                      style={{ width: `${gap.courseProgress}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[10px] text-slate-500 font-medium">
                      Status: <strong className="text-slate-700">{gap.courseStatus}</strong>
                    </span>
                    <button
                      onClick={() => onNavigate('courses')}
                      className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-800 cursor-pointer"
                    >
                      <span>{gap.courseProgress > 0 ? 'Continue Learning' : 'Start Course'}</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
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
