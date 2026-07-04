import React, { useState, useMemo } from 'react';
import { 
  Plus, EyeOff, ListFilter, Edit2, Download, X, 
  CalendarDays, Maximize2, Trash2, ExternalLink, Copy, FileText, ArrowRightLeft,
  ChevronUp, ChevronDown
} from 'lucide-react';

const badgeColors = {
  // Categorías
  "Cotización": "bg-sky-100 text-sky-800 border border-sky-200 badge-pulse",
  "En SP": "bg-orange-100 text-orange-800 border border-orange-200",
  "Orden de compra": "bg-amber-100 text-amber-800 border border-amber-200",
  "Facturar": "bg-emerald-100 text-emerald-800 border border-emerald-200",
  "Terminado": "bg-green-100 text-green-800 border border-green-200",
  "Garantía": "bg-rose-100 text-rose-800 border border-rose-200",
  "Tarea": "bg-purple-100 text-purple-800 border border-purple-200",
  "Visitas": "bg-teal-100 text-teal-800 border border-teal-200",
  "Cancelado": "bg-slate-200 text-slate-700 border border-slate-300",
  
  // Estatus / Prioridad
  "Nueva": "bg-slate-100 text-slate-700 border border-slate-200",
  "Enviada": "bg-blue-100 text-blue-700 border border-blue-200",
  "En revisión": "bg-amber-100 text-amber-700 border border-amber-200",
  "Aprobada": "bg-emerald-100 text-emerald-700 border border-emerald-200",
  "Rechazada": "bg-rose-100 text-rose-700 border border-rose-200",
  "Pausada": "bg-orange-100 text-orange-700 border border-orange-200",
  "Baja": "bg-slate-100 text-slate-600 border border-slate-200",
  "Media": "bg-blue-100 text-blue-600 border border-blue-200",
  "Alta": "bg-orange-100 text-orange-600 border border-orange-200",
  "Crítica": "bg-rose-100 text-rose-600 border border-rose-200",
  
  // Progreso
  "No iniciado": "bg-slate-100 text-slate-600 border border-slate-200",
  "En curso": "bg-amber-100 text-amber-600 border border-amber-200",
  "Retraso de proveedor": "bg-rose-100 text-rose-600 border border-rose-200",
  "En Certificación": "bg-indigo-100 text-indigo-600 border border-indigo-200",
  "Completado": "bg-emerald-100 text-emerald-600 border border-emerald-200"
};

const OpcionesSelect = {
  Estatus: ["Nueva", "Enviada", "En revisión", "Aprobada", "Rechazada", "Pausada"],
  Prioridad: ["Baja", "Media", "Alta", "Crítica"],
  Categoría: ["Cotización", "En SP", "Orden de compra", "Facturar", "Terminado", "Garantía", "Tarea", "Visitas", "Cancelado"],
  Progreso: ["No iniciado", "En curso", "Retraso de proveedor", "En Certificación", "Completado"],
};

function ModalDetalleFila({ filaEnEdicion, setFilaEnEdicion, onSaveRow, setData, data, columnas, equipos, masterClientes, getOptionsForCol }) {
  const [formData, setFormData] = React.useState({ ...filaEnEdicion });

  const handleChange = (colKey, val) => {
    let updated = { ...formData, [colKey]: val };
    if (colKey === 'num_cliente') {
      const c = masterClientes?.find(x => x.numero.toLowerCase() === val.toLowerCase());
      if (c) {
         updated.Cliente = c.empresa;
         updated.equipo_id = c.equipo_id || "";
      }
    }
    setFormData(updated);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (onSaveRow) {
      onSaveRow(formData);
    } else {
      setData(data.map(r => r.id === formData.id ? formData : r));
    }
    setFilaEnEdicion(null);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-[70] flex items-center justify-center animate-in fade-in" onClick={() => setFilaEnEdicion(null)}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
        <div className="bg-[#07417B] p-4 flex justify-between items-center text-white shrink-0">
          <h3 className="font-bold text-lg flex items-center gap-2"><Maximize2 size={18}/> Detalle del Registro</h3>
          <button onClick={() => setFilaEnEdicion(null)} className="text-blue-100 hover:text-white transition-colors"><X size={20}/></button>
        </div>
        <div className="p-6 overflow-y-auto flex-1 bg-slate-50">
          <form id="detalle-form" onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {columnas.map(col => (
              <div key={col.key} className={col.key === 'Pedido' ? 'col-span-1 md:col-span-2' : ''}>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">{col.label}</label>
                {col.type === 'select' && !col.isTeam ? (
                  <select className="w-full p-2 mt-1 border border-slate-300 rounded-lg text-sm bg-white" value={formData[col.key] || ''} onChange={(e) => handleChange(col.key, e.target.value)}>
                    <option value="">Seleccione...</option>
                    {getOptionsForCol(col.key)?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                ) : col.isTeam ? (
                  <select className="w-full p-2 mt-1 border border-slate-300 rounded-lg text-sm bg-white" value={formData[col.key] || ''} onChange={(e) => handleChange(col.key, e.target.value)}>
                    <option value="">Seleccione Equipo...</option>
                    {equipos?.map(eq => <option key={eq.id} value={eq.id}>{eq.nombre}</option>)}
                  </select>
                ) : (
                  <input type={col.type === 'number' ? 'number' : col.type === 'date' ? 'date' : 'text'} className="w-full p-2 mt-1 border border-slate-300 rounded-lg text-sm bg-white" value={formData[col.key] || ''} onChange={(e) => handleChange(col.key, col.type === 'number' ? Number(e.target.value) : e.target.value)} readOnly={col.key === 'Cliente' && !!formData.num_cliente} />
                )}
              </div>
            ))}
          </form>
        </div>
        <div className="bg-white border-t border-slate-200 p-4 flex justify-end gap-3 shrink-0">
           <button onClick={() => setFilaEnEdicion(null)} className="px-4 py-2 rounded-lg font-semibold text-slate-600 hover:bg-slate-100 text-sm transition-colors">Cancelar</button>
           <button type="submit" form="detalle-form" className="px-4 py-2 rounded-lg font-semibold bg-[#07417B] text-white shadow-sm text-sm hover:opacity-90 transition-opacity">Guardar Cambios</button>
        </div>
      </div>
    </div>
  );
}

export default function DynamicTable({ 
  title, 
  icon: Icon, 
  data, 
  setData, 
  columnas, 
  setColumnas, 
  globalSearch, 
  onOpenRelationalModal, 
  masterClientes, 
  equipos, 
  onDeleteRequest,
  onSaveRow,
  onAddRow,
  onEditRow,
  onNotification,
  configOpciones,
  onEditOptions,
  onGeneratePDF,
  onOpenRules,
  onAddColumnaGlobal,
  onDeleteColumnaGlobal
}) {
  const [agruparPor, setAgruparPor] = useState('');
  const [celdaEditando, setCeldaEditando] = useState({ id: null, key: null });
  const [filaEnEdicion, setFilaEnEdicion] = useState(null); 
  const [menuColumnasAbierto, setMenuColumnasAbierto] = useState(false);
  const [menuDescargaAbierto, setMenuDescargaAbierto] = useState(false);
  const [showNuevaColumna, setShowNuevaColumna] = useState(false);
  const [nuevaColForm, setNuevaColForm] = useState({ label: '', type: 'text' });
  
  const currDate = new Date();
  const firstDay = new Date(currDate.getFullYear(), currDate.getMonth(), 1).toISOString().split('T')[0];
  const lastDay = new Date(currDate.getFullYear(), currDate.getMonth() + 1, 0).toISOString().split('T')[0];
  
  const [fechaInicioReporte, setFechaInicioReporte] = useState(firstDay);
  const [fechaFinReporte, setFechaFinReporte] = useState(lastDay);
  const [equipoReporte, setEquipoReporte] = useState('Todos');
  const [filtroFechaActivo, setFiltroFechaActivo] = useState(null);
  const [columnWidths, setColumnWidths] = useState(() => {
    try {
      const saved = localStorage.getItem(`col_widths_${title}`);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  React.useEffect(() => {
    localStorage.setItem(`col_widths_${title}`, JSON.stringify(columnWidths));
  }, [columnWidths, title]);

  const getOptionsForCol = (colKey) => {
    if (!configOpciones) return OpcionesSelect[colKey] || [];
    const config = configOpciones.find(c => c.columna === colKey);
    if (config && config.opciones) {
      try {
        const parsed = JSON.parse(config.opciones);
        return parsed.map(p => p.text);
      } catch (e) {
        return OpcionesSelect[colKey] || [];
      }
    }
    return OpcionesSelect[colKey] || [];
  };

  const iniciarRedimensionado = (e, colKey) => {
    e.preventDefault();
    const th = e.target.parentElement;
    const startX = e.clientX;
    const startWidth = th.getBoundingClientRect().width;

    const handleMouseMove = (moveEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const newWidth = Math.max(60, startWidth + deltaX);
      setColumnWidths(prev => ({
        ...prev,
        [colKey]: newWidth
      }));
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const formatCurrency = (val) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(val || 0);

  const handleAddRow = () => {
    if (onAddRow) {
      onAddRow();
    } else {
      const nuevo = { 
        id: 0, 
        Pedido: "Nuevo Registro", 
        No_Cotizacion: "", 
        num_cliente: "", 
        Cliente: "", 
        Categoría: "Cotización", 
        Prioridad: "Baja", 
        Estatus: "Nueva", 
        Progreso: "No iniciado", 
        Monto: 0, 
        Margen: 0, 
        Entrega: new Date().toISOString().split('T')[0], 
        equipo_id: equipos[0]?.id || "", 
        dias_abierta: 0 
      };
      setData([nuevo, ...data]);
    }
  };

  const toggleColumna = (key) => {
    setColumnas(columnas.map(c => c.key === key ? { ...c, visible: !c.visible } : c));
  };
  
  const moveColumna = (index, direction) => {
    const newCols = [...columnas];
    if (direction === 'up' && index > 0) {
      [newCols[index - 1], newCols[index]] = [newCols[index], newCols[index - 1]];
      setColumnas(newCols);
    } else if (direction === 'down' && index < newCols.length - 1) {
      [newCols[index + 1], newCols[index]] = [newCols[index], newCols[index + 1]];
      setColumnas(newCols);
    }
  };

  const deleteColumna = (key) => {
    if (onDeleteColumnaGlobal) {
      onDeleteColumnaGlobal(key);
    } else {
      setColumnas(columnas.filter(c => c.key !== key));
    }
  };

  const handleAddColumna = () => {
    if (!nuevaColForm.label.trim()) return;
    const key = `custom_${Date.now()}`;
    const newCol = { key, label: nuevaColForm.label, visible: true, type: nuevaColForm.type, custom: true };
    if (onAddColumnaGlobal) {
      onAddColumnaGlobal(newCol);
    } else {
      setColumnas([...columnas, newCol]);
    }
    setNuevaColForm({ label: '', type: 'text' });
    setShowNuevaColumna(false);
  };
  
  const actualizarDato = (id, key, valor) => {
    // Buscar el registro para actualizarlo en caliente
    const targetRow = data.find(r => r.id === id);
    if (!targetRow) return;
    
    let updatedRow = { ...targetRow, [key]: valor };
    
    // Auto-completado de Cliente a partir del num_cliente
    if (key === 'num_cliente') {
      const clienteRef = masterClientes.find(c => c.numero.toLowerCase() === valor.toLowerCase());
      if (clienteRef) {
        updatedRow.Cliente = clienteRef.empresa;
        updatedRow.equipo_id = clienteRef.equipo_id || "";
      }
    }

    if (onSaveRow) {
      onSaveRow(updatedRow);
    } else {
      setData(data.map(row => row.id === id ? updatedRow : row));
    }
    setCeldaEditando({ id: null, key: null });
  };

  // Filtrado y Búsqueda global combinada
  const dataFiltradaYBuscada = useMemo(() => {
    let result = data;
    
    // Filtro por fecha (Mes/Año) y Equipo
    if (filtroFechaActivo) {
      result = result.filter(row => {
        let matchFecha = true;
        if (filtroFechaActivo.inicio && filtroFechaActivo.fin) {
          if (!row.Entrega) return false;
          matchFecha = row.Entrega >= filtroFechaActivo.inicio && row.Entrega <= filtroFechaActivo.fin;
        }
        
        let matchEquipo = true;
        if (filtroFechaActivo.equipo && filtroFechaActivo.equipo !== 'Todos') {
          matchEquipo = row.equipo_id === filtroFechaActivo.equipo;
        }
        
        return matchFecha && matchEquipo;
      });
    }
    
    // Búsqueda global en Topbar
    if (globalSearch) {
      const s = globalSearch.toLowerCase();
      result = result.filter(row => 
        (row.Pedido && row.Pedido.toLowerCase().includes(s)) ||
        (row.Cliente && row.Cliente.toLowerCase().includes(s)) ||
        (row.Proveedor && row.Proveedor.toLowerCase().includes(s)) ||
        (row.No_Cotizacion && row.No_Cotizacion.toLowerCase().includes(s)) ||
        (row.num_cliente && row.num_cliente.toLowerCase().includes(s)) ||
        (row.num_proveedor && row.num_proveedor.toLowerCase().includes(s)) ||
        (row.Estatus && row.Estatus.toLowerCase().includes(s)) ||
        (row.Prioridad && row.Prioridad.toLowerCase().includes(s)) ||
        (row.Progreso && row.Progreso.toLowerCase().includes(s)) ||
        (row.Categoría && row.Categoría.toLowerCase().includes(s)) ||
        (row.codigos_facturar && row.codigos_facturar.toLowerCase().includes(s)) ||
        (row.notas && row.notas.toLowerCase().includes(s)) ||
        (row.ref_cliente && row.ref_cliente.toLowerCase().includes(s)) ||
        (row.ref_proveedor && row.ref_proveedor.toLowerCase().includes(s)) ||
        (row.no_sp_ptt && row.no_sp_ptt.toLowerCase().includes(s)) ||
        (row.guia && row.guia.toLowerCase().includes(s)) ||
        (row.contacto_cliente && row.contacto_cliente.toLowerCase().includes(s)) ||
        (row.vendedor && row.vendedor.toLowerCase().includes(s)) ||
        (row.coordinacion && row.coordinacion.toLowerCase().includes(s)) ||
        (row.grupo_materiales && row.grupo_materiales.toLowerCase().includes(s))
      );
    }
    
    if (sortConfig.key) {
      result = [...result].sort((a, b) => {
        let valA = a[sortConfig.key];
        let valB = b[sortConfig.key];

        if (valA === null || valA === undefined) valA = '';
        if (valB === null || valB === undefined) valB = '';

        // Fechas
        if (typeof valA === 'string' && valA.match(/^\d{4}-\d{2}-\d{2}$/)) {
          valA = new Date(valA).getTime();
          valB = new Date(valB).getTime() || 0;
        } else if (typeof valA === 'string') {
          valA = valA.toString().toLowerCase();
          valB = valB.toString().toLowerCase();
        }

        if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
        if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    
    return result;
  }, [data, filtroFechaActivo, globalSearch, sortConfig]);

  const descargarReporteCSV = () => {
    const filtrados = data.filter(row => {
      let matchFecha = true;
      if (fechaInicioReporte && fechaFinReporte) {
        if(!row.Entrega) return false;
        matchFecha = row.Entrega >= fechaInicioReporte && row.Entrega <= fechaFinReporte;
      }

      let matchEquipo = true;
      if (equipoReporte && equipoReporte !== 'Todos') {
        matchEquipo = row.equipo_id === equipoReporte;
      }

      return matchFecha && matchEquipo;
    });
    if(filtrados.length === 0) {
      if (onNotification) {
        onNotification("No hay registros con los filtros seleccionados.", "error");
      } else {
        alert("No hay registros con los filtros seleccionados.");
      }
      return;
    }
    const visibleCols = columnas.filter(c => c.visible);
    const headers = visibleCols.map(c => c.label).join(',');
    const csvRows = filtrados.map(row => 
      visibleCols.map(c => {
        let val = row[c.key];
        if (val === null || val === undefined) val = '';
        if (c.isTeam && equipos) {
          const eq = equipos.find(e => e.id === val);
          if (eq) val = eq.nombre;
        }
        return `"${val.toString().replace(/"/g, '""')}"`;
      }).join(',')
    ).join('\n');
    
    const csvContent = `\ufeff${headers}\n${csvRows}`;
    let nameSuffix = `${fechaInicioReporte}_a_${fechaFinReporte}`;
    if (equipoReporte && equipoReporte !== 'Todos' && equipos) {
      const eq = equipos.find(e => e.id === equipoReporte);
      if (eq) nameSuffix += `_${eq.nombre.replace(/\s+/g, '_')}`;
    }
    const filename = `Reporte_${title.replace(/\s+/g, '_')}_${nameSuffix}.csv`;
    
    if (window.pywebview && window.pywebview.api && window.pywebview.api.save_csv) {
      window.pywebview.api.save_csv(filename, csvContent).then(saved => {
        if (saved && onNotification) {
          onNotification("CSV guardado exitosamente.", "success");
        }
      }).catch(err => {
        console.error("Error guardando CSV nativo:", err);
        if (onNotification) onNotification("Hubo un error al guardar el CSV.", "error");
      });
    } else {
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      link.click();
    }
    setMenuDescargaAbierto(false);
  };

  const datosAgrupados = useMemo(() => {
    if (!agruparPor) return { "Todos": dataFiltradaYBuscada };
    return dataFiltradaYBuscada.reduce((acc, row) => {
      let grupo = row[agruparPor] || "Sin asignar";
      // Si agrupamos por equipo comercial, buscar nombre legible
      if (agruparPor === 'equipo_id') {
        const eq = equipos.find(e => e.id === grupo);
        grupo = eq ? eq.nombre : "Sin Equipo";
      }
      if (!acc[grupo]) acc[grupo] = [];
      acc[grupo].push(row);
      return acc;
    }, {});
  }, [dataFiltradaYBuscada, agruparPor, equipos]);

  const totales = useMemo(() => {
    const calc = {};
    columnas.filter(c => c.visible && c.calc).forEach(col => {
      const sum = dataFiltradaYBuscada.reduce((a, b) => a + (Number(b[col.key]) || 0), 0);
      calc[col.key] = col.calc === 'avg' ? (sum / (dataFiltradaYBuscada.length || 1)).toFixed(1) : sum;
    });
    return calc;
  }, [dataFiltradaYBuscada, columnas]);



  const getBadgeColor = (colKey, val) => {
    if (!val) return 'bg-slate-100 text-slate-700 border border-slate-200';
    if (configOpciones && Array.isArray(configOpciones)) {
      const config = configOpciones.find(c => c.columna === colKey);
      if (config && config.opciones) {
        try {
          const parsed = JSON.parse(config.opciones);
          if (Array.isArray(parsed)) {
            const match = parsed.find(o => o.text === val || o.text.toLowerCase() === String(val).toLowerCase());
            if (match && match.color) {
              let color = match.color;
              if (!color.includes('border')) {
                const bgPart = color.split(' ')[0];
                const borderPart = bgPart.replace('bg-', 'border-').replace('100', '200');
                color = `${color} border ${borderPart}`;
              }
              return color;
            }
          }
        } catch (e) {}
      }
    }
    return badgeColors[val] || 'bg-slate-100 text-slate-700 border border-slate-200';
  };

  const RenderCell = ({ row, col }) => {
    const isEditing = celdaEditando.id === row.id && celdaEditando.key === col.key;
    const value = row[col.key] || '';

    if (isEditing) {
      if (col.type === 'select' && !col.isTeam) {
        return (
          <select autoFocus className="w-full border-[#07417B] ring-1 ring-[#07417B] rounded p-1 text-sm bg-white" value={value} onChange={(e) => actualizarDato(row.id, col.key, e.target.value)} onBlur={() => setCeldaEditando({ id: null, key: null })}>
            <option value="">Seleccione...</option>
            {getOptionsForCol(col.key)?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        );
      }
      if (col.isTeam) {
        return (
          <select autoFocus className="w-full border-[#07417B] ring-1 ring-[#07417B] rounded p-1 text-sm bg-white" value={value} onChange={(e) => actualizarDato(row.id, col.key, e.target.value)} onBlur={() => setCeldaEditando({ id: null, key: null })}>
            <option value="">Seleccione Equipo...</option>
            {equipos.map(eq => <option key={eq.id} value={eq.id}>{eq.nombre}</option>)}
          </select>
        );
      }
      return (
        <input autoFocus type={col.type === 'number' ? 'number' : col.type === 'date' ? 'date' : 'text'} className="w-full border-[#07417B] ring-1 ring-[#07417B] rounded p-1 text-sm" defaultValue={value} onBlur={(e) => actualizarDato(row.id, col.key, col.type === 'number' ? Number(e.target.value) : e.target.value)} onKeyDown={(e) => e.key === 'Enter' && actualizarDato(row.id, col.key, col.type === 'number' ? Number(e.target.value) : e.target.value)} />
      );
    }

    let displayValue = value;
    if (col.type === 'number' && col.key === 'Monto') {
      displayValue = formatCurrency(value);
      if (row.moneda_cotizacion && row.moneda_cotizacion !== 'MXN' && row.monto_original) {
        displayValue = `${displayValue} MXN (${formatCurrency(row.monto_original)} ${row.moneda_cotizacion})`;
      }
    } else if (col.type === 'number' && col.key === 'Margen') {
      displayValue = `${value}%`;
    } else if (col.type === 'number' && typeof value === 'number') {
      displayValue = value.toLocaleString('en-US');
    }

    if (col.type === 'date' && value) {
      try {
        const d = new Date(value + 'T12:00:00');
        if (!isNaN(d)) {
          displayValue = d.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' });
        }
      } catch {}
    }

    if (col.isTeam) {
      const eq = equipos.find(e => e.id === value);
      displayValue = eq ? eq.nombre : '-';
    }
    if (col.key === 'codigos_facturar' && value) {
      try {
        const parsed = JSON.parse(value);
        if (Array.isArray(parsed)) {
          displayValue = parsed.map(item => `${item.codigo} (${item.cantidad}pz${item.entregado ? ' - Completo' : item.faltantes > 0 ? `, faltan ${item.faltantes}` : ''})`).join(', ');
        }
      } catch {
        displayValue = value;
      }
    }

    const isLinkedClient = col.key === 'Cliente' && row.num_cliente;
    const isCopyable = col.type === 'text' && displayValue && !col.isTeam;

    const handleCopy = (e, text) => {
      e.stopPropagation();
      navigator.clipboard.writeText(text);
      // Optional visual feedback could go here
    };

    return (
      <div onDoubleClick={() => setCeldaEditando({ id: row.id, key: col.key })} className="w-full h-full cursor-pointer p-1 rounded group flex justify-between items-center hover:bg-slate-100/50 transition-colors">
        {isLinkedClient ? (
           <span onClick={(e) => { e.stopPropagation(); onOpenRelationalModal('cliente', row.num_cliente); }} className="text-[#07417B] hover:underline flex items-center gap-1 font-medium select-none">
             {displayValue} <ExternalLink size={12} className="opacity-50" />
           </span>
        ) : (
           <span className={col.type === 'select' && !col.isTeam && displayValue ? `font-semibold px-2.5 py-0.5 rounded-full text-[11px] uppercase tracking-wide ${getBadgeColor(col.key, value)}` : col.isTeam ? 'text-xs font-bold text-slate-600' : ''}>
             {displayValue || (col.type === 'select' && !col.isTeam ? '-' : '')}
           </span>
        )}
        <div className="flex items-center">
          {isCopyable && <Copy size={11} onClick={(e) => handleCopy(e, value)} className="opacity-0 group-hover:opacity-60 text-slate-400 hover:text-[#07417B] shrink-0 ml-1 transition-opacity cursor-pointer" title="Copiar" />}
          <Edit2 size={11} className="opacity-0 group-hover:opacity-50 text-slate-400 shrink-0 ml-2" />
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 h-full flex flex-col animate-in fade-in duration-300">
      {filaEnEdicion && (
        <ModalDetalleFila 
          filaEnEdicion={filaEnEdicion}
          setFilaEnEdicion={setFilaEnEdicion}
          onSaveRow={onSaveRow}
          setData={setData}
          data={data}
          columnas={columnas}
          equipos={equipos}
          masterClientes={masterClientes}
          getOptionsForCol={getOptionsForCol}
        />
      )}
      
      {/* Cabecera */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Icon className="text-[#07417B]" /> {title}
            {filtroFechaActivo && (
              <span className="ml-2 text-xs font-medium bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full flex items-center gap-1">
                <CalendarDays size={12}/> {filtroFechaActivo.inicio} a {filtroFechaActivo.fin}
                <X size={12} className="cursor-pointer ml-1 hover:text-emerald-950" onClick={() => setFiltroFechaActivo(null)} />
              </span>
            )}
          </h2>
          <p className="text-xs text-slate-500 mt-1">Doble clic en cualquier celda para editar el valor inmediatamente.</p>
        </div>
        
        {/* Barra de herramientas */}
        <div className="flex flex-wrap gap-2 relative w-full xl:w-auto">
          {/* Reporte modal trigger */}
          <div className="relative">
            <button onClick={() => setMenuDescargaAbierto(!menuDescargaAbierto)} className={`flex items-center gap-2 border px-4 py-2 rounded-lg text-sm font-medium shadow-xs transition-colors cursor-pointer ${filtroFechaActivo ? 'bg-emerald-50 border-emerald-300 text-emerald-700 hover:bg-emerald-100' : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'}`}>
              <Download size={15}/> Reporte
            </button>
            {menuDescargaAbierto && (
              <div className="absolute left-0 xl:right-0 xl:left-auto mt-2 w-64 bg-white border border-slate-200 rounded-lg shadow-xl z-50 p-4">
                <p className="text-xs font-bold text-slate-500 mb-3 uppercase tracking-wide">Filtros de Reporte</p>
                <div className="flex gap-2 mb-3">
                  <div className="w-1/2">
                    <label className="text-[10px] text-slate-500 font-bold uppercase mb-1 block">Desde</label>
                    <input type="date" value={fechaInicioReporte} onChange={e=>setFechaInicioReporte(e.target.value)} className="w-full p-2 border border-slate-300 rounded text-sm bg-white" />
                  </div>
                  <div className="w-1/2">
                    <label className="text-[10px] text-slate-500 font-bold uppercase mb-1 block">Hasta</label>
                    <input type="date" value={fechaFinReporte} onChange={e=>setFechaFinReporte(e.target.value)} className="w-full p-2 border border-slate-300 rounded text-sm bg-white" />
                  </div>
                </div>
                {equipos && equipos.length > 0 && (
                  <div className="mb-3">
                    <select value={equipoReporte} onChange={e=>setEquipoReporte(e.target.value)} className="w-full p-2 border border-slate-300 rounded text-sm bg-white">
                      <option value="Todos">Todos los equipos</option>
                      {equipos.map(eq => <option key={eq.id} value={eq.id}>{eq.nombre}</option>)}
                    </select>
                  </div>
                )}
                <div className="space-y-2">
                  <button onClick={() => { setFiltroFechaActivo({ inicio: fechaInicioReporte, fin: fechaFinReporte, equipo: equipoReporte }); setMenuDescargaAbierto(false); }} className="w-full bg-slate-100 text-slate-700 text-xs font-semibold py-2 rounded-md hover:bg-slate-200 cursor-pointer flex items-center justify-center gap-2"><ListFilter size={14}/> Filtrar Vista</button>
                  <button onClick={descargarReporteCSV} className="w-full bg-[#07417B] text-white text-xs font-semibold py-2 rounded-md hover:opacity-90 cursor-pointer flex items-center justify-center gap-2"><Download size={14}/> Descargar CSV</button>
                </div>
              </div>
            )}
          </div>
          
          {/* Agrupar */}
          <div className="flex items-center bg-white border border-slate-300 rounded-lg px-3 shadow-xs">
            <ListFilter size={15} className="text-slate-400 mr-2"/>
            <select className="bg-transparent outline-none text-xs text-slate-700 py-2 cursor-pointer font-medium" value={agruparPor} onChange={e => setAgruparPor(e.target.value)}>
              <option value="">Sin Agrupar</option>
              {columnas.filter(c => c.type === 'select' || c.key === 'Cliente' || c.isTeam).map(c => <option key={c.key} value={c.key}>Agrupar por {c.label}</option>)}
            </select>
          </div>
          
          {/* Selector de Columnas */}
          <div className="relative">
            <button onClick={() => setMenuColumnasAbierto(!menuColumnasAbierto)} className="flex items-center gap-2 bg-white border border-slate-300 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-50 cursor-pointer shadow-xs"><EyeOff size={15}/> Columnas</button>
            {menuColumnasAbierto && (
              <div className="absolute right-0 mt-2 w-72 bg-white border border-slate-200 rounded-lg shadow-xl z-50 p-2 max-h-96 overflow-y-auto">
                <p className="text-[10px] font-bold text-slate-400 px-2 pb-2 mb-2 border-b border-slate-100 uppercase tracking-wide">Columnas Visibles</p>
                {columnas.map((col, index) => (
                  <div key={col.key} className="flex items-center justify-between px-2 py-1.5 hover:bg-slate-50 rounded-md group">
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-600 flex-1 truncate">
                      <input type="checkbox" checked={col.visible} onChange={() => toggleColumna(col.key)} className="accent-[#07417B]" /> {col.label}
                    </label>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => moveColumna(index, 'up')} className="text-slate-400 hover:text-[#07417B] p-0.5 rounded disabled:opacity-30" disabled={index === 0} title="Subir"><ChevronUp size={14}/></button>
                      <button onClick={() => moveColumna(index, 'down')} className="text-slate-400 hover:text-[#07417B] p-0.5 rounded disabled:opacity-30" disabled={index === columnas.length - 1} title="Bajar"><ChevronDown size={14}/></button>
                      {onEditOptions && col.type === 'select' && !col.isTeam && (
                        <button 
                          onClick={() => onEditOptions(col.key, col.label, getOptionsForCol(col.key))} 
                          className="text-slate-400 hover:text-[#07417B] p-0.5 rounded" 
                          title="Editar opciones"
                        >
                          <Edit2 size={12}/>
                        </button>
                      )}
                      {col.custom && (
                        <button onClick={() => deleteColumna(col.key)} className="text-slate-400 hover:text-rose-500 p-0.5 rounded" title="Eliminar Columna"><Trash2 size={12}/></button>
                      )}
                    </div>
                  </div>
                ))}
                
                {showNuevaColumna ? (
                  <div className="mt-2 p-2 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                    <input type="text" placeholder="Nombre de columna" className="w-full p-1.5 border border-slate-300 rounded text-xs bg-white" value={nuevaColForm.label} onChange={e => setNuevaColForm({...nuevaColForm, label: e.target.value})} autoFocus/>
                    <select className="w-full p-1.5 border border-slate-300 rounded text-xs bg-white" value={nuevaColForm.type} onChange={e => setNuevaColForm({...nuevaColForm, type: e.target.value})}>
                      <option value="text">Texto</option>
                      <option value="number">Número</option>
                      <option value="date">Fecha</option>
                      <option value="select">Lista (Select)</option>
                    </select>
                    <div className="flex justify-end gap-2 pt-1">
                      <button onClick={() => setShowNuevaColumna(false)} className="text-xs text-slate-500 hover:text-slate-700 font-medium px-2 py-1">Cancelar</button>
                      <button onClick={handleAddColumna} className="text-xs bg-[#07417B] text-white px-2.5 py-1 rounded font-bold hover:opacity-90 disabled:opacity-50" disabled={!nuevaColForm.label.trim()}>Guardar</button>
                    </div>
                  </div>
                ) : (
                  <button onClick={() => setShowNuevaColumna(true)} className="w-full mt-2 flex items-center justify-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold py-1.5 rounded transition-colors"><Plus size={14} /> Nueva Columna</button>
                )}
              </div>
            )}
          </div>
          
          {/* Reglas de Flujo */}
          {onOpenRules && (
            <button 
              onClick={onOpenRules} 
              className="flex items-center gap-2 bg-[#07417B]/10 border border-[#07417B]/20 text-[#07417B] px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#07417B]/20 cursor-pointer shadow-xs transition-colors"
            >
              <ArrowRightLeft size={15} /> Reglas
            </button>
          )}

          {/* Botón Nuevo */}
          <button onClick={handleAddRow} className="flex items-center gap-2 bg-[#07417B] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity shadow-xs cursor-pointer"><Plus size={15}/> Nuevo</button>
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden flex-1 flex flex-col">
        <div className="overflow-auto flex-1">
          <table className="w-full text-left border-collapse min-w-max">
            <thead className="sticky top-0 bg-slate-50 z-10 shadow-xs">
              <tr>
                {columnas.filter(c => c.visible).map(col => (
                  <th 
                    key={col.key} 
                    className="p-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200 relative select-none hover:bg-slate-100 transition-colors cursor-pointer group"
                    style={{ 
                      width: columnWidths[col.key] ? `${columnWidths[col.key]}px` : undefined, 
                      minWidth: columnWidths[col.key] ? `${columnWidths[col.key]}px` : undefined 
                    }}
                    onClick={() => {
                      let direction = 'asc';
                      if (sortConfig.key === col.key && sortConfig.direction === 'asc') {
                        direction = 'desc';
                      } else if (sortConfig.key === col.key && sortConfig.direction === 'desc') {
                        setSortConfig({ key: null, direction: 'asc' });
                        return;
                      }
                      setSortConfig({ key: col.key, direction });
                    }}
                  >
                    <div className="flex items-center gap-1">
                      <span>{col.label}</span>
                      <span className={`opacity-0 group-hover:opacity-50 transition-opacity ${sortConfig.key === col.key ? '!opacity-100 text-[#07417B]' : ''}`}>
                        {sortConfig.key === col.key ? (
                          sortConfig.direction === 'asc' ? '↑' : '↓'
                        ) : '↕'}
                      </span>
                    </div>
                    <div 
                      onMouseDown={(e) => { e.stopPropagation(); iniciarRedimensionado(e, col.key); }}
                      className="absolute right-0 top-0 h-full w-1 cursor-col-resize hover:bg-[#07417B]/40 hover:w-1.5 active:bg-[#07417B]/60 active:w-1.5 z-20 transition-all"
                      style={{ touchAction: 'none' }}
                    />
                  </th>
                ))}
                <th className="p-3 border-b border-slate-200 w-16 text-center text-[10px] font-bold uppercase tracking-wider text-slate-500">Acciones</th>
              </tr>
            </thead>
            {Object.entries(datosAgrupados).map(([grupo, filas]) => (
              <tbody key={grupo}>
                {agruparPor && (
                  <tr className="bg-slate-50/50">
                    <td colSpan={columnas.filter(c=>c.visible).length + 1} className="p-2 px-4 text-xs font-bold text-slate-700 border-y border-slate-200">
                      {grupo} <span className="text-slate-400 font-normal ml-2">({filas.length} elementos)</span>
                    </td>
                  </tr>
                )}
                {filas.map((row) => {
                  let rowBgClass = 'border-b border-slate-100 hover:bg-slate-50/40';
                  if (row.certificacion === 'Si') {
                    rowBgClass = 'bg-sky-50/80 hover:bg-sky-100/80 border-b border-sky-100';
                  } else if (row.importacion === 'Si') {
                    rowBgClass = 'bg-purple-50/80 hover:bg-purple-100/80 border-b border-purple-100';
                  } else if (row.pendiente_armado === 'Si') {
                    rowBgClass = 'bg-amber-50/80 hover:bg-amber-100/80 border-b border-amber-100';
                  }
                  return (
                    <tr key={row.id} className={rowBgClass}>
                      {columnas.filter(c => c.visible).map(col => (
                        <td 
                          key={col.key} 
                          className="p-3 text-xs text-slate-700 align-middle truncate"
                          style={{ 
                            width: columnWidths[col.key] ? `${columnWidths[col.key]}px` : undefined, 
                            minWidth: columnWidths[col.key] ? `${columnWidths[col.key]}px` : undefined,
                            maxWidth: columnWidths[col.key] ? `${columnWidths[col.key]}px` : undefined
                          }}
                        >
                          <RenderCell row={row} col={col} />
                        </td>
                      ))}
                      <td className="p-3 align-middle text-right whitespace-nowrap">
                         {onGeneratePDF && (
                           <button onClick={() => onGeneratePDF(row)} className="text-slate-400 hover:text-indigo-500 p-1 rounded transition-colors mr-1 cursor-pointer" title="Generar PDF"><FileText size={13}/></button>
                         )}
                         <button onClick={() => onEditRow ? onEditRow(row) : setFilaEnEdicion(row)} className="text-slate-400 hover:text-[#07417B] p-1 rounded transition-colors mr-1 cursor-pointer" title="Maximizar / Editar"><Maximize2 size={13}/></button>
                         <button onClick={() => onDeleteRequest(row.id)} className="text-slate-400 hover:text-rose-500 p-1 rounded transition-colors cursor-pointer" title="Eliminar Registro"><Trash2 size={13}/></button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            ))}
            <tfoot className="sticky bottom-0 bg-slate-50 border-t-2 border-slate-200 z-10">
              <tr>
                {columnas.filter(c => c.visible).map((col, idx) => (
                  <td 
                    key={`foot-${col.key}`} 
                    className="p-3 text-xs font-bold text-slate-700 truncate"
                    style={{ 
                      width: columnWidths[col.key] ? `${columnWidths[col.key]}px` : undefined, 
                      minWidth: columnWidths[col.key] ? `${columnWidths[col.key]}px` : undefined,
                      maxWidth: columnWidths[col.key] ? `${columnWidths[col.key]}px` : undefined
                    }}
                  >
                    {idx === 0 ? "TOTALES" : col.calc === 'sum' ? formatCurrency(totales[col.key]) : col.calc === 'avg' ? `Promedio: ${totales[col.key]}%` : ''}
                  </td>
                ))}
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
