import '@testing-library/jest-dom';

// 设置Jest DOM匹配器
expect.extend({
  toBeInTheDocument: (received) => {
    const isInDocument = received && document.body.contains(received);
    return {
      message: () => `expected element ${isInDocument ? 'not ' : ''}to be in document`,
      pass: isInDocument,
    };
  },
});

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

// Mock window.ethereum
global.window.ethereum = {
  request: jest.fn(),
  on: jest.fn(),
  removeListener: jest.fn(),
  isMetaMask: true,
};

// 清理函数
afterEach(() => {
  jest.clearAllMocks();
  document.body.innerHTML = '';
});