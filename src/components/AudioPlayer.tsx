import React, { useEffect, useRef, useState } from 'react';
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
  const [loopMode, setLoopMode] = useState<LoopMode>('off');
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
      if (loopMode === 'one') {
        // If looping one song, restart the current song
        if (audioRef.current) {
          audioRef.current.currentTime = 0;
          audioRef.current.play();
        }
      } else if (loopMode === 'all') {
        // If looping all, play the next song
        onSkipNext?.();
      } else {
        // If no loop, stop playback
        setPlayerState('idle');
        onPause?.();
      }
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
  }, [loopMode, onSkipNext, onPause]);

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

    console.log('AudioPlayer: New song selected', { s3Uri, prevS3Uri: prevS3UriRef.current });
    prevS3UriRef.current = s3Uri;
    setLoadingState('loading');
    setError(null);
    setCurrentTime(0); // Reset current time when song changes

    const setupAudio = async () => {
      try {
        // First, stop and reset the current audio
        if (audioRef.current) {
          console.log('AudioPlayer: Stopping current audio');
          audioRef.current.pause();
          audioRef.current.src = '';
          audioRef.current.load(); // Force a reload of the audio element
        }

        const s3Info = extractS3Info(s3Uri);
        console.log('AudioPlayer: Fetching presigned URL', s3Info);
        const response = await getPresignedUrl(s3Info.bucket, s3Info.key);
        
        if (audioRef.current) {
          console.log('AudioPlayer: Setting new audio source');
          audioRef.current.src = response.url;
          audioRef.current.load(); // Force a reload with the new source
          setAudioUrl(response.url);
          setLoadingState('ready');
          
          // Set initial timestamp if provided
          if (initialTimestamp) {
            console.log('AudioPlayer: Setting initial timestamp', initialTimestamp);
            audioRef.current.currentTime = initialTimestamp;
          }

          // If shouldPlay is true, start playing the new song
          if (shouldPlay) {
            console.log('AudioPlayer: Starting playback of new song');
            try {
              await audioRef.current.play();
              setPlayerState('playing');
              onPlay?.();
            } catch (err) {
              console.error('Failed to play new song:', err);
              if (err instanceof Error && err.name === 'NotAllowedError') {
                // Don't show error for autoplay restrictions
                return;
              }
              setError('Playback failed');
              setPlayerState('error');
            }
          }
        }
      } catch (err) {
        console.error('Error setting up audio:', err);
        if (retryCount < MAX_RETRIES) {
          setRetryCount(prev => prev + 1);
          toast.error('Failed to load audio. Retrying...', {
            duration: 3000,
            action: {
              label: 'Retry Now',
              onClick: () => setupAudio()
            }
          });
        } else {
          setError('Failed to load audio after multiple attempts. Please try again later.');
          setLoadingState('error');
          setPlayerState('error');
          toast.error('Failed to load audio after multiple attempts. Please try again later.');
        }
      }
    };

    setupAudio();
  }, [s3Uri, initialTimestamp, shouldPlay, onPlay]);

  // Handle play/pause state changes
  useEffect(() => {
    if (!audioRef.current || !audioUrl) return;

    const handlePlayState = async () => {
      console.log('AudioPlayer: Play state changed', { shouldPlay, playerState, audioUrl });
      
      // Never try to autoplay when loading from a URL
      const isFromUrl = window.location.search.includes('song=');
      if (isFromUrl) {
        return;
      }

      if (shouldPlay && playerState !== 'playing') {
        try {
          console.log('AudioPlayer: Attempting to play');
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
        console.log('AudioPlayer: Pausing playback');
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

  const handleSkipNext = () => {
    if (onSkipNext) {
      onSkipNext();
    }
  };

  const handleSkipPrevious = () => {
    if (onSkipPrevious) {
      onSkipPrevious();
    }
  };

  const toggleLoop = () => {
    const modes: LoopMode[] = ['off', 'all', 'one'];
    const currentIndex = modes.indexOf(loopMode);
    const nextIndex = (currentIndex + 1) % modes.length;
    const newMode = modes[nextIndex];
    setLoopMode(newMode);
    
    if (audioRef.current) {
      audioRef.current.loop = newMode === 'one';
    }
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
    if (playerState === 'playing') {
      onPause?.();
    } else {
      onPlay?.();
    }
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
    <div className="spotify-player fixed bottom-0 left-0 right-0">
      <div className="container mx-auto flex items-center justify-between px-4">
        {/* Song Info */}
        <div className="flex items-center space-x-4 min-w-[200px]">
          <div className="flex flex-col">
            <span className="text-sm font-medium text-foreground truncate">{title}</span>
            <span className="text-xs text-muted-foreground truncate">{artist}</span>
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
            >
              <SkipBack className="h-5 w-5" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="spotify-button w-10 h-10 p-0 text-foreground"
              onClick={handlePlayPause}
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
              className="spotify-button w-8 h-8 p-0 text-foreground"
              onClick={handleSkipNext}
            >
              <SkipForward className="h-5 w-5" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className={getLoopButtonClass()}
              onClick={toggleLoop}
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
              min={0}
              max={duration || 100}
              step={1}
              className="flex-1"
              onValueChange={handleTimeChange}
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
            min={0}
            max={100}
            step={1}
            className="w-24"
            onValueChange={(value) => handleVolumeChange(value)}
          />
        </div>
      </div>
    </div>
  );
}; 