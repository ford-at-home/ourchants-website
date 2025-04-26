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
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getPresignedUrl } from '../../services/songApi';

// Mock the getPresignedUrl function
vi.mock('../../services/songApi', () => ({
  getPresignedUrl: vi.fn()
}));

describe('AudioPlayer', () => {
  const mockProps = {
    s3Uri: 's3://test-bucket/test-song.mp3',
    title: 'Test Song',
    artist: 'Test Artist',
    songId: '123',
    shouldPlay: false,
    onPlay: vi.fn(),
    onPause: vi.fn(),
    onSkipNext: vi.fn(),
    onSkipPrevious: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (getPresignedUrl as any).mockResolvedValue({ url: 'https://test-url.com/audio.mp3' });
  });

  it('renders loading state initially', () => {
    render(<AudioPlayer {...mockProps} />);
    expect(screen.getByText(/loading audio/i)).toBeInTheDocument();
  });

  it('renders error state when presigned URL fetch fails', async () => {
    (getPresignedUrl as any).mockRejectedValue(new Error('Failed to get presigned URL'));
    
    render(<AudioPlayer {...mockProps} />);
    
    await waitFor(() => {
      expect(screen.getByText(/failed to load audio/i)).toBeInTheDocument();
    });
  });

  it('renders song details after loading', async () => {
    render(<AudioPlayer {...mockProps} />);
    
    // First verify loading state
    expect(screen.getByText(/loading audio/i)).toBeInTheDocument();
    
    // Then wait for and verify song details
    await waitFor(() => {
      expect(screen.getByText(mockProps.title)).toBeInTheDocument();
      expect(screen.getByText(mockProps.artist)).toBeInTheDocument();
    });
  });

  it('calls onPlay when play button is clicked', async () => {
    render(<AudioPlayer {...mockProps} />);
    
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /play/i })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /play/i }));
    expect(mockProps.onPlay).toHaveBeenCalled();
  });

  it('calls onPause when pause button is clicked', async () => {
    render(<AudioPlayer {...mockProps} shouldPlay={true} />);
    
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /pause/i })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /pause/i }));
    expect(mockProps.onPause).toHaveBeenCalled();
  });

  it('calls onSkipNext when next button is clicked', async () => {
    render(<AudioPlayer {...mockProps} />);
    
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /next/i })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /next/i }));
    expect(mockProps.onSkipNext).toHaveBeenCalled();
  });

  it('calls onSkipPrevious when previous button is clicked', async () => {
    render(<AudioPlayer {...mockProps} />);
    
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /previous/i })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /previous/i }));
    expect(mockProps.onSkipPrevious).toHaveBeenCalled();
  });

  it('handles audio error events', async () => {
    render(<AudioPlayer {...mockProps} />);
    
    await waitFor(() => {
      const audio = screen.getByRole('audio') as HTMLAudioElement;
      expect(audio).toBeInTheDocument();
    });

    const audio = screen.getByRole('audio') as HTMLAudioElement;
    fireEvent.error(audio);

    await waitFor(() => {
      expect(screen.getByText(/failed to load audio/i)).toBeInTheDocument();
    });
  });

  it('handles invalid S3 URI format', async () => {
    (getPresignedUrl as any).mockRejectedValue(new Error('Invalid S3 URI format'));
    
    render(<AudioPlayer {...mockProps} s3Uri="invalid-uri" />);
    
    await waitFor(() => {
      expect(screen.getByText(/failed to load audio/i)).toBeInTheDocument();
    });
  });
}); 