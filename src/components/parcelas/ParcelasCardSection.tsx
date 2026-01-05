
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { ParcelasCard } from "./ParcelasCard";

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

interface ParcelasCardSectionProps {
  cartao: string;
  despesasDoCartao: Despesa[];
  parcelasPagas: {[key: string]: Set<number>};
  expandedCards: Set<string>;
  onToggleExpansion: (despesaId: string) => void;
  onToggleParcelaPaga: (despesa: Despesa, numeroParcela: number) => Promise<void>;
  getCategoriaIcon: (categoria: string) => string;
  formatDate: (dateString: string) => string;
  todasDespesas: Despesa[];
}

export const ParcelasCardSection = ({ 
  cartao, 
  despesasDoCartao, 
  parcelasPagas, 
  expandedCards, 
  onToggleExpansion, 
  onToggleParcelaPaga, 
  getCategoriaIcon, 
  formatDate,
  todasDespesas
}: ParcelasCardSectionProps) => {
  return (
    <div className="space-y-4">
      {/* Section Header */}
      <div className="flex items-center space-x-4">
        <div className="h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent flex-1" />
        <h2 className="text-2xl font-bold text-white bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
          💳 {cartao}
        </h2>
        <div className="h-px bg-gradient-to-r from-transparent via-purple-400 to-transparent flex-1" />
      </div>

      {/* Infinite Carousel for this section */}
      <Carousel
        opts={{
          align: "start",
          loop: true,
        }}
        className="w-full"
      >
        <CarouselContent className="-ml-2 md:-ml-4">
          {despesasDoCartao.map((despesa) => {
            // Encontrar todas as parcelas desta compra
            const todasParcelasDaCompra = todasDespesas.filter(d => d.id_compra === despesa.id_compra);
            
            return (
              <CarouselItem key={despesa.id} className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/3">
                <ParcelasCard
                  despesa={despesa}
                  parcelasPagas={parcelasPagas[despesa.id] || new Set()}
                  expandedCards={expandedCards}
                  onToggleExpansion={onToggleExpansion}
                  onToggleParcelaPaga={onToggleParcelaPaga}
                  getCategoriaIcon={getCategoriaIcon}
                  formatDate={formatDate}
                  todasParcelasDaCompra={todasParcelasDaCompra}
                />
              </CarouselItem>
            );
          })}
        </CarouselContent>
        <CarouselPrevious className="left-2" />
        <CarouselNext className="right-2" />
      </Carousel>
    </div>
  );
};
