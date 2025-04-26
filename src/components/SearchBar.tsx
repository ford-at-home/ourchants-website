import React from 'react';
import { Input } from "./ui/input";
import { Search } from "lucide-react";

interface SearchBarProps {
  onSearch: (value: string) => void;
  onFilterChange: (value: string) => void;
  value: string;
}

export const SearchBar = ({ onSearch, onFilterChange, value }: SearchBarProps) => {
  return (
    <div className="flex gap-4 items-center mb-6 mt-8">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by title, artist, or tradition..."
          className="spotify-input pl-10"
          value={value}
          onChange={(e) => onSearch(e.target.value)}
        />
      </div>
    </div>
  );
};
