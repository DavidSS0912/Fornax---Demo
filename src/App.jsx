import { useState, useEffect } from 'react';
import {
  LayoutDashboard, FileText, ShoppingCart, Search, Bot,
  Plus, Edit2, CheckCircle2, Clock, Package,
  X, Users, Truck, Info,
  ExternalLink, Phone, Mail, Tag, BarChart3,
  Trash2, AlertCircle, Briefcase, Contact, Smartphone,
  BrainCircuit, Target, TrendingUp, AlertTriangle, Zap, Copy,
  LayoutGrid, List, Calculator, Percent, Settings, Cat, User, Check, Menu, Maximize2
} from 'lucide-react';
import DynamicTable from './components/DynamicTable';
import PdfGeneratorModal from './components/PdfGeneratorModal';
import OptionsEditorModal from './components/OptionsEditorModal';
import UserProfileModal from './components/UserProfileModal';
import RuleManagerModal from './components/RuleManagerModal';
import logoFornax from '../logo_fornax.png';
const CopyableText = ({ text, className }) => {
  if (!text) return null;
  return (
    <span className={`group relative inline-flex items-center gap-1 ${className || ''}`}>
      {text}
      <button 
        onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(text); }} 
        className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-[#07417B] transition-opacity cursor-pointer"
        title="Copiar al portapapeles"
      >
        <Copy size={12} />
      </button>
    </span>
  );
};

// --- CONFIGURACIÓN DE COLORES ---

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [globalSearch, setGlobalSearch] = useState('');
  const [engineStatus, setEngineStatus] = useState({ lancedb: 'checking', ollama: 'checking', active_model: 'checking' });

  // --- MOCK DATA PARA FALLBACK OFFLINE ---
  const dataEquiposInicial = [];
  const dataVendedoresInicial = [];

  const columnasCotizaciones = [
    { key: 'Pedido', label: 'Pedido', visible: true, type: 'text' },
    { key: 'No_Cotizacion', label: 'No. Cotización', visible: true, type: 'text' },
    { key: 'num_cliente', label: 'No. Cliente', visible: true, type: 'text' },
    { key: 'Cliente', label: 'Cliente', visible: true, type: 'text' },
    { key: 'equipo_id', label: 'Equipo', visible: true, type: 'select', isTeam: true },
    { key: 'Categoría', label: 'Categoría', visible: true, type: 'select' },
    { key: 'Estatus', label: 'Estatus', visible: true, type: 'select' },
    { key: 'Progreso', label: 'Progreso', visible: false, type: 'select' },
    { key: 'Prioridad', label: 'Prioridad', visible: true, type: 'select' },
    { key: 'Monto', label: 'Monto ($)', visible: true, type: 'number', calc: 'sum' },
    { key: 'Margen', label: 'Margen (%)', visible: true, type: 'number', calc: 'avg' },
    { key: 'Entrega', label: 'Entrega', visible: true, type: 'date' },
    { key: 'dias_abierta', label: 'Días Abierta', visible: false, type: 'number' },
    { key: 'codigos_facturar', label: 'Códigos Facturar', visible: false, type: 'text' },
    { key: 'cantidad_pz', label: 'Cantidad Pz', visible: false, type: 'number' },
    { key: 'fecha_llegada', label: 'Fecha Llegada', visible: false, type: 'date' },
    { key: 'ref_cliente', label: 'Ref Cliente', visible: false, type: 'text' },
    { key: 'ref_proveedor', label: 'Ref Proveedor', visible: false, type: 'text' },
    { key: 'no_sp_ptt', label: 'No. SP/PTT', visible: false, type: 'text' },
    { key: 'guia', label: 'Guía', visible: false, type: 'text' },
    { key: 'contacto_cliente', label: 'Contacto Cliente', visible: false, type: 'text' },
    { key: 'vendedor', label: 'Vendedor', visible: false, type: 'text' },
    { key: 'coordinacion', label: 'Coordinación', visible: false, type: 'text' },
    { key: 'grupo_materiales', label: 'Grupo Materiales', visible: false, type: 'text' },
    { key: 'porcentaje_cierre', label: '% Cierre', visible: false, type: 'number' },
    { key: 'certificacion', label: 'Certificación', visible: false, type: 'text' },
    { key: 'importacion', label: 'Importación', visible: false, type: 'text' },
    { key: 'pendiente_armado', label: 'Pendiente Armado', visible: false, type: 'text' },
    { key: 'notas', label: 'Notas', visible: false, type: 'text' }
  ];

  const dataCotizaciones = [];

  const columnasProcesamiento = [
    { key: 'Pedido', label: 'Pedido', visible: true, type: 'text' },
    { key: 'No_Cotizacion', label: 'No. Cotización', visible: true, type: 'text' },
    { key: 'num_cliente', label: 'No. Cliente', visible: true, type: 'text' },
    { key: 'Cliente', label: 'Cliente', visible: true, type: 'text' },
    { key: 'equipo_id', label: 'Equipo', visible: true, type: 'select', isTeam: true },
    { key: 'Categoría', label: 'Categoría', visible: true, type: 'select' },
    { key: 'Estatus', label: 'Estatus', visible: false, type: 'select' },
    { key: 'Progreso', label: 'Progreso', visible: true, type: 'select' },
    { key: 'Prioridad', label: 'Prioridad', visible: true, type: 'select' },
    { key: 'Monto', label: 'Monto ($)', visible: true, type: 'number', calc: 'sum' },
    { key: 'Margen', label: 'Margen (%)', visible: true, type: 'number', calc: 'avg' },
    { key: 'Entrega', label: 'Entrega', visible: true, type: 'date' },
    { key: 'dias_abierta', label: 'Días Abierta', visible: false, type: 'number' },
    { key: 'codigos_facturar', label: 'Códigos Facturar', visible: false, type: 'text' },
    { key: 'cantidad_pz', label: 'Cantidad Pz', visible: false, type: 'number' },
    { key: 'fecha_llegada', label: 'Fecha Llegada', visible: false, type: 'date' },
    { key: 'ref_cliente', label: 'Ref Cliente', visible: false, type: 'text' },
    { key: 'ref_proveedor', label: 'Ref Proveedor', visible: false, type: 'text' },
    { key: 'no_sp_ptt', label: 'No. SP/PTT', visible: false, type: 'text' },
    { key: 'guia', label: 'Guía', visible: false, type: 'text' },
    { key: 'contacto_cliente', label: 'Contacto Cliente', visible: false, type: 'text' },
    { key: 'vendedor', label: 'Vendedor', visible: false, type: 'text' },
    { key: 'coordinacion', label: 'Coordinación', visible: false, type: 'text' },
    { key: 'grupo_materiales', label: 'Grupo Materiales', visible: false, type: 'text' },
    { key: 'porcentaje_cierre', label: '% Cierre', visible: false, type: 'number' },
    { key: 'certificacion', label: 'Certificación', visible: false, type: 'text' },
    { key: 'importacion', label: 'Importación', visible: false, type: 'text' },
    { key: 'pendiente_armado', label: 'Pendiente Armado', visible: false, type: 'text' },
    { key: 'notas', label: 'Notas', visible: false, type: 'text' }
  ];

  const dataProcesamiento = [];

  const categoriasProductosInicial = [];
  const catalogoProductosInicial = [];
  const dataClientesInicial = [];
  const dataProveedoresInicial = [];
  const contactosAdicionalesInicial = [];
  const metasVentasIniciales = [];

  // --- ESTADOS DE LA APP ---
  const [cotizaciones, setCotizaciones] = useState(dataCotizaciones);
  const [procesamiento, setProcesamiento] = useState(dataProcesamiento);
  const [colCotis, setColCotis] = useState(() => {
    const saved = localStorage.getItem('col_visibility_cotizaciones');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
        return columnasCotizaciones.map(col => ({
          ...col,
          visible: parsed[col.key] !== undefined ? parsed[col.key] : col.visible
        }));
      } catch (e) {}
    }
    return columnasCotizaciones;
  });
  const [colProc, setColProc] = useState(() => {
    const saved = localStorage.getItem('col_visibility_procesamiento');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
        return columnasProcesamiento.map(col => ({
          ...col,
          visible: parsed[col.key] !== undefined ? parsed[col.key] : col.visible
        }));
      } catch (e) {}
    }
    return columnasProcesamiento;
  });

  const handleAddColumnaGlobal = (newCol) => {
    setColCotis(prev => [...prev, newCol]);
    setColProc(prev => [...prev, newCol]);
  };

  const handleDeleteColumnaGlobal = (key) => {
    setColCotis(prev => prev.filter(c => c.key !== key));
    setColProc(prev => prev.filter(c => c.key !== key));
  };

  const [clientes, setClientes] = useState(dataClientesInicial);
  const [proveedores, setProveedores] = useState(dataProveedoresInicial);
  const [contactosAdicionales, setContactosAdicionales] = useState(contactosAdicionalesInicial);
  const [equipos, setEquipos] = useState(dataEquiposInicial);
  const [vendedores, setVendedores] = useState(dataVendedoresInicial);
  const [categoriasProd, setCategoriasProd] = useState(categoriasProductosInicial);
  const [catalogoProd, setCatalogoProductos] = useState(catalogoProductosInicial);
  const [metas, setMetas] = useState(metasVentasIniciales);
  const [kpis, setKpis] = useState({ ventas: 0, conversion: 0, cotizaciones: 0, margen: 0 });
  const [configOpciones, setConfigOpciones] = useState([]);
  const [userProfile, setUserProfile] = useState({
    nombre: 'Juan Pérez',
    puesto: 'Gerente de Ventas',
    correo: 'juan.perez@fornax.com',
    celular: '555-123-4567',
    ubicacion: 'CDMX',
    empresa: 'Fornax Soluciones Industriales',
    datos_adicionales: '{}'
  });
  const [showPerfilModal, setShowPerfilModal] = useState(false);
  
  const [showRuleManager, setShowRuleManager] = useState(false);
  const [boardRules, setBoardRules] = useState(() => {
    try {
      const stored = localStorage.getItem('board_routing_rules');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('board_routing_rules', JSON.stringify(boardRules));
  }, [boardRules]);

  const dataParetoInicial = [];
  const [paretoClientes, setParetoClientes] = useState(dataParetoInicial);

  // Modales
  const [activeModal, setActiveModal] = useState(null); // 'cliente' | 'proveedor' | 'categoria' | 'producto' | 'equipo' | 'vendedor' | 'contacto' | null
  const [modalEntity, setModalEntity] = useState(null); // Ficha rápida { type: 'cliente'|'proveedor', id: 'C-102' }
  const [activeProfile, setActiveProfile] = useState(null); // Perfil completo { type: 'cliente'|'proveedor', id: 'C-102' }
  const [showDirectorio, setShowDirectorio] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, message: '', onConfirm: null });
  const [sugerenciaIADetalle, setSugerenciaIADetalle] = useState(null);
  const [cargandoIA, setCargandoIA] = useState(false);

  // Estados para Configuración de IA y Venta Cruzada Dinámica
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [activeModalPDF, setActiveModalPDF] = useState(null);
  const [editorOpcionesModal, setEditorOpcionesModal] = useState(null);
  const [aiConfig, setAiConfig] = useState({
    cross_selling: { temperature: 0.4, min_similarity: 0.4 },
    chat_tecnico: { temperature: 0.4, num_ctx: 2048, num_predict: 512 },
    sistema: { keep_alive: "5m" }
  });
  const [crossSellingClient, setCrossSellingClient] = useState('');
  const [crossSellingSuggestion, setCrossSellingSuggestion] = useState('');
  const [cargandoCrossSelling, setCargandoCrossSelling] = useState(false);

  const [formMeta, setFormMeta] = useState({ categoria: '', marca: '', objetivo: '', actual: 0 });
  const [editMetaId, setEditMetaId] = useState(null);
  const [notification, setNotification] = useState(null); // { message: '', type: 'success'|'error'|'info' }

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  // Forms
  const [formCliente, setFormCliente] = useState({ numero: '', nombre: '', puesto: '', empresa: '', telefono: '', correo: '', tags: '', nota: '', equipo_id: '' });
  const [editClienteId, setEditClienteId] = useState(null);

  const [formProveedor, setFormProveedor] = useState({ numero: '', nombre: '', puesto: '', empresa: '', telefono: '', correo: '', descuento: '', tags: '', compra_minima: '', compra_envio_pagado: '', nota: '' });
  const [editProveedorId, setEditProveedorId] = useState(null);

  const [formEquipo, setFormEquipo] = useState({ nombre: '' });
  const [editEquipoId, setEditEquipoId] = useState(null);

  const [formVendedor, setFormVendedor] = useState({ nombre: '', puesto: '', celular: '', correo: '', equipo_id: '' });
  const [editVendedorId, setEditVendedorId] = useState(null);

  const [nuevaCatNombre, setNuevaCatNombre] = useState('');
  const [nuevaCatCoordinacion, setNuevaCatCoordinacion] = useState('');
  const [nuevoAtributoNombre, setNuevoAtributoNombre] = useState('');
  const [listaAtributosTemporales, setListaAtributosTemporales] = useState([]);
  const [editCategoryId, setEditCategoryId] = useState(null);

  const [coordinaciones, setCoordinaciones] = useState([{ id: 1, nombre: 'Instrumentación' }, { id: 2, nombre: 'Válvulas' }, { id: 3, nombre: 'Tableros' }]);
  const [nuevaCoordinacionNombre, setNuevaCoordinacionNombre] = useState('');
  const [editCoordinacionId, setEditCoordinacionId] = useState(null);

  const [nuevoProducto, setNuevoProducto] = useState({ categoria_id: '', marca: '', num_proveedor: '', codigo: '', codigo_interno: '', descripcion: '', precio: 0, moneda: 'MXN', tiempo_entrega: '', recomendaciones: '', valores_atributos: {} });
  const [editProductoId, setEditProductoId] = useState(null);
  const [filtroCategoriaCatalogo, setFiltroCategoriaCatalogo] = useState('');

  const [formContacto, setFormContacto] = useState({ nombre: '', puesto: '', telefono: '', correo: '' });
  const [editContactoId, setEditContactoId] = useState(null);

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // States for Grid/List views, expanded cards, and unified operations modal
  const [providersViewMode, setProvidersViewMode] = useState('list');
  const [clientsViewMode, setClientsViewMode] = useState('list');
  const [expandedCards, setExpandedCards] = useState({});
  const [editOperacionId, setEditOperacionId] = useState(null);
  const [showNuevoContactoOperacion, setShowNuevoContactoOperacion] = useState(false);
  const [showTableModal, setShowTableModal] = useState(false);
  const [nuevoContactoOperacionForm, setNuevoContactoOperacionForm] = useState({ nombre: '', puesto: '', telefono: '', correo: '' });
  const [formOperacion, setFormOperacion] = useState({
    Pedido: '',
    No_Cotizacion: '',
    num_cliente: '',
    Cliente: '',
    equipo_id: '',
    Categoría: 'Cotización',
    Estatus: 'Nueva',
    Progreso: 'No iniciado',
    Prioridad: 'Media',
    Monto: 0,
    Margen: 0,
    Entrega: '',
    dias_abierta: 0,
    codigos_facturar: '',
    cantidad_pz: 0,
    fecha_llegada: '',
    notas: '',
    ref_cliente: '',
    ref_proveedor: '',
    no_sp_ptt: '',
    guia: '',
    contacto_cliente: '',
    vendedor: '',
    coordinacion: '',
    grupo_materiales: '',
    porcentaje_cierre: 0,
    certificacion: 'No',
    importacion: 'No',
    pendiente_armado: 'No',
    moneda_cotizacion: 'MXN',
    tipo_cambio: 18.00
  });

  const [codigosList, setCodigosList] = useState([]);

  // States for Utilities view calculators
  const [monedaCalc1, setMonedaCalc1] = useState('MXN');
  const [tipoCambio, setTipoCambio] = useState(18);
  const [itemsCalc1, setItemsCalc1] = useState([]);
  const [itemsCalc2, setItemsCalc2] = useState([]);
  const [itemsCalc3, setItemsCalc3] = useState([]);
  const [filtroPeriodoMetas, setFiltroPeriodoMetas] = useState('year'); // 'year' o 'month'

  // RAG Search
  const [ragQuery, setRagQuery] = useState('');
  const [ragResult, setRagResult] = useState('');

  const formatCurrency = (val) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(val || 0);

  // --- EFFECT: SYNC Y POLLING DEL BACKEND ---
  const fetchAllData = async () => {
    try {
      const resStatus = await fetch('/api/ai/status');
      if (resStatus.ok) {
        const statusData = await resStatus.json();
        setEngineStatus(statusData);

        const [
          resCoti, resProc, resCli, resProv,
          resCont, resCatg, resProd, resEq,
          resVend, resMetas, resKpis, resPareto, resConfig, resProfile
        ] = await Promise.all([
          fetch('/api/cotizaciones'),
          fetch('/api/procesamiento'),
          fetch('/api/clientes'),
          fetch('/api/proveedores'),
          fetch('/api/contactos'),
          fetch('/api/categorias'),
          fetch('/api/catalogo'),
          fetch('/api/equipos'),
          fetch('/api/vendedores'),
          fetch('/api/analytics/goals'),
          fetch('/api/analytics/kpis'),
          fetch('/api/analytics/pareto'),
          fetch('/api/config_opciones'),
          fetch('/api/perfil_usuario')
        ]);

        if (resCoti.ok) setCotizaciones(await resCoti.json());
        if (resProc.ok) setProcesamiento(await resProc.json());
        if (resCli.ok) setClientes(await resCli.json());
        if (resProv.ok) setProveedores(await resProv.json());
        if (resCont.ok) setContactosAdicionales(await resCont.json());
        if (resCatg.ok) setCategoriasProd(await resCatg.json());
        if (resProd.ok) setCatalogoProductos(await resProd.json());
        if (resEq.ok) setEquipos(await resEq.json());
        if (resVend.ok) setVendedores(await resVend.json());
        if (resMetas.ok) setMetas(await resMetas.json());
        if (resKpis.ok) setKpis(await resKpis.json());
        if (resPareto.ok) setParetoClientes(await resPareto.json());
        if (resConfig && resConfig.ok) setConfigOpciones(await resConfig.json());
        if (resProfile && resProfile.ok) setUserProfile(await resProfile.json());
      } else {
        setEngineStatus({ lancedb: 'offline', ollama: 'offline', active_model: 'None' });
      }
    } catch {
      setEngineStatus({ lancedb: 'offline', ollama: 'offline', active_model: 'None' });
    }
  };

  const fetchConfig = async () => {
    try {
      const res = await fetch('/api/ai/config');
      if (res.ok) {
        const data = await res.json();
        setAiConfig(data);
      }
    } catch (err) {
      console.error("Error fetching AI config:", err);
    }
  };

  const handleSaveOptions = async (columnaKey, opciones) => {
    try {
      const res = await fetch('/api/config_opciones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ columna: columnaKey, opciones: JSON.stringify(opciones) })
      });
      if (res.ok) {
        showNotification(`Opciones para ${columnaKey} actualizadas`, 'success');
        setEditorOpcionesModal(null);
        // Refresh options
        const resConfig = await fetch('/api/config_opciones');
        if (resConfig.ok) setConfigOpciones(await resConfig.json());
      } else {
        showNotification('Error guardando opciones', 'error');
      }
    } catch (e) {
      showNotification('Error de conexión', 'error');
      console.error(e);
    }
  };

  const fetchCrossSelling = async (clientNum) => {
    if (!clientNum) return;
    setCargandoCrossSelling(true);
    try {
      const res = await fetch(`/api/ai/cross-selling/${clientNum}`);
      if (res.ok) {
        const data = await res.json();
        setCrossSellingSuggestion(data.suggestion);
      } else {
        throw new Error();
      }
    } catch {
      setCrossSellingSuggestion("No se pudo cargar la recomendación de venta cruzada en este momento (Modo Offline).");
    } finally {
      setCargandoCrossSelling(false);
    }
  };

  useEffect(() => {
    if (crossSellingClient) {
      fetchCrossSelling(crossSellingClient);
    }
  }, [crossSellingClient]);

  useEffect(() => {
    setTimeout(() => {
      fetchAllData();
      fetchConfig();
    }, 0);
    const interval = setInterval(fetchAllData, 8000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    localStorage.setItem('col_visibility_cotizaciones', JSON.stringify(colCotis));
  }, [colCotis]);

  useEffect(() => {
    localStorage.setItem('col_visibility_procesamiento', JSON.stringify(colProc));
  }, [colProc]);

  // --- METODOS DE OPERACIÓN (CRUD COMPLETO CON GARANTÍA DE SINCRO RELACIONAL) ---

  const requestDelete = (action) => {
    setConfirmDialog({
      isOpen: true,
      message: '¿Estás seguro de eliminar este registro? Esta acción se aplicará inmediatamente en la base de datos.',
      onConfirm: action
    });
  };

  // 1. Cotizaciones
  const handleSaveCotizacion = async (row) => {
    try {
      const method = row.id === 0 ? 'POST' : 'PUT';
      const url = row.id === 0 ? '/api/cotizaciones' : `/api/cotizaciones/${row.id}`;
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(row)
      });
      if (response.ok) fetchAllData();
      else throw new Error();
    } catch {
      if (row.id === 0) {
        setCotizaciones([{ ...row, id: Date.now() }, ...cotizaciones]);
      } else {
        setCotizaciones(cotizaciones.map(c => c.id === row.id ? row : c));
      }
    }
  };

  const handleDeleteCotizacion = (id) => {
    requestDelete(async () => {
      try {
        const response = await fetch(`/api/cotizaciones/${id}`, { method: 'DELETE' });
        if (response.ok) fetchAllData();
        else throw new Error();
      } catch {
        setCotizaciones(cotizaciones.filter(c => c.id !== id));
      }
    });
  };

  // 2. Procesamiento
  const handleSaveProcesamiento = async (row) => {
    try {
      const method = row.id === 0 ? 'POST' : 'PUT';
      const url = row.id === 0 ? '/api/procesamiento' : `/api/procesamiento/${row.id}`;
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(row)
      });
      if (response.ok) fetchAllData();
      else throw new Error();
    } catch {
      if (row.id === 0) {
        setProcesamiento([{ ...row, id: Date.now() }, ...procesamiento]);
      } else {
        setProcesamiento(procesamiento.map(p => p.id === row.id ? row : p));
      }
    }
  };

  const handleDeleteProcesamiento = (id) => {
    requestDelete(async () => {
      try {
        const response = await fetch(`/api/procesamiento/${id}`, { method: 'DELETE' });
        if (response.ok) fetchAllData();
        else throw new Error();
      } catch {
        setProcesamiento(procesamiento.filter(p => p.id !== id));
      }
    });
  };

  // 3. Clientes (CRUD y Sincro relacional total)
  const guardarCliente = async (e) => {
    e.preventDefault();
    const tagsArr = typeof formCliente.tags === 'string' ? formCliente.tags.split(',').map(t => t.trim()).filter(Boolean) : formCliente.tags;
    const item = { ...formCliente, tags: tagsArr };

    try {
      const method = editClienteId ? 'PUT' : 'POST';
      const url = editClienteId ? `/api/clientes/${editClienteId}` : '/api/clientes';
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item)
      });
      if (response.ok) { fetchAllData(); showNotification(editClienteId ? 'Cliente actualizado' : 'Cliente guardado', 'success'); }
      else throw new Error();
    } catch {
      if (editClienteId) {
        setClientes(clientes.map(c => c.id === editClienteId ? { ...item, id: c.id } : c));
        // Sincro relacional de cliente en local
        setCotizaciones(cotizaciones.map(q => q.num_cliente === item.numero ? { ...q, Cliente: item.empresa, equipo_id: item.equipo_id } : q));
        setProcesamiento(procesamiento.map(p => p.num_cliente === item.numero ? { ...p, Cliente: item.empresa, equipo_id: item.equipo_id } : p));
      } else {
        setClientes([{ ...item, id: Date.now(), dias_sin_compra: 0 }, ...clientes]);
      }
    }
    setFormCliente({ numero: '', nombre: '', puesto: '', empresa: '', telefono: '', correo: '', tags: '', nota: '', equipo_id: '' });
    setEditClienteId(null);
    setActiveModal(null);
  };

  const editarCliente = (cliente) => {
    setFormCliente({ ...cliente, tags: cliente.tags.join(', ') });
    setEditClienteId(cliente.id);
    setActiveModal('cliente');
  };

  const eliminarCliente = (id, numeroCliente) => {
    requestDelete(async () => {
      try {
        const response = await fetch(`/api/clientes/${id}`, { method: 'DELETE' });
        if (response.ok) fetchAllData();
        else throw new Error();
      } catch {
        setClientes(clientes.filter(c => c.id !== id));
        // Limpiar o desasociar en local
        setCotizaciones(cotizaciones.map(q => q.num_cliente === numeroCliente ? { ...q, Cliente: 'Cliente Eliminado', num_cliente: '' } : q));
        setProcesamiento(procesamiento.map(p => p.num_cliente === numeroCliente ? { ...p, Cliente: 'Cliente Eliminado', num_cliente: '' } : p));
      }
    });
  };

  // 4. Proveedores
  const guardarProveedor = async (e) => {
    e.preventDefault();
    const tagsArr = typeof formProveedor.tags === 'string' ? formProveedor.tags.split(',').map(t => t.trim()).filter(Boolean) : formProveedor.tags;
    const item = {
      ...formProveedor,
      tags: tagsArr,
      compra_minima: Number(formProveedor.compra_minima),
      compra_envio_pagado: Number(formProveedor.compra_envio_pagado)
    };

    try {
      const method = editProveedorId ? 'PUT' : 'POST';
      const url = editProveedorId ? `/api/proveedores/${editProveedorId}` : '/api/proveedores';
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item)
      });
      if (response.ok) { fetchAllData(); showNotification(editProveedorId ? 'Proveedor actualizado' : 'Proveedor guardado', 'success'); }
      else throw new Error();
    } catch {
      if (editProveedorId) {
        setProveedores(proveedores.map(p => p.id === editProveedorId ? { ...item, id: p.id } : p));
        // Sincro en catálogo local
        setCatalogoProductos(catalogoProd.map(prod => prod.num_proveedor === item.numero ? { ...prod, proveedor_nombre: item.empresa } : prod));
      } else {
        setProveedores([{ ...item, id: Date.now() }, ...proveedores]);
      }
    }
    setFormProveedor({ numero: '', nombre: '', puesto: '', empresa: '', telefono: '', correo: '', descuento: '', tags: '', compra_minima: '', compra_envio_pagado: '', nota: '' });
    setEditProveedorId(null);
    setActiveModal(null);
  };

  const editarProveedor = (prov) => {
    setFormProveedor({ ...prov, tags: prov.tags.join(', ') });
    setEditProveedorId(prov.id);
    setActiveModal('proveedor');
  };

  const eliminarProveedor = (id, numeroProv) => {
    requestDelete(async () => {
      try {
        const response = await fetch(`/api/proveedores/${id}`, { method: 'DELETE' });
        if (response.ok) fetchAllData();
        else throw new Error();
      } catch {
        setProveedores(proveedores.filter(p => p.id !== id));
        setCatalogoProductos(catalogoProd.map(prod => prod.num_proveedor === numeroProv ? { ...prod, proveedor_nombre: 'Proveedor Eliminado', num_proveedor: '' } : prod));
      }
    });
  };

  // 5. Contactos del Directorio (CRUD Modal completo)
  const guardarContacto = async (e) => {
    e.preventDefault();
    const item = { ...formContacto, entity_id: activeProfile.id };

    try {
      const method = editContactoId ? 'PUT' : 'POST';
      const url = editContactoId ? `/api/contactos/${editContactoId}` : '/api/contactos';
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editContactoId ? { ...item, id: editContactoId } : item)
      });
      if (response.ok) fetchAllData();
      else throw new Error();
    } catch {
      if (editContactoId) {
        setContactosAdicionales(contactosAdicionales.map(c => c.id === editContactoId ? { ...item, id: c.id } : c));
      } else {
        setContactosAdicionales([{ ...item, id: Date.now() }, ...contactosAdicionales]);
      }
    }
    setFormContacto({ nombre: '', puesto: '', telefono: '', correo: '' });
    setEditContactoId(null);
    setActiveModal(null);
  };

  const editarContacto = (contact) => {
    setFormContacto(contact);
    setEditContactoId(contact.id);
    setActiveModal('contacto');
  };

  const eliminarContacto = (id) => {
    requestDelete(async () => {
      try {
        const response = await fetch(`/api/contactos/${id}`, { method: 'DELETE' });
        if (response.ok) fetchAllData();
        else throw new Error();
      } catch {
        setContactosAdicionales(contactosAdicionales.filter(c => c.id !== id));
      }
    });
  };

  // 6. Equipos y Asesores
  const guardarEquipo = async (e) => {
    e.preventDefault();
    try {
      const method = editEquipoId ? 'PUT' : 'POST';
      const url = editEquipoId ? `/api/equipos/${editEquipoId}` : '/api/equipos';
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editEquipoId ? { ...formEquipo, id: editEquipoId } : formEquipo)
      });
      if (response.ok) fetchAllData();
      else throw new Error();
    } catch {
      if (editEquipoId) {
        setEquipos(equipos.map(eq => eq.id === editEquipoId ? { ...eq, nombre: formEquipo.nombre } : eq));
      } else {
        setEquipos([...equipos, { id: `EQ-${Date.now()}`, nombre: formEquipo.nombre }]);
      }
    }
    setFormEquipo({ nombre: '' });
    setEditEquipoId(null);
    setActiveModal(null);
  };

  const eliminarEquipo = (id) => {
    requestDelete(async () => {
      try {
        const response = await fetch(`/api/equipos/${id}`, { method: 'DELETE' });
        if (response.ok) fetchAllData();
        else throw new Error();
      } catch {
        setEquipos(equipos.filter(eq => eq.id !== id));
      }
    });
  };

  const guardarVendedor = async (e) => {
    e.preventDefault();
    try {
      const method = editVendedorId ? 'PUT' : 'POST';
      const url = editVendedorId ? `/api/vendedores/${editVendedorId}` : '/api/vendedores';
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editVendedorId ? { ...formVendedor, id: editVendedorId } : formVendedor)
      });
      if (response.ok) fetchAllData();
      else throw new Error();
    } catch {
      if (editVendedorId) {
        setVendedores(vendedores.map(v => v.id === editVendedorId ? { ...formVendedor, id: v.id } : v));
      } else {
        setVendedores([...vendedores, { ...formVendedor, id: Date.now() }]);
      }
    }
    setFormVendedor({ nombre: '', puesto: '', celular: '', correo: '', equipo_id: '' });
    setEditVendedorId(null);
    setActiveModal(null);
  };

  const eliminarVendedor = (id) => {
    requestDelete(async () => {
      try {
        const response = await fetch(`/api/vendedores/${id}`, { method: 'DELETE' });
        if (response.ok) fetchAllData();
        else throw new Error();
      } catch {
        setVendedores(vendedores.filter(v => v.id !== id));
      }
    });
  };

  // Metas de Ventas CRUD
  const guardarMeta = async (e) => {
    e.preventDefault();
    const item = {
      ...formMeta,
      objetivo: Number(formMeta.objetivo),
      actual: Number(formMeta.actual)
    };
    try {
      const method = editMetaId ? 'PUT' : 'POST';
      const url = editMetaId ? `/api/metas/${editMetaId}` : '/api/metas';
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editMetaId ? { ...item, id: editMetaId } : item)
      });
      if (response.ok) fetchAllData();
      else throw new Error();
    } catch {
      if (editMetaId) {
        setMetas(metas.map(m => m.id === editMetaId ? { ...item, id: m.id } : m));
      } else {
        setMetas([...metas, { ...item, id: Date.now() }]);
      }
    }
    setFormMeta({ categoria: '', marca: '', objetivo: '', actual: 0 });
    setEditMetaId(null);
    setActiveModal(null);
  };

  const eliminarMeta = (id) => {
    requestDelete(async () => {
      try {
        const response = await fetch(`/api/metas/${id}`, { method: 'DELETE' });
        if (response.ok) fetchAllData();
        else throw new Error();
      } catch {
        setMetas(metas.filter(m => m.id !== id));
      }
    });
  };

  // 7. Catálogo y Categorías
  const agregarAtributoACategoria = () => {
    if (nuevoAtributoNombre.trim()) {
      setListaAtributosTemporales([...listaAtributosTemporales, nuevoAtributoNombre.trim()]);
      setNuevoAtributoNombre('');
    }
  };

  const guardarCategoria = async (e) => {
    e.preventDefault();
    if (!nuevaCatNombre.trim()) return;
    const cat = { nombre: nuevaCatNombre, atributos: listaAtributosTemporales, coordinacion: nuevaCatCoordinacion };
    try {
      const method = editCategoryId ? 'PUT' : 'POST';
      const url = editCategoryId ? `/api/categorias/${editCategoryId}` : '/api/categorias';
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editCategoryId ? { ...cat, id: editCategoryId } : cat)
      });
      if (response.ok) fetchAllData();
      else throw new Error();
    } catch {
      if (editCategoryId) {
        setCategoriasProd(categoriasProd.map(c => c.id === editCategoryId ? { ...c, ...cat } : c));
      } else {
        setCategoriasProd([...categoriasProd, { id: `cat-${Date.now()}`, ...cat }]);
      }
    }
    setNuevaCatNombre('');
    setNuevaCatCoordinacion('');
    setListaAtributosTemporales([]);
    setEditCategoryId(null);
    setActiveModal(null);
  };

  const guardarCoordinacion = async (e) => {
    e.preventDefault();
    if (!nuevaCoordinacionNombre.trim()) return;
    const coord = { nombre: nuevaCoordinacionNombre };
    try {
      const method = editCoordinacionId ? 'PUT' : 'POST';
      const url = editCoordinacionId ? `/api/coordinaciones/${editCoordinacionId}` : '/api/coordinaciones';
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editCoordinacionId ? { ...coord, id: editCoordinacionId } : coord)
      });
      if (response.ok) fetchAllData();
      else throw new Error();
    } catch {
      if (editCoordinacionId) {
        setCoordinaciones(coordinaciones.map(c => c.id === editCoordinacionId ? { ...c, ...coord } : c));
      } else {
        setCoordinaciones([...coordinaciones, { id: `coord-${Date.now()}`, ...coord }]);
      }
    }
    setNuevaCoordinacionNombre('');
    setEditCoordinacionId(null);
    setActiveModal(null);
  };

  const eliminarCoordinacion = (id) => {
    requestDelete(async () => {
      try {
        const response = await fetch(`/api/coordinaciones/${id}`, { method: 'DELETE' });
        if (response.ok) fetchAllData();
        else throw new Error();
      } catch {
        setCoordinaciones(coordinaciones.filter(c => c.id !== id));
      }
    });
  };

  const eliminarCategoria = (id) => {
    requestDelete(async () => {
      try {
        const response = await fetch(`/api/categorias/${id}`, { method: 'DELETE' });
        if (response.ok) fetchAllData();
        else throw new Error();
      } catch {
        setCategoriasProd(categoriasProd.filter(cat => cat.id !== id));
      }
    });
  };

  const guardarProducto = async (e) => {
    e.preventDefault();
    try {
      const method = editProductoId ? 'PUT' : 'POST';
      const url = editProductoId ? `/api/catalogo/${editProductoId}` : '/api/catalogo';
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editProductoId ? { ...nuevoProducto, id: editProductoId } : nuevoProducto)
      });
      if (response.ok) { fetchAllData(); showNotification(editProductoId ? 'Producto actualizado' : 'Producto guardado', 'success'); }
      else throw new Error();
    } catch {
      if (editProductoId) {
        setCatalogoProductos(catalogoProd.map(p => p.id === editProductoId ? { ...nuevoProducto, id: p.id, precio: Number(nuevoProducto.precio) } : p));
      } else {
        setCatalogoProductos([...catalogoProd, { ...nuevoProducto, id: Date.now(), precio: Number(nuevoProducto.precio) }]);
      }
    }
    setNuevoProducto({ categoria_id: '', marca: '', num_proveedor: '', codigo: '', codigo_interno: '', descripcion: '', precio: 0, moneda: 'MXN', tiempo_entrega: '', recomendaciones: '', valores_atributos: {} });
    setEditProductoId(null);
    setActiveModal(null);
  };

  const editarProducto = (prod) => {
    setNuevoProducto({ ...prod });
    setEditProductoId(prod.id);
    setActiveModal('producto');
  };

  const eliminarProducto = (id) => {
    requestDelete(async () => {
      try {
        const response = await fetch(`/api/catalogo/${id}`, { method: 'DELETE' });
        if (response.ok) fetchAllData();
        else throw new Error();
      } catch {
        setCatalogoProductos(catalogoProd.filter(p => p.id !== id));
      }
    });
  };

  const abrirModalOperacion = (row = null, defaultCategory = 'Cotización') => {
    let parsedList = [];
    if (row) {
      if (row.codigos_facturar) {
        try {
          const parsed = JSON.parse(row.codigos_facturar);
          if (Array.isArray(parsed)) {
            parsedList = parsed.map(item => ({
              ...item,
              descripcion: item.descripcion || '',
              codigo_interno: item.codigo_interno || '',
              precio_unitario: item.precio_unitario || 0,
              precio_origen: item.precio_origen !== undefined ? item.precio_origen : (item.precio_unitario || 0),
              moneda_origen: item.moneda_origen || (row.moneda_cotizacion || 'MXN'),
              tiempo_entrega: item.tiempo_entrega || ''
            }));
          } else {
            parsedList = [{ codigo: row.codigos_facturar, cantidad: row.cantidad_pz || 1, entregado: false, faltantes: 0, descripcion: '', precio_unitario: 0, precio_origen: 0, moneda_origen: row.moneda_cotizacion || 'MXN', tiempo_entrega: '' }];
          }
        } catch {
          parsedList = [{ codigo: row.codigos_facturar, cantidad: row.cantidad_pz || 1, entregado: false, faltantes: 0, descripcion: '', precio_unitario: 0, precio_origen: 0, moneda_origen: row.moneda_cotizacion || 'MXN', tiempo_entrega: '' }];
        }
      }
      setFormOperacion({
        ...row,
        codigos_facturar: row.codigos_facturar || '',
        cantidad_pz: row.cantidad_pz || 0,
        fecha_llegada: row.fecha_llegada || '',
        notas: row.notas || '',
        ref_cliente: row.ref_cliente || '',
        ref_proveedor: row.ref_proveedor || '',
        no_sp_ptt: row.no_sp_ptt || '',
        guia: row.guia || '',
        contacto_cliente: row.contacto_cliente || '',
        vendedor: row.vendedor || '',
        coordinacion: row.coordinacion || '',
        grupo_materiales: row.grupo_materiales || '',
        porcentaje_cierre: row.porcentaje_cierre || 0,
        certificacion: row.certificacion || 'No',
        importacion: row.importacion || 'No',
        pendiente_armado: row.pendiente_armado || 'No',
        moneda_cotizacion: row.moneda_cotizacion || 'MXN',
        tipo_cambio: (row.tipo_cambio && row.tipo_cambio > 1) ? row.tipo_cambio : 18.00,
        Monto: row.monto_original !== undefined && row.monto_original !== null ? row.monto_original : (row.Monto || 0)
      });
      setEditOperacionId(row.id);
    } else {
      const stored = localStorage.getItem('cotizacion_counter');
      let nextNum = stored !== null ? parseInt(stored, 10) + 1 : 0;
      
      let initials = "DS";
      if (userProfile && userProfile.nombre) {
        const parts = userProfile.nombre.trim().split(" ");
        if (parts.length >= 2 && parts[0] && parts[1]) {
          initials = (parts[0][0] + parts[1][0]).toUpperCase();
        } else {
          initials = userProfile.nombre.substring(0, 2).toUpperCase();
        }
      }
      
      const nextCotNum = `${initials}-${String(nextNum).padStart(5, '0')}`;

      setFormOperacion({
        Pedido: '',
        No_Cotizacion: nextCotNum,
        num_cliente: '',
        Cliente: '',
        equipo_id: '',
        Categoría: defaultCategory,
        Estatus: 'Nueva',
        Progreso: 'No iniciado',
        Prioridad: 'Media',
        Monto: 0,
        Margen: 0,
        Entrega: new Date().toISOString().split('T')[0],
        dias_abierta: 0,
        codigos_facturar: '',
        cantidad_pz: 0,
        fecha_llegada: '',
        notas: '',
        ref_cliente: '',
        ref_proveedor: '',
        no_sp_ptt: '',
        guia: '',
        contacto_cliente: '',
        vendedor: '',
        coordinacion: '',
        grupo_materiales: '',
        porcentaje_cierre: 0,
        certificacion: 'No',
        importacion: 'No',
        pendiente_armado: 'No',
        fecha_creacion: new Date().toISOString(),
        moneda_cotizacion: 'MXN',
        tipo_cambio: 18.00,
        monto_original: 0
      });
      setEditOperacionId(null);
    }
    setCodigosList(parsedList);
    setShowNuevoContactoOperacion(false);
    setActiveModal('operacion');
  };

  const guardarOperacion = async (e) => {
    e.preventDefault();
    const serializedCodes = JSON.stringify(codigosList);
    const totalQty = codigosList.reduce((acc, item) => acc + (item.cantidad || 0), 0);
    const montoEnDivisaCotizada = Number(formOperacion.Monto) || 0;
    const tipoCambio = Number(formOperacion.tipo_cambio) || 18.00;
    const isUSD = formOperacion.moneda_cotizacion === 'USD';
    const montoBaseMXN = isUSD ? montoEnDivisaCotizada * tipoCambio : montoEnDivisaCotizada;

    const payload = {
      ...formOperacion,
      codigos_facturar: serializedCodes,
      cantidad_pz: totalQty,
      Monto: montoBaseMXN,
      monto_original: montoEnDivisaCotizada,
      moneda_cotizacion: formOperacion.moneda_cotizacion || 'MXN',
      tipo_cambio: tipoCambio,
      Margen: Number(formOperacion.Margen) || 0,
      porcentaje_cierre: Number(formOperacion.porcentaje_cierre) || 0,
    };

    try {
      const isNew = editOperacionId === null || editOperacionId === 0;

      if (isNew) {
        const stored = localStorage.getItem('cotizacion_counter');
        let currentNum = stored !== null ? parseInt(stored, 10) : -1;
        
        let initials = "DS";
        if (userProfile && userProfile.nombre) {
          const parts = userProfile.nombre.trim().split(" ");
          if (parts.length >= 2 && parts[0] && parts[1]) {
            initials = (parts[0][0] + parts[1][0]).toUpperCase();
          } else {
            initials = userProfile.nombre.substring(0, 2).toUpperCase();
          }
        }
        
        const expectedNextNum = currentNum + 1;
        const expectedNextCotNum = `${initials}-${String(expectedNextNum).padStart(5, '0')}`;
        
        if (formOperacion.No_Cotizacion === expectedNextCotNum) {
          localStorage.setItem('cotizacion_counter', expectedNextNum.toString());
        }
      }

      const url = isNew ? '/api/cotizaciones' : `/api/cotizaciones/${editOperacionId}`;
      const method = isNew ? 'POST' : 'PUT';
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (response.ok) {
        fetchAllData();
        setActiveModal(null);
        showNotification(isNew ? 'Operación creada correctamente' : 'Operación actualizada correctamente');
      } else {
        throw new Error();
      }
    } catch {
      if (editOperacionId) {
        setCotizaciones(cotizaciones.map(c => c.id === editOperacionId ? { ...payload, id: editOperacionId } : c));
        setProcesamiento(procesamiento.map(p => p.id === editOperacionId ? { ...payload, id: editOperacionId } : p));
      } else {
        setCotizaciones([{ ...payload, id: Date.now() }, ...cotizaciones]);
      }
      setActiveModal(null);
      showNotification('Operación guardada localmente', 'info');
    }
  };

  // --- IA LOCAL OPERACIONES ---
  const sugerirCierreIA = async (quote) => {
    setCargandoIA(true);
    setSugerenciaIADetalle('');
    try {
      const response = await fetch('/api/ai/suggest-close', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(quote)
      });
      if (response.ok) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let text = '';
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          text += decoder.decode(value, { stream: true });
          setSugerenciaIADetalle(text);
        }
      } else {
        throw new Error();
      }
    } catch {
      const mockEmail = `Asunto: Seguimiento de propuesta comercial ${quote.No_Cotizacion}\n\nEstimado cliente de ${quote.Cliente},\n\nLe escribo para dar seguimiento a la cotización ${quote.No_Cotizacion} por concepto de "${quote.Pedido}" con un monto de ${formatCurrency(quote.Monto)} MXN. Estamos a sus órdenes para cualquier ajuste técnico.\n\nAtentamente,\nAsistente Comercial`;
      setSugerenciaIADetalle(mockEmail);
    } finally {
      setCargandoIA(false);
    }
  };

  const buscarRAG = async (e) => {
    e.preventDefault();
    if (!ragQuery.trim()) return;
    setCargandoIA(true);
    setRagResult('');
    try {
      const response = await fetch('/api/ai/search-rag', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: ragQuery })
      });
      if (response.ok) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let text = '';
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          text += decoder.decode(value, { stream: true });
          setRagResult(text);
        }
      } else {
        throw new Error();
      }
    } catch {
      const queryLower = ragQuery.toLowerCase();
      const matches = catalogoProd.filter(p =>
        p.descripcion.toLowerCase().includes(queryLower) ||
        p.marca.toLowerCase().includes(queryLower) ||
        p.codigo.toLowerCase().includes(queryLower)
      );
      if (matches.length > 0) {
        let text = `Resultados de búsqueda local (Modo Offline):\n\n`;
        matches.forEach(m => {
          text += `- SKU: ${m.codigo} | ${m.marca}\n  ${m.descripcion}\n  Precio sugerido: ${formatCurrency(m.precio)} ${m.moneda}\n  Tiempos: ${m.tiempo_entrega}\n\n`;
        });
        setRagResult(text);
      } else {
        setRagResult("No se encontraron coincidencias en el catálogo local.");
      }
    } finally {
      setCargandoIA(false);
    }
  };

  // --- HELPER DIALOGS ---
  const openRelationalModal = (type, id) => {
    setModalEntity({ type, id });
  };

  const verPerfilCompleto = () => {
    setActiveProfile(modalEntity);
    setActiveTab('perfil_completo');
    setModalEntity(null);
  };

  // --- COMPONENTES MODAL DE ENTRADA (CUSTOM MODALS) ---

  const saveConfigIA = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/ai/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(aiConfig)
      });
      if (response.ok) {
        showNotification("Configuración de IA local guardada con éxito.", "success");
        setShowConfigModal(false);
        if (crossSellingClient) {
          fetchCrossSelling(crossSellingClient);
        }
      } else {
        throw new Error();
      }
    } catch {
      showNotification("No se pudo guardar la configuración en el backend.", "error");
    }
  };

  const renderModalConfigIA = () => {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
        <div className="bg-white rounded-2xl w-[500px] shadow-2xl border border-slate-200 flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
            <div className="flex items-center gap-2.5">
              <div className="bg-purple-100 text-purple-700 p-2 rounded-lg">
                <BrainCircuit size={18} />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-800">Ajustes de Nova (IA Local)</h3>
                <p className="text-[10px] text-slate-500">Parámetros del motor semántico LanceDB y LLM Ollama</p>
              </div>
            </div>
            <button type="button" onClick={() => setShowConfigModal(false)} className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg cursor-pointer"><X size={16} /></button>
          </div>

          {/* Form Content */}
          <form onSubmit={saveConfigIA} className="flex-1 overflow-y-auto p-6 space-y-6">

            {/* Seccion 1: Cross-Selling / Automatizacion */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5 border-b border-slate-100 pb-2">
                <span className="w-1.5 h-3 bg-purple-600 rounded-xs"></span>
                1. Automatización y Venta Cruzada (Background)
              </h4>

              {/* Temp / Agresividad */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-slate-700">Agresividad de sugerencias (Creatividad)</span>
                  <span className="font-mono text-purple-600 font-bold">{aiConfig.cross_selling.temperature}</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="0.7"
                  step="0.05"
                  value={aiConfig.cross_selling.temperature}
                  onChange={e => setAiConfig({
                    ...aiConfig,
                    cross_selling: { ...aiConfig.cross_selling, temperature: parseFloat(e.target.value) }
                  })}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                />
                <p className="text-[9px] text-slate-400 leading-normal">
                  Controla qué tan creativa o agresiva es la IA al buscar relaciones de compra. Los valores bajos (0.1) son conservadores y deterministas, sugiriendo solo productos con un historial idéntico. Los valores altos (0.7) son predictivos, proponiendo asociaciones más amplias y audaces basadas en tendencias de categorías similares.
                </p>
              </div>

              {/* Certeza Minima / Similarity */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-slate-700">Certeza mínima (Umbral de Similitud)</span>
                  <span className="font-mono text-purple-600 font-bold">{Math.round(aiConfig.cross_selling.min_similarity * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.10"
                  max="0.90"
                  step="0.05"
                  value={aiConfig.cross_selling.min_similarity}
                  onChange={e => setAiConfig({
                    ...aiConfig,
                    cross_selling: { ...aiConfig.cross_selling, min_similarity: parseFloat(e.target.value) }
                  })}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                />
                <p className="text-[9px] text-slate-400 leading-normal">
                  Filtra los resultados vectoriales en LanceDB. Un umbral estricto (80%+) asegura sugerencias sumamente relevantes para evitar ofrecer complementos incompatibles. Un umbral más permisivo (30%+) amplía el rango de opciones, ideal para explorar nuevas combinaciones de productos.
                </p>
              </div>
            </div>

            {/* Seccion 2: Chat de Cotizacion / Asistente Tecnico */}
            <div className="space-y-4 pt-2">
              <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5 border-b border-slate-100 pb-2">
                <span className="w-1.5 h-3 bg-blue-600 rounded-xs"></span>
                2. Chat Técnico y Asistente en Tiempo Real
              </h4>

              {/* Estilo de redacción */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 block">Estilo de redacción (Tono)</label>
                <select
                  value={aiConfig.chat_tecnico.temperature}
                  onChange={e => setAiConfig({
                    ...aiConfig,
                    chat_tecnico: { ...aiConfig.chat_tecnico, temperature: parseFloat(e.target.value) }
                  })}
                  className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-slate-50 focus:outline-blue-600 font-medium"
                >
                  <option value="0.1">Técnico / Directo (Temperatura 0.1) — Conciso y con especificaciones duras</option>
                  <option value="0.4">Equilibrado (Temperatura 0.4) — Respuesta profesional estándar</option>
                  <option value="0.6">Comercial / Persuasivo (Temperatura 0.6) — Destaca beneficios e incentiva la compra</option>
                </select>
                <p className="text-[9px] text-slate-400 leading-normal">
                  Modifica el tono de redacción del LLM. Con el tono técnico, la IA se apegará rígidamente a los detalles mecánicos y técnicos de la base de datos. Con el tono comercial, adaptará el vocabulario para que sea más fluido, explicando los beneficios comerciales y facilitando el cierre de tratos.
                </p>
              </div>

              {/* Memoria de Cotizacion */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 block">Memoria de la Cotización (Contexto)</label>
                <select
                  value={aiConfig.chat_tecnico.num_ctx}
                  onChange={e => setAiConfig({
                    ...aiConfig,
                    chat_tecnico: { ...aiConfig.chat_tecnico, num_ctx: parseInt(e.target.value) }
                  })}
                  className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-slate-50 focus:outline-blue-600 font-medium"
                >
                  <option value="1024">Focalizado / Rápido (1,024 tokens) — Ideal para CPUs lentos</option>
                  <option value="2048">Estándar (2,048 tokens) — Historial de conversación equilibrado</option>
                  <option value="4096">Memoria Larga (4,096 tokens) — Útil para requerimientos complejos e historiales extensos</option>
                  <option value="8192">Conversación Completa (8,192 tokens) — Mayor uso de RAM</option>
                </select>
                <p className="text-[9px] text-slate-400 leading-normal">
                  Establece la cantidad máxima de texto que el modelo puede recordar de los mensajes previos de la sesión. Un contexto menor requiere menos memoria RAM/VRAM y genera respuestas más veloces, mientras que un contexto mayor permite mantener coherencia en conversaciones largas a costa de una velocidad menor.
                </p>
              </div>

              {/* Detalle de Respuesta */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-slate-700">Detalle de respuesta (Máximo de tokens)</span>
                  <span className="font-mono text-blue-600 font-bold">{aiConfig.chat_tecnico.num_predict} tokens</span>
                </div>
                <input
                  type="range"
                  min="128"
                  max="1024"
                  step="64"
                  value={aiConfig.chat_tecnico.num_predict}
                  onChange={e => setAiConfig({
                    ...aiConfig,
                    chat_tecnico: { ...aiConfig.chat_tecnico, num_predict: parseInt(e.target.value) }
                  })}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <p className="text-[9px] text-slate-400 leading-normal">
                  Delimita la longitud máxima permitida para la respuesta generada. Configurar valores bajos (128-256 tokens) es ideal para redactar mensajes de envío rápido por WhatsApp o chat; valores altos (512-1024 tokens) permiten generar cartas de propuesta técnica o correos comerciales detallados.
                </p>
              </div>
            </div>

            {/* Seccion 3: Sistema */}
            <div className="space-y-4 pt-2">
              <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5 border-b border-slate-100 pb-2">
                <span className="w-1.5 h-3 bg-slate-700 rounded-xs"></span>
                3. Ajustes de Sistema
              </h4>

              {/* Modo de energia */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 block">Modo de energía (Persistencia del Modelo)</label>
                <select
                  value={aiConfig.sistema.keep_alive}
                  onChange={e => setAiConfig({
                    ...aiConfig,
                    sistema: { ...aiConfig.sistema, keep_alive: e.target.value }
                  })}
                  className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-slate-50 focus:outline-slate-600 font-medium"
                >
                  <option value="0s">Descargar inmediatamente (0s) — Libera RAM al instante</option>
                  <option value="5m">Mantener 5 minutos (5m) — Recomendado para sesiones intermitentes</option>
                  <option value="30m">Mantener 30 minutos (30m) — Equilibrio para jornadas intensas</option>
                  <option value="-1">Mantener siempre cargado (-1) — Respuesta inmediata (Uso permanente de RAM)</option>
                </select>
                <p className="text-[9px] text-slate-400 leading-normal">
                  Controla por cuánto tiempo se mantiene el modelo de lenguaje alojado en la memoria RAM tras completar una petición. Si se mantiene cargado (e.g. siempre encendido), las siguientes peticiones responderán al instante. Si se descarga inmediatamente, liberará recursos del sistema para que otras aplicaciones no se ralenticen.
                </p>
              </div>
            </div>

          </form>

          {/* Footer */}
          <div className="p-4 border-t border-slate-100 flex justify-end gap-2.5 bg-slate-50">
            <button
              type="button"
              onClick={() => setShowConfigModal(false)}
              className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-700 transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={saveConfigIA}
              className="px-4 py-2 bg-[#07417B] text-white rounded-xl text-xs font-semibold hover:opacity-90 transition-all cursor-pointer shadow-xs"
            >
              Guardar Configuración
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderModalFormulario = () => {
    if (!activeModal) return null;

    return (
      <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-[90] flex items-center justify-center animate-in fade-in" onClick={() => {
        setFormCliente({ numero: '', nombre: '', puesto: '', empresa: '', telefono: '', correo: '', tags: '', nota: '', equipo_id: '' });
        setFormProveedor({ numero: '', nombre: '', puesto: '', empresa: '', telefono: '', correo: '', descuento: '', tags: '', compra_minima: '', compra_envio_pagado: '', nota: '' });
        setFormEquipo({ nombre: '' });
        setFormVendedor({ nombre: '', puesto: '', celular: '', correo: '', equipo_id: '' });
        setNuevaCatNombre(''); setListaAtributosTemporales([]);
        setNuevoProducto({ categoria_id: '', marca: '', num_proveedor: '', codigo: '', codigo_interno: '', descripcion: '', precio: 0, moneda: 'MXN', tiempo_entrega: '', recomendaciones: '', valores_atributos: {} });
        setFormContacto({ nombre: '', puesto: '', telefono: '', correo: '' });
        setFormMeta({ categoria: '', marca: '', objetivo: '', actual: 0 });
        setFormOperacion({
          Pedido: '', No_Cotizacion: '', num_cliente: '', Cliente: '', equipo_id: '',
          Categoría: 'Cotización', Estatus: 'Nueva', Progreso: 'No iniciado', Prioridad: 'Media',
          Monto: 0, Margen: 0, Entrega: '', dias_abierta: 0, codigos_facturar: '', cantidad_pz: 0,
          fecha_llegada: '', notas: '', ref_cliente: '', ref_proveedor: '', no_sp_ptt: '', guia: '',
          contacto_cliente: '', vendedor: '', coordinacion: '', grupo_materiales: '', porcentaje_cierre: 0,
          certificacion: 'No', importacion: 'No', pendiente_armado: 'No', fecha_creacion: new Date().toISOString()
        });
        setEditClienteId(null); setEditProveedorId(null); setEditEquipoId(null); setEditVendedorId(null); setEditCategoryId(null); setEditCoordinacionId(null); setEditProductoId(null); setEditContactoId(null); setEditMetaId(null); setEditOperacionId(null);
        setCodigosList([]);
        setShowNuevoContactoOperacion(false);
        setActiveModal(null);
      }}>
        <div className={`bg-white rounded-xl shadow-2xl w-full ${activeModal === 'operacion' ? 'max-w-4xl' : 'max-w-lg'} overflow-hidden flex flex-col max-h-[90vh]`} onClick={e => e.stopPropagation()}>
          <div className="bg-[#07417B] p-4 flex justify-between items-center text-white shrink-0">
            <h3 className="font-bold text-base flex items-center gap-2">
              <Plus size={18} />
              {activeModal === 'cliente' && (editClienteId ? 'Editar Cliente' : 'Nuevo Cliente')}
              {activeModal === 'proveedor' && (editProveedorId ? 'Editar Proveedor' : 'Nuevo Proveedor')}
              {activeModal === 'categoria' && (editCategoryId ? 'Editar Categoría' : 'Nueva Categoría')}
              {activeModal === 'coordinacion' && (editCoordinacionId ? 'Editar Coordinación' : 'Nueva Coordinación')}
              {activeModal === 'producto' && (editProductoId ? 'Editar Producto' : 'Nuevo Producto')}
              {activeModal === 'equipo' && (editEquipoId ? 'Editar Equipo' : 'Nuevo Equipo')}
              {activeModal === 'vendedor' && (editVendedorId ? 'Editar Asesor' : 'Nuevo Asesor')}
              {activeModal === 'contacto' && (editContactoId ? 'Editar Contacto' : 'Nuevo Contacto')}
              {activeModal === 'meta' && (editMetaId ? 'Editar Meta de Venta' : 'Nueva Meta de Venta')}
              {activeModal === 'operacion' && (editOperacionId ? 'Editar Operación' : 'Nueva Operación')}
            </h3>
            <button onClick={() => setActiveModal(null)} className="text-blue-100 hover:text-white cursor-pointer"><X size={20} /></button>
          </div>

          <div className="p-6 overflow-y-auto bg-slate-50 flex-1">
            {/* Form Cliente */}
            {activeModal === 'cliente' && (
              <form id="modal-form" onSubmit={guardarCliente} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Código/No. Cliente</label>
                    <input type="text" required className="w-full p-2 mt-1 border border-slate-300 rounded-lg text-sm bg-white" placeholder="C-102" value={formCliente.numero} onChange={e => setFormCliente({ ...formCliente, numero: e.target.value })} />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Equipo Comercial</label>
                    <select required className="w-full p-2 mt-1 border border-slate-300 rounded-lg text-sm bg-white" value={formCliente.equipo_id} onChange={e => setFormCliente({ ...formCliente, equipo_id: e.target.value })}>
                      <option value="">Seleccionar...</option>
                      {equipos.map(eq => <option key={eq.id} value={eq.id}>{eq.nombre}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Empresa/Razón Social</label>
                  <input type="text" required className="w-full p-2 mt-1 border border-slate-300 rounded-lg text-sm bg-white" placeholder="Energía Azteca" value={formCliente.empresa} onChange={e => setFormCliente({ ...formCliente, empresa: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Contacto Principal</label>
                    <input type="text" required className="w-full p-2 mt-1 border border-slate-300 rounded-lg text-sm bg-white" placeholder="Luis Flores" value={formCliente.nombre} onChange={e => setFormCliente({ ...formCliente, nombre: e.target.value })} />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Puesto</label>
                    <input type="text" required className="w-full p-2 mt-1 border border-slate-300 rounded-lg text-sm bg-white" placeholder="Gerente" value={formCliente.puesto} onChange={e => setFormCliente({ ...formCliente, puesto: e.target.value })} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Teléfono</label>
                    <input type="text" required className="w-full p-2 mt-1 border border-slate-300 rounded-lg text-sm bg-white" placeholder="6861234567" value={formCliente.telefono} onChange={e => setFormCliente({ ...formCliente, telefono: e.target.value })} />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Correo</label>
                    <input type="email" required className="w-full p-2 mt-1 border border-slate-300 rounded-lg text-sm bg-white" placeholder="correo@empresa.com" value={formCliente.correo} onChange={e => setFormCliente({ ...formCliente, correo: e.target.value })} />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Tags (Separados por comas)</label>
                  <input type="text" className="w-full p-2 mt-1 border border-slate-300 rounded-lg text-sm bg-white" placeholder="Válvulas, Danfoss" value={formCliente.tags} onChange={e => setFormCliente({ ...formCliente, tags: e.target.value })} />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Notas</label>
                  <textarea className="w-full p-2 mt-1 border border-slate-300 rounded-lg text-sm bg-white h-16 resize-none" placeholder="Nota..." value={formCliente.nota} onChange={e => setFormCliente({ ...formCliente, nota: e.target.value })} />
                </div>
              </form>
            )}

            {/* Form Proveedor */}
            {activeModal === 'proveedor' && (
              <form id="modal-form" onSubmit={guardarProveedor} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">No. Proveedor</label>
                    <input type="text" required className="w-full p-2 mt-1 border border-slate-300 rounded-lg text-sm bg-white" placeholder="P-501" value={formProveedor.numero} onChange={e => setFormProveedor({ ...formProveedor, numero: e.target.value })} />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Descuento Pactado</label>
                    <input type="text" required className="w-full p-2 mt-1 border border-slate-300 rounded-lg text-sm bg-white" placeholder="35%" value={formProveedor.descuento} onChange={e => setFormProveedor({ ...formProveedor, descuento: e.target.value })} />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Distribuidor / Razón Social</label>
                  <input type="text" required className="w-full p-2 mt-1 border border-slate-300 rounded-lg text-sm bg-white" placeholder="Danfoss México" value={formProveedor.empresa} onChange={e => setFormProveedor({ ...formProveedor, empresa: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Ejecutivo Asignado</label>
                    <input type="text" required className="w-full p-2 mt-1 border border-slate-300 rounded-lg text-sm bg-white" placeholder="Alejandro H." value={formProveedor.nombre} onChange={e => setFormProveedor({ ...formProveedor, nombre: e.target.value })} />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Puesto</label>
                    <input type="text" required className="w-full p-2 mt-1 border border-slate-300 rounded-lg text-sm bg-white" placeholder="Asesor" value={formProveedor.puesto} onChange={e => setFormProveedor({ ...formProveedor, puesto: e.target.value })} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Teléfono</label>
                    <input type="text" required className="w-full p-2 mt-1 border border-slate-300 rounded-lg text-sm bg-white" placeholder="5551234567" value={formProveedor.telefono} onChange={e => setFormProveedor({ ...formProveedor, telefono: e.target.value })} />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Correo</label>
                    <input type="email" required className="w-full p-2 mt-1 border border-slate-300 rounded-lg text-sm bg-white" placeholder="ventas@danfoss.com" value={formProveedor.correo} onChange={e => setFormProveedor({ ...formProveedor, correo: e.target.value })} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Compra Mínima ($)</label>
                    <input type="number" required className="w-full p-2 mt-1 border border-slate-300 rounded-lg text-sm bg-value" value={formProveedor.compra_minima || ''} onChange={e => setFormProveedor({ ...formProveedor, compra_minima: e.target.value })} />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Monto Envío Gratis ($)</label>
                    <input type="number" required className="w-full p-2 mt-1 border border-slate-300 rounded-lg text-sm bg-value" value={formProveedor.compra_envio_pagado || ''} onChange={e => setFormProveedor({ ...formProveedor, compra_envio_pagado: e.target.value })} />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Marcas Distribuidas (Separadas por comas)</label>
                  <input type="text" className="w-full p-2 mt-1 border border-slate-300 rounded-lg text-sm bg-white" placeholder="Danfoss, Emerson" value={formProveedor.tags} onChange={e => setFormProveedor({ ...formProveedor, tags: e.target.value })} />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Notas</label>
                  <textarea className="w-full p-2 mt-1 border border-slate-300 rounded-lg text-sm bg-white h-20" placeholder="Escribe aquí las notas del proveedor..." value={formProveedor.nota || ''} onChange={e => setFormProveedor({ ...formProveedor, nota: e.target.value })}></textarea>
                </div>
              </form>
            )}

            {/* Form Coordinación */}
            {activeModal === 'coordinacion' && (
              <form id="modal-form" onSubmit={guardarCoordinacion} className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Nombre de la Coordinación</label>
                  <input type="text" required className="w-full p-2 mt-1 border border-slate-300 rounded-lg text-sm bg-white" placeholder="ej: Instrumentación" value={nuevaCoordinacionNombre} onChange={e => setNuevaCoordinacionNombre(e.target.value)} />
                </div>
              </form>
            )}

            {/* Form Categoría */}
            {activeModal === 'categoria' && (
              <form id="modal-form" onSubmit={guardarCategoria} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Nombre de la Categoría</label>
                    <input type="text" required className="w-full p-2 mt-1 border border-slate-300 rounded-lg text-sm bg-white" placeholder="ej: Válvulas de Bola" value={nuevaCatNombre} onChange={e => setNuevaCatNombre(e.target.value)} />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Coordinación</label>
                    <div className="mt-2 flex flex-wrap gap-2 max-h-32 overflow-y-auto p-2 border border-slate-200 rounded-lg bg-slate-50">
                      {coordinaciones.map(opt => {
                        const isChecked = nuevaCatCoordinacion.split(',').map(s=>s.trim()).includes(opt.nombre);
                        return (
                        <label key={opt.id} className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10px] cursor-pointer transition-colors ${isChecked ? 'bg-[#07417B] border-[#07417B] text-white font-bold' : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-100 font-medium'}`}>
                          <input 
                            type="checkbox" 
                            className="hidden" 
                            checked={isChecked}
                            onChange={(e) => {
                              const parts = nuevaCatCoordinacion ? nuevaCatCoordinacion.split(',').map(s=>s.trim()).filter(Boolean) : [];
                              if (e.target.checked) {
                                if (!parts.includes(opt.nombre)) parts.push(opt.nombre);
                              } else {
                                const idx = parts.indexOf(opt.nombre);
                                if (idx > -1) parts.splice(idx, 1);
                              }
                              setNuevaCatCoordinacion(parts.join(', '));
                            }}
                          />
                          {isChecked && <Check size={10} />}
                          {opt.nombre}
                        </label>
                        );
                      })}
                    </div>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Atributos Técnicos Dinámicos</label>
                  <div className="flex gap-2">
                    <input type="text" className="flex-1 p-2 border border-slate-300 rounded-lg text-sm bg-white" placeholder="ej: Diámetro" value={nuevoAtributoNombre} onChange={e => setNuevoAtributoNombre(e.target.value)} />
                    <button type="button" onClick={agregarAtributoACategoria} className="bg-[#07417B] text-white px-4 py-2 rounded-lg text-xs font-bold hover:opacity-90 cursor-pointer">Añadir</button>
                  </div>
                  {listaAtributosTemporales.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2.5">
                      {listaAtributosTemporales.map((attr, idx) => (
                        <span key={idx} className="bg-slate-200 text-slate-700 border border-slate-300 text-[10px] px-2.5 py-0.5 rounded-full flex items-center gap-1 font-bold">
                          {attr}
                          <X size={12} className="cursor-pointer text-slate-400 hover:text-slate-600" onClick={() => setListaAtributosTemporales(listaAtributosTemporales.filter((_, i) => i !== idx))} />
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </form>
            )}

            {/* Form Producto */}
            {activeModal === 'producto' && (
              <form id="modal-form" onSubmit={guardarProducto} className="space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Código Proveedor</label>
                    <input type="text" required className="w-full p-2 mt-1 border border-slate-300 rounded-lg text-sm bg-white" placeholder="WOR-59-2" value={nuevoProducto.codigo} onChange={e => setNuevoProducto({ ...nuevoProducto, codigo: e.target.value })} />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Código Interno</label>
                    <input type="text" className="w-full p-2 mt-1 border border-slate-300 rounded-lg text-sm bg-white" placeholder="INT-001" value={nuevoProducto.codigo_interno || ''} onChange={e => setNuevoProducto({ ...nuevoProducto, codigo_interno: e.target.value })} />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Marca</label>
                    <input type="text" required className="w-full p-2 mt-1 border border-slate-300 rounded-lg text-sm bg-white" placeholder="Worcester" value={nuevoProducto.marca} onChange={e => setNuevoProducto({ ...nuevoProducto, marca: e.target.value })} />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Categoría / Familia</label>
                  <select required className="w-full p-2 mt-1 border border-slate-300 rounded-lg text-sm bg-white" value={nuevoProducto.categoria_id} onChange={e => {
                    const cat = categoriasProd.find(c => c.id === e.target.value);
                    setNuevoProducto({
                      ...nuevoProducto,
                      categoria_id: e.target.value,
                      valores_atributos: cat ? { ...cat.atributos.reduce((acc, a) => ({ ...acc, [a]: '' }), {}), margen: 25, flete: 0, costo_compra: 0 } : { margen: 25, flete: 0, costo_compra: 0 }
                    });
                  }}>
                    <option value="">Seleccione...</option>
                    {categoriasProd.map(cat => <option key={cat.id} value={cat.id}>{cat.nombre}</option>)}
                  </select>
                </div>

                {/* Atributos dinámicos */}
                {nuevoProducto.categoria_id && categoriasProd.find(c => c.id === nuevoProducto.categoria_id)?.atributos.map(attr => (
                  <div key={attr}>
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Atributo: {attr}</label>
                    <input
                      type="text"
                      required
                      className="w-full p-2 mt-1 border border-slate-300 rounded-lg text-sm bg-white"
                      placeholder={`Valor de ${attr}`}
                      value={nuevoProducto.valores_atributos[attr] || ''}
                      onChange={e => setNuevoProducto({
                        ...nuevoProducto,
                        valores_atributos: { ...nuevoProducto.valores_atributos, [attr]: e.target.value }
                      })}
                    />
                  </div>
                ))}

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Proveedor Ref.</label>
                    <select required className="w-full p-2 mt-1 border border-slate-300 rounded-lg text-sm bg-white" value={nuevoProducto.num_proveedor} onChange={e => setNuevoProducto({ ...nuevoProducto, num_proveedor: e.target.value })}>
                      <option value="">Seleccione...</option>
                      {proveedores.map(p => <option key={p.numero} value={p.numero}>{p.empresa}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Costo Compra ($)</label>
                    <input type="number" required className="w-full p-2 mt-1 border border-slate-300 rounded-lg text-sm bg-white" 
                      value={nuevoProducto.valores_atributos?.costo_compra || ''} 
                      onChange={e => {
                        const costo = Number(e.target.value);
                        const flete = Number(nuevoProducto.valores_atributos?.flete || 0);
                        const margen = Number(nuevoProducto.valores_atributos?.margen !== undefined ? nuevoProducto.valores_atributos.margen : 25);
                        const precio = margen < 100 ? (costo + flete) / (1 - margen / 100) : 0;
                        setNuevoProducto({ 
                          ...nuevoProducto, 
                          precio: precio,
                          valores_atributos: { ...nuevoProducto.valores_atributos, costo_compra: costo, flete, margen }
                        });
                      }} 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Flete ($)</label>
                    <input type="number" required className="w-full p-2 mt-1 border border-slate-300 rounded-lg text-sm bg-white" 
                      value={nuevoProducto.valores_atributos?.flete || ''} 
                      onChange={e => {
                        const flete = Number(e.target.value);
                        const costo = Number(nuevoProducto.valores_atributos?.costo_compra || 0);
                        const margen = Number(nuevoProducto.valores_atributos?.margen !== undefined ? nuevoProducto.valores_atributos.margen : 25);
                        const precio = margen < 100 ? (costo + flete) / (1 - margen / 100) : 0;
                        setNuevoProducto({ 
                          ...nuevoProducto, 
                          precio: precio,
                          valores_atributos: { ...nuevoProducto.valores_atributos, costo_compra: costo, flete, margen }
                        });
                      }} 
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Margen (%)</label>
                    <input type="number" required className="w-full p-2 mt-1 border border-slate-300 rounded-lg text-sm bg-white" 
                      value={nuevoProducto.valores_atributos?.margen !== undefined ? nuevoProducto.valores_atributos.margen : 25} 
                      onChange={e => {
                        const margen = Number(e.target.value);
                        const costo = Number(nuevoProducto.valores_atributos?.costo_compra || 0);
                        const flete = Number(nuevoProducto.valores_atributos?.flete || 0);
                        const precio = margen < 100 ? (costo + flete) / (1 - margen / 100) : 0;
                        setNuevoProducto({ 
                          ...nuevoProducto, 
                          precio: precio,
                          valores_atributos: { ...nuevoProducto.valores_atributos, costo_compra: costo, flete, margen }
                        });
                      }} 
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Precio Sugerido ($)</label>
                    <input type="text" disabled className="w-full p-2 mt-1 border border-slate-300 rounded-lg text-sm bg-slate-100 font-bold" value={Number(nuevoProducto.precio || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Moneda</label>
                    <select className="w-full p-2 mt-1 border border-slate-300 rounded-lg text-sm bg-white" value={nuevoProducto.moneda} onChange={e => setNuevoProducto({ ...nuevoProducto, moneda: e.target.value })}>
                      <option value="MXN">MXN</option>
                      <option value="USD">USD</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Tiempo Entrega</label>
                    <input type="text" className="w-full p-2 mt-1 border border-slate-300 rounded-lg text-sm bg-white" placeholder="2 semanas" value={nuevoProducto.tiempo_entrega} onChange={e => setNuevoProducto({ ...nuevoProducto, tiempo_entrega: e.target.value })} />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Descripción Técnica</label>
                  <textarea required className="w-full p-2 mt-1 border border-slate-300 rounded-lg text-xs bg-white h-16 resize-none" value={nuevoProducto.descripcion} onChange={e => setNuevoProducto({ ...nuevoProducto, descripcion: e.target.value })} />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Notas/Recomendaciones</label>
                  <input type="text" className="w-full p-2 mt-1 border border-slate-300 rounded-lg text-sm bg-white" placeholder="No usar en vapor directo" value={nuevoProducto.recomendaciones} onChange={e => setNuevoProducto({ ...nuevoProducto, recomendaciones: e.target.value })} />
                </div>
              </form>
            )}

            {/* Form Equipo */}
            {activeModal === 'equipo' && (
              <form id="modal-form" onSubmit={guardarEquipo} className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Nombre del Equipo</label>
                  <input type="text" required className="w-full p-2.5 mt-1 border border-slate-300 rounded-lg text-sm bg-white" placeholder="Equipo Bajío" value={formEquipo.nombre} onChange={e => setFormEquipo({ nombre: e.target.value })} />
                </div>
              </form>
            )}

            {/* Form Vendedor */}
            {activeModal === 'vendedor' && (
              <form id="modal-form" onSubmit={guardarVendedor} className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Nombre Completo</label>
                  <input type="text" required className="w-full p-2 mt-1 border border-slate-300 rounded-lg text-sm bg-white" placeholder="Jesús Gonzalez" value={formVendedor.nombre} onChange={e => setFormVendedor({ ...formVendedor, nombre: e.target.value })} />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Puesto</label>
                  <input type="text" required className="w-full p-2 mt-1 border border-slate-300 rounded-lg text-sm bg-white" placeholder="Ingeniero de Ventas" value={formVendedor.puesto} onChange={e => setFormVendedor({ ...formVendedor, puesto: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Celular</label>
                    <input type="text" required className="w-full p-2 mt-1 border border-slate-300 rounded-lg text-sm bg-white" placeholder="6861110000" value={formVendedor.celular} onChange={e => setFormVendedor({ ...formVendedor, celular: e.target.value })} />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Correo</label>
                    <input type="email" required className="w-full p-2 mt-1 border border-slate-300 rounded-lg text-sm bg-white" placeholder="email@firma.com" value={formVendedor.correo} onChange={e => setFormVendedor({ ...formVendedor, correo: e.target.value })} />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Asignar Equipo</label>
                  <select required className="w-full p-2 mt-1 border border-slate-300 rounded-lg text-sm bg-white" value={formVendedor.equipo_id} onChange={e => setFormVendedor({ ...formVendedor, equipo_id: e.target.value })}>
                    <option value="">Seleccione...</option>
                    {equipos.map(eq => <option key={eq.id} value={eq.id}>{eq.nombre}</option>)}
                  </select>
                </div>
              </form>
            )}

            {/* Form Contacto */}
            {activeModal === 'contacto' && (
              <form id="modal-form" onSubmit={guardarContacto} className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Nombre Completo</label>
                  <input type="text" required className="w-full p-2 mt-1 border border-slate-300 rounded-lg text-sm bg-white" placeholder="Ana Martínez" value={formContacto.nombre} onChange={e => setFormContacto({ ...formContacto, nombre: e.target.value })} />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Puesto/Sector (ej: Pagos, Almacén)</label>
                  <input type="text" required className="w-full p-2 mt-1 border border-slate-300 rounded-lg text-sm bg-white" placeholder="Pagos" value={formContacto.puesto} onChange={e => setFormContacto({ ...formContacto, puesto: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Teléfono</label>
                    <input type="text" required className="w-full p-2 mt-1 border border-slate-300 rounded-lg text-sm bg-white" placeholder="6869998877" value={formContacto.telefono} onChange={e => setFormContacto({ ...formContacto, telefono: e.target.value })} />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Correo</label>
                    <input type="email" className="w-full p-2 mt-1 border border-slate-300 rounded-lg text-sm bg-white" placeholder="pagos@empresa.com" value={formContacto.correo} onChange={e => setFormContacto({ ...formContacto, correo: e.target.value })} />
                  </div>
                </div>
              </form>
            )}

            {/* Form Meta */}
            {activeModal === 'meta' && (
              <form id="modal-form" onSubmit={guardarMeta} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Categoría / Familia (opcional)</label>
                    <select
                      className="w-full p-2 mt-1 border border-slate-300 rounded-lg text-sm bg-white"
                      value={formMeta.categoria || ''}
                      onChange={e => setFormMeta({ ...formMeta, categoria: e.target.value, marca: '' })}
                    >
                      <option value="">Seleccionar Categoría...</option>
                      {categoriasProd.map(c => <option key={c.id} value={c.nombre}>{c.nombre}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Marca (opcional)</label>
                    <select
                      className="w-full p-2 mt-1 border border-slate-300 rounded-lg text-sm bg-white"
                      value={formMeta.marca || ''}
                      onChange={e => setFormMeta({ ...formMeta, marca: e.target.value, categoria: '' })}
                    >
                      <option value="">Seleccionar Marca...</option>
                      {[...new Set(catalogoProd.map(p => p.marca).filter(Boolean))].map(marca => (
                        <option key={marca} value={marca}>{marca}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Objetivo de Venta ($)</label>
                  <input type="number" required className="w-full p-2 mt-1 border border-slate-300 rounded-lg text-sm bg-white" placeholder="500000" value={formMeta.objetivo || ''} onChange={e => setFormMeta({ ...formMeta, objetivo: e.target.value })} />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Monto Actual Logrado ($)</label>
                  <div className="w-full p-2.5 mt-1 border border-slate-200 bg-slate-100 rounded-lg text-xs font-semibold text-slate-400 select-none">
                    Calculado automáticamente en tiempo real a partir de las OCs Facturadas (Terminadas).
                  </div>
                </div>
              </form>
            )}

            {/* Form Operación Unificado (Dinámico) */}
            {activeModal === 'operacion' && (() => {
              const currentCols = (activeTab === 'processing' || activeTab === 'archive') ? colProc : colCotis;
              const fieldJSX = {
                Pedido: (
                  <div key="Pedido">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Título (Pedido)</label>
                    <input type="text" className="w-full p-2 mt-1 border border-slate-300 rounded-lg text-sm bg-white" placeholder="ej: Válvulas de control" value={formOperacion.Pedido} onChange={e => setFormOperacion({ ...formOperacion, Pedido: e.target.value })} />
                  </div>
                ),
                No_Cotizacion: (
                  <div key="No_Cotizacion">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">No. Cotización / Referencia</label>
                    <input type="text" className="w-full p-2 mt-1 border border-slate-300 rounded-lg text-sm bg-white" placeholder="COT-9921" value={formOperacion.No_Cotizacion} onChange={e => setFormOperacion({ ...formOperacion, No_Cotizacion: e.target.value })} />
                  </div>
                ),
                num_cliente: (
                  <div key="num_cliente">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Cliente</label>
                    <input
                      type="text"
                      className="w-full p-2 mt-1 border border-slate-300 rounded-lg text-sm bg-white"
                      placeholder="Buscar por número o empresa..."
                      value={formOperacion.num_cliente ? `${formOperacion.num_cliente} - ${formOperacion.Cliente}` : formOperacion.Cliente || ''}
                      onChange={e => {
                        const val = e.target.value;
                        const match = clientes.find(c =>
                          val === `${c.numero} - ${c.empresa}` ||
                          val.toLowerCase() === c.numero.toLowerCase() ||
                          val.toLowerCase() === c.empresa.toLowerCase()
                        );
                        if (match) {
                          setFormOperacion({ ...formOperacion, num_cliente: match.numero, Cliente: match.empresa, equipo_id: match.equipo_id || formOperacion.equipo_id, contacto_cliente: '' });
                        } else {
                          const isClear = val.trim() === '';
                          setFormOperacion({ ...formOperacion, num_cliente: isClear ? '' : formOperacion.num_cliente, Cliente: val, contacto_cliente: isClear ? '' : formOperacion.contacto_cliente });
                        }
                      }}
                      list="clientes-datalist"
                    />
                    <datalist id="clientes-datalist">
                      {clientes.map(c => <option key={c.numero} value={`${c.numero} - ${c.empresa}`} />)}
                    </datalist>
                  </div>
                ),
                contacto_cliente: (
                  <div key="contacto_cliente">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Contacto Cliente</label>
                      {formOperacion.num_cliente && (
                        <button type="button" onClick={() => { setShowNuevoContactoOperacion(!showNuevoContactoOperacion); setNuevoContactoOperacionForm({ nombre: '', puesto: '', telefono: '', correo: '' }); }} className="text-[#07417B] text-[10px] font-bold hover:underline cursor-pointer">
                          {showNuevoContactoOperacion ? 'Cancelar' : '+ Rápido'}
                        </button>
                      )}
                    </div>
                    {showNuevoContactoOperacion ? (
                      <div className="mt-2 p-3 bg-slate-100 border border-slate-200 rounded-lg space-y-2">
                        <input type="text" placeholder="Nombre" required className="w-full p-1.5 border border-slate-300 rounded text-xs bg-white" value={nuevoContactoOperacionForm.nombre} onChange={e => setNuevoContactoOperacionForm({ ...nuevoContactoOperacionForm, nombre: e.target.value })} />
                        <div className="grid grid-cols-2 gap-1">
                          <input type="text" placeholder="Puesto" className="p-1.5 border border-slate-300 rounded text-xs bg-white" value={nuevoContactoOperacionForm.puesto} onChange={e => setNuevoContactoOperacionForm({ ...nuevoContactoOperacionForm, puesto: e.target.value })} />
                          <input type="text" placeholder="Teléfono" className="p-1.5 border border-slate-300 rounded text-xs bg-white" value={nuevoContactoOperacionForm.telefono} onChange={e => setNuevoContactoOperacionForm({ ...nuevoContactoOperacionForm, telefono: e.target.value })} />
                        </div>
                        <input type="email" placeholder="Correo" className="w-full p-1.5 border border-slate-300 rounded text-xs bg-white" value={nuevoContactoOperacionForm.correo} onChange={e => setNuevoContactoOperacionForm({ ...nuevoContactoOperacionForm, correo: e.target.value })} />
                        <button type="button" onClick={async () => {
                          if (!nuevoContactoOperacionForm.nombre) return;
                          const newC = { ...nuevoContactoOperacionForm, entity_id: formOperacion.num_cliente };
                          try {
                            const res = await fetch('/api/contactos', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newC) });
                            if (res.ok) {
                              const savedC = await res.json();
                              setContactosAdicionales(prev => [savedC, ...prev]);
                              setFormOperacion(prev => ({ ...prev, contacto_cliente: savedC.nombre }));
                              setShowNuevoContactoOperacion(false);
                              showNotification('Contacto agregado');
                            }
                          } catch {
                            const localC = { ...newC, id: Date.now() };
                            setContactosAdicionales(prev => [localC, ...prev]);
                            setFormOperacion(prev => ({ ...prev, contacto_cliente: localC.nombre }));
                            setShowNuevoContactoOperacion(false);
                          }
                        }} className="bg-[#07417B] text-white px-2 py-1 rounded text-[10px] font-bold hover:opacity-90 cursor-pointer">Guardar</button>
                      </div>
                    ) : (
                      <select className="w-full p-2 mt-1 border border-slate-300 rounded-lg text-sm bg-white" value={formOperacion.contacto_cliente} onChange={e => setFormOperacion({ ...formOperacion, contacto_cliente: e.target.value })}>
                        <option value="">Seleccione Contacto...</option>
                        {formOperacion.num_cliente && (
                          <>
                            {(() => {
                              const cli = clientes.find(c => c.numero === formOperacion.num_cliente);
                              return cli ? <option value={cli.nombre}>{cli.nombre} (Principal)</option> : null;
                            })()}
                            {contactosAdicionales.filter(c => c.entity_id === formOperacion.num_cliente).map(c => <option key={c.id} value={c.nombre}>{c.nombre} (Adicional)</option>)}
                          </>
                        )}
                      </select>
                    )}
                  </div>
                ),
                vendedor: (
                  <div key="vendedor">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Vendedor</label>
                    <select className="w-full p-2 mt-1 border border-slate-300 rounded-lg text-sm bg-white" value={formOperacion.vendedor} onChange={e => setFormOperacion({ ...formOperacion, vendedor: e.target.value })}>
                      <option value="">Seleccione Vendedor...</option>
                      {vendedores.map(v => <option key={v.id} value={v.nombre}>{v.nombre} ({equipos.find(eq => eq.id === v.equipo_id)?.nombre || 'Sin equipo'})</option>)}
                    </select>
                  </div>
                ),
                equipo_id: (
                  <div key="equipo_id">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Equipo Comercial</label>
                    <select className="w-full p-2 mt-1 border border-slate-300 rounded-lg text-sm bg-white" value={formOperacion.equipo_id} onChange={e => setFormOperacion({ ...formOperacion, equipo_id: e.target.value })}>
                      <option value="">Seleccione Equipo...</option>
                      {equipos.map(eq => <option key={eq.id} value={eq.id}>{eq.nombre}</option>)}
                    </select>
                  </div>
                ),
                Categoría: (
                  <div key="Categoría">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Categoría</label>
                    <select className="w-full p-2 mt-1 border border-slate-300 rounded-lg text-sm bg-white" value={formOperacion.Categoría} onChange={e => setFormOperacion({ ...formOperacion, Categoría: e.target.value })}>
                      <option value="Cotización">Cotización</option>
                      <option value="En SP">En SP</option>
                      <option value="Orden de compra">Orden de Compra</option>
                      <option value="Facturar">Por Facturar</option>
                      <option value="Terminado">Facturado</option>
                      <option value="Garantía">Garantía</option>
                    </select>
                  </div>
                ),
                Estatus: (
                  <div key="Estatus">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Estatus</label>
                    <select className="w-full p-2 mt-1 border border-slate-300 rounded-lg text-sm bg-white" value={formOperacion.Estatus} onChange={e => setFormOperacion({ ...formOperacion, Estatus: e.target.value })}>
                      <option value="Nueva">Nueva</option>
                      <option value="Respuesta pendiente del proveedor">Respuesta pendiente del proveedor</option>
                      <option value="Pendiente enviar a Cliente">Pendiente enviar a Cliente</option>
                      <option value="Enviada">Enviada</option>
                      <option value="En revisión">En revisión</option>
                      <option value="Aprobada">Aprobada</option>
                      <option value="Rechazada">Rechazada</option>
                      <option value="Pausada">Pausada</option>
                    </select>
                  </div>
                ),
                Progreso: (
                  <div key="Progreso">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Progreso</label>
                    <select className="w-full p-2 mt-1 border border-slate-300 rounded-lg text-sm bg-white" value={formOperacion.Progreso} onChange={e => setFormOperacion({ ...formOperacion, Progreso: e.target.value })}>
                      <option value="No iniciado">No iniciado</option>
                      <option value="En curso">En curso</option>
                      <option value="Retraso de proveedor">Retraso de proveedor</option>
                      <option value="En Certificación">En Certificación</option>
                      <option value="Completado">Completado</option>
                    </select>
                  </div>
                ),
                Prioridad: (
                  <div key="Prioridad">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Prioridad</label>
                    <select className="w-full p-2 mt-1 border border-slate-300 rounded-lg text-sm bg-white" value={formOperacion.Prioridad} onChange={e => setFormOperacion({ ...formOperacion, Prioridad: e.target.value })}>
                      <option value="Baja">Baja</option>
                      <option value="Media">Media</option>
                      <option value="Alta">Alta</option>
                      <option value="Crítica">Crítica</option>
                    </select>
                  </div>
                ),
                coordinacion: (
                  <div key="coordinacion">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Coordinación</label>
                    <div className="mt-2 flex flex-wrap gap-2 max-h-32 overflow-y-auto p-2 border border-slate-200 rounded-lg bg-slate-50">
                      {coordinaciones.map(opt => {
                        const isChecked = (formOperacion.coordinacion || '').split(',').map(s=>s.trim()).includes(opt.nombre);
                        return (
                          <label key={opt.id} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[10px] cursor-pointer transition-colors ${isChecked ? 'bg-[#07417B] border-[#07417B] text-white font-bold' : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-100 font-medium'}`}>
                            <input type="checkbox" className="hidden" checked={isChecked} onChange={(e) => {
                              const parts = formOperacion.coordinacion ? formOperacion.coordinacion.split(',').map(s=>s.trim()).filter(Boolean) : [];
                              if (e.target.checked) { if (!parts.includes(opt.nombre)) parts.push(opt.nombre); } 
                              else { const idx = parts.indexOf(opt.nombre); if (idx > -1) parts.splice(idx, 1); }
                              setFormOperacion({...formOperacion, coordinacion: parts.join(', ')});
                            }} />
                            {isChecked && <Check size={10} />}
                            {opt.nombre}
                          </label>
                        );
                      })}
                    </div>
                  </div>
                ),
                grupo_materiales: (
                  <div key="grupo_materiales">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Grupo Materiales</label>
                    <div className="mt-2 flex flex-wrap gap-2 max-h-32 overflow-y-auto p-2 border border-slate-200 rounded-lg bg-slate-50">
                      {categoriasProd.map(cat => {
                        const isChecked = (formOperacion.grupo_materiales || '').split(',').map(s=>s.trim()).includes(cat.nombre);
                        return (
                          <label key={cat.id} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[10px] cursor-pointer transition-colors ${isChecked ? 'bg-[#07417B] border-[#07417B] text-white font-bold' : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-100 font-medium'}`}>
                            <input type="checkbox" className="hidden" checked={isChecked} onChange={(e) => {
                              const parts = formOperacion.grupo_materiales ? formOperacion.grupo_materiales.split(',').map(s=>s.trim()).filter(Boolean) : [];
                              if (e.target.checked) { if (!parts.includes(cat.nombre)) parts.push(cat.nombre); } 
                              else { const idx = parts.indexOf(cat.nombre); if (idx > -1) parts.splice(idx, 1); }
                              setFormOperacion({...formOperacion, grupo_materiales: parts.join(', ')});
                            }} />
                            {isChecked && <Check size={10} />}
                            {cat.nombre}
                          </label>
                        );
                      })}
                    </div>
                  </div>
                ),
                porcentaje_cierre: (
                  <div key="porcentaje_cierre">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">% de Cierre</label>
                    <input type="number" min="0" max="100" className="w-full p-2 mt-1 border border-slate-300 rounded-lg text-sm bg-white" value={formOperacion.porcentaje_cierre} onChange={e => setFormOperacion({ ...formOperacion, porcentaje_cierre: Number(e.target.value) })} />
                  </div>
                ),
                Monto: (
                  <div key="Monto" className="md:col-span-2 lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 border border-slate-200 rounded-xl p-4">
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Moneda de Cotización</label>
                      <select className="w-full p-2 mt-1 border border-slate-300 rounded-lg text-sm bg-white font-bold text-[#07417B]" value={formOperacion.moneda_cotizacion || 'MXN'} onChange={e => {
                        const nuevaMoneda = e.target.value;
                        let currentTC = Number(formOperacion.tipo_cambio) || 18.00;
                        if (currentTC <= 1) currentTC = 18.00;
                        const newList = codigosList.map(item => {
                          let pu = item.precio_origen !== undefined ? item.precio_origen : (item.precio_unitario || 0);
                          let mo = item.moneda_origen || 'MXN';
                          if (mo === 'USD' && nuevaMoneda === 'MXN') pu = pu * currentTC;
                          else if (mo === 'MXN' && nuevaMoneda === 'USD') pu = pu / currentTC;
                          return { ...item, precio_unitario: pu };
                        });
                        setCodigosList(newList);
                        setFormOperacion(prev => ({ ...prev, moneda_cotizacion: nuevaMoneda, tipo_cambio: currentTC, Monto: newList.reduce((acc, it) => acc + ((Number(it.cantidad) || 0) * (Number(it.precio_unitario) || 0)), 0) }));
                      }}>
                        <option value="MXN">Pesos Mexicanos (MXN)</option>
                        <option value="USD">Dólares (USD)</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Tipo de Cambio</label>
                      <input type="number" step="0.01" className="w-full p-2 mt-1 border border-slate-300 rounded-lg text-sm bg-white" value={formOperacion.tipo_cambio || ''} onChange={e => {
                        const tcVal = Number(e.target.value) || 1;
                        const nuevaMoneda = formOperacion.moneda_cotizacion || 'MXN';
                        const newList = codigosList.map(item => {
                          let pu = item.precio_origen !== undefined ? item.precio_origen : (item.precio_unitario || 0);
                          let mo = item.moneda_origen || 'MXN';
                          if (mo === 'USD' && nuevaMoneda === 'MXN') pu = pu * tcVal;
                          else if (mo === 'MXN' && nuevaMoneda === 'USD') pu = pu / tcVal;
                          return { ...item, precio_unitario: pu };
                        });
                        setCodigosList(newList);
                        setFormOperacion(prev => ({ ...prev, tipo_cambio: e.target.value, Monto: newList.reduce((acc, it) => acc + ((Number(it.cantidad) || 0) * (Number(it.precio_unitario) || 0)), 0) }));
                      }} />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Monto Total ({formOperacion.moneda_cotizacion || 'MXN'})</label>
                      <input type="text" className="w-full p-2 mt-1 border border-slate-300 rounded-lg text-sm bg-slate-100 font-bold" value={Number(formOperacion.Monto || 0).toLocaleString('en-US', {minimumFractionDigits: 2})} readOnly />
                    </div>
                  </div>
                ),
                Margen: (
                  <div key="Margen">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Margen de Venta (%)</label>
                    <input type="number" className="w-full p-2 mt-1 border border-slate-300 rounded-lg text-sm bg-white" value={formOperacion.Margen || ''} onChange={e => setFormOperacion({ ...formOperacion, Margen: Number(e.target.value) })} />
                  </div>
                ),
                fecha_llegada: (
                  <div key="fecha_llegada">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Fecha de Llegada</label>
                    <input type="date" className="w-full p-2 mt-1 border border-slate-300 rounded-lg text-sm bg-white" value={formOperacion.fecha_llegada || ''} onChange={e => setFormOperacion({ ...formOperacion, fecha_llegada: e.target.value })} />
                  </div>
                ),
                Entrega: (
                  <div key="Entrega">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Fecha Entrega</label>
                    <input type="date" className="w-full p-2 mt-1 border border-slate-300 rounded-lg text-sm bg-white" value={formOperacion.Entrega || ''} onChange={e => setFormOperacion({ ...formOperacion, Entrega: e.target.value })} />
                  </div>
                ),
                codigos_facturar: (
                  <div key="codigos_facturar" className="md:col-span-2 lg:col-span-3 space-y-3 bg-slate-50 border border-slate-200 rounded-xl p-4">
                    <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                      <h5 className="text-[10px] font-bold text-slate-500 uppercase">Códigos y Cantidades a Facturar</h5>
                      <div className="flex gap-2">
                        <button type="button" onClick={() => setShowTableModal(true)} className="flex items-center gap-1 bg-slate-100 text-slate-700 px-2.5 py-1 rounded text-[10px] font-bold hover:bg-slate-200 cursor-pointer border border-slate-200">Vista de Tabla</button>
                        <button type="button" onClick={() => setCodigosList([...codigosList, { codigo: '', codigo_interno: '', cantidad: 1, entregado: false, faltantes: 0, descripcion: '', precio_unitario: 0, precio_origen: 0, moneda_origen: formOperacion.moneda_cotizacion || 'MXN', tiempo_entrega: '' }])} className="flex items-center gap-1 bg-[#07417B] text-white px-2.5 py-1 rounded text-[10px] font-bold hover:opacity-90 cursor-pointer"><Plus size={11} /> Agregar Código</button>
                      </div>
                    </div>
                    <div className="space-y-2 pr-1">
                      {codigosList.map((item, idx) => (
                        <div key={idx} className="bg-white border border-slate-200 rounded-lg p-3 space-y-2">
                          <div className="flex items-start gap-3">
                            <div className="w-1/4">
                              <label className="text-[9px] font-bold text-slate-400 uppercase">Código / SKU</label>
                              <input type="text" required placeholder="WOR-59-2" className="w-full p-1.5 border border-slate-300 rounded text-xs bg-white mt-0.5" value={item.codigo} onChange={e => {
                                const val = e.target.value; const newList = [...codigosList]; newList[idx].codigo = val;
                                const prodMatch = catalogoProd.find(p => p.codigo === val);
                                if (prodMatch) {
                                  newList[idx].descripcion = prodMatch.descripcion || ''; newList[idx].codigo_interno = prodMatch.codigo_interno || '';
                                  const pOrigen = prodMatch.precio ? Math.round((prodMatch.precio / 0.75) + 350) : 0;
                                  const mOrigen = prodMatch.moneda || 'MXN'; newList[idx].precio_origen = pOrigen; newList[idx].moneda_origen = mOrigen;
                                  let pu = pOrigen; const tcVal = Number(formOperacion.tipo_cambio) || 1;
                                  if (mOrigen === 'USD' && formOperacion.moneda_cotizacion === 'MXN') pu = pOrigen * tcVal;
                                  else if (mOrigen === 'MXN' && formOperacion.moneda_cotizacion === 'USD') pu = pOrigen / tcVal;
                                  newList[idx].precio_unitario = pu; setFormOperacion(prev => ({ ...prev, Monto: newList.reduce((acc, it) => acc + ((Number(it.cantidad) || 0) * (Number(it.precio_unitario) || 0)), 0) }));
                                }
                                setCodigosList(newList);
                              }} list="productos-datalist" />
                            </div>
                            <div className="flex-1">
                              <label className="text-[9px] font-bold text-slate-400 uppercase">Descripción</label>
                              <textarea placeholder="Descripción del producto..." className="w-full p-1.5 border border-slate-300 rounded text-xs bg-white mt-0.5 resize-y min-h-[34px]" rows="1" value={item.descripcion || ''} onChange={e => { const newList = [...codigosList]; newList[idx].descripcion = e.target.value; setCodigosList(newList); }} />
                            </div>
                            <div className="w-32">
                              <label className="text-[9px] font-bold text-slate-400 uppercase">Precio Unit.</label>
                              <div className="flex gap-1 mt-0.5">
                                <select className="p-1.5 border border-slate-300 rounded text-xs bg-white w-16" value={item.moneda_origen || formOperacion.moneda_cotizacion || 'MXN'} onChange={e => {
                                  const newList = [...codigosList]; const mOrigen = e.target.value; const pOrigen = Number(newList[idx].precio_origen !== undefined ? newList[idx].precio_origen : (newList[idx].precio_unitario || 0));
                                  newList[idx].moneda_origen = mOrigen; let pu = pOrigen; const tcVal = Number(formOperacion.tipo_cambio) || 1;
                                  if (mOrigen === 'USD' && formOperacion.moneda_cotizacion === 'MXN') pu = pOrigen * tcVal;
                                  else if (mOrigen === 'MXN' && formOperacion.moneda_cotizacion === 'USD') pu = pOrigen / tcVal;
                                  newList[idx].precio_unitario = pu; setCodigosList(newList); setFormOperacion(prev => ({ ...prev, Monto: newList.reduce((acc, it) => acc + ((Number(it.cantidad) || 0) * (Number(it.precio_unitario) || 0)), 0) }));
                                }}>
                                  <option value="MXN">MXN</option><option value="USD">USD</option>
                                </select>
                                <input type="number" className="w-full p-1.5 border border-slate-300 rounded text-xs bg-white flex-1 min-w-0" value={item.precio_origen !== undefined ? item.precio_origen : (item.precio_unitario || '')} onChange={e => {
                                  const newList = [...codigosList]; const pOrigen = Number(e.target.value) || 0; const mOrigen = newList[idx].moneda_origen || formOperacion.moneda_cotizacion || 'MXN';
                                  newList[idx].precio_origen = pOrigen; let pu = pOrigen; const tcVal = Number(formOperacion.tipo_cambio) || 1;
                                  if (mOrigen === 'USD' && formOperacion.moneda_cotizacion === 'MXN') pu = pOrigen * tcVal;
                                  else if (mOrigen === 'MXN' && formOperacion.moneda_cotizacion === 'USD') pu = pOrigen / tcVal;
                                  newList[idx].precio_unitario = pu; setCodigosList(newList); setFormOperacion(prev => ({ ...prev, Monto: newList.reduce((acc, it) => acc + ((Number(it.cantidad) || 0) * (Number(it.precio_unitario) || 0)), 0) }));
                                }} />
                              </div>
                            </div>
                            <div className="w-16">
                              <label className="text-[9px] font-bold text-slate-400 uppercase">Cant.</label>
                              <input type="number" min="1" required className="w-full p-1.5 border border-slate-300 rounded text-xs bg-white mt-0.5" value={item.cantidad} onChange={e => {
                                const newList = [...codigosList]; newList[idx].cantidad = Number(e.target.value) || 0; setCodigosList(newList); setFormOperacion(prev => ({ ...prev, Monto: newList.reduce((acc, it) => acc + ((Number(it.cantidad) || 0) * (Number(it.precio_unitario) || 0)), 0) }));
                              }} />
                            </div>
                            <div className="w-20 text-right">
                              <label className="text-[9px] font-bold text-slate-400 uppercase">Importe</label>
                              <div className="p-1.5 mt-0.5 text-xs font-bold text-[#07417B]">{((item.cantidad || 0) * (item.precio_unitario || 0)).toLocaleString('en-US', {minimumFractionDigits: 2})}</div>
                            </div>
                            <button type="button" onClick={() => {
                              const newList = codigosList.filter((_, i) => i !== idx); setCodigosList(newList); setFormOperacion(prev => ({ ...prev, Monto: newList.reduce((acc, it) => acc + ((Number(it.cantidad) || 0) * (Number(it.precio_unitario) || 0)), 0) }));
                            }} className="text-rose-500 hover:bg-rose-50 p-1.5 rounded mt-4 cursor-pointer" title="Quitar"><Trash2 size={13} /></button>
                          </div>
                          <div className="flex flex-wrap items-center gap-4 border-t border-slate-100 pt-2 text-xs">
                            <label className="flex items-center gap-1.5 font-semibold text-slate-600 cursor-pointer select-none">
                              <input type="checkbox" checked={item.entregado} className="accent-[#07417B]" onChange={e => { const newList = [...codigosList]; newList[idx].entregado = e.target.checked; if (e.target.checked) newList[idx].faltantes = 0; setCodigosList(newList); }} /> Entregado completo
                            </label>
                            {!item.entregado && (
                              <div className="flex items-center gap-2"><span className="text-slate-400 font-medium">|</span><label className="text-slate-500 font-semibold flex items-center gap-2">Pz faltantes:<input type="number" min="0" className="w-16 p-1 border border-slate-300 rounded text-xs bg-white" value={item.faltantes} onChange={e => { const newList = [...codigosList]; newList[idx].faltantes = Math.max(0, Number(e.target.value) || 0); setCodigosList(newList); }} /></label></div>
                            )}
                            <div className="flex-1"></div>
                            <label className="text-slate-500 font-semibold flex items-center gap-2">Tiempo de entrega:<input type="text" placeholder="ej. 3-4 semanas" className="w-32 p-1 border border-slate-300 rounded text-xs bg-white" value={item.tiempo_entrega || ''} onChange={e => { const newList = [...codigosList]; newList[idx].tiempo_entrega = e.target.value; setCodigosList(newList); }} /></label>
                          </div>
                        </div>
                      ))}
                      {codigosList.length === 0 && <div className="text-center py-4 text-slate-400 text-xs italic bg-white border border-dashed border-slate-200 rounded-lg">No hay códigos asignados a esta operación. Haz clic en "Agregar Código".</div>}
                    </div>
                    <datalist id="productos-datalist">{catalogoProd.map(p => <option key={p.id} value={p.codigo}>{p.marca} - {p.descripcion}</option>)}</datalist>
                  </div>
                ),
                ref_cliente: (
                  <div key="ref_cliente">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Ref Cliente</label>
                    <input type="text" className="w-full p-2 mt-1 border border-slate-300 rounded-lg text-sm bg-white" value={formOperacion.ref_cliente} onChange={e => setFormOperacion({ ...formOperacion, ref_cliente: e.target.value })} />
                  </div>
                ),
                ref_proveedor: (
                  <div key="ref_proveedor">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Ref Proveedor</label>
                    <input type="text" className="w-full p-2 mt-1 border border-slate-300 rounded-lg text-sm bg-white" value={formOperacion.ref_proveedor} onChange={e => setFormOperacion({ ...formOperacion, ref_proveedor: e.target.value })} />
                  </div>
                ),
                no_sp_ptt: (
                  <div key="no_sp_ptt">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">No. de SP y/o PTT</label>
                    <input type="text" className="w-full p-2 mt-1 border border-slate-300 rounded-lg text-sm bg-white" value={formOperacion.no_sp_ptt} onChange={e => setFormOperacion({ ...formOperacion, no_sp_ptt: e.target.value })} />
                  </div>
                ),
                guia: (
                  <div key="guia" className="md:col-span-2 lg:col-span-3">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Guía de Envío</label>
                    <input type="text" className="w-full p-2 mt-1 border border-slate-300 rounded-lg text-sm bg-white" value={formOperacion.guia} onChange={e => setFormOperacion({ ...formOperacion, guia: e.target.value })} />
                  </div>
                ),
                certificacion: (
                  <div key="certificacion">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Certificación Requerida</label>
                    <select className="w-full p-2 mt-1 border border-slate-300 rounded-lg text-sm bg-white" value={formOperacion.certificacion} onChange={e => setFormOperacion({ ...formOperacion, certificacion: e.target.value })}><option value="No">No</option><option value="Si">Si</option></select>
                  </div>
                ),
                importacion: (
                  <div key="importacion">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Requiere Importación</label>
                    <select className="w-full p-2 mt-1 border border-slate-300 rounded-lg text-sm bg-white" value={formOperacion.importacion} onChange={e => setFormOperacion({ ...formOperacion, importacion: e.target.value })}><option value="No">No</option><option value="Si">Si</option></select>
                  </div>
                ),
                pendiente_armado: (
                  <div key="pendiente_armado">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Pendiente de Armado</label>
                    <select className="w-full p-2 mt-1 border border-slate-300 rounded-lg text-sm bg-white" value={formOperacion.pendiente_armado} onChange={e => setFormOperacion({ ...formOperacion, pendiente_armado: e.target.value })}><option value="No">No</option><option value="Si">Si</option></select>
                  </div>
                ),
                notas: (
                  <div key="notas" className="md:col-span-2 lg:col-span-3">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Notas Especiales</label>
                    <textarea className="w-full p-2 mt-1 border border-slate-300 rounded-lg text-xs bg-white h-20 resize-none" placeholder="Ingresa especificaciones técnicas o logísticas aquí..." value={formOperacion.notas} onChange={e => setFormOperacion({ ...formOperacion, notas: e.target.value })} />
                  </div>
                )
              };

              // Proveedor is a special field, add it if it's not in currentCols but was in the original form. 
              // Actually, let's just always render Proveedor after Cliente if it's not mapped.
              fieldJSX.Proveedor = (
                  <div key="Proveedor">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Proveedor</label>
                    <input
                      type="text"
                      className="w-full p-2 mt-1 border border-slate-300 rounded-lg text-sm bg-white"
                      placeholder="Buscar por número o empresa..."
                      value={formOperacion.num_proveedor ? `${formOperacion.num_proveedor} - ${formOperacion.Proveedor}` : formOperacion.Proveedor || ''}
                      onChange={e => {
                        const val = e.target.value;
                        const match = proveedores.find(p => val === `${p.numero} - ${p.empresa}` || val.toLowerCase() === p.numero.toLowerCase() || val.toLowerCase() === p.empresa.toLowerCase());
                        if (match) { setFormOperacion({ ...formOperacion, num_proveedor: match.numero, Proveedor: match.empresa }); } 
                        else { const isClear = val.trim() === ''; setFormOperacion({ ...formOperacion, num_proveedor: isClear ? '' : formOperacion.num_proveedor, Proveedor: val }); }
                      }}
                      list="proveedores-datalist"
                    />
                    <datalist id="proveedores-datalist">{proveedores.map(p => <option key={p.numero} value={`${p.numero} - ${p.empresa}`} />)}</datalist>
                  </div>
              );

              return (
                <form id="modal-form" onSubmit={guardarOperacion} className="space-y-6">
                  <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
                    <h4 className="text-xs font-bold text-[#07417B] uppercase tracking-wide border-b border-slate-100 pb-2 mb-4">Detalles de Operación (Orden Dinámico)</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {/* Base form fields */}
                      {fieldJSX.Pedido}
                      {fieldJSX.No_Cotizacion}
                      {fieldJSX.num_cliente}
                      {fieldJSX.contacto_cliente}
                      {fieldJSX.vendedor}
                      {fieldJSX.equipo_id}

                      {/* Detalles Operativos */}
                      {fieldJSX.Categoría}
                      {fieldJSX.Estatus}
                      {fieldJSX.Progreso}
                      {fieldJSX.Prioridad}
                      {fieldJSX.coordinacion}
                      {fieldJSX.grupo_materiales}
                      {fieldJSX.porcentaje_cierre}

                      {fieldJSX.Monto}

                      {fieldJSX.Margen}
                      {fieldJSX.fecha_llegada}
                      {fieldJSX.Entrega}

                      {fieldJSX.codigos_facturar}

                      {/* Referencias */}
                      {fieldJSX.ref_cliente}
                      {fieldJSX.ref_proveedor}
                      {fieldJSX.no_sp_ptt}

                      {fieldJSX.guia}

                      {/* Atributos Especiales */}
                      {fieldJSX.certificacion}
                      {fieldJSX.importacion}
                      {fieldJSX.pendiente_armado}

                      {fieldJSX.Proveedor}

                      {/* Custom User Columns */}
                      {currentCols.filter(col => col.custom).map(col => {
                        const optionsConfig = configOpciones.find(c => c.columna === col.key);
                        let parsedOptions = [];
                        if (optionsConfig && optionsConfig.opciones) {
                          try { parsedOptions = JSON.parse(optionsConfig.opciones); } catch(e){}
                        }
                        return (
                          <div key={col.key}>
                            <label className="text-[10px] font-bold text-slate-500 uppercase">{col.label}</label>
                            {col.type === 'select' ? (
                              <select className="w-full p-2 mt-1 border border-slate-300 rounded-lg text-sm bg-white" value={formOperacion[col.key] || ''} onChange={e => setFormOperacion({...formOperacion, [col.key]: e.target.value})}>
                                <option value="">Seleccione...</option>
                                {parsedOptions.map(o => <option key={o.text} value={o.text}>{o.text}</option>)}
                              </select>
                            ) : (
                              <input type={col.type === 'number' ? 'number' : col.type === 'date' ? 'date' : 'text'} className="w-full p-2 mt-1 border border-slate-300 rounded-lg text-sm bg-white" value={formOperacion[col.key] || ''} onChange={e => setFormOperacion({...formOperacion, [col.key]: col.type === 'number' ? Number(e.target.value) : e.target.value})} />
                            )}
                          </div>
                        );
                      })}

                      {fieldJSX.notas}
                    </div>
                  </div>
                </form>
              );
            })()}
          </div>

          <div className="bg-white border-t border-slate-200 p-4 flex justify-end gap-3 shrink-0">
            <button onClick={() => {
              setFormCliente({ numero: '', nombre: '', puesto: '', empresa: '', telefono: '', correo: '', tags: '', nota: '', equipo_id: '' });
              setFormProveedor({ numero: '', nombre: '', puesto: '', empresa: '', telefono: '', correo: '', descuento: '', tags: '', compra_minima: '', compra_envio_pagado: '' });
              setFormEquipo({ nombre: '' });
              setFormVendedor({ nombre: '', puesto: '', celular: '', correo: '', equipo_id: '' });
              setFormVendedor({ nombre: '', puesto: '', celular: '', correo: '', equipo_id: '' });
              setNuevaCatNombre(''); setNuevaCatCoordinacion(''); setListaAtributosTemporales([]);
              setNuevaCoordinacionNombre('');
              setNuevoProducto({ categoria_id: '', marca: '', num_proveedor: '', codigo: '', codigo_interno: '', descripcion: '', precio: 0, moneda: 'MXN', tiempo_entrega: '', recomendaciones: '', valores_atributos: {} });
              setFormContacto({ nombre: '', puesto: '', telefono: '', correo: '' });
              setFormMeta({ categoria: '', marca: '', objetivo: '', actual: 0 });
              setFormOperacion({
                Pedido: '', No_Cotizacion: '', num_cliente: '', Cliente: '', equipo_id: '',
                Categoría: 'Cotización', Estatus: 'Nueva', Progreso: 'No iniciado', Prioridad: 'Media',
                Monto: 0, Margen: 0, Entrega: '', dias_abierta: 0, codigos_facturar: '', cantidad_pz: 0,
                fecha_llegada: '', notas: '', ref_cliente: '', ref_proveedor: '', no_sp_ptt: '', guia: '',
                contacto_cliente: '', vendedor: '', coordinacion: '', grupo_materiales: '', porcentaje_cierre: 0,
                certificacion: 'No', importacion: 'No', pendiente_armado: 'No', fecha_creacion: new Date().toISOString()
              });
              setEditClienteId(null); setEditProveedorId(null); setEditEquipoId(null); setEditVendedorId(null); setEditCategoryId(null); setEditCoordinacionId(null); setEditProductoId(null); setEditContactoId(null); setEditMetaId(null); setEditOperacionId(null);
              setCodigosList([]);
              setShowNuevoContactoOperacion(false);
              setActiveModal(null);
            }} className="px-4 py-2 rounded-lg font-semibold text-slate-600 hover:bg-slate-100 text-xs transition-colors cursor-pointer">Cancelar</button>
            <button type="submit" form="modal-form" className="px-5 py-2 rounded-lg font-semibold bg-[#07417B] text-white shadow-xs text-xs hover:opacity-90 transition-opacity cursor-pointer">Guardar Registro</button>
          </div>
        </div>
      </div>
    );
  };

  // --- SUBCOMPONENTE MODAL DE CONFIRMACIÓN PERSONALIZADO ---
  const renderCustomConfirmModal = () => {
    if (!confirmDialog.isOpen) return null;
    return (
      <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-[100] flex items-center justify-center animate-in fade-in">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col p-6 space-y-4 animate-in zoom-in-95 duration-200">
          <div className="flex items-center gap-3 text-rose-600">
            <AlertTriangle size={24} />
            <h3 className="font-bold text-lg text-slate-800">Confirmar Acción</h3>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed">{confirmDialog.message}</p>
          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => setConfirmDialog({ isOpen: false, message: '', onConfirm: null })}
              className="px-4 py-2 rounded-lg font-semibold text-slate-600 hover:bg-slate-100 text-xs transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              onClick={() => {
                if (confirmDialog.onConfirm) confirmDialog.onConfirm();
                setConfirmDialog({ isOpen: false, message: '', onConfirm: null });
              }}
              className="px-5 py-2 rounded-lg font-semibold bg-rose-600 hover:bg-rose-700 text-white text-xs shadow-xs transition-colors cursor-pointer"
            >
              Confirmar
            </button>
          </div>
        </div>
      </div>
    );
  };

  // --- SUBCOMPONENTE FICHA RÁPIDA (RELATIONAL MODAL) ---
  const renderRelationalModal = () => {
    if (!modalEntity) return null;
    const isClient = modalEntity.type === 'cliente';
    const entity = isClient
      ? clientes.find(c => c.numero === modalEntity.id)
      : proveedores.find(p => p.numero === modalEntity.id);

    if (!entity) return null;

    return (
      <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-[80] flex items-center justify-center animate-in fade-in" onClick={() => setModalEntity(null)}>
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
          <div className="bg-[#07417B] p-4 flex justify-between items-center text-white">
            <h3 className="font-bold text-base flex items-center gap-2">
              <Info size={18} /> Ficha Rápida de {isClient ? 'Cliente' : 'Proveedor'}
            </h3>
            <button onClick={() => setModalEntity(null)} className="text-blue-100 hover:text-white cursor-pointer"><X size={20} /></button>
          </div>
          <div className="p-6 space-y-4 bg-slate-50">
            <div>
              <h4 className="font-bold text-slate-800 text-lg"><CopyableText text={entity.empresa} /></h4>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">Código: <CopyableText text={entity.numero} /></p>
            </div>
            <div className="space-y-2 text-xs text-slate-600 border-t border-b border-slate-200 py-3">
              <p className="font-bold text-slate-700"><CopyableText text={entity.nombre} /> <span className="text-[10px] text-slate-400 font-normal">({entity.puesto})</span></p>
              <p className="flex items-center gap-1.5"><Smartphone size={14} className="opacity-50" /> <CopyableText text={entity.telefono} /></p>
              <p className="flex items-center gap-1.5 text-[#07417B]"><Mail size={14} className="opacity-50" /> <CopyableText text={entity.correo} /></p>
              {!isClient && entity.descuento && <p className="font-bold text-slate-700">Descuento Pactado: <span className="text-teal-700">{entity.descuento}</span></p>}
            </div>
            {entity.nota && (
              <div className="bg-white border border-slate-200 p-3 rounded-lg text-xs italic text-slate-500">
                "{entity.nota}"
              </div>
            )}
            <div className="flex justify-end gap-3 pt-2">
              <button onClick={() => setModalEntity(null)} className="px-4 py-2 rounded-lg font-semibold text-slate-600 hover:bg-slate-100 text-xs transition-colors cursor-pointer">Cerrar</button>
              <button
                onClick={verPerfilCompleto}
                className="px-4 py-2 rounded-lg font-semibold bg-[#07417B] text-white hover:opacity-90 text-xs shadow-xs transition-all cursor-pointer flex items-center gap-1"
              >
                <ExternalLink size={12} /> Ver Expediente Completo
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // --- SUBCOMPONENTE DIRECTORIO DE CONTACTOS ---
  const renderDirectorioModal = () => {
    if (!showDirectorio || !activeProfile) return null;
    const isClient = activeProfile.type === 'cliente';
    const entity = isClient
      ? clientes.find(c => c.numero === activeProfile.id)
      : proveedores.find(p => p.numero === activeProfile.id);

    if (!entity) return null;

    const asociados = contactosAdicionales.filter(c => c.entity_id === entity.numero);

    return (
      <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-[80] flex items-center justify-center animate-in fade-in" onClick={() => setShowDirectorio(false)}>
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
          <div className="bg-[#07417B] p-4 flex justify-between items-center text-white shrink-0">
            <h3 className="font-bold text-base flex items-center gap-2">
              <Contact size={18} /> Directorio de Contactos - <CopyableText text={entity.empresa} />
            </h3>
            <button onClick={() => setShowDirectorio(false)} className="text-blue-100 hover:text-white cursor-pointer"><X size={20} /></button>
          </div>
          <div className="p-6 overflow-y-auto bg-slate-50 flex-1 space-y-6">
            {/* Contacto Principal */}
            <div>
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-2">Contacto Principal</h4>
              <div className="bg-white border border-slate-200 rounded-xl p-4 flex justify-between items-center shadow-xs">
                <div>
                  <p className="font-bold text-slate-800 text-sm"><CopyableText text={entity.nombre} /></p>
                  <p className="text-[10px] text-slate-400 font-semibold">{entity.puesto}</p>
                  <div className="flex gap-4 mt-2 text-xs text-slate-600">
                    <span className="flex items-center gap-1"><Smartphone size={12} className="opacity-50" /> <CopyableText text={entity.telefono} /></span>
                    <span className="flex items-center gap-1 text-[#07417B]"><Mail size={12} className="opacity-50" /> <CopyableText text={entity.correo} /></span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      if (isClient) editarCliente(entity);
                      else editarProveedor(entity);
                    }}
                    className="text-[#07417B] hover:text-[#0b539c] p-1.5 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                    title="Editar Contacto Principal"
                  >
                    <Edit2 size={14} />
                  </button>
                  <span className="text-[10px] font-bold text-slate-500 bg-slate-100 border border-slate-200 px-2.5 py-0.5 rounded-full">Principal</span>
                </div>
              </div>
            </div>

            {/* Contactos Adicionales */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Contactos Adicionales ({asociados.length})</h4>
                <button
                  onClick={() => {
                    setFormContacto({ nombre: '', puesto: '', telefono: '', correo: '' });
                    setEditContactoId(null);
                    setActiveModal('contacto');
                  }}
                  className="bg-[#07417B] text-white px-3 py-1.5 rounded-lg text-[10px] font-bold hover:opacity-90 transition-all flex items-center gap-1 cursor-pointer"
                >
                  <Plus size={11} /> Nuevo Contacto
                </button>
              </div>
              <div className="space-y-3">
                {asociados.map(contact => (
                  <div key={contact.id} className="bg-white border border-slate-200 rounded-xl p-4 flex justify-between items-center shadow-xs">
                    <div>
                      <p className="font-bold text-slate-800 text-sm"><CopyableText text={contact.nombre} /></p>
                      <p className="text-[10px] text-slate-400 font-semibold">{contact.puesto}</p>
                      <div className="flex gap-4 mt-2 text-xs text-slate-600 font-medium">
                        <span className="flex items-center gap-1"><Smartphone size={12} className="opacity-50" /> <CopyableText text={contact.telefono} /></span>
                        <span className="flex items-center gap-1 text-[#07417B]"><Mail size={12} className="opacity-50" /> <CopyableText text={contact.correo} /></span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => { editarContacto(contact); }}
                        className="text-[#07417B] hover:text-[#0b539c] p-1.5 hover:bg-slate-100 rounded transition-colors cursor-pointer"
                        title="Editar"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => eliminarContacto(contact.id)}
                        className="text-rose-600 hover:text-rose-800 p-1.5 hover:bg-slate-100 rounded transition-colors cursor-pointer"
                        title="Eliminar"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
                {asociados.length === 0 && (
                  <div className="text-center py-6 text-slate-400 text-xs bg-white border border-dashed border-slate-200 rounded-xl">
                    No hay contactos adicionales para este {isClient ? 'cliente' : 'proveedor'}.
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="bg-white border-t border-slate-200 p-4 flex justify-end shrink-0">
            <button onClick={() => setShowDirectorio(false)} className="px-4 py-2 rounded-lg font-semibold text-slate-600 hover:bg-slate-100 text-xs transition-colors cursor-pointer">Cerrar</button>
          </div>
        </div>
      </div>
    );
  };

  // --- SUBCOMPONENTE DE SUGERENCIA DE CORREO (IA SUGERENCIA MODAL) ---
  const renderSugerenciaModal = () => {
    if (!sugerenciaIADetalle) return null;
    return (
      <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-[80] flex items-center justify-center animate-in fade-in" onClick={() => setSugerenciaIADetalle(null)}>
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
          <div className="bg-[#07417B] p-4 flex justify-between items-center text-white">
            <h3 className="font-bold text-base flex items-center gap-2">
              <Zap size={18} className="text-amber-400 animate-pulse" /> Correo de Seguimiento Sugerido (IA Local)
            </h3>
            <button onClick={() => setSugerenciaIADetalle(null)} className="text-blue-100 hover:text-white cursor-pointer"><X size={20} /></button>
          </div>
          <div className="p-6 space-y-4 bg-slate-50">
            <div className="bg-white border border-slate-200 rounded-lg p-4 font-mono text-xs text-slate-700 whitespace-pre-wrap leading-relaxed max-h-[50vh] overflow-y-auto">
              {sugerenciaIADetalle}
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button onClick={() => setSugerenciaIADetalle(null)} className="px-4 py-2 rounded-lg font-semibold text-slate-600 hover:bg-slate-100 text-xs transition-colors cursor-pointer">Cerrar</button>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(sugerenciaIADetalle);
                  showNotification("Correo copiado al portapapeles con éxito.");
                  setSugerenciaIADetalle(null);
                }}
                className="px-5 py-2 rounded-lg font-semibold bg-[#07417B] text-white hover:opacity-90 text-xs shadow-xs transition-opacity cursor-pointer flex items-center gap-1.5"
              >
                <Copy size={14} /> Copiar Correo
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const closedStatuses = ['Terminado', 'Cerrado', 'Cancelado', 'Completado'];
  
  const getDestination = (item) => {
    for (const rule of boardRules) {
      if (item[rule.column] === rule.value) return rule.destination;
    }
    const isClosed = closedStatuses.includes(item.Estatus) || closedStatuses.includes(item.Categoría) || closedStatuses.includes(item.Progreso);
    if (isClosed) return 'archive';
    if (item.Categoría !== 'Cotización') return 'processing';
    return 'quotes';
  };

  const allItemsMap = new Map();
  [...cotizaciones, ...procesamiento].forEach(item => {
    allItemsMap.set(item.id, item);
  });
  const allItems = Array.from(allItemsMap.values());

  const activeCotizaciones = allItems.filter(item => getDestination(item) === 'quotes');
  const activeProcesamiento = allItems.filter(item => getDestination(item) === 'processing');
  const closedItems = allItems.filter(item => getDestination(item) === 'archive');

  return (
    <div className="flex h-screen bg-[#f1f5f9] overflow-hidden">
      {/* Modales globales */}
      {renderCustomConfirmModal()}
      {renderRelationalModal()}
      {renderDirectorioModal()}
      {renderSugerenciaModal()}
      {renderModalFormulario()}
      {showConfigModal && renderModalConfigIA()}
      {showPerfilModal && (
        <UserProfileModal
          userProfile={userProfile}
          onSave={(updated) => {
            setUserProfile(updated);
            setShowPerfilModal(false);
          }}
          onClose={() => setShowPerfilModal(false)}
          onNotification={showNotification}
        />
      )}
      {showRuleManager && (
        <RuleManagerModal
          rules={boardRules}
          columnas={colCotis}
          onSave={(newRules) => {
            setBoardRules(newRules);
            setShowRuleManager(false);
            showNotification("Reglas de flujo actualizadas y aplicadas.", "success");
          }}
          onClose={() => setShowRuleManager(false)}
        />
      )}
      {activeModalPDF && (
        <PdfGeneratorModal
          data={activeModalPDF}
          masterClientes={clientes}
          masterVendedores={vendedores}
          userProfile={userProfile}
          onClose={() => setActiveModalPDF(null)}
          onNotification={showNotification}
        />
      )}
      {editorOpcionesModal && (
        <OptionsEditorModal
          columnaKey={editorOpcionesModal.colKey}
          columnaLabel={editorOpcionesModal.colLabel}
          defaultOpciones={editorOpcionesModal.defaultOpciones}
          configOpciones={configOpciones}
          onSave={handleSaveOptions}
          onClose={() => setEditorOpcionesModal(null)}
        />
      )}

      {/* Notificación Toast flotante */}
      {notification && (
        <div className={`fixed bottom-5 right-5 z-[100] p-4 rounded-xl shadow-lg border flex items-center gap-3 animate-in slide-in-from-bottom duration-300 ${notification.type === 'error'
          ? 'bg-rose-50 border-rose-200 text-rose-800'
          : notification.type === 'info'
            ? 'bg-blue-50 border-blue-200 text-blue-800'
            : 'bg-emerald-50 border-emerald-200 text-emerald-800'
          }`}>
          {notification.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
          <span className="text-xs font-semibold">{notification.message}</span>
          <button onClick={() => setNotification(null)} className="text-slate-400 hover:text-slate-600 ml-2"><X size={14} /></button>
        </div>
      )}

      {/* About Modal */}
      {activeModal === 'about' && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-[100] flex items-center justify-center animate-in fade-in" onClick={() => setActiveModal(null)}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden flex flex-col p-6 space-y-4 animate-in zoom-in-95 duration-200 text-center" onClick={e => e.stopPropagation()}>
            <img src={logoFornax} alt="Fornax" className="w-20 h-20 rounded-full object-cover mx-auto bg-slate-100 p-1" />
            <h3 className="font-bold text-lg text-[#07417B]">Acerca de la Aplicación</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Esta app fue desarrollada por <strong>David Salazar</strong>. Si quieres agregar más funcionalidades o quieres tener una app a tu medida contáctame en mi <a href="https://davidsz.com.mx/" target="_blank" rel="noopener noreferrer" className="text-[#07417B] font-bold hover:underline">página web</a>.
            </p>
            <div className="pt-4">
              <button onClick={() => setActiveModal(null)} className="px-5 py-2 rounded-lg font-semibold bg-[#07417B] text-white hover:opacity-90 transition-opacity cursor-pointer text-xs w-full">Cerrar</button>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <aside className={`bg-slate-900 text-slate-300 flex flex-col shrink-0 transition-all duration-300 ${isSidebarOpen ? 'w-64' : 'w-20'}`}>
        <div className={`p-5 border-b border-slate-800 flex items-center ${isSidebarOpen ? 'justify-between' : 'justify-center flex-col'} gap-3`}>
          <div className="flex items-center gap-3">
            <img 
              src={logoFornax} 
              alt="Fornax" 
              className="w-8 h-8 rounded-full object-cover bg-white p-0.5 cursor-pointer shrink-0" 
              onClick={() => setActiveModal('about')} 
            />
            {isSidebarOpen && <h1 className="text-base font-bold text-white tracking-wide leading-none">Fornax</h1>}
          </div>
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="text-slate-400 hover:text-white cursor-pointer p-1 shrink-0">
            <Menu size={18} />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
            { id: 'sales_intelligence', label: 'Inteligencia Ventas', icon: BrainCircuit },
            { id: 'rag_search', label: 'Buscador IA', icon: Search },
            { id: 'quotes', label: 'Cotizaciones', icon: FileText },
            { id: 'processing', label: 'Procesamiento logístico', icon: ShoppingCart },
            { id: 'archive', label: 'Archivo (Cerrados)', icon: CheckCircle2 },
            { id: 'catalog', label: 'Catálogo Técnico', icon: Tag },
            { id: 'clients', label: 'Clientes', icon: Users },
            { id: 'providers', label: 'Proveedores', icon: Truck },
            { id: 'teams', label: 'Equipos de Ventas', icon: Briefcase },
            { id: 'utilities', label: 'Utilidades', icon: Calculator }
          ].map(item => {
            const Icon = item.icon;
            const active = activeTab === item.id ||
              (activeTab === 'perfil_completo' && (
                (item.id === 'clients' && activeProfile?.type === 'cliente') ||
                (item.id === 'providers' && activeProfile?.type === 'proveedor')
              ));
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer ${active ? 'bg-[#07417B] text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'} ${!isSidebarOpen && 'justify-center'}`}
                title={!isSidebarOpen ? item.label : ''}
              >
                <Icon size={16} className={`shrink-0 ${active ? 'text-white' : 'text-slate-400'}`} />
                {isSidebarOpen && <span className="truncate">{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* Estatus del Motor */}
        <div className={`p-4 border-t border-slate-800 text-[10px] text-slate-400 bg-slate-950/40 relative flex ${isSidebarOpen ? 'flex-col space-y-1.5' : 'flex-col items-center space-y-3'}`}>
          <div className={`flex ${isSidebarOpen ? 'justify-between' : 'justify-center'} items-center ${isSidebarOpen ? 'mb-1' : ''}`}>
            {isSidebarOpen && <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Motores del Sistema</span>}
            <button
              onClick={() => setShowConfigModal(true)}
              className="text-slate-500 hover:text-white transition-colors cursor-pointer p-0.5"
              title="Configuración de la IA Local"
            >
              <Settings size={13} />
            </button>
          </div>
          <div className={`flex items-center ${isSidebarOpen ? 'gap-2' : 'justify-center'}`} title={!isSidebarOpen ? `LanceDB Engine: ${engineStatus.lancedb === 'active' ? 'Conectado' : 'Sin Conexión'}` : ""}>
            <span className={`shrink-0 w-2 h-2 rounded-full ${engineStatus.lancedb === 'active' ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`}></span>
            {isSidebarOpen && <span className="font-medium truncate">LanceDB Engine: {engineStatus.lancedb === 'active' ? 'Conectado' : 'Sin Conexión'}</span>}
          </div>
          <div className={`flex items-center ${isSidebarOpen ? 'gap-2' : 'justify-center'}`} title={!isSidebarOpen ? `Local LLM (Ollama): ${engineStatus.ollama === 'active' ? 'Activo' : 'Offline'}` : ""}>
            <span className={`shrink-0 w-2 h-2 rounded-full ${engineStatus.ollama === 'active' ? 'bg-purple-500 animate-pulse' : 'bg-amber-500'}`}></span>
            {isSidebarOpen && <span className="font-medium truncate">Local LLM (Ollama): {engineStatus.ollama === 'active' ? 'Activo' : 'Offline'}</span>}
          </div>
          {isSidebarOpen && engineStatus.ollama === 'active' && (
            <div className="pl-4 text-slate-500 truncate">Modelo: <span className="text-purple-400 font-mono">{engineStatus.active_model}</span></div>
          )}
        </div>
      </aside>

      {/* Main Panel */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="h-16 bg-white border-b border-slate-200 flex justify-between items-center px-6 shrink-0 shadow-xs">
          {['quotes', 'processing', 'archive', 'catalog', 'clients', 'providers', 'teams'].includes(activeTab) ? (
            <div className="flex items-center bg-slate-100 border border-slate-200 rounded-lg px-3 py-1.5 w-96 relative">
              <Search size={16} className="text-slate-400 mr-2 shrink-0" />
              <input
                type="text"
                placeholder="Buscar folio, cliente, referencia..."
                className="bg-transparent border-none outline-none text-xs text-slate-700 w-full placeholder-slate-400 pr-6"
                value={globalSearch}
                onChange={e => setGlobalSearch(e.target.value)}
              />
              {globalSearch && (
                <button 
                  onClick={() => setGlobalSearch('')}
                  className="absolute right-3 text-slate-400 hover:text-slate-600 cursor-pointer transition-colors"
                  title="Limpiar búsqueda"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          ) : (
            <div></div>
          )}
          <div className="flex items-center gap-3">
            {/* User Profile Button */}
            <button
              onClick={() => setShowPerfilModal(true)}
              className="w-9 h-9 rounded-full bg-[#07417B] hover:opacity-90 text-white flex items-center justify-center font-bold text-xs shadow-sm transition-all cursor-pointer border border-[#07417B]/20"
              title="Perfil de Usuario"
            >
              {(() => {
                if (!userProfile?.nombre) return <User size={16} />;
                const parts = userProfile.nombre.trim().split(" ");
                if (parts.length >= 2 && parts[0] && parts[1]) {
                  return (parts[0][0] + parts[1][0]).toUpperCase();
                }
                return userProfile.nombre.substring(0, 2).toUpperCase();
              })()}
            </button>
          </div>
        </header>

        {/* View Content Area */}
        <main className="flex-1 overflow-y-auto bg-slate-100/50">

          {/* TAB 1: EXECUTIVE DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div className="p-6 space-y-6 animate-in fade-in duration-300">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-slate-800 font-sans">Dashboard Ejecutivo</h2>
                <span className="text-xs text-slate-500 flex items-center gap-1"><Clock size={13} /> Actualizado en tiempo real</span>
              </div>

              {/* KPIs Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: "Ventas Totales (Procesadas)", value: formatCurrency(kpis.ventas), icon: TrendingUp, color: "text-emerald-600 bg-emerald-50 border-emerald-100" },
                  { label: "Tasa de Conversión", value: `${kpis.conversion}%`, icon: Target, color: "text-[#07417B] bg-blue-50 border-blue-100" },
                  { label: "Cotizaciones Activas", value: kpis.cotizaciones, icon: FileText, color: "text-amber-600 bg-amber-50 border-amber-100" },
                  { label: "Margen Promedio Comercial", value: `${kpis.margen}%`, icon: BarChart3, color: "text-purple-600 bg-purple-50 border-purple-100" }
                ].map((kpi, idx) => {
                  const Icon = kpi.icon;
                  return (
                    <div key={idx} className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex justify-between items-center hover-scale">
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{kpi.label}</p>
                        <p className="text-2xl font-bold text-slate-800 mt-1">{kpi.value}</p>
                      </div>
                      <div className={`p-3 rounded-lg border ${kpi.color}`}><Icon size={20} /></div>
                    </div>
                  );
                })}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Stuck quotes action list */}
                <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col h-96">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2"><AlertTriangle size={16} className="text-amber-500" /> Siguiente Acción Recomendada por Nova</h3>
                    <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full uppercase">Estancadas</span>
                  </div>
                  <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                    {cotizaciones.filter(c => c.Estatus === 'Enviada' || c.Estatus === 'En revisión').map(q => (
                      <div key={q.id} className="border border-slate-100 bg-slate-50/50 hover:bg-slate-50 rounded-lg p-4 flex justify-between items-center transition-colors">
                        <div>
                          <p className="font-bold text-xs text-slate-800">{q.Pedido}</p>
                          <p className="text-[10px] text-slate-500 mt-0.5">{q.Cliente} • {q.No_Cotizacion} • {formatCurrency(q.Monto)}</p>
                          <span className="inline-block mt-2 text-[10px] font-bold text-rose-600 bg-rose-50 border border-rose-100 px-2 py-0.5 rounded-md">
                            {(() => {
                              const baseDate = q.fecha_creacion ? new Date(q.fecha_creacion) : (q.id > 1000000000000 ? new Date(q.id) : new Date(q.Entrega || new Date()));
                              const days = Math.floor((new Date() - baseDate) / 86400000);
                              return `Estancada ${days} días`;
                            })()}
                          </span>
                        </div>
                        <button
                          onClick={() => sugerirCierreIA(q)}
                          className="flex items-center gap-1.5 bg-[#07417B] text-white text-[10px] font-semibold px-3 py-2 rounded-lg hover:opacity-90 shadow-xs cursor-pointer"
                          disabled={cargandoIA}
                        >
                          {cargandoIA ? <Zap size={12} className="animate-spin mr-1" /> : <Zap size={12} className="mr-1" />}
                          Sugerir Cierre con Nova
                        </button>
                      </div>
                    ))}
                    {cotizaciones.filter(c => c.Estatus === 'Enviada' || c.Estatus === 'En revisión').length === 0 && (
                      <div className="text-center py-12 text-slate-400 text-xs">No hay cotizaciones activas estancadas en este momento.</div>
                    )}
                  </div>
                </div>

                {/* Goals Category / Brand progress */}
                <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col h-96">
                  <div className="flex justify-between items-center mb-5 shrink-0">
                    <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
                      <Target size={16} className="text-[#07417B]" /> Metas por Categoría / Marca
                    </h3>
                    <div className="flex items-center gap-2">
                      {/* Selector de período */}
                      <div className="flex bg-slate-100 border border-slate-200 p-0.5 rounded-lg text-[10px] select-none shadow-3xs">
                        <button
                          type="button"
                          onClick={() => setFiltroPeriodoMetas('year')}
                          className={`px-2 py-0.5 rounded cursor-pointer font-bold transition-all ${filtroPeriodoMetas === 'year' ? 'bg-white text-[#07417B] shadow-2xs' : 'text-slate-500 hover:text-slate-800'}`}
                        >
                          Año
                        </button>
                        <button
                          type="button"
                          onClick={() => setFiltroPeriodoMetas('month')}
                          className={`px-2 py-0.5 rounded cursor-pointer font-bold transition-all ${filtroPeriodoMetas === 'month' ? 'bg-white text-[#07417B] shadow-2xs' : 'text-slate-500 hover:text-slate-800'}`}
                        >
                          Mes
                        </button>
                      </div>
                      <button
                        onClick={() => {
                          setFormMeta({ categoria: '', marca: '', objetivo: '', actual: 0 });
                          setEditMetaId(null);
                          setActiveModal('meta');
                        }}
                        className="p-1 rounded-md bg-[#07417B]/10 text-[#07417B] hover:bg-[#07417B]/20 cursor-pointer shadow-xs transition-colors"
                        title="Nueva Meta"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>
                  <div className="flex-1 overflow-y-auto space-y-5 pr-1">
                    {metas.map(meta => {
                      const currentDate = new Date();
                      const currentYear = currentDate.getFullYear();
                      const currentMonthStr = String(currentDate.getMonth() + 1).padStart(2, '0');
                      const matchedOps = procesamiento.filter(op => {
                        if (op.Categoría !== 'Terminado') return false;
                        if (!op.Entrega) return false;
                        const opYear = op.Entrega.substring(0, 4);
                        const opMonth = op.Entrega.substring(5, 7);
                        if (filtroPeriodoMetas === 'month') {
                          return opYear === String(currentYear) && opMonth === currentMonthStr;
                        } else {
                          return opYear === String(currentYear);
                        }
                      });
                      const getOperationBrand = (op) => {
                        let codes = [];
                        if (op.codigos_facturar) {
                          try {
                            const parsed = JSON.parse(op.codigos_facturar);
                            if (Array.isArray(parsed)) codes = parsed.map(c => c.codigo || c.code);
                            else if (typeof parsed === 'object') codes = [parsed.codigo || parsed.code];
                            else codes = [op.codigos_facturar];
                          } catch { codes = [op.codigos_facturar]; }
                        }
                        const brands = codes.map(code => { const prod = catalogoProd.find(p => p.codigo === code); return prod ? prod.marca : null; }).filter(Boolean);
                        return brands.length > 0 ? brands[0] : '';
                      };
                      const actualCalculated = matchedOps
                        .filter(op => {
                          if (meta.categoria) return op.grupo_materiales && op.grupo_materiales.toLowerCase() === meta.categoria.toLowerCase();
                          if (meta.marca) { const opBrand = getOperationBrand(op); return opBrand && opBrand.toLowerCase() === meta.marca.toLowerCase(); }
                          return false;
                        })
                        .reduce((sum, op) => sum + (Number(op.Monto) || 0), 0);
                      const pct = Math.min(Math.round((actualCalculated / meta.objetivo) * 100), 100);
                      const label = meta.categoria ? `Familia: ${meta.categoria}` : `Marca: ${meta.marca}`;
                      return (
                        <div key={meta.id} className="space-y-1.5 group relative">
                          <div className="flex justify-between text-xs font-semibold text-slate-700 pr-14">
                            <span>{label}</span>
                            <span>{pct}% ({formatCurrency(actualCalculated)} / {formatCurrency(meta.objetivo)})</span>
                          </div>
                          <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: `${pct}%` }}></div>
                          </div>
                          <div className="absolute right-0 top-0 hidden group-hover:flex items-center gap-2 bg-white pl-2">
                            <button onClick={() => { setFormMeta({ categoria: meta.categoria || '', marca: meta.marca || '', objetivo: meta.objetivo, actual: actualCalculated }); setEditMetaId(meta.id); setActiveModal('meta'); }} className="text-[#07417B] hover:underline cursor-pointer" title="Editar Meta"><Edit2 size={12} /></button>
                            <button onClick={() => eliminarMeta(meta.id)} className="text-rose-600 hover:text-rose-800 cursor-pointer" title="Eliminar Meta"><Trash2 size={12} /></button>
                          </div>
                        </div>
                      );
                    })}
                    {metas.length === 0 && (
                      <div className="text-center py-12 text-slate-400 text-xs">No hay metas comerciales definidas.</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Segunda fila: Próximas Entregas + OCs en Proceso + Cotizaciones por Prioridad */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                {/* Próximas Entregas */}
                <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col h-80">
                  <div className="flex justify-between items-center mb-4 shrink-0">
                    <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2"><Package size={16} className="text-emerald-600" /> Próximas Entregas</h3>
                    <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full uppercase">Próx. 30 días</span>
                  </div>
                  <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                    {(() => {
                      const hoy = new Date();
                      const en30 = new Date(hoy); en30.setDate(hoy.getDate() + 30);
                      const proximas = [...cotizaciones, ...procesamiento]
                        .filter(r => r.Entrega && new Date(r.Entrega) >= hoy && new Date(r.Entrega) <= en30)
                        .sort((a, b) => new Date(a.Entrega) - new Date(b.Entrega));
                      if (proximas.length === 0) return <div className="text-center py-10 text-slate-400 text-xs">No hay entregas programadas en los próximos 30 días.</div>;
                      return proximas.map(r => {
                        const diasRestantes = Math.ceil((new Date(r.Entrega) - hoy) / 86400000);
                        const urgente = diasRestantes <= 7;
                        return (
                          <div key={r.id + r.Pedido} className={`flex justify-between items-center p-3 rounded-lg border text-xs ${urgente ? 'bg-rose-50 border-rose-100' : 'bg-slate-50 border-slate-100'}`}>
                            <div className="flex-1 min-w-0 mr-3">
                              <p className="font-bold text-slate-800 truncate">{r.Pedido}</p>
                              <p className="text-slate-500 mt-0.5">{r.Cliente} • {r.No_Cotizacion}</p>
                            </div>
                            <div className="text-right shrink-0">
                              <span className={`font-bold block ${urgente ? 'text-rose-600' : 'text-emerald-600'}`}>{diasRestantes}d</span>
                              <span className="text-slate-400 text-[10px]">{r.Entrega}</span>
                            </div>
                          </div>
                        );
                      });
                    })()}
                  </div>
                </div>

                {/* OCs Activas en Proceso */}
                <div className="lg:col-span-4 bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col h-80">
                  <div className="flex justify-between items-center mb-4 shrink-0">
                    <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2"><ShoppingCart size={16} className="text-[#07417B]" /> OCs Activas en Proceso</h3>
                    <span className="text-[10px] font-bold text-[#07417B] bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-full">{procesamiento.filter(p => p.Categoría !== 'Terminado' && p.Categoría !== 'Cancelado').length} activas</span>
                  </div>
                  <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                    {(() => {
                      const prioOrd = { 'Crítica': 4, 'Alta': 3, 'Media': 2, 'Baja': 1 };
                      const activas = procesamiento
                        .filter(p => p.Categoría !== 'Terminado' && p.Categoría !== 'Cancelado')
                        .sort((a, b) => (prioOrd[b.Prioridad] || 0) - (prioOrd[a.Prioridad] || 0));
                      const progColors = { 'No iniciado': 'bg-slate-100 text-slate-600', 'En curso': 'bg-amber-100 text-amber-700', 'Retraso de proveedor': 'bg-rose-100 text-rose-700', 'En Certificación': 'bg-indigo-100 text-indigo-700', 'Completado': 'bg-emerald-100 text-emerald-700' };
                      if (activas.length === 0) return <div className="text-center py-10 text-slate-400 text-xs">No hay OCs activas en este momento.</div>;
                      return activas.map(p => (
                        <div key={p.id} className="flex justify-between items-center p-3 rounded-lg border border-slate-100 bg-slate-50/60 text-xs gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-slate-800 truncate">{p.Pedido}</p>
                            <p className="text-slate-500 mt-0.5 truncate">{p.Cliente} • {formatCurrency(p.Monto)}</p>
                          </div>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${progColors[p.Progreso] || 'bg-slate-100 text-slate-600'}`}>{p.Progreso || 'Sin estado'}</span>
                        </div>
                      ));
                    })()}
                  </div>
                </div>

                {/* Cotizaciones por Prioridad */}
                <div className="lg:col-span-3 bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col h-80">
                  <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2 mb-4 shrink-0"><BarChart3 size={16} className="text-purple-600" /> Cotizaciones por Prioridad</h3>
                  <div className="flex-1 flex flex-col justify-center space-y-3">
                    {['Crítica', 'Alta', 'Media', 'Baja'].map(p => {
                      const count = cotizaciones.filter(c => c.Prioridad === p && c.Categoría === 'Cotización').length;
                      const total = cotizaciones.filter(c => c.Categoría === 'Cotización').length || 1;
                      const pct = Math.round((count / total) * 100);
                      const barColors = { 'Crítica': 'bg-rose-500', 'Alta': 'bg-orange-400', 'Media': 'bg-blue-400', 'Baja': 'bg-slate-300' };
                      const textColors = { 'Crítica': 'text-rose-600', 'Alta': 'text-orange-600', 'Media': 'text-blue-600', 'Baja': 'text-slate-500' };
                      return (
                        <div key={p} className="space-y-1">
                          <div className="flex justify-between text-[11px] font-semibold">
                            <span className={textColors[p]}>{p}</span>
                            <span className="text-slate-600">{count} ({pct}%)</span>
                          </div>
                          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div className={`h-full ${barColors[p]} rounded-full transition-all duration-500`} style={{ width: `${pct}%` }}></div>
                          </div>
                        </div>
                      );
                    })}
                    <div className="pt-2 border-t border-slate-100 text-center">
                      <span className="text-[10px] text-slate-400">Total: <b className="text-slate-700">{cotizaciones.filter(c => c.Categoría === 'Cotización').length}</b> cotizaciones</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}




          {activeTab === 'sales_intelligence' && (
            <div className="p-6 space-y-6 animate-in fade-in duration-300">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2"><Cat className="text-[#07417B]" /> Módulo de Asistencia Inteligente de Ventas (Nova)</h2>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Pareto 80/20 Clientes */}
                <div className="lg:col-span-4 bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col h-[28rem]">
                  <div className="mb-4">
                    <h3 className="font-bold text-sm text-slate-800">Enfoque Pareto (80/20)</h3>
                    <p className="text-[10px] text-slate-500 mt-0.5">Ventas acumuladas por cliente en logística</p>
                  </div>
                  <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                    {paretoClientes.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg border border-slate-100 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-[#07417B]">{idx + 1}.</span>
                          <span className="font-semibold text-slate-700"><CopyableText text={item.cliente} /></span>
                        </div>
                        <span className="font-bold text-slate-800">{formatCurrency(item.total)}</span>
                      </div>
                    ))}
                    {paretoClientes.length === 0 && <div className="text-center py-12 text-slate-400 text-xs">Sin registros logísticos para analizar.</div>}
                  </div>
                </div>

                {/* Riesgo de abandono */}
                <div className="lg:col-span-4 bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col h-[28rem]">
                  <div className="mb-4">
                    <h3 className="font-bold text-sm text-slate-800">Riesgo de Abandono (Pareto)</h3>
                    <p className="text-[10px] text-slate-500 mt-0.5">Clientes clave sin compras en los últimos 30 días</p>
                  </div>
                  <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                    {clientes.filter(c => c.dias_sin_compra > 30).map(c => (
                      <div key={c.id} className="border border-rose-200 bg-rose-50/40 rounded-lg p-4 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1.5 h-full bg-rose-600"></div>
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-bold text-xs text-slate-800"><CopyableText text={c.empresa} /></p>
                            <p className="text-[10px] text-slate-500 mt-0.5"><CopyableText text={c.nombre} /> • Tel: <CopyableText text={c.telefono} /></p>
                          </div>
                          <span className="text-[10px] font-bold text-rose-700 bg-rose-100 border border-rose-200 px-2.5 py-0.5 rounded-full">{c.dias_sin_compra} días inactivo</span>
                        </div>
                      </div>
                    ))}
                    {clientes.filter(c => c.dias_sin_compra > 30).length === 0 && (
                      <div className="text-center py-12 text-slate-400 text-xs">Todos los clientes clave presentan actividad reciente.</div>
                    )}
                  </div>
                </div>

                {/* Cross-selling sugerido */}
                <div className="lg:col-span-4 bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col h-[28rem]">
                  <div className="mb-4">
                    <h3 className="font-bold text-sm text-slate-800">Cross-Selling Sugerido</h3>
                    <p className="text-[10px] text-slate-500 mt-0.5">Asociaciones detectadas por historial de compra</p>
                  </div>
                  <div className="mb-3 flex items-center gap-2">
                    <span className="text-[10px] text-slate-600 font-bold uppercase tracking-wider">Cliente:</span>
                    <select
                      value={crossSellingClient}
                      onChange={e => setCrossSellingClient(e.target.value)}
                      className="flex-1 text-xs border border-slate-300 rounded-lg p-1.5 bg-slate-50 focus:outline-[#07417B] font-medium"
                    >
                      <option value="">-- Seleccionar Cliente --</option>
                      {clientes.map(c => (
                        <option key={c.numero} value={c.numero}>{c.empresa} ({c.numero})</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex-1 flex flex-col min-h-0">
                    <div className="flex-1 overflow-y-auto border border-slate-200 rounded-lg p-4 bg-slate-50 text-xs leading-relaxed text-slate-700 whitespace-pre-wrap font-medium">
                      {cargandoCrossSelling ? (
                        <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-2">
                          <Zap size={20} className="animate-spin text-purple-600" />
                          <p>Analizando historial y catálogo semántico...</p>
                        </div>
                      ) : (
                        crossSellingSuggestion || "No hay compras registradas para buscar asociaciones."
                      )}
                    </div>
                    {!cargandoCrossSelling && crossSellingSuggestion && crossSellingSuggestion.includes("Artículo recomendado de venta cruzada:") && (
                      <button
                        onClick={async () => {
                          const match = crossSellingSuggestion.match(/Artículo recomendado de venta cruzada:\s*([A-Z0-9-]+)/i);
                          if (match && match[1]) {
                            const sku = match[1];
                            const client = clientes.find(c => c.numero === crossSellingClient) || { numero: crossSellingClient, empresa: "Cliente" };
                            const product = catalogoProd.find(p => p.codigo === sku) || { descripcion: `Accesorios para ${sku}`, precio: 8500 };

                            const newQuote = {
                              id: 0,
                              Pedido: `${product.descripcion.slice(0, 45)} (Cross-selling)`,
                              No_Cotizacion: `COT-CS-${Date.now().toString().slice(-4)}`,
                              num_cliente: client.numero,
                              Cliente: client.empresa,
                              equipo_id: client.equipo_id || "",
                              Categoría: "Cotización",
                              Estatus: "Nueva",
                              Prioridad: "Media",
                              Monto: product.precio,
                              Margen: 25,
                              Entrega: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                              dias_abierta: 0
                            };
                            await handleSaveCotizacion(newQuote);
                            showNotification(`Artículo recomendado (${sku}) añadido a Cotizaciones.`, "success");
                          } else {
                            showNotification("No se pudo identificar el código de producto para cotizar.", "error");
                          }
                        }}
                        className="mt-3 w-full bg-emerald-600 text-white font-bold py-2 rounded-lg text-xs hover:bg-emerald-700 transition flex justify-center items-center gap-2 cursor-pointer"
                      >
                        <Plus size={14} /> Convertir a Cotización Rápida
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Recordatorios de Cronogramas */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
                <div className="mb-4">
                  <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2"><Clock className="text-[#07417B]" size={20} /> Recordatorios de Cronogramas</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Solo aparecen cotizaciones con estatus <b>"Respuesta pendiente del proveedor"</b> o <b>"Pendiente enviar a Cliente"</b>.
                    Al cambiar su estatus desaparecerán automáticamente. Ordenadas por prioridad.
                  </p>
                </div>

                {(() => {
                  const priorityMap = { 'Crítica': 4, 'Alta': 3, 'Media': 2, 'Baja': 1 };
                  const filtered = [...cotizaciones]
                    .filter(o => o.Estatus === 'Respuesta pendiente del proveedor' || o.Estatus === 'Pendiente enviar a Cliente')
                    .sort((a, b) => (priorityMap[b.Prioridad] || 0) - (priorityMap[a.Prioridad] || 0));
                  const prioColors = { 'Baja': 'bg-slate-100 text-slate-600', 'Media': 'bg-blue-100 text-[#07417B]', 'Alta': 'bg-orange-100 text-orange-700', 'Crítica': 'bg-rose-100 text-rose-700' };
                  if (filtered.length === 0) {
                    return <div className="text-center py-10 text-slate-400 text-xs italic">No hay cotizaciones pendientes en espera en este momento.</div>;
                  }
                  return (
                    <div className="overflow-auto rounded-lg border border-slate-200">
                      <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50 border-b border-slate-200">
                          <tr>
                            {['Cotización', 'Cliente', 'Pedido', 'Monto', 'Estatus', 'Prioridad', 'Acción'].map(h => (
                              <th key={h} className="p-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {filtered.map((row, i) => (
                            <tr key={row.id} className={`border-b border-slate-100 ${i % 2 === 0 ? '' : 'bg-slate-50/40'} hover:bg-blue-50/30 transition-colors`}>
                              <td className="p-3 text-xs font-bold text-[#07417B]">{row.No_Cotizacion}</td>
                              <td className="p-3 text-xs text-slate-700">{row.Cliente}</td>
                              <td className="p-3 text-xs text-slate-600 max-w-[200px] truncate">{row.Pedido}</td>
                              <td className="p-3 text-xs font-semibold text-slate-700">{formatCurrency(row.Monto)}</td>
                              <td className="p-3">
                                <span className="bg-amber-100 text-amber-700 font-bold px-2 py-0.5 rounded text-[10px] border border-amber-200 whitespace-nowrap">{row.Estatus}</span>
                              </td>
                              <td className="p-3">
                                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${prioColors[row.Prioridad] || 'bg-slate-100 text-slate-600'}`}>{row.Prioridad}</span>
                              </td>
                              <td className="p-3">
                                <button
                                  onClick={() => abrirModalOperacion(row)}
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-[#07417B] hover:bg-blue-50 transition-colors cursor-pointer"
                                  title="Abrir y Editar"
                                >
                                  <Maximize2 size={13}/>
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  );
                })()}
              </div>
            </div>
          )}

          {/* TAB 3: BUSCADOR SEMÁNTICO RAG */}
          {activeTab === 'rag_search' && (
            <div className="p-6 space-y-6 animate-in fade-in duration-300">
              <div className="mb-2">
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2"><Cat className="text-[#07417B]" /> Asistente Nova</h2>
                <p className="text-xs text-slate-500 mt-1">Escribe una descripción informal o requerimiento técnico. El sistema buscará en LanceDB y formateará la cotización sugerida usando LLM local.</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Input Area */}
                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col h-[32rem]">
                  <form onSubmit={buscarRAG} className="flex flex-col h-full">
                    <label className="text-xs font-bold text-slate-600 mb-2 uppercase tracking-wide">Describa el Requerimiento Técnico</label>
                    <textarea
                      placeholder="Ej: Necesitamos una válvula de 2 pulgadas de acero inoxidable de marca Worcester que soporte presiones de caldera o vapor de agua..."
                      className="flex-1 w-full p-4 border border-slate-300 rounded-lg text-xs resize-none font-medium leading-relaxed"
                      value={ragQuery}
                      onChange={e => setRagQuery(e.target.value)}
                    />
                    <button
                      type="submit"
                      disabled={cargandoIA || !ragQuery.trim()}
                      className="mt-4 bg-[#07417B] text-white py-3 rounded-lg text-sm font-bold shadow-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {cargandoIA ? (
                        <>
                          <Zap size={16} className="animate-spin" /> Buscando y Redactando en LanceDB...
                        </>
                      ) : (
                        <>
                          <Search size={16} /> Buscar en LanceDB
                        </>
                      )}
                    </button>
                  </form>
                </div>

                {/* Output Area */}
                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col h-[32rem]">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold text-slate-600 uppercase tracking-wide">Resultados de Búsqueda Semántica</span>
                    {ragResult && (
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(ragResult);
                          showNotification("Respuesta de cotización copiada al portapapeles.", "success");
                        }}
                        className="flex items-center gap-1.5 text-xs text-[#07417B] font-semibold hover:underline bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg cursor-pointer"
                      >
                        <Copy size={13} /> Copiar para cliente
                      </button>
                    )}
                  </div>
                  {ragResult ? (
                    <textarea
                      readOnly
                      className="flex-1 w-full bg-slate-50 border border-slate-200 rounded-lg p-4 font-mono text-xs text-slate-700 leading-relaxed resize-none focus:outline-[#07417B]"
                      value={ragResult}
                    />
                  ) : (
                    <div className="flex-1 w-full bg-slate-50 border border-slate-200 rounded-lg p-4 flex flex-col items-center justify-center text-slate-400 text-center space-y-2">
                      <Cat size={32} className="opacity-40" />
                      <p>La propuesta de la IA aparecerá aquí después de buscar en el catálogo.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: COTIZACIONES */}
          {activeTab === 'quotes' && (
            <DynamicTable
              title="Seguimiento de Cotizaciones"
              icon={FileText}
              data={activeCotizaciones}
              setData={setCotizaciones}
              columnas={colCotis}
              setColumnas={setColCotis}
              globalSearch={globalSearch}
              onOpenRelationalModal={openRelationalModal}
              masterClientes={clientes}
              configOpciones={configOpciones}
              equipos={equipos}
              onDeleteRequest={handleDeleteCotizacion}
              onSaveRow={handleSaveCotizacion}
              onNotification={showNotification}
              onAddRow={() => abrirModalOperacion(null, 'Cotización')}
              onEditRow={(row) => abrirModalOperacion(row)}
              onGeneratePDF={(row) => setActiveModalPDF(row)}
              onEditOptions={(colKey, label, defaultOps) => setEditorOpcionesModal({ colKey, colLabel: label, defaultOpciones: defaultOps })}
              onOpenRules={() => setShowRuleManager(true)}
              onAddColumnaGlobal={handleAddColumnaGlobal}
              onDeleteColumnaGlobal={handleDeleteColumnaGlobal}
            />
          )}

          {/* TAB 5: PROCESAMIENTO LOGÍSTICO */}
          {activeTab === 'processing' && (
            <DynamicTable
              title="Procesamiento y Seguimiento de OC"
              icon={ShoppingCart}
              data={activeProcesamiento}
              setData={setProcesamiento}
              columnas={colProc}
              setColumnas={setColProc}
              globalSearch={globalSearch}
              onOpenRelationalModal={openRelationalModal}
              masterClientes={clientes}
              configOpciones={configOpciones}
              equipos={equipos}
              onDeleteRequest={handleDeleteProcesamiento}
              onSaveRow={handleSaveProcesamiento}
              onNotification={showNotification}
              onAddRow={() => abrirModalOperacion(null, 'Orden de compra')}
              onEditRow={(row) => abrirModalOperacion(row)}
              onGeneratePDF={(row) => setActiveModalPDF(row)}
              onEditOptions={(colKey, label, defaultOps) => setEditorOpcionesModal({ colKey, colLabel: label, defaultOpciones: defaultOps })}
              onOpenRules={() => setShowRuleManager(true)}
              onAddColumnaGlobal={handleAddColumnaGlobal}
              onDeleteColumnaGlobal={handleDeleteColumnaGlobal}
            />
          )}

          {/* TAB 5.5: ARCHIVO (Cerrados) */}
          {activeTab === 'archive' && (
            <DynamicTable
              title="Archivo / Historial"
              icon={CheckCircle2}
              data={closedItems}
              setData={() => {}} 
              columnas={colProc} 
              setColumnas={setColProc}
              globalSearch={globalSearch}
              onOpenRelationalModal={openRelationalModal}
              masterClientes={clientes}
              configOpciones={configOpciones}
              equipos={equipos}
              onDeleteRequest={(id) => {
                const item = closedItems.find(i => i.id === id);
                if (item && item.Categoría === 'Cotización') handleDeleteCotizacion(id);
                else handleDeleteProcesamiento(id);
              }}
              onSaveRow={(row) => {
                if (row.Categoría === 'Cotización') handleSaveCotizacion(row);
                else handleSaveProcesamiento(row);
              }}
              onNotification={showNotification}
              onAddRow={() => abrirModalOperacion(null, 'Terminado')}
              onEditRow={(row) => abrirModalOperacion(row)}
              onGeneratePDF={(row) => setActiveModalPDF(row)}
              onEditOptions={(colKey, label, defaultOps) => setEditorOpcionesModal({ colKey, colLabel: label, defaultOpciones: defaultOps })}
              onOpenRules={() => setShowRuleManager(true)}
              onAddColumnaGlobal={handleAddColumnaGlobal}
              onDeleteColumnaGlobal={handleDeleteColumnaGlobal}
            />
          )}

          {/* TAB 6: CATALOGO TECNICO */}
          {activeTab === 'catalog' && (
            <div className="p-6 space-y-6 animate-in fade-in duration-300">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2"><Package className="text-[#07417B]" /> Catálogo Técnico y Códigos de Inventario</h2>
                <div className="flex gap-2">
                  <button onClick={() => {
                    setNuevaCoordinacionNombre('');
                    setEditCoordinacionId(null);
                    setActiveModal('coordinacion');
                  }} className="flex items-center gap-1.5 bg-white border border-slate-300 text-slate-700 px-4 py-2 rounded-lg text-xs font-semibold hover:bg-slate-50 cursor-pointer shadow-xs"><Plus size={14} /> Nueva Coordinación</button>
                  <button onClick={() => {
                    setNuevaCatNombre('');
                    setNuevaCatCoordinacion('');
                    setListaAtributosTemporales([]);
                    setEditCategoryId(null);
                    setActiveModal('categoria');
                  }} className="flex items-center gap-1.5 bg-white border border-slate-300 text-slate-700 px-4 py-2 rounded-lg text-xs font-semibold hover:bg-slate-50 cursor-pointer shadow-xs"><Plus size={14} /> Nueva Categoría</button>
                  <button onClick={() => {
                    setNuevoProducto({ categoria_id: '', marca: '', num_proveedor: '', codigo: '', descripcion: '', precio: 0, moneda: 'MXN', tiempo_entrega: '', recomendaciones: '', valores_atributos: {} });
                    setEditProductoId(null);
                    setActiveModal('producto');
                  }} className="flex items-center gap-1.5 bg-[#07417B] text-white px-4 py-2 rounded-lg text-xs font-semibold hover:opacity-90 cursor-pointer shadow-xs"><Plus size={14} /> Nuevo Código (SKU)</button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Listado de Coordinaciones */}
                <div className="lg:col-span-3 bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col h-[48rem]">
                  <h3 className="font-bold text-sm text-slate-800 mb-4">Coordinaciones</h3>
                  <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                    {coordinaciones.map(coord => (
                      <div key={coord.id} className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 hover:bg-slate-50 flex justify-between items-center transition-colors">
                        <p className="font-bold text-slate-800 text-xs">{coord.nombre}</p>
                        <div className="flex gap-2 shrink-0">
                          <button onClick={() => {
                            setNuevaCoordinacionNombre(coord.nombre);
                            setEditCoordinacionId(coord.id);
                            setActiveModal('coordinacion');
                          }} className="text-[#07417B] hover:text-[#0b539c] p-1 rounded transition-colors cursor-pointer" title="Editar"><Edit2 size={14} /></button>
                          <button onClick={() => eliminarCoordinacion(coord.id)} className="text-rose-600 hover:text-rose-800 p-1 rounded transition-colors cursor-pointer" title="Eliminar"><Trash2 size={14} /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Listado de Familias/Categorías */}
                <div className="lg:col-span-3 bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col h-[48rem]">
                  <h3 className="font-bold text-sm text-slate-800 mb-4">Familias de Productos</h3>
                  <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                    {categoriasProd.map(cat => (
                      <div key={cat.id} className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 hover:bg-slate-50 flex justify-between items-center transition-colors">
                        <div>
                          <p className="font-bold text-slate-800 text-xs">{cat.nombre}</p>
                          <p className="text-[10px] text-slate-400 mt-1 font-semibold">Coord: {cat.coordinacion || 'Ninguna'}</p>
                        </div>
                        <div className="flex gap-2 shrink-0">
                          <button onClick={() => {
                            setNuevaCatNombre(cat.nombre);
                            setNuevaCatCoordinacion(cat.coordinacion || '');
                            setListaAtributosTemporales(cat.atributos);
                            setEditCategoryId(cat.id);
                            setActiveModal('categoria');
                          }} className="text-[#07417B] hover:text-[#0b539c] p-1 rounded transition-colors cursor-pointer" title="Editar"><Edit2 size={14} /></button>
                          <button onClick={() => eliminarCategoria(cat.id)} className="text-rose-600 hover:text-rose-800 p-1 rounded transition-colors cursor-pointer" title="Eliminar"><Trash2 size={14} /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Listado de Catálogo */}
                <div className="lg:col-span-6 bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col h-[48rem]">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-sm text-slate-800">Catálogo Registrado</h3>
                    <select className="p-1.5 border border-slate-300 rounded text-xs bg-white cursor-pointer outline-none" value={filtroCategoriaCatalogo} onChange={e => setFiltroCategoriaCatalogo(e.target.value)}>
                      <option value="">Todas las Categorías</option>
                      {categoriasProd.map(cat => <option key={cat.id} value={cat.id}>{cat.nombre}</option>)}
                    </select>
                  </div>

                  <div className="flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-4 pr-1">
                    {catalogoProd.filter(p => !filtroCategoriaCatalogo || p.categoria_id === filtroCategoriaCatalogo).filter(p => {
                      if (!globalSearch) return true;
                      const s = globalSearch.toLowerCase();
                      const catName = categoriasProd.find(c => c.id === p.categoria_id)?.nombre || '';
                      return (p.codigo && p.codigo.toLowerCase().includes(s)) ||
                        (p.marca && p.marca.toLowerCase().includes(s)) ||
                        (p.descripcion && p.descripcion.toLowerCase().includes(s)) ||
                        (p.num_proveedor && p.num_proveedor.toLowerCase().includes(s)) ||
                        catName.toLowerCase().includes(s) ||
                        (p.valores_atributos && Object.entries(p.valores_atributos).some(([k, v]) => k.toLowerCase().includes(s) || v.toString().toLowerCase().includes(s)));
                    }).map(p => {
                      const precioMinimoSugerido = (p.precio / 0.75) + 350;
                      const catName = categoriasProd.find(c => c.id === p.categoria_id)?.nombre || 'General';
                      return (
                        <div key={p.id} className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 hover:bg-slate-50 transition-colors flex flex-col justify-between relative">
                          <div>
                            <div className="flex justify-between items-start">
                              <div className="flex flex-col">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="font-bold text-slate-800 text-sm">Prov: <CopyableText text={p.codigo} /></span>
                                  <span className="text-[10px] font-bold text-[#07417B] bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-md">{p.marca}</span>
                                  <span className="text-[10px] font-bold text-slate-500 bg-slate-200 px-2 py-0.5 rounded-md">{catName}</span>
                                </div>
                                {p.codigo_interno && (
                                  <span className="text-[10px] text-slate-500 font-semibold mt-1">Int: {p.codigo_interno}</span>
                                )}
                              </div>
                            </div>
                            <p className="text-xs text-slate-600 mt-2.5 font-medium">{p.descripcion}</p>

                            {p.valores_atributos && Object.keys(p.valores_atributos).length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-3">
                                {Object.entries(p.valores_atributos).map(([k, v]) => (
                                  <span key={k} className="bg-slate-200/60 text-slate-600 text-[9px] px-2 py-0.5 rounded-md border border-slate-300 font-semibold">{k}: {v}</span>
                                ))}
                              </div>
                            )}

                            <div className="grid grid-cols-2 gap-2 mt-4 border-t border-slate-200/60 pt-3 text-[10px]">
                              <div>
                                <p className="font-bold text-slate-400 uppercase">Costo Base</p>
                                <p className="font-bold text-slate-700 mt-0.5">{formatCurrency(p.precio)} {p.moneda}</p>
                              </div>
                              <div>
                                <p className="font-bold text-emerald-600 uppercase">Precio Sugerido</p>
                                <p className="font-extrabold text-emerald-700 mt-0.5">{formatCurrency(precioMinimoSugerido)} {p.moneda}</p>
                              </div>
                            </div>

                            {p.recomendaciones && (
                              <p className="mt-3 text-[9px] text-amber-700 bg-amber-50 border border-amber-100 p-2 rounded-lg flex items-center gap-1.5 font-medium">
                                <Info size={11} className="shrink-0" /> {p.recomendaciones}
                              </p>
                            )}
                          </div>

                          <div className="border-t border-slate-200 pt-3 mt-4 flex justify-end gap-2 text-xs">
                            <button onClick={() => editarProducto(p)} className="text-[#07417B] hover:text-[#0b539c] p-1.5 hover:bg-slate-100 rounded transition-colors cursor-pointer" title="Editar"><Edit2 size={14} /></button>
                            <button onClick={() => eliminarProducto(p.id)} className="text-rose-600 hover:text-rose-800 p-1.5 hover:bg-slate-100 rounded transition-colors cursor-pointer" title="Eliminar"><Trash2 size={14} /></button>
                          </div>
                        </div>
                      );
                    })}
                    {catalogoProd.length === 0 && <div className="col-span-2 text-center py-12 text-slate-400 text-xs">El catálogo está vacío.</div>}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: CLIENTES MAESTRO */}
          {activeTab === 'clients' && (
            <div className="p-6 space-y-6 animate-in fade-in duration-300">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2"><Users className="text-[#07417B]" /> Directorio de Clientes</h2>
                <div className="flex gap-2">
                  <div className="flex bg-slate-100 border border-slate-200 p-0.5 rounded-lg mr-2">
                    <button
                      onClick={() => setClientsViewMode('grid')}
                      className={`p-1.5 rounded-md cursor-pointer ${clientsViewMode === 'grid' ? 'bg-white text-[#07417B] shadow-xs font-bold' : 'text-slate-500 hover:text-slate-800'}`}
                      title="Vista Cuadrícula"
                    >
                      <LayoutGrid size={14} />
                    </button>
                    <button
                      onClick={() => setClientsViewMode('list')}
                      className={`p-1.5 rounded-md cursor-pointer ${clientsViewMode === 'list' ? 'bg-white text-[#07417B] shadow-xs font-bold' : 'text-slate-500 hover:text-slate-800'}`}
                      title="Vista Lista"
                    >
                      <List size={14} />
                    </button>
                  </div>
                  <button onClick={() => {
                    setFormCliente({ numero: '', nombre: '', puesto: '', empresa: '', telefono: '', correo: '', tags: '', nota: '', equipo_id: '' });
                    setEditClienteId(null);
                    setActiveModal('cliente');
                  }} className="flex items-center gap-1.5 bg-[#07417B] text-white px-4 py-2 rounded-lg text-xs font-semibold hover:opacity-90 cursor-pointer shadow-xs"><Plus size={14} /> Nuevo Cliente</button>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col h-[48rem]">
                {clientsViewMode === 'grid' ? (
                  <div className="flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pr-1">
                    {clientes.filter(c => {
                      if (!globalSearch) return true;
                      const s = globalSearch.toLowerCase();
                      const eqName = equipos.find(e => e.id === c.equipo_id)?.nombre || '';
                      return (c.empresa && c.empresa.toLowerCase().includes(s)) ||
                        (c.numero && c.numero.toLowerCase().includes(s)) ||
                        (c.nombre && c.nombre.toLowerCase().includes(s)) ||
                        (c.puesto && c.puesto.toLowerCase().includes(s)) ||
                        (c.telefono && c.telefono.toLowerCase().includes(s)) ||
                        (c.correo && c.correo.toLowerCase().includes(s)) ||
                        (c.nota && c.nota.toLowerCase().includes(s)) ||
                        eqName.toLowerCase().includes(s) ||
                        (c.tags && c.tags.some(t => t.toLowerCase().includes(s)));
                    }).map(c => {
                      const eqName = equipos.find(e => e.id === c.equipo_id)?.nombre || 'Sin asignar';
                      const isExpanded = !!expandedCards[c.numero];
                      return (
                        <div key={c.id} className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 hover:bg-slate-50 transition-all flex flex-col justify-between min-h-[19.5rem] h-auto">
                          <div className={`flex-1 ${isExpanded ? '' : 'max-h-[12.5rem] overflow-hidden relative'}`}>
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-bold text-slate-800 text-sm leading-tight"><CopyableText text={c.empresa} /></h4>
                                <p className="text-[10px] text-slate-400 font-semibold mt-0.5"><CopyableText text={c.numero} /> • Equipo: {eqName}</p>
                              </div>
                              <button
                                onClick={() => { setActiveProfile({ type: 'cliente', id: c.numero }); setActiveTab('perfil_completo'); }}
                                className="text-slate-400 hover:text-[#07417B] p-1.5 border border-slate-200 rounded bg-white cursor-pointer shadow-xs"
                                title="Ver Dashboard Completo"
                              >
                                <ExternalLink size={14} />
                              </button>
                            </div>

                            <div className="space-y-1 mt-3 text-xs text-slate-600 font-medium">
                              <p className="font-bold text-slate-700"><CopyableText text={c.nombre} /> <span className="text-[10px] text-slate-400 font-normal">({c.puesto})</span></p>
                              <p className="flex items-center gap-1"><Smartphone size={12} className="opacity-50" /> <CopyableText text={c.telefono} /></p>
                              <p className="flex items-center gap-1 text-[#07417B]"><Mail size={12} className="opacity-50" /> <CopyableText text={c.correo} /></p>
                            </div>

                            {c.nota && (
                              <p className="mt-2 text-[10px] text-slate-500 italic bg-white border border-slate-200 p-2 rounded-lg">"{c.nota}"</p>
                            )}

                            {c.tags && c.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-4">
                                {c.tags.map((tag, idx) => (
                                  <span key={idx} className="bg-blue-50 text-[#07417B] border border-blue-100 text-[9px] px-2 py-0.5 rounded-full font-semibold">#{tag}</span>
                                ))}
                              </div>
                            )}
                            {!isExpanded && (
                              <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-slate-50 to-transparent pointer-events-none"></div>
                            )}
                          </div>

                          <div className="border-t border-slate-200 pt-3 mt-4 flex justify-between items-center text-xs">
                            <button
                              onClick={() => setExpandedCards(prev => ({ ...prev, [c.numero]: !prev[c.numero] }))}
                              className="text-[#07417B] hover:text-[#0b539c] font-bold cursor-pointer"
                            >
                              {isExpanded ? 'Ver menos' : 'Ver más'}
                            </button>
                            <div className="flex gap-2">
                              <button onClick={() => editarCliente(c)} className="text-[#07417B] hover:text-[#0b539c] p-1.5 hover:bg-slate-100 rounded cursor-pointer" title="Editar"><Edit2 size={14} /></button>
                              <button onClick={() => eliminarCliente(c.id, c.numero)} className="text-rose-600 hover:text-rose-800 p-1.5 hover:bg-slate-100 rounded cursor-pointer" title="Eliminar"><Trash2 size={14} /></button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex-1 overflow-auto">
                    <table className="w-full text-left border-collapse min-w-max">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200">
                          <th className="p-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">Empresa</th>
                          <th className="p-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">No. Cliente</th>
                          <th className="p-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">Contacto Principal</th>
                          <th className="p-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">Teléfono</th>
                          <th className="p-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">Correo</th>
                          <th className="p-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">Equipo</th>
                          <th className="p-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 text-center">Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {clientes.filter(c => {
                          if (!globalSearch) return true;
                          const s = globalSearch.toLowerCase();
                          const eqName = equipos.find(e => e.id === c.equipo_id)?.nombre || '';
                          return (c.empresa && c.empresa.toLowerCase().includes(s)) ||
                            (c.numero && c.numero.toLowerCase().includes(s)) ||
                            (c.nombre && c.nombre.toLowerCase().includes(s)) ||
                            (c.puesto && c.puesto.toLowerCase().includes(s)) ||
                            (c.telefono && c.telefono.toLowerCase().includes(s)) ||
                            (c.correo && c.correo.toLowerCase().includes(s)) ||
                            (c.nota && c.nota.toLowerCase().includes(s)) ||
                            eqName.toLowerCase().includes(s) ||
                            (c.tags && c.tags.some(t => t.toLowerCase().includes(s)));
                        }).map(c => {
                          const eqName = equipos.find(e => e.id === c.equipo_id)?.nombre || 'Sin asignar';
                          return (
                            <tr key={c.id} className="border-b border-slate-100 hover:bg-slate-50/40">
                              <td className="p-3 text-xs font-bold text-slate-800"><CopyableText text={c.empresa} /></td>
                              <td className="p-3 text-xs font-mono text-slate-500"><CopyableText text={c.numero} /></td>
                              <td className="p-3 text-xs text-slate-700">
                                <div>
                                  <p className="font-semibold"><CopyableText text={c.nombre} /></p>
                                  <p className="text-[10px] text-slate-400">{c.puesto}</p>
                                </div>
                              </td>
                              <td className="p-3 text-xs text-slate-600"><CopyableText text={c.telefono} /></td>
                              <td className="p-3 text-xs text-[#07417B] font-medium"><CopyableText text={c.correo} /></td>
                              <td className="p-3 text-xs text-slate-600 font-semibold">{eqName}</td>
                              <td className="p-3 text-xs text-center whitespace-nowrap">
                                <button onClick={() => { setActiveProfile({ type: 'cliente', id: c.numero }); setActiveTab('perfil_completo'); }} className="text-slate-400 hover:text-[#07417B] p-1.5 rounded cursor-pointer" title="Ver Expediente"><ExternalLink size={13} /></button>
                                <button onClick={() => editarCliente(c)} className="text-slate-400 hover:text-[#07417B] p-1.5 rounded cursor-pointer" title="Editar"><Edit2 size={13} /></button>
                                <button onClick={() => eliminarCliente(c.id, c.numero)} className="text-slate-400 hover:text-rose-500 p-1.5 rounded cursor-pointer" title="Eliminar"><Trash2 size={13} /></button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 8: PROVEEDORES MAESTRO */}
          {activeTab === 'providers' && (
            <div className="p-6 space-y-6 animate-in fade-in duration-300">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2"><Truck className="text-[#07417B]" /> Directorio de Proveedores</h2>
                <div className="flex gap-2">
                  <div className="flex bg-slate-100 border border-slate-200 p-0.5 rounded-lg mr-2">
                    <button
                      onClick={() => setProvidersViewMode('grid')}
                      className={`p-1.5 rounded-md cursor-pointer ${providersViewMode === 'grid' ? 'bg-white text-[#07417B] shadow-xs font-bold' : 'text-slate-500 hover:text-slate-800'}`}
                      title="Vista Cuadrícula"
                    >
                      <LayoutGrid size={14} />
                    </button>
                    <button
                      onClick={() => setProvidersViewMode('list')}
                      className={`p-1.5 rounded-md cursor-pointer ${providersViewMode === 'list' ? 'bg-white text-[#07417B] shadow-xs font-bold' : 'text-slate-500 hover:text-slate-800'}`}
                      title="Vista Lista"
                    >
                      <List size={14} />
                    </button>
                  </div>
                  <button onClick={() => {
                    setFormProveedor({ numero: '', nombre: '', puesto: '', empresa: '', telefono: '', correo: '', descuento: '', tags: '', compra_minima: '', compra_envio_pagado: '' });
                    setEditProveedorId(null);
                    setActiveModal('proveedor');
                  }} className="flex items-center gap-1.5 bg-[#07417B] text-white px-4 py-2 rounded-lg text-xs font-semibold hover:opacity-90 cursor-pointer shadow-xs"><Plus size={14} /> Nuevo Proveedor</button>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col h-[48rem]">
                {providersViewMode === 'grid' ? (
                  <div className="flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pr-1">
                    {proveedores.filter(p => {
                      if (!globalSearch) return true;
                      const s = globalSearch.toLowerCase();
                      return (p.empresa && p.empresa.toLowerCase().includes(s)) ||
                        (p.numero && p.numero.toLowerCase().includes(s)) ||
                        (p.nombre && p.nombre.toLowerCase().includes(s)) ||
                        (p.puesto && p.puesto.toLowerCase().includes(s)) ||
                        (p.telefono && p.telefono.toLowerCase().includes(s)) ||
                        (p.correo && p.correo.toLowerCase().includes(s)) ||
                        (p.descuento && p.descuento.toLowerCase().includes(s)) ||
                        (p.tags && p.tags.some(t => t.toLowerCase().includes(s)));
                    }).map(p => {
                      const isExpanded = !!expandedCards[p.numero];
                      return (
                        <div key={p.id} className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 hover:bg-slate-50 transition-all flex flex-col justify-between min-h-[19.5rem] h-auto">
                          <div className={`flex-1 ${isExpanded ? '' : 'max-h-[12.5rem] overflow-hidden relative'}`}>
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-bold text-slate-800 text-sm leading-tight"><CopyableText text={p.empresa} /></h4>
                                <p className="text-[10px] text-slate-400 font-semibold mt-0.5"><CopyableText text={p.numero} /> • Desc: {p.descuento}</p>
                              </div>
                              <button
                                onClick={() => { setActiveProfile({ type: 'proveedor', id: p.numero }); setActiveTab('perfil_completo'); }}
                                className="text-slate-400 hover:text-[#07417B] p-1.5 border border-slate-200 rounded bg-white cursor-pointer shadow-xs"
                                title="Ver Dashboard Completo"
                              >
                                <ExternalLink size={14} />
                              </button>
                            </div>

                            <div className="space-y-1 mt-3 text-xs text-slate-600 font-medium">
                              <p className="font-bold text-slate-700"><CopyableText text={p.nombre} /> <span className="text-[10px] text-slate-400 font-normal">({p.puesto})</span></p>
                              <p className="flex items-center gap-1"><Smartphone size={12} className="opacity-50" /> <CopyableText text={p.telefono} /></p>
                              <p className="flex items-center gap-1 text-[#07417B]"><Mail size={12} className="opacity-50" /> <CopyableText text={p.correo} /></p>
                            </div>

                            <div className="grid grid-cols-2 gap-2 mt-4 text-[10px] text-slate-500 font-semibold bg-white border border-slate-200 p-2.5 rounded-lg">
                              <div>Mín. Compra: {formatCurrency(p.compra_minima)}</div>
                              <div>Envío Gratis: {formatCurrency(p.compra_envio_pagado)}</div>
                            </div>

                            {p.tags && p.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-4">
                                {p.tags.map((tag, idx) => (
                                  <span key={idx} className="bg-teal-50 text-teal-700 border border-teal-100 text-[9px] px-2 py-0.5 rounded-full font-semibold">#{tag}</span>
                                ))}
                              </div>
                            )}
                            {!isExpanded && (
                              <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-slate-50 to-transparent pointer-events-none"></div>
                            )}
                          </div>

                          <div className="border-t border-slate-200 pt-3 mt-4 flex justify-between items-center text-xs">
                            <button
                              onClick={() => setExpandedCards(prev => ({ ...prev, [p.numero]: !prev[p.numero] }))}
                              className="text-[#07417B] hover:text-[#0b539c] font-bold cursor-pointer"
                            >
                              {isExpanded ? 'Ver menos' : 'Ver más'}
                            </button>
                            <div className="flex gap-2">
                              <button onClick={() => editarProveedor(p)} className="text-[#07417B] hover:text-[#0b539c] p-1.5 hover:bg-slate-100 rounded cursor-pointer" title="Editar"><Edit2 size={14} /></button>
                              <button onClick={() => eliminarProveedor(p.id, p.numero)} className="text-rose-600 hover:text-rose-800 p-1.5 hover:bg-slate-100 rounded cursor-pointer" title="Eliminar"><Trash2 size={14} /></button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex-1 overflow-auto">
                    <table className="w-full text-left border-collapse min-w-max">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200">
                          <th className="p-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">Empresa</th>
                          <th className="p-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">No. Proveedor</th>
                          <th className="p-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">Contacto Principal</th>
                          <th className="p-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">Teléfono</th>
                          <th className="p-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">Correo</th>
                          <th className="p-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">Descuento</th>
                          <th className="p-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 text-center">Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {proveedores.filter(p => {
                          if (!globalSearch) return true;
                          const s = globalSearch.toLowerCase();
                          return (p.empresa && p.empresa.toLowerCase().includes(s)) ||
                            (p.numero && p.numero.toLowerCase().includes(s)) ||
                            (p.nombre && p.nombre.toLowerCase().includes(s)) ||
                            (p.puesto && p.puesto.toLowerCase().includes(s)) ||
                            (p.telefono && p.telefono.toLowerCase().includes(s)) ||
                            (p.correo && p.correo.toLowerCase().includes(s)) ||
                            (p.descuento && p.descuento.toLowerCase().includes(s)) ||
                            (p.tags && p.tags.some(t => t.toLowerCase().includes(s)));
                        }).map(p => (
                          <tr key={p.id} className="border-b border-slate-100 hover:bg-slate-50/40">
                            <td className="p-3 text-xs font-bold text-slate-800"><CopyableText text={p.empresa} /></td>
                            <td className="p-3 text-xs font-mono text-slate-500"><CopyableText text={p.numero} /></td>
                            <td className="p-3 text-xs text-slate-700">
                              <div>
                                <p className="font-semibold"><CopyableText text={p.nombre} /></p>
                                <p className="text-[10px] text-slate-400">{p.puesto}</p>
                              </div>
                            </td>
                            <td className="p-3 text-xs text-slate-600"><CopyableText text={p.telefono} /></td>
                            <td className="p-3 text-xs text-[#07417B] font-medium"><CopyableText text={p.correo} /></td>
                            <td className="p-3 text-xs text-slate-600 font-semibold">{p.descuento}</td>
                            <td className="p-3 text-xs text-center whitespace-nowrap">
                              <button onClick={() => { setActiveProfile({ type: 'proveedor', id: p.numero }); setActiveTab('perfil_completo'); }} className="text-slate-400 hover:text-[#07417B] p-1.5 rounded cursor-pointer" title="Ver Expediente"><ExternalLink size={13} /></button>
                              <button onClick={() => editarProveedor(p)} className="text-slate-400 hover:text-[#07417B] p-1.5 rounded cursor-pointer" title="Editar"><Edit2 size={13} /></button>
                              <button onClick={() => eliminarProveedor(p.id, p.numero)} className="text-slate-400 hover:text-rose-500 p-1.5 rounded cursor-pointer" title="Eliminar"><Trash2 size={13} /></button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 9: EQUIPOS DE VENTAS Y VENDEDORES */}
          {activeTab === 'teams' && (
            <div className="p-6 space-y-6 animate-in fade-in duration-300">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2"><Briefcase className="text-[#07417B]" /> Estructura Comercial y Equipos de Ventas</h2>
                <div className="flex gap-2">
                  <button onClick={() => {
                    setFormEquipo({ nombre: '' });
                    setEditEquipoId(null);
                    setActiveModal('equipo');
                  }} className="flex items-center gap-1.5 bg-white border border-slate-300 text-slate-700 px-4 py-2 rounded-lg text-xs font-semibold hover:bg-slate-50 cursor-pointer shadow-xs"><Plus size={14} /> Nuevo Equipo</button>
                  <button onClick={() => {
                    setFormVendedor({ nombre: '', puesto: '', celular: '', correo: '', equipo_id: '' });
                    setEditVendedorId(null);
                    setActiveModal('vendedor');
                  }} className="flex items-center gap-1.5 bg-[#07417B] text-white px-4 py-2 rounded-lg text-xs font-semibold hover:opacity-90 cursor-pointer shadow-xs"><Plus size={14} /> Nuevo Asesor</button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Equipos */}
                <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col h-[38rem]">
                  <h3 className="font-bold text-sm text-slate-800 mb-4">Equipos Existentes</h3>
                  <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                    {equipos.filter(eq => {
                      if (!globalSearch) return true;
                      const s = globalSearch.toLowerCase();
                      return (eq.nombre && eq.nombre.toLowerCase().includes(s)) || (eq.id && eq.id.toLowerCase().includes(s));
                    }).map(eq => (
                      <div key={eq.id} className="flex justify-between items-center p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium">
                        <span>{eq.nombre}</span>
                        <div className="flex gap-2">
                          <button onClick={() => {
                            setFormEquipo({ nombre: eq.nombre });
                            setEditEquipoId(eq.id);
                            setActiveModal('equipo');
                          }} className="text-[#07417B] hover:text-[#0b539c] p-1 rounded transition-colors cursor-pointer" title="Editar"><Edit2 size={14} /></button>
                          <button onClick={() => eliminarEquipo(eq.id)} className="text-rose-500 hover:text-rose-750 p-1 rounded transition-colors cursor-pointer" title="Eliminar"><Trash2 size={14} /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Vendedores / Asesores */}
                <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col h-[38rem]">
                  <h3 className="font-bold text-sm text-slate-800 mb-4">Asesores Comerciales</h3>
                  <div className="flex-1 overflow-y-auto space-y-3">
                    {vendedores.filter(v => {
                      if (!globalSearch) return true;
                      const s = globalSearch.toLowerCase();
                      const eqName = equipos.find(e => e.id === v.equipo_id)?.nombre || '';
                      return (v.nombre && v.nombre.toLowerCase().includes(s)) ||
                        (v.puesto && v.puesto.toLowerCase().includes(s)) ||
                        (v.celular && v.celular.toLowerCase().includes(s)) ||
                        (v.correo && v.correo.toLowerCase().includes(s)) ||
                        eqName.toLowerCase().includes(s);
                    }).map(v => {
                      const eqName = equipos.find(e => e.id === v.equipo_id)?.nombre || 'Sin equipo';
                      return (
                        <div key={v.id} className="border border-slate-200 rounded-xl p-4 flex justify-between items-center bg-white hover:bg-slate-50/50 transition-colors">
                          <div className="space-y-1">
                            <h4 className="font-bold text-slate-800 text-xs"><CopyableText text={v.nombre} /></h4>
                            <p className="text-[10px] text-slate-500 font-semibold">{v.puesto} • Equipo: {eqName}</p>
                            <p className="text-[10px] text-slate-500">Cel: <CopyableText text={v.celular} /> • Correo: <CopyableText text={v.correo} /></p>
                          </div>
                          <div className="flex gap-2">
                            <button onClick={() => { setFormVendedor(v); setEditVendedorId(v.id); setActiveModal('vendedor'); }} className="text-[#07417B] hover:text-[#0b539c] p-1 rounded transition-colors cursor-pointer" title="Editar"><Edit2 size={14} /></button>
                            <button onClick={() => eliminarVendedor(v.id)} className="text-rose-600 hover:text-rose-800 p-1 rounded transition-colors cursor-pointer" title="Eliminar"><Trash2 size={14} /></button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 10: PERFIL COMPLETO / DASHBOARD DE ENTIDAD */}
          {activeTab === 'perfil_completo' && activeProfile && (
            <div className="p-6 space-y-6 animate-in fade-in duration-300">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setActiveTab(activeProfile.type === 'cliente' ? 'clients' : 'providers')}
                  className="text-xs text-slate-500 hover:text-slate-800 bg-white border border-slate-200 px-3 py-1.5 rounded-lg font-semibold cursor-pointer shadow-xs"
                >
                  &larr; Volver al Directorio
                </button>
                <span className="text-slate-300">/</span>
                <span className="text-xs font-semibold text-slate-500">Expediente General de {activeProfile.type === 'cliente' ? 'Cliente' : 'Proveedor'}</span>
              </div>

              {(() => {
                const isClient = activeProfile.type === 'cliente';
                const entity = isClient
                  ? clientes.find(c => c.numero === activeProfile.id)
                  : proveedores.find(p => p.numero === activeProfile.id);

                if (!entity) return <div className="text-slate-500 text-xs">No se encontró la ficha del cliente/proveedor.</div>;

                const vinculadasCotis = cotizaciones.filter(c => c.num_cliente === entity.numero);
                const vinculadasProc = procesamiento.filter(p => p.num_cliente === entity.numero);

                return (
                  <div className="space-y-6">
                    {/* Perfil Header */}
                    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs relative overflow-hidden">
                      <div className={`absolute top-0 left-0 w-2 h-full ${isClient ? 'bg-[#07417B]' : 'bg-teal-600'}`}></div>
                      <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="text-2xl font-bold text-slate-800">{entity.empresa}</span>
                            <span className={`text-xs font-semibold px-3 py-0.5 rounded-full ${isClient ? 'bg-blue-100 text-[#07417B]' : 'bg-teal-100 text-teal-800'}`}>
                              {isClient ? 'Cliente' : 'Proveedor'}
                            </span>
                          </div>
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Código Único: {entity.numero}</p>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {entity.tags?.map((tag, i) => (
                              <span key={i} className="bg-slate-100 text-slate-600 text-[10px] px-2 py-0.5 rounded-md border border-slate-200 font-semibold">#{tag}</span>
                            ))}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              if (isClient) editarCliente(entity);
                              else editarProveedor(entity);
                            }}
                            className="bg-white border border-slate-300 text-slate-700 px-4 py-2.5 rounded-lg text-xs font-bold hover:bg-slate-50 shadow-xs flex items-center gap-1.5 cursor-pointer"
                          >
                            <Edit2 size={14} /> Editar Ficha
                          </button>
                          <button
                            onClick={() => setShowDirectorio(true)}
                            className="bg-[#07417B] text-white px-4 py-2.5 rounded-lg text-xs font-bold hover:opacity-90 shadow-xs flex items-center gap-1.5 cursor-pointer"
                          >
                            <Contact size={14} /> Directorio de Contactos ({contactosAdicionales.filter(c => c.entity_id === activeProfile.id).length + 1})
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6 border-t border-slate-100 pt-5">
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Representante</span>
                          <p className="text-xs font-bold text-slate-700">{entity.nombre}</p>
                          <p className="text-[10px] text-slate-400 font-semibold">{entity.puesto}</p>
                        </div>
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Contacto</span>
                          <p className="text-xs font-medium text-slate-700 flex items-center gap-1.5"><Phone size={12} className="opacity-50" /> {entity.telefono}</p>
                          <p className="text-xs font-medium text-[#07417B] flex items-center gap-1.5"><Mail size={12} className="opacity-50" /> {entity.correo}</p>
                        </div>
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Notas Especiales</span>
                          <p className="text-xs text-slate-600 italic">"{entity.nota || 'Sin observaciones registradas.'}"</p>
                        </div>
                      </div>
                    </div>

                    {/* Historial de transacciones vinculadas */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Cotizaciones vinculadas */}
                      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col h-96">
                        <h3 className="font-bold text-sm text-slate-800 mb-4">Propuestas y Cotizaciones ({vinculadasCotis.length})</h3>
                        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                          {vinculadasCotis.map(c => (
                            <div key={c.id} className="border border-slate-150 p-3 bg-slate-50/50 rounded-lg text-xs flex justify-between items-center">
                              <div>
                                <p className="font-bold text-slate-800">{c.Pedido}</p>
                                <p className="text-[10px] text-slate-500 mt-0.5">{c.No_Cotizacion} • Entrega: {c.Entrega}</p>
                              </div>
                              <div className="text-right">
                                <p className="font-bold text-slate-800">{formatCurrency(c.Monto)}</p>
                                <span className="text-[9px] font-bold text-[#07417B] bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-md uppercase mt-1 inline-block">{c.Estatus}</span>
                              </div>
                            </div>
                          ))}
                          {vinculadasCotis.length === 0 && <div className="text-center py-12 text-slate-400 text-xs">No hay cotizaciones para mostrar.</div>}
                        </div>
                      </div>

                      {/* Logística vinculada */}
                      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col h-96">
                        <h3 className="font-bold text-sm text-slate-800 mb-4">Órdenes de Compra y Logística ({vinculadasProc.length})</h3>
                        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                          {vinculadasProc.map(p => (
                            <div key={p.id} className="border border-slate-150 p-3 bg-slate-50/50 rounded-lg text-xs flex justify-between items-center">
                              <div>
                                <p className="font-bold text-slate-800">{p.Pedido}</p>
                                <p className="text-[10px] text-slate-500 mt-0.5">{p.No_Cotizacion} • Entrega: {p.Entrega}</p>
                              </div>
                              <div className="text-right">
                                <p className="font-bold text-slate-800">{formatCurrency(p.Monto)}</p>
                                <span className="text-[9px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-md uppercase mt-1 inline-block">{p.Progreso}</span>
                              </div>
                            </div>
                          ))}
                          {vinculadasProc.length === 0 && <div className="text-center py-12 text-slate-400 text-xs">No hay órdenes de compra activas para mostrar.</div>}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* TAB 11: CALCULADORAS Y UTILIDADES */}
          {activeTab === 'utilities' && (
            <div className="p-6 space-y-6 animate-in fade-in duration-300">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-4">
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2"><Calculator className="text-[#07417B]" /> Utilidades Financieras</h2>

                <div className="flex flex-wrap items-center gap-3">
                  {/* Selector de moneda */}
                  <div className="flex bg-slate-100 border border-slate-200 p-0.5 rounded-lg text-xs">
                    <button
                      onClick={() => {
                        if (monedaCalc1 === 'USD') {
                          const updated = itemsCalc1.map(item => {
                            const pCompra = item.precioCompra * tipoCambio;
                            const f = item.flete * tipoCambio;
                            return { ...item, precioCompra: Number(pCompra.toFixed(2)), flete: Number(f.toFixed(2)) };
                          });
                          const updated2 = itemsCalc2.map(item => {
                            const pCompra = item.precioCompra * tipoCambio;
                            const f = item.flete * tipoCambio;
                            const pVenta = item.precioVenta * tipoCambio;
                            return {
                              ...item,
                              precioCompra: Number(pCompra.toFixed(2)),
                              flete: Number(f.toFixed(2)),
                              precioVenta: Number(pVenta.toFixed(2))
                            };
                          });
                          const updated3 = itemsCalc3.map(item => {
                            const pLista = item.precioLista * tipoCambio;
                            return { ...item, precioLista: Number(pLista.toFixed(2)) };
                          });
                          setItemsCalc1(updated);
                          setItemsCalc2(updated2);
                          setItemsCalc3(updated3);
                          setMonedaCalc1('MXN');
                        }
                      }}
                      className={`px-2.5 py-1 rounded-md cursor-pointer font-bold ${monedaCalc1 === 'MXN' ? 'bg-white text-[#07417B] shadow-2xs' : 'text-slate-500 hover:text-slate-800'}`}
                    >
                      MXN ($)
                    </button>
                    <button
                      onClick={() => {
                        if (monedaCalc1 === 'MXN') {
                          const updated = itemsCalc1.map(item => {
                            const pCompra = item.precioCompra / tipoCambio;
                            const f = item.flete / tipoCambio;
                            return { ...item, precioCompra: Number(pCompra.toFixed(2)), flete: Number(f.toFixed(2)) };
                          });
                          const updated2 = itemsCalc2.map(item => {
                            const pCompra = item.precioCompra / tipoCambio;
                            const f = item.flete / tipoCambio;
                            const pVenta = item.precioVenta / tipoCambio;
                            return {
                              ...item,
                              precioCompra: Number(pCompra.toFixed(2)),
                              flete: Number(f.toFixed(2)),
                              precioVenta: Number(pVenta.toFixed(2))
                            };
                          });
                          const updated3 = itemsCalc3.map(item => {
                            const pLista = item.precioLista / tipoCambio;
                            return { ...item, precioLista: Number(pLista.toFixed(2)) };
                          });
                          setItemsCalc1(updated);
                          setItemsCalc2(updated2);
                          setItemsCalc3(updated3);
                          setMonedaCalc1('USD');
                        }
                      }}
                      className={`px-2.5 py-1 rounded-md cursor-pointer font-bold ${monedaCalc1 === 'USD' ? 'bg-white text-[#07417B] shadow-2xs' : 'text-slate-500 hover:text-slate-800'}`}
                    >
                      USD ($)
                    </button>
                  </div>

                  {/* Tipo de cambio */}
                  <div className="flex items-center gap-1.5 text-xs text-slate-600 font-semibold bg-white border border-slate-200 px-2.5 py-1 rounded-lg">
                    <span>TC:</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0.1"
                      className="w-16 p-0.5 border border-slate-300 rounded text-center bg-white"
                      value={tipoCambio}
                      onChange={e => {
                        const newTC = Math.max(0.1, Number(e.target.value) || 1);
                        const oldTC = tipoCambio;
                        if (newTC !== oldTC) {
                          const ratio = monedaCalc1 === 'USD' ? (oldTC / newTC) : (newTC / oldTC);

                          setItemsCalc1(prev => prev.map(item => ({
                            ...item,
                            precioCompra: Number((item.precioCompra * ratio).toFixed(2)),
                            flete: Number((item.flete * ratio).toFixed(2))
                          })));

                          setItemsCalc2(prev => prev.map(item => ({
                            ...item,
                            precioCompra: Number((item.precioCompra * ratio).toFixed(2)),
                            flete: Number((item.flete * ratio).toFixed(2)),
                            precioVenta: Number((item.precioVenta * ratio).toFixed(2))
                          })));

                          setItemsCalc3(prev => prev.map(item => ({
                            ...item,
                            precioLista: Number((item.precioLista * ratio).toFixed(2))
                          })));

                          setTipoCambio(newTC);
                        }
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-6 w-full">
                {/* Calculadora 1: Estimador de precios con divisa y agregación */}
                <div className="w-full bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col space-y-4">
                  <div className="border-b border-slate-100 pb-3">
                    <h3 className="font-bold text-sm text-slate-800">1. Calculadora de Precios y Cotizaciones Múltiples</h3>
                    <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Calcula el precio de venta sugerido sumando margen, flete e importación para varios elementos.</p>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[50rem]">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                          <th className="p-3 w-32">Precio Compra ({monedaCalc1})</th>
                          <th className="p-3 w-24 text-center">Importar</th>
                          <th className="p-3 w-28 text-center">Costo Imp. %</th>
                          <th className="p-3 w-28 text-center">Margen Venta %</th>
                          <th className="p-3 w-28">Flete ({monedaCalc1})</th>
                          <th className="p-3 w-32 text-right text-emerald-600 relative group cursor-help select-none">
                            <div className="flex items-center justify-end gap-1">
                              Precio Venta ({monedaCalc1})
                              <Info size={12} className="text-slate-400" />
                            </div>
                            <div className="absolute right-0 top-full mt-1 hidden group-hover:block bg-slate-800 text-white text-[10px] p-2 rounded-lg shadow-lg z-50 w-64 text-left font-normal normal-case leading-relaxed pointer-events-none">
                              Fórmula: Precio Venta = (Costo Compra * (1 + Importación %) + Flete) / (1 - Margen % / 100)
                            </div>
                          </th>
                          <th className="p-3 w-16 text-center">Acción</th>
                        </tr>
                      </thead>
                      <tbody>
                        {itemsCalc1.map((item, idx) => {
                          const pCompra = Number(item.precioCompra) || 0;
                          const f = Number(item.flete) || 0;
                          const costImp = item.importar ? (Number(item.costoImportacion) || 0) : 0;
                          const costoBase = pCompra * (1 + costImp / 100);
                          const precioVenta = (costoBase + f) / (1 - (item.margen / 100));

                          return (
                            <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                              <td className="p-2 align-middle">
                                <input
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  className="w-full p-1.5 border border-slate-200 rounded text-xs bg-white font-semibold text-slate-700"
                                  value={item.precioCompra}
                                  onChange={e => {
                                    const list = [...itemsCalc1];
                                    list[idx].precioCompra = Number(e.target.value) || 0;
                                    setItemsCalc1(list);
                                  }}
                                />
                              </td>
                              <td className="p-2 align-middle text-center">
                                <input
                                  type="checkbox"
                                  className="accent-[#07417B] h-4 w-4"
                                  checked={item.importar}
                                  onChange={e => {
                                    const list = [...itemsCalc1];
                                    list[idx].importar = e.target.checked;
                                    setItemsCalc1(list);
                                  }}
                                />
                              </td>
                              <td className="p-2 align-middle">
                                <input
                                  type="number"
                                  min="0"
                                  step="0.5"
                                  disabled={!item.importar}
                                  className="w-full p-1.5 border border-slate-200 rounded text-xs bg-white text-center disabled:opacity-50 disabled:bg-slate-100"
                                  value={item.costoImportacion}
                                  onChange={e => {
                                    const list = [...itemsCalc1];
                                    list[idx].costoImportacion = Number(e.target.value) || 0;
                                    setItemsCalc1(list);
                                  }}
                                />
                              </td>
                              <td className="p-2 align-middle">
                                <input
                                  type="number"
                                  min="0"
                                  max="99.9"
                                  step="1"
                                  className="w-full p-1.5 border border-slate-200 rounded text-xs bg-white text-center"
                                  value={item.margen}
                                  onChange={e => {
                                    const list = [...itemsCalc1];
                                    list[idx].margen = Number(e.target.value) || 0;
                                    setItemsCalc1(list);
                                  }}
                                />
                              </td>
                              <td className="p-2 align-middle">
                                <input
                                  type="number"
                                  min="0"
                                  step="1"
                                  className="w-full p-1.5 border border-slate-200 rounded text-xs bg-white"
                                  value={item.flete}
                                  onChange={e => {
                                    const list = [...itemsCalc1];
                                    list[idx].flete = Number(e.target.value) || 0;
                                    setItemsCalc1(list);
                                  }}
                                />
                              </td>
                              <td className="p-2 align-middle text-right font-bold text-slate-700 text-xs group">
                                <div className="flex items-center justify-end gap-1.5">
                                  <span>{formatCurrency(precioVenta)}</span>
                                  <button onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(precioVenta.toFixed(2)); }} className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-[#07417B] transition-opacity cursor-pointer" title="Copiar número puro"><Copy size={12} /></button>
                                </div>
                              </td>
                              <td className="p-2 align-middle text-center">
                                <button
                                  onClick={() => setItemsCalc1(itemsCalc1.filter(x => x.id !== item.id))}
                                  className="text-rose-500 hover:text-rose-750 p-1.5 rounded cursor-pointer"
                                  title="Eliminar elemento"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                      <tfoot>
                        {(() => {
                          const sumCompra = itemsCalc1.reduce((sum, item) => sum + (Number(item.precioCompra) || 0), 0);
                          const sumFlete = itemsCalc1.reduce((sum, item) => sum + (Number(item.flete) || 0), 0);
                          const avgMargen = itemsCalc1.length > 0 ? (itemsCalc1.reduce((sum, item) => sum + (Number(item.margen) || 0), 0) / itemsCalc1.length) : 0;
                          const sumVenta = itemsCalc1.reduce((sum, item) => {
                            const pCompra = Number(item.precioCompra) || 0;
                            const f = Number(item.flete) || 0;
                            const costImp = item.importar ? (Number(item.costoImportacion) || 0) : 0;
                            const costoBase = pCompra * (1 + costImp / 100);
                            const pVenta = (costoBase + f) / (1 - (item.margen / 100));
                            return sum + pVenta;
                          }, 0);

                          return (
                            <tr className="bg-slate-50 border-t-2 border-slate-200 text-xs font-bold text-slate-700">
                              <td colSpan={3} className="p-3 text-slate-500 text-[10px] uppercase font-bold">
                                TOTALES / PROMEDIO (Compra: {formatCurrency(sumCompra)} {monedaCalc1})
                              </td>
                              <td className="p-3 text-center">Prom: {avgMargen.toFixed(1)}%</td>
                              <td className="p-3">
                                <div>{formatCurrency(sumFlete)} {monedaCalc1}</div>
                              </td>
                              <td className="p-3 text-right text-emerald-700 font-extrabold">
                                <div>{formatCurrency(sumVenta)} {monedaCalc1}</div>
                              </td>
                              <td className="p-3"></td>
                            </tr>
                          );
                        })()}
                      </tfoot>
                    </table>
                  </div>

                  <button
                    onClick={() => {
                      const nextId = itemsCalc1.length > 0 ? Math.max(...itemsCalc1.map(x => x.id)) + 1 : 1;
                      setItemsCalc1([...itemsCalc1, {
                        id: nextId,
                        precioCompra: 0,
                        margen: 25,
                        flete: monedaCalc1 === 'MXN' ? 350 : 20,
                        importar: false,
                        costoImportacion: 10
                      }]);
                    }}
                    className="flex items-center gap-1.5 bg-[#07417B] text-white px-4 py-2 rounded-lg text-xs font-semibold hover:opacity-90 self-start cursor-pointer shadow-2xs"
                  >
                    <Plus size={13} /> Añadir Elemento
                  </button>
                </div>

                {/* Calculadora 2: Obtener margen de venta */}
                <div className="w-full bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col space-y-4">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 pb-3">
                    <div>
                      <h3 className="font-bold text-sm text-slate-800 flex items-center gap-1.5"><Percent size={16} className="text-[#07417B]" /> 2. Calcular Margen de Venta Múltiple</h3>
                      <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Determina el porcentaje de margen real a partir del precio de venta cobrado y los costos de varios elementos.</p>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[50rem]">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                          <th className="p-3 w-32">Precio Compra ({monedaCalc1})</th>
                          <th className="p-3 w-24 text-center">Importar</th>
                          <th className="p-3 w-28 text-center">Costo Imp. %</th>
                          <th className="p-3 w-28">Flete ({monedaCalc1})</th>
                          <th className="p-3 w-36">Precio Venta Cobrado ({monedaCalc1})</th>
                          <th className="p-3 w-32 text-right text-emerald-600 relative group cursor-help select-none">
                            <div className="flex items-center justify-end gap-1">
                              Margen Resultante
                              <Info size={12} className="text-slate-400" />
                            </div>
                            <div className="absolute right-0 top-full mt-1 hidden group-hover:block bg-slate-800 text-white text-[10px] p-2 rounded-lg shadow-lg z-50 w-64 text-left font-normal normal-case leading-relaxed pointer-events-none">
                              Fórmula: Margen Resultante = (1 - ((Costo Compra * (1 + Importación %) + Flete) / Precio Venta)) * 100
                            </div>
                          </th>
                          <th className="p-3 w-16 text-center">Acción</th>
                        </tr>
                      </thead>
                      <tbody>
                        {itemsCalc2.map((item, idx) => {
                          const pCompra = Number(item.precioCompra) || 0;
                          const f = Number(item.flete) || 0;
                          const pVenta = Number(item.precioVenta) || 0;
                          const costImp = item.importar ? (Number(item.costoImportacion) || 0) : 0;
                          const costoBase = pCompra * (1 + costImp / 100);

                          let mText = '-';
                          let mVal = 0;
                          if (pCompra && pVenta > 0) {
                            mVal = (1 - (costoBase + f) / pVenta) * 100;
                            mText = `${mVal.toFixed(2)}%`;
                          } else if (pCompra && pVenta <= 0) {
                            mText = 'Inválido';
                          }

                          const mColor = mVal >= 20 ? 'text-emerald-600 font-bold' : mVal >= 10 ? 'text-amber-600 font-bold' : mVal > 0 ? 'text-rose-500 font-bold' : 'text-slate-400';

                          return (
                            <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                              <td className="p-2 align-middle">
                                <input
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  className="w-full p-1.5 border border-slate-200 rounded text-xs bg-white"
                                  value={item.precioCompra}
                                  onChange={e => {
                                    const list = [...itemsCalc2];
                                    list[idx].precioCompra = Number(e.target.value) || 0;
                                    setItemsCalc2(list);
                                  }}
                                />
                              </td>
                              <td className="p-2 align-middle text-center">
                                <input
                                  type="checkbox"
                                  className="accent-[#07417B] h-4 w-4"
                                  checked={item.importar}
                                  onChange={e => {
                                    const list = [...itemsCalc2];
                                    list[idx].importar = e.target.checked;
                                    setItemsCalc2(list);
                                  }}
                                />
                              </td>
                              <td className="p-2 align-middle">
                                <input
                                  type="number"
                                  min="0"
                                  step="0.5"
                                  disabled={!item.importar}
                                  className="w-full p-1.5 border border-slate-200 rounded text-xs bg-white text-center disabled:opacity-50 disabled:bg-slate-100"
                                  value={item.costoImportacion}
                                  onChange={e => {
                                    const list = [...itemsCalc2];
                                    list[idx].costoImportacion = Number(e.target.value) || 0;
                                    setItemsCalc2(list);
                                  }}
                                />
                              </td>
                              <td className="p-2 align-middle">
                                <input
                                  type="number"
                                  min="0"
                                  step="1"
                                  className="w-full p-1.5 border border-slate-200 rounded text-xs bg-white"
                                  value={item.flete}
                                  onChange={e => {
                                    const list = [...itemsCalc2];
                                    list[idx].flete = Number(e.target.value) || 0;
                                    setItemsCalc2(list);
                                  }}
                                />
                              </td>
                              <td className="p-2 align-middle">
                                <input
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  className="w-full p-1.5 border border-slate-200 rounded text-xs bg-white border-emerald-200 focus:border-emerald-500"
                                  value={item.precioVenta}
                                  onChange={e => {
                                    const list = [...itemsCalc2];
                                    list[idx].precioVenta = Number(e.target.value) || 0;
                                    setItemsCalc2(list);
                                  }}
                                />
                              </td>
                              <td className={`p-2 align-middle text-right text-xs group ${mColor}`}>
                                <div className="flex items-center justify-end gap-1.5">
                                  <span>{mText}</span>
                                  {pCompra && pVenta > 0 ? (
                                    <button onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(mVal.toFixed(2)); }} className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-[#07417B] transition-opacity cursor-pointer" title="Copiar porcentaje puro"><Copy size={12} /></button>
                                  ) : null}
                                </div>
                              </td>
                              <td className="p-2 align-middle text-center">
                                <button
                                  onClick={() => setItemsCalc2(itemsCalc2.filter(x => x.id !== item.id))}
                                  className="text-rose-500 hover:text-rose-750 p-1.5 rounded cursor-pointer"
                                  title="Eliminar elemento"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                      <tfoot>
                        {(() => {
                          const sumCompra = itemsCalc2.reduce((sum, item) => sum + (Number(item.precioCompra) || 0), 0);
                          const sumFlete = itemsCalc2.reduce((sum, item) => sum + (Number(item.flete) || 0), 0);
                          const sumVenta = itemsCalc2.reduce((sum, item) => sum + (Number(item.precioVenta) || 0), 0);

                          const validMargins = itemsCalc2.map(item => {
                            const pCompra = Number(item.precioCompra) || 0;
                            const f = Number(item.flete) || 0;
                            const pVenta = Number(item.precioVenta) || 0;
                            const costImp = item.importar ? (Number(item.costoImportacion) || 0) : 0;
                            const costoBase = pCompra * (1 + costImp / 100);
                            if (pCompra && pVenta > 0) {
                              return (1 - (costoBase + f) / pVenta) * 100;
                            }
                            return null;
                          }).filter(m => m !== null);

                          const avgMargen = validMargins.length > 0 ? (validMargins.reduce((sum, m) => sum + m, 0) / validMargins.length) : 0;

                          return (
                            <tr className="bg-slate-50 border-t-2 border-slate-200 text-xs font-bold text-slate-700">
                              <td colSpan={3} className="p-3 text-slate-500 text-[10px] uppercase font-bold">TOTALES / PROMEDIO (Compra: {formatCurrency(sumCompra)})</td>
                              <td className="p-3">{formatCurrency(sumFlete)}</td>
                              <td className="p-3">{formatCurrency(sumVenta)}</td>
                              <td className="p-3 text-right text-emerald-700 font-extrabold">Prom: {avgMargen.toFixed(1)}%</td>
                              <td className="p-3"></td>
                            </tr>
                          );
                        })()}
                      </tfoot>
                    </table>
                  </div>

                  <button
                    onClick={() => {
                      const nextId = itemsCalc2.length > 0 ? Math.max(...itemsCalc2.map(x => x.id)) + 1 : 1;
                      setItemsCalc2([...itemsCalc2, {
                        id: nextId,
                        precioCompra: 0,
                        importar: false,
                        costoImportacion: 10,
                        flete: monedaCalc1 === 'MXN' ? 350 : 20,
                        precioVenta: 0
                      }]);
                    }}
                    className="flex items-center gap-1.5 bg-[#07417B] text-white px-4 py-2 rounded-lg text-xs font-semibold hover:opacity-90 self-start cursor-pointer shadow-2xs"
                  >
                    <Plus size={13} /> Añadir Elemento
                  </button>
                </div>

                {/* Calculadora 3: Precio Compra de Proveedor */}
                <div className="w-full bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col space-y-4">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 pb-3">
                    <div>
                      <h3 className="font-bold text-sm text-slate-800 flex items-center gap-1.5"><Truck size={16} className="text-[#07417B]" /> 3. Calcular Precio Compra de Proveedor</h3>
                      <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Calcula el precio de compra neto aplicando una cadena de descuentos (en porcentaje o multiplicador) al precio de lista.</p>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[50rem]">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                          <th className="p-3 w-40">Precio Lista ({monedaCalc1})</th>
                          <th className="p-3 w-40 text-center">Modo Descuento</th>
                          <th className="p-3">Cadena de Descuentos (separados por comas)</th>
                          <th className="p-3 w-40 text-right text-emerald-600">Precio Compra Neto</th>
                          <th className="p-3 w-16 text-center">Acción</th>
                        </tr>
                      </thead>
                      <tbody>
                        {itemsCalc3.map((item, idx) => {
                          const pLista = Number(item.precioLista) || 0;
                          const parts = (item.descuentos || '').split(',').map(s => parseFloat(s.trim())).filter(n => !isNaN(n));
                          let result = pLista;
                          if (item.modoDescuento === 'porcentaje') {
                            parts.forEach(d => {
                              result = result * (1 - d / 100);
                            });
                          } else {
                            parts.forEach(m => {
                              result = result * m;
                            });
                          }

                          return (
                            <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                              <td className="p-2 align-middle">
                                <input
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  className="w-full p-1.5 border border-slate-200 rounded text-xs bg-white font-medium"
                                  value={item.precioLista}
                                  onChange={e => {
                                    const list = [...itemsCalc3];
                                    list[idx].precioLista = Number(e.target.value) || 0;
                                    setItemsCalc3(list);
                                  }}
                                />
                              </td>
                              <td className="p-2 align-middle text-center">
                                <div className="flex bg-slate-100 border border-slate-200 p-0.5 rounded-lg text-[10px] w-36 mx-auto select-none">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const list = [...itemsCalc3];
                                      list[idx].modoDescuento = 'porcentaje';
                                      setItemsCalc3(list);
                                    }}
                                    className={`flex-1 py-1 rounded cursor-pointer font-bold transition-all ${item.modoDescuento === 'porcentaje' ? 'bg-white text-[#07417B] shadow-2xs' : 'text-slate-500 hover:text-slate-800'}`}
                                  >
                                    Porcentaje %
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const list = [...itemsCalc3];
                                      list[idx].modoDescuento = 'multiplicador';
                                      setItemsCalc3(list);
                                    }}
                                    className={`flex-1 py-1 rounded cursor-pointer font-bold transition-all ${item.modoDescuento === 'multiplicador' ? 'bg-white text-[#07417B] shadow-2xs' : 'text-slate-500 hover:text-slate-800'}`}
                                  >
                                    Multiplicador
                                  </button>
                                </div>
                              </td>
                              <td className="p-2 align-middle">
                                <input
                                  type="text"
                                  className="w-full p-1.5 border border-slate-200 rounded text-xs bg-white text-center font-medium"
                                  placeholder={item.modoDescuento === 'porcentaje' ? 'ej: 50, 10, 5' : 'ej: 0.5, 0.9, 0.95'}
                                  value={item.descuentos}
                                  onChange={e => {
                                    const list = [...itemsCalc3];
                                    list[idx].descuentos = e.target.value;
                                    setItemsCalc3(list);
                                  }}
                                />
                              </td>
                              <td className="p-2 align-middle text-right font-bold text-slate-700 text-xs group">
                                <div className="flex items-center justify-end gap-1.5">
                                  <span>{formatCurrency(result)}</span>
                                  <button onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(result.toFixed(2)); }} className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-[#07417B] transition-opacity cursor-pointer" title="Copiar número puro"><Copy size={12} /></button>
                                </div>
                              </td>
                              <td className="p-2 align-middle text-center">
                                <button
                                  onClick={() => setItemsCalc3(itemsCalc3.filter(x => x.id !== item.id))}
                                  className="text-rose-500 hover:text-rose-750 p-1.5 rounded cursor-pointer"
                                  title="Eliminar elemento"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                      <tfoot>
                        {(() => {
                          const sumLista = itemsCalc3.reduce((sum, item) => sum + (Number(item.precioLista) || 0), 0);
                          const sumCompraNeto = itemsCalc3.reduce((sum, item) => {
                            const pLista = Number(item.precioLista) || 0;
                            const parts = (item.descuentos || '').split(',').map(s => parseFloat(s.trim())).filter(n => !isNaN(n));
                            let result = pLista;
                            if (item.modoDescuento === 'porcentaje') {
                              parts.forEach(d => {
                                result = result * (1 - d / 100);
                              });
                            } else {
                              parts.forEach(m => {
                                result = result * m;
                              });
                            }
                            return sum + result;
                          }, 0);

                          return (
                            <tr className="bg-slate-50 border-t-2 border-slate-200 text-xs font-bold text-slate-700">
                              <td colSpan={3} className="p-3 text-slate-500 text-[10px] uppercase font-bold">TOTALES (Lista: {formatCurrency(sumLista)})</td>
                              <td className="p-3 text-right text-emerald-700 font-extrabold">{formatCurrency(sumCompraNeto)}</td>
                              <td className="p-3"></td>
                            </tr>
                          );
                        })()}
                      </tfoot>
                    </table>
                  </div>

                  <button
                    onClick={() => {
                      const nextId = itemsCalc3.length > 0 ? Math.max(...itemsCalc3.map(x => x.id)) + 1 : 1;
                      setItemsCalc3([...itemsCalc3, {
                        id: nextId,
                        precioLista: 0,
                        modoDescuento: 'porcentaje',
                        descuentos: ''
                      }]);
                    }}
                    className="flex items-center gap-1.5 bg-[#07417B] text-white px-4 py-2 rounded-lg text-xs font-semibold hover:opacity-90 self-start cursor-pointer shadow-2xs"
                  >
                    <Plus size={13} /> Añadir Elemento
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Table Modal for Codigos */}
          {showTableModal && (
            <div className="fixed inset-0 bg-slate-900/50 z-[100] flex justify-center items-center p-4">
              <div className="bg-white rounded-2xl w-full max-w-7xl shadow-2xl flex flex-col max-h-[90vh]">
                <div className="flex justify-between items-center p-5 border-b border-slate-100">
                  <h3 className="text-lg font-bold text-[#07417B]">Vista de Tabla - Códigos a Facturar</h3>
                  <button onClick={() => setShowTableModal(false)} className="text-slate-400 hover:text-rose-500 transition-colors p-1 rounded-full hover:bg-rose-50"><X size={20} /></button>
                </div>
                <div className="p-5 flex-1 overflow-auto">
                  <table className="w-full text-left border-collapse min-w-[65rem]">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        <th className="p-3 w-40">Código / SKU</th>
                        <th className="p-3">Descripción</th>
                        <th className="p-3 w-20">Moneda</th>
                        <th className="p-3 w-24">P. Origen</th>
                        <th className="p-3 w-24 text-right">P. Unitario ({formOperacion.moneda_cotizacion || 'MXN'})</th>
                        <th className="p-3 w-16">Cant.</th>
                        <th className="p-3 w-24 text-right">Importe</th>

                        <th className="p-3 w-10 text-center"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {codigosList.map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                          <td className="p-2 align-top">
                            <input
                              type="text"
                              className="w-full p-1.5 border border-slate-200 rounded text-xs bg-white focus:border-[#07417B] focus:ring-1 focus:ring-[#07417B] outline-none"
                              value={item.codigo}
                              onChange={e => {
                                const val = e.target.value;
                                const newList = [...codigosList];
                                newList[idx].codigo = val;
                                const prodMatch = catalogoProd.find(p => p.codigo === val);
                                if (prodMatch) {
                                  newList[idx].descripcion = prodMatch.descripcion || '';
                                  newList[idx].codigo_interno = prodMatch.codigo_interno || '';
                                  
                                  const pOrigen = prodMatch.precio ? Math.round((prodMatch.precio / 0.75) + 350) : 0;
                                  const mOrigen = prodMatch.moneda || 'MXN';
                                  newList[idx].precio_origen = pOrigen;
                                  newList[idx].moneda_origen = mOrigen;
                                  
                                  let pu = pOrigen;
                                  const tcVal = Number(formOperacion.tipo_cambio) || 1;
                                  if (mOrigen === 'USD' && formOperacion.moneda_cotizacion === 'MXN') pu = pOrigen * tcVal;
                                  else if (mOrigen === 'MXN' && formOperacion.moneda_cotizacion === 'USD') pu = pOrigen / tcVal;
                                  
                                  newList[idx].precio_unitario = pu;
                                  setFormOperacion(prev => ({ ...prev, Monto: newList.reduce((acc, it) => acc + ((Number(it.cantidad) || 0) * (Number(it.precio_unitario) || 0)), 0) }));
                                }
                                setCodigosList(newList);
                              }}
                              list="productos-datalist"
                            />
                          </td>
                          <td className="p-2 align-top">
                            <textarea
                              className="w-full p-1.5 border border-slate-200 rounded text-xs bg-white resize-y min-h-[30px] focus:border-[#07417B] focus:ring-1 focus:ring-[#07417B] outline-none"
                              rows="1"
                              value={item.descripcion || ''}
                              onChange={e => {
                                const newList = [...codigosList];
                                newList[idx].descripcion = e.target.value;
                                setCodigosList(newList);
                              }}
                            />
                          </td>
                          <td className="p-2 align-top">
                            <select
                              className="w-full p-1.5 border border-slate-200 rounded text-xs bg-white focus:border-[#07417B] focus:ring-1 focus:ring-[#07417B] outline-none"
                              value={item.moneda_origen || formOperacion.moneda_cotizacion || 'MXN'}
                              onChange={e => {
                                const newList = [...codigosList];
                                const mOrigen = e.target.value;
                                const pOrigen = Number(newList[idx].precio_origen !== undefined ? newList[idx].precio_origen : (newList[idx].precio_unitario || 0));
                                newList[idx].moneda_origen = mOrigen;
                                
                                let pu = pOrigen;
                                const tcVal = Number(formOperacion.tipo_cambio) || 1;
                                if (mOrigen === 'USD' && formOperacion.moneda_cotizacion === 'MXN') pu = pOrigen * tcVal;
                                else if (mOrigen === 'MXN' && formOperacion.moneda_cotizacion === 'USD') pu = pOrigen / tcVal;
                                
                                newList[idx].precio_unitario = pu;
                                setCodigosList(newList);
                                setFormOperacion(prev => ({ ...prev, Monto: newList.reduce((acc, it) => acc + ((Number(it.cantidad) || 0) * (Number(it.precio_unitario) || 0)), 0) }));
                              }}
                            >
                              <option value="MXN">MXN</option>
                              <option value="USD">USD</option>
                            </select>
                          </td>
                          <td className="p-2 align-top">
                            <input
                              type="number"
                              className="w-full p-1.5 border border-slate-200 rounded text-xs bg-white focus:border-[#07417B] focus:ring-1 focus:ring-[#07417B] outline-none"
                              value={item.precio_origen !== undefined ? item.precio_origen : (item.precio_unitario || '')}
                              onChange={e => {
                                const newList = [...codigosList];
                                const pOrigen = Number(e.target.value) || 0;
                                const mOrigen = newList[idx].moneda_origen || formOperacion.moneda_cotizacion || 'MXN';
                                newList[idx].precio_origen = pOrigen;
                                
                                let pu = pOrigen;
                                const tcVal = Number(formOperacion.tipo_cambio) || 1;
                                if (mOrigen === 'USD' && formOperacion.moneda_cotizacion === 'MXN') pu = pOrigen * tcVal;
                                else if (mOrigen === 'MXN' && formOperacion.moneda_cotizacion === 'USD') pu = pOrigen / tcVal;
                                
                                newList[idx].precio_unitario = pu;
                                setCodigosList(newList);
                                setFormOperacion(prev => ({ ...prev, Monto: newList.reduce((acc, it) => acc + ((Number(it.cantidad) || 0) * (Number(it.precio_unitario) || 0)), 0) }));
                              }}
                            />
                          </td>
                          <td className="p-2 align-top text-right text-xs font-bold text-slate-700 pt-3">
                            {(item.precio_unitario || 0).toLocaleString('en-US', {minimumFractionDigits: 2})}
                          </td>
                          <td className="p-2 align-top">
                            <input
                              type="number"
                              min="1"
                              className="w-full p-1.5 border border-slate-200 rounded text-xs bg-white focus:border-[#07417B] focus:ring-1 focus:ring-[#07417B] outline-none"
                              value={item.cantidad}
                              onChange={e => {
                                const newList = [...codigosList];
                                newList[idx].cantidad = Number(e.target.value) || 0;
                                setCodigosList(newList);
                                setFormOperacion(prev => ({ ...prev, Monto: newList.reduce((acc, it) => acc + ((Number(it.cantidad) || 0) * (Number(it.precio_unitario) || 0)), 0) }));
                              }}
                            />
                          </td>
                          <td className="p-2 align-top text-right text-xs font-bold text-[#07417B] pt-3">
                            {((item.cantidad || 0) * (item.precio_unitario || 0)).toLocaleString('en-US', {minimumFractionDigits: 2})}
                          </td>

                          <td className="p-2 align-top text-center">
                            <button
                              onClick={() => {
                                const newList = codigosList.filter((_, i) => i !== idx);
                                setCodigosList(newList);
                                setFormOperacion(prev => ({ ...prev, Monto: newList.reduce((acc, it) => acc + ((Number(it.cantidad) || 0) * (Number(it.precio_unitario) || 0)), 0) }));
                              }}
                              className="text-rose-500 hover:bg-rose-50 p-1.5 mt-0.5 rounded cursor-pointer"
                            >
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <button
                    type="button"
                    onClick={() => setCodigosList([...codigosList, { codigo: '', codigo_interno: '', cantidad: 1, entregado: false, faltantes: 0, descripcion: '', precio_unitario: 0, precio_origen: 0, moneda_origen: formOperacion.moneda_cotizacion || 'MXN', tiempo_entrega: '' }])}
                    className="flex items-center gap-1.5 bg-[#07417B] text-white px-4 py-2 rounded-lg text-xs font-semibold hover:opacity-90 mt-4 cursor-pointer"
                  >
                    <Plus size={13} /> Añadir Fila
                  </button>
                </div>
                <div className="p-5 border-t border-slate-100 flex justify-end items-center gap-6 bg-slate-50 rounded-b-2xl">
                  <div className="flex items-center gap-3 font-bold text-slate-700">
                    <span className="uppercase text-[10px] text-slate-500">Monto Total ({formOperacion.moneda_cotizacion || 'MXN'}):</span>
                    <span className="text-xl text-[#07417B]">{Number(formOperacion.Monto || 0).toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
                  </div>
                  <button onClick={() => setShowTableModal(false)} className="px-6 py-2 bg-[#07417B] text-white rounded-lg text-sm font-bold hover:opacity-90 cursor-pointer">Guardar y Cerrar Tabla</button>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
