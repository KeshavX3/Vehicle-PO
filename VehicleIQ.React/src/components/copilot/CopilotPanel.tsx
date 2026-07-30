import React, { useRef, useEffect, useState } from 'react';
import { Bot, X, Send, Trash2, Sparkles, Loader2 } from 'lucide-react';
import MessageBubble from './MessageBubble';
import SuggestedPrompts from './SuggestedPrompts';
import type { CopilotMessage } from '../../types';

interface CopilotPanelProps {
  isOpen: boolean;
  onClose: () => void;
  messages: CopilotMessage[];
  isLoading: boolean;
  onSendMessage: (text: string) => void;
  onClearChat: () => void;
  pageContext: string;
}

export default function CopilotPanel({
  isOpen,
  onClose,
  messages,
  isLoading,
  onSendMessage,
  onClearChat,
  pageContext,
}: CopilotPanelProps) {
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isLoading) return;
    onSendMessage(inputText);
    setInputText('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[440px] bg-cockpit-bg/95 backdrop-blur-2xl border-l border-white/15 shadow-[0_0_50px_rgba(0,0,0,0.8)] flex flex-col transition-all duration-300 animate-slide-left">
      {/* Panel Top Glow Shimmer Bar */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-blue-600 via-cyan-400 to-indigo-500 pointer-events-none" />

      {/* Panel Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 bg-cockpit-surface-2/60">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-400 border border-white/20 flex items-center justify-center text-white shadow-md shadow-cyan-500/20">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-sm font-extrabold text-white tracking-tight">VehicleIQ Copilot</h3>
              <span className="px-1.5 py-0.5 bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[9px] font-mono font-bold rounded-md">AI</span>
            </div>
            <p className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5 text-cyan-400" /> Executive Fleet AI Advisor
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={onClearChat}
            className="p-2 text-slate-400 hover:text-red-400 rounded-xl hover:bg-white/5 transition-colors"
            title="Clear Chat"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/5 transition-colors"
            title="Close Panel"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg, idx) => (
          <MessageBubble key={idx} message={msg} />
        ))}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex items-center gap-2.5 p-3.5 rounded-2xl bg-cockpit-surface border border-cyan-500/30 text-slate-300 text-xs animate-pulse w-fit my-2 shadow-[0_0_15px_rgba(6,182,212,0.15)]">
            <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />
            <span className="font-mono text-[11px]">Analyzing telemetry & dispatching functions...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Prompts */}
      <div className="px-4 py-2 border-t border-white/5 bg-cockpit-surface-2/30">
        <SuggestedPrompts pageContext={pageContext} onSelectPrompt={(p) => onSendMessage(p)} />
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-white/10 bg-cockpit-surface-2/90">
        <div className="relative flex items-center">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Ask Copilot about mileage, expenses, maintenance..."
            disabled={isLoading}
            className="w-full pl-4 pr-12 py-3 rounded-xl bg-cockpit-bg border border-white/15 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/40 text-xs sm:text-sm text-white placeholder-slate-400 transition-all outline-none"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isLoading}
            className="absolute right-2 p-2 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-500 text-white disabled:opacity-40 transition-all duration-200 shadow-md"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
