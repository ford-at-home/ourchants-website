
import { useQuery } from "@tanstack/react-query";
import { fetchSongs } from "@/services/songApi";
import { Play } from "lucide-react";

export const SongList = () => {
  const { data: songs = [], isLoading } = useQuery({
    queryKey: ["songs"],
    queryFn: fetchSongs,
  });

  if (isLoading) {
    return (
      <div className="text-white text-center py-10">
        Loading songs...
      </div>
    );
  }

  return (
    <div className="w-full max-w-screen-xl mx-auto px-4">
      <div className="grid grid-cols-1 gap-2">
        {songs.map((song) => (
          <div
            key={song.id}
            className="flex items-center gap-4 p-4 rounded-md hover:bg-spotify-darkgray transition-colors group"
          >
            <div className="relative w-12 h-12 bg-spotify-darkgray rounded flex items-center justify-center group-hover:bg-spotify-green/10">
              {song.albumCover ? (
                <img
                  src={song.albumCover}
                  alt={song.title}
                  className="w-full h-full rounded object-cover"
                />
              ) : (
                <Play className="w-6 h-6 text-spotify-lightgray group-hover:text-spotify-green" />
              )}
            </div>
            <div className="flex-1">
              <h3 className="text-white font-medium">{song.title}</h3>
              <p className="text-spotify-lightgray text-sm">{song.artist}</p>
            </div>
            <div className="text-spotify-lightgray text-sm">{song.duration}</div>
          </div>
        ))}
      </div>
    </div>
  );
};
