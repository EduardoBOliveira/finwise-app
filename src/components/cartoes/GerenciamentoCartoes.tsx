
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { FormularioCartao } from "./FormularioCartao";
import { Plus, Edit2, Trash2, CreditCard } from "lucide-react";

export function GerenciamentoCartoes() {
  const { user } = useAuth();
  const [cartoes, setCartoes] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCartao, setEditingCartao] = useState(null);

  const fetchCartoes = async () => {
    if (user) {
      const { data, error } = await supabase
        .from('cartoes')
        .select('*')
        .eq('usuario_id', user.id)
        .order('apelido', { ascending: true });

      if (error) {
        console.error("Erro ao buscar cartões:", error);
      } else {
        setCartoes(data || []);
      }
    }
  };

  useEffect(() => {
    fetchCartoes();
  }, [user]);

  const handleFormSuccess = () => {
    fetchCartoes();
    setEditingCartao(null);
  };

  const handleEdit = (cartao) => {
    setEditingCartao(cartao);
    setIsFormOpen(true);
  };

  const handleDelete = async (cartao) => {
    try {
      const { error } = await supabase
        .from('cartoes')
        .delete()
        .eq('id', cartao.id);

      if (error) throw error;
      fetchCartoes();
    } catch (error) {
      console.error('Erro ao excluir cartão:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-white">Cartões de Crédito</h3>
          <p className="text-white/70">Gerencie seus cartões para controle de faturas</p>
        </div>
        <Button 
          onClick={() => {
            setEditingCartao(null);
            setIsFormOpen(true);
          }}
          className="finwise-red-button"
        >
          <Plus className="w-4 h-4 mr-2" />
          Novo Cartão
        </Button>
      </div>

      {cartoes.length === 0 ? (
        <div className="finwise-glass-card">
          <div className="finwise-empty-state">
            <div className="finwise-empty-icon">
              <CreditCard className="w-16 h-16 text-white/20" />
            </div>
            <p className="finwise-empty-text">Nenhum cartão cadastrado</p>
            <p className="finwise-empty-subtext">Adicione seus cartões para melhor controle das faturas</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {cartoes.map((cartao) => (
            <div key={cartao.id} className="finwise-glass-card">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="finwise-icon-container finwise-icon-blue">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-white font-medium">{cartao.apelido}</h4>
                    <p className="text-white/70 text-sm">{cartao.bandeira}</p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(cartao)}
                    className="p-1 text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(cartao)}
                    className="p-1 text-red-400 hover:text-red-300 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="text-white/70 text-sm space-y-1">
                <p>Fechamento: dia {cartao.fechamento_fatura}</p>
                <p>Vencimento: dia {cartao.vencimento_fatura}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <FormularioCartao
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSuccess={handleFormSuccess}
        editingCartao={editingCartao}
      />
    </div>
  );
}
