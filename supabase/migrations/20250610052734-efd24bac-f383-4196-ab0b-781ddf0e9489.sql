
-- Criar tabela para armazenar mensagens de ajuda e feedback
CREATE TABLE public.ajuda (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  usuario_id UUID NOT NULL DEFAULT auth.uid(),
  opcao TEXT NOT NULL CHECK (opcao IN ('ajuda', 'feedback')),
  mensagem TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Adicionar RLS (Row Level Security)
ALTER TABLE public.ajuda ENABLE ROW LEVEL SECURITY;

-- Política para permitir que usuários insiram suas próprias mensagens
CREATE POLICY "Users can insert their own messages" 
  ON public.ajuda 
  FOR INSERT 
  WITH CHECK (auth.uid() = usuario_id);

-- Política para permitir que usuários vejam suas próprias mensagens (caso necessário futuramente)
CREATE POLICY "Users can view their own messages" 
  ON public.ajuda 
  FOR SELECT 
  USING (auth.uid() = usuario_id);
