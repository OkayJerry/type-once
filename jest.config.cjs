/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
    preset: 'ts-jest/presets/js-with-ts',
    testEnvironment: 'jsdom',
  
    // Run after Jest installs its globals (expect, test, describe)
    setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],  // ← important! :contentReference[oaicite:7]{index=7}
  
    moduleNameMapper: {
      '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
      '^@xenova/transformers$':    '<rootDir>/__mocks__/transformersMock.js'
    },
  
    // Allow ts-jest to compile .js files too
    transformIgnorePatterns: []
  };
  