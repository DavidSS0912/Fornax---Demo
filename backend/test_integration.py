import requests
import json
import sys

BASE_URL = "http://localhost:8000"

print("=== INICIANDO PRUEBAS DE INTEGRACIÓN API ===")

# 1. Test GET /api/ai/config
try:
    print("\n1. Obteniendo configuración de IA...")
    resp = requests.get(f"{BASE_URL}/api/ai/config")
    if resp.status_code == 200:
        config = resp.json()
        print(f"Configuración cargada: {json.dumps(config, indent=2)}")
    else:
        print(f"Error cargando config: {resp.status_code} - {resp.text}")
        sys.exit(1)
except Exception as e:
    print(f"Error conectando al backend: {e}")
    sys.exit(1)

# 2. Test POST /api/ai/config
try:
    print("\n2. Actualizando configuración de IA...")
    new_config = {
        "cross_selling": {
            "temperature": 0.5,
            "min_similarity": 0.35
        },
        "chat_tecnico": {
            "temperature": 0.3,
            "num_ctx": 4096,
            "num_predict": 256
        },
        "sistema": {
            "keep_alive": "30m"
        }
    }
    resp = requests.post(f"{BASE_URL}/api/ai/config", json=new_config)
    if resp.status_code == 200:
        print(f"Respuesta de guardado: {resp.json()}")
        
        # Verificar que se guardó
        resp2 = requests.get(f"{BASE_URL}/api/ai/config")
        saved_config = resp2.json()
        assert saved_config["cross_selling"]["temperature"] == 0.5
        assert saved_config["chat_tecnico"]["num_ctx"] == 4096
        print("Configuración guardada y verificada correctamente.")
    else:
        print(f"Error guardando config: {resp.status_code} - {resp.text}")
        sys.exit(1)
except Exception as e:
    print(f"Error guardando/verificando config: {e}")
    sys.exit(1)

# 3. Test GET /api/ai/cross-selling/{client_num}
try:
    # C-999 es KANG SEO MEXICANA, quien tiene compras registradas del Worcester valve WOR-59-2.
    # El sistema debería buscar accesorios/complementos en LanceDB y proponer el actuador WOR-ACT-10.
    print("\n3. Obteniendo sugerencias de Cross-Selling para C-999...")
    resp = requests.get(f"{BASE_URL}/api/ai/cross-selling/C-999")
    if resp.status_code == 200:
        res = resp.json()
        print(f"Propuesta de venta cruzada recibida:")
        print(res.get("suggestion"))
    else:
        print(f"Error al obtener cross-selling: {resp.status_code} - {resp.text}")
        sys.exit(1)
except Exception as e:
    print(f"Error en cross-selling: {e}")
    sys.exit(1)

# 4. Test POST /api/ai/search-rag
try:
    print("\n4. Probando búsqueda semántica RAG...")
    payload = {"query": "válvula de bola de acero inoxidable"}
    resp = requests.post(f"{BASE_URL}/api/ai/search-rag", json=payload)
    if resp.status_code == 200:
        res = resp.json()
        print("Respuesta de búsqueda RAG:")
        print(res.get("response")[:400] + "...")
    else:
        print(f"Error RAG: {resp.status_code} - {resp.text}")
        sys.exit(1)
except Exception as e:
    print(f"Error RAG: {e}")
    sys.exit(1)

print("\n=== PRUEBAS DE INTEGRACIÓN COMPLETADAS CON ÉXITO ===")
