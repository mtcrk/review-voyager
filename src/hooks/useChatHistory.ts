import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface ChatMessage {
  id?: string;
  role: "user" | "assistant";
  content: string;
}

export interface ChatConversation {
  id: string;
  business_id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export function useChatHistory(businessId: string | undefined) {
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Load conversation list
  const loadConversations = useCallback(async () => {
    if (!businessId) return;
    const { data } = await supabase
      .from("chat_conversations")
      .select("*")
      .eq("business_id", businessId)
      .order("updated_at", { ascending: false })
      .limit(50);
    if (data) setConversations(data as ChatConversation[]);
  }, [businessId]);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  // Load messages for a conversation
  const loadMessages = useCallback(async (conversationId: string) => {
    setLoadingHistory(true);
    setActiveConversationId(conversationId);
    const { data } = await supabase
      .from("chat_messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });
    if (data) {
      setMessages(data.map((m: any) => ({ id: m.id, role: m.role, content: m.content })));
    }
    setLoadingHistory(false);
  }, []);

  // Start a new conversation
  const startNewConversation = useCallback(async (firstMessage: string) => {
    if (!businessId) return null;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const title = firstMessage.length > 50 ? firstMessage.slice(0, 50) + "…" : firstMessage;
    const { data, error } = await supabase
      .from("chat_conversations")
      .insert({ business_id: businessId, user_id: user.id, title })
      .select()
      .single();

    if (error || !data) return null;
    const conv = data as ChatConversation;
    setActiveConversationId(conv.id);
    setConversations(prev => [conv, ...prev]);
    setMessages([]);
    return conv.id;
  }, [businessId]);

  // Save a message to DB
  const saveMessage = useCallback(async (conversationId: string, role: "user" | "assistant", content: string) => {
    await supabase
      .from("chat_messages")
      .insert({ conversation_id: conversationId, role, content });

    // Update conversation timestamp & title if first user message
    await supabase
      .from("chat_conversations")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", conversationId);
  }, []);

  // Delete a conversation
  const deleteConversation = useCallback(async (conversationId: string) => {
    await supabase.from("chat_conversations").delete().eq("id", conversationId);
    setConversations(prev => prev.filter(c => c.id !== conversationId));
    if (activeConversationId === conversationId) {
      setActiveConversationId(null);
      setMessages([]);
    }
  }, [activeConversationId]);

  // Clear current chat (new chat)
  const newChat = useCallback(() => {
    setActiveConversationId(null);
    setMessages([]);
  }, []);

  return {
    conversations,
    activeConversationId,
    messages,
    setMessages,
    loadingHistory,
    loadConversations,
    loadMessages,
    startNewConversation,
    saveMessage,
    deleteConversation,
    newChat,
  };
}
