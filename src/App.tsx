import React, { useEffect, useState } from 'react';
import { AudioProvider, useAudio } from './contexts/AudioContext';
import { SongList } from './components/SongList';
import { SongDetails } from './components/SongDetails';
import About from './pages/About';
import { Toaster } from "./components/ui/toaster";
import { Toaster as Sonner } from "./components/ui/sonner";
import { TooltipProvider } from "./components/ui/tooltip";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { getResumeState, clearResumeState } from './utils/resumeState';
import { ResumeDialog } from './components/ResumeDialog';
import { useQuery } from '@tanstack/react-query';
import { fetchSongs } from './services/songApi';
import { getSongFromUrl } from './utils/urlParams';
import { Routes, Route, useLocation, BrowserRouter } from 'react-router-dom';

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
  const { setSelectedSong, resumeFromTimestamp } = useAudio();

  const { data: songs } = useQuery({
    queryKey: ['songs'],
    queryFn: fetchSongs,
  });

  useEffect(() => {
    // Check for shared song URL first
    const sharedSong = getSongFromUrl();
    if (sharedSong && songs) {
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
      setSelectedSong(songs.find(s => s.song_id === resumeSong.id)!);
      resumeFromTimestamp(resumeSong.timestamp);
      setShowResumeDialog(false);
    }
  };

  const handleSkip = () => {
    clearResumeState();
    setShowResumeDialog(false);
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-background text-foreground">
        <header className="bg-spotify-darkgray text-white p-4">
          <h1 className="text-2xl font-bold">OurChants</h1>
        </header>
        <main className="relative">
          <Routes>
            <Route path="/" element={<SongList />} />
            <Route path="/song/:id" element={<SongDetails />} />
            <Route path="/about" element={<About />} />
          </Routes>
        </main>
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
