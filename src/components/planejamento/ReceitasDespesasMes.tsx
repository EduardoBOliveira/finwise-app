
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { TrendingUp, TrendingDown } from "lucide-react";

export function ReceitasDespesasMes() {
  const { user } = useAuth();

  const { data: receitas, isLoading: loadingReceitas } = useQuery({
    queryKey: ['planejamento-receitas-mes', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const currentMonth = new Date().getMonth() + 1;
      const currentYear = new Date().getFullYear();

      const { data, error } = await supabase
        .from('receitas')
        .select('*')
        .eq('usuario_id', user.id)
        .gte('data', `${currentYear}-${currentMonth.toString().padStart(2, '0')}-01`)
        .lt('data', `${currentYear}-${(currentMonth + 1).toString().padStart(2, '0')}-01`)
        .order('data', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
    refetchInterval: 30000
  });

  const { data: despesas, isLoading: loadingDespesas } = useQuery({
    queryKey: ['planejamento-despesas-mes', user?.id],
    queryFn: async () => {
      if (!user?.id) return { despesas: [], investimentos: [] };

      const currentMonth = new Date().getMonth() + 1;
      const currentYear = new Date().getFullYear();

      // Despesas não fixas do mês
      const { data: despesasData, error: despesasError } = await supabase
        .from('despesas')
        .select('*')
        .eq('usuario_id', user.id)
        .eq('despesa_fixa', false)
        .gte('data', `${currentYear}-${currentMonth.toString().padStart(2, '0')}-01`)
        .lt('data', `${currentYear}-${(currentMonth + 1).toString().padStart(2, '0')}-01`)
        .order('data', { ascending: false });

      if (despesasError) throw despesasError;

      // Investimentos (aportes) do mês
      const { data: investimentosData, error: investimentosError } = await supabase
        .from('investimentos')
        .select('*')
        .eq('usuario_id', user.id)
        .eq('categoria', 'aporte')
        .gte('data', `${currentYear}-${currentMonth.toString().padStart(2, '0')}-01`)
        .lt('data', `${currentYear}-${(currentMonth + 1).toString().padStart(2, '0')}-01`)
        .order('data', { ascending: false });

      if (investimentosError) throw investimentosError;

      return {
        despesas: despesasData || [],
        investimentos: investimentosData || []
      };
    },
    enabled: !!user?.id,
    refetchInterval: 30000
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Receitas do Mês */}
      <Card className="bg-white/5 backdrop-blur-sm border-white/10 shadow-xl">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-500" />
            Receitas do Mês
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {loadingReceitas ? (
              <div className="text-white/60">Carregando...</div>
            ) : receitas?.length === 0 ? (
              <div className="text-white/60 text-center py-4">Nenhuma receita registrada este mês</div>
            ) : (
              receitas?.map((receita) => (
                <div key={receita.id} className="flex items-center justify-between bg-gray-700/50 p-3 rounded-lg hover:scale-105 transition-transform duration-200">
                  <div>
                    <div className="text-white font-medium">{receita.descricao}</div>
                    <div className="text-white/60 text-sm">
                      {receita.categoria} • {new Date(receita.data).toLocaleDateString('pt-BR')}
                    </div>
                  </div>
                  <div className="text-green-500 font-bold">
                    R$ {receita.valor?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Despesas do Mês */}
      <Card className="bg-white/5 backdrop-blur-sm border-white/10 shadow-xl">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <TrendingDown className="w-5 h-5 text-red-500" />
            Despesas do Mês
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {loadingDespesas ? (
              <div className="text-white/60">Carregando...</div>
            ) : (!despesas?.despesas?.length && !despesas?.investimentos?.length) ? (
              <div className="text-white/60 text-center py-4">Nenhuma despesa registrada este mês</div>
            ) : (
              <>
                {/* Despesas normais */}
                {despesas?.despesas?.map((despesa) => (
                  <div key={despesa.id} className="flex items-center justify-between bg-gray-700/50 p-3 rounded-lg hover:scale-105 transition-transform duration-200">
                    <div>
                      <div className="text-white font-medium">{despesa.descricao}</div>
                      <div className="text-white/60 text-sm">
                        {despesa.categoria} • {new Date(despesa.data).toLocaleDateString('pt-BR')}
                      </div>
                    </div>
                    <div className="text-red-500 font-bold">
                      R$ {despesa.valor?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                ))}

                {/* Investimentos (aportes) */}
                {despesas?.investimentos?.map((investimento) => (
                  <div key={investimento.id} className="flex items-center justify-between bg-gray-700/50 p-3 rounded-lg hover:scale-105 transition-transform duration-200">
                    <div>
                      <div className="text-white font-medium">{investimento.descricao}</div>
                      <div className="text-white/60 text-sm">
                        Investimento • {new Date(investimento.data).toLocaleDateString('pt-BR')}
                      </div>
                    </div>
                    <div className="text-orange-500 font-bold">
                      R$ {investimento.valor?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
