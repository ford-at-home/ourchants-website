import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchSongs } from '../services/songApi';
import { useAudio } from '../contexts/AudioContext';
import { SearchBar } from './SearchBar';
import { SongCard } from './SongCard';
import { Button } from './ui/button';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { getSongFromUrl } from '../utils/urlParams';

export const SongList: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { data, isLoading, error } = useQuery({
    queryKey: ['songs'],
    queryFn: async () => {
      console.log('SongList - Using global songs query');
      const songs = await fetchSongs();
      console.log('SongList - Songs loaded:', { count: songs?.length });
      return songs;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnMount: true,
    retry: 3
  });

  const { setSelectedSong, handlePlay } = useAudio();
  const [currentHash, setCurrentHash] = useState(window.location.hash.replace('#', ''));

  // Handle URL parameters and hash changes
  useEffect(() => {
    const handleUrlNavigation = async () => {
      console.log('SongList - Handling URL navigation:', {
        data: data?.length,
        sharedSong: getSongFromUrl(),
        currentHash,
        isLoading
      });

      if (isLoading) {
        console.log('SongList - Still loading songs...');
        return;
      }

      if (!data || data.length === 0) {
        console.error('SongList - No songs available');
        toast.error('Failed to load songs');
        return;
      }

      // Check for shared song in URL parameters
      const sharedSong = getSongFromUrl();
      if (sharedSong) {
        console.log('SongList - Found shared song in URL:', sharedSong);
        const targetSong = data.find(s => s.song_id === sharedSong.songId);
        console.log('SongList - Target song found:', targetSong);
        
        if (targetSong) {
          console.log('SongList - Setting and playing shared song');
          setSelectedSong(targetSong);
          try {
            await handlePlay();
            const el = document.getElementById(sharedSong.songId);
            if (el) {
              el.scrollIntoView({ behavior: 'smooth', block: 'center' });
              el.classList.add('highlight-song');
              setTimeout(() => {
                el.classList.remove('highlight-song');
              }, 2000);
            }
          } catch (error) {
            console.error('SongList - Error playing shared song:', error);
            toast.error('Click to play the song');
          }
          return;
        } else {
          console.log('SongList - Shared song not found in data');
          toast.error('Shared song not found');
        }
      }

      // If no shared song or not found, check for hash navigation
      if (currentHash) {
        console.log('SongList - Checking hash navigation:', currentHash);
        const targetSong = data.find(s => s.song_id === currentHash);
        if (targetSong) {
          console.log('SongList - Setting and playing hash song');
          setSelectedSong(targetSong);
          try {
            await handlePlay();
            const el = document.getElementById(currentHash);
            if (el) {
              el.scrollIntoView({ behavior: 'smooth', block: 'center' });
              el.classList.add('highlight-song');
              setTimeout(() => {
                el.classList.remove('highlight-song');
              }, 2000);
            }
          } catch (error) {
            console.error('SongList - Error playing hash song:', error);
            toast.error('Click to play the song');
          }
        } else {
          console.log('SongList - Hash song not found');
          toast.error('Song not found');
        }
      }
    };

    handleUrlNavigation();
  }, [data, currentHash, setSelectedSong, handlePlay, isLoading]);

  // Listen for hash changes
  useEffect(() => {
    const handleHashChange = () => {
      setCurrentHash(window.location.hash.replace('#', ''));
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleSongClick = async (song: any) => {
    console.log('SongList - Song clicked:', song);
    setSelectedSong(song);
    try {
      await handlePlay();
    } catch (error) {
      console.error('SongList - Error playing clicked song:', error);
      toast.error('Failed to play song');
    }
  };

  if (isLoading) {
    console.log('SongList - Loading state');
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin" />
        <span className="ml-2">Loading songs...</span>
      </div>
    );
  }

  if (error) {
    console.error('SongList - Error state:', error);
    return (
      <div className="flex items-center justify-center min-h-[200px] text-destructive">
        Error loading songs
      </div>
    );
  }

  const filteredSongs = data?.filter(song => 
    song.artist?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  console.log('SongList - Rendering with songs:', {
    total: data?.length,
    filtered: filteredSongs.length,
    searchTerm
  });

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
