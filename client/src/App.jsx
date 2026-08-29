import { useEffect, useState } from "react";

import Header from "./components/Header";
import ChatMessage from "./components/ChatMessage";
import ChatInput from "./components/ChatInput";
import QuickActions from "./components/QuickActions";
import Footer from "./components/Footer";
import Welcome from "./components/Welcome";
import ConversationSidebar from "./components/ConversationSidebar";

import { useAssistantStore } from "./store/assistantStore";

function App() {
  const [hasSeenWelcome, setHasSeenWelcome] = useState(false);
  const [isConversationOpen, setIsConversationOpen] = useState(false);

  const {
    conversations,
    conversationId,
    loadConversations,
    loadMessages,
    clearMessages,
  } = useAssistantStore();

  useEffect(() => {
    if (hasSeenWelcome) {
      loadConversations();
    }
  }, [hasSeenWelcome, loadConversations]);

  const handleNewConversation = () => {
    clearMessages();
    setIsConversationOpen(false);
  };

  const handleSelectConversation = async (id) => {
    await loadMessages(id);
    setIsConversationOpen(false);
  };

  if (!hasSeenWelcome) {
    return (
      <Welcome
        onOpenAssistant={() => setHasSeenWelcome(true)}
      />
    );
  }

  return (
    <main className="relative h-150 w-105 overflow-hidden bg-[#050914] text-white">
      <div className="flex h-full w-full flex-col overflow-hidden border border-white/10 bg-[#080d17] shadow-2xl shadow-black/40">
        
        <Header
          onOpenConversations={() =>
            setIsConversationOpen(true)
          }
          onNewConversation={handleNewConversation}
        />

        <div className="flex-1 overflow-y-auto">
          <ChatMessage />
        </div>

        <ChatInput />

        <QuickActions />

        <Footer />

        {isConversationOpen && (
          <ConversationSidebar
            conversations={conversations}
            activeConversationId={conversationId}
            onSelect={handleSelectConversation}
            onNewConversation={handleNewConversation}
            onClose={() => setIsConversationOpen(false)}
          />
        )}
      </div>
    </main>
  );
}

export default App;