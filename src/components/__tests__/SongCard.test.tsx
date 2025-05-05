import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { SongCard } from '../SongCard';

// Mock the ShareButton component
vi.mock('../ShareButton', () => ({
  ShareButton: ({ songId }: { songId: string }) => (
    <button data-testid="mock-share-button">Share {songId}</button>
  ),
}));

describe('SongCard', () => {
  const mockProps = {
    title: 'Test Song',
    artist: 'Test Artist',
    songId: 'test-123',
    onClick: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders song information correctly', () => {
    render(<SongCard {...mockProps} />);
    
    expect(screen.getByText(mockProps.title)).toBeInTheDocument();
    expect(screen.getByText(mockProps.artist)).toBeInTheDocument();
    expect(screen.getByTestId('mock-share-button')).toBeInTheDocument();
  });

  it('has correct id attribute', () => {
    render(<SongCard {...mockProps} />);
    const card = screen.getByTestId(`mock-song-card-${mockProps.songId}`);
    expect(card).toHaveAttribute('id', mockProps.songId);
  });

  it('calls onClick when clicked', () => {
    render(<SongCard {...mockProps} />);
    const card = screen.getByTestId(`mock-song-card-${mockProps.songId}`);
    
    fireEvent.click(card);
    expect(mockProps.onClick).toHaveBeenCalledTimes(1);
  });

  it('calls onClick when Enter key is pressed', () => {
    render(<SongCard {...mockProps} />);
    const card = screen.getByTestId(`mock-song-card-${mockProps.songId}`);
    
    fireEvent.keyDown(card, { key: 'Enter' });
    expect(mockProps.onClick).toHaveBeenCalledTimes(1);
  });

  it('calls onClick when Space key is pressed', () => {
    render(<SongCard {...mockProps} />);
    const card = screen.getByTestId(`mock-song-card-${mockProps.songId}`);
    
    fireEvent.keyDown(card, { key: ' ' });
    expect(mockProps.onClick).toHaveBeenCalledTimes(1);
  });

  it('does not call onClick when other keys are pressed', () => {
    render(<SongCard {...mockProps} />);
    const card = screen.getByTestId(`mock-song-card-${mockProps.songId}`);
    
    fireEvent.keyDown(card, { key: 'A' });
    expect(mockProps.onClick).not.toHaveBeenCalled();
  });
}); 