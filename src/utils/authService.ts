import { AuthUser, AccountRecord, StudentProfile } from '../types';
import { EMPTY_STUDENT_PROFILE } from '../data/mockDatabase';

const ACCOUNTS_STORAGE_KEY = 'careerai_accounts_registry_v1';
const ACTIVE_SESSION_STORAGE_KEY = 'careerai_active_session_v1';

/**
 * Retrieve all registered accounts from isolated storage.
 */
export function getAccountsRegistry(): Record<string, AccountRecord> {
  try {
    const raw = localStorage.getItem(ACCOUNTS_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return typeof parsed === 'object' && parsed !== null ? parsed : {};
  } catch (err) {
    console.error('Failed to read accounts registry from localStorage:', err);
    return {};
  }
}

/**
 * Save an account to the isolated accounts registry.
 */
export function saveAccountToRegistry(record: AccountRecord): void {
  try {
    const registry = getAccountsRegistry();
    const normalizedEmail = record.user.email.trim().toLowerCase();
    registry[normalizedEmail] = {
      ...record,
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(registry));
  } catch (err) {
    console.error('Failed to persist account to registry:', err);
  }
}

/**
 * Retrieve account record for a specific email.
 */
export function getAccountByEmail(email: string): AccountRecord | null {
  const registry = getAccountsRegistry();
  const normalizedEmail = email.trim().toLowerCase();
  return registry[normalizedEmail] || null;
}

/**
 * Get active user session.
 */
export function getActiveSession(): AuthUser | null {
  try {
    const raw = localStorage.getItem(ACTIVE_SESSION_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object' && parsed.id && parsed.email) {
      return parsed as AuthUser;
    }
    return null;
  } catch (err) {
    console.error('Failed to read active session:', err);
    return null;
  }
}

/**
 * Set active user session.
 */
export function setActiveSession(user: AuthUser | null): void {
  try {
    if (user) {
      localStorage.setItem(ACTIVE_SESSION_STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(ACTIVE_SESSION_STORAGE_KEY);
    }
  } catch (err) {
    console.error('Failed to update active session:', err);
  }
}

/**
 * Clear session (Logout).
 */
export function logoutUser(): void {
  setActiveSession(null);
}

/**
 * Sign In with Email and Password.
 */
export function signInWithEmail(
  email: string,
  password: string
): { success: boolean; error?: string; record?: AccountRecord } {
  const normalized = email.trim().toLowerCase();
  const existing = getAccountByEmail(normalized);

  if (!existing) {
    return {
      success: false,
      error: 'No account found with this email address. Please sign up first.',
    };
  }

  if (existing.user.provider === 'google' && !existing.password) {
    return {
      success: false,
      error: 'This account was created with Google Sign-In. Please click "Continue with Google".',
    };
  }

  if (existing.password && existing.password !== password) {
    return {
      success: false,
      error: 'Incorrect password. Please try again.',
    };
  }

  setActiveSession(existing.user);
  return { success: true, record: existing };
}

/**
 * Sign Up with Email and Password.
 */
export function signUpWithEmail(
  name: string,
  email: string,
  password: string
): { success: boolean; error?: string; record?: AccountRecord } {
  const normalized = email.trim().toLowerCase();
  const existing = getAccountByEmail(normalized);

  if (existing) {
    return {
      success: false,
      error: 'An account with this email already exists. Please sign in instead.',
    };
  }

  const newUser: AuthUser = {
    id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    name: name.trim(),
    email: normalized,
    provider: 'email',
    createdAt: new Date().toISOString(),
  };

  // Rule: New user gets clean profile with only name and email populated
  const cleanProfile: StudentProfile = {
    ...EMPTY_STUDENT_PROFILE,
    name: newUser.name,
    email: newUser.email,
  };

  const newRecord: AccountRecord = {
    user: newUser,
    password,
    profile: cleanProfile,
    assessmentSubmitted: false,
    updatedAt: new Date().toISOString(),
  };

  saveAccountToRegistry(newRecord);
  setActiveSession(newUser);

  return { success: true, record: newRecord };
}

/**
 * Sign In or Register with Google payload.
 * Google Sign-In only authenticates the student.
 * Does NOT generate fake marks, CGPA, branch, or skills.
 * Isolated per Google account.
 */
export function handleGoogleAuthPayload(googleData: {
  name: string;
  email: string;
  photoUrl?: string;
  sub: string;
}): { success: boolean; record: AccountRecord; isNewUser: boolean } {
  const normalized = googleData.email.trim().toLowerCase();
  const existing = getAccountByEmail(normalized);

  if (existing) {
    // Existing user: Update photo or name if changed from Google, but preserve all student assessment data
    const updatedUser: AuthUser = {
      ...existing.user,
      name: existing.user.name || googleData.name,
      photoUrl: googleData.photoUrl || existing.user.photoUrl,
    };

    const updatedRecord: AccountRecord = {
      ...existing,
      user: updatedUser,
      updatedAt: new Date().toISOString(),
    };

    saveAccountToRegistry(updatedRecord);
    setActiveSession(updatedUser);

    return { success: true, record: updatedRecord, isNewUser: false };
  }

  // New Google student account
  const newUser: AuthUser = {
    id: `goog_${googleData.sub || Date.now()}`,
    name: googleData.name.trim(),
    email: normalized,
    photoUrl: googleData.photoUrl,
    provider: 'google',
    createdAt: new Date().toISOString(),
  };

  // Strictly empty student profile, only pre-populating basic Google identity info
  const freshProfile: StudentProfile = {
    ...EMPTY_STUDENT_PROFILE,
    name: newUser.name,
    email: newUser.email,
  };

  const newRecord: AccountRecord = {
    user: newUser,
    profile: freshProfile,
    assessmentSubmitted: false,
    updatedAt: new Date().toISOString(),
  };

  saveAccountToRegistry(newRecord);
  setActiveSession(newUser);

  return { success: true, record: newRecord, isNewUser: true };
}

/**
 * Save updated student profile for an active user.
 */
export function updateStudentProfileForUser(
  user: AuthUser,
  profile: StudentProfile,
  assessmentSubmitted: boolean
): void {
  const normalized = user.email.trim().toLowerCase();
  const existing = getAccountByEmail(normalized);

  const updatedRecord: AccountRecord = {
    user: existing ? existing.user : user,
    password: existing?.password,
    profile,
    assessmentSubmitted,
    updatedAt: new Date().toISOString(),
  };

  saveAccountToRegistry(updatedRecord);
}
