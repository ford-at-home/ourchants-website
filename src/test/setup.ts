import { vi } from 'vitest';

// Mock ResizeObserver
class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

// Mock window.ResizeObserver
window.ResizeObserver = ResizeObserver;

// Mock Audio
const mockAudio = {
  play: vi.fn(),
  pause: vi.fn(),
  load: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  currentTime: 0,
  duration: 0,
  volume: 1,
  src: '',
};

// Mock Audio constructor
global.Audio = vi.fn(() => mockAudio);

// Mock URL.createObjectURL
URL.createObjectURL = vi.fn(() => 'mock-url');

// Mock fetch
global.fetch = vi.fn(); 