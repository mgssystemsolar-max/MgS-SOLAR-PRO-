import React from 'react';
import { ClipboardList } from 'lucide-react';
import { Card, CardHeader } from './ui/Card';
import { ChecklistItem } from '../types';
import { INVERTER_OPTIONS } from '../services/solarLogic';

interface Props {
  items: ChecklistItem[];
  onUpdateObs: (id: string, obs: string) => void;
  onUpdateLabel: (id: string, label: string) => void;
}

export const ChecklistCard: React.FC<Props> = ({ items, onUpdateObs, onUpdateLabel }) => {
  return (
    <Card className="print:break-inside-avoid">
      <CardHeader title="Checklist & Materiais" icon={<ClipboardList size={18} className="text-white" />} colorClass="text-white" />
      
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="border-b border-slate-700 print:border-slate-300">
              <th className="py-2 px-2 text-slate-400 font-bold print:text-black w-1/3">Item</th>
              <th className="py-2 px-2 text-slate-400 font-bold print:text-black w-1/6">Qtd</th>
              <th className="py-2 px-2 text-slate-400 font-bold print:text-black">Anotação</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => (
              <tr key={item.id} className={`border-b border-slate-700/50 print:border-slate-300 ${idx % 2 === 0 ? 'bg-slate-800/50 print:bg-white' : ''}`}>
                <td className="py-3 px-2 font-medium print:text-black">
                    {/* Se for o item 8 (Inversor), mostra Select. Senão, mostra Texto */}
                    {item.id === '8' ? (
                        <select 
                            value={item.label}
                            onChange={(e) => onUpdateLabel(item.id, e.target.value)}
                            className="w-full bg-slate-900 border border-slate-600 rounded p-1 text-sky-400 text-xs focus:ring-1 focus:ring-sky-500 outline-none print:appearance-none print:border-none print:bg-transparent print:text-black print:p-0 print:font-bold"
                        >
                            <option value={item.label}>{item.label} (Sugerido)</option>
                            {INVERTER_OPTIONS.map((opt) => (
                                <option key={opt} value={opt}>{opt}</option>
                            ))}
                        </select>
                    ) : (
                        item.label
                    )}
                </td>
                <td className="py-3 px-2 text-slate-300 print:text-black">{item.quantity}</td>
                <td className="py-3 px-2">
                  <input 
                    type="text" 
                    value={item.observation}
                    onChange={(e) => onUpdateObs(item.id, e.target.value)}
                    placeholder="..."
                    className="w-full bg-transparent border-b border-slate-600 focus:border-sky-500 outline-none text-sky-400 text-xs py-1 placeholder-slate-600 print:text-black print:border-slate-300"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};