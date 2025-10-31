import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock environment variables
if (typeof process !== 'undefined') {
  process.env.NODE_ENV = 'test';
}

// Mock console methods to reduce noise in tests
if (typeof global !== 'undefined') {
  global.console = {
    ...console,
    log: vi.fn(),
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  };
}
