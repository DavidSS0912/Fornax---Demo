import os
import json
from fastapi import FastAPI, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, StreamingResponse
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import pandas as pd
import numpy as np

import database as db
import ai

app = FastAPI(title="CRM Industrial API", description="API local optimizada con LanceDB, DuckDB y Ollama")

# Configurar CORS para desarrollo local
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Permitir todos en entorno local privado
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- INICIALIZACIÓN ---
@app.on_event("startup")
def startup_event():
    """
    Inicializa la base de datos de LanceDB y genera datos iniciales al arrancar la app.
    """
    db.init_db(ai_helper=ai)

# --- MODELOS PYDANTIC ---
class QuoteItem(BaseModel):
    id: Optional[int] = None
    Pedido: Optional[str] = ""
    No_Cotizacion: Optional[str] = ""
    num_cliente: Optional[str] = ""
    Cliente: Optional[str] = ""
    equipo_id: Optional[str] = ""
    Categoría: Optional[str] = ""
    Estatus: Optional[str] = ""
    Progreso: Optional[str] = ""
    Prioridad: Optional[str] = ""
    Monto: Optional[float] = 0.0
    moneda_cotizacion: Optional[str] = "MXN"
    tipo_cambio: Optional[float] = 1.0
    monto_original: Optional[float] = 0.0
    Margen: Optional[float] = 0.0
    Entrega: Optional[str] = ""
    dias_abierta: Optional[int] = 0
    codigos_facturar: Optional[str] = ""
    cantidad_pz: Optional[int] = 0
    fecha_llegada: Optional[str] = ""
    notas: Optional[str] = ""
    ref_cliente: Optional[str] = ""
    ref_proveedor: Optional[str] = ""
    no_sp_ptt: Optional[str] = ""
    guia: Optional[str] = ""
    contacto_cliente: Optional[str] = ""
    vendedor: Optional[str] = ""
    coordinacion: Optional[str] = ""
    grupo_materiales: Optional[str] = ""
    porcentaje_cierre: Optional[float] = 0.0
    certificacion: Optional[str] = "No"
    importacion: Optional[str] = "No"
    pendiente_armado: Optional[str] = "No"
    num_proveedor: Optional[str] = ""
    Proveedor: Optional[str] = ""
    
    class Config:
        extra = "allow"

class ProcessItem(QuoteItem):
    class Config:
        extra = "allow"

class ConfigOpcionesItem(BaseModel):
    id: Optional[int] = None
    columna: str
    opciones: str # JSON String

class ClientItem(BaseModel):
    id: Optional[int] = None
    numero: str
    nombre: str
    puesto: str
    empresa: str
    telefono: str
    correo: str
    tags: List[str]
    nota: str
    equipo_id: str
    dias_sin_compra: Optional[int] = 0

class ProviderItem(BaseModel):
    id: Optional[int] = None
    numero: str
    nombre: str
    puesto: str
    empresa: str
    telefono: str
    correo: str
    descuento: str
    tags: List[str]
    compra_minima: float
    compra_envio_pagado: float
    nota: Optional[str] = ""

class ContactItem(BaseModel):
    id: Optional[int] = None
    entity_id: str
    nombre: str
    puesto: str
    telefono: str
    correo: str

class CategoryItem(BaseModel):
    id: Optional[str] = None
    nombre: str
    atributos: List[str]
    coordinacion: Optional[str] = ""

class ProductItem(BaseModel):
    id: Optional[int] = None
    categoria_id: str
    marca: str
    num_proveedor: str
    codigo: str
    codigo_interno: Optional[str] = ""
    descripcion: str
    precio: float
    moneda: str
    tiempo_entrega: str
    recomendaciones: str
    valores_atributos: Dict[str, Any] # Recibido como diccionario

class TeamItem(BaseModel):
    id: Optional[str] = None
    nombre: str

class VendorItem(BaseModel):
    id: Optional[int] = None
    nombre: str
    puesto: str
    celular: str
    correo: str
    equipo_id: str

class GoalItem(BaseModel):
    id: Optional[int] = None
    categoria: Optional[str] = ""
    marca: Optional[str] = ""
    objetivo: float
    actual: Optional[float] = 0.0

# --- ENDPOINTS CRUD ---

# Helper genérico para CRUD en LanceDB
def get_all_records(table_name: str):
    try:
        df = db.get_table_as_df(table_name)
        # Convertir nans a None para JSON
        df = df.where(pd.notnull(df), None)
        records = df.to_dict(orient="records")
        for r in records:
            for k, v in r.items():
                if hasattr(v, "tolist"):
                    r[k] = v.tolist()
        return records
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

def create_record(table_name: str, item_dict: dict):
    try:
        df = db.get_table_as_df(table_name)
        # Autogenerar ID numérico si no viene
        if "id" in item_dict and (item_dict["id"] is None or item_dict["id"] == 0):
            item_dict["id"] = int(pd.Series([r.get('id') for r in df.to_dict(orient="records")]).max() + 1) if not df.empty else 1
        
        # Para LanceDB creamos una nueva fila y la añadimos
        new_row = pd.DataFrame([item_dict])
        updated_df = pd.concat([df, new_row], ignore_index=True)
        db.update_table_from_df(table_name, updated_df)
        return item_dict
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

def update_record(table_name: str, record_id: Any, item_dict: dict, id_col: str = "id"):
    try:
        df = db.get_table_as_df(table_name)
        if df.empty:
            raise HTTPException(status_code=404, detail="Tabla vacía")
            
        # Buscar el índice del registro
        idx_list = df.index[df[id_col] == record_id].tolist()
        if not idx_list:
            raise HTTPException(status_code=404, detail="Registro no encontrado")
            
        # Actualizar fila
        idx = idx_list[0]
        for key, val in item_dict.items():
            if key not in df.columns:
                df[key] = ""
            df.at[idx, key] = val
                
        db.update_table_from_df(table_name, df)
        return item_dict
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

def delete_record(table_name: str, record_id: Any, id_col: str = "id"):
    try:
        df = db.get_table_as_df(table_name)
        # Filtrar el registro a eliminar
        updated_df = df[df[id_col] != record_id]
        if len(updated_df) == len(df):
            raise HTTPException(status_code=404, detail="Registro no encontrado")
        db.update_table_from_df(table_name, updated_df)
        return {"status": "success", "message": "Registro eliminado"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# 1. COTIZACIONES
@app.get("/api/cotizaciones", response_model=List[Dict[str, Any]])
def get_cotizaciones():
    quotes = get_all_records("cotizaciones")
    quotes = [q for q in quotes if q.get("Categoría") == "Cotización"]
    try:
        clients_df = db.get_table_as_df("clientes")
        clients_dict = dict(zip(clients_df["numero"], clients_df["empresa"]))
        for q in quotes:
            num = q.get("num_cliente")
            if num and num in clients_dict:
                q["Cliente"] = clients_dict[num]
        
        prov_df = db.get_table_as_df("proveedores")
        prov_dict = dict(zip(prov_df["numero"], prov_df["empresa"]))
        for q in quotes:
            num_prov = q.get("num_proveedor")
            if num_prov and num_prov in prov_dict:
                q["Proveedor"] = prov_dict[num_prov]

    except Exception as e:
        print(f"Error resolviendo clientes/proveedores en cotizaciones: {e}")
    return quotes

@app.post("/api/cotizaciones")
def create_cotizacion(item: QuoteItem):
    return create_record("cotizaciones", item.dict())

@app.put("/api/cotizaciones/{id}")
def update_cotizacion(id: int, item: QuoteItem):
    item_dict = item.dict()
    item_dict["id"] = id
    return update_record("cotizaciones", id, item_dict)

@app.delete("/api/cotizaciones/{id}")
def delete_cotizacion(id: int):
    return delete_record("cotizaciones", id)


# 2. PROCESAMIENTO
@app.get("/api/procesamiento", response_model=List[Dict[str, Any]])
def get_procesamiento():
    proc = get_all_records("cotizaciones")
    proc = [p for p in proc if p.get("Categoría") != "Cotización"]
    try:
        clients_df = db.get_table_as_df("clientes")
        clients_dict = dict(zip(clients_df["numero"], clients_df["empresa"]))
        for p in proc:
            num = p.get("num_cliente")
            if num and num in clients_dict:
                p["Cliente"] = clients_dict[num]
        
        prov_df = db.get_table_as_df("proveedores")
        prov_dict = dict(zip(prov_df["numero"], prov_df["empresa"]))
        for p in proc:
            num_prov = p.get("num_proveedor")
            if num_prov and num_prov in prov_dict:
                p["Proveedor"] = prov_dict[num_prov]

    except Exception as e:
        print(f"Error resolviendo clientes/proveedores en procesamiento: {e}")
    return proc

@app.post("/api/procesamiento")
def create_procesamiento(item: ProcessItem):
    return create_record("cotizaciones", item.dict())

@app.put("/api/procesamiento/{id}")
def update_procesamiento(id: int, item: ProcessItem):
    item_dict = item.dict()
    item_dict["id"] = id
    return update_record("cotizaciones", id, item_dict)

@app.delete("/api/procesamiento/{id}")
def delete_procesamiento(id: int):
    return delete_record("cotizaciones", id)


# 3. CLIENTES
@app.get("/api/clientes", response_model=List[Dict[str, Any]])
def get_clientes():
    return get_all_records("clientes")

@app.post("/api/clientes")
def create_cliente(item: ClientItem):
    return create_record("clientes", item.dict())

@app.put("/api/clientes/{id}")
def update_cliente(id: int, item: ClientItem):
    try:
        df = db.get_table_as_df("clientes")
        client_row = df[df["id"] == id]
        if client_row.empty:
            raise HTTPException(status_code=404, detail="Cliente no encontrado")
        old_numero = client_row.iloc[0]["numero"]
        old_empresa = client_row.iloc[0]["empresa"]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error obteniendo cliente anterior: {e}")

    item_dict = item.dict()
    item_dict["id"] = id
    res = update_record("clientes", id, item_dict)

    new_numero = item.numero
    new_empresa = item.empresa
    new_equipo = item.equipo_id
    
    if new_numero != old_numero or new_empresa != old_empresa or new_equipo != client_row.iloc[0]["equipo_id"]:
        # 1. Update cotizaciones
        try:
            df_coti = db.get_table_as_df("cotizaciones")
            mask = df_coti["num_cliente"] == old_numero
            if mask.any():
                df_coti.loc[mask, "num_cliente"] = new_numero
                df_coti.loc[mask, "Cliente"] = new_empresa
                df_coti.loc[mask, "equipo_id"] = new_equipo
                db.update_table_from_df("cotizaciones", df_coti)
        except Exception as e:
            print(f"Error cascada cotizaciones al actualizar cliente: {e}")
        
        # 2. Update procesamiento
        try:
            df_proc = db.get_table_as_df("procesamiento")
            mask = df_proc["num_cliente"] == old_numero
            if mask.any():
                df_proc.loc[mask, "num_cliente"] = new_numero
                df_proc.loc[mask, "Cliente"] = new_empresa
                df_proc.loc[mask, "equipo_id"] = new_equipo
                db.update_table_from_df("procesamiento", df_proc)
        except Exception as e:
            print(f"Error cascada procesamiento al actualizar cliente: {e}")
            
        # 3. Update contactos
        try:
            df_cont = db.get_table_as_df("contactos")
            mask = df_cont["entity_id"] == old_numero
            if mask.any():
                df_cont.loc[mask, "entity_id"] = new_numero
                db.update_table_from_df("contactos", df_cont)
        except Exception as e:
            print(f"Error cascada contactos al actualizar cliente: {e}")

    return res

@app.delete("/api/clientes/{id}")
def delete_cliente(id: int):
    try:
        df = db.get_table_as_df("clientes")
        client_row = df[df["id"] == id]
        if client_row.empty:
            raise HTTPException(status_code=404, detail="Cliente no encontrado")
        numero = client_row.iloc[0]["numero"]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error obteniendo cliente anterior: {e}")

    res = delete_record("clientes", id)

    # Cascade
    try:
        df_coti = db.get_table_as_df("cotizaciones")
        mask = df_coti["num_cliente"] == numero
        if mask.any():
            df_coti.loc[mask, "num_cliente"] = ""
            df_coti.loc[mask, "Cliente"] = "Cliente Eliminado"
            db.update_table_from_df("cotizaciones", df_coti)
    except Exception as e:
        print(f"Error al eliminar cliente en cotizaciones: {e}")

    try:
        df_proc = db.get_table_as_df("procesamiento")
        mask = df_proc["num_cliente"] == numero
        if mask.any():
            df_proc.loc[mask, "num_cliente"] = ""
            df_proc.loc[mask, "Cliente"] = "Cliente Eliminado"
            db.update_table_from_df("procesamiento", df_proc)
    except Exception as e:
        print(f"Error al eliminar cliente en procesamiento: {e}")

    try:
        df_cont = db.get_table_as_df("contactos")
        df_cont = df_cont[df_cont["entity_id"] != numero]
        db.update_table_from_df("contactos", df_cont)
    except Exception as e:
        print(f"Error al eliminar contactos de cliente: {e}")

    return res


# 4. PROVEEDORES
@app.get("/api/proveedores", response_model=List[Dict[str, Any]])
def get_proveedores():
    return get_all_records("proveedores")

@app.post("/api/proveedores")
def create_proveedor(item: ProviderItem):
    return create_record("proveedores", item.dict())

@app.put("/api/proveedores/{id}")
def update_proveedor(id: int, item: ProviderItem):
    try:
        df = db.get_table_as_df("proveedores")
        prov_row = df[df["id"] == id]
        if prov_row.empty:
            raise HTTPException(status_code=404, detail="Proveedor no encontrado")
        old_numero = prov_row.iloc[0]["numero"]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error obteniendo proveedor anterior: {e}")

    item_dict = item.dict()
    item_dict["id"] = id
    res = update_record("proveedores", id, item_dict)

    new_numero = item.numero
    if new_numero != old_numero:
        try:
            df_cat = db.get_table_as_df("catalogo")
            mask = df_cat["num_proveedor"] == old_numero
            if mask.any():
                df_cat.loc[mask, "num_proveedor"] = new_numero
                db.update_table_from_df("catalogo", df_cat)
        except Exception as e:
            print(f"Error cascada catalogo al actualizar proveedor: {e}")

        try:
            df_cont = db.get_table_as_df("contactos")
            mask = df_cont["entity_id"] == old_numero
            if mask.any():
                df_cont.loc[mask, "entity_id"] = new_numero
                db.update_table_from_df("contactos", df_cont)
        except Exception as e:
            print(f"Error cascada contactos al actualizar proveedor: {e}")

    return res

@app.delete("/api/proveedores/{id}")
def delete_proveedor(id: int):
    try:
        df = db.get_table_as_df("proveedores")
        prov_row = df[df["id"] == id]
        if prov_row.empty:
            raise HTTPException(status_code=404, detail="Proveedor no encontrado")
        numero = prov_row.iloc[0]["numero"]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error obteniendo proveedor anterior: {e}")

    res = delete_record("proveedores", id)

    try:
        df_cat = db.get_table_as_df("catalogo")
        mask = df_cat["num_proveedor"] == numero
        if mask.any():
            df_cat.loc[mask, "num_proveedor"] = ""
            db.update_table_from_df("catalogo", df_cat)
    except Exception as e:
        print(f"Error cascada catalogo al eliminar proveedor: {e}")

    try:
        df_cont = db.get_table_as_df("contactos")
        df_cont = df_cont[df_cont["entity_id"] != numero]
        db.update_table_from_df("contactos", df_cont)
    except Exception as e:
        print(f"Error al eliminar contactos de proveedor: {e}")

    return res


# 5. CONTACTOS
@app.get("/api/contactos", response_model=List[Dict[str, Any]])
def get_contactos():
    return get_all_records("contactos")

@app.post("/api/contactos")
def create_contacto(item: ContactItem):
    return create_record("contactos", item.dict())

@app.put("/api/contactos/{id}")
def update_contacto(id: int, item: ContactItem):
    item_dict = item.dict()
    item_dict["id"] = id
    return update_record("contactos", id, item_dict)

@app.delete("/api/contactos/{id}")
def delete_contacto(id: int):
    return delete_record("contactos", id)


# 6. CATEGORIAS
@app.get("/api/categorias", response_model=List[Dict[str, Any]])
def get_categorias():
    return get_all_records("categorias")

@app.post("/api/categorias")
def create_categoria(item: CategoryItem):
    item_dict = item.dict()
    if not item_dict.get("id"):
        item_dict["id"] = f"cat-{int(pd.Timestamp.now().timestamp() * 1000)}"
    return create_record("categorias", item_dict)

@app.put("/api/categorias/{id}")
def update_categoria(id: str, item: CategoryItem):
    item_dict = item.dict()
    item_dict["id"] = id
    return update_record("categorias", id, item_dict, id_col="id")

@app.delete("/api/categorias/{id}")
def delete_categoria(id: str):
    res = delete_record("categorias", id, id_col="id")
    try:
        df_cat = db.get_table_as_df("catalogo")
        mask = df_cat["categoria_id"] == id
        if mask.any():
            df_cat.loc[mask, "categoria_id"] = ""
            db.update_table_from_df("catalogo", df_cat)
    except Exception as e:
        print(f"Error cascada catalogo al eliminar categoria: {e}")
    return res


# 7. CATALOGO / PRODUCTOS
@app.get("/api/catalogo", response_model=List[Dict[str, Any]])
def get_catalogo():
    try:
        df = db.get_table_as_df("catalogo")
        records = df.to_dict(orient="records")
        try:
            prov_df = db.get_table_as_df("proveedores")
            prov_dict = dict(zip(prov_df["numero"], prov_df["empresa"]))
        except Exception:
            prov_dict = {}
            
        for r in records:
            if isinstance(r.get("valores_atributos"), str):
                try:
                    r["valores_atributos"] = json.loads(r["valores_atributos"])
                except Exception:
                    r["valores_atributos"] = {}
            
            num = r.get("num_proveedor")
            if num and num in prov_dict:
                r["proveedor_nombre"] = prov_dict[num]
            else:
                r["proveedor_nombre"] = num

            for k, v in r.items():
                if hasattr(v, "tolist"):
                    r[k] = v.tolist()
        return records
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/catalogo")
def create_producto(item: ProductItem):
    try:
        item_dict = item.dict()
        item_dict["valores_atributos"] = json.dumps(item_dict.get("valores_atributos", {}))
        desc = item_dict.get("descripcion", "")
        item_dict["vector"] = ai.get_embedding(desc)
        
        df = db.get_table_as_df("catalogo")
        if item_dict.get("id") is None or item_dict.get("id") == 0:
            item_dict["id"] = int(df["id"].max() + 1) if not df.empty else 1
            
        new_row = pd.DataFrame([item_dict])
        updated_df = pd.concat([df, new_row], ignore_index=True)
        db.update_table_from_df("catalogo", updated_df)
        
        item_dict["valores_atributos"] = item.valores_atributos
        return item_dict
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/api/catalogo/{id}")
def update_producto(id: int, item: ProductItem):
    try:
        item_dict = item.dict()
        item_dict["id"] = id
        item_dict["valores_atributos"] = json.dumps(item_dict.get("valores_atributos", {}))
        
        try:
            df = db.get_table_as_df("catalogo")
            old_row = df[df["id"] == id]
            if not old_row.empty:
                old_desc = old_row.iloc[0]["descripcion"]
                if old_desc != item.descripcion:
                    item_dict["vector"] = ai.get_embedding(item.descripcion)
                else:
                    vec = old_row.iloc[0]["vector"]
                    if hasattr(vec, "tolist"):
                        item_dict["vector"] = vec.tolist()
                    else:
                        item_dict["vector"] = list(vec)
        except Exception as e:
            print(f"Error retrieving old product for vector: {e}")
            item_dict["vector"] = ai.get_embedding(item.descripcion)
            
        res = update_record("catalogo", id, item_dict)
        item_dict["valores_atributos"] = item.valores_atributos
        return item_dict
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/catalogo/{id}")
def delete_producto(id: int):
    return delete_record("catalogo", id)


# 8. EQUIPOS DE VENTAS
@app.get("/api/equipos", response_model=List[Dict[str, Any]])
def get_equipos():
    return get_all_records("equipos_ventas")

@app.post("/api/equipos")
def create_equipo(item: TeamItem):
    item_dict = item.dict()
    if not item_dict.get("id"):
        item_dict["id"] = f"EQ-{int(pd.Timestamp.now().timestamp() * 1000)}"
    return create_record("equipos_ventas", item_dict)

@app.put("/api/equipos/{id}")
def update_equipo(id: str, item: TeamItem):
    item_dict = item.dict()
    item_dict["id"] = id
    return update_record("equipos_ventas", id, item_dict, id_col="id")

@app.delete("/api/equipos/{id}")
def delete_equipo(id: str):
    res = delete_record("equipos_ventas", id, id_col="id")
    try:
        df_vend = db.get_table_as_df("vendedores")
        mask = df_vend["equipo_id"] == id
        if mask.any():
            df_vend.loc[mask, "equipo_id"] = ""
            db.update_table_from_df("vendedores", df_vend)
    except Exception as e:
        print(f"Error al actualizar equipo_id en vendedores: {e}")

    try:
        df_cli = db.get_table_as_df("clientes")
        mask = df_cli["equipo_id"] == id
        if mask.any():
            df_cli.loc[mask, "equipo_id"] = ""
            db.update_table_from_df("clientes", df_cli)
    except Exception as e:
        print(f"Error al actualizar equipo_id en clientes: {e}")

    try:
        df_coti = db.get_table_as_df("cotizaciones")
        mask = df_coti["equipo_id"] == id
        if mask.any():
            df_coti.loc[mask, "equipo_id"] = ""
            db.update_table_from_df("cotizaciones", df_coti)
    except Exception as e:
        print(f"Error al actualizar equipo_id en cotizaciones: {e}")

    try:
        df_proc = db.get_table_as_df("procesamiento")
        mask = df_proc["equipo_id"] == id
        if mask.any():
            df_proc.loc[mask, "equipo_id"] = ""
            db.update_table_from_df("procesamiento", df_proc)
    except Exception as e:
        print(f"Error al actualizar equipo_id en procesamiento: {e}")

    return res


# 9. VENDEDORES
@app.get("/api/vendedores", response_model=List[Dict[str, Any]])
def get_vendedores():
    return get_all_records("vendedores")

@app.post("/api/vendedores")
def create_vendedor(item: VendorItem):
    return create_record("vendedores", item.dict())

@app.put("/api/vendedores/{id}")
def update_vendedor(id: int, item: VendorItem):
    item_dict = item.dict()
    item_dict["id"] = id
    return update_record("vendedores", id, item_dict)

@app.delete("/api/vendedores/{id}")
def delete_vendedor(id: int):
    return delete_record("vendedores", id)


# 10. METAS
@app.get("/api/metas", response_model=List[Dict[str, Any]])
def get_metas():
    return get_all_records("metas")

@app.post("/api/metas")
def create_meta(item: GoalItem):
    return create_record("metas", item.dict())

@app.put("/api/metas/{id}")
def update_meta(id: int, item: GoalItem):
    item_dict = item.dict()
    item_dict["id"] = id
    return update_record("metas", id, item_dict)

@app.delete("/api/metas/{id}")
def delete_meta(id: int):
    return delete_record("metas", id)


# 11. CONFIG_OPCIONES
@app.get("/api/config_opciones", response_model=List[Dict[str, Any]])
def get_config_opciones():
    return get_all_records("config_opciones")

@app.post("/api/config_opciones")
def create_config_opciones(item: ConfigOpcionesItem):
    try:
        # Check if config for this column already exists
        df = db.get_table_as_df("config_opciones")
        item_dict = item.dict()
        if not df.empty and item.columna in df["columna"].values:
            # Update instead of create
            existing_id = df[df["columna"] == item.columna].iloc[0]["id"]
            item_dict["id"] = int(existing_id)
            return update_record("config_opciones", int(existing_id), item_dict)
        
        return create_record("config_opciones", item_dict)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/api/config_opciones/{id}")
def update_config_opciones(id: int, item: ConfigOpcionesItem):
    item_dict = item.dict()
    item_dict["id"] = id
    return update_record("config_opciones", id, item_dict)

@app.delete("/api/config_opciones/{id}")
def delete_config_opciones(id: int):
    return delete_record("config_opciones", id)


# --- ENDPOINTS ANALÍTICOS (DUCKDB + LANCEDB) ---

@app.get("/api/analytics/kpis")
def get_analytics_kpis():
    """
    Calcula KPIs agregados usando DuckDB sobre las tablas cotizaciones y procesamiento.
    """
    try:
        df_all = db.get_table_as_df("cotizaciones")
        df_coti = df_all[df_all["Categoría"] == "Cotización"]
        df_proc = df_all[df_all["Categoría"] != "Cotización"]
        
        # Query de DuckDB para KPIs
        # Conversión: Porcentaje de cotizaciones aprobadas o que pasaron a procesamiento.
        # En nuestra semilla, calculamos totales
        query = """
        SELECT 
            (SELECT COALESCE(SUM(Monto), 0) FROM df_proc WHERE Categoría IN ('Facturar', 'Orden de compra', 'Terminado')) as VentasTotales,
            (SELECT COUNT(*) FROM df_coti WHERE Estatus = 'Aprobada') * 100.0 / NULLIF((SELECT COUNT(*) FROM df_coti), 0) as TasaConversion,
            (SELECT COUNT(*) FROM df_coti) as CotizacionesActivas,
            (SELECT COALESCE(AVG(Margen), 0) FROM 
                (SELECT Margen FROM df_coti UNION ALL SELECT Margen FROM df_proc)
            ) as MargenPromedio
        """
        
        kpis = db.execute_analytics_query(query, df_coti=df_coti, df_proc=df_proc)
        
        def clean_float(val):
            return 0.0 if pd.isna(val) else float(val)

        if kpis:
            kpi = kpis[0]
            return {
                "ventas": clean_float(kpi.get("VentasTotales")),
                "conversion": round(clean_float(kpi.get("TasaConversion")), 1),
                "cotizaciones": int(clean_float(kpi.get("CotizacionesActivas"))),
                "margen": round(clean_float(kpi.get("MargenPromedio")), 1)
            }
        return {"ventas": 0, "conversion": 0, "cotizaciones": 0, "margen": 0}
    except Exception as e:
        print(f"Error analítico: {e}")
        # Mocks de respaldo por si fallan las tablas
        return {"ventas": 0, "conversion": 0, "cotizaciones": 0, "margen": 0}

@app.get("/api/analytics/pareto")
def get_analytics_pareto():
    """
    Agrupa montos facturados por cliente de mayor a menor (Pareto 80/20).
    """
    try:
        df_all = db.get_table_as_df("cotizaciones")
        df_proc = df_all[df_all["Categoría"] != "Cotización"]
        if df_proc.empty:
            return []
            
        query = """
        SELECT Cliente as cliente, SUM(Monto) as total
        FROM df_proc
        GROUP BY Cliente
        ORDER BY total DESC
        """
        return db.execute_analytics_query(query, df_proc=df_proc)
    except Exception as e:
        print(f"Error Pareto: {e}")
        return []

@app.get("/api/analytics/goals")
def get_analytics_goals():
    try:
        return get_all_records("metas")
    except Exception:
        return []


# --- ENDPOINTS IA ---

@app.get("/api/ai/status")
def get_ai_status():
    """
    Informa del estado del motor local LanceDB y la IA Ollama.
    """
    ollama_active, models = ai.check_ollama_status()
    lancedb_active = "cotizaciones" in db.get_table_names()
    return {
        "lancedb": "active" if lancedb_active else "inactive",
        "ollama": "active" if ollama_active else "offline",
        "models": models,
        "active_model": ai.DEFAULT_MODEL if ollama_active else "None"
    }

@app.post("/api/ai/suggest-close")
def suggest_close(quote_data: dict = Body(...)):
    """
    Redacta un correo de seguimiento de cierre usando Ollama (o fallback) con streaming.
    """
    return StreamingResponse(ai.generate_closing_suggestion_stream(quote_data), media_type="text/plain")

@app.post("/api/ai/search-rag")
def search_rag(payload: dict = Body(...)):
    """
    Busca semánticamente en el catálogo y genera respuesta de cotización con Ollama.
    """
    query = payload.get("query", "")
    if not query:
        raise HTTPException(status_code=400, detail="Falta parámetro 'query'")
    
    return StreamingResponse(ai.perform_rag_search_stream(query, db.db), media_type="text/plain")

@app.get("/api/ai/config")
def get_ai_config():
    return ai.load_ai_config()

@app.post("/api/ai/config")
def update_ai_config(config: dict = Body(...)):
    success = ai.save_ai_config(config)
    if not success:
        raise HTTPException(status_code=500, detail="No se pudo guardar la configuración de IA")
    return {"status": "success", "message": "Configuración de IA guardada"}

@app.get("/api/ai/cross-selling/{client_num}")
def get_cross_selling(client_num: str):
    """
    Busca compras recientes del cliente y genera una propuesta de venta cruzada usando IA.
    """
    try:
        # 1. Buscar el cliente en la base de datos
        clientes_df = db.get_table_as_df("clientes")
        client_row = clientes_df[clientes_df["numero"] == client_num]
        if client_row.empty:
            raise HTTPException(status_code=404, detail="Cliente no encontrado")
        client_data = client_row.iloc[0].to_dict()
        if isinstance(client_data.get("tags"), np.ndarray):
            client_data["tags"] = client_data["tags"].tolist()
        elif not isinstance(client_data.get("tags"), list):
            client_data["tags"] = []

        # 2. Buscar compras recientes del cliente (cotizaciones de compra/facturación)
        cotizaciones_df = db.get_table_as_df("cotizaciones")
        client_orders = cotizaciones_df[
            (cotizaciones_df["num_cliente"] == client_num) & 
            (cotizaciones_df["Categoría"] != "Cotización")
        ]
        
        last_purchased_products = []
        if not client_orders.empty:
            for _, row in client_orders.iterrows():
                codigos = row.get("codigos_facturar", "")
                if codigos:
                    try:
                        parsed = json.loads(codigos)
                        if isinstance(parsed, list):
                            for p in parsed:
                                if isinstance(p, dict) and p.get("codigo"):
                                    last_purchased_products.append(p.get("codigo"))
                                elif isinstance(p, str):
                                    last_purchased_products.append(p)
                        else:
                            last_purchased_products.append(str(parsed))
                    except Exception:
                        for c in str(codigos).split(","):
                            c_clean = c.strip()
                            if c_clean:
                                last_purchased_products.append(c_clean)
            
            last_purchased_products = list(set(last_purchased_products))
            
        # 3. Generar la sugerencia usando nuestro helper en backend/ai.py
        suggestion = ai.generate_cross_selling_suggestion(client_data, last_purchased_products, db.db)
        return {"suggestion": suggestion}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# --- USER PROFILE ENDPOINTS ---
class UserProfileItem(BaseModel):
    nombre: Optional[str] = ""
    puesto: Optional[str] = ""
    correo: Optional[str] = ""
    celular: Optional[str] = ""
    ubicacion: Optional[str] = ""
    empresa: Optional[str] = ""
    datos_adicionales: Optional[str] = "{}"

@app.get("/api/perfil_usuario", response_model=Dict[str, Any])
def get_perfil_usuario():
    records = get_all_records("perfil_usuario")
    if records:
        return records[0]
    return {
        "id": 1,
        "nombre": "Juan Pérez",
        "puesto": "Gerente de Ventas",
        "correo": "juan.perez@fornax.com",
        "celular": "555-123-4567",
        "ubicacion": "CDMX",
        "empresa": "Fornax Soluciones Industriales",
        "datos_adicionales": "{}"
    }

@app.put("/api/perfil_usuario")
def update_perfil_usuario(item: UserProfileItem):
    item_dict = item.dict()
    item_dict["id"] = 1
    try:
        df = db.get_table_as_df("perfil_usuario")
        if df.empty:
            new_row = pd.DataFrame([item_dict])
            db.update_table_from_df("perfil_usuario", new_row)
        else:
            update_record("perfil_usuario", 1, item_dict)
        return item_dict
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

import sys

# --- SERVE REACT FRONTEND ---
if getattr(sys, 'frozen', False):
    # Cuando se ejecuta desde el .exe de PyInstaller
    base_dir = sys._MEIPASS
    frontend_dist = os.path.join(base_dir, "dist")
else:
    # Cuando se ejecuta en desarrollo local
    frontend_dist = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "dist")

if os.path.exists(frontend_dist):
    app.mount("/assets", StaticFiles(directory=os.path.join(frontend_dist, "assets")), name="assets")
    
    @app.get("/{full_path:path}")
    async def serve_frontend(full_path: str):
        if full_path.startswith("api/"):
            raise HTTPException(status_code=404, detail="API route not found")
        file_path = os.path.join(frontend_dist, full_path)
        if full_path and os.path.exists(file_path) and os.path.isfile(file_path):
            return FileResponse(file_path)
        
        # Prevent caching of index.html to ensure the latest version is loaded
        response = FileResponse(os.path.join(frontend_dist, "index.html"))
        response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
        response.headers["Pragma"] = "no-cache"
        response.headers["Expires"] = "0"
        return response

