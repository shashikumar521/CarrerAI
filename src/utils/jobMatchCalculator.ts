import { StudentProfile, LiveJob, JobMatchEvaluation } from '../types';

/**
 * Normalizes skill names for accurate fuzzy/synonym matching
 * (e.g. 'React.js' == 'react', 'PostgreSQL' == 'postgres', 'TypeScript' == 'ts')
 */
function normalizeSkill(s: string): string {
  const clean = s.toLowerCase().trim();
  if (clean === 'react.js' || clean === 'reactjs') return 'react';
  if (clean === 'node.js' || clean === 'nodejs') return 'node.js';
  if (clean === 'vue.js' || clean === 'vuejs') return 'vue';
  if (clean === 'typescript') return 'ts';
  if (clean === 'javascript') return 'js';
  if (clean === 'postgresql' || clean === 'postgres') return 'postgresql';
  if (clean === 'mongodb' || clean === 'mongo') return 'mongodb';
  if (clean === 'express.js' || clean === 'expressjs') return 'express';
  if (clean === 'machine learning' || clean === 'ml') return 'machine learning';
  if (clean === 'artificial intelligence' || clean === 'ai') return 'ai';
  if (clean === 'data structures' || clean === 'dsa') return 'data structures';
  if (clean === 'git & github' || clean === 'github') return 'git';
  return clean;
}

/**
 * Calculates a transparent, realistic CareerAI Match % for a student and a live job posting.
 *
 * NOTE:
 * Explicitly labeled as "CareerAI Match" based on profile skills and job listing requirements.
 * Not an official hiring score or company evaluation.
 */
export function calculateJobMatch(
  profile: StudentProfile | null | undefined,
  job: LiveJob
): JobMatchEvaluation {
  // If profile is empty or unpopulated, return base evaluation with helpful explanation
  if (!profile || !profile.skills || profile.skills.length === 0) {
    return {
      matchPercentage: 0,
      matchingSkills: [],
      missingSkills: job.requiredSkills || [],
      explanation: 'Complete your student assessment to calculate your personalized CareerAI Match %.',
      branchMatch: false,
      levelBonus: 0,
    };
  }

  const studentSkills = profile.skills || [];
  const jobSkills = job.requiredSkills || [];

  // Map student skills with their proficiency weight
  const studentSkillMap = new Map<string, { original: string; level: string; weight: number }>();
  for (const sk of studentSkills) {
    const norm = normalizeSkill(sk.name);
    const weight = sk.level === 'Advanced' ? 1.0 : sk.level === 'Intermediate' ? 0.8 : 0.6;
    studentSkillMap.set(norm, { original: sk.name, level: sk.level, weight });
  }

  const matchingSkills: string[] = [];
  const missingSkills: string[] = [];
  let matchedSkillPoints = 0;

  for (const jSkill of jobSkills) {
    const jNorm = normalizeSkill(jSkill);

    // Check direct or partial match
    let found = false;
    for (const [sNorm, data] of studentSkillMap.entries()) {
      if (sNorm === jNorm || sNorm.includes(jNorm) || jNorm.includes(sNorm)) {
        found = true;
        matchingSkills.push(jSkill);
        matchedSkillPoints += data.weight;
        break;
      }
    }

    if (!found) {
      missingSkills.push(jSkill);
    }
  }

  // 1. Skill Match Component (up to 60 points)
  let skillScore = 0;
  if (jobSkills.length > 0) {
    skillScore = (matchedSkillPoints / jobSkills.length) * 60;
  } else {
    // If job didn't have explicit skill tags, check title keywords against student skills
    const titleLower = job.title.toLowerCase();
    let titleMatches = 0;
    for (const [sNorm] of studentSkillMap.entries()) {
      if (titleLower.includes(sNorm)) {
        titleMatches++;
      }
    }
    skillScore = Math.min(45, titleMatches * 15 + 20);
  }

  // 2. Project Portfolio Alignment (up to 15 points)
  let projectScore = 0;
  const projects = profile.projects || [];
  if (projects.length > 0) {
    for (const p of projects) {
      const pStack = (Array.isArray(p.techStack) ? p.techStack.join(' ') : (p.techStack || '')).toLowerCase();
      const pTitle = (p.title || '').toLowerCase();
      for (const mSkill of matchingSkills) {
        if (pStack.includes(normalizeSkill(mSkill)) || pTitle.includes(normalizeSkill(mSkill))) {
          projectScore += 5;
          break;
        }
      }
    }
    projectScore = Math.min(15, projectScore);
  }

  // 3. Branch & Academic Relevance (up to 10 points)
  let branchScore = 0;
  let branchMatch = false;
  const branchLower = (profile.branch || '').toLowerCase();
  const techBranches = ['computer', 'information', 'software', 'data', 'artificial', 'electronics', 'electrical'];
  const isTechBranch = techBranches.some((b) => branchLower.includes(b));
  if (isTechBranch) {
    branchScore = 10;
    branchMatch = true;
  } else if (profile.branch) {
    branchScore = 6;
  }

  // 4. Practical Experience / Internships (up to 10 points)
  let experienceScore = 0;
  if (profile.internships && profile.internships.length > 0) {
    experienceScore = 10;
  } else if (profile.certifications && profile.certifications.length > 0) {
    experienceScore = 6;
  }

  // 5. Target Role Alignment (up to 5 points)
  let roleScore = 0;
  const targetRoles = profile.targetRoles || [];
  const titleLower = job.title.toLowerCase();
  for (const tRole of targetRoles) {
    const tNorm = tRole.toLowerCase();
    if (titleLower.includes(tNorm) || tNorm.includes(titleLower.split(' ')[0])) {
      roleScore = 5;
      break;
    }
  }

  const rawTotal = Math.round(skillScore + projectScore + branchScore + experienceScore + roleScore);
  // Cap at realistic 96% (never claim 100% since human interviews evaluate live)
  const finalPercentage = Math.max(10, Math.min(96, rawTotal));

  return {
    matchPercentage: finalPercentage,
    matchingSkills: Array.from(new Set(matchingSkills)),
    missingSkills: Array.from(new Set(missingSkills)),
    explanation: 'Based on your profile and the skills listed in this job.',
    branchMatch,
    levelBonus: projectScore + experienceScore,
  };
}
