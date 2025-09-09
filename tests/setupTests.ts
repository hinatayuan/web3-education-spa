// Jest setup file for React component testing
import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';

// Polyfills for jsdom environment
if (typeof global.TextEncoder === 'undefined') {
  global.TextEncoder = TextEncoder;
}
if (typeof global.TextDecoder === 'undefined') {
  // @ts-ignore
  global.TextDecoder = TextDecoder as unknown as { new(label?: string, options?: any): TextDecoder };
}

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock Web3 相关全局变量（如有需要）
if (typeof window !== 'undefined') {
  if (!('ethereum' in window)) {
    // @ts-ignore
    window.ethereum = {
      request: jest.fn(),
      on: jest.fn(),
      removeListener: jest.fn(),
    };
  }
}