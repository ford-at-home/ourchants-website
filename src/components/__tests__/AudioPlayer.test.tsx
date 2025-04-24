/**
 * AudioPlayer Component Tests
 * 
 * IMPORTANT CONTEXT FOR FUTURE DEVELOPERS/AI:
 * 
 * 1. TESTING PHILOSOPHY:
 *    - These tests verify the actual user experience, not implementation details
 *    - We test what users see and interact with, not internal state
 *    - Error states and edge cases are critical to test
 * 
 * 2. CRITICAL LESSONS LEARNED:
 *    - DO NOT modify the source component to match these tests
 *    - Tests should adapt to the component's behavior, not vice versa
 *    - Complex async operations need proper mocking and waiting
 *    - Error states are as important as happy paths
 * 
 * 3. COMMON PITFALLS TO AVOID:
 *    - Don't make tests brittle by testing implementation details
 *    - Don't simplify error handling for easier testing
 *    - Don't add unnecessary complexity to support testing
 *    - Don't ignore edge cases and error states
 * 
 * 4. TESTING PATTERNS:
 *    - Use proper HTMLMediaElement mocking
 *    - Test user interactions, not internal state
 *    - Verify error messages and recovery
 *    - Test accessibility features
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AudioPlayer } from '../AudioPlayer';
import '@testing-library/jest-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import '../../test/setup';

// Get access to the mock functions
const mockPlay = window.HTMLMediaElement.prototype.play as unknown as ReturnType<typeof vi.fn>;
const mockLoad = window.HTMLMediaElement.prototype.load as unknown as ReturnType<typeof vi.fn>;

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
    // Reset HTMLMediaElement mock implementations
    mockPlay.mockResolvedValue(undefined);
    mockLoad.mockImplementation(() => {});
  });

  it('renders song details', () => {
    render(<AudioPlayer {...mockProps} />);
    expect(screen.getByText('Test Song')).toBeInTheDocument();
    expect(screen.getByText('Test Artist')).toBeInTheDocument();
  });

  it('handles play/pause state changes', async () => {
    render(<AudioPlayer {...mockProps} />);
    
    // Initial play
    const playButton = screen.getByRole('button', { name: /play/i });
    await fireEvent.click(playButton);
    
    await waitFor(() => {
      expect(mockPlay).toHaveBeenCalled();
      expect(mockProps.onPlay).toHaveBeenCalled();
    });

    // Pause
    const pauseButton = screen.getByRole('button', { name: /pause/i });
    await fireEvent.click(pauseButton);
    
    expect(window.HTMLMediaElement.prototype.pause).toHaveBeenCalled();
    expect(mockProps.onPause).toHaveBeenCalled();
  });

  it('handles volume changes', async () => {
    render(<AudioPlayer {...mockProps} />);
    const volumeSlider = screen.getByRole('slider', { name: /volume/i });
    
    await fireEvent.change(volumeSlider, { target: { value: '50' } });
    
    const volumeSetter = Object.getOwnPropertyDescriptor(window.HTMLMediaElement.prototype, 'volume')?.set;
    expect(volumeSetter).toHaveBeenCalled();
  });

  it('handles time changes', async () => {
    render(<AudioPlayer {...mockProps} />);
    const timeSlider = screen.getByRole('slider', { name: /playback progress/i });
    
    await fireEvent.change(timeSlider, { target: { value: '30' } });
    
    const timeSetter = Object.getOwnPropertyDescriptor(window.HTMLMediaElement.prototype, 'currentTime')?.set;
    expect(timeSetter).toHaveBeenCalled();
  });

  it('handles skip next/previous', async () => {
    render(<AudioPlayer {...mockProps} />);
    
    await fireEvent.click(screen.getByRole('button', { name: /next track/i }));
    expect(mockProps.onSkipNext).toHaveBeenCalled();
    
    await fireEvent.click(screen.getByRole('button', { name: /previous track/i }));
    expect(mockProps.onSkipPrevious).toHaveBeenCalled();
  });

  it('handles loop mode changes', async () => {
    render(<AudioPlayer {...mockProps} />);
    const loopButton = screen.getByRole('button', { name: /loop/i });
    
    // Click through loop modes: off -> all -> one -> off
    await fireEvent.click(loopButton);
    expect(loopButton).toHaveAttribute('aria-label', expect.stringMatching(/loop all/i));
    
    await fireEvent.click(loopButton);
    expect(loopButton).toHaveAttribute('aria-label', expect.stringMatching(/loop one/i));
    
    await fireEvent.click(loopButton);
    expect(loopButton).toHaveAttribute('aria-label', expect.stringMatching(/loop off/i));
  });

  it('handles error state', async () => {
    // Mock a failed audio load
    mockLoad.mockImplementationOnce(() => {
      throw new Error('Failed to load audio');
    });

    render(<AudioPlayer {...mockProps} />);
    
    await waitFor(() => {
      expect(screen.getByText(/error loading audio/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
    });
  });

  it('handles retry after error', async () => {
    // Mock initial failure then success
    mockLoad
      .mockImplementationOnce(() => {
        throw new Error('Failed to load audio');
      })
      .mockImplementationOnce(() => {});

    render(<AudioPlayer {...mockProps} />);
    
    // Wait for error state
    await waitFor(() => {
      expect(screen.getByText(/error loading audio/i)).toBeInTheDocument();
    });

    // Click retry
    const retryButton = screen.getByRole('button', { name: /retry/i });
    await fireEvent.click(retryButton);

    // Verify retry attempt
    expect(mockLoad).toHaveBeenCalledTimes(2);
    
    // Wait for success state
    await waitFor(() => {
      expect(screen.queryByText(/error loading audio/i)).not.toBeInTheDocument();
    });
  });
}); 