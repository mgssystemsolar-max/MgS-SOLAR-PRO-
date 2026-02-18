import React from 'react';
import { X, Trash2, Upload } from 'lucide-react';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-2xl shadow-2xl flex flex-col max-h-[80vh]">
        <div className="flex justify-between items-center p-5 border-b border-slate-700">
          <h2 className="text-xl font-bold text-white">Histórico de Obras</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {projects.length === 0 ? (
            <div className="text-center text-slate-500 py-10">
              Nenhum projeto salvo.
            </div>
          ) : (
            projects.map((proj) => (
              <div key={proj.id} className="bg-slate-800 p-4 rounded-xl border border-slate-700 flex justify-between items-center group hover:border-sky-500 transition-all">
                <div>
                  <h3 className="font-bold text-white">{proj.clientName || "Cliente Sem Nome"}</h3>
                  <p className="text-xs text-slate-400">{new Date(proj.date).toLocaleString()}</p>
                  <p className="text-xs text-sky-400 mt-1">{proj.data.moduleCount} Módulos • R$ {proj.data.investmentAmount}</p>
                </div>
                <div className="flex gap-2">
                    <button 
                        onClick={() => { onLoad(proj); onClose(); }}
                        className="p-2 bg-sky-500/20 text-sky-400 rounded-lg hover:bg-sky-500 hover:text-white transition-colors"
                        title="Carregar"
                    >
                        <Upload size={16} />
                    </button>
                    <button 
                        onClick={() => onDelete(proj.id)}
                        className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500 hover:text-white transition-colors"
                        title="Excluir"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};