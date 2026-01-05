import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X } from "lucide-react";

interface FormularioReceitaProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editingReceita?: any;
}

export function FormularioReceita({ isOpen, onClose, onSuccess, editingReceita }: FormularioReceitaProps) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    descricao: "",
    valor: "",
    categoria: "",
    forma: "",
    data: ""
  });

  useEffect(() => {
    if (editingReceita) {
      setFormData({
        descricao: editingReceita.descricao || "",
        valor: editingReceita.valor?.toString() || "",
        categoria: editingReceita.categoria || "",
        forma: editingReceita.forma || "",
        data: editingReceita.data || ""
      });
    } else {
      setFormData({
        descricao: "",
        valor: "",
        categoria: "",
        forma: "",
        data: ""
      });
    }
  }, [editingReceita]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;

    const receitaData = {
      descricao: formData.descricao,
      valor: parseFloat(formData.valor),
      categoria: formData.categoria,
      forma: formData.forma,
      data: formData.data,
      usuario_id: user.id
    };

    try {
      if (editingReceita) {
        const { error } = await supabase
          .from('receitas')
          .update(receitaData)
          .eq('id', editingReceita.id);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('receitas')
          .insert([receitaData]);
        
        if (error) throw error;
      }
      
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Erro ao salvar receita:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-900 p-6 rounded-lg w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-white text-lg font-semibold">
            {editingReceita ? 'Editar Receita' : 'Nova Receita'}
          </h3>
          <button onClick={onClose} className="text-white/70 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-white/80 text-sm mb-2">Descrição</label>
            <Input
              placeholder="Descrição"
              value={formData.descricao}
              onChange={(e) => setFormData({...formData, descricao: e.target.value})}
              required
              className="bg-gray-800 border-gray-700 text-white"
            />
          </div>
          
          <div>
            <label className="block text-white/80 text-sm mb-2">Valor</label>
            <Input
              type="number"
              step="0.01"
              placeholder="Valor"
              value={formData.valor}
              onChange={(e) => setFormData({...formData, valor: e.target.value})}
              required
              className="bg-gray-800 border-gray-700 text-white"
            />
          </div>
          
          <div>
            <label className="block text-white/80 text-sm mb-2">Categoria</label>
            <Select value={formData.categoria} onValueChange={(value) => setFormData({...formData, categoria: value})}>
              <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="salario">Salário</SelectItem>
                <SelectItem value="freelance">Freelance</SelectItem>
                <SelectItem value="investimentos">Investimentos</SelectItem>
                <SelectItem value="outros">Outros</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="block text-white/80 text-sm mb-2">Forma de Recebimento</label>
            <Select value={formData.forma} onValueChange={(value) => setFormData({...formData, forma: value})}>
              <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                <SelectValue placeholder="Forma de Recebimento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dinheiro">Dinheiro</SelectItem>
                <SelectItem value="pix">PIX</SelectItem>
                <SelectItem value="transferencia">Transferência</SelectItem>
                <SelectItem value="deposito">Depósito</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="block text-white/80 text-sm mb-2">Data</label>
            <Input
              type="date"
              value={formData.data}
              onChange={(e) => setFormData({...formData, data: e.target.value})}
              required
              className="bg-gray-800 border-gray-700 text-white"
            />
          </div>
          
          <div className="flex space-x-2">
            <Button type="submit" className="flex-1 bg-green-600 hover:bg-green-700">
              {editingReceita ? 'Confirmar Edição' : 'Salvar'}
            </Button>
            <Button type="button" onClick={onClose} variant="outline" className="flex-1">
              Cancelar
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
