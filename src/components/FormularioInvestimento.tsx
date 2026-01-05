import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X } from "lucide-react";

interface FormularioInvestimentoProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editingInvestimento?: any;
}

export function FormularioInvestimento({ isOpen, onClose, onSuccess, editingInvestimento }: FormularioInvestimentoProps) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    tipo: "",
    categoria: "",
    descricao: "",
    valor: "",
    data: ""
  });

  useEffect(() => {
    if (editingInvestimento) {
      setFormData({
        tipo: editingInvestimento.tipo || "",
        categoria: editingInvestimento.categoria || "",
        descricao: editingInvestimento.descricao || "",
        valor: editingInvestimento.valor?.toString() || "",
        data: editingInvestimento.data || ""
      });
    } else {
      setFormData({
        tipo: "",
        categoria: "",
        descricao: "",
        valor: "",
        data: ""
      });
    }
  }, [editingInvestimento]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;

    const investimentoData = {
      tipo: formData.tipo,
      categoria: formData.categoria,
      descricao: formData.descricao,
      valor: parseFloat(formData.valor),
      data: formData.data,
      usuario_id: user.id
    };

    try {
      if (editingInvestimento) {
        const { error } = await supabase
          .from('investimentos')
          .update(investimentoData)
          .eq('id', editingInvestimento.id);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('investimentos')
          .insert([investimentoData]);
        
        if (error) throw error;
      }
      
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Erro ao salvar investimento:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-900 p-6 rounded-lg w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-white text-lg font-semibold">
            {editingInvestimento ? 'Editar Investimento' : 'Novo Investimento'}
          </h3>
          <button onClick={onClose} className="text-white/70 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-white/80 text-sm mb-2">Tipo de Investimento</label>
            <Select value={formData.tipo} onValueChange={(value) => setFormData({...formData, tipo: value})}>
              <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                <SelectValue placeholder="Tipo de Investimento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="reserva_emergencia">Reserva de Emergência</SelectItem>
                <SelectItem value="renda_fixa">Renda Fixa</SelectItem>
                <SelectItem value="renda_variavel">Renda Variável</SelectItem>
                <SelectItem value="cripto">Cripto</SelectItem>
                <SelectItem value="outros">Outros</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="block text-white/80 text-sm mb-2">Operação</label>
            <Select value={formData.categoria} onValueChange={(value) => setFormData({...formData, categoria: value})}>
              <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                <SelectValue placeholder="Operação" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="aporte">Aporte</SelectItem>
                <SelectItem value="resgate">Resgate</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
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
            <Button type="submit" className="flex-1 bg-purple-600 hover:bg-purple-700">
              {editingInvestimento ? 'Confirmar Edição' : 'Salvar'}
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
