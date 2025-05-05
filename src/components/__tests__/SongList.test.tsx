import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SongList } from '../SongList';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAudio } from '../../contexts/AudioContext';
import { useToast } from '../ui/use-toast';

// Mock the AudioContext
vi.mock('../../contexts/AudioContext', () => ({
  useAudio: vi.fn(() => ({
    setSelectedSong: vi.fn(),
    handlePlay: vi.fn(),
  })),
}));

// Mock the toast hook
vi.mock('../ui/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

const mockSongs = [
  { song_id: 'song-1', title: 'Test Song 1', artist: 'Artist 1' },
  { song_id: 'song-2', title: 'Test Song 2', artist: 'Artist 2' },
];

describe('SongList', () => {
  let queryClient: QueryClient;
  let mockSetSelectedSong: ReturnType<typeof vi.fn>;
  let mockHandlePlay: ReturnType<typeof vi.fn>;
  let mockToast: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    // Create a new QueryClient for each test
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });

    // Setup mocks
    mockSetSelectedSong = vi.fn();
    mockHandlePlay = vi.fn();
    mockToast = vi.fn();

    (useAudio as jest.Mock).mockReturnValue({
      setSelectedSong: mockSetSelectedSong,
      handlePlay: mockHandlePlay,
    });

    (useToast as jest.Mock).mockReturnValue({
      toast: mockToast,
    });

    // Mock window.location.hash
    Object.defineProperty(window, 'location', {
      value: {
        hash: '',
      },
      writable: true,
    });

    // Mock DOM methods
    window.HTMLElement.prototype.scrollIntoView = vi.fn();
    window.HTMLElement.prototype.classList = {
      add: vi.fn(),
      remove: vi.fn(),
    } as any;

    // Mock getElementById
    document.getElementById = vi.fn((id) => ({
      scrollIntoView: vi.fn(),
      classList: {
        add: vi.fn(),
        remove: vi.fn(),
      },
    })) as any;
  });

  const renderWithQuery = (ui: React.ReactNode, options = {}) => {
    return render(
      <QueryClientProvider client={queryClient}>
        {ui}
      </QueryClientProvider>,
      options
    );
  };

  it('renders loading state initially', async () => {
    queryClient.setQueryData(['songs'], { isLoading: true });
    renderWithQuery(<SongList />);
    expect(screen.getByText(/loading songs/i)).toBeInTheDocument();
  });

  it('renders error state when fetch fails', async () => {
    queryClient.setQueryData(['songs'], { 
      isLoading: false,
      error: new Error('Failed to fetch')
    });
    
    renderWithQuery(<SongList />);
    
    expect(screen.getByText(/error loading songs/i)).toBeInTheDocument();
  });

  it('renders songs when data is loaded', async () => {
    queryClient.setQueryData(['songs'], {
      isLoading: false,
      data: mockSongs,
    });
    
    renderWithQuery(<SongList />);

    await waitFor(() => {
      expect(screen.getByText('Test Song 1')).toBeInTheDocument();
      expect(screen.getByText('Test Song 2')).toBeInTheDocument();
    });
  });

  it('filters songs based on search term', async () => {
    queryClient.setQueryData(['songs'], {
      isLoading: false,
      data: mockSongs,
    });
    
    renderWithQuery(<SongList />);

    const searchInput = screen.getByPlaceholderText(/search by artist/i);
    fireEvent.change(searchInput, { target: { value: 'Artist 1' } });

    await waitFor(() => {
      expect(screen.getByText('Test Song 1')).toBeInTheDocument();
      expect(screen.queryByText('Test Song 2')).not.toBeInTheDocument();
    });
  });

  describe('Hash-based navigation', () => {
    beforeEach(() => {
      queryClient.setQueryData(['songs'], {
        isLoading: false,
        data: mockSongs,
      });
    });

    it('scrolls to and autoplays song when valid hash is present', async () => {
      window.location.hash = 'song-1';
      
      renderWithQuery(<SongList />);
      
      await waitFor(() => {
        expect(document.getElementById).toHaveBeenCalledWith('song-1');
        expect(mockSetSelectedSong).toHaveBeenCalledWith(mockSongs[0]);
        expect(mockHandlePlay).toHaveBeenCalled();
      });
    });

    it('shows error toast when song from hash is not found', async () => {
      window.location.hash = 'non-existent-song';
      
      renderWithQuery(<SongList />);
      
      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: "Song not found",
          description: "The shared song is no longer available.",
          variant: "destructive",
          duration: 3000,
        });
      });
    });

    it('handles autoplay failure gracefully', async () => {
      window.location.hash = 'song-1';
      mockHandlePlay.mockImplementation(() => {
        throw new Error('Autoplay failed');
      });

      renderWithQuery(<SongList />);

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: "Tap to play",
          description: "Browser blocked autoplay. Click the song to start playing.",
          duration: 3000,
        });
      });
    });
  });

  describe('Search functionality', () => {
    beforeEach(() => {
      queryClient.setQueryData(['songs'], {
        isLoading: false,
        data: mockSongs,
      });
    });

    it('filters songs by artist', async () => {
      renderWithQuery(<SongList />);
      
      const searchInput = screen.getByPlaceholderText('Search by artist...');
      fireEvent.change(searchInput, { target: { value: 'Artist 1' } });

      await waitFor(() => {
        expect(screen.getByText('Test Song 1')).toBeInTheDocument();
        expect(screen.queryByText('Test Song 2')).not.toBeInTheDocument();
      });
    });

    it('shows no results message when no matches found', async () => {
      renderWithQuery(<SongList />);
      
      const searchInput = screen.getByPlaceholderText('Search by artist...');
      fireEvent.change(searchInput, { target: { value: 'Non-existent Artist' } });

      await waitFor(() => {
        expect(screen.getByText('No songs found matching your search.')).toBeInTheDocument();
      });
    });
  });
}); 