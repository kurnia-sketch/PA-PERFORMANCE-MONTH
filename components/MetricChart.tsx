
import React, { useRef } from 'react';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Area,
  AreaChart,
  ReferenceLine
} from 'recharts';
import html2canvas from 'html2canvas';
import { MachineData } from '../types';

interface MetricChartProps {
  machine: MachineData;
}

const MetricChart: React.FC<MetricChartProps> = ({ machine }) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const isWarning = machine.avg < 98;

  const downloadChart = async () => {
    if (!chartRef.current) return;
    
    try {
      // Capture the element as canvas
      const canvas = await html2canvas(chartRef.current, {
        backgroundColor: '#ffffff',
        scale: 2, // High resolution
        logging: false,
        useCORS: true,
        ignoreElements: (element) => element.classList.contains('no-capture')
      });
      
      // Convert to image and download
      const image = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = image;
      link.download = `${machine.name}_Monthly_PA_Report.png`;
      link.click();
    } catch (err) {
      console.error('Failed to capture chart:', err);
    }
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/95 backdrop-blur-sm p-3 shadow-2xl border border-gray-100 rounded-xl ring-1 ring-black/5">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{label}</p>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: machine.color }}></div>
            <p className="text-sm font-black text-gray-900">
              {payload[0].value}% <span className="text-[10px] text-gray-400 font-bold ml-0.5">PA</span>
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div 
      ref={chartRef}
      className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-100 flex flex-col h-full min-h-[440px] min-w-0 transition-all hover:shadow-2xl hover:shadow-indigo-500/10 group relative"
    >
      {/* Header Section */}
      <div className="flex justify-between items-start mb-8">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
             <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest ${isWarning ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'}`}>
              {isWarning ? 'Critical Alert' : 'Operational'}
            </span>
          </div>
          <h3 className="text-xl font-black text-gray-900 tracking-tight leading-tight">{machine.fullName}</h3>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{machine.name} Monthly Analytics</p>
        </div>
        
        <div className="flex gap-2">
          {/* Download Button */}
          <button 
            onClick={downloadChart}
            title="Download Chart as PNG"
            className="w-10 h-10 rounded-xl flex items-center justify-center bg-gray-50 text-gray-400 hover:bg-indigo-600 hover:text-white transition-all shadow-sm border border-gray-100 no-capture"
          >
            <i className="fas fa-download text-sm"></i>
          </button>
          
          <div 
            className="w-10 h-10 rounded-xl flex items-center justify-center transition-all group-hover:rotate-12 duration-500 shadow-sm border border-gray-100"
            style={{ backgroundColor: `${machine.color}10` }}
          >
            <i className="fas fa-gauge-high text-sm" style={{ color: machine.color }}></i>
          </div>
        </div>
      </div>

      {/* Hero Metric */}
      <div className="flex items-end gap-3 mb-6">
        <div className="flex flex-col">
          <span className="text-4xl font-black text-gray-900 tracking-tighter tabular-nums leading-none">
            {machine.avg}%
          </span>
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mt-2">Monthly Average PA</span>
        </div>
      </div>
      
      {/* Chart Container */}
      <div className="w-full h-[220px] mt-auto relative min-w-0 -mx-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={machine.data} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id={`gradient-${machine.id}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={machine.color} stopOpacity={0.4}/>
                <stop offset="60%" stopColor={machine.color} stopOpacity={0.1}/>
                <stop offset="95%" stopColor={machine.color} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="6 6" vertical={false} stroke="#f3f4f6" />
            <XAxis 
              dataKey="date" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#94a3b8', fontSize: 9, fontWeight: 800 }}
              dy={15}
              interval={4} 
            />
            <YAxis 
              domain={[70, 100]} 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#94a3b8', fontSize: 9, fontWeight: 800 }}
              ticks={[70, 80, 90, 100]}
            />
            <Tooltip 
              content={<CustomTooltip />} 
              cursor={{ stroke: machine.color, strokeWidth: 1, strokeDasharray: '6 6' }}
            />
            
            <ReferenceLine 
              y={98} 
              stroke="#cbd5e1" 
              strokeDasharray="4 4" 
              label={{ 
                position: 'right', 
                value: 'KPI', 
                fill: '#94a3b8', 
                fontSize: 8, 
                fontWeight: 900,
                dx: 5
              }} 
            />

            <Area 
              type="monotone" 
              dataKey="value" 
              stroke={machine.color} 
              strokeWidth={4}
              strokeLinecap="round"
              fillOpacity={1} 
              fill={`url(#gradient-${machine.id})`}
              dot={false}
              activeDot={{ r: 6, strokeWidth: 0, fill: machine.color }}
              animationDuration={2000}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default MetricChart;
