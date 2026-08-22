import {
  Settings,
  Sparkles,
  X,
} from "lucide-react";
import { useAssistantStore } from "../store/assistantStore";

function Header() {
  const { setSettingsOpen } = useAssistantStore();

  return (
    <header className="flex h-16 items-center justify-between border-b border-white/10 px-4">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-700 shadow-lg shadow-violet-500/20">
          <Sparkles
            size={18}
            className="text-white"
          />
        </div>

        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-semibold text-white">
              AI Page Assistant
            </h1>

            <span className="rounded bg-violet-600 px-1.5 py-0.5 text-[8px] font-bold text-white">
              BETA
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={() => setSettingsOpen(true)}
          className="rounded-lg p-2 text-gray-400 transition hover:bg-white/5 hover:text-white"
          aria-label="Settings"
        >
          <Settings size={16} />
        </button>

        <button
          onClick={() => window.close()}
          className="rounded-lg p-2 text-gray-400 transition hover:bg-white/5 hover:text-white"
          aria-label="Close"
        >
          <X size={17} />
        </button>
      </div>
    </header>
  );
}

export default Header;