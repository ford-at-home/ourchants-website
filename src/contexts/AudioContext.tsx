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
  setShouldPlay: (shouldPlay: boolean) => void;
  handlePlay: () => void;
  handlePause: () => void;
  resumeFromTimestamp: (timestamp: number) => void;
  handleSkipNext: () => void;
  handleSkipPrevious: () => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

const isValidS3Uri = (uri: string): boolean => {
  if (!uri || typeof uri !== 'string') return false;
  if (!uri.startsWith('s3://')) return false;
  
  const path = uri.slice(5);
  const [bucket, ...keyParts] = path.split('/');
  
  if (!bucket || bucket.trim() === '') return false;
  
  const key = keyParts.join('/');
  if (!key || key.trim() === '') return false;
  
  const validExtensions = ['.mp3', '.wav', '.m4a', '.ogg'];
  return validExtensions.some(ext => key.toLowerCase().endsWith(ext));
};

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

  const { data, isLoading } = useQuery<Song[]>({
    queryKey: ['songs', currentPage],
    queryFn: () => {
      console.log('AudioContext - Fetching songs with params:', {
        currentPage,
        limit: 20,
        offset: (currentPage - 1) * 20
      });
      return fetchSongs();
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Add debug logging for data changes
  useEffect(() => {
    console.log('AudioContext - Data state changed:', {
      data,
      isLoading,
      dataType: data ? typeof data : 'undefined',
      itemsType: data ? typeof data : 'undefined',
      isArray: Array.isArray(data),
      itemsLength: data?.length,
      selectedSong,
      rawData: data
    });
  }, [data, isLoading, selectedSong]);

  // Ensure songs is always an array
  const songs = data || [];
  console.log('AudioContext - Processed songs array:', {
    songsLength: songs.length,
    isArray: Array.isArray(songs),
    firstSong: songs[0]
  });

  const handlePlay = useCallback(() => {
    console.log('AudioContext - handlePlay called', {
      selectedSong,
      shouldPlay,
      currentPage,
      songsLength: songs.length
    });
    setShouldPlay(true);
  }, [selectedSong, shouldPlay, currentPage, songs.length]);

  const handlePause = useCallback(() => {
    console.log('AudioContext - handlePause called', {
      selectedSong,
      shouldPlay,
      currentPage,
      songsLength: songs.length
    });
    setShouldPlay(false);
  }, [selectedSong, shouldPlay, currentPage, songs.length]);

  const resumeFromTimestamp = useCallback((timestamp: number) => {
    console.log('AudioContext - resumeFromTimestamp called:', {
      timestamp,
      selectedSong,
      shouldPlay,
      currentPage,
      songsLength: songs.length
    });
    setResumeTimestamp(timestamp);
    setShouldPlay(true);
  }, [selectedSong, shouldPlay, currentPage, songs.length]);

  const handleSkipNext = useCallback(() => {
    console.log('AudioContext - handleSkipNext called:', {
      isLoading,
      selectedSong,
      songsLength: songs.length,
      songs: songs,
      shouldPlay,
      currentPage
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
    
    // If we're not at the end of the current page, play the next song
    if (currentIndex < songs.length - 1) {
      const nextIndex = currentIndex + 1;
      const nextSong = songs[nextIndex];
      console.log('AudioContext - Next song:', nextSong);
      setSelectedSong(nextSong);
      setShouldPlay(true);
    }
  }, [selectedSong, songs, isLoading, shouldPlay, currentPage]);

  const handleSkipPrevious = useCallback(() => {
    console.log('AudioContext - handleSkipPrevious called:', {
      isLoading,
      selectedSong,
      songsLength: songs.length,
      currentPage,
      shouldPlay
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
  }, [selectedSong, songs, isLoading, currentPage, shouldPlay]);

  const handleSetSelectedSong = useCallback((song: Song | null) => {
    console.log('AudioContext - Setting selected song:', {
      song,
      s3Uri: song?.s3_uri,
      filename: song?.filename,
      filepath: song?.filepath,
      rawSong: JSON.stringify(song, null, 2)
    });

    if (song && !isValidS3Uri(song.s3_uri)) {
      console.error('Invalid S3 URI for song:', {
        song,
        s3Uri: song.s3_uri,
        isValid: isValidS3Uri(song.s3_uri),
        filename: song.filename,
        filepath: song.filepath
      });
      return;
    }

    // Ensure the song data is properly structured
    if (song) {
      const processedSong = {
        ...song,
        s3_uri: song.s3_uri || `s3://ourchants-songs/${song.filename || ''}`,
        filename: song.filename || song.s3_uri?.split('/').pop() || '',
        filepath: song.filepath || song.s3_uri || ''
      };

      console.log('AudioContext - Processed song data:', {
        original: song,
        processed: processedSong,
        s3Uri: processedSong.s3_uri,
        filename: processedSong.filename,
        filepath: processedSong.filepath
      });

      setSelectedSong(processedSong);
    } else {
      setSelectedSong(null);
    }
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