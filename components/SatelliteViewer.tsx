import React, { useState } from 'react';
import { Map, MousePointerClick, Maximize2, Grid3X3, X, Compass } from 'lucide-react';
import { Card, CardHeader } from './ui/Card';

interface Props {
  lat?: number;
  lng?: number;
}

export const SatelliteViewer: React.FC<Props> = ({ lat, lng }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showGrid, setShowGrid] = useState(false);

  const MapContainer = () => (
      <div className="relative w-full h-full bg-slate-900">
         <iframe 
            key={`${lat}-${lng}`} // Key is critical to force reload when coordinates change
            title="Satellite Map"
            width="100%" 
            height="100%" 
            frameBorder="0" 
            style={{ border: 0, borderRadius: '8px' }}
            src={`https://maps.google.com/maps?q=${lat},${lng}&t=k&z=20&ie=UTF8&iwloc=&output=embed`}
            allowFullScreen
         />
         
         {/* Grid Overlay */}
         {showGrid && (
            <div 
                className="absolute inset-0 pointer-events-none opacity-30 z-10" 
                style={{ 
                    backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', 
                    backgroundSize: '20px 20px' 
                }}
            />
          )}
      </div>
  );

  const Placeholder = () => (
    <div className="flex flex-col items-center justify-center h-64 bg-slate-900/50 text-center p-6 border border-slate-700 rounded-lg">
        <div className="bg-slate-800 p-4 rounded-full mb-3 animate-pulse">
            <MousePointerClick className="text-slate-500 w-8 h-8" />
        </div>
        <p className="text-slate-400 text-sm font-bold mb-1">Aguardando Localização</p>
        <p className="text-slate-500 text-xs max-w-xs">
            Use a busca de endereço no painel acima para carregar o Mapa via Satélite.
        </p>
    </div>
  );

  // Fullscreen Modal View
  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-[9999] bg-slate-900 flex flex-col">
        <div className="flex justify-between items-center p-4 border-b border-slate-700 bg-slate-800">
          <h2 className="text-white font-bold flex items-center gap-2">
            <Map size={20} className="text-orange-400" /> 
            Avaliação de Telhado (Satélite)
          </h2>
          <div className="flex gap-2">
             <button 
                onClick={() => setShowGrid(!showGrid)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-colors ${showGrid ? 'bg-sky-500 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
              >
                <Grid3X3 size={16} /> {showGrid ? 'Ocultar Grade' : 'Mostrar Grade'}
              </button>
              <button 
                onClick={() => setIsFullscreen(false)}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-bold"
              >
                <X size={20} /> Fechar
              </button>
          </div>
        </div>
        <div className="flex-1 relative">
             {lat && lng ? <MapContainer /> : <Placeholder />}
        </div>
      </div>
    );
  }

  // Card View
  return (
    <Card className="print:break-inside-avoid relative group">
      <div className="flex justify-between items-start mb-2">
        <CardHeader 
            title="Avaliação de Telhado (Satélite)" 
            icon={<Map size={18} className="text-orange-400" />} 
            colorClass="text-orange-400" 
        />
        {lat && lng && (
             <div className="flex gap-2">
                <button 
                    onClick={() => setShowGrid(!showGrid)}
                    className={`p-1.5 rounded-md transition-colors ${showGrid ? 'bg-sky-500/20 text-sky-400' : 'text-slate-500 hover:text-white hover:bg-slate-700'}`}
                    title="Alternar Grade"
                >
                    <Grid3X3 size={16} />
                </button>
                <button 
                    onClick={() => setIsFullscreen(true)}
                    className="p-1.5 rounded-md text-slate-500 hover:text-white hover:bg-slate-700 transition-colors"
                    title="Expandir Tela"
                >
                    <Maximize2 size={16} />
                </button>
            </div>
        )}
      </div>
      
      <div className="relative w-full h-64 bg-slate-900 rounded-lg overflow-hidden border border-slate-700">
         {lat && lng ? <MapContainer /> : <Placeholder />}
      </div>
      
      {lat && lng && (
        <div className="mt-3 flex gap-2 items-start bg-yellow-500/10 p-2 rounded border border-yellow-500/20">
            <Compass size={14} className="text-yellow-500 mt-0.5 flex-shrink-0" />
            <p className="text-[10px] text-yellow-500/80 leading-tight">
                Utilize a visualização em tela cheia para ver mais detalhes do telhado.
            </p>
        </div>
      )}
    </Card>
  );
};