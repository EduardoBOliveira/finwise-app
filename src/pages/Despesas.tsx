
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { NavBar } from "@/components/NavBar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormularioDespesa } from "@/components/FormularioDespesa";
import { FiltroAno } from "@/components/FiltroAno";
import { PaginacaoCards } from "@/components/PaginacaoCards";
import { Link } from "react-router-dom";
import { Plus, DollarSign, TrendingDown, Calendar, Tag, FileText, Edit2, Trash2, CreditCard, Banknote, Search, HelpCircle } from "lucide-react";

export default function Despesas() {
  const { user } = useAuth();
  const currentYear = new Date().getFullYear();
  const [despesas, setDespesas] = useState([]);
  const [cartoes, setCartoes] = useState({});
  const [totalDespesas, setTotalDespesas] = useState(0);
  const [maiorDespesa, setMaiorDespesa] = useState(0);
  const [ultimaDespesa, setUltimaDespesa] = useState(0);
  const [categoriaFrequente, setCategoriaFrequente] = useState("N/A");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingDespesa, setEditingDespesa] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [anoSelecionado, setAnoSelecionado] = useState(currentYear.toString());
  const [anosDisponiveis, setAnosDisponiveis] = useState<number[]>([]);
  const [paginaAtual, setPaginaAtual] = useState(1);
  const ITENS_POR_PAGINA = 12;

  // Buscar anos disponíveis
  useEffect(() => {
    const fetchAnosDisponiveis = async () => {
      if (!user) return;

      const { data } = await supabase
        .from('despesas')
        .select('data')
        .eq('usuario_id', user.id);

      if (data) {
        const anos = new Set<number>();
        data.forEach(d => {
          if (d.data) anos.add(new Date(d.data).getFullYear());
        });
        setAnosDisponiveis(Array.from(anos).sort((a, b) => b - a));
      }
    };

    fetchAnosDisponiveis();
  }, [user]);

  const fetchCartoes = async () => {
    if (user) {
      const { data, error } = await supabase
        .from('cartoes')
        .select('*')
        .eq('usuario_id', user.id);

      if (!error && data) {
        const cartoesMap = {};
        data.forEach(cartao => {
          cartoesMap[cartao.id] = cartao;
        });
        setCartoes(cartoesMap);
      }
    }
  };

  const fetchDespesas = async () => {
    if (user) {
      let query = supabase
        .from('despesas')
        .select('*')
        .eq('usuario_id', user.id)
        .order('data', { ascending: false });

      // Filtrar por ano
      query = query
        .gte('data', `${anoSelecionado}-01-01`)
        .lte('data', `${anoSelecionado}-12-31`);

      const { data, error } = await query;

      if (error) {
        console.error("Erro ao buscar despesas:", error);
      } else {
        // Agrupar despesas por id_compra para cartão de crédito
        const despesasAgrupadas = [];
        const grupos = {};
        
        data?.forEach(despesa => {
          if (despesa.modalidade === 'Cartão Crédito' && despesa.id_compra) {
            if (!grupos[despesa.id_compra]) {
              // Buscar a primeira parcela (menor data)
              const parcelasPorCompra = data.filter(d => d.id_compra === despesa.id_compra);
              const primeiraParcela = parcelasPorCompra.sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime())[0];
              
              // Verificar se todas as parcelas estão pagas
              const todasPagas = parcelasPorCompra.every(p => p.status === 'Paga');
              
              grupos[despesa.id_compra] = {
                ...primeiraParcela,
                valor_total: (despesa.valor_parcela || 0) * (despesa.parcelas_total || 1),
                valor_parcela: despesa.valor_parcela,
                parcelas_total: despesa.parcelas_total,
                parcela_atual: despesa.parcela_atual,
                status: todasPagas ? 'Pago' : 'Pendente',
                data: primeiraParcela.data_compra || primeiraParcela.data // Usar data_compra se disponível
              };
            }
          } else {
            despesasAgrupadas.push(despesa);
          }
        });
        
        // Adicionar despesas agrupadas
        Object.values(grupos).forEach(grupo => {
          despesasAgrupadas.push(grupo);
        });
        
        // Ordenar por data decrescente
        despesasAgrupadas.sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());
        
        setDespesas(despesasAgrupadas || []);
        
        if (data && data.length > 0) {
          const total = data.reduce((acc, despesa) => acc + (despesa.valor || 0), 0);
          const maior = Math.max(...data.map(despesa => despesa.valor || 0));
          const ultima = data[0]?.valor || 0;
          
          setTotalDespesas(total);
          setMaiorDespesa(maior);
          setUltimaDespesa(ultima);

          // Calcular categoria mais frequente
          const contadorCategorias = data.reduce((acc, despesa) => {
            const categoria = despesa.categoria || 'Outros';
            acc[categoria] = (acc[categoria] || 0) + 1;
            return acc;
          }, {});

          const categoriaComMaisOcorrencias = Object.entries(contadorCategorias)
            .sort(([,a], [,b]) => (b as number) - (a as number))[0];
          
          setCategoriaFrequente(categoriaComMaisOcorrencias ? categoriaComMaisOcorrencias[0] : "N/A");
        } else {
          setTotalDespesas(0);
          setMaiorDespesa(0);
          setUltimaDespesa(0);
          setCategoriaFrequente("N/A");
        }
      }
    }
  };

  useEffect(() => {
    fetchCartoes();
  }, [user]);

  useEffect(() => {
    fetchDespesas();
  }, [user, anoSelecionado]);

  const handleFormSuccess = () => {
    fetchDespesas();
    setEditingDespesa(null);
  };

  const handleEdit = (despesa) => {
    setEditingDespesa(despesa);
    setIsFormOpen(true);
  };

  const handleDelete = async (despesa) => {
    try {
      if (despesa.modalidade === 'Cartão Crédito' && despesa.id_compra) {
        // Deletar todas as parcelas do mesmo id_compra
        const { error } = await supabase
          .from('despesas')
          .delete()
          .eq('id_compra', despesa.id_compra);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('despesas')
          .delete()
          .eq('id', despesa.id);

        if (error) throw error;
      }
      fetchDespesas();
    } catch (error) {
      console.error('Erro ao excluir despesa:', error);
    }
  };

  const getModalidadeIcon = (modalidade) => {
    switch (modalidade) {
      case 'PIX':
        return <Banknote className="w-4 h-4" />;
      case 'Cartão Débito':
      case 'Cartão Crédito':
        return <CreditCard className="w-4 h-4" />;
      default:
        return <DollarSign className="w-4 h-4" />;
    }
  };

  const getCartaoInfo = (cartaoId) => {
    const cartao = cartoes[cartaoId];
    return cartao ? `${cartao.apelido} (${cartao.bandeira})` : 'Cartão não encontrado';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString + 'T12:00:00-03:00');
    return date.toLocaleDateString('pt-BR', {
      timeZone: 'America/Sao_Paulo'
    });
  };

  // Filtrar despesas baseado na busca
  const filteredDespesas = despesas.filter(despesa =>
    despesa.descricao?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    despesa.categoria?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    despesa.modalidade?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Paginação
  const totalPaginas = Math.ceil(filteredDespesas.length / ITENS_POR_PAGINA);
  const despesasPaginadas = filteredDespesas.slice(
    (paginaAtual - 1) * ITENS_POR_PAGINA,
    paginaAtual * ITENS_POR_PAGINA
  );

  // Resetar página ao buscar
  useEffect(() => {
    setPaginaAtual(1);
  }, [searchTerm, anoSelecionado]);

  return (
    <div className="min-h-screen">
      <NavBar />
      <div className="p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <h1 className="finwise-page-title">Despesas</h1>
              <a 
                href="/ajuda#despesas" 
                className="text-white/50 hover:text-white/80 transition-colors"
                title="Ajuda sobre Despesas"
              >
                <HelpCircle className="w-5 h-5" />
              </a>
              <FiltroAno
                anos={anosDisponiveis}
                anoSelecionado={anoSelecionado}
                onAnoChange={setAnoSelecionado}
              />
            </div>
            <p className="finwise-page-subtitle">Controle seus gastos e despesas</p>
          </div>
          <div className="flex items-center space-x-4">
            <Link to="/controle-parcelas">
              <Button variant="outline" className="border-white/20 text-white hover:bg-white/5 bg-white/5">
                <FileText className="w-4 h-4 mr-2" />
                Controle de Parcelas
              </Button>
            </Link>
            <Button 
              onClick={() => {
                setEditingDespesa(null);
                setIsFormOpen(true);
              }}
              className="finwise-red-button"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nova Despesa
            </Button>
          </div>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Despesas */}
          <div className="finwise-glass-card">
            <div className="flex items-center justify-between mb-4">
              <div className="finwise-icon-container finwise-icon-red">
                <DollarSign className="w-6 h-6" />
              </div>
            </div>
            <h3 className="finwise-card-title">Total Despesas</h3>
            <p className="finwise-value-text finwise-text-red">
              R$ {totalDespesas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>

          {/* Maior Despesa */}
          <div className="finwise-glass-card">
            <div className="flex items-center justify-between mb-4">
              <div className="finwise-icon-container finwise-icon-yellow">
                <TrendingDown className="w-6 h-6" />
              </div>
            </div>
            <h3 className="finwise-card-title">Maior Despesa</h3>
            <p className="finwise-value-text finwise-text-red">
              R$ {maiorDespesa.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>

          {/* Última Despesa */}
          <div className="finwise-glass-card">
            <div className="flex items-center justify-between mb-4">
              <div className="finwise-icon-container finwise-icon-purple">
                <Calendar className="w-6 h-6" />
              </div>
            </div>
            <h3 className="finwise-card-title">Última Despesa</h3>
            <p className="finwise-value-text finwise-text-red">
              R$ {ultimaDespesa.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>

          {/* Categoria Frequente */}
          <div className="finwise-glass-card">
            <div className="flex items-center justify-between mb-4">
              <div className="finwise-icon-container finwise-icon-blue">
                <Tag className="w-6 h-6" />
              </div>
            </div>
            <h3 className="finwise-card-title">Categoria Frequente</h3>
            <p className="finwise-value-text">
              {categoriaFrequente}
            </p>
          </div>
        </div>

        {/* Lista de Despesas */}
        <div className="finwise-glass-card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-white">Lista de Despesas</h3>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40 w-4 h-4" />
              <Input
                placeholder="Buscar despesas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white/5 border-white/20 text-white placeholder:text-white/40 w-64"
              />
            </div>
          </div>
          {filteredDespesas.length === 0 ? (
            <div className="finwise-empty-state">
              <div className="finwise-empty-icon">
                <TrendingDown className="w-16 h-16 text-white/20" />
              </div>
              <p className="finwise-empty-text">
                {searchTerm ? "Nenhuma despesa encontrada" : "Nenhuma despesa cadastrada"}
              </p>
              <p className="finwise-empty-subtext">
                {searchTerm ? "Tente ajustar os termos de busca" : "Clique em \"Nova Despesa\" para começar"}
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {despesasPaginadas.map((despesa) => (
                  <div key={despesa.id} className="finwise-glass-card relative">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-white font-medium">{despesa.descricao}</h4>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(despesa)}
                          className="p-1 text-blue-400 hover:text-blue-300 transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(despesa)}
                          className="p-1 text-red-400 hover:text-red-300 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="mb-2">
                      <span className="finwise-text-red font-bold text-lg">
                        R$ {(despesa.modalidade === 'Cartão Crédito' ? despesa.valor_total : despesa.valor)?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="text-white/70 text-sm space-y-1">
                      <div className="flex items-center space-x-2">
                        {getModalidadeIcon(despesa.modalidade)}
                        <span>Modalidade: {despesa.modalidade}</span>
                      </div>
                      {despesa.cartao_id && (
                        <div className="flex items-center space-x-2">
                          <CreditCard className="w-4 h-4" />
                          <span>Cartão: {getCartaoInfo(despesa.cartao_id)}</span>
                        </div>
                      )}
                      <p>Categoria: {despesa.categoria}</p>
                      <p>Data: {formatDate(despesa.data)}</p>
                      {despesa.parcelas_total && despesa.parcelas_total > 1 && (
                        <p>Parcelas: {despesa.parcelas_total}x de R$ {despesa.valor_parcela?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                      )}
                      {despesa.modalidade === 'Cartão Crédito' && (
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 rounded text-xs ${
                            despesa.status === 'Pago' ? 'bg-green-600' : 'bg-yellow-600'
                          }`}>
                            {despesa.status || 'Pendente'}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <PaginacaoCards
                paginaAtual={paginaAtual}
                totalPaginas={totalPaginas}
                onPaginaChange={setPaginaAtual}
                totalItens={filteredDespesas.length}
                itensPorPagina={ITENS_POR_PAGINA}
              />
            </>
          )}
        </div>
      </div>

      <FormularioDespesa
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSuccess={handleFormSuccess}
        editingDespesa={editingDespesa}
      />
    </div>
  );
}
