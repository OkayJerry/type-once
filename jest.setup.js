import '@testing-library/jest-dom';  

// Stub the Chrome extension APIs so tests of your React app and content scripts won’t throw
global.chrome = {
  storage: {
    local: {
      get:    jest.fn((keys, cb) => cb({ submissions: [] })),
      set:    jest.fn()
    },
    onChanged: {
      addListener:    jest.fn(),
      removeListener: jest.fn()
    }
  },
  runtime: { lastError: null }
};