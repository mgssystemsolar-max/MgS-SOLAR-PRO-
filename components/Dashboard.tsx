
import React, { useState, useEffect, useMemo } from 'react';
import { Save, Printer, History, LayoutTemplate, PenTool } from 'lucide-react';
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

interface DashboardProps {
  user: User;
  onLogout: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ user, onLogout }) => {
  // Main State
  const [solarData, setSolarData] = useState<SolarSystemData>({
    clientName: '',
    clientPhone: '',
    clientType: 'Residencial', // Default category
    billAmount: 650,
    energyTariff: 0.95, // Default tariff
    investmentAmount: 18000,
    kitCost: 12000, // Default kit cost
    profitMargin: 50, // Default margin %
    downPayment: 5400, // Default down payment (30% of 18000)
    kitValue: 0,
    hsp: 5.8,
    moduleCount: 8,
    modulesPerString: 8, // Default string config
    modulePowerW: 575,
    selectedInverter: INVERTER_OPTIONS[0], // Default to Auto
    roofType: 'Cerâmico', // Default roof
    latitude: undefined,
    longitude: undefined,
    address: ''
  });

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [viewMode, setViewMode] = useState<'editor' | 'proposal'>('editor');
  
  // Proposal Settings State (Editable)
  const [proposalSettings, setProposalSettings] = useState<ProposalSettings>({
    companyName: 'MGS SYSTEM SOLAR',
    sellerName: user.email.split('@')[0], // Default to email username
    contactInfo: '(88) 98836-0143 | contato@mgs.com.br',
    warrantyText: '25 Anos de Eficiência Linear (80%) nos Módulos.\n10 Anos de Garantia contra defeitos de fabricação nos inversores.\n1 Ano de garantia na instalação elétrica e montagem.',
    paymentTerms: 'Entrada de 30% e restante na entrega dos equipamentos.\nFinanciamento bancário em até 60x.',
    validityDays: 5
  });

  // History State
  const [historyOpen, setHistoryOpen] = useState(false);
  const [savedProjects, setSavedProjects] = useState<SavedProject[]>([]);

  // Derived State (Calculations)
  const specs = useMemo(() => calculateTechnicalSpecs(solarData), [solarData]);
  const productionData = useMemo(() => calculateProduction(specs.totalPowerKw, solarData.hsp), [specs.totalPowerKw, solarData.hsp]);
  const payback = useMemo(() => calculatePayback(solarData.investmentAmount, solarData.billAmount), [solarData.investmentAmount, solarData.billAmount]);
  const financials = useMemo(() => calculateFinancials(solarData), [solarData]);

  // Effects
  useEffect(() => {
    // Load history
    const stored = localStorage.getItem('mgs_projects');
    if (stored) {
      try {
        setSavedProjects(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse history");
      }
    }
  }, []);

  useEffect(() => {
    // Regenerate checklist items when core technical specs change
    // Note: This resets manual changes to checklist labels if specs change. 
    // This is intended behavior to keep suggestions relevant.
    const newItems = generateDefaultChecklist(
      solarData.moduleCount, 
      specs.cableGauge, 
      specs.breakerRating, 
      solarData.roofType,
      specs.suggestedInverter
    );
    setChecklist(prev => {
      // Simple merge to keep observations if IDs match, but we overwrite labels to match new specs
      // unless we want to persist manual label overrides. 
      // For now, we overwrite labels on spec change to ensure correct suggestion, 
      // but user can change it back manually if they disagree.
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

  const handleSave = async () => {
    // Use client name or address as default name
    const defaultName = solarData.clientName || (solarData.address ? solarData.address.split(',')[0] : "Novo Cliente");
    const clientName = prompt("Nome do Cliente para identificação:", defaultName);
    if (!clientName) return;

    const newProject: SavedProject = {
      id: Date.now().toString(),
      clientName,
      date: new Date().toISOString(),
      data: { ...solarData, clientName } // Ensure clientName is saved inside data too
    };

    const updatedList = [newProject, ...savedProjects];
    setSavedProjects(updatedList);
    localStorage.setItem('mgs_projects', JSON.stringify(updatedList));
    
    alert("Projeto salvo no histórico!");
  };

  const handleLoadProject = (proj: SavedProject) => {
    // Ensure backwards compatibility with older saved projects that might miss new fields
    setSolarData({
        ...proj.data,
        clientType: proj.data.clientType || 'Residencial',
        energyTariff: proj.data.energyTariff || 0.95,
        roofType: proj.data.roofType || 'Cerâmico',
        modulesPerString: proj.data.modulesPerString || proj.data.moduleCount,
        kitCost: proj.data.kitCost || 10000,
        profitMargin: proj.data.profitMargin || 50,
        selectedInverter: proj.data.selectedInverter || INVERTER_OPTIONS[0],
        downPayment: proj.data.downPayment || (proj.data.investmentAmount * 0.3)
    });
    alert(`Projeto de ${proj.clientName} carregado!`);
  };

  const handleDeleteProject = (id: string) => {
    if(confirm("Tem certeza que deseja excluir este projeto?")) {
        const updated = savedProjects.filter(p => p.id !== id);
        setSavedProjects(updated);
        localStorage.setItem('mgs_projects', JSON.stringify(updated));
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 pb-20 print:bg-white print:pb-0">
      <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Hide default header in proposal view as it has its own printable header */}
        <div className={viewMode === 'proposal' ? 'hidden print:hidden' : ''}>
           <Header onLogout={onLogout} userEmail={user.email} />
        </div>

        {/* Toolbar */}
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
                className="flex items-center gap-2 text-slate-400 hover:text-sky-400 transition-colors"
            >
                <History size={20} /> <span className="text-sm font-bold">Histórico</span>
            </button>
        </div>

        {viewMode === 'editor' ? (
            <div className="animate-fade-in">
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

                {/* Satellite Viewer Section */}
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
            />
        )}

        {/* Action Buttons */}
        <div className="flex gap-4 print:hidden mt-6">
          <button 
            onClick={handleSave}
            className="flex-1 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white p-4 rounded-xl font-bold flex justify-center items-center gap-2 transition-transform active:scale-95 shadow-lg"
          >
            <Save size={20} />
            SALVAR
          </button>
          <button 
            onClick={() => window.print()}
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
    </div>
  );
};