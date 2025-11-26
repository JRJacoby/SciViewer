import * as vscode from 'vscode';
import { createEditorProvider } from './editorProvider';
import { treeViewer } from './viewers/treeViewer';

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    createEditorProvider('sciViewer.h5', 'h5_reader.py', treeViewer)(context),
    createEditorProvider('sciViewer.pickle', 'pickle_reader.py', treeViewer)(context),
  );
}

export function deactivate() {}
