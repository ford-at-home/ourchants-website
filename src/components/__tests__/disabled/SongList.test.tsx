/*
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SongList } from '../SongList';
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

const mockSongs = [
  {
    song_id: '1',
    title: 'Test Song 1',
    artist: 'Test Artist',
    album: 'Test Album',
    s3_uri: 's3://test-bucket/song1.mp3'
  },
  {
    song_id: '2',
    title: 'Test Song 2',
    artist: 'Test Artist',
    album: 'Test Album',
    s3_uri: 's3://test-bucket/song2.mp3'
  }
];

const mockAudioContext = {
  selectedSong: null,
  setSelectedSong: vi.fn(),
  shouldPlay: false,
  setShouldPlay: vi.fn(),
  handlePlay: vi.fn(),
  handlePause: vi.fn(),
  resumeFromTimestamp: vi.fn(),
  handleSkipNext: vi.fn(),
  handleSkipPrevious: vi.fn()
};

describe('SongList', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });

    (useAudio as unknown as ReturnType<typeof vi.fn>).mockReturnValue(mockAudioContext);
    (fetchSongs as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      items: mockSongs,
      total: 2,
      has_more: false
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state initially', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <SongList />
      </QueryClientProvider>
    );

    expect(screen.getByText('Loading songs...')).toBeInTheDocument();
  });

  it('renders songs when data is loaded', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <SongList />
      </QueryClientProvider>
    );

    await waitFor(() => {
      const song1 = screen.getByText((content) => content.includes('Test Song 1'));
      const song2 = screen.getByText((content) => content.includes('Test Song 2'));
      expect(song1).toBeInTheDocument();
      expect(song2).toBeInTheDocument();
    });
  });

  it('handles song click correctly', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <SongList />
      </QueryClientProvider>
    );

    await waitFor(() => {
      const song = screen.getByText((content) => content.includes('Test Song 1'));
      expect(song).toBeInTheDocument();
    });

    const song = screen.getByText((content) => content.includes('Test Song 1'));
    fireEvent.click(song);

    expect(mockAudioContext.setSelectedSong).toHaveBeenCalledWith(mockSongs[0]);
    expect(mockAudioContext.handlePlay).toHaveBeenCalled();
  });

  it('handles search correctly', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <SongList />
      </QueryClientProvider>
    );

    const searchInput = screen.getByPlaceholderText('Search by title, artist, or tradition...');
    fireEvent.change(searchInput, { target: { value: 'Test Artist' } });

    await waitFor(() => {
      expect(fetchSongs).toHaveBeenCalledWith({
        artist_filter: 'Test Artist',
        limit: 20,
        offset: 0
      });
    });
  });

  it('handles pagination correctly', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <SongList />
      </QueryClientProvider>
    );

    await waitFor(() => {
      const song = screen.getByText((content) => content.includes('Test Song 1'));
      expect(song).toBeInTheDocument();
    });

    const nextButton = screen.getByText('Next');
    fireEvent.click(nextButton);

    await waitFor(() => {
      expect(fetchSongs).toHaveBeenCalledWith({
        artist_filter: '',
        limit: 20,
        offset: 20
      });
    });
  });

  it('handles error state correctly', async () => {
    (fetchSongs as unknown as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('Failed to fetch'));

    render(
      <QueryClientProvider client={queryClient}>
        <SongList />
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Error loading songs. Please check your connection and try again.')).toBeInTheDocument();
    });
  });

  it('handles empty state correctly', async () => {
    (fetchSongs as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      items: [],
      total: 0,
      has_more: false
    });

    render(
      <QueryClientProvider client={queryClient}>
        <SongList />
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('No songs available.')).toBeInTheDocument();
    });
  });
});
*/ 