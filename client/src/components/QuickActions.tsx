
import { useState } from "react";
import {
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
  { id: "summarize", label: "Summarize\nPage", icon: FileText },
  { id: "question", label: "Ask a\nQuestion", icon: HelpCircle },
  { id: "key-points", label: "Key\nPoints", icon: List },
  { id: "translate", label: "Translate\nPage", icon: Languages },
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

  const [preparingAction, setPreparingAction] =
    useState<QuickActionType | null>(null);

  const handleAction = async (action: QuickActionType) => {
    if (isLoading || preparingAction) return;

    try {
      setPreparingAction(action);

      const actionContext = context ?? (await onEnsureContext());

      await quickAction(action, actionContext);
    } catch (error) {
      console.error("Failed to execute quick action:", error);
    } finally {
      setPreparingAction(null);
    }
  };

  return (
    <div className="px-4 pb-3">
      <p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-gray-500">
        Quick Actions
      </p>

      <div className="grid grid-cols-4 gap-2">
        {actions.map((action) => {
          const Icon = action.icon;
          const isPreparing = preparingAction === action.id;

          return (
            <button
              key={action.id}
              type="button"
              onClick={() => void handleAction(action.id)}
              disabled={isLoading || preparingAction !== null}
              className="group flex min-h-[62px] flex-col items-center justify-center gap-1 rounded-xl border border-white/5 bg-[#101521] px-1 text-center transition hover:border-violet-500/30 hover:bg-violet-500/5 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isPreparing ? (
                <Loader2
                  size={16}
                  className="animate-spin text-violet-400"
                />
              ) : (
                <Icon
                  size={16}
                  className="text-violet-400 transition group-hover:text-violet-300"
                />
              )}

              <span className="whitespace-pre-line text-[9px] leading-3 text-gray-400 group-hover:text-gray-200">
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
