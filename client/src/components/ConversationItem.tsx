import { Trash2 } from "lucide-react";

interface Conversation {
  id: string;
  created_at: string;
  updated_at: string;
}

interface ConversationItemProps {
  conversation: Conversation;
  isActive: boolean;
  handleDelete: (conversationId: string) => Promise<void>;
  onClick: () => void;
}

function ConversationItem({
  conversation,
  isActive,
  onClick,
  handleDelete,
}: ConversationItemProps) {
  const date = new Date(conversation.updated_at);

  return (
    <div
      className={`group relative mb-1 w-full rounded-lg transition ${
        isActive
          ? "bg-white/10 text-white"
          : "text-white/60 hover:bg-white/5 hover:text-white"
      }`}
    >
      <button onClick={onClick} className="w-full px-3 py-2 text-left pr-12">
        <p className="truncate text-sm">Conversation</p>

        <p className="mt-1 text-[10px] text-white/30">
          {date.toLocaleDateString()}
        </p>
      </button>

      <button
        type="button"
        aria-label="Delete conversation"
        className="absolute right-2 top-1/2 flex h-6.5 w-6.5 -translate-y-1/2 cursor-pointer items-center justify-center rounded-sm bg-white/10 text-white/60 transition-colors hover:bg-red-500 hover:text-white"
        onClick={() => handleDelete(conversation.id)}
      >
        <Trash2 size={16} />
      </button>
    </div>
  );
}

export default ConversationItem;
