import React, { useEffect, useState } from 'react';
import { AudioProvider, useAudio } from './contexts/AudioContext';
import { SongList } from './components/SongList';
import { SongDetails } from './components/SongDetails';
import About from './pages/About';
import { Toaster } from "./components/ui/toaster";
import { Toaster as Sonner } from "./components/ui/sonner";
import { TooltipProvider } from "./components/ui/tooltip";
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import { Routes, Route, useLocation, BrowserRouter, Link } from 'react-router-dom';
import { Home, Info, ClipboardList, BookOpen } from 'lucide-react';
import BlogList from './components/BlogList';
import BlogPost from './components/BlogPost';
import { AudioPlayer } from './components/AudioPlayer';
import { fetchSongs } from './services/songApi';

// Error Boundary Component
class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean, error: Error | null }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    console.error('Error caught by boundary:', error);
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error details:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 text-red-500">
          <h2>Something went wrong.</h2>
          <pre>{this.state.error?.toString()}</pre>
        </div>
      );
    }

    return this.props.children;
  }
}

const queryClient = new QueryClient();

function AppContent() {
  const location = useLocation();
  const { setSelectedSong, selectedSong, shouldPlay, handlePlay, handlePause, handleSkipNext, handleSkipPrevious } = useAudio();
  const [initialTimestamp, setInitialTimestamp] = useState<number>(0);

  const { data: songs } = useQuery({
    queryKey: ['songs'],
    queryFn: () => fetchSongs()
  });

  // Get initial timestamp from URL on mount
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const timestamp = params.get('t');
    if (timestamp) {
      const parsedTimestamp = parseFloat(timestamp);
      if (!isNaN(parsedTimestamp) && parsedTimestamp >= 0) {
        setInitialTimestamp(parsedTimestamp);
      }
    }
  }, [location.search]);

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-background text-foreground">
        <header className="bg-spotify-darkgray text-white">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold">OurChants</h1>
              <nav className="flex space-x-8">
                <Link to="/" className="flex items-center space-x-2 hover:text-spotify-green transition-colors">
                  <Home className="w-5 h-5" />
                  <span>Songs</span>
                </Link>
                <Link to="/blog" className="flex items-center space-x-2 hover:text-spotify-green transition-colors">
                  <BookOpen className="w-5 h-5" />
                  <span>Blog</span>
                </Link>
                <Link to="/about" className="flex items-center space-x-2 hover:text-spotify-green transition-colors">
                  <Info className="w-5 h-5" />
                  <span>About</span>
                </Link>
                <a 
                  href="/survey.html" 
                  className="flex items-center space-x-2 hover:text-spotify-green transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ClipboardList className="w-5 h-5" />
                  <span>Survey</span>
                </a>
              </nav>
            </div>
          </div>
        </header>
        <main className="relative">
          <Routes>
            <Route path="/" element={<SongList />} />
            <Route path="/song/:id" element={<SongDetails />} />
            <Route path="/about" element={<About />} />
            <Route path="/blog" element={<BlogList />} />
            <Route path="/blog/:slug" element={<BlogPost />} />
          </Routes>
        </main>
        {selectedSong && (
          <AudioPlayer
            s3Uri={selectedSong.s3_uri}
            title={selectedSong.title}
            artist={selectedSong.artist}
            songId={selectedSong.song_id}
            shouldPlay={shouldPlay}
            onPlay={handlePlay}
            onPause={handlePause}
            onSkipNext={handleSkipNext}
            onSkipPrevious={handleSkipPrevious}
            initialTimestamp={initialTimestamp}
          />
        )}
      </div>
      <Toaster />
      <Sonner />
    </ErrorBoundary>
  );
}

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AudioProvider>
        <TooltipProvider>
          <BrowserRouter>
            <AppContent />
          </BrowserRouter>
        </TooltipProvider>
      </AudioProvider>
    </QueryClientProvider>
  );
}

export default App;
