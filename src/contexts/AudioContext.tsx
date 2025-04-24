import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
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

  const { data: songs = [] } = useQuery<Song[]>({
    queryKey: ['songs'],
    queryFn: fetchSongs,
  });

  const handlePlay = useCallback(() => {
    setShouldPlay(true);
  }, []);

  const handlePause = useCallback(() => {
    setShouldPlay(false);
  }, []);

  const resumeFromTimestamp = useCallback((timestamp: number) => {
    setResumeTimestamp(timestamp);
    setShouldPlay(true);
  }, []);

  const handleSkipNext = useCallback(() => {
    if (!selectedSong || !Array.isArray(songs) || songs.length === 0) return;
    
    const currentIndex = songs.findIndex(song => song.song_id === selectedSong.song_id);
    if (currentIndex === -1) return;
    
    const nextIndex = (currentIndex + 1) % songs.length;
    const nextSong = songs[nextIndex];
    
    setSelectedSong(nextSong);
    setShouldPlay(true);
  }, [selectedSong, songs]);

  const handleSkipPrevious = useCallback(() => {
    if (!selectedSong || !Array.isArray(songs) || songs.length === 0) return;
    
    const currentIndex = songs.findIndex(song => song.song_id === selectedSong.song_id);
    if (currentIndex === -1) return;
    
    const prevIndex = (currentIndex - 1 + songs.length) % songs.length;
    const prevSong = songs[prevIndex];
    
    setSelectedSong(prevSong);
    setShouldPlay(true);
  }, [selectedSong, songs]);

  return (
    <AudioContext.Provider value={{ 
      selectedSong, 
      setSelectedSong, 
      shouldPlay, 
      setShouldPlay,
      handlePlay,
      handlePause,
      resumeFromTimestamp,
      handleSkipNext,
      handleSkipPrevious
    }}>
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