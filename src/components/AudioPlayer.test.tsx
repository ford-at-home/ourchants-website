import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { AudioPlayer } from './AudioPlayer';
import { vi } from 'vitest';

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
  constructor() {
    super();
    setTimeout(() => {
      this.dispatchEvent(new Event('canplay'));
    }, 0);
  }
  addEventListener = vi.fn((event, handler) => {
    if (event === 'canplay') {
      handler();
    }
  });
  removeEventListener = vi.fn();
  pause = vi.fn();
  play = vi.fn();
  src = '';
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
      expect(screen.getByText('Test Song')).toBeInTheDocument();
    });
    expect(screen.getByText('Test Artist')).toBeInTheDocument();
  });
}); 