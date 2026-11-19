
import { useRef, useState } from "react";
import {
  ChevronDown,
  FileText,
  HelpCircle,
  Languages,
  List,
  Loader2,
} from "lucide-react";
import type { ChatContext, QuickActionType } from "../types";
import { useAssistantStore } from "../store/assistantStore";

interface Action {
  id: QuickActionType;
  label: string;
  icon: React.ElementType;
}

const actions: Action[] = [
  { id: "summarize", label: "Summarize Page", icon: FileText },
  { id: "question", label: "Ask a Question", icon: HelpCircle },
  { id: "key-points", label: "Key Points", icon: List },
  { id: "translate", label: "Translate Page", icon: Languages },
];

const LANGUAGES = [
  "Spanish",
  "Urdu",
  "Hindi",
  "Arabic",
  "French",
  "German",
  "Chinese",
  "Japanese",
  "Portuguese",
  "Russian",
];

interface QuickActionsProps {
  context?: ChatContext;
  onEnsureContext: () => Promise<ChatContext>;
}

function QuickActions({
  context,
  onEnsureContext,
}: QuickActionsProps) {
  const quickAction = useAssistantStore((state) => state.quickAction);
  const isLoading = useAssistantStore((state) => state.isLoading);
  const translateLanguage = useAssistantStore(
    (state) => state.translateLanguage,
  );
  const setTranslateLanguage = useAssistantStore(
    (state) => state.setTranslateLanguage,
  );

  const [preparingAction, setPreparingAction] =
    useState<QuickActionType | null>(null);
  const [showLangDropdown, setShowLangDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleAction = async (action: QuickActionType) => {
    if (isLoading || preparingAction) return;

    // For translate, show/hide dropdown — user picks language then clicks again
    // Actually: single click = use current language, long-click / chevron = change
    try {
      setPreparingAction(action);
      const actionContext = context ?? (await onEnsureContext());
      await quickAction(action, actionContext);
    } catch (error) {
      console.error("Failed to execute quick action:", error);
      const message =
        error instanceof Error
          ? error.message
          : "Failed to execute quick action.";
      useAssistantStore.getState().setError(message);
    } finally {
      setPreparingAction(null);
    }
  };

  const handleLangSelect = (lang: string) => {
    setTranslateLanguage(lang);
    setShowLangDropdown(false);
  };

  return (
    <div className="px-4 pb-3">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
        Quick Actions
      </p>

      <div className="grid grid-cols-4 gap-2">
        {actions.map((action) => {
          const Icon = action.icon;
          const isPreparing = preparingAction === action.id;
          const isTranslate = action.id === "translate";

          if (isTranslate) {
            return (
              <div key={action.id} className="relative">
                {/* Language dropdown */}
                {showLangDropdown && (
                  <div
                    ref={dropdownRef}
                    className="absolute bottom-full left-1/2 z-50 mb-2 w-36 -translate-x-1/2 overflow-hidden rounded-xl border border-white/10 bg-[#131926] shadow-xl"
                  >
                    <p className="border-b border-white/[0.07] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                      Translate to
                    </p>
                    {LANGUAGES.map((lang) => (
                      <button
                        key={lang}
                        type="button"
                        onClick={() => handleLangSelect(lang)}
                        className={`w-full px-3 py-1.5 text-left text-xs transition hover:bg-violet-500/15 hover:text-violet-200 ${
                          lang === translateLanguage
                            ? "bg-violet-500/10 font-semibold text-violet-300"
                            : "text-slate-300"
                        }`}
                      >
                        {lang}
                      </button>
                    ))}
                  </div>
                )}

                {/* Translate button */}
                <button
                  type="button"
                  onClick={() => void handleAction("translate")}
                  disabled={isLoading || preparingAction !== null}
                  className="group relative flex min-h-[72px] w-full flex-col items-center justify-center gap-1.5 rounded-xl border border-white/5 bg-[#101521] px-2 py-2 text-center transition hover:border-violet-500/30 hover:bg-violet-500/5 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isPreparing ? (
                    <Loader2 size={18} className="animate-spin text-violet-400" />
                  ) : (
                    <Languages
                      size={18}
                      className="text-violet-400 transition group-hover:text-violet-300"
                    />
                  )}

                  <span className="text-center text-xs font-medium leading-tight text-slate-300 group-hover:text-white">
                    {isPreparing ? "Preparing..." : action.label}
                  </span>

                  {/* Language badge */}
                  <span className="mt-0.5 rounded-md bg-violet-500/20 px-1.5 py-0.5 text-[10px] font-semibold text-violet-300">
                    {translateLanguage}
                  </span>

                  {/* Chevron to open dropdown */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowLangDropdown((prev) => !prev);
                    }}
                    className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-md text-slate-400 transition hover:bg-white/10 hover:text-white"
                    aria-label="Choose language"
                    tabIndex={-1}
                  >
                    <ChevronDown size={12} />
                  </button>
                </button>

                {/* Click-outside overlay */}
                {showLangDropdown && (
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowLangDropdown(false)}
                  />
                )}
              </div>
            );
          }

          return (
            <button
              key={action.id}
              type="button"
              onClick={() => void handleAction(action.id)}
              disabled={isLoading || preparingAction !== null}
              className="group flex min-h-[72px] flex-col items-center justify-center gap-1.5 rounded-xl border border-white/5 bg-[#101521] px-2 py-2 text-center transition hover:border-violet-500/30 hover:bg-violet-500/5 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isPreparing ? (
                <Loader2 size={18} className="animate-spin text-violet-400" />
              ) : (
                <Icon
                  size={18}
                  className="text-violet-400 transition group-hover:text-violet-300"
                />
              )}

              <span className="text-center text-xs font-medium leading-tight text-slate-300 group-hover:text-white">
                {isPreparing ? "Preparing..." : action.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default QuickActions;
