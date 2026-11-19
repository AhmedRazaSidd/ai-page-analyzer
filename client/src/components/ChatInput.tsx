import { useState } from "react";
import { ArrowUp, Loader2, Square } from "lucide-react";
import { useAssistantStore } from "../store/assistantStore";
import type { ChatContext } from "../types";

interface ChatInputProps {
  context?: ChatContext;
  onEnsureContext: () => Promise<ChatContext>;
}

function ChatInput({ context, onEnsureContext }: ChatInputProps) {
  const { input, setInput, sendMessage, isLoading, stopGeneration } =
    useAssistantStore();
  const [isPreparingContext, setIsPreparingContext] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!input.trim() || isLoading || isPreparingContext) return;

    setIsPreparingContext(true);

    try {
      const messageContext = context ?? (await onEnsureContext());
      await sendMessage(undefined, messageContext);
    } catch (error) {
      console.error("Failed to prepare page context:", error);
    } finally {
      setIsPreparingContext(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="px-4 pb-3">
      <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-[#101521] p-1.5 transition focus-within:border-violet-500/50">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              e.currentTarget.form?.requestSubmit();
            }
          }}
          disabled={isLoading}
          placeholder={
            isLoading ? "Assistant is responding..." : "Ask anything about this page..."
          }
          className="min-w-0 flex-1 bg-transparent px-2 text-sm text-white outline-none placeholder:text-slate-500 disabled:opacity-50"
        />

        {isLoading ? (
          <button
            type="button"
            onClick={stopGeneration}
            className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-red-500/30 bg-red-500/15 text-red-400 transition hover:bg-red-500/25 hover:text-red-300"
            title="Stop generating"
            aria-label="Stop generating"
          >
            <Square size={13} className="fill-current" />
          </button>
        ) : (
          <button
            type="submit"
            disabled={!input.trim() || isPreparingContext}
            className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg bg-violet-600 text-white transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {isPreparingContext ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              <ArrowUp size={15} />
            )}
          </button>
        )}
      </div>
    </form>
  );
}

export default ChatInput;
