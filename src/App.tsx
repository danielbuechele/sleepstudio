import { useState, useEffect, useRef } from 'react';
import { useTimeline } from './hooks/useTimeline';
import { useAudio } from './hooks/useAudio';
import { QuickControls } from './components/QuickControls';
import { ConfigPanel } from './components/ConfigPanel';
import './App.css';

const DEFAULT_COLOR = '#000000';

function App() {
  const { entries, activeEntry, addEntry, updateEntry, removeEntry } = useTimeline();
  const { setSound } = useAudio();

  const [manualColor, setManualColor] = useState<string | undefined>(undefined);
  const [manualSound, setManualSound] = useState<string | null | undefined>(undefined);
  const [showConfig, setShowConfig] = useState(false);

  const prevActiveIdRef = useRef<string | null>(null);

  // Clear manual overrides when the active entry changes
  useEffect(() => {
    if (activeEntry && activeEntry.id !== prevActiveIdRef.current) {
      if (prevActiveIdRef.current !== null) {
        setManualColor(undefined);
        setManualSound(undefined);
      }
      prevActiveIdRef.current = activeEntry.id;
    }
  }, [activeEntry]);

  const effectiveColor = manualColor ?? activeEntry?.color ?? DEFAULT_COLOR;
  const effectiveSound = manualSound !== undefined ? manualSound : (activeEntry?.sound ?? null);

  // Drive audio from effective sound
  useEffect(() => {
    setSound(effectiveSound);
  }, [effectiveSound, setSound]);

  return (
    <div className="app" style={{ backgroundColor: effectiveColor }}>
      <button
        className="settings-btn"
        onClick={() => setShowConfig(true)}
        title="Settings"
      >
        &#9881;
      </button>

      <QuickControls
        currentColor={effectiveColor}
        currentSound={effectiveSound}
        onColorChange={setManualColor}
        onSoundChange={setManualSound}
      />

      {showConfig && (
        <ConfigPanel
          entries={entries}
          onAdd={addEntry}
          onUpdate={updateEntry}
          onRemove={removeEntry}
          onClose={() => setShowConfig(false)}
        />
      )}
    </div>
  );
}

export default App;
