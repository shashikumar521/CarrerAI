/**
 * Client-Side Admin Notification Dispatcher
 *
 * Safely dispatches login/registration metadata to the secure server-side endpoint.
 *
 * Guarantees:
 * 1. Zero exposure of administrative credentials in frontend code.
 * 2. Strictly transmits only non-sensitive public metadata (name, email, method, timestamp).
 * 3. Never transmits passwords, auth tokens, or private hashes.
 * 4. Asynchronous and fault-tolerant: failure to send will NEVER block or break the user's login.
 * 5. Prevents duplicate notifications caused by rapid clicks, state re-renders, or page refreshes.
 */

export interface NotifyAdminLoginParams {
  name: string;
  email: string;
  loginMethod: 'Email' | 'Google';
  eventType?: 'login' | 'registration';
}

export async function sendAdminLoginNotification(
  params: NotifyAdminLoginParams
): Promise<void> {
  try {
    const normalizedEmail = (params.email || '').trim().toLowerCase();
    if (!normalizedEmail || !normalizedEmail.includes('@')) {
      return;
    }

    // Client-side deduplication window (prevents duplicate dispatch across quick rerenders / refresh)
    const dedupKey = `careerai_notified_${normalizedEmail}_${params.loginMethod}_${params.eventType || 'login'}`;
    const lastDispatched = sessionStorage.getItem(dedupKey);
    const now = Date.now();

    if (lastDispatched && now - Number(lastDispatched) < 60000) {
      // Already notified within the last 60 seconds in this browser session
      return;
    }

    // Record deduplication timestamp in session storage
    sessionStorage.setItem(dedupKey, String(now));

    // Non-blocking fetch to server-side notification endpoint
    await fetch('/api/notify/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: params.name || 'Anonymous User',
        email: normalizedEmail,
        loginMethod: params.loginMethod,
        eventType: params.eventType || 'login',
        timestamp: new Date().toISOString(),
      }),
    });
  } catch (error) {
    // Non-blocking catch: user authentication experience must always proceed seamlessly
    console.warn('[Admin Notification] Non-blocking notification dispatch error:', error);
  }
}
