import fs from 'fs';
import path from 'path';

export interface FeedbackRecord {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  rating: number;
  comment: string;
  page: string;
  createdAt: string;
}

export interface FeedbackStats {
  averageRating: number;
  totalRatings: number;
  starCounts: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
}

export interface ServerUserRecord {
  id: string;
  name: string;
  email: string;
  registeredAt: string;
}

// Dynamic data directory resolution (supports standard server, Docker, and read-only serverless/Vercel)
function getResolvedDataDir(): string {
  const primaryDir = path.join(process.cwd(), 'data');
  try {
    if (!fs.existsSync(primaryDir)) {
      fs.mkdirSync(primaryDir, { recursive: true });
    }
    const testFile = path.join(primaryDir, '.write_test');
    fs.writeFileSync(testFile, 'ok', 'utf-8');
    fs.unlinkSync(testFile);
    return primaryDir;
  } catch {
    try {
      const fallbackDir = path.join('/tmp', 'careerai-data');
      if (!fs.existsSync(fallbackDir)) {
        fs.mkdirSync(fallbackDir, { recursive: true });
      }
      return fallbackDir;
    } catch {
      return '';
    }
  }
}

function getFeedbackFilePath(): string {
  const dir = getResolvedDataDir();
  return dir ? path.join(dir, 'feedback.json') : '';
}

function getUsersFilePath(): string {
  const dir = getResolvedDataDir();
  return dir ? path.join(dir, 'users.json') : '';
}

// In-memory cache for fast read access
let inMemoryFeedback: FeedbackRecord[] | null = null;
let inMemoryUsers: Map<string, ServerUserRecord> | null = null;
const duplicateSubmissionCache = new Map<string, { record: FeedbackRecord; timestamp: number }>();

/**
 * Load feedback records permanently from disk / storage
 */
export function getFeedbackRecords(): FeedbackRecord[] {
  if (inMemoryFeedback !== null) {
    return inMemoryFeedback;
  }

  const filePath = getFeedbackFilePath();
  if (filePath) {
    try {
      if (fs.existsSync(filePath)) {
        const raw = fs.readFileSync(filePath, 'utf-8');
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          inMemoryFeedback = parsed;
          return inMemoryFeedback;
        }
      }
    } catch (err) {
      console.error('Failed to read feedback database file:', err);
    }
  }

  // Also check standard primary location if fallback was used
  const primaryFile = path.join(process.cwd(), 'data', 'feedback.json');
  if (primaryFile !== filePath && fs.existsSync(primaryFile)) {
    try {
      const raw = fs.readFileSync(primaryFile, 'utf-8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        inMemoryFeedback = parsed;
        return inMemoryFeedback;
      }
    } catch {
      // ignore
    }
  }

  inMemoryFeedback = [];
  return inMemoryFeedback;
}

/**
 * Load server user directory
 */
function getUsersMap(): Map<string, ServerUserRecord> {
  if (inMemoryUsers !== null) {
    return inMemoryUsers;
  }

  const map = new Map<string, ServerUserRecord>();
  const filePath = getUsersFilePath();
  if (filePath) {
    try {
      if (fs.existsSync(filePath)) {
        const raw = fs.readFileSync(filePath, 'utf-8');
        const list: ServerUserRecord[] = JSON.parse(raw);
        if (Array.isArray(list)) {
          for (const user of list) {
            if (user.email) map.set(user.email.toLowerCase(), user);
            if (user.id) map.set(user.id, user);
          }
        }
      }
    } catch (err) {
      console.error('Failed to read users database file:', err);
    }
  }

  // Also check standard primary location if fallback was used
  const primaryFile = path.join(process.cwd(), 'data', 'users.json');
  if (primaryFile !== filePath && fs.existsSync(primaryFile)) {
    try {
      const raw = fs.readFileSync(primaryFile, 'utf-8');
      const list: ServerUserRecord[] = JSON.parse(raw);
      if (Array.isArray(list)) {
        for (const user of list) {
          if (user.email && !map.has(user.email.toLowerCase())) map.set(user.email.toLowerCase(), user);
          if (user.id && !map.has(user.id)) map.set(user.id, user);
        }
      }
    } catch {
      // ignore
    }
  }

  inMemoryUsers = map;
  return inMemoryUsers;
}

/**
 * Register or update verified authenticated user on the server
 */
export function registerServerUser(user: { id?: string; name?: string; email?: string }): void {
  const email = (user.email || '').trim().toLowerCase();
  if (!email) return;

  const usersMap = getUsersMap();
  const existing = usersMap.get(email);
  const resolvedName = (user.name || '').trim() || existing?.name || 'CareerAI User';
  const resolvedId = (user.id || '').trim() || existing?.id || `usr_${Date.now()}`;

  const updated: ServerUserRecord = {
    id: resolvedId,
    name: resolvedName,
    email,
    registeredAt: existing?.registeredAt || new Date().toISOString(),
  };

  usersMap.set(email, updated);
  usersMap.set(resolvedId, updated);

  const filePath = getUsersFilePath();
  if (filePath) {
    try {
      const uniqueUsers: ServerUserRecord[] = [];
      const seen = new Set<string>();
      for (const record of usersMap.values()) {
        if (!seen.has(record.email)) {
          seen.add(record.email);
          uniqueUsers.push(record);
        }
      }
      fs.writeFileSync(filePath, JSON.stringify(uniqueUsers, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to write users file:', err);
    }
  }
}

/**
 * Retrieve verified user details server-side
 */
export function getVerifiedServerUser(
  identifier: string
): ServerUserRecord | null {
  if (!identifier) return null;
  const usersMap = getUsersMap();
  const cleanId = identifier.trim().toLowerCase();
  return usersMap.get(cleanId) || usersMap.get(identifier) || null;
}

/**
 * Compute feedback statistics for the administrative dashboard
 */
export function getFeedbackStats(): FeedbackStats {
  const records = getFeedbackRecords();
  const totalRatings = records.length;

  const starCounts = {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
  };

  let sum = 0;
  for (const item of records) {
    const r = Math.max(1, Math.min(5, Math.round(item.rating)));
    if (r in starCounts) {
      starCounts[r as keyof typeof starCounts] += 1;
      sum += r;
    }
  }

  const averageRating = totalRatings > 0 ? parseFloat((sum / totalRatings).toFixed(1)) : 0;

  return {
    averageRating,
    totalRatings,
    starCounts,
  };
}

/**
 * Save feedback record permanently
 * Protects against accidental duplicates within 15 seconds (double clicks, retries)
 */
export function saveFeedbackRecord(input: {
  userId: string;
  userName: string;
  userEmail: string;
  rating: number;
  comment?: string;
  page?: string;
  timestamp?: string;
}): { record: FeedbackRecord; isDuplicate: boolean } {
  const cleanUserId = (input.userId || '').trim();
  const cleanEmail = (input.userEmail || '').trim().toLowerCase();
  const cleanRating = Math.max(1, Math.min(5, Math.round(input.rating)));
  const cleanComment = (input.comment || '').replace(/<[^>]*>?/gm, '').trim();
  const cleanPage = (input.page || 'Dashboard').trim();

  // Deduplication check
  const dedupKey = `${cleanUserId}_${cleanEmail}_${cleanRating}_${cleanComment.slice(0, 40)}`;
  const now = Date.now();
  const existingInCache = duplicateSubmissionCache.get(dedupKey);

  if (existingInCache && now - existingInCache.timestamp < 15 * 1000) {
    console.log(`[Feedback DB] Duplicate rating submission suppressed for user ${cleanEmail}`);
    return { record: existingInCache.record, isDuplicate: true };
  }

  // Retrieve verified server-side user name to prevent spoofing
  const verifiedUser = getVerifiedServerUser(cleanEmail) || getVerifiedServerUser(cleanUserId);
  const finalUserName = (verifiedUser?.name || input.userName || 'CareerAI User').trim();

  // Always update/ensure user is registered on the server
  registerServerUser({
    id: cleanUserId || verifiedUser?.id,
    name: finalUserName,
    email: cleanEmail,
  });

  const recordCreatedAt = input.timestamp && !isNaN(Date.parse(input.timestamp))
    ? input.timestamp
    : new Date().toISOString();

  const record: FeedbackRecord = {
    id: `fb_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    userId: cleanUserId || verifiedUser?.id || `usr_${Date.now()}`,
    userName: finalUserName,
    userEmail: cleanEmail,
    rating: cleanRating,
    comment: cleanComment,
    page: cleanPage,
    createdAt: recordCreatedAt,
  };

  const records = getFeedbackRecords();
  // Prepend new record so latest appears first
  records.unshift(record);
  inMemoryFeedback = records;

  // Cache deduplication record
  duplicateSubmissionCache.set(dedupKey, { record, timestamp: now });

  // Persist permanently to disk / storage
  const filePath = getFeedbackFilePath();
  if (filePath) {
    try {
      fs.writeFileSync(filePath, JSON.stringify(records, null, 2), 'utf-8');
      console.log(`[Feedback DB] Successfully saved rating ${record.rating}/5 from ${record.userName} (${record.userEmail})`);
    } catch (err) {
      console.error('[Feedback DB Error] Failed to write feedback to disk:', err);
    }
  }

  return { record, isDuplicate: false };
}
