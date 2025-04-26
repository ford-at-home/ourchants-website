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

import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchSongs } from '../services/songApi';
import { Song } from '../types/song';

interface AudioContextType {
  selectedSong: Song | null;
  setSelectedSong: (song: Song | null) => void;
  shouldPlay: boolean;
  handlePlay: () => void;
  handlePause: () => void;
  resumeFromTimestamp: (timestamp: number) => void;
  handleSkipNext: () => void;
  handleSkipPrevious: () => void;
}

interface SongsResponse {
  items: Song[];
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

  const { data, isLoading } = useQuery<SongsResponse>({
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
  const songs = data?.items || [];
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
    if (!selectedSong || !songs.length) return;
    const currentIndex = songs.findIndex(s => s.song_id.S === selectedSong.song_id.S);
    if (currentIndex < songs.length - 1) {
      setSelectedSong(songs[currentIndex + 1]);
    }
  }, [selectedSong, songs]);

  const handleSkipPrevious = useCallback(() => {
    if (!selectedSong || !songs.length) return;
    const currentIndex = songs.findIndex(s => s.song_id.S === selectedSong.song_id.S);
    if (currentIndex > 0) {
      setSelectedSong(songs[currentIndex - 1]);
    }
  }, [selectedSong, songs]);

  return (
    <AudioContext.Provider
      value={{
        selectedSong,
        setSelectedSong,
        shouldPlay,
        handlePlay,
        handlePause,
        resumeFromTimestamp,
        handleSkipNext,
        handleSkipPrevious
      }}
    >
      {children}
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