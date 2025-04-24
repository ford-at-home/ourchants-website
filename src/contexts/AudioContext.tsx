/**
 * AudioContext
 * 
 * IMPORTANT CONTEXT FOR FUTURE DEVELOPERS/AI:
 * 
 * 1. PURPOSE:
 *    - Manages global audio state across the application
 *    - Handles song selection, playback state, and navigation
 *    - Provides audio controls to all components
 * 
 * 2. CRITICAL LESSONS LEARNED:
 *    - State management is complex and affects multiple components
 *    - Changes here can have wide-ranging effects
 *    - Error handling must be consistent across the app
 *    - Performance is critical - avoid unnecessary re-renders
 * 
 * 3. COMMON PITFALLS TO AVOID:
 *    - Don't add unnecessary state or complexity
 *    - Don't modify the API without considering all consumers
 *    - Don't ignore error states or edge cases
 *    - Don't make changes without testing all affected components
 * 
 * 4. USAGE PATTERNS:
 *    - Use the context at the highest necessary level
 *    - Consider performance implications of context updates
 *    - Handle errors consistently across the app
 *    - Test all components that consume this context
 */

import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import { Song } from '../types/song';
import { AudioPlayer } from '../components/AudioPlayer';
import { useQuery } from '@tanstack/react-query';
import { fetchSongs } from '../services/songApi';

interface AudioContextType {
  selectedSong: Song | null;
  setSelectedSong: (song: Song | null) => void;
  shouldPlay: boolean;
  setShouldPlay: (shouldPlay: boolean) => void;
  handlePlay: () => void;
  handlePause: () => void;
  resumeFromTimestamp: (timestamp: number) => void;
  handleSkipNext: () => void;
  handleSkipPrevious: () => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export const AudioProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [shouldPlay, setShouldPlay] = useState(false);
  const [resumeTimestamp, setResumeTimestamp] = useState<number | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['songs'],
    queryFn: fetchSongs,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Add debug logging for data changes
  useEffect(() => {
    console.log('Songs data changed:', {
      data,
      isLoading,
      songsLength: data?.items?.length || 0,
      selectedSong
    });
  }, [data, isLoading, selectedSong]);

  // Ensure songs is always an array
  const songs = Array.isArray(data?.items) ? data.items : [];

  const handlePlay = useCallback(() => {
    console.log('handlePlay called');
    setShouldPlay(true);
  }, []);

  const handlePause = useCallback(() => {
    console.log('handlePause called');
    setShouldPlay(false);
  }, []);

  const resumeFromTimestamp = useCallback((timestamp: number) => {
    console.log('resumeFromTimestamp called:', timestamp);
    setResumeTimestamp(timestamp);
    setShouldPlay(true);
  }, []);

  const handleSkipNext = useCallback(() => {
    console.log('handleSkipNext called:', {
      isLoading,
      selectedSong,
      songsLength: songs.length
    });

    if (isLoading || !selectedSong || songs.length === 0) {
      console.log('Skipping next - invalid state');
      return;
    }
    
    const currentIndex = songs.findIndex(song => song.song_id === selectedSong.song_id);
    console.log('Current index:', currentIndex);
    
    if (currentIndex === -1) {
      console.log('Current song not found in list');
      return;
    }
    
    const nextIndex = (currentIndex + 1) % songs.length;
    const nextSong = songs[nextIndex];
    console.log('Next song:', nextSong);
    
    setSelectedSong(nextSong);
    setShouldPlay(true);
  }, [selectedSong, songs, isLoading]);

  const handleSkipPrevious = useCallback(() => {
    console.log('handleSkipPrevious called:', {
      isLoading,
      selectedSong,
      songsLength: songs.length
    });

    if (isLoading || !selectedSong || songs.length === 0) {
      console.log('Skipping previous - invalid state');
      return;
    }
    
    const currentIndex = songs.findIndex(song => song.song_id === selectedSong.song_id);
    console.log('Current index:', currentIndex);
    
    if (currentIndex === -1) {
      console.log('Current song not found in list');
      return;
    }
    
    const prevIndex = (currentIndex - 1 + songs.length) % songs.length;
    const prevSong = songs[prevIndex];
    console.log('Previous song:', prevSong);
    
    setSelectedSong(prevSong);
    setShouldPlay(true);
  }, [selectedSong, songs, isLoading]);

  return (
    <AudioContext.Provider
      value={{
        selectedSong,
        setSelectedSong,
        shouldPlay,
        setShouldPlay,
        handlePlay,
        handlePause,
        resumeFromTimestamp,
        handleSkipNext,
        handleSkipPrevious,
      }}
    >
      {children}
      <AudioPlayer 
        s3Uri={selectedSong?.s3_uri || ''} 
        title={selectedSong?.title}
        artist={selectedSong?.artist}
        songId={selectedSong?.song_id}
        onPlay={handlePlay}
        onPause={handlePause}
        shouldPlay={shouldPlay}
        initialTimestamp={resumeTimestamp || undefined}
        onSkipNext={handleSkipNext}
        onSkipPrevious={handleSkipPrevious}
      />
    </AudioContext.Provider>
  );
};

export const useAudio = () => {
  const context = useContext(AudioContext);
  if (context === undefined) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
}; 