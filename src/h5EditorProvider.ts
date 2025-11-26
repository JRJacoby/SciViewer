import * as vscode from 'vscode';

export class H5EditorProvider implements vscode.CustomReadonlyEditorProvider {
  public static readonly viewType = 'hdf5Viewer.editor';

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
    webviewPanel.webview.html = this.getHtmlContent(document.uri.fsPath);
  }

  private getHtmlContent(filePath: string): string {
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
          code {
            background-color: var(--vscode-textCodeBlock-background);
            padding: 2px 6px;
            border-radius: 3px;
          }
        </style>
      </head>
      <body>
        <h1>HDF5 Viewer</h1>
        <p>Opening file: <code>${filePath}</code></p>
        <p>This will show file contents once the Python backend is wired up.</p>
      </body>
      </html>
    `;
  }
}
