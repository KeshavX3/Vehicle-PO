import React, { useState } from 'react';
import { Bot, User, Copy, Check } from 'lucide-react';
import type { CopilotMessage } from '../../types';

interface MessageBubbleProps {
  message: CopilotMessage;
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === 'user';

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Simple Markdown formatter for bold, code, bullets, and line breaks
  const formatMarkdown = (content: string) => {
    const lines = content.split('\n');
    return lines.map((line, idx) => {
      // Bullet items
      if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
        const bulletText = line.trim().substring(2);
        return (
          <li key={idx} className="ml-4 list-disc my-0.5">
            {parseInlineMarkdown(bulletText)}
          </li>
        );
      }
      // Headings
      if (line.startsWith('### ')) {
        return (
          <h4 key={idx} className="text-sm font-bold text-cockpit-amber mt-3 mb-1">
            {parseInlineMarkdown(line.substring(4))}
          </h4>
        );
      }
      if (line.startsWith('## ')) {
        return (
          <h3 key={idx} className="text-base font-bold text-cockpit-text mt-3 mb-1">
            {parseInlineMarkdown(line.substring(3))}
          </h3>
        );
      }
      // Empty line
      if (!line.trim()) {
        return <div key={idx} className="h-2" />;
      }
      // Regular paragraph
      return (
        <p key={idx} className="my-1 leading-relaxed">
          {parseInlineMarkdown(line)}
        </p>
      );
    });
  };

  const parseInlineMarkdown = (text: string) => {
    // Replace **bold** with <strong>
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="font-semibold text-cockpit-amber">{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  return (
    <div className={`flex gap-3 my-3 ${isUser ? 'flex-row-reverse' : 'flex-row'} group`}>
      {/* Avatar */}
      <div
        className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold flex-shrink-0 shadow-md ${
          isUser
            ? 'bg-cockpit-amber/20 text-cockpit-amber border border-cockpit-amber/40'
            : 'bg-cockpit-cyan/20 text-cockpit-cyan border border-cockpit-cyan/40'
        }`}
      >
        {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
      </div>

      {/* Bubble Content */}
      <div className={`max-w-[85%] sm:max-w-[78%] flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
        <div
          className={`p-3.5 rounded-2xl text-xs sm:text-sm relative shadow-lg ${
            isUser
              ? 'bg-cockpit-amber/15 text-cockpit-text border border-cockpit-amber/30 rounded-tr-none'
              : 'bg-cockpit-surface-2 text-cockpit-text border border-cockpit-border/60 rounded-tl-none'
          }`}
        >
          {formatMarkdown(message.content)}

          {/* Copy Button (for AI messages) */}
          {!isUser && (
            <button
              onClick={handleCopy}
              className="absolute top-2 right-2 p-1 text-cockpit-muted hover:text-cockpit-text rounded transition-colors opacity-0 group-hover:opacity-100"
              title="Copy response"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          )}
        </div>

        {/* Timestamp */}
        {message.timestamp && (
          <span className="text-[10px] font-mono text-cockpit-muted mt-1 px-1">
            {message.timestamp}
          </span>
        )}
      </div>
    </div>
  );
}
