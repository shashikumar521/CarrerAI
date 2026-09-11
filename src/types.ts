export type SkillLevel = 'Beginner' | 'Intermediate' | 'Advanced';

export type SkillCategory =
  | 'Languages'
  | 'Frontend'
  | 'Backend'
  | 'Databases'
  | 'Cloud & DevOps'
  | 'Core CS'
  | 'Soft Skills';

export interface Skill {
  id: string;
  name: string;
  category: SkillCategory;
  level: SkillLevel;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  techStack: string;
  githubUrl?: string;
  liveUrl?: string;
  impact?: string;
}

export interface Internship {
  id: string;
  company: string;
  role: string;
  duration: string;
  description: string;
  certificateUrl?: string;
}

export interface Certification {
  id: string;
  title: string;
  issuer: string;
  issueYear: string;
  credentialUrl?: string;
}

export interface StudentProfile {
  name: string;
  email: string;
  phone: string;
  college: string;
  branch: string;
  year: string;
  semester: string;
  cgpa: string | number;
  tenthPercent: string | number;
  twelfthPercent: string | number;
  entranceExam: string;
  entranceRank: string;
  activeBacklogs: number;
  clearedBacklogs: number;
  skills: Skill[];
  projects: Project[];
  internships: Internship[];
  certifications: Certification[];
  targetRoles: string[];
  githubUrl: string;
  linkedinUrl: string;
  portfolioUrl: string;
  bio: string;
}

export type CompanyTier =
  | 'Tier 1 Product'
  | 'Tier 2 High Growth'
  | 'IT Services / Mass'
  | 'Core & Electronics'
  | 'Fintech';

export interface CompanyCriteria {
  id: string;
  name: string;
  tier: CompanyTier;
  logoBadge: string;
  minCgpa: number;
  maxBacklogsAllowed: number;
  minTenthPercent: number;
  minTwelfthPercent: number;
  eligibleBranches: string[];
  typicalPackage: string;
  hiringFocus: string;
  requiredSkills: string[];
}

export type EligibilityStatus = 'eligible' | 'borderline' | 'ineligible' | 'incomplete';

export interface EligibilityResult {
  company: CompanyCriteria;
  status: EligibilityStatus;
  passedChecks: string[];
  failedChecks: string[];
  recommendation: string;
}

export interface TargetRoleDef {
  id: string;
  title: string;
  description: string;
  category: string;
  requiredSkills: string[];
  goodToHaveSkills: string[];
  recommendedProjects: string[];
  avgPackage: string;
  hiringDemand: 'Very High' | 'High' | 'Moderate';
}

export interface SkillGapAnalysis {
  role: TargetRoleDef;
  matchedSkills: string[];
  missingRequiredSkills: string[];
  missingGoodToHaveSkills: string[];
  matchPercentage: number;
}

export interface RoadmapMilestone {
  phase: string;
  title: string;
  duration: string;
  keyTopics: string[];
  actionItems: string[];
  deliverables: string[];
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  source?: string;
}

export interface PlacementReadinessReport {
  overallScore: number; // 0 - 100
  grade: 'Placement Ready' | 'Near Ready' | 'Developing' | 'Needs Immediate Action' | 'Empty Profile';
  academicScore: number; // 0 - 25
  skillsScore: number; // 0 - 30
  projectsScore: number; // 0 - 25
  experienceScore: number; // 0 - 20
  strengths: string[];
  criticalGaps: string[];
  immediateSteps: string[];
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  photoUrl?: string;
  provider: 'google' | 'email';
  createdAt: string;
}

export interface AccountRecord {
  user: AuthUser;
  password?: string;
  profile: StudentProfile;
  assessmentSubmitted: boolean;
  updatedAt: string;
}

export interface LiveJob {
  id: string;
  title: string;
  company: string;
  companyLogo?: string;
  location: string;
  workMode: 'Remote' | 'Hybrid' | 'On-site';
  jobType: string;
  experienceLevel?: string;
  salary?: string;
  requiredSkills: string[];
  descriptionSummary: string;
  fullDescription?: string;
  postedDate: string;
  source: string;
  applyUrl: string;
  retrievedAt: string;
  isDemo?: boolean;
}

export interface JobMatchEvaluation {
  matchPercentage: number;
  matchingSkills: string[];
  missingSkills: string[];
  explanation: string;
  branchMatch: boolean;
  levelBonus: number;
}

export type CourseProvider =
  | 'Cisco Networking Academy'
  | 'Oracle University'
  | 'AWS Skill Builder'
  | 'Microsoft Learn'
  | 'Google Cloud'
  | 'IBM SkillsBuild'
  | 'NVIDIA';

export type CourseDifficulty = 'Beginner' | 'Intermediate' | 'Advanced';

export type CourseCategory =
  | 'Cloud Computing'
  | 'Artificial Intelligence & ML'
  | 'Cybersecurity'
  | 'Data Science & Analytics'
  | 'Software Engineering & DevOps'
  | 'Databases & Infrastructure'
  | 'Networking & Systems';

export type LearningPathStage =
  | 'START HERE'
  | 'FOUNDATION'
  | 'INTERMEDIATE'
  | 'ADVANCED'
  | 'CERTIFICATION'
  | 'REAL-WORLD PROJECT'
  | 'JOB READY';

export interface CourseRecommendation {
  id: string;
  title: string;
  provider: CourseProvider;
  providerBadge: string;
  category: CourseCategory;
  difficulty: CourseDifficulty;
  duration: string;
  costType: 'Free' | 'Paid' | 'Free with Paid Cert';
  certificationAvailable: boolean;
  certificationName?: string;
  credentialType?: string;
  skillsGained: string[];
  realWorldApplication: string;
  whyRecommended: string;
  officialUrl: string;
  handsOn: boolean;
  targetRoles: string[];
  levelOrder: LearningPathStage;
  marketDemand: 'Very High' | 'High' | 'Extremely High';
  curriculumHighlights: string[];
  featuredProjectIdea?: string;
}

export interface RealWorldProject {
  id: string;
  title: string;
  domain: string;
  targetRole: string;
  difficulty: CourseDifficulty;
  description: string;
  keySkillsPracticed: string[];
  techStack: string[];
  practicalSteps: string[];
  realWorldApplication: string;
  recruiterImpact: string;
  officialReferenceUrl?: string;
}

export interface UserLearningPathItem {
  courseId: string;
  status: 'not-started' | 'in-progress' | 'completed';
  savedAt: string;
  completedAt?: string;
  targetCompletionDate?: string;
  certificateCredentialId?: string;
  notes?: string;
  orderIndex: number;
}

