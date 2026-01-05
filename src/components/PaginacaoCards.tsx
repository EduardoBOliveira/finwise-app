import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PaginacaoCardsProps {
  paginaAtual: number;
  totalPaginas: number;
  onPaginaChange: (pagina: number) => void;
  totalItens: number;
  itensPorPagina: number;
}

export function PaginacaoCards({ 
  paginaAtual, 
  totalPaginas, 
  onPaginaChange,
  totalItens,
  itensPorPagina
}: PaginacaoCardsProps) {
  if (totalPaginas <= 1) return null;

  const inicio = (paginaAtual - 1) * itensPorPagina + 1;
  const fim = Math.min(paginaAtual * itensPorPagina, totalItens);

  return (
    <div className="flex items-center justify-between mt-6">
      <div className="text-white/60 text-sm">
        Exibindo {inicio}-{fim} de {totalItens}
      </div>
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPaginaChange(paginaAtual - 1)}
          disabled={paginaAtual === 1}
          className="border-white/20 text-white hover:bg-white/10 disabled:opacity-40"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
        
        <div className="flex items-center space-x-1">
          {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((pagina) => {
            // Mostrar apenas páginas próximas à atual
            if (
              pagina === 1 || 
              pagina === totalPaginas || 
              (pagina >= paginaAtual - 1 && pagina <= paginaAtual + 1)
            ) {
              return (
                <Button
                  key={pagina}
                  variant={pagina === paginaAtual ? "default" : "outline"}
                  size="sm"
                  onClick={() => onPaginaChange(pagina)}
                  className={pagina === paginaAtual 
                    ? "bg-purple-600 hover:bg-purple-700" 
                    : "border-white/20 text-white hover:bg-white/10"
                  }
                >
                  {pagina}
                </Button>
              );
            } else if (
              pagina === paginaAtual - 2 || 
              pagina === paginaAtual + 2
            ) {
              return <span key={pagina} className="text-white/40 px-1">...</span>;
            }
            return null;
          })}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onPaginaChange(paginaAtual + 1)}
          disabled={paginaAtual === totalPaginas}
          className="border-white/20 text-white hover:bg-white/10 disabled:opacity-40"
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
