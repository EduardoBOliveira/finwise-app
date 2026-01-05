
import { Package, Zap } from "lucide-react";

interface ParcelasHeaderProps {
  isVisible: boolean;
}

export const ParcelasHeader = ({ isVisible }: ParcelasHeaderProps) => {
  return (
    <div className={`transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-10'}`}>
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-900/50 via-blue-900/50 to-cyan-900/50 p-8 backdrop-blur-xl border border-white/20">
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:60px_60px]" />
        <div className="relative flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 backdrop-blur-xl border border-white/20">
              <Package className="w-10 h-10 text-cyan-400" />
            </div>
            <div>
              <h1 className="text-4xl font-bold mb-2">
                <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Controle de Parcelas
                </span>
              </h1>
              <p className="text-white/70 text-lg flex items-center space-x-2">
                <Zap className="w-5 h-5 text-yellow-400" />
                <span>Gerencie suas parcelas com inteligência</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
