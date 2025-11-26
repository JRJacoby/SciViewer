# SciViewer

View scientific data files directly in VS Code.

## Supported Formats

- **HDF5** (`.h5`, `.hdf5`) - Hierarchical Data Format
- **Pickle** (`.pkl`, `.pickle`, `.p`) - Python serialized objects

## Features

- 📁 Tree view of file structure with expand/collapse
- 📊 View dataset metadata (shape, dtype, attributes)
- 👁️ Preview dataset values
- 🎨 Integrates with VS Code light/dark themes
- ↻ Refresh button to reload changed files

## Requirements

- Python 3.x with appropriate packages:

```bash
pip install h5py numpy pandas
```

(Only `h5py` is required for HDF5 files. `numpy` and `pandas` are optional but recommended for full pickle support.)

## Installation

1. Install from VS Code Marketplace (search "SciViewer")
2. Ensure Python is available in your PATH
3. (Optional) Configure `sciViewer.pythonPath` if Python is not auto-detected

## Usage

Simply open any supported file in VS Code. The custom viewer will automatically display the file structure.

- Click on **groups** (📁) to expand/collapse
- Click on **datasets** (📊) to view details and data preview

### Pickle Support

Pickle files display Python objects as a tree:
- `dict` → expandable group
- `list`, `tuple`, `set` → expandable group with indexed children
- `numpy.ndarray` → dataset with shape, dtype, preview
- `pandas.DataFrame` → dataset with shape, preview of first rows
- Scalars (`int`, `float`, `str`, etc.) → dataset with value preview
- Custom objects → dataset with `str()` representation

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
