import { AuthUser, UserNotification, UserLearningPathItem } from '../types';
import {
  getUserLearningPath,
  resolveCourseDetails,
  isCourseAssociatedWithSkill,
  CORE_TECHNICAL_COMPETENCIES,
} from './courseSkillService';
import { getAccountByEmail, saveAccountToRegistry } from './authService';

const NOTIFICATIONS_STORAGE_PREFIX = 'careerai_user_notifications_v2_';
export const USER_NOTIFICATIONS_UPDATED_EVENT = 'careerai-user-notifications-updated';

/**
 * Format relative timestamp nicely (e.g. "Just now", "10m ago", "2h ago", "Yesterday")
 */
export function formatNotificationTime(isoString: string): string {
  if (!isoString) return 'Recent';
  try {
    const diffMs = Date.now() - new Date(isoString).getTime();
    if (isNaN(diffMs) || diffMs < 0) return 'Just now';

    const diffSec = Math.floor(diffMs / 1000);
    if (diffSec < 60) return 'Just now';

    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;

    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `${diffHours}h ago`;

    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;

    return new Date(isoString).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return 'Recent';
  }
}

/**
 * Get the localStorage key for a specific authenticated user.
 */
function getStorageKey(userEmail: string): string {
  return `${NOTIFICATIONS_STORAGE_PREFIX}${userEmail.trim().toLowerCase()}`;
}

/**
 * Read stored notifications for a specific user from localStorage.
 */
export function getStoredUserNotifications(userEmail: string): UserNotification[] {
  if (!userEmail) return [];
  try {
    const raw = localStorage.getItem(getStorageKey(userEmail));
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('[Notifications] Failed to read stored notifications:', err);
  }

  // Fallback: check account registry
  try {
    const record = getAccountByEmail(userEmail);
    if (record?.notifications && Array.isArray(record.notifications)) {
      localStorage.setItem(getStorageKey(userEmail), JSON.stringify(record.notifications));
      return record.notifications;
    }
  } catch (err) {
    console.warn('[Notifications] Registry fallback error:', err);
  }

  return [];
}

/**
 * Save notifications locally and sync to server & user registry.
 */
export function saveStoredUserNotifications(
  userEmail: string,
  notifications: UserNotification[]
): void {
  if (!userEmail) return;
  const key = getStorageKey(userEmail);
  try {
    localStorage.setItem(key, JSON.stringify(notifications));

    // Notify listeners in the browser
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent(USER_NOTIFICATIONS_UPDATED_EVENT, { detail: { userEmail, notifications } })
      );
    }

    // Sync to user account record
    const record = getAccountByEmail(userEmail);
    if (record) {
      saveAccountToRegistry({
        ...record,
        notifications,
        updatedAt: new Date().toISOString(),
      });
    }

    // Background sync to server API
    fetch('/api/notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-email': userEmail,
      },
      body: JSON.stringify({ notifications }),
    }).catch((err) => {
      console.warn('[Notifications API] Non-blocking server sync error:', err);
    });
  } catch (err) {
    console.warn('[Notifications] Failed to save notifications:', err);
  }
}

/**
 * General guest/platform notifications shown when no user is signed in.
 */
export const GUEST_NOTIFICATIONS: UserNotification[] = [
  {
    id: 'guest-notif-1',
    userId: 'guest',
    type: 'platform',
    title: 'Campus Recruitment Cutoffs Calibrated',
    message: 'Placement requirements for tier-1 tech cohorts have been updated.',
    createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    read: false,
  },
  {
    id: 'guest-notif-2',
    userId: 'guest',
    type: 'platform',
    title: 'Personalized Learning Available',
    message: 'Sign in with your student account to track course progress & real-time skill milestones.',
    createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    read: false,
  },
  {
    id: 'guest-notif-3',
    userId: 'guest',
    type: 'platform',
    title: 'Live Job Openings Aligned',
    message: 'Explore active internships and SDE-1 openings in the Jobs tab.',
    createdAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
    read: true,
  },
];

/**
 * Generate and synchronize personalized course notifications for the current authenticated user.
 * Strictly avoids duplicates across re-renders and page refreshes.
 */
export function syncPersonalizedNotifications(
  user: AuthUser,
  currentLearningPath?: UserLearningPathItem[]
): UserNotification[] {
  if (!user || !user.email) return [];

  const learningPath = currentLearningPath || getUserLearningPath();
  const existingList = getStoredUserNotifications(user.email);
  const existingMap = new Map<string, UserNotification>();

  for (const notif of existingList) {
    existingMap.set(notif.id, notif);
  }

  const now = new Date().toISOString();
  let hasChanges = false;

  for (const item of learningPath) {
    if (!item.courseId) continue;
    const courseDetails = resolveCourseDetails(item.courseId, item.courseTitle);
    const courseTitle = item.courseTitle || courseDetails.title;
    const progress = Math.max(0, Math.min(100, Math.round(item.progressPercentage ?? 0)));
    const isCompleted = item.status === 'completed' || progress >= 100;
    const isStarted = item.status === 'in-progress' || progress > 0 || Boolean(item.startedAt);

    // 1. Course Started Notification
    if (isStarted) {
      const startId = `notif-${user.id}-${item.courseId}-started`;
      if (!existingMap.has(startId)) {
        const notif: UserNotification = {
          id: startId,
          userId: user.id,
          type: 'course_start',
          title: '📚 Course Started',
          message: `You started ${courseTitle}. Your learning journey has begun!`,
          courseId: item.courseId,
          courseTitle,
          progress,
          createdAt: item.startedAt || now,
          read: false,
        };
        existingMap.set(startId, notif);
        hasChanges = true;
      }
    }

    // 2. 25% Milestone
    if (progress >= 25) {
      const m25Id = `notif-${user.id}-${item.courseId}-m25`;
      if (!existingMap.has(m25Id)) {
        const notif: UserNotification = {
          id: m25Id,
          userId: user.id,
          type: 'course_milestone',
          title: `📚 ${courseTitle} is 25% complete`,
          message: 'Keep going!',
          courseId: item.courseId,
          courseTitle,
          progress: 25,
          createdAt: item.lastUpdatedAt || now,
          read: false,
        };
        existingMap.set(m25Id, notif);
        hasChanges = true;
      }
    }

    // 3. 50% Milestone
    if (progress >= 50) {
      const m50Id = `notif-${user.id}-${item.courseId}-m50`;
      if (!existingMap.has(m50Id)) {
        const notif: UserNotification = {
          id: m50Id,
          userId: user.id,
          type: 'course_milestone',
          title: `🎯 You're halfway through ${courseTitle}`,
          message: "You're making great progress!",
          courseId: item.courseId,
          courseTitle,
          progress: 50,
          createdAt: item.lastUpdatedAt || now,
          read: false,
        };
        existingMap.set(m50Id, notif);
        hasChanges = true;
      }
    }

    // 4. 75% Milestone
    if (progress >= 75) {
      const m75Id = `notif-${user.id}-${item.courseId}-m75`;
      if (!existingMap.has(m75Id)) {
        const notif: UserNotification = {
          id: m75Id,
          userId: user.id,
          type: 'course_milestone',
          title: `🔥 ${courseTitle} is 75% complete`,
          message: "You're almost there!",
          courseId: item.courseId,
          courseTitle,
          progress: 75,
          createdAt: item.lastUpdatedAt || now,
          read: false,
        };
        existingMap.set(m75Id, notif);
        hasChanges = true;
      }
    }

    // 5. 100% Completion Notification (One completion event = one notification)
    if (isCompleted) {
      const compId = `notif-${user.id}-${item.courseId}-completed`;
      if (!existingMap.has(compId)) {
        const notif: UserNotification = {
          id: compId,
          userId: user.id,
          type: 'course_completion',
          title: '🎉 Course Completed',
          message: `Congratulations! You completed ${courseTitle}.`,
          courseId: item.courseId,
          courseTitle,
          progress: 100,
          createdAt: item.completedAt || item.lastUpdatedAt || now,
          read: false,
        };
        existingMap.set(compId, notif);
        hasChanges = true;
      }
    }

    // 6. Continue Learning Notification (Active course between 1% and 99%)
    if (progress > 0 && progress < 100 && !isCompleted) {
      const contId = `notif-${user.id}-${item.courseId}-continue`;
      const existingCont = existingMap.get(contId);
      if (!existingCont) {
        const notif: UserNotification = {
          id: contId,
          userId: user.id,
          type: 'continue_learning',
          title: '📖 Continue Learning',
          message: `Your ${courseTitle} course is ${progress}% complete.`,
          courseId: item.courseId,
          courseTitle,
          progress,
          createdAt: item.lastUpdatedAt || now,
          read: false,
        };
        existingMap.set(contId, notif);
        hasChanges = true;
      } else if (existingCont.progress !== progress) {
        // Update progress in-place without creating duplicate card
        existingMap.set(contId, {
          ...existingCont,
          progress,
          message: `Your ${courseTitle} course is ${progress}% complete.`,
          createdAt: item.lastUpdatedAt || now,
        });
        hasChanges = true;
      }
    }

    // 7. Skill Progress Notification (Maps to real course skill)
    if (progress > 0) {
      // Find associated skill from core competencies
      for (const core of CORE_TECHNICAL_COMPETENCIES) {
        if (isCourseAssociatedWithSkill(courseDetails, core.canonicalName || core.name)) {
          const skillId = `notif-${user.id}-${core.id}-skill-update`;
          if (!existingMap.has(skillId)) {
            const notif: UserNotification = {
              id: skillId,
              userId: user.id,
              type: 'skill_progress',
              title: '📈 Skill Progress Updated',
              message: `Your ${core.name} skill has improved based on your learning progress.`,
              courseId: item.courseId,
              courseTitle,
              skill: core.name,
              progress,
              createdAt: item.lastUpdatedAt || now,
              read: false,
            };
            existingMap.set(skillId, notif);
            hasChanges = true;
          }
          break; // Link to the primary skill
        }
      }
    }
  }

  // Sort by createdAt descending (newest first)
  const result = Array.from(existingMap.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  if (hasChanges) {
    saveStoredUserNotifications(user.email, result);
  }

  return result;
}

/**
 * Mark a single notification as read.
 */
export function markNotificationAsRead(userEmail: string, notificationId: string): UserNotification[] {
  if (!userEmail) return [];
  const current = getStoredUserNotifications(userEmail);
  const updated = current.map((n) => (n.id === notificationId ? { ...n, read: true } : n));
  saveStoredUserNotifications(userEmail, updated);
  return updated;
}

/**
 * Mark all notifications as read for a user.
 */
export function markAllNotificationsAsRead(userEmail: string): UserNotification[] {
  if (!userEmail) return [];
  const current = getStoredUserNotifications(userEmail);
  const updated = current.map((n) => ({ ...n, read: true }));
  saveStoredUserNotifications(userEmail, updated);
  return updated;
}

/**
 * Dismiss / remove a single notification.
 */
export function dismissNotification(userEmail: string, notificationId: string): UserNotification[] {
  if (!userEmail) return [];
  const current = getStoredUserNotifications(userEmail);
  const updated = current.filter((n) => n.id !== notificationId);
  saveStoredUserNotifications(userEmail, updated);

  // Background delete on server
  fetch(`/api/notifications/${encodeURIComponent(notificationId)}`, {
    method: 'DELETE',
    headers: { 'x-user-email': userEmail },
  }).catch(() => {});

  return updated;
}

/**
 * Clear all notifications for a user.
 */
export function clearAllNotifications(userEmail: string): UserNotification[] {
  if (!userEmail) return [];
  saveStoredUserNotifications(userEmail, []);

  // Background clear on server
  fetch('/api/notifications', {
    method: 'DELETE',
    headers: { 'x-user-email': userEmail },
  }).catch(() => {});

  return [];
}
