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
    <footer className="flex items-center justify-between border-t border-white/5 px-4 py-3">
      <div className="flex items-center gap-2">
        <Globe2
          size={12}
          className="text-gray-500"
        />

        <span className="text-[9px] text-gray-500">
          {isContextActive
            ? "Current page context is active"
            : "Page context is inactive"}
        </span>
      </div>

      <div className="flex items-center gap-1">
        <CheckCircle2
          size={11}
          className={
            isContextActive
              ? "text-emerald-400"
              : "text-gray-600"
          }
        />

        <button className="text-[9px] text-violet-400 hover:text-violet-300">
          Learn more
        </button>
      </div>
    </footer>
  );
}

export default Footer;