import { useCallback, useRef } from 'react';

interface UseSafeAudioPlayOptions {
  onPlay?: () => void;
  onPause?: () => void;
  onError?: (error: Error) => void;
}

export const useSafeAudioPlay = (options: UseSafeAudioPlayOptions = {}) => {
  const { onPlay, onPause, onError } = options;
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const play = useCallback(async () => {
    const audioElement = audioRef.current;
    if (!audioElement) return;

    console.log('useSafeAudioPlay - Attempting to play:', {
      currentTime: audioElement.currentTime,
      duration: audioElement.duration,
      readyState: audioElement.readyState,
      networkState: audioElement.networkState,
      paused: audioElement.paused,
      ended: audioElement.ended,
      mediaError: audioElement.error,
      src: audioElement.src
    });

    if (audioElement.readyState >= 2) { // HAVE_CURRENT_DATA
      try {
        await audioElement.play();
        console.log('useSafeAudioPlay - Play successful');
        onPlay?.();
      } catch (error) {
        console.error('useSafeAudioPlay - Play failed:', error);
        onError?.(error as Error);
      }
    } else {
      console.warn('useSafeAudioPlay - Tried to play before ready. Waiting for canplay event...');

      const handleReadyToPlay = async () => {
        try {
          await audioElement.play();
          console.log('useSafeAudioPlay - Play successful after ready');
          onPlay?.();
        } catch (error) {
          console.error('useSafeAudioPlay - Play failed after ready:', error);
          onError?.(error as Error);
        } finally {
          audioElement.removeEventListener('canplay', handleReadyToPlay);
        }
      };

      audioElement.addEventListener('canplay', handleReadyToPlay);
      audioElement.load(); // make sure it's loading
    }
  }, [onPlay, onError]);

  const pause = useCallback(() => {
    const audioElement = audioRef.current;
    if (!audioElement) return;

    audioElement.pause();
    onPause?.();
  }, [onPause]);

  return {
    audioRef,
    play,
    pause
  };
}; 