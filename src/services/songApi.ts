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

interface FetchSongsParams {
  artist_filter?: string;
  limit?: number;
  offset?: number;
}

export const fetchSongs = async (params?: FetchSongsParams): Promise<{ items: Song[]; total: number; has_more: boolean }> => {
  try {
    const queryParams = new URLSearchParams();
    if (params?.artist_filter) queryParams.append('artist_filter', params.artist_filter);
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.offset) queryParams.append('offset', params.offset.toString());

    const url = `${API_ENDPOINT}/songs${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
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