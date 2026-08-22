import { create } from "zustand";

export type MessageRole = "user" | "assistant";

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: string;
}

interface AssistantState {
  messages: Message[];
  input: string;
  isLoading: boolean;
  isSettingsOpen: boolean;
  isContextActive: boolean;

  setInput: (value: string) => void;
  setSettingsOpen: (value: boolean) => void;
  setContextActive: (value: boolean) => void;

  sendMessage: (message?: string) => void;
  quickAction: (action: QuickActionType) => void;
  clearMessages: () => void;
}

export type QuickActionType =
  | "summarize"
  | "question"
  | "key-points"
  | "translate";

const pageResponses: Record<QuickActionType, string> = {
  summarize:
    "Here is a concise summary of the page:\n\n• AI is rapidly transforming industries and society.\n• Key advancements include machine learning, NLP, and deep learning.\n• Real-world applications include healthcare, finance, and education.\n• Challenges include ethics, bias, data privacy, and security.\n• Future possibilities include AGI, automation, and human-AI collaboration.",

  question:
    "The article discusses how AI is transforming industries and society. It highlights advancements in machine learning and NLP, real-world applications in healthcare, finance, and education, as well as challenges around ethics, bias, privacy, and security.",

  "key-points":
    "Key points from this article:\n\n1. AI is transforming industries and society.\n2. Advancements include machine learning, NLP, and deep learning.\n3. Applications span healthcare, finance, and education.\n4. Challenges include ethics, bias, and data privacy.\n5. Future possibilities include AGI, automation, and human-AI collaboration.",

  translate:
    "Traducción (Español):\n\nLa IA está transformando rápidamente las industrias y la sociedad. Destaca avances como el aprendizaje automático y el procesamiento del lenguaje natural, aplicaciones en atención médica, finanzas y educación, así como desafíos relacionados con la ética, el sesgo y la privacidad de los datos.",
};

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

export const useAssistantStore = create<AssistantState>((set, get) => ({
  messages: [],
  input: "",
  isLoading: false,
  isSettingsOpen: false,
  isContextActive: true,

  setInput: (value) => set({ input: value }),

  setSettingsOpen: (value) => set({ isSettingsOpen: value }),

  setContextActive: (value) => set({ isContextActive: value }),

  clearMessages: () =>
    set({
      messages: [],
      input: "",
    }),

  sendMessage: (message) => {
    const text = (message ?? get().input).trim();

    if (!text || get().isLoading) return;

    const userMessage = createMessage("user", text);

    set((state) => ({
      messages: [...state.messages, userMessage],
      input: "",
      isLoading: true,
    }));

    setTimeout(() => {
      const response = createMessage(
        "assistant",
        "Based on the current page, the main topic is how AI is transforming industries and society. The page discusses machine learning, NLP, real-world applications, ethical challenges, privacy, and future AI possibilities.",
      );

      set((state) => ({
        messages: [...state.messages, response],
        isLoading: false,
      }));
    }, 900);
  },

  quickAction: (action) => {
    const label = actionLabels[action];

    const userMessage = createMessage("user", label);

    set((state) => ({
      messages: [...state.messages, userMessage],
      isLoading: true,
    }));

    setTimeout(() => {
      const response = createMessage("assistant", pageResponses[action]);

      set((state) => ({
        messages: [...state.messages, response],
        isLoading: false,
      }));
    }, 700);
  },
}));
