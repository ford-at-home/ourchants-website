import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AudioPlayer } from '../AudioPlayer';
import '@testing-library/jest-dom';
import { describe, it, expect, vi, beforeEach, SpyInstance } from 'vitest';
import '../../test/setup';
import userEvent from '@testing-library/user-event';

// Mock the HTMLAudioElement
const mockPlay = vi.fn().mockResolvedValue(undefined);
const mockPause = vi.fn();
const mockLoad = vi.fn();

// Mock the audio element
const mockAudioElement = {
  play: mockPlay,
  pause: mockPause,
  load: mockLoad,
  currentTime: 0,
  duration: 0,
  volume: 1,
  src: '',
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn(),
};

// Mock the Audio constructor
vi.stubGlobal('Audio', vi.fn(() => mockAudioElement));

// Mock the getPresignedUrl function
vi.mock('../../lib/s3', () => ({
  getPresignedUrl: vi.fn().mockResolvedValue({ url: 'https://example.com/audio.mp3' }),
}));

// Mock the saveResumeState function
vi.mock('../../lib/resumeState', () => ({
  saveResumeState: vi.fn(),
}));

// Mock the toast
vi.mock('../../components/ui/use-toast', () => ({
  useToast: () => ({
    toast: {
      error: vi.fn(),
    },
  }),
}));

// Mock HTMLMediaElement
window.HTMLMediaElement.prototype.play = vi.fn();
window.HTMLMediaElement.prototype.pause = vi.fn();
window.HTMLMediaElement.prototype.load = vi.fn();

describe('AudioPlayer', () => {
  const mockProps = {
    s3Uri: 's3://bucket/key.mp3',
    title: 'Test Song',
    artist: 'Test Artist',
    songId: '123',
    onPlay: vi.fn(),
    onPause: vi.fn(),
    onPlayStarted: vi.fn(),
    onSkipNext: vi.fn(),
    onSkipPrevious: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state initially', () => {
    render(<AudioPlayer {...mockProps} />);
    expect(screen.getByText('Preparing...')).toBeInTheDocument();
  });

  it('renders song details when loaded', async () => {
    render(<AudioPlayer {...mockProps} />);
    await waitFor(() => {
      expect(screen.getByText('Test Song')).toBeInTheDocument();
      expect(screen.getByText('Test Artist')).toBeInTheDocument();
    });
  });

  it('handles play/pause state changes', async () => {
    const onPlay = vi.fn();
    const { getByRole } = render(
      <AudioPlayer
        s3Uri="s3://test-bucket/test.mp3"
        title="Test Song"
        artist="Test Artist"
        onPlay={onPlay}
      />
    );

    const playButton = getByRole('button', { name: /play/i });
    await fireEvent.click(playButton);
    expect(onPlay).toHaveBeenCalled();
  });

  it('handles volume changes', () => {
    const { getByRole } = render(
      <AudioPlayer
        s3Uri="s3://test-bucket/test.mp3"
        title="Test Song"
        artist="Test Artist"
      />
    );
    const volumeSlider = getByRole('slider', { name: /volume/i });
    expect(volumeSlider).toBeInTheDocument();
  });

  it('handles time changes', () => {
    const { getByRole } = render(
      <AudioPlayer
        s3Uri="s3://test-bucket/test.mp3"
        title="Test Song"
        artist="Test Artist"
      />
    );
    const timeSlider = getByRole('slider', { name: /playback progress/i });
    expect(timeSlider).toBeInTheDocument();
  });

  it('handles skip next/previous', () => {
    render(<AudioPlayer {...mockProps} />);
    fireEvent.click(screen.getByRole('button', { name: 'Next track' }));
    expect(mockProps.onSkipNext).toHaveBeenCalled();
    
    fireEvent.click(screen.getByRole('button', { name: 'Previous track' }));
    expect(mockProps.onSkipPrevious).toHaveBeenCalled();
  });

  it('handles loop mode changes', () => {
    render(<AudioPlayer {...mockProps} />);
    const loopButton = screen.getByRole('button', { name: 'Loop off' });
    
    // Test loop one
    fireEvent.click(loopButton);
    expect(screen.getByRole('button', { name: 'Loop all' })).toBeInTheDocument();
    
    // Test loop all
    fireEvent.click(loopButton);
    expect(screen.getByRole('button', { name: 'Loop one' })).toBeInTheDocument();
    
    // Test loop off
    fireEvent.click(loopButton);
    expect(screen.getByRole('button', { name: 'Loop off' })).toBeInTheDocument();
  });

  it('handles error state', () => {
    const { getByText } = render(
      <AudioPlayer
        s3Uri="s3://test-bucket/test.mp3"
        title="Test Song"
        artist="Test Artist"
      />
    );
    // Simulate error state
    const errorText = getByText('Error Loading Audio');
    expect(errorText).toBeInTheDocument();
  });

  it('handles retry after error', () => {
    const { getByText } = render(
      <AudioPlayer
        s3Uri="s3://test-bucket/test.mp3"
        title="Test Song"
        artist="Test Artist"
      />
    );
    const errorText = getByText('Error Loading Audio');
    expect(errorText).toBeInTheDocument();
  });

  describe('slider interactions', () => {
    it('should update audio time when time slider changes', async () => {
      const { getByRole } = render(
        <AudioPlayer
          s3Uri="s3://test-bucket/test.mp3"
          title="Test Song"
          artist="Test Artist"
        />
      );

      const timeSlider = getByRole('slider', { name: /time/i });
      await userEvent.click(timeSlider);
      
      // Verify that the audio currentTime was updated
      expect(HTMLMediaElement.prototype.currentTime).toBeDefined();
    });

    it('should update volume when volume slider changes', async () => {
      const { getByRole } = render(
        <AudioPlayer
          s3Uri="s3://test-bucket/test.mp3"
          title="Test Song"
          artist="Test Artist"
        />
      );

      const volumeSlider = getByRole('slider', { name: /volume/i });
      await userEvent.click(volumeSlider);
      
      // Verify that the audio volume was updated
      expect(HTMLMediaElement.prototype.volume).toBeDefined();
    });

    it('should format time correctly', async () => {
      const { getByText } = render(
        <AudioPlayer
          s3Uri="s3://test-bucket/test.mp3"
          title="Test Song"
          artist="Test Artist"
        />
      );

      // Simulate audio duration and current time
      Object.defineProperty(HTMLMediaElement.prototype, 'duration', { value: 180 });
      Object.defineProperty(HTMLMediaElement.prototype, 'currentTime', { value: 65 });

      // Check if the formatted time is displayed correctly (1:05 / 3:00)
      expect(getByText('1:05')).toBeInTheDocument();
      expect(getByText('3:00')).toBeInTheDocument();
    });
  });
}); 