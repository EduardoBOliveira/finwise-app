
import { useState, useEffect } from "react";
import { Edit, Trash2, Plus, PiggyBank, TrendingUp, CreditCard, ShoppingBag, Plane, Shield, Calendar, Target, ChevronDown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";

interface Objetivo {
  id: string;
  titulo: string;
  categoria: string;
  descricao?: string;
  valor_objetivo: number;
  valor_atual: number;
  prioridade: string;
  data_objetivo: string;
}

interface ChecklistItem {
  id: string;
  titulo: string;
  concluido: boolean;
}

interface CardObjetivoProps {
  objetivo: Objetivo;
  onEdit: () => void;
  onDelete: () => void;
  onUpdate: () => void;
}

const getCategoryIcon = (categoria: string) => {
  switch (categoria) {
    case 'Poupança': return PiggyBank;
    case 'Investimento': return TrendingUp;
    case 'Quitação de Dívida': return CreditCard;
    case 'Compra': return ShoppingBag;
    case 'Viagem': return Plane;
    case 'Emergência': return Shield;
    default: return Target;
  }
};

const getPriorityColor = (prioridade: string) => {
  switch (prioridade) {
    case 'Alta': return 'bg-red-500/20 text-red-300 border-red-500/30';
    case 'Média': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
    case 'Baixa': return 'bg-green-500/20 text-green-300 border-green-500/30';
    default: return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
  }
};

export function CardObjetivo({ objetivo, onEdit, onDelete, onUpdate }: CardObjetivoProps) {
  const [checklists, setChecklists] = useState<ChecklistItem[]>([]);
  const [showAporteForm, setShowAporteForm] = useState(false);
  const [valorAporte, setValorAporte] = useState("");
  const [showTasks, setShowTasks] = useState(false);

  const IconComponent = getCategoryIcon(objetivo.categoria);
  const progressPercent = objetivo.valor_objetivo > 0 ? (objetivo.valor_atual / objetivo.valor_objetivo) * 100 : 0;
  const valorRestante = objetivo.valor_objetivo - objetivo.valor_atual;
  const isCompleted = progressPercent >= 100;
  
  // Calcular dias restantes
  const hoje = new Date();
  const dataObjetivo = new Date(objetivo.data_objetivo);
  const diasRestantes = Math.ceil((dataObjetivo.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
  
  // Calcular economia diária necessária
  const economiaDiaria = diasRestantes > 0 ? valorRestante / diasRestantes : 0;

  const fetchChecklists = async () => {
    const { data } = await supabase
      .from('objetivo_checklists')
      .select('*')
      .eq('objetivo_id', objetivo.id)
      .order('created_at');

    setChecklists(data || []);
  };

  useEffect(() => {
    fetchChecklists();
  }, [objetivo.id]);

  const toggleChecklistItem = async (checklistId: string, concluido: boolean) => {
    await supabase
      .from('objetivo_checklists')
      .update({ concluido: !concluido })
      .eq('id', checklistId);

    fetchChecklists();
  };

  const handleAporte = async () => {
    if (!valorAporte || parseFloat(valorAporte) <= 0) return;

    const novoValorAtual = objetivo.valor_atual + parseFloat(valorAporte);

    await supabase
      .from('objetivos')
      .update({ valor_atual: novoValorAtual })
      .eq('id', objetivo.id);

    setValorAporte("");
    setShowAporteForm(false);
    onUpdate();
  };

  return (
    <div className={`relative backdrop-blur-sm border rounded-2xl p-6 transition-all duration-300 hover:scale-[1.02] ${
      isCompleted 
        ? 'bg-green-900/30 border-green-500/30 hover:border-green-400/50' 
        : 'bg-gray-800/50 border-white/10 hover:border-white/20'
    }`}>
      {/* Badge de Concluído */}
      {isCompleted && (
        <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg flex items-center gap-1">
          <Target className="w-3 h-3" />
          META ATINGIDA
        </div>
      )}
      
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
            isCompleted ? 'bg-green-500' : 'bg-finwise-gradient'
          }`}>
            <IconComponent className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-white font-semibold text-lg">{objetivo.titulo}</h3>
            <div className={`inline-block px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(objetivo.prioridade)}`}>
              {objetivo.prioridade}
            </div>
          </div>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={onEdit}
            className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={onDelete}
            className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Descrição */}
      {objetivo.descricao && (
        <p className="text-white/70 text-sm mb-4">{objetivo.descricao}</p>
      )}

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-sm text-white/70 mb-2">
          <span>Progresso</span>
          <span>{progressPercent.toFixed(1)}%</span>
        </div>
        <Progress value={progressPercent} className="h-2" />
        <div className="flex justify-between text-sm text-white/70 mt-1">
          <span>R$ {objetivo.valor_atual.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
          <span>R$ {objetivo.valor_objetivo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
        </div>
      </div>

      {/* Informações */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-white/70 text-sm">
          <Calendar className="w-4 h-4" />
          <span>
            {diasRestantes > 0 
              ? `${diasRestantes} dias restantes` 
              : diasRestantes === 0 
                ? 'Meta vence hoje!' 
                : `${Math.abs(diasRestantes)} dias em atraso`
            }
          </span>
        </div>
        
        {valorRestante > 0 && (
          <>
            <p className="text-white/70 text-sm">
              Restam R$ {valorRestante.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} para atingir a meta
            </p>
            
            {diasRestantes > 0 && (
              <p className="text-white/70 text-sm">
                Economize R$ {economiaDiaria.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} por dia
              </p>
            )}
          </>
        )}
      </div>

      {/* Checklists */}
      {checklists.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-white font-medium text-sm">Tarefas:</h4>
            <button
              onClick={() => setShowTasks(!showTasks)}
              className="p-1 text-white/70 hover:text-white hover:bg-white/10 rounded transition-colors"
            >
              <ChevronDown className={`w-4 h-4 transition-transform ${showTasks ? 'rotate-180' : ''}`} />
            </button>
          </div>
          {showTasks && (
            <div className="space-y-2">
              {checklists.map((item) => (
                <div key={item.id} className="flex items-center gap-2">
                  <Checkbox
                    checked={item.concluido}
                    onCheckedChange={() => toggleChecklistItem(item.id, item.concluido)}
                  />
                  <span className={`text-sm ${item.concluido ? 'line-through text-white/50' : 'text-white/70'}`}>
                    {item.titulo}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Botão de Aporte ou Mensagem de Concluído */}
      {isCompleted ? (
        <div className="w-full bg-green-500/20 border border-green-500/30 text-green-300 font-medium py-3 rounded-lg text-center flex items-center justify-center gap-2">
          <Target className="w-5 h-5" />
          Objetivo Alcançado! 🎉
        </div>
      ) : !showAporteForm ? (
        <Button
          onClick={() => setShowAporteForm(true)}
          className="w-full bg-finwise-gradient hover:opacity-90 text-white font-medium"
          disabled={valorRestante <= 0}
        >
          <Plus className="w-4 h-4 mr-2" />
          Fazer Aporte
        </Button>
      ) : (
        <div className="space-y-2">
          <Input
            type="number"
            min="0"
            step="0.01"
            placeholder="Valor do aporte (R$)"
            value={valorAporte}
            onChange={(e) => setValorAporte(e.target.value)}
            className="bg-gray-700 border-gray-600 text-white"
          />
          <div className="flex gap-2">
            <Button
              onClick={handleAporte}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
              disabled={!valorAporte || parseFloat(valorAporte) <= 0}
            >
              Confirmar
            </Button>
            <Button
              onClick={() => {
                setShowAporteForm(false);
                setValorAporte("");
              }}
              variant="outline"
              className="flex-1 border-white/20 text-white hover:bg-white/10"
            >
              Cancelar
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
