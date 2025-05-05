import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AudioProvider } from '../../contexts/AudioContext';
import { SongList } from '../SongList';
import { useToast } from '../ui/use-toast';

// Mock the toast hook
vi.mock('../ui/use-toast', () => ({
  useToast: vi.fn(() => ({
    toast: vi.fn(),
  })),
}));

// Mock the song API
vi.mock('../../services/songApi', () => ({
  fetchSongs: vi.fn(() => Promise.resolve([
    {
      song_id: 'test-song-1',
      title: 'Test Song 1',
      artist: 'Test Artist',
      s3_uri: 's3://test-bucket/test-song-1.mp3'
    },
    {
      song_id: 'test-song-2',
      title: 'Test Song 2',
      artist: 'Test Artist 2',
      s3_uri: 's3://test-bucket/test-song-2.mp3'
    }
  ])),
}));

// Mock clipboard API
const mockClipboard = {
  writeText: vi.fn(() => Promise.resolve()),
};
Object.assign(navigator, { clipboard: mockClipboard });

const renderApp = (initialPath = '/') => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <AudioProvider>
        <MemoryRouter initialEntries={[initialPath]}>
          <Routes>
            <Route path="/" element={<SongList />} />
          </Routes>
        </MemoryRouter>
      </AudioProvider>
    </QueryClientProvider>
  );
};

describe('Song Sharing Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset window location
    Object.defineProperty(window, 'location', {
      value: {
        origin: 'https://example.com',
        href: 'https://example.com',
        pathname: '/',
        search: '',
        hash: '',
      },
      writable: true,
    });
  });

  it('should copy song URL to clipboard when share button is clicked', async () => {
    renderApp();

    // Wait for songs to load
    await waitFor(() => {
      expect(screen.getByText('Test Song 1')).toBeInTheDocument();
    });

    // Find and click share button for the first song
    const shareButton = screen.getAllByRole('button')[1]; // Second button should be share
    await fireEvent.click(shareButton);

    // Verify clipboard API was called with correct URL
    expect(mockClipboard.writeText).toHaveBeenCalledWith(
      expect.stringContaining('test-song-1')
    );

    // Verify toast was shown
    const { toast } = useToast();
    expect(toast).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Link copied!',
        description: expect.any(String),
      })
    );
  });

  it('should handle clipboard API failure gracefully', async () => {
    // Mock clipboard failure
    mockClipboard.writeText.mockRejectedValueOnce(new Error('Clipboard error'));
    
    renderApp();

    await waitFor(() => {
      expect(screen.getByText('Test Song 1')).toBeInTheDocument();
    });

    const shareButton = screen.getAllByRole('button')[1];
    await fireEvent.click(shareButton);

    const { toast } = useToast();
    expect(toast).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Failed to copy link',
        description: 'Please try again',
        variant: 'destructive',
      })
    );
  });

  it('should load and auto-select shared song from URL', async () => {
    // Set URL with song ID in hash
    window.location.search = '?song=test-song-2';
    
    renderApp('/?song=test-song-2');

    await waitFor(() => {
      expect(screen.getByText('Test Song 2')).toBeInTheDocument();
    });

    // Verify the song was auto-selected
    // Note: Full playback testing would require more complex audio element mocking
    expect(screen.getByText('Test Song 2')).toHaveClass('hover:bg-accent');
  });

  it('should handle non-existent shared song gracefully', async () => {
    window.location.search = '?song=non-existent-song';
    
    renderApp('/?song=non-existent-song');

    await waitFor(() => {
      const { toast } = useToast();
      expect(toast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Song not found',
          description: 'The shared song is no longer available.',
          variant: 'destructive',
        })
      );
    });
  });
}); 