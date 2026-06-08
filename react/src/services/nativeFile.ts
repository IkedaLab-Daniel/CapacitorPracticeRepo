import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';

// Check if we are running in a native Capacitor environment
export const isNative = Capacitor.isNativePlatform();

export const fileUtils = {
  /**
   * Reads a file from the native filesystem as a Blob.
   * This is much faster and more memory-efficient than readFile for large files.
   */
  async readNativeFileAsBlob(path: string, directory: Directory = Directory.Documents): Promise<Blob> {
    const { uri } = await Filesystem.getUri({ path, directory });
    const webPath = Capacitor.convertFileSrc(uri);
    const response = await fetch(webPath);
    return await response.blob();
  },

  /**
   * Lists models in the app's documents directory
   */
  async listNativeModels(directory: Directory = Directory.Documents): Promise<string[]> {
    try {
      const { files } = await Filesystem.readdir({ path: '', directory });
      return files
        .filter(f => f.name.endsWith('.gguf'))
        .map(f => f.name);
    } catch (e) {
      console.error('Failed to list native models', e);
      return [];
    }
  }
};
