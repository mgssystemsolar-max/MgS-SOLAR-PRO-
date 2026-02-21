import React, { useState, useEffect } from 'react';
import { LogOut, Sun, Wifi, WifiOff } from 'lucide-react';

interface HeaderProps {
  onLogout: () => void;
  userEmail?: string;
}

export const Header: React.FC<HeaderProps> = ({ onLogout, userEmail }) => {
  const [logoError, setLogoError] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleStatusChange = () => setIsOnline(navigator.onLine);
    window.addEventListener('online', handleStatusChange);
    window.addEventListener('offline', handleStatusChange);
    return () => {
      window.removeEventListener('online', handleStatusChange);
      window.removeEventListener('offline', handleStatusChange);
    };
  }, []);

  return (
    <header className="flex justify-between items-center mb-8 pb-4 border-b border-green-600 print:mb-4 print:pb-2">
      <div className="flex items-center gap-4">
        <div className="bg-white p-1 rounded-lg print:hidden shadow-lg shadow-green-500/20 flex items-center justify-center w-14 h-14">
            {!logoError ? (
                <img 
                    src="logo.png" 
                    alt="MGS Logo" 
                    className="h-12 w-auto object-contain" 
                    onError={() => setLogoError(true)} 
                />
            ) : (
                <Sun size={32} className="text-orange-500" />
            )}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-green-500 m-0 leading-tight print:text-black print:text-xl">MGS SYSTEM SOLAR</h1>
          <div className="flex items-center gap-2">
            <p className="text-xs text-slate-400 print:text-slate-600">(88) 98836-0143</p>
            {!isOnline && (
                <span className="flex items-center gap-1 text-[10px] font-bold text-red-400 bg-red-900/20 px-2 py-0.5 rounded-full animate-pulse print:hidden">
                    <WifiOff size={10} /> OFFLINE
                </span>
            )}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-4 print:hidden">
        <span className="text-sm text-slate-400 hidden sm:block">{userEmail}</span>
        <button 
          onClick={onLogout}
          className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors"
        >
          <LogOut size={16} />
          SAIR
        </button>
      </div>
    </header>
  );
};