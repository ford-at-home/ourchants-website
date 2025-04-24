import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AudioPlayer } from '../AudioPlayer';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import '@testing-library/jest-dom';
import '../../test/setup';

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

  it('renders with valid s3Uri', () => {
    render(
      <AudioPlayer
        s3Uri="s3://bucket/key"
        title="Test Song"
        artist="Test Artist"
      />
    );
    expect(screen.getByText('Test Song')).toBeInTheDocument();
    expect(screen.getByText('Test Artist')).toBeInTheDocument();
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
        shouldPlay={false}
      />
    );

    const playButton = screen.getByRole('button', { name: /play/i });
    fireEvent.click(playButton);
    expect(onPlay).toHaveBeenCalled();

    // Update shouldPlay prop
    render(
      <AudioPlayer
        s3Uri="s3://bucket/key"
        title="Test Song"
        artist="Test Artist"
        onPlay={onPlay}
        onPause={onPause}
        shouldPlay={true}
      />
    );

    const pauseButton = screen.getByRole('button', { name: /pause/i });
    fireEvent.click(pauseButton);
    expect(onPause).toHaveBeenCalled();
  });
}); 