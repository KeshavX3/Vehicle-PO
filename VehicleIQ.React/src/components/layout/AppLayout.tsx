import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import CopilotFAB from '../copilot/CopilotFAB';
import CopilotPanel from '../copilot/CopilotPanel';
import { useCopilot } from '../../hooks/useCopilot';

export default function AppLayout() {
  const {
    messages,
    isLoading,
    isOpen,
    setIsOpen,
    togglePanel,
    sendMessage,
    clearChat,
    pageContext,
  } = useCopilot();

  return (
    <div className="flex h-screen overflow-hidden bg-cockpit-bg text-cockpit-text relative">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 animate-fade-in relative">
          <Outlet />
        </main>
      </div>

      {/* Floating AI Copilot Button on every page */}
      <CopilotFAB onClick={togglePanel} isOpen={isOpen} />

      {/* Floating AI Copilot Slide-in Side Panel */}
      <CopilotPanel
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        messages={messages}
        isLoading={isLoading}
        onSendMessage={sendMessage}
        onClearChat={clearChat}
        pageContext={pageContext}
      />
    </div>
  );
}
