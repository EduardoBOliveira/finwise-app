
import { useState } from "react";
import { ChevronDown, ChevronUp, Calendar, ShoppingCart, CreditCard } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Despesa {
  id: string;
  data: string;
  descricao: string;
  valor: number;
  categoria: string;
  modalidade: string;
  cartao_id: string;
  parcelas_total: number;
  parcela_atual: number;
  valor_parcela: number;
  id_compra: string;
  status: string;
  data_compra: string;
  data_pagamento: string;
}

interface Parcela {
  numero: number;
  dataCompra: Date;
  dataPagamento: Date;
  valor: number;
  paga: boolean;
  despesaId: string;
}

interface ParcelasCardProps {
  despesa: Despesa;
  parcelasPagas: Set<number>;
  expandedCards: Set<string>;
  onToggleExpansion: (despesaId: string) => void;
  onToggleParcelaPaga: (despesa: Despesa, numeroParcela: number) => Promise<void>;
  getCategoriaIcon: (categoria: string) => string;
  formatDate: (dateString: string) => string;
  todasParcelasDaCompra: Despesa[];
}

export const ParcelasCard = ({ 
  despesa, 
  parcelasPagas, 
  expandedCards, 
  onToggleExpansion, 
  onToggleParcelaPaga, 
  getCategoriaIcon, 
  formatDate,
  todasParcelasDaCompra
}: ParcelasCardProps) => {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(expandedCards.has(despesa.id));

  // Usar as parcelas reais do banco de dados
  const gerarParcelasReais = (): Parcela[] => {
    return todasParcelasDaCompra.map((parcelaData) => ({
      numero: parcelaData.parcela_atual,
      dataCompra: new Date(parcelaData.data_compra + 'T12:00:00-03:00'),
      dataPagamento: new Date(parcelaData.data_pagamento + 'T12:00:00-03:00'),
      valor: parcelaData.valor_parcela,
      paga: parcelaData.status === 'Paga',
      despesaId: parcelaData.id
    })).sort((a, b) => a.numero - b.numero);
  };

  const parcelas = gerarParcelasReais();
  const todasParclasPagas = parcelas.every(p => p.paga);

  const handleToggle = () => {
    setIsOpen(!isOpen);
    onToggleExpansion(despesa.id);
  };

  const handleParcelaToggle = async (numeroParcela: number) => {
    await onToggleParcelaPaga(despesa, numeroParcela);
    // Não alterar o estado isOpen para manter o card aberto
  };

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={handleToggle}
    >
      <Card className="bg-white/5 backdrop-blur-xl border border-white/20 overflow-hidden hover:border-purple-400/30 transition-all duration-300">
        <CollapsibleTrigger asChild>
          <CardContent className="p-4 cursor-pointer">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-2">
                <span className="text-xl">{getCategoriaIcon(despesa.categoria)}</span>
                <div>
                  <span className="text-sm font-medium text-white block">{despesa.descricao}</span>
                  <span className="text-xs text-white/60">💳 Cartão de Crédito</span>
                </div>
              </div>
              {expandedCards.has(despesa.id) ? (
                <ChevronUp className="w-4 h-4 text-white/60" />
              ) : (
                <ChevronDown className="w-4 h-4 text-white/60" />
              )}
            </div>
            
            <div className="space-y-2 text-xs text-white/70 mb-3">
              <div className="flex items-center space-x-1">
                <ShoppingCart className="w-3 h-3" />
                <span>Compra: {formatDate(despesa.data_compra)}</span>
              </div>
              <div className="flex items-center space-x-1">
                <CreditCard className="w-3 h-3" />
                <span>1ª Parcela: {formatDate(despesa.data_pagamento)}</span>
              </div>
              <div>{despesa.categoria} - {despesa.parcelas_total} parcelas</div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="text-lg font-bold text-purple-400">R$ {despesa.valor.toFixed(2)}</div>
              <Badge 
                className={`text-xs ${todasParclasPagas 
                  ? 'bg-purple-500/20 text-purple-400 border-purple-500/30' 
                  : 'bg-orange-500/20 text-orange-400 border-orange-500/30'
                }`}
              >
                {todasParclasPagas ? '✅ Paga' : '⏳ Pendente'}
              </Badge>
            </div>
          </CardContent>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <div className="px-4 pb-4 border-t border-white/10">
            <div className="mt-3 space-y-2">
              {parcelas.map((parcela) => (
                <div 
                  key={parcela.numero}
                  className="bg-white/5 backdrop-blur-sm p-3 rounded-lg border border-white/20"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div>
                        <div className="text-sm font-medium text-white">R$ {parcela.valor.toFixed(2)}</div>
                        <div className="text-xs text-white/60 space-y-1">
                          <div className="flex items-center space-x-1">
                            <ShoppingCart className="w-3 h-3" />
                            <span>Compra: {parcela.dataCompra.toLocaleDateString('pt-BR', {
                              timeZone: 'America/Sao_Paulo'
                            })}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-3 h-3" />
                            <span>Pagamento: {parcela.dataPagamento.toLocaleDateString('pt-BR', {
                              timeZone: 'America/Sao_Paulo'
                            })}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-white/50 mb-2">
                        Parcela {parcela.numero}/{despesa.parcelas_total}
                      </div>
                      <Button
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleParcelaToggle(parcela.numero);
                        }}
                        className={`text-xs transition-all duration-300 ${
                          parcela.paga 
                            ? 'bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 border border-purple-500/30' 
                            : 'bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 border border-blue-500/30'
                        }`}
                      >
                        {parcela.paga ? '✅ Paga' : `Marcar como Paga`}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
};
