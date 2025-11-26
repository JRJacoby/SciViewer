# Changelog

All notable changes to the SciViewer extension will be documented in this file.

## [Unreleased]

### Added
- **Parquet file support** (`.parquet`, `.pqt`)
  - Summary view with row count, column count, compression, file size
  - Schema view with column names and data types
  - Preview of first 10 rows as a table
  - New table-based viewer layout

## [0.2.0] - 2024-11-26

### Added
- **Pickle file support** (`.pkl`, `.pickle`, `.p`)
  - Recursive tree view of Python objects
  - Supports: dict, list, tuple, set, numpy arrays, pandas DataFrames
  - Custom objects show str() representation
- Refactored architecture for easy addition of new formats

## [0.1.0] - 2024-11-26

### Added
- Initial release
- HDF5 file viewing (`.h5`, `.hdf5`)
- Interactive tree view with expand/collapse groups
- Dataset detail panel with shape, dtype, attributes
- Data preview (first 20 elements)
- Refresh button to reload file
- Configurable Python path via `sciViewer.pythonPath`
- VS Code theme integration (light/dark)
