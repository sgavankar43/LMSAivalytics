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
