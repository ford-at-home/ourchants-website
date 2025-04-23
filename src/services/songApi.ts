import { Song } from "@/types/song";

// API Gateway endpoint from CloudFormation stack
const API_ENDPOINT = "https://hezyeh6kgj.execute-api.us-east-1.amazonaws.com";

export const fetchSongs = async (): Promise<Song[]> => {
  try {
    const response = await fetch(`${API_ENDPOINT}/songs`, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    if (!response.ok) {
      throw new Error('Failed to fetch songs');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching songs:', error);
    throw error;
  }
};

interface GetPresignedUrlResponse {
  url: string;
  expiresIn: number;
}

export const getPresignedUrl = async (bucket: string, key: string): Promise<GetPresignedUrlResponse> => {
  try {
    const response = await fetch(`${API_ENDPOINT}/presigned-url`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ bucket, key })
    });
    if (!response.ok) {
      throw new Error('Failed to get presigned URL');
    }
    return await response.json();
  } catch (error) {
    console.error('Error getting presigned URL:', error);
    throw error;
  }
};
