import { useState } from "react";
import Header from "./components/Header";
import ChatMessage from "./components/ChatMessage";
import ChatInput from "./components/ChatInput";
import QuickActions from "./components/QuickActions";
import Footer from "./components/Footer";
import Welcome from "./components/Welcome";

function App() {
  const [hasSeenWelcome, setHasSeenWelcome] = useState(false);

  if (!hasSeenWelcome) {
    return <Welcome onOpenAssistant={() => setHasSeenWelcome(true)} />;
  }

  return (
    <main className="h-150 w-105 bg-[#050914] text-white overflow-hidden">
      <div className="flex h-full w-full flex-col overflow-hidden border border-white/10 bg-[#080d17] shadow-2xl shadow-black/40">
        <Header />

        <div className="flex-1 overflow-y-auto">
          <ChatMessage />
        </div>

        <ChatInput />
        <QuickActions />
        <Footer />
      </div>
    </main>
  );
}

export default App;