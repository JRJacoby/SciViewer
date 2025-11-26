import * as vscode from 'vscode';
import { createEditorProvider } from './editorProvider';
import { treeViewer } from './viewers/treeViewer';
import { tableViewer } from './viewers/tableViewer';

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    createEditorProvider('sciViewer.h5', 'h5_reader.py', treeViewer)(context),
    createEditorProvider('sciViewer.pickle', 'pickle_reader.py', treeViewer)(context),
    createEditorProvider('sciViewer.parquet', 'parquet_reader.py', tableViewer)(context),
  );
}

export function deactivate() {}
