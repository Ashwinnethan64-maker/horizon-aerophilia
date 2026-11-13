const HHMM_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/;

/** Parse a strict 24-hour HH:MM clock value into minutes after midnight. */
export function parseHHMM(timeStr: string): number {
  const match = HHMM_PATTERN.exec(timeStr);
  if (!match) throw new RangeError(`Invalid time "${timeStr}"; expected HH:MM in 24-hour time`);
  return Number(match[1]) * 60 + Number(match[2]);
}

/** Format an integer minute offset within one day as a zero-padded HH:MM value. */
export function formatHHMM(minutes: number): string {
  if (!Number.isInteger(minutes) || minutes < 0 || minutes >= 24 * 60) {
    throw new RangeError(`Invalid minute offset "${minutes}"; expected an integer from 0 to 1439`);
  }
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(remainder).padStart(2, '0')}`;
}
