
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Wallet } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export function ResumoCards() {
  const { user } = useAuth();

  const { data: resumo, isLoading } = useQuery({
    queryKey: ['planejamento-resumo', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const currentMonth = new Date().getMonth() + 1;
      const currentYear = new Date().getFullYear();

      // Total de Receitas do mês atual
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

      // Despesas não fixas do mês atual
      const { data: despesasNaoFixas } = await supabase
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
      const totalDespesasNaoFixas = despesasNaoFixas?.reduce((acc, d) => acc + (d.valor || 0), 0) || 0;
      const totalInvestimentos = investimentos?.reduce((acc, i) => acc + (i.valor || 0), 0) || 0;

      const totalDespesas = totalDespesasFixas + totalDespesasNaoFixas + totalInvestimentos;
      const saldoLivre = totalReceitas - totalDespesas;

      return {
        totalReceitas,
        totalDespesas,
        saldoLivre
      };
    },
    enabled: !!user?.id,
    refetchInterval: 30000 // Auto-update every 30 seconds
  });

  if (isLoading) {
    return <div className="text-white">Carregando resumo...</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="finwise-glass-card hover:scale-105 transition-transform duration-300">
        <div className="flex items-center justify-between mb-4">
          <div className="finwise-icon-container finwise-icon-green">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>
        <h3 className="finwise-card-title">Total de Receitas</h3>
        <p className="finwise-value-text finwise-text-green">
          R$ {resumo?.totalReceitas?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}
        </p>
      </div>

      <div className="finwise-glass-card hover:scale-105 transition-transform duration-300">
        <div className="flex items-center justify-between mb-4">
          <div className="finwise-icon-container finwise-icon-red">
            <TrendingDown className="w-6 h-6" />
          </div>
        </div>
        <h3 className="finwise-card-title">Total de Despesas</h3>
        <p className="finwise-value-text finwise-text-red">
          R$ {resumo?.totalDespesas?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}
        </p>
      </div>

      <div className="finwise-glass-card hover:scale-105 transition-transform duration-300">
        <div className="flex items-center justify-between mb-4">
          <div className={`finwise-icon-container ${(resumo?.saldoLivre || 0) >= 0 ? 'finwise-icon-blue' : 'finwise-icon-red'}`}>
            <Wallet className="w-6 h-6" />
          </div>
        </div>
        <h3 className="finwise-card-title">Saldo Livre</h3>
        <p className={`finwise-value-text ${(resumo?.saldoLivre || 0) >= 0 ? 'finwise-text-blue' : 'finwise-text-red'}`}>
          R$ {resumo?.saldoLivre?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}
        </p>
      </div>
    </div>
  );
}
