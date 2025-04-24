import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AudioPlayer } from '../AudioPlayer';
import '@testing-library/jest-dom';
import { describe, it, expect, vi, beforeEach, SpyInstance } from 'vitest';
import '../../test/setup';
import userEvent from '@testing-library/user-event';

// Mock fetch globally
global.fetch = vi.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ url: 'https://example.com/audio.mp3' }),
  })
) as unknown as typeof fetch;

// Mock Audio globally
const mockPlay = vi.fn();
const mockPause = vi.fn();
const mockLoad = vi.fn();
const mockAudio = {
  play: mockPlay,
  pause: mockPause,
  load: mockLoad,
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  currentTime: 0,
  volume: 1,
  src: '',
  crossOrigin: '',
  duration: 100,
};
global.Audio = vi.fn(() => mockAudio) as unknown as typeof Audio;

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
    expect(mockAudio.volume).toBe(1);
    expect(mockAudio.crossOrigin).toBe('anonymous');
  });

  it('handles play/pause state changes', async () => {
    const onPlay = vi.fn();
    const onPause = vi.fn();

    render(
      <AudioPlayer
        s3Uri="s3://bucket/key"
        title="Test Song"
        artist="Test Artist"
        onPlay={onPlay}
        onPause={onPause}
      />
    );
    
    // Wait for initial fetch
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    // Simulate canplay event
    const canPlayHandler = mockAudio.addEventListener.mock.calls.find(
      call => call[0] === 'canplay'
    )?.[1];
    canPlayHandler?.();

    const playButton = screen.getByRole('button', { name: /play/i });
    expect(playButton).toBeInTheDocument();

    // Click play
    fireEvent.click(playButton);
    expect(mockPlay).toHaveBeenCalled();
    expect(onPlay).toHaveBeenCalled();

    // Should now show pause button
    const pauseButton = screen.getByRole('button', { name: /pause/i });
    expect(pauseButton).toBeInTheDocument();

    // Click pause
    fireEvent.click(pauseButton);
    expect(mockPause).toHaveBeenCalled();
    expect(onPause).toHaveBeenCalled();

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

    // Should show retry button
    expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
  });
}); 