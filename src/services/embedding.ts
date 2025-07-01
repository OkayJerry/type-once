// src/services/embedding.ts

// Import the specific pipeline type we are using.
import { pipeline, FeatureExtractionPipeline } from '@xenova/transformers';

/**
 * A Singleton class to handle text embedding generation.
 * This ensures we only ever have one instance of the model in memory.
 */
export class EmbeddingService {
  private static instance: EmbeddingService | null = null;
  // Use the specific FeatureExtractionPipeline type.
  private extractor: FeatureExtractionPipeline | null = null;

  // The constructor is private to enforce the Singleton pattern.
  private constructor() {}

  /**
   * Gets the singleton instance of the EmbeddingService.
   */
  public static getInstance(): EmbeddingService {
    if (!EmbeddingService.instance) {
      EmbeddingService.instance = new EmbeddingService();
    }
    return EmbeddingService.instance;
  }

  /**
   * Initializes the model pipeline. This must be called before embeddings can be generated.
   * We use a lightweight, efficient model perfect for in-browser use.
   */
  private async initialize() {
    if (this.extractor === null) {
      // The pipeline function for 'feature-extraction' returns a FeatureExtractionPipeline.
      this.extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
    }
  }

  /**
   * Generates a vector embedding for a given piece of text.
   * @param text The text to embed.
   * @returns A Float32Array representing the vector embedding.
   */
  public async embed(text: string): Promise<Float32Array> {
    await this.initialize();
    if (!this.extractor) {
      throw new Error("Embedding model not initialized.");
    }
    const result = await this.extractor(text, { pooling: 'mean', normalize: true });
    // We cast the result's data to Float32Array to match the return type.
    return result.data as Float32Array;
  }
}
