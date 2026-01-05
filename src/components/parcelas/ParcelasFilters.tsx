
import { Filter, Clock, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

type FiltroStatus = 'TODAS' | 'PENDENTES' | 'PAGAS';

interface ParcelasFiltersProps {
  filtroAtivo: FiltroStatus;
  setFiltroAtivo: (filtro: FiltroStatus) => void;
}

export const ParcelasFilters = ({ filtroAtivo, setFiltroAtivo }: ParcelasFiltersProps) => {
  const filtros: FiltroStatus[] = ['TODAS', 'PENDENTES', 'PAGAS'];

  return (
    <div className="flex space-x-2">
      {filtros.map((filtro) => (
        <Button
          key={filtro}
          variant={filtroAtivo === filtro ? "default" : "ghost"}
          onClick={() => setFiltroAtivo(filtro)}
          className={`
            relative overflow-hidden rounded-xl border transition-all duration-300
            ${filtroAtivo === filtro 
              ? 'bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border-cyan-400/50 text-cyan-400' 
              : 'border-white/20 text-white/70 hover:border-white/40 hover:text-white'
            }
          `}
        >
          <div className="relative z-10 flex items-center space-x-2">
            {filtro === 'TODAS' && <Filter className="w-4 h-4" />}
            {filtro === 'PENDENTES' && <Clock className="w-4 h-4" />}
            {filtro === 'PAGAS' && <CheckCircle2 className="w-4 h-4" />}
            <span>{filtro}</span>
          </div>
          {filtroAtivo === filtro && (
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 animate-pulse" />
          )}
        </Button>
      ))}
    </div>
  );
};
