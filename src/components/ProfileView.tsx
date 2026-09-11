import React, { useState } from 'react';
import {
  User,
  GraduationCap,
  Code2,
  FolderGit2,
  Briefcase,
  Award,
  Target,
  Plus,
  Trash2,
  Save,
  Check,
  RotateCcw,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';
import {
  StudentProfile,
  Skill,
  Project,
  Internship,
  Certification,
  SkillCategory,
  SkillLevel,
  AuthUser,
} from '../types';
import { GoogleIcon } from './GoogleIcon';
import {
  ENGINEERING_BRANCHES,
  COMMON_SKILLS_CATALOG,
  TARGET_ROLE_DEFINITIONS,
  EMPTY_STUDENT_PROFILE,
} from '../data/mockDatabase';

interface ProfileViewProps {
  profile: StudentProfile;
  onUpdateProfile: (updated: StudentProfile) => void;
  onLoadDemo: () => void;
  onClearProfile: () => void;
  currentUser?: AuthUser | null;
  assessmentSubmitted?: boolean;
  onSubmitAssessment?: () => void;
  onOpenAuth?: (mode: 'signin' | 'signup') => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  profile,
  onUpdateProfile,
  onLoadDemo,
  onClearProfile,
  currentUser,
  assessmentSubmitted = false,
  onSubmitAssessment,
  onOpenAuth,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<
    'academic' | 'skills' | 'projects' | 'experience' | 'aspirations'
  >('academic');

  const [savedNotification, setSavedNotification] = useState(false);

  // New skill input state
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillCategory, setNewSkillCategory] = useState<SkillCategory>('Languages');
  const [newSkillLevel, setNewSkillLevel] = useState<SkillLevel>('Intermediate');

  // New project modal/inline state
  const [newProject, setNewProject] = useState<Partial<Project>>({
    title: '',
    description: '',
    techStack: '',
    githubUrl: '',
    liveUrl: '',
    impact: '',
  });

  // New internship state
  const [newInternship, setNewInternship] = useState<Partial<Internship>>({
    company: '',
    role: '',
    duration: '',
    description: '',
  });

  // New certification state
  const [newCert, setNewCert] = useState<Partial<Certification>>({
    title: '',
    issuer: '',
    issueYear: new Date().getFullYear().toString(),
    credentialUrl: '',
  });

  const handleFieldChange = (field: keyof StudentProfile, value: any) => {
    onUpdateProfile({
      ...profile,
      [field]: value,
    });
  };

  const handleSave = () => {
    setSavedNotification(true);
    setTimeout(() => setSavedNotification(false), 3000);
  };

  // Skill Handlers
  const handleAddSkill = () => {
    if (!newSkillName.trim()) return;
    const newSkill: Skill = {
      id: `sk-${Date.now()}`,
      name: newSkillName.trim(),
      category: newSkillCategory,
      level: newSkillLevel,
    };
    onUpdateProfile({
      ...profile,
      skills: [...(profile.skills || []), newSkill],
    });
    setNewSkillName('');
  };

  const handleQuickAddSkill = (name: string, category: SkillCategory) => {
    if (profile.skills?.some((s) => s.name.toLowerCase() === name.toLowerCase())) return;
    const newSkill: Skill = {
      id: `sk-${Date.now()}-${Math.random()}`,
      name,
      category,
      level: 'Intermediate',
    };
    onUpdateProfile({
      ...profile,
      skills: [...(profile.skills || []), newSkill],
    });
  };

  const handleRemoveSkill = (id: string) => {
    onUpdateProfile({
      ...profile,
      skills: profile.skills.filter((s) => s.id !== id),
    });
  };

  const handleSkillLevelChange = (id: string, level: SkillLevel) => {
    onUpdateProfile({
      ...profile,
      skills: profile.skills.map((s) => (s.id === id ? { ...s, level } : s)),
    });
  };

  // Project Handlers
  const handleAddProject = () => {
    if (!newProject.title?.trim() || !newProject.description?.trim()) return;
    const project: Project = {
      id: `proj-${Date.now()}`,
      title: newProject.title.trim(),
      description: newProject.description.trim(),
      techStack: newProject.techStack?.trim() || '',
      githubUrl: newProject.githubUrl?.trim() || '',
      liveUrl: newProject.liveUrl?.trim() || '',
      impact: newProject.impact?.trim() || '',
    };
    onUpdateProfile({
      ...profile,
      projects: [...(profile.projects || []), project],
    });
    setNewProject({
      title: '',
      description: '',
      techStack: '',
      githubUrl: '',
      liveUrl: '',
      impact: '',
    });
  };

  const handleRemoveProject = (id: string) => {
    onUpdateProfile({
      ...profile,
      projects: profile.projects.filter((p) => p.id !== id),
    });
  };

  // Internship Handlers
  const handleAddInternship = () => {
    if (!newInternship.company?.trim() || !newInternship.role?.trim()) return;
    const internship: Internship = {
      id: `int-${Date.now()}`,
      company: newInternship.company.trim(),
      role: newInternship.role.trim(),
      duration: newInternship.duration?.trim() || '',
      description: newInternship.description?.trim() || '',
    };
    onUpdateProfile({
      ...profile,
      internships: [...(profile.internships || []), internship],
    });
    setNewInternship({
      company: '',
      role: '',
      duration: '',
      description: '',
    });
  };

  const handleRemoveInternship = (id: string) => {
    onUpdateProfile({
      ...profile,
      internships: profile.internships.filter((i) => i.id !== id),
    });
  };

  // Certification Handlers
  const handleAddCert = () => {
    if (!newCert.title?.trim() || !newCert.issuer?.trim()) return;
    const cert: Certification = {
      id: `cert-${Date.now()}`,
      title: newCert.title.trim(),
      issuer: newCert.issuer.trim(),
      issueYear: newCert.issueYear?.trim() || new Date().getFullYear().toString(),
      credentialUrl: newCert.credentialUrl?.trim() || '',
    };
    onUpdateProfile({
      ...profile,
      certifications: [...(profile.certifications || []), cert],
    });
    setNewCert({
      title: '',
      issuer: '',
      issueYear: new Date().getFullYear().toString(),
      credentialUrl: '',
    });
  };

  const handleRemoveCert = (id: string) => {
    onUpdateProfile({
      ...profile,
      certifications: profile.certifications.filter((c) => c.id !== id),
    });
  };

  // Target Roles Toggle
  const handleToggleTargetRole = (roleTitle: string) => {
    const current = profile.targetRoles || [];
    const exists = current.includes(roleTitle);
    const updated = exists
      ? current.filter((r) => r !== roleTitle)
      : [...current, roleTitle];
    onUpdateProfile({
      ...profile,
      targetRoles: updated,
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Actions */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-[21px] font-semibold text-slate-900 tracking-normal leading-[1.2] flex items-center gap-2.5">
            <User className="w-6 h-6 text-indigo-600" />
            <span>Student Profile Management</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Fill in your authentic academic records, skills, and projects. Data is automatically preserved in your browser.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            {savedNotification ? (
              <>
                <Check className="w-4 h-4 text-emerald-300" />
                <span>Saved to Account!</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Profile</span>
              </>
            )}
          </button>

          <button
            onClick={onLoadDemo}
            className="flex items-center gap-1.5 px-3 py-2 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
            title="Load sample 3rd year CSE profile for testing"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Load Demo</span>
          </button>

          <button
            onClick={onClearProfile}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
            title="Wipe to 100% empty profile"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Clear</span>
          </button>
        </div>
      </div>

      {/* Assessment Onboarding Banner for Authenticated Student */}
      {currentUser && !assessmentSubmitted && (
        <div
          id="assessment-onboarding-callout"
          className="bg-gradient-to-r from-amber-50 via-amber-50/80 to-indigo-50 border-2 border-amber-300 rounded-2xl p-5 md:p-6 shadow-xs"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div className="space-y-1.5 max-w-2xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-200 text-amber-900 border border-amber-300">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-700" />
                  Step 2: Student Assessment Pending
                </span>
                {currentUser.provider === 'google' && (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-700 bg-white px-2.5 py-0.5 rounded-full border border-amber-200 shadow-2xs">
                    <GoogleIcon className="w-3.5 h-3.5" />
                    <span>{currentUser.email}</span>
                  </span>
                )}
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-slate-900 tracking-normal leading-snug">
                Complete your profile to unlock your personalized career analysis
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Welcome, <strong>{currentUser.name}</strong>! Google Sign-In only authenticated your account. To maintain authentic evaluation with no false or default student metrics, please fill in your real college, B.Tech branch, CGPA, backlogs, skills, and projects below. Once ready, click <strong>Submit Assessment</strong> to generate your readiness score, eligible companies, and skill gaps.
              </p>
            </div>

            <div className="shrink-0 flex items-center">
              <button
                id="profile-submit-assessment-btn"
                onClick={onSubmitAssessment}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-semibold rounded-xl shadow-xs transition-all cursor-pointer hover:shadow-sm"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-100" />
                <span>Submit Assessment &amp; Unlock Analysis</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Active Assessment Banner */}
      {currentUser && assessmentSubmitted && (
        <div className="bg-emerald-50/80 border border-emerald-200 rounded-xl px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-emerald-950 font-medium">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              <strong>Assessment Submitted &amp; Live:</strong> Your student metrics are actively driving your CareerAI placement readiness score, company cutoffs, and skill gap radar. Any updates saved below will automatically recalculate your results.
            </span>
          </div>
          {onSubmitAssessment && (
            <button
              onClick={onSubmitAssessment}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs shrink-0 cursor-pointer self-start sm:self-auto"
            >
              Recalculate Analysis
            </button>
          )}
        </div>
      )}

      {/* Guest Notice */}
      {!currentUser && (
        <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-700">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0" />
            <span>
              <strong>Account Isolation:</strong> Sign in with Google to create an isolated CareerAI account and securely store your assessment across devices.
            </span>
          </div>
          {onOpenAuth && (
            <button
              onClick={() => onOpenAuth('signin')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 rounded-lg font-semibold text-xs shrink-0 cursor-pointer self-start sm:self-auto shadow-2xs"
            >
              <GoogleIcon className="w-3.5 h-3.5" />
              <span>Continue with Google</span>
            </button>
          )}
        </div>
      )}

      {/* Profile Section Tabs */}
      <div className="flex border-b border-slate-200 bg-white rounded-t-xl px-4 pt-3 gap-2 overflow-x-auto">
        <button
          onClick={() => setActiveSubTab('academic')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeSubTab === 'academic'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          <span>Academic & Personal</span>
        </button>

        <button
          onClick={() => setActiveSubTab('skills')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeSubTab === 'skills'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Code2 className="w-4 h-4" />
          <span>Technical Skills ({profile.skills?.length || 0})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('projects')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeSubTab === 'projects'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <FolderGit2 className="w-4 h-4" />
          <span>Projects ({profile.projects?.length || 0})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('experience')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeSubTab === 'experience'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          <span>Internships & Certs</span>
        </button>

        <button
          onClick={() => setActiveSubTab('aspirations')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeSubTab === 'aspirations'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Target className="w-4 h-4" />
          <span>Target Roles & Socials</span>
        </button>
      </div>

      {/* Tab 1: Academic & Personal */}
      {activeSubTab === 'academic' && (
        <div className="bg-white border border-slate-200 rounded-b-2xl p-6 shadow-xs space-y-8">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-4">
              Personal Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) => handleFieldChange('name', e.target.value)}
                  placeholder="e.g. Rahul Verma"
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={profile.email}
                  onChange={(e) => handleFieldChange('email', e.target.value)}
                  placeholder="e.g. rahul.verma@college.edu.in"
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={profile.phone}
                  onChange={(e) => handleFieldChange('phone', e.target.value)}
                  placeholder="e.g. +91 98765 43210"
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-4">
              College & Engineering Branch
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-1">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  College / University Name
                </label>
                <input
                  type="text"
                  value={profile.college}
                  onChange={(e) => handleFieldChange('college', e.target.value)}
                  placeholder="e.g. IIT Madras, NIT Trichy, Vellore Institute of Tech"
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Engineering Branch / Stream
                </label>
                <select
                  value={profile.branch}
                  onChange={(e) => handleFieldChange('branch', e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">Select Engineering Branch</option>
                  {ENGINEERING_BRANCHES.map((branch) => (
                    <option key={branch} value={branch}>
                      {branch}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    B.Tech Year
                  </label>
                  <select
                    value={profile.year}
                    onChange={(e) => handleFieldChange('year', e.target.value)}
                    className="w-full px-3 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="">Select Year</option>
                    <option value="1st Year">1st Year</option>
                    <option value="2nd Year">2nd Year</option>
                    <option value="3rd Year">3rd Year</option>
                    <option value="4th Year">4th Year</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Semester
                  </label>
                  <select
                    value={profile.semester}
                    onChange={(e) => handleFieldChange('semester', e.target.value)}
                    className="w-full px-3 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="">Sem</option>
                    {['1', '2', '3', '4', '5', '6', '7', '8'].map((sem) => (
                      <option key={sem} value={sem}>
                        Sem {sem}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-4">
              Academic Scores & Placement Criteria
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Current B.Tech CGPA
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="10"
                  value={profile.cgpa || ''}
                  onChange={(e) => handleFieldChange('cgpa', e.target.value)}
                  placeholder="e.g. 8.25"
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
                <span className="text-[11px] text-slate-500 mt-1 block">Scale of 10.0</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  10th Percentage (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  value={profile.tenthPercent || ''}
                  onChange={(e) => handleFieldChange('tenthPercent', e.target.value)}
                  placeholder="e.g. 92.5"
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
                <span className="text-[11px] text-slate-500 mt-1 block">Min 60% for most MNCs</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  12th / Inter (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  value={profile.twelfthPercent || ''}
                  onChange={(e) => handleFieldChange('twelfthPercent', e.target.value)}
                  placeholder="e.g. 88.0"
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
                <span className="text-[11px] text-slate-500 mt-1 block">Board Percentage</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Active Backlogs
                </label>
                <input
                  type="number"
                  min="0"
                  max="20"
                  value={profile.activeBacklogs ?? 0}
                  onChange={(e) => handleFieldChange('activeBacklogs', parseInt(e.target.value) || 0)}
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
                <span className="text-[11px] text-slate-500 mt-1 block">0 required for Tier-1</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Cleared / History of Backlogs
                </label>
                <input
                  type="number"
                  min="0"
                  value={profile.clearedBacklogs ?? 0}
                  onChange={(e) => handleFieldChange('clearedBacklogs', parseInt(e.target.value) || 0)}
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-hidden"
                />
                <span className="text-[11px] text-slate-500 mt-1 block">Cleared in previous sems</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Entrance Exam Name
                </label>
                <input
                  type="text"
                  value={profile.entranceExam}
                  onChange={(e) => handleFieldChange('entranceExam', e.target.value)}
                  placeholder="e.g. JEE Mains, KCET, MHTCET, EAMCET"
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Entrance Rank / Percentile
                </label>
                <input
                  type="text"
                  value={profile.entranceRank}
                  onChange={(e) => handleFieldChange('entranceRank', e.target.value)}
                  placeholder="e.g. AIR 12,450 or 98.4 %ile"
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-hidden"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Technical Skills */}
      {activeSubTab === 'skills' && (
        <div className="bg-white border border-slate-200 rounded-b-2xl p-6 shadow-xs space-y-6">
          {/* Add Skill Form */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3">
              Add New Technical Skill
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div className="sm:col-span-2">
                <input
                  type="text"
                  value={newSkillName}
                  onChange={(e) => setNewSkillName(e.target.value)}
                  placeholder="Skill name (e.g., C++, React, Docker, DBMS, Spring Boot)"
                  className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>

              <div>
                <select
                  value={newSkillCategory}
                  onChange={(e) => setNewSkillCategory(e.target.value as SkillCategory)}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                >
                  <option value="Languages">Languages</option>
                  <option value="Frontend">Frontend</option>
                  <option value="Backend">Backend</option>
                  <option value="Databases">Databases</option>
                  <option value="Cloud & DevOps">Cloud & DevOps</option>
                  <option value="Core CS">Core CS</option>
                  <option value="Soft Skills">Soft Skills</option>
                </select>
              </div>

              <div className="flex gap-2">
                <select
                  value={newSkillLevel}
                  onChange={(e) => setNewSkillLevel(e.target.value as SkillLevel)}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>

                <button
                  onClick={handleAddSkill}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add</span>
                </button>
              </div>
            </div>

            {/* Quick Skill Suggestion Chips */}
            <div className="mt-4 pt-3 border-t border-slate-200">
              <span className="text-[11px] font-semibold text-slate-500 block mb-2">
                Click to quickly add common in-demand engineering skills:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {COMMON_SKILLS_CATALOG.slice(0, 16).map((item) => {
                  const alreadyAdded = profile.skills?.some(
                    (s) => s.name.toLowerCase() === item.name.toLowerCase()
                  );
                  return (
                    <button
                      key={item.name}
                      onClick={() => handleQuickAddSkill(item.name, item.category)}
                      disabled={alreadyAdded}
                      className={`px-2.5 py-1 rounded-md text-xs font-medium border transition-colors ${
                        alreadyAdded
                          ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                          : 'bg-white text-slate-700 border-slate-300 hover:border-indigo-400 hover:text-indigo-600 cursor-pointer'
                      }`}
                    >
                      {alreadyAdded ? `✓ ${item.name}` : `+ ${item.name}`}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Current Skills List */}
          <div>
            <h4 className="text-sm font-bold text-slate-900 mb-3 flex items-center justify-between">
              <span>Your Skills ({profile.skills?.length || 0})</span>
              <span className="text-xs text-slate-500 font-normal">
                Tag your proficiency accurately for skill gap scoring
              </span>
            </h4>

            {(!profile.skills || profile.skills.length === 0) ? (
              <div className="p-8 text-center border border-dashed border-slate-300 rounded-xl bg-slate-50/50">
                <Code2 className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-700">No skills added yet</p>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Add languages, libraries, and core computer science subjects to see your skill match against top engineering roles.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {profile.skills.map((skill) => (
                  <div
                    key={skill.id}
                    className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between shadow-2xs hover:border-slate-300 transition-colors"
                  >
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">{skill.name}</span>
                      <span className="text-[10px] text-slate-500 block">{skill.category}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <select
                        value={skill.level}
                        onChange={(e) =>
                          handleSkillLevelChange(skill.id, e.target.value as SkillLevel)
                        }
                        className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${
                          skill.level === 'Advanced'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : skill.level === 'Intermediate'
                            ? 'bg-blue-50 text-blue-800 border-blue-200'
                            : 'bg-slate-100 text-slate-700 border-slate-300'
                        }`}
                      >
                        <option value="Beginner">Beginner</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Advanced">Advanced</option>
                      </select>

                      <button
                        onClick={() => handleRemoveSkill(skill.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                        title="Remove skill"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 3: Projects */}
      {activeSubTab === 'projects' && (
        <div className="bg-white border border-slate-200 rounded-b-2xl p-6 shadow-xs space-y-6">
          {/* Add Project Form */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3">
              Add Engineering Project
            </h4>
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Project Title *
                  </label>
                  <input
                    type="text"
                    value={newProject.title || ''}
                    onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                    placeholder="e.g. Distributed Task Queue & Scheduler"
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tech Stack Used
                  </label>
                  <input
                    type="text"
                    value={newProject.techStack || ''}
                    onChange={(e) => setNewProject({ ...newProject, techStack: e.target.value })}
                    placeholder="e.g. React, Node.js, PostgreSQL, Docker"
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Project Description & Architecture *
                </label>
                <textarea
                  rows={2}
                  value={newProject.description || ''}
                  onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                  placeholder="Describe what problem the project solves, key system features, and architectural design..."
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    GitHub Repository Link
                  </label>
                  <input
                    type="url"
                    value={newProject.githubUrl || ''}
                    onChange={(e) => setNewProject({ ...newProject, githubUrl: e.target.value })}
                    placeholder="https://github.com/user/project"
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Live Demo / Deployment Link
                  </label>
                  <input
                    type="url"
                    value={newProject.liveUrl || ''}
                    onChange={(e) => setNewProject({ ...newProject, liveUrl: e.target.value })}
                    placeholder="https://my-app.vercel.app"
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Quantified Metric / Impact
                  </label>
                  <input
                    type="text"
                    value={newProject.impact || ''}
                    onChange={(e) => setNewProject({ ...newProject, impact: e.target.value })}
                    placeholder="e.g. 5,000+ jobs/min, 400+ users"
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={handleAddProject}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Project to Portfolio</span>
                </button>
              </div>
            </div>
          </div>

          {/* Current Projects List */}
          <div>
            <h4 className="text-sm font-bold text-slate-900 mb-3">
              Your Projects ({profile.projects?.length || 0})
            </h4>

            {(!profile.projects || profile.projects.length === 0) ? (
              <div className="p-8 text-center border border-dashed border-slate-300 rounded-xl bg-slate-50/50">
                <FolderGit2 className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-700">No projects added yet</p>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Adding at least 2 distinct engineering projects significantly boosts your placement readiness score and ATS evaluation.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {profile.projects.map((proj) => (
                  <div
                    key={proj.id}
                    className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs hover:border-slate-300 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h5 className="text-sm font-bold text-slate-900">{proj.title}</h5>
                        {proj.techStack && (
                          <span className="inline-block mt-0.5 px-2 py-0.5 rounded-sm bg-indigo-50 text-indigo-700 text-[10px] font-bold border border-indigo-200">
                            Stack: {proj.techStack}
                          </span>
                        )}
                        <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                          {proj.description}
                        </p>
                        {proj.impact && (
                          <p className="text-xs font-semibold text-emerald-700 mt-1">
                            Impact: {proj.impact}
                          </p>
                        )}
                        <div className="flex items-center gap-4 mt-2 text-xs">
                          {proj.githubUrl && (
                            <a
                              href={proj.githubUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1"
                            >
                              <span>GitHub Code</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                          {proj.liveUrl && (
                            <a
                              href={proj.liveUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1"
                            >
                              <span>Live Demo</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={() => handleRemoveProject(proj.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer shrink-0"
                        title="Delete project"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 4: Experience & Certifications */}
      {activeSubTab === 'experience' && (
        <div className="bg-white border border-slate-200 rounded-b-2xl p-6 shadow-xs space-y-8">
          {/* Internships Section */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 mb-3 flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-indigo-600" />
              <span>Internships & Work Experience</span>
            </h3>

            {/* Add Internship Form */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Company / Organization *
                  </label>
                  <input
                    type="text"
                    value={newInternship.company || ''}
                    onChange={(e) =>
                      setNewInternship({ ...newInternship, company: e.target.value })
                    }
                    placeholder="e.g. InnovateX Labs"
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Job Role *
                  </label>
                  <input
                    type="text"
                    value={newInternship.role || ''}
                    onChange={(e) =>
                      setNewInternship({ ...newInternship, role: e.target.value })
                    }
                    placeholder="e.g. Backend Engineering Intern"
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Duration
                  </label>
                  <input
                    type="text"
                    value={newInternship.duration || ''}
                    onChange={(e) =>
                      setNewInternship({ ...newInternship, duration: e.target.value })
                    }
                    placeholder="e.g. June 2025 - August 2025 (2 Mos)"
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Responsibilities & Achievements
                </label>
                <textarea
                  rows={2}
                  value={newInternship.description || ''}
                  onChange={(e) =>
                    setNewInternship({ ...newInternship, description: e.target.value })
                  }
                  placeholder="Summarize key tasks, tools utilized, and metrics achieved..."
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={handleAddInternship}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Internship</span>
                </button>
              </div>
            </div>

            {/* List */}
            {(!profile.internships || profile.internships.length === 0) ? (
              <p className="text-xs text-slate-500 italic p-3 bg-slate-50 rounded-lg border border-slate-200">
                No internships documented yet. (Optional, but adds valuable placement weightage).
              </p>
            ) : (
              <div className="space-y-2.5">
                {profile.internships.map((item) => (
                  <div
                    key={item.id}
                    className="p-3.5 bg-white border border-slate-200 rounded-xl flex items-start justify-between gap-3 shadow-2xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">{item.role}</span>
                        <span className="text-xs text-slate-500 font-medium">at {item.company}</span>
                      </div>
                      <span className="text-[11px] text-indigo-600 font-semibold block mt-0.5">
                        {item.duration}
                      </span>
                      {item.description && (
                        <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                          {item.description}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => handleRemoveInternship(item.id)}
                      className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Certifications Section */}
          <div className="pt-6 border-t border-slate-200">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 mb-3 flex items-center gap-2">
              <Award className="w-4 h-4 text-indigo-600" />
              <span>Certifications & Specialized Credentials</span>
            </h3>

            {/* Add Cert Form */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-4">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div className="sm:col-span-2">
                  <input
                    type="text"
                    value={newCert.title || ''}
                    onChange={(e) => setNewCert({ ...newCert, title: e.target.value })}
                    placeholder="Certification Title (e.g., AWS Cloud Practitioner)"
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <input
                    type="text"
                    value={newCert.issuer || ''}
                    onChange={(e) => setNewCert({ ...newCert, issuer: e.target.value })}
                    placeholder="Issuer (e.g. AWS, Coursera, Meta)"
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newCert.issueYear || ''}
                    onChange={(e) => setNewCert({ ...newCert, issueYear: e.target.value })}
                    placeholder="Year"
                    className="w-20 px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                  <button
                    onClick={handleAddCert}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg flex items-center gap-1 shrink-0 transition-colors cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add</span>
                  </button>
                </div>
              </div>
            </div>

            {/* List */}
            {(!profile.certifications || profile.certifications.length === 0) ? (
              <p className="text-xs text-slate-500 italic p-3 bg-slate-50 rounded-lg border border-slate-200">
                No industry certifications recorded.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {profile.certifications.map((c) => (
                  <div
                    key={c.id}
                    className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between shadow-2xs"
                  >
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">{c.title}</span>
                      <span className="text-[11px] text-slate-500">
                        {c.issuer} • {c.issueYear}
                      </span>
                    </div>
                    <button
                      onClick={() => handleRemoveCert(c.id)}
                      className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 5: Aspirations & Social Links */}
      {activeSubTab === 'aspirations' && (
        <div className="bg-white border border-slate-200 rounded-b-2xl p-6 shadow-xs space-y-6">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-2">
              Select Target Career Roles
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Select the roles you are aiming for. The Skill Gap Analyzer will compare your skills against these benchmarks.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {TARGET_ROLE_DEFINITIONS.map((role) => {
                const isSelected = (profile.targetRoles || []).includes(role.title);
                return (
                  <button
                    key={role.id}
                    onClick={() => handleToggleTargetRole(role.title)}
                    className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-50/70 border-indigo-600 text-indigo-900 ring-1 ring-indigo-600'
                        : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold">{role.title}</span>
                      <span
                        className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                          isSelected ? 'bg-indigo-600 text-white' : 'border border-slate-300'
                        }`}
                      >
                        {isSelected && '✓'}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-500 block line-clamp-2">
                      {role.description}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 mt-2 block">
                      Avg. Fresher CTC: {role.avgPackage}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-6 border-t border-slate-200">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-4">
              Professional Profiles & Links
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  GitHub Profile URL
                </label>
                <input
                  type="url"
                  value={profile.githubUrl}
                  onChange={(e) => handleFieldChange('githubUrl', e.target.value)}
                  placeholder="https://github.com/username"
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  LinkedIn Profile URL
                </label>
                <input
                  type="url"
                  value={profile.linkedinUrl}
                  onChange={(e) => handleFieldChange('linkedinUrl', e.target.value)}
                  placeholder="https://linkedin.com/in/username"
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Portfolio / Personal Website
                </label>
                <input
                  type="url"
                  value={profile.portfolioUrl}
                  onChange={(e) => handleFieldChange('portfolioUrl', e.target.value)}
                  placeholder="https://myportfolio.dev"
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-hidden"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Professional Bio / Summary
              </label>
              <textarea
                rows={2}
                value={profile.bio}
                onChange={(e) => handleFieldChange('bio', e.target.value)}
                placeholder="Short 2-line summary highlighting your focus area (e.g. Pre-final year CSE student passionate about distributed systems and cloud native architectures)..."
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-hidden"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
