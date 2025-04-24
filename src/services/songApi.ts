import { Song } from "@/types/song";

// API Gateway endpoint from CloudFormation stack
const API_ENDPOINT = "https://hezyeh6kgj.execute-api.us-east-1.amazonaws.com";

interface ApiError {
  error: string;
  code: string;
  details?: string;
}

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

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error: ApiError = await response.json();
    throw new Error(`${error.error}${error.details ? `: ${error.details}` : ''} (Code: ${error.code})`);
  }
  return response.json();
}

export const getPresignedUrl = async (bucket: string, key: string): Promise<{ url: string; expiresIn: number }> => {
  try {
    const response = await fetch(`${API_ENDPOINT}/presigned-url`, {
      method: "POST",
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ bucket, key })
    });
    return handleResponse<{ url: string; expiresIn: number }>(response);
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
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    
    return handleResponse<PaginatedResponse<Song>>(response);
  } catch (error) {
    console.error("Error fetching songs:", error);
    return {
      items: [],
      total: 0,
      has_more: false
    };
  }
}; 