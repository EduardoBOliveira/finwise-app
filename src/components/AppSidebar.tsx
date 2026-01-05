
import { TrendingUp, TrendingDown, PiggyBank, Utensils, DollarSign, Settings, LogOut, User, ChevronDown, Target } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";

const items = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: DollarSign,
  },
  {
    title: "Receitas",
    url: "/receitas",
    icon: TrendingUp,
  },
  {
    title: "Despesas",
    url: "/despesas",
    icon: TrendingDown,
  },
  {
    title: "VR & VA",
    url: "/vr-va",
    icon: Utensils,
  },
  {
    title: "Investimentos",
    url: "/investimentos",
    icon: PiggyBank,
  },
  {
    title: "Objetivos",
    url: "/objetivos",
    icon: Target,
  },
];

export function AppSidebar() {
  const location = useLocation();
  const { user, signOut } = useAuth();
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <Sidebar className="glass-card border-r-0 bg-gradient-to-b from-sidebar/95 via-sidebar/90 to-sidebar/95 backdrop-blur-xl">
      <SidebarHeader className="border-b border-white/5 pb-6">
        <Link to="/" className="flex items-center space-x-3 px-6 py-4 hover:bg-white/5 rounded-2xl transition-all duration-300 group">
          <div className="w-14 h-14 bg-finwise-gradient rounded-3xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
            <span className="text-white font-bold text-2xl">F</span>
          </div>
          <div>
            <h1 className="text-3xl font-bold mb-1">
              <span className="bg-finwise-gradient bg-clip-text text-transparent">FinWise</span>
            </h1>
            <p className="text-white/50 text-sm font-medium">Controle Financeiro</p>
          </div>
        </Link>
      </SidebarHeader>
      
      <SidebarContent className="px-4 py-6">
        <SidebarGroup>
          <SidebarGroupLabel className="text-white/60 font-semibold text-sm mb-4 px-4">Menu Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-2">
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild
                    className={`
                      hover:bg-white/5 text-white/70 hover:text-white transition-all duration-300 rounded-2xl p-4 group h-auto
                      ${location.pathname === item.url ? 'bg-finwise-gradient text-white shadow-lg border border-white/10' : 'hover:shadow-md'}
                    `}
                  >
                    <Link to={item.url} className="flex items-center space-x-4">
                      <div className={`
                        w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300
                        ${location.pathname === item.url ? 'bg-white/20' : 'bg-white/5 group-hover:bg-white/10'}
                      `}>
                        <item.icon className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" />
                      </div>
                      <span className="font-medium text-base">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-white/5 pt-6 px-4">
        {/* User Info Section */}
        <div className="bg-white/5 rounded-2xl p-6 mb-4 border border-white/5">
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-12 h-12 bg-finwise-gradient rounded-2xl flex items-center justify-center">
              <User className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-medium text-sm truncate">
                {user?.email || 'Usuário'}
              </p>
              <p className="text-white/50 text-xs">Online</p>
            </div>
          </div>
          
          {/* Quick Actions */}
          <div className="flex space-x-3">
            <Link 
              to="/configuracoes"
              className="flex-1 bg-white/5 hover:bg-white/10 rounded-xl p-3 flex items-center justify-center space-x-2 transition-all duration-300 hover:scale-105"
            >
              <Settings className="w-4 h-4 text-white/70" />
              <span className="text-white/70 text-xs font-medium">Config</span>
            </Link>
            <button 
              onClick={handleSignOut}
              className="flex-1 bg-red-500/20 hover:bg-red-500/30 rounded-xl p-3 flex items-center justify-center space-x-2 transition-all duration-300 hover:scale-105 border border-red-500/20"
            >
              <LogOut className="w-4 h-4 text-red-300" />
              <span className="text-red-300 text-xs font-medium">Sair</span>
            </button>
          </div>
        </div>

        {/* Footer Info */}
        <div className="text-center">
          <p className="text-white/30 text-xs">
            © 2024 FinWise
          </p>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
