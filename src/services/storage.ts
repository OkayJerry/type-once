// src/services/storage.ts

import { StoredEntry } from '../types';
import { EmbeddingService } from './embedding';

/**
 * A service to abstract away the complexities of interacting with chrome.storage.local
 * and handling our StoredEntry data structure.
 */
export class StorageService {
  /**
   * Retrieves all stored entries from chrome.storage.
   * @returns A promise that resolves to an array of StoredEntry objects.
   */
  public static getEntries(): Promise<StoredEntry[]> {
    return new Promise((resolve) => {
      chrome.storage.local.get('entries', (data) => {
        resolve(data.entries || []);
      });
    });
  }

  /**
   * Adds a new question-answer pair to storage, including its vector embedding.
   * @param question The new question text.
   * @param answer The corresponding answer text.
   */
  public static async addEntry(question: string, answer: string): Promise<void> {
    const embeddingService = EmbeddingService.getInstance();
    
    // 1. Generate the embedding for the new question.
    const embedding = await embeddingService.embed(question);

    // 2. Create the new entry object.
    const newEntry: StoredEntry = {
      question,
      answer,
      // Convert Float32Array to a plain array for JSON serialization in storage.
      embedding: Array.from(embedding),
    };

    // 3. Get the existing entries.
    const existingEntries = await this.getEntries();
    
    // 4. Add the new entry and save the updated list.
    const updatedEntries = [...existingEntries, newEntry];

    return new Promise((resolve) => {
      chrome.storage.local.set({ entries: updatedEntries }, () => {
        console.log('New entry saved to storage:', newEntry);
        resolve();
      });
    });
  }
}
