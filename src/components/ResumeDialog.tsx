import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { formatTime } from "@/utils/time";

interface ResumeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onResume: () => void;
  timestamp: number;
  songTitle: string;
}

export const ResumeDialog: React.FC<ResumeDialogProps> = ({
  isOpen,
  onClose,
  onResume,
  timestamp,
  songTitle,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-spotify-darkgray text-white border-spotify-darkgray">
        <DialogHeader>
          <DialogTitle>Continue Listening?</DialogTitle>
          <DialogDescription className="text-spotify-lightgray">
            {songTitle} at {formatTime(timestamp)}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="ghost"
            onClick={onClose}
            className="text-spotify-lightgray hover:text-white"
          >
            Skip
          </Button>
          <Button
            onClick={onResume}
            className="bg-spotify-green text-white hover:bg-spotify-green/90"
          >
            Continue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}; 