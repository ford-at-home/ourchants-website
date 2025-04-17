
import { MusicPlayer } from "@/components/MusicPlayer";
import { SongList } from "@/components/SongList";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-spotify-dark to-black pb-24">
      <header className="py-6 px-4 bg-black/30">
        <h1 className="text-white text-3xl font-bold text-center bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
          Mellow Tune Hub
        </h1>
      </header>
      <main className="mt-6">
        <SongList />
      </main>
      <MusicPlayer />
    </div>
  );
};

export default Index;
