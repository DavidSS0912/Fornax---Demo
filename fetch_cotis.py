import os
import lancedb
import sys

db_path = os.path.join(os.path.dirname(__file__), 'backend', 'data', 'lancedb')
db = lancedb.connect(db_path)
try:
    tables = getattr(db, 'table_names', db.list_tables)()
    print("Tables:", tables)
    if "cotizaciones" in db.table_names() or "cotizaciones" in getattr(db, "table_names", lambda: [])():
        tbl = db.open_table("cotizaciones")
        df = tbl.to_pandas()
        print("COTIZACIONES LIST:")
        for idx, row in df.iterrows():
            print(f"ID: {row.get('id', '')} - No_Cotizacion: {row.get('No_Cotizacion', 'None')}")
    else:
        # Fallback if table list method is weird
        tbl = db.open_table("cotizaciones")
        df = tbl.to_pandas()
        for idx, row in df.iterrows():
            print(f"ID: {row.get('id', '')} - No_Cotizacion: {row.get('No_Cotizacion', 'None')}")
except Exception as e:
    print("Error:", e)
