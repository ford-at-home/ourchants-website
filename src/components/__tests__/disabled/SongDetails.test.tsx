import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { SongDetails } from '../SongDetails';
import { useAudio } from '../../contexts/AudioContext';
import { fetchSongs } from '../../services/songApi';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import '@testing-library/jest-dom';

// Mock the useAudio hook
vi.mock('../../contexts/AudioContext', () => ({
  useAudio: vi.fn()
}));

// Mock the fetchSongs function
vi.mock('../../services/songApi', () => ({
  fetchSongs: vi.fn()
}));

const mockSong = {
  song_id: '1',
  title: 'Test Song',
  artist: 'Test Artist',
  album: 'Test Album',
  description: 'Test Description',
  s3_uri: 's3://test-bucket/song.mp3'
};

const mockAudioContext = {
  selectedSong: null,
  setSelectedSong: jest.fn(),
  shouldPlay: false,
  setShouldPlay: jest.fn(),
  handlePlay: jest.fn(),
  handlePause: jest.fn(),
  resumeFromTimestamp: jest.fn(),
  handleSkipNext: jest.fn(),
  handleSkipPrevious: jest.fn()
};

describe('SongDetails', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });

    (useAudio as jest.Mock).mockReturnValue(mockAudioContext);
    (fetchSongs as jest.Mock).mockResolvedValue({
      items: [mockSong],
      total: 1,
      has_more: false
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading state initially', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/songs/1']}>
          <Routes>
            <Route path="/songs/:id" element={<SongDetails />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    );

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders song details when data is loaded', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/songs/1']}>
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

  it('handles play button click correctly', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/songs/1']}>
          <Routes>
            <Route path="/songs/:id" element={<SongDetails />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Test Song')).toBeInTheDocument();
    });

    const playButton = screen.getByText('Play Song');
    playButton.click();

    expect(mockAudioContext.setSelectedSong).toHaveBeenCalledWith(mockSong);
  });

  it('handles error state correctly', async () => {
    (fetchSongs as jest.Mock).mockRejectedValue(new Error('Failed to fetch'));

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/songs/1']}>
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

  it('handles song not found state correctly', async () => {
    (fetchSongs as jest.Mock).mockResolvedValue({
      items: [],
      total: 0,
      has_more: false
    });

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/songs/nonexistent']}>
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
}); 