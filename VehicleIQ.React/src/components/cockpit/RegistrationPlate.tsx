import React from 'react';

interface RegistrationPlateProps {
  registrationNumber: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function RegistrationPlate({ registrationNumber, size = 'md' }: RegistrationPlateProps) {
  const sizeClasses = {
    sm: 'text-[10px] px-2 py-0.5 border rounded-md',
    md: 'text-xs px-2.5 py-1 border rounded-lg',
    lg: 'text-sm px-3.5 py-1.5 border-2 rounded-xl',
  };

  return (
    <div className={`inline-flex items-center gap-1.5 bg-gradient-to-b from-white via-slate-100 to-slate-200 text-slate-950 border-slate-400/80 font-mono font-black tracking-wider shadow-md shadow-black/40 select-none ${sizeClasses[size]}`}>
      {/* IND Blue Strip */}
      <div className="flex flex-col items-center justify-center leading-none text-[8px] text-blue-900 font-sans font-black pr-1 border-r border-slate-300">
        <span className="text-[8px] leading-none mb-0.5">🇮🇳</span>
        <span className="font-black text-[7px] tracking-tighter text-blue-900">IND</span>
      </div>

      {/* Reg Number */}
      <span className="uppercase text-slate-950 tracking-widest font-black drop-shadow-[0_1px_0_rgba(255,255,255,0.8)]">
        {registrationNumber}
      </span>
    </div>
  );
}
