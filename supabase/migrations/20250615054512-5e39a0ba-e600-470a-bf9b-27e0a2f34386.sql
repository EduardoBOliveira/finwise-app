
-- Criar tabela para despesas fixas do planejamento
CREATE TABLE public.planejamento_despesas_fixas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id uuid NOT NULL DEFAULT auth.uid(),
  descricao text NOT NULL,
  valor numeric NOT NULL,
  categoria text,
  created_at timestamp with time zone DEFAULT now()
);

-- Criar tabela para tetos de gastos
CREATE TABLE public.planejamento_tetos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id uuid NOT NULL DEFAULT auth.uid(),
  categoria text NOT NULL,
  teto numeric NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Habilitar RLS para as novas tabelas
ALTER TABLE public.planejamento_despesas_fixas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.planejamento_tetos ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para planejamento_despesas_fixas
CREATE POLICY "Users can view their own planejamento_despesas_fixas" 
  ON public.planejamento_despesas_fixas 
  FOR SELECT 
  USING (auth.uid() = usuario_id);

CREATE POLICY "Users can create their own planejamento_despesas_fixas" 
  ON public.planejamento_despesas_fixas 
  FOR INSERT 
  WITH CHECK (auth.uid() = usuario_id);

CREATE POLICY "Users can update their own planejamento_despesas_fixas" 
  ON public.planejamento_despesas_fixas 
  FOR UPDATE 
  USING (auth.uid() = usuario_id);

CREATE POLICY "Users can delete their own planejamento_despesas_fixas" 
  ON public.planejamento_despesas_fixas 
  FOR DELETE 
  USING (auth.uid() = usuario_id);

-- Políticas RLS para planejamento_tetos
CREATE POLICY "Users can view their own planejamento_tetos" 
  ON public.planejamento_tetos 
  FOR SELECT 
  USING (auth.uid() = usuario_id);

CREATE POLICY "Users can create their own planejamento_tetos" 
  ON public.planejamento_tetos 
  FOR INSERT 
  WITH CHECK (auth.uid() = usuario_id);

CREATE POLICY "Users can update their own planejamento_tetos" 
  ON public.planejamento_tetos 
  FOR UPDATE 
  USING (auth.uid() = usuario_id);

CREATE POLICY "Users can delete their own planejamento_tetos" 
  ON public.planejamento_tetos 
  FOR DELETE 
  USING (auth.uid() = usuario_id);
