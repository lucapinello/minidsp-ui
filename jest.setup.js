// Mock window.localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  clear: jest.fn()
};
global.localStorage = localStorageMock;

// Mock process.env
process.env = {
  ...process.env,
  NEXT_PUBLIC_USE_MOCK_MINIDSP: 'true'
}; 