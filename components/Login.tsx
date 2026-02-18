import React, { useState } from 'react';
import { ArrowRight } from 'lucide-react';

interface LoginProps {
  onLogin: (email: string) => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Simulate Auth Latency
    setTimeout(() => {
        if (email && password) {
             // In a real app, this would use Firebase Auth signInWithEmailAndPassword
            onLogin(email);
        } else {
            setError("Preencha todos os campos.");
            setIsLoading(false);
        }
    }, 800);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 p-4 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-green-500/10 rounded-full blur-[100px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-sky-500/10 rounded-full blur-[100px]" />

      <div className="z-10 flex flex-col items-center mb-8 animate-fade-in-down text-center">
        <div className="bg-white p-4 rounded-2xl shadow-xl shadow-green-500/20 mb-6">
            <img src="logo.png" alt="MGS Logo" className="h-20 w-auto object-contain" />
        </div>
        <h1 className="text-3xl font-bold text-white tracking-tight">MGS SOLAR PRO <span className="text-2xl">👊</span></h1>
        <p className="text-slate-400 mt-2">Sistema de Gestão Fotovoltaica</p>
      </div>

      <div className="w-full max-w-sm bg-slate-800 border border-slate-700 p-8 rounded-2xl shadow-xl z-10">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
                <label className="block text-xs font-bold text-slate-400 mb-1 uppercase">E-mail Técnico</label>
                <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tecnico@mgs.com"
                    className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none transition-all"
                />
            </div>
            
            <div>
                <label className="block text-xs font-bold text-slate-400 mb-1 uppercase">Senha</label>
                <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none transition-all"
                />
            </div>

            {error && <p className="text-red-400 text-sm text-center font-medium">{error}</p>}

            <button 
                type="submit" 
                disabled={isLoading}
                className="mt-4 bg-green-600 hover:bg-green-500 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-green-900/30"
            >
                {isLoading ? 'ACESSANDO...' : 'ENTRAR NO SISTEMA'}
                {!isLoading && <ArrowRight size={18} />}
            </button>
        </form>
      </div>
      
      <p className="mt-8 text-slate-600 text-xs z-10">v44.0 - Oficial Build</p>
    </div>
  );
};