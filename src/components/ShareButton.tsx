import React from 'react';
import { Share2 } from 'lucide-react';
import { Button } from './ui/button';
import { toast } from 'sonner';

interface ShareButtonProps {
  songId: string;
  className?: string;
}

export const ShareButton: React.FC<ShareButtonProps> = ({ songId, className }) => {
  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering parent click handlers
    
    const url = `${window.location.origin}/songs#${songId}`;
    
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Link copied to clipboard!');
    } catch (error) {
      toast.error('Failed to copy link');
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      className={className}
      onClick={handleShare}
      aria-label="share song"
    >
      <Share2 className="h-4 w-4" />
    </Button>
  );
}; 