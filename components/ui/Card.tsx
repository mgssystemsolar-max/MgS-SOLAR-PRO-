import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = '' }) => {
  return (
    <div className={`bg-slate-800 border border-slate-700 rounded-xl p-5 shadow-sm print:bg-white print:border-slate-300 print:text-black ${className}`}>
      {children}
    </div>
  );
};

export const CardHeader: React.FC<{ title: string; icon?: React.ReactNode; colorClass?: string }> = ({ title, icon, colorClass = "text-green-500" }) => (
  <div className={`flex items-center gap-2 mb-4 pb-2 border-b-2 ${colorClass === 'text-green-500' ? 'border-green-500' : 'border-sky-400'}`}>
    {icon}
    <h3 className={`text-sm font-bold uppercase tracking-wide ${colorClass} print:text-black`}>{title}</h3>
  </div>
);