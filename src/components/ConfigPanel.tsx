import { useState, useRef, useCallback } from 'react';
import type { TimelineEntry } from '../utils';
import { AVAILABLE_SOUNDS, ALL_DAYS, DAY_LABELS, COLOR_PALETTE, timeToMinutes, getDaysLabel } from '../utils';
import { useClickOutside } from '../hooks/useClickOutside';

interface ConfigPanelProps {
  entries: TimelineEntry[];
  onAdd: (entry: Omit<TimelineEntry, 'id'>) => void;
  onUpdate: (id: string, updates: Partial<Omit<TimelineEntry, 'id'>>) => void;
  onRemove: (id: string) => void;
  onClose: () => void;
}

interface PickerPos { top: number; left: number }

export function ConfigPanel({ entries, onAdd, onUpdate, onRemove, onClose }: ConfigPanelProps) {
  const sorted = [...entries].sort((a, b) => timeToMinutes(a.time) - timeToMinutes(b.time));
  const [colorPickerFor, setColorPickerFor] = useState<string | null>(null);
  const [daysPickerFor, setDaysPickerFor] = useState<string | null>(null);
  const [pickerPos, setPickerPos] = useState<PickerPos>({ top: 0, left: 0 });
  const [daysPickerPos, setDaysPickerPos] = useState<PickerPos>({ top: 0, left: 0 });
  const colorBtnRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
  const daysBtnRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
  const colorDropdownRef = useRef<HTMLDivElement>(null);
  const daysDropdownRef = useRef<HTMLDivElement>(null);

  const [adding, setAdding] = useState(false);
  const [draftTime, setDraftTime] = useState('');
  const [draftColor, setDraftColor] = useState('#000000');
  const [draftSound, setDraftSound] = useState<string | null>(null);
  const [draftDays, setDraftDays] = useState<number[]>(ALL_DAYS);

  const draftColorBtnRef = useRef<HTMLButtonElement>(null);
  const draftDaysBtnRef = useRef<HTMLButtonElement>(null);

  const startAdding = useCallback(() => {
    const now = new Date();
    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    setDraftTime(`${hh}:${mm}`);
    setDraftColor('#000000');
    setDraftSound(null);
    setDraftDays([...ALL_DAYS]);
    setAdding(true);
  }, []);

  const confirmAdd = useCallback(() => {
    onAdd({ time: draftTime, color: draftColor, sound: draftSound, days: draftDays });
    setAdding(false);
    setColorPickerFor(null);
    setDaysPickerFor(null);
  }, [onAdd, draftTime, draftColor, draftSound, draftDays]);

  const cancelAdd = useCallback(() => {
    setAdding(false);
    setColorPickerFor(null);
    setDaysPickerFor(null);
  }, []);

  useClickOutside(
    colorPickerFor !== null,
    () => setColorPickerFor(null),
    colorDropdownRef,
  );

  useClickOutside(
    daysPickerFor !== null,
    () => setDaysPickerFor(null),
    daysDropdownRef,
  );

  const openColorPicker = useCallback((id: string) => {
    setDaysPickerFor(null);
    if (colorPickerFor === id) {
      setColorPickerFor(null);
      return;
    }
    const btn = colorBtnRefs.current.get(id);
    if (btn) {
      const rect = btn.getBoundingClientRect();
      setPickerPos({ top: rect.bottom + 4, left: rect.left + rect.width / 2 });
    }
    setColorPickerFor(id);
  }, [colorPickerFor]);

  const openDaysPicker = useCallback((id: string) => {
    setColorPickerFor(null);
    if (daysPickerFor === id) {
      setDaysPickerFor(null);
      return;
    }
    const btn = daysBtnRefs.current.get(id);
    if (btn) {
      const rect = btn.getBoundingClientRect();
      setDaysPickerPos({ top: rect.bottom + 4, left: rect.left + rect.width / 2 });
    }
    setDaysPickerFor(id);
  }, [daysPickerFor]);

  return (
    <div className="config-overlay" onClick={onClose}>
      <div className="config-panel" onClick={e => e.stopPropagation()}>
        {adding ? (
          <>
            <div className="config-header">
              <h2>New Entry</h2>
              <button className="close-btn" onClick={cancelAdd}>&times;</button>
            </div>

            <div className="config-entries">
              <div className="config-entry-card">
                <div className="config-entry">
                  <input
                    type="time"
                    value={draftTime}
                    onChange={e => setDraftTime(e.target.value)}
                  />
                  <button
                    ref={draftColorBtnRef}
                    className="config-color-btn"
                    style={{ backgroundColor: draftColor }}
                    onClick={() => {
                      setDaysPickerFor(null);
                      if (colorPickerFor === '__draft__') {
                        setColorPickerFor(null);
                        return;
                      }
                      const btn = draftColorBtnRef.current;
                      if (btn) {
                        const rect = btn.getBoundingClientRect();
                        setPickerPos({ top: rect.bottom + 4, left: rect.left + rect.width / 2 });
                      }
                      setColorPickerFor('__draft__');
                    }}
                  />
                  <select
                    value={draftSound ?? ''}
                    onChange={e => setDraftSound(e.target.value || null)}
                  >
                    <option value="">No sound</option>
                    {AVAILABLE_SOUNDS.map(s => (
                      <option key={s} value={s}>{s.replace('.m4a', '').replace(/_/g, ' ')}</option>
                    ))}
                  </select>
                </div>
                <button
                  ref={draftDaysBtnRef}
                  className="days-btn"
                  onClick={() => {
                    setColorPickerFor(null);
                    if (daysPickerFor === '__draft__') {
                      setDaysPickerFor(null);
                      return;
                    }
                    const btn = draftDaysBtnRef.current;
                    if (btn) {
                      const rect = btn.getBoundingClientRect();
                      setDaysPickerPos({ top: rect.bottom + 4, left: rect.left + rect.width / 2 });
                    }
                    setDaysPickerFor('__draft__');
                  }}
                >
                  {getDaysLabel(draftDays)}
                </button>
              </div>
            </div>

            <button className="add-btn" onClick={confirmAdd}>
              Add
            </button>
          </>
        ) : (
          <>
            <div className="config-header">
              <h2>Timeline</h2>
              <button className="close-btn" onClick={onClose}>&times;</button>
            </div>

            <div className="config-entries">
              {sorted.length === 0 && (
                <p className="config-empty">No entries yet. Add one below.</p>
              )}
              {sorted.map(entry => (
                <div key={entry.id} className="config-entry-card">
                  <div className="config-entry">
                    <input
                      type="time"
                      value={entry.time}
                      onChange={e => onUpdate(entry.id, { time: e.target.value })}
                    />
                    <button
                      ref={el => { if (el) colorBtnRefs.current.set(entry.id, el); }}
                      className="config-color-btn"
                      style={{ backgroundColor: entry.color }}
                      onClick={() => openColorPicker(entry.id)}
                    />
                    <select
                      value={entry.sound ?? ''}
                      onChange={e => onUpdate(entry.id, { sound: e.target.value || null })}
                    >
                      <option value="">No sound</option>
                      {AVAILABLE_SOUNDS.map(s => (
                        <option key={s} value={s}>{s.replace('.m4a', '').replace(/_/g, ' ')}</option>
                      ))}
                    </select>
                    <button className="delete-btn" onClick={() => onRemove(entry.id)}>
                      &times;
                    </button>
                  </div>
                  <button
                    ref={el => { if (el) daysBtnRefs.current.set(entry.id, el); }}
                    className="days-btn"
                    onClick={() => openDaysPicker(entry.id)}
                  >
                    {getDaysLabel(entry.days)}
                  </button>
                </div>
              ))}
            </div>

            <button className="add-btn" onClick={startAdding}>
              + Add entry
            </button>
          </>
        )}
      </div>

      {colorPickerFor && (
        <div
          ref={colorDropdownRef}
          className="config-color-grid"
          style={{ top: pickerPos.top, left: pickerPos.left }}
          onClick={e => e.stopPropagation()}
        >
          {COLOR_PALETTE.map(color => {
            const activeColor = colorPickerFor === '__draft__' ? draftColor : entries.find(e => e.id === colorPickerFor)?.color;
            return (
              <button
                key={color}
                className={`color-cell ${activeColor === color ? 'active' : ''}`}
                style={{ backgroundColor: color }}
                onClick={() => {
                  if (colorPickerFor === '__draft__') {
                    setDraftColor(color);
                  } else {
                    onUpdate(colorPickerFor, { color });
                  }
                  setColorPickerFor(null);
                }}
              />
            );
          })}
        </div>
      )}

      {daysPickerFor && (
        <div
          ref={daysDropdownRef}
          className="config-days-dropdown"
          style={{ top: daysPickerPos.top, left: daysPickerPos.left }}
          onClick={e => e.stopPropagation()}
        >
          {DAY_LABELS.map((label, dayIndex) => {
            const days = daysPickerFor === '__draft__' ? draftDays : entries.find(e => e.id === daysPickerFor)?.days;
            if (!days) return null;
            const isActive = days.includes(dayIndex);
            return (
              <button
                key={dayIndex}
                className={`day-btn ${isActive ? 'active' : ''}`}
                onClick={() => {
                  const newDays = isActive
                    ? days.filter(d => d !== dayIndex)
                    : [...days, dayIndex].sort();
                  if (daysPickerFor === '__draft__') {
                    setDraftDays(newDays);
                  } else {
                    onUpdate(daysPickerFor, { days: newDays });
                  }
                }}
              >
                {label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
