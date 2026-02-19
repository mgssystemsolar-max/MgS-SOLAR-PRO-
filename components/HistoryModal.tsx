
import React from 'react';
import { X, Trash2, Upload, FolderOpen } from 'lucide-react';
import { SavedProject } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  projects: SavedProject[];
  onLoad: (project: SavedProject) => void;
  onDelete: (id: string) => void;
}

export const HistoryModal: React.FC<Props> = ({ isOpen, onClose, projects, onLoad, onDelete }) => {
  if (!isOpen) return null;

  return (
    // Z-Index aumentado para 100 para sobrepor qualquer mapa ou card
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md transition-all animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-2xl shadow-2xl flex flex-col max-h-[85vh] relative animate-scale-in">
        
        <div className="flex justify-between items-center p-5 border-b border-slate-700 bg-slate-800/50 rounded-t-2xl">
          <div className="flex items-center gap-2">
            <FolderOpen className="text-sky-500" size={24} />
            <div>
                <h2 className="text-xl font-bold text-white">Histórico de Obras</h2>
                <p className="text-xs text-slate-400">Gerencie seus projetos salvos</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
          {projects.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-center border-2 border-dashed border-slate-700 rounded-xl bg-slate-800/30">
              <FolderOpen size={48} className="text-slate-600 mb-2" />
              <p className="text-slate-500 font-medium">Nenhum projeto salvo ainda.</p>
              <p className="text-slate-600 text-xs">Salve um projeto no editor para vê-lo aqui.</p>
            </div>
          ) : (
            projects.map((proj) => (
              <div key={proj.id} className="bg-slate-800 p-4 rounded-xl border border-slate-700 flex justify-between items-center group hover:border-sky-500 hover:shadow-lg hover:shadow-sky-500/10 transition-all">
                <div className="flex-1 min-w-0 pr-4">
                  <h3 className="font-bold text-white truncate text-lg">{proj.clientName || "Cliente Sem Nome"}</h3>
                  <p className="text-xs text-slate-400 mb-1">{new Date(proj.date).toLocaleString()}</p>
                  <div className="flex gap-2">
                    <span className="text-[10px] bg-slate-700 px-2 py-0.5 rounded text-sky-300 border border-slate-600">
                        {proj.data.moduleCount} Módulos
                    </span>
                    <span className="text-[10px] bg-slate-700 px-2 py-0.5 rounded text-green-300 border border-slate-600">
                        {proj.data.investmentAmount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                    <button 
                        onClick={() => { onLoad(proj); onClose(); }}
                        className="p-2.5 bg-sky-500 text-white rounded-lg hover:bg-sky-400 transition-colors shadow-lg shadow-sky-900/20"
                        title="Carregar Projeto"
                    >
                        <Upload size={18} />
                    </button>
                    <button 
                        onClick={() => onDelete(proj.id)}
                        className="p-2.5 bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg hover:bg-red-500 hover:text-white transition-colors"
                        title="Excluir Definitivamente"
                    >
                        <Trash2 size={18} />
                    </button>
                </div>
              </div>
            ))
          )}
        </div>
        
        <div className="p-4 border-t border-slate-700 bg-slate-800/30 text-center rounded-b-2xl">
            <p className="text-[10px] text-slate-500">
                Os projetos são salvos no armazenamento local do seu navegador.
            </p>
        </div>
      </div>
    </div>
  );
};
