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
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[420px] bg-cockpit-bg-soft/95 backdrop-blur-xl border-l border-cockpit-border shadow-2xl flex flex-col transition-all duration-300 animate-slide-left">
      {/* Panel Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-cockpit-border bg-cockpit-surface-2/60">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-cockpit-amber/20 border border-cockpit-amber/40 flex items-center justify-center text-cockpit-amber shadow-md shadow-cockpit-amber/10">
            <Bot className="w-4.5 h-4.5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-sm font-extrabold text-cockpit-text tracking-tight">VehicleIQ Copilot</h3>
              <span className="px-1.5 py-0.5 bg-cockpit-cyan/20 text-cockpit-cyan border border-cockpit-cyan/30 text-[9px] font-mono font-bold rounded">AI</span>
            </div>
            <p className="text-[10px] font-mono text-cockpit-muted flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5 text-cockpit-amber" /> Integrated Fleet Assistant
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={onClearChat}
            className="p-1.5 text-cockpit-muted hover:text-cockpit-red rounded-lg transition-colors"
            title="Clear Chat"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="p-1.5 text-cockpit-muted hover:text-cockpit-text rounded-lg transition-colors"
            title="Close Panel"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.map((msg, idx) => (
          <MessageBubble key={idx} message={msg} />
        ))}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-cockpit-surface-2/60 border border-cockpit-border/40 text-cockpit-muted text-xs animate-pulse w-fit my-2">
            <Loader2 className="w-4 h-4 text-cockpit-amber animate-spin" />
            <span>Analyzing fleet telemetry...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Prompts */}
      <div className="px-4 py-2 border-t border-cockpit-border/40 bg-cockpit-surface-2/30">
        <SuggestedPrompts pageContext={pageContext} onSelectPrompt={(p) => onSendMessage(p)} />
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-cockpit-border bg-cockpit-surface-2/80">
        <div className="relative flex items-center">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Ask Copilot about your fleet..."
            disabled={isLoading}
            className="w-full pl-4 pr-12 py-3 rounded-xl bg-cockpit-bg border border-cockpit-border focus:border-cockpit-amber focus:ring-1 focus:ring-cockpit-amber text-xs sm:text-sm text-cockpit-text placeholder-cockpit-muted transition-all outline-none"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isLoading}
            className="absolute right-2 p-2 rounded-lg bg-cockpit-amber/20 hover:bg-cockpit-amber text-cockpit-amber hover:text-black disabled:opacity-40 disabled:hover:bg-cockpit-amber/20 disabled:hover:text-cockpit-amber transition-all duration-200"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
