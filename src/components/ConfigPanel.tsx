import { useState, useRef, useCallback } from 'react';
import type { TimelineEntry } from '../utils';
import { AVAILABLE_SOUNDS, COLOR_PALETTE, timeToMinutes } from '../utils';

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
  const [pickerPos, setPickerPos] = useState<PickerPos>({ top: 0, left: 0 });
  const btnRefs = useRef<Map<string, HTMLButtonElement>>(new Map());

  const openPicker = useCallback((id: string) => {
    if (colorPickerFor === id) {
      setColorPickerFor(null);
      return;
    }
    const btn = btnRefs.current.get(id);
    if (btn) {
      const rect = btn.getBoundingClientRect();
      setPickerPos({ top: rect.bottom + 4, left: rect.left + rect.width / 2 });
    }
    setColorPickerFor(id);
  }, [colorPickerFor]);

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
            <div key={entry.id} className="config-entry">
              <input
                type="time"
                value={entry.time}
                onChange={e => onUpdate(entry.id, { time: e.target.value })}
              />
              <button
                ref={el => { if (el) btnRefs.current.set(entry.id, el); }}
                className="config-color-btn"
                style={{ backgroundColor: entry.color }}
                onClick={() => openPicker(entry.id)}
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
          ))}
        </div>

        <button
          className="add-btn"
          onClick={() => onAdd({ time: '22:00', color: '#1a1a2e', sound: null })}
        >
          + Add entry
        </button>
      </div>

      {colorPickerFor && (
        <div
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
    </div>
  );
}
