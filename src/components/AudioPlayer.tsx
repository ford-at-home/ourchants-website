import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, Loader2 } from "lucide-react";
import { Button } from "./ui/button";
import { Slider } from "./ui/slider";
import { getPresignedUrl } from "../services/songApi";

interface AudioPlayerProps {
  s3Uri: string;
  title?: string;
  artist?: string;
  onPlay: () => void;
  onPause: () => void;
  shouldPlay?: boolean;
  onPlayStarted?: () => void;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({ 
  s3Uri, 
  title, 
  artist, 
  onPlay, 
  onPause, 
  shouldPlay = false,
  onPlayStarted,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [loadingState, setLoadingState] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');
  const prevS3UriRef = useRef<string | null>(null);

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
      setIsPlaying(false);
      setCurrentTime(0);
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

    const setupAudio = async () => {
      try {
        const s3Info = extractS3Info(s3Uri);
        const response = await getPresignedUrl(s3Info.bucket, s3Info.key);
        
        if (audioRef.current) {
          audioRef.current.src = response.url;
          setAudioUrl(response.url);
          setLoadingState('ready');
          
          if (shouldPlay) {
            try {
              await audioRef.current.play();
              setIsPlaying(true);
            } catch (err) {
              console.error('Failed to start playback:', err);
              setError('Failed to start playback');
            }
          }
        }
      } catch (err) {
        console.error('Error setting up audio:', err);
        setError('Failed to load audio');
        setLoadingState('error');
      }
    };

    setupAudio();
  }, [s3Uri, shouldPlay]);

  // Handle play/pause state changes
  useEffect(() => {
    if (!audioRef.current || !audioUrl) return;

    const handlePlayState = async () => {
      if (shouldPlay && !isPlaying) {
        try {
          await audioRef.current!.play();
          setIsPlaying(true);
          onPlay();
        } catch (err) {
          console.error('Play failed:', err);
          setError('Playback failed');
        }
      } else if (!shouldPlay && isPlaying) {
        audioRef.current!.pause();
        setIsPlaying(false);
        onPause();
      }
    };

    handlePlayState();
  }, [shouldPlay, audioUrl, isPlaying, onPlay, onPause]);

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

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-spotify-darkgray p-4">
      <div className="max-w-4xl mx-auto flex flex-col gap-4">
        {/* Song Info */}
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <p className="text-white font-medium truncate">{getLoadingText()}</p>
            {artist && loadingState === 'ready' && (
              <p className="text-spotify-lightgray text-sm truncate">{artist}</p>
            )}
          </div>
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
              onClick={() => {
                if (!audioRef.current) {
                  console.error('Audio ref is null');
                  return;
                }
                if (isPlaying) {
                  console.log('Pausing audio');
                  audioRef.current.pause();
                  setIsPlaying(false);
                  onPause();
                } else {
                  console.log('Playing audio');
                  audioRef.current.play().then(() => {
                    console.log('Audio play successful');
                    setIsPlaying(true);
                    onPlay();
                  }).catch(err => {
                    console.error('Error starting playback:', err);
                    setError('Error starting playback. Please try again.');
                  });
                }
              }}
              disabled={!s3Uri || isLoading || !!error || loadingState !== 'ready'}
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : isPlaying ? (
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
            />
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="text-red-500 text-sm mt-2">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}; 