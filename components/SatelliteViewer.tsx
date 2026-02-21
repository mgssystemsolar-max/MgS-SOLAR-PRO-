
import React, { useState, useEffect, useRef } from 'react';
import { Map as MapIcon, MousePointerClick, Maximize2, Grid3X3, X, Compass, Layers, BarChart2 } from 'lucide-react';
import { Card, CardHeader } from './ui/Card';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet default icon issue
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

interface Props {
  lat?: number;
  lng?: number;
}

// Dados fictícios para o gráfico de telemetria (Exemplo do usuário)
const telemetryData = [
  { time: '10:00', altitude: 400 },
  { time: '10:05', altitude: 405 },
  { time: '10:10', altitude: 398 },
  { time: '10:15', altitude: 410 },
  { time: '10:20', altitude: 420 },
];

// Component to update map view when props change
const MapUpdater: React.FC<{ lat: number, lng: number }> = ({ lat, lng }) => {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng], 19);
  }, [lat, lng, map]);
  return null;
};

export const SatelliteViewer: React.FC<Props> = ({ lat, lng }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showGrid, setShowGrid] = useState(false);
  const [mapType, setMapType] = useState<'satellite' | 'street'>('satellite');
  const [viewMode, setViewMode] = useState<'map' | 'chart'>('map'); // Fixed: viewMode state
  
  const [containerReady, setContainerReady] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect.width > 0 && entry.contentRect.height > 0) {
          setContainerReady(true);
        }
      }
    });

    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  // Force map resize when entering/exiting fullscreen or when container becomes ready
  const MapResizer = () => {
    const map = useMap();
    useEffect(() => {
      map.invalidateSize();
    }, [isFullscreen, containerReady, map, viewMode]);
    return null;
  };

  // Renderização do Mapa
  const renderMapContent = () => {
    if (!containerReady) return null;
    
    return (
    <div className="relative w-full h-full bg-slate-900 z-0">
         <MapContainer 
            center={[lat!, lng!]} 
            zoom={19} 
            style={{ height: '100%', width: '100%', borderRadius: '8px' }}
            scrollWheelZoom={true}
            attributionControl={false}
         >
            <MapResizer />
            {mapType === 'satellite' ? (
                <TileLayer
                    url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                    attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
                    maxZoom={19}
                />
            ) : (
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
            )}
            
            <Marker position={[lat!, lng!]} />
            <MapUpdater lat={lat!} lng={lng!} />
         </MapContainer>
         
         {/* Grid Overlay */}
         <div 
            className={`absolute inset-0 pointer-events-none z-[400] transition-opacity duration-300 ${showGrid ? 'opacity-30' : 'opacity-0'}`} 
            style={{ 
                backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', 
                backgroundSize: '20px 20px' 
            }}
        />

        {/* Map Type Toggle */}
        <div className="absolute bottom-4 left-4 z-[400] flex gap-2">
            <button 
                onClick={() => setMapType(mapType === 'satellite' ? 'street' : 'satellite')}
                className="bg-slate-800/90 hover:bg-slate-700 text-white p-2 rounded-lg shadow-lg border border-slate-600 text-xs font-bold flex items-center gap-2"
            >
                <Layers size={14} />
                {mapType === 'satellite' ? 'Mudar p/ Mapa' : 'Mudar p/ Satélite'}
            </button>
        </div>
    </div>
  );
  };

  const renderChartContent = () => {
      // Ensure container has height for ResponsiveContainer
      if (!containerReady) return null;

      return (
        <div className="w-full h-full bg-slate-50 p-4 rounded-lg">
            <h3 className="text-center text-slate-700 font-bold mb-2">📊 Altitude do Satélite (km)</h3>
            <div className="w-full h-[90%]">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={telemetryData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="time" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="altitude" stroke="#8884d8" strokeWidth={3} />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
      );
  };

  const renderPlaceholder = () => (
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

  const hasLocation = lat !== undefined && lng !== undefined;

  // Fullscreen Modal View
  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-[9999] bg-slate-900 flex flex-col animate-fade-in">
        <div className="flex justify-between items-center p-4 border-b border-slate-700 bg-slate-800 shadow-xl">
          <h2 className="text-white font-bold flex items-center gap-2">
            <MapIcon size={20} className="text-orange-400" /> 
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
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-lg shadow-red-900/20"
              >
                <X size={20} /> Fechar
              </button>
          </div>
        </div>
        <div className="flex-1 relative bg-black">
             {hasLocation ? (viewMode === 'map' ? renderMapContent() : renderChartContent()) : renderPlaceholder()}
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
            icon={<MapIcon size={18} className="text-orange-400" />} 
            colorClass="text-orange-400" 
        />
        {hasLocation && (
             <div className="flex gap-2">
                {/* Toggle View Mode */}
                <div className="flex bg-slate-800 rounded-md p-1 border border-slate-700 mr-2">
                    <button
                        onClick={() => setViewMode('map')}
                        className={`p-1.5 rounded transition-colors ${viewMode === 'map' ? 'bg-sky-500 text-white' : 'text-slate-400 hover:text-white'}`}
                        title="Ver Mapa"
                    >
                        <MapIcon size={16} />
                    </button>
                    <button
                        onClick={() => setViewMode('chart')}
                        className={`p-1.5 rounded transition-colors ${viewMode === 'chart' ? 'bg-sky-500 text-white' : 'text-slate-400 hover:text-white'}`}
                        title="Ver Gráfico"
                    >
                        <BarChart2 size={16} />
                    </button>
                </div>

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
      
      <div 
        ref={containerRef}
        className="relative w-full h-64 bg-slate-900 rounded-lg overflow-hidden border border-slate-700 shadow-inner"
      >
         {hasLocation ? (viewMode === 'map' ? renderMapContent() : renderChartContent()) : renderPlaceholder()}
      </div>
      
      {hasLocation && viewMode === 'map' && (
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
