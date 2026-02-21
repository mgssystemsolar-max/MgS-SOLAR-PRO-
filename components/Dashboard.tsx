
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
  // ... (existing state) ...
  const [isOnline, setIsOnline] = useState(navigator.onLine);

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

  // ... (rest of existing effects) ...

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
