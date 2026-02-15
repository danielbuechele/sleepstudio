import { useRef, useCallback, useEffect } from 'react';

export function useAudio() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const currentSoundRef = useRef<string | null>(null);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    currentSoundRef.current = null;
  }, []);

  const play = useCallback((filename: string) => {
    if (currentSoundRef.current === filename && audioRef.current && !audioRef.current.paused) {
      return; // Already playing this sound
    }

    if (!audioRef.current) {
      audioRef.current = new Audio();
    }

    const audio = audioRef.current;
    audio.pause();
    audio.src = `${import.meta.env.BASE_URL}sounds/${filename}`;
    audio.loop = true;

    audio.play().catch(() => {
      // Autoplay blocked — resume on first user interaction
      const resume = () => {
        audio.play().catch(() => {});
        document.removeEventListener('click', resume);
        document.removeEventListener('touchstart', resume);
      };
      document.addEventListener('click', resume, { once: true });
      document.addEventListener('touchstart', resume, { once: true });
    });

    currentSoundRef.current = filename;
  }, []);

  const setSound = useCallback((filename: string | null) => {
    if (filename === null) {
      stop();
    } else {
      play(filename);
    }
  }, [play, stop]);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  return { setSound, stop };
}
