import { Sparkles } from "lucide-react";
import { useAssistantStore } from "../store/assistantStore";
import moment from "moment";
import { useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";

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
    <div className="px-4 py-4">
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
                  <div>
                    {message.content ? (
                      isUser ? (
                        <div className="whitespace-pre-wrap break-words">
                          {message.content}
                        </div>
                      ) : (
                        <div className="break-words text-xs leading-5">
                          <ReactMarkdown
                            components={{
                              p: ({ children }) => (
                                <p className="mb-2 last:mb-0 leading-relaxed text-gray-200">
                                  {children}
                                </p>
                              ),
                              strong: ({ children }) => (
                                <strong className="font-semibold text-white">
                                  {children}
                                </strong>
                              ),
                              ul: ({ children }) => (
                                <ul className="my-1.5 ml-4 list-disc space-y-1 text-gray-200">
                                  {children}
                                </ul>
                              ),
                              ol: ({ children }) => (
                                <ol className="my-1.5 ml-4 list-decimal space-y-1 text-gray-200">
                                  {children}
                                </ol>
                              ),
                              li: ({ children }) => (
                                <li className="text-gray-300 leading-normal">
                                  {children}
                                </li>
                              ),
                              h1: ({ children }) => (
                                <h1 className="mt-2.5 mb-1 text-sm font-bold text-white">
                                  {children}
                                </h1>
                              ),
                              h2: ({ children }) => (
                                <h2 className="mt-2 mb-1 text-xs font-bold text-white">
                                  {children}
                                </h2>
                              ),
                              h3: ({ children }) => (
                                <h3 className="mt-1.5 mb-0.5 text-xs font-semibold text-violet-300">
                                  {children}
                                </h3>
                              ),
                              code: ({ children }) => (
                                <code className="rounded bg-black/40 px-1 py-0.5 font-mono text-[11px] text-violet-300">
                                  {children}
                                </code>
                              ),
                              blockquote: ({ children }) => (
                                <blockquote className="my-1 border-l-2 border-violet-500 pl-2 italic text-gray-400">
                                  {children}
                                </blockquote>
                              ),
                              a: ({ href, children }) => (
                                <a
                                  href={href}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-violet-400 underline hover:text-violet-300"
                                >
                                  {children}
                                </a>
                              ),
                            }}
                          >
                            {message.content}
                          </ReactMarkdown>
                        </div>
                      )
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
