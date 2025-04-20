import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface SearchBarProps {
  onSearch: (value: string) => void;
  onFilterChange: (value: string) => void;
}

export const SearchBar = ({ onSearch, onFilterChange }: SearchBarProps) => {
  return (
    <div className="flex gap-4 items-center mb-6">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-spotify-lightgray" />
        <Input
          placeholder="Search by title, artist, or tradition..."
          className="pl-10 bg-white/5 border-none text-white placeholder:text-spotify-lightgray"
          onChange={(e) => onSearch(e.target.value)}
        />
      </div>
    </div>
  );
};
