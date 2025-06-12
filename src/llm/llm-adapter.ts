// src/llm/llm-adapter.ts
export interface LLMResponse {
  success: boolean;
  content: string;
  error?: string;
}

export interface LLMAdapter {
  generate(systemPrompt: string, userContext: string): Promise<LLMResponse>;
}
