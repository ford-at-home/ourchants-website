import { Song } from "@/types/song";

// API Gateway endpoint from CloudFormation stack
const API_ENDPOINT = "https://hezyeh6kgj.execute-api.us-east-1.amazonaws.com";

interface ApiError {
  error: string;
  code: string;
  details?: Record<string, any>;
}

export const getPresignedUrl = async (bucket: string, key: string): Promise<{ url: string }> => {
  try {
    const response = await fetch(`${API_ENDPOINT}/presigned-url`, {
      method: "POST",
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Origin': window.location.origin
      },
      body: JSON.stringify({ bucket, key })
    });

    if (!response.ok) {
      const errorData: ApiError = await response.json();
      throw new Error(errorData.error || "Failed to get presigned URL");
    }

    const data = await response.json();
    return { url: data.url };
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
        'Accept': 'application/json',
        'Origin': window.location.origin
      }
    });

    if (!response.ok) {
      const errorData: ApiError = await response.json();
      throw new Error(errorData.error || "Failed to fetch songs");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching songs:", error);
    throw error;
  }
}; 