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

  // Constants
  const MAX_RETRIES = 3;
  const validatedTimestamp = initialTimestamp && !isNaN(initialTimestamp) && initialTimestamp >= 0 
    ? initialTimestamp 
    : 0;

  // Initialize audio element
  useEffect(() => {
    console.log('AudioPlayer - Initializing audio element');
    const audio = new Audio();
    audio.volume = volume;
    audio.crossOrigin = "anonymous";
    audioRef.current = audio;

    const handleTimeUpdate = () => {
      const currentAudio = audioRef.current;
      if (currentAudio) {
        setCurrentTime(currentAudio.currentTime);
      }
    };

    const handleLoadedMetadata = () => {
      const currentAudio = audioRef.current;
      if (currentAudio) {
        setDuration(currentAudio.duration);
      }
    };

    const handleCanPlay = () => {
      setLoadingState('ready');
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('canplay', handleCanPlay);

    return () => {
      audio.pause();
      audio.src = '';
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('canplay', handleCanPlay);
    };
  }, []);

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

        const s3Info = extractS3Info(s3Uri);
        console.log('AudioPlayer - Getting presigned URL for:', s3Info);
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
              return;
            }
            const errorMessage = err instanceof Error ? err.message : 'Failed to start playback';
            setError(errorMessage);
            setPlayerState('error');
          }
        }
      } catch (err) {
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
          await currentAudio.play();
          setPlayerState('playing');
          onPlayStarted?.();
        } catch (err) {
          if (err instanceof Error && err.name === 'NotAllowedError') {
            return;
          }
          setError('Playback failed');
          setPlayerState('error');
        }
      } else {
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
    if (!s3Uri || s3Uri.trim() === '') {
      throw new Error('No S3 URI provided. Please ensure a valid audio file is selected.');
    }
    if (!s3Uri.startsWith('s3://')) {
      throw new Error('Invalid S3 URI format: URI must start with "s3://"');
    }
    
    // Remove 's3://' and split by first '/'
    const path = s3Uri.slice(5);
    const [bucket, ...keyParts] = path.split('/');
    
    if (!bucket || bucket.trim() === '') {
      throw new Error('Invalid S3 URI format: bucket name is missing');
    }
    
    // Join the remaining parts to get the full key
    const key = keyParts.join('/');
    if (!key || key.trim() === '') {
      throw new Error('Invalid S3 URI format: file path is missing');
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
    setRetryCount(0);
    setError(null);
    setLoadingState('loading');
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

  return (
    <div className="spotify-player fixed bottom-0 left-0 right-0">
      <div className="container mx-auto flex items-center justify-between px-4">
        {/* Song Info */}
        <div className="flex items-center space-x-4 min-w-[200px]">
          <div className="flex flex-col">
            {error ? (
              <div className="flex items-center space-x-2">
                <p className="text-red-500 text-sm">{error}</p>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleRetry}
                  className="text-spotify-green hover:text-spotify-green/80"
                  data-testid="retry-button"
                  aria-label="Retry loading audio"
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <>
                <span className="text-sm font-medium text-foreground truncate">{title}</span>
                <span className="text-xs text-muted-foreground truncate">{artist}</span>
              </>
            )}
          </div>
        </div>

        {/* Player Controls */}
        <div className="flex flex-col items-center flex-1 max-w-2xl">
          <div className="flex items-center justify-center space-x-4 mb-2">
            <Button 
              variant="ghost" 
              size="icon"
              className="spotify-button w-8 h-8 p-0 text-foreground"
              onClick={handleSkipPrevious}
              aria-label="Previous track"
            >
              <SkipBack className="h-5 w-5" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="spotify-button w-10 h-10 p-0 text-foreground"
              onClick={handlePlayPause}
              aria-label={playerState === 'playing' ? "Pause" : "Play"}
            >
              {playerState === 'playing' ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="spotify-button w-8 h-8 p-0 text-foreground"
              onClick={handleSkipNext}
              aria-label="Next track"
            >
              <SkipForward className="h-5 w-5" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className={getLoopButtonClass()}
              onClick={toggleLoop}
              aria-label={`Loop ${loopMode}`}
              title={loopMode === 'off' ? 'Loop Off' : loopMode === 'all' ? 'Loop All' : 'Loop One'}
            >
              {getLoopIcon()}
            </Button>
          </div>

          {/* Progress Bar */}
          <div className="w-full flex items-center space-x-2">
            <span className="text-xs text-muted-foreground w-10 text-right">
              {formatTime(currentTime)}
            </span>
            <Slider
              value={[currentTime]}
              max={duration}
              min={0}
              step={1}
              onValueChange={handleTimeChange}
              aria-label="Playback progress"
              className="w-full"
            />
            <span className="text-xs text-muted-foreground w-10">
              {formatTime(duration)}
            </span>
          </div>
        </div>

        {/* Volume Control */}
        <div className="flex items-center space-x-2 min-w-[150px]">
          <Volume2 className="h-4 w-4 text-muted-foreground" />
          <Slider
            value={[volume * 100]}
            max={100}
            min={0}
            step={1}
            onValueChange={handleVolumeChange}
            aria-label="Volume"
            className="w-24"
          />
        </div>
      </div>
    </div>
  );
}; 