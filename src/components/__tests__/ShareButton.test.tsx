import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { vi } from 'vitest';
import { ShareButton } from '../ShareButton';
import { toast } from 'sonner';

// Mock the toast module
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('ShareButton', () => {
  const mockSongId = 'test-song-123';
  const mockOrigin = 'http://localhost:3000';
  const mockClipboard = {
    writeText: vi.fn(),
  };

  beforeAll(() => {
    // Mock window.location.origin
    Object.defineProperty(window, 'location', {
      value: { origin: mockOrigin },
      writable: true,
    });

    // Mock navigator.clipboard
    Object.defineProperty(navigator, 'clipboard', {
      value: mockClipboard,
      writable: true,
    });
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly', () => {
    render(<ShareButton songId={mockSongId} />);
    const button = screen.getByRole('button', { name: /share song/i });
    expect(button).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const customClass = 'custom-class';
    render(<ShareButton songId={mockSongId} className={customClass} />);
    const button = screen.getByRole('button');
    expect(button.className).toContain(customClass);
  });

  describe('clipboard functionality', () => {
    it('copies link and shows success toast', async () => {
      mockClipboard.writeText.mockResolvedValueOnce(undefined);

      render(<ShareButton songId={mockSongId} />);
      const button = screen.getByRole('button');
      
      await act(async () => {
        await fireEvent.click(button);
      });
      
      const expectedUrl = `${mockOrigin}/songs#${mockSongId}`;
      expect(mockClipboard.writeText).toHaveBeenCalledWith(expectedUrl);
      expect(toast.success).toHaveBeenCalledWith('Link copied to clipboard!');
    });

    it('shows error toast when clipboard fails', async () => {
      mockClipboard.writeText.mockRejectedValueOnce(new Error('Clipboard error'));

      render(<ShareButton songId={mockSongId} />);
      const button = screen.getByRole('button');
      
      await act(async () => {
        await fireEvent.click(button);
      });
      
      expect(toast.error).toHaveBeenCalledWith('Failed to copy link');
    });
  });

  it('prevents event propagation', () => {
    const mockOnClick = vi.fn();
    render(
      <div onClick={mockOnClick}>
        <ShareButton songId={mockSongId} />
      </div>
    );
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    expect(mockOnClick).not.toHaveBeenCalled();
  });
}); 