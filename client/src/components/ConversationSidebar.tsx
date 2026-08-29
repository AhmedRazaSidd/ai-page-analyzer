import ConversationItem from "./ConversationItem";
import NewConversationButton from "./NewConversationButton";

type Conversation = {
  id: string;
  created_at: string;
  updated_at: string;
};

interface ConversationSidebarProps {
  conversations: Conversation[];
  activeConversationId: string | null;
  onSelect: (conversationId: string) => void;
  onNewConversation: () => void;
  onClose: () => void;
}

function ConversationSidebar({
  conversations,
  activeConversationId,
  onSelect,
  onNewConversation,
  onClose,
}: ConversationSidebarProps) {
  return (
    <aside className="absolute inset-0 z-50 flex flex-col bg-[#080d17]">
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
        <h2 className="text-sm font-semibold">Conversations</h2>

        <button
          onClick={onClose}
          className="text-white/50 transition hover:text-white"
        >
          ✕
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
            />
          ))
        )}
      </div>
    </aside>
  );
}

export default ConversationSidebar;
