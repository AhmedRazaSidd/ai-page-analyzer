import { useEffect } from "react";
import { ArrowLeft, X } from "lucide-react";
import type { Conversation } from "../types";
import ConversationItem from "./ConversationItem";
import NewConversationButton from "./NewConversationButton";

interface ConversationSidebarProps {
  conversations: Conversation[];
  activeConversationId: string | null;
  onSelect: (conversationId: string) => Promise<void>;
  handleDelete: (conversationId: string) => Promise<void>;
  handleUpdateTitle: (conversationId: string, title: string) => Promise<void>;
  onNewConversation: () => void;
  onClose: () => void;
}

function ConversationSidebar({
  conversations,
  activeConversationId,
  onSelect,
  onNewConversation,
  onClose,
  handleDelete,
  handleUpdateTitle,
}: ConversationSidebarProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <aside className="absolute inset-0 z-50 flex h-full w-full flex-col bg-[#080d17]">
      <div className="flex items-center justify-between border-b border-white/10 px-3 py-3">
        <button
          type="button"
          onClick={onClose}
          className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs font-medium text-slate-200 transition hover:bg-white/10 hover:text-white"
          title="Back to Chat (Esc)"
        >
          <ArrowLeft size={14} className="text-violet-400" />
          <span>Back to Chat</span>
        </button>

        <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          History
        </h2>

        <button
          type="button"
          onClick={onClose}
          className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 transition hover:bg-white/10 hover:text-white"
          aria-label="Close"
          title="Close"
        >
          <X size={15} />
        </button>
      </div>

      <div className="p-3">
        <NewConversationButton onClick={onNewConversation} />
      </div>

      <div className="flex-1 overflow-y-auto px-2">
        {conversations.length === 0 ? (
          <p className="px-2 py-4 text-center text-xs text-white/40">
            No conversations yet.
          </p>
        ) : (
          conversations.map((conversation) => (
            <ConversationItem
              key={conversation.id}
              conversation={conversation}
              isActive={conversation.id === activeConversationId}
              onClick={() => onSelect(conversation.id)}
              handleDelete={handleDelete}
              handleUpdateTitle={handleUpdateTitle}
            />
          ))
        )}
      </div>
    </aside>
  );
}

export default ConversationSidebar;
