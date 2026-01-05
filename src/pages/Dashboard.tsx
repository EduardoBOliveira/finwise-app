import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { NavBar } from "@/components/NavBar";
import { Wallet, TrendingUp, TrendingDown, PiggyBank, Shield, CreditCard, Banknote, HelpCircle } from "lucide-react";
import { ValeCard } from "@/components/dashboard/ValeCard";
import { RankingGastos } from "@/components/dashboard/RankingGastos";
import { ReceitasDespesasChart } from "@/components/dashboard/ReceitasDespesasChart";
import { DespesasCategoriaChart } from "@/components/dashboard/DespesasCategoriaChart";
import { OverviewObjetivos } from "@/components/dashboard/OverviewObjetivos";
import { InsightsFinanceiros } from "@/components/dashboard/InsightsFinanceiros";
import { FiltroAno } from "@/components/FiltroAno";

export default function Dashboard() {
  const { user } = useAuth();
  const currentYear = new Date().getFullYear();
  const [anoSelecionado, setAnoSelecionado] = useState(currentYear.toString());
  const [anosDisponiveis, setAnosDisponiveis] = useState<number[]>([]);
  const [totalReceitas, setTotalReceitas] = useState(0);
  const [totalDespesas, setTotalDespesas] = useState(0);
  const [totaisFinanceiros, setTotaisFinanceiros] = useState({
    total_vr: 0,
    total_va: 0,
    total_investimentos: 0,
    total_reserva_emergencia: 0,
    total_geral_vrva: 0,
    total_geral_investimentos: 0
  });

  // Buscar anos disponíveis
  useEffect(() => {
    const fetchAnosDisponiveis = async () => {
      if (!user) return;

      const [receitasRes, despesasRes, investimentosRes] = await Promise.all([
        supabase.from('receitas').select('data').eq('usuario_id', user.id),
        supabase.from('despesas').select('data').eq('usuario_id', user.id),
        supabase.from('investimentos').select('data').eq('usuario_id', user.id)
      ]);

      const anos = new Set<number>();
      
      receitasRes.data?.forEach(r => {
        if (r.data) anos.add(new Date(r.data).getFullYear());
      });
      despesasRes.data?.forEach(d => {
        if (d.data) anos.add(new Date(d.data).getFullYear());
      });
      investimentosRes.data?.forEach(i => {
        if (i.data) anos.add(new Date(i.data).getFullYear());
      });

      setAnosDisponiveis(Array.from(anos).sort((a, b) => b - a));
    };

    fetchAnosDisponiveis();
  }, [user]);

  useEffect(() => {
    const fetchReceitas = async () => {
      if (user) {
        let query = supabase
          .from('receitas')
          .select('valor')
          .eq('usuario_id', user.id);

        if (anoSelecionado !== 'all') {
          query = query
            .gte('data', `${anoSelecionado}-01-01`)
            .lte('data', `${anoSelecionado}-12-31`);
        }

        const { data, error } = await query;

        if (error) {
          console.error("Erro ao buscar receitas:", error);
          return;
        }

        const total = data.reduce((acc, receita) => acc + (receita.valor || 0), 0);
        setTotalReceitas(total);
      }
    };

    fetchReceitas();
  }, [user, anoSelecionado]);

  useEffect(() => {
    const fetchDespesas = async () => {
      if (user) {
        let query = supabase
          .from('despesas')
          .select('valor')
          .eq('usuario_id', user.id);

        if (anoSelecionado !== 'all') {
          query = query
            .gte('data', `${anoSelecionado}-01-01`)
            .lte('data', `${anoSelecionado}-12-31`);
        }

        const { data, error } = await query;

        if (error) {
          console.error("Erro ao buscar despesas:", error);
          return;
        }

        const total = data.reduce((acc, despesa) => acc + (despesa.valor || 0), 0);
        setTotalDespesas(total);
      }
    };

    fetchDespesas();
  }, [user, anoSelecionado]);

  useEffect(() => {
    const fetchTotaisFinanceiros = async () => {
      if (user) {
        const { data, error } = await supabase
          .from('totais_financeiros')
          .select('*')
          .eq('usuario_id', user.id)
          .single();

        if (error) {
          console.error("Erro ao buscar totais financeiros:", error);
          return;
        }

        if (data) {
          setTotaisFinanceiros({
            total_vr: data.total_vr || 0,
            total_va: data.total_va || 0,
            total_investimentos: data.total_investimentos || 0,
            total_reserva_emergencia: data.total_reserva_emergencia || 0,
            total_geral_vrva: data.total_geral_vrva || 0,
            total_geral_investimentos: data.total_geral_investimentos || 0
          });
        }
      }
    };

    fetchTotaisFinanceiros();
  }, [user]);

  // Saldo Total = Receitas - Despesas
  const saldoTotal = totalReceitas - totalDespesas;

  return (
    <div className="min-h-screen">
      <NavBar />
      <div className="p-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center space-x-3">
            <h1 className="finwise-page-title">Dashboard</h1>
            <a 
              href="/ajuda#dashboard" 
              className="text-white/50 hover:text-white/80 transition-colors"
              title="Ajuda sobre Dashboard"
            >
              <HelpCircle className="w-5 h-5" />
            </a>
          </div>
          <p className="finwise-page-subtitle">Acompanhe suas finanças em tempo real</p>
          
          {/* Filtro de Ano */}
          <div className="flex justify-center mt-4">
            <FiltroAno
              anos={anosDisponiveis}
              anoSelecionado={anoSelecionado}
              onAnoChange={setAnoSelecionado}
              showOverall={true}
            />
          </div>
        </div>

        {/* 5 Cards principais */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          {/* Saldo Total */}
          <div className="finwise-glass-card hover:scale-105 transition-transform duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="finwise-icon-container finwise-icon-blue">
                <Wallet className="w-6 h-6" />
              </div>
            </div>
            <h3 className="finwise-card-title">Saldo Total</h3>
            <p className={`finwise-value-text ${saldoTotal >= 0 ? 'finwise-text-green' : 'finwise-text-red'}`}>
              R$ {saldoTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>

          {/* Total Receitas */}
          <div className="finwise-glass-card hover:scale-105 transition-transform duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="finwise-icon-container finwise-icon-green">
                <TrendingUp className="w-6 h-6" />
              </div>
            </div>
            <h3 className="finwise-card-title">Receitas Totais</h3>
            <p className="finwise-value-text finwise-text-green">
              R$ {totalReceitas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>

          {/* Total Despesas */}
          <div className="finwise-glass-card hover:scale-105 transition-transform duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="finwise-icon-container finwise-icon-red">
                <TrendingDown className="w-6 h-6" />
              </div>
            </div>
            <h3 className="finwise-card-title">Despesas Totais</h3>
            <p className="finwise-value-text finwise-text-red">
              R$ {totalDespesas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>

          {/* Total Investido */}
          <div className="finwise-glass-card hover:scale-105 transition-transform duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="finwise-icon-container finwise-icon-purple">
                <PiggyBank className="w-6 h-6" />
              </div>
            </div>
            <h3 className="finwise-card-title">Total Investido</h3>
            <p className="finwise-value-text finwise-text-blue">
              R$ {totaisFinanceiros.total_investimentos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>

          {/* Reserva de Emergência */}
          <div className="finwise-glass-card hover:scale-105 transition-transform duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="finwise-icon-container finwise-icon-yellow">
                <Shield className="w-6 h-6" />
              </div>
            </div>
            <h3 className="finwise-card-title">Reserva de Emergência</h3>
            <p className="finwise-value-text finwise-text-blue">
              R$ {totaisFinanceiros.total_reserva_emergencia.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <ReceitasDespesasChart anoSelecionado={anoSelecionado} />
          <DespesasCategoriaChart anoSelecionado={anoSelecionado} />
        </div>

        {/* Vale Cards + Ranking Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="space-y-6">
            <ValeCard 
              tipo="VR" 
              titulo="Vale Refeição"
              icon={<CreditCard className="w-6 h-6" />}
              anoSelecionado={anoSelecionado}
            />
            <ValeCard 
              tipo="VA" 
              titulo="Vale Alimentação"
              icon={<Banknote className="w-6 h-6" />}
              anoSelecionado={anoSelecionado}
            />
          </div>
          
          <div className="lg:col-span-2">
            <RankingGastos anoSelecionado={anoSelecionado} />
          </div>
        </div>

        {/* Overview Objetivos */}
        <div className="mb-8">
          <OverviewObjetivos />
        </div>

        {/* Insights Financeiros */}
        <InsightsFinanceiros />
      </div>
    </div>
  );
}
