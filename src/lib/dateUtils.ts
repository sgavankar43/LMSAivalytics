/**
 * Safely parses any date/timestamp value from Postgres/Supabase or local state.
 * Handles strings without UTC offset ('Z' or '+/-') by treating them as UTC,
 * preventing local timezone shifts (e.g. IST +05:30) from prematurely expiring sessions.
 */
export function parseDbTimestamp(val: string | number | Date | null | undefined): number {
  if (!val) return Date.now();
  if (typeof val === 'number') return val;
  if (val instanceof Date) return val.getTime();
  if (typeof val === 'string') {
    let str = val.trim();
    if (!str.endsWith('Z') && !/[+-]\d{2}(:?\d{2})?$/.test(str)) {
      str = str + 'Z';
    }
    const parsed = new Date(str).getTime();
    return isNaN(parsed) ? Date.now() : parsed;
  }
  return Date.now();
}

/**
 * Calculates remaining minutes until expiration.
 */
export function getRemainingMinutes(expiresAt: string | number | Date | null | undefined): number {
  if (!expiresAt) return 0;
  const exp = parseDbTimestamp(expiresAt);
  const diffMs = exp - Date.now();
  return Math.max(0, Math.round(diffMs / 60000));
}

/**
 * Returns human-readable relative time (e.g. 'Just now', '5m ago', '2h ago', '3d ago').
 */
export function formatTimeAgo(date: Date | string | number): string {
  const d = date instanceof Date ? date : new Date(typeof date === 'string' ? parseDbTimestamp(date) : date);
  const seconds = Math.floor((Date.now() - d.getTime()) / 1000);
  if (isNaN(seconds) || seconds < 30) return 'Just now';
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

