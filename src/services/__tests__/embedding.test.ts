// src/services/__tests__/embedding.test.ts

import { EmbeddingService } from '../embedding';

// Mock the transformers.js library to avoid downloading the real model during tests.
jest.mock('@xenova/transformers', () => ({
  pipeline: jest.fn().mockResolvedValue(
    // This mock function simulates the feature extractor itself.
    // It will be the resolved value of the pipeline() promise.
    jest.fn().mockImplementation((_text: string) => {
      // The real extractor returns a promise, so our mock should too.
      return Promise.resolve({
        data: new Float32Array(Array.from({ length: 384 }, (_, i) => i / 1000)),
        dims: [1, 384],
      });
    })
  ),
}));

describe('EmbeddingService', () => {
  // Before each test, we reset the singleton instance.
  // This is important to ensure that each test runs in a clean, isolated state
  // and that the initialize() method is called for each test.
  beforeEach(() => {
    // This is a common pattern for testing singletons.
    (EmbeddingService as any).instance = null;
  });

  it('should generate an embedding for a given text', async () => {
    const text = 'Hello, world!';
    const embedding = await EmbeddingService.getInstance().embed(text);

    // Check that the embedding is a Float32Array
    expect(embedding).toBeInstanceOf(Float32Array);
    // Check that it has the correct dimensions (based on our chosen model)
    expect(embedding.length).toBe(384);
    // Check a sample value to ensure the mock worked
    expect(embedding[0]).toBe(0);
    // Use toBeCloseTo for floating-point comparisons to avoid precision issues.
    expect(embedding[1]).toBeCloseTo(0.001);
  });

  it('should return the same instance when getInstance is called multiple times (Singleton pattern)', () => {
    const instance1 = EmbeddingService.getInstance();
    const instance2 = EmbeddingService.getInstance();
    expect(instance1).toBe(instance2);
  });
});
