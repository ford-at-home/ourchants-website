import React from 'react';
import { render, screen, waitFor, act, fireEvent } from '@testing-library/react';
import { vi, test, expect, describe, beforeEach, afterEach } from 'vitest';
import { SongList } from '../SongList';
import { useAudio } from '../../contexts/AudioContext';
import { toast } from 'sonner';

// Mock dependencies
vi.mock('../../contexts/AudioContext', () => ({
  useAudio: vi.fn(),
}));

vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

vi.mock('../SearchBar', () => ({
  SearchBar: ({ value, onChange, placeholder }: any) => (
    <input
      data-testid="mock-search-bar"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
    />
  ),
}));

vi.mock('../SongCard', () => ({
  SongCard: ({ title, artist, songId, onClick }: any) => (
    <div 
      data-testid={`mock-song-card-${songId}`}
      id={songId}
      onClick={onClick}
    >
      {title} - {artist}
    </div>
  ),
}));

describe('SongList', () => {
  const mockSongs = [
    { song_id: 'song-1', title: 'Song 1', artist: 'Artist 1' },
    { song_id: 'song-2', title: 'Song 2', artist: 'Artist 2' },
  ];

  const mockAudioContext = {
    setSelectedSong: vi.fn(),
    handlePlay: vi.fn(),
    songs: mockSongs,
    isLoading: false,
  };

  const mockScrollIntoView = vi.fn();
  const mockClassList = {
    add: vi.fn(),
    remove: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock useAudio default implementation
    (useAudio as jest.Mock).mockReturnValue(mockAudioContext);

    // Reset window.location.hash
    window.location.hash = '';

    // Reset toast mocks
    (toast.error as jest.Mock).mockClear();
    (toast.success as jest.Mock).mockClear();

    // Mock getElementById and its methods
    document.getElementById = vi.fn().mockImplementation((id) => ({
      scrollIntoView: mockScrollIntoView,
      classList: mockClassList,
    }));
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  describe('loading states', () => {
    test('handles loading state correctly', () => {
      (useAudio as jest.Mock).mockReturnValueOnce({
        ...mockAudioContext,
        isLoading: true,
        songs: undefined,
      });

      render(<SongList />);
      expect(screen.getByText('Loading songs...')).toBeInTheDocument();
    });

    test('handles empty state correctly', () => {
      (useAudio as jest.Mock).mockReturnValueOnce({
        ...mockAudioContext,
        songs: [],
      });

      render(<SongList />);
      expect(screen.getByText('No songs found matching your search.')).toBeInTheDocument();
    });
  });

  describe('hash-based navigation', () => {
    test('navigates to song and autoplays when hash is present', async () => {
      window.location.hash = 'song-1';
      mockAudioContext.handlePlay.mockResolvedValueOnce(undefined);

      render(<SongList />);

      await waitFor(() => {
        expect(mockAudioContext.setSelectedSong).toHaveBeenCalledWith(mockSongs[0]);
      });

      await waitFor(() => {
        expect(mockAudioContext.handlePlay).toHaveBeenCalled();
      });

      await waitFor(() => {
        expect(mockScrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth', block: 'center' });
      });
    });

    test('shows error toast when song is not found', async () => {
      window.location.hash = 'non-existent-song';
      render(<SongList />);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Song not found');
      });

      expect(mockAudioContext.setSelectedSong).not.toHaveBeenCalled();
      expect(mockAudioContext.handlePlay).not.toHaveBeenCalled();
    });

    test('adds and removes highlight class', async () => {
      window.location.hash = 'song-1';
      mockAudioContext.handlePlay.mockResolvedValueOnce(undefined);
      
      render(<SongList />);

      // Wait for highlight to be added
      await waitFor(() => {
        expect(mockClassList.add).toHaveBeenCalledWith('highlight-song');
      });

      // Wait for highlight to be removed
      await waitFor(() => {
        expect(mockClassList.remove).toHaveBeenCalledWith('highlight-song');
      }, { timeout: 3000 }); // Give enough time for the timeout
    }, { timeout: 5000 });

    test('handles autoplay failure gracefully', async () => {
      window.location.hash = 'song-1';
      mockAudioContext.handlePlay.mockRejectedValueOnce(new Error('Autoplay failed'));

      render(<SongList />);

      await waitFor(() => {
        expect(mockAudioContext.setSelectedSong).toHaveBeenCalledWith(mockSongs[0]);
      });

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Click to play the song');
      });
    });

    test('handles multiple hash changes', async () => {
      // Start with no hash
      window.location.hash = '';
      render(<SongList />);

      // First navigation
      act(() => {
        window.location.hash = 'song-1';
        window.dispatchEvent(new HashChangeEvent('hashchange'));
      });

      await waitFor(() => {
        expect(mockAudioContext.setSelectedSong).toHaveBeenCalledWith(mockSongs[0]);
      });

      // Reset mocks and wait for any pending operations
      mockAudioContext.setSelectedSong.mockClear();
      await act(async () => {
        await Promise.resolve();
      });

      // Second navigation
      act(() => {
        window.location.hash = 'song-2';
        window.dispatchEvent(new HashChangeEvent('hashchange'));
      });

      await waitFor(() => {
        expect(mockAudioContext.setSelectedSong).toHaveBeenCalledWith(mockSongs[1]);
      });
    });

    test('prevents duplicate handling of same hash', async () => {
      window.location.hash = 'song-1';
      mockAudioContext.handlePlay.mockResolvedValue(undefined);
      
      render(<SongList />);

      // Wait for initial navigation
      await waitFor(() => {
        expect(mockAudioContext.setSelectedSong).toHaveBeenCalledWith(mockSongs[0]);
      });

      // Reset mocks
      mockAudioContext.setSelectedSong.mockClear();
      mockAudioContext.handlePlay.mockClear();

      // Trigger same hash again
      await act(async () => {
        window.dispatchEvent(new HashChangeEvent('hashchange'));
        await Promise.resolve();
      });

      // Should not trigger new navigation
      expect(mockAudioContext.setSelectedSong).not.toHaveBeenCalled();
      expect(mockAudioContext.handlePlay).not.toHaveBeenCalled();
    });
  });

  describe('song interaction', () => {
    test('handles song click correctly', async () => {
      mockAudioContext.handlePlay.mockResolvedValueOnce(undefined);
      render(<SongList />);

      const songCard = screen.getByTestId('mock-song-card-song-1');
      fireEvent.click(songCard);

      expect(mockAudioContext.setSelectedSong).toHaveBeenCalledWith(mockSongs[0]);
      expect(mockAudioContext.handlePlay).toHaveBeenCalled();
    });

    test('handles song click failure gracefully', async () => {
      mockAudioContext.handlePlay.mockRejectedValueOnce(new Error('Play failed'));
      render(<SongList />);

      const songCard = screen.getByTestId('mock-song-card-song-1');
      fireEvent.click(songCard);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Failed to play song');
      });
    });
  });
}); 