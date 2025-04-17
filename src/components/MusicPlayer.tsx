
import { Play, SkipBack, SkipForward, Volume2 } from "lucide-react";
import { Button } from "./ui/button";
import { Slider } from "./ui/slider";

export const MusicPlayer = () => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-spotify-darkgray p-4">
      <div className="max-w-screen-xl mx-auto flex items-center justify-between">
        <div className="w-1/4">
          {/* Song Info */}
          <p className="text-white truncate">Select a song to play</p>
        </div>
        
        <div className="flex flex-col items-center w-1/2">
          {/* Playback Controls */}
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="text-spotify-lightgray hover:text-white">
              <SkipBack className="h-5 w-5" />
            </Button>
            <Button size="icon" className="bg-white text-black hover:scale-105 transition-transform">
              <Play className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="text-spotify-lightgray hover:text-white">
              <SkipForward className="h-5 w-5" />
            </Button>
          </div>
          {/* Progress Bar */}
          <div className="w-full mt-2 flex items-center gap-2">
            <span className="text-xs text-spotify-lightgray">0:00</span>
            <Slider disabled className="w-full" />
            <span className="text-xs text-spotify-lightgray">0:00</span>
          </div>
        </div>
        
        <div className="w-1/4 flex justify-end items-center gap-2">
          {/* Volume Control */}
          <Volume2 className="h-5 w-5 text-spotify-lightgray" />
          <Slider disabled className="w-24" />
        </div>
      </div>
    </div>
  );
};
