import sys
import json
import numpy as np


def main():
    if len(sys.argv) != 2:
        print(json.dumps({"error": "Usage: npy_reader.py <filepath>"}))
        sys.exit(1)

    filepath = sys.argv[1]
    try:
        arr = np.load(filepath)
        
        flat = arr.flatten()
        preview_count = min(20, len(flat))
        preview = []
        for val in flat[:preview_count]:
            if hasattr(val, 'item'):
                preview.append(val.item())
            else:
                preview.append(str(val))
        
        if len(flat) > preview_count:
            preview.append("...")
        
        result = {
            "shape": list(arr.shape),
            "dtype": str(arr.dtype),
            "size": int(arr.size),
            "preview": preview,
        }
        
        print(json.dumps(result))
        
    except Exception as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(1)


if __name__ == "__main__":
    main()

