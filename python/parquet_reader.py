import sys
import json
from pathlib import Path


def main():
    if len(sys.argv) != 2:
        print(json.dumps({"error": "Usage: parquet_reader.py <filepath>"}))
        sys.exit(1)

    filepath = sys.argv[1]
    try:
        import pyarrow.parquet as pq
        
        parquet_file = pq.ParquetFile(filepath)
        metadata = parquet_file.metadata
        schema = parquet_file.schema_arrow
        
        file_size = Path(filepath).stat().st_size
        size_mb = round(file_size / (1024 * 1024), 2)
        
        compression = "unknown"
        if metadata.num_row_groups > 0:
            row_group = metadata.row_group(0)
            if row_group.num_columns > 0:
                compression = row_group.column(0).compression
        
        summary = {
            "rows": metadata.num_rows,
            "columns": metadata.num_columns,
            "row_groups": metadata.num_row_groups,
            "size_mb": size_mb,
            "compression": str(compression),
        }
        
        schema_list = []
        for i in range(len(schema)):
            field = schema.field(i)
            schema_list.append({
                "name": field.name,
                "dtype": str(field.type),
            })
        
        table = parquet_file.read()
        df = table.to_pandas()
        preview_df = df.head(10)
        
        preview = []
        for _, row in preview_df.iterrows():
            row_dict = {}
            for col in preview_df.columns:
                val = row[col]
                if hasattr(val, 'item'):
                    val = val.item()
                elif hasattr(val, 'isoformat'):
                    val = val.isoformat()
                else:
                    val = str(val) if not isinstance(val, (int, float, bool, str, type(None))) else val
                row_dict[col] = val
            preview.append(row_dict)
        
        result = {
            "summary": summary,
            "schema": schema_list,
            "preview": preview,
        }
        
        print(json.dumps(result))
        
    except Exception as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(1)


if __name__ == "__main__":
    main()

