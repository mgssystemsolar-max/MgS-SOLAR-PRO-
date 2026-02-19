
import React from 'react';
import { BarChart as BarChartIcon, Sun, Calendar, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Card, CardHeader } from './ui/Card';
import { MonthlyProduction } from '../types';

interface Props {
  data: MonthlyProduction[];
  totalPowerKw: number;
}

export const ProductionChart: React.FC<Props> = ({ data, totalPowerKw }) => {
  // Calculate summary stats
  const totalYearly = data.reduce((acc, curr) => acc + curr.generation, 0);
  const avgMonthly = Math.round(totalYearly / 12);
  const avgDaily = Math.round(totalYearly / 365);

  return (
    <Card className="print:break-inside-avoid flex flex-col h-full">
      <div className="flex justify-between items-center mb-4">
        <CardHeader title="Performance de Geração" icon={<BarChartIcon size={18} className="text-green-500" />} />
        <span className="text-2xl font-black text-sky-400 print:text-black drop-shadow-sm">
          {totalPowerKw.toFixed(2)} <span className="text-sm font-normal text-slate-500">kWp</span>
        </span>
      </div>
      
      {/* Chart */}
      <div className="h-56 w-full mb-6" style={{ minHeight: '224px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <XAxis 
                dataKey="month" 
                tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 'bold' }} 
                axisLine={false} 
                tickLine={false} 
            />
            <YAxis 
                tick={{ fill: '#94a3b8', fontSize: 10 }} 
                axisLine={false} 
                tickLine={false}
            />
            <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc', borderRadius: '8px' }}
                itemStyle={{ color: '#38bdf8' }}
                cursor={{ fill: 'rgba(56, 189, 248, 0.1)' }}
            />
            <Bar dataKey="generation" radius={[4, 4, 0, 0]}>
                {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index % 2 === 0 ? "#38bdf8" : "#0ea5e9"} />
                ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Performance Summary Metrics */}
      <div className="grid grid-cols-3 gap-2 mt-auto">
          <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-700/50 text-center">
             <div className="flex items-center justify-center gap-1 text-[10px] text-slate-400 font-bold uppercase mb-1">
                <Sun size={12} className="text-orange-400" /> Dia (Méd)
             </div>
             <div className="text-lg font-bold text-white">{avgDaily} <span className="text-xs text-slate-500 font-normal">kWh</span></div>
          </div>

          <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-700/50 text-center">
             <div className="flex items-center justify-center gap-1 text-[10px] text-slate-400 font-bold uppercase mb-1">
                <Calendar size={12} className="text-sky-400" /> Mês (Méd)
             </div>
             <div className="text-lg font-bold text-white">{avgMonthly} <span className="text-xs text-slate-500 font-normal">kWh</span></div>
          </div>

          <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-700/50 text-center">
             <div className="flex items-center justify-center gap-1 text-[10px] text-slate-400 font-bold uppercase mb-1">
                <TrendingUp size={12} className="text-green-400" /> Ano Total
             </div>
             <div className="text-lg font-bold text-green-400">{totalYearly.toLocaleString()} <span className="text-xs text-green-400/70 font-normal">kWh</span></div>
          </div>
      </div>
    </Card>
  );
};
