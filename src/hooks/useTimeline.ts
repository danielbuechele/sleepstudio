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
  const [activeId, setActiveId] = useState<string | null>(() => findActiveEntry(loadEntries())?.id ?? null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const entriesRef = useRef(entries);
  entriesRef.current = entries;

  // Derive activeEntry from entries + activeId so it's always a fresh reference
  const activeEntry = entries.find(e => e.id === activeId) ?? null;

  const scheduleNext = useCallback((currentEntries: TimelineEntry[]) => {
    if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    const next = findNextEntry(currentEntries);
    if (!next) return;

    timeoutRef.current = setTimeout(() => {
      setActiveId(next.entry.id);
      scheduleNext(entriesRef.current);
    }, next.msUntil);
  }, []);

  // Persist and reschedule on entries change
  useEffect(() => {
    saveEntries(entries);
    scheduleNext(entries);
    return () => {
      if (timeoutRef.current !== null) clearTimeout(timeoutRef.current);
    };
  }, [entries, scheduleNext]);

  // Re-sync when app regains focus
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        setActiveId(findActiveEntry(entries)?.id ?? null);
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
