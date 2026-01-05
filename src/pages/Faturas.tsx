
import { useState, useEffect } from "react";
import { CreditCard, Filter, BarChart3, HelpCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { NavBar } from "@/components/NavBar";
import { FiltroAno } from "@/components/FiltroAno";
import { useCartaoLimite } from "@/hooks/useCartaoLimite";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from "recharts";

interface Cartao {
  id: string;
  apelido: string;
  bandeira: string;
  fechamento_fatura: number;
  vencimento_fatura: number;
  limite_total: number;
}

interface FaturaDados {
  cartao: Cartao;
  totalGasto: number;
  mediaMemsal: number;
  totalPendente: number;
  gastosPorMes: Record<string, number>;
  lancamentos: Array<{
    id: string;
    descricao: string;
    parcela_atual: number;
    parcelas_total: number;
    valor_parcela: number;
    data_pagamento: string; // data de pagamento da parcela
    data_compra: string; // data da compra original
    status: string;
  }>;
}

const Faturas = () => {
  const [faturas, setFaturas] = useState<Record<string, FaturaDados>>({});
  const [cartaoAtivo, setCartaoAtivo] = useState<string>('');
  const [cartoes, setCartoes] = useState<Cartao[]>([]);
  const [isVisible, setIsVisible] = useState(false);
  const [mesSelecionado, setMesSelecionado] = useState<string>(new Date().getMonth().toString());
  const [nomeUsuario, setNomeUsuario] = useState<string>('');
  const currentYear = new Date().getFullYear();
  const [anoSelecionado, setAnoSelecionado] = useState(currentYear.toString());
  const [anosDisponiveis, setAnosDisponiveis] = useState<number[]>([]);
  const { user } = useAuth();
  const { toast } = useToast();
  const { limitesCartoes } = useCartaoLimite();

  useEffect(() => {
    setIsVisible(true);
    fetchCartoes();
    fetchNomeUsuario();
    fetchAnosDisponiveis();
  }, []);

  useEffect(() => {
    if (cartoes.length > 0) {
      fetchFaturas();
    }
  }, [cartoes, anoSelecionado]);

  const fetchAnosDisponiveis = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('despesas')
      .select('data_pagamento')
      .eq('usuario_id', user.id)
      .eq('modalidade', 'Cartão Crédito');

    if (data) {
      const anos = new Set<number>();
      data.forEach(d => {
        if (d.data_pagamento) anos.add(new Date(d.data_pagamento).getFullYear());
      });
      setAnosDisponiveis(Array.from(anos).sort((a, b) => b - a));
    }
  };

  const fetchNomeUsuario = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('profiles')
      .select('nome, sobrenome')
      .eq('id', user.id)
      .single();

    if (!error && data) {
      const nomeCompleto = `${data.nome || ''} ${data.sobrenome || ''}`.trim();
      setNomeUsuario(nomeCompleto || user.email?.split('@')[0] || 'USUÁRIO');
    } else {
      setNomeUsuario(user.email?.split('@')[0] || 'USUÁRIO');
    }
  };

  const fetchCartoes = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('cartoes')
      .select('*')
      .eq('usuario_id', user.id)
      .order('apelido', { ascending: true });

    if (error) {
      toast({
        title: "Erro",
        description: "Erro ao carregar cartões",
        variant: "destructive",
      });
      return;
    }

    setCartoes(data || []);
    if (data && data.length > 0 && !cartaoAtivo) {
      setCartaoAtivo(data[0].id);
    }
  };

  const fetchFaturas = async () => {
    if (!user || cartoes.length === 0) return;

    let query = supabase
      .from('despesas')
      .select('*')
      .eq('usuario_id', user.id)
      .eq('modalidade', 'Cartão Crédito')
      .order('data_pagamento', { ascending: false });

    // Filtrar por ano
    query = query
      .gte('data_pagamento', `${anoSelecionado}-01-01`)
      .lte('data_pagamento', `${anoSelecionado}-12-31`);

    const { data, error } = await query;

    if (error) {
      toast({
        title: "Erro",
        description: "Erro ao carregar faturas",
        variant: "destructive",
      });
      return;
    }

    const faturasPorCartao: Record<string, FaturaDados> = {};

    // Agrupar por cartão usando cartao_id
    data?.forEach(despesa => {
      const cartao = cartoes.find(c => c.id === despesa.cartao_id);
      if (!cartao) return;

      if (!faturasPorCartao[cartao.id]) {
        faturasPorCartao[cartao.id] = {
          cartao: cartao,
          totalGasto: 0,
          mediaMemsal: 0,
          totalPendente: 0,
          gastosPorMes: {},
          lancamentos: []
        };
      }

      const fatura = faturasPorCartao[cartao.id];
      fatura.totalGasto += despesa.valor_parcela;
      
      if (despesa.status === 'Pendente') {
        fatura.totalPendente += despesa.valor_parcela;
      }

      // Usar data_pagamento para o gráfico mensal
      const dataPagamento = despesa.data_pagamento || despesa.data;
      const dataLancamento = new Date(dataPagamento + 'T12:00:00-03:00');
      const mesAno = `${dataLancamento.getMonth()}`;
      fatura.gastosPorMes[mesAno] = (fatura.gastosPorMes[mesAno] || 0) + despesa.valor_parcela;

      fatura.lancamentos.push({
        id: despesa.id,
        descricao: despesa.descricao,
        parcela_atual: despesa.parcela_atual,
        parcelas_total: despesa.parcelas_total,
        valor_parcela: despesa.valor_parcela,
        data_pagamento: despesa.data_pagamento || despesa.data, // data de pagamento
        data_compra: despesa.data_compra || despesa.data, // data da compra original
        status: despesa.status
      });
    });

    // Calcular média mensal
    Object.values(faturasPorCartao).forEach(fatura => {
      const meses = Object.keys(fatura.gastosPorMes).length;
      fatura.mediaMemsal = meses > 0 ? fatura.totalGasto / meses : 0;
    });

    setFaturas(faturasPorCartao);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString + 'T12:00:00-03:00');
    return date.toLocaleDateString('pt-BR', {
      timeZone: 'America/Sao_Paulo'
    });
  };

  const faturaAtiva = faturas[cartaoAtivo];
  const limiteAtivo = limitesCartoes[cartaoAtivo];
  const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  const mesAtual = new Date().getMonth();
  
  // Filtrar lançamentos pelo mês selecionado, usando data_pagamento
  const lancamentosMesAtual = faturaAtiva?.lancamentos.filter(l => {
    const dataPagamento = new Date(l.data_pagamento + 'T12:00:00-03:00');
    const mesFiltro = parseInt(mesSelecionado);
    const agora = new Date();
    return dataPagamento.getMonth() === mesFiltro && 
           dataPagamento.getFullYear() === agora.getFullYear();
  }) || [];

  // Preparar dados para gráfico em formato adequado para Recharts
  const prepararDadosGrafico = () => {
    if (!faturaAtiva) return [];
    
    return meses.map((mes, index) => {
      const valor = faturaAtiva.gastosPorMes[index.toString()] || 0;
      return {
        name: mes,
        valor: valor,
        isCurrentMonth: index === mesAtual
      };
    });
  };

  const dadosGrafico = prepararDadosGrafico();
  const maxValor = Math.max(...dadosGrafico.map(d => d.valor), 1);

  return (
    <div className="min-h-screen">
      <NavBar />
      <div className="p-6 space-y-8">
        {/* Header */}
        <div className={`transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-10'}`}>
          <div className="flex justify-between items-center">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <h1 className="text-4xl font-bold">
                  <span className="bg-finwise-gradient bg-clip-text text-transparent">Faturas</span>
                </h1>
                <a 
                  href="/ajuda#faturas" 
                  className="text-white/50 hover:text-white/80 transition-colors"
                  title="Ajuda sobre Faturas"
                >
                  <HelpCircle className="w-5 h-5" />
                </a>
                <FiltroAno
                  anos={anosDisponiveis}
                  anoSelecionado={anoSelecionado}
                  onAnoChange={setAnoSelecionado}
                />
              </div>
              <p className="text-white/70 text-lg">Visualize suas faturas de cartão de crédito</p>
            </div>
            
            {cartoes.length > 0 && (
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-white/60" />
                <Select value={cartaoAtivo} onValueChange={setCartaoAtivo}>
                  <SelectTrigger className="bg-white/10 border-white/20 text-white w-48 backdrop-blur-sm">
                    <SelectValue placeholder="Selecione o cartão" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800/95 border-white/20 text-white backdrop-blur-sm">
                    {cartoes.map(cartao => (
                      <SelectItem key={cartao.id} value={cartao.id}>
                        {cartao.apelido} - {cartao.bandeira}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </div>

        {faturaAtiva && (
          <>
            {/* Cartão e Estatísticas */}
            <div className={`grid grid-cols-1 lg:grid-cols-3 gap-8 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              {/* Cartão Visual Melhorado com Nome do Usuário e Limite */}
              <Card className="bg-gradient-to-br from-purple-600/30 to-blue-600/20 border-white/20 backdrop-blur-sm relative overflow-hidden">
                <CardContent className="p-8">
                  <div className="flex justify-between items-start mb-8">
                    <div>
                      <div className="text-white/60 text-sm mb-1">{faturaAtiva.cartao.bandeira}</div>
                      <div className="text-white text-xl font-bold">{faturaAtiva.cartao.apelido}</div>
                    </div>
                    <CreditCard className="w-8 h-8 text-white/60" />
                  </div>
                  
                  <div className="space-y-4">
                    <div className="text-white/60 text-sm font-mono">•••• •••• •••• 1234</div>
                    <div>
                      <div className="text-white/60 text-xs">Nome do Portador</div>
                      <div className="text-white font-medium">{nomeUsuario.toUpperCase()}</div>
                    </div>
                    
                    {/* Informações do Limite */}
                    {limiteAtivo && limiteAtivo.limiteTotal > 0 && (
                      <div className="space-y-3 mt-6">
                        <div>
                          <div className="text-white/60 text-xs mb-2">Limite do Cartão</div>
                          <Progress 
                            value={limiteAtivo.percentualUso} 
                            className="h-2 bg-white/20"
                          />
                          <div className="flex justify-between text-xs text-white/70 mt-1">
                            <span>Usado: R$ {limiteAtivo.limiteEmUso.toFixed(2)}</span>
                            <span>Limite: R$ {limiteAtivo.limiteTotal.toFixed(2)}</span>
                          </div>
                          <div className="text-white/80 text-sm mt-1">
                            Disponível: R$ {limiteAtivo.limiteDisponivel.toFixed(2)}
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div className="grid grid-cols-2 gap-4 mt-6">
                      <div>
                        <div className="text-white/60 text-xs">Fechamento</div>
                        <div className="text-white font-medium">Dia {faturaAtiva.cartao.fechamento_fatura}</div>
                      </div>
                      <div>
                        <div className="text-white/60 text-xs">Vencimento</div>
                        <div className="text-white font-medium">Dia {faturaAtiva.cartao.vencimento_fatura}</div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Efeito visual do cartão */}
                  <div className="absolute top-4 right-4 w-12 h-8 bg-gradient-to-r from-yellow-400/40 to-orange-400/40 rounded-md"></div>
                  <div className="absolute bottom-4 left-4 w-8 h-6 bg-white/10 rounded-sm"></div>
                </CardContent>
              </Card>

              {/* Estatísticas */}
              <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-white/10 border-white/20 bg-gradient-to-br from-purple-500/10 to-purple-600/5 backdrop-blur-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-white/80">Gasto Total</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-white">
                      R$ {faturaAtiva.totalGasto.toFixed(2)}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white/10 border-white/20 bg-gradient-to-br from-blue-500/10 to-blue-600/5 backdrop-blur-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-white/80">Média Mensal</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-white">
                      R$ {faturaAtiva.mediaMemsal.toFixed(2)}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white/10 border-white/20 bg-gradient-to-br from-pink-500/10 to-pink-600/5 backdrop-blur-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-white/80">Total Pendente</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-white">
                      R$ {faturaAtiva.totalPendente.toFixed(2)}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Gráfico de Barras com Recharts - Corrigido */}
            <Card className={`bg-white/10 border-white/20 backdrop-blur-sm transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Gastos por Mês (Data de Pagamento)
                </CardTitle>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dadosGrafico} margin={{ top: 20, right: 10, left: 10, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                    <XAxis 
                      dataKey="name" 
                      tick={{ fill: '#fff', fontSize: 12 }}
                      axisLine={{ stroke: '#333' }}
                    />
                    <YAxis 
                      tick={{ fill: '#fff', fontSize: 12 }}
                      axisLine={{ stroke: '#333' }}
                      width={40}
                    />
                    <Tooltip
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          const value = payload[0].value;
                          return (
                            <div className="bg-gray-800 border border-gray-700 p-2 rounded-md">
                              <p className="text-white font-medium">{`${label}`}</p>
                              <p className="text-white text-sm">{`R$ ${typeof value === 'number' ? value.toFixed(2) : '0.00'}`}</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar 
                      dataKey="valor" 
                      radius={[4, 4, 0, 0]}
                      label={{
                        position: 'top',
                        fill: '#fff',
                        fontSize: 11,
                        formatter: (value: number) => value > 0 ? `R$ ${value.toFixed(0)}` : '',
                      }}
                    >
                      {dadosGrafico.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.isCurrentMonth ? "#A855F7" : "#8884d8"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Lançamentos com exibição clara de data de compra e data de pagamento */}
            <Card className={`bg-white/10 border-white/20 backdrop-blur-sm transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-white">Lançamentos</CardTitle>
                  <Select value={mesSelecionado} onValueChange={setMesSelecionado}>
                    <SelectTrigger className="bg-white/10 border-white/20 text-white w-48 backdrop-blur-sm">
                      <SelectValue placeholder="Selecione o mês" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800/95 border-white/20 text-white backdrop-blur-sm">
                      {meses.map((mes, index) => (
                        <SelectItem key={index} value={index.toString()}>{mes}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {lancamentosMesAtual.map((lancamento) => (
                    <div 
                      key={lancamento.id}
                      className={`
                        flex items-center justify-between p-4 rounded-xl transition-all duration-300 backdrop-blur-sm
                        ${lancamento.status === 'Paga' 
                          ? 'bg-purple-500/10 border border-purple-500/20' 
                          : 'bg-pink-500/10 border border-pink-500/20'
                        }
                      `}
                    >
                      <div className="flex items-center gap-4">
                        <div className="text-2xl">💳</div>
                        <div>
                          <div className="text-white font-medium">
                            {lancamento.descricao} {lancamento.parcela_atual}/{lancamento.parcelas_total}
                          </div>
                          <div className="text-white/60 text-sm">
                            <span className="inline-block">Compra: {formatDate(lancamento.data_compra)}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-white font-bold">
                          R$ {lancamento.valor_parcela.toFixed(2)}
                        </div>
                        <div className="text-white/60 text-xs mb-1">
                          <span className="inline-block">Pagamento: {formatDate(lancamento.data_pagamento)}</span>
                        </div>
                        <div className={`text-sm font-medium ${
                          lancamento.status === 'Paga' ? 'text-purple-400' : 'text-pink-400'
                        }`}>
                          {lancamento.status || 'Pendente'}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {lancamentosMesAtual.length === 0 && (
                    <div className="text-center text-white/60 py-8">
                      <p>Nenhum lançamento neste mês</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {Object.keys(faturas).length === 0 && (
          <div className="text-center text-white/60 py-12">
            <CreditCard className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg">Nenhuma fatura encontrada</p>
            <p className="text-sm">Adicione despesas no cartão de crédito para vê-las aqui</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Faturas;
