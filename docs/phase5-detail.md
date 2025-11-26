# Phase 5: Polish and Package (Detailed)

## Goal

Add final polish (refresh button), package the extension as a `.vsix` file, and publish to the VS Code Marketplace.

---

## Step 5.1: Add Refresh Button

Update webview to include a refresh button that reloads the file:

**HTML** (already have the button in header):
```html
<header>
  <h1>SciViewer</h1>
  <button id="refresh" title="Refresh">↻</button>
</header>
```

**JavaScript**:
```javascript
document.getElementById('refresh').addEventListener('click', function() {
  vscode.postMessage({ type: 'refresh' });
});
```

**TypeScript** (h5EditorProvider.ts):
```typescript
// In resolveCustomEditor, add message listener:
webviewPanel.webview.onDidReceiveMessage(async (message) => {
  if (message.type === 'refresh') {
    const result = await runH5Reader(
      this.context.extensionPath,
      document.uri.fsPath
    );
    webviewPanel.webview.postMessage({ type: 'data', payload: result });
  }
});
```

**TEST**: Open file, modify externally, click refresh, verify new data appears.

---

## Step 5.2: Extension Metadata

Update `package.json` with marketplace metadata:

```json
{
  "name": "sci-viewer",
  "displayName": "SciViewer",
  "description": "View scientific data files (HDF5, pickle, etc.) in VS Code",
  "version": "0.1.0",
  "publisher": "your-publisher-id",
  "repository": {
    "type": "git",
    "url": "https://github.com/username/vscviewer"
  },
  "icon": "media/icon.png",
  "galleryBanner": {
    "color": "#1e1e1e",
    "theme": "dark"
  },
  "license": "MIT",
  "keywords": ["hdf5", "h5", "scientific", "data", "viewer", "numpy"],
  "categories": ["Visualization", "Data Science", "Other"]
}
```

---

## Step 5.3: Create Extension Icon

Create a 128x128 PNG icon at `media/icon.png`.

Options:
- Design one (simple data/chart icon)
- Use an emoji rendered as PNG
- Use a placeholder for now

---

## Step 5.4: Create README.md

Create `README.md` in project root (this becomes the marketplace page):

```markdown
# SciViewer

View scientific data files directly in VS Code.

## Supported Formats

- **HDF5** (`.h5`, `.hdf5`) - Hierarchical Data Format

## Features

- Tree view of file structure
- Expand/collapse groups
- View dataset metadata (shape, dtype, attributes)
- Preview dataset values

## Requirements

- Python 3.x with `h5py` installed
- Configure `sciViewer.pythonPath` if Python is not in PATH

## Installation

1. Install from VS Code Marketplace
2. Ensure Python with h5py is available:
   ```bash
   pip install h5py
   ```
3. (Optional) Set `sciViewer.pythonPath` in settings

## Extension Settings

- `sciViewer.pythonPath`: Path to Python interpreter

## Screenshots

[Add screenshots here]

## License

MIT
```

---

## Step 5.5: Create CHANGELOG.md

```markdown
# Changelog

## [0.1.0] - 2024-XX-XX

### Added
- Initial release
- HDF5 file viewing with tree structure
- Dataset preview with shape, dtype, attributes
- Configurable Python path
```

---

## Step 5.6: Create LICENSE

Create `LICENSE` file with MIT license text.

---

## Step 5.7: Install vsce

```bash
npm install -g @vscode/vsce
```

---

## Step 5.8: Package the Extension

```bash
cd /home/jrdja/projects/vscviewer
vsce package
```

This creates `sci-viewer-0.1.0.vsix`.

**Common issues:**
- Missing README → create one
- Missing repository → add to package.json
- Missing license → add LICENSE file

---

## Step 5.9: Test Local Installation

1. In VS Code: Extensions → `...` → Install from VSIX
2. Select the `.vsix` file
3. Reload VS Code
4. Open an HDF5 file
5. Verify everything works outside of development mode

---

## Step 5.10: Create Publisher Account

1. Go to https://marketplace.visualstudio.com/manage
2. Sign in with Microsoft account
3. Create a publisher (e.g., "jrdja")
4. Note your publisher ID

Update `package.json`:
```json
"publisher": "jrdja"
```

---

## Step 5.11: Create Personal Access Token (PAT)

1. Go to https://dev.azure.com
2. Create organization if needed
3. User Settings → Personal Access Tokens → New Token
4. Name: "vsce"
5. Organization: All accessible organizations
6. Scopes: Custom defined → Marketplace → Manage
7. Create and **copy the token** (shown only once!)

---

## Step 5.12: Login to vsce

```bash
vsce login your-publisher-id
# Paste your PAT when prompted
```

---

## Step 5.13: Publish

```bash
vsce publish
```

Or publish a specific version:
```bash
vsce publish 0.1.0
```

The extension will be available at:
`https://marketplace.visualstudio.com/items?itemName=your-publisher-id.sci-viewer`

---

## Step 5.14: Verify Publication

1. Wait a few minutes for processing
2. Search "SciViewer" in VS Code Extensions
3. Install from marketplace
4. Test on a fresh machine/profile if possible

---

## Post-Publication

### Version Updates

To publish updates:
```bash
# Bump version
vsce publish minor  # 0.1.0 → 0.2.0
# or
vsce publish patch  # 0.1.0 → 0.1.1
```

### Add More Formats

Future phases can add:
- `sciViewer.pickle` for Python pickle files
- `sciViewer.zarr` for Zarr arrays
- `sciViewer.parquet` for Parquet files

Each needs:
1. New Python reader script
2. New customEditor entry in package.json
3. New EditorProvider class (or generalize existing one)

---

## Checkpoint

After Phase 5, you have:
- Refresh button for reloading files
- Professional marketplace metadata
- Packaged `.vsix` file
- Published extension on VS Code Marketplace
- Ready for users to install!

