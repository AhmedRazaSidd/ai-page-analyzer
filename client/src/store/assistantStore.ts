import { create } from "zustand";
import api from "../lib/axios";

import type {
  AssistantState,
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
  // -----------------------------------
  // State
  // -----------------------------------

  messages: [],

  input: "",

  user_id: "3fa85f64-5717-4562-b3fc-2c963f66afa6",

  conversation_id: null,

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

  clearMessages: () =>
    set({
      messages: [],
      input: "",
      error: null,
      conversation_id: null,
    }),

  // -----------------------------------
  // Load conversation messages
  // -----------------------------------

  loadMessages: async (conversation_id: string) => {
    set({
      isLoading: true,
      error: null,
      conversation_id,
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
    const text = (message ?? get().input).trim();

    if (!text || get().isLoading) return;

    set({
      isLoading: true,
      error: null,
      input: "",
    });

    try {
      const payload: ChatRequestPayload = {
        content: text,
        user_id: get().user_id,
        conversation_id: get().conversation_id ?? null,
        context,
      };

      const { data } = await api.post<ChatResponse>(
        "/assistant/chat",
        payload,
      );

      set({
        conversation_id: data.conversation_id,
      });

      await get().loadMessages(data.conversation_id);
    } catch (error) {
      console.error("Assistant chat error:", error);

      set({
        isLoading: false,
        error: "Unable to get a response. Please try again.",
      });
    }
  },

  // -----------------------------------
  // Quick action
  // -----------------------------------

  quickAction: async (action, context) => {
    if (get().isLoading) return;

    const message = actionLabels[action];

    set({
      isLoading: true,
      error: null,
    });

    try {
      const payload: ChatRequestPayload = {
        content: message,
        user_id: get().user_id,
        conversation_id: get().conversation_id ?? null,
        context,
      };

      const { data } = await api.post<ChatResponse>(
        "/assistant/chat",
        payload,
      );

      set({
        conversation_id: data.conversation_id,
      });

      await get().loadMessages(data.conversation_id);
    } catch (error) {
      console.error("Quick action error:", error);

      set({
        isLoading: false,
        error: "Unable to process this action. Please try again.",
      });
    }
  },
}));