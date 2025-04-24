import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchSongs } from '../services/songApi';
import { useAudio } from '../contexts/AudioContext';
import { Song } from '../types/song';

export const SongDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  console.log('SongDetails rendered with id:', id);
  
  const { data, isLoading, error } = useQuery({
    queryKey: ['songs', id],
    queryFn: fetchSongs
  });
  const { setSelectedSong } = useAudio();

  // Add detailed logging
  useEffect(() => {
    console.log('SongDetails - Data state:', {
      id,
      isLoading,
      error,
      dataType: data ? typeof data : 'undefined',
      itemsType: data?.items ? typeof data.items : 'undefined',
      isArray: Array.isArray(data?.items),
      itemsLength: data?.items?.length,
      rawData: data
    });
  }, [id, isLoading, error, data]);

  if (isLoading) {
    console.log('SongDetails - Loading state');
    return <div>Loading...</div>;
  }

  if (error) {
    console.error('SongDetails - Error:', error);
    return <div>Error loading song details</div>;
  }

  // Ensure data.items is an array before using find
  const items = Array.isArray(data?.items) ? data.items : [];
  console.log('SongDetails - Items array:', items);
  
  const song = items.find(s => s.song_id === id);
  console.log('SongDetails - Found song:', song);

  if (!song) {
    console.log('SongDetails - Song not found:', { id, itemsLength: items.length });
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