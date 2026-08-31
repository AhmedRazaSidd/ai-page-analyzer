import { Check, Pencil, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Conversation } from "../types";
interface ConversationItemProps {
  conversation: Conversation;
  isActive: boolean;
  handleDelete: (conversationId: string) => Promise<void>;
  handleUpdateTitle: (conversationId: string, title: string) => Promise<void>;
  onClick: () => void;
}
function ConversationItem({
  conversation,
  isActive,
  onClick,
  handleDelete,
  handleUpdateTitle,
}: ConversationItemProps) {
  const date = new Date(conversation.updated_at);
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(conversation.title);
  useEffect(() => {
    setTitle(conversation.title);
  }, [conversation.title]);
  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setTitle(conversation.title);
    setIsEditing(true);
  };
  const handleCancel = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setTitle(conversation.title);
    setIsEditing(false);
  };
  const handleSave = async (e?: React.MouseEvent) => {
    e?.stopPropagation();
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setTitle(conversation.title);
      setIsEditing(false);
      return;
    }
    if (trimmedTitle === conversation.title) {
      setIsEditing(false);
      return;
    }
    await handleUpdateTitle(conversation.id, trimmedTitle);
    setIsEditing(false);
  };
  const handleKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    e.stopPropagation();
    if (e.key === "Enter") {
      await handleSave();
    }
    if (e.key === "Escape") {
      handleCancel();
    }
  };
  return (
    <div
      className={`group relative mb-1 w-full rounded-lg transition ${isActive ? "bg-white/10 text-white" : "text-white/60 hover:bg-white/5 hover:text-white"}`}
    >
      {" "}
      {isEditing ? (
        <div className="flex items-center gap-1 px-2 py-2">
          {" "}
          <input
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            maxLength={255}
            className="min-w-0 flex-1 rounded-md border border-white/10 bg-white/5 px-2 py-1 text-sm text-white outline-none focus:border-white/30"
          />{" "}
          <button
            type="button"
            aria-label="Save title"
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-sm text-white/60 transition hover:bg-green-500 hover:text-white"
            onClick={handleSave}
          >
            {" "}
            <Check size={15} />{" "}
          </button>{" "}
          <button
            type="button"
            aria-label="Cancel editing"
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-sm text-white/60 transition hover:bg-white/10 hover:text-white"
            onClick={handleCancel}
          >
            {" "}
            <X size={15} />{" "}
          </button>{" "}
        </div>
      ) : (
        <>
          {" "}
          <button
            type="button"
            onClick={onClick}
            className="w-full px-3 py-2 pr-20 text-left"
          >
            {" "}
            <p className="truncate text-sm"> {conversation.title} </p>{" "}
            <p className="mt-1 text-[10px] text-white/30">
              {" "}
              {date.toLocaleDateString()}{" "}
            </p>{" "}
          </button>{" "}
          <div className="absolute right-2 top-1/2 flex -translate-y-1/2 gap-1">
            {" "}
            <button
              type="button"
              aria-label="Edit conversation title"
              className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-sm bg-white/10 text-white/60 transition-colors hover:bg-white/20 hover:text-white"
              onClick={handleEdit}
            >
              {" "}
              <Pencil size={15} />{" "}
            </button>{" "}
            <button
              type="button"
              aria-label="Delete conversation"
              className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-sm bg-white/10 text-white/60 transition-colors hover:bg-red-500 hover:text-white"
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(conversation.id);
              }}
            >
              {" "}
              <Trash2 size={15} />{" "}
            </button>{" "}
          </div>{" "}
        </>
      )}{" "}
    </div>
  );
}
export default ConversationItem;
