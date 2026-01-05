
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { X } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface CategoriaRanking {
  categoria: string;
  total: number;
  quantidade: number;
  porcentagem: number;
}

interface Despesa {
  descricao: string;
  valor: number;
  data: string;
  modalidade: string;
  parcelas_total: number;
  parcela_atual: number;
  bandeira: string;
  valor_total: number;
}

interface RankingGastosProps {
  anoSelecionado?: string;
}

export function RankingGastos({ anoSelecionado }: RankingGastosProps) {
  const { user } = useAuth();
  const [ranking, setRanking] = useState<CategoriaRanking[]>([]);
  const [selectedCategoria, setSelectedCategoria] = useState<string | null>(null);
  const [despesasCategoria, setDespesasCategoria] = useState<Despesa[]>([]);
  const [totalGeral, setTotalGeral] = useState(0);
  const [filtroMes, setFiltroMes] = useState<string>("geral");
  const [filtroCategoria, setFiltroCategoria] = useState<string>("geral");
  
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

  const categorias = [
    { value: "geral", label: "Todas" },
    { value: "Alimentação", label: "Alimentação" },
    { value: "Transporte", label: "Transporte" },
    { value: "Saúde", label: "Saúde" },
    { value: "Educação", label: "Educação" },
    { value: "Lazer", label: "Lazer" },
    { value: "Presente", label: "Presente" },
    { value: "Eletrônicos", label: "Eletrônicos" },
    { value: "Vestuário", label: "Vestuário" },
    { value: "Streaming", label: "Streaming" },
    { value: "Contas", label: "Contas" },
    { value: "Outros", label: "Outros" }
  ];

  useEffect(() => {
    const fetchRanking = async () => {
      if (!user) return;

      let query = supabase
        .from('despesas')
        .select('categoria, valor, parcelas_total, id_compra, descricao')
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

      if (filtroCategoria !== "geral") {
        query = query.eq('categoria', filtroCategoria);
      }

      const { data: despesas } = await query;

      if (!despesas) return;

      // Agrupar por categoria
      const categorias = despesas.reduce((acc, despesa) => {
        const cat = despesa.categoria || 'Outros';
        if (!acc[cat]) {
          acc[cat] = { total: 0, quantidade: 0, comprasUnicas: new Set() };
        }
        
        const compraId = despesa.id_compra || `${despesa.descricao}-${despesa.valor}`;
        
        // Para filtro geral: contar cada compra apenas uma vez
        if (filtroMes === "geral") {
          if (!acc[cat].comprasUnicas.has(compraId)) {
            acc[cat].comprasUnicas.add(compraId);
            acc[cat].total += (despesa.valor || 0) * (despesa.parcelas_total || 1);
            acc[cat].quantidade += 1;
          }
        } else {
          // Para filtro mensal: usar apenas o valor da parcela
          acc[cat].total += despesa.valor || 0;
          acc[cat].quantidade += 1;
        }
        
        return acc;
      }, {} as Record<string, { total: number; quantidade: number; comprasUnicas: Set<string> }>);

      const total = Object.values(categorias).reduce((sum, cat) => sum + cat.total, 0);
      setTotalGeral(total);

      const rankingArray = Object.entries(categorias)
        .map(([categoria, dados]) => ({
          categoria,
          total: dados.total,
          quantidade: dados.quantidade,
          porcentagem: total > 0 ? (dados.total / total) * 100 : 0
        }))
        .sort((a, b) => b.total - a.total);

      setRanking(rankingArray);
    };

    fetchRanking();
  }, [user, filtroMes, filtroCategoria, anoParaFiltro]);

  const handleCategoriaClick = async (categoria: string) => {
    if (!user) return;

    let query = supabase
      .from('despesas')
      .select('descricao, valor, data_pagamento, modalidade, parcelas_total, parcela_atual, bandeira, id_compra')
      .eq('usuario_id', user.id)
      .eq('categoria', categoria);

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

    // Agrupar por id_compra para mostrar apenas uma despesa por compra
    const despesasAgrupadas = despesas.reduce((acc, despesa) => {
      const compraId = despesa.id_compra || `${despesa.descricao}-${despesa.valor}`;
      if (!acc[compraId]) {
        // Ajustar valor conforme filtro
        const valorExibido = filtroMes === "geral" 
          ? (despesa.valor || 0) * (despesa.parcelas_total || 1) // Valor total se filtro geral
          : (despesa.valor || 0); // Valor da parcela se filtro mensal
          
        acc[compraId] = {
          descricao: despesa.descricao || '',
          valor: despesa.valor || 0,
          data: despesa.data_pagamento || '',
          modalidade: despesa.modalidade || '',
          parcelas_total: despesa.parcelas_total || 1,
          parcela_atual: despesa.parcela_atual || 1,
          bandeira: despesa.bandeira || '',
          valor_total: valorExibido
        };
      }
      return acc;
    }, {} as Record<string, Despesa>);

    const despesasFormatadas = Object.values(despesasAgrupadas)
      .sort((a, b) => b.valor_total - a.valor_total);

    setDespesasCategoria(despesasFormatadas);
    setSelectedCategoria(categoria);
  };

  const getCategoriaIcon = (categoria: string) => {
    const icons: Record<string, string> = {
      'Alimentação': '🍽️',
      'Transporte': '🚗',
      'Saúde': '🏥',
      'Entretenimento': '🎮',
      'Compras': '🛍️',
      'Moradia': '🏠'
    };
    return icons[categoria] || '📊';
  };

  const getCategoriaColor = (index: number) => {
    const colors = [
      'finwise-icon-orange',
      'finwise-icon-red', 
      'finwise-icon-purple',
      'finwise-icon-blue',
      'finwise-icon-green'
    ];
    return colors[index % colors.length];
  };

  const getRankingNumberStyle = (index: number) => {
    if (index === 0) return "bg-gradient-to-r from-yellow-400 to-yellow-600 text-yellow-900"; // Ouro
    if (index === 1) return "bg-gradient-to-r from-gray-300 to-gray-500 text-gray-800"; // Prata
    if (index === 2) return "bg-gradient-to-r from-orange-400 to-orange-600 text-orange-900"; // Bronze
    return "bg-gray-500/20 text-gray-300"; // Neutro
  };

  return (
    <>
      <div className="finwise-glass-card h-full hover:shadow-lg hover:shadow-yellow-500/10 transition-all duration-300">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <div className="finwise-icon-container finwise-icon-yellow mr-3">
              🏆
            </div>
            <h3 className="text-white text-xl font-bold">Ranking de Gastos</h3>
          </div>
          <div className="flex gap-2">
            <Select value={filtroCategoria} onValueChange={setFiltroCategoria}>
              <SelectTrigger className="w-32 h-8 bg-white/10 border-white/20 text-white text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categorias.map((categoria) => (
                  <SelectItem key={categoria.value} value={categoria.value} className="text-xs">
                    {categoria.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
        </div>

        <div className="space-y-4">
          {ranking.slice(0, 5).map((item, index) => (
            <div 
              key={item.categoria}
              className="flex items-center justify-between p-3 bg-white/5 rounded-lg cursor-pointer hover:bg-white/10 transition-colors"
              onClick={() => handleCategoriaClick(item.categoria)}
            >
              <div className="flex items-center">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold mr-3 ${getRankingNumberStyle(index)}`}>
                  {index + 1}
                </div>
                <div className={`finwise-icon-container ${getCategoriaColor(index)} mr-3`}>
                  {getCategoriaIcon(item.categoria)}
                </div>
                <div>
                  <p className="text-white font-medium">{item.categoria}</p>
                  <p className="text-white/60 text-sm">
                    {item.porcentagem.toFixed(0)}% do total • {item.quantidade} transações
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-white font-bold">
                  R$ {item.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedCategoria && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-900 p-6 rounded-lg w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-white text-xl font-bold">
                Gastos em {selectedCategoria}
              </h3>
              <button 
                onClick={() => setSelectedCategoria(null)}
                className="text-white/70 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-3">
              {despesasCategoria.map((despesa, index) => (
                <div key={index} className="finwise-glass-card">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-white font-medium">{despesa.descricao}</p>
                      <div className="flex items-center space-x-4 text-white/60 text-sm">
                        <span>{new Date(despesa.data).toLocaleDateString('pt-BR')}</span>
                        <span className="px-2 py-1 bg-white/10 rounded">{despesa.modalidade}</span>
                        {despesa.parcelas_total > 1 && (
                          <span className="px-2 py-1 bg-purple-500/20 rounded">
                            {despesa.parcelas_total}x no {despesa.bandeira}
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="text-white font-bold text-lg">
                      R$ {despesa.valor_total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
