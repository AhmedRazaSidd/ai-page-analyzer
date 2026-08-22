export type MessageRole = "user" | "assistant";

export type QuickActionType =
  | "summarize"
  | "question"
  | "key-points"
  | "translate";

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: string;
}

export interface ChatContext {
  url?: string;
  title?: string;
  content?: string;
}

export interface ChatRequestPayload {
  message: string;
  action?: QuickActionType;
  context?: ChatContext;
}

export interface ChatResponse {
  message: string;
}

export interface AssistantState {
  messages: Message[];
  input: string;
  isLoading: boolean;
  isSettingsOpen: boolean;
  isContextActive: boolean;
  error: string | null;

  setInput: (value: string) => void;
  setSettingsOpen: (value: boolean) => void;
  setContextActive: (value: boolean) => void;

  sendMessage: (message?: string, context?: ChatContext) => Promise<void>;
  quickAction: (
    action: QuickActionType,
    context?: ChatContext,
  ) => Promise<void>;

  clearMessages: () => void;
  clearError: () => void;
}
