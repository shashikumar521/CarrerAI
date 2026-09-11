import React, { useState, useMemo, useEffect } from 'react';
import {
  Award,
  BookOpen,
  ExternalLink,
  CheckCircle2,
  Clock,
  Sparkles,
  Filter,
  Search,
  Bookmark,
  BookmarkCheck,
  Calendar,
  ArrowRight,
  ChevronRight,
  Layers,
  ShieldCheck,
  Cpu,
  Cloud,
  Database,
  Code,
  Flame,
  FolderGit2,
  Check,
  Plus,
  Trash2,
  HelpCircle,
  TrendingUp,
  BarChart3,
  RotateCcw,
  Zap,
  Tag,
  AlertCircle,
} from 'lucide-react';
import {
  StudentProfile,
  CourseRecommendation,
  RealWorldProject,
  CourseProvider,
  CourseCategory,
  CourseDifficulty,
  LearningPathStage,
  UserLearningPathItem,
} from '../types';
import {
  REAL_WORLD_COURSES,
  REAL_WORLD_PROJECTS,
  LEARNING_PATH_STORAGE_KEY,
  getRecommendedCoursesForProfile,
  calculateLearningProgressMetrics,
} from '../data/coursesDatabase';
import { TARGET_ROLE_DEFINITIONS as TARGET_ROLES } from '../data/mockDatabase';
import { COURSE_PROGRESS_UPDATED_EVENT } from '../utils/courseSkillService';

interface CoursesViewProps {
  profile: StudentProfile;
  isProfileEmpty: boolean;
  onNavigateToTab?: (tab: any) => void;
  onLoadDemoProfile?: () => void;
  onSelectCourseForLearningPath?: (courseId: string) => void;
}

type CourseTab =
  | 'recommended'
  | 'learning-path'
  | 'skill-gaps'
  | 'certifications'
  | 'projects'
  | 'free'
  | 'hands-on';

export const CoursesView: React.FC<CoursesViewProps> = ({
  profile,
  isProfileEmpty,
  onNavigateToTab,
  onLoadDemoProfile,
}) => {
  // Navigation / sub-tab state
  const [activeTab, setActiveTab] = useState<CourseTab>('recommended');

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProvider, setSelectedProvider] = useState<string>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('All');
  const [selectedCost, setSelectedCost] = useState<string>('All');
  const [onlyCertifications, setOnlyCertifications] = useState(false);
  const [onlyHandsOn, setOnlyHandsOn] = useState(false);
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>(
    profile.targetRoles?.[0] || 'Software Development Engineer (SDE)'
  );

  // My Learning Path stored state
  const [learningPath, setLearningPath] = useState<UserLearningPathItem[]>(() => {
    try {
      const saved = localStorage.getItem(LEARNING_PATH_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Failed to parse learning path from storage', e);
    }
    // Default seed items if empty to help students immediately get started
    return [
      {
        courseId: 'aws-cloud-practitioner',
        status: 'in-progress',
        savedAt: new Date().toISOString(),
        targetCompletionDate: '2026-10-15',
        orderIndex: 0,
      },
      {
        courseId: 'cisco-python-essentials',
        status: 'completed',
        savedAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
        certificateCredentialId: 'OPENEDG-PY-88210',
        orderIndex: 1,
      },
    ];
  });

  // Target date editing modal/state
  const [editingTargetDateId, setEditingTargetDateId] = useState<string | null>(null);
  const [newTargetDate, setNewTargetDate] = useState<string>('');
  const [editingCredentialId, setEditingCredentialId] = useState<string | null>(null);
  const [newCredentialText, setNewCredentialText] = useState<string>('');

  // Save learning path updates to localStorage and notify global listeners
  useEffect(() => {
    try {
      localStorage.setItem(LEARNING_PATH_STORAGE_KEY, JSON.stringify(learningPath));
      window.dispatchEvent(
        new CustomEvent(COURSE_PROGRESS_UPDATED_EVENT, { detail: learningPath })
      );
    } catch (e) {
      console.warn('Failed to save learning path to storage', e);
    }
  }, [learningPath]);

  // Synchronize if learning path updated elsewhere (e.g. Dashboard modal)
  useEffect(() => {
    const handleExternalUpdate = () => {
      try {
        const saved = localStorage.getItem(LEARNING_PATH_STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            setLearningPath(parsed);
          }
        }
      } catch (e) {
        console.warn(e);
      }
    };

    window.addEventListener('storage', handleExternalUpdate);
    return () => {
      window.removeEventListener('storage', handleExternalUpdate);
    };
  }, []);

  const handleUpdateCourseProgress = (courseId: string, newPercent: number) => {
    const clamped = Math.max(0, Math.min(100, Math.round(newPercent)));
    setLearningPath((prev) =>
      prev.map((item) => {
        if (item.courseId === courseId) {
          return {
            ...item,
            progressPercentage: clamped,
            status: clamped >= 100 ? 'completed' : 'in-progress',
            completedAt: clamped >= 100 ? new Date().toISOString() : item.completedAt,
          };
        }
        return item;
      })
    );
  };

  // Providers list
  const providers: CourseProvider[] = [
    'AWS Skill Builder',
    'Cisco Networking Academy',
    'Oracle University',
    'Microsoft Learn',
    'Google Cloud',
    'IBM SkillsBuild',
    'NVIDIA',
  ];

  // Categories list
  const categories: CourseCategory[] = [
    'Cloud Computing',
    'Artificial Intelligence & ML',
    'Cybersecurity',
    'Data Science & Analytics',
    'Software Engineering & DevOps',
    'Databases & Infrastructure',
    'Networking & Systems',
  ];

  // User's active skills and target role definition
  const userSkillNames = useMemo(
    () => (profile.skills || []).map((s) => s.name.toLowerCase()),
    [profile.skills]
  );

  const activeTargetRoleDef = useMemo(() => {
    return (
      TARGET_ROLES.find(
        (r) => r.title.toLowerCase() === selectedRoleFilter.toLowerCase()
      ) || TARGET_ROLES[0]
    );
  }, [selectedRoleFilter]);

  // Missing skills for the selected target role
  const roleSkillAnalysis = useMemo(() => {
    const required = activeTargetRoleDef.requiredSkills || [];
    const matched: string[] = [];
    const missing: string[] = [];

    required.forEach((reqSkill) => {
      const isMatched = userSkillNames.some(
        (us) => us.includes(reqSkill.toLowerCase()) || reqSkill.toLowerCase().includes(us)
      );
      if (isMatched) {
        matched.push(reqSkill);
      } else {
        missing.push(reqSkill);
      }
    });

    // Match recommended courses to close the missing skills
    const coursesToCloseGaps = REAL_WORLD_COURSES.filter((c) =>
      c.skillsGained.some((sg) =>
        missing.some(
          (ms) => sg.toLowerCase().includes(ms.toLowerCase()) || ms.toLowerCase().includes(sg.toLowerCase())
        )
      )
    );

    return {
      matched,
      missing,
      coursesToCloseGaps,
      matchPercentage:
        required.length > 0
          ? Math.round((matched.length / required.length) * 100)
          : 0,
    };
  }, [activeTargetRoleDef, userSkillNames]);

  // Learning progress statistics
  const completedCourseIds = useMemo(
    () =>
      learningPath
        .filter((item) => item.status === 'completed')
        .map((item) => item.courseId),
    [learningPath]
  );

  const learningMetrics = useMemo(
    () => calculateLearningProgressMetrics(completedCourseIds),
    [completedCourseIds]
  );

  // Scored and filtered courses list
  const processedCourses = useMemo(() => {
    let list = getRecommendedCoursesForProfile(
      profile,
      selectedProvider,
      selectedCategory,
      selectedDifficulty,
      selectedCost,
      searchQuery
    );

    if (onlyCertifications) {
      list = list.filter((item) => item.course.certificationAvailable);
    }
    if (onlyHandsOn) {
      list = list.filter((item) => item.course.handsOn);
    }

    if (activeTab === 'free') {
      list = list.filter((item) => item.course.costType === 'Free');
    } else if (activeTab === 'hands-on') {
      list = list.filter((item) => item.course.handsOn);
    } else if (activeTab === 'certifications') {
      list = list.filter((item) => item.course.certificationAvailable);
    }

    return list;
  }, [
    profile,
    selectedProvider,
    selectedCategory,
    selectedDifficulty,
    selectedCost,
    searchQuery,
    onlyCertifications,
    onlyHandsOn,
    activeTab,
  ]);

  // Learning Path Courses organized by stages
  const learningPathDetails = useMemo(() => {
    return learningPath
      .map((item) => {
        const course = REAL_WORLD_COURSES.find((c) => c.id === item.courseId);
        return {
          ...item,
          course,
        };
      })
      .filter((item): item is typeof item & { course: CourseRecommendation } => Boolean(item.course))
      .sort((a, b) => a.orderIndex - b.orderIndex);
  }, [learningPath]);

  // Stage grouped learning path items
  const stageGroups: Record<LearningPathStage, typeof learningPathDetails> = useMemo(() => {
    const groups: Record<LearningPathStage, typeof learningPathDetails> = {
      'START HERE': [],
      'FOUNDATION': [],
      'INTERMEDIATE': [],
      'ADVANCED': [],
      'CERTIFICATION': [],
      'REAL-WORLD PROJECT': [],
      'JOB READY': [],
    };

    learningPathDetails.forEach((item) => {
      const stage = item.course.levelOrder || 'FOUNDATION';
      if (groups[stage]) {
        groups[stage].push(item);
      } else {
        groups['FOUNDATION'].push(item);
      }
    });

    return groups;
  }, [learningPathDetails]);

  // Learning path actions
  const handleToggleSaveCourse = (courseId: string) => {
    setLearningPath((prev) => {
      const exists = prev.some((i) => i.courseId === courseId);
      if (exists) {
        return prev.filter((i) => i.courseId !== courseId);
      } else {
        const newItem: UserLearningPathItem = {
          courseId,
          status: 'in-progress',
          savedAt: new Date().toISOString(),
          orderIndex: prev.length,
        };
        return [...prev, newItem];
      }
    });
  };

  const handleUpdateStatus = (
    courseId: string,
    status: 'not-started' | 'in-progress' | 'completed'
  ) => {
    setLearningPath((prev) =>
      prev.map((item) => {
        if (item.courseId === courseId) {
          return {
            ...item,
            status,
            completedAt: status === 'completed' ? new Date().toISOString() : undefined,
          };
        }
        return item;
      })
    );
  };

  const handleSaveTargetDate = (courseId: string) => {
    setLearningPath((prev) =>
      prev.map((item) => {
        if (item.courseId === courseId) {
          return {
            ...item,
            targetCompletionDate: newTargetDate || undefined,
          };
        }
        return item;
      })
    );
    setEditingTargetDateId(null);
    setNewTargetDate('');
  };

  const handleSaveCredentialId = (courseId: string) => {
    setLearningPath((prev) =>
      prev.map((item) => {
        if (item.courseId === courseId) {
          return {
            ...item,
            certificateCredentialId: newCredentialText || undefined,
          };
        }
        return item;
      })
    );
    setEditingCredentialId(null);
    setNewCredentialText('');
  };

  const isCourseInPath = (courseId: string) =>
    learningPath.some((i) => i.courseId === courseId);

  const getCourseStatusInPath = (courseId: string) =>
    learningPath.find((i) => i.courseId === courseId)?.status;

  // Provider badge colors
  const getProviderBadgeStyle = (provider: CourseProvider) => {
    switch (provider) {
      case 'AWS Skill Builder':
        return 'bg-amber-50 text-amber-800 border-amber-300';
      case 'Cisco Networking Academy':
        return 'bg-sky-50 text-sky-800 border-sky-300';
      case 'Oracle University':
        return 'bg-rose-50 text-rose-800 border-rose-300';
      case 'Microsoft Learn':
        return 'bg-blue-50 text-blue-800 border-blue-300';
      case 'Google Cloud':
        return 'bg-indigo-50 text-indigo-800 border-indigo-300';
      case 'IBM SkillsBuild':
        return 'bg-slate-100 text-slate-800 border-slate-300';
      case 'NVIDIA':
        return 'bg-emerald-50 text-emerald-800 border-emerald-300';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-300';
    }
  };

  return (
    <div className="space-y-8">
      {/* Header & Mission Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-slate-100 pb-6">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                <Award className="w-3.5 h-3.5 text-indigo-600" />
                Industry Recommendations
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                7 Official Global Tech Providers
              </span>
              {learningMetrics.totalCompleted > 0 && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                  <Zap className="w-3 h-3 text-amber-600" />
                  +{learningMetrics.scoreBonus} Readiness Score Boost Active
                </span>
              )}
            </div>

            <h1 className="text-[21px] font-semibold text-slate-900 tracking-normal leading-[1.2]">
              Recommended Courses &amp; Certifications
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 max-w-3xl leading-relaxed">
              Curated, verified credentials from AWS, Cisco, Oracle, Microsoft, Google Cloud, IBM, and NVIDIA.
              Ranked dynamically by your B.Tech branch, current skills, and target engineering job roles.
            </p>
          </div>

          {/* Quick Metrics Bar */}
          <div className="flex items-center gap-3 shrink-0 bg-slate-50 border border-slate-200 p-3 rounded-xl">
            <div className="text-center px-2">
              <div className="text-lg font-semibold text-slate-900">
                {learningPath.length}
              </div>
              <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                In Learning Path
              </div>
            </div>
            <div className="h-8 w-px bg-slate-200" />
            <div className="text-center px-2">
              <div className="text-lg font-semibold text-emerald-600">
                {learningMetrics.totalCompleted}
              </div>
              <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                Certificates
              </div>
            </div>
            <div className="h-8 w-px bg-slate-200" />
            <div className="text-center px-2">
              <div className="text-lg font-semibold text-indigo-600">
                {learningMetrics.acquiredSkillsCount}
              </div>
              <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                Skills Gained
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Sub-Tabs */}
        <div className="mt-6 flex flex-wrap gap-2 text-xs font-bold">
          <button
            onClick={() => setActiveTab('recommended')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all cursor-pointer ${
              activeTab === 'recommended'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Recommended For You</span>
            <span className="ml-1 px-1.5 py-0.2 rounded-full bg-white/20 text-[10px]">
              {processedCourses.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('learning-path')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all cursor-pointer ${
              activeTab === 'learning-path'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <BookmarkCheck className="w-3.5 h-3.5" />
            <span>My Learning Path</span>
            {learningPath.length > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full bg-emerald-500 text-white text-[10px]">
                {learningPath.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('skill-gaps')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all cursor-pointer ${
              activeTab === 'skill-gaps'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Close Your Skill Gaps</span>
            {roleSkillAnalysis.missing.length > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full bg-amber-500 text-white text-[10px]">
                {roleSkillAnalysis.missing.length} Gaps
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('projects')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all cursor-pointer ${
              activeTab === 'projects'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <FolderGit2 className="w-3.5 h-3.5" />
            <span>Real-World Projects</span>
            <span className="ml-1 px-1.5 py-0.2 rounded-full bg-indigo-500 text-white text-[10px]">
              {REAL_WORLD_PROJECTS.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('certifications')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all cursor-pointer ${
              activeTab === 'certifications'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>Industry Certifications</span>
          </button>

          <button
            onClick={() => setActiveTab('free')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all cursor-pointer ${
              activeTab === 'free'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-emerald-500" />
            <span>100% Free Courses</span>
          </button>

          <button
            onClick={() => setActiveTab('hands-on')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all cursor-pointer ${
              activeTab === 'hands-on'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            <span>Hands-on Learning</span>
          </button>
        </div>
      </div>

      {/* Empty Profile Prompt Notice */}
      {isProfileEmpty && (
        <div className="bg-amber-50 border border-amber-300 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold text-amber-950">
                Personalize Course Recommendations with Your Profile
              </h4>
              <p className="text-xs text-amber-800 mt-0.5 leading-relaxed">
                Add your technical skills and target roles in your Student Profile to receive tailored gap-closing recommendations with real-time match scores.
              </p>
            </div>
          </div>
          {onLoadDemoProfile && (
            <button
              onClick={onLoadDemoProfile}
              className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shrink-0"
            >
              Load Demo Profile
            </button>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* SECTION 1: CLOSE YOUR SKILL GAPS (VISUAL PROGRESS PIPELINE) */}
      {/* ========================================================= */}
      {activeTab === 'skill-gaps' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
              <div>
                <h2 className="text-lg sm:text-xl font-semibold text-slate-900 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-indigo-600" />
                  Target Role Skill Gap Analysis
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Evaluate how your existing competencies compare with industry requirements for your target placement role.
                </p>
              </div>

              {/* Role Selector */}
              <div className="flex items-center gap-2">
                <label className="text-xs font-bold text-slate-700 shrink-0">
                  Target Role:
                </label>
                <select
                  value={selectedRoleFilter}
                  onChange={(e) => setSelectedRoleFilter(e.target.value)}
                  className="px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
                >
                  {TARGET_ROLES.map((role) => (
                    <option key={role.id} value={role.title}>
                      {role.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Visual Progress Pipeline: Current Skills -> Skill Gap -> Recommended Course -> Certification -> Job Readiness */}
            <div className="bg-slate-50/80 border border-slate-200/80 rounded-2xl p-5">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4 flex items-center justify-between">
                <span>The CareerAI Placement Readiness Pipeline</span>
                <span className="text-indigo-600 font-semibold lowercase text-[11px]">
                  Learn → Practice → Build → Certify → Apply
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 relative">
                {/* Step 1: Current Skills */}
                <div className="bg-white border border-emerald-200 rounded-xl p-4 shadow-2xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-emerald-800 uppercase">
                      Step 1
                    </span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  </div>
                  <h4 className="text-xs font-semibold text-slate-900">
                    Current Skills
                  </h4>
                  <p className="text-[11px] text-slate-500 leading-tight">
                    {userSkillNames.length > 0
                      ? `${userSkillNames.length} technical skills verified in profile`
                      : 'No skills logged yet in profile'}
                  </p>
                  <div className="pt-1 text-[11px] font-bold text-emerald-700">
                    {roleSkillAnalysis.matched.length} Matched for Role
                  </div>
                </div>

                {/* Step 2: Skill Gap */}
                <div className="bg-white border border-amber-200 rounded-xl p-4 shadow-2xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-amber-800 uppercase">
                      Step 2
                    </span>
                    <Flame className="w-4 h-4 text-amber-500" />
                  </div>
                  <h4 className="text-xs font-semibold text-slate-900">Skill Gap</h4>
                  <p className="text-[11px] text-slate-500 leading-tight">
                    {roleSkillAnalysis.missing.length} missing skills required for {selectedRoleFilter}
                  </p>
                  <div className="pt-1 text-[11px] font-bold text-amber-700">
                    {roleSkillAnalysis.missing.length > 0 ? 'Action Needed' : 'No Critical Gaps'}
                  </div>
                </div>

                {/* Step 3: Recommended Course */}
                <div className="bg-white border border-indigo-200 rounded-xl p-4 shadow-2xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-indigo-800 uppercase">
                      Step 3
                    </span>
                    <BookOpen className="w-4 h-4 text-indigo-600" />
                  </div>
                  <h4 className="text-xs font-semibold text-slate-900">
                    Recommended Course
                  </h4>
                  <p className="text-[11px] text-slate-500 leading-tight">
                    Official courses from AWS, Cisco, Oracle, Microsoft &amp; NVIDIA
                  </p>
                  <div className="pt-1 text-[11px] font-bold text-indigo-700">
                    {roleSkillAnalysis.coursesToCloseGaps.length} Tailored Courses
                  </div>
                </div>

                {/* Step 4: Certification */}
                <div className="bg-white border border-blue-200 rounded-xl p-4 shadow-2xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-blue-800 uppercase">
                      Step 4
                    </span>
                    <Award className="w-4 h-4 text-blue-600" />
                  </div>
                  <h4 className="text-xs font-semibold text-slate-900">
                    Certification
                  </h4>
                  <p className="text-[11px] text-slate-500 leading-tight">
                    Industry credential verifiable on LinkedIn &amp; Credly
                  </p>
                  <div className="pt-1 text-[11px] font-bold text-blue-700">
                    {learningMetrics.totalCompleted} Earned
                  </div>
                </div>

                {/* Step 5: Job Readiness */}
                <div className="bg-white border border-purple-200 rounded-xl p-4 shadow-2xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-purple-800 uppercase">
                      Step 5
                    </span>
                    <TrendingUp className="w-4 h-4 text-purple-600" />
                  </div>
                  <h4 className="text-xs font-semibold text-slate-900">
                    Job Readiness
                  </h4>
                  <p className="text-[11px] text-slate-500 leading-tight">
                    Recruiter cutoff clearance and high-confidence interview prep
                  </p>
                  <div className="pt-1 text-[11px] font-bold text-purple-700">
                    {roleSkillAnalysis.matchPercentage}% Current Role Fit
                  </div>
                </div>
              </div>
            </div>

            {/* Why Should I Take This Course? Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Skills breakdown */}
              <div className="border border-slate-200 rounded-xl p-5 space-y-4">
                <h3 className="text-sm font-bold text-slate-900">
                  Target Role Requirements: {activeTargetRoleDef.title}
                </h3>

                {/* Matching Skills */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    Skills You Already Have ({roleSkillAnalysis.matched.length})
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {roleSkillAnalysis.matched.length > 0 ? (
                      roleSkillAnalysis.matched.map((skill) => (
                        <span
                          key={skill}
                          className="px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200"
                        >
                          ✓ {skill}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-slate-400 italic">
                        No required skills logged in profile yet.
                      </span>
                    )}
                  </div>
                </div>

                {/* Missing Skills */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <span className="text-xs font-bold text-amber-800 flex items-center gap-1.5">
                    <Flame className="w-3.5 h-3.5 text-amber-600" />
                    Skills Missing for This Role ({roleSkillAnalysis.missing.length})
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {roleSkillAnalysis.missing.map((skill) => (
                      <span
                        key={skill}
                        className="px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200"
                      >
                        ✗ {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Plan */}
              <div className="border border-slate-200 rounded-xl p-5 space-y-4 bg-slate-50/50">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  Recommended Action Sequence
                </h3>

                <ol className="space-y-3 text-xs text-slate-700">
                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-indigo-600 text-white font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                      1
                    </span>
                    <div>
                      <strong className="text-slate-900">Start with Foundational Gap Closers:</strong> Enroll in official introductory courses from Cisco or Microsoft Learn to establish syntax and protocol basics.
                    </div>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-indigo-600 text-white font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                      2
                    </span>
                    <div>
                      <strong className="text-slate-900">Complete Hands-On Cloud/AI Labs:</strong> Practice real deployment pipelines on AWS Skill Builder or Google Cloud Skills Boost.
                    </div>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-indigo-600 text-white font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                      3
                    </span>
                    <div>
                      <strong className="text-slate-900">Build a Capstone Project:</strong> Pick a real-world project from the Projects tab to anchor on your resume and GitHub.
                    </div>
                  </li>
                </ol>

                <div className="pt-2">
                  <button
                    onClick={() => setActiveTab('recommended')}
                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                  >
                    <span>Browse All Gap-Closing Courses</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* SECTION 2: MY LEARNING PATH (STEP-BY-STEP ROADMAP) */}
      {/* ========================================================= */}
      {activeTab === 'learning-path' && (
        <div className="space-y-6">
          {/* Top summary card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-slate-100 pb-6">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                    Personalized Roadmap
                  </span>
                  <span className="text-xs text-slate-500">
                    Auto-saved to your browser session
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-semibold text-slate-900 tracking-tight">
                  My Structured Learning Path
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-2xl">
                  Structured progression from introductory basics to verified certification and capstone projects.
                  Track completion dates and credential links directly on your dashboard.
                </p>
              </div>

              <div className="flex items-center gap-4 bg-slate-50 border border-slate-200 rounded-xl p-4 shrink-0">
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700 gap-4">
                    <span>Overall Path Progress</span>
                    <span className="text-indigo-600">
                      {learningPath.length > 0
                        ? Math.round(
                            (learningMetrics.totalCompleted / learningPath.length) * 100
                          )
                        : 0}
                      %
                    </span>
                  </div>
                  <div className="w-48 h-2.5 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                      style={{
                        width: `${
                          learningPath.length > 0
                            ? (learningMetrics.totalCompleted / learningPath.length) * 100
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {learningMetrics.totalCompleted} of {learningPath.length} milestones finished
                  </div>
                </div>
              </div>
            </div>

            {/* Stages Sequence */}
            <div className="pt-6 space-y-6">
              {(
                [
                  'START HERE',
                  'FOUNDATION',
                  'INTERMEDIATE',
                  'ADVANCED',
                  'CERTIFICATION',
                  'REAL-WORLD PROJECT',
                  'JOB READY',
                ] as LearningPathStage[]
              ).map((stageName, stageIdx) => {
                const stageCourses = stageGroups[stageName] || [];
                return (
                  <div
                    key={stageName}
                    className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-2xs"
                  >
                    {/* Stage Header */}
                    <div className="bg-slate-50/80 px-5 py-3 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-semibold text-xs flex items-center justify-center shrink-0">
                          {stageIdx + 1}
                        </span>
                        <h3 className="text-xs sm:text-sm font-semibold text-slate-900 tracking-tight">
                          {stageName}
                        </h3>
                        <span className="text-xs text-slate-500">
                          ({stageCourses.length} {stageCourses.length === 1 ? 'course' : 'courses'})
                        </span>
                      </div>

                      {stageName === 'REAL-WORLD PROJECT' && (
                        <button
                          onClick={() => setActiveTab('projects')}
                          className="text-xs text-indigo-600 font-bold hover:underline cursor-pointer flex items-center gap-1"
                        >
                          <span>Explore project ideas</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    {/* Stage Body */}
                    <div className="p-4 sm:p-5">
                      {stageCourses.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {stageCourses.map((item) => {
                            const course = item.course;
                            return (
                              <div
                                key={course.id}
                                className={`border rounded-xl p-4 transition-all ${
                                  item.status === 'completed'
                                    ? 'border-emerald-200 bg-emerald-50/20'
                                    : 'border-slate-200 bg-white hover:border-indigo-300'
                                }`}
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <span
                                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getProviderBadgeStyle(
                                      course.provider
                                    )}`}
                                  >
                                    {course.providerBadge}
                                  </span>

                                  <div className="flex items-center gap-1.5">
                                    <button
                                      onClick={() =>
                                        handleUpdateStatus(
                                          course.id,
                                          item.status === 'completed'
                                            ? 'in-progress'
                                            : 'completed'
                                        )
                                      }
                                      className={`px-2 py-1 rounded text-[11px] font-bold transition-colors cursor-pointer border ${
                                        item.status === 'completed'
                                          ? 'bg-emerald-600 text-white border-emerald-600'
                                          : 'bg-slate-100 text-slate-700 hover:bg-emerald-100 hover:text-emerald-800 border-slate-200'
                                      }`}
                                      title="Toggle course completed status"
                                    >
                                      {item.status === 'completed' ? '✓ Completed' : 'Mark Complete'}
                                    </button>

                                    <button
                                      onClick={() => handleToggleSaveCourse(course.id)}
                                      className="p-1 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                                      title="Remove from Learning Path"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>

                                <h4 className="text-sm font-bold text-slate-900 mt-2 line-clamp-1">
                                  {course.title}
                                </h4>

                                <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                                  {course.realWorldApplication}
                                </p>

                                {/* Course Completion Progress Tracker */}
                                <div className="mt-3 p-2.5 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
                                  <div className="flex items-center justify-between text-xs">
                                    <span className="font-bold text-slate-700">Course Completion Progress:</span>
                                    <span className={`font-semibold ${item.status === 'completed' ? 'text-emerald-600' : 'text-indigo-600'}`}>
                                      {item.status === 'completed' ? '100% (Completed)' : `${item.progressPercentage ?? 0}%`}
                                    </span>
                                  </div>

                                  <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                                    <div
                                      className={`h-full transition-all duration-500 rounded-full ${
                                        item.status === 'completed' ? 'bg-emerald-600' : 'bg-indigo-600'
                                      }`}
                                      style={{ width: `${item.status === 'completed' ? 100 : (item.progressPercentage ?? 0)}%` }}
                                    />
                                  </div>

                                  {item.status !== 'completed' && (
                                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                                      <div className="flex items-center gap-1.5">
                                        <button
                                          type="button"
                                          onClick={() => handleUpdateCourseProgress(course.id, Math.max(0, (item.progressPercentage ?? 0) - 10))}
                                          className="px-2 py-0.5 rounded bg-white hover:bg-slate-100 text-slate-700 text-[11px] font-bold border border-slate-200 cursor-pointer"
                                          title="Decrease 10%"
                                        >
                                          -10%
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => handleUpdateCourseProgress(course.id, Math.min(100, (item.progressPercentage ?? 0) + 10))}
                                          className="px-2 py-0.5 rounded bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[11px] font-bold border border-indigo-200 cursor-pointer"
                                          title="Complete 10% lesson"
                                        >
                                          +10% Lesson
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => handleUpdateCourseProgress(course.id, Math.min(100, (item.progressPercentage ?? 0) + 25))}
                                          className="px-2 py-0.5 rounded bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[11px] font-bold border border-indigo-200 cursor-pointer"
                                          title="Complete 25% module/quiz"
                                        >
                                          +25% Quiz
                                        </button>
                                      </div>

                                      <div className="flex items-center gap-2">
                                        <input
                                          type="range"
                                          min="0"
                                          max="100"
                                          step="1"
                                          value={item.progressPercentage ?? 0}
                                          onChange={(e) => handleUpdateCourseProgress(course.id, Number(e.target.value))}
                                          className="w-24 accent-indigo-600 cursor-pointer"
                                          title="Adjust course progress"
                                        />
                                        <span className="text-[11px] font-bold text-slate-600 w-8 text-right">
                                          {item.progressPercentage ?? 0}%
                                        </span>
                                      </div>
                                    </div>
                                  )}
                                </div>

                                {/* Target Completion Date & Credential ID */}
                                <div className="mt-3 pt-2.5 border-t border-slate-100 text-xs flex flex-wrap items-center justify-between gap-2 text-slate-600">
                                  <div className="flex items-center gap-1.5 text-[11px]">
                                    <Calendar className="w-3 h-3 text-slate-400" />
                                    {editingTargetDateId === course.id ? (
                                      <div className="flex items-center gap-1">
                                        <input
                                          type="date"
                                          value={newTargetDate}
                                          onChange={(e) => setNewTargetDate(e.target.value)}
                                          className="text-[11px] px-1.5 py-0.5 border border-slate-300 rounded"
                                        />
                                        <button
                                          onClick={() => handleSaveTargetDate(course.id)}
                                          className="text-xs text-indigo-600 font-bold hover:underline"
                                        >
                                          Save
                                        </button>
                                      </div>
                                    ) : (
                                      <button
                                        onClick={() => {
                                          setEditingTargetDateId(course.id);
                                          setNewTargetDate(item.targetCompletionDate || '');
                                        }}
                                        className="text-slate-600 hover:text-indigo-600 underline cursor-pointer"
                                      >
                                        {item.targetCompletionDate
                                          ? `Target: ${item.targetCompletionDate}`
                                          : 'Set target date'}
                                      </button>
                                    )}
                                  </div>

                                  {/* Credential proof or link */}
                                  {item.status === 'completed' && (
                                    <div className="text-[11px]">
                                      {editingCredentialId === course.id ? (
                                        <div className="flex items-center gap-1">
                                          <input
                                            type="text"
                                            placeholder="Cert ID or URL"
                                            value={newCredentialText}
                                            onChange={(e) => setNewCredentialText(e.target.value)}
                                            className="text-[10px] px-1.5 py-0.5 border border-slate-300 rounded w-28"
                                          />
                                          <button
                                            onClick={() => handleSaveCredentialId(course.id)}
                                            className="text-xs text-emerald-600 font-bold hover:underline"
                                          >
                                            Save
                                          </button>
                                        </div>
                                      ) : (
                                        <button
                                          onClick={() => {
                                            setEditingCredentialId(course.id);
                                            setNewCredentialText(
                                              item.certificateCredentialId || ''
                                            );
                                          }}
                                          className="text-emerald-700 font-semibold hover:underline cursor-pointer"
                                        >
                                          {item.certificateCredentialId
                                            ? `Cert: ${item.certificateCredentialId}`
                                            : '+ Add Credential ID'}
                                        </button>
                                      )}
                                    </div>
                                  )}

                                  <a
                                    href={course.officialUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 hover:text-indigo-800"
                                  >
                                    <span>Open Provider</span>
                                    <ExternalLink className="w-3 h-3" />
                                  </a>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="text-center py-6 text-slate-400 text-xs">
                          <span>No courses saved in this milestone yet. </span>
                          <button
                            onClick={() => setActiveTab('recommended')}
                            className="text-indigo-600 font-bold hover:underline cursor-pointer ml-1"
                          >
                            Browse recommended courses
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* SECTION 3: REAL-WORLD PROJECTS RECOMMENDATIONS */}
      {/* ========================================================= */}
      {activeTab === 'projects' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-5">
              <div>
                <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
                  Learn → Practice → Build → Certify → Apply
                </span>
                <h2 className="text-xl sm:text-2xl font-semibold text-slate-900 tracking-tight mt-1">
                  Practical Real-World Engineering Projects
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed mt-0.5">
                  Recruiters evaluate working GitHub code over passive certificates. Build these practical enterprise-grade projects to showcase directly in placement interviews.
                </p>
              </div>

              <div className="text-xs bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-xl text-slate-700 font-semibold shrink-0">
                {REAL_WORLD_PROJECTS.length} Comprehensive Capstone Projects
              </div>
            </div>

            {/* Projects Grid */}
            <div className="pt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
              {REAL_WORLD_PROJECTS.map((proj) => (
                <div
                  key={proj.id}
                  className="border border-slate-200 rounded-2xl p-6 hover:border-indigo-300 transition-colors bg-white flex flex-col justify-between space-y-4 shadow-2xs"
                >
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                        {proj.domain}
                      </span>
                      <span className="text-xs font-bold text-slate-500">
                        Target Role: {proj.targetRole}
                      </span>
                    </div>

                    <h3 className="text-base font-semibold text-slate-900 leading-snug">
                      {proj.title}
                    </h3>

                    <p className="text-xs text-slate-600 leading-relaxed">
                      {proj.description}
                    </p>

                    {/* Key skills practiced */}
                    <div className="space-y-1.5 pt-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                        Tech Stack &amp; Skills Practiced:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {proj.keySkillsPracticed.map((sk) => (
                          <span
                            key={sk}
                            className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-800 border border-slate-200"
                          >
                            {sk}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Step-by-step implementation milestones */}
                    <div className="bg-slate-50 rounded-xl p-3.5 space-y-2 text-xs border border-slate-100">
                      <span className="text-[11px] font-bold text-slate-800 block">
                        Implementation Blueprint:
                      </span>
                      <ul className="space-y-1 text-slate-600 text-[11px]">
                        {proj.practicalSteps.map((step, sIdx) => (
                          <li key={sIdx} className="flex items-start gap-1.5">
                            <span className="text-indigo-600 font-bold shrink-0">
                              {sIdx + 1}.
                            </span>
                            <span>{step}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Recruiter impact quote */}
                    <div className="border-l-2 border-emerald-500 pl-3 py-1 bg-emerald-50/50 rounded-r-lg">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block">
                        Why Recruiters Care:
                      </span>
                      <p className="text-xs text-emerald-950 mt-0.5 leading-snug">
                        {proj.recruiterImpact}
                      </p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400 font-medium">
                      Difficulty: {proj.difficulty}
                    </span>
                    {proj.officialReferenceUrl && (
                      <a
                        href={proj.officialReferenceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800"
                      >
                        <span>Official Course Companion</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* SECTION 4: MAIN COURSE LISTING (RECOMMENDED, FREE, CERTS) */}
      {/* ========================================================= */}
      {(activeTab === 'recommended' ||
        activeTab === 'free' ||
        activeTab === 'certifications' ||
        activeTab === 'hands-on') && (
        <div className="space-y-6">
          {/* Search, Provider, and Category Filter Bar */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
            {/* Top row: Search and active count */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search courses, skills (Python, Cloud, SQL, AI, Cybersecurity)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 text-slate-800"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
                  >
                    Clear
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs text-slate-500 font-semibold">
                  Showing <strong>{processedCourses.length}</strong> real courses
                </span>
                {(searchQuery ||
                  selectedProvider !== 'All' ||
                  selectedCategory !== 'All' ||
                  selectedDifficulty !== 'All' ||
                  selectedCost !== 'All' ||
                  onlyCertifications ||
                  onlyHandsOn) && (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedProvider('All');
                      setSelectedCategory('All');
                      setSelectedDifficulty('All');
                      setSelectedCost('All');
                      setOnlyCertifications(false);
                      setOnlyHandsOn(false);
                    }}
                    className="text-xs text-indigo-600 font-bold hover:underline cursor-pointer"
                  >
                    Reset filters
                  </button>
                )}
              </div>
            </div>

            {/* Second row: Dropdown Filters */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-100">
              {/* Provider Filter */}
              <div>
                <label className="text-[11px] font-semibold text-slate-500 block mb-1">
                  Provider
                </label>
                <select
                  value={selectedProvider}
                  onChange={(e) => setSelectedProvider(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 cursor-pointer"
                >
                  <option value="All">All Providers (7)</option>
                  {providers.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>

              {/* Category Filter */}
              <div>
                <label className="text-[11px] font-semibold text-slate-500 block mb-1">
                  Category
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 cursor-pointer"
                >
                  <option value="All">All Tech Domains</option>
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              {/* Difficulty Filter */}
              <div>
                <label className="text-[11px] font-semibold text-slate-500 block mb-1">
                  Skill Level
                </label>
                <select
                  value={selectedDifficulty}
                  onChange={(e) => setSelectedDifficulty(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 cursor-pointer"
                >
                  <option value="All">All Levels</option>
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>

              {/* Cost Filter */}
              <div>
                <label className="text-[11px] font-semibold text-slate-500 block mb-1">
                  Cost
                </label>
                <select
                  value={selectedCost}
                  onChange={(e) => setSelectedCost(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 cursor-pointer"
                >
                  <option value="All">All Pricing Types</option>
                  <option value="Free">100% Free</option>
                  <option value="Paid">Certification / Paid</option>
                </select>
              </div>
            </div>

            {/* Quick Filter Badges */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mr-1">
                Quick Providers:
              </span>
              {providers.map((p) => {
                const isActive = selectedProvider === p;
                return (
                  <button
                    key={p}
                    onClick={() => setSelectedProvider(isActive ? 'All' : p)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer border ${
                      isActive
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {p.replace(' Networking Academy', '').replace(' Skill Builder', '').replace(' Deep Learning Institute', '')}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {processedCourses.map(({ course, matchScore, matchReasons, isSkillGapCloser }) => {
              const inPath = isCourseInPath(course.id);
              const pathStatus = getCourseStatusInPath(course.id);

              return (
                <div
                  key={course.id}
                  className="bg-white border border-slate-200 rounded-2xl p-5 hover:border-indigo-300 transition-all shadow-xs flex flex-col justify-between space-y-4 relative group"
                >
                  {/* Top Bar: Provider Badge & Match Gauge */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${getProviderBadgeStyle(
                          course.provider
                        )}`}
                      >
                        {course.providerBadge}
                      </span>

                      <div className="flex items-center gap-1.5">
                        {/* Cost Badge */}
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                            course.costType === 'Free'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-slate-100 text-slate-700 border border-slate-200'
                          }`}
                        >
                          {course.costType}
                        </span>

                        {/* Match Score */}
                        <span
                          className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                            matchScore >= 80
                              ? 'bg-emerald-100 text-emerald-800'
                              : matchScore >= 60
                              ? 'bg-indigo-100 text-indigo-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                          title="Personalized match calculated from your branch, skills, and target roles"
                        >
                          {matchScore}% Fit
                        </span>
                      </div>
                    </div>

                    {/* Title and Category */}
                    <div>
                      <h3 className="text-sm font-semibold text-slate-900 leading-snug line-clamp-2">
                        {course.title}
                      </h3>
                      <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium mt-1">
                        <span>{course.category}</span>
                        <span>•</span>
                        <span>{course.difficulty}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          {course.duration}
                        </span>
                      </div>
                    </div>

                    {/* Certification Badge */}
                    {course.certificationAvailable && (
                      <div className="bg-amber-50/70 border border-amber-200/80 rounded-lg p-2.5 flex items-start gap-2">
                        <Award className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                        <div className="text-[11px] text-amber-900 leading-tight">
                          <strong className="font-bold">Official Credential:</strong>{' '}
                          {course.certificationName}
                        </div>
                      </div>
                    )}

                    {/* Real-World Application */}
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Real-World Application:
                      </span>
                      <p className="text-xs text-slate-700 leading-relaxed">
                        "{course.realWorldApplication}"
                      </p>
                    </div>

                    {/* Why CareerAI Recommends It */}
                    <div className="space-y-1 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-indigo-600" />
                        Why Recommended:
                      </span>
                      <p className="text-[11px] text-slate-600 leading-relaxed">
                        {course.whyRecommended}
                      </p>
                    </div>

                    {/* Skills Gained */}
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Skills Gained:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {course.skillsGained.map((skill) => (
                          <span
                            key={skill}
                            className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
                    {/* Official Link Button */}
                    <a
                      href={course.officialUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-2xs"
                    >
                      <span>Start Course</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>

                    {/* Add to Learning Path Toggle */}
                    <button
                      type="button"
                      onClick={() => handleToggleSaveCourse(course.id)}
                      className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                        inPath
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                          : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border-slate-200'
                      }`}
                      title={inPath ? 'In My Learning Path' : 'Add to My Learning Path'}
                    >
                      {inPath ? (
                        <BookmarkCheck className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Bookmark className="w-4 h-4 text-slate-500" />
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Empty Results State */}
          {processedCourses.length === 0 && (
            <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center space-y-3">
              <BookOpen className="w-8 h-8 text-slate-400 mx-auto" />
              <h4 className="text-sm font-bold text-slate-800">
                No matching verified courses found
              </h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Try clearing your search query or selecting "All Providers" and "All Tech Domains" in the filters above.
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedProvider('All');
                  setSelectedCategory('All');
                  setSelectedDifficulty('All');
                  setSelectedCost('All');
                }}
                className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-colors cursor-pointer"
              >
                Reset All Filters
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
