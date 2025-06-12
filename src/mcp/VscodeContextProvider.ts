import * as vscode from 'vscode';

export interface ContextInfo {
    filePath: string;
    content: string;
}

export class VscodeContextProvider {
    // 示例：获取工作区内所有 TS 文件的路径和内容
    public async getWorkspaceTypescriptFiles(): Promise<ContextInfo[]> {
        const files = await vscode.workspace.findFiles('**/*.ts', '**/node_modules/**');

        const contextItems: ContextInfo[] = [];
        for (const file of files) {
            try {
                const document = await vscode.workspace.openTextDocument(file);
                contextItems.push({
                    filePath: vscode.workspace.asRelativePath(file),
                    content: document.getText(),
                });
            } catch (e) {
                console.error(`Could not read file: ${file.path}`, e);
            }
        }
        return contextItems;
    }

    // TODO: 添加其他上下文获取方法
    // public getGitDiff() { ... }
    // public getOpenFileTabs() { ... }
    // public getSelectedText() { ... }
}
