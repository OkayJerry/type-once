// src/services/__tests__/storage.test.ts

import { StorageService } from '../storage';
import { StoredEntry } from '../../types';

// Create a stable mock function for `embed` that we can reference in our tests.
const mockEmbed = jest.fn().mockResolvedValue(new Float32Array([0.1, 0.2, 0.3]));

// Mock the EmbeddingService to return our stable mock function.
jest.mock('../embedding', () => ({
  EmbeddingService: {
    getInstance: jest.fn(() => ({
      embed: mockEmbed,
    })),
  },
}));

// Mock the chrome.storage.local API
const chromeStorageMock = (() => {
  let store: { [key: string]: any } = {};
  return {
    get: jest.fn((_keys, callback) => callback({ entries: store.entries || [] })),
    set: jest.fn((items, callback) => {
      store = { ...store, ...items };
      if (callback) callback();
    }),
    clear: () => {
      store = {};
    },
  };
})();

// Assign the mock to the global chrome object
beforeAll(() => {
  Object.defineProperty(global, 'chrome', {
    value: { storage: { local: chromeStorageMock } },
    writable: true,
  });
});

beforeEach(() => {
  chromeStorageMock.clear();
  jest.clearAllMocks();
});

describe('StorageService', () => {
  it('should get all stored entries', async () => {
    const mockEntries: StoredEntry[] = [{ question: 'q1', answer: 'a1', embedding: [1] }];
    chromeStorageMock.set({ entries: mockEntries }, () => {});
    
    const entries = await StorageService.getEntries();
    expect(entries).toEqual(mockEntries);
    expect(chromeStorageMock.get).toHaveBeenCalledWith('entries', expect.any(Function));
  });

  it('should add a new entry with its embedding', async () => {
    const newQuestion = 'new question';
    const newAnswer = 'new answer';

    await StorageService.addEntry(newQuestion, newAnswer);

    // Verify that our stable mock for the embedding service was called
    expect(mockEmbed).toHaveBeenCalledWith(newQuestion);

    // Verify that chrome.storage.set was called with the correct new entry structure
    expect(chromeStorageMock.set).toHaveBeenCalledWith(
      expect.objectContaining({
        entries: expect.arrayContaining([
          expect.objectContaining({
            question: newQuestion,
            answer: newAnswer,
            embedding: expect.any(Array), // Check that embedding is an array
          }),
        ]),
      }),
      expect.any(Function)
    );

    // Add a more specific check for the embedding values to handle floating-point precision
    const savedEntry = (chromeStorageMock.set.mock.calls[0][0] as any).entries[0];
    expect(savedEntry.embedding[0]).toBeCloseTo(0.1);
    expect(savedEntry.embedding[1]).toBeCloseTo(0.2);
    expect(savedEntry.embedding[2]).toBeCloseTo(0.3);
  });
});
