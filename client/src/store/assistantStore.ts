import { create } from "zustand";
import api from "../lib/axios";
import type {
  AssistantState,
  ChatContext,
  ChatRequestPayload,
  ChatResponse,
  Message,
  MessageRole,
  QuickActionType,
} from "../types";

const actionLabels: Record<QuickActionType, string> = {
  summarize: "Summarize this page.",
  question: "What are the main points discussed in this article?",
  "key-points": "Show me the key points.",
  translate: "Translate this page to Spanish.",
};

const createMessage = (role: MessageRole, content: string): Message => ({
  id: crypto.randomUUID(),
  role,
  content,
  timestamp: new Date().toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  }),
});

async function postChat(payload: ChatRequestPayload): Promise<Message> {
  const { data } = await api.post<ChatResponse>("/assistant/chat", payload);
  return createMessage("assistant", data.message);
}

export const useAssistantStore = create<AssistantState>((set, get) => ({
  messages: [],
  input: "",
  isLoading: false,
  isSettingsOpen: false,
  isContextActive: true,
  error: null,

  setInput: (value) => set({ input: value }),
  setSettingsOpen: (value) => set({ isSettingsOpen: value }),
  setContextActive: (value) => set({ isContextActive: value }),
  clearError: () => set({ error: null }),
  clearMessages: () => set({ messages: [], input: "", error: null }),

  sendMessage: async (message, context?: ChatContext) => {
    const text = (message ?? get().input).trim();
    if (!text || get().isLoading) return;

    const userMessage = createMessage("user", text);
    set((state) => ({
      messages: [...state.messages, userMessage],
      input: "",
      isLoading: true,
      error: null,
    }));

    try {
      const assistantMessage = await postChat({ message: text, context });
      set((state) => ({
        messages: [...state.messages, assistantMessage],
        isLoading: false,
      }));
    } catch (error) {
      console.error("Assistant chat error:", error);
      set({
        isLoading: false,
        error: "Unable to get a response. Please try again.",
      });
    }
  },

  quickAction: async (action, context?: ChatContext) => {
    if (get().isLoading) return;

    const message = actionLabels[action];
    const userMessage = createMessage("user", message);
    set((state) => ({
      messages: [...state.messages, userMessage],
      isLoading: true,
      error: null,
    }));

    try {
      const assistantMessage = await postChat({ message, action, context });
      set((state) => ({
        messages: [...state.messages, assistantMessage],
        isLoading: false,
      }));
    } catch (error) {
      console.error("Quick action error:", error);
      set({
        isLoading: false,
        error: "Unable to process this action. Please try again.",
      });
    }
  },
}));
