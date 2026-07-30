import { useState, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { sendCopilotMessage } from '../api/copilot.api';
import type { CopilotMessage } from '../types';

export function useCopilot() {
  const [messages, setMessages] = useState<CopilotMessage[]>([
    {
      role: 'assistant',
      content: '👋 Hi! I am **VehicleIQ Copilot**, your AI vehicle intelligence assistant. Ask me anything about your vehicles, expenses, maintenance, fuel efficiency, or upcoming renewals!',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  // Detect current page context from route
  const getPageContext = useCallback((): string => {
    const path = location.pathname;
    if (path === '/') return 'dashboard';
    if (path.startsWith('/analytics')) return 'analytics';
    if (path.startsWith('/vehicles/')) return 'vehicle-detail';
    if (path.startsWith('/vehicles')) return 'vehicles';
    if (path.startsWith('/fuel')) return 'fuel';
    if (path.startsWith('/service')) return 'service';
    if (path.startsWith('/expenses')) return 'expenses';
    if (path.startsWith('/insurance')) return 'insurance';
    if (path.startsWith('/puc')) return 'puc';
    if (path.startsWith('/reminders')) return 'reminders';
    if (path.startsWith('/documents')) return 'documents';
    return 'general';
  }, [location.pathname]);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || isLoading) return;

      const userMsg: CopilotMessage = {
        role: 'user',
        content: text.trim(),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, userMsg]);
      setIsLoading(true);

      try {
        const pageContext = getPageContext();
        const history = messages
          .filter((m) => m.role === 'user' || m.role === 'assistant')
          .slice(-10); // Keep last 10 messages for context memory

        const response = await sendCopilotMessage({
          message: text.trim(),
          pageContext,
          conversationHistory: history,
        });

        const aiMsg: CopilotMessage = {
          role: 'assistant',
          content: response.message,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };

        setMessages((prev) => [...prev, aiMsg]);
      } catch (err: unknown) {
        const errorMsg: CopilotMessage = {
          role: 'assistant',
          content: '⚠️ Failed to connect to Copilot API. Please make sure the backend is running.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, errorMsg]);
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading, messages, getPageContext]
  );

  const clearChat = useCallback(() => {
    setMessages([
      {
        role: 'assistant',
        content: 'Conversation reset. How can I assist you with your fleet today?',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  }, []);

  const togglePanel = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  return {
    messages,
    isLoading,
    isOpen,
    setIsOpen,
    togglePanel,
    sendMessage,
    clearChat,
    pageContext: getPageContext(),
  };
}
