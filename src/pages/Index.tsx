
import { MusicPlayer } from "@/components/MusicPlayer";
import { SongList } from "@/components/SongList";
import { BookAudio } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-spotify-dark to-black pb-24">
      <header className="py-12 px-4 text-center">
        <BookAudio className="w-16 h-16 mx-auto text-spotify-green mb-6" />
        <h1 className="text-4xl font-bold text-white mb-4 bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
          Sacred Chants Collection
        </h1>
        <p className="text-spotify-lightgray max-w-2xl mx-auto mb-8 text-lg">
          Explore our curated collection of indigenous sacred chants, preserving ancient 
          wisdom and spiritual traditions through melody and rhythm.
        </p>
      </header>
      <main className="mt-6">
        <SongList />
      </main>
      <MusicPlayer />
    </div>
  );
};

export default Index;
