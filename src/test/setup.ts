import { vi } from 'vitest';

// Mock ResizeObserver
class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

// Mock window.ResizeObserver
window.ResizeObserver = ResizeObserver;

// Create a mock audio implementation
const createMockAudio = () => ({
  play: vi.fn().mockResolvedValue(undefined),
  pause: vi.fn(),
  load: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  currentTime: 0,
  duration: 0,
  volume: 1,
  src: '',
});

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

// Set up getters/setters for HTMLMediaElement properties
Object.defineProperties(window.HTMLMediaElement.prototype, {
  currentTime: {
    get: vi.fn(() => 0),
    set: vi.fn()
  },
  duration: {
    get: vi.fn(() => 0),
    set: vi.fn()
  },
  volume: {
    get: vi.fn(() => 1),
    set: vi.fn()
  },
  src: {
    get: vi.fn(() => ''),
    set: vi.fn()
  }
});

// Mock Audio constructor
global.Audio = vi.fn(() => createMockAudio()) as unknown as typeof Audio;

// Mock URL.createObjectURL
URL.createObjectURL = vi.fn(() => 'mock-url');

// Mock fetch
global.fetch = vi.fn(); 