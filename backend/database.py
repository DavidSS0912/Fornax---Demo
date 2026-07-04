import os
import lancedb
import pyarrow as pa
import pandas as pd
import duckdb
import json

import sys

if getattr(sys, 'frozen', False):
    DB_DIR = os.path.join(os.path.expanduser("~"), ".fornax_crm", "data")
else:
    DB_DIR = os.path.join(os.path.expanduser("~"), ".fornax_crm", "data")

LANCE_DB_PATH = os.path.join(DB_DIR, "lancedb")

# Asegurar que el directorio de datos existe
os.makedirs(DB_DIR, exist_ok=True)

# Conectar a LanceDB
db = lancedb.connect(LANCE_DB_PATH)

def get_table_names():
    try:
        res = db.list_tables()
        if hasattr(res, "tables"):
            return res.tables
        if isinstance(res, list):
            return res
        return db.table_names()
    except Exception:
        try:
            return db.table_names()
        except Exception:
            return []

db.table_names = get_table_names

def init_db(ai_helper=None):
    """
    Inicializa las tablas en LanceDB y las puebla con semillas iniciales si están vacías.
    """
    # 1. Equipos de Ventas
    if "equipos_ventas" not in db.table_names():
        schema = pa.schema([
            ("id", pa.string()),
            ("nombre", pa.string())
        ])
        data = []
        db.create_table("equipos_ventas", data=data, schema=schema)
    
    # 2. Vendedores
    if "vendedores" not in db.table_names():
        schema = pa.schema([
            ("id", pa.int64()),
            ("nombre", pa.string()),
            ("puesto", pa.string()),
            ("celular", pa.string()),
            ("correo", pa.string()),
            ("equipo_id", pa.string())
        ])
        data = []
        db.create_table("vendedores", data=data, schema=schema)

    # 3. Categorías de Productos
    if "categorias" not in db.table_names():
        schema = pa.schema([
            ("id", pa.string()),
            ("nombre", pa.string()),
            ("atributos", pa.list_(pa.string()))
        ])
        data = []
        db.create_table("categorias", data=data, schema=schema)

    # 4. Clientes
    if "clientes" not in db.table_names():
        schema = pa.schema([
            ("id", pa.int64()),
            ("numero", pa.string()),
            ("nombre", pa.string()),
            ("puesto", pa.string()),
            ("empresa", pa.string()),
            ("telefono", pa.string()),
            ("correo", pa.string()),
            ("tags", pa.list_(pa.string())),
            ("nota", pa.string()),
            ("equipo_id", pa.string()),
            ("dias_sin_compra", pa.int64())
        ])
        data = []
        db.create_table("clientes", data=data, schema=schema)

    # 5. Proveedores
    if "proveedores" not in db.table_names():
        schema = pa.schema([
            ("id", pa.int64()),
            ("numero", pa.string()),
            ("nombre", pa.string()),
            ("puesto", pa.string()),
            ("empresa", pa.string()),
            ("telefono", pa.string()),
            ("correo", pa.string()),
            ("descuento", pa.string()),
            ("tags", pa.list_(pa.string())),
            ("compra_minima", pa.float64()),
            ("compra_envio_pagado", pa.float64())
        ])
        data = []
        db.create_table("proveedores", data=data, schema=schema)

    # 6. Contactos Adicionales
    if "contactos" not in db.table_names():
        schema = pa.schema([
            ("id", pa.int64()),
            ("entity_id", pa.string()), # Relacionado con numero de cliente o proveedor
            ("nombre", pa.string()),
            ("puesto", pa.string()),
            ("telefono", pa.string()),
            ("correo", pa.string())
        ])
        data = []
        db.create_table("contactos", data=data, schema=schema)

    # 7. Cotizaciones
    if "cotizaciones" not in db.table_names():
        schema = pa.schema([
            ("id", pa.int64()),
            ("Pedido", pa.string()),
            ("No_Cotizacion", pa.string()),
            ("num_cliente", pa.string()),
            ("Cliente", pa.string()),
            ("equipo_id", pa.string()),
            ("Categoría", pa.string()),
            ("Estatus", pa.string()),
            ("Progreso", pa.string()),
            ("Prioridad", pa.string()),
            ("moneda_cotizacion", pa.string()),
            ("tipo_cambio", pa.float64()),
            ("monto_original", pa.float64()),
            ("Monto", pa.float64()),
            ("Margen", pa.float64()),
            ("Entrega", pa.string()),
            ("dias_abierta", pa.int64()),
            ("codigos_facturar", pa.string()),
            ("cantidad_pz", pa.int64()),
            ("fecha_llegada", pa.string()),
            ("notas", pa.string()),
            ("ref_cliente", pa.string()),
            ("ref_proveedor", pa.string()),
            ("no_sp_ptt", pa.string()),
            ("guia", pa.string()),
            ("contacto_cliente", pa.string()),
            ("vendedor", pa.string()),
            ("coordinacion", pa.string()),
            ("grupo_materiales", pa.string()),
            ("porcentaje_cierre", pa.float64()),
            ("certificacion", pa.string()),
            ("importacion", pa.string()),
            ("pendiente_armado", pa.string()),
            ("num_proveedor", pa.string()),
            ("Proveedor", pa.string())
        ])
        data = []
        db.create_table("cotizaciones", data=data, schema=schema)

    # 8. Procesamiento
    if "procesamiento" not in db.table_names():
        schema = pa.schema([
            ("id", pa.int64()),
            ("Pedido", pa.string()),
            ("No_Cotizacion", pa.string()),
            ("num_cliente", pa.string()),
            ("Cliente", pa.string()),
            ("equipo_id", pa.string()),
            ("Categoría", pa.string()),
            ("Progreso", pa.string()),
            ("Prioridad", pa.string()),
            ("moneda_cotizacion", pa.string()),
            ("tipo_cambio", pa.float64()),
            ("monto_original", pa.float64()),
            ("Monto", pa.float64()),
            ("Margen", pa.float64()),
            ("Entrega", pa.string()),
            ("num_proveedor", pa.string()),
            ("Proveedor", pa.string())
        ])
        data = []
        db.create_table("procesamiento", data=data, schema=schema)

    # 9. Metas de Ventas
    if "metas" not in db.table_names():
        schema = pa.schema([
            ("id", pa.int64()),
            ("categoria", pa.string()),
            ("marca", pa.string()),
            ("objetivo", pa.float64()),
            ("actual", pa.float64())
        ])
        data = []
        db.create_table("metas", data=data, schema=schema)

    # 10. Catálogo de Productos (con vectores de embeddings de 384 dimensiones para all-MiniLM-L6-v2)
    if "catalogo" not in db.table_names():
        # Schema para catalogo. Usamos valores_atributos como string (JSON) para facilidad en Arrow.
        schema = pa.schema([
            ("id", pa.int64()),
            ("categoria_id", pa.string()),
            ("marca", pa.string()),
            ("num_proveedor", pa.string()),
            ("codigo", pa.string()),
            ("codigo_interno", pa.string()),
            ("descripcion", pa.string()),
            ("precio", pa.float64()),
            ("moneda", pa.string()),
            ("tiempo_entrega", pa.string()),
            ("recomendaciones", pa.string()),
            ("valores_atributos", pa.string()), # JSON String
            ("vector", pa.list_(pa.float32(), 384))
        ])

        seed_products = [
            {
                "id": 1, "categoria_id": "cat-1", "marca": "Festo", "num_proveedor": "P-001",
                "codigo": "SOL-101", "codigo_interno": "INT-S01", 
                "descripcion": "Válvula solenoide neumática 5/2 vías, conexión 1/4 NPT",
                "precio": 850.0, "moneda": "MXN", "tiempo_entrega": "2-3 días",
                "recomendaciones": "Ideal para automatización de cilindros de doble efecto.",
                "valores_atributos": json.dumps({"presion": "10 bar", "voltaje": "24V DC"})
            },
            {
                "id": 2, "categoria_id": "cat-1", "marca": "SMC", "num_proveedor": "P-002",
                "codigo": "ACT-205", "codigo_interno": "INT-A05",
                "descripcion": "Actuador lineal neumático doble efecto 50mm diámetro, carrera 100mm",
                "precio": 1250.0, "moneda": "MXN", "tiempo_entrega": "Stock",
                "recomendaciones": "Usar con válvulas 5/2 vías como la SOL-101.",
                "valores_atributos": json.dumps({"carrera": "100mm", "fuerza": "500N"})
            },
            {
                "id": 3, "categoria_id": "cat-2", "marca": "Parker", "num_proveedor": "P-003",
                "codigo": "MANG-3/8", "codigo_interno": "INT-M38",
                "descripcion": "Manguera de poliuretano azul 3/8 para sistemas neumáticos",
                "precio": 45.0, "moneda": "MXN", "tiempo_entrega": "Stock",
                "recomendaciones": "Revisar presión máxima operativa antes de instalar.",
                "valores_atributos": json.dumps({"material": "Poliuretano", "presion_max": "150 psi"})
            },
            {
                "id": 4, "categoria_id": "cat-3", "marca": "WIKA", "num_proveedor": "P-004",
                "codigo": "MANO-100", "codigo_interno": "INT-M100",
                "descripcion": "Manómetro de glicerina 0-100 psi, carátula 2.5 pulg, conexión 1/4 NPT",
                "precio": 320.0, "moneda": "MXN", "tiempo_entrega": "Stock",
                "recomendaciones": "Uso general en sistemas hidráulicos y neumáticos.",
                "valores_atributos": json.dumps({"rango": "0-100 psi", "fluido": "Glicerina"})
            },
            {
                "id": 5, "categoria_id": "cat-4", "marca": "YEE", "num_proveedor": "P-005",
                "codigo": "FIL-Y-2", "codigo_interno": "INT-FY2",
                "descripcion": "Filtro Y de acero inoxidable 2 pulgadas, malla 100",
                "precio": 2100.0, "moneda": "MXN", "tiempo_entrega": "1 semana",
                "recomendaciones": "Para filtración de partículas en líneas de vapor y agua.",
                "valores_atributos": json.dumps({"conexion": "2 pulg NPT", "material": "SS316"})
            },
            {
                "id": 6, "categoria_id": "cat-2", "marca": "Festo", "num_proveedor": "P-001",
                "codigo": "RAC-1/4", "codigo_interno": "INT-R14",
                "descripcion": "Racor rápido recto 1/4 pulg OD x 1/4 NPT macho",
                "precio": 25.0, "moneda": "MXN", "tiempo_entrega": "Stock",
                "recomendaciones": "Compatible con mangueras de poliuretano y nylon.",
                "valores_atributos": json.dumps({"tipo": "Recto", "material": "Latón Niquelado"})
            },
            {
                "id": 7, "categoria_id": "cat-1", "marca": "Asco", "num_proveedor": "P-006",
                "codigo": "SOL-220", "codigo_interno": "INT-S220",
                "descripcion": "Válvula solenoide para agua 2/2 vías normalmente cerrada, 1 pulg NPT, 110V AC",
                "precio": 1500.0, "moneda": "MXN", "tiempo_entrega": "3-5 días",
                "recomendaciones": "Ideal para control de fluidos limpios y riego.",
                "valores_atributos": json.dumps({"voltaje": "110V AC", "tipo": "NC"})
            },
            {
                "id": 8, "categoria_id": "cat-3", "marca": "Danfoss", "num_proveedor": "P-007",
                "codigo": "PRE-01", "codigo_interno": "INT-P01",
                "descripcion": "Presostato diferencial ajustable 0.2 a 4 bar, rearme automático",
                "precio": 1150.0, "moneda": "MXN", "tiempo_entrega": "Stock",
                "recomendaciones": "Para monitoreo de bombas y compresores.",
                "valores_atributos": json.dumps({"rango": "0.2-4 bar", "contacto": "SPDT"})
            },
            {
                "id": 9, "categoria_id": "cat-4", "marca": "Worcester", "num_proveedor": "P-008",
                "codigo": "VAL-B-SS", "codigo_interno": "INT-VBSS",
                "descripcion": "Válvula de bola 3 piezas acero inoxidable 1 pulg NPT, asientos PTFE",
                "precio": 950.0, "moneda": "MXN", "tiempo_entrega": "1-2 días",
                "recomendaciones": "Apta para vapor, agua y químicos.",
                "valores_atributos": json.dumps({"material": "SS316", "asientos": "PTFE"})
            },
            {
                "id": 10, "categoria_id": "cat-1", "marca": "Worcester", "num_proveedor": "P-008",
                "codigo": "ACT-NEU-Q", "codigo_interno": "INT-ANQ",
                "descripcion": "Actuador neumático cuarto de vuelta doble efecto",
                "precio": 2300.0, "moneda": "MXN", "tiempo_entrega": "3-4 días",
                "recomendaciones": "Para automatizar válvulas de bola o mariposa.",
                "valores_atributos": json.dumps({"giro": "90 grados", "accion": "Doble"})
            },
            {
                "id": 11, "categoria_id": "cat-5", "marca": "Siemens", "num_proveedor": "P-009",
                "codigo": "PLC-S7", "codigo_interno": "INT-S7",
                "descripcion": "Autómata programable PLC S7-1200 CPU 1214C DC/DC/DC",
                "precio": 8500.0, "moneda": "MXN", "tiempo_entrega": "2 semanas",
                "recomendaciones": "Control principal para paneles de automatización industrial.",
                "valores_atributos": json.dumps({"entradas": "14 DI", "salidas": "10 DO"})
            },
            {
                "id": 12, "categoria_id": "cat-2", "marca": "Festo", "num_proveedor": "P-001",
                "codigo": "UNI-MRL", "codigo_interno": "INT-UML",
                "descripcion": "Unidad de mantenimiento FRL 1/2 pulg (Filtro, Regulador, Lubricador)",
                "precio": 1800.0, "moneda": "MXN", "tiempo_entrega": "Stock",
                "recomendaciones": "Esencial para prolongar la vida útil de herramientas y actuadores neumáticos.",
                "valores_atributos": json.dumps({"conexion": "1/2 NPT", "filtro": "40 um"})
            },
            {
                "id": 13, "categoria_id": "cat-3", "marca": "Endress+Hauser", "num_proveedor": "P-010",
                "codigo": "FLU-MAG", "codigo_interno": "INT-FMG",
                "descripcion": "Caudalímetro electromagnético 2 pulg brida ANSI 150",
                "precio": 15000.0, "moneda": "MXN", "tiempo_entrega": "3-4 semanas",
                "recomendaciones": "Medición precisa de fluidos conductivos y agua residual.",
                "valores_atributos": json.dumps({"conexion": "Brida ANSI 150", "exactitud": "0.5%"})
            },
            {
                "id": 14, "categoria_id": "cat-4", "marca": "Spirax Sarco", "num_proveedor": "P-011",
                "codigo": "TRM-TER", "codigo_interno": "INT-TTM",
                "descripcion": "Trampa termodinámica para vapor de media presión 1/2 NPT",
                "precio": 3100.0, "moneda": "MXN", "tiempo_entrega": "1 semana",
                "recomendaciones": "Drenaje de condensado en líneas de vapor saturado.",
                "valores_atributos": json.dumps({"presion_max": "42 bar", "conexion": "1/2 NPT"})
            },
            {
                "id": 15, "categoria_id": "cat-1", "marca": "SMC", "num_proveedor": "P-002",
                "codigo": "SIL-1/4", "codigo_interno": "INT-S14",
                "descripcion": "Silenciador neumático de bronce sinterizado 1/4 NPT",
                "precio": 65.0, "moneda": "MXN", "tiempo_entrega": "Stock",
                "recomendaciones": "Reduce ruido de escape en válvulas direccionales.",
                "valores_atributos": json.dumps({"material": "Bronce Sinterizado", "rosca": "1/4 NPT"})
            }
        ]
        
        for p in seed_products:
            if ai_helper:
                try:
                    p["vector"] = ai_helper.get_embedding(p["descripcion"])
                except Exception:
                    p["vector"] = [0.0] * 384
            else:
                p["vector"] = [0.0] * 384
                
        db.create_table("catalogo", data=seed_products, schema=schema)

    # 11. Config Opciones
    if "config_opciones" not in get_table_names():
        schema = pa.schema([
            ("id", pa.int64()),
            ("columna", pa.string()),
            ("opciones", pa.string()) # JSON string for array of {text: '', color: ''}
        ])
        data = []
        db.create_table("config_opciones", data=data, schema=schema)

    # 12. Perfil Usuario
    if "perfil_usuario" not in get_table_names():
        schema = pa.schema([
            ("id", pa.int64()),
            ("nombre", pa.string()),
            ("puesto", pa.string()),
            ("correo", pa.string()),
            ("celular", pa.string()),
            ("ubicacion", pa.string()),
            ("empresa", pa.string()),
            ("datos_adicionales", pa.string()) # JSON string
        ])
        data = [{
            "id": 1,
            "nombre": "Juan Pérez",
            "puesto": "Gerente de Ventas",
            "correo": "juan.perez@fornax.com",
            "celular": "555-123-4567",
            "ubicacion": "CDMX",
            "empresa": "Fornax Soluciones Industriales",
            "datos_adicionales": "{}"
        }]
        db.create_table("perfil_usuario", data=data, schema=schema)

    # Migración de tablas existentes para agregar nuevas columnas
    _migrate_schema()

def _migrate_schema():
    """Verifica si las tablas existentes tienen las columnas esperadas y las agrega si no están."""
    tables_to_check = {
        "cotizaciones": ["num_proveedor", "Proveedor", "moneda_cotizacion", "tipo_cambio", "monto_original"],
        "procesamiento": ["num_proveedor", "Proveedor", "moneda_cotizacion", "tipo_cambio", "monto_original"],
        "categorias": ["coordinacion"]
    }
    
    for table_name, new_cols in tables_to_check.items():
        if table_name in db.table_names():
            try:
                df = db.open_table(table_name).to_pandas()
                missing_cols = [col for col in new_cols if col not in df.columns]
                
                if missing_cols:
                    print(f"Migrando tabla {table_name}, agregando columnas: {missing_cols}")
                    for col in missing_cols:
                        if col == "tipo_cambio":
                            df[col] = 1.0
                        elif col == "monto_original":
                            df[col] = df["Monto"] if "Monto" in df.columns else 0.0
                        elif col == "moneda_cotizacion":
                            df[col] = "MXN"
                        else:
                            df[col] = "" # Default to empty string for missing cols
                    update_table_from_df(table_name, df)
            except Exception as e:
                print(f"Error al migrar tabla {table_name}: {e}")

    # Inyectar semillas si la tabla catalogo existe y no las tiene
    try:
        if "catalogo" in db.table_names():
            df_cat = db.open_table("catalogo").to_pandas()
            if "SOL-101" not in df_cat["codigo"].values:
                print("Inyectando productos semilla al catalogo existente...")
                import json
                seed_products = [
                    {
                        "id": 9001, "categoria_id": "cat-1", "marca": "Festo", "num_proveedor": "P-001",
                        "codigo": "SOL-101", "codigo_interno": "INT-S01", 
                        "descripcion": "Válvula solenoide neumática 5/2 vías, conexión 1/4 NPT",
                        "precio": 850.0, "moneda": "MXN", "tiempo_entrega": "2-3 días",
                        "recomendaciones": "Ideal para automatización de cilindros de doble efecto.",
                        "valores_atributos": json.dumps({"presion": "10 bar", "voltaje": "24V DC"})
                    },
                    {
                        "id": 9002, "categoria_id": "cat-1", "marca": "SMC", "num_proveedor": "P-002",
                        "codigo": "ACT-205", "codigo_interno": "INT-A05",
                        "descripcion": "Actuador lineal neumático doble efecto 50mm diámetro, carrera 100mm",
                        "precio": 1250.0, "moneda": "MXN", "tiempo_entrega": "Stock",
                        "recomendaciones": "Usar con válvulas 5/2 vías como la SOL-101.",
                        "valores_atributos": json.dumps({"carrera": "100mm", "fuerza": "500N"})
                    },
                    {
                        "id": 9003, "categoria_id": "cat-2", "marca": "Parker", "num_proveedor": "P-003",
                        "codigo": "MANG-3/8", "codigo_interno": "INT-M38",
                        "descripcion": "Manguera de poliuretano azul 3/8 para sistemas neumáticos",
                        "precio": 45.0, "moneda": "MXN", "tiempo_entrega": "Stock",
                        "recomendaciones": "Revisar presión máxima operativa antes de instalar.",
                        "valores_atributos": json.dumps({"material": "Poliuretano", "presion_max": "150 psi"})
                    },
                    {
                        "id": 9004, "categoria_id": "cat-3", "marca": "WIKA", "num_proveedor": "P-004",
                        "codigo": "MANO-100", "codigo_interno": "INT-M100",
                        "descripcion": "Manómetro de glicerina 0-100 psi, carátula 2.5 pulg, conexión 1/4 NPT",
                        "precio": 320.0, "moneda": "MXN", "tiempo_entrega": "Stock",
                        "recomendaciones": "Uso general en sistemas hidráulicos y neumáticos.",
                        "valores_atributos": json.dumps({"rango": "0-100 psi", "fluido": "Glicerina"})
                    },
                    {
                        "id": 9005, "categoria_id": "cat-4", "marca": "YEE", "num_proveedor": "P-005",
                        "codigo": "FIL-Y-2", "codigo_interno": "INT-FY2",
                        "descripcion": "Filtro Y de acero inoxidable 2 pulgadas, malla 100",
                        "precio": 2100.0, "moneda": "MXN", "tiempo_entrega": "1 semana",
                        "recomendaciones": "Para filtración de partículas en líneas de vapor y agua.",
                        "valores_atributos": json.dumps({"conexion": "2 pulg NPT", "material": "SS316"})
                    },
                    {
                        "id": 9006, "categoria_id": "cat-2", "marca": "Festo", "num_proveedor": "P-001",
                        "codigo": "RAC-1/4", "codigo_interno": "INT-R14",
                        "descripcion": "Racor rápido recto 1/4 pulg OD x 1/4 NPT macho",
                        "precio": 25.0, "moneda": "MXN", "tiempo_entrega": "Stock",
                        "recomendaciones": "Compatible con mangueras de poliuretano y nylon.",
                        "valores_atributos": json.dumps({"tipo": "Recto", "material": "Latón Niquelado"})
                    },
                    {
                        "id": 9007, "categoria_id": "cat-1", "marca": "Asco", "num_proveedor": "P-006",
                        "codigo": "SOL-220", "codigo_interno": "INT-S220",
                        "descripcion": "Válvula solenoide para agua 2/2 vías normalmente cerrada, 1 pulg NPT, 110V AC",
                        "precio": 1500.0, "moneda": "MXN", "tiempo_entrega": "3-5 días",
                        "recomendaciones": "Ideal para control de fluidos limpios y riego.",
                        "valores_atributos": json.dumps({"voltaje": "110V AC", "tipo": "NC"})
                    },
                    {
                        "id": 9008, "categoria_id": "cat-3", "marca": "Danfoss", "num_proveedor": "P-007",
                        "codigo": "PRE-01", "codigo_interno": "INT-P01",
                        "descripcion": "Presostato diferencial ajustable 0.2 a 4 bar, rearme automático",
                        "precio": 1150.0, "moneda": "MXN", "tiempo_entrega": "Stock",
                        "recomendaciones": "Para monitoreo de bombas y compresores.",
                        "valores_atributos": json.dumps({"rango": "0.2-4 bar", "contacto": "SPDT"})
                    },
                    {
                        "id": 9009, "categoria_id": "cat-4", "marca": "Worcester", "num_proveedor": "P-008",
                        "codigo": "VAL-B-SS", "codigo_interno": "INT-VBSS",
                        "descripcion": "Válvula de bola 3 piezas acero inoxidable 1 pulg NPT, asientos PTFE",
                        "precio": 950.0, "moneda": "MXN", "tiempo_entrega": "1-2 días",
                        "recomendaciones": "Apta para vapor, agua y químicos.",
                        "valores_atributos": json.dumps({"material": "SS316", "asientos": "PTFE"})
                    },
                    {
                        "id": 9010, "categoria_id": "cat-1", "marca": "Worcester", "num_proveedor": "P-008",
                        "codigo": "ACT-NEU-Q", "codigo_interno": "INT-ANQ",
                        "descripcion": "Actuador neumático cuarto de vuelta doble efecto",
                        "precio": 2300.0, "moneda": "MXN", "tiempo_entrega": "3-4 días",
                        "recomendaciones": "Para automatizar válvulas de bola o mariposa.",
                        "valores_atributos": json.dumps({"giro": "90 grados", "accion": "Doble"})
                    },
                    {
                        "id": 9011, "categoria_id": "cat-5", "marca": "Siemens", "num_proveedor": "P-009",
                        "codigo": "PLC-S7", "codigo_interno": "INT-S7",
                        "descripcion": "Autómata programable PLC S7-1200 CPU 1214C DC/DC/DC",
                        "precio": 8500.0, "moneda": "MXN", "tiempo_entrega": "2 semanas",
                        "recomendaciones": "Control principal para paneles de automatización industrial.",
                        "valores_atributos": json.dumps({"entradas": "14 DI", "salidas": "10 DO"})
                    },
                    {
                        "id": 9012, "categoria_id": "cat-2", "marca": "Festo", "num_proveedor": "P-001",
                        "codigo": "UNI-MRL", "codigo_interno": "INT-UML",
                        "descripcion": "Unidad de mantenimiento FRL 1/2 pulg (Filtro, Regulador, Lubricador)",
                        "precio": 1800.0, "moneda": "MXN", "tiempo_entrega": "Stock",
                        "recomendaciones": "Esencial para prolongar la vida útil de herramientas y actuadores neumáticos.",
                        "valores_atributos": json.dumps({"conexion": "1/2 NPT", "filtro": "40 um"})
                    },
                    {
                        "id": 9013, "categoria_id": "cat-3", "marca": "Endress+Hauser", "num_proveedor": "P-010",
                        "codigo": "FLU-MAG", "codigo_interno": "INT-FMG",
                        "descripcion": "Caudalímetro electromagnético 2 pulg brida ANSI 150",
                        "precio": 15000.0, "moneda": "MXN", "tiempo_entrega": "3-4 semanas",
                        "recomendaciones": "Medición precisa de fluidos conductivos y agua residual.",
                        "valores_atributos": json.dumps({"conexion": "Brida ANSI 150", "exactitud": "0.5%"})
                    },
                    {
                        "id": 9014, "categoria_id": "cat-4", "marca": "Spirax Sarco", "num_proveedor": "P-011",
                        "codigo": "TRM-TER", "codigo_interno": "INT-TTM",
                        "descripcion": "Trampa termodinámica para vapor de media presión 1/2 NPT",
                        "precio": 3100.0, "moneda": "MXN", "tiempo_entrega": "1 semana",
                        "recomendaciones": "Drenaje de condensado en líneas de vapor saturado.",
                        "valores_atributos": json.dumps({"presion_max": "42 bar", "conexion": "1/2 NPT"})
                    },
                    {
                        "id": 9015, "categoria_id": "cat-1", "marca": "SMC", "num_proveedor": "P-002",
                        "codigo": "SIL-1/4", "codigo_interno": "INT-S14",
                        "descripcion": "Silenciador neumático de bronce sinterizado 1/4 NPT",
                        "precio": 65.0, "moneda": "MXN", "tiempo_entrega": "Stock",
                        "recomendaciones": "Reduce ruido de escape en válvulas direccionales.",
                        "valores_atributos": json.dumps({"material": "Bronce Sinterizado", "rosca": "1/4 NPT"})
                    }
                ]
                import ai
                for p in seed_products:
                    try:
                        p["vector"] = ai.get_embedding(p["descripcion"])
                    except Exception:
                        p["vector"] = [0.0] * 384
                
                new_rows = pd.DataFrame(seed_products)
                updated_df = pd.concat([df_cat, new_rows], ignore_index=True)
                update_table_from_df("catalogo", updated_df)
    except Exception as e:
        print(f"Error inyectando semillas en catalogo: {e}")

def get_table_as_df(table_name):
    """
    Retorna los datos de una tabla de LanceDB como un DataFrame de Pandas.
    """
    if table_name not in db.table_names():
        raise ValueError(f"La tabla {table_name} no existe.")
    return db.open_table(table_name).to_pandas()

def update_table_from_df(table_name, df):
    """
    Sobrescribe o actualiza la tabla de LanceDB con un nuevo DataFrame.
    """
    # Para LanceDB, podemos simplemente sobrescribir usando la conexión.
    # Recreamos la tabla construyendo el esquema dinámicamente para soportar nuevas columnas.
    try:
        tbl = db.open_table(table_name)
        old_schema = tbl.schema
        existing_fields = {f.name: f.type for f in old_schema}
    except Exception:
        existing_fields = {}

    new_fields = []
    for col in df.columns:
        if col in existing_fields:
            new_fields.append((col, existing_fields[col]))
        else:
            # Inferir tipo básico para columnas nuevas
            if df[col].dtype == 'float64':
                new_fields.append((col, pa.float64()))
            elif df[col].dtype == 'int64':
                new_fields.append((col, pa.int64()))
            else:
                new_fields.append((col, pa.string()))
                
    schema = pa.schema(new_fields)
    db.create_table(table_name, data=df, schema=schema, mode="overwrite")

def execute_analytics_query(query_str, **tables):
    """
    Ejecuta una consulta en DuckDB sobre las tablas proporcionadas.
    Las tablas se pasan como dataframes de pandas mapeados en kwargs.
    """
    # DuckDB puede consultar directamente las variables de pandas locales pasadas al entorno.
    # Registramos las tablas en el contexto de DuckDB
    con = duckdb.connect()
    for name, df in tables.items():
        con.register(name, df)
    
    res = con.execute(query_str).fetchdf()
    return res.to_dict(orient="records")
