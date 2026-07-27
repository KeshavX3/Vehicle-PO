import React from 'react';

interface RegistrationPlateProps {
  registrationNumber: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function RegistrationPlate({ registrationNumber, size = 'md' }: RegistrationPlateProps) {
  const sizeClasses = {
    sm: 'text-[10px] px-2 py-0.5 border rounded',
    md: 'text-xs px-2.5 py-1 border-1.5 rounded-md',
    lg: 'text-sm px-3.5 py-1.5 border-2 rounded-lg',
  };

  return (
    <div className={`inline-flex items-center gap-1.5 bg-[#F9FAFB] text-slate-900 border-slate-400 font-mono font-bold tracking-wider shadow-sm select-none ${sizeClasses[size]}`}>
      {/* IND Blue Strip */}
      <div className="flex flex-col items-center justify-center leading-none text-[8px] text-blue-800 font-sans font-black pr-1 border-r border-slate-300">
        <span className="text-[7px]">🇮🇳</span>
        <span className="font-extrabold text-[8px] tracking-tighter">IND</span>
      </div>

      {/* Reg Number */}
      <span className="uppercase text-slate-950 tracking-widest">{registrationNumber}</span>
    </div>
  );
}
