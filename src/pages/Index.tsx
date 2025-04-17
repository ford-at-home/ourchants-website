
import { MusicPlayer } from "@/components/MusicPlayer";
import { SongList } from "@/components/SongList";

const Index = () => {
  return (
    <div className="min-h-screen bg-spotify-dark pb-24">
      <header className="py-6 px-4">
        <h1 className="text-white text-2xl font-bold text-center">Mellow Tune Hub</h1>
      </header>
      <main>
        <SongList />
      </main>
      <MusicPlayer />
    </div>
  );
};

export default Index;
