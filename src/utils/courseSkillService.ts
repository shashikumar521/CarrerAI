import { CourseRecommendation, StudentProfile, UserLearningPathItem } from '../types';
import { REAL_WORLD_COURSES, LEARNING_PATH_STORAGE_KEY } from '../data/coursesDatabase';

/**
 * Event name dispatched when any course progress or active learning item changes.
 */
export const COURSE_PROGRESS_UPDATED_EVENT = 'careerai-course-progress-updated';

/**
 * Technical Competency Skill Definition with Rule-Based Course Mapping
 */
export interface TechnicalSkillDefinition {
  id: string;
  name: string; // Display name e.g. "PYTHON"
  canonicalName: string; // Lowercase matching name
  category: string;
  recommendedCourseId?: string; // Quick link to catalog course
}

/**
 * The 6 Core Technical Competencies required by the CareerAI dashboard.
 */
export const CORE_TECHNICAL_COMPETENCIES: TechnicalSkillDefinition[] = [
  {
    id: 'skill-python',
    name: 'PYTHON',
    canonicalName: 'python',
    category: 'Programming',
    recommendedCourseId: 'cisco-python-essentials',
  },
  {
    id: 'skill-data-analysis',
    name: 'DATA ANALYSIS',
    canonicalName: 'data analysis',
    category: 'Analytics',
    recommendedCourseId: 'cisco-data-analytics-essentials',
  },
  {
    id: 'skill-pandas',
    name: 'PANDAS',
    canonicalName: 'pandas',
    category: 'Data Science',
    recommendedCourseId: 'ibm-pandas-data-science',
  },
  {
    id: 'skill-sql-dbms',
    name: 'SQL & DBMS',
    canonicalName: 'sql & dbms',
    category: 'Databases',
    recommendedCourseId: 'oracle-database-sql-associate',
  },
  {
    id: 'skill-system-design',
    name: 'SYSTEM DESIGN',
    canonicalName: 'system design',
    category: 'Architecture',
    recommendedCourseId: 'system-design-distributed-systems',
  },
  {
    id: 'skill-cloud-devops',
    name: 'CLOUD & DEVOPS',
    canonicalName: 'cloud & devops',
    category: 'Infrastructure',
    recommendedCourseId: 'aws-cloud-practitioner',
  },
];

/**
 * Structured result for each skill card displayed in the dashboard
 */
export interface SkillProgressCardData {
  id: string;
  name: string;
  percent: number; // 0 if no active course, else average completion 0-100
  displayPercent: string; // e.g. "65%" or "No active course"
  level: string; // "Started" | "Beginner" | "Intermediate" | "Proficient" | "Advanced" | "Master" | "No Active Course"
  category: string;
  hasActiveCourse: boolean;
  activeCourses: {
    courseId: string;
    title: string;
    progressPercentage: number;
    provider?: string;
  }[];
}

/**
 * Maps course completion percentage to skill proficiency level according to strict thresholds:
 * 0–19%   → Started
 * 20–39%  → Beginner
 * 40–59%  → Intermediate
 * 60–79%  → Proficient
 * 80–94%  → Advanced
 * 95–100% → Master
 */
export function getSkillLevelFromProgress(percent: number): string {
  const p = Math.round(percent);
  if (p >= 95) return 'Master';
  if (p >= 80) return 'Advanced';
  if (p >= 60) return 'Proficient';
  if (p >= 40) return 'Intermediate';
  if (p >= 20) return 'Beginner';
  return 'Started';
}

/**
 * Resolves a course by ID from the catalog or constructs a placeholder
 */
export function resolveCourseDetails(courseId: string, customTitle?: string): {
  id: string;
  title: string;
  skillsGained: string[];
  category: string;
  provider: string;
} {
  const found = REAL_WORLD_COURSES.find((c) => c.id === courseId);
  if (found) {
    return {
      id: found.id,
      title: found.title,
      skillsGained: found.skillsGained,
      category: found.category,
      provider: found.provider,
    };
  }

  return {
    id: courseId,
    title: customTitle || courseId,
    skillsGained: [],
    category: 'Course',
    provider: 'Industry Course',
  };
}

/**
 * Checks if a course is associated with a given skill name.
 * Handles exact mappings, keyword rules, and dynamic skill associations.
 *
 * Specific examples required:
 * - Python Programming → Python
 * - Python for Data Science → Python
 * - Data Analysis with Python → Data Analysis (and Pandas)
 * - Pandas → Pandas
 * - SQL / Database Management → SQL & DBMS
 * - System Design → System Design
 * - AWS / Azure / Google Cloud → Cloud & DevOps
 * - DevOps → Cloud & DevOps
 */
export function isCourseAssociatedWithSkill(
  courseInfo: { id?: string; title: string; skillsGained?: string[]; category?: string },
  targetSkillName: string
): boolean {
  const skill = targetSkillName.trim().toLowerCase();
  const title = (courseInfo.title || '').toLowerCase();
  const category = (courseInfo.category || '').toLowerCase();
  const skills = (courseInfo.skillsGained || []).map((s) => s.toLowerCase());
  const courseId = (courseInfo.id || '').toLowerCase();

  // 1. PYTHON
  if (skill === 'python') {
    if (title.includes('python') || courseId.includes('python')) return true;
    if (skills.some((s) => s.includes('python'))) return true;
    return false;
  }

  // 2. DATA ANALYSIS
  if (skill === 'data analysis' || skill === 'data analytics' || skill === 'analytics') {
    if (title.includes('data analysis') || title.includes('data analytics') || title.includes('power bi') || title.includes('tableau')) {
      return true;
    }
    if (courseId.includes('data-analysis') || courseId.includes('data-analytics')) return true;
    if (
      skills.some(
        (s) =>
          s.includes('data analysis') ||
          s.includes('data analytics') ||
          s.includes('exploratory data') ||
          s.includes('eda') ||
          s.includes('data cleaning') ||
          s.includes('tableau') ||
          s.includes('power bi')
      )
    ) {
      return true;
    }
    return false;
  }

  // 3. PANDAS
  if (skill === 'pandas') {
    if (title.includes('pandas') || courseId.includes('pandas')) return true;
    if (skills.some((s) => s.includes('pandas') || s.includes('dataframe') || s.includes('data wrangling'))) {
      return true;
    }
    // "Data Analysis with Python" typically covers Pandas
    if (title.includes('data analysis with python') || title.includes('python for data science')) {
      return true;
    }
    return false;
  }

  // 4. SQL & DBMS
  if (
    skill === 'sql & dbms' ||
    skill === 'sql' ||
    skill === 'dbms' ||
    skill === 'database' ||
    skill === 'databases'
  ) {
    if (
      title.includes('sql') ||
      title.includes('dbms') ||
      title.includes('database') ||
      title.includes('postgresql') ||
      title.includes('oracle database') ||
      courseId.includes('sql') ||
      courseId.includes('database')
    ) {
      return true;
    }
    if (
      skills.some(
        (s) =>
          s.includes('sql') ||
          s.includes('database') ||
          s.includes('dbms') ||
          s.includes('acid') ||
          s.includes('relational')
      )
    ) {
      return true;
    }
    return false;
  }

  // 5. SYSTEM DESIGN
  if (skill === 'system design' || skill === 'software architecture' || skill === 'distributed systems') {
    if (
      title.includes('system design') ||
      title.includes('distributed system') ||
      title.includes('microservices') ||
      title.includes('software architecture') ||
      courseId.includes('system-design')
    ) {
      return true;
    }
    if (
      skills.some(
        (s) =>
          s.includes('system design') ||
          s.includes('microservices') ||
          s.includes('distributed systems') ||
          s.includes('scalability') ||
          s.includes('load balancing') ||
          s.includes('high availability')
      )
    ) {
      return true;
    }
    return false;
  }

  // 6. CLOUD & DEVOPS
  if (
    skill === 'cloud & devops' ||
    skill === 'cloud' ||
    skill === 'devops' ||
    skill === 'cloud computing'
  ) {
    if (
      title.includes('cloud') ||
      title.includes('devops') ||
      title.includes('aws') ||
      title.includes('azure') ||
      title.includes('google cloud') ||
      title.includes('oci') ||
      title.includes('docker') ||
      title.includes('kubernetes') ||
      title.includes('terraform') ||
      title.includes('ci/cd') ||
      courseId.includes('aws') ||
      courseId.includes('cloud') ||
      courseId.includes('devops') ||
      category.includes('cloud')
    ) {
      return true;
    }
    if (
      skills.some(
        (s) =>
          s.includes('cloud') ||
          s.includes('devops') ||
          s.includes('aws') ||
          s.includes('azure') ||
          s.includes('docker') ||
          s.includes('kubernetes') ||
          s.includes('terraform')
      )
    ) {
      return true;
    }
    return false;
  }

  // 7. General Dynamic matching for any custom skill (e.g. Java, React, Node.js, Cybersecurity)
  if (title.includes(skill) || courseId.includes(skill)) {
    return true;
  }
  if (skills.some((s) => s.includes(skill) || skill.includes(s))) {
    return true;
  }

  return false;
}

/**
 * Read the current learning path from localStorage.
 */
export function getUserLearningPath(): UserLearningPathItem[] {
  try {
    const saved = localStorage.getItem(LEARNING_PATH_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Failed to parse learning path from localStorage', e);
  }
  return [];
}

/**
 * Save updated learning path to localStorage and notify all listeners.
 */
export function saveUserLearningPath(items: UserLearningPathItem[]): void {
  try {
    localStorage.setItem(LEARNING_PATH_STORAGE_KEY, JSON.stringify(items));
    window.dispatchEvent(
      new CustomEvent(COURSE_PROGRESS_UPDATED_EVENT, { detail: items })
    );
  } catch (e) {
    console.warn('Failed to save learning path to localStorage', e);
  }
}

/**
 * Updates progress percentage for a specific course and triggers real-time updates.
 */
export function updateCourseProgress(courseId: string, progressPercentage: number): void {
  const items = getUserLearningPath();
  const clamped = Math.max(0, Math.min(100, Math.round(progressPercentage)));
  let found = false;

  const updatedItems = items.map((item) => {
    if (item.courseId === courseId) {
      found = true;
      return {
        ...item,
        progressPercentage: clamped,
        status: clamped >= 100 ? ('completed' as const) : ('in-progress' as const),
        completedAt: clamped >= 100 ? new Date().toISOString() : item.completedAt,
      };
    }
    return item;
  });

  if (!found) {
    // If not already in learning path, enroll it as an active course
    const course = REAL_WORLD_COURSES.find((c) => c.id === courseId);
    updatedItems.push({
      courseId,
      courseTitle: course?.title,
      status: clamped >= 100 ? 'completed' : 'in-progress',
      progressPercentage: clamped,
      savedAt: new Date().toISOString(),
      completedAt: clamped >= 100 ? new Date().toISOString() : undefined,
      orderIndex: updatedItems.length,
    });
  }

  saveUserLearningPath(updatedItems);
}

/**
 * Enrolls the user in a course and sets its status to active/in-progress.
 */
export function enrollInCourse(courseId: string, initialProgress: number = 0): void {
  const items = getUserLearningPath();
  const clamped = Math.max(0, Math.min(100, Math.round(initialProgress)));
  const existingIndex = items.findIndex((i) => i.courseId === courseId);

  if (existingIndex >= 0) {
    items[existingIndex] = {
      ...items[existingIndex],
      status: 'in-progress',
      progressPercentage: items[existingIndex].progressPercentage ?? clamped,
    };
  } else {
    const course = REAL_WORLD_COURSES.find((c) => c.id === courseId);
    items.push({
      courseId,
      courseTitle: course?.title,
      status: 'in-progress',
      progressPercentage: clamped,
      savedAt: new Date().toISOString(),
      orderIndex: items.length,
    });
  }

  saveUserLearningPath([...items]);
}

/**
 * Calculates skill progress dynamically from the user's currently active learning courses.
 *
 * Rules:
 * 1. Only includes CURRENTLY ACTIVE / CURRENTLY LEARNING courses (status === 'in-progress' or 'active').
 * 2. Excludes completed, abandoned, or unrelated courses.
 * 3. If multiple active courses match: calculates the average completion percentage.
 * 4. If no active course matches: returns displayPercent "No active course", percent 0, and level "No Active Course".
 */
export function calculateSkillProgress(
  skillName: string,
  category: string,
  learningPath: UserLearningPathItem[]
): SkillProgressCardData {
  // 1. Filter ONLY currently active / in-progress courses
  const activeItems = learningPath.filter(
    (item) => item.status === 'in-progress' || (item as any).status === 'active'
  );

  // 2. Find matching active courses
  const matchingActiveCourses: {
    courseId: string;
    title: string;
    progressPercentage: number;
    provider?: string;
  }[] = [];

  for (const item of activeItems) {
    const details = resolveCourseDetails(item.courseId, item.courseTitle);
    if (isCourseAssociatedWithSkill(details, skillName)) {
      // Default to 0% if progressPercentage was not explicitly recorded
      const percent = Math.max(0, Math.min(100, Math.round(item.progressPercentage ?? 0)));
      matchingActiveCourses.push({
        courseId: item.courseId,
        title: details.title,
        progressPercentage: percent,
        provider: details.provider,
      });
    }
  }

  // 3. If no active course matches
  if (matchingActiveCourses.length === 0) {
    return {
      id: `skill-${skillName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
      name: skillName.toUpperCase(),
      percent: 0,
      displayPercent: 'No active course',
      level: 'No Active Course',
      category,
      hasActiveCourse: false,
      activeCourses: [],
    };
  }

  // 4. Calculate average completion of currently active courses
  const sum = matchingActiveCourses.reduce((acc, c) => acc + c.progressPercentage, 0);
  const avgPercent = Math.round(sum / matchingActiveCourses.length);
  const computedLevel = getSkillLevelFromProgress(avgPercent);

  return {
    id: `skill-${skillName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
    name: skillName.toUpperCase(),
    percent: avgPercent,
    displayPercent: `${avgPercent}%`,
    level: computedLevel,
    category,
    hasActiveCourse: true,
    activeCourses: matchingActiveCourses,
  };
}

/**
 * Calculates the full set of technical skill competency cards for the dashboard.
 * Evaluates the 6 core competencies + any skills logged in the student's profile.
 */
export function calculateAllSkillCompetencies(
  learningPath: UserLearningPathItem[],
  profileSkills: StudentProfile['skills'] = []
): SkillProgressCardData[] {
  const cards: SkillProgressCardData[] = [];
  const processedNames = new Set<string>();

  // 1. Process Core Competencies
  for (const core of CORE_TECHNICAL_COMPETENCIES) {
    const cardData = calculateSkillProgress(core.name, core.category, learningPath);
    cards.push(cardData);
    processedNames.add(core.name.toUpperCase());
  }

  // 2. Process any additional skills logged in profile
  for (const skill of profileSkills || []) {
    const upperName = skill.name.trim().toUpperCase();
    if (!processedNames.has(upperName)) {
      const cardData = calculateSkillProgress(skill.name, skill.category || 'Core CS', learningPath);
      cards.push(cardData);
      processedNames.add(upperName);
    }
  }

  return cards;
}
