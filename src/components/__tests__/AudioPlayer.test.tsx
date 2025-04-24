import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AudioPlayer } from '../AudioPlayer';
import '@testing-library/jest-dom';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import '../../test/setup';

// Mock fetch globally
global.fetch = vi.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ url: 'https://example.com/audio.mp3' }),
  })
) as unknown as typeof fetch;

// Mock Audio globally
global.Audio = vi.fn(() => ({
  play: vi.fn(),
  pause: vi.fn(),
  load: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  currentTime: 0,
})) as unknown as typeof Audio;

describe('AudioPlayer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders nothing when s3Uri is empty', () => {
    const { container } = render(
      <AudioPlayer
        s3Uri=""
        title="Test Song"
        artist="Test Artist"
      />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('renders with valid s3Uri', async () => {
    render(
      <AudioPlayer
        s3Uri="s3://bucket/key"
        title="Test Song"
        artist="Test Artist"
      />
    );
    
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    expect(screen.getByText('Test Song')).toBeInTheDocument();
    expect(screen.getByText('Test Artist')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /play/i })).toBeInTheDocument();
  });

  it('handles invalid initialTimestamp', () => {
    render(
      <AudioPlayer
        s3Uri="s3://bucket/key"
        title="Test Song"
        artist="Test Artist"
        initialTimestamp={-1}
      />
    );
    // Should still render with valid s3Uri
    expect(screen.getByText('Test Song')).toBeInTheDocument();
  });

  it('initializes audio element with correct properties', () => {
    render(
      <AudioPlayer
        s3Uri="s3://bucket/key"
        title="Test Song"
        artist="Test Artist"
      />
    );
    expect(global.Audio).toHaveBeenCalled();
  });

  it('handles play/pause state changes', async () => {
    render(
      <AudioPlayer
        s3Uri="s3://bucket/key"
        title="Test Song"
        artist="Test Artist"
      />
    );
    
    // Wait for initial fetch
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    const playButton = screen.getByRole('button', { name: /play/i });
    expect(playButton).toBeInTheDocument();

    // Click play
    fireEvent.click(playButton);
    await waitFor(() => {
      expect(window.HTMLMediaElement.prototype.play).toHaveBeenCalledTimes(1);
    });

    // Should now show pause button
    expect(screen.getByRole('button', { name: /pause/i })).toBeInTheDocument();

    // Click pause
    fireEvent.click(screen.getByRole('button', { name: /pause/i }));
    expect(window.HTMLMediaElement.prototype.pause).toHaveBeenCalledTimes(1);

    // Should show play button again
    expect(screen.getByRole('button', { name: /play/i })).toBeInTheDocument();
  });

  it('handles fetch errors gracefully', async () => {
    // Mock fetch to return an error
    (global.fetch as unknown as ReturnType<typeof vi.fn>).mockImplementationOnce(() =>
      Promise.reject(new Error('Failed to fetch'))
    );

    render(
      <AudioPlayer
        s3Uri="s3://bucket/key"
        title="Test Song"
        artist="Test Artist"
      />
    );
    
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    // Should show error message
    expect(screen.getByText(/Failed to load audio/i)).toBeInTheDocument();
  });
}); 