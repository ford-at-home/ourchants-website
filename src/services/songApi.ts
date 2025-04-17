import { Song } from "@/types/song";

// Replace this with your actual API Gateway endpoint
const API_ENDPOINT = "https://your-api-gateway-endpoint.execute-api.region.amazonaws.com/stage";

export const fetchSongs = async (): Promise<Song[]> => {
  try {
    const response = await fetch(`${API_ENDPOINT}/songs`);
    if (!response.ok) {
      throw new Error('Failed to fetch songs');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching songs:', error);
    // Return mock data as fallback for now
    return mockSongs;
  }
};

// Keep mock data for fallback
const mockSongs: Song[] = [
  {
    id: "1",
    title: "Bohemian Rhapsody",
    artist: "Queen",
    duration: "5:55",
    albumCover: "https://upload.wikimedia.org/wikipedia/en/4/4d/Queen_A_Night_at_the_Opera.png"
  },
  {
    id: "2",
    title: "Hotel California",
    artist: "Eagles",
    duration: "6:30",
    albumCover: "https://upload.wikimedia.org/wikipedia/en/4/49/Hotelcalifornia.jpg"
  },
  {
    id: "3",
    title: "Billie Jean",
    artist: "Michael Jackson",
    duration: "4:54",
    albumCover: "https://upload.wikimedia.org/wikipedia/en/5/55/Michael_Jackson_-_Thriller.png"
  },
  {
    id: "4",
    title: "Sweet Child O' Mine",
    artist: "Guns N' Roses",
    duration: "5:56",
    albumCover: "https://upload.wikimedia.org/wikipedia/en/3/3b/Appetitefordestructioncover.jpg"
  },
  {
    id: "5",
    title: "Beat It",
    artist: "Michael Jackson",
    duration: "4:18",
    albumCover: "https://upload.wikimedia.org/wikipedia/en/5/55/Michael_Jackson_-_Thriller.png"
  },
  {
    id: "6",
    title: "Paradise City",
    artist: "Guns N' Roses",
    duration: "6:46",
    albumCover: "https://upload.wikimedia.org/wikipedia/en/3/3b/Appetitefordestructioncover.jpg"
  },
  {
    id: "7",
    title: "We Will Rock You",
    artist: "Queen",
    duration: "2:02",
    albumCover: "https://upload.wikimedia.org/wikipedia/en/4/4d/Queen_A_Night_at_the_Opera.png"
  }
];
