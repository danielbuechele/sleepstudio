import { useState, useEffect } from 'react';
import { useTimeline } from './hooks/useTimeline';
import { useAudio } from './hooks/useAudio';
import { isLightColor } from './utils';
import { QuickControls } from './components/QuickControls';
import { ConfigPanel } from './components/ConfigPanel';
import './App.css';

const DEFAULT_COLOR = '#000000';

function App() {
  const { entries, activeEntry, addEntry, updateEntry, removeEntry } = useTimeline();
  const { setSound, unlock } = useAudio();

  const [overrideColor, setOverrideColor] = useState<string | undefined>();
  const [overrideSound, setOverrideSound] = useState<string | null | undefined>(undefined);
  const [trackedActiveId, setTrackedActiveId] = useState<string | null>(activeEntry?.id ?? null);
  const [showConfig, setShowConfig] = useState(false);
  const [started, setStarted] = useState(false);

  // Clear overrides synchronously when active entry changes (React recommended pattern)
  const activeId = activeEntry?.id ?? null;
  if (activeId !== trackedActiveId) {
    setTrackedActiveId(activeId);
    setOverrideColor(undefined);
    setOverrideSound(undefined);
  }

  const effectiveColor = overrideColor ?? activeEntry?.color ?? DEFAULT_COLOR;
  const effectiveSound = overrideSound !== undefined ? overrideSound : (activeEntry?.sound ?? null);

  // Drive audio from effective sound (only after user starts the app)
  useEffect(() => {
    if (started) setSound(effectiveSound);
  }, [effectiveSound, setSound, started]);

  const handleStart = () => {
    if (effectiveSound) {
      setSound(effectiveSound);
    } else {
      unlock();
    }
    setStarted(true);
  };

  // Sync body background so iOS safe area behind home indicator matches
  useEffect(() => {
    document.body.style.backgroundColor = effectiveColor;
  }, [effectiveColor]);

  // Keep screen awake
  useEffect(() => {
    let wakeLock: WakeLockSentinel | null = null;
    const request = async () => {
      try {
        wakeLock = await navigator.wakeLock.request('screen');
      } catch {
        // WakeLock not supported or failed
      }
    };
    request();
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') request();
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      wakeLock?.release();
    };
  }, []);

  return (
    <div className={`app ${isLightColor(effectiveColor) ? 'light' : ''}`} style={{ backgroundColor: effectiveColor }}>
      {!started ? (
        <button className="start-btn" onClick={handleStart} title="Start">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinejoin="round">
            <polygon points="7,4 20,12 7,20" />
          </svg>
        </button>
      ) : (
        <>
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
            onColorChange={setOverrideColor}
            onSoundChange={setOverrideSound}
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
        </>
      )}
    </div>
  );
}

export default App;
