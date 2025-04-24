import { Song } from "@/types/song";

// API Gateway endpoint from CloudFormation stack
const API_ENDPOINT = "https://hezyeh6kgj.execute-api.us-east-1.amazonaws.com";

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
    return handleResponse<{ url: string }>(response);
  } catch (error) {
    console.error("Error getting presigned URL:", error);
    throw error;
  }
};

export const fetchSongs = async (): Promise<Song[]> => {
  try {
    const response = await fetch(`${API_ENDPOINT}/songs`, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    return handleResponse<Song[]>(response);
  } catch (error) {
    console.error("Error fetching songs:", error);
    throw error;
  }
}; 