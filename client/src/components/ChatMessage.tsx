import { Sparkles } from "lucide-react";
import { useAssistantStore } from "../store/assistantStore";
import moment from "moment";
import { useEffect, useRef } from "react";

function ChatMessage() {
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const messages = useAssistantStore((state) => state.messages);
  const isLoading = useAssistantStore((state) => state.isLoading);
  const streamStatus = useAssistantStore((state) => state.streamStatus);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [messages, isLoading]);

  return (
    <div className="flex-1 overflow-y-auto px-4 py-5">
      {messages.length === 0 ? (
        <div className="flex min-h-65 flex-col items-center justify-center text-center">
          <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-violet-500/10">
            <Sparkles size={32} className="text-violet-400" />
          </div>

          <h2 className="text-sm font-medium text-white">
            Ask anything about this page...
          </h2>

          <p className="mt-2 max-w-65 text-xs leading-5 text-gray-500">
            I can help you understand, summarize, translate, and explore the
            current page.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {messages.map((message) => {
            const isUser = message.role === "user";

            return (
              <div
                key={message.id}
                className={`flex items-start gap-2 ${
                  isUser ? "justify-end" : "justify-start"
                }`}
              >
                {!isUser && (
                  <div className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-violet-600">
                    <Sparkles size={14} className="text-white" />
                  </div>
                )}

                <div
                  className={`min-w-0 max-w-[82%] rounded-2xl px-3 py-2.5 text-xs leading-5 ${
                    isUser
                      ? "rounded-br-sm bg-violet-700 text-white"
                      : "rounded-bl-sm border border-white/5 bg-[#151a27] text-gray-300"
                  }`}
                >
                  <div className="whitespace-pre-wrap wrap-break-word">
                    {message.content ? (
                      message.content
                    ) : !isUser && streamStatus !== "idle" ? (
                      <div className="flex items-center gap-2 py-1">
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-violet-400/20 border-t-violet-400" />
                      </div>
                    ) : null}
                  </div>

                  {message.created_at && (
                    <time
                      dateTime={message.created_at}
                      className={`mt-1 block text-right text-[9px] ${
                        isUser ? "text-violet-200" : "text-gray-500"
                      }`}
                    >
                      {moment(message.created_at).format("h:mm A")}
                    </time>
                  )}
                </div>
              </div>
            );
          })}

          <AssistantTypingIndicator status={streamStatus} />

          <div ref={messagesEndRef} aria-hidden="true" />
        </div>
      )}
    </div>
  );
}

export default ChatMessage;

type AssistantTypingIndicatorProps = {
  status: "idle" | "thinking" | "generating";
};

function AssistantTypingIndicator({ status }: AssistantTypingIndicatorProps) {
  if (status === "idle") return null;

  const label =
    status === "thinking" ? "Thinking..." : "Generating response...";

  return (
    <div
      className="flex items-start gap-2 py-1"
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      <div className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-violet-600">
        <Sparkles size={14} className="text-white" />
      </div>

      <div className="flex min-h-8 flex-col justify-center gap-2 py-1">
        <p className="text-xs font-medium text-slate-400">{label}</p>

        <div className="flex items-center gap-1.5" aria-hidden="true">
          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-violet-400 [animation-delay:-0.3s]" />
          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-violet-400 [animation-delay:-0.15s]" />
          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-violet-400" />
        </div>
      </div>
    </div>
  );
}
