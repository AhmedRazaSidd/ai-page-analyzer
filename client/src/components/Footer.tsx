import {
  CheckCircle2,
  Globe2,
} from "lucide-react";

import { useAssistantStore } from "../store/assistantStore";

function Footer() {
  const isContextActive = useAssistantStore(
    (state) => state.isContextActive
  );

  return (
    <footer className="flex items-center justify-between border-t border-white/5 px-4 py-2.5">
      <div className="flex items-center gap-2">
        <Globe2
          size={14}
          className="text-slate-400"
        />

        <span className="text-xs text-slate-400">
          {isContextActive
            ? "Current page context is active"
            : "Page context is inactive"}
        </span>
      </div>

      <div className="flex items-center gap-1.5">
        <CheckCircle2
          size={13}
          className={
            isContextActive
              ? "text-emerald-400"
              : "text-slate-500"
          }
        />

        <button className="text-xs font-medium text-violet-400 transition hover:text-violet-300">
          Learn more
        </button>
      </div>
    </footer>
  );
}

export default Footer;