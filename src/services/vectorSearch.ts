// src/services/vectorSearch.ts

import { EmbeddingService } from './embedding';
import { StoredEntry } from '../types';

/**
 * Calculates the dot product of two vectors.
 */
function dotProduct(vecA: number[] | Float32Array, vecB: number[] | Float32Array): number {
  let product = 0;
  for (let i = 0; i < vecA.length; i++) {
    product += vecA[i] * vecB[i];
  }
  return product;
}

/**
 * Calculates the magnitude (or length) of a vector.
 */
function magnitude(vec: number[] | Float32Array): number {
  let sum = 0;
  for (let i = 0; i < vec.length; i++) {
    sum += vec[i] * vec[i];
  }
  return Math.sqrt(sum);
}

/**
 * Calculates the cosine similarity between two vectors.
 * Returns a value between -1 and 1, where 1 means identical.
 */
function cosineSimilarity(vecA: number[] | Float32Array, vecB: number[] | Float32Array): number {
  const product = dotProduct(vecA, vecB);
  const magA = magnitude(vecA);
  const magB = magnitude(vecB);
  if (magA === 0 || magB === 0) return 0; // Avoid division by zero
  return product / (magA * magB);
}

/**
 * Finds the best matching stored entry for a new question based on vector similarity.
 * @param newQuestion The new question highlighted by the user.
 * @param storedEntries An array of all entries saved by the user.
 * @returns The best matching StoredEntry, or null if no good match is found.
 */
export async function findBestMatch(
  newQuestion: string,
  storedEntries: StoredEntry[]
): Promise<StoredEntry | null> {
  if (storedEntries.length === 0) {
    return null;
  }

  const embeddingService = EmbeddingService.getInstance();
  const newEmbedding = await embeddingService.embed(newQuestion);

  let bestMatch: StoredEntry | null = null;
  let highestSimilarity = -1;

  for (const entry of storedEntries) {
    const similarity = cosineSimilarity(newEmbedding, entry.embedding);
    if (similarity > highestSimilarity) {
      highestSimilarity = similarity;
      bestMatch = entry;
    }
  }

  // We can set a threshold to avoid suggesting completely unrelated questions.
  const SIMILARITY_THRESHOLD = 0.7;
  if (highestSimilarity < SIMILARITY_THRESHOLD) {
    return null;
  }

  return bestMatch;
}
