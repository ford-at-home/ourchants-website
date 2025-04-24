import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchSongs } from '../services/songApi';
import { useAudio } from '../contexts/AudioContext';

export const SongDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, error } = useQuery({
    queryKey: ['songs', id],
    queryFn: () => fetchSongs({
      limit: 100 // Fetch more songs to ensure we find the one we're looking for
    }),
  });
  const { setSelectedSong } = useAudio();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error loading song details</div>;
  }

  const song = data?.items?.find(s => s.song_id === id);

  if (!song) {
    return <div>Song not found</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">{song.title}</h1>
      <p className="mb-4">{song.description}</p>
      <button
        onClick={() => setSelectedSong(song)}
        className="bg-spotify-green text-white px-4 py-2 rounded-full hover:bg-spotify-green-dark"
      >
        Play Song
      </button>
    </div>
  );
}; 