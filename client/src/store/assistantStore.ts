import { create } from "zustand";
import api, { getStoredToken, saveStoredToken } from "../lib/axios";
import moment from "moment";

import type {
  AssistantState,
  ChatRequestPayload,
  Conversation,
  Message,
  QuickActionType,
} from "../types";

const actionLabels: Record<QuickActionType, (lang?: string) => string> = {
  summarize: () => "Summarize this page.",
  question: () => "What are the main points discussed in this article?",
  "key-points": () => "Show me the key points.",
  translate: (lang = "Spanish") => `Translate this page to ${lang}.`,
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

let activeStreamController: AbortController | null = null;
let activeStreamId = 0;

async function streamAssistantMessage(
  payload: ChatRequestPayload,
  clearInput: boolean,
): Promise<void> {
  const store = useAssistantStore;
  const initialState = store.getState();

  if (initialState.isLoading) return;

  const controller = new AbortController();
  const streamId = ++activeStreamId;

  activeStreamController = controller;

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

  const isCurrentStream = () => streamId === activeStreamId;

  store.setState((state) => ({
    messages: [...state.messages, optimisticMessage],
    input: clearInput ? "" : state.input,
    isLoading: true,
    streamStatus: "thinking",
    error: null,

  translateLanguage: "Spanish",
  }));

  const baseURL = (api.defaults.baseURL ?? "").replace(/\/$/, "");

  try {
    const token = getStoredToken();
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "text/event-stream",
    };
    if (token) {
      headers["x-anonymous-token"] = token;
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${baseURL}/assistant/chat/stream`, {
      method: "POST",
      credentials: "include",
      headers,
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    if (!isCurrentStream()) return;

    if (!response.ok) {
      let message = `Request failed (${response.status})`;

      try {
        const body = await response.json();

        if (typeof body.detail === "string") {
          message = body.detail;
        }
      } catch {
        // Keep the default error message.
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
      if (!isCurrentStream()) return;

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

      let data: Record<string, unknown>;

      try {
        data = JSON.parse(dataLines.join("\n"));
      } catch (error) {
        console.error(`Invalid SSE JSON for event "${eventName}":`, error);
        throw error;
      }

      switch (eventName) {
        case "meta": {
          const userMessage = data.user_message as Message | undefined;
          const conversationId = data.conversation_id;

          if (
            !userMessage ||
            typeof userMessage.id !== "string" ||
            typeof conversationId !== "string"
          ) {
            throw new Error("Invalid conversation metadata received.");
          }

          receivedMeta = true;
          saveConversationId(conversationId);

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
              conversation_id: conversationId,
              role: "assistant",
              content: "",
              created_at: moment().toISOString(),
            };

            return {
              conversation_id: conversationId,
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
          const content = String(data.content ?? "");

          if (!content) break;

          store.setState((state) => ({
            messages: state.messages.map((message) =>
              message.id === assistantDraftId
                ? {
                    ...message,
                    content: message.content + content,
                  }
                : message,
            ),
          }));

          break;
        }

        case "done": {
          const assistantMessage = data.assistant_message as
            | Message
            | undefined;

          const conversationId =
            typeof data.conversation_id === "string"
              ? data.conversation_id
              : store.getState().conversation_id;

          if (conversationId) {
            saveConversationId(conversationId);
          }

          store.setState((state) => {
            const hasDraft = state.messages.some(
              (message) => message.id === assistantDraftId,
            );

            let messages = state.messages;

            if (assistantMessage) {
              messages = hasDraft
                ? state.messages.map((message) =>
                    message.id === assistantDraftId
                      ? assistantMessage
                      : message,
                  )
                : state.messages.some(
                      (message) => message.id === assistantMessage.id,
                    )
                  ? state.messages
                  : [...state.messages, assistantMessage];
            }

            return {
              conversation_id: conversationId,
              messages,
              isLoading: false,
              streamStatus: "idle",
            };
          });

          completed = true;
          break;
        }

        case "error": {
          streamError =
            typeof data.message === "string"
              ? data.message
              : "The assistant stream failed.";

          break;
        }

        default:
          // Ignore unknown SSE event types.
          break;
      }
    };

    try {
      while (true) {
        const { value, done } = await reader.read();

        if (!isCurrentStream()) break;

        buffer += decoder.decode(value, { stream: !done });
        buffer = buffer.replace(/\r\n/g, "\n");

        const blocks = buffer.split("\n\n");
        buffer = blocks.pop() ?? "";

        for (const block of blocks) {
          if (!isCurrentStream()) break;

          if (block.trim()) {
            handleEvent(block);
          }

          if (streamError) break;
        }

        if (streamError || done || !isCurrentStream()) {
          if (done && buffer.trim() && !streamError) {
            handleEvent(buffer);
            buffer = "";
          }

          break;
        }
      }
    } finally {
      reader.releaseLock();
    }

    if (!isCurrentStream()) return;

    if (streamError) {
      throw new Error(streamError);
    }

    if (!completed) {
      throw new Error("The stream ended before completion.");
    }

    await store.getState().loadConversations();
  } catch (error) {
    // Ignore cancelled or superseded requests.
    if (!isCurrentStream()) return;

    if (error instanceof Error && error.name === "AbortError") {
      return;
    }

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
  } finally {
    if (activeStreamController === controller) {
      activeStreamController = null;
    }

    // Only the current request can reset its loading state.
    if (isCurrentStream()) {
      store.setState({
        isLoading: false,
        streamStatus: "idle",
      });
    }
  }
}

function cancelActiveStream() {
  activeStreamId += 1;

  const controller = activeStreamController;
  activeStreamController = null;

  controller?.abort();

  useAssistantStore.setState({
    isLoading: false,
    streamStatus: "idle",
  });
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

  translateLanguage: "Spanish",

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

  setTranslateLanguage: (lang: string) =>
    set({
      translateLanguage: lang,
    }),

  // -----------------------------------
  // Clear conversation
  // -----------------------------------
  clearMessages: () => {
    cancelActiveStream();
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

  // -----------------------------------
  // Stop active stream generation
  // -----------------------------------
  stopGeneration: () => {
    cancelActiveStream();
  },

  initializeAnonymousSession: async () => {
    try {
      const { data } = await api.post<{ token?: string }>("/assistant/session");
      if (data?.token) {
        saveStoredToken(data.token);
      }
    } catch (error) {
      console.error("Anonymous session initialization error:", error);
      set({
        error: "Unable to initialize anonymous session",
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
    cancelActiveStream();
    saveConversationId(conversation_id);

    set({
      isLoading: true,
      error: null,

  translateLanguage: "Spanish",
      conversation_id,
      streamStatus: "idle",
    });

    try {
      const { data } = await api.get<Message[]>(
        `/assistant/conversations/${conversation_id}/messages`,
      );

      // Ignore the response if the user switched conversations meanwhile.
      if (get().conversation_id !== conversation_id) return;

      set({
        messages: data,
        isLoading: false,
        streamStatus: "idle",
      });
    } catch (error) {
      if (get().conversation_id !== conversation_id) return;

      console.error("Load messages error:", error);

      set({
        isLoading: false,
        streamStatus: "idle",
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

    const lang = get().translateLanguage;

    await streamAssistantMessage(
      {
        content: actionLabels[action](action === "translate" ? lang : undefined),
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
      console.error("Delete conversation error:", error);
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
