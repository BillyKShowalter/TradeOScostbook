export interface AIConversationItem {
  id?: string;
  role: "assistant" | "user";
  title: string;
  text: string;
  meta?: string;
}

