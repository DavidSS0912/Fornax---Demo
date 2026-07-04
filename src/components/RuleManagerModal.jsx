import React, { useState } from 'react';
import { X, Plus, Trash2, Save, ArrowRight } from 'lucide-react';

const RuleManagerModal = ({ rules, onSave, onClose, columnas }) => {
  const [localRules, setLocalRules] = useState([...rules]);

  // Filtrar solo columnas que pueden tener sentido para las reglas (dropdowns o de texto corto)
  // o simplemente todas las columnas menos id, cliente, etc.
  const columnOptions = columnas.filter(c => 
    !['id', 'Cliente', 'Monto', 'Margen', 'num_cliente', 'fecha_llegada', 'notas', 'codigos_facturar'].includes(c.key)
  );

  const destinationOptions = [
    { value: 'quotes', label: 'Seguimiento de Cotizaciones' },
    { value: 'processing', label: 'Procesamiento y Seguimiento de OC' },
    { value: 'archive', label: 'Archivo / Historial' }
  ];

  const handleAddRule = () => {
    setLocalRules([
      ...localRules,
      { id: Date.now().toString(), column: columnOptions[0]?.key || '', value: '', destination: 'processing' }
    ]);
  };

  const handleRemoveRule = (id) => {
    setLocalRules(localRules.filter(r => r.id !== id));
  };

  const handleUpdateRule = (id, field, value) => {
    setLocalRules(localRules.map(r => r.id === id ? { ...r, [field]: value } : r));
  };

  const handleSave = () => {
    // Filtrar reglas que no estén completas
    const validRules = localRules.filter(r => r.column && r.value && r.destination);
    onSave(validRules);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Reglas de Flujo de Tablero</h2>
            <p className="text-sm text-slate-500 mt-1">Configura reglas para mover automáticamente elementos entre las pestañas.</p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 bg-slate-50/50">
          <div className="space-y-4">
            {localRules.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-200">
                <p className="text-slate-500 text-sm mb-4">No hay reglas configuradas actualmente.</p>
                <button
                  onClick={handleAddRule}
                  className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-semibold hover:bg-blue-100 transition-colors inline-flex items-center gap-2"
                >
                  <Plus size={16} /> Añadir Primera Regla
                </button>
              </div>
            ) : (
              localRules.map((rule, index) => (
                <div key={rule.id} className="flex flex-col sm:flex-row gap-3 items-start sm:items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                  <div className="flex-1 flex flex-col sm:flex-row items-center gap-3 w-full">
                    <span className="text-sm font-medium text-slate-500 whitespace-nowrap">Si la columna</span>
                    
                    <select
                      value={rule.column}
                      onChange={(e) => handleUpdateRule(rule.id, 'column', e.target.value)}
                      className="w-full sm:w-auto flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    >
                      {columnOptions.map(col => (
                        <option key={col.key} value={col.key}>{col.label}</option>
                      ))}
                    </select>

                    <span className="text-sm font-medium text-slate-500">es</span>

                    <input
                      type="text"
                      placeholder="Valor exacto..."
                      value={rule.value}
                      onChange={(e) => handleUpdateRule(rule.id, 'value', e.target.value)}
                      className="w-full sm:w-auto flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>

                  <ArrowRight size={18} className="hidden sm:block text-slate-400 shrink-0 mx-2" />

                  <div className="flex w-full sm:w-auto items-center gap-3">
                    <span className="text-sm font-medium text-slate-500 sm:hidden">Mover a:</span>
                    <select
                      value={rule.destination}
                      onChange={(e) => handleUpdateRule(rule.id, 'destination', e.target.value)}
                      className="w-full sm:w-auto px-3 py-2 bg-blue-50/50 border border-blue-200 rounded-lg text-sm font-medium text-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    >
                      {destinationOptions.map(dest => (
                        <option key={dest.value} value={dest.value}>{dest.label}</option>
                      ))}
                    </select>

                    <button
                      onClick={() => handleRemoveRule(rule.id)}
                      className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors shrink-0"
                      title="Eliminar regla"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))
            )}

            {localRules.length > 0 && (
              <button
                onClick={handleAddRule}
                className="w-full py-3 border-2 border-dashed border-slate-200 rounded-xl text-sm font-semibold text-slate-500 hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50/50 transition-colors flex items-center justify-center gap-2"
              >
                <Plus size={16} /> Añadir otra regla
              </button>
            )}
          </div>
          
          <div className="mt-6 bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-800">
            <strong>Nota:</strong> Las reglas se evalúan en orden de arriba a abajo. El primer elemento que coincida con una regla será movido a la pestaña de destino. Las operaciones sin reglas seguirán el comportamiento por defecto.
          </div>
        </div>

        <div className="p-4 border-t border-slate-100 flex justify-end gap-3 bg-white">
          <button
            onClick={onClose}
            className="px-5 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-md hover:shadow-lg transition-all flex items-center gap-2"
          >
            <Save size={16} />
            Guardar Reglas
          </button>
        </div>
      </div>
    </div>
  );
};

export default RuleManagerModal;
