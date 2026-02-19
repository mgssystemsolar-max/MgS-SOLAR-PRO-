
import React from 'react';
import { Sun, CheckCircle2, Zap, Calendar, TrendingUp, DollarSign, PenSquare, Clock, Info, Home, ShieldCheck, HardHat, FileText, Camera } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts';
import { SolarSystemData, TechnicalSpecs, FinancialProjection, MonthlyProduction, ChecklistItem, ProposalSettings } from '../types';

interface Props {
  data: SolarSystemData;
  specs: TechnicalSpecs;
  financials: FinancialProjection;
  payback: string;
  productionData: MonthlyProduction[];
  checklist: ChecklistItem[];
  settings: ProposalSettings;
  onSettingsChange: (s: ProposalSettings) => void;
  roofImage: string | null;
}

export const ProposalView: React.FC<Props> = ({ 
  data, specs, financials, payback, productionData, checklist, settings, onSettingsChange, roofImage 
}) => {
  
  const formatMoney = (val: number) => {
    return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const getStructureDescription = (type: string) => {
      switch (type) {
        case 'Cerâmico': return 'Fixação coplanar com ganchos inox (Telhado Colonial).';
        case 'Fibrocimento': return 'Fixação c/ parafusos prisioneiros inox (Telhado Ondulado).';
        case 'Metálico': return 'Estrutura coplanar mini-trilhos (Telha Metálica).';
        case 'Laje': return 'Estrutura triangular com lastros de concreto (Laje Plana).';
        case 'Solo': return 'Estrutura de solo galvanizada com fundações em concreto.';
        default: return 'Estrutura padrão em alumínio anodizado.';
      }
  };

  const today = new Date();
  const validUntil = new Date();
  validUntil.setDate(today.getDate() + (settings.validityDays || 5));

  // Formatação explícita para PT-BR
  const formattedDate = today.toLocaleDateString('pt-BR');
  const formattedValidDate = validUntil.toLocaleDateString('pt-BR');

  // Calculate Avg Consumption Estimation
  const estimatedConsumption = Math.round(data.billAmount / data.energyTariff);

  return (
    <div className="bg-white text-slate-800 p-8 rounded-xl shadow-2xl max-w-5xl mx-auto print:shadow-none print:p-0 print:max-w-none animate-fade-in relative overflow-hidden font-sans">
      
      {/* MARCA D'ÁGUA / TIMBRE */}
      <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none">
         <img 
            src="logo.png" 
            alt="Watermark" 
            className="w-[70%] opacity-[0.04] print:opacity-[0.06] grayscale filter"
         />
      </div>

      <div className="relative z-10">
        {/* 1. HEADER & COMPANY INFO */}
        <div className="flex flex-col md:flex-row justify-between items-start border-b-4 border-green-500 pb-6 mb-6 gap-4">
            <div className="flex items-center gap-4 w-full md:w-auto">
                <img src="logo.png" alt="Logo" className="h-24 w-auto object-contain" onError={(e) => e.currentTarget.style.display='none'} />
                <div className="flex-1">
                    <input 
                        type="text" 
                        value={settings.companyName}
                        onChange={(e) => onSettingsChange({...settings, companyName: e.target.value})}
                        className="text-2xl font-black text-green-600 uppercase w-full bg-transparent border-b border-transparent hover:border-slate-300 focus:border-green-500 focus:outline-none placeholder-green-300 transition-colors print:border-none print:p-0"
                        placeholder="NOME DA SUA EMPRESA"
                    />
                    <input 
                        type="text" 
                        value={settings.contactInfo}
                        onChange={(e) => onSettingsChange({...settings, contactInfo: e.target.value})}
                        className="text-sm text-slate-500 w-full bg-transparent border-b border-transparent hover:border-slate-300 focus:border-green-500 focus:outline-none p-0 transition-colors print:border-none"
                        placeholder="Telefone | Email | Site"
                    />
                </div>
            </div>
            <div className="text-right w-full md:w-auto flex flex-col items-end">
                <h2 className="text-4xl font-black text-slate-800 uppercase tracking-tighter">Proposta Comercial</h2>
                <div className="text-sm text-slate-500 mt-1 flex flex-col items-end">
                    <div>Data: {formattedDate}</div>
                    <div className="flex items-center justify-end gap-1 text-green-600 font-bold group">
                        <span>Validade:</span>
                        <input 
                            type="number"
                            min="1"
                            value={settings.validityDays}
                            onChange={(e) => onSettingsChange({...settings, validityDays: parseInt(e.target.value) || 1})}
                            className="w-8 bg-transparent text-right border-b border-transparent hover:border-green-400 focus:border-green-500 focus:outline-none print:hidden cursor-pointer text-green-600 font-bold"
                            title="Editar dias de validade"
                        />
                        <span className="print:hidden">dias</span>
                        <span>({formattedValidDate})</span>
                    </div>
                </div>
            </div>
        </div>

        {/* 2. CLIENT DETAILED INFO */}
        <div className="bg-slate-50 p-6 rounded-lg border border-slate-200 mb-8 grid grid-cols-1 md:grid-cols-2 gap-6 print:break-inside-avoid">
            <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase mb-2 flex items-center gap-1">
                    <Home size={12} /> Detalhes do Cliente
                </h3>
                <div className="space-y-1">
                    <div className="text-lg font-bold text-slate-800">{data.clientName || "Cliente"}</div>
                    <div className="text-sm text-slate-600">{data.address || "Endereço não informado"}</div>
                    <div className="flex gap-4 mt-2">
                        <span className="text-xs bg-white border border-slate-200 px-2 py-1 rounded text-slate-500">
                           <b>Ligação:</b> {data.connectionType} ({data.clientGroup === 'A' ? 'Grupo A' : 'Grupo B'})
                        </span>
                        <span className="text-xs bg-white border border-slate-200 px-2 py-1 rounded text-slate-500">
                           <b>Consumo Médio:</b> ~{estimatedConsumption} kWh
                        </span>
                    </div>
                </div>
            </div>
            <div className="flex flex-col md:items-end">
                 <h3 className="text-xs font-bold text-slate-400 uppercase mb-2">Responsável Técnico</h3>
                 <input 
                    type="text" 
                    value={settings.sellerName}
                    onChange={(e) => onSettingsChange({...settings, sellerName: e.target.value})}
                    className="text-lg font-bold text-slate-800 bg-transparent border-b border-dashed border-slate-300 hover:border-slate-400 focus:border-green-500 w-full md:w-auto text-right focus:outline-none print:border-none transition-colors"
                />
            </div>
        </div>

        {/* 3. TECHNICAL SPECIFICATIONS (High Value) */}
        <div className="mb-8 print:break-inside-avoid">
             <h3 className="text-lg font-bold text-slate-700 mb-4 flex items-center gap-2 border-l-4 border-sky-500 pl-3">
                <Zap size={20} className="text-sky-500" /> Especificações do Sistema
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Specs Table */}
                <div className="border border-slate-200 rounded-lg overflow-hidden">
                    <table className="w-full text-sm">
                        <tbody>
                             <tr className="bg-slate-50 border-b border-slate-100">
                                <td className="p-3 font-semibold text-slate-600">Potência Total (Gerador)</td>
                                <td className="p-3 font-bold text-slate-900 text-right">{specs.totalPowerKw.toFixed(2)} kWp</td>
                            </tr>
                            <tr className="border-b border-slate-100">
                                <td className="p-3 font-semibold text-slate-600">Módulos Fotovoltaicos</td>
                                <td className="p-3 text-slate-700 text-right">
                                    {data.moduleCount}x {data.moduleBrand ? data.moduleBrand : ''} {data.modulePowerW}W
                                    <div className="text-[10px] text-slate-400">Tecnologia Monocristalina / PERC</div>
                                </td>
                            </tr>
                             <tr className="bg-slate-50 border-b border-slate-100">
                                <td className="p-3 font-semibold text-slate-600">Inversor Interativo</td>
                                <td className="p-3 text-slate-700 text-right">
                                    {data.inverterBrand ? data.inverterBrand : 'Premium'} - {specs.suggestedInverter}
                                    <div className="text-[10px] text-slate-400">Monitoramento WiFi Incluso</div>
                                </td>
                            </tr>
                            <tr className="border-b border-slate-100">
                                <td className="p-3 font-semibold text-slate-600">Estrutura de Fixação</td>
                                <td className="p-3 text-slate-700 text-right">{getStructureDescription(data.roofType)}</td>
                            </tr>
                             <tr className="bg-slate-50">
                                <td className="p-3 font-semibold text-slate-600">Produção Estimada (Mês)</td>
                                <td className="p-3 font-bold text-green-600 text-right">~ {Math.round(specs.generationMonthlyAvg)} kWh/mês</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* Roof Layout Image */}
                <div className="border border-slate-200 rounded-lg p-2 bg-slate-50 flex flex-col items-center justify-center relative min-h-[200px]">
                    {roofImage ? (
                        <>
                            <div className="absolute top-2 left-2 bg-white/80 px-2 py-1 rounded text-[10px] font-bold text-slate-600 shadow-sm z-10">
                                LAYOUT PRELIMINAR
                            </div>
                            <img src={roofImage} alt="Layout Telhado" className="w-full h-48 object-cover rounded shadow-sm" />
                        </>
                    ) : (
                        <div className="text-center text-slate-400">
                            <Camera size={32} className="mx-auto mb-2 opacity-50" />
                            <p className="text-xs">Foto do telhado não anexada</p>
                        </div>
                    )}
                </div>
            </div>
        </div>

        {/* 4. FINANCIAL ANALYSIS */}
        <div className="mb-8 p-6 bg-slate-900 rounded-xl text-white shadow-lg print:bg-white print:text-black print:border-2 print:border-slate-800 print:shadow-none print:break-inside-avoid">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2 print:text-black">
                <DollarSign size={20} className="text-green-400" /> Viabilidade Financeira
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center border-r border-slate-700 print:border-slate-200">
                    <div className="text-slate-400 text-xs uppercase mb-1 print:text-slate-500">Investimento Total</div>
                    <div className="text-3xl font-black text-green-400 print:text-black">{formatMoney(data.investmentAmount)}</div>
                    <div className="text-[10px] text-slate-500 mt-1">Equipamentos + Instalação + Homologação</div>
                </div>
                <div className="text-center border-r border-slate-700 print:border-slate-200">
                    <div className="text-slate-400 text-xs uppercase mb-1 print:text-slate-500">Retorno (Payback)</div>
                    <div className="text-3xl font-black text-sky-400 print:text-black">{payback}</div>
                    <div className="text-[10px] text-slate-500 mt-1">Tempo para recuperar o valor</div>
                </div>
                 <div className="text-center">
                    <div className="text-slate-400 text-xs uppercase mb-1 print:text-slate-500">Economia em 25 Anos</div>
                    <div className="text-3xl font-black text-orange-400 print:text-black">{formatMoney(financials.totalSavings25Years)}</div>
                    <div className="text-[10px] text-slate-500 mt-1">Proteção contra inflação energética</div>
                </div>
            </div>
            
            <div className="mt-6 pt-6 border-t border-slate-700 print:border-slate-300">
                <h4 className="text-xs font-bold uppercase text-slate-400 mb-2 flex items-center gap-2 print:text-slate-600">
                    <PenSquare size={12} /> Condições de Pagamento
                </h4>
                <textarea 
                    value={settings.paymentTerms}
                    onChange={(e) => onSettingsChange({...settings, paymentTerms: e.target.value})}
                    className="w-full bg-transparent text-sm text-slate-300 resize-none border border-transparent hover:border-slate-600 focus:border-green-500 rounded p-1 focus:outline-none h-16 transition-colors print:text-black print:border-none print:h-auto"
                />
            </div>
        </div>

        {/* 5. GENERATION CHART */}
        <div className="mb-8 border border-slate-200 rounded-lg p-6 print:break-inside-avoid">
             <h3 className="text-lg font-bold text-slate-700 mb-4 flex items-center gap-2 border-l-4 border-green-500 pl-3">
                <TrendingUp size={20} className="text-green-500" /> Geração Estimada (Mensal)
            </h3>
            <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                <BarChart data={productionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 10, fontWeight: 'bold' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <Tooltip cursor={{ fill: 'rgba(34, 197, 94, 0.1)' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                    <Bar dataKey="generation" radius={[4, 4, 0, 0]}>
                        {productionData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill="#22c55e" />
                        ))}
                    </Bar>
                </BarChart>
                </ResponsiveContainer>
            </div>
        </div>

        {/* 6. SCOPE OF SERVICES & DIFFERENTIALS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 print:break-inside-avoid">
            
            {/* Escopo */}
            <div>
                <h3 className="text-sm font-bold text-slate-700 uppercase mb-3 flex items-center gap-2">
                    <HardHat size={16} className="text-orange-500" /> Escopo de Fornecimento
                </h3>
                <ul className="text-sm text-slate-600 space-y-2">
                    <li className="flex gap-2">
                        <CheckCircle2 size={16} className="text-green-500 shrink-0" />
                        <span>Projeto de Engenharia e ART.</span>
                    </li>
                    <li className="flex gap-2">
                        <CheckCircle2 size={16} className="text-green-500 shrink-0" />
                        <span>Homologação completa na Concessionária.</span>
                    </li>
                    <li className="flex gap-2">
                        <CheckCircle2 size={16} className="text-green-500 shrink-0" />
                        <span>Instalação e Montagem Eletromecânica.</span>
                    </li>
                    <li className="flex gap-2">
                        <CheckCircle2 size={16} className="text-green-500 shrink-0" />
                        <span>Configuração de Monitoramento Remoto.</span>
                    </li>
                    <li className="flex gap-2">
                        <CheckCircle2 size={16} className="text-green-500 shrink-0" />
                        <span>Treinamento de uso do sistema.</span>
                    </li>
                </ul>
            </div>

            {/* Diferenciais */}
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <h3 className="text-sm font-bold text-slate-700 uppercase mb-3 flex items-center gap-2">
                    <ShieldCheck size={16} className="text-sky-500" /> Diferenciais Competitivos
                </h3>
                <textarea 
                    value={settings.differentialsText}
                    onChange={(e) => onSettingsChange({...settings, differentialsText: e.target.value})}
                    className="w-full bg-transparent text-sm text-slate-600 resize-none border border-transparent hover:border-slate-300 focus:border-sky-500 rounded focus:outline-none min-h-[120px] transition-colors print:border-none print:bg-transparent print:resize-none"
                    placeholder="Liste aqui seus diferenciais..."
                />
            </div>
        </div>

        {/* 7. WARRANTIES */}
        <div className="mb-8 border-t pt-6 print:break-inside-avoid">
            <h3 className="text-sm font-bold text-slate-700 uppercase mb-2 flex items-center gap-2">
                <FileText size={14} className="text-slate-400" /> Termos de Garantia
            </h3>
            <textarea 
                value={settings.warrantyText}
                onChange={(e) => onSettingsChange({...settings, warrantyText: e.target.value})}
                className="w-full bg-white border border-slate-200 hover:border-slate-300 focus:border-green-500 rounded-lg p-3 text-sm text-slate-600 focus:ring-1 focus:ring-green-500 focus:outline-none min-h-[80px] transition-colors print:border-none print:bg-transparent print:p-0 print:text-black print:resize-none"
            />
        </div>

        {/* 8. SIGNATURES */}
        <div className="grid grid-cols-2 gap-12 mt-8 pt-8 border-t border-slate-300 print:break-inside-avoid">
            <div className="text-center">
                <div className="border-t-2 border-slate-800 w-3/4 mx-auto mb-2"></div>
                <div className="font-bold text-slate-900 uppercase">Márcio Gonçalves</div>
                <div className="text-[10px] text-slate-500 uppercase">Responsável Técnico</div>
                <div className="text-[10px] text-slate-500">{settings.companyName}</div>
            </div>
            <div className="text-center">
                <div className="border-t-2 border-slate-800 w-3/4 mx-auto mb-2"></div>
                <div className="font-bold text-slate-700">{data.clientName || "Cliente"}</div>
                <div className="text-[10px] text-slate-500">Contratante</div>
            </div>
        </div>

        {/* FOOTER */}
        <div className="mt-8 pt-4 border-t border-slate-100 text-center print:break-inside-avoid">
             <p className="text-[10px] text-slate-400">
                Esta proposta é uma estimativa baseada nos dados fornecidos. A geração real pode variar conforme condições climáticas. 
                Projeto sujeito à aprovação da concessionária de energia.
             </p>
        </div>
      </div>
    </div>
  );
};
