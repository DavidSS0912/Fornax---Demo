import requests
import json
import numpy as np
import os

OLLAMA_URL = "http://127.0.0.1:11434"
DEFAULT_MODEL = "phi3" # Modelo por defecto ligero y rápido para 8GB RAM

import sys
if getattr(sys, 'frozen', False):
    _config_dir = os.path.join(os.path.expanduser("~"), ".fornax_crm", "data")
    os.makedirs(_config_dir, exist_ok=True)
    CONFIG_FILE = os.path.join(_config_dir, "ai_config.json")
else:
    _config_dir = os.path.join(os.path.expanduser("~"), ".fornax_crm", "data")
    os.makedirs(_config_dir, exist_ok=True)
    CONFIG_FILE = os.path.join(_config_dir, "ai_config.json")

DEFAULT_CONFIG = {
    "cross_selling": {
        "temperature": 0.4,
        "min_similarity": 0.4
    },
    "chat_tecnico": {
        "temperature": 0.4,
        "num_ctx": 2048,
        "num_predict": 512
    },
    "sistema": {
        "keep_alive": "5m"
    }
}

def load_ai_config():
    if not os.path.exists(CONFIG_FILE):
        return DEFAULT_CONFIG
    try:
        with open(CONFIG_FILE, "r") as f:
            return json.load(f)
    except Exception:
        return DEFAULT_CONFIG

def save_ai_config(config):
    try:
        os.makedirs(os.path.dirname(CONFIG_FILE), exist_ok=True)
        with open(CONFIG_FILE, "w") as f:
            json.dump(config, f, indent=2)
        return True
    except Exception as e:
        print(f"Error guardando configuración de IA: {e}")
        return False


_embedding_model = None

def get_embedding_model():
    """
    Carga de forma perezosa el modelo de embeddings all-MiniLM-L6-v2.
    """
    global _embedding_model
    if _embedding_model is None:
        try:
            from sentence_transformers import SentenceTransformer
            # Carga el modelo ultra-ligero localmente (menos de 100MB)
            _embedding_model = SentenceTransformer('paraphrase-multilingual-MiniLM-L12-v2')
        except Exception as e:
            print(f"Advertencia: No se pudo cargar SentenceTransformer: {e}")
            _embedding_model = "fallback"
    return _embedding_model

def get_embedding(text):
    """
    Genera un vector de 384 dimensiones para el texto dado.
    Si falla el modelo, devuelve un vector de ceros.
    """
    model = get_embedding_model()
    if model == "fallback" or model is None:
        # Vector con norma 1 para evitar errores de división por cero en LanceDB
        fallback_vec = [0.0] * 384
        fallback_vec[0] = 1.0
        return fallback_vec
    try:
        embedding = model.encode(text)
        return embedding.tolist()
    except Exception as e:
        print(f"Error generando embedding: {e}")
        fallback_vec = [0.0] * 384
        fallback_vec[0] = 1.0
        return fallback_vec

def check_ollama_status():
    """
    Verifica si Ollama está activo y respondiendo localmente.
    """
    try:
        response = requests.get(f"{OLLAMA_URL}/api/tags", timeout=3.0)
        if response.status_code == 200:
            models = [m['name'] for m in response.json().get('models', [])]
            return True, models
    except Exception:
        pass
    return False, []

def query_ollama(prompt, system_prompt="", options=None, keep_alive=None):
    """
    Consulta a Ollama localmente. Si está inactivo, devuelve None.
    """
    is_active, models = check_ollama_status()
    if not is_active:
        return None
    
    # Elegir el primer modelo disponible o el default
    model_to_use = DEFAULT_MODEL
    if models:
        # Si el default está descargado, usarlo; si no, usar el primero disponible
        matching = [m for m in models if DEFAULT_MODEL in m.lower()]
        if matching:
            model_to_use = matching[0]
        else:
            model_to_use = models[0]
            
    payload = {
        "model": model_to_use,
        "prompt": prompt,
        "system": system_prompt,
        "stream": False,
        "options": options or {
            "temperature": 0.4
        }
    }
    
    if keep_alive is not None:
        payload["keep_alive"] = keep_alive
        
    try:
        response = requests.post(f"{OLLAMA_URL}/api/generate", json=payload, timeout=120.0)
        if response.status_code == 200:
            return response.json().get("response", "").strip()
    except Exception as e:
        print(f"Error llamando a Ollama: {e}")
    return None

def query_ollama_stream(prompt, system_prompt="", options=None, keep_alive=None):
    """
    Consulta a Ollama localmente y hace streaming de la respuesta.
    Si falla, emite un token de error para fallback.
    """
    model_to_use = DEFAULT_MODEL
    try:
        res = requests.get(f"{OLLAMA_URL}/api/tags", timeout=3.0)
        if res.status_code == 200:
            models = [m['name'] for m in res.json().get('models', [])]
            matching = [m for m in models if DEFAULT_MODEL in m.lower()]
            if matching:
                model_to_use = matching[0]
            elif models:
                model_to_use = models[0]
    except Exception:
        pass
            
    payload = {
        "model": model_to_use,
        "prompt": prompt,
        "system": system_prompt,
        "stream": True,
        "options": options or {
            "temperature": 0.4
        }
    }
    
    if keep_alive is not None:
        payload["keep_alive"] = keep_alive
        
    success = False
    try:
        with requests.post(f"{OLLAMA_URL}/api/generate", json=payload, stream=True, timeout=120.0) as response:
            if response.status_code == 200:
                success = True
                for line in response.iter_lines():
                    if line:
                        try:
                            data = json.loads(line.decode('utf-8'))
                            yield data.get("response", "")
                        except Exception as e:
                            print(f"Error decodificando chunk de Ollama: {e}")
    except Exception as e:
        print(f"Error llamando a Ollama (stream): {e}")
        
    if not success:
        yield "__OLLAMA_ERROR__"

# Mocks para degradación elegante (si Ollama está offline)
def fallback_suggest_close(quote_data):
    cliente = quote_data.get('Cliente', 'Cliente')
    pedido = quote_data.get('Pedido', 'Productos Industriales')
    try:
        monto = float(str(quote_data.get('Monto', 0)).replace(',', '').replace('$', ''))
    except (ValueError, TypeError):
        monto = 0.0
    no_coti = quote_data.get('No_Cotizacion', 'COT-xxxx')
    dias = quote_data.get('dias_abierta', 5)
    
    email = f"""Asunto: Seguimiento de propuesta comercial {no_coti} - {pedido}

Estimado cliente de {cliente},

Espero que se encuentre muy bien. Le escribo para dar seguimiento a la cotización {no_coti} por concepto de "{pedido}" con un monto total de ${monto:,.2f} MXN, enviada hace {dias} días.

Estamos a su entera disposición para aclarar cualquier duda técnica respecto a las especificaciones de los equipos, tiempos de entrega o condiciones de pago. 

¿Habrá oportunidad de agendar una breve llamada de 5 minutos esta semana para revisar el estatus de este proyecto?

Quedo atento a sus amables comentarios.

Atentamente,
Asistente Comercial"""
    return email

def fallback_rag_format(query, search_results):
    if not search_results:
        return f"No encontré productos específicos en LanceDB relacionados con '{query}'. Por favor, intenta describir el producto de otra forma."
        
    lineas = []
    lineas.append(f"ASISTENTE NOVA - RESULTADOS DE BÚSQUEDA DIRECTA\nConsulta: '{query}'\n" + "-" * 50)
    for i, prod in enumerate(search_results, 1):
        valores_attr = {}
        try:
            valores_attr = json.loads(prod.get("valores_atributos", "{}"))
        except Exception:
            pass
        attr_str = ", ".join([f"{k}: {v}" for k, v in valores_attr.items()])
        
        try:
            precio = float(str(prod.get('precio', 0)).replace(',', '').replace('$', ''))
        except (ValueError, TypeError):
            precio = 0.0
            
        lineas.append(
            f"OPCIÓN {i}:\n"
            f"- SKU: {prod.get('codigo', 'N/D')} | MARCA: {prod.get('marca', 'N/D')}\n"
            f"- DESCRIPCIÓN: {prod.get('descripcion', 'N/D')}\n"
            f"- PRECIO Y ENTREGA: ${precio:,.2f} {prod.get('moneda', '')} - {prod.get('tiempo_entrega', 'N/D')}\n"
            f"- ATRIBUTOS TÉCNICOS: {attr_str}\n"
        )
    
    lineas.append(
        "--- \nNota: Resultados generados mediante búsqueda de catálogo estándar (Modo rápido)."
    )
    
    return "\n".join(lineas)

# Funciones de Inteligencia Comercial
def generate_closing_suggestion(quote_data):
    """
    Genera un correo o estrategia de seguimiento de ventas para una cotización estancada.
    """
    is_ollama_active, _ = check_ollama_status()
    if not is_ollama_active:
        return fallback_suggest_close(quote_data)
        
    config = load_ai_config()
    chat_config = config.get("chat_tecnico", {})
    keep_alive_val = config.get("sistema", {}).get("keep_alive", "5m")
    
    ollama_options = {
        "temperature": chat_config.get("temperature", 0.4),
        "num_ctx": chat_config.get("num_ctx", 2048),
        "num_predict": chat_config.get("num_predict", 512)
    }
    
    try:
        monto = float(str(quote_data.get('Monto', 0)).replace(',', '').replace('$', ''))
    except (ValueError, TypeError):
        monto = 0.0
        
    prompt = f"""Genera una plantilla de correo profesional en español para dar seguimiento a una cotización estancada.
Detalles de la cotización:
- Número de Cotización: {quote_data.get('No_Cotizacion')}
- Cliente: {quote_data.get('Cliente')}
- Pedido: {quote_data.get('Pedido')}
- Monto: ${monto:,.2f} MXN
- Días estancada: {quote_data.get('dias_abierta')} días
- Nivel de prioridad: {quote_data.get('Prioridad')}

El correo debe ser persuasivo, respetuoso, ir directo al grano y motivar al cliente a responder sobre el estatus del proyecto.
Agrega una sección breve al final con 'Estrategia Recomendada' en 2 viñetas."""

    system_prompt = "Eres Nova, una IA experta en ventas industriales de instrumentación y control de fluidos. Redacta de forma profesional y concisa."
    
    response = query_ollama(prompt, system_prompt, options=ollama_options, keep_alive=keep_alive_val)
    if response:
        return response
    return fallback_suggest_close(quote_data)

def generate_closing_suggestion_stream(quote_data):
    """
    Genera un correo o estrategia de seguimiento de ventas para una cotización estancada (Streaming).
    """
    config = load_ai_config()
    chat_config = config.get("chat_tecnico", {})
    keep_alive_val = config.get("sistema", {}).get("keep_alive", "5m")
    
    ollama_options = {
        "temperature": chat_config.get("temperature", 0.4),
        "num_ctx": chat_config.get("num_ctx", 2048),
        "num_predict": chat_config.get("num_predict", 512)
    }
    
    try:
        monto = float(str(quote_data.get('Monto', 0)).replace(',', '').replace('$', ''))
    except (ValueError, TypeError):
        monto = 0.0
        
    prompt = f"""Genera una plantilla de correo profesional en español para dar seguimiento a una cotización estancada.
Detalles de la cotización:
- Número de Cotización: {quote_data.get('No_Cotizacion')}
- Cliente: {quote_data.get('Cliente')}
- Pedido: {quote_data.get('Pedido')}
- Monto: ${monto:,.2f} MXN
- Días estancada: {quote_data.get('dias_abierta')} días
- Nivel de prioridad: {quote_data.get('Prioridad')}

El correo debe ser persuasivo, respetuoso, ir directo al grano y motivar al cliente a responder sobre el estatus del proyecto.
Agrega una sección breve al final con 'Estrategia Recomendada' en 2 viñetas."""

    system_prompt = "Eres Nova, una IA experta en ventas industriales de instrumentación y control de fluidos. Redacta de forma profesional y concisa."
    
    stream_gen = query_ollama_stream(prompt, system_prompt, options=ollama_options, keep_alive=keep_alive_val)
    first_chunk = next(stream_gen, None)
    
    if first_chunk == "__OLLAMA_ERROR__":
        yield fallback_suggest_close(quote_data)
        return
        
    if first_chunk:
        yield first_chunk
        
    for chunk in stream_gen:
        yield chunk

def perform_rag_search(query, db_conn):
    """
    Vectoriza la consulta, busca en la tabla 'catalogo' de LanceDB y formatea la respuesta con IA.
    """
    config = load_ai_config()
    min_similarity = config.get("cross_selling", {}).get("min_similarity", 0.15)
    chat_config = config.get("chat_tecnico", {})
    keep_alive_val = config.get("sistema", {}).get("keep_alive", "5m")

    # 1. Vectorizar la consulta
    query_vector = get_embedding(query)
    
    # 2. Buscar en LanceDB
    try:
        tbl = db_conn.open_table("catalogo")
        # LanceDB realiza búsqueda vectorial de vecino más cercano (NNS)
        search_results_df = tbl.search(query_vector).metric("cosine").limit(3).to_pandas()
    except Exception as e:
        print(f"Error en búsqueda RAG (LanceDB): {e}")
        import pandas as pd
        search_results_df = pd.DataFrame()
    
    # Convertir resultados a lista de dicts y filtrar por min_similarity
    results = []
    if not search_results_df.empty:
        raw_results = search_results_df.to_dict(orient="records")
        for r in raw_results:
            distance = r.get("_distance", 1.0)
            similarity = 1.0 - float(distance)
            if similarity >= min_similarity:
                results.append(r)
                
        # Si ninguno supera el umbral, tomamos el mejor de todos modos para no dejar al usuario sin opciones
        if not results and raw_results:
            results.append(raw_results[0])
                
    # 3. Formatear con IA
    is_ollama_active, _ = check_ollama_status()
    if not results:
        return f"No encontré productos en el catálogo relacionados con '{query}'. Por favor, intenta describir el producto de otra forma."
    
    if not is_ollama_active:
        return fallback_rag_format(query, results)
        
    # Crear prompt context
    context = ""
    for idx, item in enumerate(results):
        valores_attr = {}
        try:
            valores_attr = json.loads(item.get("valores_atributos", "{}"))
        except Exception:
            pass
        attr_str = ", ".join([f"{k}: {v}" for k, v in valores_attr.items()])
        try:
            precio = float(str(item.get('precio', 0)).replace(',', '').replace('$', ''))
        except (ValueError, TypeError):
            precio = 0.0
            
        context += f"Producto {idx+1}:\n"
        context += f"- Código/SKU: {item.get('codigo')}\n"
        context += f"- Marca: {item.get('marca')}\n"
        context += f"- Descripción: {item.get('descripcion')}\n"
        context += f"- Precio: ${precio:,.2f} {item.get('moneda')}\n"
        context += f"- Tiempo de entrega: {item.get('tiempo_entrega')}\n"
        context += f"- Atributos Técnicos: {attr_str}\n"
        context += f"- Recomendaciones: {item.get('recomendaciones')}\n\n"
        
    prompt = f"""# CONTEXTO DE ENTRADA
El vendedor ingresó la siguiente consulta informal o requerimiento técnico:
"{query}"
    
Productos encontrados en la base de datos de LanceDB:
{context}

# INSTRUCCIONES DE PROCESAMIENTO
1. Identifica el producto principal que resuelve directamente la necesidad de la consulta y asígnalo al bloque "Código Solicitado".
2. Si existen productos adicionales o relacionados en el contexto de LanceDB, clasifícalos en el bloque "Códigos Sugeridos / Complementarios".
3. Extrae con precisión: SKU, Marca, Descripción, Precio, Tiempo de entrega y Recomendación de uso.

# FORMATO DE SALIDA
Debes estructurar tu respuesta estrictamente bajo el siguiente formato de texto plano. Reemplaza los elementos entre corchetes con la información técnica correspondiente:

**Código Solicitado:**
- **SKU:** [SKU] | **Marca:** [Marca]
- **Descripción:** [Descripción técnica concisa]
- **Precio y Entrega:** [Precio] - [Tiempo de entrega]
- **Recomendación de uso:** [Nota técnica breve sobre su aplicación]

**Códigos Sugeridos / Complementarios:**
- **SKU:** [SKU] | **Marca:** [Marca] | **Relación:** [Razón técnica de por qué complementa o sustituye al principal] | **Precio:** [Precio]
"""

    system_prompt = """# ROL Y CONTEXTO
Eres "Nova", una IA de soporte técnico y cotizaciones de élite, especializada en control de fluidos e instrumentación industrial para la empresa Tuvanosa. Operas en un entorno local optimizado bajo Ollama (modelo Phi-3). Tu actitud es servicial y profesional, pero tu estilo de comunicación es extremadamente breve, directo y de naturaleza técnica.

# OBJETIVO PRINCIPAL
Asistir a los asesores comerciales interpretando sus requerimientos técnicos, analizando los datos extraídos de la base de datos vectorial LanceDB para recomendar los productos más idóneos (código solicitado) y asociar de forma lógica los componentes secundarios (códigos sugeridos o complementarios).

# RESTRICCIONES Y REGLAS ESTRICTAS
1. Verdad Absoluta (Anti-Alucinación): Tu única fuente de conocimiento son los datos crudos provistos en el contexto de LanceDB. Si un producto, SKU o característica no está explícitamente en el texto, asume que no existe. Prohibido inventar o deducir información técnica.
2. Brevedad Radical: Ve directo al grano técnico. Elimina saludos introductorios, comentarios de cortesía o conclusiones de relleno. 
3. Prohibición de Tablas: No generes tablas en formato Markdown. Toda la salida debe ser texto plano estructurado con viñetas limpias para optimizar el procesamiento.
4. Disparador de Capacidades (Override): Si la consulta del usuario solicita explícitamente saber tus capacidades, debes ignorar el flujo de cotización y responder: "Hola. Soy Nova, tu asistente de IA. Estoy diseñada para ayudarte a buscar códigos de productos, identificar sus características técnicas y sugerirte componentes complementarios o alternativos utilizando exclusivamente nuestra base de datos interna."
"""
    
    ollama_options = {
        "temperature": chat_config.get("temperature", 0.4),
        "num_ctx": chat_config.get("num_ctx", 2048),
        "num_predict": chat_config.get("num_predict", 512)
    }
    
    response = query_ollama(prompt, system_prompt, options=ollama_options, keep_alive=keep_alive_val)
    if response:
        return response
    return fallback_rag_format(query, results)

def perform_rag_search_stream(query, db_conn):
    """
    Vectoriza la consulta, busca en la tabla 'catalogo' de LanceDB y formatea la respuesta con IA (Streaming).
    """
    config = load_ai_config()
    min_similarity = config.get("cross_selling", {}).get("min_similarity", 0.15)
    chat_config = config.get("chat_tecnico", {})
    keep_alive_val = config.get("sistema", {}).get("keep_alive", "5m")

    # 1. Vectorizar la consulta
    query_vector = get_embedding(query)
    
    # 2. Buscar en LanceDB
    try:
        tbl = db_conn.open_table("catalogo")
        search_results_df = tbl.search(query_vector).metric("cosine").limit(3).to_pandas()
    except Exception as e:
        print(f"Error en búsqueda RAG Stream (LanceDB): {e}")
        import pandas as pd
        search_results_df = pd.DataFrame()
    
    # Convertir resultados a lista de dicts y filtrar por min_similarity
    results = []
    if not search_results_df.empty:
        raw_results = search_results_df.to_dict(orient="records")
        for r in raw_results:
            distance = r.get("_distance", 1.0)
            similarity = 1.0 - float(distance)
            if similarity >= min_similarity:
                results.append(r)
                
        # Si ninguno supera el umbral, tomamos el mejor de todos modos
        if not results and raw_results:
            results.append(raw_results[0])
                
    # 3. Formatear con IA
    if not results:
        yield f"No encontré productos en el catálogo relacionados con '{query}'. Por favor, intenta describir el producto de otra forma."
        return
        
    # Crear prompt context
    context = ""
    for idx, item in enumerate(results):
        valores_attr = {}
        try:
            valores_attr = json.loads(item.get("valores_atributos", "{}"))
        except Exception:
            pass
        attr_str = ", ".join([f"{k}: {v}" for k, v in valores_attr.items()])
        try:
            precio = float(str(item.get('precio', 0)).replace(',', '').replace('$', ''))
        except (ValueError, TypeError):
            precio = 0.0
            
        context += f"Producto {idx+1}:\n"
        context += f"- Código/SKU: {item.get('codigo')}\n"
        context += f"- Marca: {item.get('marca')}\n"
        context += f"- Descripción: {item.get('descripcion')}\n"
        context += f"- Precio: ${precio:,.2f} {item.get('moneda')}\n"
        context += f"- Tiempo de entrega: {item.get('tiempo_entrega')}\n"
        context += f"- Atributos Técnicos: {attr_str}\n"
        context += f"- Recomendaciones: {item.get('recomendaciones')}\n\n"
        
    prompt = f"""# CONTEXTO DE ENTRADA
El vendedor ingresó la siguiente consulta informal o requerimiento técnico:
"{query}"
    
Productos encontrados en la base de datos de LanceDB:
{context}

# INSTRUCCIONES DE PROCESAMIENTO
1. Identifica el producto principal que resuelve directamente la necesidad de la consulta y asígnalo al bloque "Código Solicitado".
2. Si existen productos adicionales o relacionados en el contexto de LanceDB, clasifícalos en el bloque "Códigos Sugeridos / Complementarios".
3. Extrae con precisión: SKU, Marca, Descripción, Precio, Tiempo de entrega y Recomendación de uso.
4. IMPORTANTE: Sé extremadamente conciso y directo, sin rodeos ni explicaciones largas.
5. NO uses formato Markdown (como negritas o asteriscos). Usa solo mayúsculas y texto plano (ejemplo: CODIGO SOLICITADO).

# FORMATO DE SALIDA
Debes estructurar tu respuesta estrictamente bajo el siguiente formato de texto plano limpio:

CODIGO SOLICITADO:
- SKU: [SKU] | MARCA: [Marca]
- DESCRIPCION: [Descripción técnica concisa]
- PRECIO Y ENTREGA: [Precio] - [Tiempo de entrega]
- RECOMENDACION DE USO: [Nota técnica breve sobre su aplicación]

CODIGOS SUGERIDOS / COMPLEMENTARIOS:
- SKU: [SKU] | MARCA: [Marca] | RELACION: [Razón técnica de por qué complementa] | PRECIO: [Precio]
"""

    system_prompt = """# ROL Y CONTEXTO
Eres "Nova", una IA de soporte técnico y cotizaciones de élite. Operas en un entorno local. Tu actitud es servicial y profesional, pero tu estilo de comunicación es extremadamente breve, directo y de naturaleza técnica.

# RESTRICCIONES Y REGLAS ESTRICTAS
1. Verdad Absoluta: Tu única fuente de conocimiento son los datos crudos de LanceDB.
2. Brevedad Radical: Ve directo al grano técnico.
3. Cero Markdown: Prohibido usar negritas (**) o cursivas. Usa TEXTO PLANO LIMPIO porque la salida se mostrará en una caja de texto simple.
"""
    
    ollama_options = {
        "temperature": chat_config.get("temperature", 0.4),
        "num_ctx": chat_config.get("num_ctx", 2048),
        "num_predict": chat_config.get("num_predict", 512)
    }
    
    stream_gen = query_ollama_stream(prompt, system_prompt, options=ollama_options, keep_alive=keep_alive_val)
    first_chunk = next(stream_gen, None)
    
    if first_chunk == "__OLLAMA_ERROR__":
        yield fallback_rag_format(query, results)
        return
        
    if first_chunk:
        yield first_chunk
        
    for chunk in stream_gen:
        yield chunk

def generate_cross_selling_suggestion(client_data, last_purchased_products, db_conn):
    """
    Genera una propuesta de venta cruzada (cross-selling) dinámica utilizando IA y búsqueda semántica en LanceDB.
    """
    is_ollama_active, _ = check_ollama_status()
    
    config = load_ai_config()
    min_similarity = config.get("cross_selling", {}).get("min_similarity", 0.10)
    cross_selling_temp = config.get("cross_selling", {}).get("temperature", 0.4)
    keep_alive_val = config.get("sistema", {}).get("keep_alive", "5m")
    
    # Resolver los SKUs a sus descripciones en el catálogo para una mejor búsqueda semántica
    purchased_descriptions = []
    if last_purchased_products:
        try:
            tbl = db_conn.open_table("catalogo")
            catalog_df = tbl.to_pandas()
            for sku in last_purchased_products:
                matching_rows = catalog_df[catalog_df["codigo"] == sku]
                if not matching_rows.empty:
                    desc_text = matching_rows.iloc[0]["descripcion"]
                    purchased_descriptions.append(desc_text)
                else:
                    purchased_descriptions.append(sku)
        except Exception as e:
            print(f"Error resolviendo SKUs: {e}")
            purchased_descriptions = last_purchased_products
            
    # Si no hay compras previas, sugerimos basándonos en los tags del cliente
    if not purchased_descriptions:
        tags_str = ", ".join(client_data.get("tags", []))
        query_text = f"Accesorios y refacciones para {tags_str}"
    else:
        query_text = f"Accesorios y complementos para {', '.join(purchased_descriptions)}"
        
    # Buscar en LanceDB
    query_vector = get_embedding(query_text)
    try:
        tbl = db_conn.open_table("catalogo")
        search_results_df = tbl.search(query_vector).metric("cosine").limit(3).to_pandas()
    except Exception as e:
        print(f"Error en búsqueda cross-selling (LanceDB): {e}")
        import pandas as pd
        search_results_df = pd.DataFrame()
    
    results = []
    if not search_results_df.empty:
        raw_results = search_results_df.to_dict(orient="records")
        for r in raw_results:
            distance = r.get("_distance", 1.0)
            similarity = 1.0 - float(distance)
            if similarity >= min_similarity:
                # Evitar sugerir exactamente el mismo producto comprado
                if r.get("codigo") not in (last_purchased_products or []):
                    results.append(r)
                    
        # Si no hay resultados que superen el umbral, tomamos el mejor de todos modos
        if not results and raw_results:
            for r in raw_results:
                if r.get("codigo") not in (last_purchased_products or []):
                    results.append(r)
                    break
                    
    if not results:
        return f"No se detectaron asociaciones de venta cruzada para el cliente {client_data.get('empresa')} en base a su perfil."
        
    # Formatear la propuesta con IA
    if not is_ollama_active:
        p = results[0]
        try:
            precio = float(str(p.get('precio', 0)).replace(',', '').replace('$', ''))
        except (ValueError, TypeError):
            precio = 0.0
        return f"Patrón Detectado (Reglas Locales):\nClientes de {client_data.get('empresa')} que compraron productos anteriores suelen requerir {p.get('descripcion')}.\n\nRecomendación de venta cruzada: {p.get('codigo')} ({p.get('marca')}) - Monto: ${precio:,.2f} MXN"

    context = ""
    for idx, item in enumerate(results):
        try:
            precio = float(str(item.get('precio', 0)).replace(',', '').replace('$', ''))
        except (ValueError, TypeError):
            precio = 0.0
            
        context += f"Producto sugerido {idx+1}:\n"
        context += f"- Código: {item.get('codigo')}\n"
        context += f"- Marca: {item.get('marca')}\n"
        context += f"- Descripción: {item.get('descripcion')}\n"
        context += f"- Precio: ${precio:,.2f} {item.get('moneda')}\n"
        context += f"- Recomendaciones: {item.get('recomendaciones')}\n\n"
        
    prompt = f"""Genera una recomendación de venta cruzada (cross-selling) en español para el cliente:
- Empresa: {client_data.get('empresa')}
- Perfil técnico del cliente (tags): {', '.join(client_data.get('tags', []))}
- Últimas compras registradas: {', '.join(last_purchased_products) if last_purchased_products else 'Ninguna'}

Productos del catálogo semánticamente asociados:
{context}

Redacta un párrafo persuasivo y breve que explique por qué estos productos son ideales para complementar sus adquisiciones previas. Al final, escribe exactamente la línea:
'Artículo recomendado de venta cruzada: [SKU]' utilizando el SKU del producto más idóneo."""

    system_prompt = "Eres Nova, una IA de análisis de ventas experta en recomendar accesorios técnicos e instrumentación industrial."
    
    ollama_options = {
        "temperature": cross_selling_temp
    }
    
    response = query_ollama(prompt, system_prompt, options=ollama_options, keep_alive=keep_alive_val)
    if response:
        return response
        
    p = results[0]
    return f"Patrón Detectado:\nClientes de {client_data.get('empresa')} que compraron productos anteriores suelen requerir {p.get('descripcion')}.\n\nArtículo recomendado de venta cruzada: {p.get('codigo')}"
