import React from 'react';
import { Sun, CheckCircle2, Zap, Calendar, TrendingUp, DollarSign, PenSquare, Clock, Info, Home } from 'lucide-react';
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
}

export const ProposalView: React.FC<Props> = ({ 
  data, specs, financials, payback, productionData, checklist, settings, onSettingsChange 
}) => {
  
  const formatMoney = (val: number) => {
    return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const getStructureDescription = (type: string) => {
      switch (type) {
        case 'Cerâmico': return 'Sistema de fixação coplanar com ganchos ajustáveis em Aço Inox (Telhado Colonial).';
        case 'Fibrocimento': return 'Fixação através de parafusos prisioneiros em inox com vedação EPDM (Telhado Ondulado).';
        case 'Metálico': return 'Estrutura coplanar com mini-trilhos ou fixação direta na terça (Telha Metálica).';
        case 'Laje': return 'Estrutura triangular com inclinação otimizada e lastros de concreto (Laje Plana).';
        case 'Solo': return 'Estrutura de solo galvanizada com fundações em concreto e angulação norte corrigida.';
        default: return 'Estrutura de fixação padrão em alumínio anodizado e aço inox.';
      }
  };

  const today = new Date();
  const validUntil = new Date();
  validUntil.setDate(today.getDate() + (settings.validityDays || 5));

  return (
    <div className="bg-white text-slate-800 p-8 rounded-xl shadow-2xl max-w-5xl mx-auto print:shadow-none print:p-0 print:max-w-none animate-fade-in relative overflow-hidden">
      
      {/* MARCA D'ÁGUA / TIMBRE */}
      <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none">
         <img 
            src="logo.png" 
            alt="MGS Watermark" 
            className="w-[70%] opacity-[0.04] print:opacity-[0.06] grayscale filter"
         />
      </div>

      <div className="relative z-10">
        {/* HEADER & COMPANY INFO (Editable) */}
        <div className="flex flex-col md:flex-row justify-between items-start border-b-4 border-green-500 pb-6 mb-8 gap-4">
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
                    <div>Data: {today.toLocaleDateString()}</div>
                    <div className="flex items-center gap-2 mt-1 print:hidden">
                        <span className="text-xs font-bold text-slate-400">Validade (Dias):</span>
                        <input 
                            type="number" 
                            min="1"
                            max="30"
                            value={settings.validityDays}
                            onChange={(e) => onSettingsChange({...settings, validityDays: parseInt(e.target.value) || 1})}
                            className="w-12 text-center bg-slate-100 border border-slate-300 rounded text-xs py-1 focus:ring-1 focus:ring-green-500 outline-none"
                        />
                    </div>
                    <div className="text-green-600 font-bold">
                        Válido até: {validUntil.toLocaleDateString()}
                    </div>
                </div>
            </div>
        </div>

        {/* CLIENT & LOCATION */}
        <div className="bg-slate-50 p-6 rounded-lg border border-slate-200 mb-8 flex flex-col md:flex-row justify-between gap-6 print:break-inside-avoid">
            <div className="flex-1">
                <h3 className="text-xs font-bold text-slate-400 uppercase mb-1">Cliente / Local da Obra</h3>
                <div className="text-lg font-bold text-slate-800">{data.clientName || "Cliente"}</div>
                <div className="text-sm text-slate-600">{data.address || "Endereço não informado"}</div>
                {data.latitude && <div className="text-xs text-slate-500 mt-1">Coord: {data.latitude.toFixed(5)}, {data.longitude?.toFixed(5)}</div>}
            </div>
            <div className="flex-1 md:text-right">
                <h3 className="text-xs font-bold text-slate-400 uppercase mb-1">Consultor Técnico</h3>
                <input 
                    type="text" 
                    value={settings.sellerName}
                    onChange={(e) => onSettingsChange({...settings, sellerName: e.target.value})}
                    className="text-lg font-bold text-slate-800 bg-transparent border-b border-dashed border-slate-300 hover:border-slate-400 focus:border-green-500 w-full md:w-auto text-right focus:outline-none print:border-none transition-colors"
                    placeholder="Seu Nome"
                />
                <div className="text-xs text-slate-400 mt-1 print:hidden">(Clique para editar)</div>
            </div>
        </div>

        {/* BIG NUMBERS GRID */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 print:break-inside-avoid">
            <div className="p-4 bg-green-50 rounded-lg border border-green-100 text-center">
                <Sun className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <div className="text-sm text-slate-500">Potência (Kit)</div>
                <div className="text-2xl font-black text-green-700">{specs.totalPowerKw.toFixed(2)} kWp</div>
            </div>
            <div className="p-4 bg-sky-50 rounded-lg border border-sky-100 text-center">
                <Zap className="w-8 h-8 text-sky-500 mx-auto mb-2" />
                <div className="text-sm text-slate-500">Média Mensal</div>
                {/* Average generation is roughly sum / 12 */}
                <div className="text-2xl font-black text-sky-700">
                    {Math.round(productionData.reduce((acc, curr) => acc + curr.generation, 0) / 12)} kWh
                </div>
            </div>
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-100 text-center">
                <DollarSign className="w-8 h-8 text-slate-500 mx-auto mb-2" />
                <div className="text-sm text-slate-500">Economia Anual</div>
                <div className="text-2xl font-black text-slate-700">{formatMoney(financials.annualSavings)}</div>
            </div>
            <div className="p-4 bg-orange-50 rounded-lg border border-orange-100 text-center">
                <Calendar className="w-8 h-8 text-orange-500 mx-auto mb-2" />
                <div className="text-sm text-slate-500">Retorno (Payback)</div>
                <div className="text-2xl font-black text-orange-600">{payback}</div>
            </div>
        </div>

        {/* CHART SECTION */}
        <div className="mb-8 p-6 bg-white border border-slate-200 rounded-lg shadow-sm print:break-inside-avoid print:shadow-none print:border-slate-300">
            <h3 className="text-lg font-bold text-slate-700 mb-4 flex items-center gap-2">
                <TrendingUp size={20} className="text-green-500" />
                Geração de Energia Estimada (kWh)
            </h3>
            <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                <BarChart data={productionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis 
                        dataKey="month" 
                        tick={{ fill: '#64748b', fontSize: 11, fontWeight: 'bold' }} 
                        axisLine={false} 
                        tickLine={false} 
                    />
                    <YAxis 
                        tick={{ fill: '#64748b', fontSize: 11 }} 
                        axisLine={false} 
                        tickLine={false}
                    />
                    <Tooltip 
                        cursor={{ fill: 'rgba(34, 197, 94, 0.1)' }}
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                    />
                    <Bar dataKey="generation" radius={[4, 4, 0, 0]}>
                        {productionData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill="#22c55e" />
                        ))}
                    </Bar>
                </BarChart>
                </ResponsiveContainer>
            </div>
        </div>

        {/* EQUIPMENT LIST (Checklist) */}
        <div className="mb-8 print:break-inside-avoid">
            <div className="flex justify-between items-end mb-4">
                 <h3 className="text-lg font-bold text-slate-700 flex items-center gap-2">
                    <CheckCircle2 size={20} className="text-sky-500" />
                    Equipamentos e Serviços Inclusos
                </h3>
            </div>
            
            {/* Info Tipo Telhado */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-4 flex items-start gap-3 print:bg-white print:border-slate-300">
                <div className="bg-sky-100 p-2 rounded-full text-sky-600 print:bg-sky-50">
                    <Home size={20} />
                </div>
                <div>
                    <h4 className="text-sm font-bold text-slate-700 uppercase">Tipo de Instalação: {data.roofType}</h4>
                    <p className="text-sm text-slate-500">{getStructureDescription(data.roofType)}</p>
                </div>
            </div>

            <div className="overflow-hidden border border-slate-200 rounded-lg print:border-slate-300">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-100 text-slate-600 font-bold uppercase text-xs print:bg-slate-200 print:text-black">
                        <tr>
                            <th className="p-3 border-b border-slate-200">Item / Descrição</th>
                            <th className="p-3 border-b border-slate-200 w-24 text-center">Qtd</th>
                            <th className="p-3 border-b border-slate-200">Detalhes</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 print:divide-slate-200">
                        {checklist.map((item) => (
                            <tr key={item.id} className="hover:bg-slate-50 print:bg-white">
                                <td className="p-3 font-semibold text-slate-700 print:text-black">{item.label}</td>
                                <td className="p-3 text-center text-slate-600 print:text-black">{item.quantity}</td>
                                <td className="p-3 text-slate-500 italic print:text-slate-700">{item.observation || '-'}</td>
                            </tr>
                        ))}
                        {/* Add Services Manually to visual list */}
                        <tr className="hover:bg-slate-50 print:bg-white">
                            <td className="p-3 font-semibold text-slate-700">Homologação na Concessionária</td>
                            <td className="p-3 text-center text-slate-600">1</td>
                            <td className="p-3 text-slate-500 italic">Projeto de engenharia e trâmites legais</td>
                        </tr>
                        <tr className="hover:bg-slate-50 print:bg-white">
                            <td className="p-3 font-semibold text-slate-700">Instalação e Montagem</td>
                            <td className="p-3 text-center text-slate-600">1</td>
                            <td className="p-3 text-slate-500 italic">Mão de obra especializada</td>
                        </tr>
                        {/* Exibir Valor do Kit se existir */}
                        {data.kitValue && data.kitValue > 0 && (
                            <tr className="hover:bg-slate-50 bg-green-50 print:bg-slate-100">
                                <td className="p-3 font-bold text-slate-700">Valor do Kit Fotovoltaico</td>
                                <td className="p-3 text-center text-slate-600">1 Un</td>
                                <td className="p-3 font-bold text-green-700 print:text-black">{formatMoney(data.kitValue)}</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>

        {/* FINANCIALS & INVESTMENT */}
        <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-8 print:break-inside-avoid">
            <div>
                <h3 className="text-lg font-bold text-slate-700 mb-4 flex items-center gap-2">
                    <DollarSign size={20} className="text-green-600" /> Investimento
                </h3>
                <div className="p-6 bg-slate-900 rounded-xl text-white shadow-lg print:bg-white print:text-black print:border-2 print:border-slate-800 print:shadow-none">
                    <div className="text-slate-400 text-sm uppercase mb-1 print:text-slate-600">Valor Total do Projeto</div>
                    <div className="text-4xl font-black text-green-400 mb-4 print:text-black">{formatMoney(data.investmentAmount)}</div>
                    
                    <div className="border-t border-slate-700 pt-4 mt-4 print:border-slate-300">
                        <h4 className="text-xs font-bold uppercase text-slate-400 mb-2 flex items-center gap-2 print:text-slate-600">
                            <PenSquare size={12} /> Condições de Pagamento
                        </h4>
                        <textarea 
                            value={settings.paymentTerms}
                            onChange={(e) => onSettingsChange({...settings, paymentTerms: e.target.value})}
                            className="w-full bg-transparent text-sm text-slate-300 resize-none border border-transparent hover:border-slate-600 focus:border-green-500 rounded p-1 focus:outline-none h-20 transition-colors print:text-black print:border-none print:h-auto print:resize-none"
                            placeholder="Descreva as condições de pagamento..."
                        />
                    </div>
                </div>
            </div>
            
            <div>
                <h3 className="text-lg font-bold text-slate-700 mb-4 flex items-center gap-2">
                    <TrendingUp size={20} className="text-sky-500" /> Projeção (25 Anos)
                </h3>
                <div className="bg-green-50 border border-green-200 rounded-xl p-6 h-full flex flex-col justify-center items-center text-center print:border-slate-300 print:bg-white">
                    <p className="text-slate-600 mb-2">Acumulado que você deixa de pagar para a concessionária:</p>
                    <div className="text-4xl font-black text-green-600 mb-2 print:text-black">
                        {formatMoney(financials.totalSavings25Years)}
                    </div>
                    <p className="text-xs text-slate-500">*Considerando inflação energética média de 6% a.a.</p>
                </div>
            </div>
        </div>

        {/* WARRANTIES & TERMS */}
        <div className="mb-8 border-t pt-8 print:break-inside-avoid">
            <h3 className="text-sm font-bold text-slate-700 uppercase mb-2 flex items-center gap-2">
                <CheckCircle2 size={14} className="text-slate-400" /> Garantias e Validade
            </h3>
            <textarea 
                value={settings.warrantyText}
                onChange={(e) => onSettingsChange({...settings, warrantyText: e.target.value})}
                className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-green-500 rounded-lg p-4 text-sm text-slate-600 focus:ring-1 focus:ring-green-500 focus:outline-none min-h-[100px] transition-colors print:border-none print:bg-transparent print:p-0 print:text-black print:resize-none"
                placeholder="Descreva os termos de garantia..."
            />
        </div>

        {/* SIGNATURES */}
        <div className="grid grid-cols-2 gap-12 mt-8 pt-8 border-t border-slate-300 print:break-inside-avoid">
            <div className="text-center">
                <div className="border-t-2 border-slate-800 w-3/4 mx-auto mb-2"></div>
                <div className="font-bold text-slate-900 uppercase">Márcio Gonçalves da Silva</div>
                <div className="text-xs font-bold text-slate-700 uppercase">Responsável Técnico em Eletrotécnica</div>
                <div className="text-[10px] text-slate-500 mt-1">{settings.companyName}</div>
            </div>
            <div className="text-center">
                <div className="border-t-2 border-slate-800 w-3/4 mx-auto mb-2"></div>
                <div className="font-bold text-slate-700">{data.clientName || "Cliente"}</div>
                <div className="text-xs text-slate-500">Contratante</div>
            </div>
        </div>

        {/* FOOTER INFORMATIVO */}
        <div className="mt-8 pt-6 border-t-2 border-slate-100 text-xs print:break-inside-avoid bg-slate-50 p-6 rounded-lg print:bg-transparent print:p-0">
            <h4 className="font-bold text-slate-700 uppercase mb-4 flex items-center gap-2">
                <Info size={16} className="text-sky-500" /> Entenda seu Sistema Fotovoltaico
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                    <strong className="text-green-600 block mb-1 text-sm">Objetivo Principal</strong>
                    <p className="text-slate-500 leading-relaxed">
                        O foco deste sistema é a <strong>redução da conta de luz</strong> e a maximização do retorno financeiro (ROI). O sistema converte luz solar em eletricidade para abater seu consumo da rede, protegendo você contra a inflação energética.
                    </p>
                </div>
                <div>
                    <strong className="text-sky-600 block mb-1 text-sm">Metodologia de Cálculo</strong>
                    <p className="text-slate-500 leading-relaxed">
                        O dimensionamento foi realizado com base na <strong>média de consumo mensal (kWh)</strong> dos últimos 12 meses, dividida pela radiação solar local (HSP - Horas de Sol Pleno) da sua região.
                    </p>
                </div>
                <div>
                    <strong className="text-orange-500 block mb-1 text-sm">Regras de Compensação</strong>
                    <p className="text-slate-500 leading-relaxed">
                        Este projeto respeita as normas vigentes de <strong>Geração Distribuída (GD)</strong>. A energia gerada e não consumida instantaneamente é injetada na rede, gerando créditos para abater o consumo à noite ou em dias nublados.
                    </p>
                </div>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-200 text-[10px] text-slate-400 text-center italic">
                * A geração de energia pode variar conforme condições climáticas e sombreamentos não previstos. O sistema depende da rede da concessionária para funcionar (sistema On-Grid).
            </div>
        </div>
      </div>
    </div>
  );
};