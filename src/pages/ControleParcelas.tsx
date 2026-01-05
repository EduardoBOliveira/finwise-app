import { useState, useEffect } from "react";
import { NavBar } from "@/components/NavBar";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ParcelasFilters } from "@/components/parcelas/ParcelasFilters";
import { ParcelasCardSection } from "@/components/parcelas/ParcelasCardSection";
import { formatDate, getCategoriaIcon } from "@/utils/parcelasUtils";
import { FiltroAno } from "@/components/FiltroAno";
import { Package, Zap, Search, HelpCircle } from "lucide-react";
import { Input } from "@/components/ui/input";

interface Despesa {
  id: string;
  data: string;
  descricao: string;
  valor: number;
  categoria: string;
  modalidade: string;
  cartao_id: string;
  parcelas_total: number;
  parcela_atual: number;
  valor_parcela: number;
  id_compra: string;
  status: string;
  data_compra: string;
  data_pagamento: string;
}

type FiltroStatus = 'TODAS' | 'PENDENTES' | 'PAGAS';

const ControleParcelas = () => {
  const [despesas, setDespesas] = useState<Despesa[]>([]);
  const [todasDespesas, setTodasDespesas] = useState<Despesa[]>([]);
  const [cartoes, setCartoes] = useState<{[key: string]: any}>({});
  const [filtroAtivo, setFiltroAtivo] = useState<FiltroStatus>('TODAS');
  const [isVisible, setIsVisible] = useState(false);
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
  const [parcelasPagas, setParcelasPagas] = useState<{[key: string]: Set<number>}>({});
  const [searchTerm, setSearchTerm] = useState("");
  const currentYear = new Date().getFullYear();
  const [anoSelecionado, setAnoSelecionado] = useState(currentYear.toString());
  const [anosDisponiveis, setAnosDisponiveis] = useState<number[]>([]);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    setIsVisible(true);
    fetchCartoes();
    fetchDespesas();
    fetchAnosDisponiveis();
  }, []);

  useEffect(() => {
    fetchDespesas();
  }, [anoSelecionado]);

  const fetchAnosDisponiveis = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('despesas')
      .select('data_compra')
      .eq('usuario_id', user.id)
      .eq('modalidade', 'Cartão Crédito');

    if (data) {
      const anos = new Set<number>();
      data.forEach(d => {
        if (d.data_compra) anos.add(new Date(d.data_compra).getFullYear());
      });
      setAnosDisponiveis(Array.from(anos).sort((a, b) => b - a));
    }
  };

  const fetchCartoes = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('cartoes')
      .select('*')
      .eq('usuario_id', user.id);

    if (!error && data) {
      const cartoesMap: {[key: string]: any} = {};
      data.forEach(cartao => {
        cartoesMap[cartao.id] = cartao;
      });
      setCartoes(cartoesMap);
    }
  };

  const fetchDespesas = async () => {
    if (!user) return;

    let query = supabase
      .from('despesas')
      .select('*')
      .eq('usuario_id', user.id)
      .eq('modalidade', 'Cartão Crédito')
      .order('data_compra', { ascending: false });

    // Filtrar por ano
    query = query
      .gte('data_compra', `${anoSelecionado}-01-01`)
      .lte('data_compra', `${anoSelecionado}-12-31`);

    const { data, error } = await query;

    if (error) {
      toast({
        title: "Erro",
        description: "Erro ao carregar despesas",
        variant: "destructive",
      });
    } else {
      setTodasDespesas(data || []);
      
      // Agrupar despesas por id_compra
      const grupos: {[key: string]: Despesa} = {};
      
      (data || []).forEach(despesa => {
        if (!grupos[despesa.id_compra]) {
          grupos[despesa.id_compra] = despesa as Despesa;
        }
      });
      
      setDespesas(Object.values(grupos) || []);
      
      // Inicializar o estado das parcelas pagas baseado no status atual
      const parcelasEstado: {[key: string]: Set<number>} = {};
      Object.values(grupos).forEach((despesa: Despesa) => {
        const parcelasPorCompra = (data || []).filter(d => d.id_compra === despesa.id_compra);
        const parcelasPagasSet = new Set<number>();
        parcelasPorCompra.forEach(p => {
          if (p.status === 'Paga') {
            parcelasPagasSet.add(p.parcela_atual);
          }
        });
        parcelasEstado[despesa.id] = parcelasPagasSet;
      });
      setParcelasPagas(parcelasEstado);
    }
  };

  const despesasFiltradas = despesas.filter(despesa => {
    // Filtro por status
    if (filtroAtivo !== 'TODAS') {
      const parcelasDaCompra = todasDespesas.filter(d => d.id_compra === despesa.id_compra);
      const todasPagas = parcelasDaCompra.every(p => p.status === 'Paga');
      
      if (filtroAtivo === 'PAGAS' && !todasPagas) return false;
      if (filtroAtivo === 'PENDENTES' && todasPagas) return false;
    }
    
    // Filtro por busca
    if (searchTerm.trim() !== "") {
      const termo = searchTerm.toLowerCase();
      return despesa.descricao.toLowerCase().includes(termo) ||
             despesa.categoria.toLowerCase().includes(termo) ||
             (cartoes[despesa.cartao_id]?.apelido || '').toLowerCase().includes(termo);
    }
    
    return true;
  });

  // Group expenses by card
  const despesasPorCartao = despesasFiltradas.reduce((acc, despesa) => {
    const cartao = cartoes[despesa.cartao_id];
    const nomeCartao = cartao ? cartao.apelido : 'Cartão não encontrado';
    if (!acc[nomeCartao]) {
      acc[nomeCartao] = [];
    }
    acc[nomeCartao].push(despesa);
    return acc;
  }, {} as Record<string, Despesa[]>);

  const toggleCardExpansion = (despesaId: string) => {
    const newExpanded = new Set(expandedCards);
    if (newExpanded.has(despesaId)) {
      newExpanded.delete(despesaId);
    } else {
      newExpanded.add(despesaId);
    }
    setExpandedCards(newExpanded);
  };

  const toggleParcelaPaga = async (despesa: Despesa, numeroParcela: number) => {
    // Encontrar a parcela específica no banco
    const parcelaEspecifica = todasDespesas.find(d => 
      d.id_compra === despesa.id_compra && d.parcela_atual === numeroParcela
    );
    
    if (!parcelaEspecifica) {
      toast({
        title: "Erro",
        description: "Parcela não encontrada",
        variant: "destructive",
      });
      return;
    }

    const novoStatus = parcelaEspecifica.status === 'Paga' ? 'Pendente' : 'Paga';
    
    // Atualizar o estado local imediatamente
    const parcelasAtuais = parcelasPagas[despesa.id] || new Set();
    const novasParcelasPagas = new Set(parcelasAtuais);
    
    if (novoStatus === 'Paga') {
      novasParcelasPagas.add(numeroParcela);
    } else {
      novasParcelasPagas.delete(numeroParcela);
    }
    
    setParcelasPagas(prev => ({
      ...prev,
      [despesa.id]: novasParcelasPagas
    }));
    
    // Atualizar a parcela específica no banco
    const { error } = await supabase
      .from('despesas')
      .update({ status: novoStatus })
      .eq('id', parcelaEspecifica.id);

    if (error) {
      toast({
        title: "Erro",
        description: "Erro ao atualizar parcela",
        variant: "destructive",
      });
      // Reverter o estado em caso de erro
      setParcelasPagas(prev => ({
        ...prev,
        [despesa.id]: parcelasAtuais
      }));
    } else {
      toast({
        title: "Sucesso",
        description: "Parcela atualizada com sucesso!",
      });
      fetchDespesas();
    }
  };

  return (
    <div className="min-h-screen">
      <NavBar />
      <div className="p-6 space-y-8">
        {/* Header */}
        <div className={`transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-10'}`}>
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-900/50 via-blue-900/50 to-cyan-900/50 p-8 backdrop-blur-xl border border-white/20">
            <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:60px_60px]" />
            <div className="relative flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 backdrop-blur-xl border border-white/20">
                  <Package className="w-10 h-10 text-cyan-400" />
                </div>
                <div>
                  <div className="flex items-center space-x-3 mb-2">
                    <h1 className="text-4xl font-bold">
                      <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                        Controle de Parcelas
                      </span>
                    </h1>
                    <a 
                      href="/ajuda#parcelas" 
                      className="text-white/50 hover:text-white/80 transition-colors"
                      title="Ajuda sobre Controle de Parcelas"
                    >
                      <HelpCircle className="w-5 h-5" />
                    </a>
                    <FiltroAno
                      anos={anosDisponiveis}
                      anoSelecionado={anoSelecionado}
                      onAnoChange={setAnoSelecionado}
                    />
                  </div>
                  <p className="text-white/70 text-lg flex items-center space-x-2">
                    <Zap className="w-5 h-5 text-yellow-400" />
                    <span>Gerencie suas parcelas com inteligência</span>
                  </p>
                </div>
              </div>
              <ParcelasFilters 
                filtroAtivo={filtroAtivo} 
                setFiltroAtivo={setFiltroAtivo} 
              />
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className={`transition-all duration-700 delay-100 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40 w-5 h-5" />
            <Input
              type="text"
              placeholder="Buscar por descrição, categoria ou cartão..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/40 backdrop-blur-sm focus:bg-white/15 transition-all duration-300"
            />
          </div>
        </div>

        {/* Sections by Card */}
        <div className={`transition-all duration-700 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="space-y-8">
            {Object.entries(despesasPorCartao).map(([cartao, despesasDoCartao]) => (
              <ParcelasCardSection
                key={cartao}
                cartao={cartao}
                despesasDoCartao={despesasDoCartao}
                parcelasPagas={parcelasPagas}
                expandedCards={expandedCards}
                onToggleExpansion={toggleCardExpansion}
                onToggleParcelaPaga={toggleParcelaPaga}
                getCategoriaIcon={getCategoriaIcon}
                formatDate={formatDate}
                todasDespesas={todasDespesas}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ControleParcelas;
