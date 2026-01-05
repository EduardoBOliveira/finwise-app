import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Pencil, Plus } from "lucide-react";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface DespesaFixa {
  id: string;
  descricao: string;
  valor: number;
  categoria: string;
}

export function DespesasFixasPlanejadas() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    descricao: '',
    valor: '',
    categoria: ''
  });
  const [editingId, setEditingId] = useState<string | null>(null);

  const { data: despesasFixas, isLoading } = useQuery({
    queryKey: ['planejamento-despesas-fixas', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('planejamento_despesas_fixas')
        .select('*')
        .eq('usuario_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id
  });

  const addMutation = useMutation({
    mutationFn: async (data: { descricao: string; valor: number; categoria: string }) => {
      const { error } = await supabase
        .from('planejamento_despesas_fixas')
        .insert({
          ...data,
          usuario_id: user?.id
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['planejamento-despesas-fixas'] });
      queryClient.invalidateQueries({ queryKey: ['planejamento-resumo'] });
      setFormData({ descricao: '', valor: '', categoria: '' });
      toast({ title: "Despesa fixa adicionada com sucesso!" });
    },
    onError: () => {
      toast({ title: "Erro ao adicionar despesa fixa", variant: "destructive" });
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: { descricao: string; valor: number; categoria: string } }) => {
      const { error } = await supabase
        .from('planejamento_despesas_fixas')
        .update(data)
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['planejamento-despesas-fixas'] });
      queryClient.invalidateQueries({ queryKey: ['planejamento-resumo'] });
      setEditingId(null);
      setFormData({ descricao: '', valor: '', categoria: '' });
      toast({ title: "Despesa fixa atualizada com sucesso!" });
    },
    onError: () => {
      toast({ title: "Erro ao atualizar despesa fixa", variant: "destructive" });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('planejamento_despesas_fixas')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['planejamento-despesas-fixas'] });
      queryClient.invalidateQueries({ queryKey: ['planejamento-resumo'] });
      toast({ title: "Despesa fixa removida com sucesso!" });
    },
    onError: () => {
      toast({ title: "Erro ao remover despesa fixa", variant: "destructive" });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.descricao || !formData.valor || !formData.categoria) return;

    const data = {
      descricao: formData.descricao,
      valor: parseFloat(formData.valor),
      categoria: formData.categoria
    };

    if (editingId) {
      updateMutation.mutate({ id: editingId, data });
    } else {
      addMutation.mutate(data);
    }
  };

  const handleEdit = (despesa: DespesaFixa) => {
    setEditingId(despesa.id);
    setFormData({
      descricao: despesa.descricao,
      valor: despesa.valor.toString(),
      categoria: despesa.categoria
    });
  };

  const handleCancel = () => {
    setEditingId(null);
    setFormData({ descricao: '', valor: '', categoria: '' });
  };

  return (
    <Card className="bg-white/5 backdrop-blur-sm border-white/10 shadow-xl">
      <CardHeader>
        <CardTitle className="text-white">Despesas Fixas Planejadas</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Formulário */}
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <Label htmlFor="descricao" className="text-white/70 text-sm">Descrição</Label>
            <Input
              id="descricao"
              value={formData.descricao}
              onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
              placeholder="Ex: Aluguel"
              className="bg-gray-700 border-gray-600 text-white"
            />
          </div>
          
          <div>
            <Label htmlFor="valor" className="text-white/70 text-sm">Valor</Label>
            <Input
              id="valor"
              type="number"
              step="0.01"
              value={formData.valor}
              onChange={(e) => setFormData({ ...formData, valor: e.target.value })}
              placeholder="0,00"
              className="bg-gray-700 border-gray-600 text-white"
            />
          </div>
          
          <div>
            <Label className="text-white/70 text-sm">Categoria</Label>
            <Select value={formData.categoria} onValueChange={(value) => setFormData({ ...formData, categoria: value })}>
              <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Moradia">Moradia</SelectItem>
                <SelectItem value="Transporte">Transporte</SelectItem>
                <SelectItem value="Alimentação">Alimentação</SelectItem>
                <SelectItem value="Saúde">Saúde</SelectItem>
                <SelectItem value="Educação">Educação</SelectItem>
                <SelectItem value="Streaming">Streaming</SelectItem>
                <SelectItem value="Contas">Contas</SelectItem>
                <SelectItem value="Outros">Outros</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex gap-2 items-end">
            <Button type="submit" className="flex-1 bg-purple-500 hover:bg-purple-600 text-white font-semibold px-6 py-2 rounded-lg shadow-lg hover:shadow-purple-500/25 transition-all duration-300">
              <Plus className="w-4 h-4 mr-2" />
              {editingId ? 'Atualizar' : 'Adicionar'}
            </Button>
            {editingId && (
              <Button type="button" variant="outline" onClick={handleCancel}>
                Cancelar
              </Button>
            )}
          </div>
        </form>

        {/* Lista de despesas */}
        <div className="space-y-3">
          {isLoading ? (
            <div className="text-white/60">Carregando...</div>
          ) : despesasFixas?.length === 0 ? (
            <div className="text-white/60 text-center py-4">Nenhuma despesa fixa cadastrada</div>
          ) : (
            despesasFixas?.map((despesa) => (
              <div key={despesa.id} className="flex items-center justify-between bg-gray-700/50 p-4 rounded-lg hover:scale-105 transition-transform duration-200">
                <div>
                  <div className="text-white font-medium">{despesa.descricao}</div>
                  <div className="text-white/60 text-sm">{despesa.categoria}</div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-white font-bold">
                    R$ {despesa.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleEdit(despesa)}
                      className="h-8 w-8 p-0 hover:bg-blue-500/20"
                    >
                      <Pencil className="w-4 h-4 text-blue-400" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => deleteMutation.mutate(despesa.id)}
                      className="h-8 w-8 p-0 hover:bg-red-500/20"
                    >
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
