import React, { useEffect, useState } from 'react';
import { AudioProvider, useAudio } from './contexts/AudioContext';
import { SongList } from './components/SongList';
import { SongDetails } from './components/SongDetails';
import About from './pages/About';
import { Toaster } from "./components/ui/toaster";
import { Toaster as Sonner } from "./components/ui/sonner";
import { TooltipProvider } from "./components/ui/tooltip";
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import { getResumeState, clearResumeState } from './utils/resumeState';
import { ResumeDialog } from './components/ResumeDialog';
import { fetchSongs } from './services/songApi';
import { getSongFromUrl } from './utils/urlParams';
import { Routes, Route, useLocation, BrowserRouter, Link } from 'react-router-dom';
import { Home, Info, ClipboardList, BookOpen } from 'lucide-react';
import BlogList from './components/BlogList';
import BlogPost from './components/BlogPost';
import { AudioPlayer } from './components/AudioPlayer';

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
  const [showResumeDialog, setShowResumeDialog] = useState(false);
  const [resumeSong, setResumeSong] = useState<{ id: string; timestamp: number; title: string } | null>(null);
  const { setSelectedSong, resumeFromTimestamp, selectedSong, shouldPlay, handlePlay, handlePause, handleSkipNext, handleSkipPrevious } = useAudio();

  const { data: songs } = useQuery({
    queryKey: ['songs'],
    queryFn: () => {
      console.log('App - Fetching songs');
      return fetchSongs();
    }
  });

  console.log('App - Songs data:', {
    data: songs,
    dataType: songs ? typeof songs : 'undefined',
    itemsType: songs?.items ? typeof songs.items : 'undefined',
    isArray: Array.isArray(songs?.items),
    itemsLength: songs?.items?.length
  });

  useEffect(() => {
    // Check for shared song URL first
    const sharedSong = getSongFromUrl();
    if (sharedSong && songs) {
      console.log('App - Looking for shared song:', {
        sharedSong,
        songs
      });
      const song = songs.find(s => s.song_id === sharedSong.songId);
      if (song) {
        setSelectedSong(song);
        if (sharedSong.timestamp) {
          resumeFromTimestamp(sharedSong.timestamp);
        }
        return;
      }
    }

    // If no shared song, check for resume state
    const resumeState = getResumeState();
    if (!resumeState || !songs) return;

    console.log('App - Looking for resume song:', {
      resumeState,
      songs
    });
    const song = songs.find(s => s.song_id === resumeState.songId);
    if (song) {
      setResumeSong({
        id: song.song_id,
        timestamp: resumeState.timestamp,
        title: song.title
      });
      setShowResumeDialog(true);
    } else {
      clearResumeState();
    }
  }, [songs, setSelectedSong, resumeFromTimestamp]);

  const handleResume = () => {
    if (resumeSong && songs) {
      const song = songs.find(s => s.song_id === resumeSong.id);
      if (song) {
        setSelectedSong(song);
        resumeFromTimestamp(resumeSong.timestamp);
        setShowResumeDialog(false);
      }
    }
  };

  const handleSkip = () => {
    clearResumeState();
    setShowResumeDialog(false);
  };

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
          />
        )}
        {showResumeDialog && resumeSong && (
          <ResumeDialog
            isOpen={showResumeDialog}
            onClose={handleSkip}
            onResume={handleResume}
            timestamp={resumeSong.timestamp}
            songTitle={resumeSong.title}
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
