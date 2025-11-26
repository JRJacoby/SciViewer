import * as vscode from 'vscode';
import { runPythonReader } from './pythonRunner';
import { Viewer } from './viewers/types';

export function createEditorProvider(
  viewType: string,
  scriptName: string,
  viewer: Viewer
): (context: vscode.ExtensionContext) => vscode.Disposable {
  return (context: vscode.ExtensionContext) => {
    const provider = new SciEditorProvider(context, scriptName, viewer);
    return vscode.window.registerCustomEditorProvider(
      viewType,
      provider,
      { webviewOptions: { retainContextWhenHidden: true } }
    );
  };
}

class SciEditorProvider implements vscode.CustomReadonlyEditorProvider {
  constructor(
    private readonly context: vscode.ExtensionContext,
    private readonly scriptName: string,
    private readonly viewer: Viewer
  ) {}

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
    webviewPanel.webview.html = this.viewer.getHtml();

    const loadData = async () => {
      const result = await runPythonReader(
        this.context.extensionPath,
        this.scriptName,
        document.uri.fsPath
      );
      webviewPanel.webview.postMessage({ type: 'data', payload: result });
    };

    webviewPanel.webview.onDidReceiveMessage(async (message) => {
      if (message.type === 'refresh') {
        webviewPanel.webview.postMessage({ type: 'loading' });
        await loadData();
      }
    });

    await loadData();
  }
}

