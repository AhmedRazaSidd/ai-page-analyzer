import { useEffect, useState } from "react";

import Header from "./components/Header";
import ChatMessage from "./components/ChatMessage";
import ChatInput from "./components/ChatInput";
import QuickActions from "./components/QuickActions";
import Footer from "./components/Footer";
import Welcome from "./components/Welcome";
import ConversationSidebar from "./components/ConversationSidebar";
import { useAssistantStore } from "./store/assistantStore";
import { extractPageContent } from "./lib/page-content";
import type { PageContent } from "./lib/page-content";
import type { ChatContext } from "./types";

function App() {
  const [hasSeenWelcome, setHasSeenWelcome] = useState(() => {
    try {
      return localStorage.getItem("ai-page-assistant:welcome-seen") === "true";
    } catch (error) {
      return false;
    }
  });

  const [isConversationOpen, setIsConversationOpen] = useState(false);

  const [pageContext, setPageContext] = useState<PageContent | null>(null);
  const [isPageContextExpanded, setIsPageContextExpanded] = useState(false);
  const [isPageContextLoaded, setIsPageContextLoaded] = useState(false);

  const {
    conversations,
    conversation_id,
    initializeAnonymousSession,
    loadConversations,
    loadMessages,
    clearMessages,
    deleteConversation,
    updateConversationTitle,
  } = useAssistantStore();

  useEffect(() => {
    if (!hasSeenWelcome) return;

    let cancelled = false;

    const initializeApp = async () => {
      try {
        await initializeAnonymousSession();

        if (cancelled) return;

        await loadConversations();

        if (cancelled) return;

        const savedConversationId =
          useAssistantStore.getState().conversation_id;

        if (savedConversationId) {
          await loadMessages(savedConversationId);
        }
      } catch (error) {
        console.error("Failed to initialize app:", error);
      }
    };

    void initializeApp();

    return () => {
      cancelled = true;
    };
  }, [
    hasSeenWelcome,
    initializeAnonymousSession,
    loadConversations,
    loadMessages,
  ]);

  const handleNewConversation = () => {
    clearMessages();
    setIsConversationOpen(false);
  };

  const handleSelectConversation = async (id: string) => {
    await loadMessages(id);
    setIsConversationOpen(false);
  };

  const handleOpenConversations = async () => {
    await loadConversations();
    setIsConversationOpen(true);
  };

  const handleDelete = async (conversationId: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this conversation?",
    );

    if (!confirmed) return;

    await deleteConversation(conversationId);
    setIsConversationOpen(false);
  };

  const handleUpdateTitle = async (conversationId: string, title: string) => {
    await updateConversationTitle(conversationId, title);
  };

  useEffect(() => {
    chrome.storage.local
      .get("savedPageContext")
      .then((result) => {
        const savedContext = result.savedPageContext as PageContent | undefined;

        if (savedContext) {
          setPageContext(savedContext);
        }
      })
      .catch((error) => {
        console.error("Failed to restore page context:", error);
      })
      .finally(() => {
        setIsPageContextLoaded(true);
      });
  }, []);

  const handleAnalyzePage = async (): Promise<ChatContext> => {
    if (pageContext) {
      return {
        title: pageContext.title,
        url: pageContext.url,
        description: pageContext.description,
        page_content: pageContext.content,
      };
    }

    const page = await extractPageContent();

    if (!page?.title || !page.url) {
      throw new Error("Unable to extract current page content.");
    }

    // Update React state
    setPageContext(page);
    setIsPageContextExpanded(false);

    // Persist extracted context across popup sessions
    await chrome.storage.local.set({
      savedPageContext: page,
    });

    return {
      title: page.title,
      url: page.url,
      description: page.description,
      page_content: page.content,
    };
  };

  const handleRemovePageContext = async () => {
    setPageContext(null);
    setIsPageContextExpanded(false);

    try {
      await chrome.storage.local.remove("savedPageContext");
    } catch (error) {
      console.error("Failed to remove saved page context:", error);
    }
  };

  if (!hasSeenWelcome) {
    return (
      <Welcome
        onOpenAssistant={() => {
          try {
            localStorage.setItem("ai-page-assistant:welcome-seen", "true");
          } catch (error) {
            // Storage may be unavailable
          }
          setHasSeenWelcome(true);
        }}
      />
    );
  }

  const chatContext: ChatContext | undefined = pageContext
    ? {
        title: pageContext.title,
        url: pageContext.url,
        description: pageContext.description,
        page_content: pageContext.content,
      }
    : undefined;

  return (
    <main className="relative h-150 w-105 overflow-hidden bg-[#050914] text-white">
      <div className="flex h-full w-full flex-col overflow-hidden border border-white/10 bg-[#080d17] shadow-2xl shadow-black/40">
        <Header
          onOpenConversations={handleOpenConversations}
          onNewConversation={handleNewConversation}
        />

        <div className="flex-1 min-h-0 overflow-y-auto">
          {pageContext && (
            <section className="mx-3 mt-3 overflow-hidden rounded-2xl border border-white/[0.09] bg-gradient-to-b from-[#121827] to-[#0b101c] shadow-lg shadow-black/20">
              {/* Preview image */}
              {pageContext.imageUrl ? (
                <div className="relative h-36 w-full overflow-hidden bg-[#151c2c]">
                  <img
                    src={pageContext.imageUrl}
                    alt={`${pageContext.title} preview`}
                    className="h-full w-full object-cover"
                    loading="lazy"
                    onError={(event) => {
                      event.currentTarget.parentElement?.classList.add(
                        "hidden",
                      );
                    }}
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-[#0b101c]/80 via-transparent to-black/10" />

                  <span className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-black/40 px-2.5 py-1 text-[10px] font-medium text-white backdrop-blur-md">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    Page context attached
                  </span>

                  <a
                    href={pageContext.url}
                    target="_blank"
                    rel="noreferrer"
                    aria-label="Open original webpage"
                    title="Open original webpage"
                    className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full border border-white/15 bg-black/40 text-white backdrop-blur-md transition hover:bg-black/65"
                  >
                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M14 3h7v7" />
                      <path d="M10 14 21 3" />
                      <path d="M21 14v6a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h6" />
                    </svg>
                  </a>
                </div>
              ) : (
                <div className="flex items-center gap-2.5 border-b border-white/[0.06] px-4 py-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-violet-400/15 bg-violet-500/10 text-violet-300">
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <path d="M2 12h20" />
                      <path d="M12 2a15 15 0 0 1 0 20" />
                      <path d="M12 2a15 15 0 0 0 0 20" />
                    </svg>
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-white">
                      Webpage context
                    </p>
                    <p className="mt-0.5 text-[10px] text-slate-500">
                      Content available to the assistant
                    </p>
                  </div>

                  <span className="flex items-center gap-1.5 text-[10px] font-medium text-emerald-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    Attached
                  </span>
                </div>
              )}

              {/* Page details */}
              <div className="p-3.5">
                <div className="flex items-start gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-2 break-words text-[13px] font-semibold leading-5 text-slate-100">
                      {pageContext.title || "Untitled webpage"}
                    </p>

                    <div className="mt-2 flex min-w-0 items-center gap-2">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-white/[0.06] text-slate-400">
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <circle cx="12" cy="12" r="10" />
                          <path d="M2 12h20" />
                          <path d="M12 2a15 15 0 0 1 0 20" />
                          <path d="M12 2a15 15 0 0 0 0-20" />
                        </svg>
                      </span>

                      <span className="truncate text-[11px] text-slate-400">
                        {(() => {
                          try {
                            return new URL(pageContext.url).hostname.replace(
                              /^www\./,
                              "",
                            );
                          } catch {
                            return pageContext.url;
                          }
                        })()}
                      </span>
                    </div>

                    <p className="mt-2 text-[10px] tabular-nums text-slate-500">
                      {pageContext.content.length.toLocaleString()} characters
                      extracted
                    </p>
                  </div>

                  {/* Card actions */}
                  <div className="flex shrink-0 items-center gap-1">
                    <button
                      type="button"
                      onClick={() =>
                        setIsPageContextExpanded((previous) => !previous)
                      }
                      className="rounded-lg border border-white/[0.08] bg-white/[0.03] px-2.5 py-1.5 text-[11px] font-medium text-slate-300 transition hover:border-violet-400/25 hover:bg-violet-500/10 hover:text-violet-200"
                      aria-expanded={isPageContextExpanded}
                    >
                      {isPageContextExpanded ? "Hide" : "Details"}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleRemovePageContext()}
                      className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-500 transition hover:bg-red-400/10 hover:text-red-300"
                      aria-label="Remove page context"
                      title="Remove page context"
                    >
                      <svg
                        width="15"
                        height="15"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M3 6h18" />
                        <path d="M8 6V4h8v2" />
                        <path d="m19 6-1 14H6L5 6" />
                        <path d="M10 11v5M14 11v5" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Expanded details */}
                {isPageContextExpanded && (
                  <div className="mt-3 border-t border-white/[0.08] pt-3">
                    <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                      Source URL
                    </p>

                    <a
                      href={pageContext.url}
                      target="_blank"
                      rel="noreferrer"
                      className="block break-all text-xs leading-5 text-violet-300 transition hover:text-violet-200 hover:underline"
                    >
                      {pageContext.url}
                    </a>

                    <p className="mt-2 text-[11px] leading-5 text-slate-400">
                      {pageContext.description ??
                        "This webpage content is available as context for your questions. The extracted text is not displayed in the chat."}
                    </p>
                  </div>
                )}
              </div>
            </section>
          )}

          <ChatMessage />
        </div>

        <ChatInput context={chatContext} onEnsureContext={handleAnalyzePage} />
        <QuickActions
          context={chatContext}
          onEnsureContext={handleAnalyzePage}
        />

        <Footer />

        {isConversationOpen && (
          <ConversationSidebar
            conversations={conversations}
            activeConversationId={conversation_id}
            onSelect={handleSelectConversation}
            handleDelete={handleDelete}
            onNewConversation={handleNewConversation}
            onClose={() => setIsConversationOpen(false)}
            handleUpdateTitle={handleUpdateTitle}
          />
        )}
      </div>
    </main>
  );
}

export default App;
