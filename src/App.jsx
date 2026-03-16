import React, { useState, useEffect } from 'react';
import { 
  Save, 
  Trash2, 
  Printer, 
  BookOpen, 
  FileText, 
  Plus, 
  X,
  Settings,
  Target,
  Briefcase,
  Wrench,
  AlertCircle,
  MousePointerClick,
  LayoutDashboard,
  Layers,
  Users,
  Smile,
  ChevronRight
} from 'lucide-react';

// --- DATOS INICIALES ---
const defaultProcesses = {
  strategic: [
    { id: 's1', name: 'Planeación' },
    { id: 's2', name: 'Gestión de Calidad' }
  ],
  mission: [
    { id: 'm1', name: 'Ventas y Mercadeo' },
    { id: 'm2', name: 'Producción y Prestación' }
  ],
  support: [
    { id: 'sup1', name: 'Recursos Humanos' },
    { id: 'sup2', name: 'Compras' }
  ]
};

const defaultCharacterizationRow = () => ({
  id: crypto.randomUUID(),
  inputs: '',
  providers: '',
  activity: '',
  outputs: '',
  clients: '',
  resources: ''
});

const getEmptyProcessDetails = () => ({
  objective: '',
  owner: '',
  indicators: '',
  characterization: {
    plan: [defaultCharacterizationRow()],
    do: [defaultCharacterizationRow()],
    check: [defaultCharacterizationRow()],
    act: [defaultCharacterizationRow()]
  }
});

export default function App() {
  // --- ESTADOS ---
  const [view, setView] = useState('template'); 
  const [companyName, setCompanyName] = useState('Nombre de la Empresa');
  const [processes, setProcesses] = useState(defaultProcesses);
  const [selectedProcessId, setSelectedProcessId] = useState('s1');
  const [processDetails, setProcessDetails] = useState({});
  const [notification, setNotification] = useState('');
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [printMode, setPrintMode] = useState('normal'); 

  // --- PERSISTENCIA LOCAL ---
  useEffect(() => {
    const savedData = localStorage.getItem('iso9001_v3_production');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        if (parsed.companyName) setCompanyName(parsed.companyName);
        if (parsed.processes) setProcesses(parsed.processes);
        if (parsed.processDetails) setProcessDetails(parsed.processDetails);
        if (parsed.selectedProcessId) setSelectedProcessId(parsed.selectedProcessId);
      } catch (e) { console.error("Error cargando datos localmente", e); }
    } else {
      const initialDetails = {};
      Object.values(defaultProcesses).flat().forEach(p => {
        initialDetails[p.id] = getEmptyProcessDetails();
      });
      setProcessDetails(initialDetails);
    }
  }, []);

  // --- MOTOR DE IMPRESIÓN (VENTANA AISLADA) ---
  const triggerPrintPopup = () => {
    const printContent = document.getElementById('isolated-print-root');
    if (!printContent) return;

    const popup = window.open('', '_blank');
    if (!popup) {
      alert(" Tu navegador bloqueó la ventana de impresión. Por favor, permite las ventanas emergentes.");
      setPrintMode('normal');
      return;
    }

    popup.document.write(`
      <!DOCTYPE html>
      <html lang="es">
        <head>
          <title>ISO 9001 - ${companyName}</title>
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
            @page { size: letter landscape; margin: 1cm; }
            body { 
              background-color: white; 
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            .page-break { page-break-before: always; }
            .avoid-break { break-inside: avoid; page-break-inside: avoid; }
            .print-page-container { width: 100%; max-width: 25.94cm; margin: 0 auto; }
          </style>
        </head>
        <body>
          <div class="p-4 font-sans text-sm">${printContent.innerHTML}</div>
          <script>
            setTimeout(() => { window.focus(); window.print(); }, 1000);
          </script>
        </body>
      </html>
    `);
    popup.document.close();
    setPrintMode('normal');
  };

  useEffect(() => {
    if (printMode !== 'normal') {
      const timer = setTimeout(() => triggerPrintPopup(), 150);
      return () => clearTimeout(timer);
    }
  }, [printMode]);

  // --- HANDLERS ---
  const saveData = () => {
    const dataToSave = { companyName, processes, processDetails, selectedProcessId };
    localStorage.setItem('iso9001_v3_production', JSON.stringify(dataToSave));
    showNotification('Información guardada localmente.');
  };

  const clearData = () => {
    if (window.confirm('¿Borrar toda la información? Esta acción no se puede deshacer.')) {
      setCompanyName('Nombre de la Empresa');
      setProcesses(defaultProcesses);
      const initialDetails = {};
      Object.values(defaultProcesses).flat().forEach(p => {
        initialDetails[p.id] = getEmptyProcessDetails();
      });
      setProcessDetails(initialDetails);
      setSelectedProcessId('s1');
      localStorage.removeItem('iso9001_v3_production');
      showNotification('Sistema reiniciado.');
    }
  };

  const showNotification = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(''), 3000);
  };

  const handleProcessChange = (category, id, newName) => {
    setProcesses(prev => ({
      ...prev,
      [category]: prev[category].map(p => p.id === id ? { ...p, name: newName } : p)
    }));
  };

  const addProcess = (category) => {
    const newId = crypto.randomUUID();
    setProcesses(prev => ({
      ...prev,
      [category]: [...prev[category], { id: newId, name: 'Nuevo Proceso' }]
    }));
    setProcessDetails(prev => ({ ...prev, [newId]: getEmptyProcessDetails() }));
    setSelectedProcessId(newId);
  };

  const removeProcess = (category, id, e) => {
    e.stopPropagation();
    if (window.confirm('¿Eliminar este proceso y su caracterización?')) {
      setProcesses(prev => ({
        ...prev,
        [category]: prev[category].filter(p => p.id !== id)
      }));
      setProcessDetails(prev => {
        const n = { ...prev }; delete n[id]; return n;
      });
      if (selectedProcessId === id) setSelectedProcessId(null);
    }
  };

  const handleDetailChange = (pId, field, value) => {
    if (!pId) return;
    setProcessDetails(prev => ({
      ...prev,
      [pId]: { ...(prev[pId] || getEmptyProcessDetails()), [field]: value }
    }));
  };

  const handleCharChange = (pId, phase, rowId, field, value) => {
    setProcessDetails(prev => {
      const proc = prev[pId] || getEmptyProcessDetails();
      const nPhase = proc.characterization[phase].map(r => r.id === rowId ? { ...r, [field]: value } : r);
      return { ...prev, [pId]: { ...proc, characterization: { ...proc.characterization, [phase]: nPhase } } };
    });
  };

  const addCharRow = (pId, phase) => {
    setProcessDetails(prev => {
      const proc = prev[pId] || getEmptyProcessDetails();
      return { ...prev, [pId]: { ...proc, characterization: { ...proc.characterization, [phase]: [...proc.characterization[phase], defaultCharacterizationRow()] } } };
    });
  };

  const removeCharRow = (pId, phase, rowId) => {
    setProcessDetails(prev => {
      const proc = prev[pId];
      return { ...prev, [pId]: { ...proc, characterization: { ...proc.characterization, [phase]: currentProc.characterization[phase].filter(r => r.id !== rowId) } } };
    });
  };

  const getSelectedProcessName = () => {
    if (!selectedProcessId) return '';
    for (const cat in processes) {
      const f = processes[cat].find(p => p.id === selectedProcessId);
      if (f) return f.name;
    }
    return '';
  };

  const getAllProcessesInOrder = () => [
    ...processes.strategic,
    ...processes.mission,
    ...processes.support
  ];

  // --- RENDERIZADORES DE PANTALLA ---
  const renderScreenProcessBlock = ({ title, category, icon: Icon, colorClass, highlightClass }) => (
    <div className={`p-4 rounded-xl border-2 ${colorClass} bg-white shadow-sm w-full`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 font-bold text-gray-700">
          <Icon size={20} /> <h3 className="uppercase tracking-wider text-sm">{title}</h3>
        </div>
        <button onClick={() => addProcess(category)} className="p-1 hover:bg-gray-100 rounded text-gray-500"><Plus size={16} /></button>
      </div>
      <div className="flex flex-wrap gap-2 justify-center">
        {processes[category].map(p => {
          const isSelected = selectedProcessId === p.id;
          return (
            <div key={p.id} onClick={() => setSelectedProcessId(p.id)} className={`group relative flex items-center border rounded-lg p-2 min-w-[150px] cursor-pointer transition-all ${isSelected ? `ring-2 ring-offset-1 ${highlightClass} bg-slate-50 border-transparent` : 'bg-white border-gray-200'}`}>
              <input type="text" value={p.name} onChange={(e) => handleProcessChange(category, p.id, e.target.value)} className={`bg-transparent text-center text-sm font-medium w-full focus:outline-none ${isSelected ? 'text-blue-900 font-bold' : 'text-gray-800'}`} />
              <button onClick={(e) => removeProcess(category, p.id, e)} className="absolute -top-2 -right-2 bg-red-100 text-red-600 rounded-full p-1 opacity-0 group-hover:opacity-100"><X size={12} /></button>
            </div>
          )
        })}
      </div>
    </div>
  );

  const renderScreenForm = ({ pId, pName, details }) => {
    const renderPhase = (phaseKey, title, colorCode) => (
      <div className="mb-8">
        <div className={`flex items-center justify-between p-3 rounded-t-lg bg-${colorCode}-100 border border-${colorCode}-200`}>
          <h4 className={`font-bold text-${colorCode}-800 uppercase`}>{title}</h4>
          <button onClick={() => addCharRow(pId, phaseKey)} className={`text-${colorCode}-700 hover:bg-${colorCode}-200 p-1 rounded text-sm flex items-center gap-1`}><Plus size={16} /> Fila</button>
        </div>
        <div className="border-x border-b border-gray-200 rounded-b-lg overflow-hidden bg-white">
          <div className="grid grid-cols-6 bg-gray-100 border-b border-gray-200 text-[10px] font-bold text-gray-600 uppercase text-center">
            {['1. Proveedor','2. Entradas','3. Actividad','4. Salidas','5. Clientes','6. Recursos'].map(h => <div key={h} className="p-2 border-r last:border-0">{h}</div>)}
          </div>
          {details.characterization[phaseKey].map(row => (
            <div key={row.id} className="grid grid-cols-6 border-b last:border-0 relative group">
              {['providers','inputs','activity','outputs','clients','resources'].map(f => (
                <div key={f} className="border-r last:border-0">
                  <textarea className="w-full p-2 text-sm resize-none focus:outline-none min-h-[80px]" value={row[f]} onChange={(e) => handleCharChange(pId, phaseKey, row.id, f, e.target.value)} />
                </div>
              ))}
              {details.characterization[phaseKey].length > 1 && <button onClick={() => removeCharRow(pId, phaseKey, row.id)} className="absolute right-1 top-1 text-red-400 group-hover:text-red-600"><Trash2 size={14} /></button>}
            </div>
          ))}
        </div>
      </div>
    );

    return (
      <section className="bg-white p-6 rounded-2xl shadow-sm border-t-4 border-t-blue-500 mt-4">
        <h2 className="text-2xl font-bold text-slate-800 border-b pb-2 mb-6">Caracterización: <span className="text-blue-600">{pName}</span></h2>
        <div className="grid grid-cols-2 gap-6 mb-8">
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
            <h4 className="font-bold text-slate-800 uppercase mb-2 text-sm">Objetivo</h4>
            <textarea className="w-full p-2 text-sm bg-white border rounded min-h-[60px]" value={details.objective} onChange={(e) => handleDetailChange(pId, 'objective', e.target.value)} />
          </div>
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
            <h4 className="font-bold text-slate-800 uppercase mb-2 text-sm">Responsable</h4>
            <input type="text" className="w-full p-2 text-sm bg-white border rounded" value={details.owner} onChange={(e) => handleDetailChange(pId, 'owner', e.target.value)} />
          </div>
        </div>
        {renderPhase('plan','Planear','blue')} {renderPhase('do','Hacer','emerald')}
        {renderPhase('check','Verificar','amber')} {renderPhase('act','Actuar','red')}
        <div className="mt-6">
          <h4 className="font-bold uppercase mb-2">Indicadores</h4>
          <textarea className="w-full p-4 text-sm bg-gray-50 border rounded-lg min-h-[100px]" value={details.indicators} onChange={(e) => handleDetailChange(pId, 'indicators', e.target.value)} />
        </div>

        {/* NOTAS FINALES AJUSTADAS */}
        <div className="mt-8 p-4 bg-slate-50 border-l-4 border-slate-400 text-sm text-slate-600 rounded-r-lg space-y-2">
          <p className="flex items-start gap-2">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            Los requisitos de la norma ISO 9001:2015 aplicables al proceso se pueden apreciar en la matriz de requisitos.
          </p>
          <p className="flex items-start gap-2">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            Los documentos del proceso pueden apreciarse en el listado de documentos correspondiente.
          </p>
          <p className="flex items-start gap-2">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            Los riesgos del proceso se encuentran en la matriz de riesgos respectiva.
          </p>
        </div>
      </section>
    );
  };

  // --- RENDERIZADORES DE IMPRESIÓN ---
  const renderPrintMap = () => (
    <div className="w-full text-gray-800">
      <div className="text-center border-b-2 border-blue-500 pb-4 mb-8">
        <h1 className="text-3xl font-black uppercase mb-1">Enfoque a Procesos (ISO 9001:2015)</h1>
        <div className="text-xl font-semibold text-blue-800">{companyName}</div>
      </div>
      <div className="flex flex-row gap-6 items-stretch justify-center w-full min-h-[450px]">
        <div className="w-48 bg-blue-50 border-2 border-blue-200 rounded-2xl p-4 flex flex-col justify-center items-center text-center relative shadow-sm">
          <Users size={40} className="text-blue-600 mb-3" /> <h3 className="font-black text-blue-900 leading-tight">Requisitos del Cliente</h3><div className="absolute -right-6 top-1/2 -translate-y-1/2 text-blue-300"><ChevronRight size={48} /></div>
        </div>
        <div className="flex-1 flex flex-col justify-between gap-6">
          {Object.entries({strategic:'Estratégicos', mission:'Misionales', support:'Apoyo'}).map(([k,v]) => (
            <div key={k} className="p-4 rounded-xl border-2 bg-white text-center">
              <div className="font-bold uppercase border-b pb-1 mb-2 text-sm text-gray-600">Procesos {v}</div>
              <div className="flex flex-wrap gap-2 justify-center">{processes[k].map(p => <div key={p.id} className="border border-gray-200 bg-gray-50 rounded-lg px-3 py-1 font-bold text-gray-800 text-sm">{p.name}</div>)}</div>
            </div>
          ))}
        </div>
        <div className="w-48 bg-emerald-50 border-2 border-emerald-200 rounded-2xl p-4 flex flex-col justify-center items-center text-center relative shadow-sm">
          <div className="absolute -left-6 top-1/2 -translate-y-1/2 text-emerald-300"><ChevronRight size={48} /></div>
          <Smile size={40} className="text-emerald-600 mb-3" /> <h3 className="font-black text-emerald-900 leading-tight">Satisfacción del Cliente</h3>
        </div>
      </div>
    </div>
  );

  const renderPrintChar = (pId, pName, details) => (
    <div className="w-full text-gray-800">
      <div className="text-left border-b-2 border-gray-300 pb-3 mb-4">
        <h1 className="text-2xl font-black uppercase mb-1">Enfoque a Procesos (ISO 9001) - {companyName}</h1>
      </div>
      <div className="mb-6 bg-blue-50 p-3 rounded-lg border border-blue-100 flex items-center gap-2 avoid-break">
        <span className="text-lg font-bold">Ficha: {pName}</span>
      </div>
      <div className="grid grid-cols-2 gap-4 mb-6 avoid-break">
        <div className="p-3 border rounded-lg bg-gray-50">
          <h4 className="font-bold uppercase mb-1 text-xs">Objetivo</h4><div className="text-sm">{details.objective || '-'}</div>
        </div>
        <div className="p-3 border rounded-lg bg-gray-50">
          <h4 className="font-bold uppercase mb-1 text-xs">Responsable</h4><div className="text-sm">{details.owner || '-'}</div>
        </div>
      </div>
      {['plan','do','check','act'].map(k => (
        <div key={k} className="mb-6 avoid-break shadow-sm rounded-lg overflow-hidden border border-gray-200">
          <div className={`font-bold uppercase p-2 text-xs bg-gray-100 border-b`}>{k}</div>
          <div className="grid grid-cols-6 bg-gray-50 border-b text-[9px] font-bold text-center">
            {['1. Proveedor','2. Entradas','3. Actividad','4. Salidas','5. Clientes','6. Recursos'].map(h => <div key={h} className="p-1 border-r last:border-0">{h}</div>)}
          </div>
          {details.characterization[k].map(r => (
            <div key={r.id} className="grid grid-cols-6 border-b last:border-0 text-[10px] bg-white">
              {['providers','inputs','activity','outputs','clients','resources'].map(f => <div key={f} className="p-2 border-r last:border-0 whitespace-pre-wrap">{r[f] || '-'}</div>)}
            </div>
          ))}
        </div>
      ))}
      <div className="mt-4 border p-3 rounded-lg bg-gray-50 avoid-break">
        <h4 className="font-bold uppercase mb-1 text-xs">Indicadores</h4><div className="text-sm">{details.indicators || '-'}</div>
      </div>
      
      {/* NOTAS FINALES PARA PDF */}
      <div className="mt-6 p-3 bg-slate-50 border-l-4 border-slate-400 text-[10px] text-slate-600 rounded-r-lg space-y-1 avoid-break">
        <p>• Los requisitos de la norma ISO 9001:2015 aplicables al proceso se pueden apreciar en la matriz de requisitos.</p>
        <p>• Los documentos del proceso pueden apreciarse en el listado de documentos correspondiente.</p>
        <p>• Los riesgos del proceso se encuentran en la matriz de riesgos respectiva.</p>
      </div>
    </div>
  );

  const isMac = typeof window !== 'undefined' && navigator.userAgent.toUpperCase().includes('MAC');

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800 pb-12">
      {showPrintModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100]">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6">
            <h3 className="text-xl font-bold mb-4">Exportar PDF</h3>
            <div className="space-y-3">
              <button onClick={() => executePrint('map')} className="w-full flex items-center gap-4 p-4 border rounded-xl hover:bg-blue-50 transition-colors text-left group">
                <LayoutDashboard className="text-blue-600" /> <div><h4 className="font-bold">Mapa de Procesos</h4><p className="text-sm text-gray-500">Solo el esquema visual.</p></div>
              </button>
              <button onClick={() => executePrint('current')} disabled={!selectedProcessId} className="w-full flex items-center gap-4 p-4 border rounded-xl hover:bg-emerald-50 transition-colors text-left group disabled:opacity-50">
                <FileText className="text-emerald-600" /> <div><h4 className="font-bold">Ficha Seleccionada</h4><p className="text-sm text-gray-500">Caracterización de {getSelectedProcessName()}.</p></div>
              </button>
              <button onClick={() => executePrint('all')} className="w-full flex items-center gap-4 p-4 border rounded-xl hover:bg-indigo-50 transition-colors text-left group">
                <Layers className="text-indigo-600" /> <div><h4 className="font-bold">Todo el Sistema</h4><p className="text-sm text-gray-500">Mapa + todas las fichas en hojas separadas.</p></div>
              </button>
            </div>
            <div className="mt-6 text-right"><button onClick={() => setShowPrintModal(false)} className="px-4 py-2 text-gray-600">Cancelar</button></div>
          </div>
        </div>
      )}

      {printMode !== 'normal' && (
        <div className="fixed bottom-0 left-0 right-0 bg-amber-100 p-4 text-center z-[101] border-t border-amber-300">
          Modo Impresión Activo. Si no abre, presiona <strong>{isMac ? 'Cmd + P' : 'Ctrl + P'}</strong>. 
          <button onClick={() => setPrintMode('normal')} className="ml-4 bg-amber-600 text-white px-3 py-1 rounded">Cerrar</button>
        </div>
      )}

      <div className="bg-slate-800 text-white p-4 sticky top-0 z-50 shadow-md flex justify-between items-center">
        <div className="flex items-center gap-3"><Settings className="text-blue-400" /><h1 className="text-xl font-bold hidden sm:block">ISO 9001 - Escuela Virtual</h1></div>
        <div className="flex items-center gap-2">
          {notification && <span className="text-sm text-green-400">{notification}</span>}
          <button onClick={saveData} className="bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded text-sm flex items-center gap-2"><Save size={16}/> Guardar</button>
          <button onClick={() => setShowPrintModal(true)} className="bg-emerald-600 hover:bg-emerald-700 px-3 py-2 rounded text-sm flex items-center gap-2"><Printer size={16}/> Exportar</button>
          <button onClick={clearData} className="bg-red-600 hover:bg-red-700 px-3 py-2 rounded text-sm"><Trash2 size={16}/></button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 sm:p-8">
        <div className="text-center pb-4 mb-4">
          <h1 className="text-3xl font-black text-slate-800 uppercase tracking-tight mb-2">Enfoque a Procesos</h1>
          <input type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)} className="text-2xl font-semibold text-center text-blue-800 bg-transparent border-b-2 border-blue-500 focus:outline-none w-full max-w-lg" placeholder="Nombre de la Empresa" />
        </div>

        <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex flex-col md:flex-row gap-6 items-stretch justify-center">
            <div className="md:w-48 bg-blue-50 border-2 border-blue-200 rounded-2xl p-4 flex flex-col justify-center items-center text-center relative group">
              <Users size={32} className="text-blue-600 mb-2" /><h3 className="font-black text-blue-900 text-sm">Entradas</h3>
              <div className="hidden md:flex absolute -right-6 top-1/2 -translate-y-1/2 text-blue-300"><ChevronRight size={32} /></div>
            </div>
            <div className="flex-1 space-y-4">
              {renderScreenProcessBlock({ title: "Estratégicos", category: "strategic", icon: Target, colorClass: "border-indigo-100", highlightClass: "ring-indigo-500" })}
              {renderScreenProcessBlock({ title: "Misionales", category: "mission", icon: Briefcase, colorClass: "border-emerald-100", highlightClass: "ring-emerald-500" })}
              {renderScreenProcessBlock({ title: "Apoyo", category: "support", icon: Wrench, colorClass: "border-orange-100", highlightClass: "ring-orange-500" })}
            </div>
            <div className="md:w-48 bg-emerald-50 border-2 border-emerald-200 rounded-2xl p-4 flex flex-col justify-center items-center text-center relative shadow-sm">
              <div className="hidden md:flex absolute -left-6 top-1/2 -translate-y-1/2 text-emerald-300"><ChevronRight size={32} /></div>
              <Smile size={32} className="text-emerald-600 mb-2" /><h3 className="font-black text-emerald-900 text-sm">Salidas</h3>
            </div>
          </div>
        </section>

        {selectedProcessId ? renderScreenForm({ pId: selectedProcessId, pName: getSelectedProcessName(), details: processDetails[selectedProcessId] || getEmptyProcessDetails() }) : <div className="p-12 text-center text-gray-400">Selecciona un proceso arriba</div>}
      </div>

      <div id="isolated-print-root" style={{ display: 'none' }}>
        {printMode === 'map' && <div className="print-page-container">{renderPrintMap()}</div>}
        {printMode === 'current' && selectedProcessId && <div className="print-page-container">{renderPrintChar(selectedProcessId, getSelectedProcessName(), processDetails[selectedProcessId] || getEmptyProcessDetails())}</div>}
        {printMode === 'all' && (
          <div>
            <div className="print-page-container">{renderPrintMap()}</div>
            {getAllProcessesInOrder().map(p => <div key={p.id} className="page-break print-page-container">{renderPrintChar(p.id, p.name, processDetails[p.id] || getEmptyProcessDetails())}</div>)}
          </div>
        )}
      </div>
    </div>
  );

  function executePrint(mode) {
    setShowPrintModal(false);
    setPrintMode(mode);
  }
}
