import { useState, useEffect, useCallback, useRef } from 'react';
import type { TimelineEntry } from '../utils';
import { findActiveEntry, findNextEntry, normalizeEntry } from '../utils';

const STORAGE_KEY = 'sleepstudio-timeline';

function loadEntries(): TimelineEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return (JSON.parse(raw) as TimelineEntry[]).map(normalizeEntry);
  } catch {
    // ignore
  }
  return [];
}

function saveEntries(entries: TimelineEntry[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

export function useTimeline() {
  const [entries, setEntries] = useState<TimelineEntry[]>(loadEntries);
  const [activeEntry, setActiveEntry] = useState<TimelineEntry | null>(() => findActiveEntry(loadEntries()));
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const entriesRef = useRef<TimelineEntry[]>(entries);
  entriesRef.current = entries;

  const scheduleNext = useCallback((currentEntries: TimelineEntry[]) => {
    if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    const next = findNextEntry(currentEntries);
    if (!next) return;

    timeoutRef.current = setTimeout(() => {
      // Use fresh entries from ref to get up-to-date entry data
      const freshEntries = entriesRef.current;
      const freshEntry = freshEntries.find(e => e.id === next.entry.id);
      setActiveEntry(freshEntry ?? next.entry);
      scheduleNext(freshEntries);
    }, next.msUntil);
  }, []);

  // Persist and reschedule on entries change
  useEffect(() => {
    saveEntries(entries);
    scheduleNext(entries);

    return () => {
      if (timeoutRef.current !== null) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [entries, scheduleNext]);

  // Re-sync when app regains focus (timeouts can drift over multi-day spans)
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        setActiveEntry(findActiveEntry(entries));
        scheduleNext(entries);
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [entries, scheduleNext]);

  const addEntry = useCallback((entry: Omit<TimelineEntry, 'id'>) => {
    setEntries(prev => [...prev, { ...entry, id: crypto.randomUUID() }]);
  }, []);

  const updateEntry = useCallback((id: string, updates: Partial<Omit<TimelineEntry, 'id'>>) => {
    setEntries(prev => prev.map(e => e.id === id ? { ...e, ...updates } : e));
  }, []);

  const removeEntry = useCallback((id: string) => {
    setEntries(prev => prev.filter(e => e.id !== id));
  }, []);

  return { entries, activeEntry, addEntry, updateEntry, removeEntry };
}
