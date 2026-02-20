import React from 'react';
import { Loader2 } from 'lucide-react';

export const Loading: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-green-500 gap-4">
      <Loader2 size={48} className="animate-spin" />
      <p className="text-slate-400 text-sm font-medium animate-pulse">Carregando sistema...</p>
    </div>
  );
};
