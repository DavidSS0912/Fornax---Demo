import React, { useState } from 'react';
import { X, Plus, Trash2, Palette } from 'lucide-react';

const COLORS = [
  "bg-slate-100 text-slate-700",
  "bg-sky-100 text-sky-800",
  "bg-orange-100 text-orange-800",
  "bg-amber-100 text-amber-800",
  "bg-emerald-100 text-emerald-800",
  "bg-green-100 text-green-800",
  "bg-rose-100 text-rose-800",
  "bg-purple-100 text-purple-800",
  "bg-teal-100 text-teal-800",
  "bg-blue-100 text-blue-700",
  "bg-indigo-100 text-indigo-700"
];

export default function OptionsEditorModal({ columnaKey, columnaLabel, configOpciones, defaultOpciones, onSave, onClose }) {
  // Inicializamos con config, o con valores default si no hay config
  const initOpciones = () => {
    if (!configOpciones) return defaultOpciones.map(opt => ({ text: opt, color: COLORS[0] }));
    const config = configOpciones.find(c => c.columna === columnaKey);
    if (config && config.opciones) {
      try {
        return JSON.parse(config.opciones);
      } catch(e) {
        return defaultOpciones.map(opt => ({ text: opt, color: COLORS[0] }));
      }
    }
    return defaultOpciones.map(opt => ({ text: opt, color: COLORS[0] }));
  };

  const [opciones, setOpciones] = useState(initOpciones());
  const [nuevaOpcion, setNuevaOpcion] = useState('');
  const [nuevoColor, setNuevoColor] = useState(COLORS[0]);

  const handleAdd = () => {
    if (nuevaOpcion.trim() === '') return;
    if (opciones.find(o => o.text.toLowerCase() === nuevaOpcion.trim().toLowerCase())) return;
    setOpciones([...opciones, { text: nuevaOpcion.trim(), color: nuevoColor }]);
    setNuevaOpcion('');
  };

  const handleRemove = (text) => {
    setOpciones(opciones.filter(o => o.text !== text));
  };

  const handleChangeColor = (index, color) => {
    const newOps = [...opciones];
    newOps[index].color = color;
    setOpciones(newOps);
  };

  const handleSave = () => {
    onSave(columnaKey, opciones);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm animate-in fade-in" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="bg-[#07417B] p-4 flex justify-between items-center text-white shrink-0">
          <h3 className="font-bold flex items-center gap-2"><Palette size={18}/> Opciones para "{columnaLabel}"</h3>
          <button onClick={onClose} className="text-white/70 hover:text-white transition-colors"><X size={20}/></button>
        </div>
        
        <div className="p-6 overflow-y-auto flex-1 bg-slate-50 space-y-4 max-h-[60vh]">
          <div className="bg-white p-3 rounded-lg border border-slate-200 flex flex-col gap-2 shadow-xs">
             <label className="text-xs font-bold text-slate-500 uppercase">Agregar Opción</label>
             <div className="flex gap-2">
                <input 
                  type="text" 
                  value={nuevaOpcion} 
                  onChange={e => setNuevaOpcion(e.target.value)} 
                  className="flex-1 p-2 border border-slate-300 rounded text-sm" 
                  placeholder="Nueva opción..." 
                  onKeyDown={e => e.key === 'Enter' && handleAdd()}
                />
                <select value={nuevoColor} onChange={e => setNuevoColor(e.target.value)} className="w-24 p-1 border border-slate-300 rounded text-xs bg-white">
                   {COLORS.map((c, i) => <option key={i} value={c} className={`${c}`}>&nbsp;&nbsp;&nbsp;</option>)}
                </select>
                <button onClick={handleAdd} className="bg-[#07417B] text-white p-2 rounded hover:opacity-90 transition-opacity"><Plus size={16}/></button>
             </div>
          </div>

          <div className="space-y-2">
             {opciones.map((op, idx) => (
                <div key={idx} className="flex items-center justify-between bg-white p-2 border border-slate-200 rounded shadow-xs group">
                   <div className="flex items-center gap-3">
                      <select value={op.color} onChange={e => handleChangeColor(idx, e.target.value)} className={`w-6 h-6 rounded-full appearance-none cursor-pointer border ${op.color.split(' ')[0]} ${op.color.split(' ')[1]}`} title="Cambiar color">
                         {COLORS.map((c, i) => <option key={i} value={c} className={`${c}`}>&nbsp;&nbsp;&nbsp;</option>)}
                      </select>
                      <span className={`px-2 py-0.5 rounded text-xs font-bold ${op.color}`}>{op.text}</span>
                   </div>
                   <button onClick={() => handleRemove(op.text)} className="text-slate-400 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={14}/></button>
                </div>
             ))}
             {opciones.length === 0 && <p className="text-xs text-slate-400 text-center py-4">No hay opciones configuradas</p>}
          </div>
        </div>

        <div className="p-4 bg-white border-t border-slate-200 flex justify-end gap-3 shrink-0">
          <button onClick={onClose} className="px-4 py-2 rounded-lg font-semibold text-slate-600 hover:bg-slate-100 text-sm transition-colors">Cancelar</button>
          <button onClick={handleSave} className="px-4 py-2 rounded-lg font-semibold bg-[#07417B] text-white shadow-sm text-sm hover:opacity-90 transition-opacity">Guardar Cambios</button>
        </div>
      </div>
    </div>
  );
}
