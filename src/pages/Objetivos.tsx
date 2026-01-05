import { useState, useEffect } from "react";
import { Plus, HelpCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { NavBar } from "@/components/NavBar";
import { FormularioObjetivo } from "@/components/objetivos/FormularioObjetivo";
import { CardObjetivo } from "@/components/objetivos/CardObjetivo";

interface Objetivo {
  id: string;
  titulo: string;
  categoria: string;
  descricao?: string;
  valor_objetivo: number;
  valor_atual: number;
  prioridade: string;
  data_objetivo: string;
  created_at: string;
  updated_at: string;
}

export default function Objetivos() {
  const { user } = useAuth();
  const [objetivos, setObjetivos] = useState<Objetivo[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingObjetivo, setEditingObjetivo] = useState<Objetivo | null>(null);

  const fetchObjetivos = async () => {
    if (!user?.id) return;

    const { data, error } = await supabase
      .from('objetivos')
      .select('*')
      .eq('usuario_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar objetivos:', error);
      return;
    }

    setObjetivos(data || []);
  };

  useEffect(() => {
    fetchObjetivos();
  }, [user?.id]);

  const handleSuccess = () => {
    fetchObjetivos();
    setShowForm(false);
    setEditingObjetivo(null);
  };

  const handleEdit = (objetivo: Objetivo) => {
    setEditingObjetivo(objetivo);
    setShowForm(true);
  };

  const handleDelete = async (objetivoId: string) => {
    if (!confirm('Tem certeza que deseja excluir este objetivo?')) return;

    const { error } = await supabase
      .from('objetivos')
      .delete()
      .eq('id', objetivoId);

    if (error) {
      console.error('Erro ao excluir objetivo:', error);
      return;
    }

    fetchObjetivos();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <NavBar />
      <main className="p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <h1 className="text-4xl font-bold text-white">Objetivos e Metas</h1>
                <a 
                  href="/ajuda#objetivos" 
                  className="text-white/50 hover:text-white/80 transition-colors"
                  title="Ajuda sobre Objetivos e Metas"
                >
                  <HelpCircle className="w-5 h-5" />
                </a>
              </div>
              <p className="text-white/70">Defina e acompanhe seus objetivos financeiros</p>
            </div>
            <Button
              onClick={() => setShowForm(true)}
              className="bg-finwise-gradient hover:opacity-90 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105 shadow-lg"
            >
              <Plus className="w-5 h-5 mr-2" />
              Nova Meta
            </Button>
          </div>

          {/* Objetivos em Progresso */}
          {objetivos.filter(obj => obj.valor_atual < obj.valor_objetivo).length > 0 && (
            <>
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                Em Progresso
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {objetivos
                  .filter(obj => obj.valor_atual < obj.valor_objetivo)
                  .map((objetivo) => (
                    <CardObjetivo
                      key={objetivo.id}
                      objetivo={objetivo}
                      onEdit={() => handleEdit(objetivo)}
                      onDelete={() => handleDelete(objetivo.id)}
                      onUpdate={fetchObjetivos}
                    />
                  ))}
              </div>
            </>
          )}

          {/* Objetivos Concluídos */}
          {objetivos.filter(obj => obj.valor_atual >= obj.valor_objetivo).length > 0 && (
            <>
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                Metas Atingidas
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {objetivos
                  .filter(obj => obj.valor_atual >= obj.valor_objetivo)
                  .map((objetivo) => (
                    <CardObjetivo
                      key={objetivo.id}
                      objetivo={objetivo}
                      onEdit={() => handleEdit(objetivo)}
                      onDelete={() => handleDelete(objetivo.id)}
                      onUpdate={fetchObjetivos}
                    />
                  ))}
              </div>
            </>
          )}

          {objetivos.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-finwise-gradient rounded-full flex items-center justify-center mx-auto mb-4">
                <Plus className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Nenhum objetivo cadastrado</h3>
              <p className="text-white/70 mb-4">Comece criando sua primeira meta financeira</p>
              <Button
                onClick={() => setShowForm(true)}
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10"
              >
                Criar primeira meta
              </Button>
            </div>
          )}
        </div>

        <FormularioObjetivo
          isOpen={showForm}
          onClose={() => {
            setShowForm(false);
            setEditingObjetivo(null);
          }}
          onSuccess={handleSuccess}
          editingObjetivo={editingObjetivo}
        />
      </main>
    </div>
  );
}
