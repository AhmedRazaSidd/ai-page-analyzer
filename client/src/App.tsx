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
    conversation_id,
    initializeAnonymousSession,
    loadConversations,
    loadMessages,
    clearMessages,
    deleteConversation,
    updateConversationTitle,
  } = useAssistantStore();

  useEffect(() => {
    if (!hasSeenWelcome) return;

    initializeAnonymousSession();
  }, [hasSeenWelcome, initializeAnonymousSession]);

  useEffect(() => {
    if (hasSeenWelcome) {
      loadConversations();
    }
  }, [hasSeenWelcome, loadConversations]);

  const handleNewConversation = () => {
    clearMessages();
    setIsConversationOpen(false);
  };

  const handleSelectConversation = async (id: string) => {
    await loadMessages(id);
    setIsConversationOpen(false);
  };

  const handleDelete = async (conversationId: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this conversation?",
    );

    if (!confirmed) return;

    await deleteConversation(conversationId);
    setIsConversationOpen(false);
  };

  const handleUpdateTitle = async (conversationId: string, title: string) => {
    await updateConversationTitle(conversationId, title);
  };

  if (!hasSeenWelcome) {
    return <Welcome onOpenAssistant={() => setHasSeenWelcome(true)} />;
  }

  return (
    <main className="relative h-150 w-105 overflow-hidden bg-[#050914] text-white">
      <div className="flex h-full w-full flex-col overflow-hidden border border-white/10 bg-[#080d17] shadow-2xl shadow-black/40">
        <Header
          onOpenConversations={() => setIsConversationOpen(true)}
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
            activeConversationId={conversation_id}
            onSelect={handleSelectConversation}
            handleDelete={handleDelete}
            onNewConversation={handleNewConversation}
            onClose={() => setIsConversationOpen(false)}
            handleUpdateTitle={handleUpdateTitle}
          />
        )}
      </div>
    </main>
  );
}

export default App;
