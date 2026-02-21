
import React, { useState, useEffect, useMemo } from 'react';
import { Save, Printer, History, LayoutTemplate, PenTool, Trash2, X } from 'lucide-react';
import { Header } from './Header';
import { CommercialCard } from './CommercialCard';
import { TechnicalCard } from './TechnicalCard';
import { ProductionChart } from './ProductionChart';
import { ChecklistCard } from './ChecklistCard';
import { ProposalView } from './ProposalView';
import { HistoryModal } from './HistoryModal';
import { SatelliteViewer } from './SatelliteViewer';
import { calculateTechnicalSpecs, calculateProduction, generateDefaultChecklist, calculatePayback, calculateFinancials, INVERTER_OPTIONS } from '../services/solarLogic';
import { SolarSystemData, ChecklistItem, User, SavedProject, ProposalSettings } from '../types';

import { saveProjectOffline, getOfflineProjects, deleteProjectOffline, syncOfflineData } from '../services/offlineStorage';

interface DashboardProps {
  user: User;
  onLogout: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ user, onLogout }) => {
  // Main State
  const [solarData, setSolarData] = useState<SolarSystemData>({
    clientName: '',
    clientPhone: '',
    clientType: 'Residencial',
    clientGroup: 'B', // Default Group B (Low Voltage)
    connectionType: 'Monofásico', 
    billAmount: 650,
    energyTariff: 0.95,
    investmentAmount: 18000,
    kitCost: 12000,
    profitMargin: 50,
    downPayment: 5400,
    kitValue: 0,
    hsp: 5.8,
    moduleCount: 8,
    modulesPerString: 8,
    modulePowerW: 575,
    moduleBrand: '', 
    inverterBrand: '', 
    selectedInverter: INVERTER_OPTIONS[0],
    roofType: 'Cerâmico',
    latitude: undefined,
    longitude: undefined,
    address: ''
  });

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [viewMode, setViewMode] = useState<'editor' | 'proposal'>('editor');
  
  // Save Modal State
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [projectName, setProjectName] = useState('');

  // Proposal Settings State (Editable)
  const [proposalSettings, setProposalSettings] = useState<ProposalSettings>({
    companyName: 'MGS SYSTEM SOLAR',
    sellerName: user.email.split('@')[0], 
    contactInfo: '(88) 98836-0143 | contato@mgs.com.br',
    warrantyText: '25 Anos de Eficiência Linear (80%) nos Módulos.\n10 Anos de Garantia contra defeitos de fabricação nos inversores.\n1 Ano de garantia na instalação elétrica e montagem.',
    paymentTerms: 'Entrada de 30% e restante na entrega dos equipamentos.\nFinanciamento bancário em até 60x.',
    differentialsText: '• Equipe própria certificada NR-10 e NR-35.\n• Acompanhamento de geração via App.\n• Projetos personalizados com análise de sombreamento.\n• Pós-venda ativo com limpeza programada.',
    validityDays: 5
  });

  // History State
  const [historyOpen, setHistoryOpen] = useState(false);
  const [savedProjects, setSavedProjects] = useState<SavedProject[]>([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Derived State (Calculations)
  const specs = useMemo(() => calculateTechnicalSpecs(solarData), [solarData]);
  const productionData = useMemo(() => calculateProduction(specs.totalPowerKw, solarData.hsp), [specs.totalPowerKw, solarData.hsp]);
  
  // Payback & Financials agora baseados na GERAÇÃO e TARIFA, não apenas na conta informada.
  const estimatedMonthlySavings = specs.generationMonthlyAvg * solarData.energyTariff;
  const payback = useMemo(() => calculatePayback(solarData.investmentAmount, estimatedMonthlySavings), [solarData.investmentAmount, estimatedMonthlySavings]);
  const financials = useMemo(() => calculateFinancials(solarData, specs.generationMonthlyAvg), [solarData, specs.generationMonthlyAvg]);

  // Effects
  useEffect(() => {
    // Handle Online/Offline Status
    const handleStatusChange = () => {
      setIsOnline(navigator.onLine);
      if (navigator.onLine) {
        syncOfflineData().then(() => {
            // Refresh list after sync if needed
            loadProjects(); 
        });
      }
    };

    window.addEventListener('online', handleStatusChange);
    window.addEventListener('offline', handleStatusChange);

    // Initial Load
    loadProjects();

    return () => {
      window.removeEventListener('online', handleStatusChange);
      window.removeEventListener('offline', handleStatusChange);
    };
  }, []);

  const loadProjects = async () => {
      try {
          // Try loading from IndexedDB first (Offline-first source of truth for this app)
          const offlineProjects = await getOfflineProjects();
          
          // If empty, fallback to localStorage (migration path)
          if (offlineProjects.length === 0) {
              const stored = localStorage.getItem('mgs_projects');
              if (stored) {
                  const parsed = JSON.parse(stored);
                  if (Array.isArray(parsed)) {
                      setSavedProjects(parsed);
                      // Migrate to IndexedDB
                      parsed.forEach(p => saveProjectOffline(p));
                  }
              }
          } else {
              setSavedProjects(offlineProjects.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
          }
      } catch (e) {
          console.error("Error loading projects:", e);
      }
  };

  useEffect(() => {
    // Regenerate checklist items when core technical specs change
    const newItems = generateDefaultChecklist(
      solarData.moduleCount, 
      specs.cableGauge, 
      specs.breakerRating, 
      solarData.roofType,
      specs.suggestedInverter
    );
    setChecklist(prev => {
      return newItems.map(newItem => {
        const existing = prev.find(p => p.id === newItem.id);
        return existing ? { ...newItem, observation: existing.observation ? existing.observation : newItem.observation } : newItem;
      });
    });
  }, [solarData.moduleCount, specs.cableGauge, specs.breakerRating, solarData.roofType, specs.suggestedInverter]);

  // Handlers
  const handleDataChange = (field: keyof SolarSystemData, value: number | string) => {
    setSolarData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageChange = (file: File | null) => {
    if (!file) {
      setImagePreview(null);
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleObsUpdate = (id: string, obs: string) => {
    setChecklist(prev => prev.map(item => item.id === id ? { ...item, observation: obs } : item));
  };

  const handleLabelUpdate = (id: string, label: string) => {
    setChecklist(prev => prev.map(item => item.id === id ? { ...item, label: label } : item));
  };

  const openSaveModal = () => {
    const defaultName = solarData.clientName || (solarData.address ? solarData.address.split(',')[0] : "Novo Cliente");
    setProjectName(defaultName);
    setSaveModalOpen(true);
  };

  const confirmSaveProject = async () => {
    const finalName = projectName.trim() || "Cliente Sem Nome";

    const newProject: SavedProject = {
      id: Date.now().toString(),
      clientName: finalName,
      date: new Date().toISOString(),
      data: { ...solarData, clientName: finalName }
    };

    // Optimistic UI Update
    const updatedList = [newProject, ...savedProjects];
    setSavedProjects(updatedList);
    
    // Save to Offline Storage (IndexedDB)
    try {
        await saveProjectOffline(newProject);
        // Also keep localStorage in sync for now as backup
        localStorage.setItem('mgs_projects', JSON.stringify(updatedList));
    } catch (e) {
        alert("Erro ao salvar projeto. Tente novamente.");
        console.error(e);
    }
    setSaveModalOpen(false);
  };

  const handlePrint = () => {
      // 1. Muda para o modo proposta para garantir que o componente seja renderizado
      setViewMode('proposal');

      // 2. Aguarda um breve momento para o React atualizar o DOM antes de chamar o print
      setTimeout(() => {
          window.print();
      }, 500);
  };

  const handleLoadProject = (proj: SavedProject) => {
    setSolarData({
        ...proj.data,
        // Garante valores padrão caso o projeto salvo seja antigo
        clientType: proj.data.clientType || 'Residencial',
        clientGroup: proj.data.clientGroup || 'B',
        connectionType: proj.data.connectionType || 'Monofásico',
        moduleBrand: proj.data.moduleBrand || '',
        inverterBrand: proj.data.inverterBrand || '',
        energyTariff: proj.data.energyTariff || 0.95,
        roofType: proj.data.roofType || 'Cerâmico',
        modulesPerString: proj.data.modulesPerString || proj.data.moduleCount,
        kitCost: proj.data.kitCost || 10000,
        profitMargin: proj.data.profitMargin || 50,
        selectedInverter: proj.data.selectedInverter || INVERTER_OPTIONS[0],
        downPayment: proj.data.downPayment || (proj.data.investmentAmount * 0.3)
    });
    // Se o projeto salvo tinha imagem (futuro), poderíamos carregar aqui.
    setViewMode('editor'); // Volta para o editor para ver os dados carregados
    // alert(`Projeto de ${proj.clientName} carregado!`); // Removed alert
  };

  const handleDeleteProject = async (id: string) => {
    if(confirm("Tem certeza que deseja excluir este projeto do histórico?")) {
        const updated = savedProjects.filter(p => p.id !== id);
        setSavedProjects(updated);
        
        try {
            await deleteProjectOffline(id);
            localStorage.setItem('mgs_projects', JSON.stringify(updated));
        } catch (e) {
            console.error("Error deleting project:", e);
        }
    }
  };


  return (
    <div className="min-h-screen bg-slate-900 pb-20 print:bg-white print:pb-0">
      <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className={viewMode === 'proposal' ? 'hidden print:hidden' : ''}>
           <Header onLogout={onLogout} userEmail={user.email} />
        </div>

        <div className="flex flex-wrap justify-between items-center mb-6 gap-4 print:hidden">
            <div className="flex bg-slate-800 p-1 rounded-lg border border-slate-700">
                <button 
                    onClick={() => setViewMode('editor')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-bold transition-all ${viewMode === 'editor' ? 'bg-sky-500 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                >
                    <PenTool size={16} /> EDITOR
                </button>
                <button 
                    onClick={() => setViewMode('proposal')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-bold transition-all ${viewMode === 'proposal' ? 'bg-green-500 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                >
                    <LayoutTemplate size={16} /> PROPOSTA
                </button>
            </div>

            <button 
                onClick={() => setHistoryOpen(true)}
                className="flex items-center gap-2 text-slate-400 hover:text-sky-400 transition-colors bg-slate-800 p-2 rounded-lg border border-slate-700 hover:border-sky-500"
            >
                <History size={20} /> <span className="text-sm font-bold">Histórico ({savedProjects.length})</span>
            </button>
        </div>

        {viewMode === 'editor' ? (
            <div className="animate-fade-in print:hidden">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <CommercialCard 
                        data={solarData} 
                        onChange={handleDataChange} 
                        specs={specs} 
                    />
                    <TechnicalCard 
                        data={solarData} 
                        onChange={handleDataChange} 
                        specs={specs}
                        onImageChange={handleImageChange}
                        imagePreview={imagePreview}
                    />
                </div>

                <div className="mb-6">
                    <SatelliteViewer lat={solarData.latitude} lng={solarData.longitude} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <ProductionChart 
                        data={productionData}
                        totalPowerKw={specs.totalPowerKw}
                    />
                    <ChecklistCard 
                        items={checklist}
                        onUpdateObs={handleObsUpdate}
                        onUpdateLabel={handleLabelUpdate}
                    />
                </div>
            </div>
        ) : (
            <ProposalView 
                data={solarData}
                specs={specs}
                financials={financials}
                payback={payback}
                productionData={productionData}
                checklist={checklist}
                settings={proposalSettings}
                onSettingsChange={setProposalSettings}
                roofImage={imagePreview}
            />
        )}

        <div className="flex gap-4 print:hidden mt-6">
          <button 
            onClick={openSaveModal}
            className="flex-1 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white p-4 rounded-xl font-bold flex justify-center items-center gap-2 transition-transform active:scale-95 shadow-lg group"
          >
            <Save size={20} className="group-hover:text-green-400" />
            SALVAR PROJETO
          </button>
          <button 
            onClick={handlePrint}
            className="flex-1 bg-sky-500 hover:bg-sky-600 text-white p-4 rounded-xl font-bold flex justify-center items-center gap-2 transition-transform active:scale-95 shadow-lg shadow-sky-900/20"
          >
            <Printer size={20} />
            IMPRIMIR PROPOSTA
          </button>
        </div>

      </div>

      <HistoryModal 
        isOpen={historyOpen}
        onClose={() => setHistoryOpen(false)}
        projects={savedProjects}
        onLoad={handleLoadProject}
        onDelete={handleDeleteProject}
      />

      {/* Save Project Modal */}
      {saveModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
            <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-2xl shadow-2xl flex flex-col relative animate-scale-in">
                <div className="flex justify-between items-center p-4 border-b border-slate-700 bg-slate-800/50 rounded-t-2xl">
                    <h2 className="text-lg font-bold text-white">Salvar Projeto</h2>
                    <button onClick={() => setSaveModalOpen(false)} className="p-1 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>
                <div className="p-6">
                    <label className="block text-sm font-bold text-slate-400 mb-2">Nome do Cliente / Projeto</label>
                    <input 
                        type="text" 
                        value={projectName}
                        onChange={(e) => setProjectName(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-green-500 outline-none mb-6"
                        placeholder="Ex: João Silva - Residência"
                        autoFocus
                    />
                    <div className="flex gap-3">
                        <button 
                            onClick={() => setSaveModalOpen(false)}
                            className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-3 rounded-lg font-bold transition-colors"
                        >
                            Cancelar
                        </button>
                        <button 
                            onClick={confirmSaveProject}
                            className="flex-1 bg-green-600 hover:bg-green-500 text-white py-3 rounded-lg font-bold transition-colors shadow-lg shadow-green-900/20"
                        >
                            Salvar Agora
                        </button>
                    </div>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};
