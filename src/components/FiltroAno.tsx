import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "lucide-react";

interface FiltroAnoProps {
  anos: number[];
  anoSelecionado: string;
  onAnoChange: (ano: string) => void;
  showOverall?: boolean;
}

export function FiltroAno({ anos, anoSelecionado, onAnoChange, showOverall = false }: FiltroAnoProps) {
  const currentYear = new Date().getFullYear();
  
  // Garantir que o ano atual esteja sempre disponível
  const anosDisponiveis = anos.length > 0 
    ? [...new Set([...anos, currentYear])].sort((a, b) => b - a)
    : [currentYear];

  return (
    <div className="flex items-center gap-2">
      <Calendar className="w-4 h-4 text-white/50" />
      <Select value={anoSelecionado} onValueChange={onAnoChange}>
        <SelectTrigger className="w-[120px] bg-white/5 border-white/20 text-white text-sm h-9">
          <SelectValue placeholder="Ano" />
        </SelectTrigger>
        <SelectContent className="bg-slate-900 border-white/20">
          {showOverall && (
            <SelectItem value="all" className="text-white hover:bg-white/10">
              Todos
            </SelectItem>
          )}
          {anosDisponiveis.map((ano) => (
            <SelectItem 
              key={ano} 
              value={ano.toString()} 
              className="text-white hover:bg-white/10"
            >
              {ano}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
