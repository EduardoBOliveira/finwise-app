
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ValeCardProps {
  tipo: 'VR' | 'VA';
  titulo: string;
  icon: React.ReactNode;
  anoSelecionado?: string;
}

export function ValeCard({ tipo, titulo, icon, anoSelecionado }: ValeCardProps) {
  const { user } = useAuth();
  const [saldoDisponivel, setSaldoDisponivel] = useState(0);
  const [totalGasto, setTotalGasto] = useState(0);
  
  // Definir mês atual como padrão
  const mesAtual = new Date().getMonth() + 1;
  const [filtroMes, setFiltroMes] = useState<string>(mesAtual.toString());
  
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

  useEffect(() => {
    const fetchDados = async () => {
      if (!user) return;

      // Buscar ambos os totais dos totais financeiros
      const { data: totaisData } = await supabase
        .from('totais_financeiros')
        .select('total_vr, total_va')
        .eq('usuario_id', user.id)
        .single();

      const totalDisponivel = totaisData ? (tipo === 'VR' ? totaisData.total_vr : totaisData.total_va) : 0;

      // Buscar gastos conforme filtro
      let query = supabase
        .from('vr_va')
        .select('valor')
        .eq('usuario_id', user.id)
        .eq('tipo', tipo)
        .eq('movimentacao', 'saida');

      // Aplicar filtro de ano se não for "all"
      if (anoSelecionado && anoSelecionado !== 'all') {
        query = query
          .gte('data', `${anoParaFiltro}-01-01`)
          .lte('data', `${anoParaFiltro}-12-31`);
      }

      if (filtroMes !== "geral") {
        const mesAtual = parseInt(filtroMes);
        query = query
          .gte('data', `${anoParaFiltro}-${mesAtual.toString().padStart(2, '0')}-01`)
          .lt('data', `${anoParaFiltro}-${(mesAtual + 1).toString().padStart(2, '0')}-01`);
      }

      const { data: gastosData } = await query;
      const totalGastoCalculado = gastosData?.reduce((acc, gasto) => acc + (gasto.valor || 0), 0) || 0;
      
      setSaldoDisponivel(totalDisponivel || 0);
      setTotalGasto(totalGastoCalculado);
    };

    fetchDados();
  }, [user, tipo, filtroMes, anoParaFiltro]);

  const porcentagemUtilizada = saldoDisponivel > 0 ? (totalGasto / saldoDisponivel) * 100 : 0;

  return (
    <div className="finwise-glass-card hover:shadow-lg hover:shadow-purple-500/10 transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <div className="finwise-icon-container finwise-icon-green mr-3">
            {icon}
          </div>
          <h3 className="text-white font-semibold">{titulo}</h3>
        </div>
        <Select value={filtroMes} onValueChange={setFiltroMes}>
          <SelectTrigger className="w-28 h-8 bg-white/10 border-white/20 text-white text-xs">
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
      
      <div className="space-y-3">
        <div>
          <p className="text-white/70 text-sm">Saldo Disponível</p>
          <p className="text-white text-xl font-bold">
            R$ {saldoDisponivel.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </div>
        
        <div>
          <p className="text-white/70 text-sm">Usado {filtroMes === "geral" ? "no total" : "este mês"}</p>
          <p className="text-white text-lg">
            R$ {totalGasto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </div>
        
        <div>
          <div className="flex justify-between text-sm text-white/70 mb-1">
            <span>Utilização {filtroMes === "geral" ? "total" : "mensal"}</span>
            <span>{porcentagemUtilizada.toFixed(0)}%</span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(porcentagemUtilizada, 100)}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
