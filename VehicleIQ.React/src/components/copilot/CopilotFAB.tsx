import React from 'react';
import { Bot, Sparkles } from 'lucide-react';

interface CopilotFABProps {
  onClick: () => void;
  isOpen: boolean;
}

export default function CopilotFAB({ onClick, isOpen }: CopilotFABProps) {
  if (isOpen) return null;

  return (
    <button
      onClick={onClick}
      aria-label="Open VehicleIQ AI Copilot"
      className="fixed bottom-6 right-6 z-40 group flex items-center gap-2.5 px-4.5 py-3.5 rounded-full bg-gradient-to-r from-blue-600 via-cyan-500 to-indigo-600 text-white font-extrabold text-xs sm:text-sm shadow-[0_10px_30px_rgba(6,182,212,0.35)] hover:shadow-[0_15px_40px_rgba(6,182,212,0.5)] transform hover:-translate-y-1 transition-all duration-300 border border-white/30"
    >
      <div className="relative flex items-center justify-center">
        <Bot className="w-5 h-5 text-white group-hover:rotate-12 transition-transform duration-300" />
        <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-300 opacity-90"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white"></span>
        </span>
      </div>
      <span className="tracking-wide flex items-center gap-1.5 font-black uppercase text-xs">
        Copilot AI <Sparkles className="w-3.5 h-3.5 text-cyan-200 fill-cyan-200" />
      </span>
    </button>
  );
}
