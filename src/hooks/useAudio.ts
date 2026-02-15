import { useRef, useCallback, useEffect } from 'react';

const SILENT_WAV = 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=';

export function useAudio() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const currentSoundRef = useRef<string | null>(null);

  useEffect(() => {
    audioRef.current = new Audio();

    return () => {
      audioRef.current?.pause();
      audioRef.current = null;
    };
  }, []);

  // Unlock audio element by playing a silent buffer (must be called from user gesture)
  const unlock = useCallback(() => {
    if (!audioRef.current || !audioRef.current.paused) return;
    audioRef.current.src = SILENT_WAV;
    audioRef.current.loop = false;
    audioRef.current.play().catch(() => {});
  }, []);

  const setSound = useCallback((filename: string | null) => {
    if (!audioRef.current) return;

    if (filename === null) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      currentSoundRef.current = null;
      return;
    }

    if (currentSoundRef.current === filename && !audioRef.current.paused) {
      return; // Already playing this sound
    }

    audioRef.current.src = `${import.meta.env.BASE_URL}sounds/${filename}`;
    audioRef.current.loop = true;
    currentSoundRef.current = filename;

    audioRef.current.play().catch(() => {});
  }, []);

  return { setSound, unlock };
}
