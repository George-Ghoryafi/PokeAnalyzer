class AudioSystem {
  private static instance: AudioSystem;
  private currentAudio: HTMLAudioElement | null = null;

  private constructor() {}

  public static getInstance(): AudioSystem {
    if (!AudioSystem.instance) {
      AudioSystem.instance = new AudioSystem();
    }
    return AudioSystem.instance;
  }

  public playCry(url?: string) {
    if (!url) return;

    // Instantly interrupt and garbage collect any currently playing cry 
    // to prevent chaotic audio overlapping during rapid UI selection
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
    }

    const audio = new Audio(url);
    // Lower the volume slightly as some OGG files from PokeAPI are master-peaked very loudly
    audio.volume = 0.4;
    
    // Attempt play without throwing unhandled promise rejections on strict browsers
    audio.play().catch(err => {
      console.warn('Playback was blocked or failed:', err);
    });

    this.currentAudio = audio;
  }
}

export const playPokemonCry = (url?: string) => {
  AudioSystem.getInstance().playCry(url);
};
