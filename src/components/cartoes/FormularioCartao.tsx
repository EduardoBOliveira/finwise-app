
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";

interface FormularioCartaoProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editingCartao?: any;
}

export function FormularioCartao({ isOpen, onClose, onSuccess, editingCartao }: FormularioCartaoProps) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    apelido: "",
    bandeira: "",
    fechamento_fatura: "",
    vencimento_fatura: "",
    limite_total: ""
  });

  useEffect(() => {
    if (editingCartao) {
      setFormData({
        apelido: editingCartao.apelido || "",
        bandeira: editingCartao.bandeira || "",
        fechamento_fatura: editingCartao.fechamento_fatura?.toString() || "",
        vencimento_fatura: editingCartao.vencimento_fatura?.toString() || "",
        limite_total: editingCartao.limite_total?.toString() || ""
      });
    } else {
      setFormData({
        apelido: "",
        bandeira: "",
        fechamento_fatura: "",
        vencimento_fatura: "",
        limite_total: ""
      });
    }
  }, [editingCartao]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;

    const cartaoData = {
      apelido: formData.apelido,
      bandeira: formData.bandeira,
      fechamento_fatura: parseInt(formData.fechamento_fatura),
      vencimento_fatura: parseInt(formData.vencimento_fatura),
      limite_total: parseFloat(formData.limite_total) || 0,
      usuario_id: user.id
    };

    try {
      if (editingCartao) {
        const { error } = await supabase
          .from('cartoes')
          .update(cartaoData)
          .eq('id', editingCartao.id);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('cartoes')
          .insert([cartaoData]);
        
        if (error) throw error;
      }
      
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Erro ao salvar cartão:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-900 p-6 rounded-lg w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-white text-lg font-semibold">
            {editingCartao ? 'Editar Cartão' : 'Novo Cartão'}
          </h3>
          <button onClick={onClose} className="text-white/70 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="apelido" className="text-white/70 text-sm mb-1 block">Apelido do Cartão</Label>
            <Input
              id="apelido"
              placeholder="Apelido do cartão (ex: Nubank, Santander Visa)"
              value={formData.apelido}
              onChange={(e) => setFormData({...formData, apelido: e.target.value})}
              required
              className="bg-gray-800 border-gray-700 text-white"
            />
          </div>
          
          <div>
            <Label className="text-white/70 text-sm mb-1 block">Bandeira</Label>
            <Select value={formData.bandeira} onValueChange={(value) => setFormData({...formData, bandeira: value})}>
              <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                <SelectValue placeholder="Bandeira" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Visa">Visa</SelectItem>
                <SelectItem value="Mastercard">Mastercard</SelectItem>
                <SelectItem value="Elo">Elo</SelectItem>
                <SelectItem value="American Express">American Express</SelectItem>
                <SelectItem value="Hipercard">Hipercard</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="fechamento_fatura" className="text-white/70 text-sm mb-1 block">Dia de Fechamento da Fatura</Label>
            <Input
              id="fechamento_fatura"
              type="number"
              min="1"
              max="31"
              placeholder="Dia de fechamento da fatura (1-31)"
              value={formData.fechamento_fatura}
              onChange={(e) => setFormData({...formData, fechamento_fatura: e.target.value})}
              required
              className="bg-gray-800 border-gray-700 text-white"
            />
          </div>
          
          <div>
            <Label htmlFor="vencimento_fatura" className="text-white/70 text-sm mb-1 block">Dia de Vencimento da Fatura</Label>
            <Input
              id="vencimento_fatura"
              type="number"
              min="1"
              max="31"
              placeholder="Dia de vencimento da fatura (1-31)"
              value={formData.vencimento_fatura}
              onChange={(e) => setFormData({...formData, vencimento_fatura: e.target.value})}
              required
              className="bg-gray-800 border-gray-700 text-white"
            />
          </div>
          
          <div>
            <Label htmlFor="limite_total" className="text-white/70 text-sm mb-1 block">Limite Total do Cartão</Label>
            <Input
              id="limite_total"
              type="number"
              min="0"
              step="0.01"
              placeholder="Limite total do cartão (R$)"
              value={formData.limite_total}
              onChange={(e) => setFormData({...formData, limite_total: e.target.value})}
              className="bg-gray-800 border-gray-700 text-white"
            />
          </div>
          
          <div className="flex space-x-2">
            <Button type="submit" className="flex-1 bg-red-600 hover:bg-red-700">
              {editingCartao ? 'Confirmar Edição' : 'Salvar'}
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
