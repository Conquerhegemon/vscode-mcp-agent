// src/llm/providers/openai-adapter.ts
import * as vscode from 'vscode';
import OpenAI from 'openai';
import { LLMAdapter, LLMResponse } from '../llm-adapter';

export class OpenAIAdapter implements LLMAdapter {
  private openai: OpenAI;

  constructor() {
    const config = vscode.workspace.getConfiguration('mcp');
    const apiKey = config.get<string>('openaiApiKey');

    if (!apiKey) {
      throw new Error("OpenAI API key not found in settings (mcp.openaiApiKey).");
    }

    this.openai = new OpenAI({ apiKey });
  }

  async generate(systemPrompt: string, userContext: string): Promise<LLMResponse> {
    try {
      const completion = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo", // 使用成本较低的模型进行测试
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userContext }
        ],
      });

      const content = completion.choices[0]?.message?.content;
      if (content) {
        return { success: true, content };
      } else {
        return { success: false, content: '', error: "No content in LLM response." };
      }
    } catch (error: any) {
      console.error("Error calling OpenAI:", error);
      return { success: false, content: '', error: error.message };
    }
  }
}
