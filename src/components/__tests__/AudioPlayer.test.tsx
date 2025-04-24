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
    render(<AudioPlayer {...mockProps} shouldPlay={true} />);
    
    // Wait for the audio to be loaded and play to be called
    await waitFor(() => {
      expect(mockPlay).toHaveBeenCalled();
    });

    // Verify play state
    expect(mockProps.onPlayStarted).toHaveBeenCalled();

    // Change to pause state
    const playPauseButton = screen.getByRole('button', { name: /pause/i });
    fireEvent.click(playPauseButton);
    expect(mockPause).toHaveBeenCalled();
    expect(mockProps.onPause).toHaveBeenCalled();
  });

  it('handles volume changes', () => {
    render(<AudioPlayer {...mockProps} />);
    const volumeSlider = screen.getByRole('slider', { name: 'Volume' });
    fireEvent.change(volumeSlider, { target: { value: '50' } });
    expect(mockAudioElement.volume).toBe(0.5);
  });

  it('handles time changes', () => {
    render(<AudioPlayer {...mockProps} />);
    const timeSlider = screen.getByRole('slider', { name: 'Playback progress' });
    fireEvent.change(timeSlider, { target: { value: '30' } });
    expect(mockAudioElement.currentTime).toBe(30);
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

  it('handles error state', async () => {
    // Mock a failed audio load
    mockLoad.mockImplementationOnce(() => {
      throw new Error('Failed to load audio');
    });

    render(<AudioPlayer {...mockProps} />);
    
    await waitFor(() => {
      expect(screen.getByText('Error Loading Audio')).toBeInTheDocument();
    });
  });

  it('handles retry after error', async () => {
    // Mock a failed audio load
    mockLoad.mockImplementationOnce(() => {
      throw new Error('Failed to load audio');
    });

    render(<AudioPlayer {...mockProps} />);
    
    await waitFor(() => {
      expect(screen.getByText('Error Loading Audio')).toBeInTheDocument();
    });

    // Click retry button
    const retryButton = screen.getByTestId('retry-button');
    fireEvent.click(retryButton);
    expect(mockLoad).toHaveBeenCalledTimes(2);
  });
}); 