/*
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { AudioPlayer } from './AudioPlayer';
import { vi, describe, it, expect } from 'vitest';
import '@testing-library/jest-dom';

// Mock the external dependencies
vi.mock('../services/songApi', () => ({
  getPresignedUrl: vi.fn().mockResolvedValue({ url: 'https://example.com/audio.mp3' })
}));

// Mock ResizeObserver
class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
window.ResizeObserver = ResizeObserver;

// Mock Audio
class MockAudio extends EventTarget {
  volume = 1;
  currentTime = 0;
  duration = 100;
  src = '';
  crossOrigin = '';

  constructor() {
    super();
    setTimeout(() => {
      this.dispatchEvent(new Event('canplay'));
      this.dispatchEvent(new Event('loadedmetadata'));
    }, 0);
  }

  addEventListener = vi.fn((event, handler) => {
    if (event === 'canplay' || event === 'loadedmetadata') {
      handler();
    }
  });
  removeEventListener = vi.fn();
  pause = vi.fn();
  play = vi.fn();
  load = vi.fn();
}
window.Audio = MockAudio as any;

describe('AudioPlayer', () => {
  it('renders title and artist', async () => {
    render(
      <AudioPlayer
        s3Uri="s3://bucket/key.mp3"
        title="Test Song"
        artist="Test Artist"
      />
    );

    // Wait for loading state to change
    await waitFor(() => {
      const titleElement = screen.getByText('Test Song');
      const artistElement = screen.getByText('Test Artist');
      expect(titleElement).toBeInTheDocument();
      expect(artistElement).toBeInTheDocument();
    });
  });

  it('handles error state', async () => {
    vi.mock('../services/songApi', () => ({
      getPresignedUrl: vi.fn().mockRejectedValue(new Error('Failed to load audio'))
    }));

    render(
      <AudioPlayer
        s3Uri="s3://bucket/key.mp3"
        title="Test Song"
        artist="Test Artist"
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Failed to load audio. Retrying...')).toBeInTheDocument();
    });
  });
});
*/ 