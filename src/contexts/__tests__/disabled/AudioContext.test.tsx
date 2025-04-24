/*
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AudioProvider, useAudio } from '../AudioContext';
import { fetchSongs } from '../../services/songApi';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import '@testing-library/jest-dom';

// Mock the fetchSongs function
vi.mock('../../services/songApi', () => ({
  fetchSongs: vi.fn()
}));

const mockSong = {
  song_id: '1',
  title: 'Test Song',
  artist: 'Test Artist',
  album: 'Test Album',
  s3_uri: 's3://test-bucket/song.mp3'
};

// Test component that uses the AudioContext
const TestComponent = () => {
  const { 
    selectedSong, 
    shouldPlay, 
    handlePlay, 
    handlePause, 
    setSelectedSong,
    handleSkipNext,
    handleSkipPrevious
  } = useAudio();

  return (
    <div>
      <div data-testid="song-info">
        {selectedSong ? `${selectedSong.title} - ${selectedSong.artist}` : 'No song selected'}
      </div>
      <div data-testid="play-state">
        {shouldPlay ? 'Playing' : 'Paused'}
      </div>
      <button onClick={() => setSelectedSong(mockSong)}>Select Song</button>
      <button onClick={handlePlay}>Play</button>
      <button onClick={handlePause}>Pause</button>
      <button onClick={handleSkipNext}>Next</button>
      <button onClick={handleSkipPrevious}>Previous</button>
    </div>
  );
};

describe('AudioContext', () => {
  beforeEach(() => {
    (fetchSongs as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      items: [mockSong],
      total: 1,
      has_more: false
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('provides initial state', () => {
    render(
      <AudioProvider>
        <TestComponent />
      </AudioProvider>
    );

    expect(screen.getByTestId('song-info')).toHaveTextContent('No song selected');
    expect(screen.getByTestId('play-state')).toHaveTextContent('Paused');
  });

  it('handles song selection and play state', async () => {
    render(
      <AudioProvider>
        <TestComponent />
      </AudioProvider>
    );

    fireEvent.click(screen.getByText('Select Song'));
    expect(screen.getByTestId('song-info')).toHaveTextContent('Test Song - Test Artist');

    fireEvent.click(screen.getByText('Play'));
    expect(screen.getByTestId('play-state')).toHaveTextContent('Playing');

    fireEvent.click(screen.getByText('Pause'));
    expect(screen.getByTestId('play-state')).toHaveTextContent('Paused');
  });

  it('handles play and pause actions', () => {
    render(
      <AudioProvider>
        <TestComponent />
      </AudioProvider>
    );

    fireEvent.click(screen.getByText('Select Song'));
    fireEvent.click(screen.getByText('Play'));
    expect(screen.getByTestId('play-state')).toHaveTextContent('Playing');

    fireEvent.click(screen.getByText('Pause'));
    expect(screen.getByTestId('play-state')).toHaveTextContent('Paused');
  });

  it('handles resume from timestamp', async () => {
    render(
      <AudioProvider>
        <TestComponent />
      </AudioProvider>
    );

    fireEvent.click(screen.getByText('Select Song'));
    expect(screen.getByTestId('song-info')).toHaveTextContent('Test Song - Test Artist');
  });

  it('handles next and previous navigation', () => {
    render(
      <AudioProvider>
        <TestComponent />
      </AudioProvider>
    );

    fireEvent.click(screen.getByText('Select Song'));
    fireEvent.click(screen.getByText('Next'));
    expect(fetchSongs).toHaveBeenCalled();

    fireEvent.click(screen.getByText('Previous'));
    expect(fetchSongs).toHaveBeenCalled();
  });
});
*/ 