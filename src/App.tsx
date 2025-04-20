import React from 'react';
import { AudioProvider } from './contexts/AudioContext';
import { SongList } from './components/SongList';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AudioProvider>
          <div className="min-h-screen bg-background text-foreground">
            <header className="bg-spotify-darkgray p-4">
              <h1 className="text-2xl font-bold text-white">OurChants</h1>
            </header>
            <main className="p-4">
              <SongList />
            </main>
          </div>
        </AudioProvider>
      </TooltipProvider>
      <Toaster />
      <Sonner />
    </QueryClientProvider>
  );
}

export default App;
