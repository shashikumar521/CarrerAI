import { StudentProfile } from '../types';
import { calculateAtsScore } from './readinessCalculator';

/**
 * ---------------------------------------------------------------------------
 * EXAM / PROJECT CONCEPT 1: DATA NORMALIZATION
 * Normalizes metrics from diverse scales (CGPA 0-10, percentages 0-100,
 * skill counts, etc.) to a standardized 0-100 scale.
 * ---------------------------------------------------------------------------
 */

/**
 * Clamps a number between a minimum and maximum bound
 */
export function clamp(val: number, min = 0, max = 100): number {
  if (isNaN(val)) return min;
  return Math.min(max, Math.max(min, val));
}

/**
 * Normalizes CGPA (typically on a 0-10 scale in Indian universities)
 * to a 0-100 percentage scale.
 * Formula: normalizedCGPA = (CGPA / 10) * 100
 */
export function normalizeCgpa(cgpa: string | number | undefined): number {
  if (!cgpa) return 0;
  const num = typeof cgpa === 'string' ? parseFloat(cgpa) : cgpa;
  if (isNaN(num) || num <= 0) return 0;
  // If user entered a percentage by mistake (> 10), clamp directly to 100
  if (num > 10) return clamp(num);
  return clamp((num / 10) * 100);
}

/**
 * Normalizes percentage fields (10th, 12th) to 0-100 scale
 */
export function normalizePercentage(val: string | number | undefined): number {
  if (!val) return 0;
  const num = typeof val === 'string' ? parseFloat(val) : val;
  if (isNaN(num)) return 0;
  return clamp(num);
}

/**
 * ---------------------------------------------------------------------------
 * EXAM / PROJECT CONCEPT 2 & 3: CONFIGURABLE WEIGHTED HEURISTIC SCORING
 * Defines weights for the 7 core placement readiness dimensions.
 * Weights must sum to 1.0 (100%).
 * ---------------------------------------------------------------------------
 */
export interface RadarDimensionWeightConfig {
  technicalSkills: number;
  dsa: number;
  communication: number;
  aptitude: number;
  projects: number;
  resumeATS: number;
  interviewReadiness: number;
}

export const DEFAULT_RADAR_WEIGHTS: RadarDimensionWeightConfig = {
  technicalSkills: 0.20,    // 20% - Core programming language and framework depth
  dsa: 0.20,                // 20% - Data structures, algorithms, and problem solving
  communication: 0.10,      // 10% - Professional communication and articulation
  aptitude: 0.15,           // 15% - Quantitative and analytical reasoning baseline
  projects: 0.15,           // 15% - Hands-on engineering portfolio & live deployments
  resumeATS: 0.10,          // 10% - ATS compliance and resume structuring
  interviewReadiness: 0.10, // 10% - Core CS theory and behavioral interview readiness
};

export type DimensionStatus = 'Exceptional' | 'Competitive' | 'Developing' | 'Needs Attention';

export interface RadarDimensionScore {
  key: keyof RadarDimensionWeightConfig;
  dimension: string;
  score: number; // 0 - 100
  fullMark: number; // always 100
  weight: number;
  status: DimensionStatus;
  benchmark: number; // Industry target baseline (usually 70-80)
  description: string;
  recommendation: string;
}

export interface PlacementRadarAnalysis {
  dimensions: RadarDimensionScore[];
  overallReadiness: number; // 0 - 100
  grade: string;
  strongestArea: RadarDimensionScore;
  improvementArea: RadarDimensionScore;
  weights: RadarDimensionWeightConfig;
  heuristicRankBenchmark: {
    estimatedPercentile: string;
    label: string;
    disclaimer: string;
  };
}

/**
 * Checks if profile has meaningful data
 */
function hasProfileData(profile: StudentProfile): boolean {
  if (!profile) return false;
  const hasName = Boolean(profile.name && profile.name.trim().length > 0);
  const hasCgpa = Boolean(profile.cgpa && parseFloat(String(profile.cgpa)) > 0);
  const hasSkills = Boolean(profile.skills && profile.skills.length > 0);
  const hasProjects = Boolean(profile.projects && profile.projects.length > 0);
  return hasName || hasCgpa || hasSkills || hasProjects;
}

/**
 * 1. Calculate Technical Skills Score (0 - 100)
 * Evaluates skill count, proficiency levels, and category breadth.
 */
export function calculateTechnicalSkillsDimension(profile: StudentProfile): number {
  if (!hasProfileData(profile)) return 0;
  const skills = profile.skills || [];
  if (skills.length === 0) return 15; // Baseline default fallback

  // Quantity factor (up to 30 points)
  const countScore = Math.min(30, skills.length * 4);

  // Depth factor based on levels (up to 45 points)
  let depthScore = 0;
  skills.forEach((s) => {
    if (s.level === 'Advanced') depthScore += 8;
    else if (s.level === 'Intermediate') depthScore += 4;
    else depthScore += 2;
  });
  depthScore = Math.min(45, depthScore);

  // Category breadth (Languages, Frontend, Backend, Databases, Cloud & DevOps, Core CS)
  const categories = new Set(skills.map((s) => s.category));
  const breadthScore = Math.min(25, categories.size * 5);

  return clamp(Math.round(countScore + depthScore + breadthScore));
}

/**
 * 2. Calculate DSA (Data Structures & Algorithms) Score (0 - 100)
 * Evaluates dedicated DSA skills, problem-solving proficiencies, and core CS anchors.
 */
export function calculateDsaDimension(profile: StudentProfile): number {
  if (!hasProfileData(profile)) return 0;
  const skills = profile.skills || [];

  const dsaKeywords = [
    'data structures',
    'algorithms',
    'dsa',
    'problem solving',
    'competitive programming',
    'leetcode',
    'c++',
    'java',
    'python',
  ];

  const matchedDsaSkills = skills.filter((s) =>
    dsaKeywords.some((kw) => s.name.toLowerCase().includes(kw))
  );

  if (matchedDsaSkills.length === 0) {
    // If no explicit DSA tagged but student has general skills, provide conservative diagnostic baseline
    return skills.length > 0 ? 35 : 0;
  }

  let score = 30; // Found at least 1 DSA-related skill

  // Check highest level
  const hasAdvanced = matchedDsaSkills.some((s) => s.level === 'Advanced');
  const hasIntermediate = matchedDsaSkills.some((s) => s.level === 'Intermediate');

  if (hasAdvanced) score += 35;
  else if (hasIntermediate) score += 20;
  else score += 10;

  // Additional credit for multiple problem-solving competencies
  score += Math.min(20, (matchedDsaSkills.length - 1) * 7);

  // Academic correlation from normalized CGPA (up to 15 points)
  const cgpaNorm = normalizeCgpa(profile.cgpa);
  score += Math.round((cgpaNorm / 100) * 15);

  return clamp(Math.round(score));
}

/**
 * 3. Calculate Communication Score (0 - 100)
 * Evaluates soft skills, professional profile narrative, and linguistic baseline.
 */
export function calculateCommunicationDimension(profile: StudentProfile): number {
  if (!hasProfileData(profile)) return 0;

  let score = 25; // Base diagnostic score for registered student

  // Check soft skills in skills list
  const softSkills = (profile.skills || []).filter(
    (s) =>
      s.category === 'Soft Skills' ||
      ['communication', 'teamwork', 'leadership', 'collaboration', 'public speaking', 'english'].some(
        (kw) => s.name.toLowerCase().includes(kw)
      )
  );
  if (softSkills.length >= 2) score += 25;
  else if (softSkills.length === 1) score += 15;

  // Completeness of bio and articulate project descriptions
  if (profile.bio && profile.bio.trim().length > 40) score += 15;
  const articulateProjects = (profile.projects || []).filter(
    (p) => p.description && p.description.length > 50
  ).length;
  if (articulateProjects >= 2) score += 15;
  else if (articulateProjects === 1) score += 8;

  // 10th/12th academic foundation as English/language surrogate indicator
  const tenthNorm = normalizePercentage(profile.tenthPercent);
  if (tenthNorm >= 85) score += 15;
  else if (tenthNorm >= 70) score += 10;
  else if (tenthNorm > 0) score += 5;

  // Contact details & professional link presentation
  if (profile.linkedinUrl && profile.linkedinUrl.trim()) score += 5;

  return clamp(Math.round(score));
}

/**
 * 4. Calculate Aptitude Score (0 - 100)
 * Evaluates quantitative reasoning and academic eligibility baseline.
 * Combines normalized CGPA, 10th%, and 12th% with backlog adjustments.
 */
export function calculateAptitudeDimension(profile: StudentProfile): number {
  if (!hasProfileData(profile)) return 0;

  const normCgpa = normalizeCgpa(profile.cgpa);
  const normTenth = normalizePercentage(profile.tenthPercent);
  const normTwelfth = normalizePercentage(profile.twelfthPercent);

  // If no academic data entered, return diagnostic baseline
  if (normCgpa === 0 && normTenth === 0 && normTwelfth === 0) {
    return 30;
  }

  // Transparent weighted heuristic for aptitude:
  // CGPA (40%) + 12th Math/Science (30%) + 10th Math (30%)
  let score = 0;
  let weightsCount = 0;

  if (normCgpa > 0) {
    score += normCgpa * 0.45;
    weightsCount += 0.45;
  }
  if (normTwelfth > 0) {
    score += normTwelfth * 0.30;
    weightsCount += 0.30;
  }
  if (normTenth > 0) {
    score += normTenth * 0.25;
    weightsCount += 0.25;
  }

  // Rescale if some components are missing
  if (weightsCount > 0 && weightsCount < 1) {
    score = score / weightsCount;
  }

  // Bonus for entrance exam rank if provided
  if (profile.entranceRank && profile.entranceRank.trim()) {
    score = Math.min(100, score + 6);
  }

  // Backlog penalty: active backlogs impair campus test eligibility
  const backlogs = Number(profile.activeBacklogs) || 0;
  if (backlogs > 0) {
    score = Math.max(0, score - backlogs * 12);
  }

  return clamp(Math.round(score));
}

/**
 * 5. Calculate Projects Dimension (0 - 100)
 * Evaluates project volume, GitHub links, live deployments, and quantified metrics.
 */
export function calculateProjectsDimension(profile: StudentProfile): number {
  if (!hasProfileData(profile)) return 0;
  const projects = profile.projects || [];
  if (projects.length === 0) return 20; // Default baseline for profile without projects

  // Volume: 1 = 30 pts, 2 = 50 pts, 3+ = 65 pts
  let score = 0;
  if (projects.length >= 3) score += 65;
  else if (projects.length === 2) score += 50;
  else score += 30;

  // Code repository verification
  const githubProjects = projects.filter((p) => p.githubUrl && p.githubUrl.trim().length > 0);
  score += Math.min(15, githubProjects.length * 7.5);

  // Live deployment verification
  const liveProjects = projects.filter((p) => p.liveUrl && p.liveUrl.trim().length > 0);
  score += Math.min(10, liveProjects.length * 5);

  // Quantified engineering impact in bullets
  const impactProjects = projects.filter(
    (p) => p.impact && (p.impact.includes('%') || /\d+/.test(p.impact))
  );
  score += Math.min(10, impactProjects.length * 5);

  return clamp(Math.round(score));
}

/**
 * 6. Calculate Resume / ATS Dimension (0 - 100)
 * Reuses the existing calculateAtsScore from readinessCalculator.
 */
export function calculateResumeAtsDimension(profile: StudentProfile): number {
  if (!hasProfileData(profile)) return 0;
  const atsResult = calculateAtsScore(profile);
  return clamp(atsResult.score);
}

/**
 * 7. Calculate Interview Readiness Dimension (0 - 100)
 * Evaluates Core CS theory (OS, DBMS, Networks, OOPs), behavioral readiness, and credentials.
 */
export function calculateInterviewReadinessDimension(profile: StudentProfile): number {
  if (!hasProfileData(profile)) return 0;

  let score = 25; // Base diagnostic readiness
  const skills = profile.skills || [];

  // Core CS interview pillars (OS, DBMS, Computer Networks, OOPs, System Design)
  const coreCsKeywords = ['operating systems', 'dbms', 'database', 'networks', 'oops', 'system design', 'sql'];
  const matchedCoreCs = skills.filter((s) =>
    coreCsKeywords.some((kw) => s.name.toLowerCase().includes(kw))
  );
  score += Math.min(30, matchedCoreCs.length * 10);

  // Advanced technical depth
  const advancedCount = skills.filter((s) => s.level === 'Advanced').length;
  score += Math.min(15, advancedCount * 5);

  // Practical project proof of work
  const projects = profile.projects || [];
  if (projects.length >= 2) score += 15;
  else if (projects.length === 1) score += 8;

  // Industry exposure: internships and verified certifications
  const internships = profile.internships || [];
  const certifications = profile.certifications || [];
  if (internships.length > 0) score += 10;
  if (certifications.length > 0) score += 5;

  return clamp(Math.round(score));
}

/**
 * Assigns a human-readable proficiency tier based on dimension score
 */
function getDimensionStatus(score: number): DimensionStatus {
  if (score >= 80) return 'Exceptional';
  if (score >= 65) return 'Competitive';
  if (score >= 45) return 'Developing';
  return 'Needs Attention';
}

/**
 * ---------------------------------------------------------------------------
 * MAIN FUNCTION: Calculate Comprehensive Placement Readiness Radar Analysis
 * Combines all 7 dimensions using configurable transparent heuristic weights.
 * ---------------------------------------------------------------------------
 */
export function calculatePlacementRadarAnalysis(
  profile: StudentProfile,
  customWeights: Partial<RadarDimensionWeightConfig> = {}
): PlacementRadarAnalysis {
  const weights: RadarDimensionWeightConfig = {
    ...DEFAULT_RADAR_WEIGHTS,
    ...customWeights,
  };

  const techScore = calculateTechnicalSkillsDimension(profile);
  const dsaScore = calculateDsaDimension(profile);
  const commScore = calculateCommunicationDimension(profile);
  const aptScore = calculateAptitudeDimension(profile);
  const projScore = calculateProjectsDimension(profile);
  const atsScore = calculateResumeAtsDimension(profile);
  const intScore = calculateInterviewReadinessDimension(profile);

  const dimensions: RadarDimensionScore[] = [
    {
      key: 'technicalSkills',
      dimension: 'Technical Skills',
      score: techScore,
      fullMark: 100,
      weight: weights.technicalSkills,
      status: getDimensionStatus(techScore),
      benchmark: 75,
      description: 'Breadth and depth across programming languages, backend frameworks, and databases.',
      recommendation: techScore < 75 ? 'Add at least 2 advanced backend/fullstack competencies to your profile.' : 'Strong technical competency aligned with top recruiter expectations.',
    },
    {
      key: 'dsa',
      dimension: 'DSA',
      score: dsaScore,
      fullMark: 100,
      weight: weights.dsa,
      status: getDimensionStatus(dsaScore),
      benchmark: 75,
      description: 'Data Structures, algorithmic problem-solving speed, and coding round proficiency.',
      recommendation: dsaScore < 75 ? 'Practice core topics: Binary Trees, Graph BFS/DFS, and Dynamic Programming on LeetCode.' : 'High algorithmic problem-solving capacity verified for coding rounds.',
    },
    {
      key: 'communication',
      dimension: 'Communication',
      score: commScore,
      fullMark: 100,
      weight: weights.communication,
      status: getDimensionStatus(commScore),
      benchmark: 70,
      description: 'Professional articulation, team collaboration indicators, and resume narrative clarity.',
      recommendation: commScore < 70 ? 'Include soft skills and articulate quantifiable impacts in your project summaries.' : 'Confident narrative and clear professional presentation.',
    },
    {
      key: 'aptitude',
      dimension: 'Aptitude',
      score: aptScore,
      fullMark: 100,
      weight: weights.aptitude,
      status: getDimensionStatus(aptScore),
      benchmark: 70,
      description: 'Quantitative reasoning, academic consistency (CGPA / 10th / 12th), and drive eligibility.',
      recommendation: aptScore < 70 ? 'Maintain CGPA above 7.5 and clear any backlogs before campus hiring starts.' : 'Strong academic and quantitative eligibility for campus recruitment drives.',
    },
    {
      key: 'projects',
      dimension: 'Projects',
      score: projScore,
      fullMark: 100,
      weight: weights.projects,
      status: getDimensionStatus(projScore),
      benchmark: 75,
      description: 'Flagship engineering portfolio, public GitHub repositories, and live demo deployments.',
      recommendation: projScore < 75 ? 'Deploy at least 1 production-ready full-stack application with live URL and GitHub link.' : 'Impressive portfolio with verified repositories and live deployments.',
    },
    {
      key: 'resumeATS',
      dimension: 'Resume / ATS',
      score: atsScore,
      fullMark: 100,
      weight: weights.resumeATS,
      status: getDimensionStatus(atsScore),
      benchmark: 80,
      description: 'Single-column ATS keyword optimization, contact integrity, and metric quantification.',
      recommendation: atsScore < 80 ? 'Run the ATS Audit to add missing recruiter keywords and measurable results.' : 'High-scoring ATS resume formatted to clear recruiter screening bots.',
    },
    {
      key: 'interviewReadiness',
      dimension: 'Interview Readiness',
      score: intScore,
      fullMark: 100,
      weight: weights.interviewReadiness,
      status: getDimensionStatus(intScore),
      benchmark: 70,
      description: 'Core CS fundamentals (OS, DBMS, Networks, OOPs) and behavioral STAR readiness.',
      recommendation: intScore < 70 ? 'Revise OS and DBMS fundamentals in the Interview Drill Hub.' : 'Solid grasp of core engineering subjects and technical interview answers.',
    },
  ];

  // Weighted Heuristic Total
  const rawWeightedScore =
    techScore * weights.technicalSkills +
    dsaScore * weights.dsa +
    commScore * weights.communication +
    aptScore * weights.aptitude +
    projScore * weights.projects +
    atsScore * weights.resumeATS +
    intScore * weights.interviewReadiness;

  const overallReadiness = clamp(Math.round(rawWeightedScore));

  // Determine Strongest and Biggest Improvement Area
  const sortedByScore = [...dimensions].sort((a, b) => b.score - a.score);
  const strongestArea = sortedByScore[0];
  const improvementArea = sortedByScore[sortedByScore.length - 1];

  let grade = 'Needs Immediate Preparation';
  if (overallReadiness >= 75) grade = 'Placement Ready';
  else if (overallReadiness >= 60) grade = 'Near Placement Ready';
  else if (overallReadiness >= 40) grade = 'Developing';

  // Transparent Heuristic Rank Benchmark (Diagnostic estimate, not an actual university rank)
  let estimatedPercentile = 'Top 15%';
  if (overallReadiness < 40) estimatedPercentile = 'Baseline Tier';
  else if (overallReadiness < 60) estimatedPercentile = 'Top 50%';
  else if (overallReadiness < 75) estimatedPercentile = 'Top 30%';

  return {
    dimensions,
    overallReadiness,
    grade,
    strongestArea,
    improvementArea,
    weights,
    heuristicRankBenchmark: {
      estimatedPercentile,
      label: 'Estimated Readiness Benchmark',
      disclaimer: 'Calculated via rule-based weighted heuristics for self-assessment; does not represent an official university or corporate rank.',
    },
  };
}
