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
    data = dataset[()]
    if isinstance(data, np.ndarray):
        flat = data.flatten()[:max_elements]
        return [serialize_value(x) for x in flat]
    else:
        return serialize_value(data)


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
    else:
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

