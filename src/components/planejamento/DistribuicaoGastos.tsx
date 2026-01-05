
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const COLORS = [
  '#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1', 
  '#d084d0', '#ffb347', '#87ceeb', '#dda0dd', '#98fb98'
];

export function DistribuicaoGastos() {
  const { user } = useAuth();

  const { data: distribuicao, isLoading } = useQuery({
    queryKey: ['distribuicao-gastos', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const currentMonth = new Date().getMonth() + 1;
      const currentYear = new Date().getFullYear();

      // Despesas do mês atual (incluindo fixas planejadas e não fixas)
      const { data: despesasNaoFixas } = await supabase
        .from('despesas')
        .select('categoria, valor')
        .eq('usuario_id', user.id)
        .eq('despesa_fixa', false)
        .gte('data', `${currentYear}-${currentMonth.toString().padStart(2, '0')}-01`)
        .lt('data', `${currentYear}-${(currentMonth + 1).toString().padStart(2, '0')}-01`);

      const { data: despesasFixas } = await supabase
        .from('planejamento_despesas_fixas')
        .select('categoria, valor')
        .eq('usuario_id', user.id);

      const { data: investimentos } = await supabase
        .from('investimentos')
        .select('valor')
        .eq('usuario_id', user.id)
        .eq('categoria', 'aporte')
        .gte('data', `${currentYear}-${currentMonth.toString().padStart(2, '0')}-01`)
        .lt('data', `${currentYear}-${(currentMonth + 1).toString().padStart(2, '0')}-01`);

      // Agrupar por categoria
      const categorias: { [key: string]: number } = {};

      // Processar despesas não fixas
      despesasNaoFixas?.forEach(despesa => {
        const categoria = despesa.categoria || 'Outros';
        categorias[categoria] = (categorias[categoria] || 0) + (despesa.valor || 0);
      });

      // Processar despesas fixas
      despesasFixas?.forEach(despesa => {
        const categoria = despesa.categoria || 'Outros';
        categorias[categoria] = (categorias[categoria] || 0) + (despesa.valor || 0);
      });

      // Adicionar investimentos
      const totalInvestimentos = investimentos?.reduce((acc, inv) => acc + (inv.valor || 0), 0) || 0;
      if (totalInvestimentos > 0) {
        categorias['Investimentos'] = totalInvestimentos;
      }

      // Converter para formato do gráfico
      return Object.entries(categorias)
        .map(([categoria, valor]) => ({
          name: categoria,
          value: valor,
          percentual: 0 // será calculado depois
        }))
        .sort((a, b) => b.value - a.value);
    },
    enabled: !!user?.id,
    refetchInterval: 30000 // Auto-update every 30 seconds
  });

  // Calcular percentuais
  const dadosComPercentual = distribuicao?.map(item => {
    const total = distribuicao.reduce((acc, d) => acc + d.value, 0);
    return {
      ...item,
      percentual: total > 0 ? ((item.value / total) * 100) : 0
    };
  }) || [];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-gray-800 border border-gray-600 p-3 rounded-lg shadow-lg">
          <p className="text-white font-medium">{data.name}</p>
          <p className="text-blue-400">
            R$ {data.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-white/60 text-sm">
            {data.percentual.toFixed(1)}%
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="bg-white/5 backdrop-blur-sm border-white/10 shadow-xl">
      <CardHeader>
        <CardTitle className="text-white">Distribuição de Gastos</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-white/60 text-center py-8">Carregando...</div>
        ) : dadosComPercentual.length === 0 ? (
          <div className="text-white/60 text-center py-8">
            Nenhum gasto registrado este mês
          </div>
        ) : (
          <div className="space-y-4">
            {/* Gráfico de Pizza */}
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={dadosComPercentual}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ percentual }) => `${percentual.toFixed(1)}%`}
                  >
                    {dadosComPercentual.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Legenda customizada */}
            <div className="space-y-2">
              {dadosComPercentual.slice(0, 5).map((item, index) => (
                <div key={item.name} className="flex items-center justify-between hover:bg-gray-700/30 p-2 rounded transition-all duration-300">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="text-white/80 text-sm">{item.name}</span>
                  </div>
                  <div className="text-white/60 text-sm">
                    {item.percentual.toFixed(1)}%
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
