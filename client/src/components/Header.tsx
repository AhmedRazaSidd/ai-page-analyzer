import { History, Sparkles, X, Plus } from "lucide-react";

interface HeaderProps {
  onOpenConversations: () => void;
  onNewConversation: () => void;
}

function Header({ onOpenConversations, onNewConversation }: HeaderProps) {

  return (
    <header className="flex h-16 items-center justify-between border-b border-white/10 px-4">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl overflow-hidden shadow-lg shadow-violet-500/25 border border-white/10">
          <img src="favicon.svg" alt="Breify AI" className="h-full w-full object-cover" />
        </div>

        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-bold tracking-tight text-white">
              Breify <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">AI</span>
            </h1>

            <span className="rounded border border-violet-500/30 bg-violet-500/15 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider text-violet-300">
              PRO
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1">
        {/* Conversations */}
        <button
          onClick={onOpenConversations}
          className="cursor-pointer rounded-lg p-2 text-gray-400 transition hover:bg-white/5 hover:text-white focus:outline-0"
          aria-label="Conversations"
          title="Conversations"
        >
          <History size={17} />
        </button>

        {/* New conversation */}
        <button
          onClick={onNewConversation}
          className="cursor-pointer rounded-lg p-2 text-gray-400 transition hover:bg-white/5 hover:text-white focus:outline-0"
          aria-label="New conversation"
          title="New conversation"
        >
          <Plus size={17} />
        </button>

        {/* Close */}
        <button
          onClick={() => window.close()}
          className="cursor-pointer rounded-lg p-2 text-gray-400 transition hover:bg-white/5 hover:text-white focus:outline-0"
          aria-label="Close"
          title="Close"
        >
          <X size={17} />
        </button>
      </div>
    </header>
  );
}

export default Header;
