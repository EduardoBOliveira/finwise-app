
import { Bell, User, LogOut, Home, TrendingUp, TrendingDown, CreditCard, PiggyBank, Receipt, Target, Calendar } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export function NavBar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [nomeUsuario, setNomeUsuario] = useState("");

  useEffect(() => {
    const fetchUserName = async () => {
      if (user?.id) {
        const { data } = await supabase
          .from('profiles')
          .select('nome')
          .eq('id', user.id)
          .single();
        
        if (data?.nome) {
          setNomeUsuario(data.nome);
        }
      }
    };

    fetchUserName();
  }, [user?.id]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const menuItems = [
    { label: "Dashboard", path: "/dashboard", icon: <Home className="w-4 h-4" /> },
    { label: "Planejamento", path: "/planejamento", icon: <Calendar className="w-4 h-4" /> },
    { label: "Receitas", path: "/receitas", icon: <TrendingUp className="w-4 h-4" /> },
    { label: "Despesas", path: "/despesas", icon: <TrendingDown className="w-4 h-4" /> },
    { label: "VR & VA", path: "/vr-va", icon: <CreditCard className="w-4 h-4" /> },
    { label: "Investimentos", path: "/investimentos", icon: <PiggyBank className="w-4 h-4" /> },
    { label: "Objetivos", path: "/objetivos", icon: <Target className="w-4 h-4" /> },
    { label: "Faturas", path: "/faturas", icon: <Receipt className="w-4 h-4" /> }
  ];

  return (
    <nav className="finwise-navbar px-4 sm:px-6 lg:px-8 py-4">
      <div className="flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2 sm:space-x-3 cursor-pointer">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center" style={{
            background: 'linear-gradient(135deg, #8B5CF6 0%, #A855F7 50%, #C084FC 100%)'
          }}>
            <PiggyBank className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
          </div>
          <span className="text-white font-bold text-lg sm:text-xl">FinWise</span>
        </Link>

        {/* Menu Items - Hidden on small screens, shown on medium and up */}
        <div className="hidden lg:flex items-center space-x-4 xl:space-x-6">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center space-x-2 px-2 xl:px-4 py-2 rounded-lg transition-all duration-200 ${
                location.pathname === item.path
                  ? 'bg-white/10 text-white'
                  : 'text-white/70 hover:text-white hover:bg-white/5'
              }`}
            >
              {item.icon}
              <span className="text-xs xl:text-sm font-medium">{item.label}</span>
            </Link>
          ))}
        </div>

        {/* Compact Menu for medium screens */}
        <div className="hidden md:flex lg:hidden items-center space-x-2">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center justify-center p-2 rounded-lg transition-all duration-200 ${
                location.pathname === item.path
                  ? 'bg-white/10 text-white'
                  : 'text-white/70 hover:text-white hover:bg-white/5'
              }`}
              title={item.label}
            >
              {item.icon}
            </Link>
          ))}
        </div>

        {/* User Actions */}
        <div className="flex items-center space-x-2 sm:space-x-4">
          <button className="p-2 text-white/70 hover:text-white hover:bg-white/5 rounded-lg transition-all duration-200">
            <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          <Link 
            to="/configuracoes"
            className="flex items-center space-x-2 bg-white/5 rounded-lg px-2 sm:px-3 py-2 hover:bg-white/10 transition-all duration-200"
          >
            <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center" style={{
              background: 'linear-gradient(135deg, #8B5CF6 0%, #A855F7 50%, #C084FC 100%)'
            }}>
              <User className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
            </div>
            <span className="text-white text-xs sm:text-sm font-medium hidden sm:inline">{nomeUsuario || "Usuário"}</span>
          </Link>
          <button 
            onClick={handleSignOut}
            className="flex items-center space-x-2 bg-white/5 rounded-lg px-2 sm:px-3 py-2 hover:bg-white/10 transition-all duration-200"
          >
            <LogOut className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
            <span className="text-white text-xs sm:text-sm font-medium hidden sm:inline">Sair</span>
          </button>
        </div>
      </div>

      {/* Mobile Menu - Only visible on small screens */}
      <div className="md:hidden mt-4 overflow-x-auto">
        <div className="flex space-x-2 pb-2">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 whitespace-nowrap ${
                location.pathname === item.path
                  ? 'bg-white/10 text-white'
                  : 'text-white/70 hover:text-white hover:bg-white/5'
              }`}
            >
              {item.icon}
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
