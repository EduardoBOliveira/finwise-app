
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { NavBar } from "@/components/NavBar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormularioInvestimento } from "@/components/FormularioInvestimento";
import { FiltroAno } from "@/components/FiltroAno";
import { PaginacaoCards } from "@/components/PaginacaoCards";
import { Plus, DollarSign, TrendingUp, Shield, BarChart3, Edit2, Trash2, Search, HelpCircle } from "lucide-react";

export default function Investimentos() {
  const { user } = useAuth();
  const currentYear = new Date().getFullYear();
  const [investimentos, setInvestimentos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalInvestido, setTotalInvestido] = useState(0);
  const [reservaEmergencia, setReservaEmergencia] = useState(0);
  const [maiorAporte, setMaiorAporte] = useState(0);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingInvestimento, setEditingInvestimento] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [anoSelecionado, setAnoSelecionado] = useState(currentYear.toString());
  const [anosDisponiveis, setAnosDisponiveis] = useState<number[]>([]);
  const [paginaAtual, setPaginaAtual] = useState(1);
  const ITENS_POR_PAGINA = 12;

  // Buscar anos disponíveis
  useEffect(() => {
    const fetchAnosDisponiveis = async () => {
      if (!user?.id) return;

      const { data } = await supabase
        .from('investimentos')
        .select('data')
        .eq('usuario_id', user.id);

      if (data) {
        const anos = new Set<number>();
        data.forEach(i => {
          if (i.data) anos.add(new Date(i.data).getFullYear());
        });
        setAnosDisponiveis(Array.from(anos).sort((a, b) => b - a));
      }
    };

    fetchAnosDisponiveis();
  }, [user?.id]);

  const fetchInvestimentos = async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from('investimentos')
        .select('*')
        .eq('usuario_id', user?.id)
        .order('data', { ascending: false });

      // Filtrar por ano
      query = query
        .gte('data', `${anoSelecionado}-01-01`)
        .lte('data', `${anoSelecionado}-12-31`);

      const { data, error } = await query;

      if (error) {
        console.error("Erro ao buscar investimentos:", error);
      }

      setInvestimentos(data || []);
      
      if (data && data.length > 0) {
        // Separar investimentos normais da reserva de emergência
        const investimentosNormais = data.filter(inv => inv.tipo !== 'reserva_emergencia');
        const reservaData = data.filter(inv => inv.tipo === 'reserva_emergencia');

        // Calcular total investido (excluindo reserva de emergência)
        let totalInvestimentos = 0;
        investimentosNormais.forEach(inv => {
          if (inv.categoria === 'aporte') {
            totalInvestimentos += inv.valor || 0;
          } else if (inv.categoria === 'resgate') {
            totalInvestimentos -= inv.valor || 0;
          }
        });

        // Calcular reserva de emergência
        let totalReserva = 0;
        reservaData.forEach(inv => {
          if (inv.categoria === 'aporte') {
            totalReserva += inv.valor || 0;
          } else if (inv.categoria === 'resgate') {
            totalReserva -= inv.valor || 0;
          }
        });

        const maior = Math.max(...data.map(investimento => investimento.valor || 0));
        
        setTotalInvestido(totalInvestimentos);
        setReservaEmergencia(totalReserva);
        setMaiorAporte(maior);
      } else {
        setTotalInvestido(0);
        setReservaEmergencia(0);
        setMaiorAporte(0);
      }

      // Buscar também da tabela totais_financeiros para pegar o valor correto da reserva
      const { data: totais, error: totaisError } = await supabase
        .from('totais_financeiros')
        .select('total_reserva_emergencia')
        .eq('usuario_id', user?.id)
        .single();

      if (!totaisError && totais) {
        setReservaEmergencia(totais.total_reserva_emergencia || 0);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchInvestimentos();
    }
  }, [user?.id, anoSelecionado]);

  const handleFormSuccess = () => {
    fetchInvestimentos();
    setEditingInvestimento(null);
  };

  const handleEdit = (investimento) => {
    setEditingInvestimento(investimento);
    setIsFormOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      const { error } = await supabase
        .from('investimentos')
        .delete()
        .eq('id', id);

      if (error) throw error;
      fetchInvestimentos();
    } catch (error) {
      console.error('Erro ao excluir investimento:', error);
    }
  };

  // Filtrar investimentos normais para contagem
  const investimentosNormais = investimentos.filter(inv => inv.tipo !== 'reserva_emergencia');

  // Filtrar investimentos baseado na busca
  const filteredInvestimentos = investimentos.filter(investimento =>
    investimento.descricao?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    investimento.tipo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    investimento.categoria?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Paginação
  const totalPaginas = Math.ceil(filteredInvestimentos.length / ITENS_POR_PAGINA);
  const investimentosPaginados = filteredInvestimentos.slice(
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
              <h1 className="finwise-page-title">Investimentos</h1>
              <a 
                href="/ajuda#investimentos" 
                className="text-white/50 hover:text-white/80 transition-colors"
                title="Ajuda sobre Investimentos"
              >
                <HelpCircle className="w-5 h-5" />
              </a>
              <FiltroAno
                anos={anosDisponiveis}
                anoSelecionado={anoSelecionado}
                onAnoChange={setAnoSelecionado}
              />
            </div>
            <p className="finwise-page-subtitle">Acompanhe sua carteira de investimentos</p>
          </div>
          <Button 
            onClick={() => {
              setEditingInvestimento(null);
              setIsFormOpen(true);
            }}
            className="finwise-gradient-button"
          >
            <Plus className="w-4 h-4 mr-2" />
            Novo Investimento
          </Button>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Investido */}
          <div className="finwise-glass-card">
            <div className="flex items-center justify-between mb-4">
              <div className="finwise-icon-container finwise-icon-blue">
                <DollarSign className="w-6 h-6" />
              </div>
            </div>
            <h3 className="finwise-card-title">Total Investido</h3>
            <p className="finwise-value-text finwise-text-blue">
              R$ {totalInvestido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>

          {/* Maior Aporte */}
          <div className="finwise-glass-card">
            <div className="flex items-center justify-between mb-4">
              <div className="finwise-icon-container finwise-icon-green">
                <TrendingUp className="w-6 h-6" />
              </div>
            </div>
            <h3 className="finwise-card-title">Maior Aporte</h3>
            <p className="finwise-value-text finwise-text-green">
              R$ {maiorAporte.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>

          {/* Reserva de Emergência */}
          <div className="finwise-glass-card">
            <div className="flex items-center justify-between mb-4">
              <div className="finwise-icon-container finwise-icon-yellow">
                <Shield className="w-6 h-6" />
              </div>
            </div>
            <h3 className="finwise-card-title">Reserva de Emergência</h3>
            <p className="finwise-value-text finwise-text-blue">
              R$ {reservaEmergencia.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>

          {/* Quantidade Total */}
          <div className="finwise-glass-card">
            <div className="flex items-center justify-between mb-4">
              <div className="finwise-icon-container finwise-icon-purple">
                <BarChart3 className="w-6 h-6" />
              </div>
            </div>
            <h3 className="finwise-card-title">Quantidade Total</h3>
            <p className="finwise-value-text finwise-text-purple">
              {investimentosNormais.length}
            </p>
          </div>
        </div>

        {/* Carteira de Investimentos */}
        <div className="finwise-glass-card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-white">Carteira de Investimentos</h3>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40 w-4 h-4" />
              <Input
                placeholder="Buscar investimentos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white/5 border-white/20 text-white placeholder:text-white/40 w-64"
              />
            </div>
          </div>
          {filteredInvestimentos.length === 0 ? (
            <div className="finwise-empty-state">
              <div className="finwise-empty-icon">
                <BarChart3 className="w-16 h-16 text-white/20" />
              </div>
              <p className="finwise-empty-text">
                {searchTerm ? "Nenhum investimento encontrado" : "Nenhum investimento cadastrado"}
              </p>
              <p className="finwise-empty-subtext">
                {searchTerm ? "Tente ajustar os termos de busca" : "Clique em \"Novo Investimento\" para começar"}
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {investimentosPaginados.map((investimento) => (
                  <div key={investimento.id} className="finwise-glass-card relative">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-white font-medium">{investimento.descricao}</h4>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(investimento)}
                          className="p-1 text-blue-400 hover:text-blue-300 transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(investimento.id)}
                          className="p-1 text-red-400 hover:text-red-300 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="mb-2">
                      <span className={`font-bold text-lg ${
                        investimento.categoria === 'aporte' ? 'finwise-text-green' : 'finwise-text-red'
                      }`}>
                        {investimento.categoria === 'aporte' ? '+' : '-'}R$ {investimento.valor?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="text-white/70 text-sm">
                      <p>Tipo: {investimento.tipo}</p>
                      <p>Operação: {investimento.categoria}</p>
                      <p>Data: {investimento.data ? new Date(investimento.data).toLocaleDateString('pt-BR') : 'N/A'}</p>
                    </div>
                  </div>
                ))}
              </div>
              <PaginacaoCards
                paginaAtual={paginaAtual}
                totalPaginas={totalPaginas}
                onPaginaChange={setPaginaAtual}
                totalItens={filteredInvestimentos.length}
                itensPorPagina={ITENS_POR_PAGINA}
              />
            </>
          )}
        </div>
      </div>

      <FormularioInvestimento
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSuccess={handleFormSuccess}
        editingInvestimento={editingInvestimento}
      />
    </div>
  );
}
