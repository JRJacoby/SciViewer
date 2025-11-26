# Phase 2: Python Backend (Detailed)

## Goal

Create `python/h5_reader.py` that reads an HDF5 file and outputs its structure as JSON to stdout.

---

## Step 2.1: Create the Python Directory

```bash
mkdir python
```

---

## Step 2.2: Define the JSON Schema

The output structure:

```json
{
  "name": "/",
  "path": "/",
  "type": "group",
  "attrs": { "description": "root group" },
  "children": [
    {
      "name": "mygroup",
      "path": "/mygroup",
      "type": "group",
      "attrs": {},
      "children": [
        {
          "name": "mydata",
          "path": "/mygroup/mydata",
          "type": "dataset",
          "attrs": {},
          "shape": [5],
          "dtype": "int64",
          "preview": [1, 2, 3, 4, 5]
        }
      ]
    }
  ]
}
```

Fields:
- `name`: Node name (e.g., "mydata")
- `path`: Full path (e.g., "/mygroup/mydata")
- `type`: "group" or "dataset"
- `attrs`: Dictionary of HDF5 attributes
- `children`: (groups only) List of child nodes
- `shape`: (datasets only) Tuple of dimensions
- `dtype`: (datasets only) NumPy dtype as string
- `preview`: (datasets only) First N elements, flattened

---

## Step 2.3: Implement h5_reader.py

```python
import sys
import json
import h5py
import numpy as np

def serialize_value(val):
    """Convert numpy types to JSON-serializable Python types."""
    if isinstance(val, np.ndarray):
        return val.tolist()
    if isinstance(val, (np.integer, np.floating)):
        return val.item()
    if isinstance(val, bytes):
        return val.decode('utf-8', errors='replace')
    return val

def get_preview(dataset, max_elements=20):
    """Get first N elements of dataset, flattened."""
    flat = dataset[()].flatten()[:max_elements]
    return [serialize_value(x) for x in flat]

def read_attrs(obj):
    """Read HDF5 attributes as dict."""
    return {k: serialize_value(v) for k, v in obj.attrs.items()}

def read_node(obj, name, path):
    """Recursively read HDF5 group or dataset."""
    if isinstance(obj, h5py.Group):
        return {
            "name": name,
            "path": path,
            "type": "group",
            "attrs": read_attrs(obj),
            "children": [
                read_node(obj[child], child, f"{path.rstrip('/')}/{child}")
                for child in obj.keys()
            ]
        }
    else:  # Dataset
        return {
            "name": name,
            "path": path,
            "type": "dataset",
            "attrs": read_attrs(obj),
            "shape": list(obj.shape),
            "dtype": str(obj.dtype),
            "preview": get_preview(obj)
        }

def main():
    if len(sys.argv) != 2:
        print(json.dumps({"error": "Usage: h5_reader.py <filepath>"}))
        sys.exit(1)
    
    filepath = sys.argv[1]
    try:
        with h5py.File(filepath, 'r') as f:
            result = read_node(f, "/", "/")
        print(json.dumps(result))
    except Exception as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(1)

if __name__ == "__main__":
    main()
```

---

## Step 2.4: Handle Edge Cases

Things to consider:
- **Large datasets**: Only preview first N elements (default 20)
- **Scalar datasets**: Shape is `()`, still works with flatten
- **String datasets**: Decode bytes to UTF-8
- **Compound dtypes**: Will show as structured array repr
- **Object references**: May need special handling (skip for v1)
- **External links**: May need special handling (skip for v1)

---

## Step 2.5: Test from Command Line

```bash
cd /home/jrdja/projects/vscviewer
uv run python python/h5_reader.py test-workspace/test.h5
```

**Expected output** (formatted for readability):
```json
{
  "name": "/",
  "path": "/",
  "type": "group",
  "attrs": {},
  "children": [
    {
      "name": "mygroup",
      "path": "/mygroup",
      "type": "group",
      "attrs": {},
      "children": [
        {
          "name": "mydata",
          "path": "/mygroup/mydata",
          "type": "dataset",
          "attrs": {},
          "shape": [5],
          "dtype": "int64",
          "preview": [1, 2, 3, 4, 5]
        }
      ]
    }
  ]
}
```

Also test with `| jq .` for pretty-printing if jq is installed.

---

## Step 2.6: Create a More Complex Test File

To exercise more features:

```python
import h5py
import numpy as np

with h5py.File('test-workspace/complex.h5', 'w') as f:
    f.attrs['file_version'] = '1.0'
    f.attrs['created_by'] = 'test script'
    
    # Group with attributes
    grp = f.create_group('experiment1')
    grp.attrs['date'] = '2024-01-15'
    
    # Various dataset types
    grp.create_dataset('floats', data=np.random.randn(100, 50))
    grp.create_dataset('integers', data=np.arange(1000))
    grp.create_dataset('scalar', data=42)
    grp.create_dataset('string', data=b'hello world')
    
    # Nested group
    sub = grp.create_group('subgroup')
    sub.create_dataset('nested_data', data=[[1,2],[3,4]])
```

Run h5_reader.py on this to verify nested structures and various dtypes work.

---

## Checkpoint

After Phase 2, you have:
- `python/h5_reader.py` that parses any HDF5 file
- JSON output with full structure, attributes, and data previews
- Tested from command line

Next: Phase 3 (wire extension to call Python)

