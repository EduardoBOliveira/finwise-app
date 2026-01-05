
import { NavBar } from "@/components/NavBar";
import { GerenciamentoCartoes } from "@/components/cartoes/GerenciamentoCartoes";
import { GerenciamentoPerfil } from "@/components/perfil/GerenciamentoPerfil";
import { GerenciamentoSaldos } from "@/components/saldos/GerenciamentoSaldos";
import { Button } from "@/components/ui/button";
import { Settings, CreditCard, User, DollarSign, HelpCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Configuracoes() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen">
      <NavBar />
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-3">
              <div className="finwise-icon-container finwise-icon-blue">
                <Settings className="w-8 h-8" />
              </div>
              <h1 className="finwise-page-title">Configurações</h1>
            </div>
            <Button
              onClick={() => navigate('/ajuda')}
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10"
            >
              <HelpCircle className="w-4 h-4 mr-2" />
              Ajuda
            </Button>
          </div>
          <p className="finwise-page-subtitle">Gerencie suas configurações e preferências</p>
        </div>

        {/* Seções de Configuração */}
        <div className="space-y-8">
          {/* Seção de Perfil */}
          <div className="finwise-glass-card">
            <div className="flex items-center space-x-3 mb-6">
              <div className="finwise-icon-container finwise-icon-blue">
                <User className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold text-white">Informações Pessoais</h2>
            </div>
            <p className="text-white/70 mb-6">Atualize suas informações de perfil</p>
            <GerenciamentoPerfil />
          </div>

          {/* Seção de Saldos Iniciais */}
          <div className="finwise-glass-card">
            <div className="flex items-center space-x-3 mb-6">
              <div className="finwise-icon-container finwise-icon-green">
                <DollarSign className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold text-white">Saldos Iniciais</h2>
            </div>
            <p className="text-white/70 mb-6">Configure seus saldos iniciais para começar</p>
            <GerenciamentoSaldos />
          </div>

          {/* Seção de Cartões */}
          <div className="finwise-glass-card">
            <div className="flex items-center space-x-3 mb-6">
              <div className="finwise-icon-container finwise-icon-red">
                <CreditCard className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold text-white">Cartões</h2>
            </div>
            <GerenciamentoCartoes />
          </div>
        </div>
      </div>
    </div>
  );
}
