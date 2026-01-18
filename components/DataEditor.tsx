
import React, { useState, useRef, useEffect } from 'react';
import { MachineData } from '../types';

interface DataEditorProps {
  machinery: MachineData[];
  currentMonthName: string;
  onSave: (newData: MachineData[]) => void;
  onCancel: () => void;
}

const DataEditor: React.FC<DataEditorProps> = ({ machinery, currentMonthName, onSave, onCancel }) => {
  const [localData, setLocalData] = useState<MachineData[]>(
    JSON.parse(JSON.stringify(machinery))
  );

  // Ref to track latest state for auto-save on unmount
  const dataRef = useRef(localData);
  
  useEffect(() => {
    dataRef.current = localData;
  }, [localData]);

  // Auto-save when component is closed (unmounted)
  useEffect(() => {
    return () => {
      onSave(dataRef.current);
    };
  }, []);

  const tableContainerRef = useRef<HTMLDivElement>(null);
  const topScrollRef = useRef<HTMLDivElement>(null);

  const handleTopScroll = () => {
    if (topScrollRef.current && tableContainerRef.current) {
      tableContainerRef.current.scrollLeft = topScrollRef.current.scrollLeft;
    }
  };

  const handleTableScroll = () => {
    if (tableContainerRef.current && topScrollRef.current) {
      topScrollRef.current.scrollLeft = tableContainerRef.current.scrollLeft;
    }
  };

  const handleInputChange = (machineId: string, dateIndex: number, newValue: string) => {
    const value = parseFloat(newValue) || 0;
    const clampedValue = Math.min(100, Math.max(0, value));

    setLocalData(prev => prev.map(m => {
      if (m.id === machineId) {
        const newData = [...m.data];
        newData[dateIndex] = { ...newData[dateIndex], value: clampedValue };
        const total = newData.reduce((sum, d) => sum + d.value, 0);
        const avg = parseFloat((total / newData.length).toFixed(1));
        return { ...m, data: newData, avg };
      }
      return m;
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(localData);
    onCancel(); // Use the standard close trigger
  };

  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-500">
      <div className="bg-white rounded-[2rem] shadow-2xl border border-gray-100 overflow-hidden flex flex-col">
        {/* Header Branding Section */}
        <div className="px-10 py-12 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-8 bg-white">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="bg-indigo-600 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter">Editor Mode</span>
              <h2 className="text-4xl font-black text-slate-900 tracking-tight">Monthly Fleet Calibration</h2>
            </div>
            <p className="text-slate-400 font-medium max-w-2xl">
              Updating Physical Availability (PA%) logs for <span className="text-indigo-600 font-bold">{currentMonthName}</span>. Changes are <span className="text-indigo-600 font-bold underline">saved automatically</span> when you close this view.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={onCancel}
              className="group flex items-center gap-2 px-8 py-4 bg-white border-2 border-slate-100 rounded-2xl text-xs font-black text-slate-500 hover:text-indigo-600 hover:border-indigo-200 transition-all uppercase tracking-widest"
            >
              <i className="fas fa-arrow-left transition-transform group-hover:-translate-x-1"></i>
              Close & Save
            </button>
            <button 
              onClick={handleSubmit}
              className="flex items-center gap-3 px-10 py-4 bg-slate-900 text-white rounded-2xl text-xs font-black hover:bg-indigo-600 shadow-xl shadow-slate-200 transition-all transform active:scale-95 uppercase tracking-widest"
            >
              <i className="fas fa-check-circle text-lg"></i>
              Apply Changes
            </button>
          </div>
        </div>

        {/* TOP SLIDE BAR - Sync with Table */}
        <div className="bg-slate-50 border-b border-gray-100 px-[280px] pr-[200px]">
          <div 
            ref={topScrollRef}
            onScroll={handleTopScroll}
            className="overflow-x-auto overflow-y-hidden custom-scrollbar-top py-4"
          >
            <div style={{ width: `${(localData[0].data.length * 120)}px`, height: '1px' }}></div>
          </div>
          <div className="flex items-center justify-between px-2 pb-2">
             <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                <i className="fas fa-arrow-left-long mr-2"></i> Earlier Days
             </span>
             <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                Later Days <i className="fas fa-arrow-right-long ml-2"></i>
             </span>
          </div>
        </div>

        {/* Scrollable Table Section */}
        <div 
          ref={tableContainerRef}
          onScroll={handleTableScroll}
          className="overflow-x-auto relative custom-scrollbar-slate"
        >
          <table className="w-full text-left border-collapse table-fixed">
            <thead className="bg-[#0f172a]">
              <tr>
                <th className="w-[280px] px-10 py-8 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] sticky left-0 bg-[#0f172a] z-30 border-r border-slate-800">
                  Equipment
                </th>
                {localData[0].data.map((d, i) => (
                  <th key={i} className="w-[120px] px-4 py-8 text-[11px] font-black text-slate-400 uppercase tracking-[0.1em] text-center">
                    {d.date}
                  </th>
                ))}
                <th className="w-[200px] px-10 py-8 text-[11px] font-black text-indigo-400 uppercase tracking-[0.2em] text-center sticky right-0 bg-[#0f172a] z-30 border-l border-slate-800">
                  Monthly Avg
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 bg-white">
              {localData.map((machine) => (
                <tr key={machine.id} className="group hover:bg-slate-50 transition-colors">
                  <td className="px-10 py-10 sticky left-0 bg-white group-hover:bg-slate-50 z-20 border-r border-gray-100 shadow-[10px_0_15px_-10px_rgba(0,0,0,0.05)]">
                    <div className="flex items-center gap-6">
                      <div 
                        className="w-12 h-12 rounded-xl flex-shrink-0 shadow-sm transition-transform group-hover:scale-105"
                        style={{ backgroundColor: machine.color }}
                      ></div>
                      <div className="flex flex-col">
                        <span className="text-2xl font-black text-slate-900 tracking-tighter leading-none">
                          {machine.name}
                        </span>
                        <span className="text-[10px] text-slate-400 font-black uppercase mt-2 tracking-widest whitespace-nowrap">
                          {machine.fullName}
                        </span>
                      </div>
                    </div>
                  </td>
                  
                  {machine.data.map((entry, idx) => (
                    <td key={idx} className="px-3 py-10">
                      <div className="relative group/input">
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          max="100"
                          value={entry.value}
                          onChange={(e) => handleInputChange(machine.id, idx, e.target.value)}
                          className={`w-full py-4 text-center border-none rounded-[1.2rem] text-sm font-bold text-slate-700 transition-all outline-none bg-slate-50/80 hover:bg-slate-100 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 placeholder-slate-300 ${
                            entry.value < 98 ? 'text-rose-600 bg-rose-50 font-black' : ''
                          }`}
                        />
                      </div>
                    </td>
                  ))}

                  <td className="px-10 py-10 text-center sticky right-0 bg-white group-hover:bg-slate-50 z-20 border-l border-gray-100 shadow-[-10px_0_15px_-10px_rgba(0,0,0,0.05)]">
                    <span className="inline-flex items-center justify-center min-w-[100px] px-6 py-4 rounded-2xl text-xl font-black bg-[#eef2ff] text-[#4338ca] border border-indigo-100 transition-transform group-hover:scale-110">
                      {machine.avg}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Legend / Status Footer */}
        <div className="bg-[#0f172a] p-12 flex flex-col lg:flex-row items-center justify-between gap-10">
          <div className="flex items-center gap-8">
            <div className="w-20 h-20 rounded-[2rem] bg-indigo-500/10 flex items-center justify-center flex-shrink-0 border border-indigo-500/20 ring-8 ring-indigo-500/5">
              <i className="fas fa-save text-indigo-400 text-3xl"></i>
            </div>
            <div className="space-y-2">
              <h4 className="text-2xl font-black text-white tracking-tight">Active Auto-Save Protocol</h4>
              <p className="text-slate-400 text-sm leading-relaxed max-w-2xl font-medium">
                Your modifications are being cached in real-time. Closing this editor via the "Close" button or the main navigation will automatically synchronize the database.
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-6 bg-slate-800/50 p-6 rounded-3xl border border-slate-700">
            <div className="text-center px-6 border-r border-slate-700">
              <span className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Target KPI</span>
              <span className="text-xl font-black text-white">98.0%</span>
            </div>
            <div className="text-center px-6">
              <span className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Status</span>
              <span className="flex items-center gap-2 text-emerald-400 font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                AUTO-SAVING
              </span>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .custom-scrollbar-top::-webkit-scrollbar { height: 10px; }
        .custom-scrollbar-top::-webkit-scrollbar-track { background: #f1f5f9; border-radius: 20px; }
        .custom-scrollbar-top::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 20px; border: 2px solid #f1f5f9; }
        .custom-scrollbar-top::-webkit-scrollbar-thumb:hover { background: #6366f1; }
        
        .custom-scrollbar-slate::-webkit-scrollbar { height: 8px; }
        .custom-scrollbar-slate::-webkit-scrollbar-track { background: #0f172a; }
        .custom-scrollbar-slate::-webkit-scrollbar-thumb { background: #334155; border-radius: 10px; border: 2px solid #0f172a; }
        .custom-scrollbar-slate::-webkit-scrollbar-thumb:hover { background: #475569; }
        
        input::-webkit-outer-spin-button,
        input::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        input[type=number] {
          -moz-appearance: textfield;
        }
      `}</style>
    </div>
  );
};

export default DataEditor;
