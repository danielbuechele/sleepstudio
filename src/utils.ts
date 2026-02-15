export interface TimelineEntry {
  id: string;
  time: string;       // "HH:MM" (24h)
  color: string;       // "#rrggbb"
  sound: string | null; // filename like "Heavy_Rain.m4a" or null
  days: number[];      // 0=Sun, 1=Mon, ..., 6=Sat
}

export const ALL_DAYS: number[] = [0, 1, 2, 3, 4, 5, 6];

export const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;

const WEEKDAYS = [1, 2, 3, 4, 5];
const WEEKEND = [0, 6];
const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function getDaysLabel(days: number[]): string {
  const sorted = [...days].sort();
  if (sorted.length === 7) return 'Everyday';
  if (sorted.length === 0) return 'Never';
  if (sorted.length === 5 && WEEKDAYS.every(d => sorted.includes(d))) return 'Weekdays';
  if (sorted.length === 2 && WEEKEND.every(d => sorted.includes(d))) return 'Weekends';
  return sorted.map(d => DAY_NAMES[d]).join(', ');
}

export const COLOR_PALETTE = [
  '#FF0000', '#008000', '#00FFFF', '#FFFFFF',
  '#FFA500', '#008080', '#4B0082', '#808080',
  '#FFFF00', '#0000FF', '#EE82EE', '#A52A2A',
  '#00FF00', '#FF00FF', '#FFD700', '#000000',
];

export const AVAILABLE_SOUNDS: string[] = [
  'Heavy_Rain.m4a',
  'Ocean_Waves.m4a',
  'River.m4a',
  'Shower.m4a',
  'White_Noise.m4a',
];

export function normalizeEntry(entry: TimelineEntry): TimelineEntry {
  return {
    ...entry,
    days: entry.days ?? ALL_DAYS,
  };
}

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
  const today = new Date().getDay();

  // Check today: entries active today with time <= now, pick latest
  for (let i = sorted.length - 1; i >= 0; i--) {
    if (sorted[i].days.includes(today) && timeToMinutes(sorted[i].time) <= now) {
      return sorted[i];
    }
  }

  // Check previous days (yesterday, day before, etc.)
  for (let offset = 1; offset <= 6; offset++) {
    const day = (today - offset + 7) % 7;
    // Find the last entry of that day (latest time, carried over)
    for (let i = sorted.length - 1; i >= 0; i--) {
      if (sorted[i].days.includes(day)) {
        return sorted[i];
      }
    }
  }

  return null;
}

export function findNextEntry(entries: TimelineEntry[]): { entry: TimelineEntry; msUntil: number } | null {
  if (entries.length === 0) return null;

  const sorted = [...entries].sort((a, b) => timeToMinutes(a.time) - timeToMinutes(b.time));
  const now = getCurrentTimeMinutes();
  const today = new Date().getDay();
  const nowDate = new Date();
  const elapsedMs = nowDate.getSeconds() * 1000 + nowDate.getMilliseconds();

  // Check today: first entry with time > now that includes today
  for (const entry of sorted) {
    if (entry.days.includes(today) && timeToMinutes(entry.time) > now) {
      const msUntil = (timeToMinutes(entry.time) - now) * 60_000 - elapsedMs;
      return { entry, msUntil };
    }
  }

  // Check future days (tomorrow through 6 days ahead)
  for (let offset = 1; offset <= 6; offset++) {
    const day = (today + offset) % 7;
    for (const entry of sorted) {
      if (entry.days.includes(day)) {
        const minutesUntil = (24 * 60 - now) + (offset - 1) * 24 * 60 + timeToMinutes(entry.time);
        const msUntil = minutesUntil * 60_000 - elapsedMs;
        return { entry, msUntil };
      }
    }
  }

  return null;
}
