export interface TimelineEntry {
  id: string;
  time: string;       // "HH:MM" (24h)
  color: string;       // "#rrggbb"
  sound: string | null; // filename like "Heavy_Rain.m4a" or null
}

export const COLOR_PALETTE = [
  '#1a1a2e', '#2d1b69', '#4a0e4e', '#8b1a4a',
  '#c0392b', '#e67e22', '#f1c40f', '#2ecc71',
  '#1abc9c', '#3498db', '#2c3e8c', '#6c5ce7',
  '#fd79a8', '#fab1a0', '#dfe6e9', '#ffeaa7',
];

export const AVAILABLE_SOUNDS: string[] = [
  'Heavy_Rain.m4a',
  'Ocean_Waves.m4a',
  'River_Flow.m4a',
  'Shower_Static.m4a',
  'White_Noise.m4a',
];

export function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

export function getCurrentTimeMinutes(): number {
  const now = new Date();
  return now.getHours() * 60 + now.getMinutes();
}

export function findActiveEntry(entries: TimelineEntry[]): TimelineEntry | null {
  if (entries.length === 0) return null;

  const sorted = [...entries].sort((a, b) => timeToMinutes(a.time) - timeToMinutes(b.time));
  const now = getCurrentTimeMinutes();

  // Find the most recent entry whose time is <= now
  let active: TimelineEntry | null = null;
  for (const entry of sorted) {
    if (timeToMinutes(entry.time) <= now) {
      active = entry;
    }
  }

  // If no entry is <= now, wrap around: use the last entry of the day (from yesterday)
  if (active === null) {
    active = sorted[sorted.length - 1];
  }

  return active;
}

export function findNextEntry(entries: TimelineEntry[]): { entry: TimelineEntry; msUntil: number } | null {
  if (entries.length === 0) return null;

  const sorted = [...entries].sort((a, b) => timeToMinutes(a.time) - timeToMinutes(b.time));
  const now = getCurrentTimeMinutes();

  // Find first entry with time > now
  for (const entry of sorted) {
    const entryMin = timeToMinutes(entry.time);
    if (entryMin > now) {
      const msUntil = (entryMin - now) * 60 * 1000;
      // Subtract the seconds/ms already elapsed in the current minute for accuracy
      const nowDate = new Date();
      const elapsedInCurrentMinute = nowDate.getSeconds() * 1000 + nowDate.getMilliseconds();
      return { entry, msUntil: msUntil - elapsedInCurrentMinute };
    }
  }

  // Wrap around to the first entry tomorrow
  if (sorted.length > 0) {
    const entry = sorted[0];
    const entryMin = timeToMinutes(entry.time);
    const minutesUntil = (24 * 60 - now) + entryMin;
    const msUntil = minutesUntil * 60 * 1000;
    const nowDate = new Date();
    const elapsedInCurrentMinute = nowDate.getSeconds() * 1000 + nowDate.getMilliseconds();
    return { entry, msUntil: msUntil - elapsedInCurrentMinute };
  }

  return null;
}
