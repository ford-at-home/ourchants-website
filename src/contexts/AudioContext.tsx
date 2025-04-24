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
  const [currentPage, setCurrentPage] = useState(1);

  console.log('AudioContext - Initial state:', {
    selectedSong,
    shouldPlay,
    resumeTimestamp,
    currentPage
  });

  const { data, isLoading } = useQuery({
    queryKey: ['songs', currentPage],
    queryFn: () => {
      console.log('AudioContext - Fetching songs with params:', {
        currentPage,
        limit: 20,
        offset: (currentPage - 1) * 20
      });
      return fetchSongs({
        limit: 20,
        offset: (currentPage - 1) * 20
      });
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Add debug logging for data changes
  useEffect(() => {
    console.log('AudioContext - Data state changed:', {
      data,
      isLoading,
      dataType: data ? typeof data : 'undefined',
      itemsType: data?.items ? typeof data.items : 'undefined',
      isArray: Array.isArray(data?.items),
      itemsLength: data?.items?.length,
      selectedSong,
      rawData: data
    });
  }, [data, isLoading, selectedSong]);

  // Ensure songs is always an array
  const songs = Array.isArray(data?.items) ? data.items : [];
  console.log('AudioContext - Processed songs array:', {
    songsLength: songs.length,
    isArray: Array.isArray(songs),
    firstSong: songs[0]
  });

  const handlePlay = useCallback(() => {
    console.log('AudioContext - handlePlay called');
    setShouldPlay(true);
  }, []);

  const handlePause = useCallback(() => {
    console.log('AudioContext - handlePause called');
    setShouldPlay(false);
  }, []);

  const resumeFromTimestamp = useCallback((timestamp: number) => {
    console.log('AudioContext - resumeFromTimestamp called:', timestamp);
    setResumeTimestamp(timestamp);
    setShouldPlay(true);
  }, []);

  const handleSkipNext = useCallback(() => {
    console.log('AudioContext - handleSkipNext called:', {
      isLoading,
      selectedSong,
      songsLength: songs.length,
      hasMore: data?.has_more,
      songs: songs
    });

    if (isLoading || !selectedSong || songs.length === 0) {
      console.log('AudioContext - Skipping next - invalid state');
      return;
    }
    
    const currentIndex = songs.findIndex(song => song.song_id === selectedSong.song_id);
    console.log('AudioContext - Current index:', currentIndex);
    
    if (currentIndex === -1) {
      console.log('AudioContext - Current song not found in list');
      return;
    }
    
    if (currentIndex === songs.length - 1 && data?.has_more) {
      console.log('AudioContext - Loading next page');
      setCurrentPage(prev => prev + 1);
      return;
    }
    
    const nextIndex = (currentIndex + 1) % songs.length;
    const nextSong = songs[nextIndex];
    console.log('AudioContext - Next song:', nextSong);
    
    setSelectedSong(nextSong);
    setShouldPlay(true);
  }, [selectedSong, songs, isLoading, data?.has_more]);

  const handleSkipPrevious = useCallback(() => {
    console.log('AudioContext - handleSkipPrevious called:', {
      isLoading,
      selectedSong,
      songsLength: songs.length,
      currentPage
    });

    if (isLoading || !selectedSong || songs.length === 0) {
      console.log('AudioContext - Skipping previous - invalid state');
      return;
    }
    
    const currentIndex = songs.findIndex(song => song.song_id === selectedSong.song_id);
    console.log('AudioContext - Current index:', currentIndex);
    
    if (currentIndex === -1) {
      console.log('AudioContext - Current song not found in list');
      return;
    }
    
    if (currentIndex === 0 && currentPage > 1) {
      console.log('AudioContext - Loading previous page');
      setCurrentPage(prev => prev - 1);
      return;
    }
    
    const prevIndex = (currentIndex - 1 + songs.length) % songs.length;
    const prevSong = songs[prevIndex];
    console.log('AudioContext - Previous song:', prevSong);
    
    setSelectedSong(prevSong);
    setShouldPlay(true);
  }, [selectedSong, songs, isLoading, currentPage]);

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