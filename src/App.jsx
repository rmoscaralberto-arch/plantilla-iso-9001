import React, { useState, useEffect } from 'react';
import { 
  Save, Trash2, Printer, BookOpen, FileText, Plus, X,
  Settings, Target, Briefcase, Wrench, AlertCircle,
  MousePointerClick, LayoutDashboard, Layers, Users, Smile, ChevronRight
} from 'lucide-react';

// --- DATOS INICIALES ---
const defaultProcesses = {
  strategic: [{ id: 's1', name: 'Planeación' }, { id: 's2', name: 'Gestión de Calidad' }],
  mission: [{ id: 'm1', name: 'Ventas' }, { id: 'm2', name: 'Producción' }],
  support: [{ id: 'sup1', name: 'RRHH' }, { id: 'sup2', name: 'Compras' }]
};

const defaultCharacterizationRow = () => ({
  id: crypto.randomUUID(), inputs: '', providers: '', activity: '', outputs: '', clients: '', resources: ''
});

const getEmptyProcessDetails = () => ({
  objective: '', owner: '', indicators: '',
  characterization: { plan: [defaultCharacterizationRow()], do: [defaultCharacterizationRow()], check: [defaultCharacterizationRow()], act: [defaultCharacterizationRow()] }
});

export default function App() {
  const [view, setView] = useState('template'); 
  const [companyName, setCompanyName] = useState('Nombre de la Empresa');
  const [processes, setProcesses] = useState(defaultProcesses);
  const [selectedProcessId, setSelectedProcessId] = useState('s1');
  const [processDetails, setProcessDetails] = useState({});
  const [notification, setNotification] = useState('');
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [printMode, setPrintMode] = useState('normal'); 

  useEffect(() => {
    const savedData = localStorage.getItem('iso9001_v3_production');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setCompanyName(parsed.companyName);
        setProcesses(parsed.processes);
        setProcessDetails(parsed.processDetails);
      } catch (e) { console.error(e); }
    }
  }, []);

  const triggerPrintPopup = () => {
    const printContent = document.getElementById('isolated-print-root');
    const popup = window.open('', '_blank');
    if (!popup) return;
    popup.document.write(`
      <html>
        <head>
          <title>ISO 9001 - ${companyName}</title>
          <script src="[https://cdn.tailwindcss.com](https://cdn.tailwindcss.com)"></script>
          <style>@page { size: letter landscape; margin: 1cm; } body { -webkit-print-color-adjust: exact !important; }</style>
        </head>
        <body><div class="p-4">${printContent.innerHTML}</div><script>setTimeout(() => { window.print(); }, 1000);</script></body>
      </html>
    `);
    popup.document.close();
    setPrintMode('normal');
  };

  useEffect(() => { if (printMode !== 'normal') triggerPrintPopup(); }, [printMode]);

  return (
    <div className="min-h-screen bg-gray-50 p-4 font-sans">
      <div className="bg-slate-800 text-white p-4 mb-4 rounded-lg flex justify-between items-center">
        <h1 className="font-bold">SGC ISO 9001</h1>
        <div className="flex gap-2">
          <button onClick={() => setShowPrintModal(true)} className="bg-emerald-600 px-3 py-1 rounded text-sm">Exportar PDF</button>
        </div>
      </div>
      <div className="max-w-5xl mx-auto bg-white p-8 rounded-xl shadow-sm border">
        <h2 className="text-2xl font-black text-center mb-6 uppercase">Mapa de Procesos</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
           <div className="bg-blue-50 p-4 border rounded-lg text-center font-bold text-blue-800">ENTRADAS</div>
           <div className="space-y-2">
              {Object.entries(processes).map(([k, v]) => (
                <div key={k} className="p-2 border rounded bg-gray-50 text-xs font-bold uppercase">{k}: {v.map(p => p.name).join(', ')}</div>
              ))}
           </div>
           <div className="bg-emerald-50 p-4 border rounded-lg text-center font-bold text-emerald-800">SALIDAS</div>
        </div>
      </div>
      <div id="isolated-print-root" style={{ display: 'none' }}>
        <h1 className="text-2xl font-bold text-center underline mb-8">MAPA DE PROCESOS - ${companyName}</h1>
        <div style={{ display: 'flex', gap: '20px' }}>
          <div style={{ border: '2px solid black', padding: '10px' }}>REQUISITOS</div>
          <div style={{ flex: 1, border: '2px solid black', padding: '10px' }}>PROCESOS SGC</div>
          <div style={{ border: '2px solid black', padding: '10px' }}>SATISFACCIÓN</div>
        </div>
      </div>
      {showPrintModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-lg max-w-sm w-full">
            <h3 className="font-bold mb-4">Opciones de Impresión</h3>
            <button onClick={() => setPrintMode('map')} className="w-full bg-blue-600 text-white p-2 rounded mb-2">Imprimir Mapa</button>
            <button onClick={() => setShowPrintModal(false)} className="w-full text-gray-500">Cancelar</button>
          </div>
        </div>
      )}
    </div>
  );
}
