/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'jsdom',                   // or 'jest-environment-jsdom'
    moduleFileExtensions: ['ts','tsx','js','jsx','json','node'],
    transform: {
      '^.+\\.(ts|tsx)$': 'ts-jest'
    },
    setupFiles: [
        'jest-webextension-mock'
    ],
    setupFilesAfterEnv: [
        '<rootDir>/src/setupTests.ts'
    ],
    moduleNameMapper: {
      '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
      '\\.(gif|ttf|eot|svg|png)$': '<rootDir>/__mocks__/fileMock.js'
    },
    testMatch: ['**/__tests__/**/*.+(ts|tsx|js)', '**/?(*.)+(spec|test).+(ts|tsx|js)']
  };
  