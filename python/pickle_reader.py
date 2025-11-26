import sys
import json
import pickle


def serialize_value(val):
    """Convert values to JSON-serializable Python types."""
    try:
        import numpy as np
        if isinstance(val, np.ndarray):
            return val.tolist()
        if isinstance(val, (np.integer, np.floating)):
            return val.item()
    except ImportError:
        pass
    
    if isinstance(val, bytes):
        return val.decode('utf-8', errors='replace')
    if isinstance(val, (set, frozenset)):
        return list(val)
    
    return val


def get_preview(obj, max_elements=20):
    """Get preview of an object."""
    try:
        import numpy as np
        if isinstance(obj, np.ndarray):
            flat = obj.flatten()[:max_elements]
            return [serialize_value(x) for x in flat]
    except ImportError:
        pass
    
    try:
        import pandas as pd
        if isinstance(obj, pd.DataFrame):
            return obj.head(5).to_string()
        if isinstance(obj, pd.Series):
            return obj.head(10).to_string()
    except ImportError:
        pass
    
    if isinstance(obj, (list, tuple)):
        return [serialize_value(x) if not isinstance(x, (dict, list, tuple, set)) else f"<{type(x).__name__}>" for x in obj[:max_elements]]
    if isinstance(obj, set):
        items = list(obj)[:max_elements]
        return [serialize_value(x) if not isinstance(x, (dict, list, tuple, set)) else f"<{type(x).__name__}>" for x in items]
    
    if isinstance(obj, (int, float, bool)):
        return obj
    if isinstance(obj, str):
        return obj[:500] if len(obj) > 500 else obj
    if obj is None:
        return None
    
    return str(obj)[:200]


def get_shape(obj):
    """Get shape of an object if applicable."""
    try:
        import numpy as np
        if isinstance(obj, np.ndarray):
            return list(obj.shape)
    except ImportError:
        pass
    
    try:
        import pandas as pd
        if isinstance(obj, pd.DataFrame):
            return list(obj.shape)
        if isinstance(obj, pd.Series):
            return [len(obj)]
    except ImportError:
        pass
    
    if isinstance(obj, (list, tuple)):
        return [len(obj)]
    if isinstance(obj, set):
        return [len(obj)]
    if isinstance(obj, str):
        return [len(obj)]
    
    return []


def get_dtype(obj):
    """Get dtype/type of an object."""
    try:
        import numpy as np
        if isinstance(obj, np.ndarray):
            return str(obj.dtype)
    except ImportError:
        pass
    
    try:
        import pandas as pd
        if isinstance(obj, pd.DataFrame):
            return "DataFrame"
        if isinstance(obj, pd.Series):
            return f"Series[{obj.dtype}]"
    except ImportError:
        pass
    
    return type(obj).__name__


def is_container(obj):
    """Check if object should be treated as a container (group)."""
    if isinstance(obj, dict):
        return True
    if isinstance(obj, (list, tuple, set)) and len(obj) > 0:
        first = next(iter(obj)) if isinstance(obj, set) else obj[0]
        if isinstance(first, (dict, list, tuple, set)):
            return True
        try:
            import numpy as np
            if isinstance(first, np.ndarray):
                return True
        except ImportError:
            pass
        try:
            import pandas as pd
            if isinstance(first, (pd.DataFrame, pd.Series)):
                return True
        except ImportError:
            pass
    return False


def read_node(obj, name, path):
    """Recursively read Python object structure."""
    if isinstance(obj, dict):
        return {
            "name": name,
            "path": path,
            "type": "group",
            "attrs": {},
            "children": [
                read_node(v, str(k), f"{path.rstrip('/')}/{k}")
                for k, v in obj.items()
            ]
        }
    
    if isinstance(obj, (list, tuple, set)):
        items = list(obj) if isinstance(obj, set) else obj
        if is_container(obj):
            return {
                "name": name,
                "path": path,
                "type": "group",
                "attrs": {"length": len(items), "type": type(obj).__name__},
                "children": [
                    read_node(item, f"[{i}]", f"{path.rstrip('/')}/[{i}]")
                    for i, item in enumerate(items)
                ]
            }
        else:
            return {
                "name": name,
                "path": path,
                "type": "dataset",
                "attrs": {},
                "shape": get_shape(obj),
                "dtype": get_dtype(obj),
                "preview": get_preview(obj)
            }
    
    return {
        "name": name,
        "path": path,
        "type": "dataset",
        "attrs": {},
        "shape": get_shape(obj),
        "dtype": get_dtype(obj),
        "preview": get_preview(obj)
    }


def main():
    if len(sys.argv) != 2:
        print(json.dumps({"error": "Usage: pickle_reader.py <filepath>"}))
        sys.exit(1)

    filepath = sys.argv[1]
    try:
        with open(filepath, 'rb') as f:
            obj = pickle.load(f)
        result = read_node(obj, "root", "/")
        print(json.dumps(result))
    except Exception as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(1)


if __name__ == "__main__":
    main()

