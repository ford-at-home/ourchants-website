// Mock ResizeObserver at the very top
class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

// Apply ResizeObserver mock at all levels
window.ResizeObserver = ResizeObserver;
global.ResizeObserver = ResizeObserver;
(global as any).ResizeObserver = ResizeObserver;
(global as any).window.ResizeObserver = ResizeObserver;

import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Extend HTMLMediaElement interface to include our helper method
declare global {
  interface HTMLMediaElement {
    _triggerEvent?: (type: string, event: Event) => void;
  }
}

// Create a mock audio implementation with proper event handling
const createMockAudio = () => {
  const listeners: { [key: string]: EventListenerOrEventListenerObject[] } = {};
  
  return {
    play: vi.fn().mockResolvedValue(undefined),
    pause: vi.fn(),
    load: vi.fn(),
    addEventListener: vi.fn((type: string, listener: EventListenerOrEventListenerObject) => {
      if (!listeners[type]) {
        listeners[type] = [];
      }
      listeners[type].push(listener);
    }),
    removeEventListener: vi.fn((type: string, listener: EventListenerOrEventListenerObject) => {
      if (listeners[type]) {
        listeners[type] = listeners[type].filter(l => l !== listener);
      }
    }),
    currentTime: 0,
    duration: 0,
    volume: 1,
    src: '',
    // Helper to trigger events
    _triggerEvent: (type: string, event: Event) => {
      if (listeners[type]) {
        listeners[type].forEach(listener => {
          if (typeof listener === 'function') {
            listener(event);
          } else {
            listener.handleEvent(event);
          }
        });
      }
    }
  };
};

// Create properly typed mock functions
const mockPlay = vi.fn().mockResolvedValue(undefined) as unknown as () => Promise<void>;
const mockPause = vi.fn() as unknown as () => void;
const mockLoad = vi.fn() as unknown as () => void;
const mockAddEventListener = vi.fn() as unknown as (type: string, listener: EventListenerOrEventListenerObject) => void;
const mockRemoveEventListener = vi.fn() as unknown as (type: string, listener: EventListenerOrEventListenerObject) => void;

// Mock HTMLMediaElement methods with proper types
Object.defineProperty(window.HTMLMediaElement.prototype, 'play', {
  configurable: true,
  value: mockPlay
});

Object.defineProperty(window.HTMLMediaElement.prototype, 'pause', {
  configurable: true,
  value: mockPause
});

Object.defineProperty(window.HTMLMediaElement.prototype, 'load', {
  configurable: true,
  value: mockLoad
});

Object.defineProperty(window.HTMLMediaElement.prototype, 'addEventListener', {
  configurable: true,
  value: mockAddEventListener
});

Object.defineProperty(window.HTMLMediaElement.prototype, 'removeEventListener', {
  configurable: true,
  value: mockRemoveEventListener
});

// Set up getters/setters for HTMLMediaElement properties with proper event triggering
Object.defineProperties(window.HTMLMediaElement.prototype, {
  currentTime: {
    get: vi.fn(() => 0),
    set: vi.fn((value: number) => {
      const event = new Event('timeupdate');
      window.HTMLMediaElement.prototype._triggerEvent?.('timeupdate', event);
    })
  },
  duration: {
    get: vi.fn(() => 0),
    set: vi.fn((value: number) => {
      const event = new Event('loadedmetadata');
      window.HTMLMediaElement.prototype._triggerEvent?.('loadedmetadata', event);
    })
  },
  volume: {
    get: vi.fn(() => 1),
    set: vi.fn()
  },
  src: {
    get: vi.fn(() => ''),
    set: vi.fn((value: string) => {
      if (value) {
        const event = new Event('canplay');
        window.HTMLMediaElement.prototype._triggerEvent?.('canplay', event);
      }
    })
  }
});

// Mock Audio constructor
global.Audio = vi.fn(() => createMockAudio()) as unknown as typeof Audio;

// Mock URL.createObjectURL
URL.createObjectURL = vi.fn(() => 'mock-url');

// Mock fetch
global.fetch = vi.fn();

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock HTMLMediaElement
window.HTMLMediaElement.prototype.play = vi.fn();
window.HTMLMediaElement.prototype.pause = vi.fn();
window.HTMLMediaElement.prototype.load = vi.fn(); 