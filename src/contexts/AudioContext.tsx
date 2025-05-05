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
import { isValidS3Uri } from '../utils/audioHelpers';
import { getSongFromUrl } from '../utils/urlParams';

interface AudioContextType {
  selectedSong: Song | null;
  setSelectedSong: (song: Song | null) => void;
  shouldPlay: boolean;
  setShouldPlay: (shouldPlay: boolean) => void;
  handlePlay: () => void;
  handlePause: () => void;
  handleSkipNext: () => void;
  handleSkipPrevious: () => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export const AudioProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [shouldPlay, setShouldPlay] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pendingSharedSong, setPendingSharedSong] = useState<{ songId: string; timestamp?: number } | null>(null);

  const { data: songs, isLoading } = useQuery<Song[]>({
    queryKey: ['songs'],
    queryFn: async () => {
      console.log('AudioContext - Fetching songs');
      const songs = await fetchSongs();
      console.log('AudioContext - Fetched songs:', { count: songs?.length, songs });
      return songs;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Check for shared song on mount
  useEffect(() => {
    const sharedSong = getSongFromUrl();
    if (sharedSong) {
      console.log('AudioContext - Found shared song in URL, storing as pending:', sharedSong);
      setPendingSharedSong(sharedSong);
    }
  }, []);

  // Initialize with shared song if present
  useEffect(() => {
    const initializeSharedSong = async () => {
      console.log('AudioContext - Checking for pending shared song:', {
        pendingSharedSong,
        songsLoaded: songs?.length,
        isLoading
      });

      if (!songs || isLoading || !pendingSharedSong) {
        return;
      }

      const targetSong = songs.find(s => s.song_id === pendingSharedSong.songId);
      if (targetSong) {
        console.log('AudioContext - Setting shared song:', targetSong);
        setSelectedSong(targetSong);
        setShouldPlay(true);
        setPendingSharedSong(null); // Clear pending song
      } else {
        console.log('AudioContext - Shared song not found in data');
      }
    };

    initializeSharedSong();
  }, [songs, isLoading, pendingSharedSong]);

  // Add debug logging for state changes
  useEffect(() => {
    console.log('AudioContext - State changed:', {
      selectedSong,
      shouldPlay,
      currentPage,
      songsLoaded: songs?.length,
      isLoading
    });
  }, [selectedSong, shouldPlay, currentPage, songs, isLoading]);

  const handlePlay = useCallback(() => {
    console.log('AudioContext - handlePlay called', {
      selectedSong,
      shouldPlay,
      currentPage,
      songsLength: songs?.length
    });
    setShouldPlay(true);
  }, [selectedSong, shouldPlay, currentPage, songs?.length]);

  const handlePause = useCallback(() => {
    console.log('AudioContext - handlePause called', {
      selectedSong,
      shouldPlay,
      currentPage,
      songsLength: songs?.length
    });
    setShouldPlay(false);
  }, [selectedSong, shouldPlay, currentPage, songs?.length]);

  const handleSkipNext = useCallback(() => {
    if (!songs || !selectedSong) return;
    
    console.log('AudioContext - handleSkipNext called:', {
      selectedSong,
      songsLength: songs.length
    });
    
    const currentIndex = songs.findIndex(song => song.song_id === selectedSong.song_id);
    if (currentIndex === -1) return;
    
    const nextIndex = (currentIndex + 1) % songs.length;
    const nextSong = songs[nextIndex];
    
    console.log('AudioContext - Skipping to next song:', nextSong);
    setSelectedSong(nextSong);
    setShouldPlay(true);
  }, [selectedSong, songs]);

  const handleSkipPrevious = useCallback(() => {
    if (!songs || !selectedSong) return;
    
    console.log('AudioContext - handleSkipPrevious called:', {
      selectedSong,
      songsLength: songs.length
    });
    
    const currentIndex = songs.findIndex(song => song.song_id === selectedSong.song_id);
    if (currentIndex === -1) return;
    
    const prevIndex = (currentIndex - 1 + songs.length) % songs.length;
    const prevSong = songs[prevIndex];
    
    console.log('AudioContext - Skipping to previous song:', prevSong);
    setSelectedSong(prevSong);
    setShouldPlay(true);
  }, [selectedSong, songs]);

  const handleSetSelectedSong = useCallback((song: Song | null) => {
    console.log('AudioContext - Setting selected song:', {
      song,
      s3Uri: song?.s3_uri,
      filename: song?.filename,
      filepath: song?.filepath
    });

    if (song && !isValidS3Uri(song.s3_uri)) {
      console.error('AudioContext - Invalid S3 URI for song:', {
        song,
        s3Uri: song.s3_uri
      });
      return;
    }

    setSelectedSong(song);
  }, []);

  return (
    <AudioContext.Provider
      value={{
        selectedSong,
        setSelectedSong: handleSetSelectedSong,
        shouldPlay,
        setShouldPlay,
        handlePlay,
        handlePause,
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