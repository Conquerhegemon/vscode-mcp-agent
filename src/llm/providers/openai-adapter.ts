// src/llm/providers/openai-adapter.ts
import OpenAI from 'openai';
import { LLMAdapter, LLMResponse } from '../llm-adapter';

export class OpenAIAdapter implements LLMAdapter {
  private openai: OpenAI;

  constructor() {
    // 
    // ####################################################################
    // # 警告：API Key 硬编码仅用于 MVP 快速开发。                        #
    // # 正式发布前，必须改为从 VS Code 配置中安全读取。                  #
    // ####################################################################
    // 
    const apiKey = 'sk-YOUR_OPENAI_API_KEY_HERE'; // <--- 在此替换你的 KEY

    if (!apiKey || apiKey === 'sk-YOUR_OPENAI_API_KEY_HERE') {
      // 在构造函数中抛出错误，以便在插件激活时就能发现问题
      throw new Error("OpenAI API key is not configured. Please replace the placeholder in openai-adapter.ts.");
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
