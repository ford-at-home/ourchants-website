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
import { render, screen, fireEvent } from '@testing-library/react';
import { AudioPlayer } from '../AudioPlayer';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getPresignedUrl } from '../../services/songApi';

// Mock the getPresignedUrl function
vi.mock('../../services/songApi', () => ({
  getPresignedUrl: vi.fn().mockResolvedValue({ url: 'https://test-url.com/audio.mp3' })
}));

// Mock HTMLMediaElement methods and state
const mockAudio = {
  play: vi.fn().mockResolvedValue(undefined),
  pause: vi.fn(),
  load: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  currentTime: 0,
  duration: 0,
  volume: 1,
  src: '',
  error: null as MediaError | null,
  readyState: 4,
  networkState: 2,
  dispatchEvent: vi.fn(),
  loop: false
};

// Keep track of the current mock instance
let currentMockAudio = mockAudio;

// Mock the Audio constructor
vi.stubGlobal('Audio', vi.fn().mockImplementation(() => {
  currentMockAudio = { ...mockAudio };
  return currentMockAudio;
}));

// Mock ResizeObserver
class MockResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

vi.stubGlobal('ResizeObserver', MockResizeObserver);

const mockProps = {
  s3Uri: 's3://ourchants-songs/test-song.mp3',
  title: 'Test Song',
  artist: 'Test Artist',
  songId: '123',
  shouldPlay: false,
  onPlay: vi.fn(),
  onPause: vi.fn(),
  initialTimestamp: 0
} as const;

describe('AudioPlayer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    currentMockAudio = { ...mockAudio };
  });

  it('renders song details', () => {
    render(<AudioPlayer {...mockProps} />);
    expect(screen.getByText(mockProps.title)).toBeInTheDocument();
    expect(screen.getByText(mockProps.artist)).toBeInTheDocument();
  });

  it('displays correct time format', () => {
    render(<AudioPlayer {...mockProps} />);
    
    // Initial time should be 0:00 for current time and duration
    const timeElements = screen.getAllByText('0:00');
    expect(timeElements).toHaveLength(2);
    expect(timeElements[0]).toHaveClass('text-muted-foreground'); // Current time
    expect(timeElements[1]).toHaveClass('text-muted-foreground'); // Duration
  });

  it('handles skip controls', () => {
    const onSkipNext = vi.fn();
    const onSkipPrevious = vi.fn();
    
    render(
      <AudioPlayer 
        {...mockProps} 
        onSkipNext={onSkipNext} 
        onSkipPrevious={onSkipPrevious}
      />
    );

    const nextButton = screen.getByLabelText('Next track');
    const previousButton = screen.getByLabelText('Previous track');

    fireEvent(nextButton, new MouseEvent('click', { bubbles: true }));
    expect(onSkipNext).toHaveBeenCalled();

    fireEvent(previousButton, new MouseEvent('click', { bubbles: true }));
    expect(onSkipPrevious).toHaveBeenCalled();
  });

  it('handles loop mode toggle', () => {
    render(<AudioPlayer {...mockProps} />);

    const loopButton = screen.getByLabelText('Loop off');
    
    // Test loop mode cycling
    fireEvent(loopButton, new MouseEvent('click', { bubbles: true }));
    expect(screen.getByLabelText('Loop all')).toBeInTheDocument();
    
    fireEvent(loopButton, new MouseEvent('click', { bubbles: true }));
    expect(screen.getByLabelText('Loop one')).toBeInTheDocument();
    expect(currentMockAudio.loop).toBe(true);
    
    fireEvent(loopButton, new MouseEvent('click', { bubbles: true }));
    expect(screen.getByLabelText('Loop off')).toBeInTheDocument();
    expect(currentMockAudio.loop).toBe(false);
  });

  it('handles loop all mode when song ends', () => {
    const onSkipNext = vi.fn();
    render(<AudioPlayer {...mockProps} onSkipNext={onSkipNext} />);

    // Set to loop all mode
    const loopButton = screen.getByLabelText('Loop off');
    fireEvent(loopButton, new MouseEvent('click', { bubbles: true }));
    expect(screen.getByLabelText('Loop all')).toBeInTheDocument();

    // Verify event listener was added
    expect(currentMockAudio.addEventListener).toHaveBeenCalledWith('ended', expect.any(Function));

    // Get the event listener function
    const endedListener = currentMockAudio.addEventListener.mock.calls.find(
      call => call[0] === 'ended'
    )?.[1];

    // Simulate song ending by calling the event listener directly
    if (endedListener) {
      endedListener();
    }

    // Verify onSkipNext was called
    expect(onSkipNext).toHaveBeenCalled();
  });
}); 