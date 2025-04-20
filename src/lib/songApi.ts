import { Song } from "@/types/song";

// API Configuration
const API_BASE_URL = "https://9dl6yhg7r8.execute-api.us-east-1.amazonaws.com";

interface ApiError {
  error: string;
  code: string;
  details?: Record<string, any>;
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error: ApiError = await response.json();
    throw new Error(`${error.error} (Code: ${error.code})`);
  }
  return response.json();
}

export const createSong = async (song: Omit<Song, 'song_id'>): Promise<Song> => {
  const response = await fetch(`${API_BASE_URL}/songs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(song),
  });
  return handleResponse<Song>(response);
};

export const getSong = async (songId: string): Promise<Song> => {
  const response = await fetch(`${API_BASE_URL}/songs/${songId}`);
  return handleResponse<Song>(response);
};

export const listSongs = async (): Promise<Song[]> => {
  const response = await fetch(`${API_BASE_URL}/songs`, {
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  });
  return handleResponse<Song[]>(response);
};

export const updateSong = async (songId: string, song: Omit<Song, 'song_id'>): Promise<Song> => {
  const response = await fetch(`${API_BASE_URL}/songs/${songId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(song),
  });
  return handleResponse<Song>(response);
};

export const deleteSong = async (songId: string): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/songs/${songId}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    const error: ApiError = await response.json();
    throw new Error(`${error.error} (Code: ${error.code})`);
  }
};

// Helper function for concurrent updates with retry logic
export const updateSongWithRetry = async (
  songId: string,
  song: Omit<Song, 'song_id'>,
  maxRetries = 3
): Promise<Song> => {
  let retries = 0;
  
  while (retries < maxRetries) {
    try {
      return await updateSong(songId, song);
    } catch (error) {
      if (error.message.includes('409') && retries < maxRetries - 1) {
        retries++;
        await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, retries)));
        continue;
      }
      throw error;
    }
  }
  
  throw new Error('Max retries exceeded');
};
