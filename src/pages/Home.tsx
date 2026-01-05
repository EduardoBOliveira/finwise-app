
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle, BarChart3, PiggyBank, CreditCard, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";

const Home = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleGetStarted = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      navigate('/auth');
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const features = [
    "Controle de Receitas e Despesas",
    "Gestão de Investimentos",
    "Análise de Faturas de Cartão",
    "Dashboard Inteligente",
    "Controle de VR/VA",
    "Relatórios Detalhados"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-purple-800 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-72 h-72 bg-finwise-blue/20 rounded-full filter blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-finwise-pink/20 rounded-full filter blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-finwise-purple/20 rounded-full filter blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 p-6">
        <div className="flex justify-between items-center max-w-7xl mx-auto">
          <div className="text-2xl font-bold">
            <span className="bg-finwise-gradient bg-clip-text text-transparent">FinWise</span>
          </div>
          
          {user ? (
            <div className="flex items-center gap-4">
              <span className="text-white/70">Olá, {user.email}</span>
              <Button onClick={handleSignOut} variant="outline" className="border-white/20 text-white hover:bg-white/10">
                Sair
              </Button>
              <Button onClick={() => navigate('/dashboard')} className="bg-finwise-gradient hover:bg-finwise-gradient-dark">
                Dashboard
              </Button>
            </div>
          ) : (
            <Button onClick={() => navigate('/auth')} className="bg-finwise-gradient hover:bg-finwise-gradient-dark">
              Entrar
            </Button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Content */}
          <div className={`space-y-8 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'}`}>
            <div className="space-y-4">
              <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
                <span className="text-white">Bem-vindo ao</span>
                <br />
                <span className="bg-finwise-gradient bg-clip-text text-transparent">FinWise</span>
              </h1>
              <p className="text-xl text-white/80 leading-relaxed">
                Controle total das suas finanças pessoais com inteligência e simplicidade. 
                Organize receitas, despesas, investimentos e muito mais.
              </p>
            </div>

            {/* Features List */}
            <div className="space-y-3">
              {features.map((feature, index) => (
                <div 
                  key={index}
                  className={`flex items-center gap-3 transition-all duration-700 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-5'}`}
                  style={{ transitionDelay: `${index * 100}ms` }}
                >
                  <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                  <span className="text-white/90">{feature}</span>
                </div>
              ))}
            </div>

            {/* CTA Button */}
            <div className={`transition-all duration-1000 delay-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}>
              <Button 
                onClick={handleGetStarted}
                size="lg"
                className="bg-finwise-gradient hover:bg-finwise-gradient-dark text-white font-semibold px-8 py-4 rounded-2xl transition-all duration-300 hover:scale-105 group"
              >
                {user ? 'Ir para Dashboard' : 'Comece Agora'}
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </div>

          {/* Right Column - Visual Elements */}
          <div className={`relative transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'}`}>
            <div className="grid grid-cols-2 gap-6">
              {/* Cards Grid */}
              <div className="space-y-6">
                <div className="glass-card p-6 rounded-2xl border border-white/10 hover:scale-105 transition-all duration-300">
                  <BarChart3 className="w-8 h-8 text-finwise-blue mb-4" />
                  <h3 className="text-white font-semibold mb-2">Dashboard</h3>
                  <p className="text-white/60 text-sm">Visualize suas finanças em tempo real</p>
                </div>
                
                <div className="glass-card p-6 rounded-2xl border border-white/10 hover:scale-105 transition-all duration-300 delay-100">
                  <CreditCard className="w-8 h-8 text-finwise-pink mb-4" />
                  <h3 className="text-white font-semibold mb-2">Faturas</h3>
                  <p className="text-white/60 text-sm">Controle suas faturas de cartão</p>
                </div>
              </div>
              
              <div className="space-y-6 mt-12">
                <div className="glass-card p-6 rounded-2xl border border-white/10 hover:scale-105 transition-all duration-300 delay-200">
                  <PiggyBank className="w-8 h-8 text-finwise-purple mb-4" />
                  <h3 className="text-white font-semibold mb-2">Investimentos</h3>
                  <p className="text-white/60 text-sm">Acompanhe seus investimentos</p>
                </div>
                
                <div className="glass-card p-6 rounded-2xl border border-white/10 hover:scale-105 transition-all duration-300 delay-300">
                  <TrendingUp className="w-8 h-8 text-green-400 mb-4" />
                  <h3 className="text-white font-semibold mb-2">Receitas</h3>
                  <p className="text-white/60 text-sm">Gerencie suas fontes de renda</p>
                </div>
              </div>
            </div>

            {/* Floating Elements */}
            <div className="absolute -top-4 -right-4 w-16 h-16 bg-finwise-gradient rounded-full opacity-20 animate-bounce"></div>
            <div className="absolute -bottom-8 -left-4 w-12 h-12 bg-finwise-blue/30 rounded-full opacity-40 animate-pulse"></div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 text-center py-8 text-white/60">
        <p>&copy; 2024 FinWise. Controle financeiro inteligente.</p>
      </footer>
    </div>
  );
};

export default Home;
