import React, { useEffect, useState } from 'react';
import { useAudio } from '../contexts/AudioContext';
import { SearchBar } from './SearchBar';
import { SongCard } from './SongCard';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { getSongFromUrl } from '../utils/urlParams';
import { useLocation, useNavigate } from 'react-router-dom';

export const SongList: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isProcessingSharedSong, setIsProcessingSharedSong] = useState(false);
  const { setSelectedSong, handlePlay, songs, isLoading } = useAudio();
  const [currentHash, setCurrentHash] = useState(window.location.hash.replace('#', ''));
  const location = useLocation();
  const navigate = useNavigate();

  // Automatically navigate to root path on mount if not already there
  useEffect(() => {
    if (location.pathname !== '/') {
      navigate('/');
    }
  }, [location.pathname, navigate]);

  // Handle URL parameters and hash changes
  useEffect(() => {
    const handleUrlNavigation = async () => {
      if (isLoading || !songs || songs.length === 0) return;

      setIsProcessingSharedSong(true);
      console.log('SongList - Handling URL navigation:', {
        data: songs?.length,
        sharedSong: getSongFromUrl(),
        currentHash,
        isLoading
      });

      try {
        // Check for shared song in URL parameters
        const sharedSong = getSongFromUrl();
        if (sharedSong) {
          console.log('SongList - Found shared song in URL:', sharedSong);
          const targetSong = songs.find(s => s.song_id === sharedSong.songId);
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
          } else {
            console.log('SongList - Shared song not found in data');
            toast.error('Song not found');
          }
        }

        // If no shared song or not found, check for hash navigation
        else if (currentHash) {
          console.log('SongList - Checking hash navigation:', currentHash);
          const targetSong = songs.find(s => s.song_id === currentHash);
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
      } finally {
        setIsProcessingSharedSong(false);
      }
    };

    handleUrlNavigation();
  }, [songs, currentHash, setSelectedSong, handlePlay, isLoading]);

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

  // Prepare songs list regardless of shared song processing
  const filteredSongs = songs?.filter(song => 
    song.artist?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  console.log('SongList - Rendering with songs:', {
    total: songs?.length,
    filtered: filteredSongs.length,
    searchTerm,
    isProcessingSharedSong
  });

  // Always render the song list, even while processing shared song
  return (
    <div className="space-y-4">
      <SearchBar
        value={searchTerm}
        onChange={setSearchTerm}
        placeholder="Search by artist..."
      />
      {isLoading ? (
        <div className="flex items-center justify-center min-h-[200px]">
          <Loader2 className="w-8 h-8 animate-spin" />
          <span className="ml-2">Loading songs...</span>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredSongs.length > 0 ? (
            filteredSongs.map((song: any) => (
              <SongCard
                key={song.song_id}
                songId={song.song_id}
                title={song.title}
                artist={song.artist}
                onClick={() => handleSongClick(song)}
              />
            ))
          ) : (
            <div className="text-center text-muted-foreground">
              No songs found matching your search.
            </div>
          )}
        </div>
      )}
    </div>
  );
};
