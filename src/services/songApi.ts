import { Song } from "@/types/song";

// API Gateway endpoint from CloudFormation stack
const API_ENDPOINT = "https://hezyeh6kgj.execute-api.us-east-1.amazonaws.com";

interface SongsResponse {
  items: Song[];
  total: number;
  has_more: boolean;
}

interface FetchSongsParams {
  limit?: number;
  offset?: number;
  artist_filter?: string;
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

export const fetchSongs = async (params?: FetchSongsParams): Promise<SongsResponse> => {
  try {
    const queryParams = new URLSearchParams();
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.offset) queryParams.append('offset', params.offset.toString());
    if (params?.artist_filter) queryParams.append('artist_filter', params.artist_filter);

    const url = `${API_ENDPOINT}/songs${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    console.log('Fetching songs from:', url);

    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    if (!response.ok) {
      throw new Error("Failed to fetch songs");
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching songs:", error);
    throw error;
  }
}; 