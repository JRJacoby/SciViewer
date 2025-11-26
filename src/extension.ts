import * as vscode from 'vscode';
import { createEditorProvider } from './editorProvider';
import { treeViewer } from './viewers/treeViewer';
import { tableViewer } from './viewers/tableViewer';
import { arrayViewer } from './viewers/arrayViewer';

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    createEditorProvider('sciViewer.h5', 'h5_reader.py', treeViewer)(context),
    createEditorProvider('sciViewer.pickle', 'pickle_reader.py', treeViewer)(context),
    createEditorProvider('sciViewer.parquet', 'parquet_reader.py', tableViewer)(context),
    createEditorProvider('sciViewer.npy', 'npy_reader.py', arrayViewer)(context),
  );
}

export function deactivate() {}
