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
      className="fixed bottom-6 right-6 z-40 group flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-cockpit-amber via-amber-500 to-amber-600 text-black font-bold text-xs sm:text-sm shadow-xl shadow-cockpit-amber/20 hover:shadow-2xl hover:shadow-cockpit-amber/35 transform hover:-translate-y-1 transition-all duration-300 border border-amber-300/40"
    >
      <div className="relative flex items-center justify-center">
        <Bot className="w-5 h-5 text-black group-hover:rotate-12 transition-transform duration-300" />
        <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-black opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-black"></span>
        </span>
      </div>
      <span className="tracking-wide flex items-center gap-1 font-extrabold">
        Copilot <Sparkles className="w-3.5 h-3.5 fill-black/20" />
      </span>
    </button>
  );
}
