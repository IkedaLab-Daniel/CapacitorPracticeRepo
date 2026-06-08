import { Wllama, type AssetsPathConfig } from '@wllama/wllama';

const CONFIG: AssetsPathConfig = {
  'default': '/wllama/wllama.wasm', // Fallback
  'single-thread/wllama.wasm': '/wllama/wllama.wasm',
  'multi-thread/wllama.wasm': '/wllama/wllama.wasm',
};

export class LLMService {
  private wllama: Wllama | null = null;
  private modelLoaded = false;

  async init() {
    if (!this.wllama) {
      this.wllama = new Wllama(CONFIG);
    }
    return this.wllama;
  }

  async loadModel(file: File | Blob, onProgress?: (progress: number) => void) {
    const instance = await this.init();
    
    // Unload previous model if any
    if (this.modelLoaded) {
      await instance.exit();
      this.wllama = new Wllama(CONFIG); // Re-init after exit
    }

    await instance.loadModel([file], {
      onProgress: ({ loaded, total }) => {
        if (onProgress) onProgress(loaded / total);
      },
    });
    
    this.modelLoaded = true;
  }

  async chat(
    messages: { role: 'user' | 'assistant' | 'system'; content: string }[],
    onToken: (token: string) => void
  ) {
    if (!this.wllama || !this.modelLoaded) {
      throw new Error('Model not loaded');
    }

    // Using createChatCompletion for better handling of chat templates
    await this.wllama.createChatCompletion({
      messages,
      nPredict: 1024,
      stream: true,
      onData: (chunk) => {
        if (chunk.choices[0]?.delta?.content) {
          onToken(chunk.choices[0].delta.content);
        }
      },
    });
  }

  async isModelLoaded() {
    return this.modelLoaded;
  }

  async exit() {
    if (this.wllama) {
      await this.wllama.exit();
      this.wllama = null;
      this.modelLoaded = false;
    }
  }
}

export const llmService = new LLMService();
