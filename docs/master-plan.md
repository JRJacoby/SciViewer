# HDF5 Viewer VS Code Extension - Master Plan

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│  VS Code Extension (TypeScript)                         │
│  ┌─────────────────┐    ┌────────────────────────────┐ │
│  │ Custom Editor   │───▶│ Webview (HTML/CSS/JS)      │ │
│  │ Provider        │    │ - Tree rendering           │ │
│  └────────┬────────┘    │ - Data preview tables      │ │
│           │             └────────────────────────────┘ │
│           ▼                                             │
│  ┌─────────────────┐                                   │
│  │ Python subprocess call                              │
│  │ `python h5_reader.py <filepath>`                    │
│  └─────────────────┘                                   │
└─────────────────────────────────────────────────────────┘
           │
           ▼ JSON output
┌─────────────────────────────────────────────────────────┐
│  Python Backend (h5_reader.py)                          │
│  - Reads HDF5 structure recursively                     │
│  - Returns groups, datasets, attributes                 │
│  - Includes data preview (first N elements)             │
└─────────────────────────────────────────────────────────┘
```

## Phase 1: Scaffold and Basic Custom Editor

1. **Initialize extension project**
   ```bash
   npm install -g yo generator-code vsce
   yo code  # Select "New Extension (TypeScript)"
   ```

2. **Configure `package.json`** to register custom editor for `.h5`, `.hdf5` files:
   - Add `customEditors` contribution point
   - Set `activationEvents` to `onCustomEditor`

3. **Implement minimal CustomEditorProvider** in `src/extension.ts`:
   - Return a webview with static "Hello HDF5" HTML
   - **TEST**: Open any `.h5` file, confirm custom editor opens instead of binary gibberish

## Phase 2: Python Backend

4. **Create `python/h5_reader.py`**:
   - Accept filepath as CLI argument
   - Walk HDF5 structure recursively with h5py
   - Output JSON to stdout:
     ```json
     {
       "name": "/",
       "type": "group",
       "children": [...],
       "attrs": {"key": "value"}
     }
     ```
   - For datasets: include `shape`, `dtype`, `preview` (first 10 elements flattened)
   - **TEST**: Run `python h5_reader.py test.h5` from terminal, verify JSON output

## Phase 3: Wire Extension to Python

5. **Add subprocess call** in CustomEditorProvider:
   - Use Node's `child_process.spawn` to call Python script
   - Parse JSON response
   - Pass data to webview via `postMessage`
   - **TEST**: Open `.h5` file, check VS Code Developer Tools console for parsed JSON

6. **Handle Python path detection**:
   - Try `python3`, fall back to `python`
   - Add extension setting for custom Python path
   - Show error message if Python/h5py not found

## Phase 4: Webview UI

7. **Build webview HTML/CSS/JS**:
   - Collapsible tree structure for groups
   - Click dataset to expand and show:
     - Shape, dtype, attributes
     - Preview table/array of values
   - Style it nicely (VS Code theme-aware CSS variables)
   - **TEST**: Open various `.h5` files, click around, verify tree expands and data previews render

8. **Add loading state and error handling**:
   - Show spinner while Python runs
   - Display friendly error if file can't be read

## Phase 5: Polish and Package

9. **Add refresh button** to reload file if changed externally

10. **Package and test locally**:
    ```bash
    vsce package  # Creates .vsix file
    # Install via: Extensions → ... → Install from VSIX
    ```

11. **Optional: Publish to marketplace** (requires Azure DevOps account)

## Key Files

| File | Purpose |
|------|---------|
| `package.json` | Extension manifest, editor registration |
| `src/extension.ts` | Entry point, CustomEditorProvider |
| `src/h5EditorProvider.ts` | Custom editor logic |
| `python/h5_reader.py` | HDF5 parsing backend |
| `media/webview.html` | UI template |
| `media/webview.css` | Styles |
| `media/webview.js` | Tree interaction logic |

