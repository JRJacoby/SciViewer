import * as vscode from 'vscode';
import { createEditorProvider } from './createEditorProvider';

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    createEditorProvider('sciViewer.h5', 'h5_reader.py')(context),
    createEditorProvider('sciViewer.pickle', 'pickle_reader.py')(context),
  );
}

export function deactivate() {}
