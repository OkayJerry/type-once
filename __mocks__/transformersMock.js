// A minimal mock so that importing '@xenova/transformers' never errors out
module.exports = {
    // pipeline returns an async function that resolves to a dummy embedding
    pipeline: jest.fn(() => async () => [0.1, 0.2, 0.3]),
    FeatureExtractionPipeline: jest.fn()
  };
  