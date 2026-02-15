const COOKIE_ID_KEY = 'ivehadworse_cookie_id';
const SESSION_KEY = 'ivehadworse_session';

export interface Session {
  userId: string;
  isTempAccount: boolean;
  userEmail: string | null;
}

export function getOrCreateCookieId(): string {
  if (typeof window === 'undefined') return '';
  let id = localStorage.getItem(COOKIE_ID_KEY);
  if (!id) {
    id = crypto.randomUUID?.() ?? `temp-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    localStorage.setItem(COOKIE_ID_KEY, id);
  }
  return id;
}

export function clearCookieId(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(COOKIE_ID_KEY);
}

/** Persist sign-in state so it survives page navigations. */
export function saveSession(session: Session): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

/** Load a previously saved session, or null if none exists. */
export function loadSession(): Session | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed.userId === 'string') return parsed as Session;
    return null;
  } catch {
    return null;
  }
}

/** Clear the persisted session (on sign-out). */
export function clearSession(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(SESSION_KEY);
}
