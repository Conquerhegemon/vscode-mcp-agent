import * as vscode from 'vscode';
import { getCurrentEditorContent } from './mcp/context-provider';
import { LLMAdapter } from './llm/llm-adapter';
import { OpenAIAdapter } from './llm/providers/openai-adapter';
import { ClaudeAdapter } from './llm/providers/claude-adapter';
import { GeminiAdapter } from './llm/providers/gemini-adapter';

let llmProvider: LLMAdapter;

export function activate(context: vscode.ExtensionContext) {
  try {
    const config = vscode.workspace.getConfiguration('mcp');
    const providerName = config.get<string>('llmProvider') || 'openai';

    switch (providerName.toLowerCase()) {
      case 'claude':
        llmProvider = new ClaudeAdapter();
        break;
      case 'gemini':
        llmProvider = new GeminiAdapter();
        break;
      case 'openai':
      default:
        llmProvider = new OpenAIAdapter();
    }
  } catch (error: any) {
    vscode.window.showErrorMessage(`MCP Agent Initialization Failed: ${error.message}`);
    return;
  }

  const disposable = vscode.commands.registerCommand('vscode-mcp-agent.explainCode', async () => {
    const codeContext = getCurrentEditorContent();
    if (!codeContext?.trim()) {
      vscode.window.showWarningMessage("MCP Agent: No valid code to analyze.");
      return;
    }

    vscode.window.withProgress({
      location: vscode.ProgressLocation.Notification,
      title: "MCP Agent is thinking...",
      cancellable: false
    }, async () => {
      const systemPrompt = "You are an expert code assistant. Explain the following code in Chinese, focusing on its core logic and purpose. Be concise.";
      const response = await llmProvider.generate(systemPrompt, codeContext);

      if (response.success) {
        const doc = await vscode.workspace.openTextDocument({ content: response.content, language: 'markdown' });
        await vscode.window.showTextDocument(doc, { viewColumn: vscode.ViewColumn.Beside, preview: true });
      } else {
        vscode.window.showErrorMessage(`MCP Agent failed: ${response.error}`);
      }
    });
  });

  context.subscriptions.push(disposable);
}

export function deactivate() {}
