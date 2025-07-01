// src/types.ts

/**
 * Defines the structure for each entry we save to storage.
 * It includes the question, the answer, and the vector embedding of the question.
 */
export interface StoredEntry {
    question: string;
    answer: string;
    embedding: number[]; // We store the embedding as a plain array for JSON compatibility.
  }
  