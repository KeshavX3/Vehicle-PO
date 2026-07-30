import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, Sparkles, Trash2, Loader2, Cpu, Shield, Zap, RefreshCw, Copy, Check } from 'lucide-react';
import MessageBubble from '../components/copilot/MessageBubble';
import SuggestedPrompts from '../components/copilot/SuggestedPrompts';
import CockpitCard from '../components/cockpit/CockpitCard';
import { useCopilot } from '../hooks/useCopilot';

const workspaceCategories = [
  {
    title: 'Fleet & Vehicle Analysis',
    icon: Cpu,
    prompts: [
      'Which vehicle costs me the most money to operate?',
      'Compare my vehicles side-by-side on cost-per-km and efficiency',
      'Show overall fleet health scores and deductions',
    ],
  },
  {
    title: 'Fuel & Maintenance Insights',
    icon: Zap,
    prompts: [
      'Are there any fuel efficiency anomalies detected in my fleet?',
      'Show my maintenance history and upcoming service predictions',
      'How much did I spend on fuel this month vs last month?',
    ],
  },
  {
    title: 'Financial & Compliance Audit',
    icon: Shield,
    prompts: [
      'Which insurance policy or PUC certificate is expiring next?',
      'What are my top 5 largest expenses this year?',
      'Show all pending and overdue reminders',
    ],
  },
];

export default function CopilotWorkspace() {
  const { messages, isLoading, sendMessage, clearChat, pageContext } = useCopilot();
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isLoading) return;
    sendMessage(inputText);
    setInputText('');
  };

  const handleSelectPrompt = (prompt: string) => {
    sendMessage(prompt);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-8 animate-fade-in">
      {/* Hero Welcome Banner */}
      <div className="cockpit-card bg-gradient-to-r from-cockpit-surface border border-cockpit-amber/30 p-6 sm:p-8 rounded-3xl relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cockpit-amber/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cockpit-amber/15 border border-cockpit-amber/30 text-cockpit-amber text-xs font-mono font-bold">
              <Bot className="w-4 h-4" /> AI-POWERED VEHICLE INTELLIGENCE PLATFORM
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-cockpit-text tracking-tight">
              VehicleIQ <span className="text-cockpit-amber">Copilot</span> Workspace
            </h1>
            <p className="text-xs sm:text-sm text-cockpit-muted leading-relaxed">
              Your personal AI assistant powered by Google Gemini and secure function calling. Deeply integrated across all 11 fleet management modules with zero data hallucination.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={clearChat}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cockpit-surface-2 hover:bg-cockpit-red/15 text-cockpit-muted hover:text-cockpit-red border border-cockpit-border hover:border-cockpit-red/30 text-xs font-semibold transition-all"
            >
              <Trash2 className="w-4 h-4" /> Clear Session
            </button>
          </div>
        </div>
      </div>

      {/* Main Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column — Suggested Prompt Categories */}
        <div className="space-y-4 lg:col-span-1">
          <h3 className="text-xs font-mono font-bold text-cockpit-muted uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-cockpit-amber" /> Suggested Intelligence Queries
          </h3>

          {workspaceCategories.map((cat, idx) => {
            const Icon = cat.icon;
            return (
              <CockpitCard key={idx} className="p-4 space-y-3 border-cockpit-border/60">
                <div className="flex items-center gap-2 text-xs font-bold text-cockpit-text">
                  <Icon className="w-4 h-4 text-cockpit-amber" />
                  {cat.title}
                </div>
                <div className="space-y-1.5">
                  {cat.prompts.map((p, pIdx) => (
                    <button
                      key={pIdx}
                      onClick={() => handleSelectPrompt(p)}
                      className="w-full text-left p-2.5 rounded-xl bg-cockpit-surface-2/60 hover:bg-cockpit-amber/10 text-cockpit-muted hover:text-cockpit-text border border-cockpit-border/40 hover:border-cockpit-amber/30 text-xs transition-all duration-200"
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </CockpitCard>
            );
          })}
        </div>

        {/* Right Column — Interactive Copilot Chat Window */}
        <div className="lg:col-span-2 cockpit-card bg-cockpit-bg-soft border border-cockpit-border rounded-3xl flex flex-col h-[650px] shadow-xl overflow-hidden">
          {/* Workspace Chat Header */}
          <div className="px-6 py-4 border-b border-cockpit-border bg-cockpit-surface-2/60 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-cockpit-amber/20 border border-cockpit-amber/40 flex items-center justify-center text-cockpit-amber font-bold">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-cockpit-text">Copilot Active Session</h4>
                <p className="text-[11px] font-mono text-cockpit-muted">Google Gemini + Secure Function Calling Engine</p>
              </div>
            </div>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-mono font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> ONLINE
            </span>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-3">
            {messages.map((msg, idx) => (
              <MessageBubble key={idx} message={msg} />
            ))}

            {isLoading && (
              <div className="flex items-center gap-2.5 p-3.5 rounded-2xl bg-cockpit-surface-2/60 border border-cockpit-border/40 text-cockpit-muted text-xs animate-pulse w-fit my-2">
                <Loader2 className="w-4 h-4 text-cockpit-amber animate-spin" />
                <span>Dispatching backend functions and computing insights...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input Bar */}
          <form onSubmit={handleSubmit} className="p-4 border-t border-cockpit-border bg-cockpit-surface-2/80">
            <div className="relative flex items-center">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Ask VehicleIQ Copilot anything about your vehicles..."
                disabled={isLoading}
                className="w-full pl-5 pr-14 py-3.5 rounded-2xl bg-cockpit-bg border border-cockpit-border focus:border-cockpit-amber focus:ring-1 focus:ring-cockpit-amber text-xs sm:text-sm text-cockpit-text placeholder-cockpit-muted transition-all outline-none"
              />
              <button
                type="submit"
                disabled={!inputText.trim() || isLoading}
                className="absolute right-2.5 p-2.5 rounded-xl bg-cockpit-amber hover:bg-amber-400 text-black font-bold disabled:opacity-40 transition-all shadow-md"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
