
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Lightbulb } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const frasesMotivacionais = [
  "💰 O primeiro passo para a riqueza é gastar menos do que você ganha!",
  "📊 Controlar seus gastos hoje é investir na sua liberdade financeira de amanhã.",
  "🎯 Cada real economizado é um passo mais próximo dos seus objetivos.",
  "💡 A disciplina financeira de hoje será a gratidão de amanhã.",
  "🚀 Pequenas economias diárias se transformam em grandes conquistas anuais!",
  "⚡ O planejamento financeiro não limita sua vida, ele a liberta!",
  "🌟 Seus sonhos merecem um orçamento bem planejado."
];

export function RecomendacoesInteligentes() {
  const { user } = useAuth();

  const { data: recomendacoes } = useQuery({
    queryKey: ['recomendacoes-inteligentes', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const currentMonth = new Date().getMonth() + 1;
      const currentYear = new Date().getFullYear();

      // Receitas do mês atual
      const { data: receitas } = await supabase
        .from('receitas')
        .select('valor')
        .eq('usuario_id', user.id)
        .gte('data', `${currentYear}-${currentMonth.toString().padStart(2, '0')}-01`)
        .lt('data', `${currentYear}-${(currentMonth + 1).toString().padStart(2, '0')}-01`);

      // Despesas fixas planejadas
      const { data: despesasFixas } = await supabase
        .from('planejamento_despesas_fixas')
        .select('valor')
        .eq('usuario_id', user.id);

      // Despesas variáveis do mês atual (não fixas)
      const { data: despesasVariaveis } = await supabase
        .from('despesas')
        .select('valor')
        .eq('usuario_id', user.id)
        .eq('despesa_fixa', false)
        .gte('data', `${currentYear}-${currentMonth.toString().padStart(2, '0')}-01`)
        .lt('data', `${currentYear}-${(currentMonth + 1).toString().padStart(2, '0')}-01`);

      // Investimentos (aportes) do mês atual
      const { data: investimentos } = await supabase
        .from('investimentos')
        .select('valor')
        .eq('usuario_id', user.id)
        .eq('categoria', 'aporte')
        .gte('data', `${currentYear}-${currentMonth.toString().padStart(2, '0')}-01`)
        .lt('data', `${currentYear}-${(currentMonth + 1).toString().padStart(2, '0')}-01`);

      const totalReceitas = receitas?.reduce((acc, r) => acc + (r.valor || 0), 0) || 0;
      const totalDespesasFixas = despesasFixas?.reduce((acc, d) => acc + (d.valor || 0), 0) || 0;
      const totalDespesasVariaveis = despesasVariaveis?.reduce((acc, d) => acc + (d.valor || 0), 0) || 0;
      const totalInvestimentos = investimentos?.reduce((acc, i) => acc + (i.valor || 0), 0) || 0;

      const saldoSeguro = totalReceitas - totalDespesasFixas;
      const gastosAtuais = totalDespesasVariaveis + totalInvestimentos;
      const percentualGasto = saldoSeguro > 0 ? (gastosAtuais / saldoSeguro) * 100 : 0;

      // Regra 50/30/20 aplicada ao saldo seguro
      const sugestaoLazer = saldoSeguro * 0.30; // 30% para lazer/entretenimento
      const sugestaoCompras = saldoSeguro * 0.20; // 20% para compras variáveis
      const sugestaoInvestimentos = saldoSeguro * 0.20; // 20% para investimentos

      return {
        saldoSeguro,
        gastosAtuais,
        percentualGasto: Math.min(percentualGasto, 100),
        sugestaoLazer,
        sugestaoCompras,
        sugestaoInvestimentos
      };
    },
    enabled: !!user?.id,
    refetchInterval: 30000 // Auto-update every 30 seconds
  });

  // Frase motivacional do dia (baseada na data)
  const hoje = new Date();
  const indiceFrase = hoje.getDate() % frasesMotivacionais.length;
  const fraseHoje = frasesMotivacionais[indiceFrase];

  return (
    <Card className="bg-white/5 backdrop-blur-sm border-white/10 shadow-xl">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-yellow-500" />
          Recomendações Inteligentes
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Barra de Limite de Gastos Seguros */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <h4 className="text-white font-medium">Limite de Gastos Seguros</h4>
            <span className="text-white/60 text-sm">
              R$ {recomendacoes?.gastosAtuais?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'} / 
              R$ {recomendacoes?.saldoSeguro?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}
            </span>
          </div>
          <Progress 
            value={recomendacoes?.percentualGasto || 0}
            className={`h-3 ${(recomendacoes?.percentualGasto || 0) > 80 ? 'bg-red-900' : 'bg-gray-700'}`}
          />
          <div className="text-xs text-center">
            <span className={(recomendacoes?.percentualGasto || 0) > 80 ? 'text-red-500' : 'text-white/60'}>
              {recomendacoes?.percentualGasto?.toFixed(1) || '0'}% do seu saldo seguro utilizado
            </span>
          </div>
        </div>

        {/* Sugestões de Distribuição */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-700/50 p-4 rounded-lg text-center hover:bg-gray-700/70 transition-all duration-300">
            <div className="text-purple-400 text-sm font-medium">Lazer</div>
            <div className="text-white text-lg font-bold">
              R$ {recomendacoes?.sugestaoLazer?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}
            </div>
            <div className="text-white/60 text-xs">30% do saldo</div>
          </div>
          
          <div className="bg-gray-700/50 p-4 rounded-lg text-center hover:bg-gray-700/70 transition-all duration-300">
            <div className="text-blue-400 text-sm font-medium">Compras</div>
            <div className="text-white text-lg font-bold">
              R$ {recomendacoes?.sugestaoCompras?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}
            </div>
            <div className="text-white/60 text-xs">20% do saldo</div>
          </div>
          
          <div className="bg-gray-700/50 p-4 rounded-lg text-center hover:bg-gray-700/70 transition-all duration-300">
            <div className="text-green-400 text-sm font-medium">Investimentos</div>
            <div className="text-white text-lg font-bold">
              R$ {recomendacoes?.sugestaoInvestimentos?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}
            </div>
            <div className="text-white/60 text-xs">20% do saldo</div>
          </div>
        </div>

        {/* Frase Motivacional */}
        <div className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 p-4 rounded-lg border border-blue-700/30 hover:border-blue-600/50 transition-all duration-300">
          <div className="text-white/90 text-center font-medium">
            {fraseHoje}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
