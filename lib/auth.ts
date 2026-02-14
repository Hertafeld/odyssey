const COOKIE_ID_KEY = 'ivehadworse_cookie_id';

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
