import { useState, useCallback, useEffect } from 'react';
import { llmService } from '../services/llm';
import { storage, type ModelMetadata } from '../services/storage';
import { isNative, fileUtils } from '../services/nativeFile';

export const useModel = () => {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [currentModel, setCurrentModel] = useState<ModelMetadata | null>(null);
  const [availableModels, setAvailableModels] = useState<ModelMetadata[]>([]);
  const [nativeFiles, setNativeFiles] = useState<string[]>([]);

  // Load available models and native files on mount
  useEffect(() => {
    storage.getModels().then(setAvailableModels);
    if (isNative) {
      fileUtils.listNativeModels().then(setNativeFiles);
    }
  }, []);

  const loadModelFromFile = useCallback(async (file: File | Blob, fileName?: string) => {
    setLoading(true);
    setProgress(0);
    setError(null);

    try {
      const name = fileName || (file as File).name;
      // 1. Validate extension
      if (!name.endsWith('.gguf')) {
        throw new Error('Only .gguf files are supported');
      }

      // 2. Load model into Wllama
      await llmService.loadModel(file, (p) => setProgress(p));

      // 3. Save metadata
      const metadata: ModelMetadata = {
        name: name.replace('.gguf', ''),
        size: file.size,
        lastUsed: Date.now(),
        fileName: name,
      };
      await storage.saveModelMetadata(metadata);
      
      // 4. Update state
      setCurrentModel(metadata);
      setAvailableModels(await storage.getModels());
    } catch (err: any) {
      setError(err.message || 'Failed to load model');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadNativeModel = useCallback(async (fileName: string) => {
    setLoading(true);
    setProgress(0);
    setError(null);

    try {
      const blob = await fileUtils.readNativeFileAsBlob(fileName);
      await loadModelFromFile(blob, fileName);
    } catch (err: any) {
      setError(err.message || 'Failed to load native model');
    } finally {
      setLoading(false);
    }
  }, [loadModelFromFile]);

  const loadStoredModel = useCallback(async (metadata: ModelMetadata) => {
    setLoading(true);
    setProgress(0);
    setError(null);

    try {
      let file: File | Blob | undefined;
      
      if (isNative) {
        // In native, try to read from filesystem first
        file = await fileUtils.readNativeFileAsBlob(metadata.fileName);
      } else {
        file = await storage.getModelFile(metadata.fileName);
      }

      if (!file) {
        throw new Error('Model file not found');
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
    nativeFiles,
    loadModelFromFile,
    loadStoredModel,
    loadNativeModel,
    refreshNativeFiles: () => fileUtils.listNativeModels().then(setNativeFiles),
  };
};
