import { Song } from "@/types/song";

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

export const fetchSongs = async (): Promise<Song[]> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));
  return mockSongs;
};
