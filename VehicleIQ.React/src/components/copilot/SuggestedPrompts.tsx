import React from 'react';
import { Sparkles } from 'lucide-react';

interface SuggestedPromptsProps {
  pageContext: string;
  onSelectPrompt: (prompt: string) => void;
}

const promptMap: Record<string, string[]> = {
  dashboard: [
    'Summarize my dashboard cockpit',
    'Are there any critical alerts?',
    'Which renewals are due soon?',
    'Show overall vehicle health scores',
  ],
  vehicles: [
    'Compare my vehicles side-by-side',
    'Which vehicle costs the most?',
    'Show vehicle health scores',
    'What is the total fleet mileage?',
  ],
  fuel: [
    'Summarize my fuel spending',
    'Which vehicle has the best mileage?',
    'Show fuel efficiency anomalies',
    'What is my monthly fuel trend?',
  ],
  service: [
    'Show maintenance history overview',
    'Which services are overdue?',
    'What are my total maintenance costs?',
    'When is the next service predicted?',
  ],
  expenses: [
    'What are my highest expense categories?',
    'Show monthly expense report',
    'Which vehicle spent the most this month?',
    'Show top 5 largest transactions',
  ],
  insurance: [
    'Which insurance policy expires next?',
    'Show all active insurance policies',
    'How much do I spend on premiums?',
    'Are any policies expired?',
  ],
  puc: [
    'Which PUC certificate expires next?',
    'Show valid vs expired PUC certificates',
    'Are all my vehicles compliant?',
  ],
  reminders: [
    'Show pending & overdue reminders',
    'What task is due first?',
    'Summarize my reminder schedule',
  ],
  documents: [
    'Show document coverage per vehicle',
    'Are any essential documents missing?',
    'What are my recent document uploads?',
  ],
  analytics: [
    'Explain my cost-per-km trends',
    'Show fuel efficiency anomalies',
    'What is my forecasted spend next 30 days?',
    'Give me fleet optimization recommendations',
  ],
  general: [
    'Which vehicle costs me the most?',
    'How much did I spend on fuel this year?',
    'Compare my vehicles',
    'Give me a complete fleet health report',
  ],
};

export default function SuggestedPrompts({ pageContext, onSelectPrompt }: SuggestedPromptsProps) {
  const prompts = promptMap[pageContext] || promptMap.general;

  return (
    <div className="space-y-2 my-3">
      <div className="flex items-center gap-1.5 text-[11px] font-mono text-cockpit-muted uppercase tracking-wider">
        <Sparkles className="w-3 h-3 text-cockpit-amber" />
        Suggested Prompts ({pageContext})
      </div>
      <div className="flex flex-wrap gap-1.5">
        {prompts.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => onSelectPrompt(prompt)}
            className="px-3 py-1.5 rounded-xl bg-cockpit-surface-2 hover:bg-cockpit-amber/15 text-cockpit-text hover:text-cockpit-amber border border-cockpit-border hover:border-cockpit-amber/30 text-xs transition-all duration-200 text-left font-medium"
          >
            {prompt}
          </button>
        ))}
      </div>
    </div>
  );
}
