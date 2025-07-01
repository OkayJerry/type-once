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
    const embedding = await embeddingService.embed(question);
    const newEntry: StoredEntry = {
      question,
      answer,
      embedding: Array.from(embedding),
    };

    const existingEntries = await this.getEntries();
    const updatedEntries = [...existingEntries, newEntry];

    return new Promise((resolve) => {
      chrome.storage.local.set({ entries: updatedEntries }, () => {
        console.log('New entry saved to storage:', newEntry);
        resolve();
      });
    });
  }

  /**
   * Deletes a stored entry by its question text.
   * @param questionToDelete The question of the entry to delete.
   */
  public static async deleteEntry(questionToDelete: string): Promise<void> {
    const existingEntries = await this.getEntries();
    const updatedEntries = existingEntries.filter(
      (entry) => entry.question !== questionToDelete
    );

    return new Promise((resolve) => {
      chrome.storage.local.set({ entries: updatedEntries }, () => {
        console.log(`Entry deleted: "${questionToDelete}"`);
        resolve();
      });
    });
  }
}
