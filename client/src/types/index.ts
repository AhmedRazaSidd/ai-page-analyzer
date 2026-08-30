export type QuickActionType =
  | "summarize"
  | "question"
  | "key-points"
  | "translate";

export interface ChatContext {
  url?: string;
  title?: string;
  page_content?: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

export interface ChatRequestPayload {
  conversation_id: string | null;
  content: string;
  user_id: string;
  context?: ChatContext;
  action?: QuickActionType;
}

export interface ChatResponse {
  conversation_id: string;
  content: string;
  user_id: string;
}

export interface Conversation {
  id: string;
  created_at: string;
  updated_at: string;
}

export interface AssistantState {
  messages: Message[];
  conversations: Conversation[];
  input: string;

  user_id: string;

  conversation_id: string | null;

  isLoading: boolean;

  isSettingsOpen: boolean;

  isContextActive: boolean;

  error: string | null;

  setInput: (value: string) => void;

  setSettingsOpen: (value: boolean) => void;

  setContextActive: (value: boolean) => void;

  clearError: () => void;

  clearMessages: () => void;

  loadConversations: () => Promise<void>;

  loadMessages: (conversationId: string) => Promise<void>;

  sendMessage: (message?: string, context?: ChatContext) => Promise<void>;

  quickAction: (
    action: QuickActionType,
    context?: ChatContext,
  ) => Promise<void>;

  deleteConversation:(conversationId:string) => Promise<void>
}
