
-- Chat conversations table
CREATE TABLE public.chat_conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  title TEXT NOT NULL DEFAULT 'Yeni Sohbet',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.chat_conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own conversations" ON public.chat_conversations
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own conversations" ON public.chat_conversations
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own conversations" ON public.chat_conversations
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own conversations" ON public.chat_conversations
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- Chat messages table
CREATE TABLE public.chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES public.chat_conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view messages of their conversations" ON public.chat_messages
  FOR SELECT TO authenticated
  USING (conversation_id IN (
    SELECT id FROM public.chat_conversations WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can insert messages to their conversations" ON public.chat_messages
  FOR INSERT TO authenticated
  WITH CHECK (conversation_id IN (
    SELECT id FROM public.chat_conversations WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can delete messages of their conversations" ON public.chat_messages
  FOR DELETE TO authenticated
  USING (conversation_id IN (
    SELECT id FROM public.chat_conversations WHERE user_id = auth.uid()
  ));
