interface Conversation {
  id: string;
  created_at: string;
  updated_at: string;
}

interface ConversationItemProps {
  conversation: Conversation;
  isActive: boolean;
  onClick: () => void;
}

function ConversationItem({
  conversation,
  isActive,
  onClick,
}: ConversationItemProps) {
  const date = new Date(conversation.updated_at);

  return (
    <button
      onClick={onClick}
      className={`mb-1 w-full rounded-lg px-3 py-2 text-left transition ${
        isActive
          ? "bg-white/10 text-white"
          : "text-white/60 hover:bg-white/5 hover:text-white"
      }`}
    >
      <p className="truncate text-sm">Conversation</p>

      <p className="mt-1 text-[10px] text-white/30">
        {date.toLocaleDateString()}
      </p>
    </button>
  );
}

export default ConversationItem;
