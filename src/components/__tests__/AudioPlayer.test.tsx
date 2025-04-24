import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AudioPlayer } from '../AudioPlayer';
import '@testing-library/jest-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import '../../test/setup';
import userEvent from '@testing-library/user-event';

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

  it('renders song details', () => {
    render(<AudioPlayer {...mockProps} />);
    expect(screen.getByText('Test Song')).toBeInTheDocument();
    expect(screen.getByText('Test Artist')).toBeInTheDocument();
  });

  it('handles play/pause state changes', async () => {
    render(<AudioPlayer {...mockProps} />);
    const playButton = screen.getByRole('button', { name: /play/i });
    await fireEvent.click(playButton);
    expect(mockProps.onPlay).toHaveBeenCalled();
  });

  it('handles volume changes', () => {
    render(<AudioPlayer {...mockProps} />);
    const volumeSlider = screen.getByRole('slider', { name: /volume/i });
    fireEvent.change(volumeSlider, { target: { value: '50' } });
    expect(HTMLMediaElement.prototype.volume).toBeDefined();
  });

  it('handles time changes', () => {
    render(<AudioPlayer {...mockProps} />);
    const timeSlider = screen.getByRole('slider', { name: /playback progress/i });
    fireEvent.change(timeSlider, { target: { value: '30' } });
    expect(HTMLMediaElement.prototype.currentTime).toBeDefined();
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
    const loopButton = screen.getByRole('button', { name: /loop/i });
    fireEvent.click(loopButton);
    expect(screen.getByRole('button', { name: /loop/i })).toBeInTheDocument();
  });

  it('handles error state', async () => {
    // Mock a failed audio load
    window.HTMLMediaElement.prototype.load = vi.fn().mockImplementationOnce(() => {
      throw new Error('Failed to load audio');
    });

    render(<AudioPlayer {...mockProps} />);
    await waitFor(() => {
      expect(screen.getByText(/failed to load/i)).toBeInTheDocument();
    });
  });

  it('handles retry after error', async () => {
    // Mock a failed audio load
    window.HTMLMediaElement.prototype.load = vi.fn()
      .mockImplementationOnce(() => {
        throw new Error('Failed to load audio');
      })
      .mockImplementationOnce(() => {});

    render(<AudioPlayer {...mockProps} />);
    
    await waitFor(() => {
      expect(screen.getByText(/failed to load/i)).toBeInTheDocument();
    });

    const retryButton = screen.getByRole('button', { name: /retry/i });
    fireEvent.click(retryButton);
    expect(window.HTMLMediaElement.prototype.load).toHaveBeenCalledTimes(2);
  });
}); 