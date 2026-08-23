import { create } from "zustand";
import api from "../lib/axios";
import type {
  AssistantState,
  ChatContext,
  ChatRequestPayload,
  ChatResponse,
  Message,
  QuickActionType,
} from "../types";

const actionLabels: Record<QuickActionType, string> = {
  summarize: "Summarize this page.",
  question: "What are the main points discussed in this article?",
  "key-points": "Show me the key points.",
  translate: "Translate this page to Spanish.",
};

export const useAssistantStore = create<AssistantState>((set, get) => ({
  messages: [],
  input: "",
  conversationId: null,
  isLoading: false,
  isSettingsOpen: false,
  isContextActive: true,
  error: null,

  setInput: (value) => set({ input: value }),

  setSettingsOpen: (value) => set({
    isSettingsOpen: value,
  }),

  setContextActive: (value) => set({
    isContextActive: value,
  }),

  clearError: () => set({
    error: null,
  }),

  clearMessages: () => set({
    messages: [],
    input: "",
    error: null,
    conversationId: null,
  }),

  /**
   * Load existing conversation messages from backend.
   */
  loadMessages: async (conversationId: string) => {
    set({
      isLoading: true,
      error: null,
      conversationId,
    });

    try {
      const { data } = await api.get<Message[]>(
        `/assistant/conversations/${conversationId}/messages`
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

  /**
   * Send normal chat message.
   * Messages are NOT added locally.
   * Backend saves them and frontend reloads them.
   */
  sendMessage: async (message, context?: ChatContext) => {
    const text = (message ?? get().input).trim();

    if (!text || get().isLoading) return;

    set({
      isLoading: true,
      error: null,
      input: "",
    });

    try {
      const payload: ChatRequestPayload = {
        message: text,
        conversationId: get().conversationId ?? undefined,
        context,
      };

      const { data } = await api.post<ChatResponse>(
        "/assistant/chat",
        payload
      );

      set({
        conversationId: data.conversationId,
      });

      await get().loadMessages(data.conversationId);
    } catch (error) {
      console.error("Assistant chat error:", error);

      set({
        isLoading: false,
        error: "Unable to get a response. Please try again.",
      });
    }
  },

  /**
   * Execute quick action.
   * Backend handles the action and saves the messages.
   */
  quickAction: async (action, context?: ChatContext) => {
    if (get().isLoading) return;

    const message = actionLabels[action];

    set({
      isLoading: true,
      error: null,
    });

    try {
      const payload: ChatRequestPayload = {
        message,
        action,
        conversationId: get().conversationId ?? undefined,
        context,
      };

      const { data } = await api.post<ChatResponse>(
        "/assistant/chat",
        payload
      );

      set({
        conversationId: data.conversationId,
      });

      await get().loadMessages(data.conversationId);
    } catch (error) {
      console.error("Quick action error:", error);

      set({
        isLoading: false,
        error: "Unable to process this action. Please try again.",
      });
    }
  },
}));