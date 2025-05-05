import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { ShareIcon } from '../ShareIcon';

// Mock useToast hook
const mockToast = vi.fn();
vi.mock('../ui/use-toast', () => ({
  useToast: () => ({
    toast: mockToast,
  }),
}));

// Mock Radix UI Tooltip components
vi.mock('../ui/tooltip', () => ({
  TooltipProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  Tooltip: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  TooltipTrigger: ({ children, asChild }: { children: React.ReactNode, asChild?: boolean }) => <>{children}</>,
  TooltipContent: ({ children }: { children: React.ReactNode }) => <div data-testid="tooltip-content">{children}</div>,
}));

describe('ShareIcon', () => {
  const mockSongId = 'test-song-123';
  
  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();
    
    // Mock clipboard API
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn(() => Promise.resolve()),
      },
    });
    
    // Mock window.location
    Object.defineProperty(window, 'location', {
      value: {
        origin: 'https://example.com',
      },
      writable: true,
    });
  });

  it('renders a share button', () => {
    render(<ShareIcon songId={mockSongId} />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('copies URL to clipboard when clicked', async () => {
    render(<ShareIcon songId={mockSongId} />);
    
    const button = screen.getByRole('button');
    await fireEvent.click(button);

    const expectedUrl = 'https://example.com/songs#test-song-123';
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(expectedUrl);
    
    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: "Link copied!",
        description: "Share this link with others to play this song.",
        duration: 2000,
      });
    });
  });

  it('shows error toast when clipboard fails', async () => {
    // Mock clipboard failure
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn(() => Promise.reject(new Error('Clipboard error'))),
      },
    });

    render(<ShareIcon songId={mockSongId} />);
    
    const button = screen.getByRole('button');
    await fireEvent.click(button);

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: "Failed to copy link",
        description: "Please try again",
        variant: "destructive",
        duration: 2000,
      });
    });
  });
}); 