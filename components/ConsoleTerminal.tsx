
import React, { useEffect, useRef } from 'react';

export interface LogEntry {
  id: string;
  timestamp: string;
  type: 'INFO' | 'SUCCESS' | 'WARN' | 'AI_CORE';
  message: string;
}

interface ConsoleTerminalProps {
  logs: LogEntry[];
  isOpen: boolean;
  onToggle: () => void;
  onClear: () => void;
}

const ConsoleTerminal: React.FC<ConsoleTerminalProps> = ({ logs, isOpen, onToggle, onClear }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  const getLogColor = (type: LogEntry['type']) => {
    switch (type) {
      case 'SUCCESS': return 'text-emerald-400';
      case 'WARN': return 'text-amber-400';
      case 'AI_CORE': return 'text-indigo-400';
      default: return 'text-cyan-400';
    }
  };

  return (
    <div className={`fixed bottom-0 left-0 right-0 z-[60] transition-all duration-500 transform ${isOpen ? 'translate-y-0' : 'translate-y-[calc(100%-48px)]'}`}>
      {/* Terminal Header/Toggle */}
      <div 
        onClick={onToggle}
        className="bg-slate-900 border-t border-slate-700 h-12 flex items-center justify-between px-6 cursor-pointer hover:bg-slate-800 transition-colors shadow-2xl"
      >
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-rose-500"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
          </div>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-2">
            <i className="fas fa-terminal text-xs"></i>
            System Control Terminal
          </span>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={(e) => { e.stopPropagation(); onClear(); }}
            className="text-[9px] font-black text-slate-500 hover:text-white uppercase tracking-widest transition-colors"
          >
            Clear Log
          </button>
          <i className={`fas fa-chevron-${isOpen ? 'down' : 'up'} text-slate-500 text-xs transition-transform duration-500`}></i>
        </div>
      </div>

      {/* Terminal Content */}
      <div 
        ref={scrollRef}
        className="h-64 bg-slate-900/95 backdrop-blur-xl border-t border-slate-800 p-6 overflow-y-auto font-mono text-xs custom-scrollbar-slate"
      >
        {logs.length === 0 ? (
          <div className="h-full flex items-center justify-center opacity-20 select-none">
            <span className="text-[10px] uppercase tracking-[0.5em] font-black text-slate-400 italic">No active system processes</span>
          </div>
        ) : (
          <div className="space-y-1.5">
            {logs.map((log) => (
              <div key={log.id} className="flex gap-4 animate-in fade-in slide-in-from-left-2 duration-300">
                <span className="text-slate-600 shrink-0 select-none">[{log.timestamp}]</span>
                <span className={`font-black shrink-0 ${getLogColor(log.type)}`}>
                  {log.type.padEnd(8)}
                </span>
                <span className="text-slate-300 leading-relaxed">
                  {log.message}
                </span>
              </div>
            ))}
            <div className="h-4 flex items-center gap-2 mt-4">
              <span className="w-2 h-4 bg-emerald-500 animate-pulse"></span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConsoleTerminal;
