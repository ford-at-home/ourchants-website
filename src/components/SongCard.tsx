import React from 'react';
import { Play } from 'lucide-react';
import { Button } from './ui/button';
import { ShareIcon } from './ShareIcon';

interface SongCardProps {
  songId: string;
  title: string;
  artist: string;
  onClick: () => void;
}

export const SongCard: React.FC<SongCardProps> = ({ songId, title, artist, onClick }) => {
  return (
    <div
      id={songId}
      className="group relative bg-card rounded-lg p-4 hover:bg-accent transition-colors cursor-pointer"
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onClick();
        }
      }}
    >
      <div className="flex items-center gap-4">
        <div className="relative w-12 h-12 bg-secondary rounded-md overflow-hidden flex items-center justify-center group-hover:shadow-lg transition-all">
          <Play className="w-6 h-6 text-muted-foreground group-hover:text-primary" />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <Play className="w-6 h-6 text-foreground" />
          </div>
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h3 className="text-foreground font-medium text-base hover:underline">{title}</h3>
            <ShareIcon songId={songId} />
          </div>
          <p className="text-muted-foreground text-sm">{artist}</p>
        </div>
      </div>
    </div>
  );
}; 