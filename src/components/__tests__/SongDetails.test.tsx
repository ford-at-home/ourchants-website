import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { SongDetails } from '../SongDetails';
import { useAudio } from '../../contexts/AudioContext';
import { fetchSongs } from '../../services/songApi';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import '@testing-library/jest-dom';

// Mock the useAudio hook
vi.mock('../../contexts/AudioContext', () => ({
  useAudio: vi.fn(() => ({
    setSelectedSong: vi.fn()
  }))
}));

// Mock the fetchSongs function
vi.mock('../../services/songApi', () => ({
  fetchSongs: vi.fn()
}));

describe('SongDetails', () => {
  const mockSong = {
    song_id: '123',
    title: 'Test Song',
    artist: 'Test Artist',
    description: 'Test Description'
  };

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient.clear();
  });

  it('renders loading state initially', () => {
    (fetchSongs as any).mockResolvedValue({ items: [] });
    
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/songs/123']}>
          <Routes>
            <Route path="/songs/:id" element={<SongDetails />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    );

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders song details when data is loaded', async () => {
    (fetchSongs as any).mockResolvedValue({ items: [mockSong] });
    
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/songs/123']}>
          <Routes>
            <Route path="/songs/:id" element={<SongDetails />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Test Song')).toBeInTheDocument();
      expect(screen.getByText('Test Description')).toBeInTheDocument();
    });
  });

  it('handles non-array items data', async () => {
    (fetchSongs as any).mockResolvedValue({ items: null });
    
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/songs/123']}>
          <Routes>
            <Route path="/songs/:id" element={<SongDetails />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Song not found')).toBeInTheDocument();
    });
  });

  it('handles empty items array', async () => {
    (fetchSongs as any).mockResolvedValue({ items: [] });
    
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/songs/123']}>
          <Routes>
            <Route path="/songs/:id" element={<SongDetails />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Song not found')).toBeInTheDocument();
    });
  });

  it('handles error state', async () => {
    (fetchSongs as any).mockRejectedValue(new Error('Failed to fetch'));
    
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/songs/123']}>
          <Routes>
            <Route path="/songs/:id" element={<SongDetails />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Error loading song details')).toBeInTheDocument();
    });
  });
}); 