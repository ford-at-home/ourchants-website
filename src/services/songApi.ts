
import { Song } from "@/types/song";

export const fetchSongs = async (): Promise<Song[]> => {
  try {
    const response = await fetch('YOUR_AWS_APIGATEWAY_ENDPOINT');
    return await response.json();
  } catch (error) {
    console.error('Error fetching songs:', error);
    return [];
  }
};
