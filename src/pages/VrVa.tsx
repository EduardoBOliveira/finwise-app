
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { NavBar } from "@/components/NavBar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormularioVrVa } from "@/components/FormularioVrVa";
import { PaginacaoCards } from "@/components/PaginacaoCards";
import { Plus, Coffee, DollarSign, TrendingUp, Calendar, Edit2, Trash2, Search, HelpCircle } from "lucide-react";

export default function VrVa() {
  const { user } = useAuth();
  const [movimentacoes, setMovimentacoes] = useState([]);
  const [totaisConsolidados, setTotaisConsolidados] = useState({
    total_vr: 0,
    total_va: 0
  });
  const [maiorGasto, setMaiorGasto] = useState(0);
  const [ultimoGasto, setUltimoGasto] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [paginaAtual, setPaginaAtual] = useState(1);
  const ITENS_POR_PAGINA = 12;

  const fetchVrVaData = async () => {
    try {
      // Buscar movimentações para exibição
      const { data: vrva, error: vrvaError } = await supabase
        .from('vr_va')
        .select('*')
        .eq('usuario_id', user.id)
        .order('data', { ascending: false });

      if (vrvaError) {
        console.error("Erro ao buscar dados de VR/VA:", vrvaError);
        return;
      }

      setMovimentacoes(vrva || []);

      // Buscar totais consolidados da nova tabela
      const { data: totais, error: totaisError } = await supabase
        .from('totais_financeiros')
        .select('total_vr, total_va')
        .eq('usuario_id', user.id)
        .single();

      if (totaisError) {
        console.error("Erro ao buscar totais consolidados:", totaisError);
      } else if (totais) {
        setTotaisConsolidados({
          total_vr: totais.total_vr || 0,
          total_va: totais.total_va || 0
        });
      }

      // Calcular estatísticas das movimentações - apenas saídas para maior gasto
      if (vrva && vrva.length > 0) {
        const saidas = vrva.filter(item => item.movimentacao === 'saida');
        const maiorGastoCalculado = saidas.length > 0 ? Math.max(...saidas.map(item => item.valor || 0)) : 0;
        setMaiorGasto(maiorGastoCalculado);

        const ultimoGastoObj = vrva.reduce((prev, current) => {
          return (new Date(current.data || '') > new Date(prev.data || '')) ? current : prev
        });
        setUltimoGasto(ultimoGastoObj.data || '');
      } else {
        setMaiorGasto(0);
        setUltimoGasto("");
      }

    } catch (error) {
      console.error("Erro ao processar dados de VR/VA:", error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchVrVaData();
    }
  }, [user]);

  const handleFormSuccess = () => {
    fetchVrVaData();
    setEditingItem(null);
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setIsFormOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      const { error } = await supabase
        .from('vr_va')
        .delete()
        .eq('id', id);

      if (error) throw error;
      fetchVrVaData();
    } catch (error) {
      console.error('Erro ao excluir movimentação:', error);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString + 'T12:00:00-03:00');
    return date.toLocaleDateString('pt-BR', {
      timeZone: 'America/Sao_Paulo'
    });
  };

  // Filtrar movimentações baseado na busca
  const filteredMovimentacoes = movimentacoes
    .filter(movimentacao =>
      movimentacao.descricao?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      movimentacao.tipo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      movimentacao.movimentacao?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      const dateA = new Date(a.data || '');
      const dateB = new Date(b.data || '');
      return dateB.getTime() - dateA.getTime();
    });

  // Paginação
  const totalPaginas = Math.ceil(filteredMovimentacoes.length / ITENS_POR_PAGINA);
  const movimentacoesPaginadas = filteredMovimentacoes.slice(
    (paginaAtual - 1) * ITENS_POR_PAGINA,
    paginaAtual * ITENS_POR_PAGINA
  );

  // Resetar página ao buscar
  useEffect(() => {
    setPaginaAtual(1);
  }, [searchTerm]);

  return (
    <div className="min-h-screen">
      <NavBar />
      <div className="p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <h1 className="finwise-page-title">VR & VA</h1>
              <a 
                href="/ajuda#vr-va" 
                className="text-white/50 hover:text-white/80 transition-colors"
                title="Ajuda sobre VR & VA"
              >
                <HelpCircle className="w-5 h-5" />
              </a>
            </div>
            <p className="finwise-page-subtitle">Controle seus vales refeição e alimentação</p>
          </div>
          <Button 
            onClick={() => {
              setEditingItem(null);
              setIsFormOpen(true);
            }}
            className="finwise-gradient-button"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nova Movimentação
          </Button>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total VR */}
          <div className="finwise-glass-card">
            <div className="flex items-center justify-between mb-4">
              <div className="finwise-icon-container finwise-icon-orange">
                <Coffee className="w-6 h-6" />
              </div>
            </div>
            <h3 className="finwise-card-title">Saldo VR</h3>
            <p className="finwise-value-text">
              R$ {totaisConsolidados.total_vr.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>

          {/* Total VA */}
          <div className="finwise-glass-card">
            <div className="flex items-center justify-between mb-4">
              <div className="finwise-icon-container finwise-icon-green">
                <DollarSign className="w-6 h-6" />
              </div>
            </div>
            <h3 className="finwise-card-title">Saldo VA</h3>
            <p className="finwise-value-text">
              R$ {totaisConsolidados.total_va.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>

          {/* Maior Gasto */}
          <div className="finwise-glass-card">
            <div className="flex items-center justify-between mb-4">
              <div className="finwise-icon-container finwise-icon-red">
                <TrendingUp className="w-6 h-6" />
              </div>
            </div>
            <h3 className="finwise-card-title">Maior Gasto</h3>
            <p className="finwise-value-text finwise-text-red">
              R$ {maiorGasto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>

          {/* Último Gasto */}
          <div className="finwise-glass-card">
            <div className="flex items-center justify-between mb-4">
              <div className="finwise-icon-container finwise-icon-blue">
                <Calendar className="w-6 h-6" />
              </div>
            </div>
            <h3 className="finwise-card-title">Último Gasto</h3>
            <p className="finwise-value-text">
              {ultimoGasto ? formatDate(ultimoGasto) : 'N/A'}
            </p>
          </div>
        </div>

        {/* Movimentações VR/VA */}
        <div className="finwise-glass-card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-white">Movimentações VR/VA</h3>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40 w-4 h-4" />
              <Input
                placeholder="Buscar movimentações..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white/5 border-white/20 text-white placeholder:text-white/40 w-64"
              />
            </div>
          </div>
          {filteredMovimentacoes.length === 0 ? (
            <div className="finwise-empty-state">
              <div className="finwise-empty-icon">
                <Coffee className="w-16 h-16 text-white/20" />
              </div>
              <p className="finwise-empty-text">
                {searchTerm ? "Nenhuma movimentação encontrada" : "Nenhuma movimentação cadastrada"}
              </p>
              <p className="finwise-empty-subtext">
                {searchTerm ? "Tente ajustar os termos de busca" : "Clique em \"Nova Movimentação\" para começar"}
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {movimentacoesPaginadas.map((movimentacao) => (
                  <div key={movimentacao.id} className="finwise-glass-card relative">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-white font-medium">{movimentacao.descricao}</h4>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(movimentacao)}
                          className="p-1 text-blue-400 hover:text-blue-300 transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(movimentacao.id)}
                          className="p-1 text-red-400 hover:text-red-300 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="mb-2">
                      <span className={`font-bold text-lg ${
                        movimentacao.movimentacao === 'entrada' ? 'finwise-text-green' : 'finwise-text-red'
                      }`}>
                        {movimentacao.movimentacao === 'entrada' ? '+' : '-'}R$ {movimentacao.valor?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="text-white/70 text-sm">
                      <p>Tipo: {movimentacao.tipo}</p>
                      <p>Movimentação: {movimentacao.movimentacao}</p>
                      <p>Data: {formatDate(movimentacao.data)}</p>
                    </div>
                  </div>
                ))}
              </div>
              <PaginacaoCards
                paginaAtual={paginaAtual}
                totalPaginas={totalPaginas}
                onPaginaChange={setPaginaAtual}
                totalItens={filteredMovimentacoes.length}
                itensPorPagina={ITENS_POR_PAGINA}
              />
            </>
          )}
        </div>
      </div>

      <FormularioVrVa
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSuccess={handleFormSuccess}
        editingItem={editingItem}
      />
    </div>
  );
}
