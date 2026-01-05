
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { NavBar } from "@/components/NavBar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormularioReceita } from "@/components/FormularioReceita";
import { FiltroAno } from "@/components/FiltroAno";
import { PaginacaoCards } from "@/components/PaginacaoCards";
import { Plus, DollarSign, TrendingUp, Calendar, Tag, Edit2, Trash2, Search, HelpCircle } from "lucide-react";

export default function Receitas() {
  const { user } = useAuth();
  const currentYear = new Date().getFullYear();
  const [receitas, setReceitas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalReceitas, setTotalReceitas] = useState(0);
  const [maiorReceita, setMaiorReceita] = useState(0);
  const [ultimaReceita, setUltimaReceita] = useState(0);
  const [receitaFrequente, setReceitaFrequente] = useState("N/A");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingReceita, setEditingReceita] = useState(null);
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
        .from('receitas')
        .select('data')
        .eq('usuario_id', user.id);

      if (data) {
        const anos = new Set<number>();
        data.forEach(r => {
          if (r.data) anos.add(new Date(r.data).getFullYear());
        });
        setAnosDisponiveis(Array.from(anos).sort((a, b) => b - a));
      }
    };

    fetchAnosDisponiveis();
  }, [user?.id]);

  const fetchReceitas = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      let query = supabase
        .from('receitas')
        .select('*')
        .eq('usuario_id', user.id)
        .order('data', { ascending: false });

      // Filtrar por ano
      query = query
        .gte('data', `${anoSelecionado}-01-01`)
        .lte('data', `${anoSelecionado}-12-31`);

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching receitas:", error);
        setReceitas([]);
      } else {
        console.log("Receitas data:", data);
        setReceitas(data || []);
        
        if (data && data.length > 0) {
          const total = data.reduce((acc, receita) => acc + (receita.valor || 0), 0);
          const maior = Math.max(...data.map(receita => receita.valor || 0));
          const ultima = data[0]?.valor || 0;
          
          setTotalReceitas(total);
          setMaiorReceita(maior);
          setUltimaReceita(ultima);

          // Calcular categoria mais frequente
          const contadorCategorias = data.reduce((acc, receita) => {
            const categoria = receita.categoria || 'Outros';
            acc[categoria] = (acc[categoria] || 0) + 1;
            return acc;
          }, {});

          const categoriaComMaisOcorrencias = Object.entries(contadorCategorias)
            .sort(([,a], [,b]) => (b as number) - (a as number))[0];
          
          setReceitaFrequente(categoriaComMaisOcorrencias ? categoriaComMaisOcorrencias[0] : "N/A");
        } else {
          setTotalReceitas(0);
          setMaiorReceita(0);
          setUltimaReceita(0);
          setReceitaFrequente("N/A");
        }
      }
    } catch (error) {
      console.error("Erro ao buscar receitas:", error);
      setReceitas([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReceitas();
  }, [user?.id, anoSelecionado]);

  const handleFormSuccess = () => {
    fetchReceitas();
    setEditingReceita(null);
  };

  const handleEdit = (receita) => {
    setEditingReceita(receita);
    setIsFormOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      const { error } = await supabase
        .from('receitas')
        .delete()
        .eq('id', id);

      if (error) throw error;
      fetchReceitas();
    } catch (error) {
      console.error('Erro ao excluir receita:', error);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString + 'T12:00:00-03:00');
    return date.toLocaleDateString('pt-BR', {
      timeZone: 'America/Sao_Paulo'
    });
  };

  // Filtrar receitas baseado na busca
  const filteredReceitas = receitas.filter(receita =>
    receita.descricao?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    receita.categoria?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    receita.forma?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Paginação
  const totalPaginas = Math.ceil(filteredReceitas.length / ITENS_POR_PAGINA);
  const receitasPaginadas = filteredReceitas.slice(
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
              <h1 className="finwise-page-title">Receitas</h1>
              <a 
                href="/ajuda#receitas" 
                className="text-white/50 hover:text-white/80 transition-colors"
                title="Ajuda sobre Receitas"
              >
                <HelpCircle className="w-5 h-5" />
              </a>
              <FiltroAno
                anos={anosDisponiveis}
                anoSelecionado={anoSelecionado}
                onAnoChange={setAnoSelecionado}
              />
            </div>
            <p className="finwise-page-subtitle">Gerencie suas fontes de renda</p>
          </div>
          <Button 
            onClick={() => {
              setEditingReceita(null);
              setIsFormOpen(true);
            }}
            className="finwise-green-button"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nova Receita
          </Button>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Receitas */}
          <div className="finwise-glass-card">
            <div className="flex items-center justify-between mb-4">
              <div className="finwise-icon-container finwise-icon-green">
                <DollarSign className="w-6 h-6" />
              </div>
            </div>
            <h3 className="finwise-card-title">Total Receitas</h3>
            <p className="finwise-value-text finwise-text-green">
              R$ {totalReceitas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>

          {/* Maior Receita */}
          <div className="finwise-glass-card">
            <div className="flex items-center justify-between mb-4">
              <div className="finwise-icon-container finwise-icon-blue">
                <TrendingUp className="w-6 h-6" />
              </div>
            </div>
            <h3 className="finwise-card-title">Maior Receita</h3>
            <p className="finwise-value-text finwise-text-green">
              R$ {maiorReceita.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>

          {/* Última Receita */}
          <div className="finwise-glass-card">
            <div className="flex items-center justify-between mb-4">
              <div className="finwise-icon-container finwise-icon-purple">
                <Calendar className="w-6 h-6" />
              </div>
            </div>
            <h3 className="finwise-card-title">Última Receita</h3>
            <p className="finwise-value-text finwise-text-green">
              R$ {ultimaReceita.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>

          {/* Receita Frequente */}
          <div className="finwise-glass-card">
            <div className="flex items-center justify-between mb-4">
              <div className="finwise-icon-container finwise-icon-yellow">
                <Tag className="w-6 h-6" />
              </div>
            </div>
            <h3 className="finwise-card-title">Receita Frequente</h3>
            <p className="finwise-value-text">
              {receitaFrequente}
            </p>
          </div>
        </div>

        {/* Lista de Receitas */}
        <div className="finwise-glass-card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-white">Lista de Receitas</h3>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40 w-4 h-4" />
              <Input
                placeholder="Buscar receitas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white/5 border-white/20 text-white placeholder:text-white/40 w-64"
              />
            </div>
          </div>
          {loading ? (
            <div className="finwise-empty-state">
              <p className="finwise-empty-text">Carregando...</p>
            </div>
          ) : filteredReceitas.length === 0 ? (
            <div className="finwise-empty-state">
              <div className="finwise-empty-icon">
                <TrendingUp className="w-16 h-16 text-white/20" />
              </div>
              <p className="finwise-empty-text">
                {searchTerm ? "Nenhuma receita encontrada" : "Nenhuma receita cadastrada"}
              </p>
              <p className="finwise-empty-subtext">
                {searchTerm ? "Tente ajustar os termos de busca" : "Clique em \"Nova Receita\" para começar"}
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {receitasPaginadas.map((receita) => (
                  <div key={receita.id} className="finwise-glass-card relative">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-white font-medium">{receita.descricao}</h4>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(receita)}
                          className="p-1 text-blue-400 hover:text-blue-300 transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(receita.id)}
                          className="p-1 text-red-400 hover:text-red-300 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="mb-2">
                      <span className="finwise-text-green font-bold text-lg">
                        R$ {receita.valor?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="text-white/70 text-sm">
                      <p>Categoria: {receita.categoria}</p>
                      <p>Data: {formatDate(receita.data)}</p>
                      <p>Forma: {receita.forma}</p>
                    </div>
                  </div>
                ))}
              </div>
              <PaginacaoCards
                paginaAtual={paginaAtual}
                totalPaginas={totalPaginas}
                onPaginaChange={setPaginaAtual}
                totalItens={filteredReceitas.length}
                itensPorPagina={ITENS_POR_PAGINA}
              />
            </>
          )}
        </div>
      </div>

      <FormularioReceita
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSuccess={handleFormSuccess}
        editingReceita={editingReceita}
      />
    </div>
  );
}
