
import React, { useState } from 'react';
import { Zap, Camera, Ruler, Weight, Activity, Cable, Cpu, Home, Sliders, Box, Info, X } from 'lucide-react';
import { Card, CardHeader } from './ui/Card';
import { SolarSystemData, TechnicalSpecs } from '../types';
import { calculateStringSuggestion, calculateModulesFromBill, MODULE_OPTIONS, INVERTER_OPTIONS } from '../services/solarLogic';

interface Props {
  data: SolarSystemData;
  onChange: (field: keyof SolarSystemData, value: any) => void;
  specs: TechnicalSpecs;
  onImageChange: (file: File | null) => void;
  imagePreview: string | null;
}

export const TechnicalCard: React.FC<Props> = ({ data, onChange, specs, onImageChange, imagePreview }) => {
  const [showOverloadInfo, setShowOverloadInfo] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onImageChange(e.target.files[0]);
    }
  };

  const handleModuleCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
     const count = parseInt(e.target.value) || 0;
     onChange('moduleCount', count);
     // Auto update strings based on new count
     onChange('modulesPerString', calculateStringSuggestion(count));
  };

  const handleModulePowerChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newPower = parseInt(e.target.value) || 575;
    onChange('modulePowerW', newPower);

    // Recalcula a quantidade de módulos com base na conta atual
    if (data.billAmount > 0) {
        const newCount = calculateModulesFromBill(
            data.billAmount,
            data.energyTariff,
            data.hsp,
            newPower
        );
        onChange('moduleCount', newCount);
        onChange('modulesPerString', calculateStringSuggestion(newCount));
    }
  };

  const overloadValue = parseInt(specs.overload);
  let overloadColor = "text-green-400";
  let overloadStatus = "Ideal";

  if (overloadValue < 105) {
    overloadColor = "text-yellow-400";
    overloadStatus = "Baixo (Subutilizado)";
  } else if (overloadValue > 130) {
    overloadColor = "text-red-500 animate-pulse";
    overloadStatus = "PERIGO (Alto Risco)";
  }

  return (
    <Card className="relative">
      <CardHeader 
        title="Dimensionamento Técnico" 
        icon={<Zap size={18} className="text-sky-400" />} 
        colorClass="text-sky-400" 
      />

      {/* OVERLOAD INFO MODAL/OVERLAY */}
      {showOverloadInfo && (
        <div className="absolute inset-0 z-50 bg-slate-900/95 p-4 rounded-xl flex flex-col overflow-y-auto animate-fade-in border border-sky-500/30">
            <div className="flex justify-between items-start mb-2">
                <h4 className="text-sky-400 font-bold flex items-center gap-2">
                    <Info size={18} /> Entendendo o Overload
                </h4>
                <button 
                    onClick={() => setShowOverloadInfo(false)}
                    className="bg-slate-800 p-1 rounded-full text-slate-400 hover:text-white"
                >
                    <X size={18} />
                </button>
            </div>
            <div className="text-xs text-slate-300 space-y-2 leading-relaxed">
                <p><strong className="text-white">Definição:</strong> É a relação entre a potência CC (painéis) e a potência CA (inversor). Um sistema com 13 kWp de painéis e um inversor de 10 kW tem 30% de overload (130%).</p>
                <p><strong className="text-white">Limite Seguro:</strong> Recomenda-se trabalhar com no máximo <strong>130%</strong>. Acima disso, há perda de garantia e risco de danos por superaquecimento.</p>
                <p><strong className="text-white">Clipping (Achatamento):</strong> Quando a produção CC excede a capacidade do inversor, ele "corta" o pico. Isso é normal até certo ponto para otimizar custos.</p>
                <p><strong className="text-white">Objetivo:</strong> Reduzir o LCOE (Custo da Energia) maximizando o uso da infraestrutura sem danificar o equipamento.</p>
            </div>
        </div>
      )}
      
      {/* Entradas Principais */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
        <div>
          <label className="block text-xs font-bold text-slate-400 mb-1">Qtd Módulos</label>
          <input 
            type="number" 
            value={data.moduleCount} 
            onChange={handleModuleCountChange}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-sky-500 focus:outline-none font-bold text-lg"
          />
        </div>
        <div>
           <label className="block text-xs font-bold text-slate-400 mb-1">Modelo Módulo (W)</label>
           <select 
            value={data.modulePowerW} 
            onChange={handleModulePowerChange}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-sky-500 focus:outline-none font-bold text-sm"
          >
              {MODULE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                      {opt.label}
                  </option>
              ))}
          </select>
        </div>
        <div>
           <label className="block text-xs font-bold text-sky-400 mb-1">Módulos p/ String</label>
           <div className="flex items-center gap-2">
             <input 
              type="number" 
              value={data.modulesPerString || data.moduleCount} 
              onChange={(e) => onChange('modulesPerString', parseInt(e.target.value) || 0)}
              className="w-full bg-slate-900 border border-sky-500/50 rounded-lg p-3 text-white focus:ring-2 focus:ring-sky-500 focus:outline-none font-bold text-lg"
            />
           </div>
           <p className="text-[10px] text-sky-400/80 mt-1">{specs.stringConfigText}</p>
        </div>
      </div>
      
      {/* Marcas (Campos Novos) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1 flex items-center gap-1">
                <Box size={12} /> Marca do Módulo
            </label>
            <input 
                type="text" 
                value={data.moduleBrand || ''}
                onChange={(e) => onChange('moduleBrand', e.target.value)}
                placeholder="Ex: Canadian / Jinko / Trina"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white text-sm focus:ring-1 focus:ring-sky-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1 flex items-center gap-1">
                <Cpu size={12} /> Marca do Inversor
            </label>
            <input 
                type="text" 
                value={data.inverterBrand || ''}
                onChange={(e) => onChange('inverterBrand', e.target.value)}
                placeholder="Ex: Growatt / Deye / Solis"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white text-sm focus:ring-1 focus:ring-sky-500 outline-none"
            />
          </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
         <div>
            <label className="block text-xs font-bold text-slate-400 mb-1 flex items-center gap-1">
               <Cpu size={12} /> Inversor (Seleção Manual)
            </label>
            <select 
              value={data.selectedInverter || INVERTER_OPTIONS[0]} 
              onChange={(e) => onChange('selectedInverter', e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-sky-500 focus:outline-none text-sm"
            >
                {INVERTER_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                        {opt}
                    </option>
                ))}
            </select>
         </div>

         <div>
            <label className="block text-xs font-bold text-slate-400 mb-1 flex items-center gap-1">
               <Home size={12} /> Tipo de Telhado / Estrutura
            </label>
            <select 
              value={data.roofType} 
              onChange={(e) => onChange('roofType', e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-sky-500 focus:outline-none text-sm"
            >
                <option value="Cerâmico">Cerâmico (Telha Barro)</option>
                <option value="Fibrocimento">Fibrocimento / Ondulado</option>
                <option value="Metálico">Metálico / Zinco</option>
                <option value="Laje">Laje (Plana)</option>
                <option value="Solo">Solo</option>
            </select>
         </div>
      </div>

      {/* Painel de Inversor Selecionado (Destaque) */}
      <div className="bg-sky-900/20 border border-sky-500/30 rounded-xl p-4 mb-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-2 opacity-10">
            <Cpu size={64} className="text-sky-400" />
        </div>
        <h4 className="text-[10px] font-bold text-sky-400 uppercase mb-1 flex items-center gap-1">
             <Sliders size={12} /> Resumo do Dimensionamento
        </h4>
        <div className="text-lg font-black text-white leading-tight mb-1">
            {specs.suggestedInverter}
        </div>
        <div className="flex items-center gap-3 text-xs text-slate-400 mt-2">
            <span>Nominal: <b>{specs.inverterPowerKw} kW</b></span>
            <span>•</span>
            <div className="flex items-center gap-1">
                <span className={`${overloadColor} font-bold`}>
                    Overload: {specs.overload}
                </span>
                <button 
                    onClick={() => setShowOverloadInfo(!showOverloadInfo)}
                    className="text-slate-500 hover:text-white transition-colors"
                    title="O que é Overload?"
                >
                    <Info size={14} />
                </button>
            </div>
             <span>•</span>
            <span className="text-sky-300 font-bold">In: {specs.nominalCurrent} A</span>
        </div>
        <p className={`text-[9px] mt-1 ${overloadColor} opacity-80 font-bold uppercase`}>
            Status: {overloadStatus}
        </p>
      </div>

      {/* Detalhes Técnicos Grid */}
      <div className="bg-slate-900/50 rounded-xl border border-slate-700/50 overflow-hidden mb-6">
          <div className="grid grid-cols-2 gap-px bg-slate-700/30">
             
             {/* Cabo */}
             <div className="bg-slate-900/80 p-3 hover:bg-slate-800 transition-colors border-r border-slate-700/30">
                 <div className="text-[10px] text-slate-500 font-bold uppercase mb-1 flex items-center gap-1">
                    <Cable size={10} /> Cabo C.A. (Padrão)
                 </div>
                 <div className="text-white font-bold text-lg">{specs.cableGauge}</div>
                 <div className="text-[9px] text-slate-500">Cabo Flexível 750V/1kV</div>
             </div>

             {/* Disjuntor */}
             <div className="bg-slate-900/80 p-3 hover:bg-slate-800 transition-colors">
                 <div className="text-[10px] text-slate-500 font-bold uppercase mb-1 flex items-center gap-1">
                    <Activity size={10} /> Disjuntor C.A.
                 </div>
                 <div className="text-red-400 font-bold text-lg">{specs.breakerRating}</div>
                 <div className="text-[9px] text-slate-500">Curva C - DIN</div>
             </div>

             {/* Área */}
             <div className="bg-slate-900/80 p-3 hover:bg-slate-800 transition-colors border-t border-slate-700/30">
                 <div className="text-[10px] text-slate-500 font-bold uppercase mb-1 flex items-center gap-1">
                    <Ruler size={10} /> Área Telhado
                 </div>
                 <div className="text-slate-200 font-bold text-sm">{specs.areaRequired} m²</div>
             </div>

             {/* Peso */}
             <div className="bg-slate-900/80 p-3 hover:bg-slate-800 transition-colors border-t border-slate-700/30">
                 <div className="text-[10px] text-slate-500 font-bold uppercase mb-1 flex items-center gap-1">
                    <Weight size={10} /> Peso Total
                 </div>
                 <div className="text-slate-200 font-bold text-sm">~{specs.totalWeight} kg</div>
             </div>
          </div>
      </div>

      <div className="print:break-inside-avoid">
        <label className="block text-xs font-bold text-slate-400 mb-2 uppercase flex items-center gap-2">
          <Camera size={14} /> Foto da Obra (Layout)
        </label>
        
        {!imagePreview ? (
            <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-slate-700 border-dashed rounded-lg cursor-pointer bg-slate-800 hover:bg-slate-700 transition-colors print:hidden">
                <div className="flex flex-col items-center justify-center pt-2">
                    <Camera className="w-6 h-6 text-slate-400 mb-1" />
                    <p className="text-[10px] text-slate-400">Capturar Foto</p>
                </div>
                <input type="file" className="hidden" accept="image/*" capture="environment" onChange={handleFileChange} />
            </label>
        ) : (
             <div className="relative group">
                <img src={imagePreview} alt="Obra" className="w-full h-40 object-cover rounded-lg border border-sky-500/30 shadow-lg" />
                <button 
                    onClick={() => onImageChange(null)}
                    className="absolute top-2 right-2 bg-red-500/80 hover:bg-red-500 text-white p-1.5 rounded-full shadow-lg print:hidden backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
            </div>
        )}
      </div>
    </Card>
  );
};
