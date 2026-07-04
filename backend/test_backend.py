import sys
import os

# Añadir directorio actual al path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

import database as db
import ai

print("=== INICIANDO PRUEBA DE BACKEND LOCAL ===")

# 1. Verificar directorios
print(f"Directorio de Base de Datos: {db.LANCE_DB_PATH}")

# 2. Inicializar DB (con semillas)
print("Inicializando base de datos local (LanceDB)...")
db.init_db()

# 3. Listar tablas creadas
tablas = db.db.table_names()
print(f"Tablas disponibles en LanceDB: {tablas}")

# 4. Verificar datos de cotizaciones
try:
    df_coti = db.get_table_as_df("cotizaciones")
    print(f"Número de cotizaciones cargadas: {len(df_coti)}")
    print(df_coti[["No_Cotizacion", "Cliente", "Monto", "Estatus"]])
except Exception as e:
    print(f"Error cargando cotizaciones: {e}")

# 5. Probar consulta DuckDB sobre LanceDB
try:
    df_proc = db.get_table_as_df("procesamiento")
    print("\nEjecutando agrupamiento de ventas con DuckDB...")
    query = """
    SELECT Cliente, SUM(Monto) as TotalVentas, AVG(Margen) as MargenPromedio
    FROM df_proc
    GROUP BY Cliente
    ORDER BY TotalVentas DESC
    """
    res = db.execute_analytics_query(query, df_proc=df_proc)
    print("Resultados de DuckDB (Pareto):")
    for r in res:
        print(f"- {r['Cliente']}: Ventas = ${r['TotalVentas']:.2f}, Margen = {r['MargenPromedio']:.1f}%")
except Exception as e:
    print(f"Error en consulta de DuckDB: {e}")

# 6. Probar embeddings locales (all-MiniLM-L6-v2)
print("\nProbando generación de embeddings locales...")
try:
    texto = "Válvula de mariposa de acero inoxidable de 2 pulgadas"
    vec = ai.get_embedding(texto)
    print(f"Embedding generado correctamente. Dimensiones: {len(vec)}")
    print(f"Primeros 5 valores del vector: {vec[:5]}")
except Exception as e:
    print(f"Error generando embedding: {e}")

# 7. Verificar Ollama
print("\nVerificando conexión con Ollama...")
ollama_ok, models = ai.check_ollama_status()
if ollama_ok:
    print(f"Ollama está activo. Modelos disponibles: {models}")
else:
    print("Ollama está offline o inactivo (degradación a modo fallback funcionando).")

print("=== PRUEBA DE BACKEND COMPLETADA ===")
