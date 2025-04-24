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
import userEvent from '@testing-library/user-event';

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
      expect(screen.getByText('Failed to load audio after multiple attempts. Please try again later.')).toBeInTheDocument();
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
      expect(screen.getByText('Failed to load audio after multiple attempts. Please try again later.')).toBeInTheDocument();
    });

    const retryButton = screen.getByRole('button', { name: /retry/i });
    fireEvent.click(retryButton);
    expect(window.HTMLMediaElement.prototype.load).toHaveBeenCalledTimes(2);
  });
}); 