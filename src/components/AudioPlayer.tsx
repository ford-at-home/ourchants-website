/**
 * AudioPlayer Component
 * 
 * IMPORTANT CONTEXT FOR FUTURE DEVELOPERS/AI:
 * 
 * 1. This is a complex audio player component that handles multiple states and edge cases:
 *    - Loading states (idle, loading, buffering, playing, error)
 *    - Audio playback control (play, pause, seek, volume)
 *    - Loop modes (off, all, one)
 *    - Error handling and retry logic
 * 
 * 2. CRITICAL LESSONS LEARNED:
 *    - DO NOT modify this component to match tests. The tests should verify the actual behavior.
 *    - The component's behavior is what users experience in production - tests are secondary.
 *    - State management is complex - changes should be made carefully and tested thoroughly.
 *    - Error handling is critical for user experience - don't simplify it for testing.
 * 
 * 3. COMMON PITFALLS TO AVOID:
 *    - Don't add unnecessary state or complexity
 *    - Don't modify error messages or loading states without considering user impact
 *    - Don't change aria-labels or accessibility features
 *    - Don't simplify the component to make testing easier
 * 
 * 4. TESTING APPROACH:
 *    - Test the actual user experience, not implementation details
 *    - Use proper mocking for HTMLMediaElement
 *    - Test error states and edge cases thoroughly
 *    - Don't make the component more complex to support testing
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, Loader2, RotateCcw, Share2, Repeat } from "lucide-react";
import { Button } from "./ui/button";
import { Slider } from "./ui/slider";
import { getPresignedUrl } from "../services/songApi";
import { saveResumeState } from "../utils/resumeState";
import { Spinner } from './ui/spinner';
import { createSongUrl } from '../utils/urlParams';
import { toast } from 'sonner';

type LoopMode = 'off' | 'all' | 'one';

interface AudioPlayerProps {
  s3Uri: string;
  title?: string;
  artist?: string;
  songId?: string;
  onPlay?: () => void;
  onPause?: () => void;
  shouldPlay?: boolean;
  onPlayStarted?: () => void;
  initialTimestamp?: number;
  onSkipNext?: () => void;
  onSkipPrevious?: () => void;
}

type PlayerState = 'idle' | 'loading' | 'buffering' | 'playing' | 'error';

type LoadingState = 'idle' | 'loading' | 'error' | 'ready' | 'loaded';

export const AudioPlayer: React.FC<AudioPlayerProps> = ({ 
  s3Uri, 
  title = 'Unknown Title',
  artist = 'Unknown Artist',
  songId,
  onPlay, 
  onPause, 
  shouldPlay = false,
  onPlayStarted,
  initialTimestamp,
  onSkipNext,
  onSkipPrevious
}) => {
  console.log('AudioPlayer - Rendering with props:', {
    s3Uri,
    title,
    artist,
    songId,
    shouldPlay,
    initialTimestamp
  });

  // All state hooks at the top
  const [playerState, setPlayerState] = useState<PlayerState>('idle');
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingState, setLoadingState] = useState<LoadingState>('idle');
  const [isBuffering, setIsBuffering] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [loopMode, setLoopMode] = useState<LoopMode>('off');

  // All refs at the top
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const prevS3UriRef = useRef<string | null>(null);
  const hasEventListenersRef = useRef(false);

  // Constants
  const MAX_RETRIES = 3;
  const validatedTimestamp = initialTimestamp && !isNaN(initialTimestamp) && initialTimestamp >= 0 
    ? initialTimestamp 
    : 0;

  // Define event handlers with useCallback
  const handleTimeUpdate = useCallback((e: Event) => {
    const currentAudio = e.target as HTMLAudioElement;
    setCurrentTime(currentAudio.currentTime);
  }, []);

  const handleLoadedMetadata = useCallback((e: Event) => {
    const currentAudio = e.target as HTMLAudioElement;
    console.log('AudioPlayer - Metadata loaded:', {
      duration: currentAudio.duration,
      readyState: currentAudio.readyState,
      networkState: currentAudio.networkState
    });
    setDuration(currentAudio.duration);
  }, []);

  const handleCanPlay = useCallback((e: Event) => {
    console.log('AudioPlayer - Can play event fired');
    setLoadingState('ready');
    setIsLoading(false);
  }, []);

  const handlePlay = useCallback((e: Event) => {
    console.log('AudioPlayer - Play event fired');
  }, []);

  const handlePause = useCallback((e: Event) => {
    console.log('AudioPlayer - Pause event fired');
  }, []);

  const handleError = useCallback((e: Event) => {
    console.error('AudioPlayer - Error event fired:', e);
    const audioElement = e.target as HTMLAudioElement;
    console.error('Audio error details:', {
      error: audioElement.error,
      networkState: audioElement.networkState,
      readyState: audioElement.readyState
    });
    setError('Failed to load audio');
    setIsLoading(false);
  }, []);

  // React synthetic event handlers
  const handleReactCanPlay = useCallback((e: React.SyntheticEvent<HTMLAudioElement, Event>) => {
    const audioElement = e.currentTarget;
    console.log('AudioPlayer - Can play event fired');
    setLoadingState('ready');
    setIsLoading(false);
  }, []);

  const handleReactError = useCallback((e: React.SyntheticEvent<HTMLAudioElement, Event>) => {
    const audioElement = e.currentTarget;
    console.error('AudioPlayer - Error event fired:', e);
    console.error('Audio error details:', {
      error: audioElement.error,
      networkState: audioElement.networkState,
      readyState: audioElement.readyState
    });
    setError('Failed to load audio');
    setIsLoading(false);
  }, []);

  const handleReactLoadedMetadata = useCallback((e: React.SyntheticEvent<HTMLAudioElement, Event>) => {
    const audioElement = e.currentTarget;
    console.log('AudioPlayer - Metadata loaded:', {
      duration: audioElement.duration,
      readyState: audioElement.readyState,
      networkState: audioElement.networkState
    });
    setDuration(audioElement.duration);
  }, []);

  // Initialize audio element
  useEffect(() => {
    console.log('AudioPlayer - Initializing audio element');
    const audio = new Audio();
    audio.volume = volume;
    audio.crossOrigin = "anonymous";
    audioRef.current = audio;

    // Add event listeners
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('error', handleError);

    return () => {
      console.log('AudioPlayer - Cleaning up audio element');
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
        audioRef.current.load();
        audioRef.current.removeEventListener('timeupdate', handleTimeUpdate);
        audioRef.current.removeEventListener('loadedmetadata', handleLoadedMetadata);
        audioRef.current.removeEventListener('canplay', handleCanPlay);
        audioRef.current.removeEventListener('play', handlePlay);
        audioRef.current.removeEventListener('pause', handlePause);
        audioRef.current.removeEventListener('error', handleError);
      }
    };
  }, [handleTimeUpdate, handleLoadedMetadata, handleCanPlay, handlePlay, handlePause, handleError, volume]);

  // Handle loop mode changes
  useEffect(() => {
    const currentAudio = audioRef.current;
    const handleEnded = () => {
      if (!currentAudio) return;

      if (loopMode === 'one') {
        currentAudio.currentTime = 0;
        currentAudio.play().catch(console.error);
      } else if (loopMode === 'all') {
        onSkipNext?.();
      } else {
        setPlayerState('idle');
        onPause?.();
      }
    };

    if (currentAudio) {
      currentAudio.addEventListener('ended', handleEnded);
      return () => {
        currentAudio.removeEventListener('ended', handleEnded);
      };
    }
  }, [loopMode, onSkipNext, onPause]);

  // Handle S3 URI changes
  useEffect(() => {
    const currentAudio = audioRef.current;
    if (!s3Uri || !currentAudio || s3Uri === prevS3UriRef.current) {
      return;
    }

    console.log('AudioPlayer - S3 URI changed:', s3Uri);
    prevS3UriRef.current = s3Uri;
    setLoadingState('loading');
    setError(null);
    setCurrentTime(0);

    const setupAudio = async () => {
      try {
        currentAudio.pause();
        currentAudio.src = '';
        currentAudio.load();

        setLoadingState('loading');
        setError(null);
        setCurrentTime(0);

        // Extract S3 info with enhanced validation
        const s3Info = extractS3Info(s3Uri);
        console.log('AudioPlayer - Getting presigned URL for:', s3Info);

        try {
          const response = await getPresignedUrl(s3Info.bucket, s3Info.key);
          currentAudio.src = response.url;
          currentAudio.load();
          setAudioUrl(response.url);
          setLoadingState('ready');
          setError(null);
          
          if (validatedTimestamp > 0) {
            currentAudio.currentTime = validatedTimestamp;
          }

          if (shouldPlay) {
            try {
              await currentAudio.play();
              setPlayerState('playing');
              onPlayStarted?.();
            } catch (err) {
              if (err instanceof Error && err.name === 'NotAllowedError') {
                // User interaction required for autoplay
                setPlayerState('idle');
                return;
              }
              const errorMessage = err instanceof Error ? err.message : 'Failed to start playback';
              setError(`Playback error: ${errorMessage}`);
              setPlayerState('error');
            }
          }
        } catch (err) {
          // Handle presigned URL fetch errors
          console.error('AudioPlayer - Error getting presigned URL:', err);
          const errorMessage = err instanceof Error ? err.message : 'Failed to access audio file';
          setError(`Access error: ${errorMessage}`);
          setPlayerState('error');
          setLoadingState('error');
          return;
        }
      } catch (err) {
        // Handle S3 URI validation errors
        console.error('AudioPlayer - Error setting up audio:', err);
        const errorMessage = err instanceof Error ? err.message : 'Failed to load audio';
        setError(errorMessage);
        setPlayerState('error');
        setLoadingState('error');
      }
    };

    setupAudio();
  }, [s3Uri, shouldPlay, validatedTimestamp, onPlayStarted]);

  // Handle play/pause state changes
  useEffect(() => {
    const currentAudio = audioRef.current;
    if (!currentAudio || !audioUrl || window.location.search.includes('song=')) {
      return;
    }

    const handlePlayState = async () => {
      if (shouldPlay) {
        try {
          console.log('AudioPlayer - Attempting to play from state change');
          await currentAudio.play();
          console.log('AudioPlayer - Play successful from state change');
          setPlayerState('playing');
          onPlayStarted?.();
        } catch (err) {
          console.error('AudioPlayer - Play failed from state change:', err);
          if (err instanceof Error && err.name === 'NotAllowedError') {
            return;
          }
          setError('Playback failed');
          setPlayerState('error');
        }
      } else {
        console.log('AudioPlayer - Pausing from state change');
        currentAudio.pause();
        setPlayerState('idle');
      }
    };

    handlePlayState();
  }, [shouldPlay, audioUrl, onPlayStarted]);

  // Save resume state
  useEffect(() => {
    const currentAudio = audioRef.current;
    if (!playerState || !songId || !currentAudio) return;

    const interval = setInterval(() => {
      saveResumeState(songId, currentAudio.currentTime);
    }, 5000);

    return () => clearInterval(interval);
  }, [playerState, songId]);

  // Early return for missing s3Uri
  if (!s3Uri) {
    return null;
  }

  const extractS3Info = (s3Uri: string) => {
    console.log('Extracting S3 info from URI:', s3Uri);
    
    // Validate input
    if (!s3Uri || s3Uri.trim() === '') {
      throw new Error('No S3 URI provided. Please ensure a valid audio file is selected.');
    }

    // Validate format
    if (!s3Uri.startsWith('s3://')) {
      throw new Error('Invalid S3 URI format: URI must start with "s3://"');
    }
    
    // Remove 's3://' and split by first '/'
    const path = s3Uri.slice(5);
    const [bucket, ...keyParts] = path.split('/');
    
    // Validate bucket
    if (!bucket || bucket.trim() === '') {
      throw new Error('Invalid S3 URI format: bucket name is missing');
    }
    
    // Validate and join key parts
    const key = keyParts.join('/');
    if (!key || key.trim() === '') {
      throw new Error('Invalid S3 URI format: file path is missing');
    }

    // Validate file extension
    const validExtensions = ['.mp3', '.wav', '.m4a', '.ogg'];
    const hasValidExtension = validExtensions.some(ext => key.toLowerCase().endsWith(ext));
    if (!hasValidExtension) {
      throw new Error('Invalid file type. Only audio files (mp3, wav, m4a, ogg) are supported.');
    }
    
    console.log('Extracted S3 info:', { bucket, key });
    return { bucket, key };
  };

  const handleTimeChange = (value: number[]) => {
    const audioElement = audioRef.current;
    if (!audioElement) return;
    console.log('Seeking to:', value[0]);
    audioElement.currentTime = value[0];
  };

  const handleVolumeChange = (value: number[]) => {
    const audioElement = audioRef.current;
    if (!audioElement) return;
    console.log('Setting volume to:', value[0]);
    audioElement.volume = value[0] / 100;
    setVolume(value[0] / 100);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getLoadingText = () => {
    switch (loadingState) {
      case 'loading':
        return 'Preparing...';
      case 'error':
        return 'Error Loading Audio';
      default:
        return '';
    }
  };

  const handleRetry = () => {
    const audioElement = audioRef.current;
    if (!audioElement) return;
    
    // Reset all error states
    setRetryCount(prev => {
      const newCount = prev + 1;
      if (newCount >= MAX_RETRIES) {
        setError('Maximum retry attempts reached. Please try again later or contact support.');
        return prev;
      }
      return newCount;
    });
    
    setError(null);
    setLoadingState('loading');
    setPlayerState('idle');
    
    // Attempt to reload the audio
    audioElement.load();
  };

  const copyToClipboard = (text: string) => {
    // Try modern clipboard API first
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text)
        .then(() => true)
        .catch(() => false);
    }
    
    // Fallback for non-secure contexts
    try {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '0';
      textArea.style.top = '0';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      return Promise.resolve(successful);
    } catch (err) {
      return Promise.resolve(false);
    }
  };

  const handleShare = () => {
    if (!songId) return;
    
    const url = createSongUrl(songId, currentTime);
    copyToClipboard(url)
      .then(success => {
        if (success) {
          toast.success('Link copied to clipboard!');
        } else {
          toast.error('Failed to copy link. Please try manually.');
        }
      });
  };

  const handleSkipNext = () => {
    const audioElement = audioRef.current;
    if (!audioElement) return;
    onSkipNext?.();
  };

  const handleSkipPrevious = () => {
    const audioElement = audioRef.current;
    if (!audioElement) return;
    onSkipPrevious?.();
  };

  const toggleLoop = () => {
    console.log('AudioPlayer: Toggling loop mode', { currentMode: loopMode, shouldPlay, playerState });
    const modes: LoopMode[] = ['off', 'all', 'one'];
    const currentIndex = modes.indexOf(loopMode);
    const nextIndex = (currentIndex + 1) % modes.length;
    const newMode = modes[nextIndex];
    console.log('AudioPlayer: Setting new loop mode', { newMode });
    setLoopMode(newMode);
    // Don't change play state when toggling loop
  };

  const getLoopButtonClass = () => {
    const baseClass = "spotify-button w-8 h-8 p-0";
    if (loopMode === 'off') return `${baseClass} text-muted-foreground hover:text-foreground`;
    return `${baseClass} text-foreground`;
  };

  const getLoopIcon = () => {
    switch (loopMode) {
      case 'one':
        return (
          <div className="relative">
            <Repeat className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 text-xs font-bold bg-foreground text-background rounded-full w-4 h-4 flex items-center justify-center">1</span>
          </div>
        );
      case 'all':
        return <Repeat className="h-5 w-5" />;
      default:
        return <Repeat className="h-5 w-5" />;
    }
  };

  const handlePlayPause = () => {
    const audioElement = audioRef.current;
    if (!audioElement) return;

    if (playerState === 'playing') {
      audioElement.pause();
      setPlayerState('idle');
      onPause?.();
    } else {
      audioElement.play()
        .then(() => {
          setPlayerState('playing');
          onPlay?.();
        })
        .catch((error) => {
          console.error('Failed to play:', error);
          setPlayerState('error');
          setError('Playback failed');
        });
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t p-4">
        <div className="text-center text-muted-foreground">
          <p>Loading audio...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t p-4">
        <div className="text-center text-red-500">
          <p>{error}</p>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRetry}
            className="mt-2"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  // Show main player UI
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t p-4">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex-1">
          <h3 className="text-foreground font-medium">{title}</h3>
          <p className="text-muted-foreground text-sm">{artist}</p>
        </div>
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleSkipPrevious}
            className="h-10 w-10"
          >
            <SkipBack className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handlePlayPause}
            className="h-10 w-10"
          >
            {playerState === 'playing' ? (
              <Pause className="h-5 w-5" />
            ) : (
              <Play className="h-5 w-5" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleSkipNext}
            className="h-10 w-10"
          >
            <SkipForward className="h-5 w-5" />
          </Button>
        </div>
      </div>
      <audio
        ref={audioRef}
        src={audioUrl || undefined}
        onCanPlay={handleReactCanPlay}
        onError={handleReactError}
        onLoadedMetadata={handleReactLoadedMetadata}
      />
    </div>
  );
}; 