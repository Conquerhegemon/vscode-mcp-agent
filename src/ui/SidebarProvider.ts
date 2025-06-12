
import * as vscode from 'vscode';
import { getNonce } from './getNonce'; // 我们稍后会创建这个工具函数

export class SidebarProvider implements vscode.WebviewViewProvider {
    _view?: vscode.WebviewView;
    _doc?: vscode.TextDocument;

    constructor(private readonly _extensionUri: vscode.Uri) {}

    public resolveWebviewView(webviewView: vscode.WebviewView) {
        this._view = webviewView;

        webviewView.webview.options = {
            // Allow scripts in the webview
            enableScripts: true,
            localResourceRoots: [this._extensionUri],
        };

        webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

        // 处理从 Webview 发来的消息
        webviewView.webview.onDidReceiveMessage(async (data) => {
            switch (data.type) {
                case 'sendMessage': {
                    // 这里暂时只是把消息发回给UI，并加一个 "Agent:" 前缀
                    // !! 未来这里将调用 MCP Engine 和 LLM !!
                    const message = data.value;
                    vscode.window.showInformationMessage(`Message received: ${message}`);
                    this.addMessage("user", message);
                    // 模拟 Agent 回复
                    setTimeout(() => {
                        this.addMessage("agent", `我收到了你的消息: "${message}"`);
                    }, 1000);
                    break;
                }
                case 'onInfo': {
                    if (!data.value) { return; }
                    vscode.window.showInformationMessage(data.value);
                    break;
                }
                case 'onError': {
                    if (!data.value) { return; }
                    vscode.window.showErrorMessage(data.value);
                    break;
                }
            }
        });
    }
    
    // 给 Webview UI 添加消息
    public addMessage(role: 'user' | 'agent', message: string) {
        if (this._view) {
            this._view.show?.(true); // Folds out the view if it is not visible
            this._view.webview.postMessage({ type: 'addMessage', role, value: message });
        }
    }

    private _getHtmlForWebview(webview: vscode.Webview) {
        const nonce = getNonce();

        return `<!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource}; script-src 'nonce-${nonce}';">
                <title>MCP Agent Chat</title>
                <style>
                    body { font-family: var(--vscode-font-family); color: var(--vscode-editor-foreground); background-color: var(--vscode-side-bar-background); padding: 5px; }
                    #chat-container { display: flex; flex-direction: column; gap: 10px; }
                    .message { padding: 8px; border-radius: 5px; max-width: 90%; word-wrap: break-word; }
                    .user-message { background-color: var(--vscode-list-active-selection-background); align-self: flex-end; }
                    .agent-message { background-color: var(--vscode-editor-widget-background); align-self: flex-start; }
                    #input-container { display: flex; margin-top: 10px; }
                    #user-input { flex-grow: 1; background-color: var(--vscode-input-background); color: var(--vscode-input-foreground); border: 1px solid var(--vscode-input-border); }
                    button { background-color: var(--vscode-button-background); color: var(--vscode-button-foreground); border: none; padding: 5px 10px; cursor: pointer; }
                    button:hover { background-color: var(--vscode-button-hover-background); }
                </style>
            </head>
            <body>
                <div id="chat-container"></div>
                <div id="input-container">
                    <input type="text" id="user-input" placeholder="Ask MCP Agent..."/>
                    <button id="send-button">Send</button>
                </div>

                <script nonce="${nonce}">
                    const vscode = acquireVsCodeApi();
                    const chatContainer = document.getElementById('chat-container');
                    const userInput = document.getElementById('user-input');
                    const sendButton = document.getElementById('send-button');

                    // Function to add a message to the UI
                    function addMessageToUI(role, text) {
                        const messageDiv = document.createElement('div');
                        messageDiv.className = 'message ' + (role === 'user' ? 'user-message' : 'agent-message');
                        messageDiv.textContent = text;
                        chatContainer.appendChild(messageDiv);
                        chatContainer.scrollTop = chatContainer.scrollHeight; // Scroll to bottom
                    }

                    // Handle messages from the extension
                    window.addEventListener('message', event => {
                        const message = event.data;
                        if (message.type === 'addMessage') {
                            addMessageToUI(message.role, message.value);
                        }
                    });

                    function sendMessage() {
                        const text = userInput.value;
                        if (text) {
                            vscode.postMessage({ type: 'sendMessage', value: text });
                            userInput.value = '';
                        }
                    }

                    sendButton.addEventListener('click', sendMessage);
                    userInput.addEventListener('keydown', (event) => {
                        if (event.key === 'Enter') {
                            sendMessage();
                        }
                    });
                </script>
            </body>
            </html>`;
    }
}
