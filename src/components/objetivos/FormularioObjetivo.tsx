import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Plus, Trash2 } from "lucide-react";

interface FormularioObjetivoProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editingObjetivo?: any;
}

export function FormularioObjetivo({ isOpen, onClose, onSuccess, editingObjetivo }: FormularioObjetivoProps) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    titulo: "",
    categoria: "",
    descricao: "",
    valor_objetivo: "",
    valor_atual: "",
    prioridade: "",
    data_objetivo: ""
  });
  const [checklists, setChecklists] = useState<string[]>([""]);

  useEffect(() => {
    if (editingObjetivo) {
      setFormData({
        titulo: editingObjetivo.titulo || "",
        categoria: editingObjetivo.categoria || "",
        descricao: editingObjetivo.descricao || "",
        valor_objetivo: editingObjetivo.valor_objetivo?.toString() || "",
        valor_atual: editingObjetivo.valor_atual?.toString() || "",
        prioridade: editingObjetivo.prioridade || "",
        data_objetivo: editingObjetivo.data_objetivo || ""
      });
      fetchChecklists();
    } else {
      setFormData({
        titulo: "",
        categoria: "",
        descricao: "",
        valor_objetivo: "",
        valor_atual: "",
        prioridade: "",
        data_objetivo: ""
      });
      setChecklists([""]);
    }
  }, [editingObjetivo]);

  const fetchChecklists = async () => {
    if (!editingObjetivo?.id) return;

    const { data } = await supabase
      .from('objetivo_checklists')
      .select('titulo')
      .eq('objetivo_id', editingObjetivo.id)
      .order('created_at');

    if (data && data.length > 0) {
      setChecklists(data.map(item => item.titulo));
    } else {
      setChecklists([""]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;

    const objetivoData = {
      titulo: formData.titulo,
      categoria: formData.categoria,
      descricao: formData.descricao,
      valor_objetivo: parseFloat(formData.valor_objetivo) || 0,
      valor_atual: parseFloat(formData.valor_atual) || 0,
      prioridade: formData.prioridade,
      data_objetivo: formData.data_objetivo,
      usuario_id: user.id
    };

    try {
      let objetivoId = editingObjetivo?.id;

      if (editingObjetivo) {
        const { error } = await supabase
          .from('objetivos')
          .update(objetivoData)
          .eq('id', editingObjetivo.id);
        
        if (error) throw error;

        // Deletar checklists existentes
        await supabase
          .from('objetivo_checklists')
          .delete()
          .eq('objetivo_id', editingObjetivo.id);
      } else {
        const { data, error } = await supabase
          .from('objetivos')
          .insert([objetivoData])
          .select()
          .single();
        
        if (error) throw error;
        objetivoId = data.id;
      }

      // Salvar checklists não vazios
      const checklistsToSave = checklists.filter(item => item.trim() !== "");
      if (checklistsToSave.length > 0) {
        const checklistData = checklistsToSave.map(titulo => ({
          objetivo_id: objetivoId,
          titulo: titulo.trim()
        }));

        await supabase
          .from('objetivo_checklists')
          .insert(checklistData);
      }
      
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Erro ao salvar objetivo:', error);
    }
  };

  const addChecklistItem = () => {
    setChecklists([...checklists, ""]);
  };

  const removeChecklistItem = (index: number) => {
    setChecklists(checklists.filter((_, i) => i !== index));
  };

  const updateChecklistItem = (index: number, value: string) => {
    const updated = [...checklists];
    updated[index] = value;
    setChecklists(updated);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 p-6 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-white text-2xl font-bold">
            {editingObjetivo ? 'Editar Objetivo' : 'Nova Meta'}
          </h3>
          <button onClick={onClose} className="text-white/70 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-white/80 text-sm mb-2">Título da Meta</label>
            <Input
              placeholder="Título da Meta"
              value={formData.titulo}
              onChange={(e) => setFormData({...formData, titulo: e.target.value})}
              required
              className="bg-gray-800 border-gray-700 text-white placeholder:text-white/50"
            />
          </div>
          
          <div>
            <label className="block text-white/80 text-sm mb-2">Categoria</label>
            <Select value={formData.categoria} onValueChange={(value) => setFormData({...formData, categoria: value})}>
              <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Poupança">Poupança</SelectItem>
                <SelectItem value="Investimento">Investimento</SelectItem>
                <SelectItem value="Quitação de Dívida">Quitação de Dívida</SelectItem>
                <SelectItem value="Compra">Compra</SelectItem>
                <SelectItem value="Viagem">Viagem</SelectItem>
                <SelectItem value="Emergência">Emergência</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-white/80 text-sm mb-2">Descrição</label>
            <Textarea
              placeholder="Descrição"
              value={formData.descricao}
              onChange={(e) => setFormData({...formData, descricao: e.target.value})}
              className="bg-gray-800 border-gray-700 text-white placeholder:text-white/50"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-white/80 text-sm mb-2">Valor do Objetivo (R$)</label>
              <Input
                type="number"
                min="0"
                step="0.01"
                placeholder="Valor do Objetivo (R$)"
                value={formData.valor_objetivo}
                onChange={(e) => setFormData({...formData, valor_objetivo: e.target.value})}
                required
                className="bg-gray-800 border-gray-700 text-white placeholder:text-white/50"
              />
            </div>
            
            <div>
              <label className="block text-white/80 text-sm mb-2">Valor Atual (R$)</label>
              <Input
                type="number"
                min="0"
                step="0.01"
                placeholder="Valor Atual (R$)"
                value={formData.valor_atual}
                onChange={(e) => setFormData({...formData, valor_atual: e.target.value})}
                className="bg-gray-800 border-gray-700 text-white placeholder:text-white/50"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-white/80 text-sm mb-2">Prioridade</label>
              <Select value={formData.prioridade} onValueChange={(value) => setFormData({...formData, prioridade: value})}>
                <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                  <SelectValue placeholder="Prioridade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Alta">Alta</SelectItem>
                  <SelectItem value="Média">Média</SelectItem>
                  <SelectItem value="Baixa">Baixa</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-white/80 text-sm mb-2">Data Meta</label>
              <Input
                type="date"
                value={formData.data_objetivo}
                onChange={(e) => setFormData({...formData, data_objetivo: e.target.value})}
                required
                className="bg-gray-800 border-gray-700 text-white"
              />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-white font-medium">Lista de Tarefas</label>
              <Button
                type="button"
                onClick={addChecklistItem}
                variant="outline"
                size="sm"
                className="border-white/20 text-white hover:bg-white/10"
              >
                <Plus className="w-4 h-4 mr-1" />
                Adicionar
              </Button>
            </div>
            
            {checklists.map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <Input
                  placeholder={`Tarefa ${index + 1}`}
                  value={item}
                  onChange={(e) => updateChecklistItem(index, e.target.value)}
                  className="bg-gray-800 border-gray-700 text-white placeholder:text-white/50"
                />
                {checklists.length > 1 && (
                  <Button
                    type="button"
                    onClick={() => removeChecklistItem(index)}
                    variant="outline"
                    size="sm"
                    className="border-red-500/20 text-red-400 hover:bg-red-500/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
          
          <div className="flex gap-3 pt-4">
            <Button type="submit" className="flex-1 bg-finwise-gradient hover:opacity-90">
              {editingObjetivo ? 'Confirmar Edição' : 'Criar Meta'}
            </Button>
            <Button type="button" onClick={onClose} variant="outline" className="flex-1 border-white/20 text-white hover:bg-white/10">
              Cancelar
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
