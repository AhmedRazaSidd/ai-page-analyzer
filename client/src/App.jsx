import Header from "./components/Header";
import ChatMessage from "./components/ChatMessage";
import ChatInput from "./components/ChatInput";
import QuickActions from "./components/QuickActions";
import Footer from "./components/Footer";
import Settings from "./components/Settings";

function App() {
  return (
    <main className="min-h-screen bg-[#050914] p-4 text-white">
      <div className="mx-auto flex h-[680px] w-full max-w-[420px] flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#080d17] shadow-2xl shadow-black/40">
        <Header />

        <ChatMessage />

        <ChatInput />

        <QuickActions />

        <Footer />

        <Settings />
      </div>
    </main>
  );
}

export default App;