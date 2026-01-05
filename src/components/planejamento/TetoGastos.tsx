import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  Home, 
  Car, 
  UtensilsCrossed, 
  Heart, 
  GraduationCap, 
  Play, 
  Receipt, 
  ShoppingBag, 
  Banknote, 
  Wallet, 
  Trash2 
} from "lucide-react";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface TetoGasto {
  id: string;
  categoria: string;
  limite: number;
  gasto_atual: number;
  percentual: number;
  icon: React.ReactNode;
  iconBg: string;
}

export function TetoGastos({ showConfig, onCloseConfig }: { showConfig: boolean; onCloseConfig: () => void }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [novoLimite, setNovoLimite] = useState({ categoria: '', valor: '' });

  const categoriasIcons: { [key: string]: { icon: React.ReactNode; bg: string } } = {
    'Lazer': { icon: <Play className="w-5 h-5" />, bg: 'bg-purple-500' },
    'VR': { icon: <UtensilsCrossed className="w-5 h-5" />, bg: 'bg-green-500' },
    'VA': { icon: <UtensilsCrossed className="w-5 h-5" />, bg: 'bg-orange-500' },
    'Compras': { icon: <ShoppingBag className="w-5 h-5" />, bg: 'bg-pink-500' },
    'Moradia': { icon: <Home className="w-5 h-5" />, bg: 'bg-blue-500' },
    'Transporte': { icon: <Car className="w-5 h-5" />, bg: 'bg-yellow-500' },
    'Alimentação': { icon: <UtensilsCrossed className="w-5 h-5" />, bg: 'bg-red-500' },
    'Saúde': { icon: <Heart className="w-5 h-5" />, bg: 'bg-rose-500' },
    'Educação': { icon: <GraduationCap className="w-5 h-5" />, bg: 'bg-indigo-500' },
    'Streaming': { icon: <Play className="w-5 h-5" />, bg: 'bg-violet-500' },
    'Outros': { icon: <Wallet className="w-5 h-5" />, bg: 'bg-gray-500' }
  };

  const { data: tetoGastos, isLoading } = useQuery({
    queryKey: ['teto-gastos', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const currentMonth = new Date().getMonth() + 1;
      const currentYear = new Date().getFullYear();

      // Buscar configurações de teto
      const { data: configTeto } = await supabase
        .from('planejamento_tetos')
        .select('*')
        .eq('usuario_id', user.id);

      // Buscar gastos atuais por categoria
      const { data: gastosAtuais } = await supabase
        .from('despesas')
        .select('categoria, valor')
        .eq('usuario_id', user.id)
        .gte('data', `${currentYear}-${currentMonth.toString().padStart(2, '0')}-01`)
        .lt('data', `${currentYear}-${(currentMonth + 1).toString().padStart(2, '0')}-01`);

      // Buscar VR/VA se houver configuração
      const { data: vrvaGastos } = await supabase
        .from('vr_va')
        .select('tipo, valor')
        .eq('usuario_id', user.id)
        .eq('movimentacao', 'saida')
        .gte('data', `${currentYear}-${currentMonth.toString().padStart(2, '0')}-01`)
        .lt('data', `${currentYear}-${(currentMonth + 1).toString().padStart(2, '0')}-01`);

      // Agrupar gastos por categoria
      const gastosAgrupados: { [key: string]: number } = {};
      
      gastosAtuais?.forEach(gasto => {
        const categoria = gasto.categoria || 'Outros';
        gastosAgrupados[categoria] = (gastosAgrupados[categoria] || 0) + (gasto.valor || 0);
      });

      // Adicionar VR/VA aos gastos agrupados
      vrvaGastos?.forEach(gasto => {
        gastosAgrupados[gasto.tipo] = (gastosAgrupados[gasto.tipo] || 0) + (gasto.valor || 0);
      });

      // Combinar com configurações de teto
      const resultado: TetoGasto[] = configTeto?.map(config => {
        const gastoAtual = gastosAgrupados[config.categoria] || 0;
        const percentual = config.teto > 0 ? (gastoAtual / config.teto) * 100 : 0;
        const categoriaInfo = categoriasIcons[config.categoria] || categoriasIcons['Outros'];
        
        return {
          id: config.id,
          categoria: config.categoria,
          limite: config.teto,
          gasto_atual: gastoAtual,
          percentual: Math.min(percentual, 100),
          icon: categoriaInfo.icon,
          iconBg: categoriaInfo.bg
        };
      }) || [];

      return resultado;
    },
    enabled: !!user?.id,
    refetchInterval: 30000 // Auto-update every 30 seconds
  });

  const addLimiteMutation = useMutation({
    mutationFn: async (data: { categoria: string; limite: number }) => {
      const { error } = await supabase
        .from('planejamento_tetos')
        .insert({
          usuario_id: user?.id,
          categoria: data.categoria,
          teto: data.limite
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teto-gastos'] });
      setNovoLimite({ categoria: '', valor: '' });
      toast({ title: "Limite configurado com sucesso!" });
    },
    onError: () => {
      toast({ title: "Erro ao configurar limite", variant: "destructive" });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('planejamento_tetos')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teto-gastos'] });
      toast({ title: "Limite removido com sucesso!" });
    },
    onError: () => {
      toast({ title: "Erro ao remover limite", variant: "destructive" });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoLimite.categoria || !novoLimite.valor) return;

    addLimiteMutation.mutate({
      categoria: novoLimite.categoria,
      limite: parseFloat(novoLimite.valor)
    });
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          <div className="text-white/60 col-span-full text-center py-8">Carregando...</div>
        ) : tetoGastos?.length === 0 ? (
          <div className="text-white/60 col-span-full text-center py-8">
            Nenhum teto de gastos configurado. Clique em "Configurar" para adicionar.
          </div>
        ) : (
          tetoGastos?.map((item) => (
            <Card key={item.categoria} className="bg-white/5 backdrop-blur-sm border-white/10 shadow-xl hover:scale-105 transition-transform duration-300 hover:shadow-xl">
              <CardHeader className="pb-3">
                <CardTitle className="text-white text-lg font-medium flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`${item.iconBg} p-2 rounded-lg text-white`}>
                      {item.icon}
                    </div>
                    <span>{item.categoria}</span>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => deleteMutation.mutate(item.id)}
                    className="h-8 w-8 p-0 hover:bg-red-500/20"
                  >
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-white/60">Gasto:</span>
                  <span className="text-white font-medium">
                    R$ {item.gasto_atual.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/60">Limite:</span>
                  <span className="text-white font-medium">
                    R$ {item.limite.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <Progress 
                  value={item.percentual}
                  className={`h-2 ${item.percentual > 80 ? 'bg-red-900' : item.percentual > 60 ? 'bg-yellow-900' : 'bg-gray-700'}`}
                />
                <div className="text-center text-xs">
                  <span className={item.percentual > 80 ? 'text-red-500' : item.percentual > 60 ? 'text-yellow-500' : 'text-green-500'}>
                    {item.percentual.toFixed(1)}% utilizado
                  </span>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Dialog open={showConfig} onOpenChange={onCloseConfig}>
        <DialogContent className="bg-gray-800 border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-white">Configurar Teto de Gastos</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="categoria" className="text-white/70">Categoria</Label>
              <select
                id="categoria"
                value={novoLimite.categoria}
                onChange={(e) => setNovoLimite({ ...novoLimite, categoria: e.target.value })}
                className="w-full bg-gray-700 border-gray-600 text-white p-2 rounded-md"
              >
                <option value="">Selecione uma categoria</option>
                {Object.keys(categoriasIcons).map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            
            <div>
              <Label htmlFor="valor" className="text-white/70">Limite (R$)</Label>
              <Input
                id="valor"
                type="number"
                step="0.01"
                value={novoLimite.valor}
                onChange={(e) => setNovoLimite({ ...novoLimite, valor: e.target.value })}
                placeholder="0,00"
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>
            
            <div className="flex gap-2">
              <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700">
                Salvar
              </Button>
              <Button type="button" variant="outline" onClick={onCloseConfig} className="flex-1">
                Cancelar
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
