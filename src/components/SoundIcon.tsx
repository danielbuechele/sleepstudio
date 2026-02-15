interface SoundIconProps {
  sound: string | null;
  size?: number;
}

export function SoundIcon({ sound, size = 20 }: SoundIconProps) {
  const props = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };

  if (sound === null) {
    // Mute: speaker with X
    return (
      <svg {...props}>
        <path d="M11 5L6 9H2v6h4l5 4V5z" />
        <line x1="23" y1="9" x2="17" y2="15" />
        <line x1="17" y1="9" x2="23" y2="15" />
      </svg>
    );
  }

  switch (sound) {
    case 'Heavy_Rain.m4a':
      // Cloud with rain drops
      return (
        <svg {...props}>
          <path d="M20 17.58A5 5 0 0 0 18 8h-1.26A8 8 0 1 0 4 16.25" />
          <line x1="8" y1="16" x2="8" y2="20" />
          <line x1="12" y1="18" x2="12" y2="22" />
          <line x1="16" y1="16" x2="16" y2="20" />
        </svg>
      );

    case 'Ocean_Waves.m4a':
      // Waves
      return (
        <svg {...props}>
          <path d="M2 12c2-2 4-2 6 0s4 2 6 0 4-2 6 0" />
          <path d="M2 17c2-2 4-2 6 0s4 2 6 0 4-2 6 0" />
          <path d="M2 7c2-2 4-2 6 0s4 2 6 0 4-2 6 0" />
        </svg>
      );

    case 'River.m4a':
      // Wavy stream
      return (
        <svg {...props}>
          <path d="M7 5c-1 3 2 4 0 7s2 4 0 7" />
          <path d="M12 4c-1 3 2 4 0 7s2 4 0 7" />
          <path d="M17 5c-1 3 2 4 0 7s2 4 0 7" />
        </svg>
      );

    case 'Shower.m4a':
      // Water droplet
      return (
        <svg {...props}>
          <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
        </svg>
      );

    case 'White_Noise.m4a':
      // Static / signal
      return (
        <svg {...props}>
          <polyline points="3 12 6 6 9 18 12 3 15 21 18 8 21 12" />
        </svg>
      );

    default:
      // Generic speaker
      return (
        <svg {...props}>
          <path d="M11 5L6 9H2v6h4l5 4V5z" />
          <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
          <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
        </svg>
      );
  }
}
