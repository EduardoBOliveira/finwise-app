
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Target, TrendingUp, Calendar, CheckCircle2 } from "lucide-react";

interface Objetivo {
  id: string;
  titulo: string;
  categoria: string;
  valor_objetivo: number;
  valor_atual: number;
  prioridade: string;
  data_objetivo: string;
}

export function OverviewObjetivos() {
  const { user } = useAuth();
  const [objetivos, setObjetivos] = useState<Objetivo[]>([]);

  useEffect(() => {
    const fetchObjetivos = async () => {
      if (!user?.id) return;

      const { data, error } = await supabase
        .from('objetivos')
        .select('*')
        .eq('usuario_id', user.id)
        .order('prioridade', { ascending: true })
        .limit(6);

      if (error) {
        console.error('Erro ao buscar objetivos:', error);
        return;
      }

      // Ordenar: em progresso primeiro, concluídos depois
      const sorted = (data || []).sort((a, b) => {
        const aCompleted = a.valor_atual >= a.valor_objetivo;
        const bCompleted = b.valor_atual >= b.valor_objetivo;
        if (aCompleted === bCompleted) return 0;
        return aCompleted ? 1 : -1;
      });

      setObjetivos(sorted.slice(0, 3));
    };

    fetchObjetivos();
  }, [user?.id]);

  const getPrioridadeColor = (prioridade: string) => {
    switch (prioridade) {
      case 'alta': return 'text-red-400';
      case 'media': return 'text-yellow-400';
      case 'baixa': return 'text-green-400';
      default: return 'text-white/70';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const calcularProgresso = (valorAtual: number, valorObjetivo: number) => {
    return Math.min((valorAtual / valorObjetivo) * 100, 100);
  };

  if (objetivos.length === 0) {
    return (
      <div className="finwise-glass-card hover:shadow-lg hover:shadow-purple-500/10 transition-all duration-300">
        <div className="flex items-center mb-6">
          <div className="finwise-icon-container finwise-icon-purple mr-3">
            <Target className="w-6 h-6" />
          </div>
          <h3 className="text-white text-xl font-bold">Objetivos & Metas</h3>
        </div>
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Target className="w-8 h-8 text-purple-400" />
          </div>
          <p className="text-white/70 mb-4">Nenhum objetivo cadastrado</p>
          <a 
            href="/objetivos" 
            className="inline-flex items-center px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors duration-200"
          >
            Criar primeiro objetivo
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="finwise-glass-card hover:shadow-lg hover:shadow-purple-500/10 transition-all duration-300">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <div className="finwise-icon-container finwise-icon-purple mr-3">
            <Target className="w-6 h-6" />
          </div>
          <h3 className="text-white text-xl font-bold">Objetivos & Metas</h3>
        </div>
        <a 
          href="/objetivos" 
          className="text-purple-400 hover:text-purple-300 text-sm font-medium transition-colors duration-200"
        >
          Ver todos →
        </a>
      </div>

      <div className="space-y-4">
        {objetivos.map((objetivo) => {
          const progresso = calcularProgresso(objetivo.valor_atual, objetivo.valor_objetivo);
          const isCompleted = progresso >= 100;
          
          return (
            <div 
              key={objetivo.id} 
              className={`relative rounded-lg p-4 transition-all duration-200 ${
                isCompleted 
                  ? 'bg-green-500/10 border border-green-500/20 hover:bg-green-500/15' 
                  : 'bg-white/5 hover:bg-white/10'
              }`}
            >
              {/* Badge de concluído */}
              {isCompleted && (
                <div className="absolute -top-2 -right-2 bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  ATINGIDA
                </div>
              )}
              
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h4 className={`font-semibold mb-1 ${isCompleted ? 'text-green-300' : 'text-white'}`}>
                    {objetivo.titulo}
                  </h4>
                  <div className="flex items-center space-x-4 text-sm">
                    <span className="text-white/60">{objetivo.categoria}</span>
                    <span className={`font-medium ${getPrioridadeColor(objetivo.prioridade)}`}>
                      {objetivo.prioridade} prioridade
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`font-semibold text-sm ${isCompleted ? 'text-green-300' : 'text-white'}`}>
                    R$ {objetivo.valor_atual.toLocaleString('pt-BR')}
                  </div>
                  <div className="text-white/60 text-xs">
                    de R$ {objetivo.valor_objetivo.toLocaleString('pt-BR')}
                  </div>
                </div>
              </div>

              <div className="mb-3">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-white/70">Progresso</span>
                  <span className={`font-medium ${isCompleted ? 'text-green-300' : 'text-white'}`}>
                    {progresso.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${
                      isCompleted 
                        ? 'bg-gradient-to-r from-green-500 to-emerald-400' 
                        : 'bg-gradient-to-r from-purple-500 to-blue-500'
                    }`}
                    style={{ width: `${progresso}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center text-white/60">
                  <Calendar className="w-3 h-3 mr-1" />
                  Meta: {formatDate(objetivo.data_objetivo)}
                </div>
                {isCompleted && (
                  <div className="flex items-center text-green-400 font-medium">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Meta Alcançada! 🎉
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
