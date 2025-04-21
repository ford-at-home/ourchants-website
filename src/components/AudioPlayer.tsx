import React, { useEffect, useRef, useState } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, Loader2, RotateCcw, Share2 } from "lucide-react";
import { Button } from "./ui/button";
import { Slider } from "./ui/slider";
import { getPresignedUrl } from "../services/songApi";
import { saveResumeState } from "../utils/resumeState";
import { Spinner } from './ui/spinner';
import { createSongUrl } from '../utils/urlParams';
import { toast } from 'sonner';

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
}

type PlayerState = 'idle' | 'loading' | 'buffering' | 'playing' | 'error';

export const AudioPlayer: React.FC<AudioPlayerProps> = ({ 
  s3Uri, 
  title = 'Unknown Title',
  artist = 'Unknown Artist',
  songId,
  onPlay, 
  onPause, 
  shouldPlay = false,
  onPlayStarted,
  initialTimestamp
}) => {
  const [playerState, setPlayerState] = useState<PlayerState>('idle');
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [loadingState, setLoadingState] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');
  const prevS3UriRef = useRef<string | null>(null);
  const [isBuffering, setIsBuffering] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 3;

  // Initialize audio element only once
  useEffect(() => {
    const audio = new Audio();
    audio.volume = volume;
    audio.crossOrigin = "anonymous";
    audioRef.current = audio;

    // Add event listeners
    const handleTimeUpdate = () => {
      if (audioRef.current) {
        setCurrentTime(audioRef.current.currentTime);
      }
    };

    const handleLoadedMetadata = () => {
      if (audioRef.current) {
        setDuration(audioRef.current.duration);
      }
    };

    const handleEnded = () => {
      setPlayerState('idle');
      onPause?.();
    };

    const handleCanPlay = () => {
      setLoadingState('ready');
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('canplay', handleCanPlay);

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
        audioRef.current.removeEventListener('timeupdate', handleTimeUpdate);
        audioRef.current.removeEventListener('loadedmetadata', handleLoadedMetadata);
        audioRef.current.removeEventListener('ended', handleEnded);
        audioRef.current.removeEventListener('canplay', handleCanPlay);
      }
    };
  }, []);

  const extractS3Info = (s3Uri: string) => {
    console.log('Extracting S3 info from URI:', s3Uri);
    if (!s3Uri) {
      throw new Error('S3 URI is required');
    }
    if (!s3Uri.startsWith('s3://')) {
      throw new Error('Invalid S3 URI format: must start with s3://');
    }
    
    // Remove 's3://' and split by first '/'
    const path = s3Uri.slice(5);
    const [bucket, ...keyParts] = path.split('/');
    
    if (!bucket) {
      throw new Error('Invalid S3 URI format: bucket name is required');
    }
    
    // Join the remaining parts to get the full key
    const key = keyParts.join('/');
    if (!key) {
      throw new Error('Invalid S3 URI format: key is required');
    }
    
    console.log('Extracted S3 info:', { bucket, key });
    return { bucket, key };
  };

  // Handle S3 URI changes and fetch presigned URL
  useEffect(() => {
    if (!s3Uri || s3Uri === prevS3UriRef.current) {
      return;
    }

    prevS3UriRef.current = s3Uri;
    setLoadingState('loading');
    setError(null);
    setCurrentTime(0); // Reset current time when song changes

    const setupAudio = async () => {
      try {
        const s3Info = extractS3Info(s3Uri);
        const response = await getPresignedUrl(s3Info.bucket, s3Info.key);
        
        if (audioRef.current) {
          audioRef.current.src = response.url;
          audioRef.current.currentTime = 0; // Ensure audio starts from beginning
          setAudioUrl(response.url);
          setLoadingState('ready');
          
          // Set initial timestamp if provided
          if (initialTimestamp) {
            audioRef.current.currentTime = initialTimestamp;
          }
        }
      } catch (err) {
        console.error('Error setting up audio:', err);
        setError('Failed to load audio');
        setLoadingState('error');
        setPlayerState('error');
      }
    };

    setupAudio();
  }, [s3Uri, initialTimestamp]);

  // Handle play/pause state changes
  useEffect(() => {
    if (!audioRef.current || !audioUrl) return;

    const handlePlayState = async () => {
      // Never try to autoplay when loading from a URL
      const isFromUrl = window.location.search.includes('song=');
      if (isFromUrl) {
        return;
      }

      if (shouldPlay && playerState !== 'playing') {
        try {
          await audioRef.current!.play();
          setPlayerState('playing');
          onPlay?.();
        } catch (err) {
          console.error('Play failed:', err);
          if (err instanceof Error && err.name === 'NotAllowedError') {
            // Don't show error for autoplay restrictions
            return;
          }
          setError('Playback failed');
          setPlayerState('error');
        }
      } else if (!shouldPlay && playerState === 'playing') {
        audioRef.current!.pause();
        setPlayerState('idle');
        onPause?.();
      }
    };

    handlePlayState();
  }, [shouldPlay, audioUrl, playerState, onPlay, onPause]);

  // Save resume state every 5 seconds when playing
  useEffect(() => {
    if (!playerState || !songId || !audioRef.current) return;

    const interval = setInterval(() => {
      if (audioRef.current) {
        saveResumeState(songId, audioRef.current.currentTime);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [playerState, songId]);

  const handleTimeChange = (value: number[]) => {
    if (!audioRef.current) return;
    console.log('Seeking to:', value[0]);
    audioRef.current.currentTime = value[0];
  };

  const handleVolumeChange = (value: number[]) => {
    if (!audioRef.current) return;
    console.log('Setting volume to:', value[0]);
    audioRef.current.volume = value[0] / 100;
    setVolume(value[0] / 100);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getLoadingText = () => {
    if (!s3Uri) {
      return 'Select a song to play';
    }
    switch (loadingState) {
      case 'loading':
        return 'Loading...';
      case 'ready':
        return title || 'Now Playing';
      case 'error':
        return 'Error Loading Audio';
      default:
        return 'Preparing...';
    }
  };

  const handleRetry = () => {
    if (retryCount >= MAX_RETRIES) {
      setError('Maximum retry attempts reached. Please try again later.');
      return;
    }
    setRetryCount(prev => prev + 1);
    setError(null);
    // Re-initialize audio
    const event = new Event('retry');
    window.dispatchEvent(event);
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

  if (error) {
    return (
      <div className="flex items-center justify-between p-4 bg-spotify-darkgray rounded-lg">
        <div className="flex-1">
          <p className="text-red-500">{error}</p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleRetry}
          className="text-spotify-green hover:text-spotify-green/80"
        >
          <RotateCcw className="h-5 w-5" />
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-spotify-darkgray p-4">
      <div className="max-w-4xl mx-auto flex flex-col gap-4">
        {/* Song Info */}
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <p className="text-white font-medium truncate">{getLoadingText()}</p>
            {artist && playerState !== 'error' && (
              <p className="text-spotify-lightgray text-sm truncate">{artist}</p>
            )}
          </div>
          {songId && playerState !== 'error' && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleShare}
              className="text-spotify-lightgray hover:text-white"
              title="Share song"
            >
              <Share2 className="h-5 w-5" />
            </Button>
          )}
        </div>

        {/* Progress Bar */}
        <div className="flex items-center gap-4">
          <span className="text-sm text-spotify-lightgray">{formatTime(currentTime)}</span>
          <Slider
            value={[currentTime]}
            max={duration}
            step={0.1}
            onValueChange={handleTimeChange}
            className="flex-1"
            disabled={!s3Uri || isLoading || !!error || loadingState !== 'ready'}
            aria-label="Progress"
          />
          <span className="text-sm text-spotify-lightgray">{formatTime(duration)}</span>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="text-spotify-lightgray hover:text-white"
              onClick={() => {
                if (audioRef.current) {
                  audioRef.current.currentTime = Math.max(0, currentTime - 10);
                }
              }}
              disabled={!s3Uri || isLoading || !!error || loadingState !== 'ready'}
            >
              <SkipBack className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="bg-white text-black hover:scale-105 transition-transform"
              onClick={async () => {
                if (!audioRef.current) {
                  console.error('Audio ref is null');
                  return;
                }
                try {
                  if (playerState === 'playing') {
                    console.log('Pausing audio');
                    audioRef.current.pause();
                    setPlayerState('idle');
                    onPause?.();
                  } else {
                    console.log('Playing audio');
                    await audioRef.current.play();
                    console.log('Audio play successful');
                    setPlayerState('playing');
                    onPlay?.();
                  }
                } catch (err) {
                  console.error('Error starting playback:', err);
                  if (err instanceof Error && err.name === 'NotAllowedError') {
                    toast.error('Please click the play button to start playback');
                  } else {
                    setError('Error starting playback. Please try again.');
                    setPlayerState('error');
                  }
                }
              }}
              disabled={!s3Uri || isLoading || !!error || loadingState !== 'ready'}
              aria-label={playerState === 'playing' ? 'Pause' : 'Play'}
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : playerState === 'playing' ? (
                <Pause className="h-5 w-5" />
              ) : (
                <Play className="h-5 w-5" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-spotify-lightgray hover:text-white"
              onClick={() => {
                if (audioRef.current) {
                  audioRef.current.currentTime = Math.min(duration, currentTime + 10);
                }
              }}
              disabled={!s3Uri || isLoading || !!error || loadingState !== 'ready'}
            >
              <SkipForward className="h-5 w-5" />
            </Button>
          </div>

          {/* Volume Control */}
          <div className="flex items-center gap-2">
            <Volume2 className="h-5 w-5 text-spotify-lightgray" />
            <Slider
              value={[volume * 100]}
              max={100}
              step={1}
              onValueChange={handleVolumeChange}
              className="w-24"
              disabled={isLoading || !!error}
              aria-label="Volume"
            />
          </div>
        </div>
      </div>
    </div>
  );
}; 