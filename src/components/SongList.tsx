import React from 'react';
import { useQuery } from "@tanstack/react-query";
import { fetchSongs } from "@/services/songApi";
import { Play } from "lucide-react";
import { SearchBar } from "./SearchBar";
import { useState, useMemo } from "react";
import { logApiError } from "@/utils/apiLogger";
import { Song } from "@/types/song";
import { useAudio } from "@/contexts/AudioContext";

export const SongList = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const { selectedSong, setSelectedSong, setShouldPlay } = useAudio();
  
  const { 
    data: songs = [], 
    isLoading, 
    error: fetchError 
  } = useQuery({
    queryKey: ["songs"],
    queryFn: async () => {
      try {
        const data = await fetchSongs();
        return data;
      } catch (error) {
        logApiError('GET', '/songs', error);
        throw error;
      }
    },
    retry: 1
  });

  const filteredSongs = useMemo(() => {
    const normalizedSearchTerm = (searchTerm || '').toLowerCase();
    return songs.filter((song) => {
      return (
        (song.title?.toLowerCase() || '').includes(normalizedSearchTerm) ||
        (song.artist?.toLowerCase() || '').includes(normalizedSearchTerm) ||
        (song.description?.toLowerCase() || '').includes(normalizedSearchTerm)
      );
    });
  }, [songs, searchTerm]);

  const handleSongClick = (song: Song) => {
    console.log('Selected song:', {
      ...song,
      s3_uri: song.s3_uri,
      filename: song.filename,
      filepath: song.filepath
    });
    setSelectedSong(song);
    setShouldPlay(true);
  };

  if (isLoading) {
    return (
      <div className="text-spotify-lightgray text-center py-10">
        Loading songs...
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="text-red-500 text-center py-10">
        <p>Error loading songs. Please try again later.</p>
        <p className="text-sm text-spotify-lightgray mt-2">
          {fetchError instanceof Error ? fetchError.message : 'Unknown error occurred'}
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-screen-xl mx-auto px-4 pb-24">
      <SearchBar onSearch={setSearchTerm} onFilterChange={() => {}} />
      <div className="grid grid-cols-1 gap-1">
        {filteredSongs.map((song) => (
          <div
            key={song.song_id}
            className={`flex items-center gap-4 p-4 rounded-lg hover:bg-white/5 transition-all cursor-pointer group ${
              selectedSong?.song_id === song.song_id ? 'bg-white/10' : ''
            }`}
            onClick={() => handleSongClick(song)}
          >
            <div className="relative w-12 h-12 bg-spotify-darkgray rounded-md overflow-hidden flex items-center justify-center group-hover:shadow-lg transition-all">
              <Play className="w-6 h-6 text-spotify-lightgray group-hover:text-spotify-green" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Play className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-white font-medium text-base hover:underline">{song.title}</h3>
              <p className="text-spotify-lightgray text-sm">{song.artist}</p>
              {song.album && (
                <p className="text-spotify-lightgray text-xs">{song.album}</p>
              )}
            </div>
            {song.bpm && (
              <div className="text-spotify-lightgray text-sm">{song.bpm} BPM</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
