
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ChartData {
  mes: string;
  receitas: number;
  despesas: number;
}

interface ReceitasDespesasChartProps {
  anoSelecionado?: string;
}

export function ReceitasDespesasChart({ anoSelecionado }: ReceitasDespesasChartProps) {
  const { user } = useAuth();
  const [chartData, setChartData] = useState<ChartData[]>([]);
  
  // Definir semestre atual como padrão
  const mesAtual = new Date().getMonth() + 1;
  const semestreAtual = mesAtual <= 6 ? "1" : "2";
  const [filtroMes, setFiltroMes] = useState<string>(semestreAtual);
  
  // Usar ano selecionado ou ano atual
  const anoParaFiltro = anoSelecionado && anoSelecionado !== 'all' ? parseInt(anoSelecionado) : new Date().getFullYear();

  // Filtros semestrais
  const semestres = [
    { value: "1", label: "1º Semestre" },
    { value: "2", label: "2º Semestre" }
  ];

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      const mesesNomes = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];
      const data: ChartData[] = [];

      let mesesParaMostrar: number[] = [];
      
      if (filtroMes === "1") {
        mesesParaMostrar = [1, 2, 3, 4, 5, 6]; // 1º semestre
      } else if (filtroMes === "2") {
        mesesParaMostrar = [7, 8, 9, 10, 11, 12]; // 2º semestre
      }

      for (const mesNum of mesesParaMostrar) {
        // Buscar receitas do mês
        const { data: receitasData } = await supabase
          .from('receitas')
          .select('valor')
          .eq('usuario_id', user.id)
          .gte('data', `${anoParaFiltro}-${mesNum.toString().padStart(2, '0')}-01`)
          .lt('data', `${anoParaFiltro}-${(mesNum + 1).toString().padStart(2, '0')}-01`);

        // Buscar despesas do mês
        const { data: despesasData } = await supabase
          .from('despesas')
          .select('valor')
          .eq('usuario_id', user.id)
          .gte('data_pagamento', `${anoParaFiltro}-${mesNum.toString().padStart(2, '0')}-01`)
          .lt('data_pagamento', `${anoParaFiltro}-${(mesNum + 1).toString().padStart(2, '0')}-01`);

        const totalReceitas = receitasData?.reduce((acc, r) => acc + (r.valor || 0), 0) || 0;
        const totalDespesas = despesasData?.reduce((acc, d) => acc + (d.valor || 0), 0) || 0;

        data.push({
          mes: mesesNomes[mesNum - 1],
          receitas: totalReceitas,
          despesas: totalDespesas
        });
      }

      setChartData(data);
    };

    fetchData();
  }, [user, filtroMes, anoParaFiltro]);

  return (
    <div className="finwise-glass-card hover:shadow-lg hover:shadow-green-500/10 transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white text-xl font-bold">Receitas vs Despesas</h3>
        <Select value={filtroMes} onValueChange={setFiltroMes}>
          <SelectTrigger className="w-32 h-8 bg-white/10 border-white/20 text-white text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {semestres.map((semestre) => (
              <SelectItem key={semestre.value} value={semestre.value} className="text-xs">
                {semestre.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="text-white/60 text-sm mb-4">
        {filtroMes}º Semestre
      </div>
      
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis 
            dataKey="mes" 
            axisLine={false}
            tickLine={false}
            tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 12 }}
          />
          <YAxis 
            axisLine={false}
            tickLine={false}
            tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 12 }}
            tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: 'rgba(0,0,0,0.8)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '8px',
              color: 'white'
            }}
            formatter={(value: number) => [`R$ ${value.toLocaleString('pt-BR')}`, '']}
          />
          <Line 
            type="monotone" 
            dataKey="receitas" 
            stroke="#10B981" 
            strokeWidth={3}
            name="Receitas"
            dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
          />
          <Line 
            type="monotone" 
            dataKey="despesas" 
            stroke="#EF4444" 
            strokeWidth={3}
            name="Despesas"
            dot={{ fill: '#EF4444', strokeWidth: 2, r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
