import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchSongs } from '../services/songApi';
import { useAudio } from '../contexts/AudioContext';
import { SearchBar } from './SearchBar';
import { SongCard } from './SongCard';
import { Button } from './ui/button';
import { Loader2 } from 'lucide-react';

export const SongList: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { setSelectedSong, handlePlay } = useAudio();

  const { data, isLoading, error } = useQuery({
    queryKey: ['songs'],
    queryFn: fetchSongs
  });

  const filteredSongs = useMemo(() => {
    if (!data) return [];
    const searchLower = searchTerm.toLowerCase();
    return data.filter(song => 
      (song.artist?.toLowerCase() || '').includes(searchLower)
    );
  }, [data, searchTerm]);

  const handleSongClick = (song: any) => {
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
