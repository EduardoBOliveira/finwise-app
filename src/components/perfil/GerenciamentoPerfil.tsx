
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Edit2, Check, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function GerenciamentoPerfil() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [perfil, setPerfil] = useState({
    nome: "",
    sobrenome: "",
    data_nascimento: "",
    celular: ""
  });

  useEffect(() => {
    const fetchPerfil = async () => {
      if (user) {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error("Erro ao buscar perfil:", error);
          return;
        }

        if (data) {
          setPerfil({
            nome: data.nome || "",
            sobrenome: data.sobrenome || "",
            data_nascimento: data.data_nascimento || "",
            celular: data.celular || ""
          });
        }
      }
    };

    fetchPerfil();
  }, [user]);

  const handleSave = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          nome: perfil.nome,
          sobrenome: perfil.sobrenome,
          data_nascimento: perfil.data_nascimento || null,
          celular: perfil.celular,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      toast({
        title: "Perfil atualizado",
        description: "Suas informações pessoais foram salvas com sucesso.",
      });

      setIsEditing(false);
    } catch (error) {
      console.error('Erro ao salvar perfil:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar as informações.",
        variant: "destructive"
      });
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Recarregar dados originais se necessário
  };

  const formatDisplayDate = (dateString) => {
    if (!dateString) return "Não informado";
    const date = new Date(dateString + 'T12:00:00-03:00');
    return date.toLocaleDateString('pt-BR', {
      timeZone: 'America/Sao_Paulo'
    });
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
            <Label className="text-white/70">Nome:</Label>
            <p className="text-white font-medium">{perfil.nome || "Não informado"}</p>
          </div>
          <div>
            <Label className="text-white/70">Sobrenome:</Label>
            <p className="text-white font-medium">{perfil.sobrenome || "Não informado"}</p>
          </div>
          <div>
            <Label className="text-white/70">Data de Nascimento:</Label>
            <p className="text-white font-medium">
              {formatDisplayDate(perfil.data_nascimento)}
            </p>
          </div>
          <div>
            <Label className="text-white/70">Telefone:</Label>
            <p className="text-white font-medium">{perfil.celular || "Não informado"}</p>
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
          <Label htmlFor="nome" className="text-white/70">Nome</Label>
          <Input
            id="nome"
            value={perfil.nome}
            onChange={(e) => setPerfil({ ...perfil, nome: e.target.value })}
            className="bg-white/10 border-white/20 text-white"
          />
        </div>
        <div>
          <Label htmlFor="sobrenome" className="text-white/70">Sobrenome</Label>
          <Input
            id="sobrenome"
            value={perfil.sobrenome}
            onChange={(e) => setPerfil({ ...perfil, sobrenome: e.target.value })}
            className="bg-white/10 border-white/20 text-white"
          />
        </div>
        <div>
          <Label htmlFor="data_nascimento" className="text-white/70">Data de Nascimento</Label>
          <Input
            id="data_nascimento"
            type="date"
            value={perfil.data_nascimento}
            onChange={(e) => setPerfil({ ...perfil, data_nascimento: e.target.value })}
            className="bg-white/10 border-white/20 text-white"
          />
        </div>
        <div>
          <Label htmlFor="celular" className="text-white/70">Telefone</Label>
          <Input
            id="celular"
            value={perfil.celular}
            onChange={(e) => setPerfil({ ...perfil, celular: e.target.value })}
            className="bg-white/10 border-white/20 text-white"
            placeholder="11999999999"
          />
        </div>
      </div>
    </div>
  );
}
