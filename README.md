# SciViewer

View scientific data files directly in VS Code.

## Supported Formats

- **HDF5** (`.h5`, `.hdf5`) - Hierarchical Data Format

## Features

- 📁 Tree view of file structure with expand/collapse
- 📊 View dataset metadata (shape, dtype, attributes)
- 👁️ Preview dataset values
- 🎨 Integrates with VS Code light/dark themes
- ↻ Refresh button to reload changed files

## Requirements

- Python 3.x with `h5py` installed

```bash
pip install h5py
```

## Installation

1. Install from VS Code Marketplace (search "SciViewer")
2. Ensure Python with h5py is available in your PATH
3. (Optional) Configure `sciViewer.pythonPath` if Python is not auto-detected

## Usage

Simply open any `.h5` or `.hdf5` file in VS Code. The custom viewer will automatically display the file structure.

- Click on **groups** (📁) to expand/collapse
- Click on **datasets** (📊) to view details and data preview

## Extension Settings

| Setting | Description | Default |
|---------|-------------|---------|
| `sciViewer.pythonPath` | Path to Python interpreter | Auto-detect |

## Troubleshooting

**"No module named 'h5py'"**
- Install h5py: `pip install h5py`
- Or set `sciViewer.pythonPath` to a Python environment that has h5py

**"Failed to spawn Python"**
- Ensure Python is installed and in your PATH
- Or set `sciViewer.pythonPath` to the full path of your Python executable

## License

MIT

