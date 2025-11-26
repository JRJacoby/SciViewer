import * as vscode from 'vscode';
import { runH5Reader } from './pythonRunner';

export class H5EditorProvider implements vscode.CustomReadonlyEditorProvider {
  public static readonly viewType = 'sciViewer.h5';

  public static register(context: vscode.ExtensionContext): vscode.Disposable {
    const provider = new H5EditorProvider(context);
    return vscode.window.registerCustomEditorProvider(
      H5EditorProvider.viewType,
      provider,
      { webviewOptions: { retainContextWhenHidden: true } }
    );
  }

  constructor(private readonly context: vscode.ExtensionContext) {}

  async openCustomDocument(
    uri: vscode.Uri,
    _openContext: vscode.CustomDocumentOpenContext,
    _token: vscode.CancellationToken
  ): Promise<vscode.CustomDocument> {
    return { uri, dispose: () => {} };
  }

  async resolveCustomEditor(
    document: vscode.CustomDocument,
    webviewPanel: vscode.WebviewPanel,
    _token: vscode.CancellationToken
  ): Promise<void> {
    webviewPanel.webview.options = { enableScripts: true };
    webviewPanel.webview.html = this.getHtmlContent();

    const result = await runH5Reader(
      this.context.extensionPath,
      document.uri.fsPath
    );
    webviewPanel.webview.postMessage({ type: 'data', payload: result });
  }

  private getHtmlContent(): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { 
            font-family: var(--vscode-font-family);
            padding: 20px;
            color: var(--vscode-foreground);
            background-color: var(--vscode-editor-background);
          }
          #content {
            white-space: pre-wrap;
            font-family: var(--vscode-editor-font-family);
            font-size: var(--vscode-editor-font-size);
          }
          .loading {
            color: var(--vscode-descriptionForeground);
          }
          .error {
            color: var(--vscode-errorForeground);
            background: var(--vscode-inputValidation-errorBackground);
            padding: 10px;
            border-radius: 4px;
          }
        </style>
      </head>
      <body>
        <h1>SciViewer</h1>
        <div id="content" class="loading">Loading...</div>
        <script>
          const vscode = acquireVsCodeApi();
          
          window.addEventListener('message', event => {
            const message = event.data;
            if (message.type === 'data') {
              const content = document.getElementById('content');
              content.classList.remove('loading');
              
              if (message.payload.error) {
                content.classList.add('error');
                content.textContent = 'Error: ' + message.payload.error;
              } else {
                console.log('Received HDF5 data:', message.payload);
                content.textContent = JSON.stringify(message.payload, null, 2);
              }
            }
          });
        </script>
      </body>
      </html>
    `;
  }
}
