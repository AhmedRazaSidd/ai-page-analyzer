import { Sparkles } from "lucide-react";
import { useAssistantStore } from "../store/assistantStore";

function ChatMessage() {
  const messages = useAssistantStore(
    (state) => state.messages
  );

  const isLoading = useAssistantStore(
    (state) => state.isLoading
  );

  return (
    <div className="flex-1 overflow-y-auto px-4 py-5">
      {messages.length === 0 ? (
        <div className="flex min-h-65 flex-col items-center justify-center text-center">
          <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-violet-500/10">
            <Sparkles
              size={32}
              className="text-violet-400"
            />
          </div>

          <h2 className="text-sm font-medium text-white">
            Ask anything about this page...
          </h2>

          <p className="mt-2 max-w-65 text-xs leading-5 text-gray-500">
            I can help you understand, summarize,
            translate, and explore the current page.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {messages.map((message) => {
            const isUser = message.role === "user";

            return (
              <div
                key={message.id}
                className={`flex ${
                  isUser
                    ? "justify-end"
                    : "justify-start"
                }`}
              >
                {!isUser && (
                  <div className="mr-2 mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-violet-600">
                    <Sparkles
                      size={14}
                      className="text-white"
                    />
                  </div>
                )}

                <div
                  className={`max-w-[82%] rounded-2xl px-3 py-2.5 text-xs leading-5 ${
                    isUser
                      ? "rounded-br-sm bg-violet-700 text-white"
                      : "rounded-bl-sm border border-white/5 bg-[#151a27] text-gray-300"
                  }`}
                >
                  <div className="whitespace-pre-line">
                    {message.content}
                  </div>

                  <div
                    className={`mt-1 text-[9px] ${
                      isUser
                        ? "text-violet-200"
                        : "text-gray-600"
                    }`}
                  >
                    {message.timestamp}
                  </div>
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-600">
                <Sparkles
                  size={14}
                  className="text-white"
                />
              </div>

              <div className="rounded-xl bg-[#151a27] px-4 py-3">
                <div className="flex gap-1">
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-violet-400" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-violet-400 [animation-delay:150ms]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-violet-400 [animation-delay:300ms]" />
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default ChatMessage;