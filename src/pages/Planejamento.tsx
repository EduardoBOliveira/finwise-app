
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import { ResumoCards } from "@/components/planejamento/ResumoCards";
import { DespesasFixasPlanejadas } from "@/components/planejamento/DespesasFixasPlanejadas";
import { ReceitasDespesasMes } from "@/components/planejamento/ReceitasDespesasMes";
import { TetoGastos } from "@/components/planejamento/TetoGastos";
import { RecomendacoesInteligentes } from "@/components/planejamento/RecomendacoesInteligentes";
import { DistribuicaoGastos } from "@/components/planejamento/DistribuicaoGastos";
import { ResumoPlayground } from "@/components/planejamento/ResumoPlayground";
import { NavBar } from "@/components/NavBar";
import { useState } from "react";

export default function Planejamento() {
  const [showTetoConfig, setShowTetoConfig] = useState(false);

  return (
    <div className="min-h-screen">
      <NavBar />
      
      <main className="p-8">
        <div className="mb-8 text-center">
          <h1 className="finwise-page-title">Planejamento</h1>
          <h2 className="text-xl text-white/80 mb-4 animate-fade-in">Planejamento Mensal – Junho de 2025</h2>
          <p className="finwise-page-subtitle">
            Esta página não é destinada ao lançamento de dados. Utilize-a para visualizar seu planejamento mensal e tomar decisões com base em suas finanças reais.
          </p>
        </div>

        <div className="space-y-8">
          {/* Seção de Resumo Inicial */}
          <div>
            <ResumoCards />
          </div>

          {/* Card Despesas Fixas Planejadas */}
          <div>
            <DespesasFixasPlanejadas />
          </div>

          {/* Duas colunas - Receitas e Despesas do Mês */}
          <div>
            <ReceitasDespesasMes />
          </div>

          {/* Seção Teto de Gastos */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-white">Teto de Gastos</h3>
              <Button
                onClick={() => setShowTetoConfig(true)}
                variant="outline"
                size="sm"
                className="bg-yellow-500 border-yellow-600 text-black hover:bg-yellow-400"
              >
                <Settings className="w-4 h-4 mr-2" />
                Configurar
              </Button>
            </div>
            <div>
              <TetoGastos showConfig={showTetoConfig} onCloseConfig={() => setShowTetoConfig(false)} />
            </div>
          </div>

          {/* Recomendações Inteligentes */}
          <div>
            <RecomendacoesInteligentes />
          </div>

          {/* Cards finais lado a lado */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <DistribuicaoGastos />
            </div>
            <div>
              <ResumoPlayground />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
