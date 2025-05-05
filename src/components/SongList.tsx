import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchSongs } from '../services/songApi';
import { useAudio } from '../contexts/AudioContext';
import { SearchBar } from './SearchBar';
import { SongCard } from './SongCard';
import { Button } from './ui/button';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export const SongList: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { data, isLoading, error } = useQuery({
    queryKey: ['songs'],
    queryFn: fetchSongs,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    refetchOnMount: true,
    retry: 3,
  });

  const { setSelectedSong, handlePlay } = useAudio();
  const [currentHash, setCurrentHash] = useState(window.location.hash.replace('#', ''));

  // Listen for hash changes
  useEffect(() => {
    const handleHashChange = () => {
      setCurrentHash(window.location.hash.replace('#', ''));
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Handle hash-based navigation
  useEffect(() => {
    const handleHashNavigation = async () => {
      if (!currentHash || !data) return;

      const targetSong = data.find(s => s.song_id === currentHash);
      if (!targetSong) {
        toast.error('Song not found');
        return;
      }

      setSelectedSong(targetSong);
      
      try {
        await handlePlay();
        const el = document.getElementById(currentHash);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          el.classList.add('highlight-song');
          const timer = setTimeout(() => {
            el.classList.remove('highlight-song');
          }, 2000);
          return () => clearTimeout(timer);
        }
      } catch (error) {
        toast.error('Click to play the song');
      }
    };

    handleHashNavigation();
  }, [currentHash, data, setSelectedSong, handlePlay]);

  const handleSongClick = async (song: any) => {
    setSelectedSong(song);
    try {
      await handlePlay();
    } catch (error) {
      toast.error('Failed to play song');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin" />
        <span className="ml-2">Loading songs...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[200px] text-destructive">
        Error loading songs
      </div>
    );
  }

  const filteredSongs = data?.filter(song => 
    song.artist?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <div className="space-y-4">
      <SearchBar
        value={searchTerm}
        onChange={setSearchTerm}
        placeholder="Search by artist..."
      />
      <div className="grid gap-4">
        {filteredSongs.map((song: any) => (
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
          No songs found matching your search.
        </div>
      )}
    </div>
  );
};
