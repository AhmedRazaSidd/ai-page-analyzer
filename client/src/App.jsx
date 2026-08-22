import Header from "./components/Header";
import ChatMessage from "./components/ChatMessage";
import ChatInput from "./components/ChatInput";
import QuickActions from "./components/QuickActions";
import Footer from "./components/Footer";
import Settings from "./components/Settings";

function App() {
  return (
    <main className="h-[600px] w-[420px] bg-[#050914] text-white overflow-hidden">
      <div className="flex h-full w-full flex-col overflow-hidden border border-white/10 bg-[#080d17] shadow-2xl shadow-black/40">
        <Header />

        {/* Only this area scrolls, header/input/footer stay fixed */}
        <div className="flex-1 overflow-y-auto">
          <ChatMessage />
        </div>

        <ChatInput />
        <QuickActions />
        <Footer />
        <Settings />
      </div>
    </main>
  );
}

export default App;