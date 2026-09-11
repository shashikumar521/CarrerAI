import {
  StudentProfile,
  CompanyCriteria,
  EligibilityResult,
  PlacementReadinessReport,
  TargetRoleDef,
  SkillGapAnalysis,
} from '../types';
import { TARGET_ROLE_DEFINITIONS } from '../data/mockDatabase';

/**
 * Checks if student profile is empty
 */
export function isProfileEmpty(profile: StudentProfile): boolean {
  if (!profile) return true;
  const hasName = Boolean(profile.name && profile.name.trim().length > 0);
  const hasCgpa = Boolean(profile.cgpa && Number(profile.cgpa) > 0);
  const hasSkills = Boolean(profile.skills && profile.skills.length > 0);
  const hasProjects = Boolean(profile.projects && profile.projects.length > 0);
  return !hasName && !hasCgpa && !hasSkills && !hasProjects;
}

/**
 * Calculate comprehensive placement readiness score and diagnostic report
 */
export function calculatePlacementReadiness(
  profile: StudentProfile
): PlacementReadinessReport {
  if (isProfileEmpty(profile)) {
    return {
      overallScore: 0,
      grade: 'Empty Profile',
      academicScore: 0,
      skillsScore: 0,
      projectsScore: 0,
      experienceScore: 0,
      strengths: [],
      criticalGaps: [
        'Profile has no academic or project details recorded.',
        'Add your CGPA, Branch, Semester, and 10th/12th percentages.',
        'List at least 3-5 technical skills and 1-2 major projects.',
      ],
      immediateSteps: [
        'Go to "Student Profile" and input your college & academic data.',
        'Tag your technical skills (Languages, Frameworks, Core CS).',
        'Add your major engineering projects with GitHub repositories.',
      ],
    };
  }

  const cgpa = Number(profile.cgpa) || 0;
  const activeBacklogs = Number(profile.activeBacklogs) || 0;
  const tenth = Number(profile.tenthPercent) || 0;
  const twelfth = Number(profile.twelfthPercent) || 0;
  const skills = profile.skills || [];
  const projects = profile.projects || [];
  const internships = profile.internships || [];
  const certifications = profile.certifications || [];

  // 1. Academic Score (Max 25)
  let academicScore = 0;
  if (cgpa >= 8.5) academicScore += 15;
  else if (cgpa >= 7.5) academicScore += 12;
  else if (cgpa >= 6.5) academicScore += 8;
  else if (cgpa >= 6.0) academicScore += 5;

  if (tenth >= 75 && twelfth >= 75) academicScore += 5;
  else if (tenth >= 60 && twelfth >= 60) academicScore += 3;

  if (activeBacklogs === 0) academicScore += 5;
  else academicScore = Math.max(0, academicScore - activeBacklogs * 6);

  // 2. Skills Score (Max 30)
  let skillsScore = 0;
  const skillCount = skills.length;
  skillsScore += Math.min(12, skillCount * 2);

  const advancedCount = skills.filter((s) => s.level === 'Advanced').length;
  const intermediateCount = skills.filter((s) => s.level === 'Intermediate').length;
  skillsScore += Math.min(10, advancedCount * 3 + intermediateCount * 1.5);

  const hasCoreCs = skills.some((s) => s.category === 'Core CS');
  const hasLanguages = skills.some((s) => s.category === 'Languages');
  const hasDatabases = skills.some((s) => s.category === 'Databases');
  if (hasCoreCs) skillsScore += 3;
  if (hasLanguages) skillsScore += 3;
  if (hasDatabases) skillsScore += 2;
  skillsScore = Math.min(30, Math.round(skillsScore));

  // 3. Projects Score (Max 25)
  let projectsScore = 0;
  const projCount = projects.length;
  if (projCount >= 3) projectsScore += 14;
  else if (projCount === 2) projectsScore += 10;
  else if (projCount === 1) projectsScore += 6;

  const withGithub = projects.filter((p) => p.githubUrl && p.githubUrl.trim()).length;
  const withLive = projects.filter((p) => p.liveUrl && p.liveUrl.trim()).length;
  projectsScore += Math.min(6, withGithub * 3);
  projectsScore += Math.min(5, withLive * 2.5);
  projectsScore = Math.min(25, Math.round(projectsScore));

  // 4. Experience & Credentials Score (Max 20)
  let experienceScore = 0;
  if (internships.length >= 2) experienceScore += 12;
  else if (internships.length === 1) experienceScore += 8;

  if (certifications.length >= 2) experienceScore += 8;
  else if (certifications.length === 1) experienceScore += 5;
  experienceScore = Math.min(20, Math.round(experienceScore));

  const totalScore = Math.min(100, academicScore + skillsScore + projectsScore + experienceScore);

  let grade: PlacementReadinessReport['grade'] = 'Needs Immediate Action';
  if (totalScore >= 75) grade = 'Placement Ready';
  else if (totalScore >= 60) grade = 'Near Ready';
  else if (totalScore >= 40) grade = 'Developing';

  const strengths: string[] = [];
  const criticalGaps: string[] = [];
  const immediateSteps: string[] = [];

  if (cgpa >= 8.0) strengths.push(`High CGPA (${cgpa}) meets Tier-1 product company cutoff requirements.`);
  if (activeBacklogs === 0) strengths.push('Zero active backlogs ensures uninhibited eligibility in campus recruitment drives.');
  if (advancedCount >= 2) strengths.push(`Possesses strong depth in ${advancedCount} core technical skills.`);
  if (projects.length >= 2) strengths.push(`Portfolio includes ${projects.length} notable technical projects.`);
  if (internships.length > 0) strengths.push(`Demonstrated industry exposure with ${internships.length} internship experience(s).`);

  if (activeBacklogs > 0) {
    criticalGaps.push(`You have ${activeBacklogs} active backlog(s). 75%+ companies mandate zero active backlogs.`);
    immediateSteps.push('Prioritize upcoming supplementary exams to clear all outstanding backlogs before 7th semester.');
  }
  if (cgpa > 0 && cgpa < 7.0) {
    criticalGaps.push('CGPA is below 7.0, which restricts access to several Tier 1 & Tier 2 campus shortlists.');
    immediateSteps.push('Target high-growth startups and off-campus roles by building competitive hackathon projects.');
  }
  if (projects.length < 2) {
    criticalGaps.push('Less than 2 major engineering projects in portfolio.');
    immediateSteps.push('Build and deploy a full-stack or systems project with live demonstration link.');
  }
  if (!skills.some((s) => s.name.toLowerCase().includes('data structure') || s.name.toLowerCase().includes('dsa'))) {
    criticalGaps.push('DSA (Data Structures & Algorithms) is not explicitly listed in your skillset.');
    immediateSteps.push('Start solving 2-3 LeetCode problems daily focused on Arrays, HashMaps, and Binary Search.');
  }
  if (skills.length < 4) {
    criticalGaps.push('Technical skill coverage is minimal.');
    immediateSteps.push('Add core technical skills including Languages, Databases, and Version Control.');
  }

  return {
    overallScore: totalScore,
    grade,
    academicScore,
    skillsScore,
    projectsScore,
    experienceScore,
    strengths,
    criticalGaps,
    immediateSteps,
  };
}

/**
 * Evaluate company criteria against student profile
 */
export function evaluateCompanyEligibility(
  profile: StudentProfile,
  companies: CompanyCriteria[]
): EligibilityResult[] {
  const isStudentEmpty = isProfileEmpty(profile);
  const studentCgpa = Number(profile.cgpa) || 0;
  const studentBacklogs = Number(profile.activeBacklogs) || 0;
  const studentTenth = Number(profile.tenthPercent) || 0;
  const studentTwelfth = Number(profile.twelfthPercent) || 0;
  const studentBranch = (profile.branch || '').toLowerCase();

  return companies.map((company) => {
    if (isStudentEmpty || studentCgpa === 0) {
      return {
        company,
        status: 'incomplete',
        passedChecks: [],
        failedChecks: ['Student profile data is missing or incomplete.'],
        recommendation: 'Complete your CGPA, branch, and academic percentages to check eligibility.',
      };
    }

    const passedChecks: string[] = [];
    const failedChecks: string[] = [];

    // Check CGPA
    if (studentCgpa >= company.minCgpa) {
      passedChecks.push(`CGPA (${studentCgpa}) satisfies minimum required ${company.minCgpa}`);
    } else {
      failedChecks.push(`CGPA (${studentCgpa}) is below required ${company.minCgpa}`);
    }

    // Check Backlogs
    if (studentBacklogs <= company.maxBacklogsAllowed) {
      passedChecks.push(`Backlogs (${studentBacklogs}) within acceptable limit (Max: ${company.maxBacklogsAllowed})`);
    } else {
      failedChecks.push(`Active backlogs (${studentBacklogs}) exceed maximum allowed (${company.maxBacklogsAllowed})`);
    }

    // Check 10th & 12th
    if (studentTenth > 0) {
      if (studentTenth >= company.minTenthPercent) {
        passedChecks.push(`10th score (${studentTenth}%) meets cutoff of ${company.minTenthPercent}%`);
      } else {
        failedChecks.push(`10th score (${studentTenth}%) is below cutoff of ${company.minTenthPercent}%`);
      }
    }
    if (studentTwelfth > 0) {
      if (studentTwelfth >= company.minTwelfthPercent) {
        passedChecks.push(`12th score (${studentTwelfth}%) meets cutoff of ${company.minTwelfthPercent}%`);
      } else {
        failedChecks.push(`12th score (${studentTwelfth}%) is below cutoff of ${company.minTwelfthPercent}%`);
      }
    }

    // Check Branch
    const branchMatched =
      company.eligibleBranches.some((b) => b.toLowerCase().includes('all')) ||
      company.eligibleBranches.some((b) => studentBranch.includes(b.toLowerCase()) || b.toLowerCase().includes(studentBranch));

    if (studentBranch && branchMatched) {
      passedChecks.push(`Branch "${profile.branch}" is eligible.`);
    } else if (studentBranch && !branchMatched) {
      failedChecks.push(`Branch "${profile.branch}" is generally not in primary hiring shortlist.`);
    }

    let status: EligibilityResult['status'] = 'eligible';
    let recommendation = `You are fully eligible to participate in ${company.name}'s recruitment drive! Focus on ${company.hiringFocus}.`;

    if (failedChecks.length > 0) {
      const cgpaDiff = company.minCgpa - studentCgpa;
      if (failedChecks.length === 1 && cgpaDiff > 0 && cgpaDiff <= 0.3 && studentBacklogs === 0) {
        status = 'borderline';
        recommendation = `Close to eligibility! A slight increase of ${cgpaDiff.toFixed(2)} CGPA in the upcoming semester will qualify you.`;
      } else {
        status = 'ineligible';
        recommendation = `Currently ineligible primarily due to: ${failedChecks[0]}. Check off-campus or hackathon referral opportunities.`;
      }
    }

    return {
      company,
      status,
      passedChecks,
      failedChecks,
      recommendation,
    };
  });
}

/**
 * Analyze skill gap against a specific target role
 */
export function analyzeSkillGap(
  profile: StudentProfile,
  roleId: string
): SkillGapAnalysis {
  const role =
    TARGET_ROLE_DEFINITIONS.find((r) => r.id === roleId) ||
    TARGET_ROLE_DEFINITIONS[0];

  const studentSkillNames = (profile.skills || []).map((s) => s.name.toLowerCase());

  const matchedSkills: string[] = [];
  const missingRequiredSkills: string[] = [];
  const missingGoodToHaveSkills: string[] = [];

  role.requiredSkills.forEach((req) => {
    const isMatched = studentSkillNames.some(
      (st) =>
        st.includes(req.toLowerCase()) ||
        req.toLowerCase().includes(st) ||
        (req.toLowerCase().includes('dsa') && st.includes('algorithm')) ||
        (req.toLowerCase().includes('sql') && (st.includes('postgres') || st.includes('mysql') || st.includes('dbms')))
    );
    if (isMatched) {
      matchedSkills.push(req);
    } else {
      missingRequiredSkills.push(req);
    }
  });

  role.goodToHaveSkills.forEach((opt) => {
    const isMatched = studentSkillNames.some(
      (st) => opt.toLowerCase().includes(st) || st.includes(opt.toLowerCase())
    );
    if (isMatched) {
      matchedSkills.push(opt);
    } else {
      missingGoodToHaveSkills.push(opt);
    }
  });

  const totalRequired = role.requiredSkills.length;
  const matchedRequiredCount = role.requiredSkills.filter((req) =>
    matchedSkills.includes(req)
  ).length;

  const matchPercentage =
    totalRequired > 0 ? Math.round((matchedRequiredCount / totalRequired) * 100) : 0;

  return {
    role,
    matchedSkills,
    missingRequiredSkills,
    missingGoodToHaveSkills,
    matchPercentage,
  };
}

/**
 * Calculate ATS Resume score & suggestions
 */
export function calculateAtsScore(profile: StudentProfile): {
  score: number;
  suggestions: string[];
  passedItems: string[];
} {
  if (isProfileEmpty(profile)) {
    return {
      score: 0,
      suggestions: [
        'Resume is empty. Fill your academic profile and add projects.',
        'Add contact information (Email, LinkedIn, GitHub).',
        'Add technical skills divided by categories.',
      ],
      passedItems: [],
    };
  }

  let score = 20; // Base score for having a profile
  const suggestions: string[] = [];
  const passedItems: string[] = [];

  if (profile.name && profile.email && profile.phone) {
    score += 15;
    passedItems.push('Header with complete contact details (Name, Email, Phone)');
  } else {
    suggestions.push('Ensure complete contact info including phone number and university email.');
  }

  if (profile.githubUrl || profile.linkedinUrl) {
    score += 10;
    passedItems.push('Professional portfolio/code links (GitHub / LinkedIn)');
  } else {
    suggestions.push('Add your GitHub profile and LinkedIn URL to verify code samples.');
  }

  if (profile.skills && profile.skills.length >= 5) {
    score += 15;
    passedItems.push(`Technical Skills section populated (${profile.skills.length} skills listed)`);
  } else {
    suggestions.push('List at least 5-8 industry relevant technical skills.');
  }

  if (profile.projects && profile.projects.length >= 2) {
    score += 20;
    passedItems.push(`Projects section with ${profile.projects.length} technical showcases`);
  } else {
    suggestions.push('Include at least 2 distinct engineering projects with technical stack breakdown.');
  }

  const hasImpactMetric = (profile.projects || []).some(
    (p) => p.impact && (p.impact.includes('%') || /\d+/.test(p.impact))
  );
  if (hasImpactMetric) {
    score += 10;
    passedItems.push('Quantified project impact (contains metrics/percentages)');
  } else {
    suggestions.push('Add quantifiable impact to project bullets (e.g., "reduced latency by 25%", "served 100+ requests").');
  }

  if (profile.internships && profile.internships.length > 0) {
    score += 10;
    passedItems.push('Work experience / Internship credentials documented');
  } else {
    suggestions.push('If applicable, add internships, research assistantships, or open source contributions.');
  }

  return {
    score: Math.min(100, score),
    suggestions,
    passedItems,
  };
}
