import React, { useState, useMemo, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchSongs } from '../services/songApi';
import { useAudio } from '../contexts/AudioContext';
import { SearchBar } from './SearchBar';
import { SongCard } from './SongCard';
import { Button } from './ui/button';
import { Loader2 } from 'lucide-react';
import { useToast } from './ui/use-toast';
import { Song } from '../types/song';

export const SongList: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { setSelectedSong, handlePlay } = useAudio();
  const { toast } = useToast();

  const { data, isLoading, error } = useQuery({
    queryKey: ['songs'],
    queryFn: fetchSongs
  });

  // Handle hash-based navigation and autoplay
  useEffect(() => {
    if (!data || isLoading) return;

    const hash = window.location.hash.replace('#', '');
    if (!hash) return;

    const targetSong = data.find(s => s.song_id === hash);
    if (targetSong) {
      // Scroll to the song
      const el = document.getElementById(hash);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
        // Add highlight effect
        el.classList.add('highlight-song');
        setTimeout(() => el.classList.remove('highlight-song'), 2000);
      }

      // Attempt autoplay
      try {
        setSelectedSong(targetSong);
        handlePlay();
      } catch (error) {
        console.error('Autoplay failed:', error);
        toast({
          title: "Tap to play",
          description: "Browser blocked autoplay. Click the song to start playing.",
          duration: 3000,
        });
      }
    } else {
      toast({
        title: "Song not found",
        description: "The shared song is no longer available.",
        variant: "destructive",
        duration: 3000,
      });
    }
  }, [data, isLoading, setSelectedSong, handlePlay, toast]);

  const filteredSongs = useMemo(() => {
    if (!data) return [];
    const searchLower = searchTerm.toLowerCase();
    return data.filter(song => 
      (song.artist?.toLowerCase() || '').includes(searchLower)
    );
  }, [data, searchTerm]);

  const handleSongClick = (song: Song) => {
    setSelectedSong(song);
    handlePlay();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="text-muted-foreground text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading songs...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="text-muted-foreground text-center">
          <p>Error loading songs. Please try again later.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <SearchBar
        value={searchTerm}
        onChange={setSearchTerm}
        placeholder="Search by artist..."
      />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSongs.map((song) => (
          <SongCard
            key={song.song_id}
            songId={song.song_id}
            title={song.title}
            artist={song.artist}
            onClick={() => handleSongClick(song)}
          />
        ))}
      </div>
      {filteredSongs.length === 0 && (
        <div className="text-center text-muted-foreground">
          <p>No songs found matching your search.</p>
        </div>
      )}
    </div>
  );
};
