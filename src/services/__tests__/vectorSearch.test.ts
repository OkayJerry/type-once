// src/services/__tests__/vectorSearch.test.ts

import { findBestMatch } from '../vectorSearch';
import { StoredEntry } from '../../types';

// Mock the EmbeddingService to return predictable vectors for our test.
jest.mock('../embedding', () => ({
  EmbeddingService: {
    getInstance: jest.fn(() => ({
      embed: jest.fn().mockImplementation(async (text: string) => {
        if (text === 'email address') return new Float32Array([1, 0, 0]);
        if (text === 'e-mail') return new Float32Array([0.9, 0.1, 0]); // Very similar
        if (text === 'phone number') return new Float32Array([0, 1, 0]);
        return new Float32Array([0, 0, 1]); // Default for other text
      }),
    })),
  },
}));

describe('findBestMatch', () => {
  const storedEntries: StoredEntry[] = [
    { question: 'email address', answer: 'test@example.com', embedding: [1, 0, 0] },
    { question: 'phone number', answer: '123-456-7890', embedding: [0, 1, 0] },
  ];

  it('should find the best matching entry based on semantic similarity', async () => {
    const newQuestion = 'e-mail'; // This is semantically similar to 'email address'
    const bestMatch = await findBestMatch(newQuestion, storedEntries);

    expect(bestMatch).not.toBeNull();
    expect(bestMatch?.question).toBe('email address');
    expect(bestMatch?.answer).toBe('test@example.com');
  });

  it('should return null if no suitable match is found (below similarity threshold)', async () => {
    const newQuestion = 'favorite color'; // This is not similar to anything stored
    const bestMatch = await findBestMatch(newQuestion, storedEntries);

    expect(bestMatch).toBeNull();
  });
});
