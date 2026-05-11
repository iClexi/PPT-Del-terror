import React from 'react';
import { Printer } from 'lucide-react';

export const PrintButton: React.FC<{ className?: string }> = ({ className = '' }) => {
  const handlePrint = () => {
    if (typeof window !== 'undefined') window.print();
  };
  return (
    <button
      type="button"
      onClick={handlePrint}
      className={`print:hidden inline-flex items-center gap-2 rounded-md border-2 border-retro-accent bg-slate-900 px-3 py-2 text-xs text-retro-accent hover:bg-slate-800 font-arcade ${className}`}
    >
      <Printer size={14} />
      Imprimir / PDF
    </button>
  );
};
