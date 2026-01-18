
import React from 'react';

interface AIReportProps {
  report: string | null;
  loading: boolean;
  onRefresh: () => void;
  monthName?: string;
  year?: number;
}

const AIReport: React.FC<AIReportProps> = ({ report, loading, onRefresh, monthName = 'January', year = 2025 }) => {
  if (!report && !loading) return null;

  const copyToClipboard = () => {
    if (report) {
      navigator.clipboard.writeText(report);
      alert('Report copied to clipboard');
    }
  };

  return (
    <div className="w-full mt-12 animate-in slide-in-from-bottom-8 duration-700">
      <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-indigo-500/5 border border-gray-100 overflow-hidden relative">
        {/* Background Decoration */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl opacity-20 -mr-32 -mt-32"></div>
        
        {/* Header */}
        <div className="px-10 py-8 border-b border-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white/80 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-5">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-black text-slate-900 tracking-tight">Fleet Intelligence Report</h3>
              </div>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Strategic Operations Analysis • {monthName} {year}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {!loading && (
              <>
                <button 
                  onClick={copyToClipboard}
                  className="p-3 text-slate-400 hover:text-indigo-600 transition-colors"
                  title="Copy to clipboard"
                >
                  <i className="fas fa-copy"></i>
                </button>
                <button 
                  onClick={onRefresh}
                  className="flex items-center gap-2 px-6 py-3 bg-slate-50 text-slate-600 rounded-xl text-xs font-black hover:bg-indigo-50 hover:text-indigo-600 transition-all border border-slate-100 uppercase tracking-widest"
                >
                  <i className="fas fa-sync-alt"></i>
                  Regenerate
                </button>
              </>
            )}
          </div>
        </div>

        {/* Content Area */}
        <div className="p-10 md:p-14 relative min-h-[300px]">
          {loading ? (
            <div className="space-y-8 animate-pulse">
              <div className="h-4 bg-slate-100 rounded-full w-1/4"></div>
              <div className="space-y-4">
                <div className="h-4 bg-slate-50 rounded-full w-full"></div>
                <div className="h-4 bg-slate-50 rounded-full w-5/6"></div>
                <div className="h-4 bg-slate-50 rounded-full w-4/6"></div>
              </div>
              <div className="h-4 bg-slate-100 rounded-full w-1/3"></div>
              <div className="space-y-4">
                <div className="h-4 bg-slate-50 rounded-full w-full"></div>
                <div className="h-4 bg-slate-50 rounded-full w-full"></div>
                <div className="h-4 bg-slate-50 rounded-full w-2/3"></div>
              </div>
              <div className="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-[2px]">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.3em]">Processing Fleet Metrics...</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="prose prose-slate max-w-none prose-headings:font-black prose-headings:text-slate-900 prose-headings:tracking-tight prose-p:text-slate-500 prose-p:font-medium prose-p:leading-relaxed prose-strong:text-indigo-600 prose-strong:font-black">
              {report?.split('\n').map((line, i) => {
                if (line.startsWith('###')) {
                  return <h4 key={i} className="text-xl mt-10 mb-4 uppercase tracking-tight text-indigo-600 flex items-center gap-3">
                    <span className="w-8 h-[2px] bg-indigo-100 rounded-full"></span>
                    {line.replace('###', '').trim()}
                  </h4>;
                }
                if (line.trim().startsWith('-') || line.trim().startsWith('*')) {
                  return <div key={i} className="flex gap-4 items-start mb-3 ml-4">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-2 flex-shrink-0"></div>
                    <p className="m-0 text-slate-600">{line.replace(/^[-*]\s*/, '').trim()}</p>
                  </div>;
                }
                return line.trim() === '' ? <br key={i} /> : <p key={i} className="mb-4 leading-relaxed">{line}</p>;
              })}
            </div>
          )}
        </div>

        {/* Footer Signature */}
        <div className="px-10 py-8 bg-slate-50/50 border-t border-gray-50 flex items-center justify-between">
          <div className="flex items-center gap-3 text-slate-400">
            <i className="fas fa-shield-halved text-sm"></i>
            <span className="text-[10px] font-bold uppercase tracking-widest">Encrypted Data Stream • Certified Operational Log</span>
          </div>
          <div className="flex items-center gap-4 grayscale opacity-50">
             <i className="fab fa-google text-lg"></i>
             <i className="fas fa-server text-sm"></i>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIReport;
