import { CodeContext } from './context-provider';

export function buildPrompt(task: string, context: CodeContext): string {
  let prompt = `你是一个高级编程助手，正在帮助用户完成任务：“${task}”。\n`;

  prompt += `\n当前文件名：${context.fileName}`;
  prompt += `\n语言：${context.languageId}`;

  if (context.selection) {
    prompt += `\n用户选中的代码如下：\n\`\`\`\n${context.selection}\n\`\`\``;
  } else {
    prompt += `\n文件全文如下：\n\`\`\`\n${context.fullText}\n\`\`\``;
  }

  // 后续可以添加更多上下文，如 Git 信息等
  return prompt;
}
