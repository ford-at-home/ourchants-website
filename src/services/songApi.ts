import { Song } from "@/types/song";

// API Gateway endpoint from CloudFormation stack
const API_ENDPOINT = "https://cg8hlck643.execute-api.us-east-1.amazonaws.com/prod/";

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
