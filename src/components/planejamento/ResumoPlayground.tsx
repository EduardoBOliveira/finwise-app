
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export function ResumoPlayground() {
  const { user } = useAuth();

  const { data: resumo, isLoading } = useQuery({
    queryKey: ['resumo-playground', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const currentMonth = new Date().getMonth() + 1;
      const currentYear = new Date().getFullYear();

      // Despesas Fixas Planejadas
      const { data: despesasFixas } = await supabase
        .from('planejamento_despesas_fixas')
        .select('valor')
        .eq('usuario_id', user.id);

      const totalDespesasFixas = despesasFixas?.reduce((acc, d) => acc + (d.valor || 0), 0) || 0;

      // Despesas Variáveis do mês atual
      const { data: despesasVariaveis } = await supabase
        .from('despesas')
        .select('valor')
        .eq('usuario_id', user.id)
        .eq('despesa_fixa', false)
        .gte('data', `${currentYear}-${currentMonth.toString().padStart(2, '0')}-01`)
        .lt('data', `${currentYear}-${(currentMonth + 1).toString().padStart(2, '0')}-01`);

      const totalDespesasVariaveis = despesasVariaveis?.reduce((acc, d) => acc + (d.valor || 0), 0) || 0;

      // Total de Receitas do mês
      const { data: receitas } = await supabase
        .from('receitas')
        .select('valor')
        .eq('usuario_id', user.id)
        .gte('data', `${currentYear}-${currentMonth.toString().padStart(2, '0')}-01`)
        .lt('data', `${currentYear}-${(currentMonth + 1).toString().padStart(2, '0')}-01`);

      const totalReceitas = receitas?.reduce((acc, r) => acc + (r.valor || 0), 0) || 0;

      // Investimentos do mês
      const { data: investimentos } = await supabase
        .from('investimentos')
        .select('valor')
        .eq('usuario_id', user.id)
        .eq('categoria', 'aporte')
        .gte('data', `${currentYear}-${currentMonth.toString().padStart(2, '0')}-01`)
        .lt('data', `${currentYear}-${(currentMonth + 1).toString().padStart(2, '0')}-01`);

      const totalInvestimentos = investimentos?.reduce((acc, inv) => acc + (inv.valor || 0), 0) || 0;

      // Saldo Final
      const saldoFinal = totalReceitas - totalDespesasFixas - totalDespesasVariaveis - totalInvestimentos;

      // Calcular percentuais
      const totalGastos = totalDespesasFixas + totalInvestimentos;
      const percentualGastosFixos = totalReceitas > 0 ? ((totalDespesasFixas / totalReceitas) * 100) : 0;
      const percentualInvestimentos = totalReceitas > 0 ? ((totalInvestimentos / totalReceitas) * 100) : 0;

      return {
        totalDespesasFixas,
        totalDespesasVariaveis,
        totalReceitas,
        totalInvestimentos,
        saldoFinal,
        percentualGastosFixos,
        percentualInvestimentos
      };
    },
    enabled: !!user?.id,
    refetchInterval: 30000
  });

  return (
    <Card className="bg-white/5 backdrop-blur-sm border-white/10 shadow-xl">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          ⚠️ Resumo do Planejamento
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="text-white/60 text-center py-4">Carregando...</div>
        ) : (
          <>
            {/* Aviso em destaque */}
            <div className="bg-red-500/20 border border-red-500/30 p-4 rounded-lg">
              <p className="text-red-300 text-sm leading-relaxed">
                Atenção! Seus gastos estão muito altos em relação à sua renda. É 
                importante revisar seus gastos fixos e criar um plano de redução de 
                despesas urgentemente.
              </p>
            </div>

            {/* Cards de percentual */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-white mb-1">
                  {resumo?.percentualGastosFixos?.toFixed(1) || '0.0'}%
                </div>
                <div className="text-white/60 text-sm uppercase tracking-wide">
                  GASTOS FIXOS
                </div>
                <div className="text-white/40 text-xs">da renda</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-white mb-1">
                  {resumo?.percentualInvestimentos?.toFixed(1) || '0.0'}%
                </div>
                <div className="text-white/60 text-sm uppercase tracking-wide">
                  INVESTIMENTOS
                </div>
                <div className="text-white/40 text-xs">da renda</div>
              </div>
            </div>

            {/* Lista de valores */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-white/80">Receitas:</span>
                <span className="text-green-400 font-bold">
                  R$ {resumo?.totalReceitas?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-white/80">Gastos Fixos:</span>
                <span className="text-red-400 font-bold">
                  R$ {resumo?.totalDespesasFixas?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-white/80">Gastos Variáveis:</span>
                <span className="text-orange-400 font-bold">
                  R$ {resumo?.totalDespesasVariaveis?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-white/80">Investimentos:</span>
                <span className="text-blue-400 font-bold">
                  R$ {resumo?.totalInvestimentos?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}
                </span>
              </div>
              
              <div className="border-t border-white/20 pt-3">
                <div className="flex justify-between items-center">
                  <span className="text-white font-medium">Saldo Final:</span>
                  <span className={`font-bold text-lg ${(resumo?.saldoFinal || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    R$ {resumo?.saldoFinal?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}
                  </span>
                </div>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
