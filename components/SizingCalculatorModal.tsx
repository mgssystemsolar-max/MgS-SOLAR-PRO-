import React, { useState, useMemo, useEffect } from 'react';
import { X, Calculator, Sun, Maximize, Zap, BatteryCharging, AlertTriangle, CheckCircle2, ArrowRight } from 'lucide-react';
import { INVERTER_OPTIONS } from '../services/solarLogic';

interface SizingCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialHsp?: number;
  initialModulePower?: number;
  initialConsumption?: number;
  onApply: (updates: { moduleCount: number, modulePowerW: number, hsp: number, selectedInverter: string }) => void;
}

export const SizingCalculatorModal: React.FC<SizingCalculatorModalProps> = ({ 
  isOpen, 
  onClose, 
  initialHsp = 5.0, 
  initialModulePower = 550,
  initialConsumption = 500,
  onApply
}) => {
  const [targetConsumption, setTargetConsumption] = useState<number>(initialConsumption);
  const [roofArea, setRoofArea] = useState<number>(50);
  const [panelPower, setPanelPower] = useState<number>(initialModulePower);
  const [panelWidth, setPanelWidth] = useState<number>(1.134);
  const [panelHeight, setPanelHeight] = useState<number>(2.278);
  const [hsp, setHsp] = useState<number>(initialHsp);
  const [systemLosses, setSystemLosses] = useState<number>(20); // 20% losses
  const [selectedInverter, setSelectedInverter] = useState<string>(INVERTER_OPTIONS[0]);

  // Update target consumption when initialConsumption changes
  useEffect(() => {
    if (isOpen) {
      setTargetConsumption(initialConsumption);
    }
  }, [initialConsumption, isOpen]);

  const calculations = useMemo(() => {
    // 1. Calculate required daily energy
    const dailyEnergyRequired = targetConsumption / 30; // kWh/day

    // 2. Calculate required system size (kWp)
    const efficiency = 1 - (systemLosses / 100);
    const requiredKwp = dailyEnergyRequired / (hsp * efficiency);

    // 3. Calculate number of panels
    const panelPowerKw = panelPower / 1000;
    const numberOfPanels = Math.ceil(requiredKwp / panelPowerKw);

    // 4. Calculate actual system size based on integer number of panels
    const actualKwp = numberOfPanels * panelPowerKw;

    // 5. Calculate required area
    const areaPerPanel = panelWidth * panelHeight;
    const totalAreaRequired = numberOfPanels * areaPerPanel;

    // 6. Calculate estimated monthly generation
    const estimatedMonthlyGeneration = actualKwp * hsp * 30 * efficiency;

    // 7. Recommend Inverter Size (typically 80-120% of array size, let's suggest ~100%)
    const recommendedInverter = Math.ceil(actualKwp);

    const fitsOnRoof = totalAreaRequired <= roofArea;

    return {
      requiredKwp,
      actualKwp,
      numberOfPanels,
      totalAreaRequired,
      estimatedMonthlyGeneration,
      recommendedInverter,
      fitsOnRoof
    };
  }, [targetConsumption, roofArea, panelPower, panelWidth, panelHeight, hsp, systemLosses]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-slate-800 text-white p-4 flex justify-between items-center rounded-t-2xl z-10">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Calculator className="text-sky-400" />
            Dimensionamento Avançado (Comercial & Técnico)
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-700 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Inputs Section */}
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-slate-800 border-b pb-2">Parâmetros de Entrada</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Consumo Alvo (kWh/mês)</label>
                <div className="relative">
                  <Zap className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input 
                    type="number" 
                    value={targetConsumption} 
                    onChange={e => setTargetConsumption(Number(e.target.value))}
                    className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Área Útil do Telhado (m²)</label>
                <div className="relative">
                  <Maximize className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input 
                    type="number" 
                    value={roofArea} 
                    onChange={e => setRoofArea(Number(e.target.value))}
                    className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Potência do Módulo (W)</label>
                <div className="relative">
                  <Sun className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input 
                    type="number" 
                    value={panelPower} 
                    onChange={e => setPanelPower(Number(e.target.value))}
                    className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">HSP (Horas de Sol Pleno)</label>
                <div className="relative">
                  <Sun className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input 
                    type="number" 
                    step="0.1"
                    value={hsp} 
                    onChange={e => setHsp(Number(e.target.value))}
                    className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Largura do Módulo (m)</label>
                <input 
                  type="number" 
                  step="0.01"
                  value={panelWidth} 
                  onChange={e => setPanelWidth(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Altura do Módulo (m)</label>
                <input 
                  type="number" 
                  step="0.01"
                  value={panelHeight} 
                  onChange={e => setPanelHeight(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-slate-700 mb-1">Perdas do Sistema (%)</label>
                <div className="flex items-center gap-4">
                  <input 
                    type="range" 
                    min="10" 
                    max="40" 
                    value={systemLosses} 
                    onChange={e => setSystemLosses(Number(e.target.value))}
                    className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-sky-500"
                  />
                  <span className="font-bold text-slate-700 w-12 text-right">{systemLosses}%</span>
                </div>
                <p className="text-xs text-slate-500 mt-1">Inclui perdas por temperatura, sujeira, cabeamento e inversor.</p>
              </div>
            </div>
          </div>

          {/* Results Section */}
          <div className="space-y-6 bg-slate-50 p-6 rounded-xl border border-slate-200">
            <h3 className="text-lg font-bold text-slate-800 border-b pb-2">Resultados do Dimensionamento</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-100">
                <p className="text-sm text-slate-500 font-medium mb-1">Potência Necessária</p>
                <p className="text-2xl font-bold text-slate-800">{calculations.requiredKwp.toFixed(2)} <span className="text-sm font-normal text-slate-500">kWp</span></p>
              </div>
              
              <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-100">
                <p className="text-sm text-slate-500 font-medium mb-1">Potência Real (Arredondada)</p>
                <p className="text-2xl font-bold text-sky-600">{calculations.actualKwp.toFixed(2)} <span className="text-sm font-normal text-sky-600/70">kWp</span></p>
              </div>

              <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-100">
                <p className="text-sm text-slate-500 font-medium mb-1">Qtd. de Módulos</p>
                <p className="text-2xl font-bold text-slate-800">{calculations.numberOfPanels} <span className="text-sm font-normal text-slate-500">un</span></p>
              </div>

              <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-100">
                <p className="text-sm text-slate-500 font-medium mb-1">Geração Estimada</p>
                <p className="text-2xl font-bold text-green-600">{Math.round(calculations.estimatedMonthlyGeneration)} <span className="text-sm font-normal text-green-600/70">kWh/mês</span></p>
              </div>
              
              <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-100 col-span-2">
                <p className="text-sm text-slate-500 font-medium mb-1">Inversor Recomendado</p>
                <div className="flex items-center gap-2 mb-3">
                  <BatteryCharging className="text-orange-500" size={20} />
                  <p className="text-xl font-bold text-slate-800">~ {calculations.recommendedInverter} <span className="text-sm font-normal text-slate-500">kW</span></p>
                </div>
                
                <label className="block text-sm font-semibold text-slate-700 mb-1">Selecionar Inversor para o Projeto</label>
                <select 
                  value={selectedInverter}
                  onChange={(e) => setSelectedInverter(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 bg-slate-50"
                >
                  {INVERTER_OPTIONS.map(inv => (
                    <option key={inv} value={inv}>{inv}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Area Check */}
            <div className={`p-4 rounded-lg border flex items-start gap-3 ${calculations.fitsOnRoof ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
              {calculations.fitsOnRoof ? (
                <CheckCircle2 className="text-green-600 mt-0.5 flex-shrink-0" size={20} />
              ) : (
                <AlertTriangle className="text-red-600 mt-0.5 flex-shrink-0" size={20} />
              )}
              <div>
                <p className={`font-bold ${calculations.fitsOnRoof ? 'text-green-800' : 'text-red-800'}`}>
                  {calculations.fitsOnRoof ? 'Espaço Suficiente no Telhado' : 'Atenção: Espaço Insuficiente'}
                </p>
                <p className={`text-sm mt-1 ${calculations.fitsOnRoof ? 'text-green-700' : 'text-red-700'}`}>
                  Área necessária: <strong>{calculations.totalAreaRequired.toFixed(1)} m²</strong> <br/>
                  Área disponível: <strong>{roofArea.toFixed(1)} m²</strong>
                </p>
              </div>
            </div>

          </div>
        </div>
        
        <div className="p-4 bg-slate-50 border-t flex justify-end gap-3 rounded-b-2xl">
          <button 
            onClick={onClose}
            className="px-6 py-2 bg-slate-200 text-slate-700 font-bold rounded-lg hover:bg-slate-300 transition-colors"
          >
            Cancelar
          </button>
          <button 
            onClick={() => {
              onApply({
                moduleCount: calculations.numberOfPanels,
                modulePowerW: panelPower,
                hsp: hsp,
                selectedInverter: selectedInverter
              });
            }}
            className="px-6 py-2 bg-sky-600 text-white font-bold rounded-lg hover:bg-sky-500 transition-colors flex items-center gap-2 shadow-lg shadow-sky-600/20"
          >
            Aplicar e Gerar Proposta <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};
