# Phase 3: Wire Extension to Python (Detailed)

## Goal

Connect the VS Code extension to the Python backend so that opening an HDF5 file runs `h5_reader.py` and displays the parsed JSON in the webview.

---

## Step 3.1: Locate the Python Script

The extension needs to find `python/h5_reader.py` relative to itself, not the workspace:

```typescript
const scriptPath = path.join(context.extensionPath, 'python', 'h5_reader.py');
```

Add `import * as path from 'path';` at the top.

---

## Step 3.2: Add Python Runner Utility

Create `src/pythonRunner.ts`:

```typescript
import * as vscode from 'vscode';
import { spawn } from 'child_process';
import * as path from 'path';

export interface H5Data {
  name: string;
  path: string;
  type: 'group' | 'dataset';
  attrs: Record<string, unknown>;
  children?: H5Data[];
  shape?: number[];
  dtype?: string;
  preview?: unknown;
}

export interface H5Error {
  error: string;
}

export type H5Result = H5Data | H5Error;

export async function runH5Reader(
  extensionPath: string,
  filePath: string
): Promise<H5Result> {
  const scriptPath = path.join(extensionPath, 'python', 'h5_reader.py');
  const pythonPath = getPythonPath();

  return new Promise((resolve, reject) => {
    const proc = spawn(pythonPath, [scriptPath, filePath]);
    let stdout = '';
    let stderr = '';

    proc.stdout.on('data', (data) => { stdout += data; });
    proc.stderr.on('data', (data) => { stderr += data; });

    proc.on('close', (code) => {
      if (code !== 0 && !stdout) {
        resolve({ error: stderr || `Process exited with code ${code}` });
        return;
      }
      try {
        resolve(JSON.parse(stdout));
      } catch (e) {
        resolve({ error: `Failed to parse JSON: ${stdout}` });
      }
    });

    proc.on('error', (err) => {
      resolve({ error: `Failed to spawn Python: ${err.message}` });
    });
  });
}

function getPythonPath(): string {
  const config = vscode.workspace.getConfiguration('hdf5Viewer');
  const customPath = config.get<string>('pythonPath');
  if (customPath) {
    return customPath;
  }
  return process.platform === 'win32' ? 'python' : 'python3';
}
```

---

## Step 3.3: Add Extension Settings

In `package.json`, add configuration contribution:

```json
{
  "contributes": {
    "customEditors": [...],
    "configuration": {
      "title": "HDF5 Viewer",
      "properties": {
        "hdf5Viewer.pythonPath": {
          "type": "string",
          "default": "",
          "description": "Path to Python interpreter. Leave empty to auto-detect (python3 on Unix, python on Windows)."
        }
      }
    }
  }
}
```

---

## Step 3.4: Update H5EditorProvider

Modify `src/h5EditorProvider.ts` to:
1. Call `runH5Reader` when opening a file
2. Send the result to the webview via `postMessage`
3. Update the webview HTML to receive and display the data

```typescript
import { runH5Reader, H5Data, H5Error } from './pythonRunner';

// In resolveCustomEditor:
async resolveCustomEditor(
  document: vscode.CustomDocument,
  webviewPanel: vscode.WebviewPanel,
  _token: vscode.CancellationToken
): Promise<void> {
  webviewPanel.webview.options = { enableScripts: true };
  webviewPanel.webview.html = this.getHtmlContent();

  // Run Python and send result to webview
  const result = await runH5Reader(
    this.context.extensionPath,
    document.uri.fsPath
  );
  webviewPanel.webview.postMessage({ type: 'data', payload: result });
}
```

---

## Step 3.5: Update Webview to Receive Messages

Update the HTML to include a script that listens for messages:

```html
<script>
  const vscode = acquireVsCodeApi();
  
  window.addEventListener('message', event => {
    const message = event.data;
    if (message.type === 'data') {
      console.log('Received HDF5 data:', message.payload);
      // For now, just dump it as JSON
      document.getElementById('content').textContent = 
        JSON.stringify(message.payload, null, 2);
    }
  });
</script>
```

---

## Step 3.6: Test the Integration

1. Recompile: `npm run compile`
2. Press F5 to launch Extension Development Host
3. Open `test.h5` (or `complex.h5`)
4. Open Developer Tools in the dev host (Help → Toggle Developer Tools)
5. Check the Console tab for "Received HDF5 data: {...}"
6. The webview should show raw JSON

**Expected issues to debug:**
- Python not found → check `getPythonPath()` logic
- h5py not installed → error message in JSON
- Script path wrong → check `extensionPath` resolution

---

## Step 3.7: Error Handling UI

Update the webview to show errors nicely:

```javascript
if (message.payload.error) {
  document.getElementById('content').innerHTML = 
    `<div class="error">Error: ${message.payload.error}</div>`;
} else {
  // show data
}
```

Add error styling:

```css
.error {
  color: var(--vscode-errorForeground);
  background: var(--vscode-inputValidation-errorBackground);
  padding: 10px;
  border-radius: 4px;
}
```

---

## Checkpoint

After Phase 3, you have:
- Extension calls Python subprocess when opening .h5 files
- JSON result sent to webview via postMessage
- Raw JSON displayed in webview (UI polish comes in Phase 4)
- Python path configurable via extension settings
- Error messages displayed for Python/h5py issues

Next: Phase 4 (build proper tree UI)

