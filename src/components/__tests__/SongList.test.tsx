import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SongList } from '../SongList';
import { describe, it, expect, vi } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fetchSongs } from '../../services/songApi';

// Mock the fetchSongs function
vi.mock('../../services/songApi', () => ({
  fetchSongs: vi.fn()
}));

// Mock the AudioContext
const mockSetSelectedSong = vi.fn();
const mockHandlePlay = vi.fn();

vi.mock('../../contexts/AudioContext', () => ({
  useAudio: () => ({
    setSelectedSong: mockSetSelectedSong,
    selectedSong: null,
    handlePlay: mockHandlePlay
  })
}));

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
    vi.clearAllMocks();
  });

  it('renders loading state initially', () => {
    (fetchSongs as any).mockResolvedValue([]);
    
    render(
      <QueryClientProvider client={queryClient}>
        <SongList />
      </QueryClientProvider>
    );

    expect(screen.getByText(/loading songs/i)).toBeInTheDocument();
  });

  it('renders error state when fetch fails', async () => {
    (fetchSongs as any).mockRejectedValue(new Error('Failed to fetch'));
    
    render(
      <QueryClientProvider client={queryClient}>
        <SongList />
      </QueryClientProvider>
    );

    // Wait for the error state to appear
    await waitFor(() => {
      expect(screen.getByText(/error loading songs/i)).toBeInTheDocument();
    });
  });

  it('renders songs when data is loaded', async () => {
    const mockSongs = [
      { 
        song_id: '1', 
        title: 'Song 1', 
        artist: 'Artist 1' 
      },
      { 
        song_id: '2', 
        title: 'Song 2', 
        artist: 'Artist 2' 
      }
    ];
    (fetchSongs as any).mockResolvedValue(mockSongs);
    
    render(
      <QueryClientProvider client={queryClient}>
        <SongList />
      </QueryClientProvider>
    );

    // Wait for the loading state to disappear
    await waitFor(() => {
      expect(screen.queryByText(/loading songs/i)).not.toBeInTheDocument();
    });

    // Check that the songs are rendered
    expect(screen.getByText('Song 1')).toBeInTheDocument();
    expect(screen.getByText('Song 2')).toBeInTheDocument();
  });

  it('filters songs based on search term', async () => {
    const mockSongs = [
      { 
        song_id: '1', 
        title: 'Song 1', 
        artist: 'Artist 1' 
      },
      { 
        song_id: '2', 
        title: 'Song 2', 
        artist: 'Artist 2' 
      }
    ];
    (fetchSongs as any).mockResolvedValue(mockSongs);
    
    render(
      <QueryClientProvider client={queryClient}>
        <SongList />
      </QueryClientProvider>
    );

    // Wait for the loading state to disappear
    await waitFor(() => {
      expect(screen.queryByText(/loading songs/i)).not.toBeInTheDocument();
    });

    // Type in search box
    const searchInput = screen.getByPlaceholderText(/search by artist/i);
    fireEvent.change(searchInput, { target: { value: 'Artist 1' } });

    // Check that only the matching song is shown
    expect(screen.getByText('Song 1')).toBeInTheDocument();
    expect(screen.queryByText('Song 2')).not.toBeInTheDocument();
  });

  it('shows no results message when search has no matches', async () => {
    const mockSongs = [
      { 
        song_id: '1', 
        title: 'Song 1', 
        artist: 'Artist 1' 
      },
      { 
        song_id: '2', 
        title: 'Song 2', 
        artist: 'Artist 2' 
      }
    ];
    (fetchSongs as any).mockResolvedValue(mockSongs);
    
    render(
      <QueryClientProvider client={queryClient}>
        <SongList />
      </QueryClientProvider>
    );

    // Wait for the loading state to disappear
    await waitFor(() => {
      expect(screen.queryByText(/loading songs/i)).not.toBeInTheDocument();
    });

    // Type in search box
    const searchInput = screen.getByPlaceholderText(/search by artist/i);
    fireEvent.change(searchInput, { target: { value: 'nonexistent' } });

    // Check that the no results message is shown
    expect(screen.getByText('No songs found matching your search.')).toBeInTheDocument();
  });

  it('triggers playback when clicking a song', async () => {
    const mockSongs = [
      { 
        song_id: '1', 
        title: 'Song 1', 
        artist: 'Artist 1',
        s3_uri: 's3://test-bucket/song1.mp3'
      }
    ];
    (fetchSongs as any).mockResolvedValue(mockSongs);
    
    render(
      <QueryClientProvider client={queryClient}>
        <SongList />
      </QueryClientProvider>
    );

    // Wait for songs to load
    await waitFor(() => {
      expect(screen.queryByText(/loading songs/i)).not.toBeInTheDocument();
    });

    // Find and click the song element
    const songElement = screen.getByText('Song 1').closest('div[role="button"]');
    expect(songElement).toBeInTheDocument();
    fireEvent.click(songElement!);

    // Verify that both setSelectedSong and handlePlay were called
    expect(mockSetSelectedSong).toHaveBeenCalledWith(mockSongs[0]);
    expect(mockHandlePlay).toHaveBeenCalled();
  });
}); 