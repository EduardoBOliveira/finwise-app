
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface CategoriaData {
  name: string;
  value: number;
  color: string;
}

interface DespesasCategoriaChartProps {
  anoSelecionado?: string;
}

export function DespesasCategoriaChart({ anoSelecionado }: DespesasCategoriaChartProps) {
  const { user } = useAuth();
  const [data, setData] = useState<CategoriaData[]>([]);
  const [filtroMes, setFiltroMes] = useState<string>("geral");
  
  // Usar ano selecionado ou ano atual
  const anoParaFiltro = anoSelecionado && anoSelecionado !== 'all' ? parseInt(anoSelecionado) : new Date().getFullYear();

  const meses = [
    { value: "geral", label: "Geral" },
    { value: "1", label: "Janeiro" },
    { value: "2", label: "Fevereiro" },
    { value: "3", label: "Março" },
    { value: "4", label: "Abril" },
    { value: "5", label: "Maio" },
    { value: "6", label: "Junho" },
    { value: "7", label: "Julho" },
    { value: "8", label: "Agosto" },
    { value: "9", label: "Setembro" },
    { value: "10", label: "Outubro" },
    { value: "11", label: "Novembro" },
    { value: "12", label: "Dezembro" }
  ];

  const cores = [
    '#8B5CF6', // Purple
    '#EF4444', // Red
    '#10B981', // Green
    '#F59E0B', // Orange
    '#3B82F6', // Blue
    '#EC4899', // Pink
    '#6B7280'  // Gray
  ];

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      let query = supabase
        .from('despesas')
        .select('categoria, valor')
        .eq('usuario_id', user.id);

      // Aplicar filtro de ano
      if (anoSelecionado && anoSelecionado !== 'all') {
        query = query
          .gte('data_pagamento', `${anoParaFiltro}-01-01`)
          .lte('data_pagamento', `${anoParaFiltro}-12-31`);
      }

      if (filtroMes !== "geral") {
        const mesAtual = parseInt(filtroMes);
        query = query
          .gte('data_pagamento', `${anoParaFiltro}-${mesAtual.toString().padStart(2, '0')}-01`)
          .lt('data_pagamento', `${anoParaFiltro}-${(mesAtual + 1).toString().padStart(2, '0')}-01`);
      }

      const { data: despesas } = await query;

      if (!despesas) return;

      const categorias = despesas.reduce((acc, despesa) => {
        const cat = despesa.categoria || 'Outros';
        acc[cat] = (acc[cat] || 0) + (despesa.valor || 0);
        return acc;
      }, {} as Record<string, number>);

      const chartData = Object.entries(categorias)
        .map(([name, value], index) => ({
          name,
          value,
          color: cores[index % cores.length]
        }))
        .sort((a, b) => b.value - a.value);

      setData(chartData);
    };

    fetchData();
  }, [user, filtroMes, anoParaFiltro]);

  return (
    <div className="finwise-glass-card hover:shadow-lg hover:shadow-purple-500/10 transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white text-xl font-bold">Despesas por Categoria</h3>
        <Select value={filtroMes} onValueChange={setFiltroMes}>
          <SelectTrigger className="w-32 h-8 bg-white/10 border-white/20 text-white text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {meses.map((mes) => (
              <SelectItem key={mes.value} value={mes.value} className="text-xs">
                {mes.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="text-white/60 text-sm mb-4">
        {filtroMes === "geral" ? "Todas as despesas" : `Mês selecionado`}
      </div>
      
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={120}
            paddingAngle={2}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{
              backgroundColor: 'rgba(0,0,0,0.8)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '8px',
              color: 'white'
            }}
            formatter={(value: number) => [`R$ ${value.toLocaleString('pt-BR')}`, '']}
          />
        </PieChart>
      </ResponsiveContainer>

      <div className="grid grid-cols-2 gap-2 mt-4">
        {data.slice(0, 6).map((item, index) => (
          <div key={item.name} className="flex items-center">
            <div 
              className="w-3 h-3 rounded-full mr-2" 
              style={{ backgroundColor: item.color }}
            />
            <span className="text-white/70 text-sm truncate">
              {item.name}: R$ {item.value.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
