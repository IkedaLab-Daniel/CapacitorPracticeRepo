import { useState, useCallback, useEffect } from 'react';
import { llmService } from '../services/llm';
import { storage, type ModelMetadata } from '../services/storage';

export const useModel = () => {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [currentModel, setCurrentModel] = useState<ModelMetadata | null>(null);
  const [availableModels, setAvailableModels] = useState<ModelMetadata[]>([]);

  // Load available models on mount
  useEffect(() => {
    storage.getModels().then(setAvailableModels);
  }, []);

  const loadModelFromFile = useCallback(async (file: File) => {
    setLoading(true);
    setProgress(0);
    setError(null);

    try {
      // 1. Validate extension
      if (!file.name.endsWith('.gguf')) {
        throw new Error('Only .gguf files are supported');
      }

      // 2. Load model into Wllama
      await llmService.loadModel(file, (p) => setProgress(p));

      // 3. Save metadata
      const metadata: ModelMetadata = {
        name: file.name.replace('.gguf', ''),
        size: file.size,
        lastUsed: Date.now(),
        fileName: file.name,
      };
      await storage.saveModelMetadata(metadata);
      
      // 4. Save file to IndexedDB for future use (optional but requested)
      await storage.saveModelFile(file.name, file);

      setCurrentModel(metadata);
      setAvailableModels(await storage.getModels());
    } catch (err: any) {
      setError(err.message || 'Failed to load model');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadStoredModel = useCallback(async (metadata: ModelMetadata) => {
    setLoading(true);
    setProgress(0);
    setError(null);

    try {
      const file = await storage.getModelFile(metadata.fileName);
      if (!file) {
        throw new Error('Model file not found in storage');
      }

      await llmService.loadModel(file, (p) => setProgress(p));
      
      const updatedMetadata = { ...metadata, lastUsed: Date.now() };
      await storage.saveModelMetadata(updatedMetadata);
      
      setCurrentModel(updatedMetadata);
    } catch (err: any) {
      setError(err.message || 'Failed to load stored model');
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    progress,
    error,
    currentModel,
    availableModels,
    loadModelFromFile,
    loadStoredModel,
  };
};
