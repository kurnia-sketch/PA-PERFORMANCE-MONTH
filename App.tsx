
import React, { useState, useMemo, useRef } from 'react';
import { getInitialMachineryData, MONTHS } from './constants';
import MetricChart from './components/MetricChart';
import DataEditor from './components/DataEditor';
import { MachineData } from './types';
import html2canvas from 'html2canvas';

type ViewMode = 'dashboard' | 'edit';

const App: React.FC = () => {
  const [currentMonth, setCurrentMonth] = useState(0); // January
  const [currentYear, setCurrentYear] = useState(2025);
  const [machinery, setMachinery] = useState<MachineData[]>(getInitialMachineryData(0, 2025));
  const [view, setView] = useState<ViewMode>('dashboard');
  const [lastUpdated, setLastUpdated] = useState(new Date().toLocaleTimeString());
  
  const dashboardRef = useRef<HTMLDivElement>(null);
  const [isCapturing, setIsCapturing] = useState(false);

  // Calculate fleet-wide monthly average PA%
  const fleetAvg = useMemo(() => {
    const total = machinery.reduce((sum, m) => sum + m.avg, 0);
    return (total / machinery.length).toFixed(1);
  }, [machinery]);

  const handleUpdateData = (newData: MachineData[]) => {
    setMachinery(newData);
    setLastUpdated(new Date().toLocaleTimeString());
  };

  const closeEditor = () => {
    setView('dashboard');
  };

  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newMonth = parseInt(e.target.value);
    setCurrentMonth(newMonth);
    const newData = getInitialMachineryData(newMonth, currentYear);
    setMachinery(newData);
    setLastUpdated(new Date().toLocaleTimeString());
  };

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newYear = parseInt(e.target.value);
    setCurrentYear(newYear);
    const newData = getInitialMachineryData(currentMonth, newYear);
    setMachinery(newData);
    setLastUpdated(new Date().toLocaleTimeString());
  };

  const downloadSnapshot = async () => {
    if (!dashboardRef.current) return;
    setIsCapturing(true);
    
    setTimeout(async () => {
      try {
        const canvas = await html2canvas(dashboardRef.current!, {
          scale: 2,
          useCORS: true,
          backgroundColor: '#f8fafc',
          logging: false,
          ignoreElements: (element) => element.classList.contains('no-capture')
        });
        
        const link = document.createElement('a');
        link.href = canvas.toDataURL('image/png');
        link.download = `Fleet_Dashboard_${MONTHS[currentMonth]}_${currentYear}.png`;
        link.click();
      } catch (err) {
        console.error("Snapshot capture failed:", err);
      } finally {
        setIsCapturing(false);
      }
    }, 100);
  };

  const exportToCSV = () => {
    const headers = ["Date", ...machinery.map(m => `${m.name} (PA%)`)].join(",");
    const rowCount = machinery[0]?.data.length || 0;
    const rows = [];
    for (let i = 0; i < rowCount; i++) {
      const date = machinery[0].data[i].date;
      const values = machinery.map(m => m.data[i]?.value ?? 0).join(",");
      rows.push(`${date},${values}`);
    }
    const averages = ["MONTHLY AVERAGE", ...machinery.map(m => m.avg)].join(",");
    const csvContent = "\uFEFF" + [headers, ...rows, "", averages].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const fileName = `Fleet_Operational_Report_${MONTHS[currentMonth]}_${currentYear}.csv`;
    link.setAttribute("href", url);
    link.setAttribute("download", fileName);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen pb-24">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <div className="flex items-center gap-3 cursor-pointer" onClick={closeEditor}>
              <div className="bg-indigo-600 w-10 h-10 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
                <i className="fas fa-chart-line text-white"></i>
              </div>
              <div>
                <h1 className="text-xl font-black text-slate-900 leading-tight tracking-tight">LEADERIT-SS</h1>
                <p className="text-[10px] text-slate-400 uppercase tracking-widest font-black">Industrial PA Matrix</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {view === 'dashboard' ? (
                <>
                  <button 
                    onClick={downloadSnapshot}
                    disabled={isCapturing}
                    className="flex items-center gap-2 bg-indigo-50 text-indigo-700 px-5 py-2.5 rounded-xl text-xs font-black hover:bg-indigo-100 transition-all border border-indigo-100 uppercase tracking-widest no-capture"
                  >
                    <i className={`fas ${isCapturing ? 'fa-spinner fa-spin' : 'fa-camera'}`}></i>
                    {isCapturing ? 'Capturing...' : 'Snapshot'}
                  </button>
                  <button 
                    onClick={() => setView('edit')}
                    className="flex items-center gap-2 bg-slate-100 text-slate-700 px-5 py-2.5 rounded-xl text-xs font-black hover:bg-slate-200 transition-all uppercase tracking-widest no-capture"
                  >
                    <i className="fas fa-edit"></i>
                    Modify Data
                  </button>
                </>
              ) : (
                <button 
                  onClick={closeEditor}
                  className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-2.5 rounded-xl text-xs font-black hover:bg-indigo-700 transition-all uppercase tracking-widest shadow-lg shadow-indigo-200"
                >
                  <i className="fas fa-check"></i>
                  Finish & Save
                </button>
              )}
              <button 
                onClick={exportToCSV}
                className="hidden md:flex items-center gap-3 bg-slate-900 text-white px-6 py-2.5 rounded-xl text-xs font-black hover:bg-indigo-600 transition-all shadow-xl shadow-slate-200 uppercase tracking-widest no-capture"
              >
                <i className="fas fa-cloud-download-alt"></i>
                Export CSV
              </button>
            </div>
          </div>
        </div>
      </nav>

      {view === 'dashboard' ? (
        <div ref={dashboardRef}>
          <header className="bg-white border-b border-gray-50 py-12 mb-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-10">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 no-capture">
                    <div className="flex items-center bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 gap-3">
                      <i className="far fa-calendar-alt text-indigo-600 text-sm"></i>
                      <select 
                        value={currentMonth} 
                        onChange={handleMonthChange}
                        className="bg-transparent text-xs font-black text-slate-700 uppercase tracking-widest outline-none border-none cursor-pointer"
                      >
                        {MONTHS.map((m, i) => (
                          <option key={i} value={i}>{m}</option>
                        ))}
                      </select>
                      <select 
                        value={currentYear} 
                        onChange={handleYearChange}
                        className="bg-transparent text-xs font-black text-slate-700 uppercase tracking-widest outline-none border-none cursor-pointer"
                      >
                        {[2024, 2025, 2026].map(y => (
                          <option key={y} value={y}>{y}</option>
                        ))}
                      </select>
                    </div>
                    <span className="text-slate-300">|</span>
                    <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest">Active Report</span>
                  </div>
                  <h2 className="text-4xl font-black text-slate-900 tracking-tight">Fleet Operational Performance</h2>
                  <p className="text-slate-400 max-w-xl font-medium leading-relaxed">
                    Real-time Physical Availability (PA%) tracking for heavy mining assets. Last system synchronization at <span className="text-indigo-600 font-bold">{lastUpdated}</span>.
                  </p>
                </div>
                
                <div className="flex gap-6">
                  <div className="bg-slate-50 border border-slate-100 rounded-[2rem] px-10 py-8 shadow-sm">
                    <span className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Fleet Average</span>
                    <div className="flex items-end gap-1">
                       <span className="text-5xl font-black text-indigo-600 tracking-tighter tabular-nums">{fleetAvg}</span>
                       <span className="text-2xl font-black text-slate-300 mb-1.5">%</span>
                    </div>
                  </div>
                  <div className="bg-white border border-slate-100 rounded-[2rem] px-10 py-8 shadow-sm ring-4 ring-slate-50">
                    <span className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">KPI Threshold</span>
                    <div className="flex items-end gap-1">
                       <span className="text-5xl font-black text-slate-300 tracking-tighter tabular-nums">98.0</span>
                       <span className="text-2xl font-black text-slate-200 mb-1.5">%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </header>

          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
              {machinery.map((machine) => (
                <MetricChart key={machine.id} machine={machine} />
              ))}
            </div>

            <div className="mt-20 bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden no-capture">
              <div className="px-10 py-8 border-b border-gray-50 bg-slate-50/30 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-5">
                  <div className="w-12 h-12 rounded-xl bg-white border border-gray-100 shadow-sm flex items-center justify-center text-slate-400">
                    <i className="fas fa-list-check text-lg"></i>
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900 tracking-tight text-lg">Full Operational Logbook</h3>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mt-1">Granular {machinery[0].data.length}-Day Availability Matrix</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-4 py-2 rounded-full border border-indigo-100 uppercase tracking-widest">
                    SYNC STATUS: NOMINAL
                  </span>
                </div>
              </div>
              <div className="overflow-x-auto max-h-[600px] overflow-y-auto custom-scrollbar-slate">
                <table className="w-full text-left border-collapse">
                  <thead className="text-[10px] uppercase text-slate-400 font-black bg-white/95 backdrop-blur-sm sticky top-0 z-10">
                    <tr>
                      <th className="px-10 py-6 border-b border-gray-50">Log Date</th>
                      {machinery.map(m => (
                        <th key={m.id} className="px-10 py-6 border-b border-gray-50">
                          <div className="flex items-center gap-2">
                             <div className="w-2 h-2 rounded-full" style={{ backgroundColor: m.color }}></div>
                             {m.name} PA
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="text-sm text-slate-600 divide-y divide-gray-50">
                    {machinery[0].data.map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 transition-colors group">
                        <td className="px-10 py-5 font-black text-slate-900 border-r border-slate-50/50">{row.date}</td>
                        {machinery.map(m => (
                          <td key={m.id} className="px-10 py-5">
                            <div className="flex items-center justify-between">
                              <span className={`font-mono font-bold text-base ${m.data[idx].value < 98 ? 'text-rose-600' : 'text-slate-700'}`}>
                                {m.data[idx].value}%
                              </span>
                              {m.data[idx].value < 98 && (
                                <span className="flex h-2 w-2 rounded-full bg-rose-500 animate-pulse"></span>
                              )}
                            </div>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="sticky bottom-0 bg-[#0f172a] text-white font-black uppercase text-[10px] tracking-widest">
                    <tr>
                      <td className="px-10 py-6 border-r border-slate-800">Unit Average</td>
                      {machinery.map(m => (
                        <td key={m.id} className="px-10 py-6 text-base tracking-normal">
                          <span style={{ color: m.color }} className="mr-1 opacity-80">●</span>
                          {m.avg}%
                        </td>
                      ))}
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </main>
        </div>
      ) : (
        <DataEditor 
          machinery={machinery} 
          currentMonthName={MONTHS[currentMonth]}
          onSave={handleUpdateData} 
          onCancel={closeEditor} 
        />
      )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.2); border-radius: 10px; }
        
        .custom-scrollbar-slate::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar-slate::-webkit-scrollbar-track { background: #f8fafc; }
        .custom-scrollbar-slate::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .custom-scrollbar-slate::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.5s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default App;
