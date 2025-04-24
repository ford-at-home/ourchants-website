import React, { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useVirtualizer } from '@tanstack/react-virtual';
import { Play } from 'lucide-react';
import { useAudio } from '../contexts/AudioContext';
import { SearchBar } from './SearchBar';
import { fetchSongs } from '../services/songApi';
import { Song } from '../types/song';

const PAGE_SIZE = 20;

export const SongList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const { setSelectedSong, selectedSong, handlePlay } = useAudio();
  
  const { data, status, error, isLoading } = useQuery({
    queryKey: ['songs', page, searchTerm],
    queryFn: () => fetchSongs({
      artist_filter: searchTerm,
      limit: PAGE_SIZE,
      offset: (page - 1) * PAGE_SIZE
    }),
    retry: 1,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const songs = data?.items || [];
  const total = data?.total || 0;
  const hasMore = data?.has_more || false;

  // Virtualization setup
  const parentRef = React.useRef<HTMLDivElement>(null);
  const rowVirtualizer = useVirtualizer({
    count: songs.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 80,
    overscan: 5,
  });

  const handleSongClick = useCallback((song: Song) => {
    if (!song || !song.song_id) return;
    setSelectedSong(song);
    // Start playback immediately when a song is selected
    handlePlay();
  }, [setSelectedSong, handlePlay]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="text-muted-foreground text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading songs...</p>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="text-destructive text-center py-10">
        <p>Error loading songs. Please check your connection and try again.</p>
        <button 
          onClick={() => window.location.reload()}
          className="spotify-button mt-4"
        >
          Retry
        </button>
      </div>
    );
  }

  if (songs.length === 0) {
    return (
      <div className="text-muted-foreground text-center py-10">
        {searchTerm ? 'No songs found matching your search.' : 'No songs available.'}
      </div>
    );
  }

  return (
    <div className="w-full max-w-screen-xl mx-auto px-4 pb-24">
      <SearchBar onSearch={setSearchTerm} onFilterChange={() => {}} />
      
      <div
        ref={parentRef}
        className="h-[600px] overflow-auto"
      >
        <div
          style={{
            height: `${rowVirtualizer.getTotalSize()}px`,
            width: '100%',
            position: 'relative',
          }}
        >
          {rowVirtualizer.getVirtualItems().map((virtualRow) => {
            const song = songs[virtualRow.index];
            if (!song || !song.song_id) return null;

            return (
              <div
                key={song.song_id}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: `${virtualRow.size}px`,
                  transform: `translateY(${virtualRow.start}px)`,
                }}
              >
                <div
                  className={`spotify-card flex items-center gap-4 ${
                    selectedSong?.song_id === song.song_id ? 'bg-secondary/80' : ''
                  }`}
                  onClick={() => handleSongClick(song)}
                >
                  <div className="relative w-12 h-12 bg-secondary rounded-md overflow-hidden flex items-center justify-center group-hover:shadow-lg transition-all">
                    <Play className="w-6 h-6 text-muted-foreground group-hover:text-primary" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Play className="w-6 h-6 text-foreground" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-foreground font-medium text-base hover:underline">{song.title}</h3>
                    <p className="text-muted-foreground text-sm">{song.artist}</p>
                    {song.album && (
                      <p className="text-muted-foreground text-xs">{song.album}</p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Pagination Controls */}
      <div className="flex justify-center items-center gap-4 mt-4">
        <button
          onClick={() => handlePageChange(page - 1)}
          disabled={page === 1}
          className="spotify-button"
        >
          Previous
        </button>
        <span className="text-muted-foreground">
          Page {page} of {Math.ceil(total / PAGE_SIZE)}
        </span>
        <button
          onClick={() => handlePageChange(page + 1)}
          disabled={!hasMore}
          className="spotify-button"
        >
          Next
        </button>
      </div>
    </div>
  );
};
