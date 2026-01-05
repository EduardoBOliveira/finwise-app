import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X } from "lucide-react";

interface FormularioVrVaProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editingItem?: any;
}

export function FormularioVrVa({ isOpen, onClose, onSuccess, editingItem }: FormularioVrVaProps) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    movimentacao: "",
    tipo: "",
    descricao: "",
    valor: "",
    data: ""
  });

  useEffect(() => {
    if (editingItem) {
      setFormData({
        movimentacao: editingItem.movimentacao || "",
        tipo: editingItem.tipo || "",
        descricao: editingItem.descricao || "",
        valor: editingItem.valor?.toString() || "",
        data: editingItem.data || ""
      });
    } else {
      setFormData({
        movimentacao: "",
        tipo: "",
        descricao: "",
        valor: "",
        data: ""
      });
    }
  }, [editingItem]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;

    const vrVaData = {
      movimentacao: formData.movimentacao,
      tipo: formData.tipo,
      descricao: formData.descricao,
      valor: parseFloat(formData.valor),
      data: formData.data,
      usuario_id: user.id
    };

    try {
      if (editingItem) {
        const { error } = await supabase
          .from('vr_va')
          .update(vrVaData)
          .eq('id', editingItem.id);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('vr_va')
          .insert([vrVaData]);
        
        if (error) throw error;
      }
      
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Erro ao salvar VR/VA:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-900 p-6 rounded-lg w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-white text-lg font-semibold">
            {editingItem ? 'Editar VR/VA' : 'Nova Movimentação VR/VA'}
          </h3>
          <button onClick={onClose} className="text-white/70 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-white/80 text-sm mb-2">Tipo de Movimentação</label>
            <Select value={formData.movimentacao} onValueChange={(value) => setFormData({...formData, movimentacao: value})}>
              <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                <SelectValue placeholder="Tipo de Movimentação" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="entrada">Entrada</SelectItem>
                <SelectItem value="saida">Saída</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="block text-white/80 text-sm mb-2">Tipo</label>
            <Select value={formData.tipo} onValueChange={(value) => setFormData({...formData, tipo: value})}>
              <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="VR">Vale Refeição</SelectItem>
                <SelectItem value="VA">Vale Alimentação</SelectItem>
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
            <Button type="submit" className="flex-1 bg-orange-600 hover:bg-orange-700">
              {editingItem ? 'Confirmar Edição' : 'Salvar'}
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
