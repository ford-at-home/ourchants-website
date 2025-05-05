import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import { vi, test, expect, describe, beforeEach, afterEach } from 'vitest';
import { SongList } from '../SongList';
import { useQuery } from '@tanstack/react-query';
import { useAudio } from '../../contexts/AudioContext';
import { toast } from 'sonner';

// Mock dependencies
vi.mock('@tanstack/react-query', () => ({
  useQuery: vi.fn(),
}));

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
  };

  const mockScrollIntoView = vi.fn();
  const mockClassList = {
    add: vi.fn(),
    remove: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock useQuery default implementation
    (useQuery as jest.Mock).mockReturnValue({
      data: mockSongs,
      isLoading: false,
      error: null,
    });

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
      // Set up fake timers before any async operations
      vi.useFakeTimers();
      
      window.location.hash = 'song-1';
      mockAudioContext.handlePlay.mockResolvedValueOnce(undefined);
      
      render(<SongList />);

      // First, wait for the highlight to be added
      await act(async () => {
        await Promise.resolve(); // Flush promises
        expect(mockClassList.add).toHaveBeenCalledWith('highlight-song');
      });

      // Then advance the timer
      await act(async () => {
        vi.advanceTimersByTime(2000);
        await Promise.resolve(); // Flush promises again
      });

      // Finally check if the highlight was removed
      expect(mockClassList.remove).toHaveBeenCalledWith('highlight-song');
    }, { timeout: 10000 }); // Increase timeout just in case

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
  });
}); 