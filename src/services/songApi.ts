import { Song } from "@/types/song";

// API Gateway endpoint from CloudFormation stack
const API_ENDPOINT = "https://hezyeh6kgj.execute-api.us-east-1.amazonaws.com";

export const getPresignedUrl = async (bucket: string, key: string): Promise<{ url: string }> => {
  try {
    const response = await fetch(`${API_ENDPOINT}/presigned-url`, {
      method: "POST",
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ bucket, key })
    });
    if (!response.ok) {
      throw new Error("Failed to get presigned URL");
    }
    return await response.json();
  } catch (error) {
    console.error("Error getting presigned URL:", error);
    throw error;
  }
};

export const fetchSongs = async (): Promise<Song[]> => {
  try {
    console.log('songApi - Fetching songs from API');
    const response = await fetch(`${API_ENDPOINT}/songs`, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    
    if (!response.ok) {
      console.error('songApi - API response not OK:', {
        status: response.status,
        statusText: response.statusText
      });
      throw new Error(`Failed to fetch songs: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('songApi - Raw API Response:', data);
    
    let songs: Song[];
    
    // Handle different response formats
    if (Array.isArray(data)) {
      console.log('songApi - Response is an array');
      songs = data;
    } else if (data && typeof data === 'object') {
      console.log('songApi - Response is an object');
      if (Array.isArray(data.items)) {
        songs = data.items;
      } else if (Array.isArray(data.songs)) {
        songs = data.songs;
      } else {
        console.error('songApi - Unexpected response format:', data);
        throw new Error('Invalid API response format');
      }
    } else {
      console.error('songApi - Invalid response type:', typeof data);
      throw new Error('Invalid API response type');
    }

    // Validate songs
    const validSongs = songs.filter(song => {
      const isValid = song && typeof song === 'object' && 
        'song_id' in song && 
        'title' in song && 
        'artist' in song && 
        's3_uri' in song;
      
      if (!isValid) {
        console.warn('songApi - Invalid song object:', song);
      }
      return isValid;
    });

    console.log('songApi - Processed songs:', {
      total: songs.length,
      valid: validSongs.length,
      sample: validSongs[0]
    });

    return validSongs;
  } catch (error) {
    console.error("songApi - Error fetching songs:", error);
    throw error;
  }
}; 