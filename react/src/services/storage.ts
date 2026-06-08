import { get, set, del, keys } from 'idb-keyval';

export interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface ChatSession {
  id: string;
  messages: Message[];
  modelId: string;
  createdAt: number;
}

export interface ModelMetadata {
  name: string;
  size: number;
  lastUsed: number;
  fileName: string;
}

const STORAGE_KEYS = {
  HISTORY: 'xiaobai_history',
  MODELS: 'xiaobai_models',
};

export const storage = {
  // Save a model file (Blob/File) to IndexedDB
  async saveModelFile(fileName: string, file: File | Blob) {
    await set(`model_file_${fileName}`, file);
  },

  // Get a model file from IndexedDB
  async getModelFile(fileName: string): Promise<File | Blob | undefined> {
    return await get(`model_file_${fileName}`);
  },

  // Save model metadata
  async saveModelMetadata(metadata: ModelMetadata) {
    const models = (await get<ModelMetadata[]>(STORAGE_KEYS.MODELS)) || [];
    const index = models.findIndex((m) => m.fileName === metadata.fileName);
    if (index >= 0) {
      models[index] = metadata;
    } else {
      models.push(metadata);
    }
    await set(STORAGE_KEYS.MODELS, models);
  },

  // Get all models metadata
  async getModels(): Promise<ModelMetadata[]> {
    return (await get<ModelMetadata[]>(STORAGE_KEYS.MODELS)) || [];
  },

  // Save chat history
  async saveHistory(history: ChatSession[]) {
    await set(STORAGE_KEYS.HISTORY, history);
  },

  // Get chat history
  async getHistory(): Promise<ChatSession[]> {
    return (await get<ChatSession[]>(STORAGE_KEYS.HISTORY)) || [];
  },
};
