# Phase 1: Scaffold and Basic Custom Editor (Detailed)

## Step 1.1: Install Scaffolding Tools

```bash
npm install -g yo generator-code
```

No need for `vsce` yet (that's for packaging later).

---

## Step 1.2: Generate Extension Skeleton

Run from the `vscviewer` project directory:

```bash
yo code
```

Answer the prompts:
- **What type of extension?** → `New Extension (TypeScript)`
- **Name?** → `hdf5-viewer` (or similar)
- **Identifier?** → `hdf5-viewer`
- **Description?** → `View HDF5 file contents`
- **Initialize git?** → `No` (already in a git repo)
- **Bundle with webpack?** → `No` (keep it simple for now)
- **Package manager?** → `npm`

This creates:
```
hdf5-viewer/
├── src/
│   └── extension.ts      # Entry point (will modify)
├── package.json          # Manifest (will modify heavily)
├── tsconfig.json
├── .vscode/
│   └── launch.json       # F5 debug config (already set up)
└── ...
```

**TEST**: Press F5 in VS Code. A new "Extension Development Host" window opens. Run command "Hello World" from command palette. Should show a notification.

---

## Step 1.3: Configure package.json for Custom Editor

Replace/modify the `contributes` section in `package.json`:

```json
{
  "contributes": {
    "customEditors": [
      {
        "viewType": "hdf5Viewer.editor",
        "displayName": "HDF5 Viewer",
        "selector": [
          { "filenamePattern": "*.h5" },
          { "filenamePattern": "*.hdf5" }
        ],
        "priority": "default"
      }
    ]
  },
  "activationEvents": []
}
```

Notes:
- `viewType` is a unique ID we'll reference in code
- `priority: "default"` makes this the default editor for these files
- Empty `activationEvents` is fine (VS Code auto-detects from contributions)

Remove the default `commands` contribution and `onCommand` activation event from the scaffold.

---

## Step 1.4: Implement CustomTextEditorProvider

Create `src/h5EditorProvider.ts`:

```typescript
import * as vscode from 'vscode';

export class H5EditorProvider implements vscode.CustomTextEditorProvider {
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

  async resolveCustomTextEditor(
    document: vscode.TextDocument,
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
        <style>
          body { 
            font-family: var(--vscode-font-family);
            padding: 20px;
            color: var(--vscode-foreground);
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
```

---

## Step 1.5: Register Provider in extension.ts

Replace `src/extension.ts` contents:

```typescript
import * as vscode from 'vscode';
import { H5EditorProvider } from './h5EditorProvider';

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(H5EditorProvider.register(context));
}

export function deactivate() {}
```

---

## Step 1.6: Test the Custom Editor

1. Press F5 to launch Extension Development Host
2. In the new window, open any `.h5` file (create a dummy one if needed: `touch test.h5`)
3. **Expected**: Custom editor opens showing "HDF5 Viewer" header and file path
4. **Not expected**: Binary gibberish or "file is binary" prompt

If it asks which editor to use, select "HDF5 Viewer" - this confirms the registration worked.

---

## Checkpoint

After Phase 1, you have:
- A working VS Code extension skeleton
- Custom editor that activates for `.h5`/`.hdf5` files
- Webview rendering (static content for now)
- Debug workflow (F5) established

Next: Phase 2 (Python backend)

