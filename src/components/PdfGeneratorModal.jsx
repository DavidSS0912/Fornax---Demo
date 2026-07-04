import React, { useState, useEffect } from 'react';
import { X, FileText, Download, Printer } from 'lucide-react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

export default function PdfGeneratorModal({ data, onClose, masterClientes, masterVendedores, userProfile, onNotification }) {
  const getInitialVendedor = () => {
    const usarPerfil = localStorage.getItem('usar_perfil_en_pdf') === 'true';
    if (usarPerfil) {
      return userProfile?.nombre || "Asesor Comercial";
    }
    return data.vendedor || data.Asesor || userProfile?.nombre || "Asesor Comercial";
  };

  const getInitialContacto = () => {
    const usarPerfil = localStorage.getItem('usar_perfil_en_pdf') === 'true';
    if (usarPerfil && userProfile) {
      return `${userProfile.correo || ''}${userProfile.celular ? ` | Cel: ${userProfile.celular}` : ''}`;
    }
    const selectedVendor = masterVendedores?.find(v => v.nombre === (data.vendedor || data.Asesor));
    if (selectedVendor) {
      return `${selectedVendor.correo || ''}${selectedVendor.celular ? ` | Cel: ${selectedVendor.celular}` : ''}`;
    }
    if (userProfile) {
      return `${userProfile.correo || ''}${userProfile.celular ? ` | Cel: ${userProfile.celular}` : ''}`;
    }
    return "asesor@miempresa.com";
  };

  const getInitialCustomFields = () => {
    try {
      return JSON.parse(userProfile?.datos_adicionales || '{}');
    } catch(e) {
      return {};
    }
  };

  const [formData, setFormData] = useState({
    ...data,
    Monto: data.monto_original ? data.monto_original : (data.Monto || 0),
    observaciones: data.notas || "Tiempo de entrega sujeto a disponibilidad de material. Precios sujetos a cambio sin previo aviso.",
    condiciones_pago: "30 Días",
    moneda: data.moneda_cotizacion || "MXN",
    tipo_cambio: (data.tipo_cambio && Number(data.tipo_cambio) > 1) ? String(data.tipo_cambio) : "18.00",
    iva_pct: 8, // Default to 8%
    vigencia: "15 Días",
    lugar_entrega: data.lugar_entrega || "Mexicali",
    atencion_a: data.contacto_cliente || "",
    empresa_emisora: userProfile?.empresa || "Mi Empresa S.A. de C.V.",
    vendedor: getInitialVendedor(),
    contacto_vendedor: getInitialContacto(),
    custom_fields: getInitialCustomFields()
  });

  const [showCodesInPDF, setShowCodesInPDF] = useState(localStorage.getItem('show_codes_in_pdf') !== 'false');
  const [showUnitPricesInPDF, setShowUnitPricesInPDF] = useState(localStorage.getItem('show_unit_prices_in_pdf') !== 'false');

  useEffect(() => {
    localStorage.setItem('show_codes_in_pdf', showCodesInPDF);
  }, [showCodesInPDF]);

  useEffect(() => {
    localStorage.setItem('show_unit_prices_in_pdf', showUnitPricesInPDF);
  }, [showUnitPricesInPDF]);

  // Sync data dynamically when props load
  useEffect(() => {
    if (userProfile || masterVendedores) {
      setFormData(prev => ({
        ...prev,
        empresa_emisora: prev.empresa_emisora === "Mi Empresa S.A. de C.V." ? (userProfile?.empresa || prev.empresa_emisora) : prev.empresa_emisora,
        vendedor: prev.vendedor === "Asesor Comercial" ? getInitialVendedor() : prev.vendedor,
        contacto_vendedor: prev.contacto_vendedor === "asesor@miempresa.com" ? getInitialContacto() : prev.contacto_vendedor,
        custom_fields: Object.keys(prev.custom_fields || {}).length === 0 ? getInitialCustomFields() : prev.custom_fields
      }));
    }
  }, [userProfile, masterVendedores]);

  const clienteRef = masterClientes?.find(c => c.numero === formData.num_cliente);

  const getCodigosList = () => {
    if (!formData.codigos_facturar) return [{ cantidad: 1, codigo: formData.Pedido || 'Partida General', descripcion: '', tiempo_entrega: '' }];
    try {
      const parsed = JSON.parse(formData.codigos_facturar);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map(item => ({ 
          cantidad: item.cantidad, 
          codigo: item.codigo,
          codigo_interno: item.codigo_interno || '',
          descripcion: item.descripcion || '',
          tiempo_entrega: item.tiempo_entrega || '',
          precio_unitario: item.precio_unitario || 0
        }));
      }
    } catch(e) {
      return [{ cantidad: 1, codigo: formData.codigos_facturar, descripcion: '', tiempo_entrega: '', precio_unitario: 0 }];
    }
    return [{ cantidad: 1, codigo: formData.Pedido || 'Partida General', descripcion: '', tiempo_entrega: '', precio_unitario: 0 }];
  };

  const handleGenerate = async () => {
    try {
      const doc = new jsPDF('p', 'mm', 'a4');
      
      // Page dimensions
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 15;
      const contentWidth = pageWidth - (margin * 2);

      const drawPageHeader = (pageNum) => {
        // 1. Header (Y: 15 to 40)
        doc.setTextColor(7, 65, 123); // #07417B (Dark Blue)
        doc.setFont("helvetica", "bold");
        doc.setFontSize(18);
        const companyNameLines = doc.splitTextToSize(formData.empresa_emisora || 'Fornax Soluciones Industriales', 110);
        doc.text(companyNameLines, margin, 25);
        const companyHeight = companyNameLines.length * 6;
        
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8.5);
        doc.setTextColor(71, 85, 105); // #475569 (Slate-600)
        doc.text(`Asesor: ${formData.vendedor || ''}`, margin, 25 + companyHeight);
        doc.text(`Contacto: ${formData.contacto_vendedor || ''}`, margin, 25 + companyHeight + 4.5);
        
        // Right side header
        doc.setTextColor(15, 23, 42); // #0F172A (Slate-900)
        doc.setFont("helvetica", "bold");
        doc.setFontSize(16);
        doc.text("COTIZACIÓN", pageWidth - margin, 25, { align: "right" });
        
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.setTextColor(71, 85, 105);
        doc.text(`${formData.No_Cotizacion || 'N/A'}`, pageWidth - margin, 30.5, { align: "right" });
        
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(100, 116, 139); // #64748B
        doc.text(`Fecha: ${new Date().toLocaleDateString('es-MX')}`, pageWidth - margin, 35, { align: "right" });
        
        // Divider line
        doc.setDrawColor(203, 213, 225); // #cbd5e1
        doc.setLineWidth(0.4);
        doc.line(margin, 43, pageWidth - margin, 43);
      };

      const drawClientBlock = (y) => {
        let blockHeight = 26;
        // Client Box
        doc.setFillColor(248, 250, 252); // #f8fafc
        doc.rect(margin, y, 85, blockHeight, "F");
        doc.setDrawColor(203, 213, 225);
        doc.rect(margin, y, 85, blockHeight, "S");
        
        doc.setTextColor(7, 65, 123);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(7.5);
        doc.text("DATOS DEL CLIENTE", margin + 3, y + 4.5);
        
        doc.setTextColor(15, 23, 42);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9.5);
        const clientLines = doc.splitTextToSize(formData.Cliente || 'Cliente no asignado', 79);
        doc.text(clientLines, margin + 3, y + 11);
        
        doc.setTextColor(71, 85, 105);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        const attentionLines = doc.splitTextToSize(`Atención: ${formData.atencion_a || 'A quien corresponda'}`, 79);
        doc.text(attentionLines, margin + 3, y + 19);
        
        // Details Box
        doc.setFillColor(248, 250, 252);
        doc.rect(pageWidth - margin - 85, y, 85, blockHeight, "F");
        doc.setDrawColor(203, 213, 225);
        doc.rect(pageWidth - margin - 85, y, 85, blockHeight, "S");
        
        doc.setTextColor(7, 65, 123);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(7.5);
        doc.text("DETALLES ADICIONALES", pageWidth - margin - 85 + 3, y + 4.5);
        
        doc.setTextColor(71, 85, 105);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8.5);
        doc.text(`Vigencia: ${formData.vigencia || 'N/A'}`, pageWidth - margin - 85 + 3, y + 12);
        doc.text(`Lugar de entrega: ${formData.lugar_entrega || 'N/A'}`, pageWidth - margin - 85 + 3, y + 17);
      };

      const drawTableHeader = (y) => {
        doc.setFillColor(241, 245, 249); // #f1f5f9
        doc.rect(margin, y, contentWidth, 8, "F");
        doc.setDrawColor(203, 213, 225);
        doc.rect(margin, y, contentWidth, 8, "S");
        
        doc.setTextColor(51, 65, 85); // #334155
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8);
        doc.text("CANTIDAD", margin + 12, y + 5, { align: "center" });
        doc.text("DESCRIPCIÓN / CONCEPTO", margin + 28, y + 5);
        
        // Vertical separator in table header
        doc.line(margin + 24, y, margin + 24, y + 8);
        if (showUnitPricesInPDF) {
          const col1 = contentWidth - 45;
          const col2 = contentWidth - 22;
          doc.text("P. UNIT", margin + col1 + 11.25, y + 5, { align: "center" });
          doc.text("IMPORTE", margin + col2 + 11, y + 5, { align: "center" });
          doc.line(margin + col1, y, margin + col1, y + 8);
          doc.line(margin + col2, y, margin + col2, y + 8);
        }
      };

      let pageNum = 1;
      drawPageHeader(pageNum);
      drawClientBlock(48);
      
      let currentY = 80;
      drawTableHeader(currentY);
      currentY += 8;
      
      const items = getCodigosList();
      const pageLimit = pageHeight - 20; // Ensure table row doesn't exceed printable area

      items.forEach((item) => {
        let textContent = '';
        if (showCodesInPDF) {
          const codeToShow = item.codigo_interno || item.codigo;
          textContent = codeToShow ? `${codeToShow}\n${item.descripcion}` : item.descripcion;
        } else {
          textContent = item.descripcion || item.codigo_interno || item.codigo;
        }
        if (item.tiempo_entrega) {
          textContent += `\nTE: ${item.tiempo_entrega}`;
        }
        const descWidth = showUnitPricesInPDF ? contentWidth - 50 : contentWidth - 28;
        const descLines = doc.splitTextToSize(textContent || '', descWidth);
        const textHeight = descLines.length * 4.5;
        const rowHeight = Math.max(8, textHeight + 4);

        if (currentY + rowHeight > pageLimit) {
          doc.addPage();
          pageNum++;
          drawPageHeader(pageNum);
          currentY = 48;
          drawTableHeader(currentY);
          currentY += 8;
        }
        
        // Draw row borders
        doc.setDrawColor(203, 213, 225);
        doc.rect(margin, currentY, contentWidth, rowHeight, "S");
        doc.line(margin + 24, currentY, margin + 24, currentY + rowHeight);
        if (showUnitPricesInPDF) {
          const col1 = contentWidth - 45;
          const col2 = contentWidth - 22;
          doc.line(margin + col1, currentY, margin + col1, currentY + rowHeight);
          doc.line(margin + col2, currentY, margin + col2, currentY + rowHeight);
        }
        
        // Quantity
        doc.setTextColor(15, 23, 42);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.text(String(item.cantidad), margin + 12, currentY + (rowHeight / 2) + 1, { align: "center" });
        
        // Description
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8.5);
        doc.text(descLines, margin + 28, currentY + 5.5);

        if (showUnitPricesInPDF) {
          const col1 = contentWidth - 45;
          const col2 = contentWidth - 22;
          const unitPrice = item.precio_unitario || 0;
          const total = item.cantidad * unitPrice;
          doc.setFont("helvetica", "bold");
          doc.text(`$${unitPrice.toLocaleString('en-US', {minimumFractionDigits: 2})}`, margin + col1 + 11.25, currentY + (rowHeight / 2) + 1, { align: "center" });
          doc.text(`$${total.toLocaleString('en-US', {minimumFractionDigits: 2})}`, margin + col2 + 11, currentY + (rowHeight / 2) + 1, { align: "center" });
        }
        
        currentY += rowHeight;
      });
      

      // Calculate how much space the entire footer (Totales + Conditions) will occupy
      const obsLines = doc.splitTextToSize(formData.observaciones || '', contentWidth);
      const obsHeight = obsLines.length * 3.5;
      const customFieldsCount = Object.keys(formData.custom_fields || {}).length;
      const customFieldsHeight = customFieldsCount * 4;
      const detailsSectionHeight = Math.max(10, customFieldsHeight);
      
      // Totales Box (22) + margin (4) + commercial conditions title (5) + observations (obsHeight) + payment info height (detailsSectionHeight) + margins
      const footerSpaceNeeded = 4 + 22 + 8 + 5 + obsHeight + 4 + detailsSectionHeight + 5;

      if (currentY + footerSpaceNeeded > pageLimit) {
        doc.addPage();
        pageNum++;
        drawPageHeader(pageNum);
        currentY = 48;
      }

      // 4. Totales Box (Right-aligned)
      currentY += 4;
      const totalBoxWidth = 65;
      const totalBoxHeight = 22;
      const totalBoxX = pageWidth - margin - totalBoxWidth;
      
      doc.setFillColor(248, 250, 252);
      doc.rect(totalBoxX, currentY, totalBoxWidth, totalBoxHeight, "F");
      doc.setDrawColor(203, 213, 225);
      doc.rect(totalBoxX, currentY, totalBoxWidth, totalBoxHeight, "S");
      
      doc.setTextColor(71, 85, 105);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.text("Subtotal:", totalBoxX + 3, currentY + 5);
      doc.text(`$${displaySubtotal.toLocaleString('en-US', {minimumFractionDigits: 2})}`, pageWidth - margin - 3, currentY + 5, { align: "right" });
      
      doc.text(`I.V.A. (${formData.iva_pct}%):`, totalBoxX + 3, currentY + 10);
      doc.text(`$${displayIva.toLocaleString('en-US', {minimumFractionDigits: 2})}`, pageWidth - margin - 3, currentY + 10, { align: "right" });
      
      doc.line(totalBoxX, currentY + 13, pageWidth - margin, currentY + 13);
      
      doc.setTextColor(7, 65, 123);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.text("TOTAL:", totalBoxX + 3, currentY + 18);
      doc.text(`$${displayTotal.toLocaleString('en-US', {minimumFractionDigits: 2})} ${formData.moneda}`, pageWidth - margin - 3, currentY + 18, { align: "right" });
      
      currentY += totalBoxHeight + 8;
      
      // 5. Conditions and Notes Section (Top Border)
      doc.setDrawColor(203, 213, 225);
      doc.line(margin, currentY, pageWidth - margin, currentY);
      
      doc.setTextColor(15, 23, 42);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.text("CONDICIONES COMERCIALES Y NOTAS", margin, currentY + 5);
      
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(71, 85, 105);
      doc.text(obsLines, margin, currentY + 9.5);
      
      let detailsY = currentY + 10.5 + obsHeight;
      
      // Left Details column
      doc.text(`Condiciones de pago: ${formData.condiciones_pago || ''}`, margin, detailsY);
      doc.text(`Tipo de cambio: ${formData.tipo_cambio || ''}`, margin, detailsY + 4);
      
      // Right Details column (Custom Fields)
      let customY = detailsY;
      Object.entries(formData.custom_fields || {}).forEach(([k, v]) => {
        doc.text(`${k}: ${v || ''}`, pageWidth - margin - 85, customY);
        customY += 4;
      });
      
      // Draw footer disclaimer and page numbering across all pages
      const totalPagesCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= totalPagesCount; i++) {
        doc.setPage(i);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(7.5);
        doc.setTextColor(100, 116, 139);
        doc.text("Esta cotización fue realizada en Fornax. Si quiere contactar al desarrollador entre a la página https://davidsz.com.mx/", pageWidth / 2, pageHeight - 10, { align: "center" });
        doc.text(`Página ${i} de ${totalPagesCount}`, pageWidth - margin, pageHeight - 10, { align: "right" });
      }
      
      const filename = `Cotizacion_${formData.No_Cotizacion || 'Documento'}.pdf`;
      
      if (window.pywebview && window.pywebview.api) {
        const b64 = doc.output('datauristring').split(',')[1];
        window.pywebview.api.save_pdf(filename, b64).then((saved) => {
          if (saved && onNotification) {
            onNotification("PDF guardado exitosamente.", "success");
          }
        });
      } else {
        doc.save(filename);
        if (onNotification) {
          onNotification("PDF generado y descargado correctamente.", "success");
        }
      }
    } catch (err) {
      console.error("Vector PDF generation error:", err);
      if (onNotification) {
        onNotification("Hubo un error al generar el PDF de cotización.", "error");
      }
    }
  };

  const handlePrint = () => {
    const element = document.getElementById('pdf-content');
    if (!element) return;
    
    let printIframe = document.getElementById('print-iframe');
    if (!printIframe) {
      printIframe = document.createElement('iframe');
      printIframe.id = 'print-iframe';
      printIframe.style.position = 'absolute';
      printIframe.style.width = '0px';
      printIframe.style.height = '0px';
      printIframe.style.border = 'none';
      document.body.appendChild(printIframe);
    }
    
    const printWindow = printIframe.contentWindow;
    printWindow.document.open();
    printWindow.document.write('<html><head><title>Imprimir Cotización</title>');
    printWindow.document.write('<script src="https://cdn.tailwindcss.com"></script>');
    printWindow.document.write('</head><body class="p-8">');
    printWindow.document.write(element.innerHTML);
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    
    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
    }, 1000);
  };

  // Dynamically compute amounts based on selected currency and exchange rate (only for PDF view)
  const baseSubtotal = Number(formData.Monto || 0);
  const displaySubtotal = baseSubtotal;
  
  const displayIva = displaySubtotal * (formData.iva_pct / 100);
  const displayTotal = displaySubtotal + displayIva;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm animate-in fade-in" onClick={onClose}>
      <div className="bg-slate-100 rounded-xl shadow-2xl w-full max-w-6xl h-[95vh] flex overflow-hidden" onClick={e => e.stopPropagation()}>
        
        {/* Panel lateral: Editor */}
        <div className="w-1/3 bg-white border-r border-slate-200 flex flex-col h-full shadow-lg z-10">
          <div className="p-4 bg-[#07417B] text-white flex justify-between items-center shrink-0">
            <h3 className="font-bold flex items-center gap-2"><FileText size={18}/> Editar Cotización</h3>
            <button onClick={onClose} className="text-white/70 hover:text-white transition-colors"><X size={20}/></button>
          </div>
          
          <div className="p-5 overflow-y-auto flex-1 space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase">No. Cotización</label>
              <input type="text" className="w-full p-2 mt-1 border border-slate-300 rounded text-sm" value={formData.No_Cotizacion || ''} onChange={e => setFormData({...formData, No_Cotizacion: e.target.value})} />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase">Empresa Emisora</label>
              <input type="text" className="w-full p-2 mt-1 border border-slate-300 rounded text-sm" value={formData.empresa_emisora || ''} onChange={e => setFormData({...formData, empresa_emisora: e.target.value})} />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase">Vendedor</label>
              <input type="text" className="w-full p-2 mt-1 border border-slate-300 rounded text-sm" value={formData.vendedor || ''} onChange={e => setFormData({...formData, vendedor: e.target.value})} />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase">Contacto Vendedor</label>
              <input type="text" className="w-full p-2 mt-1 border border-slate-300 rounded text-sm" value={formData.contacto_vendedor || ''} onChange={e => setFormData({...formData, contacto_vendedor: e.target.value})} />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase">Atención a</label>
              <input type="text" className="w-full p-2 mt-1 border border-slate-300 rounded text-sm" value={formData.atencion_a || ''} onChange={e => setFormData({...formData, atencion_a: e.target.value})} />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase">Monto Total</label>
              <input type="number" className="w-full p-2 mt-1 border border-slate-300 rounded text-sm" value={formData.Monto || 0} onChange={e => setFormData({...formData, Monto: e.target.value})} />
            </div>
            <div className="grid grid-cols-3 gap-3">
               <div>
                  <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Moneda</label>
                   <div className="flex bg-slate-100 p-0.5 rounded border border-slate-300 text-xs">
                    <button
                      type="button"
                      onClick={() => {
                        let currentTC = Number(formData.tipo_cambio) || 18.00;
                        if (currentTC <= 1.0) currentTC = 18.00;

                        const nuevaMoneda = 'MXN';
                        let parsed = [];
                        try { parsed = JSON.parse(formData.codigos_facturar || '[]'); } catch(e){}
                        if (Array.isArray(parsed)) {
                          parsed = parsed.map(item => {
                            let pu = item.precio_origen !== undefined ? item.precio_origen : (item.precio_unitario || 0);
                            let mo = item.moneda_origen || 'MXN';
                            if (mo === 'USD') pu = pu * currentTC;
                            return { ...item, precio_unitario: pu };
                          });
                        }
                        const newMonto = Array.isArray(parsed) ? parsed.reduce((acc, it) => acc + (it.cantidad * (it.precio_unitario || 0)), 0) : formData.Monto;
                        
                        setFormData({ 
                          ...formData, 
                          moneda: nuevaMoneda, 
                          tipo_cambio: currentTC, 
                          codigos_facturar: JSON.stringify(parsed),
                          Monto: newMonto
                        });
                      }}
                      className={`flex-1 py-1 rounded font-bold text-center cursor-pointer transition-all ${formData.moneda === 'MXN' ? 'bg-[#07417B] text-white shadow-xs' : 'text-slate-600 hover:text-slate-800'}`}
                    >
                      MXN
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        let currentTC = Number(formData.tipo_cambio) || 1.0;
                        if (currentTC <= 1.0) currentTC = 18.00;

                        const nuevaMoneda = 'USD';
                        let parsed = [];
                        try { parsed = JSON.parse(formData.codigos_facturar || '[]'); } catch(e){}
                        if (Array.isArray(parsed)) {
                          parsed = parsed.map(item => {
                            let pu = item.precio_origen !== undefined ? item.precio_origen : (item.precio_unitario || 0);
                            let mo = item.moneda_origen || 'MXN';
                            if (mo === 'MXN') pu = pu / currentTC;
                            return { ...item, precio_unitario: pu };
                          });
                        }
                        const newMonto = Array.isArray(parsed) ? parsed.reduce((acc, it) => acc + (it.cantidad * (it.precio_unitario || 0)), 0) : formData.Monto;

                        setFormData({ 
                          ...formData, 
                          moneda: nuevaMoneda, 
                          tipo_cambio: currentTC, 
                          codigos_facturar: JSON.stringify(parsed),
                          Monto: newMonto
                        });
                      }}
                      className={`flex-1 py-1 rounded font-bold text-center cursor-pointer transition-all ${formData.moneda === 'USD' ? 'bg-[#07417B] text-white shadow-xs' : 'text-slate-600 hover:text-slate-800'}`}
                    >
                      USD
                    </button>
                  </div>
               </div>
               <div>
                  <label className="text-xs font-bold text-slate-500 uppercase">T. Cambio</label>
                  <input type="text" className="w-full p-2 mt-1 border border-slate-300 rounded text-sm" value={formData.tipo_cambio || ''} onChange={e => {
                      const tcVal = Number(e.target.value) || 1;
                      const nuevaMoneda = formData.moneda || 'MXN';
                      let parsed = [];
                      try { parsed = JSON.parse(formData.codigos_facturar || '[]'); } catch(err){}
                      if (Array.isArray(parsed)) {
                        parsed = parsed.map(item => {
                          let pu = item.precio_origen !== undefined ? item.precio_origen : (item.precio_unitario || 0);
                          let mo = item.moneda_origen || 'MXN';
                          if (mo === 'USD' && nuevaMoneda === 'MXN') pu = pu * tcVal;
                          else if (mo === 'MXN' && nuevaMoneda === 'USD') pu = pu / tcVal;
                          return { ...item, precio_unitario: pu };
                        });
                      }
                      const newMonto = Array.isArray(parsed) ? parsed.reduce((acc, it) => acc + (it.cantidad * (it.precio_unitario || 0)), 0) : formData.Monto;

                      setFormData({
                        ...formData, 
                        tipo_cambio: e.target.value,
                        codigos_facturar: JSON.stringify(parsed),
                        Monto: newMonto
                      });
                  }} />
               </div>
               <div>
                  <label className="text-xs font-bold text-slate-500 uppercase">IVA (%)</label>
                  <select className="w-full p-2 mt-1 border border-slate-300 rounded text-sm bg-white" value={formData.iva_pct} onChange={e => setFormData({...formData, iva_pct: Number(e.target.value)})}>
                     <option value={8}>8%</option>
                     <option value={16}>16%</option>
                  </select>
               </div>
            </div>
            
            {/* Dynamic Custom Profile Fields in Sidebar */}
            {Object.keys(formData.custom_fields || {}).length > 0 && (
              <div className="space-y-3 border-t border-slate-200 pt-3">
                <h4 className="text-xs font-bold text-[#07417B] uppercase">Datos del Perfil</h4>
                {Object.entries(formData.custom_fields).map(([key, val]) => (
                  <div key={key}>
                    <label className="text-xs font-bold text-slate-500 uppercase">{key}</label>
                    <input
                      type="text"
                      className="w-full p-2 mt-1 border border-slate-300 rounded text-sm bg-white"
                      value={val || ''}
                      onChange={e => {
                        const updatedFields = { ...formData.custom_fields, [key]: e.target.value };
                        setFormData({ ...formData, custom_fields: updatedFields });
                      }}
                    />
                  </div>
                ))}
              </div>
            )}

            <div>
              <label className="text-xs font-bold text-slate-500 uppercase">Condiciones de Pago</label>
              <input type="text" className="w-full p-2 mt-1 border border-slate-300 rounded text-sm" value={formData.condiciones_pago || ''} onChange={e => setFormData({...formData, condiciones_pago: e.target.value})} />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase">Vigencia</label>
              <input type="text" className="w-full p-2 mt-1 border border-slate-300 rounded text-sm" value={formData.vigencia || ''} onChange={e => setFormData({...formData, vigencia: e.target.value})} />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase">Lugar de Entrega</label>
              <input type="text" className="w-full p-2 mt-1 border border-slate-300 rounded text-sm" value={formData.lugar_entrega || ''} onChange={e => setFormData({...formData, lugar_entrega: e.target.value})} />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase">Observaciones / Notas</label>
              <textarea className="w-full p-2 mt-1 border border-slate-300 rounded text-sm h-24" value={formData.observaciones || ''} onChange={e => setFormData({...formData, observaciones: e.target.value})}></textarea>
            </div>
          </div>
          
          <div className="p-4 bg-slate-50 border-t border-slate-200 space-y-2 shrink-0">
             <div className="flex items-center justify-between pb-2 border-b border-slate-200 mb-2">
               <span className="text-xs font-bold text-slate-500 uppercase">Mostrar códigos en PDF</span>
               <label className="relative inline-flex items-center cursor-pointer">
                 <input type="checkbox" className="sr-only peer" checked={showCodesInPDF} onChange={() => setShowCodesInPDF(!showCodesInPDF)} />
                 <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#07417B]"></div>
               </label>
             </div>
             <div className="flex items-center justify-between pb-2 border-b border-slate-200 mb-2">
               <span className="text-xs font-bold text-slate-500 uppercase">Mostrar Precios en PDF</span>
               <label className="relative inline-flex items-center cursor-pointer">
                 <input type="checkbox" className="sr-only peer" checked={showUnitPricesInPDF} onChange={() => setShowUnitPricesInPDF(!showUnitPricesInPDF)} />
                 <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#07417B]"></div>
               </label>
             </div>
             <button onClick={handleGenerate} className="w-full flex items-center justify-center gap-2 bg-[#07417B] text-white py-2 rounded-lg font-bold shadow hover:opacity-90 transition-opacity">
               <Download size={16}/> Generar PDF
             </button>
             <button onClick={handlePrint} className="w-full flex items-center justify-center gap-2 bg-slate-200 text-slate-700 py-2 rounded-lg font-bold shadow hover:bg-slate-300 transition-colors">
               <Printer size={16}/> Imprimir
             </button>
          </div>
        </div>
        
        {/* Previsualización del Documento (A4 proporciones) */}
        {/* Note: Tailwind v4 uses OKLCH color variables by default which causes html2canvas to crash. */}
        {/* We override all background, color, and border styling with explicit inline HEX values for html2canvas parsing. */}
        <div className="w-2/3 bg-slate-200 p-8 overflow-y-auto flex justify-center items-start">
           <div id="pdf-content" className="shadow-xl w-[210mm] min-h-[297mm] p-12 shrink-0 relative flex flex-col" style={{ backgroundColor: '#ffffff', color: '#1e293b', boxSizing: 'border-box' }}>
              
              {/* Header */}
              <div className="flex justify-between items-start pb-6 mb-6" style={{ borderBottom: '2px solid #cbd5e1' }}>
                 <div>
                    <h1 className="text-2xl font-black tracking-tight" style={{ color: '#07417b' }}>{formData.empresa_emisora}</h1>
                    <div className="mt-2 text-xs" style={{ color: '#475569' }}>
                       <p><span className="font-bold" style={{ color: '#0f172a' }}>Asesor:</span> {formData.vendedor}</p>
                       <p><span className="font-bold" style={{ color: '#0f172a' }}>Contacto:</span> {formData.contacto_vendedor}</p>
                    </div>
                 </div>
                 <div className="text-right">
                    <h2 className="text-xl font-bold" style={{ color: '#0f172a' }}>COTIZACIÓN</h2>
                    <p className="text-sm font-medium mt-1" style={{ color: '#475569' }}>{formData.No_Cotizacion || 'N/A'}</p>
                    <p className="text-xs mt-1" style={{ color: '#64748b' }}>Fecha: {new Date().toLocaleDateString('es-MX')}</p>
                 </div>
              </div>
              
              {/* Cliente Info */}
              <div className="grid grid-cols-2 gap-8 mb-8">
                 <div className="p-4 rounded-lg" style={{ backgroundColor: '#f8fafc', border: '1px solid #cbd5e1' }}>
                    <h4 className="text-xs font-bold uppercase mb-2" style={{ color: '#07417b' }}>Datos del Cliente</h4>
                    <p className="text-sm font-bold" style={{ color: '#0f172a' }}>{formData.Cliente || 'Cliente no asignado'}</p>
                    <p className="text-xs mt-1" style={{ color: '#475569' }}>Atención: {formData.atencion_a || 'A quien corresponda'}</p>
                 </div>
                 <div className="p-4 rounded-lg" style={{ backgroundColor: '#f8fafc', border: '1px solid #cbd5e1' }}>
                    <h4 className="text-xs font-bold uppercase mb-2" style={{ color: '#07417b' }}>Detalles Adicionales</h4>
                    <p className="text-xs mt-1" style={{ color: '#475569' }}><span className="font-semibold" style={{ color: '#334155' }}>Vigencia:</span> {formData.vigencia}</p>
                    <p className="text-xs mt-1" style={{ color: '#475569' }}><span className="font-semibold" style={{ color: '#334155' }}>Lugar de entrega:</span> {formData.lugar_entrega}</p>
                 </div>
              </div>
              
              {/* Conceptos */}
              <div className="mb-8 min-h-[200px]">
                  <table className="w-full text-left" style={{ borderCollapse: 'collapse', border: '1px solid #cbd5e1' }}>
                    <thead>
                       <tr style={{ backgroundColor: '#f1f5f9', borderBottom: '1px solid #cbd5e1' }}>
                          <th className="py-2 px-3 text-xs font-bold uppercase w-24 text-center" style={{ color: '#334155', borderRight: '1px solid #cbd5e1' }}>Cantidad</th>
                          <th className="py-2 px-3 text-xs font-bold uppercase" style={{ color: '#334155' }}>Descripción / Concepto</th>
                          {showUnitPricesInPDF && (
                            <>
                              <th className="py-2 px-3 text-xs font-bold uppercase w-24 text-center" style={{ color: '#334155', borderLeft: '1px solid #cbd5e1' }}>P. Unit</th>
                              <th className="py-2 px-3 text-xs font-bold uppercase w-24 text-center" style={{ color: '#334155', borderLeft: '1px solid #cbd5e1' }}>Importe</th>
                            </>
                          )}
                       </tr>
                    </thead>
                    <tbody>
                       {getCodigosList().map((item, idx) => (
                          <tr key={idx} style={{ borderBottom: '1px solid #cbd5e1' }}>
                             <td className="py-2 px-3 text-sm text-center font-bold align-top" style={{ color: '#334155', borderRight: '1px solid #cbd5e1' }}>
                                {item.cantidad}
                             </td>
                             <td className="py-2 px-3 text-sm font-medium whitespace-pre-wrap leading-relaxed" style={{ color: '#1e293b' }}>
                                {showCodesInPDF ? ((item.codigo_interno || item.codigo) ? `${item.codigo_interno || item.codigo}\n${item.descripcion}` : item.descripcion) : (item.descripcion || item.codigo_interno || item.codigo)}
                                {item.tiempo_entrega && `\nTE: ${item.tiempo_entrega}`}
                             </td>
                             {showUnitPricesInPDF && (
                                <>
                                  <td className="py-2 px-3 text-sm text-center font-bold align-top" style={{ color: '#334155', borderLeft: '1px solid #cbd5e1' }}>
                                    ${(item.precio_unitario || 0).toLocaleString('en-US', {minimumFractionDigits: 2})}
                                  </td>
                                  <td className="py-2 px-3 text-sm text-center font-bold align-top" style={{ color: '#334155', borderLeft: '1px solid #cbd5e1' }}>
                                    ${((item.cantidad * (item.precio_unitario || 0))).toLocaleString('en-US', {minimumFractionDigits: 2})}
                                  </td>
                                </>
                             )}
                          </tr>
                       ))}

                    </tbody>
                 </table>
              </div>
              
              {/* Totales */}
              <div className="flex justify-end mb-8">
                 <div className="w-64 p-4 rounded-lg" style={{ backgroundColor: '#f8fafc', border: '1px solid #cbd5e1' }}>
                    <div className="flex justify-between items-center mb-2">
                       <span className="text-sm font-medium" style={{ color: '#475569' }}>Subtotal:</span>
                       <span className="text-sm font-bold" style={{ color: '#0f172a' }}>${displaySubtotal.toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                       <span className="text-sm font-medium" style={{ color: '#475569' }}>I.V.A. ({formData.iva_pct}%):</span>
                       <span className="text-sm font-bold" style={{ color: '#0f172a' }}>${displayIva.toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
                    </div>
                    <div className="flex justify-between items-center pt-2 mt-2" style={{ borderTop: '1px solid #cbd5e1' }}>
                       <span className="text-base font-bold" style={{ color: '#07417b' }}>TOTAL:</span>
                       <span className="text-base font-black" style={{ color: '#07417b' }}>
                          ${displayTotal.toLocaleString('en-US', {minimumFractionDigits: 2})} {formData.moneda}
                       </span>
                    </div>
                 </div>
              </div>
              
              {/* Footer / Condiciones */}
              <div className="pt-6 mt-auto" style={{ borderTop: '1px solid #cbd5e1' }}>
                 <h4 className="text-xs font-bold uppercase mb-2" style={{ color: '#0f172a' }}>Condiciones Comerciales y Notas</h4>
                 <p className="text-[10px] leading-relaxed whitespace-pre-wrap mb-4" style={{ color: '#475569' }}>{formData.observaciones}</p>
                 
                 <div className="grid grid-cols-2 gap-4 text-[10px] text-slate-600">
                    <div className="space-y-1">
                       <p><span className="font-bold" style={{ color: '#334155' }}>Condiciones de pago:</span> {formData.condiciones_pago}</p>
                       <p><span className="font-bold" style={{ color: '#334155' }}>Tipo de cambio:</span> {formData.tipo_cambio}</p>
                    </div>
                    <div className="space-y-1">
                       {Object.entries(formData.custom_fields || {}).map(([key, val]) => (
                          <p key={key}><span className="font-bold" style={{ color: '#334155' }}>{key}:</span> {val}</p>
                       ))}
                    </div>
                 </div>
              </div>
              
              <div className="absolute bottom-6 left-0 w-full text-center px-12">
                 <p className="text-[10px] font-medium" style={{ color: '#64748b' }}>Esta cotización fue realizada en Fornax. Si quiere contactar al desarrollador entre a la página <a href="https://davidsz.com.mx/" className="text-blue-500 underline" target="_blank" rel="noreferrer">https://davidsz.com.mx/</a></p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
