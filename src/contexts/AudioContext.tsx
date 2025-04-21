import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { Song } from '@/types/song';
import { AudioPlayer } from '@/components/AudioPlayer';

interface AudioContextType {
  selectedSong: Song | null;
  setSelectedSong: (song: Song | null) => void;
  shouldPlay: boolean;
  setShouldPlay: (shouldPlay: boolean) => void;
  handlePlay: () => void;
  handlePause: () => void;
  resumeFromTimestamp: (timestamp: number) => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export const AudioProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [shouldPlay, setShouldPlay] = useState(false);
  const [resumeTimestamp, setResumeTimestamp] = useState<number | null>(null);

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

  return (
    <AudioContext.Provider value={{ 
      selectedSong, 
      setSelectedSong, 
      shouldPlay, 
      setShouldPlay,
      handlePlay,
      handlePause,
      resumeFromTimestamp
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
        initialTimestamp={resumeTimestamp}
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