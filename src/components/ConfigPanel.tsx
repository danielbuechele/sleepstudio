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

        <button
          className="add-btn"
          onClick={() => onAdd({ time: '22:00', color: '#000000', sound: null, days: ALL_DAYS })}
        >
          + Add entry
        </button>
      </div>

      {colorPickerFor && (
        <div
          ref={colorDropdownRef}
          className="config-color-grid"
          style={{ top: pickerPos.top, left: pickerPos.left }}
          onClick={e => e.stopPropagation()}
        >
          {COLOR_PALETTE.map(color => {
            const entry = entries.find(e => e.id === colorPickerFor);
            return (
              <button
                key={color}
                className={`color-cell ${entry?.color === color ? 'active' : ''}`}
                style={{ backgroundColor: color }}
                onClick={() => { onUpdate(colorPickerFor, { color }); setColorPickerFor(null); }}
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
            const entry = entries.find(e => e.id === daysPickerFor);
            if (!entry) return null;
            const isActive = entry.days.includes(dayIndex);
            return (
              <button
                key={dayIndex}
                className={`day-btn ${isActive ? 'active' : ''}`}
                onClick={() => {
                  const newDays = isActive
                    ? entry.days.filter(d => d !== dayIndex)
                    : [...entry.days, dayIndex].sort();
                  onUpdate(entry.id, { days: newDays });
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
