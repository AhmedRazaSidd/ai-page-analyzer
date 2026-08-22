import {
  FileText,
  HelpCircle,
  Languages,
  List,
} from "lucide-react";
import {
  QuickActionType,
  useAssistantStore,
} from "../store/assistantStore";

interface Action {
  id: QuickActionType;
  label: string;
  icon: React.ElementType;
}

const actions: Action[] = [
  {
    id: "summarize",
    label: "Summarize\nPage",
    icon: FileText,
  },
  {
    id: "question",
    label: "Ask a\nQuestion",
    icon: HelpCircle,
  },
  {
    id: "key-points",
    label: "Key\nPoints",
    icon: List,
  },
  {
    id: "translate",
    label: "Translate\nPage",
    icon: Languages,
  },
];

function QuickActions() {
  const quickAction = useAssistantStore(
    (state) => state.quickAction
  );

  return (
    <div className="px-4 pb-3">
      <p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-gray-500">
        Quick Actions
      </p>

      <div className="grid grid-cols-4 gap-2">
        {actions.map((action) => {
          const Icon = action.icon;

          return (
            <button
              key={action.id}
              onClick={() =>
                quickAction(action.id)
              }
              className="group flex min-h-[62px] flex-col items-center justify-center gap-1 rounded-xl border border-white/5 bg-[#101521] px-1 text-center transition hover:border-violet-500/30 hover:bg-violet-500/5"
            >
              <Icon
                size={16}
                className="text-violet-400 transition group-hover:text-violet-300"
              />

              <span className="whitespace-pre-line text-[9px] leading-3 text-gray-400 group-hover:text-gray-200">
                {action.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default QuickActions;