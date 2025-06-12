import * as vscode from 'vscode';
import { LLMAdapter, LLMResponse } from '../llm-adapter';
import Anthropic from '@anthropic-ai/sdk';

export class ClaudeAdapter implements LLMAdapter {
  private anthropic: Anthropic;

  constructor() {
    const config = vscode.workspace.getConfiguration('mcp');
    const apiKey = config.get<string>('claudeApiKey');
    if (!apiKey) throw new Error("Claude API key missing in settings (mcp.claudeApiKey).");

    this.anthropic = new Anthropic({ apiKey });
  }

  async generate(systemPrompt: string, userContext: string): Promise<LLMResponse> {
    try {
      const completion = await this.anthropic.messages.create({
        model: 'claude-3-opus-20240229',
        max_tokens: 1024,
        messages: [
          { role: "user", content: `${systemPrompt}\n\n${userContext}` }
        ]
      });

      const content = completion.content[0]?.text || '';
      return { success: true, content };
    } catch (error: any) {
      return { success: false, content: '', error: error.message };
    }
  }
}
