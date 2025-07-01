// src/services/__tests__/storage.test.ts

import { StorageService } from '../storage';
import { StoredEntry } from '../../types';

const mockEmbed = jest.fn().mockResolvedValue(new Float32Array([0.1, 0.2, 0.3]));

jest.mock('../embedding', () => ({
  EmbeddingService: {
    getInstance: jest.fn(() => ({
      embed: mockEmbed,
    })),
  },
}));

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
    getStore: () => store, // Helper to inspect the mock store
  };
})();

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
  const mockEntries: StoredEntry[] = [
    { question: 'q1', answer: 'a1', embedding: [1] },
    { question: 'q2', answer: 'a2', embedding: [2] },
  ];

  it('should get all stored entries', async () => {
    chromeStorageMock.set({ entries: mockEntries }, () => {});
    const entries = await StorageService.getEntries();
    expect(entries).toEqual(mockEntries);
  });

  it('should add a new entry with its embedding', async () => {
    await StorageService.addEntry('new question', 'new answer');
    expect(mockEmbed).toHaveBeenCalledWith('new question');
    const store = chromeStorageMock.getStore();
    expect(store.entries[0].question).toBe('new question');
    expect(store.entries[0].embedding).toEqual([0.10000000149011612, 0.20000000298023224, 0.30000001192092896]);
  });

  it('should delete an entry by its question', async () => {
    // 1. Start with two entries
    chromeStorageMock.set({ entries: mockEntries }, () => {});

    // 2. Delete one of them
    await StorageService.deleteEntry('q1');

    // 3. Verify that only the other entry remains
    const store = chromeStorageMock.getStore();
    expect(store.entries).toHaveLength(1);
    expect(store.entries[0].question).toBe('q2');
  });
});
