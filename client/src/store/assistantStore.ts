import { create } from "zustand";
import api from "../lib/axios";
import moment from "moment";

import type {
  AssistantState,
  ChatRequestPayload,
  Conversation,
  Message,
  QuickActionType,
} from "../types";

const actionLabels: Record<QuickActionType, string> = {
  summarize: "Summarize this page.",
  question: "What are the main points discussed in this article?",
  "key-points": "Show me the key points.",
  translate: "Translate this page to Spanish.",
};

const ACTIVE_CONVERSATION_KEY = "ai-page-assistant:active-conversation";

function getSavedConversationId(): string | null {
  try {
    return localStorage.getItem(ACTIVE_CONVERSATION_KEY);
  } catch (error) {
    return null;
  }
}

function saveConversationId(id: string | null): void {
  try {
    if (id) {
      localStorage.setItem(ACTIVE_CONVERSATION_KEY, id);
    } else {
      localStorage.removeItem(ACTIVE_CONVERSATION_KEY);
    }
  } catch (error) {
    // Storage may be unavailable in some extension contexts.
  }
}

async function streamAssistantMessage(
  payload: ChatRequestPayload,
  clearInput: boolean,
): Promise<void> {
  const store = useAssistantStore;
  const initialState = store.getState();

  if (initialState.isLoading) return;

  const optimisticId = crypto.randomUUID();
  const assistantDraftId = crypto.randomUUID();

  const optimisticMessage: Message = {
    id: optimisticId,
    conversation_id: initialState.conversation_id ?? "",
    role: "user",
    content: payload.content,
    created_at: moment().toISOString(),
  };

  let receivedMeta = false;
  let completed = false;
  let streamError: string | null = null;

  store.setState((state) => ({
    messages: [...state.messages, optimisticMessage],
    input: clearInput ? "" : state.input,
    isLoading: true,
    streamStatus: "thinking",
    error: null,
  }));

  const baseURL = (api.defaults.baseURL ?? "").replace(/\/$/, "");

  try {
    const response = await fetch(`${baseURL}/assistant/chat/stream`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        Accept: "text/event-stream",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      let message = `Request failed (${response.status})`;
      try {
        const body = await response.json();
        if (typeof body.detail === "string") {
          message = body.detail;
        }
      } catch {
        // # keep the default message
      }

      throw new Error(message);
    }

    if (!response.body) {
      throw new Error("The server did not return a readable stream.");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    const handleEvent = (block: string) => {
      let eventName = "message";
      const dataLines: string[] = [];

      for (const line of block.split("\n")) {
        if (line.startsWith("event:")) {
          eventName = line.slice(6).trim();
        } else if (line.startsWith("data:")) {
          dataLines.push(line.slice(5).trimStart());
        }
      }

      if (dataLines.length === 0) return;

      const data = JSON.parse(dataLines.join("\n"));

      switch (eventName) {
        case "meta": {
          const userMessage = data.user_message as Message;

          receivedMeta = true;
          saveConversationId(data.conversation_id);
          store.setState((state) => {
            const previousMessages = state.messages.filter(
              (message) =>
                message.id !== optimisticId && message.id !== assistantDraftId,
            );

            const messagesWithUser = previousMessages.some(
              (message) => message.id === userMessage.id,
            )
              ? previousMessages
              : [...previousMessages, userMessage];

            const assistantDraft: Message = {
              id: assistantDraftId,
              conversation_id: data.conversation_id,
              role: "assistant",
              content: "",
              created_at: moment().toISOString(),
            };

            return {
              conversation_id: data.conversation_id,
              messages: [...messagesWithUser, assistantDraft],
            };
          });

          break;
        }
        case "status": {
          if (data.status === "thinking" || data.status === "generating") {
            store.setState({
              streamStatus: data.status,
            });
          }
          break;
        }
        case "delta": {
          store.setState((state) => ({
            messages: state.messages.map((message) =>
              message.id === assistantDraftId
                ? {
                    ...message,
                    content: message.content + String(data.content ?? ""),
                  }
                : message,
            ),
          }));
          break;
        }
        case "done": {
          const assistantMessage = data.assistant_message as Message;

          saveConversationId(data.conversation_id);

          if (assistantMessage) {
            store.setState((state) => {
              const hasDraft = state.messages.some(
                (message) => message.id === assistantDraftId,
              );

              return {
                conversation_id: data.conversation_id,
                messages: hasDraft
                  ? state.messages.map((message) =>
                      message.id === assistantDraftId
                        ? assistantMessage
                        : message,
                    )
                  : [...state.messages, assistantMessage],
                isLoading: false,
                streamStatus: "idle",
              };
            });
          }
          completed = true;
          break;
        }
        case "error":
          streamError =
            typeof data.message === "string"
              ? data.message
              : "The assistant stream failed.";
      }
    };

    try {
      while (true) {
        const { value, done } = await reader.read();

        buffer += decoder.decode(value, { stream: !done });
        buffer = buffer.replace(/\r\n/g, "\n");

        const blocks = buffer.split("\n\n");
        buffer = blocks.pop() ?? "";

        for (const block of blocks) {
          if (block.trim()) handleEvent(block);
        }

        if (done) break;

        if (buffer.trim()) handleEvent(buffer);
      }
    } finally {
      reader.releaseLock();
    }

    if (streamError) throw new Error(streamError);

    if (!completed) {
      throw new Error("The stream ended before completion.");
    }

    await store.getState().loadConversations();
  } catch (error) {
    console.error("Assistant streaming error:", error);

    store.setState((state) => ({
      messages: state.messages.filter(
        (message) =>
          message.id !== assistantDraftId &&
          (receivedMeta || message.id !== optimisticId),
      ),
      isLoading: false,
      streamStatus: "idle",
      error:
        error instanceof Error
          ? error.message
          : "Unable to get a response. Please try again.",
    }));
  }
}

export const useAssistantStore = create<AssistantState>((set, get) => ({
  // -----------------------------------
  // State
  // -----------------------------------
  conversations: [],

  messages: [],

  input: "",

  conversation_id: getSavedConversationId(),

  streamStatus: "idle",

  isLoading: false,

  isSettingsOpen: false,

  isContextActive: true,

  error: null,

  // -----------------------------------
  // Set input
  // -----------------------------------

  setInput: (value) =>
    set({
      input: value,
    }),

  // -----------------------------------
  // Settings
  // -----------------------------------

  setSettingsOpen: (value) =>
    set({
      isSettingsOpen: value,
    }),

  // -----------------------------------
  // Context
  // -----------------------------------

  setContextActive: (value) =>
    set({
      isContextActive: value,
    }),

  // -----------------------------------
  // Clear error
  // -----------------------------------

  clearError: () =>
    set({
      error: null,
    }),

  // -----------------------------------
  // Clear conversation
  // -----------------------------------

  clearMessages: () => {
    saveConversationId(null);
    set({
      messages: [],
      input: "",
      error: null,
      conversation_id: null,
      isLoading: false,
      streamStatus: "idle",
    });
  },

  initializeAnonymousSession: async () => {
    try {
      await api.post("/assistant/session");
    } catch (error) {
      console.error("Anonymous session initialization error:", error);
      set({
        error: "Unable to initilize anonymous session",
      });
    }
  },

  // -----------------------------------
  // Load conversation
  // -----------------------------------

  loadConversations: async () => {
    try {
      const { data } = await api.get<Conversation[]>(
        `/assistant/conversations`,
      );

      set({
        conversations: data,
      });
    } catch (error) {
      console.error("Load conversations error:", error);

      set({
        error: "Unable to load conversations.",
      });
    }
  },

  // -----------------------------------
  // Load conversation messages
  // -----------------------------------

  loadMessages: async (conversation_id: string) => {
    saveConversationId(conversation_id)
    
    set({
      isLoading: true,
      error: null,
      conversation_id,
      streamStatus: "generating",
    });

    try {
      const { data } = await api.get<Message[]>(
        `/assistant/conversations/${conversation_id}/messages`,
      );

      set({
        messages: data,
        isLoading: false,
      });
    } catch (error) {
      console.error("Load messages error:", error);

      set({
        isLoading: false,
        error: "Unable to load conversation.",
      });
    }
  },

  // -----------------------------------
  // Send normal message
  // -----------------------------------

  sendMessage: async (message, context) => {
    const content = (message ?? get().input).trim();

    if (!content || get().isLoading) return;

    await streamAssistantMessage(
      {
        content,
        conversation_id: get().conversation_id,
        context,
      },
      true,
    );
  },

  // -----------------------------------
  // Quick action
  // -----------------------------------

  quickAction: async (action, context) => {
    if (get().isLoading) return;

    await streamAssistantMessage(
      {
        content: actionLabels[action],
        conversation_id: get().conversation_id,
        context,
        action,
      },
      false,
    );
  },

  deleteConversation: async (conversationId: string) => {
    try {
      await api.delete(`/assistant/conversation/${conversationId}`);

      const currentConversationId = get().conversation_id;

      set((state) => ({
        conversations: state.conversations.filter(
          (conversation) => conversation.id !== conversationId,
        ),

        // if deleted chat open
        ...(currentConversationId === conversationId
          ? {
              messages: [],
              conversation_id: null,
            }
          : {}),
      }));
    } catch (error) {
      console.error("Delete conversation erorr:", error);
      set({
        error: "Unable to delete conversation.",
      });
    }
  },

  updateConversationTitle: async (conversationId: string, title: string) => {
    const trimmedTitle = title.trim();

    if (!trimmedTitle) return;

    try {
      const { data } = await api.patch(
        `/assistant/conversation/${conversationId}`,
        null,
        {
          params: {
            title: trimmedTitle,
          },
        },
      );

      set((state) => ({
        conversations: state.conversations.map((conversation) =>
          conversation.id === conversationId
            ? {
                ...conversation,
                title: data.title,
                updated_at: data.updated_at,
              }
            : conversation,
        ),
      }));
    } catch (error) {
      console.error("Update conversation title error:", error);

      set({
        error: "Unable to update conversation title.",
      });
    }
  },
}));
