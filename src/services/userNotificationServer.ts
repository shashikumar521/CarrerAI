import fs from 'fs';
import path from 'path';

export interface UserNotificationRecord {
  id: string;
  userId: string;
  type:
    | 'course_start'
    | 'course_milestone'
    | 'course_completion'
    | 'continue_learning'
    | 'skill_progress'
    | 'platform';
  title: string;
  message: string;
  courseId?: string;
  courseTitle?: string;
  progress?: number;
  skill?: string;
  createdAt: string;
  read: boolean;
}

const DATA_DIR = path.join(process.cwd(), 'data');
const NOTIFICATIONS_FILE = path.join(DATA_DIR, 'user_notifications.json');

// In-memory cache keyed by userEmail (lowercase)
let inMemoryNotifications: Map<string, UserNotificationRecord[]> | null = null;

function ensureDataDir(): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  } catch (err) {
    console.error('Failed to create data directory for notifications:', err);
  }
}

function loadAllNotifications(): Map<string, UserNotificationRecord[]> {
  if (inMemoryNotifications !== null) {
    return inMemoryNotifications;
  }

  ensureDataDir();
  const map = new Map<string, UserNotificationRecord[]>();

  try {
    if (fs.existsSync(NOTIFICATIONS_FILE)) {
      const raw = fs.readFileSync(NOTIFICATIONS_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      if (typeof parsed === 'object' && parsed !== null) {
        for (const [email, items] of Object.entries(parsed)) {
          if (Array.isArray(items)) {
            map.set(email.toLowerCase(), items);
          }
        }
      }
    }
  } catch (err) {
    console.error('Failed to read user notifications file:', err);
  }

  inMemoryNotifications = map;
  return inMemoryNotifications;
}

function persistAllNotifications(): void {
  if (inMemoryNotifications === null) return;
  ensureDataDir();

  try {
    const obj: Record<string, UserNotificationRecord[]> = {};
    for (const [email, items] of inMemoryNotifications.entries()) {
      obj[email] = items;
    }
    fs.writeFileSync(NOTIFICATIONS_FILE, JSON.stringify(obj, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to write user notifications file:', err);
  }
}

/**
 * Retrieve notifications strictly for the authenticated user.
 */
export function getUserNotificationsServer(userEmail: string): UserNotificationRecord[] {
  if (!userEmail) return [];
  const map = loadAllNotifications();
  const key = userEmail.trim().toLowerCase();
  return map.get(key) || [];
}

/**
 * Save / replace notifications list for a specific authenticated user.
 * Preserves uniqueness by notification id.
 */
export function saveUserNotificationsServer(
  userEmail: string,
  newItems: UserNotificationRecord[]
): UserNotificationRecord[] {
  if (!userEmail) return [];
  const map = loadAllNotifications();
  const key = userEmail.trim().toLowerCase();
  const existing = map.get(key) || [];

  // Deduplicate and merge by id, retaining updated read statuses
  const byId = new Map<string, UserNotificationRecord>();
  for (const item of existing) {
    byId.set(item.id, item);
  }
  for (const item of newItems) {
    const prev = byId.get(item.id);
    if (prev) {
      // Retain read status if already marked read
      byId.set(item.id, { ...prev, ...item, read: prev.read || item.read });
    } else {
      byId.set(item.id, item);
    }
  }

  const merged = Array.from(byId.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  map.set(key, merged);
  persistAllNotifications();
  return merged;
}

/**
 * Mark specific or all notifications as read for a user.
 */
export function markNotificationsReadServer(
  userEmail: string,
  notificationIds?: string[]
): UserNotificationRecord[] {
  if (!userEmail) return [];
  const map = loadAllNotifications();
  const key = userEmail.trim().toLowerCase();
  const list = map.get(key) || [];

  const targetIds = notificationIds && notificationIds.length > 0 ? new Set(notificationIds) : null;

  const updated = list.map((item) => {
    if (!targetIds || targetIds.has(item.id)) {
      return { ...item, read: true };
    }
    return item;
  });

  map.set(key, updated);
  persistAllNotifications();
  return updated;
}

/**
 * Delete a single notification for a user.
 */
export function deleteNotificationServer(
  userEmail: string,
  notificationId: string
): UserNotificationRecord[] {
  if (!userEmail || !notificationId) return [];
  const map = loadAllNotifications();
  const key = userEmail.trim().toLowerCase();
  const list = map.get(key) || [];

  const filtered = list.filter((n) => n.id !== notificationId);
  map.set(key, filtered);
  persistAllNotifications();
  return filtered;
}

/**
 * Clear all notifications for a specific user.
 */
export function clearAllNotificationsServer(userEmail: string): void {
  if (!userEmail) return;
  const map = loadAllNotifications();
  const key = userEmail.trim().toLowerCase();
  map.set(key, []);
  persistAllNotifications();
}
