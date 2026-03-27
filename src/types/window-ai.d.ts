export interface WindowAiLanguageModelCapabilities {
  available: 'readily' | 'after-download' | 'no';
  defaultTopK: number;
  maxTopK: number;
  defaultTemperature: number;
}

export interface WindowAiLanguageModelSession {
  prompt: (text: string) => Promise<string>;
  promptStreaming: (text: string) => AsyncIterable<string>;
  destroy: () => void;
  clone: () => Promise<WindowAiLanguageModelSession>;
}

export interface WindowAiLanguageModelOptions {
  systemPrompt?: string;
  initialPrompts?: Array<{ role: 'user' | 'model'; content: string }>;
  topK?: number;
  temperature?: number;
}

declare global {
  interface Window {
    ai?: {
      languageModel?: {
        capabilities: () => Promise<WindowAiLanguageModelCapabilities>;
        create: (options?: WindowAiLanguageModelOptions) => Promise<WindowAiLanguageModelSession>;
      };
    };
  }
}

export {};
