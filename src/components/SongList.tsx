import { useQuery } from "@tanstack/react-query";
import { fetchSongs } from "@/services/songApi";
import { Play } from "lucide-react";
import { SearchBar } from "./SearchBar";
import { useState, useMemo } from "react";

export const SongList = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");
  const { data: songs = [], isLoading } = useQuery({
    queryKey: ["songs"],
    queryFn: fetchSongs,
  });

  const filteredSongs = useMemo(() => {
    return songs.filter((song) => {
      const matchesSearch = 
        song.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        song.artist.toLowerCase().includes(searchTerm.toLowerCase());
      
      if (filter === "all") return matchesSearch;
      
      const genres: Record<string, string[]> = {
        rock: ["Guns N' Roses"],
        pop: ["Michael Jackson"],
        classic: ["Queen", "Eagles"]
      };
      
      return matchesSearch && genres[filter]?.includes(song.artist);
    });
  }, [songs, searchTerm, filter]);

  if (isLoading) {
    return (
      <div className="text-spotify-lightgray text-center py-10">
        Loading songs...
      </div>
    );
  }

  return (
    <div className="w-full max-w-screen-xl mx-auto px-4">
      <SearchBar onSearch={setSearchTerm} onFilterChange={setFilter} />
      <div className="grid grid-cols-1 gap-1">
        {filteredSongs.map((song) => (
          <div
            key={song.id}
            className="flex items-center gap-4 p-4 rounded-lg hover:bg-white/5 transition-all cursor-pointer group"
          >
            <div className="relative w-12 h-12 bg-spotify-darkgray rounded-md overflow-hidden flex items-center justify-center group-hover:shadow-lg transition-all">
              {song.albumCover ? (
                <img
                  src={song.albumCover}
                  alt={song.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Play className="w-6 h-6 text-spotify-lightgray group-hover:text-spotify-green" />
              )}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Play className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-white font-medium text-base hover:underline">{song.title}</h3>
              <p className="text-spotify-lightgray text-sm">{song.artist}</p>
            </div>
            <div className="text-spotify-lightgray text-sm">{song.duration}</div>
          </div>
        ))}
      </div>
    </div>
  );
};
