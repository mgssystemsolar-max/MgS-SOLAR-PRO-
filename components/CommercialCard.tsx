
import React, { useState, useEffect } from 'react';
import { DollarSign, MapPin, Search, Loader2, User, Phone, MessageCircle, Send, Wrench, Zap, Wand2, Calculator, Wallet, Building } from 'lucide-react';
import { Card, CardHeader } from './ui/Card';
import { SolarSystemData, TechnicalSpecs } from '../types';
import { calculatePayback, calculateModulesFromBill, calculateStringSuggestion } from '../services/solarLogic';

interface Props {
  data: SolarSystemData;
  onChange: (field: keyof SolarSystemData, value: number | string) => void;
  specs: TechnicalSpecs;
}

export const CommercialCard: React.FC<Props> = ({ data, onChange, specs }) => {
  const [loadingLoc, setLoadingLoc] = useState(false);

  // Handlers para cálculo financeiro
  const handleCostChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const cost = parseFloat(e.target.value) || 0;
    onChange('kitCost', cost);
    // Recalcula valor final mantendo a margem
    const margin = data.profitMargin || 0;
    const finalPrice = cost * (1 + margin / 100);
    const newTotal = Math.round(finalPrice);
    onChange('investmentAmount', newTotal);
    
    // Opcional: Ajustar Entrada Proporcionalmente (30%) se desejar manter a proporção
    // onChange('downPayment', Math.round(newTotal * 0.3));
  };

  const handleMarginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const margin = parseFloat(e.target.value) || 0;
    onChange('profitMargin', margin);
    // Recalcula valor final baseada no custo
    const cost = data.kitCost || 0;
    const finalPrice = cost * (1 + margin / 100);
    const newTotal = Math.round(finalPrice);
    onChange('investmentAmount', newTotal);
    // onChange('downPayment', Math.round(newTotal * 0.3));
  };

  const handleInvestmentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const price = parseFloat(e.target.value) || 0;
    onChange('investmentAmount', price);
    // Recalcula a margem inversa baseada no custo fixo
    if (data.kitCost > 0) {
        const newMargin = ((price / data.kitCost) - 1) * 100;
        onChange('profitMargin', parseFloat(newMargin.toFixed(1)));
    }
  };

  const handleDownPaymentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
     const val = parseFloat(e.target.value) || 0;
     onChange('downPayment', val);
  };

  // Busca coordenadas usando OpenStreetMap (Nominatim)
  const handleAddressSearch = async () => {
    if (!data.address || data.address.length < 5) {
        alert("Digite um endereço válido para buscar.");
        return;
    }

    setLoadingLoc(true);
    try {
        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(data.address)}&limit=1`);
        const results = await response.json();
        
        if (results && results.length > 0) {
            const lat = parseFloat(results[0].lat);
            const lng = parseFloat(results[0].lon);
            const formattedAddress = results[0].display_name;

            updateLocationData(lat, lng);
            // Opcional: Atualizar com o endereço formatado retornado ou manter o que o usuário digitou
            // onChange('address', formattedAddress); 
        } else {
            alert("Endereço não encontrado.");
        }
    } catch (error) {
        console.error("Erro na busca de endereço:", error);
        alert("Erro ao buscar endereço. Verifique sua conexão.");
    } finally {
        setLoadingLoc(false);
    }
  };

  // Busca localização pelo GPS do navegador + Nominatim Reverso
  const handleGeoLocation = () => {
    if (navigator.geolocation) {
      setLoadingLoc(true);
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          
          updateLocationData(lat, lng);

          // Reverse Geocoding com OpenStreetMap
          try {
              const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
              const result = await response.json();
              if (result && result.display_name) {
                  onChange('address', result.display_name);
              }
          } catch (e) {
              console.error("Erro no geocoding reverso", e);
          }
          
          setLoadingLoc(false);
        },
        (error) => {
          console.error(error);
          setLoadingLoc(false);
          alert("Não foi possível obter a localização. Verifique as permissões do navegador.");
        }
      );
    } else {
      alert("Geolocalização não suportada neste navegador.");
    }
  };

  const updateLocationData = (lat: number, lng: number) => {
      // Lógica original: se lat > -12 (Mais ao Norte/Nordeste), HSP = 6.0, senão 5.8
      const newHsp = lat > -12 ? 6.0 : 5.8;
      
      onChange('hsp', newHsp);
      onChange('latitude', lat);
      onChange('longitude', lng);
  };

  const handleSendToWhatsapp = (type: 'client' | 'team') => {
      if(!data.address && (!data.latitude || !data.longitude)) {
          alert("Localize a obra primeiro para enviar.");
          return;
      }

      const clientName = data.clientName || 'Cliente';
      const mapsLink = `https://maps.google.com/?q=${data.latitude},${data.longitude}`;
      
      let message = '';
      
      if (type === 'client') {
          message = `Olá *${clientName}*! 👋\n\nConfirmamos o agendamento da sua *Visita Técnica / Manutenção*.\n\n📍 *Endereço:* ${data.address}\n🗺️ *Localização:* ${mapsLink}\n\nQualquer dúvida, estamos à disposição!`;
      } else {
          message = `🛠️ *DADOS PARA VISITA TÉCNICA*\n\n👤 *Cliente:* ${clientName}\n📞 *Contato:* ${data.clientPhone || 'N/D'}\n📍 *Endereço:* ${data.address}\n🗺️ *GPS:* ${mapsLink}`;
      }

      const phone = type === 'client' ? data.clientPhone?.replace(/\D/g, '') : '';
      
      // If sending to client, use their phone. If sending to team, open generic whatsapp share or ask for number (using generic link here allows user to pick contact)
      const url = phone 
        ? `https://wa.me/55${phone}?text=${encodeURIComponent(message)}`
        : `https://wa.me/?text=${encodeURIComponent(message)}`;

      window.open(url, '_blank');
  };

  // Cálculo automático quando a conta é alterada
  const handleBillChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newBill = parseFloat(e.target.value) || 0;
      onChange('billAmount', newBill);
      
      // Auto-calculate modules
      if (newBill > 0) {
          const suggestedModules = calculateModulesFromBill(
              newBill, 
              data.energyTariff, 
              data.hsp, 
              data.modulePowerW
          );
          if (suggestedModules > 0) {
              onChange('moduleCount', suggestedModules);
              // Cálculo Automático de String (Otimização para o Inversor)
              const suggestedString = calculateStringSuggestion(suggestedModules);
              onChange('modulesPerString', suggestedString);
          }
      }
  };

  const payback = calculatePayback(data.investmentAmount, data.billAmount);

  // Cálculos de Entrada e Restante
  const currentDownPayment = data.downPayment !== undefined ? data.downPayment : (data.investmentAmount * 0.3);
  const downPaymentPercent = data.investmentAmount > 0 ? ((currentDownPayment / data.investmentAmount) * 100).toFixed(0) : "0";
  const remainingAmount = data.investmentAmount - currentDownPayment;

  return (
    <Card>
      <CardHeader title="Visita Técnica & Comercial" icon={<User size={18} className="text-green-500" />} />
      
      {/* Dados do Cliente e Visita */}
      <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700 mb-6">
        <div className="flex items-center gap-2 mb-3">
            <Wrench size={16} className="text-orange-400" />
            <span className="text-xs font-bold text-orange-400 uppercase">Agendamento & Cliente</span>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
            <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-1">NOME DO CLIENTE</label>
                <div className="relative">
                    <User size={14} className="absolute left-3 top-3 text-slate-500" />
                    <input 
                        type="text" 
                        value={data.clientName || ''}
                        onChange={(e) => onChange('clientName', e.target.value)}
                        placeholder="Ex: João Silva"
                        className="w-full bg-slate-900 border border-slate-600 rounded-lg py-2.5 pl-9 pr-3 text-white text-sm focus:ring-1 focus:ring-green-500 outline-none"
                    />
                </div>
            </div>
            <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-1">WHATSAPP / TELEFONE</label>
                <div className="relative">
                    <Phone size={14} className="absolute left-3 top-3 text-slate-500" />
                    <input 
                        type="text" 
                        value={data.clientPhone || ''}
                        onChange={(e) => onChange('clientPhone', e.target.value)}
                        placeholder="(00) 00000-0000"
                        className="w-full bg-slate-900 border border-slate-600 rounded-lg py-2.5 pl-9 pr-3 text-white text-sm focus:ring-1 focus:ring-green-500 outline-none"
                    />
                </div>
            </div>
        </div>

        {/* Botões de Ação Rápida */}
        <div className="flex gap-2 mt-2">
             <button 
                onClick={() => handleSendToWhatsapp('client')}
                className="flex-1 bg-green-600 hover:bg-green-500 text-white py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                disabled={!data.clientPhone || !data.address}
             >
                <MessageCircle size={14} /> Confirmar c/ Cliente
             </button>
             <button 
                onClick={() => handleSendToWhatsapp('team')}
                className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                disabled={!data.address}
             >
                <Send size={14} /> Enviar p/ Técnico
             </button>
        </div>
      </div>

      <hr className="border-slate-700 mb-4" />

      {/* Seção de Endereço */}
      <div className="mb-4">
        <label className="block text-xs font-bold text-slate-400 mb-1">Localizar Obra (Busca Automática)</label>
        <div className="flex gap-2">
            <input 
                type="text" 
                value={data.address || ''}
                onChange={(e) => onChange('address', e.target.value)}
                placeholder="Endereço, Cidade ou CEP..."
                className="flex-1 bg-slate-900 border border-slate-600 rounded-lg p-3 text-white text-sm focus:ring-2 focus:ring-sky-500 outline-none print:bg-white print:text-black print:border-slate-300"
                onKeyDown={(e) => e.key === 'Enter' && handleAddressSearch()}
            />
            <button 
                onClick={handleAddressSearch}
                disabled={loadingLoc}
                className="bg-sky-500 hover:bg-sky-600 text-white p-3 rounded-lg transition-colors print:hidden flex items-center justify-center disabled:opacity-50 disabled:cursor-wait"
                title="Buscar Endereço"
            >
                {loadingLoc ? <Loader2 className="animate-spin" size={20}/> : <Search size={20} />}
            </button>
            <button 
                onClick={handleGeoLocation}
                disabled={loadingLoc}
                className="bg-green-600 hover:bg-green-700 text-white p-3 rounded-lg transition-colors print:hidden flex items-center justify-center disabled:opacity-50"
                title="Usar meu GPS Atual"
            >
                <MapPin size={20} />
            </button>
        </div>
        {data.latitude && (
            <p className="text-[10px] text-slate-500 mt-1 text-right">
                Lat: {data.latitude.toFixed(6)}, Lng: {data.longitude?.toFixed(6)}
            </p>
        )}
      </div>

      {/* Inputs Conta e Tarifa e Categoria */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
         <div>
          <label className="block text-xs font-bold text-slate-400 mb-1 flex items-center gap-1">
              <Building size={12} /> Categoria
          </label>
          <select 
            value={data.clientType} 
            onChange={(e) => onChange('clientType', e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-sky-500 focus:outline-none print:bg-white print:text-black print:border-slate-300 appearance-none"
          >
              <option value="Residencial">Residencial</option>
              <option value="Comercial">Comercial</option>
              <option value="Industrial">Industrial</option>
              <option value="Rural">Rural</option>
          </select>
        </div>

        <div className="relative">
          <label className="block text-xs font-bold text-sky-400 mb-1 flex items-center gap-1">
              <Wand2 size={12} /> Conta Mensal (R$)
          </label>
          <input 
            type="number" 
            value={data.billAmount} 
            onChange={handleBillChange}
            className="w-full bg-slate-900 border border-sky-500/50 rounded-lg p-3 text-white font-bold focus:ring-2 focus:ring-sky-500 focus:outline-none print:bg-white print:text-black print:border-slate-300"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-400 mb-1">Tarifa (R$/kWh)</label>
          <input 
            type="number" 
            step="0.01"
            value={data.energyTariff} 
            onChange={(e) => onChange('energyTariff', parseFloat(e.target.value) || 0)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-green-500 focus:outline-none print:bg-white print:text-black print:border-slate-300"
          />
        </div>
      </div>
      
      {/* SEÇÃO FINANCEIRA REFORMULADA */}
      <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700 mb-4">
        <div className="flex items-center gap-2 mb-3">
            <Calculator size={16} className="text-green-400" />
            <span className="text-xs font-bold text-green-400 uppercase">Custo, Margem & Venda</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
             <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase">Custo Kit (Fornecedor)</label>
                <div className="relative">
                    <span className="absolute left-3 top-3 text-slate-500 text-xs">R$</span>
                    <input 
                        type="number" 
                        value={data.kitCost || ''} 
                        onChange={handleCostChange}
                        className="w-full bg-slate-800 border border-slate-600 rounded-lg py-2 pl-8 pr-2 text-white text-sm font-medium focus:ring-1 focus:ring-green-500 outline-none"
                    />
                </div>
            </div>
            
            <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase">Margem de Lucro</label>
                <div className="relative">
                    <input 
                        type="number" 
                        value={data.profitMargin || ''} 
                        onChange={handleMarginChange}
                        className="w-full bg-slate-800 border border-slate-600 rounded-lg py-2 pl-3 pr-8 text-white text-sm font-medium focus:ring-1 focus:ring-green-500 outline-none"
                    />
                    <span className="absolute right-3 top-2.5 text-slate-500 text-xs font-bold">%</span>
                </div>
            </div>

            <div>
                <label className="block text-[10px] font-bold text-green-400 mb-1 uppercase">Valor Final (Venda)</label>
                <div className="relative">
                    <span className="absolute left-3 top-2.5 text-green-500 text-xs font-bold">R$</span>
                    <input 
                        type="number" 
                        value={data.investmentAmount} 
                        onChange={handleInvestmentChange}
                        className="w-full bg-slate-800 border border-green-500/50 rounded-lg py-2 pl-8 pr-2 text-green-400 text-lg font-bold focus:ring-1 focus:ring-green-500 outline-none shadow-lg shadow-green-900/10"
                    />
                </div>
            </div>
        </div>

        {/* Simulação de Pagamento (Com Entrada Editável) */}
        <div className="bg-slate-800 rounded-lg p-3 border border-slate-700">
             <div className="flex items-center gap-2 mb-2">
                <Wallet size={12} className="text-sky-400" />
                <span className="text-[10px] font-bold text-slate-400 uppercase">Simulação de Pagamento</span>
             </div>
             <div className="flex justify-between items-center text-xs">
                <div className="flex flex-col flex-1 pr-2">
                    <label className="text-[9px] text-slate-500 mb-0.5">Entrada ({downPaymentPercent}%)</label>
                    <div className="relative">
                         <span className="absolute left-2 top-1.5 text-sky-500 text-[10px] font-bold">R$</span>
                         <input 
                            type="number" 
                            value={currentDownPayment} 
                            onChange={handleDownPaymentChange}
                            className="w-full bg-slate-900 border border-slate-600 rounded px-2 py-1 pl-6 text-sky-400 font-bold text-xs focus:ring-1 focus:ring-sky-500 outline-none"
                         />
                    </div>
                </div>
                <div className="h-8 w-px bg-slate-600 mx-2"></div>
                <div className="flex flex-col text-right flex-1">
                    <span className="text-slate-500 mb-1">Restante (Financ./Boleto)</span>
                    <span className="text-white font-bold text-sm">
                        R$ {remainingAmount.toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                    </span>
                </div>
             </div>
             <div className="mt-2 pt-2 border-t border-slate-700 flex justify-between items-center text-xs">
                 <span className="text-slate-500">Sem Entrada (100% Financiado)</span>
                 <span className="text-orange-400 font-bold">R$ {data.investmentAmount.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</span>
             </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
            <label className="block text-xs font-bold text-slate-400 mb-1">HSP Regional</label>
            <input 
                type="number" 
                step="0.1" 
                value={data.hsp} 
                onChange={(e) => onChange('hsp', parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-green-500 focus:outline-none print:bg-white print:text-black print:border-slate-300"
            />
        </div>
        <div>
            <label className="block text-xs font-bold text-slate-400 mb-1">Payback Estimado</label>
            <div className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-sky-400 font-bold flex items-center">
                {payback}
            </div>
        </div>
      </div>
    </Card>
  );
};