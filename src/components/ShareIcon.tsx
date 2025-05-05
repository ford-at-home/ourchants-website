import React from 'react';
import { Share2 } from 'lucide-react';
import { Button } from './ui/button';
import { useToast } from './ui/use-toast';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './ui/tooltip';

interface ShareIconProps {
  songId: string;
  onClick?: (e: React.MouseEvent) => void;
}

export const ShareIcon: React.FC<ShareIconProps> = ({ songId, onClick }) => {
  const { toast } = useToast();

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the song card click
    if (onClick) onClick(e);

    const url = `${window.location.origin}/songs#${songId}`;
    navigator.clipboard.writeText(url).then(() => {
      toast({
        title: "Link copied!",
        description: "Share this link with others to play this song.",
        duration: 2000,
      });
    }).catch((error) => {
      console.error('Failed to copy URL:', error);
      toast({
        title: "Failed to copy link",
        description: "Please try again",
        variant: "destructive",
        duration: 2000,
      });
    });
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={handleShare}
          >
            <Share2 className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Share song</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}; 