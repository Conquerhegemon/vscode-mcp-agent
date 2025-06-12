import { LLMAdapter } from '../llm/llm-adapter';
import { VscodeContextProvider } from './VscodeContextProvider';
import { OpenAIAdapter } from '../llm/providers/openai-adapter'; // 举例

export class MCPEngine {
    private llm: LLMAdapter;
    private contextProvider: VscodeContextProvider;

    constructor() {
        // 在真实应用中，LLM 提供商应该是可配置的
        this.llm = new OpenAIAdapter(); 
        this.contextProvider = new VscodeContextProvider();
    }

    public async processRequest(userQuery: string): Promise<string> {
        // 1. 收集上下文
        const tsFilesContext = await this.contextProvider.getWorkspaceTypescriptFiles();

        // 2. 构建 Prompt (简化版)
        let contextString = 'Project file context:\n';
        for (const item of tsFilesContext) {
            contextString += `\n--- File: <span class="math-inline">\{item\.filePath\} \-\-\-\\n</span>{item.content}\n`;
        }

        const finalPrompt = `${contextString}\n\nUser Query: ${userQuery}`;
        const systemPrompt = "You are a helpful AI assistant integrated into VS Code. Analyze the provided context to answer the user's query.";

        // 3. 调用 LLM
        const response = await this.llm.generate(systemPrompt, finalPrompt);

        // 4. 解析和执行 (未来)
        // For now, just return the text content
        if (response.success) {
            return response.content;
        } else {
            return `An error occurred: ${response.error}`;
        }
    }
}
