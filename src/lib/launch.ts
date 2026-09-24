/** Public launch: 25 September 2026, 12:00 AM India Standard Time. */
export const LAUNCH_AT_ISO = "2026-09-25T00:00:00+05:30";
export const LAUNCH_AT_MS = Date.parse(LAUNCH_AT_ISO);

export function launchHasPassed(now = Date.now()): boolean {
  return now >= LAUNCH_AT_MS;
}
