// src/mcp/context-provider.ts
import * as vscode from 'vscode';

export function getCurrentEditorContent(): string | null {
  const editor = vscode.window.activeTextEditor;
  if (editor) {
    return editor.document.getText();
  }
  // 如果没有活动编辑器，返回 null
  return null;
}
