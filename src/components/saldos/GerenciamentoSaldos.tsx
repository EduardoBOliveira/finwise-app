
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Edit2, Check, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function GerenciamentoSaldos() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [saldos, setSaldos] = useState({
    valor_vr: "",
    valor_va: "",
    valor_investimentos: "",
    valor_reserva_financeira: ""
  });
  const [saldosOriginais, setSaldosOriginais] = useState({
    valor_vr: "",
    valor_va: "",
    valor_investimentos: "",
    valor_reserva_financeira: ""
  });

  useEffect(() => {
    const fetchSaldos = async () => {
      if (user) {
        const { data, error } = await supabase
          .from('saldos_iniciais')
          .select('*')
          .eq('usuario_id', user.id)
          .maybeSingle();

        if (error && error.code !== 'PGRST116') {
          console.error("Erro ao buscar saldos:", error);
          return;
        }

        const saldosData = {
          valor_vr: data?.valor_vr?.toString() || "0",
          valor_va: data?.valor_va?.toString() || "0", 
          valor_investimentos: data?.valor_investimentos?.toString() || "0",
          valor_reserva_financeira: data?.valor_reserva_financeira?.toString() || "0"
        };

        setSaldos(saldosData);
        setSaldosOriginais(saldosData);
      }
    };

    fetchSaldos();
  }, [user]);

  const handleSave = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('saldos_iniciais')
        .upsert({
          usuario_id: user.id,
          valor_vr: parseFloat(saldos.valor_vr) || 0,
          valor_va: parseFloat(saldos.valor_va) || 0,
          valor_investimentos: parseFloat(saldos.valor_investimentos) || 0,
          valor_reserva_financeira: parseFloat(saldos.valor_reserva_financeira) || 0,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'usuario_id'
        });

      if (error) {
        console.error('Erro ao salvar saldos:', error);
        throw error;
      }

      toast({
        title: "Saldos atualizados",
        description: "Seus saldos iniciais foram salvos com sucesso.",
      });

      setSaldosOriginais(saldos);
      setIsEditing(false);
    } catch (error) {
      console.error('Erro ao salvar saldos:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar os saldos. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  const handleCancel = () => {
    setSaldos(saldosOriginais);
    setIsEditing(false);
  };

  const formatCurrency = (value: string) => {
    const numValue = parseFloat(value) || 0;
    return `R$ ${numValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
  };

  if (!isEditing) {
    return (
      <div className="space-y-4">
        <div className="flex justify-end">
          <Button 
            onClick={() => setIsEditing(true)}
            className="finwise-gradient-button"
            size="sm"
          >
            <Edit2 className="w-4 h-4 mr-2" />
            Editar
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label className="text-white/70">Total VR:</Label>
            <p className="text-white font-medium">{formatCurrency(saldos.valor_vr)}</p>
          </div>
          <div>
            <Label className="text-white/70">Total VA:</Label>
            <p className="text-white font-medium">{formatCurrency(saldos.valor_va)}</p>
          </div>
          <div>
            <Label className="text-white/70">Total Investido:</Label>
            <p className="text-white font-medium">{formatCurrency(saldos.valor_investimentos)}</p>
          </div>
          <div>
            <Label className="text-white/70">Reserva de Emergência:</Label>
            <p className="text-white font-medium">{formatCurrency(saldos.valor_reserva_financeira)}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end space-x-2">
        <Button 
          onClick={handleCancel}
          variant="outline"
          size="sm"
        >
          <X className="w-4 h-4 mr-2" />
          Cancelar
        </Button>
        <Button 
          onClick={handleSave}
          className="finwise-gradient-button"
          size="sm"
        >
          <Check className="w-4 h-4 mr-2" />
          Salvar
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="valor_vr" className="text-white/70">Total VR</Label>
          <Input
            id="valor_vr"
            type="number"
            step="0.01"
            value={saldos.valor_vr}
            onChange={(e) => setSaldos({ ...saldos, valor_vr: e.target.value })}
            className="bg-white/10 border-white/20 text-white"
          />
        </div>
        <div>
          <Label htmlFor="valor_va" className="text-white/70">Total VA</Label>
          <Input
            id="valor_va"
            type="number"
            step="0.01"
            value={saldos.valor_va}
            onChange={(e) => setSaldos({ ...saldos, valor_va: e.target.value })}
            className="bg-white/10 border-white/20 text-white"
          />
        </div>
        <div>
          <Label htmlFor="valor_investimentos" className="text-white/70">Total Investido</Label>
          <Input
            id="valor_investimentos"
            type="number"
            step="0.01"
            value={saldos.valor_investimentos}
            onChange={(e) => setSaldos({ ...saldos, valor_investimentos: e.target.value })}
            className="bg-white/10 border-white/20 text-white"
          />
        </div>
        <div>
          <Label htmlFor="valor_reserva_financeira" className="text-white/70">Reserva de Emergência</Label>
          <Input
            id="valor_reserva_financeira"
            type="number"
            step="0.01"
            value={saldos.valor_reserva_financeira}
            onChange={(e) => setSaldos({ ...saldos, valor_reserva_financeira: e.target.value })}
            className="bg-white/10 border-white/20 text-white"
          />
        </div>
      </div>
    </div>
  );
}
