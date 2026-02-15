import { useState, useRef } from 'react';
import { AVAILABLE_SOUNDS, COLOR_PALETTE } from '../utils';
import { SoundIcon } from './SoundIcon';
import { useClickOutside } from '../hooks/useClickOutside';

interface QuickControlsProps {
  currentColor: string;
  currentSound: string | null;
  onColorChange: (color: string) => void;
  onSoundChange: (sound: string | null) => void;
}

export function QuickControls({ currentColor, currentSound, onColorChange, onSoundChange }: QuickControlsProps) {
  const [showColorGrid, setShowColorGrid] = useState(false);
  const [showSoundMenu, setShowSoundMenu] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useClickOutside(
    showColorGrid || showSoundMenu,
    () => { setShowColorGrid(false); setShowSoundMenu(false); },
    ref,
  );

  return (
    <div className="quick-controls" ref={ref}>
      <div className="color-control">
        <button
          className="control-btn"
          onClick={() => { setShowColorGrid(prev => !prev); setShowSoundMenu(false); }}
          title="Pick color"
        >
          <span className="color-swatch" style={{ backgroundColor: currentColor }} />
        </button>
        {showColorGrid && (
          <div className="color-grid">
            {COLOR_PALETTE.map(color => (
              <button
                key={color}
                className={`color-cell ${currentColor === color ? 'active' : ''}`}
                style={{ backgroundColor: color }}
                onClick={() => { onColorChange(color); setShowColorGrid(false); }}
              />
            ))}
          </div>
        )}
      </div>

      <div className="sound-control">
        <button
          className="control-btn"
          onClick={() => { setShowSoundMenu(prev => !prev); setShowColorGrid(false); }}
          title="Select sound"
        >
          <SoundIcon sound={currentSound} size={30} />
        </button>
        {showSoundMenu && (
          <div className="sound-menu">
            <button
              className={`sound-option ${currentSound === null ? 'active' : ''}`}
              onClick={() => { onSoundChange(null); setShowSoundMenu(false); }}
            >
              <SoundIcon sound={null} size={22} />
              <span>Mute</span>
            </button>
            {AVAILABLE_SOUNDS.map(s => (
              <button
                key={s}
                className={`sound-option ${currentSound === s ? 'active' : ''}`}
                onClick={() => { onSoundChange(s); setShowSoundMenu(false); }}
              >
                <SoundIcon sound={s} size={22} />
                <span>{s.replace('.m4a', '').replace(/_/g, ' ')}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
