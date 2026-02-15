import { useRef, useCallback, useEffect } from 'react';

export function useAudio() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const currentSoundRef = useRef<string | null>(null);
  const pendingSoundRef = useRef<string | null>(null);
  const unlockedRef = useRef(false);

  // Eagerly create audio element and "unlock" it on first user interaction
  // so that subsequent play() calls from setTimeout work on mobile browsers
  useEffect(() => {
    const audio = new Audio();
    audioRef.current = audio;

    const unlock = () => {
      if (unlockedRef.current) return;
      // Play a tiny silent moment to unlock the audio element
      audio.volume = 0;
      audio.play().then(() => {
        audio.pause();
        audio.volume = 1;
        unlockedRef.current = true;
        // If a sound was pending (blocked by autoplay), play it now
        if (pendingSoundRef.current) {
          const filename = pendingSoundRef.current;
          pendingSoundRef.current = null;
          audio.src = `${import.meta.env.BASE_URL}sounds/${filename}`;
          audio.loop = true;
          audio.play().catch(() => {});
        }
      }).catch(() => {
        audio.volume = 1;
      });
    };

    document.addEventListener('click', unlock);
    document.addEventListener('touchstart', unlock);

    return () => {
      document.removeEventListener('click', unlock);
      document.removeEventListener('touchstart', unlock);
      audio.pause();
      audioRef.current = null;
    };
  }, []);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    currentSoundRef.current = null;
    pendingSoundRef.current = null;
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
    currentSoundRef.current = filename;

    audio.play().catch(() => {
      // Autoplay blocked — store as pending and resume on first user interaction
      pendingSoundRef.current = filename;
      const resume = () => {
        if (pendingSoundRef.current && audioRef.current) {
          audioRef.current.play().catch(() => {});
          pendingSoundRef.current = null;
        }
        document.removeEventListener('click', resume);
        document.removeEventListener('touchstart', resume);
      };
      document.addEventListener('click', resume, { once: true });
      document.addEventListener('touchstart', resume, { once: true });
    });
  }, []);

  const setSound = useCallback((filename: string | null) => {
    if (filename === null) {
      stop();
    } else {
      play(filename);
    }
  }, [play, stop]);

  return { setSound, stop };
}
