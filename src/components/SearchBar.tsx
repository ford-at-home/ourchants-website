
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter } from "lucide-react";

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
          placeholder="Search songs or artists..."
          className="pl-10 bg-white/5 border-none text-white placeholder:text-spotify-lightgray"
          onChange={(e) => onSearch(e.target.value)}
        />
      </div>
      <Select onValueChange={onFilterChange} defaultValue="all">
        <SelectTrigger className="w-[140px] bg-white/5 border-none text-white">
          <Filter className="h-4 w-4 mr-2" />
          <SelectValue placeholder="Filter by" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Songs</SelectItem>
          <SelectItem value="rock">Rock</SelectItem>
          <SelectItem value="pop">Pop</SelectItem>
          <SelectItem value="classic">Classic Rock</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};
