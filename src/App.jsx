import React, { useState, useEffect } from 'react';
import { 
  Save, Trash2, Printer, BookOpen, FileText, Plus, X,
  Settings, Target, Briefcase, Wrench, AlertCircle,
  MousePointerClick, LayoutDashboard, Layers, Users, Smile, ChevronRight
} from 'lucide-react';

// --- CONFIGURACIÓN DE DATOS INICIALES ---
const defaultProcesses = {
  strategic: [{ id: 's1', name: 'Planeación' }, { id: 's2', name: 'Gestión de Calidad' }],
  mission: [{ id: 'm1', name: 'Ventas y Mercadeo' }, { id: 'm2', name: 'Producción y Prestación' }],
  support: [{ id: 'sup1', name: 'Recursos Humanos' }, { id: 'sup2', name: 'Compras' }]
};

const defaultRow = () => ({
  id: crypto.randomUUID(), providers: '', inputs: '', activity: '', outputs: '', clients: '', resources: ''
});

const getEmptyDetails = () => ({
  objective: '', owner: '', indicators: '',
  characterization: { 
    plan: [defaultRow()], 
    do: [defaultRow()], 
    check: [defaultRow()], 
    act: [defaultRow()] 
  }
});

export default function App() {
  const [companyName, setCompanyName] = useState('Nombre de la Empresa');
  const [processes, setProcesses] = useState(defaultProcesses);
  const [selectedProcessId, setSelectedProcessId] = useState('s1');
  const [processDetails, setProcessDetails] = useState({});
  const [notification, setNotification] = useState('');
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [printMode, setPrintMode] = useState('normal'); 

  // Cargar datos al iniciar
  useEffect(() => {
    const saved = localStorage.getItem('sgc_iso9001_vfinal');
    if (saved) {
      const parsed = JSON.parse(saved);
      setCompanyName(parsed.companyName || 'Nombre de la Empresa');
      setProcesses(parsed.processes || defaultProcesses);
      setProcessDetails(parsed.processDetails || {});
      setSelectedProcessId(parsed.selectedProcessId || 's1');
    } else {
      const init = {};
      Object.values(defaultProcesses).flat().forEach(p => init[p.id] = getEmptyDetails());
      setProcessDetails(init);
    }
  }, []);

  const save = () => {
    localStorage.setItem('sgc_iso9001_vfinal', JSON.stringify({ companyName, processes, processDetails, selectedProcessId }));
    setNotification('✅ Guardado en este navegador');
    setTimeout(() => setNotification(''), 3000);
  };

  // Lógica de impresión
  const triggerPrint = () => {
    const content = document.getElementById('isolated-print-root');
    const popup = window.open('', '_blank');
    if (!popup) return alert("Por favor permite las ventanas emergentes.");
    popup.document.write(`
      <html>
        <head>
          <title>SGC - ${companyName}</title>
          <script src="[https://cdn.tailwindcss.com](https://cdn.tailwindcss.com)"></script>
          <style>
            @page { size: letter landscape; margin: 1cm; }
            body { font-family: sans-serif; -webkit-print-color-adjust: exact !important; }
            .avoid-break { break-inside: avoid; page-break-inside: avoid; margin-bottom: 20px; }
            .page-break { page-break-before: always; }
          </style>
        </head>
        <body class="p-8">
          ${content.innerHTML}
          <script>setTimeout(() => { window.print(); window.close(); }, 700);</script>
        </body>
      </html>
    `);
    popup.document.close();
    setPrintMode('normal');
  };

  useEffect(() => { if (printMode !== 'normal') triggerPrint(); }, [printMode]);

  // Handlers para edición
  const handleCharChange = (pId, phase, rowId, field, value) => {
    setProcessDetails(prev => {
      const proc = prev[pId] || getEmptyDetails();
      const nPhase = proc.characterization[phase].map(r => r.id === rowId ? {...r, [field]: value} : r);
      return { ...prev, [pId]: { ...proc, characterization: { ...proc.characterization, [phase]: nPhase } } };
    });
  };

  const addRow = (pId, phase) => {
    setProcessDetails(prev => {
      const proc = prev[pId] || getEmptyDetails();
      return { ...prev, [pId]: { ...proc, characterization: { ...proc.characterization, [phase]: [...proc.characterization[phase], defaultRow()] } } };
    });
  };

  // --- COMPONENTES DE INTERFAZ ---
  const renderTable = (phaseKey, title, colorClass) => {
    const details = processDetails[selectedProcessId] || getEmptyDetails();
    return (
      <div className="mb-8 border rounded-xl overflow-hidden shadow-sm bg-white">
        <div className={`p-3 font-bold uppercase flex justify-between items-center ${colorClass}`}>
          <span>{title}</span>
          <button onClick={() => addRow(selectedProcessId, phaseKey)} className="bg-white/50 px-2 py-1 rounded text-xs flex items-center gap-1 hover:bg-white">
            <Plus size={14}/> Fila
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-gray-50 border-b">
              <tr>
                {['1. Proveedor','2. Entradas','3. Actividad','4. Salidas','5. Clientes','6. Recursos'].map(h => (
                  <th key={h} className="p-2 border-r font-bold text-gray-600">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {details.characterization[phaseKey].map(row => (
                <tr key={row.id} className="border-b last:border-0">
                  {['providers','inputs','activity','outputs','clients','resources'].map(f => (
                    <td key={f} className="p-0 border-r last:border-0">
                      <textarea 
                        className="w-full p-2 outline-none resize-none min-h-[80px] focus:bg-blue-50"
                        value={row[f]}
                        onChange={(e) => handleCharChange(selectedProcessId, phaseKey, row.id, f, e.target.value)}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20 font-sans">
      <nav className="bg-slate-900 text-white p-4 sticky top-0 z-50 flex justify-between items-center shadow-xl">
        <div className="flex items-center gap-2"><Settings className="text-blue-400" /><h1 className="font-bold">ISO 9001 - Escuela Virtual</h1></div>
        <div className="flex gap-2">
          {notification && <span className="text-xs text-emerald-400 self-center">{notification}</span>}
          <button onClick={save} className="bg-blue-600 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-blue-500 transition-all"><Save size={16}/> Guardar</button>
          <button onClick={() => setShowPrintModal(true)} className="bg-emerald-600 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-emerald-500 transition-all"><Printer size={16}/> Exportar PDF</button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-4 md:p-8">
        <div className="text-center mb-10">
          <input 
            type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)}
            className="text-4xl font-black uppercase tracking-tighter bg-transparent border-b-4 border-blue-500 focus:outline-none text-center w-full max-w-2xl py-2 mb-2"
          />
          <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">Mapa de Procesos Estratégico</p>
        </div>

        {/* Mapa de Procesos Interactivo */}
        <section className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 mb-10">
          <div className="flex flex-col md:flex-row gap-6 justify-center items-stretch">
            <div className="md:w-48 bg-slate-50 border-2 border-slate-200 rounded-2xl p-6 flex flex-col justify-center items-center text-center">
              <Users size={40} className="text-blue-600 mb-2"/><h3 className="font-black text-xs uppercase">Requisitos</h3>
            </div>
            <div className="flex-1 space-y-4">
              {Object.entries(processes).map(([k, v]) => (
                <div key={k} className="p-4 border-2 rounded-2xl bg-white border-slate-100 shadow-sm">
                  <h4 className="text-[10px] font-black uppercase text-slate-400 mb-2">{k}</h4>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {v.map(p => (
                      <button 
                        key={p.id} onClick={() => setSelectedProcessId(p.id)}
                        className={`px-4 py-2 rounded-xl text-sm font-bold transition-all border-2 
                        ${selectedProcessId === p.id ? 'bg-blue-600 border-transparent text-white scale-105 shadow-lg' : 'bg-slate-50 border-slate-100 hover:bg-slate-100'}`}
                      >
                        {p.name}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="md:w-48 bg-emerald-50 border-2 border-emerald-200 rounded-2xl p-6 flex flex-col justify-center items-center text-center">
              <Smile size={40} className="text-emerald-600 mb-2"/><h3 className="font-black text-xs uppercase">Satisfacción</h3>
            </div>
          </div>
        </section>

        {/* Caracterización PHVA */}
        {selectedProcessId && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white rounded-3xl shadow-xl border border-slate-200 p-8 border-t-[12px] border-t-blue-600">
              <h2 className="text-3xl font-black uppercase mb-6">Ficha de Proceso: <span className="text-blue-600">{
                [...processes.strategic, ...processes.mission, ...processes.support].find(p => p.id === selectedProcessId)?.name
              }</span></h2>
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="p-4 bg-slate-50 rounded-xl border">
                  <label className="text-xs font-black uppercase text-slate-400 block mb-2">Objetivo</label>
                  <textarea 
                    className="w-full p-2 text-sm bg-white border rounded h-20"
                    value={processDetails[selectedProcessId]?.objective || ''}
                    onChange={(e) => updateDetail(selectedProcessId, 'objective', e.target.value)}
                  />
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border">
                  <label className="text-xs font-black uppercase text-slate-400 block mb-2">Responsable</label>
                  <input 
                    className="w-full p-2 text-sm bg-white border rounded"
                    value={processDetails[selectedProcessId]?.owner || ''}
                    onChange={(e) => updateDetail(selectedProcessId, 'owner', e.target.value)}
                  />
                </div>
              </div>
              {renderTable('plan', 'Planear', 'bg-blue-100 text-blue-800')}
              {renderTable('do', 'Hacer', 'bg-emerald-100 text-emerald-800')}
              {renderTable('check', 'Verificar', 'bg-amber-100 text-amber-800')}
              {renderTable('act', 'Actuar', 'bg-red-100 text-red-800')}
            </div>
          </div>
        )}
      </main>

      {/* Contenedor Oculto para Impresión */}
      <div id="isolated-print-root" style={{ display: 'none' }}>
        <h1 className="text-4xl font-black uppercase text-center">{companyName}</h1>
        <h2 className="text-xl font-bold text-center border-b-4 border-blue-600 mb-10 pb-4">Gestión por Procesos ISO 9001:2015</h2>
        {/* Aquí se inyecta el mapa o la ficha seleccionada al imprimir */}
      </div>

      {showPrintModal && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl">
            <h3 className="text-2xl font-black uppercase mb-6">Exportar a PDF</h3>
            <button onClick={() => setPrintMode('map')} className="w-full bg-blue-600 text-white p-4 rounded-2xl font-bold mb-4 hover:bg-blue-700 transition-all">Mapa Estratégico</button>
            <button onClick={() => setShowPrintModal(false)} className="w-full text-slate-400 font-bold uppercase text-xs">Cerrar</button>
          </div>
        </div>
      )}
    </div>
  );

  function updateDetail(pId, field, value) {
    setProcessDetails(prev => ({ ...prev, [pId]: { ...(prev[pId] || getEmptyDetails()), [field]: value } }));
  }
}
