import * as vscode from 'vscode';
import { LLMAdapter, LLMResponse } from '../llm-adapter';
import { GoogleGenerativeAI } from '@google/generative-ai';

export class GeminiAdapter implements LLMAdapter {
  private gemini: GoogleGenerativeAI;

  constructor() {
    const config = vscode.workspace.getConfiguration('mcp');
    const apiKey = config.get<string>('geminiApiKey');
    if (!apiKey) throw new Error("Gemini API key missing in settings (mcp.geminiApiKey).");

    this.gemini = new GoogleGenerativeAI(apiKey);
  }

  async generate(systemPrompt: string, userContext: string): Promise<LLMResponse> {
    try {
      const model = this.gemini.getGenerativeModel({ model: 'gemini-pro' });
      const result = await model.generateContent([
        { role: 'user', parts: [{ text: `${systemPrompt}\n\n${userContext}` }] }
      ]);
      const content = result.response.text();
      return { success: true, content };
    } catch (error: any) {
      return { success: false, content: '', error: error.message };
    }
  }
}
