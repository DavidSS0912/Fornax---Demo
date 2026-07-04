import React, { useState } from 'react';
import { X, User, Trash2 } from 'lucide-react';

export default function UserProfileModal({ userProfile, onSave, onClose, onNotification }) {
  // Local state for dynamic key-value fields
  const [customFields, setCustomFields] = useState(() => {
    try {
      const parsed = JSON.parse(userProfile?.datos_adicionales || '{}');
      if (typeof parsed === 'object' && parsed !== null) {
        return Object.entries(parsed).map(([k, v]) => ({ key: k, value: v }));
      }
    } catch (e) {}
    return [];
  });

  const [formData, setFormData] = useState({
    nombre: userProfile?.nombre || '',
    puesto: userProfile?.puesto || '',
    correo: userProfile?.correo || '',
    celular: userProfile?.celular || '',
    ubicacion: userProfile?.ubicacion || '',
    empresa: userProfile?.empresa || '',
    usar_perfil_en_pdf: localStorage.getItem('usar_perfil_en_pdf') === 'true'
  });

  const handleSave = async (e) => {
    e.preventDefault();

    // Serialize customFields to JSON object
    const adDataObj = {};
    customFields.forEach(f => {
      const cleanKey = f.key.trim();
      if (cleanKey) {
        adDataObj[cleanKey] = f.value;
      }
    });

    const payload = {
      ...formData,
      datos_adicionales: JSON.stringify(adDataObj)
    };

    try {
      localStorage.setItem('usar_perfil_en_pdf', formData.usar_perfil_en_pdf);

      const res = await fetch('/api/perfil_usuario', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const updated = await res.json();
        onSave(updated);
        if (onNotification) {
          onNotification('Perfil de usuario guardado con éxito', 'success');
        }
      } else {
        if (onNotification) {
          onNotification('Error al guardar el perfil en el servidor', 'error');
        }
      }
    } catch (err) {
      if (onNotification) {
        onNotification('Error de conexión al guardar el perfil', 'error');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200" onClick={onClose}>
      <div className="bg-white rounded-2xl w-[550px] shadow-2xl border border-slate-200 flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="bg-[#07417B]/10 text-[#07417B] p-2 rounded-lg">
              <User size={18} />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-800">Perfil de Usuario</h3>
              <p className="text-[10px] text-slate-500">Configura la información emisora por defecto para cotizaciones y PDFs</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg cursor-pointer"><X size={16} /></button>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Nombre Completo</label>
              <input
                type="text"
                required
                className="w-full p-2.5 border border-slate-300 rounded-lg text-sm bg-white"
                placeholder="ej: Juan Pérez"
                value={formData.nombre}
                onChange={e => setFormData({ ...formData, nombre: e.target.value })}
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Puesto / Cargo</label>
              <input
                type="text"
                required
                className="w-full p-2.5 border border-slate-300 rounded-lg text-sm bg-white"
                placeholder="ej: Gerente de Ventas"
                value={formData.puesto}
                onChange={e => setFormData({ ...formData, puesto: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Correo Electrónico</label>
              <input
                type="email"
                required
                className="w-full p-2.5 border border-slate-300 rounded-lg text-sm bg-white"
                placeholder="ej: juan@fornax.com"
                value={formData.correo}
                onChange={e => setFormData({ ...formData, correo: e.target.value })}
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Celular / Teléfono</label>
              <input
                type="text"
                required
                className="w-full p-2.5 border border-slate-300 rounded-lg text-sm bg-white"
                placeholder="ej: 555-123-4567"
                value={formData.celular}
                onChange={e => setFormData({ ...formData, celular: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Ubicación de Oficina (Ciudad)</label>
              <input
                type="text"
                required
                className="w-full p-2.5 border border-slate-300 rounded-lg text-sm bg-white"
                placeholder="ej: Monterrey, NL"
                value={formData.ubicacion}
                onChange={e => setFormData({ ...formData, ubicacion: e.target.value })}
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Empresa</label>
              <input
                type="text"
                required
                className="w-full p-2.5 border border-slate-300 rounded-lg text-sm bg-white"
                placeholder="ej: Fornax Soluciones Industriales"
                value={formData.empresa}
                onChange={e => setFormData({ ...formData, empresa: e.target.value })}
              />
            </div>
          </div>

          {/* Toggle para usar perfil en PDFs */}
          <div className="flex items-center gap-3 p-3 mt-2 bg-[#07417B]/5 rounded-lg border border-[#07417B]/10">
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={formData.usar_perfil_en_pdf}
                onChange={e => setFormData({ ...formData, usar_perfil_en_pdf: e.target.checked })}
              />
              <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#07417B]"></div>
            </label>
            <div>
              <p className="text-xs font-bold text-slate-800">Usar mi perfil como emisor en PDFs</p>
              <p className="text-[10px] text-slate-500 leading-tight mt-0.5">Si está activado, tus datos (nombre, correo, celular) aparecerán como emisor principal en las cotizaciones. Si está apagado, se usará la información del vendedor asignado a la cuenta.</p>
            </div>
          </div>

          {/* Dynamic key-value custom fields */}
          <div className="space-y-3 pt-2">
            <div className="flex justify-between items-center border-b border-slate-200 pb-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Información Adicional (Dirección, RFC, Leyendas, etc.)</label>
              <button
                type="button"
                onClick={() => setCustomFields([...customFields, { key: '', value: '' }])}
                className="text-xs bg-[#07417B]/10 hover:bg-[#07417B]/20 text-[#07417B] font-bold px-2 py-1 rounded-lg cursor-pointer transition-colors"
              >
                + Agregar Campo
              </button>
            </div>

            {customFields.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-1">No hay campos adicionales configurados.</p>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {customFields.map((field, idx) => (
                  <div key={idx} className="flex gap-2 items-center">
                    <input
                      type="text"
                      placeholder="Nombre (ej. DIRECCIÓN)"
                      className="w-1/3 p-2.5 border border-slate-300 rounded-lg text-xs bg-white font-bold"
                      value={field.key}
                      onChange={e => {
                        const updated = [...customFields];
                        updated[idx].key = e.target.value;
                        setCustomFields(updated);
                      }}
                    />
                    <input
                      type="text"
                      placeholder="Valor (ej. Calle Novena #197)"
                      className="flex-1 p-2.5 border border-slate-300 rounded-lg text-xs bg-white"
                      value={field.value}
                      onChange={e => {
                        const updated = [...customFields];
                        updated[idx].value = e.target.value;
                        setCustomFields(updated);
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const updated = customFields.filter((_, fIdx) => fIdx !== idx);
                        setCustomFields(updated);
                      }}
                      className="text-rose-500 hover:text-rose-700 p-1 cursor-pointer transition-colors"
                      title="Eliminar campo"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#07417B] text-white rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity cursor-pointer"
            >
              Guardar Cambios
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
