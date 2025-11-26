import * as vscode from 'vscode';
import { H5EditorProvider } from './h5EditorProvider';

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(H5EditorProvider.register(context));
}

export function deactivate() {}

