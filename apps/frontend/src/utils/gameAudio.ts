let audioEnabled = true;

const SOUND_PATHS = {
  notification: '/sounds/notification.mp3',
  success: '/sounds/success.mp3',
  error: '/sounds/error.mp3',
  purchase: '/sounds/purchase.mp3',
  flash: '/sounds/flash.mp3',
} as const;

export type GameSound = keyof typeof SOUND_PATHS;

export function setGameAudioEnabled(enabled: boolean): void {
  audioEnabled = enabled;
}

export function isGameAudioEnabled(): boolean {
  return audioEnabled;
}

export function playGameSound(sound: GameSound): void {
  if (!audioEnabled || typeof window === 'undefined') return;

  try {
    const audio = new Audio(SOUND_PATHS[sound]);
    audio.volume = 0.35;
    void audio.play().catch(() => {
      // Browser may block autoplay until user gesture — fail silently.
    });
  } catch {
    // Audio unsupported — no-op.
  }
}
