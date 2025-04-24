import { Song } from "@/types/song";

// API Gateway endpoint from CloudFormation stack
const API_ENDPOINT = "https://hezyeh6kgj.execute-api.us-east-1.amazonaws.com";

interface PaginatedResponse<T> {
  items: T[];
  total: number;
  has_more: boolean;
}

interface FetchSongsOptions {
  artist_filter?: string;
  limit?: number;
  offset?: number;
}

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

export const fetchSongs = async (options: FetchSongsOptions = {}): Promise<PaginatedResponse<Song>> => {
  try {
    const { artist_filter, limit = 20, offset = 0 } = options;
    const queryParams = new URLSearchParams();
    
    if (artist_filter) {
      queryParams.append('artist_filter', artist_filter);
    }
    if (limit) {
      queryParams.append('limit', limit.toString());
    }
    if (offset) {
      queryParams.append('offset', offset.toString());
    }
    
    const url = `${API_ENDPOINT}/songs${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    console.log('fetchSongs - Making request to:', url);
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    
    console.log('fetchSongs - Response status:', response.status);
    console.log('fetchSongs - Response ok:', response.ok);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('fetchSongs - Error response:', errorText);
      throw new Error(`Failed to fetch songs: ${response.status} ${errorText}`);
    }
    
    const data = await response.json();
    console.log('fetchSongs - Response data:', data);
    
    return data;
  } catch (error) {
    console.error("Error fetching songs:", error);
    return {
      items: [],
      total: 0,
      has_more: false
    };
  }
}; 