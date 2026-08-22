import {
  ArrowUp,
  Loader2,
} from "lucide-react";
import { useAssistantStore } from "../store/assistantStore";

function ChatInput() {
  const {
    input,
    setInput,
    sendMessage,
    isLoading,
  } = useAssistantStore();

  const handleSubmit = (
    e: React.FormEvent
  ) => {
    e.preventDefault();
    sendMessage();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="px-4 pb-3"
    >
      <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-[#101521] p-1.5 transition focus-within:border-violet-500/50">
        <input
          value={input}
          onChange={(e) =>
            setInput(e.target.value)
          }
          onKeyDown={(e) => {
            if (
              e.key === "Enter" &&
              !e.shiftKey
            ) {
              e.preventDefault();
              sendMessage();
            }
          }}
          placeholder="Ask anything about this page..."
          className="min-w-0 flex-1 bg-transparent px-2 text-xs text-white outline-none placeholder:text-gray-600"
        />

        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-violet-600 text-white transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {isLoading ? (
            <Loader2
              size={15}
              className="animate-spin"
            />
          ) : (
            <ArrowUp size={15} />
          )}
        </button>
      </div>
    </form>
  );
}

export default ChatInput;