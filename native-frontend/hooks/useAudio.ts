import { useRef, useCallback } from 'react';
import { Audio } from 'expo-av';

type AudioSource = number | { uri: string };

export function useAudio(source: AudioSource) {
  const soundRef = useRef<Audio.Sound | null>(null);

  const play = useCallback(async () => {
    try {
      // Unload previous sound if exists
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
      }

      // Create and play new sound
      const { sound } = await Audio.Sound.createAsync(source);
      soundRef.current = sound;
      await sound.playAsync();
    } catch (error) {
      console.error('Error playing audio:', error);
    }
  }, [source]);

  return play;
}

export default useAudio;
